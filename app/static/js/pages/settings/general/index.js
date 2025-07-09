/**
 * General 설정 모듈 통합 진입점
 * 환경 설정과 알림 설정을 통합 관리합니다.
 */

import PreferencesManager from './preferences.js';
import NotificationsManager from './notifications.js';

/**
 * 일반 설정 통합 관리 클래스
 */
class GeneralSettingsManager {
    constructor() {
        this.preferencesManager = null;
        this.notificationsManager = null;
        this.cleanupFunctions = [];
    }

    /**
     * 초기화
     */
    initialize() {
        try {
            // 각 매니저 인스턴스 생성
            this.preferencesManager = new PreferencesManager();
            this.notificationsManager = new NotificationsManager();

            // 각 매니저 초기화
            this.preferencesManager.initialize();
            this.notificationsManager.initialize();

            // 탭 이벤트 설정
            this.setupTabEvents();

            console.log('일반 설정 모듈 초기화 완료');
        } catch (error) {
            console.error('일반 설정 모듈 초기화 오류:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * 탭 이벤트 설정
     */
    setupTabEvents() {
        const generalTabs = document.querySelectorAll('[data-bs-toggle="tab"][data-general-tab]');
        
        generalTabs.forEach(tab => {
            const handleTabChange = (event) => {
                const tabType = event.target.dataset.generalTab;
                this.handleTabChange(tabType);
            };
            
            tab.addEventListener('shown.bs.tab', handleTabChange);
            this.cleanupFunctions.push(() => {
                tab.removeEventListener('shown.bs.tab', handleTabChange);
            });
        });
    }

    /**
     * 탭 변경 처리
     * @param {string} tabType - 탭 유형
     */
    handleTabChange(tabType) {
        try {
            switch (tabType) {
                case 'preferences':
                    // 환경 설정 탭 활성화 시
                    if (this.preferencesManager) {
                        this.preferencesManager.loadCurrentPreferences();
                    }
                    break;
                case 'notifications':
                    // 알림 설정 탭 활성화 시
                    if (this.notificationsManager) {
                        this.notificationsManager.loadCurrentSettings();
                        this.notificationsManager.checkBrowserNotificationPermission();
                    }
                    break;
            }
        } catch (error) {
            console.error('탭 변경 처리 오류:', error);
        }
    }

    /**
     * 전체 일반 설정 내보내기
     * @returns {Object} 일반 설정 데이터
     */
    exportSettings() {
        try {
            const preferences = this.preferencesManager ? this.preferencesManager.exportPreferences() : null;
            const notifications = this.notificationsManager ? this.notificationsManager.exportSettings() : null;

            return {
                preferences: preferences?.preferences || null,
                notifications: notifications?.notifications || null,
                exportedAt: new Date().toISOString(),
                version: '1.0'
            };
        } catch (error) {
            console.error('일반 설정 내보내기 오류:', error);
            return null;
        }
    }

    /**
     * 전체 일반 설정 가져오기
     * @param {Object} settings - 일반 설정 데이터
     */
    importSettings(settings) {
        try {
            if (settings.preferences && this.preferencesManager) {
                this.preferencesManager.importPreferences({ preferences: settings.preferences });
            }

            if (settings.notifications && this.notificationsManager) {
                this.notificationsManager.importSettings({ notifications: settings.notifications });
            }

            console.log('일반 설정 가져오기 완료');
        } catch (error) {
            console.error('일반 설정 가져오기 오류:', error);
            throw error;
        }
    }

    /**
     * 현재 환경 설정 반환
     * @returns {Object|null} 현재 환경 설정
     */
    getCurrentPreferences() {
        return this.preferencesManager ? this.preferencesManager.getCurrentPreferences() : null;
    }

    /**
     * 현재 알림 설정 반환
     * @returns {Object|null} 현재 알림 설정
     */
    getCurrentNotificationSettings() {
        return this.notificationsManager ? this.notificationsManager.getCurrentSettings() : null;
    }

    /**
     * 초기화 오류 처리
     * @param {Error} error - 발생한 오류
     */
    handleInitializationError(error) {
        const errorContainer = document.getElementById('generalSettingsError');
        if (errorContainer) {
            errorContainer.innerHTML = `
                <div class="alert alert-danger">
                    <h6>일반 설정 초기화 오류</h6>
                    <p>일반 설정 모듈을 초기화하는 중 오류가 발생했습니다.</p>
                    <details>
                        <summary>오류 상세</summary>
                        <pre>${error.message}</pre>
                    </details>
                </div>
            `;
        }
    }

    /**
     * 설정 유효성 검사
     * @returns {Object} 검사 결과
     */
    validateSettings() {
        const validation = {
            isValid: true,
            errors: [],
            warnings: []
        };

        try {
            // 환경 설정 검사
            const preferences = this.getCurrentPreferences();
            if (!preferences) {
                validation.warnings.push('환경 설정이 로드되지 않았습니다.');
            }

            // 알림 설정 검사
            const notifications = this.getCurrentNotificationSettings();
            if (!notifications) {
                validation.warnings.push('알림 설정이 로드되지 않았습니다.');
            }

            // 브라우저 알림 권한 검사
            if (notifications?.browserNotifications?.enabled && 
                'Notification' in window && 
                Notification.permission !== 'granted') {
                validation.warnings.push('브라우저 알림이 활성화되어 있지만 권한이 허용되지 않았습니다.');
            }

        } catch (error) {
            validation.isValid = false;
            validation.errors.push(`설정 검사 중 오류: ${error.message}`);
        }

        return validation;
    }

    /**
     * 모든 설정 저장
     */
    async saveAllSettings() {
        try {
            const savePromises = [];

            if (this.preferencesManager) {
                savePromises.push(this.preferencesManager.saveAllPreferences());
            }

            if (this.notificationsManager) {
                savePromises.push(this.notificationsManager.saveAllSettings());
            }

            await Promise.all(savePromises);
            console.log('모든 일반 설정 저장 완료');
        } catch (error) {
            console.error('일반 설정 저장 오류:', error);
            throw error;
        }
    }

    /**
     * 모든 설정 초기화
     */
    resetAllSettings() {
        try {
            if (this.preferencesManager) {
                this.preferencesManager.resetToDefaults();
            }

            if (this.notificationsManager) {
                this.notificationsManager.resetToDefaults();
            }

            console.log('모든 일반 설정 초기화 완료');
        } catch (error) {
            console.error('일반 설정 초기화 오류:', error);
            throw error;
        }
    }

    /**
     * 정리
     */
    cleanup() {
        // 이벤트 리스너 정리
        this.cleanupFunctions.forEach(fn => {
            if (typeof fn === 'function') fn();
        });
        this.cleanupFunctions = [];

        // 각 매니저 정리
        if (this.preferencesManager && typeof this.preferencesManager.cleanup === 'function') {
            this.preferencesManager.cleanup();
        }
        if (this.notificationsManager && typeof this.notificationsManager.cleanup === 'function') {
            this.notificationsManager.cleanup();
        }

        this.preferencesManager = null;
        this.notificationsManager = null;
    }

    /**
     * 환경 설정 매니저 반환
     * @returns {PreferencesManager|null} 환경 설정 매니저
     */
    getPreferencesManager() {
        return this.preferencesManager;
    }

    /**
     * 알림 설정 매니저 반환
     * @returns {NotificationsManager|null} 알림 설정 매니저
     */
    getNotificationsManager() {
        return this.notificationsManager;
    }
}

// 전역 인스턴스 생성 및 내보내기
const generalSettingsManager = new GeneralSettingsManager();

export default generalSettingsManager; 