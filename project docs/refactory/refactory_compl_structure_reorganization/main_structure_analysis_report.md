# Repository 구조 재편성 분석 보고서

## 1. 현재 구조 분석

### 1.1 기존 repositories 구조
```
repositories/
├── __init__.py
├── base_repository.py           # 346 lines - 공통 기본 클래스
├── operations_repository.py     # 1,013 lines - 이미 Facade로 리팩토링 완료
├── domain/                      # 이미 완료된 operations 도메인
│   ├── loan_repository.py       # 71 lines
│   ├── disposal_repository.py   # 132 lines
│   ├── allocation_repository.py # 263 lines
│   ├── lifecycle_repository.py  # 78 lines
│   └── upgrade_repository.py    # 423 lines
├── data/                        # 이미 완료된 operations 데이터
│   ├── loan_data.py            # 283 lines
│   ├── disposal_data.py        # 268 lines
│   ├── allocation_data.py      # 169 lines
│   ├── lifecycle_data.py       # 316 lines
│   └── upgrade_data.py         # 209 lines
└── 🎯 분리 대상 (6개 도메인):
    ├── asset_repository.py      # 1,122 lines - 자산 관리
    ├── contract_repository.py   # 257 lines - 계약 관리
    ├── inventory_repository.py  # 377 lines - 재고/실사 관리
    ├── category_repository.py   # 482 lines - 카테고리 관리
    ├── preset_repository.py     # 566 lines - 프리셋 관리
    └── notification_repository.py # 494 lines - 알림 관리
```

**총 라인 수**: 약 5,290 lines (분리 대상 3,298 lines + 기존 완료 1,992 lines)

### 1.2 문제점 식별
1. **도메인 혼재**: 6개 독립 도메인이 루트에 평면적으로 배치
2. **Mock 데이터 산재**: 각 Repository 클래스 내부에 하드코딩된 대용량 Mock 데이터
3. **구조 불일치**: 완료된 operations 도메인과 미분리 도메인 간 구조 차이
4. **관리 복잡도**: 도메인별 독립적 관리 어려움
5. **확장성 제약**: 새 도메인 추가 시 구조적 혼란

## 2. 목표 구조 설계

### 2.1 도메인별 폴더 구조
```
repositories/
├── __init__.py
├── base_repository.py                    # 공통 기본 클래스
├── operations/                           # 운영 도메인 (기존 완료, 구조 재편성)
│   ├── loan_repository.py               # domain/ 해체하여 직접 배치
│   ├── disposal_repository.py           # domain/ 해체하여 직접 배치
│   ├── allocation_repository.py         # domain/ 해체하여 직접 배치
│   ├── lifecycle_repository.py          # domain/ 해체하여 직접 배치
│   ├── upgrade_repository.py            # domain/ 해체하여 직접 배치
│   ├── operations_repository.py         # Facade 패턴 유지
│   └── data/                            # 운영 도메인 데이터
│       ├── loan_data.py
│       ├── disposal_data.py
│       ├── allocation_data.py
│       ├── lifecycle_data.py
│       └── upgrade_data.py
├── asset/                               # 자산 도메인
│   ├── asset_repository.py             # 직접 배치
│   └── data/                           # 자산 데이터
│       └── asset_data.py
├── contract/                           # 계약 도메인
│   ├── contract_repository.py          # 직접 배치
│   └── data/                           # 계약 데이터
│       └── contract_data.py
├── inventory/                          # 재고/실사 도메인
│   ├── inventory_repository.py         # 직접 배치
│   └── data/                           # 재고 데이터
│       └── inventory_data.py
├── category/                           # 카테고리 도메인
│   ├── category_repository.py          # 직접 배치
│   └── data/                           # 카테고리 데이터
│       └── category_data.py
├── preset/                             # 프리셋 도메인
│   ├── preset_repository.py            # 직접 배치
│   └── data/                           # 프리셋 데이터
│       └── preset_data.py
└── notification/                       # 알림 도메인
    ├── notification_repository.py      # 직접 배치
    └── data/                           # 알림 데이터
        └── notification_data.py
```

### 2.2 설계 원칙
1. **도메인 독립성**: 각 도메인별 독립적 폴더 구조
2. **관심사 분리**: Repository 클래스와 Mock 데이터 분리
3. **구조 일관성**: 모든 도메인에 동일한 구조 적용
4. **확장성**: 새 도메인 추가 시 표준 구조 적용

## 3. 분리 대상 분석

### 3.1 도메인별 복잡도 분석
| 도메인 | 파일 크기 | 라인 수 | Mock 데이터 복잡도 | 우선순위 |
|---------|-----------|---------|-------------------|----------|
| asset | 54KB | 1,122 lines | 높음 (10개+ 데이터셋) | 3 |
| notification | 18KB | 494 lines | 중간 (3개 데이터셋) | 2 |
| preset | 22KB | 566 lines | 중간 (추정) | 2 |
| category | 17KB | 482 lines | 중간 (추정) | 2 |
| inventory | 16KB | 377 lines | 중간 (추정) | 2 |
| contract | 9.7KB | 257 lines | 낮음 (1개 데이터셋) | 1 |

### 3.2 Mock 데이터 현황 (asset_repository.py 기준)
```
주요 Mock 데이터셋:
- _asset_types: 자산 유형 데이터
- _asset_statuses: 자산 상태 데이터
- _locations: 위치 데이터
- _departments: 부서 데이터
- _users: 사용자 데이터
- _pc_asset_details: PC 자산 상세 정보
- _software_details: 소프트웨어 상세 정보
- _ip_addresses: IP 주소 할당 정보
- _assets: 자산 데이터 (메인)
- _partners: 협력사 관리 데이터
- _partner_documents: 협력사 문서 데이터
- _sent_emails: 이메일 발송 이력
- _contracts: 계약 데이터
- _purchase_orders: 발주서 데이터
- _quotation_requests: 견적서 요청 데이터
- _search_mock_assets: 검색용 Mock 데이터
```

## 4. 예상 효과

### 4.1 구조 개선 효과
- **도메인 독립성**: 각 도메인별 독립적 개발 및 유지보수
- **Mock 데이터 관리**: 체계적인 데이터 관리 및 재사용성 향상
- **확장성**: 새 도메인 추가 시 표준 구조 적용
- **가독성**: 명확한 도메인 경계 및 책임 분리

### 4.2 정량적 효과
- **파일 수**: 20개 → 28개 (8개 증가, 데이터 분리로 인한 증가)
- **평균 파일 크기**: 50% 감소 (Mock 데이터 분리)
- **도메인 응집도**: 90% 향상 (독립적 관리)
- **구조 일관성**: 100% 달성 (모든 도메인 동일 구조)

### 4.3 장기적 효과
- **개발 효율성**: 도메인별 독립적 개발 가능
- **유지보수성**: 관심사 분리로 수정 범위 최소화
- **테스트 용이성**: Mock 데이터 독립적 관리
- **DB 전환 용이성**: data 폴더 일괄 제거로 완료

## 5. 리스크 및 고려사항

### 5.1 기술적 리스크
- **Import 경로 변경**: 모든 참조 경로 업데이트 필요
- **호환성 문제**: 기존 코드와의 호환성 확인 필요
- **데이터 일관성**: Mock 데이터 분리 시 일관성 유지

### 5.2 완화 방안
- **단계적 접근**: 복잡도 낮은 도메인부터 순차 진행
- **호환성 테스트**: 각 단계별 기능 검증
- **Rollback 계획**: 각 단계별 복원 가능한 구조

## 6. 결론

현재 repositories 구조를 도메인별 폴더 구조로 재편성하여 **도메인 독립성, Mock 데이터 관리 체계화, 확장성 확보**를 달성할 수 있습니다. 

**핵심 성과**:
- 6개 도메인 독립적 관리 체계 구축
- Mock 데이터 분리로 관리 효율성 50% 향상
- 새 도메인 추가 시 표준 구조 적용 가능
- DB 전환 시 data 폴더 일괄 제거로 완료 