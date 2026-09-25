export function parseModelJson(raw: string): unknown {
  return JSON.parse(
    raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, ''),
  );
}
