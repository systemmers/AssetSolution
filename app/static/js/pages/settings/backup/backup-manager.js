/**
 * 백업 관리 모듈
 * 데이터 백업, 복원, 내보내기, 가져오기를 담당합니다.
 */

import SettingsStorage from '../core/settings-storage.js';
import SettingsAPI from '../core/settings-api.js';
import UIUtils from '../../../common/ui-utils.js';

/**
 * 백업 매니저 클래스
 */
class BackupManager {
    constructor() {
        this.cleanupFunctions = [];
        this.backupTypes = this.initializeBackupTypes();
        this.currentBackupJob = null;
        this.restorePreview = null;
    }

    /**
     * 백업 유형 정의 초기화
     * @returns {Object} 백업 유형 정의
     */
    initializeBackupTypes() {
        return {
            settings: {
                name: '설정 데이터',
                description: '시스템 설정, 환경설정, 알림설정 등',
                icon: 'fas fa-cogs',
                size: 'small',
                frequency: 'daily'
            },
            categories: {
                name: '카테고리 데이터',
                description: '자산 카테고리 트리 구조 및 설정',
                icon: 'fas fa-sitemap',
                size: 'medium',
                frequency: 'weekly'
            },
            fields: {
                name: '필드 설정',
                description: '커스텀 필드 정의 및 검증 규칙',
                icon: 'fas fa-list-ul',
                size: 'small',
                frequency: 'weekly'
            },
            ai: {
                name: 'AI 설정',
                description: 'AI 제공업체 설정 및 모델 구성',
                icon: 'fas fa-robot',
                size: 'small',
                frequency: 'monthly'
            },
            assets: {
                name: '자산 데이터',
                description: '자산 정보, 이력, 첨부파일 등',
                icon: 'fas fa-boxes',
                size: 'large',
                frequency: 'daily'
            },
            contracts: {
                name: '계약 데이터',
                description: '계약 정보, 문서, 조건 등',
                icon: 'fas fa-file-contract',
                size: 'medium',
                frequency: 'weekly'
            },
            operations: {
                name: '운영 데이터',
                description: '유지보수 이력, 작업 기록 등',
                icon: 'fas fa-clipboard-list',
                size: 'large',
                frequency: 'daily'
            },
            users: {
                name: '사용자 데이터',
                description: '사용자 계정, 권한, 프로필 등',
                icon: 'fas fa-users',
                size: 'small',
                frequency: 'weekly'
            }
        };
    }

    /**
     * 초기화
     */
    initialize() {
        this.setupEventListeners();
        this.renderBackupTypes();
        this.loadBackupHistory();
        this.checkAutoBackupStatus();
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 백업 생성 버튼
        const createBackupBtn = document.getElementById('createBackupBtn');
        if (createBackupBtn) {
            const handleCreateBackup = () => {
                this.showBackupModal();
            };
            
            createBackupBtn.addEventListener('click', handleCreateBackup);
            this.cleanupFunctions.push(() => {
                createBackupBtn.removeEventListener('click', handleCreateBackup);
            });
        }

        // 백업 실행 버튼
        const executeBackupBtn = document.getElementById('executeBackupBtn');
        if (executeBackupBtn) {
            const handleExecuteBackup = () => {
                this.executeBackup();
            };
            
            executeBackupBtn.addEventListener('click', handleExecuteBackup);
            this.cleanupFunctions.push(() => {
                executeBackupBtn.removeEventListener('click', handleExecuteBackup);
            });
        }

        // 파일 선택 (복원용)
        const restoreFileInput = document.getElementById('restoreFileInput');
        if (restoreFileInput) {
            const handleFileSelect = (event) => {
                this.handleRestoreFileSelect(event);
            };
            
            restoreFileInput.addEventListener('change', handleFileSelect);
            this.cleanupFunctions.push(() => {
                restoreFileInput.removeEventListener('change', handleFileSelect);
            });
        }

        // 복원 실행 버튼
        const executeRestoreBtn = document.getElementById('executeRestoreBtn');
        if (executeRestoreBtn) {
            const handleExecuteRestore = () => {
                this.executeRestore();
            };
            
            executeRestoreBtn.addEventListener('click', handleExecuteRestore);
            this.cleanupFunctions.push(() => {
                executeRestoreBtn.removeEventListener('click', handleExecuteRestore);
            });
        }

        // 자동 백업 설정
        this.setupAutoBackupSettings();

        // 전체 선택/해제
        const selectAllCheckbox = document.getElementById('selectAllBackupTypes');
        if (selectAllCheckbox) {
            const handleSelectAll = () => {
                this.toggleAllBackupTypes(selectAllCheckbox.checked);
            };
            
            selectAllCheckbox.addEventListener('change', handleSelectAll);
            this.cleanupFunctions.push(() => {
                selectAllCheckbox.removeEventListener('change', handleSelectAll);
            });
        }
    }

    /**
     * 자동 백업 설정 이벤트 리스너
     */
    setupAutoBackupSettings() {
        // 자동 백업 활성화
        const autoBackupToggle = document.getElementById('enableAutoBackup');
        if (autoBackupToggle) {
            const handleAutoBackupToggle = () => {
                this.toggleAutoBackup(autoBackupToggle.checked);
            };
            
            autoBackupToggle.addEventListener('change', handleAutoBackupToggle);
            this.cleanupFunctions.push(() => {
                autoBackupToggle.removeEventListener('change', handleAutoBackupToggle);
            });
        }

        // 백업 주기 설정
        const backupIntervalSelect = document.getElementById('backupInterval');
        if (backupIntervalSelect) {
            const handleIntervalChange = () => {
                this.updateBackupInterval(backupIntervalSelect.value);
            };
            
            backupIntervalSelect.addEventListener('change', handleIntervalChange);
            this.cleanupFunctions.push(() => {
                backupIntervalSelect.removeEventListener('change', handleIntervalChange);
            });
        }

        // 보관 기간 설정
        const retentionDaysInput = document.getElementById('backupRetentionDays');
        if (retentionDaysInput) {
            const handleRetentionChange = () => {
                this.updateBackupRetention(parseInt(retentionDaysInput.value));
            };
            
            retentionDaysInput.addEventListener('change', handleRetentionChange);
            this.cleanupFunctions.push(() => {
                retentionDaysInput.removeEventListener('change', handleRetentionChange);
            });
        }
    }

    /**
     * 백업 유형 렌더링
     */
    renderBackupTypes() {
        const container = document.getElementById('backupTypesContainer');
        if (!container) return;

        let html = '';
        Object.entries(this.backupTypes).forEach(([key, type]) => {
            const sizeClass = this.getSizeClass(type.size);
            const frequencyText = this.getFrequencyText(type.frequency);

            html += `
                <div class="col-md-6 col-lg-4 mb-3">
                    <div class="card h-100">
                        <div class="card-body">
                            <div class="form-check">
                                <input class="form-check-input backup-type-checkbox" 
                                       type="checkbox" 
                                       id="backupType_${key}"
                                       value="${key}">
                                <label class="form-check-label w-100" for="backupType_${key}">
                                    <div class="d-flex align-items-start">
                                        <i class="${type.icon} fa-lg me-3 mt-1 text-primary"></i>
                                        <div class="flex-grow-1">
                                            <h6 class="mb-1">${type.name}</h6>
                                            <p class="small text-muted mb-2">${type.description}</p>
                                            <div class="d-flex justify-content-between">
                                                <span class="badge ${sizeClass}">${type.size}</span>
                                                <small class="text-muted">${frequencyText}</small>
                                            </div>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    /**
     * 크기에 따른 CSS 클래스 반환
     * @param {string} size - 크기
     * @returns {string} CSS 클래스
     */
    getSizeClass(size) {
        const classMap = {
            small: 'bg-success',
            medium: 'bg-warning',
            large: 'bg-danger'
        };
        return classMap[size] || 'bg-secondary';
    }

    /**
     * 주기에 따른 텍스트 반환
     * @param {string} frequency - 주기
     * @returns {string} 텍스트
     */
    getFrequencyText(frequency) {
        const textMap = {
            daily: '매일',
            weekly: '주간',
            monthly: '월간'
        };
        return textMap[frequency] || '기타';
    }

    /**
     * 백업 모달 표시
     */
    showBackupModal() {
        const modal = document.getElementById('backupModal');
        if (!modal) return;

        // 기본 선택 설정
        this.setDefaultBackupSelection();

        // 모달 표시
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }

    /**
     * 기본 백업 선택 설정
     */
    setDefaultBackupSelection() {
        const checkboxes = document.querySelectorAll('.backup-type-checkbox');
        checkboxes.forEach(checkbox => {
            // 기본적으로 설정 관련 데이터 선택
            const defaultTypes = ['settings', 'categories', 'fields', 'ai'];
            checkbox.checked = defaultTypes.includes(checkbox.value);
        });
    }

    /**
     * 모든 백업 유형 토글
     * @param {boolean} checked - 선택 상태
     */
    toggleAllBackupTypes(checked) {
        const checkboxes = document.querySelectorAll('.backup-type-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
        });
    }

    /**
     * 백업 실행
     */
    async executeBackup() {
        const selectedTypes = this.getSelectedBackupTypes();
        
        if (selectedTypes.length === 0) {
            UIUtils.showAlert('백업할 데이터 유형을 선택해주세요.', 'warning');
            return;
        }

        try {
            // 진행 상황 표시
            this.showBackupProgress();

            // 백업 작업 생성
            this.currentBackupJob = {
                id: Date.now().toString(),
                types: selectedTypes,
                startTime: new Date(),
                status: 'running',
                progress: 0,
                data: {}
            };

            // 각 유형별 백업 실행
            for (let i = 0; i < selectedTypes.length; i++) {
                const type = selectedTypes[i];
                this.updateBackupProgress(`${type} 데이터 백업 중...`, (i / selectedTypes.length) * 100);
                
                const data = await this.backupDataType(type);
                this.currentBackupJob.data[type] = data;
                
                // 진행률 업데이트
                this.updateBackupProgress(`${type} 데이터 백업 완료`, ((i + 1) / selectedTypes.length) * 100);
            }

            // 백업 파일 생성
            this.updateBackupProgress('백업 파일 생성 중...', 95);
            const backupFile = this.createBackupFile(this.currentBackupJob);
            
            // 파일 다운로드
            this.downloadBackupFile(backupFile);
            
            // 백업 이력 저장
            await this.saveBackupHistory(this.currentBackupJob);

            this.updateBackupProgress('백업 완료', 100);
            
            setTimeout(() => {
                this.hideBackupProgress();
                const modal = bootstrap.Modal.getInstance(document.getElementById('backupModal'));
                if (modal) modal.hide();
                UIUtils.showAlert('백업이 성공적으로 완료되었습니다.', 'success');
            }, 1000);

        } catch (error) {
            console.error('백업 실행 오류:', error);
            this.hideBackupProgress();
            UIUtils.showAlert('백업 중 오류가 발생했습니다.', 'error');
        }
    }

    /**
     * 선택된 백업 유형 반환
     * @returns {Array} 선택된 백업 유형 배열
     */
    getSelectedBackupTypes() {
        const checkboxes = document.querySelectorAll('.backup-type-checkbox:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    /**
     * 데이터 유형별 백업 수행
     * @param {string} type - 백업할 데이터 유형
     * @returns {Promise<Object>} 백업 데이터
     */
    async backupDataType(type) {
        switch (type) {
            case 'settings':
                return await this.backupSettings();
            case 'categories':
                return await this.backupCategories();
            case 'fields':
                return await this.backupFields();
            case 'ai':
                return await this.backupAISettings();
            case 'assets':
                return await SettingsAPI.backupAssets();
            case 'contracts':
                return await SettingsAPI.backupContracts();
            case 'operations':
                return await SettingsAPI.backupOperations();
            case 'users':
                return await SettingsAPI.backupUsers();
            default:
                throw new Error(`Unknown backup type: ${type}`);
        }
    }

    /**
     * 설정 데이터 백업
     * @returns {Object} 설정 백업 데이터
     */
    async backupSettings() {
        return {
            preferences: SettingsStorage.getGeneralSettings('preferences'),
            notifications: SettingsStorage.getGeneralSettings('notifications'),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 카테고리 데이터 백업
     * @returns {Object} 카테고리 백업 데이터
     */
    async backupCategories() {
        return {
            tree: SettingsStorage.getCategoryTree(),
            presets: SettingsStorage.getCategoryPresets(),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 필드 데이터 백업
     * @returns {Object} 필드 백업 데이터
     */
    async backupFields() {
        return {
            fields: SettingsStorage.getCustomFields(),
            validationRules: SettingsStorage.getValidationRules(),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * AI 설정 백업
     * @returns {Object} AI 설정 백업 데이터
     */
    async backupAISettings() {
        return {
            providers: SettingsStorage.getAIProviders(),
            models: SettingsStorage.getAIModels(),
            apiKeys: SettingsStorage.getAIApiKeys(),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 백업 파일 생성
     * @param {Object} backupJob - 백업 작업 정보
     * @returns {Object} 백업 파일 데이터
     */
    createBackupFile(backupJob) {
        return {
            metadata: {
                id: backupJob.id,
                created: backupJob.startTime.toISOString(),
                types: backupJob.types,
                version: '1.0',
                system: 'Asset Management System'
            },
            data: backupJob.data
        };
    }

    /**
     * 백업 파일 다운로드
     * @param {Object} backupFile - 백업 파일 데이터
     */
    downloadBackupFile(backupFile) {
        const timestamp = new Date().toISOString().slice(0, 16).replace(/[:-]/g, '');
        const filename = `asset_backup_${timestamp}.json`;
        
        const dataStr = JSON.stringify(backupFile, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = filename;
        link.click();
        
        URL.revokeObjectURL(link.href);
    }

    /**
     * 백업 진행률 표시
     */
    showBackupProgress() {
        const progressContainer = document.getElementById('backupProgressContainer');
        if (progressContainer) {
            progressContainer.style.display = 'block';
        }
    }

    /**
     * 백업 진행률 업데이트
     * @param {string} message - 진행 메시지
     * @param {number} progress - 진행률 (0-100)
     */
    updateBackupProgress(message, progress) {
        const messageElement = document.getElementById('backupProgressMessage');
        const progressBar = document.getElementById('backupProgressBar');
        
        if (messageElement) {
            messageElement.textContent = message;
        }
        
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
            progressBar.setAttribute('aria-valuenow', progress);
        }
    }

    /**
     * 백업 진행률 숨김
     */
    hideBackupProgress() {
        const progressContainer = document.getElementById('backupProgressContainer');
        if (progressContainer) {
            progressContainer.style.display = 'none';
        }
    }

    /**
     * 복원 파일 선택 처리
     * @param {Event} event - 파일 선택 이벤트
     */
    async handleRestoreFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const content = await this.readFileContent(file);
            const backupData = JSON.parse(content);
            
            // 백업 파일 유효성 검사
            if (!this.validateBackupFile(backupData)) {
                UIUtils.showAlert('유효하지 않은 백업 파일입니다.', 'error');
                return;
            }

            this.restorePreview = backupData;
            this.showRestorePreview(backupData);
            
        } catch (error) {
            console.error('파일 읽기 오류:', error);
            UIUtils.showAlert('파일을 읽는 중 오류가 발생했습니다.', 'error');
        }
    }

    /**
     * 파일 내용 읽기
     * @param {File} file - 읽을 파일
     * @returns {Promise<string>} 파일 내용
     */
    readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    /**
     * 백업 파일 유효성 검사
     * @param {Object} backupData - 백업 데이터
     * @returns {boolean} 유효성 여부
     */
    validateBackupFile(backupData) {
        return backupData &&
               backupData.metadata &&
               backupData.metadata.version &&
               backupData.data &&
               typeof backupData.data === 'object';
    }

    /**
     * 복원 미리보기 표시
     * @param {Object} backupData - 백업 데이터
     */
    showRestorePreview(backupData) {
        const container = document.getElementById('restorePreviewContainer');
        if (!container) return;

        const { metadata, data } = backupData;
        
        let html = `
            <div class="alert alert-info">
                <h6><i class="fas fa-info-circle me-2"></i>백업 파일 정보</h6>
                <ul class="mb-0">
                    <li>생성일: ${new Date(metadata.created).toLocaleString()}</li>
                    <li>버전: ${metadata.version}</li>
                    <li>포함된 데이터: ${metadata.types.map(t => this.backupTypes[t]?.name || t).join(', ')}</li>
                </ul>
            </div>
            <h6>복원할 데이터 선택</h6>
        `;

        Object.keys(data).forEach(type => {
            const typeInfo = this.backupTypes[type];
            if (typeInfo) {
                html += `
                    <div class="form-check">
                        <input class="form-check-input restore-type-checkbox" 
                               type="checkbox" 
                               id="restoreType_${type}"
                               value="${type}"
                               checked>
                        <label class="form-check-label" for="restoreType_${type}">
                            <i class="${typeInfo.icon} me-2"></i>${typeInfo.name}
                            <small class="text-muted d-block">${typeInfo.description}</small>
                        </label>
                    </div>
                `;
            }
        });

        container.innerHTML = html;
        container.style.display = 'block';
    }

    /**
     * 복원 실행
     */
    async executeRestore() {
        if (!this.restorePreview) {
            UIUtils.showAlert('복원할 백업 파일을 선택해주세요.', 'warning');
            return;
        }

        const selectedTypes = this.getSelectedRestoreTypes();
        
        if (selectedTypes.length === 0) {
            UIUtils.showAlert('복원할 데이터 유형을 선택해주세요.', 'warning');
            return;
        }

        UIUtils.showConfirm('선택한 데이터를 복원하시겠습니까? 기존 데이터가 덮어쓰여집니다.', async (confirmed) => {
            if (!confirmed) return;

            try {
                this.showRestoreProgress();

                for (let i = 0; i < selectedTypes.length; i++) {
                    const type = selectedTypes[i];
                    this.updateRestoreProgress(`${type} 데이터 복원 중...`, (i / selectedTypes.length) * 100);
                    
                    await this.restoreDataType(type, this.restorePreview.data[type]);
                    
                    this.updateRestoreProgress(`${type} 데이터 복원 완료`, ((i + 1) / selectedTypes.length) * 100);
                }

                this.updateRestoreProgress('복원 완료', 100);
                
                setTimeout(() => {
                    this.hideRestoreProgress();
                    UIUtils.showAlert('복원이 성공적으로 완료되었습니다.', 'success');
                    
                    // 페이지 새로고침으로 변경사항 반영
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }, 1000);

            } catch (error) {
                console.error('복원 실행 오류:', error);
                this.hideRestoreProgress();
                UIUtils.showAlert('복원 중 오류가 발생했습니다.', 'error');
            }
        });
    }

    /**
     * 선택된 복원 유형 반환
     * @returns {Array} 선택된 복원 유형 배열
     */
    getSelectedRestoreTypes() {
        const checkboxes = document.querySelectorAll('.restore-type-checkbox:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    /**
     * 데이터 유형별 복원 수행
     * @param {string} type - 복원할 데이터 유형
     * @param {Object} data - 복원할 데이터
     */
    async restoreDataType(type, data) {
        switch (type) {
            case 'settings':
                await this.restoreSettings(data);
                break;
            case 'categories':
                await this.restoreCategories(data);
                break;
            case 'fields':
                await this.restoreFields(data);
                break;
            case 'ai':
                await this.restoreAISettings(data);
                break;
            case 'assets':
                await SettingsAPI.restoreAssets(data);
                break;
            case 'contracts':
                await SettingsAPI.restoreContracts(data);
                break;
            case 'operations':
                await SettingsAPI.restoreOperations(data);
                break;
            case 'users':
                await SettingsAPI.restoreUsers(data);
                break;
            default:
                throw new Error(`Unknown restore type: ${type}`);
        }
    }

    /**
     * 설정 데이터 복원
     * @param {Object} data - 설정 데이터
     */
    async restoreSettings(data) {
        if (data.preferences) {
            SettingsStorage.saveGeneralSettings('preferences', data.preferences);
        }
        if (data.notifications) {
            SettingsStorage.saveGeneralSettings('notifications', data.notifications);
        }
    }

    /**
     * 카테고리 데이터 복원
     * @param {Object} data - 카테고리 데이터
     */
    async restoreCategories(data) {
        if (data.tree) {
            SettingsStorage.saveCategoryTree(data.tree);
        }
        if (data.presets) {
            SettingsStorage.saveCategoryPresets(data.presets);
        }
    }

    /**
     * 필드 데이터 복원
     * @param {Object} data - 필드 데이터
     */
    async restoreFields(data) {
        if (data.fields) {
            SettingsStorage.saveCustomFields(data.fields);
        }
        if (data.validationRules) {
            SettingsStorage.saveValidationRules(data.validationRules);
        }
    }

    /**
     * AI 설정 복원
     * @param {Object} data - AI 설정 데이터
     */
    async restoreAISettings(data) {
        if (data.providers) {
            SettingsStorage.saveAIProviders(data.providers);
        }
        if (data.models) {
            SettingsStorage.saveAIModels(data.models);
        }
        if (data.apiKeys) {
            SettingsStorage.saveAIApiKeys(data.apiKeys);
        }
    }

    /**
     * 복원 진행률 표시
     */
    showRestoreProgress() {
        const progressContainer = document.getElementById('restoreProgressContainer');
        if (progressContainer) {
            progressContainer.style.display = 'block';
        }
    }

    /**
     * 복원 진행률 업데이트
     * @param {string} message - 진행 메시지
     * @param {number} progress - 진행률 (0-100)
     */
    updateRestoreProgress(message, progress) {
        const messageElement = document.getElementById('restoreProgressMessage');
        const progressBar = document.getElementById('restoreProgressBar');
        
        if (messageElement) {
            messageElement.textContent = message;
        }
        
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
            progressBar.setAttribute('aria-valuenow', progress);
        }
    }

    /**
     * 복원 진행률 숨김
     */
    hideRestoreProgress() {
        const progressContainer = document.getElementById('restoreProgressContainer');
        if (progressContainer) {
            progressContainer.style.display = 'none';
        }
    }

    /**
     * 자동 백업 토글
     * @param {boolean} enabled - 활성화 여부
     */
    toggleAutoBackup(enabled) {
        const settings = SettingsStorage.getGeneralSettings('backup') || {};
        settings.autoBackup = enabled;
        SettingsStorage.saveGeneralSettings('backup', settings);
        
        if (enabled) {
            this.scheduleAutoBackup();
        } else {
            this.cancelAutoBackup();
        }
    }

    /**
     * 백업 주기 업데이트
     * @param {string} interval - 백업 주기
     */
    updateBackupInterval(interval) {
        const settings = SettingsStorage.getGeneralSettings('backup') || {};
        settings.interval = interval;
        SettingsStorage.saveGeneralSettings('backup', settings);
        
        if (settings.autoBackup) {
            this.scheduleAutoBackup();
        }
    }

    /**
     * 백업 보관 기간 업데이트
     * @param {number} days - 보관 일수
     */
    updateBackupRetention(days) {
        const settings = SettingsStorage.getGeneralSettings('backup') || {};
        settings.retentionDays = days;
        SettingsStorage.saveGeneralSettings('backup', settings);
    }

    /**
     * 자동 백업 일정 예약
     */
    scheduleAutoBackup() {
        // 실제 구현에서는 서버 사이드 스케줄러 설정
        console.log('자동 백업이 예약되었습니다.');
    }

    /**
     * 자동 백업 취소
     */
    cancelAutoBackup() {
        // 실제 구현에서는 서버 사이드 스케줄러 해제
        console.log('자동 백업이 취소되었습니다.');
    }

    /**
     * 자동 백업 상태 확인
     */
    checkAutoBackupStatus() {
        const settings = SettingsStorage.getGeneralSettings('backup') || {};
        
        const autoBackupToggle = document.getElementById('enableAutoBackup');
        const backupIntervalSelect = document.getElementById('backupInterval');
        const retentionDaysInput = document.getElementById('backupRetentionDays');
        
        if (autoBackupToggle) {
            autoBackupToggle.checked = settings.autoBackup || false;
        }
        
        if (backupIntervalSelect) {
            backupIntervalSelect.value = settings.interval || 'daily';
        }
        
        if (retentionDaysInput) {
            retentionDaysInput.value = settings.retentionDays || 30;
        }
    }

    /**
     * 백업 이력 저장
     * @param {Object} backupJob - 백업 작업 정보
     */
    async saveBackupHistory(backupJob) {
        try {
            const history = SettingsStorage.getBackupHistory() || [];
            history.unshift({
                id: backupJob.id,
                created: backupJob.startTime.toISOString(),
                types: backupJob.types,
                status: 'completed'
            });
            
            // 최대 50개 이력 유지
            if (history.length > 50) {
                history.splice(50);
            }
            
            SettingsStorage.saveBackupHistory(history);
            this.loadBackupHistory();
        } catch (error) {
            console.error('백업 이력 저장 오류:', error);
        }
    }

    /**
     * 백업 이력 로드
     */
    loadBackupHistory() {
        const container = document.getElementById('backupHistoryContainer');
        if (!container) return;

        const history = SettingsStorage.getBackupHistory() || [];
        
        if (history.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="fas fa-history fa-3x mb-3"></i>
                    <p>백업 이력이 없습니다.</p>
                </div>
            `;
            return;
        }

        let html = '<div class="list-group">';
        history.forEach(backup => {
            const date = new Date(backup.created).toLocaleString();
            const typeNames = backup.types.map(t => this.backupTypes[t]?.name || t).join(', ');
            
            html += `
                <div class="list-group-item">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1">${date}</h6>
                            <p class="mb-1 text-muted">${typeNames}</p>
                            <small class="text-success">
                                <i class="fas fa-check-circle me-1"></i>완료됨
                            </small>
                        </div>
                        <span class="badge bg-primary">${backup.types.length}개 유형</span>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        container.innerHTML = html;
    }

    /**
     * 정리
     */
    cleanup() {
        this.cleanupFunctions.forEach(fn => {
            if (typeof fn === 'function') fn();
        });
        this.cleanupFunctions = [];
        this.currentBackupJob = null;
        this.restorePreview = null;
    }
}

export default BackupManager; 