package com.hotta.lifeline.domain.mission;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum MissionType {

    WRITE_DIARY("오늘의 일기 1회 작성하기"),
    MANUAL_CHECK_IN("수동 생존신고 1회 하기"),
    VIEW_DIARY_HISTORY("지난 일기 1건 다시 읽기"),
    UPDATE_EMERGENCY_CONTACT("비상 연락처 최신 상태 확인하기"),
    DRINK_WATER("물 한 잔 마시고 인증하기"),
    TAKE_A_WALK("10분 이상 산책하기"),
    STRETCH("스트레칭 5분 하기"),
    DEEP_BREATHING("심호흡 3회 하기"),
    GRATITUDE_NOTE("감사한 일 1가지 적기"),
    EARLY_SLEEP("자정 전에 취침 준비하기");

    private final String description;
}
