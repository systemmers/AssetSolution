/**
 * UI 기본 유틸리티 모듈
 * UI 관련 공통 기능과 기본 요소 조작 기능을 제공합니다.
 * 
 * @module common/ui/UIBase
 * @exports UIBase
 * 
 * @example
 * // 모듈 가져오기
 * import { UIBase } from '../common/ui/index.js';
 * 
 * // 또는 직접 가져오기
 * import UIBase from '../common/ui/UIBase.js';
 */

const UIBase = (function() {
    /**
     * 특정 버튼에 액션 이벤트를 설정합니다.
     * 클릭 이벤트를 처리하고 필요한 경우 기본 동작을 방지합니다.
     * 
     * @param {string|Element} buttonSelector - 버튼 요소 또는 CSS 선택자
     * @param {Function} actionHandler - 버튼 클릭 시 실행할 함수
     * @param {boolean} [preventDefault=true] - 기본 이벤트를 방지할지 여부
     * @returns {Element|null} 설정된 버튼 요소 또는 요소를 찾지 못한 경우 null
     * 
     * @example
     * // 선택자로 버튼 설정
     * UIBase.setupActionButton('#saveButton', () => {
     *   console.log('저장 버튼 클릭됨');
     *   saveData();
     * });
     * 
     * // 요소 직접 전달
     * const button = document.querySelector('#cancelButton');
     * UIBase.setupActionButton(button, handleCancel, false);
     */
    function setupActionButton(buttonSelector, actionHandler, preventDefault = true) {
        const button = typeof buttonSelector === 'string' 
            ? document.querySelector(buttonSelector) 
            : buttonSelector;
        
        if (!button) {
            console.error('Button element not found:', buttonSelector);
            return null;
        }
        
        button.addEventListener('click', function(event) {
            if (preventDefault) {
                event.preventDefault();
            }
            
            if (typeof actionHandler === 'function') {
                actionHandler(event);
            }
        });
        
        return button;
    }
    
    /**
     * HTML 요소를 생성합니다.
     * 요소 생성, 속성 설정, 내용 추가를 한 번에 처리합니다.
     * 
     * @param {string} tag - 요소 태그명 (예: 'div', 'span', 'button')
     * @param {Object} [attributes={}] - 요소에 설정할 속성
     * @param {string} [attributes.class] - 요소 클래스명
     * @param {Object} [attributes.style] - 인라인 스타일 객체
     * @param {Object} [attributes.dataset] - 데이터 속성 객체
     * @param {string|Array|Element} [content=''] - 요소 내용 (문자열, 요소 배열, 또는 단일 요소)
     * @returns {Element} 생성된 HTML 요소
     * 
     * @example
     * // 단순 요소 생성
     * const div = UIBase.createElement('div', { class: 'container' }, '내용');
     * 
     * // 복잡한 요소 생성
     * const button = UIBase.createElement('button', {
     *   class: 'btn btn-primary',
     *   style: { marginTop: '10px' },
     *   onclick: () => alert('클릭됨')
     * }, '저장');
     * 
     * // 중첩 요소 생성
     * const card = UIBase.createElement('div', { class: 'card' }, [
     *   UIBase.createElement('div', { class: 'card-header' }, '제목'),
     *   UIBase.createElement('div', { class: 'card-body' }, '내용')
     * ]);
     */
    function createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        // 속성 설정
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'class' || key === 'className') {
                element.className = value;
            } else if (key === 'style' && typeof value === 'object') {
                Object.entries(value).forEach(([prop, val]) => {
                    element.style[prop] = val;
                });
            } else if (key.startsWith('on') && typeof value === 'function') {
                const eventName = key.substring(2).toLowerCase();
                element.addEventListener(eventName, value);
            } else {
                element.setAttribute(key, value);
            }
        });
        
        // 내용 설정
        if (content) {
            if (typeof content === 'string') {
                element.innerHTML = content;
            } else if (Array.isArray(content)) {
                content.forEach(item => {
                    if (typeof item === 'string') {
                        element.appendChild(document.createTextNode(item));
                    } else if (item instanceof Element) {
                        element.appendChild(item);
                    }
                });
            } else if (content instanceof Element) {
                element.appendChild(content);
            }
        }
        
        return element;
    }
    
    /**
     * 요소의 가시성을 토글합니다.
     * display 속성을 변경하여 요소를 보이거나 숨깁니다.
     * 
     * @param {string} selector - 토글할 요소 CSS 선택자
     * @param {boolean} [show=true] - 표시 여부 (true: 표시, false: 숨김)
     * @param {string} [displayType='block'] - 표시될 때 사용할 display 속성 값
     * @returns {Element|null} 토글된 요소 또는 요소를 찾지 못한 경우 null
     * 
     * @example
     * // 요소 표시
     * UIBase.toggleElementVisibility('#notification', true);
     * 
     * // 요소 숨김
     * UIBase.toggleElementVisibility('#loadingSpinner', false);
     * 
     * // flex로 표시
     * UIBase.toggleElementVisibility('#container', true, 'flex');
     */
    function toggleElementVisibility(selector, show = true, displayType = 'block') {
        const element = document.querySelector(selector);
        if (!element) return null;
        
        element.style.display = show ? displayType : 'none';
        return element;
    }
    
    /**
     * 버튼의 활성화 상태를 설정합니다.
     * 버튼 비활성화, 로딩 상태 표시 및 원래 상태로 복원을 관리합니다.
     * 
     * @param {string|Element} button - 버튼 요소 또는 CSS 선택자
     * @param {boolean} [enabled=true] - 활성화 여부
     * @param {string|null} [loadingText=null] - 비활성화 시 표시할 로딩 텍스트 (null이면 변경 안함)
     * @param {string|null} [originalText=null] - 활성화 시 복원할 원본 텍스트 (null이면 data-original-text 속성 사용)
     * @returns {Element|null} 상태가 변경된 버튼 요소 또는 요소를 찾지 못한 경우 null
     * 
     * @example
     * // 버튼 비활성화 및 로딩 텍스트 표시
     * UIBase.toggleButtonState('#submitBtn', false, '처리 중...');
     * 
     * // 버튼 활성화 및 원래 텍스트로 복원
     * UIBase.toggleButtonState('#submitBtn', true);
     */
    function toggleButtonState(button, enabled = true, loadingText = null, originalText = null) {
        // 버튼 요소 가져오기
        const buttonEl = typeof button === 'string' ? document.querySelector(button) : button;
        if (!buttonEl) return null;
        
        // 활성화/비활성화 설정
        buttonEl.disabled = !enabled;
        
        // 텍스트 처리
        if (enabled) {
            // 활성화: 원본 텍스트로 복원
            const textToRestore = originalText || buttonEl.getAttribute('data-original-text');
            if (textToRestore) {
                buttonEl.innerHTML = textToRestore;
                buttonEl.removeAttribute('data-original-text');
            }
            
            // 로딩 클래스 제거
            buttonEl.classList.remove('btn-loading');
        } else if (loadingText) {
            // 비활성화: 로딩 텍스트로 변경
            if (!buttonEl.hasAttribute('data-original-text')) {
                buttonEl.setAttribute('data-original-text', buttonEl.innerHTML);
            }
            buttonEl.innerHTML = loadingText;
            
            // 로딩 클래스 추가
            buttonEl.classList.add('btn-loading');
        }
        
        return buttonEl;
    }
    
    /**
     * 반응형 버튼 텍스트를 처리합니다.
     * 화면 크기에 따라 버튼 내용을 동적으로 조정합니다.
     * 
     * @param {string} [selector='.btn[data-full-text]'] - 버튼 요소 CSS 선택자
     * @param {number} [breakpoint=768] - 텍스트를 숨길 화면 너비 기준점 (픽셀)
     * @param {string} [textAttr='data-full-text'] - 버튼 전체 텍스트를 저장할 속성명
     * @returns {Function} 이벤트 리스너 정리 함수 - 버튼 처리가 더 이상 필요 없을 때 호출
     * 
     * @example
     * // 기본 설정으로 반응형 버튼 초기화
     * const cleanup = UIBase.handleResponsiveButtons();
     * 
     * // 사용자 정의 설정으로 초기화
     * const cleanup = UIBase.handleResponsiveButtons('.custom-btn[data-text]', 992, 'data-text');
     * 
     * // 정리 (페이지 언로드 또는 컴포넌트 해제 시)
     * cleanup();
     */
    function handleResponsiveButtons(selector = '.btn[data-full-text]', breakpoint = 768, textAttr = 'data-full-text') {
        const buttons = document.querySelectorAll(selector);
        if (buttons.length === 0) return function() {};
        
        const updateButtonText = () => {
            const isMobile = window.innerWidth < breakpoint;
            
            buttons.forEach(button => {
                const fullText = button.getAttribute(textAttr);
                if (!fullText) return;
                
                // 아이콘과 텍스트를 분리
                const iconMatch = fullText.match(/<i[^>]*>.*?<\/i>/);
                const icon = iconMatch ? iconMatch[0] : '';
                const text = fullText.replace(/<i[^>]*>.*?<\/i>/, '').trim();
                
                if (isMobile) {
                    // 모바일: 아이콘만 표시
                    button.innerHTML = icon || text.charAt(0);
                } else {
                    // 데스크톱: 전체 텍스트 표시
                    button.innerHTML = fullText;
                }
            });
        };
        
        // 초기 실행 및 리사이즈 이벤트 리스너 등록
        updateButtonText();
        window.addEventListener('resize', updateButtonText);

        // 정리 함수 반환 (나중에 이벤트 리스너 제거를 위해)
        return function cleanup() {
            window.removeEventListener('resize', updateButtonText);
        };
    }
    
    /**
     * 로딩 표시기를 표시하거나 숨깁니다.
     * Bootstrap의 d-none 클래스를 사용하여 로딩 인디케이터를 제어합니다.
     * 
     * @param {boolean} [show=true] - 로딩 표시기를 표시할지 여부
     * @param {string} [selector='.loading-indicator'] - 로딩 표시기 요소 CSS 선택자
     * @returns {Element|null} 로딩 표시기 요소 또는 요소를 찾지 못한 경우 null
     * 
     * @example
     * // 로딩 표시기 표시
     * UIBase.toggleLoader(true);
     * 
     * // 로딩 표시기 숨김
     * UIBase.toggleLoader(false);
     * 
     * // 사용자 정의 로딩 표시기 표시
     * UIBase.toggleLoader(true, '#customLoader');
     */
    function toggleLoader(show = true, selector = '.loading-indicator') {
        const loader = document.querySelector(selector);
        if (!loader) return null;
        
        if (show) {
            loader.classList.remove('d-none');
        } else {
            loader.classList.add('d-none');
        }
        
        return loader;
    }
    
    /**
     * 필터 초기화 버튼을 설정합니다.
     * 폼 내의 모든 입력 필드를 초기값으로 되돌립니다.
     * 
     * @param {string} buttonSelector - 초기화 버튼 CSS 선택자
     * @param {string} formSelector - 초기화할 폼 CSS 선택자
     * @param {boolean} [submitAfterReset=false] - 초기화 후 폼을 자동으로 제출할지 여부
     * @returns {Element|null} 설정된 버튼 요소 또는 요소를 찾지 못한 경우 null
     * 
     * @example
     * // 기본 초기화 버튼 설정
     * UIBase.initFilterReset('#resetBtn', '#filterForm');
     * 
     * // 초기화 후 자동 제출
     * UIBase.initFilterReset('#resetAndSearchBtn', '#searchForm', true);
     */
    function initFilterReset(buttonSelector, formSelector, submitAfterReset = false) {
        const button = document.querySelector(buttonSelector);
        const form = document.querySelector(formSelector);
        
        if (!button || !form) {
            console.error('Button or form not found', { buttonSelector, formSelector });
            return null;
        }
        
        button.addEventListener('click', (event) => {
            event.preventDefault();
            
            // 모든 입력 필드 초기화
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                if (input.type === 'checkbox' || input.type === 'radio') {
                    input.checked = input.defaultChecked;
                } else {
                    input.value = input.defaultValue;
                }
                
                // Select2 등 특수 요소 처리
                if (input.tagName === 'SELECT' && window.jQuery && window.jQuery(input).data('select2')) {
                    window.jQuery(input).trigger('change');
                }
            });
            
            // 필요한 경우 폼 제출
            if (submitAfterReset) {
                form.submit();
            }
        });
        
        return button;
    }
    
    // 공개 API
    return {
        setupActionButton,
        createElement,
        toggleElementVisibility,
        toggleButtonState,
        handleResponsiveButtons,
        toggleLoader,
        initFilterReset
    };
})();

export default UIBase; 