"use client";

import { SortableTable, Column } from "@/components/SortableTable";

export type AdvancedRow = {
  teamId: number;
  teamName: string;
  ownerName: string;
  ppg: number;
  papg: number;
  diff: number;
  bestWeek: number | null;
  worstWeek: number | null;
  longestWinStreak: number;
  longestLossStreak: number;
  sos: number;
  closeWins: number;
  closeLosses: number;
};

export function SeasonAdvancedTable({ rows }: { rows: AdvancedRow[] }) {
  const columns: Column<AdvancedRow>[] = [
    {
      key: "team",
      label: "Team",
      sortValue: (r) => r.teamName,
      render: (r) => <span className="font-medium">{r.teamName}</span>,
    },
    {
      key: "owner",
      label: "Owner",
      sortValue: (r) => r.ownerName,
      render: (r) => <span className="text-[var(--muted)]">{r.ownerName}</span>,
    },
    {
      key: "ppg",
      label: "PPG",
      align: "right",
      sortValue: (r) => r.ppg,
      render: (r) => r.ppg.toFixed(1),
    },
    {
      key: "papg",
      label: "PAPG",
      align: "right",
      sortValue: (r) => r.papg,
      render: (r) => r.papg.toFixed(1),
    },
    {
      key: "diff",
      label: "Diff",
      align: "right",
      sortValue: (r) => r.diff,
      render: (r) => r.diff.toFixed(0),
    },
    {
      key: "best",
      label: "Best",
      align: "right",
      sortValue: (r) => r.bestWeek ?? -1,
      render: (r) => r.bestWeek?.toFixed(0) ?? "—",
    },
    {
      key: "worst",
      label: "Worst",
      align: "right",
      sortValue: (r) => r.worstWeek ?? -1,
      render: (r) => r.worstWeek?.toFixed(0) ?? "—",
    },
    {
      key: "wstreak",
      label: "W Streak",
      align: "right",
      sortValue: (r) => r.longestWinStreak,
      render: (r) => r.longestWinStreak,
    },
    {
      key: "lstreak",
      label: "L Streak",
      align: "right",
      sortValue: (r) => r.longestLossStreak,
      render: (r) => r.longestLossStreak,
    },
    {
      key: "sos",
      label: "SoS",
      align: "right",
      sortValue: (r) => r.sos,
      render: (r) => `${(r.sos * 100).toFixed(0)}%`,
    },
    {
      key: "close",
      label: "Close W-L",
      align: "right",
      sortValue: (r) => r.closeWins - r.closeLosses,
      render: (r) => `${r.closeWins}–${r.closeLosses}`,
    },
  ];

  return (
    <SortableTable
      columns={columns}
      rows={rows}
      rowKey={(r) => String(r.teamId)}
      defaultSortKey="ppg"
      defaultSortDir="desc"
    />
  );
}
