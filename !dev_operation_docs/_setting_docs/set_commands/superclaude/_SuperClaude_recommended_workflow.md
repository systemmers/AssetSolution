# 추천 워크플로우 가이드

> **목적**: 프로젝트 타입별 최적화된 SuperClaude + MCP 설정과 개발 워크플로우 제안

## 1. 프로젝트 타입별 추천 설정

### 1-1. 웹 프론트엔드 프로젝트

**필수 MCP 서버:**
- **Magic**: UI 컴포넌트 생성 및 디자인 시스템
- **Context7**: React/Vue/Angular 최신 문서 참조
- **Playwright**: E2E 테스트 (중요도: 높음)

**핵심 명령어 조합:**
```bash
# 프로젝트 분석 및 구조 파악
/analyze . --focus frontend --depth deep

# 컴포넌트 구현
/implement "사용자 로그인 폼" --type component --framework react

# UI 개선 및 최적화
/improve src/components/ --type performance --focus accessibility

# 빌드 및 배포 준비
/build --type prod --optimize --analyze-bundle
```

**추천 워크플로우:**
1. **프로젝트 분석** → `/analyze .` 
2. **컴포넌트 설계** → `/design components --style [design-system]`
3. **점진적 구현** → `/implement [feature]` 반복
4. **품질 개선** → `/improve [target] --type quality`
5. **테스트 실행** → `/test --type e2e --coverage`

### 1-2. 백엔드 API 프로젝트

**필수 MCP 서버:**
- **Context7**: 프레임워크 및 라이브러리 문서
- **Sequential**: 복잡한 비즈니스 로직 분석
- **Playwright**: API 테스트 (중요도: 중간)

**핵심 명령어 조합:**
```bash
# API 구조 분석
/analyze . --focus backend --depth comprehensive

# API 엔드포인트 구현
/implement "사용자 인증 API" --type api --framework flask

# 보안 강화
/improve . --type security --aggressive

# 데이터베이스 최적화  
/analyze db/ --focus performance --with-recommendations
```

**추천 워크플로우:**
1. **아키텍처 분석** → `/analyze . --focus architecture`
2. **API 설계** → `/design api --spec openapi`
3. **엔드포인트 구현** → `/implement [endpoint-name] --type api`
4. **보안 검토** → `/improve . --type security`
5. **성능 테스트** → `/test --type performance --load-test`

### 1-3. 풀스택 프로젝트

**권장 MCP 서버 (모든 서버):**
- **Context7**: 모든 기술 스택 문서 지원
- **Sequential**: 복잡한 시스템 분석
- **Magic**: 프론트엔드 컴포넌트 생성
- **Playwright**: E2E 및 통합 테스트

**핵심 명령어 조합:**
```bash
# 전체 시스템 분석
/analyze . --comprehensive --multi-domain

# 기능별 구현 워크플로우 생성
/workflow "사용자 관리 시스템" --full-stack

# 프론트엔드-백엔드 연동 구현
/implement "사용자 대시보드" --type full-stack --with-api

# 전체 시스템 개선
/improve . --systematic --all-domains
```

**추천 워크플로우:**
1. **시스템 전체 분석** → `/analyze . --comprehensive`
2. **워크플로우 계획** → `/workflow [feature] --full-stack`
3. **백엔드 우선 개발** → API 및 데이터 모델
4. **프론트엔드 연동** → UI 컴포넌트 및 상태 관리
5. **통합 테스트** → `/test --type integration --cross-platform`

## 2. 개발 단계별 추천 명령어

### 2-1. 기획 단계
```bash
/workflow [기능명] --detailed      # 상세 개발 워크플로우 생성
/estimate [scope] --evidence-based # 개발 일정 산정
/analyze competitors/ --benchmark   # 경쟁사 분석 (참조 코드 있는 경우)
```

### 2-2. 설계 단계  
```bash
/design architecture --scalable    # 확장 가능한 아키텍처 설계
/design database --optimize        # 데이터베이스 설계 최적화
/design api --rest --spec openapi  # RESTful API 설계
```

### 2-3. 개발 단계
```bash
/implement [기능명] --type [타입]   # 기능 구현
/build --watch --hot-reload        # 개발 서버 실행
/troubleshoot [이슈] --systematic   # 버그 체계적 해결
```

### 2-4. 테스트 단계
```bash
/test --type unit --coverage       # 단위 테스트 + 커버리지
/test --type integration --parallel # 통합 테스트 병렬 실행
/test --type e2e --cross-browser   # 크로스 브라우저 E2E 테스트
```

### 2-5. 배포 단계
```bash
/build --type production --optimize # 프로덕션 빌드
/document --type deployment         # 배포 문서 생성
/cleanup --optimize --secure        # 배포 전 정리 및 보안 강화
```

## 3. 자주 사용하는 명령어 조합 TOP 10

1. **프로젝트 파악** 
   ```bash
   /analyze . && /document --type overview
   ```

2. **빠른 기능 구현**
   ```bash
   /implement [기능] --quick && /test --basic
   ```

3. **코드 품질 향상**
   ```bash
   /improve . --quality && /cleanup --organize
   ```

4. **성능 최적화**
   ```bash
   /analyze . --focus performance && /improve . --type performance
   ```

5. **보안 강화**
   ```bash
   /analyze . --focus security && /improve . --type security --aggressive
   ```

6. **문서화 자동화**
   ```bash
   /document --type complete && /explain --audience developers
   ```

7. **버그 해결**
   ```bash
   /troubleshoot [증상] && /test --regression
   ```

8. **리팩토링**
   ```bash
   /analyze [대상] --technical-debt && /improve [대상] --refactor
   ```

9. **배포 준비**
   ```bash
   /build --production && /test --smoke && /document --deployment
   ```

10. **프로젝트 상태 점검**
    ```bash
    /analyze . --health-check && /estimate --remaining-work
    ```

## 4. 페르소나 활용 팁

### 4-1. 자동 활성화 vs 수동 선택

**자동 활성화 (권장):**
- SuperClaude가 작업 내용을 분석하여 적절한 전문가 자동 선택
- 대부분의 경우 이 방식이 효율적

**수동 선택 시기:**
```bash
# 특정 전문성이 확실히 필요한 경우
/analyze . --persona architect      # 아키텍처 전문가 강제 활성화
/improve . --persona security       # 보안 전문가 강제 활성화
/implement . --persona frontend     # 프론트엔드 전문가 강제 활성화
```

### 4-2. 페르소나별 특화 영역

- **architect**: 시스템 설계, 확장성, 기술 선택
- **frontend**: UI/UX, 접근성, 브라우저 호환성  
- **backend**: API 설계, 성능, 데이터 처리
- **security**: 보안 취약점, 인증/인가, 데이터 보호
- **performance**: 최적화, 병목점 분석, 리소스 관리

## 5. 효율성 극대화 팁

### 5-1. 플래그 조합 활용
```bash
# 심층 분석 + 자동 개선 제안
/analyze . --depth deep --with-suggestions --auto-fix

# 빠른 구현 + 테스트 포함
/implement [기능] --quick --with-tests --validate

# 포괄적 개선 + 문서화
/improve . --comprehensive --document-changes --measure-impact
```

### 5-2. 배치 작업 활용
```bash
# 여러 파일 동시 분석
/analyze src/ tests/ docs/ --parallel --compare

# 일괄 리팩토링
/improve src/**/*.js --pattern-based --consistent
```

### 5-3. 파이프라인 구성
```bash
# 개발 → 테스트 → 문서화 파이프라인
/implement [기능] && /test --auto && /document --sync
```

## 6. 일반적인 문제 해결

### MCP 서버 연결 문제
```bash
# MCP 서버 상태 확인
SuperClaude status --mcp

# 개별 서버 재시작
SuperClaude restart --server context7
```

### 명령어 인식 문제
```bash
# 캐시 클리어 및 재로드
SuperClaude refresh --clear-cache

# 설정 파일 검증
SuperClaude validate --config
```

### 성능 저하 문제
```bash
# 경량 모드 활성화
/analyze . --mode lightweight --quick-scan

# 필요한 MCP 서버만 활성화
SuperClaude config --mcp-servers context7,sequential
```

## 7. 진화하는 워크플로우

### 7-1. 초급 단계 (1-2주)
- 기본 명령어 위주 사용: `/analyze`, `/implement`, `/improve`
- 자동 설정에 의존
- 단일 명령어 실행

### 7-2. 중급 단계 (1개월 후)
- 플래그 조합 활용
- 페르소나 수동 선택 시작
- 명령어 체인 구성

### 7-3. 고급 단계 (3개월 후)  
- 커스텀 워크플로우 구성
- MCP 서버 최적화 설정
- 프로젝트별 맞춤 설정 구성

## 8. MCP 서버 관리 팁

### 8-1. Claude Code 공식 MCP 관리
```bash
# 설치된 MCP 서버 확인
claude mcp list

# 새 MCP 서버 추가
claude mcp add @playwright/test

# MCP 서버 제거
claude mcp remove @playwright/test
```

### 8-2. SuperClaude MCP 관리
```bash
# SuperClaude MCP 서버 상태 확인
SuperClaude status --mcp

# 개별 서버 재시작
SuperClaude restart --server context7

# 모든 MCP 서버 재시작
SuperClaude restart --all-servers
```

### 8-3. 성능 최적화 팁
- **필요한 서버만 활성화**: 불필요한 MCP 서버는 비활성화
- **서버별 역할 이해**: 각 서버의 특화 영역 파악
- **네트워크 상태 고려**: 온라인 MCP 서버는 인터넷 연결 필요

---

**기억하세요**: 완벽한 설정보다는 꾸준한 사용이 더 중요합니다. SuperClaude는 사용할수록 더 똑똑해지는 시스템입니다!