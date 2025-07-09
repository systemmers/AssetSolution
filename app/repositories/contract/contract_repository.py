"""
Contract Repository - 계약 데이터 접근 계층

계약 관련 데이터 CRUD 및 검색/필터링 로직을 담당하는 Repository 패턴 구현
BaseRepository를 상속받아 표준 Repository 인터페이스 준수

Classes:
    - ContractRepository: 계약 데이터 접근 및 비즈니스 로직 처리
"""
from typing import List, Dict, Optional, Any, Tuple
from datetime import datetime, timedelta
from ..base_repository import BaseRepository
from .contract_data import ContractData


class ContractRepository(BaseRepository):
    """계약 데이터 접근을 담당하는 Repository 클래스 (BaseRepository 상속)"""
    
    def __init__(self):
        """Repository 초기화 및 싱글톤 데이터 소스 연결"""
        super().__init__()
        self.data_source = ContractData()
        
        # BaseRepository의 _data를 실제 데이터와 연결
        self._data = self.data_source._contracts
        
        # 기존 API 호환성을 위한 속성 (deprecated)
        self._contracts = self.data_source._contracts
    
    # ==================== BaseRepository 추상 메서드 구현 ====================
    
    def _load_sample_data(self) -> List[Dict[str, Any]]:
        """
        샘플 데이터 로드 (BaseRepository 추상 메서드 구현)
        
        Returns:
            계약 샘플 데이터 리스트
        """
        return self.data_source.get_all_contracts()
    
    def _validate_data(self, data: Dict[str, Any], is_update: bool = False) -> None:
        """
        계약 데이터 유효성 검증 (BaseRepository 추상 메서드 구현)
        
        Args:
            data: 검증할 계약 데이터
            is_update: 업데이트 작업 여부
            
        Raises:
            ValueError: 유효하지 않은 데이터인 경우
        """
        # 필수 필드 검증
        required_fields = ['name', 'vendor', 'start_date', 'end_date', 'type', 'amount']
        
        if not is_update:
            # 생성 시에는 모든 필수 필드가 있어야 함
            missing_fields = [field for field in required_fields if field not in data or not data[field]]
            if missing_fields:
                raise ValueError(f"필수 필드가 누락되었습니다: {', '.join(missing_fields)}")
        
        # 데이터 타입 검증
        if 'amount' in data:
            if not isinstance(data['amount'], (int, float)) or data['amount'] < 0:
                raise ValueError("계약 금액은 0 이상의 숫자여야 합니다.")
        
        # 날짜 형식 검증
        for date_field in ['start_date', 'end_date']:
            if date_field in data:
                try:
                    datetime.strptime(data[date_field], '%Y-%m-%d')
                except (ValueError, TypeError):
                    raise ValueError(f"{date_field}는 YYYY-MM-DD 형식이어야 합니다.")
        
        # 계약 유형 검증
        if 'type' in data:
            valid_types = ['license', 'maintenance', 'lease', 'service']
            if data['type'] not in valid_types:
                raise ValueError(f"계약 유형은 다음 중 하나여야 합니다: {', '.join(valid_types)}")
        
        # 상태 검증
        if 'status' in data:
            valid_statuses = ['active', 'inactive', 'expired', 'expiring']
            if data['status'] not in valid_statuses:
                raise ValueError(f"계약 상태는 다음 중 하나여야 합니다: {', '.join(valid_statuses)}")
    
    # ==================== 기존 인터페이스 호환성 메서드 ====================
    
    def get_all(self) -> List[Dict[str, Any]]:
        """모든 계약 데이터 조회 (기존 인터페이스 호환)"""
        return self.data_source.get_all_contracts()
    
    def get_by_id(self, contract_id: int) -> Optional[Dict[str, Any]]:
        """ID로 계약 조회 (기존 인터페이스 호환)"""
        return self.data_source.get_contract_by_id(contract_id)
    
    def create_contract(self, contract_data: Dict[str, Any]) -> Dict[str, Any]:
        """새 계약 생성 (기존 인터페이스 호환)"""
        # BaseRepository의 create 메서드 활용
        return self.create(contract_data)
    
    def update_contract(self, contract_id: int, contract_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """계약 정보 수정 (기존 인터페이스 호환)"""
        # BaseRepository의 update 메서드 활용
        return self.update(contract_id, contract_data)
    
    def delete_contract(self, contract_id: int) -> bool:
        """계약 삭제 (기존 인터페이스 호환)"""
        # BaseRepository의 delete 메서드 활용
        return self.delete(contract_id)
    
    # ==================== 비즈니스 로직 메서드 (contract_data에서 이관) ====================
    
    def search_contracts(
        self, 
        search_query: Optional[str] = None,
        contract_type: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        계약 검색 및 필터링 (contract_data에서 이관)
        
        Args:
            search_query: 검색어
            contract_type: 계약 유형 필터
            status: 상태 필터
            
        Returns:
            필터링된 계약 목록
        """
        contracts = self.get_all()
        
        # 검색어 필터링
        if search_query:
            search_lower = search_query.lower()
            contracts = [
                c for c in contracts 
                if (search_lower in c['name'].lower() or
                    search_lower in c['vendor'].lower() or
                    search_lower in c.get('contract_no', '').lower())
            ]
        
        # 계약 유형 필터링
        if contract_type:
            contracts = [c for c in contracts if c['type'] == contract_type]
        
        # 상태 필터링
        if status:
            contracts = [c for c in contracts if c['status'] == status]
        
        return contracts
    
    def get_contracts_by_status(self, status: str) -> List[Dict[str, Any]]:
        """
        상태별 계약 목록 조회 (contract_data에서 이관)
        
        Args:
            status: 계약 상태
            
        Returns:
            해당 상태의 계약 목록
        """
        return [contract for contract in self.get_all() if contract['status'] == status]
    
    def get_contracts_by_type(self, contract_type: str) -> List[Dict[str, Any]]:
        """
        유형별 계약 목록 조회 (contract_data에서 이관)
        
        Args:
            contract_type: 계약 유형
            
        Returns:
            해당 유형의 계약 목록
        """
        return [contract for contract in self.get_all() if contract['type'] == contract_type]
    
    def get_expiring_contracts(self, days_ahead: int = 30) -> List[Dict[str, Any]]:
        """
        만료 예정 계약 목록 조회 (contract_data에서 이관)
        
        Args:
            days_ahead: 몇 일 이내 만료 예정 계약을 조회할지
            
        Returns:
            만료 예정 계약 목록
        """
        target_date = datetime.now() + timedelta(days=days_ahead)
        expiring_contracts = []
        
        for contract in self.get_all():
            try:
                end_date = datetime.strptime(contract['end_date'], '%Y-%m-%d')
                if end_date <= target_date:
                    expiring_contracts.append(contract)
            except (ValueError, TypeError):
                continue
        
        return expiring_contracts
    
    def get_statistics(self) -> Dict[str, Any]:
        """
        계약 통계 정보 조회 (contract_data에서 이관 및 개선)
        
        Returns:
            계약 통계 정보
        """
        contracts = self.get_all()
        total_contracts = len(contracts)
        
        # 상태별 통계
        status_stats = {}
        for contract in contracts:
            status = contract['status']
            status_stats[status] = status_stats.get(status, 0) + 1
        
        # 유형별 통계
        type_stats = {}
        for contract in contracts:
            contract_type = contract['type']
            type_stats[contract_type] = type_stats.get(contract_type, 0) + 1
        
        # 총 계약 금액
        total_amount = sum(contract.get('amount', 0) for contract in contracts)
        
        return {
            'total_count': total_contracts,
            'total_contracts': total_contracts,  # 하위 호환성을 위해 유지
            'active_count': status_stats.get('active', 0),
            'expiring_count': status_stats.get('expiring', 0),
            'expired_count': status_stats.get('expired', 0),
            'status_stats': status_stats,
            'type_stats': type_stats,
            'total_amount': total_amount,
            'monthly_cost': 0  # 기본값 설정
        }
    
    # ==================== 페이지네이션 및 유틸리티 메서드 ====================
    
    def get_paginated_contracts(
        self,
        contracts: List[Dict[str, Any]],
        page: int = 1,
        per_page: int = 10
    ) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """
        페이지네이션 처리된 계약 목록 반환 (기존 인터페이스 호환)
        
        Args:
            contracts: 계약 목록
            page: 페이지 번호
            per_page: 페이지당 항목 수
            
        Returns:
            Tuple[현재 페이지 계약 목록, 페이지네이션 정보]
        """
        # BaseRepository의 paginate 메서드 활용
        return self.paginate(contracts, page, per_page)


# 싱글톤 인스턴스 생성 (애플리케이션 전역에서 사용)
contract_repository = ContractRepository() 