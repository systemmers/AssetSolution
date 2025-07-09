/**
 * 계약 모듈 메인 관리자
 * 모든 Contract 관련 기능을 통합 관리
 * 
 * @class ContractManager
 * @description Contract 모듈의 중앙 관리자
 * 
 * 주요 기능:
 * - 모듈 간 통신 및 상태 관리
 * - 전역 이벤트 처리
 * - 공통 설정 관리
 * - 리소스 최적화
 */

import ContractCore from './contract-core.js';
import ContractForm from './contract-form.js';
import ContractList from './contract-list.js';
import ContractDetail from './contract-detail.js';
import UIUtils from '../../../common/ui-utils.js';

class ContractManager {
    /**
     * ContractManager 클래스 생성자
     * @param {Object} config 설정 옵션
     */
    constructor(config = {}) {
        this.config = {
            // 페이지 타입 설정
            pageType: 'list', // list, detail, create, edit
            
            // 전역 설정
            globalSettings: {
                enableKeyboardShortcuts: true,
                enableAutoSave: false,
                enableRealTimeValidation: true,
                refreshInterval: null
            },
            
            // 모듈별 설정
            modules: {
                core: {},
                form: {},
                list: {},
                detail: {}
            },
            
            ...config
        };
        
        // 모듈 인스턴스
        this.modules = {
            core: null,
            form: null,
            list: null,
            detail: null
        };
        
        // 상태 관리
        this.state = {
            initialized: false,
            activeModule: null,
            currentContractId: null,
            isModified: false
        };
        
        this.cleanupFunctions = [];
        this.eventListeners = new Map();
        
        this.initialize();
    }
    
    /**
     * ContractManager 초기화
     */
    initialize() {
        if (this.state.initialized) {
            console.warn('ContractManager가 이미 초기화되었습니다.');
            return;
        }
        
        // 페이지 타입 자동 감지
        this._detectPageType();
        
        // 공통 모듈 초기화
        this._initializeCore();
        
        // 페이지별 모듈 초기화
        this._initializePageSpecificModule();
        
        // 전역 이벤트 설정
        this._setupGlobalEvents();
        
        // 키보드 단축키 설정
        if (this.config.globalSettings.enableKeyboardShortcuts) {
            this._setupKeyboardShortcuts();
        }
        
        this.state.initialized = true;
        
        console.log('ContractManager 초기화 완료 - 페이지 타입:', this.config.pageType);
    }
    
    /**
     * 페이지 타입 자동 감지
     */
    _detectPageType() {
        const path = window.location.pathname;
        const segments = path.split('/').filter(s => s);
        
        if (segments.includes('contract')) {
            const contractIndex = segments.indexOf('contract');
            const nextSegment = segments[contractIndex + 1];
            
            if (!nextSegment) {
                this.config.pageType = 'list';
            } else if (nextSegment === 'create') {
                this.config.pageType = 'create';
            } else if (nextSegment === 'edit') {
                this.config.pageType = 'edit';
                this.state.currentContractId = segments[contractIndex + 2];
            } else {
                this.config.pageType = 'detail';
                this.state.currentContractId = nextSegment;
            }
        }
    }
    
    /**
     * 공통 모듈 초기화
     */
    _initializeCore() {
        this.modules.core = new ContractCore(this.config.modules.core);
    }
    
    /**
     * 페이지별 모듈 초기화
     */
    _initializePageSpecificModule() {
        switch (this.config.pageType) {
            case 'list':
                this._initializeListModule();
                break;
            case 'create':
            case 'edit':
                this._initializeFormModule();
                break;
            case 'detail':
                this._initializeDetailModule();
                break;
        }
    }
    
    /**
     * 목록 모듈 초기화
     */
    _initializeListModule() {
        this.modules.list = new ContractList({
            ...this.config.modules.list,
            refreshInterval: this.config.globalSettings.refreshInterval
        });
        
        this.state.activeModule = 'list';
    }
    
    /**
     * 폼 모듈 초기화
     */
    _initializeFormModule() {
        this.modules.form = new ContractForm({
            mode: this.config.pageType,
            contractId: this.state.currentContractId,
            ...this.config.modules.form
        });
        
        this.state.activeModule = 'form';
        
        // 자동 저장 설정
        if (this.config.globalSettings.enableAutoSave) {
            this._setupAutoSave();
        }
    }
    
    /**
     * 상세 모듈 초기화
     */
    _initializeDetailModule() {
        this.modules.detail = new ContractDetail({
            contractId: this.state.currentContractId,
            ...this.config.modules.detail
        });
        
        this.state.activeModule = 'detail';
    }
    
    /**
     * 전역 이벤트 설정
     */
    _setupGlobalEvents() {
        // 페이지 언로드 이벤트
        const handleBeforeUnload = (e) => {
            if (this.state.isModified) {
                e.preventDefault();
                e.returnValue = '저장하지 않은 변경사항이 있습니다. 페이지를 떠나시겠습니까?';
            }
            
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
            UIUtils.showAlert('네트워크 연결이 끊어졌습니다.', 'warning', 5000);
        };
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        this.cleanupFunctions.push(() => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        });
    }
    
    /**
     * 키보드 단축키 설정
     */
    _setupKeyboardShortcuts() {
        const handleKeydown = (e) => {
            // Ctrl/Cmd + 키 조합만 처리
            if (!(e.ctrlKey || e.metaKey)) return;
            
            switch (e.key.toLowerCase()) {
                case 's': // Ctrl+S: 저장
                    if (this.config.pageType === 'create' || this.config.pageType === 'edit') {
                        e.preventDefault();
                        this._triggerSave();
                    }
                    break;
                    
                case 'n': // Ctrl+N: 새 계약 생성
                    if (this.config.pageType === 'list') {
                        e.preventDefault();
                        window.location.href = '/contract/create';
                    }
                    break;
                    
                case 'e': // Ctrl+E: 수정 모드
                    if (this.config.pageType === 'detail' && this.state.currentContractId) {
                        e.preventDefault();
                        window.location.href = `/contract/edit/${this.state.currentContractId}`;
                    }
                    break;
                    
                case 'l': // Ctrl+L: 목록으로 이동
                    if (this.config.pageType !== 'list') {
                        e.preventDefault();
                        window.location.href = '/contract';
                    }
                    break;
                    
                case 'f': // Ctrl+F: 검색 포커스
                    if (this.config.pageType === 'list') {
                        e.preventDefault();
                        const searchInput = document.querySelector('#searchForm input[type="text"], #searchForm input[type="search"]');
                        if (searchInput) {
                            searchInput.focus();
                        }
                    }
                    break;
            }
        };
        
        document.addEventListener('keydown', handleKeydown);
        this.cleanupFunctions.push(() => {
            document.removeEventListener('keydown', handleKeydown);
        });
        
        // 단축키 도움말 표시
        this._showKeyboardShortcutsHelp();
    }
    
    /**
     * 자동 저장 설정
     */
    _setupAutoSave() {
        if (this.config.pageType !== 'create' && this.config.pageType !== 'edit') return;
        
        let autoSaveTimer = null;
        
        const handleFormChange = () => {
            this.state.isModified = true;
            
            // 5초 후 자동 저장
            clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(() => {
                this._performAutoSave();
            }, 5000);
        };
        
        // 폼 필드 변경 감지
        const form = document.querySelector('#createForm, #editForm');
        if (form) {
            form.addEventListener('input', handleFormChange);
            form.addEventListener('change', handleFormChange);
            
            this.cleanupFunctions.push(() => {
                clearTimeout(autoSaveTimer);
                form.removeEventListener('input', handleFormChange);
                form.removeEventListener('change', handleFormChange);
            });
        }
    }
    
    /**
     * 저장 트리거
     */
    _triggerSave() {
        const form = document.querySelector('#createForm, #editForm');
        if (form) {
            form.dispatchEvent(new Event('submit', { bubbles: true }));
        }
    }
    
    /**
     * 자동 저장 실행
     */
    _performAutoSave() {
        if (!this.state.isModified) return;
        
        console.log('자동 저장 실행 중...');
        UIUtils.showAlert('자동 저장 중...', 'info', 2000);
        
        // 실제 자동 저장 로직은 폼 모듈에서 구현
        // 여기서는 상태만 업데이트
        this.state.isModified = false;
    }
    
    /**
     * 키보드 단축키 도움말 표시
     */
    _showKeyboardShortcutsHelp() {
        // 페이지 로드 3초 후에 단축키 안내 표시 (한 번만)
        const hasShownHelp = localStorage.getItem('contract_shortcuts_help_shown');
        
        if (!hasShownHelp) {
            setTimeout(() => {
                const shortcuts = {
                    'list': ['Ctrl+N: 새 계약', 'Ctrl+F: 검색'],
                    'create': ['Ctrl+S: 저장'],
                    'edit': ['Ctrl+S: 저장', 'Ctrl+L: 목록'],
                    'detail': ['Ctrl+E: 수정', 'Ctrl+L: 목록']
                };
                
                const pageShortcuts = shortcuts[this.config.pageType] || [];
                
                if (pageShortcuts.length > 0) {
                    const message = `사용 가능한 단축키:\n${pageShortcuts.join('\n')}`;
                    UIUtils.showAlert(message, 'info', 5000);
                    localStorage.setItem('contract_shortcuts_help_shown', 'true');
                }
            }, 3000);
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
     * 상태 업데이트
     * @param {Object} newState 새로운 상태
     */
    setState(newState) {
        Object.assign(this.state, newState);
    }
    
    /**
     * 모듈 재시작
     * @param {string} moduleName 재시작할 모듈명
     */
    restartModule(moduleName) {
        if (this.modules[moduleName]) {
            this.modules[moduleName].destroy();
            
            switch (moduleName) {
                case 'list':
                    this._initializeListModule();
                    break;
                case 'form':
                    this._initializeFormModule();
                    break;
                case 'detail':
                    this._initializeDetailModule();
                    break;
            }
        }
    }
    
    /**
     * 리소스 정리
     */
    destroy() {
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
        this.eventListeners.clear();
        this.state.initialized = false;
        
        console.log('ContractManager 리소스 정리 완료');
    }
}

export default ContractManager; 