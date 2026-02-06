"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import NFLShield from "@/components/NFLShield";

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length === 6) {
      router.push(`/join/${trimmed}`);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-[#013369] p-4 flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8"
        >
          <NFLShield size={56} />
          <h1
            className="text-3xl font-bold text-center mt-4 text-white"
            style={{ fontFamily: "var(--font-bebas), system-ui, sans-serif" }}
          >
            JOIN A GAME
          </h1>
        </motion.div>
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-200">
              Enter Game Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="ABC123"
              maxLength={6}
              className="w-full px-4 py-4 rounded-xl border-2 border-white/20 bg-white/5 text-white placeholder-slate-400 focus:ring-2 focus:ring-[#69BE28] focus:border-transparent text-center text-xl tracking-[0.3em] uppercase font-bold"
            />
          </div>
          <motion.button
            type="submit"
            disabled={code.trim().length !== 6}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-[#69BE28] text-white font-bold rounded-xl hover:bg-[#5aa823] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-[#69BE28]/30"
          >
            Continue
          </motion.button>
        </motion.form>
      </div>
    </main>
  );
}
