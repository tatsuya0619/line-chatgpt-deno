import { hasPropertyAsType, isNumber, isString } from "../typeUtils.ts";

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
