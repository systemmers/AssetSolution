/**
 * JavaScript 공통 상수 정의
 * 하드코딩된 값들을 상수로 정의하여 관리의 일관성을 보장합니다.
 */

// 타임아웃 및 지연 시간 (밀리초)
const TIMEOUTS = {
    // 자동 새로고침 간격
    AUTO_REFRESH_INTERVAL: 30000,        // 30초
    CHART_UPDATE_INTERVAL: 5000,         // 5초
    MODULE_LOAD_TIMEOUT: 5000,           // 5초
    
    // 알림 지속 시간
    ALERT_DURATION: {
        SHORT: 1500,                     // 1.5초
        MEDIUM: 3000,                    // 3초
        LONG: 5000                       // 5초
    },
    
    // 입력 지연 시간
    INPUT_DEBOUNCE: 500,                 // 0.5초
    SEARCH_DEBOUNCE: 500,                // 0.5초
    
    // 테스트 관련
    TEST_TIMEOUT: 10000,                 // 10초
    
    // 특수 작업 타임아웃
    LARGE_OPERATION_TIMEOUT: 30000       // 30초 (큰 작업용)
};

// 파일 및 데이터 크기 제한
const FILE_LIMITS = {
    MAX_FILE_SIZE_MB: 50,                // 50MB
    MAX_FILE_SIZE_BYTES: 50 * 1024 * 1024,
    
    // 이미지 관련
    IMAGE_TIMEOUT: 5000,                 // 5초
    
    // 폰트 크기
    DEFAULT_FONT_SIZE: '16px'
};

// 페이지네이션 및 리스트 관련
const PAGINATION = {
    DEFAULT_PAGE_SIZE: 10,
    AVAILABLE_PAGE_SIZES: [10, 25, 50, 100, 200],
    MAX_SEARCH_RESULTS: 1000,
    
    // 알림 관련
    NOTIFICATION_LIMIT: 100,
    NOTIFICATION_AUTO_MARK_READ: 5000    // 5초 후 자동 읽음 처리
};

// AI 모델 관련 상수
const AI_MODEL = {
    MAX_TOKENS: {
        MIN: 1,
        MAX: 2048,
        DEFAULT: 500,
        STEP: 1
    }
};

// 차트 및 시각화 관련
const CHART_COLORS = {
    PRIMARY: 'rgba(54, 162, 235, 0.8)',
    PRIMARY_BORDER: 'rgba(54, 162, 235, 1)',
    PRIMARY_BACKGROUND: 'rgba(54, 162, 235, 0.2)',
    PRIMARY_LIGHT: 'rgba(54, 162, 235, 0.5)',
    PRIMARY_TRANSPARENT: 'rgba(54, 162, 235, 0.1)',
    
    // 월별 데이터용 기본값
    MONTHLY_DATA: [5, 8, 12, 15, 18, 22, 19, 25, 20, 16, 14, 10],
    MONTHLY_LABELS: ['7월', '8월', '9월', '10월', '11월', '12월']
};

// 검증 관련 상수
const VALIDATION = {
    DELAY_MS: 500,                       // 검증 지연 시간
    
    // 자산 관련
    LOAN_LIMIT: 5,                       // 대여 한도
    STATUS_ID_DEFAULT: 3,                // 기본 상태 ID
    
    // 날짜 형식
    DATE_FORMAT: 'YYYY-MM-DD',
    DATETIME_FORMAT: 'YYYY-MM-DD HH:mm'
};

// API 및 네트워크 관련
const API = {
    BASE_URL: 'http://localhost:5000/api',
    TIMEOUT: 30000,                      // 30초
    RETRY_DELAY: 1000                    // 1초
};

// 샘플 데이터 관련 상수
const SAMPLE_DATA = {
    // 자산 가치 범위
    ASSET_VALUES: {
        MIN: 100,
        MAX: 5000000,
        
        // 샘플 가격들
        OFFICE_CHAIR: 150000,
        PRINTER: 300000,
        MEETING_TABLE: 500000,
        DESK: 250000
    },
    
    // IP 주소 샘플
    IP_ADDRESSES: {
        SAMPLE_1: '192.168.1.1',
        SAMPLE_2: '192.168.1.2'
    }
};

// 메시지 및 텍스트 관련
const MESSAGES = {
    SUCCESS_DURATION: 3000,              // 성공 메시지 지속 시간
    ERROR_DURATION: 5000,                // 에러 메시지 지속 시간
    INFO_DURATION: 3000,                 // 정보 메시지 지속 시간
    WARNING_DURATION: 3000               // 경고 메시지 지속 시간
};

// UI 관련 상수
const UI = {
    ANIMATION_DURATION: 300,             // 애니메이션 지속 시간
    MODAL_TRANSITION: 150,               // 모달 전환 시간
    
    // 스크롤 관련
    SCROLL_OFFSET: 100,
    
    // 반응형 breakpoint
    MOBILE_BREAKPOINT: 768,
    TABLET_BREAKPOINT: 1024
};

// 내보내기
if (typeof module !== 'undefined' && module.exports) {
    // Node.js 환경
    module.exports = {
        TIMEOUTS,
        FILE_LIMITS,
        PAGINATION,
        AI_MODEL,
        CHART_COLORS,
        VALIDATION,
        API,
        SAMPLE_DATA,
        MESSAGES,
        UI
    };
} else {
    // 브라우저 환경
    window.AppConstants = {
        TIMEOUTS,
        FILE_LIMITS,
        PAGINATION,
        AI_MODEL,
        CHART_COLORS,
        VALIDATION,
        API,
        SAMPLE_DATA,
        MESSAGES,
        UI
    };
} 