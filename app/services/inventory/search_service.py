"""
InventorySearchService - 자산실사 검색 서비스
자산실사의 검색, 필터링, 페이지네이션 등 조회 관련 작업을 담당
"""
from typing import List, Dict, Optional, Any, Tuple
from ...repositories.inventory.inventory_repository import inventory_repository
from ...utils.constants import DEFAULT_PAGE_SIZE


class InventorySearchService:
    """자산실사 검색 및 필터링을 담당하는 서비스 클래스"""
    
    def __init__(self):
        """서비스 초기화"""
        self.repository = inventory_repository
    
    def get_inventory_list(self, status_filter: Optional[str] = None) -> Dict[str, Any]:
        """자산실사 목록 조회 (라우트에서 호출하는 메인 메서드)"""
        try:
            # Repository에서 모든 자산실사 데이터 조회
            inventories = self.repository.get_all_inventories()
            
            # 상태 필터 적용
            if status_filter:
                inventories = [inv for inv in inventories if inv.get('status') == status_filter]
            
            return {
                'inventories': inventories
            }
        except Exception as e:
            raise Exception(f"자산실사 목록 조회 중 오류 발생: {str(e)}")
    
    def get_filtered_inventories(self, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """필터 조건에 따른 자산실사 목록 조회"""
        inventories = self.repository.get_all_inventories()
        
        for key, value in filters.items():
            if not value:
                continue
                
            if key == 'status':
                inventories = [inv for inv in inventories if inv.get('status') == value]
            elif key == 'type':
                inventories = [inv for inv in inventories if inv.get('type') == value]
            elif key == 'department':
                inventories = [inv for inv in inventories if inv.get('department') == value]
        
        return inventories
    
    def get_paginated_inventories(self, inventories: List[Dict[str, Any]], page: int, per_page: int = None) -> Tuple[List[Dict[str, Any]], Dict[str, int]]:
        """페이지네이션 처리된 자산실사 목록 반환"""
        if per_page is None:
            per_page = DEFAULT_PAGE_SIZE
            
        total_items = len(inventories)
        total_pages = (total_items + per_page - 1) // per_page if total_items > 0 else 1

        if page < 1:
            page = 1
        if page > total_pages and total_pages > 0:
            page = total_pages

        start_idx = (page - 1) * per_page
        end_idx = min(start_idx + per_page, total_items)
        page_items = inventories[start_idx:end_idx] if inventories else []

        pagination_info = {
            'page': page,
            'total_pages': total_pages,
            'total_items': total_items,
            'per_page': per_page,
            'start_idx': start_idx + 1 if page_items else 0,
            'end_idx': start_idx + len(page_items) if page_items else 0
        }

        return page_items, pagination_info
    
    def search_inventories(self, query: str, search_fields: List[str] = None) -> List[Dict[str, Any]]:
        """키워드 검색을 통한 자산실사 조회"""
        if search_fields is None:
            search_fields = ['name', 'description', 'department']
        
        inventories = self.repository.get_all_inventories()
        
        if not query:
            return inventories
        
        query_lower = query.lower()
        filtered_inventories = []
        
        for inventory in inventories:
            for field in search_fields:
                field_value = str(inventory.get(field, '')).lower()
                if query_lower in field_value:
                    filtered_inventories.append(inventory)
                    break
        
        return filtered_inventories
    
    def sort_inventories(self, inventories: List[Dict[str, Any]], sort_by: str, sort_order: str = 'asc') -> List[Dict[str, Any]]:
        """자산실사 목록 정렬"""
        reverse_order = sort_order.lower() == 'desc'
        
        if sort_by == 'name':
            inventories.sort(key=lambda x: x.get('name', ''), reverse=reverse_order)
        elif sort_by == 'start_date':
            inventories.sort(key=lambda x: x.get('start_date', ''), reverse=reverse_order)
        elif sort_by == 'end_date':
            inventories.sort(key=lambda x: x.get('end_date', ''), reverse=reverse_order)
        elif sort_by == 'status':
            inventories.sort(key=lambda x: x.get('status', ''), reverse=reverse_order)
        elif sort_by == 'department':
            inventories.sort(key=lambda x: x.get('department', ''), reverse=reverse_order)
        else:  # 기본: ID 순
            inventories.sort(key=lambda x: x.get('id', 0), reverse=reverse_order)
        
        return inventories
    
    def get_inventory_filters(self) -> Dict[str, List[Dict[str, str]]]:
        """자산실사 필터링 옵션 조회"""
        inventories = self.repository.get_all_inventories()
        
        # 상태 목록 추출
        statuses = list(set([inv.get('status') for inv in inventories if inv.get('status')]))
        status_options = [{'value': status, 'name': status.replace('_', ' ').title()} for status in statuses]
        
        # 부서 목록 추출
        departments = list(set([inv.get('department') for inv in inventories if inv.get('department')]))
        department_options = [{'value': dept, 'name': dept} for dept in departments]
        
        # 유형 목록 추출
        types = list(set([inv.get('type') for inv in inventories if inv.get('type')]))
        type_options = [{'value': inv_type, 'name': inv_type.replace('_', ' ').title()} for inv_type in types]
        
        return {
            'statuses': status_options,
            'departments': department_options,
            'types': type_options
        }


# 싱글톤 인스턴스 생성
inventory_search_service = InventorySearchService() 