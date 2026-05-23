# DevPulse

> Internal Tech Issue & Feature Tracker

> A collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions.

**Live URL:** [https://dev-pulse-orpin.vercel.app/](https://dev-pulse-orpin.vercel.app/)

## Features

- **User Authentication** — Secure registration and login using JWT tokens (1-day expiry)
- **Role-Based Access Control** — Two roles: `contributor` and `maintainer`
- **Password Security** — Passwords hashed with bcrypt (salt rounds: `10`)
- **Issue Reporting** — Authenticated users can create bug reports or feature requests
- **Issue Management** — Full CRUD: create, read, update, and delete issues
- **Filtering & Sorting** — Filter issues by `type` and `status`; sort by `newest` or `oldest`
- **Reporter Details** — Issue responses embed reporter information (id, name, role)
- **Input Validation** — Custom validation layer with structured per-field error messages
- **Global Error Handling** — Centralized error handler for uncaught exceptions

## Tech Stack

| Layer            | Technology                                    |
| ---------------- | --------------------------------------------- |
| Runtime          | Node.js (LTS runtime (24.x or higher))        |
| Language         | TypeScript                                    |
| Framework        | Express                                       |
| Database         | PostgreSQL (raw SQL via `pg` connection pool) |
| Authentication   | JSON Web Tokens (`jsonwebtoken`)              |
| Password Hashing | `bcrypt`                                      |
| Configuration    | `dotenv`                                      |
| HTTP Status      | `http-status-codes`                           |
| Build Tool       | `tsup`                                        |
| Dev Server       | `tsx` (watch mode)                            |
| Deployment       | Vercel                                        |

## Database Schema

### Table: `users`

| Column       | Type         | Constraints                                                            |
| ------------ | ------------ | ---------------------------------------------------------------------- |
| `id`         | SERIAL       | PRIMARY KEY                                                            |
| `name`       | VARCHAR(255) | NOT NULL                                                               |
| `email`      | VARCHAR(255) | UNIQUE, NOT NULL                                                       |
| `password`   | TEXT         | NOT NULL (bcrypt hashed)                                               |
| `role`       | VARCHAR(15)  | NOT NULL, DEFAULT `contributor`, CHECK (`contributor` \| `maintainer`) |
| `created_at` | TIMESTAMP    | DEFAULT NOW()                                                          |
| `updated_at` | TIMESTAMP    | DEFAULT NOW()                                                          |

### Table: `issues`

| Column        | Type         | Constraints                                                             |
| ------------- | ------------ | ----------------------------------------------------------------------- |
| `id`          | SERIAL       | PRIMARY KEY                                                             |
| `title`       | VARCHAR(150) | NOT NULL                                                                |
| `description` | TEXT         | NOT NULL, CHECK (LENGTH >= 20)                                          |
| `type`        | VARCHAR(20)  | NOT NULL, CHECK (`bug` \| `feature_request`)                            |
| `status`      | VARCHAR(20)  | NOT NULL, DEFAULT `open`, CHECK (`open` \| `in_progress` \| `resolved`) |
| `reporter_id` | INT          | NOT NULL (references `users.id`)                                        |
| `created_at`  | TIMESTAMP    | DEFAULT NOW()                                                           |
| `updated_at`  | TIMESTAMP    | DEFAULT NOW()                                                           |

### Entity Relationship

```
users (1) ──────< issues (many)
  id               reporter_id
```

## Project Structure

```
src/
├── app.ts                        # Express app setup & route mounting
├── server.ts                     # DB init & server start
├── config/
│   └── index.ts                  # Environment variable configuration
├── db/
│   └── index.ts                  # PostgreSQL pool & table initialization
├── middleware/
│   ├── auth.ts                   # JWT auth & role-guard middleware
│   ├── globalErrorHandler.ts     # Centralized error handler
│   └── index.d.ts                # Express Request type augmentation
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts    # Signup & login handlers
│   │   ├── auth.route.ts         # Auth route definitions
│   │   └── auth.service.ts       # Auth DB logic
│   └── issues/
│       ├── issues.controller.ts  # Issue CRUD handlers
│       ├── issues.route.ts       # Issues route definitions
│       └── issues.service.ts     # Issues DB logic
├── types/
│   └── index.ts                  # Shared TypeScript types & interfaces
└── utils/
    ├── sendResponse.ts           # HTTP response helper
    └── validation.ts             # Custom input validation functions
```

## Setup Steps

### Prerequisites

- Node.js LTS runtime (24.x or higher)
- PostgreSQL database (Neon)
- `npm` or any Node package manager

### 1. Clone the Repository

```bash
git clone git@github.com:PrinceCuet77/DevPulse.git
cd devpulse
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
CONNECTIONSTRING=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
PORT=8000
SECRET=your_jwt_secret_key
```

### 4. Run in Development Mode

```bash
npm run dev
```

The server starts and auto-creates the `users` and `issues` tables if they don't exist.

### 5. Build for Production

```bash
npm run build
```

Output is placed in the `dist/` folder.

### 6. Run in Production

```bash
npm start
```

### 7. Deploy to Vercel

Ensure `dist/server.js` is built, then push to a Vercel-connected repository. The `vercel.json` routes all traffic to `dist/server.js`.

---

## API Endpoint Reference

### Base URL

```
http://localhost:8000/api
```

### Health Check

| Method | Endpoint | Auth | Description         |
| ------ | -------- | ---- | ------------------- |
| GET    | `/`      | None | Server health check |

---

### Authentication — `/api/auth`

#### POST `/api/auth/signup` — Register a new user account with contributor or maintainer role

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john.doe@devpulse.com",
  "password": "securePassword123",
  "role": "contributor"
}
```

**Success Response `201`:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 2,
    "name": "John Doe",
    "email": "john.doe@devpulse.com",
    "role": "contributor",
    "created_at": "2026-05-22T13:14:15.807Z",
    "updated_at": "2026-05-22T13:14:15.807Z"
  }
}
```

**Conflict Response `409`:**

```json
{
  "success": false,
  "message": "An account with this email already exists"
}
```

**Bad Request Response `400`:**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email must be a valid email address"
    }
  ]
}
```

- If no `role` is present then the request body

```json
{
  "name": "John Doe",
  "email": "john.doe1@devpulse.com",
  "password": "securePassword123"
}
```

**Success Response `201` with `role` as `contributor` (by default):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 3,
    "name": "John Doe",
    "email": "john.doe1@devpulse.com",
    "role": "contributor",
    "created_at": "2026-05-22T13:25:01.299Z",
    "updated_at": "2026-05-22T13:25:01.299Z"
  }
}
```

#### POST `/api/auth/login` — Authenticate user and receive JWT token

**Request Body:**

```json
{
  "email": "john.doe@devpulse.com",
  "password": "securePassword123"
}
```

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibmFtZSI6IkpvaG4gRG9lIiwiZW1haWwiOiJqb2huLmRvZUBkZXZwdWxzZS5jb20iLCJyb2xlIjoiY29udHJpYnV0b3IiLCJpYXQiOjE3Nzk0NzgxMzAsImV4cCI6MTc3OTU2NDUzMH0.9sBLPgH0LT3UztNUniv8dRTeS2wytcVW-_Ra1CGR9HE",
    "user": {
      "id": 2,
      "name": "John Doe",
      "email": "john.doe@devpulse.com",
      "role": "contributor",
      "created_at": "2026-05-22T13:14:15.807Z",
      "updated_at": "2026-05-22T13:14:15.807Z"
    }
  }
}
```

---

### Issues — `/api/issues`

> Protected routes require the `Authorization` header:
>
> ```
> Authorization: <jwt_token>
> ```

#### POST `/api/issues` — Create a new bug report or feature request

**Auth Required:** `contributor` and `maintainer` both user should be allowed

**Request Body:**

```json
{
  "title": "Database connection timeout under load",
  "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
  "type": "bug"
}
```

> `type` accepts: `bug` | `feature_request` only

**Success Response `201`:**

```json
{
  "success": true,
  "message": "Issue created successfully",
  "data": {
    "id": 1,
    "title": "Database connection timeout under load",
    "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
    "type": "bug",
    "status": "open",
    "reporter_id": 2,
    "created_at": "2026-05-22T13:40:02.285Z",
    "updated_at": "2026-05-22T13:40:02.285Z"
  }
}
```

#### GET `/api/issues` — Retrieve all issues with optional sorting and filtering

**Auth Required:** Public

**Query Parameters:**

| Parameter | Type   | Required | Values                                | Default  |
| --------- | ------ | -------- | ------------------------------------- | -------- |
| `sort`    | string | No       | `newest` \| `oldest`                  | `newest` |
| `type`    | string | No       | `bug` \| `feature_request`            | —        |
| `status`  | string | No       | `open` \| `in_progress` \| `resolved` | —        |

**Example:** `GET /api/issues?type=bug&status=open&sort=oldest`

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Issues retrieved successfully",
  "data": [
    {
      "id": 2,
      "title": "Database connection timeout under load",
      "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
      "type": "bug",
      "status": "open",
      "reporter": {
        "id": 4,
        "name": "John Doe",
        "role": "maintainer"
      },
      "created_at": "2026-05-22T13:45:08.759Z",
      "updated_at": "2026-05-22T13:45:08.759Z"
    }
  ]
}
```

#### GET `/api/issues/:id` — Retrieve full details of a specific issue

**Auth Required:** Public

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Issue retrieved successfully",
  "data": {
    "id": 1,
    "title": "Database connection timeout under load",
    "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
    "type": "bug",
    "status": "open",
    "reporter": {
      "id": 2,
      "name": "John Doe",
      "role": "contributor"
    },
    "created_at": "2026-05-22T13:40:02.285Z",
    "updated_at": "2026-05-22T13:40:02.285Z"
  }
}
```

#### PATCH `/api/issues/:id` — Update issue title, description, or type

**Auth Required:** `contributor` | `maintainer`

> **Contributor restriction:** can only update their own issues and only when status is `open`.  
> **Maintainer:** can update any issue without restriction.

**Request Body (all fields optional but at least one should be present):**

```json
{
  "title": "Updated: Database pool exhaustion fix needed",
  "description": "Updated description with reproduction steps...",
  "type": "bug"
}
```

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Issue updated successfully",
  "data": {
    "id": 1,
    "title": "Updated: Database pool exhaustion fix needed",
    "description": "Updated description with reproduction steps...",
    "type": "bug",
    "status": "open",
    "reporter_id": 2,
    "created_at": "2026-05-22T13:40:02.285Z",
    "updated_at": "2026-05-22T13:58:19.612Z"
  }
}
```

**Not Found Response `404`:**

```json
{
  "success": false,
  "message": "Issue not found"
}
```

**Forbidden Response `403`:**

```json
{
  "success": false,
  "message": "You are not allowed to update this issue"
}
```

**Bad Request Response `400`:**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "body",
      "message": "At least one field (title, description, type) is required"
    }
  ]
}
```

#### DELETE `/api/issues/:id` — Permanently remove an issue from the system

**Auth Required:** `maintainer` only

**Success Response `200` for `maintainer`:**

```json
{
  "success": true,
  "message": "Issue deleted successfully"
}
```

**Forbidden Response `403` for `contributor`:**

```json
{
  "success": false,
  "message": "Forbidden!, This role have no access!"
}
```

**Not Found Response `404`:**

```json
{
  "success": false,
  "message": "Issue not found"
}
```

## Error Response Format

All error responses follow a consistent format:

```json
{
  "success": false,
  "message": "error message",
  "errors": [
    { "field": "type", "message": "Type must be bug or feature_request" }
  ]
}
```

---

## Author

- REZOAN SHAKIL PRINCE
- Senior Software Engineer
- BJIT Ltd
