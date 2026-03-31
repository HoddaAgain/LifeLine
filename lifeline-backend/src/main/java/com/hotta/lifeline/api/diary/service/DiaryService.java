package com.hotta.lifeline.api.diary.service;

import com.hotta.lifeline.api.diary.dto.DiaryDto;
import com.hotta.lifeline.domain.diary.Diary;
import com.hotta.lifeline.domain.diary.DiaryRepository;
import com.hotta.lifeline.domain.user.User;
import com.hotta.lifeline.domain.user.UserRepository;
import com.hotta.lifeline.global.exception.CustomException;
import com.hotta.lifeline.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DiaryService {

    private final DiaryRepository diaryRepository;
    private final UserRepository userRepository;

    private String getCurrentLoginId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    // --- 1. 일기 생성 ---
    @Transactional
    public DiaryDto.CreateResponse createDiary(DiaryDto.CreateRequest request) {
        String loginId = getCurrentLoginId();
        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));

        Diary diary = Diary.builder()
                .user(user)
                .title(request.getTitle())
                .content(request.getContent())
                .mood(request.getMood())
                .diaryDate(request.getDiaryDate())
                .imageUrl(request.getImageUrl())
                .build();

        diaryRepository.save(diary);

        // 연속 작성일(Streak) 계산 로직 (간단 구현: 어제 썼으면 +1, 아니면 1로 초기화)
        LocalDate today = LocalDate.now();
        if (user.getLastDiaryDate() != null && user.getLastDiaryDate().equals(today.minusDays(1))) {
            user.setDiaryStreak(user.getDiaryStreak() + 1);
        } else if (user.getLastDiaryDate() == null || !user.getLastDiaryDate().equals(today)) {
            user.setDiaryStreak(1);
        }
        user.setLastDiaryDate(today);

        return new DiaryDto.CreateResponse(diary.getId(), user.getDiaryStreak());
    }

    // --- 2. 월별 일기 목록 조회 ---
    @Transactional(readOnly = true)
    public List<DiaryDto.ListResponse> getMonthlyDiaries(int year, int month) {
        String loginId = getCurrentLoginId();
        List<Diary> diaries = diaryRepository.findByUserAndYearAndMonth(loginId, year, month);

        // Entity 리스트 -> DTO 리스트 변환
        return diaries.stream()
                .map(diary -> DiaryDto.ListResponse.builder()
                        .id(diary.getId())
                        .title(diary.getTitle())
                        .diaryDate(diary.getDiaryDate())
                        .mood(diary.getMood())
                        .imageUrl(diary.getImageUrl())
                        .build())
                .collect(Collectors.toList());
    }

    // --- 3. 특정 일기 상세 조회 ---
    @Transactional(readOnly = true)
    public DiaryDto.ReadResponse getDiaryDetail(Long diaryId) {
        String loginId = getCurrentLoginId();
        Diary diary = diaryRepository.findByIdAndUser_LoginId(diaryId, loginId)
                .orElseThrow(() -> new RuntimeException("일기를 찾을 수 없거나 권한이 없습니다."));

        return DiaryDto.ReadResponse.builder()
                .id(diary.getId())
                .title(diary.getTitle())
                .content(diary.getContent())
                .mood(diary.getMood())
                .diaryDate(diary.getDiaryDate())
                .imageUrl(diary.getImageUrl())
                .createdAt(diary.getCreatedAt())
                .updatedAt(diary.getUpdatedAt())
                .build();
    }

    // --- 4. 일기 수정 ---
    @Transactional
    public DiaryDto.UpdateResponse updateDiary(Long diaryId, DiaryDto.UpdateRequest request) {
        String loginId = getCurrentLoginId();
        Diary diary = diaryRepository.findByIdAndUser_LoginId(diaryId, loginId)
                .orElseThrow(() -> new RuntimeException("일기를 찾을 수 없거나 권한이 없습니다."));
        diary.update(
                request.getTitle(),
                request.getContent(),
                request.getMood(),
                request.getImageUrl(),
                request.getDiaryDate()
        );

        return new DiaryDto.UpdateResponse(diary.getId());
    }

    // --- 5. 일기 삭제 ---
    @Transactional
    public void deleteDiary(Long diaryId) {
        String loginId = getCurrentLoginId();
        Diary diary = diaryRepository.findByIdAndUser_LoginId(diaryId, loginId)
                .orElseThrow(() -> new RuntimeException("일기를 찾을 수 없거나 권한이 없습니다."));

        diaryRepository.delete(diary);
    }
}