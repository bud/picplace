# `DELETE /api/play/:id`

Delete a play.

## Request

| Name | Values | Description |
|-|-|-|
| `:id` | `string` | The ID of the play you want. |

## Responses

Return `200` if the user has `edit` access on the play. No body. Delete the play. Remove from the user's trophy room.

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

Return `404` if the quiz does not exist, or the user does not have `view` access.

```json
{
  "error": "Play <id> does not exist."
}
```

Return `500` if there an error during processing.

```json
{
  "error": "internal server error"
}
```