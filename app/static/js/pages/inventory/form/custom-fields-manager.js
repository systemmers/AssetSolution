/**
 * 인벤토리 폼 사용자 정의 필드 관리 모듈
 * @module inventory/form/custom-fields-manager
 */
import UIUtils from '../../../../common/ui-utils.js';

/**
 * 사용자 정의 필드 기능 초기화
 * @returns {Function} 이벤트 정리 함수
 */
export function initCustomFields() {
    const addFieldButton = document.getElementById('addCustomField');
    const customFieldsContainer = document.getElementById('customFields');
    
    if (!addFieldButton || !customFieldsContainer) return null;
    
    // 필드 추가 버튼 이벤트 핸들러
    const handleAddField = function() {
        // 현재 필드 수 계산
        const currentFields = customFieldsContainer.querySelectorAll('.custom-field-row');
        const index = currentFields.length;
        
        // 새 필드 행 생성
        const newRow = UIUtils.createElement('div', {
            class: 'row custom-field-row mb-3',
            'data-index': index
        });
        
        // 새 필드 행 내용 구성
        newRow.innerHTML = `
            <div class="col-md-5">
                <input type="text" class="form-control" name="customFieldName_${index}" placeholder="필드 이름" required>
            </div>
            <div class="col-md-5">
                <select class="form-select" name="customFieldType_${index}">
                    <option value="text">텍스트</option>
                    <option value="number">숫자</option>
                    <option value="date">날짜</option>
                    <option value="boolean">예/아니오</option>
                </select>
            </div>
            <div class="col-md-2">
                <button type="button" class="btn btn-outline-danger remove-field" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // 삭제 버튼 이벤트 핸들러 설정
        const removeButton = newRow.querySelector('.remove-field');
        if (removeButton) {
            removeButton.addEventListener('click', function() {
                // 필드 행 제거
                customFieldsContainer.removeChild(newRow);
                
                // 인덱스 재정렬
                reorderCustomFields();
            });
        }
        
        // 새 행을 컨테이너에 추가
        customFieldsContainer.appendChild(newRow);
        
        // 새 필드로 포커스 이동
        newRow.querySelector('input[type="text"]').focus();
    };
    
    // 필드 추가 버튼 이벤트 등록
    addFieldButton.addEventListener('click', handleAddField);
    
    // 이미 존재하는 필드의 삭제 버튼 이벤트 등록
    const existingRemoveButtons = customFieldsContainer.querySelectorAll('.remove-field');
    existingRemoveButtons.forEach(button => {
        button.addEventListener('click', function() {
            const row = button.closest('.custom-field-row');
            if (row) {
                customFieldsContainer.removeChild(row);
                
                // 인덱스 재정렬
                reorderCustomFields();
            }
        });
    });
    
    // 사용자 정의 필드 인덱스 재정렬 함수
    function reorderCustomFields() {
        const fieldRows = customFieldsContainer.querySelectorAll('.custom-field-row');
        
        fieldRows.forEach((row, index) => {
            // 데이터 인덱스 속성 업데이트
            row.setAttribute('data-index', index);
            
            // 입력 필드 이름 속성 업데이트
            const nameInput = row.querySelector('input[type="text"]');
            if (nameInput) {
                nameInput.name = `customFieldName_${index}`;
            }
            
            // 선택 필드 이름 속성 업데이트
            const typeSelect = row.querySelector('select');
            if (typeSelect) {
                typeSelect.name = `customFieldType_${index}`;
            }
            
            // 삭제 버튼 데이터 인덱스 업데이트
            const removeButton = row.querySelector('.remove-field');
            if (removeButton) {
                removeButton.setAttribute('data-index', index);
            }
        });
        
        // 숨겨진 필드에 전체 필드 수 저장
        const fieldCountInput = document.getElementById('customFieldCount');
        if (fieldCountInput) {
            fieldCountInput.value = fieldRows.length;
        }
    }
    
    // 초기 필드 수 설정
    reorderCustomFields();
    
    // 정리 함수 반환
    return function cleanup() {
        addFieldButton.removeEventListener('click', handleAddField);
        
        // 모든 삭제 버튼 이벤트 제거
        const removeButtons = customFieldsContainer.querySelectorAll('.remove-field');
        removeButtons.forEach(button => {
            button.removeEventListener('click', null);
        });
    };
} 