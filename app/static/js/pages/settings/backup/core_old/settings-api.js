/**
 * Settings API 관리 모듈
 * 설정 관련 모든 API 호출을 처리합니다.
 */

import ApiUtils from '../../../common/api-utils.js';

/**
 * Settings API 클래스
 */
class SettingsAPI {
    /**
     * 일반 설정 저장
     * @param {Object} settingsData - 설정 데이터
     * @returns {Promise<Object>} API 응답
     */
    static async saveGeneralSettings(settingsData) {
        try {
            return await ApiUtils.post('/api/settings/general', settingsData);
        } catch (error) {
            console.error('일반 설정 저장 실패:', error);
            throw error;
        }
    }

    /**
     * 카테고리 데이터 로드
     * @returns {Promise<Object>} 카테고리 데이터
     */
    static async loadCategories() {
        try {
            const response = await ApiUtils.get('/settings/categories/load');
            return response.data || {};
        } catch (error) {
            console.error('카테고리 데이터 로드 실패:', error);
            return {};
        }
    }

    /**
     * 카테고리 트리 구조 조회
     * @returns {Promise<Array>} 카테고리 트리 배열
     */
    static async getCategoriesTree() {
        try {
            const response = await ApiUtils.get('/settings/categories/tree');
            return response.data || [];
        } catch (error) {
            console.error('카테고리 트리 조회 실패:', error);
            return [];
        }
    }

    /**
     * 카테고리 생성
     * @param {Object} categoryData - 카테고리 데이터
     * @returns {Promise<Object>} API 응답
     */
    static async createCategory(categoryData) {
        try {
            return await ApiUtils.post('/settings/categories/save', categoryData);
        } catch (error) {
            console.error('카테고리 생성 실패:', error);
            throw error;
        }
    }

    /**
     * 카테고리 수정
     * @param {number} categoryId - 카테고리 ID
     * @param {Object} categoryData - 수정할 카테고리 데이터
     * @returns {Promise<Object>} API 응답
     */
    static async updateCategory(categoryId, categoryData) {
        try {
            const data = { ...categoryData, id: categoryId };
            return await ApiUtils.post('/settings/categories/save', data);
        } catch (error) {
            console.error('카테고리 수정 실패:', error);
            throw error;
        }
    }

    /**
     * 카테고리 삭제
     * @param {number} categoryId - 카테고리 ID
     * @returns {Promise<Object>} API 응답
     */
    static async deleteCategory(categoryId) {
        try {
            return await ApiUtils.delete(`/settings/categories/${categoryId}`);
        } catch (error) {
            console.error('카테고리 삭제 실패:', error);
            throw error;
        }
    }

    /**
     * 프리셋 목록 조회
     * @param {string} type - 프리셋 타입 (기본값: 'category')
     * @param {boolean} shared - 공유 프리셋 여부 (기본값: true)
     * @returns {Promise<Array>} 프리셋 배열
     */
    static async getPresets(type = 'category', shared = true) {
        try {
            const params = new URLSearchParams({ type, shared: shared.toString() });
            const response = await ApiUtils.get(`/settings/presets/list?${params}`);
            return response.data || [];
        } catch (error) {
            console.error('프리셋 목록 조회 실패:', error);
            return [];
        }
    }

    /**
     * 특정 프리셋 조회
     * @param {number} presetId - 프리셋 ID
     * @returns {Promise<Object>} 프리셋 데이터
     */
    static async getPreset(presetId) {
        try {
            const response = await ApiUtils.get(`/settings/presets/${presetId}`);
            return response.data || {};
        } catch (error) {
            console.error('프리셋 조회 실패:', error);
            return {};
        }
    }

    /**
     * 프리셋 로드 (구 버전 호환)
     * @param {number} presetId - 프리셋 ID
     * @returns {Promise<Object>} 프리셋 데이터
     */
    static async loadPreset(presetId) {
        return this.getPreset(presetId);
    }

    /**
     * 프리셋 생성
     * @param {Object} presetData - 프리셋 데이터
     * @returns {Promise<Object>} API 응답
     */
    static async createPreset(presetData) {
        try {
            return await ApiUtils.post('/settings/presets/save', presetData);
        } catch (error) {
            console.error('프리셋 생성 실패:', error);
            throw error;
        }
    }

    /**
     * 프리셋 수정
     * @param {number} presetId - 프리셋 ID
     * @param {Object} presetData - 수정할 프리셋 데이터
     * @returns {Promise<Object>} API 응답
     */
    static async updatePreset(presetId, presetData) {
        try {
            const data = { ...presetData, id: presetId };
            return await ApiUtils.post('/settings/presets/save', data);
        } catch (error) {
            console.error('프리셋 수정 실패:', error);
            throw error;
        }
    }

    /**
     * 프리셋 저장 (구 버전 호환)
     * @param {Object} presetData - 프리셋 데이터
     * @returns {Promise<Object>} API 응답
     */
    static async savePreset(presetData) {
        if (presetData.id) {
            return this.updatePreset(presetData.id, presetData);
        } else {
            return this.createPreset(presetData);
        }
    }

    /**
     * 프리셋 적용
     * @param {number} presetId - 프리셋 ID
     * @returns {Promise<Object>} API 응답
     */
    static async applyPreset(presetId) {
        try {
            return await ApiUtils.post(`/settings/presets/${presetId}/apply`);
        } catch (error) {
            console.error('프리셋 적용 실패:', error);
            throw error;
        }
    }

    /**
     * 프리셋 복제
     * @param {number} presetId - 복제할 프리셋 ID
     * @param {string} newName - 새 프리셋 이름
     * @returns {Promise<Object>} API 응답
     */
    static async clonePreset(presetId, newName) {
        try {
            return await ApiUtils.post(`/settings/presets/${presetId}/clone`, { name: newName });
        } catch (error) {
            console.error('프리셋 복제 실패:', error);
            throw error;
        }
    }

    /**
     * 프리셋 삭제
     * @param {number} presetId - 프리셋 ID
     * @returns {Promise<Object>} API 응답
     */
    static async deletePreset(presetId) {
        try {
            return await ApiUtils.delete(`/settings/presets/${presetId}`);
        } catch (error) {
            console.error('프리셋 삭제 실패:', error);
            throw error;
        }
    }

    /**
     * AI 설정 저장
     * @param {Object} aiSettings - AI 설정 데이터
     * @returns {Promise<Object>} API 응답
     */
    static async saveAISettings(aiSettings) {
        try {
            return await ApiUtils.post('/api/settings/ai', aiSettings);
        } catch (error) {
            console.error('AI 설정 저장 실패:', error);
            throw error;
        }
    }

    /**
     * AI 연결 테스트
     * @param {Object} connectionData - 연결 정보
     * @returns {Promise<Object>} 테스트 결과
     */
    static async testAIConnection(connectionData) {
        try {
            return await ApiUtils.post('/api/settings/ai/test', connectionData);
        } catch (error) {
            console.error('AI 연결 테스트 실패:', error);
            throw error;
        }
    }

    /**
     * 설정 데이터 내보내기
     * @returns {Promise<Blob>} 내보내기 파일
     */
    static async exportSettings() {
        try {
            return await ApiUtils.download('/api/settings/export');
        } catch (error) {
            console.error('설정 내보내기 실패:', error);
            throw error;
        }
    }

    /**
     * 설정 데이터 가져오기
     * @param {File} file - 가져올 파일
     * @returns {Promise<Object>} 가져오기 결과
     */
    static async importSettings(file) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            return await ApiUtils.upload('/api/settings/import', formData);
        } catch (error) {
            console.error('설정 가져오기 실패:', error);
            throw error;
        }
    }
}

export default SettingsAPI; 