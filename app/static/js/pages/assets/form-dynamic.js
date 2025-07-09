/**
 * Asset Form Dynamic Fields Management
 * 자산 등록 폼의 동적 필드 관리
 * 
 * @author Asset Management System
 * @version 1.0.0
 * @since 2025-06-23
 */

class AssetFormDynamic {
    constructor() {
        this.selectedSoftware = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.bindSoftwareEvents();
        this.initCustomFields();
        this.initBarcodeQR();
        this.initFileAttachments();
        this.initDepreciationCalculation();
        this.initAIFeatures();
        this.initializeFormState();
    }

    bindEvents() {
        // 자산 유형 변경 이벤트
        const assetCategorySelect = document.getElementById('assetCategory');
        if (assetCategorySelect) {
            assetCategorySelect.addEventListener('change', (e) => {
                this.handleAssetTypeChange(e.target.value);
                this.updateCategoryId(e.target);
            });
        }
    }

    /**
     * 자산 유형 변경 처리
     * @param {string} assetType - 선택된 자산 유형
     */
    handleAssetTypeChange(assetType) {
        // 모든 동적 필드 숨기기
        this.hideAllDynamicFields();
        
        // 동적 필드 컨테이너 표시/숨김
        const dynamicContainer = document.getElementById('dynamicFieldsContainer');
        const softwareContainer = document.getElementById('softwareManagementContainer');
        
        if (assetType) {
            // 동적 필드 컨테이너 표시
            dynamicContainer.classList.remove('d-none');
            
            // 선택된 유형에 해당하는 필드 표시
            const fieldsContainer = document.getElementById(`${assetType}_fields`);
            if (fieldsContainer) {
                fieldsContainer.classList.remove('d-none');
            }
            
            // IT 기기인 경우 소프트웨어 관리 표시
            if (assetType === 'IT_EQUIPMENT') {
                softwareContainer.classList.remove('d-none');
            } else {
                softwareContainer.classList.add('d-none');
            }
            
            // 필드 애니메이션
            this.animateFieldsIn(fieldsContainer);
            
            // 사이드바 가이드 업데이트
            this.updateSidebarGuide(assetType);
        } else {
            // 모든 컨테이너 숨기기
            dynamicContainer.classList.add('d-none');
            softwareContainer.classList.add('d-none');
            
            // 사이드바 가이드 숨기기
            this.updateSidebarGuide(null);
        }
    }

    /**
     * 사이드바 가이드 업데이트
     * @param {string|null} assetType - 선택된 자산 유형
     */
    updateSidebarGuide(assetType) {
        const categoryGuide = document.getElementById('categoryGuide');
        const noGuideMessage = document.getElementById('noGuideMessage');
        const allGuides = document.querySelectorAll('.category-guide');
        
        if (!categoryGuide || !noGuideMessage) return;
        
        // 모든 가이드 숨기기
        allGuides.forEach(guide => {
            guide.classList.add('d-none');
        });
        
        if (assetType) {
            // 선택된 유형의 가이드 표시
            const selectedGuide = document.getElementById(`guide-${assetType}`);
            if (selectedGuide) {
                categoryGuide.classList.remove('d-none');
                noGuideMessage.classList.add('d-none');
                selectedGuide.classList.remove('d-none');
            } else {
                categoryGuide.classList.add('d-none');
                noGuideMessage.classList.remove('d-none');
            }
        } else {
            // 기본 메시지 표시
            categoryGuide.classList.add('d-none');
            noGuideMessage.classList.remove('d-none');
        }
    }

    /**
     * 모든 동적 필드 숨기기
     */
    hideAllDynamicFields() {
        const dynamicFields = document.querySelectorAll('.dynamic-fields');
        dynamicFields.forEach(field => {
            field.classList.add('d-none');
        });
    }

    /**
     * 카테고리 ID 업데이트 (기존 시스템 호환성)
     * @param {HTMLElement} selectElement - 자산 유형 선택 요소
     */
    updateCategoryId(selectElement) {
        const categoryIdField = document.getElementById('categoryId');
        const selectedOption = selectElement.selectedOptions[0];
        
        if (selectedOption && categoryIdField) {
            const categoryIds = selectedOption.getAttribute('data-category-ids');
            if (categoryIds) {
                // 첫 번째 카테고리 ID 사용 (기본값)
                const firstCategoryId = categoryIds.split(',')[0];
                categoryIdField.value = firstCategoryId;
            }
        }
    }

    /**
     * 필드 애니메이션 효과
     * @param {HTMLElement} container - 애니메이션을 적용할 컨테이너
     */
    animateFieldsIn(container) {
        if (container) {
            container.style.opacity = '0';
            container.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                container.style.transition = 'all 0.3s ease-in-out';
                container.style.opacity = '1';
                container.style.transform = 'translateY(0)';
            }, 50);
        }
    }

    /**
     * 소프트웨어 관리 이벤트 바인딩
     */
    bindSoftwareEvents() {
        // 소프트웨어 추가 버튼
        const addSoftwareBtn = document.getElementById('addSoftwareBtn');
        if (addSoftwareBtn) {
            addSoftwareBtn.addEventListener('click', () => {
                this.showSoftwareSearch();
            });
        }

        // 소프트웨어 검색 (디바운싱 적용)
        const softwareSearch = document.getElementById('softwareSearch');
        if (softwareSearch) {
            let searchTimeout;
            softwareSearch.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchSoftware(e.target.value);
                }, 300); // 300ms 디바운싱
            });
            
            // 엔터키 즉시 검색
            softwareSearch.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    clearTimeout(searchTimeout);
                    this.searchSoftware(e.target.value);
                }
            });
        }

        // 선택 버튼
        const selectBtn = document.getElementById('selectSoftwareBtn');
        if (selectBtn) {
            selectBtn.addEventListener('click', () => {
                this.selectSoftware();
            });
        }

        // 취소 버튼
        const cancelBtn = document.getElementById('cancelSoftwareBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.hideSoftwareSearch();
            });
        }

        // 카테고리 필터
        const categoryFilter = document.getElementById('softwareCategoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                const searchInput = document.getElementById('softwareSearch');
                if (searchInput && searchInput.value.trim()) {
                    this.searchSoftware(searchInput.value, e.target.value);
                } else {
                    this.loadPopularSoftware(e.target.value);
                }
            });
        }

        // 초기 인기 소프트웨어 로드
        this.loadSoftwareCategories();
    }

    /**
     * 소프트웨어 검색 UI 표시
     */
    showSoftwareSearch() {
        const searchContainer = document.getElementById('softwareSearchContainer');
        if (searchContainer) {
            searchContainer.classList.remove('d-none');
            document.getElementById('softwareSearch').focus();
        }
    }

    /**
     * 소프트웨어 검색 UI 숨김
     */
    hideSoftwareSearch() {
        const searchContainer = document.getElementById('softwareSearchContainer');
        const searchInput = document.getElementById('softwareSearch');
        const resultsContainer = document.getElementById('softwareSearchResults');
        
        if (searchContainer) {
            searchContainer.classList.add('d-none');
        }
        if (searchInput) {
            searchInput.value = '';
        }
        if (resultsContainer) {
            resultsContainer.innerHTML = '';
            resultsContainer.classList.remove('show');
        }
    }

    /**
     * 소프트웨어 검색 실행
     * @param {string} query - 검색어
     * @param {string} category - 카테고리 필터
     */
    async searchSoftware(query, category = '') {
        if (query.length < 2) {
            this.clearSearchResults();
            if (query.length === 0) {
                this.loadPopularSoftware(category);
            }
            return;
        }

        try {
            // 로딩 표시
            this.showSearchLoading();
            
            let url = `/api/software/search?q=${encodeURIComponent(query)}`;
            if (category) {
                url += `&category=${encodeURIComponent(category)}`;
            }
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success) {
                this.displaySearchResults(data.software);
            } else {
                this.displayNoResults(data.message);
            }
        } catch (error) {
            console.error('소프트웨어 검색 오류:', error);
            this.displayError();
        }
    }

    /**
     * 인기 소프트웨어 로드
     * @param {string} category - 카테고리 필터
     */
    async loadPopularSoftware(category = '') {
        try {
            let url = `/api/software/popular?limit=8`;
            if (category) {
                url += `&category=${encodeURIComponent(category)}`;
            }
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success) {
                this.displayPopularSoftware(data.software);
            }
        } catch (error) {
            console.error('인기 소프트웨어 로드 오류:', error);
        }
    }

    /**
     * 소프트웨어 카테고리 로드
     */
    async loadSoftwareCategories() {
        try {
            const response = await fetch('/api/software/categories');
            const data = await response.json();
            
            if (data.success) {
                this.displaySoftwareCategories(data.categories);
            }
        } catch (error) {
            console.error('카테고리 로드 오류:', error);
        }
    }

    /**
     * 검색 결과 표시
     * @param {Array} software - 소프트웨어 목록
     */
    displaySearchResults(software) {
        const resultsContainer = document.getElementById('softwareSearchResults');
        
        if (software.length === 0) {
            this.displayNoResults();
            return;
        }

        const html = software.map(sw => `
            <a href="#" class="dropdown-item software-item" data-id="${sw.id}" data-name="${sw.name}" data-version="${sw.version || ''}" data-license-type="${sw.license_type || ''}" data-developer="${sw.developer || ''}" data-category="${sw.category || ''}">
                <div class="d-flex justify-content-between align-items-center py-2">
                    <div class="flex-grow-1">
                        <div class="d-flex align-items-center">
                            <strong>${sw.name}</strong>
                            ${sw.version ? `<small class="text-muted ms-2">v${sw.version}</small>` : ''}
                            ${sw.is_popular ? '<i class="fas fa-star text-warning ms-2" title="인기 소프트웨어"></i>' : ''}
                        </div>
                        <div class="text-muted small">
                            ${sw.developer ? `${sw.developer} | ` : ''}${this.getCategoryName(sw.category)}
                        </div>
                        ${sw.description ? `<div class="text-muted small">${sw.description}</div>` : ''}
                    </div>
                    <div class="text-end">
                        <small class="badge bg-secondary">${this.getLicenseTypeName(sw.license_type)}</small>
                    </div>
                </div>
            </a>
        `).join('');

        resultsContainer.innerHTML = html;
        resultsContainer.classList.add('show');

        // 클릭 이벤트 바인딩
        resultsContainer.querySelectorAll('.software-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectSoftwareFromList(item);
            });
        });
    }

    /**
     * 인기 소프트웨어 표시
     * @param {Array} software - 소프트웨어 목록
     */
    displayPopularSoftware(software) {
        const resultsContainer = document.getElementById('softwareSearchResults');
        
        if (software.length === 0) {
            resultsContainer.innerHTML = `
                <div class="dropdown-item-text text-center text-muted">
                    <i class="fas fa-info-circle me-2"></i>해당 카테고리에 인기 소프트웨어가 없습니다.
                </div>
            `;
            resultsContainer.classList.add('show');
            return;
        }

        const html = `
            <div class="dropdown-header">
                <i class="fas fa-star text-warning me-2"></i>인기 소프트웨어
            </div>
            ${software.map(sw => `
                <a href="#" class="dropdown-item software-item" data-id="${sw.id}" data-name="${sw.name}" data-version="${sw.version || ''}" data-license-type="${sw.license_type || ''}" data-developer="${sw.developer || ''}" data-category="${sw.category || ''}">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>${sw.name}</strong>
                            ${sw.version ? `<small class="text-muted ms-2">v${sw.version}</small>` : ''}
                            <i class="fas fa-star text-warning ms-2"></i>
                        </div>
                        <small class="badge bg-secondary">${this.getLicenseTypeName(sw.license_type)}</small>
                    </div>
                </a>
            `).join('')}
        `;

        resultsContainer.innerHTML = html;
        resultsContainer.classList.add('show');

        // 클릭 이벤트 바인딩
        resultsContainer.querySelectorAll('.software-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectSoftwareFromList(item);
            });
        });
    }

    /**
     * 소프트웨어 카테고리 표시
     * @param {Array} categories - 카테고리 목록
     */
    displaySoftwareCategories(categories) {
        const categoryFilter = document.getElementById('softwareCategoryFilter');
        if (!categoryFilter) return;

        const html = `
            <option value="">전체 카테고리</option>
            ${categories.map(cat => `
                <option value="${cat.id}">${cat.name}</option>
            `).join('')}
        `;

        categoryFilter.innerHTML = html;
    }

    /**
     * 검색 로딩 표시
     */
    showSearchLoading() {
        const resultsContainer = document.getElementById('softwareSearchResults');
        resultsContainer.innerHTML = `
            <div class="dropdown-item-text text-center text-muted">
                <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                검색 중...
            </div>
        `;
        resultsContainer.classList.add('show');
    }

    /**
     * 검색 결과 없음 표시
     * @param {string} message - 표시할 메시지
     */
    displayNoResults(message = '검색 결과가 없습니다.') {
        const resultsContainer = document.getElementById('softwareSearchResults');
        resultsContainer.innerHTML = `
            <div class="dropdown-item-text text-center text-muted">
                <i class="fas fa-search me-2"></i>${message}
            </div>
        `;
        resultsContainer.classList.add('show');
    }

    /**
     * 검색 오류 표시
     */
    displayError() {
        const resultsContainer = document.getElementById('softwareSearchResults');
        resultsContainer.innerHTML = `
            <div class="dropdown-item-text text-center text-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>검색 중 오류가 발생했습니다.
            </div>
        `;
        resultsContainer.classList.add('show');
    }

    /**
     * 검색 결과 지우기
     */
    clearSearchResults() {
        const resultsContainer = document.getElementById('softwareSearchResults');
        resultsContainer.innerHTML = '';
        resultsContainer.classList.remove('show');
    }

    /**
     * 목록에서 소프트웨어 선택
     * @param {HTMLElement} item - 선택된 소프트웨어 아이템
     */
    selectSoftwareFromList(item) {
        const softwareData = {
            id: item.getAttribute('data-id'),
            name: item.getAttribute('data-name'),
            version: item.getAttribute('data-version'),
            license_type: item.getAttribute('data-license-type')
        };

        // 중복 체크
        if (this.selectedSoftware.find(sw => sw.id === softwareData.id)) {
            this.showToast('이미 추가된 소프트웨어입니다.', 'warning');
            return;
        }

        this.selectedSoftware.push(softwareData);
        this.updateSoftwareDisplay();
        this.hideSoftwareSearch();
        this.showToast('소프트웨어가 추가되었습니다.', 'success');
    }

    /**
     * 선택된 소프트웨어 표시 업데이트
     */
    updateSoftwareDisplay() {
        const noSoftwareMessage = document.getElementById('noSoftwareMessage');
        const softwareList = document.getElementById('softwareList');
        const hiddenInput = document.getElementById('selectedSoftwareIds');

        if (this.selectedSoftware.length === 0) {
            noSoftwareMessage.classList.remove('d-none');
            softwareList.innerHTML = '';
        } else {
            noSoftwareMessage.classList.add('d-none');
            
            const html = this.selectedSoftware.map(sw => `
                <div class="col-md-6">
                    <div class="card border-primary">
                        <div class="card-body py-2">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="card-title mb-1">${sw.name}</h6>
                                    <div class="text-muted small">
                                        ${sw.version ? `버전: ${sw.version}` : ''}
                                        ${sw.license_type ? ` | 라이선스: ${sw.license_type}` : ''}
                                    </div>
                                </div>
                                <button type="button" class="btn btn-sm btn-outline-danger" onclick="assetFormDynamic.removeSoftware('${sw.id}')">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');

            softwareList.innerHTML = html;
        }

        // 숨겨진 입력 필드 업데이트
        hiddenInput.value = this.selectedSoftware.map(sw => sw.id).join(',');
    }

    /**
     * 소프트웨어 제거
     * @param {string} softwareId - 제거할 소프트웨어 ID
     */
    removeSoftware(softwareId) {
        this.selectedSoftware = this.selectedSoftware.filter(sw => sw.id !== softwareId);
        this.updateSoftwareDisplay();
        this.showToast('소프트웨어가 제거되었습니다.', 'info');
    }

    /**
     * 토스트 메시지 표시
     * @param {string} message - 메시지
     * @param {string} type - 타입 (success, warning, info, danger)
     */
    showToast(message, type = 'info') {
        // 기존 토스트 제거
        const existingToast = document.querySelector('.toast-message');
        if (existingToast) {
            existingToast.remove();
        }

        // 새 토스트 생성
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} toast-message position-fixed`;
        toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        toast.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-${this.getToastIcon(type)} me-2"></i>
                ${message}
                <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        `;

        document.body.appendChild(toast);

        // 3초 후 자동 제거
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 3000);
    }

    /**
     * 토스트 아이콘 반환
     * @param {string} type - 토스트 타입
     * @returns {string} - 아이콘 클래스
     */
    getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle',
            danger: 'times-circle'
        };
        return icons[type] || 'info-circle';
    }

    /**
     * 카테고리명 반환
     * @param {string} category - 카테고리 ID
     * @returns {string} - 카테고리명
     */
    getCategoryName(category) {
        const categoryNames = {
            'operating_system': '운영체제',
            'office_suite': '오피스 제품군',
            'development_tool': '개발 도구',
            'design_software': '디자인 소프트웨어',
            'security_software': '보안 소프트웨어',
            'database': '데이터베이스',
            'utility': '유틸리티',
            'game': '게임'
        };
        return categoryNames[category] || category;
    }

    /**
     * 라이선스 타입명 반환
     * @param {string} licenseType - 라이선스 타입
     * @returns {string} - 라이선스 타입명
     */
    getLicenseTypeName(licenseType) {
        const licenseNames = {
            'commercial': '상용',
            'free': '무료',
            'subscription': '구독',
            'perpetual': '영구',
            'freemium': '프리미엄',
            'open_source': '오픈소스',
            'trial': '체험판'
        };
        return licenseNames[licenseType] || licenseType;
    }

    /**
     * 폼 초기 상태 설정
     */
    initializeFormState() {
        // 기존 값이 있는 경우 동적 필드 표시
        const assetCategorySelect = document.getElementById('assetCategory');
        if (assetCategorySelect && assetCategorySelect.value) {
            this.handleAssetTypeChange(assetCategorySelect.value);
        }
    }

    /**
     * 사용자 정의 필드 관리
     */
    initCustomFields() {
        const addCustomFieldBtn = document.getElementById('addCustomFieldBtn');
        if (addCustomFieldBtn) {
            addCustomFieldBtn.addEventListener('click', () => {
                this.addCustomField();
            });
        }
    }

    addCustomField() {
        const container = document.getElementById('customFieldsContainer');
        const fieldId = 'custom-field-' + Date.now();
        
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'row g-3 mb-3 custom-field-row';
        fieldDiv.id = fieldId;
        
        fieldDiv.innerHTML = `
            <div class="col-md-4">
                <label class="form-label">필드명</label>
                <input type="text" class="form-control custom-field-name" placeholder="예: 구매처, 담당자" required>
            </div>
            <div class="col-md-6">
                <label class="form-label">필드값</label>
                <input type="text" class="form-control custom-field-value" placeholder="값을 입력하세요" required>
            </div>
            <div class="col-md-2 d-flex align-items-end">
                <button type="button" class="btn btn-outline-danger btn-sm w-100" onclick="this.closest('.custom-field-row').remove()">
                    <i class="fas fa-trash me-1"></i>삭제
                </button>
            </div>
        `;
        
        container.appendChild(fieldDiv);
    }

    /**
     * 바코드/QR 코드 생성
     */
    initBarcodeQR() {
        const assetNameInput = document.getElementById('assetNumber');
        if (assetNameInput) {
            assetNameInput.addEventListener('input', this.debounce(() => {
                this.generateQRCode(assetNameInput.value);
            }, 500));
        }
    }

    generateQRCode(assetName) {
        const display = document.getElementById('barcodeQrDisplay');
        if (!display) return;

        if (!assetName || assetName.trim().length < 2) {
            display.innerHTML = '<span class="text-muted">자산명을 입력하면 QR 코드가 자동 생성됩니다.</span>';
            return;
        }

        const qrData = encodeURIComponent(assetName.trim());
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${qrData}`;
        
        display.innerHTML = `
            <div class="d-flex flex-column align-items-center">
                <img src="${qrCodeUrl}" alt="QR Code" class="mb-2" style="width: 100px; height: 100px;">
                <div class="badge bg-secondary">${assetName.trim()}</div>
            </div>
        `;
    }

    /**
     * 파일 첨부 관리
     */
    initFileAttachments() {
        // 대표 이미지 미리보기
        const assetImageInput = document.getElementById('assetImage');
        if (assetImageInput) {
            assetImageInput.addEventListener('change', (e) => {
                this.previewImage(e.target.files[0], 'assetImagePreview');
            });
        }

        // 문서 파일 미리보기
        const documentsInput = document.getElementById('documents');
        if (documentsInput) {
            documentsInput.addEventListener('change', (e) => {
                this.previewDocuments(e.target.files, 'documentsPreview');
            });
        }
    }

    previewImage(file, previewId) {
        const preview = document.getElementById(previewId);
        if (!preview) return;

        preview.innerHTML = '';

        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'img-thumbnail';
                img.style.maxWidth = '200px';
                img.style.maxHeight = '150px';
                preview.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    }

    previewDocuments(files, previewId) {
        const preview = document.getElementById(previewId);
        if (!preview) return;

        preview.innerHTML = '';

        if (files.length === 0) {
            preview.innerHTML = '<small class="text-muted">선택된 문서가 없습니다.</small>';
            return;
        }

        const list = document.createElement('ul');
        list.className = 'list-unstyled mb-0';

        Array.from(files).forEach(file => {
            const item = document.createElement('li');
            item.className = 'mb-1';
            item.innerHTML = `
                <i class="fas fa-file me-2"></i>
                <span class="text-truncate">${file.name}</span>
                <small class="text-muted">(${this.formatFileSize(file.size)})</small>
            `;
            list.appendChild(item);
        });

        preview.appendChild(list);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 감가상각 계산
     */
    initDepreciationCalculation() {
        const calculateBtn = document.getElementById('calculateDepreciationBtn');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => {
                this.calculateDepreciation();
            });
        }

        // 자동 계산을 위한 이벤트 리스너
        const inputs = ['purchasePrice', 'usefulLife', 'depreciationStartDate', 'initialSalvageValue'];
        inputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', this.debounce(() => {
                    this.calculateDepreciation();
                }, 1000));
            }
        });
    }

    calculateDepreciation() {
        const purchasePrice = parseFloat(document.getElementById('purchasePrice')?.value || 0);
        const usefulLife = parseFloat(document.getElementById('usefulLife')?.value || 0);
        const initialSalvageValue = parseFloat(document.getElementById('initialSalvageValue')?.value || 0);
        const depreciationStartDate = document.getElementById('depreciationStartDate')?.value;
        const currentBookValueInput = document.getElementById('currentBookValue');

        if (!currentBookValueInput) return;

        if (!purchasePrice || !usefulLife || !depreciationStartDate) {
            currentBookValueInput.value = '계산을 위한 정보가 부족합니다';
            return;
        }

        const startDate = new Date(depreciationStartDate);
        const currentDate = new Date();
        const diffTime = Math.abs(currentDate - startDate);
        const elapsedYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);

        // 정액법 계산
        const depreciableBase = purchasePrice - initialSalvageValue;
        const annualDepreciation = depreciableBase / usefulLife;
        const accumulatedDepreciation = annualDepreciation * elapsedYears;
        
        let currentBookValue = purchasePrice - accumulatedDepreciation;
        
        // 잔존가액보다 낮아지지 않도록 조정
        if (currentBookValue < initialSalvageValue) {
            currentBookValue = initialSalvageValue;
        }

        currentBookValueInput.value = Math.round(currentBookValue).toLocaleString('ko-KR') + ' 원';
    }

    /**
     * 자산 설명 생성 (AI 기능)
     */
    initAIFeatures() {
        const generateBtn = document.getElementById('generateDescriptionBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                this.generateAssetDescription();
            });
        }
    }

    async generateAssetDescription() {
        const assetName = document.getElementById('assetName')?.value;
        const assetType = document.getElementById('assetCategory')?.value;
        const manufacturer = document.getElementById('manufacturer')?.value;
        const modelName = document.getElementById('modelName')?.value;
        const notesTextarea = document.getElementById('notes');
        const spinner = document.getElementById('descriptionSpinner');

        if (!assetName || !assetType) {
            this.showToast('자산명과 자산 유형은 필수 입력 항목입니다.', 'warning');
            return;
        }

        // 간단한 템플릿 기반 설명 생성 (실제 AI API 대신)
        const descriptions = {
            'IT_EQUIPMENT': `${assetName}은/는 ${manufacturer || '제조사'} ${modelName || '모델'}의 IT 기기입니다. 업무 효율성 향상을 위한 핵심 장비로 활용됩니다.`,
            'NETWORK_EQUIPMENT': `${assetName}은/는 네트워크 인프라의 핵심 장비로 안정적인 네트워크 연결을 제공합니다.`,
            'OFFICE_EQUIPMENT': `${assetName}은/는 사무 업무를 위한 필수 기기로 문서 처리 및 업무 지원에 활용됩니다.`,
            'SERVER_EQUIPMENT': `${assetName}은/는 서버 인프라의 핵심 구성요소로 시스템 안정성과 성능을 보장합니다.`,
            'MONITOR_EQUIPMENT': `${assetName}은/는 시각적 작업 환경을 제공하는 디스플레이 장비입니다.`,
            'OFFICE_FURNITURE': `${assetName}은/는 쾌적한 업무 환경 조성을 위한 사무용 가구입니다.`,
            'SOFTWARE': `${assetName}은/는 업무 생산성 향상을 위한 소프트웨어 라이선스입니다.`
        };

        if (spinner) spinner.classList.remove('d-none');
        
        // 시뮬레이션을 위한 지연
        setTimeout(() => {
            if (notesTextarea) {
                notesTextarea.value = descriptions[assetType] || `${assetName}에 대한 상세 정보를 입력하세요.`;
            }
            if (spinner) spinner.classList.add('d-none');
            this.showToast('자산 설명이 생성되었습니다.', 'success');
        }, 1500);
    }

    /**
     * 디바운싱 유틸리티
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// 전역 인스턴스 생성
let assetFormDynamic;

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    assetFormDynamic = new AssetFormDynamic();
});

// 전역 함수 (HTML에서 호출용)
window.assetFormDynamic = {
    removeSoftware: (id) => assetFormDynamic.removeSoftware(id)
}; 