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
  const [q, setQ] = useState("");
  const names = useMemo(() => {
    const s = new Set<string>();
    for (const r of rows) {
      s.add(r.ownerA);
      s.add(r.ownerB);
    }
    return [...s].sort((a, b) => siteName(a).localeCompare(siteName(b)));
  }, [rows]);

  const focus = names.filter((n) => {
    if (active?.length && !active.includes(n)) return false;
    if (!q) return true;
    const needle = q.toLowerCase();
    return n.toLowerCase().includes(needle) || siteName(n).toLowerCase().includes(needle);
  });

  return (
    <div className="space-y-6">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Jump to an owner…"
        className="w-full sm:w-72 rounded-md bg-[#121018] border border-[#2a2834] px-3 py-2 text-sm"
        list="desk-owners"
      />
      <datalist id="desk-owners">
        {names.map((n) => (
          <option key={n} value={siteName(n)} />
        ))}
      </datalist>
      {focus.map((name) => {
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
            return { opp, wins, losses, ties: r.ties, games: r.totalGames, fbW, fbL, bbW, bbL };
          })
          .sort((a, b) => siteName(a.opp).localeCompare(siteName(b.opp)));
        return (
          <div key={name} className="card p-5 space-y-2">
            <h3 className="text-lg font-black">{siteName(name)}</h3>
            <table className="data-table">
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
        );
      })}
    </div>
  );
}
