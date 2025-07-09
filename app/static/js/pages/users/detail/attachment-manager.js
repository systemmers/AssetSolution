/**
 * 사용자 첨부 파일 관리 모듈
 * @module users/detail/attachment-manager
 */
import UIUtils from '../../../../common/ui-utils.js';
import FileUtils from '../../../../common/file-utils.js';
import ApiUtils from '../../../../common/api-utils.js';

/**
 * 첨부 파일 관리 초기화
 * @returns {Function} 이벤트 정리 함수
 */
export function initAttachmentManagement() {
    const attachmentContainer = document.getElementById('attachments');
    const fileInput = document.getElementById('attachmentFile');
    const uploadBtn = document.getElementById('uploadAttachment');
    
    if (!attachmentContainer || !fileInput || !uploadBtn) return null;
    
    const cleanupFuncs = [];
    
    // 파일 업로드 설정
    const fileInputCleanup = FileUtils.setupFileInput(fileInput, {
        allowedTypes: [], // 모든 타입 허용
        maxSize: 10 * 1024 * 1024, // 10MB
        onError: function(error) {
            UIUtils.showAlert(error.message, 'danger');
        }
    });
    if (fileInputCleanup) cleanupFuncs.push(fileInputCleanup);
    
    // 업로드 버튼 클릭 이벤트
    const handleUpload = function() {
        if (!fileInput.files || fileInput.files.length === 0) {
            UIUtils.showAlert('업로드할 파일을 선택해주세요.', 'warning');
            return;
        }
        
        const file = fileInput.files[0];
        const userId = document.querySelector('[data-user-id]')?.dataset.userId;
        
        if (!userId) {
            UIUtils.showAlert('사용자 ID를 찾을 수 없습니다.', 'danger');
            return;
        }
        
        // 폼 데이터 생성
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', userId);
        
        // 로딩 표시
        UIUtils.toggleLoader(true);
        
        // API 호출 (시연용: 실제 구현시 실제 API 엔드포인트로 변경 필요)
        ApiUtils.post(`/api/users/${userId}/attachments`, formData, {
            handleErrors: true
        })
        .then(response => {
            UIUtils.showAlert('첨부 파일이 성공적으로 업로드되었습니다.', 'success');
            fileInput.value = '';
            
            // 새 첨부 파일 렌더링
            const attachment = {
                id: Date.now(), // 시연용 임의 ID
                filename: file.name,
                size: file.size,
                uploadDate: new Date().toISOString().split('T')[0],
                type: FileUtils.getFileExtension(file.name)
            };
            
            addAttachmentToList(attachment, attachmentContainer);
        })
        .catch(error => {
            UIUtils.showAlert('파일 업로드 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'), 'danger');
        })
        .finally(() => {
            UIUtils.toggleLoader(false);
        });
    };
    
    uploadBtn.addEventListener('click', handleUpload);
    cleanupFuncs.push(() => uploadBtn.removeEventListener('click', handleUpload));
    
    // 기존 첨부 파일에 삭제 이벤트 추가
    const deleteButtons = document.querySelectorAll('.attachment-delete-btn');
    deleteButtons.forEach(btn => {
        const handleDelete = function() {
            const attachmentId = this.dataset.id;
            const attachmentItem = this.closest('.attachment-item');
            
            if (!attachmentId || !attachmentItem) return;
            
            if (confirm('이 첨부 파일을 삭제하시겠습니까?')) {
                deleteAttachment(attachmentId, attachmentItem, attachmentContainer);
            }
        };
        
        btn.addEventListener('click', handleDelete);
        cleanupFuncs.push(() => btn.removeEventListener('click', handleDelete));
    });
    
    // 첨부 파일 다운로드 이벤트 추가
    const downloadButtons = document.querySelectorAll('.attachment-download-btn');
    downloadButtons.forEach(btn => {
        const handleDownload = function() {
            const attachmentId = this.dataset.id;
            const filename = this.dataset.filename;
            
            if (!attachmentId || !filename) return;
            
            downloadAttachment(attachmentId, filename);
        };
        
        btn.addEventListener('click', handleDownload);
        cleanupFuncs.push(() => btn.removeEventListener('click', handleDownload));
    });
    
    // 정리 함수 반환
    return function cleanup() {
        cleanupFuncs.forEach(fn => {
            if (typeof fn === 'function') fn();
        });
    };
}

/**
 * 첨부 파일을 목록에 추가
 * @param {Object} attachment - 첨부 파일 정보
 * @param {HTMLElement} container - 첨부 파일 컨테이너
 */
function addAttachmentToList(attachment, container) {
    if (!container) return;
    
    // 첨부 파일이 없다는 메시지 제거
    const emptyMessage = container.querySelector('.no-attachments');
    if (emptyMessage) {
        emptyMessage.remove();
    }
    
    // 파일 크기 형식화
    const formattedSize = FileUtils.formatFileSize(attachment.size);
    
    // 파일 아이콘 클래스 가져오기
    const iconClass = FileUtils.getFileIconClass(attachment.filename);
    
    // 첨부 파일 항목 생성
    const attachmentItem = document.createElement('div');
    attachmentItem.className = 'attachment-item card mb-2';
    attachmentItem.dataset.id = attachment.id;
    
    attachmentItem.innerHTML = `
        <div class="card-body d-flex align-items-center py-2">
            <div class="attachment-icon me-3">
                <i class="bi ${iconClass} fs-3"></i>
            </div>
            <div class="attachment-details flex-grow-1">
                <div class="attachment-name fw-bold">${attachment.filename}</div>
                <div class="attachment-meta small text-muted">
                    ${formattedSize} • ${attachment.uploadDate}
                </div>
            </div>
            <div class="attachment-actions">
                <button class="btn btn-sm btn-outline-primary attachment-download-btn" 
                        data-id="${attachment.id}" 
                        data-filename="${attachment.filename}">
                    <i class="bi bi-download"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger ms-1 attachment-delete-btn" 
                        data-id="${attachment.id}">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    // 다운로드 버튼 이벤트
    const downloadBtn = attachmentItem.querySelector('.attachment-download-btn');
    downloadBtn.addEventListener('click', function() {
        downloadAttachment(attachment.id, attachment.filename);
    });
    
    // 삭제 버튼 이벤트
    const deleteBtn = attachmentItem.querySelector('.attachment-delete-btn');
    deleteBtn.addEventListener('click', function() {
        if (confirm('이 첨부 파일을 삭제하시겠습니까?')) {
            deleteAttachment(attachment.id, attachmentItem, container);
        }
    });
    
    // 컨테이너에 추가
    container.appendChild(attachmentItem);
}

/**
 * 첨부 파일 다운로드
 * @param {string} attachmentId - 첨부 파일 ID
 * @param {string} filename - 파일명
 */
function downloadAttachment(attachmentId, filename) {
    const userId = document.querySelector('[data-user-id]')?.dataset.userId;
    
    if (!userId || !attachmentId) {
        UIUtils.showAlert('첨부 파일 정보가 올바르지 않습니다.', 'danger');
        return;
    }
    
    // 파일 다운로드 URL
    const downloadUrl = `/api/users/${userId}/attachments/${attachmentId}/download`;
    
    // FileUtils를 사용하여 파일 다운로드
    FileUtils.downloadFile(downloadUrl, filename)
        .catch(error => {
            UIUtils.showAlert('파일 다운로드 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'), 'danger');
        });
}

/**
 * 첨부 파일 삭제
 * @param {string} attachmentId - 첨부 파일 ID
 * @param {HTMLElement} attachmentItem - 첨부 파일 요소
 * @param {HTMLElement} container - 첨부 파일 컨테이너
 */
function deleteAttachment(attachmentId, attachmentItem, container) {
    const userId = document.querySelector('[data-user-id]')?.dataset.userId;
    
    if (!userId || !attachmentId) {
        UIUtils.showAlert('첨부 파일 정보가 올바르지 않습니다.', 'danger');
        return;
    }
    
    // 로딩 표시
    UIUtils.toggleLoader(true);
    
    // API 호출 (시연용: 실제 구현시 실제 API 엔드포인트로 변경 필요)
    ApiUtils.delete(`/api/users/${userId}/attachments/${attachmentId}`, {
        handleErrors: true
    })
    .then(response => {
        // 성공 시 요소 제거
        if (attachmentItem) {
            attachmentItem.remove();
        }
        
        UIUtils.showAlert('첨부 파일이 성공적으로 삭제되었습니다.', 'success');
        
        // 첨부 파일이 더 이상 없는 경우 메시지 표시
        if (container && container.children.length === 0) {
            container.innerHTML = '<div class="no-attachments alert alert-info">첨부 파일이 없습니다.</div>';
        }
    })
    .catch(error => {
        UIUtils.showAlert('첨부 파일 삭제 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'), 'danger');
    })
    .finally(() => {
        UIUtils.toggleLoader(false);
    });
} 