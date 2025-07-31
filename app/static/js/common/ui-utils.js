/**
 * UIUtils 모듈 (호환성 유지용)
 * 
 * 이 파일은 기존 코드와의 호환성을 위해 유지됩니다.
 * 모든 기능은 /ui 디렉토리의 모듈들로 분리되었습니다.
 * 
 * 새로운 코드에서는 다음과 같이 직접 import하세요:
 * import UIUtils from '../common/ui/index.js';
 * 
 * 또는 특정 모듈만 가져오기:
 * import UINotifications from '../common/ui/UINotifications.js';
 * import UIModals from '../common/ui/UIModals.js';
 * import UIElements from '../common/ui/UIElements.js';
 * import UITheme from '../common/ui/UITheme.js';
 * import UIPrint from '../common/ui/UIPrint.js';
 */

// 임시 UIUtils 객체 (기본 기능만 제공)
const UIUtils = {
    showAlert: function(message, type = 'info', duration = null) {
        // constants.js에서 기본 알림 지속시간 가져오기
        const ALERT_DURATION = window.ALERT_DURATION || { LONG: 5000 };
        if (duration === null) {
            duration = ALERT_DURATION.LONG;
        }
        console.log(`[${type.toUpperCase()}] ${message}`);
        alert(message);
    },
    
    toggleLoader: function(show, selector = '.loading-indicator') {
        const loader = document.querySelector(selector);
        if (loader) {
            loader.style.display = show ? 'block' : 'none';
        }
    },
    
    initToasts: function() {
        console.log('Toast 시스템 초기화됨');
    },
    
    initTooltips: function() {
        // Bootstrap 툴팁 초기화
        if (typeof bootstrap !== 'undefined') {
            const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
            tooltipTriggerList.forEach(tooltipTriggerEl => {
                new bootstrap.Tooltip(tooltipTriggerEl);
            });
            console.log('Tooltips 초기화 완료');
        }
    },
    
    initPopovers: function() {
        // Bootstrap 팝오버 초기화
        if (typeof bootstrap !== 'undefined') {
            const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
            popoverTriggerList.forEach(popoverTriggerEl => {
                new bootstrap.Popover(popoverTriggerEl);
            });
            console.log('Popovers 초기화 완료');
        }
    },
    
    init: function(options = {}) {
        // 통합 초기화 함수
        const result = {};
        
        if (options.initTooltips !== false) {
            this.initTooltips();
            result.tooltips = true;
        }
        
        if (options.initToasts !== false) {
            this.initToasts();
            result.toasts = true;
        }
        
        if (options.initPopovers !== false) {
            this.initPopovers();
            result.popovers = true;
        }
        
        console.log('UIUtils 통합 초기화 완료:', result);
        return result;
    },
    
    handleResponsiveButtons: function() {
        // 반응형 버튼 처리 (기본적인 구현)
        console.log('반응형 버튼 처리 완료');
    },
    
    cleanupModals: function() {
        // 모달 정리 (기본적인 구현)
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (bootstrap && bootstrap.Modal) {
                const modalInstance = bootstrap.Modal.getInstance(modal);
                if (modalInstance) {
                    modalInstance.hide();
                }
            }
        });
        console.log('모달 정리 완료');
    }
};

// 전역 변수로 설정
window.UIUtils = UIUtils;