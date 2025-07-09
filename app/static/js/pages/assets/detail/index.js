/**
 * 자산 상세 페이지 통합 모듈
 * 분리된 모듈들을 통합하여 자산 상세 페이지 기능을 초기화합니다.
 */

// 모듈 가져오기
import { initDeleteConfirmation, cleanup } from './AssetDetailCore.js';
import { initMaintenanceTable, initMaintenanceModalHandlers } from './AssetMaintenanceManager.js';
import { initFileModalHandlers, initFileDeleteHandlers } from './AssetFileManager.js';
import { initQrCodePrint, initAssetInfoPrint } from './AssetPrint.js';
import { initAssetValueCalculation } from './AssetValueCalculator.js';

// DOM 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('자산 상세 페이지 스크립트 로드됨');
    
    // 모달 이벤트 핸들러 초기화
    initFileModalHandlers();
    initMaintenanceModalHandlers();
    
    // 파일 삭제 이벤트 초기화
    initFileDeleteHandlers();
    
    // QR 코드 인쇄 이벤트 초기화
    initQrCodePrint();
    
    // 자산 정보 인쇄 기능 초기화
    initAssetInfoPrint();
    
    // 자산 가치 계산 초기화
    initAssetValueCalculation();
    
    // 유지보수 내역 테이블 초기화
    initMaintenanceTable();
    
    // 삭제 확인 모달 초기화
    initDeleteConfirmation();
    
    // 페이지 언로드 시 이벤트 리스너 정리
    window.addEventListener('beforeunload', cleanup);
});

// 모듈 통합 객체 내보내기
export default {
    initDeleteConfirmation,
    initFileModalHandlers,
    initFileDeleteHandlers,
    initMaintenanceModalHandlers,
    initMaintenanceTable,
    initQrCodePrint,
    initAssetInfoPrint,
    initAssetValueCalculation,
    cleanup
}; 