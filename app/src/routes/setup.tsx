import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/setup")({
  component: Setup,
});

function Setup() {
  return (
    <main className="page">
      <section className="card">
        <h1>First-run setup</h1>
        <p className="muted">
          Create the first superuser with the `INITIAL_SETUP_TOKEN` from `.env`. Public signup
          closes after setup.
        </p>
        <form className="grid">
          <label>
            Email
            <input type="email" placeholder="admin@example.com" />
          </label>
          <label>
            Password
            <input type="password" placeholder="At least 12 characters" />
          </label>
          <label>
            Setup token
            <input type="password" placeholder="INITIAL_SETUP_TOKEN" />
          </label>
        </form>
        <p className="muted">
          Convex Auth wiring is defined in `convex/auth.ts`; UI submission is the next integration
          step.
        </p>
      </section>
    </main>
  );
}
