/**
 * 테이블 필터 모듈
 * 테이블 필터링, 검색, 페이지네이션 기능을 제공합니다.
 * 
 * @module common/table/TableFilter
 * @exports TableFilter
 * 
 * @example
 * // 모듈 가져오기
 * import { TableFilter } from '../common/table/index.js';
 * 
 * // 또는 직접 가져오기
 * import TableFilter from '../common/table/TableFilter.js';
 * 
 * // 테이블 필터 초기화
 * const filter = TableFilter.initializeTableFilter('userTable', 'searchInput', {
 *   filterOnEnter: true,
 *   minLength: 2,
 *   highlightMatches: true
 * });
 * 
 * // 테이블 검색 초기화
 * const search = TableFilter.initializeTableSearch({
 *   tableSelector: '#userTable',
 *   searchInput: '#searchInput',
 *   searchColumns: ['name', 'email']
 * });
 * 
 * // 페이지네이션 초기화
 * const pagination = TableFilter.initializePagination({
 *   tableSelector: '#userTable',
 *   itemsPerPage: 10,
 *   paginationContainer: '#pagination'
 * });
 */

const TableFilter = (function() {
    /**
     * 테이블 필터를 초기화합니다.
     * 
     * @param {string} tableId - 테이블 ID
     * @param {string} inputId - 필터 입력 요소 ID
     * @param {Object} [options={}] - 필터 옵션
     * @param {boolean} [options.filterOnEnter=false] - Enter 키 누를 때만 필터링
     * @param {number} [options.minLength=0] - 최소 입력 길이
     * @param {boolean} [options.caseSensitive=false] - 대소문자 구분
     * @param {number[]} [options.columnIndexes=[]] - 검색할 컬럼 인덱스 (비어있으면 모든 컬럼)
     * @param {boolean} [options.highlightMatches=false] - 일치 항목 강조 표시
     * @param {string} [options.highlightClass='highlight'] - 강조 표시에 사용할 클래스
     * @param {string|Element} [options.clearButton=null] - 필터 초기화 버튼 ID 또는 요소
     * @param {Function} [options.onFiltered=null] - 필터링 후 콜백 함수
     * @returns {Object|null} 필터 컨트롤 객체 또는 null (테이블/입력 요소를 찾을 수 없는 경우)
     * @throws {Error} 필터링 중 오류가 발생한 경우
     * 
     * @example
     * // 기본 설정으로 초기화
     * const filter = TableFilter.initializeTableFilter('userTable', 'searchInput');
     * 
     * // 고급 설정으로 초기화
     * const filter = TableFilter.initializeTableFilter('userTable', 'searchInput', {
     *   filterOnEnter: true,
     *   minLength: 2,
     *   caseSensitive: true,
     *   columnIndexes: [0, 1], // 첫 번째와 두 번째 컬럼만 검색
     *   highlightMatches: true,
     *   highlightClass: 'search-highlight',
     *   clearButton: 'clearFilter',
     *   onFiltered: (visible, total, filter) => {
     *     console.log(`표시된 항목: ${visible}/${total}, 필터: ${filter}`);
     *   }
     * });
     */
    function initializeTableFilter(tableId, inputId, options = {}) {
        const table = document.getElementById(tableId);
        const input = document.getElementById(inputId);
        
        if (!table || !input) {
            console.error(`테이블 또는 입력 요소를 찾을 수 없습니다. tableId: ${tableId}, inputId: ${inputId}`);
            return null;
        }
        
        // 기본 옵션
        const defaultOptions = {
            filterOnEnter: false, // Enter 키 누를 때만 필터링
            minLength: 0, // 최소 입력 길이
            caseSensitive: false, // 대소문자 구분
            columnIndexes: [], // 검색할 컬럼 인덱스 (비어있으면 모든 컬럼)
            highlightMatches: false, // 일치 항목 강조 표시
            highlightClass: 'highlight', // 강조 표시에 사용할 클래스
            clearButton: null, // 필터 초기화 버튼 ID 또는 요소
            onFiltered: null // 필터링 후 콜백 함수
        };
        
        const settings = { ...defaultOptions, ...options };
        
        // 현재 데이터 상태 저장
        const data = {
            rows: Array.from(table.querySelectorAll('tbody tr')),
            visibleCount: 0,
            lastFilter: ''
        };
        
        // 테이블 본문 참조
        const tbody = table.querySelector('tbody');
        
        // 필터 함수
        const filterTable = () => {
            const filterValue = input.value.trim();
            
            // 최소 길이 확인
            if (filterValue.length < settings.minLength) {
                // 모든 행 표시
                data.rows.forEach(row => {
                    row.style.display = '';
                });
                
                data.visibleCount = data.rows.length;
                
                // 콜백 호출
                if (typeof settings.onFiltered === 'function') {
                    settings.onFiltered(data.visibleCount, data.rows.length, '');
                }
                
                return;
            }
            
            // 이전 필터와 동일한 경우 스킵
            if (filterValue === data.lastFilter) return;
            data.lastFilter = filterValue;
            
            let visibleCount = 0;
            
            // 행 필터링
            data.rows.forEach(row => {
                let showRow = false;
                
                // 검색할 셀 결정
                const cells = row.querySelectorAll('td');
                const searchCells = settings.columnIndexes.length > 0 
                    ? settings.columnIndexes.map(i => cells[i]).filter(Boolean)
                    : cells;
                
                // 강조 표시 초기화
                if (settings.highlightMatches) {
                    searchCells.forEach(cell => {
                        cell.innerHTML = cell.textContent;
                    });
                }
                
                // 셀 내용 검색
                for (const cell of searchCells) {
                    const content = cell.textContent.trim();
                    
                    if (settings.caseSensitive) {
                        showRow = content.includes(filterValue);
                    } else {
                        showRow = content.toLowerCase().includes(filterValue.toLowerCase());
                    }
                    
                    // 일치하는 항목을 찾으면 중단
                    if (showRow) {
                        // 강조 표시 적용
                        if (settings.highlightMatches) {
                            _highlightText(cell, filterValue, settings.highlightClass, settings.caseSensitive);
                        }
                        break;
                    }
                }
                
                // 행 표시 상태 설정
                row.style.display = showRow ? '' : 'none';
                
                if (showRow) visibleCount++;
            });
            
            data.visibleCount = visibleCount;
            
            // 콜백 호출
            if (typeof settings.onFiltered === 'function') {
                settings.onFiltered(visibleCount, data.rows.length, filterValue);
            }
        };
        
        // 이벤트 리스너 등록
        if (settings.filterOnEnter) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    filterTable();
                }
            });
        } else {
            input.addEventListener('input', filterTable);
        }
        
        // 초기화 버튼 설정
        if (settings.clearButton) {
            const clearBtn = typeof settings.clearButton === 'string' 
                ? document.getElementById(settings.clearButton)
                : settings.clearButton;
                
            if (clearBtn) {
                clearBtn.addEventListener('click', () => {
                    input.value = '';
                    filterTable();
                });
            }
        }
        
        // 초기 필터링 실행
        setTimeout(filterTable, 100);
        
        // 컨트롤 객체 반환
        return {
            filter: filterTable,
            reset: () => {
                input.value = '';
                filterTable();
            },
            getFilteredCount: () => data.visibleCount,
            getTotalCount: () => data.rows.length,
            getCurrentFilter: () => data.lastFilter,
            update: () => {
                // 행 데이터 갱신
                data.rows = Array.from(table.querySelectorAll('tbody tr'));
                filterTable();
            }
        };
    }
    
    /**
     * 텍스트를 강조 표시합니다.
     * 
     * @param {Element} cell - 강조 표시할 셀 요소
     * @param {string} searchText - 검색 텍스트
     * @param {string} highlightClass - 강조 표시에 사용할 클래스
     * @param {boolean} caseSensitive - 대소문자 구분 여부
     * @private
     */
    function _highlightText(cell, searchText, highlightClass, caseSensitive) {
        const cellText = cell.textContent;
        let regex;
        
        if (caseSensitive) {
            regex = new RegExp(`(${_escapeRegExp(searchText)})`, 'g');
        } else {
            regex = new RegExp(`(${_escapeRegExp(searchText)})`, 'gi');
        }
        
        cell.innerHTML = cellText.replace(regex, `<span class="${highlightClass}">$1</span>`);
    }
    
    /**
     * 정규식 특수문자를 이스케이프합니다.
     * 
     * @param {string} text - 이스케이프할 텍스트
     * @returns {string} 이스케이프된 텍스트
     * @private
     */
    function _escapeRegExp(text) {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    /**
     * 테이블 페이지네이션을 초기화합니다.
     * 
     * @param {Object} options - 페이지네이션 옵션
     * @param {string} options.tableSelector - 테이블 선택자
     * @param {number} [options.itemsPerPage=10] - 페이지당 항목 수
     * @param {string} [options.paginationContainer] - 페이지네이션 컨테이너 선택자
     * @param {Object} [options.paginationOptions] - 페이지네이션 UI 옵션
     * @param {Function} [options.onPageChange] - 페이지 변경 시 콜백 함수
     * @returns {Object} 페이지네이션 컨트롤 객체
     * @throws {Error} 테이블을 찾을 수 없는 경우
     * 
     * @example
     * // 기본 설정으로 초기화
     * const pagination = TableFilter.initializePagination({
     *   tableSelector: '#userTable',
     *   itemsPerPage: 20,
     *   paginationContainer: '#pagination'
     * });
     * 
     * // 고급 설정으로 초기화
     * const pagination = TableFilter.initializePagination({
     *   tableSelector: '#userTable',
     *   itemsPerPage: 15,
     *   paginationContainer: '#pagination',
     *   paginationOptions: {
     *     showFirstLast: true,
     *     showPrevNext: true,
     *     maxVisiblePages: 5
     *   },
     *   onPageChange: (page, totalPages) => {
     *     console.log(`현재 페이지: ${page}/${totalPages}`);
     *   }
     * });
     */
    function initializePagination(options) {
        const defaultOptions = {
            tableSelector: '',
            itemsPerPage: 10,
            pageControlsSelector: '',
            pageInfoSelector: '',
            pageSizeSelector: '',
            pageSizeOptions: [10, 25, 50, 100],
            onPageChanged: null,
            hideEmptyControls: true,
            autoInit: true
        };
        
        const settings = { ...defaultOptions, ...options };
        
        const table = document.querySelector(settings.tableSelector);
        const pageControls = document.querySelector(settings.pageControlsSelector);
        const pageInfo = document.querySelector(settings.pageInfoSelector);
        const pageSizeSelect = document.querySelector(settings.pageSizeSelector);
        
        if (!table) {
            console.error(`테이블을 찾을 수 없습니다: ${settings.tableSelector}`);
            return null;
        }
        
        // 상태 객체
        const state = {
            currentPage: 1,
            itemsPerPage: settings.itemsPerPage,
            totalItems: 0,
            totalPages: 0,
            tbody: table.querySelector('tbody'),
            rows: [],
            filteredRows: [],
        };
        
        // 페이지 변경 함수
        const changePage = (page) => {
            // 유효한 페이지 번호인지 확인
            if (page < 1 || page > state.totalPages) {
                return false;
            }
            
            state.currentPage = page;
            
            // 행 표시 상태 업데이트
            state.filteredRows.forEach((row, index) => {
                const startIndex = (state.currentPage - 1) * state.itemsPerPage;
                const endIndex = startIndex + state.itemsPerPage;
                
                row.style.display = (index >= startIndex && index < endIndex) ? '' : 'none';
            });
            
            // UI 업데이트
            updatePaginationUI();
            
            // 콜백 호출
            if (typeof settings.onPageChanged === 'function') {
                settings.onPageChanged(state.currentPage, state.totalPages, state.itemsPerPage);
            }
            
            return true;
        };
        
        // 페이지네이션 UI 업데이트
        const updatePaginationUI = () => {
            // 페이지 크기가 전체 행보다 크면 페이지네이션 숨김
            if (settings.hideEmptyControls && state.itemsPerPage >= state.filteredRows.length) {
                if (pageControls) pageControls.style.display = 'none';
                if (pageInfo) pageInfo.style.display = 'none';
                if (pageSizeSelect) pageSizeSelect.style.display = 'none';
                return;
            } else {
                if (pageControls) pageControls.style.display = '';
                if (pageInfo) pageInfo.style.display = '';
                if (pageSizeSelect) pageSizeSelect.style.display = '';
            }
            
            // 페이지 정보 업데이트
            if (pageInfo) {
                const startItem = Math.min(
                    (state.currentPage - 1) * state.itemsPerPage + 1,
                    state.filteredRows.length
                );
                const endItem = Math.min(
                    state.currentPage * state.itemsPerPage,
                    state.filteredRows.length
                );
                
                pageInfo.textContent = `${startItem}-${endItem} / ${state.filteredRows.length}`;
            }
            
            // 페이지 컨트롤 업데이트
            if (pageControls) {
                pageControls.innerHTML = '';
                
                // 페이지 번호 최대 표시 개수
                const maxPageButtons = 5;
                let startPage = Math.max(1, state.currentPage - Math.floor(maxPageButtons / 2));
                let endPage = Math.min(state.totalPages, startPage + maxPageButtons - 1);
                
                // 표시할 페이지 수 조정
                if (endPage - startPage + 1 < maxPageButtons && state.totalPages > maxPageButtons) {
                    startPage = Math.max(1, endPage - maxPageButtons + 1);
                }
                
                // 이전 페이지 버튼
                if (state.currentPage > 1) {
                    const prevButton = _createPageButton('‹', state.currentPage - 1);
                    pageControls.appendChild(prevButton);
                }
                
                // 첫 페이지 버튼 (필요한 경우)
                if (startPage > 1) {
                    const firstButton = _createPageButton('1', 1);
                    pageControls.appendChild(firstButton);
                    
                    if (startPage > 2) {
                        const ellipsis = document.createElement('span');
                        ellipsis.textContent = '...';
                        ellipsis.className = 'pagination-ellipsis';
                        pageControls.appendChild(ellipsis);
                    }
                }
                
                // 페이지 번호 버튼
                for (let i = startPage; i <= endPage; i++) {
                    const pageButton = _createPageButton(i.toString(), i, i === state.currentPage);
                    pageControls.appendChild(pageButton);
                }
                
                // 마지막 페이지 버튼 (필요한 경우)
                if (endPage < state.totalPages) {
                    if (endPage < state.totalPages - 1) {
                        const ellipsis = document.createElement('span');
                        ellipsis.textContent = '...';
                        ellipsis.className = 'pagination-ellipsis';
                        pageControls.appendChild(ellipsis);
                    }
                    
                    const lastButton = _createPageButton(state.totalPages.toString(), state.totalPages);
                    pageControls.appendChild(lastButton);
                }
                
                // 다음 페이지 버튼
                if (state.currentPage < state.totalPages) {
                    const nextButton = _createPageButton('›', state.currentPage + 1);
                    pageControls.appendChild(nextButton);
                }
            }
        };
        
        // 페이지 버튼 생성
        const _createPageButton = (text, page, isActive = false) => {
            const button = document.createElement('button');
            button.textContent = text;
            button.className = `page-button ${isActive ? 'active' : ''}`;
            button.addEventListener('click', () => changePage(page));
            return button;
        };
        
        // 필터링 및 업데이트
        const filterAndUpdate = (filterFn) => {
            // 모든 행 가져오기
            state.rows = Array.from(state.tbody.querySelectorAll('tr'));
            
            // 필터링
            if (typeof filterFn === 'function') {
                state.filteredRows = state.rows.filter(filterFn);
            } else {
                state.filteredRows = [...state.rows];
            }
            
            // 페이지 수 계산
            state.totalItems = state.filteredRows.length;
            state.totalPages = Math.max(1, Math.ceil(state.totalItems / state.itemsPerPage));
            
            // 현재 페이지가 유효한지 확인
            if (state.currentPage > state.totalPages) {
                state.currentPage = state.totalPages;
            }
            
            // 페이지 변경
            changePage(state.currentPage);
        };
        
        // 페이지 크기 선택 초기화
        if (pageSizeSelect) {
            // 옵션 추가
            pageSizeSelect.innerHTML = '';
            settings.pageSizeOptions.forEach(size => {
                const option = document.createElement('option');
                option.value = size;
                option.textContent = `${size}개씩 보기`;
                option.selected = size === state.itemsPerPage;
                pageSizeSelect.appendChild(option);
            });
            
            // 이벤트 리스너 등록
            pageSizeSelect.addEventListener('change', () => {
                state.itemsPerPage = parseInt(pageSizeSelect.value, 10);
                state.totalPages = Math.max(1, Math.ceil(state.totalItems / state.itemsPerPage));
                
                // 현재 페이지가 유효한지 확인
                if (state.currentPage > state.totalPages) {
                    state.currentPage = state.totalPages;
                }
                
                // 페이지 변경
                changePage(state.currentPage);
            });
        }
        
        // 자동 초기화
        if (settings.autoInit) {
            filterAndUpdate();
        }
        
        // 컨트롤 객체 반환
        return {
            goToPage: changePage,
            nextPage: () => changePage(state.currentPage + 1),
            prevPage: () => changePage(state.currentPage - 1),
            firstPage: () => changePage(1),
            lastPage: () => changePage(state.totalPages),
            filter: filterAndUpdate,
            getCurrentPage: () => state.currentPage,
            getTotalPages: () => state.totalPages,
            getItemsPerPage: () => state.itemsPerPage,
            setItemsPerPage: (size) => {
                state.itemsPerPage = parseInt(size, 10);
                state.totalPages = Math.max(1, Math.ceil(state.totalItems / state.itemsPerPage));
                if (pageSizeSelect) {
                    pageSizeSelect.value = size;
                }
                
                // 현재 페이지가 유효한지 확인
                if (state.currentPage > state.totalPages) {
                    state.currentPage = state.totalPages;
                }
                
                changePage(state.currentPage);
            },
            refresh: () => filterAndUpdate()
        };
    }
    
    /**
     * 테이블 검색 기능을 초기화합니다.
     * 
     * @param {Object} options - 검색 옵션
     * @param {string} options.tableSelector - 테이블 선택자
     * @param {string} options.searchInput - 검색 입력 요소 선택자
     * @param {string[]} [options.searchColumns] - 검색할 컬럼 목록
     * @param {Object} [options.searchOptions] - 검색 세부 옵션
     * @param {Function} [options.onSearch] - 검색 완료 시 콜백 함수
     * @returns {Object} 검색 컨트롤 객체
     * @throws {Error} 테이블 또는 검색 입력 요소를 찾을 수 없는 경우
     * 
     * @example
     * // 기본 설정으로 초기화
     * const search = TableFilter.initializeTableSearch({
     *   tableSelector: '#userTable',
     *   searchInput: '#searchInput',
     *   searchColumns: ['name', 'email']
     * });
     * 
     * // 고급 설정으로 초기화
     * const search = TableFilter.initializeTableSearch({
     *   tableSelector: '#userTable',
     *   searchInput: '#searchInput',
     *   searchColumns: ['name', 'email', 'department'],
     *   searchOptions: {
     *     caseSensitive: false,
     *     highlightMatches: true,
     *     minLength: 2,
     *     debounceTime: 300
     *   },
     *   onSearch: (results, total) => {
     *     console.log(`검색 결과: ${results}/${total}`);
     *   }
     * });
     */
    function initializeTableSearch(options) {
        const defaultOptions = {
            tableSelector: '',
            searchInputSelector: '',
            searchButtonSelector: '',
            clearButtonSelector: '',
            searchOnInput: true,
            searchDelay: 300,
            highlightMatches: true,
            highlightClass: 'search-highlight',
            caseSensitive: false,
            searchableColumns: [],
            minLength: 2,
            onSearched: null,
            noResultsMessage: '검색 결과가 없습니다.',
            noResultsSelector: ''
        };
        
        const settings = { ...defaultOptions, ...options };
        
        const table = document.querySelector(settings.tableSelector);
        const searchInput = document.querySelector(settings.searchInputSelector);
        const searchButton = document.querySelector(settings.searchButtonSelector);
        const clearButton = document.querySelector(settings.clearButtonSelector);
        const noResultsElement = document.querySelector(settings.noResultsSelector);
        
        if (!table || !searchInput) {
            console.error(`테이블 또는 검색 입력 요소를 찾을 수 없습니다.`);
            return null;
        }
        
        // 상태 객체
        const state = {
            searchTerm: '',
            timer: null,
            totalRows: 0,
            visibleRows: 0,
            tbody: table.querySelector('tbody')
        };
        
        // 검색 실행 함수
        const performSearch = () => {
            const searchTerm = searchInput.value.trim();
            state.searchTerm = searchTerm;
            
            // 최소 길이 확인
            if (searchTerm.length < settings.minLength) {
                // 모든 행 표시
                const rows = state.tbody.querySelectorAll('tr');
                rows.forEach(row => {
                    row.style.display = '';
                    
                    // 강조 표시 제거
                    if (settings.highlightMatches) {
                        row.querySelectorAll(`.${settings.highlightClass}`).forEach(el => {
                            const parent = el.parentNode;
                            parent.replaceChild(document.createTextNode(el.textContent), el);
                            parent.normalize();
                        });
                    }
                });
                
                state.visibleRows = rows.length;
                state.totalRows = rows.length;
                
                // 검색 결과 없음 메시지 숨김
                if (noResultsElement) {
                    noResultsElement.style.display = 'none';
                }
                
                // 콜백 호출
                if (typeof settings.onSearched === 'function') {
                    settings.onSearched(state.visibleRows, state.totalRows, searchTerm);
                }
                
                return;
            }
            
            // 검색 로직
            const rows = state.tbody.querySelectorAll('tr');
            state.totalRows = rows.length;
            state.visibleRows = 0;
            
            // 정규식 패턴 생성
            let pattern;
            try {
                pattern = new RegExp(searchTerm, settings.caseSensitive ? 'g' : 'gi');
            } catch (e) {
                // 정규식 에러 처리 (이스케이프 적용)
                pattern = new RegExp(_escapeRegExp(searchTerm), settings.caseSensitive ? 'g' : 'gi');
            }
            
            rows.forEach(row => {
                let isMatch = false;
                const cells = row.querySelectorAll('td');
                
                // 검색 대상 셀 결정
                const searchCells = settings.searchableColumns.length > 0
                    ? Array.from(cells).filter((_, index) => settings.searchableColumns.includes(index))
                    : cells;
                
                // 강조 표시 제거
                if (settings.highlightMatches) {
                    row.querySelectorAll(`.${settings.highlightClass}`).forEach(el => {
                        const parent = el.parentNode;
                        parent.replaceChild(document.createTextNode(el.textContent), el);
                        parent.normalize();
                    });
                }
                
                // 셀 검색
                for (const cell of searchCells) {
                    const cellText = cell.textContent.trim();
                    
                    // 검색어 포함 여부 확인
                    if (!settings.caseSensitive && cellText.toLowerCase().includes(searchTerm.toLowerCase())) {
                        isMatch = true;
                        
                        // 강조 표시
                        if (settings.highlightMatches) {
                            _highlightMatches(cell, pattern);
                        }
                    } else if (settings.caseSensitive && cellText.includes(searchTerm)) {
                        isMatch = true;
                        
                        // 강조 표시
                        if (settings.highlightMatches) {
                            _highlightMatches(cell, pattern);
                        }
                    }
                }
                
                // 행 표시 상태 설정
                row.style.display = isMatch ? '' : 'none';
                
                if (isMatch) {
                    state.visibleRows++;
                }
            });
            
            // 검색 결과 없음 메시지 표시
            if (noResultsElement) {
                noResultsElement.style.display = state.visibleRows === 0 ? 'block' : 'none';
                
                if (typeof settings.noResultsMessage === 'string' && state.visibleRows === 0) {
                    noResultsElement.textContent = settings.noResultsMessage;
                }
            }
            
            // 콜백 호출
            if (typeof settings.onSearched === 'function') {
                settings.onSearched(state.visibleRows, state.totalRows, searchTerm);
            }
        };
        
        // 텍스트 강조 표시
        const _highlightMatches = (element, pattern) => {
            // 원본 HTML 저장
            const originalHTML = element.innerHTML;
            
            // 텍스트 노드만 처리
            const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
            const textNodes = [];
            
            let node;
            while (node = walker.nextNode()) {
                textNodes.push(node);
            }
            
            textNodes.forEach(textNode => {
                const parent = textNode.parentNode;
                const text = textNode.nodeValue;
                
                // 패턴 초기화 (lastIndex 리셋)
                pattern.lastIndex = 0;
                
                // 정규식으로 매치 찾기
                let match;
                let lastIndex = 0;
                let fragments = [];
                
                while (match = pattern.exec(text)) {
                    // 매치 전 텍스트 추가
                    if (match.index > lastIndex) {
                        fragments.push(document.createTextNode(text.slice(lastIndex, match.index)));
                    }
                    
                    // 매치된 텍스트에 강조 표시 추가
                    const span = document.createElement('span');
                    span.className = settings.highlightClass;
                    span.textContent = match[0];
                    fragments.push(span);
                    
                    lastIndex = pattern.lastIndex;
                }
                
                // 남은 텍스트 추가
                if (lastIndex < text.length) {
                    fragments.push(document.createTextNode(text.slice(lastIndex)));
                }
                
                // 텍스트 노드 대체
                if (fragments.length > 0) {
                    // 원본 노드 제거
                    parent.replaceChild(fragments[0], textNode);
                    
                    // 나머지 fragment 추가
                    for (let i = 1; i < fragments.length; i++) {
                        parent.insertBefore(fragments[i], fragments[i-1].nextSibling);
                    }
                }
            });
        };
        
        // 입력 처리 (디바운스 적용)
        const handleInput = () => {
            clearTimeout(state.timer);
            state.timer = setTimeout(performSearch, settings.searchDelay);
        };
        
        // 이벤트 리스너 등록
        if (settings.searchOnInput) {
            searchInput.addEventListener('input', handleInput);
        }
        
        if (searchButton) {
            searchButton.addEventListener('click', (e) => {
                e.preventDefault();
                clearTimeout(state.timer);
                performSearch();
            });
        }
        
        if (clearButton) {
            clearButton.addEventListener('click', (e) => {
                e.preventDefault();
                searchInput.value = '';
                clearTimeout(state.timer);
                performSearch();
            });
        }
        
        // Enter 키 처리
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                clearTimeout(state.timer);
                performSearch();
            }
        });
        
        // 초기 검색 실행
        setTimeout(performSearch, 100);
        
        // 정리 함수 및 컨트롤 객체 반환
        return {
            search: (term) => {
                if (term !== undefined) {
                    searchInput.value = term;
                }
                clearTimeout(state.timer);
                performSearch();
            },
            clear: () => {
                searchInput.value = '';
                clearTimeout(state.timer);
                performSearch();
            },
            getResults: () => ({
                visible: state.visibleRows,
                total: state.totalRows,
                term: state.searchTerm
            }),
            refresh: performSearch,
            cleanup: () => {
                searchInput.removeEventListener('input', handleInput);
                if (searchButton) {
                    searchButton.removeEventListener('click', performSearch);
                }
                if (clearButton) {
                    clearButton.removeEventListener('click', () => {
                        searchInput.value = '';
                        performSearch();
                    });
                }
                searchInput.removeEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        performSearch();
                    }
                });
            }
        };
    }
    
    // 공개 API
    return {
        initializeTableFilter,
        initializePagination,
        initializeTableSearch
    };
})();

export default TableFilter; 