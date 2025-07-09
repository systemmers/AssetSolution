/**
 * 자산 폐기 신청 관련 스크립트
 * asset_solution/static/js/pages/operations/disposal_form.js
 */

document.addEventListener('DOMContentLoaded', function() {
    // 현재 날짜 설정
    OperationsUtils.setDateToday('requestDate');
    
    // 이벤트 리스너 등록
    initEventListeners();
    
    // 초기 폐기 가능한 자산 목록 로드
    loadInitialAssets();
});

/**
 * 이벤트 리스너 초기화
 */
function initEventListeners() {
    // 검색 버튼
    document.getElementById('searchBtn').addEventListener('click', searchAssets);
    
    // 초기화 버튼
    document.getElementById('resetBtn').addEventListener('click', function() {
        document.getElementById('assetSearchForm').reset();
    });
    
    // 폐기 사유 선택 시 기타 필드 표시 여부 처리
    document.getElementById('disposalReason').addEventListener('change', toggleOtherReasonField);
    
    // 폐기 신청 폼 제출
    document.getElementById('disposalForm').addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateDisposalForm()) {
            openConfirmModal();
        }
    });
    
    // 이미지 업로드 미리보기 (공통 유틸리티 사용)
    ImageUploadUtils.createBasicUpload('assetImageContainer', {
        maxSize: 5 * 1024 * 1024, // 5MB
        dragDrop: true,
        showFileName: true,
        onUpload: (file) => {
            console.log('폐기 자산 이미지 업로드:', file.name);
        },
        onError: (error) => {
            alert('이미지 업로드 오류: ' + error);
        }
    });
    
    // 증빙 서류 첨부 처리
    document.getElementById('supportingDocument').addEventListener('change', handleDocumentUpload);
    
    // 폐기 확인 모달에서 확인 버튼
    document.getElementById('confirmDisposalBtn').addEventListener('click', processDisposal);
    
    // 폐기 완료 후 다른 자산 폐기 신청하기 버튼
    document.getElementById('disposalAnotherBtn').addEventListener('click', resetDisposalForm);
}

/**
 * 기타 폐기 사유 필드 표시 여부 토글
 */
function toggleOtherReasonField() {
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
 * 증빙 서류 업로드 처리
 */
function handleDocumentUpload(e) {
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
async function searchAssets() {
    const assetCode = document.getElementById('assetCode').value;
    const assetName = document.getElementById('assetName').value;
    const category = document.getElementById('category').value;
    const status = document.getElementById('status').value;
    
    // 로딩 상태 표시
    OperationsUtils.showTableLoading('resultTableBody', 8, 'text-danger');
    
    try {
        // 검색 필터 파라미터 구성
        const searchParams = new URLSearchParams();
        if (assetCode) searchParams.append('assetCode', assetCode);
        if (assetName) searchParams.append('assetName', assetName);
        if (category) searchParams.append('category', category);
        if (status) searchParams.append('status', status);
        
        // API 호출
        const response = await fetch(`/api/assets/for-disposal?${searchParams.toString()}`);
        const result = await response.json();
        
        if (result.success) {
            displaySearchResults(result.data);
        } else {
            console.error('API 오류:', result.message);
            OperationsUtils.showNoDataMessage('resultTableBody', 8, result.message || '데이터를 불러오는 중 오류가 발생했습니다.');
        }
        
    } catch (error) {
        console.error('네트워크 오류:', error);
        OperationsUtils.showNoDataMessage('resultTableBody', 8, '데이터를 불러오는 중 네트워크 오류가 발생했습니다.');
    }
}

/**
 * 검색 결과 표시
 */
function displaySearchResults(data) {
    if (data.length === 0) {
        OperationsUtils.showNoDataMessage('resultTableBody', 8, '검색 결과가 없습니다.');
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
    document.querySelectorAll('input[name="selectedAsset"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                // 필드 맵핑 정의
                const fieldMap = {
                    assetCode: 'disposalAssetCode',
                    assetName: 'disposalAssetName',
                    category: 'disposalCategory',
                    acquisitionDate: 'acquisitionDate',
                    assetValue: 'assetValue'
                };
                
                // 공통 유틸리티 함수를 사용하여 폼 채우기
                OperationsUtils.fillFormFromSelection(
                    this, 
                    fieldMap, 
                    'assetImage', 
                    true, 
                    'submitDisposal'
                );
                
                // 선택된 행 하이라이트
                OperationsUtils.highlightSelectedRow(this, '#resultTableBody', 'selected-asset');
                
                // 폼으로 스크롤
                document.querySelector('.card-header h6.font-weight-bold.text-danger').scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

/**
 * 폐기 폼 유효성 검사
 */
function validateDisposalForm() {
    let requiredFields = ['disposalAssetCode', 'disposalReason', 'requestDate', 'disposalMethod', 'requestedBy'];
    
    // 기타 사유 선택 시 otherReason 필드도 검증
    if (document.getElementById('disposalReason').value === '기타') {
        requiredFields.push('otherReason');
    }
    
    return OperationsUtils.validateRequiredFields(requiredFields);
}

/**
 * 폐기 확인 모달 열기
 */
function openConfirmModal() {
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
    let html = `
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
    
    document.getElementById('disposalConfirmDetails').innerHTML = html;
    
    // 모달 열기
    OperationsUtils.toggleModal('disposalConfirmModal', 'show');
}

/**
 * 폐기 신청 처리 진행
 */
function processDisposal() {
    // API 호출 (실제 구현 시 추가)
    // const formData = new FormData(document.getElementById('disposalForm'));
    // 
    // fetch('/api/operations/process-disposal', {
    //   method: 'POST',
    //   body: formData
    // })
    //   .then(response => response.json())
    //   .then(data => {
    //     if (data.success) {
    //       showCompleteModal();
    //     } else {
    //       UIUtils.showAlert('폐기 신청 처리 중 오류가 발생했습니다: ' + data.message, 'danger');
    //     }
    //   })
    //   .catch(error => {
    //     console.error('에러:', error);
    //     UIUtils.showAlert('폐기 신청 처리 중 오류가 발생했습니다.', 'danger');
    //   });
    
    // 모달 닫기
    OperationsUtils.toggleModal('disposalConfirmModal', 'hide');
    
    // 완료 모달 표시
    OperationsUtils.toggleModal('disposalCompleteModal', 'show');
}

/**
 * 폐기 폼 초기화
 */
function resetDisposalForm() {
    // 공통 유틸리티 함수를 사용하여 폼 초기화
    OperationsUtils.resetForm(
        'disposalForm',
        { 'requestDate': OperationsUtils.getTodayISOString() }, // 기본값 설정
        ['assetImage'],  // 이미지 컨테이너 초기화
        'submitDisposal'  // 제출 버튼 비활성화
    );
    
    // 기타 사유 컨테이너 숨기기
    document.getElementById('otherReasonContainer').style.display = 'none';
    
    // 첨부 파일 목록 초기화
    document.getElementById('documentList').innerHTML = '';
    
    // 테이블에서 선택된 행 표시 제거
    document.querySelectorAll('#resultTableBody tr').forEach(row => {
        row.classList.remove('selected-asset');
    });
}

/**
 * 초기 폐기 가능한 자산 목록 로드
 */
async function loadInitialAssets() {
    try {
        // 로딩 상태 표시
        OperationsUtils.showTableLoading('resultTableBody', 8, 'text-danger');
        
        // API 호출로 초기 폐기 가능한 자산 목록 로드
        const response = await fetch('/api/assets/for-disposal');
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
            displaySearchResults(result.data);
        } else {
            OperationsUtils.showNoDataMessage('resultTableBody', 8, '폐기 가능한 자산이 없습니다.');
        }
        
    } catch (error) {
        console.error('초기 자산 목록 로드 오류:', error);
        OperationsUtils.showNoDataMessage('resultTableBody', 8, '자산 목록을 불러오는 중 오류가 발생했습니다.');
    }
} 