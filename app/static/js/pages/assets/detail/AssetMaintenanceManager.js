/**
 * 자산 유지보수 관리 모듈
 * 자산의 유지보수 기록 관리 기능을 담당합니다.
 */

import UIUtils from '../../../common/ui-utils.js';
import FormUtils from '../../../common/form-utils.js';
import TableUtils from '../../../common/table-utils.js';
import ApiUtils from '../../../common/api-utils.js';

/**
 * 유지보수 내역 테이블 초기화
 */
function initMaintenanceTable() {
    const table = document.getElementById('maintenanceTable');
    if (!table) return;

    // 테이블 정렬 기능 초기화
    TableUtils.initializeTableSorting({
        tableSelector: '#maintenanceTable',
        sortOptions: {
            defaultColumn: 'date',
            defaultDirection: 'desc'
        }
    });
}

/**
 * 유지보수 모달 관련 이벤트 핸들러 초기화
 */
function initMaintenanceModalHandlers() {
    // 유지보수 내역 추가 모달 설정
    const maintenanceModalButton = document.querySelector('[data-bs-target="#maintenanceModal"]');
    if (maintenanceModalButton) {
        UIUtils.setupActionButton(maintenanceModalButton, function() {
            // 모달이 열릴 때 폼 초기화
            FormUtils.resetForm(document.getElementById('maintenanceForm'));
        });
    }
    
    // 유지보수 정보 저장 버튼 설정
    const saveMaintenanceButton = document.querySelector('#maintenanceModal .btn-primary');
    if (saveMaintenanceButton) {
        UIUtils.setupActionButton(saveMaintenanceButton, function() {
            if (validateMaintenanceForm()) {
                saveMaintenanceData();
                UIUtils.toggleModal('#maintenanceModal', 'hide');
            }
        });
    }
}

/**
 * 유지보수 폼 유효성 검사
 * @returns {boolean} 폼이 유효한지 여부
 */
function validateMaintenanceForm() {
    return FormUtils.validateForm(document.getElementById('maintenanceForm'), {
        onSubmit: false,
        customValidations: [
            {
                field: 'maintenanceDate',
                validator: (value) => value.trim().length > 0,
                message: '유지보수 일자를 입력해주세요.'
            },
            {
                field: 'maintenanceDesc',
                validator: (value) => value.trim().length > 0,
                message: '유지보수 내용을 입력해주세요.'
            },
            {
                field: 'maintenanceHandler',
                validator: (value) => value.trim().length > 0,
                message: '담당자를 입력해주세요.'
            }
        ]
    });
}

/**
 * 유지보수 데이터 저장 (백엔드 연동 시 구현)
 */
function saveMaintenanceData() {
    // FormUtils를 사용하여 폼 데이터 수집
    const formData = new FormData(document.getElementById('maintenanceForm'));
    const maintenanceData = Object.fromEntries(formData.entries());
    
    // 유지보수 내역 테이블에 행 추가
    const maintenanceType = document.getElementById('maintenanceType');
    const typeText = maintenanceType ? 
        maintenanceType.options[maintenanceType.selectedIndex].text : '';
    const costText = maintenanceData.maintenanceCost ? `${maintenanceData.maintenanceCost}원` : '-';
    
    // TableUtils를 활용하여 테이블에 행 추가
    TableUtils.addTableRow('maintenanceTable', [
        maintenanceData.maintenanceDate,
        typeText,
        maintenanceData.maintenanceDesc,
        maintenanceData.maintenanceHandler,
        costText
    ]);
    
    // API 호출 (시연용: 실제 구현시 실제 API 엔드포인트로 변경 필요)
    ApiUtils.post('/api/assets/maintenance', maintenanceData, {
        handleErrors: true,
        showLoader: false
    })
    .then(response => {
        UIUtils.showAlert('유지보수 내역이 추가되었습니다.', 'success');
    })
    .catch(error => {
        console.error('유지보수 내역 저장 중 오류:', error);
        // 이미 UI는 업데이트 했으므로 오류 메시지만 표시
        UIUtils.showAlert('서버에 저장 중 오류가 발생했습니다. 나중에 다시 시도해주세요.', 'warning');
    });
}

// 공개 API
export {
    initMaintenanceTable,
    initMaintenanceModalHandlers,
    validateMaintenanceForm,
    saveMaintenanceData
}; 