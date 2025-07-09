/**
 * 인벤토리 폼 인쇄 기능 관리 모듈
 * @module inventory/form/print-manager
 */
import UIUtils from '../../../../common/ui-utils.js';

/**
 * 인쇄 기능 초기화
 * @returns {Function} 이벤트 정리 함수
 */
export function initPrintFunction() {
    const printButton = document.getElementById('printInventory');
    if (!printButton) return null;
    
    // 인쇄 버튼 이벤트 핸들러
    const handlePrintClick = function() {
        // 인쇄할 컨텐츠 컨테이너 ID (편집 모드에서는 전체 폼 내용, 상세 보기에서는 해당 섹션)
        const contentId = 'inventoryContent';
        
        UIUtils.printContent(contentId, {
            title: '자산실사 정보',
            beforePrint: function() {
                UIUtils.showAlert('인쇄를 준비 중입니다...', 'info', 1500);
            },
            afterPrint: function() {
                UIUtils.showAlert('인쇄가 완료되었습니다.', 'success');
            },
            cssFiles: ['/static/css/print.css'],
            printOptions: {
                // 인쇄 옵션 (브라우저에 따라 지원 여부 다름)
                removeElements: '.no-print, .btn, button, .action-buttons',
                addHeaderFooter: true,
                headerTemplate: `
                    <div style="font-size: 10px; width: 100%; text-align: center; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
                        자산관리 시스템 - 자산실사 정보
                    </div>
                `,
                footerTemplate: `
                    <div style="font-size: 10px; width: 100%; text-align: center; border-top: 1px solid #ddd; padding-top: 5px;">
                        인쇄일시: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} - 페이지 <span class="pageNumber"></span> / <span class="totalPages"></span>
                    </div>
                `
            }
        });
    };
    
    // 이벤트 등록
    UIUtils.setupActionButton(printButton, handlePrintClick);
    
    // 정리 함수 반환
    return function cleanup() {
        printButton.removeEventListener('click', handlePrintClick);
    };
} 