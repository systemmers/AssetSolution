/**
 * 인벤토리 상세 상태 관리 모듈
 * @module inventory/detail/status-manager
 */
import FormUtils from '../../../../common/form-utils.js';
import UIUtils from '../../../../common/ui-utils.js';

/**
 * 인벤토리 상태 변경 핸들러 초기화
 * @returns {Function} 이벤트 정리 함수
 */
export function initStatusChangeHandlers() {
    const statusSelect = document.getElementById('inventoryStatus');
    if (!statusSelect) return null;
    
    const form = statusSelect.closest('form');
    if (!form) return null;
    
    // FormUtils를 사용하여 선택 필드 변경 시 자동 제출 설정
    const submitCleanup = FormUtils.setupAutoSubmitFields({
        formId: form.id || 'statusForm',
        fieldSelectors: '#inventoryStatus'
    });
    
    // 상태 배지 업데이트
    updateStatusBadge(statusSelect.value);
    
    // 상태 변경 시 배지 업데이트
    const handleStatusChange = function() {
        updateStatusBadge(this.value);
    };
    
    statusSelect.addEventListener('change', handleStatusChange);
    
    // 정리 함수 반환
    return function cleanup() {
        if (submitCleanup) submitCleanup();
        statusSelect.removeEventListener('change', handleStatusChange);
    };
}

/**
 * 상태 배지 업데이트
 * @param {string} status - 현재 선택된 상태
 */
export function updateStatusBadge(status) {
    const statusBadge = document.querySelector('.status-badge');
    if (!statusBadge) return;
    
    // 기존 배경색 클래스 제거
    UIUtils.removeClassesFromElement(statusBadge, [
        'bg-success', 'bg-warning', 'bg-danger', 'bg-info', 'bg-secondary', 'text-dark'
    ]);
    
    // 상태별 설정 매핑
    const statusConfig = {
        'complete': { class: 'bg-success', text: '완료' },
        'completed': { class: 'bg-success', text: '완료' },
        'in_progress': { class: 'bg-warning text-dark', text: '진행중' },
        'planned': { class: 'bg-info', text: '예정됨' },
        'cancelled': { class: 'bg-secondary', text: '취소됨' },
        'discrepancy': { class: 'bg-danger', text: '불일치' }
    };
    
    // 상태 설정 적용
    const config = statusConfig[status.toLowerCase()] || { class: 'bg-secondary', text: status };
    UIUtils.addClassesToElement(statusBadge, config.class.split(' '));
    statusBadge.textContent = config.text;
} 