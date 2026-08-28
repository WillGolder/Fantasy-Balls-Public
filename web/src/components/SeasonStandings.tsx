"use client";

import type { SeasonData } from "@/lib/types";
import { ownerDisplayName, siteName } from "@/lib/owners";
import { SortableTable, Column } from "@/components/SortableTable";

type Props = {
  season: SeasonData;
};

type Row = {
  key: string;
  rank: number;
  teamName: string;
  owner: string;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  isChamp: boolean;
};

export function SeasonStandings({ season }: Props) {
  const teams = [...season.teams];
  const showPoints = teams.some((t) => t.points_for != null && t.points_for > 0);

  const rows: Row[] = teams.map((team, idx) => {
    const rank = team.final_standing ?? team.standing ?? idx + 1;
    return {
      key: String(team.team_id),
      rank,
      teamName: team.team_name,
      owner: siteName(ownerDisplayName(team)),
      wins: team.wins || 0,
      losses: team.losses || 0,
      ties: team.ties || 0,
      pointsFor: team.points_for || 0,
      pointsAgainst: team.points_against || 0,
      isChamp: rank === 1 && team.final_standing === 1,
    };
  });

  const columns: Column<Row>[] = [
    {
      key: "rank",
      label: "#",
      sortValue: (r) => r.rank,
      render: (r) => (
        <span className={r.isChamp ? "text-[var(--gold)] font-bold" : ""}>
          {r.rank}
        </span>
      ),
    },
    {
      key: "team",
      label: "Team",
      sortValue: (r) => r.teamName,
      render: (r) => (
        <span className={`font-medium ${r.isChamp ? "text-[var(--gold)]" : ""}`}>
          {r.teamName}
        </span>
      ),
    },
    {
      key: "owner",
      label: "Owner",
      sortValue: (r) => r.owner,
      render: (r) => <span className="text-[var(--muted)]">{r.owner}</span>,
    },
    {
      key: "w",
      label: "W",
      align: "right",
      sortValue: (r) => r.wins,
      render: (r) => r.wins,
    },
    {
      key: "l",
      label: "L",
      align: "right",
      sortValue: (r) => r.losses,
      render: (r) => r.losses,
    },
    {
      key: "t",
      label: "T",
      align: "right",
      sortValue: (r) => r.ties,
      render: (r) => r.ties,
    },
  ];

  if (showPoints) {
    columns.push(
      {
        key: "pf",
        label: "PF",
        align: "right",
        sortValue: (r) => r.pointsFor,
        render: (r) => (r.pointsFor ? r.pointsFor.toFixed(0) : "—"),
      },
      {
        key: "pa",
        label: "PA",
        align: "right",
        sortValue: (r) => r.pointsAgainst,
        render: (r) => (r.pointsAgainst ? r.pointsAgainst.toFixed(0) : "—"),
      }
    );
  }

  return (
    <SortableTable
      columns={columns}
      rows={rows}
      rowKey={(r) => r.key}
      defaultSortKey="rank"
      defaultSortDir="asc"
    />
  );
}
