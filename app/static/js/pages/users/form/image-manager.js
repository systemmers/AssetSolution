/**
 * 사용자 프로필 이미지 관리 모듈
 * @module users/form/image-manager
 */

/**
 * 프로필 이미지 업로드 기능 초기화
 * @returns {Object} 업로드 컨트롤러
 */
function initProfileImageUpload() {
    if (typeof ImageUploadUtils === 'undefined') {
        console.error('ImageUploadUtils가 로드되지 않았습니다.');
        return null;
    }
    
    // 기존 컨테이너가 있는지 확인
    const existingContainer = document.getElementById('imagePreview');
    if (!existingContainer) {
        console.error('imagePreview 컨테이너를 찾을 수 없습니다.');
        return null;
    }
    
    // 공통 유틸리티로 프로필 이미지 업로드 초기화
    const uploadController = ImageUploadUtils.createProfileUpload('imagePreview', {
        maxSize: 2 * 1024 * 1024, // 2MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
        previewSize: '200px',
        circular: false, // 사용자 프로필은 사각형
        dragDrop: true,
        showFileName: true,
        showRemoveButton: true,
        onUpload: function(file) {
            console.log('프로필 이미지 업로드:', file.name);
            
            // 숨겨진 파일 입력에도 설정
            const hiddenInput = document.getElementById('profileImage');
            if (hiddenInput) {
                const dt = new DataTransfer();
                dt.items.add(file);
                hiddenInput.files = dt.files;
                
                // 변경 이벤트 발생
                const event = new Event('change', { bubbles: true });
                hiddenInput.dispatchEvent(event);
            }
        },
        onError: function(message) {
            if (typeof showAlert === 'function') {
                showAlert(message, 'warning');
            } else {
                alert(message);
            }
        },
        onRemove: function() {
            // 숨겨진 파일 입력 초기화
            const hiddenInput = document.getElementById('profileImage');
            if (hiddenInput) {
                hiddenInput.value = '';
            }
            console.log('프로필 이미지 제거됨');
        }
    });
    
    return uploadController;
}

/**
 * 알림 표시 함수 (호환성)
 * @param {string} message - 메시지
 * @param {string} type - 알림 타입
 */
function showAlert(message, type = 'info') {
    if (typeof UIUtils !== 'undefined' && UIUtils.showAlert) {
        UIUtils.showAlert(message, type);
    } else {
        // 기본 Bootstrap 알림
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // 5초 후 자동 제거
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

// 전역 함수로 노출 (호환성)
window.initProfileImageUpload = initProfileImageUpload;

// ES6 모듈 호환성
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initProfileImageUpload };
} 