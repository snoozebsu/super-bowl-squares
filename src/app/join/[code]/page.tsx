"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import QuantitySelector from "@/components/QuantitySelector";
import Link from "next/link";

export default function JoinGamePage() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string)?.toUpperCase();
  const [game, setGame] = useState<{
    name: string;
    price_per_square: number;
    availableSquares: number;
    status: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"name" | "quantity" | "otp">("name");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false);

  useEffect(() => {
    if (!code) return;
    fetch(`/api/games/${code}/info`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setGame(null);
        } else {
          setGame(data);
          if (data.status !== "pending") {
            setError("This game has already started");
          }
        }
      })
      .catch(() => setError("Failed to load game"))
      .finally(() => setLoading(false));
  }, [code]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) setStep("quantity");
  };

  const doJoin = async (squaresToBuy: number, phoneValue?: string, otpValue?: string, emailValue?: string) => {
    const body: Record<string, unknown> = { name: name.trim(), squaresToBuy };
    if (phoneValue && otpValue) {
      body.phone = phoneValue;
      body.otpCode = otpValue;
    }
    if (emailValue) body.email = emailValue;
    const res = await fetch(`/api/games/${code}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to join");

    localStorage.setItem(
      `game-${code}`,
      JSON.stringify({
        userId: data.userId,
        gameId: data.gameId,
        isAdmin: false,
        name: name.trim(),
        squaresToBuy,
      })
    );
    router.push(`/game/${code}`);
  };

  const handleJoinComplete = async (squaresToBuy: number) => {
    try {
      setError("");
      const phoneTrimmed = phone.trim();
      if (phoneTrimmed) {
        setSendingOtp(true);
        const res = await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: phoneTrimmed }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to send code");
        setQuantity(squaresToBuy);
        setStep("otp");
      } else {
        await doJoin(squaresToBuy, undefined, undefined, email.trim() || undefined);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) return;
    try {
      setError("");
      await doJoin(quantity, phone.trim(), otpCode.trim(), email.trim() || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-[#013369] p-4 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#69BE28]/30 border-t-[#69BE28] rounded-full animate-spin" />
        <p className="text-slate-300 mt-4">Loading...</p>
      </main>
    );
  }

  if (error && !game) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-[#013369] p-4 flex flex-col items-center justify-center">
        <p className="text-red-400 mb-4">{error}</p>
        <Link href="/join" className="text-[#69BE28] font-semibold underline underline-offset-2">
          Try another code
        </Link>
      </main>
    );
  }

  if (!game) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-[#013369] p-4 pb-8">
      <div className="max-w-md mx-auto">
        <h1
          className="text-2xl font-bold text-center mb-2 text-white"
          style={{ fontFamily: "var(--font-bebas), system-ui, sans-serif" }}
        >
          {game.name}
        </h1>
        <p className="text-center text-slate-300 mb-6">
          ${game.price_per_square.toFixed(2)} per square • {game.availableSquares}{" "}
          squares available
        </p>

        {step === "name" ? (
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-200">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-xl border-2 border-white/20 bg-white/5 text-white placeholder-slate-400 focus:ring-2 focus:ring-[#69BE28] focus:border-transparent"
                required
              />
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-[#69BE28] text-white font-bold rounded-xl hover:bg-[#5aa823] transition-colors shadow-lg"
            >
              Continue
            </motion.button>
          </form>
        ) : step === "otp" ? (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-2 rounded-xl text-sm">
                {error}
              </div>
            )}
            <p className="text-slate-200 text-sm">
              Enter the 6-digit code sent to {phone}
            </p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="w-full px-4 py-3 rounded-xl border-2 border-white/20 bg-white/5 text-white placeholder-slate-400 focus:ring-2 focus:ring-[#69BE28] focus:border-transparent text-center text-2xl tracking-widest"
              autoFocus
            />
            <motion.button
              type="submit"
              disabled={otpCode.length < 6}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-[#69BE28] text-white font-bold rounded-xl hover:bg-[#5aa823] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
            >
              Verify & Join
            </motion.button>
          </form>
        ) : (
          <>
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-2 rounded-xl text-sm mb-4">
                {error}
              </div>
            )}
            <QuantitySelector
              pricePerSquare={game.price_per_square}
              maxSquares={Math.min(100, game.availableSquares)}
              onContinue={handleJoinComplete}
            />
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-200">
                  Phone (optional, for login recovery)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="555-123-4567"
                  className="w-full px-4 py-3 rounded-xl border-2 border-white/20 bg-white/5 text-white placeholder-slate-400 focus:ring-2 focus:ring-[#69BE28] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-200">
                  Email (optional, for login recovery)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border-2 border-white/20 bg-white/5 text-white placeholder-slate-400 focus:ring-2 focus:ring-[#69BE28] focus:border-transparent"
                />
              </div>
              {sendingOtp && (
                <p className="text-slate-400 text-sm">Sending code...</p>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
