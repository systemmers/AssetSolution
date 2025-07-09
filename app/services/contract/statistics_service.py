"""
Contract Statistics Service
계약 통계 및 분석을 담당하는 서비스

Classes:
    - ContractStatisticsService: 계약 통계, 분석, 보고서 생성 서비스
"""
from typing import List, Dict, Optional, Any
from datetime import datetime, date
from ...repositories.contract.contract_repository import ContractRepository


class ContractStatisticsService:
    """계약 통계 및 분석을 담당하는 서비스 클래스"""
    
    def __init__(self):
        """Service 초기화"""
        self.repository = ContractRepository()
    
    def get_contract_statistics(self) -> Dict[str, Any]:
        """
        계약 통계 정보 조회
        
        Returns:
            계약 통계 정보
        """
        base_stats = self.repository.get_statistics()
        
        # 추가 비즈니스 통계 계산
        all_contracts = self.repository.get_all()
        
        # 월간 비용 계산
        monthly_cost = self._calculate_monthly_costs(all_contracts)
        
        # 만료 위험도 분석
        expiry_analysis = self._analyze_expiry_risks(all_contracts)
        
        # 부서별 통계
        department_stats = self._calculate_department_statistics(all_contracts)
        
        base_stats.update({
            'monthly_costs': monthly_cost,
            'expiry_analysis': expiry_analysis,
            'department_stats': department_stats,
            'performance_metrics': self._calculate_performance_metrics(all_contracts)
        })
        
        # 템플릿 호환성을 위한 키 매핑
        mapped_stats = {
            'total_contracts': base_stats.get('total_count', 0),
            'active_contracts': base_stats.get('active_count', 0),
            'expiring_contracts': base_stats.get('expiring_count', 0),
            'monthly_cost': monthly_cost.get('active_monthly', 0)
        }
        mapped_stats.update(base_stats)
        
        return mapped_stats
    
    def get_expiring_contracts(self, days_ahead: int = 30) -> List[Dict[str, Any]]:
        """
        만료 예정 계약 목록 조회
        
        Args:
            days_ahead: 앞으로 몇 일 이내의 계약을 조회할지
            
        Returns:
            만료 예정 계약 목록
        """
        contracts = self.repository.get_expiring_contracts(days_ahead)
        
        enriched_contracts = []
        for contract in contracts:
            enriched_contract = contract.copy()
            enriched_contract.update(self._calculate_expiry_info(contract))
            enriched_contracts.append(enriched_contract)
        
        # 만료일 기준으로 정렬
        return sorted(enriched_contracts, key=lambda x: x.get('days_remaining', 999))
    
    def _calculate_contract_metrics(self, contract: Dict[str, Any]) -> Dict[str, Any]:
        """
        계약별 지표 계산
        
        Args:
            contract: 계약 데이터
            
        Returns:
            계산된 지표
        """
        metrics = {}
        
        # 계약 기간 계산
        try:
            start_date = datetime.strptime(contract['start_date'], '%Y-%m-%d').date()
            end_date = datetime.strptime(contract['end_date'], '%Y-%m-%d').date()
            total_days = (end_date - start_date).days
            metrics['total_days'] = total_days
            metrics['total_months'] = round(total_days / 30.44, 1)  # 평균 월일수
            
            # 현재 기준 진행률 계산
            today = date.today()
            if start_date <= today <= end_date:
                elapsed_days = (today - start_date).days
                progress_percent = round((elapsed_days / total_days) * 100, 1)
                metrics['progress_percent'] = progress_percent
                metrics['remaining_days'] = (end_date - today).days
            elif today < start_date:
                metrics['progress_percent'] = 0
                metrics['remaining_days'] = (end_date - today).days
                metrics['days_to_start'] = (start_date - today).days
            else:
                metrics['progress_percent'] = 100
                metrics['remaining_days'] = 0
                metrics['days_overdue'] = (today - end_date).days
                
        except (ValueError, TypeError):
            metrics['total_days'] = 0
            metrics['total_months'] = 0
            metrics['progress_percent'] = 0
            metrics['remaining_days'] = 0
        
        # 월간 비용 계산
        if contract.get('payment_term') == '월간':
            metrics['monthly_cost'] = contract['amount']
        elif contract.get('payment_term') == '연간':
            metrics['monthly_cost'] = round(contract['amount'] / 12, 0)
        elif contract.get('payment_term') == '분기별':
            metrics['monthly_cost'] = round(contract['amount'] / 3, 0)
        elif contract.get('payment_term') == '반기별':
            metrics['monthly_cost'] = round(contract['amount'] / 6, 0)
        else:
            metrics['monthly_cost'] = 0
        
        return metrics
    
    def _calculate_expiry_info(self, contract: Dict[str, Any]) -> Dict[str, Any]:
        """
        만료 관련 정보 계산
        
        Args:
            contract: 계약 데이터
            
        Returns:
            만료 정보
        """
        try:
            end_date = datetime.strptime(contract['end_date'], '%Y-%m-%d').date()
            today = date.today()
            days_remaining = (end_date - today).days
            
            # 위험도 분류
            if days_remaining <= 7:
                risk_level = 'critical'
                risk_color = 'danger'
            elif days_remaining <= 30:
                risk_level = 'high'
                risk_color = 'warning'
            elif days_remaining <= 90:
                risk_level = 'medium'
                risk_color = 'info'
            else:
                risk_level = 'low'
                risk_color = 'success'
            
            return {
                'days_remaining': days_remaining,
                'weeks_remaining': round(days_remaining / 7, 1),
                'months_remaining': round(days_remaining / 30.44, 1),
                'risk_level': risk_level,
                'risk_color': risk_color
            }
        except (ValueError, TypeError):
            return {
                'days_remaining': 0,
                'weeks_remaining': 0,
                'months_remaining': 0,
                'risk_level': 'unknown',
                'risk_color': 'secondary'
            }
    
    def _calculate_monthly_costs(self, contracts: List[Dict[str, Any]]) -> Dict[str, Any]:
        """월간 비용 계산"""
        total_monthly = 0
        active_monthly = 0
        
        for contract in contracts:
            monthly_cost = self._calculate_contract_metrics(contract).get('monthly_cost', 0)
            total_monthly += monthly_cost
            if contract['status'] == 'active':
                active_monthly += monthly_cost
        
        return {
            'total_monthly': total_monthly,
            'active_monthly': active_monthly,
            'projected_yearly': active_monthly * 12
        }
    
    def _analyze_expiry_risks(self, contracts: List[Dict[str, Any]]) -> Dict[str, Any]:
        """만료 위험도 분석"""
        critical = len([c for c in contracts if self._get_days_remaining(c) <= 7])
        high = len([c for c in contracts if 7 < self._get_days_remaining(c) <= 30])
        medium = len([c for c in contracts if 30 < self._get_days_remaining(c) <= 90])
        
        return {
            'critical_risk': critical,
            'high_risk': high,
            'medium_risk': medium,
            'total_at_risk': critical + high + medium
        }
    
    def _calculate_department_statistics(self, contracts: List[Dict[str, Any]]) -> Dict[str, Any]:
        """부서별 통계 계산"""
        dept_stats = {}
        for contract in contracts:
            dept = contract.get('department', '기타')
            if dept not in dept_stats:
                dept_stats[dept] = {'count': 0, 'total_amount': 0, 'active_count': 0}
            
            dept_stats[dept]['count'] += 1
            dept_stats[dept]['total_amount'] += contract.get('amount', 0)
            if contract['status'] == 'active':
                dept_stats[dept]['active_count'] += 1
        
        return dept_stats
    
    def _calculate_performance_metrics(self, contracts: List[Dict[str, Any]]) -> Dict[str, Any]:
        """성과 지표 계산"""
        total = len(contracts)
        active = len([c for c in contracts if c['status'] == 'active'])
        expiring = len([c for c in contracts if c['status'] == 'expiring'])
        
        return {
            'total_contracts': total,
            'active_rate': round((active / total) * 100, 1) if total > 0 else 0,
            'expiring_rate': round((expiring / total) * 100, 1) if total > 0 else 0,
            'average_contract_value': round(sum(c.get('amount', 0) for c in contracts) / total, 0) if total > 0 else 0
        }
    
    def _get_days_remaining(self, contract: Dict[str, Any]) -> int:
        """계약 만료까지 남은 일수 계산"""
        try:
            end_date = datetime.strptime(contract['end_date'], '%Y-%m-%d').date()
            return (end_date - date.today()).days
        except (ValueError, TypeError):
            return 999 