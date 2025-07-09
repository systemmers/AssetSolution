/**
 * 사용자 목록 필터 관리 모듈
 * @module users/list/filters-manager
 */
import FormUtils from '../../../../common/form-utils.js';
import UIUtils from '../../../../common/ui-utils.js';

/**
 * 필터 및 검색 기능 초기화
 * @returns {Function} 이벤트 정리 함수
 */
export function initFilters() {
    const searchForm = document.getElementById('searchForm');
    if (!searchForm) return null;
    
    const cleanupFuncs = [];
    
    // FormUtils를 사용하여 선택 필드 자동 제출 설정
    const autoSubmitCleanup = FormUtils.setupAutoSubmitFields({
        formId: 'searchForm',
        fieldSelectors: 'select'
    });
    if (autoSubmitCleanup) cleanupFuncs.push(autoSubmitCleanup);
    
    // FormUtils를 사용하여 검색 입력 필드에서 Enter 키 처리
    const searchInputCleanup = FormUtils.setupSearchInput('searchKeyword', 'searchForm');
    if (searchInputCleanup) cleanupFuncs.push(searchInputCleanup);
    
    // UIUtils를 사용하여 필터 초기화 버튼 설정
    const resetButtonCleanup = UIUtils.setupActionButton('#resetButton', () => {
        FormUtils.resetForm('searchForm', true);
    });
    if (resetButtonCleanup) cleanupFuncs.push(resetButtonCleanup);
    
    // UIUtils를 사용하여 반응형 버튼 텍스트 관리
    const responsiveButtonsCleanup = UIUtils.handleResponsiveButtons('.responsive-btn', 768, 'data-full-text');
    if (responsiveButtonsCleanup) cleanupFuncs.push(responsiveButtonsCleanup);
    
    // 정리 함수 반환
    return function cleanup() {
        cleanupFuncs.forEach(fn => {
            if (typeof fn === 'function') fn();
        });
    };
} 