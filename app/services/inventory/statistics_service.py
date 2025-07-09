"""
InventoryStatisticsService - 자산실사 통계 서비스
자산실사 관련 통계, 분석, 보고서 생성 등을 담당
"""
from typing import List, Dict, Any
from datetime import datetime, timedelta
from ...repositories.inventory.inventory_repository import inventory_repository


class InventoryStatisticsService:
    """자산실사 통계 및 분석을 담당하는 서비스 클래스"""
    
    def __init__(self):
        """서비스 초기화"""
        self.repository = inventory_repository
    
    def get_inventory_statistics(self) -> Dict[str, Any]:
        """자산실사 통계 정보 반환"""
        inventories = self.repository.get_all_inventories()
        discrepancies = self.repository.get_discrepancies()
        
        total_inventories = len(inventories)
        planned_count = len([inv for inv in inventories if inv.get('status') == 'planned'])
        in_progress_count = len([inv for inv in inventories if inv.get('status') == 'in_progress'])
        completed_count = len([inv for inv in inventories if inv.get('status') == 'completed'])
        
        total_discrepancies = len(discrepancies)
        critical_discrepancies = len([disc for disc in discrepancies if disc.get('severity') == 'critical'])
        
        completion_rate = (completed_count / total_inventories * 100) if total_inventories > 0 else 0
        
        return {
            'total_inventories': total_inventories,
            'planned_count': planned_count,
            'in_progress_count': in_progress_count,
            'completed_count': completed_count,
            'total_discrepancies': total_discrepancies,
            'critical_discrepancies': critical_discrepancies,
            'completion_rate': round(completion_rate, 1)
        }
    
    def get_pending_inventories(self) -> List[Dict[str, Any]]:
        """진행 중인 자산실사 목록 조회"""
        inventories = self.repository.get_all_inventories()
        return [inv for inv in inventories if inv.get('status') == 'in_progress']
    
    def get_department_statistics(self) -> Dict[str, Any]:
        """부서별 자산실사 통계"""
        inventories = self.repository.get_all_inventories()
        
        department_stats = {}
        for inventory in inventories:
            dept = inventory.get('department', '미지정')
            if dept not in department_stats:
                department_stats[dept] = {
                    'total': 0,
                    'planned': 0,
                    'in_progress': 0,
                    'completed': 0,
                    'cancelled': 0
                }
            
            department_stats[dept]['total'] += 1
            status = inventory.get('status', 'unknown')
            if status in department_stats[dept]:
                department_stats[dept][status] += 1
        
        return department_stats
    
    def get_monthly_statistics(self, months: int = 6) -> Dict[str, Any]:
        """월별 자산실사 통계 (최근 N개월)"""
        inventories = self.repository.get_all_inventories()
        current_date = datetime.now()
        
        monthly_stats = {}
        for i in range(months):
            month_date = current_date - timedelta(days=30 * i)
            month_key = month_date.strftime('%Y-%m')
            monthly_stats[month_key] = {
                'created': 0,
                'completed': 0,
                'in_progress': 0
            }
        
        for inventory in inventories:
            # Mock 데이터이므로 간단한 분배 로직 사용
            if inventory.get('status') == 'completed':
                # 최근 몇 개월에 완료된 것으로 가정
                month_key = list(monthly_stats.keys())[0]  # 가장 최근 월
                monthly_stats[month_key]['completed'] += 1
            elif inventory.get('status') == 'in_progress':
                month_key = list(monthly_stats.keys())[1] if len(monthly_stats) > 1 else list(monthly_stats.keys())[0]
                monthly_stats[month_key]['in_progress'] += 1
        
        return monthly_stats
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """자산실사 성과 지표"""
        inventories = self.repository.get_all_inventories()
        discrepancies = self.repository.get_discrepancies()
        
        # 평균 실사 기간 계산 (Mock)
        completed_inventories = [inv for inv in inventories if inv.get('status') == 'completed']
        avg_duration = 15  # Mock 데이터: 평균 15일
        
        # 정확도 계산
        total_assets_audited = sum([inv.get('assets_count', 0) for inv in completed_inventories])
        discrepancy_rate = (len(discrepancies) / total_assets_audited * 100) if total_assets_audited > 0 else 0
        accuracy_rate = 100 - discrepancy_rate
        
        # 효율성 지표
        on_time_completion = len([inv for inv in completed_inventories if inv.get('completed_on_time', True)])
        efficiency_rate = (on_time_completion / len(completed_inventories) * 100) if completed_inventories else 0
        
        return {
            'avg_audit_duration': avg_duration,
            'accuracy_rate': round(accuracy_rate, 2),
            'efficiency_rate': round(efficiency_rate, 2),
            'total_assets_audited': total_assets_audited,
            'discrepancy_rate': round(discrepancy_rate, 2)
        }
    
    def get_trend_analysis(self) -> Dict[str, Any]:
        """자산실사 트렌드 분석"""
        inventories = self.repository.get_all_inventories()
        discrepancies = self.repository.get_discrepancies()
        
        # 실사 횟수 트렌드 (Mock)
        audit_trend = {
            'increasing': len(inventories) > 10,
            'trend_percentage': 15.5  # Mock: 15.5% 증가
        }
        
        # 불일치 트렌드
        discrepancy_trend = {
            'decreasing': len(discrepancies) < 20,
            'trend_percentage': -8.2  # Mock: 8.2% 감소
        }
        
        # 완료율 트렌드
        completed_count = len([inv for inv in inventories if inv.get('status') == 'completed'])
        completion_trend = {
            'improving': completed_count / len(inventories) > 0.7 if inventories else False,
            'current_rate': (completed_count / len(inventories) * 100) if inventories else 0
        }
        
        return {
            'audit_frequency_trend': audit_trend,
            'discrepancy_trend': discrepancy_trend,
            'completion_trend': completion_trend
        }
    
    def get_risk_assessment(self) -> Dict[str, Any]:
        """위험도 평가"""
        inventories = self.repository.get_all_inventories()
        discrepancies = self.repository.get_discrepancies()
        
        # 고위험 자산실사 식별
        high_risk_inventories = []
        for inventory in inventories:
            risk_score = 0
            
            # 진행 기간이 긴 경우
            if inventory.get('status') == 'in_progress':
                risk_score += 30
            
            # 불일치가 많은 경우
            inv_discrepancies = [d for d in discrepancies if d.get('inventory_id') == inventory.get('id')]
            if len(inv_discrepancies) > 5:
                risk_score += 40
            
            # 긴급 불일치가 있는 경우
            critical_discrepancies = [d for d in inv_discrepancies if d.get('severity') == 'critical']
            if critical_discrepancies:
                risk_score += 50
            
            if risk_score > 50:
                high_risk_inventories.append({
                    'inventory': inventory,
                    'risk_score': risk_score,
                    'risk_factors': self._identify_risk_factors(inventory, inv_discrepancies)
                })
        
        return {
            'high_risk_count': len(high_risk_inventories),
            'high_risk_inventories': high_risk_inventories[:5],  # 상위 5개만
            'overall_risk_level': self._calculate_overall_risk(high_risk_inventories, inventories)
        }
    
    def generate_summary_report(self) -> Dict[str, Any]:
        """종합 요약 보고서 생성"""
        basic_stats = self.get_inventory_statistics()
        performance = self.get_performance_metrics()
        trends = self.get_trend_analysis()
        risks = self.get_risk_assessment()
        
        return {
            'report_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'basic_statistics': basic_stats,
            'performance_metrics': performance,
            'trend_analysis': trends,
            'risk_assessment': risks,
            'recommendations': self._generate_recommendations(basic_stats, performance, risks)
        }
    
    def _identify_risk_factors(self, inventory: Dict[str, Any], discrepancies: List[Dict[str, Any]]) -> List[str]:
        """위험 요인 식별"""
        factors = []
        
        if inventory.get('status') == 'in_progress':
            factors.append('장기간 진행 중인 실사')
        
        if len(discrepancies) > 5:
            factors.append('다수의 불일치 발견')
        
        critical_count = len([d for d in discrepancies if d.get('severity') == 'critical'])
        if critical_count > 0:
            factors.append(f'{critical_count}개의 긴급 불일치')
        
        return factors
    
    def _calculate_overall_risk(self, high_risk_inventories: List[Dict[str, Any]], all_inventories: List[Dict[str, Any]]) -> str:
        """전체 위험도 계산"""
        if not all_inventories:
            return 'LOW'
        
        risk_ratio = len(high_risk_inventories) / len(all_inventories)
        
        if risk_ratio > 0.3:
            return 'HIGH'
        elif risk_ratio > 0.1:
            return 'MEDIUM'
        else:
            return 'LOW'
    
    def _generate_recommendations(self, stats: Dict[str, Any], performance: Dict[str, Any], risks: Dict[str, Any]) -> List[str]:
        """개선 권고사항 생성"""
        recommendations = []
        
        if stats['completion_rate'] < 80:
            recommendations.append('실사 완료율이 낮습니다. 프로세스 개선이 필요합니다.')
        
        if performance['accuracy_rate'] < 95:
            recommendations.append('실사 정확도가 낮습니다. 실사자 교육을 강화하세요.')
        
        if risks['high_risk_count'] > 0:
            recommendations.append(f'{risks["high_risk_count"]}개의 고위험 실사가 있습니다. 즉시 점검이 필요합니다.')
        
        if stats['critical_discrepancies'] > 0:
            recommendations.append('긴급 불일치 사항이 있습니다. 우선 처리하세요.')
        
        if not recommendations:
            recommendations.append('현재 자산실사 상태가 양호합니다.')
        
        return recommendations


# 싱글톤 인스턴스 생성
inventory_statistics_service = InventoryStatisticsService() 