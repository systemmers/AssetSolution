/**
 * 테이블 내보내기 모듈
 * 테이블 데이터를 CSV, Excel, JSON 형식으로 내보내는 기능을 제공합니다.
 * 
 * @module common/table/TableExport
 * @exports TableExport
 * 
 * @example
 * // 모듈 가져오기
 * import { TableExport } from '../common/table/index.js';
 * 
 * // 또는 직접 가져오기
 * import TableExport from '../common/table/TableExport.js';
 * 
 * // CSV로 내보내기
 * TableExport.exportTableToCsv('#userTable', 'users.csv', {
 *   includeHeaders: true,
 *   useBOM: true
 * });
 * 
 * // Excel로 내보내기
 * TableExport.exportTableToExcel('#userTable', 'users.xls', {
 *   sheetName: '사용자 목록',
 *   exportStyles: true
 * });
 * 
 * // JSON으로 내보내기
 * const jsonData = TableExport.exportTableToJson('#userTable', {
 *   includeHeaders: true,
 *   keyCase: 'camel'
 * });
 * 
 * // 내보내기 버튼 초기화
 * TableExport.initializeExportButton({
 *   buttonSelector: '#exportBtn',
 *   tableSelector: '#userTable',
 *   exportType: 'excel'
 * });
 */

const TableExport = (function() {
    /**
     * 테이블을 CSV 형식으로 내보냅니다.
     * 
     * @param {string} tableSelector - 내보낼 테이블 선택자
     * @param {string} filename - 저장할 파일명
     * @param {Object} [options={}] - 내보내기 옵션
     * @param {boolean} [options.includeHeaders=true] - 헤더 포함 여부
     * @param {boolean} [options.exportHiddenColumns=false] - 숨겨진 열 포함 여부
     * @param {boolean} [options.exportHiddenRows=false] - 숨겨진 행 포함 여부
     * @param {string} [options.delimiter=','] - CSV 구분자
     * @param {boolean} [options.useBOM=true] - BOM(Byte Order Mark) 사용 여부 (한글 등 유니코드 지원)
     * @param {Function} [options.beforeExport] - 내보내기 전 호출될 콜백 함수
     * @param {Function} [options.afterExport] - 내보내기 후 호출될 콜백 함수
     * @returns {boolean} 내보내기 성공 여부
     * @throws {Error} 테이블을 찾을 수 없는 경우 또는 내보내기 중 오류 발생 시
     * 
     * @example
     * // 기본 설정으로 내보내기
     * TableExport.exportTableToCsv('#userTable', 'users.csv');
     * 
     * // 고급 설정으로 내보내기
     * TableExport.exportTableToCsv('#userTable', 'users.csv', {
     *   includeHeaders: true,
     *   exportHiddenColumns: true,
     *   exportHiddenRows: false,
     *   delimiter: ';',
     *   useBOM: true,
     *   beforeExport: () => console.log('내보내기 시작'),
     *   afterExport: () => console.log('내보내기 완료')
     * });
     */
    function exportTableToCsv(tableSelector, filename, options = {}) {
        // 기본 옵션
        const defaultOptions = {
            includeHeaders: true,
            exportHiddenColumns: false,
            exportHiddenRows: false,
            delimiter: ',',
            useBOM: true,
            beforeExport: null,
            afterExport: null
        };
        
        const settings = { ...defaultOptions, ...options };
        
        try {
            // 내보내기 전 콜백 호출
            if (typeof settings.beforeExport === 'function') {
                settings.beforeExport();
            }
            
            const table = document.querySelector(tableSelector);
            if (!table) {
                console.error(`테이블을 찾을 수 없습니다: ${tableSelector}`);
                return false;
            }
            
            // 테이블 데이터 준비
            const rows = Array.from(table.querySelectorAll('tr'));
            const csvRows = [];
            
            // 행 처리
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                
                // 숨겨진 행 처리
                if (!settings.exportHiddenRows && row.style.display === 'none') {
                    continue;
                }
                
                // 헤더 처리
                const isHeader = row.parentElement.tagName.toLowerCase() === 'thead';
                if (!settings.includeHeaders && isHeader) {
                    continue;
                }
                
                const cells = Array.from(row.querySelectorAll('th, td'));
                const csvCells = [];
                
                // 셀 처리
                for (let j = 0; j < cells.length; j++) {
                    const cell = cells[j];
                    
                    // 숨겨진 열 처리
                    if (!settings.exportHiddenColumns && 
                        (cell.style.display === 'none' || 
                         cell.classList.contains('hidden') || 
                         cell.getAttribute('data-exportable') === 'false')) {
                        continue;
                    }
                    
                    // 셀 내용 가져오기 (data-export-value 속성 사용 또는 텍스트 내용)
                    let content = cell.hasAttribute('data-export-value') 
                        ? cell.getAttribute('data-export-value') 
                        : cell.textContent;
                    
                    content = content.trim().replace(/\n/g, ' ');
                    
                    // 따옴표로 감싸고 이스케이프
                    if (content.includes('"') || content.includes(settings.delimiter) || content.includes('\n')) {
                        content = '"' + content.replace(/"/g, '""') + '"';
                    }
                    
                    csvCells.push(content);
                }
                
                // 행 추가 (셀을 구분자로 결합)
                if (csvCells.length > 0) {
                    csvRows.push(csvCells.join(settings.delimiter));
                }
            }
            
            // CSV 문자열 생성
            let csvStr = csvRows.join('\n');
            
            // BOM 추가 (Excel 한글 지원)
            if (settings.useBOM) {
                csvStr = '\ufeff' + csvStr;
            }
            
            // 파일 다운로드
            const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
            _downloadBlob(blob, filename || 'export.csv');
            
            // 내보내기 후 콜백 호출
            if (typeof settings.afterExport === 'function') {
                settings.afterExport();
            }
            
            return true;
        } catch (error) {
            console.error('테이블 CSV 내보내기 오류:', error);
            return false;
        }
    }
    
    /**
     * 테이블을 Excel 형식으로 내보냅니다.
     * 
     * @param {string} tableSelector - 내보낼 테이블 선택자
     * @param {string} filename - 저장할 파일명
     * @param {Object} [options={}] - 내보내기 옵션
     * @param {boolean} [options.includeHeaders=true] - 헤더 포함 여부
     * @param {boolean} [options.exportHiddenColumns=false] - 숨겨진 열 포함 여부
     * @param {boolean} [options.exportHiddenRows=false] - 숨겨진 행 포함 여부
     * @param {string} [options.sheetName='Sheet1'] - 시트 이름
     * @param {boolean} [options.exportStyles=true] - 스타일 포함 여부
     * @param {Function} [options.beforeExport] - 내보내기 전 호출될 콜백 함수
     * @param {Function} [options.afterExport] - 내보내기 후 호출될 콜백 함수
     * @returns {boolean} 내보내기 성공 여부
     * @throws {Error} 테이블을 찾을 수 없는 경우 또는 내보내기 중 오류 발생 시
     * 
     * @example
     * // 기본 설정으로 내보내기
     * TableExport.exportTableToExcel('#userTable', 'users.xls');
     * 
     * // 고급 설정으로 내보내기
     * TableExport.exportTableToExcel('#userTable', 'users.xls', {
     *   includeHeaders: true,
     *   exportHiddenColumns: true,
     *   exportHiddenRows: false,
     *   sheetName: '사용자 목록',
     *   exportStyles: true,
     *   beforeExport: () => console.log('내보내기 시작'),
     *   afterExport: () => console.log('내보내기 완료')
     * });
     */
    function exportTableToExcel(tableSelector, filename, options = {}) {
        // 기본 옵션
        const defaultOptions = {
            includeHeaders: true,
            exportHiddenColumns: false,
            exportHiddenRows: false,
            sheetName: 'Sheet1',
            exportStyles: true,
            beforeExport: null,
            afterExport: null
        };
        
        const settings = { ...defaultOptions, ...options };
        
        try {
            // 내보내기 전 콜백 호출
            if (typeof settings.beforeExport === 'function') {
                settings.beforeExport();
            }
            
            const table = document.querySelector(tableSelector);
            if (!table) {
                console.error(`테이블을 찾을 수 없습니다: ${tableSelector}`);
                return false;
            }
            
            // HTML 형식의 Excel 파일 생성
            let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
    <meta charset="UTF-8">
    <!--[if gte mso 9]>
    <xml>
        <x:ExcelWorkbook>
            <x:ExcelWorksheets>
                <x:ExcelWorksheet>
                    <x:Name>${settings.sheetName}</x:Name>
                    <x:WorksheetOptions>
                        <x:DisplayGridlines/>
                    </x:WorksheetOptions>
                </x:ExcelWorksheet>
            </x:ExcelWorksheets>
        </x:ExcelWorkbook>
    </xml>
    <![endif]-->
    <style>
        table { border-collapse: collapse; }
        table, th, td { border: 1px solid black; }
        th { background-color: #f2f2f2; font-weight: bold; }
    </style>
</head>
<body>
    <table>`;
            
            // 테이블 데이터 추가
            const rows = Array.from(table.querySelectorAll('tr'));
            
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                
                // 숨겨진 행 처리
                if (!settings.exportHiddenRows && row.style.display === 'none') {
                    continue;
                }
                
                // 헤더 처리
                const isHeader = row.parentElement.tagName.toLowerCase() === 'thead';
                if (!settings.includeHeaders && isHeader) {
                    continue;
                }
                
                html += '<tr>';
                
                const cells = Array.from(row.querySelectorAll('th, td'));
                
                for (let j = 0; j < cells.length; j++) {
                    const cell = cells[j];
                    
                    // 숨겨진 열 처리
                    if (!settings.exportHiddenColumns && 
                        (cell.style.display === 'none' || 
                         cell.classList.contains('hidden') || 
                         cell.getAttribute('data-exportable') === 'false')) {
                        continue;
                    }
                    
                    // 셀 내용 가져오기 (data-export-value 속성 사용 또는 텍스트/HTML 내용)
                    let content = cell.hasAttribute('data-export-value') 
                        ? cell.getAttribute('data-export-value') 
                        : cell.textContent;
                    
                    const tagName = isHeader ? 'th' : 'td';
                    
                    // 셀 병합 정보
                    const colspan = cell.getAttribute('colspan');
                    const rowspan = cell.getAttribute('rowspan');
                    
                    let cellAttrs = '';
                    if (colspan) cellAttrs += ` colspan="${colspan}"`;
                    if (rowspan) cellAttrs += ` rowspan="${rowspan}"`;
                    
                    // 스타일 정보 (설정한 경우)
                    if (settings.exportStyles) {
                        const styles = _getComputedStyles(cell);
                        if (styles) {
                            cellAttrs += ` style="${styles}"`;
                        }
                    }
                    
                    html += `<${tagName}${cellAttrs}>${content}</${tagName}>`;
                }
                
                html += '</tr>';
            }
            
            html += `</table>
</body>
</html>`;
            
            // 파일 다운로드
            const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
            _downloadBlob(blob, filename || 'export.xls');
            
            // 내보내기 후 콜백 호출
            if (typeof settings.afterExport === 'function') {
                settings.afterExport();
            }
            
            return true;
        } catch (error) {
            console.error('테이블 Excel 내보내기 오류:', error);
            return false;
        }
    }
    
    /**
     * 테이블을 JSON 형식으로 내보냅니다.
     * 
     * @param {string} tableSelector - 내보낼 테이블 선택자
     * @param {Object} [options={}] - 내보내기 옵션
     * @param {boolean} [options.includeHeaders=true] - 헤더 포함 여부
     * @param {boolean} [options.exportHiddenColumns=false] - 숨겨진 열 포함 여부
     * @param {boolean} [options.exportHiddenRows=false] - 숨겨진 행 포함 여부
     * @param {string} [options.keyCase='snake'] - 키 케이스 ('snake', 'camel', 'pascal')
     * @param {Function} [options.valueTransform] - 값 변환 함수
     * @param {Function} [options.beforeExport] - 내보내기 전 호출될 콜백 함수
     * @param {Function} [options.afterExport] - 내보내기 후 호출될 콜백 함수
     * @returns {Object[]} JSON 데이터 배열
     * @throws {Error} 테이블을 찾을 수 없는 경우 또는 내보내기 중 오류 발생 시
     * 
     * @example
     * // 기본 설정으로 내보내기
     * const jsonData = TableExport.exportTableToJson('#userTable');
     * 
     * // 고급 설정으로 내보내기
     * const jsonData = TableExport.exportTableToJson('#userTable', {
     *   includeHeaders: true,
     *   exportHiddenColumns: true,
     *   exportHiddenRows: false,
     *   keyCase: 'camel',
     *   valueTransform: (value, header) => {
     *     if (header === 'age') return parseInt(value);
     *     if (header === 'active') return value === 'true';
     *     return value;
     *   },
     *   beforeExport: () => console.log('내보내기 시작'),
     *   afterExport: () => console.log('내보내기 완료')
     * });
     */
    function exportTableToJson(tableSelector, options = {}) {
        // 기본 옵션
        const defaultOptions = {
            download: true,
            filename: 'export.json',
            useHeaders: true,
            exportHiddenColumns: false,
            exportHiddenRows: false,
            transform: null,
            pretty: true
        };
        
        const settings = { ...defaultOptions, ...options };
        
        try {
            const table = document.querySelector(tableSelector);
            if (!table) {
                console.error(`테이블을 찾을 수 없습니다: ${tableSelector}`);
                return false;
            }
            
            // 헤더 추출
            const headerRow = table.querySelector('thead tr');
            const headers = [];
            
            if (headerRow && settings.useHeaders) {
                const headerCells = Array.from(headerRow.querySelectorAll('th'));
                
                for (let i = 0; i < headerCells.length; i++) {
                    const cell = headerCells[i];
                    
                    // 숨겨진 열 처리
                    if (!settings.exportHiddenColumns && 
                        (cell.style.display === 'none' || 
                         cell.classList.contains('hidden') || 
                         cell.getAttribute('data-exportable') === 'false')) {
                        continue;
                    }
                    
                    // 헤더 이름 가져오기 (data-field 속성 사용 또는 텍스트 내용)
                    let headerName = cell.hasAttribute('data-field') 
                        ? cell.getAttribute('data-field') 
                        : cell.textContent.trim();
                    
                    // 빈 헤더 처리
                    if (!headerName) {
                        headerName = `column${i}`;
                    }
                    
                    // 중복 헤더 처리
                    if (headers.includes(headerName)) {
                        let counter = 1;
                        while (headers.includes(`${headerName}_${counter}`)) {
                            counter++;
                        }
                        headerName = `${headerName}_${counter}`;
                    }
                    
                    // camelCase 변환 (옵션)
                    if (settings.useCamelCase) {
                        headerName = _camelCase(headerName);
                    }
                    
                    headers.push(headerName);
                }
            }
            
            // 행 데이터 추출
            const rows = Array.from(table.querySelectorAll('tbody tr'));
            const data = [];
            
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                
                // 숨겨진 행 처리
                if (!settings.exportHiddenRows && row.style.display === 'none') {
                    continue;
                }
                
                const cells = Array.from(row.querySelectorAll('td'));
                let rowData;
                
                // 헤더 사용 여부에 따라 데이터 구조 결정
                if (settings.useHeaders && headers.length > 0) {
                    rowData = {};
                    let headerIndex = 0;
                    
                    for (let j = 0; j < cells.length; j++) {
                        const cell = cells[j];
                        
                        // 숨겨진 열 처리
                        if (!settings.exportHiddenColumns && 
                            (cell.style.display === 'none' || 
                             cell.classList.contains('hidden') || 
                             cell.getAttribute('data-exportable') === 'false')) {
                            continue;
                        }
                        
                        // 셀 내용 가져오기 (data-value 속성 사용 또는 텍스트 내용)
                        let cellValue = cell.hasAttribute('data-value') 
                            ? cell.getAttribute('data-value') 
                            : cell.textContent.trim();
                        
                        // 데이터 타입 변환
                        if (cellValue === '') {
                            cellValue = null;
                        } else if (!isNaN(cellValue) && cellValue !== '') {
                            cellValue = Number(cellValue);
                        } else if (cellValue.toLowerCase() === 'true' || cellValue.toLowerCase() === 'false') {
                            cellValue = cellValue.toLowerCase() === 'true';
                        }
                        
                        // 헤더가 있는 경우 해당 키로 매핑
                        if (headerIndex < headers.length) {
                            rowData[headers[headerIndex]] = cellValue;
                            headerIndex++;
                        }
                    }
                } else {
                    // 헤더 없이 배열로 처리
                    rowData = [];
                    
                    for (let j = 0; j < cells.length; j++) {
                        const cell = cells[j];
                        
                        // 숨겨진 열 처리
                        if (!settings.exportHiddenColumns && 
                            (cell.style.display === 'none' || 
                             cell.classList.contains('hidden') || 
                             cell.getAttribute('data-exportable') === 'false')) {
                            continue;
                        }
                        
                        // 셀 내용 가져오기 (data-value 속성 사용 또는 텍스트 내용)
                        let cellValue = cell.hasAttribute('data-value') 
                            ? cell.getAttribute('data-value') 
                            : cell.textContent.trim();
                        
                        // 데이터 타입 변환
                        if (cellValue === '') {
                            cellValue = null;
                        } else if (!isNaN(cellValue) && cellValue !== '') {
                            cellValue = Number(cellValue);
                        } else if (cellValue.toLowerCase() === 'true' || cellValue.toLowerCase() === 'false') {
                            cellValue = cellValue.toLowerCase() === 'true';
                        }
                        
                        rowData.push(cellValue);
                    }
                }
                
                // 행 데이터 변환 함수 적용
                if (typeof settings.transform === 'function') {
                    rowData = settings.transform(rowData, i);
                    
                    // 변환 함수가 null 또는 undefined를 반환하면 해당 행 건너뜀
                    if (rowData === null || rowData === undefined) {
                        continue;
                    }
                }
                
                data.push(rowData);
            }
            
            // 파일 다운로드
            if (settings.download) {
                const jsonStr = settings.pretty 
                    ? JSON.stringify(data, null, 2) 
                    : JSON.stringify(data);
                
                const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
                _downloadBlob(blob, settings.filename);
                
                return true;
            }
            
            // JSON 객체 반환
            return data;
        } catch (error) {
            console.error('테이블 JSON 내보내기 오류:', error);
            return false;
        }
    }
    
    /**
     * 내보내기 버튼을 초기화합니다.
     * 
     * @param {Object} options - 버튼 초기화 옵션
     * @param {string} options.buttonSelector - 버튼 선택자
     * @param {string} options.tableSelector - 내보낼 테이블 선택자
     * @param {string} options.exportType - 내보내기 형식 ('csv', 'excel', 'json')
     * @param {string} [options.filename] - 저장할 파일명
     * @param {Object} [options.exportOptions] - 내보내기 세부 옵션
     * @param {Function} [options.onSuccess] - 내보내기 성공 시 콜백 함수
     * @param {Function} [options.onError] - 내보내기 실패 시 콜백 함수
     * @returns {Object} 버튼 컨트롤 객체
     * @throws {Error} 버튼 또는 테이블을 찾을 수 없는 경우
     * 
     * @example
     * // 기본 설정으로 초기화
     * TableExport.initializeExportButton({
     *   buttonSelector: '#exportBtn',
     *   tableSelector: '#userTable',
     *   exportType: 'excel'
     * });
     * 
     * // 고급 설정으로 초기화
     * TableExport.initializeExportButton({
     *   buttonSelector: '#exportBtn',
     *   tableSelector: '#userTable',
     *   exportType: 'excel',
     *   filename: '사용자_목록.xls',
     *   exportOptions: {
     *     includeHeaders: true,
     *     sheetName: '사용자 목록',
     *     exportStyles: true
     *   },
     *   onSuccess: () => console.log('내보내기 성공'),
     *   onError: (error) => console.error('내보내기 실패:', error)
     * });
     */
    function initializeExportButton(options) {
        const defaultOptions = {
            tableSelector: '',
            buttonSelector: '',
            format: 'csv',
            filename: 'export',
            beforeExport: null,
            afterExport: null
        };
        
        const settings = { ...defaultOptions, ...options };
        
        const button = document.querySelector(settings.buttonSelector);
        if (!button) {
            console.error(`내보내기 버튼을 찾을 수 없습니다: ${settings.buttonSelector}`);
            return null;
        }
        
        // 이벤트 핸들러
        const handleExport = (e) => {
            e.preventDefault();
            
            // 내보내기 전 콜백
            if (typeof settings.beforeExport === 'function') {
                settings.beforeExport();
            }
            
            // 내보내기 형식에 따라 처리
            const format = button.getAttribute('data-format') || settings.format;
            const filename = `${settings.filename}.${format === 'excel' ? 'xls' : format}`;
            let success = false;
            
            switch (format.toLowerCase()) {
                case 'csv':
                    success = exportTableToCsv(settings.tableSelector, filename);
                    break;
                case 'excel':
                    success = exportTableToExcel(settings.tableSelector, filename);
                    break;
                case 'json':
                    success = exportTableToJson(settings.tableSelector, { filename });
                    break;
                default:
                    console.error(`지원하지 않는 내보내기 형식: ${format}`);
                    return;
            }
            
            // 내보내기 후 콜백
            if (typeof settings.afterExport === 'function') {
                settings.afterExport(success);
            }
        };
        
        // 이벤트 리스너 등록
        button.addEventListener('click', handleExport);
        
        // 컨트롤 객체 반환
        return {
            export: handleExport,
            setFormat: (format) => {
                button.setAttribute('data-format', format);
            },
            setFilename: (filename) => {
                settings.filename = filename;
            },
            cleanup: () => {
                button.removeEventListener('click', handleExport);
            }
        };
    }
    
    /**
     * Blob을 다운로드합니다.
     * 
     * @param {Blob} blob - 다운로드할 Blob 객체
     * @param {string} filename - 저장할 파일명
     * @private
     */
    function _downloadBlob(blob, filename) {
        if (navigator.msSaveOrOpenBlob) {
            // IE10+
            navigator.msSaveOrOpenBlob(blob, filename);
            return;
        }
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        
        // 가시적인 DOM에 추가하지 않고 클릭 이벤트 발생
        document.body.appendChild(a);
        a.click();
        
        // 정리
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }
    
    /**
     * 문자열을 카멜 케이스로 변환합니다.
     * 
     * @param {string} str - 변환할 문자열
     * @returns {string} 카멜 케이스로 변환된 문자열
     * @private
     */
    function _camelCase(str) {
        if (!str) return '';
        
        return str
            .replace(/[^\w\s-]/g, '') // 영문자, 숫자, 공백, 하이픈 외 제거
            .replace(/[\s_-]+(\w)/g, (_, p1) => p1.toUpperCase()) // 공백, 언더스코어, 하이픈 제거 및 대문자화
            .replace(/^\w/, c => c.toLowerCase()); // 첫 글자 소문자화
    }
    
    /**
     * 계산된 스타일 속성을 가져옵니다.
     * @param {Element} element - 스타일을 가져올 요소
     * @returns {string} 인라인 스타일 문자열
     * @private
     */
    function _getComputedStyles(element) {
        const stylesToCopy = [
            'background-color', 
            'color', 
            'font-weight', 
            'text-align',
            'vertical-align',
            'border',
            'border-color'
        ];
        
        const computed = window.getComputedStyle(element);
        const styles = [];
        
        for (const prop of stylesToCopy) {
            const value = computed.getPropertyValue(prop);
            if (value && value !== 'initial' && value !== 'normal' && value !== 'none') {
                styles.push(`${prop}:${value}`);
            }
        }
        
        return styles.join(';');
    }
    
    // 공개 API
    return {
        exportTableToCsv,
        exportTableToExcel,
        exportTableToJson,
        initializeExportButton
    };
})();

export default TableExport; 