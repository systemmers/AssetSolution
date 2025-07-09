"""
InventoryCoreService - 자산실사 관리 Facade 서비스
각 도메인별 서비스를 연결하는 Facade 패턴 구현
"""
from typing import List, Dict, Optional, Any, Tuple
from datetime import datetime, date, timedelta
from .inventory import (
    InventoryCrudService, InventorySearchService, 
    InventoryDiscrepancyService, InventoryStatisticsService
)


class InventoryCoreService:
    """자산실사 관리 Facade 서비스 클래스"""

    def __init__(self):
        """도메인 서비스 초기화"""
        self.crud_service = InventoryCrudService()
        self.search_service = InventorySearchService()
        self.discrepancy_service = InventoryDiscrepancyService()
        self.statistics_service = InventoryStatisticsService()
    
    def get_inventory_list(self, status_filter: Optional[str] = None) -> Dict[str, Any]:
        """자산실사 목록 조회 (SearchService로 delegate)"""
        inventory_data = self.search_service.get_inventory_list(status_filter)
        stats = self.statistics_service.get_inventory_statistics()
        
        return {
            'inventories': inventory_data['inventories'],
            'stats': stats
        }
    
    def get_filtered_inventories(self, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """필터 조건에 따른 자산실사 목록 조회 (SearchService로 delegate)"""
        return self.search_service.get_filtered_inventories(filters)
    
    def get_paginated_inventories(self, inventories: List[Dict[str, Any]], page: int, per_page: int = 10) -> Tuple[List[Dict[str, Any]], Dict[str, int]]:
        """페이지네이션 처리된 자산실사 목록 반환 (SearchService로 delegate)"""
        return self.search_service.get_paginated_inventories(inventories, page, per_page)
    
    def get_inventory_detail(self, inventory_id: int) -> Dict[str, Any]:
        """자산실사 상세 정보 조회 (CrudService로 delegate)"""
        return self.crud_service.get_inventory_detail(inventory_id)
    
    def get_discrepancies_summary(self) -> Dict[str, Any]:
        """불일치 요약 정보 조회 (DiscrepancyService로 delegate)"""
        return self.discrepancy_service.get_discrepancies_summary()
    
    def resolve_discrepancy(self, discrepancy_id: int) -> bool:
        """불일치 해결 처리 (DiscrepancyService로 delegate)"""
        return self.discrepancy_service.resolve_discrepancy(discrepancy_id)
    
    def create_inventory(self, inventory_data: Dict[str, Any]) -> Dict[str, Any]:
        """새 자산실사 생성 (CrudService로 delegate)"""
        return self.crud_service.create_inventory(inventory_data)
    
    def update_inventory(self, inventory_id: int, inventory_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """자산실사 정보 업데이트 (CrudService로 delegate)"""
        return self.crud_service.update_inventory(inventory_id, inventory_data)
    
    def delete_inventory(self, inventory_id: int) -> bool:
        """자산실사 삭제 (CrudService로 delegate)"""
        return self.crud_service.delete_inventory(inventory_id)
    
    def get_form_data(self) -> Dict[str, Any]:
        """자산실사 등록/수정 폼에 필요한 데이터 조회 (CrudService로 delegate)"""
        return self.crud_service.get_form_data()
    
    def get_inventory_statistics(self) -> Dict[str, Any]:
        """자산실사 통계 정보 반환 (StatisticsService로 delegate)"""
        return self.statistics_service.get_inventory_statistics()
    
    def get_pending_inventories(self) -> List[Dict[str, Any]]:
        """진행 중인 자산실사 목록 조회 (StatisticsService로 delegate)"""
        return self.statistics_service.get_pending_inventories()



# 싱글톤 인스턴스 생성
inventory_core_service = InventoryCoreService()
