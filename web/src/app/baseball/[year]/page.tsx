import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getSeasonData,
  getTeamSeasonAdvanced,
  getAvailableYears,
} from "@/lib/data";
import { SeasonStandings } from "@/components/SeasonStandings";
import type { SeasonData } from "@/lib/data";

export function generateStaticParams() {
  return getAvailableYears("baseball").map((year) => ({ year: String(year) }));
}

function DivisionBlock({
  season,
  divisionName,
}: {
  season: SeasonData;
  divisionName: string | null;
}) {
  const teams = season.teams.filter((t) =>
    divisionName == null
      ? !t.division_name
      : t.division_name === divisionName
  );
  if (teams.length === 0) return null;
  const partial: SeasonData = { ...season, teams };
  return (
    <div className="space-y-2">
      <h3 className="text-base font-bold text-[var(--gold)]">
        {divisionName || "League"}
      </h3>
      <SeasonStandings season={partial} />
    </div>
  );
}

export default async function BaseballSeasonPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year: yearStr } = await params;
  const year = parseInt(yearStr, 10);
  const season = getSeasonData("baseball", year);
  if (!season) notFound();
  const advanced = getTeamSeasonAdvanced("baseball", year).sort(
    (a, b) => b.ppg - a.ppg
  );
  const divNames = [
    ...new Set(
      season.teams.map((t) => t.division_name).filter((d): d is string => !!d)
    ),
  ];

  return (
    <div className="space-y-10">
      <div className="page-header-bar">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">
          Baseball
        </p>
        <h1 className="text-3xl font-black tracking-tight mt-1">{year} Season</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {season.teams.length} teams
          {divNames.length ? ` · ${divNames.length} divisions` : ""}
        </p>
      </div>

      <section className="space-y-6">
        <h2 className="section-title">Standings</h2>
        {divNames.length >= 2 ? (
          divNames.map((d) => (
            <DivisionBlock key={d} season={season} divisionName={d} />
          ))
        ) : (
          <SeasonStandings season={season} />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="section-title">
          Advanced <span>Stats</span>
        </h2>
        <p className="text-xs text-[var(--muted)]">Full league (all divisions combined).</p>
        <div className="card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Team</th>
                <th>Owner</th>
                <th className="num">PPG</th>
                <th className="num">PAPG</th>
                <th className="num">Diff</th>
                <th className="num">Best</th>
                <th className="num">Worst</th>
                <th className="num">W Streak</th>
                <th className="num">L Streak</th>
                <th className="num">SoS</th>
                <th className="num">Close W-L</th>
              </tr>
            </thead>
            <tbody>
              {advanced.map((t) => (
                <tr key={t.teamId}>
                  <td className="font-medium">{t.teamName}</td>
                  <td className="text-[var(--muted)]">{t.ownerName}</td>
                  <td className="num">{t.ppg.toFixed(1)}</td>
                  <td className="num">{t.papg.toFixed(1)}</td>
                  <td className="num">{t.diff.toFixed(0)}</td>
                  <td className="num">{t.bestWeek?.toFixed(0) ?? "—"}</td>
                  <td className="num">{t.worstWeek?.toFixed(0) ?? "—"}</td>
                  <td className="num">{t.longestWinStreak}</td>
                  <td className="num">{t.longestLossStreak}</td>
                  <td className="num">{(t.sos * 100).toFixed(0)}%</td>
                  <td className="num">
                    {t.closeWins}–{t.closeLosses}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="flex gap-4 text-sm">
        <Link href="/baseball" className="text-[var(--gold)] hover:underline">
          ← Baseball history
        </Link>
        <Link href="/" className="text-[var(--gold)] hover:underline">
          Home
        </Link>
      </p>
    </div>
  );
}
