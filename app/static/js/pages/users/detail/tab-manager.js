/**
 * 사용자 상세 페이지 탭 관리 모듈
 * @module users/detail/tab-manager
 */
import FormUtils from '../../../../common/form-utils.js';

/**
 * 탭 전환 이벤트 초기화
 * @returns {Function} 이벤트 정리 함수
 */
export function initTabEvents() {
    const tabs = document.querySelectorAll('.nav-link[data-bs-toggle="tab"]');
    if (tabs.length === 0) return null;
    
    // FormUtils의 탭 네비게이션 기능 사용
    const tabNavCleanup = FormUtils.initTabNavigation(tabs, {
        onTabChange: function(tab) {
            const targetId = tab.getAttribute('href');
            
            // 활동 로그 탭이 활성화되면 데이터 새로고침
            if (targetId === '#activity' && tab.classList.contains('active')) {
                // 활동 로그 모듈의 새로고침 함수 호출
                const event = new CustomEvent('refresh-activity-log');
                document.dispatchEvent(event);
            }
            
            // URL 해시 업데이트
            if (targetId) {
                history.replaceState(null, null, targetId);
            }
        }
    });
    
    // URL 해시에 따른 초기 탭 활성화
    const hash = window.location.hash;
    if (hash) {
        const tab = document.querySelector(`.nav-link[href="${hash}"]`);
        if (tab) {
            FormUtils.activateTab(tab);
        }
    }
    
    // 정리 함수 반환
    return tabNavCleanup;
} 