"""
폐기 관리 서비스 모듈
자산 폐기 관련 핵심 비즈니스 로직 처리

Classes:
    - DisposalService: 폐기 계획, 신청, 승인 등 폐기 관련 서비스 로직
"""
from typing import List, Dict, Optional, Any
from datetime import datetime, date


class DisposalService:
    """
    자산 폐기 관리 서비스 클래스
    Repository와 Controller 사이의 폐기 관련 비즈니스 로직 계층
    """
    
    def __init__(self):
        """Service 초기화 및 Repository 의존성 주입"""
        from ...repositories import operations_repository, asset_repository
        self.operations_repo = operations_repository
        self.asset_repo = asset_repository
    
    def get_disposal_list(self) -> List[Dict]:
        """
        폐기 목록 조회 (비즈니스 로직 적용)
        
        Returns:
            폐기 목록 (추가 비즈니스 정보 포함)
        """
        try:
            disposals = self.operations_repo.get_disposal_list()
            
            # 비즈니스 로직: 폐기 우선순위 및 상태 정보 추가
            current_date = datetime.utcnow().date()
            for disposal in disposals:
                # 폐기 예정일 기준 우선순위 계산
                if disposal.get('disposal_date'):
                    days_until_disposal = (disposal['disposal_date'] - current_date).days
                    if days_until_disposal < 0:
                        disposal['disposal_priority'] = 'overdue'
                        disposal['priority_text'] = f'{abs(days_until_disposal)}일 지연'
                    elif days_until_disposal <= 7:
                        disposal['disposal_priority'] = 'urgent'
                        disposal['priority_text'] = f'{days_until_disposal}일 후'
                    elif days_until_disposal <= 30:
                        disposal['disposal_priority'] = 'normal'
                        disposal['priority_text'] = f'{days_until_disposal}일 후'
                    else:
                        disposal['disposal_priority'] = 'low'
                        disposal['priority_text'] = f'{days_until_disposal}일 후'
                
                # 자산 가치 평가
                if disposal.get('estimated_value') and disposal.get('purchase_price'):
                    disposal['value_retention_rate'] = (
                        disposal['estimated_value'] / disposal['purchase_price'] * 100
                    )
            
            return disposals
            
        except Exception as e:
            print(f"폐기 목록 조회 오류: {e}")
            return []
    
    def get_disposal_detail(self, disposal_id: int) -> Optional[Dict]:
        """
        폐기 상세 정보 조회
        
        Args:
            disposal_id: 폐기 ID
            
        Returns:
            폐기 상세 정보 또는 None
        """
        try:
            disposal = self.operations_repo.get_disposal_detail(disposal_id)
            
            if disposal:
                # 비즈니스 로직: 추가 정보 계산
                current_date = datetime.utcnow().date()
                
                # 폐기 진행률 계산
                if disposal.get('approval_steps'):
                    completed_steps = sum(1 for step in disposal['approval_steps'] if step.get('completed'))
                    total_steps = len(disposal['approval_steps'])
                    disposal['progress_percentage'] = (completed_steps / total_steps * 100) if total_steps > 0 else 0
                
                # 예상 회수 가능 금액 계산
                if disposal.get('estimated_value') and disposal.get('disposal_type'):
                    if disposal['disposal_type'] == 'sale':
                        disposal['expected_recovery'] = disposal['estimated_value'] * 0.8  # 판매 수수료 등 고려
                    elif disposal['disposal_type'] == 'donation':
                        disposal['expected_recovery'] = 0
                        disposal['tax_benefit'] = disposal['estimated_value'] * 0.3  # 세제 혜택
                    else:  # scrap
                        disposal['expected_recovery'] = disposal['estimated_value'] * 0.1
            
            return disposal
            
        except Exception as e:
            print(f"폐기 상세 조회 오류: {e}")
            return None
    
    def get_disposal_planning_data(self) -> List[Dict]:
        """
        폐기 계획 데이터 조회
        
        Returns:
            폐기 계획 목록
        """
        try:
            # Repository에서 기본 데이터 조회
            planning_data = self.operations_repo.get_disposal_planning_data()
            
            # 비즈니스 로직: 폐기 적합성 및 우선순위 평가
            current_date = datetime.utcnow().date()
            
            for item in planning_data:
                # 자산 연령 계산
                if item.get('purchase_date'):
                    asset_age_days = (current_date - item['purchase_date']).days
                    item['asset_age_years'] = asset_age_days / 365.25
                    
                    # 폐기 적합성 점수 계산 (0-100)
                    age_score = min(asset_age_days / (5 * 365), 1) * 40  # 5년 기준 40점
                    condition_score = {'excellent': 0, 'good': 20, 'fair': 35, 'poor': 50}.get(
                        item.get('condition', 'good'), 20
                    )
                    usage_score = min(item.get('usage_frequency', 50) / 100, 1) * 10  # 사용 빈도 역산
                    
                    item['disposal_suitability_score'] = age_score + condition_score + usage_score
                    
                    # 폐기 우선순위 결정
                    if item['disposal_suitability_score'] >= 80:
                        item['disposal_priority'] = 'high'
                    elif item['disposal_suitability_score'] >= 60:
                        item['disposal_priority'] = 'medium'
                    else:
                        item['disposal_priority'] = 'low'
                
                # 예상 폐기 비용 계산
                item['estimated_disposal_cost'] = self._calculate_disposal_cost(item)
                
                # 환경 영향 평가
                item['environmental_impact'] = self._assess_environmental_impact(item)
            
            # 우선순위 순으로 정렬
            planning_data.sort(key=lambda x: x.get('disposal_suitability_score', 0), reverse=True)
            
            return planning_data
            
        except Exception as e:
            print(f"폐기 계획 데이터 조회 오류: {e}")
            return []
    
    def get_disposal_planning_data_by_status(self, status: str = None, page: int = 1, per_page: int = 10) -> Dict:
        """
        상태별 폐기 계획 데이터 조회 (페이징 지원)
        
        Args:
            status: 폐기 상태 필터
            page: 페이지 번호
            per_page: 페이지당 항목 수
            
        Returns:
            폐기 계획 데이터와 페이지네이션 정보
        """
        try:
            # Repository에서 데이터 조회
            planning_data = self.operations_repo.get_disposal_planning_data_by_status(
                status=status, page=page, per_page=per_page
            )
            
            # 비즈니스 로직: 추가 분석 정보
            for item in planning_data.get('items', []):
                # 폐기 비용 효율성 분석
                if item.get('estimated_value') and item.get('maintenance_cost'):
                    # 연간 유지비용 대비 잔존가치 비율
                    item['cost_efficiency_ratio'] = (
                        item['estimated_value'] / (item['maintenance_cost'] * 12)
                        if item['maintenance_cost'] > 0 else float('inf')
                    )
                
                # 법적 요구사항 확인
                item['legal_requirements'] = self._check_legal_requirements(item)
                
                # 데이터 보안 고려사항
                if item.get('category') in ['IT장비', '컴퓨터', '서버']:
                    item['data_security_level'] = self._assess_data_security_level(item)
            
            return planning_data
            
        except Exception as e:
            print(f"상태별 폐기 계획 조회 오류: {e}")
            return {'items': [], 'pagination': {}}
    
    def get_disposal_planning_statistics(self) -> Dict:
        """
        폐기 계획 통계 조회
        
        Returns:
            폐기 계획 관련 통계 정보
        """
        try:
            # Repository에서 기본 통계 조회
            stats = self.operations_repo.get_disposal_planning_statistics()
            
            # 비즈니스 로직: 추가 통계 계산
            planning_data = self.get_disposal_planning_data()
            
            # 카테고리별 폐기 분포
            category_distribution = {}
            total_estimated_value = 0
            total_disposal_cost = 0
            
            for item in planning_data:
                category = item.get('category', '기타')
                if category not in category_distribution:
                    category_distribution[category] = {'count': 0, 'value': 0}
                
                category_distribution[category]['count'] += 1
                category_distribution[category]['value'] += item.get('estimated_value', 0)
                
                total_estimated_value += item.get('estimated_value', 0)
                total_disposal_cost += item.get('estimated_disposal_cost', 0)
            
            stats.update({
                'category_distribution': category_distribution,
                'total_estimated_value': total_estimated_value,
                'total_disposal_cost': total_disposal_cost,
                'net_recovery_amount': total_estimated_value - total_disposal_cost,
                'average_asset_age': self._calculate_average_asset_age(planning_data),
                'environmental_impact_summary': self._summarize_environmental_impact(planning_data)
            })
            
            return stats
            
        except Exception as e:
            print(f"폐기 계획 통계 조회 오류: {e}")
            return {}
    
    def submit_disposal_request(self, asset_id, disposal_reason, disposal_type, 
                               estimated_value=None, disposal_date=None, notes='', 
                               attachments=None, requester_id=None):
        """
        폐기 신청 제출
        
        Args:
            asset_id: 자산 ID
            disposal_reason: 폐기 사유
            disposal_type: 폐기 유형 (sale, donation, scrap, etc.)
            estimated_value: 예상 잔존가치
            disposal_date: 예정 폐기일
            notes: 추가 메모
            attachments: 첨부파일
            requester_id: 신청자 ID
            
        Returns:
            처리 결과 딕셔너리
        """
        try:
            # 비즈니스 로직: 신청 유효성 검증
            validation_result = self._validate_disposal_request(
                asset_id, disposal_reason, disposal_type, estimated_value
            )
            
            if not validation_result['valid']:
                return {
                    'success': False,
                    'message': validation_result['message']
                }
            
            # 자산 존재 및 폐기 가능 여부 확인
            if not self._validate_asset_exists(asset_id):
                return {
                    'success': False,
                    'message': '존재하지 않는 자산입니다.'
                }
            
            if not self._validate_disposal_eligibility(asset_id):
                return {
                    'success': False,
                    'message': '현재 폐기할 수 없는 상태의 자산입니다.'
                }
            
            # Repository를 통한 폐기 신청 생성
            disposal_request = {
                'asset_id': asset_id,
                'disposal_reason': disposal_reason,
                'disposal_type': disposal_type,
                'estimated_value': estimated_value,
                'disposal_date': disposal_date,
                'notes': notes,
                'attachments': attachments or [],
                'requester_id': requester_id,
                'status': 'pending',
                'created_at': datetime.utcnow().isoformat(),
                'approval_workflow': self._create_approval_workflow(disposal_type, estimated_value)
            }
            
            # 실제 구현에서는 Repository를 통해 데이터베이스에 저장
            request_id = f"DR-{datetime.now().strftime('%Y%m%d')}-{asset_id}"
            
            return {
                'success': True,
                'request_id': request_id,
                'message': '폐기 신청이 성공적으로 제출되었습니다.',
                'next_step': '부서장 승인 대기'
            }
            
        except Exception as e:
            print(f"폐기 신청 제출 오류: {e}")
            return {
                'success': False,
                'message': '폐기 신청 처리 중 오류가 발생했습니다.'
            }
    
    def get_disposal_reason_options(self) -> List[Dict]:
        """폐기 사유 옵션 조회"""
        return [
            {'id': 'obsolete', 'name': '노후화'},
            {'id': 'broken', 'name': '고장'},
            {'id': 'upgrade', 'name': '업그레이드'},
            {'id': 'unused', 'name': '미사용'},
            {'id': 'policy', 'name': '정책변경'},
            {'id': 'other', 'name': '기타'}
        ]
    
    def _calculate_disposal_cost(self, item: Dict) -> float:
        """폐기 비용 계산"""
        try:
            base_cost = 10000  # 기본 폐기 비용
            
            # 카테고리별 추가 비용
            category_multiplier = {
                'IT장비': 1.5,
                '가전제품': 1.2,
                '가구': 0.8,
                '차량': 3.0
            }.get(item.get('category', '기타'), 1.0)
            
            # 크기/무게별 추가 비용
            size_cost = item.get('weight', 1) * 1000  # kg당 1000원
            
            return base_cost * category_multiplier + size_cost
            
        except Exception:
            return 10000  # 기본값 반환
    
    def _assess_environmental_impact(self, item: Dict) -> Dict:
        """환경 영향 평가"""
        try:
            impact_score = 0
            recommendations = []
            
            # 재료별 환경 영향
            materials = item.get('materials', [])
            if 'plastic' in materials:
                impact_score += 30
                recommendations.append('플라스틱 분리수거 필요')
            if 'metal' in materials:
                impact_score += 10
                recommendations.append('금속 재활용 가능')
            if 'electronic' in materials:
                impact_score += 50
                recommendations.append('전자폐기물 전문 처리 필요')
            
            return {
                'impact_score': impact_score,
                'level': 'high' if impact_score > 40 else 'medium' if impact_score > 20 else 'low',
                'recommendations': recommendations
            }
            
        except Exception:
            return {'impact_score': 0, 'level': 'low', 'recommendations': []}
    
    def _validate_disposal_request(self, asset_id, disposal_reason, disposal_type, estimated_value):
        """폐기 신청 유효성 검증"""
        if not asset_id:
            return {'valid': False, 'message': '자산 ID가 필요합니다.'}
        
        if not disposal_reason:
            return {'valid': False, 'message': '폐기 사유를 선택해주세요.'}
        
        if not disposal_type:
            return {'valid': False, 'message': '폐기 유형을 선택해주세요.'}
        
        if estimated_value and estimated_value < 0:
            return {'valid': False, 'message': '예상 가치는 0 이상이어야 합니다.'}
        
        return {'valid': True, 'message': '유효한 신청입니다.'}
    
    def _validate_asset_exists(self, asset_id):
        """자산 존재 여부 확인"""
        # 실제 구현에서는 Repository를 통해 확인
        return True
    
    def _validate_disposal_eligibility(self, asset_id):
        """자산 폐기 가능 여부 확인"""
        # 실제 구현에서는 자산 상태, 대여 여부 등을 확인
        return True
    
    def _create_approval_workflow(self, disposal_type, estimated_value):
        """승인 워크플로우 생성"""
        workflow_steps = ['department_approval']  # 기본: 부서장 승인
        
        # 고가 자산의 경우 추가 승인 단계
        if estimated_value and estimated_value > 1000000:  # 100만원 이상
            workflow_steps.append('finance_approval')  # 재무팀 승인
        
        if estimated_value and estimated_value > 5000000:  # 500만원 이상
            workflow_steps.append('executive_approval')  # 임원 승인
        
        return workflow_steps
    
    def _check_legal_requirements(self, item: Dict) -> List[str]:
        """법적 요구사항 확인"""
        requirements = []
        
        # 카테고리별 법적 요구사항
        if item.get('category') == 'IT장비':
            requirements.append('개인정보 완전 삭제 필요')
            requirements.append('전자폐기물 처리업체 이용 필수')
        
        if item.get('category') == '차량':
            requirements.append('자동차 폐차 신고 필요')
            requirements.append('번호판 반납 필수')
        
        return requirements
    
    def _assess_data_security_level(self, item: Dict) -> str:
        """데이터 보안 수준 평가"""
        if item.get('has_sensitive_data'):
            return 'high'
        elif item.get('category') in ['서버', '데스크톱', '노트북']:
            return 'medium'
        else:
            return 'low'
    
    def _calculate_average_asset_age(self, planning_data: List[Dict]) -> float:
        """평균 자산 연령 계산"""
        ages = [item.get('asset_age_years', 0) for item in planning_data if item.get('asset_age_years')]
        return sum(ages) / len(ages) if ages else 0
    
    def _summarize_environmental_impact(self, planning_data: List[Dict]) -> Dict:
        """환경 영향 요약"""
        total_impact = sum(
            item.get('environmental_impact', {}).get('impact_score', 0) 
            for item in planning_data
        )
        
        high_impact_count = sum(
            1 for item in planning_data 
            if item.get('environmental_impact', {}).get('level') == 'high'
        )
        
        return {
            'total_impact_score': total_impact,
            'high_impact_items': high_impact_count,
            'requires_special_handling': high_impact_count > 0
        } 