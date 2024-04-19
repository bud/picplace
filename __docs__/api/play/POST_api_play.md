# `POST /api/play`

Begin playing a quiz.

## Requests

| Name | Values | Description |
|-|-|-|
| `quiz` | `string` | The quiz to play. |

## Responses

Return `200` if the user is logged in, and can `view` the quiz, create a play session with the quiz. Store the version number with it. Do not start the play.

```json
{
  "id": "<play id>"
}
```

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

Return `404` if quiz does not exist, or the user does not have `view` access.

```json
{
  "error": "user <id> does not exist"
}
```

Return `500` if there an error during processing.

```json
{
  "error": "internal server error"
}
```