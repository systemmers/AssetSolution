/**
 * 인벤토리 상세 스캐닝 관리 모듈
 * @module inventory/detail/scanning-manager
 */
import UIUtils from '../../../../common/ui-utils.js';

/**
 * 바코드/QR 코드 스캐닝 기능 초기화
 * @returns {Function} 이벤트 정리 함수
 */
export function initScanningFeature() {
    const scanButton = document.getElementById('scanButton');
    const assetIdInput = document.getElementById('assetIdInput');
    
    if (!scanButton || !assetIdInput) return null;
    
    const handleScanButtonClick = function() {
        // 실제 구현에서는 바코드 스캐너 API 또는 카메라 API를 사용
        // 여기서는 UIUtils를 사용한 프롬프트로 대체
        UIUtils.showInputPrompt(
            '자산 ID 또는 바코드 값을 입력하세요:',
            '',
            (scannedValue) => {
                if (scannedValue) {
                    assetIdInput.value = scannedValue;
                    
                    // 스캔 후 자동 검증
                    const verifyButton = document.getElementById('verifyButton');
                    if (verifyButton) {
                        verifyButton.click();
                    }
                }
            }
        );
    };
    
    scanButton.addEventListener('click', handleScanButtonClick);
    
    // 정리 함수 반환
    return function cleanup() {
        scanButton.removeEventListener('click', handleScanButtonClick);
    };
}

/**
 * 자산 확인 기능 초기화
 * @returns {Function} 이벤트 정리 함수
 */
export function initAssetVerification() {
    const verifyButton = document.getElementById('verifyButton');
    if (!verifyButton) return null;
    
    const handleVerifyButtonClick = function() {
        const assetIdInput = document.getElementById('assetIdInput');
        if (!assetIdInput || !assetIdInput.value) {
            UIUtils.showAlert('자산 ID를 입력하세요.', 'warning');
            return;
        }
        
        const assetId = assetIdInput.value.trim();
        
        // 실제 구현에서는 AJAX를 사용하여 서버에 확인 요청
        // 여기서는 페이지 내 자산 목록 확인으로 대체
        const assetRow = document.querySelector(`.asset-item[data-asset-id="${assetId}"]`);
        
        if (assetRow) {
            // 확인된 자산 표시
            UIUtils.addClassesToElement(assetRow, ['verified']);
            
            // 상태 업데이트
            const statusCell = assetRow.querySelector('.asset-status');
            if (statusCell) {
                statusCell.innerHTML = '<span class="badge bg-success">확인됨</span>';
            }
            
            // 입력 필드 초기화
            assetIdInput.value = '';
            assetIdInput.focus();
            
            // 성공 메시지
            UIUtils.showAlert('자산이 확인되었습니다.', 'success');
        } else {
            // 실패 메시지
            UIUtils.showAlert('일치하는 자산을 찾을 수 없습니다.', 'danger');
        }
    };
    
    verifyButton.addEventListener('click', handleVerifyButtonClick);
    
    // 정리 함수 반환
    return function cleanup() {
        verifyButton.removeEventListener('click', handleVerifyButtonClick);
    };
} 