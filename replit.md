# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + TailwindCSS + Recharts + Wouter

## Application: FinanzaPro

A financial management web app for individuals and businesses to track income and expenses.

### Features
- Dashboard with financial summary (balance, income, expenses), monthly trend charts, category breakdowns, and recent movements
- Movements management: create, edit, delete income and expense transactions with filters by date, category, type, and search
- Categories management: create, edit, delete categories with color and type (income/expense/both)
- User profile settings (name, account type personal/business, currency)

### DB Tables
- `categories` — transaction categories (name, type, color, icon)
- `movements` — financial transactions (type, amount, description, date, categoryId, notes)
- `profile` — single user/business profile (name, type, currency, email)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
