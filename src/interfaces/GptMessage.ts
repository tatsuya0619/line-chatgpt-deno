export interface GptMessage {
  role: "user" | "system" | "assistant";
  content: string;
}
