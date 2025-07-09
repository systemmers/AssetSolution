/**
 * 스타일 가이드 페이지 JavaScript
 * 실시간 스타일 변경, 반응형 테스트, 네비게이션, 다크모드 기능 제공
 */

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeDemo();
    
    // 전역 함수들을 명시적으로 등록
    window.toggleTheme = toggleTheme;
    window.setViewport = setViewport;
    window.updateCSSVariable = updateCSSVariable;
    
    console.log('전역 함수 등록 완료:', {
        toggleTheme: typeof window.toggleTheme,
        setViewport: typeof window.setViewport,
        updateCSSVariable: typeof window.updateCSSVariable
    });
});

/**
 * 데모 페이지 초기화
 */
function initializeDemo() {
    initializeTheme();
    initializeNavigation();
    initializeViewportControls();
    initializeColorControls();
    initializeSmoothScroll();
    
    console.log('스타일 가이드 페이지가 초기화되었습니다.');
}

/**
 * 테마 초기화
 */
function initializeTheme() {
    // 저장된 테마 확인, 기본값은 라이트 모드
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // 아이콘 설정
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    console.log(`테마 초기화: ${savedTheme} 모드`);
}

/**
 * 다크 모드 토글
 */
function toggleTheme() {
    const htmlElement = document.documentElement;
    const currentTheme = htmlElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    console.log(`=== 테마 토글 시작 ===`);
    console.log(`현재 테마: ${currentTheme} → 새 테마: ${newTheme}`);
    
    // HTML 요소에 data-theme 속성 설정
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    console.log(`HTML data-theme 설정 완료: ${htmlElement.getAttribute('data-theme')}`);
    
    // 아이콘 변경
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        const newIconClass = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        themeIcon.className = newIconClass;
        console.log(`아이콘 변경 완료: ${newIconClass}`);
    } else {
        console.error('❌ 테마 아이콘을 찾을 수 없습니다!');
    }
    
    // DOM 강제 리플로우 트리거
    htmlElement.offsetHeight;
    
    // CSS 변수 실제 적용 상태 확인
    setTimeout(() => {
        const rootStyles = getComputedStyle(htmlElement);
        const bodyStyles = getComputedStyle(document.body);
        
        console.log('=== CSS 변수 확인 ===');
        console.log('Root CSS 변수:', {
            'bg-primary': rootStyles.getPropertyValue('--bg-primary').trim(),
            'text-primary': rootStyles.getPropertyValue('--text-primary').trim(),
            'card-bg': rootStyles.getPropertyValue('--card-bg').trim()
        });
        
        console.log('Body 스타일:', {
            'background-color': bodyStyles.backgroundColor,
            'color': bodyStyles.color
        });
        
        // HTML 클래스와 속성 확인
        console.log('HTML 요소 상태:', {
            'data-theme': htmlElement.getAttribute('data-theme'),
            'class': htmlElement.className,
            'style': htmlElement.getAttribute('style')
        });
        
        // 실제 다크모드 CSS 선택자 매치 확인
        const isDarkMatched = htmlElement.matches('[data-theme="dark"]');
        console.log(`다크모드 CSS 선택자 매치: ${isDarkMatched}`);
        
        console.log(`=== 테마 토글 완료 ===`);
    }, 100);
    
    // 알림 표시
    showNotification(`${newTheme === 'dark' ? '다크' : '라이트'} 모드로 변경되었습니다.`, 'info');
}

// 전역 함수로 등록
window.toggleTheme = toggleTheme;

/**
 * 네비게이션 초기화
 */
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.demo-nav-link');
    
    // 스크롤 시 현재 섹션 하이라이트
    window.addEventListener('scroll', function() {
        let current = '';
        const sections = document.querySelectorAll('.demo-section');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
}

/**
 * 부드러운 스크롤 초기화
 */
function initializeSmoothScroll() {
    const navLinks = document.querySelectorAll('.demo-nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * 뷰포트 변경 함수
 */
function setViewport(size) {
    const body = document.body;
    
    // 뷰포트 클래스 제거
    body.classList.remove('viewport-mobile', 'viewport-tablet', 'viewport-desktop');
    
    switch(size) {
        case 'mobile':
            body.classList.add('viewport-mobile');
            showNotification('모바일 뷰 (375px)', 'info');
            break;
        case 'tablet':
            body.classList.add('viewport-tablet');
            showNotification('태블릿 뷰 (768px)', 'info');
            break;
        case 'desktop':
            body.classList.add('viewport-desktop');
            showNotification('데스크톱 뷰 (1200px)', 'info');
            break;
        case 'auto':
        default:
            showNotification('자동 뷰포트', 'success');
            break;
    }
}

/**
 * 뷰포트 컨트롤 초기화
 */
function initializeViewportControls() {
    // 뷰포트 함수를 전역으로 등록
    window.setViewport = setViewport;
}

/**
 * CSS 변수 실시간 변경 함수
 */
function updateCSSVariable(property, value) {
    document.documentElement.style.setProperty(property, value);
    showNotification(`${property} 색상이 ${value}로 변경되었습니다.`, 'success');
    
    // 색상 팔레트의 값도 업데이트
    updateColorPaletteDisplay(property, value);
}

/**
 * 색상 컨트롤 초기화
 */
function initializeColorControls() {
    // CSS 변수 실시간 변경 함수를 전역으로 등록
    window.updateCSSVariable = updateCSSVariable;
}

/**
 * 색상 팔레트 디스플레이 업데이트
 */
function updateColorPaletteDisplay(property, value) {
    const colorItems = document.querySelectorAll('.color-item');
    
    colorItems.forEach(item => {
        const varElement = item.querySelector('.color-var');
        if (varElement && varElement.textContent === property) {
            const valueElement = item.querySelector('.color-value');
            if (valueElement) {
                valueElement.textContent = value;
            }
            // 배경색도 업데이트
            item.style.background = value;
        }
    });
}

/**
 * 알림 표시 함수
 */
function showNotification(message, type = 'info') {
    // 기존 알림 제거
    const existingNotification = document.querySelector('.demo-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 새 알림 생성
    const notification = document.createElement('div');
    notification.className = `demo-notification alert alert-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        animation: slideInRight 0.3s ease-out;
    `;
    notification.innerHTML = `
        <strong>${type === 'success' ? '성공!' : type === 'warning' ? '주의!' : '정보!'}</strong>
        ${message}
        <button type="button" class="btn-close" aria-label="Close" onclick="this.parentElement.remove()"></button>
    `;
    
    document.body.appendChild(notification);
    
    // 3초 후 자동 제거
    setTimeout(() => {
        if (notification && notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 3000);
}

/**
 * 컴포넌트 코드 표시 토글
 */
function toggleCode(button) {
    const codeElement = button.nextElementSibling;
    if (codeElement && codeElement.classList.contains('demo-code')) {
        const isVisible = codeElement.style.display !== 'none';
        codeElement.style.display = isVisible ? 'none' : 'block';
        button.textContent = isVisible ? '코드 보기' : '코드 숨기기';
    }
}

/**
 * CSS 변수 목록 가져오기 (API 사용)
 */
async function loadCSSVariables() {
    try {
        const response = await fetch('/demo/api/style-variables');
        const variables = await response.json();
        
        console.log('CSS 변수 로드됨:', variables);
        return variables;
    } catch (error) {
        console.error('CSS 변수 로드 실패:', error);
        return null;
    }
}

/**
 * 현재 CSS 변수 값들을 콘솔에 출력 (디버깅용)
 */
function logCurrentCSSVariables() {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    
    const variables = [
        '--color-primary',
        '--color-success',
        '--color-warning',
        '--color-danger',
        '--color-info',
        '--font-size-xs',
        '--font-size-sm',
        '--font-size-base',
        '--font-size-lg',
        '--font-size-xl',
        '--font-size-2xl',
        '--font-size-3xl'
    ];
    
    console.group('현재 CSS 변수 값들');
    variables.forEach(variable => {
        const value = computedStyle.getPropertyValue(variable).trim();
        if (value) {
            console.log(`${variable}: ${value}`);
        }
    });
    console.groupEnd();
}

/**
 * 페이지 성능 측정
 */
function measurePagePerformance() {
    if ('performance' in window) {
        const perfData = performance.getEntriesByType('navigation')[0];
        
        console.group('페이지 성능 측정');
        console.log(`DOM 로드 시간: ${perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart}ms`);
        console.log(`전체 로드 시간: ${perfData.loadEventEnd - perfData.loadEventStart}ms`);
        console.log(`페이지 크기: ${perfData.transferSize} bytes`);
        console.groupEnd();
    }
}

// 개발자 도구용 전역 함수들
window.demoUtils = {
    logCurrentCSSVariables,
    measurePagePerformance,
    loadCSSVariables,
    showNotification
};

// CSS 애니메이션 정의 (동적 추가)
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .demo-notification {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border: none;
    }
    
    .demo-notification .btn-close {
        background: none;
        border: none;
        font-size: 1.2rem;
        opacity: 0.7;
        cursor: pointer;
        padding: 0;
        margin-left: 1rem;
    }
    
    .demo-notification .btn-close:hover {
        opacity: 1;
    }
`;
document.head.appendChild(style); 