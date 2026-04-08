package com.hotta.lifeline.api.survival;

import com.hotta.lifeline.api.survival.dto.SurvivalDto;
import com.hotta.lifeline.api.survival.service.SurvivalService;
import com.hotta.lifeline.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/survival")
@RequiredArgsConstructor
public class SurvivalController {

    private final SurvivalService survivalService;

    //수동 생존신고
    @PostMapping("/checkin")
    public ResponseEntity<ApiResponse<SurvivalDto.CheckInResponse>> checkIn() {
        SurvivalDto.CheckInResponse response = survivalService.checkIn();
        return ResponseEntity.ok(ApiResponse.success("수동 생존신고가 완료되었습니다.", response));
    }
}