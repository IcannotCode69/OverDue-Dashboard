export type SendArgs = {
  conversation: import("../state/assistant.store").Conversation;
  userText: string;
  systemPrompt?: string;
  model?: string;
  onToken?: (chunk: string) => void;
  signal?: AbortSignal;
};
export type ProviderAdapter = {
  listModels(): Promise<string[]>;
  send(args: SendArgs): Promise<{ fullText: string }>;
  regenerate(args: Omit<SendArgs, "userText"> & { messageIndex: number }): Promise<{ fullText: string }>;
};
