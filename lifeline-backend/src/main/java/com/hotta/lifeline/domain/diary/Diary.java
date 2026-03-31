package com.hotta.lifeline.domain.diary;

import com.hotta.lifeline.domain.user.User;
import com.hotta.lifeline.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "diary")
public class Diary extends BaseTimeEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String mood;

    @Column(nullable = false)
    private LocalDate diaryDate;

    private String imageUrl; // S3 등에 저장된 이미지 URL

    @Builder
    public Diary(User user, String title, String content, String mood, LocalDate diaryDate, String imageUrl) {
        this.user = user;
        this.title = title;
        this.content = content;
        this.mood = mood;
        this.diaryDate = diaryDate;
        this.imageUrl = imageUrl;
    }

    // 더티 체킹(Dirty Checking)을 이용한 업데이트 편의 메서드
    public void update(String title, String content, String mood, String imageUrl, LocalDate diaryDate) {
        this.title = title;
        this.content = content;
        this.mood = mood;
        this.imageUrl = imageUrl;
        this.diaryDate = diaryDate;
    }
}