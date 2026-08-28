import Link from "next/link";
import {
  getCombinedOwnerCareerStats,
  getOwnerTrophies,
  getYearJoined,
  getBiggestRival,
  slugifyName,
  lookupBio,
  lookupNickname,
  managerPhotoUrl,
} from "@/lib/data";

export default function ManagersPage() {
  const managers = [...getCombinedOwnerCareerStats()].sort((a, b) =>
    a.displayName.localeCompare(b.displayName)
  );

  return (
    <div className="space-y-10">
      <div className="page-header-bar">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">
          The League
        </p>
        <h1 className="text-3xl font-black tracking-tight mt-1">Managers</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Alphabetical · trophies for titles · banners for divisions
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {managers.map((m) => {
          const total = m.wins + m.losses + m.ties;
          const winPct = total > 0 ? ((m.wins / total) * 100).toFixed(1) : "0.0";
          const trophies = getOwnerTrophies(m.displayName);
          const nick = lookupNickname(m.displayName);
          const about = lookupBio(m.displayName);
          const joined = getYearJoined(m.displayName);
          const rival = getBiggestRival(m.displayName);

          return (
            <div
              key={m.key}
              className="card p-5 flex flex-col min-h-[22rem]"
            >
              {/* Header block */}
              <div className="min-h-[3.5rem] flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                <h2 className="text-xl font-black leading-tight">
                  <Link
                    href={`/managers/${slugifyName(m.displayName)}`}
                    className="hover:text-[var(--gold)]"
                  >
                    {m.displayName}
                  </Link>
                </h2>
                <p className="text-sm text-[var(--gold)] font-semibold min-h-[1.25rem]">
                  {nick || "\u00A0"}
                </p>
                <p className="text-xs text-[var(--muted)] mt-1 min-h-[2.5rem]">
                  Joined {joined ?? "—"}
                  {rival ? (
                    <>
                      {" · "}Biggest rival:{" "}
                      <span className="text-[var(--foreground)]">
                        {rival.opponent}
                      </span>{" "}
                      ({rival.wins}–{rival.losses}
                      {rival.ties ? `–${rival.ties}` : ""})
                    </>
                  ) : (
                    <> · No rival yet (min 10 games)</>
                  )}
                </p>
                </div>
                {(() => {
                  const photo = managerPhotoUrl(m.displayName);
                  return photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo}
                      alt=""
                      className="manager-photo"
                    />
                  ) : (
                    <div className="manager-photo-slot" aria-hidden />
                  );
                })()}
              </div>

              {/* Championship trophies */}
              <div className="min-h-[3.25rem] flex flex-wrap gap-2 items-start content-start mt-3">
                {trophies.championships.length === 0 ? (
                  <span className="text-xs text-[var(--muted)] opacity-40">No titles yet</span>
                ) : (
                  trophies.championships.map((c) => (
                    <div
                      key={`c-${c.sport}-${c.year}`}
                      className="inline-flex flex-col items-center justify-center rounded-lg border border-[var(--gold-dim)] bg-gradient-to-b from-[#3d3210] to-[#1a1508] px-2.5 py-1.5 min-w-[3rem]"
                      title={`${c.champion}`}
                    >
                      <span className="text-lg leading-none">🏆</span>
                      <span className="text-[0.65rem] font-extrabold text-[var(--gold)] mt-0.5">
                        {c.year}
                      </span>
                      <span className="text-[0.55rem] text-[#d4c080]">
                        {c.sport === "football" ? "Football" : "Baseball"}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Division banners */}
              <div className="min-h-[3.5rem] flex flex-wrap gap-2 items-start content-start mt-2">
                {trophies.divisions.length === 0 ? (
                  <span className="text-xs text-[var(--muted)] opacity-40">No division titles</span>
                ) : (
                  trophies.divisions.map((d) => (
                    <div
                      key={`d-${d.sport}-${d.year}-${d.divisionName}`}
                      className="pennant pennant-sm"
                      title={d.divisionName}
                    >
                      <div className="p-year">
                        {d.year} {d.sport === "football" ? "Football" : "Baseball"}
                      </div>
                      <div className="p-team">{d.divisionName}</div>
                    </div>
                  ))
                )}
              </div>

              {/* About */}
              <div className="mt-3 flex-1 min-h-[4rem] border-t border-[#2a2834] pt-3">
                <p className="text-sm text-[var(--muted)] leading-relaxed line-clamp-4">
                  {about || "No bio yet."}
                </p>
              </div>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-lg bg-[#121018] py-2">
                  <p className="text-[var(--muted)] text-xs">Record</p>
                  <p className="font-semibold tabular-nums">
                    {m.wins}-{m.losses}
                    {m.ties > 0 ? `-${m.ties}` : ""}
                  </p>
                </div>
                <div className="rounded-lg bg-[#121018] py-2">
                  <p className="text-[var(--muted)] text-xs">Win %</p>
                  <p className="font-semibold tabular-nums">{winPct}%</p>
                </div>
                <div className="rounded-lg bg-[#121018] py-2">
                  <p className="text-[var(--muted)] text-xs">Titles</p>
                  <p className="font-semibold tabular-nums text-[var(--gold)]">
                    {m.championships}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p>
        <Link href="/" className="text-[var(--gold)] hover:underline text-sm">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
