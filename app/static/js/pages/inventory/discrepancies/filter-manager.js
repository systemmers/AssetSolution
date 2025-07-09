/**
 * 인벤토리 불일치 항목 필터 관리 모듈
 * @module inventory/discrepancies/filter-manager
 */

/**
 * 필터 기능 초기화
 * @returns {Function} 이벤트 정리 함수
 */
export function initFilters() {
    // 필터 변경 시 자동 제출
    const filters = document.querySelectorAll('#inventoryFilter, #typeFilter, #statusFilter, #dateFilter');
    if (filters.length === 0) return null;
    
    const filterChangeHandlers = [];
    
    // 각 필터에 이벤트 핸들러 등록
    filters.forEach(function(filter) {
        const handleFilterChange = function() {
            const filterForm = document.getElementById('filterForm');
            if (filterForm) {
                filterForm.submit();
            }
        };
        
        filter.addEventListener('change', handleFilterChange);
        filterChangeHandlers.push({ element: filter, handler: handleFilterChange });
    });
    
    // 초기화 버튼 이벤트
    const resetButton = document.querySelector('a.btn-secondary[href*="discrepancies"]');
    let resetButtonHandler = null;
    
    if (resetButton) {
        resetButtonHandler = function(e) {
            e.preventDefault();
            // 모든 필터 초기화
            filters.forEach(filter => filter.selectedIndex = 0);
            // 폼 제출
            const filterForm = document.getElementById('filterForm');
            if (filterForm) {
                filterForm.submit();
            }
        };
        
        resetButton.addEventListener('click', resetButtonHandler);
    }
    
    // 정리 함수 반환
    return function cleanup() {
        // 변경 이벤트 리스너 제거
        filterChangeHandlers.forEach(item => {
            item.element.removeEventListener('change', item.handler);
        });
        
        // 초기화 버튼 이벤트 리스너 제거
        if (resetButton && resetButtonHandler) {
            resetButton.removeEventListener('click', resetButtonHandler);
        }
    };
} 