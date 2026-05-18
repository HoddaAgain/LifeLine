package com.hotta.lifeline.domain.survival;

import com.hotta.lifeline.domain.user.User;
import com.hotta.lifeline.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "survivals")
public class Survival extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // User 테이블과 1ㄷ1로 매핑함
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private Boolean isAutoCheckEnabled = false;

    @Column(nullable = false)
    private LocalDateTime lastManualCheckIn;

    @Column(nullable = false)
    private LocalDateTime lastDeviceActivity;

    @Column(nullable = false)
    private String survivalStatus = "SAFE"; // SAFE, WARNING, EMERGENCY

    @Column(nullable = false)
    private Integer survivalStreak = 0;

    private LocalDateTime updatedAt;

    // 데이터가 저장되거나 수정될 때 자동으로 현재 시간 기록
    @PrePersist
    @PreUpdate
    public void preSave() {
        this.updatedAt = LocalDateTime.now();
    }

    @Builder
    public Survival(User user) {
        this.user = user;
        LocalDateTime now = LocalDateTime.now();
        this.setLastDeviceActivity(now);
        this.setLastManualCheckIn(now.minusDays(1));
    }
}