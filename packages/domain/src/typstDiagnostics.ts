export type TypstDiagnostic = {
  severity: "error" | "warning" | "info";
  message: string;
  raw: string;
};

export function parseTypstDiagnostics(stderr: string): TypstDiagnostic[] {
  const lines = stderr
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [];
  }

  return lines
    .filter((line) => /^(error|warning|info):/i.test(line))
    .map((line) => {
      const [severityPart, ...messageParts] = line.split(":");
      const severity = severityPart?.toLowerCase();
      return {
        severity: severity === "warning" || severity === "info" ? severity : "error",
        message: messageParts.join(":").trim(),
        raw: line,
      };
    });
}
