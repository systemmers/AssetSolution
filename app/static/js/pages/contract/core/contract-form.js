/**
 * 계약 폼 관리 모듈
 * 계약 생성/수정 폼의 공통 기능 제공
 * 
 * @class ContractForm
 * @description 계약 폼 관련 기능 관리
 * 
 * 주요 기능:
 * - 폼 초기화 및 이벤트 설정
 * - 날짜 및 비용 필드 검증
 * - 폼 제출 처리
 * - 실시간 유효성 검사
 */

import FormUtils from '../../../common/form-utils.js';
import UIUtils from '../../../common/ui-utils.js';
import ContractCore from './contract-core.js';

class ContractForm {
    /**
     * ContractForm 클래스 생성자
     * @param {Object} config 설정 옵션
     */
    constructor(config = {}) {
        this.config = {
            formSelector: '#contractForm',
            fields: {
                title: '#title',
                startDate: '#startDate',
                endDate: '#endDate',
                cost: '#cost',
                description: '#description'
            },
            mode: 'create', // create, edit
            contractId: null,
            redirectUrl: '/contract',
            ...config
        };
        
        this.contractCore = new ContractCore();
        this.form = null;
        this.fields = {};
        this.cleanupFunctions = [];
        
        this.initialize();
    }
    
    /**
     * ContractForm 초기화
     */
    initialize() {
        this.form = document.querySelector(this.config.formSelector);
        if (!this.form) {
            console.warn('계약 폼을 찾을 수 없습니다:', this.config.formSelector);
            return;
        }
        
        // 필드 요소 수집
        this._collectFields();
        
        // 이벤트 설정
        this._setupEvents();
        
        console.log('ContractForm 초기화됨 - 모드:', this.config.mode);
    }
    
    /**
     * 필드 요소 수집
     */
    _collectFields() {
        Object.keys(this.config.fields).forEach(fieldName => {
            const selector = this.config.fields[fieldName];
            const element = document.querySelector(selector);
            
            if (element) {
                this.fields[fieldName] = element;
            } else {
                console.warn(`필드를 찾을 수 없습니다: ${fieldName} (${selector})`);
            }
        });
    }
    
    /**
     * 이벤트 설정
     */
    _setupEvents() {
        // 날짜 필드 초기화
        const dateCleanup = this._setupDateFields();
        if (dateCleanup) this.cleanupFunctions.push(dateCleanup);
        
        // 비용 필드 초기화
        const costCleanup = this._setupCostField();
        if (costCleanup) this.cleanupFunctions.push(costCleanup);
        
        // 폼 제출 이벤트
        const formCleanup = this._setupFormSubmission();
        if (formCleanup) this.cleanupFunctions.push(formCleanup);
        
        // 실시간 유효성 검사
        const validationCleanup = this._setupRealTimeValidation();
        if (validationCleanup) this.cleanupFunctions.push(validationCleanup);
    }
    
    /**
     * 날짜 필드 설정
     * @returns {Function} 정리 함수
     */
    _setupDateFields() {
        const startDateField = this.fields.startDate;
        const endDateField = this.fields.endDate;
        
        if (!startDateField || !endDateField) return null;
        
        // 날짜 선택기 초기화
        const datePickerCleanup = FormUtils.initializeDatepickers(
            `${this.config.fields.startDate}, ${this.config.fields.endDate}`, 
            {
                format: 'yyyy-mm-dd',
                autoclose: true,
                todayHighlight: true
            }
        );
        
        // 시작일 기본값 설정 (생성 모드일 때만)
        if (this.config.mode === 'create' && !startDateField.value) {
            const today = new Date();
            startDateField.value = today.toISOString().split('T')[0];
        }
        
        // 종료일 최소값 설정
        if (startDateField.value) {
            endDateField.min = startDateField.value;
        }
        
        // 시작일 변경 이벤트
        const handleStartDateChange = () => {
            const startDate = startDateField.value;
            
            // 종료일 최소값 업데이트
            if (startDate) {
                endDateField.min = startDate;
                
                // 종료일이 시작일보다 이전인 경우 자동 조정
                if (endDateField.value && endDateField.value < startDate) {
                    endDateField.value = startDate;
                    UIUtils.showAlert(
                        '종료일이 시작일보다 이전이어서 시작일로 자동 설정되었습니다.', 
                        'info', 
                        3000
                    );
                }
            }
        };
        
        // 종료일 변경 이벤트
        const handleEndDateChange = () => {
            const startDate = startDateField.value;
            const endDate = endDateField.value;
            
            if (startDate && endDate && endDate < startDate) {
                UIUtils.showAlert(
                    '종료일은 시작일보다 이후여야 합니다.', 
                    'warning', 
                    3000
                );
                endDateField.focus();
            }
        };
        
        // 이벤트 리스너 등록
        startDateField.addEventListener('change', handleStartDateChange);
        endDateField.addEventListener('change', handleEndDateChange);
        
        return () => {
            if (datePickerCleanup) datePickerCleanup();
            startDateField.removeEventListener('change', handleStartDateChange);
            endDateField.removeEventListener('change', handleEndDateChange);
        };
    }
    
    /**
     * 비용 필드 설정
     * @returns {Function} 정리 함수
     */
    _setupCostField() {
        const costField = this.fields.cost;
        if (!costField) return null;
        
        // 비용 입력 이벤트
        const handleCostInput = () => {
            let value = costField.value;
            
            // 숫자만 허용
            value = value.replace(/[^0-9]/g, '');
            
            // 콤마 포맷팅 적용
            if (value) {
                const formattedValue = this.contractCore.formatCost(value);
                if (costField.value !== formattedValue) {
                    costField.value = formattedValue;
                }
            }
        };
        
        // 비용 포커스 아웃 이벤트 (추가 검증)
        const handleCostBlur = () => {
            const cost = this.contractCore.parseCost(costField.value);
            
            if (cost > this.contractCore.config.validation.maxCost) {
                UIUtils.showAlert(
                    `비용은 ${this.contractCore.config.validation.maxCost.toLocaleString()} 이하여야 합니다.`, 
                    'warning', 
                    3000
                );
                costField.focus();
            }
        };
        
        // 이벤트 리스너 등록
        costField.addEventListener('input', handleCostInput);
        costField.addEventListener('blur', handleCostBlur);
        
        return () => {
            costField.removeEventListener('input', handleCostInput);
            costField.removeEventListener('blur', handleCostBlur);
        };
    }
    
    /**
     * 폼 제출 설정
     * @returns {Function} 정리 함수
     */
    _setupFormSubmission() {
        if (!this.form) return null;
        
        const handleFormSubmit = async (e) => {
            e.preventDefault();
            
            try {
                // 폼 데이터 수집
                const formData = this._collectFormData();
                
                // 클라이언트 측 검증
                this.contractCore.validateContractData(formData);
                
                // API 호출
                let result;
                if (this.config.mode === 'create') {
                    result = await this.contractCore.createContract(formData);
                } else if (this.config.mode === 'edit') {
                    result = await this.contractCore.updateContract(this.config.contractId, formData);
                }
                
                // 성공 후 리디렉션
                setTimeout(() => {
                    window.location.href = this.config.redirectUrl;
                }, 1500);
                
            } catch (error) {
                console.error('폼 제출 오류:', error);
                // 오류는 ContractCore에서 이미 처리됨
            }
        };
        
        this.form.addEventListener('submit', handleFormSubmit);
        
        return () => {
            this.form.removeEventListener('submit', handleFormSubmit);
        };
    }
    
    /**
     * 실시간 유효성 검사 설정
     * @returns {Function} 정리 함수
     */
    _setupRealTimeValidation() {
        const titleField = this.fields.title;
        if (!titleField) return null;
        
        const handleTitleBlur = () => {
            if (!titleField.value.trim()) {
                UIUtils.showAlert('계약명은 필수 입력 항목입니다.', 'warning', 2000);
                titleField.focus();
            }
        };
        
        titleField.addEventListener('blur', handleTitleBlur);
        
        return () => {
            titleField.removeEventListener('blur', handleTitleBlur);
        };
    }
    
    /**
     * 폼 데이터 수집
     * @returns {Object} 폼 데이터
     */
    _collectFormData() {
        const formData = {};
        
        Object.keys(this.fields).forEach(fieldName => {
            const field = this.fields[fieldName];
            let value = field.value;
            
            // 비용 필드는 숫자로 변환
            if (fieldName === 'cost') {
                value = this.contractCore.parseCost(value);
            }
            
            formData[fieldName] = value;
        });
        
        return formData;
    }
    
    /**
     * 폼 데이터 설정 (수정 모드용)
     * @param {Object} data 설정할 데이터
     */
    setFormData(data) {
        Object.keys(data).forEach(fieldName => {
            const field = this.fields[fieldName];
            if (field) {
                let value = data[fieldName];
                
                // 비용 필드는 포맷팅 적용
                if (fieldName === 'cost') {
                    value = this.contractCore.formatCost(value);
                }
                
                field.value = value || '';
            }
        });
        
        // 날짜 필드 재설정
        if (this.fields.startDate && this.fields.startDate.value) {
            this.fields.endDate.min = this.fields.startDate.value;
        }
    }
    
    /**
     * 폼 유효성 검사
     * @returns {boolean} 검사 결과
     */
    validate() {
        try {
            const formData = this._collectFormData();
            this.contractCore.validateContractData(formData);
            return true;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * 리소스 정리
     */
    destroy() {
        this.cleanupFunctions.forEach(cleanup => {
            if (typeof cleanup === 'function') {
                cleanup();
            }
        });
        
        this.cleanupFunctions = [];
        
        if (this.contractCore) {
            this.contractCore.destroy();
        }
        
        console.log('ContractForm 리소스 정리');
    }
}

export default ContractForm; 