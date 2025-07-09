/**
 * 자산 상세 페이지 핵심 모듈
 * 핵심 초기화 코드와 공통 기능을 담당합니다.
 */

import UIUtils from '../../../common/ui-utils.js';
import ApiUtils from '../../../common/api-utils.js';

/**
 * 삭제 확인 모달 초기화
 */
function initDeleteConfirmation() {
    const deleteButton = document.getElementById('deleteAssetBtn');
    if (!deleteButton) return;
    
    UIUtils.setupActionButton(deleteButton, function() {
        const assetId = document.querySelector('[data-asset-id]')?.dataset.assetId;
        const assetName = document.querySelector('.asset-name')?.textContent || '선택한 자산';
        
        UIUtils.showConfirmModal({
            title: '자산 삭제',
            message: `"${assetName}"을(를) 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
            confirmText: '삭제',
            cancelText: '취소',
            confirmButtonClass: 'btn-danger'
        }, (confirmed) => {
            if (confirmed) {
                // 삭제 중 로딩 표시
                UIUtils.showAlert('자산 삭제 중...', 'info');
                
                // API 호출 (시연용: 실제 구현시 실제 API 엔드포인트로 변경 필요)
                ApiUtils.delete(`/api/assets/${assetId}`, {
                    handleErrors: true,
                    showLoader: false
                })
                .then(response => {
                    UIUtils.showAlert('자산이 성공적으로 삭제되었습니다.', 'success');
                    
                    // 자산 목록 페이지로 리디렉션
                    setTimeout(() => {
                        window.location.href = '/assets';
                    }, 1500);
                })
                .catch(error => {
                    UIUtils.showAlert('자산 삭제 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'), 'danger');
                });
            }
        });
    });
}

/**
 * 이벤트 리스너 정리 함수
 */
function cleanup() {
    // 특별히 정리해야 할 이벤트가 있으면 여기에 추가
    console.log('자산 상세 페이지 이벤트 리스너 정리');
}

// 공개 API
export {
    initDeleteConfirmation,
    cleanup
}; 