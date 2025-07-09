/**
 * AI 모델 설정 및 관리 모듈
 * AI 모델 선택, 매개변수 설정, 성능 테스트를 관리합니다.
 */

import SettingsStorage from '../core/settings-storage.js';
import SettingsAPI from '../core/settings-api.js';
import UIUtils from '../../../common/ui-utils.js';

/**
 * AI 모델 매니저 클래스
 */
class ModelManager {
    constructor() {
        this.cleanupFunctions = [];
        this.modelConfigs = this.initializeModelConfigs();
        this.currentProvider = null;
    }

    /**
     * 기본 모델 설정 초기화
     * @returns {Object} 모델 설정 객체
     */
    initializeModelConfigs() {
        return {
            openai: {
                models: [
                    {
                        id: 'gpt-4',
                        name: 'GPT-4',
                        description: '가장 강력한 언어 모델',
                        maxTokens: 8192,
                        pricing: 'High',
                        capabilities: ['text', 'chat', 'analysis']
                    },
                    {
                        id: 'gpt-4-turbo',
                        name: 'GPT-4 Turbo',
                        description: '향상된 성능과 효율성',
                        maxTokens: 128000,
                        pricing: 'Medium',
                        capabilities: ['text', 'chat', 'analysis', 'code']
                    },
                    {
                        id: 'gpt-3.5-turbo',
                        name: 'GPT-3.5 Turbo',
                        description: '빠르고 비용 효율적',
                        maxTokens: 4096,
                        pricing: 'Low',
                        capabilities: ['text', 'chat']
                    }
                ],
                parameters: {
                    temperature: { min: 0, max: 2, default: 0.7, step: 0.1 },
                    max_tokens: { min: 1, max: 4096, default: 1000, step: 1 },
                    top_p: { min: 0, max: 1, default: 1, step: 0.1 },
                    frequency_penalty: { min: 0, max: 2, default: 0, step: 0.1 },
                    presence_penalty: { min: 0, max: 2, default: 0, step: 0.1 }
                }
            },
            anthropic: {
                models: [
                    {
                        id: 'claude-3-opus-20240229',
                        name: 'Claude 3 Opus',
                        description: '최고 성능의 Claude 모델',
                        maxTokens: 200000,
                        pricing: 'High',
                        capabilities: ['text', 'chat', 'analysis', 'reasoning']
                    },
                    {
                        id: 'claude-3-sonnet-20240229',
                        name: 'Claude 3 Sonnet',
                        description: '균형잡힌 성능과 속도',
                        maxTokens: 200000,
                        pricing: 'Medium',
                        capabilities: ['text', 'chat', 'analysis']
                    },
                    {
                        id: 'claude-3-haiku-20240307',
                        name: 'Claude 3 Haiku',
                        description: '빠른 응답과 효율성',
                        maxTokens: 200000,
                        pricing: 'Low',
                        capabilities: ['text', 'chat']
                    }
                ],
                parameters: {
                    max_tokens: { min: 1, max: 4096, default: 1000, step: 1 },
                    temperature: { min: 0, max: 1, default: 0.7, step: 0.1 },
                    top_p: { min: 0, max: 1, default: 1, step: 0.1 },
                    top_k: { min: 1, max: 100, default: 40, step: 1 }
                }
            },
            azure: {
                models: [
                    {
                        id: 'gpt-4',
                        name: 'Azure GPT-4',
                        description: 'Azure 환경의 GPT-4',
                        maxTokens: 8192,
                        pricing: 'High',
                        capabilities: ['text', 'chat', 'analysis']
                    },
                    {
                        id: 'gpt-35-turbo',
                        name: 'Azure GPT-3.5 Turbo',
                        description: 'Azure 환경의 GPT-3.5',
                        maxTokens: 4096,
                        pricing: 'Medium',
                        capabilities: ['text', 'chat']
                    }
                ],
                parameters: {
                    temperature: { min: 0, max: 2, default: 0.7, step: 0.1 },
                    max_tokens: { min: 1, max: 4096, default: 1000, step: 1 },
                    top_p: { min: 0, max: 1, default: 1, step: 0.1 }
                }
            },
            local: {
                models: [
                    {
                        id: 'llama2-7b',
                        name: 'Llama 2 7B',
                        description: '경량화된 로컬 모델',
                        maxTokens: 4096,
                        pricing: 'Free',
                        capabilities: ['text', 'chat']
                    },
                    {
                        id: 'llama2-13b',
                        name: 'Llama 2 13B',
                        description: '중간 크기 로컬 모델',
                        maxTokens: 4096,
                        pricing: 'Free',
                        capabilities: ['text', 'chat', 'analysis']
                    },
                    {
                        id: 'mistral-7b',
                        name: 'Mistral 7B',
                        description: '효율적인 오픈소스 모델',
                        maxTokens: 8192,
                        pricing: 'Free',
                        capabilities: ['text', 'chat', 'code']
                    }
                ],
                parameters: {
                    temperature: { min: 0, max: 1, default: 0.7, step: 0.1 },
                    max_tokens: { min: 1, max: 2048, default: 500, step: 1 },
                    top_p: { min: 0, max: 1, default: 0.9, step: 0.1 },
                    top_k: { min: 1, max: 100, default: 40, step: 1 }
                }
            }
        };
    }

    /**
     * 초기화
     */
    initialize() {
        this.setupEventListeners();
        this.loadCurrentSettings();
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 모델 선택 이벤트
        const modelSelect = document.getElementById('aiModelSelect');
        if (modelSelect) {
            const handleModelChange = () => {
                this.updateModelParameters();
                this.saveModelSettings();
            };
            
            modelSelect.addEventListener('change', handleModelChange);
            this.cleanupFunctions.push(() => {
                modelSelect.removeEventListener('change', handleModelChange);
            });
        }

        // 매개변수 설정 이벤트
        const parameterInputs = document.querySelectorAll('[id^="param_"]');
        parameterInputs.forEach(input => {
            const handleParameterChange = () => {
                this.updateParameterDisplay(input);
                this.saveModelSettings();
            };
            
            input.addEventListener('input', handleParameterChange);
            this.cleanupFunctions.push(() => {
                input.removeEventListener('input', handleParameterChange);
            });
        });

        // 모델 테스트 버튼
        const testModelBtn = document.getElementById('testModelBtn');
        if (testModelBtn) {
            const handleTestModel = () => {
                this.testCurrentModel();
            };
            
            testModelBtn.addEventListener('click', handleTestModel);
            this.cleanupFunctions.push(() => {
                testModelBtn.removeEventListener('click', handleTestModel);
            });
        }

        // 기본값 복원 버튼
        const resetParametersBtn = document.getElementById('resetParametersBtn');
        if (resetParametersBtn) {
            const handleResetParameters = () => {
                this.resetToDefaults();
            };
            
            resetParametersBtn.addEventListener('click', handleResetParameters);
            this.cleanupFunctions.push(() => {
                resetParametersBtn.removeEventListener('click', handleResetParameters);
            });
        }
    }

    /**
     * 제공자 변경 시 모델 목록 업데이트
     * @param {string} provider - AI 제공자
     */
    updateModelsForProvider(provider) {
        this.currentProvider = provider;
        const modelSelect = document.getElementById('aiModelSelect');
        if (!modelSelect || !this.modelConfigs[provider]) return;

        // 기존 옵션 제거
        modelSelect.innerHTML = '<option value="">모델을 선택하세요</option>';

        // 새 모델 옵션 추가
        this.modelConfigs[provider].models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = `${model.name} - ${model.description}`;
            option.dataset.maxTokens = model.maxTokens;
            option.dataset.pricing = model.pricing;
            option.dataset.capabilities = JSON.stringify(model.capabilities);
            modelSelect.appendChild(option);
        });

        // 매개변수 설정 영역 업데이트
        this.updateParameterControls();
    }

    /**
     * 매개변수 컨트롤 업데이트
     */
    updateParameterControls() {
        const parametersContainer = document.getElementById('modelParametersContainer');
        if (!parametersContainer || !this.currentProvider) return;

        const parameters = this.modelConfigs[this.currentProvider].parameters;
        
        let html = '<h6>모델 매개변수</h6>';
        
        Object.entries(parameters).forEach(([paramName, config]) => {
            html += `
                <div class="mb-3">
                    <label for="param_${paramName}" class="form-label">
                        ${this.getParameterDisplayName(paramName)}
                        <span class="text-muted">(${config.min} - ${config.max})</span>
                    </label>
                    <div class="row">
                        <div class="col-8">
                            <input type="range" class="form-range" 
                                   id="param_${paramName}" 
                                   min="${config.min}" 
                                   max="${config.max}" 
                                   step="${config.step}" 
                                   value="${config.default}">
                        </div>
                        <div class="col-4">
                            <input type="number" class="form-control form-control-sm" 
                                   id="param_${paramName}_value" 
                                   min="${config.min}" 
                                   max="${config.max}" 
                                   step="${config.step}" 
                                   value="${config.default}">
                        </div>
                    </div>
                    <small class="form-text text-muted">
                        ${this.getParameterDescription(paramName)}
                    </small>
                </div>
            `;
        });

        parametersContainer.innerHTML = html;

        // 새로 생성된 요소들에 이벤트 리스너 추가
        this.setupParameterEventListeners();
    }

    /**
     * 매개변수 이벤트 리스너 설정
     */
    setupParameterEventListeners() {
        const paramInputs = document.querySelectorAll('[id^="param_"]');
        paramInputs.forEach(input => {
            const paramName = input.id.replace('param_', '').replace('_value', '');
            
            if (input.type === 'range') {
                const handleRangeChange = () => {
                    const valueInput = document.getElementById(`param_${paramName}_value`);
                    if (valueInput) {
                        valueInput.value = input.value;
                    }
                    this.saveModelSettings();
                };
                
                input.addEventListener('input', handleRangeChange);
                this.cleanupFunctions.push(() => {
                    input.removeEventListener('input', handleRangeChange);
                });
            } else if (input.type === 'number') {
                const handleNumberChange = () => {
                    const rangeInput = document.getElementById(`param_${paramName}`);
                    if (rangeInput) {
                        rangeInput.value = input.value;
                    }
                    this.saveModelSettings();
                };
                
                input.addEventListener('input', handleNumberChange);
                this.cleanupFunctions.push(() => {
                    input.removeEventListener('input', handleNumberChange);
                });
            }
        });
    }

    /**
     * 모델 정보 표시 업데이트
     */
    updateModelParameters() {
        const modelSelect = document.getElementById('aiModelSelect');
        const selectedOption = modelSelect.selectedOptions[0];
        
        if (!selectedOption || !selectedOption.value) {
            this.clearModelInfo();
            return;
        }

        // 모델 정보 표시
        this.displayModelInfo(selectedOption);
    }

    /**
     * 모델 정보 표시
     * @param {HTMLOptionElement} option - 선택된 옵션
     */
    displayModelInfo(option) {
        const infoContainer = document.getElementById('modelInfoContainer');
        if (!infoContainer) return;

        const capabilities = JSON.parse(option.dataset.capabilities || '[]');
        
        const html = `
            <div class="card">
                <div class="card-body">
                    <h6 class="card-title">모델 정보</h6>
                    <div class="row">
                        <div class="col-6">
                            <small class="text-muted">최대 토큰</small><br>
                            <strong>${option.dataset.maxTokens.toLocaleString()}</strong>
                        </div>
                        <div class="col-6">
                            <small class="text-muted">가격 수준</small><br>
                            <span class="badge ${this.getPricingBadgeClass(option.dataset.pricing)}">
                                ${option.dataset.pricing}
                            </span>
                        </div>
                    </div>
                    <div class="mt-2">
                        <small class="text-muted">지원 기능</small><br>
                        ${capabilities.map(cap => `<span class="badge bg-secondary me-1">${cap}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;

        infoContainer.innerHTML = html;
    }

    /**
     * 모델 정보 영역 초기화
     */
    clearModelInfo() {
        const infoContainer = document.getElementById('modelInfoContainer');
        if (infoContainer) {
            infoContainer.innerHTML = '';
        }
    }

    /**
     * 현재 모델 테스트
     */
    async testCurrentModel() {
        const modelSelect = document.getElementById('aiModelSelect');
        if (!modelSelect.value) {
            UIUtils.showAlert('테스트할 모델을 선택해주세요.', 'warning');
            return;
        }

        const testBtn = document.getElementById('testModelBtn');
        const originalText = testBtn.textContent;
        
        try {
            testBtn.disabled = true;
            testBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>테스트 중...';

            const modelSettings = this.getCurrentModelSettings();
            const testPrompt = '안녕하세요. 간단한 연결 테스트입니다.';

            const result = await SettingsAPI.testModel({
                provider: this.currentProvider,
                model: modelSettings.model,
                parameters: modelSettings.parameters,
                prompt: testPrompt
            });

            if (result.success) {
                UIUtils.showAlert('모델 테스트가 성공했습니다.', 'success');
                this.displayTestResult(result);
            } else {
                UIUtils.showAlert(`모델 테스트에 실패했습니다: ${result.error}`, 'error');
            }
        } catch (error) {
            console.error('모델 테스트 오류:', error);
            UIUtils.showAlert('모델 테스트 중 오류가 발생했습니다.', 'error');
        } finally {
            testBtn.disabled = false;
            testBtn.textContent = originalText;
        }
    }

    /**
     * 테스트 결과 표시
     * @param {Object} result - 테스트 결과
     */
    displayTestResult(result) {
        const resultContainer = document.getElementById('testResultContainer');
        if (!resultContainer) return;

        const html = `
            <div class="alert alert-success">
                <h6>테스트 결과</h6>
                <div class="row">
                    <div class="col-4">
                        <small class="text-muted">응답 시간</small><br>
                        <strong>${result.responseTime}ms</strong>
                    </div>
                    <div class="col-4">
                        <small class="text-muted">토큰 사용량</small><br>
                        <strong>${result.tokensUsed}</strong>
                    </div>
                    <div class="col-4">
                        <small class="text-muted">상태</small><br>
                        <span class="badge bg-success">성공</span>
                    </div>
                </div>
                <div class="mt-2">
                    <small class="text-muted">응답 내용</small><br>
                    <div class="border rounded p-2 bg-light">
                        ${result.response}
                    </div>
                </div>
            </div>
        `;

        resultContainer.innerHTML = html;
    }

    /**
     * 기본값으로 복원
     */
    resetToDefaults() {
        if (!this.currentProvider) return;

        UIUtils.showConfirm('모든 매개변수를 기본값으로 복원하시겠습니까?', (confirmed) => {
            if (confirmed) {
                const parameters = this.modelConfigs[this.currentProvider].parameters;
                
                Object.entries(parameters).forEach(([paramName, config]) => {
                    const rangeInput = document.getElementById(`param_${paramName}`);
                    const valueInput = document.getElementById(`param_${paramName}_value`);
                    
                    if (rangeInput) rangeInput.value = config.default;
                    if (valueInput) valueInput.value = config.default;
                });

                this.saveModelSettings();
                UIUtils.showAlert('매개변수가 기본값으로 복원되었습니다.', 'success');
            }
        });
    }

    /**
     * 현재 모델 설정 반환
     * @returns {Object} 현재 모델 설정
     */
    getCurrentModelSettings() {
        const modelSelect = document.getElementById('aiModelSelect');
        const settings = {
            provider: this.currentProvider,
            model: modelSelect.value,
            parameters: {}
        };

        if (this.currentProvider && this.modelConfigs[this.currentProvider]) {
            const parameters = this.modelConfigs[this.currentProvider].parameters;
            
            Object.keys(parameters).forEach(paramName => {
                const input = document.getElementById(`param_${paramName}`);
                if (input) {
                    settings.parameters[paramName] = parseFloat(input.value);
                }
            });
        }

        return settings;
    }

    /**
     * 모델 설정 저장
     */
    saveModelSettings() {
        const settings = this.getCurrentModelSettings();
        SettingsStorage.saveAISettings('model', settings);
    }

    /**
     * 현재 설정 로드
     */
    loadCurrentSettings() {
        const settings = SettingsStorage.getAISettings('model');
        if (settings && this.currentProvider === settings.provider) {
            // 모델 선택
            const modelSelect = document.getElementById('aiModelSelect');
            if (modelSelect) {
                modelSelect.value = settings.model || '';
            }

            // 매개변수 설정
            if (settings.parameters) {
                Object.entries(settings.parameters).forEach(([paramName, value]) => {
                    const rangeInput = document.getElementById(`param_${paramName}`);
                    const valueInput = document.getElementById(`param_${paramName}_value`);
                    
                    if (rangeInput) rangeInput.value = value;
                    if (valueInput) valueInput.value = value;
                });
            }

            this.updateModelParameters();
        }
    }

    /**
     * 매개변수 표시 이름 반환
     * @param {string} paramName - 매개변수 이름
     * @returns {string} 표시 이름
     */
    getParameterDisplayName(paramName) {
        const names = {
            temperature: 'Temperature (창의성)',
            max_tokens: 'Max Tokens (최대 토큰)',
            top_p: 'Top P (다양성)',
            top_k: 'Top K (선택 범위)',
            frequency_penalty: 'Frequency Penalty (반복 억제)',
            presence_penalty: 'Presence Penalty (주제 확장)'
        };
        return names[paramName] || paramName;
    }

    /**
     * 매개변수 설명 반환
     * @param {string} paramName - 매개변수 이름
     * @returns {string} 설명
     */
    getParameterDescription(paramName) {
        const descriptions = {
            temperature: '높을수록 더 창의적이지만 일관성이 떨어집니다',
            max_tokens: '응답의 최대 길이를 제한합니다',
            top_p: '응답의 다양성을 조절합니다',
            top_k: '각 단계에서 고려할 토큰 수를 제한합니다',
            frequency_penalty: '같은 표현의 반복을 억제합니다',
            presence_penalty: '새로운 주제로의 확장을 촉진합니다'
        };
        return descriptions[paramName] || '';
    }

    /**
     * 가격 배지 클래스 반환
     * @param {string} pricing - 가격 수준
     * @returns {string} CSS 클래스
     */
    getPricingBadgeClass(pricing) {
        const classes = {
            'Free': 'bg-success',
            'Low': 'bg-info',
            'Medium': 'bg-warning',
            'High': 'bg-danger'
        };
        return classes[pricing] || 'bg-secondary';
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

export default ModelManager; 