-- ============================================================
-- 회원 인증 시스템 스키마
-- ============================================================

-- 회원 역할 ENUM
CREATE TYPE user_role AS ENUM ('CL-P', 'CL-C', 'PT', 'ADMIN');

-- 회원 상태 ENUM
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'withdrawn');

-- 라이센스 심사 상태 ENUM
CREATE TYPE license_status AS ENUM ('pending', 'approved', 'rejected');

-- ─── users ───
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255),                          -- NULL if social-only
    name            VARCHAR(100) NOT NULL,
    phone           VARCHAR(20),
    company         VARCHAR(200),                          -- 파트너/법인 건축주
    role            user_role NOT NULL DEFAULT 'CL-P',
    status          user_status NOT NULL DEFAULT 'active',
    avatar_url      VARCHAR(500),
    ci              VARCHAR(255) UNIQUE,                   -- 본인인증 CI (암호화)
    di              VARCHAR(255),                          -- 본인인증 DI (암호화)
    identity_verified BOOLEAN NOT NULL DEFAULT FALSE,
    login_fail_count  INT NOT NULL DEFAULT 0,
    locked_until    TIMESTAMPTZ,
    agreed_marketing BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_users_status ON users (status);

-- ─── user_oauth ───
CREATE TABLE user_oauth (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider        VARCHAR(20) NOT NULL,                  -- naver, kakao
    provider_id     VARCHAR(255) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(provider, provider_id)
);

CREATE INDEX idx_user_oauth_user_id ON user_oauth (user_id);

-- ─── user_interests ───
CREATE TABLE user_interests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cert_types      TEXT[] NOT NULL DEFAULT '{}',           -- {설계, 시공, 감리}
    building_usages TEXT[] NOT NULL DEFAULT '{}',           -- {단독주택, 다세대주택, ...}
    regions         TEXT[] NOT NULL DEFAULT '{}'            -- {서울, 경기, ...}
);

-- ─── user_preferences ───
CREATE TABLE user_preferences (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    language        VARCHAR(10) NOT NULL DEFAULT 'ko',
    region          VARCHAR(50),
    currency        VARCHAR(10) NOT NULL DEFAULT 'KRW',
    area_unit       VARCHAR(10) NOT NULL DEFAULT 'sqm',    -- sqm, pyeong
    theme           VARCHAR(10) NOT NULL DEFAULT 'light'
);

-- ─── user_notification_settings ───
CREATE TABLE user_notification_settings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bid_email       BOOLEAN NOT NULL DEFAULT TRUE,
    bid_push        BOOLEAN NOT NULL DEFAULT TRUE,
    proposal_email  BOOLEAN NOT NULL DEFAULT TRUE,
    proposal_push   BOOLEAN NOT NULL DEFAULT TRUE,
    contract_email  BOOLEAN NOT NULL DEFAULT TRUE,
    contract_push   BOOLEAN NOT NULL DEFAULT TRUE,
    chat_email      BOOLEAN NOT NULL DEFAULT FALSE,
    chat_push       BOOLEAN NOT NULL DEFAULT TRUE,
    marketing_email BOOLEAN NOT NULL DEFAULT FALSE,
    marketing_push  BOOLEAN NOT NULL DEFAULT FALSE
);

-- ─── password_reset_tokens ───
CREATE TABLE password_reset_tokens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token           VARCHAR(255) UNIQUE NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    used            BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens (token);

-- ─── refresh_tokens ───
CREATE TABLE refresh_tokens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash      VARCHAR(255) UNIQUE NOT NULL,
    device_name     VARCHAR(200),
    ip_address      VARCHAR(50),
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens (token_hash);

-- ─── partner_licenses ───
CREATE TABLE partner_licenses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    license_type    VARCHAR(50) NOT NULL,                  -- business_reg, architect, constructor, supervisor
    file_url        VARCHAR(500) NOT NULL,
    status          license_status NOT NULL DEFAULT 'pending',
    reviewed_by     UUID REFERENCES users(id),
    reviewed_at     TIMESTAMPTZ,
    reject_reason   TEXT,
    -- 사업자 OCR 파싱 데이터
    biz_company     VARCHAR(200),
    biz_address     VARCHAR(500),
    biz_owner       VARCHAR(100),
    biz_reg_no      VARCHAR(20),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_partner_licenses_user_id ON partner_licenses (user_id);
CREATE INDEX idx_partner_licenses_status ON partner_licenses (status);
