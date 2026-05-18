package com.hotta.lifeline.domain.survival;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface SurvivalRepository extends JpaRepository<Survival, Long> {
    // loginId로 생존 기록 조회
    Optional<Survival> findByUser_LoginId(String loginId);

    // 24시간 초과된 SAFE 상태를 WARNING으로 일괄 변경
    @Modifying
    @Query("UPDATE Survival s SET s.survivalStatus = 'WARNING' WHERE s.survivalStatus = 'SAFE' AND s.lastManualCheckIn < :threshold")
    int bulkUpdateToWarning(@Param("threshold") LocalDateTime threshold);

    // 48시간 초과된 WARNING 상태를 EMERGENCY로 일괄 변경
    @Modifying
    @Query("UPDATE Survival s SET s.survivalStatus = 'EMERGENCY' WHERE s.survivalStatus = 'WARNING' AND s.lastManualCheckIn < :threshold")
    int bulkUpdateToEmergency(@Param("threshold") LocalDateTime threshold);
}