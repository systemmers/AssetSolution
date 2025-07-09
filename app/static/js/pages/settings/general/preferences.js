/**
 * 일반 환경 설정 관리 모듈
 * 사용자 인터페이스 설정, 언어, 테마 등 전반적인 환경 설정을 관리합니다.
 */

import SettingsStorage from '../core/settings-storage.js';
import SettingsAPI from '../core/settings-api.js';
import UIUtils from '../../../common/ui-utils.js';

/**
 * 환경 설정 매니저 클래스
 */
class PreferencesManager {
    constructor() {
        this.cleanupFunctions = [];
        this.defaultPreferences = this.initializeDefaultPreferences();
        this.currentPreferences = null;
    }

    /**
     * 기본 환경 설정 초기화
     * @returns {Object} 기본 환경 설정
     */
    initializeDefaultPreferences() {
        return {
            // 언어 설정
            language: 'ko',
            
            // 테마 설정
            theme: 'auto', // light, dark, auto
            
            // 테이블 설정
            tablePageSize: 20,
            tableShowSearch: true,
            tableShowPagination: true,
            tableSortable: true,
            
            // 폼 설정
            formAutoSave: true,
            formAutoSaveInterval: 30, // 초
            formValidationMode: 'realtime', // realtime, submit
            
            // 알림 설정
            showSuccessMessages: true,
            showWarningMessages: true,
            showErrorMessages: true,
            messageDisplayDuration: 5, // 초
            
            // 자동 새로고침 설정
            autoRefresh: false,
            autoRefreshInterval: 300, // 초 (5분)
            
            // 데이터 표시 설정
            dateFormat: 'YYYY-MM-DD',
            timeFormat: 'HH:mm:ss',
            currencyFormat: 'KRW',
            numberFormat: 'comma', // comma, dot
            
            // 성능 설정
            enableAnimations: true,
            enableTransitions: true,
            lazyLoadImages: true,
            
            // 접근성 설정
            highContrast: false,
            fontSize: 'medium', // small, medium, large
            reducedMotion: false,
            
            // 백업 설정
            autoBackup: false,
            backupInterval: 'daily', // daily, weekly, monthly
            maxBackupFiles: 10
        };
    }

    /**
     * 초기화
     */
    initialize() {
        this.loadCurrentPreferences();
        this.setupEventListeners();
        this.applyPreferences();
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 언어 변경
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            const handleLanguageChange = () => {
                this.updatePreference('language', languageSelect.value);
            };
            
            languageSelect.addEventListener('change', handleLanguageChange);
            this.cleanupFunctions.push(() => {
                languageSelect.removeEventListener('change', handleLanguageChange);
            });
        }

        // 테마 변경
        const themeSelects = document.querySelectorAll('input[name="theme"]');
        themeSelects.forEach(radio => {
            const handleThemeChange = () => {
                if (radio.checked) {
                    this.updatePreference('theme', radio.value);
                    this.applyTheme(radio.value);
                }
            };
            
            radio.addEventListener('change', handleThemeChange);
            this.cleanupFunctions.push(() => {
                radio.removeEventListener('change', handleThemeChange);
            });
        });

        // 테이블 설정
        this.setupTablePreferences();

        // 폼 설정
        this.setupFormPreferences();

        // 표시 형식 설정
        this.setupDisplayFormatPreferences();

        // 성능 설정
        this.setupPerformancePreferences();

        // 접근성 설정
        this.setupAccessibilityPreferences();

        // 저장 버튼
        const saveBtn = document.getElementById('savePreferencesBtn');
        if (saveBtn) {
            const handleSave = () => {
                this.saveAllPreferences();
            };
            
            saveBtn.addEventListener('click', handleSave);
            this.cleanupFunctions.push(() => {
                saveBtn.removeEventListener('click', handleSave);
            });
        }

        // 초기화 버튼
        const resetBtn = document.getElementById('resetPreferencesBtn');
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
     * 테이블 설정 이벤트 리스너
     */
    setupTablePreferences() {
        // 페이지 크기 설정
        const pageSizeSelect = document.getElementById('tablePageSize');
        if (pageSizeSelect) {
            const handlePageSizeChange = () => {
                this.updatePreference('tablePageSize', parseInt(pageSizeSelect.value));
            };
            
            pageSizeSelect.addEventListener('change', handlePageSizeChange);
            this.cleanupFunctions.push(() => {
                pageSizeSelect.removeEventListener('change', handlePageSizeChange);
            });
        }

        // 테이블 기능 토글
        const tableToggles = ['tableShowSearch', 'tableShowPagination', 'tableSortable'];
        tableToggles.forEach(toggleId => {
            const toggle = document.getElementById(toggleId);
            if (toggle) {
                const handleToggle = () => {
                    this.updatePreference(toggleId, toggle.checked);
                };
                
                toggle.addEventListener('change', handleToggle);
                this.cleanupFunctions.push(() => {
                    toggle.removeEventListener('change', handleToggle);
                });
            }
        });
    }

    /**
     * 폼 설정 이벤트 리스너
     */
    setupFormPreferences() {
        // 자동 저장 설정
        const autoSaveToggle = document.getElementById('formAutoSave');
        if (autoSaveToggle) {
            const handleAutoSaveToggle = () => {
                this.updatePreference('formAutoSave', autoSaveToggle.checked);
                this.toggleAutoSaveInterval(autoSaveToggle.checked);
            };
            
            autoSaveToggle.addEventListener('change', handleAutoSaveToggle);
            this.cleanupFunctions.push(() => {
                autoSaveToggle.removeEventListener('change', handleAutoSaveToggle);
            });
        }

        // 자동 저장 간격
        const autoSaveInterval = document.getElementById('formAutoSaveInterval');
        if (autoSaveInterval) {
            const handleIntervalChange = () => {
                this.updatePreference('formAutoSaveInterval', parseInt(autoSaveInterval.value));
            };
            
            autoSaveInterval.addEventListener('change', handleIntervalChange);
            this.cleanupFunctions.push(() => {
                autoSaveInterval.removeEventListener('change', handleIntervalChange);
            });
        }

        // 검증 모드
        const validationModes = document.querySelectorAll('input[name="formValidationMode"]');
        validationModes.forEach(radio => {
            const handleValidationModeChange = () => {
                if (radio.checked) {
                    this.updatePreference('formValidationMode', radio.value);
                }
            };
            
            radio.addEventListener('change', handleValidationModeChange);
            this.cleanupFunctions.push(() => {
                radio.removeEventListener('change', handleValidationModeChange);
            });
        });
    }

    /**
     * 표시 형식 설정 이벤트 리스너
     */
    setupDisplayFormatPreferences() {
        const formatSelects = ['dateFormat', 'timeFormat', 'currencyFormat', 'numberFormat'];
        
        formatSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                const handleFormatChange = () => {
                    this.updatePreference(selectId, select.value);
                };
                
                select.addEventListener('change', handleFormatChange);
                this.cleanupFunctions.push(() => {
                    select.removeEventListener('change', handleFormatChange);
                });
            }
        });
    }

    /**
     * 성능 설정 이벤트 리스너
     */
    setupPerformancePreferences() {
        const performanceToggles = ['enableAnimations', 'enableTransitions', 'lazyLoadImages'];
        
        performanceToggles.forEach(toggleId => {
            const toggle = document.getElementById(toggleId);
            if (toggle) {
                const handleToggle = () => {
                    this.updatePreference(toggleId, toggle.checked);
                    this.applyPerformanceSettings();
                };
                
                toggle.addEventListener('change', handleToggle);
                this.cleanupFunctions.push(() => {
                    toggle.removeEventListener('change', handleToggle);
                });
            }
        });
    }

    /**
     * 접근성 설정 이벤트 리스너
     */
    setupAccessibilityPreferences() {
        // 고대비 모드
        const highContrastToggle = document.getElementById('highContrast');
        if (highContrastToggle) {
            const handleHighContrastToggle = () => {
                this.updatePreference('highContrast', highContrastToggle.checked);
                this.applyAccessibilitySettings();
            };
            
            highContrastToggle.addEventListener('change', handleHighContrastToggle);
            this.cleanupFunctions.push(() => {
                highContrastToggle.removeEventListener('change', handleHighContrastToggle);
            });
        }

        // 폰트 크기
        const fontSizeSelects = document.querySelectorAll('input[name="fontSize"]');
        fontSizeSelects.forEach(radio => {
            const handleFontSizeChange = () => {
                if (radio.checked) {
                    this.updatePreference('fontSize', radio.value);
                    this.applyFontSize(radio.value);
                }
            };
            
            radio.addEventListener('change', handleFontSizeChange);
            this.cleanupFunctions.push(() => {
                radio.removeEventListener('change', handleFontSizeChange);
            });
        });

        // 애니메이션 감소
        const reducedMotionToggle = document.getElementById('reducedMotion');
        if (reducedMotionToggle) {
            const handleReducedMotionToggle = () => {
                this.updatePreference('reducedMotion', reducedMotionToggle.checked);
                this.applyMotionSettings();
            };
            
            reducedMotionToggle.addEventListener('change', handleReducedMotionToggle);
            this.cleanupFunctions.push(() => {
                reducedMotionToggle.removeEventListener('change', handleReducedMotionToggle);
            });
        }
    }

    /**
     * 현재 환경 설정 로드
     */
    loadCurrentPreferences() {
        const saved = SettingsStorage.getGeneralSettings('preferences');
        this.currentPreferences = { ...this.defaultPreferences, ...saved };
        this.updateUI();
    }

    /**
     * UI 업데이트
     */
    updateUI() {
        if (!this.currentPreferences) return;

        // 각 설정값을 UI에 반영
        Object.entries(this.currentPreferences).forEach(([key, value]) => {
            this.updateUIElement(key, value);
        });
    }

    /**
     * UI 요소 업데이트
     * @param {string} key - 설정 키
     * @param {*} value - 설정 값
     */
    updateUIElement(key, value) {
        const element = document.getElementById(key);
        
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = value;
            } else if (element.type === 'radio') {
                const radio = document.querySelector(`input[name="${key}"][value="${value}"]`);
                if (radio) radio.checked = true;
            } else {
                element.value = value;
            }
        } else {
            // 라디오 버튼 그룹 처리
            const radioGroup = document.querySelector(`input[name="${key}"][value="${value}"]`);
            if (radioGroup) {
                radioGroup.checked = true;
            }
        }
    }

    /**
     * 환경 설정 업데이트
     * @param {string} key - 설정 키
     * @param {*} value - 설정 값
     */
    updatePreference(key, value) {
        if (!this.currentPreferences) return;

        this.currentPreferences[key] = value;
        
        // 즉시 저장
        this.savePreferences();
        
        // 특정 설정에 대한 즉시 적용
        this.applySpecificPreference(key, value);
    }

    /**
     * 특정 설정 즉시 적용
     * @param {string} key - 설정 키
     * @param {*} value - 설정 값
     */
    applySpecificPreference(key, value) {
        switch (key) {
            case 'theme':
                this.applyTheme(value);
                break;
            case 'fontSize':
                this.applyFontSize(value);
                break;
            case 'highContrast':
            case 'reducedMotion':
                this.applyAccessibilitySettings();
                break;
            case 'enableAnimations':
            case 'enableTransitions':
                this.applyPerformanceSettings();
                break;
        }
    }

    /**
     * 테마 적용
     * @param {string} theme - 테마 (light, dark, auto)
     */
    applyTheme(theme) {
        const body = document.body;
        
        // 기존 테마 클래스 제거
        body.classList.remove('theme-light', 'theme-dark', 'theme-auto');
        
        if (theme === 'auto') {
            // 시스템 설정 따르기
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            body.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
        } else {
            body.classList.add(`theme-${theme}`);
        }
    }

    /**
     * 폰트 크기 적용
     * @param {string} fontSize - 폰트 크기 (small, medium, large)
     */
    applyFontSize(fontSize) {
        const root = document.documentElement;
        
        const fontSizeMap = {
            small: '14px',
            medium: '16px',
            large: '18px'
        };
        
        root.style.setProperty('--base-font-size', fontSizeMap[fontSize] || fontSizeMap.medium);
    }

    /**
     * 접근성 설정 적용
     */
    applyAccessibilitySettings() {
        const body = document.body;
        
        // 고대비 모드
        if (this.currentPreferences.highContrast) {
            body.classList.add('high-contrast');
        } else {
            body.classList.remove('high-contrast');
        }
        
        this.applyMotionSettings();
    }

    /**
     * 모션 설정 적용
     */
    applyMotionSettings() {
        const root = document.documentElement;
        
        if (this.currentPreferences.reducedMotion) {
            root.style.setProperty('--animation-duration', '0.01ms');
            root.style.setProperty('--transition-duration', '0.01ms');
        } else {
            root.style.removeProperty('--animation-duration');
            root.style.removeProperty('--transition-duration');
        }
    }

    /**
     * 성능 설정 적용
     */
    applyPerformanceSettings() {
        const body = document.body;
        
        // 애니메이션 설정
        if (!this.currentPreferences.enableAnimations) {
            body.classList.add('no-animations');
        } else {
            body.classList.remove('no-animations');
        }
        
        // 트랜지션 설정
        if (!this.currentPreferences.enableTransitions) {
            body.classList.add('no-transitions');
        } else {
            body.classList.remove('no-transitions');
        }
    }

    /**
     * 자동 저장 간격 토글
     * @param {boolean} enabled - 자동 저장 활성화 여부
     */
    toggleAutoSaveInterval(enabled) {
        const intervalInput = document.getElementById('formAutoSaveInterval');
        if (intervalInput) {
            intervalInput.disabled = !enabled;
        }
    }

    /**
     * 모든 환경 설정 적용
     */
    applyPreferences() {
        if (!this.currentPreferences) return;

        this.applyTheme(this.currentPreferences.theme);
        this.applyFontSize(this.currentPreferences.fontSize);
        this.applyAccessibilitySettings();
        this.applyPerformanceSettings();
        this.toggleAutoSaveInterval(this.currentPreferences.formAutoSave);
    }

    /**
     * 환경 설정 저장
     */
    savePreferences() {
        try {
            SettingsStorage.saveGeneralSettings('preferences', this.currentPreferences);
        } catch (error) {
            console.error('환경 설정 저장 오류:', error);
        }
    }

    /**
     * 모든 환경 설정 저장
     */
    async saveAllPreferences() {
        try {
            // 로컬 저장
            this.savePreferences();
            
            // 서버 저장
            await SettingsAPI.savePreferences(this.currentPreferences);
            
            UIUtils.showAlert('환경 설정이 저장되었습니다.', 'success');
        } catch (error) {
            console.error('환경 설정 저장 오류:', error);
            UIUtils.showAlert('환경 설정 저장 중 오류가 발생했습니다.', 'error');
        }
    }

    /**
     * 기본값으로 초기화
     */
    resetToDefaults() {
        UIUtils.showConfirm('모든 환경 설정을 기본값으로 초기화하시겠습니까?', (confirmed) => {
            if (confirmed) {
                this.currentPreferences = { ...this.defaultPreferences };
                this.updateUI();
                this.applyPreferences();
                this.savePreferences();
                UIUtils.showAlert('환경 설정이 기본값으로 초기화되었습니다.', 'success');
            }
        });
    }

    /**
     * 현재 환경 설정 반환
     * @returns {Object} 현재 환경 설정
     */
    getCurrentPreferences() {
        return { ...this.currentPreferences };
    }

    /**
     * 환경 설정 내보내기
     * @returns {Object} 환경 설정 데이터
     */
    exportPreferences() {
        return {
            preferences: this.getCurrentPreferences(),
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
    }

    /**
     * 환경 설정 가져오기
     * @param {Object} data - 가져올 환경 설정 데이터
     */
    importPreferences(data) {
        try {
            if (data.preferences) {
                this.currentPreferences = { ...this.defaultPreferences, ...data.preferences };
                this.updateUI();
                this.applyPreferences();
                this.savePreferences();
                UIUtils.showAlert('환경 설정을 가져왔습니다.', 'success');
            }
        } catch (error) {
            console.error('환경 설정 가져오기 오류:', error);
            UIUtils.showAlert('환경 설정 가져오기 중 오류가 발생했습니다.', 'error');
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

export default PreferencesManager; 