import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EMG Field Ops | Area Intelligence",
  description: "Sales territory intelligence for field representatives. Track areas, view rankings, and dominate your territory.",
  keywords: ["EMG", "field ops", "sales territory", "leaderboard", "community solar"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <nav className="px-6 py-3 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 text-white flex items-center justify-between border-b border-gray-800/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚡</span>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">EMG Field Ops</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/" className="text-sm text-gray-400 hover:text-white transition-colors font-medium">Map</a>
            <a href="/leaderboard" className="text-sm text-gray-400 hover:text-white transition-colors font-medium">Leaderboard</a>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
