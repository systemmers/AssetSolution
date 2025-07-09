/**
 * Legacy 리디렉션 파일
 * 기존 settings.js 파일과의 호환성을 제공합니다.
 * 
 * 이 파일은 기존 코드에서 settings.js를 import하거나 참조하는 경우
 * 새로운 모듈형 구조로 리디렉션하는 역할을 합니다.
 */

import settingsManager from './index.js';

// 기존 방식으로 전역 객체 접근하는 경우를 위한 호환성 제공
if (typeof window !== 'undefined') {
    // 기존 전역 변수명 유지
    window.settingsManager = settingsManager;
    window.Settings = settingsManager;
    
    // 구형 API 호환성 메서드들
    window.Settings.init = function() {
        console.warn('Settings.init()은 deprecated입니다. settingsManager.initialize()를 사용하세요.');
        return settingsManager.initialize();
    };
    
    window.Settings.save = function() {
        console.warn('Settings.save()는 deprecated입니다. settingsManager.saveCurrentModule()을 사용하세요.');
        return settingsManager.saveCurrentModule();
    };
    
    window.Settings.export = function() {
        console.warn('Settings.export()는 deprecated입니다. settingsManager.exportAllSettings()를 사용하세요.');
        return settingsManager.exportAllSettings();
    };
    
    window.Settings.import = function() {
        console.warn('Settings.import()는 deprecated입니다. settingsManager.importSettings()를 사용하세요.');
        return settingsManager.importSettings();
    };
}

// Legacy 함수들을 위한 Wrapper
const LegacySettings = {
    // 기존 초기화 함수
    initialize: () => {
        console.warn('Legacy initialize() 호출됨. 새로운 settingsManager.initialize() 사용을 권장합니다.');
        return settingsManager.initialize();
    },
    
    // 기존 저장 함수
    save: () => {
        console.warn('Legacy save() 호출됨. 새로운 settingsManager.saveCurrentModule() 사용을 권장합니다.');
        return settingsManager.saveCurrentModule();
    },
    
    // 기존 카테고리 관련 함수들
    categories: {
        getTree: () => {
            const categoriesModule = settingsManager.getModule('categories');
            if (categoriesModule && categoriesModule.getTreeManager) {
                return categoriesModule.getTreeManager().getCurrentTree();
            }
            return null;
        },
        
        saveTree: (treeData) => {
            const categoriesModule = settingsManager.getModule('categories');
            if (categoriesModule && categoriesModule.getTreeManager) {
                return categoriesModule.getTreeManager().saveTree(treeData);
            }
        },
        
        getPresets: () => {
            const categoriesModule = settingsManager.getModule('categories');
            if (categoriesModule && categoriesModule.getPresetManager) {
                return categoriesModule.getPresetManager().getCurrentPresets();
            }
            return [];
        }
    },
    
    // 기존 일반 설정 함수들
    preferences: {
        get: () => {
            const generalModule = settingsManager.getModule('general');
            if (generalModule) {
                return generalModule.getCurrentPreferences();
            }
            return null;
        },
        
        set: (preferences) => {
            const generalModule = settingsManager.getModule('general');
            if (generalModule && generalModule.getPreferencesManager) {
                const preferencesManager = generalModule.getPreferencesManager();
                if (preferencesManager && preferencesManager.importPreferences) {
                    return preferencesManager.importPreferences({ preferences });
                }
            }
        }
    },
    
    // 기존 알림 설정 함수들
    notifications: {
        get: () => {
            const generalModule = settingsManager.getModule('general');
            if (generalModule) {
                return generalModule.getCurrentNotificationSettings();
            }
            return null;
        },
        
        set: (notifications) => {
            const generalModule = settingsManager.getModule('general');
            if (generalModule && generalModule.getNotificationsManager) {
                const notificationsManager = generalModule.getNotificationsManager();
                if (notificationsManager && notificationsManager.importSettings) {
                    return notificationsManager.importSettings({ notifications });
                }
            }
        }
    },
    
    // 기존 AI 설정 함수들
    ai: {
        getProviders: () => {
            const aiModule = settingsManager.getModule('ai');
            if (aiModule && aiModule.getProviderManager) {
                return aiModule.getProviderManager().getCurrentProviders();
            }
            return [];
        },
        
        getModels: () => {
            const aiModule = settingsManager.getModule('ai');
            if (aiModule && aiModule.getModelManager) {
                return aiModule.getModelManager().getCurrentModels();
            }
            return [];
        }
    },
    
    // 기존 필드 설정 함수들
    fields: {
        getCustomFields: () => {
            const fieldsModule = settingsManager.getModule('fields');
            if (fieldsModule) {
                return fieldsModule.getCurrentFields();
            }
            return [];
        },
        
        getValidationRules: () => {
            const fieldsModule = settingsManager.getModule('fields');
            if (fieldsModule) {
                return fieldsModule.getCurrentValidationRules();
            }
            return { builtIn: {}, custom: [] };
        }
    },
    
    // 기존 백업 함수들
    backup: {
        create: (types) => {
            const backupModule = settingsManager.getModule('backup');
            if (backupModule && backupModule.executeBackup) {
                return backupModule.executeBackup(types);
            }
        },
        
        restore: (file) => {
            const backupModule = settingsManager.getModule('backup');
            if (backupModule && backupModule.executeRestore) {
                return backupModule.executeRestore(file);
            }
        }
    }
};

// 기존 전역 함수들 호환성 제공
if (typeof window !== 'undefined') {
    // 기존 방식으로 함수를 호출하는 경우를 위한 전역 함수들
    window.initializeSettings = () => {
        console.warn('전역 initializeSettings() 함수는 deprecated입니다.');
        return LegacySettings.initialize();
    };
    
    window.saveSettings = () => {
        console.warn('전역 saveSettings() 함수는 deprecated입니다.');
        return LegacySettings.save();
    };
    
    window.getCategoryTree = () => {
        console.warn('전역 getCategoryTree() 함수는 deprecated입니다.');
        return LegacySettings.categories.getTree();
    };
    
    window.saveCategoryTree = (treeData) => {
        console.warn('전역 saveCategoryTree() 함수는 deprecated입니다.');
        return LegacySettings.categories.saveTree(treeData);
    };
    
    window.getPreferences = () => {
        console.warn('전역 getPreferences() 함수는 deprecated입니다.');
        return LegacySettings.preferences.get();
    };
    
    window.setPreferences = (preferences) => {
        console.warn('전역 setPreferences() 함수는 deprecated입니다.');
        return LegacySettings.preferences.set(preferences);
    };
    
    // Legacy Settings 객체도 전역에 등록
    window.LegacySettings = LegacySettings;
}

// CommonJS 스타일 export 호환성
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        settingsManager,
        LegacySettings,
        // 기존 방식 호환성
        default: settingsManager,
        Settings: settingsManager
    };
}

// AMD 스타일 export 호환성
if (typeof define === 'function' && define.amd) {
    define(['./index.js'], function(settingsManager) {
        return {
            settingsManager,
            LegacySettings,
            Settings: settingsManager
        };
    });
}

// 마이그레이션 가이드 출력
console.group('🔄 Settings 모듈 마이그레이션 가이드');
console.log('기존 settings.js 파일이 새로운 모듈형 구조로 업그레이드되었습니다.');
console.log('');
console.log('✅ 권장 마이그레이션:');
console.log('  - settingsManager.initialize() 사용');
console.log('  - settingsManager.getModule("moduleName") 을 통한 모듈 접근');
console.log('  - 모듈별 API 사용');
console.log('');
console.log('⚠️  Deprecated 함수들은 호환성을 위해 유지되지만');
console.log('   향후 버전에서 제거될 예정입니다.');
console.log('');
console.log('📚 새로운 API 문서: docs/javascript_phase4_implementation.md');
console.groupEnd();

// ES6 모듈 export
export { settingsManager, LegacySettings };
export default settingsManager; 