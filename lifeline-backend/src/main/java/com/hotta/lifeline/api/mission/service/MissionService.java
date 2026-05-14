package com.hotta.lifeline.api.mission.service;

import com.hotta.lifeline.domain.mission.DailyMission;
import com.hotta.lifeline.domain.user.User;
import com.hotta.lifeline.domain.user.UserRepository;
import com.hotta.lifeline.global.exception.CustomException;
import com.hotta.lifeline.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MissionService {

    private final UserRepository userRepository;

    @Transactional
    public void completeMission(String loginId, int index) {
        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // 유저의 미션 리스트 중, 프론트가 보낸 index와 일치하는 미션을 찾음
        DailyMission targetMission = user.getDailyMissions().stream()
                .filter(mission -> mission.getMissionIndex() == index)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("해당 인덱스의 미션을 찾을 수 없습니다.")); // 필요시 CustomException 처리

        // 엔티티의 메서드를 호출하여 상태를 true로 변경
        targetMission.clearMission();
    }
}