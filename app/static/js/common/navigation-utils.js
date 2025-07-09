/**
 * NavigationUtils 모듈
 * 네비게이션 관련 유틸리티 함수를 제공하는 모듈입니다.
 * 네비게이션 메뉴 활성화, 반응형 조정, 메뉴 상태 관리 등의 기능을 포함합니다.
 * 
 * 함수 목록:
 * 
 * [1] 메뉴 상태 관리
 *   - setActiveMenu: URL 경로에 따라 메뉴 활성화
 *   - restoreActiveMenu: 저장된 메뉴 상태 복원
 *   - _applyActiveState: 메뉴 항목 활성화 (내부 함수)
 *   - _saveMenuState: 메뉴 상태 저장 (내부 함수)
 * 
 * [2] 네비게이션 UI 조정
 *   - adjustNavbar: 화면 크기에 따른 네비게이션 바 조정
 *   - initNavTooltips: 네비게이션 항목 툴팁 초기화
 */

const NavigationUtils = (function() {
  // ===== 메뉴 상태 관리 함수 =====
  
  /**
   * 현재 URL 경로에 따라 메뉴 항목의 active 상태를 설정합니다.
   * @param {string} navSelector - 네비게이션 메뉴 컨테이너 선택자
   * @param {string} [activeClass='active'] - 활성 상태를 나타내는 CSS 클래스
   * @param {boolean} [storeState=true] - 활성 메뉴 상태를 로컬 스토리지에 저장할지 여부
   */
  function setActiveMenu(navSelector, activeClass = 'active', storeState = true) {
    const navContainer = document.querySelector(navSelector);
    if (!navContainer) return;

    const currentPath = window.location.pathname;
    let activeMenuItem = null;

    // 모든 메뉴 항목에서 활성 클래스 제거
    const menuItems = navContainer.querySelectorAll('a');
    menuItems.forEach(item => {
      item.classList.remove(activeClass);
      
      // 현재 경로와 일치하는 메뉴 항목 찾기
      const itemPath = item.getAttribute('href');
      if (itemPath && currentPath.includes(itemPath) && 
          (itemPath !== '/' || currentPath === '/')) {
        // 더 구체적인 경로를 가진 항목을 선택 (더 긴 경로)
        if (!activeMenuItem || itemPath.length > activeMenuItem.getAttribute('href').length) {
          activeMenuItem = item;
        }
      }
    });

    // 일치하는 항목이 있으면 활성화
    if (activeMenuItem) {
      _applyActiveState(activeMenuItem, activeClass);
      
      // 상태 저장
      if (storeState) {
        _saveMenuState(currentPath);
      }
    }
  }
  
  /**
   * 로컬 스토리지에서 활성 메뉴 상태를 복원합니다.
   * @param {string} navSelector - 네비게이션 메뉴 컨테이너 선택자
   * @param {string} [activeClass='active'] - 활성 상태를 나타내는 CSS 클래스
   */
  function restoreActiveMenu(navSelector, activeClass = 'active') {
    const storedPath = localStorage.getItem('activeMenuPath');
    if (storedPath) {
      const navContainer = document.querySelector(navSelector);
      if (!navContainer) return;
      
      const menuItems = navContainer.querySelectorAll('a');
      let bestMatch = null;
      let maxMatchLength = 0;
      
      menuItems.forEach(item => {
        const itemPath = item.getAttribute('href');
        if (itemPath && storedPath.includes(itemPath) && itemPath.length > maxMatchLength) {
          bestMatch = item;
          maxMatchLength = itemPath.length;
        }
      });
      
      if (bestMatch) {
        _applyActiveState(bestMatch, activeClass);
      }
    }
  }
  
  /**
   * 메뉴 항목에 활성 상태를 적용합니다.
   * @param {Element} menuItem - 활성화할 메뉴 항목 엘리먼트
   * @param {string} activeClass - 활성 상태를 나타내는 CSS 클래스
   * @private
   */
  function _applyActiveState(menuItem, activeClass) {
    // 선택된 항목 활성화
    menuItem.classList.add(activeClass);
    
    // 부모 li 요소가 있다면 해당 요소도 활성화
    const parentLi = menuItem.closest('li');
    if (parentLi) {
      parentLi.classList.add(activeClass);
    }
    
    // 드롭다운 메뉴인 경우 부모 드롭다운도 활성화
    const parentDropdown = menuItem.closest('.dropdown-menu');
    if (parentDropdown) {
      const dropdownToggle = parentDropdown.previousElementSibling;
      if (dropdownToggle && dropdownToggle.classList.contains('dropdown-toggle')) {
        dropdownToggle.classList.add(activeClass);
      }
    }
  }
  
  /**
   * 현재 메뉴 상태를 로컬 스토리지에 저장합니다.
   * @param {string} path - 저장할 경로
   * @private
   */
  function _saveMenuState(path) {
    localStorage.setItem('activeMenuPath', path);
  }
  
  // ===== 네비게이션 UI 조정 함수 =====
  
  /**
   * 화면 크기에 따라 네비게이션 바 스타일을 조정합니다.
   * @param {string} navbarSelector - 네비게이션 바 선택자
   * @param {Object} [options] - 조정 옵션
   * @param {string} [options.collapsedClass='navbar-collapsed'] - 축소된 상태의 클래스
   * @param {number} [options.breakpoint=768] - 반응형 중단점 (픽셀)
   * @returns {Function} 정리 함수
   */
  function adjustNavbar(navbarSelector, options = {}) {
    const navbar = document.querySelector(navbarSelector);
    if (!navbar) return;
    
    const defaults = {
      collapsedClass: 'navbar-collapsed',
      breakpoint: 768
    };
    
    const settings = {...defaults, ...options};
    
    function updateNavbar() {
      if (window.innerWidth <= settings.breakpoint) {
        navbar.classList.add(settings.collapsedClass);
      } else {
        navbar.classList.remove(settings.collapsedClass);
      }
    }
    
    // 초기 실행
    updateNavbar();
    
    // 이벤트 리스너 등록 (기존 리스너 제거 후)
    window.removeEventListener('resize', updateNavbar);
    window.addEventListener('resize', updateNavbar);
    
    // 리소스 해제를 위한 정리 함수 반환
    return function cleanup() {
      window.removeEventListener('resize', updateNavbar);
    };
  }
  
  /**
   * 네비게이션 항목에 툴팁을 추가합니다.
   * @param {string} navItemSelector - 네비게이션 항목 선택자
   * @param {Object} [options] - 툴팁 옵션
   * @param {string} [options.placement='bottom'] - 툴팁 위치
   * @param {string} [options.trigger='hover'] - 툴팁 트리거 방식
   * @param {string} [options.titleAttr='data-title'] - 툴팁 제목을 가져올 속성
   */
  function initNavTooltips(navItemSelector, options = {}) {
    const defaults = {
      placement: 'bottom',
      trigger: 'hover',
      titleAttr: 'data-title'
    };
    
    const settings = {...defaults, ...options};
    
    const navItems = document.querySelectorAll(navItemSelector);
    
    navItems.forEach(item => {
      const title = item.getAttribute(settings.titleAttr) || item.textContent.trim();
      
      if (title && typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        new bootstrap.Tooltip(item, {
          placement: settings.placement,
          trigger: settings.trigger,
          title: title
        });
      } else if (title) {
        // Bootstrap이 없는 경우 기본 title 속성 사용
        item.setAttribute('title', title);
      }
    });
  }
  
  // 공개 API
  return {
    setActiveMenu,
    restoreActiveMenu,
    adjustNavbar,
    initNavTooltips
  };
})();

// 전역 변수로 설정
window.NavigationUtils = NavigationUtils; 