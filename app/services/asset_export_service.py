"""
Asset Export Service

자산 데이터를 CSV 및 Excel 형식으로 내보내기 위한 서비스 모듈
중복된 내보내기 로직을 통합하여 단일 책임 원칙 적용

Classes:
    AssetExportService: 자산 데이터 내보내기 처리
"""

import io
import csv
import xlsxwriter
from datetime import datetime
from typing import List, Dict, Any, Tuple

# 전역 상수 import
from ..utils.constants import (
    ASSET_CATEGORIES, ASSET_STATUS, EXPORT_HEADERS,
    format_date_string, format_number_with_commas, get_filename_timestamp
)


class AssetExportService:
    """
    자산 데이터 내보내기를 위한 서비스 클래스
    CSV 및 Excel 형식 지원, 공통 로직 통합
    """
    
    def __init__(self):
        """AssetExportService 초기화"""
        pass
    
    def export_to_csv(self, assets: List[Dict[str, Any]]) -> Tuple[io.StringIO, str]:
        """
        자산 데이터를 CSV 형식으로 내보내기
        
        Args:
            assets: 내보낼 자산 데이터 리스트
            
        Returns:
            Tuple[io.StringIO, str]: (CSV 데이터 스트림, 파일명)
        """
        # 메모리에 CSV 파일 생성
        output = io.StringIO()
        writer = csv.writer(output)
        
        # 헤더 작성
        writer.writerow(EXPORT_HEADERS)
        
        # 데이터 작성
        for asset in assets:
            row_data = self._prepare_row_data(asset, format_for_csv=True)
            writer.writerow(row_data)
        
        # 파일 포인터를 처음으로 되돌림
        output.seek(0)
        
        return output, "assets_export.csv"
    
    def export_to_excel(self, assets: List[Dict[str, Any]]) -> Tuple[io.BytesIO, str]:
        """
        자산 데이터를 Excel 형식으로 내보내기
        
        Args:
            assets: 내보낼 자산 데이터 리스트
            
        Returns:
            Tuple[io.BytesIO, str]: (Excel 데이터 스트림, 파일명)
        """
        from ..utils.excel_export_utils import ExcelExportUtils, ExcelRowProcessor
        
        # 공통 유틸리티를 사용하여 Excel 파일 생성
        return ExcelExportUtils.create_excel_file(
            data=assets,
            headers=EXPORT_HEADERS,
            sheet_name='자산 목록',
            filename_prefix='assets',
            row_data_processor=ExcelRowProcessor.create_asset_row_processor(),
            column_widths=[15, 25, 12, 12, 12, 15, 15, 15, 12, 15, 20, 15, 15, 12, 15]
        )
    
    def _prepare_row_data(self, asset: Dict[str, Any], format_for_csv: bool = False) -> List[str]:
        """
        자산 데이터를 행 데이터로 변환
        
        Args:
            asset: 자산 데이터
            format_for_csv: CSV 형식용 포맷팅 여부
            
        Returns:
            List[str]: 행 데이터 리스트
        """
        # 카테고리명 변환 (전역 상수 사용)
        category_name = ASSET_CATEGORIES.get(asset['category_id'], '기타')
        
        # 상태명 변환 (전역 상수 사용)
        status_name = ASSET_STATUS.get(asset['status'], '기타')
        
        # 부서명 및 사용자명
        department_name = asset.get('department', {}).get('name', '-')
        user_name = asset.get('user_name', '-')
        
        # 날짜 형식 처리
        purchase_date = '-'
        if asset.get('purchase_date'):
            if format_for_csv:
                purchase_date = asset['purchase_date'].strftime('%Y-%m-%d')
            else:
                purchase_date = asset['purchase_date']
        
        # 가격 형식 처리
        purchase_price = asset.get('purchase_price', 0)
        current_value = asset.get('current_value', 0)
        
        if format_for_csv:
            purchase_price = format(purchase_price, ',')
            current_value = format(current_value, ',')
        
        return [
            asset['asset_number'],
            asset['name'],
            asset.get('type', {}).get('name', '하드웨어'),
            category_name,
            status_name,
            department_name,
            asset.get('location_name', '-'),
            user_name,
            purchase_date,
            purchase_price,
            asset.get('serial_number', '-'),
            asset.get('manufacturer', '-'),
            asset.get('model', '-'),
            asset.get('warranty_expiry', '-'),
            current_value
        ]
    
    # Excel 관련 중복 메서드들은 ExcelExportUtils로 통합되어 제거됨
