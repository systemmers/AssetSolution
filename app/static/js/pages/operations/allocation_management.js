/**
 * 지급 관리 모듈
 * 자산 지급 요청, 승인, 관리 기능을 담당
 */
const AllocationManagement = {
    // 현재 위자드 단계
    currentStep: 1,
    
    // 선택된 지급 유형들
    selectedTypes: [],
    
    // 선택된 자산들
    selectedAssets: [],
    
    // 차트 인스턴스
    charts: {
        monthly: null,
        typeDistribution: null
    },

    /**
     * 모듈 초기화
     */
    init() {
        this.bindEvents();
        this.initFilters();
        this.loadMockAssets();
    },

    /**
     * 이벤트 바인딩
     */
    bindEvents() {
        // 지급 요청 모달 이벤트
        this.bindModalEvents();
        
        // 필터 이벤트
        this.bindFilterEvents();
        
        // 테이블 액션 이벤트
        this.bindTableEvents();
    },

    /**
     * 모달 관련 이벤트 바인딩
     */
    bindModalEvents() {
        // 지급 유형 선택 이벤트
        document.querySelectorAll('input[name="allocationTypes"]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.handleTypeSelection(e.target);
            });
        });

        // 위자드 네비게이션 이벤트
        document.getElementById('nextStepBtn').addEventListener('click', () => {
            this.nextStep();
        });

        document.getElementById('prevStepBtn').addEventListener('click', () => {
            this.prevStep();
        });

        // 자산 검색 이벤트
        document.getElementById('searchAllocationAssetBtn').addEventListener('click', () => {
            this.searchAssets();
        });

        // 엔터키로 검색
        document.getElementById('assetAllocationSearch').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.searchAssets();
            }
        });

        // 요청 제출 이벤트
        document.getElementById('submitRequestBtn').addEventListener('click', () => {
            this.submitRequest();
        });

        // 모달 리셋 이벤트
        document.getElementById('allocationRequestModal').addEventListener('hidden.bs.modal', () => {
            this.resetModal();
        });
    },

    /**
     * 필터 이벤트 바인딩
     */
    bindFilterEvents() {
        // 지급 유형 필터
        document.getElementById('allocationTypeFilter').addEventListener('change', (e) => {
            this.applyFilters();
        });

        // 상태 필터
        document.getElementById('allocationStatusFilter').addEventListener('change', (e) => {
            this.applyFilters();
        });
    },

    /**
     * 테이블 액션 이벤트 바인딩
     */
    bindTableEvents() {
        // 전역 함수로 등록 (HTML onclick에서 호출)
        window.viewAllocationDetail = (id) => {
            this.viewDetail(id);
        };

        window.approveAllocation = (id) => {
            this.approveAllocation(id);
        };

        window.executeAllocation = (id) => {
            this.executeAllocation(id);
        };
    },

    /**
     * 지급 유형 선택 처리
     */
    handleTypeSelection(input) {
        const type = input.value;
        const isChecked = input.checked;

        if (isChecked) {
            if (!this.selectedTypes.includes(type)) {
                this.selectedTypes.push(type);
            }
        } else {
            this.selectedTypes = this.selectedTypes.filter(t => t !== type);
        }

        // 다음 단계 버튼 활성화/비활성화
        document.getElementById('nextStepBtn').disabled = this.selectedTypes.length === 0;

        // 선택된 유형 표시 업데이트
        this.updateSelectedTypesDisplay();
    },

    /**
     * 선택된 유형 표시 업데이트
     */
    updateSelectedTypesDisplay() {
        const typeNames = {
            'temporary': '임시지급',
            'permanent': '영구지급',
            'consumable': '소모품',
            'department': '부서공용',
            'special': '특별지급'
        };

        // 여기서 선택된 유형들을 시각적으로 표시할 수 있음
        console.log('선택된 지급 유형:', this.selectedTypes.map(type => typeNames[type]));
    },

    /**
     * 다음 단계로 이동
     */
    nextStep() {
        if (this.validateCurrentStep()) {
            this.currentStep++;
            this.updateWizardStep();
            this.showStep(this.currentStep);
        }
    },

    /**
     * 이전 단계로 이동
     */
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateWizardStep();
            this.showStep(this.currentStep);
        }
    },

    /**
     * 현재 단계 유효성 검사
     */
    validateCurrentStep() {
        switch (this.currentStep) {
            case 1:
                if (this.selectedTypes.length === 0) {
                    if (window.NotificationUtils) {
            window.NotificationUtils.showToast('지급 유형을 하나 이상 선택해주세요.', 'warning');
        } else {
            alert('지급 유형을 하나 이상 선택해주세요.');
        }
                    return false;
                }
                return true;
            case 2:
                if (this.selectedAssets.length === 0) {
                    if (window.NotificationUtils) {
            window.NotificationUtils.showToast('지급할 자산을 하나 이상 선택해주세요.', 'warning');
        } else {
            alert('지급할 자산을 하나 이상 선택해주세요.');
        }
                    return false;
                }
                return true;
            case 3:
                return this.validateDetailForm();
            default:
                return true;
        }
    },

    /**
     * 상세 정보 폼 검증
     */
    validateDetailForm() {
        const requiredFields = [
            { id: 'requestTitle', name: '요청 제목' },
            { id: 'usagePurpose', name: '사용 목적' },
            { id: 'allocationReason', name: '요청 사유' }
        ];

        for (const field of requiredFields) {
            const element = document.getElementById(field.id);
            if (!element.value.trim()) {
                                    if (window.NotificationUtils) {
                        window.NotificationUtils.showToast(`${field.name}을(를) 입력해주세요.`, 'warning');
                    } else {
                        alert(`${field.name}을(를) 입력해주세요.`);
                    }
                element.focus();
                return false;
            }
        }

        return true;
    },

    /**
     * 위자드 단계 표시 업데이트
     */
    updateWizardStep() {
        // 모든 단계 초기화
        document.querySelectorAll('.wizard-step').forEach(step => {
            step.classList.remove('active', 'completed');
        });

        // 현재 단계와 완료된 단계 표시
        document.querySelectorAll('.wizard-step').forEach((step, index) => {
            const stepNumber = index + 1;
            if (stepNumber < this.currentStep) {
                step.classList.add('completed');
            } else if (stepNumber === this.currentStep) {
                step.classList.add('active');
            }
        });

        // 버튼 상태 업데이트
        this.updateNavigationButtons();
    },

    /**
     * 네비게이션 버튼 상태 업데이트
     */
    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevStepBtn');
        const nextBtn = document.getElementById('nextStepBtn');
        const submitBtn = document.getElementById('submitRequestBtn');

        // 이전 버튼
        prevBtn.style.display = this.currentStep > 1 ? 'inline-block' : 'none';

        // 다음/제출 버튼
        if (this.currentStep === 4) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'inline-block';
        } else {
            nextBtn.style.display = 'inline-block';
            submitBtn.style.display = 'none';
        }
    },

    /**
     * 특정 단계 표시
     */
    showStep(stepNumber) {
        // 모든 단계 숨기기
        document.querySelectorAll('.wizard-content').forEach(content => {
            content.classList.add('d-none');
        });

        // 현재 단계 표시
        document.getElementById(`step${stepNumber}`).classList.remove('d-none');

        // 3단계에서 선택된 유형에 따른 세부 정보 표시
        if (stepNumber === 3) {
            this.showTypeSpecificDetails();
        }

        // 4단계에서 미리보기 생성
        if (stepNumber === 4) {
            this.generatePreview();
        }
    },

    /**
     * 유형별 세부 정보 표시
     */
    showTypeSpecificDetails() {
        // 모든 세부 정보 숨기기
        document.querySelectorAll('.type-details').forEach(detail => {
            detail.classList.add('d-none');
        });

        // 선택된 유형의 세부 정보 표시
        this.selectedTypes.forEach(type => {
            const detailElement = document.getElementById(`${type}Details`);
            if (detailElement) {
                detailElement.classList.remove('d-none');
            }
        });
    },

    /**
     * 자산 검색
     */
    searchAssets() {
        const searchTerm = document.getElementById('assetAllocationSearch').value.trim();
        const category = document.getElementById('assetCategoryFilter').value;

        if (!searchTerm && !category) {
            alert('검색어를 입력하거나 카테고리를 선택해주세요.');
            return;
        }

        // 모의 자산 데이터에서 검색
        const results = this.mockAssets.filter(asset => {
            const matchesSearch = !searchTerm || 
                asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                asset.number.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesCategory = !category || asset.category === category;
            
            return matchesSearch && matchesCategory && asset.status === '사용가능';
        });

        this.displaySearchResults(results);
    },

    /**
     * 검색 결과 표시
     */
    displaySearchResults(assets) {
        const resultsContainer = document.getElementById('allocationAssetResults');
        
        if (assets.length === 0) {
            resultsContainer.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="fas fa-search fa-2x mb-2 opacity-50"></i>
                    <p class="mb-0">조건에 맞는 자산이 없습니다.</p>
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = assets.map(asset => `
            <div class="search-result-item border-bottom py-2" data-asset-id="${asset.id}">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-grow-1">
                        <div class="fw-medium">${asset.name}</div>
                        <div class="text-muted small">${asset.number} | ${asset.category}</div>
                        <div class="text-success small">
                            <i class="fas fa-check-circle me-1"></i>${asset.status}
                        </div>
                    </div>
                    <button class="btn btn-sm btn-outline-primary" onclick="AllocationManagement.selectAsset(${asset.id})">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },

    /**
     * 자산 선택
     */
    selectAsset(assetId) {
        const asset = this.mockAssets.find(a => a.id === assetId);
        if (!asset) return;

        // 이미 선택된 자산인지 확인
        if (this.selectedAssets.find(a => a.id === assetId)) {
            alert('이미 선택된 자산입니다.');
            return;
        }

        this.selectedAssets.push(asset);
        this.updateSelectedAssetsDisplay();
    },

    /**
     * 자산 선택 해제
     */
    removeAsset(assetId) {
        this.selectedAssets = this.selectedAssets.filter(a => a.id !== assetId);
        this.updateSelectedAssetsDisplay();
    },

    /**
     * 선택된 자산 목록 업데이트
     */
    updateSelectedAssetsDisplay() {
        const container = document.getElementById('selectedAllocationAssets');
        
        if (this.selectedAssets.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="fas fa-hand-holding fa-2x mb-2 opacity-50"></i>
                    <p class="mb-0">선택된 자산이 없습니다</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.selectedAssets.map(asset => `
            <div class="selected-asset-item border-bottom py-2">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-grow-1">
                        <div class="fw-medium">${asset.name}</div>
                        <div class="text-muted small">${asset.number} | ${asset.category}</div>
                    </div>
                    <button class="btn btn-sm btn-outline-danger" onclick="AllocationManagement.removeAsset(${asset.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },

    /**
     * 요청 미리보기 생성
     */
    generatePreview() {
        const typeNames = {
            'temporary': '임시지급',
            'permanent': '영구지급',
            'consumable': '소모품',
            'department': '부서공용',
            'special': '특별지급'
        };

        const requestTitle = document.getElementById('requestTitle').value;
        const usagePurpose = document.getElementById('usagePurpose').value;
        const allocationReason = document.getElementById('allocationReason').value;
        const allocationNotes = document.getElementById('allocationNotes').value;

        const previewContainer = document.getElementById('requestPreview').querySelector('.card-body');
        
        previewContainer.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h6 class="fw-bold mb-3">기본 정보</h6>
                    <table class="table table-sm">
                        <tbody>
                            <tr>
                                <td class="fw-medium">요청 제목</td>
                                <td>${requestTitle}</td>
                            </tr>
                            <tr>
                                <td class="fw-medium">사용 목적</td>
                                <td>${usagePurpose}</td>
                            </tr>
                            <tr>
                                <td class="fw-medium">지급 유형</td>
                                <td>
                                    ${this.selectedTypes.map(type => 
                                        `<span class="badge bg-primary me-1">${typeNames[type]}</span>`
                                    ).join('')}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="col-md-6">
                    <h6 class="fw-bold mb-3">선택된 자산</h6>
                    <div class="asset-preview-list">
                        ${this.selectedAssets.map(asset => `
                            <div class="d-flex align-items-center mb-2">
                                <i class="fas fa-box text-secondary me-2"></i>
                                <div>
                                    <div class="fw-medium small">${asset.name}</div>
                                    <div class="text-muted small">${asset.number}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-12">
                    <h6 class="fw-bold mb-3">요청 사유</h6>
                    <p class="mb-2">${allocationReason}</p>
                    ${allocationNotes ? `
                        <h6 class="fw-bold mb-2">특이사항</h6>
                        <p class="text-muted">${allocationNotes}</p>
                    ` : ''}
                </div>
            </div>
        `;
    },

    /**
     * 요청 제출
     */
    submitRequest() {
        if (confirm('지급 요청을 제출하시겠습니까?')) {
            // 실제 구현에서는 서버로 데이터 전송
            console.log('지급 요청 데이터:', {
                types: this.selectedTypes,
                assets: this.selectedAssets,
                title: document.getElementById('requestTitle').value,
                purpose: document.getElementById('usagePurpose').value,
                reason: document.getElementById('allocationReason').value,
                notes: document.getElementById('allocationNotes').value
            });

            alert('지급 요청이 성공적으로 제출되었습니다.');
            
            // 모달 닫기
            const modal = bootstrap.Modal.getInstance(document.getElementById('allocationRequestModal'));
            modal.hide();
            
            // 페이지 새로고침 (실제로는 테이블만 업데이트)
            location.reload();
        }
    },

    /**
     * 모달 리셋
     */
    resetModal() {
        this.currentStep = 1;
        this.selectedTypes = [];
        this.selectedAssets = [];
        
        // 폼 리셋
        document.getElementById('allocationRequestForm').reset();
        
        // 체크박스 리셋
        document.querySelectorAll('input[name="allocationTypes"]').forEach(input => {
            input.checked = false;
        });
        
        // 위자드 단계 리셋
        this.updateWizardStep();
        this.showStep(1);
        
        // 선택된 자산 목록 리셋
        this.updateSelectedAssetsDisplay();
    },

    /**
     * 필터 적용
     */
    applyFilters() {
        const typeFilter = document.getElementById('allocationTypeFilter').value;
        const statusFilter = document.getElementById('allocationStatusFilter').value;
        
        const rows = document.querySelectorAll('#allocationRequestTable tbody tr');
        
        rows.forEach(row => {
            const typeCell = row.querySelector('td:nth-child(3)');
            const statusCell = row.querySelector('td:nth-child(7)');
            
            if (!typeCell || !statusCell) return;
            
            let showRow = true;
            
            // 유형 필터
            if (typeFilter && !typeCell.textContent.includes(typeFilter)) {
                showRow = false;
            }
            
            // 상태 필터
            if (statusFilter && !statusCell.textContent.includes(statusFilter)) {
                showRow = false;
            }
            
            row.style.display = showRow ? '' : 'none';
        });
    },

    /**
     * 지급 요청 상세 보기
     */
    viewDetail(id) {
        console.log('지급 요청 상세 보기:', id);
        // 실제 구현에서는 상세 모달 또는 페이지로 이동
        alert(`지급 요청 ${id} 상세 정보를 보여줍니다.`);
    },

    /**
     * 지급 요청 승인
     */
    approveAllocation(id) {
        if (confirm('이 지급 요청을 승인하시겠습니까?')) {
            console.log('지급 요청 승인:', id);
            alert('지급 요청이 승인되었습니다.');
            // 실제로는 서버 통신 후 테이블 업데이트
        }
    },

    /**
     * 지급 실행
     */
    executeAllocation(id) {
        if (confirm('지급을 실행하시겠습니까?')) {
            console.log('지급 실행:', id);
            alert('지급이 완료되었습니다.');
            // 실제로는 서버 통신 후 테이블 업데이트
        }
    },

    /**
     * 필터 초기화
     */
    initFilters() {
        // 현재 날짜 기준으로 필터 초기값 설정 등
    },

    /**
     * 차트 초기화
     */
    initCharts(monthlyData, typeData) {
        // 월별 지급 현황 차트
        const ctx1 = document.getElementById('monthlyAllocationChart');
        if (ctx1) {
            this.charts.monthly = new Chart(ctx1, {
                type: 'line',
                data: {
                    labels: monthlyData.labels,
                    datasets: [{
                        label: '지급 건수',
                        data: monthlyData.data,
                        borderColor: '#007bff',
                        backgroundColor: 'rgba(0, 123, 255, 0.1)',
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // 지급 유형 분포 차트
        const ctx2 = document.getElementById('allocationTypeChart');
        if (ctx2) {
            this.charts.typeDistribution = new Chart(ctx2, {
                type: 'doughnut',
                data: {
                    labels: typeData.labels,
                    datasets: [{
                        data: typeData.data,
                        backgroundColor: [
                            '#007bff',
                            '#28a745',
                            '#ffc107',
                            '#dc3545',
                            '#6f42c1'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    },

    /**
     * 모의 자산 데이터 로드
     */
    loadMockAssets() {
        this.mockAssets = [
            {
                id: 1,
                name: 'MacBook Pro 14인치',
                number: 'IT-2024-001',
                category: 'IT장비',
                status: '사용가능'
            },
            {
                id: 2,
                name: 'Dell 모니터 27인치',
                number: 'IT-2024-002',
                category: 'IT장비',
                status: '사용가능'
            },
            {
                id: 3,
                name: '무선 마우스',
                number: 'IT-2024-003',
                category: 'IT장비',
                status: '사용가능'
            },
            {
                id: 4,
                name: '사무용 의자',
                number: 'FU-2024-001',
                category: '가구',
                status: '사용가능'
            },
            {
                id: 5,
                name: 'A4 복사용지',
                number: 'ST-2024-001',
                category: '소모품',
                status: '사용가능'
            },
            {
                id: 6,
                name: '프린터 토너',
                number: 'ST-2024-002',
                category: '소모품',
                status: '사용가능'
            },
            {
                id: 7,
                name: '책상',
                number: 'FU-2024-002',
                category: '가구',
                status: '사용가능'
            },
            {
                id: 8,
                name: '화상회의 카메라',
                number: 'IT-2024-004',
                category: 'IT장비',
                status: '사용가능'
            }
        ];
    }
};

// 전역에서 접근 가능하도록 등록
window.AllocationManagement = AllocationManagement; 