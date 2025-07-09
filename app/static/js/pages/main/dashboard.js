/**
 * 대시보드 페이지 JavaScript 기능
 * 모듈화된 구조로 리팩토링됨
 * 
 * @author Asset Management System
 * @version 2.0.0
 */

// Core 모듈 가져오기
import MainDashboard from './core/main-dashboard.js';
import MainWidgets from './core/main-widgets.js';
import MainManager from './core/main-manager.js';

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', async function() {
    console.log('대시보드 페이지 초기화 시작...');
    
    try {
        // Main Manager 초기화
        const mainManager = new MainManager();

        // 모듈 인스턴스 생성
        const mainDashboard = new MainDashboard();
        const mainWidgets = new MainWidgets();

        // 모듈 등록
        mainManager.registerModule('dashboard', mainDashboard);
        mainManager.registerModule('widgets', mainWidgets);
    
        // Manager를 통한 통합 초기화
        const success = await mainManager.initialize();
        
        if (success) {
            console.log('대시보드 페이지 초기화 완료');
    
            // 전역 접근을 위해 Manager 저장
            window.MainManager = mainManager;
        } else {
            console.error('대시보드 초기화 실패');
        }
        
        } catch (error) {
        console.error('대시보드 초기화 중 오류:', error);
        }
});

// 기존 함수들은 core 모듈로 이동되었습니다.
// 필요시 MainManager를 통해 모듈 기능에 접근할 수 있습니다.

/**
 * 외부에서 사용할 수 있는 헬퍼 함수들
 */

/**
 * 자산 검색 (외부 API용)
 * @param {string} searchText - 검색어
 */
window.searchAssets = function(searchText) {
    if (window.MainManager) {
        const dashboard = window.MainManager.modules.get('dashboard')?.instance;
        if (dashboard) {
            return dashboard.searchAssets(searchText);
        }
    }
    console.warn('Dashboard 모듈이 초기화되지 않았습니다.');
    return Promise.resolve({ results: [], total: 0 });
};

/**
 * 계약 검색 (외부 API용)
 * @param {string} searchText - 검색어
 */
window.searchContracts = function(searchText) {
    if (window.MainManager) {
        const dashboard = window.MainManager.modules.get('dashboard')?.instance;
        if (dashboard) {
            return dashboard.searchContracts(searchText);
        }
    }
    console.warn('Dashboard 모듈이 초기화되지 않았습니다.');
    return Promise.resolve({ results: [], total: 0 });
};

/**
 * 대시보드 새로고침 (외부 API용)
 */
window.refreshDashboard = function() {
    if (window.MainManager) {
        const dashboard = window.MainManager.modules.get('dashboard')?.instance;
        if (dashboard) {
            return dashboard.refreshDashboardData(true);
            }
        }
    console.warn('Dashboard 모듈이 초기화되지 않았습니다.');
    return Promise.resolve(false);
}; 