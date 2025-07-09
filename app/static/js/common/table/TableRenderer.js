/**
 * 테이블 렌더링 모듈
 * 테이블 동적 렌더링 기능을 제공합니다.
 * 
 * 함수 목록:
 * - addTableRow: 테이블 행 추가
 * - updateTableRow: 테이블 행 업데이트
 * - removeTableRow: 테이블 행 제거
 * - highlightTableRow: 테이블 행 강조 표시
 * - addBulkRows: 테이블에 여러 행 추가
 */

const TableRenderer = (function() {
    /**
     * 테이블에 새로운 행을 추가합니다.
     * @param {string} tableId - 대상 테이블 ID
     * @param {Object|Array} rowData - 행 데이터 (객체 또는 배열)
     * @param {Array} columns - 열 정의 배열 [{field, formatter, className}]
     * @returns {Element} 추가된 행 요소
     */
    function addTableRow(tableId, rowData, columns) {
        const table = document.getElementById(tableId);
        if (!table) {
            console.error(`테이블을 찾을 수 없습니다: ${tableId}`);
            return null;
        }
        
        // tbody 찾기 또는 생성
        let tbody = table.querySelector('tbody');
        if (!tbody) {
            tbody = document.createElement('tbody');
            table.appendChild(tbody);
        }
        
        // 행 요소 생성
        const row = document.createElement('tr');
        
        // 데이터 속성 추가
        if (rowData.id) {
            row.setAttribute('data-id', rowData.id);
        }
        
        // 행의 추가 데이터 속성 설정
        Object.entries(rowData).forEach(([key, value]) => {
            if (value !== null && value !== undefined && typeof value !== 'object') {
                row.setAttribute(`data-${key}`, value);
            }
        });
        
        // 열 정의가 있는 경우 해당 열에 따라 셀 생성
        if (Array.isArray(columns) && columns.length > 0) {
            columns.forEach(column => {
                const cell = document.createElement('td');
                
                // 필드 속성 추가
                if (column.field) {
                    cell.setAttribute('data-field', column.field);
                }
                
                // 클래스 추가
                if (column.className) {
                    cell.className = column.className;
                }
                
                // 셀 내용 설정
                let content = '';
                
                if (typeof column.formatter === 'function') {
                    // 포맷터 함수 사용
                    content = column.formatter(rowData, cell);
                } else if (column.field) {
                    // 필드명으로 데이터 접근
                    const value = Array.isArray(rowData) 
                        ? rowData[parseInt(column.field, 10) || 0]
                        : rowData[column.field];
                    
                    content = value !== undefined && value !== null ? value : '';
                }
                
                // 내용 설정
                if (typeof content === 'string' || typeof content === 'number') {
                    cell.textContent = content;
                } else if (content instanceof Element) {
                    cell.appendChild(content);
                } else if (typeof content === 'object' && content !== null && content.html) {
                    // HTML 내용 적용
                    cell.innerHTML = content.html;
                }
                
                // 행에 셀 추가
                row.appendChild(cell);
            });
        } else {
            // 열 정의가 없는 경우 데이터 항목을 직접 셀로 변환
            if (Array.isArray(rowData)) {
                // 배열인 경우 각 항목을 셀로 추가
                rowData.forEach(item => {
                    const cell = document.createElement('td');
                    cell.textContent = item !== null && item !== undefined ? item : '';
                    row.appendChild(cell);
                });
            } else {
                // 객체인 경우 각 값을 셀로 추가
                Object.values(rowData).forEach(value => {
                    if (typeof value !== 'object') {
                        const cell = document.createElement('td');
                        cell.textContent = value !== null && value !== undefined ? value : '';
                        row.appendChild(cell);
                    }
                });
            }
        }
        
        // 행 추가
        tbody.appendChild(row);
        
        return row;
    }
    
    /**
     * 테이블 행을 업데이트합니다.
     * @param {string|Element} tableOrRow - 대상 테이블 ID 또는 업데이트할 행 요소
     * @param {string|number|null} rowId - 행 식별자 (tableOrRow가 테이블인 경우 필수)
     * @param {Object|Array} rowData - 업데이트할 행 데이터
     * @param {Array} columns - 열 정의 배열 [{field, formatter, className}]
     * @returns {Element|null} 업데이트된 행 요소 또는 null
     */
    function updateTableRow(tableOrRow, rowId, rowData, columns) {
        let row;
        
        // 테이블 ID가 주어진 경우 해당 ID로 행 찾기
        if (typeof tableOrRow === 'string') {
            const table = document.getElementById(tableOrRow);
            if (!table) {
                console.error(`테이블을 찾을 수 없습니다: ${tableOrRow}`);
                return null;
            }
            
            row = table.querySelector(`tbody tr[data-id="${rowId}"]`);
            if (!row) {
                console.error(`ID가 ${rowId}인 행을 찾을 수 없습니다.`);
                return null;
            }
        } else if (tableOrRow instanceof Element && tableOrRow.tagName === 'TR') {
            // 행 요소가 직접 주어진 경우
            row = tableOrRow;
        } else {
            console.error('유효한 테이블 ID 또는 행 요소가 필요합니다.');
            return null;
        }
        
        // 데이터 속성 업데이트
        Object.entries(rowData).forEach(([key, value]) => {
            if (value !== null && value !== undefined && typeof value !== 'object') {
                row.setAttribute(`data-${key}`, value);
            }
        });
        
        // 열 정의에 따라 셀 업데이트
        if (Array.isArray(columns) && columns.length > 0) {
            columns.forEach((column, index) => {
                let cell = row.cells[index];
                
                // 셀이 없는 경우 새로 생성
                if (!cell) {
                    cell = document.createElement('td');
                    row.appendChild(cell);
                }
                
                // 필드 속성 업데이트
                if (column.field) {
                    cell.setAttribute('data-field', column.field);
                }
                
                // 클래스 업데이트
                if (column.className) {
                    cell.className = column.className;
                }
                
                // 셀 내용 업데이트
                let content = '';
                
                if (typeof column.formatter === 'function') {
                    // 포맷터 함수 사용
                    content = column.formatter(rowData, cell);
                } else if (column.field) {
                    // 필드명으로 데이터 접근
                    const value = Array.isArray(rowData) 
                        ? rowData[parseInt(column.field, 10) || 0]
                        : rowData[column.field];
                    
                    content = value !== undefined && value !== null ? value : '';
                }
                
                // 내용 설정
                if (typeof content === 'string' || typeof content === 'number') {
                    cell.textContent = content;
                } else if (content instanceof Element) {
                    cell.innerHTML = '';
                    cell.appendChild(content);
                } else if (typeof content === 'object' && content !== null && content.html) {
                    // HTML 내용 적용
                    cell.innerHTML = content.html;
                }
            });
            
            // 여분의 셀 제거
            while (row.cells.length > columns.length) {
                row.removeChild(row.lastChild);
            }
        } else {
            // 열 정의가 없는 경우 데이터 항목으로 직접 업데이트
            if (Array.isArray(rowData)) {
                // 배열인 경우 각 항목으로 셀 업데이트
                rowData.forEach((item, index) => {
                    let cell = row.cells[index];
                    
                    if (!cell) {
                        cell = document.createElement('td');
                        row.appendChild(cell);
                    }
                    
                    cell.textContent = item !== null && item !== undefined ? item : '';
                });
                
                // 여분의 셀 제거
                while (row.cells.length > rowData.length) {
                    row.removeChild(row.lastChild);
                }
            } else {
                // 객체인 경우 각 값으로 셀 업데이트
                const values = Object.values(rowData).filter(value => typeof value !== 'object');
                
                values.forEach((value, index) => {
                    let cell = row.cells[index];
                    
                    if (!cell) {
                        cell = document.createElement('td');
                        row.appendChild(cell);
                    }
                    
                    cell.textContent = value !== null && value !== undefined ? value : '';
                });
                
                // 여분의 셀 제거
                while (row.cells.length > values.length) {
                    row.removeChild(row.lastChild);
                }
            }
        }
        
        return row;
    }
    
    /**
     * 테이블에서 행을 제거합니다.
     * @param {string} tableId - 대상 테이블 ID
     * @param {string|number} rowId - 제거할 행 ID
     * @returns {boolean} 제거 성공 여부
     */
    function removeTableRow(tableId, rowId) {
        const table = document.getElementById(tableId);
        if (!table) {
            console.error(`테이블을 찾을 수 없습니다: ${tableId}`);
            return false;
        }
        
        const row = table.querySelector(`tbody tr[data-id="${rowId}"]`);
        if (!row) {
            console.error(`ID가 ${rowId}인 행을 찾을 수 없습니다.`);
            return false;
        }
        
        // 행 제거 (애니메이션 효과)
        row.style.transition = 'opacity 0.3s';
        row.style.opacity = '0';
        
        setTimeout(() => {
            row.remove();
            
            // 테이블이 비어있는지 확인
            const tbody = table.querySelector('tbody');
            if (tbody && tbody.children.length === 0) {
                // 빈 테이블 처리 (예: "데이터 없음" 행 추가)
                const emptyRow = document.createElement('tr');
                const emptyCell = document.createElement('td');
                
                // 열 수 계산 (thead의 th 개수 활용)
                const thead = table.querySelector('thead');
                const colCount = thead ? thead.querySelector('tr').children.length : 1;
                
                emptyCell.colSpan = colCount;
                emptyCell.className = 'text-center text-muted';
                emptyCell.textContent = '데이터가 없습니다.';
                
                emptyRow.className = 'empty-row';
                emptyRow.appendChild(emptyCell);
                tbody.appendChild(emptyRow);
            }
        }, 300);
        
        return true;
    }
    
    /**
     * 테이블 행을 강조 표시합니다.
     * @param {string} tableId - 대상 테이블 ID
     * @param {string|number} rowId - 강조할 행 ID
     * @param {string} className - 강조에 사용할 클래스명
     * @param {boolean} [exclusive=true] - 다른 행의 강조 제거 여부
     * @param {number} [duration=0] - 강조 지속 시간 (ms, 0이면 무제한)
     * @returns {Element|null} 강조된 행 요소 또는 null
     */
    function highlightTableRow(tableId, rowId, className = 'highlight', exclusive = true, duration = 0) {
        const table = document.getElementById(tableId);
        if (!table) {
            console.error(`테이블을 찾을 수 없습니다: ${tableId}`);
            return null;
        }
        
        const row = table.querySelector(`tbody tr[data-id="${rowId}"]`);
        if (!row) {
            console.error(`ID가 ${rowId}인 행을 찾을 수 없습니다.`);
            return null;
        }
        
        // 다른 행의 강조 제거
        if (exclusive) {
            table.querySelectorAll(`tbody tr.${className}`).forEach(r => {
                if (r !== row) {
                    r.classList.remove(className);
                }
            });
        }
        
        // 행 강조
        row.classList.add(className);
        
        // 강조 스크롤링 (행이 보이지 않는 경우)
        if (!_isElementInViewport(row)) {
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        // 지정된 시간 후 강조 제거
        if (duration > 0) {
            setTimeout(() => {
                row.classList.remove(className);
            }, duration);
        }
        
        return row;
    }
    
    /**
     * 요소가 뷰포트에 보이는지 확인합니다.
     * @param {Element} el - 확인할 요소
     * @returns {boolean} 뷰포트 내 표시 여부
     * @private
     */
    function _isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
    /**
     * 테이블에 여러 행을 한 번에 추가합니다.
     * @param {string} tableId - 대상 테이블 ID
     * @param {Array} rowsData - 행 데이터 배열
     * @param {Array} columns - 열 정의 배열 [{field, formatter, className}]
     * @param {boolean} [clear=false] - 추가 전 테이블 비우기 여부
     * @returns {Array} 추가된 행 요소 배열
     */
    function addBulkRows(tableId, rowsData, columns, clear = false) {
        const table = document.getElementById(tableId);
        if (!table) {
            console.error(`테이블을 찾을 수 없습니다: ${tableId}`);
            return [];
        }
        
        // tbody 찾기 또는 생성
        let tbody = table.querySelector('tbody');
        if (!tbody) {
            tbody = document.createElement('tbody');
            table.appendChild(tbody);
        }
        
        // 테이블 비우기
        if (clear) {
            tbody.innerHTML = '';
        } else {
            // 빈 테이블 행 제거
            const emptyRow = tbody.querySelector('.empty-row');
            if (emptyRow) {
                emptyRow.remove();
            }
        }
        
        // 성능 최적화를 위한 문서 프래그먼트 사용
        const fragment = document.createDocumentFragment();
        const addedRows = [];
        
        // 행 생성 및 추가
        rowsData.forEach(rowData => {
            // 행 요소 생성
            const row = document.createElement('tr');
            
            // 데이터 속성 추가
            if (rowData.id) {
                row.setAttribute('data-id', rowData.id);
            }
            
            // 행의 추가 데이터 속성 설정
            Object.entries(rowData).forEach(([key, value]) => {
                if (value !== null && value !== undefined && typeof value !== 'object') {
                    row.setAttribute(`data-${key}`, value);
                }
            });
            
            // 열 정의에 따라 셀 생성
            if (Array.isArray(columns) && columns.length > 0) {
                columns.forEach(column => {
                    const cell = document.createElement('td');
                    
                    // 필드 속성 추가
                    if (column.field) {
                        cell.setAttribute('data-field', column.field);
                    }
                    
                    // 클래스 추가
                    if (column.className) {
                        cell.className = column.className;
                    }
                    
                    // 셀 내용 설정
                    let content = '';
                    
                    if (typeof column.formatter === 'function') {
                        // 포맷터 함수 사용
                        content = column.formatter(rowData, cell);
                    } else if (column.field) {
                        // 필드명으로 데이터 접근
                        const value = Array.isArray(rowData) 
                            ? rowData[parseInt(column.field, 10) || 0]
                            : rowData[column.field];
                        
                        content = value !== undefined && value !== null ? value : '';
                    }
                    
                    // 내용 설정
                    if (typeof content === 'string' || typeof content === 'number') {
                        cell.textContent = content;
                    } else if (content instanceof Element) {
                        cell.appendChild(content);
                    } else if (typeof content === 'object' && content !== null && content.html) {
                        // HTML 내용 적용
                        cell.innerHTML = content.html;
                    }
                    
                    // 행에 셀 추가
                    row.appendChild(cell);
                });
            } else {
                // 열 정의가 없는 경우 데이터 항목을 직접 셀로 변환
                if (Array.isArray(rowData)) {
                    // 배열인 경우 각 항목을 셀로 추가
                    rowData.forEach(item => {
                        const cell = document.createElement('td');
                        cell.textContent = item !== null && item !== undefined ? item : '';
                        row.appendChild(cell);
                    });
                } else {
                    // 객체인 경우 각 값을 셀로 추가
                    Object.values(rowData).forEach(value => {
                        if (typeof value !== 'object') {
                            const cell = document.createElement('td');
                            cell.textContent = value !== null && value !== undefined ? value : '';
                            row.appendChild(cell);
                        }
                    });
                }
            }
            
            // 프래그먼트에 행 추가
            fragment.appendChild(row);
            addedRows.push(row);
        });
        
        // 한번에 DOM 업데이트
        tbody.appendChild(fragment);
        
        // 데이터가 없는 경우 "데이터 없음" 행 추가
        if (addedRows.length === 0 && tbody.children.length === 0) {
            const emptyRow = document.createElement('tr');
            const emptyCell = document.createElement('td');
            
            // 열 수 계산 (thead의 th 개수 활용)
            const thead = table.querySelector('thead');
            const colCount = thead ? thead.querySelector('tr').children.length : 1;
            
            emptyCell.colSpan = colCount;
            emptyCell.className = 'text-center text-muted';
            emptyCell.textContent = '데이터가 없습니다.';
            
            emptyRow.className = 'empty-row';
            emptyRow.appendChild(emptyCell);
            tbody.appendChild(emptyRow);
        }
        
        return addedRows;
    }
    
    // 공개 API
    return {
        addTableRow,
        updateTableRow,
        removeTableRow,
        highlightTableRow,
        addBulkRows
    };
})();

export default TableRenderer; 