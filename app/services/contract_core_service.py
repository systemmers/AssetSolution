"""
Contract Core Service - 계약 비즈니스 로직 계층 (Facade Pattern)

계약 관련 핵심 비즈니스 로직을 도메인별 서비스로 delegation하는 Facade 서비스
"""
from typing import List, Dict, Optional, Any, Tuple
from datetime import datetime, date, timedelta
from .contract.crud_service import ContractCrudService
from .contract.statistics_service import ContractStatisticsService
from .contract.validation_service import ContractValidationService
from .contract.utility_service import ContractUtilityService

class ContractCoreService:
    """계약 핵심 비즈니스 로직을 담당하는 Facade Service 클래스"""
    
    def __init__(self):
        """Service 초기화 및 도메인 서비스 의존성 주입"""
        self.crud_service = ContractCrudService()
        self.statistics_service = ContractStatisticsService()
        self.validation_service = ContractValidationService()
        self.utility_service = ContractUtilityService()
    
    def get_contract_list(
        self,
        search_query: Optional[str] = None,
        contract_type: Optional[str] = None,
        status: Optional[str] = None,
        page: int = 1,
        per_page: int = 10
    ) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """계약 목록 조회 (검색, 필터링, 페이지네이션 포함) - Delegation to CrudService"""
        return self.crud_service.get_contract_list(
            search_query=search_query,
            contract_type=contract_type,
            status=status,
            page=page,
            per_page=per_page
        )
    
    def get_contract_detail(self, contract_id: int) -> Optional[Dict[str, Any]]:
        """계약 상세 정보 조회 - Delegation to CrudService + StatisticsService"""
        contract = self.crud_service.get_contract_detail(contract_id)
        if contract:
            # 통계 정보 추가
            contract.update(self.statistics_service._calculate_contract_metrics(contract))
        return contract
    
    def create_contract(self, contract_data: Dict[str, Any]) -> Dict[str, Any]:
        """새 계약 생성 - Delegation to ValidationService + CrudService"""
        # 비즈니스 규칙 검증
        self.validation_service.validate_contract_data(contract_data)
        
        # CrudService를 통한 생성
        return self.crud_service.create_contract(contract_data)
    
    def update_contract(self, contract_id: int, contract_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """계약 정보 수정 - Delegation to ValidationService + CrudService"""
        # 기존 계약 확인
        existing_contract = self.crud_service.get_contract_detail(contract_id)
        if not existing_contract:
            return None
        
        # 비즈니스 규칙 검증
        self.validation_service.validate_contract_data(contract_data, is_update=True)
        
        # 상태 변경 검증
        self.validation_service.validate_status_change(existing_contract, contract_data)
        
        # CrudService를 통한 업데이트
        return self.crud_service.update_contract(contract_id, contract_data)
    
    def delete_contract(self, contract_id: int) -> bool:
        """계약 삭제 - Delegation to ValidationService + CrudService"""
        # 기존 계약 확인
        existing_contract = self.crud_service.get_contract_detail(contract_id)
        if not existing_contract:
            return False
        
        # 삭제 가능성 검증
        self.validation_service.validate_contract_deletion(existing_contract)
        
        # CrudService를 통한 삭제
        return self.crud_service.delete_contract(contract_id)
    
    def get_expiring_contracts(self, days_ahead: int = 30) -> List[Dict[str, Any]]:
        """만료 예정 계약 목록 조회 - Delegation to StatisticsService"""
        return self.statistics_service.get_expiring_contracts(days_ahead)
    
    def get_contract_statistics(self) -> Dict[str, Any]:
        """계약 통계 정보 조회 - Delegation to StatisticsService"""
        return self.statistics_service.get_contract_statistics()

# 싱글톤 인스턴스 생성
contract_core_service = ContractCoreService()
