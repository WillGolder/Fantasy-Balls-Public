import Link from "next/link";
import {
  getSeasonData,
  getAvailableYears,
  getHeadToHeadRecordsDetailed,
  getAllPlayTable,
  getMedianTable,
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
  getGotwWeeks,
} from "@/lib/desk";
import { siteName, ownerDisplayName } from "@/lib/owners";
import { DeskH2H } from "./DeskH2H";

export default function CommissionerDeskPage() {
  const cfg = getDeskConfig();
  const gotwBoard = getGotwWeeks();
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
  const activeOwners = new Set(
    season ? season.teams.map((t) => ownerDisplayName(t)) : []
  );

  const sortedWeek = [...thisWeek].sort((a, b) => a.margin - b.margin);
  const gotwPick =
    gotwBoard.weeks.find((w) => w.week === latestWeek && w.a && w.b) ||
    [...gotwBoard.weeks].reverse().find((w) => w.a && w.b);
  const gotwNames = gotwPick ? [gotwPick.a, gotwPick.b].map((s) => s.toLowerCase()) : [];
  const gotwGame = sortedWeek.find(
    (g) =>
      gotwNames.some((n) => g.homeTeam.toLowerCase().includes(n) || g.homeOwner.toLowerCase().includes(n)) &&
      gotwNames.some((n) => g.awayTeam.toLowerCase().includes(n) || g.awayOwner.toLowerCase().includes(n))
  );
  const recapOrder = gotwGame
    ? [gotwGame, ...sortedWeek.filter((g) => g !== gotwGame)]
    : sortedWeek;

  const echoes = year
    ? getHistoricalScores(cfg.sport)
        .filter((e) => activeOwners.has(e.owner))
        .slice(0, 8)
    : [];

  const standingsSorted = season
    ? [...season.teams].sort((a, b) => {
        const ag = (a.wins || 0) + (a.losses || 0) + (a.ties || 0);
        const bg = (b.wins || 0) + (b.losses || 0) + (b.ties || 0);
        const ap = ag ? (a.wins || 0) / ag : 0;
        const bp = bg ? (b.wins || 0) / bg : 0;
        if (ap !== bp) return ap - bp;
        return (a.points_for || 0) - (b.points_for || 0);
      })
    : [];
  const basement = standingsSorted.slice(0, 3);

  function highLowWho() {
    let hi = { owner: "", score: 0 };
    let lo = { owner: "", score: 9999 };
    for (const g of thisWeek) {
      for (const [owner, score] of [
        [g.homeOwner, g.homeScore],
        [g.awayOwner, g.awayScore],
      ] as const) {
        if (score > hi.score) hi = { owner, score };
        if (score < lo.score) lo = { owner, score };
      }
    }
    return { hi, lo };
  }
  const hl = highLowWho();

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

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="card p-5">
          <p className="text-xs uppercase text-[var(--gold)]">High score</p>
          <p className="text-3xl font-black mt-1">{hl.hi.score ? hl.hi.score.toFixed(2) : "—"}</p>
          <p className="text-sm mt-1">{hl.hi.owner ? siteName(hl.hi.owner) : ""}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase text-[var(--gold)]">Low score</p>
          <p className="text-3xl font-black mt-1">{hl.lo.score < 9999 ? hl.lo.score.toFixed(2) : "—"}</p>
          <p className="text-sm mt-1">{hl.lo.owner ? siteName(hl.lo.owner) : ""}</p>
        </div>
      </section>

      <section className="card p-5 space-y-4">
        <h2 className="section-title">GOTW tracker</h2>
        <p className="text-sm text-[var(--muted)]">
          Fill names in content/gotw.json. Empty weeks stay blank until you pick.
        </p>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Week</th>
                <th>Matchup</th>
              </tr>
            </thead>
            <tbody>
              {gotwBoard.weeks.map((w) => (
                <tr key={w.week} className={w.week === latestWeek ? "font-bold" : ""}>
                  <td>{w.week}</td>
                  <td>
                    {w.a && w.b ? `${w.a} vs ${w.b}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
            const favoredWon = chalk && g.winnerOwner === chalk;
            return (
              <div key={`${g.homeId}-${g.awayId}-${g.week}`} className="card p-6 space-y-3">
                <p className="text-xs uppercase tracking-widest text-[var(--gold)]">
                  {i === 0 && gotwGame
                    ? "Game of the week"
                    : i === recapOrder.length - 1
                    ? "Largest margin"
                    : i === 1
                    ? "Closest"
                    : i === 2
                    ? "Next closest"
                    : i === 3
                    ? "Third closest"
                    : `Game ${i + 1}`}
                </p>
                <p className="text-2xl font-black leading-tight">
                  {g.homeTeam} {g.homeScore.toFixed(2)}
                  <span className="text-[var(--muted)] font-semibold"> vs </span>
                  {g.awayTeam} {g.awayScore.toFixed(2)}
                </p>
                <p className="text-sm">{siteName(g.homeOwner)} vs {siteName(g.awayOwner)}</p>
                <p className="text-sm">Winner: {g.winnerOwner ? siteName(g.winnerOwner) : "tie"} · margin {g.margin.toFixed(2)}</p>
                <p className="text-sm">Lifetime series: {series(g.homeOwner, g.awayOwner)} (first name is {siteName(g.homeOwner)})</p>
                <p className="text-sm">
                  This week vs the field: {siteName(g.homeOwner)} {apCell(g.homeOwner)}, {siteName(g.awayOwner)} {apCell(g.awayOwner)}
                </p>
                <p className="text-sm">
                  vs median this week: {siteName(g.homeOwner)} {medCell(g.homeOwner)}, {siteName(g.awayOwner)} {medCell(g.awayOwner)}
                </p>
                <p className="text-sm text-[var(--muted)]">
                  Numbers favored {chalk ? siteName(chalk) : "neither"} (better all-play + this week&apos;s score).
                  {chalk && g.winnerOwner && chalk !== g.winnerOwner ? " Upset — the other guy won." : favoredWon ? " Favorite held." : ""}
                </p>
                <p className="text-sm text-[var(--muted)]">
                  {g.homeScore.toFixed(1)} is the #{echoHome} highest {cfg.sport} score in the archive.
                  {g.awayScore.toFixed(1)} is #{echoAway}.
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="section-title">Luck</h2>
        <p className="text-sm text-[var(--muted)] max-w-3xl">
          All-play is wins against every other team&apos;s score that week, not just your opponent.
          Expected wins = all-play wins ÷ 9 (a 10-team league). If you beat 6 of 9 scores one week,
          that week is worth 0.67 expected wins. Luck = real record wins minus expected wins.
          Positive luck = you keep beating the one guy you played even when the field outscored you.
          Negative = you score like a winner and still lose the matchup.
        </p>
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
        <h2 className="section-title">Toilet bowl</h2>
        <p className="text-sm text-[var(--muted)]">
          Worst three records right now. Next three opponents by leftover 0–0 games in the archive.
        </p>
        <div className="space-y-3">
          {basement.map((t, i) => {
            const upcoming = getUpcomingOpponents(season!, t.team_id, 3);
            return (
              <div key={t.team_id} className="card p-5">
                <p className="text-xs text-[var(--gold)]">{i === 0 ? "Last place" : i === 1 ? "Second last" : "Third last"}</p>
                <p className="text-xl font-black">{siteName(ownerDisplayName(t))} · {t.wins}-{t.losses}</p>
                <p className="text-sm mt-2">Upcoming:</p>
                {upcoming.length ? (
                  <ul className="text-sm list-disc ml-5">
                    {upcoming.map((u) => (
                      <li key={u.owner}>
                        {siteName(u.owner)} ({u.pf.toFixed(0)} PF so far)
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[var(--muted)]">No leftover games stored yet — SOS fills in after more weeks pull.</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="section-title">Schedule of death</h2>
        <p className="text-sm text-[var(--muted)]">
          Next three opponents for every active team, toughest first by opponent PF.
        </p>
        <div className="card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Owner</th>
                <th>Next 3</th>
                <th className="num">Opp PF</th>
              </tr>
            </thead>
            <tbody>
              {season?.teams
                .map((t) => {
                  const upcoming = getUpcomingOpponents(season, t.team_id, 3);
                  return { t, upcoming, heat: upcoming.reduce((s, u) => s + u.pf, 0) };
                })
                .sort((a, b) => b.heat - a.heat)
                .map(({ t, upcoming, heat }) => (
                  <tr key={t.team_id}>
                    <td>{siteName(ownerDisplayName(t))}</td>
                    <td>
                      {upcoming.length
                        ? upcoming.map((u) => siteName(u.owner)).join(", ")
                        : "—"}
                    </td>
                    <td className="num">{heat ? heat.toFixed(0) : "—"}</td>
                  </tr>
                ))}
            </tbody>
          </table>
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
              .filter((x) => x.games >= 3 && x.mine === 0 && activeOwners.has(x.opp))
              .sort((a, b) => b.games - a.games)
              .slice(0, 2);
            return (
              <div key={t.team_id} className="card p-4 space-y-1">
                <p className="font-black">{siteName(name)}</p>
                <p className="text-sm">
                  {t.wins}-{t.losses} · luck {l ? (l.luck >= 0 ? "+" : "") + l.luck.toFixed(2) : "—"}
                  {l ? ` (${l.luck >= 0 ? "winning more matchups than the field scores say" : "scoring like a winner, losing the one that counts"})` : ""}
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
        <p className="text-sm text-[var(--muted)]">Highest scores by managers in this year&apos;s football league only.</p>
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
