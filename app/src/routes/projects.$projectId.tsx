import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export const Route = createFileRoute("/projects/$projectId")({
  component: ProjectEditor,
});

const starterTypst = `= Hello from Typst Self-Host

This editor shell is ready for CodeMirror and typst.ts integration.

- Full project file tree
- Realtime single-user autosave
- Render-triggered snapshot
- Server-side PDF worker
`;

function ProjectEditor() {
  const { projectId } = Route.useParams() as { projectId: string };
  return (
    <main className="mx-auto max-w-[1560px] px-4 py-6 md:px-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-2">
          <Badge>Autosaved</Badge>
          <h1 className="font-bold text-4xl leading-[0.92] tracking-[-0.07em] md:text-6xl">
            Project {projectId}
          </h1>
          <p className="text-muted-foreground text-sm">
            Entrypoint `main.typ` · local preview shell · worker render queued by snapshot
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="secondary">
            Commit snapshot
          </Button>
          <Button type="button">Render PDF</Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[260px_minmax(420px,1fr)_minmax(340px,0.82fr)]">
        <Card className="min-h-0 xl:min-h-[640px]">
          <CardHeader>
            <CardTitle>Files</CardTitle>
            <p className="text-muted-foreground text-sm">Project tree</p>
          </CardHeader>
          <CardContent className="grid gap-4">
            <ul className="grid gap-2">
              <FileRow name="main.typ" detail="entry" active />
              <FileRow name="chapters/" detail="folder" />
              <FileRow name="assets/" detail="folder" />
              <FileRow name="references.bib" detail="text" />
            </ul>
            <Button type="button" variant="secondary">
              New file
            </Button>
          </CardContent>
        </Card>

        <Card className="min-h-0 xl:min-h-[640px]">
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div className="grid gap-1.5">
              <CardTitle>Source</CardTitle>
              <p className="text-muted-foreground text-sm">
                CodeMirror will replace this textarea.
              </p>
            </div>
            <Badge>Saved</Badge>
          </CardHeader>
          <CardContent>
            <textarea
              className="min-h-[500px] w-full resize-y rounded-2xl border border-border bg-editor bg-[linear-gradient(90deg,rgb(var(--editor-gutter))_0_3.3rem,transparent_3.3rem)] p-4 pl-[4.35rem] font-mono text-editor-foreground text-sm leading-7 outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
              defaultValue={starterTypst}
              aria-label="Typst source"
            />
          </CardContent>
        </Card>

        <Card className="min-h-0 xl:min-h-[640px]">
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div className="grid gap-1.5">
              <CardTitle>Preview</CardTitle>
              <p className="text-muted-foreground text-sm">typst.ts local preview target.</p>
            </div>
            <Badge variant="warning">Pending</Badge>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="min-h-[500px] rounded-2xl bg-preview p-4 text-preview-foreground">
              <article className="min-h-[430px] rounded-xl bg-white p-8 shadow-[0_20px_45px_rgb(48_38_33/0.16)]">
                <p className="text-muted-foreground">Local preview</p>
                <h2 className="mt-2 font-bold text-2xl">Hello from Typst Self-Host</h2>
                <p className="mt-4 leading-7">
                  This pane should feel like paper inside a dark writing environment. Real Typst
                  output will render here once typst.ts is connected.
                </p>
              </article>
            </div>
            <div className="grid gap-3 rounded-[var(--radius)] border border-border bg-secondary/50 p-4">
              <strong>Server render</strong>
              <p className="text-muted-foreground text-sm leading-6">
                PDF required. SVG opportunistic. Failures will surface diagnostics here.
              </p>
              <Button type="button">Render PDF</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function FileRow({
  name,
  detail,
  active = false,
}: { name: string; detail: string; active?: boolean }) {
  return (
    <li
      className={
        active
          ? "flex items-center justify-between rounded-xl border border-primary/50 bg-primary/15 px-4 py-3"
          : "flex items-center justify-between rounded-xl border border-border/70 bg-background/40 px-4 py-3"
      }
    >
      <span>{name}</span>
      <span className="text-muted-foreground text-sm">{detail}</span>
    </li>
  );
}
