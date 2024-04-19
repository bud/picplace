# `GET /api/quiz/:id/comment/:cid`

Get a comment on the quiz.

## Request

| Name | Values | Description |
|-|-|-|
| `:id` | `string` | The quiz in question. |
| `:cid` | `string` | The comment in question. |

## Responses

Return `200` if the quiz and comment exists, and the quiz is visible to the user.

```json
{
  "id": "<comment id>",
  "owner": "<id of who made this comment>",
  "body": "<body of comment>",
  "created": "<time comment was created, in UTC>"
}
```

Return `404` if the user cannot `view` the quiz, or the comment does not exist.

```json
{
  "error": "<quiz/Comment> <:id/:cid> does not exist"
}
```

Return `500` if there an error during processing.

```json
{
  "error": "internal server error"
}
```