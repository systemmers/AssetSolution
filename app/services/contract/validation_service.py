"""
Contract Validation Service
계약 검증 로직을 담당하는 서비스

Classes:
    - ContractValidationService: 계약 데이터 검증 서비스
"""
from typing import Dict, Any
from datetime import datetime


class ContractValidationService:
    """계약 검증 로직을 담당하는 서비스 클래스"""
    
    def __init__(self):
        """Service 초기화"""
        pass
    
    def validate_contract_data(self, contract_data: Dict[str, Any], is_update: bool = False) -> None:
        """
        계약 데이터 유효성 검증
        
        Args:
            contract_data: 검증할 계약 데이터
            is_update: 업데이트인지 여부
            
        Raises:
            ValueError: 유효하지 않은 데이터인 경우
        """
        required_fields = ['name', 'vendor', 'start_date', 'end_date', 'amount']
        
        if not is_update:
            # 생성 시 필수 필드 검증
            for field in required_fields:
                if field not in contract_data or not contract_data[field]:
                    raise ValueError(f"필수 필드가 누락되었습니다: {field}")
        
        # 날짜 형식 검증
        if 'start_date' in contract_data:
            self._validate_date_format(contract_data['start_date'], 'start_date')
        
        if 'end_date' in contract_data:
            self._validate_date_format(contract_data['end_date'], 'end_date')
        
        # 시작일이 종료일보다 빠른지 검증
        if 'start_date' in contract_data and 'end_date' in contract_data:
            start_date = datetime.strptime(contract_data['start_date'], '%Y-%m-%d').date()
            end_date = datetime.strptime(contract_data['end_date'], '%Y-%m-%d').date()
            if start_date >= end_date:
                raise ValueError("시작일은 종료일보다 빨라야 합니다.")
        
        # 금액 검증
        if 'amount' in contract_data:
            if not isinstance(contract_data['amount'], (int, float)) or contract_data['amount'] <= 0:
                raise ValueError("계약 금액은 0보다 큰 숫자여야 합니다.")
        
        # 계약 유형 검증
        if 'type' in contract_data:
            valid_types = ['license', 'maintenance', 'lease', 'service', 'other']
            if contract_data['type'] not in valid_types:
                raise ValueError(f"유효하지 않은 계약 유형입니다: {contract_data['type']}")
        
        # 상태 검증
        if 'status' in contract_data:
            valid_statuses = ['active', 'expiring', 'expired', 'terminated', 'pending']
            if contract_data['status'] not in valid_statuses:
                raise ValueError(f"유효하지 않은 상태입니다: {contract_data['status']}")
    
    def validate_status_change(self, existing_contract: Dict[str, Any], new_data: Dict[str, Any]) -> None:
        """
        상태 변경 유효성 검증
        
        Args:
            existing_contract: 기존 계약 데이터
            new_data: 새로운 데이터
            
        Raises:
            ValueError: 유효하지 않은 상태 변경인 경우
        """
        if 'status' not in new_data:
            return
        
        old_status = existing_contract['status']
        new_status = new_data['status']
        
        # 종료된 계약은 다시 활성화할 수 없음
        if old_status in ['expired', 'terminated'] and new_status in ['active', 'expiring']:
            raise ValueError("만료되거나 해지된 계약은 다시 활성화할 수 없습니다.")
    
    def validate_contract_deletion(self, contract: Dict[str, Any]) -> None:
        """
        계약 삭제 가능성 검증
        
        Args:
            contract: 계약 데이터
            
        Raises:
            ValueError: 삭제할 수 없는 계약인 경우
        """
        # 활성 계약은 삭제할 수 없음
        if contract['status'] == 'active':
            raise ValueError("활성 상태의 계약은 삭제할 수 없습니다. 먼저 계약을 해지해주세요.")
    
    def _validate_date_format(self, date_string: str, field_name: str) -> None:
        """
        날짜 형식 검증
        
        Args:
            date_string: 검증할 날짜 문자열
            field_name: 필드명
            
        Raises:
            ValueError: 유효하지 않은 날짜 형식인 경우
        """
        try:
            datetime.strptime(date_string, '%Y-%m-%d')
        except ValueError:
            raise ValueError(f"{field_name}은 YYYY-MM-DD 형식이어야 합니다.")
    
    def validate_contract_amount(self, amount: Any) -> float:
        """
        계약 금액 검증 및 변환
        
        Args:
            amount: 검증할 금액
            
        Returns:
            검증된 금액
            
        Raises:
            ValueError: 유효하지 않은 금액인 경우
        """
        try:
            amount_float = float(amount)
            if amount_float <= 0:
                raise ValueError("계약 금액은 0보다 큰 숫자여야 합니다.")
            return amount_float
        except (ValueError, TypeError):
            raise ValueError("계약 금액은 유효한 숫자여야 합니다.")
    
    def validate_contract_type(self, contract_type: str) -> str:
        """
        계약 유형 검증
        
        Args:
            contract_type: 검증할 계약 유형
            
        Returns:
            검증된 계약 유형
            
        Raises:
            ValueError: 유효하지 않은 계약 유형인 경우
        """
        valid_types = ['license', 'maintenance', 'lease', 'service', 'other']
        if contract_type not in valid_types:
            raise ValueError(f"유효하지 않은 계약 유형입니다: {contract_type}")
        return contract_type
    
    def validate_contract_status(self, status: str) -> str:
        """
        계약 상태 검증
        
        Args:
            status: 검증할 상태
            
        Returns:
            검증된 상태
            
        Raises:
            ValueError: 유효하지 않은 상태인 경우
        """
        valid_statuses = ['active', 'expiring', 'expired', 'terminated', 'pending']
        if status not in valid_statuses:
            raise ValueError(f"유효하지 않은 상태입니다: {status}")
        return status
    
    def validate_payment_term(self, payment_term: str) -> str:
        """
        결제 조건 검증
        
        Args:
            payment_term: 검증할 결제 조건
            
        Returns:
            검증된 결제 조건
            
        Raises:
            ValueError: 유효하지 않은 결제 조건인 경우
        """
        valid_terms = ['월간', '분기별', '반기별', '연간', '일시불']
        if payment_term not in valid_terms:
            raise ValueError(f"유효하지 않은 결제 조건입니다: {payment_term}")
        return payment_term 