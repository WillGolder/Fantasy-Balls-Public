import { getTimeline } from "@/lib/data";

export default function TimelinePage() {
  const events = getTimeline();
  return (
    <div className="space-y-8 max-w-3xl">
      <div className="page-header-bar">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">
          History
        </p>
        <h1 className="text-3xl font-black tracking-tight mt-1">Timeline</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          League moments. Edit content/timeline.json to add more.
        </p>
      </div>
      <ol className="space-y-4">
        {events.map((e, i) => (
          <li key={`${e.date}-${i}`} className="card p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--gold)]">
              {e.date}
            </p>
            <h2 className="text-lg font-black mt-1">{e.title}</h2>
            <p className="text-sm text-[var(--muted)] mt-2 leading-relaxed">{e.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
