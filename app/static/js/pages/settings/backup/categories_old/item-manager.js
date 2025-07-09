/**
 * 카테고리 아이템 관리 모듈
 */
export class ItemManager {
    constructor() {
        this.currentItem = null;
        this.eventTarget = new EventTarget();
    }

    async init() {
        return true;
    }

    selectItem(item) {
        this.currentItem = item;
        this.emit('itemSelected', { item });
    }

    addItem(item, parent) {
        this.emit('itemAdded', { item, parent });
    }

    deleteItem(item) {
        if (this.currentItem === item) {
            this.currentItem = null;
        }
        this.emit('itemDeleted', { item });
    }

    updateItem(item, data) {
        this.emit('itemUpdated', { item, data });
    }

    getCurrentItem() {
        return this.currentItem;
    }

    clear() {
        this.currentItem = null;
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
    }
} 