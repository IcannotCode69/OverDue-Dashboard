import { ProviderAdapter } from "./types";
import { openaiAdapter } from "./openaiAdapter";
import { mockAdapter } from "./mockAdapter";

function hasKey(){
  return !!((process.env as any).VITE_OPENAI_API_KEY || (process.env as any).REACT_APP_OPENAI_API_KEY);
}

export function getAdapter(): ProviderAdapter {
  const provider = (process.env as any).VITE_AI_PROVIDER || 'mock';
  if(provider === 'openai' && hasKey()) return openaiAdapter;
  return mockAdapter;
}
