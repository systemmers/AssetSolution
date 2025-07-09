/**
 * 사용자 상세 페이지 메인 JavaScript 모듈
 * @module users/detail/index
 */
import { initBasicInfo, initPasswordResetModal } from './user-info-manager.js';
import { initTabEvents } from './tab-manager.js';
import { initAssetTable } from './asset-manager.js';
import { initActivityLog } from './activity-manager.js';
import { initAttachmentManagement } from './attachment-manager.js';

// 이벤트 리스너 정리를 위한 정리 함수 배열
const cleanupFunctions = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('사용자 상세 페이지 스크립트 로드됨');
    
    // 기본 정보 및 비밀번호 초기화 모달 초기화
    const userInfoCleanup = initBasicInfo();
    if (userInfoCleanup) cleanupFunctions.push(userInfoCleanup);
    
    const passwordResetCleanup = initPasswordResetModal();
    if (passwordResetCleanup) cleanupFunctions.push(passwordResetCleanup);
    
    // 탭 전환 이벤트 초기화
    const tabCleanup = initTabEvents();
    if (tabCleanup) cleanupFunctions.push(tabCleanup);
    
    // 자산 목록 테이블 초기화
    const assetTableCleanup = initAssetTable();
    if (assetTableCleanup) cleanupFunctions.push(assetTableCleanup);
    
    // 사용자 활동 로그 초기화
    const activityCleanup = initActivityLog();
    if (activityCleanup) cleanupFunctions.push(activityCleanup);
    
    // 첨부 파일 관리 초기화
    const attachmentCleanup = initAttachmentManagement();
    if (attachmentCleanup) cleanupFunctions.push(attachmentCleanup);
    
    // DOM 언로드 시 이벤트 리스너 정리
    window.addEventListener('beforeunload', cleanup);
});

/**
 * 모든 이벤트 리스너 정리
 */
function cleanup() {
    console.log('사용자 상세 페이지 이벤트 리스너 정리 중...');
    cleanupFunctions.forEach(fn => {
        if (typeof fn === 'function') fn();
    });
} 