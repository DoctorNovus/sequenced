# Sequenced API (REST)

Base URL (local): `http://localhost:8080`

All requests use JSON. Include `Content-Type: application/json`.

## Authentication

Protected routes require either:

- Session cookie (set by `POST /auth/login`), or
- Bearer API key: `Authorization: Bearer <api_key>`

`GET /auth` is session-only and will return `{"message":"Logged In"}` when a valid session is present.

## Auth

- `GET /auth`
  - Check if session is valid.
  - Example response:
    ```json
    { "message": "Logged In" }
    ```
- `POST /auth/login`
  - Body: `{ "email": "user@example.com", "password": "secret" }`
  - Example response:
    ```json
    { "id": "...", "first": "Ada", "last": "Lovelace", "email": "user@example.com", "developer": false, "synced": false }
    ```
- `POST /auth/register`
  - Body: `{ "first": "A", "last": "B", "email": "user@example.com", "password": "secret" }`
  - Example response:
    ```json
    { "id": "...", "first": "A", "last": "B", "email": "user@example.com", "developer": false, "synced": false }
    ```
- `POST /auth/logout`
  - Example response:
    ```json
    { "message": "success" }
    ```
- `POST /auth/forgot-password`
  - Body: `{ "email": "user@example.com" }`
  - Example response:
    ```json
    { "success": true }
    ```
- `POST /auth/reset-password`
  - Body: `{ "token": "<reset_token>", "password": "newpassword" }`
  - Example response:
    ```json
    { "success": true }
    ```

## User

- `GET /user`
  - Get current user.
  - Example response:
    ```json
    { "id": "...", "first": "Ada", "last": "Lovelace", "email": "user@example.com", "developer": false, "synced": false }
    ```
- `PATCH /user`
  - Body: `{ "first": "A", "last": "B", "email": "user@example.com" }`
- `PATCH /user/password`
  - Body: `{ "currentPassword": "old", "newPassword": "new" }`
- `GET /user/export`
  - Exports user data and tasks.
  - Example response:
    ```json
    { "user": { "first": "Ada", "last": "Lovelace", "email": "user@example.com" }, "tasks": [] }
    ```
- `POST /user/delete`
  - Deletes account and related data.
  - Example response:
    ```json
    { "deletedUser": true, "removedFromTasks": 0, "deletedTasks": 0 }
    ```
- `GET /user/synced`
  - Returns a boolean.
  - Example response:
    ```json
    true
    ```
- `GET /user/api-keys`
  - Returns `{ "apiKeys": { "Name": "keyvalue" } }` for the account.
  - Example response:
    ```json
    { "apiKeys": { "OpenAI": "sk-..." } }
    ```
- `PATCH /user/api-keys`
  - Body: `{ "apiKeys": { "Name": "keyvalue" } }`
- `POST /user/api-keys/generate`
  - Body: `{ "name": "My Service" }`
  - Returns `{ "name": "My Service", "value": "<generated_key>" }`
  - Example response:
    ```json
    { "name": "My Service", "value": "0f3a..." }
    ```

## Tasks

- `GET /task`
  - Optional query: `?tags=work,home`
  - Example response:
    ```json
    [{ "id": "...", "title": "Do the thing", "date": "2026-01-24T00:00:00.000Z", "done": false }]
    ```
- `GET /task/:id/users`
- `GET /task/today`
- `GET /task/tomorrow`
- `GET /task/week`
- `GET /task/overdue`
- `GET /task/incomplete`
- `POST /task`
  - Body: task payload.
  - Example response:
    ```json
    { "id": "...", "title": "Do the thing", "date": "2026-01-24T00:00:00.000Z", "done": false }
    ```
- `POST /task/bulk`
  - Body: `{ "tasks": [task, ...] }`
- `PATCH /task`
  - Body: `{ "id": "<taskId>", ...fields }`
- `DELETE /task`
  - Body: `{ "id": "<taskId>" }`
- `POST /task/invite`
  - Body: `{ "email": "user@example.com", "task": { "id": "<taskId>" } }`
- `DELETE /task/:id/users/:email/remove`

## Metrics

- `GET /metrics/tasks`
  - Example response:
    ```json
    { "count": 12 }
    ```
- `GET /metrics/tasks/today`
- `GET /metrics/tasks/tomorrow`
- `GET /metrics/tasks/week`
- `GET /metrics/tasks/overdue`

## Reviews

- `POST /review`
  - Body: `{ "rating": 1..5, "message": "optional" }`
  - Example response:
    ```json
    { "success": true }
    ```
- `GET /review`
  - Example response:
    ```json
    [{ "rating": 5, "message": "Great app!", "userEmail": "user@example.com" }]
    ```

## Example (Bearer API key)

```bash
curl -H "Authorization: Bearer <api_key>" http://localhost:8080/task
```
