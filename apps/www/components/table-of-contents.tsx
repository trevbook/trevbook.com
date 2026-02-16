"use client";

import { useEffect, useState } from "react";

interface TocEntry {
  id: string;
  text: string;
  level: 2 | 3;
}

export function TableOfContents() {
  const [entries, setEntries] = useState<TocEntry[]>([]);

  useEffect(() => {
    const headings = document.querySelectorAll<HTMLHeadingElement>(".prose h2[id], .prose h3[id]");

    const items: TocEntry[] = [];
    for (const h of headings) {
      items.push({
        id: h.id,
        text: h.textContent ?? "",
        level: h.tagName === "H2" ? 2 : 3,
      });
    }
    setEntries(items);
  }, []);

  if (entries.length === 0) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="not-prose my-8 rounded-lg border border-border bg-muted/50 p-4"
    >
      <p className="mb-3 text-sm font-semibold text-foreground">Table of Contents</p>
      <ul className="space-y-1.5 text-sm">
        {entries.map((entry) => (
          <li key={entry.id} className={entry.level === 3 ? "ml-4" : ""}>
            <a
              href={`#${entry.id}`}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
