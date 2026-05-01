import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <main className="page">
      <section className="card">
        <p className="muted">Self-hostable Typst authoring</p>
        <h1>Write, preview, and render Typst projects from your own server.</h1>
        <p>
          Milestone 1 includes setup-token bootstrap, Convex Auth, invitation links, a real project
          file tree, local preview, server-side PDF rendering, and dark mode from the start.
        </p>
        <a className="button" href="/setup">
          Start setup
        </a>
      </section>
    </main>
  );
}
