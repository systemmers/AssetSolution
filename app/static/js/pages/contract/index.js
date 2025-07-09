/**
 * 계약 목록 페이지 JavaScript 기능
 * ContractList 모듈을 사용하여 리팩토링됨
 */

import ContractList from './core/contract-list.js';

// 전역 contractList 인스턴스
let contractList = null;

document.addEventListener('DOMContentLoaded', function() {
    // ContractList 초기화
    contractList = new ContractList({
        tableSelector: '.table',
        searchFormSelector: '#searchForm',
        filterSelectors: 'select, input[type="date"]',
        resetButtonSelector: '.btn-reset',
        bulkActionSelector: '.bulk-action',
        detailUrlTemplate: '/contract/{id}'
    });
    
    // DOM 언로드 시 리소스 정리
    window.addEventListener('beforeunload', cleanupEventListeners);
});

/**
 * 페이지 언로드 시 이벤트 리스너 정리
 * 메모리 누수 방지를 위한 정리 작업 수행
 */
function cleanupEventListeners() {
    if (contractList) {
        contractList.destroy();
        contractList = null;
    }
    
    console.log('계약 목록 페이지 이벤트 리스너 정리');
} 