/**
 * 사용자 프로필 관리 모듈
 * 비밀번호 변경, 개인정보 수정, 자산 현황 표시 등의 기능 제공
 * 
 * @class AuthProfile
 * @description 사용자 프로필 관련 기능 관리
 * 
 * 주요 기능:
 * - 비밀번호 변경 및 검증
 * - 개인정보 수정
 * - 사용자 자산 현황 표시
 * - 프로필 이미지 관리
 */

import UIUtils from '../../../common/ui-utils.js';
import FormUtils from '../../../common/form-utils.js';
import TableUtils from '../../../common/table-utils.js';
import ApiUtils from '../../../common/api-utils.js';

class AuthProfile {
    /**
     * AuthProfile 클래스 생성자
     * @param {Object} config 설정 옵션
     */
    constructor(config = {}) {
        this.config = {
            // 폼 선택자
            passwordFormSelector: '#passwordModal form',
            profileFormSelector: '#profileForm',
            
            // 입력 필드 선택자
            passwordFields: {
                current: '#currentPassword',
                new: '#newPassword',
                confirm: '#confirmPassword'
            },
            
            profileFields: {
                username: '#username',
                email: '#email',
                phone: '#phone',
                department: '#department'
            },
            
            // 테이블 및 기타 요소
            assetTableSelector: '.table',
            profileImageSelector: '#profileImage',
            uploadImageSelector: '#uploadImageBtn',
            
            // API 엔드포인트
            endpoints: {
                changePassword: '/api/auth/change-password',
                updateProfile: '/api/auth/update-profile',
                uploadImage: '/api/auth/upload-image',
                userAssets: '/api/auth/user-assets'
            },
            
            // 검증 규칙
            validation: {
                minPasswordLength: 8,
                maxPasswordLength: 50,
                passwordPattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
            },
            
            ...config
        };
        
        this.cleanupFunctions = [];
        this.currentUser = null;
        
        this.initialize();
    }
    
    /**
     * AuthProfile 초기화
     */
    initialize() {
        // 비밀번호 변경 모달 초기화
        const passwordCleanup = this._setupPasswordModal();
        if (passwordCleanup) this.cleanupFunctions.push(passwordCleanup);
        
        // 프로필 정보 폼 초기화
        const profileCleanup = this._setupProfileForm();
        if (profileCleanup) this.cleanupFunctions.push(profileCleanup);
        
        // 자산 테이블 초기화
        const tableCleanup = this._setupAssetTable();
        if (tableCleanup) this.cleanupFunctions.push(tableCleanup);
        
        // 프로필 이미지 업로드 초기화
        const imageCleanup = this._setupProfileImage();
        if (imageCleanup) this.cleanupFunctions.push(imageCleanup);
        
        // 사용자 정보 로드
        this._loadUserData();
        
        console.log('AuthProfile 초기화됨');
    }
    
    /**
     * 비밀번호 변경 모달 설정
     * @returns {Function} 정리 함수
     */
    _setupPasswordModal() {
        const passwordForm = document.querySelector(this.config.passwordFormSelector);
        if (!passwordForm) return null;
        
        const newPasswordInput = document.querySelector(this.config.passwordFields.new);
        const confirmPasswordInput = document.querySelector(this.config.passwordFields.confirm);
        
        if (!newPasswordInput || !confirmPasswordInput) return null;
        
        // 폼 제출 핸들러
        const handleFormSubmit = async (e) => {
            e.preventDefault();
            
            try {
                const formData = this._collectPasswordData();
                await this._validatePassword(formData);
                await this._changePassword(formData);
                
                UIUtils.showAlert('비밀번호가 성공적으로 변경되었습니다.', 'success', 3000);
                UIUtils.hideModal('passwordModal');
                passwordForm.reset();
                
            } catch (error) {
                UIUtils.showAlert(error.message, 'danger', 5000);
            }
        };
        
        // 실시간 비밀번호 확인 검증
        const checkPasswordMatch = () => {
            if (!confirmPasswordInput.value) return;
            
            const isMatching = newPasswordInput.value === confirmPasswordInput.value;
            const isValid = this._validatePasswordStrength(newPasswordInput.value);
            
            // 비밀번호 강도 표시
            this._updatePasswordStrengthIndicator(newPasswordInput.value);
            
            // 확인 필드 스타일 업데이트
            if (isMatching && isValid) {
                confirmPasswordInput.classList.remove('is-invalid');
                confirmPasswordInput.classList.add('is-valid');
            } else {
                confirmPasswordInput.classList.remove('is-valid');
                confirmPasswordInput.classList.add('is-invalid');
            }
        };
        
        // 비밀번호 강도 검사
        const checkPasswordStrength = () => {
            this._updatePasswordStrengthIndicator(newPasswordInput.value);
            checkPasswordMatch();
        };
        
        // 이벤트 리스너 등록
        passwordForm.addEventListener('submit', handleFormSubmit);
        newPasswordInput.addEventListener('input', checkPasswordStrength);
        confirmPasswordInput.addEventListener('input', checkPasswordMatch);
        
        return () => {
            passwordForm.removeEventListener('submit', handleFormSubmit);
            newPasswordInput.removeEventListener('input', checkPasswordStrength);
            confirmPasswordInput.removeEventListener('input', checkPasswordMatch);
        };
    }
    
    /**
     * 프로필 정보 폼 설정
     * @returns {Function} 정리 함수
     */
    _setupProfileForm() {
        const profileForm = document.querySelector(this.config.profileFormSelector);
        if (!profileForm) return null;
        
        const handleFormSubmit = async (e) => {
            e.preventDefault();
            
            try {
                const formData = this._collectProfileData();
                await this._updateProfile(formData);
                
                UIUtils.showAlert('프로필이 성공적으로 업데이트되었습니다.', 'success', 3000);
                
            } catch (error) {
                UIUtils.showAlert(error.message, 'danger', 5000);
            }
        };
        
        // 실시간 유효성 검사
        const handleFieldChange = (e) => {
            const field = e.target;
            this._validateProfileField(field);
        };
        
        profileForm.addEventListener('submit', handleFormSubmit);
        profileForm.addEventListener('input', handleFieldChange);
        
        return () => {
            profileForm.removeEventListener('submit', handleFormSubmit);
            profileForm.removeEventListener('input', handleFieldChange);
        };
    }
    
    /**
     * 자산 테이블 설정
     * @returns {Function} 정리 함수
     */
    _setupAssetTable() {
        const table = document.querySelector(this.config.assetTableSelector);
        if (!table) return null;
        
        // TableUtils를 사용하여 테이블 행 클릭 이벤트 설정
        return TableUtils.initTableRowClick({
            tableSelector: this.config.assetTableSelector,
            rowSelector: 'tbody tr',
            ignoreTags: ['button', 'a', 'input'],
            dataAttribute: 'href',
            onRowClick: (url) => {
                if (url) {
                    window.location.href = url;
                }
            }
        });
    }
    
    /**
     * 프로필 이미지 업로드 설정
     * @returns {Function} 정리 함수
     */
    _setupProfileImage() {
        const uploadBtn = document.querySelector(this.config.uploadImageSelector);
        if (!uploadBtn) return null;
        
        // 공통 유틸리티 사용 가능 여부 확인
        if (typeof window.ImageUploadUtils !== 'undefined') {
            // 이미지 업로드 컨테이너 생성
            let imageContainer = document.getElementById('profileImageContainer');
            if (!imageContainer) {
                imageContainer = document.createElement('div');
                imageContainer.id = 'profileImageContainer';
                uploadBtn.parentNode.insertBefore(imageContainer, uploadBtn.nextSibling);
            }
            
            // 공통 유틸리티로 프로필 이미지 업로드 초기화
            const uploadController = window.ImageUploadUtils.createProfileUpload('profileImageContainer', {
                maxSize: 5 * 1024 * 1024, // 5MB
                allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
                previewSize: '150px',
                circular: true, // 프로필 이미지는 원형
                dragDrop: true,
                showFileName: false,
                showRemoveButton: true,
                onUpload: async (file) => {
                    try {
                        await this._uploadProfileImage(file);
                        UIUtils.showAlert('프로필 이미지가 업로드되었습니다.', 'success', 3000);
                    } catch (error) {
                        UIUtils.showAlert(error.message, 'danger', 5000);
                    }
                },
                onError: (message) => {
                    UIUtils.showAlert(message, 'warning', 3000);
                },
                onRemove: () => {
                    console.log('프로필 이미지 제거됨');
                }
            });
            
            // 기존 업로드 버튼 클릭 시 공통 업로드 영역 클릭
            const handleUploadClick = () => {
                const uploadArea = imageContainer.querySelector('.upload-area');
                if (uploadArea) {
                    uploadArea.click();
                }
            };
            
            uploadBtn.addEventListener('click', handleUploadClick);
            
            return () => {
                uploadBtn.removeEventListener('click', handleUploadClick);
                if (uploadController && uploadController.reset) {
                    uploadController.reset();
                }
            };
            
        } else {
            // 공통 유틸리티가 없는 경우 기본 방식 사용
            console.warn('ImageUploadUtils를 찾을 수 없습니다. 기본 업로드 방식을 사용합니다.');
            
        // 파일 입력 요소 생성 (숨김)
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
        
        const handleUploadClick = () => {
            fileInput.click();
        };
        
        const handleFileChange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            // 파일 크기 검증 (5MB 제한)
            if (file.size > 5 * 1024 * 1024) {
                UIUtils.showAlert('이미지 크기는 5MB 이하여야 합니다.', 'warning', 3000);
                return;
            }
            
            // 이미지 타입 검증
            if (!file.type.startsWith('image/')) {
                UIUtils.showAlert('이미지 파일만 업로드할 수 있습니다.', 'warning', 3000);
                return;
            }
            
            try {
                await this._uploadProfileImage(file);
                UIUtils.showAlert('프로필 이미지가 업로드되었습니다.', 'success', 3000);
            } catch (error) {
                UIUtils.showAlert(error.message, 'danger', 5000);
            }
        };
        
        uploadBtn.addEventListener('click', handleUploadClick);
        fileInput.addEventListener('change', handleFileChange);
        
        return () => {
            uploadBtn.removeEventListener('click', handleUploadClick);
            fileInput.removeEventListener('change', handleFileChange);
            if (fileInput.parentNode) {
                fileInput.parentNode.removeChild(fileInput);
            }
        };
        }
    }
    
    /**
     * 비밀번호 데이터 수집
     * @returns {Object} 비밀번호 데이터
     */
    _collectPasswordData() {
        return {
            currentPassword: document.querySelector(this.config.passwordFields.current)?.value || '',
            newPassword: document.querySelector(this.config.passwordFields.new)?.value || '',
            confirmPassword: document.querySelector(this.config.passwordFields.confirm)?.value || ''
        };
    }
    
    /**
     * 프로필 데이터 수집
     * @returns {Object} 프로필 데이터
     */
    _collectProfileData() {
        const data = {};
        
        Object.keys(this.config.profileFields).forEach(field => {
            const selector = this.config.profileFields[field];
            const element = document.querySelector(selector);
            if (element) {
                data[field] = element.value;
            }
        });
        
        return data;
    }
    
    /**
     * 비밀번호 검증
     * @param {Object} data 비밀번호 데이터
     */
    _validatePassword(data) {
        const errors = [];
        
        if (!data.currentPassword) {
            errors.push('현재 비밀번호를 입력해주세요.');
        }
        
        if (!data.newPassword) {
            errors.push('새 비밀번호를 입력해주세요.');
        }
        
        if (data.newPassword.length < this.config.validation.minPasswordLength) {
            errors.push(`비밀번호는 최소 ${this.config.validation.minPasswordLength}자 이상이어야 합니다.`);
        }
        
        if (!this.config.validation.passwordPattern.test(data.newPassword)) {
            errors.push('비밀번호는 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.');
        }
        
        if (data.newPassword !== data.confirmPassword) {
            errors.push('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
        }
        
        if (errors.length > 0) {
            throw new Error(errors.join('\n'));
        }
    }
    
    /**
     * 비밀번호 강도 검증
     * @param {string} password 비밀번호
     * @returns {boolean} 강도 검증 결과
     */
    _validatePasswordStrength(password) {
        return password.length >= this.config.validation.minPasswordLength &&
               this.config.validation.passwordPattern.test(password);
    }
    
    /**
     * 비밀번호 강도 표시기 업데이트
     * @param {string} password 비밀번호
     */
    _updatePasswordStrengthIndicator(password) {
        const indicator = document.querySelector('.password-strength');
        if (!indicator) return;
        
        let strength = 0;
        let message = '';
        
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[@$!%*?&]/.test(password)) strength++;
        
        switch (strength) {
            case 0:
            case 1:
                message = '매우 약함';
                indicator.className = 'password-strength weak';
                break;
            case 2:
                message = '약함';
                indicator.className = 'password-strength weak';
                break;
            case 3:
                message = '보통';
                indicator.className = 'password-strength medium';
                break;
            case 4:
                message = '강함';
                indicator.className = 'password-strength strong';
                break;
            case 5:
                message = '매우 강함';
                indicator.className = 'password-strength very-strong';
                break;
        }
        
        indicator.textContent = message;
    }
    
    /**
     * 프로필 필드 검증
     * @param {HTMLElement} field 필드 요소
     */
    _validateProfileField(field) {
        const value = field.value;
        let isValid = true;
        let message = '';
        
        switch (field.type) {
            case 'email':
                isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                message = '유효한 이메일 주소를 입력해주세요.';
                break;
            case 'tel':
                isValid = /^[0-9-+\s()]+$/.test(value);
                message = '유효한 전화번호를 입력해주세요.';
                break;
        }
        
        if (value && !isValid) {
            field.classList.add('is-invalid');
            field.classList.remove('is-valid');
        } else if (value) {
            field.classList.add('is-valid');
            field.classList.remove('is-invalid');
        } else {
            field.classList.remove('is-valid', 'is-invalid');
        }
    }
    
    /**
     * 비밀번호 변경 API 호출
     * @param {Object} data 비밀번호 데이터
     */
    async _changePassword(data) {
        try {
            const response = await ApiUtils.post(this.config.endpoints.changePassword, {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword
            });
            
            return response;
        } catch (error) {
            throw new Error('비밀번호 변경 중 오류가 발생했습니다: ' + error.message);
        }
    }
    
    /**
     * 프로필 업데이트 API 호출
     * @param {Object} data 프로필 데이터
     */
    async _updateProfile(data) {
        try {
            const response = await ApiUtils.put(this.config.endpoints.updateProfile, data);
            this.currentUser = { ...this.currentUser, ...data };
            return response;
        } catch (error) {
            throw new Error('프로필 업데이트 중 오류가 발생했습니다: ' + error.message);
        }
    }
    
    /**
     * 프로필 이미지 업로드 API 호출
     * @param {File} file 이미지 파일
     */
    async _uploadProfileImage(file) {
        try {
            const formData = new FormData();
            formData.append('image', file);
            
            const response = await ApiUtils.upload(this.config.endpoints.uploadImage, formData);
            
            // 이미지 미리보기 업데이트
            this._updateProfileImagePreview(response.imageUrl);
            
            return response;
        } catch (error) {
            throw new Error('이미지 업로드 중 오류가 발생했습니다: ' + error.message);
        }
    }
    
    /**
     * 프로필 이미지 미리보기 업데이트
     * @param {string} imageUrl 이미지 URL
     */
    _updateProfileImagePreview(imageUrl) {
        const profileImage = document.querySelector(this.config.profileImageSelector);
        if (profileImage) {
            profileImage.src = imageUrl;
        }
    }
    
    /**
     * 사용자 데이터 로드
     */
    async _loadUserData() {
        try {
            // 실제 프로젝트에서는 API에서 사용자 정보를 가져와야 함
            // 여기서는 페이지에 이미 렌더링된 정보를 사용
            this.currentUser = this._extractUserDataFromPage();
        } catch (error) {
            console.error('사용자 데이터 로드 오류:', error);
        }
    }
    
    /**
     * 페이지에서 사용자 데이터 추출
     * @returns {Object} 사용자 데이터
     */
    _extractUserDataFromPage() {
        const userData = {};
        
        Object.keys(this.config.profileFields).forEach(field => {
            const selector = this.config.profileFields[field];
            const element = document.querySelector(selector);
            if (element) {
                userData[field] = element.value;
            }
        });
        
        return userData;
    }
    
    /**
     * 현재 사용자 정보 반환
     * @returns {Object} 사용자 정보
     */
    getCurrentUser() {
        return this.currentUser;
    }
    
    /**
     * 리소스 정리
     */
    destroy() {
        this.cleanupFunctions.forEach(cleanup => {
            if (typeof cleanup === 'function') {
                cleanup();
            }
        });
        
        this.cleanupFunctions = [];
        
        console.log('AuthProfile 리소스 정리');
    }
}

export default AuthProfile; 