/**
 * 사용자 목록 페이지 메인 JavaScript 모듈
 * @module users/list/index
 */
import { initTableEvents, initExportButtons } from './table-manager.js';
import { initFilters } from './filters-manager.js';
import { initStatusButtons } from './status-manager.js';

// 이벤트 리스너 정리를 위한 정리 함수 배열
const cleanupFunctions = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('사용자 목록 페이지 스크립트 로드됨');
    
    // 테이블 정렬 및 행 이벤트 초기화
    const tableCleanup = initTableEvents();
    if (tableCleanup) cleanupFunctions.push(tableCleanup);
    
    // 필터 및 검색 기능 초기화
    const filterCleanup = initFilters();
    if (filterCleanup) cleanupFunctions.push(filterCleanup);
    
    // 사용자 상태 변경 버튼 초기화
    const statusCleanup = initStatusButtons();
    if (statusCleanup) cleanupFunctions.push(statusCleanup);
    
    // 테이블 내보내기 기능 초기화
    const exportCleanup = initExportButtons();
    if (exportCleanup) cleanupFunctions.push(exportCleanup);
    
    // 페이지 언로드 시 이벤트 리스너 정리
    window.addEventListener('beforeunload', cleanup);
});

/**
 * 모든 이벤트 리스너 정리
 */
function cleanup() {
    console.log('사용자 목록 페이지 이벤트 리스너 정리 중...');
    cleanupFunctions.forEach(fn => {
        if (typeof fn === 'function') fn();
    });
} 