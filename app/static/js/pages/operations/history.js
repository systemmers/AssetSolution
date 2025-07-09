/**
 * Operations History Page JavaScript
 * 자산 운영 이력 페이지의 동적 기능을 담당합니다.
 */

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeHistoryPage();
});

/**
 * 페이지 초기화
 */
function initializeHistoryPage() {
    // 검색 폼 이벤트 리스너
    const searchForm = document.getElementById('historySearchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearchSubmit);
    }

    // 날짜 필드 기본값 설정 (최근 30일)
    setDefaultDateRange();

    // 테이블 행 클릭 이벤트
    initializeTableRowEvents();

    // 실시간 검색 (디바운싱)
    initializeRealTimeSearch();
}

/**
 * 검색 폼 제출 처리
 */
function handleSearchSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const params = new URLSearchParams();
    
    // 빈 값이 아닌 필드만 추가
    for (let [key, value] of formData.entries()) {
        if (value.trim() !== '') {
            params.append(key, value);
        }
    }
    
    // URL 업데이트 및 페이지 리로드
    const newUrl = window.location.pathname + '?' + params.toString();
    window.location.href = newUrl;
}

/**
 * 기본 날짜 범위 설정 (최근 30일)
 */
function setDefaultDateRange() {
    const startDateInput = document.getElementById('start_date');
    const endDateInput = document.getElementById('end_date');
    
    if (startDateInput && !startDateInput.value) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        startDateInput.value = thirtyDaysAgo.toISOString().split('T')[0];
    }
    
    if (endDateInput && !endDateInput.value) {
        const today = new Date();
        endDateInput.value = today.toISOString().split('T')[0];
    }
}

/**
 * 테이블 정렬
 */
function sortTable(sortBy) {
    const table = document.getElementById('historyTable');
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    rows.sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
            case 'date_desc':
                aValue = new Date(a.cells[0].textContent);
                bValue = new Date(b.cells[0].textContent);
                return bValue - aValue;
            case 'date_asc':
                aValue = new Date(a.cells[0].textContent);
                bValue = new Date(b.cells[0].textContent);
                return aValue - bValue;
            case 'asset_id':
                aValue = a.cells[1].querySelector('strong').textContent;
                bValue = b.cells[1].querySelector('strong').textContent;
                return aValue.localeCompare(bValue);
            case 'user_name':
                aValue = a.cells[3].querySelector('div').textContent;
                bValue = b.cells[3].querySelector('div').textContent;
                return aValue.localeCompare(bValue);
            default:
                return 0;
        }
    });
    
    // 정렬된 행들을 다시 추가
    rows.forEach(row => tbody.appendChild(row));
    
    // 정렬 표시 업데이트
    updateSortIndicator(sortBy);
}

/**
 * 정렬 표시 업데이트
 */
function updateSortIndicator(sortBy) {
    const sortButton = document.getElementById('sortDropdown');
    const sortTexts = {
        'date_desc': '최신순',
        'date_asc': '과거순',
        'asset_id': '자산 ID',
        'user_name': '사용자명'
    };
    
    if (sortButton && sortTexts[sortBy]) {
        sortButton.innerHTML = `<i class="fas fa-sort me-1"></i>${sortTexts[sortBy]}`;
    }
}

/**
 * Excel 내보내기
 */
function exportToExcel() {
    // 현재 검색 조건 수집
    const searchParams = new URLSearchParams(window.location.search);
    
    // 로딩 표시
    const exportBtn = document.querySelector('[onclick="exportToExcel()"]');
    const originalText = exportBtn.innerHTML;
    exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>내보내는 중...';
    exportBtn.disabled = true;
    
    // Excel 내보내기 요청
    fetch('/operations/history/export?' + searchParams.toString(), {
        method: 'GET',
        headers: {
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('내보내기 실패');
        }
        return response.blob();
    })
    .then(blob => {
        // 파일 다운로드
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `자산이력_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showToast('Excel 파일이 다운로드되었습니다.', 'success');
    })
    .catch(error => {
        console.error('Excel 내보내기 오류:', error);
        showToast('Excel 내보내기 중 오류가 발생했습니다.', 'error');
    })
    .finally(() => {
        // 버튼 상태 복원
        exportBtn.innerHTML = originalText;
        exportBtn.disabled = false;
    });
}

/**
 * 이력 상세 정보 표시
 */
function showHistoryDetail(historyId) {
    const modal = new bootstrap.Modal(document.getElementById('historyDetailModal'));
    const modalContent = document.getElementById('historyDetailContent');
    
    // 로딩 표시
    modalContent.innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">로딩 중...</span>
            </div>
            <p class="mt-2">이력 정보를 불러오는 중...</p>
        </div>
    `;
    
    modal.show();
    
    // 상세 정보 요청
    fetch(`/operations/history/${historyId}/detail`)
        .then(response => {
            if (!response.ok) {
                throw new Error('상세 정보 조회 실패');
            }
            return response.json();
        })
        .then(data => {
            modalContent.innerHTML = generateHistoryDetailHTML(data);
        })
        .catch(error => {
            console.error('상세 정보 조회 오류:', error);
            modalContent.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    상세 정보를 불러올 수 없습니다.
                </div>
            `;
        });
}

/**
 * 이력 상세 정보 HTML 생성
 */
function generateHistoryDetailHTML(data) {
    const statusBadgeClass = {
        '완료': 'bg-success',
        '진행중': 'bg-warning',
        '승인대기': 'bg-secondary',
        '취소': 'bg-danger',
        '지연': 'bg-danger'
    };
    
    const operationBadgeClass = {
        '대여': 'bg-primary',
        '반납': 'bg-success',
        '폐기': 'bg-danger',
        '수리': 'bg-warning',
        '이관': 'bg-info'
    };
    
    return `
        <div class="row">
            <div class="col-md-6">
                <h6 class="text-primary mb-3">기본 정보</h6>
                <table class="table table-sm">
                    <tr>
                        <th width="30%">이력 ID</th>
                        <td>${data.id}</td>
                    </tr>
                    <tr>
                        <th>작업일시</th>
                        <td>${data.operation_date}</td>
                    </tr>
                    <tr>
                        <th>작업 유형</th>
                        <td>
                            <span class="badge ${operationBadgeClass[data.operation_type] || 'bg-secondary'}">
                                ${data.operation_type}
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <th>상태</th>
                        <td>
                            <span class="badge ${statusBadgeClass[data.status] || 'bg-secondary'}">
                                ${data.status}
                            </span>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="col-md-6">
                <h6 class="text-primary mb-3">자산 정보</h6>
                <table class="table table-sm">
                    <tr>
                        <th width="30%">자산 ID</th>
                        <td>${data.asset_id}</td>
                    </tr>
                    <tr>
                        <th>자산명</th>
                        <td>${data.asset_name}</td>
                    </tr>
                    <tr>
                        <th>카테고리</th>
                        <td>${data.asset_category || '-'}</td>
                    </tr>
                    <tr>
                        <th>시리얼 번호</th>
                        <td>${data.serial_number || '-'}</td>
                    </tr>
                </table>
            </div>
        </div>
        
        <div class="row mt-3">
            <div class="col-md-6">
                <h6 class="text-primary mb-3">사용자 정보</h6>
                <table class="table table-sm">
                    <tr>
                        <th width="30%">사용자명</th>
                        <td>${data.user_name}</td>
                    </tr>
                    <tr>
                        <th>부서</th>
                        <td>${data.user_department}</td>
                    </tr>
                    <tr>
                        <th>연락처</th>
                        <td>${data.user_contact || '-'}</td>
                    </tr>
                    <tr>
                        <th>이메일</th>
                        <td>${data.user_email || '-'}</td>
                    </tr>
                </table>
            </div>
            <div class="col-md-6">
                <h6 class="text-primary mb-3">처리 정보</h6>
                <table class="table table-sm">
                    <tr>
                        <th width="30%">담당자</th>
                        <td>${data.handler || '-'}</td>
                    </tr>
                    <tr>
                        <th>처리 부서</th>
                        <td>${data.department}</td>
                    </tr>
                    <tr>
                        <th>예상 완료일</th>
                        <td>${data.expected_date || '-'}</td>
                    </tr>
                    <tr>
                        <th>실제 완료일</th>
                        <td>${data.completed_date || '-'}</td>
                    </tr>
                </table>
            </div>
        </div>
        
        ${data.notes ? `
        <div class="row mt-3">
            <div class="col-12">
                <h6 class="text-primary mb-3">비고</h6>
                <div class="alert alert-light">
                    ${data.notes}
                </div>
            </div>
        </div>
        ` : ''}
        
        ${data.attachments && data.attachments.length > 0 ? `
        <div class="row mt-3">
            <div class="col-12">
                <h6 class="text-primary mb-3">첨부파일</h6>
                <div class="list-group">
                    ${data.attachments.map(file => `
                        <a href="${file.url}" class="list-group-item list-group-item-action" target="_blank">
                            <i class="fas fa-file me-2"></i>${file.name}
                            <small class="text-muted ms-2">(${file.size})</small>
                        </a>
                    `).join('')}
                </div>
            </div>
        </div>
        ` : ''}
    `;
}

/**
 * 이력 인쇄
 */
function printHistory() {
    const modalContent = document.getElementById('historyDetailContent');
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>자산 이력 상세 정보</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                @media print {
                    .no-print { display: none !important; }
                    body { font-size: 12px; }
                    .table th, .table td { padding: 0.25rem !important; }
                }
            </style>
        </head>
        <body>
            <div class="container mt-3">
                <h4 class="text-center mb-4">자산 이력 상세 정보</h4>
                ${modalContent.innerHTML}
                <div class="text-center mt-4 no-print">
                    <button onclick="window.print()" class="btn btn-primary">인쇄</button>
                    <button onclick="window.close()" class="btn btn-secondary ms-2">닫기</button>
                </div>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
}

/**
 * 테이블 행 클릭 이벤트 초기화
 */
function initializeTableRowEvents() {
    const tableBody = document.getElementById('historyTableBody');
    if (!tableBody) return;
    
    tableBody.addEventListener('click', function(event) {
        const row = event.target.closest('tr');
        if (row && !event.target.closest('button')) {
            // 행 선택 효과
            document.querySelectorAll('#historyTableBody tr').forEach(r => {
                r.classList.remove('table-active');
            });
            row.classList.add('table-active');
        }
    });
}

/**
 * 실시간 검색 초기화 (디바운싱)
 */
function initializeRealTimeSearch() {
    const searchInputs = ['asset_id', 'user_name'];
    let searchTimeout;
    
    searchInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', function() {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    filterTableRows(this.value, inputId);
                }, 300);
            });
        }
    });
}

/**
 * 테이블 행 필터링 (클라이언트 사이드)
 */
function filterTableRows(searchValue, fieldType) {
    const tableBody = document.getElementById('historyTableBody');
    const rows = tableBody.querySelectorAll('tr');
    
    if (!searchValue.trim()) {
        rows.forEach(row => row.style.display = '');
        return;
    }
    
    rows.forEach(row => {
        let cellValue = '';
        
        switch (fieldType) {
            case 'asset_id':
                const assetCell = row.cells[1];
                cellValue = assetCell.querySelector('strong').textContent + ' ' + 
                           assetCell.querySelector('small').textContent;
                break;
            case 'user_name':
                const userCell = row.cells[3];
                cellValue = userCell.querySelector('div').textContent + ' ' + 
                           userCell.querySelector('small').textContent;
                break;
        }
        
        const isVisible = cellValue.toLowerCase().includes(searchValue.toLowerCase());
        row.style.display = isVisible ? '' : 'none';
    });
}

/**
 * 토스트 메시지 표시
 */
function showToast(message, type = 'info') {
    // 기존 토스트가 있다면 제거
    const existingToast = document.querySelector('.toast-container .toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // 토스트 컨테이너 생성 (없는 경우)
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    // 토스트 생성
    const toastId = 'toast-' + Date.now();
    const toastHTML = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <i class="fas fa-${type === 'success' ? 'check-circle text-success' : 
                                   type === 'error' ? 'exclamation-circle text-danger' : 
                                   'info-circle text-info'} me-2"></i>
                <strong class="me-auto">알림</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    toastContainer.innerHTML = toastHTML;
    
    // 토스트 표시
    const toast = new bootstrap.Toast(document.getElementById(toastId));
    toast.show();
}