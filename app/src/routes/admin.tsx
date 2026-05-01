import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  component: Admin,
});

function Admin() {
  return (
    <main className="page">
      <h1>Superuser admin</h1>
      <div className="grid">
        <section className="card">
          <h2>Invitations</h2>
          <p className="muted">
            Create copyable invite links, revoke unused links, and review accepted invites.
          </p>
          <button className="button" type="button">
            Create invite
          </button>
        </section>
        <section className="card">
          <h2>Service status</h2>
          <p>Convex: configured</p>
          <p>RustFS: configured through environment</p>
          <p>Worker: awaiting heartbeat integration</p>
        </section>
      </div>
    </main>
  );
}
