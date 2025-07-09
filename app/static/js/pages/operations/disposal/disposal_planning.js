/**
 * 처분 계획 관리 모듈
 * 처분 계획 대시보드 및 계획 수립 기능
 */

class DisposalPlanning {
    constructor() {
        this.selectedAssets = [];
        this.currentDisposalType = null;
        this.charts = {};
        this.mockAssets = this.generateMockAssets();
    }

    /**
     * 모듈 초기화
     */
    static init() {
        const instance = new DisposalPlanning();
        instance.bindEvents();
        instance.initializeFilters();
        instance.applyDynamicStyles();
        return instance;
    }

    /**
     * 이벤트 바인딩
     */
    bindEvents() {
        // 처분 계획 관련 버튼 이벤트
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-view-disposal-plan')) {
                e.preventDefault();
                const planId = e.target.dataset.planId;
                this.viewPlanDetail(planId);
            }
            
            if (e.target.classList.contains('btn-edit-disposal-plan')) {
                e.preventDefault();
                const planId = e.target.dataset.planId;
                this.editPlan(planId);
            }
            
            if (e.target.classList.contains('btn-execute-disposal-plan')) {
                e.preventDefault();
                const planId = e.target.dataset.planId;
                this.executePlan(planId);
            }
        });

        // 처분 유형 선택 이벤트
        document.querySelectorAll('input[name="disposalType"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.handleDisposalTypeChange(e.target.value);
            });
        });

        // 자산 검색 이벤트
        const searchBtn = document.getElementById('searchAssetBtn');
        const searchInput = document.getElementById('assetSearch');
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.searchAssets();
            });
        }

        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchAssets();
                }
            });
        }

        // 계획 저장 버튼
        const savePlanBtn = document.getElementById('savePlanBtn');
        if (savePlanBtn) {
            savePlanBtn.addEventListener('click', () => {
                this.savePlan();
            });
        }

        // 필터 이벤트
        const typeFilter = document.getElementById('typeFilter');
        const statusFilter = document.getElementById('statusFilter');

        if (typeFilter) {
            typeFilter.addEventListener('change', () => {
                this.applyFilters();
            });
        }

        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.applyFilters();
            });
        }
    }

    /**
     * 동적 스타일 적용
     */
    applyDynamicStyles() {
        // 진행바 data-progress 적용
        document.querySelectorAll('.progress-bar[data-progress]').forEach(element => {
            const progress = element.dataset.progress;
            element.style.setProperty('--progress', progress);
        });
    }

    /**
     * 처분 유형 변경 핸들러
     */
    handleDisposalTypeChange(type) {
        this.currentDisposalType = type;
        
        // 모든 처분 유형 세부 정보 숨기기
        document.querySelectorAll('.disposal-type-details').forEach(el => {
            el.classList.add('d-none');
        });

        // 선택된 유형의 세부 정보 표시
        const detailsEl = document.getElementById(`${type}Details`);
        if (detailsEl) {
            detailsEl.classList.remove('d-none');
        }

        // 처분 상세 정보 섹션 표시
        const disposalDetails = document.getElementById('disposalDetails');
        if (disposalDetails) {
            disposalDetails.classList.remove('d-none');
        }

        this.validateForm();
    }

    /**
     * 자산 검색
     */
    searchAssets() {
        const searchTerm = document.getElementById('assetSearch').value.trim();
        const resultsContainer = document.getElementById('assetSearchResults');

        if (!searchTerm) {
            this.showSearchPlaceholder();
            return;
        }

        // Mock 자산 데이터에서 검색
        const searchResults = this.mockAssets.filter(asset => 
            asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.number.toLowerCase().includes(searchTerm.toLowerCase())
        );

        this.displaySearchResults(searchResults);
    }

    /**
     * 검색 결과 표시
     */
    displaySearchResults(results) {
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
                    </div>
                    <button type="button" class="btn btn-sm btn-outline-primary" 
                            onclick="disposalPlanning.selectAsset(${asset.id})">
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
        const asset = this.mockAssets.find(a => a.id === assetId);
        if (!asset) return;

        // 중복 선택 방지
        if (this.selectedAssets.some(a => a.id === assetId)) {
            alert('이미 선택된 자산입니다.');
            return;
        }

        this.selectedAssets.push(asset);
        this.updateSelectedAssets();
        this.validateForm();
    }

    /**
     * 선택된 자산 제거
     */
    removeAsset(assetId) {
        this.selectedAssets = this.selectedAssets.filter(a => a.id !== assetId);
        this.updateSelectedAssets();
        this.validateForm();
    }

    /**
     * 선택된 자산 목록 업데이트
     */
    updateSelectedAssets() {
        const container = document.getElementById('selectedAssets');
        
        if (this.selectedAssets.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="fas fa-box-open fa-2x mb-2 opacity-50"></i>
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
                        <div class="text-success small">예상가치: ${asset.value.toLocaleString()}원</div>
                    </div>
                    <button type="button" class="btn btn-sm btn-outline-danger" 
                            onclick="disposalPlanning.removeAsset(${asset.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = selectedHtml;
    }

    /**
     * 폼 유효성 검사
     */
    validateForm() {
        const savePlanBtn = document.getElementById('savePlanBtn');
        const hasAssets = this.selectedAssets.length > 0;
        const hasType = this.currentDisposalType !== null;
        
        if (savePlanBtn) {
            savePlanBtn.disabled = !(hasAssets && hasType);
        }
    }

    /**
     * 계획 저장
     */
    savePlan() {
        if (!this.validatePlanData()) {
            return;
        }

        const planData = this.collectPlanData();
        
        // Mock 저장 처리
        console.log('처분 계획 저장:', planData);
        
        // 성공 알럿 및 모달 닫기
        alert('처분 계획이 성공적으로 저장되었습니다.');
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('disposalPlanModal'));
        if (modal) {
            modal.hide();
        }
        
        // 폼 초기화
        this.resetForm();
        
        // 페이지 새로고침 (실제로는 데이터 재로드)
        setTimeout(() => {
            location.reload();
        }, 1000);
    }

    /**
     * 계획 데이터 수집
     */
    collectPlanData() {
        const formData = {
            disposalType: this.currentDisposalType,
            assets: this.selectedAssets,
            plannedDate: document.getElementById('plannedDate').value,
            assignedManager: document.getElementById('assignedManager').value,
            disposalReason: document.getElementById('disposalReason').value,
            specialNotes: document.getElementById('specialNotes').value
        };

        // 처분 유형별 세부 정보 추가
        if (this.currentDisposalType === 'sale') {
            formData.salePrice = document.getElementById('salePrice').value;
            formData.saleMethod = document.getElementById('saleMethod').value;
        } else if (this.currentDisposalType === 'donate') {
            formData.donateOrganization = document.getElementById('donateOrganization').value;
            formData.donateReason = document.getElementById('donateReason').value;
        } else if (this.currentDisposalType === 'transfer') {
            formData.transferTarget = document.getElementById('transferTarget').value;
            formData.transferDestination = document.getElementById('transferDestination').value;
        }

        return formData;
    }

    /**
     * 계획 데이터 유효성 검사
     */
    validatePlanData() {
        const plannedDate = document.getElementById('plannedDate').value;
        const assignedManager = document.getElementById('assignedManager').value;
        const disposalReason = document.getElementById('disposalReason').value;

        if (!plannedDate) {
            alert('처분 예정일을 선택해주세요.');
            return false;
        }

        if (!assignedManager) {
            alert('담당자를 선택해주세요.');
            return false;
        }

        if (!disposalReason.trim()) {
            alert('처분 사유를 입력해주세요.');
            return false;
        }

        return true;
    }

    /**
     * 폼 초기화
     */
    resetForm() {
        document.getElementById('disposalPlanForm').reset();
        this.selectedAssets = [];
        this.currentDisposalType = null;
        this.updateSelectedAssets();
        this.showSearchPlaceholder();
        
        // 처분 상세 정보 숨기기
        document.getElementById('disposalDetails').classList.add('d-none');
        document.querySelectorAll('.disposal-type-details').forEach(el => {
            el.classList.add('d-none');
        });
    }

    /**
     * 검색 플레이스홀더 표시
     */
    showSearchPlaceholder() {
        const container = document.getElementById('assetSearchResults');
        container.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="fas fa-search fa-2x mb-2 opacity-50"></i>
                <p class="mb-0">자산을 검색해주세요</p>
            </div>
        `;
    }

    /**
     * 필터 초기화
     */
    initializeFilters() {
        this.applyFilters();
    }

    /**
     * 필터 적용
     */
    applyFilters() {
        const typeFilter = document.getElementById('typeFilter')?.value;
        const statusFilter = document.getElementById('statusFilter')?.value;
        const table = document.getElementById('disposalPlansTable');
        
        if (!table) return;

        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            let show = true;
            
            if (typeFilter) {
                const typeCell = row.querySelector('td:nth-child(2)');
                if (typeCell && !typeCell.textContent.toLowerCase().includes(typeFilter)) {
                    show = false;
                }
            }
            
            if (statusFilter && show) {
                const statusCell = row.querySelector('td:nth-child(5)');
                if (statusCell && !statusCell.textContent.toLowerCase().includes(statusFilter)) {
                    show = false;
                }
            }
            
            row.style.display = show ? '' : 'none';
        });
    }

    /**
     * 차트 초기화
     */
    static initCharts(typeData, budgetData) {
        const instance = window.disposalPlanning || new DisposalPlanning();
        instance.initDisposalTypeChart(typeData);
        instance.initBudgetProgressChart(budgetData);
    }

    /**
     * 처분 유형별 차트 초기화
     */
    initDisposalTypeChart(data) {
        const ctx = document.getElementById('disposalTypeChart');
        if (!ctx) return;

        this.charts.typeChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['매각', '기부', '이전', '폐기'],
                datasets: [{
                    data: [data?.sale || 12, data?.donate || 8, data?.transfer || 5, data?.disposal || 15],
                    backgroundColor: [
                        '#28a745',
                        '#dc3545', 
                        '#17a2b8',
                        '#ffc107'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    /**
     * 예산 진행률 차트 초기화
     */
    initBudgetProgressChart(data) {
        const ctx = document.getElementById('budgetProgressChart');
        if (!ctx) return;

        this.charts.budgetChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
                datasets: [{
                    label: '예산 사용률',
                    data: data?.progress || [20, 35, 45, 60, 75, 85],
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * 달력 초기화
     */
    static initCalendar(events) {
        // 간단한 달력 표시 (실제로는 FullCalendar 등 사용)
        const calendarEl = document.getElementById('disposalCalendar');
        if (calendarEl) {
            calendarEl.innerHTML = `
                <div class="text-center p-4 bg-light rounded">
                    <h5>2024년 12월</h5>
                    <p class="text-muted">달력 컴포넌트 영역</p>
                    <small class="text-muted">FullCalendar 또는 유사한 라이브러리로 구현</small>
                </div>
            `;
        }
    }

    /**
     * Mock 자산 데이터 생성
     */
    generateMockAssets() {
        return [
            { id: 1, name: '사무용 의자', number: 'AST-2024-001', category: '사무용품', value: 150000 },
            { id: 2, name: '노트북 컴퓨터', number: 'AST-2024-002', category: 'IT장비', value: 1200000 },
            { id: 3, name: '프린터', number: 'AST-2024-003', category: 'IT장비', value: 300000 },
            { id: 4, name: '회의용 테이블', number: 'AST-2024-004', category: '가구', value: 500000 },
            { id: 5, name: '화이트보드', number: 'AST-2024-005', category: '사무용품', value: 80000 },
            { id: 6, name: '복합기', number: 'AST-2024-006', category: 'IT장비', value: 800000 },
            { id: 7, name: '서버 랙', number: 'AST-2024-007', category: 'IT장비', value: 2000000 },
            { id: 8, name: '책상', number: 'AST-2024-008', category: '가구', value: 250000 }
        ];
    }

    /**
     * 처분 계획 상세보기
     */
    viewPlanDetail(planId) {
        console.log('처분 계획 상세보기:', planId);
        // 상세 페이지로 이동 또는 모달 표시
        // window.location.href = `/operations/disposal-planning/${planId}`;
    }

    /**
     * 처분 계획 수정
     */
    editPlan(planId) {
        console.log('처분 계획 수정:', planId);
        // 수정 모달 표시 또는 수정 페이지로 이동
    }

    /**
     * 처분 계획 실행
     */
    executePlan(planId) {
        if (confirm('처분 계획을 실행하시겠습니까?')) {
            console.log('처분 계획 실행:', planId);
            // 실행 로직
        }
    }
}

// 전역 변수로 인스턴스 설정
window.disposalPlanning = null;

// 전역 함수들
window.viewPlanDetail = function(planId) {
    console.log('계획 상세보기:', planId);
    alert('계획 상세보기 기능 (구현 예정)');
};

window.editPlan = function(planId) {
    console.log('계획 수정:', planId);
    alert('계획 수정 기능 (구현 예정)');
};

window.executePlan = function(planId) {
    console.log('계획 실행:', planId);
    if (confirm('선택한 처분 계획을 실행하시겠습니까?')) {
        alert('계획 실행 기능 (구현 예정)');
    }
};

// 모듈 초기화
DisposalPlanning.init = function() {
    window.disposalPlanning = new DisposalPlanning();
    window.disposalPlanning.bindEvents();
    window.disposalPlanning.initializeFilters();
    return window.disposalPlanning;
};

DisposalPlanning.initCharts = function(typeData, budgetData) {
    if (window.disposalPlanning) {
        window.disposalPlanning.initDisposalTypeChart(typeData);
        window.disposalPlanning.initBudgetProgressChart(budgetData);
    }
};

DisposalPlanning.initCalendar = function(events) {
    const calendarEl = document.getElementById('disposalCalendar');
    if (calendarEl) {
        calendarEl.innerHTML = `
            <div class="text-center p-4 bg-light rounded">
                <h5>2024년 12월</h5>
                <p class="text-muted">달력 컴포넌트 영역</p>
                <small class="text-muted">FullCalendar 또는 유사한 라이브러리로 구현</small>
            </div>
        `;
    }
}; 