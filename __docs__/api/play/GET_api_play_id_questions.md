# `GET /api/play/:id/questions`

Get your questions to a play, in a secure way.

## Request

| Name | Values | Description |
|-|-|-|
| `:id` | `string` | The ID of the play you want. |

## Responses

Return `200` if the play exists, the corresponding quiz exists, the play version matches the quiz version.

```json
{
  "questions": ["<the questions (view `Question` in the data specification for more information)>..."]
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

Return `410` if the play exists, but the version does not match with the current quiz verion.

```json
{
  "error": "play version is out of date"
}

Return `500` if there an error during processing.

```json
{
  "error": "internal server error"
}
```