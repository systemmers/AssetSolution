"""
Operations Statistics Service 모듈 - Facade 패턴
각 도메인별 서비스를 연결하는 Facade 서비스

Classes:
    - OperationsStatisticsService: 통계, 분석, 보고서 Facade 서비스
"""
from typing import List, Dict, Optional
from datetime import datetime
from .operations import (
    OperationsHistoryService, OperationsAnalyticsService, OperationsReportService
)


class OperationsStatisticsService:
    """
    자산 운영 통계 및 보고서 Facade 서비스 클래스
    """
    
    def __init__(self):
        """도메인 서비스 초기화"""
        self.history_service = OperationsHistoryService()
        self.analytics_service = OperationsAnalyticsService()
        self.report_service = OperationsReportService()
    
    # ==================== 이력 조회 서비스 ====================
    
    def get_operation_history(self, asset_id: str = None, user_name: str = None, 
                             operation_type: str = None, status: str = None,
                             start_date: str = None, end_date: str = None) -> Dict:
        """자산 운영 이력 종합 조회 (HistoryService로 delegate)"""
        return self.history_service.get_operation_history(
            asset_id=asset_id,
            user_name=user_name,
            operation_type=operation_type,
            status=status,
            start_date=start_date,
            end_date=end_date
        )

    def get_history_detail(self, history_id: str) -> Optional[Dict]:
        """특정 자산 운영 이력의 상세 정보 조회 (HistoryService로 delegate)"""
        return self.history_service.get_history_detail(history_id)
    
    # ==================== 통계 및 보고서 서비스 ====================
    
    def get_operations_statistics(self) -> Dict:
        """운영 통계 종합 데이터 조회 (AnalyticsService로 delegate)"""
        return self.analytics_service.get_operations_statistics()
    
    def generate_operations_report(self, report_type: str, start_date: str = None, 
                                  end_date: str = None, include_sections: List[str] = None) -> Dict:
        """운영 보고서 생성 (ReportService로 delegate)"""
        return self.report_service.generate_operations_report(
            report_type=report_type,
            start_date=start_date,
            end_date=end_date,
            include_sections=include_sections
        )
    
    def export_report(self, report_id: str, format_type: str) -> str:
        """보고서 파일 내보내기 (ReportService로 delegate)"""
        return self.report_service.export_report(report_id, format_type)
    
    # ==================== 추가 분석 메서드 ====================
    
    def get_asset_utilization_analysis(self) -> Dict:
        """자산 활용도 심층 분석 (AnalyticsService로 delegate)"""
        return self.analytics_service.get_asset_utilization_analysis()
    
    def get_department_performance_analysis(self) -> Dict:
        """부서별 성과 분석 (AnalyticsService로 delegate)"""
        return self.analytics_service.get_department_performance_analysis() 