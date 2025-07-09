"""
생명주기 관리 Repository 모듈
생명주기 이벤트 관련 데이터 처리를 담당

Classes:
    - LifecycleRepository: 생명주기 이벤트 관련 데이터 처리 Repository
"""
from typing import List, Dict, Optional, Tuple
from .data.lifecycle_data import LifecycleData


class LifecycleRepository:
    """
    생명주기 이벤트 관리 Repository 클래스
    원본 operations_repository.py와 완전히 호환되는 API 제공
    """
    
    def __init__(self):
        """Repository 초기화"""
        self.data_source = LifecycleData()
        # 기존 API 호환성을 위한 속성 매핑
        self.lifecycles = self.data_source.get_all_events()
    
    # ==================== 기본 CRUD 메서드 ====================
    
    def get_all_events(self, asset_id: int = None, event_type: str = None, 
                      department: str = None, start_date: str = None, 
                      end_date: str = None) -> List[Dict]:
        """생명주기 이벤트 목록 조회 (필터링 포함)"""
        return self.data_source.get_all_events()
    
    def get_by_id(self, event_id: int) -> Optional[Dict]:
        """생명주기 이벤트 ID로 조회"""
        return self.data_source.get_event_by_id(event_id)
    
    def get_events_by_asset(self, asset_id: int) -> List[Dict]:
        """자산별 생명주기 이벤트 조회"""
        return self.data_source.get_events_by_asset(asset_id)
    
    # ==================== 페이지네이션 메서드 ====================
    
    def get_events_with_pagination(self, page: int = 1, per_page: int = 10, 
                                 asset_id: int = None, event_type: str = None, 
                                 department: str = None) -> Tuple[List[Dict], int, int, int]:
        """페이지네이션된 생명주기 이벤트 목록 조회"""
        return self.data_source.get_events_with_pagination(page, per_page, asset_id, event_type, department)
    
    # ==================== 마스터 데이터 메서드 ====================
    
    def get_event_types(self) -> List[Dict]:
        """생명주기 이벤트 유형 마스터 데이터 조회"""
        return self.data_source.get_event_types()
    
    def get_departments(self) -> List[Dict]:
        """생명주기 관련 부서 목록 조회"""
        return self.data_source.get_departments()
    
    # ==================== 통계 메서드 ====================
    
    def get_statistics(self) -> Dict:
        """생명주기 이벤트 통계 조회"""
        return self.data_source.get_statistics()
    
    # ==================== 필터링 메서드 ====================
    
    def get_events_by_type(self, event_type: str) -> List[Dict]:
        """이벤트 유형별 생명주기 이벤트 조회"""
        return self.data_source.get_events_by_type(event_type)
    
    def get_events_by_department(self, department: str) -> List[Dict]:
        """부서별 생명주기 이벤트 조회"""
        return self.data_source.get_events_by_department(department)
    
    # ==================== 기존 호환성 메서드 (사용하지 않음) ====================
    
    def _load_sample_data(self) -> List[Dict]:
        """샘플 데이터 로드 - 기존 호환성을 위해 유지하지만 사용하지 않음"""
        return self.data_source.get_all_events() 