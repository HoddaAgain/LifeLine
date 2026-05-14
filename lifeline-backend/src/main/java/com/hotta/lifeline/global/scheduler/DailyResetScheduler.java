package com.hotta.lifeline.global.scheduler;

import com.hotta.lifeline.domain.mission.DailyMissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class DailyResetScheduler {

    private final DailyMissionRepository dailyMissionRepository;

    // 매일 밤 00시 00분 00초 (한국 시간 기준)에 실행
    @Scheduled(cron = "0 0 0 * * *", zone = "Asia/Seoul")
    @Transactional
    public void resetDailyData() {
        dailyMissionRepository.resetAllMissions();
        System.out.println("✨ [Scheduler] 자정 미션 초기화 완료 ✨");
    }
}