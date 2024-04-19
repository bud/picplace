# `GET /api/play/:id/guesses`

Get your answers to a play.

## Request

| Name | Values | Description |
|-|-|-|
| `:id` | `string` | The ID of the play you want. |

## Responses

Return `200` if the play exists, and the user has `edit` access.

```json
{
  "guesses": "<the guesses (view `Guess` in the data specification for more information)>..."
}
```

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

Return `404` if the play does not exist, or the user has `none` access.

```json
{
  "error": "play <id> does not exist"
}
```

Return `500` if there an error during processing.

```json
{
  "error": "internal server error"
}
```