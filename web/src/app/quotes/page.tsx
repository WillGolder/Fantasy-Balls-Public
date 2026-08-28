import Link from "next/link";
import { getAllQuotes } from "@/lib/data";

export default function QuotesPage() {
  const quotes = getAllQuotes();

  return (
    <div className="space-y-8">
      <div className="page-header-bar">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">
          Group Chat
        </p>
        <h1 className="text-3xl font-black tracking-tight mt-1">
          Quotes Hall of Fame
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Immortalized nonsense. Edit content/quotes.json to add more.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {quotes.map((q, i) => (
          <div key={i} className="card p-5 space-y-2">
            <p className="text-base font-medium leading-snug">“{q.text}”</p>
            {q.by && (
              <p className="text-sm text-[var(--gold)] font-semibold">— {q.by}</p>
            )}
            {"image" in q && (q as { image?: string }).image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={(q as { image?: string }).image}
                alt=""
                className="mt-2 max-h-48 w-full object-contain rounded"
              />
            )}
          </div>
        ))}
      </div>

      <p>
        <Link href="/" className="text-[var(--gold)] hover:underline text-sm">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
