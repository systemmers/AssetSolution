/**
 * 인벤토리 리포트 차트 관리 모듈
 * @module inventory/report/chart-manager
 */
import UIUtils from '../../../../common/ui-utils.js';

/**
 * 차트 초기화 함수
 * @returns {Function} 이벤트 정리 함수
 */
export function initCharts() {
    const cleanupFuncs = [];
    
    // 결과 요약 도넛 차트 초기화
    const donutCleanup = initDonutChart();
    if (donutCleanup) cleanupFuncs.push(donutCleanup);
    
    // 카테고리별 분석 바 차트 초기화
    const barCleanup = initBarChart();
    if (barCleanup) cleanupFuncs.push(barCleanup);
    
    // 정리 함수 반환
    return function cleanup() {
        cleanupFuncs.forEach(fn => typeof fn === 'function' && fn());
    };
}

/**
 * 결과 요약 도넛 차트 초기화
 * @returns {Function} 이벤트 정리 함수
 */
function initDonutChart() {
    const donutChartCanvas = document.getElementById('resultDonutChart');
    if (!donutChartCanvas || typeof Chart === 'undefined') {
        console.warn('도넛 차트를 초기화할 수 없습니다. Chart.js가 로드되었는지 확인하세요.');
        return null;
    }
    
    let donutChart = null;
    
    // UIUtils를 사용하여 차트 초기화 전에 로딩 표시
    UIUtils.toggleLoader(true, { targetSelector: '#resultDonutChart-container' });
    
    try {
        donutChart = new Chart(donutChartCanvas, {
            type: 'doughnut',
            data: {
                labels: ['정상', '위치 불일치', '분실', '손상', '미등록'],
                datasets: [{
                    data: [45, 3, 2, 0, 0],
                    backgroundColor: [
                        '#4e73df',
                        '#f6c23e',
                        '#e74a3b',
                        '#e74a3b',
                        '#36b9cc'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
        
        // 차트 로딩 완료 후 로더 숨김
        UIUtils.toggleLoader(false, { targetSelector: '#resultDonutChart-container' });
    } catch (error) {
        console.error('도넛 차트 초기화 중 오류 발생:', error);
        UIUtils.showAlert('차트를 불러오는 중 오류가 발생했습니다.', 'danger');
        UIUtils.toggleLoader(false, { targetSelector: '#resultDonutChart-container' });
        return null;
    }
    
    // 이벤트 핸들러 등록 (있는 경우)
    // 예: 차트 클릭 이벤트 등
    
    // 정리 함수 반환
    return function cleanup() {
        if (donutChart) {
            donutChart.destroy();
        }
    };
}

/**
 * 카테고리별 분석 바 차트 초기화
 * @returns {Function} 이벤트 정리 함수
 */
function initBarChart() {
    const barChartCanvas = document.getElementById('categoryBarChart');
    if (!barChartCanvas || typeof Chart === 'undefined') {
        console.warn('바 차트를 초기화할 수 없습니다. Chart.js가 로드되었는지 확인하세요.');
        return null;
    }
    
    let barChart = null;
    
    // UIUtils를 사용하여 차트 초기화 전에 로딩 표시
    UIUtils.toggleLoader(true, { targetSelector: '#categoryBarChart-container' });
    
    try {
        barChart = new Chart(barChartCanvas, {
            type: 'bar',
            data: {
                labels: ['노트북', '데스크탑', '모니터', '주변기기', '가구'],
                datasets: [{
                    label: '정상',
                    data: [10, 5, 15, 10, 5],
                    backgroundColor: '#4e73df'
                }, {
                    label: '불일치',
                    data: [2, 0, 1, 2, 0],
                    backgroundColor: '#e74a3b'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: true
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true
                    }
                }
            }
        });
        
        // 차트 로딩 완료 후 로더 숨김
        UIUtils.toggleLoader(false, { targetSelector: '#categoryBarChart-container' });
    } catch (error) {
        console.error('바 차트 초기화 중 오류 발생:', error);
        UIUtils.showAlert('차트를 불러오는 중 오류가 발생했습니다.', 'danger');
        UIUtils.toggleLoader(false, { targetSelector: '#categoryBarChart-container' });
        return null;
    }
    
    // 이벤트 핸들러 등록 (있는 경우)
    
    // 정리 함수 반환
    return function cleanup() {
        if (barChart) {
            barChart.destroy();
        }
    };
} 