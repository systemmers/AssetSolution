---
description: "브레인스토밍 세션 - 다중 파일 관리 및 맥락 기반 아이디어 생성"
argument-hint: "[주제] [--action add|continue|review|search|research] [--file 파일명] [--number N] [--source project|web|both] [--depth quick|deep] [--focus technical|business|user]"
allowed-tools: ["Read", "Write", "Edit", "Grep", "Bash", "List"]
---

브레인스토밍 세션: $ARGUMENTS

**파일 관리 시스템:**
- 기본 위치: `project_files/brainstorming/`
- 자동 감지: 가장 최근 수정된 `brainstorm_*.md` 파일
- 수동 지정: `--file` 옵션으로 특정 파일 지정
- 파일명 패턴: `brainstorm_[주제]_[날짜].md`

**파일 감지 및 선택 로직:**
1. `project_files/brainstorming/` 폴더 스캔
2. `brainstorm_*.md` 패턴 파일 필터링
3. 수정 날짜 기준 최신 파일 자동 선택
4. 파일이 없으면 새 파일 생성 (형식: `brainstorm_[주제]_[현재날짜].md`)

**맥락 분석 시스템:**
- **Next> 표시 감지**: 명시적 이어쓰기 지점 식별
- **마지막 아이디어 분석**: 가장 최근 아이디어의 완성도 및 발전 방향
- **세션 주제 추출**: 파일명과 내용에서 주제 및 목적 파악
- **진행 패턴 분석**: 이전 아이디어들의 발전 방향과 패턴
- **미완성 요소 식별**: 완성되지 않은 아이디어나 보완 필요 사항

**피드백 및 상호작용 시스템:**
- 맥락 분석 결과를 사용자에게 명확히 제시
- 제안사항과 질문을 통한 방향성 확인
- 사용자 선택에 따른 맞춤형 응답 제공
- 진행 상황과 다음 단계에 대한 명확한 안내

**기본 액션:**
- `--action add`: 새로운 아이디어 추가 (기본값)
- `--action continue`: 기존 아이디어 확장 또는 Next> 지점 이어쓰기
- `--action review`: 전체 세션 검토 및 정리

**확장 액션:**
- `--action search`: 인터넷 검색을 통한 아이디어 보완
- `--action research`: 프로젝트 분석을 통한 아이디어 발전
- `--action combine`: 여러 아이디어 결합 및 통합
- `--action evaluate`: 아이디어 평가 및 우선순위 설정

**정보 소스 옵션:**
- `--source project`: 현재 프로젝트만 참고 (기본값)
- `--source web`: 인터넷 검색 결과 활용
- `--source both`: 프로젝트 + 웹 검색 조합

**분석 깊이:**
- `--depth quick`: 빠른 분석 (기본값)
- `--depth deep`: 심층 분석 및 상세 검토

**집중 영역:**
- `--focus technical`: 기술적 관점 집중
- `--focus business`: 비즈니스 관점 집중
- `--focus user`: 사용자 관점 집중
- `--focus all`: 종합적 관점 (기본값)

**고급 옵션:**
- `--compare`: 유사 아이디어와 비교 분석
- `--validate`: 아이디어 실현 가능성 검증
- `--visualize`: 아이디어 시각화 (다이어그램 생성)
- `--export`: 특정 형식으로 결과 내보내기

**아이디어 작성 형식:**
```markdown
## 아이디어 #[번호]

### 핵심 내용
[아이디어의 핵심 설명]

### 세부 사항
[구체적인 내용 및 구현 방안]

### 장점
- [장점 1]
- [장점 2]

### 고려사항
- [고려사항 1]
- [고려사항 2]

### 연관 아이디어
- [연관된 이전 아이디어 번호들]

### 작성자
[작성자 정보]

### 작성일시
[날짜/시간]

---

## Next>
[다음 작성자를 위한 안내 또는 질문]
```

**실행 프로세스:**

1. **파일 감지 및 로드**
   - 브레인스토밍 폴더 스캔
   - 최신 파일 자동 선택 또는 새 파일 생성
   - 파일 내용 분석

2. **맥락 분석**
   - Next> 표시 감지
   - 마지막 아이디어 분석
   - 세션 주제 및 진행 패턴 파악
   - 미완성 요소 식별

3. **피드백 제공**
   - 분석 결과 사용자에게 제시
   - 제안사항 및 질문 제공
   - 사용자 선택 대기

4. **액션 실행**
   - 사용자 선택에 따른 맞춤형 응답
   - 아이디어 추가/확장/검토 수행
   - 결과를 파일에 저장

**사용 예시:**
```bash
# 기본 사용 (새 아이디어 추가)
/brainstorm "AI 프로젝트 관리 시스템"

# 기존 아이디어 확장
/brainstorm --action continue --number 3

# 인터넷 검색을 통한 보완
/brainstorm --action search --source web --focus technical

# 프로젝트 분석을 통한 발전
/brainstorm --action research --source project --depth deep

# 전체 세션 검토
/brainstorm --action review --visualize

# 특정 파일 지정
/brainstorm --file brainstorm_UI_design_20240114.md --action continue
```

**맥락 분석 결과 예시:**
```markdown
## 맥락 분석 결과

**현재 세션:** AI 기반 프로젝트 관리 시스템
**파일:** brainstorm_AI_project_20240115.md
**총 아이디어:** 5개
**마지막 아이디어:** #5 자동 코드 리뷰 시스템
**진행 패턴:** 기술적 구현 방안 중심으로 발전

**분석 결과:**
- 아이디어들이 기술적 관점에 집중되어 있음
- 비즈니스 가치나 사용자 경험 측면이 부족
- 전체 시스템 아키텍처 관점 필요

**제안사항:**
1. 비즈니스 모델 관점에서 아이디어 확장
2. 사용자 경험 중심의 새로운 아이디어 추가
3. 전체 시스템 통합 방안 검토

**어떤 방향으로 진행하시겠습니까?**
- [A] 기존 아이디어 확장
- [B] 새로운 관점의 아이디어 추가
- [C] 전체 세션 검토 및 정리
```

인수를 파싱하여 파일을 감지하고 맥락을 분석한 후 해당 액션을 수행해주세요. 