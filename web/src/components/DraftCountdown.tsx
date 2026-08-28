"use client";

import { useEffect, useState } from "react";

export function DraftCountdown({ targetIso }: { targetIso: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) {
    return <p className="text-2xl font-black text-[var(--gold)]">Loading…</p>;
  }

  const target = new Date(targetIso).getTime();
  const diff = target - now;

  if (diff <= 0) {
    return (
      <p className="text-2xl font-black text-[var(--gold)]">Draft time — or it&apos;s underway</p>
    );
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  return (
    <p className="text-3xl sm:text-4xl font-black text-[var(--gold)] tabular-nums tracking-tight">
      {days}d {hours}h {mins}m {secs}s
    </p>
  );
}
