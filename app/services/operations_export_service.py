"""
Operations Export Service

운영 데이터를 CSV 및 Excel 형식으로 내보내기 위한 서비스 모듈
중복된 내보내기 로직을 통합하여 단일 책임 원칙 적용

Classes:
    OperationsExportService: 운영 데이터 내보내기 처리
"""

import io
import csv
import xlsxwriter
from datetime import datetime
from typing import List, Dict, Any, Tuple

# 전역 상수 import
from ..utils.constants import (
    OPERATION_TYPES, OPERATION_STATUS, 
    format_date_string, format_number_with_commas, get_filename_timestamp
)


class OperationsExportService:
    """
    운영 데이터 내보내기를 위한 서비스 클래스
    CSV 및 Excel 형식 지원, 공통 로직 통합
    """
    
    def __init__(self):
        """OperationsExportService 초기화"""
        self.export_headers = [
            "운영ID", "운영유형", "제목", "설명", "상태", 
            "시작일", "종료일", "진행률", "담당자", "부서",
            "우선순위", "예산", "실제비용", "생성일", "수정일"
        ]
    
    def export_to_csv(self, operations: List[Dict[str, Any]]) -> Tuple[io.StringIO, str]:
        """
        운영 데이터를 CSV 형식으로 내보내기
        
        Args:
            operations: 내보낼 운영 데이터 리스트
            
        Returns:
            Tuple[io.StringIO, str]: (CSV 데이터 스트림, 파일명)
        """
        # 메모리에 CSV 파일 생성
        output = io.StringIO()
        writer = csv.writer(output)
        
        # 헤더 작성
        writer.writerow(self.export_headers)
        
        # 데이터 작성
        for operation in operations:
            row_data = self._prepare_row_data(operation, format_for_csv=True)
            writer.writerow(row_data)
        
        # 파일 포인터를 처음으로 되돌림
        output.seek(0)
        
        return output, "operations_export.csv"
    
    def export_to_excel(self, operations: List[Dict[str, Any]]) -> Tuple[io.BytesIO, str]:
        """
        운영 데이터를 Excel 형식으로 내보내기
        
        Args:
            operations: 내보낼 운영 데이터 리스트
            
        Returns:
            Tuple[io.BytesIO, str]: (Excel 데이터 스트림, 파일명)
        """
        from ..utils.excel_export_utils import ExcelExportUtils, ExcelRowProcessor
        
        # 공통 유틸리티를 사용하여 Excel 파일 생성
        return ExcelExportUtils.create_excel_file(
            data=operations,
            headers=self.export_headers,
            sheet_name='운영 목록',
            filename_prefix='operations',
            row_data_processor=ExcelRowProcessor.create_operations_row_processor(),
            column_widths=[10, 12, 20, 30, 10, 12, 12, 10, 15, 15, 10, 15, 15, 15, 15]
        )
    
    def _prepare_row_data(self, operation: Dict[str, Any], format_for_csv: bool = False) -> List[str]:
        """
        운영 데이터를 행 데이터로 변환
        
        Args:
            operation: 운영 데이터
            format_for_csv: CSV 형식용 포맷팅 여부
            
        Returns:
            List[str]: 행 데이터 리스트
        """
        # 운영 유형명 변환
        operation_type = OPERATION_TYPES.get(operation.get('operation_type', 'maintenance'), '유지보수')
        
        # 상태명 변환
        status_name = OPERATION_STATUS.get(operation.get('status', 'planned'), '계획됨')
        
        # 담당자 및 부서명
        assignee_name = operation.get('assignee_name', '-')
        department_name = operation.get('department', {}).get('name', '-')
        
        # 날짜 형식 처리
        start_date = '-'
        end_date = '-'
        created_at = '-'
        updated_at = '-'
        
        if operation.get('start_date'):
            if format_for_csv:
                start_date = operation['start_date'].strftime('%Y-%m-%d') if hasattr(operation['start_date'], 'strftime') else str(operation['start_date'])
            else:
                start_date = operation['start_date']
                
        if operation.get('end_date'):
            if format_for_csv:
                end_date = operation['end_date'].strftime('%Y-%m-%d') if hasattr(operation['end_date'], 'strftime') else str(operation['end_date'])
            else:
                end_date = operation['end_date']
                
        if operation.get('created_at'):
            if format_for_csv:
                created_at = operation['created_at'].strftime('%Y-%m-%d %H:%M') if hasattr(operation['created_at'], 'strftime') else str(operation['created_at'])
            else:
                created_at = operation['created_at']
                
        if operation.get('updated_at'):
            if format_for_csv:
                updated_at = operation['updated_at'].strftime('%Y-%m-%d %H:%M') if hasattr(operation['updated_at'], 'strftime') else str(operation['updated_at'])
            else:
                updated_at = operation['updated_at']
        
        # 비용 형식 처리
        budget = operation.get('budget', 0)
        actual_cost = operation.get('actual_cost', 0)
        
        if format_for_csv:
            budget = format(budget, ',') if budget else '-'
            actual_cost = format(actual_cost, ',') if actual_cost else '-'
        
        # 진행률 처리
        progress = operation.get('progress', 0)
        progress_str = f"{progress}%" if isinstance(progress, (int, float)) else str(progress)
        
        return [
            operation.get('id', ''),
            operation_type,
            operation.get('title', ''),
            operation.get('description', '')[:100] + '...' if len(operation.get('description', '')) > 100 else operation.get('description', ''),
            status_name,
            start_date,
            end_date,
            progress_str,
            assignee_name,
            department_name,
            operation.get('priority', 'medium'),
            budget,
            actual_cost,
            created_at,
            updated_at
        ]
    
    # Excel 관련 중복 메서드들은 ExcelExportUtils로 통합되어 제거됨


# 싱글톤 인스턴스 생성
operations_export_service = OperationsExportService() 