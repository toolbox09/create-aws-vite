# 입찰 및 계약 기능 명세서

> 목업(프론트엔드 코드) 분석 기반 · 작성일: 2026-03-10 · 상태: Draft

---

## 1. 도메인 개요

건축 설계 입찰 플랫폼. **건축주**가 입찰공고를 등록하면 **건축사**가 제안서를 제출하고, 선정 후 **표준계약 → 전자서명**으로 이어지는 구조.

```
입찰공고 등록 → 제안서 접수 → 업체 선정 → 계약 초안 → 전자서명 → 계약 체결
```

---

## 2. 데이터 모델 (테이블 설계)

### 2.1 bids (입찰공고)

건축주가 등록하는 입찰공고 원장.

| 컬럼 | 타입 | NOT NULL | 설명 |
|------|------|:---:|------|
| id | uuid / PK | ✓ | |
| owner_id | uuid / FK→users | ✓ | 건축주 |
| status | enum | ✓ | `대기` · `공고중` · `선정중` · `계약중` · `종료` · `취소` |
| bid_method | enum | ✓ | `일반경쟁` · `제한경쟁` · `지명경쟁` |
| design_scope | enum | ✓ | `가설계` · `본설계` |
| title | varchar | ✓ | 공고 제목 |
| description | text | | 상세 설명 |
| recruit_start | date | ✓ | 모집 시작일 |
| recruit_end | date | ✓ | 모집 마감일 |
| created_at | timestamptz | ✓ | |
| updated_at | timestamptz | ✓ | |

> **D-day**는 `recruit_end - CURRENT_DATE`로 계산. 컬럼 아님.
> **참여자 수**는 `proposals` 테이블 COUNT. 컬럼 아님.

### 2.2 bid_restrictions (참여 제한 조건)

`제한경쟁` · `지명경쟁` 시 건축사 참여 자격을 제한하는 조건. `일반경쟁`이면 이 테이블에 행 없음.

| 컬럼 | 타입 | NOT NULL | 설명 |
|------|------|:---:|------|
| bid_id | uuid / FK→bids / PK | ✓ | |
| regions | varchar[] | | 지역 제한 (수도권, 대전·충청 등). NULL이면 제한 없음 |
| categories | varchar[] | | 분야 제한 (설계, 시공, 감리). NULL이면 제한 없음 |
| min_years | smallint | | 최소 업력 (년). NULL이면 제한 없음 |
| max_years | smallint | | 최대 업력. NULL이면 제한 없음 |
| building_uses | varchar[] | | 건축 용도 전문 (단독주택, 근린생활 등). NULL이면 제한 없음 |
| min_portfolio_count | smallint | | 최소 포트폴리오 수. NULL이면 제한 없음 |

> 파트너 검색 페이지(`/partners`)의 필터 조건과 동일한 기준.
> 제안서 제출 시 서버가 이 조건으로 자격 검증 → 미충족 시 제출 거부.

### 2.3 bid_invitations (지명 초대)

`지명경쟁` 시 건축주가 직접 선택한 파트너 목록. 초대받은 건축사만 제안서 제출 가능.

| 컬럼 | 타입 | NOT NULL | 설명 |
|------|------|:---:|------|
| bid_id | uuid / FK→bids | ✓ | |
| architect_id | uuid / FK→users | ✓ | 초대된 건축사 |
| invited_at | timestamptz | ✓ | 초대 시각 |
| status | enum | ✓ | `초대됨` · `수락` · `거절` |

PK: (bid_id, architect_id)

> 지명경쟁 등록 시: 파트너 검색 UI에서 건축사를 검색·선택하여 이 테이블에 추가.
> 제안서 제출 시: `bid_invitations`에 본인이 존재하는지 서버가 검증.

### 2.4 bid_categories (입찰 분야, N:M)

하나의 공고가 복수 분야를 가질 수 있음 (설계, 시공, 감리).

| 컬럼 | 타입 | 설명 |
|------|------|------|
| bid_id | uuid / FK→bids | |
| category | enum | `설계` · `시공` · `감리` |

PK: (bid_id, category)

### 2.5 bid_site (부지 정보)

공고당 1건. 부지 선택 단계에서 입력.

| 컬럼 | 타입 | NOT NULL | 설명 |
|------|------|:---:|------|
| bid_id | uuid / FK→bids / PK | ✓ | |
| address | varchar | ✓ | 주소 (예: 서울 강남구 역삼동 123-4) |
| zoning | varchar | | 용도지역 (예: 제2종일반주거지역) |
| main_parcel | varchar | ✓ | 기준 필지 주소 |
| merged_parcels | varchar[] | | 합필 필지 주소 목록 |

### 2.6 bid_building (건축 규모)

공고당 1건. 건축 목적·규모 단계에서 입력.

| 컬럼 | 타입 | NOT NULL | 설명 |
|------|------|:---:|------|
| bid_id | uuid / FK→bids / PK | ✓ | |
| business_purpose | enum | ✓ | `주거용` · `상업용` · `업무용` · `공업용` · `복합용` |
| building_use | enum | ✓ | `단독주택` · `다세대주택` · `근린생활` · `오피스텔` · `상가` · `공장` · `창고` |
| land_area | decimal(10,2) | ✓ | 대지면적 (m²) |
| building_area | decimal(10,2) | ✓ | 건축면적 (m²) |
| total_floor_area | decimal(10,2) | | 연면적 (m²) |
| building_coverage_ratio | decimal(5,2) | | 건폐율 (%) |
| floor_area_ratio | decimal(5,2) | | 용적률 (%) |
| floors_above | smallint | ✓ | 지상 층수 |
| floors_below | smallint | ✓ | 지하 층수 |
| total_budget | integer | | 총 건축비 (만원) |
| design_fee_min | integer | ✓ | 희망 설계비 하한 (만원) |
| design_fee_max | integer | ✓ | 희망 설계비 상한 (만원) |
| parking_type | varchar | | 주차 방식 (자주식/기계식) |
| parking_count | smallint | | 주차대수 |
| structure | varchar | | 구조 (철근콘크리트 등) |

### 2.7 style_options (건축 스타일 마스터)

디자인 요소·외장재의 참조 테이블. 관리자가 관리하며 칩 선택 UI의 선택지를 제공.

| 컬럼 | 타입 | NOT NULL | 설명 |
|------|------|:---:|------|
| id | uuid / PK | ✓ | |
| kind | enum | ✓ | `design_element` · `exterior_material` |
| name | varchar | ✓ | 표시명 (예: 테라스, 노출콘크리트) |
| image_url | varchar | ✓ | 대표 이미지 URL |
| sort_order | smallint | ✓ | 표시 순서 |
| is_active | boolean | ✓ | 활성 여부 (비활성 시 선택지에서 숨김) |

UNIQUE: (kind, name)

**초기 데이터:**

| kind | name | 비고 |
|------|------|------|
| design_element | 다락방 | |
| design_element | 루프탑 | |
| design_element | 테라스 | |
| design_element | 중정 | |
| design_element | 필로티 | |
| design_element | 발코니 | |
| design_element | 옥상정원 | |
| design_element | 복층 | |
| exterior_material | 노출콘크리트 | |
| exterior_material | 징크 | |
| exterior_material | 목재 | |
| exterior_material | 벽돌 | |
| exterior_material | 스톤 | |
| exterior_material | 유리커튼월 | |
| exterior_material | 알루미늄패널 | |
| exterior_material | 스타코 | |

### 2.8 bid_styles (입찰 ↔ 스타일 선택, N:M)

건축주가 공고에서 선택한 스타일 옵션.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| bid_id | uuid / FK→bids | |
| style_option_id | uuid / FK→style_options | |

PK: (bid_id, style_option_id)

### 2.9 bid_reference_images (레퍼런스 이미지)

건축주가 원하는 스타일의 참고 이미지. 최대 5장.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid / PK | |
| bid_id | uuid / FK→bids | |
| file_key | varchar | S3 key |
| sort_order | smallint | 정렬 순서 |

### 2.10 bid_certifications (신뢰 인증)

공고 신뢰도를 높이기 위한 인증 서류.

| 컬럼 | 타입 | NOT NULL | 설명 |
|------|------|:---:|------|
| bid_id | uuid / FK→bids | ✓ | |
| cert_type | enum | ✓ | `토지소유` · `건축가능` · `건축허가` |
| verified | boolean | ✓ | 인증 완료 여부 |
| doc_type | varchar | | 인증 서류 종류 (등기부등본, 건축사확인서 등) |
| file_key | varchar | | 업로드된 서류 S3 key |

PK: (bid_id, cert_type)

### 2.11 bid_likes (관심 공고)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| user_id | uuid / FK→users | |
| bid_id | uuid / FK→bids | |
| created_at | timestamptz | |

PK: (user_id, bid_id)

---

### 2.12 proposals (제안서)

건축사가 입찰공고에 제출하는 제안서. **공고당 건축사당 1건**.

| 컬럼 | 타입 | NOT NULL | 설명 |
|------|------|:---:|------|
| id | uuid / PK | ✓ | |
| bid_id | uuid / FK→bids | ✓ | |
| architect_id | uuid / FK→users | ✓ | 건축사 (제출자) |
| design_fee | integer | ✓ | 제안 설계비 (만원) |
| opinion | text | ✓ | 설계 소견 (최대 3,000자) |
| status | enum | ✓ | `제출` · `선정` · `미선정` · `철회` |
| created_at | timestamptz | ✓ | |
| updated_at | timestamptz | ✓ | |

UNIQUE: (bid_id, architect_id) — 공고당 건축사 1건만

### 2.13 proposal_attachments (제안서 첨부파일)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid / PK | |
| proposal_id | uuid / FK→proposals | |
| file_key | varchar | S3 key |
| file_name | varchar | 원본 파일명 |
| file_size | integer | 바이트 |

---

### 2.14 contracts (계약)

선정된 건축사와의 표준계약. chub 시스템 기반 설계.

| 컬럼 | 타입 | NOT NULL | 설명 |
|------|------|:---:|------|
| id | uuid / PK | ✓ | |
| bid_id | uuid / FK→bids | ✓ | 원 공고 |
| proposal_id | uuid / FK→proposals | ✓ | 선정된 제안서 |
| client_id | uuid / FK→users | ✓ | 갑 (건축주) |
| architect_id | uuid / FK→users | ✓ | 을 (건축사) |
| status | enum | ✓ | `요청` · `수락` · `편집중` · `편집완료` · `서명요청` · `서명진행` · `체결` · `거부` · `만료` |
| is_editable | boolean | ✓ | 편집 가능 여부 (편집완료 시 false) |
| last_modified_by | uuid / FK→users | | 마지막 수정자 |
| ucansign_doc_id | varchar | | UCanSign 문서 ID |
| sign_requested_at | timestamptz | | 서명 요청 시각 |
| sign_deadline | timestamptz | | 서명 기한 (기본 14일) |
| reject_reason | text | | 서명 거부 사유 |
| rejected_by | uuid / FK→users | | 거부한 사용자 |
| signed_at | timestamptz | | 체결 완료 시각 |
| created_at | timestamptz | ✓ | |
| updated_at | timestamptz | ✓ | |

### 2.15 contract_items (계약서 Key-Value 필드)

계약서 필드를 Key-Value로 저장. 양측이 수정할 수 있으며 변경 이력 추적.

| 컬럼 | 타입 | NOT NULL | 설명 |
|------|------|:---:|------|
| id | uuid / PK | ✓ | |
| contract_id | uuid / FK→contracts | ✓ | |
| key | varchar | ✓ | 필드명 |
| value | text | | 필드값 (복합 타입은 JSON) |
| last_modified_by | uuid / FK→users | | |
| owner_view_at | timestamptz | | 건축주 마지막 열람 시각 |
| partner_view_at | timestamptz | | 건축사 마지막 열람 시각 |

UNIQUE: (contract_id, key)

**필드 목록 (key):**

| key | 타입 | 설명 | 표시 포맷 |
|-----|------|------|-----------|
| buildingName | string | 건물명칭 | — |
| landLocation | string | 대지위치 | — |
| constructionType | enum | 공사유형 | 신축·증축·개축·재축·이전·대수선·용도변경 |
| landArea | number | 대지면적 | m² (평) 자동변환 |
| buildingUse | string | 건축물용도 | — |
| structureType | string | 건축물구조 | — |
| numberOfFloors | string | 층수 | 예: "지하1층, 지상3층" |
| buildingCoverageArea | number | 건축면적 | m² (평) 자동변환 |
| totalFloorArea | number | 연면적 | m² (평) 자동변환 |
| contractedArea | number | 계약면적 | m² (평) 자동변환 |
| ownerName | string | 건축주 성명 | — |
| ownerRegistrationNumber | string | 건축주 사업자/주민번호 | — |
| ownerAddress | string | 건축주 주소 | — |
| ownerContact | string | 건축주 연락처 | — |
| architectName | string | 건축사 상호 | — |
| architectRegistrationNumber | string | 건축사 등록번호 | — |
| architectAddress | string | 건축사 주소 | — |
| architectContact | string | 건축사 연락처 | — |
| contractAmount | number | 계약금액 | 원 단위. 한글 변환 (일금 OOO원정) |
| contractDate | date | 계약일 | YYYY-MM-DD |
| paymentPeriod | string | 대금 지급 기한 | — |
| paymentMethod | JSON | 기성 지불 일정 | PaymentMethod[] (아래 참조) |
| designDocuments | JSON | 설계 도서 | DesignDocument[] (아래 참조) |
| specialTerms | text | 특약사항 | 최대 2,000자 |

### 2.16 contract_item_histories (필드 변경 이력)

양측이 수정할 때마다 자동 기록. "누가, 언제, 무엇을 바꿨는지" 추적.

| 컬럼 | 타입 | NOT NULL | 설명 |
|------|------|:---:|------|
| id | uuid / PK | ✓ | |
| contract_item_id | uuid / FK→contract_items | ✓ | |
| old_value | text | | 변경 전 값 |
| new_value | text | | 변경 후 값 |
| changed_by | uuid / FK→users | ✓ | 수정자 |
| changed_by_role | enum | ✓ | `건축주` · `건축사` |
| created_at | timestamptz | ✓ | |

### 2.17 PaymentMethod (기성 지불 일정, JSON 배열)

`contract_items.key = 'paymentMethod'`의 value에 JSON 배열로 저장. **가변 행 수** (고정 6단계 아님).

```typescript
interface PaymentMethod {
  paymentCondition: string;   // 기성 (예: "기본설계", "실시설계")
  progressRate: number;       // 기성율 (%)
  paymentAmount: number;      // 금액 (원)
  dueDate: string;            // 지급예정일 (YYYY-MM-DD)
  remark: string;             // 비고
}
```

> 금액은 원 단위. 한글 변환 + ₩ 표기로 PDF/유캔사인 렌더링.
> 기성율 합계 100% 검증은 서버에서 수행.

### 2.18 DesignDocument (설계 도서, JSON 배열)

`contract_items.key = 'designDocuments'`의 value에 JSON 배열로 저장.

```typescript
interface DesignDocument {
  category: string;    // 분류 (설계도, 계산서 등)
  spec: string;        // 규격
  quantity: string;     // 수량
  remark: string;       // 비고
}
```

### 2.19 contract_attachments (계약 첨부문서)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid / PK | |
| contract_id | uuid / FK→contracts | |
| file_key | varchar | S3 key |
| file_name | varchar | 원본 파일명 |
| file_size | integer | 바이트 |

제약: 최대 10개, 파일당 20MB, PDF/JPG/PNG만 허용.

---

## 3. 상태 머신

### 3.1 입찰공고 상태

```
대기 ──→ 공고중 ──→ 선정중 ──→ 계약중 ──→ 종료
 │                    │                    ↑
 ├──→ 취소            └──── 종료 (수동) ───┘
 │
 └── (공고중/선정중에서도 취소 가능)
```

| 전이 | 트리거 | 조건 |
|------|--------|------|
| 대기 → 공고중 | recruit_start 도달 또는 수동 | |
| 공고중 → 선정중 | recruit_end 도달 또는 수동 마감 | 제안서 ≥ 1건 |
| 선정중 → 계약중 | 건축주가 업체 선정 → 계약 생성 | |
| 계약중 → 종료 | 계약 체결 완료 | |
| 대기/공고중/선정중 → 취소 | 건축주가 공고 취소 | 계약 생성 전만 가능 |
| 공고중/선정중 → 종료 | 건축주가 수동 종료 | |

### 3.2 제안서 상태

```
제출 ──→ 선정
  │       ↓
  │     (계약으로)
  │
  ├──→ 미선정 (다른 업체 선정 시 자동)
  └──→ 철회 (건축사 수동)
```

### 3.3 계약 상태 (chub 기반)

```
요청 ──→ 수락 ──→ 편집중 ──→ 편집완료 ──→ 서명요청 ──→ 서명진행 ──→ 체결
 │                                           │          │
 ├──→ 거부 (건축사 거절)                       ├──→ 거부 ──┤
 │                                           └──→ 만료   └──→ (수정 후 재요청)
 └──→ 취소 (건축주 취소)
```

| 전이 | 트리거 | 비고 |
|------|--------|------|
| 요청 → 수락 | 건축사가 계약 요청 수락 | |
| 요청 → 거부 | 건축사가 계약 요청 거절 | |
| 수락 → 편집중 | 자동 (수락 즉시) | isEditable=true, 양측 편집 가능 |
| 편집중 → 편집완료 | 건축주가 "편집 완료" 클릭 | isEditable=false. 건축사에게 알림 발송 |
| 편집완료 → 서명요청 | UCanSign 문서 생성 + 서명 요청 | ucansign_doc_id 저장 |
| 서명요청 → 서명진행 | 을(건축사) 서명 완료 (UCanSign 웹훅) | |
| 서명진행 → 체결 | 갑(건축주) 서명 완료 (UCanSign 웹훅) | |
| 서명요청/서명진행 → 거부 | UCanSign 서명 거부 웹훅 | |
| 서명요청/서명진행 → 만료 | sign_deadline(14일) 초과 | |
| 거부/만료 → 편집중 | 건축주가 수정 후 재요청 | isEditable=true |

---

## 4. 화면 명세

### 4.1 입찰공고 목록 (`/bids`)

**필터:**

| 필터명 | 타입 | 선택지 |
|--------|------|--------|
| 공고 상태 | checkbox | 입찰대기, 입찰공고중, 업체선정중, 종료 |
| 설계 범위 | checkbox | 가설계, 본설계, 시공, 감리 |
| 지역 | checkbox | 수도권, 대전·충청, 대구·경북, 부산·울산·경남, 광주·전라, 강원영서, 강원영동, 제주도, 기타 |
| 건축 용도 | checkbox | 단독주택, 다세대주택, 근린생활, 오피스텔, 상가, 공장 |
| 설계비 | checkbox | 3,000만원 이하, 3,000~5,000, 5,000~10,000, 10,000 이상 |
| 진행중만 | toggle | 공고중 상태만 필터 |
| 키워드 | text | 주소, 건축용도, 지역 검색 |

**정렬:** 최신순 (기본) · 마감임박순 · 참여자순

**페이지네이션:** 10건/페이지

**카드 표시 정보:**
- 건축용도 아바타 (약칭 + 색상)
- 설계범위 배지, 입찰방식, 상태 (펄스 도트)
- 주소 (제목 역할), 지역, 대지면적, 건축용도
- 인증 현황 (체크마크), 참여 건축사 수 (proposals COUNT)
- D-day (recruit_end 기준 계산), 설계비 범위
- 관심(좋아요) 토글

### 4.2 입찰공고 등록 (`/bids/new`) — 5단계 위저드

| 단계 | 이름 | 입력 → 테이블 |
|------|------|---------------|
| 1 | 사업 부지 설정 | 주소 검색 → `bid_site` (address, zoning, main_parcel, merged_parcels) |
| 2 | 입찰 정책 | 분야 → `bid_categories`, 설계범위·입찰방식·기간 → `bids`. **제한경쟁** 선택 시 참여 조건 UI 표시 → `bid_restrictions`. **지명경쟁** 선택 시 조건 + 파트너 검색·선택 UI → `bid_restrictions` + `bid_invitations` |
| 3 | 건축 목적·규모 | 사업용도·건축용도·면적·층수·예산 → `bid_building` |
| 4 | 건축 스타일 | 디자인요소·외장재 → `bid_style`, 참고이미지 → `bid_reference_images` |
| 5 | 공고 신뢰 인증 | 토지소유·건축가능·건축허가 서류 → `bid_certifications` |

순차 진행 (이전/다음). 지도 페이지에서 `location.state`로 필지 데이터 전달 가능.

### 4.3 입찰공고 수정 (`/bids/:id/edit`)

등록과 동일 5단계. 차이: 모든 단계 자유 이동, 기존 데이터 프리필, 상단에 공고 ID·상태 표시.

### 4.4 입찰공고 상세 (`/bids/:id`)

2단 레이아웃 (좌: 콘텐츠, 우: 고정 액션 카드).

**좌측 섹션 순서:**
1. 타이틀 바 — 상태(펄스 도트), 입찰방식, 분야, 주소
2. 이미지 갤러리 — 1+4 그리드 (라이트박스)
3. 요약 — 건축용도, 층수(지상/지하), 면적, 주차 + D-day
4. 건축주 프로필 — 이름, 가입일, 인증 n/m
5. 설명 + 모집기간
6. 진행 단계 스텝퍼 — 5단계: 대기→입찰중→심사중→계약중→마감
7. 기본 정보 그리드 — 분야, 설계구분, 소재지, 입찰방식, 사업용도, 건축용도, 대지면적(평 환산), 건축면적, 층수, 주차, 모집기간, 총건축비, 희망설계비
8. 요구사항 (설계 분야만) — 성과품, 스타일, 디자인요소, 외장재
9. 신뢰 인증 현황 — 프로그레스 바 + 인증 항목별 상태
10. 토지 정보 — 기준 필지, 합필 필지
11. 참여사 목록 — 역할별 차등 노출 (아래 참조)

**참여사 목록 역할별 노출:**

| 역할 | 노출 |
|------|------|
| 건축주 (발주자) | 전체 공개 — 포트폴리오, 지역, 경력, 프로젝트수, 제안가, 평점, 키워드. 정렬: 추천순·업력순·제안가순·프로젝트수순 |
| 건축사 (제출 완료) | 본인만 실명, 나머지 "참여사 A, B, C" 익명 |
| 건축사 (미제출) | 전체 익명. "참여 건축사 N명" 또는 "3명 미만" 표시 |
| 게스트 | "로그인 후 확인 가능합니다" |

**우측 액션 카드:**
- 설계비 범위, 모집 시작·마감, 참여 건축사 수
- 대지면적·건축면적·총건축비 퀵 스탯
- 역할·상태별 CTA (아래 참조)
- 공고 신고 링크

**역할×상태별 CTA:**

| 상태 | 건축주 | 건축사(미제출) | 건축사(제출) | 게스트 |
|------|--------|---------------|-------------|--------|
| 대기 | 공고 수정 | — | — | — |
| 공고중 | 공고 관리 | **입찰 참여하기** | 제안 수정 / 제안 철회 | 로그인 후 참여 |
| 선정중 | 참여사에서 계약 요청 / 공고 종료 | — | 채팅하기 | — |
| 계약중 | 계약서 확인 / 공고 종료 | — | 채팅하기 | — |

### 4.5 제안서 작성 (`/bids/:bidId/proposals/new`)

| 섹션 | 내용 | 편집 |
|------|------|:---:|
| 사무소 정보 | 사무소명, 소재지, 경력, 수행 프로젝트, 주요 용도, 홈페이지 | 읽기전용 (프로필 연동) |
| 제안 설계비 | 금액 입력 (만원 단위, 숫자 포맷팅) | ✓ |
| 설계 의견 | 텍스트 (3,000자 제한, 90% 경고) | ✓ |
| 첨부파일 | 드래그앤드롭 업로드, 복수 파일 | ✓ |

### 4.6 제안서 상세 (`/bids/:bidId/proposals/:proposalId`)

2단 레이아웃. 좌: 사무소 프로필, 제안 설계비, 설계 소견, 첨부파일. 우: 채팅 문의 버튼, 계약 요청 버튼.

### 4.7 제안서 수정 (`/bids/:bidId/proposals/:proposalId/edit`)

작성과 동일 + 기존 데이터 프리필 + **제안 철회** 버튼 (빨간색).

---

### 4.8 계약서 초안/편집 (`/contracts/new`)

`건축설계 표준계약서 (건축사법 제23조제1항 근거)` 양식. 상단에 상태 배지 + 양측 편집 모드 배너.

| 섹션 | 내용 | 편집 |
|------|------|:---:|
| 1. 계약 당사자 | 갑(건축주): 성명, 주민(사업자)등록번호, 주소, 연락처. 을(건축사): 상호, 건축사등록번호, 주소, 연락처 | 읽기전용 |
| 2. 건축물 개요 | 건물명칭, 대지위치, 대지면적(m²→평), 건축물용도, 건축물구조, 층수, 건축면적, 연면적 + 공사유형 체크박스 | 읽기전용 |
| 3. 계약 조건 | 계약면적(m²→평 자동변환), 계약금액(원, 한글 변환 표시: 일금 OOO원정), 계약일, 대금지급기한 | ✓ |
| 4. 기성 지불 일정 | **가변 행** (행 추가/삭제). 기성명·기성율(%)·금액(자동계산)·지급예정일·비고 | ✓ |
| 5. 설계 도서 | **가변 행** (행 추가/삭제). 분류·규격·수량·비고 | ✓ |
| 6. 특약사항 | 텍스트 (2,000자 제한) | ✓ |
| 7. 첨부파일 | PDF/JPG/PNG, 20MB, 최대 10개 | ✓ |
| 8. UCanSign 안내 | 전자서명 절차 안내 (을→갑 순서, 14일 기한, 카카오/이메일 인증) | 읽기전용 |

**변경 이력:** 양측이 편집할 때마다 자동 기록. 이력 드로어에서 필드별·역할별 변경 내역 확인.

**검증:** 기성율 합계 ≠ 100% 시 빨간 경고 + 서명 요청 버튼 비활성화.

**액션:** 임시저장 · 편집 완료 · 서명 요청 (UCanSign) — 편집 완료 후에만 서명 요청 활성화

### 4.9 계약 상세 (`/contracts/:id`)

2단 레이아웃.

**좌측:**
1. 상태 표시 (펄스 도트 + 텍스트)
2. 계약 진행 현황 — 8단계 타임라인: 계약요청 → 계약수락 → 계약서편집 → 편집완료 → 서명요청 → 을서명 → 갑서명 → 계약체결. 각 단계별 완료일시 표시
3. 계약 당사자 — 건축주(갑), 파트너(을) 프로필 카드
4. 건축물 정보 — 대지위치, 건축물용도, 구조, 층수, 대지면적·건축면적·연면적 (m²→평 변환)
5. 기성 지불 일정 — 가변 단계별 기성명·기성율·금액·지급예정일·상태(완료/예정)
6. 설계 도서 — 분류·규격·수량·비고 테이블
7. 최근 변경 내역 — 필드별 변경 이력 (역할 배지 + 변경 전/후 값)
8. 첨부 서류 — 다운로드 링크
9. UCanSign 카드 — 전자서명 상태, 서명 기한, 문서 ID

**우측 카드:**
- 계약 총액 + 한글 금액 (일금 OOO원정)
- 납부 내역 요약 (기성별 금액 분할)
- UCanSign 전자서명 배지
- 역할×상태별 CTA (계약서 수정 / 전자서명 / 서명 재요청)
- 파트너 메시지 버튼
- 문제 신고 링크
- 파트너 미니카드 (이름, 대표, 평점, 리뷰수)

### 4.10 계약 수정 (`/contracts/:id/edit`)

4.8 계약서 초안과 동일한 구조 + 아래 차이:

- **상단 상태 배너**: 사유별 안내 (서명거부: 거부 사유 표시 + 수정 유도, 서명만료: 기한 만료 안내)
- **기존 데이터 프리필**: 저장된 계약 조건·납부조건·설계도서·첨부파일 모두 로드
- **변경 이력 드로어**: 이전 편집 이력 포함하여 누적 표시 (필드명·역할·변경자·일시)
- **뒤로가기**: 계약서 상세(`/contracts/:id`)로 이동 (초안은 마이페이지)
- **액션**: 취소 · 임시저장 · 편집 완료 · 서명 재요청 (UCanSign)

### 4.11 전자서명 (`/contracts/:id/sign`)

| 섹션 | 내용 |
|------|------|
| UCanSign 안내 배너 | 법적 효력 안내 + 유캔사인 브랜딩 |
| 계약 요약 | 공사명, 계약금액(한글 변환), 갑·을, 서명요청일, 서명기한(D-day) |
| 서명 진행 스텝퍼 | 3단계: 서명요청 → 을 서명(건축사) → 갑 서명(건축주). 각 단계 done/active/pending 상태 |
| 서명자 정보 테이블 | 서명자명, 역할, 인증방식(카카오/이메일), 상태(서명대기·대기·서명완료·서명거부), 연락처, 서명일시 |
| 전자서명 액션 | 계약서 미리보기 · 유캔사인에서 서명하기 (본인 차례만 활성) · 상대방 서명 대기중 (비활성) |
| 부가 액션 | 서명 재요청 발송 (건축주만) · 서명 거부 (본인 차례만, 거부 사유 입력) |
| 절차 안내 | 5단계 설명 (문서 생성→을 안내→을 서명→갑 안내→양측 완료→PDF 생성) |

---

## 5. API 설계

### 5.1 입찰공고

| Method | Path | 설명 | 비고 |
|--------|------|------|------|
| GET | `/api/bids` | 목록 조회 | query: status, scope, region, use, fee_min, fee_max, sort, page, limit, keyword, active_only |
| GET | `/api/bids/:id` | 상세 조회 | 역할에 따라 참여사 정보 차등 반환 |
| POST | `/api/bids` | 등록 | body: site + building + categories + style + certs |
| PUT | `/api/bids/:id` | 수정 | 본인 공고, 종료 전만 가능 |
| PATCH | `/api/bids/:id/status` | 상태 변경 | body: { status } — 마감, 종료 등 |
| POST | `/api/bids/:id/like` | 관심 토글 | |
| DELETE | `/api/bids/:id/like` | 관심 해제 | |
| GET | `/api/bids/:id/invitations` | 지명 초대 목록 | 지명경쟁 공고에서 초대된 건축사 목록 |
| POST | `/api/bids/:id/invitations` | 지명 초대 추가 | body: { architect_id }. 건축주만, 지명경쟁만 |
| DELETE | `/api/bids/:id/invitations/:architectId` | 지명 초대 취소 | 건축주만 |
| PATCH | `/api/bids/:id/invitations/respond` | 초대 응답 | body: { status: 수락/거절 }. 건축사 본인만 |

### 5.2 제안서

| Method | Path | 설명 | 비고 |
|--------|------|------|------|
| GET | `/api/bids/:bidId/proposals` | 제안서 목록 | 건축주만 전체 조회 가능 |
| GET | `/api/bids/:bidId/proposals/:id` | 제안서 상세 | 건축주 또는 본인만 |
| POST | `/api/bids/:bidId/proposals` | 제안서 제출 | 건축사, 공고당 1건. 제한경쟁: `bid_restrictions` 조건 검증. 지명경쟁: `bid_invitations` 존재 검증 |
| PUT | `/api/bids/:bidId/proposals/:id` | 제안서 수정 | 본인, 선정 전만 |
| DELETE | `/api/bids/:bidId/proposals/:id` | 제안서 철회 | 본인, 선정 전만 |
| PATCH | `/api/bids/:bidId/proposals/:id/select` | 업체 선정 | 건축주만. 다른 제안서는 자동 미선정 |

### 5.3 계약 (chub 기반 플로우)

**계약 생성** (proposalId 기준 — 선정된 제안서에서 계약으로 전환):

| Method | Path | 설명 | 비고 |
|--------|------|------|------|
| POST | `/api/proposals/{proposalId}/contract` | 계약 요청 생성 | 건축주 → 건축사에게 계약 요청. 채팅 알림 발송. contract 레코드 생성 후 contractId 반환 |
| POST | `/api/proposals/{proposalId}/contract/accept` | 계약 요청 수락 | 건축사. 수락 후 편집중 상태로 전환 |
| POST | `/api/proposals/{proposalId}/contract/reject` | 계약 요청 거절 | 건축사 |

**계약 조작** (contractId 기준 — 생성 이후 모든 조작):

| Method | Path | 설명 | 비고 |
|--------|------|------|------|
| GET | `/api/contracts/{contractId}` | 계약 상세 조회 | 당사자만. contract + items + attachments |
| GET | `/api/contracts/{contractId}/items` | 계약 필드 조회 | 당사자만. contract_items 반환 |
| POST | `/api/contracts/{contractId}/items` | 계약 필드 저장 | 당사자. isEditable=true일 때만. 변경 이력 자동 생성 |
| GET | `/api/contracts/{contractId}/items/{itemId}/histories` | 필드 변경 이력 | 당사자만 |
| POST | `/api/contracts/{contractId}/items/mark-viewed` | 열람 표시 | ownerViewAt / partnerViewAt 갱신 |
| POST | `/api/contracts/{contractId}/finish` | 편집 완료 | 건축주만. isEditable=false. 건축사에게 알림 발송 |
| PATCH | `/api/contracts/{contractId}/editable` | 편집 잠금 토글 | 건축주만. 거부/만료 후 재편집 시 |
| POST | `/api/contracts/{contractId}/sign-request` | 서명 요청 | 건축주만. UCanSign 문서 생성 → 기성율 100% 검증 |
| POST | `/api/contracts/{contractId}/sign/resend` | 서명 재발송 | UCanSign reminder |

### 5.4 UCanSign 연동 (서버 프록시)

| Method | Path | 설명 | 비고 |
|--------|------|------|------|
| POST | `/api/ucansign/token` | UCanSign 토큰 발급 | 세션 인증 |
| POST | `/api/ucansign/templates/{templateId}` | 서명 문서 생성 | 계약 데이터를 UCanSign 필드로 매핑 |
| POST | `/api/ucansign/embedding/view/{docId}` | 서명 URL 발급 | iframe/redirect용 URL 반환 |
| POST | `/api/ucansign/document/{docId}/reminder` | 서명 재발송 | |

**UCanSign 웹훅 (수신):**

| Endpoint | 이벤트 | 처리 |
|----------|--------|------|
| POST `/api/webhooks/ucansign/signed` | 서명 완료 | contract status 갱신, 다음 서명자 알림 |
| POST `/api/webhooks/ucansign/rejected` | 서명 거부 | contract status → 거부 |

**UCanSign 필드 매핑 규칙:**
- 단순 필드: key → value 직접 매핑
- 면적 필드: m² → "000m² (000평)" 변환 (1m² ≈ 0.3025평)
- 금액 필드: 숫자 → "일금 OOO원정 (₩ X,XXX,XXX)" 한글 변환
- 공사유형: boolean 분리 (constructionType_new, constructionType_extension, ...)
- 계약일: year/month/day 분리
- 기성: 인덱스별 분리 (paymentMethod_paymentCondition_1, _progressRate_1, ...)
- 설계도서: 인덱스별 분리 (designDocuments_category_1, _spec_1, ...)

### 5.5 파일 업로드 (기존 presigned URL 패턴)

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/uploads/presigned` | Presigned PUT URL 발급 |
| POST | `/api/uploads/confirm` | 업로드 완료 확인 |

---

## 6. 권한 매트릭스

| 기능 | 게스트 | 건축주 | 건축사 |
|------|:---:|:---:|:---:|
| 공고 목록 조회 | ✓ | ✓ | ✓ |
| 공고 상세 조회 | △ 제한적 | ✓ | ✓ |
| 공고 등록 | ✕ | ✓ | ✕ |
| 공고 수정/종료 | ✕ | 본인만 | ✕ |
| 제안서 작성 | ✕ | ✕ | ✓ |
| 제안서 수정/철회 | ✕ | ✕ | 본인만 |
| 제안서 열람 | ✕ | 본인 공고 | 본인만 |
| 업체 선정 | ✕ | 본인 공고 | ✕ |
| 계약 초안 작성 | ✕ | ✓ | ✕ |
| 계약 조회 | ✕ | 당사자 | 당사자 |
| 계약 필드 편집 | ✕ | 당사자 (isEditable=true) | 당사자 (isEditable=true) |
| 편집 완료/잠금 | ✕ | 건축주만 | ✕ |
| 서명 요청 | ✕ | 건축주만 | ✕ |
| 전자서명 | ✕ | 당사자 (본인 차례) | 당사자 (본인 차례) |

---

## 7. 미구현 / 추가 설계 필요

| 항목 | 비고 |
|------|------|
| 백엔드 API 전체 | 현재 Mock 데이터 |
| 인증/인가 | 역할 분기 UI만 존재, JWT/세션 미구현 |
| 전자서명 연동 | UCanSign API 연동 구현 필요 (토큰 발급, 문서 생성, 웹훅 수신). 설계는 5.4절 참조 |
| 결제/에스크로 | 납부 일정 UI만 존재 |
| 채팅/메시지 | 버튼만 존재 |
| 알림 시스템 | 상태 변경 시 push/email 필요 |
| 계약서 PDF 생성 | 미리보기용 PDF 렌더링 |
| 파일 업로드 프론트 연동 | presigned URL 서버는 있으나 프론트 미연결 |
| 지도-입찰 연동 | 네이버 지도 페이지 존재, location.state 전달 구조만 |
| 검색 엔진 | 프론트 필터만, 서버 사이드 검색/인덱스 미구현 |
| 모바일 필터 | 사이드바 `hidden lg:block`, 모바일 필터 UI 없음 |
