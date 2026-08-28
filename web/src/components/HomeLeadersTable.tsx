"use client";

import { SortableTable, Column } from "@/components/SortableTable";

type Row = { key: string; name: string; wins: number; titles: number };

export function HomeLeadersTable({ rows }: { rows: Row[] }) {
  const columns: Column<Row>[] = [
    { key: "name", label: "Manager", sortValue: (r) => r.name, render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "w", label: "W", align: "right", sortValue: (r) => r.wins, render: (r) => r.wins },
    { key: "titles", label: "Titles", align: "right", sortValue: (r) => r.titles, render: (r) => <span className="font-bold text-[var(--gold)]">{r.titles}</span> },
  ];
  return <SortableTable columns={columns} rows={rows} rowKey={(r) => r.key} defaultSortKey="w" />;
}
