package com.cheering.rocket;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.location.Location;
import android.os.Build;
import android.os.IBinder;
import android.os.Looper;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.Priority;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
public class RunnerLocationService extends Service {
    public static final String EXTRA_RUN_ID = "runId";
    public static final String EXTRA_NOTIFICATION_TITLE = "notificationTitle";
    public static final String EXTRA_NOTIFICATION_BODY = "notificationBody";
    public static final String EXTRA_MIN_DISTANCE = "minimumDistance";
    public static final String EXTRA_ID_TOKEN = "idToken";
    public static final String EXTRA_REFRESH_TOKEN = "refreshToken";
    public static final String EXTRA_TOKEN_EXPIRY = "idTokenExpiry";
    public static final String EXTRA_PROJECT_ID = "projectId";
    public static final String EXTRA_API_KEY = "apiKey";
    public static final String PREF_RUN_ID = "currentRunId";
    public static final String PREF_LAST_LAT = "lastLat";
    public static final String PREF_LAST_LNG = "lastLng";
    private static final String PREFS_NAME = "runnerLocation";
    private static final String PREF_ID_TOKEN = "idToken";
    private static final String PREF_REFRESH_TOKEN = "refreshToken";
    private static final String PREF_ID_TOKEN_EXPIRY = "idTokenExpiry";
    private static final String PREF_PROJECT_ID = "projectId";
    private static final String PREF_API_KEY = "apiKey";
    private static final String PREF_MIN_DISTANCE = "minimumDistance";
    private static final String CHANNEL_ID = "runner_location_channel";
    private static final String TAG = "RunnerLocationSvc";
    private boolean debug;

    private FusedLocationProviderClient fusedLocationProviderClient;
    private LocationCallback locationCallback;
    private float minimumDistanceMeters = 10f;
    private String runId;
    private CredentialStore credentialStore;
    private ScheduledExecutorService executor;
    private ConcurrentLinkedQueue<LocationPayload> pendingLocations;
    private final AtomicBoolean processing = new AtomicBoolean(false);
    private ScheduledFuture<?> pendingRetry;

    @Override
    public void onCreate() {
        super.onCreate();
        debug = (getApplicationInfo().flags & android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0;
        fusedLocationProviderClient = LocationServices.getFusedLocationProviderClient(this);
        credentialStore = new CredentialStore(this, debug);
        executor = Executors.newSingleThreadScheduledExecutor();
        pendingLocations = new ConcurrentLinkedQueue<>();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        SharedPreferences preferences = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);

        if (intent != null) {
            credentialStore.updateFromIntent(intent);
        }

        if (intent != null && intent.hasExtra(EXTRA_RUN_ID)) {
            runId = intent.getStringExtra(EXTRA_RUN_ID);
        } else if (runId == null) {
            runId = preferences.getString(PREF_RUN_ID, null);
        }

        if (runId == null || runId.trim().isEmpty()) {
            if (debug) {
                Log.w(TAG, "startCommand: runId missing, stopping service");
            }
            stopSelf();
            return START_NOT_STICKY;
        }

        if (intent != null && intent.hasExtra(EXTRA_MIN_DISTANCE)) {
            minimumDistanceMeters = intent.getFloatExtra(EXTRA_MIN_DISTANCE, 10f);
            preferences.edit().putFloat(PREF_MIN_DISTANCE, minimumDistanceMeters).apply();
        } else {
            minimumDistanceMeters = preferences.getFloat(PREF_MIN_DISTANCE, minimumDistanceMeters);
        }

        String title = intent != null ? intent.getStringExtra(EXTRA_NOTIFICATION_TITLE) : null;
        String body = intent != null ? intent.getStringExtra(EXTRA_NOTIFICATION_BODY) : null;

        startForegroundNotification(title, body);
        startLocationUpdates();
        if (debug) {
            Log.d(TAG, "startCommand: service started for runId=" + runId +
                ", minDistance=" + minimumDistanceMeters);
        }
        RunnerLocationPlugin.dispatchStatus(true);
        triggerProcessing();
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        stopLocationUpdates();
        if (pendingRetry != null) {
            pendingRetry.cancel(true);
            pendingRetry = null;
        }
        if (executor != null) {
            executor.shutdownNow();
        }
        if (debug) {
            Log.d(TAG, "onDestroy: service stopped for runId=" + runId);
        }
        RunnerLocationPlugin.dispatchStatus(false);
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void startForegroundNotification(String title, String body) {
        NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Runner Location",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("ラン中の位置情報を記録します");
            manager.createNotificationChannel(channel);
        }

        Intent intent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(title != null ? title : "CheeringRocket")
            .setContentText(body != null ? body : "ランの位置情報を記録中")
            .setSmallIcon(getApplicationInfo().icon)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build();

        startForeground(1001, notification);
    }

    private void startLocationUpdates() {
        if (!hasRequiredPermissions()) {
            if (debug) {
                Log.w(TAG, "startLocationUpdates: missing location permission, stopping service");
            }
            stopSelf();
            RunnerLocationPlugin.dispatchStatus(false);
            return;
        }

        LocationRequest locationRequest =
            new LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 5000)
                .setMinUpdateDistanceMeters(minimumDistanceMeters)
                .setMinUpdateIntervalMillis(5000)
                .build();

        locationCallback = new LocationCallback() {
            @Override
            public void onLocationResult(LocationResult locationResult) {
                if (locationResult == null) {
                    return;
                }
                for (Location location : locationResult.getLocations()) {
                    handleLocation(location);
                }
            }
        };

        try {
            fusedLocationProviderClient.requestLocationUpdates(
                locationRequest,
                locationCallback,
                Looper.getMainLooper()
            );
            if (debug) {
                Log.d(TAG, "startLocationUpdates: request issued");
            }
        } catch (SecurityException permissionError) {
            Log.e(TAG, "startLocationUpdates: permissions revoked", permissionError);
            stopSelf();
            RunnerLocationPlugin.dispatchStatus(false);
        }
    }

    private void stopLocationUpdates() {
        if (locationCallback != null) {
            fusedLocationProviderClient.removeLocationUpdates(locationCallback);
            if (debug) {
                Log.d(TAG, "stopLocationUpdates: updates removed");
            }
        }
    }

    private void handleLocation(Location location) {
        if (runId == null) {
            if (debug) {
                Log.w(TAG, "handleLocation: runId null, ignoring update");
            }
            return;
        }

        if (!location.hasAccuracy() || location.getAccuracy() <= 0f) {
            if (debug) {
                Log.d(TAG, "handleLocation: invalid accuracy=" + location.getAccuracy());
            }
            return;
        }

        SharedPreferences preferences = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        double lastLat = Double.longBitsToDouble(preferences.getLong(PREF_LAST_LAT, Double.doubleToLongBits(Double.NaN)));
        double lastLng = Double.longBitsToDouble(preferences.getLong(PREF_LAST_LNG, Double.doubleToLongBits(Double.NaN)));

        if (!Double.isNaN(lastLat) && !Double.isNaN(lastLng)) {
            float[] results = new float[1];
            Location.distanceBetween(
                lastLat,
                lastLng,
                location.getLatitude(),
                location.getLongitude(),
                results
            );
            if (results[0] < minimumDistanceMeters) {
                if (debug) {
                    Log.d(TAG, "handleLocation: movement " + results[0] + "m (<" + minimumDistanceMeters + "m) skipping");
                }
                return;
            }
        }

        preferences.edit()
            .putLong(PREF_LAST_LAT, Double.doubleToLongBits(location.getLatitude()))
            .putLong(PREF_LAST_LNG, Double.doubleToLongBits(location.getLongitude()))
            .apply();

        if (debug) {
            Log.d(TAG, "handleLocation: recording lat=" + location.getLatitude() +
                ", lng=" + location.getLongitude() +
                ", accuracy=" + location.getAccuracy());
        }

        enqueueLocation(location);

        JSObject payload = new JSObject();
        payload.put("latitude", location.getLatitude());
        payload.put("longitude", location.getLongitude());
        payload.put("accuracy", location.getAccuracy());
        payload.put("clientTimestamp", location.getTime());
        payload.put("runId", runId);

        if (location.hasAltitude()) {
            payload.put("altitude", location.getAltitude());
        }
        if (location.hasSpeed()) {
            payload.put("speed", location.getSpeed());
        }
        if (location.hasBearing()) {
            payload.put("heading", location.getBearing());
        }

        RunnerLocationPlugin.dispatchLocationUpdate(payload);
    }

    public static boolean isServiceRunning(Context context) {
        return RunnerLocationServiceHelper.isServiceRunning(context, RunnerLocationService.class);
    }

    private void enqueueLocation(Location location) {
        if (runId == null) {
            return;
        }
        LocationPayload payload = LocationPayload.from(runId, location);
        pendingLocations.add(payload);
        triggerProcessing();
    }

    private void triggerProcessing() {
        if (executor == null) {
            return;
        }
        if (processing.compareAndSet(false, true)) {
            executor.execute(this::drainQueue);
        }
    }

    private void drainQueue() {
        try {
            while (true) {
                LocationPayload payload = pendingLocations.peek();
                if (payload == null) {
                    cancelScheduledRetry();
                    return;
                }

                UploadResult result = uploadPayload(payload);
                if (result == UploadResult.SUCCESS) {
                    pendingLocations.poll();
                    continue;
                }

                if (result == UploadResult.FATAL) {
                    pendingLocations.poll();
                    continue;
                }

                scheduleRetry();
                return;
            }
        } finally {
            processing.set(false);
        }
    }

    private void scheduleRetry() {
        if (executor == null) {
            return;
        }
        if (pendingRetry != null && !pendingRetry.isDone()) {
            return;
        }
        pendingRetry = executor.schedule(this::triggerProcessing, 30, TimeUnit.SECONDS);
    }

    private void cancelScheduledRetry() {
        if (pendingRetry != null) {
            pendingRetry.cancel(false);
            pendingRetry = null;
        }
    }

    private UploadResult uploadPayload(LocationPayload payload) {
        String projectId = credentialStore.getProjectId();
        if (projectId == null || projectId.isEmpty()) {
            if (debug) {
                Log.e(TAG, "uploadPayload: projectId missing, dropping location");
            }
            return UploadResult.FATAL;
        }

        String token = credentialStore.getValidIdToken();
        if (token == null || token.isEmpty()) {
            if (debug) {
                Log.w(TAG, "uploadPayload: no valid Firebase ID token, will retry later");
            }
            return UploadResult.RETRY;
        }

        UploadOutcome outcome = sendPayloadRequest(payload, token, projectId);
        if (outcome.success) {
            return UploadResult.SUCCESS;
        }

        if (outcome.unauthorized) {
            credentialStore.invalidate();
            String refreshedToken = credentialStore.getValidIdToken();
            if (refreshedToken != null && !refreshedToken.isEmpty() && !refreshedToken.equals(token)) {
                outcome = sendPayloadRequest(payload, refreshedToken, projectId);
                if (outcome.success) {
                    return UploadResult.SUCCESS;
                }
            }
        }

        return outcome.fatal ? UploadResult.FATAL : UploadResult.RETRY;
    }

    private UploadOutcome sendPayloadRequest(LocationPayload payload, String idToken, String projectId) {
        HttpURLConnection connection = null;
        try {
            URL url = new URL("https://firestore.googleapis.com/v1/projects/" + projectId + "/databases/(default)/documents/locationPoints");
            connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("POST");
            connection.setDoOutput(true);
            connection.setConnectTimeout(10000);
            connection.setReadTimeout(15000);
            connection.setRequestProperty("Authorization", "Bearer " + idToken);
            connection.setRequestProperty("Content-Type", "application/json; charset=UTF-8");

            byte[] body = payload.toJsonBytes();
            try (OutputStream os = connection.getOutputStream()) {
                os.write(body);
            }

            int statusCode = connection.getResponseCode();
            if (statusCode >= 200 && statusCode < 300) {
                return UploadOutcome.success();
            }

            String responseBody = readStream(statusCode >= 400 ? connection.getErrorStream() : connection.getInputStream());
            if (debug) {
                Log.w(TAG, "Firestore response code=" + statusCode + ", body=" + responseBody);
            }

            if (statusCode == 401 || statusCode == 403) {
                return UploadOutcome.unauthorized();
            }

            boolean fatal = statusCode >= 400 && statusCode < 500;
            return UploadOutcome.failure(fatal);
        } catch (IOException | JSONException error) {
            if (debug) {
                Log.e(TAG, "sendPayloadRequest: error", error);
            }
            return UploadOutcome.failure(false);
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }

    private static String readStream(InputStream stream) throws IOException {
        if (stream == null) {
            return "";
        }
        StringBuilder builder = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                builder.append(line);
            }
        }
        return builder.toString();
    }

    private enum UploadResult {
        SUCCESS,
        RETRY,
        FATAL
    }

    private static class UploadOutcome {
        final boolean success;
        final boolean unauthorized;
        final boolean fatal;

        private UploadOutcome(boolean success, boolean unauthorized, boolean fatal) {
            this.success = success;
            this.unauthorized = unauthorized;
            this.fatal = fatal;
        }

        static UploadOutcome success() {
            return new UploadOutcome(true, false, false);
        }

        static UploadOutcome unauthorized() {
            return new UploadOutcome(false, true, false);
        }

        static UploadOutcome failure(boolean fatal) {
            return new UploadOutcome(false, false, fatal);
        }
    }

    private static class LocationPayload {
        final String runId;
        final double latitude;
        final double longitude;
        final float accuracy;
        final Double altitude;
        final Double speed;
        final Double heading;
        final long clientTimestamp;
        final long recordedAtMillis;

        private LocationPayload(String runId, Location location) {
            this.runId = runId;
            this.latitude = location.getLatitude();
            this.longitude = location.getLongitude();
            this.accuracy = location.getAccuracy();
            this.altitude = location.hasAltitude() ? location.getAltitude() : null;
            this.speed = location.hasSpeed() ? (double) location.getSpeed() : null;
            this.heading = location.hasBearing() ? (double) location.getBearing() : null;
            this.clientTimestamp = location.getTime();
            this.recordedAtMillis = System.currentTimeMillis();
        }

        static LocationPayload from(String runId, Location location) {
            return new LocationPayload(runId, location);
        }

        byte[] toJsonBytes() throws JSONException {
            JSONObject root = new JSONObject();
            JSONObject fields = new JSONObject();

            fields.put("runId", stringField(runId));
            fields.put("latitude", doubleField(latitude));
            fields.put("longitude", doubleField(longitude));
            fields.put("accuracy", doubleField(accuracy));
            fields.put("clientTimestamp", integerField(clientTimestamp));
            fields.put("timestamp", timestampField(clientTimestamp));
            fields.put("recordedAt", timestampField(recordedAtMillis));
            fields.put("platform", stringField("android"));

            if (altitude != null) {
                fields.put("altitude", doubleField(altitude));
            }
            if (speed != null) {
                fields.put("speed", doubleField(speed));
            }
            if (heading != null) {
                fields.put("heading", doubleField(heading));
            }

            root.put("fields", fields);
            return root.toString().getBytes(StandardCharsets.UTF_8);
        }
    }

    private static JSONObject stringField(String value) throws JSONException {
        JSONObject object = new JSONObject();
        object.put("stringValue", value);
        return object;
    }

    private static JSONObject doubleField(double value) throws JSONException {
        JSONObject object = new JSONObject();
        object.put("doubleValue", value);
        return object;
    }

    private static JSONObject integerField(long value) throws JSONException {
        JSONObject object = new JSONObject();
        object.put("integerValue", Long.toString(value));
        return object;
    }

    private static JSONObject timestampField(long millis) throws JSONException {
        JSONObject object = new JSONObject();
        object.put("timestampValue", formatTimestamp(millis));
        return object;
    }

    private static String formatTimestamp(long millis) {
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
        formatter.setTimeZone(TimeZone.getTimeZone("UTC"));
        return formatter.format(new Date(millis));
    }

    private static class TokenResponse {
        final String idToken;
        final String refreshToken;
        final long expiresInSeconds;

        TokenResponse(String idToken, String refreshToken, long expiresInSeconds) {
            this.idToken = idToken;
            this.refreshToken = refreshToken;
            this.expiresInSeconds = expiresInSeconds;
        }
    }

    private class CredentialStore {
        private final SharedPreferences preferences;
        private final boolean debugLogging;
        private String idToken;
        private String refreshToken;
        private long expiryMillis;
        private String projectId;
        private String apiKey;

        CredentialStore(Context context, boolean debugLogging) {
            this.preferences = context.getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
            this.debugLogging = debugLogging;
            loadFromPreferences();
        }

        private void loadFromPreferences() {
            idToken = preferences.getString(PREF_ID_TOKEN, null);
            refreshToken = preferences.getString(PREF_REFRESH_TOKEN, null);
            expiryMillis = preferences.getLong(PREF_ID_TOKEN_EXPIRY, 0L);
            projectId = preferences.getString(PREF_PROJECT_ID, null);
            apiKey = preferences.getString(PREF_API_KEY, null);
        }

        synchronized void updateFromIntent(@Nullable Intent intent) {
            if (intent == null) {
                return;
            }
            boolean changed = false;

            if (intent.hasExtra(EXTRA_ID_TOKEN)) {
                String token = intent.getStringExtra(EXTRA_ID_TOKEN);
                if (token != null && !token.isEmpty()) {
                    idToken = token;
                    changed = true;
                }
            }

            if (intent.hasExtra(EXTRA_REFRESH_TOKEN)) {
                refreshToken = intent.getStringExtra(EXTRA_REFRESH_TOKEN);
                changed = true;
            }

            if (intent.hasExtra(EXTRA_TOKEN_EXPIRY)) {
                long expiry = intent.getLongExtra(EXTRA_TOKEN_EXPIRY, 0L);
                if (expiry > 0L) {
                    expiryMillis = expiry;
                    changed = true;
                }
            }

            if (intent.hasExtra(EXTRA_PROJECT_ID)) {
                String project = intent.getStringExtra(EXTRA_PROJECT_ID);
                if (project != null && !project.isEmpty()) {
                    projectId = project;
                    changed = true;
                }
            }

            if (intent.hasExtra(EXTRA_API_KEY)) {
                String key = intent.getStringExtra(EXTRA_API_KEY);
                if (key != null && !key.isEmpty()) {
                    apiKey = key;
                    changed = true;
                }
            }

            if (changed) {
                persist();
            }
        }

        synchronized String getProjectId() {
            return projectId;
        }

        synchronized String getValidIdToken() {
            long now = System.currentTimeMillis();
            if (idToken != null && !idToken.isEmpty()) {
                if (expiryMillis == 0L || now < expiryMillis - 60000) {
                    return idToken;
                }
            }
            return refreshIdTokenLocked(now);
        }

        synchronized void invalidate() {
            expiryMillis = 0L;
        }

        private void persist() {
            SharedPreferences.Editor editor = preferences.edit();
            editor.putString(PREF_ID_TOKEN, idToken);
            editor.putString(PREF_REFRESH_TOKEN, refreshToken);
            editor.putLong(PREF_ID_TOKEN_EXPIRY, expiryMillis);
            editor.putString(PREF_PROJECT_ID, projectId);
            editor.putString(PREF_API_KEY, apiKey);
            editor.apply();
        }

        private String refreshIdTokenLocked(long now) {
            if (refreshToken == null || refreshToken.isEmpty()) {
                if (idToken != null && !idToken.isEmpty() && (expiryMillis == 0L || now < expiryMillis - 60000)) {
                    return idToken;
                }
                return null;
            }

            if (apiKey == null || apiKey.isEmpty()) {
                return idToken;
            }

            try {
                TokenResponse response = requestTokenRefresh(refreshToken, apiKey);
                if (response == null || response.idToken == null || response.idToken.isEmpty()) {
                    return null;
                }

                idToken = response.idToken;
                if (response.refreshToken != null && !response.refreshToken.isEmpty()) {
                    refreshToken = response.refreshToken;
                }

                long expiresInSeconds = response.expiresInSeconds > 0 ? response.expiresInSeconds : 3600L;
                expiryMillis = now + Math.max((expiresInSeconds - 60) * 1000L, 5 * 60 * 1000L);
                persist();
                return idToken;
            } catch (IOException | JSONException error) {
                if (debugLogging) {
                    Log.e(TAG, "refreshIdTokenLocked: failed", error);
                }
                return null;
            }
        }

        private TokenResponse requestTokenRefresh(String currentRefreshToken, String apiKey) throws IOException, JSONException {
            String endpoint = "https://securetoken.googleapis.com/v1/token?key=" + apiKey;
            URL url = new URL(endpoint);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            try {
                connection.setRequestMethod("POST");
                connection.setDoOutput(true);
                connection.setConnectTimeout(10000);
                connection.setReadTimeout(15000);
                connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");

                String body = "grant_type=refresh_token&refresh_token=" + URLEncoder.encode(currentRefreshToken, "UTF-8");
                try (OutputStream os = connection.getOutputStream()) {
                    os.write(body.getBytes(StandardCharsets.UTF_8));
                }

                int statusCode = connection.getResponseCode();
                String responseBody = readStream(statusCode >= 400 ? connection.getErrorStream() : connection.getInputStream());

                if (statusCode >= 200 && statusCode < 300) {
                    JSONObject json = new JSONObject(responseBody);
                    String newIdToken = json.optString("id_token", null);
                    String newRefreshToken = json.optString("refresh_token", currentRefreshToken);
                    long expiresInSeconds = json.optLong("expires_in", 3600L);
                    return new TokenResponse(newIdToken, newRefreshToken, expiresInSeconds);
                } else {
                    if (debugLogging) {
                        Log.e(TAG, "requestTokenRefresh: response code=" + statusCode + ", body=" + responseBody);
                    }
                    return null;
                }
            } finally {
                connection.disconnect();
            }
        }
    }

    private boolean hasRequiredPermissions() {
        boolean fineGranted = ContextCompat.checkSelfPermission(
            this,
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED;

        if (!fineGranted) {
            return false;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            return ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_BACKGROUND_LOCATION
            ) == PackageManager.PERMISSION_GRANTED;
        }

        return true;
    }
}
