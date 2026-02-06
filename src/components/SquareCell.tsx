"use client";

import { motion } from "framer-motion";

interface SquareCellProps {
  row: number;
  col: number;
  userId: number | null;
  userName: string | null;
  isCurrentUser: boolean;
  rowNumber?: number;
  colNumber?: number;
  numbersAssigned: boolean;
  canSelect: boolean;
  onSelect: () => void;
  index?: number;
}

function getInitials(name: string | null): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function SquareCell({
  userId,
  userName,
  isCurrentUser,
  rowNumber,
  colNumber,
  numbersAssigned,
  canSelect,
  onSelect,
  index = 0,
}: SquareCellProps) {
  const isAvailable = !userId;
  const isTakenByOther = userId && !isCurrentUser;

  let bgColor = "bg-white border-slate-200";
  if (isCurrentUser) {
    bgColor = "bg-[#69BE28] text-white border-[#002244]";
  } else if (isTakenByOther) {
    bgColor = "bg-slate-200 text-slate-700 border-slate-300";
  } else if (canSelect) {
    bgColor = "bg-slate-50 hover:bg-emerald-50 border-emerald-200 hover:border-emerald-400";
  }

  const canInteract = (canSelect && isAvailable) || isCurrentUser;

  const handleClick = () => {
    if (canInteract) {
      onSelect();
    }
  };

  return (
    <div className="relative group">
      <motion.button
        type="button"
        onClick={handleClick}
        disabled={!canInteract}
        title={isTakenByOther && userName ? userName : undefined}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.008, duration: 0.2 }}
        whileTap={canInteract ? { scale: 0.92 } : undefined}
        whileHover={canInteract ? { scale: 1.03 } : undefined}
        className={`
          min-w-[32px] min-h-[32px] sm:min-w-[40px] sm:min-h-[40px]
          w-8 h-8 sm:w-10 sm:h-10
          border-2 rounded-lg flex flex-col items-center justify-center
          text-xs font-semibold touch-manipulation select-none
          shadow-sm transition-shadow
          ${bgColor}
          ${canInteract ? "cursor-pointer hover:shadow-md" : "cursor-default"}
          ${isTakenByOther ? "cursor-help" : ""}
        `}
      >
        {numbersAssigned && rowNumber !== undefined && colNumber !== undefined ? (
          <span className="text-[10px] sm:text-xs opacity-90">
            {rowNumber}×{colNumber}
          </span>
        ) : null}
        <span className="truncate max-w-full px-0.5 font-medium">
          {userName ? getInitials(userName) : ""}
        </span>
      </motion.button>
      {isTakenByOther && userName && (
        <div className="absolute z-10 px-2 py-1 text-xs font-medium text-white bg-slate-800 rounded shadow-lg whitespace-nowrap -top-9 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          {userName}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-slate-800" />
        </div>
      )}
    </div>
  );
}
