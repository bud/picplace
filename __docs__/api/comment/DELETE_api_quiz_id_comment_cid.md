# `DELETE /api/quiz/:id/comment/:cid`

Delete a comment on the quiz.

## Request

| Name | Values | Description |
|-|-|-|
| `:id` | `string` | The quiz in question. |
| `:cid` | `string` | The comment in question. |

## Responses

Return `200` if the user has `edit` access. No body. Delete the comment, and decrement the quizzes `totalComment` count.

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

Return `404` if the user cannot `view` the quiz, or it doesn't exist. Also return `404` if comment `:cid` does not exist on the quiz.

```json
{
  "error": "<quiz/comment> <:id/:cid> does not exist"
}
```

Return `500` if there an error during processing.

```json
{
  "error": "internal server error"
}
```