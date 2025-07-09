/**
 * 인벤토리 목록 테이블 관리 모듈
 * @module inventory/list/table-manager
 */
import TableUtils from '../../../../common/table-utils.js';
import UIUtils from '../../../../common/ui-utils.js';

/**
 * 데이터 테이블 초기화
 * @returns {Function} 이벤트 정리 함수
 */
export function initDataTable() {
    const table = document.querySelector('.table');
    if (!table) return null;
    
    const cleanupFuncs = [];
    
    // TableUtils를 사용하여 테이블 행 클릭 이벤트 처리
    const rowClickCleanup = TableUtils.initTableRowClick({
        tableSelector: '.table',
        rowSelector: 'tbody tr',
        clickHandler: function(e, row) {
            // 버튼 클릭은 무시 (버튼에 자체 이벤트가 있으므로)
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                return;
            }
            
            // 행에 data-href 속성이 있으면 해당 URL로 이동
            const url = row.dataset.href;
            if (url) {
                window.location.href = url;
            }
        }
    });
    if (rowClickCleanup) cleanupFuncs.push(rowClickCleanup);
    
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
    if (sortCleanup) cleanupFuncs.push(sortCleanup);
    
    // 정리 함수 반환
    return function cleanup() {
        cleanupFuncs.forEach(fn => {
            if (typeof fn === 'function') fn();
        });
    };
}

/**
 * 테이블 내보내기 기능 초기화
 * @returns {Function} 이벤트 정리 함수
 */
export function initExportButtons() {
    // 현재 날짜와 시간을 파일명에 추가
    const getFormattedDate = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    };
    
    // 내보내기 공통 설정
    const exportOptions = {
        beforeExport: (table) => {
            console.log('인벤토리 목록 내보내기 시작...');
            // 여기에 내보내기 전 처리할 작업이 있다면 추가
        },
        // 마지막 처리 열(액션 버튼) 제외
        excludeColumns: [6],
        includeHiddenRows: true
    };
    
    const cleanupFuncs = [];
    
    // CSV 내보내기 버튼 초기화
    const csvCleanup = TableUtils.initializeExportButton({
        buttonSelector: '#btnExportCsv',
        tableSelector: '.table',
        filename: `inventory_list_${getFormattedDate()}`,
        format: 'csv',
        exportOptions: exportOptions
    });
    if (csvCleanup) cleanupFuncs.push(csvCleanup);
    
    // Excel 내보내기 버튼 초기화
    const excelCleanup = TableUtils.initializeExportButton({
        buttonSelector: '#btnExportExcel',
        tableSelector: '.table',
        filename: `inventory_list_${getFormattedDate()}`,
        format: 'excel',
        exportOptions: {
            ...exportOptions,
            sheetName: '인벤토리 목록',
            styleOptions: {
                headerBgColor: '#3F6791',
                headerFontColor: '#FFFFFF',
                zebra: true,
                zebraColor: '#F2F7FA'
            }
        }
    });
    if (excelCleanup) cleanupFuncs.push(excelCleanup);
    
    // JSON 내보내기 버튼 초기화
    const jsonCleanup = TableUtils.initializeExportButton({
        buttonSelector: '#btnExportJson',
        tableSelector: '.table',
        filename: `inventory_list_${getFormattedDate()}`,
        format: 'json',
        exportOptions: {
            ...exportOptions,
            transform: (data) => {
                // 데이터 변환이 필요한 경우 여기서 처리
                return data.map(item => {
                    // 날짜 포맷 처리 등의 변환 작업
                    return {
                        ...item,
                        exportedAt: new Date().toISOString(),
                        // 숫자 데이터 변환 예시
                        id: parseInt(item.id) || 0
                    };
                });
            }
        }
    });
    if (jsonCleanup) cleanupFuncs.push(jsonCleanup);
    
    // 정리 함수 반환
    return function cleanup() {
        cleanupFuncs.forEach(fn => {
            if (typeof fn === 'function') fn();
        });
    };
}

/**
 * 인벤토리 상태 표시기 초기화
 */
export function initStatusIndicators() {
    // 상태에 따른 배지 색상 적용
    const statusBadges = document.querySelectorAll('.badge-status');
    statusBadges.forEach(badge => {
        const status = badge.dataset.status;
        if (!status) return;
        
        let badgeClass = '';
        switch (status.toLowerCase()) {
            case 'complete':
            case 'completed':
                badgeClass = 'bg-success';
                break;
            case 'in_progress':
            case 'pending':
                badgeClass = 'bg-warning text-dark';
                break;
            case 'planned':
                badgeClass = 'bg-info text-dark';
                break;
            case 'overdue':
            case 'discrepancy':
                badgeClass = 'bg-danger';
                break;
            default:
                badgeClass = 'bg-secondary';
        }
        
        // UIUtils를 사용하여 배지 클래스 추가
        UIUtils.addClassesToElement(badge, [badgeClass]);
    });
} 