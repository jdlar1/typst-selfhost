import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

export const Route = createFileRoute("/invite/$token")({
  component: Invite,
});

function Invite() {
  const { token } = Route.useParams() as { token: string };
  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center px-4 py-8 md:px-8">
      <Card>
        <CardContent className="grid gap-5 p-6 md:p-8">
          <Badge>Invitation</Badge>
          <h1 className="font-bold text-5xl leading-[0.9] tracking-[-0.075em] md:text-6xl">
            Join this Typst workspace.
          </h1>
          <p className="text-muted-foreground leading-7">
            This invite will create or attach a Convex Auth user, then assign workspace access if
            the token is still valid.
          </p>
          <div className="rounded-[var(--radius)] border border-primary/30 bg-primary/10 p-4">
            Invite token preview: {token.slice(0, 10)}...
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="button">Accept invite</Button>
            <Button asChild variant="ghost">
              <a href="/">Back to setup</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
