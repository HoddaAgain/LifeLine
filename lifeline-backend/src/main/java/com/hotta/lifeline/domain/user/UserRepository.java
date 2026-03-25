package com.hotta.lifeline.domain.user;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // 로그인 시 아이디로 유저 찾기
    Optional<User> findByLoginId(String loginId);

    // 회원가입 시 아이디 중복 여부 확인
    boolean existsByLoginId(String loginId);
}