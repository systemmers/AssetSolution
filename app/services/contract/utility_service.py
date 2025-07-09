"""
Contract Utility Service
계약 유틸리티 함수를 담당하는 서비스

Classes:
    - ContractUtilityService: 계약 유틸리티 함수 서비스
"""
from typing import Dict, Any
from datetime import datetime, date
from ...utils.constants import get_contract_status_name, get_contract_type_name
from ...utils.formatters import format_date


class ContractUtilityService:
    """계약 유틸리티 함수를 담당하는 서비스 클래스"""
    
    def __init__(self):
        """Service 초기화"""
        pass
    
    def get_status_display_name(self, status: str) -> str:
        """
        상태 표시명 반환
        
        Args:
            status: 상태 코드
            
        Returns:
            한국어 상태명
        """
        return get_contract_status_name(status)
    
    def get_type_display_name(self, contract_type: str) -> str:
        """
        유형 표시명 반환
        
        Args:
            contract_type: 계약 유형 코드
            
        Returns:
            한국어 유형명
        """
        return get_contract_type_name(contract_type)
    
    def format_contract_date(self, date_string: str, format_pattern: str = '%Y년 %m월 %d일') -> str:
        """
        날짜 포맷팅
        
        Args:
            date_string: 날짜 문자열
            format_pattern: 포맷 패턴
            
        Returns:
            포맷된 날짜 문자열
        """
        return format_date(date_string, format_pattern)
    
    def format_contract_amount(self, amount: float) -> str:
        """
        계약 금액 포맷팅
        
        Args:
            amount: 금액
            
        Returns:
            포맷된 금액 문자열
        """
        return f"{amount:,}원"
    
    def get_days_remaining(self, contract: Dict[str, Any]) -> int:
        """
        계약 만료까지 남은 일수 계산
        
        Args:
            contract: 계약 데이터
            
        Returns:
            남은 일수
        """
        try:
            end_date = datetime.strptime(contract['end_date'], '%Y-%m-%d').date()
            return (end_date - date.today()).days
        except (ValueError, TypeError):
            return 999
    
    def get_contract_duration_days(self, start_date: str, end_date: str) -> int:
        """
        계약 기간(일수) 계산
        
        Args:
            start_date: 시작일
            end_date: 종료일
            
        Returns:
            계약 기간(일수)
        """
        try:
            start = datetime.strptime(start_date, '%Y-%m-%d').date()
            end = datetime.strptime(end_date, '%Y-%m-%d').date()
            return (end - start).days
        except (ValueError, TypeError):
            return 0
    
    def get_contract_duration_months(self, start_date: str, end_date: str) -> float:
        """
        계약 기간(월수) 계산
        
        Args:
            start_date: 시작일
            end_date: 종료일
            
        Returns:
            계약 기간(월수)
        """
        days = self.get_contract_duration_days(start_date, end_date)
        return round(days / 30.44, 1)  # 평균 월일수
    
    def get_contract_progress_percent(self, contract: Dict[str, Any]) -> float:
        """
        계약 진행률 계산
        
        Args:
            contract: 계약 데이터
            
        Returns:
            진행률(백분율)
        """
        try:
            start_date = datetime.strptime(contract['start_date'], '%Y-%m-%d').date()
            end_date = datetime.strptime(contract['end_date'], '%Y-%m-%d').date()
            today = date.today()
            
            if today < start_date:
                return 0.0
            elif today > end_date:
                return 100.0
            else:
                total_days = (end_date - start_date).days
                elapsed_days = (today - start_date).days
                return round((elapsed_days / total_days) * 100, 1) if total_days > 0 else 0.0
        except (ValueError, TypeError):
            return 0.0
    
    def get_monthly_cost_from_payment_term(self, amount: float, payment_term: str) -> float:
        """
        결제 조건에 따른 월간 비용 계산
        
        Args:
            amount: 계약 금액
            payment_term: 결제 조건
            
        Returns:
            월간 비용
        """
        if payment_term == '월간':
            return amount
        elif payment_term == '연간':
            return round(amount / 12, 0)
        elif payment_term == '분기별':
            return round(amount / 3, 0)
        elif payment_term == '반기별':
            return round(amount / 6, 0)
        else:
            return 0.0
    
    def get_expiry_risk_level(self, days_remaining: int) -> Dict[str, str]:
        """
        만료 위험도 수준 계산
        
        Args:
            days_remaining: 남은 일수
            
        Returns:
            위험도 수준과 색상 정보
        """
        if days_remaining <= 7:
            return {'level': 'critical', 'color': 'danger'}
        elif days_remaining <= 30:
            return {'level': 'high', 'color': 'warning'}
        elif days_remaining <= 90:
            return {'level': 'medium', 'color': 'info'}
        else:
            return {'level': 'low', 'color': 'success'}
    
    def is_contract_active(self, contract: Dict[str, Any]) -> bool:
        """
        계약이 현재 활성 상태인지 확인
        
        Args:
            contract: 계약 데이터
            
        Returns:
            활성 상태 여부
        """
        try:
            start_date = datetime.strptime(contract['start_date'], '%Y-%m-%d').date()
            end_date = datetime.strptime(contract['end_date'], '%Y-%m-%d').date()
            today = date.today()
            
            return (start_date <= today <= end_date and 
                    contract.get('status') == 'active')
        except (ValueError, TypeError):
            return False
    
    def is_contract_expiring_soon(self, contract: Dict[str, Any], days_threshold: int = 30) -> bool:
        """
        계약이 곧 만료되는지 확인
        
        Args:
            contract: 계약 데이터
            days_threshold: 만료 임계일수
            
        Returns:
            곧 만료 여부
        """
        days_remaining = self.get_days_remaining(contract)
        return 0 < days_remaining <= days_threshold
    
    def get_contract_age_days(self, contract: Dict[str, Any]) -> int:
        """
        계약 시작 후 경과 일수 계산
        
        Args:
            contract: 계약 데이터
            
        Returns:
            경과 일수
        """
        try:
            start_date = datetime.strptime(contract['start_date'], '%Y-%m-%d').date()
            today = date.today()
            
            if today >= start_date:
                return (today - start_date).days
            else:
                return 0
        except (ValueError, TypeError):
            return 0
    
    def create_contract_summary(self, contract: Dict[str, Any]) -> Dict[str, Any]:
        """
        계약 요약 정보 생성
        
        Args:
            contract: 계약 데이터
            
        Returns:
            계약 요약 정보
        """
        return {
            'id': contract.get('id'),
            'name': contract.get('name'),
            'vendor': contract.get('vendor'),
            'status': contract.get('status'),
            'status_name': self.get_status_display_name(contract.get('status', '')),
            'type_name': self.get_type_display_name(contract.get('type', '')),
            'formatted_amount': self.format_contract_amount(contract.get('amount', 0)),
            'days_remaining': self.get_days_remaining(contract),
            'progress_percent': self.get_contract_progress_percent(contract),
            'is_active': self.is_contract_active(contract),
            'is_expiring_soon': self.is_contract_expiring_soon(contract),
            'risk_info': self.get_expiry_risk_level(self.get_days_remaining(contract))
        } 