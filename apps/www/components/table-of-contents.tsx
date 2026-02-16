"use client";

import { useEffect, useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface TocEntry {
  id: string;
  text: string;
  level: 2 | 3;
}

interface TocGroup {
  heading: TocEntry;
  children: TocEntry[];
}

interface TableOfContentsProps {
  /** Whether nested h3 sections are expanded by default. Defaults to false. */
  defaultExpanded?: boolean;
}

function groupEntries(entries: TocEntry[]): (TocEntry | TocGroup)[] {
  const result: (TocEntry | TocGroup)[] = [];

  for (const entry of entries) {
    if (entry.level === 2) {
      result.push({ heading: entry, children: [] });
    } else if (result.length > 0) {
      const last = result[result.length - 1];
      if ("children" in last) {
        last.children.push(entry);
      } else {
        // h3 without a preceding h2 — render standalone
        result.push(entry);
      }
    } else {
      // h3 before any h2
      result.push(entry);
    }
  }

  return result;
}

export function TableOfContents({ defaultExpanded = false }: TableOfContentsProps) {
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

  const groups = groupEntries(entries);

  return (
    <nav
      aria-label="Table of contents"
      className="not-prose my-8 rounded-lg border border-border bg-muted/50 p-4"
    >
      <p className="mb-3 text-sm font-semibold text-foreground">Table of Contents</p>
      <ul className="space-y-1.5 text-sm">
        {groups.map((item) => {
          // Standalone h3 (no parent h2)
          if ("id" in item && !("children" in item)) {
            return (
              <li key={item.id} className="ml-4">
                <a
                  href={`#${item.id}`}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.text}
                </a>
              </li>
            );
          }

          const group = item as TocGroup;

          // h2 with no children — simple link
          if (group.children.length === 0) {
            return (
              <li key={group.heading.id}>
                <a
                  href={`#${group.heading.id}`}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {group.heading.text}
                </a>
              </li>
            );
          }

          // h2 with children — collapsible
          return (
            <li key={group.heading.id}>
              <Collapsible defaultOpen={defaultExpanded} className="group/toc">
                <span className="inline-flex items-center gap-1">
                  <a
                    href={`#${group.heading.id}`}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {group.heading.text}
                  </a>
                  <CollapsibleTrigger className="inline-flex items-center text-muted-foreground/60 transition-colors hover:text-foreground">
                    <span className="inline-block text-[10px] leading-none transition-transform duration-200 group-data-[state=open]/toc:rotate-90">
                      ▶
                    </span>
                  </CollapsibleTrigger>
                </span>
                <CollapsibleContent>
                  <ul className="mt-1 ml-1 space-y-0">
                    {group.children.map((child, i) => {
                      const isFirst = i === 0;
                      const isLast = i === group.children.length - 1;
                      return (
                        <li key={child.id} className="relative py-[3px] pl-6">
                          {/* Vertical line segment */}
                          <span
                            className={cn(
                              "absolute left-0 w-px bg-muted-foreground/20",
                              isFirst ? "-top-1" : "top-0",
                              isLast ? "bottom-1/2" : "bottom-0",
                            )}
                          />
                          {/* Horizontal branch */}
                          <span className="absolute left-0 top-1/2 h-px w-4 bg-muted-foreground/20" />
                          {/* Circle terminator */}
                          <span className="absolute left-[15px] top-1/2 size-[5px] -translate-y-1/2 rounded-full border border-muted-foreground/30" />
                          <a
                            href={`#${child.id}`}
                            className="text-muted-foreground transition-colors hover:text-foreground"
                          >
                            {child.text}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
