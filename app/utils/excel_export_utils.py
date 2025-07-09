"""
Excel 내보내기 공통 유틸리티
4개 서비스에서 중복되는 Excel 내보내기 기능을 통합한 유틸리티 클래스
"""
import io
import xlsxwriter
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple, Callable


class ExcelExportUtils:
    """Excel 내보내기 공통 유틸리티 클래스"""
    
    @staticmethod
    def create_excel_file(
        data: List[Dict[str, Any]],
        headers: List[str],
        sheet_name: str,
        filename_prefix: str,
        row_data_processor: Callable[[Dict[str, Any]], List[Any]],
        column_widths: Optional[List[int]] = None,
        include_table: bool = True,
        custom_formats: Optional[Dict[str, Any]] = None
    ) -> Tuple[io.BytesIO, str]:
        """
        Excel 파일 생성 공통 메서드
        
        Args:
            data: 내보낼 데이터 리스트
            headers: 컬럼 헤더 리스트
            sheet_name: 워크시트 이름
            filename_prefix: 파일명 접두사 (예: 'assets', 'operations')
            row_data_processor: 행 데이터 변환 함수
            column_widths: 컬럼 너비 리스트 (선택사항)
            include_table: 테이블 생성 여부
            custom_formats: 사용자 정의 포맷 (선택사항)
            
        Returns:
            Tuple[io.BytesIO, str]: (Excel 데이터 스트림, 파일명)
        """
        # 메모리에 Excel 파일 생성
        output = io.BytesIO()
        workbook = xlsxwriter.Workbook(output)
        worksheet = workbook.add_worksheet(sheet_name)
        
        # 스타일 정의
        formats = ExcelExportUtils._create_standard_formats(workbook, custom_formats)
        
        # 헤더 작성
        ExcelExportUtils._write_headers(worksheet, headers, formats['header'])
        
        # 컬럼 너비 설정
        if column_widths:
            ExcelExportUtils._set_column_widths(worksheet, column_widths)
        else:
            ExcelExportUtils._auto_set_column_widths(worksheet, headers)
        
        # 데이터 작성
        for row_idx, item in enumerate(data, 1):
            row_data = row_data_processor(item)
            ExcelExportUtils._write_data_row(worksheet, row_idx, row_data, formats)
        
        # 테이블 생성
        if include_table and data:
            worksheet.add_table(0, 0, len(data), len(headers) - 1, {
                'name': f'{filename_prefix}_table',
                'style': 'Table Style Medium 2',
                'autofilter': True
            })
        
        # 워크북 닫기
        workbook.close()
        
        # 파일 포인터를 처음으로 되돌림
        output.seek(0)
        
        # 날짜가 포함된 파일명 생성
        today = datetime.now().strftime('%Y%m%d')
        filename = f"{filename_prefix}_export_{today}.xlsx"
        
        return output, filename
    
    @staticmethod
    def create_multi_sheet_excel(
        sheets_data: List[Dict[str, Any]],
        filename_prefix: str,
        include_charts: bool = False
    ) -> Tuple[io.BytesIO, str]:
        """
        다중 시트 Excel 파일 생성
        
        Args:
            sheets_data: 시트별 데이터 리스트
                [
                    {
                        'name': '시트명',
                        'data': 데이터,
                        'headers': 헤더,
                        'row_processor': 행 처리 함수,
                        'column_widths': 컬럼 너비 (선택)
                    }
                ]
            filename_prefix: 파일명 접두사
            include_charts: 차트 포함 여부
            
        Returns:
            Tuple[io.BytesIO, str]: (Excel 데이터 스트림, 파일명)
        """
        output = io.BytesIO()
        workbook = xlsxwriter.Workbook(output)
        
        # 각 시트 생성
        for sheet_info in sheets_data:
            worksheet = workbook.add_worksheet(sheet_info['name'])
            formats = ExcelExportUtils._create_standard_formats(workbook)
            
            # 헤더 작성
            headers = sheet_info['headers']
            ExcelExportUtils._write_headers(worksheet, headers, formats['header'])
            
            # 컬럼 너비 설정
            if 'column_widths' in sheet_info:
                ExcelExportUtils._set_column_widths(worksheet, sheet_info['column_widths'])
            else:
                ExcelExportUtils._auto_set_column_widths(worksheet, headers)
            
            # 데이터 작성
            data = sheet_info['data']
            row_processor = sheet_info['row_processor']
            
            for row_idx, item in enumerate(data, 1):
                row_data = row_processor(item)
                ExcelExportUtils._write_data_row(worksheet, row_idx, row_data, formats)
            
            # 테이블 생성
            if data:
                worksheet.add_table(0, 0, len(data), len(headers) - 1, {
                    'name': f'{sheet_info["name"]}_table',
                    'style': 'Table Style Medium 2',
                    'autofilter': True
                })
        
        workbook.close()
        output.seek(0)
        
        # 파일명 생성
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{filename_prefix}_export_{timestamp}.xlsx"
        
        return output, filename
    
    @staticmethod
    def _create_standard_formats(
        workbook: xlsxwriter.Workbook, 
        custom_formats: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        표준 Excel 포맷 생성
        
        Args:
            workbook: xlsxwriter 워크북 객체
            custom_formats: 사용자 정의 포맷
            
        Returns:
            Dict[str, Any]: 포맷 딕셔너리
        """
        formats = {
            'header': workbook.add_format({
                'bold': True,
                'bg_color': '#F0F0F0',
                'border': 1,
                'align': 'center',
                'valign': 'vcenter'
            }),
            'cell': workbook.add_format({
                'border': 1
            }),
            'date': workbook.add_format({
                'border': 1,
                'num_format': 'yyyy-mm-dd'
            }),
            'datetime': workbook.add_format({
                'border': 1,
                'num_format': 'yyyy-mm-dd hh:mm'
            }),
            'number': workbook.add_format({
                'border': 1,
                'num_format': '#,##0'
            }),
            'currency': workbook.add_format({
                'border': 1,
                'num_format': '#,##0"원"'
            }),
            'percentage': workbook.add_format({
                'border': 1,
                'num_format': '0"%"'
            }),
            'title': workbook.add_format({
                'bold': True,
                'font_size': 16,
                'align': 'center'
            }),
            'subtitle': workbook.add_format({
                'bold': True,
                'font_size': 12,
                'bg_color': '#E0E0E0'
            }),
            'label': workbook.add_format({
                'bold': True,
                'border': 1
            })
        }
        
        # 사용자 정의 포맷 추가
        if custom_formats:
            for key, format_dict in custom_formats.items():
                formats[key] = workbook.add_format(format_dict)
        
        return formats
    
    @staticmethod
    def _write_headers(
        worksheet: xlsxwriter.worksheet.Worksheet, 
        headers: List[str], 
        header_format: xlsxwriter.format.Format
    ) -> None:
        """
        Excel 헤더 작성
        
        Args:
            worksheet: xlsxwriter 워크시트 객체
            headers: 헤더 리스트
            header_format: 헤더 포맷
        """
        for col_idx, header in enumerate(headers):
            worksheet.write(0, col_idx, header, header_format)
    
    @staticmethod
    def _set_column_widths(
        worksheet: xlsxwriter.worksheet.Worksheet, 
        widths: List[int]
    ) -> None:
        """
        Excel 컬럼 너비 설정
        
        Args:
            worksheet: xlsxwriter 워크시트 객체
            widths: 너비 리스트
        """
        for col_idx, width in enumerate(widths):
            worksheet.set_column(col_idx, col_idx, width)
    
    @staticmethod
    def _auto_set_column_widths(
        worksheet: xlsxwriter.worksheet.Worksheet, 
        headers: List[str]
    ) -> None:
        """
        헤더 길이 기반 자동 컬럼 너비 설정
        
        Args:
            worksheet: xlsxwriter 워크시트 객체
            headers: 헤더 리스트
        """
        for col_idx, header in enumerate(headers):
            # 헤더 길이 + 여유분으로 너비 설정
            width = max(len(header) + 2, 10)  # 최소 10, 최대 헤더길이+2
            worksheet.set_column(col_idx, col_idx, width)
    
    @staticmethod
    def _write_data_row(
        worksheet: xlsxwriter.worksheet.Worksheet,
        row_idx: int,
        row_data: List[Any],
        formats: Dict[str, Any]
    ) -> None:
        """
        데이터 행 작성
        
        Args:
            worksheet: xlsxwriter 워크시트 객체
            row_idx: 행 인덱스
            row_data: 행 데이터
            formats: 포맷 딕셔너리
        """
        for col_idx, value in enumerate(row_data):
            # 값의 타입에 따라 적절한 포맷 적용
            if isinstance(value, datetime):
                worksheet.write_datetime(row_idx, col_idx, value, formats['datetime'])
            elif isinstance(value, (int, float)) and col_idx in []:  # 숫자 컬럼 인덱스는 호출자가 지정
                worksheet.write_number(row_idx, col_idx, value, formats['number'])
            else:
                worksheet.write(row_idx, col_idx, value, formats['cell'])
    
    @staticmethod
    def format_currency(value: Any) -> str:
        """통화 형식 포맷팅"""
        if isinstance(value, (int, float)):
            return f"{value:,}원"
        return str(value) if value else "-"
    
    @staticmethod
    def format_percentage(value: Any) -> str:
        """퍼센트 형식 포맷팅"""
        if isinstance(value, (int, float)):
            return f"{value}%"
        return str(value) if value else "-"
    
    @staticmethod
    def format_date(value: Any, format_str: str = '%Y-%m-%d') -> str:
        """날짜 형식 포맷팅"""
        if isinstance(value, datetime):
            return value.strftime(format_str)
        elif hasattr(value, 'strftime'):
            return value.strftime(format_str)
        return str(value) if value else "-"


class ExcelRowProcessor:
    """Excel 행 데이터 처리를 위한 헬퍼 클래스"""
    
    @staticmethod
    def create_asset_row_processor():
        """자산 데이터 행 처리기 생성"""
        def process_row(asset: Dict[str, Any]) -> List[Any]:
            return [
                asset.get('asset_number', ''),
                asset.get('name', ''),
                asset.get('type', {}).get('name', '하드웨어'),
                asset.get('category_name', ''),
                asset.get('status_name', ''),
                asset.get('department', {}).get('name', '-'),
                asset.get('location_name', '-'),
                asset.get('user_name', '-'),
                asset.get('purchase_date', '-'),
                asset.get('purchase_price', 0),
                asset.get('serial_number', '-'),
                asset.get('manufacturer', '-'),
                asset.get('model', '-'),
                asset.get('warranty_expiry', '-'),
                asset.get('current_value', 0)
            ]
        return process_row
    
    @staticmethod
    def create_operations_row_processor():
        """운영 데이터 행 처리기 생성"""
        def process_row(operation: Dict[str, Any]) -> List[Any]:
            return [
                operation.get('id', ''),
                operation.get('operation_type', ''),
                operation.get('title', ''),
                operation.get('description', '')[:100] + '...' if len(operation.get('description', '')) > 100 else operation.get('description', ''),
                operation.get('status', ''),
                operation.get('start_date', '-'),
                operation.get('end_date', '-'),
                f"{operation.get('progress', 0)}%",
                operation.get('assignee_name', '-'),
                operation.get('department', {}).get('name', '-'),
                operation.get('priority', 'medium'),
                operation.get('budget', 0),
                operation.get('actual_cost', 0),
                operation.get('created_at', '-'),
                operation.get('updated_at', '-')
            ]
        return process_row
    
    @staticmethod
    def create_contract_row_processor():
        """계약 데이터 행 처리기 생성"""
        def process_row(contract: Dict[str, Any]) -> List[Any]:
            return [
                contract.get('contract_no', '-'),
                contract.get('name', '-'),
                contract.get('vendor', '-'),
                contract.get('type_name', '-'),
                contract.get('status_name', '-'),
                contract.get('start_date', '-'),
                contract.get('end_date', '-'),
                contract.get('amount', 0),
                contract.get('monthly_cost', 0),
                contract.get('department', '-'),
                contract.get('manager', '-'),
                contract.get('payment_term', '-'),
                contract.get('progress_percent', 0),
                contract.get('remaining_days', 0)
            ]
        return process_row
    
    @staticmethod
    def create_inventory_row_processor():
        """재고 데이터 행 처리기 생성"""
        def process_row(inventory: Dict[str, Any]) -> List[Any]:
            return [
                inventory.get('id', ''),
                inventory.get('name', ''),
                inventory.get('status', ''),
                inventory.get('created_at', '-'),
                inventory.get('updated_at', '-')
            ]
        return process_row