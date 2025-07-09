/**
 * Categories 설정 모듈 통합 진입점
 * 카테고리 트리, 아이템, 프리셋 관리를 통합합니다.
 */

import CategoryTreeManager from './tree-manager.js';
import CategoryItemManager from './item-manager.js';
import CategoryPresetManager from './preset-manager.js';

/**
 * 카테고리 설정 통합 관리 클래스
 */
class CategoriesSettingsManager {
    constructor() {
        this.treeManager = null;
        this.itemManager = null;
        this.presetManager = null;
        this.cleanupFunctions = [];
        this.config = this.getDefaultConfig();
    }

    /**
     * 기본 설정 반환
     * @returns {Object} 기본 설정 객체
     */
    getDefaultConfig() {
        return {
            containerId: 'categoryTree',
            maxLevels: 10,
            defaultLevelLimit: 'unlimited',
            autoExpandNewItems: true,
            enablePresets: true,
            enableBulkOperations: true,
            validateCodes: true,
            allowDuplicateNames: false
        };
    }

    /**
     * 초기화
     * @param {Object} options - 초기화 옵션
     */
    initialize(options = {}) {
        try {
            // 설정 병합
            this.config = { ...this.config, ...options };

            // 트리 매니저 초기화
            this.treeManager = new CategoryTreeManager();
            this.treeManager.initialize(this.config.containerId);

            // 아이템 매니저 초기화
            this.itemManager = new CategoryItemManager(this.treeManager);

            // 프리셋 매니저 초기화 (설정이 활성화된 경우)
            if (this.config.enablePresets) {
                this.presetManager = new CategoryPresetManager(this.treeManager);
                this.presetManager.initialize();
            }

            // 매니저 간 연결 설정
            this.setupManagerConnections();

            // 컨트롤 이벤트 설정
            this.setupControlEvents();

            // 레벨 제한 적용
            if (this.config.defaultLevelLimit !== 'unlimited') {
                this.treeManager.setLevelLimit(this.config.defaultLevelLimit);
            }

            console.log('카테고리 설정 모듈 초기화 완료');
        } catch (error) {
            console.error('카테고리 설정 모듈 초기화 오류:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * 매니저 간 연결 설정
     */
    setupManagerConnections() {
        if (!this.treeManager || !this.itemManager) return;

        // 트리 매니저의 아이템 관련 메서드를 아이템 매니저로 연결
        this.treeManager.addCategoryItem = (parentId) => {
            this.itemManager.addCategoryItem(parentId);
        };

        this.treeManager.editCategoryItem = (itemId) => {
            this.itemManager.editCategoryItem(itemId);
        };

        this.treeManager.deleteCategoryItem = (itemId) => {
            this.itemManager.deleteCategoryItem(itemId);
        };
    }

    /**
     * 컨트롤 이벤트 설정
     */
    setupControlEvents() {
        // 전체 펼치기/접기 버튼
        this.setupExpandCollapseEvents();
        
        // 레벨 제한 컨트롤
        this.setupLevelLimitEvents();
        
        // 최상위 항목 추가 버튼
        this.setupAddRootItemEvent();
        
        // 벌크 작업 버튼들 (설정이 활성화된 경우)
        if (this.config.enableBulkOperations) {
            this.setupBulkOperationEvents();
        }
    }

    /**
     * 펼치기/접기 이벤트 설정
     */
    setupExpandCollapseEvents() {
        // 모두 펼치기 버튼
        const expandAllBtn = document.getElementById('expandAllBtn');
        if (expandAllBtn) {
            const handleExpandAll = () => {
                this.treeManager.expandAllNodes();
            };
            
            expandAllBtn.addEventListener('click', handleExpandAll);
            this.cleanupFunctions.push(() => {
                expandAllBtn.removeEventListener('click', handleExpandAll);
            });
        }

        // 모두 접기 버튼
        const collapseAllBtn = document.getElementById('collapseAllBtn');
        if (collapseAllBtn) {
            const handleCollapseAll = () => {
                this.treeManager.collapseAllNodes();
            };
            
            collapseAllBtn.addEventListener('click', handleCollapseAll);
            this.cleanupFunctions.push(() => {
                collapseAllBtn.removeEventListener('click', handleCollapseAll);
            });
        }

        // 단계별 펼침 드롭다운
        const expandLevelSelect = document.getElementById('expandLevel');
        if (expandLevelSelect) {
            const handleExpandLevel = (e) => {
                const level = e.target.value;
                if (level === 'all') {
                    this.treeManager.expandAllNodes();
                } else if (level === '0') {
                    this.treeManager.collapseAllNodes();
                } else {
                    this.treeManager.expandToLevel(parseInt(level));
                }
            };
            
            expandLevelSelect.addEventListener('change', handleExpandLevel);
            this.cleanupFunctions.push(() => {
                expandLevelSelect.removeEventListener('change', handleExpandLevel);
            });
        }
    }

    /**
     * 레벨 제한 이벤트 설정
     */
    setupLevelLimitEvents() {
        const levelLimitSelect = document.getElementById('levelLimit');
        if (levelLimitSelect) {
            const handleLevelLimit = (e) => {
                this.treeManager.setLevelLimit(e.target.value);
            };
            
            levelLimitSelect.addEventListener('change', handleLevelLimit);
            this.cleanupFunctions.push(() => {
                levelLimitSelect.removeEventListener('change', handleLevelLimit);
            });
        }
    }

    /**
     * 최상위 항목 추가 이벤트 설정
     */
    setupAddRootItemEvent() {
        const addRootItemBtn = document.getElementById('addRootItemBtn');
        if (addRootItemBtn) {
            const handleAddRootItem = () => {
                this.itemManager.addCategoryItem(null);
            };
            
            addRootItemBtn.addEventListener('click', handleAddRootItem);
            this.cleanupFunctions.push(() => {
                addRootItemBtn.removeEventListener('click', handleAddRootItem);
            });
        }
    }

    /**
     * 벌크 작업 이벤트 설정
     */
    setupBulkOperationEvents() {
        // 초기화 버튼
        const resetBtn = document.getElementById('resetCategoriesBtn');
        if (resetBtn) {
            const handleReset = () => {
                this.resetAllCategories();
            };
            
            resetBtn.addEventListener('click', handleReset);
            this.cleanupFunctions.push(() => {
                resetBtn.removeEventListener('click', handleReset);
            });
        }

        // 내보내기 버튼
        const exportBtn = document.getElementById('exportCategoriesBtn');
        if (exportBtn) {
            const handleExport = () => {
                this.exportCategories();
            };
            
            exportBtn.addEventListener('click', handleExport);
            this.cleanupFunctions.push(() => {
                exportBtn.removeEventListener('click', handleExport);
            });
        }

        // 가져오기 버튼
        const importBtn = document.getElementById('importCategoriesBtn');
        if (importBtn) {
            const handleImport = () => {
                this.showImportModal();
            };
            
            importBtn.addEventListener('click', handleImport);
            this.cleanupFunctions.push(() => {
                importBtn.removeEventListener('click', handleImport);
            });
        }
    }

    /**
     * 카테고리 데이터 내보내기
     * @returns {Object} 내보내기 데이터
     */
    exportCategories() {
        try {
            const exportData = {
                categories: this.treeManager.categoryData,
                config: this.config,
                exportedAt: new Date().toISOString(),
                version: '1.0'
            };

            // JSON 파일로 다운로드
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `categories_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log('카테고리 데이터 내보내기 완료');
            return exportData;
        } catch (error) {
            console.error('카테고리 내보내기 오류:', error);
            throw error;
        }
    }

    /**
     * 카테고리 데이터 가져오기
     * @param {Object} importData - 가져올 데이터
     */
    importCategories(importData) {
        try {
            if (this.validateImportData(importData)) {
                this.treeManager.categoryData = importData.categories;
                this.treeManager.updateMaxId();
                this.treeManager.saveCategoryData();
                this.treeManager.render();

                console.log('카테고리 데이터 가져오기 완료');
            } else {
                throw new Error('유효하지 않은 카테고리 데이터입니다.');
            }
        } catch (error) {
            console.error('카테고리 가져오기 오류:', error);
            throw error;
        }
    }

    /**
     * 가져오기 데이터 유효성 검사
     * @param {Object} data - 검사할 데이터
     * @returns {boolean} 유효성 여부
     */
    validateImportData(data) {
        if (!data || typeof data !== 'object') return false;
        if (!Array.isArray(data.categories)) return false;
        
        // 카테고리 구조 검사
        const validateCategory = (category) => {
            if (!category.id || !category.name) return false;
            if (category.children && !Array.isArray(category.children)) return false;
            if (category.children) {
                return category.children.every(validateCategory);
            }
            return true;
        };

        return data.categories.every(validateCategory);
    }

    /**
     * 모든 카테고리 초기화
     */
    resetAllCategories() {
        if (typeof UIUtils !== 'undefined' && UIUtils.showConfirm) {
            UIUtils.showConfirm('모든 카테고리를 삭제하고 초기화하시겠습니까?', (confirmed) => {
                if (confirmed) {
                    this.performReset();
                }
            });
        } else if (confirm('모든 카테고리를 삭제하고 초기화하시겠습니까?')) {
            this.performReset();
        }
    }

    /**
     * 초기화 실행
     */
    performReset() {
        try {
            this.treeManager.categoryData = [];
            this.treeManager.saveCategoryData();
            this.treeManager.render();

            // 프리셋 선택 초기화
            const presetSelect = document.getElementById('presetSelect');
            if (presetSelect) {
                presetSelect.value = '';
            }

            console.log('카테고리 초기화 완료');
        } catch (error) {
            console.error('카테고리 초기화 오류:', error);
            throw error;
        }
    }

    /**
     * 가져오기 모달 표시
     */
    showImportModal() {
        const modalHtml = `
            <div class="modal fade" id="importCategoriesModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">카테고리 데이터 가져오기</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label for="importFile" class="form-label">JSON 파일 선택</label>
                                <input type="file" class="form-control" id="importFile" accept=".json">
                                <div class="form-text">내보내기로 생성된 JSON 파일을 선택하세요.</div>
                            </div>
                            <div class="alert alert-warning">
                                <i class="fas fa-exclamation-triangle me-2"></i>
                                기존 카테고리 데이터가 모두 교체됩니다.
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">취소</button>
                            <button type="button" class="btn btn-primary" id="confirmImport">가져오기</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 기존 모달 제거
        const existingModal = document.getElementById('importCategoriesModal');
        if (existingModal) {
            existingModal.remove();
        }

        // 새 모달 추가
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modalElement = document.getElementById('importCategoriesModal');

        // 가져오기 버튼 이벤트
        document.getElementById('confirmImport').addEventListener('click', () => {
            this.processImportFile();
        });

        // 모달 표시
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }

    /**
     * 가져오기 파일 처리
     */
    processImportFile() {
        const fileInput = document.getElementById('importFile');
        const file = fileInput.files[0];

        if (!file) {
            alert('파일을 선택해주세요.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);
                this.importCategories(importData);
                
                // 모달 닫기
                bootstrap.Modal.getInstance(document.getElementById('importCategoriesModal')).hide();
                
                alert('카테고리 데이터를 성공적으로 가져왔습니다.');
            } catch (error) {
                console.error('파일 처리 오류:', error);
                alert('파일 형식이 올바르지 않습니다.');
            }
        };
        reader.readAsText(file);
    }

    /**
     * 초기화 오류 처리
     * @param {Error} error - 발생한 오류
     */
    handleInitializationError(error) {
        const errorContainer = document.getElementById('categoriesSettingsError');
        if (errorContainer) {
            errorContainer.innerHTML = `
                <div class="alert alert-danger">
                    <h6>카테고리 설정 초기화 오류</h6>
                    <p>카테고리 설정 모듈을 초기화하는 중 오류가 발생했습니다.</p>
                    <details>
                        <summary>오류 상세</summary>
                        <pre>${error.message}</pre>
                    </details>
                </div>
            `;
        }
    }

    /**
     * 현재 카테고리 데이터 반환
     * @returns {Array} 카테고리 데이터
     */
    getCurrentCategories() {
        return this.treeManager ? this.treeManager.categoryData : [];
    }

    /**
     * 설정 정보 반환
     * @returns {Object} 설정 정보
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * 트리 매니저 반환
     * @returns {CategoryTreeManager|null} 트리 매니저
     */
    getTreeManager() {
        return this.treeManager;
    }

    /**
     * 아이템 매니저 반환
     * @returns {CategoryItemManager|null} 아이템 매니저
     */
    getItemManager() {
        return this.itemManager;
    }

    /**
     * 프리셋 매니저 반환
     * @returns {CategoryPresetManager|null} 프리셋 매니저
     */
    getPresetManager() {
        return this.presetManager;
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
        if (this.treeManager && typeof this.treeManager.cleanup === 'function') {
            this.treeManager.cleanup();
        }
        if (this.itemManager && typeof this.itemManager.cleanup === 'function') {
            this.itemManager.cleanup();
        }
        if (this.presetManager && typeof this.presetManager.cleanup === 'function') {
            this.presetManager.cleanup();
        }

        this.treeManager = null;
        this.itemManager = null;
        this.presetManager = null;
    }
}

// 전역 인스턴스 생성 및 내보내기
const categoriesSettingsManager = new CategoriesSettingsManager();

export default categoriesSettingsManager;