/**
 * Fields 설정 모듈 통합 진입점
 * 필드 빌더와 검증 규칙을 통합 관리합니다.
 */

import FieldBuilderManager from './field-builder.js';
import ValidationRulesManager from './validation-rules.js';

/**
 * 필드 설정 통합 관리 클래스
 */
class FieldsSettingsManager {
    constructor() {
        this.fieldBuilderManager = null;
        this.validationRulesManager = null;
        this.cleanupFunctions = [];
    }

    /**
     * 초기화
     */
    initialize() {
        try {
            // 각 매니저 인스턴스 생성
            this.fieldBuilderManager = new FieldBuilderManager();
            this.validationRulesManager = new ValidationRulesManager();

            // 각 매니저 초기화
            this.fieldBuilderManager.initialize();
            this.validationRulesManager.initialize();

            // 탭 이벤트 설정
            this.setupTabEvents();

            console.log('필드 설정 모듈 초기화 완료');
        } catch (error) {
            console.error('필드 설정 모듈 초기화 오류:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * 탭 이벤트 설정
     */
    setupTabEvents() {
        const fieldTabs = document.querySelectorAll('[data-bs-toggle="tab"][data-field-tab]');
        
        fieldTabs.forEach(tab => {
            const handleTabChange = (event) => {
                const tabType = event.target.dataset.fieldTab;
                this.handleTabChange(tabType);
            };
            
            tab.addEventListener('shown.bs.tab', handleTabChange);
            this.cleanupFunctions.push(() => {
                tab.removeEventListener('shown.bs.tab', handleTabChange);
            });
        });
    }

    /**
     * 탭 변경 처리
     * @param {string} tabType - 탭 유형
     */
    handleTabChange(tabType) {
        try {
            switch (tabType) {
                case 'builder':
                    // 필드 빌더 탭 활성화 시
                    if (this.fieldBuilderManager) {
                        this.fieldBuilderManager.loadCustomFields();
                        this.fieldBuilderManager.renderFieldTypes();
                        this.fieldBuilderManager.renderCustomFields();
                    }
                    break;
                case 'validation':
                    // 검증 규칙 탭 활성화 시
                    if (this.validationRulesManager) {
                        this.validationRulesManager.loadCustomRules();
                        this.validationRulesManager.renderValidationRules();
                    }
                    break;
            }
        } catch (error) {
            console.error('탭 변경 처리 오류:', error);
        }
    }

    /**
     * 전체 필드 설정 내보내기
     * @returns {Object} 필드 설정 데이터
     */
    exportSettings() {
        try {
            const fields = this.fieldBuilderManager ? this.fieldBuilderManager.exportFields() : null;
            const validationRules = this.validationRulesManager ? this.validationRulesManager.exportRules() : null;

            return {
                fields: fields?.fields || [],
                validationRules: validationRules?.rules || [],
                exportedAt: new Date().toISOString(),
                version: '1.0'
            };
        } catch (error) {
            console.error('필드 설정 내보내기 오류:', error);
            return null;
        }
    }

    /**
     * 전체 필드 설정 가져오기
     * @param {Object} settings - 필드 설정 데이터
     */
    importSettings(settings) {
        try {
            if (settings.fields && this.fieldBuilderManager) {
                this.fieldBuilderManager.importFields({ fields: settings.fields });
            }

            if (settings.validationRules && this.validationRulesManager) {
                this.validationRulesManager.importRules({ rules: settings.validationRules });
            }

            console.log('필드 설정 가져오기 완료');
        } catch (error) {
            console.error('필드 설정 가져오기 오류:', error);
            throw error;
        }
    }

    /**
     * 필드에 검증 규칙 적용
     * @param {string} fieldName - 필드 이름
     * @param {*} value - 검증할 값
     * @param {Array} rules - 적용할 규칙 목록
     * @param {Object} context - 컨텍스트 정보
     * @returns {Promise<Object>} 검증 결과
     */
    async validateField(fieldName, value, rules, context = {}) {
        if (!this.validationRulesManager) {
            return { isValid: true, errors: [] };
        }

        return await this.validationRulesManager.validateField(fieldName, value, rules, context);
    }

    /**
     * 커스텀 필드로 폼 HTML 생성
     * @param {Array} fieldIds - 사용할 필드 ID 목록
     * @param {Object} values - 기본값 (선택)
     * @returns {string} 생성된 HTML
     */
    generateFormHTML(fieldIds = [], values = {}) {
        if (!this.fieldBuilderManager) return '';

        const allFields = this.fieldBuilderManager.getCurrentFields();
        const selectedFields = fieldIds.length > 0 ? 
            allFields.filter(field => fieldIds.includes(field.id)) : 
            allFields;

        let html = '';
        selectedFields
            .sort((a, b) => a.order - b.order)
            .forEach(field => {
                html += this.generateFieldHTML(field, values[field.name]);
            });

        return html;
    }

    /**
     * 개별 필드 HTML 생성
     * @param {Object} field - 필드 정보
     * @param {*} value - 필드 값
     * @returns {string} 필드 HTML
     */
    generateFieldHTML(field, value = '') {
        const { type, name, label, description, config } = field;
        
        let html = `
            <div class="mb-3" data-field="${name}">
                <label for="${name}" class="form-label">
                    ${label}
                    ${config.required ? '<span class="text-danger">*</span>' : ''}
                </label>
        `;

        switch (type) {
            case 'text':
            case 'email':
            case 'url':
                html += `<input type="${type}" class="form-control" id="${name}" name="${name}" 
                                value="${value}" 
                                placeholder="${config.placeholder || ''}" 
                                ${config.maxLength ? `maxlength="${config.maxLength}"` : ''}
                                ${config.pattern ? `pattern="${config.pattern}"` : ''}
                                ${config.required ? 'required' : ''}>`;
                break;
            case 'textarea':
                html += `<textarea class="form-control" id="${name}" name="${name}" 
                                  rows="${config.rows || 3}" 
                                  placeholder="${config.placeholder || ''}" 
                                  ${config.maxLength ? `maxlength="${config.maxLength}"` : ''}
                                  ${config.required ? 'required' : ''}>${value}</textarea>`;
                break;
            case 'number':
                html += `<input type="number" class="form-control" id="${name}" name="${name}" 
                                value="${value}" 
                                ${config.min !== null ? `min="${config.min}"` : ''} 
                                ${config.max !== null ? `max="${config.max}"` : ''} 
                                step="${config.step || 1}" 
                                ${config.required ? 'required' : ''}>`;
                break;
            case 'date':
            case 'datetime':
                html += `<input type="${type === 'datetime' ? 'datetime-local' : 'date'}" 
                                class="form-control" id="${name}" name="${name}" 
                                value="${value}"
                                ${config.min ? `min="${config.min}"` : ''}
                                ${config.max ? `max="${config.max}"` : ''}
                                ${config.required ? 'required' : ''}>`;
                break;
            case 'select':
                html += `<select class="form-select" id="${name}" name="${name}" 
                                ${config.multiple ? 'multiple' : ''}
                                ${config.required ? 'required' : ''}>`;
                if (!config.multiple) {
                    html += `<option value="">선택하세요</option>`;
                }
                (config.options || []).forEach(option => {
                    const selected = Array.isArray(value) ? 
                        value.includes(option.value) : 
                        value === option.value;
                    html += `<option value="${option.value}" ${selected ? 'selected' : ''}>${option.label}</option>`;
                });
                html += `</select>`;
                break;
            case 'radio':
                (config.options || []).forEach((option, index) => {
                    const checked = value === option.value;
                    html += `
                        <div class="form-check">
                            <input class="form-check-input" type="radio" 
                                   name="${name}" id="${name}_${index}" 
                                   value="${option.value}" ${checked ? 'checked' : ''}>
                            <label class="form-check-label" for="${name}_${index}">
                                ${option.label}
                            </label>
                        </div>
                    `;
                });
                break;
            case 'checkbox':
                const checkedValues = Array.isArray(value) ? value : [];
                (config.options || []).forEach((option, index) => {
                    const checked = checkedValues.includes(option.value);
                    html += `
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" 
                                   name="${name}[]" id="${name}_${index}" 
                                   value="${option.value}" ${checked ? 'checked' : ''}>
                            <label class="form-check-label" for="${name}_${index}">
                                ${option.label}
                            </label>
                        </div>
                    `;
                });
                break;
            case 'file':
                html += `<input type="file" class="form-control" id="${name}" name="${name}" 
                                ${config.multiple ? 'multiple' : ''} 
                                ${config.accept ? `accept="${config.accept}"` : ''} 
                                ${config.required ? 'required' : ''}>`;
                break;
            case 'color':
                html += `<input type="color" class="form-control form-control-color" 
                                id="${name}" name="${name}" 
                                value="${value || config.defaultValue || '#000000'}">`;
                break;
        }

        if (description) {
            html += `<div class="form-text">${description}</div>`;
        }

        html += `</div>`;
        return html;
    }

    /**
     * 폼 검증 수행
     * @param {HTMLFormElement} form - 검증할 폼
     * @param {Object} fieldRules - 필드별 검증 규칙
     * @returns {Promise<Object>} 검증 결과
     */
    async validateForm(form, fieldRules = {}) {
        const formData = new FormData(form);
        const result = {
            isValid: true,
            errors: {},
            fieldErrors: {}
        };

        const allFields = this.fieldBuilderManager ? this.fieldBuilderManager.getCurrentFields() : [];

        for (const field of allFields) {
            const value = this.getFieldValue(formData, field);
            const rules = fieldRules[field.name] || [];

            // 기본 검증 규칙 추가
            if (field.config.required) {
                rules.unshift({ name: 'required', params: {} });
            }

            if (rules.length > 0) {
                const fieldResult = await this.validateField(field.name, value, rules);
                
                if (!fieldResult.isValid) {
                    result.isValid = false;
                    result.fieldErrors[field.name] = fieldResult.errors;
                    result.errors[field.name] = fieldResult.errors[0]; // 첫 번째 오류 메시지
                }
            }
        }

        return result;
    }

    /**
     * 폼 데이터에서 필드 값 추출
     * @param {FormData} formData - 폼 데이터
     * @param {Object} field - 필드 정보
     * @returns {*} 필드 값
     */
    getFieldValue(formData, field) {
        switch (field.type) {
            case 'checkbox':
                return formData.getAll(`${field.name}[]`);
            case 'file':
                const files = formData.getAll(field.name);
                return field.config.multiple ? files : files[0] || null;
            case 'number':
                const numValue = formData.get(field.name);
                return numValue ? parseFloat(numValue) : null;
            default:
                return formData.get(field.name) || '';
        }
    }

    /**
     * 현재 커스텀 필드 반환
     * @returns {Array} 커스텀 필드 배열
     */
    getCurrentFields() {
        return this.fieldBuilderManager ? this.fieldBuilderManager.getCurrentFields() : [];
    }

    /**
     * 현재 검증 규칙 반환
     * @returns {Object} 검증 규칙
     */
    getCurrentValidationRules() {
        return this.validationRulesManager ? this.validationRulesManager.getAllRules() : { builtIn: {}, custom: [] };
    }

    /**
     * 초기화 오류 처리
     * @param {Error} error - 발생한 오류
     */
    handleInitializationError(error) {
        const errorContainer = document.getElementById('fieldsSettingsError');
        if (errorContainer) {
            errorContainer.innerHTML = `
                <div class="alert alert-danger">
                    <h6>필드 설정 초기화 오류</h6>
                    <p>필드 설정 모듈을 초기화하는 중 오류가 발생했습니다.</p>
                    <details>
                        <summary>오류 상세</summary>
                        <pre>${error.message}</pre>
                    </details>
                </div>
            `;
        }
    }

    /**
     * 설정 유효성 검사
     * @returns {Object} 검사 결과
     */
    validateSettings() {
        const validation = {
            isValid: true,
            errors: [],
            warnings: []
        };

        try {
            // 커스텀 필드 검사
            const fields = this.getCurrentFields();
            if (fields.length === 0) {
                validation.warnings.push('커스텀 필드가 설정되지 않았습니다.');
            }

            // 필드 이름 중복 검사
            const fieldNames = fields.map(f => f.name);
            const duplicates = fieldNames.filter((name, index) => fieldNames.indexOf(name) !== index);
            if (duplicates.length > 0) {
                validation.isValid = false;
                validation.errors.push(`중복된 필드 이름: ${duplicates.join(', ')}`);
            }

            // 검증 규칙 검사
            const rules = this.getCurrentValidationRules();
            if (rules.custom.length === 0) {
                validation.warnings.push('커스텀 검증 규칙이 설정되지 않았습니다.');
            }

        } catch (error) {
            validation.isValid = false;
            validation.errors.push(`설정 검사 중 오류: ${error.message}`);
        }

        return validation;
    }

    /**
     * 필드 빌더 매니저 반환
     * @returns {FieldBuilderManager|null} 필드 빌더 매니저
     */
    getFieldBuilderManager() {
        return this.fieldBuilderManager;
    }

    /**
     * 검증 규칙 매니저 반환
     * @returns {ValidationRulesManager|null} 검증 규칙 매니저
     */
    getValidationRulesManager() {
        return this.validationRulesManager;
    }

    /**
     * 정리
     */
    cleanup() {
        // 이벤트 리스너 정리
        this.cleanupFunctions.forEach(fn => {
            if (typeof fn === 'function') fn();
        });
        this.cleanupFunctions = [];

        // 각 매니저 정리
        if (this.fieldBuilderManager && typeof this.fieldBuilderManager.cleanup === 'function') {
            this.fieldBuilderManager.cleanup();
        }
        if (this.validationRulesManager && typeof this.validationRulesManager.cleanup === 'function') {
            this.validationRulesManager.cleanup();
        }

        this.fieldBuilderManager = null;
        this.validationRulesManager = null;
    }
}

// 전역 인스턴스 생성 및 내보내기
const fieldsSettingsManager = new FieldsSettingsManager();

export default fieldsSettingsManager; 