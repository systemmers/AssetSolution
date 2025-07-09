/**
 * 인벤토리 목록 필터 관리 모듈
 * @module inventory/list/filters-manager
 */
import FormUtils from '../../../../common/form-utils.js';

/**
 * 검색 및 필터링 기능 초기화
 * @returns {Function} 이벤트 정리 함수
 */
export function initSearchFilters() {
    const searchForm = document.getElementById('searchForm');
    if (!searchForm) return null;
    
    const cleanupFuncs = [];
    
    // FormUtils를 사용하여 검색 필드 초기화
    const searchCleanup = FormUtils.setupDelayedSubmit({
        inputId: 'searchQuery',
        formId: 'searchForm',
        minLength: 3,
        delayMs: 500,
        allowEmpty: true
    });
    if (searchCleanup) cleanupFuncs.push(searchCleanup);
    
    // FormUtils를 사용하여 필터 선택 시 자동 제출 설정
    const autoSubmitCleanup = FormUtils.setupAutoSubmitFields({
        formId: 'searchForm',
        fieldSelectors: 'select'
    });
    if (autoSubmitCleanup) cleanupFuncs.push(autoSubmitCleanup);
    
    // FormUtils를 사용하여 초기화 버튼 설정
    const resetCleanup = FormUtils.initFilterReset('resetFilters', 'searchForm', true);
    if (resetCleanup) cleanupFuncs.push(resetCleanup);
    
    // 정리 함수 반환
    return function cleanup() {
        cleanupFuncs.forEach(fn => {
            if (typeof fn === 'function') fn();
        });
    };
} 