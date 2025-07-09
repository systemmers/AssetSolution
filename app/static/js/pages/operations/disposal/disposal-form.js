/**
 * 자산 폐기 신청 폼 관리 모듈
 * DisposalManager의 폼 관리 컴포넌트
 */

// 공통 모듈 가져오기
import ApiUtils from '../../../common/api-utils.js';

export default class DisposalFormManager {
    constructor() {
        this.selectedAsset = null;
        this.isInitialized = false;
    }

    /**
     * 초기화
     */
    async initialize() {
        try {
            console.log('DisposalFormManager 초기화 중...');
            
            // 현재 날짜 설정
            this.setTodayDate();
            
            // 이벤트 리스너 등록
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('DisposalFormManager 초기화 완료');
            
        } catch (error) {
            console.error('DisposalFormManager 초기화 오류:', error);
            throw error;
        }
    }

    /**
     * 현재 날짜 설정
     */
    setTodayDate() {
        const today = new Date().toISOString().split('T')[0];
        const requestDateElement = document.getElementById('requestDate');
        if (requestDateElement) {
            requestDateElement.value = today;
        }
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 검색 버튼
        const searchBtn = document.getElementById('searchBtn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.searchAssets());
        }

        // 초기화 버튼
        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetSearchForm());
        }

        // 폐기 사유 선택 시 기타 필드 표시 여부 처리
        const disposalReason = document.getElementById('disposalReason');
        if (disposalReason) {
            disposalReason.addEventListener('change', () => this.toggleOtherReasonField());
        }

        // 폐기 신청 폼 제출
        const disposalForm = document.getElementById('disposalForm');
        if (disposalForm) {
            disposalForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // 이미지 업로드 미리보기
        const assetImageUpload = document.getElementById('assetImageUpload');
        if (assetImageUpload) {
            assetImageUpload.addEventListener('change', (e) => this.previewImage(e));
        }

        // 증빙 서류 첨부 처리
        const supportingDocument = document.getElementById('supportingDocument');
        if (supportingDocument) {
            supportingDocument.addEventListener('change', (e) => this.handleDocumentUpload(e));
        }

        // 폐기 확인 모달에서 확인 버튼
        const confirmDisposalBtn = document.getElementById('confirmDisposalBtn');
        if (confirmDisposalBtn) {
            confirmDisposalBtn.addEventListener('click', () => this.processDisposal());
        }

        // 폐기 완료 후 다른 자산 폐기 신청하기 버튼
        const disposalAnotherBtn = document.getElementById('disposalAnotherBtn');
        if (disposalAnotherBtn) {
            disposalAnotherBtn.addEventListener('click', () => this.resetDisposalForm());
        }
    }

    /**
     * 검색 폼 초기화
     */
    resetSearchForm() {
        const assetSearchForm = document.getElementById('assetSearchForm');
        if (assetSearchForm) {
            assetSearchForm.reset();
        }
    }

    /**
     * 폼 제출 처리
     */
    handleFormSubmit(e) {
        e.preventDefault();
        if (this.validateDisposalForm()) {
            this.openConfirmModal();
        }
    }

    /**
     * 기타 폐기 사유 필드 표시 여부 토글
     */
    toggleOtherReasonField() {
        const disposalReason = document.getElementById('disposalReason').value;
        const otherReasonContainer = document.getElementById('otherReasonContainer');
        const otherReason = document.getElementById('otherReason');
        
        if (disposalReason === '기타') {
            otherReasonContainer.style.display = 'block';
            otherReason.setAttribute('required', 'required');
        } else {
            otherReasonContainer.style.display = 'none';
            otherReason.removeAttribute('required');
        }
    }

    /**
     * 이미지 미리보기
     */
    previewImage(e) {
        const input = e.target;
        const targetId = 'assetImage';
        
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imgContainer = document.getElementById(targetId);
                if (imgContainer) {
                    imgContainer.innerHTML = `<img src="${e.target.result}" class="img-fluid rounded" style="max-height: 200px;">`;
                }
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

    /**
     * 증빙 서류 업로드 처리
     */
    handleDocumentUpload(e) {
        const input = e.target;
        if (input.files && input.files.length > 0) {
            const documentList = document.getElementById('documentList');
            let html = '<ul class="list-group">';
            
            for (let i = 0; i < input.files.length; i++) {
                const file = input.files[i];
                const fileSize = (file.size / 1024 / 1024).toFixed(2); // MB 단위
                
                // 파일 타입에 따른 아이콘 지정
                let fileIcon = 'fa-file';
                if (file.type.includes('pdf')) fileIcon = 'fa-file-pdf';
                else if (file.type.includes('word')) fileIcon = 'fa-file-word';
                else if (file.type.includes('image')) fileIcon = 'fa-file-image';
                
                html += `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <i class="fas ${fileIcon} me-2 text-danger"></i>
                            ${file.name}
                        </div>
                        <span class="badge rounded-pill bg-secondary">${fileSize} MB</span>
                    </li>
                `;
            }
            
            html += '</ul>';
            documentList.innerHTML = html;
        } else {
            document.getElementById('documentList').innerHTML = '';
        }
    }

    /**
     * 자산 검색
     */
    async searchAssets() {
        const assetCode = document.getElementById('assetCode')?.value || '';
        const assetName = document.getElementById('assetName')?.value || '';
        const category = document.getElementById('category')?.value || '';
        const status = document.getElementById('status')?.value || '';
        
        // 로딩 상태 표시
        this.showTableLoading();
        
        try {
            // 실제 구현에서는 API 호출
            const searchParams = { assetCode, assetName, category, status };
            const results = await this.performAssetSearch(searchParams);
            this.displaySearchResults(results);
        } catch (error) {
            console.error('자산 검색 오류:', error);
            this.showNoDataMessage('데이터를 불러오는 중 오류가 발생했습니다.');
        }
    }

    /**
     * 실제 자산 검색 수행
     */
    async performAssetSearch(params) {
        try {
            const response = await ApiUtils.sendRequest({
                url: '/api/assets/search',
                method: 'POST',
                data: {
                    assetCode: params.assetCode,
                    assetName: params.assetName,
                    category: params.category,
                    status: params.status,
                    searchType: 'disposal' // 폐기용 자산 검색
                }
            });
            
            return response.data || [];
        } catch (error) {
            console.error('자산 검색 API 오류:', error);
            throw new Error('자산 검색 중 오류가 발생했습니다.');
        }
    }

    /**
     * 테이블 로딩 상태 표시
     */
    showTableLoading() {
        const tableBody = document.getElementById('resultTableBody');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-4">
                        <div class="spinner-border text-danger" role="status">
                            <span class="visually-hidden">검색 중...</span>
                        </div>
                    </td>
                </tr>
            `;
        }
    }

    /**
     * 데이터 없음 메시지 표시
     */
    showNoDataMessage(message = '검색 결과가 없습니다.') {
        const tableBody = document.getElementById('resultTableBody');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-4 text-muted">
                        <i class="fas fa-search fa-2x mb-2 opacity-50"></i>
                        <p class="mb-0">${message}</p>
                    </td>
                </tr>
            `;
        }
    }

    /**
     * 검색 결과 표시
     */
    displaySearchResults(data) {
        if (data.length === 0) {
            this.showNoDataMessage();
            return;
        }
        
        let html = '';
        data.forEach(item => {
            html += `
                <tr>
                    <td class="text-center">
                        <input type="radio" name="selectedAsset" class="form-check-input" value="${item.id}" 
                            data-asset-code="${item.assetCode}" 
                            data-asset-name="${item.assetName}" 
                            data-category="${item.category}"
                            data-status="${item.status}"
                            data-acquisition-date="${item.acquisitionDate}"
                            data-asset-value="${item.assetValue}"
                            data-location="${item.location}"
                            data-lifetime="${item.lifetime}"
                            data-image="${item.image || ''}">
                    </td>
                    <td>${item.assetCode}</td>
                    <td>${item.assetName}</td>
                    <td>${item.category}</td>
                    <td>${item.status}</td>
                    <td>${item.acquisitionDate}</td>
                    <td>${item.lifetime}년</td>
                    <td>${item.location}</td>
                </tr>
            `;
        });
        
        document.getElementById('resultTableBody').innerHTML = html;
        
        // 자산 선택 시 이벤트 처리
        this.setupAssetSelectionEvents();
    }

    /**
     * 자산 선택 이벤트 설정
     */
    setupAssetSelectionEvents() {
        document.querySelectorAll('input[name="selectedAsset"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.handleAssetSelection(e.target);
                }
            });
        });
    }

    /**
     * 자산 선택 처리
     */
    handleAssetSelection(radio) {
        // 필드 맵핑 정의
        const fieldMap = {
            assetCode: 'disposalAssetCode',
            assetName: 'disposalAssetName',
            category: 'disposalCategory',
            acquisitionDate: 'acquisitionDate',
            assetValue: 'assetValue'
        };
        
        // 폼 필드 채우기
        this.fillFormFromSelection(radio, fieldMap);
        
        // 선택된 행 하이라이트
        this.highlightSelectedRow(radio);
        
        // 제출 버튼 활성화
        const submitBtn = document.getElementById('submitDisposal');
        if (submitBtn) {
            submitBtn.disabled = false;
        }
        
        // 폼으로 스크롤
        const formHeader = document.querySelector('.card-header h6.font-weight-bold.text-danger');
        if (formHeader) {
            formHeader.scrollIntoView({ behavior: 'smooth' });
        }
    }

    /**
     * 선택된 데이터로 폼 채우기
     */
    fillFormFromSelection(radio, fieldMap) {
        Object.keys(fieldMap).forEach(dataKey => {
            const fieldId = fieldMap[dataKey];
            const value = radio.getAttribute(`data-${dataKey.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
            const field = document.getElementById(fieldId);
            
            if (field && value) {
                field.value = value;
            }
        });

        // 이미지 처리
        const imageUrl = radio.getAttribute('data-image');
        if (imageUrl) {
            const imageContainer = document.getElementById('assetImage');
            if (imageContainer) {
                imageContainer.innerHTML = `<img src="${imageUrl}" class="img-fluid rounded" style="max-height: 200px;">`;
            }
        }
    }

    /**
     * 선택된 행 하이라이트
     */
    highlightSelectedRow(radio) {
        // 모든 행에서 하이라이트 제거
        document.querySelectorAll('#resultTableBody tr').forEach(row => {
            row.classList.remove('selected-asset');
        });
        
        // 선택된 행에 하이라이트 추가
        const selectedRow = radio.closest('tr');
        if (selectedRow) {
            selectedRow.classList.add('selected-asset');
        }
    }

    /**
     * 폐기 폼 유효성 검사
     */
    validateDisposalForm() {
        const requiredFields = ['disposalAssetCode', 'disposalReason', 'requestDate', 'disposalMethod', 'requestedBy'];
        
        // 기타 사유 선택 시 otherReason 필드도 검증
        const disposalReason = document.getElementById('disposalReason')?.value;
        if (disposalReason === '기타') {
            requiredFields.push('otherReason');
        }
        
        return this.validateRequiredFields(requiredFields);
    }

    /**
     * 필수 필드 검증
     */
    validateRequiredFields(requiredFields) {
        for (const fieldId of requiredFields) {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) {
                alert(`필수 항목을 모두 입력해주세요: ${fieldId}`);
                if (field) field.focus();
                return false;
            }
        }
        return true;
    }

    /**
     * 폐기 확인 모달 열기
     */
    openConfirmModal() {
        const assetCode = document.getElementById('disposalAssetCode').value;
        const assetName = document.getElementById('disposalAssetName').value;
        const disposalReasonEl = document.getElementById('disposalReason');
        const disposalReason = disposalReasonEl.options[disposalReasonEl.selectedIndex].text;
        const disposalMethodEl = document.getElementById('disposalMethod');
        const disposalMethod = disposalMethodEl.options[disposalMethodEl.selectedIndex].text;
        
        // 기타 사유 처리
        let reasonText = disposalReason;
        if (disposalReason === '기타') {
            const otherReason = document.getElementById('otherReason').value;
            reasonText = `기타 (${otherReason})`;
        }
        
        // 모달에 정보 표시
        const html = `
            <table class="table table-sm mt-3">
                <tr>
                    <th style="width: 30%">자산 코드</th>
                    <td>${assetCode}</td>
                </tr>
                <tr>
                    <th>자산명</th>
                    <td>${assetName}</td>
                </tr>
                <tr>
                    <th>폐기 사유</th>
                    <td>${reasonText}</td>
                </tr>
                <tr>
                    <th>폐기 방법</th>
                    <td>${disposalMethod}</td>
                </tr>
            </table>
        `;
        
        const detailsContainer = document.getElementById('disposalConfirmDetails');
        if (detailsContainer) {
            detailsContainer.innerHTML = html;
        }
        
        // 모달 열기
        this.toggleModal('disposalConfirmModal', 'show');
    }

    /**
     * 폐기 신청 처리 진행
     */
    async processDisposal() {
        try {
            // 실제 구현에서는 API 호출
            const formData = this.collectFormData();
            await this.submitDisposalRequest(formData);
            
            // 모달 닫기
            this.toggleModal('disposalConfirmModal', 'hide');
            
            // 완료 모달 표시
            this.toggleModal('disposalCompleteModal', 'show');
            
        } catch (error) {
            console.error('폐기 신청 처리 오류:', error);
            alert('폐기 신청 처리 중 오류가 발생했습니다.');
        }
    }

    /**
     * 폼 데이터 수집
     */
    collectFormData() {
        const form = document.getElementById('disposalForm');
        const formData = new FormData(form);
        
        // 추가 데이터 처리
        return {
            assetCode: formData.get('disposalAssetCode'),
            assetName: formData.get('disposalAssetName'),
            reason: formData.get('disposalReason'),
            otherReason: formData.get('otherReason'),
            requestDate: formData.get('requestDate'),
            method: formData.get('disposalMethod'),
            requestedBy: formData.get('requestedBy'),
            notes: formData.get('notes')
        };
    }

    /**
     * 폐기 신청 제출
     */
    async submitDisposalRequest(data) {
        try {
            const response = await ApiUtils.sendRequest({
                url: '/api/operations/disposal',
                method: 'POST',
                data: {
                    assetCode: data.assetCode,
                    assetName: data.assetName,
                    disposalReason: data.reason,
                    otherReason: data.otherReason,
                    requestDate: data.requestDate,
                    disposalMethod: data.method,
                    requestedBy: data.requestedBy,
                    notes: data.notes,
                    attachments: this.getAttachments()
                }
            });
            
            return response;
        } catch (error) {
            console.error('폐기 신청 API 오류:', error);
            throw new Error('폐기 신청 제출 중 오류가 발생했습니다.');
        }
    }

    /**
     * 첨부 파일 정보 수집
     */
    getAttachments() {
        const fileInput = document.getElementById('supportingDocument');
        const attachments = [];
        
        if (fileInput && fileInput.files) {
            for (let i = 0; i < fileInput.files.length; i++) {
                const file = fileInput.files[i];
                attachments.push({
                    name: file.name,
                    size: file.size,
                    type: file.type
                });
            }
        }
        
        return attachments;
    }

    /**
     * 모달 토글
     */
    toggleModal(modalId, action = 'show') {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        if (action === 'show') {
            modal.style.display = 'block';
            modal.classList.add('show');
            document.body.classList.add('modal-open');
        } else {
            modal.style.display = 'none';
            modal.classList.remove('show');
            document.body.classList.remove('modal-open');
        }
    }

    /**
     * 폐기 폼 초기화
     */
    resetDisposalForm() {
        const form = document.getElementById('disposalForm');
        if (form) {
            form.reset();
        }
        
        // 기본값 설정
        this.setTodayDate();
        
        // 이미지 컨테이너 초기화
        const imageContainer = document.getElementById('assetImage');
        if (imageContainer) {
            imageContainer.innerHTML = '';
        }
        
        // 기타 사유 컨테이너 숨기기
        const otherReasonContainer = document.getElementById('otherReasonContainer');
        if (otherReasonContainer) {
            otherReasonContainer.style.display = 'none';
        }
        
        // 첨부 파일 목록 초기화
        const documentList = document.getElementById('documentList');
        if (documentList) {
            documentList.innerHTML = '';
        }
        
        // 제출 버튼 비활성화
        const submitBtn = document.getElementById('submitDisposal');
        if (submitBtn) {
            submitBtn.disabled = true;
        }
        
        // 테이블에서 선택된 행 표시 제거
        document.querySelectorAll('#resultTableBody tr').forEach(row => {
            row.classList.remove('selected-asset');
        });
        
        this.selectedAsset = null;
    }

    /**
     * 상태 확인
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            selectedAsset: this.selectedAsset
        };
    }

    /**
     * 정리
     */
    cleanup() {
        this.selectedAsset = null;
        this.isInitialized = false;
    }
}

// 전역 인스턴스 생성 (레거시 호환성)
window.disposalFormManager = new DisposalFormManager(); 