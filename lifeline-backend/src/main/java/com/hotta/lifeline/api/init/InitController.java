package com.hotta.lifeline.api.init;

import com.hotta.lifeline.api.init.dto.InitDto;
import com.hotta.lifeline.api.init.service.InitService;
import com.hotta.lifeline.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/init")
@RequiredArgsConstructor
public class InitController {

    private final InitService initService;

    @GetMapping
    public ResponseEntity<ApiResponse<InitDto.InitResponse>> getInitData() {
        String loginId = SecurityContextHolder.getContext().getAuthentication().getName();

        InitDto.InitResponse response = initService.getInitData(loginId);

        return ResponseEntity.ok(ApiResponse.success("초기 데이터 조회에 성공했습니다.", response));
    }
}