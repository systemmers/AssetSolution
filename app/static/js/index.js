/**
 * 자산관리 시스템 메인 진입점 JavaScript 파일
 * 공통 모듈을 사용하여 전체 애플리케이션에 필요한 기본 기능을 초기화합니다.
 */

// 공통 모듈은 전역 변수로 사용
// UIUtils, NavigationUtils, LayoutUtils, FormUtils, TableUtils는 각각의 파일에서 전역으로 설정됨

// 이벤트 리스너 정리를 위한 정리 함수 배열
const cleanupFunctions = [];

// 페이지 로드 시 실행되는 기본 초기화 함수
document.addEventListener('DOMContentLoaded', function() {
    console.log('자산관리 시스템 초기화 중...');
    
    // 기본 UI 컴포넌트 초기화
    const uiCleanup = initializeUIComponents();
    if (uiCleanup) cleanupFunctions.push(uiCleanup);
    
    // 네비게이션 관련 기능 초기화
    const navCleanup = initializeNavigation();
    if (navCleanup) cleanupFunctions.push(navCleanup);
    
    // 레이아웃 관련 기능 초기화
    const layoutCleanup = initializeLayout();
    if (layoutCleanup) cleanupFunctions.push(layoutCleanup);
    
    // 공통 테이블 기능 초기화
    const tableCleanup = initializeTables();
    if (tableCleanup) cleanupFunctions.push(tableCleanup);
    
    // 공통 폼 기능 초기화
    const formCleanup = initializeForms();
    if (formCleanup) cleanupFunctions.push(formCleanup);
    
    console.log('자산관리 시스템 초기화 완료');
    
    // 페이지 언로드 시 리소스 정리
    window.addEventListener('beforeunload', cleanupResources);
});

/**
 * 기본 UI 컴포넌트 초기화
 * @returns {Function} 이벤트 리스너 정리 함수
 */
function initializeUIComponents() {
    // 토스트 메시지 초기화
    UIUtils.initToasts();
    
    // 툴팁 초기화
    UIUtils.initTooltips();
    
    // 모든 팝오버 초기화
    UIUtils.initPopovers();
    
    // 반응형 버튼 텍스트 관리
    UIUtils.handleResponsiveButtons();
    
    // 창 크기 변경 시 반응형 버튼 텍스트 업데이트
    const handleResize = () => UIUtils.handleResponsiveButtons();
    window.addEventListener('resize', handleResize);
    
    // 정리 함수 반환
    return function cleanup() {
        window.removeEventListener('resize', handleResize);
    };
}

/**
 * 네비게이션 관련 기능 초기화
 * @returns {Function} 이벤트 리스너 정리 함수
 */
function initializeNavigation() {
    // 현재 URL에 따른 메뉴 활성화
    NavigationUtils.setActiveMenu('.navbar-nav, .sidebar-nav', 'active', true);
    
    // 브라우저 히스토리 변경 시 메뉴 활성화 상태 업데이트
    const handlePopState = function() {
        NavigationUtils.setActiveMenu('.navbar-nav, .sidebar-nav', 'active', true);
    };
    
    window.addEventListener('popstate', handlePopState);
    
    // 반응형 네비게이션 조정
    NavigationUtils.adjustNavbar('#mainNavbar', {
        collapsedClass: 'navbar-collapsed',
        breakpoint: 992
    });
    
    // 네비게이션 툴팁 초기화
    NavigationUtils.initNavTooltips('.nav-link', {
        placement: 'right',
        trigger: 'hover'
    });
    
    // 정리 함수 반환
    return function cleanup() {
        window.removeEventListener('popstate', handlePopState);
    };
}

/**
 * 레이아웃 관련 기능 초기화
 * @returns {Function} 이벤트 리스너 정리 함수
 */
function initializeLayout() {
    const cleanupFunctions = [];
    
    // 레이아웃 조정 실행
    LayoutUtils.adjustLayout();
    
    // 사이드바 상태 복원
    LayoutUtils.restoreSidebarState();
    
    // 사이드바 토글 버튼 이벤트 설정
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        const toggleHandler = function(e) {
            e.preventDefault();
            LayoutUtils.toggleSidebar();
        };
        
        sidebarToggle.addEventListener('click', toggleHandler);
        cleanupFunctions.push(() => sidebarToggle.removeEventListener('click', toggleHandler));
    }
    
    // 정리 함수 반환
    return function cleanup() {
        cleanupFunctions.forEach(fn => typeof fn === 'function' && fn());
    };
}

/**
 * 공통 테이블 기능 초기화
 * @returns {Function} 이벤트 리스너 정리 함수
 */
function initializeTables() {
    const cleanupFunctions = [];
    
    // 정렬 가능한 테이블 초기화
    const sortingCleanup = TableUtils.initializeTableSorting({
        tableSelector: 'table.sortable',
        headerSelector: 'th[data-sort]'
    });
    
    if (sortingCleanup) cleanupFunctions.push(sortingCleanup);
    
    // 데이터 테이블 초기화 (jQuery DataTables 사용 시)
    let dataTables = [];
    if (typeof $.fn !== 'undefined' && typeof $.fn.DataTable !== 'undefined') {
        const tables = $('.data-table');
        tables.each(function() {
            const dataTable = $(this).DataTable({
                language: {
                    url: '//cdn.datatables.net/plug-ins/1.10.25/i18n/Korean.json'
                },
                responsive: true,
                stateSave: true
            });
            dataTables.push(dataTable);
        });
        
        // DataTable 인스턴스 정리 함수 추가
        if (dataTables.length > 0) {
            cleanupFunctions.push(() => {
                dataTables.forEach(table => {
                    if (table && typeof table.destroy === 'function') {
                        table.destroy();
                    }
                });
            });
        }
    }
    
    // 정리 함수 반환
    return cleanupFunctions.length > 0 ? function cleanup() {
        cleanupFunctions.forEach(fn => typeof fn === 'function' && fn());
    } : null;
}

/**
 * 공통 폼 기능 초기화
 * @returns {Function} 이벤트 리스너 정리 함수
 */
function initializeForms() {
    const cleanupFunctions = [];
    
    // 날짜 선택기 초기화
    const datePickerCleanup = FormUtils.initializeDatePickers('.datepicker');
    if (datePickerCleanup) cleanupFunctions.push(datePickerCleanup);
    
    // 폼 유효성 검사 초기화
    const validationCleanups = [];
    document.querySelectorAll('form.needs-validation').forEach(form => {
        const cleanup = FormUtils.validateForm(form, {
            onSubmit: true,
            showValidationFeedback: true
        });
        if (cleanup) validationCleanups.push(cleanup);
    });
    
    if (validationCleanups.length > 0) {
        cleanupFunctions.push(() => validationCleanups.forEach(fn => fn()));
    }
    
    // 자동 저장 폼 초기화
    const autoSaveCleanups = [];
    document.querySelectorAll('form.auto-save').forEach(form => {
        const cleanup = FormUtils.setupAutoSave(form, {
            interval: 30000, // 30초마다 자동 저장
            storageType: 'local', // localStorage 사용
            onSave: () => UIUtils.showAlert('임시 저장되었습니다.', 'info', 2000)
        });
        if (cleanup) autoSaveCleanups.push(cleanup);
    });
    
    if (autoSaveCleanups.length > 0) {
        cleanupFunctions.push(() => autoSaveCleanups.forEach(fn => fn()));
    }
    
    // 정리 함수 반환
    return cleanupFunctions.length > 0 ? function cleanup() {
        cleanupFunctions.forEach(fn => typeof fn === 'function' && fn());
    } : null;
}

/**
 * 페이지 언로드 시 리소스 정리
 */
function cleanupResources() {
    // 등록된 모든 cleanup 함수 실행
    cleanupFunctions.forEach(cleanup => {
        if (typeof cleanup === 'function') {
            cleanup();
        }
    });
    
    // 팝업 및 모달 정리
    UIUtils.cleanupModals();
    
    // 시간 간격 및 타이머 정리
    clearAllIntervals();
    
    console.log('자산관리 시스템 리소스 정리 완료');
}

/**
 * 모든 setInterval 정리
 */
function clearAllIntervals() {
    // 전역 인터벌 관리 변수가 있는 경우
    if (window.appIntervals && Array.isArray(window.appIntervals)) {
        window.appIntervals.forEach(interval => clearInterval(interval));
        window.appIntervals = [];
    }
} 