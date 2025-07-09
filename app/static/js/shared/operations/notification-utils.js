/**
 * 공통 알림 시스템 유틸리티
 * 토스트, 모달, 인라인 알림 등을 일관성 있게 관리
 */

const NotificationUtils = (function() {
    
    // 알림 설정
    const DEFAULT_CONFIG = {
        toast: {
            position: 'top-right',
            duration: 3000,
            showClose: true,
            animation: true
        },
        alert: {
            dismissible: true,
            showIcon: true
        }
    };

    /**
     * 토스트 알림 표시
     * @param {string} message 메시지
     * @param {string} type 타입 (success, error, warning, info)
     * @param {Object} options 추가 옵션
     */
    function showToast(message, type = 'info', options = {}) {
        const config = { ...DEFAULT_CONFIG.toast, ...options };
        const toastId = `toast-${Date.now()}`;
        
        const typeClasses = {
            success: 'bg-success',
            error: 'bg-danger',
            warning: 'bg-warning',
            info: 'bg-info'
        };

        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        const toastHtml = `
            <div id="${toastId}" class="toast ${typeClasses[type]} text-white" role="alert" 
                 aria-live="assertive" aria-atomic="true" data-bs-delay="${config.duration}">
                <div class="toast-header ${typeClasses[type]} text-white border-0">
                    <i class="${icons[type]} me-2"></i>
                    <strong class="me-auto">${getTypeLabel(type)}</strong>
                    <small class="text-white-50">${formatTime(new Date())}</small>
                    ${config.showClose ? '<button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>' : ''}
                </div>
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        `;

        // 토스트 컨테이너 확인/생성
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = `toast-container position-fixed ${getPositionClass(config.position)}`;
            container.style.zIndex = '9999';
            document.body.appendChild(container);
        }

        // 토스트 추가
        container.insertAdjacentHTML('beforeend', toastHtml);
        
        // Bootstrap 토스트 초기화 및 표시
        const toastElement = document.getElementById(toastId);
        if (typeof bootstrap !== 'undefined') {
            const toast = new bootstrap.Toast(toastElement);
            toast.show();
            
            // 자동 제거
            toastElement.addEventListener('hidden.bs.toast', () => {
                toastElement.remove();
            });
        }

        return toastId;
    }

    /**
     * 인라인 알림 표시
     * @param {string} containerId 컨테이너 ID
     * @param {string} message 메시지
     * @param {string} type 타입
     * @param {Object} options 추가 옵션
     */
    function showAlert(containerId, message, type = 'info', options = {}) {
        const config = { ...DEFAULT_CONFIG.alert, ...options };
        const container = document.getElementById(containerId);
        
        if (!container) {
            console.warn(`Alert container not found: ${containerId}`);
            return;
        }

        const alertId = `alert-${Date.now()}`;
        const typeClasses = {
            success: 'alert-success',
            error: 'alert-danger',
            warning: 'alert-warning',
            info: 'alert-info'
        };

        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        const alertHtml = `
            <div id="${alertId}" class="alert ${typeClasses[type]} ${config.dismissible ? 'alert-dismissible' : ''} fade show" role="alert">
                ${config.showIcon ? `<i class="${icons[type]} me-2"></i>` : ''}
                ${message}
                ${config.dismissible ? '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>' : ''}
            </div>
        `;

        // 기존 알림 제거 (옵션)
        if (options.clearPrevious) {
            container.innerHTML = '';
        }

        container.insertAdjacentHTML('beforeend', alertHtml);

        // 자동 제거
        if (options.duration) {
            setTimeout(() => {
                const alertElement = document.getElementById(alertId);
                if (alertElement) {
                    alertElement.remove();
                }
            }, options.duration);
        }

        return alertId;
    }

    /**
     * 확인 모달 표시
     * @param {Object} config 모달 설정
     * @returns {Promise} 사용자 선택 결과
     */
    function showConfirm(config) {
        return new Promise((resolve) => {
            const {
                title = '확인',
                message = '계속하시겠습니까?',
                confirmText = '확인',
                cancelText = '취소',
                type = 'warning'
            } = config;

            const modalId = `confirm-modal-${Date.now()}`;
            const typeClasses = {
                success: 'text-success',
                error: 'text-danger',
                warning: 'text-warning',
                info: 'text-info'
            };

            const icons = {
                success: 'fas fa-check-circle',
                error: 'fas fa-exclamation-circle',
                warning: 'fas fa-exclamation-triangle',
                info: 'fas fa-question-circle'
            };

            const modalHtml = `
                <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header border-0 pb-0">
                                <h5 class="modal-title">
                                    <i class="${icons[type]} ${typeClasses[type]} me-2"></i>
                                    ${title}
                                </h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <p class="mb-0">${message}</p>
                            </div>
                            <div class="modal-footer border-0 pt-0">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${cancelText}</button>
                                <button type="button" class="btn btn-primary confirm-btn">${confirmText}</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHtml);
            
            const modalElement = document.getElementById(modalId);
            const modal = new bootstrap.Modal(modalElement);
            
            // 이벤트 리스너
            modalElement.querySelector('.confirm-btn').addEventListener('click', () => {
                modal.hide();
                resolve(true);
            });

            modalElement.addEventListener('hidden.bs.modal', () => {
                modalElement.remove();
                resolve(false);
            });

            modal.show();
        });
    }

    /**
     * 로딩 오버레이 표시/숨김
     * @param {boolean} show 표시 여부
     * @param {string} message 로딩 메시지
     * @param {string} containerId 특정 컨테이너 ID (전체 화면이 아닌 경우)
     */
    function showLoading(show = true, message = '처리 중...', containerId = null) {
        const loadingId = containerId ? `loading-${containerId}` : 'global-loading';
        let loadingElement = document.getElementById(loadingId);

        if (show) {
            if (!loadingElement) {
                const loadingHtml = `
                    <div id="${loadingId}" class="loading-overlay">
                        <div class="loading-content">
                            <div class="spinner-border text-primary mb-3" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                            <div class="loading-message">${message}</div>
                        </div>
                    </div>
                `;

                if (containerId) {
                    const container = document.getElementById(containerId);
                    if (container) {
                        container.style.position = 'relative';
                        container.insertAdjacentHTML('beforeend', loadingHtml);
                    }
                } else {
                    document.body.insertAdjacentHTML('beforeend', loadingHtml);
                }

                // CSS 스타일 추가 (한 번만)
                if (!document.getElementById('loading-overlay-styles')) {
                    const styles = `
                        <style id="loading-overlay-styles">
                        .loading-overlay {
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            background: rgba(255, 255, 255, 0.9);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            z-index: 9998;
                        }
                        
                        body > .loading-overlay {
                            position: fixed;
                        }
                        
                        .loading-content {
                            text-align: center;
                            padding: 2rem;
                            background: white;
                            border-radius: 0.5rem;
                            box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
                        }
                        
                        .loading-message {
                            color: #6c757d;
                            font-size: 0.875rem;
                        }
                        </style>
                    `;
                    document.head.insertAdjacentHTML('beforeend', styles);
                }
            }
        } else {
            if (loadingElement) {
                loadingElement.remove();
            }
        }
    }

    /**
     * 알림 타입 라벨 반환
     */
    function getTypeLabel(type) {
        const labels = {
            success: '성공',
            error: '오류',
            warning: '경고',
            info: '정보'
        };
        return labels[type] || '알림';
    }

    /**
     * 토스트 위치 클래스 반환
     */
    function getPositionClass(position) {
        const positions = {
            'top-right': 'top-0 end-0 p-3',
            'top-left': 'top-0 start-0 p-3',
            'bottom-right': 'bottom-0 end-0 p-3',
            'bottom-left': 'bottom-0 start-0 p-3',
            'top-center': 'top-0 start-50 translate-middle-x p-3',
            'bottom-center': 'bottom-0 start-50 translate-middle-x p-3'
        };
        return positions[position] || positions['top-right'];
    }

    /**
     * 시간 포맷팅
     */
    function formatTime(date) {
        return date.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    /**
     * 모든 알림 제거
     */
    function clearAllNotifications() {
        // 토스트 제거
        const toastContainer = document.getElementById('toast-container');
        if (toastContainer) {
            toastContainer.innerHTML = '';
        }

        // 인라인 알림 제거
        document.querySelectorAll('.alert').forEach(alert => {
            alert.remove();
        });

        // 로딩 오버레이 제거
        document.querySelectorAll('.loading-overlay').forEach(loading => {
            loading.remove();
        });
    }

    // 공개 API
    return {
        showToast,
        showAlert,
        showConfirm,
        showLoading,
        clearAllNotifications,
        
        // 별칭 (하위 호환성)
        toast: showToast,
        alert: showAlert,
        confirm: showConfirm,
        loading: showLoading
    };

})();

// 전역 접근을 위한 window 객체에 추가
if (typeof window !== 'undefined') {
    window.NotificationUtils = NotificationUtils;
} 