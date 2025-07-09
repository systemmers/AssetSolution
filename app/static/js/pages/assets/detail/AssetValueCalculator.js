/**
 * 자산 가치 계산 모듈
 * 자산의 감가상각 및 현재 가치 계산 기능을 담당합니다.
 */

import UIUtils from '../../../common/ui-utils.js';

/**
 * 자산 가치 계산 기능 초기화
 */
function initAssetValueCalculation() {
    const calcValueButton = document.getElementById('calcValueBtn');
    if (!calcValueButton) return;
    
    UIUtils.setupActionButton(calcValueButton, function() {
        _executeAssetValueCalculation();
    });
}

/**
 * 자산 가치 계산 실행
 * @private
 */
function _executeAssetValueCalculation() {
    // 자산 데이터 수집
    const assetData = _collectAssetValueData();
    
    // 데이터 유효성 검사
    if (!_validateAssetValueData(assetData)) {
        return;
    }
    
    // 현재 가치 계산
    const currentValue = calculateCurrentValue(
        assetData.purchasePrice,
        assetData.purchaseDate,
        assetData.lifespan
    );
    
    // 결과 표시
    _displayAssetValue(currentValue);
}

/**
 * 자산 가치 계산에 필요한 데이터 수집
 * @returns {Object} 수집된 자산 데이터
 * @private
 */
function _collectAssetValueData() {
    const purchaseDateEl = document.querySelector('[data-purchase-date]');
    const purchasePriceEl = document.querySelector('[data-purchase-price]');
    const lifespanEl = document.querySelector('[data-lifespan]');
    
    return {
        purchaseDate: purchaseDateEl?.dataset.purchaseDate,
        purchasePrice: purchasePriceEl ? parseInt(purchasePriceEl.dataset.purchasePrice, 10) : NaN,
        lifespan: lifespanEl ? parseInt(lifespanEl.dataset.lifespan, 10) : NaN
    };
}

/**
 * 자산 가치 계산 데이터 유효성 검사
 * @param {Object} assetData - 자산 데이터
 * @returns {boolean} 유효성 여부
 * @private
 */
function _validateAssetValueData(assetData) {
    // 데이터 존재 여부 확인
    if (!assetData.purchaseDate || !assetData.purchasePrice || !assetData.lifespan) {
        UIUtils.showAlert('자산 정보를 찾을 수 없습니다.', 'warning');
        return false;
    }
    
    // 숫자 값 확인
    if (isNaN(assetData.purchasePrice) || isNaN(assetData.lifespan)) {
        UIUtils.showAlert('자산 가격 또는 내용연수 정보가 올바르지 않습니다.', 'warning');
        return false;
    }
    
    return true;
}

/**
 * 계산된 자산 가치 표시
 * @param {number} value - 계산된 자산 가치
 * @private
 */
function _displayAssetValue(value) {
    const valueEl = document.getElementById('currentValue');
    const percentEl = document.getElementById('currentValuePercent');
    
    if (valueEl) {
        valueEl.textContent = new Intl.NumberFormat('ko-KR', { 
            style: 'currency', 
            currency: 'KRW',
            maximumFractionDigits: 0
        }).format(value);
    }
    
    if (percentEl) {
        const purchasePriceEl = document.querySelector('[data-purchase-price]');
        const purchasePrice = purchasePriceEl ? parseInt(purchasePriceEl.dataset.purchasePrice, 10) : 0;
        
        if (purchasePrice > 0) {
            const percent = Math.round((value / purchasePrice) * 100);
            percentEl.textContent = `(원가의 ${percent}%)`;
        } else {
            percentEl.textContent = '';
        }
    }
    
    UIUtils.showAlert('자산 현재 가치가 계산되었습니다.', 'success');
}

/**
 * 감가상각을 고려한 자산 현재 가치 계산
 * @param {number} purchasePrice - 구매 가격
 * @param {string} purchaseDate - 구매 날짜 (YYYY-MM-DD 형식)
 * @param {number} lifespan - 내용연수 (년)
 * @returns {number} 현재 가치
 */
function calculateCurrentValue(purchasePrice, purchaseDate, lifespan) {
    // 구매일과 현재 날짜 차이 계산
    const purchaseDateTime = new Date(purchaseDate);
    const currentDate = new Date();
    
    // 월 단위 사용 기간
    const monthsPassed = _calculateMonthsPassed(purchaseDateTime, currentDate);
    
    // 내용연수를 월로 변환
    const totalMonths = lifespan * 12;
    
    // 월별 감가상각
    const monthlyDepreciation = purchasePrice / totalMonths;
    
    // 감가상각 적용 (내용연수를 초과한 경우 잔존가치 5% 적용)
    if (monthsPassed >= totalMonths) {
        return Math.round(purchasePrice * 0.05); // 5% 잔존가치
    } else {
        return Math.round(purchasePrice - (monthlyDepreciation * monthsPassed));
    }
}

/**
 * 두 날짜 사이의 월 수 계산
 * @param {Date} startDate - 시작 날짜
 * @param {Date} endDate - 종료 날짜
 * @returns {number} 월 수
 * @private
 */
function _calculateMonthsPassed(startDate, endDate) {
    const yearDiff = endDate.getFullYear() - startDate.getFullYear();
    const monthDiff = endDate.getMonth() - startDate.getMonth();
    return (yearDiff * 12) + monthDiff;
}

// 공개 API
export {
    initAssetValueCalculation,
    calculateCurrentValue
}; 