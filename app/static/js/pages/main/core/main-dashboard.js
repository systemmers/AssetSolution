/**
 * 메인 대시보드 관리 모듈
 * 대시보드 위젯, 데이터 새로고침, 검색 기능 관리
 * 
 * @author Asset Management System
 * @version 1.0.0
 */

// 공통 모듈 가져오기
import UIUtils from '../../../../common/ui-utils.js';
import ApiUtils from '../../../../common/api-utils.js';

/**
 * MainDashboard 클래스
 * 대시보드의 핵심 기능들을 통합 관리
 */
class MainDashboard {
    constructor() {
        this.refreshInterval = null;
        this.refreshBtn = null;
        this.isRefreshing = false;
        this.lastRefreshTime = null;
        this.searchCache = new Map();
        this.config = {
            autoRefreshInterval: 300000, // 5분
            searchDebounceTime: 500,
            cacheExpireTime: 60000 // 1분
        };
        
        // 바인딩
        this.handleRefreshClick = this.handleRefreshClick.bind(this);
        this.performAutoRefresh = this.performAutoRefresh.bind(this);
    }

    /**
     * 대시보드 초기화
     * @returns {Function} cleanup 함수
     */
    initialize() {
        console.log('MainDashboard 초기화 중...');
        
        try {
            this.setupRefreshButton();
            this.startAutoRefresh();
            this.setupSearchCache();
            
            return this.cleanup.bind(this);
        } catch (error) {
            console.error('MainDashboard 초기화 실패:', error);
            UIUtils.showAlert('대시보드 초기화 중 오류가 발생했습니다.', 'warning', 3000);
            return null;
        }
    }

    /**
     * 새로고침 버튼 설정
     */
    setupRefreshButton() {
        this.refreshBtn = document.querySelector('.btn-refresh');
        if (this.refreshBtn) {
            this.refreshBtn.addEventListener('click', this.handleRefreshClick);
            
            // 버튼에 로딩 상태 표시 기능 추가
            this.refreshBtn.setAttribute('data-original-text', this.refreshBtn.textContent);
        }
    }

    /**
     * 새로고침 버튼 클릭 핸들러
     */
    async handleRefreshClick() {
        if (this.isRefreshing) {
            UIUtils.showAlert('이미 새로고침이 진행 중입니다.', 'info', 2000);
            return;
        }

        await this.refreshDashboardData(true);
    }

    /**
     * 대시보드 데이터 새로고침
     * @param {boolean} showFeedback - 사용자에게 피드백 표시 여부
     */
    async refreshDashboardData(showFeedback = false) {
        this.isRefreshing = true;
        
        if (showFeedback && this.refreshBtn) {
            this.refreshBtn.textContent = '새로고침 중...';
            this.refreshBtn.disabled = true;
        }

        try {
            const response = await ApiUtils.sendRequest({
                url: '/operations/api/dashboard/refresh',
                method: 'GET'
            });

            if (response && response.success) {
                this.lastRefreshTime = new Date();
                this.clearSearchCache();
                
                if (showFeedback) {
                    UIUtils.showAlert('대시보드 데이터를 새로고침했습니다.', 'success', 3000);
                }
                
                // 프로그레스 바 재설정 이벤트 발생
                window.dispatchEvent(new CustomEvent('dashboardRefreshed', {
                    detail: { timestamp: this.lastRefreshTime }
                }));
            }
        } catch (error) {
            console.error('대시보드 새로고침 실패:', error);
            if (showFeedback) {
                UIUtils.showAlert('데이터 새로고침 중 오류가 발생했습니다.', 'danger', 3000);
            }
        } finally {
            this.isRefreshing = false;
            
            if (this.refreshBtn) {
                this.refreshBtn.disabled = false;
                this.refreshBtn.textContent = this.refreshBtn.getAttribute('data-original-text') || '새로고침';
            }
        }
    }

    /**
     * 자동 새로고침 시작
     */
    startAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        this.refreshInterval = setInterval(this.performAutoRefresh, this.config.autoRefreshInterval);
        
        // 전역 인터벌 관리에 등록
        if (!window.appIntervals) {
            window.appIntervals = [];
        }
        window.appIntervals.push(this.refreshInterval);
    }

    /**
     * 자동 새로고침 수행
     */
    async performAutoRefresh() {
        // 사용자가 활성화된 상태에서만 자동 새로고침
        if (!document.hidden && !this.isRefreshing) {
            await this.refreshDashboardData(false);
        }
    }

    /**
     * 자산 검색
     * @param {string} searchText - 검색어
     * @returns {Promise<Object>} 검색 결과
     */
    async searchAssets(searchText) {
        if (!searchText || searchText.trim().length < 2) {
            return { results: [], total: 0 };
        }

        const cacheKey = `assets_${searchText.toLowerCase()}`;
        
        // 캐시 확인
        if (this.searchCache.has(cacheKey)) {
            const cached = this.searchCache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.config.cacheExpireTime) {
                return cached.data;
            }
        }

        try {
            const response = await ApiUtils.sendRequest({
                url: `/assets/api/assets/search?search=${encodeURIComponent(searchText)}`,
                method: 'GET'
            });

            // 결과 캐싱
            this.searchCache.set(cacheKey, {
                data: response,
                timestamp: Date.now()
            });

            UIUtils.showAlert(`'${searchText}' 검색 결과를 업데이트했습니다.`, 'info', 3000);
            return response;
        } catch (error) {
            console.error('자산 검색 실패:', error);
            UIUtils.showAlert('검색 중 오류가 발생했습니다.', 'danger', 3000);
            return { results: [], total: 0 };
        }
    }

    /**
     * 계약 검색
     * @param {string} searchText - 검색어
     * @returns {Promise<Object>} 검색 결과
     */
    async searchContracts(searchText) {
        if (!searchText || searchText.trim().length < 2) {
            return { results: [], total: 0 };
        }

        const cacheKey = `contracts_${searchText.toLowerCase()}`;
        
        // 캐시 확인
        if (this.searchCache.has(cacheKey)) {
            const cached = this.searchCache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.config.cacheExpireTime) {
                return cached.data;
            }
        }

        try {
            const response = await ApiUtils.sendRequest({
                url: `/contracts/api/contracts/search?search=${encodeURIComponent(searchText)}`,
                method: 'GET'
            });

            // 결과 캐싱
            this.searchCache.set(cacheKey, {
                data: response,
                timestamp: Date.now()
            });

            UIUtils.showAlert(`'${searchText}' 계약 검색 결과를 업데이트했습니다.`, 'info', 3000);
            return response;
        } catch (error) {
            console.error('계약 검색 실패:', error);
            UIUtils.showAlert('검색 중 오류가 발생했습니다.', 'danger', 3000);
            return { results: [], total: 0 };
        }
    }

    /**
     * 검색 캐시 설정
     */
    setupSearchCache() {
        // 검색 캐시 정리 인터벌 설정
        const cacheCleanupInterval = setInterval(() => {
            this.cleanupExpiredCache();
        }, 60000); // 1분마다

        if (!window.appIntervals) {
            window.appIntervals = [];
        }
        window.appIntervals.push(cacheCleanupInterval);
    }

    /**
     * 만료된 캐시 정리
     */
    cleanupExpiredCache() {
        const now = Date.now();
        for (const [key, value] of this.searchCache.entries()) {
            if (now - value.timestamp > this.config.cacheExpireTime) {
                this.searchCache.delete(key);
            }
        }
    }

    /**
     * 검색 캐시 전체 삭제
     */
    clearSearchCache() {
        this.searchCache.clear();
    }

    /**
     * 대시보드 상태 정보 반환
     * @returns {Object} 상태 정보
     */
    getStatus() {
        return {
            isRefreshing: this.isRefreshing,
            lastRefreshTime: this.lastRefreshTime,
            cacheSize: this.searchCache.size,
            autoRefreshEnabled: this.refreshInterval !== null
        };
    }

    /**
     * 정리 작업
     */
    cleanup() {
        console.log('MainDashboard 정리 중...');
        
        // 이벤트 리스너 제거
        if (this.refreshBtn) {
            this.refreshBtn.removeEventListener('click', this.handleRefreshClick);
        }

        // 인터벌 정리
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            
            // 전역 인터벌 목록에서 제거
            if (window.appIntervals) {
                const index = window.appIntervals.indexOf(this.refreshInterval);
                if (index > -1) {
                    window.appIntervals.splice(index, 1);
                }
            }
        }

        // 캐시 정리
        this.clearSearchCache();
        
        // 상태 초기화
        this.refreshInterval = null;
        this.refreshBtn = null;
        this.isRefreshing = false;
        this.lastRefreshTime = null;
    }
}

export default MainDashboard; 