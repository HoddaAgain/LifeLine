package com.hotta.lifeline.domain.mission;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface DailyMissionRepository extends JpaRepository<DailyMission, Long> {

    // DB에 있는 모든 미션의 isCleared 값을 false로 업데이트
    @Modifying
    @Query("UPDATE DailyMission m SET m.isCleared = false")
    void resetAllMissions();
}