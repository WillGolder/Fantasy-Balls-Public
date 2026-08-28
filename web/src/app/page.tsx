import Link from "next/link";
import {
  getAvailableYears,
  getSeasonData,
  getReigningChampion,
  getAllTimeWinPctLeaders,
  getRandomQuote,
  getCombinedOwnerCareerStats,
  getLeagueConfig,
  ownerDisplayName,
} from "@/lib/data";
import { siteName } from "@/lib/owners";
import { DraftCountdown } from "@/components/DraftCountdown";
import { HomeLeadersTable } from "@/components/HomeLeadersTable";


export default function HomePage() {
  const footballYears = getAvailableYears("football");
  const baseballYears = getAvailableYears("baseball");
  const fbChamp = getReigningChampion("football");
  const bbChamp = getReigningChampion("baseball");
  const { best, worst, minSeasons } = getAllTimeWinPctLeaders();
  const quote = getRandomQuote();
  const topManagers = getCombinedOwnerCareerStats().slice(0, 7);
  const config = getLeagueConfig();
  const fb2026 = getSeasonData("football", 2026);
  const allOwners = fb2026
    ? Array.from(new Set(fb2026.teams.map((team) => ownerDisplayName(team)))).sort()
    : getCombinedOwnerCareerStats().map((o) => o.displayName).sort();
  const paidSet = new Set(config.dues.paid.map((n) => n.toLowerCase()));
  const isPaid = (name: string) => {
    const n = name.toLowerCase();
    if (paidSet.has(n)) return true;
    for (const p of paidSet) {
      if (n.includes(p) || p.includes(n)) return true;
      if (p === "brendan reed" && (n.includes("chumba") || n.includes("brendan"))) return true;
    }
    return false;
  };

  return (
    <div className="space-y-0 -mx-4 sm:mx-0">
      {/* Crest + framed title — approved art, transparent PNGs */}
      <section className="relative px-4 py-8 border-b border-[#2a2834]">
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/art/crest.png"
              alt="Fantasy Balls crest"
              className="h-36 sm:h-44 w-auto object-contain"
            />
          </div>
          <div className="hero-frame-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/art/frame.png"
              alt=""
              className="hero-frame-img"
              aria-hidden
            />
            <div className="hero-frame-content text-center">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.28em] text-[var(--gold)]">
                Est. 2022
              </p>
              <h1 className="title-script text-4xl sm:text-5xl md:text-6xl leading-tight mt-1">
                Fantasy Balls
              </h1>
              <p className="text-[var(--gold-bright)] text-xs sm:text-sm italic max-w-sm mx-auto mt-2 opacity-90">
                Football. Baseball. One League. One Retard to Rule them All.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="section-band px-4 py-4 border-b border-[#2a2834]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[var(--gold)] mb-1">
            From the Group Chat
          </p>
          <p className="text-base sm:text-lg font-medium leading-snug">
            “{quote.text}”
          </p>
          {quote.by && (
            <p className="text-sm text-[var(--muted)] mt-1">— {quote.by}</p>
          )}
        </div>
      </section>

      {/* Featured banners */}
      <section className="px-4 py-8 border-b border-[#2a2834]">
        <div className="max-w-6xl mx-auto space-y-4">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[var(--gold)] text-center">
            Featured Banners
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Link href="/football" className="pennant pennant-lg mx-auto block hover:scale-[1.03] transition">
              <div className="flex justify-center mb-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/art/crowned-football.png" alt="" className="h-16 w-auto object-contain" />
              </div>
              <div className="p-year">Football Champ</div>
              <div className="p-team">{fbChamp?.teamName || "TBD"}</div>
              <div className="p-owner">{siteName(fbChamp?.ownerName || "") || "—"}</div>
              <div className="p-record">{fbChamp ? String(fbChamp.year) : ""}</div>
            </Link>
            <Link href="/baseball" className="pennant pennant-lg mx-auto block hover:scale-[1.03] transition">
              <div className="flex justify-center mb-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/art/crowned-baseball.png" alt="" className="h-16 w-auto object-contain" />
              </div>
              <div className="p-year">Baseball Champ</div>
              <div className="p-team">{bbChamp?.teamName || "TBD"}</div>
              <div className="p-owner">{siteName(bbChamp?.ownerName || "") || "—"}</div>
              <div className="p-record">{bbChamp ? String(bbChamp.year) : ""}</div>
            </Link>
            <Link href="/all-time" className="pennant pennant-lg mx-auto block hover:scale-[1.03] transition">
              <div className="p-year">All-Time Best</div>
              <div className="p-team">{siteName(best?.displayName || "") || "TBD"}</div>
              <div className="p-owner">
                {best
                  ? `${((best.wins / (best.wins + best.losses + best.ties || 1)) * 100).toFixed(1)}% win`
                  : "—"}
              </div>
              <div className="p-record">Min {minSeasons} seasons</div>
            </Link>
            <Link href="/wall-of-shame" className="pennant pennant-lg mx-auto block hover:scale-[1.03] transition">
              <div className="p-year">Wall of Shame</div>
              <div className="p-team">{siteName(worst?.displayName || "") || "TBD"}</div>
              <div className="p-owner">
                {worst
                  ? `${((worst.wins / (worst.wins + worst.losses + worst.ties || 1)) * 100).toFixed(1)}% win`
                  : "—"}
              </div>
              <div className="p-record">Min {minSeasons} seasons</div>
            </Link>
          </div>
          <p className="text-center">
            <Link href="/trophies" className="text-sm text-[var(--gold)] hover:underline">
              Full trophy case →
            </Link>
          </p>
        </div>
      </section>

      {/* Draft countdown */}
      <section className="px-4 py-8 section-band border-b border-[#2a2834]">
        <div className="max-w-xl mx-auto text-center space-y-2">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
            {config.draftLabel}
          </p>
          <DraftCountdown targetIso={config.draftDate} />
          <p className="text-sm text-[var(--muted)]">
            Sunday, September 6, 2026 · 7:00 PM EST
          </p>
        </div>
      </section>

      {/* Dues */}
      <section className="px-4 py-8 border-b border-[#2a2834]">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-center">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
              Dues — {config.dues.seasonLabel}
            </p>
            <p className="text-sm text-[var(--muted)] mt-1">
              ${config.dues.amount} before the draft. Paid managers in gold.
            </p>
          </div>
          <div className="card p-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {allOwners.map((name) => {
              const paid = isPaid(name);
              return (
                <div
                  key={name}
                  className={`rounded px-2 py-1.5 text-sm ${
                    paid ? "dues-paid bg-[rgba(240,193,74,0.12)]" : "dues-unpaid"
                  }`}
                >
                  {paid ? "✓ " : ""}
                  {siteName(name)}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-[var(--muted)] text-center">
            Edit paid list in content/league.json
          </p>
        </div>
      </section>

      {/* Hub */}
      <section className="px-4 py-8 section-band-alt border-b border-[#2a2834]">
        <div className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 card p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-title">
                All-Time <span>Leaders</span>
              </h2>
              <Link href="/managers" className="text-xs text-[var(--gold)] hover:underline">
                All managers →
              </Link>
            </div>
            <HomeLeadersTable
              rows={topManagers.map((m) => ({
                key: m.key,
                name: siteName(m.displayName),
                wins: m.wins,
                titles: m.championships,
              }))}
            />
          </div>
          <div className="lg:col-span-2 card p-4 space-y-2">
            <h2 className="section-title mb-3">
              League <span>Hub</span>
            </h2>
            {[
              { href: "/football", label: "Football History" },
              { href: "/baseball", label: "Baseball History" },
              { href: "/all-time", label: "All-Time" },
              { href: "/timeline", label: "Timeline" },
              { href: "/rivalries", label: "Rivalries" },
              { href: "/managers", label: "Managers" },
              { href: "/quotes", label: "Quotes Hall of Fame" },
              { href: "/rules", label: "Constitution" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded border border-[#32303c] px-3 py-2.5 text-sm hover:border-[var(--gold-dim)] transition"
              >
                <span>{item.label}</span>
                <span className="text-[var(--gold)]">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Sport snapshots */}
      <section className="px-4 py-8">
        <div className="max-w-6xl mx-auto grid gap-4 md:grid-cols-2">
          <Link href="/football" className="card card-hover p-5 block">
            <h2 className="text-xl font-bold">Football</h2>
            <p className="text-[var(--muted)] text-xs mt-1">
              Since 2022 · {footballYears.length} seasons archived
            </p>
          </Link>
          <Link href="/baseball" className="card card-hover p-5 block">
            <h2 className="text-xl font-bold">Baseball</h2>
            <p className="text-[var(--muted)] text-xs mt-1">
              Since 2023 · {baseballYears.length} seasons archived
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
