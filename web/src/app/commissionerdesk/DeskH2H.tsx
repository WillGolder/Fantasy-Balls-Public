"use client";

import { useMemo, useState } from "react";
import type { H2HDetailed } from "@/lib/data";
import { siteName } from "@/lib/owners";

export function DeskH2H({
  rows,
  active,
}: {
  rows: H2HDetailed[];
  active?: string[];
}) {
  const [open, setOpen] = useState<string | null>(null);
  const names = useMemo(() => {
    const s = new Set<string>();
    for (const r of rows) {
      s.add(r.ownerA);
      s.add(r.ownerB);
    }
    let list = [...s].sort((a, b) => siteName(a).localeCompare(siteName(b)));
    if (active?.length) {
      const set = new Set(active);
      list = list.filter((n) => set.has(n));
    }
    return list;
  }, [rows, active]);

  return (
    <div className="space-y-2">
      <p className="text-sm text-[var(--muted)]">
        Click a name to expand their full head-to-head. Click again to close.
      </p>
      {names.map((name) => {
        const mine = rows
          .filter((r) => r.ownerA === name || r.ownerB === name)
          .map((r) => {
            const opp = r.ownerA === name ? r.ownerB : r.ownerA;
            const wins = r.ownerA === name ? r.winsA : r.winsB;
            const losses = r.ownerA === name ? r.winsB : r.winsA;
            const fbW = r.ownerA === name ? r.footballWinsA : r.footballWinsB;
            const fbL = r.ownerA === name ? r.footballWinsB : r.footballWinsA;
            const bbW = r.ownerA === name ? r.baseballWinsA : r.baseballWinsB;
            const bbL = r.ownerA === name ? r.baseballWinsB : r.baseballWinsA;
            return {
              opp,
              wins,
              losses,
              ties: r.ties,
              games: r.totalGames,
              fbW,
              fbL,
              bbW,
              bbL,
            };
          })
          .sort((a, b) => siteName(a.opp).localeCompare(siteName(b.opp)));
        const isOpen = open === name;
        return (
          <div key={name} className="card overflow-hidden">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : name)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5"
            >
              <span className="font-black">{siteName(name)}</span>
              <span className="text-xs text-[var(--muted)]">
                {mine.length} opponents · {isOpen ? "hide" : "show"}
              </span>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 overflow-x-auto border-t border-[#2a2834]">
                <table className="data-table mt-2">
                  <thead>
                    <tr>
                      <th>Opponent</th>
                      <th className="num">Games</th>
                      <th className="num">{siteName(name)}–them</th>
                      <th className="num">Football</th>
                      <th className="num">Baseball</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mine.map((r) => (
                      <tr key={r.opp}>
                        <td>{siteName(r.opp)}</td>
                        <td className="num">{r.games}</td>
                        <td className="num">
                          {r.wins}–{r.losses}
                          {r.ties ? `–${r.ties}` : ""}
                        </td>
                        <td className="num">
                          {r.fbW}–{r.fbL}
                        </td>
                        <td className="num">
                          {r.bbW}–{r.bbL}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
