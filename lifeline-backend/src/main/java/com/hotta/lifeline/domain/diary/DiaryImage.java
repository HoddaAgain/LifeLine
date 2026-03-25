package com.hotta.lifeline.domain.diary;

import com.hotta.lifeline.domain.diary.Diary;
import com.hotta.lifeline.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "diary_image")
public class DiaryImage extends BaseTimeEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "diary_id", nullable = false)
    private Diary diary;

    @Column(nullable = false)
    private String imageUrl;

    @Builder
    public DiaryImage(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    // Diary 객체와 연결하기 위한 메서드
    protected void assignDiary(Diary diary) {
        this.diary = diary;
    }
}