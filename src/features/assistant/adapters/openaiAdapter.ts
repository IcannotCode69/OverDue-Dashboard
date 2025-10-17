import { ProviderAdapter, SendArgs } from "./types";

function getEnv(name: string){
  // CRA uses process.env.* at build-time
  return (process.env as any)[name];
}

export const openaiAdapter: ProviderAdapter = {
  async listModels(){
    return [ getEnv('VITE_OPENAI_MODEL') || getEnv('REACT_APP_OPENAI_MODEL') || 'gpt-4o-mini' ];
  },
  async send(args: SendArgs){
    const key = getEnv('VITE_OPENAI_API_KEY') || getEnv('REACT_APP_OPENAI_API_KEY');
    if(!key){ throw new Error('Missing OpenAI API key'); }
    const base = (getEnv('VITE_OPENAI_API_BASE') || getEnv('REACT_APP_OPENAI_API_BASE') || 'https://api.openai.com').replace(/\/$/,'');
    const model = args.model || getEnv('VITE_OPENAI_MODEL') || getEnv('REACT_APP_OPENAI_MODEL') || 'gpt-4o-mini';

    const res = await fetch(`${base}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({ model, messages: [
        ...(args.systemPrompt? [{ role:'system', content: args.systemPrompt }]:[]),
        ...args.conversation.messages.map(m=> ({ role:m.role, content:m.content })),
        { role:'user', content: args.userText }
      ], stream: false })
    });
    if(!res.ok){ throw new Error('OpenAI error'); }
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';
    // Simple non-stream fallback: emit once
    args.onToken?.(text);
    return { fullText: text };
  },
  async regenerate(args){ return this.send({ ...args, userText: 'Regenerate last' }); }
};
