# `POST /api/user`

Create a new account, and log into them.

## Request

| Name | Values | Description |
|-|-|-|
| `username` | `string` | The new account's username. |
| `password` | `string` | The new acccount's password. |

## Responses

Return a `201` if an existing account does not have `username`, and the `password` is strong enough. Create a new non-admin account with those credentials, and log the user into it.

```json
{
  "id": "<new user id>"
}
```

Return `400` if the request body is badly formatted.

```json
{
  "error": "<offending issue>"
}
```

Return `409` if an existing account contains that `username`.

```json
{
  "username": "user <username> already exists"
}
```

Return `500` if there an error during processing.

```json
{
  "error": "unternal server error"
}
```