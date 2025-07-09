/**
 * UI 알림 모듈
 * 알림 메시지 표시 및 토스트 메시지 관리 기능을 제공합니다.
 * 
 * 함수 목록:
 * - showAlert: 알림 메시지 표시
 * - initToasts: Bootstrap 토스트 메시지 초기화
 * - createToast: 토스트 메시지 생성
 */

const UIAlert = (function() {
    /**
     * 알림 메시지를 화면에 표시합니다.
     * @param {string} message - 표시할 메시지 내용
     * @param {string} type - 알림 유형 (success, info, warning, danger)
     * @param {number} duration - 알림 표시 지속 시간 (밀리초)
     * @param {string} containerSelector - 알림이 추가될 컨테이너 선택자
     * @returns {Element} 생성된 알림 요소
     */
    function showAlert(message, type = 'info', duration = 3000, containerSelector = '.alert-container') {
        const container = document.querySelector(containerSelector);
        if (!container) {
            console.error(`Alert container ${containerSelector} not found.`);
            return null;
        }
        
        // 알림 요소 생성
        const alertEl = document.createElement('div');
        alertEl.className = `alert alert-${type} alert-dismissible fade show`;
        alertEl.setAttribute('role', 'alert');
        
        // 알림 내용 추가
        alertEl.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // 컨테이너에 추가
        container.appendChild(alertEl);
        
        // Bootstrap alert 객체 생성
        let bsAlert = null;
        if (typeof bootstrap !== 'undefined') {
            bsAlert = new bootstrap.Alert(alertEl);
        }
        
        // 지정된 시간 후 알림 자동 닫기
        if (duration > 0) {
            setTimeout(() => {
                if (bsAlert) {
                    bsAlert.close();
                } else {
                    alertEl.classList.remove('show');
                    setTimeout(() => {
                        alertEl.remove();
                    }, 150);
                }
            }, duration);
        }
        
        return alertEl;
    }
    
    /**
     * Bootstrap 토스트 메시지를 초기화합니다.
     * @param {string} selector - 토스트 요소 선택자
     * @param {Object} options - 토스트 옵션 (autohide, delay 등)
     */
    function initToasts(selector = '.toast', options = {}) {
        const toastElList = document.querySelectorAll(selector);
        if (toastElList.length === 0) return;
        
        if (typeof bootstrap === 'undefined') {
            console.error('Bootstrap이 로드되지 않았습니다. initToasts 함수를 사용할 수 없습니다.');
            return;
        }
        
        const defaultOptions = {
            autohide: true,
            delay: 3000
        };
        
        const finalOptions = { ...defaultOptions, ...options };
        
        toastElList.forEach(toastEl => {
            const toast = new bootstrap.Toast(toastEl, finalOptions);
            toast.show();
        });
    }
    
    /**
     * 토스트 메시지를 생성하고 표시합니다.
     * @param {string} message - 표시할 메시지 내용
     * @param {string} title - 토스트 제목 (선택 사항)
     * @param {Object} options - 토스트 옵션 (autohide, delay, class 등)
     * @returns {Element} 생성된 토스트 요소
     */
    function createToast(message, title = '', options = {}) {
        // 기본 옵션
        const defaultOptions = {
            autohide: true,
            delay: 3000,
            class: 'bg-primary text-white',
            container: '.toast-container',
            icon: 'info-circle'
        };
        
        const settings = { ...defaultOptions, ...options };
        
        // 토스트 컨테이너 가져오기
        const container = document.querySelector(settings.container);
        if (!container) {
            console.error(`Toast container ${settings.container} not found.`);
            return null;
        }
        
        // 토스트 ID 생성
        const toastId = 'toast-' + Date.now();
        
        // 토스트 요소 생성
        const toastEl = document.createElement('div');
        toastEl.id = toastId;
        toastEl.className = `toast ${settings.class}`;
        toastEl.setAttribute('role', 'alert');
        toastEl.setAttribute('aria-live', 'assertive');
        toastEl.setAttribute('aria-atomic', 'true');
        
        // 토스트 내용 구성
        let toastHTML = '';
        
        // 헤더 추가 (제목이 있는 경우)
        if (title) {
            toastHTML += `
                <div class="toast-header">
                    ${settings.icon ? `<i class="fas fa-${settings.icon} me-2"></i>` : ''}
                    <strong class="me-auto">${title}</strong>
                    <small>${settings.time || ''}</small>
                    <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            `;
        }
        
        // 본문 추가
        toastHTML += `
            <div class="toast-body d-flex align-items-center">
                ${!title && settings.icon ? `<i class="fas fa-${settings.icon} me-2"></i>` : ''}
                <div>${message}</div>
                ${!title ? `<button type="button" class="btn-close ms-auto" data-bs-dismiss="toast" aria-label="Close"></button>` : ''}
            </div>
        `;
        
        toastEl.innerHTML = toastHTML;
        
        // 컨테이너에 추가
        container.appendChild(toastEl);
        
        // Bootstrap toast 객체 생성 및 표시
        if (typeof bootstrap === 'undefined') {
            console.error('Bootstrap이 로드되지 않았습니다. createToast 함수를 사용할 수 없습니다.');
            return toastEl;
        }
        
        const toast = new bootstrap.Toast(toastEl, {
            autohide: settings.autohide,
            delay: settings.delay
        });
        
        toast.show();
        
        // 토스트 요소 반환
        return toastEl;
    }
    
    // 공개 API
    return {
        showAlert,
        initToasts,
        createToast
    };
})();

export default UIAlert; 