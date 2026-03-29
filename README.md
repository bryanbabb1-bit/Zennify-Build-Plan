# Zennify Project Planner

Internal Salesforce project planning tool for Zennify consultants. Ingests client discovery artifacts, runs AI analysis, and generates complete project plans including outcomes, epics, user stories, solution design, and build instructions.

## Features

- **Discovery** — Digital maturity assessment, tech stack profiling, discovery notes
- **Documents** — PDF/DOCX upload + Google Drive import (SOW, Hubbl scan reports)
- **AI Analysis** — Claude-powered generation of outcomes → epics → stories → solution design → build instructions
- **Jira Export** — CSV and JSON export in Jira import format
- **Client Share** — Read-only shareable link with configurable section visibility
- **Standards** — Admin-managed standards documents injected into every AI prompt

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **UI**: Tailwind CSS + shadcn/ui (Radix UI)
- **Auth**: Clerk (Google Workspace SSO)
- **Database**: PostgreSQL via Neon + Prisma ORM
- **AI**: Anthropic Claude API (claude-sonnet-4-6)
- **Storage**: Vercel Blob
- **Deploy**: Vercel

## Setup

1. Copy `.env.example` to `.env.local` and fill in all values

2. Install dependencies:
   ```bash
   npm install
   ```

3. Push the database schema:
   ```bash
   npm run db:push
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

See `.env.example` for all required variables:

- `DATABASE_URL` — Neon PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` — Clerk auth
- `ANTHROPIC_API_KEY` — Claude AI
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob storage
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google Drive OAuth
- `NEXT_PUBLIC_APP_URL` — Your app URL (for share links and OAuth callbacks)

## Key Commands

```bash
npm run dev          # Start development server
npm run db:push      # Sync Prisma schema to database
npm run db:studio    # Open Prisma Studio data browser
npm run db:generate  # Regenerate Prisma client after schema changes
npm run build        # Production build
```

## Project Flow

Each engagement follows 7 phases:

1. **Discovery** — Fill in maturity assessment, tech stack, and discovery notes
2. **Documents** — Upload SOW, Hubbl scan (PDF/DOCX or import from Google Drive)
3. **Analysis** — Run AI analysis (generates all outputs in 4 sequential steps)
4. **Plan** — Review outcomes → epics → stories tree; export to Jira
5. **Design** — Review Salesforce architecture recommendations
6. **Build** — Review step-by-step implementation instructions
7. **Share** — Generate client-facing shareable link

## Google Drive Integration

Consultants connect their Google account once in the app, then can import files directly from Drive into any project. Supported formats: PDF, DOCX, Google Docs, XLSX, CSV.

## Standards Documents

Admins upload internal standards (story writing guides, naming conventions, delivery methodology, etc.) via the Standards admin page. Active documents are automatically injected into every AI prompt to ensure consistent outputs.
