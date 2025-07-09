/**
 * 자산 목록 뷰 모듈
 * 자산 목록 페이지의 뷰 모드 관리 및 내보내기 기능을 담당합니다.
 */

import UIUtils from '../../../common/ui-utils.js';
import TableUtils from '../../../common/table-utils.js';

/**
 * 뷰 모드 변경 기능 초기화
 */
function initViewModeToggle() {
    const viewButtons = document.querySelectorAll('.view-btn');
    
    viewButtons.forEach(btn => {
        UIUtils.setupActionButton(btn, function() {
            const view = this.dataset.view;
            document.getElementById('viewMode').value = view;
            
            // 버튼 활성화 상태 변경
            viewButtons.forEach(button => {
                button.classList.remove('active');
            });
            this.classList.add('active');
            
            // 뷰 전환
            toggleViewMode(view);
            
            // URL 업데이트 (히스토리 상태 유지)
            updateUrlParam('view', view);
            
            // 상태 로컬 스토리지에 저장
            localStorage.setItem('assetViewMode', view);
        });
    });
    
    // 페이지 로드 시 저장된 뷰 모드 복원
    const savedViewMode = localStorage.getItem('assetViewMode');
    if (savedViewMode) {
        const viewBtn = document.querySelector(`.view-btn[data-view="${savedViewMode}"]`);
        if (viewBtn) {
            viewBtn.click();
        }
    }
}

/**
 * 현재 뷰 모드에 따라 표시할 뷰를 전환합니다.
 * @param {string} viewMode - 'grid' 또는 'table'
 */
function toggleViewMode(viewMode) {
    const tableView = document.getElementById('tableView');
    const gridView = document.getElementById('gridView');
    
    if (!tableView || !gridView) return;
    
    if (viewMode === 'grid') {
        UIUtils.toggleElementVisibility(tableView, false);
        UIUtils.toggleElementVisibility(gridView, true);
    } else {
        UIUtils.toggleElementVisibility(tableView, true);
        UIUtils.toggleElementVisibility(gridView, false);
    }
}

/**
 * URL 파라미터를 업데이트합니다.
 * @param {string} param - 업데이트할 파라미터 이름
 * @param {string} value - 파라미터 값
 */
function updateUrlParam(param, value) {
    const url = new URL(window.location);
    url.searchParams.set(param, value);
    window.history.pushState({}, '', url);
}

/**
 * 테이블 내보내기 기능 초기화
 */
function initExportButtons() {
    // 현재 날짜를 파일명에 추가하기 위한 함수
    const getFormattedDate = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    };
    
    // 내보내기 설정 상태 관리
    const exportState = {
        excludeColumns: [7], // 기본적으로 마지막 열(관리 버튼) 제외
        includeHiddenRows: false
    };
    
    // 내보내기 옵션 공통 함수
    const getExportOptions = () => ({
        beforeExport: (table) => {
            UIUtils.showAlert('자산 목록 내보내기를 시작합니다...', 'info', 2000);
        },
        excludeColumns: exportState.excludeColumns,
        includeHiddenRows: exportState.includeHiddenRows,
        fileName: `자산목록_${getFormattedDate()}`
    });
    
    // 내보내기 옵션 설정 이벤트
    UIUtils.setupActionButton('#exportIncludeAll', function(e) {
        const checkbox = e.target.closest('input[type="checkbox"]');
        if (checkbox) {
            exportState.includeHiddenRows = checkbox.checked;
        }
    });
    
    // 엑셀 내보내기 버튼
    UIUtils.setupActionButton('#exportExcel', function() {
        TableUtils.exportToExcel('#assetTable', getExportOptions());
    });
    
    // CSV 내보내기 버튼
    UIUtils.setupActionButton('#exportCSV', function() {
        TableUtils.exportToCSV('#assetTable', getExportOptions());
    });
    
    // PDF 내보내기 버튼
    UIUtils.setupActionButton('#exportPDF', function() {
        TableUtils.exportToPDF('#assetTable', {
            ...getExportOptions(),
            orientation: 'landscape',
            title: '자산 목록'
        });
    });
}

/**
 * 선택된 자산을 내보내기
 * @param {Array} assetIds - 선택된 자산 ID 배열
 */
function exportSelectedAssets(assetIds) {
    if (!assetIds || assetIds.length === 0) {
        UIUtils.showAlert('내보낼 자산을 선택해주세요.', 'warning');
        return;
    }
    
    // 현재 날짜를 파일명에 추가
    const now = new Date();
    const dateStr = now.getFullYear() + 
        String(now.getMonth() + 1).padStart(2, '0') + 
        String(now.getDate()).padStart(2, '0');
    
    // 선택된 행만 포함하는 테이블 필터링
    TableUtils.filterTable('#assetTable', '', function(row) {
        const rowId = row.dataset.assetId;
        return assetIds.includes(rowId);
    });
    
    // 필터링된 테이블로 내보내기 메뉴 표시
    UIUtils.showModal({
        title: '선택한 자산 내보내기',
        content: `
            <p>${assetIds.length}개의 자산을 내보냅니다. 형식을 선택하세요:</p>
            <div class="d-flex justify-content-center gap-2 mt-3">
                <button type="button" class="btn btn-outline-success" id="exportSelectedExcel">
                    <i class="fas fa-file-excel me-1"></i> Excel
                </button>
                <button type="button" class="btn btn-outline-primary" id="exportSelectedCSV">
                    <i class="fas fa-file-csv me-1"></i> CSV
                </button>
                <button type="button" class="btn btn-outline-danger" id="exportSelectedPDF">
                    <i class="fas fa-file-pdf me-1"></i> PDF
                </button>
            </div>
        `,
        onShown: (modal) => {
            // 각 내보내기 버튼에 이벤트 연결
            UIUtils.setupActionButton('#exportSelectedExcel', function() {
                TableUtils.exportToExcel('#assetTable', {
                    fileName: `선택된_자산_${dateStr}`,
                    excludeColumns: [7] // 관리 버튼 열 제외
                });
                modal.hide();
            });
            
            UIUtils.setupActionButton('#exportSelectedCSV', function() {
                TableUtils.exportToCSV('#assetTable', {
                    fileName: `선택된_자산_${dateStr}`,
                    excludeColumns: [7]
                });
                modal.hide();
            });
            
            UIUtils.setupActionButton('#exportSelectedPDF', function() {
                TableUtils.exportToPDF('#assetTable', {
                    fileName: `선택된_자산_${dateStr}`,
                    excludeColumns: [7],
                    orientation: 'landscape',
                    title: '선택된 자산 목록'
                });
                modal.hide();
            });
        },
        onHidden: () => {
            // 필터 초기화
            TableUtils.resetTableFilter('#assetTable');
        }
    });
}

// 공개 API
export {
    initViewModeToggle,
    toggleViewMode,
    initExportButtons,
    exportSelectedAssets
}; 