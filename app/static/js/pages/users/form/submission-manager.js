/**
 * 사용자 폼 제출 관리 모듈
 * @module users/form/submission-manager
 */
import UIUtils from '../../../../common/ui-utils.js';
import ApiUtils from '../../../../common/api-utils.js';

/**
 * 폼 제출 기능 초기화
 * @returns {Function} 이벤트 정리 함수
 */
export function initFormSubmission() {
    const form = document.getElementById('userForm');
    if (!form) return null;
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const cancelBtn = form.querySelector('.btn-cancel') || form.querySelector('.btn-secondary');
    
    const cleanupFuncs = [];
    
    // 제출 버튼 이벤트 핸들러
    if (submitBtn) {
        const handleSubmit = async function(e) {
            e.preventDefault();
            
            // 폼 유효성 검사 (이미 validation-manager에서 처리)
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            
            // 저장 중 UI 상태 업데이트
            UIUtils.toggleButtonLoading(submitBtn, true, '저장 중...');
            if (cancelBtn) cancelBtn.disabled = true;
            
            try {
                // 폼 데이터 수집
                const formData = new FormData(form);
                
                // 새 부서인 경우 처리
                if (formData.get('department') === 'new') {
                    formData.set('department', formData.get('newDepartment'));
                    formData.delete('newDepartment');
                }
                
                // 편집 모드 여부 확인
                const isEditMode = formData.has('userId') && formData.get('userId') !== '';
                
                // API 엔드포인트 결정
                const endpoint = isEditMode 
                    ? `/api/users/${formData.get('userId')}`
                    : '/api/users';
                
                // API 메소드 결정
                const method = isEditMode ? 'PUT' : 'POST';
                
                // API 호출
                const response = await ApiUtils.request(endpoint, {
                    method: method,
                    body: formData
                });
                
                if (!response.success) {
                    throw new Error(response.message || '사용자 정보 저장에 실패했습니다.');
                }
                
                // 성공 메시지 표시
                const successMessage = isEditMode
                    ? '사용자 정보가 성공적으로 업데이트되었습니다.'
                    : '새 사용자가 성공적으로 생성되었습니다.';
                
                UIUtils.showAlert(successMessage, 'success');
                
                // 사용자 목록 또는 상세 페이지로 리디렉션 (타이머 추가)
                setTimeout(() => {
                    const redirectUrl = isEditMode
                        ? `/users/detail/${formData.get('userId')}`
                        : '/users';
                    
                    window.location.href = redirectUrl;
                }, 1500);
                
            } catch (error) {
                // 오류 메시지 표시
                UIUtils.showAlert(error.message || '사용자 정보 저장 중 오류가 발생했습니다.', 'danger');
                console.error('폼 제출 오류:', error);
                
                // UI 상태 복원
                UIUtils.toggleButtonLoading(submitBtn, false);
                if (cancelBtn) cancelBtn.disabled = false;
            }
        };
        
        form.addEventListener('submit', handleSubmit);
        cleanupFuncs.push(() => form.removeEventListener('submit', handleSubmit));
    }
    
    // 취소 버튼 이벤트 핸들러
    if (cancelBtn) {
        const handleCancel = function(e) {
            e.preventDefault();
            
            // 변경사항이 있는지 확인
            if (formHasChanges(form)) {
                if (!confirm('저장되지 않은 변경사항이 있습니다. 정말 취소하시겠습니까?')) {
                    return;
                }
            }
            
            // 이전 페이지로 이동 또는 목록 페이지로 이동
            if (document.referrer && document.referrer.includes(window.location.host)) {
                window.history.back();
            } else {
                window.location.href = '/users';
            }
        };
        
        cancelBtn.addEventListener('click', handleCancel);
        cleanupFuncs.push(() => cancelBtn.removeEventListener('click', handleCancel));
    }
    
    // 정리 함수 반환
    return function cleanup() {
        cleanupFuncs.forEach(fn => typeof fn === 'function' && fn());
    };
}

/**
 * 폼 변경사항 확인
 * @param {HTMLFormElement} form - 폼 요소
 * @returns {boolean} 변경사항 여부
 */
function formHasChanges(form) {
    // 실제로는 폼의 초기 상태를 저장하고 비교하는 로직 구현
    // 여기서는 간단히 입력 필드에 값이 있는지만 확인
    const inputs = form.querySelectorAll('input, select, textarea');
    
    for (const input of inputs) {
        if (input.type === 'file') {
            if (input.files && input.files.length > 0) return true;
        } else if (input.type === 'checkbox' || input.type === 'radio') {
            if (input.checked !== input.defaultChecked) return true;
        } else {
            if (input.value !== input.defaultValue) return true;
        }
    }
    
    return false;
} 