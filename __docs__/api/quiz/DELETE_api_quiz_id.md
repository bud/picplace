# `DELETE /api/quiz/:id`

Delete a quiz.

## Request

| Name | Values | Description |
|-|-|-|
| `:id` | `string` | The quiz in question. |

## Responses

Return `200` if the user has `edit` access to the quiz. No body. Delete the quiz, update the owner's `totalLikes` counter.

Return `401` if the user is not logged in.

```json
{
  "error": "you must log in"
}
```

Return `403` if the user has `view` access, but not `edit` access.

```json
{
  "error": "you are unauthorized"
}
```

Return `404` if the quiz does not exist, or the user has `none` access.

```json
{
  "error": "quiz <id> does not exist"
}
```

Return `500` if there an error during processing.

```json
{
  "error": "internal server error"
}
```