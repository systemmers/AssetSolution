/**
 * Settings 모듈 메인 통합 진입점
 * 모든 Settings 하위 모듈을 통합 관리합니다.
 * 
 * 파일 내 코드 기능 요약:
 * 1. SettingsManager: 메인 관리자 클래스
 * 2. 모듈 통합: general, categories, fields, ai, backup 모듈 관리
 * 3. 탭 시스템: Bootstrap 탭 기반 모듈 전환
 * 4. 전역 단축키: Ctrl+S(저장), Ctrl+E(내보내기), Ctrl+I(가져오기)
 * 5. 설정 가져오기/내보내기: JSON 기반 전체 설정 관리
 */

import generalSettingsManager from './general/index.js';
import { initCategoryManager, getCategoryManager } from './categories.js';
import fieldsSettingsManager from './fields/index.js';
import aiSettingsManager from './ai/index.js';
import BackupManager from './backup/backup-manager.js';

/**
 * Settings 메인 관리자 클래스
 */
class SettingsManager {
    constructor() {
        this.modules = {
            general: generalSettingsManager,
            categories: null, // 동적으로 초기화됨
            fields: fieldsSettingsManager,
            ai: aiSettingsManager,
            backup: null
        };
        this.cleanupFunctions = [];
        this.currentActiveModule = null;
        this.initializationStatus = {
            completed: false,
            errors: []
        };
    }

    /**
     * 초기화
     */
    async initialize() {
        try {
            console.log('Settings 모듈 초기화 시작...');
            
            // 각 모듈 순차 초기화
            await this.initializeModules();
            
            // 메인 탭 이벤트 설정
            this.setupMainTabEvents();
            
            // 전역 단축키 설정
            this.setupGlobalHotkeys();
            
            // 초기 모듈 활성화
            this.activateInitialModule();
            
            this.initializationStatus.completed = true;
            console.log('Settings 모듈 초기화 완료');
            
            // 초기화 완료 이벤트 발생
            this.dispatchInitializationEvent();
            
        } catch (error) {
            console.error('Settings 모듈 초기화 오류:', error);
            this.initializationStatus.errors.push(error.message);
            this.handleInitializationError(error);
        }
    }

    /**
     * 모듈별 초기화
     */
    async initializeModules() {
        const initOrder = ['general', 'categories', 'fields', 'ai', 'backup'];
        
        for (const moduleKey of initOrder) {
            try {
                console.log(`${moduleKey} 모듈 초기화 중...`);
                
                // 카테고리 모듈의 특별한 초기화 처리
                if (moduleKey === 'categories') {
                    this.modules.categories = await initCategoryManager();
                    console.log(`${moduleKey} 모듈 초기화 완료`);
                    continue;
                }
                
                // 백업 모듈의 인스턴스 생성
                if (moduleKey === 'backup' && !this.modules.backup) {
                    this.modules.backup = new BackupManager();
                }
                
                const module = this.modules[moduleKey];
                if (module && typeof module.initialize === 'function') {
                    await module.initialize();
                    console.log(`${moduleKey} 모듈 초기화 완료`);
                } else {
                    console.warn(`${moduleKey} 모듈을 찾을 수 없거나 초기화 메서드가 없습니다.`);
                }
                
            } catch (error) {
                console.error(`${moduleKey} 모듈 초기화 오류:`, error);
                this.initializationStatus.errors.push(`${moduleKey}: ${error.message}`);
                // 개별 모듈 오류는 전체 초기화를 중단하지 않음
            }
        }
    }

    /**
     * 메인 탭 이벤트 설정
     */
    setupMainTabEvents() {
        const mainTabs = document.querySelectorAll('[data-bs-toggle="tab"][data-settings-module]');
        
        mainTabs.forEach(tab => {
            const handleMainTabChange = (event) => {
                const moduleKey = event.target.dataset.settingsModule;
                this.activateModule(moduleKey);
            };
            
            tab.addEventListener('shown.bs.tab', handleMainTabChange);
            this.cleanupFunctions.push(() => {
                tab.removeEventListener('shown.bs.tab', handleMainTabChange);
            });
        });
    }

    /**
     * 전역 단축키 설정
     */
    setupGlobalHotkeys() {
        const handleKeydown = (event) => {
            // Ctrl + S: 현재 활성 모듈 저장
            if (event.ctrlKey && event.key === 's') {
                event.preventDefault();
                this.saveCurrentModule();
            }
            
            // Ctrl + E: 설정 내보내기
            if (event.ctrlKey && event.key === 'e') {
                event.preventDefault();
                this.exportAllSettings();
            }
            
            // Ctrl + I: 설정 가져오기
            if (event.ctrlKey && event.key === 'i') {
                event.preventDefault();
                this.importSettings();
            }
        };
        
        document.addEventListener('keydown', handleKeydown);
        this.cleanupFunctions.push(() => {
            document.removeEventListener('keydown', handleKeydown);
        });
    }

    /**
     * 초기 모듈 활성화
     */
    activateInitialModule() {
        // URL 해시에서 초기 모듈 결정
        const hash = window.location.hash.replace('#', '');
        const initialModule = hash && this.modules[hash] ? hash : 'general';
        
        // 해당 탭 활성화
        const tab = document.querySelector(`[data-settings-module="${initialModule}"]`);
        if (tab) {
            const bsTab = new bootstrap.Tab(tab);
            bsTab.show();
        }
    }

    /**
     * 모듈 활성화
     * @param {string} moduleKey - 활성화할 모듈 키
     */
    activateModule(moduleKey) {
        try {
            const module = this.modules[moduleKey];
            if (!module) {
                console.warn(`모듈 '${moduleKey}'를 찾을 수 없습니다.`);
                return;
            }

            // 이전 모듈 비활성화
            if (this.currentActiveModule && this.currentActiveModule !== moduleKey) {
                this.deactivateModule(this.currentActiveModule);
            }

            this.currentActiveModule = moduleKey;
            
            // 모듈별 특화 활성화 처리
            this.handleModuleActivation(moduleKey, module);
            
            // URL 해시 업데이트
            window.history.replaceState(null, null, `#${moduleKey}`);
            
            console.log(`모듈 '${moduleKey}' 활성화 완료`);
            
        } catch (error) {
            console.error(`모듈 '${moduleKey}' 활성화 오류:`, error);
        }
    }

    /**
     * 모듈별 특화 활성화 처리
     * @param {string} moduleKey - 모듈 키
     * @param {Object} module - 모듈 인스턴스
     */
    handleModuleActivation(moduleKey, module) {
        switch (moduleKey) {
            case 'general':
                // 일반 설정 활성화 시 현재 설정 로드
                if (module.getCurrentPreferences) {
                    module.getCurrentPreferences();
                }
                if (module.getCurrentNotificationSettings) {
                    module.getCurrentNotificationSettings();
                }
                break;
                
            case 'categories':
                // 카테고리 설정 활성화 시 처리
                if (module) {
                    // 카테고리 매니저가 초기화되지 않은 경우 다시 초기화 시도
                    if (!module.isInitialized) {
                        console.log('카테고리 모듈 재초기화 시도...');
                        module.init().catch(error => {
                            console.error('카테고리 모듈 재초기화 실패:', error);
                        });
                    }
                    // 저장된 카테고리 데이터 로드
                    if (module.loadSavedCategories) {
                        module.loadSavedCategories().catch(error => {
                            console.warn('카테고리 데이터 로드 실패:', error);
                        });
                    }
                }
                break;
                
            case 'fields':
                // 필드 설정 활성화 시 필드 목록 새로고침
                if (module.getCurrentFields) {
                    module.getCurrentFields();
                }
                break;
                
            case 'ai':
                // AI 설정 활성화 시 제공업체 목록 새로고침
                if (module.getProviderManager && module.getProviderManager().loadProviders) {
                    module.getProviderManager().loadProviders();
                }
                break;
                
            case 'backup':
                // 백업 설정 활성화 시 백업 이력 새로고침
                if (module.loadBackupHistory) {
                    module.loadBackupHistory();
                }
            break;
    }
}

/**
     * 모듈 비활성화
     * @param {string} moduleKey - 비활성화할 모듈 키
     */
    deactivateModule(moduleKey) {
        try {
            const module = this.modules[moduleKey];
            if (module && typeof module.cleanup === 'function') {
                // 모듈별 정리 작업은 수행하지 않음 (메모리 유지)
                console.log(`모듈 '${moduleKey}' 비활성화`);
            }
        } catch (error) {
            console.error(`모듈 '${moduleKey}' 비활성화 오류:`, error);
    }
}

/**
     * 현재 활성 모듈 저장
     */
    async saveCurrentModule() {
        if (!this.currentActiveModule) return;
        
        try {
            const module = this.modules[this.currentActiveModule];
            
            // 모듈별 저장 메서드 호출
            if (module.saveAllSettings) {
                await module.saveAllSettings();
            } else if (module.save) {
                await module.save();
            }
            
            // 저장 완료 알림
            this.showNotification(`${this.currentActiveModule} 설정이 저장되었습니다.`, 'success');
            
            console.log(`모듈 '${this.currentActiveModule}' 저장 완료`);
            
        } catch (error) {
            console.error(`모듈 '${this.currentActiveModule}' 저장 오류:`, error);
            this.showNotification('저장 중 오류가 발생했습니다.', 'error');
        }
    }

    /**
     * 전체 설정 내보내기
     */
    async exportAllSettings() {
        try {
            const exportData = {
                metadata: {
                    exportedAt: new Date().toISOString(),
                    version: '1.0',
                    system: 'Asset Management System Settings'
                },
                settings: {}
            };

            // 각 모듈의 설정 데이터 수집
            for (const [moduleKey, module] of Object.entries(this.modules)) {
                if (!module) continue;
                
                try {
                    let moduleData = null;
                    
                    if (module.exportSettings) {
                        moduleData = module.exportSettings();
                    } else if (module.export) {
                        moduleData = module.export();
                    }
                    
                    if (moduleData) {
                        exportData.settings[moduleKey] = moduleData;
                    }
                    
                } catch (error) {
                    console.error(`모듈 '${moduleKey}' 내보내기 오류:`, error);
                }
            }

            // 파일 다운로드
            this.downloadSettingsFile(exportData, 'settings');
            this.showNotification('설정이 성공적으로 내보내졌습니다.', 'success');
            
        } catch (error) {
            console.error('전체 설정 내보내기 오류:', error);
            this.showNotification('설정 내보내기 중 오류가 발생했습니다.', 'error');
        }
    }

    /**
     * 설정 파일 다운로드
     * @param {Object} data - 다운로드할 데이터
     * @param {string} type - 파일 유형
     */
    downloadSettingsFile(data, type = 'settings') {
        const timestamp = new Date().toISOString().slice(0, 16).replace(/[:-]/g, '');
        const filename = `asset_${type}_${timestamp}.json`;
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = filename;
        link.click();
        
        URL.revokeObjectURL(link.href);
    }

    /**
     * 설정 가져오기
     */
    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            try {
                const content = await this.readFileContent(file);
                const settingsData = JSON.parse(content);
                
                // 설정 데이터 유효성 검사
                if (!this.validateSettingsFile(settingsData)) {
                    this.showNotification('유효하지 않은 설정 파일입니다.', 'error');
        return;
    }
    
                // 확인 후 가져오기
                if (confirm('설정을 가져오시겠습니까? 기존 설정이 덮어쓰여집니다.')) {
                    await this.processSettingsImport(settingsData);
                }
                
            } catch (error) {
                console.error('설정 가져오기 오류:', error);
                this.showNotification('설정 파일을 읽는 중 오류가 발생했습니다.', 'error');
            }
        };
        
        input.click();
    }

    /**
     * 파일 내용 읽기
     * @param {File} file - 읽을 파일
     * @returns {Promise<string>} 파일 내용
     */
    readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    /**
     * 설정 파일 유효성 검사
     * @param {Object} settingsData - 설정 데이터
     * @returns {boolean} 유효성 여부
     */
    validateSettingsFile(settingsData) {
        return settingsData &&
               settingsData.metadata &&
               settingsData.settings &&
               typeof settingsData.settings === 'object';
    }

    /**
     * 설정 가져오기 처리
     * @param {Object} settingsData - 설정 데이터
     */
    async processSettingsImport(settingsData) {
        const { settings } = settingsData;
        let successCount = 0;
        
        for (const [moduleKey, moduleData] of Object.entries(settings)) {
            try {
                const module = this.modules[moduleKey];
                if (!module) continue;
                
                if (module.importSettings) {
                    module.importSettings(moduleData);
                } else if (module.import) {
                    module.import(moduleData);
                }
                
                successCount++;
                console.log(`모듈 '${moduleKey}' 설정 가져오기 완료`);
                
            } catch (error) {
                console.error(`모듈 '${moduleKey}' 설정 가져오기 오류:`, error);
            }
        }
        
        this.showNotification(`${successCount}개 모듈의 설정을 가져왔습니다.`, 'success');
        
        // 페이지 새로고침으로 변경사항 반영
        if (confirm('설정이 가져와졌습니다. 페이지를 새로고침하시겠습니까?')) {
            window.location.reload();
        }
    }

    /**
     * 알림 표시
     * @param {string} message - 알림 메시지
     * @param {string} type - 알림 유형 (success, error, warning, info)
     */
    showNotification(message, type = 'info') {
        // Bootstrap 토스트 또는 알림 시스템 사용
        const toastContainer = document.getElementById('toastContainer');
        if (toastContainer) {
            const toast = document.createElement('div');
            toast.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'primary'} border-0`;
            toast.setAttribute('role', 'alert');
            toast.innerHTML = `
                <div class="d-flex">
                    <div class="toast-body">${message}</div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            `;
            
            toastContainer.appendChild(toast);
            const bsToast = new bootstrap.Toast(toast);
            bsToast.show();
            
            // 자동 제거
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 5000);
        } else {
            // 폴백: alert 사용
            alert(message);
        }
    }

    /**
     * 모듈 상태 검사
     * @returns {Object} 모듈 상태 정보
     */
    getModuleStatus() {
        const status = {
            initialized: this.initializationStatus.completed,
            errors: [...this.initializationStatus.errors],
            modules: {}
        };

        for (const [moduleKey, module] of Object.entries(this.modules)) {
            status.modules[moduleKey] = {
                loaded: !!module,
                hasValidation: !!(module && module.validateSettings),
                lastError: null
            };

            // 모듈별 유효성 검사
            if (module && module.validateSettings) {
                try {
                    const validation = module.validateSettings();
                    status.modules[moduleKey].validation = validation;
                } catch (error) {
                    status.modules[moduleKey].lastError = error.message;
                }
            }
        }

        return status;
    }

    /**
     * 특정 모듈 반환
     * @param {string} moduleKey - 모듈 키
     * @returns {Object|null} 모듈 인스턴스
     */
    getModule(moduleKey) {
        return this.modules[moduleKey] || null;
    }

    /**
     * 현재 활성 모듈 반환
     * @returns {string|null} 현재 활성 모듈 키
     */
    getCurrentActiveModule() {
        return this.currentActiveModule;
    }

    /**
     * 초기화 완료 이벤트 발생
     */
    dispatchInitializationEvent() {
        const event = new CustomEvent('settings:initialized', {
            detail: {
                status: this.initializationStatus,
                modules: Object.keys(this.modules)
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * 초기화 오류 처리
     * @param {Error} error - 발생한 오류
     */
    handleInitializationError(error) {
        const errorContainer = document.getElementById('settingsMainError');
        if (errorContainer) {
            errorContainer.innerHTML = `
                <div class="alert alert-danger">
                    <h5><i class="fas fa-exclamation-triangle me-2"></i>Settings 모듈 초기화 오류</h5>
                    <p>일부 설정 모듈을 초기화하는 중 오류가 발생했습니다.</p>
                    <details>
                        <summary>오류 상세</summary>
                        <ul class="mb-0">
                            ${this.initializationStatus.errors.map(err => `<li>${err}</li>`).join('')}
                        </ul>
                    </details>
                </div>
            `;
        }

        // 콘솔에도 상세 오류 출력
        console.group('Settings 모듈 초기화 오류 상세');
        this.initializationStatus.errors.forEach(err => console.error(err));
        console.groupEnd();
    }

    /**
     * 전체 정리
     */
    cleanup() {
        // 전역 이벤트 리스너 정리
        this.cleanupFunctions.forEach(fn => {
            if (typeof fn === 'function') fn();
        });
        this.cleanupFunctions = [];

        // 각 모듈 정리
        Object.entries(this.modules).forEach(([moduleKey, module]) => {
            if (module && typeof module.cleanup === 'function') {
                try {
                    module.cleanup();
                    console.log(`모듈 '${moduleKey}' 정리 완료`);
                } catch (error) {
                    console.error(`모듈 '${moduleKey}' 정리 오류:`, error);
                }
            }
        });

        // 상태 초기화
        this.currentActiveModule = null;
        this.initializationStatus = {
            completed: false,
            errors: []
        };
    }
}

// 전역 인스턴스 생성 및 내보내기
const settingsManager = new SettingsManager();

// DOM 로드 시 자동 초기화
document.addEventListener('DOMContentLoaded', async function() {
    try {
        console.log('DOM 로드 완료, Settings 매니저 초기화 시작...');
        await settingsManager.initialize();
        console.log('Settings 매니저 초기화 완료');
        
        // 전역 접근을 위해 window 객체에 추가
        window.settingsManager = settingsManager;
        
    } catch (error) {
        console.error('Settings 매니저 초기화 실패:', error);
        alert('설정 시스템을 초기화하는 중 오류가 발생했습니다: ' + error.message);
    }
});

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', function() {
    settingsManager.cleanup();
});

// 전역 접근을 위한 window 객체에 등록
if (typeof window !== 'undefined') {
    window.SettingsManager = settingsManager;
}

export default settingsManager; 