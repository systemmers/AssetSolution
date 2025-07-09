/**
 * 협력사 관리 페이지 JavaScript
 * 협력사 목록 페이지의 상호작용 기능을 담당
 */

document.addEventListener('DOMContentLoaded', function() {
    // 협력사 행 클릭 이벤트 처리
    const partnerRows = document.querySelectorAll('.partner-row');
    partnerRows.forEach(row => {
        row.addEventListener('click', function() {
            const partnerId = this.getAttribute('data-partner-id');
            if (partnerId) {
                // Flask URL 템플릿을 사용하여 동적 URL 생성
                const baseUrl = window.partnerDetailUrl || '/assets/partners/';
                window.location.href = baseUrl + partnerId;
            }
        });
    });

    // 검색 폼 처리
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // 검색 기능 구현 (Phase 4에서 구현 예정)
            console.log('검색 기능은 Phase 4에서 구현됩니다.');
        });
    }

    // 초기화 버튼 처리
    const resetButton = document.getElementById('resetButton');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            // 검색 폼 초기화
            if (searchForm) {
                searchForm.reset();
            }
        });
    }

    // 협력사 추가 폼 관련 기능
    initPartnerAddForm();
});

/**
 * 협력사 추가 폼 초기화
 */
function initPartnerAddForm() {
    const addPartnerForm = document.getElementById('addPartnerForm');
    const logoFileInput = document.getElementById('logoFile');
    const logoPreview = document.getElementById('logoPreview');
    const logoPlaceholder = document.getElementById('logoPlaceholder');

    if (!addPartnerForm) return;

    // 로고 파일 업로드 - 공통 유틸리티 사용
    if (logoFileInput && typeof ImageUploadUtils !== 'undefined') {
        // 기존 로고 미리보기 컨테이너 확인
        let logoContainer = document.getElementById('logoContainer');
        if (!logoContainer) {
            // 로고 컨테이너가 없으면 생성
            logoContainer = document.createElement('div');
            logoContainer.id = 'logoContainer';
            logoFileInput.parentNode.appendChild(logoContainer);
        }

        // 공통 유틸리티로 이미지 업로드 초기화
        const logoUpload = ImageUploadUtils.createBasicUpload('logoContainer', {
            maxSize: 2 * 1024 * 1024, // 2MB
            allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
            previewClass: 'img-thumbnail',
            maxHeight: '100px',
            showFileName: true,
            showRemoveButton: true,
            dragDrop: true,
            onUpload: function(file) {
                console.log('협력사 로고 업로드:', file.name);
                
                // 기존 숨겨진 파일 입력에 설정
                const dt = new DataTransfer();
                dt.items.add(file);
                logoFileInput.files = dt.files;
                
                // 기존 미리보기 숨기기
                if (logoPreview) logoPreview.style.display = 'none';
                if (logoPlaceholder) logoPlaceholder.style.display = 'none';
            },
            onError: function(message) {
                alert(message);
            },
            onRemove: function() {
                logoFileInput.value = '';
                // 기존 미리보기 복원
                if (logoPreview) logoPreview.style.display = 'none';
                if (logoPlaceholder) logoPlaceholder.style.display = 'block';
            }
        });
    } else if (logoFileInput) {
        // 공통 유틸리티가 없는 경우 기본 기능 사용
        console.warn('ImageUploadUtils를 찾을 수 없습니다. 기본 업로드 기능을 사용합니다.');
        
        logoFileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // 파일 크기 검증 (2MB)
                if (file.size > 2 * 1024 * 1024) {
                    alert('파일 크기는 2MB 이하여야 합니다.');
                    this.value = '';
                    return;
                }

                // 파일 타입 검증
                if (!file.type.startsWith('image/')) {
                    alert('이미지 파일만 업로드 가능합니다.');
                    this.value = '';
                    return;
                }

                // 미리보기 표시
                const reader = new FileReader();
                reader.onload = function(e) {
                    logoPreview.src = e.target.result;
                    logoPreview.style.display = 'block';
                    logoPlaceholder.style.display = 'none';
                };
                reader.readAsDataURL(file);
            } else {
                // 파일이 선택되지 않은 경우
                logoPreview.style.display = 'none';
                logoPlaceholder.style.display = 'block';
            }
        });
    }

    // 폼 제출 이벤트 처리
    addPartnerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validatePartnerForm()) {
            submitPartnerForm();
        }
    });

    // 전화번호 입력 포맷팅
    const phoneInput = document.getElementById('contactPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/[^\d]/g, '');
            if (value.length >= 3 && value.length <= 7) {
                value = value.replace(/(\d{3})(\d{1,4})/, '$1-$2');
            } else if (value.length >= 8) {
                value = value.replace(/(\d{3})(\d{4})(\d{1,4})/, '$1-$2-$3');
            }
            e.target.value = value;
        });
    }

    // 사업자등록번호 입력 포맷팅
    const regNumberInput = document.getElementById('registrationNumber');
    if (regNumberInput) {
        regNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/[^\d]/g, '');
            if (value.length >= 3 && value.length <= 5) {
                value = value.replace(/(\d{3})(\d{1,2})/, '$1-$2');
            } else if (value.length >= 6) {
                value = value.replace(/(\d{3})(\d{2})(\d{1,5})/, '$1-$2-$3');
            }
            e.target.value = value;
        });
    }
}

/**
 * 협력사 폼 유효성 검증
 */
function validatePartnerForm() {
    const form = document.getElementById('addPartnerForm');
    let isValid = true;

    // 필수 필드 검증
    const requiredFields = [
        { id: 'partnerName', message: '협력사명을 입력해주세요.' },
        { id: 'contactPerson', message: '담당자명을 입력해주세요.' },
        { id: 'contactEmail', message: '이메일을 입력해주세요.' },
        { id: 'contactPhone', message: '연락처를 입력해주세요.' }
    ];

    requiredFields.forEach(field => {
        const input = document.getElementById(field.id);
        const value = input.value.trim();
        
        if (!value) {
            showFieldError(input, field.message);
            isValid = false;
        } else {
            clearFieldError(input);
        }
    });

    // 이메일 형식 검증
    const emailInput = document.getElementById('contactEmail');
    const emailValue = emailInput.value.trim();
    if (emailValue && !isValidEmail(emailValue)) {
        showFieldError(emailInput, '올바른 이메일 형식을 입력해주세요.');
        isValid = false;
    }

    // 세금계산서 이메일 형식 검증 (선택사항이지만 입력된 경우)
    const taxEmailInput = document.getElementById('taxInvoiceEmail');
    const taxEmailValue = taxEmailInput.value.trim();
    if (taxEmailValue && !isValidEmail(taxEmailValue)) {
        showFieldError(taxEmailInput, '올바른 이메일 형식을 입력해주세요.');
        isValid = false;
    }

    // 전화번호 형식 검증
    const phoneInput = document.getElementById('contactPhone');
    const phoneValue = phoneInput.value.trim();
    if (phoneValue && !isValidPhone(phoneValue)) {
        showFieldError(phoneInput, '올바른 전화번호 형식을 입력해주세요. (예: 010-0000-0000)');
        isValid = false;
    }

    return isValid;
}

/**
 * 이메일 형식 검증
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * 전화번호 형식 검증
 */
function isValidPhone(phone) {
    const phoneRegex = /^\d{2,3}-\d{3,4}-\d{4}$/;
    return phoneRegex.test(phone);
}

/**
 * 필드 오류 표시
 */
function showFieldError(input, message) {
    input.classList.add('is-invalid');
    
    // 기존 오류 메시지 제거
    const existingError = input.parentNode.querySelector('.invalid-feedback');
    if (existingError) {
        existingError.textContent = message;
    }
}

/**
 * 필드 오류 제거
 */
function clearFieldError(input) {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
}

/**
 * 협력사 폼 제출
 */
function submitPartnerForm() {
    const form = document.getElementById('addPartnerForm');
    
    // 제출 버튼 비활성화
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>저장 중...';

    // 실제 폼 제출
    form.submit();
} 