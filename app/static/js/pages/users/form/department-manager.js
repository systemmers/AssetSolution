/**
 * 사용자 부서 선택 관리 모듈
 * @module users/form/department-manager
 */
import UIUtils from '../../../../common/ui-utils.js';
import ApiUtils from '../../../../common/api-utils.js';

/**
 * 부서 선택 기능 초기화
 * @returns {Function} 이벤트 정리 함수
 */
export function initDepartmentSelection() {
    const departmentSelect = document.getElementById('department');
    const newDepartmentInput = document.getElementById('newDepartment');
    const newDepartmentGroup = document.getElementById('newDepartmentGroup');
    
    if (!departmentSelect || !newDepartmentInput || !newDepartmentGroup) return null;
    
    // 새 부서 입력 영역 표시/숨김 처리 함수
    const handleDepartmentChange = function() {
        if (this.value === 'new') {
            UIUtils.toggleElementVisibility(newDepartmentGroup, true);
            newDepartmentInput.setAttribute('required', 'required');
            newDepartmentInput.focus();
        } else {
            UIUtils.toggleElementVisibility(newDepartmentGroup, false);
            newDepartmentInput.removeAttribute('required');
        }
    };
    
    // 이벤트 리스너 등록
    departmentSelect.addEventListener('change', handleDepartmentChange);
    
    // 초기 상태 설정
    if (departmentSelect.value === 'new') {
        UIUtils.toggleElementVisibility(newDepartmentGroup, true);
        newDepartmentInput.setAttribute('required', 'required');
    } else {
        UIUtils.toggleElementVisibility(newDepartmentGroup, false);
        newDepartmentInput.removeAttribute('required');
    }
    
    // 부서 자동 완성 초기화
    const autocompleteCleanup = initDepartmentAutocomplete(newDepartmentInput);
    
    // 정리 함수 반환
    return function cleanup() {
        departmentSelect.removeEventListener('change', handleDepartmentChange);
        if (typeof autocompleteCleanup === 'function') {
            autocompleteCleanup();
        }
    };
}

/**
 * 부서명 자동 완성 초기화
 * @param {HTMLElement} inputElement - 부서명 입력 요소
 * @returns {Function} 이벤트 정리 함수
 */
function initDepartmentAutocomplete(inputElement) {
    if (!inputElement) return null;
    
    // 자동 완성 요소 생성
    const autocompleteContainer = document.createElement('div');
    autocompleteContainer.className = 'autocomplete-items d-none';
    autocompleteContainer.style.position = 'absolute';
    autocompleteContainer.style.zIndex = '99';
    autocompleteContainer.style.width = '100%';
    autocompleteContainer.style.maxHeight = '200px';
    autocompleteContainer.style.overflowY = 'auto';
    autocompleteContainer.style.border = '1px solid #ddd';
    autocompleteContainer.style.borderTop = 'none';
    
    // 자동 완성 요소 추가
    inputElement.parentNode.style.position = 'relative';
    inputElement.parentNode.appendChild(autocompleteContainer);
    
    // 부서명 목록 (실제로는 API에서 가져올 것)
    const departments = [
        '기획팀', '개발팀', '디자인팀', '마케팅팀', '영업팀', 
        '인사팀', '재무팀', '법무팀', '고객지원팀', '운영팀'
    ];
    
    // 입력 이벤트 핸들러
    const handleInput = function() {
        const value = this.value.trim();
        
        // 입력이 비어있으면 자동 완성 목록 숨김
        if (!value) {
            autocompleteContainer.innerHTML = '';
            autocompleteContainer.classList.add('d-none');
            return;
        }
        
        // 기존 자동 완성 목록 초기화
        autocompleteContainer.innerHTML = '';
        
        // 입력값과 일치하는 부서 검색
        const matches = departments.filter(dept => 
            dept.toLowerCase().includes(value.toLowerCase())
        );
        
        // 일치하는 항목이 없으면 자동 완성 목록 숨김
        if (matches.length === 0) {
            autocompleteContainer.classList.add('d-none');
            return;
        }
        
        // 자동 완성 목록 표시
        autocompleteContainer.classList.remove('d-none');
        
        // 각 일치 항목에 대한 요소 생성
        matches.forEach(match => {
            const item = document.createElement('div');
            item.className = 'p-2 bg-white';
            item.style.cursor = 'pointer';
            
            // 일치하는 부분 강조
            const regex = new RegExp(value, 'gi');
            const highlightedMatch = match.replace(regex, match => `<strong>${match}</strong>`);
            item.innerHTML = highlightedMatch;
            
            // 항목 클릭 시 입력창에 값 설정
            item.addEventListener('click', function() {
                inputElement.value = match;
                autocompleteContainer.innerHTML = '';
                autocompleteContainer.classList.add('d-none');
            });
            
            // 마우스 오버 시 하이라이트
            item.addEventListener('mouseover', function() {
                this.classList.add('bg-light');
            });
            
            // 마우스 아웃 시 하이라이트 제거
            item.addEventListener('mouseout', function() {
                this.classList.remove('bg-light');
            });
            
            autocompleteContainer.appendChild(item);
        });
    };
    
    // 포커스 아웃 이벤트 핸들러
    const handleFocusOut = function(e) {
        // 자동 완성 항목을 클릭한 경우가 아니라면 자동 완성 목록 숨김
        if (!autocompleteContainer.contains(e.relatedTarget)) {
            setTimeout(() => {
                autocompleteContainer.innerHTML = '';
                autocompleteContainer.classList.add('d-none');
            }, 200);
        }
    };
    
    // 이벤트 리스너 등록
    inputElement.addEventListener('input', handleInput);
    inputElement.addEventListener('focusout', handleFocusOut);
    
    // 정리 함수 반환
    return function cleanup() {
        inputElement.removeEventListener('input', handleInput);
        inputElement.removeEventListener('focusout', handleFocusOut);
        
        if (autocompleteContainer.parentNode) {
            autocompleteContainer.parentNode.removeChild(autocompleteContainer);
        }
    };
} 