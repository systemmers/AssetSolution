/**
 * 필드 검증 규칙 관리 모듈
 * 필드별 검증 규칙 정의, 적용, 관리를 담당합니다.
 */

import SettingsStorage from '../core/settings-storage.js';
import SettingsAPI from '../core/settings-api.js';
import UIUtils from '../../../common/ui-utils.js';

/**
 * 검증 규칙 매니저 클래스
 */
class ValidationRulesManager {
    constructor() {
        this.cleanupFunctions = [];
        this.validationRules = this.initializeValidationRules();
        this.customRules = [];
    }

    /**
     * 기본 검증 규칙 초기화
     * @returns {Object} 기본 검증 규칙
     */
    initializeValidationRules() {
        return {
            // 필수 입력
            required: {
                name: '필수 입력',
                description: '값이 입력되어야 합니다',
                validate: (value) => {
                    return value !== null && value !== undefined && String(value).trim() !== '';
                },
                message: '이 필드는 필수 입력입니다.'
            },

            // 이메일 형식
            email: {
                name: '이메일 형식',
                description: '올바른 이메일 주소 형식이어야 합니다',
                validate: (value) => {
                    if (!value) return true; // 빈 값은 선택적으로 허용
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    return emailRegex.test(value);
                },
                message: '올바른 이메일 주소를 입력해주세요.'
            },

            // 전화번호 형식
            phone: {
                name: '전화번호 형식',
                description: '올바른 전화번호 형식이어야 합니다',
                validate: (value) => {
                    if (!value) return true;
                    const phoneRegex = /^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}$/;
                    return phoneRegex.test(value);
                },
                message: '전화번호는 000-0000-0000 형식으로 입력해주세요.'
            },

            // URL 형식
            url: {
                name: 'URL 형식',
                description: '올바른 URL 형식이어야 합니다',
                validate: (value) => {
                    if (!value) return true;
                    try {
                        new URL(value);
                        return true;
                    } catch {
                        return false;
                    }
                },
                message: '올바른 URL을 입력해주세요.'
            },

            // 최소 길이
            minLength: {
                name: '최소 길이',
                description: '지정된 최소 길이 이상이어야 합니다',
                params: [{ name: 'min', type: 'number', label: '최소 길이' }],
                validate: (value, params) => {
                    if (!value) return true;
                    return String(value).length >= (params.min || 0);
                },
                message: (params) => `최소 ${params.min || 0}자 이상 입력해주세요.`
            },

            // 최대 길이
            maxLength: {
                name: '최대 길이',
                description: '지정된 최대 길이 이하여야 합니다',
                params: [{ name: 'max', type: 'number', label: '최대 길이' }],
                validate: (value, params) => {
                    if (!value) return true;
                    return String(value).length <= (params.max || Infinity);
                },
                message: (params) => `최대 ${params.max || 0}자까지 입력 가능합니다.`
            },

            // 숫자 범위
            numberRange: {
                name: '숫자 범위',
                description: '지정된 범위 내의 숫자여야 합니다',
                params: [
                    { name: 'min', type: 'number', label: '최솟값' },
                    { name: 'max', type: 'number', label: '최댓값' }
                ],
                validate: (value, params) => {
                    if (!value) return true;
                    const num = parseFloat(value);
                    if (isNaN(num)) return false;
                    
                    const min = params.min !== undefined ? params.min : -Infinity;
                    const max = params.max !== undefined ? params.max : Infinity;
                    
                    return num >= min && num <= max;
                },
                message: (params) => {
                    const min = params.min !== undefined ? params.min : '';
                    const max = params.max !== undefined ? params.max : '';
                    if (min !== '' && max !== '') {
                        return `${min}과 ${max} 사이의 값을 입력해주세요.`;
                    } else if (min !== '') {
                        return `${min} 이상의 값을 입력해주세요.`;
                    } else if (max !== '') {
                        return `${max} 이하의 값을 입력해주세요.`;
                    }
                    return '올바른 숫자를 입력해주세요.';
                }
            },

            // 날짜 범위
            dateRange: {
                name: '날짜 범위',
                description: '지정된 범위 내의 날짜여야 합니다',
                params: [
                    { name: 'min', type: 'date', label: '최소 날짜' },
                    { name: 'max', type: 'date', label: '최대 날짜' }
                ],
                validate: (value, params) => {
                    if (!value) return true;
                    const date = new Date(value);
                    if (isNaN(date.getTime())) return false;
                    
                    const min = params.min ? new Date(params.min) : null;
                    const max = params.max ? new Date(params.max) : null;
                    
                    if (min && date < min) return false;
                    if (max && date > max) return false;
                    
                    return true;
                },
                message: (params) => {
                    const min = params.min ? new Date(params.min).toLocaleDateString() : '';
                    const max = params.max ? new Date(params.max).toLocaleDateString() : '';
                    if (min && max) {
                        return `${min}과 ${max} 사이의 날짜를 선택해주세요.`;
                    } else if (min) {
                        return `${min} 이후의 날짜를 선택해주세요.`;
                    } else if (max) {
                        return `${max} 이전의 날짜를 선택해주세요.`;
                    }
                    return '올바른 날짜를 선택해주세요.';
                }
            },

            // 정규식 패턴
            pattern: {
                name: '패턴 일치',
                description: '지정된 정규식 패턴과 일치해야 합니다',
                params: [
                    { name: 'pattern', type: 'text', label: '정규식 패턴' },
                    { name: 'flags', type: 'text', label: '플래그 (선택)', placeholder: 'i, g, m 등' }
                ],
                validate: (value, params) => {
                    if (!value || !params.pattern) return true;
                    try {
                        const regex = new RegExp(params.pattern, params.flags || '');
                        return regex.test(value);
                    } catch {
                        return false;
                    }
                },
                message: (params) => params.message || '입력 형식이 올바르지 않습니다.'
            },

            // 고유값
            unique: {
                name: '고유값',
                description: '다른 레코드와 중복되지 않아야 합니다',
                params: [
                    { name: 'table', type: 'text', label: '테이블명' },
                    { name: 'field', type: 'text', label: '필드명' }
                ],
                validate: async (value, params, context) => {
                    if (!value) return true;
                    try {
                        const result = await SettingsAPI.checkUniqueValue(
                            params.table,
                            params.field,
                            value,
                            context?.recordId
                        );
                        return result.isUnique;
                    } catch {
                        return false;
                    }
                },
                message: '이미 사용 중인 값입니다. 다른 값을 입력해주세요.'
            },

            // 파일 크기
            fileSize: {
                name: '파일 크기',
                description: '파일 크기가 제한 범위 내여야 합니다',
                params: [
                    { name: 'maxSize', type: 'number', label: '최대 크기 (MB)' }
                ],
                validate: (files, params) => {
                    if (!files || !files.length) return true;
                    const maxBytes = (params.maxSize || 5) * 1024 * 1024;
                    
                    for (const file of files) {
                        if (file.size > maxBytes) return false;
                    }
                    return true;
                },
                message: (params) => `파일 크기는 ${params.maxSize || 5}MB 이하여야 합니다.`
            },

            // 파일 형식
            fileType: {
                name: '파일 형식',
                description: '허용된 파일 형식이어야 합니다',
                params: [
                    { name: 'types', type: 'text', label: '허용 형식', placeholder: '.jpg,.png,.pdf' }
                ],
                validate: (files, params) => {
                    if (!files || !files.length || !params.types) return true;
                    
                    const allowedTypes = params.types.split(',').map(t => t.trim().toLowerCase());
                    
                    for (const file of files) {
                        const extension = '.' + file.name.split('.').pop().toLowerCase();
                        const mimeType = file.type.toLowerCase();
                        
                        const isAllowed = allowedTypes.some(type => {
                            return type.startsWith('.') ? extension === type : mimeType.includes(type);
                        });
                        
                        if (!isAllowed) return false;
                    }
                    return true;
                },
                message: (params) => `허용된 파일 형식: ${params.types || '제한 없음'}`
            }
        };
    }

    /**
     * 초기화
     */
    initialize() {
        this.loadCustomRules();
        this.setupEventListeners();
        this.renderValidationRules();
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 새 규칙 추가 버튼
        const addRuleBtn = document.getElementById('addValidationRuleBtn');
        if (addRuleBtn) {
            const handleAddRule = () => {
                this.showRuleBuilderModal();
            };
            
            addRuleBtn.addEventListener('click', handleAddRule);
            this.cleanupFunctions.push(() => {
                addRuleBtn.removeEventListener('click', handleAddRule);
            });
        }

        // 규칙 저장 버튼
        const saveRuleBtn = document.getElementById('saveValidationRuleBtn');
        if (saveRuleBtn) {
            const handleSaveRule = () => {
                this.saveValidationRule();
            };
            
            saveRuleBtn.addEventListener('click', handleSaveRule);
            this.cleanupFunctions.push(() => {
                saveRuleBtn.removeEventListener('click', handleSaveRule);
            });
        }

        // 규칙 테스트 버튼
        const testRuleBtn = document.getElementById('testValidationRuleBtn');
        if (testRuleBtn) {
            const handleTestRule = () => {
                this.testValidationRule();
            };
            
            testRuleBtn.addEventListener('click', handleTestRule);
            this.cleanupFunctions.push(() => {
                testRuleBtn.removeEventListener('click', handleTestRule);
            });
        }
    }

    /**
     * 검증 규칙 목록 렌더링
     */
    renderValidationRules() {
        this.renderBuiltInRules();
        this.renderCustomRules();
    }

    /**
     * 내장 규칙 렌더링
     */
    renderBuiltInRules() {
        const container = document.getElementById('builtInRulesContainer');
        if (!container) return;

        let html = '';
        Object.entries(this.validationRules).forEach(([key, rule]) => {
            html += `
                <div class="col-md-6 col-lg-4 mb-3">
                    <div class="card h-100">
                        <div class="card-body">
                            <h6 class="card-title d-flex align-items-center">
                                <i class="fas fa-shield-alt text-primary me-2"></i>
                                ${rule.name}
                            </h6>
                            <p class="card-text small text-muted">${rule.description}</p>
                            ${rule.params ? `
                                <div class="mb-2">
                                    <small class="text-muted">매개변수:</small>
                                    <ul class="small mb-0">
                                        ${rule.params.map(p => `<li>${p.label} (${p.type})</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                            <button type="button" class="btn btn-outline-primary btn-sm test-built-in-rule" 
                                    data-rule-key="${key}">
                                <i class="fas fa-play"></i> 테스트
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // 테스트 버튼 이벤트
        container.querySelectorAll('.test-built-in-rule').forEach(button => {
            const handleTest = () => {
                const ruleKey = button.dataset.ruleKey;
                this.showRuleTestModal(ruleKey, this.validationRules[ruleKey]);
            };
            
            button.addEventListener('click', handleTest);
            this.cleanupFunctions.push(() => {
                button.removeEventListener('click', handleTest);
            });
        });
    }

    /**
     * 커스텀 규칙 렌더링
     */
    renderCustomRules() {
        const container = document.getElementById('customRulesContainer');
        if (!container) return;

        if (this.customRules.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="fas fa-plus-circle fa-3x mb-3"></i>
                    <p>아직 추가된 커스텀 검증 규칙이 없습니다.<br>새 규칙을 추가해보세요.</p>
                </div>
            `;
            return;
        }

        let html = '';
        this.customRules.forEach(rule => {
            html += `
                <div class="col-md-6 col-lg-4 mb-3">
                    <div class="card h-100">
                        <div class="card-body">
                            <h6 class="card-title d-flex align-items-center justify-content-between">
                                <span>
                                    <i class="fas fa-user-shield text-success me-2"></i>
                                    ${rule.name}
                                </span>
                                <div class="btn-group btn-group-sm">
                                    <button type="button" class="btn btn-outline-primary edit-custom-rule" 
                                            data-rule-id="${rule.id}">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button type="button" class="btn btn-outline-danger delete-custom-rule" 
                                            data-rule-id="${rule.id}">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </h6>
                            <p class="card-text small text-muted">${rule.description}</p>
                            <button type="button" class="btn btn-outline-primary btn-sm test-custom-rule" 
                                    data-rule-id="${rule.id}">
                                <i class="fas fa-play"></i> 테스트
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // 버튼 이벤트 설정
        this.setupCustomRuleEvents(container);
    }

    /**
     * 커스텀 규칙 이벤트 설정
     * @param {HTMLElement} container - 컨테이너 요소
     */
    setupCustomRuleEvents(container) {
        // 편집 버튼
        container.querySelectorAll('.edit-custom-rule').forEach(button => {
            const handleEdit = () => {
                const ruleId = button.dataset.ruleId;
                this.editCustomRule(ruleId);
            };
            
            button.addEventListener('click', handleEdit);
            this.cleanupFunctions.push(() => {
                button.removeEventListener('click', handleEdit);
            });
        });

        // 삭제 버튼
        container.querySelectorAll('.delete-custom-rule').forEach(button => {
            const handleDelete = () => {
                const ruleId = button.dataset.ruleId;
                this.deleteCustomRule(ruleId);
            };
            
            button.addEventListener('click', handleDelete);
            this.cleanupFunctions.push(() => {
                button.removeEventListener('click', handleDelete);
            });
        });

        // 테스트 버튼
        container.querySelectorAll('.test-custom-rule').forEach(button => {
            const handleTest = () => {
                const ruleId = button.dataset.ruleId;
                const rule = this.customRules.find(r => r.id === ruleId);
                if (rule) {
                    this.showRuleTestModal(ruleId, rule);
                }
            };
            
            button.addEventListener('click', handleTest);
            this.cleanupFunctions.push(() => {
                button.removeEventListener('click', handleTest);
            });
        });
    }

    /**
     * 규칙 빌더 모달 표시
     * @param {Object} rule - 편집할 규칙 (새 규칙인 경우 null)
     */
    showRuleBuilderModal(rule = null) {
        const modal = document.getElementById('ruleBuilderModal');
        if (!modal) return;

        // 모달 제목 설정
        const modalTitle = modal.querySelector('.modal-title');
        if (modalTitle) {
            modalTitle.textContent = rule ? '검증 규칙 편집' : '새 검증 규칙 추가';
        }

        // 폼 초기화
        const form = document.getElementById('ruleBuilderForm');
        if (form) {
            form.reset();
        }

        // 기존 규칙 데이터 설정
        if (rule) {
            document.getElementById('ruleName').value = rule.name;
            document.getElementById('ruleDescription').value = rule.description;
            document.getElementById('ruleCode').value = rule.code || '';
            document.getElementById('ruleMessage').value = rule.message;
        }

        // 모달 표시
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }

    /**
     * 규칙 테스트 모달 표시
     * @param {string} ruleKey - 규칙 키 또는 ID
     * @param {Object} rule - 규칙 객체
     */
    showRuleTestModal(ruleKey, rule) {
        const modal = document.getElementById('ruleTestModal');
        if (!modal) return;

        // 규칙 정보 표시
        modal.querySelector('#testRuleName').textContent = rule.name;
        modal.querySelector('#testRuleDescription').textContent = rule.description;

        // 매개변수 입력 폼 생성
        const paramsContainer = modal.querySelector('#testRuleParams');
        if (rule.params && rule.params.length > 0) {
            let html = '<h6>매개변수</h6>';
            rule.params.forEach(param => {
                html += `
                    <div class="mb-3">
                        <label for="testParam_${param.name}" class="form-label">${param.label}</label>
                        <input type="${param.type}" class="form-control" 
                               id="testParam_${param.name}" 
                               placeholder="${param.placeholder || ''}">
                    </div>
                `;
            });
            paramsContainer.innerHTML = html;
        } else {
            paramsContainer.innerHTML = '';
        }

        // 테스트 버튼 이벤트
        const testBtn = modal.querySelector('#executeRuleTest');
        testBtn.onclick = () => this.executeRuleTest(ruleKey, rule);

        // 모달 표시
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }

    /**
     * 검증 규칙 저장
     */
    saveValidationRule() {
        const form = document.getElementById('ruleBuilderForm');
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        const formData = new FormData(form);
        const ruleData = {
            id: Date.now().toString(),
            name: formData.get('ruleName'),
            description: formData.get('ruleDescription'),
            code: formData.get('ruleCode'),
            message: formData.get('ruleMessage'),
            createdAt: new Date().toISOString()
        };

        try {
            // 규칙 코드 유효성 검사
            if (!this.validateRuleCode(ruleData.code)) {
                UIUtils.showAlert('규칙 코드에 오류가 있습니다.', 'error');
                return;
            }

            this.customRules.push(ruleData);
            this.saveCustomRules();
            this.renderCustomRules();

            // 모달 닫기
            const modal = bootstrap.Modal.getInstance(document.getElementById('ruleBuilderModal'));
            if (modal) modal.hide();

            UIUtils.showAlert('검증 규칙이 저장되었습니다.', 'success');
        } catch (error) {
            console.error('검증 규칙 저장 오류:', error);
            UIUtils.showAlert('검증 규칙 저장 중 오류가 발생했습니다.', 'error');
        }
    }

    /**
     * 규칙 코드 유효성 검사
     * @param {string} code - 검증할 코드
     * @returns {boolean} 유효성 여부
     */
    validateRuleCode(code) {
        try {
            // 간단한 구문 검사
            new Function('value', 'params', 'context', code);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * 규칙 테스트 실행
     * @param {string} ruleKey - 규칙 키 또는 ID
     * @param {Object} rule - 규칙 객체
     */
    async executeRuleTest(ruleKey, rule) {
        const modal = document.getElementById('ruleTestModal');
        const testValue = modal.querySelector('#testRuleValue').value;
        const resultContainer = modal.querySelector('#testRuleResult');

        try {
            // 매개변수 수집
            const params = {};
            if (rule.params) {
                rule.params.forEach(param => {
                    const input = modal.querySelector(`#testParam_${param.name}`);
                    if (input) {
                        params[param.name] = param.type === 'number' ? 
                            parseFloat(input.value) || 0 : input.value;
                    }
                });
            }

            // 검증 실행
            let result;
            if (this.validationRules[ruleKey]) {
                // 내장 규칙
                result = await this.validationRules[ruleKey].validate(testValue, params);
            } else {
                // 커스텀 규칙
                result = await this.executeCustomRule(rule, testValue, params);
            }

            // 결과 표시
            const isValid = result === true;
            const message = isValid ? '검증 통과' : 
                (typeof rule.message === 'function' ? rule.message(params) : rule.message);

            resultContainer.innerHTML = `
                <div class="alert ${isValid ? 'alert-success' : 'alert-danger'}">
                    <i class="fas ${isValid ? 'fa-check-circle' : 'fa-times-circle'} me-2"></i>
                    <strong>${isValid ? '성공' : '실패'}</strong>: ${message}
                </div>
            `;
        } catch (error) {
            console.error('규칙 테스트 오류:', error);
            resultContainer.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    <strong>오류</strong>: ${error.message}
                </div>
            `;
        }
    }

    /**
     * 커스텀 규칙 실행
     * @param {Object} rule - 규칙 객체
     * @param {*} value - 검증할 값
     * @param {Object} params - 매개변수
     * @returns {boolean} 검증 결과
     */
    executeCustomRule(rule, value, params) {
        try {
            const func = new Function('value', 'params', 'context', `return (${rule.code})`);
            return func(value, params, {});
        } catch (error) {
            throw new Error(`규칙 실행 오류: ${error.message}`);
        }
    }

    /**
     * 커스텀 규칙 편집
     * @param {string} ruleId - 규칙 ID
     */
    editCustomRule(ruleId) {
        const rule = this.customRules.find(r => r.id === ruleId);
        if (rule) {
            this.showRuleBuilderModal(rule);
        }
    }

    /**
     * 커스텀 규칙 삭제
     * @param {string} ruleId - 규칙 ID
     */
    deleteCustomRule(ruleId) {
        const rule = this.customRules.find(r => r.id === ruleId);
        if (!rule) return;

        UIUtils.showConfirm(`'${rule.name}' 규칙을 삭제하시겠습니까?`, (confirmed) => {
            if (confirmed) {
                this.customRules = this.customRules.filter(r => r.id !== ruleId);
                this.saveCustomRules();
                this.renderCustomRules();
                UIUtils.showAlert('검증 규칙이 삭제되었습니다.', 'success');
            }
        });
    }

    /**
     * 필드에 대한 검증 실행
     * @param {string} fieldName - 필드 이름
     * @param {*} value - 검증할 값
     * @param {Array} rules - 적용할 규칙 목록
     * @param {Object} context - 컨텍스트 정보
     * @returns {Promise<Object>} 검증 결과
     */
    async validateField(fieldName, value, rules, context = {}) {
        const result = {
            isValid: true,
            errors: []
        };

        for (const ruleConfig of rules) {
            try {
                const rule = this.validationRules[ruleConfig.name] || 
                             this.customRules.find(r => r.id === ruleConfig.name);
                
                if (!rule) continue;

                let isValid;
                if (this.validationRules[ruleConfig.name]) {
                    // 내장 규칙
                    isValid = await rule.validate(value, ruleConfig.params || {}, context);
                } else {
                    // 커스텀 규칙
                    isValid = await this.executeCustomRule(rule, value, ruleConfig.params || {});
                }

                if (!isValid) {
                    result.isValid = false;
                    const message = typeof rule.message === 'function' ? 
                        rule.message(ruleConfig.params || {}) : rule.message;
                    result.errors.push(message);
                }
            } catch (error) {
                console.error(`검증 규칙 ${ruleConfig.name} 실행 오류:`, error);
                result.isValid = false;
                result.errors.push('검증 중 오류가 발생했습니다.');
            }
        }

        return result;
    }

    /**
     * 커스텀 규칙 로드
     */
    loadCustomRules() {
        try {
            this.customRules = SettingsStorage.getValidationRules() || [];
        } catch (error) {
            console.error('커스텀 규칙 로드 오류:', error);
            this.customRules = [];
        }
    }

    /**
     * 커스텀 규칙 저장
     */
    saveCustomRules() {
        try {
            SettingsStorage.saveValidationRules(this.customRules);
        } catch (error) {
            console.error('커스텀 규칙 저장 오류:', error);
        }
    }

    /**
     * 모든 규칙 반환
     * @returns {Object} 모든 검증 규칙
     */
    getAllRules() {
        return {
            builtIn: { ...this.validationRules },
            custom: [...this.customRules]
        };
    }

    /**
     * 규칙 내보내기
     * @returns {Object} 규칙 데이터
     */
    exportRules() {
        return {
            rules: this.customRules,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
    }

    /**
     * 규칙 가져오기
     * @param {Object} data - 가져올 규칙 데이터
     */
    importRules(data) {
        try {
            if (data.rules && Array.isArray(data.rules)) {
                this.customRules = data.rules;
                this.saveCustomRules();
                this.renderCustomRules();
                UIUtils.showAlert('검증 규칙을 가져왔습니다.', 'success');
            }
        } catch (error) {
            console.error('검증 규칙 가져오기 오류:', error);
            UIUtils.showAlert('검증 규칙 가져오기 중 오류가 발생했습니다.', 'error');
        }
    }

    /**
     * 정리
     */
    cleanup() {
        this.cleanupFunctions.forEach(fn => {
            if (typeof fn === 'function') fn();
        });
        this.cleanupFunctions = [];
    }
}

export default ValidationRulesManager; 