package com.hotta.lifeline.api.diary;

import com.hotta.lifeline.api.diary.dto.DiaryDto;
import com.hotta.lifeline.api.diary.service.DiaryService;
import com.hotta.lifeline.global.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/diaries")
@RequiredArgsConstructor
public class DiaryController {

    private final DiaryService diaryService;

    // --- 1. 일기 생성 ---
    @PostMapping
    public ResponseEntity<ApiResponse<DiaryDto.CreateResponse>> createDiary(
            @Valid @RequestBody DiaryDto.CreateRequest request) {
        DiaryDto.CreateResponse response = diaryService.createDiary(request);
        return ResponseEntity.ok(ApiResponse.success("일기가 성공적으로 생성되었습니다.", response));
    }

    // --- 2. 월별 일기 목록 조회 ---
    // ex : GET /api/diaries?year=2026&month=3
    @GetMapping
    public ResponseEntity<ApiResponse<List<DiaryDto.ListResponse>>> getMonthlyDiaries(
            @RequestParam("year") int year,
            @RequestParam("month") int month) {
        List<DiaryDto.ListResponse> response = diaryService.getMonthlyDiaries(year, month);
        return ResponseEntity.ok(ApiResponse.success("월별 일기 목록 조회에 성공했습니다.", response));
    }

    // --- 3. 특정 일기 상세 조회 ---
    // ex : GET /api/diaries/1
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DiaryDto.ReadResponse>> getDiaryDetail(
            @PathVariable("id") Long id) {
        DiaryDto.ReadResponse response = diaryService.getDiaryDetail(id);
        return ResponseEntity.ok(ApiResponse.success("일기 상세 조회에 성공했습니다.", response));
    }

    // --- 4. 일기 수정 ---
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DiaryDto.UpdateResponse>> updateDiary(
            @PathVariable("id") Long id,
            @Valid @RequestBody DiaryDto.UpdateRequest request) {
        DiaryDto.UpdateResponse response = diaryService.updateDiary(id, request);
        return ResponseEntity.ok(ApiResponse.success("일기가 성공적으로 수정되었습니다.", response));
    }

    // --- 5. 일기 삭제 ---
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDiary(
            @PathVariable("id") Long id) {
        diaryService.deleteDiary(id);
        return ResponseEntity.ok(ApiResponse.success("일기가 성공적으로 삭제되었습니다.", null));
    }
}