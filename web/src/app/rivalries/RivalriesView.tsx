"use client";

import { useState } from "react";

type Tile = {
  name?: string | null;
  ownerA: string;
  ownerB: string;
  winsA: number;
  winsB: number;
  ties: number;
  totalGames: number;
  footballWinsA?: number;
  footballWinsB?: number;
  footballTies?: number;
  baseballWinsA?: number;
  baseballWinsB?: number;
  baseballTies?: number;
};

function TileCard({ r }: { r: Tile }) {
  const fb =
    (r.footballWinsA || 0) + (r.footballWinsB || 0) + (r.footballTies || 0) > 0
      ? `${r.footballWinsA}–${r.footballWinsB}${(r.footballTies || 0) ? `–${r.footballTies}` : ""}`
      : null;
  const bb =
    (r.baseballWinsA || 0) + (r.baseballWinsB || 0) + (r.baseballTies || 0) > 0
      ? `${r.baseballWinsA}–${r.baseballWinsB}${(r.baseballTies || 0) ? `–${r.baseballTies}` : ""}`
      : null;

  return (
    <div className="card p-4 space-y-2 h-full min-h-[10.5rem] flex flex-col">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--gold)] min-h-[1rem]">
        {r.name || " "}
      </p>
      <p className="font-bold text-sm leading-snug">
        {r.ownerA}{" "}
        <span className="text-[var(--muted)] font-normal">vs</span> {r.ownerB}
      </p>
      <p className="text-lg font-black tabular-nums text-[var(--gold)]">
        {r.winsA}–{r.winsB}
        {r.ties ? `–${r.ties}` : ""}
      </p>
      <p className="text-xs text-[var(--muted)]">{r.totalGames} games overall</p>
      <div className="text-xs text-[var(--muted)] space-y-0.5 mt-auto">
        {fb && <p>Football: {fb}</p>}
        {bb && <p>Baseball: {bb}</p>}
      </div>
    </div>
  );
}

export function RivalriesView({
  mostGames,
  closest,
  mostGamesAll,
  closestAll,
}: {
  mostGames: Tile[];
  closest: Tile[];
  mostGamesAll: Tile[];
  closestAll: Tile[];
}) {
  const [expanded, setExpanded] = useState(false);
  const left = expanded ? mostGamesAll.slice(0, 12) : mostGames;
  const right = expanded ? closestAll.slice(0, 12) : closest;
  const rows = Math.max(left.length, right.length);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <h2 className="section-title">Most <span>Games</span></h2>
        <h2 className="section-title">Closest <span>Series</span></h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: rows }).flatMap((_, i) => [
          left[i] ? (
            <TileCard key={`l-${i}`} r={left[i]} />
          ) : (
            <div key={`l-empty-${i}`} />
          ),
          right[i] ? (
            <TileCard key={`r-${i}`} r={right[i]} />
          ) : (
            <div key={`r-empty-${i}`} />
          ),
        ])}
      </div>
      <div className="text-center">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-sm font-semibold text-[var(--gold)] hover:underline"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      </div>
    </div>
  );
}
