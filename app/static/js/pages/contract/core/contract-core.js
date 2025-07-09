/**
 * 계약 모듈 핵심 기능
 * API 호출, 공통 검증, 유틸리티 기능 제공
 * 
 * @class ContractCore
 * @description 계약 관련 핵심 로직 관리
 * 
 * 주요 기능:
 * - Contract API 호출 관리
 * - 날짜/비용 검증 로직
 * - 공통 유틸리티 기능
 * - 에러 처리 및 알림
 */

import ApiUtils from '../../../common/api-utils.js';
import UIUtils from '../../../common/ui-utils.js';
import FormUtils from '../../../common/form-utils.js';

class ContractCore {
    /**
     * ContractCore 클래스 생성자
     * @param {Object} config 설정 옵션
     */
    constructor(config = {}) {
        this.config = {
            endpoints: {
                list: '/api/contracts',
                detail: '/api/contracts/{id}',
                create: '/api/contracts',
                update: '/api/contracts/{id}',
                delete: '/api/contracts/{id}',
                upload: '/api/contracts/{id}/documents'
            },
            validation: {
                maxCost: 999999999999,
                dateFormat: 'YYYY-MM-DD'
            },
            messages: {
                success: {
                    create: '계약이 성공적으로 생성되었습니다.',
                    update: '계약이 성공적으로 수정되었습니다.',
                    delete: '계약이 성공적으로 삭제되었습니다.',
                    upload: '문서가 성공적으로 업로드되었습니다.'
                },
                error: {
                    create: '계약 생성 중 오류가 발생했습니다.',
                    update: '계약 수정 중 오류가 발생했습니다.',
                    delete: '계약 삭제 중 오류가 발생했습니다.',
                    upload: '문서 업로드 중 오류가 발생했습니다.',
                    validation: '입력값을 확인해주세요.'
                }
            },
            ...config
        };
        
        this.initialize();
    }
    
    /**
     * ContractCore 초기화
     */
    initialize() {
        console.log('ContractCore 초기화됨');
    }
    
    // ================================
    // API 관리 메서드
    // ================================
    
    /**
     * 계약 목록 조회
     * @param {Object} filters 필터 옵션
     * @returns {Promise<Object>} API 응답
     */
    async getContracts(filters = {}) {
        try {
            const url = this._buildUrl(this.config.endpoints.list, null, filters);
            return await ApiUtils.get(url);
        } catch (error) {
            this._handleError('목록 조회 중 오류가 발생했습니다.', error);
            throw error;
        }
    }
    
    /**
     * 계약 상세 조회
     * @param {string|number} contractId 계약 ID
     * @returns {Promise<Object>} API 응답
     */
    async getContract(contractId) {
        try {
            const url = this._buildUrl(this.config.endpoints.detail, contractId);
            return await ApiUtils.get(url);
        } catch (error) {
            this._handleError('상세 조회 중 오류가 발생했습니다.', error);
            throw error;
        }
    }
    
    /**
     * 계약 생성
     * @param {Object} contractData 계약 데이터
     * @returns {Promise<Object>} API 응답
     */
    async createContract(contractData) {
        try {
            // 데이터 검증
            this.validateContractData(contractData);
            
            const url = this.config.endpoints.create;
            const result = await ApiUtils.post(url, contractData);
            
            UIUtils.showAlert(this.config.messages.success.create, 'success', 3000);
            return result;
        } catch (error) {
            this._handleError(this.config.messages.error.create, error);
            throw error;
        }
    }
    
    /**
     * 계약 수정
     * @param {string|number} contractId 계약 ID
     * @param {Object} contractData 수정할 계약 데이터
     * @returns {Promise<Object>} API 응답
     */
    async updateContract(contractId, contractData) {
        try {
            // 데이터 검증
            this.validateContractData(contractData);
            
            const url = this._buildUrl(this.config.endpoints.update, contractId);
            const result = await ApiUtils.put(url, contractData);
            
            UIUtils.showAlert(this.config.messages.success.update, 'success', 3000);
            return result;
        } catch (error) {
            this._handleError(this.config.messages.error.update, error);
            throw error;
        }
    }
    
    /**
     * 계약 삭제
     * @param {string|number} contractId 계약 ID
     * @returns {Promise<Object>} API 응답
     */
    async deleteContract(contractId) {
        try {
            const confirmed = await this._showDeleteConfirmation();
            if (!confirmed) return null;
            
            const url = this._buildUrl(this.config.endpoints.delete, contractId);
            const result = await ApiUtils.delete(url);
            
            UIUtils.showAlert(this.config.messages.success.delete, 'success', 3000);
            return result;
        } catch (error) {
            this._handleError(this.config.messages.error.delete, error);
            throw error;
        }
    }
    
    /**
     * 문서 업로드
     * @param {string|number} contractId 계약 ID
     * @param {File} file 업로드할 파일
     * @param {Object} metadata 파일 메타데이터
     * @returns {Promise<Object>} API 응답
     */
    async uploadDocument(contractId, file, metadata = {}) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            Object.keys(metadata).forEach(key => {
                formData.append(key, metadata[key]);
            });
            
            const url = this._buildUrl(this.config.endpoints.upload, contractId);
            const result = await ApiUtils.upload(url, formData);
            
            UIUtils.showAlert(this.config.messages.success.upload, 'success', 3000);
            return result;
        } catch (error) {
            this._handleError(this.config.messages.error.upload, error);
            throw error;
        }
    }
    
    // ================================
    // 검증 메서드
    // ================================
    
    /**
     * 계약 데이터 검증
     * @param {Object} data 검증할 계약 데이터
     * @throws {Error} 검증 실패 시 오류 발생
     */
    validateContractData(data) {
        const errors = [];
        
        if (!data.title?.trim()) {
            errors.push('계약명은 필수 입력 항목입니다.');
        }
        
        if (!data.startDate) {
            errors.push('시작일은 필수 입력 항목입니다.');
        }
        
        if (!data.endDate) {
            errors.push('종료일은 필수 입력 항목입니다.');
        }
        
        if (data.startDate && data.endDate && !this.validateDates(data.startDate, data.endDate)) {
            errors.push('종료일은 시작일보다 이후여야 합니다.');
        }
        
        // 비용 검증
        if (data.cost !== undefined && data.cost !== null) {
            const cost = typeof data.cost === 'string' ? 
                parseFloat(data.cost.replace(/,/g, '')) : 
                parseFloat(data.cost);
                
            if (isNaN(cost) || cost < 0) {
                errors.push('비용은 0 이상의 숫자여야 합니다.');
            }
            
            if (cost > this.config.validation.maxCost) {
                errors.push(`비용은 ${this.config.validation.maxCost.toLocaleString()} 이하여야 합니다.`);
            }
        }
        
        if (errors.length > 0) {
            const errorMessage = errors.join('\n');
            UIUtils.showAlert(errorMessage, 'warning', 5000);
            throw new Error(errorMessage);
        }
    }
    
    /**
     * 날짜 검증 및 포맷팅
     * @param {string} dateString 날짜 문자열
     * @returns {boolean} 유효성 검사 결과
     */
    validateDate(dateString) {
        if (!dateString) return false;
        
        const date = new Date(dateString);
        return !isNaN(date.getTime());
    }
    
    /**
     * 날짜 검증 및 포맷팅
     * @param {string} startDate 시작일
     * @param {string} endDate 종료일
     * @returns {boolean} 유효성 검사 결과
     */
    validateDates(startDate, endDate) {
        if (!startDate || !endDate) return false;
        return new Date(endDate) >= new Date(startDate);
    }
    
    /**
     * 비용 포맷팅 (콤마 추가)
     * @param {string|number} cost 비용
     * @returns {string} 포맷된 비용 문자열
     */
    formatCost(cost) {
        if (!cost && cost !== 0) return '';
        const numericCost = typeof cost === 'string' ? 
            parseFloat(cost.replace(/,/g, '')) : parseFloat(cost);
        return isNaN(numericCost) ? '' : numericCost.toLocaleString('ko-KR');
    }
    
    /**
     * 비용 파싱 (콤마 제거)
     * @param {string} costString 비용 문자열
     * @returns {number} 파싱된 비용 숫자
     */
    parseCost(costString) {
        if (!costString) return 0;
        const cleaned = costString.toString().replace(/,/g, '');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
    }
    
    // ================================
    // 유틸리티 메서드
    // ================================
    
    /**
     * URL 빌드 (ID 및 쿼리 파라미터 포함)
     * @param {string} template URL 템플릿
     * @param {string|number} id ID 값
     * @param {Object} params 쿼리 파라미터
     * @returns {string} 완성된 URL
     */
    _buildUrl(template, id = null, params = {}) {
        let url = template;
        
        // ID 치환
        if (id !== null) {
            url = url.replace('{id}', id);
        }
        
        // 쿼리 파라미터 추가
        if (Object.keys(params).length > 0) {
            const queryString = new URLSearchParams(params).toString();
            url += `?${queryString}`;
        }
        
        return url;
    }
    
    /**
     * 삭제 확인 대화상자 표시
     * @returns {Promise<boolean>} 확인 결과
     */
    _showDeleteConfirmation() {
        return new Promise((resolve) => {
            UIUtils.showConfirmDialog({
                title: '계약 삭제',
                message: '이 계약을 정말 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.',
                confirmText: '삭제',
                cancelText: '취소',
                confirmButtonClass: 'btn-danger',
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false)
            });
        });
    }
    
    /**
     * 오류 처리
     * @param {string} message 사용자 메시지
     * @param {Error} error 원본 오류
     */
    _handleError(message, error) {
        console.error('ContractCore 오류:', error);
        
        const errorMsg = error.message || error.toString();
        const fullMessage = `${message}: ${errorMsg}`;
        
        UIUtils.showAlert(fullMessage, 'danger', 5000);
    }
    
    /**
     * 리소스 정리
     */
    destroy() {
        console.log('ContractCore 리소스 정리');
        // 필요한 정리 작업 수행
    }
}

export default ContractCore; 