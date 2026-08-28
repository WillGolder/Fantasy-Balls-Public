"use client";

import { useState } from "react";

type Section = { title: string; body: string };

export function RulesAccordion({ sections }: { sections: Section[] }) {
  const [open, setOpen] = useState<Record<number, boolean>>({});

  return (
    <div className="space-y-2">
      {sections.map((s, i) => {
        const isOpen = !!open[i];
        return (
          <div key={s.title} className="accordion-item">
            <button
              type="button"
              className="accordion-trigger"
              onClick={() => setOpen((prev) => ({ ...prev, [i]: !prev[i] }))}
            >
              <span>{s.title}</span>
              <span className="text-[var(--gold)]">{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen && (
              <div
                className="accordion-panel prose-rules text-sm"
                dangerouslySetInnerHTML={{ __html: s.body }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
