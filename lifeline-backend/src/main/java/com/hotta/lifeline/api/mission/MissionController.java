package com.hotta.lifeline.api.mission;

import com.hotta.lifeline.api.mission.service.MissionService;
import com.hotta.lifeline.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/missions")
@RequiredArgsConstructor
public class MissionController {

    private final MissionService missionService;

    @PatchMapping("/{index}")
    public ResponseEntity<ApiResponse<Void>> completeMission(@PathVariable("index") int index) {
        String loginId = SecurityContextHolder.getContext().getAuthentication().getName();

        missionService.completeMission(loginId, index);

        return ResponseEntity.ok(ApiResponse.success(index + "번 미션이 완료되었습니다.", null));
    }
}