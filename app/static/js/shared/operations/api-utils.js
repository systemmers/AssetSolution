/**
 * 공통 API 호출 유틸리티
 * 일관된 API 호출, 오류 처리, 로딩 상태 관리
 */

const ApiUtils = (function() {
    
    // constants.js에서 설정값 가져오기
    const TIMEOUTS = window.TIMEOUTS || { API_TIMEOUT: 30000 };
    
    // 기본 설정
    const DEFAULT_CONFIG = {
        timeout: TIMEOUTS.API_TIMEOUT,
        retries: 3,
        retryDelay: 1000,
        showLoading: true,
        showErrors: true,
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        }
    };

    /**
     * 공통 API 호출 함수
     * @param {string} url 요청 URL
     * @param {Object} options 요청 옵션
     * @returns {Promise} API 응답
     */
    async function request(url, options = {}) {
        const config = { ...DEFAULT_CONFIG, ...options };
        const controller = new AbortController();
        
        // 타임아웃 설정
        const timeoutId = setTimeout(() => controller.abort(), config.timeout);
        
        try {
            // 로딩 표시
            if (config.showLoading && config.loadingContainer) {
                if (window.NotificationUtils) {
                    window.NotificationUtils.showLoading(true, config.loadingMessage, config.loadingContainer);
                }
            }

            // 요청 옵션 설정
            const fetchOptions = {
                method: config.method || 'GET',
                headers: { ...DEFAULT_CONFIG.headers, ...config.headers },
                signal: controller.signal,
                ...config
            };

            // 요청 본문 설정
            if (config.data) {
                if (config.headers['Content-Type'] === 'application/json') {
                    fetchOptions.body = JSON.stringify(config.data);
                } else if (config.data instanceof FormData) {
                    fetchOptions.body = config.data;
                    // FormData 사용 시 Content-Type 헤더 제거 (브라우저가 자동 설정)
                    delete fetchOptions.headers['Content-Type'];
                }
            }

            // API 호출
            const response = await fetch(url, fetchOptions);
            clearTimeout(timeoutId);

            // 응답 처리
            return await handleResponse(response, config);

        } catch (error) {
            clearTimeout(timeoutId);
            return await handleError(error, url, options, config);
        } finally {
            // 로딩 숨김
            if (config.showLoading && config.loadingContainer) {
                if (window.NotificationUtils) {
                    window.NotificationUtils.showLoading(false, '', config.loadingContainer);
                }
            }
        }
    }

    /**
     * 응답 처리
     */
    async function handleResponse(response, config) {
        let data;
        
        try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }
        } catch (error) {
            data = null;
        }

        if (!response.ok) {
            const error = new Error(data?.message || `HTTP ${response.status}: ${response.statusText}`);
            error.status = response.status;
            error.data = data;
            throw error;
        }

        // 성공 알림
        if (config.successMessage && window.NotificationUtils) {
            window.NotificationUtils.showToast(config.successMessage, 'success');
        }

        return {
            data,
            status: response.status,
            headers: response.headers,
            ok: response.ok
        };
    }

    /**
     * 오류 처리
     */
    async function handleError(error, url, originalOptions, config) {
        // 재시도 로직
        if (config.retries > 0 && !error.name === 'AbortError') {
            await delay(config.retryDelay);
            return request(url, { ...originalOptions, retries: config.retries - 1 });
        }

        // 오류 메시지 표시
        if (config.showErrors && window.NotificationUtils) {
            let errorMessage = '요청 처리 중 오류가 발생했습니다.';
            
            if (error.name === 'AbortError') {
                errorMessage = '요청 시간이 초과되었습니다.';
            } else if (error.status === 401) {
                errorMessage = '인증이 필요합니다.';
            } else if (error.status === 403) {
                errorMessage = '접근 권한이 없습니다.';
            } else if (error.status === 404) {
                errorMessage = '요청한 리소스를 찾을 수 없습니다.';
            } else if (error.status >= 500) {
                errorMessage = '서버 오류가 발생했습니다.';
            } else if (error.message) {
                errorMessage = error.message;
            }

            window.NotificationUtils.showToast(errorMessage, 'error');
        }

        throw error;
    }

    /**
     * GET 요청
     */
    function get(url, options = {}) {
        return request(url, { ...options, method: 'GET' });
    }

    /**
     * POST 요청
     */
    function post(url, data, options = {}) {
        return request(url, { ...options, method: 'POST', data });
    }

    /**
     * PUT 요청
     */
    function put(url, data, options = {}) {
        return request(url, { ...options, method: 'PUT', data });
    }

    /**
     * DELETE 요청
     */
    function del(url, options = {}) {
        return request(url, { ...options, method: 'DELETE' });
    }

    /**
     * PATCH 요청
     */
    function patch(url, data, options = {}) {
        return request(url, { ...options, method: 'PATCH', data });
    }

    /**
     * 파일 업로드
     */
    function upload(url, formData, options = {}) {
        return request(url, {
            ...options,
            method: 'POST',
            data: formData,
            headers: {
                // FormData 사용 시 Content-Type 제거
                ...options.headers
            }
        });
    }

    /**
     * 파일 다운로드
     */
    async function download(url, filename, options = {}) {
        try {
            const response = await request(url, {
                ...options,
                showLoading: true,
                loadingMessage: '파일 다운로드 중...'
            });

            // Blob 생성
            const blob = new Blob([response.data]);
            
            // 다운로드 링크 생성
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename || 'download';
            
            // 다운로드 실행
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // URL 해제
            window.URL.revokeObjectURL(downloadUrl);

            if (window.NotificationUtils) {
                window.NotificationUtils.showToast('파일 다운로드가 완료되었습니다.', 'success');
            }

        } catch (error) {
            if (window.NotificationUtils) {
                window.NotificationUtils.showToast('파일 다운로드 중 오류가 발생했습니다.', 'error');
            }
            throw error;
        }
    }

    /**
     * 여러 요청 동시 실행
     */
    async function concurrent(requests) {
        try {
            const promises = requests.map(req => {
                if (typeof req === 'string') {
                    return get(req);
                } else {
                    return request(req.url, req.options);
                }
            });

            const results = await Promise.allSettled(promises);
            
            return results.map((result, index) => ({
                index,
                success: result.status === 'fulfilled',
                data: result.status === 'fulfilled' ? result.value : null,
                error: result.status === 'rejected' ? result.reason : null
            }));

        } catch (error) {
            throw error;
        }
    }

    /**
     * 요청 인터셉터 설정
     */
    function setRequestInterceptor(interceptor) {
        DEFAULT_CONFIG.requestInterceptor = interceptor;
    }

    /**
     * 응답 인터셉터 설정
     */
    function setResponseInterceptor(interceptor) {
        DEFAULT_CONFIG.responseInterceptor = interceptor;
    }

    /**
     * 기본 헤더 설정
     */
    function setDefaultHeaders(headers) {
        Object.assign(DEFAULT_CONFIG.headers, headers);
    }

    /**
     * CSRF 토큰 설정
     */
    function setCsrfToken(token) {
        DEFAULT_CONFIG.headers['X-CSRFToken'] = token;
    }

    /**
     * 인증 토큰 설정
     */
    function setAuthToken(token, type = 'Bearer') {
        DEFAULT_CONFIG.headers['Authorization'] = `${type} ${token}`;
    }

    /**
     * 지연 함수
     */
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * URL 파라미터 직렬화
     */
    function serializeParams(params) {
        const searchParams = new URLSearchParams();
        
        for (const [key, value] of Object.entries(params)) {
            if (value !== null && value !== undefined) {
                if (Array.isArray(value)) {
                    value.forEach(v => searchParams.append(key, v));
                } else {
                    searchParams.append(key, value);
                }
            }
        }
        
        return searchParams.toString();
    }

    /**
     * 쿼리 파라미터와 함께 GET 요청
     */
    function getWithParams(url, params, options = {}) {
        const queryString = serializeParams(params);
        const fullUrl = queryString ? `${url}?${queryString}` : url;
        return get(fullUrl, options);
    }

    // 공개 API
    return {
        request,
        get,
        post,
        put,
        delete: del,
        patch,
        upload,
        download,
        concurrent,
        getWithParams,
        
        // 설정 함수들
        setRequestInterceptor,
        setResponseInterceptor,
        setDefaultHeaders,
        setCsrfToken,
        setAuthToken,
        
        // 유틸리티
        serializeParams,
        delay
    };

})();

// 전역 접근을 위한 window 객체에 추가
if (typeof window !== 'undefined') {
    window.ApiUtils = ApiUtils;
} 