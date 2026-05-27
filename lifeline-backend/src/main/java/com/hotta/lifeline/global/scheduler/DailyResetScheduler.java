package com.hotta.lifeline.global.scheduler;

import com.hotta.lifeline.domain.mission.DailyMission;
import com.hotta.lifeline.domain.mission.MissionType;
import com.hotta.lifeline.domain.user.User;
import com.hotta.lifeline.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DailyResetScheduler {

    private final UserRepository userRepository;

    // 매일 밤 00시 00분 00초 (한국 시간 기준)에 실행
    @Scheduled(cron = "0 0 0 * * *", zone = "Asia/Seoul")
    @Transactional
    public void resetDailyData() {
        // Fetch Join으로 N+1 방지
        List<User> users = userRepository.findAllWithDailyMissions();

        for (User user : users) {
            // 10개 MissionType 중 3개를 중복 없이 랜덤 선택
            List<MissionType> pool = Arrays.asList(MissionType.values());
            Collections.shuffle(pool);
            List<MissionType> selected = pool.subList(0, 3);

            List<DailyMission> missions = user.getDailyMissions();

            if (missions.size() == 3) {
                // 기존 미션이 3개면 타입만 갱신
                for (int i = 0; i < 3; i++) {
                    missions.get(i).updateMission(selected.get(i));
                }
            } else {
                // 기존 미션이 없거나 개수가 다른 경우: 삭제 후 새로 생성
                missions.clear();
                for (int i = 0; i < 3; i++) {
                    DailyMission newMission = DailyMission.builder()
                            .user(user)
                            .missionIndex(i)
                            .missionType(selected.get(i))
                            .build();
                    missions.add(newMission);
                }
            }
        }

        log.info("[Scheduler] 자정 미션 초기화 완료 - 대상 유저 {}명", users.size());
    }
}