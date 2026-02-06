import CreateGameForm from "@/components/CreateGameForm";
import NFLShield from "@/components/NFLShield";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-[#013369] p-4 pb-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
      <div className="max-w-lg mx-auto relative z-10">
        <header className="text-center py-8">
          <div className="flex justify-center mb-4">
            <NFLShield size={72} animate />
          </div>
          <h1
            className="text-5xl sm:text-6xl font-bold tracking-tight text-white drop-shadow-lg"
            style={{ fontFamily: "var(--font-bebas), system-ui, sans-serif" }}
          >
            SUPER BOWL
          </h1>
          <h2
            className="text-4xl sm:text-5xl font-bold tracking-widest text-[#ffb81c] mt-1 drop-shadow"
            style={{ fontFamily: "var(--font-bebas), system-ui, sans-serif" }}
          >
            SQUARES
          </h2>
          <p className="text-slate-300 mt-4 text-sm">
            Create a game and share the link with friends
          </p>
        </header>

        <CreateGameForm />

        <p className="text-center text-sm text-slate-400 mt-8">
          Have a code?{" "}
          <Link
            href="/join"
            className="text-[#69BE28] font-semibold hover:text-[#69BE28]/90 underline underline-offset-2 transition-colors"
          >
            Join a game
          </Link>
        </p>
      </div>
    </main>
  );
}
