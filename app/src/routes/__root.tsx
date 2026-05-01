import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
/// <reference types="vite/client" />
import type { ReactNode } from "react";
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
});

function RootComponent() {
  return (
    <RootDocument>
      <div className="shell">
        <header className="topbar">
          <strong>Typst Self-Host</strong>
          <nav className="nav" aria-label="Main navigation">
            <a href="/">Home</a>
            <a href="/setup">Setup</a>
            <a href="/admin">Admin</a>
            <a href="/projects/demo">Editor</a>
          </nav>
        </header>
        <Outlet />
      </div>
    </RootDocument>
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
