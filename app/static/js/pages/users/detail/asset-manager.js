/**
 * 사용자 자산 관리 모듈
 * @module users/detail/asset-manager
 */
import TableUtils from '../../../../common/table-utils.js';
import FormUtils from '../../../../common/form-utils.js';

/**
 * 자산 테이블 초기화
 * @returns {Function} 이벤트 정리 함수
 */
export function initAssetTable() {
    const table = document.querySelector('#userAssets');
    if (!table) return null;
    
    const cleanupFuncs = [];
    
    // TableUtils를 사용하여 테이블 정렬 초기화
    const sortCleanup = TableUtils.initializeTableSorting({
        tableSelector: '#userAssets',
        headerSelector: 'th[data-sort]'
    });
    if (sortCleanup) cleanupFuncs.push(sortCleanup);
    
    // TableUtils를 사용하여 테이블 행 클릭 이벤트 처리
    const rowClickCleanup = TableUtils.initTableRowClick({
        tableSelector: '#userAssets',
        rowSelector: 'tbody tr',
        ignoreTags: ['button', 'a', 'input'],
        dataAttribute: 'href',
        onRowClick: (url) => {
            if (url) {
                window.location.href = url;
            }
        }
    });
    if (rowClickCleanup) cleanupFuncs.push(rowClickCleanup);
    
    // 검색 필드 초기화
    const searchCleanup = initAssetSearch();
    if (searchCleanup) cleanupFuncs.push(searchCleanup);
    
    // 정리 함수 반환
    return function cleanup() {
        cleanupFuncs.forEach(fn => {
            if (typeof fn === 'function') fn();
        });
    };
}

/**
 * 자산 검색 필드 초기화
 * @returns {Function} 이벤트 정리 함수
 */
function initAssetSearch() {
    const searchInput = document.getElementById('assetSearch');
    if (!searchInput) return null;
    
    // 검색 입력 설정
    const searchCleanup = FormUtils.setupSearchInput(searchInput.id, null, (query) => {
        // 테이블 필터링
        if (query) {
            TableUtils.filterTable('#userAssets', query);
        } else {
            TableUtils.resetTableFilter('#userAssets');
        }
    });
    
    return searchCleanup;
} 