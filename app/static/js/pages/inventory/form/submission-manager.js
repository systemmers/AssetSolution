/**
 * 인벤토리 폼 제출 관리 모듈
 * @module inventory/form/submission-manager
 */
import UIUtils from '../../../../common/ui-utils.js';
import FormUtils from '../../../../common/form-utils.js';
import ApiUtils from '../../../../common/api-utils.js';

/**
 * 폼 제출 기능 초기화
 * @returns {Function} 이벤트 정리 함수
 */
export function initFormSubmission() {
    const saveButton = document.getElementById('saveInventory');
    if (!saveButton) return null;
    
    // 저장 버튼 이벤트 핸들러
    const handleSaveClick = function(event) {
        const form = document.getElementById('inventoryForm');
        if (!form) return;
        
        if (FormUtils.validateForm(form)) {
            UIUtils.toggleButtonState(saveButton, false, '<i class="fas fa-spinner fa-spin"></i> 저장 중...');
            
            // 폼 데이터 수집
            const formData = new FormData(form);
            const inventoryData = Object.fromEntries(formData.entries());
            
            // 새 자산실사 생성 또는 기존 실사 수정 여부 확인
            const isEdit = form.getAttribute('data-edit-mode') === 'true';
            
            // API 엔드포인트 및 메소드 결정
            const endpoint = isEdit 
                ? `/api/inventory/${inventoryData.id}/update`
                : '/api/inventory/create';
            
            const method = isEdit ? 'PUT' : 'POST';
            
            // API 호출 (시연용: 실제 구현시 실제 API 엔드포인트로 변경 필요)
            ApiUtils[method.toLowerCase()](endpoint, inventoryData, {
                handleErrors: true,
                showLoader: false
            })
            .then(response => {
                // 성공 메시지 및 버튼 상태 복원
                const successMessage = isEdit
                    ? '자산실사 정보가 성공적으로 업데이트되었습니다.'
                    : '새 자산실사가 성공적으로 생성되었습니다.';
                
                UIUtils.showAlert(successMessage, 'success');
                UIUtils.toggleButtonState(saveButton, true);
                
                // 상세 페이지로 리디렉션 (시연용 타이머)
                setTimeout(() => {
                    // 실제 API에서는 response.id 또는 response.data.id 등으로 반환될 것
                    const id = isEdit 
                        ? inventoryData.id 
                        : (response?.id || response?.data?.id || Math.floor(Math.random() * 1000 + 1));
                    
                    window.location.href = `/inventory/detail/${id}`;
                }, 1500);
            })
            .catch(error => {
                // 오류 메시지 및 버튼 상태 복원
                UIUtils.showAlert('자산실사 정보 저장 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'), 'danger');
                UIUtils.toggleButtonState(saveButton, true);
                console.error('자산실사 저장 오류:', error);
            });
        } else {
            UIUtils.showAlert('입력한 정보를 다시 확인해주세요.', 'warning');
        }
    };
    
    // 취소 버튼 이벤트 핸들러
    const cancelButton = document.querySelector('.btn-cancel') || document.querySelector('#inventoryForm .btn-secondary');
    let cancelButtonCleanup = null;
    
    if (cancelButton) {
        const handleCancelClick = function(e) {
            e.preventDefault();
            
            // 변경사항이 있는지 확인
            if (formHasChanges()) {
                if (!confirm('저장되지 않은 변경사항이 있습니다. 정말 취소하시겠습니까?')) {
                    return;
                }
            }
            
            // 목록 페이지로 이동
            window.location.href = '/inventory';
        };
        
        cancelButton.addEventListener('click', handleCancelClick);
        cancelButtonCleanup = () => cancelButton.removeEventListener('click', handleCancelClick);
    }
    
    // 저장 버튼 이벤트 등록
    UIUtils.setupActionButton(saveButton, handleSaveClick);
    
    // 정리 함수 반환
    return function cleanup() {
        saveButton.removeEventListener('click', handleSaveClick);
        if (cancelButtonCleanup) cancelButtonCleanup();
    };
}

/**
 * 폼 변경사항 확인
 * @returns {boolean} 변경사항 여부
 */
function formHasChanges() {
    const form = document.getElementById('inventoryForm');
    if (!form) return false;
    
    // 폼 요소 수집
    const inputs = form.querySelectorAll('input, select, textarea');
    
    // 모든 입력 요소 확인
    for (const input of inputs) {
        // 체크박스 또는 라디오 버튼
        if (input.type === 'checkbox' || input.type === 'radio') {
            if (input.checked !== input.defaultChecked) {
                return true;
            }
        } 
        // 파일 입력
        else if (input.type === 'file') {
            if (input.files && input.files.length > 0) {
                return true;
            }
        } 
        // 기타 입력 요소
        else if (input.value !== input.defaultValue) {
            return true;
        }
    }
    
    return false;
} 