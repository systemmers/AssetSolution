/**
 * 사용자 프로필 페이지 JavaScript 기능
 * AuthProfile 모듈을 사용하여 리팩토링됨
 */

import AuthProfile from './core/auth-profile.js';

// 전역 authProfile 인스턴스
let authProfile = null;

document.addEventListener('DOMContentLoaded', function() {
    // AuthProfile 초기화
    authProfile = new AuthProfile({
        // 필요한 경우 추가 설정 제공
        validation: {
            minPasswordLength: 8,
            passwordPattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
        }
    });
    
    // DOM 언로드 시 리소스 정리
    window.addEventListener('beforeunload', cleanupEventListeners);
});

/**
 * 페이지 언로드 시 이벤트 리스너 정리
 * 메모리 누수 방지를 위한 정리 작업 수행
 */
function cleanupEventListeners() {
    if (authProfile) {
        authProfile.destroy();
        authProfile = null;
    }
    
    console.log('사용자 프로필 페이지 이벤트 리스너 정리');
} 