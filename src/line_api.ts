import * as base64 from "https://deno.land/std@0.175.0/encoding/base64.ts";
import { hasPropertyAsType, isNumber, isString } from "./typeUtils.ts";

export interface MessageEvent {
  readonly type: string;
  readonly mode: "active" | "standby";
  readonly timestamp: number;
  readonly source: SourceUser;
  readonly webhookEventId: string;
  readonly deliveryContext: {
    isRedelivery: boolean;
  };
  readonly replyToken: string;
  readonly message: TextMessage;
}

interface TextMessage {
  readonly id: string;
  readonly type: "text";
  readonly text: string;
}

interface SourceUser {
  readonly type: "user";
  readonly userId: string;
}

export async function isValidRequest(
  req: Request,
  channelSecretKey: string
): Promise<boolean> {
  if (req.body == null) {
    return false;
  }
  const reqBody = (await req.body.getReader().read()).value;
  if (reqBody == undefined) {
    return false;
  }
  const secretKeyBuf = new TextEncoder().encode(channelSecretKey);
  const secretKey = await crypto.subtle.importKey(
    "raw",
    secretKeyBuf,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  const calculatedSignature = await crypto.subtle.sign(
    { name: "HMAC" },
    secretKey,
    reqBody
  );
  const calculatedSignatureEncoded = base64
    .encode(calculatedSignature)
    .toString();
  const expectedSignatureEncoded = req.headers.get("x-line-signature");

  if (calculatedSignatureEncoded.length == 0) {
    return false;
  }
  return calculatedSignatureEncoded == expectedSignatureEncoded;
}

export function isMessageEvent(event: unknown): event is MessageEvent {
  return (
    event !== null &&
    event !== undefined &&
    hasPropertyAsType(event, "type", isString) &&
    event.type === "message" &&
    hasPropertyAsType(event, "mode", isString) &&
    (event.mode === "active" || event.mode === "standby") &&
    hasPropertyAsType(event, "timestamp", isNumber) &&
    hasPropertyAsType(event, "source", isSourceUser) &&
    hasPropertyAsType(event, "webhookEventId", isString) &&
    hasPropertyAsType(event, "replyToken", isString) &&
    hasPropertyAsType(event, "message", isTextMessage)
  );
}

function isTextMessage(textMessage: unknown): textMessage is TextMessage {
  return (
    textMessage !== null &&
    textMessage !== undefined &&
    hasPropertyAsType(textMessage, "id", isString) &&
    hasPropertyAsType(textMessage, "type", isString) &&
    textMessage.type == "text" &&
    hasPropertyAsType(textMessage, "text", isString)
  );
}

function isSourceUser(sourceUser: unknown): sourceUser is SourceUser {
  return (
    sourceUser !== null &&
    sourceUser !== undefined &&
    hasPropertyAsType(sourceUser, "type", isString) &&
    sourceUser.type == "user" &&
    hasPropertyAsType(sourceUser, "userId", isString)
  );
}

function generateMessageArray(text: string) {
  // These limitations come from Line API.
  const arrayLengthLimit = 5;
  const elementLengthLimit = 5000;
  const messageArray = [];

  for (let i = 0; i < arrayLengthLimit; i++) {
    const elem = text.slice(
      i * elementLengthLimit,
      (i + 1) * elementLengthLimit
    );
    if (elem.length == 0) {
      continue;
    }

    messageArray.push({ type: "text", text: elem });
  }

  return messageArray;
}

export async function reply(
  replyToken: string,
  messageText: string,
  channelAccessToken: string
) {
  const body = JSON.stringify({
    replyToken,
    messages: generateMessageArray(messageText),
  });

  const res = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${channelAccessToken}`,
    },
    body,
  });

  if (res.status / 100 != 2) {
    console.error(res);
  }
}
