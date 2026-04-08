package com.hotta.lifeline.global.common;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class ApiResponse<T> {

    private String status;   // "SUCCESS" or "ERROR"
    private String message;  // 결과 메시지
    private T data;          // 실제 응답 데이터 (DTO)

    // [성공] 데이터만 반환할 때
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>("SUCCESS", "요청이 성공적으로 처리되었습니다.", data);
    }

    // [성공] 커스텀 메시지와 데이터를 함께 반환할 때
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>("SUCCESS", message, data);
    }

    // [실패] 에러 응답을 반환할 때 (GlobalExceptionHandler에서 주로 사용)
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>("ERROR", message, null);
    }
}