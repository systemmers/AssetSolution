/**
 * 카테고리 관리 통합 모듈
 * 트리 관리, 아이템 관리, 프리셋 관리 모듈들을 통합하여 동작하는 메인 진입점
 */

import { TreeManager } from './categories/tree-manager.js';
import { ItemManager } from './categories/item-manager.js';
import CategoryPresetManager from './categories/preset-manager.js';
import SettingsAPI from './core/settings-api.js';

/**
 * 카테고리 매니저 클래스
 * 카테고리 관리 페이지의 모든 기능을 통합 관리
 */
class CategoryManager {
    constructor() {
        this.treeManager = null;
        this.itemManager = null;
        this.presetManager = null;
        this.api = SettingsAPI;
        
        this.isInitialized = false;
        this.currentData = null;
        
        // 컴포넌트 간 이벤트 처리를 위한 커스텀 이벤트 디스패처
        this.eventTarget = new EventTarget();
        
        console.log('[CategoryManager] 초기화 시작');
    }

    /**
     * 카테고리 매니저 초기화
     */
    async init() {
        if (this.isInitialized) {
            console.log('[CategoryManager] 이미 초기화됨');
            return;
        }

        try {
            console.log('[CategoryManager] 컴포넌트 초기화 시작');
            
            // 1. DOM 요소 존재 확인
            const requiredElements = ['categoryTree', 'levelLimit', 'presetSelect'];
            const missingElements = requiredElements.filter(id => !document.getElementById(id));
            
            if (missingElements.length > 0) {
                console.warn('[CategoryManager] 필수 DOM 요소 누락:', missingElements);
                return false;
            }

            // 2. 하위 매니저들 초기화
            this.treeManager = new TreeManager();
            this.itemManager = new ItemManager();
            this.presetManager = new CategoryPresetManager(this.treeManager);

            // 3. 매니저 초기화
            await this.treeManager.init();
            await this.itemManager.init();
            await this.presetManager.initialize();

            // 4. 컴포넌트 간 이벤트 연결
            this.setupComponentEvents();
            
            // 5. 초기 데이터 로드
            await this.loadInitialData();

            // 6. UI 이벤트 리스너 설정
            this.setupEventListeners();

            this.isInitialized = true;
            console.log('[CategoryManager] 초기화 완료');
            
            // 초기화 완료 이벤트 발송
            this.dispatchEvent('categoryManagerReady', {
                treeManager: this.treeManager,
                itemManager: this.itemManager,
                presetManager: this.presetManager
            });

            return true;
        } catch (error) {
            console.error('[CategoryManager] 초기화 실패:', error);
            this.showError('카테고리 매니저 초기화에 실패했습니다: ' + error.message);
            return false;
        }
    }

    /**
     * 컴포넌트 간 이벤트 연결 설정
     */
    setupComponentEvents() {
        // 트리 매니저 이벤트
        this.treeManager.on('itemSelected', (data) => {
            this.itemManager.selectItem(data.item);
        });

        this.treeManager.on('itemAdded', (data) => {
            this.itemManager.addItem(data.item, data.parent);
        });

        this.treeManager.on('itemDeleted', (data) => {
            this.itemManager.deleteItem(data.item);
        });

        this.treeManager.on('treeChanged', () => {
            this.handleTreeChange();
        });

        // 아이템 매니저 이벤트
        this.itemManager.on('itemUpdated', (data) => {
            this.treeManager.updateItem(data.item);
        });

        // 프리셋 매니저 이벤트
        this.presetManager.on('presetLoaded', (data) => {
            this.loadPresetData(data.preset);
        });

        this.presetManager.on('presetSaved', (data) => {
            this.showSuccess('프리셋이 저장되었습니다: ' + data.preset.name);
        });

        console.log('[CategoryManager] 컴포넌트 이벤트 연결 완료');
    }

    /**
     * UI 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 전체 펼치기/접기 버튼
        const expandAllBtn = document.getElementById('expandAll');
        const collapseAllBtn = document.getElementById('collapseAll');
        
        if (expandAllBtn) {
            expandAllBtn.addEventListener('click', () => {
                this.treeManager.expandAll();
            });
        }

        if (collapseAllBtn) {
            collapseAllBtn.addEventListener('click', () => {
                this.treeManager.collapseAll();
            });
        }

        // 최상위 항목 추가 버튼
        const addRootBtn = document.getElementById('addRootItem');
        if (addRootBtn) {
            addRootBtn.addEventListener('click', () => {
                this.addRootItem();
            });
        }

        // 단계별 펼침 변경
        const expandLevelSelect = document.getElementById('expandLevel');
        if (expandLevelSelect) {
            expandLevelSelect.addEventListener('change', (e) => {
                this.treeManager.expandToLevel(e.target.value);
            });
        }

        // 단계 제한 변경
        const levelLimitSelect = document.getElementById('levelLimit');
        if (levelLimitSelect) {
            levelLimitSelect.addEventListener('change', (e) => {
                this.treeManager.setLevelLimit(e.target.value);
            });
        }

        console.log('[CategoryManager] UI 이벤트 리스너 설정 완료');
    }

    /**
     * 초기 데이터 로드
     */
    async loadInitialData() {
        try {
            console.log('[CategoryManager] 초기 데이터 로드 시작');
            
            // 저장된 카테고리 구조 로드
            const response = await this.api.loadCategories();
            if (response.success && response.data) {
                this.currentData = response.data;
                await this.treeManager.loadTreeData(response.data.categories);
                console.log('[CategoryManager] 저장된 카테고리 로드 완료');
            } else {
                console.log('[CategoryManager] 저장된 카테고리 없음, 빈 트리로 시작');
            }

            // 프리셋 목록 로드
            await this.presetManager.loadPresets();
            
        } catch (error) {
            console.warn('[CategoryManager] 초기 데이터 로드 실패 (빈 상태로 시작):', error);
        }
    }

    /**
     * 최상위 항목 추가
     */
    addRootItem() {
        const newItemName = prompt('새 최상위 카테고리 이름을 입력하세요:');
        if (newItemName && newItemName.trim()) {
            this.treeManager.addRootItem(newItemName.trim());
        }
    }

    /**
     * 트리 변경 처리
     */
    async handleTreeChange() {
        try {
            // 현재 트리 구조 수집
            const treeData = this.treeManager.getTreeData();
            
            // 자동 저장 (옵션에 따라)
            const autoSave = localStorage.getItem('categoryAutoSave') !== 'false';
            if (autoSave) {
                await this.saveCategories(treeData);
            }
            
            this.dispatchEvent('treeChanged', { treeData });
            
        } catch (error) {
            console.error('[CategoryManager] 트리 변경 처리 실패:', error);
        }
    }

    /**
     * 카테고리 저장
     */
    async saveCategories(treeData) {
        try {
            const saveData = {
                name: '현재 카테고리 구조',
                structure: treeData || this.treeManager.getTreeData(),
                max_level: this.treeManager.getMaxLevel(),
                total_items: this.treeManager.getTotalItems()
            };

            const response = await this.api.saveCategories(saveData);
            
            if (response.success) {
                console.log('[CategoryManager] 카테고리 저장 완료');
                this.dispatchEvent('categoriesSaved', { data: response.data });
                return true;
            } else {
                throw new Error(response.message || '저장 실패');
            }
        } catch (error) {
            console.error('[CategoryManager] 카테고리 저장 실패:', error);
            this.showError('카테고리 저장에 실패했습니다: ' + error.message);
            return false;
        }
    }

    /**
     * 프리셋 데이터 로드
     */
    async loadPresetData(preset) {
        try {
            if (preset && preset.settings && preset.settings.categories) {
                await this.treeManager.loadTreeData(preset.settings.categories);
                this.showSuccess(`프리셋 "${preset.name}"이 로드되었습니다.`);
                
                // 전체 펼침
                setTimeout(() => {
                    this.treeManager.expandAll();
                }, 100);
            }
        } catch (error) {
            console.error('[CategoryManager] 프리셋 로드 실패:', error);
            this.showError('프리셋 로드에 실패했습니다: ' + error.message);
        }
    }

    /**
     * 현재 구조를 프리셋으로 저장
     */
    async saveAsPreset(name, description) {
        try {
            const treeData = this.treeManager.getTreeData();
            const presetData = {
                name: name,
                description: description,
                preset_type: 'category',
                settings: {
                    categories: treeData,
                    max_level: this.treeManager.getMaxLevel(),
                    total_items: this.treeManager.getTotalItems()
                },
                is_shared: false
            };

            const success = await this.presetManager.savePreset(presetData);
            if (success) {
                this.showSuccess(`프리셋 "${name}"이 저장되었습니다.`);
                return true;
            }
            return false;
        } catch (error) {
            console.error('[CategoryManager] 프리셋 저장 실패:', error);
            this.showError('프리셋 저장에 실패했습니다: ' + error.message);
            return false;
        }
    }

    /**
     * 카테고리 구조 초기화
     */
    resetCategories() {
        if (confirm('현재 카테고리 구조를 모두 초기화하시겠습니까?\n(저장되지 않은 변경사항은 모두 사라집니다)')) {
            this.treeManager.clear();
            this.itemManager.clear();
            this.presetManager.clearSelection();
            this.showInfo('카테고리 구조가 초기화되었습니다.');
        }
    }

    /**
     * 커스텀 이벤트 발송
     */
    dispatchEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        this.eventTarget.dispatchEvent(event);
        
        // 전역 이벤트로도 발송
        document.dispatchEvent(new CustomEvent(`categoryManager:${eventName}`, { detail }));
    }

    /**
     * 이벤트 리스너 등록
     */
    on(eventName, handler) {
        this.eventTarget.addEventListener(eventName, handler);
    }

    /**
     * 이벤트 리스너 해제
     */
    off(eventName, handler) {
        this.eventTarget.removeEventListener(eventName, handler);
    }

    /**
     * 성공 메시지 표시
     */
    showSuccess(message) {
        this.showToast(message, 'success');
    }

    /**
     * 오류 메시지 표시
     */
    showError(message) {
        this.showToast(message, 'error');
    }

    /**
     * 정보 메시지 표시
     */
    showInfo(message) {
        this.showToast(message, 'info');
    }

    /**
     * 토스트 메시지 표시
     */
    showToast(message, type = 'info') {
        console.log(`[CategoryManager] ${type.toUpperCase()}: ${message}`);
        
        if (type === 'error') {
            alert('오류: ' + message);
        } else if (type === 'success') {
            console.info('성공: ' + message);
        }
    }

    /**
     * 현재 상태 정보 반환
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            hasData: this.currentData !== null,
            totalItems: this.treeManager ? this.treeManager.getTotalItems() : 0,
            maxLevel: this.treeManager ? this.treeManager.getMaxLevel() : 0,
            treeManager: !!this.treeManager,
            itemManager: !!this.itemManager,
            presetManager: !!this.presetManager
        };
    }

    /**
     * 모든 설정 저장 (Settings 시스템 호환)
     */
    async saveAllSettings() {
        try {
            const treeData = this.treeManager ? this.treeManager.getTreeData() : null;
            if (treeData && Object.keys(treeData).length > 0) {
                const success = await this.saveCategories(treeData);
                return success;
            }
            return true; // 빈 데이터는 성공으로 처리
        } catch (error) {
            console.error('[CategoryManager] 모든 설정 저장 실패:', error);
            throw error;
        }
    }

    /**
     * 설정 내보내기 (Settings 시스템 호환)
     */
    exportSettings() {
        try {
            return {
                categories: this.treeManager ? this.treeManager.getTreeData() : {},
                metadata: {
                    exportedAt: new Date().toISOString(),
                    maxLevel: this.treeManager ? this.treeManager.getMaxLevel() : 0,
                    totalItems: this.treeManager ? this.treeManager.getTotalItems() : 0
                }
            };
        } catch (error) {
            console.error('[CategoryManager] 설정 내보내기 실패:', error);
            return null;
        }
    }

    /**
     * 설정 가져오기 (Settings 시스템 호환)
     */
    async importSettings(settingsData) {
        try {
            if (settingsData && settingsData.categories) {
                await this.treeManager.loadTreeData(settingsData.categories);
                console.log('[CategoryManager] 설정 가져오기 완료');
                return true;
            }
            return false;
        } catch (error) {
            console.error('[CategoryManager] 설정 가져오기 실패:', error);
            throw error;
        }
    }

    /**
     * 설정 유효성 검사 (Settings 시스템 호환)
     */
    validateSettings(settingsData) {
        try {
            return settingsData && 
                   typeof settingsData === 'object' &&
                   (settingsData.categories === undefined || typeof settingsData.categories === 'object');
        } catch (error) {
            console.error('[CategoryManager] 설정 유효성 검사 실패:', error);
            return false;
        }
    }

    /**
     * 정리 작업 (Settings 시스템 호환)
     */
    cleanup() {
        // 실제로는 매니저를 해제하지 않고 상태만 정리
        console.log('[CategoryManager] 정리 작업 수행');
    }

    /**
     * 매니저 해제
     */
    destroy() {
        try {
            if (this.treeManager) {
                this.treeManager.destroy();
            }
            if (this.itemManager) {
                this.itemManager.destroy();
            }
            if (this.presetManager) {
                this.presetManager.destroy();
            }
            
            this.isInitialized = false;
            console.log('[CategoryManager] 해제 완료');
        } catch (error) {
            console.error('[CategoryManager] 해제 중 오류:', error);
        }
    }
}

// 전역 접근을 위한 인스턴스 생성
let categoryManagerInstance = null;

function getCategoryManager() {
    if (!categoryManagerInstance) {
        categoryManagerInstance = new CategoryManager();
    }
    return categoryManagerInstance;
}

async function initCategoryManager() {
    const manager = getCategoryManager();
    const success = await manager.init();
    
    if (success && typeof window !== 'undefined') {
        window.categoryManager = manager;
    }
    
    return manager;
}

// ES6 모듈 export
export { CategoryManager, getCategoryManager, initCategoryManager };

// 전역 함수로도 등록
if (typeof window !== 'undefined') {
    window.initCategoryManager = initCategoryManager;
    window.getCategoryManager = getCategoryManager;
} 