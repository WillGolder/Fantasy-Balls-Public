"use client";

import { SortableTable, Column } from "@/components/SortableTable";

export type CellRow = Record<string, string | number | null | undefined>;

export function GenericSortable({
  columns,
  rows,
  defaultSortKey,
}: {
  columns: { key: string; label: string; align?: "left" | "right"; gold?: boolean }[];
  rows: CellRow[];
  defaultSortKey?: string;
}) {
  const cols: Column<CellRow>[] = columns.map((c) => ({
    key: c.key,
    label: c.label,
    align: c.align || "left",
    sortValue: (r) => r[c.key] ?? "",
    render: (r) => (
      <span className={c.gold ? "font-semibold text-[var(--gold)]" : undefined}>
        {r[c.key] ?? "—"}
      </span>
    ),
  }));
  return (
    <SortableTable
      columns={cols}
      rows={rows}
      rowKey={(row, i) => String(row.key ?? row.name ?? row.ownerName ?? i)}
      defaultSortKey={defaultSortKey || columns[0]?.key}
    />
  );
}
