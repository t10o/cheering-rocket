package com.cheering.rocket;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;

import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "RunnerLocation")
public class RunnerLocationPlugin extends Plugin {
    private static final String PREFS_NAME = "runnerLocation";
    private static final String PREF_RUN_ID = "currentRunId";
    private static final String PREF_ID_TOKEN = "idToken";
    private static final String PREF_REFRESH_TOKEN = "refreshToken";
    private static final String PREF_ID_TOKEN_EXPIRY = "idTokenExpiry";
    private static final String PREF_PROJECT_ID = "projectId";
    private static final String PREF_API_KEY = "apiKey";
    private static final String PREF_MIN_DISTANCE = "minimumDistance";
    private static RunnerLocationPlugin instance;

    @Override
    public void load() {
        super.load();
        instance = this;
    }

    @PluginMethod
    public void start(PluginCall call) {
        String runId = call.getString("runId");
        if (runId == null || runId.trim().isEmpty()) {
            call.reject("runId is required");
            return;
        }

        String notificationTitle = call.getString("notificationTitle", "CheeringRocket");
        String notificationBody = call.getString("notificationBody", "ランの位置情報を記録中");
        float minimumDistance = call.getFloat("minimumDistanceMeters", 10f);
        String idToken = call.getString("idToken");
        Double expiry = call.getDouble("idTokenExpiry");
        String refreshToken = call.getString("refreshToken");
        String projectId = call.getString("projectId");
        String apiKey = call.getString("apiKey");

        if (idToken == null || idToken.trim().isEmpty()) {
            call.reject("idToken is required");
            return;
        }

        if (projectId == null || projectId.trim().isEmpty()) {
            call.reject("projectId is required");
            return;
        }

        if (apiKey == null || apiKey.trim().isEmpty()) {
            call.reject("apiKey is required");
            return;
        }

        if (!hasLocationPermissions()) {
            call.reject("Location permissions are not granted");
            return;
        }

        Context context = getContext();
        if (context == null) {
            call.reject("Context is not available");
            return;
        }

        SharedPreferences preferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        preferences.edit()
            .putString(PREF_RUN_ID, runId)
            .putString(PREF_ID_TOKEN, idToken)
            .putString(PREF_REFRESH_TOKEN, refreshToken)
            .putLong(PREF_ID_TOKEN_EXPIRY, expiry != null ? expiry.longValue() : 0L)
            .putString(PREF_PROJECT_ID, projectId)
            .putString(PREF_API_KEY, apiKey)
            .putFloat(PREF_MIN_DISTANCE, minimumDistance)
            .apply();

        Intent intent = new Intent(context, RunnerLocationService.class);
        intent.putExtra(RunnerLocationService.EXTRA_RUN_ID, runId);
        intent.putExtra(RunnerLocationService.EXTRA_NOTIFICATION_TITLE, notificationTitle);
        intent.putExtra(RunnerLocationService.EXTRA_NOTIFICATION_BODY, notificationBody);
        intent.putExtra(RunnerLocationService.EXTRA_MIN_DISTANCE, minimumDistance);
        intent.putExtra(RunnerLocationService.EXTRA_ID_TOKEN, idToken);
        intent.putExtra(RunnerLocationService.EXTRA_REFRESH_TOKEN, refreshToken);
        intent.putExtra(RunnerLocationService.EXTRA_TOKEN_EXPIRY, expiry != null ? expiry.longValue() : 0L);
        intent.putExtra(RunnerLocationService.EXTRA_PROJECT_ID, projectId);
        intent.putExtra(RunnerLocationService.EXTRA_API_KEY, apiKey);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            ContextCompat.startForegroundService(context, intent);
        } else {
            context.startService(intent);
        }

        JSObject result = new JSObject();
        result.put("started", true);
        call.resolve(result);
    }

    @PluginMethod
    public void stop(PluginCall call) {
        Context context = getContext();
        if (context != null) {
            Intent intent = new Intent(context, RunnerLocationService.class);
            context.stopService(intent);
            SharedPreferences preferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            preferences.edit()
                .remove(PREF_RUN_ID)
                .remove(RunnerLocationService.PREF_LAST_LAT)
                .remove(RunnerLocationService.PREF_LAST_LNG)
                .remove(PREF_ID_TOKEN)
                .remove(PREF_REFRESH_TOKEN)
                .remove(PREF_ID_TOKEN_EXPIRY)
                .remove(PREF_PROJECT_ID)
                .remove(PREF_API_KEY)
                .remove(PREF_MIN_DISTANCE)
                .apply();
        }

        call.resolve();
    }

    static void dispatchLocationUpdate(JSObject payload) {
        if (instance != null) {
            instance.notifyListeners("locationUpdate", payload);
        }
    }

    static void dispatchStatus(boolean isTracking) {
        if (instance != null) {
            JSObject status = new JSObject();
            status.put("isTracking", isTracking);
            status.put("hasBackgroundPermission", instance.hasLocationPermissions());
            instance.notifyListeners("status", status);
        }
    }

    @PluginMethod
    public void getStatus(PluginCall call) {
        Context context = getContext();
        JSObject result = new JSObject();
        if (context == null) {
            result.put("isTracking", false);
            result.put("hasBackgroundPermission", hasLocationPermissions());
            call.resolve(result);
            return;
        }

        SharedPreferences preferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        boolean isTracking = preferences.contains(PREF_RUN_ID) && RunnerLocationService.isServiceRunning(context);
        result.put("isTracking", isTracking);
        result.put("hasBackgroundPermission", hasLocationPermissions());
        call.resolve(result);
    }

    private boolean hasLocationPermissions() {
        Context context = getContext();
        if (context == null) {
            return false;
        }

        boolean fine = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
        boolean backgroundGranted = true;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            backgroundGranted = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_BACKGROUND_LOCATION) == PackageManager.PERMISSION_GRANTED;
        }

        return fine && backgroundGranted;
    }
}
