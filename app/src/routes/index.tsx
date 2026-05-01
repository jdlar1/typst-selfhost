import { createFileRoute } from "@tanstack/react-router";
import type { ComponentProps } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";

export const Route = createFileRoute("/")({
  component: FirstRun,
});

function FirstRun() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center px-4 py-8 md:px-8">
      <section className="grid w-full gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.72fr)]">
        <Card className="min-h-[560px]">
          <CardContent className="flex h-full flex-col justify-between gap-8 p-6 md:p-8">
            <div className="grid gap-5">
              <Badge variant="warning">First run</Badge>
              <h1 className="font-bold text-5xl leading-[0.9] tracking-[-0.075em] md:text-7xl">
                Create the superuser.
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground leading-8">
                This install is locked until the first admin account is created with the
                `INITIAL_SETUP_TOKEN` from `.env`. After that, the app opens directly into the
                editor and new users join by invite link.
              </p>
            </div>
            <div className="grid gap-3">
              <StatusRow
                label="Public signup"
                status="Disabled after setup"
                variant="destructive"
              />
              <StatusRow label="Default workspace" status="Created automatically" />
              <StatusRow label="Admin access" status="Profile menu" />
            </div>
          </CardContent>
        </Card>

        <Card className="min-h-[560px]">
          <CardHeader>
            <CardTitle>Superuser details</CardTitle>
            <p className="text-muted-foreground text-sm leading-6">
              Form wiring is next; this is the intended first-run flow.
            </p>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4">
              <Field label="Email" type="email" placeholder="admin@example.com" />
              <Field label="Password" type="password" placeholder="At least 12 characters" />
              <Field label="Setup token" type="password" placeholder="INITIAL_SETUP_TOKEN" />
              <div className="flex flex-wrap gap-3 pt-2">
                <Button type="button">Create superuser</Button>
                <Button asChild variant="ghost">
                  <a href="/projects/demo">View editor shell</a>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function Field({ label, ...props }: { label: string } & ComponentProps<typeof Input>) {
  const id = props.id ?? label.toLowerCase().replaceAll(" ", "-");
  return (
    <label className="grid gap-2 font-semibold text-muted-foreground text-sm" htmlFor={id}>
      {label}
      <Input id={id} {...props} />
    </label>
  );
}

function StatusRow({
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
