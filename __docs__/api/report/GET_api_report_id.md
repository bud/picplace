# `GET /api/report/:id`

File a report.

## Request

| Name | Values | Description |
|-|-|-|
| `:id` | `string` | The report in question. |

## Responses

Return `200` if report `:id` exists, and the user is an admin.

```json
{
  "id": "<report id>",
  "type": "<comment | user | quiz | play>",
  "reason": "<reason user gave>",
  "reporter": "<who reported this item>",
  "created": "<when the report was filed, in UTC>"
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