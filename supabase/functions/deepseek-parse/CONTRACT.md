# deepseek-parse Edge Function Contract

## Purpose

Parses text extracted from uploaded Word documents into one or more structured grammar-fill passages.

## Auth

Requires a logged-in user. The request must include `Authorization: Bearer <jwt>`. The function verifies the user through Supabase before calling DeepSeek.

## Input

POST JSON:

```json
{
  "text": "raw grammar-fill document text"
}
```

Limits: text must be at least 20 characters and at most 30000 characters.

## Output

Success JSON:

```json
{
  "passages": [
    {
      "title": "passage title",
      "passage": "text with ___1___ blanks",
      "blanks": [
        {
          "no": 1,
          "answer": "answer",
          "category": "attrib",
          "fine_category": "attrib-pronoun",
          "facets": { "type": "relative-pronoun", "word": "which", "restrictive": true },
          "analysis": "Chinese explanation",
          "solve": "Chinese how-to-solve guidance (做题思路)"
        }
      ]
    }
  ]
}
```

## Errors

- `401`: missing or invalid login.
- `400`: text is missing, too short, or too long.
- `405`: method is not POST.
- `500`: server configuration or unexpected server error.
- `502`: DeepSeek fails, returns empty content, or returns invalid JSON.

All errors return JSON with an `error` string. JSON parse failures may also include `rawContent` for debugging.

## Secrets

Reads `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `DEEPSEEK_API_KEY` from Supabase Edge Function environment variables. No secret value belongs in Git.

`fine_category` is one of the 51 tags from `docs/data/grammar_fine_tags.js` (体系重订 2026-05-31). `facets` is an optional multi-dimension object whose keys depend on `category` (e.g. nonpredicate→`form`, attrib→`type/word/restrictive`, predicate→`tense/voice/agreement`); invalid keys or values are silently dropped. Both `fine_category` and `facets` are dropped to `undefined` when the model returns something off-whitelist.

## AI

Calls DeepSeek `deepseek-chat` with JSON response mode. The output is normalized before returning to the frontend.
