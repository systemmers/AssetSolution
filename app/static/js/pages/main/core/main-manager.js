/**
 * 메인 매니저 모듈
 * Main 모듈들 간의 통신, 전역 상태 관리, 리소스 최적화
 * 
 * @author Asset Management System
 * @version 1.0.0
 */

/**
 * MainManager 클래스
 * Main 모듈의 전체 라이프사이클과 통신을 관리
 */
class MainManager {
    constructor() {
        this.modules = new Map();
        this.events = new Map();
        this.config = {
            moduleLoadTimeout: (window.TIMEOUTS && window.TIMEOUTS.MODULE_LOAD_TIMEOUT) || 5000,
            eventDebounceTime: 100,
            performanceMonitoringEnabled: true
        };
        this.performance = {
            startTime: Date.now(),
            moduleLoadTimes: new Map(),
            eventCounts: new Map()
        };
        this.isInitialized = false;
        this.cleanupFunctions = [];
        
        // 바인딩
        this.handleGlobalError = this.handleGlobalError.bind(this);
        this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
    }

    /**
     * Main 매니저 초기화
     * @returns {Promise<boolean>} 초기화 성공 여부
     */
    async initialize() {
        if (this.isInitialized) {
            console.warn('MainManager가 이미 초기화되었습니다.');
            return true;
        }

        console.log('MainManager 초기화 시작...');
        
        try {
            // 전역 이벤트 리스너 설정
            this.setupGlobalEventListeners();
            
            // 모듈 초기화
            await this.initializeModules();
            
            // 모듈 간 통신 설정
            this.setupModuleCommunication();

            this.isInitialized = true;
            this.performance.totalInitTime = Date.now() - this.performance.startTime;
            
            console.log(`MainManager 초기화 완료 (${this.performance.totalInitTime}ms)`);
            return true;
        } catch (error) {
            console.error('MainManager 초기화 실패:', error);
            return false;
        }
    }

    /**
     * 모듈 등록
     * @param {string} name - 모듈 이름
     * @param {Object} module - 모듈 인스턴스
     * @returns {boolean} 등록 성공 여부
     */
    registerModule(name, module) {
        if (this.modules.has(name)) {
            console.warn(`모듈 '${name}'이 이미 등록되어 있습니다.`);
            return false;
        }

        this.modules.set(name, {
            instance: module,
            status: 'registered',
            registeredAt: new Date()
        });

        console.log(`모듈 '${name}' 등록 완료`);
        return true;
    }

    /**
     * 모듈 초기화
     */
    async initializeModules() {
        for (const [name, moduleInfo] of this.modules) {
            try {
                console.log(`모듈 '${name}' 초기화 중...`);
                const cleanup = await moduleInfo.instance.initialize();
                
                if (typeof cleanup === 'function') {
                    this.cleanupFunctions.push({ name, cleanup });
                }
                
                moduleInfo.status = 'initialized';
                console.log(`모듈 '${name}' 초기화 완료`);
            } catch (error) {
                console.error(`모듈 '${name}' 초기화 실패:`, error);
                moduleInfo.status = 'failed';
            }
        }
    }

    /**
     * 모듈 간 통신 설정
     */
    setupModuleCommunication() {
        // 전역 이벤트 시스템 설정
        window.MainEvents = {
            emit: (eventName, data) => this.emitEvent(eventName, data),
            on: (eventName, handler) => this.addEventListener(eventName, handler)
        };
        
        console.log('모듈 간 통신 설정 완료');
    }

    /**
     * 이벤트 발생
     * @param {string} eventName - 이벤트 이름
     * @param {any} data - 이벤트 데이터
     */
    emitEvent(eventName, data) {
        const handlers = this.events.get(eventName);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`이벤트 핸들러 실행 실패 (${eventName}):`, error);
                }
            });
        }
    }

    /**
     * 이벤트 리스너 추가
     * @param {string} eventName - 이벤트 이름
     * @param {Function} handler - 핸들러 함수
     */
    addEventListener(eventName, handler) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }
        this.events.get(eventName).push(handler);
    }

    /**
     * 전역 이벤트 리스너 설정
     */
    setupGlobalEventListeners() {
        window.addEventListener('error', this.handleGlobalError);
        window.addEventListener('beforeunload', this.handleBeforeUnload);
        console.log('전역 이벤트 리스너 설정 완료');
    }

    /**
     * 전역 에러 핸들러
     * @param {Event} event - 에러 이벤트
     */
    handleGlobalError(event) {
        console.error('전역 에러 발생:', event.error);
    }

    /**
     * 페이지 언로드 핸들러
     */
    handleBeforeUnload() {
        console.log('페이지 언로드 감지, 정리 작업 시작...');
        this.cleanup();
    }

    /**
     * 정리 작업
     */
    cleanup() {
        console.log('MainManager 정리 시작...');
        
        // 모듈별 정리 함수 실행
        this.cleanupFunctions.forEach(({ name, cleanup }) => {
            try {
                console.log(`모듈 '${name}' 정리 중...`);
                cleanup();
            } catch (error) {
                console.error(`모듈 '${name}' 정리 실패:`, error);
            }
        });

        // 전역 이벤트 리스너 제거
        window.removeEventListener('error', this.handleGlobalError);
        window.removeEventListener('beforeunload', this.handleBeforeUnload);

        // 전역 객체 정리
        delete window.MainEvents;

        // 상태 초기화
        this.modules.clear();
        this.events.clear();
        this.cleanupFunctions = [];
        this.isInitialized = false;

        console.log('MainManager 정리 완료');
    }
}

export default MainManager; 