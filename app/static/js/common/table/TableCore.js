/**
 * 테이블 핵심 모듈
 * 기본 테이블 조작 및 초기화 기능을 제공합니다.
 * 
 * @module common/table/TableCore
 * @exports TableCore
 * 
 * @example
 * // 모듈 가져오기
 * import { TableCore } from '../common/table/index.js';
 * 
 * // 또는 직접 가져오기
 * import TableCore from '../common/table/TableCore.js';
 * 
 * // 테이블 행 클릭 이벤트 초기화
 * const tableController = TableCore.initTableRowClick({
 *   tableSelector: '#myTable',
 *   onRowClick: (rowData) => console.log(rowData)
 * });
 * 
 * // 정리 (페이지 언로드 시)
 * tableController.cleanup();
 */

const TableCore = (function() {
    /**
     * 테이블 행 클릭 이벤트를 초기화합니다.
     * 
     * @param {Object} options - 초기화 옵션
     * @param {string} options.tableSelector - 테이블 선택자
     * @param {Function} options.onRowClick - 행 클릭 이벤트 핸들러 (행 데이터와 이벤트 객체를 매개변수로 받음)
     * @param {boolean} [options.enableHighlight=true] - 클릭된 행 강조 표시 여부
     * @param {string} [options.highlightClass='table-active'] - 강조 표시에 사용할 클래스
     * @param {Function} [options.dataTransformer] - 행 데이터 변환 함수
     * @returns {Object} 초기화 컨트롤 객체 {cleanup: Function}
     * @throws {Error} 테이블을 찾을 수 없는 경우 또는 onRowClick 콜백이 지정되지 않은 경우
     * 
     * @example
     * // 기본 사용법
     * const controller = TableCore.initTableRowClick({
     *   tableSelector: '#userTable',
     *   onRowClick: (rowData) => {
     *     console.log('선택된 행:', rowData);
     *   }
     * });
     * 
     * // 데이터 변환 함수 사용
     * const controller = TableCore.initTableRowClick({
     *   tableSelector: '#productTable',
     *   onRowClick: (rowData) => handleProductSelect(rowData),
     *   dataTransformer: (data, row) => ({
     *     ...data,
     *     price: parseFloat(data.price),
     *     inStock: data.stock > 0
     *   })
     * });
     */
    function initTableRowClick(options) {
        const defaultOptions = {
            tableSelector: '',
            onRowClick: null,
            enableHighlight: true,
            highlightClass: 'table-active',
            dataTransformer: null
        };
        
        const settings = { ...defaultOptions, ...options };
        
        const table = document.querySelector(settings.tableSelector);
        if (!table) {
            console.error(`테이블을 찾을 수 없습니다: ${settings.tableSelector}`);
            return null;
        }
        
        if (typeof settings.onRowClick !== 'function') {
            console.error('onRowClick 콜백 함수가 지정되지 않았습니다.');
            return null;
        }
        
        // 테이블 행 클릭 이벤트 등록
        const tableBody = table.querySelector('tbody') || table;
        
        // 클릭 이벤트 핸들러
        const clickHandler = (event) => {
            const row = event.target.closest('tr');
            if (!row) return;
            
            // 행에 data-href 속성이 있는 경우 해당 링크로 이동
            const href = row.getAttribute('data-href');
            if (href) {
                window.location.href = href;
                return;
            }
            
            // 클릭 요소가 버튼, 링크 등인 경우 행 클릭 처리 안함
            if (event.target.closest('button, a, .btn, input, [data-action]')) {
                return;
            }
            
            // 행 데이터 추출
            let rowData = extractRowData(row);
            
            // 데이터 변환 함수가 있는 경우 적용
            if (typeof settings.dataTransformer === 'function') {
                rowData = settings.dataTransformer(rowData, row);
            }
            
            // 강조 표시 처리
            if (settings.enableHighlight) {
                tableBody.querySelectorAll('tr').forEach(r => {
                    r.classList.remove(settings.highlightClass);
                });
                row.classList.add(settings.highlightClass);
            }
            
            // 콜백 함수 호출
            settings.onRowClick(rowData, event);
        };
        
        tableBody.addEventListener('click', clickHandler);
        
        // 정리 함수 반환 (이벤트 리스너 제거를 위해)
        return {
            cleanup: function() {
                tableBody.removeEventListener('click', clickHandler);
            }
        };
    }
    
    /**
     * 테이블 행에서 데이터를 추출합니다.
     * 
     * @param {Element} row - 데이터를 추출할 행 요소
     * @returns {Object} 추출된 행 데이터 (data-* 속성과 셀 내용 포함)
     * 
     * @example
     * const row = document.querySelector('#userTable tr');
     * const data = TableCore.extractRowData(row);
     * console.log(data); // {id: "1", name: "홍길동", email: "user@example.com"}
     */
    function extractRowData(row) {
        const data = {};
        
        // data-* 속성에서 데이터 추출
        Array.from(row.attributes)
            .filter(attr => attr.name.startsWith('data-'))
            .forEach(attr => {
                // data-x-y 형식의 속성명을 camelCase로 변환 (xY)
                const key = attr.name.replace('data-', '').replace(/-([a-z])/g, (m, p1) => p1.toUpperCase());
                data[key] = attr.value;
            });
        
        // 셀 내용도 데이터로 추출
        const cells = row.querySelectorAll('td');
        cells.forEach((cell, index) => {
            // 셀에 data-field 속성이 있으면 해당 속성을 키로 사용
            const fieldName = cell.getAttribute('data-field');
            if (fieldName) {
                data[fieldName] = cell.textContent.trim();
            } else {
                // 없으면 cell0, cell1과 같은 형식으로 인덱스 사용
                data[`cell${index}`] = cell.textContent.trim();
            }
        });
        
        return data;
    }
    
    /**
     * 테이블의 내용을 비웁니다.
     * 
     * @param {string} tableId - 비울 테이블의 ID
     * @param {boolean} [keepHeader=true] - 헤더를 유지할지 여부
     * @throws {Error} 테이블을 찾을 수 없는 경우
     * 
     * @example
     * // 테이블 내용 비우기
     * TableCore.clearTable('userTable');
     */
    function clearTable(tableId) {
        const table = document.getElementById(tableId);
        if (!table) {
            console.error(`테이블을 찾을 수 없습니다: ${tableId}`);
            return;
        }
        
        const tbody = table.querySelector('tbody');
        if (tbody) {
            tbody.innerHTML = '';
        } else {
            // tbody가 없는 경우 thead를 제외한 모든 tr 제거
            const thead = table.querySelector('thead');
            if (thead) {
                // thead 이후의 모든 내용 삭제
                while (thead.nextSibling) {
                    table.removeChild(thead.nextSibling);
                }
            } else {
                // thead도 없는 경우 모든 행 삭제
                table.innerHTML = '';
            }
        }
    }
    
    /**
     * DataTable을 초기화합니다.
     * 
     * @param {string} tableSelector - 테이블 선택자
     * @param {Object} [options={}] - DataTable 옵션
     * @returns {Object|null} 초기화된 DataTable 인스턴스 또는 null
     * @throws {Error} DataTables 라이브러리가 로드되지 않은 경우 또는 테이블을 찾을 수 없는 경우
     * 
     * @example
     * // 기본 설정으로 DataTable 초기화
     * const dataTable = TableCore.initializeDataTable('#userTable');
     * 
     * // 사용자 정의 옵션으로 초기화
     * const dataTable = TableCore.initializeDataTable('#productTable', {
     *   pageLength: 25,
     *   order: [[1, 'asc']],
     *   dom: 'Bfrtip',
     *   buttons: ['copy', 'csv', 'excel']
     * });
     */
    function initializeDataTable(tableSelector, options = {}) {
        // jQuery DataTables 의존성 체크
        if (typeof $ === 'undefined' || !$.fn.DataTable) {
            console.error('DataTables 라이브러리가 로드되지 않았습니다.');
            return null;
        }
        
        const table = $(tableSelector);
        if (table.length === 0) {
            console.error(`테이블을 찾을 수 없습니다: ${tableSelector}`);
            return null;
        }
        
        // 이미 초기화된 DataTable인 경우 제거
        if ($.fn.DataTable.isDataTable(table)) {
            table.DataTable().destroy();
            table.empty();
        }
        
        // 기본 옵션
        const defaultOptions = {
            responsive: true,
            language: {
                search: "검색:",
                lengthMenu: "_MENU_ 개씩 보기",
                info: "_START_ - _END_ / _TOTAL_",
                infoEmpty: "0 - 0 / 0",
                infoFiltered: "(전체 _MAX_ 개 중 검색결과)",
                emptyTable: "데이터가 없습니다",
                zeroRecords: "일치하는 데이터가 없습니다",
                paginate: {
                    first: "처음",
                    last: "마지막",
                    next: "다음",
                    previous: "이전"
                }
            },
            select: {
                style: 'multi', // 다중 선택 지원
                selector: 'td:first-child'
            },
            columnDefs: [
                {
                    targets: 0,
                    orderable: false,
                    className: 'select-checkbox',
                    width: '30px'
                }
            ]
        };
        
        // 사용자 정의 옵션 병합
        const finalOptions = $.extend(true, {}, defaultOptions, options);
        
        // DataTable 초기화
        const dataTable = table.DataTable(finalOptions);
        
        // 엔트리 표시 개수 변경 시 테이블 리사이징
        dataTable.on('length.dt', function() {
            if (typeof $.fn.DataTable.tables === 'function') {
                $.fn.DataTable.tables({ visible: true, api: true }).columns.adjust();
            }
        });
        
        // 체크박스 전체 선택/해제 기능 (thead의 첫 번째 셀에 체크박스가 있는 경우)
        const headerCheckbox = table.find('thead th:first-child input[type="checkbox"]');
        if (headerCheckbox.length > 0) {
            headerCheckbox.on('change', function() {
                if (this.checked) {
                    dataTable.rows().select();
                } else {
                    dataTable.rows().deselect();
                }
                
                // 전체 선택 상태 업데이트
                const totalRows = dataTable.rows().count();
                const selectedRows = dataTable.rows({ selected: true }).count();
                this.checked = totalRows > 0 && selectedRows === totalRows;
                this.indeterminate = selectedRows > 0 && selectedRows < totalRows;
            });
            
            // 행 선택 변경 시 헤더 체크박스 상태 업데이트
            dataTable.on('select deselect', function() {
                const totalRows = dataTable.rows().count();
                const selectedRows = dataTable.rows({ selected: true }).count();
                
                headerCheckbox.prop('checked', totalRows > 0 && selectedRows === totalRows);
                headerCheckbox.prop('indeterminate', selectedRows > 0 && selectedRows < totalRows);
            });
        }
        
        return dataTable;
    }
    
    /**
     * DataTable에서 선택된 행의 데이터를 가져옵니다.
     * 
     * @param {Object} dataTable - DataTable 인스턴스
     * @param {string} [idField='id'] - ID 필드명
     * @returns {Array} 선택된 행의 데이터 배열
     * 
     * @example
     * const dataTable = $('#userTable').DataTable();
     * const selectedUsers = TableCore.getDataTableSelectedRows(dataTable);
     * console.log('선택된 사용자:', selectedUsers);
     */
    function getDataTableSelectedRows(dataTable, idField = 'id') {
        // DataTable 인스턴스 체크
        if (!dataTable || typeof dataTable.rows !== 'function') {
            console.error('유효한 DataTable 인스턴스가 아닙니다.');
            return [];
        }
        
        // 선택된 행 데이터 가져오기
        const selectedRows = dataTable.rows({ selected: true }).data();
        
        // 배열로 변환
        const result = [];
        for (let i = 0; i < selectedRows.length; i++) {
            const row = selectedRows[i];
            
            // 행 데이터에 idField가 있는지 확인
            if (row[idField] !== undefined) {
                result.push(row);
            } else {
                console.warn(`행 데이터에 지정한 식별자 필드(${idField})가 없습니다.`, row);
            }
        }
        
        return result;
    }
    
    // 공개 API
    return {
        initTableRowClick,
        extractRowData,
        clearTable,
        initializeDataTable,
        getDataTableSelectedRows
    };
})();

export default TableCore; 