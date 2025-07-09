/**
 * 인벤토리 실사 관리 페이지 메인 JavaScript 모듈
 * @module inventory/audit/index
 */
import FormUtils from '../../../../common/form-utils.js';
import UIUtils from '../../../../common/ui-utils.js';
import TableUtils from '../../../../common/table-utils.js';
import ApiUtils from '../../../../common/api-utils.js';

// 이벤트 리스너 정리를 위한 정리 함수 배열
const cleanupFunctions = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('인벤토리 실사 관리 페이지 스크립트 로드됨');
    
    // 실사 목록 테이블 초기화
    const tableCleanup = initAuditTable();
    if (tableCleanup) cleanupFunctions.push(tableCleanup);
    
    // 실사 상태 필터 초기화
    const filterCleanup = initStatusFilters();
    if (filterCleanup) cleanupFunctions.push(filterCleanup);
    
    // 스캐닝 기능 초기화
    const scanningCleanup = initScanningFeature();
    if (scanningCleanup) cleanupFunctions.push(scanningCleanup);
    
    // 실사 계획 생성 모달 초기화
    const modalCleanup = initAuditPlanModal();
    if (modalCleanup) cleanupFunctions.push(modalCleanup);
    
    // DOM 언로드 시 이벤트 리스너 정리
    window.addEventListener('beforeunload', cleanup);
});

/**
 * 실사 목록 테이블 초기화
 * @returns {Function} 이벤트 정리 함수
 */
function initAuditTable() {
    const table = document.querySelector('.audit-table');
    if (!table) return null;
    
    const cleanupFuncs = [];
    
    // TableUtils를 사용하여 테이블 정렬 초기화
    const sortCleanup = TableUtils.initializeTableSorting({
        tableSelector: '.audit-table',
        headerSelector: 'th[data-sort]',
        sortUrlParam: 'sort',
        onSort: (sortField, direction) => {
            // URL 파라미터 업데이트 및 페이지 새로고침
            const url = new URL(window.location);
            if (sortField) {
                const sortValue = direction === 'desc' ? `-${sortField}` : sortField;
                url.searchParams.set('sort', sortValue);
            } else {
                url.searchParams.delete('sort');
            }
            window.location.href = url.toString();
        }
    });
    if (sortCleanup) cleanupFuncs.push(sortCleanup);
    
    // TableUtils를 사용하여 테이블 행 클릭 이벤트 처리
    const rowClickCleanup = TableUtils.initTableRowClick({
        tableSelector: '.audit-table',
        rowSelector: 'tbody tr.audit-row',
        ignoreTags: ['button', 'a', 'input'],
        dataAttribute: 'href',
        onRowClick: (url) => {
            if (url) {
                window.location.href = url;
            }
        }
    });
    if (rowClickCleanup) cleanupFuncs.push(rowClickCleanup);
    
    // 테이블 행 액션 버튼 초기화
    initRowActionButtons();
    
    // 정리 함수 반환
    return function cleanup() {
        cleanupFuncs.forEach(fn => {
            if (typeof fn === 'function') fn();
        });
    };
}

/**
 * 테이블 행 액션 버튼 초기화
 */
function initRowActionButtons() {
    // 시작 버튼
    document.querySelectorAll('.btn-start-audit').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const auditId = this.dataset.auditId;
            if (!auditId) return;
            
            if (confirm('실사를 시작하시겠습니까?')) {
                // API 호출 (시연용: 실제 구현시 실제 API 엔드포인트로 변경 필요)
                ApiUtils.post(`/api/inventory/audits/${auditId}/start`, {}, {
                    handleErrors: true
                })
                .then(response => {
                    UIUtils.showAlert('실사가 시작되었습니다.', 'success');
                    window.location.href = `/inventory/audits/${auditId}/execute`;
                })
                .catch(error => {
                    UIUtils.showAlert('실사 시작 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'), 'danger');
                });
            }
        });
    });
    
    // 보고서 버튼
    document.querySelectorAll('.btn-view-report').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const auditId = this.dataset.auditId;
            if (!auditId) return;
            
            window.location.href = `/inventory/audits/${auditId}/report`;
        });
    });
    
    // 삭제 버튼
    document.querySelectorAll('.btn-delete-audit').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const auditId = this.dataset.auditId;
            const auditName = this.dataset.auditName || '선택한 실사';
            
            if (!auditId) return;
            
            if (confirm(`"${auditName}"을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
                // API 호출 (시연용: 실제 구현시 실제 API 엔드포인트로 변경 필요)
                ApiUtils.delete(`/api/inventory/audits/${auditId}`, {
                    handleErrors: true
                })
                .then(response => {
                    UIUtils.showAlert('실사가 삭제되었습니다.', 'success');
                    
                    // 행 제거
                    const row = button.closest('tr');
                    if (row) {
                        row.remove();
                    }
                })
                .catch(error => {
                    UIUtils.showAlert('실사 삭제 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'), 'danger');
                });
            }
        });
    });
}

/**
 * 실사 상태 필터 초기화
 * @returns {Function} 이벤트 정리 함수
 */
function initStatusFilters() {
    const statusFilters = document.querySelectorAll('.status-filter');
    if (!statusFilters.length) return null;
    
    const handleFilterClick = function(e) {
        e.preventDefault();
        
        const status = this.dataset.status;
        
        // URL 파라미터 업데이트 및 페이지 새로고침
        const url = new URL(window.location);
        if (status && status !== 'all') {
            url.searchParams.set('status', status);
        } else {
            url.searchParams.delete('status');
        }
        window.location.href = url.toString();
    };
    
    statusFilters.forEach(filter => {
        filter.addEventListener('click', handleFilterClick);
    });
    
    // 현재 활성 필터 표시
    const currentStatus = new URL(window.location).searchParams.get('status') || 'all';
    document.querySelector(`.status-filter[data-status="${currentStatus}"]`)?.classList.add('active');
    
    // 정리 함수 반환
    return function cleanup() {
        statusFilters.forEach(filter => {
            filter.removeEventListener('click', handleFilterClick);
        });
    };
}

/**
 * 바코드/QR 코드 스캐닝 기능 초기화
 * @returns {Function} 이벤트 정리 함수
 */
function initScanningFeature() {
    const scanButton = document.getElementById('scanButton');
    const assetIdInput = document.getElementById('assetSearch');
    
    if (!scanButton || !assetIdInput) return null;
    
    const handleScanButtonClick = function() {
        // 실제 구현에서는 바코드 스캐너 API 또는 카메라 API를 사용
        // 여기서는 UIUtils를 사용한 프롬프트로 대체
        UIUtils.showInputPrompt(
            '자산 ID 또는 바코드 값을 입력하세요:',
            '',
            (scannedValue) => {
                if (scannedValue) {
                    assetIdInput.value = scannedValue;
                    assetIdInput.dispatchEvent(new Event('input'));
                }
            }
        );
    };
    
    scanButton.addEventListener('click', handleScanButtonClick);
    
    // 정리 함수 반환
    return function cleanup() {
        scanButton.removeEventListener('click', handleScanButtonClick);
    };
}

/**
 * 실사 계획 생성 모달 초기화
 * @returns {Function} 이벤트 정리 함수
 */
function initAuditPlanModal() {
    const createButton = document.getElementById('createAuditBtn');
    const auditForm = document.getElementById('auditPlanForm');
    
    if (!createButton || !auditForm) return null;
    
    const cleanupFuncs = [];
    
    // 폼 유효성 검사 및 제출 처리
    const formValidatorCleanup = FormUtils.addFormValidator(auditForm, function(formData) {
        const auditName = formData.get('auditName');
        const scheduledDate = formData.get('scheduledDate');
        const locationId = formData.get('locationId');
        
        if (!auditName) {
            UIUtils.showAlert('실사 이름을 입력해주세요.', 'warning');
            return false;
        }
        
        if (!scheduledDate) {
            UIUtils.showAlert('예정일을 선택해주세요.', 'warning');
            return false;
        }
        
        // 입력된 날짜가 오늘 이후인지 확인
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const inputDate = new Date(scheduledDate);
        
        if (inputDate < today) {
            UIUtils.showAlert('예정일은 오늘 이후 날짜여야 합니다.', 'warning');
            return false;
        }
        
        if (!locationId) {
            UIUtils.showAlert('위치를 선택해주세요.', 'warning');
            return false;
        }
        
        return true;
    });
    if (formValidatorCleanup) cleanupFuncs.push(formValidatorCleanup);
    
    // 폼 제출 이벤트 처리
    const handleSubmit = function(e) {
        e.preventDefault();
        
        // 로딩 표시
        UIUtils.toggleLoader(true);
        
        // 폼 데이터 직렬화
        const formData = new FormData(auditForm);
        const data = Object.fromEntries(formData.entries());
        
        // API 호출 (시연용: 실제 구현시 실제 API 엔드포인트로 변경 필요)
        ApiUtils.post('/api/inventory/audits', data, {
            handleErrors: true
        })
        .then(response => {
            UIUtils.showAlert('실사 계획이 성공적으로 생성되었습니다.', 'success');
            
            // 모달 닫기 및 폼 초기화
            UIUtils.toggleModal('#auditPlanModal', 'hide');
            auditForm.reset();
            
            // 페이지 새로고침
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        })
        .catch(error => {
            UIUtils.showAlert('실사 계획 생성 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'), 'danger');
        })
        .finally(() => {
            UIUtils.toggleLoader(false);
        });
    };
    
    auditForm.addEventListener('submit', handleSubmit);
    cleanupFuncs.push(() => auditForm.removeEventListener('submit', handleSubmit));
    
    // 위치 선택에 따른 자산 수량 표시
    const locationSelect = document.getElementById('locationId');
    if (locationSelect) {
        const handleLocationChange = function() {
            const locationId = this.value;
            const assetCountElement = document.getElementById('assetCount');
            
            if (!locationId || !assetCountElement) return;
            
            // 로딩 표시
            assetCountElement.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> 로딩 중...';
            
            // API 호출 (시연용: 실제 구현시 실제 API 엔드포인트로 변경 필요)
            ApiUtils.get(`/api/locations/${locationId}/assets/count`, {
                handleErrors: false,
                showLoader: false
            })
            .then(response => {
                // 시연용 더미 데이터
                const count = Math.floor(Math.random() * 100) + 1;
                assetCountElement.textContent = `이 위치에는 약 ${count}개의 자산이 있습니다.`;
            })
            .catch(error => {
                assetCountElement.textContent = '자산 수량을 불러올 수 없습니다.';
                console.error('자산 수량 조회 오류:', error);
            });
        };
        
        locationSelect.addEventListener('change', handleLocationChange);
        cleanupFuncs.push(() => locationSelect.removeEventListener('change', handleLocationChange));
    }
    
    // 정리 함수 반환
    return function cleanup() {
        cleanupFuncs.forEach(fn => {
            if (typeof fn === 'function') fn();
        });
    };
}

/**
 * 모든 이벤트 리스너 정리
 */
function cleanup() {
    console.log('인벤토리 실사 관리 페이지 이벤트 리스너 정리 중...');
    cleanupFunctions.forEach(fn => {
        if (typeof fn === 'function') fn();
    });
}