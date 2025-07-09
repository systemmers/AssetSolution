/**
 * 필드 빌더 모듈
 * 동적 필드 생성, 편집, 관리를 담당합니다.
 */

import SettingsStorage from '../core/settings-storage.js';
import SettingsAPI from '../core/settings-api.js';
import UIUtils from '../../../common/ui-utils.js';

/**
 * 필드 빌더 매니저 클래스
 */
class FieldBuilderManager {
    constructor() {
        this.cleanupFunctions = [];
        this.fieldTypes = this.initializeFieldTypes();
        this.customFields = [];
        this.currentEditingField = null;
        this.draggedElement = null;
    }

    /**
     * 필드 유형 정의 초기화
     * @returns {Object} 필드 유형 정의
     */
    initializeFieldTypes() {
        return {
            text: {
                name: '텍스트',
                icon: 'fas fa-font',
                description: '단일 줄 텍스트 입력',
                defaultConfig: {
                    required: false,
                    placeholder: '',
                    maxLength: 255,
                    pattern: '',
                    defaultValue: ''
                }
            },
            textarea: {
                name: '긴 텍스트',
                icon: 'fas fa-align-left',
                description: '여러 줄 텍스트 입력',
                defaultConfig: {
                    required: false,
                    placeholder: '',
                    rows: 3,
                    maxLength: 1000,
                    defaultValue: ''
                }
            },
            number: {
                name: '숫자',
                icon: 'fas fa-hashtag',
                description: '숫자 입력',
                defaultConfig: {
                    required: false,
                    min: null,
                    max: null,
                    step: 1,
                    defaultValue: ''
                }
            },
            email: {
                name: '이메일',
                icon: 'fas fa-envelope',
                description: '이메일 주소 입력',
                defaultConfig: {
                    required: false,
                    placeholder: 'example@domain.com',
                    defaultValue: ''
                }
            },
            phone: {
                name: '전화번호',
                icon: 'fas fa-phone',
                description: '전화번호 입력',
                defaultConfig: {
                    required: false,
                    placeholder: '010-0000-0000',
                    pattern: '^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}$',
                    defaultValue: ''
                }
            },
            date: {
                name: '날짜',
                icon: 'fas fa-calendar',
                description: '날짜 선택',
                defaultConfig: {
                    required: false,
                    min: '',
                    max: '',
                    defaultValue: ''
                }
            },
            datetime: {
                name: '날짜시간',
                icon: 'fas fa-calendar-alt',
                description: '날짜와 시간 선택',
                defaultConfig: {
                    required: false,
                    min: '',
                    max: '',
                    defaultValue: ''
                }
            },
            select: {
                name: '선택',
                icon: 'fas fa-list',
                description: '드롭다운 선택',
                defaultConfig: {
                    required: false,
                    multiple: false,
                    options: [
                        { value: 'option1', label: '옵션 1' },
                        { value: 'option2', label: '옵션 2' }
                    ],
                    defaultValue: ''
                }
            },
            radio: {
                name: '라디오',
                icon: 'fas fa-dot-circle',
                description: '단일 선택 라디오 버튼',
                defaultConfig: {
                    required: false,
                    options: [
                        { value: 'option1', label: '옵션 1' },
                        { value: 'option2', label: '옵션 2' }
                    ],
                    defaultValue: ''
                }
            },
            checkbox: {
                name: '체크박스',
                icon: 'fas fa-check-square',
                description: '다중 선택 체크박스',
                defaultConfig: {
                    required: false,
                    options: [
                        { value: 'option1', label: '옵션 1' },
                        { value: 'option2', label: '옵션 2' }
                    ],
                    defaultValue: []
                }
            },
            file: {
                name: '파일',
                icon: 'fas fa-file',
                description: '파일 업로드',
                defaultConfig: {
                    required: false,
                    multiple: false,
                    accept: '',
                    maxSize: 5, // MB
                    maxFiles: 1
                }
            },
            url: {
                name: 'URL',
                icon: 'fas fa-link',
                description: 'URL 링크 입력',
                defaultConfig: {
                    required: false,
                    placeholder: 'https://example.com',
                    defaultValue: ''
                }
            },
            color: {
                name: '색상',
                icon: 'fas fa-palette',
                description: '색상 선택',
                defaultConfig: {
                    required: false,
                    defaultValue: '#000000'
                }
            }
        };
    }

    /**
     * 초기화
     */
    initialize() {
        this.loadCustomFields();
        this.setupEventListeners();
        this.renderFieldTypes();
        this.renderCustomFields();
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 새 필드 추가 버튼
        const addFieldBtn = document.getElementById('addNewFieldBtn');
        if (addFieldBtn) {
            const handleAddField = () => {
                this.showFieldBuilderModal();
            };
            
            addFieldBtn.addEventListener('click', handleAddField);
            this.cleanupFunctions.push(() => {
                addFieldBtn.removeEventListener('click', handleAddField);
            });
        }

        // 필드 저장 버튼
        const saveFieldBtn = document.getElementById('saveFieldBtn');
        if (saveFieldBtn) {
            const handleSaveField = () => {
                this.saveField();
            };
            
            saveFieldBtn.addEventListener('click', handleSaveField);
            this.cleanupFunctions.push(() => {
                saveFieldBtn.removeEventListener('click', handleSaveField);
            });
        }

        // 필드 미리보기 업데이트
        const fieldForm = document.getElementById('fieldBuilderForm');
        if (fieldForm) {
            const handleFormChange = () => {
                this.updateFieldPreview();
            };
            
            fieldForm.addEventListener('input', handleFormChange);
            fieldForm.addEventListener('change', handleFormChange);
            this.cleanupFunctions.push(() => {
                fieldForm.removeEventListener('input', handleFormChange);
                fieldForm.removeEventListener('change', handleFormChange);
            });
        }

        // 필드 유형 변경
        const fieldTypeSelect = document.getElementById('fieldType');
        if (fieldTypeSelect) {
            const handleTypeChange = () => {
                this.updateFieldConfiguration();
                this.updateFieldPreview();
            };
            
            fieldTypeSelect.addEventListener('change', handleTypeChange);
            this.cleanupFunctions.push(() => {
                fieldTypeSelect.removeEventListener('change', handleTypeChange);
            });
        }

        // 드래그 앤 드롭 설정
        this.setupDragAndDrop();
    }

    /**
     * 드래그 앤 드롭 설정
     */
    setupDragAndDrop() {
        const fieldsList = document.getElementById('customFieldsList');
        if (!fieldsList) return;

        // 드래그 시작
        fieldsList.addEventListener('dragstart', (e) => {
            if (e.target.draggable) {
                this.draggedElement = e.target;
                e.target.style.opacity = '0.5';
            }
        });

        // 드래그 종료
        fieldsList.addEventListener('dragend', (e) => {
            if (e.target.draggable) {
                e.target.style.opacity = '';
                this.draggedElement = null;
            }
        });

        // 드롭 오버
        fieldsList.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        // 드롭
        fieldsList.addEventListener('drop', (e) => {
            e.preventDefault();
            if (this.draggedElement && e.target !== this.draggedElement) {
                const dropTarget = e.target.closest('.field-item');
                if (dropTarget) {
                    this.reorderFields(this.draggedElement, dropTarget);
                }
            }
        });
    }

    /**
     * 필드 유형 렌더링
     */
    renderFieldTypes() {
        const container = document.getElementById('fieldTypesContainer');
        if (!container) return;

        let html = '';
        Object.entries(this.fieldTypes).forEach(([type, config]) => {
            html += `
                <div class="col-md-4 col-sm-6 mb-3">
                    <div class="card field-type-card h-100" data-field-type="${type}">
                        <div class="card-body text-center">
                            <i class="${config.icon} fa-2x mb-2 text-primary"></i>
                            <h6 class="card-title">${config.name}</h6>
                            <p class="card-text small text-muted">${config.description}</p>
                            <button type="button" class="btn btn-outline-primary btn-sm add-field-type" 
                                    data-field-type="${type}">
                                <i class="fas fa-plus"></i> 추가
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // 필드 추가 버튼 이벤트
        container.querySelectorAll('.add-field-type').forEach(button => {
            const handleAddFieldType = () => {
                const fieldType = button.dataset.fieldType;
                this.createFieldFromType(fieldType);
            };
            
            button.addEventListener('click', handleAddFieldType);
            this.cleanupFunctions.push(() => {
                button.removeEventListener('click', handleAddFieldType);
            });
        });
    }

    /**
     * 커스텀 필드 목록 렌더링
     */
    renderCustomFields() {
        const container = document.getElementById('customFieldsList');
        if (!container) return;

        if (this.customFields.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="fas fa-plus-circle fa-3x mb-3"></i>
                    <p>아직 추가된 커스텀 필드가 없습니다.<br>위의 필드 유형에서 필드를 추가해보세요.</p>
                </div>
            `;
            return;
        }

        let html = '';
        this.customFields.forEach((field, index) => {
            const fieldType = this.fieldTypes[field.type];
            html += `
                <div class="field-item" draggable="true" data-field-id="${field.id}">
                    <div class="d-flex align-items-center justify-content-between p-3 border rounded mb-2">
                        <div class="d-flex align-items-center">
                            <i class="fas fa-grip-vertical text-muted me-2"></i>
                            <i class="${fieldType.icon} me-2"></i>
                            <div>
                                <div class="fw-medium">${field.label}</div>
                                <small class="text-muted">${fieldType.name} • ${field.name}</small>
                            </div>
                        </div>
                        <div class="btn-group btn-group-sm">
                            <button type="button" class="btn btn-outline-primary edit-field" 
                                    data-field-id="${field.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button type="button" class="btn btn-outline-secondary duplicate-field" 
                                    data-field-id="${field.id}">
                                <i class="fas fa-copy"></i>
                            </button>
                            <button type="button" class="btn btn-outline-danger delete-field" 
                                    data-field-id="${field.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // 버튼 이벤트 설정
        this.setupFieldItemEvents(container);
    }

    /**
     * 필드 항목 이벤트 설정
     * @param {HTMLElement} container - 컨테이너 요소
     */
    setupFieldItemEvents(container) {
        // 편집 버튼
        container.querySelectorAll('.edit-field').forEach(button => {
            const handleEdit = () => {
                const fieldId = button.dataset.fieldId;
                this.editField(fieldId);
            };
            
            button.addEventListener('click', handleEdit);
            this.cleanupFunctions.push(() => {
                button.removeEventListener('click', handleEdit);
            });
        });

        // 복사 버튼
        container.querySelectorAll('.duplicate-field').forEach(button => {
            const handleDuplicate = () => {
                const fieldId = button.dataset.fieldId;
                this.duplicateField(fieldId);
            };
            
            button.addEventListener('click', handleDuplicate);
            this.cleanupFunctions.push(() => {
                button.removeEventListener('click', handleDuplicate);
            });
        });

        // 삭제 버튼
        container.querySelectorAll('.delete-field').forEach(button => {
            const handleDelete = () => {
                const fieldId = button.dataset.fieldId;
                this.deleteField(fieldId);
            };
            
            button.addEventListener('click', handleDelete);
            this.cleanupFunctions.push(() => {
                button.removeEventListener('click', handleDelete);
            });
        });
    }

    /**
     * 필드 유형으로부터 필드 생성
     * @param {string} fieldType - 필드 유형
     */
    createFieldFromType(fieldType) {
        const typeConfig = this.fieldTypes[fieldType];
        if (!typeConfig) return;

        this.currentEditingField = {
            id: null,
            type: fieldType,
            name: `field_${Date.now()}`,
            label: typeConfig.name,
            description: '',
            config: { ...typeConfig.defaultConfig },
            order: this.customFields.length
        };

        this.showFieldBuilderModal();
    }

    /**
     * 필드 빌더 모달 표시
     */
    showFieldBuilderModal() {
        const modal = document.getElementById('fieldBuilderModal');
        if (!modal) return;

        // 모달 제목 설정
        const modalTitle = modal.querySelector('.modal-title');
        if (modalTitle) {
            modalTitle.textContent = this.currentEditingField.id ? '필드 편집' : '새 필드 추가';
        }

        // 폼 데이터 설정
        this.populateFieldForm();
        this.updateFieldConfiguration();
        this.updateFieldPreview();

        // 모달 표시
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }

    /**
     * 필드 폼 데이터 설정
     */
    populateFieldForm() {
        if (!this.currentEditingField) return;

        const field = this.currentEditingField;
        
        // 기본 정보
        this.setFormValue('fieldType', field.type);
        this.setFormValue('fieldName', field.name);
        this.setFormValue('fieldLabel', field.label);
        this.setFormValue('fieldDescription', field.description);
    }

    /**
     * 폼 값 설정
     * @param {string} id - 요소 ID
     * @param {*} value - 설정할 값
     */
    setFormValue(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
        }
    }

    /**
     * 필드 설정 업데이트
     */
    updateFieldConfiguration() {
        const fieldType = document.getElementById('fieldType')?.value;
        if (!fieldType || !this.fieldTypes[fieldType]) return;

        const configContainer = document.getElementById('fieldConfigContainer');
        if (!configContainer) return;

        const typeConfig = this.fieldTypes[fieldType];
        const fieldConfig = this.currentEditingField?.config || typeConfig.defaultConfig;

        let html = '<h6>필드 설정</h6>';

        // 공통 설정
        html += `
            <div class="mb-3">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="fieldRequired" 
                           ${fieldConfig.required ? 'checked' : ''}>
                    <label class="form-check-label" for="fieldRequired">필수 입력</label>
                </div>
            </div>
        `;

        // 필드 유형별 특화 설정
        switch (fieldType) {
            case 'text':
            case 'email':
            case 'url':
                html += this.renderTextFieldConfig(fieldConfig);
                break;
            case 'textarea':
                html += this.renderTextareaFieldConfig(fieldConfig);
                break;
            case 'number':
                html += this.renderNumberFieldConfig(fieldConfig);
                break;
            case 'date':
            case 'datetime':
                html += this.renderDateFieldConfig(fieldConfig);
                break;
            case 'select':
            case 'radio':
            case 'checkbox':
                html += this.renderOptionsFieldConfig(fieldConfig);
                break;
            case 'file':
                html += this.renderFileFieldConfig(fieldConfig);
                break;
        }

        configContainer.innerHTML = html;
    }

    /**
     * 텍스트 필드 설정 렌더링
     * @param {Object} config - 필드 설정
     * @returns {string} HTML
     */
    renderTextFieldConfig(config) {
        return `
            <div class="mb-3">
                <label for="fieldPlaceholder" class="form-label">플레이스홀더</label>
                <input type="text" class="form-control" id="fieldPlaceholder" 
                       value="${config.placeholder || ''}">
            </div>
            <div class="mb-3">
                <label for="fieldMaxLength" class="form-label">최대 길이</label>
                <input type="number" class="form-control" id="fieldMaxLength" 
                       value="${config.maxLength || ''}" min="1">
            </div>
            <div class="mb-3">
                <label for="fieldPattern" class="form-label">검증 패턴 (정규식)</label>
                <input type="text" class="form-control" id="fieldPattern" 
                       value="${config.pattern || ''}" placeholder="예: ^[A-Za-z]+$">
            </div>
            <div class="mb-3">
                <label for="fieldDefaultValue" class="form-label">기본값</label>
                <input type="text" class="form-control" id="fieldDefaultValue" 
                       value="${config.defaultValue || ''}">
            </div>
        `;
    }

    /**
     * 텍스트영역 필드 설정 렌더링
     * @param {Object} config - 필드 설정
     * @returns {string} HTML
     */
    renderTextareaFieldConfig(config) {
        return `
            <div class="mb-3">
                <label for="fieldPlaceholder" class="form-label">플레이스홀더</label>
                <input type="text" class="form-control" id="fieldPlaceholder" 
                       value="${config.placeholder || ''}">
            </div>
            <div class="mb-3">
                <label for="fieldRows" class="form-label">행 수</label>
                <input type="number" class="form-control" id="fieldRows" 
                       value="${config.rows || 3}" min="1" max="20">
            </div>
            <div class="mb-3">
                <label for="fieldMaxLength" class="form-label">최대 길이</label>
                <input type="number" class="form-control" id="fieldMaxLength" 
                       value="${config.maxLength || ''}" min="1">
            </div>
        `;
    }

    /**
     * 숫자 필드 설정 렌더링
     * @param {Object} config - 필드 설정
     * @returns {string} HTML
     */
    renderNumberFieldConfig(config) {
        return `
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="fieldMin" class="form-label">최솟값</label>
                        <input type="number" class="form-control" id="fieldMin" 
                               value="${config.min || ''}">
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="fieldMax" class="form-label">최댓값</label>
                        <input type="number" class="form-control" id="fieldMax" 
                               value="${config.max || ''}">
                    </div>
                </div>
            </div>
            <div class="mb-3">
                <label for="fieldStep" class="form-label">증가/감소 단위</label>
                <input type="number" class="form-control" id="fieldStep" 
                       value="${config.step || 1}" min="0.01" step="0.01">
            </div>
        `;
    }

    /**
     * 날짜 필드 설정 렌더링
     * @param {Object} config - 필드 설정
     * @returns {string} HTML
     */
    renderDateFieldConfig(config) {
        return `
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="fieldMin" class="form-label">최소 날짜</label>
                        <input type="date" class="form-control" id="fieldMin" 
                               value="${config.min || ''}">
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="fieldMax" class="form-label">최대 날짜</label>
                        <input type="date" class="form-control" id="fieldMax" 
                               value="${config.max || ''}">
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 옵션 필드 설정 렌더링
     * @param {Object} config - 필드 설정
     * @returns {string} HTML
     */
    renderOptionsFieldConfig(config) {
        let html = `
            <div class="mb-3">
                <label class="form-label">옵션 목록</label>
                <div id="optionsList">
        `;

        (config.options || []).forEach((option, index) => {
            html += `
                <div class="input-group mb-2">
                    <input type="text" class="form-control option-value" 
                           placeholder="값" value="${option.value}">
                    <input type="text" class="form-control option-label" 
                           placeholder="표시 텍스트" value="${option.label}">
                    <button type="button" class="btn btn-outline-danger remove-option">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        });

        html += `
                </div>
                <button type="button" class="btn btn-outline-primary btn-sm" id="addOptionBtn">
                    <i class="fas fa-plus"></i> 옵션 추가
                </button>
            </div>
        `;

        return html;
    }

    /**
     * 파일 필드 설정 렌더링
     * @param {Object} config - 필드 설정
     * @returns {string} HTML
     */
    renderFileFieldConfig(config) {
        return `
            <div class="mb-3">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="fieldMultiple" 
                           ${config.multiple ? 'checked' : ''}>
                    <label class="form-check-label" for="fieldMultiple">다중 파일 선택</label>
                </div>
            </div>
            <div class="mb-3">
                <label for="fieldAccept" class="form-label">허용 파일 형식</label>
                <input type="text" class="form-control" id="fieldAccept" 
                       value="${config.accept || ''}" 
                       placeholder="예: .jpg,.png,.pdf">
            </div>
            <div class="mb-3">
                <label for="fieldMaxSize" class="form-label">최대 파일 크기 (MB)</label>
                <input type="number" class="form-control" id="fieldMaxSize" 
                       value="${config.maxSize || 5}" min="1">
            </div>
        `;
    }

    /**
     * 필드 미리보기 업데이트
     */
    updateFieldPreview() {
        const container = document.getElementById('fieldPreviewContainer');
        if (!container) return;

        const fieldData = this.collectFieldData();
        if (!fieldData) return;

        const previewHtml = this.generateFieldHTML(fieldData);
        container.innerHTML = `
            <div class="mb-3">
                <label class="form-label">미리보기</label>
                <div class="border rounded p-3 bg-light">
                    ${previewHtml}
                </div>
            </div>
        `;
    }

    /**
     * 필드 데이터 수집
     * @returns {Object|null} 필드 데이터
     */
    collectFieldData() {
        const form = document.getElementById('fieldBuilderForm');
        if (!form) return null;

        const formData = new FormData(form);
        const fieldData = {
            id: this.currentEditingField?.id || this.generateFieldId(),
            type: formData.get('fieldType') || document.getElementById('fieldType')?.value,
            name: formData.get('fieldName') || document.getElementById('fieldName')?.value,
            label: formData.get('fieldLabel') || document.getElementById('fieldLabel')?.value,
            description: formData.get('fieldDescription') || document.getElementById('fieldDescription')?.value,
            config: this.collectFieldConfig()
        };

        return fieldData;
    }

    /**
     * 필드 설정 수집
     * @returns {Object} 필드 설정
     */
    collectFieldConfig() {
        const config = {};
        
        // 공통 설정
        const requiredInput = document.getElementById('fieldRequired');
        if (requiredInput) {
            config.required = requiredInput.checked;
        }

        // 필드별 특화 설정
        const configInputs = document.querySelectorAll('#fieldConfigContainer input, #fieldConfigContainer select');
        configInputs.forEach(input => {
            if (input.id && input.id !== 'fieldRequired') {
                const key = input.id.replace('field', '').toLowerCase();
                
                if (input.type === 'checkbox') {
                    config[key] = input.checked;
                } else if (input.type === 'number') {
                    config[key] = input.value ? parseFloat(input.value) : null;
                } else {
                    config[key] = input.value;
                }
            }
        });

        // 옵션 필드 처리
        const optionsList = document.getElementById('optionsList');
        if (optionsList) {
            config.options = this.collectOptions();
        }

        return config;
    }

    /**
     * 옵션 수집
     * @returns {Array} 옵션 배열
     */
    collectOptions() {
        const options = [];
        const optionGroups = document.querySelectorAll('#optionsList .input-group');
        
        optionGroups.forEach(group => {
            const valueInput = group.querySelector('.option-value');
            const labelInput = group.querySelector('.option-label');
            
            if (valueInput && labelInput && valueInput.value.trim()) {
                options.push({
                    value: valueInput.value.trim(),
                    label: labelInput.value.trim() || valueInput.value.trim()
                });
            }
        });

        return options;
    }

    /**
     * 필드 HTML 생성
     * @param {Object} fieldData - 필드 데이터
     * @returns {string} HTML
     */
    generateFieldHTML(fieldData) {
        const { type, name, label, description, config } = fieldData;
        
        let html = `
            <div class="mb-3">
                <label for="preview_${name}" class="form-label">
                    ${label}
                    ${config.required ? '<span class="text-danger">*</span>' : ''}
                </label>
        `;

        switch (type) {
            case 'text':
            case 'email':
            case 'url':
                html += `<input type="${type}" class="form-control" id="preview_${name}" 
                                placeholder="${config.placeholder || ''}" 
                                ${config.required ? 'required' : ''}>`;
                break;
            case 'textarea':
                html += `<textarea class="form-control" id="preview_${name}" 
                                  rows="${config.rows || 3}" 
                                  placeholder="${config.placeholder || ''}" 
                                  ${config.required ? 'required' : ''}></textarea>`;
                break;
            case 'number':
                html += `<input type="number" class="form-control" id="preview_${name}" 
                                ${config.min !== null ? `min="${config.min}"` : ''} 
                                ${config.max !== null ? `max="${config.max}"` : ''} 
                                step="${config.step || 1}" 
                                ${config.required ? 'required' : ''}>`;
                break;
            case 'date':
            case 'datetime':
                html += `<input type="${type === 'datetime' ? 'datetime-local' : 'date'}" 
                                class="form-control" id="preview_${name}" 
                                ${config.required ? 'required' : ''}>`;
                break;
            case 'select':
                html += `<select class="form-select" id="preview_${name}" 
                                ${config.required ? 'required' : ''}>
                            <option value="">선택하세요</option>`;
                (config.options || []).forEach(option => {
                    html += `<option value="${option.value}">${option.label}</option>`;
                });
                html += `</select>`;
                break;
            case 'radio':
                (config.options || []).forEach((option, index) => {
                    html += `
                        <div class="form-check">
                            <input class="form-check-input" type="radio" 
                                   name="preview_${name}" id="preview_${name}_${index}" 
                                   value="${option.value}">
                            <label class="form-check-label" for="preview_${name}_${index}">
                                ${option.label}
                            </label>
                        </div>
                    `;
                });
                break;
            case 'checkbox':
                (config.options || []).forEach((option, index) => {
                    html += `
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" 
                                   name="preview_${name}[]" id="preview_${name}_${index}" 
                                   value="${option.value}">
                            <label class="form-check-label" for="preview_${name}_${index}">
                                ${option.label}
                            </label>
                        </div>
                    `;
                });
                break;
            case 'file':
                html += `<input type="file" class="form-control" id="preview_${name}" 
                                ${config.multiple ? 'multiple' : ''} 
                                ${config.accept ? `accept="${config.accept}"` : ''} 
                                ${config.required ? 'required' : ''}>`;
                break;
            case 'color':
                html += `<input type="color" class="form-control form-control-color" 
                                id="preview_${name}" value="${config.defaultValue || '#000000'}">`;
                break;
        }

        if (description) {
            html += `<div class="form-text">${description}</div>`;
        }

        html += `</div>`;
        return html;
    }

    /**
     * 필드 저장
     */
    saveField() {
        const fieldData = this.collectFieldData();
        if (!fieldData) {
            UIUtils.showAlert('필드 데이터를 수집할 수 없습니다.', 'error');
            return;
        }

        // 유효성 검사
        if (!fieldData.name || !fieldData.label) {
            UIUtils.showAlert('필드 이름과 라벨은 필수입니다.', 'warning');
            return;
        }

        // 이름 중복 검사
        const existingField = this.customFields.find(f => f.name === fieldData.name && f.id !== fieldData.id);
        if (existingField) {
            UIUtils.showAlert('같은 이름의 필드가 이미 존재합니다.', 'warning');
            return;
        }

        try {
            if (fieldData.id && this.customFields.find(f => f.id === fieldData.id)) {
                // 기존 필드 업데이트
                const index = this.customFields.findIndex(f => f.id === fieldData.id);
                this.customFields[index] = fieldData;
            } else {
                // 새 필드 추가
                fieldData.order = this.customFields.length;
                this.customFields.push(fieldData);
            }

            this.saveCustomFields();
            this.renderCustomFields();
            
            // 모달 닫기
            const modal = bootstrap.Modal.getInstance(document.getElementById('fieldBuilderModal'));
            if (modal) modal.hide();

            UIUtils.showAlert('필드가 저장되었습니다.', 'success');
        } catch (error) {
            console.error('필드 저장 오류:', error);
            UIUtils.showAlert('필드 저장 중 오류가 발생했습니다.', 'error');
        }
    }

    /**
     * 필드 편집
     * @param {string} fieldId - 필드 ID
     */
    editField(fieldId) {
        const field = this.customFields.find(f => f.id === fieldId);
        if (!field) return;

        this.currentEditingField = { ...field };
        this.showFieldBuilderModal();
    }

    /**
     * 필드 복사
     * @param {string} fieldId - 필드 ID
     */
    duplicateField(fieldId) {
        const field = this.customFields.find(f => f.id === fieldId);
        if (!field) return;

        const duplicatedField = {
            ...field,
            id: this.generateFieldId(),
            name: `${field.name}_copy`,
            label: `${field.label} (복사본)`,
            order: this.customFields.length
        };

        this.customFields.push(duplicatedField);
        this.saveCustomFields();
        this.renderCustomFields();
        
        UIUtils.showAlert('필드가 복사되었습니다.', 'success');
    }

    /**
     * 필드 삭제
     * @param {string} fieldId - 필드 ID
     */
    deleteField(fieldId) {
        const field = this.customFields.find(f => f.id === fieldId);
        if (!field) return;

        UIUtils.showConfirm(`'${field.label}' 필드를 삭제하시겠습니까?`, (confirmed) => {
            if (confirmed) {
                this.customFields = this.customFields.filter(f => f.id !== fieldId);
                this.saveCustomFields();
                this.renderCustomFields();
                UIUtils.showAlert('필드가 삭제되었습니다.', 'success');
            }
        });
    }

    /**
     * 필드 순서 변경
     * @param {HTMLElement} draggedElement - 드래그된 요소
     * @param {HTMLElement} dropTarget - 드롭 대상
     */
    reorderFields(draggedElement, dropTarget) {
        const draggedId = draggedElement.dataset.fieldId;
        const targetId = dropTarget.dataset.fieldId;

        const draggedIndex = this.customFields.findIndex(f => f.id === draggedId);
        const targetIndex = this.customFields.findIndex(f => f.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        // 배열에서 요소 이동
        const [draggedField] = this.customFields.splice(draggedIndex, 1);
        this.customFields.splice(targetIndex, 0, draggedField);

        // 순서 업데이트
        this.customFields.forEach((field, index) => {
            field.order = index;
        });

        this.saveCustomFields();
        this.renderCustomFields();
        
        UIUtils.showAlert('필드 순서가 변경되었습니다.', 'success');
    }

    /**
     * 필드 ID 생성
     * @returns {string} 고유 필드 ID
     */
    generateFieldId() {
        return `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 커스텀 필드 로드
     */
    loadCustomFields() {
        try {
            this.customFields = SettingsStorage.getCustomFields() || [];
        } catch (error) {
            console.error('커스텀 필드 로드 오류:', error);
            this.customFields = [];
        }
    }

    /**
     * 커스텀 필드 저장
     */
    saveCustomFields() {
        try {
            SettingsStorage.saveCustomFields(this.customFields);
        } catch (error) {
            console.error('커스텀 필드 저장 오류:', error);
        }
    }

    /**
     * 현재 커스텀 필드 반환
     * @returns {Array} 커스텀 필드 배열
     */
    getCurrentFields() {
        return [...this.customFields];
    }

    /**
     * 커스텀 필드 내보내기
     * @returns {Object} 필드 데이터
     */
    exportFields() {
        return {
            fields: this.getCurrentFields(),
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
    }

    /**
     * 커스텀 필드 가져오기
     * @param {Object} data - 가져올 필드 데이터
     */
    importFields(data) {
        try {
            if (data.fields && Array.isArray(data.fields)) {
                this.customFields = data.fields;
                this.saveCustomFields();
                this.renderCustomFields();
                UIUtils.showAlert('커스텀 필드를 가져왔습니다.', 'success');
            }
        } catch (error) {
            console.error('커스텀 필드 가져오기 오류:', error);
            UIUtils.showAlert('커스텀 필드 가져오기 중 오류가 발생했습니다.', 'error');
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
        this.currentEditingField = null;
        this.draggedElement = null;
    }
}

export default FieldBuilderManager; 