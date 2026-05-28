# translate-passage Edge Function Contract

## Purpose

Translates an English grammar-fill passage into Chinese while preserving paragraph structure and blank markers such as `___1___`.

## Auth

Requires a logged-in user. The request must include `Authorization: Bearer <jwt>`. The function verifies the user through Supabase before calling DeepSeek.

## Input

POST JSON:

```json
{
  "text": "English passage text with ___1___ blanks"
}
```

Limits: text must be at least 20 characters and at most 20000 characters.

## Output

Success JSON:

```json
{
  "chinese": "Chinese translation"
}
```

## Errors

- `401`: missing or invalid login.
- `400`: text is missing, too short, or too long.
- `405`: method is not POST.
- `500`: server configuration or unexpected server error.
- `502`: DeepSeek fails or returns empty content.

All errors return JSON with an `error` string.

## Secrets

Reads `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `DEEPSEEK_API_KEY` from Supabase Edge Function environment variables. No secret value belongs in Git.

## AI

Calls DeepSeek `deepseek-chat`. The prompt requires translation only and asks the model to preserve blank markers.
