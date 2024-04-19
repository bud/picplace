# `GET /api/user/:id`

Get details about a user.

## Request

| Name | Values | Description |
|-|-|-|
| `:id` | `string` | The ID of the user you want. |

## Responses

Return `200` if the user exists.

```json
{
  "id": "<account id>",
  "username": "<account name>",
  "profile": "<account profile picture>",
  "description": "<account bio>",
  "created": "<account creation date, in UTC>",
  "totalFollows": "<number of people who follow this account>",
  "followed": "<whether you follow this account>",
  "isFollowing": "<number of people who they follow>",
  "admin": "<whether this account has admin privileges>",
  "quizzes": "<number of quizzes>",
  "totalLikes": "<total number of likes on their quizzes>",
  "isLiking": "<total number of quizzes they like>"
}
```

Return `404` if the user does not exist.

```json
{
  "id": "user <:id> does not exist"
}
```

Return `500` if there an error during processing.

```json
{
  "error": "internal server error"
}
```