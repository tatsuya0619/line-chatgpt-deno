# line-chatgpt-deno

LINE chatbot powered by GPT3.5 API.

## Feature

You can use commands which begin with '/' such as:

- `/reset`
  - You can order the bot to forget the all previous conversation.
- `/change`
  - You can order the bot to change role
  - example: "/change You are an artist"

## Technical components

This uses the following external services mainly for cost considerations.

- LINE API
- OPENAI API
- AWS DynamoDB
- Deno deploy

## Development

Set required API keys.

```bash
export OEPNAI_API_KEY=<YOUR_OWN_KEY>
export LINE_CHANNEL_SECRET=<YOUR_OWN_KEY>
export LINE_CHANNEL_ACCESS_TOKEN=<YOUR_OWN_KEY>
```

Set optional API keys.

```bash
export OPENAI_SYSTEM_ORDER="You are helpful teacher"
export OPENAI_HISTORY_LIMIT=8
```

To make this program available on LINE, deploy this program on the Internet.
Deno deploy is recommended.
