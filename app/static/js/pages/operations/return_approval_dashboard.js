/**
 * Return Approval Dashboard
 * 반납 승인 대시보드 관리 모듈
 * 
 * 주요 기능:
 * 1. 승인 대기 목록 표시
 * 2. 워크플로우 상세 정보 표시
 * 3. 승인/거부 처리
 * 4. 일괄 승인 처리
 * 5. 실시간 상태 업데이트
 */

class ReturnApprovalDashboard {
    constructor() {
        this.pendingApprovals = [];
        this.filteredApprovals = [];
        this.selectedApproval = null;
        this.selectedApprovals = [];
        this.currentView = 'card';
        this.isInitialized = false;
    }

    /**
     * 초기화
     */
    async initialize() {
        try {
            console.log('ReturnApprovalDashboard 초기화 중...');
            
            // 데이터 로드
            await this.loadPendingApprovals();
            await this.loadDepartments();
            
            // UI 렌더링
            this.renderQuickStats();
            this.renderApprovalsList();
            this.renderRecentApprovals();
            
            // 이벤트 리스너 설정
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('ReturnApprovalDashboard 초기화 완료');
            
        } catch (error) {
            console.error('ReturnApprovalDashboard 초기화 오류:', error);
            throw error;
        }
    }

    /**
     * 대기 중인 승인 목록 로드
     */
    async loadPendingApprovals() {
        try {
            // 실제 구현에서는 API 호출
            this.pendingApprovals = await this.fetchPendingApprovals();
            this.filteredApprovals = [...this.pendingApprovals];
            
            console.log(`승인 대기 목록 ${this.pendingApprovals.length}건 로드 완료`);
        } catch (error) {
            console.error('승인 목록 로드 오류:', error);
            throw error;
        }
    }

    /**
     * 대기 중인 승인 데이터 가져오기 (모의)
     */
    async fetchPendingApprovals() {
        // 모의 지연 시간
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return [
            {
                id: 'WF-001',
                workflowId: 'WF-001',
                assetId: 'ASSET-001',
                assetName: '노트북 Dell XPS 13',
                assetCode: 'IT-NB-2023-001',
                requesterId: 'USER-001',
                requesterName: '김개발',
                department: '개발팀',
                currentStep: 'dept_approval',
                currentStepName: '부서장 승인 대기',
                assignedApprover: 1,
                assignedApproverName: '김부장',
                requestDate: '2024-12-15',
                urgency: 'normal',
                progress: 25,
                comments: '업무용 노트북 반납 요청',
                estimatedReturnDate: '2024-12-20',
                loanDate: '2024-06-15',
                loanDuration: 183, // 일
                metadata: {
                    category: 'IT장비',
                    serialNumber: 'DXP13-2023-001',
                    condition: 'good',
                    accessories: ['충전기', '마우스']
                }
            },
            {
                id: 'WF-002',
                workflowId: 'WF-002',
                assetId: 'ASSET-002',
                assetName: '프로젝터 Epson EB-X41',
                assetCode: 'OF-PJ-2022-005',
                requesterId: 'USER-002',
                requesterName: '이마케팅',
                department: '마케팅팀',
                currentStep: 'asset_manager_approval',
                currentStepName: '자산관리자 승인 대기',
                assignedApprover: 2,
                assignedApproverName: '이관리자',
                requestDate: '2024-12-14',
                urgency: 'high',
                progress: 50,
                comments: '프레젠테이션 완료 후 반납',
                estimatedReturnDate: '2024-12-18',
                loanDate: '2024-12-10',
                loanDuration: 8,
                metadata: {
                    category: '사무기기',
                    serialNumber: 'EPX41-2022-005',
                    condition: 'excellent',
                    accessories: ['리모컨', 'HDMI 케이블', '가방']
                }
            },
            {
                id: 'WF-003',
                workflowId: 'WF-003',
                assetId: 'ASSET-003',
                assetName: '태블릿 iPad Pro 12.9',
                assetCode: 'IT-TB-2023-008',
                requesterId: 'USER-003',
                requesterName: '박디자인',
                department: '디자인팀',
                currentStep: 'final_approval',
                currentStepName: '최종 승인 대기',
                assignedApprover: 3,
                assignedApproverName: '박이사',
                requestDate: '2024-12-13',
                urgency: 'normal',
                progress: 75,
                comments: '디자인 작업 완료로 인한 반납',
                estimatedReturnDate: '2024-12-19',
                loanDate: '2024-09-01',
                loanDuration: 109,
                metadata: {
                    category: 'IT장비',
                    serialNumber: 'IPP129-2023-008',
                    condition: 'good',
                    accessories: ['Apple Pencil', '키보드', '케이스']
                }
            },
            {
                id: 'WF-004',
                workflowId: 'WF-004',
                assetId: 'ASSET-004',
                assetName: '카메라 Canon EOS R5',
                assetCode: 'MD-CM-2023-002',
                requesterId: 'USER-004',
                requesterName: '최촬영',
                department: '마케팅팀',
                currentStep: 'dept_approval',
                currentStepName: '부서장 승인 대기',
                assignedApprover: 4,
                assignedApproverName: '최팀장',
                requestDate: '2024-12-16',
                urgency: 'low',
                progress: 25,
                comments: '제품 촬영 완료',
                estimatedReturnDate: '2024-12-22',
                loanDate: '2024-12-01',
                loanDuration: 21,
                metadata: {
                    category: '촬영장비',
                    serialNumber: 'CEOSR5-2023-002',
                    condition: 'excellent',
                    accessories: ['렌즈 24-70mm', '배터리', '충전기', '메모리카드']
                }
            }
        ];
    }

    /**
     * 부서 목록 로드
     */
    async loadDepartments() {
        try {
            const departments = await this.fetchDepartments();
            const departmentFilter = document.getElementById('departmentFilter');
            
            if (departmentFilter) {
                departmentFilter.innerHTML = '<option value="">전체 부서</option>';
                departments.forEach(dept => {
                    departmentFilter.innerHTML += `<option value="${dept}">${dept}</option>`;
                });
            }
            
        } catch (error) {
            console.error('부서 목록 로드 오류:', error);
        }
    }

    /**
     * 부서 목록 가져오기 (모의)
     */
    async fetchDepartments() {
        return ['개발팀', '마케팅팀', '디자인팀', '영업팀', '총무팀'];
    }

    /**
     * 빠른 통계 렌더링
     */
    renderQuickStats() {
        const stats = this.calculateQuickStats();
        
        document.getElementById('totalPendingCount').textContent = stats.totalPending;
        document.getElementById('todayApprovalsCount').textContent = stats.todayApprovals;
        document.getElementById('overdueCount').textContent = stats.overdue;
        document.getElementById('avgProcessingTime').textContent = stats.avgProcessingTime;
    }

    /**
     * 빠른 통계 계산
     */
    calculateQuickStats() {
        const today = new Date().toISOString().split('T')[0];
        
        return {
            totalPending: this.pendingApprovals.length,
            todayApprovals: 5, // 모의 데이터
            overdue: this.pendingApprovals.filter(approval => {
                const daysDiff = this.calculateDaysDifference(approval.requestDate, today);
                return daysDiff > 3; // 3일 이상 지연
            }).length,
            avgProcessingTime: 24 // 모의 데이터 (시간)
        };
    }

    /**
     * 승인 목록 렌더링
     */
    renderApprovalsList() {
        if (this.currentView === 'card') {
            this.renderCardView();
        } else {
            this.renderListView();
        }
    }

    /**
     * 카드 뷰 렌더링
     */
    renderCardView() {
        const container = document.getElementById('approvalCardsContainer');
        if (!container) return;

        if (this.filteredApprovals.length === 0) {
            this.showEmptyState();
            return;
        }

        this.hideEmptyState();
        
        let html = '';
        this.filteredApprovals.forEach(approval => {
            const urgencyClass = this.getUrgencyClass(approval.urgency);
            const stepClass = this.getStepClass(approval.currentStep);
            
            html += `
                <div class="col-md-6 col-lg-4 mb-3">
                    <div class="card approval-card h-100" data-workflow-id="${approval.workflowId}">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <div class="form-check">
                                <input class="form-check-input approval-checkbox" type="checkbox" 
                                       value="${approval.workflowId}" id="check-${approval.workflowId}">
                                <label class="form-check-label fw-medium" for="check-${approval.workflowId}">
                                    ${approval.assetName}
                                </label>
                            </div>
                            <span class="badge ${urgencyClass}">${this.getUrgencyText(approval.urgency)}</span>
                        </div>
                        <div class="card-body">
                            <div class="mb-2">
                                <small class="text-muted">자산 코드:</small>
                                <span class="fw-medium">${approval.assetCode}</span>
                            </div>
                            <div class="mb-2">
                                <small class="text-muted">요청자:</small>
                                <span>${approval.requesterName} (${approval.department})</span>
                            </div>
                            <div class="mb-2">
                                <small class="text-muted">현재 단계:</small>
                                <span class="badge ${stepClass}">${approval.currentStepName}</span>
                            </div>
                            <div class="mb-2">
                                <small class="text-muted">요청일:</small>
                                <span>${this.formatDate(approval.requestDate)}</span>
                            </div>
                            <div class="mb-3">
                                <small class="text-muted">진행률:</small>
                                <div class="progress mt-1" style="height: 6px;">
                                    <div class="progress-bar bg-primary" style="width: ${approval.progress}%"></div>
                                </div>
                                <small class="text-muted">${approval.progress}%</small>
                            </div>
                            <div class="approval-actions">
                                <button class="btn btn-sm btn-outline-primary" onclick="returnApprovalDashboard.viewWorkflowDetails('${approval.workflowId}')">
                                    <i class="bi bi-eye"></i> 상세
                                </button>
                                <button class="btn btn-sm btn-success" onclick="returnApprovalDashboard.openApprovalModal('${approval.workflowId}', 'approve')">
                                    <i class="bi bi-check"></i> 승인
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="returnApprovalDashboard.openApprovalModal('${approval.workflowId}', 'reject')">
                                    <i class="bi bi-x"></i> 거부
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    /**
     * 리스트 뷰 렌더링
     */
    renderListView() {
        const tableBody = document.querySelector('#approvalsTable tbody');
        if (!tableBody) return;

        if (this.filteredApprovals.length === 0) {
            this.showEmptyState();
            return;
        }

        this.hideEmptyState();
        
        let html = '';
        this.filteredApprovals.forEach(approval => {
            const urgencyClass = this.getUrgencyClass(approval.urgency);
            const stepClass = this.getStepClass(approval.currentStep);
            
            html += `
                <tr data-workflow-id="${approval.workflowId}">
                    <td>
                        <input class="form-check-input approval-checkbox" type="checkbox" 
                               value="${approval.workflowId}">
                    </td>
                    <td>
                        <div>
                            <div class="fw-medium">${approval.assetName}</div>
                            <small class="text-muted">${approval.assetCode}</small>
                        </div>
                    </td>
                    <td>
                        <div>
                            <div>${approval.requesterName}</div>
                            <small class="text-muted">${approval.department}</small>
                        </div>
                    </td>
                    <td>
                        <span class="badge ${stepClass}">${approval.currentStepName}</span>
                    </td>
                    <td>${this.formatDate(approval.requestDate)}</td>
                    <td>
                        <span class="badge ${urgencyClass}">${this.getUrgencyText(approval.urgency)}</span>
                    </td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary" onclick="returnApprovalDashboard.viewWorkflowDetails('${approval.workflowId}')">
                                <i class="bi bi-eye"></i>
                            </button>
                            <button class="btn btn-success" onclick="returnApprovalDashboard.openApprovalModal('${approval.workflowId}', 'approve')">
                                <i class="bi bi-check"></i>
                            </button>
                            <button class="btn btn-danger" onclick="returnApprovalDashboard.openApprovalModal('${approval.workflowId}', 'reject')">
                                <i class="bi bi-x"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;
    }

    /**
     * 워크플로우 상세 정보 표시
     */
    async viewWorkflowDetails(workflowId) {
        try {
            const approval = this.pendingApprovals.find(a => a.workflowId === workflowId);
            if (!approval) return;

            this.selectedApproval = approval;
            
            // 워크플로우 상세 정보 가져오기
            const workflow = await returnWorkflowManager.getWorkflow(workflowId);
            if (!workflow) return;

            const detailsContainer = document.getElementById('workflowDetails');
            if (!detailsContainer) return;

            detailsContainer.innerHTML = `
                <div class="workflow-details">
                    <!-- 자산 정보 -->
                    <div class="mb-4">
                        <h6 class="border-bottom pb-2">자산 정보</h6>
                        <div class="row">
                            <div class="col-12">
                                <p class="mb-1"><strong>${approval.assetName}</strong></p>
                                <p class="text-muted small mb-1">${approval.assetCode}</p>
                                <p class="text-muted small">${approval.metadata.category}</p>
                            </div>
                        </div>
                    </div>

                    <!-- 요청자 정보 -->
                    <div class="mb-4">
                        <h6 class="border-bottom pb-2">요청자 정보</h6>
                        <p class="mb-1"><strong>${approval.requesterName}</strong></p>
                        <p class="text-muted small mb-1">${approval.department}</p>
                        <p class="text-muted small">요청일: ${this.formatDate(approval.requestDate)}</p>
                    </div>

                    <!-- 진행 상황 -->
                    <div class="mb-4">
                        <h6 class="border-bottom pb-2">진행 상황</h6>
                        <div class="workflow-progress mb-2">
                            <div class="workflow-progress-bar" style="width: ${approval.progress}%"></div>
                        </div>
                        <p class="small text-muted mb-2">${approval.progress}% 완료</p>
                        <div class="current-step">
                            <span class="badge ${this.getStepClass(approval.currentStep)}">${approval.currentStepName}</span>
                        </div>
                    </div>

                    <!-- 워크플로우 단계 -->
                    <div class="mb-4">
                        <h6 class="border-bottom pb-2">워크플로우 단계</h6>
                        <div class="timeline">
                            ${this.renderWorkflowSteps(workflow)}
                        </div>
                    </div>

                    <!-- 요청 내용 -->
                    <div class="mb-4">
                        <h6 class="border-bottom pb-2">요청 내용</h6>
                        <p class="text-muted">${approval.comments || '별도 요청 사항 없음'}</p>
                    </div>

                    <!-- 액션 버튼 -->
                    <div class="d-grid gap-2">
                        <button class="btn btn-success" onclick="returnApprovalDashboard.openApprovalModal('${workflowId}', 'approve')">
                            <i class="bi bi-check-circle"></i> 승인
                        </button>
                        <button class="btn btn-danger" onclick="returnApprovalDashboard.openApprovalModal('${workflowId}', 'reject')">
                            <i class="bi bi-x-circle"></i> 거부
                        </button>
                    </div>
                </div>
            `;

        } catch (error) {
            console.error('워크플로우 상세 정보 표시 오류:', error);
        }
    }

    /**
     * 워크플로우 단계 렌더링
     */
    renderWorkflowSteps(workflow) {
        const steps = ['requested', 'dept_approval', 'asset_manager_approval', 'final_approval', 'approved'];
        let html = '';

        steps.forEach((stepId, index) => {
            const stepInfo = returnWorkflowManager.getStepInfo(stepId);
            const workflowStep = workflow.steps.find(s => s.stepId === stepId);
            
            let status = 'pending';
            let completedAt = '';
            let completedBy = '';
            
            if (workflowStep) {
                status = workflowStep.status;
                completedAt = workflowStep.completedAt;
                completedBy = workflowStep.completedBy;
            } else if (index < steps.indexOf(workflow.currentStep)) {
                status = 'completed';
            }

            html += `
                <div class="timeline-item">
                    <div class="timeline-marker ${status}">
                        <i class="bi ${stepInfo.icon}"></i>
                    </div>
                    <div class="timeline-content">
                        <h6 class="mb-1">${stepInfo.name}</h6>
                        <p class="text-muted small mb-1">${stepInfo.description}</p>
                        ${status === 'completed' && completedAt ? `
                            <p class="text-success small mb-0">
                                <i class="bi bi-check"></i> ${this.formatDateTime(completedAt)}
                            </p>
                        ` : ''}
                        ${status === 'pending' && stepId === workflow.currentStep ? `
                            <p class="text-warning small mb-0">
                                <i class="bi bi-clock"></i> 승인 대기 중
                            </p>
                        ` : ''}
                    </div>
                </div>
            `;
        });

        return html;
    }

    /**
     * 승인 모달 열기
     */
    openApprovalModal(workflowId, action) {
        const approval = this.pendingApprovals.find(a => a.workflowId === workflowId);
        if (!approval) return;

        // 모달 정보 설정
        document.getElementById('modalAssetName').textContent = approval.assetName;
        document.getElementById('modalRequesterName').textContent = approval.requesterName;
        document.getElementById('modalDepartment').textContent = approval.department;
        document.getElementById('modalRequestDate').textContent = this.formatDate(approval.requestDate);
        document.getElementById('modalWorkflowId').value = workflowId;
        document.getElementById('modalAction').value = action;

        // 진행률 설정
        const progressBar = document.getElementById('modalProgressBar');
        if (progressBar) {
            progressBar.style.width = approval.progress + '%';
        }

        // 액션에 따른 버튼 표시
        const approveBtn = document.getElementById('approveBtn');
        const rejectBtn = document.getElementById('rejectBtn');
        const rejectionReasonGroup = document.getElementById('rejectionReasonGroup');

        if (action === 'approve') {
            approveBtn.style.display = 'inline-block';
            rejectBtn.style.display = 'none';
            rejectionReasonGroup.style.display = 'none';
        } else {
            approveBtn.style.display = 'none';
            rejectBtn.style.display = 'inline-block';
            rejectionReasonGroup.style.display = 'block';
        }

        // 모달 열기
        const modal = new bootstrap.Modal(document.getElementById('approvalModal'));
        modal.show();
    }

    /**
     * 승인 처리
     */
    async processApproval() {
        try {
            const workflowId = document.getElementById('modalWorkflowId').value;
            const action = document.getElementById('modalAction').value;
            const comments = document.getElementById('approvalComments').value;

            if (action === 'reject') {
                const rejectionReason = document.getElementById('rejectionReason').value;
                if (!rejectionReason) {
                    alert('거부 사유를 선택해주세요.');
                    return;
                }
            }

            // 현재 사용자 ID (실제 구현에서는 세션에서 가져옴)
            const currentUserId = 1;

            let result;
            if (action === 'approve') {
                result = await returnWorkflowManager.approveStep(workflowId, currentUserId, comments);
            } else {
                const reason = document.getElementById('rejectionReason').value + (comments ? `: ${comments}` : '');
                result = await returnWorkflowManager.rejectStep(workflowId, currentUserId, reason);
            }

            if (result) {
                // 성공 메시지
                this.showNotification(`반납 요청이 ${action === 'approve' ? '승인' : '거부'}되었습니다.`, 'success');
                
                // 목록 새로고침
                await this.refreshData();
                
                // 모달 닫기
                const modal = bootstrap.Modal.getInstance(document.getElementById('approvalModal'));
                modal.hide();
            }

        } catch (error) {
            console.error('승인 처리 오류:', error);
            this.showNotification('승인 처리 중 오류가 발생했습니다.', 'error');
        }
    }

    /**
     * 일괄 승인 처리
     */
    async processBulkApproval() {
        try {
            const selectedIds = this.getSelectedApprovals();
            if (selectedIds.length === 0) {
                alert('승인할 항목을 선택해주세요.');
                return;
            }

            const comments = document.getElementById('bulkApprovalComments').value;
            const currentUserId = 1;

            let successCount = 0;
            let errorCount = 0;

            for (const workflowId of selectedIds) {
                try {
                    await returnWorkflowManager.approveStep(workflowId, currentUserId, comments);
                    successCount++;
                } catch (error) {
                    console.error(`워크플로우 ${workflowId} 승인 오류:`, error);
                    errorCount++;
                }
            }

            // 결과 메시지
            if (successCount > 0) {
                this.showNotification(`${successCount}건의 승인이 완료되었습니다.`, 'success');
            }
            if (errorCount > 0) {
                this.showNotification(`${errorCount}건의 승인 처리에 실패했습니다.`, 'warning');
            }

            // 목록 새로고침
            await this.refreshData();
            
            // 모달 닫기
            const modal = bootstrap.Modal.getInstance(document.getElementById('bulkApprovalModal'));
            modal.hide();

        } catch (error) {
            console.error('일괄 승인 처리 오류:', error);
            this.showNotification('일괄 승인 처리 중 오류가 발생했습니다.', 'error');
        }
    }

    /**
     * 최근 승인 이력 렌더링
     */
    renderRecentApprovals() {
        const container = document.getElementById('recentApprovals');
        if (!container) return;

        // 모의 최근 승인 이력
        const recentApprovals = [
            {
                assetName: '모니터 Samsung 27"',
                action: 'approved',
                approverName: '김부장',
                timestamp: '2024-12-16 14:30'
            },
            {
                assetName: '키보드 Logitech MX',
                action: 'rejected',
                approverName: '이관리자',
                timestamp: '2024-12-16 11:15'
            },
            {
                assetName: '마우스 Apple Magic',
                action: 'approved',
                approverName: '박이사',
                timestamp: '2024-12-16 09:45'
            }
        ];

        let html = '';
        recentApprovals.forEach(approval => {
            const actionClass = approval.action === 'approved' ? 'success' : 'danger';
            const actionText = approval.action === 'approved' ? '승인' : '거부';
            
            html += `
                <div class="timeline-item">
                    <div class="timeline-marker ${approval.action === 'approved' ? 'completed' : 'rejected'}">
                        <i class="bi ${approval.action === 'approved' ? 'bi-check' : 'bi-x'}"></i>
                    </div>
                    <div class="timeline-content">
                        <div class="d-flex justify-content-between">
                            <span class="fw-medium">${approval.assetName}</span>
                            <small class="text-muted">${approval.timestamp}</small>
                        </div>
                        <div class="text-muted small">
                            <span class="badge bg-${actionClass}">${actionText}</span>
                            by ${approval.approverName}
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 뷰 모드 변경
        document.querySelectorAll('input[name="viewMode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.currentView = e.target.id === 'cardView' ? 'card' : 'list';
                this.toggleView();
            });
        });

        // 필터 이벤트
        document.getElementById('statusFilter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('departmentFilter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('urgencyFilter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('searchInput')?.addEventListener('input', () => this.applyFilters());
        document.getElementById('clearSearch')?.addEventListener('click', () => this.clearSearch());

        // 새로고침
        document.getElementById('refreshData')?.addEventListener('click', () => this.refreshData());

        // 일괄 승인
        document.getElementById('bulkApproval')?.addEventListener('click', () => this.openBulkApprovalModal());

        // 전체 선택
        document.getElementById('selectAll')?.addEventListener('change', (e) => {
            this.toggleAllSelection(e.target.checked);
        });

        // 승인/거부 버튼
        document.getElementById('approveBtn')?.addEventListener('click', () => this.processApproval());
        document.getElementById('rejectBtn')?.addEventListener('click', () => this.processApproval());
        document.getElementById('confirmBulkApproval')?.addEventListener('click', () => this.processBulkApproval());
    }

    /**
     * 뷰 토글
     */
    toggleView() {
        const cardView = document.getElementById('cardViewContainer');
        const listView = document.getElementById('listViewContainer');

        if (this.currentView === 'card') {
            cardView.style.display = 'block';
            listView.style.display = 'none';
        } else {
            cardView.style.display = 'none';
            listView.style.display = 'block';
        }

        this.renderApprovalsList();
    }

    /**
     * 필터 적용
     */
    applyFilters() {
        const statusFilter = document.getElementById('statusFilter')?.value || '';
        const departmentFilter = document.getElementById('departmentFilter')?.value || '';
        const urgencyFilter = document.getElementById('urgencyFilter')?.value || '';
        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';

        this.filteredApprovals = this.pendingApprovals.filter(approval => {
            const matchesStatus = !statusFilter || approval.currentStep === statusFilter;
            const matchesDepartment = !departmentFilter || approval.department === departmentFilter;
            const matchesUrgency = !urgencyFilter || approval.urgency === urgencyFilter;
            const matchesSearch = !searchTerm || 
                approval.assetName.toLowerCase().includes(searchTerm) ||
                approval.requesterName.toLowerCase().includes(searchTerm) ||
                approval.assetCode.toLowerCase().includes(searchTerm);

            return matchesStatus && matchesDepartment && matchesUrgency && matchesSearch;
        });

        this.renderApprovalsList();
    }

    /**
     * 검색 초기화
     */
    clearSearch() {
        document.getElementById('searchInput').value = '';
        this.applyFilters();
    }

    /**
     * 전체 선택 토글
     */
    toggleAllSelection(checked) {
        document.querySelectorAll('.approval-checkbox').forEach(checkbox => {
            checkbox.checked = checked;
        });
    }

    /**
     * 선택된 승인 목록 조회
     */
    getSelectedApprovals() {
        const checkboxes = document.querySelectorAll('.approval-checkbox:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    /**
     * 일괄 승인 모달 열기
     */
    openBulkApprovalModal() {
        const selectedIds = this.getSelectedApprovals();
        if (selectedIds.length === 0) {
            alert('승인할 항목을 선택해주세요.');
            return;
        }

        document.getElementById('bulkSelectedCount').textContent = selectedIds.length;
        
        const modal = new bootstrap.Modal(document.getElementById('bulkApprovalModal'));
        modal.show();
    }

    /**
     * 데이터 새로고침
     */
    async refreshData() {
        try {
            this.showLoading();
            
            await this.loadPendingApprovals();
            this.renderQuickStats();
            this.renderApprovalsList();
            this.renderRecentApprovals();
            
            this.hideLoading();
            this.showNotification('데이터가 새로고침되었습니다.', 'success');
            
        } catch (error) {
            console.error('데이터 새로고침 오류:', error);
            this.hideLoading();
            this.showNotification('데이터 새로고침 중 오류가 발생했습니다.', 'error');
        }
    }

    /**
     * 유틸리티 메서드들
     */
    getUrgencyClass(urgency) {
        const classMap = {
            high: 'bg-danger',
            normal: 'bg-primary',
            low: 'bg-secondary'
        };
        return classMap[urgency] || 'bg-secondary';
    }

    getUrgencyText(urgency) {
        const textMap = {
            high: '높음',
            normal: '보통',
            low: '낮음'
        };
        return textMap[urgency] || '보통';
    }

    getStepClass(step) {
        const classMap = {
            dept_approval: 'bg-warning',
            asset_manager_approval: 'bg-info',
            final_approval: 'bg-primary',
            approved: 'bg-success',
            rejected: 'bg-danger'
        };
        return classMap[step] || 'bg-secondary';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR');
    }

    formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('ko-KR');
    }

    calculateDaysDifference(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    showLoading() {
        document.getElementById('loadingState')?.style.setProperty('display', 'block');
    }

    hideLoading() {
        document.getElementById('loadingState')?.style.setProperty('display', 'none');
    }

    showEmptyState() {
        document.getElementById('emptyState')?.style.setProperty('display', 'block');
    }

    hideEmptyState() {
        document.getElementById('emptyState')?.style.setProperty('display', 'none');
    }

    showNotification(message, type = 'info') {
        // 실제 구현에서는 토스트 알림 등 사용
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // 간단한 알림 표시
        const alertClass = type === 'success' ? 'alert-success' : 
                          type === 'error' ? 'alert-danger' : 
                          type === 'warning' ? 'alert-warning' : 'alert-info';
        
        const alertHtml = `
            <div class="alert ${alertClass} alert-dismissible fade show position-fixed" 
                 style="top: 20px; right: 20px; z-index: 9999; max-width: 400px;">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', alertHtml);
        
        // 3초 후 자동 제거
        setTimeout(() => {
            const alerts = document.querySelectorAll('.alert');
            if (alerts.length > 0) {
                alerts[alerts.length - 1].remove();
            }
        }, 3000);
    }

    /**
     * 상태 확인
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            pendingApprovalsCount: this.pendingApprovals.length,
            filteredApprovalsCount: this.filteredApprovals.length,
            selectedApproval: this.selectedApproval?.workflowId || null,
            currentView: this.currentView
        };
    }

    /**
     * 정리
     */
    cleanup() {
        this.pendingApprovals = [];
        this.filteredApprovals = [];
        this.selectedApproval = null;
        this.selectedApprovals = [];
        this.isInitialized = false;
    }
}

// 전역 인스턴스 생성
window.returnApprovalDashboard = new ReturnApprovalDashboard(); 