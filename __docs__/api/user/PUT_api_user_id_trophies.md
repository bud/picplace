# `PUT /api/user/:id/trophies`

Update the trophies of `:id`.

## Request

| Name | Values | Description |
|-|-|-|
| `:id` | `string` | The ID of the user you want. |
| `add` | `string?` | A comma-separated list of play IDs. If specified, makes account `:id` prize them. |
| `remove` | `string?` | A comma-separated list of play IDs. If specified, makes account `:id` unprize them. |

Return `200` if account `:id` exists, the user is logged in as `:id` or an admin, and all plays to `add` and `remove` exist, were played by `:id`, and are finished. First, like all those in `add`, then unlike all those in `remove`. No body.

Return `400` if the body is not formatted correctly.

```json
{
  "error": "<offending issue>"
}
```

Return `403` if the user not is logged in as `:id` or an admin.

```json
{
  "error": "You are unauthorized."
}
```

Return `404` if `:id`, or any play in `add` or `remove` does not exist.

```json
{
  "error": "Account <id> does not exist."
}
```

Return `409` if `:id` did not create/finish a play in `add` or `remove`.

```json
{
  "error": "Play <id> is not <yours/done>."
}
```

Return `500` if there an error during processing.

```json
{
  "error": "Internal server error."
}
```