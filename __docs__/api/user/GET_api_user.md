# `GET /api/user`

Search for certain users.

## Request

| Name | Values | Description |
|-|-|-|
| `query` | `string?` | If specified, only return users with this in their username. |
| `sort` | `"totalFollows" \| "created" \| "totalLikes"` | What to sort by either: most follows first, most total likes first, or most recent first. If not specified, assume `totalFollows`. |
| `data` | `"all" \| "id"` | What to return. Either: all data, or just the user's ID. If not specified, assume `id`. |
| `count` | `number?` | How many items to return. If not specified, assume `50`. |
| `page` | `number?` | The page of users to return. If no specified, assume `1`. |

## Responses

Return `200` if no formatting errors, with the relevant user IDs, sorted correctly.

```json
{
  "users": ["<data of users, sorted correctly>..."]
}
```

Return `400` if the format is incorrect.

```json
{
  "error": "<offending issue>"
}
```

Return `500` if there an error during processing.

```json
{
  "error": "internal server error"
}
```