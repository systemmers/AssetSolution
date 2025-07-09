/**
 * 인벤토리 목록 페이지 메인 JavaScript 모듈
 * @module inventory/list/index
 */
import { initDataTable, initExportButtons, initStatusIndicators } from './table-manager.js';
import { initSearchFilters } from './filters-manager.js';

// 이벤트 리스너 정리를 위한 정리 함수 배열
const cleanupFunctions = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('인벤토리 목록 페이지 스크립트 로드됨');
    
    // 검색 필터링 기능 초기화
    const filterCleanup = initSearchFilters();
    if (filterCleanup) cleanupFunctions.push(filterCleanup);
    
    // 데이터 테이블 초기화
    const tableCleanup = initDataTable();
    if (tableCleanup) cleanupFunctions.push(tableCleanup);
    
    // 상태 표시기 초기화
    initStatusIndicators();
    
    // 내보내기 버튼 초기화
    const exportCleanup = initExportButtons();
    if (exportCleanup) cleanupFunctions.push(exportCleanup);
    
    // DOM 언로드 시 이벤트 리스너 정리
    window.addEventListener('beforeunload', cleanup);
});

/**
 * 모든 이벤트 리스너 정리
 */
function cleanup() {
    console.log('인벤토리 목록 페이지 이벤트 리스너 정리 중...');
    cleanupFunctions.forEach(fn => {
        if (typeof fn === 'function') fn();
    });
} 