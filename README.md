## Current Team

- **Rahdyce Era** — Technical Project Manager
- **Skye Blue** — Architecture
- **Haras Jailani** — Scrum Master
- **Jayla Rivera** — Product Owner
- **Success Emmanuel** — Point of Contact

## Previous Teams ReadMe and download instructions

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Database Setup: Supabase

### Step 1: Get the Supabase Connection String

- Ask for the shared Supabase `DATABASE_URL`
- Use the **Session Pooler** connection (NOT the Direct connection)
- It should look like:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@aws-...pooler.supabase.com:6543/postgres

Step 2: Create .env.local

- In the root of the project, create a file named:
.env.local
- Add your connection string:
DATABASE_URL=your_supabase_connection_string_here
(Do NOT commit .env.local to GitHub)

Step 3: Install Dependencies

After pulling the latest code, run:

npm install

Step 4: Sync Problems to Supabase

Run this command from the project root:

node scripts/syncProblemsToSupabase.js

Step 5: Run the App
npm run dev

Open:

http://localhost:3000

## End of previous Teams Download Instructions
```
