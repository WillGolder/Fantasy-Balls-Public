"use client";

import { SortableTable, Column } from "@/components/SortableTable";

export type CareerRow = {
  key: string;
  name: string;
  seasons: number;
  wins: number;
  losses: number;
  ties?: number;
  winPct: number;
  pointsFor: number;
  championships: number;
};

export function CareerRecordsTable({ rows }: { rows: CareerRow[] }) {
  const columns: Column<CareerRow>[] = [
    { key: "name", label: "Owner", sortValue: (r) => r.name, render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "seasons", label: "Seasons", align: "right", sortValue: (r) => r.seasons, render: (r) => r.seasons },
    { key: "w", label: "W", align: "right", sortValue: (r) => r.wins, render: (r) => r.wins },
    { key: "l", label: "L", align: "right", sortValue: (r) => r.losses, render: (r) => r.losses },
    { key: "pct", label: "Win %", align: "right", sortValue: (r) => r.winPct, render: (r) => `${r.winPct.toFixed(1)}%` },
    { key: "pf", label: "PF", align: "right", sortValue: (r) => r.pointsFor, render: (r) => (r.pointsFor > 0 ? r.pointsFor.toFixed(0) : "—") },
    { key: "titles", label: "Titles", align: "right", sortValue: (r) => r.championships, render: (r) => <span className="font-semibold text-[var(--gold)]">{r.championships}</span> },
  ];
  return (
    <SortableTable
      columns={columns}
      rows={rows}
      rowKey={(r) => r.key}
      defaultSortKey="w"
    />
  );
}
