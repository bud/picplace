# `GET /api/play`

Search for plays quizzes. NOTE: Only show plays that the user has `view` access to.

## Request

| Name | Values | Description |
|-|-|-|
| `user` | `string?` | Return plays made only by `user`. If unspecified, return by any acccount. |
| `quiz` | `string?` | Return plays made only on `quiz`. If unspecified, return for any quiz. |
| `sort` | `"time" \| "totalScore" \| "created"` | How to sort the results. Either, by shortest time taken first, most points scored first, or by newest first. Assume `totalScore` if unspecified. |
| `data` | `"all" \| "id"` | What to return. Either: all data, or just the user's ID. If not specified, assume `id`. |
| `count` | `number?` | How many items to return. If not specified, assume `50`. |
| `page` | `number?` | The page of users to return. If no specified, assume `1`. |

## Responses

Return `200` if `user` (potentially) exists, the `quiz` (potentially) exists and user has `view` access to it.

```json
{
  "plays": ["<play data, sorted correctly>..."]
}
```

Return `400` if request is formatted badly:

```json
{
  "error": "<offending issue>"
}
```

Return `404` if the `quiz` or the `user` does not exist, or the user has `none` access to either.

```json
{
  "error": "quiz/user <id> does not exist"
}
```

Return `500` if there an error during processing.

```json
{
  "error": "Internal server error."
}
```