"""
OperationsAnalyticsService - 자산 운영 분석 서비스
자산 운영 통계, 분석, 성과 지표 등을 담당
"""
from typing import List, Dict
from ...repositories.operations.operations_repository import operations_repository


class OperationsAnalyticsService:
    """
    자산 운영 분석 및 통계 서비스 클래스
    """
    
    def __init__(self):
        """Service 초기화 및 Repository 의존성 주입"""
        self.operations_repo = operations_repository
    
    def get_operations_statistics(self) -> Dict:
        """
        운영 통계 종합 데이터 조회
        
        Returns:
            통계 데이터와 차트 정보
        """
        # Repository를 통한 상세 통계 조회
        return self.operations_repo.get_detailed_statistics()
    
    def get_asset_utilization_analysis(self) -> Dict:
        """
        자산 활용도 심층 분석
        
        Returns:
            자산 활용도 분석 결과
        """
        stats = self.operations_repo.get_detailed_statistics()
        asset_data = stats['asset_utilization_top10']
        
        # 활용도 구간별 분석
        high_utilization = [a for a in asset_data if a['utilization_rate'] >= 80]
        medium_utilization = [a for a in asset_data if 50 <= a['utilization_rate'] < 80]
        low_utilization = [a for a in asset_data if a['utilization_rate'] < 50]
        
        return {
            'high_utilization_assets': len(high_utilization),
            'medium_utilization_assets': len(medium_utilization),
            'low_utilization_assets': len(low_utilization),
            'recommendation': self._generate_utilization_recommendation(high_utilization, medium_utilization, low_utilization),
            'top_performers': high_utilization[:3],
            'needs_attention': low_utilization[:3]
        }
    
    def get_department_performance_analysis(self) -> Dict:
        """
        부서별 성과 분석
        
        Returns:
            부서별 성과 분석 결과
        """
        stats = self.operations_repo.get_detailed_statistics()
        dept_data = stats['department_utilization']
        
        # 가장 활발한 부서와 개선이 필요한 부서 식별
        most_active = max(dept_data, key=lambda x: x['value']) if dept_data else None
        least_active = min(dept_data, key=lambda x: x['value']) if dept_data else None
        
        return {
            'most_active_department': most_active,
            'least_active_department': least_active,
            'total_departments': len(dept_data),
            'average_utilization': sum([d['value'] for d in dept_data]) / len(dept_data) if dept_data else 0
        }
    
    def get_trend_analysis(self) -> Dict:
        """
        운영 트렌드 분석
        
        Returns:
            트렌드 분석 결과
        """
        stats = self.operations_repo.get_detailed_statistics()
        
        # 월별 트렌드 분석
        monthly_stats = stats.get('monthly_stats', {})
        
        # 성장률 계산 (간단한 Mock 로직)
        growth_rate = 5.2  # Mock: 5.2% 성장
        
        # 계절성 분석
        seasonal_patterns = self._analyze_seasonal_patterns(monthly_stats)
        
        return {
            'growth_rate': growth_rate,
            'seasonal_patterns': seasonal_patterns,
            'peak_months': ['6월', '7월', '12월'],  # Mock 데이터
            'low_months': ['1월', '2월', '8월']    # Mock 데이터
        }
    
    def get_efficiency_metrics(self) -> Dict:
        """
        효율성 지표 분석
        
        Returns:
            효율성 관련 지표
        """
        stats = self.operations_repo.get_detailed_statistics()
        summary_stats = stats['summary_stats']
        
        # 처리 효율성
        processing_efficiency = summary_stats.get('average_processing_time', 24)  # Mock: 24시간
        
        # 승인률
        approval_rate = summary_stats.get('approval_rate', 92.5)  # Mock: 92.5%
        
        # 자동화율
        automation_rate = summary_stats.get('automation_rate', 68.3)  # Mock: 68.3%
        
        return {
            'processing_efficiency': processing_efficiency,
            'approval_rate': approval_rate,
            'automation_rate': automation_rate,
            'efficiency_score': self._calculate_efficiency_score(processing_efficiency, approval_rate, automation_rate)
        }
    
    def get_risk_indicators(self) -> Dict:
        """
        위험 지표 분석
        
        Returns:
            위험 관련 지표
        """
        stats = self.operations_repo.get_detailed_statistics()
        
        # 연체율
        overdue_rate = stats['summary_stats'].get('overdue_returns', 0) / stats['summary_stats'].get('monthly_loans', 1) * 100
        
        # 분실/손상률
        loss_rate = 2.1  # Mock: 2.1%
        
        # 규정 위반율
        violation_rate = 1.8  # Mock: 1.8%
        
        risk_level = self._calculate_risk_level(overdue_rate, loss_rate, violation_rate)
        
        return {
            'overdue_rate': round(overdue_rate, 2),
            'loss_rate': loss_rate,
            'violation_rate': violation_rate,
            'overall_risk_level': risk_level,
            'recommendations': self._generate_risk_recommendations(risk_level)
        }
    
    def generate_performance_dashboard(self) -> Dict:
        """
        성과 대시보드 데이터 생성
        
        Returns:
            대시보드용 종합 데이터
        """
        basic_stats = self.get_operations_statistics()
        utilization = self.get_asset_utilization_analysis()
        efficiency = self.get_efficiency_metrics()
        risks = self.get_risk_indicators()
        
        return {
            'summary_cards': {
                'total_operations': basic_stats['summary_stats']['monthly_loans'],
                'utilization_rate': basic_stats['summary_stats']['average_utilization_rate'],
                'efficiency_score': efficiency['efficiency_score'],
                'risk_level': risks['overall_risk_level']
            },
            'charts': {
                'utilization_chart': basic_stats['asset_utilization_top10'][:5],
                'department_chart': basic_stats['department_utilization'],
                'monthly_trend': basic_stats.get('monthly_stats', {})
            },
            'alerts': self._generate_alerts(utilization, efficiency, risks)
        }
    
    def _generate_utilization_recommendation(self, high: List, medium: List, low: List) -> str:
        """활용도 기반 추천사항 생성"""
        if len(low) > len(high):
            return "저활용 자산이 많습니다. 자산 재배치나 폐기를 고려해보세요."
        elif len(high) > len(medium) + len(low):
            return "활용도가 높습니다. 추가 자산 확보를 검토해보세요."
        else:
            return "자산 활용도가 적절한 수준입니다."
    
    def _analyze_seasonal_patterns(self, monthly_stats: Dict) -> Dict:
        """계절성 패턴 분석"""
        # Mock 계절성 분석
        return {
            'spring': 'high',    # 3-5월: 높은 활동
            'summer': 'medium',  # 6-8월: 중간 활동
            'autumn': 'high',    # 9-11월: 높은 활동
            'winter': 'low'      # 12-2월: 낮은 활동
        }
    
    def _calculate_efficiency_score(self, processing_time: float, approval_rate: float, automation_rate: float) -> float:
        """효율성 점수 계산"""
        # 가중 평균으로 효율성 점수 계산
        time_score = max(0, 100 - (processing_time - 24) * 2)  # 24시간 기준
        approval_score = approval_rate
        automation_score = automation_rate
        
        efficiency_score = (time_score * 0.3 + approval_score * 0.4 + automation_score * 0.3)
        return round(efficiency_score, 1)
    
    def _calculate_risk_level(self, overdue_rate: float, loss_rate: float, violation_rate: float) -> str:
        """위험 레벨 계산"""
        total_risk = overdue_rate + loss_rate + violation_rate
        
        if total_risk > 10:
            return 'HIGH'
        elif total_risk > 5:
            return 'MEDIUM'
        else:
            return 'LOW'
    
    def _generate_risk_recommendations(self, risk_level: str) -> List[str]:
        """위험 레벨별 권고사항 생성"""
        if risk_level == 'HIGH':
            return [
                '즉시 위험 요소 점검이 필요합니다.',
                '연체 자산에 대한 회수 조치를 강화하세요.',
                '자산 관리 정책을 재검토하세요.'
            ]
        elif risk_level == 'MEDIUM':
            return [
                '위험 요소를 모니터링하세요.',
                '예방적 조치를 강화하세요.'
            ]
        else:
            return ['현재 위험 수준이 양호합니다.']
    
    def _generate_alerts(self, utilization: Dict, efficiency: Dict, risks: Dict) -> List[Dict]:
        """알림 생성"""
        alerts = []
        
        if efficiency['efficiency_score'] < 70:
            alerts.append({
                'type': 'warning',
                'message': f'효율성 점수가 {efficiency["efficiency_score"]}%로 낮습니다.',
                'action': '프로세스 개선이 필요합니다.'
            })
        
        if risks['overall_risk_level'] == 'HIGH':
            alerts.append({
                'type': 'danger',
                'message': '위험 수준이 높습니다.',
                'action': '즉시 점검이 필요합니다.'
            })
        
        if utilization['low_utilization_assets'] > 10:
            alerts.append({
                'type': 'info',
                'message': f'{utilization["low_utilization_assets"]}개의 저활용 자산이 있습니다.',
                'action': '활용도 개선을 검토하세요.'
            })
        
        return alerts


# 싱글톤 인스턴스 생성
operations_analytics_service = OperationsAnalyticsService() 