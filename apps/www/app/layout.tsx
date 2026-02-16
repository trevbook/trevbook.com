import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "trevbook",
  description: "A showcase of some stuff I've done",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="mx-auto flex min-h-svh max-w-3xl flex-col px-6">
            <header className="flex flex-col items-center gap-4 border-b border-border py-6 sm:flex-row sm:justify-between">
              <div className="text-center sm:text-left">
                <Link href="/" className="text-2xl font-light tracking-wide text-foreground">
                  trevbook
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">
                  A showcase of some stuff I've done
                </p>
              </div>
              <nav className="flex items-center gap-6 text-sm font-medium">
                <Link
                  href="/"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Blog
                </Link>
                <Link
                  href="/about"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  About
                </Link>
                <ModeToggle />
              </nav>
            </header>

            <main className="flex-1 py-10">{children}</main>

            <footer className="flex flex-col items-center gap-3 border-t border-border py-6 text-sm text-muted-foreground">
              <div className="flex gap-4">
                <a
                  href="https://github.com/trevbook"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-foreground"
                >
                  GitHub
                </a>
                <a
                  href="https://twitter.com/trevbook"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-foreground"
                >
                  Twitter
                </a>
                <a
                  href="https://linkedin.com/in/trevormhubbard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-foreground"
                >
                  LinkedIn
                </a>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
