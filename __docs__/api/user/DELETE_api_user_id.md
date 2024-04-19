# `DELETE /api/user/:id`

Delete an account.

## Request

| Name | Values | Description |
|-|-|-|
| `:id` | `string` | The account to be deleted. |

## Responses

Return `200` if the user is logged in as the account or an admin. No body. If logged in to the account, log that user out as well. Update the counters for `totalFollowers` in all followed users. Then update the counters for `totalLikes` for all liked quizzes, and then subsequently the `totalLikes` in the owners for all quizzes.

Return `403` if the user has `view` access, but not `edit` access.

```json
{
  "error": "you are unauthorized"
}
```

Return `404` if the user does not exist, or the user has `none` access.

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