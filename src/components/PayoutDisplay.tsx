"use client";

import { motion } from "framer-motion";

interface PayoutDisplayProps {
  payoutQ1: number;
  payoutQ2: number;
  payoutQ3: number;
  payoutFinal: number;
}

const payouts = [
  { label: "Q1", key: "q1" },
  { label: "Halftime", key: "halftime" },
  { label: "Q3", key: "q3" },
  { label: "Final", key: "final" },
] as const;

export default function PayoutDisplay({
  payoutQ1,
  payoutQ2,
  payoutQ3,
  payoutFinal,
}: PayoutDisplayProps) {
  const values = [payoutQ1, payoutQ2, payoutQ3, payoutFinal];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 sm:grid-cols-4 gap-2"
    >
      {payouts.map(({ label }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white rounded-xl border-2 border-slate-200 p-3 text-center shadow-sm hover:shadow-md hover:border-[#69BE28]/30 transition-all"
        >
          <p className="text-xs text-slate-500 font-medium">{label}</p>
          <p className="font-bold text-[#69BE28] text-lg">${values[i].toFixed(0)}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
