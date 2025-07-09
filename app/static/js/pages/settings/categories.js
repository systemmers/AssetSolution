/**
 * 카테고리 관리 시스템 - 단순화된 버전
 * category_test.html 기반으로 백엔드 API와 연동
 */

class CategoryManager {
    constructor() {
        this.tree = null;
        this.maxLevel = 10;
        this.currentLevelLimit = 'unlimited';
        this.presets = null;
        this.treeData = {};
        
        console.log('[CategoryManager] 초기화 시작');
        this.init();
    }

    /**
     * 초기화
     */
    async init() {
        try {
            // DOM 요소 확인
            this.tree = document.getElementById('categoryTree');
            if (!this.tree) {
                console.error('[CategoryManager] 카테고리 트리 컨테이너를 찾을 수 없습니다');
                return;
            }

            // 이벤트 리스너 등록
            this.initializeEventListeners();
            
            // 프리셋 로드
            await this.loadPresets();
            
            // 초기 데이터 로드
            await this.loadInitialData();
            
            console.log('[CategoryManager] 초기화 완료');
            
        } catch (error) {
            console.error('[CategoryManager] 초기화 실패:', error);
            this.showError('카테고리 시스템 초기화에 실패했습니다.');
        }
    }

    /**
     * 이벤트 리스너 초기화
     */
    initializeEventListeners() {
        // 단계 제한 변경 이벤트
        const levelLimit = document.getElementById('levelLimit');
        if (levelLimit) {
            levelLimit.addEventListener('change', (e) => {
                this.currentLevelLimit = e.target.value;
                this.updateLevelIndicators();
            });
        }
        
        // 프리셋 선택 이벤트
        const presetSelect = document.getElementById('presetSelect');
        if (presetSelect) {
            presetSelect.addEventListener('change', (e) => {
                if (e.target.value && this.presets) {
                    this.loadPreset(e.target.value);
                }
            });
        }
        
        // 버튼 이벤트들
        const expandAllBtn = document.getElementById('expandAll');
        if (expandAllBtn) {
            expandAllBtn.addEventListener('click', () => this.expandAll());
        }

        const collapseAllBtn = document.getElementById('collapseAll');
        if (collapseAllBtn) {
            collapseAllBtn.addEventListener('click', () => this.collapseAll());
        }

        const addRootBtn = document.getElementById('addRootItem');
        if (addRootBtn) {
            addRootBtn.addEventListener('click', () => this.addItem(null));
        }

        // 프리셋 저장 버튼
        const savePresetBtn = document.getElementById('savePresetBtn');
        if (savePresetBtn) {
            savePresetBtn.addEventListener('click', () => this.showSavePresetModal());
        }

        // 초기화 버튼
        const resetPresetBtn = document.getElementById('resetPresetBtn');
        if (resetPresetBtn) {
            resetPresetBtn.addEventListener('click', () => this.resetTree());
        }

        // 단계별 펼침
        const expandLevel = document.getElementById('expandLevel');
        if (expandLevel) {
            expandLevel.addEventListener('change', (e) => this.expandToLevel(e.target.value));
        }

        console.log('[CategoryManager] 이벤트 리스너 설정 완료');
    }

    /**
     * 저장된 카테고리 데이터 로드
     */
    async loadSavedCategories() {
        try {
            const response = await fetch('/settings/categories/load');
            const data = await response.json();
            
            if (data.success && data.data && data.data.categories) {
                this.treeData = data.data.categories;
                this.renderTree();
                console.log('[CategoryManager] 저장된 카테고리 로드 완료');
            } else {
                console.log('[CategoryManager] 저장된 카테고리 없음, 빈 트리로 시작');
                this.renderTree();
            }
        } catch (error) {
            console.warn('[CategoryManager] 카테고리 로드 실패:', error);
            this.renderTree();
        }
    }

    /**
     * 프리셋 데이터 로드
     */
    async loadPresets() {
        try {
            // 서버에서 프리셋 목록 로드
            const response = await fetch('/settings/presets/list?type=category');
            const data = await response.json();
            
            if (data.success && data.data) {
                this.presets = data.data;
                this.updatePresetSelect();
            }
        } catch (error) {
            console.warn('[CategoryManager] 프리셋 로드 실패:', error);
        }
    }

    /**
     * 프리셋 선택 옵션 업데이트
     */
    updatePresetSelect() {
        const presetSelect = document.getElementById('presetSelect');
        if (!presetSelect || !this.presets) return;

        // 기존 옵션 제거 (기본 옵션 제외)
        const defaultOption = presetSelect.querySelector('option[value=""]');
        presetSelect.innerHTML = '';
        if (defaultOption) {
            presetSelect.appendChild(defaultOption);
        } else {
            presetSelect.innerHTML = '<option value="">프리셋 선택</option>';
        }

        // 프리셋 옵션 추가
        this.presets.forEach(preset => {
            const option = document.createElement('option');
            option.value = preset.id;
            option.textContent = `${preset.name} - ${preset.description || ''}`;
            presetSelect.appendChild(option);
        });
    }

    /**
     * 프리셋 로드
     */
    async loadPreset(presetId) {
        try {
            const response = await fetch(`/settings/presets/${presetId}`);
            const data = await response.json();

            if (data.success && data.data && data.data.settings) {
                const preset = data.data;
                
                // 트리 초기화
                this.tree.innerHTML = '';
                
                // 프리셋의 카테고리 구조 생성
                if (preset.settings.categories) {
                    this.treeData = preset.settings.categories;
                    this.renderTree();
                    
                    // 전체 펼침으로 설정
                    const expandLevel = document.getElementById('expandLevel');
                    if (expandLevel) {
                        expandLevel.value = 'all';
                        this.expandAll();
                    }
                    
                    console.log(`[CategoryManager] 프리셋 "${preset.name}" 로드 완료`);
                }
            }
        } catch (error) {
            console.error('[CategoryManager] 프리셋 로드 실패:', error);
            alert('프리셋 로드에 실패했습니다: ' + error.message);
        }
    }

    /**
     * 트리 렌더링
     */
    renderTree() {
        if (!this.tree) return;
        
        this.tree.innerHTML = '';
        
        if (Object.keys(this.treeData).length === 0) {
            this.tree.innerHTML = '<div class="text-muted text-center p-4">카테고리가 없습니다. 새 카테고리를 추가해보세요.</div>';
            return;
        }
        
        this.renderTreeLevel(this.treeData, this.tree, 0);
    }

    /**
     * 트리 레벨 렌더링
     */
    renderTreeLevel(data, container, level) {
        for (const [name, children] of Object.entries(data)) {
            const item = this.createTreeItem(name, level);
            container.appendChild(item);
            
            if (children && typeof children === 'object' && !Array.isArray(children)) {
                const childContainer = item.querySelector('.tree-children');
                this.renderTreeLevel(children, childContainer, level + 1);
            } else if (Array.isArray(children)) {
                const childContainer = item.querySelector('.tree-children');
                children.forEach(childName => {
                    const childItem = this.createTreeItem(childName, level + 1);
                    childContainer.appendChild(childItem);
                });
            }
        }
    }

    /**
     * 트리 아이템 생성
     */
    createTreeItem(name, level) {
        const item = document.createElement('div');
        item.className = 'tree-item';
        item.dataset.level = level;
        
        const content = document.createElement('div');
        content.className = 'tree-item-content d-flex align-items-center p-2';
        
        // 들여쓰기
        content.style.paddingLeft = `${level * 20 + 10}px`;
        
        // 확장/축소 아이콘
        const icon = document.createElement('i');
        icon.className = 'bi bi-chevron-right me-2';
        content.appendChild(icon);
        
        // 카테고리 이름
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'form-control form-control-sm d-inline-block';
        nameInput.style.width = 'auto';
        nameInput.value = name;
        nameInput.placeholder = '카테고리 이름';
        content.appendChild(nameInput);
        
        // 액션 버튼들
        const actions = document.createElement('div');
        actions.className = 'item-actions ms-auto';
        actions.style.opacity = '0';
        
        const addBtn = document.createElement('button');
        addBtn.className = 'btn btn-sm btn-outline-success me-1';
        addBtn.innerHTML = '<i class="bi bi-plus"></i>';
        addBtn.onclick = (e) => {
            e.stopPropagation();
            if (level < this.maxLevel - 1) {
                this.addItem(item);
            } else {
                alert('최대 10단계까지만 추가할 수 있습니다.');
            }
        };
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-outline-danger';
        deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            this.deleteItem(item);
        };
        
        actions.appendChild(addBtn);
        actions.appendChild(deleteBtn);
        content.appendChild(actions);
        
        // 호버 효과
        content.onmouseenter = () => actions.style.opacity = '1';
        content.onmouseleave = () => actions.style.opacity = '0';
        
        // 하위 컨테이너
        const children = document.createElement('div');
        children.className = 'tree-children';
        children.style.display = 'none';
        
        item.appendChild(content);
        item.appendChild(children);
        
        // 클릭 이벤트
        content.onclick = (e) => {
            if (!e.target.closest('.item-actions') && !e.target.closest('input')) {
                this.toggleItem(item);
            }
        };
        
        // 입력 변경 이벤트
        nameInput.onchange = () => this.updateTreeData();
        
        return item;
    }

    /**
     * 아이템 펼치기/접기
     */
    toggleItem(item) {
        const children = item.querySelector('.tree-children');
        const icon = item.querySelector('.bi-chevron-right, .bi-chevron-down');
        
        if (children && children.children.length > 0) {
            if (children.style.display === 'none') {
                children.style.display = 'block';
                icon.className = 'bi bi-chevron-down me-2';
            } else {
                children.style.display = 'none';
                icon.className = 'bi bi-chevron-right me-2';
            }
        }
    }

    /**
     * 아이템 추가
     */
    addItem(parentItem) {
        const level = parentItem ? parseInt(parentItem.dataset.level) + 1 : 0;
        
        // 단계 제한 체크
        if (this.currentLevelLimit !== 'unlimited' && 
            level >= parseInt(this.currentLevelLimit)) {
            alert(`현재 ${this.currentLevelLimit}단계까지만 추가할 수 있습니다.`);
            return;
        }

        const newItem = this.createTreeItem('새 카테고리', level);
        
        if (parentItem) {
            const children = parentItem.querySelector('.tree-children');
            children.appendChild(newItem);
            children.style.display = 'block';
            
            const icon = parentItem.querySelector('.bi-chevron-right');
            if (icon) {
                icon.className = 'bi bi-chevron-down me-2';
            }
        } else {
            // 빈 상태 메시지 제거
            if (this.tree.querySelector('.text-muted')) {
                this.tree.innerHTML = '';
            }
            this.tree.appendChild(newItem);
        }

        // 입력 필드에 포커스
        const input = newItem.querySelector('input');
        input.focus();
        input.select();
        
        this.updateTreeData();
    }

    /**
     * 아이템 삭제
     */
    deleteItem(item) {
        if (confirm('이 카테고리와 모든 하위 카테고리를 삭제하시겠습니까?')) {
            item.remove();
            this.updateTreeData();
            
            // 트리가 비어있으면 안내 메시지 표시
            if (this.tree.children.length === 0) {
                this.tree.innerHTML = '<div class="text-muted text-center p-4">카테고리가 없습니다. 새 카테고리를 추가해보세요.</div>';
            }
        }
    }

    /**
     * 모두 펼치기
     */
    expandAll() {
        const expandLevel = document.getElementById('expandLevel');
        if (expandLevel) expandLevel.value = 'all';
        this.expandToLevel('all');
    }

    /**
     * 모두 접기
     */
    collapseAll() {
        const expandLevel = document.getElementById('expandLevel');
        if (expandLevel) expandLevel.value = '0';
        this.expandToLevel('0');
    }

    /**
     * 특정 레벨까지 펼치기
     */
    expandToLevel(level) {
        const allItems = this.tree.querySelectorAll('.tree-item');
        
        allItems.forEach(item => {
            const itemLevel = parseInt(item.dataset.level);
            const children = item.querySelector('.tree-children');
            const icon = item.querySelector('.bi-chevron-right, .bi-chevron-down');
            
            if (children && children.children.length > 0) {
                if (level === 'all') {
                    // 전체 펼침
                    children.style.display = 'block';
                    if (icon) icon.className = 'bi bi-chevron-down me-2';
                } else if (level === '0') {
                    // 모든 하위 항목 접기
                    children.style.display = 'none';
                    if (icon) icon.className = 'bi bi-chevron-right me-2';
                } else if (itemLevel < parseInt(level)) {
                    // 해당 레벨까지는 펼침
                    children.style.display = 'block';
                    if (icon) icon.className = 'bi bi-chevron-down me-2';
                } else {
                    // 그 이상은 접음
                    children.style.display = 'none';
                    if (icon) icon.className = 'bi bi-chevron-right me-2';
                }
            }
        });
    }

    /**
     * 트리 데이터 업데이트
     */
    updateTreeData() {
        this.treeData = this.extractTreeData();
        this.saveCategories();
    }

    /**
     * 트리 데이터 추출
     */
    extractTreeData() {
        const result = {};
        const rootItems = this.tree.querySelectorAll('.tree-item[data-level="0"]');
        
        rootItems.forEach(item => {
            const input = item.querySelector('input');
            const name = input ? input.value.trim() : '';
            if (name) {
                result[name] = this.extractChildData(item);
            }
        });
        
        return result;
    }

    /**
     * 하위 데이터 추출
     */
    extractChildData(parentItem) {
        const children = parentItem.querySelector('.tree-children');
        if (!children) return [];
        
        const childItems = Array.from(children.children).filter(child => 
            child.classList.contains('tree-item')
        );
        
        if (childItems.length === 0) return [];
        
        const result = {};
        let hasChildren = false;
        
        childItems.forEach(item => {
            const input = item.querySelector('input');
            const name = input ? input.value.trim() : '';
            if (name) {
                const childData = this.extractChildData(item);
                result[name] = childData;
                hasChildren = true;
            }
        });
        
        return hasChildren ? result : [];
    }

    /**
     * 카테고리 저장
     */
    async saveCategories() {
        try {
            const saveData = {
                name: '현재 카테고리 구조',
                structure: this.treeData,
                max_level: this.getMaxLevel(),
                total_items: this.getTotalItems()
            };

            const response = await fetch('/settings/categories/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(saveData)
            });

            const data = await response.json();
            
            if (!data.success) {
                console.warn('[CategoryManager] 카테고리 저장 실패:', data.message);
            }
        } catch (error) {
            console.warn('[CategoryManager] 카테고리 저장 중 오류:', error);
        }
    }

    /**
     * 최대 레벨 계산
     */
    getMaxLevel() {
        const items = this.tree.querySelectorAll('.tree-item');
        let maxLevel = 0;
        items.forEach(item => {
            const level = parseInt(item.dataset.level);
            if (level > maxLevel) maxLevel = level;
        });
        return maxLevel + 1;
    }

    /**
     * 총 아이템 수 계산
     */
    getTotalItems() {
        return this.tree.querySelectorAll('.tree-item').length;
    }

    /**
     * 트리 초기화
     */
    resetTree() {
        if (confirm('현재 카테고리 구조를 모두 초기화하시겠습니까?')) {
            this.tree.innerHTML = '<div class="text-muted text-center p-4">카테고리가 없습니다. 새 카테고리를 추가해보세요.</div>';
            this.treeData = {};
            
            const presetSelect = document.getElementById('presetSelect');
            if (presetSelect) presetSelect.value = '';
            
            const expandLevel = document.getElementById('expandLevel');
            if (expandLevel) expandLevel.value = 'all';
            
            const levelLimit = document.getElementById('levelLimit');
            if (levelLimit) levelLimit.value = 'unlimited';
            
            this.updateTreeData();
        }
    }

    /**
     * 단계 제한 표시 업데이트
     */
    updateLevelIndicators() {
        const items = this.tree.querySelectorAll('.tree-item');
        items.forEach(item => {
            const level = parseInt(item.dataset.level);
            const isLimited = this.currentLevelLimit !== 'unlimited';
            const maxLevel = parseInt(this.currentLevelLimit);
            
            if (isLimited && level >= maxLevel) {
                item.classList.add('level-limited');
            } else {
                item.classList.remove('level-limited');
            }
        });
    }

    /**
     * 프리셋 저장 모달 표시
     */
    showSavePresetModal() {
        if (Object.keys(this.treeData).length === 0) {
            alert('저장할 카테고리가 없습니다.');
            return;
        }

        // 모달이 이미 존재하는지 확인
        let modal = document.getElementById('savePresetModal');
        if (modal) {
            modal.remove();
        }

        // 모달 HTML 생성
        const modalHtml = `
            <div class="modal fade" id="savePresetModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">프리셋 저장</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="form-label">프리셋 이름</label>
                                <input type="text" class="form-control" id="presetName" placeholder="프리셋 이름을 입력하세요">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">설명</label>
                                <textarea class="form-control" id="presetDescription" rows="3" placeholder="프리셋에 대한 설명을 입력하세요"></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">취소</button>
                            <button type="button" class="btn btn-primary" id="confirmSavePreset">저장</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        modal = document.getElementById('savePresetModal');

        // 저장 버튼 이벤트
        document.getElementById('confirmSavePreset').addEventListener('click', () => {
            this.saveCurrentPreset();
        });

        // 모달 표시
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();

        // 포커스
        setTimeout(() => {
            document.getElementById('presetName').focus();
        }, 300);
    }

    /**
     * 현재 프리셋 저장
     */
    async saveCurrentPreset() {
        const name = document.getElementById('presetName').value.trim();
        const description = document.getElementById('presetDescription').value.trim();

        if (!name) {
            alert('프리셋 이름을 입력해주세요.');
            return;
        }

        try {
            const presetData = {
                name: name,
                description: description,
                preset_type: 'category',
                settings: {
                    categories: this.treeData,
                    max_level: this.getMaxLevel(),
                    total_items: this.getTotalItems()
                },
                is_shared: false
            };

            const response = await fetch('/settings/presets/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(presetData)
            });

            const data = await response.json();

            if (data.success) {
                // 프리셋 목록 새로고침
                await this.loadPresets();
                
                // 모달 닫기
                const modal = bootstrap.Modal.getInstance(document.getElementById('savePresetModal'));
                modal.hide();
                
                // 입력 필드 초기화
                document.getElementById('presetName').value = '';
                document.getElementById('presetDescription').value = '';
                
                alert('프리셋이 저장되었습니다.');
            } else {
                throw new Error(data.message || '프리셋 저장 실패');
            }
        } catch (error) {
            console.error('[CategoryManager] 프리셋 저장 중 오류:', error);
            alert('프리셋 저장 중 오류가 발생했습니다: ' + error.message);
        }
    }

    /**
     * 현재 상태 정보 반환
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            totalItems: this.getTotalItems(),
            maxLevel: this.getMaxLevel(),
            hasData: Object.keys(this.treeData).length > 0
        };
    }
}

// 전역 인스턴스
let categoryManagerInstance = null;

/**
 * 카테고리 매니저 인스턴스 가져오기
 */
function getCategoryManager() {
    if (!categoryManagerInstance) {
        categoryManagerInstance = new CategoryManager();
    }
    return categoryManagerInstance;
}

/**
 * 카테고리 매니저 초기화
 */
async function initCategoryManager() {
    const manager = getCategoryManager();
    const success = await manager.init();
    
    if (success && typeof window !== 'undefined') {
        window.categoryManager = manager;
    }
    
    return manager;
}

// 전역 함수로 등록
if (typeof window !== 'undefined') {
    window.getCategoryManager = getCategoryManager;
    window.initCategoryManager = initCategoryManager;
}

// 모듈 내보내기 (ES6 모듈과 CommonJS 호환)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CategoryManager, getCategoryManager, initCategoryManager };
}

// AMD 지원
if (typeof define === 'function' && define.amd) {
    define([], function() {
        return { CategoryManager, getCategoryManager, initCategoryManager };
    });
} 