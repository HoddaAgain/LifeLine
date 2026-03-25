package com.hotta.lifeline.domain.user;

import com.hotta.lifeline.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "users")
public class User extends BaseTimeEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String loginId;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String mode; // "EASY" or "NORMAL"

    @Column(nullable = false)
    private String emergencyContact;

    @Column(nullable = false)
    private LocalDate birthDate;

    // 동기부여 및 상태 체크용 필드
    @Column(nullable = false)
    private Integer survivalStreak = 0;

    @Column(nullable = false)
    private Integer diaryStreak = 0;

    private LocalDateTime lastSurvivalTime;

    private LocalDate lastDiaryDate;

    @Builder
    public User(String loginId, String password, String name, String mode, String emergencyContact, LocalDate birthDate) {
        this.loginId = loginId;
        this.password = password;
        this.name = name;
        this.mode = mode;
        this.emergencyContact = emergencyContact;
        this.birthDate = birthDate;
    }

    // [비즈니스 로직] 생존신고 출석 처리
    public void checkInSurvival() {
        this.lastSurvivalTime = LocalDateTime.now();
        this.survivalStreak += 1;
    }

    // [비즈니스 로직] 일기 작성 시 연속일 처리
    public void updateDiaryStreak(LocalDate date) {
        this.lastDiaryDate = date;
        this.diaryStreak += 1;
    }
}