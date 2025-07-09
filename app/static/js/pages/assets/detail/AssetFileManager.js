/**
 * 자산 파일 관리 모듈
 * 자산에 첨부된 파일의 업로드, 다운로드, 삭제 기능을 담당합니다.
 */

import UIUtils from '../../../common/ui-utils.js';
import FormUtils from '../../../common/form-utils.js';
import ApiUtils from '../../../common/api-utils.js';

/**
 * 파일 모달 관련 이벤트 핸들러 초기화
 */
function initFileModalHandlers() {
    // 파일 추가 모달 설정
    const fileModalButton = document.querySelector('[data-bs-target="#fileModal"]');
    if (fileModalButton) {
        UIUtils.setupActionButton(fileModalButton, function() {
            // 모달이 열릴 때 폼 초기화
            FormUtils.resetForm(document.getElementById('fileForm'));
        });
    }
    
    // 파일 업로드 버튼 설정
    const uploadFileButton = document.querySelector('#fileModal .btn-primary');
    if (uploadFileButton) {
        UIUtils.setupActionButton(uploadFileButton, function() {
            if (validateFileForm()) {
                uploadFile();
                UIUtils.toggleModal('#fileModal', 'hide');
            }
        });
    }
}

/**
 * 파일 삭제 이벤트 핸들러 초기화
 */
function initFileDeleteHandlers() {
    const fileDeleteButtons = document.querySelectorAll('.file-delete-btn');
    fileDeleteButtons.forEach(button => {
        UIUtils.setupActionButton(button, handleFileDelete);
    });
}

/**
 * 파일 삭제 이벤트 처리
 * @param {Event} e - 클릭 이벤트
 */
function handleFileDelete(e) {
    const fileItem = e.target.closest('.list-group-item');
    if (!fileItem) return;
    
    const fileName = fileItem.querySelector('a').textContent;
    const fileId = fileItem.dataset.fileId;
    
    deleteFileItem(fileItem, fileName);
}

/**
 * 파일 항목 삭제 처리
 * @param {HTMLElement} fileItem - 삭제할 파일 항목 요소
 * @param {string} fileName - 파일 이름
 */
function deleteFileItem(fileItem, fileName) {
    UIUtils.showConfirmModal({
        title: '파일 삭제',
        message: `"${fileName}" 파일을 삭제하시겠습니까?`,
        confirmText: '삭제',
        cancelText: '취소',
        confirmButtonClass: 'btn-danger'
    }, (confirmed) => {
        if (confirmed) {
            const fileId = fileItem.dataset.fileId;
            deleteFileFromServer(fileId, fileItem, fileName);
        }
    });
}

/**
 * 서버에서 파일 삭제 요청
 * @param {string} fileId - 파일 ID
 * @param {HTMLElement} fileItem - 파일 항목 요소
 * @param {string} fileName - 파일 이름
 */
function deleteFileFromServer(fileId, fileItem, fileName) {
    // 로딩 표시
    UIUtils.showAlert('파일 삭제 중...', 'info');
    
    // API 호출 (시연용: 실제 구현시 실제 API 엔드포인트로 변경 필요)
    ApiUtils.delete(`/api/assets/files/${fileId || 'temp'}`, {
        handleErrors: true,
        showLoader: false
    })
    .then(response => {
        removeFileFromUI(fileItem, fileName);
    })
    .catch(error => {
        console.error('파일 삭제 중 오류:', error);
        UIUtils.showAlert('파일 삭제 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'), 'danger');
    });
}

/**
 * UI에서 파일 항목 제거
 * @param {HTMLElement} fileItem - 파일 항목 요소
 * @param {string} fileName - 파일 이름
 */
function removeFileFromUI(fileItem, fileName) {
    fileItem.remove();
    UIUtils.showAlert(`"${fileName}" 파일이 삭제되었습니다.`, 'success');
    checkEmptyFilesList();
}

/**
 * 파일 목록이 비어있는지 확인하고 메시지 표시
 */
function checkEmptyFilesList() {
    const filesList = document.querySelector('.files-list');
    if (!filesList) return;
    
    if (filesList.querySelectorAll('li').length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'list-group-item text-center text-muted empty-message';
        emptyMessage.textContent = '첨부된 파일이 없습니다.';
        filesList.appendChild(emptyMessage);
    }
}

/**
 * 파일 폼 유효성 검사
 * @returns {boolean} 폼이 유효한지 여부
 */
function validateFileForm() {
    const fileInput = document.getElementById('fileUpload');
    const isValid = fileInput && fileInput.files.length > 0;
    
    if (!isValid && fileInput) {
        FormUtils.setFieldValidState(fileInput, false, '파일을 선택해주세요');
    } else if (fileInput) {
        FormUtils.setFieldValidState(fileInput, true, '');
    }
    
    return isValid;
}

/**
 * 파일 업로드 (백엔드 연동 시 구현)
 */
function uploadFile() {
    // 파일 목록 컨테이너
    const filesList = document.querySelector('.files-list');
    if (!filesList) return;
    
    const fileInput = document.getElementById('fileUpload');
    if (!fileInput || fileInput.files.length === 0) return;
    
    // 로딩 표시
    UIUtils.showAlert('파일 업로드 중...', 'info');
    
    // FormData 생성
    const formData = new FormData(document.getElementById('fileForm'));
    const assetId = document.querySelector('[data-asset-id]')?.dataset.assetId;
    if (assetId) {
        formData.append('assetId', assetId);
    }
    
    // 서버에 파일 업로드 (예시 코드, 실제로는 API 호출)
    // 임시로 성공한 것처럼 UI 업데이트
    Array.from(fileInput.files).forEach(file => {
        // 파일 항목 생성
        const fileItem = createFileItemElement(file);
        
        // 삭제 버튼에 이벤트 핸들러 추가
        const deleteButton = fileItem.querySelector('.file-delete-btn');
        UIUtils.setupActionButton(deleteButton, handleFileDelete);
        
        // 목록에 추가
        const emptyMessage = filesList.querySelector('.empty-message');
        if (emptyMessage) {
            emptyMessage.remove();
        }
        
        filesList.appendChild(fileItem);
    });
    
    // 성공 메시지
    UIUtils.showAlert(`${fileInput.files.length}개 파일이 업로드되었습니다.`, 'success');
}

/**
 * 파일 항목 요소 생성
 * @param {File} file - 파일 객체
 * @returns {HTMLElement} 생성된 파일 항목 요소
 */
function createFileItemElement(file) {
    // 파일 아이콘 결정
    const fileType = file.name.split('.').pop().toLowerCase();
    let iconClass = 'fas fa-file';
    let iconColor = 'text-secondary';
    
    if (['pdf'].includes(fileType)) {
        iconClass = 'fas fa-file-pdf';
        iconColor = 'text-danger';
    } else if (['doc', 'docx'].includes(fileType)) {
        iconClass = 'fas fa-file-word';
        iconColor = 'text-primary';
    } else if (['xls', 'xlsx'].includes(fileType)) {
        iconClass = 'fas fa-file-excel';
        iconColor = 'text-success';
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileType)) {
        iconClass = 'fas fa-file-image';
        iconColor = 'text-info';
    }
    
    // 파일 항목 요소 생성
    const fileItem = document.createElement('li');
    fileItem.className = 'list-group-item d-flex justify-content-between align-items-center';
    fileItem.dataset.fileId = `temp_${Date.now()}`;
    
    // 파일 항목 내용 구성
    fileItem.innerHTML = `
        <div>
            <i class="${iconClass} ${iconColor} me-2"></i>
            <a href="#" class="text-decoration-none">${file.name}</a>
            <small class="text-muted ms-2">${formatFileSize(file.size)}</small>
        </div>
        <div>
            <button type="button" class="btn btn-sm btn-outline-danger file-delete-btn">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
    `;
    
    return fileItem;
}

/**
 * 파일 크기 포맷팅
 * @param {number} bytes - 파일 크기 (바이트)
 * @returns {string} 포맷된 파일 크기
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 공개 API
export {
    initFileModalHandlers,
    initFileDeleteHandlers,
    handleFileDelete,
    validateFileForm,
    uploadFile
}; 