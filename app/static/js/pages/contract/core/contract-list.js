/**
 * 계약 목록 관리 모듈
 * 계약 목록 페이지의 테이블, 필터, 검색 기능 제공
 * 
 * @class ContractList
 * @description 계약 목록 관련 기능 관리
 * 
 * 주요 기능:
 * - 테이블 정렬 및 행 클릭
 * - 필터 및 검색 기능
 * - 페이지네이션 관리
 * - 벌크 액션 처리
 */

import TableUtils from '../../../common/table-utils.js';
import UIUtils from '../../../common/ui-utils.js';
import FormUtils from '../../../common/form-utils.js';
import ContractCore from './contract-core.js';

class ContractList {
    /**
     * ContractList 클래스 생성자
     * @param {Object} config 설정 옵션
     */
    constructor(config = {}) {
        this.config = {
            tableSelector: '.table',
            searchFormSelector: '#searchForm',
            filterSelectors: 'select, input[type="date"]',
            resetButtonSelector: '.btn-reset',
            bulkActionSelector: '.bulk-action',
            detailUrlTemplate: '/contract/{id}',
            refreshInterval: null, // 자동 새로고침 간격 (ms)
            ...config
        };
        
        this.contractCore = new ContractCore();
        this.table = null;
        this.searchForm = null;
        this.cleanupFunctions = [];
        this.refreshTimer = null;
        
        this.initialize();
    }
    
    /**
     * ContractList 초기화
     */
    initialize() {
        // 테이블 초기화
        const tableCleanup = this._setupTable();
        if (tableCleanup) this.cleanupFunctions.push(tableCleanup);
        
        // 검색 및 필터 초기화
        const filterCleanup = this._setupFilters();
        if (filterCleanup) this.cleanupFunctions.push(filterCleanup);
        
        // 벌크 액션 초기화
        const bulkCleanup = this._setupBulkActions();
        if (bulkCleanup) this.cleanupFunctions.push(bulkCleanup);
        
        // 자동 새로고침 설정
        if (this.config.refreshInterval) {
            this._setupAutoRefresh();
        }
        
        console.log('ContractList 초기화됨');
    }
    
    /**
     * 테이블 설정
     * @returns {Function} 정리 함수
     */
    _setupTable() {
        this.table = document.querySelector(this.config.tableSelector);
        if (!this.table) {
            console.warn('계약 테이블을 찾을 수 없습니다:', this.config.tableSelector);
            return null;
        }
        
        // 테이블 행 클릭 이벤트
        const tableClickCleanup = TableUtils.initTableRowClick({
            tableSelector: this.config.tableSelector,
            rowSelector: 'tbody tr',
            ignoreTags: ['button', 'a', 'input', 'select'],
            dataAttribute: 'href',
            onRowClick: (url) => {
                if (url) {
                    window.location.href = url;
                }
            }
        });
        
        // 테이블 정렬 기능
        const sortCleanup = TableUtils.initSortableTable({
            tableSelector: this.config.tableSelector,
            headerSelector: 'th[data-sort]',
            updateUrl: true,
            onSort: (sortField, direction) => {
                this._updateUrlWithSort(sortField, direction);
            }
        });
        
        // 체크박스 전체 선택 기능
        const checkboxCleanup = this._setupSelectAll();
        
        return () => {
            if (tableClickCleanup) tableClickCleanup();
            if (sortCleanup) sortCleanup();
            if (checkboxCleanup) checkboxCleanup();
        };
    }
    
    /**
     * 전체 선택 체크박스 설정
     * @returns {Function} 정리 함수
     */
    _setupSelectAll() {
        const selectAllCheckbox = this.table?.querySelector('thead input[type="checkbox"]');
        const rowCheckboxes = this.table?.querySelectorAll('tbody input[type="checkbox"]');
        
        if (!selectAllCheckbox || rowCheckboxes.length === 0) return null;
        
        // 전체 선택 이벤트
        const handleSelectAll = () => {
            const isChecked = selectAllCheckbox.checked;
            rowCheckboxes.forEach(checkbox => {
                checkbox.checked = isChecked;
            });
            this._updateBulkActionButtons();
        };
        
        // 개별 체크박스 이벤트
        const handleRowSelect = () => {
            const checkedCount = Array.from(rowCheckboxes).filter(cb => cb.checked).length;
            selectAllCheckbox.checked = checkedCount === rowCheckboxes.length;
            selectAllCheckbox.indeterminate = checkedCount > 0 && checkedCount < rowCheckboxes.length;
            this._updateBulkActionButtons();
        };
        
        // 이벤트 리스너 등록
        selectAllCheckbox.addEventListener('change', handleSelectAll);
        rowCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', handleRowSelect);
        });
        
        return () => {
            selectAllCheckbox.removeEventListener('change', handleSelectAll);
            rowCheckboxes.forEach(checkbox => {
                checkbox.removeEventListener('change', handleRowSelect);
            });
        };
    }
    
    /**
     * 필터 및 검색 설정
     * @returns {Function} 정리 함수
     */
    _setupFilters() {
        this.searchForm = document.querySelector(this.config.searchFormSelector);
        if (!this.searchForm) return null;
        
        // 자동 제출 필터 설정
        const filterCleanup = FormUtils.setupAutoSubmitFields({
            formId: this.searchForm.id,
            fieldSelectors: this.config.filterSelectors,
            delay: 500
        });
        
        // 리셋 버튼 설정
        const resetButton = document.querySelector(this.config.resetButtonSelector);
        let resetCleanup = null;
        
        if (resetButton) {
            resetCleanup = UIUtils.setupActionButton(this.config.resetButtonSelector, () => {
                FormUtils.resetForm(this.searchForm.id, true);
            });
        }
        
        // 검색어 입력 필드 엔터키 처리
        const searchInput = this.searchForm.querySelector('input[type="text"], input[type="search"]');
        let searchCleanup = null;
        
        if (searchInput) {
            const handleSearchKeyPress = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.searchForm.submit();
                }
            };
            
            searchInput.addEventListener('keypress', handleSearchKeyPress);
            searchCleanup = () => {
                searchInput.removeEventListener('keypress', handleSearchKeyPress);
            };
        }
        
        return () => {
            if (filterCleanup) filterCleanup();
            if (resetCleanup) resetCleanup();
            if (searchCleanup) searchCleanup();
        };
    }
    
    /**
     * 벌크 액션 설정
     * @returns {Function} 정리 함수
     */
    _setupBulkActions() {
        const bulkButtons = document.querySelectorAll(this.config.bulkActionSelector);
        if (bulkButtons.length === 0) return null;
        
        const cleanupFunctions = [];
        
        bulkButtons.forEach(button => {
            const action = button.getAttribute('data-action');
            
            const handleBulkAction = async () => {
                const selectedIds = this._getSelectedIds();
                
                if (selectedIds.length === 0) {
                    UIUtils.showAlert('선택된 항목이 없습니다.', 'warning', 3000);
                    return;
                }
                
                await this._processBulkAction(action, selectedIds);
            };
            
            button.addEventListener('click', handleBulkAction);
            cleanupFunctions.push(() => {
                button.removeEventListener('click', handleBulkAction);
            });
        });
        
        return () => {
            cleanupFunctions.forEach(cleanup => cleanup());
        };
    }
    
    /**
     * 자동 새로고침 설정
     */
    _setupAutoRefresh() {
        this.refreshTimer = setInterval(() => {
            this.refreshList();
        }, this.config.refreshInterval);
    }
    
    /**
     * 정렬 상태로 URL 업데이트
     * @param {string} sortField 정렬 필드
     * @param {string} direction 정렬 방향
     */
    _updateUrlWithSort(sortField, direction) {
        const url = new URL(window.location);
        
        if (sortField && direction !== 'none') {
            const sortValue = direction === 'desc' ? `-${sortField}` : sortField;
            url.searchParams.set('sort', sortValue);
        } else {
            url.searchParams.delete('sort');
        }
        
        window.location.href = url.toString();
    }
    
    /**
     * 벌크 액션 버튼 상태 업데이트
     */
    _updateBulkActionButtons() {
        const selectedCount = this._getSelectedIds().length;
        const bulkButtons = document.querySelectorAll(this.config.bulkActionSelector);
        
        bulkButtons.forEach(button => {
            button.disabled = selectedCount === 0;
            
            // 선택 개수 표시
            const countElement = button.querySelector('.selected-count');
            if (countElement) {
                countElement.textContent = selectedCount;
            }
        });
    }
    
    /**
     * 선택된 항목 ID 목록 반환
     * @returns {Array<string>} 선택된 ID 배열
     */
    _getSelectedIds() {
        const checkboxes = this.table?.querySelectorAll('tbody input[type="checkbox"]:checked');
        return Array.from(checkboxes || []).map(cb => cb.value).filter(value => value);
    }
    
    /**
     * 벌크 액션 처리
     * @param {string} action 액션 타입
     * @param {Array<string>} ids 대상 ID 배열
     */
    async _processBulkAction(action, ids) {
        try {
            switch (action) {
                case 'delete':
                    await this._processBulkDelete(ids);
                    break;
                case 'export':
                    await this._processBulkExport(ids);
                    break;
                default:
                    throw new Error(`지원하지 않는 액션입니다: ${action}`);
            }
        } catch (error) {
            console.error('벌크 액션 처리 오류:', error);
            UIUtils.showAlert(`작업 처리 중 오류가 발생했습니다: ${error.message}`, 'danger', 5000);
        }
    }
    
    /**
     * 벌크 삭제 처리
     * @param {Array<string>} ids 삭제할 ID 배열
     */
    async _processBulkDelete(ids) {
        const confirmed = await new Promise(resolve => {
            UIUtils.showConfirmDialog({
                title: '일괄 삭제',
                message: `선택된 ${ids.length}개 계약을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.`,
                confirmText: '삭제',
                cancelText: '취소',
                confirmButtonClass: 'btn-danger',
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false)
            });
        });
        
        if (!confirmed) return;
        
        // 각 계약 순차 삭제
        let successCount = 0;
        let errorCount = 0;
        
        for (const id of ids) {
            try {
                await this.contractCore.deleteContract(id);
                successCount++;
            } catch (error) {
                errorCount++;
            }
        }
        
        // 결과 메시지
        if (successCount > 0) {
            UIUtils.showAlert(`${successCount}개 계약이 삭제되었습니다.`, 'success', 3000);
        }
        
        if (errorCount > 0) {
            UIUtils.showAlert(`${errorCount}개 계약 삭제에 실패했습니다.`, 'warning', 3000);
        }
        
        // 페이지 새로고침
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    }
    
    /**
     * 벌크 내보내기 처리
     * @param {Array<string>} ids 내보낼 ID 배열
     */
    async _processBulkExport(ids) {
        // 내보내기 구현 (실제 프로젝트에 맞게 구현)
        UIUtils.showAlert(`${ids.length}개 계약을 내보내기 중...`, 'info', 3000);
        
        // 예시: 내보내기 API 호출
        // const exportUrl = `/api/contracts/export?ids=${ids.join(',')}`;
        // window.open(exportUrl, '_blank');
    }
    
    /**
     * 목록 새로고침
     */
    async refreshList() {
        try {
            // 현재 필터 상태 유지하며 페이지 새로고침
            window.location.reload();
        } catch (error) {
            console.error('목록 새로고침 오류:', error);
        }
    }
    
    /**
     * 리소스 정리
     */
    destroy() {
        // 자동 새로고침 정지
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
        
        // 정리 함수 실행
        this.cleanupFunctions.forEach(cleanup => {
            if (typeof cleanup === 'function') {
                cleanup();
            }
        });
        
        this.cleanupFunctions = [];
        
        if (this.contractCore) {
            this.contractCore.destroy();
        }
        
        console.log('ContractList 리소스 정리');
    }
}

export default ContractList; 