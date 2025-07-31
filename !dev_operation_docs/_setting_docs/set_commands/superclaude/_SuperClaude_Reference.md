# SuperClaude 공식 커맨드 및 플래그 완전 레퍼런스 가이드

## 📋 공식 커맨드 17개 완전 정리

### 🔨 개발 명령어 (Development Commands)

#### `/sc:workflow` - 구현 워크플로우 생성기
```bash
구문: /sc:workflow [PRD파일|기능설명] [플래그]
용도: PRD 및 기능 요구사항을 분석하여 단계별 구현 워크플로우 생성
```
**전용 플래그:**
- `--strategy systematic|mvp` - 구현 전략
- `--output detailed|roadmap|tasks` - 출력 형식
- `--risks` - 위험 평가 포함
- `--dependencies` - 의존성 매핑 포함

**자동 활성화:** architect, security, frontend, backend 페르소나 + Context7, Sequential MCP

**예시:**
```bash
/sc:workflow docs/feature-100-prd.md --strategy systematic --c7 --sequential
/sc:workflow "user authentication system" --persona security --output detailed
```

#### `/sc:implement` - 기능 구현
```bash
구문: /sc:implement [기능설명] [플래그]
용도: 기능, 컴포넌트, API, 서비스 구현 (v2의 /build 기능 대체)
```
**전용 플래그:**
- `--type component|api|service|feature|module` - 구현 타입
- `--framework react|vue|express|django|etc` - 대상 프레임워크
- `--iterative` - 단계별 개발 및 검증
- `--with-tests` - 테스트 구현 포함
- `--documentation` - 문서 생성 포함

**자동 활성화 패턴:**
- Frontend: UI 컴포넌트 → frontend persona + Magic MCP
- Backend: API, 서비스 → backend persona + Context7
- Security: 인증, 결제 → security persona + 검증
- Complex: 다단계 구현 → Sequential MCP + architect persona

**예시:**
```bash
/sc:implement user authentication --type feature --with-tests
/sc:implement dashboard component --type component --framework react
/sc:implement REST API for orders --type api --safe
```

#### `/sc:build` - 프로젝트 빌드
```bash
구문: /sc:build [대상] [플래그]
용도: 프로젝트 빌드, 컴파일, 패키징 및 배포 준비
```
**전용 플래그:**
- `--type dev|prod|test` - 빌드 타입
- `--clean` - 클린 빌드 (기존 산출물 제거)
- `--optimize` - 빌드 최적화 활성화

**예시:**
```bash
/sc:build --type prod --optimize --clean
/sc:build src/components --verbose
```

#### `/sc:design` - 시스템 및 컴포넌트 설계
```bash
구문: /sc:design [설계대상] [플래그]
용도: 시스템 아키텍처, API 설계, 컴포넌트 명세 생성
```
**전용 플래그:**
- `--type architecture|api|component|database` - 설계 유형
- `--format diagram|spec|code` - 출력 형식
- `--iterative` - 반복적 설계 개선

**예시:**
```bash
/sc:design --type api user-management
/sc:design --format spec chat-system
```

---

### 🔍 분석 명령어 (Analysis Commands)

#### `/sc:analyze` - 코드 분석
```bash
구문: /sc:analyze [대상] [플래그]
용도: 코드 품질, 보안, 성능, 아키텍처 종합 분석
```
**전용 플래그:**
- `--focus quality|security|performance|architecture` - 분석 초점
- `--depth quick|deep` - 분석 깊이
- `--format text|json|report` - 출력 형식

**자동 활성화 패턴:**
- 보안 관련 코드 → security 전문가
- UI 컴포넌트 → frontend 전문가  
- API/데이터베이스 → backend 전문가
- 성능 이슈 → performance 전문가

**예시:**
```bash
/sc:analyze --focus security --depth deep src/auth/
/sc:analyze --focus performance src/api/ --format report
```

#### `/sc:troubleshoot` - 문제 조사
```bash
구문: /sc:troubleshoot [문제설명] [플래그]
용도: 체계적 디버깅 및 문제 조사
```
**전용 플래그:**
- `--logs <파일>` - 로그 파일 분석 포함
- `--systematic` - 구조화된 디버깅 접근
- `--focus network|database|frontend` - 조사 영역

**예시:**
```bash
/sc:troubleshoot "login not working" --logs error.log
/sc:troubleshoot --focus database "slow queries" --systematic
```

#### `/sc:explain` - 교육적 설명
```bash
구문: /sc:explain [주제|코드] [플래그]
용도: 코드, 개념, 기술에 대한 교육적 설명
```
**전용 플래그:**
- `--beginner` - 초보자 친화적 설명
- `--advanced` - 기술적 심화 설명
- `--code <파일>` - 특정 코드 설명
- `--examples` - 실용적 예시 포함

**예시:**
```bash
/sc:explain --beginner "what is REST API"
/sc:explain --code src/auth.js --advanced
```

---

### ✨ 품질 명령어 (Quality Commands)

#### `/sc:improve` - 코드 개선
```bash
구문: /sc:improve [대상] [플래그]  
용도: 코드 품질, 성능, 유지보수성 체계적 개선
```
**전용 플래그:**
- `--type quality|performance|maintainability|style` - 개선 유형

**예시:**
```bash
/sc:improve --type performance --safe src/api/
/sc:improve --preview src/components/LegacyComponent.js
```

#### `/sc:cleanup` - 기술 부채 감소
```bash
구문: /sc:cleanup [대상] [플래그]
용도: 데드코드 제거, 파일 구조 정리
```
**전용 플래그:**
- `--dead-code` - 미사용 코드 제거
- `--imports` - import 구문 정리
- `--files` - 파일 구조 재정리

**예시:**
```bash
/sc:cleanup --dead-code --safe src/utils/
/sc:cleanup --imports src/components/
```

#### `/sc:test` - 테스팅 및 품질 보증
```bash
구문: /sc:test [대상] [플래그]
용도: 테스트 실행, 커버리지 분석, 테스트 품질 관리
```
**전용 플래그:**
- `--type unit|integration|e2e|all` - 테스트 유형
- `--coverage` - 커버리지 리포트 생성
- `--watch` - 워치 모드 (개발용)
- `--fix` - 실패 테스트 자동 수정 시도

**예시:**
```bash
/sc:test --type unit --coverage
/sc:test --watch src/components/
```

---

### 📝 문서화 명령어 (Documentation Commands)

#### `/sc:document` - 집중적 문서화
```bash
구문: /sc:document [대상] [플래그]
용도: 컴포넌트, 함수, 기능별 문서 생성
```
**전용 플래그:**
- `--type inline|external|api|guide` - 문서 유형
- `--style brief|detailed` - 상세도
- `--template` - 특정 템플릿 사용

**예시:**
```bash
/sc:document --type api src/controllers/
/sc:document --style detailed --type guide user-onboarding
```

---

### 📊 프로젝트 관리 명령어 (Project Management Commands)

#### `/sc:estimate` - 프로젝트 추정
```bash
구문: /sc:estimate [작업설명] [플래그]
용도: 시간, 노력, 복잡도 추정
```
**전용 플래그:**
- `--detailed` - 상세 작업 분해
- `--complexity` - 기술적 복잡도 분석
- `--team-size <n>` - 팀 규모 고려

**예시:**
```bash
/sc:estimate --detailed "implement payment system"
/sc:estimate --complexity --team-size 3 "migrate to microservices"
```

#### `/sc:task` - 장기 프로젝트 관리
```bash
구문: /sc:task [동작] [작업설명] [플래그]
용도: 다중 세션 개발 작업 및 기능 관리
```
**전용 플래그:**
- `create` - 새 장기 작업 생성
- `status` - 현재 작업 상태 확인
- `breakdown` - 대형 작업을 소작업으로 분해
- `--priority high|medium|low` - 작업 우선순위

**예시:**
```bash
/sc:task create "migrate from REST to GraphQL" --priority high
/sc:task breakdown "e-commerce checkout flow"
```

#### `/sc:spawn` - 복합 운영 조정
```bash
구문: /sc:spawn [복합작업] [플래그]
용도: 다단계, 다도구 운영 및 워크플로우 조정
```
**전용 플래그:**
- `--parallel` - 가능한 병렬 실행
- `--sequential` - 순차 실행 강제
- `--monitor` - 진행 상황 모니터링

**예시:**
```bash
/sc:spawn --parallel "test and deploy to staging"
/sc:spawn setup-ci-cd --monitor
```

---

### 🔄 버전 관리 명령어 (Version Control Commands)

#### `/sc:git` - 향상된 Git 운영
```bash
구문: /sc:git [git명령] [플래그]
용도: 지능형 커밋 메시지 및 워크플로우 최적화
```
**전용 플래그:**
- `--smart-commit` - 지능형 커밋 메시지 생성
- `--branch-strategy` - 브랜치 명명 규칙 적용
- `--interactive` - 복합 작업용 대화형 모드

**예시:**
```bash
/sc:git --smart-commit "fixed login bug"  
/sc:git branch feature/user-dashboard --branch-strategy
```

---

### 🔧 유틸리티 명령어 (Utility Commands)

#### `/sc:index` - 명령어 탐색
```bash
구문: /sc:index [검색어] [플래그]
용도: 작업에 적합한 명령어 찾기 및 탐색
```
**전용 플래그:**
- `--category <카테고리>` - 카테고리별 필터링
- `--search <용어>` - 명령어 설명 검색

**예시:**
```bash
/sc:index --search "performance"
/sc:index --category quality
```

#### `/sc:load` - 프로젝트 컨텍스트 로드
```bash
구문: /sc:load [대상] [플래그]
용도: 프로젝트 구조 및 컨텍스트 분석
```
**전용 플래그:**
- `--deep` - 종합적 프로젝트 분석
- `--focus <영역>` - 특정 프로젝트 영역 집중
- `--summary` - 프로젝트 요약 생성

**예시:**
```bash
/sc:load --deep --summary
/sc:load src/components/ --focus architecture
```

---

## 🏁 공통 플래그 (모든 명령어 사용 가능)

### 🧠 계획 및 분석 플래그
```bash
--plan          # 실행 계획 표시
--think         # 다중 파일 분석 (~4K 토큰)
--think-hard    # 깊은 아키텍처 분석 (~10K 토큰)  
--ultrathink    # 최대 깊이 분석 (~32K 토큰)
```

### ⚡ 효율성 및 제어 플래그
```bash
--uc / --ultracompressed    # 60-80% 토큰 압축
--safe                      # 안전 모드 (저위험 변경만)
--preview                   # 미리보기 (실제 변경 안함)
--validate                  # 사전 검증 및 위험 평가
--verbose                   # 상세 출력
--answer-only              # 작업 생성 없이 직접 응답
```

### 🎭 페르소나 플래그 (전문가 활성화)
```bash
--persona-architect        # 시스템 아키텍트 전문가
--persona-frontend         # UX 전문가, 접근성 옹호자
--persona-backend          # 신뢰성 엔지니어, API 전문가
--persona-analyzer         # 근본 원인 전문가
--persona-security         # 위협 모델러, 취약점 전문가
--persona-mentor           # 지식 전달 전문가
--persona-refactorer       # 코드 품질 전문가
--persona-performance      # 최적화 전문가
--persona-qa               # 품질 옹호자, 테스팅 전문가
--persona-devops           # 인프라 전문가
--persona-scribe=lang      # 전문 작가, 문서화 전문가
```

### 🔗 MCP 서버 플래그
```bash
--c7 / --context7         # Context7 (라이브러리 문서 조회)
--seq / --sequential      # Sequential (복잡한 다단계 분석)
--magic                   # Magic (UI 컴포넌트 생성)
--play / --playwright     # Playwright (크로스브라우저 자동화)
--all-mcp                # 모든 MCP 서버 동시 활성화
--no-mcp                 # 모든 MCP 서버 비활성화
--no-[서버명]           # 특정 MCP 서버 비활성화
```

### 🎯 범위 및 초점 플래그
```bash
--scope file|module|project|system    # 분석 범위
--focus domain                         # 집중 영역 지정
```

### 🔄 반복 개선 플래그
```bash
--loop                    # 반복 개선 모드 활성화
--iterations [n]          # 개선 사이클 횟수 (기본: 3)
--interactive            # 사이클 간 사용자 확인
```

### 🔍 위임 및 파일 플래그 
```bash
--delegate files|folders|auto    # 서브 에이전트 위임 활성화
--concurrency [n]                # 최대 동시 서브 에이전트 수 (기본: 7)
```

---

## 📊 플래그 우선순위 규칙

1. **안전 플래그** (`--safe-mode`) > 최적화 플래그
2. **명시적 플래그** > 자동 활성화
3. **사고 깊이**: `--ultrathink` > `--think-hard` > `--think`
4. **`--no-mcp`**가 모든 개별 MCP 플래그보다 우선
5. **범위**: system > project > module > file
6. **마지막 지정된 페르소나**가 우선
7. **Wave 모드**: `--wave-mode off` > `--wave-mode force` > `--wave-mode auto`
8. **서브 에이전트 위임**: 명시적 `--delegate` > 자동 감지
9. **루프 모드**: 명시적 `--loop` > 개선 키워드 기반 자동 감지
10. **`--uc` 자동 활성화**가 verbose 플래그보다 우선

---

## 🎯 자동 활성화 트리거

### MCP 서버 자동 활성화
- **Context7**: 외부 라이브러리 import, 프레임워크 질문, 문서화 요청
- **Sequential**: 복잡한 디버깅, 시스템 설계, `--think` 플래그 사용 시
- **Magic**: UI 컴포넌트 요청, 디자인 시스템 질문, frontend 페르소나
- **Playwright**: 테스팅 워크플로우, 성능 모니터링, QA 페르소나

### 페르소나 자동 활성화
- **성능 이슈** → `--persona-performance` + `--focus performance`
- **보안 관련** → `--persona-security` + `--focus security` 
- **UI/UX 작업** → `--persona-frontend` + `--magic`
- **복잡한 디버깅** → `--persona-analyzer` + `--think` + `--seq`

---

## 📝 문법 및 작성 규칙

### 기본 구문
```bash
/sc:[command] [arguments] [--flags]
```

### 자연어 사용 규칙
- **공백 포함 시**: 따옴표 필수 `"user authentication system"`
- **특수문자 포함 시**: 따옴표 필수 `"API returning 500 errors"`
- **한국어 사용 시**: 따옴표 권장 `"관리자 대시보드"`

### 멀티라인 구문
```bash
/sc:implement "복잡한 기능" --type feature --safe \
# 요구사항 1 \
# 요구사항 2 \
# 요구사항 3
```

---

## 📋 한눈에 보는 빠른 참조 테이블

### 🎯 명령어 카테고리별 빠른 참조

| 카테고리 | 명령어 | 주요 용도 | 핵심 플래그 | 자동 활성화 |
|---------|--------|-----------|-------------|------------|
| **🔨 개발** | `/sc:workflow` | PRD → 구현 워크플로우 | `--strategy`, `--output` | architect, Context7, Sequential |
| | `/sc:implement` | 기능/컴포넌트 구현 | `--type`, `--framework`, `--with-tests` | domain별 persona + MCP |
| | `/sc:build` | 프로젝트 빌드/패키징 | `--type`, `--clean`, `--optimize` | frontend/backend persona |
| | `/sc:design` | 시스템/API 설계 | `--type`, `--format` | architect persona |
| **🔍 분석** | `/sc:analyze` | 코드 종합 분석 | `--focus`, `--depth`, `--format` | domain별 전문가 |
| | `/sc:troubleshoot` | 문제 조사/디버깅 | `--logs`, `--systematic` | analyzer persona + Sequential |
| | `/sc:explain` | 교육적 설명 | `--beginner`, `--advanced`, `--code` | mentor persona |
| **✨ 품질** | `/sc:improve` | 코드 개선/최적화 | `--type`, `--safe`, `--preview` | quality 전문가들 |
| | `/sc:cleanup` | 기술부채 제거 | `--dead-code`, `--imports` | refactorer persona |
| | `/sc:test` | 테스팅/품질보증 | `--type`, `--coverage`, `--watch` | qa persona + Playwright |
| **📝 문서** | `/sc:document` | 문서 생성 | `--type`, `--style` | scribe persona + Context7 |
| **📊 관리** | `/sc:estimate` | 프로젝트 추정 | `--detailed`, `--complexity` | analyzer + architect persona |
| | `/sc:task` | 장기 프로젝트 관리 | `create`, `status`, `breakdown` | architect persona |
| | `/sc:spawn` | 복합 작업 조정 | `--parallel`, `--monitor` | 모든 도구 조정 |
| **🔄 Git** | `/sc:git` | Git 워크플로우 | `--smart-commit`, `--branch-strategy` | devops persona |
| **🔧 유틸** | `/sc:index` | 명령어 탐색 | `--category`, `--search` | 도움말 시스템 |
| | `/sc:load` | 프로젝트 컨텍스트 | `--deep`, `--summary` | analyzer + architect |

### 🏁 공통 플래그 카테고리별 참조

| 카테고리 | 플래그 | 설명 | 토큰 사용량 | 적용 범위 |
|---------|--------|------|-------------|----------|
| **🧠 사고** | `--plan` | 실행 계획 표시 | 기본 | 모든 명령어 |
| | `--think` | 다중 파일 분석 | ~4K | 복잡한 분석 |
| | `--think-hard` | 깊은 아키텍처 분석 | ~10K | 시스템 레벨 |
| | `--ultrathink` | 최대 깊이 분석 | ~32K | 최고 복잡도 |
| **⚡ 제어** | `--safe` | 안전 모드 (저위험만) | 기본 | 변경 작업 |
| | `--preview` | 미리보기 (변경 안함) | 기본 | 변경 작업 |
| | `--validate` | 사전 검증 | 추가 | 위험 작업 |
| | `--uc` | 토큰 60-80% 압축 | 절약 | 모든 명령어 |
| **🎭 전문가** | `--persona-architect` | 시스템 아키텍트 | 기본 | 설계/구조 |
| | `--persona-security` | 보안 전문가 | 기본 | 보안 관련 |
| | `--persona-frontend` | UX/접근성 전문가 | 기본 | UI/UX 작업 |
| | `--persona-backend` | 신뢰성/API 전문가 | 기본 | 서버/DB |
| | `--persona-performance` | 최적화 전문가 | 기본 | 성능 작업 |
| **🔗 MCP** | `--c7` | 라이브러리 문서 | 2-5K | 문서/패턴 |
| | `--seq` | 복잡한 분석 | 4-10K | 다단계 분석 |
| | `--magic` | UI 컴포넌트 생성 | 2-8K | 프론트엔드 |
| | `--play` | 브라우저 자동화 | 3-7K | 테스팅/E2E |

### 🎯 자동 활성화 매트릭스

| 트리거 키워드/상황 | 활성화되는 페르소나 | 활성화되는 MCP | 추가 플래그 |
|------------------|------------------|---------------|------------|
| `auth`, `login`, `security` | security | Sequential | `--validate` |
| `component`, `UI`, `React` | frontend | Magic | `--c7` |
| `API`, `database`, `server` | backend | Context7 | `--seq` |
| `performance`, `slow`, `optimize` | performance | Sequential | `--think` |
| `test`, `coverage`, `e2e` | qa | Playwright | `--seq` |
| `document`, `README`, `guide` | scribe | Context7 | - |
| `debug`, `error`, `troubleshoot` | analyzer | Sequential | `--think` |
| `deploy`, `build`, `CI/CD` | devops | - | `--safe` |

### 📊 플래그 조합 추천 패턴

| 작업 유형 | 추천 조합 | 설명 | 예시 |
|----------|-----------|------|------|
| **안전한 개선** | `--safe --preview` | 위험 최소화 | `/sc:improve --safe --preview src/` |
| **보안 검토** | `--focus security --persona-security --validate` | 종합 보안 분석 | `/sc:analyze --focus security --persona-security --validate` |
| **성능 최적화** | `--focus performance --persona-performance --think` | 체계적 성능 분석 | `/sc:improve --focus performance --persona-performance --think` |
| **UI 컴포넌트 생성** | `--type component --framework react --magic --safe` | 안전한 컴포넌트 구현 | `/sc:implement --type component --framework react --magic --safe` |
| **복잡한 분석** | `--ultrathink --seq --all-mcp` | 최대 분석 능력 | `/sc:analyze --ultrathink --seq --all-mcp complex-system/` |
| **프로덕션 배포** | `--type prod --safe --validate` | 안전한 프로덕션 빌드 | `/sc:build --type prod --safe --validate` |

---

이 문서는 SuperClaude 공식 문서를 기반으로 작성된 완전한 레퍼런스 가이드입니다. 모든 17개 명령어와 플래그가 공식 문서에서 추출되어 정리되었습니다.