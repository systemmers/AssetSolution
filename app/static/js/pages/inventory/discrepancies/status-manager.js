/**
 * 인벤토리 불일치 항목 상태 관리 모듈
 * @module inventory/discrepancies/status-manager
 */
import UIUtils from '../../../../common/ui-utils.js';
import ApiUtils from '../../../../common/api-utils.js';

/**
 * 처리 상태 변경 드롭다운 초기화
 * @returns {Function} 이벤트 정리 함수
 */
export function initStatusDropdowns() {
    const statusButtons = document.querySelectorAll('.dropdown-item[href*="check"]');
    if (statusButtons.length === 0) return null;
    
    const buttonHandlers = [];
    
    statusButtons.forEach(button => {
        const handleStatusChange = function(e) {
            e.preventDefault();
            
            // 데이터 수집
            const itemId = this.dataset.id;
            const newStatus = this.dataset.status;
            
            if (!itemId || !newStatus) {
                console.error('상태 변경을 위한 데이터가 불충분합니다:', { itemId, newStatus });
                UIUtils.showAlert('상태 변경을 처리할 수 없습니다.', 'danger');
                return;
            }
            
            // 상태 변경 확인 (선택적으로 구현)
            const confirmChange = confirm('처리 상태를 변경하시겠습니까?');
            if (!confirmChange) return;
            
            // 로딩 표시
            const row = this.closest('tr');
            const statusCell = row?.querySelector('td:nth-child(7)');
            
            if (statusCell) {
                // 로딩 표시
                const originalContent = statusCell.innerHTML;
                statusCell.innerHTML = '<div class="spinner-border spinner-border-sm text-primary" role="status"><span class="visually-hidden">로딩 중...</span></div>';
                
                // API 호출 (실제 구현시 아래 URL과 파라미터를 실제 API에 맞게 변경)
                ApiUtils.post('/api/inventory/discrepancies/update-status', {
                    itemId: itemId,
                    status: newStatus
                }, {
                    handleErrors: true,
                    showLoader: false
                })
                .then(response => {
                    // 성공 메시지
                    UIUtils.showAlert('처리 상태가 성공적으로 업데이트되었습니다.', 'success');
                    
                    // UI 업데이트
                    updateStatusDisplay(statusCell, newStatus);
                })
                .catch(error => {
                    console.error('상태 업데이트 오류:', error);
                    UIUtils.showAlert('상태 업데이트 중 오류가 발생했습니다.', 'danger');
                    
                    // 원래 상태로 복원
                    statusCell.innerHTML = originalContent;
                });
            } else {
                // 임시 알림 표시 (개발 중)
                UIUtils.showAlert('처리 상태가 업데이트되었습니다. (개발 중)', 'info');
            }
        };
        
        button.addEventListener('click', handleStatusChange);
        buttonHandlers.push({ element: button, handler: handleStatusChange });
    });
    
    // 정리 함수 반환
    return function cleanup() {
        buttonHandlers.forEach(item => {
            item.element.removeEventListener('click', item.handler);
        });
    };
}

/**
 * 상태 셀의 표시 업데이트
 * @param {HTMLElement} cell - 상태 표시 셀
 * @param {string} status - 새 상태 값
 */
function updateStatusDisplay(cell, status) {
    if (!cell) return;
    
    // 상태에 따라 다른 배지 표시
    let badgeClass = 'bg-secondary';
    let statusText = '알 수 없음';
    
    switch (status.toLowerCase()) {
        case 'resolved':
        case 'resolved_found':
            badgeClass = 'bg-success';
            statusText = '해결됨';
            break;
            
        case 'pending':
            badgeClass = 'bg-warning';
            statusText = '처리 중';
            break;
            
        case 'confirmed':
            badgeClass = 'bg-danger';
            statusText = '불일치 확인';
            break;
            
        case 'investigating':
            badgeClass = 'bg-info';
            statusText = '조사 중';
            break;
    }
    
    cell.innerHTML = `<span class="badge ${badgeClass}">${statusText}</span>`;
} 