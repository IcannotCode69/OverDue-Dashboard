import { ProviderAdapter, SendArgs } from "./types";

export const mockAdapter: ProviderAdapter = {
  async listModels(){ return ["mock-gpt", "gpt-4o-mini"]; },
  async send(args: SendArgs){
    const { onToken, userText, signal } = args;
    const parts = (`Here are some thoughts on your prompt:\n\n- ${userText}\n- This is a mock streaming response.\n\nExample code:\n\n\`\`\`js\nconsole.log('hello from mock');\n\`\`\``).split("");
    for(let i=0;i<parts.length;i++){
      if(signal?.aborted) break;
      await new Promise(r=> setTimeout(r, 10));
      onToken?.(parts[i]);
    }
    return { fullText: parts.join("") };
  },
  async regenerate(args){ return this.send({ ...args, userText: "Regenerate" }); },
};
