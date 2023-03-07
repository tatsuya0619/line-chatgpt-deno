import {
  deleteChatData,
  generateInitialChatData,
  putChatData,
} from "./chatsDB.ts";

const commandPrefix = "/";

export async function runCommand(
  userId: string,
  text: string
): Promise<string> {
  let response: string;
  if (text.startsWith(commandPrefix + "reset")) {
    response = await resetCommand(userId);
  } else if (text.startsWith(commandPrefix + "change")) {
    const newSystemOrder = text.replace(commandPrefix + "change", "").trim();
    response = await changeSystemCommand(userId, newSystemOrder);
  } else {
    response = helpCommand();
  }

  return response;
}

export async function resetCommand(userId: string): Promise<string> {
  await deleteChatData(userId);
  return "[コマンド出力]\n文脈を忘れました";
}

export async function changeSystemCommand(
  userId: string,
  systemOrder: string
): Promise<string> {
  await deleteChatData(userId);
  const chatData = generateInitialChatData(systemOrder);
  putChatData(userId, chatData);

  return (
    "[コマンド出力]\nAIに以下の役割をするよう命令しました。\n\n" + systemOrder
  );
}

export function helpCommand(): string {
  return `[コマンド出力]\nこのボットではLINEを通じてAIを会話が出来ます。
  そしてこのAIはある程度前の会話を使用するので、文脈を理解することができます。
  このボットに対してバックスラッシュから始まる以下のコマンドを送信することができます。

  /reset
    - AIにこれまでの文脈を忘れさせます。
  /change <new role>
    - AIの役割を変更することができます。これにより、AIの口調等を変更することができます。
    - このコマンドを使用すると、AIはこれまでの文脈を忘れます。
    例: "/change あなたはオタクに優しいギャルです"
  /help
    - このヘルプを表示します。
  `;
}

export function isCommand(text: string) {
  return text.startsWith(commandPrefix);
}
