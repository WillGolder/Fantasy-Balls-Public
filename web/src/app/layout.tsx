import type { Metadata } from "next";
import { Geist, Geist_Mono, Great_Vibes, Cinzel } from "next/font/google";
import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const greatVibes = Great_Vibes({
  weight: "400",
  variable: "--font-script",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  weight: ["600", "700", "800"],
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fantasy Balls League",
  description:
    "Official home of Fantasy Balls — Football & Baseball league history, records, trophies, and constitution",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${greatVibes.variable} ${cinzel.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-glow text-[var(--foreground)]">
        <header className="sticky top-0 z-[100] border-b border-[#2a2834] bg-black backdrop-blur-md">
          <div className="mx-auto max-w-6xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-2 font-black text-lg tracking-tight text-[var(--gold)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/art/crest.png" alt="" className="h-8 w-8 object-contain" />
              FANTASY BALLS
            </Link>
            <SiteNav />
          </div>
        </header>

        <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6">
          {children}
        </main>

        <footer className="border-t border-[#2a2834] py-6 text-center text-xs text-[var(--muted)]">
          <p className="font-semibold text-[var(--gold)] tracking-wide">
            FANTASY BALLS
          </p>
          <p className="mt-1">Est. 2022 · Football · Baseball</p>
        </footer>
      </body>
    </html>
  );
}
