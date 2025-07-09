/**
 * 자산 목록 핵심 모듈
 * 자산 목록 페이지의 핵심 초기화 코드를 담당합니다.
 */

import TableUtils from '../../../common/table-utils.js';

/**
 * 자산 테이블 초기화 함수
 */
function initAssetTable() {
    // 테이블 행 클릭 이벤트
    TableUtils.initTableRowClick({
        rowSelector: '.asset-row',
        clickHandler: function(e, row) {
            // 체크박스나 버튼 등을 클릭한 경우 이벤트 무시
            if (e.target.closest('input[type="checkbox"]') || 
                e.target.closest('button') ||
                e.target.closest('a')) {
                return;
            }
            
            // 상세 페이지로 이동
            if (row.dataset.href) {
                window.location.href = row.dataset.href;
            }
        }
    });
    
    // 테이블 정렬 기능 초기화
    TableUtils.initializeTableSorting({
        tableSelector: '#assetTable',
        headerSelector: 'th[data-sort]',
        defaultColumn: 'assetId',
        defaultDirection: 'asc'
    });
    
    // 테이블 페이지네이션 초기화
    TableUtils.initializePagination({
        tableSelector: '#assetTable',
        paginationSelector: '#tablePagination',
        itemsPerPage: 10,
        visiblePageNumbers: 5
    });
}

/**
 * 이벤트 리스너 정리 함수
 */
function cleanup() {
    // 정리해야 할 이벤트 리스너가 있으면 여기에 추가
    console.log('자산 목록 페이지 이벤트 리스너 정리');
}

// 공개 API
export {
    initAssetTable,
    cleanup
}; 