# trevbook.com

A personal blog and project showcase built with Next.js and MDX. Technical retrospectives on projects spanning data science, AI, computer vision, and software engineering — starting with [Boggle Vision](https://boggle-vision.trevbook.com), a computer-vision-powered Boggle solver.

## Prerequisites

- [Bun](https://bun.sh) (latest)
- Node.js 22+ (for Next.js dev server)

## Getting Started

```bash
# Install dependencies
bun install

# Start the dev server
bun run --filter www dev

# Run tests
bun test
```

Or use `just` for shortcuts — run `just` to see all available commands.

## Available Scripts

| Command | Description |
|---------|-------------|
| `bun test` | Run tests (bun:test) |
| `bun test --watch` | Run tests in watch mode |
| `bun run lint` | Lint with Biome |
| `bun run lint:fix` | Lint and auto-fix |
| `bun run format` | Format with Biome |
| `bun run format:check` | Check formatting |
| `just ci` | Run all checks (lint, test) |

## Project Structure

```
trevbook.com/
  package.json              # Monorepo root with dev tooling
  tsconfig.json             # TypeScript base config (bundler, strict)
  biome.json                # Biome linting and formatting
  bunfig.toml               # Bun configuration
  lefthook.yml              # Git hook automation
  justfile                  # Task runner shortcuts
  apps/
    www/  # Next.js + shadcn/ui
  packages/                 # Internal shared packages
  .github/workflows/
    ci.yml                  # PR/push validation
```

## Architecture

This is a **statically exported** Next.js site deployed to **GitHub Pages** via GitHub Actions.

- **Static export**: `next.config.ts` uses `output: "export"` — no API routes, no SSR, no middleware.
- **MDX blog posts**: Posts are authored in MDX so they can mix standard markdown with interactive React components.
- **Images**: Blog images are served from an S3 bucket (`trevbook-blog-assets.s3.us-east-1.amazonaws.com`), not from the repo's `public/` folder. The Next.js `<Image>` component uses `unoptimized: true` since there's no image optimization server.
- **Project demos**: Separate interactive demos (e.g. `boggle-vision.trevbook.com`) live in their own repos and are deployed independently via AWS/SST. This repo is just the blog.

## License

UNLICENSED
