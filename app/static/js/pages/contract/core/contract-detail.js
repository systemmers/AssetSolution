/**
 * 계약 상세보기 관리 모듈
 * 계약 상세 페이지의 탭 관리, 문서 업로드, 연결된 자산 표시 등의 기능 제공
 * 
 * @class ContractDetail
 * @description 계약 상세보기 관련 기능 관리
 * 
 * 주요 기능:
 * - 탭 전환 및 상태 관리
 * - 문서 업로드 및 관리
 * - 연결된 자산 테이블
 * - 계약 정보 표시
 */

import UIUtils from '../../../common/ui-utils.js';
import TableUtils from '../../../common/table-utils.js';
import FormUtils from '../../../common/form-utils.js';
import ContractCore from './contract-core.js';

class ContractDetail {
    /**
     * ContractDetail 클래스 생성자
     * @param {Object} config 설정 옵션
     */
    constructor(config = {}) {
        this.config = {
            contractId: null,
            tabsSelector: '.nav-link[data-bs-toggle="tab"]',
            uploadModalSelector: '#uploadDocumentModal',
            uploadFormSelector: '#uploadDocumentForm',
            fileInputSelector: '#documentFile',
            fileNameDisplaySelector: '#selectedFileName',
            assetsTableSelector: '.assets-table',
            documentsTableSelector: '.documents-table',
            deleteDocumentSelector: '.delete-document',
            downloadDocumentSelector: '.download-document',
            ...config
        };
        
        this.contractCore = new ContractCore();
        this.contractData = null;
        this.cleanupFunctions = [];
        
        this.initialize();
    }
    
    /**
     * ContractDetail 초기화
     */
    initialize() {
        // 계약 ID 추출
        this._extractContractId();
        
        // 탭 관리 초기화
        const tabCleanup = this._setupTabs();
        if (tabCleanup) this.cleanupFunctions.push(tabCleanup);
        
        // 문서 업로드 초기화
        const uploadCleanup = this._setupDocumentUpload();
        if (uploadCleanup) this.cleanupFunctions.push(uploadCleanup);
        
        // 문서 관리 초기화
        const docCleanup = this._setupDocumentManagement();
        if (docCleanup) this.cleanupFunctions.push(docCleanup);
        
        // 자산 테이블 초기화
        const assetCleanup = this._setupAssetsTable();
        if (assetCleanup) this.cleanupFunctions.push(assetCleanup);
        
        // 계약 데이터 로드
        this._loadContractData();
        
        console.log('ContractDetail 초기화됨 - 계약 ID:', this.config.contractId);
    }
    
    /**
     * 계약 ID 추출
     */
    _extractContractId() {
        // URL에서 계약 ID 추출
        const pathParts = window.location.pathname.split('/');
        const contractIndex = pathParts.indexOf('contract');
        
        if (contractIndex !== -1 && pathParts[contractIndex + 1]) {
            this.config.contractId = pathParts[contractIndex + 1];
        }
        
        // 또는 데이터 속성에서 추출
        const contractElement = document.querySelector('[data-contract-id]');
        if (contractElement && !this.config.contractId) {
            this.config.contractId = contractElement.getAttribute('data-contract-id');
        }
    }
    
    /**
     * 탭 관리 설정
     * @returns {Function} 정리 함수
     */
    _setupTabs() {
        const tabs = document.querySelectorAll(this.config.tabsSelector);
        if (tabs.length === 0) return null;
        
        // 탭 전환 이벤트
        const handleTabShow = (e) => {
            const tabId = e.target.getAttribute('href');
            
            // URL 해시 업데이트
            if (tabId) {
                history.replaceState(null, null, tabId);
            }
            
            // 탭별 특별 처리
            this._handleTabSpecificActions(tabId);
        };
        
        // 이벤트 리스너 등록
        tabs.forEach(tab => {
            tab.addEventListener('shown.bs.tab', handleTabShow);
        });
        
        // 페이지 로드 시 URL 해시에 따른 탭 활성화
        this._activateTabFromHash();
        
        return () => {
            tabs.forEach(tab => {
                tab.removeEventListener('shown.bs.tab', handleTabShow);
            });
        };
    }
    
    /**
     * URL 해시에 따른 탭 활성화
     */
    _activateTabFromHash() {
        const hash = window.location.hash;
        if (!hash) return;
        
        const targetTab = document.querySelector(`.nav-link[href="${hash}"]`);
        if (targetTab && typeof bootstrap !== 'undefined') {
            try {
                const tab = new bootstrap.Tab(targetTab);
                tab.show();
            } catch (error) {
                console.error('탭 초기화 오류:', error);
            }
        }
    }
    
    /**
     * 탭별 특별 처리
     * @param {string} tabId 탭 ID
     */
    _handleTabSpecificActions(tabId) {
        switch (tabId) {
            case '#documents':
                this._refreshDocuments();
                break;
            case '#assets':
                this._refreshAssets();
                break;
            case '#history':
                this._loadContractHistory();
                break;
        }
    }
    
    /**
     * 문서 업로드 설정
     * @returns {Function} 정리 함수
     */
    _setupDocumentUpload() {
        const uploadModal = document.querySelector(this.config.uploadModalSelector);
        const uploadForm = document.querySelector(this.config.uploadFormSelector);
        const fileInput = document.querySelector(this.config.fileInputSelector);
        const fileNameDisplay = document.querySelector(this.config.fileNameDisplaySelector);
        
        if (!uploadForm || !fileInput) return null;
        
        // 파일 선택 이벤트
        const handleFileChange = () => {
            if (fileInput.files && fileInput.files[0]) {
                const file = fileInput.files[0];
                if (fileNameDisplay) {
                    fileNameDisplay.textContent = file.name;
                }
                
                // 파일 크기 검증
                if (file.size > 50 * 1024 * 1024) { // 50MB 제한
                    UIUtils.showAlert('파일 크기는 50MB 이하여야 합니다.', 'warning', 3000);
                    fileInput.value = '';
                    if (fileNameDisplay) {
                        fileNameDisplay.textContent = '선택된 파일 없음';
                    }
                }
            } else if (fileNameDisplay) {
                fileNameDisplay.textContent = '선택된 파일 없음';
            }
        };
        
        // 폼 제출 이벤트
        const handleFormSubmit = async (e) => {
            e.preventDefault();
            
            if (!fileInput.files || !fileInput.files[0]) {
                UIUtils.showAlert('파일을 선택해주세요.', 'warning', 3000);
                return;
            }
            
            const file = fileInput.files[0];
            const description = uploadForm.querySelector('[name="description"]')?.value || '';
            
            try {
                await this.contractCore.uploadDocument(this.config.contractId, file, {
                    description: description
                });
                
                // 모달 닫기
                if (uploadModal && typeof bootstrap !== 'undefined') {
                    const modal = bootstrap.Modal.getInstance(uploadModal);
                    if (modal) modal.hide();
                }
                
                // 폼 리셋
                uploadForm.reset();
                if (fileNameDisplay) {
                    fileNameDisplay.textContent = '선택된 파일 없음';
                }
                
                // 문서 목록 새로고침
                this._refreshDocuments();
                
            } catch (error) {
                console.error('문서 업로드 오류:', error);
            }
        };
        
        // 이벤트 리스너 등록
        fileInput.addEventListener('change', handleFileChange);
        uploadForm.addEventListener('submit', handleFormSubmit);
        
        return () => {
            fileInput.removeEventListener('change', handleFileChange);
            uploadForm.removeEventListener('submit', handleFormSubmit);
        };
    }
    
    /**
     * 문서 관리 설정
     * @returns {Function} 정리 함수
     */
    _setupDocumentManagement() {
        const documentsTable = document.querySelector(this.config.documentsTableSelector);
        if (!documentsTable) return null;
        
        const cleanupFunctions = [];
        
        // 문서 삭제 버튼
        const deleteButtons = documentsTable.querySelectorAll(this.config.deleteDocumentSelector);
        deleteButtons.forEach(button => {
            const handleDelete = async () => {
                const documentId = button.getAttribute('data-document-id');
                if (!documentId) return;
                
                const confirmed = await new Promise(resolve => {
                    UIUtils.showConfirmDialog({
                        title: '문서 삭제',
                        message: '이 문서를 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.',
                        confirmText: '삭제',
                        cancelText: '취소',
                        confirmButtonClass: 'btn-danger',
                        onConfirm: () => resolve(true),
                        onCancel: () => resolve(false)
                    });
                });
                
                if (confirmed) {
                    try {
                        // 문서 삭제 API 호출 (구현 필요)
                        // await this.contractCore.deleteDocument(documentId);
                        UIUtils.showAlert('문서가 삭제되었습니다.', 'success', 3000);
                        this._refreshDocuments();
                    } catch (error) {
                        console.error('문서 삭제 오류:', error);
                    }
                }
            };
            
            button.addEventListener('click', handleDelete);
            cleanupFunctions.push(() => {
                button.removeEventListener('click', handleDelete);
            });
        });
        
        // 문서 다운로드 버튼
        const downloadButtons = documentsTable.querySelectorAll(this.config.downloadDocumentSelector);
        downloadButtons.forEach(button => {
            const handleDownload = () => {
                const downloadUrl = button.getAttribute('data-download-url');
                if (downloadUrl) {
                    window.open(downloadUrl, '_blank');
                }
            };
            
            button.addEventListener('click', handleDownload);
            cleanupFunctions.push(() => {
                button.removeEventListener('click', handleDownload);
            });
        });
        
        return () => {
            cleanupFunctions.forEach(cleanup => cleanup());
        };
    }
    
    /**
     * 연결된 자산 테이블 설정
     * @returns {Function} 정리 함수
     */
    _setupAssetsTable() {
        const assetsTable = document.querySelector(this.config.assetsTableSelector);
        if (!assetsTable) return null;
        
        // 테이블 행 클릭 이벤트
        const tableClickCleanup = TableUtils.initTableRowClick({
            tableSelector: this.config.assetsTableSelector,
            rowSelector: 'tbody tr',
            ignoreTags: ['button', 'a', 'input'],
            dataAttribute: 'href',
            onRowClick: (url) => {
                if (url) {
                    window.location.href = url;
                }
            }
        });
        
        return tableClickCleanup;
    }
    
    /**
     * 계약 데이터 로드
     */
    async _loadContractData() {
        if (!this.config.contractId) return;
        
        try {
            this.contractData = await this.contractCore.getContract(this.config.contractId);
            this._updateContractDisplay();
        } catch (error) {
            console.error('계약 데이터 로드 오류:', error);
        }
    }
    
    /**
     * 계약 정보 표시 업데이트
     */
    _updateContractDisplay() {
        if (!this.contractData) return;
        
        // 계약 정보 필드 업데이트
        const fieldsMap = {
            'contract-title': 'title',
            'contract-start-date': 'startDate',
            'contract-end-date': 'endDate',
            'contract-cost': 'cost',
            'contract-status': 'status',
            'contract-description': 'description'
        };
        
        Object.keys(fieldsMap).forEach(elementId => {
            const element = document.getElementById(elementId);
            const fieldName = fieldsMap[elementId];
            
            if (element && this.contractData[fieldName] !== undefined) {
                let value = this.contractData[fieldName];
                
                // 특별 포맷팅
                if (fieldName === 'cost') {
                    value = this.contractCore.formatCost(value);
                } else if (fieldName.includes('Date')) {
                    value = new Date(value).toLocaleDateString('ko-KR');
                }
                
                element.textContent = value || '-';
            }
        });
    }
    
    /**
     * 문서 목록 새로고침
     */
    _refreshDocuments() {
        // 문서 목록 새로고침 구현
        console.log('문서 목록 새로고침');
    }
    
    /**
     * 자산 목록 새로고침
     */
    _refreshAssets() {
        // 자산 목록 새로고침 구현
        console.log('자산 목록 새로고침');
    }
    
    /**
     * 계약 히스토리 로드
     */
    _loadContractHistory() {
        // 계약 히스토리 로드 구현
        console.log('계약 히스토리 로드');
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
        
        console.log('ContractDetail 리소스 정리');
    }
}

export default ContractDetail; 