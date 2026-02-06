"use client";

import { motion } from "framer-motion";

interface NFLShieldProps {
  size?: number;
  animate?: boolean;
  className?: string;
}

export default function NFLShield({
  size = 48,
  animate = true,
  className = "",
}: NFLShieldProps) {
  return (
    <motion.div
      initial={animate ? { scale: 0, rotate: -10 } : false}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      whileHover={animate ? { scale: 1.08 } : undefined}
      className={`flex-shrink-0 ${className}`}
      style={{ width: size, height: size * 1.17 }}
    >
      <img
        src="/logos/nfl-shield.svg"
        alt="NFL"
        width={size}
        height={size * 1.17}
        className="drop-shadow-md w-full h-full object-contain"
      />
    </motion.div>
  );
}
