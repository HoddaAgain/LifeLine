package com.hotta.lifeline.api.init.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class InitDto {

    @Getter
    @Builder
    public static class InitResponse {
        private String userId;                      // 사용자 로그인 ID
        private String name;                        // 사용자 이름
        private String mode;                        // 모드 (EASY / NORMAL)
        private String emergencyContact;            // 비상 연락처
        private LocalDate birthDate;                // 생년월일
        private Integer diaryStreak;                // 연속 일기 작성일
        private LocalDateTime survivalUpdatedAt;    // 마지막 생존 상태 갱신 시간
        private String survivalStatus;              // 생존 상태 (SAFE / WARNING / EMERGENCY)
        private Boolean hasCheckedInToday;          // 오늘 수동 체크인 여부
        private Integer survivalStreak;             // 연속 생존신고 일수
        private Boolean isTutorialCompleted;        // 튜토리얼 완료 여부
        private List<MissionInfo> missions;          // 미션 리스트 (인덱스 + 설명 + 완료여부)
    }

    @Getter
    @Builder
    public static class MissionInfo {
        private Integer index;           // 미션 순서 (0, 1, 2)
        private String description;      // 미션 설명
        private Boolean isCleared;       // 완료 여부
    }
}