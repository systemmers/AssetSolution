/**
 * Operations 모듈 메인 통합 진입점
 * 모든 Operations 하위 모듈을 통합 관리합니다.
 * 
 * 파일 내 코드 기능 요약:
 * 1. OperationsManager: 메인 관리자 클래스
 * 2. 모듈 통합: dashboard, loan, return, disposal, utils 모듈 관리
 * 3. 탭 시스템: Bootstrap 탭 기반 모듈 전환
 * 4. 전역 단축키: Ctrl+L(대출), Ctrl+R(반납), Ctrl+D(폐기)
 * 5. 실시간 업데이트: 대시보드 통계 자동 갱신
 */

import DashboardManager from './dashboard/dashboard-manager.js';
import LoanManager from './loan/loan-manager.js';
import ReturnManager from './return/return-manager.js';
import DisposalManager from './disposal/disposal-manager.js';
import UIUtils from '../../../common/ui-utils.js';

/**
 * Operations 메인 관리자 클래스
 */
class OperationsManager {
    constructor() {
        this.modules = {
            dashboard: null,
            loan: null,
            return: null,
            disposal: null
        };
        this.cleanupFunctions = [];
        this.currentActiveModule = null;
        this.initializationStatus = {
            completed: false,
            errors: []
        };
        this.autoRefreshInterval = null;
    }

    /**
     * 초기화
     */
    async initialize() {
        try {
            console.log('Operations 모듈 초기화 시작...');
            
            // 각 모듈 인스턴스 생성
            this.modules.dashboard = new DashboardManager();
            this.modules.loan = new LoanManager();
            this.modules.return = new ReturnManager();
            this.modules.disposal = new DisposalManager();
            
            // 모듈 순차 초기화
            await this.initializeModules();
            
            // 메인 탭 이벤트 설정
            this.setupMainTabEvents();
            
            // 전역 단축키 설정
            this.setupGlobalHotkeys();
            
    // 네비게이션 메뉴 활성화
            this.activateNavMenu();
            
            // 초기 모듈 활성화
            this.activateInitialModule();
            
            // 자동 새로고침 설정
            this.setupAutoRefresh();
            
            this.initializationStatus.completed = true;
            console.log('Operations 모듈 초기화 완료');
            
            // 초기화 완료 이벤트 발생
            this.dispatchInitializationEvent();
            
        } catch (error) {
            console.error('Operations 모듈 초기화 오류:', error);
            this.initializationStatus.errors.push(error.message);
            this.handleInitializationError(error);
        }
    }

    /**
     * 모듈별 초기화
     */
    async initializeModules() {
        const initOrder = ['dashboard', 'loan', 'return', 'disposal'];
        
        for (const moduleKey of initOrder) {
            try {
                console.log(`${moduleKey} 모듈 초기화 중...`);
                
                const module = this.modules[moduleKey];
                if (module && typeof module.initialize === 'function') {
                    await module.initialize();
                    console.log(`${moduleKey} 모듈 초기화 완료`);
                } else {
                    console.warn(`${moduleKey} 모듈을 찾을 수 없거나 초기화 메서드가 없습니다.`);
                }
                
            } catch (error) {
                console.error(`${moduleKey} 모듈 초기화 오류:`, error);
                this.initializationStatus.errors.push(`${moduleKey}: ${error.message}`);
                // 개별 모듈 오류는 전체 초기화를 중단하지 않음
            }
        }
    }

    /**
     * 메인 탭 이벤트 설정
     */
    setupMainTabEvents() {
        const mainTabs = document.querySelectorAll('[data-bs-toggle="tab"][data-operations-module]');
        
        mainTabs.forEach(tab => {
            const handleMainTabChange = (event) => {
                const moduleKey = event.target.dataset.operationsModule;
                this.activateModule(moduleKey);
            };
            
            tab.addEventListener('shown.bs.tab', handleMainTabChange);
            this.cleanupFunctions.push(() => {
                tab.removeEventListener('shown.bs.tab', handleMainTabChange);
            });
        });
    }

    /**
     * 전역 단축키 설정
     */
    setupGlobalHotkeys() {
        const handleKeydown = (event) => {
            // Ctrl + L: 대출 모듈
            if (event.ctrlKey && event.key === 'l') {
                event.preventDefault();
                this.activateModule('loan');
            }
            
            // Ctrl + R: 반납 모듈
            if (event.ctrlKey && event.key === 'r') {
                event.preventDefault();
                this.activateModule('return');
            }
            
            // Ctrl + D: 폐기 모듈
            if (event.ctrlKey && event.key === 'd') {
                event.preventDefault();
                this.activateModule('disposal');
            }
            
            // Ctrl + Shift + D: 대시보드
            if (event.ctrlKey && event.shiftKey && event.key === 'D') {
                event.preventDefault();
                this.activateModule('dashboard');
            }
        };
        
        document.addEventListener('keydown', handleKeydown);
        this.cleanupFunctions.push(() => {
            document.removeEventListener('keydown', handleKeydown);
        });
    }

    /**
     * 네비게이션 메뉴 활성화
     */
    activateNavMenu() {
    // UIUtils를 사용하여 네비게이션 메뉴 활성화
        const navCleanup = UIUtils.activateNavigationItem({
        selector: '.nav-link',
        dataAttribute: 'data-section',
        activeValue: 'operations',
        activeClass: 'active'
    });
        
        if (navCleanup) {
            this.cleanupFunctions.push(navCleanup);
        }
    }

    /**
     * 초기 모듈 활성화
     */
    activateInitialModule() {
        // URL 해시에서 초기 모듈 결정
        const hash = window.location.hash.replace('#', '');
        const initialModule = hash && this.modules[hash] ? hash : 'dashboard';
        
        // 해당 탭 활성화
        const tab = document.querySelector(`[data-operations-module="${initialModule}"]`);
        if (tab) {
            const bsTab = new bootstrap.Tab(tab);
            bsTab.show();
        }
    }

    /**
     * 모듈 활성화
     * @param {string} moduleKey - 활성화할 모듈 키
     */
    activateModule(moduleKey) {
        try {
            const module = this.modules[moduleKey];
            if (!module) {
                console.warn(`모듈 '${moduleKey}'를 찾을 수 없습니다.`);
                return;
            }

            // 이전 모듈 비활성화
            if (this.currentActiveModule && this.currentActiveModule !== moduleKey) {
                this.deactivateModule(this.currentActiveModule);
            }

            this.currentActiveModule = moduleKey;
            
            // 모듈별 특화 활성화 처리
            this.handleModuleActivation(moduleKey, module);
            
            // URL 해시 업데이트
            window.history.replaceState(null, null, `#${moduleKey}`);
            
            console.log(`모듈 '${moduleKey}' 활성화 완료`);
            
        } catch (error) {
            console.error(`모듈 '${moduleKey}' 활성화 오류:`, error);
        }
    }

    /**
     * 모듈별 특화 활성화 처리
     * @param {string} moduleKey - 모듈 키
     * @param {Object} module - 모듈 인스턴스
     */
    handleModuleActivation(moduleKey, module) {
        switch (moduleKey) {
            case 'dashboard':
                // 대시보드 활성화 시 통계 새로고침
                if (typeof module.refreshStats === 'function') {
                    module.refreshStats();
                }
                break;
                
            case 'loan':
                // 대출 모듈 활성화 시 사용 가능한 자산 로드
                if (typeof module.loadAvailableAssets === 'function') {
                    module.loadAvailableAssets();
                }
                break;
                
            case 'return':
                // 반납 모듈 활성화 시 대출 중인 자산 로드
                if (typeof module.loadLoanedAssets === 'function') {
                    module.loadLoanedAssets();
                }
                break;
                
            case 'disposal':
                // 폐기 모듈 활성화 시 폐기 가능한 자산 로드
                if (typeof module.loadAssets === 'function') {
                    module.loadAssets();
                }
                break;
        }
        
        // 공통 활성화 처리
        if (typeof module.onActivate === 'function') {
            module.onActivate();
        }
    }

    /**
     * 모듈 비활성화
     * @param {string} moduleKey - 비활성화할 모듈 키
     */
    deactivateModule(moduleKey) {
        try {
            const module = this.modules[moduleKey];
            if (module && typeof module.onDeactivate === 'function') {
                module.onDeactivate();
            }
        } catch (error) {
            console.error(`모듈 '${moduleKey}' 비활성화 오류:`, error);
        }
    }

    /**
     * 자동 새로고침 설정
     */
    setupAutoRefresh() {
        // 대시보드가 활성화된 경우에만 자동 새로고침
        this.autoRefreshInterval = setInterval(() => {
            if (this.currentActiveModule === 'dashboard') {
                const dashboardModule = this.modules.dashboard;
                if (dashboardModule && typeof dashboardModule.refreshStats === 'function') {
                    dashboardModule.refreshStats();
                }
            }
        }, 30000); // 30초마다 새로고침
        
        this.cleanupFunctions.push(() => {
            if (this.autoRefreshInterval) {
                clearInterval(this.autoRefreshInterval);
            }
        });
    }

    /**
     * 초기화 완료 이벤트 발생
     */
    dispatchInitializationEvent() {
        const event = new CustomEvent('operationsInitialized', {
            detail: {
                modules: Object.keys(this.modules),
                errors: this.initializationStatus.errors
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * 초기화 오류 처리
     */
    handleInitializationError(error) {
        console.error('Operations 초기화 실패:', error);
        
        // 사용자에게 오류 알림
        if (typeof window.showNotification === 'function') {
            window.showNotification('Operations 모듈 초기화 중 오류가 발생했습니다.', 'error');
        }
    }

    /**
     * 모듈 상태 확인
     */
    getModuleStatus() {
        const status = {};
        
        Object.keys(this.modules).forEach(moduleKey => {
            const module = this.modules[moduleKey];
            status[moduleKey] = {
                initialized: module && typeof module.getStatus === 'function' ? 
                    module.getStatus().initialized : false,
                active: this.currentActiveModule === moduleKey
            };
        });
        
        return status;
    }

    /**
     * 특정 모듈 가져오기
     */
    getModule(moduleKey) {
        return this.modules[moduleKey] || null;
    }

    /**
     * 현재 활성 모듈 가져오기
     */
    getCurrentActiveModule() {
        return this.currentActiveModule;
    }

    /**
     * 정리
     */
    cleanup() {
        // 자동 새로고침 중지
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
        }
        
        // 각 모듈 정리
        Object.values(this.modules).forEach(module => {
            if (module && typeof module.cleanup === 'function') {
                module.cleanup();
            }
        });
        
        // 이벤트 리스너 정리
        this.cleanupFunctions.forEach(fn => fn());
        this.cleanupFunctions = [];
        
        console.log('Operations 모듈 정리 완료');
    }

    /**
     * 상태 확인
     */
    getStatus() {
        return {
            initialized: this.initializationStatus.completed,
            errors: this.initializationStatus.errors,
            currentModule: this.currentActiveModule,
            moduleStatus: this.getModuleStatus()
        };
    }
}

// 전역 인스턴스 생성
const operationsManager = new OperationsManager();

// DOM 로드 시 초기화
document.addEventListener('DOMContentLoaded', async function() {
    try {
        await operationsManager.initialize();
    } catch (error) {
        console.error('Operations 초기화 실패:', error);
    }
    
    // 언로드 시 정리
    window.addEventListener('beforeunload', () => {
        operationsManager.cleanup();
    });
});

// 전역 접근을 위한 인스턴스 노출
window.operationsManager = operationsManager; 