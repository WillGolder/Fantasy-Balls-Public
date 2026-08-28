import Link from "next/link";
import {
  getAvailableYears,
  getSeasonData,
  getOwnerCareerStats,
} from "@/lib/data";
import { SeasonStandings } from "@/components/SeasonStandings";
import { CareerRecordsTable } from "@/components/CareerRecordsTable";
import { siteName } from "@/lib/owners";

export default function FootballPage() {
  const years = getAvailableYears("football");
  const career = getOwnerCareerStats("football");

  return (
    <div className="space-y-12">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-[var(--accent)]">
          🏈 Football
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight mt-1">
          Football History
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          League ID 225969362 · Fantasy Balls · {years.length} seasons archived
        </p>
      </div>

      <section className="space-y-8">
        <h2 className="section-title">
          Season <span>Standings</span>
        </h2>
        {years.map((year) => {
          const season = getSeasonData("football", year);
          if (!season) return null;
          return (
            <div key={year} className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Link href={`/football/${year}`} className="text-[var(--gold)] hover:underline">
                  {year}
                </Link>
                <span className="text-sm font-normal text-[var(--muted)]">
                  · {season.teams.length} teams
                  {season.settings.playoff_team_count
                    ? ` · ${season.settings.playoff_team_count}-team playoffs`
                    : ""}
                  {" · "}
                  <Link href={`/football/${year}`} className="hover:underline">
                    advanced stats →
                  </Link>
                </span>
              </h3>
              <SeasonStandings season={season} />
            </div>
          );
        })}
      </section>

      <section className="space-y-4">
        <h2 className="section-title">
          All-Time <span>Football Records</span>
        </h2>
        <CareerRecordsTable
          rows={career.map((owner) => {
            const total = owner.wins + owner.losses + owner.ties;
            return {
              key: owner.key,
              name: siteName(owner.displayName),
              seasons: owner.seasons,
              wins: owner.wins,
              losses: owner.losses,
              winPct: total > 0 ? (owner.wins / total) * 100 : 0,
              pointsFor: owner.pointsFor,
              championships: owner.championships,
            };
          })}
        />
      </section>

      <p>
        <Link href="/" className="text-[var(--accent)] hover:underline">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
