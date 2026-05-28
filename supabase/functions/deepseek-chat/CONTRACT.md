# deepseek-chat Edge Function Contract

## Purpose

Provides the in-app assistant for Lesson Snippets usage questions and grammar-fill teaching questions.

## Auth

Requires a logged-in user. The request must include `Authorization: Bearer <jwt>`. The function verifies the user through Supabase before calling DeepSeek.

## Input

POST JSON:

```json
{
  "messages": [
    { "role": "user", "content": "How do I use migration training?" }
  ]
}
```

Limits: last 20 messages are used; each message is clipped to 2000 characters.

## Output

Success JSON:

```json
{
  "content": "assistant reply",
  "usage": {}
}
```

## Errors

- `401`: missing or invalid login.
- `400`: `messages` is empty.
- `405`: method is not POST.
- `500`: server configuration or unexpected server error.
- `502`: DeepSeek returns an error or empty content.

All errors return JSON with an `error` string.

## Secrets

Reads `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `DEEPSEEK_API_KEY` from Supabase Edge Function environment variables. No secret value belongs in Git.

## AI

Calls DeepSeek `deepseek-chat`. The system prompt restricts the assistant to product support and grammar-fill teaching.
