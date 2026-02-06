"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Grid from "@/components/Grid";
import PayoutDisplay from "@/components/PayoutDisplay";
import AdminPanel from "@/components/AdminPanel";
import { useGameSocket } from "@/hooks/useGameSocket";
import Link from "next/link";

type GameInfo = {
  id: number;
  code: string;
  name: string;
  price_per_square: number;
  payout_q1: number;
  payout_q2: number;
  payout_q3: number;
  payout_final: number;
  status: string;
  takenSquares: number;
  numbers_assigned: number;
  row_numbers: string | null;
  col_numbers: string | null;
  users?: Array<{
    id: number;
    name: string;
    squares_to_buy: number;
    selectedCount: number;
    picksSubmitted?: boolean;
  }>;
};

type Session = {
  userId: number;
  gameId: number;
  isAdmin: boolean;
  name: string;
  squaresToBuy?: number;
};

export default function GamePage() {
  const params = useParams();
  const code = (params.code as string)?.toUpperCase();
  const [session, setSession] = useState<Session | null>(null);
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [grid, setGrid] = useState<Record<string, { userId: number | null; userName: string | null }>>({});
  const [rowNumbers, setRowNumbers] = useState<number[] | null>(null);
  const [colNumbers, setColNumbers] = useState<number[] | null>(null);
  const [numbersAssigned, setNumbersAssigned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone");
  const [loginPhone, setLoginPhone] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginOtp, setLoginOtp] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchSquares = useCallback(async () => {
    if (!code) return;
    const res = await fetch(`/api/games/${code}/squares`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setGrid(data.grid);
    setRowNumbers(data.rowNumbers);
    setColNumbers(data.colNumbers);
    setNumbersAssigned(data.numbersAssigned);
  }, [code]);

  const fetchGameInfo = useCallback(async () => {
    if (!code) return;
    const res = await fetch(`/api/games/${code}/info`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setGameInfo(data);
  }, [code]);

  const refresh = useCallback(async () => {
    await Promise.all([fetchGameInfo(), fetchSquares()]);
  }, [fetchGameInfo, fetchSquares]);

  useEffect(() => {
    if (!code) return;
    const stored = localStorage.getItem(`game-${code}`);
    if (!stored) {
      setLoading(false);
      return;
    }
    try {
      setSession(JSON.parse(stored));
    } catch {
      setError("Invalid session");
      setLoading(false);
      return;
    }
    refresh().catch(() => setError("Failed to load game")).finally(() => setLoading(false));
  }, [code, refresh]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone.trim() || !loginOtp.trim()) return;
    setLoginLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/games/${code}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: loginPhone.trim(), otpCode: loginOtp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      const newSession: Session = {
        userId: data.userId,
        gameId: data.gameId,
        isAdmin: data.isAdmin,
        name: data.name,
        squaresToBuy: data.squaresToBuy,
      };
      localStorage.setItem(`game-${code}`, JSON.stringify(newSession));
      setSession(newSession);
      setShowLogin(false);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSendLoginOtp = async () => {
    if (!loginPhone.trim()) return;
    setLoginLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: loginPhone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send code");
      setShowLogin(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSendMagicLink = async () => {
    if (!loginEmail.trim()) return;
    setLoginLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/send-magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail.trim(), gameCode: code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send link");
      setMagicLinkSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send link");
    } finally {
      setLoginLoading(false);
    }
  };

  useGameSocket(code, refresh);

  useEffect(() => {
    if (!code || loading) return;
    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, [code, loading, refresh]);

  const handleSelectSquare = async (row: number, col: number) => {
    if (!session || !code) return;
    const sq = grid[`${row}-${col}`];
    const action = sq?.userId === session.userId ? "deselect" : "select";
    const res = await fetch(`/api/games/${code}/squares`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: session.userId, action, row, col }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to update square");
      return;
    }
    setError("");
    await fetchSquares();
    await fetchGameInfo();
  };

  const handleGameStarted = () => {
    fetchSquares();
    fetchGameInfo();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-[#013369] p-4 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#69BE28]/30 border-t-[#69BE28] rounded-full animate-spin" />
        <p className="text-slate-300 mt-4">Loading game...</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-[#013369] p-4 flex flex-col items-center justify-center">
        <div className="max-w-sm w-full space-y-4">
          <h2 className="text-xl font-bold text-white text-center" style={{ fontFamily: "var(--font-bebas), system-ui, sans-serif" }}>
            Log back in
          </h2>
          <p className="text-slate-300 text-sm text-center">
            Enter the phone or email you used when joining.
          </p>
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-2 rounded-xl text-sm">
              {error}
            </div>
          )}
          {magicLinkSent ? (
            <div className="space-y-4 text-center">
              <p className="text-slate-200">
                Check your email — we sent a link to {loginEmail}
              </p>
              <p className="text-slate-400 text-sm">
                Click the link in the email to log in. It expires in 1 hour.
              </p>
              <button
                type="button"
                onClick={() => { setMagicLinkSent(false); setError(""); }}
                className="text-slate-400 text-sm hover:text-white"
              >
                Use different email
              </button>
            </div>
          ) : !showLogin ? (
            <div className="space-y-4">
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setLoginMethod("phone")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    loginMethod === "phone"
                      ? "bg-[#69BE28] text-white"
                      : "bg-white/10 text-slate-300 hover:bg-white/20"
                  }`}
                >
                  Phone
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod("email")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    loginMethod === "email"
                      ? "bg-[#69BE28] text-white"
                      : "bg-white/10 text-slate-300 hover:bg-white/20"
                  }`}
                >
                  Email
                </button>
              </div>
              {loginMethod === "phone" ? (
                <>
                  <input
                    type="tel"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    placeholder="555-123-4567"
                    className="w-full px-4 py-3 rounded-xl border-2 border-white/20 bg-white/5 text-white placeholder-slate-400 focus:ring-2 focus:ring-[#69BE28] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleSendLoginOtp}
                    disabled={loginLoading || !loginPhone.trim()}
                    className="w-full py-4 bg-[#69BE28] text-white font-bold rounded-xl hover:bg-[#5aa823] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loginLoading ? "Sending..." : "Send code"}
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border-2 border-white/20 bg-white/5 text-white placeholder-slate-400 focus:ring-2 focus:ring-[#69BE28] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleSendMagicLink}
                    disabled={loginLoading || !loginEmail.trim()}
                    className="w-full py-4 bg-[#69BE28] text-white font-bold rounded-xl hover:bg-[#5aa823] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loginLoading ? "Sending..." : "Send magic link"}
                  </button>
                </>
              )}
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <p className="text-slate-200 text-sm text-center">
                Enter the 6-digit code sent to {loginPhone}
              </p>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={loginOtp}
                onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-full px-4 py-3 rounded-xl border-2 border-white/20 bg-white/5 text-white placeholder-slate-400 focus:ring-2 focus:ring-[#69BE28] focus:border-transparent text-center text-2xl tracking-widest"
                autoFocus
              />
              <button
                type="submit"
                disabled={loginLoading || loginOtp.length < 6}
                className="w-full py-4 bg-[#69BE28] text-white font-bold rounded-xl hover:bg-[#5aa823] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loginLoading ? "Verifying..." : "Log in"}
              </button>
              <button
                type="button"
                onClick={() => { setShowLogin(false); setLoginOtp(""); setError(""); }}
                className="w-full text-slate-400 text-sm hover:text-white"
              >
                Use different number
              </button>
            </form>
          )}
          <Link
            href={`/join/${code}`}
            className="block text-center text-[#69BE28] font-semibold underline underline-offset-2 text-sm"
          >
            Join as new player
          </Link>
        </div>
      </main>
    );
  }

  if (!session || !gameInfo) return null;

  const selectedCount =
    Object.values(grid).filter((s) => s.userId === session.userId).length;
  const squaresToBuy = session.squaresToBuy ?? 0;
  const currentUser = gameInfo.users?.find((u) => u.id === session.userId);
  const picksSubmitted = currentUser?.picksSubmitted ?? false;
  const canSelect =
    gameInfo.status === "pending" &&
    !session.isAdmin &&
    !picksSubmitted &&
    selectedCount < squaresToBuy;

  const handleSubmitPicks = async () => {
    if (!session || !code || picksSubmitted || selectedCount !== squaresToBuy) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/games/${code}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");
      await fetchGameInfo();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit picks");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-2 sm:px-4 pb-8 max-w-2xl mx-auto">
      <header className="mb-4">
        <h1
          className="text-2xl font-bold text-slate-900"
          style={{ fontFamily: "var(--font-bebas), system-ui, sans-serif" }}
        >
          {gameInfo.name}
        </h1>
        <p className="text-sm text-slate-600">
          {gameInfo.takenSquares}/100 squares • ${gameInfo.price_per_square.toFixed(2)}/square
        </p>
      </header>

      <PayoutDisplay
        payoutQ1={gameInfo.payout_q1}
        payoutQ2={gameInfo.payout_q2}
        payoutQ3={gameInfo.payout_q3}
        payoutFinal={gameInfo.payout_final}
      />

      {gameInfo.status === "pending" && !numbersAssigned && (
        <p className="text-sm text-slate-600 text-center py-2 px-4 bg-slate-100 rounded-lg my-3">
          Row and column numbers will be assigned once all players submit their picks.
        </p>
      )}

      {session.isAdmin && (
        <AdminPanel
          gameCode={code}
          gameInfo={gameInfo}
          adminId={session.userId}
          onGameStarted={handleGameStarted}
        />
      )}

      {!session.isAdmin && gameInfo.status === "pending" && (
        <div className="my-2 space-y-2">
          {picksSubmitted ? (
            <p className="text-sm text-center font-medium text-emerald-700 bg-emerald-50 py-2 px-4 rounded-lg">
              Picks submitted ✓
            </p>
          ) : (
            <>
              <p className="text-sm text-center font-medium text-slate-700">
                Selected {selectedCount} of {squaresToBuy} squares
              </p>
              {selectedCount === squaresToBuy && (
                <button
                  type="button"
                  onClick={handleSubmitPicks}
                  disabled={submitting}
                  className="w-full py-3 bg-[#69BE28] hover:bg-[#5aa823] text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    "Submit Picks"
                  )}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-700 px-4 py-2 rounded-xl text-sm my-2">
          {error}
        </div>
      )}

      <div className="mt-6">
        <Grid
          grid={grid}
          rowNumbers={rowNumbers}
          colNumbers={colNumbers}
          numbersAssigned={numbersAssigned}
          currentUserId={session.userId}
          squaresToBuy={squaresToBuy}
          selectedCount={selectedCount}
          canSelect={canSelect}
          onSelectSquare={handleSelectSquare}
        />
      </div>
    </main>
  );
}
