package com.hotta.lifeline.domain.user;

import com.hotta.lifeline.domain.survival.Survival;
import com.hotta.lifeline.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Setter
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
    private Integer diaryStreak = 0;

    private LocalDate lastDiaryDate; //마지막 일기 작성일

    @Column(nullable = false)
    private Boolean isTutorialCompleted = false; //튜토리얼 완료 여부 전송

    //survival 테이블이랑 양뱡향 조인
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Survival survival;

    @Builder
    public User(String loginId, String password, String name, String mode, String emergencyContact, LocalDate birthDate) {
        this.loginId = loginId;
        this.password = password;
        this.name = name;
        this.mode = mode;
        this.emergencyContact = emergencyContact;
        this.birthDate = birthDate;
    }

    // [비즈니스 로직] 일기 작성 시 연속일 처리
    public void updateDiaryStreak(LocalDate date) {
        this.lastDiaryDate = date;
        this.diaryStreak += 1;
    }


    // [비즈니스 로직] 튜토리얼 완료/스킵 처리
    public void completeTutorial() {
        this.isTutorialCompleted = true;
    }
}