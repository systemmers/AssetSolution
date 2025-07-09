/**
 * Loan Management 모듈
 * 자산 대여 관련 모든 기능을 통합 관리합니다.
 * 
 * 기능:
 * - 대여 신청 폼 관리
 * - 자산 검색 및 선택
 * - 사용자 정보 관리
 * - 대여 가능 여부 확인
 * - 대여 목록 관리
 * - 대여 승인/거부 처리
 */

import UIUtils from '../../../../common/ui-utils.js';
import FormUtils from '../../../../common/form-utils.js';
import ApiUtils from '../../../../common/api-utils.js';

class LoanManager {
    constructor() {
        this.config = {
            defaultLoanDays: 7,
            maxLoanDays: 30,
            autoSaveDelay: 2000,
            searchDebounceDelay: 300,
            validationDelay: 500
        };
        
        this.state = {
            isInitialized: false,
            currentUser: null,
            selectedAsset: null,
            isFormValid: false,
            searchResults: [],
            lastSearchQuery: '',
            autoSaveTimer: null,
            validationTimer: null
        };
        
        this.elements = {};
        this.cleanupFunctions = [];
        this.validators = [];
    }

    /**
     * 초기화
     */
    async initialize() {
        try {
            console.log('Loan 모듈 초기화 시작...');
            
            // DOM 요소 캐시
            this.cacheElements();
            
            // 폼 초기화
            this.initForm();
            
            // 사용자 선택 초기화
            this.initUserSelection();
            
            // 자산 검색 초기화
            this.initAssetSearch();
            
            // 대여 목록 초기화
            this.initLoanList();
            
            // 유효성 검사 초기화
            this.initValidation();
            
            // 이벤트 리스너 설정
            this.setupEventListeners();
            
            // 기본값 설정
            this.setDefaultValues();
            
            this.state.isInitialized = true;
            console.log('Loan 모듈 초기화 완료');
            
        } catch (error) {
            console.error('Loan 모듈 초기화 오류:', error);
            throw error;
        }
    }

    /**
     * DOM 요소 캐시
     */
    cacheElements() {
        this.elements = {
            // 폼 요소
            loanForm: document.getElementById('loanForm'),
            
            // 사용자 관련
            userSelect: document.getElementById('userSelect'),
            userInfoSection: document.getElementById('userInfoSection'),
            selectedUserName: document.getElementById('selectedUserName'),
            selectedUserPosition: document.getElementById('selectedUserPosition'),
            selectedUserEmail: document.getElementById('selectedUserEmail'),
            selectedUserPhone: document.getElementById('selectedUserPhone'),
            selectedUserAssets: document.getElementById('selectedUserAssets'),
            
            // 자산 관련
            assetSearchBtn: document.getElementById('assetSearchBtn'),
            assetSelect: document.getElementById('assetSelect'),
            selectedAssetName: document.getElementById('selectedAssetName'),
            assetSelectionModal: document.getElementById('assetSelectionModal'),
            assetSearchInput: document.getElementById('assetSearchInput'),
            assetSearchResults: document.getElementById('assetSearchResults'),
            selectAssetButtons: document.querySelectorAll('.select-asset'),
            
            // 대여 정보
            loanStartDate: document.getElementById('loanStartDate'),
            loanEndDate: document.getElementById('loanEndDate'),
            loanPurpose: document.getElementById('loanPurpose'),
            loanNotes: document.getElementById('loanNotes'),
            
            // 확인 요소
            checkAssetAvailability: document.getElementById('checkAssetAvailability'),
            availabilityResult: document.getElementById('availabilityResult'),
            
            // 버튼
            submitBtn: document.getElementById('submitLoanRequest'),
            cancelBtn: document.getElementById('cancelBtn'),
            resetBtn: document.getElementById('resetBtn'),
            
            // 대여 목록
            loanListTable: document.getElementById('loanListTable'),
            loanListBody: document.getElementById('loanListBody'),
            
            // 필터 및 검색
            statusFilter: document.getElementById('statusFilter'),
            dateFilter: document.getElementById('dateFilter'),
            searchFilter: document.getElementById('searchFilter')
        };
    }

    /**
     * 폼 초기화
     */
    initForm() {
        if (!this.elements.loanForm) return;
        
        // 폼 검증 클래스 추가
        this.elements.loanForm.classList.add('needs-validation');
        this.elements.loanForm.noValidate = true;
        
        // 자동 저장 설정
        this.setupAutoSave();
    }

    /**
     * 사용자 선택 초기화
     */
    initUserSelection() {
        if (!this.elements.userSelect) return;
        
        // 사용자 정보 매핑 (실제로는 API에서 가져옴)
        this.userInfoMap = {
            '2': {
                id: 2,
                name: '홍길동',
                position: '개발팀 / 팀장',
                email: 'hong@example.com',
                phone: '010-1234-5678',
                department: '개발팀',
                currentAssets: ['노트북 Dell XPS 13', '모니터 LG 27인치']
            },
            '3': {
                id: 3,
                name: '김철수',
                position: '인사팀 / 대리',
                email: 'kim@example.com',
                phone: '010-9876-5432',
                department: '인사팀',
                currentAssets: []
            },
            '4': {
                id: 4,
                name: '이영희',
                position: '마케팅팀 / 주임',
                email: 'lee@example.com',
                phone: '010-5555-1234',
                department: '마케팅팀',
                currentAssets: ['태블릿 iPad Pro']
            }
        };
        
        // 사용자 선택 이벤트
        const handleUserChange = () => {
            const userId = this.elements.userSelect.value;
            this.selectUser(userId);
        };
        
        this.elements.userSelect.addEventListener('change', handleUserChange);
        this.cleanupFunctions.push(() => {
            this.elements.userSelect.removeEventListener('change', handleUserChange);
        });
    }

    /**
     * 사용자 선택 처리
     * @param {string} userId - 사용자 ID
     */
    selectUser(userId) {
        if (userId && this.userInfoMap[userId]) {
            const userInfo = this.userInfoMap[userId];
            this.state.currentUser = userInfo;
            
            // 사용자 정보 표시
            this.displayUserInfo(userInfo);
            
            // 폼 유효성 검사 실행
            this.validateForm();
            
        } else {
            this.state.currentUser = null;
            this.hideUserInfo();
        }
    }

    /**
     * 사용자 정보 표시
     * @param {Object} userInfo - 사용자 정보
     */
    displayUserInfo(userInfo) {
        if (this.elements.userInfoSection) {
            this.elements.userInfoSection.style.display = 'block';
            
            // 각 필드 업데이트
            if (this.elements.selectedUserName) {
                this.elements.selectedUserName.textContent = userInfo.name;
            }
            if (this.elements.selectedUserPosition) {
                this.elements.selectedUserPosition.textContent = userInfo.position;
            }
            if (this.elements.selectedUserEmail) {
                this.elements.selectedUserEmail.textContent = userInfo.email;
            }
            if (this.elements.selectedUserPhone) {
                this.elements.selectedUserPhone.textContent = userInfo.phone;
            }
            if (this.elements.selectedUserAssets) {
                const assetsText = userInfo.currentAssets.length > 0 
                    ? userInfo.currentAssets.join(', ')
                    : '현재 대여 중인 자산 없음';
                this.elements.selectedUserAssets.textContent = assetsText;
            }
        }
    }

    /**
     * 사용자 정보 숨기기
     */
    hideUserInfo() {
        if (this.elements.userInfoSection) {
            this.elements.userInfoSection.style.display = 'none';
        }
    }

    /**
     * 자산 검색 초기화
     */
    initAssetSearch() {
        // 자산 검색 모달 열기
        if (this.elements.assetSearchBtn) {
            const handleOpenSearch = () => {
                this.openAssetSearchModal();
            };
            
            this.elements.assetSearchBtn.addEventListener('click', handleOpenSearch);
            this.cleanupFunctions.push(() => {
                this.elements.assetSearchBtn.removeEventListener('click', handleOpenSearch);
            });
        }
        
        // 자산 검색 입력
        if (this.elements.assetSearchInput) {
            let searchTimeout;
            
            const handleSearchInput = () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    const query = this.elements.assetSearchInput.value.trim();
                    this.searchAssets(query);
                }, this.config.searchDebounceDelay);
            };
            
            this.elements.assetSearchInput.addEventListener('input', handleSearchInput);
            this.cleanupFunctions.push(() => {
                clearTimeout(searchTimeout);
                this.elements.assetSearchInput.removeEventListener('input', handleSearchInput);
            });
        }
        
        // 자산 선택 버튼들
        this.setupAssetSelectionButtons();
    }

    /**
     * 자산 검색 모달 열기
     */
    openAssetSearchModal() {
        if (this.elements.assetSelectionModal) {
            UIUtils.showModal('assetSelectionModal');
            
            // 모달이 열리면 검색 입력 필드에 포커스
            setTimeout(() => {
                if (this.elements.assetSearchInput) {
                    this.elements.assetSearchInput.focus();
                }
            }, 300);
            
            // 초기 자산 목록 로드
            this.loadAvailableAssets();
        }
    }

    /**
     * 자산 검색
     * @param {string} query - 검색어
     */
    async searchAssets(query) {
        try {
            this.state.lastSearchQuery = query;
            
            const response = await ApiUtils.sendRequest({
                url: '/assets/api/assets/for-loan',
                method: 'GET',
                params: { 
                    search: query || '',
                    status: 'available'  // 대여 가능한 자산만
                }
            });
            
            if (response && response.data) {
                this.state.searchResults = response.data || [];
            } else {
                this.state.searchResults = [];
            }
            this.renderSearchResults();
            
        } catch (error) {
            console.error('자산 검색 오류:', error);
            this.showError('자산 검색 중 오류가 발생했습니다.');
        }
    }



    /**
     * 검색 결과 렌더링
     */
    renderSearchResults() {
        if (!this.elements.assetSearchResults) return;
        
        if (this.state.searchResults.length === 0) {
            this.elements.assetSearchResults.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-search fa-2x text-muted mb-2"></i>
                    <p class="text-muted">검색 결과가 없습니다.</p>
                </div>
            `;
            return;
        }
        
        const resultsHtml = this.state.searchResults.map(asset => `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card asset-search-result">
                    <img src="${asset.image || '/static/img/no-image.png'}" 
                         class="card-img-top" alt="${asset.name}" style="height: 150px; object-fit: cover;">
                    <div class="card-body">
                        <h6 class="card-title">${asset.name}</h6>
                        <p class="card-text small text-muted">${asset.code} | ${asset.category}</p>
                        <p class="card-text small">
                            <i class="fas fa-map-marker-alt"></i> ${asset.location}
                        </p>
                        <button type="button" class="btn btn-primary btn-sm w-100 select-asset" 
                                data-id="${asset.id}" 
                                data-name="${asset.name}"
                                data-code="${asset.code}"
                                data-category="${asset.category}"
                                data-location="${asset.location}"
                                data-image="${asset.image || ''}">
                            선택
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        this.elements.assetSearchResults.innerHTML = `<div class="row">${resultsHtml}</div>`;
        
        // 새로 생성된 선택 버튼에 이벤트 추가
        this.setupAssetSelectionButtons();
    }

    /**
     * 자산 선택 버튼 설정
     */
    setupAssetSelectionButtons() {
        const selectButtons = document.querySelectorAll('.select-asset');
        
        selectButtons.forEach(btn => {
            const handleSelect = () => {
                const assetData = {
                    id: btn.dataset.id,
                    name: btn.dataset.name,
                    code: btn.dataset.code,
                    category: btn.dataset.category,
                    location: btn.dataset.location,
                    image: btn.dataset.image
                };
                
                this.selectAsset(assetData);
                UIUtils.hideModal('assetSelectionModal');
            };
            
            // 기존 이벤트 리스너 제거 후 새로 추가
            btn.removeEventListener('click', handleSelect);
            btn.addEventListener('click', handleSelect);
        });
    }

    /**
     * 자산 선택 처리
     * @param {Object} assetData - 선택된 자산 데이터
     */
    selectAsset(assetData) {
        this.state.selectedAsset = assetData;
        
        // 자산 선택 필드 업데이트
        if (this.elements.assetSelect) {
            this.elements.assetSelect.value = assetData.id;
        }
        
        if (this.elements.selectedAssetName) {
            this.elements.selectedAssetName.textContent = `${assetData.name} (${assetData.code})`;
        }
        
        // 대여 가능 여부 자동 확인
        if (this.elements.checkAssetAvailability) {
            this.elements.checkAssetAvailability.checked = true;
            this.checkAssetAvailability(assetData.id);
        }
        
        // 폼 유효성 검사
        this.validateForm();
    }

    /**
     * 사용 가능한 자산 목록 로드
     */
    async loadAvailableAssets() {
        try {
            await this.searchAssets(''); // 빈 쿼리로 전체 목록 로드
        } catch (error) {
            console.error('자산 목록 로드 오류:', error);
        }
    }

    /**
     * 자산 대여 가능 여부 확인
     * @param {string} assetId - 자산 ID
     */
    async checkAssetAvailability(assetId) {
        try {
            const response = await ApiUtils.sendRequest({
                url: `/assets/api/assets/${assetId}/availability`,
                method: 'GET'
            });
            
            this.displayAvailabilityResult(response);
            
        } catch (error) {
            console.error('대여 가능 여부 확인 오류:', error);
            this.displayAvailabilityResult({ 
                available: false, 
                error: '확인 중 오류가 발생했습니다.' 
            });
        }
    }

    /**
     * 대여 가능 여부 결과 표시
     * @param {Object} result - 확인 결과
     */
    displayAvailabilityResult(result) {
        if (!this.elements.availabilityResult) return;
        
        if (result.available) {
            this.elements.availabilityResult.innerHTML = `
                <div class="alert alert-success small">
                    <i class="fas fa-check-circle"></i> 이 자산은 대여 가능합니다.
                </div>
            `;
        } else {
            const errorMsg = result.error || '현재 대여할 수 없습니다.';
            this.elements.availabilityResult.innerHTML = `
                <div class="alert alert-warning small">
                    <i class="fas fa-exclamation-triangle"></i> ${errorMsg}
                    ${result.next_available_date ? `<br>다음 대여 가능일: ${result.next_available_date}` : ''}
                </div>
            `;
        }
    }

    /**
     * 대여 목록 초기화
     */
    initLoanList() {
        if (this.elements.loanListTable) {
            this.loadLoanList();
            this.setupLoanListFilters();
        }
    }

    /**
     * 대여 목록 로드
     */
    async loadLoanList() {
        try {
            if (this.elements.loanListBody) {
                // 로딩 표시
                this.elements.loanListBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center py-4">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">로딩 중...</span>
                            </div>
                        </td>
                    </tr>
                `;
            }
            
            const response = await ApiUtils.sendRequest({
                url: '/operations/api/loans',
                method: 'GET'
            });
            
            if (response && response.data) {
                this.renderLoanList(response.data || []);
            } else {
                throw new Error('API 응답이 올바르지 않습니다.');
            }
            
        } catch (error) {
            console.error('대여 목록 로드 오류:', error);
            this.showError('대여 목록을 불러오는 중 오류가 발생했습니다.');
        }
    }



    /**
     * 대여 목록 렌더링
     * @param {Array} loans - 대여 목록
     */
    renderLoanList(loans) {
        if (!this.elements.loanListBody) return;
        
        if (loans.length === 0) {
            this.elements.loanListBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4 text-muted">
                        등록된 대여 기록이 없습니다.
                    </td>
                </tr>
            `;
            return;
        }
        
        const loansHtml = loans.map(loan => {
            const statusBadge = this.getStatusBadge(loan.status);
            const isOverdue = loan.status === 'overdue';
            
            return `
                <tr class="${isOverdue ? 'table-warning' : ''}">
                    <td>${loan.id}</td>
                    <td>${loan.asset_name}</td>
                    <td>${loan.user_name}</td>
                    <td>${loan.start_date}</td>
                    <td>${loan.end_date}</td>
                    <td>
                        ${statusBadge}
                        <div class="btn-group" role="group">
                            <button type="button" class="btn btn-sm btn-outline-primary" 
                                    onclick="viewLoanDetails(${loan.id})">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${loan.status === 'pending' ? `
                                <button type="button" class="btn btn-sm btn-outline-success" 
                                        onclick="approveLoan(${loan.id})">
                                    <i class="fas fa-check"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-outline-danger" 
                                        onclick="rejectLoan(${loan.id})">
                                    <i class="fas fa-times"></i>
                                </button>
                            ` : ''}
                            ${loan.status === 'active' ? `
                                <button type="button" class="btn btn-sm btn-outline-warning" 
                                        onclick="returnAsset(${loan.id})">
                                    <i class="fas fa-undo"></i>
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        this.elements.loanListBody.innerHTML = loansHtml;
    }

    /**
     * 상태 배지 생성
     * @param {string} status - 상태
     * @returns {string} 배지 HTML
     */
    getStatusBadge(status) {
        const badges = {
            pending: '<span class="badge bg-warning">승인 대기</span>',
            active: '<span class="badge bg-success">대여 중</span>',
            overdue: '<span class="badge bg-danger">연체</span>',
            returned: '<span class="badge bg-secondary">반납 완료</span>',
            cancelled: '<span class="badge bg-dark">취소됨</span>'
        };
        
        return badges[status] || '<span class="badge bg-light">알 수 없음</span>';
    }

    /**
     * 유효성 검사 초기화
     */
    initValidation() {
        // 실시간 유효성 검사
        const fields = [
            this.elements.userSelect,
            this.elements.assetSelect,
            this.elements.loanStartDate,
            this.elements.loanEndDate,
            this.elements.loanPurpose
        ];
        
        fields.forEach(field => {
            if (field) {
                const handleValidation = () => {
                    clearTimeout(this.state.validationTimer);
                    this.state.validationTimer = setTimeout(() => {
                        this.validateField(field);
                        this.validateForm();
                    }, this.config.validationDelay);
                };
                
                field.addEventListener('input', handleValidation);
                field.addEventListener('change', handleValidation);
                
                this.cleanupFunctions.push(() => {
                    clearTimeout(this.state.validationTimer);
                    field.removeEventListener('input', handleValidation);
                    field.removeEventListener('change', handleValidation);
                });
            }
        });
    }

    /**
     * 필드 유효성 검사
     * @param {Element} field - 검사할 필드
     */
    validateField(field) {
        let isValid = true;
        let errorMessage = '';
        
        // 필수 필드 검사
        if (field.hasAttribute('required') && !field.value.trim()) {
            isValid = false;
            errorMessage = '이 필드는 필수입니다.';
        }
        
        // 특정 필드별 검사
        if (field === this.elements.loanEndDate && this.elements.loanStartDate.value) {
            const startDate = new Date(this.elements.loanStartDate.value);
            const endDate = new Date(field.value);
            
            if (endDate <= startDate) {
                isValid = false;
                errorMessage = '종료일은 시작일보다 늦어야 합니다.';
            }
            
            const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            if (daysDiff > this.config.maxLoanDays) {
                isValid = false;
                errorMessage = `최대 대여 기간은 ${this.config.maxLoanDays}일입니다.`;
            }
        }
        
        // 시각적 피드백 적용
        if (isValid) {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
        } else {
            field.classList.remove('is-valid');
            field.classList.add('is-invalid');
        }
        
        // 오류 메시지 표시
        const feedbackElement = field.parentNode.querySelector('.invalid-feedback');
        if (feedbackElement) {
            feedbackElement.textContent = errorMessage;
        }
        
        return isValid;
    }

    /**
     * 전체 폼 유효성 검사
     */
    validateForm() {
        const requiredFields = [
            this.elements.userSelect,
            this.elements.assetSelect,
            this.elements.loanStartDate,
            this.elements.loanEndDate,
            this.elements.loanPurpose
        ];
        
        let isFormValid = true;
        
        requiredFields.forEach(field => {
            if (field && !this.validateField(field)) {
                isFormValid = false;
            }
        });
        
        // 추가 검사
        if (!this.state.currentUser) {
            isFormValid = false;
        }
        
        if (!this.state.selectedAsset) {
            isFormValid = false;
        }
        
        this.state.isFormValid = isFormValid;
        
        // 제출 버튼 상태 업데이트
        if (this.elements.submitBtn) {
            this.elements.submitBtn.disabled = !isFormValid;
        }
        
        return isFormValid;
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 폼 제출
        if (this.elements.loanForm) {
            const handleSubmit = (event) => {
                event.preventDefault();
                if (this.validateForm()) {
                    this.submitLoanRequest();
                }
            };
            
            this.elements.loanForm.addEventListener('submit', handleSubmit);
            this.cleanupFunctions.push(() => {
                this.elements.loanForm.removeEventListener('submit', handleSubmit);
            });
        }
        
        // 취소 버튼
        if (this.elements.cancelBtn) {
            const handleCancel = () => {
                if (confirm('작성 중인 내용이 삭제됩니다. 계속하시겠습니까?')) {
                    this.resetForm();
                    window.history.back();
                }
            };
            
            this.elements.cancelBtn.addEventListener('click', handleCancel);
            this.cleanupFunctions.push(() => {
                this.elements.cancelBtn.removeEventListener('click', handleCancel);
            });
        }
        
        // 초기화 버튼
        if (this.elements.resetBtn) {
            const handleReset = () => {
                if (confirm('모든 입력 내용이 초기화됩니다. 계속하시겠습니까?')) {
                    this.resetForm();
                }
            };
            
            this.elements.resetBtn.addEventListener('click', handleReset);
            this.cleanupFunctions.push(() => {
                this.elements.resetBtn.removeEventListener('click', handleReset);
            });
        }
        
        // 대여 가능 여부 확인 체크박스
        if (this.elements.checkAssetAvailability) {
            const handleAvailabilityCheck = () => {
                if (this.elements.checkAssetAvailability.checked && this.state.selectedAsset) {
                    this.checkAssetAvailability(this.state.selectedAsset.id);
                } else {
                    if (this.elements.availabilityResult) {
                        this.elements.availabilityResult.innerHTML = '';
                    }
                }
            };
            
            this.elements.checkAssetAvailability.addEventListener('change', handleAvailabilityCheck);
            this.cleanupFunctions.push(() => {
                this.elements.checkAssetAvailability.removeEventListener('change', handleAvailabilityCheck);
            });
        }
    }

    /**
     * 대여 목록 필터 설정
     */
    setupLoanListFilters() {
        // 상태 필터
        if (this.elements.statusFilter) {
            const handleStatusFilter = () => {
                this.applyFilters();
            };
            
            this.elements.statusFilter.addEventListener('change', handleStatusFilter);
            this.cleanupFunctions.push(() => {
                this.elements.statusFilter.removeEventListener('change', handleStatusFilter);
            });
        }
        
        // 날짜 필터
        if (this.elements.dateFilter) {
            const handleDateFilter = () => {
                this.applyFilters();
            };
            
            this.elements.dateFilter.addEventListener('change', handleDateFilter);
            this.cleanupFunctions.push(() => {
                this.elements.dateFilter.removeEventListener('change', handleDateFilter);
            });
        }
        
        // 검색 필터
        if (this.elements.searchFilter) {
            let searchTimeout;
            
            const handleSearchFilter = () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.applyFilters();
                }, this.config.searchDebounceDelay);
            };
            
            this.elements.searchFilter.addEventListener('input', handleSearchFilter);
            this.cleanupFunctions.push(() => {
                clearTimeout(searchTimeout);
                this.elements.searchFilter.removeEventListener('input', handleSearchFilter);
            });
        }
    }

    /**
     * 필터 적용
     */
    applyFilters() {
        // 실제 구현에서는 서버에 필터된 데이터 요청
        console.log('필터 적용:', {
            status: this.elements.statusFilter?.value,
            date: this.elements.dateFilter?.value,
            search: this.elements.searchFilter?.value
        });
        
        this.loadLoanList();
    }

    /**
     * 자동 저장 설정
     */
    setupAutoSave() {
        const saveableFields = [
            this.elements.loanPurpose,
            this.elements.loanNotes
        ];
        
        saveableFields.forEach(field => {
            if (field) {
                const handleAutoSave = () => {
                    clearTimeout(this.state.autoSaveTimer);
                    this.state.autoSaveTimer = setTimeout(() => {
                        this.autoSave();
                    }, this.config.autoSaveDelay);
                };
                
                field.addEventListener('input', handleAutoSave);
                this.cleanupFunctions.push(() => {
                    clearTimeout(this.state.autoSaveTimer);
                    field.removeEventListener('input', handleAutoSave);
                });
            }
        });
    }

    /**
     * 자동 저장
     */
    autoSave() {
        const formData = this.getFormData();
        
        // 로컬 스토리지에 임시 저장
        try {
            localStorage.setItem('loan_form_draft', JSON.stringify({
                ...formData,
                savedAt: new Date().toISOString()
            }));
            
            console.log('자동 저장 완료');
        } catch (error) {
            console.warn('자동 저장 실패:', error);
        }
    }

    /**
     * 폼 데이터 가져오기
     * @returns {Object} 폼 데이터
     */
    getFormData() {
        return {
            userId: this.elements.userSelect?.value || '',
            assetId: this.elements.assetSelect?.value || '',
            startDate: this.elements.loanStartDate?.value || '',
            endDate: this.elements.loanEndDate?.value || '',
            purpose: this.elements.loanPurpose?.value || '',
            notes: this.elements.loanNotes?.value || ''
        };
    }

    /**
     * 기본값 설정
     */
    setDefaultValues() {
        // 기본 대여 시작일: 오늘
        if (this.elements.loanStartDate) {
            const today = new Date().toISOString().split('T')[0];
            this.elements.loanStartDate.value = today;
            this.elements.loanStartDate.min = today; // 과거 날짜 선택 방지
        }
        
        // 기본 대여 종료일: 일주일 후
        if (this.elements.loanEndDate) {
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + this.config.defaultLoanDays);
            this.elements.loanEndDate.value = nextWeek.toISOString().split('T')[0];
        }
        
        // 저장된 초안 복원
        this.restoreDraft();
    }

    /**
     * 저장된 초안 복원
     */
    restoreDraft() {
        try {
            const draft = localStorage.getItem('loan_form_draft');
            if (draft) {
                const draftData = JSON.parse(draft);
                const savedAt = new Date(draftData.savedAt);
                const now = new Date();
                
                // 24시간 이내 저장된 초안만 복원
                if ((now - savedAt) < 24 * 60 * 60 * 1000) {
                    if (confirm('이전에 작성하던 내용이 있습니다. 복원하시겠습니까?')) {
                        this.setFormData(draftData);
                    }
                }
            }
        } catch (error) {
            console.warn('초안 복원 실패:', error);
        }
    }

    /**
     * 폼 데이터 설정
     * @param {Object} data - 설정할 데이터
     */
    setFormData(data) {
        if (data.userId && this.elements.userSelect) {
            this.elements.userSelect.value = data.userId;
            this.selectUser(data.userId);
        }
        
        if (data.startDate && this.elements.loanStartDate) {
            this.elements.loanStartDate.value = data.startDate;
        }
        
        if (data.endDate && this.elements.loanEndDate) {
            this.elements.loanEndDate.value = data.endDate;
        }
        
        if (data.purpose && this.elements.loanPurpose) {
            this.elements.loanPurpose.value = data.purpose;
        }
        
        if (data.notes && this.elements.loanNotes) {
            this.elements.loanNotes.value = data.notes;
        }
        
        // 유효성 검사 실행
        this.validateForm();
    }

    /**
     * 대여 신청 제출
     */
    async submitLoanRequest() {
        try {
            // 제출 버튼 비활성화
            if (this.elements.submitBtn) {
                this.elements.submitBtn.disabled = true;
                this.elements.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 처리 중...';
            }
            
            const formData = this.getFormData();
            
            const response = await ApiUtils.sendRequest({
                url: '/api/loans',
                method: 'POST',
                data: formData,
                mockResponse: true,
                mockData: { 
                    success: true, 
                    loanId: Date.now(),
                    message: '대여 신청이 성공적으로 제출되었습니다.'
                }
            });
            
            // 성공 처리
            UIUtils.showAlert(response.message || '대여 신청이 완료되었습니다.', 'success');
            
            // 저장된 초안 삭제
            localStorage.removeItem('loan_form_draft');
            
            // 폼 초기화
            this.resetForm();
            
            // 목록 새로고침
            if (this.elements.loanListTable) {
                this.loadLoanList();
            }
            
        } catch (error) {
            console.error('대여 신청 오류:', error);
            UIUtils.showAlert('대여 신청 중 오류가 발생했습니다.', 'danger');
        } finally {
            // 제출 버튼 복원
            if (this.elements.submitBtn) {
                this.elements.submitBtn.disabled = false;
                this.elements.submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> 신청하기';
            }
        }
    }

    /**
     * 폼 초기화
     */
    resetForm() {
        // 폼 리셋
        if (this.elements.loanForm) {
            this.elements.loanForm.reset();
        }
        
        // 상태 초기화
        this.state.currentUser = null;
        this.state.selectedAsset = null;
        this.state.isFormValid = false;
        
        // UI 초기화
        this.hideUserInfo();
        
        if (this.elements.selectedAssetName) {
            this.elements.selectedAssetName.textContent = '';
        }
        
        if (this.elements.availabilityResult) {
            this.elements.availabilityResult.innerHTML = '';
        }
        
        // 유효성 검사 클래스 제거
        const fields = this.elements.loanForm?.querySelectorAll('.form-control, .form-select');
        fields?.forEach(field => {
            field.classList.remove('is-valid', 'is-invalid');
        });
        
        // 기본값 다시 설정
        this.setDefaultValues();
        
        // 저장된 초안 삭제
        localStorage.removeItem('loan_form_draft');
    }

    /**
     * 오류 메시지 표시
     * @param {string} message - 오류 메시지
     */
    showError(message) {
        UIUtils.showAlert(message, 'danger', 5000);
    }

    /**
     * 설정 내보내기
     * @returns {Object} 현재 설정
     */
    exportSettings() {
        return {
            defaultLoanDays: this.config.defaultLoanDays,
            maxLoanDays: this.config.maxLoanDays,
            autoSaveEnabled: true
        };
    }

    /**
     * 설정 가져오기
     * @param {Object} settings - 가져올 설정
     */
    importSettings(settings) {
        if (settings.defaultLoanDays) {
            this.config.defaultLoanDays = settings.defaultLoanDays;
        }
        
        if (settings.maxLoanDays) {
            this.config.maxLoanDays = settings.maxLoanDays;
        }
    }

    /**
     * 정리
     */
    cleanup() {
        // 타이머 정리
        clearTimeout(this.state.autoSaveTimer);
        clearTimeout(this.state.validationTimer);
        
        // 이벤트 리스너 정리
        this.cleanupFunctions.forEach(fn => {
            if (typeof fn === 'function') fn();
        });
        this.cleanupFunctions = [];
        
        // 상태 초기화
        this.state.isInitialized = false;
        
        console.log('Loan 모듈 정리 완료');
    }
}

export default LoanManager; 