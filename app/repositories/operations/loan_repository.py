"""
대여 도메인 Repository
기존 operations_repository.py와 100% 호환되는 대여 관리 로직

Classes:
    - LoanRepository: 대여 도메인 Repository
"""
from typing import List, Dict, Any, Optional, Tuple
from .data.loan_data import LoanData


class LoanRepository:
    """
    대여 도메인 Repository
    
    기존 operations_repository.py와 100% 호환성을 유지하면서
    대여 관련 비즈니스 로직을 담당합니다.
    """
    
    def __init__(self):
        """Repository 초기화 및 싱글톤 데이터 소스 연결"""
        self.data_source = LoanData()
        
        # 기존 operations_repository.py 호환성을 위한 속성
        self.loans = self.data_source._loans
    
    # ==================== 기존 호환 메서드 ====================
    
    def get_all_loans(self, status: str = None, user_id: int = None, 
                     department: str = None) -> List[Dict[str, Any]]:
        """
        모든 대여 목록 조회 (필터링 포함)
        기존 operations_repository.py와 동일한 시그니처
        """
        return self.data_source.get_all_loans(status, user_id, department)
    
    def get_loan_by_id(self, loan_id: int) -> Optional[Dict[str, Any]]:
        """대여 ID로 특정 대여 정보 조회"""
        return self.data_source.get_loan_by_id(loan_id)
    
    def get_loans_with_pagination(self, page: int = 1, per_page: int = 10, 
                                 status: str = None, user_id: int = None, 
                                 department: str = None) -> Tuple[List[Dict], int, int, int]:
        """
        페이지네이션을 포함한 대여 목록 조회
        기존과 동일한 Tuple 반환: (loans, page, total_pages, total_items)
        """
        return self.data_source.get_loans_with_pagination(page, per_page, status, user_id, department)
    
    def get_returned_loans(self) -> List[Dict[str, Any]]:
        """반납 완료된 대여 목록 조회"""
        return self.data_source.get_returned_loans()
    
    # ==================== 도메인 특화 메서드 ====================
    
    def get_loans_by_status(self, status: str) -> List[Dict[str, Any]]:
        """상태별 대여 목록 조회"""
        return self.data_source.get_loans_by_status(status)
    
    def get_loans_by_user(self, user_id: int) -> List[Dict[str, Any]]:
        """사용자별 대여 목록 조회"""
        return self.data_source.get_loans_by_user(user_id)
    
    def get_loans_by_asset(self, asset_id: int) -> List[Dict[str, Any]]:
        """자산별 대여 이력 조회"""
        return self.data_source.get_loans_by_asset(asset_id)
    
    def get_loans_by_department(self, department: str) -> List[Dict[str, Any]]:
        """부서별 대여 목록 조회"""
        return self.data_source.get_loans_by_department(department)
    
    def get_loans_by_date_range(self, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        """날짜 범위별 대여 목록 조회"""
        return self.data_source.get_loans_by_date_range(start_date, end_date)
    
    def get_overdue_loans(self) -> List[Dict[str, Any]]:
        """연체된 대여 목록 조회"""
        return self.data_source.get_overdue_loans()
    
    def search_loans(self, keyword: str) -> List[Dict[str, Any]]:
        """키워드로 대여 검색"""
        return self.data_source.search_loans(keyword)
    
    # ==================== CRUD 메서드 ====================
    
    def create_loan(self, loan_data: Dict[str, Any]) -> Dict[str, Any]:
        """새 대여 생성"""
        return self.data_source.add_loan(loan_data)
    
    def update_loan(self, loan_id: int, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """대여 정보 업데이트"""
        return self.data_source.update_loan(loan_id, update_data)
    
    def delete_loan(self, loan_id: int) -> bool:
        """대여 삭제"""
        return self.data_source.delete_loan(loan_id)
    
    # ==================== 통계 메서드 ====================
    
    def get_loan_statistics(self) -> Dict[str, Any]:
        """대여 통계 조회"""
        return self.data_source.get_loan_statistics()
    
    def get_statistics(self) -> Dict[str, Any]:
        """통계 정보 조회 (BaseRepository 호환)"""
        return self.get_loan_statistics()
    
    # ==================== BaseRepository 호환 메서드 ====================
    
    def get_all(self) -> List[Dict[str, Any]]:
        """모든 대여 목록 조회 (BaseRepository 인터페이스)"""
        return self.get_all_loans()
    
    def get_by_id(self, item_id: int) -> Optional[Dict[str, Any]]:
        """ID로 대여 조회 (BaseRepository 인터페이스)"""
        return self.get_loan_by_id(item_id)
    
    def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """새 대여 생성 (BaseRepository 인터페이스)"""
        return self.create_loan(data)
    
    def update(self, item_id: int, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """대여 업데이트 (BaseRepository 인터페이스)"""
        return self.update_loan(item_id, data)
    
    def delete(self, item_id: int) -> bool:
        """대여 삭제 (BaseRepository 인터페이스)"""
        return self.delete_loan(item_id) 