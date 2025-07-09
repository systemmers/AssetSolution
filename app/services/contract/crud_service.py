"""
Contract CRUD Service
계약 CRUD 작업을 담당하는 서비스

Classes:
    - ContractCrudService: 계약 생성, 조회, 수정, 삭제 서비스
"""
from typing import List, Dict, Optional, Any, Tuple
from datetime import datetime, date
from ...repositories.contract.contract_repository import ContractRepository
from ...utils.constants import (
    CONTRACT_TYPES, CONTRACT_STATUS, 
    get_contract_type_name, get_contract_status_name
)
from ...utils.formatters import format_date


class ContractCrudService:
    """계약 CRUD 작업을 담당하는 서비스 클래스"""
    
    def __init__(self):
        """Service 초기화"""
        self.repository = ContractRepository()
    
    def get_contract_list(
        self,
        search_query: Optional[str] = None,
        contract_type: Optional[str] = None,
        status: Optional[str] = None,
        page: int = 1,
        per_page: int = 10
    ) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """
        계약 목록 조회 (검색, 필터링, 페이지네이션 포함)
        
        Args:
            search_query: 검색어
            contract_type: 계약 유형 필터
            status: 상태 필터
            page: 페이지 번호
            per_page: 페이지당 항목 수
            
        Returns:
            Tuple[계약 목록, 페이지네이션 정보]
        """
        # Repository를 통한 검색 및 필터링
        contracts = self.repository.search_contracts(
            search_query=search_query,
            contract_type=contract_type,
            status=status
        )
        
        # 페이지네이션 처리
        current_page_contracts, pagination_info = self.repository.get_paginated_contracts(
            contracts=contracts,
            page=page,
            per_page=per_page
        )
        
        # 비즈니스 로직: 계약별 추가 정보 처리
        enriched_contracts = []
        for contract in current_page_contracts:
            enriched_contract = self._enrich_contract_data(contract)
            enriched_contracts.append(enriched_contract)
        
        return enriched_contracts, pagination_info
    
    def get_contract_detail(self, contract_id: int) -> Optional[Dict[str, Any]]:
        """
        계약 상세 정보 조회
        
        Args:
            contract_id: 계약 ID
            
        Returns:
            계약 상세 정보 또는 None
        """
        contract = self.repository.get_by_id(contract_id)
        if not contract:
            return None
        
        # 상세 정보에 추가 비즈니스 로직 적용
        enriched_contract = self._enrich_contract_data(contract)
        
        return enriched_contract
    
    def create_contract(self, contract_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        새 계약 생성
        
        Args:
            contract_data: 계약 데이터
            
        Returns:
            생성된 계약 정보
        """
        # 계약 번호 자동 생성
        contract_data['contract_no'] = self._generate_contract_number(contract_data.get('type'))
        
        # 상태 기본값 설정
        if 'status' not in contract_data:
            contract_data['status'] = 'active'
        
        # Repository를 통한 데이터 저장
        created_contract = self.repository.create_contract(contract_data)
        
        return self._enrich_contract_data(created_contract)
    
    def update_contract(self, contract_id: int, contract_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        계약 정보 수정
        
        Args:
            contract_id: 계약 ID
            contract_data: 수정할 계약 데이터
            
        Returns:
            수정된 계약 정보 또는 None
        """
        # 기존 계약 확인
        existing_contract = self.repository.get_by_id(contract_id)
        if not existing_contract:
            return None
        
        # Repository를 통한 데이터 업데이트
        updated_contract = self.repository.update_contract(contract_id, contract_data)
        
        if updated_contract:
            return self._enrich_contract_data(updated_contract)
        return None
    
    def delete_contract(self, contract_id: int) -> bool:
        """
        계약 삭제
        
        Args:
            contract_id: 계약 ID
            
        Returns:
            삭제 성공 여부
        """
        # 기존 계약 확인
        existing_contract = self.repository.get_by_id(contract_id)
        if not existing_contract:
            return False
        
        # Repository를 통한 데이터 삭제
        return self.repository.delete_contract(contract_id)
    
    def _enrich_contract_data(self, contract: Dict[str, Any]) -> Dict[str, Any]:
        """
        계약 데이터에 추가 정보 포함
        
        Args:
            contract: 기본 계약 데이터
            
        Returns:
            강화된 계약 데이터
        """
        enriched = contract.copy()
        
        # 한국어 상태명 추가
        enriched['status_name'] = get_contract_status_name(contract['status'])
        
        # 한국어 유형명 추가
        enriched['type_name'] = get_contract_type_name(contract['type'])
        
        # 포맷된 금액 추가
        enriched['formatted_amount'] = f"{contract['amount']:,}원"
        
        # 날짜 포맷팅
        enriched['formatted_start_date'] = format_date(contract['start_date'], '%Y년 %m월 %d일')
        enriched['formatted_end_date'] = format_date(contract['end_date'], '%Y년 %m월 %d일')
        
        return enriched
    
    def _generate_contract_number(self, contract_type: str) -> str:
        """
        계약 번호 자동 생성
        
        Args:
            contract_type: 계약 유형
            
        Returns:
            생성된 계약 번호
        """
        current_year = datetime.now().year
        all_contracts = self.repository.get_all()
        
        # 올해 계약 수 계산
        yearly_count = len([c for c in all_contracts if c.get('contract_no', '').startswith(f'CT-{current_year}')])
        
        # 계약 번호 생성 (CT-YYYY-NNN 형식)
        return f"CT-{current_year}-{yearly_count + 1:03d}" 