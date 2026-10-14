import { getHistoricalScores, getScoreAppearances } from "@/lib/desk";
import { siteName } from "@/lib/owners";
import { DeskNav } from "../DeskNav";
import { GenericSortable } from "@/components/GenericSortable";

function SportVault({ sport }: { sport: "football" | "baseball" }) {
  const all = getHistoricalScores(sport);
  const apps = getScoreAppearances(sport, 100, 50);
  const label = sport === "football" ? "Football" : "Baseball";
  return (
    <section className="space-y-6">
      <h2 className="section-title">{label}</h2>
      <p className="text-sm text-[var(--muted)]">
        {all.length} weekly scores on file
        {sport === "football" ? " (2022 omitted — different scoring)." : "."} Top 100 / bottom 50 used for appearances.
      </p>
      <GenericSortable
        defaultSortKey="top"
        columns={[
          { key: "owner", label: "Owner" },
          { key: "top", label: "Top 100", align: "right" },
          { key: "bottom", label: "Bottom 50", align: "right" },
          { key: "total", label: "All scores", align: "right" },
        ]}
        rows={apps.map((a) => ({
          key: a.owner,
          owner: siteName(a.owner),
          top: a.top,
          bottom: a.bottom,
          total: a.total,
        }))}
      />
      <h3 className="text-lg font-black">Every score, high to low</h3>
      <GenericSortable
        defaultSortKey="rank"
        columns={[
          { key: "rank", label: "#", align: "right" },
          { key: "score", label: "Score", align: "right" },
          { key: "owner", label: "Owner" },
          { key: "team", label: "Team" },
          { key: "year", label: "Year", align: "right" },
          { key: "week", label: "Week", align: "right" },
        ]}
        rows={all.map((s, i) => ({
          key: `${s.year}-${s.owner}-${i}`,
          rank: i + 1,
          score: Number(s.score.toFixed(2)),
          owner: siteName(s.owner),
          team: s.team,
          year: s.year,
          week: s.week ?? "—",
        }))}
      />
    </section>
  );
}

export default function ScoreVaultPage() {
  return (
    <div className="space-y-10">
      <div className="page-header-bar space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">
          Hidden desk
        </p>
        <h1 className="text-3xl font-black tracking-tight">Score vault</h1>
        <DeskNav current="scores" />
      </div>
      <SportVault sport="football" />
      <SportVault sport="baseball" />
    </div>
  );
}
