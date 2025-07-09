/**
 * 인벤토리 이동 관리 페이지 메인 JavaScript 모듈
 * @module inventory/movement/index
 */
import FormUtils from '../../../../common/form-utils.js';
import UIUtils from '../../../../common/ui-utils.js';
import TableUtils from '../../../../common/table-utils.js';
import ApiUtils from '../../../../common/api-utils.js';

// 이벤트 리스너 정리를 위한 정리 함수 배열
const cleanupFunctions = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('인벤토리 이동 관리 페이지 스크립트 로드됨');
    
    // 폼 초기화
    const formCleanup = initMovementForm();
    if (formCleanup) cleanupFunctions.push(formCleanup);
    
    // 자산 검색 및 선택 초기화
    const assetSearchCleanup = initAssetSearch();
    if (assetSearchCleanup) cleanupFunctions.push(assetSearchCleanup);
    
    // 위치 선택 초기화
    const locationCleanup = initLocationSelection();
    if (locationCleanup) cleanupFunctions.push(locationCleanup);
    
    // 이동 이력 테이블 초기화
    const tableCleanup = initMovementHistoryTable();
    if (tableCleanup) cleanupFunctions.push(tableCleanup);
    
    // DOM 언로드 시 이벤트 리스너 정리
    window.addEventListener('beforeunload', cleanup);
});

/**
 * 이동 폼 초기화
 * @returns {Function} 이벤트 정리 함수
 */
function initMovementForm() {
    const form = document.getElementById('movementForm');
    if (!form) return null;
    
    const cleanupFuncs = [];
    
    // 폼 유효성 검사 및 제출 처리
    const formValidatorCleanup = FormUtils.addFormValidator(form, function(formData) {
        // 여기에 커스텀 유효성 검사 로직 추가
        const assetId = formData.get('assetId');
        const toLocationId = formData.get('toLocationId');
        const movementReason = formData.get('movementReason');
        
        if (!assetId) {
            UIUtils.showAlert('자산을 선택해주세요.', 'warning');
            return false;
        }
        
        if (!toLocationId) {
            UIUtils.showAlert('이동할 위치를 선택해주세요.', 'warning');
            return false;
        }
        
        if (!movementReason) {
            UIUtils.showAlert('이동 사유를 입력해주세요.', 'warning');
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
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // API 호출 (시연용: 실제 구현시 실제 API 엔드포인트로 변경 필요)
        ApiUtils.post('/api/inventory/movements', data, {
            handleErrors: true
        })
        .then(response => {
            UIUtils.showAlert('자산 이동이 성공적으로 등록되었습니다.', 'success');
            form.reset();
            
            // 이동 이력 테이블 갱신
            refreshMovementHistory();
        })
        .catch(error => {
            UIUtils.showAlert('자산 이동 등록 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'), 'danger');
        })
        .finally(() => {
            UIUtils.toggleLoader(false);
        });
    };
    
    form.addEventListener('submit', handleSubmit);
    cleanupFuncs.push(() => form.removeEventListener('submit', handleSubmit));
    
    // 취소 버튼 이벤트 처리
    const cancelButton = form.querySelector('button[type="button"]');
    if (cancelButton) {
        const handleCancel = function() {
            if (confirm('작성 중인 내용이 있습니다. 취소하시겠습니까?')) {
                form.reset();
            }
        };
        
        cancelButton.addEventListener('click', handleCancel);
        cleanupFuncs.push(() => cancelButton.removeEventListener('click', handleCancel));
    }
    
    // 정리 함수 반환
    return function cleanup() {
        cleanupFuncs.forEach(fn => {
            if (typeof fn === 'function') fn();
        });
    };
}

/**
 * 자산 검색 및 선택 초기화
 * @returns {Function} 이벤트 정리 함수
 */
function initAssetSearch() {
    const assetSearchInput = document.getElementById('assetSearch');
    const assetSelect = document.getElementById('assetId');
    
    if (!assetSearchInput || !assetSelect) return null;
    
    const handleSearch = function() {
        const query = this.value.trim();
        
        if (!query || query.length < 3) {
            return;
        }
        
        // 로딩 표시
        UIUtils.toggleLoader(true, '.asset-search-loader');
        
        // API 호출 (시연용: 실제 구현시 실제 API 엔드포인트로 변경 필요)
        ApiUtils.get('/api/assets/search', {
            query: query
        })
        .then(response => {
            // 시연용 더미 데이터
            const assets = [
                { id: 'A001', name: '노트북 Dell XPS 13', location: '본사 3층 개발팀' },
                { id: 'A002', name: '모니터 LG 27인치', location: '본사 2층 회의실' },
                { id: 'A003', name: '키보드 Logitech MX Keys', location: '본사 3층 개발팀' }
            ];
            
            // 검색 결과로 선택 상자 업데이트
            updateAssetSelectOptions(assets);
        })
        .catch(error => {
            UIUtils.showAlert('자산 검색 중 오류가 발생했습니다.', 'danger');
        })
        .finally(() => {
            UIUtils.toggleLoader(false, '.asset-search-loader');
        });
    };
    
    // 입력 지연 설정 (타이핑 중 연속 호출 방지)
    const searchCleanup = FormUtils.setupDelayedEvent(assetSearchInput, 'input', handleSearch, 500);
    
    // 자산 선택 시 현재 위치 표시
    const handleAssetChange = function() {
        const selectedOption = this.options[this.selectedIndex];
        const currentLocation = selectedOption.dataset.location;
        
        const currentLocationElement = document.getElementById('currentLocation');
        if (currentLocationElement && currentLocation) {
            currentLocationElement.textContent = currentLocation;
            currentLocationElement.parentElement.style.display = 'block';
        } else if (currentLocationElement) {
            currentLocationElement.textContent = '';
            currentLocationElement.parentElement.style.display = 'none';
        }
    };
    
    assetSelect.addEventListener('change', handleAssetChange);
    
    // 정리 함수 반환
    return function cleanup() {
        if (searchCleanup) searchCleanup();
        assetSelect.removeEventListener('change', handleAssetChange);
    };
}

/**
 * 자산 선택 옵션 업데이트
 * @param {Array} assets - 검색된 자산 배열
 */
function updateAssetSelectOptions(assets) {
    const assetSelect = document.getElementById('assetId');
    if (!assetSelect) return;
    
    // 기존 옵션 제거 (첫 번째 옵션은 유지)
    while (assetSelect.options.length > 1) {
        assetSelect.remove(1);
    }
    
    // 새 옵션 추가
    assets.forEach(asset => {
        const option = document.createElement('option');
        option.value = asset.id;
        option.textContent = `${asset.id} - ${asset.name}`;
        option.dataset.location = asset.location;
        assetSelect.appendChild(option);
    });
    
    // 첫 번째 자산 자동 선택
    if (assets.length > 0) {
        assetSelect.selectedIndex = 1;
        assetSelect.dispatchEvent(new Event('change'));
    }
}

/**
 * 위치 선택 초기화
 * @returns {Function} 이벤트 정리 함수
 */
function initLocationSelection() {
    const locationSelect = document.getElementById('toLocationId');
    const newLocationInput = document.getElementById('newLocation');
    const newLocationGroup = document.getElementById('newLocationGroup');
    
    if (!locationSelect || !newLocationInput || !newLocationGroup) return null;
    
    const handleLocationChange = function() {
        if (this.value === 'new') {
            UIUtils.toggleElementVisibility(newLocationGroup, true);
            newLocationInput.setAttribute('required', 'required');
        } else {
            UIUtils.toggleElementVisibility(newLocationGroup, false);
            newLocationInput.removeAttribute('required');
        }
    };
    
    locationSelect.addEventListener('change', handleLocationChange);
    
    // 초기 상태 설정
    if (locationSelect.value === 'new') {
        UIUtils.toggleElementVisibility(newLocationGroup, true);
        newLocationInput.setAttribute('required', 'required');
    } else {
        UIUtils.toggleElementVisibility(newLocationGroup, false);
        newLocationInput.removeAttribute('required');
    }
    
    // 정리 함수 반환
    return function cleanup() {
        locationSelect.removeEventListener('change', handleLocationChange);
    };
}

/**
 * 이동 이력 테이블 초기화
 * @returns {Function} 이벤트 정리 함수
 */
function initMovementHistoryTable() {
    const table = document.querySelector('.movement-history-table');
    if (!table) return null;
    
    // 초기 데이터 로드
    refreshMovementHistory();
    
    // TableUtils를 사용하여 테이블 정렬 초기화
    const sortCleanup = TableUtils.initializeTableSorting({
        tableSelector: '.movement-history-table',
        headerSelector: 'th[data-sort]'
    });
    
    // 필터 설정
    const filterInput = document.getElementById('historyFilter');
    if (filterInput) {
        const filterCleanup = TableUtils.setupTableFilter({
            inputSelector: '#historyFilter',
            tableSelector: '.movement-history-table',
            rowSelector: 'tbody tr',
            searchableSelectors: ['td']
        });
        
        // 정리 함수 반환
        return function cleanup() {
            if (sortCleanup) sortCleanup();
            if (filterCleanup) filterCleanup();
        };
    }
    
    return sortCleanup;
}

/**
 * 이동 이력 새로고침
 */
function refreshMovementHistory() {
    const table = document.querySelector('.movement-history-table tbody');
    if (!table) return;
    
    // 로딩 표시
    UIUtils.toggleLoader(true, '.history-loader');
    
    // API 호출 (시연용: 실제 구현시 실제 API 엔드포인트로 변경 필요)
    ApiUtils.get('/api/inventory/movements', {
        limit: 10,
        page: 1
    })
    .then(response => {
        // 시연용 더미 데이터
        const movements = [
            { id: 'M001', assetId: 'A001', assetName: '노트북 Dell XPS 13', fromLocation: '본사 3층 개발팀', toLocation: '본사 2층 회의실', date: '2023-12-01', reason: '개발 미팅' },
            { id: 'M002', assetId: 'A002', assetName: '모니터 LG 27인치', fromLocation: '본사 2층 회의실', toLocation: '지사 1층 사무실', date: '2023-12-02', reason: '지사 업무 지원' },
            { id: 'M003', assetId: 'A003', assetName: '키보드 Logitech MX Keys', fromLocation: '본사 3층 개발팀', toLocation: '본사 1층 로비', date: '2023-12-03', reason: '전시용' }
        ];
        
        // 이동 이력 렌더링
        renderMovementHistory(table, movements);
    })
    .catch(error => {
        UIUtils.showAlert('이동 이력을 불러오는 중 오류가 발생했습니다.', 'danger');
    })
    .finally(() => {
        UIUtils.toggleLoader(false, '.history-loader');
    });
}

/**
 * 이동 이력 렌더링
 * @param {HTMLElement} tableBody - 테이블 본문 요소
 * @param {Array} movements - 이동 이력 데이터 배열
 */
function renderMovementHistory(tableBody, movements) {
    // 테이블 내용 초기화
    tableBody.innerHTML = '';
    
    if (!movements || movements.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="6" class="text-center">이동 이력이 없습니다.</td>';
        tableBody.appendChild(emptyRow);
        return;
    }
    
    // 이동 이력 행 추가
    movements.forEach(movement => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${movement.id}</td>
            <td>${movement.assetId} - ${movement.assetName}</td>
            <td>${movement.fromLocation}</td>
            <td>${movement.toLocation}</td>
            <td>${movement.date}</td>
            <td>${movement.reason}</td>
        `;
        tableBody.appendChild(row);
    });
}

/**
 * 모든 이벤트 리스너 정리
 */
function cleanup() {
    console.log('인벤토리 이동 관리 페이지 이벤트 리스너 정리 중...');
    cleanupFunctions.forEach(fn => {
        if (typeof fn === 'function') fn();
    });
} 