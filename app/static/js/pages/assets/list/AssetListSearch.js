/**
 * 자산 목록 검색 모듈
 * 자산 목록 페이지의 검색 및 필터링 기능을 담당합니다.
 */

import FormUtils from '../../../common/form-utils.js';
import UIUtils from '../../../common/ui-utils.js';

/**
 * 검색 폼 초기화 함수
 */
function initSearchForm() {
    // 검색 폼 초기화
    FormUtils.setupForm('searchForm', {
        onSubmit: function(e, formData) {
            // 검색 중 로딩 표시
            UIUtils.toggleLoader(true, '자산을 검색 중입니다...');
            return true; // 폼 제출 계속 진행
        }
    });
    
    // 필터 초기화 버튼
    FormUtils.initFilterReset({
        resetButtonSelector: '#resetButton',
        formSelector: '#searchForm',
        submitAfterReset: true,
        callback: function() {
            UIUtils.showAlert('검색 필터가 초기화되었습니다.', 'info', 2000);
        }
    });
    
    // 자동 제출되는 셀렉트 필드
    const autoSubmitSelects = ['sortOrder', 'categoryFilter', 'statusFilter', 'departmentFilter'];
    autoSubmitSelects.forEach(selectId => {
        const selectElement = document.getElementById(selectId);
        if (selectElement) {
            FormUtils.setupAutoSubmit(selectId, 'searchForm');
        }
    });
    
    // 자동 제출되는 체크박스
    const autoSubmitCheckboxes = ['expiredFilter', 'unusedFilter'];
    autoSubmitCheckboxes.forEach(checkboxId => {
        const checkboxElement = document.getElementById(checkboxId);
        if (checkboxElement) {
            FormUtils.setupAutoSubmit(checkboxId, 'searchForm');
        }
    });
    
    // 고급 검색 토글 버튼
    initAdvancedSearch();
    
    // 날짜 범위 필터 초기화
    initDatePickers();
}

/**
 * 고급 검색 토글 기능 초기화
 */
function initAdvancedSearch() {
    const advancedSearchToggle = document.getElementById('advancedSearchToggle');
    const advancedSearchFields = document.getElementById('advancedSearchFields');
    
    if (advancedSearchToggle && advancedSearchFields) {
        UIUtils.setupActionButton(advancedSearchToggle, function() {
            UIUtils.toggleElementVisibility(advancedSearchFields);
            
            // 아이콘 및 텍스트 변경
            const icon = advancedSearchToggle.querySelector('i');
            const isVisible = advancedSearchFields.style.display !== 'none';
            
            if (icon) {
                icon.className = isVisible ? 'fas fa-angle-up' : 'fas fa-angle-down';
            }
            
            advancedSearchToggle.querySelector('span').textContent = 
                isVisible ? '고급 검색 닫기' : '고급 검색 열기';
        });
    }
}

/**
 * 날짜 선택기 초기화
 */
function initDatePickers() {
    FormUtils.initializeDatePickers([
        document.getElementById('startDate'), 
        document.getElementById('endDate')
    ], {
        format: 'yyyy-mm-dd',
        autoclose: true
    });
}

// 공개 API
export {
    initSearchForm,
    initAdvancedSearch,
    initDatePickers
}; 