import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
/// <reference types="vite/client" />
import type { ReactNode } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import "../styles/app.css";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Typst Self-Host" },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFound,
});

function RootComponent() {
  return (
    <RootDocument>
      <div className="min-h-screen">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-border/80 border-b bg-background/75 px-4 py-3 backdrop-blur-xl md:px-8">
          <a
            className="flex items-center gap-3 font-bold tracking-[-0.03em]"
            href="/"
            aria-label="Typst Self-Host home"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent font-extrabold text-primary-foreground shadow-[0_0_30px_rgb(154_121_255/0.28)]">
              T
            </span>
            <span>Typst Self-Host</span>
          </a>
          <div className="flex items-center gap-3">
            <Badge variant="warning">Setup mode</Badge>
            <details className="relative">
              <summary className="list-none" aria-label="Open profile menu">
                <span className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-border bg-secondary font-extrabold text-xs">
                  JD
                </span>
              </summary>
              <div className="absolute top-12 right-0 z-20 grid min-w-52 gap-1 rounded-[var(--radius)] border border-border bg-card p-2 shadow-2xl">
                <span className="rounded-lg px-3 py-2 font-bold text-sm">Local instance</span>
                <a
                  className="rounded-lg px-3 py-2 text-muted-foreground text-sm hover:bg-secondary/80 hover:text-foreground"
                  href="/projects/demo"
                >
                  Open editor
                </a>
                <a
                  className="rounded-lg px-3 py-2 text-muted-foreground text-sm hover:bg-secondary/80 hover:text-foreground"
                  href="/admin"
                >
                  Admin mode
                </a>
                <a
                  className="rounded-lg px-3 py-2 text-muted-foreground text-sm hover:bg-secondary/80 hover:text-foreground"
                  href="/setup"
                >
                  First-run setup
                </a>
              </div>
            </details>
          </div>
        </header>
        <Outlet />
      </div>
    </RootDocument>
  );
}

function NotFound() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center px-4 py-10">
      <Card>
        <CardContent className="grid gap-5 p-6">
          <Badge variant="destructive">Not found</Badge>
          <h1 className="font-bold text-4xl tracking-[-0.06em] md:text-6xl">
            This route is not part of the workspace.
          </h1>
          <p className="max-w-2xl text-muted-foreground leading-7">
            This route is not available in the current M1 shell. Return to first-run setup or open
            the editor workspace.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <a href="/">Back home</a>
            </Button>
            <Button asChild variant="secondary">
              <a href="/projects/demo">Open editor shell</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
