# `PUT /api/play/:id`

Update a play's details.

## Request

| Name | Values | Description |
|-|-|-|
| `:id` | `string` | The ID of the play you want. |
| `public` | `boolean?` | If specified, change whether anyone else can view this play. |

## Responses

Return `200` if the user has `edit` access. No body. Update all specified properties.

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

Return `500` if there an error during processing.

```json
{
  "error": "internal server error"
}
```