/**
 * ApiUtils - API 통신 관련 공통 유틸리티 모듈
 * 
 * AJAX 요청, 오류 처리, 로딩 상태 관리 등
 * API 통신 관련 기능을 제공하는 유틸리티 모듈입니다.
 * 
 * 함수 목록:
 * 
 * [1] HTTP 요청 메서드
 *   - get: GET 요청 실행
 *   - post: POST 요청 실행
 *   - put: PUT 요청 실행
 *   - patch: PATCH 요청 실행
 *   - remove: DELETE 요청 실행 (delete는 예약어라 remove 사용)
 *   - submitForm: 폼 데이터 제출
 * 
 * [2] 요청 관리
 *   - executeRequest: 실제 요청 실행 (내부 함수)
 *   - cancelRequest: 진행 중인 요청 취소
 *   - updateSettings: 전역 설정 업데이트
 * 
 * [3] 내부 유틸리티 함수
 *   - mergeSettings: 설정 병합
 *   - generateRequestId: 요청 ID 생성
 *   - handleTimeout: 요청 타임아웃 처리
 *   - handleLoader: 로딩 표시기 처리
 *   - handleErrorResponse: 오류 응답 처리
 *   - handleNetworkError: 네트워크 오류 처리
 */

// UIUtils는 전역 변수로 사용

const ApiUtils = (function() {
    // 진행 중인 요청 목록 (취소 기능 지원용)
    const pendingRequests = new Map();
    
    // 전역 설정
    const defaultSettings = {
        // 기본 헤더
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        // 타임아웃 (밀리초)
        timeout: 30000,
        // 로딩 표시 여부
        showLoader: true,
        // 로딩 표시기 선택자
        loaderSelector: '.loading-indicator',
        // 기본 오류 처리 여부
        handleErrors: true,
        // 기본 오류 메시지
        defaultErrorMessage: '요청 처리 중 오류가 발생했습니다.',
        // 재시도 횟수
        retryCount: 0,
        // 재시도 간격 (밀리초)
        retryDelay: 1000,
        // CSRF 토큰 포함 여부
        includeCsrfToken: true,
        // CSRF 토큰 요소 선택자
        csrfTokenSelector: 'meta[name="csrf-token"]'
    };
    
    /**
     * 설정 병합
     * @param {Object} options - 사용자 지정 옵션
     * @returns {Object} 병합된 옵션
     * @private
     */
    function mergeSettings(options = {}) {
        // 헤더 별도 병합
        const headers = {
            ...defaultSettings.headers,
            ...(options.headers || {})
        };
        
        // CSRF 토큰 추가 (필요한 경우)
        if ((options.includeCsrfToken !== false) && defaultSettings.includeCsrfToken) {
            const csrfToken = document.querySelector(defaultSettings.csrfTokenSelector);
            if (csrfToken && csrfToken.content) {
                headers['X-CSRF-Token'] = csrfToken.content;
            }
        }
        
        // 설정 병합
        return {
            ...defaultSettings,
            ...options,
            headers
        };
    }
    
    /**
     * 요청 ID 생성
     * @returns {string} 고유 요청 ID
     * @private
     */
    function generateRequestId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    /**
     * 요청 타임아웃 처리
     * @param {number} timeout - 타임아웃 시간 (밀리초)
     * @returns {Object} 타임아웃 컨트롤러와 프로미스
     * @private
     */
    function handleTimeout(timeout) {
        // AbortController 생성
        const controller = new AbortController();
        
        // 타임아웃 설정
        const timeoutId = setTimeout(() => {
            controller.abort();
        }, timeout);
        
        return {
            controller,
            timeoutId,
            signal: controller.signal
        };
    }
    
    /**
     * 로딩 표시기 처리
     * @param {boolean} show - 표시 여부
     * @param {string} selector - 로딩 표시기 선택자
     * @private
     */
    function handleLoader(show, selector) {
        if (UIUtils && typeof UIUtils.toggleLoader === 'function') {
            UIUtils.toggleLoader(show, selector);
        } else {
            const loader = document.querySelector(selector);
            if (loader) {
                loader.style.display = show ? 'block' : 'none';
            }
        }
    }
    
    /**
     * 오류 응답 처리
     * @param {Response} response - Fetch API 응답 객체
     * @param {Object} settings - 요청 설정
     * @returns {Promise} 처리된 응답 프로미스
     * @private
     */
    async function handleErrorResponse(response, settings) {
        // 응답 본문 파싱 시도
        let errorData = null;
        try {
            const contentType = response.headers.get('Content-Type');
            
            if (contentType && contentType.includes('application/json')) {
                errorData = await response.json();
            } else {
                errorData = await response.text();
            }
        } catch (e) {
            errorData = { message: settings.defaultErrorMessage };
        }
        
        // 오류 객체 생성
        const error = new Error(
            errorData && errorData.message 
                ? errorData.message 
                : settings.defaultErrorMessage
        );
        
        error.status = response.status;
        error.statusText = response.statusText;
        error.data = errorData;
        error.response = response;
        
        // 기본 오류 처리
        if (settings.handleErrors && UIUtils && typeof UIUtils.showAlert === 'function') {
            let errorMessage = settings.defaultErrorMessage;
            
            if (errorData) {
                if (typeof errorData === 'string') {
                    errorMessage = errorData;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                } else if (errorData.error) {
                    errorMessage = errorData.error;
                }
            }
            
            UIUtils.showAlert(errorMessage, 'danger', 5000);
        }
        
        throw error;
    }
    
    /**
     * 네트워크 오류 처리
     * @param {Error} error - 오류 객체
     * @param {Object} settings - 요청 설정
     * @param {string} requestId - 요청 ID
     * @private
     */
    function handleNetworkError(error, settings, requestId) {
        // 요청 목록에서 제거
        pendingRequests.delete(requestId);
        
        // 타임아웃 오류
        if (error.name === 'AbortError') {
            const timeoutError = new Error('요청 시간이 초과되었습니다.');
            timeoutError.code = 'TIMEOUT_ERROR';
            
            if (settings.handleErrors && UIUtils && typeof UIUtils.showAlert === 'function') {
                UIUtils.showAlert('요청 시간이 초과되었습니다. 다시 시도해주세요.', 'warning');
            }
            
            throw timeoutError;
        }
        
        // 네트워크 오류
        const networkError = new Error('네트워크 연결 오류가 발생했습니다.');
        networkError.code = 'NETWORK_ERROR';
        networkError.originalError = error;
        
        if (settings.handleErrors && UIUtils && typeof UIUtils.showAlert === 'function') {
            UIUtils.showAlert('네트워크 연결 오류가 발생했습니다. 인터넷 연결을 확인해주세요.', 'danger');
        }
        
        throw networkError;
    }
    
    /**
     * HTTP 요청 실행
     * @param {string} url - 요청 URL
     * @param {Object} options - 요청 옵션
     * @returns {Promise} 응답 프로미스
     * @private
     */
    async function executeRequest(url, options = {}) {
        // 설정 병합
        const settings = mergeSettings(options);
        
        // 고유 요청 ID 생성
        const requestId = generateRequestId();
        
        // 타임아웃 설정
        const { controller, timeoutId, signal } = handleTimeout(settings.timeout);
        
        // 요청 옵션 구성
        const fetchOptions = {
            ...settings,
            signal,
            headers: settings.headers
        };
        
        // 진행 중인 요청 목록에 추가
        pendingRequests.set(requestId, controller);
        
        // 로딩 표시기 표시 (설정된 경우)
        if (settings.showLoader) {
            handleLoader(true, settings.loaderSelector);
        }
        
        try {
            // HTTP 요청 실행
            const response = await fetch(url, fetchOptions);
            
            // 타임아웃 타이머 해제
            clearTimeout(timeoutId);
            
            // 요청 목록에서 제거
            pendingRequests.delete(requestId);
            
            // 로딩 표시기 숨김
            if (settings.showLoader) {
                handleLoader(false, settings.loaderSelector);
            }
            
            // 응답 상태 확인
            if (!response.ok) {
                return handleErrorResponse(response, settings);
            }
            
            // 응답 본문 반환
            const contentType = response.headers.get('Content-Type');
            
            if (contentType && contentType.includes('application/json')) {
                return response.json();
            } else {
                return response.text();
            }
        } catch (error) {
            // 타임아웃 타이머 해제
            clearTimeout(timeoutId);
            
            // 로딩 표시기 숨김
            if (settings.showLoader) {
                handleLoader(false, settings.loaderSelector);
            }
            
            return handleNetworkError(error, settings, requestId);
        }
    }
    
    /**
     * GET 요청
     * @param {string} url - 요청 URL
     * @param {Object} [params={}] - 쿼리 파라미터
     * @param {Object} [options={}] - 요청 옵션
     * @returns {Promise} 응답 프로미스
     */
    function get(url, params = {}, options = {}) {
        // 쿼리 파라미터 구성
        const queryParams = new URLSearchParams();
        
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, value);
            }
        });
        
        // 쿼리 문자열 추가
        const queryString = queryParams.toString();
        const requestUrl = queryString ? `${url}?${queryString}` : url;
        
        // GET 요청 실행
        return executeRequest(requestUrl, {
            method: 'GET',
            ...options
        });
    }
    
    /**
     * POST 요청
     * @param {string} url - 요청 URL
     * @param {Object|FormData} [data={}] - 요청 데이터
     * @param {Object} [options={}] - 요청 옵션
     * @returns {Promise} 응답 프로미스
     */
    function post(url, data = {}, options = {}) {
        // 옵션 구성
        const requestOptions = {
            method: 'POST',
            ...options
        };
        
        // 요청 본문 설정
        if (data instanceof FormData) {
            // FormData인 경우 Content-Type 헤더 제거 (자동 설정)
            if (requestOptions.headers) {
                delete requestOptions.headers['Content-Type'];
            }
            
            requestOptions.body = data;
        } else {
            requestOptions.body = JSON.stringify(data);
        }
        
        // POST 요청 실행
        return executeRequest(url, requestOptions);
    }
    
    /**
     * PUT 요청
     * @param {string} url - 요청 URL
     * @param {Object|FormData} [data={}] - 요청 데이터
     * @param {Object} [options={}] - 요청 옵션
     * @returns {Promise} 응답 프로미스
     */
    function put(url, data = {}, options = {}) {
        // 옵션 구성
        const requestOptions = {
            method: 'PUT',
            ...options
        };
        
        // 요청 본문 설정
        if (data instanceof FormData) {
            // FormData인 경우 Content-Type 헤더 제거 (자동 설정)
            if (requestOptions.headers) {
                delete requestOptions.headers['Content-Type'];
            }
            
            requestOptions.body = data;
        } else {
            requestOptions.body = JSON.stringify(data);
        }
        
        // PUT 요청 실행
        return executeRequest(url, requestOptions);
    }
    
    /**
     * PATCH 요청
     * @param {string} url - 요청 URL
     * @param {Object|FormData} [data={}] - 요청 데이터
     * @param {Object} [options={}] - 요청 옵션
     * @returns {Promise} 응답 프로미스
     */
    function patch(url, data = {}, options = {}) {
        // 옵션 구성
        const requestOptions = {
            method: 'PATCH',
            ...options
        };
        
        // 요청 본문 설정
        if (data instanceof FormData) {
            // FormData인 경우 Content-Type 헤더 제거 (자동 설정)
            if (requestOptions.headers) {
                delete requestOptions.headers['Content-Type'];
            }
            
            requestOptions.body = data;
        } else {
            requestOptions.body = JSON.stringify(data);
        }
        
        // PATCH 요청 실행
        return executeRequest(url, requestOptions);
    }
    
    /**
     * DELETE 요청
     * @param {string} url - 요청 URL
     * @param {Object} [options={}] - 요청 옵션
     * @returns {Promise} 응답 프로미스
     */
    function remove(url, options = {}) {
        // DELETE 요청 실행
        return executeRequest(url, {
            method: 'DELETE',
            ...options
        });
    }
    
    /**
     * 폼 데이터 제출
     * @param {string} url - 요청 URL
     * @param {HTMLFormElement} form - 폼 요소
     * @param {Object} [options={}] - 요청 옵션
     * @returns {Promise} 응답 프로미스
     */
    function submitForm(url, form, options = {}) {
        if (!form || !(form instanceof HTMLFormElement)) {
            throw new Error('유효한 폼 요소가 아닙니다.');
        }
        
        // 폼 데이터 생성
        const formData = new FormData(form);
        
        // 요청 메서드 결정 (폼 method 속성 또는 기본값 POST 사용)
        const method = (form.method && form.method.toUpperCase()) || 'POST';
        
        // 메서드에 따른 요청 실행
        switch (method) {
            case 'GET':
                // GET 요청: FormData를 쿼리 파라미터로 변환
                const params = {};
                for (const [key, value] of formData.entries()) {
                    params[key] = value;
                }
                return get(url, params, options);
                
            case 'PUT':
                return put(url, formData, options);
                
            case 'PATCH':
                return patch(url, formData, options);
                
            case 'DELETE':
                return remove(url, {
                    body: formData,
                    ...options
                });
                
            case 'POST':
            default:
                return post(url, formData, options);
        }
    }
    
    /**
     * 진행 중인 요청 취소
     * @param {string} [requestId] - 취소할 요청 ID (지정하지 않으면 모든 요청 취소)
     */
    function cancelRequest(requestId) {
        if (requestId && pendingRequests.has(requestId)) {
            // 특정 요청만 취소
            pendingRequests.get(requestId).abort();
            pendingRequests.delete(requestId);
        } else if (!requestId) {
            // 모든 요청 취소
            pendingRequests.forEach(controller => controller.abort());
            pendingRequests.clear();
        }
    }
    
    /**
     * 전역 설정 업데이트
     * @param {Object} settings - 새 설정 값
     */
    function updateSettings(settings = {}) {
        // 헤더 별도 병합
        if (settings.headers) {
            defaultSettings.headers = {
                ...defaultSettings.headers,
                ...settings.headers
            };
        }
        
        // 나머지 설정 병합
        Object.entries(settings).forEach(([key, value]) => {
            if (key !== 'headers') {
                defaultSettings[key] = value;
            }
        });
    }
    
    // 공개 API
    return {
        get,
        post,
        put,
        patch,
        delete: remove,
        submitForm,
        cancelRequest,
        updateSettings
    };
})();

// 전역 변수로 설정
window.ApiUtils = ApiUtils; 