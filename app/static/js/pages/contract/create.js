/**
 * 계약 생성 페이지 JavaScript 기능
 * ContractForm 모듈을 사용하여 리팩토링됨
 */

import ContractForm from './core/contract-form.js';

// 전역 contractForm 인스턴스
let contractForm = null;

document.addEventListener('DOMContentLoaded', function() {
    // ContractForm 초기화
    contractForm = new ContractForm({
        formSelector: '#createForm',
        mode: 'create',
        redirectUrl: '/contract'
    });
    
    // DOM 언로드 시 리소스 정리
    window.addEventListener('beforeunload', cleanupEventListeners);
});

/**
 * 페이지 언로드 시 이벤트 리스너 정리
 * 메모리 누수 방지를 위한 정리 작업 수행
 */
function cleanupEventListeners() {
    if (contractForm) {
        contractForm.destroy();
        contractForm = null;
    }
    
    console.log('계약 생성 페이지 이벤트 리스너 정리');
} 