"use client";

import { GenericSortable } from "@/components/GenericSortable";

type Champ = {
  year: number;
  sport: string;
  champion: string;
  championOwner: string;
  runnerUp: string;
  runnerUpOwner: string;
};
type Career = {
  key: string;
  displayName: string;
  seasons: number;
  wins: number;
  losses: number;
  winPct: string;
  pf: string;
  pa: string;
  championships: number;
  footballChampionships: number;
  baseballChampionships: number;
  pointsFor: number;
};
type H2H = { ownerA: string; ownerB: string; record: string; totalGames: number };

export function OverallView({
  championships,
  career,
  byTitles,
  byPoints,
  h2h,
}: {
  championships: Champ[];
  career: Career[];
  byTitles: { displayName: string; championships: number }[];
  byPoints: { displayName: string; pf: string }[];
  h2h: H2H[];
}) {
  return (
    <>
      <section className="space-y-4">
        <h2 className="section-title">Championship <span>History</span></h2>
        <GenericSortable
          defaultSortKey="year"
          columns={[
            { key: "year", label: "Year" },
            { key: "sport", label: "Sport" },
            { key: "champion", label: "Champion", gold: true },
            { key: "championOwner", label: "Owner" },
            { key: "runnerUp", label: "Runner-up" },
          ]}
          rows={championships.map((c) => ({
            year: c.year,
            sport: c.sport === "football" ? "Football" : "Baseball",
            champion: c.champion,
            championOwner: c.championOwner,
            runnerUp: `${c.runnerUp} (${c.runnerUpOwner})`,
          }))}
        />
      </section>

      <section className="space-y-4">
        <h2 className="section-title">All-Time <span>Combined Records</span></h2>
        <GenericSortable
          defaultSortKey="wins"
          columns={[
            { key: "displayName", label: "Owner" },
            { key: "seasons", label: "Seasons", align: "right" },
            { key: "wins", label: "W", align: "right" },
            { key: "losses", label: "L", align: "right" },
            { key: "winPct", label: "Win %", align: "right" },
            { key: "pf", label: "PF", align: "right" },
            { key: "pa", label: "PA", align: "right" },
            { key: "championships", label: "Titles", align: "right", gold: true },
            { key: "footballChampionships", label: "FB", align: "right" },
            { key: "baseballChampionships", label: "BB", align: "right" },
          ]}
          rows={career}
        />
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section>
          <h2 className="section-title mb-2">Most <span>Championships</span></h2>
          <GenericSortable
            columns={[
              { key: "displayName", label: "Owner" },
              { key: "championships", label: "Titles", align: "right", gold: true },
            ]}
            rows={byTitles}
          />
        </section>
        <section>
          <h2 className="section-title mb-2">Most <span>Points Scored</span></h2>
          <GenericSortable
            columns={[
              { key: "displayName", label: "Owner" },
              { key: "pf", label: "PF", align: "right" },
            ]}
            rows={byPoints}
          />
        </section>
      </div>

      <section className="space-y-4">
        <h2 className="section-title">All-Time <span>Head-to-Head</span></h2>
        <p className="text-sm text-[var(--muted)]">
          Combined matchups across both sports
        </p>
        <GenericSortable
          defaultSortKey="totalGames"
          columns={[
            { key: "ownerA", label: "Owner A" },
            { key: "record", label: "Record" },
            { key: "ownerB", label: "Owner B" },
            { key: "totalGames", label: "Games", align: "right" },
          ]}
          rows={h2h}
        />
      </section>
    </>
  );
}
