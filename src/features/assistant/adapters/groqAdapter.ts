import { ProviderAdapter, SendArgs } from "./types";

const env = process.env as Record<string, string | undefined>;
const GROQ_BASE = (
  env.REACT_APP_GROQ_API_BASE ||
  env.VITE_GROQ_API_BASE ||
  "https://api.groq.com/openai/v1"
).replace(/\/$/, "");
const GROQ_API_KEY =
  env.REACT_APP_GROQ_API_KEY || env.VITE_GROQ_API_KEY || "";
const GROQ_MODEL =
  env.REACT_APP_GROQ_MODEL || env.VITE_GROQ_MODEL || "llama-3.1-8b-instant";

export const groqAdapter: ProviderAdapter = {
  async listModels() {
    return [GROQ_MODEL];
  },
  async send(args: SendArgs) {
    if (!GROQ_API_KEY) {
      throw new Error("Missing Groq API key (REACT_APP_GROQ_API_KEY)");
    }

    const body = {
      model: GROQ_MODEL,
      messages: [
        ...(args.systemPrompt ? [{ role: "system", content: args.systemPrompt }] : []),
        ...args.conversation.messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: args.userText },
      ],
      stream: false,
    };

    const res = await fetch(`${GROQ_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: args.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Groq API error: ${res.status} ${text}`);
    }

    const data = await res.json();
    const text: string = data.choices?.[0]?.message?.content || "";
    args.onToken?.(text);
    return { fullText: text };
  },
  async regenerate(args) {
    const target = args.conversation.messages[args.messageIndex];
    const userText = target?.content || "Regenerate";
    return this.send({ ...(args as any), userText });
  },
};
