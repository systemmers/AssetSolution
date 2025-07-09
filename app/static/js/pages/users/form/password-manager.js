/**
 * 사용자 비밀번호 관리 모듈
 * @module users/form/password-manager
 */
import FormUtils from '../../../../common/form-utils.js';
import UIUtils from '../../../../common/ui-utils.js';

/**
 * 비밀번호 처리 기능 초기화
 * @returns {Function} 이벤트 정리 함수
 */
export function initPasswordHandling() {
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirmPassword');
    const resetPasswordBtn = document.getElementById('resetPasswordBtn');
    const passwordForm = document.getElementById('passwordForm');
    
    const cleanupFuncs = [];
    
    // 비밀번호 확인 일치 검사
    if (passwordInput && confirmInput) {
        const passwordMatchCleanup = initPasswordConfirmation(passwordInput, confirmInput);
        if (passwordMatchCleanup) cleanupFuncs.push(passwordMatchCleanup);
    }
    
    // 비밀번호 복잡성 검사
    if (passwordInput) {
        const passwordComplexityCleanup = initPasswordComplexity(passwordInput);
        if (passwordComplexityCleanup) cleanupFuncs.push(passwordComplexityCleanup);
    }
    
    // 비밀번호 초기화 모달 (있는 경우)
    if (resetPasswordBtn && passwordForm) {
        const resetPasswordCleanup = initPasswordResetModal(resetPasswordBtn, passwordForm);
        if (resetPasswordCleanup) cleanupFuncs.push(resetPasswordCleanup);
    }
    
    // 정리 함수 반환
    return function cleanup() {
        cleanupFuncs.forEach(fn => typeof fn === 'function' && fn());
    };
}

/**
 * 비밀번호 확인 일치 검사 초기화
 * @param {HTMLElement} passwordInput - 비밀번호 입력 요소
 * @param {HTMLElement} confirmInput - 비밀번호 확인 입력 요소
 * @returns {Function} 이벤트 정리 함수
 */
function initPasswordConfirmation(passwordInput, confirmInput) {
    if (!passwordInput || !confirmInput) return null;
    
    const checkPasswordMatch = function() {
        if (confirmInput.value) {
            if (passwordInput.value === confirmInput.value) {
                FormUtils.setFieldValidState(confirmInput, true, '비밀번호가 일치합니다.');
            } else {
                FormUtils.setFieldValidState(confirmInput, false, '비밀번호가 일치하지 않습니다.');
            }
        } else {
            FormUtils.resetFieldState(confirmInput);
        }
    };
    
    // 이벤트 리스너 등록
    passwordInput.addEventListener('input', checkPasswordMatch);
    confirmInput.addEventListener('input', checkPasswordMatch);
    
    // 정리 함수 반환
    return function cleanup() {
        passwordInput.removeEventListener('input', checkPasswordMatch);
        confirmInput.removeEventListener('input', checkPasswordMatch);
    };
}

/**
 * 비밀번호 복잡성 검사 초기화
 * @param {HTMLElement} passwordInput - 비밀번호 입력 요소
 * @returns {Function} 이벤트 정리 함수
 */
function initPasswordComplexity(passwordInput) {
    if (!passwordInput) return null;
    
    const checkPasswordComplexity = function() {
        const password = this.value;
        
        if (password.length === 0) {
            FormUtils.resetFieldState(this);
            return;
        }
        
        let feedback = '';
        let isValid = true;
        
        // 길이 검사
        if (password.length < 8) {
            feedback = '비밀번호는 최소 8자 이상이어야 합니다.';
            isValid = false;
        } else {
            // 복잡성 검사
            let complexity = 0;
            let complexityChecks = [];
            
            if (/[0-9]/.test(password)) {
                complexity++;
                complexityChecks.push('숫자');
            }
            
            if (/[a-z]/.test(password)) {
                complexity++;
                complexityChecks.push('소문자');
            }
            
            if (/[A-Z]/.test(password)) {
                complexity++;
                complexityChecks.push('대문자');
            }
            
            if (/[^a-zA-Z0-9]/.test(password)) {
                complexity++;
                complexityChecks.push('특수문자');
            }
            
            if (complexity < 3) {
                const missing = ['숫자', '소문자', '대문자', '특수문자'].filter(
                    item => !complexityChecks.includes(item)
                );
                
                feedback = `다음 중 최소 한 가지를 추가하세요: ${missing.join(', ')}`;
                isValid = false;
            } else {
                feedback = complexity === 4 ? '매우 강력한 비밀번호입니다.' : '좋은 비밀번호입니다.';
            }
        }
        
        FormUtils.setFieldValidState(this, isValid, feedback);
    };
    
    // 이벤트 리스너 등록
    passwordInput.addEventListener('input', checkPasswordComplexity);
    
    // 정리 함수 반환
    return function cleanup() {
        passwordInput.removeEventListener('input', checkPasswordComplexity);
    };
}

/**
 * 비밀번호 초기화 모달 초기화
 * @param {HTMLElement} resetBtn - 비밀번호 초기화 버튼
 * @param {HTMLElement} passwordForm - 비밀번호 폼
 * @returns {Function} 이벤트 정리 함수
 */
function initPasswordResetModal(resetBtn, passwordForm) {
    if (!resetBtn || !passwordForm) return null;
    
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    if (!newPasswordInput || !confirmPasswordInput) return null;
    
    // 비밀번호 확인 일치 검사 초기화
    const confirmationCleanup = initPasswordConfirmation(newPasswordInput, confirmPasswordInput);
    
    // 비밀번호 복잡성 검사 초기화
    const complexityCleanup = initPasswordComplexity(newPasswordInput);
    
    // 제출 버튼 이벤트 핸들러
    const submitBtn = passwordForm.querySelector('button[type="submit"]') || 
                      document.querySelector('#passwordModal .modal-footer .btn-primary');
    
    if (submitBtn) {
        const handleSubmit = function(e) {
            if (e) e.preventDefault();
            
            const newPassword = newPasswordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            
            if (newPassword !== confirmPassword) {
                UIUtils.showAlert('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.', 'danger');
                return false;
            }
            
            if (newPassword.length < 8) {
                UIUtils.showAlert('비밀번호는 최소 8자 이상이어야 합니다.', 'danger');
                return false;
            }
            
            // 성공 메시지 표시
            UIUtils.showAlert('비밀번호가 변경되었습니다.', 'success');
            UIUtils.toggleModal('#passwordModal', 'hide');
            
            // 폼 초기화
            passwordForm.reset();
            FormUtils.resetFieldState(newPasswordInput);
            FormUtils.resetFieldState(confirmPasswordInput);
            
            return false;
        };
        
        submitBtn.addEventListener('click', handleSubmit);
        
        // 정리 함수 반환
        return function cleanup() {
            if (confirmationCleanup) confirmationCleanup();
            if (complexityCleanup) complexityCleanup();
            submitBtn.removeEventListener('click', handleSubmit);
        };
    }
    
    // 제출 버튼이 없는 경우 다른 정리 함수만 반환
    return function cleanup() {
        if (confirmationCleanup) confirmationCleanup();
        if (complexityCleanup) complexityCleanup();
    };
} 