package com.hotta.lifeline.api.survival.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class SurvivalDto {

    @Getter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CheckInResponse {
        private LocalDateTime lastManualCheckIn;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SurvivalStreakResponse {
        private Integer survivalStreak;
    }
}