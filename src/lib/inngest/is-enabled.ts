export function isInngestEnabled(): boolean {
  return !!(process.env.INNGEST_EVENT_KEY || process.env.INNGEST_DEV === "1");
}
