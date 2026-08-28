"use client";

import { SortableTable, Column } from "@/components/SortableTable";

type LastRow = {
  key: string;
  year: number;
  sport: string;
  teamName: string;
  ownerName: string;
  pointsFor: number | null;
};

export function WallOfShameTables({
  lastRows,
  mostLast,
  leastPf,
}: {
  lastRows: LastRow[];
  mostLast: { name: string; value: number }[];
  leastPf: { key: string; name: string; pointsFor: number; seasons: number }[];
}) {
  const lastCols: Column<LastRow>[] = [
    { key: "year", label: "Year", sortValue: (r) => r.year, render: (r) => <span className="font-bold">{r.year}</span> },
    { key: "sport", label: "Sport", sortValue: (r) => r.sport, render: (r) => r.sport },
    { key: "team", label: "Team", sortValue: (r) => r.teamName, render: (r) => <span className="font-medium">{r.teamName}</span> },
    { key: "owner", label: "Owner", sortValue: (r) => r.ownerName, render: (r) => <span className="text-[var(--muted)]">{r.ownerName}</span> },
    {
      key: "pf",
      label: "PF",
      align: "right",
      sortValue: (r) => r.pointsFor ?? 0,
      render: (r) => (r.pointsFor != null ? r.pointsFor.toFixed(0) : "—"),
    },
  ];

  const mostCols: Column<{ name: string; value: number }>[] = [
    { key: "name", label: "Owner", sortValue: (r) => r.name, render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "value", label: "Last-place finishes", align: "right", sortValue: (r) => r.value, render: (r) => <span className="font-bold">{r.value}</span> },
  ];

  const leastCols: Column<{ key: string; name: string; pointsFor: number; seasons: number }>[] = [
    { key: "name", label: "Owner", sortValue: (r) => r.name, render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "pf", label: "PF", align: "right", sortValue: (r) => r.pointsFor, render: (r) => r.pointsFor.toFixed(0) },
    { key: "seasons", label: "Seasons", align: "right", sortValue: (r) => r.seasons, render: (r) => <span className="text-[var(--muted)]">{r.seasons}</span> },
  ];

  return (
    <>
      <section className="space-y-3">
        <h2 className="section-title">
          Year-by-Year <span>Last Place</span>
        </h2>
        <SortableTable columns={lastCols} rows={lastRows} rowKey={(r) => r.key} defaultSortKey="year" defaultSortDir="desc" />
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="space-y-3">
          <h2 className="section-title">
            Most Times <span>Last</span>
          </h2>
          <SortableTable columns={mostCols} rows={mostLast} rowKey={(r) => r.name} defaultSortKey="value" />
        </section>
        <section className="space-y-3">
          <h2 className="section-title">
            Least <span>Points</span> (career)
          </h2>
          <SortableTable columns={leastCols} rows={leastPf} rowKey={(r) => r.key} defaultSortKey="pf" defaultSortDir="asc" />
        </section>
      </div>
    </>
  );
}
