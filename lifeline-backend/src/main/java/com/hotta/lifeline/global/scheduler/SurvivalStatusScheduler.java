package com.hotta.lifeline.global.scheduler;

import com.hotta.lifeline.domain.survival.SurvivalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class SurvivalStatusScheduler {

    private final SurvivalRepository survivalRepository;

    // 매 10분마다 실행
    @Scheduled(cron = "0 */10 * * * *")
    @Transactional
    public void updateSurvivalStatuses() {
        LocalDateTime now = LocalDateTime.now();

        // SAFE → WARNING: lastManualCheckIn이 24시간 초과
        int warnCount = survivalRepository.bulkUpdateToWarning(now.minusHours(24));

        // WARNING → EMERGENCY: lastManualCheckIn이 48시간 초과
        int emergencyCount = survivalRepository.bulkUpdateToEmergency(now.minusHours(48));

        // 디버깅용
        if (warnCount > 0 || emergencyCount > 0) {
            log.info("[SurvivalScheduler] WARNING 전환: {}명 / EMERGENCY 전환: {}명", warnCount, emergencyCount);
        }
    }
}
