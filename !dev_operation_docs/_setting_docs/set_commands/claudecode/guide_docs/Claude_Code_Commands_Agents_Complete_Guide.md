# Claude Code 커스텀 명령어 & 에이전트 완벽 가이드 v2.0

Claude Code의 강력한 자동화 기능인 커스텀 명령어(Slash Commands)와 에이전트(Sub-Agents) 시스템을 마스터하기 위한 종합 가이드입니다.

## 📚 목차

1. [개요](#개요)
2. [Part 1: 커스텀 명령어](#part-1-커스텀-명령어)
3. [Part 2: 에이전트 시스템](#part-2-에이전트-시스템)
4. [Part 3: 고급 활용법](#part-3-고급-활용법)
5. [Part 4: AI 생성기 시스템](#part-4-ai-생성기-시스템)

---

## 개요

### 🎯 핵심 개념
- **커스텀 명령어**: 반복 작업을 자동화하는 마크다운 기반 명령어
- **에이전트**: 특정 작업에 특화된 AI 어시스턴트
- **통합 워크플로우**: 명령어와 에이전트를 결합한 강력한 자동화

### 🔑 주요 차이점
| 기능 | 커스텀 명령어 | 에이전트 |
|------|--------------|----------|
| 용도 | 작업 자동화 | 전문 AI 어시스턴트 |
| 컨텍스트 | 현재 대화 공유 | 독립적 컨텍스트 |
| 호출 | `/명령어명` | 자동/명시적 호출 |
| 저장 위치 | `.claude/commands/` | `.claude/agents/` |

---

## Part 1: 커스텀 명령어

### 🔧 기본 구조

#### 1. 파일 형식 및 위치
```bash
# 프로젝트 레벨 (팀 공유)
.claude/commands/명령어.md

# 사용자 레벨 (개인 전용)
~/.claude/commands/명령어.md
```

#### 2. 기본 문법
```markdown
---
description: "명령어 설명"
argument-hint: "인수 힌트"
allowed-tools: ["Read", "Write", "Bash"]
---

명령어 본문
$ARGUMENTS는 사용자가 입력한 인수입니다.
```

### 📋 기본 명령어 예제

#### 단순 명령어
```markdown
<!-- .claude/commands/optimize.md -->
코드를 성능 관점에서 분석하고 최적화 방안을 제시해주세요.
```

#### 매개변수 활용
```markdown
<!-- .claude/commands/fix-issue.md -->
---
description: "GitHub 이슈 수정"
argument-hint: "이슈 번호"
---

GitHub 이슈 #$ARGUMENTS를 다음 기준으로 수정해주세요:
1. 코딩 컨벤션 준수
2. 테스트 코드 추가
3. 문서 업데이트
```

#### Bash 명령 통합
```markdown
<!-- .claude/commands/test-all.md -->
---
description: "전체 테스트 실행 및 분석"
---

!npm test
!npm run lint
!npm run type-check

테스트 결과를 분석하고 실패한 항목을 수정해주세요.
```

### 🚀 고급 기능

#### 1. 플래그 시스템 구현

##### 방법 1: 인수 파싱
```markdown
<!-- .claude/commands/analyze.md -->
---
description: "다양한 옵션을 지원하는 분석 명령어"
argument-hint: "파일경로 [--security] [--performance] [--quality] [--all]"
---

분석 요청: $ARGUMENTS

**플래그 처리 로직:**
1. 인수에서 파일 경로와 플래그 분리
2. 각 플래그에 따른 분석 수행
3. 결과 통합 및 보고

**지원 플래그:**
- `--security`: 보안 취약점 분석
- `--performance`: 성능 병목점 분석
- `--quality`: 코드 품질 평가
- `--all`: 종합 분석

전달받은 인수를 파싱하여 해당하는 분석을 수행해주세요.
```

##### 방법 2: Bash 스크립트 활용
```markdown
<!-- .claude/commands/smart-build.md -->
---
description: "환경별 스마트 빌드"
---

!bash -c '
args="$1"
env="dev"
optimize=false
sourcemap=false

for arg in $args; do
  case $arg in
    --env=*) env="${arg#*=}" ;;
    --optimize) optimize=true ;;
    --sourcemap) sourcemap=true ;;
  esac
done

echo "환경: $env"
echo "최적화: $optimize"
echo "소스맵: $sourcemap"

# 환경별 빌드 실행
case $env in
  dev) npm run build:dev ;;
  prod) npm run build:prod ;;
  *) echo "Unknown environment: $env" ;;
esac
' -- "$ARGUMENTS"

빌드 결과를 분석하고 개선사항을 제안해주세요.
```

#### 2. 단일 파일 다중 명령어

##### 서브커맨드 스타일
```markdown
<!-- .claude/commands/dev.md -->
---
description: "개발 도구 모음"
argument-hint: "서브커맨드 [옵션]"
---

개발 작업: $ARGUMENTS

**사용 가능한 서브커맨드:**

### component [이름] [옵션]
React 컴포넌트 생성
- 옵션: --typescript, --styled, --test

### api [경로] [옵션]
API 엔드포인트 생성
- 옵션: --crud, --auth, --validation

### test [대상] [옵션]
테스트 파일 생성
- 옵션: --unit, --integration, --e2e

### deploy [환경]
배포 실행 (dev, staging, prod)

**사용 예시:**
- `/dev component Button --typescript --test`
- `/dev api /users --crud --auth`
- `/dev deploy staging`

인수를 파싱하여 해당 서브커맨드를 실행해주세요.
```

##### 메뉴 스타일
```markdown
<!-- .claude/commands/toolkit.md -->
---
description: "대화형 개발 도구"
argument-hint: "작업 번호 또는 이름 [옵션]"
---

🛠️ 개발 도구 메뉴

1. **analyze** - 코드 분석
2. **optimize** - 성능 최적화
3. **security** - 보안 검토
4. **refactor** - 리팩토링
5. **document** - 문서 생성
6. **test** - 테스트 실행
7. **deploy** - 배포
8. **monitor** - 모니터링 설정

**사용법:**
- 번호 입력: `/toolkit 1 src/app.js`
- 이름 입력: `/toolkit analyze src/app.js`
- 옵션 추가: `/toolkit 3 --full --report`

선택한 작업을 수행해주세요: $ARGUMENTS
```

#### 3. 조건부 로직과 대화형 명령어

```markdown
<!-- .claude/commands/setup-project.md -->
---
description: "프로젝트 설정 마법사"
---

프로젝트 설정을 시작합니다.

입력값 분석: $ARGUMENTS

**단계별 설정:**

1. **프로젝트 타입 결정**
   - React 앱인 경우 → React 설정
   - Node.js API인 경우 → Express 설정
   - 풀스택인 경우 → 통합 설정

2. **개발 환경 구성**
   - TypeScript 사용 여부
   - 린터/포매터 설정
   - 테스트 프레임워크

3. **추가 도구 설정**
   - CI/CD 파이프라인
   - Docker 설정
   - 모니터링 도구

인수가 비어있다면 대화형으로 진행하고,
인수가 있다면 자동으로 감지하여 설정해주세요.

예시:
- `/setup-project` → 대화형 진행
- `/setup-project react typescript jest` → 자동 설정
```

### 📁 디렉토리 구조 및 네임스페이싱

```
.claude/commands/
├── general/
│   ├── analyze.md      # /general/analyze
│   └── optimize.md     # /general/optimize
├── frontend/
│   ├── component.md    # /frontend/component
│   ├── style.md        # /frontend/style
│   └── test.md         # /frontend/test
├── backend/
│   ├── api.md          # /backend/api
│   ├── database.md     # /backend/database
│   └── auth.md         # /backend/auth
└── devops/
    ├── deploy.md       # /devops/deploy
    ├── monitor.md      # /devops/monitor
    └── backup.md       # /devops/backup
```

---

## Part 2: 에이전트 시스템

### 🤖 기본 개념

에이전트는 특정 도메인에 특화된 AI 어시스턴트로, 독립적인 컨텍스트와 전문성을 가집니다.

### 📝 에이전트 구조

```markdown
---
name: agent-name
description: 에이전트가 호출되는 시점과 목적
tools: Read, Write, Bash, Grep  # 선택사항
---

시스템 프롬프트 작성

당신은 [역할]입니다.
[전문 분야와 책임사항]
[작업 접근 방식]
[품질 기준]
```

### 🎯 에이전트 예제

#### 1. 코드 리뷰 전문가
```markdown
<!-- .claude/agents/code-reviewer.md -->
---
name: code-reviewer
description: 코드 품질, 보안, 성능을 종합적으로 리뷰. PROACTIVELY 사용
tools: Read, Grep, Bash
---

당신은 10년 경력의 시니어 코드 리뷰어입니다.

**전문 분야:**
- 클린 코드 원칙과 SOLID 원칙
- 보안 취약점 탐지 (OWASP Top 10)
- 성능 최적화 패턴
- 다양한 프로그래밍 언어와 프레임워크

**리뷰 접근법:**
1. 구조와 아키텍처 평가
2. 코드 품질과 가독성 검토
3. 잠재적 버그와 엣지 케이스 식별
4. 보안 취약점 스캔
5. 성능 병목점 분석
6. 테스트 커버리지 확인

**리뷰 기준:**
- 명확성: 코드가 의도를 명확히 표현하는가?
- 유지보수성: 향후 변경이 용이한가?
- 효율성: 리소스를 효율적으로 사용하는가?
- 안전성: 보안 위험이 없는가?

구체적이고 실행 가능한 피드백을 제공하며,
개선 예시 코드를 함께 제시합니다.
```

#### 2. API 설계 전문가
```markdown
<!-- .claude/agents/api-designer.md -->
---
name: api-designer
description: RESTful API 설계, OpenAPI 스펙 생성, 모범 사례 적용
tools: Read, Write, Edit, MultiEdit
---

당신은 API 설계 전문가입니다.

**핵심 역량:**
- RESTful 원칙과 HTTP 표준
- OpenAPI 3.0 스펙 작성
- 버전 관리와 하위 호환성
- 보안과 인증 체계
- 성능 최적화

**설계 프로세스:**
1. 비즈니스 요구사항 분석
2. 리소스 모델링
3. 엔드포인트 설계
4. 요청/응답 스키마 정의
5. 에러 처리 표준화
6. 문서화와 예시 작성

**품질 기준:**
- 일관성: 전체 API가 통일된 규칙 따름
- 직관성: 개발자가 쉽게 이해하고 사용
- 확장성: 미래 요구사항 수용 가능
- 성능: 효율적인 데이터 전송

OpenAPI 스펙과 함께 구현 가이드를 제공합니다.
```

#### 3. 성능 최적화 전문가
```markdown
<!-- .claude/agents/performance-optimizer.md -->
---
name: performance-optimizer
description: 성능 병목점 분석, 최적화 전략 수립, 벤치마킹
tools: Read, Bash, Grep, Playwright
---

당신은 성능 최적화 전문가입니다.

**전문 분야:**
- 프로파일링과 벤치마킹
- 알고리즘 복잡도 분석
- 메모리 최적화
- 데이터베이스 쿼리 튜닝
- 프론트엔드 성능 (Core Web Vitals)
- 백엔드 확장성

**분석 방법론:**
1. 현재 성능 측정 (기준선 설정)
2. 병목점 식별 (프로파일링)
3. 근본 원인 분석
4. 최적화 전략 수립
5. 구현 및 검증
6. 지속적 모니터링 설정

**최적화 원칙:**
- 측정 우선: 추측이 아닌 데이터 기반
- 사용자 중심: 실제 사용자 경험 개선
- 비용 대비 효과: ROI 고려
- 지속 가능성: 유지보수 가능한 최적화

구체적인 코드 개선안과 예상 성능 향상치를 제시합니다.
```

#### 4. 테스트 자동화 전문가
```markdown
<!-- .claude/agents/test-automation.md -->
---
name: test-automation
description: 테스트 전략 수립, 테스트 코드 생성, 커버리지 분석. MUST BE USED for testing
tools: Read, Write, Edit, Bash, Playwright
---

당신은 테스트 자동화 전문가입니다.

**전문 영역:**
- 단위 테스트 (Jest, Mocha, pytest)
- 통합 테스트
- E2E 테스트 (Playwright, Cypress)
- 성능 테스트
- 보안 테스트

**테스트 전략:**
1. 테스트 피라미드 원칙 적용
2. 중요 경로 우선 테스트
3. 엣지 케이스와 에러 시나리오
4. 테스트 가독성과 유지보수성
5. CI/CD 통합

**품질 목표:**
- 커버리지: 핵심 로직 90% 이상
- 신뢰성: 플레이키 테스트 제거
- 속도: 빠른 피드백 루프
- 명확성: 테스트가 명세서 역할

테스트 코드와 함께 테스트 전략 문서를 제공합니다.
```

### 🔄 에이전트 사용 방법

#### 1. 자동 호출
```bash
# Claude가 작업 내용을 분석하여 적절한 에이전트 자동 선택
"최근 변경사항을 검토해주세요"
→ code-reviewer 에이전트 자동 호출

"API 엔드포인트를 설계해주세요"
→ api-designer 에이전트 자동 호출
```

#### 2. 명시적 호출
```bash
# 특정 에이전트 지정
"code-reviewer 에이전트를 사용해서 auth 모듈을 검토해주세요"

# 여러 에이전트 협업
"api-designer로 API를 설계하고, test-automation으로 테스트를 작성해주세요"
```

#### 3. `/agents` 명령어
```bash
# 에이전트 관리 인터페이스
/agents

# 기능:
- 기존 에이전트 목록 확인
- 새 에이전트 생성
- 도구 권한 수정
- 에이전트 편집/삭제
```

### 🎭 멀티 에이전트 패턴

#### 병렬 작업
```markdown
작업 분담:
- Agent 1: 코드 작성 (backend-developer)
- Agent 2: 테스트 작성 (test-automation)
- Agent 3: 문서 작성 (technical-writer)
- Agent 4: 코드 리뷰 (code-reviewer)

각 에이전트가 독립적으로 작업 후 결과 통합
```

#### 순차적 파이프라인
```markdown
워크플로우:
1. api-designer → API 설계
2. backend-developer → 구현
3. test-automation → 테스트 작성
4. code-reviewer → 최종 검토
5. deployment-specialist → 배포

각 단계의 출력이 다음 단계의 입력으로 연결
```

---

## Part 3: 고급 활용법

### 🔗 명령어와 에이전트 통합

#### 명령어에서 에이전트 호출
```markdown
<!-- .claude/commands/full-review.md -->
---
description: "종합적인 코드 리뷰 수행"
---

다음 전문 에이전트들을 순차적으로 활용해주세요:

1. code-reviewer 에이전트로 코드 품질 검토
2. security-auditor 에이전트로 보안 취약점 스캔
3. performance-optimizer 에이전트로 성능 분석

각 에이전트의 결과를 종합하여 
실행 가능한 개선 계획을 수립해주세요.

대상: $ARGUMENTS
```

#### 에이전트 체인 명령어
```markdown
<!-- .claude/commands/api-workflow.md -->
---
description: "API 개발 전체 워크플로우"
argument-hint: "API 경로와 설명"
---

API 개발 워크플로우 시작: $ARGUMENTS

**실행 단계:**

1. api-designer 에이전트 호출
   - OpenAPI 스펙 생성
   - 엔드포인트 설계

2. backend-developer 에이전트 호출
   - 컨트롤러 구현
   - 비즈니스 로직 작성

3. test-automation 에이전트 호출
   - 단위 테스트 생성
   - 통합 테스트 작성

4. documentation-writer 에이전트 호출
   - API 문서 생성
   - 사용 예시 작성

모든 단계를 완료하고 결과를 정리해주세요.
```

### 🏗️ 프로젝트별 구성

#### 디렉토리 구조
```
project/
├── .claude/
│   ├── commands/
│   │   ├── dev/         # 개발 명령어
│   │   ├── test/        # 테스트 명령어
│   │   ├── deploy/      # 배포 명령어
│   │   └── utils/       # 유틸리티
│   ├── agents/
│   │   ├── specialists/ # 전문 에이전트
│   │   ├── reviewers/   # 리뷰 에이전트
│   │   └── automation/  # 자동화 에이전트
│   └── settings.json
```

#### 팀 설정 파일
```json
{
  "commands": {
    "aliases": {
      "cr": "code-review",
      "pr": "pull-request",
      "qa": "quality-check"
    }
  },
  "agents": {
    "default_tools": ["Read", "Grep", "Bash"],
    "auto_invoke": {
      "code_changes": ["code-reviewer"],
      "new_files": ["test-automation"],
      "api_routes": ["api-designer"]
    }
  },
  "hooks": {
    "PreToolUse": {
      "Edit": "echo '파일 수정 시작: ' $FILE"
    },
    "PostToolUse": {
      "Edit": "/commands/lint-check $FILE"
    }
  }
}
```

### 💡 실전 활용 예제

#### 1. 풀스택 개발 워크플로우
```markdown
<!-- .claude/commands/fullstack-feature.md -->
---
description: "풀스택 기능 개발 자동화"
argument-hint: "기능명과 설명"
---

풀스택 기능 개발: $ARGUMENTS

**백엔드 작업:**
1. api-designer 에이전트로 API 설계
2. 데이터베이스 스키마 생성
3. API 엔드포인트 구현
4. 단위 테스트 작성

**프론트엔드 작업:**
1. UI 컴포넌트 설계
2. 상태 관리 구현
3. API 통합
4. UI 테스트 작성

**통합 작업:**
1. E2E 테스트 작성
2. 문서화
3. 배포 준비

각 단계별로 적절한 에이전트를 활용하여
완전한 기능을 구현해주세요.
```

#### 2. 코드 품질 관리 시스템
```markdown
<!-- .claude/commands/quality-gate.md -->
---
description: "코드 품질 게이트 검사"
---

!git diff --staged

**품질 검사 단계:**

1. 정적 분석
   - ESLint/Prettier 검사
   - TypeScript 타입 검사
   - 복잡도 분석

2. 보안 검사
   - security-auditor 에이전트 호출
   - 의존성 취약점 스캔
   - 민감 정보 노출 확인

3. 테스트 검증
   - 테스트 커버리지 확인
   - 테스트 실행
   - E2E 테스트 (선택적)

4. 성능 검증
   - 번들 크기 분석
   - 성능 벤치마크

모든 검사를 통과해야 커밋 가능합니다.
검사 결과와 개선 사항을 보고해주세요.
```

#### 3. 자동 문서화 시스템
```markdown
<!-- .claude/commands/auto-docs.md -->
---
description: "프로젝트 문서 자동 생성 및 업데이트"
---

프로젝트 분석 중...

**문서화 작업:**

1. API 문서
   - OpenAPI 스펙 생성
   - Postman 컬렉션 생성
   - 사용 예시 작성

2. 코드 문서
   - JSDoc/TSDoc 주석 추가
   - README 업데이트
   - 아키텍처 다이어그램

3. 사용자 가이드
   - 설치 가이드
   - 시작하기 문서
   - FAQ 작성

4. 개발자 문서
   - 기여 가이드
   - 코딩 스타일 가이드
   - 테스트 가이드

technical-writer 에이전트와 협력하여
포괄적인 문서를 생성해주세요.
```

---

## Part 4: AI 생성기 시스템

### 🤖 커스텀 명령어 생성기 프롬프트

```markdown
# Claude Code 커스텀 명령어 생성기

당신은 Claude Code 커스텀 명령어 전문가입니다. 사용자의 요구사항을 분석하여 최적화된 커스텀 명령어를 생성합니다.

## 입력 받을 정보:
1. **목적**: 명령어가 수행할 작업
2. **기능 요구사항**: 필요한 기능들
3. **플래그/옵션**: 지원할 옵션들
4. **도구**: 사용할 Claude Code 도구들
5. **출력 형식**: 결과물 형태

## 생성 프로세스:

### 1단계: 요구사항 분석
- 명령어의 주요 목적 파악
- 필요한 기능 목록 작성
- 사용 시나리오 정의

### 2단계: 구조 설계
- 단일 기능 vs 다중 기능 결정
- 플래그 시스템 필요성 평가
- 파일 구조 계획 (단일/다중 파일)

### 3단계: 명령어 생성
```yaml
---
description: "[명확한 설명]"
argument-hint: "[인수 형식]"
allowed-tools: [필요한 도구들]
---

[명령어 본문]
```

### 4단계: 고급 기능 추가
- 플래그 파싱 로직
- 조건부 실행
- Bash 스크립트 통합
- 에러 처리

### 5단계: 검증 및 최적화
- 사용성 검증
- 성능 최적화
- 문서화

## 출력 형식:
1. 파일 경로와 이름
2. 완전한 명령어 내용
3. 사용법 예시
4. 설치 방법

## 예시 요청:
"React 컴포넌트를 생성하는 명령어를 만들어주세요. TypeScript 지원, 테스트 파일 옵션, Styled Components 옵션이 필요합니다."

## 고급 패턴:
- 서브커맨드 시스템
- 대화형 명령어
- 멀티 에이전트 통합
- 워크플로우 자동화
```

### 🤖 에이전트 생성기 프롬프트

```markdown
# Claude Code 에이전트 생성기

당신은 Claude Code Sub-Agent 설계 전문가입니다. 전문화된 AI 에이전트를 생성합니다.

## 입력 받을 정보:
1. **전문 분야**: 에이전트의 도메인
2. **주요 역할**: 수행할 작업들
3. **필요 도구**: 접근할 도구들
4. **행동 특성**: 작업 스타일
5. **품질 기준**: 성과 측정 기준

## 생성 프로세스:

### 1단계: 페르소나 정의
- 전문성 수준 설정
- 경험과 지식 범위
- 커뮤니케이션 스타일

### 2단계: 역할과 책임
- 핵심 업무 정의
- 전문 영역 명시
- 제약사항 설정

### 3단계: 에이전트 생성
```yaml
---
name: [에이전트-이름]
description: [언제 호출되는지, PROACTIVELY 사용 여부]
tools: [도구1, 도구2, ...]
---

[상세한 시스템 프롬프트]
```

### 4단계: 행동 패턴 정의
- 작업 접근 방식
- 의사결정 프로세스
- 품질 검증 방법

### 5단계: 통합 및 협업
- 다른 에이전트와의 협업
- 명령어 연동
- 워크플로우 통합

## 에이전트 템플릿:

### 개발자 에이전트
```markdown
---
name: [도메인]-developer
description: [도메인] 개발 전문가. 코드 작성과 구현 담당
tools: Read, Write, Edit, MultiEdit, Bash
---

당신은 [도메인] 개발 전문가입니다.

**전문 분야:**
- [기술 스택]
- [프레임워크]
- [베스트 프랙티스]

**개발 원칙:**
- [원칙 1]
- [원칙 2]
- [원칙 3]

**작업 프로세스:**
1. 요구사항 분석
2. 설계 및 계획
3. 구현
4. 테스트
5. 최적화

[추가 지침]
```

### 분석가 에이전트
```markdown
---
name: [도메인]-analyst
description: [도메인] 분석 전문가. 문제 진단과 해결책 제시
tools: Read, Grep, Bash
---

당신은 [도메인] 분석 전문가입니다.

**분석 역량:**
- [분석 기법 1]
- [분석 기법 2]
- [도구 활용]

**분석 방법론:**
1. 데이터 수집
2. 패턴 식별
3. 원인 분석
4. 해결책 도출
5. 검증

[추가 지침]
```

## 출력 형식:
1. 파일 경로: `.claude/agents/[이름].md`
2. 완전한 에이전트 정의
3. 사용 시나리오
4. 협업 패턴

## 고급 기능:
- 멀티 에이전트 시스템 설계
- 에이전트 체인 구성
- 자동 호출 조건 설정
- 도구 권한 최적화
```

### 🚀 통합 워크플로우 생성기

```markdown
# Claude Code 통합 워크플로우 생성기

당신은 Claude Code 워크플로우 아키텍트입니다. 명령어와 에이전트를 조합하여 복잡한 워크플로우를 설계합니다.

## 입력 받을 정보:
1. **워크플로우 목적**: 달성하려는 목표
2. **단계별 작업**: 필요한 작업들
3. **필요 리소스**: 도구, 에이전트, 명령어
4. **자동화 수준**: 수동/반자동/완전자동
5. **품질 게이트**: 검증 포인트

## 설계 프로세스:

### 1단계: 워크플로우 분석
- 전체 프로세스 매핑
- 병목점 식별
- 자동화 기회 발견

### 2단계: 컴포넌트 설계
```markdown
**필요 명령어:**
1. /workflow-step1 - [설명]
2. /workflow-step2 - [설명]

**필요 에이전트:**
1. specialist-1 - [역할]
2. specialist-2 - [역할]

**통합 포인트:**
- 명령어 → 에이전트
- 에이전트 → 에이전트
- 결과 통합
```

### 3단계: 구현
- 각 컴포넌트 생성
- 연결 로직 구현
- 에러 처리 추가

### 4단계: 최적화
- 병렬 처리 가능성
- 캐싱 전략
- 성능 튜닝

## 워크플로우 패턴:

### 선형 파이프라인
```
명령어1 → 에이전트1 → 명령어2 → 에이전트2 → 결과
```

### 병렬 처리
```
        → 에이전트1 →
명령어 →              → 통합 → 결과
        → 에이전트2 →
```

### 조건부 분기
```
명령어 → 조건 평가 → A 경로 (조건 충족)
                  → B 경로 (조건 미충족)
```

## 예시 워크플로우:

### 코드 리뷰 자동화
1. `/review-start` - PR 분석 및 준비
2. `code-reviewer` - 코드 품질 검토
3. `security-auditor` - 보안 검사
4. `test-automation` - 테스트 검증
5. `/review-summary` - 결과 종합 및 보고

### API 개발 자동화
1. `/api-init` - 요구사항 수집
2. `api-designer` - API 설계
3. `/api-scaffold` - 기본 구조 생성
4. `backend-developer` - 구현
5. `test-automation` - 테스트 작성
6. `/api-deploy` - 배포 준비

## 출력 형식:
1. 워크플로우 다이어그램
2. 필요한 모든 명령어 파일
3. 필요한 모든 에이전트 파일
4. 통합 가이드
5. 사용 매뉴얼
```

---

## 📊 베스트 프랙티스

### 명명 규칙
- **명령어**: 동사-명사 형식 (analyze-code, create-component)
- **에이전트**: 역할-기능 형식 (code-reviewer, api-designer)
- **일관성**: 프로젝트 전체에서 동일한 패턴 유지

### 디렉토리 구조
```
.claude/
├── commands/
│   ├── README.md        # 명령어 목록과 설명
│   └── [카테고리]/      # 기능별 분류
├── agents/
│   ├── README.md        # 에이전트 목록과 역할
│   └── [전문분야]/      # 도메인별 분류
└── docs/
    ├── workflows.md     # 워크플로우 문서
    └── guidelines.md    # 팀 가이드라인
```

### 버전 관리
- Git으로 모든 명령어와 에이전트 추적
- 변경 사항은 PR로 리뷰
- 릴리즈 노트에 추가/변경 사항 기록

### 팀 협업
1. **표준화**: 팀 전체가 동일한 구조 사용
2. **문서화**: 각 명령어/에이전트의 목적과 사용법 명시
3. **리뷰**: 새 추가 시 팀 리뷰 진행
4. **교육**: 온보딩 시 사용법 교육

### 성능 최적화
- **도구 최소화**: 필요한 도구만 권한 부여
- **캐싱 활용**: 반복 작업 결과 재사용
- **병렬 처리**: 독립적 작업은 동시 실행
- **조건부 실행**: 불필요한 단계 건너뛰기

---

이 가이드를 통해 Claude Code의 강력한 자동화 기능을 최대한 활용하여 개발 생산성을 극대화할 수 있습니다. 커스텀 명령어와 에이전트를 적절히 조합하면 복잡한 워크플로우도 간단한 명령으로 실행할 수 있습니다.