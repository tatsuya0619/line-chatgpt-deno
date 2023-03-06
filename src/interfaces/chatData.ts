import { GptMessage } from "./gptMessage.ts";

export interface ChatData {
  systemOrder: GptMessage;
  chatHistory: GptMessage[];
}
