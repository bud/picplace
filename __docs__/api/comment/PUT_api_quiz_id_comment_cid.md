# `PUT /api/quiz/:id/comment/:cid`

Update a comment on a quiz.

## Request

| Name | Values | Description |
|-|-|-|
| `:id` | `string` | The quiz in question. |
| `:cid` | `string` | The comment in question. |
| `body` | `string` | The comment itself. |

## Responses

Return `200` if the user has `view` access on the quiz, and `edit` access on the comment. No body. Update the comment with this specified data.

Return `400` if the request is badly formatted.

```json
{
  "error": "<offending issue>"
}
```

Return `401` if the user is not logged in.

```json
{
  "error": "you must log in"
}
```

Return `403` if the user has view access on the `quiz` but does not have `edit` access for the comment.

```json
{
  "error": "you are unauthorized"
}
```

Return `404` if the user does not have `view` access for the quiz or comment.

```json
{
  "error": "<quiz/comment> <id> does not exist"
}
```

Return `500` if there an error during processing.

```json
{
  "error": "internal server error"
}
```