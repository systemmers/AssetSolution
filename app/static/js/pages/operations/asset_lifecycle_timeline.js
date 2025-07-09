/**
 * 자산별 생명주기 타임라인 모듈
 * 특정 자산의 상세 생명주기 이벤트 타임라인 관리
 */

class AssetLifecycleTimeline {
    constructor(assetId) {
        this.assetId = assetId;
        this.selectedEventTypes = [];
        this.currentSortBy = 'date_desc';
        this.currentPage = 1;
        this.itemsPerPage = 20;
    }

    /**
     * 모듈 초기화
     */
    static init(assetId) {
        const instance = new AssetLifecycleTimeline(assetId);
        instance.bindEvents();
        instance.loadAssetTimeline();
        return instance;
    }

    /**
     * 이벤트 바인딩
     */
    bindEvents() {
        // 이벤트 유형 필터 버튼
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('event-type-filter')) {
                e.preventDefault();
                this.toggleEventTypeFilter(e.target);
            }
        });

        // 정렬 변경
        const sortSelect = document.getElementById('timelineSortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSortBy = e.target.value;
                this.loadAssetTimeline();
            });
        }

        // 페이지네이션 이벤트
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('timeline-page-link')) {
                e.preventDefault();
                const page = parseInt(e.target.dataset.page);
                if (page && page !== this.currentPage) {
                    this.currentPage = page;
                    this.loadAssetTimeline();
                }
            }
        });

        // 이벤트 상세보기
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-view-timeline-event')) {
                e.preventDefault();
                const eventId = e.target.dataset.eventId;
                this.viewTimelineEventDetail(eventId);
            }
        });

        // 이벤트 추가 모달
        document.addEventListener('click', (e) => {
            if (e.target.id === 'saveNewEventBtn') {
                this.saveNewEvent();
            }
        });

        // 전체보기 토글
        const showAllToggle = document.getElementById('showAllEventsToggle');
        if (showAllToggle) {
            showAllToggle.addEventListener('change', () => {
                this.loadAssetTimeline();
            });
        }
    }

    /**
     * 이벤트 유형 필터 토글
     */
    toggleEventTypeFilter(button) {
        const eventType = button.dataset.eventType;
        
        if (button.classList.contains('active')) {
            // 필터 해제
            button.classList.remove('active');
            this.selectedEventTypes = this.selectedEventTypes.filter(type => type !== eventType);
        } else {
            // 필터 추가
            button.classList.add('active');
            this.selectedEventTypes.push(eventType);
        }

        this.currentPage = 1;
        this.loadAssetTimeline();
    }

    /**
     * 자산 타임라인 데이터 로드
     */
    async loadAssetTimeline() {
        try {
            const params = {
                page: this.currentPage,
                per_page: this.itemsPerPage,
                sort_by: this.currentSortBy,
                event_types: this.selectedEventTypes.join(','),
                show_all: document.getElementById('showAllEventsToggle')?.checked || false
            };

            // 빈 값 제거
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === false) {
                    delete params[key];
                }
            });

            const response = await ApiUtils.get(
                `/operations/api/lifecycle-events/asset/${this.assetId}`, 
                params, 
                {
                    showLoader: true,
                    loaderSelector: '.timeline-events-loader'
                }
            );

            this.displayTimelineEvents(response.data || []);
            this.updateTimelinePagination(response.pagination || {});
            this.updateAssetStatistics(response.asset_stats || {});

        } catch (error) {
            console.error('자산 타임라인 로드 실패:', error);
            this.displayTimelineEmptyState('타임라인 데이터를 불러오는 중 오류가 발생했습니다.');
        }
    }

    /**
     * 타임라인 이벤트 목록 표시
     */
    displayTimelineEvents(events) {
        const container = document.querySelector('.asset-timeline');
        if (!container) return;

        if (events.length === 0) {
            this.displayTimelineEmptyState();
            return;
        }

        const html = events.map((event, index) => `
            <div class="timeline-event" data-event-id="${event.id}">
                <div class="timeline-event-marker bg-${event.color}">
                    <i class="${event.icon}"></i>
                </div>
                <div class="timeline-event-content">
                    <div class="timeline-event-header">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="flex-grow-1">
                                <h6 class="mb-1">
                                    <span class="badge bg-${event.color} me-2">${event.event_type_display}</span>
                                    ${event.event_description}
                                </h6>
                                <div class="d-flex align-items-center gap-3 text-muted small">
                                    <span><i class="fas fa-user me-1"></i>${event.performed_by}</span>
                                    <span><i class="fas fa-building me-1"></i>${event.department}</span>
                                    ${event.related_cost > 0 ? `
                                        <span><i class="fas fa-won-sign me-1"></i>${event.related_cost_formatted}</span>
                                    ` : ''}
                                </div>
                            </div>
                            <div class="text-end">
                                <div class="text-primary fw-medium">${event.event_date_formatted}</div>
                                <small class="text-muted">${event.time_ago_text}</small>
                            </div>
                        </div>
                    </div>
                    ${event.notes ? `
                        <div class="timeline-event-body mt-2">
                            <div class="alert alert-light mb-0 py-2">
                                <small><i class="fas fa-sticky-note me-1"></i> ${event.notes}</small>
                            </div>
                        </div>
                    ` : ''}
                    <div class="timeline-event-actions mt-2">
                        <button type="button" class="btn btn-sm btn-outline-primary btn-view-timeline-event" 
                                data-event-id="${event.id}">
                            <i class="fas fa-eye me-1"></i> 상세보기
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
        this.animateTimelineEvents();
    }

    /**
     * 타임라인 이벤트 애니메이션
     */
    animateTimelineEvents() {
        const events = document.querySelectorAll('.timeline-event');
        events.forEach((event, index) => {
            event.style.opacity = '0';
            event.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                event.style.transition = 'all 0.6s ease';
                event.style.opacity = '1';
                event.style.transform = 'translateY(0)';
            }, index * 150);
        });
    }

    /**
     * 타임라인 빈 상태 표시
     */
    displayTimelineEmptyState(message = '선택한 조건에 해당하는 이벤트가 없습니다.') {
        const container = document.querySelector('.asset-timeline');
        if (!container) return;

        container.innerHTML = `
            <div class="timeline-empty-state">
                <div class="text-center py-5">
                    <i class="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">이벤트 없음</h5>
                    <p class="text-muted">${message}</p>
                    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addEventModal">
                        <i class="fas fa-plus me-1"></i> 첫 번째 이벤트 추가
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * 자산 통계 업데이트
     */
    updateAssetStatistics(stats) {
        const elements = {
            totalEvents: document.querySelector('[data-asset-stat="total-events"]'),
            firstEvent: document.querySelector('[data-asset-stat="first-event"]'),
            lastEvent: document.querySelector('[data-asset-stat="last-event"]'),
            totalCosts: document.querySelector('[data-asset-stat="total-costs"]')
        };

        if (elements.totalEvents) elements.totalEvents.textContent = stats.total_events || 0;
        if (elements.firstEvent) elements.firstEvent.textContent = stats.first_event_date || '-';
        if (elements.lastEvent) elements.lastEvent.textContent = stats.last_event_date || '-';
        if (elements.totalCosts) elements.totalCosts.textContent = stats.total_costs_formatted || '0원';
    }

    /**
     * 타임라인 페이지네이션 업데이트
     */
    updateTimelinePagination(pagination) {
        const paginationEl = document.querySelector('.timeline-pagination');
        if (!paginationEl || pagination.total_pages <= 1) {
            if (paginationEl) paginationEl.style.display = 'none';
            return;
        }

        paginationEl.style.display = 'flex';
        
        let html = '';
        
        // 이전 버튼
        if (pagination.has_prev) {
            html += `
                <li class="page-item">
                    <a class="page-link timeline-page-link" href="#" data-page="${pagination.prev_num}">
                        <i class="fas fa-chevron-left"></i>
                    </a>
                </li>
            `;
        }

        // 페이지 번호들
        for (let i = Math.max(1, this.currentPage - 2); i <= Math.min(pagination.total_pages, this.currentPage + 2); i++) {
            html += `
                <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                    <a class="page-link timeline-page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }

        // 다음 버튼
        if (pagination.has_next) {
            html += `
                <li class="page-item">
                    <a class="page-link timeline-page-link" href="#" data-page="${pagination.next_num}">
                        <i class="fas fa-chevron-right"></i>
                    </a>
                </li>
            `;
        }

        paginationEl.innerHTML = html;
    }

    /**
     * 타임라인 이벤트 상세보기
     */
    async viewTimelineEventDetail(eventId) {
        try {
            const response = await ApiUtils.get(`/operations/api/lifecycle-events/${eventId}`, {}, {
                showLoader: true
            });

            this.displayTimelineEventDetailModal(response.data);

        } catch (error) {
            console.error('타임라인 이벤트 상세 조회 실패:', error);
            if (UIUtils && UIUtils.showAlert) {
                UIUtils.showAlert('이벤트 상세 정보를 불러올 수 없습니다.', 'danger');
            } else {
                alert('이벤트 상세 정보를 불러올 수 없습니다.');
            }
        }
    }

    /**
     * 타임라인 이벤트 상세 모달 표시
     */
    displayTimelineEventDetailModal(event) {
        const modalContent = document.getElementById('timelineEventDetailContent');
        if (!modalContent) return;

        const html = `
            <div class="row g-3">
                <div class="col-md-6">
                    <h6 class="text-muted mb-1">이벤트 유형</h6>
                    <span class="badge bg-${event.color}">${event.event_type_display}</span>
                </div>
                <div class="col-md-6">
                    <h6 class="text-muted mb-1">발생일</h6>
                    <p class="mb-0">${event.event_date_formatted}</p>
                </div>
                <div class="col-md-6">
                    <h6 class="text-muted mb-1">수행자</h6>
                    <p class="mb-0">${event.performed_by}</p>
                </div>
                <div class="col-md-6">
                    <h6 class="text-muted mb-1">부서</h6>
                    <p class="mb-0">${event.department}</p>
                </div>
                <div class="col-md-6">
                    <h6 class="text-muted mb-1">관련 비용</h6>
                    <p class="mb-0">${event.related_cost_formatted}</p>
                </div>
                <div class="col-md-6">
                    <h6 class="text-muted mb-1">경과 시간</h6>
                    <p class="mb-0">${event.time_ago_text}</p>
                </div>
                <div class="col-12">
                    <h6 class="text-muted mb-1">설명</h6>
                    <p class="mb-0">${event.event_description}</p>
                </div>
                ${event.notes ? `
                    <div class="col-12">
                        <h6 class="text-muted mb-1">메모</h6>
                        <div class="alert alert-light mb-0">
                            ${event.notes}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        modalContent.innerHTML = html;

        const modal = new bootstrap.Modal(document.getElementById('timelineEventDetailModal'));
        modal.show();
    }

    /**
     * 새 이벤트 저장
     */
    async saveNewEvent() {
        try {
            const form = document.getElementById('addEventForm');
            const formData = new FormData(form);
            
            const eventData = {
                asset_id: this.assetId,
                event_type: formData.get('event_type'),
                event_date: formData.get('event_date'),
                event_description: formData.get('event_description'),
                performed_by: formData.get('performed_by'),
                department: formData.get('department'),
                related_cost: parseFloat(formData.get('related_cost')) || 0,
                notes: formData.get('notes')
            };

            const response = await ApiUtils.post('/operations/api/lifecycle-events', eventData, {
                showLoader: true
            });

            if (response.success) {
                // 모달 닫기
                const modal = bootstrap.Modal.getInstance(document.getElementById('addEventModal'));
                if (modal) {
                    modal.hide();
                }

                // 폼 초기화
                form.reset();

                // 타임라인 새로고침
                this.currentPage = 1;
                this.loadAssetTimeline();

                // 성공 메시지
                if (UIUtils && UIUtils.showAlert) {
                    UIUtils.showAlert('새 이벤트가 추가되었습니다.', 'success');
                } else {
                    alert('새 이벤트가 추가되었습니다.');
                }
            }

        } catch (error) {
            console.error('이벤트 저장 실패:', error);
            if (UIUtils && UIUtils.showAlert) {
                UIUtils.showAlert('이벤트 저장 중 오류가 발생했습니다.', 'danger');
            } else {
                alert('이벤트 저장 중 오류가 발생했습니다.');
            }
        }
    }

    /**
     * 필터 초기화
     */
    clearAllFilters() {
        // 이벤트 유형 필터 버튼 비활성화
        document.querySelectorAll('.event-type-filter.active').forEach(button => {
            button.classList.remove('active');
        });

        // 선택된 이벤트 유형 초기화
        this.selectedEventTypes = [];

        // 정렬 초기화
        const sortSelect = document.getElementById('timelineSortSelect');
        if (sortSelect) {
            sortSelect.value = 'date_desc';
            this.currentSortBy = 'date_desc';
        }

        // 전체보기 토글 초기화
        const showAllToggle = document.getElementById('showAllEventsToggle');
        if (showAllToggle) {
            showAllToggle.checked = false;
        }

        this.currentPage = 1;
        this.loadAssetTimeline();
    }
}

// 전역 변수로 인스턴스 설정
window.assetLifecycleTimeline = null;

// 전역 함수들 (템플릿에서 호출)
window.filterByEventType = function(eventType) {
    if (window.assetLifecycleTimeline) {
        const button = document.querySelector(`[data-event-type="${eventType}"]`);
        if (button) {
            window.assetLifecycleTimeline.toggleEventTypeFilter(button);
        }
    }
};

window.sortTimeline = function(sortBy) {
    if (window.assetLifecycleTimeline) {
        window.assetLifecycleTimeline.currentSortBy = sortBy;
        window.assetLifecycleTimeline.loadAssetTimeline();
    }
};

window.clearTimelineFilters = function() {
    if (window.assetLifecycleTimeline) {
        window.assetLifecycleTimeline.clearAllFilters();
    }
};

window.saveNewTimelineEvent = function() {
    if (window.assetLifecycleTimeline) {
        window.assetLifecycleTimeline.saveNewEvent();
    }
};

// DOM 로드 완료 후 초기화 (자산 ID는 템플릿에서 전달)
document.addEventListener('DOMContentLoaded', function() {
    const assetId = window.currentAssetId;
    if (assetId) {
        window.assetLifecycleTimeline = AssetLifecycleTimeline.init(assetId);
    }
}); 