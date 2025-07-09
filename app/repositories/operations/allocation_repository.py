"""
할당 도메인 Repository 클래스
BaseRepository를 상속받아 할당 관련 비즈니스 로직을 처리

Classes:
    - AllocationRepository: 할당 도메인의 데이터 액세스 및 비즈니스 로직 처리
"""
from typing import List, Dict, Any, Optional, Tuple
from .data.allocation_data import AllocationData


class AllocationRepository:
    """
    할당 도메인 Repository 클래스
    
    BaseRepository를 상속받아 할당 관련 데이터 액세스와 
    비즈니스 로직을 처리합니다.
    """
    
    def __init__(self):
        """AllocationRepository 초기화"""
        self.data_source = AllocationData()  # 싱글톤 인스턴스
        # 기존 operations_repository와 동일한 속성 제공
        self.allocations = self.data_source._allocations
    
    # ==================== BaseRepository 추상 메서드 구현 ====================
    
    def _load_sample_data(self) -> List[Dict[str, Any]]:
        """
        샘플 데이터 로드 (AllocationData에서 가져옴)
        
        Returns:
            할당 샘플 데이터 리스트
        """
        return self.data_source.get_all_allocations()
    
    def _validate_data(self, data: Dict[str, Any], is_update: bool = False) -> None:
        """
        할당 데이터 유효성 검증
        
        Args:
            data: 검증할 할당 데이터
            is_update: 업데이트 작업 여부
            
        Raises:
            ValueError: 유효하지 않은 데이터인 경우
        """
        # 필수 필드 검증
        required_fields = ['asset_id', 'allocation_type', 'allocation_date']
        if not is_update:
            required_fields.extend(['location', 'purpose'])
        
        for field in required_fields:
            if field not in data or data[field] is None:
                raise ValueError(f"필수 필드 '{field}'가 누락되었습니다.")
        
        # 자산 ID 유효성 검증
        if 'asset_id' in data and not isinstance(data['asset_id'], int):
            raise ValueError("자산 ID는 정수여야 합니다.")
        
        # 할당 유형 유효성 검증
        if 'allocation_type' in data:
            valid_types = ['개인할당', '공간할당', '부서할당', '임시할당']
            if data['allocation_type'] not in valid_types:
                raise ValueError(f"할당 유형은 {valid_types} 중 하나여야 합니다.")
        
        # 상태 유효성 검증
        if 'status' in data:
            valid_statuses = ['할당중', '반납완료', '이전중', '분실']
            if data['status'] not in valid_statuses:
                raise ValueError(f"상태는 {valid_statuses} 중 하나여야 합니다.")
        
        # 개인할당인 경우 사용자 ID 필수
        if data.get('allocation_type') == '개인할당' and not data.get('user_id'):
            raise ValueError("개인할당인 경우 사용자 ID가 필요합니다.")
    
    # ==================== BaseRepository CRUD 오버라이드 ====================
    
    def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        새 할당 생성
        
        Args:
            data: 생성할 할당 데이터
            
        Returns:
            생성된 할당 정보
        """
        # 기본값 설정
        data.setdefault('status', '할당중')
        data.setdefault('notes', '')
        
        # 데이터 유효성 검증
        self._validate_data(data, is_update=False)
        
        # AllocationData를 통해 생성
        created_allocation = self.data_source.add_allocation(data)
        
        # allocations 속성은 data_source._allocations을 참조하므로 자동 동기화됨
        
        return created_allocation
    
    def update(self, item_id: int, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        할당 정보 수정
        
        Args:
            item_id: 수정할 할당 ID
            data: 수정할 데이터
            
        Returns:
            수정된 할당 정보 또는 None
        """
        # 데이터 유효성 검증
        self._validate_data(data, is_update=True)
        
        # AllocationData를 통해 업데이트
        updated_allocation = self.data_source.update_allocation(item_id, data)
        
        # allocations 속성은 data_source._allocations을 참조하므로 자동 동기화됨
        
        return updated_allocation
    
    def delete(self, item_id: int) -> bool:
        """
        할당 삭제
        
        Args:
            item_id: 삭제할 할당 ID
            
        Returns:
            삭제 성공 여부
        """
        # AllocationData를 통해 삭제
        success = self.data_source.delete_allocation(item_id)
        
        # allocations 속성은 data_source._allocations을 참조하므로 자동 동기화됨
        
        return success
    
    def get_statistics(self) -> Dict[str, Any]:
        """
        할당 통계 정보 조회
        
        Returns:
            할당 통계 딕셔너리
        """
        return self.data_source.get_allocation_statistics()
    
    # ==================== 도메인 특화 메서드 ====================
    
    def get_allocations_by_status(self, status: str) -> List[Dict[str, Any]]:
        """
        상태별 할당 목록 조회
        
        Args:
            status: 할당 상태
            
        Returns:
            해당 상태의 할당 목록
        """
        return self.data_source.get_allocations_by_status(status)
    
    def get_allocations_by_user(self, user_id: int) -> List[Dict[str, Any]]:
        """
        사용자별 할당 목록 조회
        
        Args:
            user_id: 사용자 ID
            
        Returns:
            해당 사용자의 할당 목록
        """
        return self.data_source.get_allocations_by_user(user_id)
    
    def get_allocations_by_department(self, department: str) -> List[Dict[str, Any]]:
        """
        부서별 할당 목록 조회
        
        Args:
            department: 부서명
            
        Returns:
            해당 부서의 할당 목록
        """
        return self.data_source.get_allocations_by_department(department)
    
    def get_allocations_by_type(self, allocation_type: str) -> List[Dict[str, Any]]:
        """
        유형별 할당 목록 조회
        
        Args:
            allocation_type: 할당 유형
            
        Returns:
            해당 유형의 할당 목록
        """
        return self.data_source.get_allocations_by_type(allocation_type)
    
    # ==================== 비즈니스 로직 메서드 ====================
    
    def return_allocation(self, allocation_id: int, return_reason: str = "") -> Dict[str, Any]:
        """
        할당 반납 처리
        
        Args:
            allocation_id: 할당 ID
            return_reason: 반납 사유
            
        Returns:
            업데이트된 할당 정보
        """
        allocation = self.get_by_id(allocation_id)
        if not allocation:
            raise ValueError("존재하지 않는 할당 ID입니다.")
        
        if allocation.get('status') != '할당중':
            raise ValueError("할당 중인 자산만 반납할 수 있습니다.")
        
        update_data = {
            'status': '반납완료',
            'notes': f"{allocation.get('notes', '')} | 반납: {return_reason}".strip(' |')
        }
        
        return self.update(allocation_id, update_data)
    
    def transfer_allocation(self, allocation_id: int, new_user_id: int = None, 
                          new_location: str = None, transfer_reason: str = "") -> Dict[str, Any]:
        """
        할당 이전 처리
        
        Args:
            allocation_id: 할당 ID
            new_user_id: 새 사용자 ID (개인할당인 경우)
            new_location: 새 위치
            transfer_reason: 이전 사유
            
        Returns:
            업데이트된 할당 정보
        """
        allocation = self.get_by_id(allocation_id)
        if not allocation:
            raise ValueError("존재하지 않는 할당 ID입니다.")
        
        if allocation.get('status') != '할당중':
            raise ValueError("할당 중인 자산만 이전할 수 있습니다.")
        
        update_data = {
            'notes': f"{allocation.get('notes', '')} | 이전: {transfer_reason}".strip(' |')
        }
        
        if new_user_id:
            update_data['user_id'] = new_user_id
        
        if new_location:
            update_data['location'] = new_location
        
        return self.update(allocation_id, update_data) 