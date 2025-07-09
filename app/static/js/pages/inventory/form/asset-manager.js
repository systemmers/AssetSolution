/**
 * 인벤토리 폼 자산 선택 관리 모듈
 * @module inventory/form/asset-manager
 */
import FormUtils from '../../../../common/form-utils.js';
import ApiUtils from '../../../../common/api-utils.js';

/**
 * 자산 선택 기능 초기화
 * @returns {Function} 이벤트 정리 함수
 */
export function initAssetSelection() {
    // 자산 범위 선택
    const assetScopeRadios = document.querySelectorAll('input[name="assetScope"]');
    const departmentSelect = document.getElementById('departmentSelect');
    const locationSelect = document.getElementById('locationSelect');
    const assetTypeSelect = document.getElementById('assetTypeSelect');
    
    if (assetScopeRadios.length === 0 || !departmentSelect || !locationSelect || !assetTypeSelect) return null;
    
    const cleanupFuncs = [];
    
    // 선택 항목과 관련 필드의 매핑
    const scopeFields = {
        'all': [],
        'department': ['#departmentSelectGroup'],
        'location': ['#locationSelectGroup'],
        'type': ['#assetTypeSelectGroup']
    };
    
    // FormUtils를 사용하여 라디오 버튼 변경에 따른 항목 표시/숨김 처리
    const toggleCleanup = FormUtils.setupRadioToggleVisibility('input[name="assetScope"]', scopeFields);
    if (toggleCleanup) cleanupFuncs.push(toggleCleanup);
    
    // 선택에 따른 카운트 업데이트 이벤트 등록
    const handleScopeChange = function() {
        if (this.checked) {
            updateAssetCount(this.value);
        }
    };
    
    assetScopeRadios.forEach(radio => {
        radio.addEventListener('change', handleScopeChange);
    });
    
    cleanupFuncs.push(() => {
        assetScopeRadios.forEach(radio => {
            radio.removeEventListener('change', handleScopeChange);
        });
    });
    
    // 부서, 위치, 자산 타입 변경 이벤트 처리
    const handleDepartmentChange = function() {
        const checkedRadio = document.querySelector('input[name="assetScope"]:checked');
        if (checkedRadio && checkedRadio.value === 'department') {
            updateAssetCount('department');
        }
    };
    
    const handleLocationChange = function() {
        const checkedRadio = document.querySelector('input[name="assetScope"]:checked');
        if (checkedRadio && checkedRadio.value === 'location') {
            updateAssetCount('location');
        }
    };
    
    const handleTypeChange = function() {
        const checkedRadio = document.querySelector('input[name="assetScope"]:checked');
        if (checkedRadio && checkedRadio.value === 'type') {
            updateAssetCount('type');
        }
    };
    
    departmentSelect.addEventListener('change', handleDepartmentChange);
    locationSelect.addEventListener('change', handleLocationChange);
    assetTypeSelect.addEventListener('change', handleTypeChange);
    
    cleanupFuncs.push(() => {
        departmentSelect.removeEventListener('change', handleDepartmentChange);
        locationSelect.removeEventListener('change', handleLocationChange);
        assetTypeSelect.removeEventListener('change', handleTypeChange);
    });
    
    // 초기 상태에서 선택된 라디오 버튼에 대한 카운트 업데이트
    const checkedRadio = document.querySelector('input[name="assetScope"]:checked');
    if (checkedRadio) {
        updateAssetCount(checkedRadio.value);
    }
    
    // 정리 함수 반환
    return function cleanup() {
        cleanupFuncs.forEach(fn => typeof fn === 'function' && fn());
    };
}

/**
 * 자산 수 업데이트
 * @param {string} scope - 선택된 자산 범위 (all, department, location, type)
 */
function updateAssetCount(scope) {
    const countElement = document.getElementById('assetCount');
    if (!countElement) return;
    
    // 로딩 표시
    countElement.innerHTML = '<div class="spinner-border spinner-border-sm text-primary" role="status"><span class="visually-hidden">로딩 중...</span></div>';
    
    // API 파라미터 구성
    let params = { scope };
    
    if (scope === 'department') {
        const departmentId = document.getElementById('departmentSelect').value;
        params.departmentId = departmentId;
    } else if (scope === 'location') {
        const locationId = document.getElementById('locationSelect').value;
        params.locationId = locationId;
    } else if (scope === 'type') {
        const typeId = document.getElementById('assetTypeSelect').value;
        params.typeId = typeId;
    }
    
    // API 호출 (시연용: 실제 구현시 실제 API 엔드포인트로 변경 필요)
    ApiUtils.get('/api/inventory/asset-count', params, {
        handleErrors: true,
        showLoader: false
    })
    .then(response => {
        // 시연을 위한 가상 데이터
        const count = Math.floor(Math.random() * 100) + 20;
        countElement.textContent = count;
    })
    .catch(error => {
        countElement.textContent = '오류';
        console.error('자산 수 조회 중 오류:', error);
    });
} 