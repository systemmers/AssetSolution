/**
 * 인벤토리 리포트 내보내기 관리 모듈
 * @module inventory/report/export-manager
 */
import UIUtils from '../../../../common/ui-utils.js';

/**
 * 인쇄 버튼 초기화
 * @returns {Function} 이벤트 정리 함수
 */
export function initPrintButton() {
    const printButton = document.querySelector('.btn-print');
    if (!printButton) return null;
    
    // 인쇄 버튼 이벤트 핸들러
    const handlePrint = function() {
        // 인쇄할 콘텐츠의 ID를 지정하여 인쇄 기능 실행
        UIUtils.printContent('content', {
            title: '자산 실사 보고서',
            printCss: '/static/css/pages/inventory/report-print.css',
            hideAfterPrint: true,
            beforePrint: function() {
                UIUtils.showAlert('인쇄를 준비 중입니다...', 'info', 1500);
            },
            afterPrint: function() {
                UIUtils.showAlert('인쇄가 완료되었습니다.', 'success');
            }
        });
    };
    
    // UIUtils를 사용하여 인쇄 기능 구현
    UIUtils.setupActionButton(printButton, handlePrint);
    
    // 정리 함수 반환
    return function cleanup() {
        printButton.removeEventListener('click', handlePrint);
    };
}

/**
 * 내보내기 버튼 초기화
 * @returns {Function} 이벤트 정리 함수
 */
export function initExportButton() {
    const exportButton = document.querySelector('.btn-export');
    if (!exportButton) return null;
    
    // 내보내기 버튼 이벤트 핸들러
    const handleExport = function() {
        // 실제 구현 시 PDF 내보내기 기능 추가
        UIUtils.showAlert('보고서를 PDF로 내보내는 기능은 구현 중입니다.', 'info');
        
        // 실제 구현에서는 html2pdf.js나 jsPDF 같은 라이브러리 사용
        if (typeof html2pdf !== 'undefined') {
            try {
                UIUtils.showAlert('PDF를 생성하는 중입니다. 잠시 기다려주세요...', 'info');
                
                // PDF 설정
                const options = {
                    margin: 1,
                    filename: '자산실사보고서.pdf',
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2 },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                };
                
                // PDF 생성 및 저장
                html2pdf()
                    .from(document.getElementById('content'))
                    .set(options)
                    .save()
                    .then(() => {
                        UIUtils.showAlert('PDF 파일이 생성되었습니다.', 'success');
                    })
                    .catch(error => {
                        console.error('PDF 생성 중 오류:', error);
                        UIUtils.showAlert('PDF 생성 중 오류가 발생했습니다.', 'danger');
                    });
            } catch (error) {
                console.error('PDF 내보내기 오류:', error);
                UIUtils.showAlert('PDF 내보내기 중 오류가 발생했습니다.', 'danger');
            }
        } else {
            UIUtils.showAlert('PDF 내보내기를 위해 html2pdf 라이브러리가 필요합니다.', 'warning');
        }
    };
    
    // UIUtils를 사용하여 내보내기 버튼 초기화
    UIUtils.setupActionButton(exportButton, handleExport);
    
    // 정리 함수 반환
    return function cleanup() {
        exportButton.removeEventListener('click', handleExport);
    };
} 