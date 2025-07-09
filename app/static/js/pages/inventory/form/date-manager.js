/**
 * 인벤토리 폼 날짜 선택 관리 모듈
 * @module inventory/form/date-manager
 */
import FormUtils from '../../../../common/form-utils.js';

/**
 * 날짜 선택 기능 초기화
 * @returns {Function} 이벤트 정리 함수
 */
export function initDateSelection() {
    // 시작일, 종료일 입력 필드
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    if (!startDateInput || !endDateInput) return null;
    
    const cleanupFuncs = [];
    
    // FormUtils를 사용하여 날짜 선택기 초기화
    const datepickersCleanup = FormUtils.initializeDatePickers([startDateInput, endDateInput], {
        format: 'yyyy-mm-dd',
        autoclose: true,
        todayHighlight: true,
        language: 'ko'
    });
    
    if (datepickersCleanup) cleanupFuncs.push(datepickersCleanup);
    
    // 날짜 범위 검증
    const rangeValidationCleanup = FormUtils.setupDateRangeValidation(startDateInput, endDateInput, {
        invalidFeedback: '종료일은 시작일 이후여야 합니다.',
        validFeedback: '유효한 날짜 범위입니다.'
    });
    
    if (rangeValidationCleanup) cleanupFuncs.push(rangeValidationCleanup);
    
    // 오늘 날짜 자동 설정 버튼 초기화
    const setTodayBtn = document.getElementById('setToday');
    if (setTodayBtn) {
        const handleSetToday = function() {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            const formattedDate = `${yyyy}-${mm}-${dd}`;
            
            startDateInput.value = formattedDate;
            
            // 종료일 자동 설정 (기본 30일 후)
            const endDate = new Date(today);
            endDate.setDate(today.getDate() + 30);
            
            const endYyyy = endDate.getFullYear();
            const endMm = String(endDate.getMonth() + 1).padStart(2, '0');
            const endDd = String(endDate.getDate()).padStart(2, '0');
            const formattedEndDate = `${endYyyy}-${endMm}-${endDd}`;
            
            endDateInput.value = formattedEndDate;
            
            // 날짜 변경 이벤트 트리거
            startDateInput.dispatchEvent(new Event('change', { bubbles: true }));
            endDateInput.dispatchEvent(new Event('change', { bubbles: true }));
        };
        
        setTodayBtn.addEventListener('click', handleSetToday);
        cleanupFuncs.push(() => setTodayBtn.removeEventListener('click', handleSetToday));
    }
    
    // 오늘부터 2주 버튼 초기화
    const setTwoWeeksBtn = document.getElementById('setTwoWeeks');
    if (setTwoWeeksBtn) {
        const handleSetTwoWeeks = function() {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            const formattedDate = `${yyyy}-${mm}-${dd}`;
            
            startDateInput.value = formattedDate;
            
            // 종료일 자동 설정 (2주 후)
            const endDate = new Date(today);
            endDate.setDate(today.getDate() + 14);
            
            const endYyyy = endDate.getFullYear();
            const endMm = String(endDate.getMonth() + 1).padStart(2, '0');
            const endDd = String(endDate.getDate()).padStart(2, '0');
            const formattedEndDate = `${endYyyy}-${endMm}-${endDd}`;
            
            endDateInput.value = formattedEndDate;
            
            // 날짜 변경 이벤트 트리거
            startDateInput.dispatchEvent(new Event('change', { bubbles: true }));
            endDateInput.dispatchEvent(new Event('change', { bubbles: true }));
        };
        
        setTwoWeeksBtn.addEventListener('click', handleSetTwoWeeks);
        cleanupFuncs.push(() => setTwoWeeksBtn.removeEventListener('click', handleSetTwoWeeks));
    }
    
    // 정리 함수 반환
    return function cleanup() {
        cleanupFuncs.forEach(fn => typeof fn === 'function' && fn());
    };
} 