import React from 'react';
import { MdKeyboardArrowUp, MdKeyboardArrowDown } from 'react-icons/md';

const PositionButton = ({ direction, onClick }) => {
  return (
    <button
      className="flex items-center justify-center text-sm font-medium bg-zinc-100 rounded-full transition-colors hover:bg-blue-400 w-[20px] h-[20px]"
      onClick={onClick}
    >
      {direction === 'up' ? (
        <MdKeyboardArrowUp size={16} color="black" />
      ) : (
        <MdKeyboardArrowDown size={16} color="black" />
      )}
    </button>
  );
};

export default PositionButton;