package com.hotta.lifeline.api.auth.service;

import com.hotta.lifeline.api.auth.dto.AuthDto;
import com.hotta.lifeline.domain.survival.Survival;
import com.hotta.lifeline.domain.user.User;
import com.hotta.lifeline.domain.user.UserRepository;
import com.hotta.lifeline.global.config.JwtUtil;
import com.hotta.lifeline.global.exception.CustomException;
import com.hotta.lifeline.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // 회원가입 로직
    @Transactional
    public void register(AuthDto.RegisterRequest request) {
        // 1. 아이디 중복 체크
        if (userRepository.existsByLoginId(request.getUserId())) {
            throw new CustomException(ErrorCode.DUPLICATE_LOGIN_ID);
        }

        // 2. 비밀번호 암호화 및 User 엔티티 생성
        User user = User.builder()
                .loginId(request.getUserId())
                .password(passwordEncoder.encode(request.getPassword())) // 암호화
                .name(request.getName())
                .mode(request.getMode())
                .emergencyContact(request.getEmergencyContact())
                .birthDate(request.getBirthDate())
                .build();

        // 2-2. User 객체 생성
        Survival survival = Survival.builder()
                .user(user)
                .build();

        user.setSurvival(survival);

        // 3. DB에 저장
        userRepository.save(user);
    }

    // 로그인 로직
    @Transactional(readOnly = true)
    public AuthDto.LoginResponse login(AuthDto.LoginRequest request) {
        // 1. DB에서 유저 찾기
        User user = userRepository.findByLoginId(request.getUserId())
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // 2. 비밀번호 일치 여부 확인
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new CustomException(ErrorCode.INVALID_INPUT_VALUE);
        }

        // 3. 인증 성공, JWT 토큰 2장(Access, Refresh) 발급
        String accessToken = jwtUtil.createAccessToken(user.getLoginId(), user.getMode());
        String refreshToken = jwtUtil.createRefreshToken(user.getLoginId(), user.getMode());

        // 4. 응답 DTO 조립해서 반환
        return AuthDto.LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .mode(user.getMode())
                .build();
    }
}