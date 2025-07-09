"""
업그레이드 도메인 Repository 클래스
BaseRepository를 상속받아 업그레이드 관련 비즈니스 로직을 처리

Classes:
    - UpgradeRepository: 업그레이드 도메인의 데이터 액세스 및 비즈니스 로직 처리
"""
from typing import List, Dict, Any, Optional, Tuple
from .data.upgrade_data import UpgradeData


class UpgradeRepository:
    """
    업그레이드 도메인 Repository 클래스
    
    BaseRepository를 상속받아 업그레이드 관련 데이터 액세스와 
    비즈니스 로직을 처리합니다.
    """
    
    def __init__(self):
        """UpgradeRepository 초기화"""
        self.data_source = UpgradeData()  # 싱글톤 인스턴스
        # 기존 operations_repository와 동일한 속성 제공
        self.upgrades = self.data_source._upgrades
    
    # ==================== BaseRepository 추상 메서드 구현 ====================
    
    def _load_sample_data(self) -> List[Dict[str, Any]]:
        """
        샘플 데이터 로드 (UpgradeData에서 가져옴)
        
        Returns:
            업그레이드 샘플 데이터 리스트
        """
        return self.data_source.get_all_upgrades()
    
    def _validate_data(self, data: Dict[str, Any], is_update: bool = False) -> None:
        """
        업그레이드 데이터 유효성 검증
        
        Args:
            data: 검증할 업그레이드 데이터
            is_update: 업데이트 작업 여부
            
        Raises:
            ValueError: 유효하지 않은 데이터인 경우
        """
        # 필수 필드 검증
        required_fields = ['asset_id', 'upgrade_type', 'planned_date']
        if not is_update:
            required_fields.extend(['description', 'reason'])
        
        for field in required_fields:
            if field not in data or data[field] is None:
                raise ValueError(f"필수 필드 '{field}'가 누락되었습니다.")
        
        # 자산 ID 유효성 검증
        if 'asset_id' in data and not isinstance(data['asset_id'], int):
            raise ValueError("자산 ID는 정수여야 합니다.")
        
        # 업그레이드 유형 유효성 검증
        if 'upgrade_type' in data:
            valid_types = ['하드웨어', '소프트웨어', '펌웨어', '보안패치']
            if data['upgrade_type'] not in valid_types:
                raise ValueError(f"업그레이드 유형은 {valid_types} 중 하나여야 합니다.")
        
        # 상태 유효성 검증
        if 'status' in data:
            valid_statuses = ['계획됨', '진행중', '완료', '취소', '실패']
            if data['status'] not in valid_statuses:
                raise ValueError(f"상태는 {valid_statuses} 중 하나여야 합니다.")
        
        # 우선순위 유효성 검증
        if 'priority' in data:
            valid_priorities = ['낮음', '보통', '높음', '긴급']
            if data['priority'] not in valid_priorities:
                raise ValueError(f"우선순위는 {valid_priorities} 중 하나여야 합니다.")
        
        # 숫자 필드 유효성 검증
        numeric_fields = ['estimated_cost', 'actual_cost', 'downtime_hours']
        for field in numeric_fields:
            if field in data and data[field] is not None:
                if not isinstance(data[field], (int, float)):
                    raise ValueError(f"{field}는 숫자여야 합니다.")
    
    # ==================== BaseRepository CRUD 오버라이드 ====================
    
    def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        새 업그레이드 생성
        
        Args:
            data: 생성할 업그레이드 데이터
            
        Returns:
            생성된 업그레이드 정보
        """
        # 기본값 설정
        data.setdefault('status', '계획됨')
        data.setdefault('priority', '보통')
        data.setdefault('estimated_cost', 0)
        data.setdefault('notes', '')
        
        # 데이터 유효성 검증
        self._validate_data(data, is_update=False)
        
        # UpgradeData를 통해 생성
        created_upgrade = self.data_source.add_upgrade(data)
        
        # upgrades 속성은 data_source._upgrades을 참조하므로 자동 동기화됨
        
        return created_upgrade
    
    def update(self, item_id: int, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        업그레이드 정보 수정
        
        Args:
            item_id: 수정할 업그레이드 ID
            data: 수정할 데이터
            
        Returns:
            수정된 업그레이드 정보 또는 None
        """
        # 데이터 유효성 검증
        self._validate_data(data, is_update=True)
        
        # UpgradeData를 통해 업데이트
        updated_upgrade = self.data_source.update_upgrade(item_id, data)
        
        # upgrades 속성은 data_source._upgrades을 참조하므로 자동 동기화됨
        
        return updated_upgrade
    
    def delete(self, item_id: int) -> bool:
        """
        업그레이드 삭제
        
        Args:
            item_id: 삭제할 업그레이드 ID
            
        Returns:
            삭제 성공 여부
        """
        # 진행 중인 업그레이드는 삭제 불가
        upgrade = self.get_by_id(item_id)
        if upgrade and upgrade.get('status') == '진행중':
            raise ValueError("진행 중인 업그레이드는 삭제할 수 없습니다. 먼저 취소 처리를 해주세요.")
        
        # UpgradeData를 통해 삭제
        success = self.data_source.delete_upgrade(item_id)
        
        # upgrades 속성은 data_source._upgrades을 참조하므로 자동 동기화됨
        
        return success
    
    def get_statistics(self) -> Dict[str, Any]:
        """
        업그레이드 통계 정보 조회
        
        Returns:
            업그레이드 통계 딕셔너리
        """
        return self.data_source.get_upgrade_statistics()
    
    # ==================== 도메인 특화 메서드 ====================
    
    def get_upgrades_by_status(self, status: str) -> List[Dict[str, Any]]:
        """
        상태별 업그레이드 목록 조회
        
        Args:
            status: 업그레이드 상태
            
        Returns:
            해당 상태의 업그레이드 목록
        """
        return self.data_source.get_upgrades_by_status(status)
    
    def get_upgrades_by_type(self, upgrade_type: str) -> List[Dict[str, Any]]:
        """
        유형별 업그레이드 목록 조회
        
        Args:
            upgrade_type: 업그레이드 유형
            
        Returns:
            해당 유형의 업그레이드 목록
        """
        return self.data_source.get_upgrades_by_type(upgrade_type)
    
    def get_upgrades_by_priority(self, priority: str) -> List[Dict[str, Any]]:
        """
        우선순위별 업그레이드 목록 조회
        
        Args:
            priority: 우선순위
            
        Returns:
            해당 우선순위의 업그레이드 목록
        """
        return self.data_source.get_upgrades_by_priority(priority)
    
    def get_planned_upgrades(self) -> List[Dict[str, Any]]:
        """
        계획된 업그레이드 목록 조회
        
        Returns:
            계획된 업그레이드 목록
        """
        return self.data_source.get_planned_upgrades()
    
    def get_in_progress_upgrades(self) -> List[Dict[str, Any]]:
        """
        진행 중인 업그레이드 목록 조회
        
        Returns:
            진행 중인 업그레이드 목록
        """
        return self.data_source.get_in_progress_upgrades()
    
    def get_completed_upgrades(self) -> List[Dict[str, Any]]:
        """
        완료된 업그레이드 목록 조회
        
        Returns:
            완료된 업그레이드 목록
        """
        return self.data_source.get_completed_upgrades()
    
    def get_plans_with_pagination(self, page: int = 1, per_page: int = 10, 
                                 status: str = None, upgrade_type: str = None, 
                                 department: str = None) -> Tuple[List[Dict], int, int, int]:
        """
        페이지네이션된 업그레이드 계획 목록 조회
        
        Args:
            page: 페이지 번호
            per_page: 페이지당 항목 수
            status: 상태 필터
            upgrade_type: 업그레이드 유형 필터
            department: 부서 필터
            
        Returns:
            (업그레이드목록, 현재페이지, 총페이지수, 총항목수)
        """
        from datetime import datetime
        
        # 원본과 동일한 업그레이드 계획 Mock 데이터 (UpgradeData에서 가져오기)
        all_plans = self.data_source.get_all_upgrades()
        
        # 각 계획에 days_remaining 필드 추가 (템플릿에서 기대하는 필드)
        current_date = datetime.now().date()
        for plan in all_plans:
            if plan.get('planned_date'):
                # planned_date가 문자열인 경우 date 객체로 변환
                if isinstance(plan['planned_date'], str):
                    try:
                        planned_date = datetime.strptime(plan['planned_date'], '%Y-%m-%d').date()
                    except ValueError:
                        planned_date = current_date
                else:
                    planned_date = plan['planned_date']
                
                days_remaining = (planned_date - current_date).days
                plan['days_remaining'] = max(0, days_remaining)
            else:
                plan['days_remaining'] = 0
        
        # 필터링
        filtered_plans = all_plans.copy()
        if status:
            filtered_plans = [p for p in filtered_plans if p.get('status') == status]
        if upgrade_type:
            filtered_plans = [p for p in filtered_plans if p.get('upgrade_type') == upgrade_type]
        if department:
            filtered_plans = [p for p in filtered_plans if p.get('department') == department]
        
        # 페이지네이션 계산
        total_count = len(filtered_plans)
        total_pages = (total_count + per_page - 1) // per_page if total_count > 0 else 1
        
        # 페이지 번호 유효성 검사
        if page < 1:
            page = 1
        if page > total_pages and total_pages > 0:
            page = total_pages
        
        # 현재 페이지 항목 선택
        start_idx = (page - 1) * per_page
        end_idx = min(start_idx + per_page, total_count)
        current_page_items = filtered_plans[start_idx:end_idx] if filtered_plans else []
        
        return current_page_items, page, total_pages, total_count
    
    # ==================== 비즈니스 로직 메서드 ====================
    
    def start_upgrade(self, upgrade_id: int, start_date: str, notes: str = "") -> Dict[str, Any]:
        """
        업그레이드 시작
        
        Args:
            upgrade_id: 업그레이드 ID
            start_date: 시작 날짜
            notes: 시작 메모
            
        Returns:
            업데이트된 업그레이드 정보
            
        Raises:
            ValueError: 잘못된 업그레이드 ID이거나 시작 불가능한 상태
        """
        upgrade = self.get_by_id(upgrade_id)
        if not upgrade:
            raise ValueError("존재하지 않는 업그레이드 ID입니다.")
        
        if upgrade.get('status') != '계획됨':
            raise ValueError("계획된 업그레이드만 시작할 수 있습니다.")
        
        update_data = {
            'status': '진행중',
            'actual_start_date': start_date,
            'notes': f"{upgrade.get('notes', '')} | 시작: {notes}".strip(' |')
        }
        
        return self.update(upgrade_id, update_data)
    
    def complete_upgrade(self, upgrade_id: int, completion_date: str, 
                        actual_cost: float = None, downtime_hours: float = None,
                        performance_improvement: str = "", notes: str = "") -> Dict[str, Any]:
        """
        업그레이드 완료
        
        Args:
            upgrade_id: 업그레이드 ID
            completion_date: 완료 날짜
            actual_cost: 실제 비용
            downtime_hours: 다운타임 시간
            performance_improvement: 성능 개선 내용
            notes: 완료 메모
            
        Returns:
            업데이트된 업그레이드 정보
        """
        upgrade = self.get_by_id(upgrade_id)
        if not upgrade:
            raise ValueError("존재하지 않는 업그레이드 ID입니다.")
        
        if upgrade.get('status') != '진행중':
            raise ValueError("진행 중인 업그레이드만 완료할 수 있습니다.")
        
        update_data = {
            'status': '완료',
            'completion_date': completion_date,
            'notes': f"{upgrade.get('notes', '')} | 완료: {notes}".strip(' |')
        }
        
        if actual_cost is not None:
            update_data['actual_cost'] = actual_cost
        
        if downtime_hours is not None:
            update_data['downtime_hours'] = downtime_hours
        
        if performance_improvement:
            update_data['performance_improvement'] = performance_improvement
        
        return self.update(upgrade_id, update_data)
    
    def cancel_upgrade(self, upgrade_id: int, cancellation_reason: str) -> Dict[str, Any]:
        """
        업그레이드 취소
        
        Args:
            upgrade_id: 업그레이드 ID
            cancellation_reason: 취소 사유
            
        Returns:
            업데이트된 업그레이드 정보
        """
        upgrade = self.get_by_id(upgrade_id)
        if not upgrade:
            raise ValueError("존재하지 않는 업그레이드 ID입니다.")
        
        if upgrade.get('status') in ['완료', '취소']:
            raise ValueError("이미 완료되었거나 취소된 업그레이드입니다.")
        
        update_data = {
            'status': '취소',
            'notes': f"{upgrade.get('notes', '')} | 취소: {cancellation_reason}".strip(' |')
        }
        
        return self.update(upgrade_id, update_data)
    
    def reschedule_upgrade(self, upgrade_id: int, new_planned_date: str, reason: str = "") -> Dict[str, Any]:
        """
        업그레이드 일정 변경
        
        Args:
            upgrade_id: 업그레이드 ID
            new_planned_date: 새로운 계획 날짜
            reason: 일정 변경 사유
            
        Returns:
            업데이트된 업그레이드 정보
        """
        upgrade = self.get_by_id(upgrade_id)
        if not upgrade:
            raise ValueError("존재하지 않는 업그레이드 ID입니다.")
        
        if upgrade.get('status') not in ['계획됨', '진행중']:
            raise ValueError("계획된 또는 진행 중인 업그레이드만 일정을 변경할 수 있습니다.")
        
        update_data = {
            'planned_date': new_planned_date,
            'notes': f"{upgrade.get('notes', '')} | 일정변경: {reason}".strip(' |')
        }
        
        return self.update(upgrade_id, update_data) 