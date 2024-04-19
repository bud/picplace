# `POST /api/report`

File a report.

## Request

| Name | Values | Description |
|-|-|-|
| `type` | `"user" \| "quiz" \| "comment" \| "play"` | Only show results for a certain type of item. If unspecified, return any type. |
| `id` | `string` | The ID of the reported item. |
| `reason` | `string` | A description of the violating item. |

## Responses

Return `200` if a `type` with `id` exists, and the user is logged in. No body. Create a report with the given data.

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

Return `404` if the referenced resource does not exist, or the user does not have `view` access to it.

```json
{
  "error": "<type> <id> does not exist"
}
```

Return `500` if there an error during processing.

```json
{
  "error": "internal server error"
}
```