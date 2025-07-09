/**
 * 테이블 정렬 모듈
 * 테이블 정렬 기능을 제공합니다.
 * 
 * @module common/table/TableSorter
 * @exports TableSorter
 * 
 * @example
 * // 모듈 가져오기
 * import { TableSorter } from '../common/table/index.js';
 * 
 * // 또는 직접 가져오기
 * import TableSorter from '../common/table/TableSorter.js';
 * 
 * // 테이블 정렬 초기화
 * const sorter = TableSorter.initializeTableSorting({
 *   tableSelector: '#userTable',
 *   sortOptions: {
 *     multiSort: true,
 *     defaultColumn: 'name',
 *     defaultDirection: 'asc'
 *   }
 * });
 * 
 * // 정렬 상태 초기화
 * sorter.reset();
 */

const TableSorter = (function() {
    /**
     * 테이블 정렬 기능을 초기화합니다.
     * 
     * @param {Object} options - 정렬 옵션
     * @param {string} options.tableSelector - 정렬 기능을 적용할 테이블 선택자
     * @param {number} [options.headerRowIndex=0] - 헤더 행 인덱스
     * @param {Object} [options.sortOptions] - 정렬 세부 설정
     * @param {boolean} [options.sortOptions.multiSort=false] - 다중 컬럼 정렬 활성화 여부
     * @param {string} [options.sortOptions.defaultColumn] - 기본 정렬 컬럼
     * @param {string} [options.sortOptions.defaultDirection='asc'] - 기본 정렬 방향 ('asc' 또는 'desc')
     * @param {Object} [options.sortOptions.customDataTypes] - 커스텀 데이터 타입 정의
     * @param {Object} [options.sortOptions.columnSettings] - 열별 정렬 설정
     * @returns {Object} 정렬 컨트롤 객체 {reset: Function, getState: Function}
     * @throws {Error} 테이블을 찾을 수 없는 경우, 헤더 행이 없는 경우, 또는 정렬 가능한 헤더가 없는 경우
     * 
     * @example
     * // 기본 설정으로 초기화
     * const sorter = TableSorter.initializeTableSorting({
     *   tableSelector: '#userTable'
     * });
     * 
     * // 다중 정렬 및 커스텀 데이터 타입 설정
     * const sorter = TableSorter.initializeTableSorting({
     *   tableSelector: '#productTable',
     *   sortOptions: {
     *     multiSort: true,
     *     defaultColumn: 'price',
     *     defaultDirection: 'desc',
     *     customDataTypes: {
     *       price: 'currency',
     *       date: 'date'
     *     }
     *   }
     * });
     */
    function initializeTableSorting(options) {
        const defaultOptions = {
            tableSelector: '',
            headerRowIndex: 0,
            sortOptions: {
                multiSort: false,
                defaultColumn: '',
                defaultDirection: 'asc',
                customDataTypes: {},
                columnSettings: {}
            }
        };
        
        const settings = { 
            ...defaultOptions, 
            ...options,
            sortOptions: {
                ...defaultOptions.sortOptions,
                ...(options.sortOptions || {})
            }
        };
        
        const table = document.querySelector(settings.tableSelector);
        if (!table) {
            console.error(`테이블을 찾을 수 없습니다: ${settings.tableSelector}`);
            return null;
        }
        
        const thead = table.querySelector('thead');
        if (!thead) {
            console.error(`테이블 헤더(thead)를 찾을 수 없습니다.`);
            return null;
        }
        
        // 헤더 행 가져오기
        const headerRows = thead.querySelectorAll('tr');
        if (headerRows.length <= settings.headerRowIndex) {
            console.error(`지정된 인덱스의 헤더 행이 존재하지 않습니다.`);
            return null;
        }
        
        const headerRow = headerRows[settings.headerRowIndex];
        const headers = headerRow.querySelectorAll('th[data-sort]');
        
        if (headers.length === 0) {
            console.warn(`정렬 가능한 헤더가 없습니다. 'data-sort' 속성이 필요합니다.`);
            return null;
        }
        
        // 정렬 상태 객체 생성
        const sortState = _createSortState();
        
        // 헤더 정렬 인디케이터 초기화
        headers.forEach(header => {
            _initSortHeader(header, sortState, headers, settings);
        });
        
        // 기본 정렬 적용
        if (settings.sortOptions.defaultColumn) {
            _applyDefaultSort(headers, settings, sortState);
        }
        
        // 정렬 컨트롤 객체 반환
        return _createSortControlObject(headers, sortState, settings);
    }
    
    /**
     * 정렬 상태 관리 객체를 생성합니다.
     * 
     * @returns {Object} 정렬 상태 객체
     * @private
     */
    function _createSortState() {
        return {
            columns: [], // 현재 정렬 중인 컬럼 목록 [{column, direction}]
            add: function(column, direction) {
                // 기존에 정렬 중인 컬럼인 경우 제거
                this.columns = this.columns.filter(item => item.column !== column);
                // 새 정렬 상태 추가
                this.columns.unshift({ column, direction });
            },
            remove: function(column) {
                this.columns = this.columns.filter(item => item.column !== column);
            },
            clear: function() {
                this.columns = [];
            },
            getSortOrder: function(column) {
                const item = this.columns.find(item => item.column === column);
                return item ? this.columns.indexOf(item) + 1 : 0;
            },
            getDirection: function(column) {
                const item = this.columns.find(item => item.column === column);
                return item ? item.direction : null;
            }
        };
    }
    
    /**
     * 정렬 헤더를 초기화하고 이벤트를 설정합니다.
     * 
     * @param {Element} header - 헤더 엘리먼트
     * @param {Object} sortState - 정렬 상태 객체
     * @param {NodeList} headers - 모든 헤더 노드
     * @param {Object} settings - 정렬 설정
     * @private
     */
    function _initSortHeader(header, sortState, headers, settings) {
        // 정렬 방향 및 순서 표시 요소 추가
        const indicatorContainer = document.createElement('span');
        indicatorContainer.className = 'sort-indicator ms-1';
        
        const directionIndicator = document.createElement('span');
        directionIndicator.className = 'direction-indicator';
        
        const orderIndicator = document.createElement('span');
        orderIndicator.className = 'order-indicator';
        orderIndicator.style.fontSize = '0.7em';
        orderIndicator.style.verticalAlign = 'super';
        orderIndicator.style.marginLeft = '2px';
        
        indicatorContainer.appendChild(directionIndicator);
        indicatorContainer.appendChild(orderIndicator);
        header.appendChild(indicatorContainer);
        
        // 정렬 타입 속성 확인
        const column = header.getAttribute('data-sort');
        
        // 정렬 헤더에 클릭 이벤트 추가
        header.addEventListener('click', (event) => {
            _handleSortHeaderClick(event, header, column, sortState, headers, settings);
        });
    }
    
    /**
     * 헤더 클릭 이벤트를 처리합니다.
     * 
     * @param {Event} event - 클릭 이벤트
     * @param {Element} header - 클릭된 헤더
     * @param {string} column - 컬럼명
     * @param {Object} sortState - 정렬 상태 객체
     * @param {NodeList} headers - 모든 헤더 노드
     * @param {Object} settings - 정렬 설정
     * @private
     */
    function _handleSortHeaderClick(event, header, column, sortState, headers, settings) {
        const shiftKey = event.shiftKey; // Shift 키 누름 여부 (다중 정렬용)
        let direction = header.getAttribute('data-direction') || 'asc';
        
        // 정렬 방향 전환 (이미 정렬 중인 경우)
        if (sortState.getDirection(column) === direction) {
            direction = direction === 'asc' ? 'desc' : 'asc';
        }
        
        // 다중 정렬이 아니거나 Shift 키가 눌리지 않은 경우 기존 정렬 초기화
        if (!settings.sortOptions.multiSort || !shiftKey) {
            _resetAllHeadersExcept(headers, header, sortState);
        }
        
        // 현재 헤더의 정렬 상태 및 방향 업데이트
        header.setAttribute('data-direction', direction);
        sortState.add(column, direction);
        
        // 정렬 순서 및 표시 업데이트
        _updateSortIndicators(headers, sortState, settings);
        
        // 테이블 정렬 실행
        const table = header.closest('table');
        sortTableByMultipleColumns(table, sortState.columns, settings.sortOptions.customDataTypes);
    }
    
    /**
     * 지정된 헤더를 제외한 모든 헤더를 초기화합니다.
     * 
     * @param {NodeList} headers - 모든 헤더 노드
     * @param {Element} exceptHeader - 제외할 헤더
     * @param {Object} sortState - 정렬 상태 객체
     * @private
     */
    function _resetAllHeadersExcept(headers, exceptHeader, sortState) {
        headers.forEach(h => {
            if (h !== exceptHeader) {
                h.removeAttribute('data-direction');
                const column = h.getAttribute('data-sort');
                if (column) {
                    sortState.remove(column);
                }
                
                // 정렬 표시기 초기화
                const orderIndicator = h.querySelector('.order-indicator');
                const directionIndicator = h.querySelector('.direction-indicator');
                
                if (orderIndicator) orderIndicator.textContent = '';
                if (directionIndicator) directionIndicator.innerHTML = '';
            }
        });
    }
    
    /**
     * 정렬 표시기를 업데이트합니다.
     * 
     * @param {NodeList} headers - 모든 헤더 노드
     * @param {Object} sortState - 정렬 상태 객체
     * @param {Object} settings - 정렬 설정
     * @private
     */
    function _updateSortIndicators(headers, sortState, settings) {
        headers.forEach(header => {
            const column = header.getAttribute('data-sort');
            const direction = sortState.getDirection(column);
            const sortOrder = sortState.getSortOrder(column);
            
            const orderIndicator = header.querySelector('.order-indicator');
            const directionIndicator = header.querySelector('.direction-indicator');
            
            if (!orderIndicator || !directionIndicator) return;
            
            // 정렬 순서 표시 (다중 정렬인 경우만)
            if (settings.sortOptions.multiSort && sortOrder > 0) {
                orderIndicator.textContent = sortOrder;
            } else {
                orderIndicator.textContent = '';
            }
            
            // 정렬 방향 표시
            if (direction) {
                directionIndicator.innerHTML = direction === 'asc' 
                    ? '&#9650;' // 위쪽 화살표
                    : '&#9660;'; // 아래쪽 화살표
            } else {
                directionIndicator.innerHTML = '';
            }
        });
    }
    
    /**
     * 기본 정렬을 적용합니다.
     * 
     * @param {NodeList} headers - 모든 헤더 노드
     * @param {Object} settings - 정렬 설정
     * @param {Object} sortState - 정렬 상태 객체
     * @private
     */
    function _applyDefaultSort(headers, settings, sortState) {
        const defaultColumn = settings.sortOptions.defaultColumn;
        const defaultDirection = settings.sortOptions.defaultDirection || 'asc';
        
        // 해당 컬럼 헤더 찾기
        let defaultHeader = null;
        headers.forEach(header => {
            if (header.getAttribute('data-sort') === defaultColumn) {
                defaultHeader = header;
            }
        });
        
        if (defaultHeader) {
            // 기본 정렬 설정
            defaultHeader.setAttribute('data-direction', defaultDirection);
            sortState.add(defaultColumn, defaultDirection);
            
            // 정렬 표시 업데이트
            _updateSortIndicators(headers, sortState, settings);
            
            // 테이블 정렬 실행
            const table = defaultHeader.closest('table');
            sortTableByMultipleColumns(table, sortState.columns, settings.sortOptions.customDataTypes);
        }
    }
    
    /**
     * 정렬 컨트롤 객체를 생성합니다.
     * 
     * @param {NodeList} headers - 모든 헤더 노드
     * @param {Object} sortState - 정렬 상태 객체
     * @param {Object} settings - 정렬 설정
     * @returns {Object} 정렬 컨트롤 객체
     * @private
     */
    function _createSortControlObject(headers, sortState, settings) {
        return {
            // 현재 정렬 상태 가져오기
            getSortState: function() {
                return { ...sortState.columns };
            },
            
            // 특정 컬럼으로 정렬
            sortByColumn: function(column, direction = 'asc') {
                let targetHeader = null;
                headers.forEach(header => {
                    if (header.getAttribute('data-sort') === column) {
                        targetHeader = header;
                    }
                });
                
                if (targetHeader) {
                    // 다중 정렬 아닌 경우 기존 정렬 초기화
                    if (!settings.sortOptions.multiSort) {
                        _resetAllHeadersExcept(headers, targetHeader, sortState);
                    }
                    
                    // 정렬 상태 설정
                    targetHeader.setAttribute('data-direction', direction);
                    sortState.add(column, direction);
                    
                    // 정렬 표시 업데이트
                    _updateSortIndicators(headers, sortState, settings);
                    
                    // 테이블 정렬 실행
                    const table = targetHeader.closest('table');
                    sortTableByMultipleColumns(table, sortState.columns, settings.sortOptions.customDataTypes);
                    
                    return true;
                }
                
                return false;
            },
            
            // 모든 정렬 초기화
            resetSort: function() {
                headers.forEach(header => {
                    header.removeAttribute('data-direction');
                });
                
                sortState.clear();
                _updateSortIndicators(headers, sortState, settings);
                
                return true;
            },
            
            // 현재 표시 중인 테이블 가져오기
            getTable: function() {
                return headers.length > 0 ? headers[0].closest('table') : null;
            }
        };
    }
    
    /**
     * 비교 함수를 준비합니다.
     * 
     * @param {Object} [customDataTypes={}] - 커스텀 데이터 타입 정의
     * @returns {Object} 데이터 타입별 비교 함수 객체
     * @private
     */
    function _prepareCompareFunctions(customDataTypes = {}) {
        // 기본 비교 함수
        const defaultCompareFunctions = {
            string: (a, b) => a.localeCompare(b),
            number: (a, b) => a - b,
            date: (a, b) => new Date(a) - new Date(b),
            boolean: (a, b) => a === b ? 0 : a ? -1 : 1
        };
        
        // 커스텀 비교 함수와 병합
        return { ...defaultCompareFunctions, ...customDataTypes };
    }
    
    /**
     * 셀 값을 가져옵니다.
     * 
     * @param {Element} cell - 셀 엘리먼트
     * @param {string} column - 컬럼명
     * @returns {*} 셀 값
     * @private
     */
    function _getCellValue(cell, column) {
        // data-sort-value 속성이 있으면 해당 값 사용
        if (cell.hasAttribute('data-sort-value')) {
            return cell.getAttribute('data-sort-value');
        }
        
        // 컬럼별 값 추출 규칙 (예: 링크 내 텍스트만 추출)
        const link = column === 'link' ? cell.querySelector('a') : null;
        if (link) {
            return link.textContent.trim();
        }
        
        // input 요소가 있는 경우
        const input = cell.querySelector('input:not([type="checkbox"]):not([type="radio"])');
        if (input) {
            return input.value;
        }
        
        // 체크박스/라디오 요소가 있는 경우
        const checkbox = cell.querySelector('input[type="checkbox"], input[type="radio"]');
        if (checkbox) {
            return checkbox.checked ? '1' : '0';
        }
        
        // select 요소가 있는 경우
        const select = cell.querySelector('select');
        if (select) {
            return select.value;
        }
        
        // 기본값은 셀의 텍스트 내용
        return cell.textContent.trim();
    }
    
    /**
     * 테이블 행을 비교합니다.
     * 
     * @param {Element} rowA - 비교할 첫 번째 행
     * @param {Element} rowB - 비교할 두 번째 행
     * @param {Array} sortColumns - 정렬 컬럼 배열
     * @param {Object} compareFunctions - 비교 함수 객체
     * @returns {number} 비교 결과 (-1, 0, 1)
     * @private
     */
    function _compareTableRows(rowA, rowB, sortColumns, compareFunctions) {
        // 정렬 컬럼이 없으면 원래 순서 유지
        if (!sortColumns || sortColumns.length === 0) {
            return 0;
        }
        
        // 각 정렬 컬럼에 대해 비교
        for (const { column, direction } of sortColumns) {
            // 컬럼 인덱스 또는 이름 처리
            let indexA, indexB;
            
            if (!isNaN(parseInt(column))) {
                // 숫자인 경우 인덱스로 처리
                indexA = parseInt(column);
                indexB = parseInt(column);
            } else {
                // 컬럼명인 경우 data-column 속성으로 셀 찾기
                const cellsA = Array.from(rowA.cells);
                const cellsB = Array.from(rowB.cells);
                
                indexA = cellsA.findIndex(cell => cell.getAttribute('data-column') === column);
                indexB = cellsB.findIndex(cell => cell.getAttribute('data-column') === column);
                
                // 찾지 못한 경우 모든 셀 검색
                if (indexA === -1) {
                    indexA = 0;
                    while (indexA < cellsA.length) {
                        if (cellsA[indexA].getAttribute('data-sort') === column) break;
                        indexA++;
                    }
                    
                    // 범위를 벗어난 경우 첫 번째 셀 사용
                    if (indexA >= cellsA.length) indexA = 0;
                }
                
                if (indexB === -1) {
                    indexB = 0;
                    while (indexB < cellsB.length) {
                        if (cellsB[indexB].getAttribute('data-sort') === column) break;
                        indexB++;
                    }
                    
                    // 범위를 벗어난 경우 첫 번째 셀 사용
                    if (indexB >= cellsB.length) indexB = 0;
                }
            }
            
            // 셀 존재 여부 확인
            if (indexA >= rowA.cells.length || indexB >= rowB.cells.length) {
                continue;
            }
            
            // 셀 값 가져오기
            const valueA = _getCellValue(rowA.cells[indexA], column);
            const valueB = _getCellValue(rowB.cells[indexB], column);
            
            // 데이터 타입 감지
            const dataType = _detectDataType(valueA);
            
            // 비교 함수 선택
            const compareFunc = compareFunctions[dataType] || compareFunctions.string;
            
            // 값 변환 및 비교
            let result;
            
            if (dataType === 'number') {
                result = compareFunc(parseFloat(valueA) || 0, parseFloat(valueB) || 0);
            } else if (dataType === 'date') {
                result = compareFunc(valueA || '', valueB || '');
            } else if (dataType === 'boolean') {
                result = compareFunc(valueA === 'true' || valueA === '1', valueB === 'true' || valueB === '1');
            } else {
                result = compareFunc(valueA || '', valueB || '');
            }
            
            // 결과가 0이 아니면 (다른 경우) 해당 결과 반환
            if (result !== 0) {
                return direction === 'asc' ? result : -result;
            }
        }
        
        // 모든 컬럼이 동일한 경우 원래 순서 유지
        return 0;
    }
    
    /**
     * 다중 컬럼 기준으로 테이블을 정렬합니다.
     * 
     * @param {Element} table - 정렬할 테이블
     * @param {Array} sortColumns - 정렬 컬럼 배열
     * @param {Object} [customDataTypes={}] - 커스텀 데이터 타입 정의
     */
    function sortTableByMultipleColumns(table, sortColumns, customDataTypes = {}) {
        if (!table || !sortColumns || sortColumns.length === 0) {
            return;
        }
        
        const tbody = table.querySelector('tbody');
        if (!tbody) {
            console.error('테이블 본문(tbody)을 찾을 수 없습니다.');
            return;
        }
        
        // 비교 함수 준비
        const compareFunctions = _prepareCompareFunctions(customDataTypes);
        
        // 행 배열로 변환 후 정렬
        const rows = Array.from(tbody.rows);
        rows.sort((rowA, rowB) => _compareTableRows(rowA, rowB, sortColumns, compareFunctions));
        
        // DOM 업데이트
        rows.forEach(row => tbody.appendChild(row));
    }
    
    /**
     * 데이터 타입을 감지합니다.
     * 
     * @param {*} value - 감지할 값
     * @returns {string} 감지된 데이터 타입
     * @private
     */
    function _detectDataType(value) {
        // null, undefined, 빈 문자열 처리
        if (value === null || value === undefined || value === '') {
            return 'string';
        }
        
        // 숫자 여부 확인 (NaN 및 Infinity 제외)
        if (!isNaN(parseFloat(value)) && isFinite(value)) {
            return 'number';
        }
        
        // 불리언 여부 확인
        if (value === 'true' || value === 'false' || value === '1' || value === '0') {
            return 'boolean';
        }
        
        // 날짜 여부 확인
        // ISO 날짜 형식 (YYYY-MM-DD)
        if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?)?Z?$/.test(value)) {
            return 'date';
        }
        
        // 한국 날짜 형식 (YYYY년 MM월 DD일 또는 YYYY.MM.DD)
        if (/^\d{4}[년.\-]\s*\d{1,2}[월.\-]\s*\d{1,2}[일]?$/.test(value)) {
            return 'date';
        }
        
        // 미국 날짜 형식 (MM/DD/YYYY)
        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
            return 'date';
        }
        
        // 유럽 날짜 형식 (DD.MM.YYYY)
        if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(value)) {
            return 'date';
        }
        
        // 기본 타입은 문자열
        return 'string';
    }
    
    // 공개 API
    return {
        initializeTableSorting,
        sortTableByMultipleColumns,
        _detectDataType
    };
})();

export default TableSorter; 