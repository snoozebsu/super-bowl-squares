"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setError("Invalid link");
      return;
    }

    fetch("/api/auth/verify-magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Verification failed");

        const session = {
          userId: data.userId,
          gameId: data.gameId,
          isAdmin: data.isAdmin,
          name: data.name,
          squaresToBuy: data.squaresToBuy,
        };
        localStorage.setItem(`game-${data.gameCode}`, JSON.stringify(session));
        setStatus("success");
        router.replace(`/game/${data.gameCode}`);
      })
      .catch((err) => {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Verification failed");
      });
  }, [searchParams, router]);

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-[#013369] p-4 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#69BE28]/30 border-t-[#69BE28] rounded-full animate-spin" />
        <p className="text-slate-300 mt-4">Logging you in...</p>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-[#013369] p-4 flex flex-col items-center justify-center">
        <p className="text-red-400 mb-4 text-center">{error}</p>
        <p className="text-slate-300 text-sm text-center">
          The link may have expired. Request a new one from the game page.
        </p>
      </main>
    );
  }

  return null;
}

export default function VerifyMagicLinkPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-[#013369] p-4 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#69BE28]/30 border-t-[#69BE28] rounded-full animate-spin" />
          <p className="text-slate-300 mt-4">Loading...</p>
        </main>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
