# `POST /api/quiz/:id/comment`

Comment on a quiz.

## Request

| Name | Values | Description |
|-|-|-|
| `:id` | `string` | The quiz in question. |
| `body` | `string` | The comment itself. |

## Responses

Return `201` if the user can `view` access to the quiz.

```json
{
  "id": "<comment id>"
}
```

Return `401` if the user is not logged in.

```json
{
  "error": "you must log in"
}
```

Return `404` if the quiz does not exist, or the user does not have `view` access.

```json
{
  "error": "quiz <:id> does not exist"
}
```

Return `500` if there an error during processing.

```json
{
  "error": "internal server error"
}
```