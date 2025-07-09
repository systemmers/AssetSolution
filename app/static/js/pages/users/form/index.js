/**
 * 사용자 폼(생성/수정) 페이지 메인 JavaScript 모듈
 * @module users/form/index
 */
import { initFormValidation } from './validation-manager.js';
import { initProfileImageUpload } from './image-manager.js';
import { initDepartmentSelection } from './department-manager.js';
import { initPasswordHandling } from './password-manager.js';
import { initFormSubmission } from './submission-manager.js';

// 이벤트 리스너 정리를 위한 정리 함수 배열
const cleanupFunctions = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('사용자 폼 페이지 스크립트 로드됨');
    
    // 각 기능 모듈 초기화
    const formValidationCleanup = initFormValidation();
    if (formValidationCleanup) cleanupFunctions.push(formValidationCleanup);
    
    const imageUploadCleanup = initProfileImageUpload();
    if (imageUploadCleanup) cleanupFunctions.push(imageUploadCleanup);
    
    const departmentCleanup = initDepartmentSelection();
    if (departmentCleanup) cleanupFunctions.push(departmentCleanup);
    
    const passwordCleanup = initPasswordHandling();
    if (passwordCleanup) cleanupFunctions.push(passwordCleanup);
    
    const submissionCleanup = initFormSubmission();
    if (submissionCleanup) cleanupFunctions.push(submissionCleanup);
    
    // DOM 언로드 시 이벤트 리스너 정리
    window.addEventListener('beforeunload', cleanupEventListeners);
    cleanupFunctions.push(() => window.removeEventListener('beforeunload', cleanupEventListeners));
});

/**
 * 이벤트 리스너 정리 함수
 */
function cleanupEventListeners() {
    console.log('사용자 폼 페이지 이벤트 리스너 정리');
    cleanupFunctions.forEach(cleanup => {
        if (typeof cleanup === 'function') {
            cleanup();
        }
    });
} 