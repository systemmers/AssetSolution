/**
 * Operations Dashboard 관리자
 * 운영 관리 대시보드의 모든 기능을 통합 관리합니다.
 * 
 * 기능:
 * - 실시간 통계 표시 및 업데이트
 * - 대시보드 카드 인터랙션 (호버, 클릭)
 * - 차트 및 그래프 관리
 * - 알림 및 경고 표시
 * - 새로고침 및 자동 업데이트
 */

import UIUtils from '../../../../common/ui-utils.js';
import ApiUtils from '../../../../common/api-utils.js';

class DashboardManager {
    constructor() {
        this.config = {
            autoRefreshInterval: (window.TIMEOUTS && window.TIMEOUTS.AUTO_REFRESH_INTERVAL) || 30000, // constants.js에서 가져오기
            animationDuration: 1000,
            chartUpdateInterval: (window.TIMEOUTS && window.TIMEOUTS.CHART_UPDATE_INTERVAL) || 5000,
            cardHoverDelay: 300
        };
        
        this.state = {
            isInitialized: false,
            autoRefreshEnabled: true,
            lastUpdated: null,
            currentStats: {},
            refreshTimer: null,
            animationQueue: []
        };
        
        this.elements = {};
        this.cleanupFunctions = [];
        this.observers = [];
    }

    /**
     * 초기화
     */
    async initialize() {
        try {
            console.log('Dashboard 모듈 초기화 시작...');
            
            // DOM 요소 캐시
            this.cacheElements();
            
            // 대시보드 카드 초기화
            this.initDashboardCards();
            
            // 실시간 통계 초기화
            this.initRealtimeStats();
            
            // 차트 초기화
            this.initCharts();
            
            // 자동 새로고침 설정
            this.setupAutoRefresh();
            
            // 이벤트 리스너 설정
            this.setupEventListeners();
            
            // 초기 데이터 로드
            await this.loadInitialData();
            
            this.state.isInitialized = true;
            this.state.lastUpdated = new Date();
            
            console.log('Dashboard 모듈 초기화 완료');
            
        } catch (error) {
            console.error('Dashboard 모듈 초기화 오류:', error);
            throw error;
        }
    }

    /**
     * DOM 요소 캐시
     */
    cacheElements() {
        this.elements = {
            // 대시보드 카드
            dashboardCards: document.querySelectorAll('.operations-dashboard-card'),
            
            // 통계 요소
            statsContainer: document.getElementById('statsContainer'),
            totalAssets: document.getElementById('totalAssets'),
            activeLoans: document.getElementById('activeLoans'),
            overdueReturns: document.getElementById('overdueReturns'),
            todayDisposals: document.getElementById('todayDisposals'),
            
            // 차트 컨테이너
            chartContainers: {
                loanTrend: document.getElementById('loanTrendChart'),
                assetCategory: document.getElementById('assetCategoryChart'),
                utilizationRate: document.getElementById('utilizationRateChart')
            },
            
            // 컨트롤 요소
            refreshButton: document.getElementById('refreshDashboard'),
            autoRefreshToggle: document.getElementById('autoRefreshToggle'),
            lastUpdatedDisplay: document.getElementById('lastUpdated'),
            
            // 알림 영역
            alertContainer: document.getElementById('alertContainer'),
            notificationBadges: document.querySelectorAll('.notification-badge')
        };
    }

    /**
     * 대시보드 카드 초기화
     */
    initDashboardCards() {
        if (!this.elements.dashboardCards.length) return;
        
        this.elements.dashboardCards.forEach(card => {
            // 호버 효과 설정
            this.setupCardHoverEffect(card);
            
            // 클릭 이벤트 설정
            this.setupCardClickHandler(card);
            
            // 상태 표시 설정
            this.setupCardStatusIndicator(card);
        });
    }

    /**
     * 카드 호버 효과 설정
     * @param {Element} card - 대시보드 카드 요소
     */
    setupCardHoverEffect(card) {
        let hoverTimeout;
        
        const handleMouseEnter = () => {
            hoverTimeout = setTimeout(() => {
                card.classList.add('shadow-lg');
                card.style.transform = 'translateY(-8px)';
                card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                
                // 카드 내 아이콘 애니메이션
                const icon = card.querySelector('.card-icon');
                if (icon) {
                    icon.style.transform = 'scale(1.1) rotate(5deg)';
                    icon.style.transition = 'transform 0.3s ease';
                }
            }, this.config.cardHoverDelay);
        };
        
        const handleMouseLeave = () => {
            clearTimeout(hoverTimeout);
            card.classList.remove('shadow-lg');
            card.style.transform = 'translateY(0)';
            
            const icon = card.querySelector('.card-icon');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
        };
        
        card.addEventListener('mouseenter', handleMouseEnter);
        card.addEventListener('mouseleave', handleMouseLeave);
        
        this.cleanupFunctions.push(() => {
            clearTimeout(hoverTimeout);
            card.removeEventListener('mouseenter', handleMouseEnter);
            card.removeEventListener('mouseleave', handleMouseLeave);
        });
    }

    /**
     * 카드 클릭 핸들러 설정
     * @param {Element} card - 대시보드 카드 요소
     */
    setupCardClickHandler(card) {
        const handleCardClick = (event) => {
            // 링크 클릭이 아닌 경우만 처리
            if (event.target.tagName !== 'A') {
                const link = card.querySelector('.card-footer a, .card-body a');
                if (link) {
                    // 클릭 효과 애니메이션
                    card.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        card.style.transform = '';
                        link.click();
                    }, 150);
                }
            }
        };
        
        card.addEventListener('click', handleCardClick);
        this.cleanupFunctions.push(() => {
            card.removeEventListener('click', handleCardClick);
        });
    }

    /**
     * 카드 상태 표시 설정
     * @param {Element} card - 대시보드 카드 요소
     */
    setupCardStatusIndicator(card) {
        const statusIndicator = card.querySelector('.status-indicator');
        if (!statusIndicator) return;
        
        // 카드 종류에 따른 상태 확인
        const cardType = card.dataset.cardType;
        this.updateCardStatus(card, cardType);
    }

    /**
     * 실시간 통계 초기화
     */
    initRealtimeStats() {
        // Intersection Observer로 화면에 보일 때만 업데이트
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.startRealtimeUpdates();
                    } else {
                        this.pauseRealtimeUpdates();
                    }
                });
            }, { threshold: 0.1 });
            
            if (this.elements.statsContainer) {
                observer.observe(this.elements.statsContainer);
                this.observers.push(observer);
            }
        }
    }

    /**
     * 차트 초기화
     */
    initCharts() {
        // Chart.js 또는 다른 차트 라이브러리가 로드된 경우에만 실행
        if (typeof Chart !== 'undefined') {
            this.initLoanTrendChart();
            this.initAssetCategoryChart();
            this.initUtilizationRateChart();
        } else {
            console.warn('차트 라이브러리가 로드되지 않았습니다.');
        }
    }

    /**
     * 대여 추세 차트 초기화
     */
    initLoanTrendChart() {
        const container = this.elements.chartContainers.loanTrend;
        if (!container) return;
        
        const ctx = container.getContext('2d');
        this.charts = this.charts || {};
        
        this.charts.loanTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
                datasets: [{
                    label: '대여 건수',
                    data: [12, 19, 15, 25, 22, 30],
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
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

    /**
     * 자산 카테고리 차트 초기화
     */
    initAssetCategoryChart() {
        const container = this.elements.chartContainers.assetCategory;
        if (!container) return;
        
        const ctx = container.getContext('2d');
        this.charts = this.charts || {};
        
        this.charts.assetCategory = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['IT 장비', '사무용품', '차량', '기타'],
                datasets: [{
                    data: [45, 25, 20, 10],
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0'
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
     * 이용률 차트 초기화
     */
    initUtilizationRateChart() {
        const container = this.elements.chartContainers.utilizationRate;
        if (!container) return;
        
        const ctx = container.getContext('2d');
        this.charts = this.charts || {};
        
        this.charts.utilizationRate = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['월', '화', '수', '목', '금', '토', '일'],
                datasets: [{
                    label: '이용률 (%)',
                    data: [85, 92, 78, 88, 95, 45, 30],
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    /**
     * 자동 새로고침 설정
     */
    setupAutoRefresh() {
        if (this.elements.autoRefreshToggle) {
            const handleToggle = () => {
                this.state.autoRefreshEnabled = this.elements.autoRefreshToggle.checked;
                if (this.state.autoRefreshEnabled) {
                    this.startAutoRefresh();
                } else {
                    this.stopAutoRefresh();
                }
            };
            
            this.elements.autoRefreshToggle.addEventListener('change', handleToggle);
            this.cleanupFunctions.push(() => {
                this.elements.autoRefreshToggle.removeEventListener('change', handleToggle);
            });
        }
        
        // 기본적으로 자동 새로고침 시작
        if (this.state.autoRefreshEnabled) {
            this.startAutoRefresh();
        }
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 수동 새로고침 버튼
        if (this.elements.refreshButton) {
            const handleRefresh = () => {
                this.refreshDashboard();
            };
            
            this.elements.refreshButton.addEventListener('click', handleRefresh);
            this.cleanupFunctions.push(() => {
                this.elements.refreshButton.removeEventListener('click', handleRefresh);
            });
        }
        
        // 윈도우 포커스 이벤트
        const handleFocus = () => {
            if (this.state.autoRefreshEnabled) {
                this.refreshDashboard();
            }
        };
        
        const handleBlur = () => {
            // 페이지가 백그라운드로 가면 업데이트 주기 늘리기
            this.pauseRealtimeUpdates();
        };
        
        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);
        
        this.cleanupFunctions.push(() => {
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);
        });
    }

    /**
     * 초기 데이터 로드
     */
    async loadInitialData() {
        try {
            // 통계 데이터 로드
            await this.loadStatsData();
            
            // 차트 데이터 로드
            await this.loadChartData();
            
            // 알림 데이터 로드
            await this.loadNotificationData();
            
        } catch (error) {
            console.error('초기 데이터 로드 오류:', error);
            this.showError('데이터를 불러오는 중 오류가 발생했습니다.');
        }
    }

    /**
     * 통계 데이터 로드
     */
    async loadStatsData() {
        try {
            const response = await ApiUtils.get('/api/operations/dashboard/stats');
            
            if (response.success) {
                this.updateStats(response.data);
            } else {
                throw new Error(response.message || '통계 데이터 로드 실패');
            }
            
        } catch (error) {
            console.error('통계 데이터 로드 오류:', error);
            // 에러 발생 시 기본값 표시
            this.updateStats({
                totalAssets: 0,
                activeLoans: 0,
                overdueReturns: 0,
                todayDisposals: 0
            });
            this.showError('통계 데이터를 불러오는 중 오류가 발생했습니다.');
        }
    }

    /**
     * 통계 업데이트
     * @param {Object} stats - 통계 데이터
     */
    updateStats(stats) {
        this.state.currentStats = { ...stats };
        
        // 애니메이션과 함께 값 업데이트
        Object.entries(stats).forEach(([key, value]) => {
            const element = this.elements[key];
            if (element) {
                this.animateValue(element, parseInt(element.textContent) || 0, value);
            }
        });
    }

    /**
     * 숫자 애니메이션
     * @param {Element} element - 대상 요소
     * @param {number} start - 시작 값
     * @param {number} end - 종료 값
     */
    animateValue(element, start, end) {
        if (start === end) return;
        
        const duration = this.config.animationDuration;
        const range = end - start;
        const startTime = Date.now();
        
        // 변화 방향에 따른 색상 효과
        const isIncrease = end > start;
        element.style.transition = 'color 0.3s ease';
        element.style.color = isIncrease ? '#28a745' : '#dc3545';
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // easeOutCubic 이징 함수
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.round(start + (range * easeProgress));
            
            element.textContent = currentValue.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // 애니메이션 완료 후 색상 복원
                setTimeout(() => {
                    element.style.color = '';
                }, 1000);
            }
        };
        
        requestAnimationFrame(animate);
    }

    /**
     * 자동 새로고침 시작
     */
    startAutoRefresh() {
        this.stopAutoRefresh(); // 기존 타이머 정리
        
        this.state.refreshTimer = setInterval(() => {
            this.refreshDashboard();
        }, this.config.autoRefreshInterval);
    }

    /**
     * 자동 새로고침 중지
     */
    stopAutoRefresh() {
        if (this.state.refreshTimer) {
            clearInterval(this.state.refreshTimer);
            this.state.refreshTimer = null;
        }
    }

    /**
     * 대시보드 새로고침
     */
    async refreshDashboard() {
        try {
            // 새로고침 버튼 상태 변경
            if (this.elements.refreshButton) {
                this.elements.refreshButton.disabled = true;
                this.elements.refreshButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 새로고침 중...';
            }
            
            // 데이터 다시 로드
            await this.loadStatsData();
            await this.updateChartData();
            await this.loadNotificationData();
            
            // 마지막 업데이트 시간 표시
            this.updateLastUpdatedTime();
            
        } catch (error) {
            console.error('대시보드 새로고침 오류:', error);
            this.showError('새로고침 중 오류가 발생했습니다.');
        } finally {
            // 새로고침 버튼 복원
            if (this.elements.refreshButton) {
                this.elements.refreshButton.disabled = false;
                this.elements.refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> 새로고침';
            }
        }
    }

    /**
     * 마지막 업데이트 시간 갱신
     */
    updateLastUpdatedTime() {
        this.state.lastUpdated = new Date();
        
        if (this.elements.lastUpdatedDisplay) {
            const timeString = this.state.lastUpdated.toLocaleTimeString('ko-KR');
            this.elements.lastUpdatedDisplay.textContent = `마지막 업데이트: ${timeString}`;
        }
    }

    /**
     * 실시간 업데이트 시작
     */
    startRealtimeUpdates() {
        // 웹소켓 또는 Server-Sent Events 구현
        console.log('실시간 업데이트 시작');
    }

    /**
     * 실시간 업데이트 일시정지
     */
    pauseRealtimeUpdates() {
        console.log('실시간 업데이트 일시정지');
    }

    /**
     * 차트 데이터 업데이트
     */
    async updateChartData() {
        if (!this.charts) return;
        
        try {
            // 실제 API에서 최신 차트 데이터 로드
            await this.loadChartData();
            
        } catch (error) {
            console.error('차트 데이터 업데이트 오류:', error);
        }
    }

    /**
     * 알림 데이터 로드
     */
    async loadNotificationData() {
        try {
            const response = await ApiUtils.get('/api/operations/dashboard/notifications');
            
            if (response.success) {
                this.updateNotificationBadges(response.data);
            } else {
                throw new Error(response.message || '알림 데이터 로드 실패');
            }
            
        } catch (error) {
            console.error('알림 데이터 로드 오류:', error);
            // 에러 발생 시 기본값 표시
            this.updateNotificationBadges({
                overdueCount: 0,
                maintenanceRequired: 0,
                newRequests: 0
            });
        }
    }

    /**
     * 알림 배지 업데이트
     * @param {Object} notifications - 알림 데이터
     */
    updateNotificationBadges(notifications) {
        this.elements.notificationBadges.forEach(badge => {
            const type = badge.dataset.notificationType;
            if (notifications[type] !== undefined) {
                const count = notifications[type];
                badge.textContent = count;
                badge.style.display = count > 0 ? 'inline-block' : 'none';
            }
        });
    }

    /**
     * 카드 상태 업데이트
     * @param {Element} card - 카드 요소
     * @param {string} cardType - 카드 타입
     */
    updateCardStatus(card, cardType) {
        const statusIndicator = card.querySelector('.status-indicator');
        if (!statusIndicator) return;
        
        // 카드 타입별 상태 로직
        switch (cardType) {
            case 'loans':
                const activeLoans = this.state.currentStats.activeLoans || 0;
                statusIndicator.className = activeLoans > 20 ? 'status-indicator status-warning' : 'status-indicator status-success';
                break;
                
            case 'overdue':
                const overdueCount = this.state.currentStats.overdueReturns || 0;
                statusIndicator.className = overdueCount > 0 ? 'status-indicator status-danger' : 'status-indicator status-success';
                break;
        }
    }

    /**
     * 오류 메시지 표시
     * @param {string} message - 오류 메시지
     */
    showError(message) {
        if (this.elements.alertContainer) {
            const alert = document.createElement('div');
            alert.className = 'alert alert-danger alert-dismissible fade show';
            alert.innerHTML = `
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            
            this.elements.alertContainer.appendChild(alert);
            
            // 5초 후 자동 제거
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.remove();
                }
            }, 5000);
        }
    }

    /**
     * 설정 내보내기
     * @returns {Object} 현재 설정
     */
    exportSettings() {
        return {
            autoRefreshEnabled: this.state.autoRefreshEnabled,
            autoRefreshInterval: this.config.autoRefreshInterval,
            chartSettings: {
                // 차트별 설정
            }
        };
    }

    /**
     * 설정 가져오기
     * @param {Object} settings - 가져올 설정
     */
    importSettings(settings) {
        if (settings.autoRefreshEnabled !== undefined) {
            this.state.autoRefreshEnabled = settings.autoRefreshEnabled;
            if (this.elements.autoRefreshToggle) {
                this.elements.autoRefreshToggle.checked = settings.autoRefreshEnabled;
            }
        }
        
        if (settings.autoRefreshInterval) {
            this.config.autoRefreshInterval = settings.autoRefreshInterval;
        }
    }

    /**
     * 정리
     */
    cleanup() {
        // 타이머 정리
        this.stopAutoRefresh();
        
        // 옵저버 정리
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
        
        // 이벤트 리스너 정리
        this.cleanupFunctions.forEach(fn => {
            if (typeof fn === 'function') fn();
        });
        this.cleanupFunctions = [];
        
        // 차트 정리
        if (this.charts) {
            Object.values(this.charts).forEach(chart => {
                if (chart && typeof chart.destroy === 'function') {
                    chart.destroy();
                }
            });
            this.charts = null;
        }
        
        // 상태 초기화
        this.state.isInitialized = false;
        
        console.log('Dashboard 모듈 정리 완료');
    }

    /**
     * 차트 데이터 로드
     */
    async loadChartData() {
        try {
            const response = await ApiUtils.get('/api/operations/dashboard/charts');
            
            if (response.success) {
                this.updateChartsWithData(response.data);
            } else {
                throw new Error(response.message || '차트 데이터 로드 실패');
            }
            
        } catch (error) {
            console.error('차트 데이터 로드 오류:', error);
            // 에러 발생 시 기본 차트 데이터 유지
        }
    }

    /**
     * 차트 데이터 업데이트
     * @param {Object} chartData - 차트 데이터
     */
    updateChartsWithData(chartData) {
        if (!this.charts) return;
        
        // 대여 추세 차트 업데이트
        if (this.charts.loanTrend && chartData.loanTrend) {
            this.charts.loanTrend.data.labels = chartData.loanTrend.labels;
            this.charts.loanTrend.data.datasets[0].data = chartData.loanTrend.data;
            this.charts.loanTrend.update();
        }
        
        // 자산 카테고리 차트 업데이트
        if (this.charts.assetCategory && chartData.assetCategory) {
            this.charts.assetCategory.data.labels = chartData.assetCategory.labels;
            this.charts.assetCategory.data.datasets[0].data = chartData.assetCategory.data;
            this.charts.assetCategory.update();
        }
        
        // 이용률 차트 업데이트
        if (this.charts.utilizationRate && chartData.utilizationRate) {
            this.charts.utilizationRate.data.labels = chartData.utilizationRate.labels;
            this.charts.utilizationRate.data.datasets[0].data = chartData.utilizationRate.data;
            this.charts.utilizationRate.update();
        }
    }
}

export default DashboardManager; 