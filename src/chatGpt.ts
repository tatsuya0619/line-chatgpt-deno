import { ChatData } from "./interfaces/chatData.ts";
import { GptMessage } from "./interfaces/gptMessage.ts";

export async function chatCompletion(
  chatData: ChatData,
  apiKey: string
): Promise<GptMessage | undefined> {
  const body = JSON.stringify({
    messages: [chatData.systemOrder].concat(chatData.chatHistory),
    model: "gpt-3.5-turbo",
  });
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body,
  });
  const data = await res.json();
  console.log("response from chatGPT api = ", data);
  const choice = 0;
  return data.choices[choice].message;
}
