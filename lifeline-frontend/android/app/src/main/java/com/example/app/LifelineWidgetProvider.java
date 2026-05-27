package com.example.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

import java.net.HttpURLConnection;
import java.net.URL;

public class LifelineWidgetProvider extends AppWidgetProvider {
    private static final String PREFS_NAME = "lifeline_widget";
    private static final String KEY_TOKEN = "token";
    private static final String KEY_BASE_URL = "base_url";
    private static final String KEY_HAS_CHECKED_IN = "has_checked_in";
    private static final String KEY_STREAK = "streak";
    private static final String KEY_MISSION_COMPLETED = "mission_completed";
    private static final String KEY_MISSION_TOTAL = "mission_total";
    private static final String KEY_LAST_UPDATED = "last_updated";
    private static final String ACTION_CHECK_IN = "com.example.app.ACTION_CHECK_IN";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (intent != null && ACTION_CHECK_IN.equals(intent.getAction())) {
            performCheckIn(context.getApplicationContext());
        }
    }

    public static void saveState(Context context, String token, String baseUrl, boolean hasCheckedIn, int streak, int missionCompleted, int missionTotal, String lastUpdated) {
        SharedPreferences.Editor editor = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit()
                .putString(KEY_BASE_URL, baseUrl == null ? "" : baseUrl)
                .putBoolean(KEY_HAS_CHECKED_IN, hasCheckedIn)
                .putInt(KEY_STREAK, Math.max(streak, 0))
                .putInt(KEY_MISSION_COMPLETED, Math.max(missionCompleted, 0))
                .putInt(KEY_MISSION_TOTAL, Math.max(missionTotal, 0))
                .putString(KEY_LAST_UPDATED, lastUpdated == null ? "" : lastUpdated);

        if (token == null || token.isEmpty()) {
            editor.remove(KEY_TOKEN);
        } else {
            editor.putString(KEY_TOKEN, token);
        }

        editor.apply();
    }

    public static void updateAllWidgets(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName componentName = new ComponentName(context, LifelineWidgetProvider.class);
        int[] appWidgetIds = manager.getAppWidgetIds(componentName);
        for (int appWidgetId : appWidgetIds) {
            updateWidget(context, manager, appWidgetId);
        }
    }

    private static void performCheckIn(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String token = prefs.getString(KEY_TOKEN, "");
        String baseUrl = prefs.getString(KEY_BASE_URL, "");
        boolean wasCheckedIn = prefs.getBoolean(KEY_HAS_CHECKED_IN, false);

        if (token == null || token.isEmpty() || baseUrl == null || baseUrl.isEmpty()) {
            prefs.edit()
                    .putBoolean(KEY_HAS_CHECKED_IN, false)
                    .putString(KEY_LAST_UPDATED, "Open the app first")
                    .apply();
            updateAllWidgets(context);
            return;
        }

        new Thread(() -> {
            boolean success = false;
            HttpURLConnection connection = null;
            try {
                URL url = new URL(baseUrl + "/api/survival/checkin");
                connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod("POST");
                connection.setConnectTimeout(7000);
                connection.setReadTimeout(7000);
                connection.setRequestProperty("Authorization", "Bearer " + token);
                connection.setRequestProperty("Content-Type", "application/json");

                int statusCode = connection.getResponseCode();
                success = (statusCode >= 200 && statusCode < 300) || statusCode == 400;
            } catch (Exception ignored) {
                success = false;
            } finally {
                if (connection != null) {
                    connection.disconnect();
                }
            }

            if (success) {
                int currentStreak = prefs.getInt(KEY_STREAK, 0);
                int missionCompleted = prefs.getInt(KEY_MISSION_COMPLETED, 0);
                int missionTotal = prefs.getInt(KEY_MISSION_TOTAL, 0);
                prefs.edit()
                        .putBoolean(KEY_HAS_CHECKED_IN, true)
                        .putInt(KEY_STREAK, wasCheckedIn ? currentStreak : currentStreak + 1)
                        .putInt(KEY_MISSION_COMPLETED, wasCheckedIn ? missionCompleted : Math.min(missionCompleted + 1, missionTotal))
                        .putString(KEY_LAST_UPDATED, String.valueOf(System.currentTimeMillis()))
                        .apply();
            }
            updateAllWidgets(context);
        }).start();
    }

    private static void updateWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        boolean hasCheckedIn = prefs.getBoolean(KEY_HAS_CHECKED_IN, false);
        int streak = prefs.getInt(KEY_STREAK, 0);
        int missionCompleted = prefs.getInt(KEY_MISSION_COMPLETED, 0);
        int missionTotal = prefs.getInt(KEY_MISSION_TOTAL, 0);
        String lastUpdated = prefs.getString(KEY_LAST_UPDATED, "");

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.lifeline_widget);
        views.setTextViewText(R.id.widget_status, getStatusText(hasCheckedIn, lastUpdated));
        views.setTextViewText(R.id.widget_streak, streak + "일 연속");
        views.setTextViewText(R.id.widget_mission, missionTotal > 0 ? "미션 " + missionCompleted + "/" + missionTotal : "미션 -");
        views.setTextViewText(R.id.widget_action, hasCheckedIn ? "완료" : "출석");
        views.setInt(
                R.id.widget_action,
                "setBackgroundResource",
                hasCheckedIn ? R.drawable.lifeline_widget_button_done : R.drawable.lifeline_widget_button
        );

        Intent launchIntent = new Intent(context, MainActivity.class);
        launchIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);

        PendingIntent openAppIntent = PendingIntent.getActivity(
                context,
                appWidgetId,
                launchIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        Intent checkInIntent = new Intent(context, LifelineWidgetProvider.class);
        checkInIntent.setAction(ACTION_CHECK_IN);

        PendingIntent checkInPendingIntent = PendingIntent.getBroadcast(
                context,
                appWidgetId,
                checkInIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        views.setOnClickPendingIntent(R.id.widget_root, openAppIntent);
        views.setOnClickPendingIntent(R.id.widget_action, hasCheckedIn ? openAppIntent : checkInPendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    private static String getStatusText(boolean hasCheckedIn, String lastUpdated) {
        if (lastUpdated != null && lastUpdated.equals("Open the app first")) {
            return "앱에서 먼저 로그인해 주세요";
        }
        return hasCheckedIn ? "오늘 출석 완료" : "카나에게 출석해 주세요";
    }
}
