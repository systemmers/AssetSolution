/**
 * 계약 수정 페이지 JavaScript 기능
 * ContractForm 모듈을 사용하여 리팩토링됨
 */

import ContractForm from './core/contract-form.js';
import ContractCore from './core/contract-core.js';

// 전역 인스턴스
let contractForm = null;
let contractCore = null;

document.addEventListener('DOMContentLoaded', function() {
    // ContractCore 초기화
    contractCore = new ContractCore();
    
    // ContractForm 초기화
    contractForm = new ContractForm({
        formSelector: '#editForm',
        mode: 'edit',
        contractId: getContractIdFromUrl(),
        redirectUrl: '/contract'
    });
    
    // 삭제 버튼 초기화
    const deleteCleanup = initDeleteContract();
    
    // DOM 언로드 시 리소스 정리
    window.addEventListener('beforeunload', cleanupEventListeners);
});

/**
 * URL에서 계약 ID 추출
 * @returns {string|null} 계약 ID
 */
function getContractIdFromUrl() {
    const pathParts = window.location.pathname.split('/');
    const contractIndex = pathParts.indexOf('contract');
    
    if (contractIndex !== -1 && pathParts[contractIndex + 2]) {
        return pathParts[contractIndex + 2]; // edit/{id} 형태에서 ID 추출
    }
    
    return null;
}

/**
 * 계약 삭제 기능 초기화
 * 삭제 확인 및 처리
 */
function initDeleteContract() {
    const deleteBtn = document.getElementById('deleteContractBtn');
    if (!deleteBtn) return null;
    
    // 삭제 버튼 클릭 이벤트 핸들러
    const handleDeleteClick = async function(e) {
        e.preventDefault();
        
        const contractId = this.getAttribute('data-contract-id') || getContractIdFromUrl();
        if (!contractId) {
            UIUtils.showAlert('계약 ID를 찾을 수 없습니다.', 'danger', 3000);
            return;
        }
        
        try {
            // ContractCore의 삭제 기능 사용
            await contractCore.deleteContract(contractId);
            
            // 성공 시 목록 페이지로 이동
            setTimeout(() => {
                window.location.href = '/contract';
            }, 1500);
            
        } catch (error) {
            console.error('계약 삭제 오류:', error);
        }
    };
    
    // 이벤트 리스너 등록
    deleteBtn.addEventListener('click', handleDeleteClick);
    
    // 정리 함수 반환
    return function cleanup() {
        deleteBtn.removeEventListener('click', handleDeleteClick);
    };
}

/**
 * 페이지 언로드 시 이벤트 리스너 정리
 * 메모리 누수 방지를 위한 정리 작업 수행
 */
function cleanupEventListeners() {
    if (contractForm) {
        contractForm.destroy();
        contractForm = null;
    }
    
    if (contractCore) {
        contractCore.destroy();
        contractCore = null;
    }
    
    console.log('계약 수정 페이지 이벤트 리스너 정리');
} 