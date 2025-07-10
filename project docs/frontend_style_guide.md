# Frontend Style Guide

## 프로젝트 개요

### 스타일 표준화 완료 현황
- **완료일**: 2025-01-10
- **적용 범위**: 전체 템플릿 및 CSS 파일
- **표준**: Bootstrap 5 완전 준수
- **BEM 형식**: 완전 제거 완료

---

## 핵심 원칙

### 1. Bootstrap 표준 100% 준수
**모든 UI 컴포넌트는 Bootstrap 5 표준 클래스를 사용해야 합니다.**

#### ✅ 올바른 사용법
```html
<!-- 버튼 -->
<button class="btn btn-primary">Primary Button</button>
<button class="btn btn-outline-secondary">Outline Button</button>
<button class="btn btn-sm btn-success">Small Success Button</button>

<!-- 배지 -->
<span class="badge bg-primary">Primary Badge</span>
<span class="badge bg-success">Success Badge</span>
<span class="badge rounded-pill bg-info">Pill Badge</span>
```

#### ❌ 금지된 사용법 (BEM 형식)
```html
<!-- 절대 사용 금지 -->
<button class="btn btn--primary">❌</button>
<button class="btn btn--outline btn--secondary">❌</button>
<span class="badge badge--success">❌</span>
<span class="badge badge--pill">❌</span>
```

### 2. BEM 형식 완전 금지
**2025-01-10부터 모든 BEM 형식 클래스 사용이 금지됩니다.**

#### 금지된 패턴
- `btn--*` (예: `btn--primary`, `btn--outline`)
- `badge--*` (예: `badge--success`, `badge--pill`)
- `card--*`, `form--*` 등 모든 BEM 형식

#### 대체 방안
BEM 형식 대신 Bootstrap 표준 utility 클래스 조합을 사용하세요.

---

## 컴포넌트별 가이드

### 버튼 (Buttons)

#### 기본 버튼
```html
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-success">Success</button>
<button class="btn btn-danger">Danger</button>
<button class="btn btn-warning">Warning</button>
<button class="btn btn-info">Info</button>
<button class="btn btn-light">Light</button>
<button class="btn btn-dark">Dark</button>
```

#### 아웃라인 버튼
```html
<button class="btn btn-outline-primary">Outline Primary</button>
<button class="btn btn-outline-secondary">Outline Secondary</button>
```

#### 크기 변형
```html
<button class="btn btn-lg btn-primary">Large</button>
<button class="btn btn-primary">Default</button>
<button class="btn btn-sm btn-primary">Small</button>
```

#### 복합 사용 예시
```html
<button class="btn btn-sm btn-outline-danger me-2">
    <i class="fas fa-trash"></i> 삭제
</button>
```

### 배지 (Badges)

#### 기본 배지
```html
<span class="badge bg-primary">Primary</span>
<span class="badge bg-secondary">Secondary</span>
<span class="badge bg-success">Success</span>
<span class="badge bg-danger">Danger</span>
<span class="badge bg-warning text-dark">Warning</span>
<span class="badge bg-info">Info</span>
<span class="badge bg-light text-dark">Light</span>
<span class="badge bg-dark">Dark</span>
```

#### 특수 형태
```html
<span class="badge rounded-pill bg-primary">Pill Badge</span>
<span class="badge bg-success">
    <i class="fas fa-check"></i> 승인완료
</span>
```

### 폼 컨트롤 (Form Controls)

#### 검증 상태
```html
<input type="text" class="form-control is-valid">
<input type="text" class="form-control is-invalid">
```

#### 크기 변형
```html
<input type="text" class="form-control form-control-lg">
<input type="text" class="form-control">
<input type="text" class="form-control form-control-sm">
```

---

## JavaScript 개발 가이드

### 동적 클래스 조작

#### ✅ 올바른 사용법
```javascript
// Bootstrap 표준 클래스 사용
element.classList.add('btn', 'btn-primary');
element.classList.remove('btn-secondary');
element.classList.toggle('is-invalid');

// Badge 생성
const badge = document.createElement('span');
badge.className = 'badge bg-success';
badge.textContent = '완료';

// 상태 변경
statusElement.className = `badge bg-${status === 'success' ? 'success' : 'danger'}`;
```

#### ❌ 금지된 사용법
```javascript
// BEM 형식 사용 금지
element.classList.add('btn--primary');     // ❌
element.classList.add('badge--success');   // ❌
```

### 템플릿 문자열에서 클래스 사용

#### ✅ 올바른 사용법
```javascript
const buttonHtml = `
    <button class="btn btn-sm btn-outline-primary me-2">
        <i class="fas fa-edit"></i> 수정
    </button>
`;

const badgeHtml = `<span class="badge bg-${type}">${text}</span>`;
```

---

## CSS 개발 가이드

### 커스텀 스타일 작성

#### 기본 원칙
1. Bootstrap 클래스를 최대한 활용
2. 커스텀 스타일은 Bootstrap 표준을 확장하는 방식으로 작성
3. BEM 형식 절대 사용 금지

#### ✅ 올바른 사용법
```css
/* Bootstrap 클래스 확장 */
.btn.btn-custom {
    background-color: var(--custom-color);
    border-color: var(--custom-color);
}

.badge.badge-custom {
    background-color: var(--custom-color);
    color: white;
}

/* 도메인 특화 클래스 (BEM 아님) */
.asset-status-badge {
    font-size: var(--font-size-xs);
    padding: var(--spacing-1) var(--spacing-3);
}

.status-in-use {
    background-color: rgba(var(--color-info-rgb), 0.1);
    color: var(--color-info);
}
```

#### ❌ 금지된 사용법
```css
/* BEM 형식 사용 금지 */
.btn--custom { }           /* ❌ */
.badge--custom { }         /* ❌ */
.card--special { }         /* ❌ */
```

---

## 마이그레이션 가이드

### 기존 BEM 코드 변경 방법

#### 버튼 변경
```html
<!-- Before (BEM) -->
<button class="btn btn--primary">버튼</button>
<button class="btn btn--outline btn--secondary">아웃라인</button>
<button class="btn btn--sm btn--success">작은 버튼</button>

<!-- After (Bootstrap) -->
<button class="btn btn-primary">버튼</button>
<button class="btn btn-outline-secondary">아웃라인</button>
<button class="btn btn-sm btn-success">작은 버튼</button>
```

#### 배지 변경
```html
<!-- Before (BEM) -->
<span class="badge badge--success">성공</span>
<span class="badge badge--pill badge--info">정보</span>

<!-- After (Bootstrap) -->
<span class="badge bg-success">성공</span>
<span class="badge rounded-pill bg-info">정보</span>
```

---

## 품질 관리

### 코드 리뷰 체크리스트

#### 템플릿 (.html) 파일
- [ ] 모든 버튼이 `btn btn-*` 형식을 사용하는가?
- [ ] 모든 배지가 `badge bg-*` 형식을 사용하는가?
- [ ] BEM 형식 클래스 (`--`)가 사용되지 않았는가?
- [ ] Bootstrap utility 클래스를 적절히 활용했는가?

#### CSS (.css) 파일
- [ ] 새로운 BEM 형식 클래스가 추가되지 않았는가?
- [ ] Bootstrap 표준을 확장하는 방식으로 작성되었는가?
- [ ] 커스텀 클래스명이 Bootstrap과 충돌하지 않는가?

#### JavaScript (.js) 파일
- [ ] 동적 클래스 조작에서 Bootstrap 표준을 사용하는가?
- [ ] BEM 형식 클래스를 생성하거나 조작하지 않는가?
- [ ] 템플릿 문자열에서 올바른 클래스를 사용하는가?

### 자동화 검증

#### 금지된 패턴 검색
```bash
# BEM 형식 클래스 사용 검사
grep -r "btn--\|badge--" app/templates/
grep -r "btn--\|badge--" app/static/js/

# 결과가 있으면 수정 필요 (demo 파일 제외)
```

---

## 도구 및 참고 자료

### 권장 도구
- **Bootstrap 5 Documentation**: https://getbootstrap.com/docs/5.0/
- **Bootstrap Icons**: https://icons.getbootstrap.com/
- **VS Code Extension**: Bootstrap 5 Quick Snippets

### 프로젝트 내 참고 파일
- **Style Guide 데모**: `http://localhost:5200/demo/style-guide`
- **Button 컴포넌트**: `app/static/css/components/buttons.css`
- **Badge 컴포넌트**: `app/static/css/components/badges.css`

---

## 버전 히스토리

### v1.0.0 (2025-01-10)
- Bootstrap 5 표준 완전 적용
- BEM 형식 완전 제거 완료
- 전체 템플릿 및 CSS 파일 표준화
- JavaScript 표준화 검증 완료

---

## 문의 및 지원

### 스타일 가이드 관련 문의
- **적용 범위**: 모든 신규 개발 및 기존 코드 수정
- **의무 준수**: 본 가이드의 모든 규칙은 필수 준수 사항
- **예외 사항**: 반드시 사전 승인 필요

### 추가 개선 제안
새로운 컴포넌트나 패턴이 필요한 경우, Bootstrap 표준 범위 내에서 제안해주세요. 