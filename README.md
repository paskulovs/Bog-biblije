# Bog Biblije

## CMS authentication

The CMS now uses username/password authentication through `next-auth`.

Required environment variables:

- `CMS_USERNAME`
- `CMS_PASSWORD`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `POSTGRES_URL` or one of the existing `POSTGRES_*` connection variables

Copy `.env.example` to `.env.local` and replace the placeholder values before running locally or deploying.

## Deployment

1. Install dependencies with `npm install`.
2. Create the production environment variables from `.env.example`.
3. Provision a PostgreSQL database.
4. Create the required tables by running [`database/init.sql`](/Users/sinisapaskulov/Projects/Bog-biblije/database/init.sql) against that database, unless the tables already exist.
5. Build the app with `npm run build`.
6. Start it with `npm run start`, or connect the repo to your deployment platform and set the same environment variables there.

## Notes

- Public website reads stay open.
- CMS pages require a valid session.
- CMS write operations on `/api/blog-posts`, `/api/books`, `/api/videos`, and `/api/articles` now require authentication.
