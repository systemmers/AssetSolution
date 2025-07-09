/**
 * AI 설정 모듈 통합 진입점
 * AI 제공자, 모델, API 관리 모듈들을 통합 관리합니다.
 */

import ProviderManager from './provider-manager.js';
import ModelManager from './model-manager.js';
import APIManager from './api-manager.js';

/**
 * AI 설정 통합 관리 클래스
 */
class AISettingsManager {
    constructor() {
        this.providerManager = null;
        this.modelManager = null;
        this.apiManager = null;
        this.currentProvider = null;
        this.cleanupFunctions = [];
    }

    /**
     * 초기화
     */
    initialize() {
        try {
            // 각 매니저 인스턴스 생성
            this.providerManager = new ProviderManager();
            this.modelManager = new ModelManager();
            this.apiManager = new APIManager();

            // 이벤트 리스너 설정
            this.setupProviderChangeListener();

            // 각 매니저 초기화
            this.providerManager.initialize();
            this.modelManager.initialize();
            this.apiManager.initialize();

            // API 설정 폼 생성
            this.apiManager.createAllAPISettingsForms();

            // 현재 제공자 로드
            this.loadCurrentProvider();

            console.log('AI 설정 모듈 초기화 완료');
        } catch (error) {
            console.error('AI 설정 모듈 초기화 오류:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * 제공자 변경 이벤트 리스너 설정
     */
    setupProviderChangeListener() {
        // 제공자 매니저의 변경 이벤트 리스닝
        const providerSelect = document.getElementById('aiProviderSelect');
        if (providerSelect) {
            const handleProviderChange = (event) => {
                const newProvider = event.target.value;
                this.switchProvider(newProvider);
            };
            
            providerSelect.addEventListener('change', handleProviderChange);
            this.cleanupFunctions.push(() => {
                providerSelect.removeEventListener('change', handleProviderChange);
            });
        }

        // 설정 탭 변경 이벤트
        const aiTabs = document.querySelectorAll('[data-bs-toggle="tab"][data-ai-tab]');
        aiTabs.forEach(tab => {
            const handleTabChange = (event) => {
                const tabType = event.target.dataset.aiTab;
                this.handleTabChange(tabType);
            };
            
            tab.addEventListener('shown.bs.tab', handleTabChange);
            this.cleanupFunctions.push(() => {
                tab.removeEventListener('shown.bs.tab', handleTabChange);
            });
        });
    }

    /**
     * 제공자 전환
     * @param {string} provider - 새로운 AI 제공자
     */
    switchProvider(provider) {
        if (this.currentProvider === provider) return;

        this.currentProvider = provider;
        
        try {
            // 모델 매니저 업데이트
            if (this.modelManager && provider) {
                this.modelManager.updateModelsForProvider(provider);
            }

            // UI 업데이트
            this.updateProviderUI(provider);

            // 제공자별 설정 로드
            this.loadProviderSpecificSettings(provider);

            console.log(`AI 제공자가 ${provider}로 변경되었습니다.`);
        } catch (error) {
            console.error('제공자 전환 오류:', error);
            this.handleProviderSwitchError(error, provider);
        }
    }

    /**
     * 제공자별 UI 업데이트
     * @param {string} provider - AI 제공자
     */
    updateProviderUI(provider) {
        // 제공자별 설정 패널 표시/숨김
        const settingsPanels = document.querySelectorAll('.provider-settings-panel');
        settingsPanels.forEach(panel => {
            if (panel.dataset.provider === provider) {
                panel.style.display = 'block';
            } else {
                panel.style.display = 'none';
            }
        });

        // 제공자별 안내 메시지 업데이트
        this.updateProviderGuidance(provider);

        // 설정 상태 표시 업데이트
        this.updateConfigurationStatus(provider);
    }

    /**
     * 제공자별 안내 메시지 업데이트
     * @param {string} provider - AI 제공자
     */
    updateProviderGuidance(provider) {
        const guidanceContainer = document.getElementById('providerGuidance');
        if (!guidanceContainer) return;

        const guidanceMap = {
            openai: {
                title: 'OpenAI 설정 안내',
                content: `
                    <ul>
                        <li>OpenAI API 키는 <a href="https://platform.openai.com/api-keys" target="_blank">OpenAI 플랫폼</a>에서 발급받을 수 있습니다.</li>
                        <li>API 사용량에 따라 요금이 부과됩니다. <a href="https://openai.com/pricing" target="_blank">요금표</a>를 확인하세요.</li>
                        <li>GPT-4는 높은 품질을 제공하지만 비용이 높습니다. 일반적인 용도에는 GPT-3.5 Turbo를 권장합니다.</li>
                    </ul>
                `
            },
            anthropic: {
                title: 'Anthropic 설정 안내',
                content: `
                    <ul>
                        <li>Anthropic API 키는 <a href="https://console.anthropic.com/" target="_blank">Anthropic Console</a>에서 발급받을 수 있습니다.</li>
                        <li>Claude는 긴 문맥 처리에 특화되어 있습니다 (최대 200K 토큰).</li>
                        <li>Claude 3 Haiku는 빠른 응답이 필요한 작업에 적합합니다.</li>
                    </ul>
                `
            },
            azure: {
                title: 'Azure OpenAI 설정 안내',
                content: `
                    <ul>
                        <li>Azure OpenAI 서비스는 별도의 신청 및 승인이 필요합니다.</li>
                        <li>엔드포인트와 배포 이름은 Azure Portal에서 확인할 수 있습니다.</li>
                        <li>기업용 보안 및 컴플라이언스가 필요한 경우 권장됩니다.</li>
                    </ul>
                `
            },
            local: {
                title: '로컬 AI 설정 안내',
                content: `
                    <ul>
                        <li>로컬 AI 서버를 먼저 설치하고 실행해야 합니다 (Ollama, LM Studio 등).</li>
                        <li>모델은 로컬 서버에서 관리됩니다. 충분한 하드웨어 사양이 필요합니다.</li>
                        <li>인터넷 연결 없이 사용할 수 있으며, 데이터가 외부로 전송되지 않습니다.</li>
                    </ul>
                `
            }
        };

        const guidance = guidanceMap[provider];
        if (guidance) {
            guidanceContainer.innerHTML = `
                <div class="alert alert-info">
                    <h6>${guidance.title}</h6>
                    ${guidance.content}
                </div>
            `;
        } else {
            guidanceContainer.innerHTML = '';
        }
    }

    /**
     * 설정 상태 표시 업데이트
     * @param {string} provider - AI 제공자
     */
    updateConfigurationStatus(provider) {
        const statusContainer = document.getElementById('configurationStatus');
        if (!statusContainer) return;

        const isAPIConfigured = this.apiManager.validateProviderSettings(provider);
        const providerConfig = this.providerManager.getProviderConfig(provider);
        
        let statusHtml = '<div class="d-flex align-items-center mb-2">';
        
        // API 설정 상태
        if (isAPIConfigured) {
            statusHtml += '<span class="badge bg-success me-2"><i class="fas fa-check"></i> API 설정 완료</span>';
        } else {
            statusHtml += '<span class="badge bg-warning me-2"><i class="fas fa-exclamation-triangle"></i> API 설정 필요</span>';
        }

        // 연결 상태
        if (providerConfig && providerConfig.lastTestResult === 'success') {
            statusHtml += '<span class="badge bg-success"><i class="fas fa-wifi"></i> 연결 확인됨</span>';
        } else {
            statusHtml += '<span class="badge bg-secondary"><i class="fas fa-wifi"></i> 연결 미확인</span>';
        }

        statusHtml += '</div>';

        statusContainer.innerHTML = statusHtml;
    }

    /**
     * 제공자별 설정 로드
     * @param {string} provider - AI 제공자
     */
    loadProviderSpecificSettings(provider) {
        try {
            // 모델 설정 로드
            if (this.modelManager) {
                this.modelManager.loadCurrentSettings();
            }

            // API 설정은 이미 apiManager.loadCurrentSettings()에서 처리됨
        } catch (error) {
            console.error('제공자별 설정 로드 오류:', error);
        }
    }

    /**
     * 탭 변경 처리
     * @param {string} tabType - 탭 유형
     */
    handleTabChange(tabType) {
        try {
            switch (tabType) {
                case 'provider':
                    // 제공자 설정 탭 활성화 시
                    if (this.providerManager) {
                        this.providerManager.refreshProviderList();
                    }
                    break;
                case 'model':
                    // 모델 설정 탭 활성화 시
                    if (this.modelManager && this.currentProvider) {
                        this.modelManager.updateModelsForProvider(this.currentProvider);
                    }
                    break;
                case 'api':
                    // API 설정 탭 활성화 시
                    if (this.apiManager) {
                        this.apiManager.loadCurrentSettings();
                    }
                    break;
            }
        } catch (error) {
            console.error('탭 변경 처리 오류:', error);
        }
    }

    /**
     * 현재 제공자 로드
     */
    loadCurrentProvider() {
        try {
            const currentProvider = this.providerManager.getCurrentProvider();
            if (currentProvider) {
                this.switchProvider(currentProvider);
            }
        } catch (error) {
            console.error('현재 제공자 로드 오류:', error);
        }
    }

    /**
     * 전체 AI 설정 내보내기
     * @returns {Object} AI 설정 데이터
     */
    exportSettings() {
        try {
            return {
                provider: this.currentProvider,
                providerSettings: this.providerManager ? this.providerManager.getAllProviderSettings() : {},
                modelSettings: this.modelManager ? this.modelManager.getCurrentModelSettings() : {},
                apiSettings: this.apiManager ? this.apiManager.getAllProviderSettings() : {}
            };
        } catch (error) {
            console.error('AI 설정 내보내기 오류:', error);
            return null;
        }
    }

    /**
     * 전체 AI 설정 가져오기
     * @param {Object} settings - AI 설정 데이터
     */
    importSettings(settings) {
        try {
            if (settings.provider) {
                this.switchProvider(settings.provider);
            }

            if (settings.providerSettings && this.providerManager) {
                this.providerManager.importSettings(settings.providerSettings);
            }

            if (settings.modelSettings && this.modelManager) {
                this.modelManager.importSettings(settings.modelSettings);
            }

            if (settings.apiSettings && this.apiManager) {
                this.apiManager.importSettings(settings.apiSettings);
            }

            console.log('AI 설정 가져오기 완료');
        } catch (error) {
            console.error('AI 설정 가져오기 오류:', error);
            throw error;
        }
    }

    /**
     * 초기화 오류 처리
     * @param {Error} error - 발생한 오류
     */
    handleInitializationError(error) {
        const errorContainer = document.getElementById('aiSettingsError');
        if (errorContainer) {
            errorContainer.innerHTML = `
                <div class="alert alert-danger">
                    <h6>AI 설정 초기화 오류</h6>
                    <p>AI 설정 모듈을 초기화하는 중 오류가 발생했습니다.</p>
                    <details>
                        <summary>오류 상세</summary>
                        <pre>${error.message}</pre>
                    </details>
                </div>
            `;
        }
    }

    /**
     * 제공자 전환 오류 처리
     * @param {Error} error - 발생한 오류
     * @param {string} provider - 전환하려던 제공자
     */
    handleProviderSwitchError(error, provider) {
        console.error(`제공자 ${provider} 전환 실패:`, error);
        
        // 이전 제공자로 복원 시도
        const providerSelect = document.getElementById('aiProviderSelect');
        if (providerSelect && this.currentProvider) {
            providerSelect.value = this.currentProvider;
        }
    }

    /**
     * 현재 설정 유효성 검사
     * @returns {Object} 검사 결과
     */
    validateCurrentSettings() {
        const validation = {
            isValid: true,
            errors: [],
            warnings: []
        };

        try {
            if (!this.currentProvider) {
                validation.isValid = false;
                validation.errors.push('AI 제공자가 선택되지 않았습니다.');
                return validation;
            }

            // API 설정 검사
            if (this.apiManager && !this.apiManager.validateProviderSettings(this.currentProvider)) {
                validation.isValid = false;
                validation.errors.push(`${this.currentProvider} API 설정이 완료되지 않았습니다.`);
            }

            // 모델 설정 검사
            if (this.modelManager) {
                const modelSettings = this.modelManager.getCurrentModelSettings();
                if (!modelSettings.model) {
                    validation.warnings.push('모델이 선택되지 않았습니다.');
                }
            }

        } catch (error) {
            validation.isValid = false;
            validation.errors.push(`설정 검사 중 오류: ${error.message}`);
        }

        return validation;
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
        if (this.providerManager && typeof this.providerManager.cleanup === 'function') {
            this.providerManager.cleanup();
        }
        if (this.modelManager && typeof this.modelManager.cleanup === 'function') {
            this.modelManager.cleanup();
        }
        if (this.apiManager && typeof this.apiManager.cleanup === 'function') {
            this.apiManager.cleanup();
        }

        this.providerManager = null;
        this.modelManager = null;
        this.apiManager = null;
        this.currentProvider = null;
    }

    /**
     * 현재 제공자 반환
     * @returns {string|null} 현재 AI 제공자
     */
    getCurrentProvider() {
        return this.currentProvider;
    }

    /**
     * 설정 완료 여부 확인
     * @returns {boolean} 설정 완료 여부
     */
    isConfigured() {
        const validation = this.validateCurrentSettings();
        return validation.isValid;
    }
}

// 전역 인스턴스 생성 및 내보내기
const aiSettingsManager = new AISettingsManager();

export default aiSettingsManager; 