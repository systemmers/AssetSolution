/**
 * Return Manager
 * 자산 반납 관리를 담당하는 통합 모듈
 * 
 * 주요 기능:
 * 1. 반납 폼 관리
 * 2. 반납 가능한 자산 조회
 * 3. 반납 처리 및 검증
 * 4. 반납 이력 관리
 * 5. 대량 반납 처리
 */

export default class ReturnManager {
    constructor() {
        this.container = null;
        this.currentReturn = null;
        this.loanedAssets = [];
        this.cleanupFunctions = [];
        this.validationRules = this.getValidationRules();
        this.isInitialized = false;
    }

    /**
     * 초기화
     */
    async initialize() {
        try {
            console.log('Return Manager 초기화 중...');
            
            this.container = document.getElementById('return-container');
            if (!this.container) {
                throw new Error('Return container를 찾을 수 없습니다.');
            }

            await this.render();
            this.setupEventListeners();
            await this.loadLoanedAssets();
            
            this.isInitialized = true;
            console.log('Return Manager 초기화 완료');
            
        } catch (error) {
            console.error('Return Manager 초기화 오류:', error);
            throw error;
        }
    }

    /**
     * 반납 관리 UI 렌더링
     */
    async render() {
        this.container.innerHTML = `
            <div class="return-management">
                <!-- 반납 검색 및 필터 -->
                <div class="search-section mb-4">
                    <div class="row">
                        <div class="col-md-4">
                            <div class="form-group">
                                <label for="asset-search">자산 검색</label>
                                <div class="input-group">
                                    <input type="text" class="form-control" id="asset-search" 
                                           placeholder="자산명, 시리얼 번호, 대출자명으로 검색">
                                    <button class="btn btn-outline-secondary" type="button" id="clear-search">
                                        <i class="bi bi-x"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="form-group">
                                <label for="category-filter">카테고리</label>
                                <select class="form-select" id="category-filter">
                                    <option value="">전체 카테고리</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="form-group">
                                <label for="overdue-filter">연체 상태</label>
                                <select class="form-select" id="overdue-filter">
                                    <option value="">전체</option>
                                    <option value="normal">정상</option>
                                    <option value="overdue">연체</option>
                                    <option value="warning">경고</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <div class="form-group">
                                <label>&nbsp;</label>
                                <div class="d-grid">
                                    <button class="btn btn-primary" id="search-assets">
                                        <i class="bi bi-search"></i> 검색
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 대출 중인 자산 목록 -->
                <div class="assets-section">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5>대출 중인 자산 목록</h5>
                        <div>
                            <button class="btn btn-outline-primary btn-sm" id="bulk-return">
                                <i class="bi bi-arrow-return-left"></i> 일괄 반납
                            </button>
                            <button class="btn btn-outline-secondary btn-sm" id="refresh-list">
                                <i class="bi bi-arrow-clockwise"></i> 새로고침
                            </button>
                        </div>
                    </div>

                    <!-- 자산 목록 테이블 -->
                    <div class="table-responsive">
                        <table class="table table-hover" id="loaned-assets-table">
                            <thead class="table-light">
                                <tr>
                                    <th>
                                        <input type="checkbox" id="select-all" class="form-check-input">
                                    </th>
                                    <th>자산명</th>
                                    <th>시리얼 번호</th>
                                    <th>카테고리</th>
                                    <th>대출자</th>
                                    <th>대출일</th>
                                    <th>반납예정일</th>
                                    <th>상태</th>
                                    <th>작업</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- 동적으로 생성 -->
                            </tbody>
                        </table>
                    </div>

                    <!-- 로딩 인디케이터 -->
                    <div id="assets-loading" class="text-center py-4" style="display: none;">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">로딩 중...</span>
                        </div>
                        <p class="mt-2">자산 목록을 불러오는 중...</p>
                    </div>

                    <!-- 빈 상태 -->
                    <div id="empty-state" class="text-center py-5" style="display: none;">
                        <i class="bi bi-inbox display-1 text-muted"></i>
                        <h5 class="mt-3">대출 중인 자산이 없습니다</h5>
                        <p class="text-muted">현재 반납 가능한 자산이 없습니다.</p>
                    </div>
                </div>

                <!-- 반납 처리 모달 -->
                <div class="modal fade" id="return-modal" tabindex="-1">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">자산 반납 처리</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <form id="return-form">
                                    <!-- 자산 정보 -->
                                    <div class="asset-info mb-4">
                                        <h6>반납 자산 정보</h6>
                                        <div class="row">
                                            <div class="col-md-6">
                                                <p><strong>자산명:</strong> <span id="modal-asset-name"></span></p>
                                                <p><strong>시리얼 번호:</strong> <span id="modal-serial"></span></p>
                                            </div>
                                            <div class="col-md-6">
                                                <p><strong>대출자:</strong> <span id="modal-borrower"></span></p>
                                                <p><strong>대출일:</strong> <span id="modal-loan-date"></span></p>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- 반납 정보 입력 -->
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label for="return-date" class="form-label">반납일 *</label>
                                                <input type="date" class="form-control" id="return-date" required>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label for="return-condition" class="form-label">자산 상태 *</label>
                                                <select class="form-select" id="return-condition" required>
                                                    <option value="">선택하세요</option>
                                                    <option value="excellent">매우 좋음</option>
                                                    <option value="good">좋음</option>
                                                    <option value="fair">보통</option>
                                                    <option value="poor">불량</option>
                                                    <option value="damaged">손상됨</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="mb-3">
                                        <label for="return-notes" class="form-label">반납 메모</label>
                                        <textarea class="form-control" id="return-notes" rows="3" 
                                                placeholder="반납 시 특이사항이나 메모를 입력하세요"></textarea>
                                    </div>

                                    <!-- 손상 상세 정보 (조건부 표시) -->
                                    <div id="damage-details" style="display: none;">
                                        <hr>
                                        <h6>손상 상세 정보</h6>
                                        <div class="mb-3">
                                            <label for="damage-description" class="form-label">손상 내용 *</label>
                                            <textarea class="form-control" id="damage-description" rows="3" 
                                                    placeholder="손상된 부분과 정도를 자세히 설명해주세요"></textarea>
                                        </div>
                                        <div class="mb-3">
                                            <label for="repair-cost" class="form-label">수리 비용 (예상)</label>
                                            <input type="number" class="form-control" id="repair-cost" 
                                                   placeholder="수리 예상 비용을 입력하세요">
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">취소</button>
                                <button type="button" class="btn btn-primary" id="process-return">
                                    <i class="bi bi-check-circle"></i> 반납 처리
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 일괄 반납 모달 -->
                <div class="modal fade" id="bulk-return-modal" tabindex="-1">
                    <div class="modal-dialog modal-xl">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">일괄 반납 처리</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <div id="bulk-return-content">
                                    <!-- 동적으로 생성 -->
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">취소</button>
                                <button type="button" class="btn btn-primary" id="process-bulk-return">
                                    <i class="bi bi-check-circle"></i> 일괄 반납 처리
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
        // 검색 기능
        const searchInput = document.getElementById('asset-search');
        const searchBtn = document.getElementById('search-assets');
        const clearBtn = document.getElementById('clear-search');

        const handleSearch = () => this.searchAssets();
        searchBtn.addEventListener('click', handleSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
        clearBtn.addEventListener('click', () => this.clearSearch());

        // 필터 변경
        const filters = ['category-filter', 'overdue-filter'];
        filters.forEach(filterId => {
            const filter = document.getElementById(filterId);
            filter.addEventListener('change', () => this.applyFilters());
        });

        // 새로고침
        document.getElementById('refresh-list').addEventListener('click', () => {
            this.loadLoanedAssets();
        });

        // 전체 선택
        document.getElementById('select-all').addEventListener('change', (e) => {
            this.toggleAllSelection(e.target.checked);
        });

        // 일괄 반납
        document.getElementById('bulk-return').addEventListener('click', () => {
            this.showBulkReturnModal();
        });

        // 반납 상태 변경 시 손상 상세 표시/숨김
        const conditionSelect = document.getElementById('return-condition');
        conditionSelect.addEventListener('change', () => {
            this.toggleDamageDetails();
        });

        // 반납 처리
        document.getElementById('process-return').addEventListener('click', () => {
            this.processReturn();
        });

        // 일괄 반납 처리
        document.getElementById('process-bulk-return').addEventListener('click', () => {
            this.processBulkReturn();
        });

        // 정리 함수 등록
        this.cleanupFunctions.push(
            () => searchBtn.removeEventListener('click', handleSearch),
            () => clearBtn.removeEventListener('click', this.clearSearch),
            // 기타 이벤트 리스너들...
        );
    }

    /**
     * 대출 중인 자산 목록 로드
     */
    async loadLoanedAssets() {
        try {
            this.showLoading();
            
            const response = await fetch('/api/assets/loaned', {
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
            this.loanedAssets = data.assets || [];
            
            this.renderAssetsTable();
            await this.loadCategories();
            
        } catch (error) {
            console.error('대출 자산 로드 오류:', error);
            this.showError('대출 중인 자산 목록을 불러오는데 실패했습니다.');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * 자산 목록 테이블 렌더링
     */
    renderAssetsTable() {
        const tbody = document.querySelector('#loaned-assets-table tbody');
        
        if (this.loanedAssets.length === 0) {
            this.showEmptyState();
            return;
        }

        this.hideEmptyState();
        
        tbody.innerHTML = this.loanedAssets.map(asset => {
            const overdueStatus = this.getOverdueStatus(asset.return_date);
            const statusBadge = this.getStatusBadge(overdueStatus);
            
            return `
                <tr data-asset-id="${asset.id}">
                    <td>
                        <input type="checkbox" class="form-check-input asset-checkbox" 
                               value="${asset.id}">
                    </td>
                    <td>
                        <div class="d-flex align-items-center">
                            ${asset.image_url ? 
                                `<img src="${asset.image_url}" class="asset-thumbnail me-2" 
                                     style="width: 40px; height: 40px; object-fit: cover;">` : 
                                '<div class="asset-placeholder me-2"></div>'
                            }
                            <div>
                                <strong>${asset.name}</strong>
                                <br><small class="text-muted">${asset.description || ''}</small>
                            </div>
                        </div>
                    </td>
                    <td><code>${asset.serial_number}</code></td>
                    <td><span class="badge bg-secondary">${asset.category_name}</span></td>
                    <td>
                        <div>
                            <strong>${asset.borrower_name}</strong>
                            <br><small class="text-muted">${asset.borrower_email}</small>
                        </div>
                    </td>
                    <td>${this.formatDate(asset.loan_date)}</td>
                    <td>${this.formatDate(asset.return_date)}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-primary" 
                                    onclick="returnManager.showReturnModal(${asset.id})">
                                <i class="bi bi-arrow-return-left"></i> 반납
                            </button>
                            <button class="btn btn-outline-info" 
                                    onclick="returnManager.viewLoanDetails(${asset.id})">
                                <i class="bi bi-info-circle"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    /**
     * 연체 상태 확인
     */
    getOverdueStatus(returnDate) {
        const today = new Date();
        const dueDate = new Date(returnDate);
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'overdue';
        if (diffDays <= 3) return 'warning';
        return 'normal';
    }

    /**
     * 상태 배지 생성
     */
    getStatusBadge(status) {
        const badges = {
            normal: '<span class="badge bg-success">정상</span>',
            warning: '<span class="badge bg-warning">경고</span>',
            overdue: '<span class="badge bg-danger">연체</span>'
        };
        return badges[status] || badges.normal;
    }

    /**
     * 반납 모달 표시
     */
    showReturnModal(assetId) {
        const asset = this.loanedAssets.find(a => a.id === assetId);
        if (!asset) {
            this.showError('자산 정보를 찾을 수 없습니다.');
            return;
        }

        // 모달 정보 설정
        document.getElementById('modal-asset-name').textContent = asset.name;
        document.getElementById('modal-serial').textContent = asset.serial_number;
        document.getElementById('modal-borrower').textContent = asset.borrower_name;
        document.getElementById('modal-loan-date').textContent = this.formatDate(asset.loan_date);
        
        // 반납일 기본값 설정 (오늘)
        document.getElementById('return-date').value = new Date().toISOString().split('T')[0];
        
        // 폼 리셋
        document.getElementById('return-form').reset();
        document.getElementById('damage-details').style.display = 'none';

        this.currentReturn = { assetId, asset };
        
        const modal = new bootstrap.Modal(document.getElementById('return-modal'));
        modal.show();
    }

    /**
     * 손상 상세 정보 토글
     */
    toggleDamageDetails() {
        const condition = document.getElementById('return-condition').value;
        const damageDetails = document.getElementById('damage-details');
        
        if (condition === 'poor' || condition === 'damaged') {
            damageDetails.style.display = 'block';
            document.getElementById('damage-description').required = true;
        } else {
            damageDetails.style.display = 'none';
            document.getElementById('damage-description').required = false;
        }
    }

    /**
     * 반납 처리
     */
    async processReturn() {
        try {
            if (!this.validateReturnForm()) {
                return;
            }

            const formData = this.getReturnFormData();
            
            const response = await fetch(`/api/assets/${this.currentReturn.assetId}/return`, {
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
            
            this.showSuccess('자산이 성공적으로 반납되었습니다.');
            
            // 모달 닫기
            const modal = bootstrap.Modal.getInstance(document.getElementById('return-modal'));
            modal.hide();
            
            // 목록 새로고침
            await this.loadLoanedAssets();
            
        } catch (error) {
            console.error('반납 처리 오류:', error);
            this.showError('반납 처리 중 오류가 발생했습니다.');
        }
    }

    /**
     * 반납 폼 검증
     */
    validateReturnForm() {
        const returnDate = document.getElementById('return-date').value;
        const condition = document.getElementById('return-condition').value;
        
        if (!returnDate) {
            this.showError('반납일을 입력해주세요.');
            return false;
        }
        
        if (!condition) {
            this.showError('자산 상태를 선택해주세요.');
            return false;
        }

        // 반납일이 대출일보다 이전인지 확인
        const loanDate = new Date(this.currentReturn.asset.loan_date);
        const returnDateObj = new Date(returnDate);
        
        if (returnDateObj < loanDate) {
            this.showError('반납일은 대출일보다 이후여야 합니다.');
            return false;
        }

        // 손상 상태 시 상세 정보 확인
        if ((condition === 'poor' || condition === 'damaged')) {
            const damageDescription = document.getElementById('damage-description').value;
            if (!damageDescription.trim()) {
                this.showError('손상 내용을 입력해주세요.');
                return false;
            }
        }

        return true;
    }

    /**
     * 반납 폼 데이터 수집
     */
    getReturnFormData() {
        const condition = document.getElementById('return-condition').value;
        
        const data = {
            return_date: document.getElementById('return-date').value,
            condition: condition,
            notes: document.getElementById('return-notes').value
        };

        // 손상 정보 추가
        if (condition === 'poor' || condition === 'damaged') {
            data.damage_description = document.getElementById('damage-description').value;
            data.repair_cost = document.getElementById('repair-cost').value;
        }

        return data;
    }

    /**
     * 일괄 반납 모달 표시
     */
    showBulkReturnModal() {
        const selectedAssets = this.getSelectedAssets();
        
        if (selectedAssets.length === 0) {
            this.showError('반납할 자산을 선택해주세요.');
            return;
        }

        this.renderBulkReturnModal(selectedAssets);
        
        const modal = new bootstrap.Modal(document.getElementById('bulk-return-modal'));
        modal.show();
    }

    /**
     * 선택된 자산 목록 반환
     */
    getSelectedAssets() {
        const checkboxes = document.querySelectorAll('.asset-checkbox:checked');
        return Array.from(checkboxes).map(cb => {
            const assetId = parseInt(cb.value);
            return this.loanedAssets.find(asset => asset.id === assetId);
        }).filter(asset => asset);
    }

    /**
     * 일괄 반납 모달 렌더링
     */
    renderBulkReturnModal(selectedAssets) {
        const content = document.getElementById('bulk-return-content');
        
        content.innerHTML = `
            <div class="mb-3">
                <h6>선택된 자산 (${selectedAssets.length}개)</h6>
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>자산명</th>
                                <th>대출자</th>
                                <th>반납예정일</th>
                                <th>상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${selectedAssets.map(asset => `
                                <tr>
                                    <td>${asset.name}</td>
                                    <td>${asset.borrower_name}</td>
                                    <td>${this.formatDate(asset.return_date)}</td>
                                    <td>${this.getStatusBadge(this.getOverdueStatus(asset.return_date))}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="bulk-return-date" class="form-label">일괄 반납일 *</label>
                        <input type="date" class="form-control" id="bulk-return-date" 
                               value="${new Date().toISOString().split('T')[0]}" required>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="bulk-condition" class="form-label">기본 자산 상태 *</label>
                        <select class="form-select" id="bulk-condition" required>
                            <option value="">선택하세요</option>
                            <option value="excellent">매우 좋음</option>
                            <option value="good" selected>좋음</option>
                            <option value="fair">보통</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="mb-3">
                <label for="bulk-notes" class="form-label">일괄 반납 메모</label>
                <textarea class="form-control" id="bulk-notes" rows="3" 
                        placeholder="일괄 반납에 대한 메모를 입력하세요"></textarea>
            </div>
        `;
    }

    /**
     * 일괄 반납 처리
     */
    async processBulkReturn() {
        try {
            const selectedAssets = this.getSelectedAssets();
            const returnDate = document.getElementById('bulk-return-date').value;
            const condition = document.getElementById('bulk-condition').value;
            const notes = document.getElementById('bulk-notes').value;

            if (!returnDate || !condition) {
                this.showError('필수 항목을 모두 입력해주세요.');
                return;
            }

            const bulkData = {
                asset_ids: selectedAssets.map(asset => asset.id),
                return_date: returnDate,
                condition: condition,
                notes: notes
            };

            const response = await fetch('/api/assets/bulk-return', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(bulkData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            this.showSuccess(`${selectedAssets.length}개 자산이 성공적으로 반납되었습니다.`);
            
            // 모달 닫기
            const modal = bootstrap.Modal.getInstance(document.getElementById('bulk-return-modal'));
            modal.hide();
            
            // 목록 새로고침
            await this.loadLoanedAssets();
            
        } catch (error) {
            console.error('일괄 반납 처리 오류:', error);
            this.showError('일괄 반납 처리 중 오류가 발생했습니다.');
        }
    }

    /**
     * 검색 기능
     */
    async searchAssets() {
        const searchTerm = document.getElementById('asset-search').value.trim();
        
        try {
            this.showLoading();
            
            const response = await fetch(`/api/assets/loaned/search?q=${encodeURIComponent(searchTerm)}`, {
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
            this.loanedAssets = data.assets || [];
            this.renderAssetsTable();
            
        } catch (error) {
            console.error('검색 오류:', error);
            this.showError('검색 중 오류가 발생했습니다.');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * 검색 초기화
     */
    clearSearch() {
        document.getElementById('asset-search').value = '';
        this.loadLoanedAssets();
    }

    /**
     * 필터 적용
     */
    applyFilters() {
        const categoryFilter = document.getElementById('category-filter').value;
        const overdueFilter = document.getElementById('overdue-filter').value;
        
        let filteredAssets = [...this.loanedAssets];
        
        if (categoryFilter) {
            filteredAssets = filteredAssets.filter(asset => 
                asset.category_id === parseInt(categoryFilter)
            );
        }
        
        if (overdueFilter) {
            filteredAssets = filteredAssets.filter(asset => {
                const status = this.getOverdueStatus(asset.return_date);
                return status === overdueFilter;
            });
        }
        
        // 임시로 필터된 결과를 표시
        const originalAssets = this.loanedAssets;
        this.loanedAssets = filteredAssets;
        this.renderAssetsTable();
        this.loanedAssets = originalAssets;
    }

    /**
     * 전체 선택/해제
     */
    toggleAllSelection(checked) {
        const checkboxes = document.querySelectorAll('.asset-checkbox');
        checkboxes.forEach(cb => cb.checked = checked);
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
     * 대출 상세 정보 보기
     */
    viewLoanDetails(assetId) {
        // 대출 상세 정보 모달 또는 페이지로 이동
        window.open(`/operations/loan/details/${assetId}`, '_blank');
    }

    /**
     * 유틸리티 메서드들
     */
    formatDate(dateString) {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('ko-KR');
    }

    showLoading() {
        document.getElementById('assets-loading').style.display = 'block';
        document.getElementById('loaned-assets-table').style.display = 'none';
        document.getElementById('empty-state').style.display = 'none';
    }

    hideLoading() {
        document.getElementById('assets-loading').style.display = 'none';
        document.getElementById('loaned-assets-table').style.display = 'table';
    }

    showEmptyState() {
        document.getElementById('empty-state').style.display = 'block';
        document.getElementById('loaned-assets-table').style.display = 'none';
    }

    hideEmptyState() {
        document.getElementById('empty-state').style.display = 'none';
        document.getElementById('loaned-assets-table').style.display = 'table';
    }

    showSuccess(message) {
        // 토스트 알림 또는 다른 성공 메시지 표시
        this.showNotification(message, 'success');
    }

    showError(message) {
        // 토스트 알림 또는 다른 오류 메시지 표시
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // 토스트 알림 시스템 (실제 구현 필요)
        console.log(`[${type.toUpperCase()}] ${message}`);
    }

    /**
     * 검증 규칙 정의
     */
    getValidationRules() {
        return {
            return_date: {
                required: true,
                type: 'date'
            },
            condition: {
                required: true,
                enum: ['excellent', 'good', 'fair', 'poor', 'damaged']
            },
            damage_description: {
                required: false,
                minLength: 10
            }
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
            loanedAssetsCount: this.loanedAssets.length,
            currentReturn: this.currentReturn ? this.currentReturn.assetId : null
        };
    }
}

// 전역 인스턴스 생성 (레거시 호환성)
window.returnManager = new ReturnManager(); 