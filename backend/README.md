# Property Listing API

This service is the server-side API for the Next.js frontend. It uses Express, PostgreSQL, Prisma, Zod, Argon2id, and secure HTTP-only JWT cookies.

## Setup

1. Copy `.env.example` to `.env` and replace every placeholder with local values. Do not commit `.env`.
2. Create the PostgreSQL database named in `DATABASE_URL`.
3. Generate the Prisma client and apply the initial migration:

   ```powershell
   npm.cmd run prisma:generate
   npm.cmd run prisma:migrate -- --name init
   ```

4. Seed the initial administrator from the `INITIAL_ADMIN_*` values in `.env`:

   ```powershell
   npm.cmd run prisma:seed
   ```

5. Start the API:

   ```powershell
   npm.cmd run dev
   ```

The health endpoint is `GET /api/health`. It reports `503` if the database is unavailable.

## Authentication and authorization

- `POST /api/auth/login` authenticates only active `ADMIN` users. It has no registration counterpart.
- A successful login writes a short-lived, HTTP-only `access_token` cookie. The browser must send credentials with API requests.
- `POST /api/auth/logout` revokes the current database session.
- `GET /api/auth/me` requires authentication.
- Every `/api/admin/*` endpoint requires an active session and a database-verified `ADMIN` role; unauthenticated callers receive `401`, non-admin callers receive `403`.
- The only initial admin creation path is the server-side Prisma seed. Subsequent admin provisioning should be added as an audited, admin-protected workflow.

## Frontend connection

For local development, the admin page defaults to `http://localhost:4000`. To use a different API URL, add this non-secret value to the root `.env.local`:

```text
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Never put database URLs, JWT secrets, or administrator passwords in `NEXT_PUBLIC_*` variables.
