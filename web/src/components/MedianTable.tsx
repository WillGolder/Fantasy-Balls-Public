"use client";

import { MedianRow } from "@/lib/data";
import { siteName } from "@/lib/owners";

export function MedianTable({
  weeks,
  rows,
  lines,
}: {
  weeks: number[];
  rows: MedianRow[];
  lines: Record<number, number>;
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
              {weeks.map((w) => (
                <td key={w} className="num tabular-nums">
                  {r.weeks[w] ?? "—"}
                </td>
              ))}
              <td className="num tabular-nums font-semibold">
                {r.wins}-{r.losses}
                {r.ties ? `-${r.ties}` : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[0.65rem] text-[var(--muted)] px-3 pb-2">
        Line is the midpoint of 5th and 6th (even leagues) or the middle score (odd).
        {weeks.length === 1 && lines[weeks[0]] != null
          ? ` Week ${weeks[0]} line: ${lines[weeks[0]].toFixed(2)}`
          : ""}
      </p>
    </div>
  );
}
