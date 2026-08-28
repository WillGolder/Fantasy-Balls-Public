import Link from "next/link";
import { getChampionshipHistory } from "@/lib/data";
import { siteName } from "@/lib/owners";
import { GoldTrophy } from "@/components/CrestAndBalls";

export default function TrophiesPage() {
  const all = getChampionshipHistory();
  const football = all.filter((c) => c.sport === "football");
  const baseball = all.filter((c) => c.sport === "baseball");

  function TrophyCard({
    year,
    team,
    owner,
    runner,
    sport,
  }: {
    year: number;
    team: string;
    owner: string;
    runner: string;
    sport: string;
  }) {
    return (
      <div className="trophy-display card p-4">
        <GoldTrophy className="w-16 h-24" />
        <p className="mt-2 text-sm font-extrabold text-[var(--gold)]">{year}</p>
        <p className="text-[0.65rem] uppercase tracking-wider text-[var(--muted)]">
          {sport}
        </p>
        <p className="mt-1 text-sm font-bold leading-snug">{team}</p>
        <p className="text-xs text-[var(--gold-mid)]">{owner}</p>
        <p className="text-[0.65rem] text-[var(--muted)] mt-1">vs {runner}</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="page-header-bar">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">
          Hall of Champions
        </p>
        <h1 className="text-3xl font-black tracking-tight mt-1">Trophy Case</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Completed seasons only. Real trophies, not banners.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="section-title">
          Football <span>Champions</span>
        </h2>
        <div className="flex flex-wrap gap-4">
          {football.map((c) => (
            <TrophyCard
              key={`fb-${c.year}`}
              year={c.year}
              team={c.champion}
              owner={siteName(c.championOwner)}
              runner={c.runnerUp}
              sport="Football"
            />
          ))}
          {football.length === 0 && (
            <p className="text-sm text-[var(--muted)]">No completed seasons yet.</p>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="section-title">
          Baseball <span>Champions</span>
        </h2>
        <div className="flex flex-wrap gap-4">
          {baseball.map((c) => (
            <TrophyCard
              key={`bb-${c.year}`}
              year={c.year}
              team={c.champion}
              owner={siteName(c.championOwner)}
              runner={c.runnerUp}
              sport="Baseball"
            />
          ))}
          {baseball.length === 0 && (
            <p className="text-sm text-[var(--muted)]">No completed seasons yet.</p>
          )}
        </div>
      </section>

      <p>
        <Link href="/" className="text-[var(--gold)] hover:underline text-sm">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
