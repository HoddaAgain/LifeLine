package com.hotta.lifeline.domain.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // 로그인 시 아이디로 유저 찾기
    Optional<User> findByLoginId(String loginId);

    // 회원가입 시 아이디 중복 여부 확인
    boolean existsByLoginId(String loginId);

    // 자정 미션 리셋용: 모든 유저를 dailyMissions와 함께 fetch join (N+1 방지)
    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.dailyMissions")
    List<User> findAllWithDailyMissions();
}