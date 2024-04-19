# `PUT /api/user/:id`

## Request

| Name | Values | Description |
|-|-|-|
| `:id` | `string` | The ID of the user you want. |
| `description` | `string?` | If specified, updates the user's description. |
| `profile` | `PNG \| JPEG` | If specified, updates the user's profile picture. |

## Responses

Return `200` if an account `:id` exists, the user is logged in as that user, or is an admin, and the new `username` is not taken. No body. Update only the properties specified in the request, for account `:id`.

Return `400` if the request is badly formatted:

```json
{
  "error": "<offending issue>"
}
```

Return `403` if you are not logged in as account `:id` or an admin.

```json
{
  "error": "You are unauthorized."
}
```

Return `404` if account `:id` does not exist.

```json
{
  "error": "Account <:id> does not exist."
}
```

Return `409` if an another account contains that `username`.

```json
{
  "username": "User <username> already exists."
}
```

Return `500` if there an error during processing.

```json
{
  "error": "Internal server error."
}
```