/**
 * 테이블 모듈 통합 인덱스
 * 모든 테이블 관련 모듈을 통합하여 내보냅니다.
 * 
 * @module common/table
 */

import TableCore from './TableCore.js';
import TableSorter from './TableSorter.js';
import TableFilter from './TableFilter.js';
import TableExport from './TableExport.js';

// 모든 모듈을 통합하여 내보냄
export {
    TableCore,
    TableSorter,
    TableFilter,
    TableExport
};

// 기본 내보내기로 TableCore 제공
export default TableCore; 