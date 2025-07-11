/**
 * 카테고리 트리 관리 모듈
 * 트리 구조의 생성, 편집, 저장을 담당
 */

export class TreeManager {
    constructor() {
        this.treeContainer = null;
        this.treeData = {};
        this.maxLevel = 10;
        this.currentLevelLimit = 'unlimited';
        this.eventTarget = new EventTarget();
        
        console.log('[TreeManager] 초기화됨');
    }

    /**
     * 초기화
     */
    async init() {
        try {
            this.treeContainer = document.getElementById('categoryTree');
            if (!this.treeContainer) {
                throw new Error('카테고리 트리 컨테이너를 찾을 수 없습니다');
            }
            
            console.log('[TreeManager] 초기화 완료');
            return true;
        } catch (error) {
            console.error('[TreeManager] 초기화 실패:', error);
            throw error;
        }
    }

    /**
     * 트리 데이터 로드
     */
    async loadTreeData(data) {
        try {
            this.treeData = data || {};
            this.renderTree();
            this.emit('treeLoaded', { data: this.treeData });
        } catch (error) {
            console.error('[TreeManager] 트리 데이터 로드 실패:', error);
            throw error;
        }
    }

    /**
     * 트리 렌더링
     */
    renderTree() {
        if (!this.treeContainer) return;
        
        this.treeContainer.innerHTML = '';
        
        if (Object.keys(this.treeData).length === 0) {
            this.treeContainer.innerHTML = '<div class="text-muted text-center p-4">카테고리가 없습니다. 새 카테고리를 추가해보세요.</div>';
            return;
        }
        
        this.renderTreeLevel(this.treeData, this.treeContainer, 0);
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
        content.className = 'tree-item-content d-flex align-items-center';
        
        // 들여쓰기
        content.style.paddingLeft = `${level * 20}px`;
        
        // 확장/축소 아이콘
        const icon = document.createElement('i');
        icon.className = 'fas fa-chevron-right me-2';
        content.appendChild(icon);
        
        // 카테고리 이름
        const nameSpan = document.createElement('span');
        nameSpan.textContent = name;
        nameSpan.className = 'category-name';
        content.appendChild(nameSpan);
        
        // 액션 버튼들
        const actions = document.createElement('div');
        actions.className = 'item-actions ms-auto';
        actions.style.opacity = '0';
        
        const addBtn = document.createElement('button');
        addBtn.className = 'btn btn-sm btn-outline-success me-1';
        addBtn.innerHTML = '<i class="fas fa-plus"></i>';
        addBtn.onclick = (e) => {
            e.stopPropagation();
            this.addChildItem(item);
        };
        
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-sm btn-outline-primary me-1';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.onclick = (e) => {
            e.stopPropagation();
            this.editItem(item);
        };
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-outline-danger';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            this.deleteItem(item);
        };
        
        actions.appendChild(addBtn);
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        content.appendChild(actions);
        
        // 호버 효과
        content.onmouseenter = () => actions.style.opacity = '1';
        content.onmouseleave = () => actions.style.opacity = '0';
        
        // 하위 컨테이너
        const children = document.createElement('div');
        children.className = 'tree-children';
        children.style.display = 'none';
        children.style.marginLeft = '20px';
        
        item.appendChild(content);
        item.appendChild(children);
        
        // 클릭 이벤트
        content.onclick = () => this.toggleItem(item);
        
        return item;
    }

    /**
     * 아이템 펼치기/접기
     */
    toggleItem(item) {
        const children = item.querySelector('.tree-children');
        const icon = item.querySelector('.fas');
        
        if (children.style.display === 'none') {
            children.style.display = 'block';
            icon.className = 'fas fa-chevron-down me-2';
        } else {
            children.style.display = 'none';
            icon.className = 'fas fa-chevron-right me-2';
        }
    }

    /**
     * 하위 아이템 추가
     */
    addChildItem(parentItem) {
        const name = prompt('새 하위 카테고리 이름:');
        if (!name) return;
        
        const level = parseInt(parentItem.dataset.level) + 1;
        const newItem = this.createTreeItem(name, level);
        
        const children = parentItem.querySelector('.tree-children');
        children.appendChild(newItem);
        children.style.display = 'block';
        
        const icon = parentItem.querySelector('.fas');
        icon.className = 'fas fa-chevron-down me-2';
        
        this.updateTreeData();
        this.emit('itemAdded', { item: newItem, parent: parentItem });
    }

    /**
     * 아이템 편집
     */
    editItem(item) {
        const nameSpan = item.querySelector('.category-name');
        const currentName = nameSpan.textContent;
        const newName = prompt('카테고리 이름 수정:', currentName);
        
        if (newName && newName !== currentName) {
            nameSpan.textContent = newName;
            this.updateTreeData();
            this.emit('itemUpdated', { item });
        }
    }

    /**
     * 아이템 삭제
     */
    deleteItem(item) {
        if (confirm('이 카테고리와 모든 하위 카테고리를 삭제하시겠습니까?')) {
            item.remove();
            this.updateTreeData();
            this.emit('itemDeleted', { item });
        }
    }

    /**
     * 최상위 아이템 추가
     */
    addRootItem(name) {
        const newItem = this.createTreeItem(name, 0);
        
        // 빈 상태 메시지 제거
        if (this.treeContainer.querySelector('.text-muted')) {
            this.treeContainer.innerHTML = '';
        }
        
        this.treeContainer.appendChild(newItem);
        this.updateTreeData();
        this.emit('itemAdded', { item: newItem, parent: null });
    }

    /**
     * 모두 펼치기
     */
    expandAll() {
        const items = this.treeContainer.querySelectorAll('.tree-item');
        items.forEach(item => {
            const children = item.querySelector('.tree-children');
            const icon = item.querySelector('.fas');
            if (children && children.children.length > 0) {
                children.style.display = 'block';
                icon.className = 'fas fa-chevron-down me-2';
            }
        });
    }

    /**
     * 모두 접기
     */
    collapseAll() {
        const items = this.treeContainer.querySelectorAll('.tree-item');
        items.forEach(item => {
            const children = item.querySelector('.tree-children');
            const icon = item.querySelector('.fas');
            if (children) {
                children.style.display = 'none';
                icon.className = 'fas fa-chevron-right me-2';
            }
        });
    }

    /**
     * 특정 레벨까지 펼치기
     */
    expandToLevel(targetLevel) {
        if (targetLevel === 'all') {
            this.expandAll();
            return;
        }
        
        const level = parseInt(targetLevel);
        const items = this.treeContainer.querySelectorAll('.tree-item');
        
        items.forEach(item => {
            const itemLevel = parseInt(item.dataset.level);
            const children = item.querySelector('.tree-children');
            const icon = item.querySelector('.fas');
            
            if (children && children.children.length > 0) {
                if (itemLevel < level) {
                    children.style.display = 'block';
                    icon.className = 'fas fa-chevron-down me-2';
                } else {
                    children.style.display = 'none';
                    icon.className = 'fas fa-chevron-right me-2';
                }
            }
        });
    }

    // 나머지 메서드들...
    getTreeData() { return this.treeData; }
    getMaxLevel() { 
        const items = this.treeContainer ? this.treeContainer.querySelectorAll('.tree-item') : [];
        let maxLevel = 0;
        items.forEach(item => {
            const level = parseInt(item.dataset.level);
            if (level > maxLevel) maxLevel = level;
        });
        return maxLevel + 1;
    }
    getTotalItems() { return this.treeContainer ? this.treeContainer.querySelectorAll('.tree-item').length : 0; }
    clear() { 
        if (this.treeContainer) this.treeContainer.innerHTML = '';
        this.treeData = {};
    }
    
    updateTreeData() {
        this.treeData = this.extractTreeData();
        this.emit('treeChanged', { data: this.treeData });
    }
    
    extractTreeData() {
        const result = {};
        const rootItems = this.treeContainer.querySelectorAll('.tree-item[data-level="0"]');
        rootItems.forEach(item => {
            const name = item.querySelector('.category-name').textContent;
            result[name] = this.extractChildData(item);
        });
        return result;
    }
    
    extractChildData(parentItem) {
        const children = parentItem.querySelector('.tree-children');
        const childItems = children.querySelectorAll(':scope > .tree-item');
        if (childItems.length === 0) return [];
        
        const result = {};
        childItems.forEach(item => {
            const name = item.querySelector('.category-name').textContent;
            result[name] = this.extractChildData(item);
        });
        return result;
    }
    
    emit(eventName, data) {
        const event = new CustomEvent(eventName, { detail: data });
        this.eventTarget.dispatchEvent(event);
    }
    
    on(eventName, handler) {
        this.eventTarget.addEventListener(eventName, handler);
    }
    
    destroy() {
        this.clear();
        console.log('[TreeManager] 해제됨');
    }
}
