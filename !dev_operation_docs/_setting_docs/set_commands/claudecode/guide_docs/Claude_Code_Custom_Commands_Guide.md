# Claude Code 커스텀 명령어 완벽 가이드

Claude Code에서 효율적인 개발 워크플로우를 위한 커스텀 slash command 생성 및 활용 가이드입니다.

## 📋 목차

1. [기본 개념](#기본-개념)
2. [명령어 생성 방법](#명령어-생성-방법)
3. [고급 기능 활용](#고급-기능-활용)
4. [플래그 시스템 구현](#플래그-시스템-구현)
5. [실용적인 예시](#실용적인-예시)
6. [명령어 메이커 프롬프트](#명령어-메이커-프롬프트)

---

## 기본 개념

### 커스텀 명령어란?
Claude Code의 slash command는 반복적인 작업을 자동화하고 일관된 워크플로우를 제공하는 마크다운 기반 명령어입니다.

### 저장 위치
- **프로젝트 레벨**: `.claude/commands/` (팀 공유)
- **개인 레벨**: `~/.claude/commands/` (개인 전용)

### 파일 구조
```
project/
├── .claude/
│   └── commands/
│       ├── analyze.md
│       ├── build/
│       │   ├── dev.md
│       │   └── prod.md
│       └── test/
│           ├── unit.md
│           └── e2e.md
└── src/
```

---

## 명령어 생성 방법

### 1. 기본 명령어 생성

```bash
# 디렉토리 생성
mkdir -p .claude/commands

# 간단한 명령어
echo "이 코드를 성능 관점에서 분석해주세요" > .claude/commands/optimize.md
```

**사용법**: `/optimize`

### 2. 매개변수를 사용하는 명령어

```markdown
<!-- .claude/commands/fix-issue.md -->
GitHub 이슈 #$ARGUMENTS를 우리 코딩 표준에 따라 수정해주세요.

다음 사항을 고려해주세요:
1. 코드 컨벤션 준수
2. 테스트 코드 추가
3. 문서 업데이트
```

**사용법**: `/fix-issue 123`

### 3. YAML frontmatter 활용

```markdown
---
description: "포괄적인 코드 리뷰"
argument-hint: "파일 경로 또는 디렉토리"
allowed-tools: ["Read", "Grep", "Bash"]
---

다음 항목들을 중점적으로 검토해주세요:
1. 코드 품질 및 가독성
2. 보안 취약점  
3. 성능 최적화 가능성
4. 베스트 프랙티스 준수

대상: $ARGUMENTS
```

### 4. Bash 명령 포함

```markdown
---
description: "빌드 후 테스트 실행"
---

프로젝트를 빌드하고 테스트를 실행합니다:

!npm run build
!npm test

빌드 결과를 분석하고 실패한 테스트가 있다면 수정 방안을 제안해주세요.
```

### 5. 파일 참조 포함

```markdown
---
description: "프로젝트 설정 종합 검토"
---

다음 설정 파일들을 검토해주세요:
@package.json
@tsconfig.json
@.eslintrc.js

설정의 일관성과 최적화 가능성을 분석해주세요.
```

---

## 고급 기능 활용

### 네임스페이싱
폴더 구조를 통해 명령어를 분류하고 체계화할 수 있습니다.

```
.claude/commands/
├── react/
│   ├── component.md    # /react/component
│   └── hook.md         # /react/hook
├── backend/
│   ├── api.md          # /backend/api
│   └── database.md     # /backend/database
└── devops/
    ├── deploy.md       # /devops/deploy
    └── monitor.md      # /devops/monitor
```

### Hooks 설정
```json
{
  "hooks": {
    "PreToolUse": {
      "Bash": "echo '명령 실행 시작...'"
    },
    "PostToolUse": {
      "Edit": "echo '파일 수정 완료'"
    }
  }
}
```

---

## 플래그 시스템 구현

Claude Code는 네이티브 플래그를 지원하지 않지만, 다음 방법들로 플래그와 유사한 기능을 구현할 수 있습니다.

### 방법 1: 인수 파싱 로직

```markdown
---
description: "플래그를 지원하는 분석 명령어"
argument-hint: "파일경로 [--security] [--performance] [--quality] [--all]"
---

분석 대상과 옵션: $ARGUMENTS

**지원되는 플래그:**
- `--security` : 보안 중심 분석
- `--performance` : 성능 중심 분석  
- `--quality` : 코드 품질 분석
- `--all` : 모든 항목 종합 분석

**사용 예시:**
- `/analyze src/app.js --security`
- `/analyze src/components/ --performance --quality`

전달받은 인수에서 파일 경로와 플래그를 파싱하여 해당하는 분석을 수행해주세요.
```

### 방법 2: 다중 명령어 버전

```bash
# 각 옵션별로 별도 명령어 생성
echo "보안 취약점 중심 분석: $ARGUMENTS" > .claude/commands/analyze-security.md
echo "성능 최적화 중심 분석: $ARGUMENTS" > .claude/commands/analyze-performance.md  
echo "코드 품질 중심 분석: $ARGUMENTS" > .claude/commands/analyze-quality.md
echo "종합 분석 (보안+성능+품질): $ARGUMENTS" > .claude/commands/analyze-all.md
```

### 방법 3: Bash 스크립트 활용

```markdown
---
description: "고급 플래그 파싱"
---

!bash -c '
args="$1"
file=""
flags=""

for arg in $args; do
  case $arg in
    --*) flags="$flags $arg" ;;
    *) file="$arg" ;;
  esac
done

echo "대상 파일: $file"
echo "선택된 옵션: $flags"
' -- "$ARGUMENTS"

위 파싱 결과를 바탕으로 요청된 분석을 수행해주세요.
```

---

## 실용적인 예시

### 개발 워크플로우 명령어

#### 1. React 컴포넌트 생성
```markdown
---
description: "React 컴포넌트 생성 (TypeScript + 테스트)"
argument-hint: "컴포넌트명 [--functional] [--class] [--styled] [--test]"
---

$ARGUMENTS 컴포넌트를 생성해주세요.

**생성할 파일들:**
1. 컴포넌트 파일 (TypeScript)
2. 스타일 파일 (CSS Modules 또는 Styled Components)
3. 테스트 파일 (Jest + Testing Library)
4. Storybook 스토리
5. index.ts 배럴 내보내기

**플래그 처리:**
- `--functional` : 함수형 컴포넌트 (기본값)
- `--class` : 클래스형 컴포넌트
- `--styled` : Styled Components 사용
- `--test` : 테스트 파일 생성 강제

프로젝트의 기존 패턴과 일치하도록 생성해주세요.
```

#### 2. API 엔드포인트 생성
```markdown
---
description: "Express.js API 엔드포인트 생성"
argument-hint: "엔드포인트 경로 [--crud] [--auth] [--validation]"
---

$ARGUMENTS 엔드포인트를 생성해주세요.

**기본 구조:**
1. 라우터 파일
2. 컨트롤러 함수
3. 미들웨어 (인증, 검증)
4. 스키마 정의
5. 테스트 파일

**플래그별 추가 생성:**
- `--crud` : CRUD 전체 엔드포인트
- `--auth` : JWT 인증 미들웨어 포함
- `--validation` : 입력 검증 스키마 포함

Swagger 문서 주석도 포함해주세요.
```

### 분석 및 최적화 명령어

#### 3. 성능 분석
```markdown
---
description: "성능 병목점 분석 및 최적화"
---

성능 분석을 수행합니다: $ARGUMENTS

!npm run build -- --analyze
!npm audit

**분석 항목:**
1. 번들 크기 분석
2. 사용하지 않는 의존성
3. 알고리즘 복잡도
4. 메모리 사용 패턴
5. 데이터베이스 쿼리 최적화

**제공할 결과:**
- 성능 지표 요약
- 병목점 식별
- 구체적인 최적화 방안
- 예상 개선 효과
```

#### 4. 보안 검토
```markdown
---
description: "OWASP 기준 보안 검토"
---

!npm audit
!npm ls --depth=0

$ARGUMENTS에 대해 보안 검토를 수행합니다.

**검토 항목 (OWASP Top 10):**
1. 인젝션 공격 방지
2. 인증/인가 취약점
3. 민감 데이터 노출
4. XSS 방지
5. 보안 설정 오류
6. 알려진 취약점이 있는 컴포넌트
7. 불충분한 로깅 및 모니터링

각 항목별 현재 상태와 개선 방안을 제시해주세요.
```

### 팀 협업 명령어

#### 5. 코드 리뷰 체크리스트
```markdown
---
description: "PR 코드 리뷰 체크리스트 생성"
---

!git diff --name-only HEAD~1

현재 PR에 대한 코드 리뷰 체크리스트를 생성합니다.

**자동 검사 항목:**
- [ ] 빌드 성공
- [ ] 테스트 통과
- [ ] 린트 규칙 준수
- [ ] 타입 검사 통과

**수동 검토 항목:**
- [ ] 코드 가독성
- [ ] 비즈니스 로직 정확성
- [ ] 에러 핸들링
- [ ] 성능 영향도
- [ ] 보안 고려사항
- [ ] 문서 업데이트

각 변경 파일별 리뷰 포인트도 함께 제공해주세요.
```

#### 6. 릴리즈 노트 생성
```markdown
---
description: "자동 릴리즈 노트 생성"
argument-hint: "이전 버전 태그 (예: v1.0.0)"
---

!git log $ARGUMENTS..HEAD --oneline --no-merges

커밋 히스토리를 분석하여 릴리즈 노트를 생성합니다.

**릴리즈 노트 형식:**
```markdown
## 🚀 새로운 기능
## 🐛 버그 수정  
## ⚡ 성능 개선
## 📚 문서 업데이트
## ⚠️ 호환성 변경
## 🔒 보안 개선
```

각 항목에 대한 사용자 영향도와 마이그레이션 가이드도 포함해주세요.
```

---

## 명령어 메이커 프롬프트

다음 프롬프트를 사용하여 AI에게 커스텀 명령어 생성을 요청할 수 있습니다:

### 🤖 커스텀 명령어 생성 요청 프롬프트

```
Claude Code 커스텀 명령어를 생성해주세요.

**요구사항:**
- 명령어 목적: [설명]
- 대상 언어/프레임워크: [예: React, Node.js, Python]
- 필요한 플래그/옵션: [예: --test, --security, --performance]
- 포함할 도구: [예: Bash 명령, 파일 참조]
- 출력 형식: [예: 체크리스트, 코드 생성, 분석 리포트]

**생성 기준:**
1. `.claude/commands/` 폴더에 저장할 수 있는 .md 파일 형태
2. YAML frontmatter 포함 (description, argument-hint, allowed-tools)
3. $ARGUMENTS를 활용한 매개변수 처리
4. 플래그 파싱 로직 포함 (필요시)
5. 실행 가능한 bash 명령 포함 (필요시)
6. 명확한 사용법 예시

**예시 요청:**
"React 컴포넌트를 생성하는 명령어를 만들어주세요. TypeScript 지원, 테스트 파일 생성 옵션, Styled Components 사용 옵션이 필요합니다."

파일명과 함께 완전한 명령어 내용을 제공해주세요.
```

### 🔧 고급 명령어 생성 프롬프트

```
고급 Claude Code 커스텀 명령어를 생성해주세요.

**프로젝트 컨텍스트:**
- 프로젝트 유형: [예: Next.js 앱, Express API, Python 패키지]
- 팀 규모: [예: 개인, 소규모팀, 대규모팀]
- 개발 단계: [예: 초기개발, 유지보수, 리팩토링]

**명령어 요구사항:**
- 주요 기능: [상세 설명]
- 워크플로우 통합: [예: CI/CD, 코드리뷰, 배포]
- 자동화 수준: [예: 완전자동, 반자동, 가이드제공]
- 에러 처리: [예: 복구 방안, 롤백 기능]

**고급 기능:**
- [ ] 다단계 실행 (여러 명령 조합)
- [ ] 조건부 로직 (환경별 다른 동작)
- [ ] 외부 도구 연동 (Docker, AWS CLI 등)
- [ ] 설정 파일 기반 동작
- [ ] 로깅 및 모니터링

**플래그 시스템:**
원하는 플래그들과 각각의 동작을 명시해주세요.

다음을 제공해주세요:
1. 명령어 파일 구조 (네임스페이싱 포함)
2. 각 파일의 완전한 내용
3. 사용법 가이드
4. 팀 공유를 위한 설명서
```

### 🚀 원클릭 명령어 요청

```
다음 상황에 맞는 Claude Code 커스텀 명령어를 즉시 생성해주세요:

"[구체적인 상황이나 반복 작업 설명]"

예시:
- "매번 PR을 올릴 때마다 빌드, 테스트, 린트를 확인하고 체크리스트를 만드는 작업이 번거로워요"
- "새로운 API 엔드포인트를 만들 때마다 같은 패턴으로 파일들을 생성해야 해요"
- "코드 리뷰할 때 항상 보안, 성능, 품질을 체크하는데 매번 같은 질문을 하게 돼요"

바로 사용할 수 있는 명령어 파일과 설치 방법을 제공해주세요.
```

---

## 📚 추가 리소스

### 명령어 관리 도구
```bash
# 설정 확인
claude config list

# 명령어 목록 확인  
ls .claude/commands/

# 명령어 테스트
/your-command --help
```

### 팀 공유 방법
1. `.claude/commands/` 폴더를 Git에 커밋
2. README에 사용법 문서화
3. 팀 온보딩 가이드에 포함

### 베스트 프랙티스
- 명령어 이름은 직관적이고 간결하게
- 복잡한 로직은 여러 명령어로 분할
- 에러 상황에 대한 명확한 가이드 제공
- 팀 컨벤션과 일치하는 출력 형식 사용

이 가이드를 참고하여 프로젝트에 최적화된 커스텀 명령어를 생성하고 개발 생산성을 향상시키세요! 🎯