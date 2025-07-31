# 📋 자산 등록/수정 폼 설계 명세서

**문서명**: Asset Registration/Edit Form Design Specification  
**버전**: v1.0  
**작성일**: 2025-01-31  
**작성자**: Claude Code SuperClaude Framework

---

## 📖 **1. 개요**

### **1.1 목적**
엔터프라이즈급 자산관리 시스템의 핵심 컴포넌트인 자산 등록/수정 폼의 설계 명세를 정의합니다.

### **1.2 범위**
- HTML 템플릿 구조 및 필드 정의
- JavaScript 동적 로직 및 상호작용
- CSS 스타일링 및 반응형 디자인
- API 연동 및 데이터 처리

### **1.3 시스템 요구사항**
- **브라우저**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **디바이스**: 데스크톱, 태블릿, 모바일 (반응형)
- **네트워크**: RESTful API 연동
- **보안**: XSS 방지, CSRF 보호, 파일 업로드 검증

---

## 🏗️ **2. 아키텍처 설계**

### **2.1 전체 구조**
```
assets/
├── form.html           (1,123 lines) - 메인 HTML 템플릿
├── js/
│   ├── form.js        (227 lines)   - 공통 유틸리티
│   └── form-dynamic.js (946 lines)  - 동적 로직 컨트롤러
└── css/
    └── form.css       (152 lines)   - 스타일시트
```

### **2.2 아키텍처 패턴**
- **MVC 패턴**: Model(API) + View(HTML/CSS) + Controller(JavaScript)
- **이벤트 기반**: addEventListener를 통한 반응형 상호작용
- **모듈화 설계**: AssetFormDynamic 클래스 중심 구조

### **2.3 기술 스택**
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **UI Framework**: Bootstrap 5.x
- **API**: RESTful API (JSON)
- **파일 처리**: FormData, FileReader API

---

## 📝 **3. 데이터 모델**

### **3.1 주요 엔티티**

#### **Asset (자산)**
```javascript
{
  // 기본 정보
  assetNumber: String (required),      // 자산번호
  assetName: String (required),        // 자산명
  assetCategory: String (required),    // 자산유형
  assetStatus: String (required),      // 자산상태
  manufacturer: String,                // 제조사
  modelName: String,                   // 모델명
  serialNumber: String,                // 시리얼번호
  
  // 구매 정보
  purchaseDate: Date,                  // 구매일
  purchasePrice: Number,               // 구매가격
  purchaseVendor: String,              // 구매처
  purchaseManager: String,             // 담당자
  
  // 감가상각 정보
  usefulLife: Number,                  // 내용연수
  initialSalvageValue: Number,         // 잔존가액
  depreciationStartDate: Date,         // 감가상각시작일
  currentBookValue: Number (computed), // 현재장부가액
  
  // 관리 정보
  department: String,                  // 사용부서
  user: String,                        // 사용자
  location: String,                    // 설치위치
  manager: String,                     // 관리담당자
  
  // 동적 필드 (자산유형별)
  dynamicFields: Object,               // 유형별 전용 필드
  
  // 파일 정보
  assetImage: File,                    // 대표이미지
  documents: File[],                   // 관련문서
  
  // 추가 정보
  customFields: [{                     // 사용자정의필드
    name: String,
    value: String
  }],
  notes: String,                       // 비고
  
  // 시스템 정보
  createdAt: Date,
  updatedAt: Date,
  createdBy: String,
  updatedBy: String
}
```

### **3.2 동적 필드 스키마**

#### **IT_EQUIPMENT**
```javascript
{
  processor: String,        // 프로세서
  memory: String,          // 메모리
  storage: String,         // 저장장치
  operatingSystem: String, // 운영체제
  networkInfo: String,     // 네트워크정보
  software: [String]       // 소프트웨어목록
}
```

#### **NETWORK_EQUIPMENT**
```javascript
{
  portCount: Number,          // 포트수
  networkSpeed: String,       // 네트워크속도
  supportedProtocols: String  // 지원프로토콜
}
```

*(기타 유형별 스키마 생략)*

---

## 🎨 **4. UI/UX 설계**

### **4.1 레이아웃 구조**
```html
<div class="container-fluid">
  <div class="row">
    <!-- 메인 폼 영역 (col-lg-9) -->
    <div class="col-lg-9">
      <form id="assetForm">
        <!-- 기본 정보 카드 -->
        <div class="card mb-4">...</div>
        
        <!-- 동적 필드 컨테이너 -->
        <div id="dynamicFieldsContainer">...</div>
        
        <!-- 소프트웨어 관리 (IT장비 전용) -->
        <div id="softwareManagementContainer">...</div>
        
        <!-- 구매/재무 정보 -->
        <div class="card mb-4">...</div>
        
        <!-- 파일 업로드 -->
        <div class="card mb-4">...</div>
      </form>
    </div>
    
    <!-- 사이드바 가이드 (col-lg-3) -->
    <div class="col-lg-3">
      <div id="categoryGuide">...</div>
      <div id="barcodeQrDisplay">...</div>
    </div>
  </div>
</div>
```

### **4.2 반응형 브레이크포인트**
- **Desktop**: ≥1200px (col-lg-9/3)
- **Tablet**: 768px-1199px (col-md-12)
- **Mobile**: <768px (스택형 레이아웃)

### **4.3 시각적 피드백**
- **로딩 상태**: 스피너 + 로딩 텍스트
- **유효성 검사**: `.is-valid` / `.is-invalid` 클래스
- **토스트 알림**: 성공/경고/오류별 색상 구분
- **애니메이션**: fade-in + slide-up (300ms)

---

## ⚙️ **5. 기능 명세**

### **5.1 핵심 기능**

#### **동적 필드 관리**
```javascript
// 자산 유형 변경 시 동적 필드 제어
handleAssetTypeChange(assetType) {
  1. hideAllDynamicFields()        // 모든 동적 필드 숨김
  2. showSelectedTypeFields()      // 선택된 유형 필드 표시
  3. toggleSoftwareContainer()     // IT장비 시 소프트웨어 컨테이너
  4. animateFieldsIn()            // 부드러운 애니메이션
  5. updateSidebarGuide()         // 사이드바 가이드 업데이트
}
```

#### **소프트웨어 관리 시스템**
```javascript
// 실시간 소프트웨어 검색 (IT장비 전용)
searchSoftware(query, category) {
  - API: GET /api/software/search?q=${query}&category=${category}
  - 디바운싱: 300ms
  - 결과 표시: 드롭다운 목록
  - 선택 관리: 배열 기반 다중 선택
  - 중복 체크: ID 기반 중복 방지
}
```

#### **실시간 계산 엔진**
```javascript
// 감가상각 자동 계산 (정액법)
calculateDepreciation() {
  depreciableBase = purchasePrice - initialSalvageValue
  annualDepreciation = depreciableBase / usefulLife
  elapsedYears = (현재일 - 감가상각시작일) / 365.25
  accumulatedDepreciation = annualDepreciation * elapsedYears
  currentBookValue = max(purchasePrice - accumulatedDepreciation, initialSalvageValue)
}
```

#### **QR코드 생성**
```javascript
// 자산번호 기반 실시간 QR코드 생성
generateQRCode(assetNumber) {
  - 외부 API: qrserver.com
  - 크기: 100x100px
  - 디바운싱: 500ms
  - 표시: 이미지 + 라벨
}
```

### **5.2 파일 처리**

#### **이미지 업로드**
- **지원 형식**: JPEG, JPG, PNG, GIF
- **최대 크기**: 5MB
- **미리보기**: FileReader API 활용
- **검증**: 클라이언트 사이드 형식/크기 체크

#### **문서 업로드**
- **지원 형식**: PDF, DOC, DOCX, XLS, XLSX
- **다중 선택**: 지원
- **미리보기**: 파일명 + 크기 표시

### **5.3 사용자 정의 필드**
```javascript
// 동적 커스텀 필드 추가
addCustomField() {
  - 필드명 입력 (placeholder: "예: 구매처, 담당자")
  - 필드값 입력
  - 삭제 버튼 포함
  - 무제한 추가 가능
}
```

---

## 🔌 **6. API 연동**

### **6.1 엔드포인트**

#### **소프트웨어 관련**
```
GET /api/software/search
- Parameters: q (query), category (optional)
- Response: { success: boolean, software: Array }

GET /api/software/popular
- Parameters: limit, category (optional)
- Response: { success: boolean, software: Array }

GET /api/software/categories  
- Response: { success: boolean, categories: Array }
```

#### **자산 관련**
```
POST /assets/create
- Body: FormData (multipart/form-data)
- Files: assetImage, documents[]
- Response: { success: boolean, asset: Object }

PUT /assets/{id}
- Body: FormData (multipart/form-data)
- Response: { success: boolean, asset: Object }
```

### **6.2 에러 처리**
```javascript
// API 호출 에러 처리 패턴
try {
  const response = await fetch(url);
  const data = await response.json();
  if (data.success) {
    // 성공 처리
  } else {
    // 비즈니스 로직 에러
    this.displayError(data.message);
  }
} catch (error) {
  // 네트워크 에러  
  this.displayError('네트워크 오류가 발생했습니다.');
}
```

---

## 🚀 **7. 성능 최적화**

### **7.1 최적화 기법**

#### **디바운싱**
- **소프트웨어 검색**: 300ms
- **QR코드 생성**: 500ms
- **감가상각 계산**: 1000ms

#### **조건부 로딩**
- 동적 필드: 선택된 유형만 표시
- 소프트웨어 컨테이너: IT장비 시에만 활성화
- API 호출: 필요한 경우에만 실행

#### **캐싱 전략**
- 소프트웨어 카테고리: 세션 캐시
- 선택된 소프트웨어: 메모리 배열
- 검색 결과: 단기 캐시

### **7.2 성능 목표**
- **초기 로딩**: < 2초
- **API 응답**: < 500ms
- **UI 반응성**: < 100ms
- **파일 업로드**: 진행률 표시

---

## 🔒 **8. 보안 명세**

### **8.1 보안 기법**

#### **XSS 방지**
```javascript
// URL 파라미터 인코딩
const url = `/api/software/search?q=${encodeURIComponent(query)}`;

// HTML 삽입 시 이스케이프
element.textContent = userInput; // innerHTML 대신 사용
```

#### **파일 업로드 보안**
```javascript
// 클라이언트 검증
const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
const maxSize = 5 * 1024 * 1024; // 5MB

if (!allowedTypes.includes(file.type)) {
  throw new Error('지원하지 않는 파일 형식입니다.');
}
if (file.size > maxSize) {
  throw new Error('파일 크기가 너무 큽니다.');
}
```

#### **CSRF 보호**
- 표준 HTML form 기반 제출
- CSRF 토큰 포함 (서버 사이드)
- SameSite 쿠키 설정

### **8.2 데이터 검증**
- **클라이언트**: 실시간 유효성 검사
- **서버**: 이중 검증 (필수)
- **파일**: 형식, 크기, 내용 검증

---

## 🧪 **9. 테스트 명세**

### **9.1 단위 테스트**
```javascript
describe('AssetFormDynamic', () => {
  test('handleAssetTypeChange - IT장비 선택 시 소프트웨어 컨테이너 표시', () => {
    // Given
    const formDynamic = new AssetFormDynamic();
    
    // When
    formDynamic.handleAssetTypeChange('IT_EQUIPMENT');
    
    // Then
    expect(softwareContainer.classList.contains('d-none')).toBe(false);
  });
  
  test('calculateDepreciation - 정액법 계산 정확성', () => {
    // 계산 로직 테스트
  });
});
```

### **9.2 통합 테스트**
- API 연동 테스트
- 파일 업로드 테스트
- 폼 제출 테스트

### **9.3 E2E 테스트**
- 사용자 시나리오 기반 테스트
- 브라우저 호환성 테스트
- 반응형 디자인 테스트

---

## 📱 **10. 접근성**

### **10.1 WCAG 2.1 AA 준수**
- **키보드 탐색**: 모든 인터랙티브 요소
- **스크린 리더**: ARIA 레이블, 역할 정의
- **색상 대비**: 4.5:1 이상
- **포커스 표시**: 명확한 포커스 링

### **10.2 ARIA 속성**
```html
<div role="alert" aria-live="polite" id="formErrors"></div>
<input aria-describedby="helpText" aria-required="true">
<button aria-expanded="false" aria-controls="dropdown">
```

---

## 🔄 **11. 유지보수성**

### **11.1 코드 구조**
- **모듈화**: 기능별 메서드 분리
- **설정 분리**: 하드코딩 최소화
- **문서화**: JSDoc 주석 활용

### **11.2 확장성**
- **새로운 자산 유형**: 설정 추가만으로 확장
- **커스텀 필드**: 무제한 확장 가능
- **API 엔드포인트**: RESTful 패턴 준수

### **11.3 모니터링**
- **에러 로깅**: 클라이언트 에러 추적
- **성능 모니터링**: 로딩 시간, API 응답
- **사용자 행동**: 폼 완성률, 이탈 지점

---

## 📊 **12. 품질 지표**

### **12.1 기술적 품질**
- **코드 커버리지**: ≥ 80%
- **성능 점수**: ≥ 90 (Lighthouse)
- **접근성 점수**: ≥ 95 (WAVE)
- **보안 점수**: A등급 (OWASP)

### **12.2 사용자 경험**
- **폼 완성률**: ≥ 85%
- **에러율**: ≤ 5%
- **사용자 만족도**: ≥ 4.5/5.0
- **응답 시간**: ≤ 2초

---

## 🎯 **13. 배포 및 운영**

### **13.1 배포 요구사항**
- **웹서버**: Nginx/Apache
- **HTTPS**: 필수 (파일 업로드 보안)
- **CDN**: 정적 리소스 최적화
- **캐싱**: 브라우저 캐시 + 서버 캐시

### **13.2 운영 모니터링**
- **가용성**: 99.9% 목표
- **응답시간**: 평균 500ms 이하
- **에러율**: 0.1% 이하
- **동시사용자**: 1000명 지원

---

## 📚 **14. 참고 문서**

- **기획 문서**: `/project_files/asset_solution_renewal/planing/final_domain_function_mapping.md`
- **API 문서**: Swagger/OpenAPI 스펙
- **디자인 가이드**: UI/UX 스타일 가이드
- **보안 정책**: 기업 보안 정책 문서

---

**문서 작성**: Claude Code SuperClaude Framework  
**검토 완료**: 2025-01-31  
**다음 검토**: 분기별 업데이트