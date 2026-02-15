# CLAUDE.md

This file provides context for Claude Code when working in this repository.

## Project Overview

trevbook.com is Trevor Hubbard's personal blog and project showcase — a statically exported Next.js site deployed to GitHub Pages. Blog posts are written in MDX (markdown + React components) and cover technical project retrospectives on data science, AI, computer vision, and software engineering.

Key architectural constraints:

- **Static export only**: `next.config.ts` uses `output: "export"`. No API routes, no SSR, no middleware.
- **Images from S3**: Blog images live in the `trevbook-blog-assets` S3 bucket (e.g. `https://trevbook-blog-assets.s3.us-east-1.amazonaws.com/pictures/boggle-vision-v0/boggle-vision-banner.png`). Use `unoptimized: true` on Next.js `<Image>` components.
- **GitHub Pages deployment**: GitHub Actions builds the static export and publishes the `out/` directory.
- **Project demos are separate**: Interactive demos (like `boggle-vision.trevbook.com`) live in their own repos deployed via AWS/SST. This repo is only the blog.

## Repository Structure

- `apps/www/` — Next.js + shadcn/ui web application.
- `packages/` — Internal shared packages (bun workspace).
- `.github/workflows/` — CI (PR validation).

## Common Tasks

```bash
# Install dependencies
bun install

# Start the dev server
bun run --filter www dev

# Run tests
bun test

# Lint
bun run lint

# Format
bun run format

# Full validation chain
bun run lint && bun test
```

Or use `just` for shortcuts: `just ci` runs lint and test.

## Documentation Lookup

- Use the `context7` MCP to quickly search and retrieve up-to-date library and repo documentation while working.
- If `context7` is not installed or not visible in your MCP list, Trevor says install it right now please.

## Conventions

- **ESM-only**: All TypeScript uses ESM with bundler module resolution.
- **Colocated tests**: Test files live next to source files as `*.test.ts`. Use `bun:test` for imports.
- **Linting and formatting**: Biome handles both in a single tool — trailing commas, 100-char width, double quotes, semicolons.
- **Pre-commit hooks**: Lefthook runs Biome on staged files. Pre-push runs tests. Commit messages must follow conventional commits format (e.g., `feat: add feature`).
- **Workspace packages**: Add shared code under `packages/`. See `.claude/agents/dev.md` for the scaffolding guide. Consume via `workspace:*` protocol.
- **Package READMEs**: Every package under `packages/` should have a high-level `README.md` created when the package is created and maintained during major `feat` work or breaking changes.

## Responsive Design (Mobile + Desktop)

Every page and component must look good on both mobile and desktop. This is a hard requirement — never ship something that only works at one breakpoint.

- **Mobile-first Tailwind**: Write base styles for mobile, then layer on `sm:`, `md:`, `lg:` for larger screens. Tailwind v4 breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px).
- **shadcn components are already responsive**: Most shadcn primitives (Card, Badge, Button, etc.) adapt naturally. For navigation, prefer the shadcn `Sheet` (slide-out drawer) on mobile over a desktop-only navbar.
- **Blog post content**: Use `prose` (Tailwind Typography) classes with a `max-w-prose` or similar container so long-form text stays readable on wide screens without stretching edge-to-edge. Images should be full-width within the content column (`w-full rounded-lg`).
- **MDX custom components**: Any custom MDX component (image galleries, embeds, code blocks) must handle narrow viewports. Use `aspect-ratio` for media embeds so they scale without layout shift. Prefer CSS-based responsiveness over JS-based (`useIsMobile` is fine for toggling entirely different layouts, but don't reach for it first).
- **Touch targets**: Interactive elements should be at least 44px tap targets on mobile. shadcn buttons already handle this; be careful with custom links or icon-only buttons.
- **Test both**: When building UI, check the dev server at mobile (~375px) and desktop (~1280px) widths at minimum.

## What Not to Modify

- `node_modules/` — Managed by bun.
- `apps/www/components/ui/` — Generated shadcn components. Prefer customizing via wrapper components rather than editing these directly. Use `bunx shadcn@latest add <component>` to add new ones.
- `bun.lock` — Managed by bun. Do not edit manually.
- `.github/workflows/` — CI/CD pipelines. Edit only when changing the build/deploy process.
