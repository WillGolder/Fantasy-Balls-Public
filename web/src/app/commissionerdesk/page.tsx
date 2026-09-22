import Link from "next/link";
import {
  getSeasonData,
  getAvailableYears,
  getHeadToHeadRecordsDetailed,
  getAllPlayTable,
  getMedianTable,
  getLeagueConfig,
} from "@/lib/data";
import {
  getDeskConfig,
  getWeekGames,
  getLuckTable,
  getCloseLedger,
  getChugLog,
  getUpcomingOpponents,
  getPowerJumps,
  getHistoricalScores,
  scoreRank,
  chalkFavorite,
} from "@/lib/desk";
import { siteName, ownerDisplayName } from "@/lib/owners";
import { DeskH2H } from "./DeskH2H";

export default function CommissionerDeskPage() {
  const cfg = getDeskConfig();
  const years = getAvailableYears(cfg.sport);
  const year = years.includes(cfg.year) ? cfg.year : years[0];
  const season = year ? getSeasonData(cfg.sport, year) : null;
  const games = season ? getWeekGames(season) : [];
  const weeks = [...new Set(games.map((g) => g.week))].sort((a, b) => a - b);
  const latestWeek = weeks[weeks.length - 1] ?? 1;
  const thisWeek = games.filter((g) => g.week === latestWeek);
  const luck = year ? getLuckTable(cfg.sport, year) : [];
  const allPlay = year ? getAllPlayTable(cfg.sport, year) : { weeks: [], rows: [] };
  const median = year ? getMedianTable(cfg.sport, year) : { weeks: [], rows: [], lines: {} };
  const close = season ? getCloseLedger(season) : [];
  const chug = season ? getChugLog(season) : [];
  const power = year ? getPowerJumps(cfg.sport, year) : [];
  const h2h = getHeadToHeadRecordsDetailed();
  const config = getLeagueConfig();
  const paid = new Set((config.dues?.paid || []).map((n) => n.toLowerCase()));
  const owners = season
    ? season.teams.map((t) => ownerDisplayName(t))
    : [];
  const unpaid = owners.filter((n) => ![...paid].some((p) => n.toLowerCase().includes(p) || p.includes(n.toLowerCase().split(" ")[0])));

  const sortedWeek = [...thisWeek].sort((a, b) => a.margin - b.margin);
  const gotwNames = (cfg.gotwLast || []).map((s) => s.toLowerCase());
  const gotwGame = sortedWeek.find(
    (g) =>
      gotwNames.some((n) => g.homeTeam.toLowerCase().includes(n) || g.homeOwner.toLowerCase().includes(n)) &&
      gotwNames.some((n) => g.awayTeam.toLowerCase().includes(n) || g.awayOwner.toLowerCase().includes(n))
  );
  const recapOrder = gotwGame
    ? [gotwGame, ...sortedWeek.filter((g) => g !== gotwGame)]
    : sortedWeek;

  const high = [...thisWeek].sort((a, b) => Math.max(b.homeScore, b.awayScore) - Math.max(a.homeScore, a.awayScore))[0];
  const lowGame = [...thisWeek].sort((a, b) => Math.min(a.homeScore, a.awayScore) - Math.min(b.homeScore, b.awayScore))[0];
  const echoes = year ? getHistoricalScores(cfg.sport).slice(0, 8) : [];

  const lastPlace = season
    ? [...season.teams].sort((a, b) => (b.final_standing || b.standing || 99) - (a.final_standing || a.standing || 99))[0]
    : null;

  function apCell(owner: string) {
    const row = allPlay.rows.find((r) => r.ownerName === owner);
    const c = row?.weeks[latestWeek];
    return c ? `${c.wins}-${c.losses}` : "—";
  }
  function medCell(owner: string) {
    const row = median.rows.find((r) => r.ownerName === owner);
    return row?.weeks[latestWeek] ?? "—";
  }
  function series(a: string, b: string) {
    const r = h2h.find(
      (x) =>
        (x.ownerA === a && x.ownerB === b) || (x.ownerA === b && x.ownerB === a)
    );
    if (!r) return "no meetings";
    if (r.ownerA === a) return `${r.winsA}–${r.winsB}${r.ties ? `–${r.ties}` : ""}`;
    return `${r.winsB}–${r.winsA}${r.ties ? `–${r.ties}` : ""}`;
  }

  const scriptLines = recapOrder.map((g, i) => {
    const label = i === 0 && gotwGame ? "GOTW" : `Margin ${g.margin.toFixed(2)}`;
    return `${label}: ${g.homeTeam} ${g.homeScore.toFixed(2)} vs ${g.awayTeam} ${g.awayScore.toFixed(2)} (${siteName(g.homeOwner)} / ${siteName(g.awayOwner)}) H2H ${series(g.homeOwner, g.awayOwner)} AP ${apCell(g.homeOwner)} / ${apCell(g.awayOwner)}`;
  });

  return (
    <div className="space-y-10">
      <div className="page-header-bar">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">
          Hidden desk
        </p>
        <h1 className="text-3xl font-black tracking-tight mt-1">
          Commissioner Desk
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {cfg.sport === "football" ? "Football" : "Baseball"} {year} · Week{" "}
          {latestWeek}. Not in the nav. Bookmark /commissionerdesk.
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-4">
          <p className="text-xs uppercase text-[var(--gold)]">Closest</p>
          <p className="font-bold mt-1">
            {sortedWeek[0]
              ? `${sortedWeek[0].margin.toFixed(2)} pts`
              : "—"}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs uppercase text-[var(--gold)]">Blowout</p>
          <p className="font-bold mt-1">
            {sortedWeek.at(-1)
              ? `${sortedWeek.at(-1)!.margin.toFixed(2)} pts`
              : "—"}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs uppercase text-[var(--gold)]">High / low</p>
          <p className="font-bold mt-1">
            {high ? Math.max(high.homeScore, high.awayScore).toFixed(1) : "—"} /{" "}
            {lowGame ? Math.min(lowGame.homeScore, lowGame.awayScore).toFixed(1) : "—"}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs uppercase text-[var(--gold)]">Unpaid</p>
          <p className="font-bold mt-1 text-sm">
            {unpaid.length ? unpaid.map(siteName).join(", ") : "All paid"}
          </p>
        </div>
      </section>

      <section className="card p-4 space-y-2">
        <h2 className="section-title">GOTW</h2>
        <p className="text-sm">
          Last week pick:{" "}
          <span className="text-[var(--gold)]">
            {cfg.gotwLast.length ? cfg.gotwLast.join(" vs ") : "set in content/desk.json"}
          </span>
        </p>
        <p className="text-sm">
          Next week pick:{" "}
          <span className="text-[var(--gold)]">
            {cfg.gotwNext.length ? cfg.gotwNext.join(" vs ") : "set in content/desk.json"}
          </span>
        </p>
        {cfg.youtube && (
          <p className="text-sm">
            <a className="text-[var(--gold)] underline" href={cfg.youtube}>
              Recap video
            </a>
          </p>
        )}
        {cfg.notes && (
          <p className="text-sm text-[var(--muted)] whitespace-pre-wrap">{cfg.notes}</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="section-title">
          Recap script <span>closest → blowout</span>
        </h2>
        <div className="space-y-3">
          {recapOrder.map((g, i) => {
            const echoHome = scoreRank(cfg.sport, g.homeScore);
            const echoAway = scoreRank(cfg.sport, g.awayScore);
            const chalk = chalkFavorite(g, luck);
            return (
              <div key={`${g.homeId}-${g.awayId}-${g.week}`} className="card p-4">
                <p className="text-xs text-[var(--gold)]">
                  {i === 0 && gotwGame ? "GAME OF THE WEEK" : `Margin ${g.margin.toFixed(2)}`}
                  {chalk ? ` · Chalk: ${siteName(chalk)}` : ""}
                </p>
                <p className="font-bold text-lg mt-1">
                  {g.homeTeam} {g.homeScore.toFixed(2)} — {g.awayTeam}{" "}
                  {g.awayScore.toFixed(2)}
                </p>
                <p className="text-sm text-[var(--muted)]">
                  {siteName(g.homeOwner)} vs {siteName(g.awayOwner)} · H2H {series(g.homeOwner, g.awayOwner)} ·
                  All-play {apCell(g.homeOwner)} / {apCell(g.awayOwner)} · Median{" "}
                  {medCell(g.homeOwner)} / {medCell(g.awayOwner)}
                </p>
                <p className="text-xs text-[var(--muted)] mt-1">
                  Score echo: {g.homeScore.toFixed(1)} is #{echoHome} all-time {cfg.sport};{" "}
                  {g.awayScore.toFixed(1)} is #{echoAway}.
                </p>
              </div>
            );
          })}
        </div>
        <pre className="card p-3 text-xs overflow-x-auto whitespace-pre-wrap">
          {scriptLines.join("\n") || "No completed games yet."}
        </pre>
      </section>

      <section className="space-y-3">
        <h2 className="section-title">Luck</h2>
        <div className="card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Owner</th>
                <th className="num">W-L</th>
                <th className="num">All-play</th>
                <th className="num">Exp W</th>
                <th className="num">Luck</th>
              </tr>
            </thead>
            <tbody>
              {luck.map((r) => (
                <tr key={r.ownerName}>
                  <td>{siteName(r.ownerName)}</td>
                  <td className="num">
                    {r.wins}-{r.losses}
                  </td>
                  <td className="num">
                    {r.allPlayW}-{r.allPlayL}
                  </td>
                  <td className="num">{r.expectedWins.toFixed(2)}</td>
                  <td className="num">{r.luck >= 0 ? "+" : ""}{r.luck.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="section-title">Power jump</h2>
        <div className="card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Owner</th>
                <th className="num">Δ</th>
                <th className="num">Record #</th>
              </tr>
            </thead>
            <tbody>
              {power.map((p) => (
                <tr key={p.ownerName}>
                  <td>{p.rank}</td>
                  <td>{siteName(p.ownerName)}</td>
                  <td className="num">
                    {p.delta == null ? "—" : p.delta > 0 ? `↑${p.delta}` : p.delta < 0 ? `↓${Math.abs(p.delta)}` : "—"}
                  </td>
                  <td className="num">{p.recordRank}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-[var(--muted)]">
          Paste current ranks into content/power-snap.json each Tuesday to freeze last week.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="section-title">Toilet bowl + SOS</h2>
        <p className="text-sm text-[var(--muted)]">
          Last in standings:{" "}
          {lastPlace ? siteName(ownerDisplayName(lastPlace)) : "—"}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {season?.teams.map((t) => {
            const upcoming = getUpcomingOpponents(season, t.team_id, 3);
            return (
              <div key={t.team_id} className="card p-3">
                <p className="font-bold">{siteName(ownerDisplayName(t))}</p>
                <p className="text-xs text-[var(--muted)]">
                  {t.wins}-{t.losses} · next:{" "}
                  {upcoming.length
                    ? upcoming.map((u) => `${siteName(u.owner)} (${u.pf.toFixed(0)} PF)`).join(" · ")
                    : "no future games stored"}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="section-title">Scouting cards</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {season?.teams.map((t) => {
            const name = ownerDisplayName(t);
            const l = luck.find((x) => x.ownerName === name);
            const c = close.find((x) => x.ownerName === name);
            const droughts = h2h
              .filter((r) => r.ownerA === name || r.ownerB === name)
              .map((r) => {
                const opp = r.ownerA === name ? r.ownerB : r.ownerA;
                const mine = r.ownerA === name ? r.winsA : r.winsB;
                const theirs = r.ownerA === name ? r.winsB : r.winsA;
                return { opp, mine, theirs, games: r.totalGames };
              })
              .filter((x) => x.games >= 3 && x.mine === 0)
              .sort((a, b) => b.games - a.games)
              .slice(0, 2);
            return (
              <div key={t.team_id} className="card p-4 space-y-1">
                <p className="font-black">{siteName(name)}</p>
                <p className="text-sm">
                  {t.wins}-{t.losses} · luck {l ? (l.luck >= 0 ? "+" : "") + l.luck.toFixed(2) : "—"}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  Close ≤10: {c ? `${c.closeW}-${c.closeL}` : "—"} · ≤5:{" "}
                  {c ? `${c.close5W}-${c.close5L}` : "—"}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  Can&apos;t beat:{" "}
                  {droughts.length
                    ? droughts.map((d) => `${siteName(d.opp)} (0-${d.theirs})`).join(", ")
                    : "no droughts"}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="section-title">Chug log</h2>
        <ul className="text-sm space-y-1">
          {chug.map((c) => (
            <li key={c.week}>
              Week {c.week}: {siteName(c.owner)} · {c.score.toFixed(2)}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="section-title">Historical echoes</h2>
        <ol className="text-sm space-y-1">
          {echoes.map((e, i) => (
            <li key={`${e.year}-${e.owner}-${i}`}>
              #{i + 1} {e.score.toFixed(2)} · {siteName(e.owner)} · {e.year}
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="section-title">Full H2H</h2>
        <DeskH2H rows={h2h} />
      </section>

      <p className="text-xs text-[var(--muted)]">
        Edit GOTW / notes in web/content/desk.json.{" "}
        <Link href="/" className="text-[var(--gold)]">
          Home
        </Link>
      </p>
    </div>
  );
}
