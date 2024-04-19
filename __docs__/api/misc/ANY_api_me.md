# `ANY /api/me`

If you across `/api/me` while evaluating a request, replace it with `/api/user/:id`, where `:id` is the current user. Here are some examples, where we are logged in as the user with `123`:

1. `GET /api/me` becomes `GET /api/user/123`.
2. `PUT /api/me/follows/` becomes `PUT /api/user/123/follows/`.
3. `DELETE /api/me` becomes `DELETE /api/user/123`.

Return a `403` if the user is not logged in.

```json
{
  "error": "you are not signed in"
}
```

Return `500` if there an error during processing.

```json
{
  "error": "internal server error"
}
```