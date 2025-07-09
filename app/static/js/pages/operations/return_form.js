/**
 * 자산 반납 처리 관련 스크립트
 * asset_solution/static/js/pages/operations/return_form.js
 */

// API 유틸리티 임포트 (중복 제거를 위한 공통 모듈 사용)
import ApiUtils from '../../shared/operations/api-utils.js';

/**
 * 자산 반납 처리 관련 스크립트 인덱스
 * 
 * 1. 초기화 및 이벤트 설정
 *   - DOMContentLoaded: 페이지 로드 시 초기화
 *   - initEventListeners: 이벤트 리스너 등록
 * 
 * 2. 자산 검색 및 데이터 로드
 *   - searchLoanedAssets: 대여 중인 자산 검색
 *   - loadSampleData: 테스트 데이터 로드
 * 
 * 3. 폼 처리 및 유효성 검사
 *   - validateReturnForm: 반납 폼 유효성 검사
 *   - resetReturnForm: 반납 폼 초기화
 * 
 * 4. 반납 처리 로직
 *   - processReturn: 반납 처리 실행
 *   - openConfirmModal: 반납 확인 모달 표시
 * 
 * 5. 유틸리티 함수
 *   - OperationsUtils.setDateToday: 현재 날짜 설정
 *   - OperationsUtils.previewImage: 이미지 미리보기
 */


document.addEventListener('DOMContentLoaded', function() {
    // 현재 날짜 설정
    OperationsUtils.setDateToday('returnDate');
    
    // 이벤트 리스너 등록
    initEventListeners();
    
    // 초기 대여 중인 자산 목록 로드
    loadInitialLoanedAssets();
});

/**
 * 이벤트 리스너 초기화
 */
function initEventListeners() {
    // 검색 버튼
    document.getElementById('searchBtn').addEventListener('click', searchLoanedAssets);
    
    // 초기화 버튼
    document.getElementById('resetBtn').addEventListener('click', function() {
        document.getElementById('assetSearchForm').reset();
    });
    
    // 반납 폼 제출
    document.getElementById('returnForm').addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateReturnForm()) {
            openConfirmModal();
        }
    });
    
    // 이미지 업로드 미리보기 (공통 유틸리티 사용)
    ImageUploadUtils.createBasicUpload('assetReturnImageContainer', {
        maxSize: 5 * 1024 * 1024, // 5MB
        dragDrop: true,
        showFileName: true,
        onUpload: (file) => {
            console.log('반납 이미지 업로드:', file.name);
        },
        onError: (error) => {
            alert('이미지 업로드 오류: ' + error);
        }
    });
    
    // 반납 확인 모달에서 확인 버튼
    document.getElementById('confirmReturnBtn').addEventListener('click', processReturn);
    
    // 반납 완료 후 다른 자산 반납하기 버튼
    document.getElementById('returnAnotherBtn').addEventListener('click', resetReturnForm);
}

/**
 * 대여 중인 자산 검색 (중복 제거된 API 호출)
 */
async function searchLoanedAssets() {
    const assetCode = document.getElementById('assetCode').value;
    const assetName = document.getElementById('assetName').value;
    const borrower = document.getElementById('borrower').value;
    const department = document.getElementById('department').value;
    
    try {
        // 로딩 상태 표시
        OperationsUtils.showTableLoading('resultTableBody', 7, 'text-success');
        
        // 공통 API 유틸리티 사용으로 중복 제거
        const response = await ApiUtils.getWithParams('/operations/api/loans/active', {
            assetCode: assetCode || '',
            assetName: assetName || '',
            borrower: borrower || '',
            department: department || ''
        }, {
            showErrors: true
        });
        
        if (response.data.success) {
            displaySearchResults(response.data.data || []);
        } else {
            throw new Error(response.data.message || '데이터 조회에 실패했습니다.');
        }
    } catch (error) {
        console.error('에러:', error);
        OperationsUtils.showNoDataMessage('resultTableBody', 7, '데이터를 불러오는 중 오류가 발생했습니다: ' + error.message);
    }
}

/**
 * 검색 결과 표시
 */
function displaySearchResults(data) {
    if (data.length === 0) {
        OperationsUtils.showNoDataMessage('resultTableBody', 7, '검색 결과가 없습니다.');
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
                        data-borrower="${item.borrower}"
                        data-department="${item.department}"
                        data-loan-date="${item.loanDate}"
                        data-due-date="${item.dueDate}"
                        data-image="${item.image || ''}">
                </td>
                <td>${item.assetCode}</td>
                <td>${item.assetName}</td>
                <td>${item.borrower}</td>
                <td>${item.department}</td>
                <td>${item.loanDate}</td>
                <td>${item.dueDate}</td>
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
                    assetCode: 'returnAssetCode',
                    assetName: 'returnAssetName',
                    borrower: 'returnBorrower'
                };
                
                // 공통 유틸리티 함수를 사용하여 폼 채우기
                OperationsUtils.fillFormFromSelection(
                    this, 
                    fieldMap, 
                    'assetOriginalImage', 
                    true, 
                    'submitReturn'
                );
                
                // 선택된 행 하이라이트
                OperationsUtils.highlightSelectedRow(this, '#resultTableBody', 'selected-asset');
                
                // 폼으로 스크롤
                document.querySelector('.card-header h6.font-weight-bold.text-success').scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

/**
 * 반납 폼 유효성 검사
 */
function validateReturnForm() {
    const requiredFields = ['returnAssetCode', 'returnDate', 'returnStatus', 'processedBy'];
    return OperationsUtils.validateRequiredFields(requiredFields);
}

/**
 * 반납 확인 모달 열기
 */
function openConfirmModal() {
    const assetCode = document.getElementById('returnAssetCode').value;
    const assetName = document.getElementById('returnAssetName').value;
    const borrower = document.getElementById('returnBorrower').value;
    const returnDate = document.getElementById('returnDate').value;
    const returnStatus = document.getElementById('returnStatus').options[document.getElementById('returnStatus').selectedIndex].text;
    
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
                <th>대여자</th>
                <td>${borrower}</td>
            </tr>
            <tr>
                <th>반납일</th>
                <td>${returnDate}</td>
            </tr>
            <tr>
                <th>반납 상태</th>
                <td><span class="status-badge status-${returnStatus === '정상' ? 'normal' : returnStatus === '손상' ? 'damaged' : returnStatus === '분실' ? 'lost' : 'repair'}">${returnStatus}</span></td>
            </tr>
        </table>
    `;
    
    document.getElementById('returnConfirmDetails').innerHTML = html;
    
    // 모달 열기
    OperationsUtils.toggleModal('returnConfirmModal', 'show');
}

/**
 * 반납 처리 진행
 */
function processReturn() {
    // API 호출 (실제 구현 시 추가)
    // const formData = new FormData(document.getElementById('returnForm'));
    // 
    // fetch('/api/operations/process-return', {
    //   method: 'POST',
    //   body: formData
    // })
    //   .then(response => response.json())
    //   .then(data => {
    //     if (data.success) {
    //       showCompleteModal();
    //     } else {
    //       UIUtils.showAlert('반납 처리 중 오류가 발생했습니다: ' + data.message, 'danger');
    //     }
    //   })
    //   .catch(error => {
    //     console.error('에러:', error);
    //     UIUtils.showAlert('반납 처리 중 오류가 발생했습니다.', 'danger');
    //   });
    
    // 모달 닫기
    OperationsUtils.toggleModal('returnConfirmModal', 'hide');
    
    // 완료 모달 표시
    OperationsUtils.toggleModal('returnCompleteModal', 'show');
}

/**
 * 반납 폼 초기화
 */
function resetReturnForm() {
    // 공통 유틸리티 함수를 사용하여 폼 초기화
    OperationsUtils.resetForm(
        'returnForm',
        { 'returnDate': OperationsUtils.getTodayISOString() }, // 기본값 설정
        ['assetOriginalImage', 'assetReturnImage'],  // 이미지 컨테이너 초기화
        'submitReturn'  // 제출 버튼 비활성화
    );
    
    // 테이블에서 선택된 행 표시 제거
    document.querySelectorAll('#resultTableBody tr').forEach(row => {
        row.classList.remove('selected-asset');
    });
}

/**
 * 초기 대여 중인 자산 목록 로드 (중복 제거된 API 호출)
 */
async function loadInitialLoanedAssets() {
    try {
        // 빈 검색으로 전체 대여 중인 자산 목록 표시
        OperationsUtils.showTableLoading('resultTableBody', 7, 'text-success');
        
        // 공통 API 유틸리티 사용으로 중복 제거
        const response = await ApiUtils.get('/operations/api/loans/active', {
            showErrors: true
        });
        
        if (response.data.success) {
            displaySearchResults(response.data.data || []);
        } else {
            throw new Error(response.data.message || '데이터 조회에 실패했습니다.');
        }
    } catch (error) {
        console.error('에러:', error);
        OperationsUtils.showNoDataMessage('resultTableBody', 7, '초기 데이터를 불러오는 중 오류가 발생했습니다: ' + error.message);
    }
} 