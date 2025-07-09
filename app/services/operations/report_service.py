"""
OperationsReportService - 자산 운영 보고서 서비스
보고서 생성, 내보내기, 템플릿 관리 등을 담당
"""
from typing import List, Dict
from datetime import datetime
import uuid
from pathlib import Path
from ...repositories.operations.operations_repository import operations_repository


class OperationsReportService:
    """
    자산 운영 보고서 생성 및 관리 서비스 클래스
    """
    
    def __init__(self):
        """Service 초기화 및 Repository 의존성 주입"""
        self.operations_repo = operations_repository
    
    def generate_operations_report(self, report_type: str, start_date: str = None, 
                                  end_date: str = None, include_sections: List[str] = None) -> Dict:
        """
        운영 보고서 생성
        
        Args:
            report_type: 보고서 유형 (monthly, quarterly, yearly, custom)
            start_date: 시작일
            end_date: 종료일
            include_sections: 포함할 섹션 목록
            
        Returns:
            생성된 보고서 정보
        """
        # 보고서 ID 생성
        report_id = str(uuid.uuid4())
        
        # Repository를 통한 데이터 수집
        statistics_data = self.operations_repo.get_detailed_statistics()
        history_data = self.operations_repo.get_operation_history(
            start_date=start_date,
            end_date=end_date
        )
        
        # 보고서 데이터 구성
        report_data = {
            'report_id': report_id,
            'report_type': report_type,
            'generation_date': datetime.now().isoformat(),
            'period': {
                'start_date': start_date,
                'end_date': end_date
            },
            'include_sections': include_sections or ['loans', 'returns', 'disposals', 'maintenance'],
            'statistics': statistics_data,
            'history_count': len(history_data),
            'loan_stats': self.operations_repo.get_operations_statistics()
        }
        
        # 실제로는 데이터베이스에 저장하거나 파일로 생성
        # 여기서는 보고서 메타데이터만 반환
        return {
            'report_id': report_id,
            'status': 'generated',
            'download_ready': True,
            'data_summary': {
                'total_records': len(history_data),
                'report_sections': len(include_sections) if include_sections else 4,
                'generation_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
        }
    
    def export_report(self, report_id: str, format_type: str) -> str:
        """
        보고서 파일 내보내기
        
        Args:
            report_id: 보고서 ID
            format_type: 파일 형식 (excel, pdf)
            
        Returns:
            파일 경로
        """
        # 실제 구현에서는 실제 파일 생성 로직 필요
        temp_dir = Path("temp_reports")
        temp_dir.mkdir(exist_ok=True)
        
        if format_type == 'excel':
            file_path = temp_dir / f"operations_report_{report_id}.xlsx"
            # Excel 파일 생성 로직
            self._generate_excel_report(file_path, report_id)
        elif format_type == 'pdf':
            file_path = temp_dir / f"operations_report_{report_id}.pdf"
            # PDF 파일 생성 로직
            self._generate_pdf_report(file_path, report_id)
        else:
            raise ValueError("Unsupported format type")
        
        return str(file_path)
    
    def get_report_templates(self) -> List[Dict]:
        """
        사용 가능한 보고서 템플릿 목록 조회
        
        Returns:
            보고서 템플릿 목록
        """
        return [
            {
                'id': 'monthly_operations',
                'name': '월간 운영 보고서',
                'description': '월별 자산 운영 현황 및 통계',
                'sections': ['summary', 'loans', 'returns', 'statistics'],
                'format_options': ['pdf', 'excel']
            },
            {
                'id': 'quarterly_analysis',
                'name': '분기별 분석 보고서',
                'description': '분기별 성과 분석 및 트렌드',
                'sections': ['analysis', 'trends', 'recommendations'],
                'format_options': ['pdf', 'excel']
            },
            {
                'id': 'annual_summary',
                'name': '연간 종합 보고서',
                'description': '연간 전체 운영 성과 및 요약',
                'sections': ['summary', 'all_operations', 'year_analysis'],
                'format_options': ['pdf', 'excel']
            },
            {
                'id': 'custom_report',
                'name': '사용자 정의 보고서',
                'description': '사용자가 선택한 기간 및 섹션으로 구성',
                'sections': ['customizable'],
                'format_options': ['pdf', 'excel']
            }
        ]
    
    def generate_scheduled_reports(self) -> Dict:
        """
        정기 보고서 생성 (스케줄러용)
        
        Returns:
            생성된 보고서들의 정보
        """
        current_date = datetime.now()
        generated_reports = []
        
        # 월간 보고서 (매월 1일)
        if current_date.day == 1:
            monthly_report = self.generate_operations_report(
                report_type='monthly',
                start_date=(current_date.replace(day=1) - datetime.timedelta(days=1)).replace(day=1).strftime('%Y-%m-%d'),
                end_date=(current_date.replace(day=1) - datetime.timedelta(days=1)).strftime('%Y-%m-%d'),
                include_sections=['summary', 'loans', 'returns', 'statistics']
            )
            generated_reports.append(monthly_report)
        
        # 분기별 보고서 (분기 첫날)
        if current_date.month in [1, 4, 7, 10] and current_date.day == 1:
            quarterly_report = self.generate_operations_report(
                report_type='quarterly',
                include_sections=['analysis', 'trends', 'recommendations']
            )
            generated_reports.append(quarterly_report)
        
        return {
            'generated_count': len(generated_reports),
            'reports': generated_reports
        }
    
    def get_report_history(self, limit: int = 10) -> List[Dict]:
        """
        보고서 생성 이력 조회
        
        Args:
            limit: 조회할 보고서 개수
            
        Returns:
            보고서 이력 목록
        """
        # Mock 보고서 이력 데이터
        mock_history = []
        for i in range(limit):
            days_ago = i * 7  # 주간 간격
            report_date = datetime.now() - datetime.timedelta(days=days_ago)
            
            mock_history.append({
                'report_id': f'report_{i:03d}',
                'report_type': ['monthly', 'quarterly', 'custom'][i % 3],
                'generation_date': report_date.strftime('%Y-%m-%d %H:%M:%S'),
                'status': 'completed',
                'file_size': f'{2.5 + (i * 0.3):.1f}MB',
                'download_count': max(0, 10 - i)
            })
        
        return mock_history
    
    def delete_old_reports(self, days_old: int = 90) -> Dict:
        """
        오래된 보고서 파일 정리
        
        Args:
            days_old: 삭제할 보고서의 기준 일수
            
        Returns:
            정리 결과
        """
        # 실제 구현에서는 파일 시스템에서 오래된 파일들을 삭제
        cutoff_date = datetime.now() - datetime.timedelta(days=days_old)
        
        # Mock 정리 결과
        return {
            'cutoff_date': cutoff_date.strftime('%Y-%m-%d'),
            'deleted_count': 15,  # Mock: 15개 파일 삭제
            'freed_space': '45.2MB'  # Mock: 45.2MB 공간 확보
        }
    
    def _generate_excel_report(self, file_path: Path, report_id: str):
        """
        Excel 보고서 파일 생성
        
        Args:
            file_path: 파일 경로
            report_id: 보고서 ID
        """
        try:
            # 실제로는 openpyxl이나 pandas를 사용하여 Excel 파일 생성
            # 여기서는 Mock 파일 생성
            with open(file_path, 'w') as f:
                f.write(f"Operations Report - {report_id}\n")
                f.write("Generated at: " + datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
                
                # Repository에서 데이터 가져와서 실제 내용 작성
                stats = self.operations_repo.get_detailed_statistics()
                f.write(f"\n\nSummary Statistics:\n")
                f.write(f"Monthly Loans: {stats['summary_stats']['monthly_loans']}\n")
                f.write(f"Monthly Returns: {stats['summary_stats']['monthly_returns']}\n")
                f.write(f"Overdue Returns: {stats['summary_stats']['overdue_returns']}\n")
        except Exception as e:
            # 오류 발생 시 빈 파일 생성
            file_path.touch()
    
    def _generate_pdf_report(self, file_path: Path, report_id: str):
        """
        PDF 보고서 파일 생성
        
        Args:
            file_path: 파일 경로
            report_id: 보고서 ID
        """
        try:
            # 실제로는 reportlab이나 weasyprint를 사용하여 PDF 파일 생성
            # 여기서는 Mock 파일 생성
            with open(file_path, 'w') as f:
                f.write(f"PDF Operations Report - {report_id}\n")
                f.write("Generated at: " + datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
                
                # Repository에서 데이터 가져와서 실제 내용 작성
                stats = self.operations_repo.get_detailed_statistics()
                f.write(f"\n\nExecutive Summary:\n")
                f.write(f"Total Active Loans: {stats['summary_stats']['monthly_loans']}\n")
                f.write(f"Average Utilization Rate: {stats['summary_stats']['average_utilization_rate']}%\n")
        except Exception as e:
            # 오류 발생 시 빈 파일 생성
            file_path.touch()


# 싱글톤 인스턴스 생성
operations_report_service = OperationsReportService() 