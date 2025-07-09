/**
 * 자산 인쇄 모듈
 * 자산 정보 및 QR 코드 인쇄 기능을 담당합니다.
 */

import UIUtils from '../../../common/ui-utils.js';

/**
 * QR 코드 인쇄 기능 초기화
 */
function initQrCodePrint() {
    const printQrButton = document.getElementById('printQrBtn');
    if (!printQrButton) return;
    
    UIUtils.setupActionButton(printQrButton, function() {
        _prepareAndPrintQrCode();
    });
}

/**
 * QR 코드 인쇄 준비 및 실행
 * @private
 */
function _prepareAndPrintQrCode() {
    const assetNumberEl = document.querySelector('[data-asset-number]');
    const assetNameEl = document.querySelector('.asset-name');
    
    if (!assetNumberEl || !assetNameEl) {
        UIUtils.showAlert('자산 정보를 찾을 수 없습니다.', 'warning');
        return;
    }
    
    const assetNumber = assetNumberEl.dataset.assetNumber;
    const assetName = assetNameEl.textContent.trim();
    
    _printQrCodeWithTemplate(assetNumber, assetName);
}

/**
 * QR 코드 템플릿으로 인쇄
 * @param {string} assetNumber - 자산 번호
 * @param {string} assetName - 자산 이름
 * @private
 */
function _printQrCodeWithTemplate(assetNumber, assetName) {
    const printWindow = window.open('', '_blank', 'width=600,height=600');
    
    if (!printWindow) {
        UIUtils.showAlert('팝업 창을 열 수 없습니다. 팝업 차단을 해제해 주세요.', 'warning');
        return;
    }
    
    // 인쇄용 템플릿 생성
    printWindow.document.write(_generateQrPrintTemplate(assetNumber, assetName));
    printWindow.document.close();
    
    // 이미지 로딩 완료 후 인쇄
    printWindow.onload = function() {
        setTimeout(() => {
            printWindow.print();
            printWindow.onafterprint = function() {
                printWindow.close();
            };
        }, 500);
    };
}

/**
 * QR 코드 인쇄용 HTML 템플릿 생성
 * @param {string} assetNumber - 자산 번호
 * @param {string} assetName - 자산 이름
 * @returns {string} HTML 템플릿
 * @private
 */
function _generateQrPrintTemplate(assetNumber, assetName) {
    // QR 코드 API URL (실제 환경에 맞게 조정 필요)
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(assetNumber)}`;
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>자산 QR 코드 - ${assetNumber}</title>
            <meta charset="utf-8">
            <style>
                @media print {
                    @page {
                        size: 58mm 40mm;
                        margin: 0;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                    }
                    .print-content {
                        width: 58mm;
                        height: 40mm;
                    }
                }
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                }
                .print-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 5mm;
                    box-sizing: border-box;
                }
                .asset-number {
                    font-weight: bold;
                    font-size: 12pt;
                    margin-bottom: 2mm;
                }
                .asset-name {
                    font-size: 10pt;
                    margin-bottom: 3mm;
                    text-align: center;
                    max-width: 48mm;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .qr-code {
                    width: 25mm;
                    height: 25mm;
                }
            </style>
        </head>
        <body>
            <div class="print-content">
                <div class="asset-number">${assetNumber}</div>
                <div class="asset-name">${assetName}</div>
                <img class="qr-code" src="${qrApiUrl}" alt="QR Code">
            </div>
        </body>
        </html>
    `;
}

/**
 * 자산 정보 인쇄 기능 초기화
 */
function initAssetInfoPrint() {
    const printInfoButton = document.getElementById('printInfoBtn');
    if (!printInfoButton) return;
    
    UIUtils.setupActionButton(printInfoButton, function() {
        _prepareAndPrintAssetInfo();
    });
}

/**
 * 자산 정보 인쇄 준비 및 실행
 * @private
 */
function _prepareAndPrintAssetInfo() {
    const assetInfoCard = document.querySelector('.asset-info-card');
    const assetHistoryCard = document.querySelector('.asset-history-card');
    
    if (!assetInfoCard) {
        UIUtils.showAlert('인쇄할 자산 정보를 찾을 수 없습니다.', 'warning');
        return;
    }
    
    const printWindow = window.open('', '_blank', 'width=800,height=800');
    
    if (!printWindow) {
        UIUtils.showAlert('팝업 창을 열 수 없습니다. 팝업 차단을 해제해 주세요.', 'warning');
        return;
    }
    
    // 인쇄용 템플릿 생성
    printWindow.document.write(_generateAssetInfoPrintTemplate(assetInfoCard, assetHistoryCard));
    printWindow.document.close();
    
    // 이미지 로딩 완료 후 인쇄
    printWindow.onload = function() {
        setTimeout(() => {
            printWindow.print();
            printWindow.onafterprint = function() {
                printWindow.close();
            };
        }, 500);
    };
}

/**
 * 자산 정보 인쇄용 HTML 템플릿 생성
 * @param {HTMLElement} assetInfoCard - 자산 정보 카드 요소
 * @param {HTMLElement} assetHistoryCard - 자산 이력 카드 요소 (선택 사항)
 * @returns {string} HTML 템플릿
 * @private
 */
function _generateAssetInfoPrintTemplate(assetInfoCard, assetHistoryCard) {
    const assetTitle = document.querySelector('.asset-name')?.textContent || '자산 정보';
    const today = new Date().toLocaleDateString();
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${assetTitle} - 인쇄</title>
            <meta charset="utf-8">
            <link rel="stylesheet" href="${window.location.origin}/static/css/bootstrap.min.css">
            <style>
                @media print {
                    body {
                        font-size: 12pt;
                    }
                    .container {
                        width: 100%;
                        max-width: 100%;
                    }
                    .card {
                        border: 1px solid #ddd;
                        margin-bottom: 20px;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
                .print-header {
                    text-align: center;
                    margin-bottom: 20px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #ddd;
                }
                .print-footer {
                    text-align: right;
                    margin-top: 20px;
                    font-size: 0.9em;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class="container mt-4">
                <div class="print-header">
                    <h2>${assetTitle}</h2>
                    <p class="text-muted">인쇄일: ${today}</p>
                </div>
                
                <div class="asset-info">
                    ${assetInfoCard.outerHTML}
                </div>
                
                ${assetHistoryCard ? `
                <div class="asset-history mt-4">
                    ${assetHistoryCard.outerHTML}
                </div>
                ` : ''}
                
                <div class="print-footer">
                    <p>자산관리시스템 © ${new Date().getFullYear()}</p>
                </div>
            </div>
            
            <script>
                // 인쇄에 불필요한 요소 제거
                document.querySelectorAll('.btn, .no-print').forEach(el => {
                    el.remove();
                });
            </script>
        </body>
        </html>
    `;
}

// 공개 API
export {
    initQrCodePrint,
    initAssetInfoPrint
}; 