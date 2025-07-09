/**
 * SW 라이선스 관리 페이지 JavaScript 기능
 * 공통 모듈을 사용하여 리팩토링됨
 */

// 공통 모듈 가져오기
import UIUtils from '../../../common/ui-utils.js';
import TableUtils from '../../../common/table-utils.js';
import FormUtils from '../../../common/form-utils.js';

document.addEventListener('DOMContentLoaded', function() {
    console.log('SW 라이선스 관리 페이지 스크립트 로드됨');
    
    // 검색 폼 초기화
    initSearchForm();
    
    // 테이블 행 클릭 이벤트
    initTableRowClick();
    
    // 필터 버튼 초기화
    initFilterButtons();
    
    // 라이선스 키 보기 버튼 초기화
    initLicenseKeyButtons();
    
    // 라이선스 추가 모달 초기화
    initLicenseModal();
    
    // 라이선스 가져오기 모달 초기화
    initImportModal();
    
    // 툴팁 초기화
    UIUtils.initTooltips();
    
    // 페이지 언로드 시 이벤트 리스너 정리
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
        submitAfterReset: true
    });
    
    // 셀렉트 박스 변경 시 자동 제출
    const autoSubmitSelects = ['swTypeFilter', 'statusFilter', 'departmentFilter'];
    autoSubmitSelects.forEach(selectId => {
        FormUtils.setupAutoSubmit(selectId, 'searchForm');
    });
}

/**
 * 테이블 행 클릭 이벤트 초기화
 * TableUtils 모듈을 사용하여 구현
 */
function initTableRowClick() {
    TableUtils.initTableRowClick({
        rowSelector: '.license-row',
        clickHandler: function(e, row) {
            // 버튼 클릭은 무시
            if (!e.target.closest('button') && !e.target.closest('.license-key')) {
                window.location.href = row.dataset.href || '#';
            }
        }
    });
}

/**
 * 필터 버튼 초기화
 * UIUtils 모듈을 사용하여 구현
 */
function initFilterButtons() {
    const filterButtons = [
        document.getElementById('viewAllButton'),
        document.getElementById('viewActiveButton'),
        document.getElementById('viewExpiringButton'),
        document.getElementById('viewExpiredButton')
    ];
    
    filterButtons.forEach(function(button) {
        if (button) {
            UIUtils.setupActionButton(button, function() {
                // 현재 활성화된 버튼 비활성화
                UIUtils.setActiveElement(filterButtons, button);
                
                // 실제 구현에서는 AJAX로 필터링된 데이터 가져오기
                console.log('필터 버튼 클릭:', this.id);
                
                // 필터링 적용
                filterLicenses(this.id);
            });
        }
    });
}

/**
 * 라이선스 필터링 함수 (프론트엔드 데모용)
 * TableUtils 모듈과 UIUtils 모듈을 사용하여 구현
 */
function filterLicenses(filterId) {
    const rows = document.querySelectorAll('.license-row');
    
    rows.forEach(row => {
        const statusBadge = row.querySelector('.badge');
        if (!statusBadge) return;
        
        const statusText = statusBadge.textContent.toLowerCase();
        let visible = false;
        
        if (filterId === 'viewAllButton') {
            visible = true;
        } else if (filterId === 'viewActiveButton' && statusText.includes('사용중')) {
            visible = true;
        } else if (filterId === 'viewExpiringButton' && statusText.includes('만료 예정')) {
            visible = true;
        } else if (filterId === 'viewExpiredButton' && statusText.includes('만료됨')) {
            visible = true;
        }
        
        UIUtils.toggleElementVisibility(row, visible);
    });
}

/**
 * 라이선스 키 보기 버튼 초기화
 * UIUtils 모듈을 사용하여 구현
 */
function initLicenseKeyButtons() {
    document.querySelectorAll('.show-key-btn').forEach(function(button) {
        UIUtils.setupActionButton(button, function(e) {
            e.stopPropagation(); // 행 클릭 이벤트 전파 방지
            
            const keyElement = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            if (keyElement.classList.contains('license-key')) {
                // 마스킹된 키에서 실제 키로 전환
                if (keyElement.dataset.realKey) {
                    keyElement.textContent = keyElement.dataset.realKey;
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    // 실제로는 서버에서 데이터를 가져오는 로직이 필요합니다
                    // 데모용으로 가상의 키를 생성합니다
                    const fakeKey = 'ABCDE-FGHIJ-KLMNO-PQRST-' + keyElement.textContent.split('-').pop();
                    keyElement.dataset.realKey = fakeKey;
                    keyElement.textContent = fakeKey;
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                }
            }
        });
    });
}

/**
 * 라이선스 추가 모달 초기화
 * UIUtils와 FormUtils 모듈을 사용하여 구현
 */
function initLicenseModal() {
    // 모달 설정
    UIUtils.setupModalForm({
        modalId: 'addLicenseModal',
        formId: 'licenseForm',
        saveButtonSelector: '#saveLicenseButton',
        validateFn: validateLicenseForm,
        saveFn: saveLicense
    });
    
    // 영구 라이선스 체크박스 이벤트
    const isPerpetualCheck = document.getElementById('isPerpetual');
    const expiryDateInput = document.getElementById('expiryDate');
    
    if (isPerpetualCheck && expiryDateInput) {
        UIUtils.setupActionButton(isPerpetualCheck, function() {
            FormUtils.toggleFieldState(expiryDateInput, !this.checked, {
                clearValue: this.checked
            });
        }, 'change');
    }
}

/**
 * 라이선스 폼 유효성 검사
 * FormUtils 모듈을 사용하여 구현
 * @returns {boolean} 폼이 유효한지 여부
 */
function validateLicenseForm() {
    return FormUtils.validateRequiredFields('licenseForm', {
        highlightInvalid: true,
        removeValidation: true
    });
}

/**
 * 라이선스 저장 함수
 * UIUtils 모듈을 사용하여 구현
 */
function saveLicense() {
    // 실제 구현에서는 AJAX 호출로 라이선스 추가
    UIUtils.showAlert('라이선스가 추가되었습니다.', 'success');
    
    // 모달 닫기
    UIUtils.toggleModal('addLicenseModal', 'hide');
    
    // 폼 초기화
    FormUtils.resetForm('licenseForm');
}

/**
 * 라이선스 가져오기 모달 초기화
 * UIUtils와 FormUtils 모듈을 사용하여 구현
 */
function initImportModal() {
    // 모달 설정
    UIUtils.setupModalForm({
        modalId: 'importModal',
        formId: 'importForm',
        saveButtonSelector: '#importButton',
        validateFn: validateImportForm,
        saveFn: importLicenses
    });
}

/**
 * 가져오기 폼 유효성 검사
 * FormUtils 모듈을 사용하여 구현
 * @returns {boolean} 폼이 유효한지 여부
 */
function validateImportForm() {
    const importFile = document.getElementById('importFile');
    const isValid = importFile && importFile.files.length > 0;
    
    FormUtils.setFieldValidState(importFile, isValid, '가져올 파일을 선택해주세요');
    
    return isValid;
}

/**
 * 라이선스 가져오기 함수
 * UIUtils 모듈을 사용하여 구현
 */
function importLicenses() {
    // 실제 구현에서는 AJAX 호출로 파일 업로드 및 가져오기
    UIUtils.showAlert('라이선스 가져오기가 시작되었습니다.', 'info');
    
    // 모달 닫기
    UIUtils.toggleModal('importModal', 'hide');
    
    // 폼 초기화
    FormUtils.resetForm('importForm');
}

/**
 * 페이지 언로드 시 이벤트 리스너 정리
 */
function cleanup() {
    // 이벤트 리스너 정리
    document.querySelectorAll('.show-key-btn').forEach(button => {
        button.removeEventListener('click', null);
    });
    
    const filterButtons = [
        document.getElementById('viewAllButton'),
        document.getElementById('viewActiveButton'),
        document.getElementById('viewExpiringButton'),
        document.getElementById('viewExpiredButton')
    ];
    
    filterButtons.forEach(button => {
        if (button) button.removeEventListener('click', null);
    });
    
    const isPerpetualCheck = document.getElementById('isPerpetual');
    if (isPerpetualCheck) {
        isPerpetualCheck.removeEventListener('change', null);
    }
} 