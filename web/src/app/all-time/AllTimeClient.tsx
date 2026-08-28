"use client";

import { SortableTable, Column } from "@/components/SortableTable";

type Standing = {
  key: string;
  name: string;
  seasons: number;
  wins: number;
  losses: number;
  ties: number;
  winPct: number;
  pointsFor: number;
  pointsAgainst: number;
  diff: number;
  titles: number;
  divisions: number;
};

type Props = {
  standings: Standing[];
  names: string[];
  recordMap: Record<string, { wa: number; wb: number; ties: number }>;
};

export function AllTimeClient({ standings, names, recordMap }: Props) {
  const columns: Column<Standing>[] = [
    {
      key: "name",
      label: "Manager",
      sortValue: (r) => r.name,
      render: (r) => <span className="font-medium">{r.name}</span>,
    },
    {
      key: "seasons",
      label: "Seasons",
      align: "right",
      sortValue: (r) => r.seasons,
      render: (r) => r.seasons,
    },
    {
      key: "wins",
      label: "W",
      align: "right",
      sortValue: (r) => r.wins,
      render: (r) => r.wins,
    },
    {
      key: "losses",
      label: "L",
      align: "right",
      sortValue: (r) => r.losses,
      render: (r) => r.losses,
    },
    {
      key: "winPct",
      label: "Win %",
      align: "right",
      sortValue: (r) => r.winPct,
      render: (r) => `${(r.winPct * 100).toFixed(1)}%`,
    },
    {
      key: "pf",
      label: "PF",
      align: "right",
      sortValue: (r) => r.pointsFor,
      render: (r) => (r.pointsFor > 0 ? r.pointsFor.toFixed(0) : "—"),
    },
    {
      key: "pa",
      label: "PA",
      align: "right",
      sortValue: (r) => r.pointsAgainst,
      render: (r) => (r.pointsAgainst > 0 ? r.pointsAgainst.toFixed(0) : "—"),
    },
    {
      key: "diff",
      label: "Diff",
      align: "right",
      sortValue: (r) => r.diff,
      render: (r) =>
        r.pointsFor > 0 || r.pointsAgainst > 0 ? r.diff.toFixed(0) : "—",
    },
    {
      key: "titles",
      label: "Titles",
      align: "right",
      sortValue: (r) => r.titles,
      render: (r) => (
        <span className="font-bold text-[var(--gold)]">{r.titles}</span>
      ),
    },
    {
      key: "divisions",
      label: "Divisions",
      align: "right",
      sortValue: (r) => r.divisions,
      render: (r) => r.divisions,
    },
  ];

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h2 className="section-title">
          All-Time <span>Standings</span>
        </h2>
        <SortableTable
          columns={columns}
          rows={standings}
          rowKey={(r) => r.key}
          defaultSortKey="wins"
          defaultSortDir="desc"
        />
      </section>

      <section className="space-y-3">
        <h2 className="section-title">
          Head-to-Head <span>Matrix</span>
        </h2>
        <p className="text-xs text-[var(--muted)]">
          Row vs column. <span className="text-[var(--gold)] font-semibold">Gold</span> =
          row owner leads the series.
        </p>
        <div className="card overflow-x-auto max-h-[36rem] overflow-y-auto">
          <table className="h2h-matrix">
            <thead>
              <tr>
                <th className="corner">Manager</th>
                {names.map((n) => (
                  <th key={n} title={n}>
                    {n.split(" ")[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {names.map((rowName) => (
                <tr key={rowName}>
                  <th className="row-head" title={rowName}>
                    {rowName}
                  </th>
                  {names.map((colName) => {
                    if (rowName === colName) {
                      return (
                        <td key={colName} className="diag">
                          —
                        </td>
                      );
                    }
                    const rec = recordMap[`${rowName}__${colName}`];
                    if (!rec || rec.wa + rec.wb + rec.ties === 0) {
                      return (
                        <td key={colName} className="trail">
                          —
                        </td>
                      );
                    }
                    const label = `${rec.wa}–${rec.wb}${
                      rec.ties ? `–${rec.ties}` : ""
                    }`;
                    let cls = "tie";
                    if (rec.wa > rec.wb) cls = "lead";
                    else if (rec.wa < rec.wb) cls = "trail";
                    return (
                      <td key={colName} className={cls} title={`${rowName} vs ${colName}`}>
                        {label}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
