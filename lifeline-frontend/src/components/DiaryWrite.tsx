import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DiaryWriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  newDiary: { title: string; content: string; mood: string };
  setNewDiary: React.Dispatch<React.SetStateAction<{ title: string; content: string; mood: string }>>;
}

const moods = ['😊', '✨', '😭', '😡', '😴', '😋', '🤒'];

const DiaryWriteModal: React.FC<DiaryWriteModalProps> = ({ isOpen, onClose, onSave, newDiary, setNewDiary }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm" 
          />
          <motion.div 
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} 
            transition={{ type: "spring", damping: 30, stiffness: 300 }} 
            className="fixed inset-x-0 bottom-0 top-12 lg:top-20 bg-white rounded-t-[40px] z-[101] shadow-2xl p-6 lg:p-10 flex flex-col max-w-[800px] mx-auto overflow-hidden"
          >
            <div className="flex justify-between items-center mb-6 px-2 flex-shrink-0">
              <button onClick={onClose} className="text-gray-400 font-black text-lg">취소</button>
              <h3 className="text-xl font-black text-[#4B4B4B]">새로운 기록 ✍️</h3>
              <button onClick={onSave} className="text-[#1CB0F6] font-black text-lg active:scale-95">완료</button>
            </div>
            
            {/* 기분 선택 */}
            <div className="flex justify-start sm:justify-center gap-3 py-4 mb-4 overflow-x-auto flex-shrink-0 no-scrollbar">
              {moods.map(e => (
                <button 
                  key={e} 
                  onClick={() => setNewDiary({ ...newDiary, mood: e })} 
                  className={`text-4xl p-4 rounded-[24px] transition-all flex-shrink-0 ${newDiary.mood === e ? 'bg-[#DDF4FF] border-2 border-[#1CB0F6] scale-105 shadow-md' : 'bg-gray-50 border-2 border-transparent'}`}
                >
                  {e}
                </button>
              ))}
            </div>

            {/* 입력 영역 */}
            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4 no-scrollbar">
              <input 
                type="text" placeholder="제목을 입력하세요" 
                value={newDiary.title} 
                onChange={e => setNewDiary({ ...newDiary, title: e.target.value })} 
                className="text-2xl lg:text-3xl font-black outline-none border-b-2 border-gray-100 pb-4 focus:border-[#1CB0F6] transition-colors w-full" 
              />
              <textarea 
                placeholder="오늘은 어떤 일이 있었나요?" 
                value={newDiary.content} 
                onChange={e => setNewDiary({ ...newDiary, content: e.target.value })} 
                className="flex-1 text-lg font-bold text-gray-500 outline-none resize-none leading-relaxed min-h-[150px]" 
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DiaryWriteModal;