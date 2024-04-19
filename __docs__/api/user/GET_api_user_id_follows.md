# `GET /api/user/:id/follows`

Get the accounts that `:id` follows.

## Request

| Name | Values | Description |
|-|-|-|
| `:id` | `string` | The account in question. |

## Responses

Return `200` if the account exists, and the user has `edit` access.

```json
{
  "follows": ["<account ids that they follow>..."]
}
```

Return `401` if the user is not logged in.

```json
{
  "error": "you must log in"
}
```

Return `403` if the user does not have `edit` access.

```json
{
  "error": "you are unauthorized"
}
```

Return `404` if the account does not exist.

```json
{
  "error": "user <id> does not exist"
}
```

Return `500` if there an error during processing.

```json
{
  "error": "internal server error"
}
```