import Link from "next/link";
import {
  getAvailableYears,
  getSeasonPowerRankings,
  getAllTimePowerRankings,
  getMinSeasonsForAllTime,
} from "@/lib/data";
import { siteName } from "@/lib/owners";
import { GenericSortable } from "@/components/GenericSortable";

export default function PowerRankingsPage() {
  const fbYears = getAvailableYears("football");
  const bbYears = getAvailableYears("baseball");
  const allTime = getAllTimePowerRankings();
  const minSeasons = getMinSeasonsForAllTime();
  const latestFb = fbYears[0] ? getSeasonPowerRankings("football", fbYears[0]) : [];
  const latestBb = bbYears[0] ? getSeasonPowerRankings("baseball", bbYears[0]) : [];

  return (
    <div className="space-y-12">
      <div className="page-header-bar">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-bright)]">
          Balanced Formula
        </p>
        <h1 className="text-3xl font-black tracking-tight mt-1">Power Rankings</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          40% win% · 30% points · 20% recent form · 10% strength of schedule (season).
          All-time uses career win%, PF, titles, and longevity.
        </p>
        <p className="mt-2 text-xs text-[var(--muted)]">
          Auto-refresh (when hosted with cookies): Tuesday AM in football season ·
          Monday AM in baseball season. If ESPN is logged out, last archive stays.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="section-title">All-Time <span>Power Rankings</span></h2>
        <p className="text-xs text-[var(--muted)]">
          Min {minSeasons} seasons played (55% of archived seasons).
        </p>
        <GenericSortable
          defaultSortKey="rank"
          columns={[
            { key: "rank", label: "Rank", gold: true },
            { key: "ownerName", label: "Manager" },
            { key: "score", label: "Score", align: "right" },
            { key: "record", label: "W–L", align: "right" },
            { key: "winPct", label: "Win %", align: "right" },
            { key: "championships", label: "Titles", align: "right" },
            { key: "seasons", label: "Seasons", align: "right" },
          ]}
          rows={allTime.map((r) => ({
            rank: r.rank,
            ownerName: siteName(r.ownerName),
            score: (r.score * 100).toFixed(1),
            record: `${r.wins}–${r.losses}${r.ties ? `–${r.ties}` : ""}`,
            winPct: `${(r.winPct * 100).toFixed(1)}%`,
            championships: r.championships,
            seasons: r.seasons,
          }))}
        />
      </section>

      <section className="space-y-3">
        <h2 className="section-title">Football {fbYears[0]} <span>Power Rankings</span></h2>
        <GenericSortable
          columns={[
            { key: "rank", label: "Rank", gold: true },
            { key: "teamName", label: "Team" },
            { key: "ownerName", label: "Owner" },
            { key: "score", label: "Score", align: "right" },
            { key: "record", label: "Record", align: "right" },
            { key: "pf", label: "PF", align: "right" },
          ]}
          rows={latestFb.map((r) => ({
            rank: r.rank,
            teamName: r.teamName,
            ownerName: siteName(r.ownerName),
            score: (r.score * 100).toFixed(1),
            record: `${r.wins}–${r.losses}${r.ties ? `–${r.ties}` : ""}`,
            pf: r.pointsFor > 0 ? r.pointsFor.toFixed(0) : "—",
          }))}
        />
      </section>

      <section className="space-y-3">
        <h2 className="section-title">Baseball {bbYears[0]} <span>Power Rankings</span></h2>
        <GenericSortable
          columns={[
            { key: "rank", label: "Rank", gold: true },
            { key: "teamName", label: "Team" },
            { key: "ownerName", label: "Owner" },
            { key: "score", label: "Score", align: "right" },
            { key: "record", label: "Record", align: "right" },
          ]}
          rows={latestBb.map((r) => ({
            rank: r.rank,
            teamName: r.teamName,
            ownerName: siteName(r.ownerName),
            score: (r.score * 100).toFixed(1),
            record: `${r.wins}–${r.losses}${r.ties ? `–${r.ties}` : ""}`,
          }))}
        />
      </section>

      <p>
        <Link href="/" className="text-[var(--gold)] hover:underline">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
