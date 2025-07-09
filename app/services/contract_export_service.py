"""
Contract Export Service - 계약 내보내기 서비스

계약 데이터를 다양한 형식(CSV, Excel)으로 내보내는 기능을 담당하는 Service 클래스
"""
from typing import List, Dict, Any, Optional
from datetime import datetime
import csv
import io
import xlsxwriter
from flask import Response

from .contract_core_service import ContractCoreService
from ..utils.formatters import format_date, format_number, get_filename_timestamp

class ContractExportService:
    """계약 데이터 내보내기를 담당하는 Service 클래스"""
    
    def __init__(self):
        """Export Service 초기화"""
        self.core_service = ContractCoreService()
    
    def export_to_csv(
        self,
        search_query: Optional[str] = None,
        contract_type: Optional[str] = None,
        status: Optional[str] = None,
        filename: Optional[str] = None
    ) -> Response:
        """
        계약 데이터를 CSV 파일로 내보내기
        
        Args:
            search_query: 검색어
            contract_type: 계약 유형 필터
            status: 상태 필터
            filename: 파일명 (기본값: contracts_export.csv)
            
        Returns:
            CSV 파일 Response
        """
        # 모든 계약 데이터 조회 (페이지네이션 없음)
        contracts, _ = self.core_service.get_contract_list(
            search_query=search_query,
            contract_type=contract_type,
            status=status,
            page=1,
            per_page=10000  # 모든 데이터 조회
        )
        
        # CSV 생성
        output = io.StringIO()
        writer = csv.writer(output)
        
        # 헤더 작성
        headers = self._get_csv_headers()
        writer.writerow(headers)
        
        # 데이터 작성
        for contract in contracts:
            row_data = self._prepare_csv_row(contract)
            writer.writerow(row_data)
        
        # 파일 포인터를 처음으로 되돌림
        output.seek(0)
        
        # 파일명 설정
        if not filename:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"contracts_export_{timestamp}.csv"
        
        # CSV 파일 Response 생성
        return Response(
            output.getvalue(),
            mimetype="text/csv",
            headers={"Content-Disposition": f"attachment;filename={filename}"}
        )
    
    def export_to_excel(
        self,
        search_query: Optional[str] = None,
        contract_type: Optional[str] = None,
        status: Optional[str] = None,
        filename: Optional[str] = None,
        include_charts: bool = False
    ) -> Response:
        """
        계약 데이터를 Excel 파일로 내보내기
        
        Args:
            search_query: 검색어
            contract_type: 계약 유형 필터
            status: 상태 필터
            filename: 파일명
            include_charts: 차트 포함 여부
            
        Returns:
            Excel 파일 Response
        """
        # 모든 계약 데이터 조회
        contracts, _ = self.core_service.get_contract_list(
            search_query=search_query,
            contract_type=contract_type,
            status=status,
            page=1,
            per_page=10000
        )
        
        # Excel 파일 생성
        output = io.BytesIO()
        workbook = xlsxwriter.Workbook(output, {'remove_timezone': True})
        
        # 메인 데이터 시트 생성
        self._create_main_data_sheet(workbook, contracts)
        
        # 통계 시트 생성
        if include_charts:
            self._create_statistics_sheet(workbook, contracts)
            self._create_charts_sheet(workbook, contracts)
        
        # 워크북 닫기
        workbook.close()
        
        # 파일 포인터를 처음으로 되돌림
        output.seek(0)
        
        # 파일명 설정
        if not filename:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"contracts_export_{timestamp}.xlsx"
        
        # Excel 파일 Response 생성
        return Response(
            output.getvalue(),
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment;filename={filename}"}
        )
    
    def export_summary_report(
        self,
        report_type: str = 'monthly',
        filename: Optional[str] = None
    ) -> Response:
        """
        계약 요약 보고서 생성
        
        Args:
            report_type: 보고서 유형 ('monthly', 'quarterly', 'yearly')
            filename: 파일명
            
        Returns:
            Excel 보고서 Response
        """
        # 통계 데이터 조회
        stats = self.core_service.get_contract_statistics()
        all_contracts, _ = self.core_service.get_contract_list(page=1, per_page=10000)
        
        # Excel 파일 생성
        output = io.BytesIO()
        workbook = xlsxwriter.Workbook(output, {'remove_timezone': True})
        
        # 요약 보고서 시트 생성
        self._create_summary_report_sheet(workbook, stats, all_contracts, report_type)
        
        # 만료 위험 분석 시트
        self._create_risk_analysis_sheet(workbook, all_contracts)
        
        # 부서별 분석 시트
        self._create_department_analysis_sheet(workbook, stats)
        
        workbook.close()
        output.seek(0)
        
        # 파일명 설정
        if not filename:
            timestamp = datetime.now().strftime('%Y%m%d')
            filename = f"contract_summary_report_{report_type}_{timestamp}.xlsx"
        
        return Response(
            output.getvalue(),
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment;filename={filename}"}
        )
    
    def _get_csv_headers(self) -> List[str]:
        """CSV 헤더 정의"""
        return [
            '계약번호', '계약명', '공급업체', '계약유형', '상태', 
            '시작일', '종료일', '계약금액', '월간비용', '담당부서', 
            '담당자', '결제주기', '진행률(%)', '남은일수'
        ]
    
    def _prepare_csv_row(self, contract: Dict[str, Any]) -> List[str]:
        """CSV 행 데이터 준비"""
        return [
            contract.get('contract_no', '-'),
            contract.get('name', '-'),
            contract.get('vendor', '-'),
            contract.get('type_name', '-'),
            contract.get('status_name', '-'),
            contract.get('start_date', '-'),
            contract.get('end_date', '-'),
            str(contract.get('amount', 0)),
            str(contract.get('monthly_cost', 0)),
            contract.get('department', '-'),
            contract.get('manager', '-'),
            contract.get('payment_term', '-'),
            str(contract.get('progress_percent', 0)),
            str(contract.get('remaining_days', 0))
        ]
    
    def _create_main_data_sheet(self, workbook: xlsxwriter.Workbook, contracts: List[Dict[str, Any]]) -> None:
        """메인 데이터 시트 생성"""
        from ..utils.excel_export_utils import ExcelExportUtils, ExcelRowProcessor
        
        worksheet = workbook.add_worksheet('계약 목록')
        
        # 헤더 정의
        headers = [
            '계약번호', '계약명', '공급업체', '계약유형', '상태', '시작일', '종료일',
            '계약금액', '월간비용', '담당부서', '담당자', '결제주기', '진행률(%)', '남은일수'
        ]
        
        # 공통 유틸리티의 표준 포맷 사용
        formats = ExcelExportUtils._create_standard_formats(workbook)
        
        # 헤더 작성
        ExcelExportUtils._write_headers(worksheet, headers, formats['header'])
        
        # 컬럼 너비 설정
        column_widths = [15, 30, 20, 12, 12, 12, 12, 15, 12, 15, 12, 12, 10, 10]
        ExcelExportUtils._set_column_widths(worksheet, column_widths)
        
        # 데이터 작성 (기존 방식 유지 - 복잡한 로직 때문)
        for row, contract in enumerate(contracts, 1):
            self._write_contract_row(worksheet, row, contract, formats)
        
        # 테이블 생성
        if contracts:
            worksheet.add_table(0, 0, len(contracts), len(headers) - 1, {
                'name': 'contracts_table',
                'style': 'Table Style Medium 2',
                'autofilter': True
            })
    
    def _create_statistics_sheet(self, workbook: xlsxwriter.Workbook, contracts: List[Dict[str, Any]]) -> None:
        """통계 시트 생성"""
        worksheet = workbook.add_worksheet('통계')
        styles = self._define_excel_styles(workbook)
        
        # 기본 통계
        stats = self.core_service.get_contract_statistics()
        
        # 제목
        worksheet.write(0, 0, '계약 통계 요약', styles['title'])
        
        # 기본 통계 작성
        row = 2
        basic_stats = [
            ('총 계약 수', stats.get('total_contracts', 0)),
            ('활성 계약 수', len([c for c in contracts if c.get('status') == 'active'])),
            ('만료 예정 계약', len([c for c in contracts if c.get('status') == 'expiring'])),
            ('총 계약 금액', f"{stats.get('total_amount', 0):,}원"),
            ('월간 활성 비용', f"{stats.get('monthly_costs', {}).get('active_monthly', 0):,}원")
        ]
        
        for label, value in basic_stats:
            worksheet.write(row, 0, label, styles['label'])
            worksheet.write(row, 1, value, styles['data'])
            row += 1
        
        # 상태별 통계
        row += 2
        worksheet.write(row, 0, '상태별 통계', styles['subtitle'])
        row += 1
        
        status_stats = stats.get('status_stats', {})
        for status, count in status_stats.items():
            worksheet.write(row, 0, f"{status} 계약", styles['label'])
            worksheet.write(row, 1, count, styles['data'])
            row += 1
        
        # 유형별 통계
        row += 2
        worksheet.write(row, 0, '유형별 통계', styles['subtitle'])
        row += 1
        
        type_stats = stats.get('type_stats', {})
        for contract_type, count in type_stats.items():
            worksheet.write(row, 0, f"{contract_type} 계약", styles['label'])
            worksheet.write(row, 1, count, styles['data'])
            row += 1
    
    def _create_charts_sheet(self, workbook: xlsxwriter.Workbook, contracts: List[Dict[str, Any]]) -> None:
        """차트 시트 생성"""
        worksheet = workbook.add_worksheet('차트')
        
        # 상태별 파이 차트
        chart = workbook.add_chart({'type': 'pie'})
        
        # 차트 데이터 준비
        status_data = {}
        for contract in contracts:
            status = contract.get('status_name', '기타')
            status_data[status] = status_data.get(status, 0) + 1
        
        # 차트 데이터 시트에 작성
        row = 1
        for status, count in status_data.items():
            worksheet.write(row, 0, status)
            worksheet.write(row, 1, count)
            row += 1
        
        # 차트 설정
        chart.add_series({
            'categories': ['차트', 1, 0, len(status_data), 0],
            'values': ['차트', 1, 1, len(status_data), 1],
            'name': '계약 상태별 분포'
        })
        
        chart.set_title({'name': '계약 상태별 분포'})
        worksheet.insert_chart('D2', chart)
    
    def _create_summary_report_sheet(
        self, 
        workbook: xlsxwriter.Workbook, 
        stats: Dict[str, Any], 
        contracts: List[Dict[str, Any]], 
        report_type: str
    ) -> None:
        """요약 보고서 시트 생성"""
        worksheet = workbook.add_worksheet('요약 보고서')
        styles = self._define_excel_styles(workbook)
        
        # 보고서 제목
        title = f"계약 관리 {report_type.upper()} 보고서"
        worksheet.write(0, 0, title, styles['title'])
        worksheet.write(1, 0, f"생성일: {datetime.now().strftime('%Y년 %m월 %d일')}", styles['subtitle'])
        
        # 핵심 지표
        row = 3
        worksheet.write(row, 0, '핵심 지표', styles['subtitle'])
        row += 1
        
        key_metrics = [
            ('총 계약 수', stats.get('total_contracts', 0)),
            ('활성 계약 비율', f"{stats.get('performance_metrics', {}).get('active_rate', 0)}%"),
            ('평균 계약 금액', f"{stats.get('performance_metrics', {}).get('average_contract_value', 0):,}원"),
            ('월간 총 비용', f"{stats.get('monthly_costs', {}).get('active_monthly', 0):,}원"),
            ('연간 예상 비용', f"{stats.get('monthly_costs', {}).get('projected_yearly', 0):,}원")
        ]
        
        for label, value in key_metrics:
            worksheet.write(row, 0, label, styles['label'])
            worksheet.write(row, 2, value, styles['data'])
            row += 1
        
        # 위험 분석
        row += 2
        worksheet.write(row, 0, '위험 분석', styles['subtitle'])
        row += 1
        
        risk_analysis = stats.get('expiry_analysis', {})
        risk_items = [
            ('긴급 (7일 이내)', risk_analysis.get('critical_risk', 0)),
            ('높음 (30일 이내)', risk_analysis.get('high_risk', 0)),
            ('보통 (90일 이내)', risk_analysis.get('medium_risk', 0)),
            ('총 위험 계약', risk_analysis.get('total_at_risk', 0))
        ]
        
        for label, value in risk_items:
            worksheet.write(row, 0, label, styles['label'])
            worksheet.write(row, 2, value, styles['data'])
            row += 1
    
    def _create_risk_analysis_sheet(self, workbook: xlsxwriter.Workbook, contracts: List[Dict[str, Any]]) -> None:
        """위험 분석 시트 생성"""
        worksheet = workbook.add_worksheet('위험 분석')
        styles = self._define_excel_styles(workbook)
        
        # 만료 예정 계약 필터링
        expiring_contracts = [c for c in contracts if c.get('remaining_days', 999) <= 90]
        expiring_contracts.sort(key=lambda x: x.get('remaining_days', 999))
        
        # 헤더
        worksheet.write(0, 0, '만료 위험 계약 분석', styles['title'])
        
        headers = ['계약명', '공급업체', '종료일', '남은일수', '위험도', '계약금액', '담당부서']
        for col, header in enumerate(headers):
            worksheet.write(2, col, header, styles['header'])
        
        # 데이터 작성
        for row, contract in enumerate(expiring_contracts, 3):
            worksheet.write(row, 0, contract.get('name', '-'))
            worksheet.write(row, 1, contract.get('vendor', '-'))
            worksheet.write(row, 2, contract.get('end_date', '-'))
            worksheet.write(row, 3, contract.get('remaining_days', 0))
            worksheet.write(row, 4, contract.get('risk_level', 'unknown'))
            worksheet.write(row, 5, contract.get('amount', 0))
            worksheet.write(row, 6, contract.get('department', '-'))
    
    def _create_department_analysis_sheet(self, workbook: xlsxwriter.Workbook, stats: Dict[str, Any]) -> None:
        """부서별 분석 시트 생성"""
        worksheet = workbook.add_worksheet('부서별 분석')
        styles = self._define_excel_styles(workbook)
        
        # 제목
        worksheet.write(0, 0, '부서별 계약 분석', styles['title'])
        
        # 헤더
        headers = ['부서명', '총 계약 수', '활성 계약 수', '총 계약 금액', '평균 계약 금액']
        for col, header in enumerate(headers):
            worksheet.write(2, col, header, styles['header'])
        
        # 부서별 데이터
        dept_stats = stats.get('department_stats', {})
        for row, (dept, data) in enumerate(dept_stats.items(), 3):
            worksheet.write(row, 0, dept)
            worksheet.write(row, 1, data.get('count', 0))
            worksheet.write(row, 2, data.get('active_count', 0))
            worksheet.write(row, 3, data.get('total_amount', 0))
            avg_amount = data.get('total_amount', 0) / max(data.get('count', 1), 1)
            worksheet.write(row, 4, round(avg_amount, 0))
    
    def _write_contract_row(
        self, 
        worksheet: xlsxwriter.worksheet.Worksheet, 
        row: int, 
        contract: Dict[str, Any], 
        styles: Dict[str, Any]
    ) -> None:
        """계약 행 데이터 작성"""
        # 기본 데이터
        worksheet.write(row, 0, contract.get('contract_no', '-'), styles['cell'])
        worksheet.write(row, 1, contract.get('name', '-'), styles['cell'])
        worksheet.write(row, 2, contract.get('vendor', '-'), styles['cell'])
        worksheet.write(row, 3, contract.get('type_name', '-'), styles['cell'])
        worksheet.write(row, 4, contract.get('status_name', '-'), styles['cell'])
        
        # 날짜 필드
        try:
            start_date = datetime.strptime(contract['start_date'], '%Y-%m-%d')
            worksheet.write_datetime(row, 5, start_date, styles['date'])
        except (ValueError, TypeError, KeyError):
            worksheet.write(row, 5, contract.get('start_date', '-'), styles['cell'])
        
        try:
            end_date = datetime.strptime(contract['end_date'], '%Y-%m-%d')
            worksheet.write_datetime(row, 6, end_date, styles['date'])
        except (ValueError, TypeError, KeyError):
            worksheet.write(row, 6, contract.get('end_date', '-'), styles['cell'])
        
        # 숫자 필드
        worksheet.write_number(row, 7, contract.get('amount', 0), styles['currency'])
        worksheet.write_number(row, 8, contract.get('monthly_cost', 0), styles['currency'])
        
        # 기타 필드
        worksheet.write(row, 9, contract.get('department', '-'), styles['cell'])
        worksheet.write(row, 10, contract.get('manager', '-'), styles['cell'])
        worksheet.write(row, 11, contract.get('payment_term', '-'), styles['cell'])
        worksheet.write_number(row, 12, contract.get('progress_percent', 0), styles['percent'])
        worksheet.write_number(row, 13, contract.get('remaining_days', 0), styles['number'])
    
    def _define_excel_styles(self, workbook: xlsxwriter.Workbook) -> Dict[str, Any]:
        """Excel 스타일 정의"""
        return {
            'title': workbook.add_format({
                'bold': True,
                'font_size': 16,
                'align': 'center',
                'valign': 'vcenter',
                'bg_color': '#4472C4',
                'font_color': 'white'
            }),
            'subtitle': workbook.add_format({
                'bold': True,
                'font_size': 12,
                'bg_color': '#D9E2F3'
            }),
            'header': workbook.add_format({
                'bold': True,
                'bg_color': '#F0F0F0',
                'border': 1,
                'align': 'center',
                'valign': 'vcenter'
            }),
            'cell': workbook.add_format({
                'border': 1,
                'valign': 'vcenter'
            }),
            'date': workbook.add_format({
                'border': 1,
                'num_format': 'yyyy-mm-dd',
                'valign': 'vcenter'
            }),
            'currency': workbook.add_format({
                'border': 1,
                'num_format': '#,##0',
                'valign': 'vcenter'
            }),
            'percent': workbook.add_format({
                'border': 1,
                'num_format': '0.0%',
                'valign': 'vcenter'
            }),
            'number': workbook.add_format({
                'border': 1,
                'num_format': '#,##0',
                'valign': 'vcenter'
            }),
            'label': workbook.add_format({
                'bold': True,
                'bg_color': '#E7E6E6'
            }),
            'data': workbook.add_format({
                'align': 'right'
            })
        } 
