/**
 * 인벤토리 폼 미리보기 관리 모듈
 * @module inventory/form/preview-manager
 */
import UIUtils from '../../../../common/ui-utils.js';
import FormUtils from '../../../../common/form-utils.js';

/**
 * 미리보기 버튼 기능 초기화
 * @returns {Function} 이벤트 정리 함수
 */
export function initPreviewButton() {
    const previewButton = document.getElementById('previewInventory');
    if (!previewButton) return null;
    
    // 미리보기 버튼 이벤트 핸들러
    const handlePreviewClick = function() {
        const form = document.getElementById('inventoryForm');
        if (!form) return;
        
        if (FormUtils.validateForm(form)) {
            UIUtils.showAlert('미리보기를 준비 중입니다...', 'info');
            
            // 미리보기 모달에 데이터 채우기
            const formData = new FormData(form);
            const name = formData.get('name');
            const startDate = formData.get('startDate');
            const endDate = formData.get('endDate');
            
            // 자산 범위 정보 가져오기
            let scopeInfo = '전체 자산';
            const assetScope = formData.get('assetScope');
            
            if (assetScope === 'department') {
                const departmentSelect = document.getElementById('departmentSelect');
                scopeInfo = `부서: ${departmentSelect.options[departmentSelect.selectedIndex].text}`;
            } else if (assetScope === 'location') {
                const locationSelect = document.getElementById('locationSelect');
                scopeInfo = `위치: ${locationSelect.options[locationSelect.selectedIndex].text}`;
            } else if (assetScope === 'type') {
                const typeSelect = document.getElementById('assetTypeSelect');
                scopeInfo = `자산 유형: ${typeSelect.options[typeSelect.selectedIndex].text}`;
            }
            
            // 실사 담당자 정보
            const managerName = formData.get('managerName') || '미지정';
            
            // 모달 내용 설정
            const modalBody = document.querySelector('#previewModal .modal-body');
            if (modalBody) {
                modalBody.innerHTML = `
                    <div class="preview-content">
                        <h4>${name}</h4>
                        <div class="mb-3">
                            <strong>조사 기간:</strong> ${startDate} ~ ${endDate}
                        </div>
                        <div class="mb-3">
                            <strong>자산 범위:</strong> ${scopeInfo}
                        </div>
                        <div class="mb-3">
                            <strong>실사 담당자:</strong> ${managerName}
                        </div>
                        <div class="mb-3">
                            <strong>대상 자산 수:</strong> 
                            <span class="badge bg-primary">${document.getElementById('assetCount')?.textContent || '0'}</span>
                        </div>
                        ${getCustomFieldsPreview(form)}
                        <hr>
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            이 미리보기는 실제 자산실사 화면의 간소화된 버전입니다. 
                            실제 실행 시에는 각 자산별 상태와 입력 필드가 포함됩니다.
                        </div>
                    </div>
                `;
            }
            
            // 모달 표시
            UIUtils.toggleModal('#previewModal', 'show');
        } else {
            UIUtils.showAlert('필수 입력 항목을 모두 입력해주세요.', 'warning');
        }
    };
    
    // 이벤트 등록
    previewButton.addEventListener('click', handlePreviewClick);
    
    // 정리 함수 반환
    return function cleanup() {
        previewButton.removeEventListener('click', handlePreviewClick);
    };
}

/**
 * 사용자 정의 필드 미리보기 HTML 생성
 * @param {HTMLFormElement} form - 폼 요소
 * @returns {string} HTML 문자열
 */
function getCustomFieldsPreview(form) {
    // 사용자 정의 필드가 있는지 확인
    const customFieldCount = form.querySelector('input[name="customFieldCount"]')?.value || 0;
    
    if (parseInt(customFieldCount) === 0) {
        return '<div class="mb-3"><strong>사용자 정의 필드:</strong> 없음</div>';
    }
    
    let fieldsHtml = '<div class="mb-3"><strong>사용자 정의 필드:</strong><ul class="list-group mt-2">';
    
    // 각 필드의 이름과 유형 가져오기
    for (let i = 0; i < customFieldCount; i++) {
        const nameInput = form.querySelector(`input[name="customFieldName_${i}"]`);
        const typeSelect = form.querySelector(`select[name="customFieldType_${i}"]`);
        
        if (nameInput && typeSelect) {
            const fieldName = nameInput.value;
            const fieldType = typeSelect.options[typeSelect.selectedIndex].text;
            
            fieldsHtml += `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    ${fieldName}
                    <span class="badge bg-secondary">${fieldType}</span>
                </li>
            `;
        }
    }
    
    fieldsHtml += '</ul></div>';
    return fieldsHtml;
} 