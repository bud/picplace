# `GET /api/quiz/:id/comment`

Get comments on a quiz.

## Request

| Name | Values | Description |
|-|-|-|
| `:id` | `string` | The quiz in question. |
| `:sort` | `"newest" \| "oldest"` | How to sort the results. Either, by newest first, or oldest. Assume `newest` if unspecified. |
| `data` | `"all" \| "id"` | What to return. Either: all data, or just the user's ID. If not specified, assume `id`. |
| `count` | `number?` | How many items to return. If not specified, assume `50`. |
| `page` | `number?` | The page of users to return. If no specified, assume `1`. |

## Responses

Return `200` if the quiz exists, and the quiz is visible to the user. Sort the results apropriately.

```json
{
  "comments": ["<comment items...>"]
}
```

Return `404` if the quiz does not exist, or the quiz is not `visible` to the user and they are not an admin.

```json
{
  "error": "<quiz> <:id> does not exist"
}
```

Return `500` if there an error during processing.

```json
{
  "error": "internal server error"
}
```