"use client";

import Link from "next/link";
import { useState } from "react";

const groups = [
  {
    label: "Leagues",
    items: [
      { href: "/football", label: "Football" },
      { href: "/baseball", label: "Baseball" },
    ],
  },
  {
    label: "History",
    items: [
      { href: "/all-time", label: "All-Time" },
      { href: "/trophies", label: "Trophies" },
      { href: "/superlatives", label: "Superlatives" },
      { href: "/wall-of-shame", label: "Wall of Shame" },
      { href: "/timeline", label: "Timeline" },
    ],
  },
  {
    label: "Competition",
    items: [
      { href: "/rivalries", label: "Rivalries" },
      { href: "/power-rankings", label: "Power Rankings" },
    ],
  },
  {
    label: "League",
    items: [
      { href: "/rules", label: "Constitution" },
      { href: "/quotes", label: "Quotes Hall of Fame" },
    ],
  },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="sm:hidden text-[var(--gold)] font-bold text-sm"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Close" : "Menu"}
      </button>
      <nav
        className={`${
          open ? "flex" : "hidden"
        } sm:flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto`}
      >
        <Link href="/" className="nav-link" onClick={() => setOpen(false)}>
          Home
        </Link>
        {groups.map((g) => (
          <div key={g.label} className="nav-dropdown">
            <button type="button" className="nav-link">
              {g.label} ▾
            </button>
            <div className="nav-dropdown-menu">
              {g.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
        <Link href="/managers" className="nav-link" onClick={() => setOpen(false)}>
          Managers
        </Link>
      </nav>
    </>
  );
}
