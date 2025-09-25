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
        preferences.edit().putString(PREF_RUN_ID, runId).apply();

        Intent intent = new Intent(context, RunnerLocationService.class);
        intent.putExtra(RunnerLocationService.EXTRA_RUN_ID, runId);
        intent.putExtra(RunnerLocationService.EXTRA_NOTIFICATION_TITLE, notificationTitle);
        intent.putExtra(RunnerLocationService.EXTRA_NOTIFICATION_BODY, notificationBody);
        intent.putExtra(RunnerLocationService.EXTRA_MIN_DISTANCE, minimumDistance);

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
                .apply();
        }

        call.resolve();
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
