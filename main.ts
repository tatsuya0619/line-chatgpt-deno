import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { chatCompletion, GptMessage } from "./chat_gpt.ts";
import {
  isValidRequest,
  MessageEvent,
  isMessageEvent,
  reply,
} from "./line_api.ts";

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

const historyMap = new Map<string, GptMessage[]>();

async function eventMessageHandler(event: MessageEvent) {
  console.log("Received Message Event");
  let histories = historyMap.get(event.source.userId);
  if (histories == undefined) {
    histories = [];
  }

  histories.push({ role: "user", content: event.message.text });

  console.log("histories = ", histories);
  const gptAnswer = await chatCompletion(
    histories,
    { role: "system", content: OPENAI_SYSTEM_ORDER },
    OPENAI_API_KEY
  );
  if (gptAnswer == undefined) {
    console.error("fail to generate answer");
    return;
  }
  await reply(event.replyToken, gptAnswer?.content, LINE_CHANNEL_ACCESS_TOKEN);
  histories.push(gptAnswer);

  while (histories.length > OPENAI_HISTORY_LIMIT) {
    historyMap.get(event.source.userId)?.shift();
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
        eventMessageHandler(event);
      }
      console.warn("Received event other than Message Event");
    }
    return new Response("Success");
  } else {
    return notFoundResponse;
  }
}
if (import.meta.main) {
  serve(handler, { port: 4242 });
}
