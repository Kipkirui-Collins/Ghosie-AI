# Ghosie AI

A Next.js app with Prisma, NextAuth, GitHub OAuth, email magic links, and credential sign-up.

## Setup

1. Install dependencies

```bash
npm install
```

2. Create a `.env` file from `.env.example` and fill in secrets.

3. Start the dev server

```bash
npm run dev -- --port 3001
```

## Production

```bash
npm run build
npm start
```

## Notes

- `DATABASE_URL` should point to PostgreSQL at `127.0.0.1:5432`
- `NEXTAUTH_URL` should match the app host
- `EMAIL_SERVER_*` values are required for email sign-in
