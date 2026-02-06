import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import { SocketProvider } from "@/contexts/SocketContext";

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Super Bowl Squares",
  description: "Play Super Bowl squares with friends",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${bebasNeue.variable} ${inter.variable}`}>
      <body className="antialiased bg-slate-50" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
        <SocketProvider>{children}</SocketProvider>
      </body>
    </html>
  );
}
