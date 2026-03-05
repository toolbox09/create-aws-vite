# test-repo

Turborepo 기반 풀스택 모노레포 프로젝트

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| **Web** | React 19, Vite 6, TypeScript, Tailwind CSS v4, shadcn/ui, Zustand, TanStack Query |
| **Server** | Rust (actix-web), SQLx, PostgreSQL, AWS SDK S3 (MinIO 호환) |
| **Infra (Local)** | Docker Compose (PostgreSQL 16, MinIO) |
| **Infra (AWS)** | CDK — App Runner, RDS, S3 (ap-northeast-1) |

## 프로젝트 구조

```
test-repo/
├── web/                     # @test-repo/web - React SPA (CSR)
│   ├── src/
│   │   ├── main.tsx         # 엔트리 (QueryClient, BrowserRouter)
│   │   ├── App.tsx          # 라우트 설정
│   │   ├── stores/          # Zustand 스토어
│   │   ├── hooks/           # TanStack Query 훅
│   │   ├── lib/utils.ts     # shadcn cn() 유틸
│   │   └── app.css          # Tailwind CSS
│   └── components.json      # shadcn/ui 설정
│
├── server/                  # @test-repo/server - Rust API
│   ├── Cargo.toml
│   └── src/
│       ├── main.rs          # 서버 엔트리 (actix-web)
│       ├── config.rs        # 환경변수 설정
│       ├── routes/          # API 핸들러 (health, upload)
│       ├── db/              # DB 연결 및 마이그레이션
│       ├── models/          # 데이터 모델
│       └── errors.rs        # 에러 핸들링
│
├── infra/
│   ├── local/               # Docker Compose (로컬 개발)
│   │   └── docker-compose.yml
│   └── aws-cdk/             # AWS CDK (선택)
│       ├── lib/
│       │   ├── dev-stack.ts
│       │   ├── prod-stack.ts
│       │   └── shared/      # VPC, RDS, S3, App Runner
│       └── bin/app.ts
│
├── package.json             # Turborepo 루트
├── turbo.json               # Turbo 태스크 설정
└── pnpm-workspace.yaml      # 워크스페이스 정의
```

## 사전 요구사항

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) >= 9
- [Rust](https://www.rust-lang.org/tools/install) (최신 stable)
- [cargo-watch](https://github.com/watchexec/cargo-watch) — 서버 핫리로딩용
- [Docker](https://www.docker.com/) — 로컬 인프라용

```bash
# cargo-watch 설치
cargo install cargo-watch
```

## 시작하기

### 1. 로컬 인프라 실행

```bash
cd infra/local
docker compose up -d
```

PostgreSQL (`localhost:5432`)과 MinIO (`localhost:9000`, 콘솔 `localhost:9001`)이 실행됩니다.

| 서비스 | 포트 | 계정 |
|--------|------|------|
| PostgreSQL | 5432 | postgres / postgres |
| MinIO API | 9000 | minioadmin / minioadmin |
| MinIO Console | 9001 | minioadmin / minioadmin |

### 2. 서버 환경변수 설정

```bash
cd server
cp .env.example .env
```

### 3. 의존성 설치

```bash
# 프로젝트 루트에서
pnpm install
```

### 4. 개발 서버 실행

```bash
# 전체 (web + server 동시 실행, 핫리로딩)
pnpm dev

# Turborepo 필터로 개별 실행
pnpm dev:web       # React 개발 서버 (http://localhost:5173)
pnpm dev:server    # Rust API 서버 (http://localhost:3000, 핫리로딩)
```

#### 직접 실행 (Turborepo 없이)

각 프로젝트 디렉토리에서 직접 실행할 수도 있습니다:

```bash
# Web — 별도 터미널
cd web
pnpm dev

# Server — 별도 터미널 (핫리로딩)
cd server
cargo watch -x run

# Server — 핫리로딩 없이 1회 실행
cd server
cargo run
```

`pnpm dev` 실행 시 Turborepo가 web과 server를 **동시에** 실행하며,
두 프로젝트 모두 파일 변경 시 **자동으로 리로딩**됩니다.

- **Web**: Vite HMR (Hot Module Replacement) — `http://localhost:5173`
- **Server**: cargo-watch (소스 변경 감지 → 자동 재컴파일 및 재시작) — `http://localhost:3000`
- **API 프록시**: Vite가 `/api/*` 요청을 서버(3000)로 자동 프록시

## 빌드

```bash
# 전체 빌드
pnpm build

# 개별 빌드
pnpm build:web       # Vite 프로덕션 빌드 → web/dist/
pnpm build:server    # cargo build --release → server/target/release/
```

## API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/health` | 헬스체크 (DB 연결 확인) |
| **Counters** | | |
| GET | `/api/counters` | 카운터 목록 |
| POST | `/api/counters` | 카운터 생성 (`{ "name": "my-counter" }`) |
| GET | `/api/counters/:name` | 카운터 조회 |
| PATCH | `/api/counters/:name` | 카운터 업데이트 (`{ "delta": 1 }` 또는 `{ "delta": -1 }`) |
| DELETE | `/api/counters/:name` | 카운터 삭제 |
| **Files** | | |
| GET | `/api/files` | 완료된 파일 목록 |
| POST | `/api/files` | 업로드 시작 (presigned PUT URL 발급) |
| PATCH | `/api/files/:id/confirm` | 업로드 완료 확인 (S3 검증 → completed) |
| GET | `/api/files/:id` | presigned 다운로드 URL 발급 |
| DELETE | `/api/files/:id` | 파일 삭제 (DB + S3) |
| POST | `/api/files/cleanup` | 만료된 pending 파일 정리 |

## shadcn/ui 컴포넌트 추가

```bash
cd web
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add dialog
```

## AWS 배포 (CDK)

> AWS CDK 인프라를 선택한 경우에만 `infra/aws-cdk/` 디렉토리가 생성됩니다.

### 사전 요구사항 (AWS)

- [AWS CLI](https://aws.amazon.com/cli/) 설치 및 인증 설정 (`aws configure`)
- [AWS CDK CLI](https://docs.aws.amazon.com/cdk/latest/guide/cli.html) — `npm install -g aws-cdk`
- [Docker](https://www.docker.com/) — 서버 이미지 빌드용
- CDK 부트스트랩 (최초 1회): `cdk bootstrap aws://<ACCOUNT_ID>/ap-northeast-1`

### 배포 아키텍처

```
        사용자
          │
    ┌─────┴─────┐
    │ CloudFront │ ← 단일 진입점
    └─────┬─────┘
          │
    ┌─────┴──────────────────┐
    │                        │
    │ /api/*           그 외 (정적 파일)
    ▼                        ▼
┌──────────────┐     ┌──────────────┐
│  App Runner  │     │  S3 (Web)    │
│  (Rust API)  │     │  index.html  │
└──────┬───────┘     │  assets/     │
       │ VPC         └──────────────┘
       │ Connector
┌──────┼────────────┐
│      │            │
▼      ▼            ▼
RDS   S3(Storage)  Secrets
```

### AWS 리소스 구성

| 환경 | App Runner | RDS | S3 | CloudFront | 데이터 보호 |
|------|-----------|-----|-----|-----------|------------|
| **Dev** | 0.25 vCPU, 0.5 GB, 1~3 | t3.micro, Single-AZ | 버저닝 없음 | PriceClass 100 | 없음 (즉시 삭제) |
| **Prod** | 1 vCPU, 2 GB, 2~10 | t3.medium, Multi-AZ | 버저닝, 라이프사이클 | PriceClass 200 | 기본 보호 (`--force`로 해제) |

리전: `ap-northeast-1` (Tokyo)

---

### 1. 최초 배포 (Dev)

```bash
cd infra/aws-cdk
pnpm install

# Step 1: ECR 리포지토리 생성
pnpm deploy:ecr

# Step 2: Docker 이미지 빌드 & 푸시 (App Runner가 참조할 이미지 필요)
pnpm docker:build
pnpm docker:push

# Step 3: 인프라 배포 (VPC + RDS + S3 + CloudFront + App Runner)
pnpm deploy:dev

# Step 4: 웹 배포 — 빌드 & S3 업로드 & CloudFront 캐시 무효화
pnpm deploy:web
```

배포 완료 후 CloudFront URL (`https://xxxx.cloudfront.net`)로 접속합니다.

### 2. 최초 배포 (Prod)

```bash
cd infra/aws-cdk

# ECR은 Dev에서 이미 생성됨 (공유)
pnpm docker:build
pnpm docker:push
pnpm deploy:prod
pnpm deploy:web:prod
```

---

### 3. 서버 코드 업데이트 (Dev)

서버 코드만 수정했을 때는 Docker 이미지만 다시 푸시하면 됩니다.

```bash
cd infra/aws-cdk

pnpm docker:build
pnpm docker:push
# → :latest 태그 → Dev App Runner 자동 배포
```

### 3-1. 서버 운영 배포 (Prod)

Dev에서 테스트 완료된 이미지를 Prod에 배포합니다.

```bash
cd infra/aws-cdk

pnpm docker:push:prod
# → 현재 :latest 이미지를 :prod 태그로 푸시
# → Prod App Runner 배포 트리거 (수동)
```

> Dev와 Prod에 **동일한 이미지**가 배포됩니다.
> 반드시 Dev에서 충분히 테스트한 후 실행하세요.

### 4. 웹 코드 업데이트

프론트엔드 코드만 수정한 경우:

```bash
cd infra/aws-cdk

pnpm deploy:web          # 또는 pnpm deploy:web:prod
# → 빌드 → S3 업로드 → CloudFront 캐시 무효화 (자동)
```

### 5. 인프라 업데이트 (CDK 스택 변경된 경우)

CDK 코드(스택 설정, 환경변수, 리소스 스펙 등)를 수정한 경우:

```bash
cd infra/aws-cdk

# Step 1: 변경 사항 미리보기 (필수 — 의도하지 않은 리소스 교체 방지)
pnpm diff:dev       # 또는 pnpm diff:prod

# Step 2: 변경 사항 배포
pnpm deploy:dev     # 또는 pnpm deploy:prod
```

> `diff`에서 **Replace** 표시가 있으면 리소스가 삭제 후 재생성됩니다.
> RDS Replace가 표시되면 데이터가 유실될 수 있으니 반드시 확인하세요.

### 6. 전체 업데이트 (인프라 + 서버 + 웹)

```bash
cd infra/aws-cdk

# 인프라
pnpm diff:dev
pnpm deploy:dev

# 서버
pnpm docker:build
pnpm docker:push

# 웹
pnpm deploy:web
```

---

### 7. 스택 삭제

배포된 스택은 3개입니다:

| 스택 | 설명 | 삭제 순서 |
|------|------|-----------|
| `test-repo-dev` | Dev 인프라 (VPC, RDS, S3, App Runner, CloudFront) | 1번째 |
| `test-repo-prod` | Prod 인프라 (동일 구성) | 1번째 |
| `test-repo-ecr` | ECR 리포지토리 (Dev/Prod 공유) | 마지막 |

> **삭제 순서가 중요합니다.** ECR은 Dev/Prod가 참조하므로 반드시 마지막에 삭제하세요.

#### Dev만 삭제

```bash
cd infra/aws-cdk

# Step 1: Dev 인프라 삭제
pnpm destroy:dev

# Step 2: ECR도 삭제할 경우 (Prod가 없을 때만)
pnpm destroy:ecr
```

또는 한번에:

```bash
pnpm destroy:all:dev    # Dev + ECR 동시 삭제
```

#### Prod만 삭제

```bash
cd infra/aws-cdk

# 안전 삭제 — RDS, S3는 보존 (고아 리소스로 남음)
pnpm destroy:prod

# 완전 삭제 — RDS, S3 포함 모든 리소스 삭제
pnpm destroy:prod:force
```

> **Prod 안전 삭제**: `deletionProtection`과 `RemovalPolicy.RETAIN`이 적용되어
> RDS와 S3는 AWS 계정에 남습니다. 수동 삭제하거나 `destroy:prod:force`로 제거하세요.

#### 전체 삭제 (Dev + Prod + ECR)

```bash
cd infra/aws-cdk

# Step 1: Dev 삭제
pnpm destroy:dev

# Step 2: Prod 삭제
pnpm destroy:prod:force

# Step 3: ECR 삭제 (마지막)
pnpm destroy:ecr
```

#### 삭제 후 남은 리소스 확인

Prod 안전 삭제 후 남은 리소스를 확인하려면:

```bash
# RDS 인스턴스 확인
aws rds describe-db-instances --region ap-northeast-1 \
  --query "DBInstances[?contains(DBInstanceIdentifier, 'test-repo')].DBInstanceIdentifier"

# S3 버킷 확인
aws s3 ls | grep test-repo

# 수동 삭제 (필요시)
aws rds delete-db-instance --db-instance-identifier <INSTANCE_ID> --skip-final-snapshot --region ap-northeast-1
aws s3 rb s3://<BUCKET_NAME> --force
```

#### CDK 로컬 캐시 정리

배포 문제가 발생하거나 스택 구조를 변경한 경우:

```bash
cd infra/aws-cdk

# CDK 합성 캐시 삭제
rm -rf cdk.out

# 정상 동작 확인
pnpm synth
```

---

### NPM 스크립트 요약 (infra/aws-cdk)

| 스크립트 | 설명 |
|----------|------|
| `pnpm deploy:ecr` | ECR 리포지토리 생성 (최초 1회) |
| `pnpm diff:dev` | Dev 스택 변경 사항 미리보기 |
| `pnpm diff:prod` | Prod 스택 변경 사항 미리보기 |
| `pnpm deploy:dev` | Dev 인프라 배포 |
| `pnpm deploy:prod` | Prod 인프라 배포 |
| `pnpm destroy:dev` | Dev 삭제 |
| `pnpm destroy:ecr` | ECR 삭제 |
| `pnpm destroy:all:dev` | Dev + ECR 전체 삭제 |
| `pnpm destroy:prod` | Prod 안전 삭제 (RDS, S3 보존) |
| `pnpm destroy:prod:force` | Prod 완전 삭제 (모든 리소스) |
| `pnpm docker:build` | Rust 서버 Docker 이미지 빌드 |
| `pnpm docker:push` | ECR에 :latest 푸시 (→ Dev App Runner 자동 배포) |
| `pnpm docker:push:prod` | :latest를 :prod로 푸시 (→ Prod App Runner 수동 배포) |
| `pnpm deploy:web` | Dev 웹 배포 (빌드 → S3 → CloudFront 캐시 무효화) |
| `pnpm deploy:web:prod` | Prod 웹 배포 |
