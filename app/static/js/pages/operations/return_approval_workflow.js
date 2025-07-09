/**
 * Return Approval Workflow Management
 * 반납 승인 워크플로우 관리 시스템
 */

class ReturnApprovalWorkflow {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.totalItems = 0;
        this.workflows = [];
        this.filteredWorkflows = [];
        this.selectedWorkflows = new Set();
        this.currentWorkflow = null;
        this.currentTab = 'pending'; // 현재 활성 탭
        
        this.init();
    }

    async init() {
        try {
            console.log('ReturnApprovalWorkflow 초기화 중...');
            
            // 워크플로우 데이터 로드
            await this.loadWorkflowsFromAPI();
            
            this.setupEventListeners();
            this.loadWorkflows();
            this.updateStatistics();
            this.startAutoRefresh();
            
            console.log('ReturnApprovalWorkflow 초기화 완료');
        } catch (error) {
            console.error('ReturnApprovalWorkflow 초기화 실패:', error);
            this.showToast('워크플로우 데이터 로드에 실패했습니다.', 'error');
        }
    }

    /**
     * API에서 워크플로우 데이터 로드
     */
    async loadWorkflowsFromAPI() {
        try {
            console.log('워크플로우 데이터 로드 중...');
            
            const response = await ApiUtils.post('/operations/api/operations/return/workflows', {
                include_timeline: true,
                include_comments: true
            });
            
            if (response.success) {
                // 데이터 변환 처리 (날짜 문자열을 Date 객체로 변환)
                this.workflows = (response.data.workflows || []).map(workflow => ({
                    ...workflow,
                    requestDate: new Date(workflow.requestDate)
                }));
                this.filteredWorkflows = [...this.workflows];
                this.totalItems = this.workflows.length;
                
                console.log(`${this.workflows.length}개의 워크플로우 로드 완료`);
            } else {
                throw new Error(response.message || '워크플로우 데이터 로드 실패');
            }
            
        } catch (error) {
            console.error('워크플로우 API 호출 실패:', error);
            
            // 임시 fallback: 빈 배열로 초기화
            this.workflows = [];
            this.filteredWorkflows = [];
            this.totalItems = 0;
            
            throw error;
        }
    }

    /**
     * 워크플로우 승인 처리
     */
    async approveWorkflowAPI(workflowId, comment = '') {
        try {
            const response = await ApiUtils.post('/operations/api/operations/return/workflows/approve', {
                workflow_id: workflowId,
                comment: comment
            });
            
            if (response.success) {
                // 로컬 데이터 업데이트
                await this.loadWorkflowsFromAPI();
                this.loadWorkflows();
                this.updateStatistics();
                
                this.showToast('워크플로우가 승인되었습니다.', 'success');
                return true;
            } else {
                throw new Error(response.message || '승인 처리 실패');
            }
            
        } catch (error) {
            console.error('워크플로우 승인 실패:', error);
            this.showToast('승인 처리에 실패했습니다.', 'error');
            return false;
        }
    }

    /**
     * 워크플로우 거부 처리
     */
    async rejectWorkflowAPI(workflowId, reason = '') {
        try {
            const response = await ApiUtils.post('/operations/api/operations/return/workflows/reject', {
                workflow_id: workflowId,
                reason: reason
            });
            
            if (response.success) {
                // 로컬 데이터 업데이트
                await this.loadWorkflowsFromAPI();
                this.loadWorkflows();
                this.updateStatistics();
                
                this.showToast('워크플로우가 거부되었습니다.', 'info');
                return true;
            } else {
                throw new Error(response.message || '거부 처리 실패');
            }
            
        } catch (error) {
            console.error('워크플로우 거부 실패:', error);
            this.showToast('거부 처리에 실패했습니다.', 'error');
            return false;
        }
    }

    /**
     * 대량 승인 처리
     */
    async bulkApproveAPI(workflowIds, comment = '') {
        try {
            const response = await ApiUtils.post('/operations/api/operations/return/workflows/bulk-approve', {
                workflow_ids: Array.from(workflowIds),
                comment: comment
            });
            
            if (response.success) {
                // 로컬 데이터 업데이트
                await this.loadWorkflowsFromAPI();
                this.selectedWorkflows.clear();
                this.loadWorkflows();
                this.updateStatistics();
                this.updateBulkActionButtons();
                
                this.showToast(`${workflowIds.length}개의 워크플로우가 승인되었습니다.`, 'success');
                return true;
            } else {
                throw new Error(response.message || '대량 승인 처리 실패');
            }
            
        } catch (error) {
            console.error('대량 승인 실패:', error);
            this.showToast('대량 승인 처리에 실패했습니다.', 'error');
            return false;
        }
    }

    /**
     * 워크플로우 새로고침
     */
    async refreshWorkflows() {
        try {
            await this.loadWorkflowsFromAPI();
            this.applyFilters(); // 현재 필터 재적용
            this.updateStatistics();
            
            console.log('워크플로우 새로고침 완료');
        } catch (error) {
            console.error('워크플로우 새로고침 실패:', error);
        }
    }

    getCurrentApprover(status) {
        const approvers = {
            'requested': '시스템 자동 검토',
            'dept_approval': '김부장 (부서장)',
            'asset_manager_approval': '이과장 (자산관리자)',
            'final_approval': '박차장 (최종승인자)',
            'approved': '승인 완료',
            'rejected': '거부됨'
        };
        return approvers[status] || '미정';
    }

    getProgressPercentage(status) {
        const progress = {
            'requested': 20,
            'dept_approval': 40,
            'asset_manager_approval': 60,
            'final_approval': 80,
            'approved': 100,
            'rejected': 0
        };
        return progress[status] || 0;
    }

    getStatusTitle(status) {
        const titles = {
            'requested': '반납 요청',
            'dept_approval': '부서장 승인',
            'asset_manager_approval': '자산관리자 승인',
            'final_approval': '최종 승인',
            'approved': '승인 완료',
            'rejected': '거부됨'
        };
        return titles[status] || status;
    }

    setupEventListeners() {
        // 탭 이벤트
        document.querySelectorAll('#workflowTabs button[data-bs-toggle="tab"]').forEach(tab => {
            tab.addEventListener('shown.bs.tab', (e) => {
                this.currentTab = e.target.getAttribute('data-bs-target').replace('#', '');
                this.selectedWorkflows.clear();
                this.loadWorkflows();
                this.updateBulkActionButtons();
            });
        });
        
        // 필터 이벤트
        document.getElementById('statusFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('departmentFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('urgencyFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('searchInput').addEventListener('input', () => this.applyFilters());
        
        // 전체 선택 체크박스 (탭별로 분리)
        document.getElementById('selectAllPending').addEventListener('change', (e) => {
            this.toggleSelectAll(e.target.checked);
        });
        
        // 모달 이벤트
        const workflowDetailModal = document.getElementById('workflowDetailModal');
        workflowDetailModal.addEventListener('show.bs.modal', () => {
            if (this.currentWorkflow) {
                this.loadWorkflowDetail(this.currentWorkflow);
            }
        });
    }

    applyFilters() {
        const statusFilter = document.getElementById('statusFilter').value;
        const departmentFilter = document.getElementById('departmentFilter').value;
        const urgencyFilter = document.getElementById('urgencyFilter').value;
        const searchInput = document.getElementById('searchInput').value.toLowerCase();
        
        this.filteredWorkflows = this.workflows.filter(workflow => {
            const matchStatus = !statusFilter || workflow.status === statusFilter;
            const matchDepartment = !departmentFilter || workflow.department === departmentFilter;
            const matchUrgency = !urgencyFilter || workflow.urgency === urgencyFilter;
            const matchSearch = !searchInput || 
                workflow.assetName.toLowerCase().includes(searchInput) ||
                workflow.requester.toLowerCase().includes(searchInput) ||
                workflow.assetCode.toLowerCase().includes(searchInput);
            
            return matchStatus && matchDepartment && matchUrgency && matchSearch;
        });
        
        this.totalItems = this.filteredWorkflows.length;
        this.currentPage = 1;
        this.loadWorkflows();
        this.updatePagination();
    }

    loadWorkflows() {
        // 현재 탭에 따라 워크플로우 필터링
        let tabFilteredWorkflows = this.getWorkflowsByTab(this.currentTab);
        
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageWorkflows = tabFilteredWorkflows.slice(startIndex, endIndex);
        
        // 탭별 컨테이너 ID 결정
        const containerId = this.getContainerIdByTab(this.currentTab);
        const workflowsList = document.getElementById(containerId);
        
        if (!workflowsList) {
            console.error(`Container not found: ${containerId}`);
            return;
        }
        
        if (pageWorkflows.length === 0) {
            workflowsList.innerHTML = this.getEmptyStateHTML();
            return;
        }
        
        workflowsList.innerHTML = pageWorkflows.map(workflow => this.getWorkflowItemHTML(workflow)).join('');
        
        // 체크박스 이벤트 리스너 추가
        pageWorkflows.forEach(workflow => {
            const checkbox = document.getElementById(`workflow-${workflow.id}`);
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    this.toggleWorkflowSelection(workflow.id, e.target.checked);
                });
            }
        });
        
        this.updatePagination();
        this.updateTabBadges();
    }
    
    getWorkflowsByTab(tab) {
        const statusMap = {
            'pending': ['requested', 'dept_approval', 'asset_manager_approval', 'final_approval'],
            'approved': ['approved'],
            'scheduled': ['dept_approval', 'asset_manager_approval', 'final_approval'], // 진행중인 승인 단계
            'completed': ['approved'] // 완료된 항목
        };
        
        const allowedStatuses = statusMap[tab] || [];
        return this.filteredWorkflows.filter(w => allowedStatuses.includes(w.status));
    }
    
    getContainerIdByTab(tab) {
        const containerMap = {
            'pending': 'pendingWorkflowsList',
            'approved': 'approvedWorkflowsList',
            'scheduled': 'scheduledWorkflowsList',
            'completed': 'completedWorkflowsList'
        };
        return containerMap[tab] || 'pendingWorkflowsList';
    }
    
    updateTabBadges() {
        const stats = {
            pending: this.workflows.filter(w => w.status === 'requested').length,
            approved: this.workflows.filter(w => w.status === 'approved').length,
            scheduled: this.workflows.filter(w => ['dept_approval', 'asset_manager_approval', 'final_approval'].includes(w.status)).length,
            completed: this.workflows.filter(w => w.status === 'approved').length
        };
        
        // 탭 배지 업데이트
        const pendingBadge = document.getElementById('pendingBadge');
        const approvedBadge = document.getElementById('approvedBadge');
        const scheduledBadge = document.getElementById('scheduledBadge');
        const completedBadge = document.getElementById('completedBadge');
        
        if (pendingBadge) pendingBadge.textContent = stats.pending;
        if (approvedBadge) approvedBadge.textContent = stats.approved;
        if (scheduledBadge) scheduledBadge.textContent = stats.scheduled;
        if (completedBadge) completedBadge.textContent = stats.completed;
    }

    getWorkflowItemHTML(workflow) {
        const isSelected = this.selectedWorkflows.has(workflow.id);
        const urgencyIcon = this.getUrgencyIcon(workflow.urgency);
        const statusBadge = this.getStatusBadge(workflow.status);
        
        return `
            <div class="list-item" data-workflow-id="${workflow.id}">
                <div class="item-header">
                    <div class="d-flex align-items-center gap-3">
                        <input type="checkbox" class="item-checkbox" id="workflow-${workflow.id}" ${isSelected ? 'checked' : ''}>
                        <div class="item-info">
                            <div class="item-title">
                                <span>${workflow.assetName}</span>
                                <small class="text-muted">(${workflow.assetCode})</small>
                            </div>
                            <div class="item-meta">
                                <div class="meta-item">
                                    <i class="fas fa-user"></i>
                                    <span>${workflow.requester}</span>
                                </div>
                                <div class="meta-item">
                                    <i class="fas fa-building"></i>
                                    <span>${workflow.department}</span>
                                </div>
                                <div class="meta-item">
                                    <i class="fas fa-calendar"></i>
                                    <span>${this.formatDate(workflow.requestDate)}</span>
                                </div>
                                <div class="meta-item">
                                    <i class="fas fa-user-tie"></i>
                                    <span>${workflow.currentApprover}</span>
                                </div>
                            </div>
                            <div class="d-flex align-items-center gap-2 mb-2">
                                ${statusBadge}
                                <span class="priority-badge ${workflow.urgency}">
                                    ${urgencyIcon} ${this.getUrgencyText(workflow.urgency)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="item-actions">
                        <button class="btn btn-sm btn-outline-primary" onclick="workflowManager.viewWorkflowDetail(${workflow.id})">
                            <i class="fas fa-eye"></i> 상세보기
                        </button>
                        ${this.getActionButtons(workflow)}
                    </div>
                </div>
                
                <div class="item-steps-progress">
                    <div class="steps-progress-container">
                        <div class="steps-progress-track">
                            <div class="steps-progress-line" style="width: ${workflow.progress}%"></div>
                            ${this.getProgressStepsHTML(workflow)}
                        </div>
                    </div>
                    <div class="step-labels">
                        <span>요청</span>
                        <span>부서장</span>
                        <span>자산관리자</span>
                        <span>최종승인</span>
                        <span>완료</span>
                    </div>
                </div>
            </div>
        `;
    }

    getActionButtons(workflow) {
        if (workflow.status === 'approved' || workflow.status === 'rejected') {
            return `
                <span class="btn btn-sm btn-outline-secondary disabled">
                    <i class="fas fa-check-circle"></i> 처리완료
                </span>
            `;
        }
        
        return `
            <button class="btn btn-sm btn-success" onclick="workflowManager.approveWorkflow(${workflow.id})" title="워크플로우 승인">
                <i class="fas fa-check"></i> 승인
            </button>
            <button class="btn btn-sm btn-danger" onclick="workflowManager.rejectWorkflow(${workflow.id})" title="워크플로우 거부">
                <i class="fas fa-times"></i> 거부
            </button>
        `;
    }

    getProgressStepsHTML(workflow) {
        const steps = ['requested', 'dept_approval', 'asset_manager_approval', 'final_approval', 'approved'];
        const currentIndex = steps.indexOf(workflow.status);
        
        return steps.map((step, index) => {
            let stepClass = 'progress-step';
            let stepIcon = index + 1;
            
            if (workflow.status === 'rejected') {
                if (index <= currentIndex) {
                    stepClass += index === currentIndex ? ' rejected' : ' completed';
                    stepIcon = index === currentIndex ? '✕' : (index + 1);
                }
            } else if (workflow.status === 'approved') {
                stepClass += ' completed';
                stepIcon = index === steps.length - 1 ? '✓' : (index + 1);
            } else if (index < currentIndex) {
                stepClass += ' completed';
                stepIcon = '✓';
            } else if (index === currentIndex) {
                stepClass += ' current';
            }
            
            return `<div class="${stepClass}">${stepIcon}</div>`;
        }).join('');
    }

    getStatusBadge(status) {
        const statusText = {
            'requested': '요청됨',
            'dept_approval': '부서장 승인 대기',
            'asset_manager_approval': '자산관리자 승인 대기',
            'final_approval': '최종 승인 대기',
            'approved': '승인 완료',
            'rejected': '거부됨'
        };
        
        // 표준 상태 매핑
        const statusClass = {
            'requested': 'pending',
            'dept_approval': 'pending',
            'asset_manager_approval': 'pending',
            'final_approval': 'pending',
            'approved': 'approved',
            'rejected': 'rejected'
        };
        
        return `<span class="status-badge ${statusClass[status]}">${statusText[status]}</span>`;
    }

    getUrgencyIcon(urgency) {
        const icons = {
            'low': '<i class="fas fa-chevron-down"></i>',
            'normal': '<i class="fas fa-minus"></i>',
            'high': '<i class="fas fa-chevron-up"></i>',
            'urgent': '<i class="fas fa-exclamation"></i>'
        };
        return icons[urgency] || '';
    }

    getUrgencyText(urgency) {
        const texts = {
            'low': '낮음',
            'normal': '보통',
            'high': '높음',
            'urgent': '긴급'
        };
        return texts[urgency] || urgency;
    }

    getEmptyStateHTML() {
        return `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-inbox"></i>
                </div>
                <div class="empty-title">승인 대기 항목이 없습니다</div>
                <div class="empty-description">
                    필터 조건을 변경하거나 새로운 반납 요청을 기다려주세요.
                </div>
            </div>
        `;
    }

    updateStatistics() {
        const stats = {
            pending: this.workflows.filter(w => ['requested', 'dept_approval', 'asset_manager_approval', 'final_approval'].includes(w.status)).length,
            approved: this.workflows.filter(w => w.status === 'approved' && this.isToday(w.requestDate)).length,
            rejected: this.workflows.filter(w => w.status === 'rejected').length,
            overdue: this.workflows.filter(w => this.isOverdue(w)).length
        };
        
        // 통계 카드 업데이트
        document.getElementById('pendingApprovals').textContent = stats.pending;
        document.getElementById('approvedToday').textContent = stats.approved;
        document.getElementById('rejectedItems').textContent = stats.rejected;
        document.getElementById('overdueItems').textContent = stats.overdue;
        
        // 탭 배지도 함께 업데이트
        this.updateTabBadges();
    }

    isToday(date) {
        if (!date || !(date instanceof Date)) {
            return false;
        }
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    isOverdue(workflow) {
        if (workflow.status === 'approved' || workflow.status === 'rejected') {
            return false;
        }
        
        if (!workflow.requestDate || !(workflow.requestDate instanceof Date)) {
            return false;
        }
        
        const daysSinceRequest = Math.floor((new Date() - workflow.requestDate) / (1000 * 60 * 60 * 24));
        return daysSinceRequest > 7; // 7일 이상 지연
    }

    toggleWorkflowSelection(workflowId, selected) {
        if (selected) {
            this.selectedWorkflows.add(workflowId);
        } else {
            this.selectedWorkflows.delete(workflowId);
        }
        
        this.updateBulkActionButtons();
        this.updateSelectAllCheckbox();
    }

    toggleSelectAll(selectAll) {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageWorkflows = this.filteredWorkflows.slice(startIndex, endIndex);
        
        pageWorkflows.forEach(workflow => {
            const checkbox = document.getElementById(`workflow-${workflow.id}`);
            if (checkbox) {
                checkbox.checked = selectAll;
                this.toggleWorkflowSelection(workflow.id, selectAll);
            }
        });
    }

    updateSelectAllCheckbox() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageWorkflows = this.filteredWorkflows.slice(startIndex, endIndex);
        
        const selectedOnPage = pageWorkflows.filter(w => this.selectedWorkflows.has(w.id)).length;
        const selectAllCheckbox = document.getElementById('selectAll');
        
        if (selectedOnPage === 0) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
        } else if (selectedOnPage === pageWorkflows.length) {
            selectAllCheckbox.checked = true;
            selectAllCheckbox.indeterminate = false;
        } else {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = true;
        }
    }

    updateBulkActionButtons() {
        const bulkApproveBtn = document.getElementById('bulkApproveBtn');
        const bulkRejectBtn = document.getElementById('bulkRejectBtn');
        const hasSelection = this.selectedWorkflows.size > 0;
        
        bulkApproveBtn.disabled = !hasSelection;
        bulkRejectBtn.disabled = !hasSelection;
    }

    viewWorkflowDetail(workflowId) {
        this.currentWorkflow = this.workflows.find(w => w.id === workflowId);
        if (this.currentWorkflow) {
            const modal = new bootstrap.Modal(document.getElementById('workflowDetailModal'));
            modal.show();
        }
    }

    loadWorkflowDetail(workflow) {
        const content = document.getElementById('workflowDetailContent');
        content.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <div class="workflow-detail-section">
                        <h6>기본 정보</h6>
                        <table class="table table-borderless">
                            <tr><td class="fw-bold">자산명:</td><td>${workflow.assetName}</td></tr>
                            <tr><td class="fw-bold">자산코드:</td><td>${workflow.assetCode}</td></tr>
                            <tr><td class="fw-bold">요청자:</td><td>${workflow.requester}</td></tr>
                            <tr><td class="fw-bold">부서:</td><td>${workflow.department}</td></tr>
                            <tr><td class="fw-bold">요청일:</td><td>${this.formatDate(workflow.requestDate)}</td></tr>
                            <tr><td class="fw-bold">반납 사유:</td><td>${workflow.reason}</td></tr>
                        </table>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="workflow-detail-section">
                        <h6>승인 현황</h6>
                        <div class="mb-3">
                            ${this.getStatusBadge(workflow.status)}
                            <span class="urgency-badge ${workflow.urgency} ms-2">
                                ${this.getUrgencyIcon(workflow.urgency)} ${this.getUrgencyText(workflow.urgency)}
                            </span>
                        </div>
                        <div class="progress mb-2">
                            <div class="progress-bar" style="width: ${workflow.progress}%"></div>
                        </div>
                        <small class="text-muted">진행률: ${workflow.progress}%</small>
                    </div>
                </div>
            </div>
            
            <div class="workflow-detail-section">
                <h6>승인 타임라인</h6>
                <div class="workflow-timeline">
                    ${workflow.timeline.map(item => `
                        <div class="timeline-item ${item.completed ? 'completed' : ''} ${item.current ? 'current' : ''}">
                            <div class="timeline-header">
                                <div class="timeline-title">${item.title}</div>
                                <div class="timeline-time">${this.formatDateTime(item.date)}</div>
                            </div>
                            <div class="timeline-content">
                                <div><strong>담당자:</strong> ${item.approver}</div>
                                <div><strong>상태:</strong> ${item.comment}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // 모달 버튼 상태 업데이트
        const approveBtn = document.getElementById('approveBtn');
        const rejectBtn = document.getElementById('rejectBtn');
        
        if (workflow.status === 'approved' || workflow.status === 'rejected') {
            approveBtn.style.display = 'none';
            rejectBtn.style.display = 'none';
        } else {
            approveBtn.style.display = 'inline-block';
            rejectBtn.style.display = 'inline-block';
        }
    }

    approveWorkflow(workflowId) {
        if (workflowId) {
            this.currentWorkflow = this.workflows.find(w => w.id === workflowId);
        }
        
        if (this.currentWorkflow) {
            const modal = new bootstrap.Modal(document.getElementById('approvalModal'));
            modal.show();
        }
    }

    rejectWorkflow(workflowId) {
        if (workflowId) {
            this.currentWorkflow = this.workflows.find(w => w.id === workflowId);
        }
        
        if (this.currentWorkflow) {
            const modal = new bootstrap.Modal(document.getElementById('rejectionModal'));
            modal.show();
        }
    }

    async confirmApproval() {
        if (!this.currentWorkflow) return;
        
        const comments = document.getElementById('approvalComments').value;
        
        // API 호출로 승인 처리
        const success = await this.approveWorkflowAPI(this.currentWorkflow.id, comments);
        
        if (success) {
            // 모달 닫기
            bootstrap.Modal.getInstance(document.getElementById('approvalModal')).hide();
            
            // 폼 초기화
            document.getElementById('approvalComments').value = '';
        }
    }

    async confirmRejection() {
        const reason = document.getElementById('rejectionReason').value.trim();
        
        if (!reason) {
            this.showToast('거부 사유를 입력해주세요.', 'error');
            return;
        }
        
        if (!this.currentWorkflow) return;
        
        // API 호출로 거부 처리
        const success = await this.rejectWorkflowAPI(this.currentWorkflow.id, reason);
        
        if (success) {
            // 모달 닫기
            bootstrap.Modal.getInstance(document.getElementById('rejectionModal')).hide();
            
            // 폼 초기화
            document.getElementById('rejectionReason').value = '';
        }
    }

    async bulkApprove() {
        if (this.selectedWorkflows.size === 0) return;
        
        // API 호출로 대량 승인 처리
        const success = await this.bulkApproveAPI(this.selectedWorkflows, '일괄 승인 처리');
        
        if (success) {
            this.updateSelectAllCheckbox();
        }
    }

    async bulkReject() {
        if (this.selectedWorkflows.size === 0) return;
        
        // 대량 거부는 개별적으로 처리 (거부 사유가 동일)
        const selectedItems = Array.from(this.selectedWorkflows);
        let successCount = 0;
        
        for (const workflowId of selectedItems) {
            const success = await this.rejectWorkflowAPI(workflowId, '일괄 거부 처리');
            if (success) successCount++;
        }
        
        if (successCount > 0) {
            this.selectedWorkflows.clear();
            this.updateBulkActionButtons();
            this.updateSelectAllCheckbox();
            
            this.showToast(`${successCount}개 항목이 일괄 거부되었습니다.`, 'warning');
        }
    }

    updatePagination() {
        const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        const pagination = document.getElementById('pagination');
        const paginationInfo = document.getElementById('paginationInfo');
        
        // 정보 업데이트
        const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endItem = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
        paginationInfo.textContent = `${startItem}-${endItem} / 총 ${this.totalItems}개 항목`;
        
        // 페이지네이션 버튼 생성
        let paginationHTML = '';
        
        // 이전 버튼
        paginationHTML += `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="workflowManager.goToPage(${this.currentPage - 1})">이전</a>
            </li>
        `;
        
        // 페이지 번호
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="workflowManager.goToPage(${i})">${i}</a>
                </li>
            `;
        }
        
        // 다음 버튼
        paginationHTML += `
            <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="workflowManager.goToPage(${this.currentPage + 1})">다음</a>
            </li>
        `;
        
        pagination.innerHTML = paginationHTML;
    }

    goToPage(page) {
        const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.loadWorkflows();
        }
    }

    formatDate(date) {
        return date.toLocaleDateString('ko-KR');
    }

    formatDateTime(date) {
        return date.toLocaleString('ko-KR');
    }

    showToast(message, type = 'info') {
        // Toast 알림 표시 (Bootstrap Toast 사용)
        const toastContainer = document.querySelector('.toast-container') || this.createToastContainer();
        
        const toastId = 'toast-' + Date.now();
        const bgClass = type === 'success' ? 'bg-success' : type === 'error' ? 'bg-danger' : 'bg-info';
        
        const toastHTML = `
            <div id="${toastId}" class="toast ${bgClass} text-white" role="alert">
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        `;
        
        toastContainer.insertAdjacentHTML('beforeend', toastHTML);
        
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
        
        // 토스트가 숨겨진 후 DOM에서 제거
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
        return container;
    }

    startAutoRefresh() {
        // 30초마다 통계 업데이트
        setInterval(() => {
            this.updateStatistics();
        }, 30000);
    }
}

// 전역 함수들
async function refreshWorkflows() {
    await workflowManager.refreshWorkflows();
}

function openBulkApprovalModal() {
    const modal = new bootstrap.Modal(document.getElementById('bulkApprovalModal'));
    modal.show();
}

function applyFilters() {
    workflowManager.applyFilters();
}

function toggleSelectAll() {
    const selectAll = document.getElementById('selectAll').checked;
    workflowManager.toggleSelectAll(selectAll);
}

async function bulkApprove() {
    await workflowManager.bulkApprove();
}

async function bulkReject() {
    await workflowManager.bulkReject();
}

function showRejectModal() {
    bootstrap.Modal.getInstance(document.getElementById('workflowDetailModal')).hide();
    const modal = new bootstrap.Modal(document.getElementById('rejectionModal'));
    modal.show();
}

function approveWorkflow() {
    bootstrap.Modal.getInstance(document.getElementById('workflowDetailModal')).hide();
    workflowManager.approveWorkflow();
}

async function confirmApproval() {
    await workflowManager.confirmApproval();
}

async function confirmRejection() {
    await workflowManager.confirmRejection();
}

async function executeBulkApproval() {
    // 일괄 승인 실행 로직
    bootstrap.Modal.getInstance(document.getElementById('bulkApprovalModal')).hide();
    await workflowManager.bulkApprove();
}

// 지연 알림 발송 함수
async function sendReminderNotifications() {
    try {
        const overdueWorkflows = workflowManager.workflows.filter(w => workflowManager.isOverdue(w));
        
        if (overdueWorkflows.length === 0) {
            workflowManager.showToast('지연된 워크플로우가 없습니다.', 'info');
            return;
        }
        
        // API 호출하여 알림 발송
        const response = await ApiUtils.post('/operations/api/operations/return/workflows/send-reminders', {
            workflow_ids: overdueWorkflows.map(w => w.id)
        });
        
        if (response.success) {
            workflowManager.showToast(`${overdueWorkflows.length}개의 지연된 워크플로우에 알림을 발송했습니다.`, 'success');
        } else {
            throw new Error(response.message || '알림 발송 실패');
        }
        
    } catch (error) {
        console.error('알림 발송 실패:', error);
        workflowManager.showToast('알림 발송에 실패했습니다.', 'error');
    }
}

// 페이지 로드 시 초기화
let workflowManager;
document.addEventListener('DOMContentLoaded', function() {
    workflowManager = new ReturnApprovalWorkflow();
}); 