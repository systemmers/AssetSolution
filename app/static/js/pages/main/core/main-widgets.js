/**
 * 메인 위젯 관리 모듈
 * 프로그레스 바, 차트, 알림 등 대시보드 위젯 관리
 * 
 * @author Asset Management System
 * @version 1.0.0
 */

// 공통 모듈 가져오기
import UIUtils from '../../../../common/ui-utils.js';
import LayoutUtils from '../../../../common/layout-utils.js';
import ApiUtils from '../../../../common/api-utils.js';

/**
 * MainWidgets 클래스
 * 대시보드 위젯들의 초기화 및 관리
 */
class MainWidgets {
    constructor() {
        this.progressBars = [];
        this.notificationHandlers = [];
        this.chartInstances = new Map();
        this.animationFrameId = null;
        this.config = {
            progressAnimationDuration: 1000,
            progressAnimationDelay: 100,
            notificationAutoMarkRead: (window.TIMEOUTS && window.TIMEOUTS.NOTIFICATION_AUTO_MARK_READ) || 5000, // constants.js에서 가져오기
            chartUpdateInterval: (window.TIMEOUTS && window.TIMEOUTS.CHART_UPDATE_INTERVAL) || 30000 // constants.js에서 가져오기
        };
        
        // 바인딩
        this.handleNotificationClick = this.handleNotificationClick.bind(this);
        this.handleDashboardRefresh = this.handleDashboardRefresh.bind(this);
    }

    /**
     * 위젯 초기화
     * @returns {Function} cleanup 함수
     */
    initialize() {
        console.log('MainWidgets 초기화 중...');
        
        try {
            this.initializeProgressBars();
            this.initializeNotifications();
            this.initializeCharts();
            this.setupEventListeners();
            
            return this.cleanup.bind(this);
        } catch (error) {
            console.error('MainWidgets 초기화 실패:', error);
            UIUtils.showAlert('위젯 초기화 중 오류가 발생했습니다.', 'warning', 3000);
            return null;
        }
    }

    /**
     * 프로그레스 바 초기화
     */
    initializeProgressBars() {
        const progressBars = document.querySelectorAll('.progress-bar');
        
        progressBars.forEach((bar, index) => {
            const width = bar.getAttribute('data-width');
            if (width) {
                // 초기 상태 설정
                bar.style.width = '0%';
                bar.style.transition = `width ${this.config.progressAnimationDuration}ms ease-in-out`;
                
                // 순차적 애니메이션 실행
                setTimeout(() => {
                    this.animateProgressBar(bar, parseInt(width));
                }, this.config.progressAnimationDelay * (index + 1));
                
                this.progressBars.push({
                    element: bar,
                    targetWidth: parseInt(width),
                    currentWidth: 0
                });
            }
        });
        
        // 레이아웃 조정
        LayoutUtils.adjustLayout();
        console.log(`${progressBars.length}개의 프로그레스 바 초기화 완료`);
    }

    /**
     * 프로그레스 바 애니메이션
     * @param {HTMLElement} bar - 프로그레스 바 요소
     * @param {number} targetWidth - 목표 너비 (%)
     */
    animateProgressBar(bar, targetWidth) {
        // CSS 트랜지션 사용하여 부드러운 애니메이션
        bar.style.width = `${targetWidth}%`;
        
        // 애니메이션 완료 후 접근성 속성 업데이트
        setTimeout(() => {
            bar.setAttribute('aria-valuenow', targetWidth);
            
            // 툴팁 추가 (있는 경우)
            if (bar.hasAttribute('data-toggle')) {
                bar.setAttribute('title', `${targetWidth}% 완료`);
            }
        }, this.config.progressAnimationDuration);
    }

    /**
     * 프로그레스 바 업데이트
     * @param {string} selector - 프로그레스 바 선택자
     * @param {number} newWidth - 새로운 너비 (%)
     */
    updateProgressBar(selector, newWidth) {
        const bar = document.querySelector(selector);
        if (bar) {
            this.animateProgressBar(bar, newWidth);
            
            // 내부 저장소 업데이트
            const stored = this.progressBars.find(pb => pb.element === bar);
            if (stored) {
                stored.targetWidth = newWidth;
            }
        }
    }

    /**
     * 차트 초기화
     */
    initializeCharts() {
        // Chart.js가 로드되어 있는지 확인
        if (typeof Chart === 'undefined') {
            console.log('Chart.js가 로드되지 않았습니다. 차트 기능을 건너뜁니다.');
            return;
        }

        this.initializeAssetChart();
        this.initializeContractChart();
        this.initializeTrendChart();
        
        console.log('차트 초기화 완료');
    }

    /**
     * 자산 현황 차트 초기화
     */
    initializeAssetChart() {
        const assetChartCanvas = document.getElementById('assetChart');
        if (!assetChartCanvas) return;

        try {
            const ctx = assetChartCanvas.getContext('2d');
            const assetChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['IT장비', '사무용품', '차량', '부동산', '기타'],
                    datasets: [{
                        data: [35, 25, 15, 20, 5],
                        backgroundColor: [
                            '#007bff',
                            '#28a745',
                            '#ffc107',
                            '#dc3545',
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

            this.chartInstances.set('assetChart', assetChart);
        } catch (error) {
            console.error('자산 차트 초기화 실패:', error);
        }
    }

    /**
     * 계약 현황 차트 초기화
     */
    initializeContractChart() {
        const contractChartCanvas = document.getElementById('contractChart');
        if (!contractChartCanvas) return;

        try {
            const ctx = contractChartCanvas.getContext('2d');
            const contractChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['임대계약', '구매계약', '유지보수', '기타'],
                    datasets: [{
                        label: '계약 건수',
                        data: [12, 8, 5, 3],
                        backgroundColor: '#007bff'
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
                    }
                }
            });

            this.chartInstances.set('contractChart', contractChart);
        } catch (error) {
            console.error('계약 차트 초기화 실패:', error);
        }
    }

    /**
     * 트렌드 차트 초기화
     */
    initializeTrendChart() {
        const trendChartCanvas = document.getElementById('trendChart');
        if (!trendChartCanvas) return;

        try {
            const ctx = trendChartCanvas.getContext('2d');
            const trendChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
                    datasets: [{
                        label: '자산 추가',
                        data: [12, 19, 3, 5, 2, 3],
                        borderColor: '#007bff',
                        tension: 0.4
                    }, {
                        label: '자산 폐기',
                        data: [2, 3, 1, 2, 1, 1],
                        borderColor: '#dc3545',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });

            this.chartInstances.set('trendChart', trendChart);
        } catch (error) {
            console.error('트렌드 차트 초기화 실패:', error);
        }
    }

    /**
     * 알림 초기화
     */
    initializeNotifications() {
        const notificationLinks = document.querySelectorAll('.list-group-item[data-notification]');
        
        notificationLinks.forEach(link => {
            // 클릭 이벤트 핸들러 등록
            link.addEventListener('click', this.handleNotificationClick);
            this.notificationHandlers.push({ element: link, handler: this.handleNotificationClick });

            // 자동 읽음 처리 (옵션)
            if (link.hasAttribute('data-auto-read')) {
                setTimeout(() => {
                    this.markNotificationAsRead(link);
                }, this.config.notificationAutoMarkRead);
            }
        });

        console.log(`${notificationLinks.length}개의 알림 초기화 완료`);
    }

    /**
     * 알림 클릭 핸들러
     * @param {Event} e - 클릭 이벤트
     */
    async handleNotificationClick(e) {
        e.preventDefault();
        
        const link = e.currentTarget;
        const notificationId = link.dataset.id;
        const notificationTitle = link.querySelector('h6')?.textContent || '알림';
        
        // 읽음 처리
        await this.markNotificationAsRead(link, notificationId);
        
        // 알림 세부 정보 표시 (옵션)
        if (link.hasAttribute('data-show-details')) {
            this.showNotificationDetails(notificationId, notificationTitle);
        }
    }

    /**
     * 알림을 읽음으로 표시
     * @param {HTMLElement} link - 알림 링크 요소
     * @param {string} notificationId - 알림 ID
     */
    async markNotificationAsRead(link, notificationId = null) {
        const id = notificationId || link.dataset.id;
        
        try {
            await ApiUtils.sendRequest({
                url: `/api/notifications/mark-read/${id}`,
                method: 'POST',
                onSuccess: () => {
                    // 시각적 읽음 표시
                    link.classList.add('read');
                    link.style.opacity = '0.7';
                    
                    // 읽지 않은 알림 카운터 업데이트
                    this.updateNotificationCounter();
                },
                onError: (error) => {
                    console.error('알림 읽음 처리 실패:', error);
                },
                mockResponse: true,
                mockData: { success: true }
            });
        } catch (error) {
            console.error('알림 읽음 처리 중 오류:', error);
        }
    }

    /**
     * 알림 세부 정보 표시
     * @param {string} notificationId - 알림 ID
     * @param {string} title - 알림 제목
     */
    showNotificationDetails(notificationId, title) {
        // 모달이나 사이드바에 알림 세부 정보 표시
        UIUtils.showAlert(`알림 세부 정보: ${title}`, 'info', 5000);
    }

    /**
     * 알림 카운터 업데이트
     */
    updateNotificationCounter() {
        const unreadCount = document.querySelectorAll('.list-group-item[data-notification]:not(.read)').length;
        const counter = document.querySelector('.notification-counter');
        
        if (counter) {
            counter.textContent = unreadCount;
            counter.style.display = unreadCount > 0 ? 'inline' : 'none';
        }
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 대시보드 새로고침 이벤트 리스닝
        window.addEventListener('dashboardRefreshed', this.handleDashboardRefresh);
    }

    /**
     * 대시보드 새로고침 이벤트 핸들러
     * @param {CustomEvent} event - 새로고침 이벤트
     */
    handleDashboardRefresh(event) {
        console.log('대시보드 새로고침됨, 위젯 업데이트 중...');
        
        // 프로그레스 바 재설정
        this.reinitializeProgressBars();
        
        // 차트 데이터 업데이트
        this.updateChartData();
    }

    /**
     * 프로그레스 바 재초기화
     */
    reinitializeProgressBars() {
        this.progressBars.forEach(({ element, targetWidth }) => {
            this.animateProgressBar(element, targetWidth);
        });
    }

    /**
     * 차트 데이터 업데이트
     */
    updateChartData() {
        // 실제 환경에서는 새로운 데이터를 API에서 가져와 업데이트
        this.chartInstances.forEach((chart, chartId) => {
            if (chart && typeof chart.update === 'function') {
                chart.update();
            }
        });
    }

    /**
     * 위젯 상태 정보 반환
     * @returns {Object} 상태 정보
     */
    getStatus() {
        return {
            progressBarsCount: this.progressBars.length,
            notificationHandlersCount: this.notificationHandlers.length,
            chartInstancesCount: this.chartInstances.size,
            unreadNotifications: document.querySelectorAll('.list-group-item[data-notification]:not(.read)').length
        };
    }

    /**
     * 정리 작업
     */
    cleanup() {
        console.log('MainWidgets 정리 중...');
        
        // 알림 이벤트 핸들러 제거
        this.notificationHandlers.forEach(({ element, handler }) => {
            element.removeEventListener('click', handler);
        });
        
        // 차트 인스턴스 정리
        this.chartInstances.forEach((chart) => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        
        // 이벤트 리스너 제거
        window.removeEventListener('dashboardRefreshed', this.handleDashboardRefresh);
        
        // 애니메이션 프레임 취소
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        // 상태 초기화
        this.progressBars = [];
        this.notificationHandlers = [];
        this.chartInstances.clear();
        this.animationFrameId = null;
    }
}

export default MainWidgets; 