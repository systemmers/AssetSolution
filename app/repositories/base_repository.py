"""
BaseRepository 추상 클래스
모든 Repository에서 공통으로 사용되는 기본 인터페이스를 제공

Classes:
    - BaseRepository: Repository 패턴의 기본 구현을 제공하는 추상 클래스
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Optional, Any, Tuple
from datetime import datetime


class BaseRepository(ABC):
    """
    Repository 패턴의 기본 구현을 제공하는 추상 클래스
    
    모든 구체적인 Repository 클래스는 이 클래스를 상속받아야 합니다.
    공통적인 CRUD 작업과 통계 조회 기능을 정의합니다.
    """
    
    def __init__(self):
        """Base Repository 초기화"""
        self._data: List[Dict[str, Any]] = []
        self._next_id = 1
    
    # ==================== 추상 메서드 (하위 클래스에서 구현 필수) ====================
    
    @abstractmethod
    def _load_sample_data(self) -> List[Dict[str, Any]]:
        """
        샘플 데이터를 로드하는 추상 메서드
        하위 클래스에서 구체적인 샘플 데이터를 반환해야 합니다.
        
        Returns:
            샘플 데이터 리스트
        """
        pass
    
    @abstractmethod
    def _validate_data(self, data: Dict[str, Any], is_update: bool = False) -> None:
        """
        데이터 유효성 검증 추상 메서드
        하위 클래스에서 구체적인 검증 로직을 구현해야 합니다.
        
        Args:
            data: 검증할 데이터
            is_update: 업데이트 작업 여부
            
        Raises:
            ValueError: 유효하지 않은 데이터인 경우
        """
        pass
    
    # ==================== 기본 CRUD 메서드 ====================
    
    def get_all(self) -> List[Dict[str, Any]]:
        """
        모든 항목 조회
        
        Returns:
            전체 데이터 리스트
        """
        return self._data.copy()
    
    def get_by_id(self, item_id: int) -> Optional[Dict[str, Any]]:
        """
        ID로 특정 항목을 조회
        
        Args:
            item_id: 조회할 항목의 ID
            
        Returns:
            해당 항목 또는 None
        """
        return next((item for item in self._data if item['id'] == item_id), None)
    
    def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        새 항목 생성
        
        Args:
            data: 생성할 데이터
            
        Returns:
            생성된 항목
            
        Raises:
            ValueError: 유효하지 않은 데이터인 경우
        """
        # 데이터 유효성 검증
        self._validate_data(data, is_update=False)
        
        # 새 ID 할당
        data['id'] = self._get_next_id()
        
        # 생성 일시 추가
        data['created_at'] = datetime.now().isoformat()
        data['updated_at'] = datetime.now().isoformat()
        
        # 데이터 추가
        self._data.append(data)
        
        return data.copy()
    
    def update(self, item_id: int, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        기존 항목 수정
        
        Args:
            item_id: 수정할 항목의 ID
            data: 수정할 데이터
            
        Returns:
            수정된 항목 또는 None
            
        Raises:
            ValueError: 유효하지 않은 데이터인 경우
        """
        # 기존 항목 찾기
        for i, item in enumerate(self._data):
            if item['id'] == item_id:
                # 데이터 유효성 검증
                self._validate_data(data, is_update=True)
                
                # 기존 데이터 업데이트
                updated_item = item.copy()
                updated_item.update(data)
                updated_item['updated_at'] = datetime.now().isoformat()
                
                self._data[i] = updated_item
                return updated_item.copy()
        
        return None
    
    def delete(self, item_id: int) -> bool:
        """
        항목 삭제
        
        Args:
            item_id: 삭제할 항목의 ID
            
        Returns:
            삭제 성공 여부
        """
        for i, item in enumerate(self._data):
            if item['id'] == item_id:
                del self._data[i]
                return True
        return False
    
    def get_statistics(self) -> Dict[str, Any]:
        """
        통계 정보 조회 (기본 구현)
        
        Returns:
            통계 정보 딕셔너리
        """
        return {
            'total_count': len(self._data),
            'created_today': self._count_created_today(),
            'last_updated': self._get_last_updated()
        }
    
    # ==================== 고급 조회 메서드 ====================
    
    def search(self, keyword: str, search_fields: List[str]) -> List[Dict[str, Any]]:
        """
        키워드로 검색
        
        Args:
            keyword: 검색 키워드
            search_fields: 검색할 필드 리스트
            
        Returns:
            검색 결과 리스트
        """
        if not keyword:
            return self._data.copy()
        
        keyword_lower = keyword.lower()
        results = []
        
        for item in self._data:
            for field in search_fields:
                if field in item and item[field]:
                    if keyword_lower in str(item[field]).lower():
                        results.append(item)
                        break
        
        return results
    
    def filter_by(self, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        조건으로 필터링
        
        Args:
            filters: 필터 조건 딕셔너리
            
        Returns:
            필터링된 결과 리스트
        """
        filtered_data = self._data.copy()
        
        for field, value in filters.items():
            if value is not None and value != '':
                filtered_data = [
                    item for item in filtered_data 
                    if field in item and item[field] == value
                ]
        
        return filtered_data
    
    def paginate(
        self, 
        data: List[Dict[str, Any]], 
        page: int = 1, 
        per_page: int = 10
    ) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """
        페이지네이션 처리
        
        Args:
            data: 페이지네이션할 데이터
            page: 페이지 번호
            per_page: 페이지당 항목 수
            
        Returns:
            (페이지 데이터, 페이지네이션 정보)
        """
        total_items = len(data)
        total_pages = (total_items + per_page - 1) // per_page if total_items > 0 else 1
        
        # 페이지 번호 유효성 검사
        if page < 1:
            page = 1
        if page > total_pages and total_pages > 0:
            page = total_pages
        
        # 페이지에 해당하는 항목 선택
        start_idx = (page - 1) * per_page
        end_idx = min(start_idx + per_page, total_items)
        current_page_items = data[start_idx:end_idx] if data else []
        
        pagination_info = {
            'page': page,
            'total_pages': total_pages,
            'total_items': total_items,
            'per_page': per_page,
            'start_idx': start_idx + 1 if current_page_items else 0,
            'end_idx': start_idx + len(current_page_items) if current_page_items else 0,
            'has_prev': page > 1,
            'has_next': page < total_pages
        }
        
        return current_page_items, pagination_info
    
    # ==================== 유틸리티 메서드 ====================
    
    def _get_next_id(self) -> int:
        """
        다음 ID 생성
        
        Returns:
            새로운 ID
        """
        if self._data:
            max_id = max(item['id'] for item in self._data)
            return max_id + 1
        return 1
    
    def count(self) -> int:
        """
        총 항목 수 반환
        
        Returns:
            총 항목 수
        """
        return len(self._data)
    
    def exists(self, item_id: int) -> bool:
        """
        항목 존재 여부 확인
        
        Args:
            item_id: 확인할 항목의 ID
            
        Returns:
            존재 여부
        """
        return any(item['id'] == item_id for item in self._data)
    
    def get_latest(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        최신 항목들 조회
        
        Args:
            limit: 조회할 항목 수
            
        Returns:
            최신 항목 리스트
        """
        sorted_data = sorted(
            self._data, 
            key=lambda x: x.get('created_at', ''), 
            reverse=True
        )
        return sorted_data[:limit]
    
    def _count_created_today(self) -> int:
        """
        오늘 생성된 항목 수 계산
        
        Returns:
            오늘 생성된 항목 수
        """
        today = datetime.now().date()
        count = 0
        
        for item in self._data:
            if 'created_at' in item:
                try:
                    created_date = datetime.fromisoformat(item['created_at']).date()
                    if created_date == today:
                        count += 1
                except (ValueError, TypeError):
                    continue
        
        return count
    
    def _get_last_updated(self) -> Optional[str]:
        """
        마지막 업데이트 시간 조회
        
        Returns:
            마지막 업데이트 시간 또는 None
        """
        if not self._data:
            return None
        
        latest_item = max(
            self._data,
            key=lambda x: x.get('updated_at', ''),
            default=None
        )
        
        return latest_item.get('updated_at') if latest_item else None 