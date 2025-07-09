"""
OperationsHistoryService - 자산 운영 이력 서비스
자산 운영 이력의 조회, 검색, 필터링 등을 담당
"""
from typing import List, Dict, Optional
from datetime import datetime
from ...repositories.operations.operations_repository import operations_repository


class OperationsHistoryService:
    """
    자산 운영 이력 관리 서비스 클래스
    """
    
    def __init__(self):
        """Service 초기화 및 Repository 의존성 주입"""
        self.operations_repo = operations_repository
    
    def get_operation_history(self, asset_id: str = None, user_name: str = None, 
                             operation_type: str = None, status: str = None,
                             start_date: str = None, end_date: str = None) -> Dict:
        """
        자산 운영 이력 종합 조회
        
        Args:
            asset_id: 자산 ID 필터
            user_name: 사용자명 필터
            operation_type: 작업 유형 필터
            status: 상태 필터
            start_date: 시작일 필터
            end_date: 종료일 필터
            
        Returns:
            이력 레코드와 통계 정보
        """
        # Repository를 통한 이력 데이터 조회
        history_records = self.operations_repo.get_operation_history(
            asset_id=asset_id,
            user_name=user_name,
            operation_type=operation_type,
            status=status,
            start_date=start_date,
            end_date=end_date
        )
        
        # Repository를 통한 통계 계산
        stats = self.operations_repo.get_history_statistics(history_records)
        
        return {
            'records': history_records,
            'stats': stats
        }

    def get_history_detail(self, history_id: str) -> Optional[Dict]:
        """
        특정 자산 운영 이력의 상세 정보 조회
        
        Args:
            history_id: 조회할 이력의 ID
            
        Returns:
            이력 상세 정보 딕셔너리 또는 None
        """
        # Repository를 통해 특정 이력 상세 데이터 조회
        return self.operations_repo.get_history_detail_by_id(history_id)
    
    def get_history_by_asset(self, asset_id: str) -> List[Dict]:
        """
        특정 자산의 모든 운영 이력 조회
        
        Args:
            asset_id: 자산 ID
            
        Returns:
            해당 자산의 이력 목록
        """
        return self.operations_repo.get_operation_history(asset_id=asset_id)
    
    def get_history_by_user(self, user_name: str) -> List[Dict]:
        """
        특정 사용자의 모든 운영 이력 조회
        
        Args:
            user_name: 사용자명
            
        Returns:
            해당 사용자의 이력 목록
        """
        return self.operations_repo.get_operation_history(user_name=user_name)
    
    def get_recent_history(self, limit: int = 10) -> List[Dict]:
        """
        최근 운영 이력 조회
        
        Args:
            limit: 조회할 이력 개수
            
        Returns:
            최근 이력 목록
        """
        all_history = self.operations_repo.get_operation_history()
        # 최신순으로 정렬하여 제한된 개수만 반환
        return sorted(all_history, key=lambda x: x.get('date', ''), reverse=True)[:limit]
    
    def search_history(self, search_term: str) -> List[Dict]:
        """
        키워드를 통한 이력 검색
        
        Args:
            search_term: 검색어
            
        Returns:
            검색 결과 이력 목록
        """
        all_history = self.operations_repo.get_operation_history()
        
        if not search_term:
            return all_history
        
        search_term_lower = search_term.lower()
        filtered_history = []
        
        for record in all_history:
            # 여러 필드에서 검색어 확인
            search_fields = ['asset_id', 'user_name', 'operation_type', 'description']
            for field in search_fields:
                field_value = str(record.get(field, '')).lower()
                if search_term_lower in field_value:
                    filtered_history.append(record)
                    break
        
        return filtered_history
    
    def get_history_statistics(self, history_records: List[Dict] = None) -> Dict:
        """
        이력 통계 정보 조회
        
        Args:
            history_records: 통계를 계산할 이력 레코드 (None이면 전체)
            
        Returns:
            통계 정보
        """
        if history_records is None:
            history_records = self.operations_repo.get_operation_history()
        
        return self.operations_repo.get_history_statistics(history_records)


# 싱글톤 인스턴스 생성
operations_history_service = OperationsHistoryService() 