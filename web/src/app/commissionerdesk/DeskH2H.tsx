"use client";

import { useMemo, useState } from "react";
import type { H2HDetailed } from "@/lib/data";
import { siteName } from "@/lib/owners";

export function DeskH2H({ rows }: { rows: H2HDetailed[] }) {
  const [q, setQ] = useState("");
  const names = useMemo(() => {
    const s = new Set<string>();
    for (const r of rows) {
      s.add(r.ownerA);
      s.add(r.ownerB);
    }
    return [...s].sort((a, b) => siteName(a).localeCompare(siteName(b)));
  }, [rows]);

  const filtered = rows
    .filter((r) => {
      if (!q) return true;
      const n = q.toLowerCase();
      return (
        r.ownerA.toLowerCase().includes(n) ||
        r.ownerB.toLowerCase().includes(n) ||
        siteName(r.ownerA).toLowerCase().includes(n) ||
        siteName(r.ownerB).toLowerCase().includes(n)
      );
    })
    .sort((a, b) => b.totalGames - a.totalGames);

  return (
    <div className="space-y-3">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Filter owner…"
        className="w-full sm:w-72 rounded-md bg-[#121018] border border-[#2a2834] px-3 py-2 text-sm"
        list="desk-owners"
      />
      <datalist id="desk-owners">
        {names.map((n) => (
          <option key={n} value={siteName(n)} />
        ))}
      </datalist>
      <div className="card overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>A</th>
              <th>B</th>
              <th className="num">Games</th>
              <th className="num">A-B</th>
              <th className="num">FB</th>
              <th className="num">BB</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={`${r.ownerA}__${r.ownerB}`}>
                <td>{siteName(r.ownerA)}</td>
                <td>{siteName(r.ownerB)}</td>
                <td className="num">{r.totalGames}</td>
                <td className="num">
                  {r.winsA}–{r.winsB}
                  {r.ties ? `–${r.ties}` : ""}
                </td>
                <td className="num">
                  {r.footballWinsA}–{r.footballWinsB}
                </td>
                <td className="num">
                  {r.baseballWinsA}–{r.baseballWinsB}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
