/**
 * PC 관리 페이지 JavaScript 기능
 * 공통 모듈을 사용하여 리팩토링됨
 */

// 공통 모듈 가져오기
import UIUtils from '../../../common/ui-utils.js';
import TableUtils from '../../../common/table-utils.js';
import FormUtils from '../../../common/form-utils.js';

document.addEventListener('DOMContentLoaded', function() {
    console.log('PC 관리 페이지 스크립트 로드됨');
    
    // 검색 폼 초기화
    initSearchForm();
    
    // 테이블 행 클릭 이벤트
    initTableRowClick();
    
    // 동기화 모달 초기화
    initSyncModal();
    
    // 이벤트 리스너 정리 등록
    window.addEventListener('beforeunload', cleanup);
});

/**
 * 검색 폼 초기화 함수
 * FormUtils 모듈을 사용하여 구현
 */
function initSearchForm() {
    // 초기화 버튼 설정
    FormUtils.initFilterReset({
        resetButtonSelector: '#resetButton',
        formSelector: '#searchForm',
        submitAfterReset: true,
        resetCheckboxes: true
    });
    
    // 셀렉트 박스 변경 시 자동 제출
    const autoSubmitSelects = ['sortOrder', 'osFilter', 'statusFilter', 'departmentFilter'];
    autoSubmitSelects.forEach(selectId => {
        FormUtils.setupAutoSubmit(selectId, 'searchForm');
    });
    
    // 체크박스 변경 시 자동 제출
    const autoSubmitCheckboxes = ['updateFilter', 'securityFilter'];
    autoSubmitCheckboxes.forEach(checkboxId => {
        FormUtils.setupAutoSubmit(checkboxId, 'searchForm');
    });
}

/**
 * 테이블 행 클릭 이벤트 초기화
 * TableUtils 모듈을 사용하여 구현
 */
function initTableRowClick() {
    TableUtils.initTableRowClick({
        rowSelector: '.pc-row',
        clickHandler: function(e, row) {
            if (!e.target.closest('button')) {
                window.location.href = row.dataset.href;
            }
        }
    });
}

/**
 * 동기화 모달 초기화
 * UIUtils와 FormUtils 모듈을 사용하여 구현
 */
function initSyncModal() {
    // 모달 설정
    UIUtils.setupModalForm({
        modalId: 'syncModal',
        formId: 'syncForm',
        saveButtonSelector: '.modal-footer .btn-primary',
        validateFn: function() { return true; }, // 항상 유효
        saveFn: startPcSync
    });
    
    // 동기화 방식 라디오 버튼 변경 이벤트
    const syncMethodRadios = document.querySelectorAll('input[name="syncMethod"]');
    
    syncMethodRadios.forEach(radio => {
        UIUtils.setupActionButton(radio, function() {
            // 필요한 경우 동기화 방식에 따라 UI 업데이트
            console.log('선택된 동기화 방식:', this.id);
            
            // 선택된 방식에 따라 추가 옵션 표시/숨김 처리
            updateSyncOptions(this.id);
        }, 'change');
    });
}

/**
 * 동기화 방식에 따른 옵션 업데이트
 * UIUtils 모듈을 사용하여 구현
 * @param {string} syncMethodId - 선택된 동기화 방식 ID
 */
function updateSyncOptions(syncMethodId) {
    // 각 동기화 방식에 따른 추가 옵션 컨테이너
    const fullSyncOptions = document.getElementById('fullSyncOptions');
    const incrementalSyncOptions = document.getElementById('incrementalSyncOptions');
    
    if (fullSyncOptions && incrementalSyncOptions) {
        // 선택된 방식에 따라 표시/숨김 처리
        UIUtils.toggleElementVisibility(fullSyncOptions, syncMethodId === 'syncMethodFull');
        UIUtils.toggleElementVisibility(incrementalSyncOptions, syncMethodId === 'syncMethodIncremental');
    }
}

/**
 * PC 동기화 시작 함수
 * UIUtils 모듈을 사용하여 구현
 */
function startPcSync() {
    // 실제 구현에서는 AJAX 호출로 백엔드 동기화 API 호출
    UIUtils.showAlert('PC 정보 동기화가 시작되었습니다.', 'info');
    
    // 모달 닫기
    UIUtils.toggleModal('syncModal', 'hide');
}

/**
 * 페이지 언로드 시 이벤트 리스너 정리
 */
function cleanup() {
    // 이벤트 리스너 정리
    document.querySelectorAll('input[name="syncMethod"]').forEach(radio => {
        radio.removeEventListener('change', null);
    });
} 