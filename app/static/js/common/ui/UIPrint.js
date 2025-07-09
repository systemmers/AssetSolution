/**
 * UI 인쇄 모듈
 * 콘텐츠 인쇄 관련 기능을 제공합니다.
 * 
 * 함수 목록:
 * - printContent: 콘텐츠 인쇄
 * - preparePrintTemplate: 인쇄 템플릿 준비
 */

const UIPrint = (function() {
    /**
     * 특정 콘텐츠를 인쇄합니다.
     * @param {string} contentId - 인쇄할 콘텐츠 요소의 ID
     * @param {string} printTitle - 인쇄 페이지의 제목
     * @param {string} printStylesheet - 인쇄용 스타일시트 URL (선택 사항)
     * @returns {Window|null} 생성된 인쇄 창 객체 또는 null
     */
    function printContent(contentId, printTitle = document.title, printStylesheet = null) {
        const content = document.getElementById(contentId);
        if (!content) {
            console.error('Print content not found:', contentId);
            return null;
        }
        
        // 인쇄용 창 열기
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (!printWindow) {
            console.error('Failed to open print window. Please check your popup blocker settings.');
            return null;
        }
        
        // 인쇄 템플릿 적용
        const printHTML = preparePrintTemplate(content.innerHTML, printTitle, printStylesheet);
        printWindow.document.write(printHTML);
        
        printWindow.document.close();
        return printWindow;
    }
    
    /**
     * 인쇄 템플릿을 준비합니다.
     * @param {string} content - 인쇄할 HTML 콘텐츠
     * @param {string} title - 인쇄 페이지 제목
     * @param {string} stylesheet - 추가 스타일시트 URL (선택 사항)
     * @returns {string} 완성된 인쇄용 HTML
     */
    function preparePrintTemplate(content, title, stylesheet = null) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title}</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="stylesheet" href="${window.location.origin}/static/css/bootstrap.min.css">
                <link rel="stylesheet" href="${window.location.origin}/static/css/style.css">
                ${stylesheet ? `<link rel="stylesheet" href="${stylesheet}">` : ''}
                <style>
                    @media print {
                        body { font-size: 12pt; }
                        .no-print { display: none !important; }
                        a[href]:after { content: none !important; }
                        .page-break { page-break-after: always; }
                    }
                    @page {
                        margin: 1cm;
                    }
                    body {
                        padding: 20px;
                        font-family: Arial, sans-serif;
                    }
                    .print-header {
                        text-align: center;
                        margin-bottom: 20px;
                        padding-bottom: 10px;
                        border-bottom: 1px solid #ddd;
                    }
                    .print-footer {
                        text-align: center;
                        margin-top: 20px;
                        padding-top: 10px;
                        border-top: 1px solid #ddd;
                        font-size: 9pt;
                        color: #777;
                    }
                </style>
            </head>
            <body class="p-4">
                <div class="container">
                    ${content}
                </div>
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                            setTimeout(function() {
                                window.close();
                            }, 500);
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `;
    }
    
    /**
     * HTML 요소를 인쇄할 형태로 준비합니다.
     * @param {string|Element} content - 인쇄할 콘텐츠 (HTML 문자열 또는 DOM 요소)
     * @param {Object} options - 인쇄 옵션
     * @param {string} options.title - 인쇄 페이지 제목
     * @param {string} options.header - 인쇄 페이지 헤더 (HTML 지원)
     * @param {string} options.footer - 인쇄 페이지 푸터 (HTML 지원)
     * @param {boolean} options.autoPrint - 자동 인쇄 여부
     * @returns {Window|null} 생성된 인쇄 창 객체 또는 null
     */
    function printElement(content, options = {}) {
        // 기본 옵션
        const defaultOptions = {
            title: document.title,
            header: '',
            footer: '',
            autoPrint: true
        };
        
        const settings = { ...defaultOptions, ...options };
        
        // 콘텐츠 준비
        let contentHTML = '';
        if (typeof content === 'string') {
            contentHTML = content;
        } else if (content instanceof Element) {
            contentHTML = content.outerHTML;
        } else {
            console.error('Invalid content type for printing');
            return null;
        }
        
        // 인쇄용 창 열기
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (!printWindow) {
            console.error('Failed to open print window. Please check your popup blocker settings.');
            return null;
        }
        
        // HTML 구성
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${settings.title}</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="stylesheet" href="${window.location.origin}/static/css/bootstrap.min.css">
                <link rel="stylesheet" href="${window.location.origin}/static/css/style.css">
                <style>
                    @media print {
                        body { font-size: 12pt; }
                        .no-print { display: none !important; }
                        a[href]:after { content: none !important; }
                        .page-break { page-break-after: always; }
                    }
                    @page {
                        margin: 1cm;
                    }
                    body {
                        padding: 20px;
                        font-family: Arial, sans-serif;
                    }
                    .print-header {
                        text-align: center;
                        margin-bottom: 20px;
                        padding-bottom: 10px;
                        border-bottom: 1px solid #ddd;
                    }
                    .print-footer {
                        text-align: center;
                        margin-top: 20px;
                        padding-top: 10px;
                        border-top: 1px solid #ddd;
                        font-size: 9pt;
                        color: #777;
                    }
                </style>
            </head>
            <body>
                ${settings.header ? `<div class="print-header">${settings.header}</div>` : ''}
                <div class="print-content">
                    ${contentHTML}
                </div>
                ${settings.footer ? `<div class="print-footer">${settings.footer}</div>` : ''}
                ${settings.autoPrint ? `
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                            setTimeout(function() {
                                window.close();
                            }, 500);
                        }, 500);
                    };
                </script>
                ` : ''}
            </body>
            </html>
        `);
        
        printWindow.document.close();
        return printWindow;
    }
    
    // 공개 API
    return {
        printContent,
        preparePrintTemplate,
        printElement
    };
})();

export default UIPrint; 