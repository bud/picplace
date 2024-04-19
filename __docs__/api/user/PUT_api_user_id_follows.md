# `PUT /api/user/:id/follows`

Update the follows of `:id`.

## Request

| Name | Values | Description |
|-|-|-|
| `:id` | `string` | The ID of the user you want. |
| `add` | `string?` | A comma-separated list of account IDs. If specified, makes account `:id` follow them. |
| `remove` | `string?` | A comma-separated list of account IDs. If specified, makes account `:id` unfollow them. |

Return `200` if account `:id` exists, the user is logged in as `:id` or an admin, and all accounts to `add` and `remove` exist. First, follow all those in `add`, then unfollow all those in `remove`. No body.

Return `400` if the body is not formatted correctly.

```json
{
  "error": "<offending issue>"
}
```

Return `404` if `:id`, or any account in `add` or `remove` does not exist.

```json
{
  "error": "Account <id> does not exist."
}
```

Return `403` if the user not is logged in as `:id` or an admin.

```json
{
  "error": "You are unauthorized."
}
```

Return `500` if there an error during processing.

```json
{
  "error": "Internal server error."
}
```