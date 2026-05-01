import { createFileRoute } from "@tanstack/react-router";
import type { ComponentProps } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";

export const Route = createFileRoute("/setup")({
  component: Setup,
});

function Setup() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center px-4 py-8 md:px-8">
      <Card>
        <CardContent className="grid gap-5 p-6 md:p-8">
          <Badge variant="warning">First run</Badge>
          <h1 className="font-bold text-5xl leading-[0.9] tracking-[-0.075em] md:text-6xl">
            Create the superuser.
          </h1>
          <p className="text-muted-foreground leading-7">
            Same setup flow as the app root. Once this is wired, completed setup should take the
            user straight to the editor workspace.
          </p>
          <form className="grid gap-4 md:grid-cols-2">
            <Field label="Email" type="email" placeholder="admin@example.com" />
            <Field label="Password" type="password" placeholder="At least 12 characters" />
            <Field label="Setup token" type="password" placeholder="INITIAL_SETUP_TOKEN" />
          </form>
          <div className="flex flex-wrap gap-3">
            <Button type="button">Create superuser</Button>
            <Button asChild variant="ghost">
              <a href="/projects/demo">View editor shell</a>
            </Button>
          </div>
        </CardContent>
      </Card>
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
