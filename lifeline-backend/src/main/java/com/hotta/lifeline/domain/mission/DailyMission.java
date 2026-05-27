package com.hotta.lifeline.domain.mission;

import com.hotta.lifeline.domain.user.User;
import com.hotta.lifeline.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "daily_missions")
public class DailyMission extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 한명의 유저 : 복수의 미션 (N:1)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Integer missionIndex; // 순서 보장용 (0, 1, 2)

    @Column(nullable = false)
    private Boolean isCleared = false; // 완료 여부

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MissionType missionType; // 배정된 미션 종류

    @Builder
    public DailyMission(User user, Integer missionIndex, MissionType missionType) {
        this.user = user;
        this.missionIndex = missionIndex;
        this.missionType = missionType;
        this.isCleared = false;
    }

    // 미션 완료 처리 메서드
    public void clearMission() {
        this.isCleared = true;
    }

    // 자정 초기화 처리 메서드
    public void resetMission() {
        this.isCleared = false;
    }

    // 미션 타입 갱신 메서드 (자정 리셋 시 사용)
    public void updateMission(MissionType newType) {
        this.missionType = newType;
        this.isCleared = false;
    }
}