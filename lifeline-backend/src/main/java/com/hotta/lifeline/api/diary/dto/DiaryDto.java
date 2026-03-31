package com.hotta.lifeline.api.diary.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class DiaryDto {

    //요청

    @Getter
    @NoArgsConstructor
    public static class CreateRequest {
        @NotBlank(message = "제목은 필수입니다.")
        private String title;
        private String content;
        private String mood;
        private String imageUrl;

        @NotNull(message = "일기 날짜는 필수입니다.")
        private LocalDate diaryDate; // 제안드린 부분!
    }

    @Getter
    @NoArgsConstructor
    public static class UpdateRequest {
        @NotBlank(message = "제목은 필수입니다.")
        private String title;
        private String content;
        private String mood;
        private String imageUrl;
        private LocalDate diaryDate;
    }

    //응답

    @Getter
    @Builder
    public static class ListResponse {
        private Long id;
        private String title;
        private LocalDate diaryDate;
        private String mood;
        private String imageUrl;
    }

    @Getter
    @Builder
    public static class ReadResponse {
        private Long id;
        private String title;
        private String content;
        private String mood;
        private LocalDate diaryDate;
        private String imageUrl;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class CreateResponse {
        private Long id;
        private Integer diaryStreak; // 연속 작성일
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class UpdateResponse {
        private Long id;
    }
}