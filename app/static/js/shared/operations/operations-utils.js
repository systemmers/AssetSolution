/**
 * 자산 운영 관리 공통 유틸리티 함수
 * asset_solution/static/js/pages/operations/operations-utils.js
 */

const OperationsUtils = (function() {
    /**
     * 현재 날짜를 ISO 형식(YYYY-MM-DD)으로 반환
     * @returns {string} 오늘 날짜 YYYY-MM-DD 형식
     */
    function getTodayISOString() {
        return new Date().toISOString().split('T')[0];
    }

    /**
     * 특정 입력 필드에 현재 날짜 설정
     * @param {string} elementId 날짜를 설정할 입력 필드 ID
     */
    function setDateToday(elementId) {
        document.getElementById(elementId).value = getTodayISOString();
    }

    /**
     * 이미지 미리보기 처리
     * @param {HTMLElement} input 파일 업로드 입력 요소
     * @param {string} targetId 이미지가 표시될 컨테이너 ID
     */
    function previewImage(input, targetId) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.querySelector(`#${targetId} img`).src = e.target.result;
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

    /**
     * 테이블 로딩 상태 표시
     * @param {string} tableBodyId 테이블 본문 요소 ID
     * @param {number} colSpan 열 합치기 수
     * @param {string} spinnerColorClass 스피너 색상 클래스 (예: text-primary)
     */
    function showTableLoading(tableBodyId, colSpan, spinnerColorClass = 'text-primary') {
        const tableBody = document.getElementById(tableBodyId);
        tableBody.innerHTML = `
            <tr>
                <td colspan="${colSpan}" class="text-center py-4">
                    <div class="spinner-border ${spinnerColorClass}" role="status">
                        <span class="visually-hidden">로딩 중...</span>
                    </div>
                </td>
            </tr>
        `;
    }

    /**
     * 테이블에 '데이터 없음' 메시지 표시
     * @param {string} tableBodyId 테이블 본문 요소 ID
     * @param {number} colSpan 열 합치기 수
     * @param {string} message 표시할 메시지
     */
    function showNoDataMessage(tableBodyId, colSpan, message = '데이터가 없습니다.') {
        const tableBody = document.getElementById(tableBodyId);
        tableBody.innerHTML = `
            <tr>
                <td colspan="${colSpan}" class="text-center py-3">
                    ${message}
                </td>
            </tr>
        `;
    }

    /**
     * 선택된 행 하이라이트 처리
     * @param {HTMLElement} selectedElement 선택된 요소
     * @param {string} tableSelector 테이블 선택자
     * @param {string} highlightClass 하이라이트 클래스
     */
    function highlightSelectedRow(selectedElement, tableSelector, highlightClass = 'selected-asset') {
        // 선택된 요소의 가장 가까운 tbody 찾기
        const tbody = selectedElement.closest('tbody');
        if (!tbody) return;
        
        // 모든 행에서 하이라이트 클래스 제거
        tbody.querySelectorAll('tr').forEach(row => {
            row.classList.remove(highlightClass);
        });
        
        // 선택된 행에 하이라이트 클래스 추가
        const row = selectedElement.closest('tr');
        if (row) {
            row.classList.add(highlightClass);
        }
    }

    /**
     * 자산 테이블에서 선택한 데이터로 폼 채우기
     * @param {Element} radio 선택된 라디오 버튼 요소
     * @param {Object} fieldMap 필드 맵핑 {datasetKey: formFieldId}
     * @param {string|null} imageContainerId 이미지 컨테이너 ID (있는 경우)
     * @param {boolean} enableSubmitButton 제출 버튼 활성화 여부
     * @param {string|null} submitButtonId 제출 버튼 ID (있는 경우)
     */
    function fillFormFromSelection(radio, fieldMap, imageContainerId = null, enableSubmitButton = true, submitButtonId = null) {
        if (!radio || !radio.dataset) return;
        
        const dataset = radio.dataset;
        
        // 필드 맵핑에 따라 폼 필드 채우기
        for (const [dataKey, fieldId] of Object.entries(fieldMap)) {
            const field = document.getElementById(fieldId);
            if (field && dataset[dataKey] !== undefined) {
                field.value = dataset[dataKey];
            }
        }
        
        // 이미지 처리
        if (imageContainerId && dataset.image) {
            const imgElement = document.querySelector(`#${imageContainerId} img`);
            if (imgElement) {
                imgElement.src = dataset.image || "/static/img/no-image.png";
            }
        }
        
        // 제출 버튼 활성화
        if (enableSubmitButton && submitButtonId) {
            const submitButton = document.getElementById(submitButtonId);
            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    }

    /**
     * 폼 유효성 검사
     * @param {Array} requiredFields 필수 필드 ID 배열
     * @param {string} errorMessage 오류 메시지
     * @returns {boolean} 유효성 검사 통과 여부
     */
    function validateRequiredFields(requiredFields, errorMessage = '필수 항목을 모두 입력해주세요.') {
        let isValid = true;
        
        requiredFields.forEach(field => {
            const element = document.getElementById(field);
            if (!element || !element.value) {
                if (element) element.classList.add('is-invalid');
                isValid = false;
            } else {
                if (element) element.classList.remove('is-invalid');
            }
        });
        
        if (!isValid) {
            if (window.UIUtils && window.UIUtils.showAlert) {
                window.UIUtils.showAlert(errorMessage, 'danger', 3000);
            } else {
                alert(errorMessage);
            }
        }
        
        return isValid;
    }

    /**
     * 모달 표시
     * @param {string} modalId 모달 ID
     * @param {string} action 'show', 'hide', 'toggle' 중 하나
     */
    function toggleModal(modalId, action = 'show') {
        if (window.UIUtils && window.UIUtils.toggleModal) {
            window.UIUtils.toggleModal(modalId, action);
        } else {
            const modalEl = document.getElementById(modalId);
            if (!modalEl) return;
            
            if (typeof bootstrap !== 'undefined') {
                const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                
                if (action === 'show') modal.show();
                else if (action === 'hide') modal.hide();
                else modal.toggle();
            }
        }
    }

    /**
     * 폼 초기화 및 기본값 설정
     * @param {string} formId 폼 ID
     * @param {Object} defaultValues 기본값 {필드ID: 값}
     * @param {Array} imageContainers 초기화할 이미지 컨테이너 ID 배열
     * @param {string} submitButtonId 비활성화할 제출 버튼 ID
     */
    function resetForm(formId, defaultValues = {}, imageContainers = [], submitButtonId = null) {
        const form = document.getElementById(formId);
        if (form) form.reset();
        
        // 기본값 설정
        for (const [fieldId, value] of Object.entries(defaultValues)) {
            const field = document.getElementById(fieldId);
            if (field) field.value = value;
        }
        
        // 이미지 컨테이너 초기화
        imageContainers.forEach(containerId => {
            const imgElement = document.querySelector(`#${containerId} img`);
            if (imgElement) {
                imgElement.src = "/static/img/no-image.png";
            }
        });
        
        // 제출 버튼 비활성화
        if (submitButtonId) {
            const submitButton = document.getElementById(submitButtonId);
            if (submitButton) submitButton.disabled = true;
        }
    }

    // 공개 API
    return {
        getTodayISOString,
        setDateToday,
        previewImage,
        showTableLoading,
        showNoDataMessage,
        highlightSelectedRow,
        fillFormFromSelection,
        validateRequiredFields,
        toggleModal,
        resetForm
    };
})();

// 모듈 내보내기
window.OperationsUtils = OperationsUtils; 