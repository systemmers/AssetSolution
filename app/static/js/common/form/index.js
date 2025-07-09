/**
 * 폼 통합 모듈
 * 폼 관련 하위 모듈을 하나로 통합하여 제공합니다.
 * 
 * 포함 모듈:
 * - FormValidator: 폼 유효성 검사 기능
 * - FormData: 폼 데이터 처리 기능
 * - FormElements: 폼 요소 관리 기능
 * - FormUI: 폼 UI 관련 기능
 */

import FormValidator from './FormValidator.js';
import FormData from './FormData.js';
import FormElements from './FormElements.js';
import FormUI from './FormUI.js';

// 전역 네임스페이스에 등록 (선택 사항)
window.FormValidator = FormValidator;
window.FormData = FormData;
window.FormElements = FormElements;
window.FormUI = FormUI;

// 통합 모듈 생성
const FormUtils = {
    // FormValidator
    validateForm: FormValidator.validateForm,
    validateField: FormValidator.validateField,
    setFieldValidState: FormValidator.setFieldValidState,
    resetFieldState: FormValidator.resetFieldState,
    
    // FormData
    serializeForm: FormData.serializeForm,
    populateFormFields: FormData.populateFormFields,
    handleFormSubmission: FormData.handleFormSubmission,
    submitFormAjax: FormData.submitFormAjax,
    resetForm: FormData.resetForm,
    
    // FormElements
    initializeDatepickers: FormElements.initializeDatepickers,
    setupMultipleForms: FormElements.setupMultipleForms,
    setupConditionalFields: FormElements.setupConditionalFields,
    setupDynamicFields: FormElements.setupDynamicFields,
    initTabNavigation: FormElements.initTabNavigation,
    
    // FormUI
    initDynamicFormValidation: FormUI.initDynamicFormValidation,
    initConditionalFormFields: FormUI.initConditionalFormFields,
    initDynamicItemsList: FormUI.initDynamicItemsList,
    showFieldError: FormUI.showFieldError,
    clearFieldErrors: FormUI.clearFieldErrors,
    highlightInvalidFields: FormUI.highlightInvalidFields,
    
    // 개별 모듈 직접 접근 가능
    Validator: FormValidator,
    Data: FormData,
    Elements: FormElements,
    UI: FormUI
};

export default FormUtils; 