import { isMessageEvent } from "./interfaces/line.ts";
import { assert } from "https://deno.land/std@0.178.0/testing/asserts.ts";
import { isValidRequest } from "./lineApi.ts";

Deno.test("isMessageEvent success with valid input", () => {
  assert(
    isMessageEvent({
      type: "message",
      mode: "active",
      timestamp: 1000,
      source: { type: "user", userId: "userId" },
      webhookEventId: "webhookId",
      deliveryContext: { isRedelivery: true },
      replyToken: "replyToken",
      message: {
        id: "messageId",
        type: "text",
        text: "hello!",
      },
    })
  );
});

Deno.test("isMessageEvent fails: wrong type", () => {
  assert(
    !isMessageEvent({
      type: "messageAAAAA",
      mode: "active",
      timestamp: 1000,
      source: { type: "user", userId: "userId" },
      webhookEventId: "webhookId",
      deliveryContext: { isRedelivery: true },
      replyToken: "replyToken",
      message: {
        id: "messageId",
        type: "text",
        text: "hello!",
      },
    })
  );
});

Deno.test("isMessageEvent fails: wrong message", () => {
  assert(
    !isMessageEvent({
      type: "message",
      mode: "active",
      timestamp: 1000,
      source: { type: "user", userId: "userId" },
      webhookEventId: "webhookId",
      deliveryContext: { isRedelivery: true },
      replyToken: "replyToken",
      message: {
        id: "messageId",
        type: "emoji",
      },
    })
  );
});

// Success case doesn't exist because the test could be the same
// as isValidRequest implementation
Deno.test("isValidRequest fails: invalid signature", async () => {
  assert(
    !(await isValidRequest(
      new Request("https://localhost:8888", {
        method: "POST",
        headers: {
          "x-line-signature": "signByLine",
          "Content-TYpe": "application/json",
        },
        body: JSON.stringify({ key1: "value1" }),
      }),
      "secretKey"
    ))
  );
});
