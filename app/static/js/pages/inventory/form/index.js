/**
 * 인벤토리 폼(생성/수정) 페이지 메인 JavaScript 모듈
 * @module inventory/form/index
 */
import { initFormValidation } from './validation-manager.js';
import { initDateSelection } from './date-manager.js';
import { initAssetSelection } from './asset-manager.js';
import { initCustomFields } from './custom-fields-manager.js';
import { initPreviewButton } from './preview-manager.js';
import { initFormSubmission } from './submission-manager.js';
import { initPrintFunction } from './print-manager.js';

// 이벤트 리스너 정리를 위한 정리 함수 배열
const cleanupFunctions = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('인벤토리 폼 페이지 스크립트 로드됨');
    
    // 각 기능 모듈 초기화
    const formValidationCleanup = initFormValidation();
    if (formValidationCleanup) cleanupFunctions.push(formValidationCleanup);
    
    const dateSelectionCleanup = initDateSelection();
    if (dateSelectionCleanup) cleanupFunctions.push(dateSelectionCleanup);
    
    const assetSelectionCleanup = initAssetSelection();
    if (assetSelectionCleanup) cleanupFunctions.push(assetSelectionCleanup);
    
    const customFieldsCleanup = initCustomFields();
    if (customFieldsCleanup) cleanupFunctions.push(customFieldsCleanup);
    
    const previewCleanup = initPreviewButton();
    if (previewCleanup) cleanupFunctions.push(previewCleanup);
    
    const submissionCleanup = initFormSubmission();
    if (submissionCleanup) cleanupFunctions.push(submissionCleanup);
    
    const printCleanup = initPrintFunction();
    if (printCleanup) cleanupFunctions.push(printCleanup);
    
    // DOM 언로드 시 이벤트 리스너 정리
    window.addEventListener('beforeunload', cleanupEventListeners);
    cleanupFunctions.push(() => window.removeEventListener('beforeunload', cleanupEventListeners));
});

/**
 * 이벤트 리스너 정리 함수
 */
function cleanupEventListeners() {
    console.log('인벤토리 폼 페이지 이벤트 리스너 정리');
    cleanupFunctions.forEach(cleanup => {
        if (typeof cleanup === 'function') {
            cleanup();
        }
    });
} 