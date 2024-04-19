# `GET /api/quiz`

Search for certain quizzes. NOTE: Only quizzes that are `visible` to the user are returned.

## Request

| Name | Values | Description |
|-|-|-|
| `:query` | `string` | If specified, only return quizzes with this in their title. |
| `:user` | `string?` | Return quizzes made only by `:user`. If unspecified, return by any acccount. |
| `:sort` | `"totalLikes" \| "created" \| "totalComments" \| "totalPlays"` | How to sort the results. Either, by most liked first, most recently created first, total comments, or total plays first. Assume `totalLikes` if unspecified. |
| `:data` | `"all" \| "id"` | What to return. Either: all data, or just the quiz's ID. If not specified, assume `id`. |
| `:count` | `number?` | How many items to return. If not specified, assume `50`. |
| `:page` | `number?` | The page of users to return. If no specified, assume `1`. |

## Responses

Return `200` if `:user` exists, and `:sort` is valid.

```json
{
  "quizzes": ["<quiz data, sorted correctly>..."]
}
```

Return `400` if request is formatted badly:

```json
{
  "error": "<offending issue>"
}
```

Return `404` if account `:user` does not exist.

```json
{
  "error": "user <:user> does not exist"
}
```

Return `500` if there an error during processing.

```json
{
  "error": "internal server error"
}
```