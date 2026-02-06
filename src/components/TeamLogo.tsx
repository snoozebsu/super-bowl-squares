"use client";

import { motion } from "framer-motion";

const LOGOS = {
  seahawks: {
    src: "https://a.espncdn.com/i/teamlogos/nfl/500/sea.png",
    fallback: "/logos/seahawks.svg",
    colors: { primary: "#002244", accent: "#69BE28" },
  },
  patriots: {
    src: "https://a.espncdn.com/i/teamlogos/nfl/500/ne.png",
    fallback: "/logos/patriots.svg",
    colors: { primary: "#002244", accent: "#C60C30" },
  },
} as const;

interface TeamLogoProps {
  team: "seahawks" | "patriots";
  size?: "sm" | "md" | "lg" | "xl";
  animate?: boolean;
  className?: string;
}

const sizes = { sm: 32, md: 48, lg: 64, xl: 80 };

export default function TeamLogo({
  team,
  size = "md",
  animate = true,
  className = "",
}: TeamLogoProps) {
  const { src, fallback } = LOGOS[team];
  const px = sizes[size];

  return (
    <motion.div
      initial={animate ? { scale: 0, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      whileHover={animate ? { scale: 1.05, rotate: 2 } : undefined}
      className={`relative overflow-hidden rounded-full bg-white shadow-lg ring-2 ring-gray-200 flex-shrink-0 ${className}`}
      style={{ width: px, height: px }}
    >
      <img
        src={src}
        alt={team}
        width={px}
        height={px}
        className="object-contain p-0.5"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (target.src !== fallback) target.src = fallback;
        }}
      />
    </motion.div>
  );
}
