import { serve } from "https://deno.land/std@0.178.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get("OPEN_API_KEY");

export type Message = {
  role: "user" | "system" | "assistant";
  content: string;
};

export function add(a: number, b: number): number {
  return a + b;
}

export const chatCompletion = async (
  messages: Message[],
  apiKey: string
): Promise<Message | undefined> => {
  const body = JSON.stringify({
    messages,
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
  const choice = 0;
  return data.choices[choice].message;
};

function handler(req: Request): Response {
  console.log(req);
  return new Response("Hello, World!");
}
if (import.meta.main) {
  serve(handler, { port: 4242 });
}
