package com.hotta.lifeline.api.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

public class AuthDto {

    // 1. 회원가입 요청 DTO (AuthDto.SignUpRequest)
    @Getter
    @NoArgsConstructor
    public static class SignUpRequest {
        @NotBlank(message = "아이디는 필수입니다.")
        private String userId;

        @NotBlank(message = "비밀번호는 필수입니다.")
        private String password;

        @NotBlank(message = "이름은 필수입니다.")
        private String name;

        private String mode; // "EASY" or "NORMAL"
        private String emergencyContact;
        private LocalDate birthDate;
    }

    // 2. 로그인 요청 DTO (AuthDto.LoginRequest)
    @Getter
    @NoArgsConstructor
    public static class LoginRequest {
        @NotBlank(message = "아이디를 입력해주세요.")
        private String userId;

        @NotBlank(message = "비밀번호를 입력해주세요.")
        private String password;
    }

    // 3. 로그인 응답 DTO (AuthDto.LoginResponse)
    @Getter
    @Builder
    @AllArgsConstructor
    public static class LoginResponse {
        private String accessToken;
        private String refreshToken;
        private String mode; // 프론트엔드 라우팅용
    }
}