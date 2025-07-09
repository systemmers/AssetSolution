/**
 * 폼 데이터 모듈
 * 폼 데이터 수집 및 처리 기능을 제공합니다.
 * 
 * 함수 목록:
 * - serializeForm: 폼 데이터 직렬화
 * - populateFormFields: 폼 필드 채우기
 * - handleFormSubmission: 폼 제출 처리
 * - submitFormAjax: AJAX 폼 제출
 * - resetForm: 폼 초기화
 */

const FormData = (function() {
    /**
     * 폼 데이터를 객체로 직렬화하는 함수
     * @param {HTMLFormElement} form - 직렬화할 폼 요소
     * @param {boolean} [includeDisabled=false] - 비활성화된 필드 포함 여부
     * @returns {Object} 직렬화된 폼 데이터 객체
     */
    function serializeForm(form, includeDisabled = false) {
        if (!form) return {};
        
        const formData = new window.FormData(form);
        const serialized = {};
        
        // FormData에 포함된 필드 처리
        for (const [key, value] of formData.entries()) {
            serialized[key] = value;
        }
        
        // 비활성화된 필드 처리 (선택 사항)
        if (includeDisabled) {
            const disabledFields = form.querySelectorAll('input:disabled, select:disabled, textarea:disabled');
            
            disabledFields.forEach(field => {
                if (field.name) {
                    if (field.type === 'checkbox' || field.type === 'radio') {
                        if (field.checked) {
                            serialized[field.name] = field.value;
                        }
                    } else {
                        serialized[field.name] = field.value;
                    }
                }
            });
        }
        
        // 체크박스 그룹 처리 (같은 이름의 여러 체크박스)
        const checkboxGroups = {};
        form.querySelectorAll('input[type="checkbox"][name$="[]"]').forEach(checkbox => {
            const name = checkbox.name;
            if (!checkboxGroups[name]) {
                checkboxGroups[name] = [];
            }
            
            if (checkbox.checked) {
                checkboxGroups[name].push(checkbox.value);
            }
        });
        
        // 체크박스 그룹 값 추가
        Object.keys(checkboxGroups).forEach(key => {
            const cleanKey = key.replace('[]', '');
            serialized[cleanKey] = checkboxGroups[key];
        });
        
        return serialized;
    }
    
    /**
     * 폼 필드에 데이터를 채우는 함수
     * @param {HTMLFormElement} form - 데이터를 채울 폼 요소
     * @param {Object} data - 폼에 채울 데이터 객체
     */
    function populateFormFields(form, data) {
        if (!form || !data) return;
        
        // 객체의 각 속성에 대해 해당하는 폼 필드 찾기
        Object.keys(data).forEach(key => {
            const value = data[key];
            const elements = form.querySelectorAll(`[name="${key}"]`);
            
            if (elements.length === 0) return;
            
            elements.forEach(element => {
                // 요소 타입에 따른 처리
                switch (element.type) {
                    case 'checkbox':
                        // 체크박스인 경우
                        if (Array.isArray(value)) {
                            // 값 배열인 경우
                            element.checked = value.includes(element.value);
                        } else {
                            // 불리언 값이거나 단일 값인 경우
                            element.checked = element.value === value.toString() || value === true;
                        }
                        break;
                        
                    case 'radio':
                        // 라디오 버튼인 경우
                        element.checked = element.value === value.toString();
                        break;
                        
                    case 'select-one':
                    case 'select-multiple':
                        // 선택 요소인 경우
                        if (Array.isArray(value)) {
                            // 다중 선택의 경우
                            Array.from(element.options).forEach(option => {
                                option.selected = value.includes(option.value);
                            });
                        } else {
                            // 단일 선택의 경우
                            element.value = value;
                        }
                        break;
                        
                    case 'file':
                        // 파일 입력은 보안상의 이유로 직접 설정할 수 없음
                        // 대신 파일 이름을 표시할 수 있음
                        if (value) {
                            const fileNameDisplay = form.querySelector(`[data-file-name="${key}"]`);
                            if (fileNameDisplay) {
                                fileNameDisplay.textContent = value;
                            }
                        }
                        break;
                        
                    default:
                        // 기본 입력 필드 (텍스트, 이메일, 숫자 등)
                        element.value = value;
                }
                
                // 사용자 정의 이벤트 트리거 (예: 위잿이 변경 사항을 인식하도록)
                const changeEvent = new Event('change', { bubbles: true });
                element.dispatchEvent(changeEvent);
            });
        });
    }
    
    /**
     * 폼 제출 처리 함수
     * @param {HTMLFormElement} form - 제출할 폼 요소
     * @param {Object} [options] - 폼 제출 옵션
     * @param {string} [options.method='POST'] - HTTP 메서드
     * @param {string} [options.url=null] - 제출 URL (기본값: form action)
     * @param {Function} [options.beforeSubmit=null] - 제출 전 실행할 콜백 함수
     * @param {Function} [options.onSuccess=null] - 성공 시 실행할 콜백 함수
     * @param {Function} [options.onError=null] - 오류 시 실행할 콜백 함수
     * @param {boolean} [options.validateBeforeSubmit=true] - 제출 전 유효성 검사 여부
     * @param {boolean} [options.useFormData=false] - FormData 객체 사용 여부 (파일 업로드 시 true)
     * @param {boolean} [options.resetOnSuccess=false] - 성공 시 폼 초기화 여부
     */
    function handleFormSubmission(form, options = {}) {
        if (!form) return;
        
        const {
            method = form.method || 'POST',
            url = form.action,
            beforeSubmit = null,
            onSuccess = null,
            onError = null,
            validateBeforeSubmit = true,
            useFormData = false,
            resetOnSuccess = false
        } = options;
        
        // 이벤트 핸들러
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            // 제출 전 유효성 검사
            if (validateBeforeSubmit && window.FormValidator && window.FormValidator.validateForm) {
                if (!window.FormValidator.validateForm(form)) {
                    return;
                }
            }
            
            // 제출 전 콜백 함수 실행
            if (beforeSubmit && typeof beforeSubmit === 'function') {
                const shouldContinue = beforeSubmit(form);
                if (shouldContinue === false) {
                    return;
                }
            }
            
            // 로딩 표시 활성화
            if (window.UIUtils && window.UIUtils.toggleLoader) {
                window.UIUtils.toggleLoader(true);
            }
            
            try {
                let response;
                
                if (useFormData) {
                    // FormData 사용 (파일 업로드 지원)
                    const formData = new window.FormData(form);
                    
                    response = await fetch(url, {
                        method: method,
                        body: formData,
                        // FormData와 함께 사용할 때는 Content-Type 헤더를 설정하지 않음
                        // 브라우저가 자동으로 multipart/form-data와 경계 설정
                    });
                } else {
                    // JSON 형식으로 전송
                    const formData = serializeForm(form);
                    
                    response = await fetch(url, {
                        method: method,
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        body: JSON.stringify(formData)
                    });
                }
                
                // 로딩 표시 비활성화
                if (window.UIUtils && window.UIUtils.toggleLoader) {
                    window.UIUtils.toggleLoader(false);
                }
                
                // 응답 처리
                if (response.ok) {
                    // JSON 응답 파싱 시도
                    let data;
                    const contentType = response.headers.get('content-type');
                    
                    if (contentType && contentType.includes('application/json')) {
                        data = await response.json();
                    } else {
                        data = await response.text();
                    }
                    
                    // 성공 시 폼 초기화 (선택 사항)
                    if (resetOnSuccess) {
                        resetForm(form);
                    }
                    
                    // 성공 콜백 함수 실행
                    if (onSuccess && typeof onSuccess === 'function') {
                        onSuccess(data, response);
                    } else {
                        // 기본 성공 메시지
                        if (window.UIUtils && window.UIUtils.showAlert) {
                            window.UIUtils.showAlert('요청이 성공적으로 처리되었습니다.', 'success');
                        }
                        
                        // 리디렉션 처리
                        if (data && data.redirect) {
                            setTimeout(() => {
                                window.location.href = data.redirect;
                            }, 500);
                        }
                    }
                } else {
                    // 오류 처리
                    let errorData;
                    try {
                        errorData = await response.json();
                    } catch (e) {
                        errorData = { message: '처리 중 오류가 발생했습니다. (상태 코드: ' + response.status + ')' };
                    }
                    
                    // 오류 콜백 함수 실행
                    if (onError && typeof onError === 'function') {
                        onError(errorData, response);
                    } else {
                        // 기본 오류 메시지
                        const errorMessage = errorData.message || '처리 중 오류가 발생했습니다.';
                        
                        if (window.UIUtils && window.UIUtils.showAlert) {
                            window.UIUtils.showAlert(errorMessage, 'danger');
                        } else {
                            alert(errorMessage);
                        }
                    }
                }
            } catch (error) {
                // 네트워크 오류 등의 예외 처리
                console.error('Form submission error:', error);
                
                // 로딩 표시 비활성화
                if (window.UIUtils && window.UIUtils.toggleLoader) {
                    window.UIUtils.toggleLoader(false);
                }
                
                // 오류 콜백 함수 실행
                if (onError && typeof onError === 'function') {
                    onError({ message: '네트워크 오류가 발생했습니다.' }, null);
                } else {
                    // 기본 오류 메시지
                    if (window.UIUtils && window.UIUtils.showAlert) {
                        window.UIUtils.showAlert('네트워크 오류가 발생했습니다.', 'danger');
                    } else {
                        alert('네트워크 오류가 발생했습니다.');
                    }
                }
            }
        });
    }
    
    /**
     * AJAX 폼 제출
     * @param {string|HTMLFormElement} form - 폼 ID 또는 요소
     * @param {Object} options - AJAX 요청 옵션
     * @param {string} options.url - 요청 URL (없으면 폼의 action 사용)
     * @param {string} options.method - 요청 메서드 (없으면 폼의 method 사용)
     * @param {Function} options.onSuccess - 성공 콜백
     * @param {Function} options.onError - 오류 콜백
     * @param {boolean} options.resetOnSuccess - 성공시 폼 초기화 여부
     * @param {boolean} options.validation - 유효성 검사 수행 여부
     * @returns {Promise} 요청 Promise
     */
    function submitFormAjax(form, options = {}) {
        // 폼 요소 가져오기
        const formElement = typeof form === 'string' ? document.getElementById(form) : form;
        
        if (!formElement || !(formElement instanceof HTMLFormElement)) {
            console.error('유효한 폼 요소가 아닙니다.');
            return Promise.reject(new Error('Invalid form element'));
        }
        
        // 기본 옵션
        const defaultOptions = {
            url: formElement.action,
            method: formElement.method || 'POST',
            resetOnSuccess: true,
            validation: true
        };
        
        // 옵션 병합
        const settings = { ...defaultOptions, ...options };
        
        // 유효성 검사 (선택 사항)
        if (settings.validation && window.FormValidator && window.FormValidator.validateForm) {
            if (!window.FormValidator.validateForm(formElement)) {
                return Promise.reject(new Error('Form validation failed'));
            }
        }
        
        // 폼 데이터 수집
        const formData = new window.FormData(formElement);
        
        // 로딩 표시 (UIUtils 사용)
        if (window.UIUtils && window.UIUtils.toggleLoader) {
            window.UIUtils.toggleLoader(true);
        }
        
        // AJAX 요청
        return fetch(settings.url, {
            method: settings.method,
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => {
            // 로딩 표시 숨기기
            if (window.UIUtils && window.UIUtils.toggleLoader) {
                window.UIUtils.toggleLoader(false);
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            return response.json();
        })
        .then(data => {
            // 성공 처리
            if (settings.resetOnSuccess) {
                resetForm(formElement);
            }
            
            // 성공 메시지 표시 (UIUtils 사용)
            if (data.message && window.UIUtils && window.UIUtils.showAlert) {
                window.UIUtils.showAlert(data.message, 'success');
            }
            
            // 성공 콜백 호출
            if (typeof settings.onSuccess === 'function') {
                settings.onSuccess(data);
            }
            
            return data;
        })
        .catch(error => {
            // 로딩 표시 숨기기
            if (window.UIUtils && window.UIUtils.toggleLoader) {
                window.UIUtils.toggleLoader(false);
            }
            
            // 오류 메시지 표시 (UIUtils 사용)
            if (window.UIUtils && window.UIUtils.showAlert) {
                window.UIUtils.showAlert(error.message || '요청 처리 중 오류가 발생했습니다.', 'danger');
            }
            
            // 오류 콜백 호출
            if (typeof settings.onError === 'function') {
                settings.onError(error);
            }
            
            throw error;
        });
    }
    
    /**
     * 폼 초기화 함수
     * @param {HTMLFormElement} form - 초기화할 폼
     * @param {boolean} [removeValidation=true] - 유효성 검사 표시 제거 여부
     */
    function resetForm(form, removeValidation = true) {
        if (!form) return;
        
        // 폼 리셋
        form.reset();
        
        // 유효성 검사 관련 클래스 제거
        if (removeValidation) {
            form.classList.remove('was-validated');
            
            // 모든 필드의 유효성 상태 초기화
            if (window.FormValidator && window.FormValidator.resetFieldState) {
                const fields = form.querySelectorAll('input, select, textarea');
                fields.forEach(field => {
                    window.FormValidator.resetFieldState(field);
                });
            } else {
                // FormValidator 모듈이 없는 경우 수동 초기화
                const fields = form.querySelectorAll('input, select, textarea');
                fields.forEach(field => {
                    field.classList.remove('is-valid', 'is-invalid');
                    field.setCustomValidity('');
                    
                    // 피드백 메시지 초기화
                    const feedback = field.nextElementSibling;
                    if (feedback && (feedback.classList.contains('invalid-feedback') || 
                                    feedback.classList.contains('valid-feedback'))) {
                        feedback.textContent = '';
                    }
                });
            }
        }
        
        // 커스텀 리셋 이벤트 발생
        const resetEvent = new CustomEvent('form:reset', { 
            bubbles: true,
            detail: { form }
        });
        form.dispatchEvent(resetEvent);
    }
    
    // 공개 API
    return {
        serializeForm,
        populateFormFields,
        handleFormSubmission,
        submitFormAjax,
        resetForm
    };
})();

export default FormData; 