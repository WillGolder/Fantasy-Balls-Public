import Link from "next/link";

export function DeskNav({ current }: { current: "main" | "scores" }) {
  return (
    <p className="flex gap-4 text-sm">
      <Link
        href="/commissionerdesk"
        className={current === "main" ? "text-[var(--gold)]" : "text-[var(--muted)] hover:text-[var(--gold)]"}
      >
        Desk
      </Link>
      <Link
        href="/commissionerdesk/scores"
        className={current === "scores" ? "text-[var(--gold)]" : "text-[var(--muted)] hover:text-[var(--gold)]"}
      >
        Score vault
      </Link>
    </p>
  );
}
