/**
 * 자산 대여 등록 양식 페이지 JavaScript
 * 공통 모듈을 사용하여 리팩토링됨
 */

// 공통 모듈 가져오기
import UIUtils from '../../../common/ui-utils.js';
import FormUtils from '../../../common/form-utils.js';
import ApiUtils from '../../../common/api-utils.js';
import NavigationUtils from '../../../common/navigation-utils.js';

// 이벤트 리스너 정리를 위한 정리 함수 배열
const cleanupFunctions = [];

document.addEventListener('DOMContentLoaded', function() {
    // 네비게이션 메뉴 활성화
    const navCleanup = activateNavMenu();
    if (navCleanup) cleanupFunctions.push(navCleanup);
    
    // 사용자 선택 시 정보 표시
    const userSelectCleanup = initUserSelect();
    if (userSelectCleanup) cleanupFunctions.push(userSelectCleanup);
    
    // 자산 선택 모달
    const assetModalCleanup = initAssetSelectionModal();
    if (assetModalCleanup) cleanupFunctions.push(assetModalCleanup);
    
    // 자산 대여 가능 여부 확인
    const availabilityCleanup = initAssetAvailability();
    if (availabilityCleanup) cleanupFunctions.push(availabilityCleanup);
    
    // 기본 날짜 설정
    initDefaultDates();
    
    // 폼 제출 처리
    const formCleanup = initFormSubmit();
    if (formCleanup) cleanupFunctions.push(formCleanup);
    
    // 취소 버튼 처리
    const cancelButtonCleanup = initCancelButton();
    if (cancelButtonCleanup) cleanupFunctions.push(cancelButtonCleanup);
    
    // DOM 언로드 시 이벤트 리스너 정리
    window.addEventListener('beforeunload', cleanupEventListeners);
});

/**
 * 네비게이션 메뉴 활성화 함수
 * 현재 페이지에 해당하는 네비게이션 항목을 활성화
 */
function activateNavMenu() {
    // UIUtils를 사용하여 네비게이션 메뉴 활성화
    return UIUtils.activateNavigationItem({
        selector: '.nav-link',
        dataAttribute: 'data-section',
        activeValue: 'operations',
        activeClass: 'active'
    });
}

/**
 * 사용자 선택 이벤트 초기화
 * 사용자 선택에 따른 사용자 정보 표시
 */
function initUserSelect() {
    const userSelect = document.getElementById('userSelect');
    const userInfoSection = document.getElementById('userInfoSection');
    
    if (!userSelect || !userInfoSection) return null;
    
    // 사용자 정보 매핑
    const userInfoMap = {
        '2': { // 홍길동
            name: '홍길동',
            position: '개발팀 / 팀장',
            email: 'hong@example.com',
            phone: '010-1234-5678',
            assets: '노트북 Dell XPS 13, 모니터 LG 27인치'
        },
        '3': { // 김철수
            name: '김철수',
            position: '인사팀 / 대리',
            email: 'kim@example.com',
            phone: '010-9876-5432',
            assets: '없음'
        }
    };
    
    // 사용자 선택 변경 핸들러
    const handleUserChange = function() {
        if (this.value && userInfoMap[this.value]) {
            // 사용자 정보 표시
            userInfoSection.style.display = 'block';
            const userInfo = userInfoMap[this.value];
            
            // 사용자 정보 필드 업데이트
            document.getElementById('selectedUserName').textContent = userInfo.name;
            document.getElementById('selectedUserPosition').textContent = userInfo.position;
            document.getElementById('selectedUserEmail').textContent = userInfo.email;
            document.getElementById('selectedUserPhone').textContent = userInfo.phone;
            document.getElementById('selectedUserAssets').textContent = userInfo.assets;
        } else {
            // 사용자 정보 숨김
            userInfoSection.style.display = 'none';
        }
    };
    
    // 이벤트 리스너 등록
    userSelect.addEventListener('change', handleUserChange);
    
    // 정리 함수 반환
    return function cleanup() {
        userSelect.removeEventListener('change', handleUserChange);
    };
}

/**
 * 자산 선택 모달 초기화
 * 자산 검색 및 선택 기능
 */
function initAssetSelectionModal() {
    // 자산 검색 버튼
    const assetSearchBtn = document.getElementById('assetSearchBtn');
    if (!assetSearchBtn) return null;
    
    // 모달 열기 핸들러
    const handleOpenModal = function() {
        // UIUtils를 사용하여 모달 표시
        UIUtils.showModal('assetSelectionModal');
    };
    
    // 자산 선택 버튼들
    const selectAssetButtons = document.querySelectorAll('.select-asset');
    const selectHandlers = [];
    
    // 자산 선택 버튼 이벤트 핸들러 등록
    selectAssetButtons.forEach(btn => {
        const handleSelectAsset = function() {
            const assetId = this.dataset.id;
            const assetName = this.dataset.name;
            
            // 선택한 자산 정보 설정
            const assetSelect = document.getElementById('assetSelect');
            if (assetSelect) {
                assetSelect.value = assetId;
                
                // 자산 이름 표시 (선택 사항)
                const assetNameDisplay = document.getElementById('selectedAssetName');
                if (assetNameDisplay) {
                    assetNameDisplay.textContent = assetName;
                }
            }
            
            // 모달 닫기
            UIUtils.hideModal('assetSelectionModal');
        };
        
        btn.addEventListener('click', handleSelectAsset);
        selectHandlers.push({ element: btn, handler: handleSelectAsset });
    });
    
    // 이벤트 리스너 등록
    assetSearchBtn.addEventListener('click', handleOpenModal);
    
    // 정리 함수 반환
    return function cleanup() {
        assetSearchBtn.removeEventListener('click', handleOpenModal);
        selectHandlers.forEach(({ element, handler }) => {
            element.removeEventListener('click', handler);
        });
    };
}

/**
 * 자산 대여 가능 여부 확인 초기화
 * 자산 대여 가능 여부를 API로 확인
 */
function initAssetAvailability() {
    const checkAssetAvailability = document.getElementById('checkAssetAvailability');
    if (!checkAssetAvailability) return null;
    
    // 대여 가능 여부 확인 핸들러
    const handleAvailabilityCheck = function() {
        const assetSelect = document.getElementById('assetSelect');
        if (this.checked && assetSelect && assetSelect.value) {
            // ApiUtils를 사용하여 대여 가능 여부 확인 (실제 구현 시)
            ApiUtils.sendRequest({
                url: `/api/assets/${assetSelect.value}/check-availability`,
                method: 'GET',
                onSuccess: (data) => {
                    UIUtils.showAlert('선택한 자산은 대여 가능합니다.', 'success', 3000);
                },
                onError: (error) => {
                    UIUtils.showAlert('이 자산은 현재 대여할 수 없습니다: ' + error.message, 'danger', 5000);
                    this.checked = false;
                },
                mockResponse: true, // 샘플 코드용 (실제 구현 시 제거)
                mockData: { available: true } // 샘플 데이터 (실제 구현 시 제거)
            });
        }
    };
    
    // 이벤트 리스너 등록
    checkAssetAvailability.addEventListener('change', handleAvailabilityCheck);
    
    // 정리 함수 반환
    return function cleanup() {
        checkAssetAvailability.removeEventListener('change', handleAvailabilityCheck);
    };
}

/**
 * 기본 날짜 설정 초기화
 * 대여일과 반납예정일 필드에 기본 날짜 설정
 */
function initDefaultDates() {
    const today = new Date();
    
    // 대여일은 오늘
    const loanDate = document.getElementById('loanDate');
    if (loanDate) {
        loanDate.valueAsDate = today;
    }
    
    // 반납 예정일은 3개월 후
    const expectedReturnDate = document.getElementById('expectedReturnDate');
    if (expectedReturnDate) {
        const threeMonthsLater = new Date(today);
        threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
        expectedReturnDate.valueAsDate = threeMonthsLater;
    }
}

/**
 * 폼 제출 처리 초기화
 * 대여 정보 폼 유효성 검사 및 제출
 */
function initFormSubmit() {
    const loanForm = document.getElementById('loanForm');
    if (!loanForm) return null;
    
    // 폼 제출 핸들러
    const handleFormSubmit = function(e) {
        e.preventDefault();
        
        // FormUtils를 사용하여 폼 유효성 검사
        if (FormUtils.validateForm(loanForm, {
            showToast: true,
            requiredFields: ['userSelect', 'assetSelect', 'loanDate', 'expectedReturnDate']
        })) {
            // FormUtils를 사용하여 폼 제출 처리
            FormUtils.handleFormSubmission(loanForm, {
                onSuccess: function(response) {
                    UIUtils.showAlert('대여 정보가 성공적으로 등록되었습니다.', 'success', 3000);
                    
                    // 대여 목록 페이지로 이동
                    setTimeout(() => {
                        NavigationUtils.navigateTo('/operations/loans');
                    }, 1500);
                },
                onError: function(error) {
                    UIUtils.showAlert('대여 정보 등록 중 오류가 발생했습니다: ' + error.message, 'danger', 5000);
                },
                mockResponse: true, // 샘플 코드용 (실제 구현 시 제거)
                mockData: { success: true } // 샘플 데이터 (실제 구현 시 제거)
            });
        }
    };
    
    // 이벤트 리스너 등록
    loanForm.addEventListener('submit', handleFormSubmit);
    
    // 정리 함수 반환
    return function cleanup() {
        loanForm.removeEventListener('submit', handleFormSubmit);
    };
}

/**
 * 취소 버튼 처리 초기화
 * 취소 버튼 클릭 시 대여 목록 페이지로 이동
 */
function initCancelButton() {
    const cancelButton = document.querySelector('.btn-secondary[type="button"]');
    if (!cancelButton) return null;
    
    const handleCancel = function() {
        NavigationUtils.navigateTo('operations.loan_index');
    };
    
    // 이벤트 리스너 등록
    cancelButton.addEventListener('click', handleCancel);
    
    // 정리 함수 반환
    return function cleanup() {
        cancelButton.removeEventListener('click', handleCancel);
    };
}

/**
 * 페이지 언로드 시 이벤트 리스너 정리
 * 메모리 누수 방지를 위한 정리 작업 수행
 */
function cleanupEventListeners() {
    // 등록된 모든 정리 함수 실행
    cleanupFunctions.forEach(cleanup => {
        if (typeof cleanup === 'function') {
            cleanup();
        }
    });
    
    console.log('자산 대여 등록 양식 페이지 이벤트 리스너 정리');
} 