import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCombinedOwnerCareerStats,
  getOwnerBySlug,
  slugifyName,
  getOwnerTrophies,
  lookupBio,
  lookupNickname,
  getYearJoined,
  getBiggestRival,
  getOwnerSeasonLog,
  getHeadToHeadRecordsDetailed,
  managerPhotoUrl,
} from "@/lib/data";

export function generateStaticParams() {
  return getCombinedOwnerCareerStats().map((o) => ({
    slug: slugifyName(o.displayName),
  }));
}

export default async function ManagerProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const m = getOwnerBySlug(slug);
  if (!m) notFound();

  const nick = lookupNickname(m.displayName);
  const about = lookupBio(m.displayName);
  const joined = getYearJoined(m.displayName);
  const rival = getBiggestRival(m.displayName);
  const trophies = getOwnerTrophies(m.displayName);
  const log = getOwnerSeasonLog(m.displayName);
  const h2h = getHeadToHeadRecordsDetailed().filter(
    (r) => r.ownerA === m.displayName || r.ownerB === m.displayName
  );
  const total = m.wins + m.losses + m.ties;
  const winPct = total > 0 ? (m.wins / total) * 100 : 0;

  return (
    <div className="space-y-10">
      <div className="page-header-bar flex items-start justify-between gap-4">
        <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">
          Manager
        </p>
        <h1 className="text-3xl font-black tracking-tight mt-1">{m.displayName}</h1>
        {nick && (
          <p className="text-[var(--gold)] font-semibold mt-1">{nick}</p>
        )}
        <p className="mt-2 text-sm text-[var(--muted)]">
          Joined {joined ?? "—"} · {m.wins}-{m.losses}
          {m.ties ? `-${m.ties}` : ""} ({winPct.toFixed(1)}%) · {m.championships}{" "}
          titles
          {rival && (
            <>
              {" · "}Biggest rival: {rival.opponent} ({rival.wins}–{rival.losses}
              {rival.ties ? `–${rival.ties}` : ""})
            </>
          )}
        </p>
        </div>
        {managerPhotoUrl(m.displayName) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={managerPhotoUrl(m.displayName)!}
            alt=""
            className="manager-photo w-24 h-24"
          />
        )}
      </div>

      {about && (
        <section className="card p-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--gold)] mb-2">
            About
          </h2>
          <p className="text-sm text-[var(--muted)] leading-relaxed">{about}</p>
        </section>
      )}

      {(trophies.championships.length > 0 || trophies.divisions.length > 0) && (
        <section className="space-y-3">
          <h2 className="section-title">
            Trophy <span>Room</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {trophies.championships.map((c) => (
              <div key={`c-${c.sport}-${c.year}`} className="pennant pennant-sm">
                <div className="p-year">
                  {c.year} {c.sport === "football" ? "🏈" : "⚾"}
                </div>
                <div className="p-team">Champ</div>
              </div>
            ))}
          </div>
          {trophies.divisions.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {trophies.divisions.map((d) => (
                <div
                  key={`d-${d.sport}-${d.year}-${d.divisionName}`}
                  className="div-chip"
                >
                  🚩 {d.year} {d.sport === "football" ? "🏈" : "⚾"}{" "}
                  {d.divisionName}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="space-y-3">
        <h2 className="section-title">
          Season <span>Log</span>
        </h2>
        <div className="card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Sport</th>
                <th>Team</th>
                <th>Division</th>
                <th className="num">Record</th>
                <th className="num">PF</th>
                <th className="num">Finish</th>
              </tr>
            </thead>
            <tbody>
              {log.map((row) => (
                <tr key={`${row.sport}-${row.year}`}>
                  <td>
                    <Link
                      href={`/${row.sport}/${row.year}`}
                      className="text-[var(--gold)] hover:underline font-medium"
                    >
                      {row.year}
                    </Link>
                  </td>
                  <td>
                    {row.sport === "football" ? "Football" : "Baseball"}
                  </td>
                  <td>{row.teamName}</td>
                  <td className="text-[var(--muted)]">
                    {row.divisionName || "—"}
                  </td>
                  <td className="num">
                    {row.wins}-{row.losses}
                    {row.ties ? `-${row.ties}` : ""}
                  </td>
                  <td className="num">
                    {row.pointsFor != null ? row.pointsFor.toFixed(0) : "—"}
                  </td>
                  <td className="num">{row.finalStanding || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="section-title">
          Head-to-Head
        </h2>
        <div className="card overflow-x-auto max-h-96 overflow-y-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Opponent</th>
                <th className="num">Overall</th>
                <th className="num">Games</th>
              </tr>
            </thead>
            <tbody>
              {h2h.map((r) => {
                const opp = r.ownerA === m.displayName ? r.ownerB : r.ownerA;
                const w = r.ownerA === m.displayName ? r.winsA : r.winsB;
                const l = r.ownerA === m.displayName ? r.winsB : r.winsA;
                return (
                  <tr key={opp}>
                    <td className="font-medium">{opp}</td>
                    <td className="num">
                      {w}–{l}
                      {r.ties ? `–${r.ties}` : ""}
                    </td>
                    <td className="num text-[var(--muted)]">{r.totalGames}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p>
        <Link href="/managers" className="text-[var(--gold)] hover:underline text-sm">
          ← All managers
        </Link>
      </p>
    </div>
  );
}
