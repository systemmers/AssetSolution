/**
 * 자산 처분 계획 관리 모듈
 * DisposalManager의 계획 관리 컴포넌트
 */

export default class DisposalPlanningManager {
    constructor() {
        this.charts = {};
        this.disposalPlans = [];
        this.filteredPlans = [];
        this.selectedPlan = null;
        this.isInitialized = false;
    }

    /**
     * 초기화
     */
    async initialize() {
        try {
            console.log('DisposalPlanningManager 초기화 중...');
            
            // 데이터 로드
            await this.loadDisposalData();
            
            // 통계 카드 렌더링
            this.renderStatisticsCards();
            
            // 캘린더 렌더링
            this.renderMonthlyCalendar();
            
            // 차트 초기화
            this.initializeCharts();
            
            // 처분 계획 테이블 렌더링
            this.renderDisposalPlansTable();
            
            // 이벤트 리스너 등록
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('DisposalPlanningManager 초기화 완료');
            
        } catch (error) {
            console.error('DisposalPlanningManager 초기화 오류:', error);
            throw error;
        }
    }

    /**
     * 처분 데이터 로드
     */
    async loadDisposalData() {
        try {
            // 실제 구현에서는 API 호출
            this.disposalPlans = await this.fetchDisposalPlans();
            this.filteredPlans = [...this.disposalPlans];
            
            console.log(`처분 계획 ${this.disposalPlans.length}건 로드 완료`);
        } catch (error) {
            console.error('처분 데이터 로드 오류:', error);
            throw error;
        }
    }

    /**
     * 처분 계획 데이터 가져오기 (모의)
     */
    async fetchDisposalPlans() {
        // 모의 지연 시간
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return [
            {
                id: 1,
                assetCode: 'IT-NB-2020-012',
                assetName: '노트북 Dell Latitude 7400',
                category: 'IT장비',
                type: '매각',
                plannedDate: '2024-12-20',
                estimatedValue: 450000,
                status: '계획중',
                reason: '내용연수 만료',
                department: '개발팀',
                priority: '보통'
            },
            {
                id: 2,
                assetCode: 'OF-PR-2019-003',
                assetName: '프린터 HP LaserJet Pro MFP',
                category: '사무기기',
                type: '폐기',
                plannedDate: '2024-12-25',
                estimatedValue: 0,
                status: '승인대기',
                reason: '고장 수리불가',
                department: '총무팀',
                priority: '높음'
            },
            {
                id: 3,
                assetCode: 'FR-DK-2018-022',
                assetName: '책상 (1인용)',
                category: '가구',
                type: '기부',
                plannedDate: '2024-12-28',
                estimatedValue: 50000,
                status: '진행중',
                reason: '사무실 이전',
                department: '마케팅팀',
                priority: '낮음'
            },
            {
                id: 4,
                assetCode: 'IT-SV-2019-008',
                assetName: '서버 Dell PowerEdge R740',
                category: 'IT장비',
                type: '이전',
                plannedDate: '2025-01-15',
                estimatedValue: 1200000,
                status: '계획중',
                reason: '시스템 업그레이드',
                department: 'IT팀',
                priority: '높음'
            },
            {
                id: 5,
                assetCode: 'VH-CR-2020-005',
                assetName: '회사차량 소나타',
                category: '차량',
                type: '매각',
                plannedDate: '2025-01-20',
                estimatedValue: 15000000,
                status: '계획중',
                reason: '리스 만료',
                department: '총무팀',
                priority: '보통'
            }
        ];
    }

    /**
     * 통계 카드 렌더링
     */
    renderStatisticsCards() {
        const stats = this.calculateStatistics();
        
        // 총 처분 계획 수
        this.updateStatCard('totalPlansCount', stats.totalPlans, '건');
        
        // 이번 달 처분 예정
        this.updateStatCard('thisMonthCount', stats.thisMonth, '건');
        
        // 예상 회수 금액
        this.updateStatCard('estimatedValue', this.formatCurrency(stats.estimatedValue), '');
        
        // 승인 대기 건수
        this.updateStatCard('pendingCount', stats.pending, '건');
    }

    /**
     * 통계 계산
     */
    calculateStatistics() {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        return {
            totalPlans: this.disposalPlans.length,
            thisMonth: this.disposalPlans.filter(plan => {
                const planDate = new Date(plan.plannedDate);
                return planDate.getMonth() === currentMonth && planDate.getFullYear() === currentYear;
            }).length,
            estimatedValue: this.disposalPlans.reduce((sum, plan) => sum + plan.estimatedValue, 0),
            pending: this.disposalPlans.filter(plan => plan.status === '승인대기').length
        };
    }

    /**
     * 통계 카드 업데이트
     */
    updateStatCard(elementId, value, unit) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value + unit;
        }
    }

    /**
     * 월별 캘린더 렌더링
     */
    renderMonthlyCalendar() {
        const calendar = document.getElementById('disposalCalendar');
        if (!calendar) return;

        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // 캘린더 헤더
        const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', 
                           '7월', '8월', '9월', '10월', '11월', '12월'];
        
        let html = `
            <div class="calendar-header mb-3">
                <h6 class="mb-0">${year}년 ${monthNames[month]} 처분 일정</h6>
            </div>
            <div class="calendar-grid">
        `;
        
        // 요일 헤더
        const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
        dayNames.forEach(day => {
            html += `<div class="calendar-day-header">${day}</div>`;
        });
        
        // 달력 날짜
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();
        
        // 빈 셀 추가 (월 시작 전)
        for (let i = 0; i < firstDay; i++) {
            html += '<div class="calendar-day empty"></div>';
        }
        
        // 날짜별 처분 계획 맵핑
        const plansByDate = this.groupPlansByDate(year, month);
        
        // 실제 날짜
        for (let date = 1; date <= lastDate; date++) {
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
            const plansForDate = plansByDate[dateKey] || [];
            const isToday = date === currentDate.getDate() && month === currentDate.getMonth();
            
            html += `
                <div class="calendar-day ${isToday ? 'today' : ''}" data-date="${dateKey}">
                    <div class="date-number">${date}</div>
                    ${plansForDate.map(plan => `
                        <div class="plan-item ${this.getPlanTypeClass(plan.type)}" title="${plan.assetName} - ${plan.type}">
                            ${plan.assetCode}
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        html += '</div>';
        calendar.innerHTML = html;
    }

    /**
     * 날짜별 계획 그룹화
     */
    groupPlansByDate(year, month) {
        const groups = {};
        
        this.disposalPlans.forEach(plan => {
            const planDate = new Date(plan.plannedDate);
            if (planDate.getFullYear() === year && planDate.getMonth() === month) {
                const dateKey = plan.plannedDate;
                if (!groups[dateKey]) {
                    groups[dateKey] = [];
                }
                groups[dateKey].push(plan);
            }
        });
        
        return groups;
    }

    /**
     * 처분 유형별 CSS 클래스
     */
    getPlanTypeClass(type) {
        const classMap = {
            '매각': 'plan-sale',
            '기부': 'plan-donate',
            '이전': 'plan-transfer',
            '폐기': 'plan-disposal'
        };
        return classMap[type] || 'plan-default';
    }

    /**
     * 차트 초기화
     */
    initializeCharts() {
        this.initializeTypeChart();
        this.initializeMonthlyChart();
    }

    /**
     * 처분 유형별 차트
     */
    initializeTypeChart() {
        const ctx = document.getElementById('disposalTypeChart');
        if (!ctx) return;

        const typeStats = this.calculateTypeStatistics();
        
        this.charts.typeChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(typeStats),
                datasets: [{
                    data: Object.values(typeStats),
                    backgroundColor: [
                        '#FF6384',  // 매각
                        '#36A2EB',  // 기부
                        '#FFCE56',  // 이전
                        '#4BC0C0'   // 폐기
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
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
                    }
                }
            }
        });
    }

    /**
     * 월별 처분 계획 차트
     */
    initializeMonthlyChart() {
        const ctx = document.getElementById('monthlyDisposalChart');
        if (!ctx) return;

        const monthlyStats = this.calculateMonthlyStatistics();
        
        this.charts.monthlyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['12월', '1월', '2월', '3월', '4월', '5월'],
                datasets: [{
                    label: '처분 계획 건수',
                    data: monthlyStats,
                    backgroundColor: 'rgba(54, 162, 235, 0.8)',
                    borderColor: 'rgba(54, 162, 235, 1)',
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
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    /**
     * 처분 유형별 통계 계산
     */
    calculateTypeStatistics() {
        const stats = {};
        
        this.disposalPlans.forEach(plan => {
            stats[plan.type] = (stats[plan.type] || 0) + 1;
        });
        
        return stats;
    }

    /**
     * 월별 통계 계산
     */
    calculateMonthlyStatistics() {
        // 향후 6개월 데이터 (모의)
        return [2, 1, 0, 1, 0, 1]; // 12월부터 5월까지
    }

    /**
     * 처분 계획 테이블 렌더링
     */
    renderDisposalPlansTable() {
        const tableBody = document.getElementById('disposalPlansTableBody');
        if (!tableBody) return;

        if (this.filteredPlans.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-4 text-muted">
                        <i class="fas fa-calendar-times fa-2x mb-2 opacity-50"></i>
                        <p class="mb-0">처분 계획이 없습니다.</p>
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        this.filteredPlans.forEach(plan => {
            html += `
                <tr class="disposal-plan-row" data-plan-id="${plan.id}">
                    <td>${plan.assetCode}</td>
                    <td>${plan.assetName}</td>
                    <td>${plan.category}</td>
                    <td>
                        <span class="badge ${this.getTypeBadgeClass(plan.type)}">${plan.type}</span>
                    </td>
                    <td>${this.formatDate(plan.plannedDate)}</td>
                    <td>${this.formatCurrency(plan.estimatedValue)}</td>
                    <td>
                        <span class="badge ${this.getStatusBadgeClass(plan.status)}">${plan.status}</span>
                    </td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button type="button" class="btn btn-outline-info btn-sm" onclick="disposalPlanningManager.viewPlanDetails(${plan.id})">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button type="button" class="btn btn-outline-warning btn-sm" onclick="disposalPlanningManager.editPlan(${plan.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;
    }

    /**
     * 유형별 배지 클래스
     */
    getTypeBadgeClass(type) {
        const classMap = {
            '매각': 'bg-success',
            '기부': 'bg-info',
            '이전': 'bg-warning',
            '폐기': 'bg-danger'
        };
        return classMap[type] || 'bg-secondary';
    }

    /**
     * 상태별 배지 클래스
     */
    getStatusBadgeClass(status) {
        const classMap = {
            '계획중': 'bg-secondary',
            '승인대기': 'bg-warning',
            '진행중': 'bg-primary',
            '완료': 'bg-success',
            '취소': 'bg-danger'
        };
        return classMap[status] || 'bg-secondary';
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 필터 버튼들
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filterType = e.target.dataset.filter;
                this.applyFilter(filterType);
            });
        });

        // 검색 입력
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchPlans(e.target.value);
            });
        }

        // 새 계획 추가 버튼
        const addPlanBtn = document.getElementById('addDisposalPlan');
        if (addPlanBtn) {
            addPlanBtn.addEventListener('click', () => this.openAddPlanModal());
        }
    }

    /**
     * 필터 적용
     */
    applyFilter(filterType) {
        // 필터 버튼 활성화 상태 업데이트
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-filter="${filterType}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // 데이터 필터링
        if (filterType === 'all') {
            this.filteredPlans = [...this.disposalPlans];
        } else {
            this.filteredPlans = this.disposalPlans.filter(plan => 
                plan.type === filterType || plan.status === filterType
            );
        }

        // 테이블 다시 렌더링
        this.renderDisposalPlansTable();
    }

    /**
     * 계획 검색
     */
    searchPlans(searchTerm) {
        if (!searchTerm.trim()) {
            this.filteredPlans = [...this.disposalPlans];
        } else {
            const term = searchTerm.toLowerCase();
            this.filteredPlans = this.disposalPlans.filter(plan =>
                plan.assetCode.toLowerCase().includes(term) ||
                plan.assetName.toLowerCase().includes(term) ||
                plan.category.toLowerCase().includes(term) ||
                plan.department.toLowerCase().includes(term)
            );
        }

        this.renderDisposalPlansTable();
    }

    /**
     * 계획 상세 보기
     */
    viewPlanDetails(planId) {
        const plan = this.disposalPlans.find(p => p.id === planId);
        if (!plan) return;

        // 모달에 상세 정보 표시
        const modalBody = document.getElementById('planDetailsModalBody');
        if (modalBody) {
            modalBody.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <h6>자산 정보</h6>
                        <table class="table table-sm">
                            <tr><th>자산 코드</th><td>${plan.assetCode}</td></tr>
                            <tr><th>자산명</th><td>${plan.assetName}</td></tr>
                            <tr><th>분류</th><td>${plan.category}</td></tr>
                            <tr><th>부서</th><td>${plan.department}</td></tr>
                        </table>
                    </div>
                    <div class="col-md-6">
                        <h6>처분 정보</h6>
                        <table class="table table-sm">
                            <tr><th>처분 유형</th><td><span class="badge ${this.getTypeBadgeClass(plan.type)}">${plan.type}</span></td></tr>
                            <tr><th>예정일</th><td>${this.formatDate(plan.plannedDate)}</td></tr>
                            <tr><th>예상 금액</th><td>${this.formatCurrency(plan.estimatedValue)}</td></tr>
                            <tr><th>상태</th><td><span class="badge ${this.getStatusBadgeClass(plan.status)}">${plan.status}</span></td></tr>
                        </table>
                    </div>
                </div>
                <div class="row mt-3">
                    <div class="col-12">
                        <h6>처분 사유</h6>
                        <p class="text-muted">${plan.reason}</p>
                    </div>
                </div>
            `;
        }

        // 모달 열기
        this.toggleModal('planDetailsModal', 'show');
    }

    /**
     * 계획 수정
     */
    editPlan(planId) {
        const plan = this.disposalPlans.find(p => p.id === planId);
        if (!plan) return;

        // 수정 폼에 데이터 채우기
        this.fillEditForm(plan);
        
        // 모달 열기
        this.toggleModal('editPlanModal', 'show');
    }

    /**
     * 수정 폼 데이터 채우기
     */
    fillEditForm(plan) {
        const fields = {
            'editAssetCode': plan.assetCode,
            'editAssetName': plan.assetName,
            'editCategory': plan.category,
            'editType': plan.type,
            'editPlannedDate': plan.plannedDate,
            'editEstimatedValue': plan.estimatedValue,
            'editStatus': plan.status,
            'editReason': plan.reason,
            'editDepartment': plan.department,
            'editPriority': plan.priority
        };

        Object.keys(fields).forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = fields[fieldId];
            }
        });

        // 현재 편집 중인 계획 ID 저장
        this.selectedPlan = plan.id;
    }

    /**
     * 새 계획 추가 모달 열기
     */
    openAddPlanModal() {
        // 폼 초기화
        const form = document.getElementById('addPlanForm');
        if (form) {
            form.reset();
        }

        // 모달 열기
        this.toggleModal('addPlanModal', 'show');
    }

    /**
     * 모달 토글
     */
    toggleModal(modalId, action = 'show') {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        if (action === 'show') {
            modal.style.display = 'block';
            modal.classList.add('show');
            document.body.classList.add('modal-open');
        } else {
            modal.style.display = 'none';
            modal.classList.remove('show');
            document.body.classList.remove('modal-open');
        }
    }

    /**
     * 통화 형식 포맷
     */
    formatCurrency(amount) {
        if (amount === 0) return '-';
        return new Intl.NumberFormat('ko-KR', {
            style: 'currency',
            currency: 'KRW'
        }).format(amount);
    }

    /**
     * 날짜 형식 포맷
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    /**
     * 차트 업데이트
     */
    updateCharts() {
        if (this.charts.typeChart) {
            const typeStats = this.calculateTypeStatistics();
            this.charts.typeChart.data.labels = Object.keys(typeStats);
            this.charts.typeChart.data.datasets[0].data = Object.values(typeStats);
            this.charts.typeChart.update();
        }

        if (this.charts.monthlyChart) {
            const monthlyStats = this.calculateMonthlyStatistics();
            this.charts.monthlyChart.data.datasets[0].data = monthlyStats;
            this.charts.monthlyChart.update();
        }
    }

    /**
     * 데이터 새로고침
     */
    async refreshData() {
        try {
            await this.loadDisposalData();
            this.renderStatisticsCards();
            this.renderMonthlyCalendar();
            this.renderDisposalPlansTable();
            this.updateCharts();
            
            console.log('데이터 새로고침 완료');
        } catch (error) {
            console.error('데이터 새로고침 오류:', error);
        }
    }

    /**
     * 상태 확인
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            totalPlans: this.disposalPlans.length,
            filteredPlans: this.filteredPlans.length,
            selectedPlan: this.selectedPlan,
            chartsInitialized: Object.keys(this.charts).length > 0
        };
    }

    /**
     * 정리
     */
    cleanup() {
        // 차트 정리
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        
        this.charts = {};
        this.disposalPlans = [];
        this.filteredPlans = [];
        this.selectedPlan = null;
        this.isInitialized = false;
    }
}

// 전역 인스턴스 생성 (레거시 호환성)
window.disposalPlanningManager = new DisposalPlanningManager(); 