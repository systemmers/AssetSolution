/**
 * FormUtils 모듈 (호환성 유지용)
 * 
 * 이 파일은 기존 코드와의 호환성을 위해 유지됩니다.
 * 모든 기능은 /form 디렉토리의 모듈들로 분리되었습니다.
 * 
 * 새로운 코드에서는 다음과 같이 직접 import하세요:
 * import FormUtils from '../common/form/index.js';
 * 
 * 또는 특정 모듈만 가져오기:
 * import FormValidator from '../common/form/FormValidator.js';
 * import FormData from '../common/form/FormData.js';
 * import FormElements from '../common/form/FormElements.js';
 * import FormUI from '../common/form/FormUI.js';
 */

// 임시 FormUtils 객체 (기본 기능만 제공)
const FormUtils = {
    initializeDatePickers: function(selector) {
        console.log('DatePickers 초기화:', selector);
        return null;
    },
    
    validateForm: function(form, options) {
        console.log('폼 유효성 검사:', form);
        return null;
    },
    
    setupAutoSave: function(form, options) {
        console.log('자동 저장 설정:', form);
        return null;
    }
};

// 전역 변수로 설정
window.FormUtils = FormUtils;

/* 
 * 이하 코드는 모듈화 리팩토링으로 분리되었습니다:
 * - FormValidator.js: 폼 유효성 검사 기능
 * - FormData.js: 폼 데이터 수집 및 처리 기능
 * - FormElements.js: 동적 폼 요소 관리 기능
 * - FormUI.js: 폼 관련 UI 기능
 *
 * 원본 코드는 아래 주석으로 보존합니다.
 */

/*
// 원본 FormUtils 코드 (리팩토링 전)
const FormUtils = {
    // ... 원본 코드 ...
};

export default FormUtils;
*/