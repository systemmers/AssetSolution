/**
 * 사용자 기본 정보 관리 모듈
 * @module users/detail/user-info-manager
 */
import UIUtils from '../../../../common/ui-utils.js';
import ApiUtils from '../../../../common/api-utils.js';

/**
 * 사용자 기본 정보 표시 및 관리 초기화
 * @returns {Function} 이벤트 정리 함수
 */
export function initBasicInfo() {
    const printBtn = document.getElementById('printUserInfo');
    if (!printBtn) return null;
    
    // 프린트 버튼 이벤트 설정
    const handlePrint = function() {
        UIUtils.printContent('userInfoContainer', {
            title: '사용자 상세 정보',
            printCss: '/static/css/print.css',
            beforePrint: function() {
                UIUtils.showAlert('사용자 정보 인쇄를 준비 중입니다...', 'info', 1500);
            },
            afterPrint: function() {
                UIUtils.showAlert('사용자 정보가 인쇄되었습니다.', 'success');
            },
            customStyles: {
                '.user-profile-header': {
                    'text-align': 'center',
                    'margin-bottom': '20px'
                },
                '.user-avatar': {
                    'max-width': '100px',
                    'margin': '0 auto 15px'
                }
            }
        });
    };
    
    printBtn.addEventListener('click', handlePrint);
    
    // 정리 함수 반환
    return function cleanup() {
        printBtn.removeEventListener('click', handlePrint);
    };
}

/**
 * 비밀번호 초기화 모달 초기화
 * @returns {Function} 이벤트 정리 함수
 */
export function initPasswordResetModal() {
    const resetBtn = document.getElementById('resetPasswordBtn');
    if (!resetBtn) return null;
    
    const cleanupFuncs = [];
    
    // 비밀번호 초기화 버튼 이벤트
    const handleResetBtn = function() {
        // 비밀번호 초기화 모달 표시
        UIUtils.toggleModal('#passwordResetModal', 'show');
    };
    
    resetBtn.addEventListener('click', handleResetBtn);
    cleanupFuncs.push(() => resetBtn.removeEventListener('click', handleResetBtn));
    
    // 모달 확인 버튼 이벤트
    const confirmBtn = document.querySelector('#passwordResetModal .btn-primary');
    if (confirmBtn) {
        const handleConfirmBtn = function() {
            const userId = resetBtn.dataset.userId;
            
            if (!userId) {
                UIUtils.showAlert('사용자 ID를 찾을 수 없습니다.', 'danger');
                return;
            }
            
            // API 호출 (시연용: 실제 구현시 실제 API 엔드포인트로 변경 필요)
            ApiUtils.post(`/api/users/${userId}/reset-password`, {}, {
                handleErrors: true,
                showLoader: true
            })
            .then(response => {
                UIUtils.toggleModal('#passwordResetModal', 'hide');
                UIUtils.showAlert('비밀번호가 성공적으로 초기화되었습니다. 사용자에게 이메일이 발송되었습니다.', 'success');
            })
            .catch(error => {
                UIUtils.showAlert('비밀번호 초기화 중 오류가 발생했습니다.', 'danger');
            });
        };
        
        confirmBtn.addEventListener('click', handleConfirmBtn);
        cleanupFuncs.push(() => confirmBtn.removeEventListener('click', handleConfirmBtn));
    }
    
    // 정리 함수 반환
    return function cleanup() {
        cleanupFuncs.forEach(fn => {
            if (typeof fn === 'function') fn();
        });
    };
} 