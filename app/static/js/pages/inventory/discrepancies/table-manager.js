/**
 * 인벤토리 불일치 항목 테이블 관리 모듈
 * @module inventory/discrepancies/table-manager
 */

/**
 * 테이블 행 이벤트 초기화
 * @returns {Function} 이벤트 정리 함수
 */
export function initTableRows() {
    const tableRows = document.querySelectorAll('table.table tbody tr');
    if (tableRows.length === 0) return null;
    
    const rowHandlers = [];
    
    tableRows.forEach(row => {
        // 상세보기 링크가 있는 행만 처리 (컬럼이 합쳐진 행은 제외)
        if (!row.querySelector('td[colspan]')) {
            const handleRowClick = function(e) {
                // 드롭다운 메뉴나 버튼 클릭은 무시
                if (e.target.closest('.dropdown') || 
                    e.target.tagName === 'BUTTON' || 
                    e.target.tagName === 'A') {
                    return;
                }
                
                // 상세 보기 링크가 있으면 이동
                const detailLink = row.querySelector('.dropdown-item[href*="edit"]');
                if (detailLink) {
                    window.location.href = detailLink.getAttribute('href');
                }
            };
            
            row.addEventListener('click', handleRowClick);
            rowHandlers.push({ element: row, handler: handleRowClick });
        }
    });
    
    // 정리 함수 반환
    return function cleanup() {
        rowHandlers.forEach(item => {
            item.element.removeEventListener('click', item.handler);
        });
    };
} 