import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { chatCompletion } from "./chatGpt.ts";
import { reply, isValidRequest } from "./lineApi.ts";
import { MessageEvent, isMessageEvent } from "./interfaces/line.ts";
import { putChatData, getChatData } from "./chatsDB.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";
const OPENAI_SYSTEM_ORDER =
  Deno.env.get("OPENAI_SYSTEM_ORDER") || "You are a helpful assistant.";
const OPENAI_HISTORY_LIMIT = Number(Deno.env.get("OPENAI_HISTORY_LIMIT")) || 8;
const LINE_CHANNEL_SECRET_KEY = Deno.env.get("LINE_CHANNEL_SECRET_KEY") || "";
const LINE_CHANNEL_ACCESS_TOKEN =
  Deno.env.get("LINE_CHANNEL_ACCESS_TOKEN") || "";

const notFoundResponse = new Response(
  JSON.stringify({ message: "NOT FOUND" }),
  {
    status: 404,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  }
);

async function eventMessageHandler(event: MessageEvent) {
  console.log("Received Message Event");
  let chatData = await getChatData(event.source.userId);
  console.log("got ChatData = ", chatData);
  if (chatData == undefined) {
    chatData = {
      systemOrder: { role: "system", content: OPENAI_SYSTEM_ORDER },
      chatHistory: [],
    };
  }

  chatData.chatHistory.push({ role: "user", content: event.message.text });

  const gptAnswer = await chatCompletion(chatData, OPENAI_API_KEY);
  if (gptAnswer == undefined) {
    console.error("fail to generate answer");
    return;
  }
  // Reply to the line user
  await reply(event.replyToken, gptAnswer?.content, LINE_CHANNEL_ACCESS_TOKEN);
  chatData.chatHistory.push(gptAnswer);
  await putChatData(event.source.userId, chatData);

  // Pop until the length is smaller than the threshold
  while (chatData.chatHistory.length > OPENAI_HISTORY_LIMIT) {
    chatData.chatHistory.shift();
  }
}

async function handler(req: Request): Promise<Response> {
  const { pathname } = new URL(req.url);
  console.log("req = ", req);
  if (pathname == "/") {
    if (!(await isValidRequest(req.clone(), LINE_CHANNEL_SECRET_KEY))) {
      return notFoundResponse;
    }
    const reqBodyJson = await req.json();
    console.log("Received body =", reqBodyJson);
    for (const event of reqBodyJson.events) {
      if (isMessageEvent(event)) {
        await eventMessageHandler(event);
      } else {
        console.warn("Received event other than Message Event");
      }
    }
    return new Response("Success");
  } else {
    return notFoundResponse;
  }
}
if (import.meta.main) {
  serve(handler, { port: 4242 });
}
