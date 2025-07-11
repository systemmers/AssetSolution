/**
 * 생명주기 추적 모듈
 * 자산 생명주기 이벤트 타임라인 및 추적 기능
 */

class LifecycleTracking {
    constructor() {
        this.charts = {};
        this.currentFilters = {
            asset_id: '',
            event_type: '',
            department: '',
            start_date: '',
            end_date: ''
        };
        this.currentPage = 1;
        this.itemsPerPage = (window.PAGINATION_SETTINGS && window.PAGINATION_SETTINGS.DEFAULT_PER_PAGE) || 10;
        this.selectedEventTypes = [];
        this.currentAssetId = null;
        this.isLoading = false; // 중복 호출 방지
    }

    /**
     * 모듈 초기화
     */
    static init() {
        if (window.lifecycleTracking) {
            return window.lifecycleTracking;
        }
        
        const instance = new LifecycleTracking();
        window.lifecycleTracking = instance;
        
        instance.bindEvents();
        instance.initializeFilters();
        instance.loadLifecycleEvents();
        return instance;
    }

    /**
     * 이벤트 바인딩
     */
    bindEvents() {
        // 중복 바인딩 방지
        if (this.eventsBound) return;
        
        // 필터 이벤트
        const assetIdFilter = document.getElementById('assetIdFilter');
        const eventTypeFilter = document.getElementById('eventTypeFilter');
        const departmentFilter = document.getElementById('departmentFilter');
        const startDateFilter = document.getElementById('startDateFilter');
        const endDateFilter = document.getElementById('endDateFilter');

        if (assetIdFilter) {
            assetIdFilter.addEventListener('input', this.debounce(() => this.applyFilters(), 500));
        }

        if (eventTypeFilter) {
            eventTypeFilter.addEventListener('change', () => this.applyFilters());
        }

        if (departmentFilter) {
            departmentFilter.addEventListener('input', this.debounce(() => this.applyFilters(), 500));
        }

        if (startDateFilter) {
            startDateFilter.addEventListener('change', () => this.applyFilters());
        }

        if (endDateFilter) {
            endDateFilter.addEventListener('change', () => this.applyFilters());
        }

        // 페이지네이션 이벤트 (이벤트 위임 사용)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('page-link') && !this.isLoading) {
                e.preventDefault();
                const page = parseInt(e.target.dataset.page);
                if (page && page !== this.currentPage) {
                    this.currentPage = page;
                    this.loadLifecycleEvents();
                }
            }
        });

        // 이벤트 상세보기 버튼
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-view-event-detail')) {
                e.preventDefault();
                const eventId = e.target.dataset.eventId;
                this.viewEventDetail(eventId);
            }
        });

        // 고급 필터 모달 이벤트
        const applyAdvancedFilterBtn = document.getElementById('applyAdvancedFilterBtn');
        const clearAdvancedFilterBtn = document.getElementById('clearAdvancedFilterBtn');
        
        if (applyAdvancedFilterBtn) {
            applyAdvancedFilterBtn.addEventListener('click', () => this.applyAdvancedFilter());
        }
        
        if (clearAdvancedFilterBtn) {
            clearAdvancedFilterBtn.addEventListener('click', () => this.clearAdvancedFilter());
        }

        this.eventsBound = true;
    }

    /**
     * Debounce 함수
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * 생명주기 이벤트 목록 로드
     */
    async loadLifecycleEvents() {
        if (this.isLoading) return;
        
        try {
            this.isLoading = true;
            
            const params = {
                page: this.currentPage,
                per_page: this.itemsPerPage,
                ...this.currentFilters
            };

            console.log('생명주기 이벤트 로드:', params);

            const response = await ApiUtils.get('/operations/api/lifecycle-events', params, {
                showLoader: true,
                loaderSelector: '.lifecycle-events-loader'
            });

            this.displayLifecycleEvents(response.data || []);
            this.updatePagination(response.pagination || {});
            this.updateStatistics(response.statistics || {});

        } catch (error) {
            console.error('생명주기 이벤트 로드 실패:', error);
            this.displayEmptyState('데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * 생명주기 이벤트 목록 표시
     */
    displayLifecycleEvents(events) {
        const container = document.querySelector('.timeline-container .timeline');
        if (!container) return;

        if (events.length === 0) {
            this.displayEmptyState();
            return;
        }

        const html = events.map(event => `
            <div class="timeline-item" data-event-id="${event.id}">
                <div class="timeline-marker bg-${event.color || 'secondary'}">
                    <i class="${event.icon || 'fas fa-circle'}"></i>
                </div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="flex-grow-1">
                                <h6 class="mb-1">
                                    <a href="/operations/lifecycle-tracking/asset/${event.asset_id}" 
                                       class="text-decoration-none">
                                        ${event.asset_name || 'Unknown Asset'}
                                    </a>
                                    <small class="text-muted">(${event.asset_number || 'N/A'})</small>
                                </h6>
                                <div class="d-flex align-items-center gap-2 flex-wrap">
                                    <span class="badge bg-${event.color || 'secondary'}">${event.event_type_display || event.event_type}</span>
                                    <span class="text-muted small">${event.department || 'N/A'}</span>
                                    <span class="text-muted small">${event.performed_by || 'N/A'}</span>
                                </div>
                            </div>
                            <div class="text-end">
                                <div class="text-primary fw-medium">${event.event_date_formatted || event.event_date}</div>
                                <small class="text-muted">${event.time_ago_text || ''}</small>
                            </div>
                        </div>
                    </div>
                    <div class="timeline-body mt-2">
                        <p class="mb-2">${event.event_description || '설명 없음'}</p>
                        <div class="d-flex justify-content-between align-items-center flex-wrap">
                            <div class="d-flex gap-3 flex-wrap">
                                <span class="badge bg-light text-dark">
                                    <i class="fas fa-won-sign me-1"></i>${event.related_cost_formatted || '0원'}
                                </span>
                                ${event.notes ? `
                                    <span class="text-muted small">
                                        <i class="fas fa-sticky-note me-1"></i>${event.notes}
                                    </span>
                                ` : ''}
                            </div>
                            <button type="button" class="btn btn-sm btn-outline-primary btn-view-event-detail" 
                                    data-event-id="${event.id}">
                                <i class="fas fa-eye me-1"></i> 상세보기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
        this.animateTimelineItems();
    }

    /**
     * 타임라인 아이템 애니메이션
     */
    animateTimelineItems() {
        const items = document.querySelectorAll('.timeline-item');
        items.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-30px)';
            
            setTimeout(() => {
                item.style.transition = 'all 0.6s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, index * 100);
        });
    }

    /**
     * 빈 상태 표시
     */
    displayEmptyState(message = '생명주기 이벤트가 없습니다.') {
        const container = document.querySelector('.timeline-container .timeline');
        if (!container) return;

        container.innerHTML = `
            <div class="lifecycle-empty-state text-center py-5">
                <i class="fas fa-history fa-3x text-muted mb-3"></i>
                <h5>데이터 없음</h5>
                <p class="text-muted">${message}</p>
                <small class="text-muted">필터 조건을 변경해서 다시 검색해보세요.</small>
            </div>
        `;
    }

    /**
     * 통계 정보 업데이트
     */
    updateStatistics(stats) {
        const elements = {
            totalEvents: document.querySelector('[data-stat="total-events"]'),
            thisMonthEvents: document.querySelector('[data-stat="this-month-events"]'),
            recentEvents: document.querySelector('[data-stat="recent-events"]'),
            totalCosts: document.querySelector('[data-stat="total-costs"]')
        };

        if (elements.totalEvents) elements.totalEvents.textContent = stats.total_events || 0;
        if (elements.thisMonthEvents) elements.thisMonthEvents.textContent = stats.this_month_events || 0;
        if (elements.recentEvents) elements.recentEvents.textContent = stats.recent_events || 0;
        if (elements.totalCosts) elements.totalCosts.textContent = stats.total_costs_formatted || '0원';
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
        
        let html = '';
        
        // 이전 페이지
        if (pagination.has_prev) {
            html += `<li class="page-item">
                <a class="page-link" href="#" data-page="${pagination.current_page - 1}">이전</a>
            </li>`;
        }
        
        // 페이지 번호들
        for (let i = 1; i <= pagination.total_pages; i++) {
            const isActive = i === pagination.current_page ? 'active' : '';
            html += `<li class="page-item ${isActive}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>`;
        }
        
        // 다음 페이지
        if (pagination.has_next) {
            html += `<li class="page-item">
                <a class="page-link" href="#" data-page="${pagination.current_page + 1}">다음</a>
            </li>`;
        }
        
        paginationEl.innerHTML = html;
    }

    /**
     * 필터 적용
     */
    applyFilters() {
        if (this.isLoading) return;
        
        this.currentFilters = {
            asset_id: document.getElementById('assetIdFilter')?.value || '',
            event_type: document.getElementById('eventTypeFilter')?.value || '',
            department: document.getElementById('departmentFilter')?.value || '',
            start_date: document.getElementById('startDateFilter')?.value || '',
            end_date: document.getElementById('endDateFilter')?.value || ''
        };

        this.currentPage = 1;
        this.loadLifecycleEvents();
    }

    /**
     * 필터 초기화
     */
    initializeFilters() {
        this.applyFilters();
    }

    /**
     * 고급 필터 적용
     */
    applyAdvancedFilter() {
        // 이벤트 유형 다중 선택
        const selectedTypes = [];
        document.querySelectorAll('input[name="event_types"]:checked').forEach(checkbox => {
            selectedTypes.push(checkbox.value);
        });

        // 기타 고급 필터 값들
        const minCost = document.getElementById('minCost')?.value;
        const maxCost = document.getElementById('maxCost')?.value;
        const performer = document.getElementById('performer')?.value;
        const description = document.getElementById('descriptionKeyword')?.value;

        // 필터 파라미터 구성
        const advancedFilters = {
            ...this.currentFilters,
            event_types: selectedTypes.join(','),
            min_cost: minCost,
            max_cost: maxCost,
            performer: performer,
            description: description
        };

        // 빈 값 제거
        Object.keys(advancedFilters).forEach(key => {
            if (!advancedFilters[key]) {
                delete advancedFilters[key];
            }
        });

        this.currentFilters = advancedFilters;
        this.currentPage = 1;

        // 모달 닫기
        const modal = bootstrap.Modal.getInstance(document.getElementById('eventFilterModal'));
        if (modal) {
            modal.hide();
        }

        this.loadLifecycleEvents();
    }

    /**
     * 고급 필터 초기화
     */
    clearAdvancedFilter() {
        // 체크박스 초기화
        document.querySelectorAll('input[name="event_types"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        // 입력 필드 초기화
        const fields = ['minCost', 'maxCost', 'performer', 'descriptionKeyword'];
        fields.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) element.value = '';
        });
    }

    /**
     * 이벤트 상세보기
     */
    async viewEventDetail(eventId) {
        if (!eventId) return;
        
        try {
            console.log('이벤트 상세 조회:', eventId);
            
            const response = await ApiUtils.get(`/operations/api/lifecycle-events/${eventId}`, {}, {
                showLoader: true
            });

            if (response.success && response.data) {
                this.displayEventDetailModal(response.data);
            } else {
                throw new Error(response.message || '데이터 없음');
            }

        } catch (error) {
            console.error('이벤트 상세 조회 실패:', error);
            if (UIUtils && UIUtils.showAlert) {
                UIUtils.showAlert('이벤트 상세 정보를 불러올 수 없습니다.', 'danger');
            } else {
                alert('이벤트 상세 정보를 불러올 수 없습니다.');
            }
        }
    }

    /**
     * 이벤트 상세 모달 표시
     */
    displayEventDetailModal(event) {
        const modalContent = document.getElementById('eventDetailContent');
        if (!modalContent) return;

        const html = `
            <div class="row g-3">
                <div class="col-md-6">
                    <h6 class="text-muted mb-1">자산 정보</h6>
                    <p class="mb-0">${event.asset_name || 'Unknown'} (${event.asset_number || 'N/A'})</p>
                </div>
                <div class="col-md-6">
                    <h6 class="text-muted mb-1">이벤트 유형</h6>
                    <span class="badge bg-${event.color || 'secondary'}">${event.event_type_display || event.event_type}</span>
                </div>
                <div class="col-md-6">
                    <h6 class="text-muted mb-1">발생일</h6>
                    <p class="mb-0">${event.event_date_formatted || event.event_date}</p>
                </div>
                <div class="col-md-6">
                    <h6 class="text-muted mb-1">수행자</h6>
                    <p class="mb-0">${event.performed_by || 'N/A'}</p>
                </div>
                <div class="col-md-6">
                    <h6 class="text-muted mb-1">부서</h6>
                    <p class="mb-0">${event.department || 'N/A'}</p>
                </div>
                <div class="col-md-6">
                    <h6 class="text-muted mb-1">관련 비용</h6>
                    <p class="mb-0">${event.related_cost_formatted || '0원'}</p>
                </div>
                <div class="col-12">
                    <h6 class="text-muted mb-1">설명</h6>
                    <p class="mb-0">${event.event_description || '설명 없음'}</p>
                </div>
                ${event.notes ? `
                    <div class="col-12">
                        <h6 class="text-muted mb-1">메모</h6>
                        <p class="mb-0">${event.notes}</p>
                    </div>
                ` : ''}
                <div class="col-12">
                    <h6 class="text-muted mb-1">생성일시</h6>
                    <p class="mb-0">${event.created_at_formatted || 'N/A'}</p>
                </div>
            </div>
        `;

        modalContent.innerHTML = html;

        const modal = new bootstrap.Modal(document.getElementById('eventDetailModal'));
        modal.show();
    }

    /**
     * 차트 초기화
     */
    static initCharts(eventTypeData, monthlyData) {
        const instance = window.lifecycleTracking || new LifecycleTracking();
        if (typeof Chart !== 'undefined') {
            instance.initEventTypeChart(eventTypeData);
            instance.initMonthlyChart(monthlyData);
        }
    }

    /**
     * 이벤트 유형별 차트 초기화
     */
    initEventTypeChart(data) {
        const ctx = document.getElementById('eventTypeChart');
        if (!ctx || typeof Chart === 'undefined') return;

        // 기존 차트가 있으면 제거
        if (this.charts.typeChart) {
            this.charts.typeChart.destroy();
        }

        try {
            this.charts.typeChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['취득', '배치', '유지보수', '업그레이드', '장애', '평가', '처분'],
                    datasets: [{
                        data: [
                            data?.acquisition || 5,
                            data?.deployment || 8,
                            data?.maintenance || 15,
                            data?.upgrade || 6,
                            data?.incident || 3,
                            data?.evaluation || 4,
                            data?.disposal || 2
                        ],
                        backgroundColor: [
                            '#28a745',
                            '#17a2b8',
                            '#ffc107',
                            '#007bff',
                            '#dc3545',
                            '#6f42c1',
                            '#6c757d'
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
        } catch (error) {
            console.error('이벤트 유형 차트 초기화 오류:', error);
        }
    }

    /**
     * 월별 이벤트 추이 차트 초기화
     */
    initMonthlyChart(data) {
        const ctx = document.getElementById('monthlyChart');
        if (!ctx || typeof Chart === 'undefined') return;

        // 기존 차트가 있으면 제거
        if (this.charts.monthlyChart) {
            this.charts.monthlyChart.destroy();
        }

        try {
            this.charts.monthlyChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
                    datasets: [{
                        label: '이벤트 수',
                        data: data?.monthly || [5, 8, 12, 15, 18, 22, 19, 25, 20, 16, 14, 10],
                        borderColor: '#007bff',
                        backgroundColor: 'rgba(0, 123, 255, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 5
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('월별 차트 초기화 오류:', error);
        }
    }
}

// 전역 변수로 인스턴스 설정
window.lifecycleTracking = null;
