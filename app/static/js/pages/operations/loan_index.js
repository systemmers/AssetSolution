/**
 * 자산 대여 목록 페이지 JavaScript
 * 공통 모듈을 사용하여 리팩토링됨
 */

// 공통 모듈 가져오기
import UIUtils from '../../../common/ui-utils.js';
import FormUtils from '../../../common/form-utils.js';
import NavigationUtils from '../../../common/navigation-utils.js';

// 이벤트 리스너 정리를 위한 정리 함수 배열
const cleanupFunctions = [];

document.addEventListener('DOMContentLoaded', function() {
    // 네비게이션 메뉴 활성화
    const navCleanup = activateNavMenu();
    if (navCleanup) cleanupFunctions.push(navCleanup);
    
    // 필터 초기화 버튼
    const resetCleanup = initResetButton();
    if (resetCleanup) cleanupFunctions.push(resetCleanup);
    
    // 빠른 필터 버튼
    const quickFilterCleanup = initQuickFilterButtons();
    if (quickFilterCleanup) cleanupFunctions.push(quickFilterCleanup);
    
    // DOM 언로드 시 이벤트 리스너 정리
    window.addEventListener('beforeunload', cleanupEventListeners);
});

/**
 * 네비게이션 메뉴 활성화 함수
 * 현재 페이지에 해당하는 네비게이션 항목을 활성화
 */
function activateNavMenu() {
    // UIUtils를 사용하여 네비게이션 메뉴 활성화
    return UIUtils.activateNavigationItem({
        selector: '.nav-link',
        dataAttribute: 'data-section',
        activeValue: 'operations',
        activeClass: 'active'
    });
}

/**
 * 필터 초기화 버튼 초기화 함수
 * 검색 필터를 초기 상태로 재설정
 */
function initResetButton() {
    const resetButton = document.getElementById('resetButton');
    if (!resetButton) return null;
    
    // 버튼 클릭 핸들러
    const handleResetClick = function() {
        // FormUtils를 사용하여 폼 필드 초기화
        FormUtils.resetFormFields('searchForm', [
            'searchKeyword',
            'statusFilter',
            'departmentFilter',
            'startDate',
            'endDate'
        ]);
        
        // 폼 제출
        document.getElementById('searchForm').submit();
    };
    
    // 이벤트 리스너 등록
    resetButton.addEventListener('click', handleResetClick);
    
    // 정리 함수 반환
    return function cleanup() {
        resetButton.removeEventListener('click', handleResetClick);
    };
}

/**
 * 빠른 필터 버튼 초기화 함수
 * 자주 사용하는 필터링 조건을 버튼으로 제공
 */
function initQuickFilterButtons() {
    // 버튼 요소 선택
    const buttons = {
        all: document.getElementById('viewAllBtn'),
        loaned: document.getElementById('viewLoanedBtn'),
        overdue: document.getElementById('viewOverdueBtn'),
        today: document.getElementById('viewTodayBtn')
    };
    
    // 모든 버튼이 없는 경우
    if (!buttons.all && !buttons.loaned && !buttons.overdue && !buttons.today) return null;
    
    // URL 설정
    const baseUrl = '/operations/loans';
    const urlConfigs = {
        all: baseUrl,
        loaned: baseUrl + '?status=대여중',
        overdue: baseUrl + '?status=overdue',
        today: baseUrl + '?due=today'
    };
    
    // 이벤트 핸들러와 리스너 등록
    const eventHandlers = {};
    const cleanupFuncs = [];
    
    // NavigationUtils를 사용하여 버튼 이벤트 등록
    Object.keys(buttons).forEach(key => {
        const button = buttons[key];
        if (button) {
            eventHandlers[key] = () => {
                NavigationUtils.navigateTo(urlConfigs[key]);
            };
            
            button.addEventListener('click', eventHandlers[key]);
            
            cleanupFuncs.push(() => {
                button.removeEventListener('click', eventHandlers[key]);
            });
        }
    });
    
    // 정리 함수 반환
    return function cleanup() {
        cleanupFuncs.forEach(fn => fn());
    };
}

/**
 * 페이지 언로드 시 이벤트 리스너 정리
 * 메모리 누수 방지를 위한 정리 작업 수행
 */
function cleanupEventListeners() {
    // 등록된 모든 정리 함수 실행
    cleanupFunctions.forEach(cleanup => {
        if (typeof cleanup === 'function') {
            cleanup();
        }
    });
    
    console.log('자산 대여 목록 페이지 이벤트 리스너 정리');
} 