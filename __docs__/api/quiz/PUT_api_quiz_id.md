# `PUT /api/quiz/:id`

Update a quiz's general information.

## Request

| Name | Values | Description |
|-|-|-|
| `:id` | `string` | The quiz in question. |
| `name` | `string?` | If specified, update the quiz's name. |
| `thumbnail` | `(PNG \| JPEG)?` | If specified, updates the question's thumbnail. |
| `description` | `string?` | If specified, update the quiz's description. |
| `timelimit` | `number?` | If specified, update the quiz's time limit. |
| `public` | `boolean?` | If specified, updates the quiz's visibility. |
| `whitelist` | `string[]?` | If specified, updates who must be able to see the quiz. |

## Responses

Return `200` if the user made the quiz or is an admin. No body. Update all specified properties.

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

Return `403` if the user does not have `edit` access for the account.

```json
{
  "error": "you are unauthorized"
}
```

Return `404` if the account does not exist, or any users in the whitelist do not.

```json
{
  "error": "quiz <id> does not exist"
}
```

Return `500` if there an error during processing.

```json
{
  "error": "internal server error"
}
```