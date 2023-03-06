import { ApiFactory } from "https://deno.land/x/aws_api@v0.7.0/client/mod.ts";
import { DynamoDB } from "https://deno.land/x/aws_api@v0.7.0/services/dynamodb/mod.ts";
import { GptMessage } from "./interfaces/gptMessage.ts";
import { DynamoChatHistory } from "./interfaces/dynamoChatHistory.ts";
const client = new ApiFactory().makeNew(DynamoDB);

function convertGptMessagesToDynamoChats(
  gptMessages: GptMessage[]
): DynamoChatHistory {
  return {
    L: gptMessages.map((gptMessage) => {
      return {
        M: {
          role: { S: gptMessage.role },
          content: { S: gptMessage.content },
        },
      };
    }),
  };
}

export async function putChatData(
  userId: string,
  chatData: { systemOrder: GptMessage; chatHistory: GptMessage[] }
) {
  try {
    await client.putItem({
      TableName: "ChatHistories",
      Item: {
        userId: { S: userId },
        systemOrder: { S: chatData.systemOrder.content },
        chatHistory: convertGptMessagesToDynamoChats(chatData.chatHistory),
      },
    });
  } catch (e) {
    console.error(e);
  }
}

function convertDynamoChatsToGptMessages(
  dynamoChats: DynamoChatHistory
): GptMessage[] {
  return dynamoChats.L.map((mObject) => {
    return {
      role: mObject.M.role.S,
      content: mObject.M.content.S,
    } as GptMessage;
  });
}

export async function getChatData(
  userId: string
): Promise<{ chatHistory: GptMessage[]; systemOrder: GptMessage } | undefined> {
  const histories = await client.getItem({
    TableName: "ChatHistories",
    Key: {
      userId: { S: userId },
    },
  });
  // getItem returns empty Map.
  if (histories === undefined || histories.Item == undefined) {
    return undefined;
  }
  const systemOrder = {
    role: "system",
    content: histories.Item?.systemOrder?.S as string,
  } as GptMessage;
  const chatHistory = convertDynamoChatsToGptMessages(
    histories.Item?.chatHistory as DynamoChatHistory
  );

  return { systemOrder, chatHistory };
}
