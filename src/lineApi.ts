import * as base64 from "https://deno.land/std@0.175.0/encoding/base64.ts";

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
