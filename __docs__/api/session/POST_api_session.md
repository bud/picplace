# `POST /api/session`

Log the user in.

## Request

| Name | Values | Description |
|-|-|-|
| `username` | `string` | The account's username. |
| `password` | `string` | The acccount's password. |

## Responses

Return `200` if the `username` and `password` match an account, and the user is not signed in. Log the user into it and return its `id`.

```json
{
  "id": "<user id here>"
}
```

Return `400` if the request body is badly formatted.

```json
{
  "error": "<offending issue>"
}
```

Return `401` if the `username` and `password` match do not an account.

```json
{
  "error": "incorrect username or password"
}
```

Return `409` if the user is already logged in.

```json
{
  "error": "you are already logged in"
}
```

Return `500` if there an error during processing.

```json
{
  "error": "internal server error"
}
```