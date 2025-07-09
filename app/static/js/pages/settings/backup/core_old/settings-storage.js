/**
 * Settings 데이터 저장/로드 관리 모듈
 * 로컬 스토리지와 서버 간 데이터 동기화를 처리합니다.
 */

/**
 * Settings Storage 클래스
 */
class SettingsStorage {
    /**
     * 로컬 스토리지 키 정의
     */
    static keys = {
        CATEGORIES: 'settings_categories',
        GENERAL: 'settings_general',
        AI: 'settings_ai',
        PRESETS: 'settings_presets',
        LAST_SYNC: 'settings_last_sync'
    };

    /**
     * 로컬 스토리지에서 데이터 로드
     * @param {string} key - 스토리지 키
     * @param {any} defaultValue - 기본값
     * @returns {any} 저장된 데이터 또는 기본값
     */
    static getLocal(key, defaultValue = null) {
        try {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : defaultValue;
        } catch (error) {
            console.error(`로컬 스토리지에서 ${key} 로드 실패:`, error);
            return defaultValue;
        }
    }

    /**
     * 로컬 스토리지에 데이터 저장
     * @param {string} key - 스토리지 키
     * @param {any} data - 저장할 데이터
     * @returns {boolean} 저장 성공 여부
     */
    static setLocal(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            this.setLocal(this.keys.LAST_SYNC, new Date().toISOString());
            return true;
        } catch (error) {
            console.error(`로컬 스토리지에 ${key} 저장 실패:`, error);
            return false;
        }
    }

    /**
     * 카테고리 데이터 로드
     * @returns {Array} 카테고리 배열
     */
    static getCategories() {
        return this.getLocal(this.keys.CATEGORIES, []);
    }

    /**
     * 카테고리 데이터 저장
     * @param {Array} categories - 카테고리 배열
     * @returns {boolean} 저장 성공 여부
     */
    static setCategories(categories) {
        return this.setLocal(this.keys.CATEGORIES, categories);
    }

    /**
     * 일반 설정 로드
     * @returns {Object} 설정 객체
     */
    static getGeneralSettings() {
        return this.getLocal(this.keys.GENERAL, {
            language: 'ko',
            dateFormat: 'YYYY-MM-DD',
            timeFormat: '24',
            itemsPerPage: 20,
            autoSave: true,
            notifications: true
        });
    }

    /**
     * 일반 설정 저장
     * @param {Object} settings - 설정 객체
     * @returns {boolean} 저장 성공 여부
     */
    static setGeneralSettings(settings) {
        return this.setLocal(this.keys.GENERAL, settings);
    }

    /**
     * AI 설정 로드
     * @returns {Object} AI 설정 객체
     */
    static getAISettings() {
        return this.getLocal(this.keys.AI, {
            provider: 'openai',
            model: 'gpt-3.5-turbo',
            apiKey: '',
            enabled: false,
            features: {
                imageAnalysis: true,
                documentAnalysis: true,
                dataAnalysis: true
            }
        });
    }

    /**
     * AI 설정 저장
     * @param {Object} aiSettings - AI 설정 객체
     * @returns {boolean} 저장 성공 여부
     */
    static setAISettings(aiSettings) {
        return this.setLocal(this.keys.AI, aiSettings);
    }

    /**
     * 프리셋 목록 로드
     * @returns {Array} 프리셋 배열
     */
    static getPresets() {
        return this.getLocal(this.keys.PRESETS, []);
    }

    /**
     * 프리셋 목록 저장
     * @param {Array} presets - 프리셋 배열
     * @returns {boolean} 저장 성공 여부
     */
    static setPresets(presets) {
        return this.setLocal(this.keys.PRESETS, presets);
    }

    /**
     * 새 프리셋 추가
     * @param {Object} preset - 프리셋 객체
     * @returns {boolean} 추가 성공 여부
     */
    static addPreset(preset) {
        const presets = this.getPresets();
        preset.id = Date.now().toString();
        preset.createdAt = new Date().toISOString();
        presets.push(preset);
        return this.setPresets(presets);
    }

    /**
     * 프리셋 삭제
     * @param {string} presetId - 프리셋 ID
     * @returns {boolean} 삭제 성공 여부
     */
    static removePreset(presetId) {
        const presets = this.getPresets();
        const filtered = presets.filter(p => p.id !== presetId);
        return this.setPresets(filtered);
    }

    /**
     * 모든 설정 데이터 내보내기
     * @returns {Object} 전체 설정 데이터
     */
    static exportAll() {
        return {
            categories: this.getCategories(),
            general: this.getGeneralSettings(),
            ai: this.getAISettings(),
            presets: this.getPresets(),
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
    }

    /**
     * 설정 데이터 가져오기
     * @param {Object} data - 가져올 설정 데이터
     * @returns {boolean} 가져오기 성공 여부
     */
    static importAll(data) {
        try {
            if (data.categories) this.setCategories(data.categories);
            if (data.general) this.setGeneralSettings(data.general);
            if (data.ai) this.setAISettings(data.ai);
            if (data.presets) this.setPresets(data.presets);
            return true;
        } catch (error) {
            console.error('설정 데이터 가져오기 실패:', error);
            return false;
        }
    }

    /**
     * 모든 설정 초기화
     * @returns {boolean} 초기화 성공 여부
     */
    static resetAll() {
        try {
            Object.values(this.keys).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('설정 초기화 실패:', error);
            return false;
        }
    }

    /**
     * 마지막 동기화 시간 가져오기
     * @returns {string|null} ISO 날짜 문자열 또는 null
     */
    static getLastSyncTime() {
        return this.getLocal(this.keys.LAST_SYNC);
    }

    /**
     * 데이터 유효성 검증
     * @param {Object} data - 검증할 데이터
     * @returns {boolean} 유효성 여부
     */
    static validate(data) {
        if (!data || typeof data !== 'object') return false;
        
        // 카테고리 검증
        if (data.categories && !Array.isArray(data.categories)) return false;
        
        // 일반 설정 검증
        if (data.general && typeof data.general !== 'object') return false;
        
        // AI 설정 검증
        if (data.ai && typeof data.ai !== 'object') return false;
        
        return true;
    }
}

export default SettingsStorage; 