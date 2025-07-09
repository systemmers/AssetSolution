/**
 * UI 통합 모듈
 * UI 관련 하위 모듈을 하나로 통합하여 제공합니다.
 * 
 * 포함 모듈:
 * - UIBase: 기본 UI 유틸리티
 * - UIAlert: 알림 관련 기능
 * - UIModal: 모달 관련 기능
 * - UITheme: 테마 관련 기능
 * - UIPrint: 인쇄 관련 기능
 */

import UIBase from './UIBase.js';
import UIAlert from './UIAlert.js';
import UIModal from './UIModal.js';
import UITheme from './UITheme.js';
import UIPrint from './UIPrint.js';

/**
 * 통합 UI 모듈
 * 모든 UI 유틸리티 기능을 단일 네임스페이스로 제공합니다.
 */
const UI = {
    // UIBase 모듈의 모든 함수를 최상위 레벨에 포함
    ...UIBase,
    
    // 하위 모듈을 네임스페이스로 제공
    Alert: UIAlert,
    Modal: UIModal,
    Theme: UITheme,
    Print: UIPrint,
    
    /**
     * UI 초기화 함수
     * 여러 UI 모듈을 일괄 초기화합니다.
     * @param {Object} options - 초기화 옵션
     * @returns {Object} 초기화 결과
     */
    init(options = {}) {
        const result = {};
        
        // 툴팁 초기화
        if (options.initTooltips !== false) {
            if (typeof bootstrap !== 'undefined') {
                const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
                tooltipTriggerList.forEach(tooltipTriggerEl => {
                    new bootstrap.Tooltip(tooltipTriggerEl);
                });
                result.tooltips = true;
            }
        }
        
        // 토스트 초기화
        if (options.initToasts !== false) {
            UIAlert.initToasts();
            result.toasts = true;
        }
        
        // 반응형 버튼 처리
        if (options.responsiveButtons !== false) {
            UIBase.handleResponsiveButtons();
            result.responsiveButtons = true;
        }
        
        // 다크모드 토글 초기화
        if (options.darkModeToggle) {
            const darkModeResult = UITheme.configUI({
                darkModeToggle: true,
                darkModeToggleSelector: options.darkModeToggleSelector || '#darkModeToggle'
            });
            
            result.darkModeToggle = darkModeResult.darkModeToggle;
        }
        
        // 테마 초기화
        if (options.initTheme !== false) {
            UITheme.initTheme();
            result.theme = true;
        }
        
        return result;
    }
};

// 이전 UIUtils와의 호환성을 위한 별칭
const UIUtils = UI;

export { UIUtils };
export default UI; 