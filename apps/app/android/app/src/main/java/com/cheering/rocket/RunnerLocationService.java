package com.cheering.rocket;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.location.Location;
import android.os.Build;
import android.os.IBinder;
import android.os.Looper;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import com.getcapacitor.JSObject;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.Priority;


public class RunnerLocationService extends Service {
    public static final String EXTRA_RUN_ID = "runId";
    public static final String EXTRA_NOTIFICATION_TITLE = "notificationTitle";
    public static final String EXTRA_NOTIFICATION_BODY = "notificationBody";
    public static final String EXTRA_MIN_DISTANCE = "minimumDistance";
    public static final String PREF_LAST_LAT = "lastLat";
    public static final String PREF_LAST_LNG = "lastLng";
    private static final String PREFS_NAME = "runnerLocation";
    private static final String CHANNEL_ID = "runner_location_channel";

    private FusedLocationProviderClient fusedLocationProviderClient;
    private LocationCallback locationCallback;
    private float minimumDistanceMeters = 10f;
    private String runId;

    @Override
    public void onCreate() {
        super.onCreate();
        fusedLocationProviderClient = LocationServices.getFusedLocationProviderClient(this);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        runId = intent.getStringExtra(EXTRA_RUN_ID);
        if (runId == null || runId.trim().isEmpty()) {
            stopSelf();
            return START_NOT_STICKY;
        }

        minimumDistanceMeters = intent.getFloatExtra(EXTRA_MIN_DISTANCE, 10f);
        String title = intent.getStringExtra(EXTRA_NOTIFICATION_TITLE);
        String body = intent.getStringExtra(EXTRA_NOTIFICATION_BODY);

        startForegroundNotification(title, body);
        startLocationUpdates();
        RunnerLocationPlugin.dispatchStatus(true);
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        stopLocationUpdates();
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

        fusedLocationProviderClient.requestLocationUpdates(
            locationRequest,
            locationCallback,
            Looper.getMainLooper()
        );
    }

    private void stopLocationUpdates() {
        if (locationCallback != null) {
            fusedLocationProviderClient.removeLocationUpdates(locationCallback);
        }
    }

    private void handleLocation(Location location) {
        if (runId == null) {
            return;
        }

        if (!location.hasAccuracy() || location.getAccuracy() <= 0f) {
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
                return;
            }
        }

        preferences.edit()
            .putLong(PREF_LAST_LAT, Double.doubleToLongBits(location.getLatitude()))
            .putLong(PREF_LAST_LNG, Double.doubleToLongBits(location.getLongitude()))
            .apply();

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
}
