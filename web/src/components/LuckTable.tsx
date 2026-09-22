"use client";

import { LuckRow } from "@/lib/desk";
import { siteName } from "@/lib/owners";

export function LuckTable({ rows }: { rows: LuckRow[] }) {
  if (!rows.length) {
    return <p className="text-sm text-[var(--muted)]">No luck sample yet.</p>;
  }
  return (
    <div className="card overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Owner</th>
            <th className="num">Record</th>
            <th className="num">All-play</th>
            <th className="num">Exp W</th>
            <th className="num">Luck</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.ownerName}>
              <td>{siteName(r.ownerName)}</td>
              <td className="num">
                {r.wins}-{r.losses}
              </td>
              <td className="num">
                {r.allPlayW}-{r.allPlayL}
              </td>
              <td className="num">{r.expectedWins.toFixed(2)}</td>
              <td className="num">
                {r.luck >= 0 ? "+" : ""}
                {r.luck.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
