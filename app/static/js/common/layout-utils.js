/**
 * LayoutUtils 모듈
 * 
 * 레이아웃 관련 공통 유틸리티 함수들을 제공합니다.
 * - 사이드바 토글
 * - 레이아웃 조정
 * - 레이아웃 환경설정 저장/불러오기
 */

const LayoutUtils = (function() {
    // 상수 정의
    const STORAGE_KEY = 'layout_preferences';
    const DEFAULT_BREAKPOINTS = {
        mobile: 768,
        tablet: 992
    };
    
    // 레이아웃 환경설정 기본값
    const DEFAULT_PREFERENCES = {
        sidebarExpanded: true,
        darkMode: false,
        fontSize: 'medium'
    };
    
    // 모듈 내부 상태
    let _preferences = null;
    let _resizeTimer = null;
    let _isInitialized = false;
    
    /**
     * 로컬 스토리지에서 레이아웃 환경설정 로드
     * @returns {Object} 저장된 레이아웃 환경설정
     */
    function _loadPreferences() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('레이아웃 환경설정을 로드하는 중 오류 발생:', error);
        }
        return { ...DEFAULT_PREFERENCES };
    }
    
    /**
     * 화면 크기에 따라 레이아웃 자동 조정
     * @param {Object} options - 레이아웃 조정 옵션
     * @param {number} options.mobileBreakpoint - 모바일 기준점 (픽셀)
     * @param {number} options.tabletBreakpoint - 태블릿 기준점 (픽셀)
     * @param {Function} options.onAdjust - 레이아웃 조정 시 호출될 콜백 함수
     */
    function adjustLayout(options = {}) {
        const { 
            mobileBreakpoint = DEFAULT_BREAKPOINTS.mobile, 
            tabletBreakpoint = DEFAULT_BREAKPOINTS.tablet,
            onAdjust = null
        } = options;
        
        const width = window.innerWidth;
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('main-content');
        
        if (!sidebar || !mainContent) {
            return; // 필요한 요소가 없으면 실행하지 않음
        }
        
        // 화면 크기에 따른 레이아웃 조정
        if (width < mobileBreakpoint) {
            // 모바일 화면에서는 사이드바 숨김
            sidebar.classList.add('collapsed');
            sidebar.classList.add('mobile');
            mainContent.classList.add('expanded');
            _preferences.sidebarExpanded = false;
        } else if (width < tabletBreakpoint) {
            // 태블릿 화면에서는 상태 유지하되 모바일 클래스 제거
            sidebar.classList.remove('mobile');
            if (!_preferences.sidebarExpanded) {
                sidebar.classList.add('collapsed');
                mainContent.classList.add('expanded');
            } else {
                sidebar.classList.remove('collapsed');
                mainContent.classList.remove('expanded');
            }
        } else {
            // 데스크톱 화면에서는 환경설정에 따라 조정
            sidebar.classList.remove('mobile');
            if (!_preferences.sidebarExpanded) {
                sidebar.classList.add('collapsed');
                mainContent.classList.add('expanded');
            } else {
                sidebar.classList.remove('collapsed');
                mainContent.classList.remove('expanded');
            }
        }
        
        // 조정 후 콜백 실행
        if (typeof onAdjust === 'function') {
            onAdjust(width, _preferences);
        }
    }
    
    /**
     * 사이드바 토글 (열기/닫기)
     * @param {Object} options - 토글 옵션
     * @param {string} options.action - 'open', 'close' 또는 'toggle' (기본값)
     * @param {boolean} options.saveState - 상태 저장 여부 (기본값: true)
     * @param {boolean} options.adjustContent - 메인 콘텐츠 영역 조정 여부 (기본값: true)
     * @returns {boolean} 토글 후 사이드바가 열려있는지 여부
     */
    function toggleSidebar(options = {}) {
        const { 
            action = 'toggle', 
            saveState = true,
            adjustContent = true
        } = options;
        
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('main-content');
        
        if (!sidebar) {
            return false;
        }
        
        let isExpanded = !sidebar.classList.contains('collapsed');
        
        // 액션에 따른 처리
        switch (action) {
            case 'open':
                isExpanded = true;
                sidebar.classList.remove('collapsed');
                if (adjustContent && mainContent) {
                    mainContent.classList.remove('expanded');
                }
                break;
            case 'close':
                isExpanded = false;
                sidebar.classList.add('collapsed');
                if (adjustContent && mainContent) {
                    mainContent.classList.add('expanded');
                }
                break;
            case 'toggle':
            default:
                isExpanded = !isExpanded;
                sidebar.classList.toggle('collapsed');
                if (adjustContent && mainContent) {
                    mainContent.classList.toggle('expanded');
                }
                break;
        }
        
        // 상태 저장
        if (saveState) {
            _preferences.sidebarExpanded = isExpanded;
            saveLayoutPreferences();
        }
        
        return isExpanded;
    }
    
    /**
     * 현재 레이아웃 환경설정을 로컬 스토리지에 저장
     */
    function saveLayoutPreferences() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(_preferences));
        } catch (error) {
            console.error('레이아웃 환경설정을 저장하는 중 오류 발생:', error);
        }
    }
    
    /**
     * 다크 모드 토글
     * @param {boolean|null} enable - true: 활성화, false: 비활성화, null: 토글
     * @returns {boolean} 토글 후 다크 모드 활성화 여부
     */
    function toggleDarkMode(enable = null) {
        const bodyElement = document.body;
        
        if (enable === null) {
            enable = !_preferences.darkMode;
        }
        
        if (enable) {
            bodyElement.classList.add('dark-mode');
        } else {
            bodyElement.classList.remove('dark-mode');
        }
        
        _preferences.darkMode = enable;
        saveLayoutPreferences();
        
        return enable;
    }
    
    /**
     * 폰트 크기 변경
     * @param {string} size - 'small', 'medium', 'large' 중 하나
     */
    function setFontSize(size) {
        if (!['small', 'medium', 'large'].includes(size)) {
            console.error('유효하지 않은 폰트 크기:', size);
            return;
        }
        
        const bodyElement = document.body;
        
        // 기존 폰트 크기 클래스 제거
        bodyElement.classList.remove('font-small', 'font-medium', 'font-large');
        
        // 새 폰트 크기 클래스 추가
        bodyElement.classList.add(`font-${size}`);
        
        _preferences.fontSize = size;
        saveLayoutPreferences();
    }
    
    /**
     * 레이아웃 유틸리티 초기화
     * @param {Object} options - 초기화 옵션
     */
    function init(options = {}) {
        if (_isInitialized) return;
        
        // 레이아웃 환경설정 로드
        _preferences = _loadPreferences();
        
        // 다크 모드 초기화
        if (_preferences.darkMode) {
            document.body.classList.add('dark-mode');
        }
        
        // 폰트 크기 초기화
        document.body.classList.add(`font-${_preferences.fontSize}`);
        
        // 레이아웃 초기 조정
        adjustLayout(options);
        
        // 사이드바 토글 버튼 이벤트 등록
        const toggleButton = document.getElementById('sidebarToggle');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => toggleSidebar());
        }
        
        // 다크 모드 토글 버튼 이벤트 등록
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => toggleDarkMode());
            // 초기 상태 반영
            darkModeToggle.checked = _preferences.darkMode;
        }
        
        // 리사이즈 이벤트 처리
        window.addEventListener('resize', function() {
            clearTimeout(_resizeTimer);
            _resizeTimer = setTimeout(() => adjustLayout(options), 250);
        });
        
        // 언로드 시 이벤트 리스너 정리
        window.addEventListener('beforeunload', cleanup);
        
        _isInitialized = true;
    }
    
    /**
     * 사이드바 상태 복원 (호환성을 위한 별칭)
     * init() 함수가 이미 수행하므로 내부적으로 init를 호출
     */
    function restoreSidebarState() {
        if (!_isInitialized) {
            init();
        } else {
            // 이미 초기화된 경우 레이아웃만 재조정
            adjustLayout();
        }
    }
    
    /**
     * 이벤트 리스너 정리
     */
    function cleanup() {
        const toggleButton = document.getElementById('sidebarToggle');
        if (toggleButton) {
            toggleButton.removeEventListener('click', () => toggleSidebar());
        }
        
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.removeEventListener('click', () => toggleDarkMode());
        }
        
        window.removeEventListener('resize', function() {
            clearTimeout(_resizeTimer);
            _resizeTimer = setTimeout(() => adjustLayout(), 250);
        });
        
        window.removeEventListener('beforeunload', cleanup);
    }
    
    // 자동 초기화 (DOMContentLoaded 이벤트 시)
    document.addEventListener('DOMContentLoaded', init);
    
    // 공개 API
    return {
        init,
        adjustLayout,
        toggleSidebar,
        restoreSidebarState,
        saveLayoutPreferences,
        toggleDarkMode,
        setFontSize,
        cleanup
    };
})();

window.LayoutUtils = LayoutUtils; 