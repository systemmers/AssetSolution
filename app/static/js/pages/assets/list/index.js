/**
 * 자산 목록 페이지 통합 모듈
 * 분리된 모듈들을 통합하여 자산 목록 페이지 기능을 초기화합니다.
 */

// 모듈 가져오기
import { initAssetTable, cleanup } from './AssetListCore.js';
import { initSearchForm } from './AssetListSearch.js';
import { initViewModeToggle, initExportButtons, exportSelectedAssets } from './AssetListView.js';
import { initAssetActionButtons, initBulkSelection } from './AssetStatusManager.js';

// DOM 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('자산 목록 페이지 스크립트 로드됨');
    
    // 검색 및 필터 폼 초기화
    initSearchForm();
    
    // 테이블 행 클릭 이벤트 및 정렬 초기화
    initAssetTable();
    
    // 뷰 모드 변경 (카드/테이블 뷰)
    initViewModeToggle();
    
    // 테이블 내보내기 기능 초기화
    initExportButtons();
    
    // 자산 상태 변경 버튼 초기화
    initAssetActionButtons();
    
    // 일괄 선택 기능 초기화
    initBulkSelection();
    
    // 선택된 자산 내보내기 이벤트 리스너
    document.addEventListener('exportSelectedAssets', function(e) {
        if (e.detail && e.detail.assetIds) {
            exportSelectedAssets(e.detail.assetIds);
        }
    });
    
    // 페이지가 언로드될 때 이벤트 리스너 정리
    window.addEventListener('beforeunload', cleanup);
});

// 모듈 통합 객체 내보내기
export default {
    initAssetTable,
    initSearchForm,
    initViewModeToggle,
    initExportButtons,
    initAssetActionButtons,
    initBulkSelection,
    cleanup
}; 