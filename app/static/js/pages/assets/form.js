/**
 * 자산 등록/수정 폼 JavaScript 기능
 * 공통 유틸리티를 사용하여 리팩토링됨
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('자산 등록/수정 폼 스크립트 로드됨');
    
    // 카테고리 가이드 초기화
    initCategoryGuides();
    
    // 폼 유효성 검사 초기화 (FormUtils 모듈 사용)
    initFormValidation();
    
    // 날짜 선택기 초기화
    initDatePickers();
    
    // 이벤트 리스너 정리 등록
    window.addEventListener('beforeunload', cleanup);
    
    // 이미지 업로드 초기화 (공통 유틸리티 사용)
    initImageUpload();
});

/**
 * 카테고리 가이드 표시 기능 초기화
 */
function initCategoryGuides() {
    const categorySelect = document.getElementById('assetCategory');
    const categoryGuide = document.getElementById('categoryGuide');
    const allGuides = document.querySelectorAll('.category-guide');
    
    if (!categorySelect || !categoryGuide) return;
    
    categorySelect.addEventListener('change', function() {
        updateCategoryGuide(this.value);
    });
    
    // 페이지 로드 시 이미 선택된 카테고리가 있으면 가이드 표시
    if (categorySelect.value) {
        updateCategoryGuide(categorySelect.value);
    }
    
    function updateCategoryGuide(selectedValue) {
        // 모든 가이드 숨기기
        allGuides.forEach(guide => {
            guide.style.display = 'none';
        });
        
        // 선택된 카테고리에 해당하는 가이드 표시
        if (selectedValue) {
            categoryGuide.style.display = 'block';
            const selectedGuide = document.getElementById(`guide-${selectedValue}`);
            if (selectedGuide) {
                selectedGuide.style.display = 'block';
            }
        } else {
            categoryGuide.style.display = 'none';
        }
    }
}

/**
 * 폼 유효성 검사 초기화
 */
function initFormValidation() {
    const assetForm = document.getElementById('assetForm');
    
    if (!assetForm) return;
    
    assetForm.addEventListener('submit', function(e) {
        if (!validateForm()) {
            e.preventDefault();
            showAlert('필수 항목을 모두 입력해주세요.', 'warning');
        } else {
            // 제출 전 로딩 표시
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>저장 중...';
            }
        }
    });
    
    function validateForm() {
        const requiredFields = assetForm.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('is-invalid');
                isValid = false;
            } else {
                field.classList.remove('is-invalid');
                field.classList.add('is-valid');
            }
        });
        
        return isValid;
    }
}

/**
 * 날짜 선택기 초기화
 */
function initDatePickers() {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        // 오늘 날짜를 기본값으로 설정 (선택사항)
        if (!input.value && input.id === 'purchaseDate') {
            input.value = new Date().toISOString().split('T')[0];
        }
    });
}

/**
 * 페이지 언로드 시 이벤트 리스너 정리
 */
function cleanup() {
    console.log('자산 폼 정리 완료');
}

/**
 * 이미지 업로드 초기화 - 공통 유틸리티 사용
 */
function initImageUpload() {
    if (typeof ImageUploadUtils === 'undefined') {
        console.error('ImageUploadUtils를 찾을 수 없습니다. 이미지 업로드 기능을 사용할 수 없습니다.');
        return;
    }
    
    console.log('ImageUploadUtils로 이미지 업로드 초기화 중...');
    
    // Utils로 쇼핑몰 스타일 이미지 업로드 초기화
    const productUpload = ImageUploadUtils.createProductUpload('productImageContainer', {
        maxFiles: 5,
        mainImageRequired: true,
        additionalImages: 4,
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
        dragDrop: true,
        overlayButtons: true,
        onUpload: function(file, isMain, index) {
            console.log(`이미지 업로드: ${file.name} (메인: ${isMain}, 인덱스: ${index})`);
            
            // 숨겨진 폼 입력에 파일 설정 (백엔드 호환성)
            if (isMain) {
                setHiddenFileInput('mainImage', file);
            } else if (index < 4) {
                setHiddenFileInput(`additionalImage${index}`, file);
            }
        },
        onError: function(message) {
            showAlert(message, 'danger');
        },
        onRemove: function(isMain, index) {
            // 숨겨진 폼 입력 초기화
            if (isMain) {
                clearHiddenFileInput('mainImage');
            } else if (index < 4) {
                clearHiddenFileInput(`additionalImage${index}`);
            }
            console.log(`이미지 제거됨 (메인: ${isMain}, 인덱스: ${index})`);
        }
    });
    
    if (productUpload) {
        // 전역 참조 저장
        window.assetProductUpload = productUpload;
        console.log('이미지 업로드 초기화 완료');
    } else {
        console.error('이미지 업로드 초기화 실패');
    }
}

/**
 * 숨겨진 파일 입력에 파일 설정
 */
function setHiddenFileInput(inputId, file) {
    const hiddenInput = document.getElementById(inputId);
    if (hiddenInput) {
        const dt = new DataTransfer();
        dt.items.add(file);
        hiddenInput.files = dt.files;
        
        // 변경 이벤트 발생
        const event = new Event('change', { bubbles: true });
        hiddenInput.dispatchEvent(event);
    }
}

/**
 * 숨겨진 파일 입력 초기화
 */
function clearHiddenFileInput(inputId) {
    const hiddenInput = document.getElementById(inputId);
    if (hiddenInput) {
        hiddenInput.value = '';
        
        // 변경 이벤트 발생
        const event = new Event('change', { bubbles: true });
        hiddenInput.dispatchEvent(event);
    }
}

/**
 * 알림 표시
 */
function showAlert(message, type = 'info') {
    // Bootstrap 알림 생성
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