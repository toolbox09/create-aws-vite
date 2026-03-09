# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Turborepo-based fullstack monorepo: React SPA (web) + Rust API (server) + AWS CDK (infra). Language is Korean for docs, English for code.

## Commands

```bash
# Root — runs both web and server concurrently with hot-reload
pnpm dev

# Individual
pnpm dev:web              # Vite dev server (http://localhost:5173)
pnpm dev:server           # cargo watch (http://localhost:3000)

# Build
pnpm build                # All
pnpm build:web            # web/dist/
pnpm build:server         # server/target/release/

# Lint (web only)
pnpm lint

# Server direct (without Turborepo)
cd server && cargo watch -x run -w src   # hot-reload
cd server && cargo run                    # one-shot
cd server && cargo check                  # type-check only

# Local infra
cd infra/local && docker compose up -d    # PostgreSQL:5432 + MinIO:9000

# AWS deployment (from infra/aws-cdk/)
pnpm deploy:dev           # CDK infra deploy
pnpm docker:build         # Build Rust Docker image
pnpm docker:push          # Push :latest → Dev auto-deploy
pnpm docker:push:prod     # Push :prod → Prod manual deploy
pnpm deploy:web           # Build web → S3 → CloudFront invalidate
pnpm destroy:dev          # Tear down all Dev resources
```

## Architecture

```
test-repo/
├── web/                  # @test-repo/web — React 19 SPA (CSR)
├── server/               # @test-repo/server — Rust API (actix-web)
└── infra/
    ├── local/            # Docker Compose (PostgreSQL 16, MinIO)
    └── aws-cdk/          # CDK stacks (VPC, ECR, RDS, S3, CloudFront, App Runner)
```

**Web** (`web/`): React 19 + Vite 6 + TypeScript + Tailwind CSS v4 + shadcn/ui (New York style) + Zustand 5 + TanStack Query 5. Path alias `@/` maps to `src/`. Vite proxies `/api/*` to `localhost:3000` in dev.

**Server** (`server/`): Rust with actix-web. SQLx for PostgreSQL (runtime migrations from `./migrations/`). AWS SDK S3 for file storage (MinIO locally). Port 3000. Wrapped in a package.json for Turborepo integration via `cargo watch`.

**Infra** (`infra/aws-cdk/`): Nested CDK stacks. CloudFront is the single entry point — routes `/api/*` to App Runner, everything else to S3 (web). Dev uses `:latest` ECR tag (auto-deploy), Prod uses `:prod` tag (manual trigger).

## Key Patterns

- **File uploads use presigned URLs**: Client gets presigned PUT URL from server → uploads directly to S3 → confirms with server. Status lifecycle: `pending` → `completed` → `deleted`.
- **DB migrations run at server startup** via runtime `Migrator` (not compile-time macro).
- **Stale file cleanup** runs as best-effort background task (`tokio::spawn`) on each upload init.
- **API error handling**: `AppError` enum in `errors.rs` with `From<sqlx::Error>` and `From<anyhow::Error>` impls.
- **Prod data protection**: RDS and S3 use `RemovalPolicy.RETAIN` and `deletionProtection` by default. Use `destroy:prod:force` to override.

## Verification

- `pnpm build:web` 성공 = 검증 완료. 브라우저 스크린샷/Playwright 확인 불필요.
- 빌드 실패 시에만 디버깅.

## Environment

Server expects `.env` file (see `.env.example`):
- `DATABASE_URL` — PostgreSQL connection string
- `S3_ENDPOINT`, `S3_BUCKET`, `S3_REGION` — S3/MinIO config
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` — credentials
- `SERVER_HOST`, `SERVER_PORT` — defaults to 127.0.0.1:3000
