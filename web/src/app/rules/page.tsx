import fs from "fs";
import path from "path";
import Link from "next/link";
import { RulesAccordion } from "./RulesAccordion";

function parseSections(md: string): { title: string; body: string }[] {
  const lines = md.split("\n");
  const sections: { title: string; body: string }[] = [];
  let currentTitle = "";
  let currentBody: string[] = [];

  const flush = () => {
    if (!currentTitle) return;
    const raw = currentBody.join("\n").trim();
    // very light markdown → html
    let html = raw
      .replace(/^### (.*)$/gm, "<h3>$1</h3>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/^\- (.*)$/gm, "<li>$1</li>")
      .replace(/^(\d+)\. (.*)$/gm, "<li>$2</li>");
    html = html.replace(/(<li>[\s\S]*?<\/li>)/g, (m) => {
      if (m.includes("<li>")) return `<ul>${m}</ul>`;
      return m;
    });
    // paragraphs
    html = html
      .split(/\n\n+/)
      .map((block) => {
        if (block.startsWith("<")) return block;
        return `<p>${block.replace(/\n/g, "<br/>")}</p>`;
      })
      .join("\n");
    sections.push({ title: currentTitle, body: html });
  };

  for (const line of lines) {
    if (line.startsWith("## ")) {
      flush();
      currentTitle = line.replace(/^##\s+/, "").trim();
      currentBody = [];
    } else if (line.startsWith("# ")) {
      // skip main title
      continue;
    } else {
      currentBody.push(line);
    }
  }
  flush();
  return sections;
}

export default function RulesPage() {
  const filePath = path.join(process.cwd(), "content", "rules.md");
  const md = fs.existsSync(filePath)
    ? fs.readFileSync(filePath, "utf-8")
    : "# Rules\n\n## Coming soon\n";
  const sections = parseSections(md);

  return (
    <div className="space-y-8">
      <div className="page-header-bar">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">
          Official
        </p>
        <h1 className="text-3xl font-black tracking-tight mt-1">Constitution</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Click a section to expand. Edit content/rules.md anytime.
        </p>
      </div>
      <RulesAccordion sections={sections} />
      <p>
        <Link href="/" className="text-[var(--gold)] hover:underline text-sm">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
