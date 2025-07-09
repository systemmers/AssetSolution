/**
 * 사용자 폼 유효성 검사 관리 모듈
 * @module users/form/validation-manager
 */
import FormUtils from '../../../../common/form-utils.js';
import UIUtils from '../../../../common/ui-utils.js';

/**
 * 폼 유효성 검사 초기화
 * @returns {Function} 이벤트 정리 함수
 */
export function initFormValidation() {
    const form = document.getElementById('userForm');
    if (!form) return null;
    
    const cleanupFuncs = [];
    
    // 기본 폼 유효성 검사 설정
    const formValidatorCleanup = FormUtils.initFormValidation(form, {
        // 사용자 정의 유효성 검사 규칙
        rules: {
            'userId': {
                required: true,
                minLength: 4,
                pattern: /^[a-zA-Z0-9_]+$/,
                message: '사용자 ID는 4자 이상의 영문, 숫자, 언더스코어만 허용됩니다.'
            },
            'email': {
                required: true,
                pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: '유효한 이메일 주소를 입력해주세요.'
            },
            'name': {
                required: true,
                minLength: 2,
                message: '이름은 최소 2자 이상 입력해주세요.'
            },
            'phone': {
                pattern: /^[0-9-+\s()]+$/,
                message: '유효한 전화번호 형식을 입력해주세요.'
            }
        },
        // 폼 유효성 검사 성공 시 콜백
        onSuccess: function(formData) {
            console.log('폼 유효성 검사 통과:', formData);
            return true; // 폼 제출 계속 진행
        }
    });
    
    if (formValidatorCleanup) cleanupFuncs.push(formValidatorCleanup);
    
    // 실시간 유효성 검사 설정
    const userIdField = form.querySelector('#userId');
    const emailField = form.querySelector('#email');
    
    if (userIdField) {
        const userIdInputHandler = function() {
            const value = this.value.trim();
            if (value.length > 0) {
                if (value.length < 4) {
                    FormUtils.setFieldValidState(this, false, '사용자 ID는 최소 4자 이상이어야 합니다.');
                } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                    FormUtils.setFieldValidState(this, false, '영문, 숫자, 언더스코어만 사용 가능합니다.');
                } else {
                    FormUtils.setFieldValidState(this, true, '사용 가능한 ID 형식입니다.');
                }
            } else {
                FormUtils.resetFieldState(this);
            }
        };
        
        userIdField.addEventListener('input', userIdInputHandler);
        cleanupFuncs.push(() => userIdField.removeEventListener('input', userIdInputHandler));
    }
    
    if (emailField) {
        const emailInputHandler = function() {
            const value = this.value.trim();
            if (value.length > 0) {
                const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                if (emailPattern.test(value)) {
                    FormUtils.setFieldValidState(this, true, '유효한 이메일 형식입니다.');
                } else {
                    FormUtils.setFieldValidState(this, false, '유효하지 않은 이메일 형식입니다.');
                }
            } else {
                FormUtils.resetFieldState(this);
            }
        };
        
        emailField.addEventListener('input', emailInputHandler);
        cleanupFuncs.push(() => emailField.removeEventListener('input', emailInputHandler));
    }
    
    // 정리 함수 반환
    return function cleanup() {
        cleanupFuncs.forEach(fn => typeof fn === 'function' && fn());
    };
} 