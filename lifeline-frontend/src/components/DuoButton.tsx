import React from 'react';


interface DuoButtonProps {
  text: string;
  color?: 'green' | 'blue' | 'gray' | 'yellow' ; 
  onClick?: () => void;
  type?: 'button' | 'submit';
}

const DuoButton = ({ text, color = 'green', onClick, type = 'button' }: DuoButtonProps) => {

  const colorVariants = {
    green: 'bg-[#58cc02] border-[#46a302] hover:bg-[#4ea602]',
    blue: 'bg-[#1cb0f6] border-[#1899d6] hover:bg-[#1a9edc]',
    gray: 'bg-[#e5e5e5] border-[#afafaf] text-[#afafaf] hover:bg-[#d5d5d5]',
    yellow :'bg-[#ffd94d] border-[#ffe880] hover:bg-[#ffca1a]'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        w-full py-4 px-6
        ${colorVariants[color]}
        text-white font-black text-xl 
        rounded-2xl 
        border-b-4 
        active:border-b-0 active:translate-y-1 
        transition-all duration-100
      `}
    >
      {text}
    </button>
  );
};

export default DuoButton;