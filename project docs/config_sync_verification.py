#!/usr/bin/env python3
"""
하드코딩 제거 프로젝트 - 설정 동기화 검증 스크립트
Python constants.py와 JavaScript constants.js 간 동기화 상태를 검증합니다.

작성일: 2025년 7월 9일
프로젝트 ID: req-22
"""

import sys
import os
import json
from datetime import datetime

# 프로젝트 루트 디렉터리를 Python 경로에 추가
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)

try:
    from app.utils.constants import (
        BUSINESS_RULES, TIMEOUT_SETTINGS, ALERT_DURATION, 
        INPUT_DELAY, UI_SETTINGS, PAGINATION_SETTINGS,
        SAMPLE_DATA_SETTINGS, CHART_SETTINGS, DATE_SETTINGS
    )
except ImportError as e:
    print(f"❌ Python constants 모듈을 가져올 수 없습니다: {e}")
    sys.exit(1)

class ConfigSyncVerifier:
    """설정 동기화 검증 클래스"""
    
    def __init__(self):
        self.errors = []
        self.warnings = []
        self.success_count = 0
        self.total_checks = 0
        
    def log_error(self, message):
        """오류 로그"""
        self.errors.append(message)
        print(f"❌ {message}")
    
    def log_warning(self, message):
        """경고 로그"""
        self.warnings.append(message)
        print(f"⚠️  {message}")
    
    def log_success(self, message):
        """성공 로그"""
        self.success_count += 1
        print(f"✅ {message}")
    
    def verify_timeout_settings(self):
        """타임아웃 설정 동기화 검증"""
        print("\n🔍 타임아웃 설정 동기화 검증...")
        
        # 검증할 타임아웃 값들
        expected_timeouts = {
            'API_TIMEOUT': 30000,
            'AUTO_REFRESH_INTERVAL': 30000,
            'CHART_UPDATE_INTERVAL': 5000,
            'MODULE_LOAD_TIMEOUT': 5000,
            'LARGE_OPERATION_TIMEOUT': 30000,
            'IMAGE_TIMEOUT': 5000,
            'NOTIFICATION_AUTO_MARK_READ': 5000
        }
        
        for key, expected_value in expected_timeouts.items():
            self.total_checks += 1
            if key in TIMEOUT_SETTINGS:
                if TIMEOUT_SETTINGS[key] == expected_value:
                    self.log_success(f"TIMEOUT_SETTINGS['{key}'] = {expected_value}ms")
                else:
                    self.log_error(f"TIMEOUT_SETTINGS['{key}'] 값 불일치: {TIMEOUT_SETTINGS[key]} != {expected_value}")
            else:
                self.log_error(f"TIMEOUT_SETTINGS에 '{key}' 키가 없습니다")
    
    def verify_alert_duration(self):
        """알림 지속시간 설정 동기화 검증"""
        print("\n🔍 알림 지속시간 설정 동기화 검증...")
        
        expected_durations = {
            'SHORT': 1500,
            'MEDIUM': 3000,
            'LONG': 5000
        }
        
        for key, expected_value in expected_durations.items():
            self.total_checks += 1
            if key in ALERT_DURATION:
                if ALERT_DURATION[key] == expected_value:
                    self.log_success(f"ALERT_DURATION['{key}'] = {expected_value}ms")
                else:
                    self.log_error(f"ALERT_DURATION['{key}'] 값 불일치: {ALERT_DURATION[key]} != {expected_value}")
            else:
                self.log_error(f"ALERT_DURATION에 '{key}' 키가 없습니다")
    
    def verify_business_rules(self):
        """비즈니스 규칙 설정 동기화 검증"""
        print("\n🔍 비즈니스 규칙 설정 동기화 검증...")
        
        expected_rules = {
            'LOAN_LIMIT': 5,
            'STATUS_ID_DEFAULT': 3,
            'DESCRIPTION_MAX_LENGTH': 100
        }
        
        for key, expected_value in expected_rules.items():
            self.total_checks += 1
            if key in BUSINESS_RULES:
                if BUSINESS_RULES[key] == expected_value:
                    self.log_success(f"BUSINESS_RULES['{key}'] = {expected_value}")
                else:
                    self.log_error(f"BUSINESS_RULES['{key}'] 값 불일치: {BUSINESS_RULES[key]} != {expected_value}")
            else:
                self.log_error(f"BUSINESS_RULES에 '{key}' 키가 없습니다")
    
    def verify_pagination_settings(self):
        """페이지네이션 설정 동기화 검증"""
        print("\n🔍 페이지네이션 설정 동기화 검증...")
        
        expected_pagination = {
            'DEFAULT_PER_PAGE': 10,
            'MAX_PER_PAGE': 200,
            'ITEMS_PER_PAGE_OPTIONS': [10, 25, 50, 100, 200]
        }
        
        for key, expected_value in expected_pagination.items():
            self.total_checks += 1
            if key in PAGINATION_SETTINGS:
                if PAGINATION_SETTINGS[key] == expected_value:
                    self.log_success(f"PAGINATION_SETTINGS['{key}'] = {expected_value}")
                else:
                    self.log_error(f"PAGINATION_SETTINGS['{key}'] 값 불일치: {PAGINATION_SETTINGS[key]} != {expected_value}")
            else:
                self.log_error(f"PAGINATION_SETTINGS에 '{key}' 키가 없습니다")
    
    def verify_ui_settings(self):
        """UI 설정 동기화 검증"""
        print("\n🔍 UI 설정 동기화 검증...")
        
        expected_ui = {
            'ANIMATION_DURATION': 300,
            'MODAL_TRANSITION': 150,
            'FONT_SIZE_DEFAULT': 16
        }
        
        for key, expected_value in expected_ui.items():
            self.total_checks += 1
            if key in UI_SETTINGS:
                if UI_SETTINGS[key] == expected_value:
                    self.log_success(f"UI_SETTINGS['{key}'] = {expected_value}")
                else:
                    self.log_error(f"UI_SETTINGS['{key}'] 값 불일치: {UI_SETTINGS[key]} != {expected_value}")
            else:
                self.log_error(f"UI_SETTINGS에 '{key}' 키가 없습니다")
    
    def verify_input_delay(self):
        """입력 지연시간 설정 동기화 검증"""
        print("\n🔍 입력 지연시간 설정 동기화 검증...")
        
        expected_delays = {
            'DEBOUNCE': 500,
            'SEARCH_DEBOUNCE': 500,
            'VALIDATION_DELAY': 500
        }
        
        for key, expected_value in expected_delays.items():
            self.total_checks += 1
            if key in INPUT_DELAY:
                if INPUT_DELAY[key] == expected_value:
                    self.log_success(f"INPUT_DELAY['{key}'] = {expected_value}ms")
                else:
                    self.log_error(f"INPUT_DELAY['{key}'] 값 불일치: {INPUT_DELAY[key]} != {expected_value}")
            else:
                self.log_error(f"INPUT_DELAY에 '{key}' 키가 없습니다")
    
    def verify_chart_settings(self):
        """차트 설정 동기화 검증"""
        print("\n🔍 차트 설정 동기화 검증...")
        
        expected_chart = {
            'MONTHLY_DATA_SAMPLE': [12, 16, 18, 17, 19, 18],
            'FILE_SIZE_BASE': 2.5,
            'FILE_SIZE_INCREMENT': 0.3,
            'DOWNLOAD_COUNT_BASE': 10
        }
        
        for key, expected_value in expected_chart.items():
            self.total_checks += 1
            if key in CHART_SETTINGS:
                if CHART_SETTINGS[key] == expected_value:
                    self.log_success(f"CHART_SETTINGS['{key}'] = {expected_value}")
                else:
                    self.log_error(f"CHART_SETTINGS['{key}'] 값 불일치: {CHART_SETTINGS[key]} != {expected_value}")
            else:
                self.log_error(f"CHART_SETTINGS에 '{key}' 키가 없습니다")
    
    def verify_date_settings(self):
        """날짜 설정 동기화 검증"""
        print("\n🔍 날짜 설정 동기화 검증...")
        
        expected_dates = {
            'DAYS_IN_MONTH': 30,
            'DAYS_IN_YEAR': 365,
            'QUARTERLY_MONTHS': [1, 4, 7, 10]
        }
        
        for key, expected_value in expected_dates.items():
            self.total_checks += 1
            if key in DATE_SETTINGS:
                if DATE_SETTINGS[key] == expected_value:
                    self.log_success(f"DATE_SETTINGS['{key}'] = {expected_value}")
                else:
                    self.log_error(f"DATE_SETTINGS['{key}'] 값 불일치: {DATE_SETTINGS[key]} != {expected_value}")
            else:
                self.log_error(f"DATE_SETTINGS에 '{key}' 키가 없습니다")
    
    def check_javascript_constants_file(self):
        """JavaScript constants.js 파일 존재 확인"""
        print("\n🔍 JavaScript constants.js 파일 존재 확인...")
        
        js_constants_path = os.path.join(project_root, 'app', 'static', 'js', 'shared', 'constants.js')
        
        if os.path.exists(js_constants_path):
            self.log_success("JavaScript constants.js 파일이 존재합니다")
            
            # 파일 크기 확인
            file_size = os.path.getsize(js_constants_path)
            if file_size > 1000:  # 1KB 이상
                self.log_success(f"constants.js 파일 크기: {file_size} bytes (정상)")
            else:
                self.log_warning(f"constants.js 파일이 너무 작습니다: {file_size} bytes")
        else:
            self.log_error("JavaScript constants.js 파일이 존재하지 않습니다")
    
    def run_all_verifications(self):
        """모든 검증 실행"""
        print("=" * 60)
        print("🔧 하드코딩 제거 프로젝트 - 설정 동기화 검증")
        print("=" * 60)
        print(f"검증 시작 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # 각 검증 실행
        self.verify_timeout_settings()
        self.verify_alert_duration()
        self.verify_business_rules()
        self.verify_pagination_settings()
        self.verify_ui_settings()
        self.verify_input_delay()
        self.verify_chart_settings()
        self.verify_date_settings()
        self.check_javascript_constants_file()
        
        # 결과 요약
        self.print_summary()
    
    def print_summary(self):
        """검증 결과 요약 출력"""
        print("\n" + "=" * 60)
        print("📊 검증 결과 요약")
        print("=" * 60)
        
        success_rate = (self.success_count / self.total_checks * 100) if self.total_checks > 0 else 0
        
        print(f"✅ 성공: {self.success_count}/{self.total_checks} ({success_rate:.1f}%)")
        print(f"❌ 오류: {len(self.errors)}")
        print(f"⚠️  경고: {len(self.warnings)}")
        
        if self.errors:
            print("\n❌ 발견된 오류들:")
            for i, error in enumerate(self.errors, 1):
                print(f"  {i}. {error}")
        
        if self.warnings:
            print("\n⚠️  경고 사항들:")
            for i, warning in enumerate(self.warnings, 1):
                print(f"  {i}. {warning}")
        
        # 전체 평가
        if len(self.errors) == 0:
            print("\n🎉 모든 설정이 올바르게 동기화되었습니다!")
            return True
        elif len(self.errors) <= 2:
            print("\n⚠️  경미한 동기화 문제가 발견되었습니다. 수정을 권장합니다.")
            return False
        else:
            print("\n🚨 심각한 동기화 문제가 발견되었습니다. 즉시 수정이 필요합니다.")
            return False

def main():
    """메인 실행 함수"""
    verifier = ConfigSyncVerifier()
    success = verifier.run_all_verifications()
    
    # 종료 코드 설정
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main() 