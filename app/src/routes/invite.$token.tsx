import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/invite/$token")({
  component: Invite,
});

function Invite() {
  const { token } = Route.useParams() as { token: string };
  return (
    <main className="page">
      <section className="card">
        <h1>Accept invitation</h1>
        <p className="muted">Invite token received: {token.slice(0, 8)}...</p>
        <p>Create or sign in to a Convex Auth user, then accept this invite.</p>
      </section>
    </main>
  );
}
