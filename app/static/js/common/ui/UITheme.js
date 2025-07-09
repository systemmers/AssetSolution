/**
 * UI 테마 모듈
 * 테마 설정 및 다크모드 관리 기능을 제공합니다.
 * 
 * 함수 목록:
 * - setColorTheme: 색상 테마 설정
 * - updateThemeVariables: 테마 변수 업데이트
 * - updateDarkModeButtonState: 다크 모드 버튼 상태 업데이트
 * - configUI: UI 구성 설정
 */

const UITheme = (function() {
    /**
     * 색상 테마를 설정합니다.
     * @param {string} theme - 설정할 테마 ('dark' 또는 'light')
     * @param {boolean} savePreference - 사용자 설정을 로컬 스토리지에 저장할지 여부
     */
    function setColorTheme(theme = 'light', savePreference = true) {
        const body = document.body;
        
        // 테마 클래스 적용
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            document.documentElement.setAttribute('data-bs-theme', 'dark');
        } else {
            body.classList.remove('dark-mode');
            document.documentElement.setAttribute('data-bs-theme', 'light');
        }
        
        // 사용자 설정 저장
        if (savePreference) {
            localStorage.setItem('theme', theme);
        }
        
        // 테마 변경 이벤트 발생
        const event = new CustomEvent('themeChanged', { detail: { theme } });
        document.dispatchEvent(event);
        
        // 특정 CSS 변수 업데이트 (필요한 경우)
        updateThemeVariables(theme);
    }
    
    /**
     * 테마별 CSS 변수를 업데이트합니다.
     * @param {string} theme - 현재 테마 ('dark' 또는 'light')
     */
    function updateThemeVariables(theme) {
        const root = document.documentElement;
        
        if (theme === 'dark') {
            // 다크 모드 CSS 변수
            root.style.setProperty('--body-bg', '#121212');
            root.style.setProperty('--body-color', '#e0e0e0');
            root.style.setProperty('--card-bg', '#1e1e1e');
            root.style.setProperty('--border-color', '#333');
            root.style.setProperty('--input-bg', '#2c2c2c');
            root.style.setProperty('--input-color', '#e0e0e0');
        } else {
            // 라이트 모드 CSS 변수
            root.style.setProperty('--body-bg', '#f8f9fa');
            root.style.setProperty('--body-color', '#212529');
            root.style.setProperty('--card-bg', '#ffffff');
            root.style.setProperty('--border-color', '#dee2e6');
            root.style.setProperty('--input-bg', '#ffffff');
            root.style.setProperty('--input-color', '#212529');
        }
    }
    
    /**
     * 다크모드 버튼 상태를 업데이트합니다.
     * @param {Element} button - 다크모드 토글 버튼 요소
     * @param {boolean} isDarkMode - 다크모드 활성화 여부
     */
    function updateDarkModeButtonState(button, isDarkMode) {
        if (!button) return;
        
        // 아이콘 업데이트
        const iconEl = button.querySelector('i');
        if (iconEl) {
            // 아이콘 클래스 전환 (예: moon <-> sun)
            if (isDarkMode) {
                iconEl.classList.remove('fa-moon');
                iconEl.classList.add('fa-sun');
            } else {
                iconEl.classList.remove('fa-sun');
                iconEl.classList.add('fa-moon');
            }
        }
        
        // 텍스트 업데이트
        const textSpan = button.querySelector('span');
        if (textSpan) {
            textSpan.textContent = isDarkMode ? '라이트 모드' : '다크 모드';
        }
        
        // 버튼 클래스 업데이트
        if (isDarkMode) {
            button.classList.remove('btn-dark');
            button.classList.add('btn-light');
        } else {
            button.classList.remove('btn-light');
            button.classList.add('btn-dark');
        }
        
        // 상태 속성 설정
        button.setAttribute('aria-pressed', isDarkMode ? 'true' : 'false');
    }
    
    /**
     * UI 기본 설정을 초기화합니다.
     * @param {Object} options - UI 설정 옵션
     * @param {boolean} options.initTooltips - 툴팁 초기화 여부
     * @param {boolean} options.initToasts - 토스트 초기화 여부
     * @param {boolean} options.responsiveButtons - 반응형 버튼 활성화 여부
     * @param {boolean} options.darkModeToggle - 다크모드 토글 버튼 초기화 여부
     * @param {string} options.darkModeToggleSelector - 다크모드 토글 버튼 선택자
     * @returns {Object} 초기화된 UI 구성 요소 객체
     */
    function configUI(options = {}) {
        const defaultOptions = {
            initTooltips: true,
            initToasts: true,
            responsiveButtons: true,
            darkModeToggle: false,
            darkModeToggleSelector: '#darkModeToggle'
        };

        const settings = { ...defaultOptions, ...options };
        const result = {};

        // 기존 코드에서는 다른 모듈에 의존하는데, 이제 모듈이 분리되었으므로 
        // 해당 모듈을 직접 import하거나 외부에서 주입받는 방식으로 변경 필요
        // 여기서는 의존성 주입 방식으로 처리한다고 가정하고 구현

        // 다크모드 토글 버튼 초기화
        if (settings.darkModeToggle) {
            const darkModeButton = document.querySelector(settings.darkModeToggleSelector);
            if (darkModeButton) {
                // 현재 테마 상태 확인
                const isDarkMode = document.body.classList.contains('dark-mode') || 
                                   localStorage.getItem('theme') === 'dark';
                
                // 버튼 초기 상태 설정
                updateDarkModeButtonState(darkModeButton, isDarkMode);
                
                // 클릭 이벤트 리스너 등록
                darkModeButton.addEventListener('click', () => {
                    const currentIsDark = document.body.classList.contains('dark-mode');
                    setColorTheme(!currentIsDark ? 'dark' : 'light');
                    updateDarkModeButtonState(darkModeButton, !currentIsDark);
                });
                
                result.darkModeToggle = true;
            }
        }

        return result;
    }
    
    /**
     * 현재 시스템 설정에 따라 테마를 초기화합니다.
     */
    function initTheme() {
        // 로컬 스토리지에서 저장된 테마 설정 확인
        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme) {
            // 저장된 설정이 있으면 적용
            setColorTheme(savedTheme);
        } else {
            // 저장된 설정이 없으면 시스템 설정 확인
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            setColorTheme(prefersDark ? 'dark' : 'light');
            
            // 시스템 설정 변경 감지
            if (window.matchMedia) {
                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
                    if (!localStorage.getItem('theme')) { // 사용자가 수동으로 설정하지 않은 경우에만
                        setColorTheme(event.matches ? 'dark' : 'light', false);
                    }
                });
            }
        }
    }
    
    // 공개 API
    return {
        setColorTheme,
        updateThemeVariables,
        updateDarkModeButtonState,
        configUI,
        initTheme
    };
})();

export default UITheme; 