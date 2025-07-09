/**
 * 자산실사 불일치 항목 페이지 메인 JavaScript 모듈
 * @module inventory/discrepancies/index
 */
import { initFilters } from './filter-manager.js';
import { initTableRows } from './table-manager.js';
import { initStatusDropdowns } from './status-manager.js';

// 이벤트 리스너 정리를 위한 정리 함수 배열
const cleanupFunctions = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('자산실사 불일치 항목 페이지 스크립트 로드됨');
    
    // 필터 초기화
    const filtersCleanup = initFilters();
    if (filtersCleanup) cleanupFunctions.push(filtersCleanup);
    
    // 테이블 행 이벤트 초기화
    const tableRowsCleanup = initTableRows();
    if (tableRowsCleanup) cleanupFunctions.push(tableRowsCleanup);
    
    // 처리 상태 변경 드롭다운 초기화
    const statusDropdownsCleanup = initStatusDropdowns();
    if (statusDropdownsCleanup) cleanupFunctions.push(statusDropdownsCleanup);
    
    // DOM 언로드 시 이벤트 리스너 정리
    window.addEventListener('beforeunload', cleanupEventListeners);
    cleanupFunctions.push(() => window.removeEventListener('beforeunload', cleanupEventListeners));
});

/**
 * 이벤트 리스너 정리 함수
 */
function cleanupEventListeners() {
    console.log('자산실사 불일치 항목 페이지 이벤트 리스너 정리');
    cleanupFunctions.forEach(cleanup => {
        if (typeof cleanup === 'function') {
            cleanup();
        }
    });
} 