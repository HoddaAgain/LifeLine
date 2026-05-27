package com.example.app;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "WidgetBridge")
public class WidgetBridgePlugin extends Plugin {
    @PluginMethod
    public void updateWidgetState(PluginCall call) {
        String token = call.getString("token");
        String baseUrl = call.getString("baseUrl");
        Boolean checkedInValue = call.getBoolean("hasCheckedIn");
        Integer streakValue = call.getInt("survivalStreak");
        Integer missionCompletedValue = call.getInt("missionCompletedCount");
        Integer missionTotalValue = call.getInt("missionTotalCount");
        String lastUpdated = call.getString("lastUpdated");

        LifelineWidgetProvider.saveState(
                getContext(),
                token,
                baseUrl,
                checkedInValue != null && checkedInValue,
                streakValue == null ? 0 : streakValue,
                missionCompletedValue == null ? 0 : missionCompletedValue,
                missionTotalValue == null ? 0 : missionTotalValue,
                lastUpdated
        );
        LifelineWidgetProvider.updateAllWidgets(getContext());
        call.resolve();
    }
}
