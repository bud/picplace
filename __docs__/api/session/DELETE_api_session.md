# `DELETE /api/session`

Log the user out.

## Request

No body.

## Responses

Return `200`. Sign the user out, if not already. No body.

Return `500` if there an error during processing.

```json
{
  "error": "internal server error"
}
```