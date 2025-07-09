/**
 * 폼 요소 모듈
 * 동적 폼 요소 관리 기능을 제공합니다.
 * 
 * 함수 목록:
 * - initializeDatepickers: 날짜 선택기 초기화
 * - setupMultipleForms: 다중 폼 설정
 * - setupConditionalFields: 조건부 필드 표시 관리
 * - setupDynamicFields: 동적 필드 추가/제거 설정
 * - initTabNavigation: 탭 기반 폼 네비게이션 초기화
 */

const FormElements = (function() {
    /**
     * 날짜 선택기 초기화 함수
     * @param {string} [selector='.datepicker'] - 날짜 선택기 요소 선택자
     * @param {Object} [options] - 날짜 선택기 옵션
     */
    function initializeDatepickers(selector = '.datepicker', options = {}) {
        const datepickers = document.querySelectorAll(selector);
        
        if (!datepickers.length) return;
        
        // 기본 설정
        const defaults = {
            format: 'yyyy-mm-dd',
            autoclose: true,
            todayHighlight: true,
            language: 'ko',
            orientation: 'bottom'
        };
        
        // 사용자 옵션과 기본 옵션 병합
        const settings = { ...defaults, ...options };
        
        // flatpickr가 있는지 확인
        if (typeof flatpickr === 'function') {
            datepickers.forEach(picker => {
                // 이미 초기화된 플랫픽커가 있는지 확인
                if (picker._flatpickr) return;
                
                // 요소별 옵션 (data 속성으로 설정 가능)
                const elementOptions = { ...settings };
                
                // 최소 날짜 설정
                if (picker.dataset.minDate) {
                    elementOptions.minDate = picker.dataset.minDate;
                }
                
                // 최대 날짜 설정
                if (picker.dataset.maxDate) {
                    elementOptions.maxDate = picker.dataset.maxDate;
                }
                
                // flatpickr 초기화
                flatpickr(picker, elementOptions);
            });
        } else if (typeof $.fn.datepicker === 'function') {
            // 부트스트랩 데이트피커가 있는지 확인
            datepickers.forEach(picker => {
                // jQuery 객체로 변환
                const $picker = $(picker);
                
                // 이미 초기화되었는지 확인
                if ($picker.data('datepicker')) return;
                
                // 요소별 옵션
                const elementOptions = { ...settings };
                
                // 최소 날짜 설정
                if (picker.dataset.minDate) {
                    elementOptions.startDate = picker.dataset.minDate;
                }
                
                // 최대 날짜 설정
                if (picker.dataset.maxDate) {
                    elementOptions.endDate = picker.dataset.maxDate;
                }
                
                // 부트스트랩 데이트피커 초기화
                $picker.datepicker(elementOptions);
            });
        } else {
            console.warn('날짜 선택기 라이브러리를 찾을 수 없습니다. flatpickr 또는 bootstrap-datepicker를 로드해주세요.');
        }
    }
    
    /**
     * 다중 폼 설정 함수
     * 단일 페이지 내 여러 폼을 관리합니다.
     * 
     * @param {Object} options - 다중 폼 설정 옵션
     * @param {Array} options.forms - 폼 설정 객체 배열
     * @param {string} options.forms[].formId - 폼 ID
     * @param {Function} options.forms[].validateFn - 유효성 검사 함수 (생략 시 기본 검증)
     * @param {Function} options.forms[].submitFn - 제출 처리 함수
     * @param {string} options.forms[].submitButtonSelector - 제출 버튼 선택자
     * @param {boolean} options.forms[].resetAfterSubmit - 제출 후 폼 초기화 여부
     * @returns {Object} 이벤트 핸들러 정리 함수
     */
    function setupMultipleForms(options) {
        if (!options || !Array.isArray(options.forms) || !options.forms.length) {
            console.warn('setupMultipleForms: 유효한 폼 설정이 필요합니다.');
            return () => {};
        }
        
        const cleanupFunctions = [];
        
        options.forms.forEach(formConfig => {
            const { 
                formId, 
                validateFn, 
                submitFn, 
                submitButtonSelector,
                resetAfterSubmit = true
            } = formConfig;
            
            if (!formId || !submitFn || !submitButtonSelector) {
                console.warn(`setupMultipleForms: 필수 설정이 누락되었습니다. (formId: ${formId})`);
                return;
            }
            
            const form = document.getElementById(formId);
            const submitButton = document.querySelector(submitButtonSelector);
            
            if (!form || !submitButton) {
                console.warn(`setupMultipleForms: 폼(${formId}) 또는 버튼(${submitButtonSelector})을 찾을 수 없습니다.`);
                return;
            }
            
            // 제출 버튼 클릭 이벤트 핸들러
            const handleSubmit = (e) => {
                e.preventDefault();
                
                // 유효성 검사
                let isValid = true;
                if (typeof validateFn === 'function') {
                    isValid = validateFn(form);
                } else if (window.FormValidator && window.FormValidator.validateForm) {
                    isValid = window.FormValidator.validateForm(form);
                }
                
                if (!isValid) return;
                
                // 폼 제출 처리
                let formData;
                if (window.FormData && window.FormData.serializeForm) {
                    formData = window.FormData.serializeForm(form);
                } else {
                    // FormData 모듈이 없는 경우 간단한 직렬화
                    formData = {};
                    const elements = form.elements;
                    for (let i = 0; i < elements.length; i++) {
                        const element = elements[i];
                        if (element.name) {
                            if (element.type === 'checkbox' || element.type === 'radio') {
                                if (element.checked) {
                                    formData[element.name] = element.value;
                                }
                            } else {
                                formData[element.name] = element.value;
                            }
                        }
                    }
                }
                
                const result = submitFn(form, formData);
                
                // 제출 후 폼 초기화 (선택 사항)
                if (resetAfterSubmit && result !== false) {
                    if (window.FormData && window.FormData.resetForm) {
                        window.FormData.resetForm(form);
                    } else {
                        form.reset();
                    }
                }
            };
            
            // 이벤트 등록
            submitButton.addEventListener('click', handleSubmit);
            
            // 정리 함수 추가
            cleanupFunctions.push(() => {
                submitButton.removeEventListener('click', handleSubmit);
            });
        });
        
        // 모든 이벤트 핸들러 정리 함수 반환
        return function cleanup() {
            cleanupFunctions.forEach(fn => fn());
        };
    }
    
    /**
     * 조건부 필드 표시 관리 함수
     * 다른 필드 값에 따라 특정 필드를 표시하거나 숨깁니다.
     * 
     * @param {Object} options - 조건부 필드 설정 옵션
     * @param {string} options.triggerSelector - 트리거 필드 선택자
     * @param {string} options.targetSelector - 대상 컨테이너/필드 선택자
     * @param {Function} options.conditionFn - 표시 조건 평가 함수
     * @param {string} options.eventType - 이벤트 유형 (기본값: 'change')
     * @param {string} options.displayStyle - 표시 시 display 스타일 (기본값: 'block')
     * @returns {Function} 이벤트 핸들러 정리 함수
     */
    function setupConditionalFields(options) {
        const {
            triggerSelector,
            targetSelector,
            conditionFn,
            eventType = 'change',
            displayStyle = 'block'
        } = options;
        
        if (!triggerSelector || !targetSelector || typeof conditionFn !== 'function') {
            console.warn('setupConditionalFields: 올바른 설정이 필요합니다.');
            return () => {};
        }
        
        const triggerElements = document.querySelectorAll(triggerSelector);
        
        if (!triggerElements.length) {
            console.warn(`setupConditionalFields: 트리거 요소를 찾을 수 없습니다. (${triggerSelector})`);
            return () => {};
        }
        
        // 상태 업데이트 함수
        const updateVisibility = () => {
            const targetElements = document.querySelectorAll(targetSelector);
            
            targetElements.forEach(targetElement => {
                const shouldShow = conditionFn(triggerElements);
                
                if (shouldShow) {
                    targetElement.style.display = displayStyle;
                    // required 속성 관리
                    targetElement.querySelectorAll('[data-conditional-required="true"]').forEach(field => {
                        field.setAttribute('required', 'required');
                    });
                } else {
                    targetElement.style.display = 'none';
                    // required 속성 제거
                    targetElement.querySelectorAll('[data-conditional-required="true"]').forEach(field => {
                        field.removeAttribute('required');
                    });
                }
            });
        };
        
        // 초기 상태 설정
        updateVisibility();
        
        // 이벤트 리스너 설정
        triggerElements.forEach(element => {
            element.addEventListener(eventType, updateVisibility);
        });
        
        // 정리 함수 반환
        return function cleanup() {
            triggerElements.forEach(element => {
                element.removeEventListener(eventType, updateVisibility);
            });
        };
    }
    
    /**
     * 동적 필드 추가/제거 기능 설정
     * 
     * @param {Object} options - 동적 필드 설정 옵션
     * @param {string} options.containerSelector - 동적 필드 컨테이너 선택자
     * @param {string} options.addButtonSelector - 추가 버튼 선택자
     * @param {string} options.itemSelector - 항목 선택자
     * @param {string} options.itemTemplate - 새 항목 템플릿 (HTML 문자열 또는 DOM 요소)
     * @param {boolean} options.addDeleteButton - 삭제 버튼 추가 여부 (기본값: true)
     * @param {string} options.deleteButtonSelector - 삭제 버튼 선택자 (기본값: '.btn-delete-item')
     * @param {number} options.maxItems - 최대 항목 수 (선택 사항)
     * @param {number} options.minItems - 최소 항목 수 (선택 사항)
     * @param {Function} options.onItemAdded - 항목 추가 후 콜백 (선택 사항)
     * @param {Function} options.onItemRemoved - 항목 제거 후 콜백 (선택 사항)
     * @returns {Function} 이벤트 핸들러 정리 함수
     */
    function setupDynamicFields(options) {
        const {
            containerSelector,
            addButtonSelector,
            itemSelector,
            itemTemplate,
            addDeleteButton = true,
            deleteButtonSelector = '.btn-delete-item',
            maxItems,
            minItems = 0,
            onItemAdded,
            onItemRemoved
        } = options;
        
        if (!containerSelector || !addButtonSelector || !itemSelector || !itemTemplate) {
            console.warn('setupDynamicFields: 필수 설정이 누락되었습니다.');
            return () => {};
        }
        
        const container = document.querySelector(containerSelector);
        const addButton = document.querySelector(addButtonSelector);
        
        if (!container || !addButton) {
            console.warn('setupDynamicFields: 컨테이너 또는 추가 버튼을 찾을 수 없습니다.');
            return () => {};
        }
        
        // 항목 수 관리 함수
        const updateItemCount = () => {
            const items = container.querySelectorAll(itemSelector);
            const itemCount = items.length;
            
            // 최대 항목 수 제한
            if (maxItems !== undefined && maxItems !== null) {
                addButton.disabled = itemCount >= maxItems;
            }
            
            // 최소 항목 수 제한 (삭제 버튼 비활성화)
            if (minItems !== undefined && minItems !== null) {
                const deleteButtons = container.querySelectorAll(deleteButtonSelector);
                deleteButtons.forEach((button, index) => {
                    button.disabled = itemCount <= minItems;
                });
            }
            
            // 필드 인덱스 업데이트
            items.forEach((item, index) => {
                const fields = item.querySelectorAll('input, select, textarea');
                fields.forEach(field => {
                    // name 패턴 업데이트 (예: items[0][name] -> items[1][name])
                    if (field.name && field.name.includes('[')) {
                        const nameParts = field.name.split('[');
                        if (nameParts.length >= 2) {
                            const prefix = nameParts[0];
                            const suffix = nameParts.slice(1).join('[');
                            field.name = `${prefix}[${index}][${suffix}`;
                        }
                    }
                    
                    // id 패턴 업데이트 (예: item_0_name -> item_1_name)
                    if (field.id && field.id.includes('_')) {
                        const idParts = field.id.split('_');
                        if (idParts.length >= 3) {
                            idParts[1] = index.toString();
                            field.id = idParts.join('_');
                            
                            // 관련 레이블 업데이트
                            const label = item.querySelector(`label[for="${field.id}"]`);
                            if (label) {
                                label.setAttribute('for', field.id);
                            }
                        }
                    }
                });
                
                // 항목 번호 표시 업데이트
                const itemNumber = item.querySelector('.item-number');
                if (itemNumber) {
                    itemNumber.textContent = (index + 1).toString();
                }
            });
        };
        
        // 새 항목 추가 함수
        const addNewItem = () => {
            // 최대 항목 수 확인
            const items = container.querySelectorAll(itemSelector);
            if (maxItems !== undefined && maxItems !== null && items.length >= maxItems) {
                if (window.UIUtils && window.UIUtils.showAlert) {
                    window.UIUtils.showAlert(`최대 ${maxItems}개까지 추가할 수 있습니다.`, 'warning');
                }
                return;
            }
            
            // 템플릿으로부터 새 항목 생성
            let newItem;
            if (typeof itemTemplate === 'string') {
                const temp = document.createElement('div');
                temp.innerHTML = itemTemplate.trim();
                newItem = temp.firstChild;
            } else if (itemTemplate instanceof HTMLElement) {
                newItem = itemTemplate.cloneNode(true);
            }
            
            if (!newItem) {
                console.warn('setupDynamicFields: 유효한 템플릿이 아닙니다.');
                return;
            }
            
            // 삭제 버튼 추가 (선택 사항)
            if (addDeleteButton && !newItem.querySelector(deleteButtonSelector)) {
                const deleteButton = document.createElement('button');
                deleteButton.type = 'button';
                deleteButton.className = 'btn btn-sm btn-outline-danger btn-delete-item';
                deleteButton.innerHTML = '<i class="bi bi-trash"></i> 삭제';
                
                // 삭제 버튼 위치 지정 (기본: 끝에 추가)
                const buttonContainer = newItem.querySelector('.button-container') || newItem;
                buttonContainer.appendChild(deleteButton);
            }
            
            // 항목 추가
            container.appendChild(newItem);
            
            // 항목 수 업데이트
            updateItemCount();
            
            // 콜백 함수 호출 (선택 사항)
            if (typeof onItemAdded === 'function') {
                onItemAdded(newItem, container.querySelectorAll(itemSelector).length - 1);
            }
            
            return newItem;
        };
        
        // 항목 삭제 이벤트 핸들러
        const handleDeleteItem = (e) => {
            if (!e.target.closest(deleteButtonSelector)) return;
            
            const itemToRemove = e.target.closest(itemSelector);
            if (!itemToRemove) return;
            
            // 최소 항목 수 확인
            const items = container.querySelectorAll(itemSelector);
            if (minItems !== undefined && minItems !== null && items.length <= minItems) {
                if (window.UIUtils && window.UIUtils.showAlert) {
                    window.UIUtils.showAlert(`최소 ${minItems}개의 항목이 필요합니다.`, 'warning');
                }
                return;
            }
            
            // 삭제 확인 (UIUtils 사용)
            if (window.UIUtils && window.UIUtils.showConfirmDialog) {
                window.UIUtils.showConfirmDialog({
                    message: '이 항목을 삭제하시겠습니까?',
                    onConfirm: () => {
                        // 항목 제거
                        removeItem(itemToRemove);
                    }
                });
            } else {
                // UIUtils가 없는 경우 직접 확인
                if (confirm('이 항목을 삭제하시겠습니까?')) {
                    removeItem(itemToRemove);
                }
            }
        };
        
        // 항목 제거 함수
        const removeItem = (item) => {
            const itemIndex = Array.from(container.querySelectorAll(itemSelector)).indexOf(item);
            container.removeChild(item);
            
            // 항목 수 업데이트
            updateItemCount();
            
            // 콜백 함수 호출 (선택 사항)
            if (typeof onItemRemoved === 'function') {
                onItemRemoved(itemIndex);
            }
        };
        
        // 이벤트 리스너 등록
        addButton.addEventListener('click', addNewItem);
        container.addEventListener('click', handleDeleteItem);
        
        // 초기 상태 설정
        updateItemCount();
        
        // 정리 함수 반환
        return function cleanup() {
            addButton.removeEventListener('click', addNewItem);
            container.removeEventListener('click', handleDeleteItem);
        };
    }
    
    /**
     * 탭 기반 폼 네비게이션 초기화
     * @param {NodeList|Array} tabs - 탭 요소 목록
     */
    function initTabNavigation(tabs) {
        if (!tabs || !tabs.length) return;
        
        tabs.forEach(tab => {
            tab.addEventListener('shown.bs.tab', function(e) {
                // 현재 활성화된 탭 저장
                const tabId = e.target.getAttribute('href');
                localStorage.setItem('activeFormTab', tabId);
                
                // 추가 작업 (필요시)
                const tabContent = document.querySelector(tabId);
                if (tabContent) {
                    // 첫 번째 입력 필드로 포커스 이동 (선택 사항)
                    const firstInput = tabContent.querySelector('input:not([disabled]):not([readonly]), select:not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly])');
                    if (firstInput) {
                        setTimeout(() => {
                            firstInput.focus();
                        }, 100);
                    }
                }
            });
        });
        
        // 저장된 탭 복원
        const activeTabId = localStorage.getItem('activeFormTab');
        if (activeTabId) {
            const activeTab = document.querySelector(`[data-bs-toggle="tab"][href="${activeTabId}"]`);
            if (activeTab) {
                // 부트스트랩 Tab 인스턴스 생성 및 활성화
                if (typeof bootstrap !== 'undefined') {
                    const tab = new bootstrap.Tab(activeTab);
                    tab.show();
                } else {
                    // 부트스트랩 없이 직접 작동 (제한된 기능)
                    activeTab.click();
                }
            }
        }
    }
    
    // 공개 API
    return {
        initializeDatepickers,
        setupMultipleForms,
        setupConditionalFields,
        setupDynamicFields,
        initTabNavigation
    };
})();

export default FormElements; 