# 자산관리 시스템 리팩토링 프로젝트

## 프로젝트 개요
Flask 기반 자산관리 시스템의 프론트엔드 아키텍처 리팩토링 프로젝트입니다.

## 목표
- **44% 파일 수 감소**: 102개 → 58개
- **83% 코드 중복 제거**: 30% → <5%
- **38% 번들 크기 감소**: ~800KB → <500KB
- **40-50% 개발 생산성 향상**

## 새로운 폴더 구조

### CSS 아키텍처
```
app/static/css/
├── base/           # 기본 스타일 (토큰, 리셋, 글로벌)
├── components/     # 재사용 컴포넌트 (카드, 버튼, 폼)
├── layout/         # 레이아웃 시스템 (그리드, 플렉스)
├── templates/      # 페이지별 스타일
└── utilities/      # 유틸리티 클래스
```

### 템플릿 매크로
```
app/templates/macros/
├── cards.html      # 통계/정보 카드 매크로
├── forms.html      # 폼 컴포넌트 매크로
├── tables.html     # 테이블 컴포넌트 매크로
├── buttons.html    # 버튼 컴포넌트 매크로
└── layouts.html    # 레이아웃 매크로
```

## 백업 정보
- **기존 CSS 백업**: `app/static/css.backup/`
- **Git 브랜치**: `refactoring-phase1`
- **롤백 계획**: 각 단계별 커밋으로 안전한 롤백 지원

## 진행 상황

### ✅ Phase 1 Day 1-3 완료 (2024-01-26)
- ✅ Git 브랜치 전략 수립 (`refactoring-phase1`)
- ✅ 프로젝트 백업 완료 (`app/static/css.backup/`)
- ✅ 새 폴더 구조 생성 (base/, components/, layout/, templates/, utilities/)
- ✅ 빌드 도구 설정 완료 (Vite, PostCSS, Stylelint, Prettier)
- ✅ 디자인 토큰 시스템 구축 (212+ 변수, 다크모드 지원)
- ✅ 첫 번째 컴포넌트 시스템 구축 (카드 컴포넌트 + Jinja2 매크로)

### 🎯 달성 성과
- **컴포넌트 매크로**: 932개 카드 → 8개 재사용 매크로
- **디자인 토큰**: 포괄적인 토큰 시스템 (색상, 타이포그래피, 간격, 그림자)
- **접근성**: WCAG 2.1 AA 수준 고려사항 적용
- **반응형**: 모바일 우선 반응형 디자인
- **다크모드**: 시스템 환경설정 자동 감지 지원

### 📁 새로 생성된 파일
- `app/static/css/base/tokens.css` - 디자인 토큰 시스템
- `app/static/css/base/reset.css` - 모던 CSS 리셋
- `app/static/css/components/cards.new.css` - 새 카드 컴포넌트
- `app/templates/macros/cards.html` - Jinja2 카드 매크로
- `test_components.html` - 컴포넌트 테스트 파일

## 다음 단계 (Phase 1 Week 2)
1. 버튼 컴포넌트 시스템 구축 (113개 패턴 → 통합 시스템)
2. 폼 컴포넌트 시스템 구축 (327개 필드 → 표준 매크로)
3. 테이블 컴포넌트 표준화
4. 페이지별 CSS 통합 및 리팩토링