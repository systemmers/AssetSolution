/**
 * IP 관리 페이지 JavaScript 기능
 * 공통 모듈을 사용하여 리팩토링됨
 */

// 공통 모듈 가져오기
import UIUtils from '../../../common/ui-utils.js';
import TableUtils from '../../../common/table-utils.js';
import FormUtils from '../../../common/form-utils.js';

document.addEventListener('DOMContentLoaded', function() {
    console.log('IP 관리 페이지 스크립트 로드됨');
    
    // 검색 폼 초기화
    initSearchForm();
    
    // 네트워크 선택기 초기화
    initNetworkSelector();
    
    // IP 추가 모달 초기화
    initIpModal();
    
    // 네트워크 스캔 모달 초기화
    initScanModal();
    
    // 필터 버튼 초기화
    initFilterButtons();
    
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
        submitAfterReset: true
    });
}

/**
 * 네트워크 선택기 초기화
 * FormUtils 모듈을 사용하여 구현
 */
function initNetworkSelector() {
    const networkSelector = document.getElementById('networkSelector');
    if (networkSelector) {
        FormUtils.setupAutoSubmit('networkSelector', null, {
            beforeSubmit: function(value) {
                // 실제 구현에서는 AJAX 호출로 선택된 네트워크 정보를 가져와 업데이트
                console.log('네트워크 변경:', value);
                return false; // 폼 제출 방지 (AJAX 구현 전까지)
            }
        });
    }
}

/**
 * IP 추가 모달 초기화
 * UIUtils와 FormUtils 모듈을 사용하여 구현
 */
function initIpModal() {
    // 모달 설정
    UIUtils.setupModalForm({
        modalId: 'addIpModal',
        formId: 'ipForm',
        saveButtonSelector: '#saveIpButton',
        validateFn: validateIpForm,
        saveFn: saveIpAddress
    });
    
    // 자산 검색 버튼 클릭 이벤트
    UIUtils.setupActionButton(
        document.getElementById('searchAssetButton'), 
        function() {
            // 실제 구현에서는 자산 검색 기능 또는 팝업 표시
            UIUtils.showAlert('자산 검색 기능은 개발 중입니다.', 'info');
        }
    );
}

/**
 * IP 폼 유효성 검사
 * FormUtils 모듈을 사용하여 구현
 * @returns {boolean} 폼이 유효한지 여부
 */
function validateIpForm() {
    const ipAddress = document.getElementById('ipAddress');
    let isValid = true;
    
    // IP 주소 필드 검사
    if (!ipAddress || !ipAddress.value.trim()) {
        FormUtils.setFieldValidState(ipAddress, false, 'IP 주소를 입력하세요.');
        isValid = false;
    } else {
        // IP 주소 형식 검사 (정규식)
        const ipPattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        
        if (!ipPattern.test(ipAddress.value.trim())) {
            FormUtils.setFieldValidState(ipAddress, false, '유효한 IP 주소 형식이 아닙니다.');
            isValid = false;
        } else {
            FormUtils.setFieldValidState(ipAddress, true);
        }
    }
    
    return isValid;
}

/**
 * IP 주소 저장 함수
 * UIUtils 모듈을 사용하여 구현
 */
function saveIpAddress() {
    // 실제 구현에서는 AJAX 호출로 IP 추가
    UIUtils.showAlert('IP 주소가 추가/수정되었습니다.', 'success');
    
    // 모달 닫기
    UIUtils.toggleModal('addIpModal', 'hide');
    
    // 폼 초기화
    FormUtils.resetForm('ipForm');
}

/**
 * 네트워크 스캔 모달 초기화
 * UIUtils 모듈을 사용하여 구현
 */
function initScanModal() {
    // 모달 설정
    UIUtils.setupModalForm({
        modalId: 'scanNetworkModal',
        formId: 'scanForm',
        saveButtonSelector: '#startScanButton',
        validateFn: function() { return true; }, // 항상 유효
        saveFn: startNetworkScan
    });
}

/**
 * 네트워크 스캔 시작 함수
 * UIUtils 모듈을 사용하여 구현
 */
function startNetworkScan() {
    // 실제 구현에서는 AJAX 호출로 스캔 시작
    UIUtils.showAlert('네트워크 스캔이 시작되었습니다. 스캔 결과가 완료되면 자동으로 업데이트됩니다.', 'info');
    
    // 모달 닫기
    UIUtils.toggleModal('scanNetworkModal', 'hide');
}

/**
 * 필터 버튼 초기화
 * UIUtils 모듈을 사용하여 구현
 */
function initFilterButtons() {
    const filterButtons = [
        document.getElementById('viewAllButton'),
        document.getElementById('viewUsedButton'),
        document.getElementById('viewReservedButton'),
        document.getElementById('viewAvailableButton')
    ];
    
    filterButtons.forEach(function(button) {
        if (button) {
            UIUtils.setupActionButton(button, function() {
                // 현재 활성화된 버튼 비활성화, 클릭된 버튼 활성화
                UIUtils.setActiveElement(filterButtons, this);
                
                // 실제 구현에서는 AJAX로 필터링된 데이터 가져오기
                console.log('필터 버튼 클릭:', this.id);
                
                // 필터링 로직 구현 (서버 측 필터링으로 대체 예정)
                filterIpAddresses(this.id);
            });
        }
    });
}

/**
 * IP 주소 필터링 함수 (프론트엔드 데모용)
 * TableUtils와 UIUtils 모듈을 사용하여 구현
 * @param {string} filterId - 필터 버튼 ID
 */
function filterIpAddresses(filterId) {
    // 서버 측 필터링이 구현되기 전까지 임시로 프론트엔드에서 처리
    // 실제 구현에서는 AJAX 요청으로 대체될 예정
    const rows = document.querySelectorAll('.ip-row');
    
    rows.forEach(row => {
        const statusBadge = row.querySelector('.badge');
        if (!statusBadge) return;
        
        const statusText = statusBadge.textContent.toLowerCase();
        let visible = false;
        
        if (filterId === 'viewAllButton') {
            visible = true;
        } else if (filterId === 'viewUsedButton' && statusText.includes('사용중')) {
            visible = true;
        } else if (filterId === 'viewReservedButton' && statusText.includes('예약됨')) {
            visible = true;
        } else if (filterId === 'viewAvailableButton' && statusText.includes('사용 가능')) {
            visible = true;
        }
        
        UIUtils.toggleElementVisibility(row, visible);
    });
}

/**
 * 페이지 언로드 시 이벤트 리스너 정리
 */
function cleanup() {
    // 이벤트 리스너 정리
    const networkSelector = document.getElementById('networkSelector');
    if (networkSelector) {
        networkSelector.removeEventListener('change', null);
    }
    
    const searchAssetButton = document.getElementById('searchAssetButton');
    if (searchAssetButton) {
        searchAssetButton.removeEventListener('click', null);
    }
    
    const filterButtons = [
        document.getElementById('viewAllButton'),
        document.getElementById('viewUsedButton'),
        document.getElementById('viewReservedButton'),
        document.getElementById('viewAvailableButton')
    ];
    
    filterButtons.forEach(button => {
        if (button) button.removeEventListener('click', null);
    });
} 