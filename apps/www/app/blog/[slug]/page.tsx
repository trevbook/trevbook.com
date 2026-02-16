import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/lib/mdx-components";
import type { PostFrontmatter } from "@/lib/posts";
import { getPostSlugs, getPostSource } from "@/lib/posts";

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let source: string;
  try {
    source = getPostSource(slug);
  } catch {
    notFound();
  }

  const { content, frontmatter } = await compileMDX<PostFrontmatter>({
    source,
    options: { parseFrontmatter: true },
    components: mdxComponents,
  });

  return (
    <article>
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{frontmatter.title}</h1>
        <time className="mt-2 block text-sm italic text-muted-foreground">{frontmatter.date}</time>
      </header>
      <div className="prose prose-neutral max-w-none">{content}</div>
    </article>
  );
}
