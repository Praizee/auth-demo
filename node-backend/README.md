# Auth API

Production-ready Node.js + Express authentication REST API with JWT, bcrypt, and MongoDB. Built to replace the defective backend at [auth-demo-bay.vercel.app](https://auth-demo-bay.vercel.app).

---

## Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js ≥ 18 |
| Framework | Express 4 |
| Database | MongoDB + Mongoose |
| Auth | JSON Web Tokens (jsonwebtoken) |
| Hashing | bcryptjs |
| Validation | express-validator |
| Config | dotenv |

---

## Running Locally

### 1. Clone & install

```bash
git clone <repo-url>
cd auth-api
git checkout feature/node-backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Start the server

```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

Server starts on `http://localhost:5000` (or `PORT` from `.env`).

Health check: `GET http://localhost:5000/health`

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: `5000`) |
| `NODE_ENV` | No | `development` or `production` |
| `MONGO_URI` | **Yes** | MongoDB Atlas connection string |
| `JWT_SECRET` | **Yes** | Secret for signing JWTs (min 32 chars recommended) |
| `JWT_EXPIRES_IN` | No | Token lifetime (default: `7d`) |
| `EXTRA_ORIGINS` | No | Extra CORS origins, comma-separated |

---

## API Reference

Base URL: `/api/auth`

All responses follow this shape:

```json
{
  "success": true | false,
  "message": "Human-readable message",
  // ...additional fields
}
```

---

### POST `/api/auth/signup`

Create a new user account.

**Request body:**

```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "password": "SecurePass1",
  "role": "user",
  "bio": "Frontend developer based in Lagos"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `firstName` | string | Yes | Max 50 chars |
| `lastName` | string | Yes | Max 50 chars |
| `email` | string | Yes | Must be unique |
| `password` | string | Yes | Min 8 chars, 1 uppercase, 1 number |
| `role` | string | No | `"user"` (default) or `"admin"` |
| `bio` | string | No | Max 500 chars |

**Success — 201:**

```json
{
  "success": true,
  "message": "Account created successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane@example.com",
    "role": "user",
    "bio": "Frontend developer based in Lagos",
    "createdAt": "2025-06-01T12:00:00.000Z",
    "updatedAt": "2025-06-01T12:00:00.000Z"
  }
}
```

**Error responses:**

| Status | Condition |
|---|---|
| 400 | Validation failed (missing/invalid fields) |
| 409 | Email already registered |
| 500 | Server error |

---

### POST `/api/auth/login`

Authenticate an existing user.

**Request body:**

```json
{
  "email": "jane@example.com",
  "password": "SecurePass1"
}
```

**Success — 200:**

```json
{
  "success": true,
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane@example.com",
    "role": "user",
    "bio": "Frontend developer based in Lagos",
    "createdAt": "2025-06-01T12:00:00.000Z",
    "updatedAt": "2025-06-01T12:00:00.000Z"
  }
}
```

**Error responses:**

| Status | Condition |
|---|---|
| 400 | Validation failed |
| 401 | Invalid email or password |
| 500 | Server error |

---

### PUT `/api/auth/account`

Update the authenticated user's account. All fields are optional — only send what you want to update.

**Headers:**

```
Authorization: Bearer <token>
```

**Request body (all optional):**

```json
{
  "firstName": "Janet",
  "lastName": "Smith",
  "bio": "Updated bio",
  "role": "admin",
  "password": "NewSecurePass2"
}
```

**Success — 200:**

```json
{
  "success": true,
  "message": "Account updated successfully.",
  "user": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "firstName": "Janet",
    "lastName": "Smith",
    "email": "jane@example.com",
    "role": "admin",
    "bio": "Updated bio",
    "createdAt": "2025-06-01T12:00:00.000Z",
    "updatedAt": "2025-06-01T13:00:00.000Z"
  }
}
```

**Error responses:**

| Status | Condition |
|---|---|
| 400 | Validation failed or no fields provided |
| 401 | Missing, invalid, or expired token |
| 404 | User not found |
| 500 | Server error |

---

## Deploying to Render

### 1. Create a Web Service

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repo
3. Select the `feature/node-backend` branch

### 2. Configure the service

| Setting | Value |
|---|---|
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |

### 3. Set environment variables

In the Render dashboard → **Environment** tab, add:

| Key | Value |
|---|---|
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A long random string (`openssl rand -hex 64`) |
| `JWT_EXPIRES_IN` | `7d` |
| `NODE_ENV` | `production` |

### 4. MongoDB Atlas — allow Render IPs

In Atlas → **Network Access**, add `0.0.0.0/0` (allow all) while testing, or whitelist Render's static IPs once available.

### 5. Merge to main

Once the service is live and all endpoints are verified:

```bash
git checkout main
git merge feature/node-backend
git push origin main
```

---

## Project Structure

```
/
├── src/
│   ├── controllers/
│   │   └── auth.controller.js   # Business logic for each endpoint
│   ├── middleware/
│   │   └── auth.middleware.js   # JWT verification middleware
│   ├── models/
│   │   └── user.model.js        # Mongoose schema + password hooks
│   ├── routes/
│   │   └── auth.routes.js       # Route definitions
│   ├── validators/
│   │   └── auth.validators.js   # express-validator rule sets
│   └── app.js                   # Express app, CORS, error handler
├── .env.example
├── .gitignore
├── package.json
└── server.js                    # DB connection + server start
```

---

## Security Notes

- Passwords are hashed with bcryptjs at 12 salt rounds
- Password field is excluded from all DB queries by default (`select: false`)
- JWT tokens expire after 7 days by default
- Login uses a generic error message for both "user not found" and "wrong password" to prevent user enumeration
- CORS is locked to `https://auth-demo-bay.vercel.app` by default
