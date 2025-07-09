/**
 * UI 모달 모듈
 * 모달 관리 및 설정 기능을 제공합니다.
 * 
 * @module common/ui/UIModal
 * @exports UIModal
 * 
 * @example
 * // 모듈 가져오기
 * import { UIModal } from '../common/ui/index.js';
 * 
 * // 또는 직접 가져오기
 * import UIModal from '../common/ui/UIModal.js';
 */

const UIModal = (function() {
    /**
     * Bootstrap 모달의 표시 상태를 토글합니다.
     * 모달을 보이거나 숨기거나 토글할 수 있으며, 필요시 새 모달 인스턴스를 생성합니다.
     * 
     * @param {string} modalSelector - 모달 요소 CSS 선택자
     * @param {string} [action='toggle'] - 수행할 작업 ('show', 'hide', 'toggle')
     * @returns {Object|null} Bootstrap 모달 객체 또는 모달/Bootstrap을 찾지 못한 경우 null
     * @throws {Error} 선택자에 해당하는 모달을 찾지 못한 경우 콘솔에 오류 출력
     * 
     * @example
     * // 모달 표시
     * UIModal.toggleModal('#exampleModal', 'show');
     * 
     * // 모달 숨기기
     * UIModal.toggleModal('#exampleModal', 'hide');
     * 
     * // 모달 토글 (표시 상태 반전)
     * UIModal.toggleModal('#exampleModal');
     */
    function toggleModal(modalSelector, action = 'toggle') {
        const modalEl = document.querySelector(modalSelector);
        if (!modalEl) {
            console.error(`Modal ${modalSelector} not found.`);
            return null;
        }
        
        if (typeof bootstrap === 'undefined') {
            console.error('Bootstrap이 로드되지 않았습니다. toggleModal 함수를 사용할 수 없습니다.');
            return null;
        }
        
        const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        
        switch (action.toLowerCase()) {
            case 'show':
                modal.show();
                break;
            case 'hide':
                modal.hide();
                break;
            case 'toggle':
            default:
                modal.toggle();
                break;
        }
        
        return modal;
    }
    
    /**
     * 모달 내용을 설정합니다.
     * 제목, 본문, 푸터 등 모달의 주요 부분을 동적으로 변경할 수 있습니다.
     * 
     * @param {string} modalSelector - 모달 요소 CSS 선택자
     * @param {Object} [content={}] - 설정할 내용 객체
     * @param {string|HTMLElement} [content.title] - 모달 제목 (HTML 지원)
     * @param {string|HTMLElement} [content.body] - 모달 본문 (HTML 지원)
     * @param {string|HTMLElement} [content.footer] - 모달 푸터 (HTML 지원)
     * @param {boolean} [show=false] - 내용 설정 후 모달을 표시할지 여부
     * @returns {Object|null} Bootstrap 모달 객체 또는 모달을 찾지 못한 경우 null
     * @throws {Error} 선택자에 해당하는 모달을 찾지 못한 경우 콘솔에 오류 출력
     * 
     * @example
     * // 모달 내용 설정 (표시 안 함)
     * UIModal.setModalContent('#exampleModal', {
     *   title: '알림',
     *   body: '작업이 완료되었습니다.',
     *   footer: '<button type="button" class="btn btn-primary" data-bs-dismiss="modal">확인</button>'
     * });
     * 
     * // 모달 내용 설정 및 표시
     * UIModal.setModalContent('#exampleModal', {
     *   title: '확인 필요',
     *   body: '정말로 삭제하시겠습니까?'
     * }, true);
     */
    function setModalContent(modalSelector, content = {}, show = false) {
        const modalEl = document.querySelector(modalSelector);
        if (!modalEl) {
            console.error(`Modal ${modalSelector} not found.`);
            return null;
        }
        
        // 제목 설정
        if (content.title !== undefined) {
            const titleEl = modalEl.querySelector('.modal-title');
            if (titleEl) {
                titleEl.innerHTML = content.title;
            }
        }
        
        // 본문 설정
        if (content.body !== undefined) {
            const bodyEl = modalEl.querySelector('.modal-body');
            if (bodyEl) {
                bodyEl.innerHTML = content.body;
            }
        }
        
        // 푸터 설정
        if (content.footer !== undefined) {
            const footerEl = modalEl.querySelector('.modal-footer');
            if (footerEl) {
                footerEl.innerHTML = content.footer;
            }
        }
        
        // 모달 표시 여부
        if (show) {
            return toggleModal(modalSelector, 'show');
        }
        
        return bootstrap.Modal.getInstance(modalEl);
    }
    
    /**
     * 확인 모달을 표시합니다.
     * 사용자에게 작업 확인을 요청하는 모달을 동적으로 생성하고 표시합니다.
     * 
     * @param {Object} [options={}] - 확인 모달 옵션
     * @param {string} [options.title='확인'] - 모달 제목
     * @param {string} [options.message='계속 진행하시겠습니까?'] - 표시할 메시지
     * @param {string} [options.confirmText='확인'] - 확인 버튼 텍스트
     * @param {string} [options.cancelText='취소'] - 취소 버튼 텍스트
     * @param {string} [options.confirmButtonClass='btn-primary'] - 확인 버튼 CSS 클래스
     * @param {Function} [callback=null] - 사용자 선택 후 호출될 콜백 함수 (확인: true, 취소: false)
     * @returns {Object|null} Bootstrap 모달 객체 또는 Bootstrap이 로드되지 않은 경우 null
     * 
     * @example
     * // 기본 확인 모달
     * UIModal.showConfirmModal({}, result => {
     *   if (result) {
     *     console.log('사용자가 확인 버튼을 클릭했습니다.');
     *   } else {
     *     console.log('사용자가 취소 버튼을 클릭했습니다.');
     *   }
     * });
     * 
     * // 사용자 정의 확인 모달
     * UIModal.showConfirmModal({
     *   title: '항목 삭제',
     *   message: '이 항목을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
     *   confirmText: '삭제',
     *   cancelText: '취소',
     *   confirmButtonClass: 'btn-danger'
     * }, result => {
     *   if (result) {
     *     deleteItem(itemId);
     *   }
     * });
     */
    function showConfirmModal(options = {}, callback = null) {
        // 기본 옵션
        const defaultOptions = {
            title: '확인',
            message: '계속 진행하시겠습니까?',
            confirmText: '확인',
            cancelText: '취소',
            confirmButtonClass: 'btn-primary'
        };
        
        const settings = { ...defaultOptions, ...options };
        
        // 모달 ID 생성
        const modalId = 'confirmModal' + Date.now();
        
        // 기존 모달이 있으면 제거
        let modalEl = document.getElementById(modalId);
        if (modalEl) {
            modalEl.remove();
        }
        
        // 새 모달 생성
        modalEl = document.createElement('div');
        modalEl.id = modalId;
        modalEl.className = 'modal fade';
        modalEl.setAttribute('tabindex', '-1');
        modalEl.setAttribute('role', 'dialog');
        modalEl.setAttribute('aria-hidden', 'true');
        
        // 모달 내용 구성
        modalEl.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${settings.title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">${settings.message}</div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${settings.cancelText}</button>
                        <button type="button" class="btn ${settings.confirmButtonClass}" id="${modalId}-confirm">${settings.confirmText}</button>
                    </div>
                </div>
            </div>
        `;
        
        // DOM에 추가
        document.body.appendChild(modalEl);
        
        // 모달 객체 생성
        if (typeof bootstrap === 'undefined') {
            console.error('Bootstrap이 로드되지 않았습니다. showConfirmModal 함수를 사용할 수 없습니다.');
            return null;
        }
        
        const modal = new bootstrap.Modal(modalEl);
        
        // 확인 버튼 이벤트
        const confirmBtn = document.getElementById(`${modalId}-confirm`);
        if (confirmBtn && callback) {
            confirmBtn.addEventListener('click', () => {
                modal.hide();
                callback(true);
            });
        }
        
        // 취소 이벤트 (닫기 버튼 또는 취소 버튼 클릭)
        modalEl.addEventListener('hidden.bs.modal', () => {
            // 사용자가 확인 버튼을 클릭하지 않은 경우 (취소로 간주)
            if (callback && !confirmBtn.getAttribute('data-confirmed')) {
                callback(false);
            }
            
            // 모달 제거 (일회용)
            setTimeout(() => {
                modalEl.remove();
            }, 300);
        });
        
        // 확인 버튼 클릭 추적
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                confirmBtn.setAttribute('data-confirmed', 'true');
            });
        }
        
        // 모달 표시
        modal.show();
        
        return modal;
    }
    
    // 공개 API
    return {
        toggleModal,
        setModalContent,
        showConfirmModal
    };
})();

export default UIModal; 