/**
 * 사용자 목록 테이블 관리 모듈
 * @module users/list/table-manager
 */
import TableUtils from '../../../../common/table-utils.js';

/**
 * 테이블 이벤트 초기화
 * @returns {Function} 이벤트 정리 함수
 */
export function initTableEvents() {
    const table = document.querySelector('.table');
    if (!table) return null;
    
    // TableUtils를 사용하여 테이블 행 클릭 이벤트 처리
    const rowClickCleanup = TableUtils.initTableRowClick({
        tableSelector: '.table',
        rowSelector: 'tbody tr.user-row',
        ignoreTags: ['button', 'a', 'input'],
        dataAttribute: 'href',
        onRowClick: (url) => {
            if (url) {
                window.location.href = url;
            }
        }
    });
    
    // TableUtils를 사용하여 테이블 정렬 초기화
    const sortCleanup = TableUtils.initializeTableSorting({
        tableSelector: '.table',
        headerSelector: 'th[data-sort]',
        sortUrlParam: 'sort',
        onSort: (sortField, direction) => {
            // URL 파라미터 업데이트 및 페이지 새로고침
            const url = new URL(window.location);
            if (sortField) {
                const sortValue = direction === 'desc' ? `-${sortField}` : sortField;
                url.searchParams.set('sort', sortValue);
            } else {
                url.searchParams.delete('sort');
            }
            window.location.href = url.toString();
        }
    });
    
    // 정리 함수 반환
    return function cleanup() {
        if (rowClickCleanup) rowClickCleanup();
        if (sortCleanup) sortCleanup();
    };
}

/**
 * 테이블 내보내기 기능 초기화
 * @returns {Function} 이벤트 정리 함수
 */
export function initExportButtons() {
    // 현재 날짜와 시간을 파일명에 추가
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
    const filename = `사용자목록_${timestamp}`;
    
    const cleanupFuncs = [];
    
    // CSV 내보내기 버튼 설정
    const csvCleanup = TableUtils.initializeExportButton({
        buttonSelector: '#exportCsv',
        tableSelector: '.table',
        format: 'csv',
        filename: filename
    });
    if (csvCleanup) cleanupFuncs.push(csvCleanup);
    
    // Excel 내보내기 버튼 설정
    const excelCleanup = TableUtils.initializeExportButton({
        buttonSelector: '#exportExcel',
        tableSelector: '.table',
        format: 'excel',
        filename: filename,
        exportOptions: {
            sheetName: '사용자 목록',
            styleOptions: {
                headerBgColor: '#3F6791',
                headerFontColor: '#FFFFFF'
            }
        }
    });
    if (excelCleanup) cleanupFuncs.push(excelCleanup);
    
    // PDF 내보내기 버튼 설정
    const pdfCleanup = TableUtils.initializeExportButton({
        buttonSelector: '#exportPdf',
        tableSelector: '.table',
        format: 'pdf',
        filename: filename,
        exportOptions: {
            orientation: 'landscape',
            title: '사용자 목록',
            fontSize: 10
        }
    });
    if (pdfCleanup) cleanupFuncs.push(pdfCleanup);
    
    // 정리 함수 반환
    return function cleanup() {
        cleanupFuncs.forEach(fn => {
            if (typeof fn === 'function') fn();
        });
    };
} 