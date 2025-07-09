/**
 * 카테고리 프리셋 관리 모듈
 * 미리 정의된 카테고리 구조의 저장, 로드, 관리를 담당합니다.
 */

import SettingsStorage from '../core/settings-storage.js';
import SettingsAPI from '../core/settings-api.js';
import UIUtils from '../../../common/ui-utils.js';

/**
 * 카테고리 프리셋 매니저 클래스
 */
class CategoryPresetManager {
    constructor(treeManager) {
        this.treeManager = treeManager;
        this.defaultPresets = this.initializeDefaultPresets();
        this.cleanupFunctions = [];
    }

    /**
     * 기본 프리셋 초기화
     * @returns {Array} 기본 프리셋 배열
     */
    initializeDefaultPresets() {
        return [
            {
                id: 'office_equipment',
                name: '사무용품',
                description: '일반적인 사무용품 카테고리 구조',
                categories: [
                    {
                        id: 1001,
                        name: '컴퓨터 장비',
                        code: 'computer',
                        children: [
                            { id: 1002, name: '데스크톱', code: 'computer_desktop', children: [] },
                            { id: 1003, name: '노트북', code: 'computer_laptop', children: [] },
                            { id: 1004, name: '모니터', code: 'computer_monitor', children: [] },
                            { id: 1005, name: '주변기기', code: 'computer_peripheral', children: [] }
                        ]
                    },
                    {
                        id: 1006,
                        name: '사무가구',
                        code: 'furniture',
                        children: [
                            { id: 1007, name: '책상', code: 'furniture_desk', children: [] },
                            { id: 1008, name: '의자', code: 'furniture_chair', children: [] },
                            { id: 1009, name: '캐비닛', code: 'furniture_cabinet', children: [] }
                        ]
                    },
                    {
                        id: 1010,
                        name: '사무용품',
                        code: 'supplies',
                        children: [
                            { id: 1011, name: '문구류', code: 'supplies_stationery', children: [] },
                            { id: 1012, name: '인쇄용품', code: 'supplies_printing', children: [] }
                        ]
                    }
                ]
            },
            {
                id: 'it_equipment',
                name: 'IT 장비',
                description: 'IT 관련 장비 및 시설 카테고리',
                categories: [
                    {
                        id: 2001,
                        name: '서버 장비',
                        code: 'server',
                        children: [
                            { id: 2002, name: '물리서버', code: 'server_physical', children: [] },
                            { id: 2003, name: '스토리지', code: 'server_storage', children: [] },
                            { id: 2004, name: '네트워크 장비', code: 'server_network', children: [] }
                        ]
                    },
                    {
                        id: 2005,
                        name: '소프트웨어',
                        code: 'software',
                        children: [
                            { id: 2006, name: '운영체제', code: 'software_os', children: [] },
                            { id: 2007, name: '업무용 SW', code: 'software_business', children: [] },
                            { id: 2008, name: '보안 SW', code: 'software_security', children: [] }
                        ]
                    }
                ]
            },
            {
                id: 'manufacturing',
                name: '제조업 자산',
                description: '제조업 관련 장비 및 자산 카테고리',
                categories: [
                    {
                        id: 3001,
                        name: '생산 장비',
                        code: 'production',
                        children: [
                            { id: 3002, name: '가공기계', code: 'production_machine', children: [] },
                            { id: 3003, name: '검사장비', code: 'production_inspection', children: [] },
                            { id: 3004, name: '포장장비', code: 'production_packaging', children: [] }
                        ]
                    },
                    {
                        id: 3005,
                        name: '운반 장비',
                        code: 'transport',
                        children: [
                            { id: 3006, name: '지게차', code: 'transport_forklift', children: [] },
                            { id: 3007, name: '컨베이어', code: 'transport_conveyor', children: [] }
                        ]
                    }
                ]
            }
        ];
    }

    /**
     * 초기화
     */
    async initialize() {
        this.setupEventListeners();
        await this.loadPresets();
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 프리셋 선택 이벤트
        const presetSelect = document.getElementById('presetSelect');
        if (presetSelect) {
            const handlePresetChange = () => {
                if (presetSelect.value) {
                    this.loadPreset(presetSelect.value);
                }
            };
            
            presetSelect.addEventListener('change', handlePresetChange);
            this.cleanupFunctions.push(() => {
                presetSelect.removeEventListener('change', handlePresetChange);
            });
        }

        // 프리셋 저장 버튼
        const savePresetBtn = document.getElementById('savePresetBtn');
        if (savePresetBtn) {
            const handleSavePreset = () => {
                this.showSavePresetModal();
            };
            
            savePresetBtn.addEventListener('click', handleSavePreset);
            this.cleanupFunctions.push(() => {
                savePresetBtn.removeEventListener('click', handleSavePreset);
            });
        }

        // 프리셋 삭제 버튼
        const deletePresetBtn = document.getElementById('deletePresetBtn');
        if (deletePresetBtn) {
            const handleDeletePreset = () => {
                this.deleteCurrentPreset();
            };
            
            deletePresetBtn.addEventListener('click', handleDeletePreset);
            this.cleanupFunctions.push(() => {
                deletePresetBtn.removeEventListener('click', handleDeletePreset);
            });
        }

        // 프리셋 초기화 버튼
        const resetPresetBtn = document.getElementById('resetPresetBtn');
        if (resetPresetBtn) {
            const handleResetPreset = () => {
                this.resetToDefault();
            };
            
            resetPresetBtn.addEventListener('click', handleResetPreset);
            this.cleanupFunctions.push(() => {
                resetPresetBtn.removeEventListener('click', handleResetPreset);
            });
        }
    }

    /**
     * 프리셋 목록 로드 및 UI 업데이트
     */
    async loadPresets() {
        const presetSelect = document.getElementById('presetSelect');
        if (!presetSelect) return;

        try {
            // 서버에서 프리셋 목록 조회
            const [sharedPresets, userPresets] = await Promise.all([
                SettingsAPI.getPresets('category', true),   // 공유 프리셋
                SettingsAPI.getPresets('category', false)   // 사용자 프리셋
            ]);

            // 기존 옵션 제거 (기본 옵션 제외)
            const defaultOption = presetSelect.querySelector('option[value=""]');
            presetSelect.innerHTML = '';
            if (defaultOption) {
                presetSelect.appendChild(defaultOption);
            } else {
                presetSelect.innerHTML = '<option value="">프리셋을 선택하세요</option>';
            }

            // 기본/공유 프리셋 추가
            if (sharedPresets.length > 0) {
                const sharedGroup = document.createElement('optgroup');
                sharedGroup.label = '기본 프리셋';
                sharedPresets.forEach(preset => {
                    const option = document.createElement('option');
                    option.value = `shared_${preset.id}`;
                    option.textContent = `${preset.name} - ${preset.description}`;
                    sharedGroup.appendChild(option);
                });
                presetSelect.appendChild(sharedGroup);
            }

            // 사용자 정의 프리셋 추가
            if (userPresets.length > 0) {
                const userGroup = document.createElement('optgroup');
                userGroup.label = '사용자 정의 프리셋';
                userPresets.forEach(preset => {
                    const option = document.createElement('option');
                    option.value = `user_${preset.id}`;
                    option.textContent = `${preset.name} - ${preset.description}`;
                    userGroup.appendChild(option);
                });
                presetSelect.appendChild(userGroup);
            }

            // 로컬 스토리지의 프리셋도 백업으로 추가
            const localPresets = SettingsStorage.getPresets();
            if (localPresets.length > 0) {
                const localGroup = document.createElement('optgroup');
                localGroup.label = '로컬 프리셋';
                localPresets.forEach(preset => {
                    const option = document.createElement('option');
                    option.value = `local_${preset.id}`;
                    option.textContent = `${preset.name} - ${preset.description}`;
                    localGroup.appendChild(option);
                });
                presetSelect.appendChild(localGroup);
            }
        } catch (error) {
            console.error('프리셋 목록 로드 중 오류:', error);
            
            // 서버 연결 실패 시 로컬 프리셋만 로드
            const localPresets = SettingsStorage.getPresets();
            if (localPresets.length > 0) {
                const localGroup = document.createElement('optgroup');
                localGroup.label = '로컬 프리셋';
                localPresets.forEach(preset => {
                    const option = document.createElement('option');
                    option.value = `local_${preset.id}`;
                    option.textContent = `${preset.name} - ${preset.description}`;
                    localGroup.appendChild(option);
                });
                presetSelect.appendChild(localGroup);
            }
        }
    }

    /**
     * 프리셋 로드
     * @param {string} presetId - 프리셋 ID
     */
    async loadPreset(presetId) {
        try {
            let presetData = null;

            if (presetId.startsWith('shared_')) {
                const sharedId = parseInt(presetId.replace('shared_', ''));
                presetData = await SettingsAPI.getPreset(sharedId);
            } else if (presetId.startsWith('user_')) {
                const userId = parseInt(presetId.replace('user_', ''));
                presetData = await SettingsAPI.getPreset(userId);
            } else if (presetId.startsWith('local_')) {
                const localId = presetId.replace('local_', '');
                const localPresets = SettingsStorage.getPresets();
                presetData = localPresets.find(p => p.id === localId);
            } else if (presetId.startsWith('default_')) {
                // 구 버전 호환성
                const defaultId = presetId.replace('default_', '');
                presetData = this.defaultPresets.find(p => p.id === defaultId);
            } else {
                // 직접 ID로 서버에서 로드
                presetData = await SettingsAPI.getPreset(parseInt(presetId));
            }

            if (presetData && presetData.category_structure) {
                // 서버 데이터 구조를 프론트엔드 형식으로 변환
                const categories = this.convertServerCategoryStructure(presetData.category_structure.categories);
                
                // 확장 상태 초기화
                this.initializeExpandedState(categories);
                
                // 카테고리 데이터 업데이트
                this.treeManager.categoryData = categories;
                this.treeManager.updateMaxId();
                this.treeManager.saveCategoryData();
                this.treeManager.render();

                // 프리셋 적용 기록 (서버 프리셋인 경우)
                if (presetData.id && !presetId.startsWith('local_')) {
                    try {
                        await SettingsAPI.applyPreset(presetData.id);
                    } catch (error) {
                        console.warn('프리셋 적용 기록 실패:', error);
                    }
                }

                UIUtils.showAlert(`'${presetData.name}' 프리셋이 로드되었습니다.`, 'success');
            } else if (presetData && presetData.categories) {
                // 구 버전 로컬 프리셋 지원
                this.initializeExpandedState(presetData.categories);
                this.treeManager.categoryData = presetData.categories;
                this.treeManager.updateMaxId();
                this.treeManager.saveCategoryData();
                this.treeManager.render();

                UIUtils.showAlert(`'${presetData.name}' 프리셋이 로드되었습니다.`, 'success');
            } else {
                UIUtils.showAlert('프리셋 데이터를 찾을 수 없습니다.', 'error');
            }
        } catch (error) {
            console.error('프리셋 로드 오류:', error);
            UIUtils.showAlert('프리셋 로드 중 오류가 발생했습니다.', 'error');
        }
    }

    /**
     * 서버 카테고리 구조를 프론트엔드 형식으로 변환
     * @param {Array} serverCategories - 서버 카테고리 구조
     * @returns {Array} 프론트엔드 카테고리 구조
     */
    convertServerCategoryStructure(serverCategories) {
        const convertCategory = (category) => {
            const converted = {
                id: category.id,
                name: category.name,
                code: category.code || category.name.toUpperCase().replace(/\s+/g, '_'),
                level: category.level,
                expanded: false,
                children: []
            };

            if (category.children && Array.isArray(category.children)) {
                converted.children = category.children.map(convertCategory);
            }

            return converted;
        };

        return serverCategories.map(convertCategory);
    }

    /**
     * 프리셋 저장 모달 표시
     */
    showSavePresetModal() {
        if (this.treeManager.categoryData.length === 0) {
            UIUtils.showAlert('저장할 카테고리 데이터가 없습니다.', 'warning');
            return;
        }

        const modalHtml = `
            <div class="modal fade" id="savePresetModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">프리셋 저장</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="savePresetForm">
                                <div class="mb-3">
                                    <label for="presetName" class="form-label">프리셋 이름 <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="presetName" required 
                                           placeholder="프리셋 이름을 입력하세요">
                                </div>
                                <div class="mb-3">
                                    <label for="presetDescription" class="form-label">설명</label>
                                    <textarea class="form-control" id="presetDescription" rows="3" 
                                              placeholder="프리셋에 대한 설명을 입력하세요"></textarea>
                                </div>
                                <div class="mb-3">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="sharePreset">
                                        <label class="form-check-label" for="sharePreset">
                                            다른 사용자와 공유
                                        </label>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">취소</button>
                            <button type="button" class="btn btn-primary" id="confirmSavePreset">저장</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 기존 모달 제거
        const existingModal = document.getElementById('savePresetModal');
        if (existingModal) {
            existingModal.remove();
        }

        // 새 모달 추가
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modalElement = document.getElementById('savePresetModal');

        // 저장 버튼 이벤트
        document.getElementById('confirmSavePreset').addEventListener('click', () => {
            this.savePreset();
        });

        // 모달 표시
        const modal = new bootstrap.Modal(modalElement);
        modal.show();

        // 포커스
        setTimeout(() => {
            document.getElementById('presetName').focus();
        }, 300);
    }

    /**
     * 프리셋 저장
     */
    async savePreset() {
        const form = document.getElementById('savePresetForm');
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        try {
            const name = document.getElementById('presetName').value.trim();
            const description = document.getElementById('presetDescription').value.trim();
            const isShared = document.getElementById('sharePreset').checked;

            // 서버 형식으로 카테고리 구조 변환
            const categoryStructure = this.convertToServerCategoryStructure(this.treeManager.categoryData);

            const presetData = {
                name: name,
                description: description,
                preset_type: 'category',
                category_structure: {
                    max_levels: this.getMaxLevel(this.treeManager.categoryData),
                    categories: categoryStructure
                },
                is_shared: isShared
            };

            // 서버에 저장
            const response = await SettingsAPI.createPreset(presetData);

            // 로컬 백업 저장
            const localPresetData = {
                name: name,
                description: description,
                categories: JSON.parse(JSON.stringify(this.treeManager.categoryData)), // 깊은 복사
                shared: isShared,
                createdAt: new Date().toISOString()
            };
            SettingsStorage.addPreset(localPresetData);

            // UI 업데이트
            await this.loadPresets();
            
            // 모달 닫기
            bootstrap.Modal.getInstance(document.getElementById('savePresetModal')).hide();
            
            UIUtils.showAlert('프리셋이 저장되었습니다.', 'success');
        } catch (error) {
            console.error('프리셋 저장 오류:', error);
            
            // 서버 저장 실패 시 로컬만 저장
            try {
                const localPresetData = {
                    name: document.getElementById('presetName').value.trim(),
                    description: document.getElementById('presetDescription').value.trim(),
                    categories: JSON.parse(JSON.stringify(this.treeManager.categoryData)),
                    shared: false,
                    createdAt: new Date().toISOString()
                };
                SettingsStorage.addPreset(localPresetData);
                
                bootstrap.Modal.getInstance(document.getElementById('savePresetModal')).hide();
                UIUtils.showAlert('서버 연결 실패로 로컬에만 저장되었습니다.', 'warning');
            } catch (localError) {
                UIUtils.showAlert('프리셋 저장 중 오류가 발생했습니다.', 'error');
            }
        }
    }

    /**
     * 프론트엔드 카테고리 구조를 서버 형식으로 변환
     * @param {Array} categories - 프론트엔드 카테고리 구조
     * @returns {Array} 서버 카테고리 구조
     */
    convertToServerCategoryStructure(categories) {
        const convertCategory = (category) => {
            const converted = {
                id: category.id,
                name: category.name,
                code: category.code || category.name.toUpperCase().replace(/\s+/g, '_'),
                level: category.level,
                children: []
            };

            if (category.children && Array.isArray(category.children)) {
                converted.children = category.children.map(convertCategory);
            }

            return converted;
        };

        return categories.map(convertCategory);
    }

    /**
     * 카테고리 구조의 최대 레벨 계산
     * @param {Array} categories - 카테고리 배열
     * @returns {number} 최대 레벨
     */
    getMaxLevel(categories) {
        let maxLevel = 0;
        
        const findMaxLevel = (cats, currentLevel = 1) => {
            maxLevel = Math.max(maxLevel, currentLevel);
            cats.forEach(cat => {
                if (cat.children && cat.children.length > 0) {
                    findMaxLevel(cat.children, currentLevel + 1);
                }
            });
        };

        findMaxLevel(categories);
        return maxLevel;
    }

    /**
     * 현재 선택된 프리셋 삭제
     */
    deleteCurrentPreset() {
        const presetSelect = document.getElementById('presetSelect');
        const selectedValue = presetSelect.value;

        if (!selectedValue) {
            UIUtils.showAlert('삭제할 프리셋을 선택해주세요.', 'warning');
            return;
        }

        if (selectedValue.startsWith('default_')) {
            UIUtils.showAlert('기본 프리셋은 삭제할 수 없습니다.', 'warning');
            return;
        }

        const selectedOption = presetSelect.selectedOptions[0];
        const presetName = selectedOption.textContent.split(' - ')[0];

        UIUtils.showConfirm(`'${presetName}' 프리셋을 삭제하시겠습니까?`, (confirmed) => {
            if (confirmed) {
                try {
                    if (selectedValue.startsWith('user_')) {
                        const userId = selectedValue.replace('user_', '');
                        SettingsStorage.removePreset(userId);
                    }

                    // UI 업데이트
                    this.loadPresets();
                    presetSelect.value = '';

                    UIUtils.showAlert('프리셋이 삭제되었습니다.', 'success');
                } catch (error) {
                    console.error('프리셋 삭제 오류:', error);
                    UIUtils.showAlert('프리셋 삭제 중 오류가 발생했습니다.', 'error');
                }
            }
        });
    }

    /**
     * 기본값으로 초기화
     */
    resetToDefault() {
        UIUtils.showConfirm('현재 카테고리 구조를 모두 삭제하고 초기화하시겠습니까?', (confirmed) => {
            if (confirmed) {
                this.treeManager.categoryData = [];
                this.treeManager.saveCategoryData();
                this.treeManager.render();

                // 프리셋 선택 초기화
                const presetSelect = document.getElementById('presetSelect');
                if (presetSelect) {
                    presetSelect.value = '';
                }

                UIUtils.showAlert('카테고리 구조가 초기화되었습니다.', 'success');
            }
        });
    }

    /**
     * 카테고리 확장 상태 초기화
     * @param {Array} categories - 카테고리 배열
     */
    initializeExpandedState(categories) {
        categories.forEach(category => {
            category.expanded = false;
            if (category.children && category.children.length > 0) {
                this.initializeExpandedState(category.children);
            }
        });
    }

    /**
     * 프리셋 데이터 유효성 검사
     * @param {Object} presetData - 검사할 프리셋 데이터
     * @returns {boolean} 유효성 여부
     */
    validatePresetData(presetData) {
        if (!presetData || typeof presetData !== 'object') return false;
        if (!presetData.name || !presetData.categories) return false;
        if (!Array.isArray(presetData.categories)) return false;
        
        return true;
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

export default CategoryPresetManager; 