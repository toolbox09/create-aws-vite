-- ============================================================
-- 파트너스 기능 스키마
-- ============================================================

-- ─── common_codes (공통 코드) ───
CREATE TABLE common_codes (
    id              BIGSERIAL PRIMARY KEY,
    group_code      VARCHAR(30) NOT NULL,
    code            VARCHAR(20) NOT NULL,
    label           VARCHAR(50) NOT NULL,
    sort_order      SMALLINT NOT NULL DEFAULT 0,
    parent_code     VARCHAR(20),
    metadata        JSONB,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(group_code, code)
);

CREATE INDEX idx_common_codes_group ON common_codes (group_code);

-- ─── partners (파트너/사무소) ───
CREATE TABLE partners (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             UUID REFERENCES users(id),          -- 연결된 사용자 계정 (선택)
    name                VARCHAR(100) NOT NULL,
    sido_code           CHAR(2) NOT NULL,
    sigungu_code        CHAR(5),
    address             VARCHAR(200) NOT NULL,
    profile_image_url   TEXT,
    cover_image_url     TEXT,
    certs               TEXT[] NOT NULL DEFAULT '{}',
    usages              TEXT[] NOT NULL DEFAULT '{}',
    founded_year        SMALLINT NOT NULL,
    ceo_name            VARCHAR(50) NOT NULL,
    employee_count      SMALLINT,
    phone               VARCHAR(20),
    website_url         TEXT,
    intro               TEXT NOT NULL DEFAULT '',
    brand_story_content TEXT,
    rating              FLOAT8 DEFAULT 0.0,
    review_count        INT NOT NULL DEFAULT 0,
    portfolio_count     INT NOT NULL DEFAULT 0,
    top_review_tags     TEXT[] NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_partners_sido ON partners (sido_code);
CREATE INDEX idx_partners_certs ON partners USING GIN (certs);
CREATE INDEX idx_partners_usages ON partners USING GIN (usages);
CREATE INDEX idx_partners_rating ON partners (rating DESC);
CREATE INDEX idx_partners_founded ON partners (founded_year);

-- ─── portfolios (포트폴리오) ───
CREATE TABLE portfolios (
    id                          BIGSERIAL PRIMARY KEY,
    partner_id                  BIGINT NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    title                       VARCHAR(200) NOT NULL,
    intro                       TEXT,
    hero_image_url              TEXT,
    thumbnail_url               TEXT,
    usage_code                  VARCHAR(20) NOT NULL,
    location                    VARCHAR(100) NOT NULL,
    completion_year             SMALLINT NOT NULL,
    land_area                   FLOAT8,
    building_area               FLOAT8,
    total_floor_area            FLOAT8,
    floors_above                SMALLINT,
    floors_below                SMALLINT,
    constructor_name            VARCHAR(100),
    construction_period_months  SMALLINT,
    design_period_months        SMALLINT,
    display_order               SMALLINT NOT NULL DEFAULT 0,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_portfolios_partner ON portfolios (partner_id);

-- ─── portfolio_images (포트폴리오 갤러리) ───
CREATE TABLE portfolio_images (
    id              BIGSERIAL PRIMARY KEY,
    portfolio_id    BIGINT NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    image_url       TEXT NOT NULL,
    caption         VARCHAR(200),
    display_order   SMALLINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_portfolio_images_portfolio ON portfolio_images (portfolio_id);

-- ─── qualifications (자격·인증) ───
CREATE TABLE qualifications (
    id              BIGSERIAL PRIMARY KEY,
    partner_id      BIGINT NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    cert_code       VARCHAR(20) NOT NULL,
    label           VARCHAR(100) NOT NULL,
    description     VARCHAR(200),
    file_id         UUID REFERENCES files(id),
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',
    reject_reason   TEXT,
    requested_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at     TIMESTAMPTZ,
    reviewed_by     UUID REFERENCES users(id)
);

CREATE INDEX idx_qualifications_partner ON qualifications (partner_id);
CREATE INDEX idx_qualifications_status ON qualifications (status);

-- ─── review_tags (리뷰 평가항목 마스터) ───
CREATE TABLE review_tags (
    id              BIGSERIAL PRIMARY KEY,
    label           VARCHAR(50) NOT NULL,
    display_order   SMALLINT NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

-- ─── reviews (리뷰) ───
CREATE TABLE reviews (
    id              BIGSERIAL PRIMARY KEY,
    partner_id      BIGINT NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    portfolio_id    BIGINT REFERENCES portfolios(id) ON DELETE SET NULL,
    user_id         UUID NOT NULL REFERENCES users(id),
    rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    text            TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_partner ON reviews (partner_id);
CREATE INDEX idx_reviews_user ON reviews (user_id);

-- ─── review_tag_selections (리뷰-태그 매핑) ───
CREATE TABLE review_tag_selections (
    id              BIGSERIAL PRIMARY KEY,
    review_id       BIGINT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    review_tag_id   BIGINT NOT NULL REFERENCES review_tags(id),
    UNIQUE(review_id, review_tag_id)
);

-- ─── favorites (찜하기) ───
CREATE TABLE favorites (
    id              BIGSERIAL PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    partner_id      BIGINT NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, partner_id)
);

CREATE INDEX idx_favorites_user ON favorites (user_id);
CREATE INDEX idx_favorites_partner ON favorites (partner_id);

-- ─── brand_story_images (브랜드 스토리 첨부 이미지) ───
CREATE TABLE brand_story_images (
    id              BIGSERIAL PRIMARY KEY,
    partner_id      BIGINT NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    image_url       TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 시드 데이터
-- ============================================================

-- 공통 코드: SIDO
INSERT INTO common_codes (group_code, code, label, sort_order) VALUES
('SIDO', '11', '서울특별시', 1),
('SIDO', '26', '부산광역시', 2),
('SIDO', '27', '대구광역시', 3),
('SIDO', '28', '인천광역시', 4),
('SIDO', '29', '광주광역시', 5),
('SIDO', '30', '대전광역시', 6),
('SIDO', '31', '울산광역시', 7),
('SIDO', '36', '세종특별자치시', 8),
('SIDO', '41', '경기도', 9),
('SIDO', '42', '강원특별자치도', 10),
('SIDO', '43', '충청북도', 11),
('SIDO', '44', '충청남도', 12),
('SIDO', '45', '전북특별자치도', 13),
('SIDO', '46', '전라남도', 14),
('SIDO', '47', '경상북도', 15),
('SIDO', '48', '경상남도', 16),
('SIDO', '50', '제주특별자치도', 17);

-- 공통 코드: CERT
INSERT INTO common_codes (group_code, code, label, sort_order) VALUES
('CERT', 'design', '설계', 1),
('CERT', 'construction', '시공', 2),
('CERT', 'supervision', '감리', 3);

-- 공통 코드: USAGE
INSERT INTO common_codes (group_code, code, label, sort_order) VALUES
('USAGE', 'detached_house', '단독주택', 1),
('USAGE', 'multi_family', '다세대주택', 2),
('USAGE', 'neighborhood', '근린생활', 3),
('USAGE', 'officetel', '오피스텔', 4),
('USAGE', 'commercial', '상가', 5),
('USAGE', 'factory', '공장', 6);

-- 공통 코드: QUAL_STATUS
INSERT INTO common_codes (group_code, code, label, sort_order) VALUES
('QUAL_STATUS', 'pending', '심사 중', 1),
('QUAL_STATUS', 'approved', '승인', 2),
('QUAL_STATUS', 'rejected', '반려', 3);

-- 공통 코드: REGION_GROUP
INSERT INTO common_codes (group_code, code, label, sort_order, metadata) VALUES
('REGION_GROUP', 'capital', '수도권', 1, '{"sidoCodes": ["11","28","41"]}'),
('REGION_GROUP', 'chungcheong', '대전·충청', 2, '{"sidoCodes": ["30","36","43","44"]}'),
('REGION_GROUP', 'gyeongbuk', '대구·경북', 3, '{"sidoCodes": ["27","47"]}'),
('REGION_GROUP', 'gyeongnam', '부산·울산·경남', 4, '{"sidoCodes": ["26","31","48"]}'),
('REGION_GROUP', 'jeolla', '광주·전라', 5, '{"sidoCodes": ["29","45","46"]}'),
('REGION_GROUP', 'gangwon', '강원', 6, '{"sidoCodes": ["42"]}'),
('REGION_GROUP', 'jeju', '제주', 7, '{"sidoCodes": ["50"]}');

-- 리뷰 태그 시드
INSERT INTO review_tags (label, display_order) VALUES
('전문적이에요', 1),
('소통이 좋아요', 2),
('꼼꼼해요', 3),
('일정을 잘 지켜요', 4),
('가격이 합리적이에요', 5);

-- ============================================================
-- 샘플 파트너 30개
-- ============================================================
INSERT INTO partners (name, sido_code, sigungu_code, address, profile_image_url, cover_image_url, certs, usages, founded_year, ceo_name, employee_count, phone, website_url, intro, rating, review_count, portfolio_count, top_review_tags) VALUES
-- 서울 (10)
('아크 건축사사무소',   '11','11680','서울특별시 강남구 논현로 123',        'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face','https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop','{design,supervision}',    '{detached_house,multi_family}',          2014,'김건축', 15,'02-1234-5678','https://arc-arch.kr',          '자연과 건축의 경계를 허무는 설계를 추구합니다',4.8,32,6,'{전문적이에요,소통이 좋아요,꼼꼼해요}'),
('리움 디자인 건축',    '11','11650','서울특별시 서초구 강남대로 501',      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face','https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=400&fit=crop','{design,construction}',   '{detached_house,neighborhood,commercial}',2010,'이리움', 22,'02-2345-6789','https://lium-arch.kr',         '도시 속 자연을 담는 건축, 리움이 함께합니다',4.6,28,5,'{소통이 좋아요,일정을 잘 지켜요,가격이 합리적이에요}'),
('소담 건축사사무소',   '11','11200','서울특별시 성동구 왕십리로 321',      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=400&fit=crop','{design}',                '{detached_house,neighborhood}',          2018,'최소담',  8,'02-3456-7890','https://sodam-arch.kr',        '작지만 섬세한, 일상을 바꾸는 건축',4.9,18,4,'{전문적이에요,꼼꼼해요,소통이 좋아요}'),
('청담 건축사사무소',   '11','11680','서울특별시 강남구 청담동 45-7',       'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=face','https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=400&fit=crop','{design,supervision}',    '{commercial,officetel,neighborhood}',    2008,'강청담', 18,'02-6789-0123','https://cheongdam-arch.kr',    '상업 공간 설계의 새로운 기준',4.4,38,5,'{전문적이에요,소통이 좋아요}'),
('도시공간 건축',       '11','11440','서울특별시 마포구 양화로 180',        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face','https://images.unsplash.com/photo-1448630360428-65456885c650?w=800&h=400&fit=crop','{design,construction,supervision}','{detached_house,neighborhood,factory}',2009,'한도시', 25,'02-4567-8901','https://urbanspace.kr',        '복합 도시 공간을 설계하는 건축사사무소',4.7,41,6,'{전문적이에요,꼼꼼해요,일정을 잘 지켜요}'),
('온건축 스튜디오',     '11','11350','서울특별시 노원구 동일로 1234',       'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face','https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=400&fit=crop','{design}',                '{detached_house,multi_family}',          2020,'배온',    5,'02-5678-9012',NULL,                           '따뜻한 집을 짓는 작은 스튜디오',4.6,12,3,'{소통이 좋아요,가격이 합리적이에요}'),
('서울감리 엔지니어링', '11','11530','서울특별시 구로구 디지털로 300',      'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=200&h=200&fit=crop&crop=face','https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=400&fit=crop','{supervision}',           '{multi_family,officetel,commercial}',    2003,'김감리', 20,'02-7890-1234','https://seoulengr.kr',         '안전한 시공의 파수꾼, 20년 감리 전문',4.2,35,2,'{전문적이에요,일정을 잘 지켜요}'),
('집짓는 사람들',       '11','11710','서울특별시 송파구 올림픽로 240',      'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&h=200&fit=crop&crop=face','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=400&fit=crop','{design,construction}',   '{detached_house}',                      2017,'정집짓', 10,'02-8901-2345','https://zippeople.kr',         '건축주와 함께 꿈꾸는 집을 짓습니다',4.8,20,4,'{꼼꼼해요,소통이 좋아요,가격이 합리적이에요}'),
('플레인 아키텍츠',     '11','11590','서울특별시 동작구 사당로 56',         'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&h=200&fit=crop&crop=face','https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=400&fit=crop','{design}',                '{neighborhood,commercial}',              2019,'임플레인',7,'02-9012-3456','https://plain-arch.kr',        '군더더기 없는 깨끗한 설계',4.5,14,3,'{전문적이에요,꼼꼼해요}'),
('블루프린트 건축',     '11','11140','서울특별시 중구 을지로 200',          'https://images.unsplash.com/photo-1542190891-2093d38760f2?w=200&h=200&fit=crop&crop=face','https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&h=400&fit=crop','{design,supervision}',    '{officetel,commercial,neighborhood}',    2006,'조블루', 28,'02-3210-9876','https://blueprint-arch.kr',    '대형 상업 건축 설계·감리 전문',4.3,45,7,'{전문적이에요,일정을 잘 지켜요,꼼꼼해요}'),
-- 경기 (6)
('한빛 종합건설',       '41','41135','경기도 성남시 분당구 판교로 789',     'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&h=200&fit=crop&crop=face','https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=400&fit=crop','{construction}',          '{detached_house,multi_family,officetel}',2005,'박한빛', 45,'031-345-6789','https://hanbuild.kr',          '20년 경험의 종합 시공 전문 기업',4.5,55,5,'{일정을 잘 지켜요,꼼꼼해요,전문적이에요}'),
('모던하우스 건축',     '41','41117','경기도 수원시 팔달구 효원로 100',     'https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?w=200&h=200&fit=crop&crop=face','https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=400&fit=crop','{design,construction}',   '{detached_house}',                      2016,'윤모던', 12,'031-567-8901',NULL,                           '모던 단독주택 전문 설계·시공',4.7,24,4,'{소통이 좋아요,가격이 합리적이에요,꼼꼼해요}'),
('예담 건축사사무소',   '41','41131','경기도 성남시 수정구 수정로 250',     'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&h=200&fit=crop&crop=face','https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=400&fit=crop','{design}',                '{detached_house,multi_family}',          2015,'나예담', 11,'031-678-9012','https://yedam-arch.kr',        '정직한 설계, 합리적인 건축',4.6,22,4,'{가격이 합리적이에요,소통이 좋아요}'),
('판교 건설',           '41','41135','경기도 성남시 분당구 대왕판교로 660', 'https://images.unsplash.com/photo-1559526324-593bc073d938?w=200&h=200&fit=crop&crop=face','https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=400&fit=crop','{construction,supervision}','{multi_family,officetel}',              2002,'서판교', 60,'031-789-0123','https://pangyo-const.kr',      '판교·분당 지역 다세대·오피스텔 시공 1위',4.4,48,6,'{일정을 잘 지켜요,전문적이에요}'),
('용인 전원 건축',      '41','41463','경기도 용인시 처인구 명지로 88',      'https://images.unsplash.com/photo-1600878459138-e1123b37cb30?w=200&h=200&fit=crop&crop=face','https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800&h=400&fit=crop','{design,construction}',   '{detached_house}',                      2013,'류전원',  9,'031-890-1234',NULL,                           '전원주택의 꿈을 현실로, 자연과 함께 사는 집',4.8,16,3,'{꼼꼼해요,소통이 좋아요,가격이 합리적이에요}'),
('동탄 CM건축',         '41','41590','경기도 화성시 동탄대로 450',          'https://images.unsplash.com/photo-1580518337843-f959e72f4265?w=200&h=200&fit=crop&crop=face','https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800&h=400&fit=crop','{design,construction,supervision}','{multi_family,neighborhood,commercial}',2011,'강동탄',35,'031-901-2345','https://dongtan-cm.kr',   '동탄 신도시 개발과 함께 성장한 종합 건축 기업',4.3,33,5,'{전문적이에요,일정을 잘 지켜요}'),
-- 인천 (2)
('송도 건축 디자인',    '28','28710','인천광역시 연수구 송도과학로 32',     'https://images.unsplash.com/photo-1562788869-4ed32648eb72?w=200&h=200&fit=crop&crop=face','https://images.unsplash.com/photo-1464938050520-ef2571e0d6d7?w=800&h=400&fit=crop','{design}',                '{officetel,commercial}',                2014,'천송도', 14,'032-123-4567','https://songdo-design.kr',     '국제도시 송도의 모던 건축을 선도합니다',4.5,19,3,'{전문적이에요,소통이 좋아요}'),
('인천 드림건설',       '28','28245','인천광역시 남동구 남동대로 800',      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&h=200&fit=crop&crop=face','https://images.unsplash.com/photo-1590644365607-1c5a937e5549?w=800&h=400&fit=crop','{construction}',          '{multi_family,factory}',                2007,'안드림', 38,'032-234-5678','https://icdream.kr',           '산업시설부터 공동주택까지, 인천 대표 시공사',4.1,30,4,'{일정을 잘 지켜요,가격이 합리적이에요}'),
-- 부산 (3)
('대한감리 엔지니어링', '26','26110','부산광역시 중구 중앙대로 555',        'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=200&h=200&fit=crop&crop=face','https://images.unsplash.com/photo-1590274853856-f22d5ee3d228?w=800&h=400&fit=crop','{supervision}',           '{multi_family,officetel,commercial}',    2000,'정감리', 30,'051-456-7890','https://dhengr.kr',            '안전하고 정확한 감리, 25년의 신뢰',4.3,42,2,'{전문적이에요,일정을 잘 지켜요}'),
('해운대 건축사사무소', '26','26350','부산광역시 해운대구 해운대로 570',    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face','https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=400&fit=crop','{design}',                '{detached_house,commercial}',            2011,'최해운', 13,'051-567-8901','https://haeundae-arch.kr',     '바다와 도시 사이, 해운대 라이프스타일 건축',4.7,21,4,'{소통이 좋아요,전문적이에요,꼼꼼해요}'),
('부산 스카이건설',     '26','26470','부산광역시 강서구 낙동북로 30',       'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face','https://images.unsplash.com/photo-1504615755583-2916b52192a3?w=800&h=400&fit=crop','{construction,supervision}','{multi_family,officetel}',              2004,'박스카이',50,'051-678-9012','https://bssky.kr',            '부산·경남 최다 시공 실적 보유',4.2,37,5,'{일정을 잘 지켜요,전문적이에요}'),
-- 대구 (2)
('대구 어반 건축',      '27','27200','대구광역시 중구 동성로 100',          'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=face','https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800&h=400&fit=crop','{design,construction}',   '{neighborhood,commercial}',              2013,'권어반', 16,'053-123-4567','https://dgurban.kr',           '대구 도심 리노베이션·상가 건축 전문',4.5,26,4,'{소통이 좋아요,가격이 합리적이에요,꼼꼼해요}'),
('경북 스틸하우스',     '47','47130','경상북도 구미시 공단로 200',          'https://images.unsplash.com/photo-1600878459138-e1123b37cb30?w=200&h=200&fit=crop&crop=face','https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=400&fit=crop','{construction}',          '{factory,detached_house}',               2009,'손스틸', 28,'054-234-5678','https://gbsteel.kr',           '철골·스틸하우스 시공 전문 기업',4.0,18,3,'{가격이 합리적이에요,일정을 잘 지켜요}'),
-- 대전·충청 (2)
('세종 하우스 건축',    '36','36110','세종특별자치시 나성로 200',           'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face','https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800&h=400&fit=crop','{design,construction}',   '{detached_house,multi_family}',          2017,'이세종', 11,'044-345-6789','https://sejonghouse.kr',       '행정수도 세종의 주거 건축 전문가',4.6,15,3,'{꼼꼼해요,소통이 좋아요}'),
('충남 감리원',         '44','44131','충청남도 천안시 동남구 만남로 50',    'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&h=200&fit=crop&crop=face','https://images.unsplash.com/photo-1590274853856-f22d5ee3d228?w=800&h=400&fit=crop','{supervision}',           '{multi_family,factory}',                2006,'김충남', 22,'041-456-7890','https://cnengr.kr',            '충남 지역 공공 감리 수주 1위',4.1,28,2,'{전문적이에요,일정을 잘 지켜요}'),
-- 광주·전라 (2)
('광주 빛고을 건축',    '29','29110','광주광역시 동구 금남로 170',          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=400&fit=crop','{design}',                '{detached_house,neighborhood}',          2015,'오빛',   10,'062-567-8901','https://gwangju-arch.kr',      '남도의 정서를 담아내는 따뜻한 건축',4.7,17,3,'{소통이 좋아요,꼼꼼해요,전문적이에요}'),
('전주 한옥 건축',      '45','45113','전북특별자치도 전주시 완산구 한옥마을길 20','https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&h=200&fit=crop&crop=face','https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=400&fit=crop','{design,construction}','{detached_house}',                    2010,'박한옥',  8,'063-678-9012','https://jjhanok.kr',           '한옥의 전통미와 현대적 편의를 결합합니다',4.9,13,3,'{꼼꼼해요,전문적이에요,소통이 좋아요}'),
-- 강원 (1)
('강릉 바다집 건축',    '42','42150','강원특별자치도 강릉시 경포로 500',    'https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?w=200&h=200&fit=crop&crop=face','https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800&h=400&fit=crop','{design,construction}',   '{detached_house,neighborhood}',          2016,'고바다',  7,'033-789-0123','https://seaview-arch.kr',      '동해 바다를 품은 세컨드하우스·펜션 전문',4.8,11,3,'{꼼꼼해요,소통이 좋아요,가격이 합리적이에요}'),
-- 제주 (2)
('제주돌집 건축',       '50','50110','제주특별자치도 제주시 연동 712',      'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=200&h=200&fit=crop&crop=face','https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=400&fit=crop','{design,construction}',   '{detached_house,neighborhood}',          2012,'오제주', 10,'064-123-4567','https://jejustone.kr',         '제주의 바람과 돌을 품은 건축',4.8,15,3,'{꼼꼼해요,전문적이에요,소통이 좋아요}'),
('서귀포 자연건축',     '50','50130','제주특별자치도 서귀포시 일주서로 300','https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&h=200&fit=crop&crop=face','https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=400&fit=crop','{design}',                '{detached_house}',                      2019,'양자연',  6,'064-234-5678',NULL,                           '서귀포 자연 속 소규모 주택 설계 전문',4.7, 9,2,'{소통이 좋아요,꼼꼼해요}');

-- ============================================================
-- 포트폴리오 (파트너별 2~7건, 총 ~120건)
-- ============================================================
INSERT INTO portfolios (partner_id, title, intro, hero_image_url, thumbnail_url, usage_code, location, completion_year, land_area, building_area, total_floor_area, floors_above, floors_below, constructor_name, construction_period_months, design_period_months, display_order) VALUES
-- 파트너 1: 아크 건축사사무소
(1, '판교 단독주택 ''숲의 집''',      '자연과 건축의 경계를 허물다. 내부와 외부가 하나로 이어지는 공간을 구현했습니다.','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop','detached_house','경기도 성남시 분당구',2024,330.50,165.20,264.80,2,1,'한빛종합건설',14,6,1),
(1, '성수동 복합문화공간',            '오래된 공장을 리노베이션하여 카페·갤러리·공유오피스가 공존하는 공간으로 탈바꿈.','https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop','neighborhood','서울특별시 성동구',2023,520.00,312.00,1248.00,4,1,'성수건설',18,8,2),
(1, '제주 세컨드하우스',              '제주 바다가 보이는 언덕 위, 현무암과 노출콘크리트의 조화.',                     'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop','detached_house','제주특별자치도 서귀포시',2023,450.00,180.00,220.50,2,0,'제주돌집건설',12,5,3),
(1, '용산 다세대주택 리모델링',       '노후 다세대 건물의 구조 보강과 외관 리뉴얼. 에너지 효율 35% 개선.',            'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop','multi_family','서울특별시 용산구',2022,280.00,196.00,784.00,4,0,'서울리빌드',10,4,4),
(1, '강남 사옥 인테리어',             '테크 스타트업 사옥 인테리어. 오픈플랜 오피스와 라운지 공간 설계.',              'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&h=300&fit=crop','commercial','서울특별시 강남구',2022,NULL,NULL,660.00,3,0,NULL,6,3,5),
(1, '분당 전원주택 ''하늘마루''',     '전원생활을 위한 2층 목조주택. 넓은 마당과 텃밭 공간 포함.',                     'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop','detached_house','경기도 성남시 분당구',2021,495.00,198.00,330.00,2,0,'한빛종합건설',12,5,6),
-- 파트너 2: 리움 디자인 건축
(2, '서초 타운하우스 ''레이크뷰''',   '호수 공원 조망을 극대화한 3세대 타운하우스 단지.',                              'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&h=300&fit=crop','detached_house','서울특별시 서초구',2024,660.00,330.00,792.00,3,1,'대림건설',16,7,1),
(2, '합정동 카페 겸 주택',            '1층 카페, 2~3층 주거. 노출 콘크리트와 브릭의 복합 파사드.',                     'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=300&fit=crop','neighborhood','서울특별시 마포구',2023,180.00,126.00,342.00,3,0,'마포건설',10,4,2),
(2, '양재 근생 빌딩 신축',            '상업+주거 복합. 1~2층 상가, 3~5층 주거 공간.',                                 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop','commercial','서울특별시 서초구',2023,420.00,294.00,1260.00,5,1,'서초건설',14,6,3),
(2, '파주 전원주택',                  '파주 헤이리 인근, 예술가 부부를 위한 아틀리에 겸 주거.',                        'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=400&h=300&fit=crop','detached_house','경기도 파주시',2022,550.00,165.00,264.00,2,0,'파주건설',11,5,4),
(2, '신사동 상가 리모델링',           '가로수길 상가 건물 리모델링. 외관 변경과 공용부 리뉴얼.',                       'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400&h=300&fit=crop','commercial','서울특별시 강남구',2021,NULL,NULL,480.00,4,1,NULL,8,3,5),
-- 파트너 3: 소담 건축사사무소
(3, '성수 소형 주택 ''마당있는 집''', '11평 대지에 4인 가족을 위한 3층 주택. 중정을 통한 채광 해결.',                 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop','detached_house','서울특별시 성동구',2025,36.30,25.41,76.23,3,0,'성동건설',8,4,1),
(3, '왕십리 근생건물 신축',           '역세권 소형 근린생활시설. 임대 수익 극대화 설계.',                              'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1460317442991-0ec209397118?w=400&h=300&fit=crop','neighborhood','서울특별시 성동구',2024,165.00,115.50,396.00,4,0,'성동건설',10,4,2),
(3, '양평 주말주택',                  '양평 강변에 위치한 소규모 주말주택. 자연 소재 중심 설계.',                       'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=400&h=300&fit=crop','detached_house','경기도 양평군',2023,330.00,99.00,148.50,2,0,'양평목조건설',7,3,3),
(3, '성동구 다가구 신축',             '임대 수익형 다가구 주택. 6세대 원룸+1세대 투룸.',                               'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop','multi_family','서울특별시 성동구',2022,198.00,138.60,554.40,4,1,'성동건설',12,5,4),
-- 파트너 4: 청담 건축사사무소
(4, '청담동 플래그십 스토어',          '럭셔리 브랜드 플래그십 스토어. 유리 커튼월과 대리석 마감.',                     'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop','commercial','서울특별시 강남구',2024,250.00,200.00,800.00,4,1,'강남건설',12,6,1),
(4, '논현 오피스텔 신축',             '역세권 소형 오피스텔 120세대. 1인 가구 맞춤 설계.',                             'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&h=300&fit=crop','officetel','서울특별시 강남구',2023,1200.00,720.00,7200.00,12,2,'대우건설',24,10,2),
(4, '압구정 복합상가',                '지하 주차장+1~3층 상가+4~6층 오피스. 입지 분석 기반 MD 구성.',                  'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1555636222-cae831e670b3?w=400&h=300&fit=crop','neighborhood','서울특별시 강남구',2023,450.00,315.00,1890.00,6,2,'강남건설',18,8,3),
(4, '삼성동 사무실 인테리어',         'IT기업 사옥 인테리어. 협업 공간과 집중 부스 공존.',                             'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop','commercial','서울특별시 강남구',2022,NULL,NULL,990.00,3,0,NULL,5,2,4),
(4, '도곡동 근생 리모델링',           '20년 된 근생 빌딩 리모델링. 에너지 성능 개선 + 외관 변경.',                     'https://images.unsplash.com/photo-1448630360428-65456885c650?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1448630360428-65456885c650?w=400&h=300&fit=crop','neighborhood','서울특별시 강남구',2021,330.00,231.00,924.00,4,1,'강남건설',8,3,5),
-- 파트너 5: 도시공간 건축
(5, '마포 복합문화시설',               '지역 주민을 위한 도서관+체육관+카페가 결합된 공공 문화시설.',                   'https://images.unsplash.com/photo-1481277542470-605612bd2d61?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1481277542470-605612bd2d61?w=400&h=300&fit=crop','neighborhood','서울특별시 마포구',2024,2200.00,1320.00,5280.00,4,1,'한양건설',20,12,1),
(5, '홍대 상가주택',                   '1층 갤러리 카페, 2~4층 원룸형 주거. 임대 수익+거주 겸용.',                     'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=300&fit=crop','neighborhood','서울특별시 마포구',2023,198.00,138.60,554.40,4,0,'마포건설',10,4,2),
(5, '파주 출판단지 사옥',              '출판사 사옥. 1층 북카페, 2~3층 사무실, 옥상 정원.',                            'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&h=300&fit=crop','commercial','경기도 파주시',2022,660.00,396.00,1188.00,3,0,'파주건설',14,6,3),
(5, '서교동 다가구 리모델링',          '3층 다가구 외관 리뉴얼+내부 구조 변경. 2세대→4세대.',                          'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=400&h=300&fit=crop','multi_family','서울특별시 마포구',2022,165.00,115.50,346.50,3,0,'마포건설',8,3,4),
(5, '인천 물류센터',                   '냉동·냉장 물류센터 설계. 온도 구역별 최적 동선 계획.',                         'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop','factory','인천광역시 서구',2021,3300.00,2640.00,5280.00,2,0,'인천건설',16,8,5),
(5, '은평 단독주택',                   '한옥 감성을 현대적으로 재해석한 2층 단독주택.',                                 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop','detached_house','서울특별시 은평구',2020,264.00,132.00,211.20,2,0,'은평건설',10,5,6),
-- 파트너 6: 온건축 스튜디오
(6, '노원 협소주택',                   '16평 대지에 3층 협소주택. 스킵플로어로 공간감 극대화.',                         'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400&h=300&fit=crop','detached_house','서울특별시 노원구',2025,52.80,36.96,92.40,3,0,'노원건설',7,3,1),
(6, '남양주 전원주택',                 '남양주 강변 타운하우스 설계. 자연과 도시의 균형.',                              'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&h=300&fit=crop','detached_house','경기도 남양주시',2024,396.00,158.40,253.44,2,0,'남양주건설',10,4,2),
(6, '중랑구 다세대 신축',             '역세권 다세대 8세대. 원룸·투룸 혼합 배치.',                                     'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop','multi_family','서울특별시 중랑구',2023,198.00,138.60,554.40,4,1,'동부건설',12,5,3),
-- 파트너 7: 서울감리 엔지니어링
(7, '강서 오피스텔 감리',             '200세대 오피스텔 공사 감리. 품질 관리 및 공정 검토.',                            'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop','officetel','서울특별시 강서구',2024,NULL,NULL,NULL,15,2,NULL,24,NULL,1),
(7, '구로 지식산업센터 감리',         '지식산업센터 신축 감리. 스마트 빌딩 시스템 검수.',                               'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop','commercial','서울특별시 구로구',2023,NULL,NULL,NULL,10,3,NULL,18,NULL,2),
-- 파트너 8: 집짓는 사람들
(8, '송파 단독주택 ''숲속 아이''',    '두 아이의 놀이터가 되는 마당 중심 설계. 자연놀이 공간 포함.',                   'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=400&h=300&fit=crop','detached_house','서울특별시 송파구',2025,330.00,165.00,264.00,2,0,'송파건설',12,5,1),
(8, '잠실 단독주택 리모델링',         '30년 된 단독주택 전면 리모델링. 내진 보강+에너지 성능 개선.',                   'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop','detached_house','서울특별시 송파구',2024,264.00,158.40,253.44,2,0,'송파건설',8,3,2),
(8, '하남 전원주택',                   '미사 강변 전원주택. 루프탑 가든과 원목 데크.',                                 'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=400&h=300&fit=crop','detached_house','경기도 하남시',2023,495.00,198.00,316.80,2,0,'하남건설',11,5,3),
(8, '위례 타운하우스',                 '위례 신도시 3세대 타운하우스. 공용 마당+개별 테라스.',                          'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&h=300&fit=crop','detached_house','서울특별시 송파구',2022,594.00,297.00,594.00,2,0,'한빛종합건설',14,6,4),
-- 파트너 9: 플레인 아키텍츠
(9, '사당동 근생건물',                 '역세권 소형 근생. 1층 편의점+2~4층 원룸.',                                     'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1460317442991-0ec209397118?w=400&h=300&fit=crop','neighborhood','서울특별시 동작구',2024,132.00,92.40,369.60,4,0,'동작건설',9,4,1),
(9, '흑석동 상가주택',                 '대학가 상가주택. 1층 카페, 2~3층 원룸 4세대.',                                 'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1555636222-cae831e670b3?w=400&h=300&fit=crop','commercial','서울특별시 동작구',2023,165.00,115.50,346.50,3,0,'동작건설',8,3,2),
(9, '방배동 사무실 인테리어',          '디자인 에이전시 사무실. 화이트+우드 톤 미니멀 인테리어.',                       'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop','commercial','서울특별시 서초구',2023,NULL,NULL,198.00,1,0,NULL,3,2,3),
-- 파트너 10: 블루프린트 건축
(10,'종로 오피스 빌딩',                '종로 업무지구 오피스 빌딩 설계·감리. 친환경 인증(녹색건축) 취득.',             'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&h=300&fit=crop','officetel','서울특별시 종로구',2024,1650.00,990.00,11880.00,12,3,'현대건설',30,14,1),
(10,'을지로 복합상가',                 '을지로 재개발 구역 복합상가. 전통시장 분위기 살린 설계.',                      'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400&h=300&fit=crop','commercial','서울특별시 중구',2023,880.00,616.00,3696.00,6,2,'을지건설',20,10,2),
(10,'마곡 지식산업센터',               '마곡 R&D 단지 내 지식산업센터. 업무+상업+주거 복합.',                          'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop','commercial','서울특별시 강서구',2022,2200.00,1320.00,13200.00,10,2,'마곡건설',24,12,3),
(10,'여의도 사옥 리모델링',            '30년 된 오피스 빌딩 외관 리노베이션+스마트 빌딩 전환.',                        'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop','officetel','서울특별시 영등포구',2022,NULL,NULL,8800.00,15,3,NULL,18,6,4),
(10,'중구 호텔 인테리어',              '을지로 부티크 호텔 인테리어 설계. 72실 객실+레스토랑+루프탑 바.',             'https://images.unsplash.com/photo-1590490360182-c33d955571c1?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1590490360182-c33d955571c1?w=400&h=300&fit=crop','commercial','서울특별시 중구',2021,NULL,NULL,4400.00,8,1,NULL,14,8,5),
(10,'광화문 업무시설 감리',            '대형 업무시설 리모델링 감리. 구조 안전 진단+공사 품질 관리.',                  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop','commercial','서울특별시 종로구',2020,NULL,NULL,NULL,12,3,NULL,24,NULL,6),
(10,'성수 소규모 오피스',              '성수 IT 밸리 내 소규모 오피스 빌딩. 테라스형 사무 공간.',                      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&h=300&fit=crop','officetel','서울특별시 성동구',2019,330.00,231.00,1617.00,7,1,'성수건설',16,8,7),
-- 파트너 11: 한빛 종합건설
(11,'판교 다세대 신축 A단지',          '판교 역세권 다세대 주택 24세대. 주차장 100% 확보.',                            'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop','multi_family','경기도 성남시 분당구',2024,990.00,594.00,2376.00,4,1,NULL,16,NULL,1),
(11,'분당 오피스텔 신축',              '야탑역 인근 120세대 오피스텔. 1.5룸 중심 설계.',                               'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&h=300&fit=crop','officetel','경기도 성남시 분당구',2023,1320.00,792.00,7920.00,10,2,NULL,20,NULL,2),
(11,'수원 단독주택 단지',              '전원주택 단지 12세대 시공. 독일식 패시브하우스 적용.',                          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop','detached_house','경기도 수원시',2022,3960.00,1584.00,2534.40,2,0,NULL,18,NULL,3),
(11,'성남 리모델링 공사',              '20년 된 아파트 동별 리모델링 시공. 외단열+창호 교체.',                          'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop','multi_family','경기도 성남시 수정구',2021,NULL,NULL,NULL,NULL,NULL,NULL,12,NULL,4),
(11,'판교 상가 인테리어',              '판교 테크노밸리 1층 상가 인테리어 시공. 5개 점포.',                             'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop','commercial','경기도 성남시 분당구',2021,NULL,NULL,330.00,1,0,NULL,4,NULL,5),
-- 파트너 12: 모던하우스 건축
(12,'수원 모던 단독주택 A',            '화이트 박스 스타일 2층 단독주택. 중정 있는 ㅁ자 배치.',                        'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&h=300&fit=crop','detached_house','경기도 수원시',2025,330.00,165.00,264.00,2,0,NULL,11,5,1),
(12,'광교 전원주택',                   '광교 호수공원 조망 단독주택. 통유리 거실+루프탑.',                              'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop','detached_house','경기도 수원시',2024,396.00,198.00,316.80,2,0,NULL,12,5,2),
(12,'동탄 전원주택',                   '동탄 외곽 전원지역. 목구조+스틸 복합 구조.',                                   'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=400&h=300&fit=crop','detached_house','경기도 화성시',2023,462.00,184.80,295.68,2,0,NULL,10,4,3),
(12,'용인 단독주택 리모델링',          '20년 된 단독주택 리모델링. 증축+외관 변경+내부 전면 수리.',                    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop','detached_house','경기도 용인시',2022,330.00,198.00,297.00,2,0,NULL,8,3,4),
-- 파트너 13~30: 각 2~4건씩
(13,'성남 다가구 신축',                '수정구 역세권 다가구 10세대. 주차 편의 극대화.',                               'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop','multi_family','경기도 성남시 수정구',2024,264.00,184.80,739.20,4,1,'성남건설',14,6,1),
(13,'분당 전원주택',                   '분당 자연 속 2층 전원주택. 지열난방 시스템 적용.',                              'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop','detached_house','경기도 성남시 분당구',2023,462.00,184.80,295.68,2,0,'분당건설',11,5,2),
(13,'판교 근생 신축',                  '판교역 도보 5분 소형 근생. 1층 카페+2~3층 사무실.',                            'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1460317442991-0ec209397118?w=400&h=300&fit=crop','neighborhood','경기도 성남시 분당구',2022,165.00,115.50,346.50,3,0,'성남건설',9,4,3),
(13,'성남 단독주택',                   '중원구 한적한 주택가에 위치한 단독주택. 정원 중심 배치.',                       'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop','detached_house','경기도 성남시 중원구',2021,330.00,132.00,211.20,2,0,'성남건설',10,4,4),
(14,'분당 다세대 40세대',              '서현역 인근 대규모 다세대. 고급 마감재 적용.',                                  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop','multi_family','경기도 성남시 분당구',2024,1320.00,792.00,3168.00,4,1,NULL,18,NULL,1),
(14,'판교 오피스텔 200세대',           '판교역 역세권 오피스텔 200세대. 스마트홈 시스템.',                              'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop','officetel','경기도 성남시 분당구',2023,2200.00,1320.00,13200.00,10,2,NULL,24,NULL,2),
(14,'야탑 근생 시공',                  '야탑역 대로변 근생 시공. 외장재 알루미늄 커튼월.',                              'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1460317442991-0ec209397118?w=400&h=300&fit=crop','neighborhood','경기도 성남시 분당구',2022,330.00,231.00,924.00,4,1,NULL,12,NULL,3),
(14,'판교 공장 리모델링',              '판교 제2테크노밸리 공장→사무실 용도 변경 리모델링.',                           'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop','factory','경기도 성남시 분당구',2021,1650.00,1320.00,2640.00,2,0,NULL,10,NULL,4),
(14,'성남 주상복합 시공',              '모란역 인근 주상복합 시공. 1~3층 상가, 4~15층 아파트.',                         'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&h=300&fit=crop','officetel','경기도 성남시 중원구',2020,1980.00,1188.00,17820.00,15,3,NULL,30,NULL,5),
(14,'분당 근생 감리',                  '분당구 소규모 근생 건물 감리. 안전 점검 중심.',                                 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop','neighborhood','경기도 성남시 분당구',2019,NULL,NULL,NULL,NULL,NULL,NULL,8,NULL,6),
(15,'용인 전원주택 ''숲속 쉼터''',    '처인구 산자락에 위치한 전원주택. 대형 테라스와 벽난로.',                        'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=400&h=300&fit=crop','detached_house','경기도 용인시 처인구',2025,594.00,237.60,356.40,2,0,'용인건설',12,5,1),
(15,'광주 전원주택',                   '경기도 광주 남한산성 근처 전원주택. 한옥 지붕+현대 구조.',                      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop','detached_house','경기도 광주시',2024,462.00,184.80,295.68,2,0,'광주건설',10,5,2),
(15,'이천 농가주택 리모델링',          '전통 농가 리모델링. 마당과 텃밭을 살린 현대적 재해석.',                        'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=400&h=300&fit=crop','detached_house','경기도 이천시',2023,660.00,198.00,264.00,1,0,'이천건설',8,4,3),
(16,'동탄 복합상가 신축',              '동탄 2신도시 중심 상업지구 복합상가. 6개 층 다양한 업종.',                     'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop','commercial','경기도 화성시',2024,880.00,616.00,3696.00,6,2,'동탄건설',20,10,1),
(16,'화성 공장 신축',                  '화성 산업단지 내 식품 가공 공장. HACCP 기준 설계.',                             'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop','factory','경기도 화성시',2023,3300.00,2640.00,5280.00,2,0,'화성건설',16,8,2),
(16,'평택 물류센터',                   '평택항 인근 대형 물류센터. 자동화 설비 연동 설계.',                             'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop','factory','경기도 평택시',2022,5500.00,4400.00,8800.00,2,0,'평택건설',18,10,3),
(16,'오산 다세대 시공',                '오산 역세권 다세대 18세대. 1.5룸 중심 청년 주거.',                              'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop','multi_family','경기도 오산시',2021,396.00,277.20,1108.80,4,1,'오산건설',12,NULL,4),
(16,'수원 근생 리모델링',              '수원역 인근 노후 근생 리모델링. 외단열+외관 변경.',                             'https://images.unsplash.com/photo-1448630360428-65456885c650?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1448630360428-65456885c650?w=400&h=300&fit=crop','neighborhood','경기도 수원시',2020,264.00,184.80,554.40,3,0,'수원건설',6,3,5),
(17,'송도 오피스텔 설계',              '송도 국제도시 60세대 소형 오피스텔. 바다 조망 극대화.',                        'https://images.unsplash.com/photo-1464938050520-ef2571e0d6d7?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1464938050520-ef2571e0d6d7?w=400&h=300&fit=crop','officetel','인천광역시 연수구',2024,660.00,396.00,3960.00,10,1,'인천건설',18,8,1),
(17,'연수구 상가 설계',                '송도 트리플스트리트 인근 상가 설계. 보행 동선 중심.',                           'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1555636222-cae831e670b3?w=400&h=300&fit=crop','commercial','인천광역시 연수구',2023,330.00,231.00,924.00,4,1,'인천건설',12,6,2),
(17,'청라 단독주택 설계',              '청라 국제도시 단독주택 설계. 모던+내추럴 스타일.',                              'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&h=300&fit=crop','detached_house','인천광역시 서구',2022,396.00,198.00,316.80,2,0,'인천건설',10,5,3),
(18,'남동공단 공장 시공',              '남동공단 내 전자부품 공장. 클린룸 시설 포함.',                                 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop','factory','인천광역시 남동구',2024,2200.00,1760.00,3520.00,2,0,NULL,14,NULL,1),
(18,'부평 다세대 시공',                '부평역 도보 3분 다세대 20세대. 지하 주차장 완비.',                              'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop','multi_family','인천광역시 부평구',2023,660.00,396.00,1584.00,4,1,NULL,14,NULL,2),
(18,'인천 공장 증축',                  '기존 공장 옆 증축 시공. 기존 동선과 연결 통로 설계.',                           'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop','factory','인천광역시 남동구',2022,1650.00,1320.00,2640.00,2,0,NULL,10,NULL,3),
(18,'검단 근생 시공',                  '검단 신도시 근생 시공. 1층 상가+2~3층 사무실.',                                'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1460317442991-0ec209397118?w=400&h=300&fit=crop','neighborhood','인천광역시 서구',2021,264.00,184.80,554.40,3,0,NULL,8,NULL,4),
(19,'부산 중구 근생 감리',             '중앙대로 근생 신축 감리. 해안가 염해 방지 설계 검증.',                         'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop','commercial','부산광역시 중구',2024,NULL,NULL,NULL,NULL,NULL,NULL,12,NULL,1),
(19,'해운대 오피스텔 감리',            '해운대 비치 뷰 오피스텔 감리. 초고층 시공 안전 관리.',                         'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop','officetel','부산광역시 해운대구',2023,NULL,NULL,NULL,18,3,NULL,24,NULL,2),
(20,'해운대 단독주택 ''바다의 집''',   '해운대 해변 조망 3층 단독주택. 전면 통유리+옥상 수영장.',                     'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop','detached_house','부산광역시 해운대구',2024,462.00,231.00,462.00,3,0,'해운대건설',14,6,1),
(20,'광안리 카페 겸 주택',             '광안대교 뷰 카페 겸 주거. 3층 루프탑 오션뷰 테라스.',                         'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=300&fit=crop','neighborhood','부산광역시 수영구',2023,198.00,138.60,415.80,3,0,'수영건설',10,4,2),
(20,'기장 세컨드하우스',               '기장 바닷가 세컨드하우스. 현무암 외벽+노출 콘크리트.',                        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop','detached_house','부산광역시 기장군',2022,396.00,158.40,237.60,2,0,'기장건설',10,5,3),
(20,'센텀 상가 인테리어',              '센텀시티 상가 인테리어. 뷰티·F&B 5개 점포.',                                  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop','commercial','부산광역시 해운대구',2021,NULL,NULL,330.00,1,0,NULL,3,2,4),
(21,'강서구 다세대 시공',              '부산 강서구 다세대 30세대 시공. 내진 설계 적용.',                              'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop','multi_family','부산광역시 강서구',2024,990.00,594.00,2376.00,4,1,NULL,16,NULL,1),
(21,'해운대 오피스텔 시공',            '해운대 오피스텔 150세대 시공. 하이엔드 마감재.',                               'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&h=300&fit=crop','officetel','부산광역시 해운대구',2023,1650.00,990.00,9900.00,10,2,NULL,22,NULL,2),
(21,'사하구 근생 시공',                '다대포 해수욕장 인근 근생. 카페+식당+편의시설.',                               'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1460317442991-0ec209397118?w=400&h=300&fit=crop','neighborhood','부산광역시 사하구',2022,264.00,184.80,554.40,3,0,NULL,8,NULL,3),
(21,'김해 공장 시공',                  '김해 산업단지 자동차 부품 공장 시공.',                                         'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop','factory','경상남도 김해시',2021,3300.00,2640.00,5280.00,2,0,NULL,14,NULL,4),
(21,'부산진구 리모델링',               '부산진구 노후 상가 리모델링. 외관+내부 전면 리뉴얼.',                          'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400&h=300&fit=crop','commercial','부산광역시 부산진구',2020,NULL,NULL,660.00,3,0,NULL,6,NULL,5),
(22,'동성로 카페 겸 상가',             '동성로 중심가 카페 겸 상가 신축. 적벽돌 파사드.',                             'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1555636222-cae831e670b3?w=400&h=300&fit=crop','neighborhood','대구광역시 중구',2024,165.00,115.50,346.50,3,0,'대구건설',9,4,1),
(22,'수성구 근생 리모델링',            '수성못 인근 노후 근생 리모델링. 현대적 외관으로 변경.',                        'https://images.unsplash.com/photo-1448630360428-65456885c650?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1448630360428-65456885c650?w=400&h=300&fit=crop','neighborhood','대구광역시 수성구',2023,264.00,184.80,554.40,3,0,'대구건설',7,3,2),
(22,'달서구 상가 신축',                '달서구 대로변 상가 신축. 1~2층 F&B, 3층 사무실.',                             'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop','commercial','대구광역시 달서구',2022,330.00,231.00,693.00,3,0,'대구건설',10,4,3),
(22,'북구 원룸 신축',                  '경북대 인근 원룸 16세대. 학생 맞춤형 설계.',                                  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop','multi_family','대구광역시 북구',2021,264.00,184.80,739.20,4,1,'대구건설',12,5,4),
(23,'구미 전자공장',                   '구미 국가산업단지 전자부품 조립 공장. 클린룸 포함.',                           'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop','factory','경상북도 구미시',2024,4400.00,3520.00,7040.00,2,0,NULL,16,NULL,1),
(23,'김천 물류센터',                   '김천 IC 인근 물류센터. 대형 트레일러 접안 시설.',                              'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop','factory','경상북도 김천시',2023,5500.00,4400.00,8800.00,2,0,NULL,18,NULL,2),
(23,'구미 단독주택',                   '구미시 외곽 스틸하우스 단독주택. 공기 단축형 시공.',                           'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400&h=300&fit=crop','detached_house','경상북도 구미시',2022,330.00,165.00,264.00,2,0,NULL,6,3,3),
(24,'세종 단독주택 A',                 '세종시 첫마을 단독주택. 패시브하우스 기준 설계.',                              'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=400&h=300&fit=crop','detached_house','세종특별자치시',2025,396.00,198.00,316.80,2,0,'세종건설',11,5,1),
(24,'세종 다가구 신축',                '세종시 역세권 다가구 12세대. 젊은 공무원 맞춤형.',                             'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop','multi_family','세종특별자치시',2024,330.00,231.00,924.00,4,1,'세종건설',14,6,2),
(24,'세종 근생 설계',                  '세종 중심상업지구 근생. 1층 카페+2층 사무실+3층 주거.',                        'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1460317442991-0ec209397118?w=400&h=300&fit=crop','neighborhood','세종특별자치시',2023,198.00,138.60,415.80,3,0,'세종건설',9,4,3),
(25,'천안 공장 감리',                  '천안 산업단지 식품공장 감리. HACCP 시설 검증.',                                'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop','factory','충청남도 천안시',2024,NULL,NULL,NULL,NULL,NULL,NULL,12,NULL,1),
(25,'아산 다세대 감리',                '아산 배방역 인근 다세대 감리. 시공 품질 집중 관리.',                           'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop','multi_family','충청남도 아산시',2023,NULL,NULL,NULL,NULL,NULL,NULL,10,NULL,2),
(26,'광주 단독주택 ''남도 하우스''',   '광주 무등산 조망 2층 단독주택. 한국적 정서의 현대 건축.',                     'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop','detached_house','광주광역시 동구',2024,396.00,198.00,316.80,2,0,'광주건설',11,5,1),
(26,'광주 카페 신축',                  '무등산 등산로 입구 카페. 자연 속 목구조 건물.',                                'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=300&fit=crop','neighborhood','광주광역시 동구',2023,264.00,132.00,132.00,1,0,'광주건설',6,3,2),
(26,'나주 전원주택',                   '나주 혁신도시 인근 전원주택. 넓은 마당과 텃밭.',                               'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=400&h=300&fit=crop','detached_house','전라남도 나주시',2022,594.00,198.00,297.00,2,0,'나주건설',10,4,3),
(27,'전주 한옥 게스트하우스',          '한옥마을 내 전통 한옥 게스트하우스. 6실 규모.',                                'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400&h=300&fit=crop','detached_house','전북특별자치도 전주시',2024,330.00,198.00,198.00,1,0,NULL,8,6,1),
(27,'전주 카페 한옥',                  '한옥마을 입구 한옥 카페. 전통 기와+유리 지붕 결합.',                           'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=300&fit=crop','neighborhood','전북특별자치도 전주시',2023,165.00,115.50,115.50,1,0,NULL,5,4,2),
(27,'익산 단독주택',                   '익산시 교외 한옥풍 단독주택. 황토벽+온돌 시스템.',                             'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop','detached_house','전북특별자치도 익산시',2022,462.00,184.80,277.20,2,0,NULL,10,5,3),
(28,'강릉 세컨드하우스 A',            '경포대 해변 도보 5분 세컨드하우스. 통창+바다 전망.',                           'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=400&h=300&fit=crop','detached_house','강원특별자치도 강릉시',2025,330.00,165.00,264.00,2,0,'강릉건설',10,5,1),
(28,'속초 펜션',                       '속초 해변가 4실 규모 펜션. 객실마다 테라스+오션뷰.',                           'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=300&fit=crop','neighborhood','강원특별자치도 속초시',2024,462.00,231.00,462.00,2,0,'속초건설',8,4,2),
(28,'평창 전원주택',                   '평창 대관령 인근 전원주택. 겨울 풍경을 담은 대형 창.',                         'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=400&h=300&fit=crop','detached_house','강원특별자치도 평창군',2023,594.00,198.00,297.00,2,0,'강원건설',10,5,3),
(29,'제주 단독주택 ''오름 하우스''',  '한라산 중산간 지대 단독주택. 현무암+목재 복합 구조.',                           'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop','detached_house','제주특별자치도 제주시',2024,462.00,184.80,295.68,2,0,'제주건설',12,5,1),
(29,'서귀포 카페 ''바람의 정원''',    '서귀포 해안도로변 카페. 정원을 감싼 ㄷ자 배치.',                               'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=300&fit=crop','neighborhood','제주특별자치도 서귀포시',2023,330.00,165.00,165.00,1,0,'제주건설',7,3,2),
(29,'제주 세컨드하우스',               '한림읍 바닷가 세컨드하우스. 노출 콘크리트+현무암.',                            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop','detached_house','제주특별자치도 제주시',2022,396.00,158.40,253.44,2,0,'제주건설',10,5,3),
(30,'서귀포 단독주택',                 '서귀포 감귤밭 사이 소규모 단독주택. 자연 채광 극대화.',                        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop','detached_house','제주특별자치도 서귀포시',2025,330.00,132.00,198.00,2,0,'서귀포건설',9,4,1),
(30,'서귀포 게스트하우스',             '중문 관광단지 인근 4실 게스트하우스. 제주석 담장+현대 건물.',                  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=675&fit=crop','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop','detached_house','제주특별자치도 서귀포시',2024,396.00,198.00,297.00,2,0,'서귀포건설',10,5,2);

-- ============================================================
-- 포트폴리오 이미지 (주요 포트폴리오에 각 2~4장)
-- ============================================================
INSERT INTO portfolio_images (portfolio_id, image_url, caption, display_order) VALUES
(1, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&h=700&fit=crop','전면 외관',1),
(1, 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1000&h=700&fit=crop','거실 전경',2),
(1, 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1000&h=700&fit=crop','2층 테라스',3),
(1, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1000&h=700&fit=crop','정원에서 본 야경',4),
(2, 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000&h=700&fit=crop','건물 파사드',1),
(2, 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=1000&h=700&fit=crop','1층 카페 공간',2),
(2, 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=1000&h=700&fit=crop','2층 갤러리',3),
(3, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&h=700&fit=crop','바다 전망',1),
(3, 'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=1000&h=700&fit=crop','현무암 외벽 디테일',2),
(7, 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1000&h=700&fit=crop','타운하우스 전경',1),
(7, 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1000&h=700&fit=crop','중정 녹지',2),
(7, 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1000&h=700&fit=crop','거실 인테리어',3),
(13,'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=1000&h=700&fit=crop','마당 전경',1),
(13,'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=1000&h=700&fit=crop','3층 실내',2),
(17,'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&h=700&fit=crop','플래그십 스토어 외관',1),
(17,'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1000&h=700&fit=crop','내부 전시 공간',2),
(17,'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1000&h=700&fit=crop','야간 조명',3),
(22,'https://images.unsplash.com/photo-1481277542470-605612bd2d61?w=1000&h=700&fit=crop','복합문화시설 전경',1),
(22,'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1000&h=700&fit=crop','도서관 내부',2),
(34,'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=1000&h=700&fit=crop','마당 놀이 공간',1),
(34,'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1000&h=700&fit=crop','거실과 연결된 데크',2),
(41,'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1000&h=700&fit=crop','종로 오피스 전경',1),
(41,'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1000&h=700&fit=crop','로비 인테리어',2),
(41,'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1000&h=700&fit=crop','옥상 정원',3),
(55,'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1000&h=700&fit=crop','모던 하우스 외관',1),
(55,'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1000&h=700&fit=crop','중정 뷰',2),
(66,'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000&h=700&fit=crop','해운대 바다의 집 전경',1),
(66,'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1000&h=700&fit=crop','통유리 거실',2),
(66,'https://images.unsplash.com/photo-1572331165267-854da2b021b1?w=1000&h=700&fit=crop','옥상 수영장',3),
(83,'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1000&h=700&fit=crop','한옥 게스트하우스 전경',1),
(83,'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1000&h=700&fit=crop','내부 대청마루',2),
(86,'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=1000&h=700&fit=crop','강릉 세컨드하우스 외관',1),
(86,'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1000&h=700&fit=crop','거실에서 본 바다',2),
(89,'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1000&h=700&fit=crop','오름 하우스 전경',1),
(89,'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1000&h=700&fit=crop','현무암 디테일',2);

-- ============================================================
-- 자격인증 (주요 파트너들)
-- ============================================================
INSERT INTO qualifications (partner_id, cert_code, label, description, status, requested_at, reviewed_at) VALUES
(1, 'design',      '건축사 자격증',   '대한건축사협회 등록 제2014-1234호',     'approved', NOW()-INTERVAL '1 year',  NOW()-INTERVAL '11 months'),
(1, 'supervision', '감리 자격증',     '건축감리 전문자격 등록',                'approved', NOW()-INTERVAL '1 year',  NOW()-INTERVAL '11 months'),
(2, 'design',      '건축사 자격증',   '대한건축사협회 등록 제2010-5678호',     'approved', NOW()-INTERVAL '2 years', NOW()-INTERVAL '23 months'),
(2, 'construction','시공 면허',       '종합건설업 등록',                       'approved', NOW()-INTERVAL '2 years', NOW()-INTERVAL '23 months'),
(3, 'design',      '건축사 자격증',   '대한건축사협회 등록 제2018-9012호',     'approved', NOW()-INTERVAL '6 months',NOW()-INTERVAL '5 months'),
(4, 'design',      '건축사 자격증',   '대한건축사협회 등록 제2008-3456호',     'approved', NOW()-INTERVAL '3 years', NOW()-INTERVAL '35 months'),
(4, 'supervision', '감리 자격증',     '건축감리 전문자격 등록',                'approved', NOW()-INTERVAL '3 years', NOW()-INTERVAL '35 months'),
(5, 'design',      '건축사 자격증',   '대한건축사협회 등록 제2009-7890호',     'approved', NOW()-INTERVAL '4 years', NOW()-INTERVAL '47 months'),
(5, 'construction','시공 면허',       '종합건설업 등록 제2009-001호',          'approved', NOW()-INTERVAL '4 years', NOW()-INTERVAL '47 months'),
(5, 'supervision', '감리 자격증',     '건축감리 전문자격 등록',                'approved', NOW()-INTERVAL '3 years', NOW()-INTERVAL '35 months'),
(8, 'design',      '건축사 자격증',   '대한건축사협회 등록 제2017-2345호',     'approved', NOW()-INTERVAL '1 year',  NOW()-INTERVAL '11 months'),
(8, 'construction','시공 면허',       '전문건설업 등록',                       'approved', NOW()-INTERVAL '1 year',  NOW()-INTERVAL '11 months'),
(10,'design',      '건축사 자격증',   '대한건축사협회 등록 제2006-6789호',     'approved', NOW()-INTERVAL '5 years', NOW()-INTERVAL '59 months'),
(10,'supervision', '감리 자격증',     '건축감리 전문자격 등록',                'approved', NOW()-INTERVAL '5 years', NOW()-INTERVAL '59 months'),
(11,'construction','종합건설업 면허', '종합건설업 등록 제2005-001호',          'approved', NOW()-INTERVAL '5 years', NOW()-INTERVAL '59 months'),
(12,'design',      '건축사 자격증',   '대한건축사협회 등록 제2016-0123호',     'approved', NOW()-INTERVAL '2 years', NOW()-INTERVAL '23 months'),
(12,'construction','시공 면허',       '전문건설업 등록',                       'approved', NOW()-INTERVAL '2 years', NOW()-INTERVAL '23 months'),
(19,'supervision', '감리 자격증',     '건축감리 전문자격 등록 제2000-001호',   'approved', NOW()-INTERVAL '10 years',NOW()-INTERVAL '119 months'),
(20,'design',      '건축사 자격증',   '대한건축사협회 등록 제2011-4567호',     'approved', NOW()-INTERVAL '3 years', NOW()-INTERVAL '35 months'),
(27,'design',      '건축사 자격증',   '대한건축사협회 등록 제2010-8901호',     'approved', NOW()-INTERVAL '4 years', NOW()-INTERVAL '47 months'),
(27,'construction','한옥시공 인증',   '한옥진흥원 시공 인증',                  'approved', NOW()-INTERVAL '3 years', NOW()-INTERVAL '35 months'),
(29,'design',      '건축사 자격증',   '대한건축사협회 등록 제2012-2345호',     'approved', NOW()-INTERVAL '3 years', NOW()-INTERVAL '35 months'),
(29,'construction','시공 면허',       '전문건설업 등록',                       'approved', NOW()-INTERVAL '3 years', NOW()-INTERVAL '35 months');
