# `PUT /api/play/:id/guesses`

Update your answers to a play.

## Request

| Name | Values | Description |
|-|-|-|
| `:id` | `string` | The ID of the play you want. |
| `guesses` | `GuessData` | Submit your guesses here. Look at the schemas for the format. Note that images can either be a URL, or a number. If the latter, the number MUST correspond to an index in the `images` file list. |
| `images` | `File[]` | This is where you can input images for submission. |

## Responses

Return `200` if the play exists and the user has `edit` access, and the play has not gone past the `timelimit`. Update all specified guesses. No body.

Return `401` if the user is not logged in.

```json
{
  "error": "you must log in"
}
```

Return `403` if the user does not have `edit` access for the play.

```json
{
  "error": "you are unauthorized"
}
```

Return `404` if the play does not exist, or the user does not have `view` access.

```json
{
  "error": "play <id> does not exist"
}
```

Return `409` if the play has past the `timelimit`. View `Guess` and `Question` in the data specification for more.

```json
{
  "error": "the paly has ended"
}
```

Return `500` if there an error during processing.

```json
{
  "error": "internal server error"
}
```