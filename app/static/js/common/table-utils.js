/**
 * TableUtils 모듈 (호환성 유지용)
 * 
 * 이 파일은 기존 코드와의 호환성을 위해 유지됩니다.
 * 모든 기능은 /table 디렉토리의 모듈들로 분리되었습니다.
 * 
 * 새로운 코드에서는 다음과 같이 직접 import하세요:
 * import TableUtils from '../common/table/index.js';
 * 
 * 또는 특정 모듈만 가져오기:
 * import TableSorter from '../common/table/TableSorter.js';
 * import TableFilter from '../common/table/TableFilter.js';
 * import TableEvents from '../common/table/TableEvents.js';
 * import TableExport from '../common/table/TableExport.js';
 * import TablePagination from '../common/table/TablePagination.js';
 */

// 임시 TableUtils 객체 (기본 기능만 제공)
const TableUtils = {
    initializeTableSorting: function(options) {
        console.log('테이블 정렬 초기화:', options);
        return null;
    }
};

// 전역 변수로 설정
window.TableUtils = TableUtils; 