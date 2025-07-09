/**
 * JavaScript 공통 상수 정의
 * 하드코딩된 값들을 상수로 정의하여 관리의 일관성을 보장합니다.
 * 
 * 코드 인덱스:
 * - TIMEOUTS: 타임아웃 및 지연 시간 설정
 * - FILE_LIMITS: 파일 크기 및 제한 설정
 * - PAGINATION: 페이지네이션 관련 설정
 * - UI: UI 관련 애니메이션 및 전환 설정
 * - BUSINESS_RULES: 비즈니스 로직 관련 상수
 * - API: API 관련 설정
 * - MESSAGES: 메시지 지속시간 설정
 */

// 타임아웃 및 지연 시간 (밀리초) - Python TIMEOUT_SETTINGS와 동기화
const TIMEOUTS = {
    // API 및 네트워크 관련
    API_TIMEOUT: 30000,                  // 30초 - API 타임아웃
    
    // 자동 새로고침 간격
    AUTO_REFRESH_INTERVAL: 30000,        // 30초
    CHART_UPDATE_INTERVAL: 5000,         // 5초
    MODULE_LOAD_TIMEOUT: 5000,           // 5초
    LARGE_OPERATION_TIMEOUT: 30000,      // 30초 (큰 작업용)
    
    // 알림 지속 시간 - Python ALERT_DURATION과 동기화
    ALERT_DURATION: {
        SHORT: 1500,                     // 1.5초
        MEDIUM: 3000,                    // 3초
        LONG: 5000                       // 5초
    },
    
    // 입력 지연 시간 - Python INPUT_DELAY와 동기화
    INPUT_DEBOUNCE: 500,                 // 0.5초
    SEARCH_DEBOUNCE: 500,                // 0.5초
    VALIDATION_DELAY: 500,               // 0.5초
    
    // 테스트 관련
    TEST_TIMEOUT: 10000,                 // 10초
    
    // 이미지 및 미디어
    IMAGE_TIMEOUT: 5000,                 // 5초
    
    // 알림 자동 처리
    NOTIFICATION_AUTO_MARK_READ: 5000    // 5초 후 자동 읽음 처리
};

// 파일 및 데이터 크기 제한 - Python 설정과 동기화
const FILE_LIMITS = {
    MAX_FILE_SIZE_MB: 50,                // 50MB
    MAX_FILE_SIZE_BYTES: 50 * 1024 * 1024,
    
    // 기본 폰트 크기 - Python UI_SETTINGS와 동기화
    DEFAULT_FONT_SIZE: '16px'
};

// 페이지네이션 및 리스트 관련 - Python PAGINATION_SETTINGS와 동기화
const PAGINATION = {
    DEFAULT_PAGE_SIZE: 10,
    AVAILABLE_PAGE_SIZES: [10, 25, 50, 100, 200],
    MAX_SEARCH_RESULTS: 1000,
    
    // 알림 관련 - Python BUSINESS_RULES와 동기화
    NOTIFICATION_LIMIT: 100
};

// AI 모델 관련 상수 - Python AI_MODEL_SETTINGS와 동기화
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
    
    // 월별 데이터용 기본값 - Python CHART_SETTINGS와 동기화
    MONTHLY_DATA: [5, 8, 12, 15, 18, 22, 19, 25, 20, 16, 14, 10],
    MONTHLY_LABELS: ['7월', '8월', '9월', '10월', '11월', '12월']
};

// 비즈니스 로직 관련 상수 - Python BUSINESS_RULES와 동기화
const BUSINESS_RULES = {
    LOAN_LIMIT: 5,                       // 대여 한도
    STATUS_ID_DEFAULT: 3,                // 기본 상태 ID
    DESCRIPTION_MAX_LENGTH: 100,         // 설명 최대 길이
    
    // 날짜 형식
    DATE_FORMAT: 'YYYY-MM-DD',
    DATETIME_FORMAT: 'YYYY-MM-DD HH:mm'
};

// API 및 네트워크 관련
const API = {
    BASE_URL: 'http://localhost:5000/api',
    TIMEOUT: 30000,                      // 30초 - TIMEOUTS.API_TIMEOUT과 동일
    RETRY_DELAY: 1000                    // 1초
};

// 샘플 데이터 관련 상수 - Python SAMPLE_DATA_SETTINGS와 동기화
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
    },
    
    // 차트 관련 샘플 데이터 - Python CHART_SETTINGS와 동기화
    CHART: {
        MONTHLY_DATA_SAMPLE: [12, 16, 18, 17, 19, 18],
        FILE_SIZE_BASE: 2.5,             // MB
        FILE_SIZE_INCREMENT: 0.3,        // MB
        DOWNLOAD_COUNT_BASE: 10
    },
    
    // 운영 관련 샘플 데이터 - Python SAMPLE_DATA_SETTINGS와 동기화
    OPERATIONS: {
        LOAN_COUNT_BASE: 10,
        LOAN_COUNT_INCREMENT: 2,
        UTILIZATION_RATE_SAMPLE: 78.5,
        OVERDUE_CHANGE_SAMPLE: 5,
        AVG_LOAN_PERIOD: 5,
        TODAY_PROCESSED: 5,
        PROGRESS_SAMPLE: 50
    }
};

// 메시지 및 텍스트 관련 - TIMEOUTS.ALERT_DURATION과 동기화
const MESSAGES = {
    SUCCESS_DURATION: 3000,              // 성공 메시지 지속 시간
    ERROR_DURATION: 5000,                // 에러 메시지 지속 시간
    INFO_DURATION: 3000,                 // 정보 메시지 지속 시간
    WARNING_DURATION: 3000               // 경고 메시지 지속 시간
};

// UI 관련 상수 - Python UI_SETTINGS와 동기화
const UI = {
    ANIMATION_DURATION: 300,             // 애니메이션 지속 시간 (ms)
    MODAL_TRANSITION: 150,               // 모달 전환 시간 (ms)
    
    // 스크롤 관련
    SCROLL_OFFSET: 100,
    
    // 반응형 breakpoint
    MOBILE_BREAKPOINT: 768,
    TABLET_BREAKPOINT: 1024,
    
    // 컬럼 너비 설정 - Python COLUMN_WIDTHS와 동기화
    COLUMN_WIDTHS: {
        SMALL: 10,
        MEDIUM: 12,
        LARGE: 20,
        EXTRA_LARGE: 30,
        DESCRIPTION: 15
    }
};

// 날짜 관련 상수 - Python DATE_SETTINGS와 동기화
const DATE_SETTINGS = {
    DAYS_IN_MONTH: 30,
    DAYS_IN_YEAR: 365,
    QUARTERLY_MONTHS: [1, 4, 7, 10]
};

// 환경별 설정 지원
const ENV_CONFIG = {
    DEVELOPMENT: {
        DEBUG: true,
        API_BASE_URL: 'http://localhost:5000/api',
        LOG_LEVEL: 'debug'
    },
    PRODUCTION: {
        DEBUG: false,
        API_BASE_URL: '/api',
        LOG_LEVEL: 'error'
    }
};

// 현재 환경 감지
const getCurrentEnvironment = () => {
    return window.location.hostname === 'localhost' ? 'DEVELOPMENT' : 'PRODUCTION';
};

// 환경별 설정 가져오기
const getEnvironmentConfig = () => {
    const env = getCurrentEnvironment();
    return ENV_CONFIG[env] || ENV_CONFIG.DEVELOPMENT;
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
        BUSINESS_RULES,
        API,
        SAMPLE_DATA,
        MESSAGES,
        UI,
        DATE_SETTINGS,
        ENV_CONFIG,
        getCurrentEnvironment,
        getEnvironmentConfig
    };
} else {
    // 브라우저 환경
    window.AppConstants = {
        TIMEOUTS,
        FILE_LIMITS,
        PAGINATION,
        AI_MODEL,
        CHART_COLORS,
        BUSINESS_RULES,
        API,
        SAMPLE_DATA,
        MESSAGES,
        UI,
        DATE_SETTINGS,
        ENV_CONFIG,
        getCurrentEnvironment,
        getEnvironmentConfig
    };
} 