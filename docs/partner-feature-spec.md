# 파트너스 기능 기획 명세서

> 목업(Mock) UI 기반으로 추출한 백엔드 API 및 DB 설계를 위한 기획 문서

---

## 1. 기능 개요

콘마켓 파트너스는 건축 전문가(설계/시공/감리)를 검색·비교·문의할 수 있는 플랫폼이다.

### 사용자 흐름

```
[파트너 검색] → [파트너 카드 목록] → [파트너 상세] → [포트폴리오 상세]
                                        ├→ 찜하기
                                        ├→ 1:1 문의
                                        └→ 리뷰 확인
```

### 페이지 구성

| # | 페이지 | 경로 | 설명 |
|---|--------|------|------|
| 1 | 파트너 검색 | `/partners` | 필터·정렬·검색으로 파트너 목록 조회 |
| 2 | 파트너 상세 | `/partners/:id` | 브랜드 스토리, 포트폴리오, 자격, 리뷰 등 |
| 3 | 포트폴리오 상세 | `/partners/:id/portfolios/:pid` | 개별 프로젝트 상세 + 갤러리 |

> 공개 건축사 검색/상세(`/public-architects/*`)는 이미 외부 API(Ginplus)와 연동 완료 — 본 명세 범위 밖

---

## 2. 공통 코드 체계

코드성 데이터를 단일 테이블로 관리한다. 프론트/서버 모두 이 코드를 기준으로 동작.

### 2.1 CommonCode (공통 코드)

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | PK (BIGSERIAL) | O | |
| group_code | VARCHAR(30) | O | 코드 그룹 식별자 |
| code | VARCHAR(20) | O | 코드 값 |
| label | VARCHAR(50) | O | 표시명 |
| sort_order | SMALLINT | O | 정렬 순서 |
| parent_code | VARCHAR(20) | | 상위 코드 (계층 구조 시) |
| metadata | JSONB | | 부가 정보 (그룹 매핑 등) |
| is_active | BOOLEAN DEFAULT true | O | 사용 여부 |
| created_at | TIMESTAMPTZ | O | |

> UNIQUE(group_code, code)

### 2.2 코드 그룹 정의

#### `SIDO` — 시도 행정구역

| code | label |
|------|-------|
| `11` | 서울특별시 |
| `26` | 부산광역시 |
| `27` | 대구광역시 |
| `28` | 인천광역시 |
| `29` | 광주광역시 |
| `30` | 대전광역시 |
| `31` | 울산광역시 |
| `36` | 세종특별자치시 |
| `41` | 경기도 |
| `42` | 강원특별자치도 |
| `43` | 충청북도 |
| `44` | 충청남도 |
| `45` | 전북특별자치도 |
| `46` | 전라남도 |
| `47` | 경상북도 |
| `48` | 경상남도 |
| `50` | 제주특별자치도 |

> 지역 그룹 매핑은 `REGION_GROUP` 코드에서 단방향으로 관리. SIDO 자체에는 그룹 정보를 두지 않는다.

#### `CERT` — 인증 분야

| code | label |
|------|-------|
| `design` | 설계 |
| `construction` | 시공 |
| `supervision` | 감리 |

#### `USAGE` — 건축 용도

| code | label |
|------|-------|
| `detached_house` | 단독주택 |
| `multi_family` | 다세대주택 |
| `neighborhood` | 근린생활 |
| `officetel` | 오피스텔 |
| `commercial` | 상가 |
| `factory` | 공장 |

#### `QUAL_STATUS` — 자격 인증 상태

| code | label |
|------|-------|
| `pending` | 심사 중 |
| `approved` | 승인 |
| `rejected` | 반려 |

#### `REGION_GROUP` — 지역 필터 그룹

| code | label | metadata |
|------|-------|----------|
| `capital` | 수도권 | `{"sidoCodes": ["11","28","41"]}` |
| `chungcheong` | 대전·충청 | `{"sidoCodes": ["30","36","43","44"]}` |
| `gyeongbuk` | 대구·경북 | `{"sidoCodes": ["27","47"]}` |
| `gyeongnam` | 부산·울산·경남 | `{"sidoCodes": ["26","31","48"]}` |
| `jeolla` | 광주·전라 | `{"sidoCodes": ["29","45","46"]}` |
| `gangwon` | 강원 | `{"sidoCodes": ["42"]}` |
| `jeju` | 제주 | `{"sidoCodes": ["50"]}` |

### 2.3 공통 코드 API

```
GET /api/codes?groups=SIDO,CERT,USAGE,REGION_GROUP
```

**Response:**

```json
{
  "SIDO": [
    { "code": "11", "label": "서울특별시" }
  ],
  "CERT": [
    { "code": "design", "label": "설계" }
  ],
  "USAGE": [
    { "code": "detached_house", "label": "단독주택" }
  ],
  "REGION_GROUP": [
    { "code": "capital", "label": "수도권", "metadata": { "sidoCodes": ["11","28","41"] } }
  ]
}
```

> 프론트에서 앱 초기화 시 한 번 호출하여 캐시. 코드 변경 빈도가 낮으므로 staleTime 길게 설정.

---

## 3. 데이터 모델

### 3.1 Partner (파트너/사무소)

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | PK (BIGSERIAL) | O | |
| name | VARCHAR(100) | O | 사무소명 |
| sido_code | CHAR(2) | O | 시도 코드 → CommonCode(SIDO) |
| sigungu_code | CHAR(5) | | 시군구 코드 (선택) |
| address | VARCHAR(200) | O | 전체 주소 |
| profile_image_url | TEXT | O | 프로필 이미지 (S3) |
| cover_image_url | TEXT | O | 커버/대표 이미지 (S3) |
| certs | TEXT[] | | 승인된 인증 분야 코드 캐시 → CommonCode(CERT). Qualification approved 시 갱신 |
| usages | TEXT[] | O | 전문 용도 코드 배열 → CommonCode(USAGE) |
| founded_year | SMALLINT | O | 설립 년도 (업력은 `현재년도 - founded_year`로 계산) |
| ceo_name | VARCHAR(50) | O | 대표자명 |
| employee_count | SMALLINT | | 직원 수 |
| phone | VARCHAR(20) | | 대표 전화번호 |
| website_url | TEXT | | 웹사이트 URL |
| intro | TEXT | O | 한 줄 소개 |
| brand_story_content | TEXT | | 브랜드 스토리 본문 (리치 텍스트 HTML) |
| rating | DECIMAL(2,1) | | 평균 별점 캐시 (리뷰 CUD 시 갱신) |
| review_count | INT DEFAULT 0 | | 리뷰 수 캐시 (리뷰 CUD 시 갱신) |
| portfolio_count | INT DEFAULT 0 | | 포트폴리오 수 캐시 (포트폴리오 CUD 시 갱신) |
| top_review_tags | TEXT[] | | 상위 리뷰 태그 캐시 (리뷰 CUD 시 상위 3개 갱신) |
| created_at | TIMESTAMPTZ | O | |
| updated_at | TIMESTAMPTZ | O | |

> **비정규화 캐시 필드 갱신 전략:**
> - `certs`: Qualification 승인/반려 시 → `SELECT DISTINCT cert_code FROM qualifications WHERE partner_id = ? AND status = 'approved'`로 갱신
> - `rating`, `review_count`: 리뷰 생성/수정/삭제 시 → `AVG(rating)`, `COUNT(*)` 재계산
> - `portfolio_count`: 포트폴리오 생성/삭제 시 → `COUNT(*)` 재계산
> - `top_review_tags`: 리뷰 생성/수정/삭제 시 → ReviewTagSelection에서 해당 파트너의 태그별 `COUNT` 상위 3개 갱신

### 3.2 BrandStoryImage (브랜드 스토리 첨부 이미지)

브랜드 스토리 리치 텍스트 에디터에서 삽입한 이미지를 관리한다.
본문(HTML)에는 이미지 URL이 인라인으로 포함되며, 이 테이블은 S3 파일 라이프사이클 관리용.

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | PK | O | |
| partner_id | FK → Partner | O | |
| image_url | TEXT | O | S3 URL |
| created_at | TIMESTAMPTZ | O | |

> 파트너가 브랜드 스토리를 수정할 때, 본문에서 제거된 이미지는 주기적으로 정리(orphan cleanup)

### 3.3 ReviewTag (리뷰 평가 항목 — 사전 정의)

리뷰 작성 시 선택할 수 있는 평가 태그 마스터 테이블. 관리자가 사전 정의.

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | PK | O | |
| label | VARCHAR(50) | O | 예: "전문적이에요", "소통이 좋아요", "꼼꼼해요" |
| display_order | SMALLINT | O | 표시 순서 |
| is_active | BOOLEAN DEFAULT true | O | 비활성화 시 신규 선택 불가 |

### 3.4 Portfolio (포트폴리오)

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | PK | O | |
| partner_id | FK → Partner | O | |
| title | VARCHAR(200) | O | 프로젝트명 |
| intro | TEXT | | 프로젝트 소개 |
| hero_image_url | TEXT | O | 대표 이미지 |
| thumbnail_url | TEXT | O | 목록용 썸네일 |
| usage_code | VARCHAR(20) | O | 건축 용도 → CommonCode(USAGE) |
| location | VARCHAR(100) | O | 위치 |
| completion_year | SMALLINT | O | 준공 년도 |
| land_area | DECIMAL(10,2) | | 대지면적 (m²) |
| building_area | DECIMAL(10,2) | | 건축면적 (m²) |
| total_floor_area | DECIMAL(10,2) | | 연면적 (m²) |
| floors_above | SMALLINT | | 지상 층수 |
| floors_below | SMALLINT | | 지하 층수 |
| constructor_name | VARCHAR(100) | | 시공사명 |
| construction_period_months | SMALLINT | | 시공 기간 (개월) |
| design_period_months | SMALLINT | | 설계 기간 (개월) |
| display_order | SMALLINT | | 표시 순서 |
| created_at | TIMESTAMPTZ | O | |

### 3.5 PortfolioImage (포트폴리오 갤러리 이미지)

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | PK | O | |
| portfolio_id | FK → Portfolio | O | |
| image_url | TEXT | O | S3 URL |
| caption | VARCHAR(200) | | 이미지 설명 |
| display_order | SMALLINT | O | 표시 순서 |

### 3.6 Qualification (자격·인증)

파트너가 자격 인증을 요청하면 관리자가 첨부 파일을 확인 후 승인/반려하는 워크플로우.

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | PK | O | |
| partner_id | FK → Partner | O | |
| cert_code | VARCHAR(20) | O | 인증 분야 코드 → CommonCode(CERT): `design`, `construction`, `supervision` |
| label | VARCHAR(100) | O | 자격 유형명 (예: "건축사 자격증", "설계 인증") |
| description | VARCHAR(200) | | 보충 설명 |
| file_id | FK → files(id) | O | 업로드된 라이센스/증명서 파일 (presigned URL 패턴) |
| status | VARCHAR(20) | O | → CommonCode(QUAL_STATUS): `pending`, `approved`, `rejected` |
| reject_reason | TEXT | | 반려 사유 |
| requested_at | TIMESTAMPTZ | O | 요청 일시 |
| reviewed_at | TIMESTAMPTZ | | 승인/반려 일시 |
| reviewed_by | FK → User | | 처리 관리자 |

> 파트너 상세 화면에서는 `status = 'approved'`인 항목만 공개 표시

### 3.7 Review (리뷰)

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | PK | O | |
| partner_id | FK → Partner | O | |
| portfolio_id | FK → Portfolio | | 관련 포트폴리오 (선택) |
| user_id | FK → User | O | 작성자 (표시명은 User에서 마스킹 처리) |
| rating | SMALLINT | O | 별점 (1~5) |
| text | TEXT | O | 리뷰 본문 |
| created_at | TIMESTAMPTZ | O | |

### 3.8 ReviewTagSelection (리뷰-평가항목 매핑)

리뷰 작성 시 선택한 평가 태그. 파트너 상세에서 태그별 건수를 집계하여 표시.

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | PK | O | |
| review_id | FK → Review | O | |
| review_tag_id | FK → ReviewTag | O | |

> UNIQUE(review_id, review_tag_id) — 한 리뷰에서 같은 태그 중복 선택 방지

### 3.9 Favorite (찜하기)

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | PK | O | |
| user_id | FK → User | O | |
| partner_id | FK → Partner | O | |
| created_at | TIMESTAMPTZ | O | |

> UNIQUE(user_id, partner_id)

### 3.10 1:1 문의 — Sendbird 채팅

자체 Inquiry 테이블 없이 **Sendbird Chat SDK**로 대체한다.

- 파트너 상세의 "1:1 문의" 버튼 클릭 → Sendbird 1:1 채널 생성(또는 기존 채널 진입)
- 채널 메타데이터에 `partner_id`를 저장하여 파트너별 문의 관리
- 파트너 측은 Sendbird 대시보드 또는 관리자 페이지에서 메시지 확인/응답

**필요 설정:**
- Sendbird Application ID (환경변수)
- 사용자 생성: 로그인 시 Sendbird user 동기화
- 파트너 사용자: 파트너 등록 시 Sendbird user 생성

---

## 4. API 명세

### 4.1 파트너 목록 조회

```
GET /api/partners
```

**Query Parameters:**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| q | string | 검색어 (사무소명 매칭) |
| certs | string[] | 인증 코드 필터: `design`, `construction`, `supervision` |
| sido_codes | string[] | 시도 코드 필터 (예: `11,28,41`) |
| usages | string[] | 용도 코드 필터: `detached_house`, `commercial` 등 |
| min_years | int | 최소 업력 |
| max_years | int | 최대 업력 |
| min_portfolio | int | 최소 포트폴리오 수 |
| sort | string | `rating` (기본), `portfolio`, `years` |
| page | int | 페이지 번호 (기본 1) |
| size | int | 페이지 크기 (기본 20) |

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "name": "아크 건축사사무소",
      "sido": { "code": "11", "label": "서울특별시" },
      "sigunguCode": "11680",
      "address": "서울특별시 강남구 논현로 ...",
      "profileImage": "https://...",
      "coverImage": "https://...",
      "certs": [
        { "code": "design", "label": "설계" },
        { "code": "supervision", "label": "감리" }
      ],
      "usages": [
        { "code": "detached_house", "label": "단독주택" },
        { "code": "multi_family", "label": "다세대주택" }
      ],
      "portfolioCount": 45,
      "reviewCount": 32,
      "rating": 4.8,
      "foundedYear": 2014,
      "years": 12,
      "topReviewTags": ["전문적이에요", "소통이 좋아요"],
      "isFavorited": false | null
    }
  ],
  "total": 128,
  "page": 1,
  "size": 20
}
```

---

### 4.2 파트너 상세 조회

```
GET /api/partners/:id
```

**Response:**

```json
{
  "partner": {
    "id": 1,
    "name": "아크 건축사사무소",
    "sido": { "code": "11", "label": "서울특별시" },
    "sigunguCode": "11680",
    "address": "서울특별시 강남구 논현로 ...",
    "profileImage": "...",
    "coverImage": "...",
    "certs": [
      { "code": "design", "label": "설계" },
      { "code": "supervision", "label": "감리" }
    ],
    "usages": [
      { "code": "detached_house", "label": "단독주택" },
      { "code": "multi_family", "label": "다세대주택" },
      { "code": "neighborhood", "label": "근린생활" }
    ],
    "foundedYear": 2014,
    "years": 12,
    "ceoName": "김건축",
    "employeeCount": 15,
    "phone": "02-1234-5678",
    "websiteUrl": "https://...",
    "intro": "...",
    "rating": 4.8,
    "reviewCount": 32,
    "portfolioCount": 45,
    "isFavorited": false | null
  },
  "brandStoryContent": "<h2>우리의 철학</h2><p>자연과 건축의 경계를 허물다...</p><img src='https://s3...' />...",
  "portfolios": [
    { "id": 1, "title": "판교 단독주택", "thumbnail": "...", "usage": { "code": "detached_house", "label": "단독주택" }, "landArea": 330.5, "year": 2024, "description": "..." }
  ],
  "qualifications": [
    { "id": 1, "label": "건축사 자격증", "description": "대한건축사협회 등록", "status": "approved" }
  ],
  "reviewTagSummary": [
    { "id": 1, "label": "전문적이에요", "count": 18 },
    { "id": 2, "label": "소통이 좋아요", "count": 15 }
  ],
  "reviews": [
    { "id": 1, "author": "김**", "date": "2024-11", "portfolioId": 1, "portfolioTitle": "판교 단독주택", "tags": [{ "id": 1, "label": "전문적이에요" }], "text": "..." }
  ]
}
```

---

### 4.3 파트너 등록/수정 (TBD)

> **미결**: 파트너 등록 주체(직접 가입 vs 관리자 등록)가 결정되면 확정. §8 미결 사항 #1, #2 참조.

```
POST /api/partners          — 파트너 신규 등록
PATCH /api/partners/:id     — 파트너 정보 수정 (프로필, 커버, 기본 정보, 브랜드 스토리 등)
```

**PATCH 주요 필드** (부분 수정 가능):

| 필드 | 설명 |
|------|------|
| name | 사무소명 |
| sidoCode, sigunguCode, address | 지역/주소 |
| profileImageUrl, coverImageUrl | 이미지 (S3 URL) |
| usages | 전문 용도 코드 배열 |
| foundedYear, ceoName, employeeCount | 기본 정보 |
| phone, websiteUrl, intro | 연락처/소개 |
| brandStoryContent | 브랜드 스토리 HTML |

---

### 4.4 포트폴리오 상세 조회

```
GET /api/partners/:id/portfolios/:portfolioId
```

**Response:**

```json
{
  "id": 1,
  "partnerId": 1,
  "partnerName": "아크 건축사사무소",
  "title": "판교 단독주택 '숲의 집'",
  "intro": "자연과 건축의 경계를 허물다...",
  "heroImage": "...",
  "usage": { "code": "detached_house", "label": "단독주택" },
  "location": "경기도 성남시 분당구",
  "completionYear": 2024,
  "landArea": 330.5,
  "buildingArea": 165.2,
  "totalFloorArea": 264.8,
  "floorsAbove": 2,
  "floorsBelow": 1,
  "constructorName": "한빛종합건설",
  "constructionPeriodMonths": 14,
  "designPeriodMonths": 6,
  "images": [
    { "id": 1, "url": "...", "caption": "전면 외관" }
  ]
}
```

---

### 4.5 찜하기 토글

```
POST /api/partners/:id/favorite
```

**Response:** `{ "favorited": true }`

> 이미 찜한 상태면 해제, 아니면 등록 (토글 방식). 로그인 필수.
>
> **`isFavorited` 규칙:** 로그인 시 `true`/`false`, 비로그인 시 `null`. 프론트에서 `null`이면 찜 클릭 시 로그인 유도.

---

### 4.6 자격·인증 요청 (파트너)

기존 presigned URL 패턴(`POST /api/files` → S3 직접 업로드 → `PATCH /api/files/:id/confirm`)으로 파일을 먼저 업로드한 뒤, 자격 인증을 요청한다.

**Step 1**: 파일 업로드 (기존 `/api/files` 플로우)
```
POST /api/files → presigned URL 발급 → S3 PUT → PATCH /api/files/:fileId/confirm
```

**Step 2**: 자격 인증 요청
```
POST /api/partners/:id/qualifications
```

**Request Body:**

```json
{
  "certCode": "design",
  "label": "건축사 자격증",
  "description": "대한건축사협회 등록",
  "fileId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:** `{ "id": 1, "status": "pending" }`

> `fileId`는 `/api/files`로 업로드 완료(confirmed)된 파일의 UUID

---

### 4.7 자격·인증 승인/반려 (관리자)

```
PATCH /api/admin/qualifications/:id
```

**Request Body:**

```json
{
  "status": "approved",
  "rejectReason": null
}
```

---

### 4.8 1:1 문의 — Sendbird 채팅

자체 API 없음. 프론트에서 Sendbird Chat SDK로 직접 처리.

```
"1:1 문의" 버튼 클릭
→ Sendbird GroupChannel.createChannel({ userIds: [userId, partnerId] })
→ 채팅 UI 진입
```

---

### 4.9 리뷰 목록 조회 (페이지네이션)

```
GET /api/partners/:id/reviews?page=1&size=10
```

> 파트너 상세에 포함되지만, 리뷰가 많아지면 별도 페이지네이션 필요

---

### 4.10 이미지 업로드 (공통)

파트너 프로필/커버, 포트폴리오 대표/갤러리, 브랜드 스토리 인라인 이미지 모두 기존 presigned URL 패턴을 사용한다.

**업로드 플로우:**
```
POST /api/files       → presigned PUT URL 발급
클라이언트 → S3 PUT   → 직접 업로드
PATCH /api/files/:id/confirm → 업로드 완료 확인
```

**이미지 URL 저장:** 업로드 완료된 파일의 S3 URL을 해당 엔티티 생성/수정 API에 전달.

```json
// 예: 파트너 프로필 수정
PATCH /api/partners/:id
{ "profileImageUrl": "https://s3.../uploads/xxxx.jpg" }

// 예: 포트폴리오 갤러리 이미지 추가
POST /api/partners/:id/portfolios/:pid/images
{ "imageUrl": "https://s3.../uploads/xxxx.jpg", "caption": "전면 외관" }
```

> **공개 이미지** (프로필, 커버, 포트폴리오, 브랜드 스토리): 업로드 완료 후 S3 URL을 직접 저장. CDN 캐싱 가능.
> **비공개 파일** (자격 증명서): `file_id` FK로 참조. 다운로드 시 presigned GET URL 발급.

---

## 5. 필터/정렬 상세

> 인증 분야(`CERT`), 시도(`SIDO`), 지역 그룹(`REGION_GROUP`), 건축 용도(`USAGE`)의 코드 정의는 **§2. 공통 코드 체계** 참조.
> 프론트에서 `GET /api/codes`로 코드를 가져와 필터 UI를 동적으로 생성한다.

### 5.1 인증 분야 필터

Partner.certs 캐시 필드(코드 배열) 기준. `WHERE certs @> ARRAY[?]`

### 5.2 지역 필터

UI에서 REGION_GROUP 코드의 `metadata.sidoCodes`를 펼쳐서 `sido_codes` 파라미터로 전달.
서버: `WHERE sido_code = ANY(?)`

### 5.3 건축 용도 필터

Partner.usages 코드 배열 기준. `WHERE usages && ARRAY[?]`

### 5.4 업력 범위

| 값 | 조건 |
|----|------|
| 5년 이하 | `founded_year >= 현재년도 - 5` |
| 5~10년 | `현재년도 - 10 <= founded_year < 현재년도 - 5` |
| 10~20년 | `현재년도 - 20 <= founded_year < 현재년도 - 10` |
| 20년 이상 | `founded_year < 현재년도 - 20` |

### 5.5 포트폴리오 범위

| 값 | 조건 |
|----|------|
| 10건 이상 | `portfolio_count >= 10` |
| 30건 이상 | `portfolio_count >= 30` |
| 50건 이상 | `portfolio_count >= 50` |

### 5.6 정렬

| 값 | SQL |
|----|-----|
| `rating` (종합순) | `ORDER BY rating DESC, review_count DESC` |
| `portfolio` (포트폴리오순) | `ORDER BY portfolio_count DESC` |
| `years` (업력순) | `ORDER BY founded_year ASC` (설립이 오래될수록 상위) |

---

## 6. 화면별 API 매핑

| 화면 | 사용 API | 비고 |
|------|----------|------|
| 파트너 검색 (목록) | `GET /api/partners` | 필터·정렬·페이지네이션 |
| 파트너 카드 찜 | `POST /api/partners/:id/favorite` | 토글 |
| 파트너 상세 | `GET /api/partners/:id` | 모든 섹션 데이터 포함 |
| 포트폴리오 상세 | `GET /api/partners/:id/portfolios/:pid` | 갤러리 이미지 포함 |
| 자격 인증 요청 | `POST /api/files` → S3 → `POST /api/partners/:id/qualifications` | presigned URL 패턴 |
| 자격 인증 승인 | `PATCH /api/admin/qualifications/:id` | 관리자 승인/반려 |
| 1:1 문의 | Sendbird Chat SDK | 자체 API 없음, 프론트 SDK |
| 리뷰 더보기 | `GET /api/partners/:id/reviews` | 선택적 페이지네이션 |
| 이미지 업로드 | `POST /api/files` → S3 → confirm | 모든 이미지 공통 플로우 |

---

## 7. 구현 우선순위

### Phase 1 — 핵심 CRUD (MVP)
1. CommonCode 테이블 + 코드 조회 API (`GET /api/codes`) + 초기 시드 데이터
2. Partner 테이블 + 목록 API (필터·정렬·페이지네이션)
3. Partner 상세 API (기본 정보 + 자격)
4. Portfolio 테이블 + 상세 API + 갤러리 이미지

### Phase 2 — 사용자 인터랙션
5. 찜하기 (Favorite) 토글 API
6. 리뷰 목록 API + 리뷰 태그 시스템
7. 자격·인증 요청/승인 워크플로우

### Phase 3 — 콘텐츠 & 채팅
8. 브랜드 스토리 리치 텍스트 저장/수정 API + 이미지 업로드 (presigned URL)
9. Sendbird 채팅 연동 (1:1 문의)
10. 파트너 관리자 등록/수정 (어드민)

---

## 8. 미결 사항 (논의 필요)

| # | 항목 | 질문 |
|---|------|------|
| 1 | 파트너 등록 | 파트너가 직접 가입하는가, 관리자가 등록하는가? |
| 2 | 인증 체계 | 파트너 계정과 일반 사용자 계정을 구분하는가? |
| 3 | 리뷰 작성 | 누가 리뷰를 작성할 수 있는가? 인증된 고객만? |
| 4 | 리뷰 태그 관리 | 초기 태그 목록은? (예: 전문적이에요, 소통이 좋아요, 꼼꼼해요, 일정을 잘 지켜요, 가격이 합리적이에요) |
| 5 | 검색 엔진 | 사무소명 검색에 Full-text search(PostgreSQL) 또는 별도 검색 엔진이 필요한가? |
| 6 | 이미지 관리 | 이미지 리사이징/최적화가 필요한가? |
| 7 | 공개 건축사 연동 | 콘마켓 파트너와 공개 건축사 데이터를 연결할 것인가? |
| 8 | Sendbird 플랜 | Sendbird 요금제 및 Application ID 확보 상태는? |
| 9 | 자격 인증 유형 | 사전 정의할 자격 유형 목록은? (건축사 자격증, 설계 인증, 감리 인증, 사업자 등록, 보험 등) |
| 10 | 첨부 파일 형식 | 자격 증명 파일의 허용 형식/용량 제한은? (PDF, JPG, PNG / 최대 10MB 등) |
