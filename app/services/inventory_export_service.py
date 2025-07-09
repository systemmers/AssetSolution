"""
자산실사 내보내기 서비스 (Export Service Pattern)
"""
import io
from datetime import datetime
from typing import List, Dict, Optional, Any, Tuple
from ..repositories.inventory.inventory_repository import InventoryRepository

class InventoryExportService:
    """자산실사 내보내기 서비스"""
    
    def __init__(self):
        self.repository = InventoryRepository()
    
    def export_to_csv(self, inventory_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """CSV 내보내기"""
        try:
            inventories = self.repository.get_all_inventories()
            if inventory_id:
                inventories = [inv for inv in inventories if inv['id'] == inventory_id]
            return inventories
        except Exception as e:
            raise Exception(f"CSV 내보내기 실패: {str(e)}")
    
    def export_to_excel(self, inventory_id: Optional[int] = None) -> Tuple[io.BytesIO, str]:
        """Excel 내보내기"""
        try:
            from ..utils.excel_export_utils import ExcelExportUtils, ExcelRowProcessor
            
            # 데이터 조회
            inventories = self.repository.get_all_inventories()
            if inventory_id:
                inventories = [inv for inv in inventories if inv['id'] == inventory_id]
            
            # 공통 유틸리티를 사용하여 Excel 파일 생성
            return ExcelExportUtils.create_excel_file(
                data=inventories,
                headers=['ID', '이름', '상태', '생성일', '수정일'],
                sheet_name='재고 목록',
                filename_prefix='inventory',
                row_data_processor=ExcelRowProcessor.create_inventory_row_processor()
            )
        except Exception as e:
            raise Exception(f"Excel 내보내기 실패: {str(e)}")
    
    def export_discrepancies_to_csv(self, inventory_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """불일치 CSV 내보내기"""
        try:
            discrepancies = self.repository.get_discrepancies(inventory_id)
            return discrepancies
        except Exception as e:
            raise Exception(f"불일치 CSV 내보내기 실패: {str(e)}")

# 전역 Service 인스턴스
inventory_export_service = InventoryExportService() 
