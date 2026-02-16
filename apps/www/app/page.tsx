import Image from "next/image";
import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export default function Home() {
  const posts = getAllPosts();

  return (
    <div className="space-y-8">
      {posts.map((post) => (
        <article key={post.slug} className="flex flex-col gap-4 sm:flex-row sm:gap-6">
          {post.frontmatter.image && (
            <div className="shrink-0 overflow-hidden rounded-lg sm:w-48">
              <Image
                src={post.frontmatter.image}
                alt={post.frontmatter.title}
                width={400}
                height={200}
                className="aspect-video w-full object-cover"
              />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <Link href={`/blog/${post.slug}`} className="group">
              <h2 className="text-xl font-semibold group-hover:underline">
                {post.frontmatter.title}
              </h2>
            </Link>
            <p className="text-sm text-muted-foreground">{post.frontmatter.description}</p>
            <time className="mt-1 text-xs italic text-muted-foreground">
              {post.frontmatter.date}
            </time>
          </div>
        </article>
      ))}
    </div>
  );
}
