import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Diary } from '../types';

interface DiaryDetailModalProps {
  diary: Diary | null;
  onClose: () => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, data: { title: string; content: string; mood: string; diaryDate: string }) => Promise<void>;
  isDeleteConfirm: boolean;
  setIsDeleteConfirm: (val: boolean) => void;
}

const moods = ['😊', '✨', '😭', '😡', '😴', '😋', '🤒'];

const DiaryDetailModal: React.FC<DiaryDetailModalProps> = ({ 
  diary, onClose, onDelete, onUpdate, isDeleteConfirm, setIsDeleteConfirm 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', content: '', mood: '😊', diaryDate: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!diary) return;

    setIsEditing(false);
    setIsSaving(false);
    setEditForm({
      title: diary.title || '',
      content: diary.content || '',
      mood: diary.mood || '😊',
      diaryDate: (diary as any).date || (diary as any).diaryDate || diary.diary_date || new Date().toISOString().slice(0, 10),
    });
  }, [diary]);

  if (!diary) return null;

  const handleSave = async () => {
    setIsSaving(true);
    await onUpdate(diary.id, editForm);
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
        onClick={handleClose} 
        className="fixed inset-0 bg-black/50 z-[110] backdrop-blur-md" 
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="fixed inset-x-4 top-20 bottom-20 lg:inset-x-auto lg:left-1/2 lg:-translate-x-1/2 lg:w-[600px] bg-white rounded-[32px] z-[111] p-8 shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex justify-between items-start mb-6 flex-shrink-0">
          <div>
            <span className="text-[#1CB0F6] font-black text-sm uppercase tracking-widest">
              {isEditing ? editForm.diaryDate : ((diary as any).date || diary.diary_date || (diary as any).diaryDate)}
            </span>
            {isEditing ? (
              <input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="text-2xl lg:text-3xl font-black text-gray-700 mt-1 leading-tight outline-none border-b-2 border-gray-100 focus:border-[#1CB0F6] w-full"
              />
            ) : (
              <h3 className="text-2xl lg:text-3xl font-black text-gray-700 mt-1 leading-tight">{diary.title}</h3>
            )}
          </div>
          <button onClick={handleClose} className="text-gray-300 hover:text-gray-900 text-2xl font-black">✕</button>
        </div>

        <div className="flex items-center gap-4 mb-6 p-5 bg-[#F7F9FA] rounded-[24px] border-2 border-gray-100 flex-shrink-0">
          {isEditing ? (
            <div className="flex flex-col gap-4 w-full">
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {moods.map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setEditForm({ ...editForm, mood })}
                    className={`text-3xl p-3 rounded-2xl border-2 transition-all ${editForm.mood === mood ? 'bg-[#DDF4FF] border-[#1CB0F6]' : 'bg-white border-transparent'}`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
              <input
                type="date"
                value={editForm.diaryDate}
                onChange={(e) => setEditForm({ ...editForm, diaryDate: e.target.value })}
                className="w-full p-3 bg-white border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-500 outline-none focus:border-[#1CB0F6]"
              />
            </div>
          ) : (
            <>
              <span className="text-5xl">{diary.mood}</span>
              <span className="font-black text-gray-400 italic">이날의 기분</span>
            </>
          )}
        </div>

        {isEditing ? (
          <textarea
            value={editForm.content}
            onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
            className="flex-1 overflow-y-auto text-lg leading-relaxed text-gray-600 font-bold px-2 resize-none outline-none no-scrollbar"
          />
        ) : (
          <div className="flex-1 overflow-y-auto text-lg leading-relaxed text-gray-600 font-bold px-2 whitespace-pre-wrap no-scrollbar">
            {diary.content}
          </div>
        )}

        {/* 하단 버튼 영역 */}
        <div className="mt-8 pt-6 border-t-2 border-gray-50 flex flex-col gap-3 flex-shrink-0">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-4 w-full">
                <button onClick={() => setIsEditing(false)} className="flex-1 py-4 rounded-2xl font-black text-gray-500 bg-gray-100 hover:bg-gray-200">취소</button>
                <button onClick={handleSave} disabled={isSaving} className="flex-1 py-4 rounded-2xl font-black text-white bg-[#1CB0F6] disabled:bg-gray-300">
                  {isSaving ? '저장 중...' : '저장하기'}
                </button>
              </motion.div>
            ) : !isDeleteConfirm ? (
              <motion.div key="normal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-4 w-full">
                <button onClick={() => setIsEditing(true)} className="flex-1 py-4 rounded-2xl font-black text-[#1CB0F6] bg-[#DDF4FF] hover:bg-blue-100">수정하기</button>
                <button onClick={() => setIsDeleteConfirm(true)} className="flex-1 py-4 rounded-2xl font-black text-red-500 bg-red-50 hover:bg-red-100">삭제하기</button>
                <button onClick={onClose} className="flex-1 py-4 rounded-2xl font-black text-gray-500 bg-gray-100 hover:bg-gray-200">닫기</button>
              </motion.div>
            ) : (
              <motion.div key="confirm" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-3 w-full bg-red-50 p-4 rounded-[24px] border-2 border-red-100">
                <p className="text-center font-black text-red-600 mb-1">정말 이 기록을 삭제할까요?</p>
                <div className="flex gap-3">
                  <button onClick={() => onDelete(diary.id)} className="flex-1 py-3 rounded-xl font-black text-white bg-red-500 shadow-[0_4px_0_0_#BC2F2F]">응, 삭제할래</button>
                  <button onClick={() => setIsDeleteConfirm(false)} className="flex-1 py-3 rounded-xl font-black text-gray-500 bg-white border-2 border-gray-200">아니, 취소!</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DiaryDetailModal;
