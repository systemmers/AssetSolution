/**
 * 인증 모듈 메인 관리자
 * 모든 Auth 관련 기능을 통합 관리
 * 
 * @class AuthManager
 * @description Auth 모듈의 중앙 관리자
 * 
 * 주요 기능:
 * - 사용자 프로필 관리
 * - 세션 상태 관리
 * - 권한 확인 및 처리
 * - 보안 관련 유틸리티
 */

import AuthProfile from './auth-profile.js';
import UIUtils from '../../../common/ui-utils.js';

class AuthManager {
    /**
     * AuthManager 클래스 생성자
     * @param {Object} config 설정 옵션
     */
    constructor(config = {}) {
        this.config = {
            // 페이지 타입 설정
            pageType: 'profile', // profile, login, register 등
            
            // 전역 설정
            globalSettings: {
                enableSessionCheck: true,
                sessionCheckInterval: 5 * 60 * 1000, // 5분
                enableActivityTracking: true,
                autoLogoutTime: 30 * 60 * 1000, // 30분
                enableKeyboardShortcuts: true
            },
            
            // 모듈별 설정
            modules: {
                profile: {}
            },
            
            // 세션 관리
            session: {
                storageKey: 'user_session',
                tokenKey: 'auth_token',
                lastActivityKey: 'last_activity'
            },
            
            ...config
        };
        
        // 모듈 인스턴스
        this.modules = {
            profile: null
        };
        
        // 상태 관리
        this.state = {
            initialized: false,
            user: null,
            isAuthenticated: false,
            lastActivity: null,
            sessionTimer: null,
            activityTimer: null
        };
        
        this.cleanupFunctions = [];
        
        this.initialize();
    }
    
    /**
     * AuthManager 초기화
     */
    initialize() {
        if (this.state.initialized) {
            console.warn('AuthManager가 이미 초기화되었습니다.');
            return;
        }
        
        // 페이지 타입 자동 감지
        this._detectPageType();
        
        // 세션 상태 확인
        this._checkSessionStatus();
        
        // 페이지별 모듈 초기화
        this._initializePageSpecificModule();
        
        // 전역 이벤트 설정
        this._setupGlobalEvents();
        
        // 세션 관리 시작
        if (this.config.globalSettings.enableSessionCheck) {
            this._startSessionManagement();
        }
        
        // 활동 추적 시작
        if (this.config.globalSettings.enableActivityTracking) {
            this._startActivityTracking();
        }
        
        // 키보드 단축키 설정
        if (this.config.globalSettings.enableKeyboardShortcuts) {
            this._setupKeyboardShortcuts();
        }
        
        this.state.initialized = true;
        
        console.log('AuthManager 초기화 완료 - 페이지 타입:', this.config.pageType);
    }
    
    /**
     * 페이지 타입 자동 감지
     */
    _detectPageType() {
        const path = window.location.pathname;
        
        if (path.includes('/auth/profile')) {
            this.config.pageType = 'profile';
        } else if (path.includes('/auth/login')) {
            this.config.pageType = 'login';
        } else if (path.includes('/auth/register')) {
            this.config.pageType = 'register';
        } else {
            this.config.pageType = 'profile'; // 기본값
        }
    }
    
    /**
     * 세션 상태 확인
     */
    _checkSessionStatus() {
        const token = localStorage.getItem(this.config.session.tokenKey);
        const lastActivity = localStorage.getItem(this.config.session.lastActivityKey);
        
        if (token && lastActivity) {
            const timeSinceActivity = Date.now() - parseInt(lastActivity);
            
            if (timeSinceActivity < this.config.globalSettings.autoLogoutTime) {
                this.state.isAuthenticated = true;
                this.state.lastActivity = parseInt(lastActivity);
                this._updateLastActivity();
            } else {
                this._handleSessionExpired();
            }
        }
    }
    
    /**
     * 페이지별 모듈 초기화
     */
    _initializePageSpecificModule() {
        switch (this.config.pageType) {
            case 'profile':
                this._initializeProfileModule();
                break;
        }
    }
    
    /**
     * 프로필 모듈 초기화
     */
    _initializeProfileModule() {
        this.modules.profile = new AuthProfile({
            ...this.config.modules.profile
        });
        
        // 사용자 정보 동기화
        if (this.modules.profile.getCurrentUser) {
            this.state.user = this.modules.profile.getCurrentUser();
        }
    }
    
    /**
     * 전역 이벤트 설정
     */
    _setupGlobalEvents() {
        // 페이지 언로드 이벤트
        const handleBeforeUnload = () => {
            this._updateLastActivity();
            this.destroy();
        };
        
        window.addEventListener('beforeunload', handleBeforeUnload);
        this.cleanupFunctions.push(() => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        });
        
        // 온라인/오프라인 상태 감지
        const handleOnline = () => {
            UIUtils.showAlert('네트워크 연결이 복구되었습니다.', 'success', 3000);
        };
        
        const handleOffline = () => {
            UIUtils.showAlert('네트워크 연결이 끊어졌습니다. 일부 기능이 제한될 수 있습니다.', 'warning', 5000);
        };
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        this.cleanupFunctions.push(() => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        });
        
        // 사용자 활동 감지 이벤트
        const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        const handleUserActivity = () => {
            this._updateLastActivity();
        };
        
        activityEvents.forEach(event => {
            document.addEventListener(event, handleUserActivity, true);
        });
        
        this.cleanupFunctions.push(() => {
            activityEvents.forEach(event => {
                document.removeEventListener(event, handleUserActivity, true);
            });
        });
    }
    
    /**
     * 세션 관리 시작
     */
    _startSessionManagement() {
        this.state.sessionTimer = setInterval(() => {
            this._checkSessionValidity();
        }, this.config.globalSettings.sessionCheckInterval);
    }
    
    /**
     * 활동 추적 시작
     */
    _startActivityTracking() {
        this.state.activityTimer = setInterval(() => {
            this._checkUserActivity();
        }, 60000); // 1분마다 체크
    }
    
    /**
     * 키보드 단축키 설정
     */
    _setupKeyboardShortcuts() {
        const handleKeydown = (e) => {
            // Ctrl/Cmd + 키 조합만 처리
            if (!(e.ctrlKey || e.metaKey)) return;
            
            switch (e.key.toLowerCase()) {
                case 'p': // Ctrl+P: 프로필 편집
                    if (this.config.pageType === 'profile') {
                        e.preventDefault();
                        const editBtn = document.querySelector('#editProfileBtn');
                        if (editBtn) editBtn.click();
                    }
                    break;
                    
                case 's': // Ctrl+S: 저장
                    if (this.config.pageType === 'profile') {
                        e.preventDefault();
                        const saveBtn = document.querySelector('#saveProfileBtn');
                        if (saveBtn) saveBtn.click();
                    }
                    break;
                    
                case 'k': // Ctrl+K: 비밀번호 변경
                    if (this.config.pageType === 'profile') {
                        e.preventDefault();
                        const passwordBtn = document.querySelector('[data-bs-target="#passwordModal"]');
                        if (passwordBtn) passwordBtn.click();
                    }
                    break;
            }
        };
        
        document.addEventListener('keydown', handleKeydown);
        this.cleanupFunctions.push(() => {
            document.removeEventListener('keydown', handleKeydown);
        });
    }
    
    /**
     * 세션 유효성 검사
     */
    _checkSessionValidity() {
        if (!this.state.isAuthenticated) return;
        
        const lastActivity = this.state.lastActivity;
        const currentTime = Date.now();
        
        if (currentTime - lastActivity > this.config.globalSettings.autoLogoutTime) {
            this._handleSessionExpired();
        }
    }
    
    /**
     * 사용자 활동 검사
     */
    _checkUserActivity() {
        if (!this.state.isAuthenticated) return;
        
        const lastActivity = this.state.lastActivity;
        const currentTime = Date.now();
        const warningTime = this.config.globalSettings.autoLogoutTime - (5 * 60 * 1000); // 로그아웃 5분 전
        
        if (currentTime - lastActivity > warningTime) {
            this._showSessionWarning();
        }
    }
    
    /**
     * 마지막 활동 시간 업데이트
     */
    _updateLastActivity() {
        this.state.lastActivity = Date.now();
        localStorage.setItem(this.config.session.lastActivityKey, this.state.lastActivity.toString());
    }
    
    /**
     * 세션 만료 처리
     */
    _handleSessionExpired() {
        this.state.isAuthenticated = false;
        this.state.user = null;
        
        // 세션 정보 삭제
        localStorage.removeItem(this.config.session.tokenKey);
        localStorage.removeItem(this.config.session.lastActivityKey);
        
        UIUtils.showAlert('세션이 만료되었습니다. 다시 로그인해주세요.', 'warning', 5000);
        
        // 로그인 페이지로 이동
        setTimeout(() => {
            window.location.href = '/auth/login';
        }, 2000);
    }
    
    /**
     * 세션 만료 경고 표시
     */
    _showSessionWarning() {
        UIUtils.showConfirmDialog({
            title: '세션 만료 경고',
            message: '5분 후 자동으로 로그아웃됩니다. 계속 사용하시겠습니까?',
            confirmText: '계속 사용',
            cancelText: '로그아웃',
            onConfirm: () => {
                this._updateLastActivity();
                UIUtils.showAlert('세션이 연장되었습니다.', 'success', 3000);
            },
            onCancel: () => {
                this._handleSessionExpired();
            }
        });
    }
    
    /**
     * 사용자 정보 반환
     * @returns {Object|null} 현재 사용자 정보
     */
    getCurrentUser() {
        return this.state.user;
    }
    
    /**
     * 인증 상태 확인
     * @returns {boolean} 인증 여부
     */
    isAuthenticated() {
        return this.state.isAuthenticated;
    }
    
    /**
     * 로그아웃 처리
     */
    async logout() {
        try {
            // 서버에 로그아웃 요청 (필요한 경우)
            // await ApiUtils.post('/api/auth/logout');
            
            this.state.isAuthenticated = false;
            this.state.user = null;
            
            // 로컬 스토리지 정리
            localStorage.removeItem(this.config.session.tokenKey);
            localStorage.removeItem(this.config.session.lastActivityKey);
            
            UIUtils.showAlert('로그아웃되었습니다.', 'info', 3000);
            
            // 로그인 페이지로 이동
            setTimeout(() => {
                window.location.href = '/auth/login';
            }, 1500);
            
        } catch (error) {
            console.error('로그아웃 처리 오류:', error);
            UIUtils.showAlert('로그아웃 처리 중 오류가 발생했습니다.', 'warning', 3000);
        }
    }
    
    /**
     * 모듈 간 통신
     * @param {string} targetModule 대상 모듈
     * @param {string} method 호출할 메서드
     * @param {...*} args 인자들
     */
    communicate(targetModule, method, ...args) {
        const module = this.modules[targetModule];
        
        if (module && typeof module[method] === 'function') {
            return module[method](...args);
        } else {
            console.warn(`모듈 통신 실패: ${targetModule}.${method}를 찾을 수 없습니다.`);
        }
    }
    
    /**
     * 현재 상태 반환
     * @returns {Object} 현재 상태
     */
    getState() {
        return { ...this.state };
    }
    
    /**
     * 리소스 정리
     */
    destroy() {
        // 타이머 정리
        if (this.state.sessionTimer) {
            clearInterval(this.state.sessionTimer);
            this.state.sessionTimer = null;
        }
        
        if (this.state.activityTimer) {
            clearInterval(this.state.activityTimer);
            this.state.activityTimer = null;
        }
        
        // 모듈 정리
        Object.values(this.modules).forEach(module => {
            if (module && typeof module.destroy === 'function') {
                module.destroy();
            }
        });
        
        // 이벤트 리스너 정리
        this.cleanupFunctions.forEach(cleanup => {
            if (typeof cleanup === 'function') {
                cleanup();
            }
        });
        
        // 상태 초기화
        this.modules = {};
        this.cleanupFunctions = [];
        this.state.initialized = false;
        
        console.log('AuthManager 리소스 정리 완료');
    }
}

export default AuthManager; 