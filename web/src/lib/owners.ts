import type { Team } from "./types";

/** Manual name overrides (edit this to fix display names) */
const NAME_OVERRIDES: Record<string, string> = {
  "{F3D2771B-58FC-4E7C-ADBB-CB585F39D5CC}": "Eddie Cramsie",
  "Ginger Mets": "Eddie Cramsie",
  "EDDIE CRAMSIE": "Eddie Cramsie",
  "Eddie Cramsie": "Eddie Cramsie",
  "James Cunniffe": "Jimmy Cunniffe",
  "Cameron donachie": "Cameron Donachie",
  "Owen Faust": "Owen Faust",
  "Skyler Donachie": "Skyler Donachie",
  "Joseph Braun": "Joe Braun",
  "Joe Braun": "Joe Braun",
};

export function ownerKey(team: Team): string {
  const o = team.owners?.[0];
  return o?.id || o?.displayName || team.team_name;
}

export function ownerDisplayName(team: Team): string {
  const o = team.owners?.[0];
  if (!o) return "Unknown";

  const full = `${o.firstName || ""} ${o.lastName || ""}`.trim();
  const raw = full || o.displayName || "Unknown";

  if (o.id && NAME_OVERRIDES[o.id]) return NAME_OVERRIDES[o.id];
  if (o.displayName && NAME_OVERRIDES[o.displayName]) return NAME_OVERRIDES[o.displayName];
  if (NAME_OVERRIDES[raw]) return NAME_OVERRIDES[raw];

  if (raw === raw.toUpperCase() && raw.length > 2) {
    return raw
      .toLowerCase()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

  return raw;
}


/** Public site name. Managers pages keep legal names. */
export function siteName(name: string): string {
  const n = (name || "").trim();
  if (n === "Brendan Reed" || n.toLowerCase() === "chumba") return "Chumba";
  return name;
}
