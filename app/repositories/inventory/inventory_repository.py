"""
자산실사 데이터 접근 계층 (Repository Pattern)
BaseRepository를 상속받아 표준 Repository 인터페이스 준수

Classes:
    - InventoryRepository: 자산실사 데이터 접근 및 비즈니스 로직 처리
"""
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any, Tuple
from ..base_repository import BaseRepository
from .inventory_data import InventoryData


class InventoryRepository(BaseRepository):
    """자산실사 데이터 저장소 클래스 (BaseRepository 상속)"""
    
    def __init__(self):
        """Repository 초기화 및 싱글톤 데이터 소스 연결"""
        super().__init__()
        self.data_source = InventoryData()
        
        # BaseRepository의 _data를 실제 데이터와 연결
        self._data = self.data_source._inventories
        
        # 기존 API 호환성을 위한 속성 (deprecated)
        self._inventories = self.data_source._inventories
        self._inventory_details = self.data_source._inventory_details
        self._discrepancies = self.data_source._discrepancies
    
    # ==================== BaseRepository 추상 메서드 구현 ====================
    
    def _load_sample_data(self) -> List[Dict[str, Any]]:
        """
        샘플 데이터 로드 (BaseRepository 추상 메서드 구현)
        
        Returns:
            자산실사 샘플 데이터 리스트
        """
        return self.data_source.get_all_inventories()
    
    def _validate_data(self, data: Dict[str, Any], is_update: bool = False) -> None:
        """
        자산실사 데이터 유효성 검증 (BaseRepository 추상 메서드 구현)
        
        Args:
            data: 검증할 자산실사 데이터
            is_update: 업데이트 작업 여부
            
        Raises:
            ValueError: 유효하지 않은 데이터인 경우
        """
        # 필수 필드 검증
        required_fields = ['name', 'start_date', 'end_date', 'manager', 'department']
        
        if not is_update:
            # 생성 시에는 모든 필수 필드가 있어야 함
            missing_fields = [field for field in required_fields if field not in data or not data[field]]
            if missing_fields:
                raise ValueError(f"필수 필드가 누락되었습니다: {', '.join(missing_fields)}")
        
        # 날짜 형식 검증
        for date_field in ['start_date', 'end_date']:
            if date_field in data:
                try:
                    datetime.strptime(data[date_field], '%Y-%m-%d')
                except (ValueError, TypeError):
                    raise ValueError(f"{date_field}는 YYYY-MM-DD 형식이어야 합니다.")
        
        # 시작일이 종료일보다 이전인지 검증
        if 'start_date' in data and 'end_date' in data:
            try:
                start = datetime.strptime(data['start_date'], '%Y-%m-%d')
                end = datetime.strptime(data['end_date'], '%Y-%m-%d')
                if start >= end:
                    raise ValueError("시작일은 종료일보다 이전이어야 합니다.")
            except (ValueError, TypeError) as e:
                if "시작일은 종료일보다" not in str(e):
                    pass  # 날짜 형식 오류는 위에서 이미 처리
        
        # 상태 검증
        if 'status' in data:
            valid_statuses = ['planned', 'in_progress', 'completed', 'cancelled']
            if data['status'] not in valid_statuses:
                raise ValueError(f"상태는 다음 중 하나여야 합니다: {', '.join(valid_statuses)}")
        
        # 수치 필드 검증
        for count_field in ['target_count', 'completed_count', 'discrepancy_count']:
            if count_field in data:
                if not isinstance(data[count_field], int) or data[count_field] < 0:
                    raise ValueError(f"{count_field}는 0 이상의 정수여야 합니다.")
    
    # ==================== 기존 인터페이스 호환성 메서드 ====================
    
    def _get_sample_inventories(self) -> List[Dict[str, Any]]:
        """하위 호환성을 위한 메서드 (더 이상 사용하지 않음)"""
        return self.data_source.get_all_inventories()
    
    def _get_sample_inventory_details(self) -> Dict[str, Dict[str, Any]]:
        """하위 호환성을 위한 메서드 (더 이상 사용하지 않음)"""
        return self.data_source._inventory_details
    
    def _get_sample_discrepancies(self) -> List[Dict[str, Any]]:
        """하위 호환성을 위한 메서드 (더 이상 사용하지 않음)"""
        return self.get_discrepancies()
    
    def get_all_inventories(self) -> List[Dict[str, Any]]:
        """모든 자산실사 목록 조회 (기존 인터페이스 호환)"""
        return self.data_source.get_all_inventories()
    
    def get_inventory_by_id(self, inventory_id: int) -> Optional[Dict[str, Any]]:
        """ID로 자산실사 조회 (기존 인터페이스 호환)"""
        return self.data_source.get_inventory_by_id(inventory_id)
    
    def get_inventory_details(self, inventory_id: str) -> Optional[Dict[str, Any]]:
        """자산실사 상세 결과 조회 (기존 인터페이스 호환)"""
        return self.data_source.get_inventory_details(inventory_id)
    
    def create_inventory(self, inventory_data: Dict[str, Any]) -> Dict[str, Any]:
        """새 자산실사 생성 (기존 인터페이스 호환)"""
        # BaseRepository의 create 메서드 활용
        return self.create(inventory_data)
    
    def update_inventory(self, inventory_id: int, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """자산실사 정보 수정 (기존 인터페이스 호환)"""
        # BaseRepository의 update 메서드 활용
        return self.update(inventory_id, update_data)
    
    def delete_inventory(self, inventory_id: int) -> bool:
        """자산실사 삭제 (기존 인터페이스 호환)"""
        # BaseRepository의 delete 메서드 활용
        return self.delete(inventory_id)
    
    # ==================== 비즈니스 로직 메서드 (inventory_data에서 이관) ====================
    
    def get_discrepancies(self, inventory_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        불일치 목록 조회 (inventory_data에서 이관)
        
        Args:
            inventory_id: 특정 실사의 불일치만 조회할 경우
            
        Returns:
            불일치 목록
        """
        all_discrepancies = self.data_source._discrepancies.copy()
        if inventory_id:
            return [d for d in all_discrepancies if d['inventory_id'] == inventory_id]
        return all_discrepancies
    
    def get_discrepancy_by_id(self, discrepancy_id: int) -> Optional[Dict[str, Any]]:
        """
        ID로 불일치 조회
        
        Args:
            discrepancy_id: 불일치 ID
            
        Returns:
            불일치 데이터 또는 None
        """
        return self.data_source.get_discrepancy_by_id(discrepancy_id)
    
    def add_discrepancy(self, discrepancy_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        새 불일치 추가
        
        Args:
            discrepancy_data: 불일치 데이터
            
        Returns:
            추가된 불일치 데이터
        """
        return self.data_source.add_discrepancy(discrepancy_data)
    
    def update_discrepancy(self, discrepancy_id: int, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        불일치 정보 업데이트
        
        Args:
            discrepancy_id: 불일치 ID
            update_data: 업데이트할 데이터
            
        Returns:
            업데이트된 불일치 데이터 또는 None
        """
        return self.data_source.update_discrepancy(discrepancy_id, update_data)
    
    def resolve_discrepancy(self, discrepancy_id: int) -> bool:
        """
        불일치 해결 처리 (inventory_data에서 이관)
        
        Args:
            discrepancy_id: 해결할 불일치 ID
            
        Returns:
            해결 성공 여부
        """
        for discrepancy in self.data_source._discrepancies:
            if discrepancy['id'] == discrepancy_id:
                discrepancy['status'] = 'resolved'
                discrepancy['resolved_date'] = datetime.now().strftime('%Y-%m-%d')
                return True
        return False
    
    def get_inventory_statistics(self) -> Dict[str, Any]:
        """
        자산실사 통계 정보 조회 (inventory_data에서 이관 및 개선)
        
        Returns:
            자산실사 통계 정보
        """
        inventories = self.get_all_inventories()
        total_inventories = len(inventories)
        
        # 상태별 통계
        status_stats = {}
        for inventory in inventories:
            status = inventory['status']
            status_stats[status] = status_stats.get(status, 0) + 1
        
        # 불일치 통계
        all_discrepancies = self.get_discrepancies()
        pending_discrepancies = len([d for d in all_discrepancies if d['status'] == 'pending'])
        resolved_discrepancies = len([d for d in all_discrepancies if d['status'] == 'resolved'])
        
        # 부서별 통계
        department_stats = {}
        for inventory in inventories:
            dept = inventory.get('department', '미분류')
            department_stats[dept] = department_stats.get(dept, 0) + 1
        
        completion_rate = 0
        if total_inventories > 0:
            completed = status_stats.get('completed', 0)
            completion_rate = round((completed / total_inventories * 100), 1)
        
        return {
            'total_inventories': total_inventories,
            'completed': status_stats.get('completed', 0),
            'in_progress': status_stats.get('in_progress', 0),
            'planned': status_stats.get('planned', 0),
            'cancelled': status_stats.get('cancelled', 0),
            'completion_rate': completion_rate,
            'status_stats': status_stats,
            'department_stats': department_stats,
            'total_discrepancies': len(all_discrepancies),
            'pending_discrepancies': pending_discrepancies,
            'resolved_discrepancies': resolved_discrepancies
        }
    
    # ==================== 검색 및 필터링 메서드 ====================
    
    def search_inventories(
        self,
        search_query: Optional[str] = None,
        status: Optional[str] = None,
        department: Optional[str] = None,
        manager: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        자산실사 검색 및 필터링
        
        Args:
            search_query: 검색어
            status: 상태 필터
            department: 부서 필터
            manager: 담당자 필터
            
        Returns:
            필터링된 자산실사 목록
        """
        inventories = self.get_all_inventories()
        
        # 검색어 필터링
        if search_query:
            search_lower = search_query.lower()
            inventories = [
                inv for inv in inventories
                if (search_lower in inv['name'].lower() or
                    search_lower in inv.get('description', '').lower() or
                    search_lower in inv.get('manager', '').lower())
            ]
        
        # 상태 필터링
        if status:
            inventories = [inv for inv in inventories if inv['status'] == status]
        
        # 부서 필터링
        if department:
            inventories = [inv for inv in inventories if inv.get('department') == department]
        
        # 담당자 필터링
        if manager:
            inventories = [inv for inv in inventories if inv.get('manager') == manager]
        
        return inventories
    
    def get_inventories_by_status(self, status: str) -> List[Dict[str, Any]]:
        """
        상태별 자산실사 목록 조회
        
        Args:
            status: 조회할 상태
            
        Returns:
            해당 상태의 자산실사 목록
        """
        return [inv for inv in self.get_all_inventories() if inv['status'] == status]
    
    def get_inventories_by_department(self, department: str) -> List[Dict[str, Any]]:
        """
        부서별 자산실사 목록 조회
        
        Args:
            department: 조회할 부서
            
        Returns:
            해당 부서의 자산실사 목록
        """
        return [inv for inv in self.get_all_inventories() if inv.get('department') == department]


# 싱글톤 인스턴스 생성 (애플리케이션 전역에서 사용)
inventory_repository = InventoryRepository() 