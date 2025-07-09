/**
 * Asset Disposal Planning Management
 * 자산 폐기 계획 관리 시스템
 */

class AssetDisposalPlanning {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.totalItems = 0;
        this.disposalRequests = [];
        this.filteredRequests = [];
        this.selectedRequests = new Set();
        this.currentRequest = null;
        this.activeTab = 'pending';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDisposalRequests();
        this.updateStatistics();
        this.startAutoRefresh();
    }



    getRandomDescription() {
        const descriptions = [
            '장비 노후화로 인한 성능 저하 및 유지보수 비용 증가',
            '하드웨어 고장으로 인한 수리 불가 상태',
            '보안 업데이트 지원 종료로 인한 보안 위험',
            '새로운 시스템 도입으로 인한 기존 장비 교체',
            '정책 변경에 따른 장비 표준화 작업',
            '에너지 효율성 개선을 위한 구형 장비 교체'
        ];
        return descriptions[Math.floor(Math.random() * descriptions.length)];
    }

    getRandomLocation() {
        const locations = ['본사 1층', '본사 2층', '본사 3층', '지점 A', '지점 B', '창고'];
        return locations[Math.floor(Math.random() * locations.length)];
    }

    getProgressByStatus(status) {
        const progress = {
            'pending': 10,
            'approved': 30,
            'scheduled': 50,
            'in_progress': 80,
            'completed': 100,
            'cancelled': 0
        };
        return progress[status] || 0;
    }

    getApproverByStatus(status) {
        const approvers = {
            'pending': '승인 대기',
            'approved': '김부장',
            'scheduled': '이과장',
            'in_progress': '박차장',
            'completed': '완료',
            'cancelled': '취소됨'
        };
        return approvers[status] || '미정';
    }

    generateTimeline(status, requestDate) {
        const timeline = [];
        const statusOrder = ['pending', 'approved', 'scheduled', 'in_progress', 'completed'];
        const currentIndex = statusOrder.indexOf(status);
        
        for (let i = 0; i <= currentIndex && i < statusOrder.length; i++) {
            const stepDate = new Date(requestDate);
            stepDate.setDate(stepDate.getDate() + (i * 3));
            
            timeline.push({
                status: statusOrder[i],
                title: this.getStatusTitle(statusOrder[i]),
                date: stepDate,
                completed: i < currentIndex || status === 'completed',
                current: i === currentIndex && status !== 'completed',
                description: this.getTimelineDescription(statusOrder[i])
            });
        }
        
        return timeline;
    }

    getStatusTitle(status) {
        const titles = {
            'pending': '폐기 요청',
            'approved': '승인 완료',
            'scheduled': '일정 계획',
            'in_progress': '폐기 진행',
            'completed': '폐기 완료',
            'cancelled': '취소됨'
        };
        return titles[status] || status;
    }

    getTimelineDescription(status) {
        const descriptions = {
            'pending': '폐기 요청이 제출되었습니다',
            'approved': '폐기 요청이 승인되었습니다',
            'scheduled': '폐기 일정이 계획되었습니다',
            'in_progress': '폐기 작업이 진행 중입니다',
            'completed': '폐기 작업이 완료되었습니다',
            'cancelled': '폐기 요청이 취소되었습니다'
        };
        return descriptions[status] || '';
    }

    generateAttachments() {
        const attachments = [];
        const fileTypes = ['pdf', 'jpg', 'png', 'doc'];
        const fileNames = ['장비사진', '고장진단서', '견적서', '승인서류'];
        
        const count = Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
            attachments.push({
                name: `${fileNames[Math.floor(Math.random() * fileNames.length)]}.${fileTypes[Math.floor(Math.random() * fileTypes.length)]}`,
                size: Math.floor(Math.random() * 5000) + 100,
                uploadDate: new Date()
            });
        }
        
        return attachments;
    }

    setupEventListeners() {
        // 탭 변경 이벤트
        document.querySelectorAll('[data-bs-toggle="tab"]').forEach(tab => {
            tab.addEventListener('shown.bs.tab', (e) => {
                this.activeTab = e.target.getAttribute('data-bs-target').substring(1);
                this.loadDisposalRequests();
            });
        });

        // 필터 이벤트
        document.getElementById('reasonFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('departmentFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('priorityFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('searchInput').addEventListener('input', () => this.applyFilters());
        
        // 폐기 요청 폼 이벤트
        document.getElementById('disposalRequestForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitDisposalRequest();
        });
        
        // 파일 업로드 이벤트
        this.setupFileUpload();
    }

    setupFileUpload() {
        const fileInput = document.getElementById('disposalAttachments');
        const fileArea = document.querySelector('.file-upload-area');
        
        if (fileArea) {
            fileArea.addEventListener('click', () => fileInput.click());
            fileArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                fileArea.classList.add('dragover');
            });
            fileArea.addEventListener('dragleave', () => {
                fileArea.classList.remove('dragover');
            });
            fileArea.addEventListener('drop', (e) => {
                e.preventDefault();
                fileArea.classList.remove('dragover');
                this.handleFileUpload(e.dataTransfer.files);
            });
        }
        
        fileInput.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });
    }

    handleFileUpload(files) {
        const attachedFilesContainer = document.querySelector('.attached-files');
        if (!attachedFilesContainer) {
            const container = document.createElement('div');
            container.className = 'attached-files';
            document.getElementById('disposalAttachments').parentNode.appendChild(container);
        }
        
        Array.from(files).forEach(file => {
            this.addAttachedFile(file);
        });
    }

    addAttachedFile(file) {
        const container = document.querySelector('.attached-files');
        const fileElement = document.createElement('div');
        fileElement.className = 'attached-file';
        fileElement.innerHTML = `
            <div class="file-info">
                <i class="fas fa-file file-icon"></i>
                <span class="file-name">${file.name}</span>
                <span class="file-size">(${this.formatFileSize(file.size)})</span>
            </div>
            <i class="fas fa-times remove-file" onclick="this.parentElement.remove()"></i>
        `;
        container.appendChild(fileElement);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    applyFilters() {
        const reasonFilter = document.getElementById('reasonFilter').value;
        const departmentFilter = document.getElementById('departmentFilter').value;
        const priorityFilter = document.getElementById('priorityFilter').value;
        const searchInput = document.getElementById('searchInput').value.toLowerCase();
        
        this.filteredRequests = this.disposalRequests.filter(request => {
            const matchStatus = this.getStatusFilter(request.status);
            const matchReason = !reasonFilter || request.reason === reasonFilter;
            const matchDepartment = !departmentFilter || request.department === departmentFilter;
            const matchPriority = !priorityFilter || request.priority === priorityFilter;
            const matchSearch = !searchInput || 
                request.assetName.toLowerCase().includes(searchInput) ||
                request.assetCode.toLowerCase().includes(searchInput) ||
                request.requester.toLowerCase().includes(searchInput);
            
            return matchStatus && matchReason && matchDepartment && matchPriority && matchSearch;
        });
        
        this.totalItems = this.filteredRequests.length;
        this.currentPage = 1;
        this.loadDisposalRequests();
        this.updatePagination();
    }

    getStatusFilter(status) {
        switch (this.activeTab) {
            case 'pending':
                return status === 'pending';
            case 'approved':
                return status === 'approved';
            case 'scheduled':
                return status === 'scheduled';
            case 'completed':
                return ['completed', 'cancelled'].includes(status);
            default:
                return true;
        }
    }

    async loadDisposalRequests() {
        try {
            this.showLoading();
            
            // API 호출하여 데이터 가져오기
            const response = await fetch(`/operations/api/disposal-planning-data?status=${this.activeTab}&page=${this.currentPage}&per_page=${this.itemsPerPage}`);
            const data = await response.json();
            
            if (!data.success) {
                this.showError(data.message || '데이터를 가져오는 중 오류가 발생했습니다.');
                return;
            }
            
            const pageRequests = data.data;
            this.totalItems = data.pagination.total;
        
        const containerId = `${this.activeTab}DisposalsList`;
        const container = document.getElementById(containerId);
        
        if (!container) return;
            
            this.hideLoading();
        
        if (pageRequests.length === 0) {
            container.innerHTML = this.getEmptyStateHTML();
            return;
        }
        
        container.innerHTML = pageRequests.map(request => this.getDisposalItemHTML(request)).join('');
        
        // 체크박스 이벤트 리스너 추가
        pageRequests.forEach(request => {
            const checkbox = document.getElementById(`disposal-${request.id}`);
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    this.toggleRequestSelection(request.id, e.target.checked);
                });
            }
        });
        
        this.updatePagination();
            
        } catch (error) {
            console.error('Error loading disposal requests:', error);
            this.hideLoading();
            this.showError('데이터를 가져오는 중 네트워크 오류가 발생했습니다.');
        }
    }

    getDisposalItemHTML(request) {
        const isSelected = this.selectedRequests.has(request.id);
        const statusBadge = this.getStatusBadge(request.status);
        const reasonBadge = this.getReasonBadge(request.reason);
        const priorityBadge = this.getPriorityBadge(request.priority);
        
        return `
            <div class="disposal-item" data-request-id="${request.id}">
                <div class="disposal-header">
                    <div class="d-flex align-items-center gap-3">
                        ${this.activeTab === 'pending' ? `<input type="checkbox" class="disposal-checkbox" id="disposal-${request.id}" ${isSelected ? 'checked' : ''}>` : ''}
                        <div class="disposal-info">
                            <div class="disposal-title">
                                <span>${request.assetName}</span>
                                <small class="text-muted">(${request.assetCode})</small>
                            </div>
                            <div class="disposal-meta">
                                <div class="meta-item">
                                    <i class="fas fa-user"></i>
                                    <span>${request.requester}</span>
                                </div>
                                <div class="meta-item">
                                    <i class="fas fa-building"></i>
                                    <span>${request.department}</span>
                                </div>
                                <div class="meta-item">
                                    <i class="fas fa-calendar"></i>
                                    <span>${this.formatDate(request.requestDate)}</span>
                                </div>
                                <div class="meta-item">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <span>${request.currentLocation}</span>
                                </div>
                            </div>
                            <div class="d-flex align-items-center gap-2 mb-2">
                                ${statusBadge}
                                ${reasonBadge}
                                ${priorityBadge}
                            </div>
                            <div class="disposal-progress">
                                <div class="progress-info">
                                    <span>진행률</span>
                                    <span>${request.progress}%</span>
                                </div>
                                <div class="progress-bar-container">
                                    <div class="progress-bar" style="width: ${request.progress}%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="disposal-actions">
                        <button class="btn btn-sm btn-outline-primary" onclick="disposalManager.viewRequestDetail(${request.id})">
                            <i class="fas fa-eye"></i> 상세보기
                        </button>
                        ${this.getActionButtons(request)}
                    </div>
                </div>
            </div>
        `;
    }

    getActionButtons(request) {
        if (request.status === 'pending') {
            return `
                <button class="btn btn-sm btn-success" onclick="disposalManager.approveRequest(${request.id})">
                    <i class="fas fa-check"></i> 승인
                </button>
                <button class="btn btn-sm btn-danger" onclick="disposalManager.rejectRequest(${request.id})">
                    <i class="fas fa-times"></i> 거부
                </button>
            `;
        } else if (request.status === 'approved') {
            return `
                <button class="btn btn-sm btn-info" onclick="disposalManager.scheduleDisposal(${request.id})">
                    <i class="fas fa-calendar-plus"></i> 일정 등록
                </button>
            `;
        } else if (request.status === 'scheduled') {
            return `
                <button class="btn btn-sm btn-warning" onclick="disposalManager.startDisposal(${request.id})">
                    <i class="fas fa-play"></i> 폐기 시작
                </button>
            `;
        } else if (request.status === 'in_progress') {
            return `
                <button class="btn btn-sm btn-success" onclick="disposalManager.completeDisposal(${request.id})">
                    <i class="fas fa-check-double"></i> 완료
                </button>
            `;
        }
        return '';
    }

    getStatusBadge(status) {
        const statusText = {
            'pending': '승인 대기',
            'approved': '승인 완료',
            'scheduled': '일정 등록',
            'in_progress': '진행 중',
            'completed': '폐기 완료',
            'cancelled': '취소됨'
        };
        
        return `<span class="disposal-status ${status}">${statusText[status]}</span>`;
    }

    getReasonBadge(reason) {
        const reasonText = {
            'end_of_life': '수명 만료',
            'malfunction': '고장/오작동',
            'obsolete': '구식/지원 종료',
            'security': '보안 취약점',
            'cost_ineffective': '비용 비효율',
            'policy_change': '정책 변경'
        };
        
        return `<span class="disposal-reason ${reason}">${reasonText[reason]}</span>`;
    }

    getPriorityBadge(priority) {
        const priorityText = {
            'low': '낮음',
            'normal': '보통',
            'high': '높음',
            'urgent': '긴급'
        };
        
        const priorityIcon = {
            'low': '<i class="fas fa-chevron-down"></i>',
            'normal': '<i class="fas fa-minus"></i>',
            'high': '<i class="fas fa-chevron-up"></i>',
            'urgent': '<i class="fas fa-exclamation"></i>'
        };
        
        return `<span class="priority-badge ${priority}">${priorityIcon[priority]} ${priorityText[priority]}</span>`;
    }

    getEmptyStateHTML() {
        const messages = {
            'pending': {
                icon: 'fas fa-hourglass-half',
                title: '승인 대기 중인 폐기 요청이 없습니다',
                description: '새로운 폐기 요청을 생성하거나 필터 조건을 변경해보세요.'
            },
            'approved': {
                icon: 'fas fa-check-circle',
                title: '승인된 폐기 요청이 없습니다',
                description: '승인 대기 중인 요청을 먼저 승인해주세요.'
            },
            'scheduled': {
                icon: 'fas fa-calendar-check',
                title: '예정된 폐기 작업이 없습니다',
                description: '승인된 요청에 대해 폐기 일정을 등록해주세요.'
            },
            'completed': {
                icon: 'fas fa-check-double',
                title: '완료된 폐기 작업이 없습니다',
                description: '진행 중인 폐기 작업을 완료해주세요.'
            }
        };
        
        const message = messages[this.activeTab] || messages['pending'];
        
        return `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="${message.icon}"></i>
                </div>
                <div class="empty-title">${message.title}</div>
                <div class="empty-description">${message.description}</div>
            </div>
        `;
    }

    async updateStatistics() {
        try {
            // 각 상태별 개수를 API에서 가져오기
            const [pendingRes, approvedRes, scheduledRes, completedRes] = await Promise.all([
                fetch('/operations/api/disposal-planning-data?status=pending&per_page=1'),
                fetch('/operations/api/disposal-planning-data?status=approved&per_page=1'),
                fetch('/operations/api/disposal-planning-data?status=scheduled&per_page=1'),
                fetch('/operations/api/disposal-planning-data?status=completed&per_page=1')
            ]);
            
            const [pendingData, approvedData, scheduledData, completedData] = await Promise.all([
                pendingRes.json(),
                approvedRes.json(),
                scheduledRes.json(),
                completedRes.json()
            ]);
            
        const stats = {
                pending: pendingData.success ? pendingData.pagination.total : 0,
                approved: approvedData.success ? approvedData.pagination.total : 0,
                scheduled: scheduledData.success ? scheduledData.pagination.total : 0,
                completed: completedData.success ? completedData.pagination.total : 0
        };
        
            // 통계 카드 업데이트
            const pendingElement = document.getElementById('pendingDisposals');
            const approvedElement = document.getElementById('approvedDisposals');
            const scheduledElement = document.getElementById('scheduledDisposals');
            const completedElement = document.getElementById('completedDisposals');
            
            if (pendingElement) pendingElement.textContent = stats.pending;
            if (approvedElement) approvedElement.textContent = stats.approved;
            if (scheduledElement) scheduledElement.textContent = stats.scheduled;
            if (completedElement) completedElement.textContent = stats.completed;
        
        // 탭 배지 업데이트
            const pendingBadge = document.getElementById('pendingBadge');
            const approvedBadge = document.getElementById('approvedBadge');
            const scheduledBadge = document.getElementById('scheduledBadge');
            const completedBadge = document.getElementById('completedBadge');
            
            if (pendingBadge) pendingBadge.textContent = stats.pending;
            if (approvedBadge) approvedBadge.textContent = stats.approved;
            if (scheduledBadge) scheduledBadge.textContent = stats.scheduled;
            if (completedBadge) completedBadge.textContent = stats.completed;
            
        } catch (error) {
            console.error('Error updating statistics:', error);
            // 통계 업데이트 실패 시 기본값 설정 (기존 값 유지)
        }
    }

    formatDate(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        return date.toLocaleDateString('ko-KR');
    }

    formatDateTime(date) {
        return date.toLocaleString('ko-KR');
    }

    startAutoRefresh() {
        // 30초마다 통계 업데이트
        setInterval(() => {
            this.updateStatistics();
        }, 30000);
    }

    async refreshDisposalData() {
        try {
            await this.loadDisposalRequests();
            await this.updateStatistics();
        this.showToast('데이터가 새로고침되었습니다.', 'success');
        } catch (error) {
            console.error('Error refreshing data:', error);
            this.showToast('데이터 새로고침 중 오류가 발생했습니다.', 'error');
        }
    }

    showToast(message, type = 'info') {
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
        
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    }

    showLoading() {
        const containerId = `${this.activeTab}DisposalsList`;
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">로딩 중...</span>
                    </div>
                    <div class="mt-2 text-muted">데이터를 불러오는 중...</div>
                </div>
            `;
        }
    }

    hideLoading() {
        // 로딩 상태는 데이터 로드 완료 시 자동으로 숨겨짐
    }

    showError(message) {
        const containerId = `${this.activeTab}DisposalsList`;
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <div class="text-danger mb-3">
                        <i class="fas fa-exclamation-triangle fa-3x"></i>
                    </div>
                    <h5 class="text-danger">오류 발생</h5>
                    <p class="text-muted">${message}</p>
                    <button class="btn btn-outline-primary" onclick="disposalManager.loadDisposalRequests()">
                        <i class="fas fa-sync-alt"></i> 다시 시도
                    </button>
                </div>
            `;
        }
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
        return container;
}

    updatePagination() {
        const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        const pagination = document.getElementById('pagination');
        const paginationInfo = document.getElementById('paginationInfo');
        
        if (paginationInfo) {
            const startItem = this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1;
            const endItem = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
            paginationInfo.textContent = `총 ${this.totalItems}개 항목 중 ${startItem}-${endItem}`;
        }
        
        if (!pagination || totalPages <= 1) {
            if (pagination) pagination.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // 이전 버튼
        paginationHTML += `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="disposalManager.goToPage(${this.currentPage - 1})">이전</a>
            </li>
        `;
        
        // 페이지 번호들
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="disposalManager.goToPage(${i})">${i}</a>
                </li>
            `;
        }
        
        // 다음 버튼
        paginationHTML += `
            <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="disposalManager.goToPage(${this.currentPage + 1})">다음</a>
            </li>
        `;
        
        pagination.innerHTML = paginationHTML;
    }

    goToPage(page) {
        const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.loadDisposalRequests();
        }
    }

    toggleRequestSelection(requestId, selected) {
        if (selected) {
            this.selectedRequests.add(requestId);
        } else {
            this.selectedRequests.delete(requestId);
        }
        
        this.updateBulkActionButtons();
    }

    toggleSelectAll(tabName) {
        const selectAllCheckbox = document.getElementById(`selectAll${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
        const isChecked = selectAllCheckbox.checked;
        
        const currentRequests = this.filteredRequests.filter(request => 
            this.getStatusFilter(request.status)
        );
        
        currentRequests.forEach(request => {
            const checkbox = document.getElementById(`disposal-${request.id}`);
            if (checkbox) {
                checkbox.checked = isChecked;
                this.toggleRequestSelection(request.id, isChecked);
            }
        });
    }

    updateBulkActionButtons() {
        const bulkApproveBtn = document.getElementById('bulkApproveBtn');
        const bulkRejectBtn = document.getElementById('bulkRejectBtn');
        
        const hasSelection = this.selectedRequests.size > 0;
        
        if (bulkApproveBtn) bulkApproveBtn.disabled = !hasSelection;
        if (bulkRejectBtn) bulkRejectBtn.disabled = !hasSelection;
    }

    viewRequestDetail(requestId) {
        const request = this.disposalRequests.find(r => r.id === requestId);
        if (!request) return;
        
        this.currentRequest = request;
        
        const modalContent = document.getElementById('disposalDetailContent');
        modalContent.innerHTML = this.getDetailModalContent(request);
        
        const modal = new bootstrap.Modal(document.getElementById('disposalDetailModal'));
        modal.show();
        
        // 승인/거부 버튼 표시 제어
        const approveBtn = document.getElementById('approveDisposalBtn');
        const rejectBtn = document.getElementById('rejectDisposalBtn');
        
        if (request.status === 'pending') {
            approveBtn.style.display = 'block';
            rejectBtn.style.display = 'block';
        } else {
            approveBtn.style.display = 'none';
            rejectBtn.style.display = 'none';
        }
    }

    getDetailModalContent(request) {
        return `
            <div class="row">
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header">
                            <h6 class="mb-0">폐기 요청 정보</h6>
                        </div>
                        <div class="card-body">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label text-muted">자산명</label>
                                    <div class="fw-bold">${request.assetName}</div>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-muted">자산 코드</label>
                                    <div class="fw-bold">${request.assetCode}</div>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-muted">요청자</label>
                                    <div>${request.requester}</div>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-muted">부서</label>
                                    <div>${request.department}</div>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-muted">현재 위치</label>
                                    <div>${request.currentLocation}</div>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-muted">추정 가치</label>
                                    <div>${request.estimatedValue.toLocaleString()}원</div>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-muted">폐기 사유</label>
                                    <div>${this.getReasonBadge(request.reason)}</div>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-muted">우선순위</label>
                                    <div>${this.getPriorityBadge(request.priority)}</div>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-muted">요청일</label>
                                    <div>${this.formatDate(request.requestDate)}</div>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-muted">희망 폐기일</label>
                                    <div>${this.formatDate(request.preferredDisposalDate)}</div>
                                </div>
                                <div class="col-12">
                                    <label class="form-label text-muted">상세 사유</label>
                                    <div class="p-3 bg-light rounded">${request.description}</div>
                                </div>
                                ${request.attachments.length > 0 ? `
                                <div class="col-12">
                                    <label class="form-label text-muted">첨부 파일</label>
                                    <div class="attached-files">
                                        ${request.attachments.map(file => `
                                            <div class="attached-file">
                                                <div class="file-info">
                                                    <i class="fas fa-file file-icon"></i>
                                                    <span class="file-name">${file.name}</span>
                                                    <span class="file-size">(${this.formatFileSize(file.size * 1024)})</span>
                                                </div>
                                                <i class="fas fa-download text-primary" style="cursor: pointer;"></i>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-header">
                            <h6 class="mb-0">진행 상황</h6>
                        </div>
                        <div class="card-body">
                            <div class="disposal-progress mb-3">
                                <div class="progress-info">
                                    <span>전체 진행률</span>
                                    <span>${request.progress}%</span>
                                </div>
                                <div class="progress-bar-container">
                                    <div class="progress-bar" style="width: ${request.progress}%"></div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label text-muted">현재 상태</label>
                                <div>${this.getStatusBadge(request.status)}</div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label text-muted">담당자</label>
                                <div>${request.approver}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card mt-3">
                        <div class="card-header">
                            <h6 class="mb-0">처리 이력</h6>
                        </div>
                        <div class="card-body">
                            <div class="disposal-timeline">
                                ${request.timeline.map(item => `
                                    <div class="timeline-item ${item.completed ? 'completed' : ''} ${item.current ? 'current' : ''}">
                                        <div class="timeline-header">
                                            <div class="timeline-title">${item.title}</div>
                                            <div class="timeline-time">${this.formatDate(item.date)}</div>
                                        </div>
                                        <div class="timeline-content">${item.description}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    approveRequest(requestId) {
        const request = this.disposalRequests.find(r => r.id === requestId);
        if (!request) return;
        
        this.currentRequest = request;
        const modal = new bootstrap.Modal(document.getElementById('approvalConfirmModal'));
        modal.show();
    }

    confirmDisposalApproval() {
        if (!this.currentRequest) return;
        
        const comments = document.getElementById('approvalComments').value;
        
        // 상태 업데이트
        this.currentRequest.status = 'approved';
        this.currentRequest.progress = 30;
        this.currentRequest.approver = '김부장';
        
        // 타임라인 업데이트
        this.currentRequest.timeline.push({
            status: 'approved',
            title: '승인 완료',
            date: new Date(),
            completed: true,
            current: false,
            description: comments || '폐기 요청이 승인되었습니다'
        });
        
        // UI 업데이트
        this.applyFilters();
        this.updateStatistics();
        
        // 모달 닫기
        bootstrap.Modal.getInstance(document.getElementById('approvalConfirmModal')).hide();
        bootstrap.Modal.getInstance(document.getElementById('disposalDetailModal'))?.hide();
        
        this.showToast('폐기 요청이 승인되었습니다.', 'success');
        
        // 선택 해제
        this.selectedRequests.delete(this.currentRequest.id);
        this.updateBulkActionButtons();
    }

    rejectRequest(requestId) {
        const request = this.disposalRequests.find(r => r.id === requestId);
        if (!request) return;
        
        this.currentRequest = request;
        const modal = new bootstrap.Modal(document.getElementById('rejectionModal'));
        modal.show();
    }

    showRejectModal() {
        if (!this.currentRequest) return;
        
        bootstrap.Modal.getInstance(document.getElementById('disposalDetailModal')).hide();
        const modal = new bootstrap.Modal(document.getElementById('rejectionModal'));
        modal.show();
    }

    confirmDisposalRejection() {
        const reason = document.getElementById('rejectionReason').value.trim();
        
        if (!reason) {
            this.showToast('거부 사유를 입력해주세요.', 'error');
            return;
        }
        
        if (!this.currentRequest) return;
        
        // 상태 업데이트
        this.currentRequest.status = 'cancelled';
        this.currentRequest.progress = 0;
        this.currentRequest.approver = '거부됨';
        
        // 타임라인 업데이트
        this.currentRequest.timeline.push({
            status: 'cancelled',
            title: '요청 거부',
            date: new Date(),
            completed: true,
            current: false,
            description: reason
        });
        
        // UI 업데이트
        this.applyFilters();
        this.updateStatistics();
        
        // 모달 닫기
        bootstrap.Modal.getInstance(document.getElementById('rejectionModal')).hide();
        
        this.showToast('폐기 요청이 거부되었습니다.', 'success');
        
        // 선택 해제
        this.selectedRequests.delete(this.currentRequest.id);
        this.updateBulkActionButtons();
    }

    bulkApprove() {
        if (this.selectedRequests.size === 0) return;
        
        const selectedIds = Array.from(this.selectedRequests);
        const confirmMessage = `선택한 ${selectedIds.length}개의 폐기 요청을 일괄 승인하시겠습니까?`;
        
        if (confirm(confirmMessage)) {
            selectedIds.forEach(id => {
                const request = this.disposalRequests.find(r => r.id === id);
                if (request && request.status === 'pending') {
                    request.status = 'approved';
                    request.progress = 30;
                    request.approver = '김부장';
                    
                    request.timeline.push({
                        status: 'approved',
                        title: '승인 완료',
                        date: new Date(),
                        completed: true,
                        current: false,
                        description: '일괄 승인 처리되었습니다'
                    });
                }
            });
            
            this.selectedRequests.clear();
            this.applyFilters();
            this.updateStatistics();
            this.updateBulkActionButtons();
            
            this.showToast(`${selectedIds.length}개의 폐기 요청이 승인되었습니다.`, 'success');
        }
    }

    bulkReject() {
        if (this.selectedRequests.size === 0) return;
        
        const reason = prompt('일괄 거부 사유를 입력해주세요:');
        if (!reason) return;
        
        const selectedIds = Array.from(this.selectedRequests);
        
        selectedIds.forEach(id => {
            const request = this.disposalRequests.find(r => r.id === id);
            if (request && request.status === 'pending') {
                request.status = 'cancelled';
                request.progress = 0;
                request.approver = '거부됨';
                
                request.timeline.push({
                    status: 'cancelled',
                    title: '요청 거부',
                    date: new Date(),
                    completed: true,
                    current: false,
                    description: reason
                });
            }
        });
        
        this.selectedRequests.clear();
        this.applyFilters();
        this.updateStatistics();
        this.updateBulkActionButtons();
        
        this.showToast(`${selectedIds.length}개의 폐기 요청이 거부되었습니다.`, 'success');
    }

    submitDisposalRequest() {
        const formData = new FormData(document.getElementById('disposalRequestForm'));
        
        // 폼 검증
        const requiredFields = ['assetSelect', 'disposalReason', 'disposalPriority', 'disposalDescription'];
        for (const field of requiredFields) {
            const value = document.getElementById(field).value.trim();
            if (!value) {
                this.showToast('필수 항목을 모두 입력해주세요.', 'error');
                return;
            }
        }
        
        // 새 요청 생성
        const newRequest = {
            id: this.disposalRequests.length + 1,
            assetName: document.getElementById('assetSelect').selectedOptions[0].text,
            assetCode: `AST-${String(this.disposalRequests.length + 1).padStart(4, '0')}`,
            requester: '현재 사용자',
            department: 'IT팀',
            status: 'pending',
            reason: document.getElementById('disposalReason').value,
            priority: document.getElementById('disposalPriority').value,
            requestDate: new Date(),
            preferredDisposalDate: new Date(document.getElementById('preferredDisposalDate').value) || new Date(),
            description: document.getElementById('disposalDescription').value,
            progress: 10,
            estimatedValue: Math.floor(Math.random() * 5000000) + 100000,
            currentLocation: '본사 1층',
            approver: '승인 대기',
            timeline: [{
                status: 'pending',
                title: '폐기 요청',
                date: new Date(),
                completed: false,
                current: true,
                description: '폐기 요청이 제출되었습니다'
            }],
            attachments: []
        };
        
        this.disposalRequests.unshift(newRequest);
        this.applyFilters();
        this.updateStatistics();
        
        // 폼 리셋
        document.getElementById('disposalRequestForm').reset();
        document.querySelector('.attached-files')?.remove();
        
        // 모달 닫기
        bootstrap.Modal.getInstance(document.getElementById('disposalRequestModal')).hide();
        
        this.showToast('폐기 요청이 성공적으로 제출되었습니다.', 'success');
    }

    openScheduleModal() {
        const modal = new bootstrap.Modal(document.getElementById('scheduleModal'));
        modal.show();
        
        // 캘린더 초기화 (실제로는 FullCalendar 등의 라이브러리 사용)
        this.initializeCalendar();
    }

    initializeCalendar() {
        const calendarContainer = document.getElementById('disposalCalendar');
        const scheduledTasks = document.getElementById('scheduledTasks');
        
        // 간단한 캘린더 구현 (실제로는 라이브러리 사용 권장)
        calendarContainer.innerHTML = this.generateCalendarHTML();
        scheduledTasks.innerHTML = this.generateScheduledTasksHTML();
    }

    generateCalendarHTML() {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        let calendarHTML = `
            <div class="disposal-calendar">
                <div class="calendar-header">
                    <h5>${year}년 ${month + 1}월</h5>
                    <div class="calendar-nav">
                        <button class="btn btn-sm btn-outline-secondary">&lt;</button>
                        <button class="btn btn-sm btn-outline-secondary">&gt;</button>
                    </div>
                </div>
                <div class="calendar-grid">
                    <div class="calendar-day header">일</div>
                    <div class="calendar-day header">월</div>
                    <div class="calendar-day header">화</div>
                    <div class="calendar-day header">수</div>
                    <div class="calendar-day header">목</div>
                    <div class="calendar-day header">금</div>
                    <div class="calendar-day header">토</div>
        `;
        
        // 빈 칸 추가
        for (let i = 0; i < startingDayOfWeek; i++) {
            calendarHTML += '<div class="calendar-day other-month"></div>';
        }
        
        // 날짜 추가
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const hasDisposal = Math.random() < 0.3; // 30% 확률로 폐기 일정 있음
            
            calendarHTML += `
                <div class="calendar-day ${isToday ? 'today' : ''} ${hasDisposal ? 'has-disposal' : ''}">
                    ${day}
                    ${hasDisposal ? '<div class="disposal-count">2</div>' : ''}
                </div>
            `;
        }
        
        calendarHTML += '</div></div>';
        return calendarHTML;
    }

    generateScheduledTasksHTML() {
        const scheduledRequests = this.disposalRequests.filter(r => r.status === 'scheduled');
        
        if (scheduledRequests.length === 0) {
            return '<div class="text-muted text-center py-3">예정된 폐기 작업이 없습니다.</div>';
        }
        
        return scheduledRequests.map(request => `
            <div class="scheduled-task">
                <div class="task-header">
                    <div class="task-title">${request.assetName}</div>
                    <div class="task-time">${this.formatDate(request.preferredDisposalDate)}</div>
                </div>
                <div class="task-info">
                    ${request.department} | ${request.requester}
                </div>
            </div>
        `).join('');
    }

    saveScheduleChanges() {
        this.showToast('일정 변경사항이 저장되었습니다.', 'success');
        bootstrap.Modal.getInstance(document.getElementById('scheduleModal')).hide();
    }

    approveDisposal() {
        this.approveRequest(this.currentRequest.id);
    }

    scheduleDisposal(requestId) {
        const request = this.disposalRequests.find(r => r.id === requestId);
        if (!request) return;
        
        request.status = 'scheduled';
        request.progress = 50;
        
        this.applyFilters();
        this.updateStatistics();
        this.showToast('폐기 일정이 등록되었습니다.', 'success');
    }

    startDisposal(requestId) {
        const request = this.disposalRequests.find(r => r.id === requestId);
        if (!request) return;
        
        request.status = 'in_progress';
        request.progress = 80;
        
        this.applyFilters();
        this.updateStatistics();
        this.showToast('폐기 작업이 시작되었습니다.', 'success');
    }

    completeDisposal(requestId) {
        const request = this.disposalRequests.find(r => r.id === requestId);
        if (!request) return;
        
        request.status = 'completed';
        request.progress = 100;
        
        this.applyFilters();
        this.updateStatistics();
        this.showToast('폐기 작업이 완료되었습니다.', 'success');
    }
}

// 전역 함수들
function refreshDisposalData() {
    disposalManager.refreshDisposalData();
}

function openDisposalRequestModal() {
    const modal = new bootstrap.Modal(document.getElementById('disposalRequestModal'));
    modal.show();
}

function applyDisposalFilters() {
    disposalManager.applyFilters();
}

function toggleSelectAll(tabName) {
    disposalManager.toggleSelectAll(tabName);
}

function bulkApprove() {
    disposalManager.bulkApprove();
}

function bulkReject() {
    disposalManager.bulkReject();
}

function showRejectModal() {
    disposalManager.showRejectModal();
}

function approveDisposal() {
    disposalManager.approveDisposal();
}

function confirmDisposalApproval() {
    disposalManager.confirmDisposalApproval();
}

function confirmDisposalRejection() {
    disposalManager.confirmDisposalRejection();
}

function openScheduleModal() {
    disposalManager.openScheduleModal();
}

function saveScheduleChanges() {
    disposalManager.saveScheduleChanges();
}

// 페이지 로드 시 초기화
let disposalManager;
document.addEventListener('DOMContentLoaded', function() {
    disposalManager = new AssetDisposalPlanning();
}); 