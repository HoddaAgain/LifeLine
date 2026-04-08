package com.hotta.lifeline.domain.survival;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SurvivalRepository extends JpaRepository<Survival, Long> {
    // loginId로 생존 기록 조회
    Optional<Survival> findByUser_LoginId(String loginId);
}