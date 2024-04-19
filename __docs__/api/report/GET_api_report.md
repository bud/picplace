# `GET /api/report`

Search for certain reports.

## Request

| Name | Values | Description |
|-|-|-|
| `:type` | `"user" \| "quiz" \| "comment"` | Only show results for a certain type of item. If unspecified, return any type. |
| `:user` | `string?` | Return reports made only by `:user`. If unspecified, return by any acccount. |
| `:data` | `"all" \| "id"` | What to return. Either: all data, or just the quiz's ID. If not specified, assume `id`. |
| `:count` | `number?` | How many items to return. If not specified, assume `50`. |
| `:page` | `number?` | The page of users to return. If no specified, assume `1`. |

## Responses

Return `200` if `:user` (potentially) exists, and the user is an admin.

```json
{
  "reports": ["<ids of reports..."]
}
```

Return `400` if request is formatted badly:

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

Return `403` if the user is not an admin.

```json
{
  "error": "you are unauthorized"
}
```

Return `404` if the report does not exist.

```json
{
  "error": "report <id> does not exist"
}
```

Return `500` if there an error during processing.

```json
{
  "error": "internal server error"
}
```