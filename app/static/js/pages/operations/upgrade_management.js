/**
 * 업그레이드/교체 관리 모듈
 * 업그레이드 계획 대시보드 및 계획 수립 기능
 */

class UpgradeManagement {
    constructor() {
        this.selectedAssets = [];
        this.currentUpgradeType = null;
        this.charts = {};
        this.currentFilters = {
            status: '',
            type: '',
            department: '',
            search: ''
        };
        this.currentPage = 1;
        this.itemsPerPage = 10;
    }

    /**
     * 모듈 초기화
     */
    static init() {
        const instance = new UpgradeManagement();
        instance.bindEvents();
        instance.initializeFilters();
        instance.loadUpgradePlans();
        instance.applyDynamicStyles();
        return instance;
    }

    /**
     * 이벤트 바인딩
     */
    bindEvents() {
        // 업그레이드 유형 선택 이벤트
        document.querySelectorAll('input[name="upgradeType"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.handleUpgradeTypeChange(e.target.value);
            });
        });

        // 필터 이벤트
        const statusFilter = document.getElementById('statusFilter');
        const typeFilter = document.getElementById('typeFilter');
        const departmentFilter = document.getElementById('departmentFilter');

        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.applyFilters());
        }

        if (typeFilter) {
            typeFilter.addEventListener('change', () => this.applyFilters());
        }

        if (departmentFilter) {
            departmentFilter.addEventListener('input', () => this.applyFilters());
        }

        // 검색 이벤트
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');

        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch();
                }
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.handleSearch());
        }

        // 초기화 버튼
        const resetBtn = document.getElementById('resetFiltersBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetFilters());
        }

        // 계획 수립 모달 이벤트
        const planModal = document.getElementById('createUpgradePlanModal');
        if (planModal) {
            planModal.addEventListener('show.bs.modal', () => this.resetPlanForm());
        }

        // 계획 저장 버튼
        const savePlanBtn = document.getElementById('savePlanBtn');
        if (savePlanBtn) {
            savePlanBtn.addEventListener('click', () => this.savePlan());
        }

        // 자산 검색 이벤트
        const assetSearchBtn = document.getElementById('searchAssetBtn');
        const assetSearchInput = document.getElementById('assetSearch');

        if (assetSearchBtn) {
            assetSearchBtn.addEventListener('click', () => this.searchAssets());
        }

        if (assetSearchInput) {
            assetSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchAssets();
                }
            });
        }

        // 페이지네이션 이벤트
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('page-link')) {
                e.preventDefault();
                const page = parseInt(e.target.dataset.page);
                if (page && page !== this.currentPage) {
                    this.currentPage = page;
                    this.loadUpgradePlans();
                }
            }
        });
    }

    /**
     * 업그레이드 계획 목록 로드
     */
    async loadUpgradePlans() {
        try {
            const params = {
                page: this.currentPage,
                per_page: this.itemsPerPage,
                ...this.currentFilters
            };

            const response = await ApiUtils.get('/operations/api/upgrade-plans', params, {
                showLoader: true,
                loaderSelector: '.upgrade-plans-loader'
            });

            this.displayUpgradePlans(response.data || []);
            this.updatePagination(response.pagination || {});
            this.updateStatistics(response.statistics || {});

        } catch (error) {
            console.error('업그레이드 계획 로드 실패:', error);
            this.displayEmptyState('데이터를 불러오는 중 오류가 발생했습니다.');
        }
    }

    /**
     * 업그레이드 계획 목록 표시
     */
    displayUpgradePlans(plans) {
        const tbody = document.querySelector('#upgradePlansTable tbody');
        if (!tbody) return;

        if (plans.length === 0) {
            this.displayEmptyState();
            return;
        }

        const html = plans.map(plan => {
            const urgencyClass = this.getUrgencyClass(plan.days_until_deadline);
            const statusClass = this.getStatusClass(plan.status);
            const priorityClass = this.getPriorityClass(plan.priority);

            return `
                <tr class="upgrade-plan-row ${urgencyClass}" data-plan-id="${plan.id}">
                    <td>
                        <div class="d-flex align-items-center">
                            <div class="flex-grow-1">
                                <div class="fw-medium">${plan.asset_name}</div>
                                <small class="text-muted">${plan.asset_number}</small>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span class="badge upgrade-type-${plan.upgrade_type}">${plan.upgrade_type_display}</span>
                    </td>
                    <td>
                        <span class="badge priority-${plan.priority}">${plan.priority_display}</span>
                    </td>
                    <td>
                        <span class="badge status-${plan.status}">${plan.status_display}</span>
                    </td>
                    <td>${plan.department}</td>
                    <td>
                        <div class="d-flex align-items-center">
                            <div class="progress flex-grow-1 me-2" style="height: 6px;">
                                <div class="progress-bar" role="progressbar" 
                                     style="width: ${plan.progress_percentage}%"
                                     aria-valuenow="${plan.progress_percentage}" 
                                     aria-valuemin="0" aria-valuemax="100">
                                </div>
                            </div>
                            <small class="text-muted">${plan.progress_percentage}%</small>
                        </div>
                    </td>
                    <td>
                        <div class="budget-display">
                            <div class="fw-medium">${plan.budget_formatted}</div>
                            <div class="progress mt-1" style="height: 4px;">
                                <div class="progress-bar ${this.getBudgetProgressClass(plan.budget_usage_rate)}" 
                                     style="width: ${plan.budget_usage_rate}%"></div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="deadline-display">
                            <div class="fw-medium">${plan.planned_date_formatted}</div>
                            <small class="d-day ${urgencyClass}">${plan.d_day_text}</small>
                        </div>
                    </td>
                    <td>
                        <div class="btn-group" role="group">
                            <button type="button" class="btn btn-sm btn-outline-primary" 
                                    onclick="upgradeManagement.viewPlanDetail(${plan.id})" 
                                    title="상세보기">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button type="button" class="btn btn-sm btn-outline-secondary" 
                                    onclick="upgradeManagement.editPlan(${plan.id})" 
                                    title="수정">
                                <i class="fas fa-edit"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = html;
    }

    /**
     * 빈 상태 표시
     */
    displayEmptyState(message = '업그레이드 계획이 없습니다.') {
        const tbody = document.querySelector('#upgradePlansTable tbody');
        if (!tbody) return;

        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center py-5">
                    <div class="text-muted">
                        <i class="fas fa-tools fa-3x mb-3 opacity-50"></i>
                        <p class="mb-0">${message}</p>
                        <small class="text-muted">새로운 업그레이드 계획을 수립해보세요.</small>
                    </div>
                </td>
            </tr>
        `;
    }

    /**
     * 통계 정보 업데이트
     */
    updateStatistics(stats) {
        // 통계 카드 업데이트
        const elements = {
            totalPlans: document.querySelector('[data-stat="total-plans"]'),
            urgentPlans: document.querySelector('[data-stat="urgent-plans"]'),
            thisMonthPlans: document.querySelector('[data-stat="this-month-plans"]'),
            budgetEfficiency: document.querySelector('[data-stat="budget-efficiency"]')
        };

        if (elements.totalPlans) elements.totalPlans.textContent = stats.total_plans || 0;
        if (elements.urgentPlans) elements.urgentPlans.textContent = stats.urgent_plans || 0;
        if (elements.thisMonthPlans) elements.thisMonthPlans.textContent = stats.this_month_plans || 0;
        if (elements.budgetEfficiency) elements.budgetEfficiency.textContent = `${stats.budget_efficiency || 0}%`;
    }

    /**
     * 페이지네이션 업데이트
     */
    updatePagination(pagination) {
        const paginationEl = document.querySelector('.pagination');
        if (!paginationEl || pagination.total_pages <= 1) {
            if (paginationEl) paginationEl.style.display = 'none';
            return;
        }

        paginationEl.style.display = 'flex';
        // 페이지네이션 HTML 생성 로직...
    }

    /**
     * 필터 적용
     */
    applyFilters() {
        this.currentFilters = {
            status: document.getElementById('statusFilter')?.value || '',
            type: document.getElementById('typeFilter')?.value || '',
            department: document.getElementById('departmentFilter')?.value || '',
            search: this.currentFilters.search
        };

        this.currentPage = 1;
        this.loadUpgradePlans();
    }

    /**
     * 검색 처리
     */
    handleSearch() {
        const searchInput = document.getElementById('searchInput');
        this.currentFilters.search = searchInput?.value.trim() || '';
        this.currentPage = 1;
        this.loadUpgradePlans();
    }

    /**
     * 필터 초기화
     */
    resetFilters() {
        // 필터 입력 초기화
        const statusFilter = document.getElementById('statusFilter');
        const typeFilter = document.getElementById('typeFilter');
        const departmentFilter = document.getElementById('departmentFilter');
        const searchInput = document.getElementById('searchInput');

        if (statusFilter) statusFilter.value = '';
        if (typeFilter) typeFilter.value = '';
        if (departmentFilter) departmentFilter.value = '';
        if (searchInput) searchInput.value = '';

        this.currentFilters = {
            status: '',
            type: '',
            department: '',
            search: ''
        };

        this.currentPage = 1;
        this.loadUpgradePlans();
    }

    /**
     * 필터 초기화
     */
    initializeFilters() {
        this.applyFilters();
    }

    /**
     * 업그레이드 유형 변경 핸들러
     */
    handleUpgradeTypeChange(type) {
        this.currentUpgradeType = type;

        // 모든 업그레이드 유형 세부 정보 숨기기
        document.querySelectorAll('.upgrade-type-details').forEach(el => {
            el.classList.add('d-none');
        });

        // 선택된 유형의 세부 정보 표시
        const detailsEl = document.getElementById(`${type}Details`);
        if (detailsEl) {
            detailsEl.classList.remove('d-none');
        }

        this.validatePlanForm();
    }

    /**
     * 자산 검색
     */
    async searchAssets() {
        const searchTerm = document.getElementById('assetSearch')?.value.trim();
        const resultsContainer = document.getElementById('assetSearchResults');

        if (!searchTerm) {
            this.showAssetSearchPlaceholder();
            return;
        }

        try {
            const response = await ApiUtils.get('/assets/api/search', { q: searchTerm }, {
                showLoader: false
            });

            this.displayAssetSearchResults(response.data || []);

        } catch (error) {
            console.error('자산 검색 실패:', error);
            resultsContainer.innerHTML = `
                <div class="text-center text-danger py-3">
                    <i class="fas fa-exclamation-triangle mb-2"></i>
                    <p class="mb-0 small">검색 중 오류가 발생했습니다.</p>
                </div>
            `;
        }
    }

    /**
     * 자산 검색 결과 표시
     */
    displayAssetSearchResults(results) {
        const container = document.getElementById('assetSearchResults');
        
        if (results.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="fas fa-search fa-2x mb-2 opacity-50"></i>
                    <p class="mb-0">검색 결과가 없습니다</p>
                </div>
            `;
            return;
        }

        const resultsHtml = results.map(asset => `
            <div class="asset-search-item border-bottom py-2" data-asset-id="${asset.id}">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <div class="fw-medium">${asset.name}</div>
                        <div class="text-muted small">${asset.number} | ${asset.category}</div>
                        <div class="text-success small">현재가치: ${asset.current_value_formatted}</div>
                    </div>
                    <button type="button" class="btn btn-sm btn-outline-primary" 
                            onclick="upgradeManagement.selectAsset(${asset.id})">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = resultsHtml;
    }

    /**
     * 자산 선택
     */
    selectAsset(assetId) {
        // Mock 구현 - 실제로는 API에서 자산 정보 조회
        const asset = {
            id: assetId,
            name: `자산 ${assetId}`,
            number: `AST-2024-${String(assetId).padStart(3, '0')}`,
            category: 'IT장비',
            current_value: 1500000
        };

        // 중복 선택 방지
        if (this.selectedAssets.some(a => a.id === assetId)) {
            if (UIUtils && UIUtils.showAlert) {
                UIUtils.showAlert('이미 선택된 자산입니다.', 'warning');
            } else {
                alert('이미 선택된 자산입니다.');
            }
            return;
        }

        this.selectedAssets.push(asset);
        this.updateSelectedAssets();
        this.validatePlanForm();
    }

    /**
     * 선택된 자산 제거
     */
    removeAsset(assetId) {
        this.selectedAssets = this.selectedAssets.filter(a => a.id !== assetId);
        this.updateSelectedAssets();
        this.validatePlanForm();
    }

    /**
     * 선택된 자산 목록 업데이트
     */
    updateSelectedAssets() {
        const container = document.getElementById('selectedAssets');
        
        if (this.selectedAssets.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="fas fa-laptop fa-2x mb-2 opacity-50"></i>
                    <p class="mb-0">선택된 자산이 없습니다</p>
                </div>
            `;
            return;
        }

        const selectedHtml = this.selectedAssets.map(asset => `
            <div class="selected-asset-item border-bottom py-2">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <div class="fw-medium">${asset.name}</div>
                        <div class="text-muted small">${asset.number}</div>
                        <div class="text-success small">현재가치: ${asset.current_value?.toLocaleString()}원</div>
                    </div>
                    <button type="button" class="btn btn-sm btn-outline-danger" 
                            onclick="upgradeManagement.removeAsset(${asset.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = selectedHtml;
    }

    /**
     * 자산 검색 플레이스홀더 표시
     */
    showAssetSearchPlaceholder() {
        const container = document.getElementById('assetSearchResults');
        container.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="fas fa-search fa-2x mb-2 opacity-50"></i>
                <p class="mb-0">자산을 검색해주세요</p>
            </div>
        `;
    }

    /**
     * 계획 폼 유효성 검사
     */
    validatePlanForm() {
        const savePlanBtn = document.getElementById('savePlanBtn');
        const hasAssets = this.selectedAssets.length > 0;
        const hasType = this.currentUpgradeType !== null;
        
        if (savePlanBtn) {
            savePlanBtn.disabled = !(hasAssets && hasType);
        }
    }

    /**
     * 계획 저장
     */
    async savePlan() {
        if (!this.validatePlanData()) {
            return;
        }

        const planData = this.collectPlanData();
        
        try {
            await ApiUtils.post('/operations/api/upgrade-plans', planData, {
                showLoader: true
            });

            if (UIUtils && UIUtils.showAlert) {
                UIUtils.showAlert('업그레이드 계획이 성공적으로 저장되었습니다.', 'success');
            } else {
                alert('업그레이드 계획이 성공적으로 저장되었습니다.');
            }
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('createUpgradePlanModal'));
            if (modal) {
                modal.hide();
            }
            
            this.resetPlanForm();
            this.loadUpgradePlans();

        } catch (error) {
            console.error('계획 저장 실패:', error);
            if (UIUtils && UIUtils.showAlert) {
                UIUtils.showAlert('계획 저장 중 오류가 발생했습니다.', 'danger');
            } else {
                alert('계획 저장 중 오류가 발생했습니다.');
            }
        }
    }

    /**
     * 계획 데이터 수집
     */
    collectPlanData() {
        const formData = {
            upgradeType: this.currentUpgradeType,
            assets: this.selectedAssets,
            priority: document.getElementById('priority')?.value,
            plannedStartDate: document.getElementById('plannedStartDate')?.value,
            plannedEndDate: document.getElementById('plannedEndDate')?.value,
            budget: document.getElementById('budget')?.value,
            assignedManager: document.getElementById('assignedManager')?.value,
            description: document.getElementById('description')?.value,
            specialNotes: document.getElementById('specialNotes')?.value
        };

        // 업그레이드 유형별 세부 정보 추가
        if (this.currentUpgradeType === 'replacement') {
            formData.targetSpecs = document.getElementById('targetSpecs')?.value;
            formData.migrationPlan = document.getElementById('migrationPlan')?.value;
        } else if (this.currentUpgradeType === 'enhancement') {
            formData.enhancementDetails = document.getElementById('enhancementDetails')?.value;
            formData.performanceGoals = document.getElementById('performanceGoals')?.value;
        }

        return formData;
    }

    /**
     * 계획 데이터 유효성 검사
     */
    validatePlanData() {
        const priority = document.getElementById('priority')?.value;
        const plannedStartDate = document.getElementById('plannedStartDate')?.value;
        const budget = document.getElementById('budget')?.value;
        const assignedManager = document.getElementById('assignedManager')?.value;

        if (!priority) {
            if (UIUtils && UIUtils.showAlert) {
                UIUtils.showAlert('우선순위를 선택해주세요.', 'warning');
            } else {
                alert('우선순위를 선택해주세요.');
            }
            return false;
        }

        if (!plannedStartDate) {
            if (UIUtils && UIUtils.showAlert) {
                UIUtils.showAlert('시작 예정일을 선택해주세요.', 'warning');
            } else {
                alert('시작 예정일을 선택해주세요.');
            }
            return false;
        }

        if (!budget) {
            if (UIUtils && UIUtils.showAlert) {
                UIUtils.showAlert('예산을 입력해주세요.', 'warning');
            } else {
                alert('예산을 입력해주세요.');
            }
            return false;
        }

        if (!assignedManager) {
            if (UIUtils && UIUtils.showAlert) {
                UIUtils.showAlert('담당자를 선택해주세요.', 'warning');
            } else {
                alert('담당자를 선택해주세요.');
            }
            return false;
        }

        return true;
    }

    /**
     * 계획 폼 초기화
     */
    resetPlanForm() {
        const form = document.getElementById('upgradePlanForm');
        if (form) {
            form.reset();
        }

        this.selectedAssets = [];
        this.currentUpgradeType = null;
        this.updateSelectedAssets();
        this.showAssetSearchPlaceholder();
        
        // 업그레이드 세부 정보 숨기기
        document.querySelectorAll('.upgrade-type-details').forEach(el => {
            el.classList.add('d-none');
        });

        this.validatePlanForm();
    }

    /**
     * 계획 상세보기
     */
    viewPlanDetail(planId) {
        window.location.href = `/operations/upgrade-management/${planId}`;
    }

    /**
     * 계획 수정
     */
    editPlan(planId) {
        // 수정 모달 또는 페이지로 이동
        console.log('계획 수정:', planId);
    }

    /**
     * 긴급도 클래스 반환
     */
    getUrgencyClass(daysUntil) {
        if (daysUntil < 0) return 'overdue';
        if (daysUntil <= 7) return 'urgent';
        if (daysUntil <= 30) return 'warning';
        return 'normal';
    }

    /**
     * 상태 클래스 반환
     */
    getStatusClass(status) {
        const statusClasses = {
            'planned': 'secondary',
            'approved': 'info',
            'in_progress': 'warning',
            'completed': 'success'
        };
        return statusClasses[status] || 'secondary';
    }

    /**
     * 우선순위 클래스 반환
     */
    getPriorityClass(priority) {
        const priorityClasses = {
            'high': 'danger',
            'medium': 'warning',
            'low': 'success'
        };
        return priorityClasses[priority] || 'secondary';
    }

    /**
     * 예산 진행률 클래스 반환
     */
    getBudgetProgressClass(usageRate) {
        if (usageRate >= 90) return 'bg-danger';
        if (usageRate >= 70) return 'bg-warning';
        return 'bg-success';
    }

    /**
     * 차트 초기화
     */
    static initCharts(typeData, statusData) {
        console.log('차트 초기화 시작:', { typeData, statusData });
        const instance = window.upgradeManagement || new UpgradeManagement();
        instance.initUpgradeTypeChart(typeData);
        instance.initStatusChart(statusData);
    }

    /**
     * 업그레이드 유형별 차트 초기화
     */
    initUpgradeTypeChart(data) {
        const ctx = document.getElementById('upgradeTypeChart');
        if (!ctx) {
            console.warn('upgradeTypeChart 엘리먼트를 찾을 수 없습니다.');
            return;
        }

        // 기존 차트가 있으면 제거
        if (this.charts.typeChart) {
            this.charts.typeChart.destroy();
        }

        try {
            // 안전한 데이터 처리
            const safeData = data || {};
            const chartData = [
                safeData.replacement || 0,
                safeData.enhancement || 0,
                safeData.migration || 0
            ];

            console.log('업그레이드 유형별 차트 데이터:', chartData);

            this.charts.typeChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['교체', '업그레이드', '이전/전환'],
                    datasets: [{
                        data: chartData,
                        backgroundColor: [
                            '#dc3545',
                            '#28a745',
                            '#17a2b8'
                        ],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = total > 0 ? ((context.parsed * 100) / total).toFixed(1) : 0;
                                    return `${context.label}: ${context.parsed}개 (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('업그레이드 유형별 차트 초기화 실패:', error);
        }
    }

    /**
     * 상태별 진행 현황 차트 초기화
     */
    initStatusChart(data) {
        const ctx = document.getElementById('statusChart');
        if (!ctx) {
            console.warn('statusChart 엘리먼트를 찾을 수 없습니다.');
            return;
        }

        // 기존 차트가 있으면 제거
        if (this.charts.statusChart) {
            this.charts.statusChart.destroy();
        }

        try {
            // 안전한 데이터 처리
            const safeData = data || {};
            const chartData = [
                safeData.planned?.count || 0,
                safeData.approved?.count || 0,
                safeData.in_progress?.count || 0,
                safeData.completed?.count || 0
            ];

            console.log('상태별 진행 현황 차트 데이터:', chartData);

            this.charts.statusChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['계획됨', '승인됨', '진행중', '완료됨'],
                    datasets: [{
                        label: '계획 수',
                        data: chartData,
                        backgroundColor: [
                            '#6c757d',
                            '#17a2b8',
                            '#ffc107',
                            '#28a745'
                        ],
                        borderColor: [
                            '#5a6268',
                            '#138496',
                            '#e0a800',
                            '#1e7e34'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1,
                                callback: function(value) {
                                    return value + '개';
                                }
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${context.label}: ${context.parsed.y}개`;
                                }
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('상태별 진행 현황 차트 초기화 실패:', error);
        }
    }

    /**
     * 동적 스타일 적용
     */
    applyDynamicStyles() {
        // SVG 원형 차트 진행률 적용
        document.querySelectorAll('.progress-circle-fill[data-progress]').forEach(element => {
            const progress = element.dataset.progress;
            element.style.setProperty('--progress', progress);
        });

        // 진행바 width 적용
        document.querySelectorAll('.progress-bar[data-progress]').forEach(element => {
            const progress = element.dataset.progress;
            element.style.setProperty('--progress', progress);
        });

        document.querySelectorAll('.progress-bar[data-width]').forEach(element => {
            const width = element.dataset.width;
            element.style.setProperty('--width', width);
        });
    }
}

// 전역 변수로 인스턴스 설정
window.upgradeManagement = null;

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', function() {
    window.upgradeManagement = UpgradeManagement.init();
});
