/**
 * 이미지 업로드 공통 유틸리티
 * 모든 이미지 업로드 기능을 통합 관리
 * 
 * @version 2.0.0
 * @author Asset Management System
 * @pattern IIFE (Immediately Invoked Function Expression)
 */

const ImageUploadUtils = (function() {
    
    // ===== PRIVATE VARIABLES =====
    
    /**
     * 기본 설정값
     * @private
     */
    const DEFAULT_SETTINGS = {
            maxSize: 5 * 1024 * 1024, // 5MB
            allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
            previewClass: 'img-thumbnail',
            maxHeight: '200px',
            showFileName: false,
            showRemoveButton: true,
            dragDrop: false,
            onUpload: null,
            onError: null,
            onRemove: null
        };
        
    /**
     * 활성 업로드 인스턴스 관리
     * @private
     */
    const uploadInstances = new Map();
    
    /**
     * 고유 ID 생성 카운터
     * @private
     */
    let instanceCounter = 0;
    
    // ===== PRIVATE METHODS =====
    
    /**
     * 설정 병합
     * @param {Object} userOptions - 사용자 지정 옵션
     * @param {Object} defaultOptions - 기본 옵션
     * @returns {Object} 병합된 설정
     * @private
     */
    function _mergeSettings(userOptions = {}, defaultOptions = DEFAULT_SETTINGS) {
        return Object.assign({}, defaultOptions, userOptions);
    }
    
    /**
     * 고유 인스턴스 ID 생성
     * @returns {string} 고유 ID
     * @private
     */
    function _generateInstanceId() {
        return `img-upload-${Date.now()}-${++instanceCounter}`;
    }
    
    /**
     * 파일 유효성 검사
     * @param {File} file - 검사할 파일
     * @param {Object} settings - 검사 설정
     * @returns {Object} 검사 결과
     * @private
     */
    function _validateFile(file, settings) {
        // 파일 타입 검사
        if (!settings.allowedTypes.includes(file.type.toLowerCase())) {
            return {
                valid: false,
                error: `허용되지 않는 파일 형식입니다. (${settings.allowedTypes.join(', ')}만 허용)`
            };
        }
        
        // 파일 크기 검사
        if (file.size > settings.maxSize) {
            const maxSizeMB = (settings.maxSize / 1024 / 1024).toFixed(1);
            return {
                valid: false,
                error: `파일 크기가 너무 큽니다. (최대 ${maxSizeMB}MB)`
            };
        }
        
        return { valid: true };
    }
    
    /**
     * 에러 표시
     * @param {string} message - 에러 메시지
     * @param {Object} settings - 설정
     * @private
     */
    function _showError(message, settings) {
        if (typeof settings.onError === 'function') {
            settings.onError(message);
        } else {
            _showAlert(message, 'danger');
        }
    }
    
    /**
     * 알림 표시
     * @param {string} message - 메시지
     * @param {string} type - 알림 타입
     * @private
     */
    function _showAlert(message, type = 'info') {
        // UIUtils가 있으면 사용, 없으면 기본 alert
        if (window.UIUtils && typeof window.UIUtils.showAlert === 'function') {
            window.UIUtils.showAlert(message, type);
        } else {
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
    
    /**
     * 기본 업로드 HTML 생성
     * @param {Object} config - 설정
     * @returns {string} HTML 문자열
     * @private
     */
    function _createBasicHTML(config) {
        return `
            <div class="image-upload-basic">
                <input type="file" class="d-none" accept="${config.allowedTypes.join(',')}" />
                <div class="upload-area border-2 border-dashed rounded p-4 text-center" style="cursor: pointer; min-height: 120px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                    <i class="fas fa-cloud-upload-alt fa-2x text-muted mb-2"></i>
                    <p class="text-muted mb-0">클릭하여 이미지 선택</p>
                    ${config.dragDrop ? '<small class="text-muted">또는 파일을 드래그하세요</small>' : ''}
                </div>
                <div class="preview-container mt-3"></div>
            </div>
        `;
    }
    
    /**
     * 쇼핑몰 스타일 HTML 생성
     * @param {Object} config - 설정
     * @returns {string} HTML 문자열
     * @private
     */
    function _createProductHTML(config) {
        return `
            <div class="product-image-upload">
                <!-- 대표 이미지 -->
                <div class="mb-4">
                    <label class="form-label fw-bold">대표 이미지</label>
                    <div class="main-image-holder border rounded d-flex flex-column justify-content-center align-items-center">
                        <i class="fas fa-camera fa-3x text-muted mb-2"></i>
                        <p class="text-muted mb-0">클릭하여 이미지 선택</p>
                        <small class="text-muted">권장 크기: 800x800px</small>
                        <input type="file" class="d-none" accept="${config.allowedTypes.join(',')}" />
                    </div>
                </div>
                
                <!-- 추가 이미지 -->
                <div class="mb-3">
                    <label class="form-label fw-bold">추가 이미지 (최대 ${config.additionalImages}장)</label>
                    <div class="additional-images-grid">
                        ${Array.from({length: config.additionalImages}, (_, i) => `
                            <div class="additional-image-item">
                                <div class="additional-image-holder border rounded d-flex justify-content-center align-items-center">
                                    <i class="fas fa-plus text-muted"></i>
                                    <input type="file" class="d-none" accept="${config.allowedTypes.join(',')}" />
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * 드래그 앤 드롭 설정
     * @param {HTMLElement} dropZone - 드롭 영역
     * @param {HTMLInputElement} input - 파일 입력
     * @param {HTMLElement} previewContainer - 미리보기 컨테이너
     * @param {Object} config - 설정
     * @private
     */
    function _setupDragAndDrop(dropZone, input, previewContainer, config) {
        // 기본 이벤트 방지
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });
        
        // 드래그 진입/오버 시 하이라이트
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.add('drag-over');
            });
        });
        
        // 드래그 벗어남/드롭 시 하이라이트 제거
        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.remove('drag-over');
            });
        });
        
        // 드롭 처리
        dropZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                _handleFileUpload(file, previewContainer, config);
                
                // 파일 입력에도 설정 (폼 제출시 필요)
                const dt = new DataTransfer();
                dt.items.add(file);
                input.files = dt.files;
            }
        });
    }
    
    /**
     * 파일 업로드 처리
     * @param {File} file - 업로드할 파일
     * @param {HTMLElement} previewContainer - 미리보기 컨테이너
     * @param {Object} config - 설정
     * @private
     */
    function _handleFileUpload(file, previewContainer, config) {
        // 파일 유효성 검사
        const validation = _validateFile(file, config);
        
        if (!validation.valid) {
            _showError(validation.error, config);
            return;
        }
        
        // 미리보기 생성
        _createPreview(file, previewContainer, config)
            .then(() => {
                if (typeof config.onUpload === 'function') {
                    config.onUpload(file);
                }
            })
            .catch((error) => {
                _showError(error.message, config);
            });
    }
    
    /**
     * 이미지 미리보기 생성
     * @param {File} file - 이미지 파일
     * @param {HTMLElement} container - 미리보기 컨테이너
     * @param {Object} options - 미리보기 옵션
     * @returns {Promise} 미리보기 생성 프로미스
     * @private
     */
    function _createPreview(file, container, options = {}) {
        const {
            previewClass = 'img-thumbnail',
            maxHeight = '200px',
            showFileName = false,
            showRemoveButton = true,
            circular = false,
            onRemove = null
        } = options;
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                // 기존 미리보기 제거
                container.innerHTML = '';
                
                // 미리보기 래퍼 생성
                const wrapper = document.createElement('div');
                wrapper.className = 'preview-wrapper';
                
                // 이미지 생성
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = previewClass;
                img.style.maxHeight = maxHeight;
                img.alt = '이미지 미리보기';
                
                if (circular) {
                    img.style.borderRadius = '50%';
                    img.style.objectFit = 'cover';
                    img.style.width = maxHeight;
                    img.style.height = maxHeight;
                }
                
                wrapper.appendChild(img);
                
                // 파일명 표시
                if (showFileName) {
                    const fileName = document.createElement('div');
                    fileName.className = 'file-name mt-1 small text-muted';
                    fileName.textContent = file.name;
                    wrapper.appendChild(fileName);
                }
                
                // 제거 버튼
                if (showRemoveButton) {
                    const removeBtn = document.createElement('button');
                    removeBtn.type = 'button';
                    removeBtn.className = 'btn btn-sm btn-outline-danger mt-2';
                    removeBtn.innerHTML = '<i class="fas fa-times"></i> 제거';
                    
                    removeBtn.addEventListener('click', () => {
                        container.innerHTML = '';
                        if (typeof onRemove === 'function') {
                            onRemove();
                        }
                    });
                    
                    wrapper.appendChild(removeBtn);
                }
                
                container.appendChild(wrapper);
                resolve(img);
            };
            
            reader.onerror = () => {
                reject(new Error('이미지를 읽을 수 없습니다.'));
            };
            
            reader.readAsDataURL(file);
        });
    }
    
    /**
     * 업로드 초기화
     * @param {HTMLInputElement} input - 파일 입력
     * @param {HTMLElement} previewContainer - 미리보기 컨테이너
     * @param {HTMLElement} uploadArea - 업로드 영역
     * @private
     */
    function _resetUpload(input, previewContainer, uploadArea) {
        input.value = '';
        previewContainer.innerHTML = '';
        uploadArea.classList.remove('drag-over');
    }
    
    /**
     * 대표 이미지 업로드 초기화
     * @param {HTMLElement} container - 메인 컨테이너
     * @param {Object} config - 설정
     * @private
     */
    function _initMainImageUpload(container, config) {
        const mainHolder = container.querySelector('.main-image-holder');
        const mainInput = mainHolder.querySelector('input[type="file"]');
        
        if (!mainHolder || !mainInput) return null;
        
        // 클릭 이벤트
        mainHolder.addEventListener('click', () => {
            mainInput.click();
        });
        
        // 파일 선택 이벤트
        mainInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                _handleProductImageUpload(file, mainHolder, config, true, 0);
            }
        });
        
        // 드래그 앤 드롭
        if (config.dragDrop) {
            _setupProductDragAndDrop(mainHolder, mainInput, config, true, 0);
        }
        
        return {
            holder: mainHolder,
            input: mainInput,
            reset: () => _resetProductImageHolder(mainHolder, mainInput)
        };
    }
    
    /**
     * 추가 이미지들 업로드 초기화
     * @param {HTMLElement} container - 메인 컨테이너
     * @param {Object} config - 설정
     * @private
     */
    function _initAdditionalImageUploads(container, config) {
        const additionalHolders = container.querySelectorAll('.additional-image-holder');
        const uploads = [];
        
        additionalHolders.forEach((holder, index) => {
            const input = holder.querySelector('input[type="file"]');
            if (!input) return;
            
            // 클릭 이벤트
            holder.addEventListener('click', () => {
                input.click();
            });
            
            // 파일 선택 이벤트
            input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    _handleProductImageUpload(file, holder, config, false, index);
                }
            });
            
            // 드래그 앤 드롭
            if (config.dragDrop) {
                _setupProductDragAndDrop(holder, input, config, false, index);
            }
            
            uploads.push({
                holder,
                input,
                reset: () => _resetProductImageHolder(holder, input)
            });
        });
        
        return uploads;
    }
    
    /**
     * 상품 이미지 업로드 처리
     * @param {File} file - 업로드할 파일
     * @param {HTMLElement} holder - 이미지 홀더
     * @param {Object} config - 설정
     * @param {boolean} isMain - 대표 이미지 여부
     * @param {number} index - 이미지 인덱스
     * @private
     */
    function _handleProductImageUpload(file, holder, config, isMain, index) {
        // 파일 유효성 검사
        const validation = _validateFile(file, config);
        
        if (!validation.valid) {
            _showError(validation.error, config);
            return;
        }
        
        // 이미지 미리보기 생성
        const reader = new FileReader();
        reader.onload = (e) => {
            _displayProductImagePreview(e.target.result, holder, isMain, index);
            
            // 콜백 호출
            if (typeof config.onUpload === 'function') {
                config.onUpload(file, isMain, index);
            }
        };
        reader.onerror = () => {
            _showError('이미지를 불러올 수 없습니다.', config);
        };
        reader.readAsDataURL(file);
    }
    
    /**
     * 상품 이미지 미리보기 표시
     * @param {string} imageSrc - 이미지 소스
     * @param {HTMLElement} holder - 이미지 홀더
     * @param {boolean} isMain - 대표 이미지 여부
     * @param {number} index - 이미지 인덱스
     * @private
     */
    function _displayProductImagePreview(imageSrc, holder, isMain, index) {
        // 기존 내용 제거
        const placeholder = holder.querySelector('i');
        const existingImg = holder.querySelector('.preview-image');
        
        if (existingImg) existingImg.remove();
        if (placeholder) placeholder.style.display = 'none';
        
        // 새 이미지 생성
        const img = document.createElement('img');
        img.src = imageSrc;
        img.className = 'preview-image';
        img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; border-radius: inherit;';
        img.alt = isMain ? '대표 이미지 미리보기' : `추가 이미지 ${index + 1} 미리보기`;
        
        holder.appendChild(img);
        
        // 오버레이 버튼 추가
        if (!holder.querySelector('.image-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'image-overlay';
            
            const changeBtn = document.createElement('button');
            changeBtn.type = 'button';
            changeBtn.className = 'btn btn-outline-light';
            changeBtn.innerHTML = '<i class="fas fa-edit"></i>';
            changeBtn.title = '이미지 변경';
            changeBtn.onclick = (e) => {
                e.stopPropagation();
                const input = holder.querySelector('input[type="file"]');
                if (input) input.click();
            };
            
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'btn btn-outline-danger';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.title = '이미지 제거';
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                _removeProductImage(holder, isMain, index);
            };
            
            overlay.appendChild(changeBtn);
            overlay.appendChild(removeBtn);
            holder.appendChild(overlay);
        }
        
        // 상태 클래스 추가
        holder.classList.add('has-image');
        holder.style.position = 'relative';
    }
    
    /**
     * 상품 이미지 제거
     * @param {HTMLElement} holder - 이미지 홀더
     * @param {boolean} isMain - 대표 이미지 여부
     * @param {number} index - 이미지 인덱스
     * @private
     */
    function _removeProductImage(holder, isMain, index) {
        // 파일 입력 초기화
        const input = holder.querySelector('input[type="file"]');
        if (input) input.value = '';
        
        // 미리보기 이미지 제거
        const img = holder.querySelector('.preview-image');
        const overlay = holder.querySelector('.image-overlay');
        const placeholder = holder.querySelector('i');
        
        if (img) img.remove();
        if (overlay) overlay.remove();
        if (placeholder) placeholder.style.display = 'block';
        
        // 상태 클래스 제거
        holder.classList.remove('has-image');
        
        // 콜백 호출
        const container = holder.closest('.product-image-upload');
        const config = container._config || {};
        if (typeof config.onRemove === 'function') {
            config.onRemove(isMain, index);
        }
    }
    
    /**
     * 상품 이미지 드래그 앤 드롭 설정
     * @param {HTMLElement} holder - 이미지 홀더
     * @param {HTMLInputElement} input - 파일 입력
     * @param {Object} config - 설정
     * @param {boolean} isMain - 대표 이미지 여부
     * @param {number} index - 이미지 인덱스
     * @private
     */
    function _setupProductDragAndDrop(holder, input, config, isMain, index) {
        // 기본 이벤트 방지
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            holder.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });
        
        // 드래그 하이라이트
        ['dragenter', 'dragover'].forEach(eventName => {
            holder.addEventListener(eventName, () => {
                holder.classList.add('drag-over');
            });
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            holder.addEventListener(eventName, () => {
                holder.classList.remove('drag-over');
            });
        });
        
        // 드롭 처리
        holder.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                _handleProductImageUpload(file, holder, config, isMain, index);
                
                // 파일 입력에도 설정
                const dt = new DataTransfer();
                dt.items.add(file);
                input.files = dt.files;
            }
        });
    }
    
    /**
     * 모든 상품 이미지 파일 가져오기
     * @param {HTMLElement} container - 메인 컨테이너
     * @returns {Object} 이미지 파일들
     * @private
     */
    function _getAllProductFiles(container) {
        const files = {
            main: null,
            additional: []
        };
        
        // 대표 이미지
        const mainInput = container.querySelector('.main-image-holder input[type="file"]');
        if (mainInput && mainInput.files[0]) {
            files.main = mainInput.files[0];
        }
        
        // 추가 이미지들
        const additionalInputs = container.querySelectorAll('.additional-image-holder input[type="file"]');
        additionalInputs.forEach(input => {
            if (input.files[0]) {
                files.additional.push(input.files[0]);
            }
        });
        
        return files;
    }
    
    /**
     * 상품 이미지 업로드 초기화
     * @param {HTMLElement} container - 메인 컨테이너
     * @private
     */
    function _resetProductUpload(container) {
        // 모든 이미지 홀더 초기화
        const holders = container.querySelectorAll('.main-image-holder, .additional-image-holder');
        holders.forEach(holder => {
            const input = holder.querySelector('input[type="file"]');
            _resetProductImageHolder(holder, input);
        });
    }
    
    /**
     * 상품 이미지 홀더 초기화
     * @param {HTMLElement} holder - 이미지 홀더
     * @param {HTMLInputElement} input - 파일 입력
     * @private
     */
    function _resetProductImageHolder(holder, input) {
        if (input) input.value = '';
        
        const img = holder.querySelector('.preview-image');
        const overlay = holder.querySelector('.image-overlay');
        const placeholder = holder.querySelector('i');
        
        if (img) img.remove();
        if (overlay) overlay.remove();
        if (placeholder) placeholder.style.display = 'block';
        
        holder.classList.remove('has-image', 'drag-over');
    }
    
    // ===== PUBLIC API =====
    
    /**
     * 기본 이미지 업로드 초기화 (단일 이미지)
     * @param {string} containerId - 컨테이너 ID
     * @param {Object} options - 설정 옵션
     * @returns {Object} 업로드 인스턴스
     * @public
     */
    function createBasicUpload(containerId, options = {}) {
        const config = _mergeSettings(options);
        const container = document.getElementById(containerId);
        
        if (!container) {
            console.error(`Container '${containerId}' not found`);
            return null;
        }
        
        // 인스턴스 ID 생성
        const instanceId = _generateInstanceId();
        
        // 기본 HTML 구조 생성
        if (!container.querySelector('.image-upload-basic')) {
            container.innerHTML = _createBasicHTML(config);
        }
        
        const input = container.querySelector('input[type="file"]');
        const uploadArea = container.querySelector('.upload-area');
        const previewContainer = container.querySelector('.preview-container');
        
        // 파일 선택 이벤트
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                _handleFileUpload(file, previewContainer, config);
            }
        });
        
        // 업로드 영역 클릭 이벤트
        uploadArea.addEventListener('click', () => {
            input.click();
        });
        
        // 드래그 앤 드롭 활성화
        if (config.dragDrop) {
            _setupDragAndDrop(uploadArea, input, previewContainer, config);
        }
        
        // 인스턴스 생성
        const instance = {
            id: instanceId,
            container,
            input,
            reset: () => _resetUpload(input, previewContainer, uploadArea),
            getFile: () => input.files[0] || null,
            destroy: () => uploadInstances.delete(instanceId)
        };
        
        // 인스턴스 저장
        uploadInstances.set(instanceId, instance);
        
        return instance;
    }
    
    /**
     * 프로필 이미지 업로드 (원형 미리보기)
     * @param {string} containerId - 컨테이너 ID
     * @param {Object} options - 설정 옵션
     * @returns {Object} 업로드 인스턴스
     * @public
     */
    function createProfileUpload(containerId, options = {}) {
        const defaults = {
            maxSize: 2 * 1024 * 1024, // 2MB
            allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
            previewSize: '150px',
            circular: true,
            dragDrop: true
        };
        
        const config = _mergeSettings(options, defaults);
        
        return createBasicUpload(containerId, {
            ...config,
            previewClass: 'profile-image-preview',
            customTemplate: 'profile'
        });
    }
    
    /**
     * 다중 이미지 업로드 (쇼핑몰 스타일)
     * @param {string} containerId - 컨테이너 ID
     * @param {Object} options - 설정 옵션
     * @returns {Object} 업로드 인스턴스
     * @public
     */
    function createProductUpload(containerId, options = {}) {
        const defaults = {
            maxFiles: 5,
            mainImageRequired: true,
            additionalImages: 4,
            maxSize: 5 * 1024 * 1024,
            allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
            dragDrop: true,
            overlayButtons: true
        };
        
        const config = _mergeSettings(options, defaults);
        const container = document.getElementById(containerId);
        
        if (!container) {
            console.error(`Container '${containerId}' not found`);
            return null;
        }
        
        // 인스턴스 ID 생성
        const instanceId = _generateInstanceId();
        
        // 쇼핑몰 스타일 HTML 생성
        container.innerHTML = _createProductHTML(config);
        
        // 대표 이미지 초기화
        const mainUpload = _initMainImageUpload(container, config);
        
        // 추가 이미지들 초기화
        const additionalUploads = _initAdditionalImageUploads(container, config);
        
        // 인스턴스 생성
        const instance = {
            id: instanceId,
            container,
            mainUpload,
            additionalUploads,
            getAllFiles: () => _getAllProductFiles(container),
            reset: () => _resetProductUpload(container),
            destroy: () => uploadInstances.delete(instanceId)
        };
        
        // 인스턴스 저장
        uploadInstances.set(instanceId, instance);
        
        return instance;
    }
    
    /**
     * 파일 유효성 검사 (외부 사용용)
     * @param {File} file - 검사할 파일
     * @param {Object} options - 검사 옵션
     * @returns {Object} 검사 결과
     * @public
     */
    function validateFile(file, options = {}) {
        const config = _mergeSettings(options);
        return _validateFile(file, config);
    }
    
    /**
     * 이미지 미리보기 생성 (외부 사용용)
     * @param {File} file - 이미지 파일
     * @param {HTMLElement} container - 미리보기 컨테이너
     * @param {Object} options - 미리보기 옵션
     * @returns {Promise} 미리보기 생성 프로미스
     * @public
     */
    function createPreview(file, container, options = {}) {
        return _createPreview(file, container, options);
    }
    
    /**
     * 모든 업로드 인스턴스 정리
     * @public
     */
    function cleanup() {
        uploadInstances.forEach(instance => {
            if (typeof instance.destroy === 'function') {
                instance.destroy();
            }
        });
        uploadInstances.clear();
    }
    
    /**
     * 활성 인스턴스 수 반환
     * @returns {number} 활성 인스턴스 수
     * @public
     */
    function getActiveInstanceCount() {
        return uploadInstances.size;
    }
    
    // PUBLIC API 반환
    return {
        // 주요 메서드
        createBasicUpload,
        createProfileUpload,
        createProductUpload,
        
        // 유틸리티 메서드
        validateFile,
        createPreview,
        
        // 관리 메서드
        cleanup,
        getActiveInstanceCount
    };
    
})();

// 전역 객체로 설정 (기존 코드 호환성)
window.ImageUploadUtils = ImageUploadUtils;

// ES6 모듈로도 내보내기 (미래 호환성)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageUploadUtils;
} 