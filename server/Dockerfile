FROM lukemathwalker/cargo-chef:latest-rust-1 AS chef
WORKDIR /app

# 1단계: 레시피 생성
FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

# 2단계: 의존성만 빌드 (도커 캐시 최대 활용)
FROM chef AS builder
RUN apt-get update && apt-get install -y --no-install-recommends \
    pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*

COPY --from=planner /app/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json

COPY . .
RUN cargo build --release

# 3단계: 런타임
FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates libssl3 && rm -rf /var/lib/apt/lists/*

RUN useradd -m -u 1001 appuser
COPY --from=builder /app/target/release/test-repo-server /usr/local/bin/server
COPY --from=builder /app/migrations /app/migrations

RUN chown -R appuser:appuser /app
USER appuser

ENV SERVER_HOST=0.0.0.0
ENV SERVER_PORT=3000
EXPOSE 3000
WORKDIR /app
CMD ["server"]
