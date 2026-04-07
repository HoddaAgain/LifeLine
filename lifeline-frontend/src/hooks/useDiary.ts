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

  // 검색 및 정렬 관련 상태
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
        setDiaries(res.data.data || []);
      }
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403 )setLogout;
      showToast('데이터를 불러오는데 실패했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, setLogout, showToast]);

  useEffect(() => {
    fetchDiaries();
  }, [fetchDiaries]);

  // 검색 및 정렬 로직 (Memoization)
  const filteredAndSortedDiaries = useMemo(() => {
    const list = Array.isArray(diaries) ? diaries : [];
    let result = list.filter(diary => 
      (diary.title || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
    result.sort((a, b) => sortOrder === 'DESC' ? b.id - a.id : a.id - b.id);
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
        const diaryForState = { 
          ...savedData, 
          diary_date: savedData.diary_date || savedData.diaryDate || formattedDate 
        };
        setDiaries(prev => [diaryForState, ...prev]);
        setIsWriting(false);
        setNewDiary({ title: '', content: '', mood: '😊' });
        showToast('오늘의 기록이 저장되었습니다! 📖', 'success');
      }
    } catch (error) {
      showToast('저장에 실패했습니다.', 'error');
    }
  };

  // 일기 상세 조회
  const handleReadDiary = async (id: number) => {
    try {
      const res = await api.get(`/api/diaries/${id}`);
      if (res.data.status === "SUCCESS") {
        setSelectedDiary(res.data.data);
        setIsDeleteConfirm(false);
      }
    } catch (error) {
      showToast('일기를 불러올 수 없습니다.', 'error');
    }
  };

  // 일기 삭제
  const handleDeleteDiary = async (id: number) => {
    try {
      const res = await api.delete(`/api/diaries/${id}`);
      if (res.data.status === "SUCCESS") {
        setDiaries(prev => prev.filter(d => d.id !== id));
        setSelectedDiary(null);
        setIsDeleteConfirm(false);
        showToast('기록이 성공적으로 삭제되었습니다.', 'info');
      }
    } catch (error) {
      showToast('삭제에 실패했습니다.', 'error');
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
    handleSaveDiary, handleReadDiary, handleDeleteDiary
  };
};