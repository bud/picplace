# `GET /api/quiz/:id/question`

Get the questions of a quiz.

## Request

| Name | Values | Description |
|-|-|-|
| `:id` | `string` | The quiz in question. |

## Responses

Return `200` if the quiz  exists, and the user has `edit` access. Return the exact contents of the `questions` object in JSON. See `Question` in the data specification for more guidance.

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