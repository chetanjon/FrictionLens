/**
 * Tiny structured-logger shim. Output is single-line JSON so log aggregators
 * (Vercel, Datadog, Logtail) can index fields. Kept dependency-free so it
 * works in edge runtime as well as Node.
 *
 * Usage: log.error("pipeline_failed", { analysisId, error });
 */

type Level = "info" | "warn" | "error";
type Fields = Record<string, unknown>;

function emit(level: Level, event: string, fields?: Fields): void {
  const payload: Record<string, unknown> = {
    ts: new Date().toISOString(),
    level,
    event,
    ...fields,
  };
  // Normalise Error instances so message + stack survive JSON.stringify.
  if (payload.error instanceof Error) {
    const e = payload.error;
    payload.error = { message: e.message, stack: e.stack, name: e.name };
  }
  const line = JSON.stringify(payload);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const log = {
  info: (event: string, fields?: Fields) => emit("info", event, fields),
  warn: (event: string, fields?: Fields) => emit("warn", event, fields),
  error: (event: string, fields?: Fields) => emit("error", event, fields),
};
