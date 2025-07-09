"""
Operation History Repository 모듈
운영 이력 관리를 담당하는 Repository 클래스입니다.

Classes:
    - OperationHistoryRepository: 운영 이력 데이터 접근 계층
"""

from datetime import datetime, timedelta
from typing import List, Dict, Optional
import random
from ..base_repository import BaseRepository


class OperationHistoryRepository(BaseRepository):
    """운영 이력 Repository 클래스"""
    
    def __init__(self):
        """OperationHistoryRepository 초기화"""
        super().__init__()
        self._data = self._load_sample_data()
    
    def _load_sample_data(self) -> List[Dict]:
        """
        샘플 운영 이력 데이터 로드 (BaseRepository 추상 메서드 구현)
        
        Returns:
            운영 이력 샘플 데이터
        """
        return self._generate_operation_history_data()
    
    def _validate_data(self, data: Dict) -> bool:
        """
        데이터 유효성 검증 (BaseRepository 추상 메서드 구현)
        
        Args:
            data: 검증할 데이터
            
        Returns:
            유효성 검증 결과
        """
        required_fields = ['id', 'asset_id', 'operation_type', 'user_name', 'operation_date']
        return all(field in data for field in required_fields)
    
    def _generate_operation_history_data(self) -> List[Dict]:
        """운영 이력 Mock 데이터 생성"""
        operation_types = ['대여', '반납', '지급', '반납', '폐기', '수리', '이동', '점검']
        users = ['김영호', '이수진', '박민수', '정하늘', '최원영', '한지민', '김태현', '이경미']
        departments = ['개발팀', '마케팅팀', '영업팀', '인사팀', '재무팀']
        statuses = ['진행중', '완료', '대기', '취소']
        
        history_data = []
        
        for i in range(100):  # 100개의 이력 데이터 생성
            operation_date = datetime.now() - timedelta(days=random.randint(1, 365))
            completion_date = None
            status = random.choice(statuses)
            
            if status == '완료':
                completion_date = operation_date + timedelta(hours=random.randint(1, 48))
            
            history = {
                'id': f'HIST-{str(i+1).zfill(3)}',
                'asset_id': f'AS-{random.randint(1000, 9999)}',
                'asset_name': f'자산명 {i+1}',
                'operation_type': random.choice(operation_types),
                'user_name': random.choice(users),
                'department': random.choice(departments),
                'operation_date': operation_date,
                'completion_date': completion_date,
                'status': status,
                'description': f'{random.choice(operation_types)} 작업 - {i+1}번째 이력',
                'notes': f'작업 메모 {i+1}' if random.random() > 0.5 else None,
                'created_at': operation_date
            }
            
            history_data.append(history)
        
        # 최신순으로 정렬
        history_data.sort(key=lambda x: x['operation_date'], reverse=True)
        
        return history_data
    
    def get_operation_history(self, asset_id: str = None, user_name: str = None, 
                            operation_type: str = None, status: str = None,
                            start_date: str = None, end_date: str = None) -> List[Dict]:
        """
        운영 이력 조회 (필터링 지원)
        
        Args:
            asset_id: 자산 ID 필터
            user_name: 사용자명 필터
            operation_type: 운영 유형 필터
            status: 상태 필터
            start_date: 시작 날짜 필터
            end_date: 종료 날짜 필터
            
        Returns:
            필터링된 운영 이력 목록
        """
        history_data = self._data.copy()
        
        # 필터링 적용
        if asset_id:
            history_data = [h for h in history_data if asset_id.lower() in h['asset_id'].lower()]
        
        if user_name:
            history_data = [h for h in history_data if user_name.lower() in h['user_name'].lower()]
        
        if operation_type:
            history_data = [h for h in history_data if operation_type == h['operation_type']]
        
        if status:
            history_data = [h for h in history_data if status == h['status']]
        
        if start_date:
            try:
                start_dt = datetime.strptime(start_date, '%Y-%m-%d')
                history_data = [h for h in history_data if h['operation_date'].date() >= start_dt.date()]
            except ValueError:
                pass
        
        if end_date:
            try:
                end_dt = datetime.strptime(end_date, '%Y-%m-%d')
                history_data = [h for h in history_data if h['operation_date'].date() <= end_dt.date()]
            except ValueError:
                pass
        
        return history_data
    
    def get_history_detail_by_id(self, history_id: str) -> Optional[Dict]:
        """
        이력 ID로 상세 정보 조회
        
        Args:
            history_id: 이력 ID
            
        Returns:
            이력 상세 정보 또는 None
        """
        for history in self._data:
            if history['id'] == history_id:
                # 상세 정보 추가
                detail = history.copy()
                detail.update({
                    'duration_hours': self._calculate_duration(history),
                    'related_documents': self._get_related_documents(history_id),
                    'approval_info': self._get_approval_info(history_id),
                    'cost_info': self._get_cost_info(history_id)
                })
                return detail
        
        return None
    
    def get_history_statistics(self, history_records: List[Dict] = None) -> Dict:
        """
        운영 이력 통계 생성
        
        Args:
            history_records: 통계 대상 이력 목록 (None시 전체 데이터 사용)
            
        Returns:
            통계 정보
        """
        if history_records is None:
            history_records = self._data
        
        # 기본 통계
        total_records = len(history_records)
        
        # 운영 유형별 통계
        type_stats = {}
        for record in history_records:
            op_type = record['operation_type']
            type_stats[op_type] = type_stats.get(op_type, 0) + 1
        
        # 상태별 통계
        status_stats = {}
        for record in history_records:
            status = record['status']
            status_stats[status] = status_stats.get(status, 0) + 1
        
        # 부서별 통계
        dept_stats = {}
        for record in history_records:
            dept = record['department']
            dept_stats[dept] = dept_stats.get(dept, 0) + 1
        
        # 월별 통계 (최근 12개월)
        monthly_stats = self._get_monthly_statistics(history_records)
        
        # 평균 처리 시간
        avg_duration = self._calculate_average_duration(history_records)
        
        return {
            'total_records': total_records,
            'by_operation_type': type_stats,
            'by_status': status_stats,
            'by_department': dept_stats,
            'monthly_data': monthly_stats,
            'average_duration_hours': avg_duration,
            'completion_rate': round((status_stats.get('완료', 0) / total_records * 100), 2) if total_records > 0 else 0
        }
    
    def _calculate_duration(self, history: Dict) -> Optional[float]:
        """작업 소요 시간 계산"""
        if history.get('completion_date') and history.get('operation_date'):
            delta = history['completion_date'] - history['operation_date']
            return round(delta.total_seconds() / 3600, 2)  # 시간 단위
        return None
    
    def _get_related_documents(self, history_id: str) -> List[Dict]:
        """관련 문서 목록 (Mock 데이터)"""
        return [
            {'type': '신청서', 'name': f'{history_id}_신청서.pdf'},
            {'type': '승인서', 'name': f'{history_id}_승인서.pdf'}
        ]
    
    def _get_approval_info(self, history_id: str) -> Dict:
        """승인 정보 (Mock 데이터)"""
        return {
            'approver': '김관리자',
            'approved_date': datetime.now() - timedelta(days=random.randint(1, 30)),
            'approval_status': '승인완료'
        }
    
    def _get_cost_info(self, history_id: str) -> Dict:
        """비용 정보 (Mock 데이터)"""
        return {
            'material_cost': random.randint(10000, 100000),
            'labor_cost': random.randint(20000, 80000),
            'total_cost': random.randint(30000, 180000)
        }
    
    def _get_monthly_statistics(self, history_records: List[Dict]) -> List[Dict]:
        """월별 통계 데이터 생성"""
        monthly_data = {}
        
        for record in history_records:
            month_key = record['operation_date'].strftime('%Y-%m')
            if month_key not in monthly_data:
                monthly_data[month_key] = 0
            monthly_data[month_key] += 1
        
        # 최근 12개월 데이터로 제한
        sorted_months = sorted(monthly_data.keys(), reverse=True)[:12]
        
        return [
            {'month': month, 'count': monthly_data[month]}
            for month in reversed(sorted_months)
        ]
    
    def _calculate_average_duration(self, history_records: List[Dict]) -> float:
        """평균 처리 시간 계산"""
        durations = []
        
        for record in history_records:
            duration = self._calculate_duration(record)
            if duration is not None:
                durations.append(duration)
        
        if durations:
            return round(sum(durations) / len(durations), 2)
        return 0.0
    
    def get_recent_operations(self, limit: int = 10) -> List[Dict]:
        """최근 운영 이력 조회"""
        return self._data[:limit]
    
    def get_operations_by_asset(self, asset_id: str) -> List[Dict]:
        """자산별 운영 이력 조회"""
        return [h for h in self._data if h['asset_id'] == asset_id]
    
    def get_operations_by_user(self, user_name: str) -> List[Dict]:
        """사용자별 운영 이력 조회"""
        return [h for h in self._data if h['user_name'] == user_name]
    
    def get_pending_operations(self) -> List[Dict]:
        """대기중인 운영 작업 조회"""
        return [h for h in self._data if h['status'] in ['진행중', '대기']] 