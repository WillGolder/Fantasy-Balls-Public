"use client";

import { AllPlayRow } from "@/lib/data";
import { siteName } from "@/lib/owners";

function fmt(w: number, l: number, t: number) {
  return t ? `${w}-${l}-${t}` : `${w}-${l}`;
}

export function AllPlayTable({
  weeks,
  rows,
}: {
  weeks: number[];
  rows: AllPlayRow[];
}) {
  if (!weeks.length || !rows.length) {
    return (
      <p className="text-sm text-[var(--muted)]">
        No completed weeks in this archive yet.
      </p>
    );
  }

  return (
    <div className="card overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Team</th>
            <th>Owner</th>
            {weeks.map((w) => (
              <th key={w} className="num">
                {w}
              </th>
            ))}
            <th className="num">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.teamId}>
              <td className="font-medium">{r.teamName}</td>
              <td className="text-[var(--muted)]">{siteName(r.ownerName)}</td>
              {weeks.map((w) => {
                const c = r.weeks[w];
                return (
                  <td key={w} className="num tabular-nums">
                    {c ? fmt(c.wins, c.losses, c.ties) : "—"}
                  </td>
                );
              })}
              <td className="num tabular-nums font-semibold">
                {fmt(r.total.wins, r.total.losses, r.total.ties)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
