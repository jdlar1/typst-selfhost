import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export const Route = createFileRoute("/admin")({
  component: Admin,
});

function Admin() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <div className="grid gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="grid gap-3">
            <Badge>Superuser</Badge>
            <h1 className="font-bold text-5xl leading-[0.9] tracking-[-0.075em] md:text-6xl">
              Instance admin
            </h1>
            <p className="max-w-2xl text-muted-foreground leading-7">
              Admin remains a mode from the profile menu: invites, users, setup state, and service
              visibility.
            </p>
          </div>
          <Button asChild variant="secondary">
            <a href="/projects/demo">Return to editor</a>
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex-row items-start justify-between gap-4">
              <div className="grid gap-1.5">
                <CardTitle>Invitations</CardTitle>
                <p className="text-muted-foreground text-sm">Copyable links first, SMTP later.</p>
              </div>
              <Button type="button">Create invite</Button>
            </CardHeader>
            <CardContent className="grid gap-3">
              <AdminRow label="member invite" status="Expires soon" variant="warning" />
              <AdminRow label="admin invite" status="Active" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service status</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <AdminRow label="Convex" status="Configured" />
              <AdminRow label="RustFS" status="Env ready" />
              <AdminRow label="Worker" status="Awaiting heartbeat" variant="warning" />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

function AdminRow({
  label,
  status,
  variant = "default",
}: {
  label: string;
  status: string;
  variant?: "default" | "warning" | "destructive";
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-background/40 px-4 py-3">
      <span>{label}</span>
      <Badge variant={variant}>{status}</Badge>
    </div>
  );
}
