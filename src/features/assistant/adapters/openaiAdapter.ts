import { ProviderAdapter, SendArgs } from "./types";

const env = process.env as Record<string, string | undefined>;

function readEnv(key: string): string | undefined {
  return env[key];
}

const OPENAI_BASE = (
  readEnv("REACT_APP_OPENAI_API_BASE") ||
  readEnv("VITE_OPENAI_API_BASE") ||
  "https://api.openai.com"
).replace(/\/$/, "");
const OPENAI_API_KEY =
  readEnv("REACT_APP_OPENAI_API_KEY") || readEnv("VITE_OPENAI_API_KEY") || "";
const OPENAI_MODEL =
  readEnv("REACT_APP_OPENAI_MODEL") ||
  readEnv("VITE_OPENAI_MODEL") ||
  "gpt-4o-mini";

export const openaiAdapter: ProviderAdapter = {
  async listModels() {
    return [OPENAI_MODEL];
  },
  async send(args: SendArgs) {
    const key = OPENAI_API_KEY;
    if (!key) {
      throw new Error("Missing OpenAI API key");
    }
    const model = args.model || OPENAI_MODEL;

    const res = await fetch(`${OPENAI_BASE}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        messages: [
          ...(args.systemPrompt ? [{ role: "system", content: args.systemPrompt }] : []),
          ...args.conversation.messages.map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: args.userText },
        ],
        stream: false,
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`OpenAI error: ${res.status} ${text}`);
    }
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";
    args.onToken?.(text);
    return { fullText: text };
  },
  async regenerate(args) {
    return this.send({ ...args, userText: "Regenerate last" });
  },
};
