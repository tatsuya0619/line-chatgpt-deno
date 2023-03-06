export interface DynamoChatHistory {
  L: {
    M: {
      role: { S: string };
      content: { S: string };
    };
  }[];
}
