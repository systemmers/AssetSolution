/**
 * ExportUtils - 데이터 내보내기 유틸리티 모듈
 * 
 * 클라이언트 측 처리와 서버 측 처리를 모두 지원하는 하이브리드 접근법을 구현합니다.
 * 데이터 크기와 복잡성에 따라 적절한 처리 방식을 선택합니다.
 * 
 * @module ExportUtils
 */

import TableUtils from './table-utils.js';
import UIUtils from './ui-utils.js';

/**
 * 데이터 내보내기 유틸리티 객체
 */
const ExportUtils = {
    /**
     * 하이브리드 내보내기 - 데이터 크기와 형식에 따라 클라이언트 또는 서버 처리 선택
     * 
     * @param {Object} options - 내보내기 옵션
     * @param {string} options.format - 내보내기 형식 ('csv', 'excel', 'json')
     * @param {string} options.resourceType - 리소스 유형 ('assets', 'users', 'inventory')
     * @param {string} options.filename - 파일명 (확장자 제외)
     * @param {Object} options.filters - 필터링 조건 객체
     * @param {string} options.tableSelector - 테이블 선택자 (클라이언트 측 처리 시 사용)
     * @param {number} options.rowCount - 데이터 행 수 (접근 방식 결정에 사용)
     * @param {boolean} options.forceClient - 클라이언트 측 처리 강제 여부
     * @param {boolean} options.forceServer - 서버 측 처리 강제 여부
     * @param {Object} options.clientOptions - 클라이언트 측 처리 추가 옵션
     * @param {Object} options.serverOptions - 서버 측 처리 추가 옵션
     * @param {Function} options.onSuccess - 성공 시 콜백 함수
     * @param {Function} options.onError - 오류 시 콜백 함수
     * @returns {Promise<boolean>} 내보내기 성공 여부
     */
    exportData: async function(options) {
        const {
            format = 'csv',
            resourceType,
            filename,
            filters = {},
            tableSelector,
            rowCount = 0,
            forceClient = false,
            forceServer = false,
            clientOptions = {},
            serverOptions = {},
            onSuccess = null,
            onError = null
        } = options;

        try {
            // 데이터 처리 방식 결정 (클라이언트 vs 서버)
            const useClientSide = this._shouldUseClientSide({
                rowCount,
                format,
                resourceType,
                forceClient,
                forceServer
            });

            if (useClientSide) {
                // 클라이언트 측 처리
                await this._exportClientSide({
                    format,
                    tableSelector,
                    filename,
                    ...clientOptions
                });
            } else {
                // 서버 측 처리
                await this._exportServerSide({
                    format,
                    resourceType,
                    filename,
                    filters,
                    ...serverOptions
                });
            }

            // 성공 콜백 호출
            if (typeof onSuccess === 'function') {
                onSuccess();
            }
            
            return true;
        } catch (error) {
            console.error('내보내기 중 오류 발생:', error);
            
            // 오류 메시지 표시
            UIUtils.showAlert(`내보내기 중 오류가 발생했습니다: ${error.message}`, 'danger');
            
            // 오류 콜백 호출
            if (typeof onError === 'function') {
                onError(error);
            }
            
            return false;
        }
    },

    /**
     * 클라이언트 측 처리를 사용해야 하는지 결정
     * 
     * @param {Object} options - 옵션 객체
     * @param {number} options.rowCount - 데이터 행 수
     * @param {string} options.format - 내보내기 형식
     * @param {string} options.resourceType - 리소스 유형
     * @param {boolean} options.forceClient - 클라이언트 측 처리 강제 여부
     * @param {boolean} options.forceServer - 서버 측 처리 강제 여부
     * @returns {boolean} 클라이언트 측 처리 여부
     * @private
     */
    _shouldUseClientSide: function({ rowCount, format, resourceType, forceClient, forceServer }) {
        // 명시적 강제 설정이 있는 경우
        if (forceClient) return true;
        if (forceServer) return false;

        // 행 수 기준 - 100행 초과 시 서버 측 처리
        const ROW_THRESHOLD = 100;
        if (rowCount > ROW_THRESHOLD) return false;

        // Excel 포맷은 복잡도가 높아 서버 처리가 유리할 수 있음
        // 단, 간단한 형태의 작은 데이터는 클라이언트에서 처리
        if (format === 'excel' && rowCount > 50) return false;

        // 리소스 유형별 특수 규칙
        if (resourceType === 'reports' || resourceType === 'analytics') {
            // 보고서나 분석 데이터는 서버 측 처리 권장
            return false;
        }

        // 기본적으로 클라이언트 측 처리
        return true;
    },

    /**
     * 클라이언트 측 데이터 내보내기 처리
     * 
     * @param {Object} options - 내보내기 옵션
     * @returns {Promise<void>}
     * @private
     */
    _exportClientSide: async function(options) {
        const {
            format,
            tableSelector,
            filename,
            excludeColumns = [],
            customHeaders = null,
            includeHiddenRows = false,
            styleOptions = {},
            transform = null
        } = options;

        if (!tableSelector) {
            throw new Error('테이블 선택자가 제공되지 않았습니다.');
        }

        const exportOptions = {
            excludeColumns,
            customHeaders,
            includeHiddenRows,
            beforeExport: (table) => {
                console.log(`클라이언트 측 ${format} 내보내기 시작`);
            }
        };

        // 형식에 따른 처리
        switch (format.toLowerCase()) {
            case 'csv':
                TableUtils.exportTableToCsv(tableSelector, filename, exportOptions);
                break;
                
            case 'excel':
            case 'xlsx':
                TableUtils.exportTableToExcel(tableSelector, filename, {
                    ...exportOptions,
                    styleOptions
                });
                break;
                
            case 'json':
                TableUtils.exportTableToJson(tableSelector, {
                    ...exportOptions,
                    download: true,
                    filename,
                    transform
                });
                break;
                
            default:
                throw new Error(`지원하지 않는 내보내기 형식: ${format}`);
        }
    },

    /**
     * 서버 측 데이터 내보내기 처리
     * 
     * @param {Object} options - 내보내기 옵션
     * @returns {Promise<void>}
     * @private
     */
    _exportServerSide: async function(options) {
        const {
            format,
            resourceType,
            filename,
            filters = {},
            useModal = true,
            modalOptions = {}
        } = options;

        if (!resourceType) {
            throw new Error('리소스 유형이 제공되지 않았습니다.');
        }

        // 대화 상자로 사용자에게 알림
        if (useModal) {
            UIUtils.showAlert(`서버에서 ${format.toUpperCase()} 파일을 생성 중입니다. 잠시 기다려주세요.`, 'info');
        }

        try {
            // 서버 API 엔드포인트 구성
            const endpoint = `/api/export/${resourceType}`;
            
            // 쿼리 파라미터 구성
            const params = new URLSearchParams({
                format,
                filename: filename || `${resourceType}_export`,
                ...this._flattenFilters(filters)
            });
            
            // 서버 요청
            const response = await fetch(`${endpoint}?${params}`);
            
            if (!response.ok) {
                throw new Error(`서버 오류: ${response.status} ${response.statusText}`);
            }
            
            // 응답 형식에 따른 처리
            const contentType = response.headers.get('Content-Type');
            
            if (contentType && contentType.includes('application/json')) {
                // JSON 응답 처리 (오류 또는 메타데이터)
                const data = await response.json();
                
                if (!data.success) {
                    throw new Error(data.message || '내보내기 실패');
                }
                
                // 성공 메시지 표시
                UIUtils.showAlert(data.message || '내보내기가 완료되었습니다.', 'success');
                
            } else {
                // 파일 다운로드 처리
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                
                // 다운로드 링크 생성 및 클릭
                const link = document.createElement('a');
                link.href = url;
                
                // 파일명 추출
                const contentDisposition = response.headers.get('Content-Disposition');
                const serverFilename = contentDisposition
                    ? this._extractFilenameFromHeader(contentDisposition)
                    : `${filename || resourceType}.${format}`;
                
                link.download = serverFilename;
                link.style.display = 'none';
                
                document.body.appendChild(link);
                link.click();
                
                // 리소스 정리
                setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }, 100);
            }
        } catch (error) {
            throw new Error(`서버 측 내보내기 실패: ${error.message}`);
        }
    },

    /**
     * 필터 객체를 URL 쿼리 파라미터 형식으로 평탄화
     * 
     * @param {Object} filters - 필터 객체
     * @returns {Object} 평탄화된 필터 객체
     * @private
     */
    _flattenFilters: function(filters) {
        const result = {};
        
        Object.entries(filters).forEach(([key, value]) => {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                // 중첩된 객체 처리
                Object.entries(value).forEach(([subKey, subValue]) => {
                    result[`filter[${key}][${subKey}]`] = subValue;
                });
            } else {
                // 단일 값 처리
                result[`filter[${key}]`] = value;
            }
        });
        
        return result;
    },

    /**
     * Content-Disposition 헤더에서 파일명 추출
     * 
     * @param {string} header - Content-Disposition 헤더 값
     * @returns {string} 파일명
     * @private
     */
    _extractFilenameFromHeader: function(header) {
        // "attachment; filename=example.csv" 또는 "attachment; filename*=UTF-8''example.csv" 형식 처리
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(header);
        
        if (matches && matches[1]) {
            return matches[1].replace(/['"]/g, '');
        }
        
        // UTF-8 인코딩된 파일명 처리
        const filenameExtendedRegex = /filename\*=UTF-8''([^;\n]*)/;
        const extendedMatches = filenameExtendedRegex.exec(header);
        
        if (extendedMatches && extendedMatches[1]) {
            return decodeURIComponent(extendedMatches[1]);
        }
        
        return 'download';
    },

    /**
     * 내보내기 버튼 초기화 - TableUtils의 래퍼로 하이브리드 접근법 지원
     * 
     * @param {Object} options - 초기화 옵션
     * @param {string} options.buttonSelector - 내보내기 버튼 선택자
     * @param {string} options.tableSelector - 테이블 선택자
     * @param {string} options.resourceType - 리소스 유형 ('assets', 'users', 'inventory')
     * @param {string} options.filename - 저장할 파일명 (확장자 제외)
     * @param {string} options.format - 내보내기 형식 ('csv', 'excel', 'json')
     * @param {boolean} options.useHybrid - 하이브리드 접근법 사용 여부
     * @param {Object} options.exportOptions - 내보내기 관련 추가 옵션
     * @returns {Function} 정리 함수
     */
    initializeExportButton: function(options) {
        const {
            buttonSelector,
            tableSelector,
            resourceType,
            filename,
            format = 'csv',
            useHybrid = true,
            exportOptions = {}
        } = options;

        if (!buttonSelector) {
            console.warn('내보내기 버튼 선택자가 제공되지 않았습니다.');
            return () => {};
        }

        const button = document.querySelector(buttonSelector);
        if (!button) {
            console.warn(`내보내기 버튼을 찾을 수 없습니다: ${buttonSelector}`);
            return () => {};
        }

        // 내보내기 처리 함수
        const handleExport = async (e) => {
            e.preventDefault();
            
            try {
                // 테이블 관련 정보 수집
                const table = document.querySelector(tableSelector);
                const rowCount = table ? table.querySelectorAll('tbody tr').length : 0;
                
                if (useHybrid) {
                    // 하이브리드 접근법 사용 (클라이언트/서버 자동 선택)
                    await this.exportData({
                        format,
                        resourceType,
                        filename,
                        tableSelector,
                        rowCount,
                        clientOptions: exportOptions,
                        serverOptions: { useModal: true }
                    });
                } else {
                    // 클라이언트 측 처리만 사용 (기존 TableUtils 직접 호출)
                    this._exportClientSide({
                        format,
                        tableSelector,
                        filename,
                        ...exportOptions
                    });
                }
            } catch (error) {
                console.error('내보내기 중 오류 발생:', error);
                UIUtils.showAlert(`내보내기 중 오류가 발생했습니다: ${error.message}`, 'danger');
            }
        };
        
        // 이벤트 리스너 등록
        button.addEventListener('click', handleExport);
        
        // 정리 함수 반환
        return function cleanup() {
            button.removeEventListener('click', handleExport);
        };
    }
};

export default ExportUtils; 