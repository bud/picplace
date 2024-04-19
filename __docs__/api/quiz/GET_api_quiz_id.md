# `GET /api/quiz/:id`

Get details about a quiz.

## Request

| Name | Values | Description |
|-|-|-|
| `:id` | `string` | The ID of the quiz you want. |

## Responses

Return `200` if the quiz exists, and the user has `view` access.

```json
{
  "id": "<quiz id>",
  "name": "<quiz name>",
  "thumbnail": "<quiz thumbnail>",
  "user": "<quiz creator>",
  "description": "<quiz description>",
  "version": "<quiz version number>",
  "created": "<when quiz was created>",
  "timeLimit": "<how long the quiz is, in seconds>",
  "public": "<whether the quiz is public>",
  "whitelist": "<a list of people that can always view it>",
  "totalComments": "<number of comments>",
  "totalQuestions": "<number of questions>",
  "totalLikes": "<number of likes>",
  "totalPlays": "<number of plays>",
  "liked": "<whether you like it>"
}
```

Return `404` if the user does not have `view` access, or the quiz does not exist.

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