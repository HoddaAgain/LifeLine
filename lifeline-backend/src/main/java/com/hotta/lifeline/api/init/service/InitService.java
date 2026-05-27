package com.hotta.lifeline.api.init.service;

// api/init/service/InitService.java

import com.hotta.lifeline.api.init.dto.InitDto;
import com.hotta.lifeline.domain.survival.Survival;
import com.hotta.lifeline.domain.user.User;
import com.hotta.lifeline.domain.user.UserRepository;
import com.hotta.lifeline.global.exception.CustomException;
import com.hotta.lifeline.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InitService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public InitDto.InitResponse getInitData(String loginId) {
        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Survival survival = user.getSurvival();
        LocalDateTime now = LocalDateTime.now();
        // 오늘 수동 체크인을 이미 했는지 확인
        boolean hasCheckedInToday = survival.getLastManualCheckIn().toLocalDate().equals(now.toLocalDate());

        // 미션 리스트를 MissionInfo DTO로 변환
        List<InitDto.MissionInfo> missions = user.getDailyMissions().stream()
                .map(mission -> InitDto.MissionInfo.builder()
                        .index(mission.getMissionIndex())
                        .description(mission.getMissionType().getDescription())
                        .isCleared(mission.getIsCleared())
                        .build())
                .collect(Collectors.toList());

        return InitDto.InitResponse.builder()
                .userId(user.getLoginId())
                .name(user.getName())
                .mode(user.getMode())
                .emergencyContact(user.getEmergencyContact())
                .birthDate(user.getBirthDate())
                .diaryStreak(user.getDiaryStreak())
                .survivalUpdatedAt(survival.getUpdatedAt())
                .survivalStatus(survival.getSurvivalStatus())
                .hasCheckedInToday(hasCheckedInToday)
                .survivalStreak(survival.getSurvivalStreak())
                .isTutorialCompleted(user.getIsTutorialCompleted())
                .missions(missions)
                .build();
    }
}