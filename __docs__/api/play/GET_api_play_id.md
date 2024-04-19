# `GET /api/play/:id`

Get details about a play.

## Request

| Name | Values | Description |
|-|-|-|
| `:id` | `string` | The ID of the play you want. |

## Responses

Return `200` if the play exists, and the user has `view` access.

```json
{
  "id": "<play id>",
  "quiz": "<quiz id>",
  "user": "<owner id>",
  "submitted": "<whether the play has been completed>",
  "public": "<whether others can see it>",
  "start": "<when the play was started>",
  "end": "<when the play was ended>",
  "totalScore": "<total score>",
  "scores": "[<list of scores per each question>...]",
  "time": "<total time elapsed>",
  "personal_best": "<if you have not scored better>",
  "place": "<out of all visible plays for the quiz, where is this one>"
}
```

Return `404` if the play does not exist, or the user has `none` access.

```json
{
  "error": "play <id> does not exist"
}
```

Return `500` if there an error during processing.

```json
{
  "error": "Internal server error."
}
```