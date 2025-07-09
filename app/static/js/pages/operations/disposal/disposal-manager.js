/**
 * Disposal Manager
 * 자산 폐기 관리를 담당하는 통합 모듈
 * 
 * 주요 기능:
 * 1. 폐기 신청 폼 관리
 * 2. 폐기 가능 자산 조회
 * 3. 폐기 승인 프로세스
 * 4. 폐기 이력 관리
 * 5. 대량 폐기 처리
 * 6. 폐기 사유 및 평가 관리
 */

export default class DisposalManager {
    constructor() {
        this.container = null;
        this.currentDisposal = null;
        this.assets = [];
        this.disposalRequests = [];
        this.cleanupFunctions = [];
        this.validationRules = this.getValidationRules();
        this.isInitialized = false;
        this.currentTab = 'request'; // request, approval, history
    }

    /**
     * 초기화
     */
    async initialize() {
        try {
            console.log('Disposal Manager 초기화 중...');
            
            this.container = document.getElementById('disposal-container');
            if (!this.container) {
                throw new Error('Disposal container를 찾을 수 없습니다.');
            }

            await this.render();
            this.setupEventListeners();
            await this.loadAssets();
            await this.loadDisposalRequests();
            
            this.isInitialized = true;
            console.log('Disposal Manager 초기화 완료');
            
        } catch (error) {
            console.error('Disposal Manager 초기화 오류:', error);
            throw error;
        }
    }

    /**
     * 폐기 관리 UI 렌더링
     */
    async render() {
        this.container.innerHTML = `
            <div class="disposal-management">
                <!-- 탭 네비게이션 -->
                <ul class="nav nav-tabs mb-4" id="disposal-tabs">
                    <li class="nav-item">
                        <button class="nav-link active" id="request-tab" data-tab="request">
                            <i class="bi bi-file-plus"></i> 폐기 신청
                        </button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link" id="approval-tab" data-tab="approval">
                            <i class="bi bi-check-circle"></i> 승인 관리
                            <span class="badge bg-warning ms-1" id="pending-count">0</span>
                        </button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link" id="history-tab" data-tab="history">
                            <i class="bi bi-clock-history"></i> 폐기 이력
                        </button>
                    </li>
                </ul>

                <!-- 폐기 신청 탭 -->
                <div id="request-content" class="tab-content">
                    <div class="row">
                        <!-- 자산 검색 및 선택 -->
                        <div class="col-md-7">
                            <div class="card">
                                <div class="card-header">
                                    <h6 class="mb-0">
                                        <i class="bi bi-search"></i> 폐기 대상 자산 선택
                                    </h6>
                                </div>
                                <div class="card-body">
                                    <!-- 검색 필터 -->
                                    <div class="row mb-3">
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label for="asset-search">자산 검색</label>
                                                <input type="text" class="form-control" id="asset-search" 
                                                       placeholder="자산명, 시리얼 번호로 검색">
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="form-group">
                                                <label for="category-filter">카테고리</label>
                                                <select class="form-select" id="category-filter">
                                                    <option value="">전체 카테고리</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="col-md-2">
                                            <div class="form-group">
                                                <label>&nbsp;</label>
                                                <div class="d-grid">
                                                    <button class="btn btn-primary btn-sm" id="search-assets">
                                                        <i class="bi bi-search"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- 자산 목록 -->
                                    <div class="asset-list-container" style="max-height: 400px; overflow-y: auto;">
                                        <div id="assets-loading" class="text-center py-4" style="display: none;">
                                            <div class="spinner-border text-primary" role="status">
                                                <span class="visually-hidden">로딩 중...</span>
                                            </div>
                                        </div>
                                        
                                        <div id="assets-list">
                                            <!-- 동적으로 생성 -->
                                        </div>

                                        <div id="assets-empty" class="text-center py-4" style="display: none;">
                                            <i class="bi bi-inbox text-muted"></i>
                                            <p class="text-muted mt-2">조건에 맞는 자산이 없습니다.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 폐기 신청 폼 -->
                        <div class="col-md-5">
                            <div class="card">
                                <div class="card-header">
                                    <h6 class="mb-0">
                                        <i class="bi bi-file-text"></i> 폐기 신청서
                                    </h6>
                                </div>
                                <div class="card-body">
                                    <form id="disposal-form">
                                        <!-- 선택된 자산 정보 -->
                                        <div id="selected-asset-info" style="display: none;">
                                            <div class="alert alert-info">
                                                <h6>선택된 자산</h6>
                                                <div id="selected-asset-details"></div>
                                            </div>
                                        </div>

                                        <!-- 폐기 정보 입력 -->
                                        <div class="mb-3">
                                            <label for="disposal-reason" class="form-label">폐기 사유 *</label>
                                            <select class="form-select" id="disposal-reason" required>
                                                <option value="">선택하세요</option>
                                                <option value="depreciation">감가상각 완료</option>
                                                <option value="malfunction">고장/오작동</option>
                                                <option value="obsolete">기술적 노후화</option>
                                                <option value="damage">물리적 손상</option>
                                                <option value="replacement">교체</option>
                                                <option value="policy">정책적 사유</option>
                                                <option value="other">기타</option>
                                            </select>
                                        </div>

                                        <div class="mb-3" id="other-reason-group" style="display: none;">
                                            <label for="other-reason" class="form-label">기타 사유 상세 *</label>
                                            <textarea class="form-control" id="other-reason" rows="2" 
                                                    placeholder="기타 사유를 상세히 입력하세요"></textarea>
                                        </div>

                                        <div class="row">
                                            <div class="col-md-6">
                                                <div class="mb-3">
                                                    <label for="disposal-date" class="form-label">폐기 예정일 *</label>
                                                    <input type="date" class="form-control" id="disposal-date" required>
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="mb-3">
                                                    <label for="disposal-method" class="form-label">폐기 방법 *</label>
                                                    <select class="form-select" id="disposal-method" required>
                                                        <option value="">선택하세요</option>
                                                        <option value="recycle">재활용</option>
                                                        <option value="sell">매각</option>
                                                        <option value="donate">기부</option>
                                                        <option value="destroy">폐기</option>
                                                        <option value="return">반납</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="mb-3">
                                            <label for="estimated-value" class="form-label">추정 잔존 가치</label>
                                            <div class="input-group">
                                                <span class="input-group-text">₩</span>
                                                <input type="number" class="form-control" id="estimated-value" 
                                                       placeholder="0">
                                            </div>
                                        </div>

                                        <div class="mb-3">
                                            <label for="disposal-notes" class="form-label">상세 설명</label>
                                            <textarea class="form-control" id="disposal-notes" rows="4" 
                                                    placeholder="폐기 사유, 상태, 특이사항 등을 상세히 입력하세요"></textarea>
                                        </div>

                                        <div class="mb-3">
                                            <label class="form-label">첨부 파일</label>
                                            <input type="file" class="form-control" id="disposal-files" 
                                                   multiple accept="image/*,.pdf,.doc,.docx">
                                            <div class="form-text">
                                                자산 상태 사진, 관련 문서 등을 첨부하세요. (최대 10MB)
                                            </div>
                                        </div>

                                        <div class="d-grid gap-2">
                                            <button type="submit" class="btn btn-danger" id="submit-disposal" disabled>
                                                <i class="bi bi-file-plus"></i> 폐기 신청
                                            </button>
                                            <button type="button" class="btn btn-outline-secondary" id="reset-form">
                                                <i class="bi bi-arrow-clockwise"></i> 초기화
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 승인 관리 탭 -->
                <div id="approval-content" class="tab-content" style="display: none;">
                    <div class="card">
                        <div class="card-header">
                            <div class="d-flex justify-content-between align-items-center">
                                <h6 class="mb-0">
                                    <i class="bi bi-check-circle"></i> 폐기 승인 대기 목록
                                </h6>
                                <div>
                                    <button class="btn btn-outline-primary btn-sm" id="bulk-approve">
                                        <i class="bi bi-check-all"></i> 일괄 승인
                                    </button>
                                    <button class="btn btn-outline-secondary btn-sm" id="refresh-requests">
                                        <i class="bi bi-arrow-clockwise"></i> 새로고침
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-hover" id="approval-requests-table">
                                    <thead class="table-light">
                                        <tr>
                                            <th>
                                                <input type="checkbox" id="select-all-requests" class="form-check-input">
                                            </th>
                                            <th>자산명</th>
                                            <th>신청자</th>
                                            <th>폐기 사유</th>
                                            <th>신청일</th>
                                            <th>예정일</th>
                                            <th>추정가치</th>
                                            <th>상태</th>
                                            <th>작업</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <!-- 동적으로 생성 -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 폐기 이력 탭 -->
                <div id="history-content" class="tab-content" style="display: none;">
                    <div class="card">
                        <div class="card-header">
                            <div class="d-flex justify-content-between align-items-center">
                                <h6 class="mb-0">
                                    <i class="bi bi-clock-history"></i> 폐기 이력
                                </h6>
                                <div>
                                    <button class="btn btn-outline-success btn-sm" id="export-history">
                                        <i class="bi bi-download"></i> 이력 내보내기
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="card-body">
                            <!-- 필터 -->
                            <div class="row mb-3">
                                <div class="col-md-3">
                                    <select class="form-select" id="history-status-filter">
                                        <option value="">전체 상태</option>
                                        <option value="approved">승인됨</option>
                                        <option value="rejected">거부됨</option>
                                        <option value="completed">완료됨</option>
                                    </select>
                                </div>
                                <div class="col-md-3">
                                    <input type="date" class="form-control" id="history-date-from" 
                                           placeholder="시작일">
                                </div>
                                <div class="col-md-3">
                                    <input type="date" class="form-control" id="history-date-to" 
                                           placeholder="종료일">
                                </div>
                                <div class="col-md-3">
                                    <button class="btn btn-primary" id="filter-history">
                                        <i class="bi bi-funnel"></i> 필터 적용
                                    </button>
                                </div>
                            </div>

                            <div class="table-responsive">
                                <table class="table table-hover" id="disposal-history-table">
                                    <thead class="table-light">
                                        <tr>
                                            <th>자산명</th>
                                            <th>신청자</th>
                                            <th>폐기 사유</th>
                                            <th>신청일</th>
                                            <th>처리일</th>
                                            <th>방법</th>
                                            <th>상태</th>
                                            <th>상세</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <!-- 동적으로 생성 -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 승인/거부 모달 -->
                <div class="modal fade" id="approval-modal" tabindex="-1">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">폐기 신청 검토</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <div id="approval-request-details">
                                    <!-- 동적으로 생성 -->
                                </div>
                                
                                <div class="mt-4">
                                    <label for="approval-notes" class="form-label">검토 의견</label>
                                    <textarea class="form-control" id="approval-notes" rows="3" 
                                            placeholder="승인/거부 사유나 추가 의견을 입력하세요"></textarea>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">취소</button>
                                <button type="button" class="btn btn-danger" id="reject-request">
                                    <i class="bi bi-x-circle"></i> 거부
                                </button>
                                <button type="button" class="btn btn-success" id="approve-request">
                                    <i class="bi bi-check-circle"></i> 승인
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 탭 전환
        const tabButtons = document.querySelectorAll('#disposal-tabs button[data-tab]');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // 자산 검색
        document.getElementById('search-assets').addEventListener('click', () => {
            this.searchAssets();
        });

        document.getElementById('asset-search').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchAssets();
        });

        // 카테고리 필터
        document.getElementById('category-filter').addEventListener('change', () => {
            this.searchAssets();
        });

        // 폐기 사유 변경 시 기타 사유 입력 토글
        document.getElementById('disposal-reason').addEventListener('change', () => {
            this.toggleOtherReason();
        });

        // 폐기 신청 폼 제출
        document.getElementById('disposal-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitDisposalRequest();
        });

        // 폼 초기화
        document.getElementById('reset-form').addEventListener('click', () => {
            this.resetForm();
        });

        // 승인 관련 이벤트
        document.getElementById('bulk-approve').addEventListener('click', () => {
            this.bulkApproveRequests();
        });

        document.getElementById('refresh-requests').addEventListener('click', () => {
            this.loadDisposalRequests();
        });

        // 전체 선택
        document.getElementById('select-all-requests').addEventListener('change', (e) => {
            this.toggleAllRequestSelection(e.target.checked);
        });

        // 이력 필터
        document.getElementById('filter-history').addEventListener('click', () => {
            this.filterHistory();
        });

        // 이력 내보내기
        document.getElementById('export-history').addEventListener('click', () => {
            this.exportHistory();
        });

        // 승인/거부 모달 이벤트
        document.getElementById('approve-request').addEventListener('click', () => {
            this.processApproval(true);
        });

        document.getElementById('reject-request').addEventListener('click', () => {
            this.processApproval(false);
        });

        // 정리 함수 등록
        this.cleanupFunctions.push(
            // 이벤트 리스너 정리 함수들...
        );
    }

    /**
     * 탭 전환
     */
    switchTab(tabName) {
        // 모든 탭 비활성화
        document.querySelectorAll('#disposal-tabs .nav-link').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });

        // 선택된 탭 활성화
        document.getElementById(`${tabName}-tab`).classList.add('active');
        document.getElementById(`${tabName}-content`).style.display = 'block';

        this.currentTab = tabName;

        // 탭별 데이터 로드
        switch (tabName) {
            case 'approval':
                this.loadDisposalRequests();
                break;
            case 'history':
                this.loadDisposalHistory();
                break;
        }
    }

    /**
     * 자산 목록 로드
     */
    async loadAssets() {
        try {
            this.showAssetsLoading();
            
            const response = await fetch('/api/assets/available-for-disposal', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            this.assets = data.assets || [];
            
            this.renderAssetsList();
            await this.loadCategories();
            
        } catch (error) {
            console.error('자산 로드 오류:', error);
            this.showError('자산 목록을 불러오는데 실패했습니다.');
        } finally {
            this.hideAssetsLoading();
        }
    }

    /**
     * 자산 목록 렌더링
     */
    renderAssetsList() {
        const container = document.getElementById('assets-list');
        
        if (this.assets.length === 0) {
            document.getElementById('assets-empty').style.display = 'block';
            container.innerHTML = '';
            return;
        }

        document.getElementById('assets-empty').style.display = 'none';
        
        container.innerHTML = this.assets.map(asset => `
            <div class="asset-item p-3 border rounded mb-2 cursor-pointer" 
                 data-asset-id="${asset.id}" onclick="disposalManager.selectAsset(${asset.id})">
                <div class="d-flex align-items-center">
                    ${asset.image_url ? 
                        `<img src="${asset.image_url}" class="asset-thumbnail me-3" 
                             style="width: 50px; height: 50px; object-fit: cover;">` : 
                        '<div class="asset-placeholder me-3"></div>'
                    }
                    <div class="flex-grow-1">
                        <h6 class="mb-1">${asset.name}</h6>
                        <p class="mb-1 text-muted small">${asset.description || '설명 없음'}</p>
                        <div class="d-flex align-items-center">
                            <span class="badge bg-secondary me-2">${asset.category_name}</span>
                            <code class="small">${asset.serial_number}</code>
                        </div>
                    </div>
                    <div class="text-end">
                        <div class="small text-muted">구매일: ${this.formatDate(asset.purchase_date)}</div>
                        <div class="small text-muted">상태: ${asset.status}</div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * 자산 선택
     */
    selectAsset(assetId) {
        // 이전 선택 해제
        document.querySelectorAll('.asset-item').forEach(item => {
            item.classList.remove('border-primary', 'bg-light');
        });

        // 새 선택 적용
        const selectedItem = document.querySelector(`[data-asset-id="${assetId}"]`);
        selectedItem.classList.add('border-primary', 'bg-light');

        const asset = this.assets.find(a => a.id === assetId);
        if (!asset) return;

        // 선택된 자산 정보 표시
        const infoContainer = document.getElementById('selected-asset-info');
        const detailsContainer = document.getElementById('selected-asset-details');
        
        detailsContainer.innerHTML = `
            <div class="row">
                <div class="col-md-8">
                    <strong>${asset.name}</strong><br>
                    <small class="text-muted">${asset.description || '설명 없음'}</small><br>
                    <code>${asset.serial_number}</code>
                </div>
                <div class="col-md-4 text-end">
                    <span class="badge bg-secondary">${asset.category_name}</span><br>
                    <small class="text-muted">구매일: ${this.formatDate(asset.purchase_date)}</small>
                </div>
            </div>
        `;
        
        infoContainer.style.display = 'block';
        
        // 폐기 신청 버튼 활성화
        document.getElementById('submit-disposal').disabled = false;
        
        // 현재 선택된 자산 저장
        this.currentDisposal = { asset };
    }

    /**
     * 기타 사유 입력 토글
     */
    toggleOtherReason() {
        const reason = document.getElementById('disposal-reason').value;
        const otherGroup = document.getElementById('other-reason-group');
        
        if (reason === 'other') {
            otherGroup.style.display = 'block';
            document.getElementById('other-reason').required = true;
        } else {
            otherGroup.style.display = 'none';
            document.getElementById('other-reason').required = false;
        }
    }

    /**
     * 폐기 신청 제출
     */
    async submitDisposalRequest() {
        try {
            if (!this.validateDisposalForm()) {
                return;
            }

            const formData = this.getDisposalFormData();
            
            const response = await fetch('/api/disposals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            this.showSuccess('폐기 신청이 성공적으로 제출되었습니다.');
            this.resetForm();
            await this.loadAssets(); // 목록 새로고침
            
        } catch (error) {
            console.error('폐기 신청 제출 오류:', error);
            this.showError('폐기 신청 제출 중 오류가 발생했습니다.');
        }
    }

    /**
     * 폐기 신청 폼 검증
     */
    validateDisposalForm() {
        if (!this.currentDisposal || !this.currentDisposal.asset) {
            this.showError('폐기할 자산을 선택해주세요.');
            return false;
        }

        const reason = document.getElementById('disposal-reason').value;
        if (!reason) {
            this.showError('폐기 사유를 선택해주세요.');
            return false;
        }

        if (reason === 'other') {
            const otherReason = document.getElementById('other-reason').value.trim();
            if (!otherReason) {
                this.showError('기타 사유를 입력해주세요.');
                return false;
            }
        }

        const disposalDate = document.getElementById('disposal-date').value;
        if (!disposalDate) {
            this.showError('폐기 예정일을 입력해주세요.');
            return false;
        }

        const method = document.getElementById('disposal-method').value;
        if (!method) {
            this.showError('폐기 방법을 선택해주세요.');
            return false;
        }

        return true;
    }

    /**
     * 폐기 신청 폼 데이터 수집
     */
    getDisposalFormData() {
        const reason = document.getElementById('disposal-reason').value;
        
        const data = {
            asset_id: this.currentDisposal.asset.id,
            reason: reason,
            other_reason: reason === 'other' ? document.getElementById('other-reason').value : null,
            disposal_date: document.getElementById('disposal-date').value,
            method: document.getElementById('disposal-method').value,
            estimated_value: document.getElementById('estimated-value').value || 0,
            notes: document.getElementById('disposal-notes').value
        };

        return data;
    }

    /**
     * 폼 초기화
     */
    resetForm() {
        document.getElementById('disposal-form').reset();
        document.getElementById('selected-asset-info').style.display = 'none';
        document.getElementById('other-reason-group').style.display = 'none';
        document.getElementById('submit-disposal').disabled = true;
        
        // 자산 선택 해제
        document.querySelectorAll('.asset-item').forEach(item => {
            item.classList.remove('border-primary', 'bg-light');
        });
        
        this.currentDisposal = null;
    }

    /**
     * 자산 검색
     */
    async searchAssets() {
        const searchTerm = document.getElementById('asset-search').value.trim();
        const categoryId = document.getElementById('category-filter').value;
        
        try {
            this.showAssetsLoading();
            
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (categoryId) params.append('category', categoryId);
            
            const response = await fetch(`/api/assets/available-for-disposal?${params}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            this.assets = data.assets || [];
            this.renderAssetsList();
            
        } catch (error) {
            console.error('자산 검색 오류:', error);
            this.showError('자산 검색 중 오류가 발생했습니다.');
        } finally {
            this.hideAssetsLoading();
        }
    }

    /**
     * 카테고리 목록 로드
     */
    async loadCategories() {
        try {
            const response = await fetch('/api/categories', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) return;

            const data = await response.json();
            const categorySelect = document.getElementById('category-filter');
            
            data.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
            
        } catch (error) {
            console.error('카테고리 로드 오류:', error);
        }
    }

    /**
     * 폐기 요청 목록 로드
     */
    async loadDisposalRequests() {
        try {
            const response = await fetch('/api/disposals/requests', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            this.disposalRequests = data.requests || [];
            
            this.renderApprovalTable();
            this.updatePendingCount();
            
        } catch (error) {
            console.error('폐기 요청 로드 오류:', error);
            this.showError('폐기 요청 목록을 불러오는데 실패했습니다.');
        }
    }

    /**
     * 승인 테이블 렌더링
     */
    renderApprovalTable() {
        const tbody = document.querySelector('#approval-requests-table tbody');
        const pendingRequests = this.disposalRequests.filter(req => req.status === 'pending');
        
        tbody.innerHTML = pendingRequests.map(request => `
            <tr data-request-id="${request.id}">
                <td>
                    <input type="checkbox" class="form-check-input request-checkbox" 
                           value="${request.id}">
                </td>
                <td>
                    <div>
                        <strong>${request.asset_name}</strong><br>
                        <small class="text-muted">${request.serial_number}</small>
                    </div>
                </td>
                <td>${request.requester_name}</td>
                <td>
                    <span class="badge bg-info">${this.getReasonText(request.reason)}</span>
                </td>
                <td>${this.formatDate(request.created_at)}</td>
                <td>${this.formatDate(request.disposal_date)}</td>
                <td>₩${request.estimated_value.toLocaleString()}</td>
                <td>
                    <span class="badge bg-warning">대기중</span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" 
                                onclick="disposalManager.showApprovalModal(${request.id})">
                            <i class="bi bi-eye"></i> 검토
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    /**
     * 대기 중인 요청 수 업데이트
     */
    updatePendingCount() {
        const pendingCount = this.disposalRequests.filter(req => req.status === 'pending').length;
        document.getElementById('pending-count').textContent = pendingCount;
    }

    /**
     * 유틸리티 메서드들
     */
    formatDate(dateString) {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('ko-KR');
    }

    getReasonText(reason) {
        const reasons = {
            depreciation: '감가상각',
            malfunction: '고장',
            obsolete: '노후화',
            damage: '손상',
            replacement: '교체',
            policy: '정책',
            other: '기타'
        };
        return reasons[reason] || reason;
    }

    showAssetsLoading() {
        document.getElementById('assets-loading').style.display = 'block';
        document.getElementById('assets-list').style.display = 'none';
    }

    hideAssetsLoading() {
        document.getElementById('assets-loading').style.display = 'none';
        document.getElementById('assets-list').style.display = 'block';
    }

    showSuccess(message) {
        console.log(`[SUCCESS] ${message}`);
    }

    showError(message) {
        console.log(`[ERROR] ${message}`);
    }

    /**
     * 승인 모달 표시
     */
    showApprovalModal(requestId) {
        // 승인 모달 구현
    }

    /**
     * 승인 처리
     */
    async processApproval(isApproved) {
        // 승인/거부 처리 구현
    }

    /**
     * 일괄 승인
     */
    async bulkApproveRequests() {
        // 일괄 승인 구현
    }

    /**
     * 전체 요청 선택
     */
    toggleAllRequestSelection(checked) {
        const checkboxes = document.querySelectorAll('.request-checkbox');
        checkboxes.forEach(cb => cb.checked = checked);
    }

    /**
     * 이력 로드
     */
    async loadDisposalHistory() {
        // 이력 로드 구현
    }

    /**
     * 이력 필터링
     */
    filterHistory() {
        // 이력 필터링 구현
    }

    /**
     * 이력 내보내기
     */
    exportHistory() {
        // 이력 내보내기 구현
    }

    /**
     * 검증 규칙 정의
     */
    getValidationRules() {
        return {
            asset_id: { required: true, type: 'number' },
            reason: { required: true, enum: ['depreciation', 'malfunction', 'obsolete', 'damage', 'replacement', 'policy', 'other'] },
            disposal_date: { required: true, type: 'date' },
            method: { required: true, enum: ['recycle', 'sell', 'donate', 'destroy', 'return'] }
        };
    }

    /**
     * 정리
     */
    cleanup() {
        this.cleanupFunctions.forEach(fn => fn());
        this.cleanupFunctions = [];
        this.isInitialized = false;
    }

    /**
     * 상태 확인
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            currentTab: this.currentTab,
            assetsCount: this.assets.length,
            pendingRequestsCount: this.disposalRequests.filter(req => req.status === 'pending').length
        };
    }
}

// 전역 인스턴스 생성 (레거시 호환성)
window.disposalManager = new DisposalManager(); 