/**
 * 자산실사 보고서 페이지 메인 JavaScript 모듈
 * @module inventory/report/index
 */
import { initPrintButton, initExportButton } from './export-manager.js';
import { initCharts } from './chart-manager.js';

// 이벤트 리스너 정리를 위한 정리 함수 배열
const cleanupFunctions = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('자산실사 보고서 페이지 스크립트 로드됨');
    
    // 인쇄 버튼 초기화
    const printButtonCleanup = initPrintButton();
    if (printButtonCleanup) cleanupFunctions.push(printButtonCleanup);
    
    // 내보내기 버튼 초기화
    const exportButtonCleanup = initExportButton();
    if (exportButtonCleanup) cleanupFunctions.push(exportButtonCleanup);
    
    // 차트 초기화 (Chart.js 로드된 경우)
    if (typeof Chart !== 'undefined') {
        const chartsCleanup = initCharts();
        if (chartsCleanup) cleanupFunctions.push(chartsCleanup);
    } else {
        console.warn('Chart.js가 로드되지 않았습니다. 차트 초기화를 건너뜁니다.');
    }
    
    // DOM 언로드 시 이벤트 리스너 정리
    window.addEventListener('beforeunload', cleanupEventListeners);
    cleanupFunctions.push(() => window.removeEventListener('beforeunload', cleanupEventListeners));
});

/**
 * 이벤트 리스너 정리 함수
 */
function cleanupEventListeners() {
    console.log('자산실사 보고서 페이지 이벤트 리스너 정리');
    cleanupFunctions.forEach(cleanup => {
        if (typeof cleanup === 'function') {
            cleanup();
        }
    });
} 