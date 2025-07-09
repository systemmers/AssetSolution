/**
 * 폼 유효성 검사 모듈
 * 폼 및 필드 유효성 검사 기능을 제공합니다.
 * 
 * 함수 목록:
 * - validateForm: 폼 유효성 검사
 * - validateField: 개별 필드 유효성 검사
 * - _validateHtml5Constraints: HTML5 제약조건 검사
 * - _validateCustomConstraints: 사용자 정의 제약조건 검사
 * - setFieldValidState: 필드 유효성 상태 설정
 * - resetFieldState: 필드 상태 초기화
 */

const FormValidator = (function() {
    /**
     * 폼 유효성 검사 함수
     * @param {HTMLFormElement} form - 검증할 폼 요소
     * @param {Object} [options] - 유효성 검사 옵션
     * @param {boolean} [options.showToast=true] - 오류 시 토스트 메시지 표시 여부
     * @param {string} [options.containerSelector='.form-container'] - 오류 메시지 표시될 컨테이너 선택자
     * @returns {boolean} 유효성 검사 통과 여부
     */
    function validateForm(form, options = {}) {
        if (!form) return false;
        
        const { 
            showToast = true,
            containerSelector = '.form-container'
        } = options;
        
        // HTML5 기본 제약조건 검사
        if (!_validateHtml5Constraints(form, showToast, containerSelector)) {
            return false;
        }
        
        // 사용자 정의 유효성 검사
        return _validateCustomConstraints(form, showToast, containerSelector);
    }
    
    /**
     * HTML5 기본 제약조건 검사
     * @param {HTMLFormElement} form - 검증할 폼
     * @param {boolean} showToast - 토스트 메시지 표시 여부
     * @param {string} containerSelector - 메시지 컨테이너 선택자
     * @returns {boolean} 유효성 검사 통과 여부
     * @private
     */
    function _validateHtml5Constraints(form, showToast, containerSelector) {
        if (form.checkValidity()) {
            return true;
        }
        
        // 첫 번째 오류 필드 찾기
        const invalidFields = form.querySelectorAll(':invalid');
        const firstInvalidField = invalidFields[0];
        
        if (firstInvalidField) {
            // 오류 필드로 포커스 이동
            firstInvalidField.focus();
            
            // 적절한 오류 메시지 가져오기
            const errorMessage = _getFieldErrorMessage(firstInvalidField);
            
            // 오류 메시지 표시
            _showValidationError(errorMessage, showToast, containerSelector);
        }
        
        // 폼 요소에 was-validated 클래스 추가
        form.classList.add('was-validated');
        return false;
    }
    
    /**
     * 필드의 오류 메시지 가져오기
     * @param {HTMLElement} field - 폼 필드 요소
     * @returns {string} 오류 메시지
     * @private
     */
    function _getFieldErrorMessage(field) {
        // data-error-message 속성이 있으면 해당 메시지 사용
        return field.dataset.errorMessage || field.validationMessage;
    }
    
    /**
     * 유효성 검사 오류 메시지 표시
     * @param {string} message - 오류 메시지
     * @param {boolean} showToast - 토스트 메시지 표시 여부
     * @param {string} containerSelector - 메시지 컨테이너 선택자
     * @private
     */
    function _showValidationError(message, showToast, containerSelector) {
        if (showToast && window.UIUtils && window.UIUtils.showAlert) {
            window.UIUtils.showAlert(message, 'danger', 3000, containerSelector);
        } else {
            // UIUtils가 없는 경우 기본 알림 사용
            alert(message);
        }
    }
    
    /**
     * 사용자 정의 유효성 검사
     * @param {HTMLFormElement} form - 검증할 폼
     * @param {boolean} showToast - 토스트 메시지 표시 여부
     * @param {string} containerSelector - 메시지 컨테이너 선택자
     * @returns {boolean} 유효성 검사 통과 여부
     * @private
     */
    function _validateCustomConstraints(form, showToast, containerSelector) {
        // 비밀번호 일치 여부 확인
        if (!_validatePasswordMatch(form, showToast, containerSelector)) {
            return false;
        }
        
        // 날짜 범위 검증
        if (!_validateDateRange(form, showToast, containerSelector)) {
            return false;
        }
        
        return true;
    }
    
    /**
     * 비밀번호 일치 검증
     * @param {HTMLFormElement} form - 검증할 폼
     * @param {boolean} showToast - 토스트 메시지 표시 여부
     * @param {string} containerSelector - 메시지 컨테이너 선택자
     * @returns {boolean} 검증 통과 여부
     * @private
     */
    function _validatePasswordMatch(form, showToast, containerSelector) {
        const password = form.querySelector('input[name="password"]');
        const confirmPassword = form.querySelector('input[name="confirm_password"]');
        
        if (password && confirmPassword && password.value !== confirmPassword.value) {
            const errorMessage = '비밀번호가 일치하지 않습니다.';
            confirmPassword.setCustomValidity(errorMessage);
            _showValidationError(errorMessage, showToast, containerSelector);
            return false;
        } else if (confirmPassword) {
            confirmPassword.setCustomValidity('');
        }
        
        return true;
    }
    
    /**
     * 날짜 범위 검증 (시작일이 종료일보다 이전인지)
     * @param {HTMLFormElement} form - 검증할 폼
     * @param {boolean} showToast - 토스트 메시지 표시 여부
     * @param {string} containerSelector - 메시지 컨테이너 선택자
     * @returns {boolean} 검증 통과 여부
     * @private
     */
    function _validateDateRange(form, showToast, containerSelector) {
        const startDate = form.querySelector('input[name="start_date"]');
        const endDate = form.querySelector('input[name="end_date"]');
        
        if (startDate && endDate && startDate.value && endDate.value) {
            const startDateValue = new Date(startDate.value);
            const endDateValue = new Date(endDate.value);
            
            if (startDateValue > endDateValue) {
                const errorMessage = '시작일은 종료일보다 이전이어야 합니다.';
                _showValidationError(errorMessage, showToast, containerSelector);
                startDate.focus();
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * 개별 필드 유효성 검사
     * @param {HTMLElement} field - 검증할 필드
     * @param {Object} [options] - 검증 옵션
     * @returns {boolean} 유효성 검사 통과 여부
     */
    function validateField(field, options = {}) {
        if (!field) return false;
        
        const {
            showMessage = true,
            customValidation = null
        } = options;
        
        // 내장 제약 조건 확인
        const isValid = field.checkValidity();
        
        // 사용자 정의 유효성 검사 실행
        let customValid = true;
        let errorMessage = field.validationMessage;
        
        if (typeof customValidation === 'function') {
            const result = customValidation(field);
            
            if (result !== true) {
                customValid = false;
                errorMessage = result || '유효하지 않은 값입니다.';
                field.setCustomValidity(errorMessage);
            } else {
                field.setCustomValidity('');
            }
        }
        
        // 유효성 상태 표시
        if (showMessage) {
            setFieldValidState(field, isValid && customValid, !isValid || !customValid ? errorMessage : '');
        }
        
        return isValid && customValid;
    }
    
    /**
     * 필드 상태를 설정하는 함수 (유효/오류)
     * @param {HTMLElement} field - 대상 필드
     * @param {boolean} isValid - 유효 여부
     * @param {string} message - 표시할 메시지
     */
    function setFieldValidState(field, isValid, message = '') {
        if (!field) return;
        
        // 인접한 피드백 요소 찾기
        let feedbackElement = field.nextElementSibling;
        if (!feedbackElement || !feedbackElement.classList.contains('invalid-feedback')) {
            feedbackElement = document.createElement('div');
            feedbackElement.className = isValid ? 'valid-feedback' : 'invalid-feedback';
            field.parentNode.insertBefore(feedbackElement, field.nextSibling);
        }
        
        // 상태 클래스 설정
        field.classList.remove('is-valid', 'is-invalid');
        field.classList.add(isValid ? 'is-valid' : 'is-invalid');
        
        // 메시지 설정
        feedbackElement.textContent = message;
        
        // 사용자 정의 유효성 메시지 설정
        if (isValid) {
            field.setCustomValidity('');
        } else {
            field.setCustomValidity(message);
        }
    }
    
    /**
     * 필드 상태를 초기화하는 함수
     * @param {HTMLElement} field - 대상 필드
     */
    function resetFieldState(field) {
        if (!field) return;
        
        // 상태 클래스 제거
        field.classList.remove('is-valid', 'is-invalid');
        
        // 인접한 피드백 요소 찾기
        const feedbackElement = field.nextElementSibling;
        if (feedbackElement && (feedbackElement.classList.contains('invalid-feedback') || 
                               feedbackElement.classList.contains('valid-feedback'))) {
            feedbackElement.textContent = '';
        }
        
        // 사용자 정의 유효성 메시지 초기화
        field.setCustomValidity('');
    }
    
    // 공개 API
    return {
        validateForm,
        validateField,
        setFieldValidState,
        resetFieldState
    };
})();

export default FormValidator; 