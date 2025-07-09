/**
 * 알림 설정 관리 모듈
 * 시스템 알림, 이메일 알림, 브라우저 알림 등을 관리합니다.
 */

import SettingsStorage from '../core/settings-storage.js';
import SettingsAPI from '../core/settings-api.js';
import UIUtils from '../../../common/ui-utils.js';

/**
 * 알림 설정 매니저 클래스
 */
class NotificationsManager {
    constructor() {
        this.cleanupFunctions = [];
        this.defaultSettings = this.initializeDefaultSettings();
        this.currentSettings = null;
        this.notificationTypes = this.initializeNotificationTypes();
    }

    /**
     * 기본 알림 설정 초기화
     * @returns {Object} 기본 알림 설정
     */
    initializeDefaultSettings() {
        return {
            // 브라우저 알림
            browserNotifications: {
                enabled: false,
                assetExpiry: true,
                contractExpiry: true,
                maintenanceDue: true,
                lowStock: true,
                taskAssignment: true,
                systemUpdates: false
            },
            
            // 이메일 알림
            emailNotifications: {
                enabled: true,
                assetExpiry: true,
                contractExpiry: true,
                maintenanceDue: true,
                lowStock: true,
                taskAssignment: true,
                systemUpdates: true,
                weeklyReport: true,
                monthlyReport: true
            },
            
            // SMS 알림 (향후 확장)
            smsNotifications: {
                enabled: false,
                urgentOnly: true,
                assetExpiry: false,
                contractExpiry: false,
                maintenanceDue: false
            },
            
            // 시스템 내 알림
            systemNotifications: {
                enabled: true,
                showPopup: true,
                autoHide: true,
                hideDelay: 5000,
                sound: false,
                position: 'top-right' // top-right, top-left, bottom-right, bottom-left
            },
            
            // 알림 일정
            schedule: {
                assetExpiryDays: [30, 7, 1], // 만료 며칠 전에 알림
                contractExpiryDays: [60, 30, 7],
                maintenanceDueDays: [14, 7, 1],
                quietHours: {
                    enabled: false,
                    startTime: '22:00',
                    endTime: '08:00'
                }
            },
            
            // 알림 필터
            filters: {
                minPriority: 'medium', // low, medium, high, critical
                categories: [], // 특정 카테고리만 알림
                excludeCategories: [], // 제외할 카테고리
                onlyAssignedToMe: false
            }
        };
    }

    /**
     * 알림 유형 정의 초기화
     * @returns {Object} 알림 유형 정의
     */
    initializeNotificationTypes() {
        return {
            assetExpiry: {
                name: '자산 만료',
                description: '자산의 사용 기한이 만료되기 전 알림',
                priority: 'high',
                icon: 'fas fa-clock'
            },
            contractExpiry: {
                name: '계약 만료',
                description: '계약 종료일이 다가올 때 알림',
                priority: 'high',
                icon: 'fas fa-file-contract'
            },
            maintenanceDue: {
                name: '유지보수 예정',
                description: '정기 유지보수 일정이 다가올 때 알림',
                priority: 'medium',
                icon: 'fas fa-tools'
            },
            lowStock: {
                name: '재고 부족',
                description: '자산 재고가 최소 수량 이하일 때 알림',
                priority: 'medium',
                icon: 'fas fa-exclamation-triangle'
            },
            taskAssignment: {
                name: '작업 할당',
                description: '새로운 작업이 할당되었을 때 알림',
                priority: 'medium',
                icon: 'fas fa-tasks'
            },
            systemUpdates: {
                name: '시스템 업데이트',
                description: '시스템 업데이트 및 공지사항 알림',
                priority: 'low',
                icon: 'fas fa-bell'
            },
            weeklyReport: {
                name: '주간 보고서',
                description: '주간 자산 현황 보고서 알림',
                priority: 'low',
                icon: 'fas fa-chart-bar'
            },
            monthlyReport: {
                name: '월간 보고서',
                description: '월간 자산 현황 보고서 알림',
                priority: 'low',
                icon: 'fas fa-chart-line'
            }
        };
    }

    /**
     * 초기화
     */
    initialize() {
        this.loadCurrentSettings();
        this.setupEventListeners();
        this.checkBrowserNotificationPermission();
        this.renderNotificationTypes();
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 브라우저 알림 활성화 토글
        const browserToggle = document.getElementById('enableBrowserNotifications');
        if (browserToggle) {
            const handleBrowserToggle = async () => {
                if (browserToggle.checked) {
                    const permission = await this.requestBrowserNotificationPermission();
                    if (permission !== 'granted') {
                        browserToggle.checked = false;
                        return;
                    }
                }
                this.updateNotificationSetting('browserNotifications.enabled', browserToggle.checked);
            };
            
            browserToggle.addEventListener('change', handleBrowserToggle);
            this.cleanupFunctions.push(() => {
                browserToggle.removeEventListener('change', handleBrowserToggle);
            });
        }

        // 이메일 알림 활성화 토글
        const emailToggle = document.getElementById('enableEmailNotifications');
        if (emailToggle) {
            const handleEmailToggle = () => {
                this.updateNotificationSetting('emailNotifications.enabled', emailToggle.checked);
            };
            
            emailToggle.addEventListener('change', handleEmailToggle);
            this.cleanupFunctions.push(() => {
                emailToggle.removeEventListener('change', handleEmailToggle);
            });
        }

        // 시스템 알림 설정
        this.setupSystemNotificationSettings();

        // 알림 일정 설정
        this.setupScheduleSettings();

        // 알림 필터 설정
        this.setupFilterSettings();

        // 테스트 알림 버튼
        const testButtons = document.querySelectorAll('.test-notification-btn');
        testButtons.forEach(button => {
            const handleTestNotification = () => {
                const type = button.dataset.type;
                this.sendTestNotification(type);
            };
            
            button.addEventListener('click', handleTestNotification);
            this.cleanupFunctions.push(() => {
                button.removeEventListener('click', handleTestNotification);
            });
        });

        // 저장 버튼
        const saveBtn = document.getElementById('saveNotificationSettings');
        if (saveBtn) {
            const handleSave = () => {
                this.saveAllSettings();
            };
            
            saveBtn.addEventListener('click', handleSave);
            this.cleanupFunctions.push(() => {
                saveBtn.removeEventListener('click', handleSave);
            });
        }

        // 초기화 버튼
        const resetBtn = document.getElementById('resetNotificationSettings');
        if (resetBtn) {
            const handleReset = () => {
                this.resetToDefaults();
            };
            
            resetBtn.addEventListener('click', handleReset);
            this.cleanupFunctions.push(() => {
                resetBtn.removeEventListener('click', handleReset);
            });
        }
    }

    /**
     * 시스템 알림 설정 이벤트 리스너
     */
    setupSystemNotificationSettings() {
        // 팝업 표시 토글
        const showPopupToggle = document.getElementById('systemShowPopup');
        if (showPopupToggle) {
            const handleShowPopupToggle = () => {
                this.updateNotificationSetting('systemNotifications.showPopup', showPopupToggle.checked);
            };
            
            showPopupToggle.addEventListener('change', handleShowPopupToggle);
            this.cleanupFunctions.push(() => {
                showPopupToggle.removeEventListener('change', handleShowPopupToggle);
            });
        }

        // 자동 숨김 토글
        const autoHideToggle = document.getElementById('systemAutoHide');
        if (autoHideToggle) {
            const handleAutoHideToggle = () => {
                this.updateNotificationSetting('systemNotifications.autoHide', autoHideToggle.checked);
                this.toggleHideDelayInput(autoHideToggle.checked);
            };
            
            autoHideToggle.addEventListener('change', handleAutoHideToggle);
            this.cleanupFunctions.push(() => {
                autoHideToggle.removeEventListener('change', handleAutoHideToggle);
            });
        }

        // 숨김 지연 시간
        const hideDelayInput = document.getElementById('systemHideDelay');
        if (hideDelayInput) {
            const handleHideDelayChange = () => {
                this.updateNotificationSetting('systemNotifications.hideDelay', parseInt(hideDelayInput.value));
            };
            
            hideDelayInput.addEventListener('change', handleHideDelayChange);
            this.cleanupFunctions.push(() => {
                hideDelayInput.removeEventListener('change', handleHideDelayChange);
            });
        }

        // 사운드 토글
        const soundToggle = document.getElementById('systemSound');
        if (soundToggle) {
            const handleSoundToggle = () => {
                this.updateNotificationSetting('systemNotifications.sound', soundToggle.checked);
            };
            
            soundToggle.addEventListener('change', handleSoundToggle);
            this.cleanupFunctions.push(() => {
                soundToggle.removeEventListener('change', handleSoundToggle);
            });
        }

        // 위치 선택
        const positionSelect = document.getElementById('systemPosition');
        if (positionSelect) {
            const handlePositionChange = () => {
                this.updateNotificationSetting('systemNotifications.position', positionSelect.value);
            };
            
            positionSelect.addEventListener('change', handlePositionChange);
            this.cleanupFunctions.push(() => {
                positionSelect.removeEventListener('change', handlePositionChange);
            });
        }
    }

    /**
     * 알림 일정 설정 이벤트 리스너
     */
    setupScheduleSettings() {
        // 조용한 시간 토글
        const quietHoursToggle = document.getElementById('enableQuietHours');
        if (quietHoursToggle) {
            const handleQuietHoursToggle = () => {
                this.updateNotificationSetting('schedule.quietHours.enabled', quietHoursToggle.checked);
                this.toggleQuietHoursInputs(quietHoursToggle.checked);
            };
            
            quietHoursToggle.addEventListener('change', handleQuietHoursToggle);
            this.cleanupFunctions.push(() => {
                quietHoursToggle.removeEventListener('change', handleQuietHoursToggle);
            });
        }

        // 조용한 시간 시작/종료
        const startTimeInput = document.getElementById('quietHoursStart');
        const endTimeInput = document.getElementById('quietHoursEnd');
        
        if (startTimeInput) {
            const handleStartTimeChange = () => {
                this.updateNotificationSetting('schedule.quietHours.startTime', startTimeInput.value);
            };
            
            startTimeInput.addEventListener('change', handleStartTimeChange);
            this.cleanupFunctions.push(() => {
                startTimeInput.removeEventListener('change', handleStartTimeChange);
            });
        }

        if (endTimeInput) {
            const handleEndTimeChange = () => {
                this.updateNotificationSetting('schedule.quietHours.endTime', endTimeInput.value);
            };
            
            endTimeInput.addEventListener('change', handleEndTimeChange);
            this.cleanupFunctions.push(() => {
                endTimeInput.removeEventListener('change', handleEndTimeChange);
            });
        }
    }

    /**
     * 알림 필터 설정 이벤트 리스너
     */
    setupFilterSettings() {
        // 최소 우선순위
        const prioritySelect = document.getElementById('minPriority');
        if (prioritySelect) {
            const handlePriorityChange = () => {
                this.updateNotificationSetting('filters.minPriority', prioritySelect.value);
            };
            
            prioritySelect.addEventListener('change', handlePriorityChange);
            this.cleanupFunctions.push(() => {
                prioritySelect.removeEventListener('change', handlePriorityChange);
            });
        }

        // 나에게만 할당된 작업 알림
        const onlyMeToggle = document.getElementById('onlyAssignedToMe');
        if (onlyMeToggle) {
            const handleOnlyMeToggle = () => {
                this.updateNotificationSetting('filters.onlyAssignedToMe', onlyMeToggle.checked);
            };
            
            onlyMeToggle.addEventListener('change', handleOnlyMeToggle);
            this.cleanupFunctions.push(() => {
                onlyMeToggle.removeEventListener('change', handleOnlyMeToggle);
            });
        }
    }

    /**
     * 브라우저 알림 권한 확인
     */
    checkBrowserNotificationPermission() {
        if ('Notification' in window) {
            const permission = Notification.permission;
            this.updatePermissionStatus(permission);
        } else {
            this.updatePermissionStatus('not-supported');
        }
    }

    /**
     * 브라우저 알림 권한 요청
     * @returns {Promise<string>} 권한 상태
     */
    async requestBrowserNotificationPermission() {
        if (!('Notification' in window)) {
            UIUtils.showAlert('이 브라우저는 알림을 지원하지 않습니다.', 'warning');
            return 'not-supported';
        }

        try {
            const permission = await Notification.requestPermission();
            this.updatePermissionStatus(permission);
            
            if (permission === 'granted') {
                UIUtils.showAlert('브라우저 알림이 활성화되었습니다.', 'success');
            } else {
                UIUtils.showAlert('브라우저 알림 권한이 거부되었습니다.', 'warning');
            }
            
            return permission;
        } catch (error) {
            console.error('알림 권한 요청 오류:', error);
            return 'denied';
        }
    }

    /**
     * 권한 상태 UI 업데이트
     * @param {string} permission - 권한 상태
     */
    updatePermissionStatus(permission) {
        const statusElement = document.getElementById('browserNotificationStatus');
        if (!statusElement) return;

        const statusMap = {
            'granted': { text: '허용됨', class: 'text-success', icon: 'fas fa-check-circle' },
            'denied': { text: '거부됨', class: 'text-danger', icon: 'fas fa-times-circle' },
            'default': { text: '미설정', class: 'text-warning', icon: 'fas fa-question-circle' },
            'not-supported': { text: '지원되지 않음', class: 'text-muted', icon: 'fas fa-minus-circle' }
        };

        const status = statusMap[permission] || statusMap.default;
        statusElement.innerHTML = `
            <i class="${status.icon} ${status.class}"></i>
            <span class="${status.class}">${status.text}</span>
        `;
    }

    /**
     * 알림 유형 렌더링
     */
    renderNotificationTypes() {
        const containers = {
            browser: document.getElementById('browserNotificationTypes'),
            email: document.getElementById('emailNotificationTypes'),
            sms: document.getElementById('smsNotificationTypes')
        };

        Object.entries(containers).forEach(([type, container]) => {
            if (container) {
                this.renderNotificationTypeList(container, type);
            }
        });
    }

    /**
     * 알림 유형 목록 렌더링
     * @param {HTMLElement} container - 컨테이너 요소
     * @param {string} notificationType - 알림 타입 (browser, email, sms)
     */
    renderNotificationTypeList(container, notificationType) {
        let html = '';

        Object.entries(this.notificationTypes).forEach(([key, type]) => {
            const isChecked = this.currentSettings[`${notificationType}Notifications`][key] || false;
            const settingKey = `${notificationType}Notifications.${key}`;

            html += `
                <div class="form-check d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center">
                        <input class="form-check-input me-2" 
                               type="checkbox" 
                               id="${notificationType}_${key}"
                               ${isChecked ? 'checked' : ''}
                               data-setting="${settingKey}">
                        <label class="form-check-label d-flex align-items-center" 
                               for="${notificationType}_${key}">
                            <i class="${type.icon} me-2"></i>
                            <div>
                                <div class="fw-medium">${type.name}</div>
                                <small class="text-muted">${type.description}</small>
                            </div>
                        </label>
                    </div>
                    <span class="badge bg-${this.getPriorityColor(type.priority)}">${type.priority}</span>
                </div>
            `;
        });

        container.innerHTML = html;

        // 이벤트 리스너 추가
        this.setupNotificationTypeEvents(container);
    }

    /**
     * 알림 유형 이벤트 설정
     * @param {HTMLElement} container - 컨테이너 요소
     */
    setupNotificationTypeEvents(container) {
        const checkboxes = container.querySelectorAll('input[type="checkbox"]');
        
        checkboxes.forEach(checkbox => {
            const handleChange = () => {
                const settingPath = checkbox.dataset.setting;
                this.updateNotificationSetting(settingPath, checkbox.checked);
            };
            
            checkbox.addEventListener('change', handleChange);
            this.cleanupFunctions.push(() => {
                checkbox.removeEventListener('change', handleChange);
            });
        });
    }

    /**
     * 우선순위 색상 반환
     * @param {string} priority - 우선순위
     * @returns {string} 색상 클래스
     */
    getPriorityColor(priority) {
        const colorMap = {
            'low': 'secondary',
            'medium': 'primary',
            'high': 'warning',
            'critical': 'danger'
        };
        return colorMap[priority] || 'secondary';
    }

    /**
     * 테스트 알림 전송
     * @param {string} type - 알림 타입
     */
    async sendTestNotification(type) {
        try {
            switch (type) {
                case 'browser':
                    this.sendTestBrowserNotification();
                    break;
                case 'email':
                    await this.sendTestEmailNotification();
                    break;
                case 'system':
                    this.sendTestSystemNotification();
                    break;
            }
        } catch (error) {
            console.error('테스트 알림 전송 오류:', error);
            UIUtils.showAlert('테스트 알림 전송 중 오류가 발생했습니다.', 'error');
        }
    }

    /**
     * 테스트 브라우저 알림 전송
     */
    sendTestBrowserNotification() {
        if (!('Notification' in window) || Notification.permission !== 'granted') {
            UIUtils.showAlert('브라우저 알림 권한이 필요합니다.', 'warning');
            return;
        }

        new Notification('자산 관리 시스템', {
            body: '테스트 알림입니다. 브라우저 알림이 정상적으로 작동합니다.',
            icon: '/static/images/favicon.ico',
            tag: 'test-notification'
        });

        UIUtils.showAlert('테스트 브라우저 알림이 전송되었습니다.', 'success');
    }

    /**
     * 테스트 이메일 알림 전송
     */
    async sendTestEmailNotification() {
        try {
            const result = await SettingsAPI.sendTestEmail();
            if (result.success) {
                UIUtils.showAlert('테스트 이메일이 전송되었습니다.', 'success');
            } else {
                UIUtils.showAlert(`이메일 전송 실패: ${result.error}`, 'error');
            }
        } catch (error) {
            UIUtils.showAlert('이메일 전송 중 오류가 발생했습니다.', 'error');
        }
    }

    /**
     * 테스트 시스템 알림 전송
     */
    sendTestSystemNotification() {
        UIUtils.showAlert('테스트 시스템 알림입니다.', 'info');
    }

    /**
     * 알림 설정 업데이트
     * @param {string} path - 설정 경로 (점 표기법)
     * @param {*} value - 설정 값
     */
    updateNotificationSetting(path, value) {
        const keys = path.split('.');
        let current = this.currentSettings;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = value;
        this.saveSettings();
    }

    /**
     * 자동 숨김 지연 입력 토글
     * @param {boolean} enabled - 활성화 여부
     */
    toggleHideDelayInput(enabled) {
        const hideDelayInput = document.getElementById('systemHideDelay');
        if (hideDelayInput) {
            hideDelayInput.disabled = !enabled;
        }
    }

    /**
     * 조용한 시간 입력 토글
     * @param {boolean} enabled - 활성화 여부
     */
    toggleQuietHoursInputs(enabled) {
        const inputs = ['quietHoursStart', 'quietHoursEnd'];
        inputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.disabled = !enabled;
            }
        });
    }

    /**
     * 현재 설정 로드
     */
    loadCurrentSettings() {
        const saved = SettingsStorage.getGeneralSettings('notifications');
        this.currentSettings = { ...this.defaultSettings, ...saved };
        this.updateUI();
    }

    /**
     * UI 업데이트
     */
    updateUI() {
        if (!this.currentSettings) return;

        // 각 설정값을 UI에 반영
        this.updateUIRecursive(this.currentSettings, '');
    }

    /**
     * UI 재귀적 업데이트
     * @param {Object} settings - 설정 객체
     * @param {string} prefix - 접두사
     */
    updateUIRecursive(settings, prefix) {
        Object.entries(settings).forEach(([key, value]) => {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            
            if (typeof value === 'object' && !Array.isArray(value)) {
                this.updateUIRecursive(value, fullKey);
            } else {
                this.updateUIElement(fullKey, value);
            }
        });
    }

    /**
     * UI 요소 업데이트
     * @param {string} key - 설정 키
     * @param {*} value - 설정 값
     */
    updateUIElement(key, value) {
        // ID 기반 요소 찾기
        const element = document.getElementById(key.replace(/\./g, ''));
        
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = value;
            } else {
                element.value = value;
            }
        }

        // data-setting 기반 요소 찾기
        const settingElement = document.querySelector(`[data-setting="${key}"]`);
        if (settingElement) {
            if (settingElement.type === 'checkbox') {
                settingElement.checked = value;
            } else {
                settingElement.value = value;
            }
        }
    }

    /**
     * 설정 저장
     */
    saveSettings() {
        try {
            SettingsStorage.saveGeneralSettings('notifications', this.currentSettings);
        } catch (error) {
            console.error('알림 설정 저장 오류:', error);
        }
    }

    /**
     * 모든 설정 저장
     */
    async saveAllSettings() {
        try {
            // 로컬 저장
            this.saveSettings();
            
            // 서버 저장
            await SettingsAPI.saveNotificationSettings(this.currentSettings);
            
            UIUtils.showAlert('알림 설정이 저장되었습니다.', 'success');
        } catch (error) {
            console.error('알림 설정 저장 오류:', error);
            UIUtils.showAlert('알림 설정 저장 중 오류가 발생했습니다.', 'error');
        }
    }

    /**
     * 기본값으로 초기화
     */
    resetToDefaults() {
        UIUtils.showConfirm('모든 알림 설정을 기본값으로 초기화하시겠습니까?', (confirmed) => {
            if (confirmed) {
                this.currentSettings = { ...this.defaultSettings };
                this.updateUI();
                this.renderNotificationTypes();
                this.saveSettings();
                UIUtils.showAlert('알림 설정이 기본값으로 초기화되었습니다.', 'success');
            }
        });
    }

    /**
     * 현재 설정 반환
     * @returns {Object} 현재 알림 설정
     */
    getCurrentSettings() {
        return { ...this.currentSettings };
    }

    /**
     * 설정 내보내기
     * @returns {Object} 설정 데이터
     */
    exportSettings() {
        return {
            notifications: this.getCurrentSettings(),
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
    }

    /**
     * 설정 가져오기
     * @param {Object} data - 가져올 설정 데이터
     */
    importSettings(data) {
        try {
            if (data.notifications) {
                this.currentSettings = { ...this.defaultSettings, ...data.notifications };
                this.updateUI();
                this.renderNotificationTypes();
                this.saveSettings();
                UIUtils.showAlert('알림 설정을 가져왔습니다.', 'success');
            }
        } catch (error) {
            console.error('알림 설정 가져오기 오류:', error);
            UIUtils.showAlert('알림 설정 가져오기 중 오류가 발생했습니다.', 'error');
        }
    }

    /**
     * 정리
     */
    cleanup() {
        this.cleanupFunctions.forEach(fn => {
            if (typeof fn === 'function') fn();
        });
        this.cleanupFunctions = [];
    }
}

export default NotificationsManager; 