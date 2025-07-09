"""
InventoryDiscrepancyService - 자산실사 불일치 관리 서비스
자산실사 중 발견된 불일치 사항의 관리, 해결, 분석 등을 담당
"""
from typing import List, Dict, Optional, Any
from ...repositories.inventory.inventory_repository import inventory_repository


class InventoryDiscrepancyService:
    """자산실사 불일치 관리를 담당하는 서비스 클래스"""
    
    def __init__(self):
        """서비스 초기화"""
        self.repository = inventory_repository
    
    def get_discrepancies_summary(self) -> Dict[str, Any]:
        """불일치 요약 정보 조회 (라우트에서 호출하는 메서드)"""
        try:
            # 모든 불일치 정보 조회
            discrepancies = self.repository.get_discrepancies()
            
            # 심각도별 통계 계산
            severity_stats = {
                'critical': len([d for d in discrepancies if d.get('severity') == 'critical']),
                'high': len([d for d in discrepancies if d.get('severity') == 'high']),
                'medium': len([d for d in discrepancies if d.get('severity') == 'medium']),
                'low': len([d for d in discrepancies if d.get('severity') == 'low'])
            }
            
            return {
                'discrepancies': discrepancies,
                'severity_stats': severity_stats
            }
        except Exception as e:
            raise Exception(f"불일치 요약 정보 조회 중 오류 발생: {str(e)}")
    
    def resolve_discrepancy(self, discrepancy_id: int) -> bool:
        """불일치 해결 처리"""
        try:
            return self.repository.resolve_discrepancy(discrepancy_id)
        except Exception as e:
            raise Exception(f"불일치 해결 처리 중 오류 발생: {str(e)}")
    
    def get_discrepancies_by_inventory(self, inventory_id: int) -> List[Dict[str, Any]]:
        """특정 자산실사의 불일치 목록 조회"""
        try:
            return self.repository.get_discrepancies(inventory_id)
        except Exception as e:
            raise Exception(f"자산실사 불일치 목록 조회 중 오류 발생: {str(e)}")
    
    def get_discrepancy_detail(self, discrepancy_id: int) -> Optional[Dict[str, Any]]:
        """불일치 상세 정보 조회"""
        try:
            discrepancies = self.repository.get_discrepancies()
            for discrepancy in discrepancies:
                if discrepancy.get('id') == discrepancy_id:
                    return discrepancy
            return None
        except Exception as e:
            raise Exception(f"불일치 상세 정보 조회 중 오류 발생: {str(e)}")
    
    def create_discrepancy(self, discrepancy_data: Dict[str, Any]) -> Dict[str, Any]:
        """새 불일치 사항 등록"""
        validated_data = self._validate_discrepancy_data(discrepancy_data)
        return self.repository.create_discrepancy(validated_data)
    
    def update_discrepancy(self, discrepancy_id: int, discrepancy_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """불일치 정보 업데이트"""
        existing_discrepancy = self.get_discrepancy_detail(discrepancy_id)
        if not existing_discrepancy:
            return None
        
        validated_data = self._validate_discrepancy_data(discrepancy_data, is_update=True)
        return self.repository.update_discrepancy(discrepancy_id, validated_data)
    
    def get_discrepancies_by_severity(self, severity: str) -> List[Dict[str, Any]]:
        """심각도별 불일치 목록 조회"""
        discrepancies = self.repository.get_discrepancies()
        return [d for d in discrepancies if d.get('severity') == severity]
    
    def get_discrepancies_by_status(self, status: str) -> List[Dict[str, Any]]:
        """상태별 불일치 목록 조회"""
        discrepancies = self.repository.get_discrepancies()
        return [d for d in discrepancies if d.get('status') == status]
    
    def get_unresolved_discrepancies(self) -> List[Dict[str, Any]]:
        """미해결 불일치 목록 조회"""
        discrepancies = self.repository.get_discrepancies()
        return [d for d in discrepancies if d.get('status') != 'resolved']
    
    def get_critical_discrepancies(self) -> List[Dict[str, Any]]:
        """긴급 불일치 목록 조회"""
        discrepancies = self.repository.get_discrepancies()
        return [d for d in discrepancies if d.get('severity') == 'critical' and d.get('status') != 'resolved']
    
    def bulk_resolve_discrepancies(self, discrepancy_ids: List[int]) -> Dict[str, Any]:
        """여러 불일치 사항 일괄 해결"""
        resolved_count = 0
        failed_count = 0
        
        for discrepancy_id in discrepancy_ids:
            try:
                if self.resolve_discrepancy(discrepancy_id):
                    resolved_count += 1
                else:
                    failed_count += 1
            except Exception:
                failed_count += 1
        
        return {
            'total_requested': len(discrepancy_ids),
            'resolved_count': resolved_count,
            'failed_count': failed_count,
            'success_rate': (resolved_count / len(discrepancy_ids) * 100) if discrepancy_ids else 0
        }
    
    def analyze_discrepancy_trends(self) -> Dict[str, Any]:
        """불일치 트렌드 분석"""
        discrepancies = self.repository.get_discrepancies()
        
        # 유형별 분석
        type_analysis = {}
        for discrepancy in discrepancies:
            disc_type = discrepancy.get('type', 'unknown')
            if disc_type not in type_analysis:
                type_analysis[disc_type] = 0
            type_analysis[disc_type] += 1
        
        # 심각도별 분석
        severity_analysis = {}
        for discrepancy in discrepancies:
            severity = discrepancy.get('severity', 'unknown')
            if severity not in severity_analysis:
                severity_analysis[severity] = 0
            severity_analysis[severity] += 1
        
        return {
            'total_discrepancies': len(discrepancies),
            'type_analysis': type_analysis,
            'severity_analysis': severity_analysis,
            'resolution_rate': self._calculate_resolution_rate(discrepancies)
        }
    
    def _validate_discrepancy_data(self, discrepancy_data: Dict[str, Any], is_update: bool = False) -> Dict[str, Any]:
        """불일치 데이터 검증 및 변환"""
        validated_data = discrepancy_data.copy()
        
        if not is_update:
            required_fields = ['inventory_id', 'asset_id', 'type', 'severity']
            for field in required_fields:
                if not validated_data.get(field):
                    raise ValueError(f"{field}는 필수 입력 항목입니다.")
        
        # 심각도 값 검증
        valid_severities = ['critical', 'high', 'medium', 'low']
        if validated_data.get('severity') and validated_data['severity'] not in valid_severities:
            raise ValueError(f"심각도는 {', '.join(valid_severities)} 중 하나여야 합니다.")
        
        return validated_data
    
    def _calculate_resolution_rate(self, discrepancies: List[Dict[str, Any]]) -> float:
        """불일치 해결률 계산"""
        if not discrepancies:
            return 0.0
        
        resolved_count = len([d for d in discrepancies if d.get('status') == 'resolved'])
        return round((resolved_count / len(discrepancies)) * 100, 2)


# 싱글톤 인스턴스 생성
inventory_discrepancy_service = InventoryDiscrepancyService() 