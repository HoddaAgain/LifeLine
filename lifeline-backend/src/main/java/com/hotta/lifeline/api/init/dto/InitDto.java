package com.hotta.lifeline.api.init.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

public class InitDto {

    @Getter
    @Builder
    public static class InitResponse {
        private LocalDateTime survivalUpdatedAt;    // 마지막 생존 상태 갱신 시간
        private Boolean hasCheckedInToday;          // 오늘 수동 체크인 여부
        private Integer survivalStreak;             // 연속 생존신고 일수
        private Boolean isTutorialCompleted;        // 튜토리얼 완료 여부
        private List<Boolean> missionStatuses;      // 미션 n개 (지금은 3개) 완료여부
    }
}