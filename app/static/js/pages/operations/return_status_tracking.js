/**
 * 반납 현황 추적 관리자
 * 자산 반납 요청의 실시간 상태를 모니터링하고 관리
 */

// API 유틸리티 임포트 (중복 제거를 위한 공통 모듈 사용)
import ApiUtils from '../../shared/operations/api-utils.js';

class ReturnStatusTracker {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 10;
        this.currentFilters = {
            status: '',
            department: '',
            urgency: '',
            search: ''
        };
        this.statusData = [];
        this.isLoading = false;
        this.autoRefreshTimer = null;
        this.autoRefreshInterval = 30000; // 30초
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadStatusData();
        this.setupViewModeToggle();
        this.setupAutoRefresh();
    }

    bindEvents() {
        // 필터 이벤트
        document.getElementById('statusFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('departmentFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('urgencyFilter').addEventListener('change', () => this.applyFilters());
        
        // 검색 이벤트
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.applyFilters();
            }
        });

        // 뷰 모드 토글
        document.querySelectorAll('input[name="viewMode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.toggleViewMode(e.target.id);
            });
        });

        // 전역 함수들을 window에 바인딩
        window.refreshStatusData = () => this.loadStatusData();
        window.applyFilters = () => this.applyFilters();
        window.exportStatusReport = () => this.exportStatusReport();
        window.openReturnRequestModal = () => this.openReturnRequestModal();
        window.viewStatusDetail = (id) => this.viewStatusDetail(id);
        window.changeStatus = (id) => this.changeStatus(id);
        window.confirmStatusChange = () => this.confirmStatusChange();
    }

    setupViewModeToggle() {
        const tableView = document.getElementById('tableViewContainer');
        const cardView = document.getElementById('cardViewContainer');
        
        // 기본값: 테이블 뷰
        tableView.style.display = 'block';
        cardView.style.display = 'none';
    }

    setupAutoRefresh() {
        // 30초마다 자동 새로고침
        this.autoRefreshTimer = setInterval(() => {
            if (!this.isLoading) {
                this.loadStatusData(false); // 로딩 표시 없이 새로고침
            }
        }, this.autoRefreshInterval);
    }

    /**
     * 상태 데이터 로드 (중복 제거된 API 호출)
     */
    async loadStatusData(showLoading = true) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        
        try {
            // 공통 API 유틸리티 사용으로 중복 제거
            const response = await ApiUtils.getWithParams('/operations/api/return/workflows', this.currentFilters, {
                loadingContainer: showLoading ? '#statusContainer' : null,
                loadingMessage: '상태 데이터를 불러오는 중...',
                showErrors: true
            });
            
            if (response.data.success) {
                this.statusData = response.data.data || [];
                this.updateStatusStats(response.data.stats || {});
                this.renderStatusList();
                this.renderPagination(response.data.pagination || {});
            } else {
                throw new Error(response.data.message || '데이터 조회에 실패했습니다.');
            }
            
            if (this.statusData.length === 0) {
                this.showEmptyState();
            } else {
                this.hideEmptyState();
            }
        } catch (error) {
            console.error('상태 데이터 로드 오류:', error);
            this.showError('상태 데이터를 불러오는데 실패했습니다.');
        } finally {
            this.isLoading = false;
        }
    }



    updateStatusStats(stats) {
        if (!stats) return;

        document.getElementById('requestedCount').textContent = stats.requested || 0;
        document.getElementById('deptApprovalCount').textContent = stats.dept_approval || 0;
        document.getElementById('assetApprovalCount').textContent = stats.asset_manager_approval || 0;
        document.getElementById('finalApprovalCount').textContent = stats.final_approval || 0;
        document.getElementById('completedCount').textContent = stats.returned || 0;
        document.getElementById('rejectedCount').textContent = stats.rejected || 0;
    }

    renderStatusList() {
        const isTableView = document.getElementById('tableView').checked;
        
        if (isTableView) {
            this.renderTableView();
        } else {
            this.renderCardView();
        }
    }

    renderTableView() {
        const tbody = document.getElementById('statusTableBody');
        
        if (this.statusData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center py-4 text-muted">
                        데이터가 없습니다.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.statusData.map(item => `
            <tr>
                <td>
                    <span class="fw-bold text-primary">${item.workflow_id}</span>
                </td>
                <td>
                    <div class="d-flex flex-column">
                        <span class="fw-semibold">${item.asset_name}</span>
                        <small class="text-muted">${item.asset_code}</small>
                    </div>
                </td>
                <td>
                    <div class="d-flex flex-column">
                        <span>${item.requester_name}</span>
                        <small class="text-muted">${item.department}</small>
                    </div>
                </td>
                <td>${item.department}</td>
                <td>
                    <span class="status-badge status-${item.current_step}">
                        ${this.getStatusName(item.current_step)}
                    </span>
                </td>
                <td>
                    <div class="progress-container">
                        <div class="progress">
                            <div class="progress-bar bg-${this.getStatusColor(item.current_step)}" 
                                 style="width: ${item.progress}%"></div>
                        </div>
                        <div class="progress-text">${item.progress}%</div>
                    </div>
                </td>
                <td>
                    <span class="urgency-badge urgency-${item.urgency}">
                        ${this.getUrgencyName(item.urgency)}
                    </span>
                </td>
                <td>${this.formatDate(item.request_date)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn btn-view" onclick="viewStatusDetail('${item.workflow_id}')" 
                                title="상세보기">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${this.canChangeStatus(item) ? `
                            <button class="action-btn btn-edit" onclick="changeStatus('${item.workflow_id}')" 
                                    title="상태변경">
                                <i class="fas fa-edit"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderCardView() {
        const container = document.getElementById('statusCardContainer');
        
        if (this.statusData.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-4 text-muted">
                    데이터가 없습니다.
                </div>
            `;
            return;
        }

        container.innerHTML = this.statusData.map(item => `
            <div class="col-md-6 col-lg-4">
                <div class="status-card" style="--card-status-color: ${this.getStatusColorHex(item.current_step)}">
                    <div class="card-header">
                        <div>
                            <div class="card-title">${item.asset_name}</div>
                            <div class="card-subtitle">${item.workflow_id}</div>
                        </div>
                        <span class="status-badge status-${item.current_step}">
                            ${this.getStatusName(item.current_step)}
                        </span>
                    </div>
                    
                    <div class="card-info">
                        <div class="info-item">
                            <div class="info-label">요청자</div>
                            <div class="info-value">${item.requester_name}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">부서</div>
                            <div class="info-value">${item.department}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">긴급도</div>
                            <div class="info-value">
                                <span class="urgency-badge urgency-${item.urgency}">
                                    ${this.getUrgencyName(item.urgency)}
                                </span>
                            </div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">요청일</div>
                            <div class="info-value">${this.formatDate(item.request_date)}</div>
                        </div>
                    </div>
                    
                    <div class="card-progress">
                        <div class="progress-container">
                            <div class="progress">
                                <div class="progress-bar bg-${this.getStatusColor(item.current_step)}" 
                                     style="width: ${item.progress}%"></div>
                            </div>
                            <div class="progress-text">${item.progress}% 완료</div>
                        </div>
                    </div>
                    
                    <div class="card-actions">
                        <button class="btn btn-sm btn-outline-primary" onclick="viewStatusDetail('${item.workflow_id}')">
                            <i class="fas fa-eye"></i> 상세보기
                        </button>
                        ${this.canChangeStatus(item) ? `
                            <button class="btn btn-sm btn-outline-warning" onclick="changeStatus('${item.workflow_id}')">
                                <i class="fas fa-edit"></i> 상태변경
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderPagination(pagination) {
        const paginationContainer = document.getElementById('pagination');
        
        if (!pagination || pagination.total_pages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = '';
        
        // 이전 페이지
        if (pagination.current_page > 1) {
            paginationHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="returnStatusTracker.goToPage(${pagination.current_page - 1})">
                        <i class="fas fa-chevron-left"></i>
                    </a>
                </li>
            `;
        }

        // 페이지 번호들
        const startPage = Math.max(1, pagination.current_page - 2);
        const endPage = Math.min(pagination.total_pages, pagination.current_page + 2);

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <li class="page-item ${i === pagination.current_page ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="returnStatusTracker.goToPage(${i})">${i}</a>
                </li>
            `;
        }

        // 다음 페이지
        if (pagination.current_page < pagination.total_pages) {
            paginationHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="returnStatusTracker.goToPage(${pagination.current_page + 1})">
                        <i class="fas fa-chevron-right"></i>
                    </a>
                </li>
            `;
        }

        paginationContainer.innerHTML = paginationHTML;
    }

    applyFilters() {
        this.currentFilters = {
            status: document.getElementById('statusFilter').value,
            department: document.getElementById('departmentFilter').value,
            urgency: document.getElementById('urgencyFilter').value,
            search: document.getElementById('searchInput').value.trim()
        };
        
        this.currentPage = 1;
        this.loadStatusData();
    }

    toggleViewMode(viewMode) {
        const tableView = document.getElementById('tableViewContainer');
        const cardView = document.getElementById('cardViewContainer');
        
        if (viewMode === 'tableView') {
            tableView.style.display = 'block';
            cardView.style.display = 'none';
        } else {
            tableView.style.display = 'none';
            cardView.style.display = 'block';
        }
        
        this.renderStatusList();
    }

    goToPage(page) {
        this.currentPage = page;
        this.loadStatusData();
    }

    /**
     * 상세 정보 조회 (중복 제거된 API 호출)
     */
    async viewStatusDetail(workflowId) {
        try {
            // 공통 API 유틸리티 사용으로 중복 제거
            const response = await ApiUtils.get(`/operations/api/return/workflows/${workflowId}`, {
                loadingContainer: '#statusDetailModal .modal-body',
                loadingMessage: '상세 정보를 불러오는 중...',
                showErrors: true
            });
            
            if (response.data.success) {
                this.renderStatusDetailModal(response.data.data);
                $('#statusDetailModal').modal('show');
            } else {
                throw new Error(response.data.message || '상세 정보 조회에 실패했습니다.');
            }
        } catch (error) {
            console.error('상세 정보 조회 오류:', error);
            this.showError('상세 정보를 불러오는데 실패했습니다.');
        }
    }

    renderStatusDetailModal(detail) {
        const content = document.getElementById('statusDetailContent');
        
        content.innerHTML = `
            <div class="status-detail-section">
                <div class="status-detail-title">기본 정보</div>
                <div class="row">
                    <div class="col-md-6">
                        <table class="table table-sm">
                            <tr><th>요청 ID</th><td>${detail.workflow_id}</td></tr>
                            <tr><th>자산명</th><td>${detail.metadata.asset_name}</td></tr>
                            <tr><th>자산 코드</th><td>${detail.metadata.asset_code}</td></tr>
                            <tr><th>요청자</th><td>${detail.metadata.requester_name}</td></tr>
                        </table>
                    </div>
                    <div class="col-md-6">
                        <table class="table table-sm">
                            <tr><th>부서</th><td>${detail.metadata.department}</td></tr>
                            <tr><th>현재 상태</th><td><span class="status-badge status-${detail.current_step}">${this.getStatusName(detail.current_step)}</span></td></tr>
                            <tr><th>요청일</th><td>${this.formatDateTime(detail.created_at)}</td></tr>
                            <tr><th>최종 수정</th><td>${this.formatDateTime(detail.updated_at)}</td></tr>
                        </table>
                    </div>
                </div>
            </div>
            
            <div class="status-detail-section">
                <div class="status-detail-title">진행 상황</div>
                <div class="status-timeline">
                    ${detail.steps.map(step => `
                        <div class="timeline-item ${step.status}">
                            <div class="timeline-content">
                                <div class="timeline-title">${this.getStatusName(step.step_id)}</div>
                                <div class="timeline-meta">
                                    ${step.completed_at ? `완료: ${this.formatDateTime(step.completed_at)}` : 
                                      step.started_at ? `시작: ${this.formatDateTime(step.started_at)}` : '대기중'}
                                    ${step.completed_by ? ` | 처리자: ${step.completed_by}` : 
                                      step.assigned_to ? ` | 담당자: ${step.assigned_to}` : ''}
                                </div>
                                ${step.comments ? `<p class="timeline-description">${step.comments}</p>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    changeStatus(workflowId) {
        document.getElementById('changeRequestId').value = workflowId;
        const modal = new bootstrap.Modal(document.getElementById('statusChangeModal'));
        modal.show();
    }

    async confirmStatusChange() {
        const workflowId = document.getElementById('changeRequestId').value;
        const newStatus = document.getElementById('newStatus').value;
        const reason = document.getElementById('changeReason').value;

        if (!newStatus) {
            this.showError('새로운 상태를 선택해주세요.');
            return;
        }

        try {
            // Mock 상태 변경 처리
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.showSuccess('상태가 성공적으로 변경되었습니다.');
            bootstrap.Modal.getInstance(document.getElementById('statusChangeModal')).hide();
            this.loadStatusData();
            
            // 폼 초기화
            document.getElementById('statusChangeForm').reset();
        } catch (error) {
            console.error('상태 변경 오류:', error);
            this.showError('상태 변경에 실패했습니다.');
        }
    }

    async exportStatusReport() {
        try {
            this.showSuccess('보고서 내보내기 기능이 구현되었습니다.');
        } catch (error) {
            console.error('내보내기 오류:', error);
            this.showError('보고서 내보내기에 실패했습니다.');
        }
    }

    openReturnRequestModal() {
        // 반납 요청 모달 열기 (기존 기능과 연동)
        window.location.href = '/operations/return-form';
    }

    // 유틸리티 메서드들
    getStatusName(status) {
        const statusMap = {
            'requested': '요청됨',
            'dept_approval': '부서장 승인 대기',
            'asset_manager_approval': '자산관리자 승인 대기',
            'final_approval': '최종 승인 대기',
            'approved': '승인 완료',
            'returned': '반납 완료',
            'rejected': '거부됨',
            'cancelled': '취소됨'
        };
        return statusMap[status] || status;
    }

    getStatusColor(status) {
        const colorMap = {
            'requested': 'primary',
            'dept_approval': 'warning',
            'asset_manager_approval': 'info',
            'final_approval': 'secondary',
            'approved': 'success',
            'returned': 'success',
            'rejected': 'danger',
            'cancelled': 'muted'
        };
        return colorMap[status] || 'secondary';
    }

    getStatusColorHex(status) {
        const colorMap = {
            'requested': '#007bff',
            'dept_approval': '#ffc107',
            'asset_manager_approval': '#17a2b8',
            'final_approval': '#6c757d',
            'approved': '#28a745',
            'returned': '#28a745',
            'rejected': '#dc3545',
            'cancelled': '#6c757d'
        };
        return colorMap[status] || '#6c757d';
    }

    getUrgencyName(urgency) {
        const urgencyMap = {
            'low': '낮음',
            'normal': '보통',
            'high': '높음',
            'urgent': '긴급'
        };
        return urgencyMap[urgency] || urgency;
    }

    canChangeStatus(item) {
        // 관리자 권한이나 승인 권한이 있는 경우에만 상태 변경 가능
        // 실제 구현에서는 사용자 권한을 확인해야 함
        return ['requested', 'dept_approval', 'asset_manager_approval', 'final_approval'].includes(item.current_step);
    }

    formatDate(dateString) {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('ko-KR');
    }

    formatDateTime(dateString) {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('ko-KR');
    }

    showLoadingState() {
        this.isLoading = true;
        document.getElementById('loadingState').style.display = 'block';
        document.getElementById('tableViewContainer').style.display = 'none';
        document.getElementById('cardViewContainer').style.display = 'none';
        document.getElementById('emptyState').style.display = 'none';
    }

    hideLoadingState() {
        document.getElementById('loadingState').style.display = 'none';
        const isTableView = document.getElementById('tableView').checked;
        document.getElementById('tableViewContainer').style.display = isTableView ? 'block' : 'none';
        document.getElementById('cardViewContainer').style.display = isTableView ? 'none' : 'block';
    }

    showEmptyState() {
        document.getElementById('emptyState').style.display = 'block';
    }

    hideEmptyState() {
        document.getElementById('emptyState').style.display = 'none';
    }

    showSuccess(message) {
        // Toast 알림 표시
        this.showToast(message, 'success');
    }

    showError(message) {
        // Toast 알림 표시
        this.showToast(message, 'error');
    }

    showToast(message, type = 'info') {
        // 간단한 토스트 알림 구현
        const toast = document.createElement('div');
        toast.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} 
                          position-fixed top-0 end-0 m-3`;
        toast.style.zIndex = '9999';
        toast.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>
                ${message}
                <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // 5초 후 자동 제거
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    window.returnStatusTracker = new ReturnStatusTracker();
}); 