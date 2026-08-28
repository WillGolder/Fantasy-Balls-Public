import Link from "next/link";
import { getRivalryTiles } from "@/lib/data";
import { siteName } from "@/lib/owners";
import { RivalriesView } from "./RivalriesView";

function labelTiles(list: ReturnType<typeof getRivalryTiles>["mostGames"]) {
  return list.map((r) => ({
    ...r,
    name: null,
    ownerA: siteName(r.ownerA),
    ownerB: siteName(r.ownerB),
  }));
}

export default function RivalriesPage() {
  const tiles = getRivalryTiles(10);

  return (
    <div className="space-y-8">
      <div className="page-header-bar">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">
          Career Head-to-Head
        </p>
        <h1 className="text-3xl font-black tracking-tight mt-1">Rivalries</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Left: most games. Right: closest series. Min 10 games combined.
        </p>
      </div>
      <RivalriesView
        mostGames={labelTiles(tiles.mostGames)}
        closest={labelTiles(tiles.closest)}
        mostGamesAll={labelTiles(tiles.mostGamesAll)}
        closestAll={labelTiles(tiles.closestAll)}
      />
      <p>
        <Link href="/" className="text-[var(--gold)] hover:underline text-sm">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
