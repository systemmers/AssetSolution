/**
 * FileUtils - 파일 관련 공통 유틸리티 모듈
 * 
 * 파일 업로드, 다운로드, 미리보기, 유효성 검사 등
 * 파일 처리 관련 기능을 제공하는 유틸리티 모듈입니다.
 */

const FileUtils = (function() {
    /**
     * 파일 유효성 검사
     * @param {File} file - 검사할 파일 객체
     * @param {Object} options - 검사 옵션
     * @param {number} [options.maxSize=5242880] - 최대 파일 크기 (기본값: 5MB)
     * @param {Array<string>} [options.allowedTypes=[]] - 허용된 MIME 타입 배열 (빈 배열: 모든 타입 허용)
     * @param {Array<string>} [options.allowedExtensions=[]] - 허용된 확장자 배열 (빈 배열: 모든 확장자 허용)
     * @returns {Object} 검사 결과 {valid: boolean, message: string}
     */
    function validateFile(file, options = {}) {
        if (!file) {
            return { valid: false, message: '파일이 선택되지 않았습니다.' };
        }
        
        const {
            maxSize = 5 * 1024 * 1024, // 기본 5MB
            allowedTypes = [],
            allowedExtensions = []
        } = options;
        
        // 파일 크기 검사
        if (file.size > maxSize) {
            const maxSizeMB = Math.round(maxSize / (1024 * 1024) * 10) / 10;
            return { 
                valid: false, 
                message: `파일 크기가 너무 큽니다. 최대 ${maxSizeMB}MB까지 허용됩니다.` 
            };
        }
        
        // MIME 타입 검사
        if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
            return { 
                valid: false, 
                message: `허용되지 않는 파일 형식입니다. 허용된 형식: ${allowedTypes.join(', ')}` 
            };
        }
        
        // 확장자 검사
        if (allowedExtensions.length > 0) {
            const fileExtension = file.name.split('.').pop().toLowerCase();
            if (!allowedExtensions.includes(fileExtension)) {
                return { 
                    valid: false, 
                    message: `허용되지 않는 확장자입니다. 허용된 확장자: ${allowedExtensions.join(', ')}` 
                };
            }
        }
        
        return { valid: true, message: '파일이 유효합니다.' };
    }
    
    /**
     * 이미지 파일 미리보기 생성
     * @param {File} imageFile - 미리보기를 생성할 이미지 파일
     * @param {HTMLElement} previewContainer - 미리보기가 표시될 컨테이너 요소
     * @param {Object} options - 미리보기 옵션
     * @param {string} [options.imageClass='img-thumbnail'] - 미리보기 이미지에 적용할 CSS 클래스
     * @param {number} [options.maxHeight=200] - 미리보기 이미지 최대 높이(px)
     * @param {boolean} [options.showFileName=false] - 파일 이름 표시 여부
     * @param {boolean} [options.showCancelButton=true] - 취소 버튼 표시 여부
     * @param {Function} [options.onCancel] - 취소 버튼 클릭 시 실행할 콜백 함수
     * @returns {Promise<HTMLElement|null>} 미리보기 요소 또는 null
     */
    function createImagePreview(imageFile, previewContainer, options = {}) {
        return new Promise((resolve, reject) => {
            if (!imageFile || !previewContainer) {
                reject(new Error('파일 또는 미리보기 컨테이너가 지정되지 않았습니다.'));
                return;
            }
            
            // 이미지 파일인지 확인
            if (!imageFile.type.match('image.*')) {
                reject(new Error('이미지 파일만 미리보기가 가능합니다.'));
                return;
            }
            
            const {
                imageClass = 'img-thumbnail',
                maxHeight = 200,
                showFileName = false,
                showCancelButton = true,
                onCancel = null
            } = options;
            
            // 기존 미리보기 제거
            while (previewContainer.firstChild) {
                previewContainer.removeChild(previewContainer.firstChild);
            }
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                // 미리보기 래퍼 생성
                const previewWrapper = document.createElement('div');
                previewWrapper.className = 'image-preview-wrapper';
                
                // 미리보기 이미지 생성
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = imageClass;
                img.style.maxHeight = `${maxHeight}px`;
                previewWrapper.appendChild(img);
                
                // 파일명 표시 (선택적)
                if (showFileName) {
                    const fileNameEl = document.createElement('div');
                    fileNameEl.className = 'file-name mt-1 small';
                    fileNameEl.textContent = imageFile.name;
                    previewWrapper.appendChild(fileNameEl);
                }
                
                // 취소 버튼 (선택적)
                if (showCancelButton) {
                    const cancelBtn = document.createElement('button');
                    cancelBtn.className = 'btn btn-sm btn-outline-secondary mt-2';
                    cancelBtn.textContent = '취소';
                    cancelBtn.type = 'button';
                    
                    cancelBtn.addEventListener('click', function() {
                        // 미리보기 제거
                        while (previewContainer.firstChild) {
                            previewContainer.removeChild(previewContainer.firstChild);
                        }
                        
                        // 사용자 지정 콜백 실행
                        if (typeof onCancel === 'function') {
                            onCancel();
                        }
                    });
                    
                    previewWrapper.appendChild(cancelBtn);
                }
                
                // 컨테이너에 미리보기 추가
                previewContainer.appendChild(previewWrapper);
                
                resolve(previewWrapper);
            };
            
            reader.onerror = function(error) {
                reject(error);
            };
            
            reader.readAsDataURL(imageFile);
        });
    }
    
    /**
     * 파일 입력 요소 초기화
     * @param {string|HTMLElement} fileInput - 파일 입력 요소 또는 선택자
     * @param {Object} options - 초기화 옵션
     * @param {HTMLElement|string} [options.previewContainer] - 미리보기 컨테이너 요소 또는 선택자
     * @param {Array<string>} [options.allowedTypes=[]] - 허용된 MIME 타입 배열
     * @param {Array<string>} [options.allowedExtensions=[]] - 허용된 확장자 배열
     * @param {number} [options.maxSize=5242880] - 최대 파일 크기 (기본값: 5MB)
     * @param {boolean} [options.multiple=false] - 다중 파일 업로드 허용 여부
     * @param {Function} [options.onChange] - 파일 변경 시 호출할 콜백 함수
     * @param {Function} [options.onError] - 오류 발생 시 호출할 콜백 함수
     */
    function setupFileInput(fileInput, options = {}) {
        // 파일 입력 요소 가져오기
        const input = typeof fileInput === 'string' 
            ? document.querySelector(fileInput) 
            : fileInput;
            
        if (!input || input.type !== 'file') {
            console.error('유효한 파일 입력 요소가 아닙니다.');
            return;
        }
        
        const {
            previewContainer = null,
            allowedTypes = [],
            allowedExtensions = [],
            maxSize = 5 * 1024 * 1024,
            multiple = false,
            onChange = null,
            onError = null
        } = options;
        
        // 미리보기 컨테이너 가져오기 (지정된 경우)
        const previewEl = previewContainer 
            ? (typeof previewContainer === 'string' 
                ? document.querySelector(previewContainer) 
                : previewContainer)
            : null;
        
        // 다중 파일 속성 설정
        input.multiple = multiple;
        
        // 파일 변경 이벤트 핸들러
        const handleFileChange = function(e) {
            const files = e.target.files;
            
            if (!files || files.length === 0) {
                return;
            }
            
            // 단일 파일 모드에서 첫 번째 파일만 처리
            if (!multiple && files.length > 1) {
                const error = new Error('다중 파일 선택이 허용되지 않습니다.');
                if (typeof onError === 'function') {
                    onError(error);
                } else {
                    console.error(error);
                }
                return;
            }
            
            // 각 파일 처리
            Array.from(files).forEach(file => {
                // 파일 유효성 검사
                const validation = validateFile(file, {
                    maxSize,
                    allowedTypes,
                    allowedExtensions
                });
                
                if (!validation.valid) {
                    if (typeof onError === 'function') {
                        onError(new Error(validation.message));
                    } else {
                        console.error(validation.message);
                    }
                    return;
                }
                
                // 이미지 파일인 경우 미리보기 생성
                if (previewEl && file.type.match('image.*')) {
                    createImagePreview(file, previewEl, {
                        onCancel: () => {
                            // 파일 입력 초기화
                            input.value = '';
                        }
                    }).catch(error => {
                        if (typeof onError === 'function') {
                            onError(error);
                        } else {
                            console.error('이미지 미리보기 생성 실패:', error);
                        }
                    });
                }
            });
            
            // 변경 콜백 호출
            if (typeof onChange === 'function') {
                onChange(files);
            }
        };
        
        // 기존 이벤트 리스너 제거 후 새로 등록
        input.removeEventListener('change', handleFileChange);
        input.addEventListener('change', handleFileChange);
        
        // 클린업 함수 반환
        return function cleanup() {
            input.removeEventListener('change', handleFileChange);
        };
    }
    
    /**
     * 파일 다운로드
     * @param {string} url - 다운로드할 파일 URL
     * @param {string} [filename] - 저장할 파일명 (지정하지 않으면 URL에서 추출)
     * @returns {Promise<boolean>} 다운로드 성공 여부
     */
    function downloadFile(url, filename) {
        return new Promise((resolve, reject) => {
            if (!url) {
                reject(new Error('다운로드 URL이 지정되지 않았습니다.'));
                return;
            }
            
            // 파일명이 지정되지 않은 경우 URL에서 추출
            const downloadFilename = filename || url.split('/').pop().split('?')[0];
            
            // fetch로 파일 다운로드
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP 오류: ${response.status}`);
                    }
                    return response.blob();
                })
                .then(blob => {
                    // Blob URL 생성
                    const blobUrl = URL.createObjectURL(blob);
                    
                    // 다운로드 링크 생성 및 클릭
                    const link = document.createElement('a');
                    link.href = blobUrl;
                    link.download = downloadFilename;
                    link.style.display = 'none';
                    
                    document.body.appendChild(link);
                    link.click();
                    
                    // 리소스 정리
                    setTimeout(() => {
                        document.body.removeChild(link);
                        URL.revokeObjectURL(blobUrl);
                    }, 100);
                    
                    resolve(true);
                })
                .catch(error => {
                    console.error('파일 다운로드 실패:', error);
                    reject(error);
                });
        });
    }
    
    /**
     * 파일 크기를 읽기 쉬운 형식으로 변환
     * @param {number} bytes - 변환할 바이트 수
     * @param {number} [decimals=2] - 소수점 자릿수
     * @returns {string} 변환된 파일 크기 문자열 (예: "1.5 MB")
     */
    function formatFileSize(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    
    /**
     * 파일 확장자 추출
     * @param {string} filename - 파일명
     * @returns {string} 파일 확장자 (소문자)
     */
    function getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    }
    
    /**
     * 파일 유형에 따른 아이콘 클래스 반환
     * @param {string} filename - 파일명 또는 MIME 타입
     * @returns {string} 아이콘 클래스
     */
    function getFileIconClass(filename) {
        const extension = getFileExtension(filename);
        
        // 파일 확장자별 아이콘 클래스 매핑
        const iconMap = {
            // 이미지
            'jpg': 'bi-file-image',
            'jpeg': 'bi-file-image',
            'png': 'bi-file-image',
            'gif': 'bi-file-image',
            'svg': 'bi-file-image',
            'webp': 'bi-file-image',
            
            // 문서
            'pdf': 'bi-file-pdf',
            'doc': 'bi-file-word',
            'docx': 'bi-file-word',
            'xls': 'bi-file-excel',
            'xlsx': 'bi-file-excel',
            'ppt': 'bi-file-ppt',
            'pptx': 'bi-file-ppt',
            'txt': 'bi-file-text',
            'rtf': 'bi-file-text',
            
            // 압축
            'zip': 'bi-file-zip',
            'rar': 'bi-file-zip',
            '7z': 'bi-file-zip',
            'tar': 'bi-file-zip',
            'gz': 'bi-file-zip',
            
            // 코드
            'html': 'bi-file-code',
            'css': 'bi-file-code',
            'js': 'bi-file-code',
            'json': 'bi-file-code',
            'py': 'bi-file-code',
            'java': 'bi-file-code',
            'php': 'bi-file-code',
            
            // 미디어
            'mp3': 'bi-file-music',
            'wav': 'bi-file-music',
            'mp4': 'bi-file-play',
            'avi': 'bi-file-play',
            'mov': 'bi-file-play',
            'wmv': 'bi-file-play'
        };
        
        return iconMap[extension] || 'bi-file';
    }
    
    // 공개 API
    return {
        validateFile,
        createImagePreview,
        setupFileInput,
        downloadFile,
        formatFileSize,
        getFileExtension,
        getFileIconClass
    };
})();

// 모듈 내보내기
export default FileUtils; 