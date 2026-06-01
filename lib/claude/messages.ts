type ClaudeMessageResponse = {
  content?: Array<{ type: string; text?: string }>;
};

export async function claudeJsonOnly(
  systemPrompt: string,
  userText: string
): Promise<unknown> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY");
  }

  const model = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20240620";

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userText }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Claude API error (${res.status}): ${text}`);
  }

  const data = (await res.json()) as ClaudeMessageResponse;
  const outText = data.content?.find((c) => c.type === "text")?.text ?? "";

  const parsed = safeJsonParse(outText);
  if (parsed.ok) return parsed.value;

  // Fallback: try extracting the first JSON object/array substring.
  const extracted = extractJsonSubstring(outText);
  const parsed2 = safeJsonParse(extracted);
  if (parsed2.ok) return parsed2.value;

  throw new Error("Claude response was not valid JSON");
}

function safeJsonParse(
  value: string
): { ok: true; value: unknown } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(value) };
  } catch {
    return { ok: false };
  }
}

function extractJsonSubstring(text: string): string {
  const trimmed = text.trim();
  const firstObj = trimmed.indexOf("{");
  const firstArr = trimmed.indexOf("[");

  const start =
    firstObj === -1
      ? firstArr
      : firstArr === -1
        ? firstObj
        : Math.min(firstObj, firstArr);

  if (start === -1) return trimmed;

  // Find matching closing brace/bracket by naive scan.
  const opener = trimmed[start];
  const closer = opener === "{" ? "}" : "]";
  let depth = 0;
  for (let i = start; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (ch === opener) depth++;
    if (ch === closer) depth--;
    if (depth === 0) return trimmed.slice(start, i + 1);
  }
  return trimmed.slice(start);
}

