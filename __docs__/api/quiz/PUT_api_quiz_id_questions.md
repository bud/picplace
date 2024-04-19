# `PUT /api/quiz/:id/questions`

Update the questions to the quiz.

## Request

| Name | Values | Description |
|-|-|-|
| `:id` | `string` | The quiz in question. |
| `questions` | `QuestionData` | The question data. View the schema for more information. Note that images can be string URLs or numbers. If the latter, the number MUST correspond to a index in the `images` parameter. |
| `images` | `File[]` | Where users can store uploaded images for quiz data. |

## Responses

Return `200` if the user has `edit` access for the quiz. No body. Update all specified fields on quiz `:id` with the data. View `Question` and `Quiz` in the data specification for more guidance.

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

Return `403` if the user does not have `edit` access for the quiz.

```json
{
  "error": "you are unauthorized"
}
```

Return `404` if the quiz does not exist.

```json
{
  "error": "quiz <id> does not exist"
}
```

Return `409` if any of the request data is bad, or it conflicts with any values not changed.

```json
{
  "<offending parameter>": "<offending issue>"
}
```

Return `500` if there an error during processing.

```json
{
  "error": "Internal server error."
}
```