package com.hotta.lifeline.api.survival;

import com.hotta.lifeline.api.survival.dto.SurvivalDto;
import com.hotta.lifeline.api.survival.service.SurvivalService;
import com.hotta.lifeline.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/survival")
@RequiredArgsConstructor
public class SurvivalController {

    private final SurvivalService survivalService;

    //연속 생존신고일자 반환
    @GetMapping("/survival-streak")
    public ResponseEntity<ApiResponse<SurvivalDto.SurvivalStreakResponse>> getSurvivalStreak() {
        SurvivalDto.SurvivalStreakResponse response = survivalService.getSurvivalStreak();
        return ResponseEntity.ok(ApiResponse.success("연속 생존신고 일자 조회에 성공했습니다.", response));
    }

    //수동 생존신고
    @PostMapping("/checkin")
    public ResponseEntity<ApiResponse<SurvivalDto.CheckInResponse>> checkIn() {
        SurvivalDto.CheckInResponse response = survivalService.checkIn();
        return ResponseEntity.ok(ApiResponse.success("수동 생존신고가 완료되었습니다.", response));
    }
}