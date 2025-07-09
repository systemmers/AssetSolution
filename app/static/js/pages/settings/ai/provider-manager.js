/**
 * AI 제공자 관리 모듈
 * AI 서비스 제공자별 설정과 모델 관리를 담당합니다.
 */

import SettingsStorage from '../core/settings-storage.js';
import SettingsAPI from '../core/settings-api.js';
import UIUtils from '../../../common/ui-utils.js';

/**
 * AI 제공자 매니저 클래스
 */
class AIProviderManager {
    constructor() {
        this.providers = {
            openai: {
                name: 'OpenAI',
                models: [
                    { id: 'gpt-4', name: 'GPT-4', description: '가장 강력한 모델' },
                    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: '빠르고 효율적인 GPT-4' },
                    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: '균형 잡힌 성능' }
                ],
                apiKeyLabel: 'OpenAI API Key',
                baseUrl: 'https://api.openai.com/v1',
                requiredFields: ['apiKey']
            },
            anthropic: {
                name: 'Anthropic',
                models: [
                    { id: 'claude-3-opus', name: 'Claude 3 Opus', description: '최고 성능 모델' },
                    { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', description: '균형 잡힌 모델' },
                    { id: 'claude-3-haiku', name: 'Claude 3 Haiku', description: '빠른 응답 모델' }
                ],
                apiKeyLabel: 'Anthropic API Key',
                baseUrl: 'https://api.anthropic.com',
                requiredFields: ['apiKey']
            },
            azure: {
                name: 'Azure OpenAI',
                models: [
                    { id: 'gpt-4', name: 'GPT-4', description: 'Azure GPT-4' },
                    { id: 'gpt-35-turbo', name: 'GPT-3.5 Turbo', description: 'Azure GPT-3.5' }
                ],
                apiKeyLabel: 'Azure API Key',
                baseUrl: '',
                requiredFields: ['apiKey', 'endpoint', 'deployment']
            },
            local: {
                name: 'Local API',
                models: [
                    { id: 'custom', name: 'Custom Model', description: '사용자 정의 모델' }
                ],
                apiKeyLabel: 'API Key (선택사항)',
                baseUrl: 'http://localhost:8000',
                requiredFields: ['baseUrl']
            }
        };
        
        this.cleanupFunctions = [];
        this.currentSettings = null;
    }

    /**
     * 초기화
     */
    initialize() {
        this.loadSettings();
        this.setupEventListeners();
        this.updateUI();
    }

    /**
     * 설정 로드
     */
    loadSettings() {
        this.currentSettings = SettingsStorage.getAISettings();
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 제공자 변경
        const providerSelect = document.getElementById('aiProvider');
        if (providerSelect) {
            const handleProviderChange = () => {
                this.updateModelOptions(providerSelect.value);
                this.updateProviderFields(providerSelect.value);
            };
            
            providerSelect.addEventListener('change', handleProviderChange);
            this.cleanupFunctions.push(() => {
                providerSelect.removeEventListener('change', handleProviderChange);
            });
        }

        // API 키 표시/숨김 토글
        const toggleBtn = document.getElementById('toggleApiKey');
        if (toggleBtn) {
            const handleToggle = () => {
                this.toggleApiKeyVisibility();
            };
            
            toggleBtn.addEventListener('click', handleToggle);
            this.cleanupFunctions.push(() => {
                toggleBtn.removeEventListener('click', handleToggle);
            });
        }

        // 연결 테스트
        const testBtn = document.getElementById('testConnection');
        if (testBtn) {
            const handleTest = () => {
                this.testConnection();
            };
            
            testBtn.addEventListener('click', handleTest);
            this.cleanupFunctions.push(() => {
                testBtn.removeEventListener('click', handleTest);
            });
        }

        // AI 설정 저장
        const saveBtn = document.getElementById('saveAiSettings');
        if (saveBtn) {
            const handleSave = () => {
                this.saveSettings();
            };
            
            saveBtn.addEventListener('click', handleSave);
            this.cleanupFunctions.push(() => {
                saveBtn.removeEventListener('click', handleSave);
            });
        }

        // AI 기능 토글
        const aiEnabledCheckbox = document.getElementById('aiEnabled');
        if (aiEnabledCheckbox) {
            const handleEnabledChange = () => {
                this.toggleAIFeatures(aiEnabledCheckbox.checked);
            };
            
            aiEnabledCheckbox.addEventListener('change', handleEnabledChange);
            this.cleanupFunctions.push(() => {
                aiEnabledCheckbox.removeEventListener('change', handleEnabledChange);
            });
        }
    }

    /**
     * UI 업데이트
     */
    updateUI() {
        const settings = this.currentSettings;
        
        // 제공자 선택
        const providerSelect = document.getElementById('aiProvider');
        if (providerSelect) {
            providerSelect.value = settings.provider;
        }

        // 모델 업데이트
        this.updateModelOptions(settings.provider);

        // 모델 선택
        const modelSelect = document.getElementById('aiModel');
        if (modelSelect) {
            modelSelect.value = settings.model;
        }

        // API 키
        const apiKeyInput = document.getElementById('apiKey');
        if (apiKeyInput) {
            apiKeyInput.value = settings.apiKey;
        }

        // AI 활성화
        const aiEnabledCheckbox = document.getElementById('aiEnabled');
        if (aiEnabledCheckbox) {
            aiEnabledCheckbox.checked = settings.enabled;
        }

        // 제공자별 필드 업데이트
        this.updateProviderFields(settings.provider);

        // AI 기능 토글
        this.toggleAIFeatures(settings.enabled);
    }

    /**
     * 모델 옵션 업데이트
     * @param {string} provider - 제공자 ID
     */
    updateModelOptions(provider) {
        const modelSelect = document.getElementById('aiModel');
        if (!modelSelect) return;

        const providerInfo = this.providers[provider];
        if (!providerInfo) return;

        // 기존 옵션 제거
        modelSelect.innerHTML = '';

        // 새 옵션 추가
        providerInfo.models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = `${model.name} - ${model.description}`;
            modelSelect.appendChild(option);
        });
    }

    /**
     * 제공자별 필드 업데이트
     * @param {string} provider - 제공자 ID
     */
    updateProviderFields(provider) {
        const providerInfo = this.providers[provider];
        if (!providerInfo) return;

        // API 키 레이블 업데이트
        const apiKeyLabel = document.querySelector('label[for="apiKey"]');
        if (apiKeyLabel) {
            apiKeyLabel.textContent = providerInfo.apiKeyLabel;
        }

        // Azure 전용 필드 표시/숨김
        const azureFields = document.getElementById('azureFields');
        if (azureFields) {
            azureFields.style.display = provider === 'azure' ? 'block' : 'none';
        }

        // Local API 전용 필드 표시/숨김
        const localFields = document.getElementById('localFields');
        if (localFields) {
            localFields.style.display = provider === 'local' ? 'block' : 'none';
        }

        // Base URL 설정
        const baseUrlInput = document.getElementById('baseUrl');
        if (baseUrlInput && provider === 'local') {
            baseUrlInput.value = providerInfo.baseUrl;
        }
    }

    /**
     * API 키 표시/숨김 토글
     */
    toggleApiKeyVisibility() {
        const apiKeyInput = document.getElementById('apiKey');
        const toggleBtn = document.getElementById('toggleApiKey');
        const icon = toggleBtn.querySelector('i');
        
        if (apiKeyInput.type === 'password') {
            apiKeyInput.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            apiKeyInput.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }

    /**
     * AI 기능 토글
     * @param {boolean} enabled - 활성화 여부
     */
    toggleAIFeatures(enabled) {
        const aiSettingsContainer = document.getElementById('aiSettingsContainer');
        const featureToggles = document.querySelectorAll('.ai-feature-toggle');
        
        if (aiSettingsContainer) {
            aiSettingsContainer.style.display = enabled ? 'block' : 'none';
        }

        featureToggles.forEach(toggle => {
            toggle.disabled = !enabled;
        });
    }

    /**
     * 연결 테스트
     */
    async testConnection() {
        const testBtn = document.getElementById('testConnection');
        const originalText = testBtn.textContent;
        
        try {
            // UI 상태 변경
            testBtn.disabled = true;
            testBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>연결 중...';

            // 현재 설정 수집
            const connectionData = this.gatherConnectionData();
            
            // API 호출
            const result = await SettingsAPI.testAIConnection(connectionData);
            
            if (result.success) {
                UIUtils.showAlert('AI 서비스 연결이 성공했습니다!', 'success');
                
                // 연결 정보 표시
                const infoHtml = `
                    <div class="mt-3 p-3 bg-light rounded">
                        <h6>연결 정보</h6>
                        <ul class="mb-0">
                            <li>모델: ${result.model || 'N/A'}</li>
                            <li>응답 시간: ${result.responseTime || 'N/A'}ms</li>
                            <li>API 버전: ${result.apiVersion || 'N/A'}</li>
                        </ul>
                    </div>
                `;
                document.getElementById('connectionInfo').innerHTML = infoHtml;
            } else {
                UIUtils.showAlert(`연결 실패: ${result.error}`, 'error');
                document.getElementById('connectionInfo').innerHTML = '';
            }
        } catch (error) {
            console.error('연결 테스트 오류:', error);
            UIUtils.showAlert('연결 테스트 중 오류가 발생했습니다.', 'error');
            document.getElementById('connectionInfo').innerHTML = '';
        } finally {
            // UI 상태 복원
            testBtn.disabled = false;
            testBtn.textContent = originalText;
        }
    }

    /**
     * 연결 데이터 수집
     * @returns {Object} 연결 설정 데이터
     */
    gatherConnectionData() {
        const provider = document.getElementById('aiProvider').value;
        const model = document.getElementById('aiModel').value;
        const apiKey = document.getElementById('apiKey').value;
        
        const data = {
            provider,
            model,
            apiKey
        };

        // Azure 전용 필드
        if (provider === 'azure') {
            data.endpoint = document.getElementById('azureEndpoint')?.value;
            data.deployment = document.getElementById('azureDeployment')?.value;
        }

        // Local API 전용 필드
        if (provider === 'local') {
            data.baseUrl = document.getElementById('baseUrl')?.value;
        }

        return data;
    }

    /**
     * 설정 저장
     */
    async saveSettings() {
        try {
            const settings = this.gatherConnectionData();
            
            // 기능 설정 추가
            settings.enabled = document.getElementById('aiEnabled').checked;
            settings.features = {
                imageAnalysis: document.getElementById('imageAnalysis')?.checked || false,
                documentAnalysis: document.getElementById('documentAnalysis')?.checked || false,
                dataAnalysis: document.getElementById('dataAnalysis')?.checked || false
            };

            // 로컬 저장
            SettingsStorage.setAISettings(settings);
            
            // 서버 저장
            await SettingsAPI.saveAISettings(settings);
            
            this.currentSettings = settings;
            UIUtils.showAlert('AI 설정이 저장되었습니다.', 'success');
        } catch (error) {
            console.error('AI 설정 저장 오류:', error);
            UIUtils.showAlert('설정 저장 중 오류가 발생했습니다.', 'error');
        }
    }

    /**
     * 제공자 정보 가져오기
     * @param {string} provider - 제공자 ID
     * @returns {Object|null} 제공자 정보
     */
    getProviderInfo(provider) {
        return this.providers[provider] || null;
    }

    /**
     * 설정 유효성 검사
     * @param {Object} settings - 검사할 설정
     * @returns {Object} 검사 결과
     */
    validateSettings(settings) {
        const result = { valid: true, errors: [] };
        
        if (!settings.provider) {
            result.valid = false;
            result.errors.push('AI 제공자를 선택해주세요.');
        }

        if (!settings.model) {
            result.valid = false;
            result.errors.push('AI 모델을 선택해주세요.');
        }

        const providerInfo = this.providers[settings.provider];
        if (providerInfo) {
            providerInfo.requiredFields.forEach(field => {
                if (!settings[field]) {
                    result.valid = false;
                    result.errors.push(`${field}는 필수 항목입니다.`);
                }
            });
        }

        return result;
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

export default AIProviderManager; 