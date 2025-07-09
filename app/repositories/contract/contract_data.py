"""
계약 관련 Mock 데이터 관리
싱글톤 패턴을 적용하여 메모리 효율성 확보
순수 데이터 컨테이너 역할만 수행 (비즈니스 로직은 Repository에서 처리)

Classes:
    - ContractData: 계약 관련 Mock 데이터 관리 (싱글톤)
"""
from typing import List, Dict, Any, Optional
from datetime import datetime


class ContractData:
    """
    계약 관련 Mock 데이터 관리 (싱글톤)
    
    애플리케이션 생명주기 동안 일관된 계약 데이터를 제공합니다.
    순수 데이터 컨테이너 역할만 수행하며, 비즈니스 로직은 ContractRepository에서 처리합니다.
    DB 전환 시 이 클래스는 제거 예정입니다.
    """
    
    _instance = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not ContractData._initialized:
            self._initialize_data()
            ContractData._initialized = True
    
    def _initialize_data(self):
        """초기 데이터 설정"""
        self._contracts = [
            {
                'id': 1,
                'name': 'Adobe Creative Cloud 라이선스',
                'vendor': 'Adobe Inc.',
                'start_date': '2023-09-01',
                'end_date': '2024-08-31',
                'status': 'active',
                'type': 'license',
                'amount': 5000000,
                'department': '디자인팀',
                'manager': '김철수',
                'contract_no': 'CT-2023-001',
                'payment_term': '연간'
            },
            {
                'id': 2,
                'name': 'Microsoft Office 365 라이선스',
                'vendor': 'Microsoft',
                'start_date': '2023-10-15',
                'end_date': '2024-10-14',
                'status': 'active',
                'type': 'license',
                'amount': 3500000,
                'department': '전사',
                'manager': '박영희',
                'contract_no': 'CT-2023-002',
                'payment_term': '연간'
            },
            {
                'id': 3,
                'name': '서버 유지보수 계약',
                'vendor': '서버테크',
                'start_date': '2023-01-01',
                'end_date': '2023-12-31',
                'status': 'expiring',
                'type': 'maintenance',
                'amount': 12000000,
                'department': 'IT팀',
                'manager': '이지훈',
                'contract_no': 'CT-2023-003',
                'payment_term': '분기별'
            },
            {
                'id': 4,
                'name': '네트워크 인프라 유지보수',
                'vendor': '네트워크솔루션',
                'start_date': '2023-06-01',
                'end_date': '2024-05-31',
                'status': 'active',
                'type': 'maintenance',
                'amount': 8500000,
                'department': 'IT팀',
                'manager': '이지훈',
                'contract_no': 'CT-2023-004',
                'payment_term': '반기별'
            },
            {
                'id': 5,
                'name': '오피스 임대 계약',
                'vendor': '부동산개발(주)',
                'start_date': '2022-01-01',
                'end_date': '2025-12-31',
                'status': 'active',
                'type': 'lease',
                'amount': 150000000,
                'department': '경영지원팀',
                'manager': '정수영',
                'contract_no': 'CT-2022-001',
                'payment_term': '월간'
            }
        ]
    
    def reset_for_testing(self):
        """테스트용 데이터 리셋"""
        self._contracts = []
        ContractData._initialized = False
        self._initialize_data()
    
    # ==================== 기본 데이터 접근 메서드 ====================
    
    def get_all_contracts(self) -> List[Dict[str, Any]]:
        """
        모든 계약 목록 조회
        
        Returns:
            전체 계약 데이터 목록 (복사본)
        """
        return self._contracts.copy()
    
    def get_contract_by_id(self, contract_id: int) -> Optional[Dict[str, Any]]:
        """
        ID로 계약 조회
        
        Args:
            contract_id: 조회할 계약 ID
            
        Returns:
            해당 계약 데이터 또는 None
        """
        return next((contract for contract in self._contracts if contract['id'] == contract_id), None)
    
    def add_contract(self, contract_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        새 계약 추가
        
        Args:
            contract_data: 추가할 계약 데이터
            
        Returns:
            추가된 계약 데이터
        """
        new_id = max(contract['id'] for contract in self._contracts) + 1 if self._contracts else 1
        contract_data['id'] = new_id
        contract_data['created_at'] = datetime.now().isoformat()
        contract_data['updated_at'] = datetime.now().isoformat()
        self._contracts.append(contract_data)
        return contract_data
    
    def update_contract(self, contract_id: int, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        계약 정보 업데이트
        
        Args:
            contract_id: 업데이트할 계약 ID
            update_data: 업데이트할 데이터
            
        Returns:
            업데이트된 계약 데이터 또는 None
        """
        for i, contract in enumerate(self._contracts):
            if contract['id'] == contract_id:
                updated_contract = contract.copy()
                updated_contract.update(update_data)
                updated_contract['updated_at'] = datetime.now().isoformat()
                self._contracts[i] = updated_contract
                return updated_contract
        return None
    
    def delete_contract(self, contract_id: int) -> bool:
        """
        계약 삭제
        
        Args:
            contract_id: 삭제할 계약 ID
            
        Returns:
            삭제 성공 여부
        """
        for i, contract in enumerate(self._contracts):
            if contract['id'] == contract_id:
                del self._contracts[i]
                return True
        return False
    
    def get_count(self) -> int:
        """
        전체 계약 수 조회
        
        Returns:
            전체 계약 수
        """
        return len(self._contracts) 