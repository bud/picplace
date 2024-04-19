# `DELETE /api/report/:id`

Remove a report.

## Request

| Name | Values | Description |
|-|-|-|
| `:id` | `string` | The report in question. |

## Responses

Return `200` if report `:id` exists, and the user has `edit` access. No body. Delete the report.

Return `401` if the user is not logged in.

```json
{
  "error": "you must log in"
}
```

Return `403` if the user has `view` access, but not `edit` access.

```json
{
  "error": "you are unauthorized"
}
```

Return `404` if the report does not exist, or the user has `none` access.

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