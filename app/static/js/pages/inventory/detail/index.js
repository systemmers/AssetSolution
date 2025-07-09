/**
 * 인벤토리 상세 페이지 메인 JavaScript 모듈
 * @module inventory/detail/index
 */
import { initStatusChangeHandlers } from './status-manager.js';
import { initScanningFeature, initAssetVerification } from './scanning-manager.js';
import { initTableFilters } from './table-manager.js';

// 이벤트 리스너 정리를 위한 정리 함수 배열
const cleanupFunctions = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('인벤토리 상세 페이지 스크립트 로드됨');
    
    // 상태 변경 이벤트 초기화
    const statusCleanup = initStatusChangeHandlers();
    if (statusCleanup) cleanupFunctions.push(statusCleanup);
    
    // 스캐닝 기능 초기화
    const scanningCleanup = initScanningFeature();
    if (scanningCleanup) cleanupFunctions.push(scanningCleanup);
    
    // 테이블 필터링 기능 초기화
    const tableFilterCleanup = initTableFilters();
    if (tableFilterCleanup) cleanupFunctions.push(tableFilterCleanup);
    
    // 자산 확인 기능 초기화
    const verificationCleanup = initAssetVerification();
    if (verificationCleanup) cleanupFunctions.push(verificationCleanup);
    
    // DOM 언로드 시 이벤트 리스너 정리
    window.addEventListener('beforeunload', cleanup);
});

/**
 * 모든 이벤트 리스너 정리
 */
function cleanup() {
    console.log('인벤토리 상세 페이지 이벤트 리스너 정리 중...');
    cleanupFunctions.forEach(fn => {
        if (typeof fn === 'function') fn();
    });
} 