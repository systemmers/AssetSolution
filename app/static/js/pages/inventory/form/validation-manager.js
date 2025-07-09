/**
 * 인벤토리 폼 유효성 검사 관리 모듈
 * @module inventory/form/validation-manager
 */
import FormUtils from '../../../../common/form-utils.js';
import UIUtils from '../../../../common/ui-utils.js';

/**
 * 폼 유효성 검사 초기화
 * @returns {Function} 이벤트 정리 함수
 */
export function initFormValidation() {
    const inventoryForm = document.getElementById('inventoryForm');
    if (!inventoryForm) return null;
    
    // FormUtils를 사용하여 폼 검증 설정
    const validationCleanup = FormUtils.validateForm(inventoryForm, {
        onSubmit: false,
        customValidations: [
            {
                field: 'name',
                validator: (value) => value.trim().length > 0,
                message: '자산실사 이름을 입력해주세요.'
            },
            {
                field: 'startDate',
                validator: (value) => value.trim().length > 0,
                message: '시작일을 선택해주세요.'
            },
            {
                field: 'endDate',
                validator: (value) => value.trim().length > 0,
                message: '종료일을 선택해주세요.'
            }
        ],
        onValidationFail: (invalidFields) => {
            // 첫 번째 오류 필드로 스크롤
            if (invalidFields.length > 0) {
                const firstInvalidField = invalidFields[0];
                firstInvalidField.focus();
                firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // 유효성 검사 실패 알림
                UIUtils.showAlert('필수 항목을 모두 입력해주세요.', 'warning');
            }
        }
    });
    
    // 전체 자산 체크박스 초기화 (편집 모드에서만 사용됨)
    const allAssetsCheckbox = document.getElementById('allAssets');
    const assetFilterSection = document.getElementById('assetFilterSection');
    
    if (allAssetsCheckbox && assetFilterSection) {
        const conditionalDisplayCleanup = FormUtils.setupConditionalDisplay({
            triggerSelector: '#allAssets',
            targetSelector: '#assetFilterSection',
            displayWhen: false,
            triggerType: 'checkbox'
        });
        
        // 모든 정리 함수 반환
        return function cleanup() {
            if (validationCleanup) validationCleanup();
            if (conditionalDisplayCleanup) conditionalDisplayCleanup();
        };
    }
    
    return validationCleanup;
} 