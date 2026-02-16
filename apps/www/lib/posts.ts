import fs from "node:fs";
import path from "node:path";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export interface PostFrontmatter {
  title: string;
  date: string;
  description: string;
  tags: string[];
  image: string;
}

export function getPostSlugs(): string[] {
  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

export function getPostSource(slug: string): string {
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`);
  return fs.readFileSync(filePath, "utf-8");
}

export function getAllPosts(): { slug: string; frontmatter: PostFrontmatter }[] {
  const slugs = getPostSlugs();

  return slugs
    .map((slug) => {
      const source = getPostSource(slug);
      const frontmatter = parseFrontmatterQuick(source);
      return { slug, frontmatter };
    })
    .sort((a, b) => (a.frontmatter.date > b.frontmatter.date ? -1 : 1));
}

/** Quick frontmatter parser for listing pages (avoids compiling full MDX). */
function parseFrontmatterQuick(source: string): PostFrontmatter {
  const match = source.match(/^---\n([\s\S]*?)\n---/);
  if (!match) throw new Error("No frontmatter found");

  const raw = match[1];
  const data: Record<string, string> = {};

  for (const line of raw.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    // Strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }

  // Parse tags from "tag1, tag2" or "[tag1, tag2]" format
  let tags: string[] = [];
  if (data.tags) {
    const tagStr = data.tags.replace(/^\[|\]$/g, "");
    tags = tagStr.split(",").map((t) => t.trim().replace(/^["']|["']$/g, ""));
  }

  return {
    title: data.title || "",
    date: data.date || "",
    description: data.description || "",
    tags,
    image: data.image || "",
  };
}
