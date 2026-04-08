package com.hotta.lifeline.api.survival.service;

import com.hotta.lifeline.api.survival.dto.SurvivalDto;
import com.hotta.lifeline.domain.survival.Survival;
import com.hotta.lifeline.domain.survival.SurvivalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SurvivalService {

    private final SurvivalRepository survivalRepository;
    // 현재 로그인한 유저의 ID를 가져오는 메서드
    private String getCurrentLoginId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @Transactional
    public SurvivalDto.CheckInResponse checkIn() {
        String loginId = getCurrentLoginId();

        // 1. 유저의 생존 기록 조회
        Survival survival = survivalRepository.findByUser_LoginId(loginId)
                .orElseThrow(() -> new RuntimeException("생존 기록을 찾을 수 없습니다."));

        LocalDateTime now = LocalDateTime.now();
        LocalDate today = now.toLocalDate();
        LocalDate lastCheckInDate = survival.getLastManualCheckIn().toLocalDate();

        // 2. 연속 생존신고(Streak) 로직
        // 어제 눌렀으면 +1, 아니면 초기화
        if (lastCheckInDate.equals(today.minusDays(1))) {
            survival.setSurvivalStreak(survival.getSurvivalStreak() + 1);
        } else if (!lastCheckInDate.equals(today)) {
            survival.setSurvivalStreak(1);
        }

        // 3. 시간 업데이트 및 상태 초기화
        survival.setLastManualCheckIn(now);
        survival.setSurvivalStatus("SAFE"); // 생존을 확인 후 상태를 안전으로 변경

        // 4. 응답 DTO 반환
        return SurvivalDto.CheckInResponse.builder()
                .lastManualCheckIn(survival.getLastManualCheckIn())
                .build();
    }
}