# `GET /api/user/:id/likes`

Get the quizzes that `:id` likes. NOTE: Only show quizzes teh user can see.

## Request

| Name | Values | Description |
|-|-|-|
| `:id` | `string` | The account in question. |

## Responses

Return `200` if account `:id` exists, and the user has `edit` access.

```json
{
  "likes": ["<quiz ids that they like>..."]
}
```

Return `401` if the user is not logged in.

```json
{
  "error": "you must log in"
}
```

Return `403` if the user does not have `edit` access for the account.

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