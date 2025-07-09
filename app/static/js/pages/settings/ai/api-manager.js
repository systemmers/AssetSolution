/**
 * AI API 설정 및 관리 모듈
 * API 키 관리, 엔드포인트 설정, 연결 테스트를 담당합니다.
 */

import SettingsStorage from '../core/settings-storage.js';
import SettingsAPI from '../core/settings-api.js';
import UIUtils from '../../../common/ui-utils.js';

/**
 * AI API 매니저 클래스
 */
class APIManager {
    constructor() {
        this.cleanupFunctions = [];
        this.apiConfigs = this.initializeAPIConfigs();
        this.currentProvider = null;
    }

    /**
     * 기본 API 설정 초기화
     * @returns {Object} API 설정 객체
     */
    initializeAPIConfigs() {
        return {
            openai: {
                name: 'OpenAI',
                fields: [
                    {
                        key: 'apiKey',
                        label: 'API Key',
                        type: 'password',
                        required: true,
                        placeholder: 'sk-...',
                        description: 'OpenAI API 키를 입력하세요'
                    },
                    {
                        key: 'baseURL',
                        label: 'Base URL',
                        type: 'url',
                        required: false,
                        placeholder: 'https://api.openai.com/v1',
                        description: '기본값 사용 시 비워두세요'
                    },
                    {
                        key: 'organization',
                        label: 'Organization ID',
                        type: 'text',
                        required: false,
                        placeholder: 'org-...',
                        description: '조직 ID (선택사항)'
                    }
                ],
                testEndpoint: '/api/ai/test/openai',
                documentation: 'https://platform.openai.com/docs'
            },
            anthropic: {
                name: 'Anthropic',
                fields: [
                    {
                        key: 'apiKey',
                        label: 'API Key',
                        type: 'password',
                        required: true,
                        placeholder: 'sk-ant-...',
                        description: 'Anthropic API 키를 입력하세요'
                    },
                    {
                        key: 'baseURL',
                        label: 'Base URL',
                        type: 'url',
                        required: false,
                        placeholder: 'https://api.anthropic.com',
                        description: '기본값 사용 시 비워두세요'
                    },
                    {
                        key: 'version',
                        label: 'API Version',
                        type: 'text',
                        required: false,
                        placeholder: '2023-06-01',
                        description: 'API 버전 (기본값: 최신)'
                    }
                ],
                testEndpoint: '/api/ai/test/anthropic',
                documentation: 'https://docs.anthropic.com'
            },
            azure: {
                name: 'Azure OpenAI',
                fields: [
                    {
                        key: 'apiKey',
                        label: 'API Key',
                        type: 'password',
                        required: true,
                        placeholder: 'Azure API Key',
                        description: 'Azure OpenAI API 키를 입력하세요'
                    },
                    {
                        key: 'endpoint',
                        label: 'Endpoint',
                        type: 'url',
                        required: true,
                        placeholder: 'https://your-resource.openai.azure.com',
                        description: 'Azure OpenAI 엔드포인트'
                    },
                    {
                        key: 'deploymentName',
                        label: 'Deployment Name',
                        type: 'text',
                        required: true,
                        placeholder: 'your-deployment-name',
                        description: '모델 배포 이름'
                    },
                    {
                        key: 'apiVersion',
                        label: 'API Version',
                        type: 'text',
                        required: false,
                        placeholder: '2023-12-01-preview',
                        description: 'API 버전'
                    }
                ],
                testEndpoint: '/api/ai/test/azure',
                documentation: 'https://docs.microsoft.com/azure/cognitive-services/openai'
            },
            local: {
                name: 'Local AI',
                fields: [
                    {
                        key: 'endpoint',
                        label: 'Local Endpoint',
                        type: 'url',
                        required: true,
                        placeholder: 'http://localhost:8080',
                        description: '로컬 AI 서버 엔드포인트'
                    },
                    {
                        key: 'apiKey',
                        label: 'API Key',
                        type: 'password',
                        required: false,
                        placeholder: '인증이 필요한 경우',
                        description: 'API 키 (선택사항)'
                    },
                    {
                        key: 'modelPath',
                        label: 'Model Path',
                        type: 'text',
                        required: false,
                        placeholder: '/models/llama2',
                        description: '모델 경로 (서버 설정에 따라)'
                    },
                    {
                        key: 'timeout',
                        label: 'Timeout (seconds)',
                        type: 'number',
                        required: false,
                        placeholder: '30',
                        description: '요청 타임아웃 시간'
                    }
                ],
                testEndpoint: '/api/ai/test/local',
                documentation: null
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
        // API 키 표시/숨김 토글
        const toggleButtons = document.querySelectorAll('.toggle-api-key');
        toggleButtons.forEach(button => {
            const handleToggle = () => {
                this.togglePasswordVisibility(button);
            };
            
            button.addEventListener('click', handleToggle);
            this.cleanupFunctions.push(() => {
                button.removeEventListener('click', handleToggle);
            });
        });

        // API 연결 테스트 버튼
        const testButtons = document.querySelectorAll('.test-api-connection');
        testButtons.forEach(button => {
            const handleTest = () => {
                const provider = button.dataset.provider;
                this.testAPIConnection(provider);
            };
            
            button.addEventListener('click', handleTest);
            this.cleanupFunctions.push(() => {
                button.removeEventListener('click', handleTest);
            });
        });

        // 설정 저장 버튼
        const saveButtons = document.querySelectorAll('.save-api-settings');
        saveButtons.forEach(button => {
            const handleSave = () => {
                const provider = button.dataset.provider;
                this.saveAPISettings(provider);
            };
            
            button.addEventListener('click', handleSave);
            this.cleanupFunctions.push(() => {
                button.removeEventListener('click', handleSave);
            });
        });

        // 설정 초기화 버튼
        const resetButtons = document.querySelectorAll('.reset-api-settings');
        resetButtons.forEach(button => {
            const handleReset = () => {
                const provider = button.dataset.provider;
                this.resetAPISettings(provider);
            };
            
            button.addEventListener('click', handleReset);
            this.cleanupFunctions.push(() => {
                button.removeEventListener('click', handleReset);
            });
        });

        // 문서 링크 버튼
        const docButtons = document.querySelectorAll('.open-api-docs');
        docButtons.forEach(button => {
            const handleDocOpen = () => {
                const provider = button.dataset.provider;
                this.openAPIDocumentation(provider);
            };
            
            button.addEventListener('click', handleDocOpen);
            this.cleanupFunctions.push(() => {
                button.removeEventListener('click', handleDocOpen);
            });
        });
    }

    /**
     * 제공자별 API 설정 폼 생성
     * @param {string} provider - AI 제공자
     */
    createAPISettingsForm(provider) {
        const container = document.getElementById(`${provider}APISettings`);
        if (!container || !this.apiConfigs[provider]) return;

        const config = this.apiConfigs[provider];
        
        let html = `
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h6 class="mb-0">${config.name} API 설정</h6>
                    <div class="btn-group btn-group-sm">
                        ${config.documentation ? `
                            <button type="button" class="btn btn-outline-info open-api-docs" 
                                    data-provider="${provider}">
                                <i class="fas fa-book"></i> 문서
                            </button>
                        ` : ''}
                        <button type="button" class="btn btn-outline-primary test-api-connection" 
                                data-provider="${provider}">
                            <i class="fas fa-plug"></i> 연결 테스트
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <form id="${provider}APIForm">
        `;

        config.fields.forEach(field => {
            html += `
                <div class="mb-3">
                    <label for="${provider}_${field.key}" class="form-label">
                        ${field.label}
                        ${field.required ? '<span class="text-danger">*</span>' : ''}
                    </label>
                    <div class="input-group">
                        <input type="${field.type}" 
                               class="form-control" 
                               id="${provider}_${field.key}"
                               name="${field.key}"
                               placeholder="${field.placeholder}"
                               ${field.required ? 'required' : ''}>
                        ${field.type === 'password' ? `
                            <button type="button" class="btn btn-outline-secondary toggle-api-key" 
                                    data-target="${provider}_${field.key}">
                                <i class="fas fa-eye"></i>
                            </button>
                        ` : ''}
                    </div>
                    <small class="form-text text-muted">${field.description}</small>
                </div>
            `;
        });

        html += `
                    </form>
                    <div class="d-flex justify-content-between">
                        <button type="button" class="btn btn-outline-danger reset-api-settings" 
                                data-provider="${provider}">
                            <i class="fas fa-undo"></i> 초기화
                        </button>
                        <button type="button" class="btn btn-primary save-api-settings" 
                                data-provider="${provider}">
                            <i class="fas fa-save"></i> 저장
                        </button>
                    </div>
                    <div id="${provider}TestResult" class="mt-3"></div>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    /**
     * 모든 제공자의 API 설정 폼 생성
     */
    createAllAPISettingsForms() {
        Object.keys(this.apiConfigs).forEach(provider => {
            this.createAPISettingsForm(provider);
        });
    }

    /**
     * 비밀번호 표시/숨김 토글
     * @param {HTMLElement} button - 토글 버튼
     */
    togglePasswordVisibility(button) {
        const targetId = button.dataset.target;
        const input = document.getElementById(targetId);
        const icon = button.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }

    /**
     * API 연결 테스트
     * @param {string} provider - AI 제공자
     */
    async testAPIConnection(provider) {
        const config = this.apiConfigs[provider];
        const form = document.getElementById(`${provider}APIForm`);
        const testButton = document.querySelector(`.test-api-connection[data-provider="${provider}"]`);
        const resultContainer = document.getElementById(`${provider}TestResult`);
        
        if (!form || !testButton || !resultContainer) return;

        // 폼 데이터 수집
        const formData = new FormData(form);
        const apiSettings = {};
        
        for (const [key, value] of formData.entries()) {
            if (value.trim()) {
                apiSettings[key] = value.trim();
            }
        }

        // 필수 필드 검증
        const requiredFields = config.fields.filter(f => f.required);
        const missingFields = requiredFields.filter(field => !apiSettings[field.key]);
        
        if (missingFields.length > 0) {
            const fieldNames = missingFields.map(f => f.label).join(', ');
            UIUtils.showAlert(`다음 필수 필드를 입력해주세요: ${fieldNames}`, 'warning');
            return;
        }

        // 테스트 시작
        const originalText = testButton.innerHTML;
        testButton.disabled = true;
        testButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>테스트 중...';
        
        try {
            const response = await SettingsAPI.testAPIConnection(provider, apiSettings);
            
            if (response.success) {
                this.displayTestSuccess(resultContainer, response);
                UIUtils.showAlert('API 연결 테스트에 성공했습니다.', 'success');
            } else {
                this.displayTestError(resultContainer, response.error);
                UIUtils.showAlert(`API 연결 테스트에 실패했습니다: ${response.error}`, 'error');
            }
        } catch (error) {
            console.error('API 테스트 오류:', error);
            this.displayTestError(resultContainer, error.message);
            UIUtils.showAlert('API 연결 테스트 중 오류가 발생했습니다.', 'error');
        } finally {
            testButton.disabled = false;
            testButton.innerHTML = originalText;
        }
    }

    /**
     * 테스트 성공 결과 표시
     * @param {HTMLElement} container - 결과 컨테이너
     * @param {Object} response - 응답 데이터
     */
    displayTestSuccess(container, response) {
        const html = `
            <div class="alert alert-success">
                <div class="d-flex align-items-center">
                    <i class="fas fa-check-circle me-2"></i>
                    <strong>연결 성공</strong>
                </div>
                <div class="row mt-2">
                    <div class="col-4">
                        <small class="text-muted">응답 시간</small><br>
                        <strong>${response.responseTime || 'N/A'}ms</strong>
                    </div>
                    <div class="col-4">
                        <small class="text-muted">상태</small><br>
                        <span class="badge bg-success">정상</span>
                    </div>
                    <div class="col-4">
                        <small class="text-muted">테스트 시간</small><br>
                        <strong>${new Date().toLocaleTimeString()}</strong>
                    </div>
                </div>
                ${response.modelInfo ? `
                    <div class="mt-2">
                        <small class="text-muted">사용 가능한 모델</small><br>
                        <div class="border rounded p-2 bg-light">
                            ${response.modelInfo.models ? response.modelInfo.models.slice(0, 3).join(', ') : '정보 없음'}
                            ${response.modelInfo.models && response.modelInfo.models.length > 3 ? ` 외 ${response.modelInfo.models.length - 3}개` : ''}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        container.innerHTML = html;
    }

    /**
     * 테스트 실패 결과 표시
     * @param {HTMLElement} container - 결과 컨테이너
     * @param {string} error - 오류 메시지
     */
    displayTestError(container, error) {
        const html = `
            <div class="alert alert-danger">
                <div class="d-flex align-items-center">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    <strong>연결 실패</strong>
                </div>
                <div class="mt-2">
                    <small class="text-muted">오류 내용</small><br>
                    <code>${error}</code>
                </div>
                <div class="mt-2">
                    <small class="text-muted">확인사항</small>
                    <ul class="small mb-0">
                        <li>API 키가 올바른지 확인하세요</li>
                        <li>네트워크 연결을 확인하세요</li>
                        <li>API 사용량 한도를 확인하세요</li>
                        <li>엔드포인트 URL이 정확한지 확인하세요</li>
                    </ul>
                </div>
            </div>
        `;
        container.innerHTML = html;
    }

    /**
     * API 설정 저장
     * @param {string} provider - AI 제공자
     */
    saveAPISettings(provider) {
        const form = document.getElementById(`${provider}APIForm`);
        const saveButton = document.querySelector(`.save-api-settings[data-provider="${provider}"]`);
        
        if (!form || !saveButton) return;

        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        const formData = new FormData(form);
        const apiSettings = {};
        
        for (const [key, value] of formData.entries()) {
            apiSettings[key] = value.trim();
        }

        try {
            SettingsStorage.saveAISettings(`api_${provider}`, apiSettings);
            UIUtils.showAlert(`${this.apiConfigs[provider].name} API 설정이 저장되었습니다.`, 'success');
            
            // 저장 성공 피드백
            const originalText = saveButton.innerHTML;
            saveButton.innerHTML = '<i class="fas fa-check"></i> 저장됨';
            saveButton.classList.remove('btn-primary');
            saveButton.classList.add('btn-success');
            
            setTimeout(() => {
                saveButton.innerHTML = originalText;
                saveButton.classList.remove('btn-success');
                saveButton.classList.add('btn-primary');
            }, 2000);
            
        } catch (error) {
            console.error('API 설정 저장 오류:', error);
            UIUtils.showAlert('API 설정 저장 중 오류가 발생했습니다.', 'error');
        }
    }

    /**
     * API 설정 초기화
     * @param {string} provider - AI 제공자
     */
    resetAPISettings(provider) {
        UIUtils.showConfirm(`${this.apiConfigs[provider].name} API 설정을 초기화하시겠습니까?`, (confirmed) => {
            if (confirmed) {
                const form = document.getElementById(`${provider}APIForm`);
                if (form) {
                    form.reset();
                    form.classList.remove('was-validated');
                }

                // 로컬 스토리지에서 삭제
                SettingsStorage.removeAISettings(`api_${provider}`);
                
                // 테스트 결과 초기화
                const resultContainer = document.getElementById(`${provider}TestResult`);
                if (resultContainer) {
                    resultContainer.innerHTML = '';
                }

                UIUtils.showAlert(`${this.apiConfigs[provider].name} API 설정이 초기화되었습니다.`, 'success');
            }
        });
    }

    /**
     * API 문서 열기
     * @param {string} provider - AI 제공자
     */
    openAPIDocumentation(provider) {
        const config = this.apiConfigs[provider];
        if (config.documentation) {
            window.open(config.documentation, '_blank');
        }
    }

    /**
     * 현재 설정 로드
     */
    loadCurrentSettings() {
        Object.keys(this.apiConfigs).forEach(provider => {
            const settings = SettingsStorage.getAISettings(`api_${provider}`);
            if (settings) {
                this.loadProviderSettings(provider, settings);
            }
        });
    }

    /**
     * 제공자별 설정 로드
     * @param {string} provider - AI 제공자
     * @param {Object} settings - 설정 데이터
     */
    loadProviderSettings(provider, settings) {
        const config = this.apiConfigs[provider];
        
        config.fields.forEach(field => {
            const input = document.getElementById(`${provider}_${field.key}`);
            if (input && settings[field.key]) {
                input.value = settings[field.key];
            }
        });
    }

    /**
     * 특정 제공자의 API 설정 반환
     * @param {string} provider - AI 제공자
     * @returns {Object|null} API 설정
     */
    getProviderSettings(provider) {
        return SettingsStorage.getAISettings(`api_${provider}`);
    }

    /**
     * 모든 제공자의 API 설정 반환
     * @returns {Object} 모든 API 설정
     */
    getAllProviderSettings() {
        const allSettings = {};
        Object.keys(this.apiConfigs).forEach(provider => {
            allSettings[provider] = this.getProviderSettings(provider);
        });
        return allSettings;
    }

    /**
     * API 설정 유효성 검사
     * @param {string} provider - AI 제공자
     * @returns {boolean} 유효성 여부
     */
    validateProviderSettings(provider) {
        const settings = this.getProviderSettings(provider);
        if (!settings) return false;

        const config = this.apiConfigs[provider];
        const requiredFields = config.fields.filter(f => f.required);
        
        return requiredFields.every(field => settings[field.key] && settings[field.key].trim());
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

export default APIManager; 