/**
 * 사용자 상태 관리 모듈
 * @module users/list/status-manager
 */
import UIUtils from '../../../../common/ui-utils.js';
import ApiUtils from '../../../../common/api-utils.js';

/**
 * 사용자 상태 변경 버튼 초기화
 * @returns {Function} 이벤트 정리 함수
 */
export function initStatusButtons() {
    const statusButtons = document.querySelectorAll('.btn-status-change');
    if (!statusButtons.length) return null;
    
    const handlers = [];
    
    statusButtons.forEach(button => {
        const handleStatusChange = function(e) {
            e.preventDefault();
            
            const userId = this.dataset.userId;
            const newStatus = this.dataset.status;
            const userName = this.closest('tr').querySelector('td:nth-child(3)').textContent.trim();
            
            if (!userId || !newStatus) {
                UIUtils.showAlert('사용자 정보를 찾을 수 없습니다.', 'danger');
                return;
            }
            
            // 확인 메시지
            if (confirm(`${userName} 사용자의 상태를 '${newStatus}'(으)로 변경하시겠습니까?`)) {
                updateUserStatus(userId, newStatus);
            }
        };
        
        button.addEventListener('click', handleStatusChange);
        handlers.push({ element: button, handler: handleStatusChange });
    });
    
    // 정리 함수 반환
    return function cleanup() {
        handlers.forEach(({ element, handler }) => {
            element.removeEventListener('click', handler);
        });
    };
}

/**
 * 사용자 상태 업데이트
 * @param {string} userId - 사용자 ID
 * @param {string} status - 변경할 상태값
 */
export function updateUserStatus(userId, status) {
    if (!userId || !status) return;
    
    UIUtils.toggleLoader(true);
    
    // API 호출 (시연용: 실제 구현시 실제 API 엔드포인트로 변경 필요)
    const apiUrl = `/api/users/${userId}/status`;
    
    ApiUtils.patch(apiUrl, { status: status }, {
        headers: {
            'Content-Type': 'application/json'
        },
        handleErrors: true,
        loaderSelector: '.loading-indicator'
    })
    .then(response => {
        UIUtils.showAlert(`사용자 상태가 성공적으로 ${status}(으)로 변경되었습니다.`, 'success');
        
        // 상태 표시 UI 업데이트
        const statusCell = document.querySelector(`tr[data-id="${userId}"] .status-cell`);
        if (statusCell) {
            statusCell.textContent = status;
            
            // 상태에 따른 클래스 변경
            statusCell.classList.remove('text-success', 'text-danger', 'text-warning');
            switch (status.toLowerCase()) {
                case 'active':
                    statusCell.classList.add('text-success');
                    break;
                case 'inactive':
                    statusCell.classList.add('text-secondary');
                    break;
                case 'suspended':
                    statusCell.classList.add('text-danger');
                    break;
                case 'pending':
                    statusCell.classList.add('text-warning');
                    break;
            }
        }
        
        // 상태 변경 버튼 업데이트
        const row = document.querySelector(`tr[data-id="${userId}"]`);
        if (row) {
            const buttons = row.querySelectorAll('.btn-status-change');
            buttons.forEach(btn => {
                btn.style.display = btn.dataset.status === status ? 'none' : 'inline-block';
            });
        }
    })
    .catch(error => {
        UIUtils.showAlert('사용자 상태 변경 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'), 'danger');
        console.error('상태 변경 오류:', error);
    })
    .finally(() => {
        UIUtils.toggleLoader(false);
    });
} 