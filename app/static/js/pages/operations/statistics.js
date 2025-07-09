/**
 * 운영 통계 및 보고서 페이지 JavaScript
 * asset_solution/static/js/pages/operations/statistics.js
 */

// 차트 인스턴스 저장
let monthlyTrendChart = null;
let departmentPieChart = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeStatisticsPage();
});

/**
 * 통계 페이지 초기화
 */
function initializeStatisticsPage() {
    console.log('운영 통계 페이지 초기화');
    
    // 보고서 설정 폼 이벤트
    initializeReportForm();
    
    // 차트 초기화
    initializeCharts();
    
    // 통계 카드 애니메이션
    animateStatCards();
    
    // 보고서 유형 변경 이벤트
    const reportTypeSelect = document.getElementById('report_type');
    if (reportTypeSelect) {
        reportTypeSelect.addEventListener('change', handleReportTypeChange);
    }
}

/**
 * 보고서 설정 폼 초기화
 */
function initializeReportForm() {
    const form = document.getElementById('reportConfigForm');
    if (!form) return;
    
    // 기본 날짜 설정
    setDefaultReportDates();
    
    // 폼 유효성 검사
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        generateReport();
    });
}

/**
 * 기본 보고서 날짜 설정
 */
function setDefaultReportDates() {
    const endDateInput = document.getElementById('report_period_end');
    const startDateInput = document.getElementById('report_period_start');
    
    if (endDateInput && !endDateInput.value) {
        const today = new Date();
        endDateInput.value = today.toISOString().split('T')[0];
    }
    
    if (startDateInput && !startDateInput.value) {
        const firstDayOfMonth = new Date();
        firstDayOfMonth.setDate(1);
        startDateInput.value = firstDayOfMonth.toISOString().split('T')[0];
    }
}

/**
 * 보고서 유형 변경 처리
 */
function handleReportTypeChange(event) {
    const reportType = event.target.value;
    const startDateInput = document.getElementById('report_period_start');
    const endDateInput = document.getElementById('report_period_end');
    
    const today = new Date();
    let startDate = new Date();
    
    switch (reportType) {
        case 'monthly':
            startDate.setDate(1); // 이번 달 1일
            break;
        case 'quarterly':
            const quarter = Math.floor(today.getMonth() / 3);
            startDate = new Date(today.getFullYear(), quarter * 3, 1);
            break;
        case 'yearly':
            startDate = new Date(today.getFullYear(), 0, 1); // 올해 1월 1일
            break;
        case 'custom':
            // 사용자 정의는 기본값 유지
            return;
    }
    
    if (startDateInput) startDateInput.value = startDate.toISOString().split('T')[0];
    if (endDateInput) endDateInput.value = today.toISOString().split('T')[0];
}

/**
 * 차트 초기화
 */
function initializeCharts() {
    initializeMonthlyTrendChart();
    initializeDepartmentPieChart();
}

/**
 * 월별 추이 차트 초기화
 */
function initializeMonthlyTrendChart() {
    const ctx = document.getElementById('monthlyTrendChart');
    if (!ctx) return;
    
    // Mock 데이터 (실제로는 서버에서 받아옴)
    const chartData = {
        labels: ['7월', '8월', '9월', '10월', '11월', '12월'],
        datasets: [
            {
                label: '대여',
                data: [120, 135, 142, 138, 129, 145],
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgba(54, 162, 235, 0.1)',
                tension: 0.4
            },
            {
                label: '반납',
                data: [115, 128, 140, 135, 125, 132],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.1)',
                tension: 0.4
            },
            {
                label: '지연',
                data: [18, 20, 15, 22, 18, 23],
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.1)',
                tension: 0.4
            }
        ]
    };
    
    const config = {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: '월별 자산 운영 추이'
                },
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '건수'
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    };
    
    monthlyTrendChart = new Chart(ctx, config);
}

/**
 * 부서별 파이 차트 초기화
 */
function initializeDepartmentPieChart() {
    const ctx = document.getElementById('departmentPieChart');
    if (!ctx) return;
    
    // Mock 데이터
    const chartData = {
        labels: ['IT개발팀', '마케팅팀', '영업팀', '기타'],
        datasets: [{
            data: [35, 25, 22, 18],
            backgroundColor: [
                '#007bff',
                '#28a745',
                '#17a2b8',
                '#ffc107'
            ],
            borderWidth: 2,
            borderColor: '#fff'
        }]
    };
    
    const config = {
        type: 'pie',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // 하단에 별도 범례 사용
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value}% (${percentage}%)`;
                        }
                    }
                }
            }
        }
    };
    
    departmentPieChart = new Chart(ctx, config);
}

/**
 * 차트 유형 변경
 */
function changeChartType(type) {
    if (!monthlyTrendChart) return;
    
    monthlyTrendChart.config.type = type;
    monthlyTrendChart.update();
    
    showNotification(`차트가 ${type} 형태로 변경되었습니다.`, 'success');
}

/**
 * 통계 카드 애니메이션
 */
function animateStatCards() {
    const cards = document.querySelectorAll('.card.border-left-primary, .card.border-left-success, .card.border-left-warning, .card.border-left-info');
    
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'all 0.6s ease';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);
        }, index * 150);
    });
}

/**
 * 보고서 생성
 */
function generateReport() {
    console.log('보고서 생성 시작');
    
    // 폼 데이터 수집
    const formData = {
        report_type: document.getElementById('report_type').value,
        start_date: document.getElementById('report_period_start').value,
        end_date: document.getElementById('report_period_end').value,
        include_sections: getSelectedSections()
    };
    
    // 유효성 검사
    if (!formData.start_date || !formData.end_date) {
        showNotification('시작일과 종료일을 선택해주세요.', 'warning');
        return;
    }
    
    if (new Date(formData.start_date) > new Date(formData.end_date)) {
        showNotification('시작일이 종료일보다 늦을 수 없습니다.', 'warning');
        return;
    }
    
    // 로딩 표시
    showLoadingSpinner('보고서를 생성하고 있습니다...');
    
    // API 호출 (Mock)
    setTimeout(() => {
        hideLoadingSpinner();
        showNotification('보고서가 성공적으로 생성되었습니다.', 'success');
        
        // 다운로드 버튼 활성화
        enableDownloadButtons();
    }, 2000);
}

/**
 * 선택된 섹션 가져오기
 */
function getSelectedSections() {
    const sections = [];
    const checkboxes = document.querySelectorAll('#reportConfigForm input[type="checkbox"]:checked');
    
    checkboxes.forEach(checkbox => {
        sections.push(checkbox.id.replace('include_', ''));
    });
    
    return sections;
}

/**
 * 보고서 다운로드
 */
function downloadReport(format) {
    console.log(`${format} 보고서 다운로드`);
    
    // 실제 구현에서는 서버 API 호출
    const downloadUrl = `/operations/api/download-report?format=${format}`;
    
    // 다운로드 링크 생성
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `operations_report_${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification(`${format.toUpperCase()} 파일 다운로드가 시작되었습니다.`, 'success');
}

/**
 * 대시보드 공유
 */
function shareDashboard() {
    console.log('대시보드 공유 링크 생성');
    
    // Mock 공유 링크 생성
    const shareUrl = `${window.location.origin}/operations/dashboard/shared/${generateShareId()}`;
    
    // 클립보드에 복사
    navigator.clipboard.writeText(shareUrl).then(() => {
        showNotification('공유 링크가 클립보드에 복사되었습니다.', 'success');
    }).catch(() => {
        // 클립보드 복사 실패 시 모달로 링크 표시
        showShareLinkModal(shareUrl);
    });
}

/**
 * 공유 ID 생성
 */
function generateShareId() {
    return Math.random().toString(36).substr(2, 9);
}

/**
 * 공유 링크 모달 표시
 */
function showShareLinkModal(url) {
    const modalHtml = `
        <div class="modal fade" id="shareLinkModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">대시보드 공유 링크</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p>아래 링크를 복사하여 공유하세요:</p>
                        <div class="input-group">
                            <input type="text" class="form-control" value="${url}" readonly>
                            <button class="btn btn-outline-secondary" onclick="copyToClipboard('${url}')">복사</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('shareLinkModal'));
    modal.show();
    
    // 모달 닫힐 때 DOM에서 제거
    modal._element.addEventListener('hidden.bs.modal', () => {
        modal._element.remove();
    });
}

/**
 * 클립보드 복사
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('링크가 복사되었습니다.', 'success');
    });
}

/**
 * 다운로드 버튼 활성화
 */
function enableDownloadButtons() {
    const downloadButtons = document.querySelectorAll('button[onclick*="downloadReport"]');
    downloadButtons.forEach(button => {
        button.disabled = false;
        button.classList.remove('disabled');
    });
}

/**
 * 로딩 스피너 표시 (NotificationUtils 사용)
 */
function showLoadingSpinner(message = '처리 중...') {
    if (window.NotificationUtils) {
        window.NotificationUtils.showLoading(true, message);
    } else {
        // 폴백: 기존 방식
        const spinnerHtml = `
            <div id="loadingSpinner" class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style="background: rgba(0,0,0,0.5); z-index: 9999;">
                <div class="text-center text-white">
                    <div class="spinner-border mb-3" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <div>${message}</div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', spinnerHtml);
    }
}

/**
 * 로딩 스피너 숨기기 (NotificationUtils 사용)
 */
function hideLoadingSpinner() {
    if (window.NotificationUtils) {
        window.NotificationUtils.showLoading(false);
    } else {
        // 폴백: 기존 방식
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.remove();
        }
    }
}

/**
 * 알림 표시 (NotificationUtils 사용)
 */
function showNotification(message, type = 'info') {
    if (window.NotificationUtils) {
        window.NotificationUtils.showToast(message, type);
    } else {
        // 폴백: 기존 방식
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.top = '20px';
        alertDiv.style.right = '20px';
        alertDiv.style.zIndex = '9999';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // 3초 후 자동 제거
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.parentNode.removeChild(alertDiv);
            }
        }, 3000);
    }
}

// 전역 함수로 내보내기 (HTML에서 직접 호출용)
window.generateReport = generateReport;
window.downloadReport = downloadReport;
window.shareDashboard = shareDashboard;
window.changeChartType = changeChartType; 