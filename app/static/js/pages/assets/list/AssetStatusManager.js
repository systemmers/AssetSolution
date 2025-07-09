/**
 * 자산 상태 관리 모듈
 * 
 * 자산 목록 화면에서 자산 상태 관리 기능을 제공합니다.
 * 상태 변경, 일괄 변경 등의 기능을 포함합니다.
 */

import UIUtils from '../../../common/ui-utils.js';
import ApiUtils from '../../../common/api-utils.js';

let selectedAssetIds = []; // 선택된 자산 ID 배열

/**
 * 자산 상태 변경 버튼 초기화
 */
function initAssetActionButtons() {
    // 상태 변경 버튼 이벤트
    const statusButtons = document.querySelectorAll('.asset-status-btn');
    
    statusButtons.forEach(button => {
        UIUtils.setupActionButton(button, function() {
            const assetId = this.closest('tr').dataset.assetId;
            const newStatus = this.dataset.status;
            
            if (assetId && newStatus) {
                initiateStatusChange(assetId, newStatus);
            }
        });
    });
    
    // 삭제 버튼 이벤트
    const deleteButtons = document.querySelectorAll('.asset-delete-btn');
    
    deleteButtons.forEach(button => {
        UIUtils.setupActionButton(button, function() {
            const assetRow = this.closest('tr');
            const assetId = assetRow.dataset.assetId;
            const assetName = assetRow.querySelector('.asset-name').textContent;
            
            UIUtils.showConfirmModal({
                title: '자산 삭제',
                message: `"${assetName}" 자산을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
                confirmText: '삭제',
                cancelText: '취소',
                confirmButtonClass: 'btn-danger'
            }, (confirmed) => {
                if (confirmed) {
                    // 삭제 API 호출 (가상 API)
                    ApiUtils.delete(`/api/assets/${assetId}`, {
                        handleErrors: true
                    })
                    .then(() => {
                        assetRow.remove();
                        UIUtils.showAlert(`${assetName} 자산이 삭제되었습니다.`, 'success');
                    })
                    .catch(error => {
                        UIUtils.showAlert('자산 삭제 중 오류: ' + (error.message || '알 수 없는 오류'), 'danger');
                    });
                }
            });
        });
    });
}

/**
 * 일괄 선택 기능 초기화
 */
function initBulkSelection() {
    const assetCheckboxes = document.querySelectorAll('.asset-checkbox');
    const selectAllCheckbox = document.getElementById('selectAll');
    
    // 일괄 체크 상태 업데이트 함수
    const updateBulkActionButtons = () => {
        const selectedCount = selectedAssetIds.length;
        const bulkActionButtons = document.querySelectorAll('.bulk-action-btn');
        
        bulkActionButtons.forEach(btn => {
            btn.disabled = selectedCount === 0;
            
            // 선택된 개수 표시 업데이트
            const countSpan = btn.querySelector('.selected-count');
            if (countSpan) {
                countSpan.textContent = selectedCount;
                countSpan.style.display = selectedCount > 0 ? 'inline' : 'none';
            }
        });
    };
    
    // 전체 선택 체크박스 이벤트
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const checked = this.checked;
            
            assetCheckboxes.forEach(checkbox => {
                checkbox.checked = checked;
                
                const assetId = checkbox.value;
                if (checked && !selectedAssetIds.includes(assetId)) {
                    selectedAssetIds.push(assetId);
                } else if (!checked) {
                    selectedAssetIds = selectedAssetIds.filter(id => id !== assetId);
                }
            });
            
            updateBulkActionButtons();
        });
    }
    
    // 개별 체크박스 이벤트
    assetCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const assetId = this.value;
            
            if (this.checked && !selectedAssetIds.includes(assetId)) {
                selectedAssetIds.push(assetId);
            } else if (!this.checked) {
                selectedAssetIds = selectedAssetIds.filter(id => id !== assetId);
                
                // 전체 선택 체크박스 상태 업데이트
                if (selectAllCheckbox && selectAllCheckbox.checked) {
                    selectAllCheckbox.checked = false;
                }
            }
            
            updateBulkActionButtons();
        });
    });
    
    // 일괄 상태 변경 버튼
    const bulkStatusBtn = document.getElementById('bulkStatusBtn');
    if (bulkStatusBtn) {
        UIUtils.setupActionButton(bulkStatusBtn, function() {
            showStatusSelectionModal(selectedAssetIds);
        });
    }
    
    // 일괄 삭제 버튼
    const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
    if (bulkDeleteBtn) {
        UIUtils.setupActionButton(bulkDeleteBtn, function() {
            deleteAssetsBulk(selectedAssetIds);
        });
    }
    
    // 선택된 자산 내보내기 버튼 (AssetListView 모듈에서 구현)
    // 다른 모듈과의 연동을 위해 이벤트 발생 사용
    const bulkExportBtn = document.getElementById('bulkExportBtn');
    if (bulkExportBtn) {
        UIUtils.setupActionButton(bulkExportBtn, function() {
            document.dispatchEvent(new CustomEvent('exportSelectedAssets', { 
                detail: { assetIds: selectedAssetIds } 
            }));
        });
    }
    
    // 초기 상태 설정
    updateBulkActionButtons();
}

/**
 * 일괄 상태 변경 모달 표시
 * @param {Array} assetIds - 선택된 자산 ID 배열
 */
function showStatusSelectionModal(assetIds) {
    if (!assetIds || assetIds.length === 0) {
        UIUtils.showAlert('상태를 변경할 자산을 선택해주세요.', 'warning');
        return;
    }
    
    UIUtils.showModal({
        title: '일괄 상태 변경',
        content: createStatusModalContent(assetIds),
        size: 'modal-sm',
        onShown: () => {
            const statusButtons = document.querySelectorAll('.status-btn');
            statusButtons.forEach(btn => {
                UIUtils.setupActionButton(btn, function() {
                    const newStatus = this.dataset.status;
                    performBulkStatusChange(newStatus);
                    UIUtils.closeCurrentModal();
                });
            });
        }
    });
}

/**
 * 상태 선택 모달 내용 생성
 * @param {Array} assetIds - 선택된 자산 ID 배열
 * @returns {string} 모달 내용 HTML
 */
function createStatusModalContent(assetIds) {
    return `
        <p class="mb-3">${assetIds.length}개 자산의 상태를 변경합니다:</p>
        <div class="d-grid gap-2">
            <button class="btn btn-success status-btn" data-status="active">
                <i class="fas fa-check-circle me-1"></i> 정상
            </button>
            <button class="btn btn-warning status-btn" data-status="maintenance">
                <i class="fas fa-tools me-1"></i> 유지보수
            </button>
            <button class="btn btn-info status-btn" data-status="unused">
                <i class="fas fa-pause-circle me-1"></i> 미사용
            </button>
            <button class="btn btn-secondary status-btn" data-status="disposed">
                <i class="fas fa-trash-alt me-1"></i> 폐기
            </button>
        </div>
    `;
}

/**
 * 일괄 상태 변경 수행
 * @param {string} newStatus - 새 상태 값
 * @returns {Promise} - 일괄 상태 변경 결과 프로미스
 */
const performBulkStatusChange = async (newStatus) => {
    if (selectedAssetIds.length === 0) {
        UIUtils.showAlert('선택된 자산이 없습니다.', 'warning');
        return;
    }
    
    try {
        const response = await fetch('/api/assets/bulk-status-update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken()
            },
            body: JSON.stringify({
                asset_ids: selectedAssetIds,
                status: newStatus
            })
        });
        
        if (!response.ok) {
            throw new Error('일괄 상태 변경 실패');
        }
        
        const result = await response.json();
        
        // UI 업데이트
        selectedAssetIds.forEach(assetId => {
            updateAssetStatusUI(assetId, newStatus);
        });
        
        return result;
    } catch (error) {
        console.error('일괄 상태 변경 중 오류 발생:', error);
        throw error;
    }
};

/**
 * CSRF 토큰 가져오기
 * 
 * @returns {string} - CSRF 토큰
 */
const getCsrfToken = () => {
    const tokenElement = document.querySelector('meta[name="csrf-token"]');
    return tokenElement ? tokenElement.getAttribute('content') : '';
};

/**
 * 일괄 자산 삭제
 * @param {Array} assetIds - 선택된 자산 ID 배열
 */
function deleteAssetsBulk(assetIds) {
    if (!assetIds || assetIds.length === 0) {
        UIUtils.showAlert('삭제할 자산을 선택해주세요.', 'warning');
        return;
    }
    
    UIUtils.showConfirmModal({
        title: '자산 일괄 삭제',
        message: `선택한 ${assetIds.length}개의 자산을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
        confirmText: '삭제',
        cancelText: '취소',
        confirmButtonClass: 'btn-danger'
    }, (confirmed) => {
        if (confirmed) {
            UIUtils.showAlert(`${assetIds.length}개 자산을 삭제 중입니다...`, 'info');
            
            // 가상 API 호출
            ApiUtils.post('/api/assets/bulk-delete', {
                assetIds
            }, {
                handleErrors: true
            })
            .then(response => {
                // 성공 처리
                UIUtils.showAlert(`${assetIds.length}개 자산이 성공적으로 삭제되었습니다.`, 'success');
                
                // UI에서 삭제된 행 제거
                assetIds.forEach(assetId => {
                    const row = document.querySelector(`tr[data-asset-id="${assetId}"]`);
                    if (row) {
                        row.remove();
                    }
                });
                
                // 선택 상태 초기화
                clearSelectedAssetIds();
            })
            .catch(error => {
                UIUtils.showAlert('자산 삭제 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'), 'danger');
            });
        }
    });
}

/**
 * 자산 상태 변경
 * @param {string} assetId - 자산 ID
 * @param {string} newStatus - 변경할 상태
 */
const changeAssetStatus = async (assetId, newStatus) => {
    try {
        const response = await fetch(`/api/assets/${assetId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken()
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (!response.ok) {
            throw new Error('상태 변경 실패');
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('자산 상태 변경 중 오류 발생:', error);
        throw error;
    }
};

/**
 * 상태 변경 처리 시작
 * @param {string} assetId - 자산 ID
 * @param {string} newStatus - 변경할 상태
 */
function initiateStatusChange(assetId, newStatus) {
    const assetRow = document.querySelector(`tr[data-asset-id="${assetId}"]`);
    if (!assetRow) return;
    
    const assetName = assetRow.querySelector('.asset-name').textContent;
    const statusText = getStatusText(newStatus);
    
    UIUtils.showConfirmModal({
        title: '상태 변경',
        message: `"${assetName}" 자산의 상태를 "${statusText}"(으)로 변경하시겠습니까?`,
        confirmText: '변경',
        cancelText: '취소'
    }, (confirmed) => {
        if (confirmed) {
            // API 호출 (시연용: 실제 구현시 실제 API 엔드포인트로 변경 필요)
            changeAssetStatus(assetId, newStatus)
            .then(response => {
                handleStatusChangeSuccess(assetId, newStatus);
            })
            .catch(error => {
                handleStatusChangeError(error);
            });
        }
    });
}

/**
 * 상태 변경 성공 처리
 * @param {string} assetId - 자산 ID
 * @param {string} newStatus - 변경된 상태
 */
function handleStatusChangeSuccess(assetId, newStatus) {
    // UI 업데이트
    updateAssetStatusUI(assetId, newStatus);
    
    // 성공 메시지
    UIUtils.showAlert('자산 상태가 성공적으로 변경되었습니다.', 'success', 2000);
}

/**
 * 상태 변경 오류 처리
 * @param {Error} error - 오류 객체
 */
function handleStatusChangeError(error) {
    UIUtils.showAlert('상태 변경 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'), 'danger');
}

/**
 * 자산 상태 UI 업데이트
 * @param {string} assetId - 자산 ID
 * @param {string} newStatus - 새로운 상태
 */
const updateAssetStatusUI = (assetId, newStatus) => {
    const row = document.querySelector(`tr[data-asset-id="${assetId}"]`);
    if (!row) return;
    
    // 상태 셀 업데이트
    const statusCell = row.querySelector('td[data-field="status"]');
    if (statusCell) {
        statusCell.textContent = newStatus;
    }
    
    // 상태에 따른 행 스타일 변경
    row.classList.remove('status-available', 'status-in-use', 'status-maintenance', 'status-disposed');
    row.classList.add(`status-${newStatus.toLowerCase().replace(/\s+/g, '-')}`);
    
    // 상태 아이콘 업데이트
    const statusIcon = row.querySelector('.status-icon');
    if (statusIcon) {
        statusIcon.className = `status-icon ${getStatusIconClass(newStatus)}`;
    }
};

/**
 * 상태에 따른 아이콘 클래스 반환
 * 
 * @param {string} status - 상태 값
 * @returns {string} - 아이콘 클래스명
 */
const getStatusIconClass = (status) => {
    const statusMap = {
        '사용가능': 'fa-check-circle text-success',
        '사용중': 'fa-user text-primary',
        '수리중': 'fa-tools text-warning',
        '폐기': 'fa-trash-alt text-danger'
    };
    
    return statusMap[status] || 'fa-question-circle text-secondary';
};

/**
 * 상태 코드에 해당하는 텍스트 반환
 * @param {string} status - 상태 코드
 * @returns {string} 상태 텍스트
 */
function getStatusText(status) {
    const statusMap = {
        'active': '정상',
        'maintenance': '유지보수',
        'unused': '미사용',
        'disposed': '폐기',
        'expired': '만료'
    };
    
    return statusMap[status] || '알 수 없음';
}

/**
 * 상태 코드에 해당하는 배지 HTML 반환
 * @param {string} status - 상태 코드
 * @returns {string} 배지 HTML
 */
function getStatusBadgeHTML(status) {
    const statusConfig = {
        'active': { text: '정상', class: 'success' },
        'maintenance': { text: '유지보수', class: 'warning' },
        'unused': { text: '미사용', class: 'info' },
        'disposed': { text: '폐기', class: 'secondary' },
        'expired': { text: '만료', class: 'danger' }
    };
    
    const config = statusConfig[status] || { text: '알 수 없음', class: 'dark' };
    
    return `<span class="badge bg-${config.class} status-badge">${config.text}</span>`;
}

// 외부로 내보내기
export {
    changeAssetStatus,
    updateAssetStatusUI,
    performBulkStatusChange,
    getCsrfToken
};

// 선택된 자산 ID 목록 가져오기 함수
export function getSelectedAssetIds() {
    return selectedAssetIds;
} 