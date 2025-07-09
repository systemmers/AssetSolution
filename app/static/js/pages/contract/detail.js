/**
 * 계약 상세 페이지 JavaScript 기능
 * ContractDetail 모듈을 사용하여 리팩토링됨
 */

import ContractDetail from './core/contract-detail.js';

// 전역 contractDetail 인스턴스
let contractDetail = null;

document.addEventListener('DOMContentLoaded', function() {
    // ContractDetail 초기화
    contractDetail = new ContractDetail({
        tabsSelector: '.nav-link[data-bs-toggle="tab"]',
        uploadModalSelector: '#uploadDocumentModal',
        uploadFormSelector: '#uploadDocumentForm',
        fileInputSelector: '#documentFile',
        fileNameDisplaySelector: '#selectedFileName',
        assetsTableSelector: '.assets-table',
        documentsTableSelector: '.documents-table',
        deleteDocumentSelector: '.delete-document',
        downloadDocumentSelector: '.download-document'
    });
    
    // DOM 언로드 시 리소스 정리
    window.addEventListener('beforeunload', cleanupEventListeners);
});

/**
 * 페이지 언로드 시 이벤트 리스너 정리
 * 메모리 누수 방지를 위한 정리 작업 수행
 */
function cleanupEventListeners() {
    if (contractDetail) {
        contractDetail.destroy();
        contractDetail = null;
    }
    
    console.log('계약 상세 페이지 이벤트 리스너 정리');
} 