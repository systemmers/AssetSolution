/**
 * 인벤토리 상세 테이블 관리 모듈
 * @module inventory/detail/table-manager
 */
import TableUtils from '../../../../common/table-utils.js';

/**
 * 테이블 필터링 기능 초기화
 * @returns {Function} 이벤트 정리 함수
 */
export function initTableFilters() {
    const filterInput = document.getElementById('assetFilter');
    if (!filterInput) return null;
    
    // TableUtils를 사용하여 테이블 필터링 기능 설정
    const filterCleanup = TableUtils.setupTableFilter({
        inputSelector: '#assetFilter',
        tableSelector: '.asset-table',
        rowSelector: '.asset-item',
        searchableSelectors: ['.asset-name', '.asset-id'],
        onFilter: (totalRows, visibleRows) => {
            updateFilterResults(totalRows, visibleRows);
        }
    });
    
    return filterCleanup;
}

/**
 * 필터링 결과 업데이트
 * @param {number} totalCount - 전체 행 수
 * @param {number} filteredCount - 필터링된 행 수
 */
export function updateFilterResults(totalCount, filteredCount) {
    const totalCountElement = document.getElementById('totalCount');
    const filteredCountElement = document.getElementById('filteredCount');
    
    if (!totalCountElement || !filteredCountElement) return;
    
    totalCountElement.textContent = totalCount;
    filteredCountElement.textContent = filteredCount;
} 