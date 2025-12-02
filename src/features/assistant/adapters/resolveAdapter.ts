import { ProviderAdapter } from "./types";
import { openaiAdapter } from "./openaiAdapter";
import { mockAdapter } from "./mockAdapter";
import { groqAdapter } from "./groqAdapter";

const env = process.env as Record<string, string | undefined>;

function read(key: string): string | undefined {
  return env[key];
}

function hasOpenAIKey(): boolean {
  return !!(
    read("REACT_APP_OPENAI_API_KEY") ||
    read("VITE_OPENAI_API_KEY")
  );
}

function hasGroqKey(): boolean {
  return !!(
    read("REACT_APP_GROQ_API_KEY") ||
    read("VITE_GROQ_API_KEY")
  );
}

/**
 * Choose which AI provider to use for the Assistant + Notes AI.
 *
 * Priority:
 *  - provider = "groq"  + Groq key  => groqAdapter
 *  - provider = "openai" + OpenAI key => openaiAdapter
 *  - otherwise => mockAdapter
 *
 * Provider is read from REACT_APP_AI_PROVIDER (CRA) with fallback to VITE_AI_PROVIDER.
 */
export function getAdapter(): ProviderAdapter {
  const provider =
    read("REACT_APP_AI_PROVIDER") ||
    read("VITE_AI_PROVIDER") ||
    "mock";

  if (provider === "groq" && hasGroqKey()) {
    return groqAdapter;
  }

  if (provider === "openai" && hasOpenAIKey()) {
    return openaiAdapter;
  }

  return mockAdapter;
}

export default getAdapter;
