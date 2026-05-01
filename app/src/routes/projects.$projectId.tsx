import { createFileRoute } from "@tanstack/react-router";

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
    <main className="page">
      <h1>Project {projectId}</h1>
      <p className="muted">Save state: saved. Entrypoint: main.typ.</p>
      <div className="editor-layout">
        <aside className="card file-tree">
          <h2>Files</h2>
          <ul>
            <li>main.typ</li>
            <li>assets/</li>
          </ul>
          <button className="button" type="button">
            New file
          </button>
        </aside>
        <section className="card editor-pane">
          <h2>Editor</h2>
          <textarea className="code" defaultValue={starterTypst} aria-label="Typst source" />
        </section>
        <aside className="card preview">
          <h2>Preview</h2>
          <p className="muted">typst.ts preview will render the current project entrypoint here.</p>
          <button className="button" type="button">
            Render PDF
          </button>
        </aside>
      </div>
    </main>
  );
}
