"use client";

import { useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import SquareCell from "./SquareCell";
import TeamLogo from "./TeamLogo";

const ROW_TEAM = "Seahawks";
const COL_TEAM = "Patriots";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.015, delayChildren: 0.05 },
  },
};

const cellVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

interface GridProps {
  grid: Record<string, { userId: number | null; userName: string | null }>;
  rowNumbers: number[] | null;
  colNumbers: number[] | null;
  numbersAssigned: boolean;
  currentUserId: number | null;
  squaresToBuy: number;
  selectedCount: number;
  canSelect: boolean;
  onSelectSquare: (row: number, col: number) => void;
}

export default function Grid({
  grid,
  rowNumbers,
  colNumbers,
  numbersAssigned,
  currentUserId,
  squaresToBuy,
  selectedCount,
  canSelect,
  onSelectSquare,
}: GridProps) {
  const getSquare = useCallback(
    (row: number, col: number) => {
      return grid[`${row}-${col}`] ?? { userId: null, userName: null };
    },
    [grid]
  );

  const { displayRows, displayCols } = useMemo(() => {
    if (!rowNumbers || !colNumbers || !numbersAssigned) {
      return {
        displayRows: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        displayCols: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      };
    }
    const invertedRow: number[] = new Array(10);
    const invertedCol: number[] = new Array(10);
    for (let n = 0; n < 10; n++) {
      invertedRow[n] = rowNumbers.indexOf(n);
      invertedCol[n] = colNumbers.indexOf(n);
    }
    return { displayRows: invertedRow, displayCols: invertedCol };
  }, [rowNumbers, colNumbers, numbersAssigned]);

  const handleSquareClick = useCallback(
    (physicalRow: number, physicalCol: number) => {
      const sq = getSquare(physicalRow, physicalCol);
      if (sq.userId === currentUserId) {
        onSelectSquare(physicalRow, physicalCol);
        return;
      }
      if (!sq.userId && selectedCount < squaresToBuy && canSelect) {
        onSelectSquare(physicalRow, physicalCol);
      }
    },
    [getSquare, currentUserId, selectedCount, squaresToBuy, canSelect, onSelectSquare]
  );

  const headerCellClass = "min-w-[28px] min-h-[28px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center text-xs font-bold text-gray-600";

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="overflow-x-auto -mx-2 px-2"
    >
      <motion.div
        variants={containerVariants}
        className="inline-grid gap-0.5 sm:gap-1"
        style={{ gridTemplateColumns: "auto repeat(10, minmax(28px, 1fr))" }}
      >
        <div className="flex items-center justify-center pr-2 min-w-[100px] sm:min-w-[120px]">
          <div className="flex items-center gap-3">
            <TeamLogo team="seahawks" size="xl" animate={false} />
            <p className="text-lg font-bold text-slate-800 -rotate-90 origin-center whitespace-nowrap">
              {ROW_TEAM}
            </p>
          </div>
        </div>
        <div className="col-span-10 flex flex-col items-center justify-center pb-2">
          <TeamLogo team="patriots" size="xl" animate />
          <p className="text-lg font-bold text-slate-800 mt-1">{COL_TEAM}</p>
        </div>
        {numbersAssigned
              ? Array.from({ length: 10 }, (_, i) => (
                  <motion.div key={i} variants={cellVariants} className={headerCellClass}>
                    {i}
                  </motion.div>
                ))
              : Array.from({ length: 10 }, (_, i) => (
                  <div key={i} className="min-w-[28px] min-h-[28px] sm:min-w-[36px] sm:min-h-[36px]" />
                ))}
        {Array.from({ length: 10 }, (_, displayRow) => (
          <div key={displayRow} className="contents">
            <motion.div variants={cellVariants} className={`${headerCellClass} min-w-[24px]`}>
              {numbersAssigned ? displayRow : ""}
            </motion.div>
            {Array.from({ length: 10 }, (_, displayCol) => {
              const physicalRow = displayRows[displayRow];
              const physicalCol = displayCols[displayCol];
              const sq = getSquare(physicalRow, physicalCol);
              return (
                <SquareCell
                  key={displayCol}
                  row={physicalRow}
                  col={physicalCol}
                  userId={sq.userId}
                  userName={sq.userName}
                  isCurrentUser={sq.userId === currentUserId}
                  rowNumber={numbersAssigned ? displayRow : undefined}
                  colNumber={numbersAssigned ? displayCol : undefined}
                  numbersAssigned={numbersAssigned}
                  canSelect={canSelect}
                  onSelect={() => handleSquareClick(physicalRow, physicalCol)}
                  index={displayRow * 10 + displayCol}
                />
              );
            })}
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
