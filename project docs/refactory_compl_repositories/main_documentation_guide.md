# 개발문서 작성 가이드

## 📋 개요

본 가이드는 asset_solution 프로젝트의 모든 개발문서 작성 표준과 규칙을 정의합니다. 일관성 있는 문서화를 통해 프로젝트의 유지보수성과 가독성을 향상시키는 것이 목적입니다.

---

## 📁 문서 구조 및 네이밍 규칙

### 📂 디렉토리 구조
```
asset_solution_docs/
├── main_*.md                    # 메인 개발문서 (프리픽스 main_)
├── dev_*.md                     # 개발 참조문서 (프리픽스 dev_)
└── satellite_projects_docs/     # 위성 프로젝트 문서 (별도 관리)
```

### 📝 파일 네이밍 규칙

#### 메인 개발문서 (main_ 프리픽스)
- **목적**: 프로젝트 핵심 정보, 최종 결과물, 가이드
- **명명 규칙**: `main_{주제}_{문서유형}.md`
- **예시**:
  - `main_repository_development_log.md` - 메인 개발 로그
  - `main_repository_development_guide.md` - 메인 개발 가이드
  - `main_repository_structure_improvement_plan.md` - 메인 구조 개선 계획서
  - `main_facade_pattern_error_analysis.md` - 메인 오류 분석 보고서

#### 개발 참조문서 (dev_ 프리픽스)
- **목적**: 개발 과정에서 생성된 분석 자료, 임시 문서
- **명명 규칙**: `dev_{주제}_{문서유형}.md`
- **예시**:
  - `dev_domain_function_classification.md` - 도메인 함수 분류
  - `dev_page_repository_mapping.md` - 페이지 매핑 분석
  - `dev_repository_dependency_analysis.md` - 의존성 분석
  - `dev_repository_target_structure_design.md` - 목표 구조 설계

#### 위성 프로젝트 문서
- **목적**: 메인 프로젝트에서 파생된 별도 프로젝트 문서
- **위치**: `satellite_projects_docs/` 하위 디렉토리
- **관리**: 메인 문서와 분리하여 별도 관리

---

## 📖 문서 작성 표준

### 🎯 문서 구조 템플릿

#### 메인 개발문서 구조
```markdown
# 문서 제목

## 📋 프로젝트 개요
### 🎯 목표
### ✅ 완료 상태

## 🏆 주요 성과
### 📊 정량적 성과
### 🎯 기술적 성과

## 📚 상세 내용
[구체적 내용]

## 📞 참고 문서
[관련 문서 링크]

---
**최종 업데이트**: YYYY-MM-DD
```

#### 개발 참조문서 구조
```markdown
# 문서 제목

## 1. 분석 개요
[분석 목적 및 범위]

## 2. 상세 분석 결과
[구체적 분석 내용]

## 3. 결론 및 권장사항
[분석 결과 요약]

---
**작성일**: YYYY-MM-DD
**관련 메인 문서**: [링크]
```

### 🎨 마크다운 스타일 가이드

#### 헤더 사용 규칙
```markdown
# 문서 제목 (H1 - 문서당 1개만)
## 주요 섹션 (H2)
### 하위 섹션 (H3)
#### 세부 항목 (H4 - 최대 깊이)
```

#### 이모지 사용 규칙
- **금지**: 본문 내용에서 이모지 사용 절대 금지
- **허용**: 헤더와 목록 아이템의 시각적 구분을 위해서만 사용
- **권장 이모지**:
  - 📋 개요, 목록
  - 🎯 목표, 핵심
  - ✅ 완료, 성공
  - 📊 데이터, 통계
  - 🔧 기술, 구현
  - 📚 문서, 가이드
  - 🎉 완료, 성과

#### 표 작성 규칙
```markdown
| 항목 | 이전 | 현재 | 개선도 |
|------|------|------|--------|
| **파일 수** | 25개 | 12개 | **52% 감소** ✅ |
```

#### 코드 블록 규칙
```markdown
# 인라인 코드
`operations_repository.py`

# 코드 블록
```python
def example_function():
    return "Hello World"
```
```

#### 체크리스트 규칙
```markdown
### ✅ 완료된 작업
- [x] **구조 개선**: 모노리스 → 도메인 분리 완료
- [x] **오류 해결**: 100% (4/4 페이지 정상 작동)
- [ ] **향후 작업**: 추가 최적화 예정
```

---

## 📝 문서 유형별 작성 가이드

### 📋 개발 로그 (Development Log)
- **목적**: 프로젝트 진행 과정의 상세 기록
- **구조**: 시간순 작업 기록, Task별 상세 내용
- **필수 포함 사항**:
  - Task ID 및 제목
  - 작업 날짜
  - 수행 내용
  - 결과 및 성과
  - 다음 단계

### 📖 개발 가이드 (Development Guide)
- **목적**: 향후 개발자를 위한 가이드라인
- **구조**: 개요 → 구조 설명 → 사용법 → 주의사항
- **필수 포함 사항**:
  - 프로젝트 개요
  - 기술 스택 및 구조
  - 개발 가이드라인
  - 베스트 프랙티스
  - 참고 문서

### 📊 분석 보고서 (Analysis Report)
- **목적**: 기술적 분석 결과 정리
- **구조**: 분석 목적 → 방법론 → 결과 → 결론
- **필수 포함 사항**:
  - 분석 배경 및 목적
  - 분석 방법론
  - 상세 분석 결과
  - 결론 및 권장사항

### 📋 계획서 (Project Plan)
- **목적**: 프로젝트 계획 및 진행 상황
- **구조**: 목표 → 계획 → 진행 현황 → 결과
- **필수 포함 사항**:
  - 프로젝트 목표
  - 상세 계획
  - 진행 현황
  - 성과 측정

---

## 🔄 문서 관리 프로세스

### 📅 문서 생명주기

#### 1. 계획 단계
- **dev_** 프리픽스로 분석 문서 작성
- 임시 문서로 아이디어 및 분석 내용 기록

#### 2. 개발 단계
- **main_** 프리픽스로 메인 문서 작성
- 개발 진행에 따라 지속적 업데이트

#### 3. 완료 단계
- 메인 문서 최종 업데이트
- dev_ 문서는 참조용으로 보관

#### 4. 유지보수 단계
- 필요시 메인 문서만 업데이트
- 주요 변경사항은 새로운 문서로 관리

### 📝 문서 업데이트 규칙

#### 실시간 업데이트 대상
- **main_repository_development_log.md**: 모든 작업 완료 후 즉시 업데이트
- **main_repository_development_guide.md**: 구조 변경 시 즉시 업데이트

#### 단계별 업데이트 대상
- **main_repository_structure_improvement_plan.md**: 주요 마일스톤 완료 후 업데이트
- **분석 보고서**: 분석 완료 후 일괄 업데이트

#### 최종 업데이트 대상
- **dev_** 프리픽스 문서: 프로젝트 완료 후 최종 정리

---

## 📊 품질 관리

### ✅ 문서 품질 체크리스트

#### 내용 품질
- [ ] 목적과 범위가 명확히 정의되었는가?
- [ ] 기술적 내용이 정확하고 최신 상태인가?
- [ ] 코드 예시가 실제 동작하는가?
- [ ] 참조 링크가 유효한가?

#### 구조 품질
- [ ] 문서 구조가 템플릿을 따르는가?
- [ ] 헤더 계층이 논리적으로 구성되었는가?
- [ ] 목차가 내용과 일치하는가?
- [ ] 3뎁스 이상의 계층 구조를 피했는가?

#### 스타일 품질
- [ ] 마크다운 문법이 올바른가?
- [ ] 이모지 사용 규칙을 준수했는가?
- [ ] 표와 코드 블록이 적절히 사용되었는가?
- [ ] 일관된 용어를 사용했는가?

### 🔍 문서 검토 프로세스

#### 자체 검토
1. **내용 검토**: 기술적 정확성 및 완성도
2. **구조 검토**: 문서 구조 및 논리적 흐름
3. **스타일 검토**: 마크다운 문법 및 스타일 가이드 준수

#### 최종 검토
1. **전체 일관성**: 다른 문서와의 일관성 확인
2. **참조 무결성**: 문서 간 링크 및 참조 확인
3. **완성도 확인**: 필수 섹션 포함 여부 확인

---

## 📚 현재 문서 인벤토리

### 📂 메인 개발문서 (main_ 프리픽스) - 5개

| 문서명 | 크기 | 목적 | 상태 |
|--------|------|------|------|
| **main_documentation_guide.md** | 8.6KB (291 lines) | 문서 작성 가이드 | ✅ 완료 |
| **main_repository_development_log.md** | 26KB (607 lines) | Repository 리팩토링 개발 로그 | ✅ 완료 |
| **main_repository_development_guide.md** | 5.2KB (133 lines) | Repository 개발 가이드 | ✅ 완료 |
| **main_repository_structure_improvement_plan.md** | 8.7KB (210 lines) | Repository 구조 개선 최종 보고서 | ✅ 완료 |
| **main_facade_pattern_error_analysis.md** | 8.6KB (266 lines) | Facade 패턴 오류 분석 보고서 | ✅ 완료 |

### 📂 개발 참조문서 (dev_ 프리픽스) - 4개

| 문서명 | 크기 | 목적 | 상태 |
|--------|------|------|------|
| **dev_repository_target_structure_design.md** | 14KB (376 lines) | 목표 구조 상세 설계 | ✅ 완료 |
| **dev_domain_function_classification.md** | 9.1KB (265 lines) | 도메인별 함수 분류 분석 | ✅ 완료 |
| **dev_page_repository_mapping.md** | 7.9KB (187 lines) | 페이지별 Repository 매핑 | ✅ 완료 |
| **dev_repository_dependency_analysis.md** | 4.9KB (128 lines) | Repository 의존성 분석 | ✅ 완료 |

### 📊 문서 통계

- **총 문서 수**: 9개
- **총 문서 크기**: 약 102KB
- **총 라인 수**: 2,463 lines
- **메인 문서 비율**: 55.6% (5/9)
- **참조 문서 비율**: 44.4% (4/9)
- **완료율**: 100% (9/9)

### 📋 문서 관계도

```
Repository 리팩토링 프로젝트 문서 구조
│
├── 📋 메인 문서 (프로젝트 핵심)
│   ├── main_documentation_guide.md ← 현재 문서
│   ├── main_repository_development_log.md ← 전체 진행 기록
│   ├── main_repository_development_guide.md ← 개발 가이드
│   ├── main_repository_structure_improvement_plan.md ← 최종 보고서
│   └── main_facade_pattern_error_analysis.md ← 오류 분석
│
└── 📂 참조 문서 (분석 자료)
    ├── dev_repository_target_structure_design.md ← 구조 설계
    ├── dev_domain_function_classification.md ← 함수 분류
    ├── dev_page_repository_mapping.md ← 페이지 매핑
    └── dev_repository_dependency_analysis.md ← 의존성 분석
```

### 🔗 문서 간 참조 관계

#### 메인 문서 참조 체인
1. **main_repository_development_log.md** (중심 문서)
   - ← **main_facade_pattern_error_analysis.md** (오류 분석 상세)
   - → **main_repository_development_guide.md** (향후 가이드)
   - → **main_repository_structure_improvement_plan.md** (최종 보고서)

#### 참조 문서 지원 관계
- **dev_repository_dependency_analysis.md** → 프로젝트 시작점 분석
- **dev_domain_function_classification.md** → 도메인 분리 근거
- **dev_page_repository_mapping.md** → 영향도 분석
- **dev_repository_target_structure_design.md** → 구조 설계 상세

---

## 📚 참고 자료

### 🔗 관련 문서
- **메인 개발 로그**: `main_repository_development_log.md`
- **메인 개발 가이드**: `main_repository_development_guide.md`
- **메인 구조 개선 계획**: `main_repository_structure_improvement_plan.md`

### 📖 마크다운 참고 자료
- [GitHub Flavored Markdown](https://github.github.com/gfm/)
- [Markdown Guide](https://www.markdownguide.org/)

### 🎯 문서화 베스트 프랙티스
- **명확성**: 기술적 내용을 이해하기 쉽게 설명
- **간결성**: 불필요한 내용 제거, 핵심만 포함
- **일관성**: 동일한 스타일과 구조 유지
- **완성도**: 필요한 모든 정보 포함
- **유지보수성**: 향후 업데이트가 용이하도록 구조화

---

## 📞 문의 및 개선

### 🔧 가이드 개선
- 새로운 문서 유형 추가 시 가이드 업데이트
- 스타일 가이드 개선 사항 반영
- 품질 체크리스트 보완

### 📝 문서 작성 지원
- 템플릿 제공 및 예시 문서 참조
- 마크다운 도구 및 에디터 권장사항
- 문서 작성 시 참고할 수 있는 체크리스트

---

**📋 문서화 가이드** ✅  
**최종 업데이트**: 2024-12-30  
**버전**: v1.0  
**다음 업데이트**: 프로젝트 구조 변경 또는 새로운 문서 유형 추가 시 