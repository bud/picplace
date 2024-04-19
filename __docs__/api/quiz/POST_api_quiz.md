# `POST /api/quiz`

Create a BLANK quiz.

## Request

No body.

## Responses

Return `201` if the user is logged in. Create an empty, private, unpublished quiz, and return its `id`.

```json
{
  "id": "<id of quiz>"
}
```

Return `401` if not logged in.

```json
{
  "error": "you must log in"
}
```

Return `500` if there an error during processing.

```json
{
  "error": "internal server error"
}
```