/**
 * 폼 UI 모듈
 * 폼 관련 UI 기능을 제공합니다.
 * 
 * 함수 목록:
 * - initDynamicFormValidation: 동적 폼 유효성 검사 초기화
 * - initConditionalFormFields: 조건부 폼 필드 초기화
 * - initDynamicItemsList: 동적 항목 목록 초기화
 * - showFieldError: 필드 오류 표시
 * - clearFieldErrors: 필드 오류 지우기
 * - highlightInvalidFields: 유효하지 않은 필드 강조
 */

const FormUI = (function() {
    /**
     * 동적 폼 유효성 검사 초기화
     * 입력 필드의 변경 시 실시간으로 유효성 검사를 수행합니다.
     * 
     * @param {HTMLFormElement} form - 초기화할 폼 요소
     * @param {Object} [options] - 초기화 옵션
     * @param {string} [options.inputSelector='input, textarea, select'] - 유효성 검사를 적용할 요소 선택자
     * @param {string} [options.eventType='change'] - 유효성 검사를 트리거할 이벤트 유형
     * @param {Function} [options.onValidationChanged] - 유효성 상태 변경 시 콜백 함수
     * @returns {Function} 이벤트 리스너 정리 함수
     */
    function initDynamicFormValidation(form, options = {}) {
        if (!form) return () => {};
        
        const {
            inputSelector = 'input, textarea, select',
            eventType = 'change',
            onValidationChanged = null
        } = options;
        
        const inputs = form.querySelectorAll(inputSelector);
        
        // 검증 이벤트 핸들러
        const handleValidation = (event) => {
            const field = event.target;
            const isValid = field.checkValidity();
            
            // 유효성 상태 표시
            if (field.required || field.value.trim() !== '') {
                if (window.FormValidator && window.FormValidator.setFieldValidState) {
                    window.FormValidator.setFieldValidState(field, isValid, field.validationMessage);
                } else {
                    field.classList.toggle('is-valid', isValid);
                    field.classList.toggle('is-invalid', !isValid);
                }
                
                // 콜백 함수 호출
                if (typeof onValidationChanged === 'function') {
                    onValidationChanged(field, isValid);
                }
            } else {
                // 빈 필드 처리 (필수가 아닌 경우)
                field.classList.remove('is-valid', 'is-invalid');
            }
        };
        
        // 이벤트 리스너 등록
        inputs.forEach(input => {
            input.addEventListener(eventType, handleValidation);
            
            // 특수 입력 필드 처리 (필요시)
            if (input.type === 'password' && input.name === 'confirm_password') {
                const passwordField = form.querySelector('input[name="password"]');
                if (passwordField) {
                    passwordField.addEventListener(eventType, () => {
                        if (input.value) {
                            handleValidation({ target: input });
                        }
                    });
                }
            }
        });
        
        // 정리 함수 반환
        return function cleanup() {
            inputs.forEach(input => {
                input.removeEventListener(eventType, handleValidation);
            });
        };
    }
    
    /**
     * 조건부 폼 필드 초기화
     * 특정 필드의 값에 따라 다른 필드의 표시/숨김을 관리합니다.
     * 
     * @param {HTMLFormElement} form - 초기화할 폼 요소
     * @param {Object} [options] - 초기화 옵션
     * @param {Array} [options.conditions] - 조건 정의 객체 배열
     * @returns {Array} 정리 함수 배열
     */
    function initConditionalFormFields(form, options = {}) {
        if (!form || !options.conditions || !Array.isArray(options.conditions)) {
            return [];
        }
        
        const cleanupFunctions = [];
        
        options.conditions.forEach(condition => {
            const {
                triggerSelector,
                targetSelector,
                conditionType = 'value',
                conditionValue,
                displayStyle = 'block'
            } = condition;
            
            if (!triggerSelector || !targetSelector) return;
            
            const triggerElements = form.querySelectorAll(triggerSelector);
            const targetElements = form.querySelectorAll(targetSelector);
            
            if (!triggerElements.length || !targetElements.length) return;
            
            // 조건 평가 함수
            const evaluateCondition = () => {
                let shouldShow = false;
                
                triggerElements.forEach(trigger => {
                    // 조건 타입에 따른 평가
                    switch (conditionType) {
                        case 'value':
                            // 특정 값과 일치
                            if (trigger.type === 'checkbox' || trigger.type === 'radio') {
                                shouldShow = shouldShow || (trigger.checked && (conditionValue === undefined || trigger.value === conditionValue));
                            } else {
                                shouldShow = shouldShow || (trigger.value === conditionValue);
                            }
                            break;
                            
                        case 'not-value':
                            // 특정 값과 불일치
                            if (trigger.type === 'checkbox' || trigger.type === 'radio') {
                                shouldShow = shouldShow || (trigger.checked && trigger.value !== conditionValue);
                            } else {
                                shouldShow = shouldShow || (trigger.value !== conditionValue);
                            }
                            break;
                            
                        case 'checked':
                            // 체크박스나 라디오 버튼 체크 상태
                            shouldShow = shouldShow || trigger.checked;
                            break;
                            
                        case 'not-empty':
                            // 값이 비어있지 않음
                            shouldShow = shouldShow || (trigger.value.trim() !== '');
                            break;
                            
                        case 'custom':
                            // 사용자 정의 조건 함수
                            if (typeof condition.evaluator === 'function') {
                                shouldShow = shouldShow || condition.evaluator(trigger);
                            }
                            break;
                            
                        default:
                            console.warn(`알 수 없는 조건 타입: ${conditionType}`);
                    }
                });
                
                return shouldShow;
            };
            
            // 표시 상태 업데이트 함수
            const updateVisibility = () => {
                const shouldShow = evaluateCondition();
                
                targetElements.forEach(target => {
                    // 표시 상태 설정
                    target.style.display = shouldShow ? displayStyle : 'none';
                    
                    // required 속성 관리 (data-conditional-required 속성이 있는 필드)
                    const conditionalFields = target.querySelectorAll('[data-conditional-required="true"]');
                    conditionalFields.forEach(field => {
                        if (shouldShow) {
                            field.setAttribute('required', 'required');
                        } else {
                            field.removeAttribute('required');
                            
                            // 숨겨진 요소의 유효성 오류 제거
                            field.classList.remove('is-invalid');
                            
                            // 값 초기화 (옵션에 따라)
                            if (condition.resetOnHide) {
                                if (field.type === 'checkbox' || field.type === 'radio') {
                                    field.checked = false;
                                } else {
                                    field.value = '';
                                }
                                
                                // 변경 이벤트 발생
                                const event = new Event('change', { bubbles: true });
                                field.dispatchEvent(event);
                            }
                        }
                    });
                });
            };
            
            // 이벤트 타입 설정
            const eventType = condition.eventType || 'change';
            
            // 이벤트 리스너 등록
            triggerElements.forEach(trigger => {
                trigger.addEventListener(eventType, updateVisibility);
            });
            
            // 초기 상태 설정
            updateVisibility();
            
            // 정리 함수 추가
            cleanupFunctions.push(() => {
                triggerElements.forEach(trigger => {
                    trigger.removeEventListener(eventType, updateVisibility);
                });
            });
        });
        
        return cleanupFunctions;
    }
    
    /**
     * 동적 항목 목록 초기화
     * 항목을 추가/제거할 수 있는 동적 목록을 설정합니다.
     * 
     * @param {HTMLElement} container - 항목 컨테이너 요소
     * @param {Object} [options] - 초기화 옵션
     * @param {string} [options.itemSelector='.dynamic-item'] - 항목 요소 선택자
     * @param {string} [options.addButtonSelector='.btn-add-item'] - 추가 버튼 선택자
     * @param {string|Function} [options.itemTemplate] - 항목 HTML 템플릿 또는 템플릿 생성 함수
     * @param {number} [options.maxItems] - 최대 항목 수
     * @param {Function} [options.onItemAdded] - 항목 추가 후 콜백 함수
     * @param {Function} [options.onItemRemoved] - 항목 제거 후 콜백 함수
     * @returns {Object} 컨트롤 객체
     */
    function initDynamicItemsList(container, options = {}) {
        if (!container) return null;
        
        const {
            itemSelector = '.dynamic-item',
            addButtonSelector = '.btn-add-item',
            itemTemplate,
            maxItems,
            onItemAdded,
            onItemRemoved
        } = options;
        
        // 추가 버튼 찾기
        const addButton = container.querySelector(addButtonSelector) || 
                          document.querySelector(addButtonSelector);
        
        if (!addButton) {
            console.warn('추가 버튼을 찾을 수 없습니다.');
            return null;
        }
        
        if (!itemTemplate) {
            console.warn('항목 템플릿이 제공되지 않았습니다.');
            return null;
        }
        
        // 항목 카운트 관리 함수
        const updateItemCount = () => {
            const items = container.querySelectorAll(itemSelector);
            if (maxItems && items.length >= maxItems) {
                addButton.disabled = true;
            } else {
                addButton.disabled = false;
            }
        };
        
        // 항목 추가 함수
        const addItem = () => {
            const items = container.querySelectorAll(itemSelector);
            
            // 최대 항목 수 체크
            if (maxItems && items.length >= maxItems) {
                if (window.UIUtils && window.UIUtils.showAlert) {
                    window.UIUtils.showAlert(`최대 ${maxItems}개까지 추가할 수 있습니다.`, 'warning');
                }
                return null;
            }
            
            // 템플릿 생성
            let newItem;
            if (typeof itemTemplate === 'function') {
                newItem = itemTemplate(items.length);
            } else if (typeof itemTemplate === 'string') {
                const temp = document.createElement('div');
                temp.innerHTML = itemTemplate.trim();
                newItem = temp.firstChild;
            } else if (itemTemplate instanceof HTMLElement) {
                newItem = itemTemplate.cloneNode(true);
            }
            
            if (!newItem) {
                console.warn('유효한 항목 템플릿이 아닙니다.');
                return null;
            }
            
            // 항목 인덱스 설정
            const itemIndex = items.length;
            newItem.dataset.index = itemIndex;
            
            // 항목 내 필드 ID와 name 업데이트
            const fields = newItem.querySelectorAll('input, select, textarea');
            fields.forEach(field => {
                if (field.id) {
                    field.id = field.id.replace(/\d+/, itemIndex);
                }
                
                if (field.name) {
                    field.name = field.name.replace(/\[\d+\]/, `[${itemIndex}]`);
                }
                
                // 레이블 업데이트
                if (field.id) {
                    const label = newItem.querySelector(`label[for="${field.id.replace(itemIndex, '0')}"]`);
                    if (label) {
                        label.setAttribute('for', field.id);
                    }
                }
            });
            
            // 삭제 버튼 이벤트 리스너 추가
            const deleteButton = newItem.querySelector('.btn-delete-item, .delete-item-btn');
            if (deleteButton) {
                deleteButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    removeItem(newItem);
                });
            }
            
            // 항목 추가
            container.appendChild(newItem);
            
            // 항목 수 업데이트
            updateItemCount();
            
            // 콜백 호출
            if (typeof onItemAdded === 'function') {
                onItemAdded(newItem, itemIndex);
            }
            
            return newItem;
        };
        
        // 항목 제거 함수
        const removeItem = (item) => {
            if (!item) return;
            
            // 제거 확인
            if (options.confirmRemoval && window.UIUtils && window.UIUtils.showConfirmDialog) {
                window.UIUtils.showConfirmDialog({
                    message: '이 항목을 삭제하시겠습니까?',
                    onConfirm: () => {
                        doRemoveItem(item);
                    }
                });
            } else if (options.confirmRemoval) {
                if (confirm('이 항목을 삭제하시겠습니까?')) {
                    doRemoveItem(item);
                }
            } else {
                doRemoveItem(item);
            }
        };
        
        // 실제 항목 제거 함수
        const doRemoveItem = (item) => {
            const itemIndex = parseInt(item.dataset.index, 10);
            container.removeChild(item);
            
            // 항목 재정렬
            const items = container.querySelectorAll(itemSelector);
            items.forEach((item, index) => {
                item.dataset.index = index;
                
                // 필드 업데이트
                const fields = item.querySelectorAll('input, select, textarea');
                fields.forEach(field => {
                    if (field.id) {
                        field.id = field.id.replace(/\d+/, index);
                    }
                    
                    if (field.name) {
                        field.name = field.name.replace(/\[\d+\]/, `[${index}]`);
                    }
                    
                    // 레이블 업데이트
                    if (field.id) {
                        const label = item.querySelector(`label[for^="${field.id.replace(/\d+/, '')}"]`);
                        if (label) {
                            label.setAttribute('for', field.id);
                        }
                    }
                });
            });
            
            // 항목 수 업데이트
            updateItemCount();
            
            // 콜백 호출
            if (typeof onItemRemoved === 'function') {
                onItemRemoved(itemIndex);
            }
        };
        
        // 추가 버튼 이벤트 리스너
        addButton.addEventListener('click', (e) => {
            e.preventDefault();
            addItem();
        });
        
        // 기존 항목에 삭제 이벤트 리스너 추가
        const existingItems = container.querySelectorAll(itemSelector);
        existingItems.forEach((item, index) => {
            item.dataset.index = index;
            
            const deleteButton = item.querySelector('.btn-delete-item, .delete-item-btn');
            if (deleteButton) {
                deleteButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    removeItem(item);
                });
            }
        });
        
        // 초기 상태 설정
        updateItemCount();
        
        // 컨트롤 객체 반환
        return {
            addItem,
            removeItem,
            getItems: () => container.querySelectorAll(itemSelector),
            getItemCount: () => container.querySelectorAll(itemSelector).length,
            updateItemCount,
            reset: () => {
                // 모든 항목 제거
                const items = Array.from(container.querySelectorAll(itemSelector));
                items.forEach(item => {
                    container.removeChild(item);
                });
                updateItemCount();
            }
        };
    }
    
    /**
     * 필드 오류 표시
     * @param {HTMLElement} field - 오류를 표시할 필드
     * @param {string} message - 오류 메시지
     */
    function showFieldError(field, message) {
        if (!field) return;
        
        // FormValidator 모듈이 있는 경우 사용
        if (window.FormValidator && window.FormValidator.setFieldValidState) {
            window.FormValidator.setFieldValidState(field, false, message);
            return;
        }
        
        // 기본 오류 표시
        field.classList.add('is-invalid');
        field.setCustomValidity(message);
        
        // 피드백 요소 찾기 또는 생성
        let feedbackElement = field.nextElementSibling;
        if (!feedbackElement || !feedbackElement.classList.contains('invalid-feedback')) {
            feedbackElement = document.createElement('div');
            feedbackElement.className = 'invalid-feedback';
            field.parentNode.insertBefore(feedbackElement, field.nextSibling);
        }
        
        feedbackElement.textContent = message;
        
        // 필드에 포커스
        field.focus();
    }
    
    /**
     * 필드 오류 지우기
     * @param {HTMLElement} field - 오류를 지울 필드
     */
    function clearFieldErrors(field) {
        if (!field) return;
        
        // FormValidator 모듈이 있는 경우 사용
        if (window.FormValidator && window.FormValidator.resetFieldState) {
            window.FormValidator.resetFieldState(field);
            return;
        }
        
        // 기본 오류 지우기
        field.classList.remove('is-invalid');
        field.setCustomValidity('');
        
        // 피드백 요소 찾기 및 내용 지우기
        const feedbackElement = field.nextElementSibling;
        if (feedbackElement && feedbackElement.classList.contains('invalid-feedback')) {
            feedbackElement.textContent = '';
        }
    }
    
    /**
     * 유효하지 않은 필드 강조
     * @param {HTMLFormElement} form - 강조할 폼 요소
     * @param {boolean} [scrollToFirst=true] - 첫 번째 유효하지 않은 필드로 스크롤 여부
     * @returns {number} 유효하지 않은 필드 수
     */
    function highlightInvalidFields(form, scrollToFirst = true) {
        if (!form) return 0;
        
        // 폼 유효성 검사
        form.classList.add('was-validated');
        
        // 유효하지 않은 필드 찾기
        const invalidFields = form.querySelectorAll(':invalid');
        const invalidCount = invalidFields.length;
        
        // 첫 번째 유효하지 않은 필드로 스크롤
        if (invalidCount > 0 && scrollToFirst) {
            invalidFields[0].focus();
            invalidFields[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        return invalidCount;
    }
    
    // 공개 API
    return {
        initDynamicFormValidation,
        initConditionalFormFields,
        initDynamicItemsList,
        showFieldError,
        clearFieldErrors,
        highlightInvalidFields
    };
})();

export default FormUI; 