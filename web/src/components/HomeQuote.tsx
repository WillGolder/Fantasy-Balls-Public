"use client";

import { useEffect, useState } from "react";

type Quote = { text: string; by: string };

export function HomeQuote({ quotes }: { quotes: Quote[] }) {
  const [q, setQ] = useState<Quote | null>(null);

  useEffect(() => {
    if (!quotes.length) return;
    const pick = quotes[Math.floor(Math.random() * quotes.length)];
    setQ(pick);
  }, [quotes]);

  if (!q) return null;

  return (
    <section className="section-band px-4 py-4 border-b border-[#2a2834]">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[var(--gold)] mb-1">
          From the Group Chat
        </p>
        <p className="text-base sm:text-lg font-medium leading-snug">
          “{q.text}”
        </p>
        {q.by && (
          <p className="text-sm text-[var(--muted)] mt-1">— {q.by}</p>
        )}
      </div>
    </section>
  );
}
