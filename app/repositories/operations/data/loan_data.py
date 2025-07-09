"""
대여 관련 Mock 데이터 관리
싱글톤 패턴을 적용하여 메모리 효율성 확보

Classes:
    - LoanData: 대여 관련 Mock 데이터 관리 (싱글톤)
"""
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta


class LoanData:
    """
    대여 관련 Mock 데이터 관리 (싱글톤)
    
    애플리케이션 생명주기 동안 일관된 대여 데이터를 제공합니다.
    DB 전환 시 이 클래스는 제거 예정입니다.
    기존 operations_repository.py와 100% 호환되도록 구조 수정됨.
    """
    
    _instance = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not LoanData._initialized:
            self._initialize_data()
            LoanData._initialized = True
    
    def _initialize_data(self):
        """초기 데이터 설정 - 기존 operations_repository.py와 동일한 구조"""
        self._loans = [
            {
                "id": 1,
                "asset_id": 1,
                "asset_number": "AST-001",
                "asset_name": "Dell 노트북",
                "user_id": 1,
                "user_name": "김철수",
                "department": "IT개발팀",
                "loan_date": datetime.strptime("2024-12-01", "%Y-%m-%d").date(),
                "expected_return_date": datetime.strptime("2024-12-31", "%Y-%m-%d").date(),
                "actual_return_date": None,
                "status_id": 3,
                "status": "대여중",
                "remarks": "개발 업무용",
                "created_by": 1,
                "created_at": datetime.strptime("2024-11-30 09:00:00", "%Y-%m-%d %H:%M:%S")
            },
            {
                "id": 2,
                "asset_id": 2,
                "asset_number": "AST-005",
                "asset_name": "HP 프린터",
                "user_id": 3,
                "user_name": "이영희",
                "department": "총무팀",
                "loan_date": datetime.strptime("2024-11-20", "%Y-%m-%d").date(),
                "expected_return_date": datetime.strptime("2024-12-20", "%Y-%m-%d").date(),
                "actual_return_date": datetime.strptime("2024-12-18", "%Y-%m-%d").date(),
                "status_id": 4,
                "status": "반납 완료",
                "remarks": "사무실 출력 업무",
                "created_by": 1,
                "created_at": datetime.strptime("2024-11-19 14:30:00", "%Y-%m-%d %H:%M:%S")
            },
            {
                "id": 3,
                "asset_id": 3,
                "asset_number": "AST-012",
                "asset_name": "무선 마우스",
                "user_id": 5,
                "user_name": "박민수",
                "department": "기획팀",
                "loan_date": datetime.strptime("2024-12-10", "%Y-%m-%d").date(),
                "expected_return_date": datetime.strptime("2024-12-20", "%Y-%m-%d").date(),
                "actual_return_date": None,
                "status_id": 5,
                "status": "반납 지연",
                "remarks": "업무용 마우스 대여",
                "created_by": 2,
                "created_at": datetime.strptime("2024-12-09 11:15:00", "%Y-%m-%d %H:%M:%S")
            },
            {
                "id": 4,
                "asset_id": 4,
                "asset_number": "AST-007",
                "asset_name": "삼성 모니터",
                "user_id": 6,
                "user_name": "최지영",
                "department": "디자인팀",
                "loan_date": datetime.strptime("2024-12-15", "%Y-%m-%d").date(),
                "expected_return_date": datetime.strptime("2025-01-15", "%Y-%m-%d").date(),
                "actual_return_date": None,
                "status_id": 3,
                "status": "대여중",
                "remarks": "디자인 작업용 모니터",
                "created_by": 1,
                "created_at": datetime.strptime("2024-12-14 16:20:00", "%Y-%m-%d %H:%M:%S")
            },
            {
                "id": 5,
                "asset_id": 5,
                "asset_number": "AST-018",
                "asset_name": "웹캠",
                "user_id": 7,
                "user_name": "정민호",
                "department": "영업팀",
                "loan_date": datetime.strptime("2024-12-08", "%Y-%m-%d").date(),
                "expected_return_date": datetime.strptime("2024-12-15", "%Y-%m-%d").date(),
                "actual_return_date": datetime.strptime("2024-12-14", "%Y-%m-%d").date(),
                "status_id": 4,
                "status": "반납 완료",
                "remarks": "화상회의용",
                "created_by": 2,
                "created_at": datetime.strptime("2024-12-07 10:45:00", "%Y-%m-%d %H:%M:%S")
            }
        ]
        
        self._loan_statistics = {
            "total_loans": 156,
            "active_loans": 89,
            "overdue_loans": 12,
            "returned_loans": 67,
            "monthly_loan_count": 23,
            "most_loaned_category": "노트북",
            "average_loan_duration": 18.5,
            "top_departments": [
                {"department": "IT개발팀", "count": 45},
                {"department": "디자인팀", "count": 32},
                {"department": "영업팀", "count": 28}
            ]
        }
    
    def reset_for_testing(self):
        """테스트용 데이터 리셋"""
        self._loans = []
        self._loan_statistics = {}
        LoanData._initialized = False
        self._initialize_data()
    
    # ==================== 기존 호환 메서드 ====================
    
    def get_all_loans(self, status: str = None, user_id: int = None, 
                     department: str = None) -> List[Dict[str, Any]]:
        """모든 대여 목록 조회 - 기존 operations_repository.py와 동일한 시그니처"""
        loans = self._loans.copy()
        
        # 필터 적용
        if status:
            loans = [loan for loan in loans if loan.get("status") == status]
        if user_id:
            loans = [loan for loan in loans if loan.get("user_id") == user_id]
        if department:
            loans = [loan for loan in loans if loan.get("department") == department]
            
        return loans
    
    def get_loan_by_id(self, loan_id: int) -> Optional[Dict[str, Any]]:
        """ID로 대여 조회"""
        return next((loan for loan in self._loans if loan["id"] == loan_id), None)
    
    def get_loans_with_pagination(self, page: int = 1, per_page: int = 10, 
                                 status: str = None, user_id: int = None, 
                                 department: str = None) -> Tuple[List[Dict], int, int, int]:
        """페이지네이션이 적용된 대여 목록 조회 - 기존과 동일한 Tuple 반환"""
        # 필터 적용
        filtered_loans = self.get_all_loans(status, user_id, department)
        
        # 페이지네이션 계산
        total_items = len(filtered_loans)
        total_pages = (total_items + per_page - 1) // per_page if total_items > 0 else 1
        start_index = (page - 1) * per_page
        end_index = start_index + per_page
        
        loans = filtered_loans[start_index:end_index]
        
        return loans, page, total_pages, total_items
    
    def get_returned_loans(self) -> List[Dict[str, Any]]:
        """반납 완료된 대여 목록 조회"""
        return [loan for loan in self._loans if loan.get("status") == "반납 완료"]
    
    def add_loan(self, loan_data: Dict[str, Any]) -> Dict[str, Any]:
        """새 대여 추가"""
        new_id = max(loan["id"] for loan in self._loans) + 1 if self._loans else 1
        loan_data["id"] = new_id
        loan_data["created_at"] = datetime.now()
        self._loans.append(loan_data)
        return loan_data
    
    def update_loan(self, loan_id: int, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """대여 정보 업데이트"""
        for i, loan in enumerate(self._loans):
            if loan["id"] == loan_id:
                updated_loan = loan.copy()
                updated_loan.update(update_data)
                self._loans[i] = updated_loan
                return updated_loan
        return None
    
    def delete_loan(self, loan_id: int) -> bool:
        """대여 삭제"""
        for i, loan in enumerate(self._loans):
            if loan["id"] == loan_id:
                del self._loans[i]
                return True
        return False
    
    def get_loan_statistics(self) -> Dict[str, Any]:
        """대여 통계 조회"""
        return self._loan_statistics.copy()
    
    # ==================== 추가 유틸리티 메서드 ====================
    
    def get_loans_by_status(self, status: str) -> List[Dict[str, Any]]:
        """상태별 대여 목록 조회"""
        return [loan for loan in self._loans if loan.get("status") == status]
    
    def get_loans_by_user(self, user_id: int) -> List[Dict[str, Any]]:
        """사용자별 대여 목록 조회"""
        return [loan for loan in self._loans if loan.get("user_id") == user_id]
    
    def get_loans_by_asset(self, asset_id: int) -> List[Dict[str, Any]]:
        """자산별 대여 이력 조회"""
        return [loan for loan in self._loans if loan.get("asset_id") == asset_id]
    
    def get_loans_by_department(self, department: str) -> List[Dict[str, Any]]:
        """부서별 대여 목록 조회 - 기존 필드명 사용"""
        return [loan for loan in self._loans if loan.get("department") == department]
    
    def get_loans_by_date_range(self, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        """날짜 범위별 대여 목록 조회"""
        results = []
        for loan in self._loans:
            loan_date = loan.get("loan_date")
            if loan_date and isinstance(loan_date, datetime.date):
                loan_date_str = loan_date.strftime("%Y-%m-%d")
                if start_date <= loan_date_str <= end_date:
                    results.append(loan)
        return results
    
    def get_overdue_loans(self) -> List[Dict[str, Any]]:
        """연체된 대여 목록 조회"""
        today = datetime.now().date()
        overdue_loans = []
        
        for loan in self._loans:
            if loan.get("status_id") == 3 and loan.get("expected_return_date"):  # 대여중 상태
                expected_date = loan["expected_return_date"]
                if isinstance(expected_date, datetime.date) and expected_date < today:
                    loan_copy = loan.copy()
                    loan_copy["overdue_days"] = (today - expected_date).days
                    overdue_loans.append(loan_copy)
        
        return overdue_loans
    
    def search_loans(self, keyword: str) -> List[Dict[str, Any]]:
        """키워드로 대여 검색"""
        if not keyword:
            return self._loans.copy()
        
        keyword_lower = keyword.lower()
        results = []
        
        for loan in self._loans:
            # 자산명, 사용자명, 부서, 비고에서 검색
            searchable_fields = [
                loan.get("asset_name", ""),
                loan.get("user_name", ""),
                loan.get("department", ""),
                loan.get("remarks", ""),
                loan.get("asset_number", "")
            ]
            
            if any(keyword_lower in str(field).lower() for field in searchable_fields):
                results.append(loan)
        
        return results 