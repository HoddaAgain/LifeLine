import { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../api/axios';
import { type Diary } from '../types';
import { useUserStore } from '../store/useUserStore';

export const useDiary = (showToast: (msg: string, type?: 'success' | 'error' | 'info') => void) => {
  const { isLoggedIn, setLogout } = useUserStore();

  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWriting, setIsWriting] = useState(false);
  const [selectedDiary, setSelectedDiary] = useState<Diary | null>(null);
  const [newDiary, setNewDiary] = useState({ title: '', content: '', mood: '😊' });
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'DESC' | 'ASC'>('DESC');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 데이터 불러오기 
  const fetchDiaries = useCallback(async () => {
    if (!isLoggedIn) {
      setIsLoading(false);
      return;
    }
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const res = await api.get(`/api/diaries?year=${year}&month=${month}`);
      
      if (res.data.status === "SUCCESS") {
        const rawData = res.data.data || [];
        // 서버에서 받아온 데이터의 필드명을 'date'로 통일하여 렌더링 에러 방지
        const sanitizedData = rawData.map((d: any) => ({
          ...d,
          id: d.id || d.diaryId,
          title: d.title || d.diaryTitle,
          content: d.content || d.diaryContent,
          date: d.diaryDate || d.diary_date || d.createdAt?.split('T')[0]
        }));
        setDiaries(sanitizedData);
      }
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) setLogout();
      showToast('데이터를 불러오는데 실패했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, setLogout, showToast]);

  useEffect(() => {
    fetchDiaries();
  }, [fetchDiaries]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const refreshDiaries = () => {
      fetchDiaries();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshDiaries();
      }
    };

    window.addEventListener('focus', refreshDiaries);
    window.addEventListener('pageshow', refreshDiaries);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const syncTimer = window.setInterval(refreshDiaries, 15000);

    return () => {
      window.removeEventListener('focus', refreshDiaries);
      window.removeEventListener('pageshow', refreshDiaries);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.clearInterval(syncTimer);
    };
  }, [fetchDiaries, isLoggedIn]);

  // 검색 및 정렬 로직
  const filteredAndSortedDiaries = useMemo(() => {
    const list = Array.isArray(diaries) ? diaries : [];
    let result = list.filter(diary => 
      (diary.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (diary.content || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    
    result.sort((a: any, b: any) => {
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      
      if (sortOrder === 'DESC') {
        return dateB !== dateA ? dateB - dateA : (b.id || 0) - (a.id || 0);
      } else {
        return dateA !== dateB ? dateA - dateB : (a.id || 0) - (b.id || 0);
      }
    });

    return result;
  }, [diaries, searchTerm, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedDiaries.length / itemsPerPage);
  const currentItems = filteredAndSortedDiaries.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  // 일기 저장
  const handleSaveDiary = async () => {
    if (!newDiary.title.trim() || !newDiary.content.trim()) {
      return showToast('제목과 내용을 모두 입력해주세요!', 'error');
    }
    try {
      const localDate = new Date();
      const formattedDate = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;
      
      const payload = { ...newDiary, diaryDate: formattedDate, imageUrl: "" };
      const res = await api.post('/api/diaries', payload);
      
      if (res.data.status === "SUCCESS") {
        const savedData = res.data.data;

        // 저장 즉시 상태에 넣을 때도 필드명을 fetch할 때와 동일하게 가공
        const diaryForState = { 
          ...savedData,
          id: savedData.id || savedData.diaryId || Date.now(), 
          title: savedData.title || savedData.diaryTitle || newDiary.title,
          content: savedData.content || savedData.diaryContent || newDiary.content,
          date: savedData.diaryDate || savedData.diary_date || formattedDate 
        };

        setDiaries(prev => [diaryForState, ...prev]);
        setIsWriting(false);
        setNewDiary({ title: '', content: '', mood: '😊' });
        showToast('오늘의 기록이 저장되었습니다! 📖', 'success');
      }
    } catch (error) {
      console.error("Save Error:", error);
      showToast('저장에 실패했습니다.', 'error');
    }
  };

  // 상세 조회 시에도 필드 보정 적용
  const handleReadDiary = async (id: number) => {
    try {
      const res = await api.get(`/api/diaries/${id}`);
      if (res.data.status === "SUCCESS") {
        const d = res.data.data;
        setSelectedDiary({
          ...d,
          id: d.id || d.diaryId,
          title: d.title || d.diaryTitle,
          content: d.content || d.diaryContent,
          date: d.diaryDate || d.diary_date
        });
        setIsDeleteConfirm(false);
      }
    } catch (error) {
      showToast('일기를 불러올 수 없습니다.', 'error');
    }
  };

  const handleDeleteDiary = async (id: number) => {
    try {
      const res = await api.delete(`/api/diaries/${id}`);
      if (res.data.status === "SUCCESS") {
        setDiaries(prev => prev.filter(d => (d.id || (d as any).diaryId) !== id));
        setSelectedDiary(null);
        setIsDeleteConfirm(false);
        showToast('기록이 성공적으로 삭제되었습니다.', 'info');
      }
    } catch (error) {
      showToast('삭제에 실패했습니다.', 'error');
    }
  };

  const handleUpdateDiary = async (
    id: number,
    data: { title: string; content: string; mood: string; diaryDate: string }
  ) => {
    if (!data.title.trim() || !data.content.trim()) {
      return showToast('제목과 내용을 모두 입력해주세요!', 'error');
    }

    try {
      const payload = {
        title: data.title,
        content: data.content,
        mood: data.mood,
        diaryDate: data.diaryDate,
        imageUrl: (selectedDiary as any)?.imageUrl || '',
      };

      const res = await api.put(`/api/diaries/${id}`, payload);

      if (res.data.status === 'SUCCESS') {
        const updatedDiary = {
          ...(selectedDiary as any),
          ...payload,
          id,
          date: payload.diaryDate,
        };

        setDiaries(prev =>
          prev.map(d => ((d.id || (d as any).diaryId) === id ? { ...d, ...updatedDiary } : d))
        );
        setSelectedDiary(updatedDiary);
        setIsDeleteConfirm(false);
        showToast('기록이 수정되었습니다.', 'success');
      }
    } catch (error) {
      console.error('Update Error:', error);
      showToast('수정에 실패했습니다.', 'error');
    }
  };

  return {
    diaries, isLoading, isWriting, setIsWriting,
    selectedDiary, setSelectedDiary,
    newDiary, setNewDiary,
    isDeleteConfirm, setIsDeleteConfirm,
    searchTerm, setSearchTerm,
    sortOrder, setSortOrder,
    currentPage, setCurrentPage,
    totalPages, currentItems,
    refreshDiaries: fetchDiaries,
    handleSaveDiary, handleReadDiary, handleDeleteDiary, handleUpdateDiary
  };
};
