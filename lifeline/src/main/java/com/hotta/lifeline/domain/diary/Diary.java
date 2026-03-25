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

    // 카나리아 미션 확장을 대비한 카테고리 (일기, 물마시기, 산책 등)
    //@Column(nullable = false)
    //private String category; // "DIARY", "WATER", "WALK" 등

    @OneToMany(mappedBy = "diary", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DiaryImage> images = new ArrayList<>();

    @Builder
    public Diary(User user, String title, String content, String mood, LocalDate diaryDate, String category) {
        this.user = user;
        this.title = title;
        this.content = content;
        this.mood = mood;
        this.diaryDate = diaryDate;
        this.category = (category != null) ? category : "DIARY"; // 기본값은 일반 일기
    }

    // 연관관계 편의 메서드 (일기에 이미지를 추가할 때 양쪽 객체에 모두 세팅)
    public void addImage(DiaryImage image) {
        this.images.add(image);
        image.assignDiary(this);
    }
}