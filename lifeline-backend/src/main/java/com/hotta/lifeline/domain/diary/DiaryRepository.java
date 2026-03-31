package com.hotta.lifeline.domain.diary;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DiaryRepository extends JpaRepository<Diary, Long> {

    // 1. 특정 유저가 작성한 일기 중, 특정 연도와 월에 해당하는 일기들만 가져오기 (날짜 최신순 정렬)
    @Query("SELECT d FROM Diary d WHERE d.user.loginId = :loginId AND YEAR(d.diaryDate) = :year AND MONTH(d.diaryDate) = :month ORDER BY d.diaryDate DESC")
    List<Diary> findByUserAndYearAndMonth(@Param("loginId") String loginId, @Param("year") int year, @Param("month") int month);

    // 2. 본인이 작성한 일기만 상세 조회/수정/삭제할 수 있게끔
    Optional<Diary> findByIdAndUser_LoginId(Long id, String loginId);
}