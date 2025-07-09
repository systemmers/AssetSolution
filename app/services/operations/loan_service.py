"""
대여 관리 서비스 모듈
자산 대여 관련 핵심 비즈니스 로직 처리

Classes:
    - LoanService: 대여 신청, 조회, 관리 등 대여 관련 서비스 로직
"""
from typing import List, Dict, Optional, Tuple, Any
from datetime import datetime, date


class LoanService:
    """
    자산 대여 관리 서비스 클래스
    Repository와 Controller 사이의 대여 관련 비즈니스 로직 계층
    """
    
    def __init__(self):
        """Service 초기화 및 Repository 의존성 주입"""
        from ...repositories import operations_repository, asset_repository
        self.operations_repo = operations_repository
        self.asset_repo = asset_repository
    
    def get_loan_list_with_filters(self, page: int = 1, per_page: int = 10, 
                                  status: str = None, user_id: str = None, 
                                  department: str = None) -> Dict:
        """
        필터링과 페이지네이션을 적용한 대여 목록 조회
        
        Args:
            page: 페이지 번호
            per_page: 페이지당 항목 수
            status: 대여 상태 필터
            user_id: 사용자 ID 필터 (문자열)
            department: 부서 필터
            
        Returns:
            대여 목록과 페이지네이션 정보가 포함된 딕셔너리
        """
        # 사용자 ID 변환 처리
        user_id_int = None
        if user_id:
            try:
                user_id_int = int(user_id)
            except (ValueError, TypeError):
                user_id_int = None
        
        # Repository에서 데이터 조회
        loans, current_page, total_pages, total_items = self.operations_repo.get_loans_with_pagination(
            page=page,
            per_page=per_page,
            status=status if status else None,
            user_id=user_id_int,
            department=department if department else None
        )
        
        # 비즈니스 로직: 연체 상태 확인 및 업데이트
        current_date = datetime.utcnow().date()
        for loan in loans:
            if (loan['status_id'] == 3 and  # 대여중인 상태
                loan['expected_return_date'] and 
                loan['expected_return_date'] < current_date):
                loan['is_overdue'] = True
                loan['overdue_days'] = (current_date - loan['expected_return_date']).days
            else:
                loan['is_overdue'] = False
                loan['overdue_days'] = 0
        
        return {
            'loans': loans,
            'pagination': {
                'current_page': current_page,
                'total_pages': total_pages,
                'total_items': total_items,
                'per_page': per_page,
                'has_prev': current_page > 1,
                'has_next': current_page < total_pages
            },
            'current_date': current_date
        }
    
    def get_loan_detail(self, loan_id: int) -> Optional[Dict]:
        """
        대여 상세 정보 조회 (비즈니스 로직 적용)
        
        Args:
            loan_id: 대여 ID
            
        Returns:
            대여 상세 정보 또는 None
        """
        loan = self.operations_repo.get_loan_by_id(loan_id)
        
        if loan:
            # 비즈니스 로직: 추가 정보 계산
            current_date = datetime.utcnow().date()
            
            # 연체 정보 계산
            if (loan['status_id'] == 3 and  # 대여중
                loan['expected_return_date'] and 
                loan['expected_return_date'] < current_date):
                loan['is_overdue'] = True
                loan['overdue_days'] = (current_date - loan['expected_return_date']).days
            else:
                loan['is_overdue'] = False
                loan['overdue_days'] = 0
            
            # 대여 기간 계산
            if loan['loan_date']:
                if loan['actual_return_date']:
                    loan['actual_loan_period'] = (loan['actual_return_date'] - loan['loan_date']).days
                else:
                    loan['current_loan_period'] = (current_date - loan['loan_date']).days
                
                if loan['expected_return_date']:
                    loan['expected_loan_period'] = (loan['expected_return_date'] - loan['loan_date']).days
        
        return loan
    
    def validate_loan_request(self, asset_id: int, user_id: int, 
                             expected_return_date: date) -> Tuple[bool, str]:
        """
        대여 신청 유효성 검증
        
        Args:
            asset_id: 자산 ID
            user_id: 사용자 ID
            expected_return_date: 예상 반납일
            
        Returns:
            (유효성 여부, 메시지)
        """
        # 날짜 유효성 검증
        if expected_return_date <= datetime.utcnow().date():
            return False, "반납 예정일은 오늘보다 이후여야 합니다"
        
        # 자산 중복 대여 검증
        active_loans = [l for l in self.operations_repo.loans 
                       if l['asset_id'] == asset_id and l['status_id'] == 3]
        if active_loans:
            return False, "해당 자산은 이미 대여중입니다"
        
        # 사용자 대여 한도 검증 (1인 최대 5개)
        user_active_loans = [l for l in self.operations_repo.loans 
                           if l['user_id'] == user_id and l['status_id'] == 3]
        if len(user_active_loans) >= 5:
            return False, "사용자당 최대 5개까지 대여가능합니다."
        
        return True, "대여가능합니다."
    
    def get_loans_data(self, status: str = None, department: str = None, 
                      user_name: str = None, page: int = 1, per_page: int = 10) -> Dict[str, Any]:
        """
        대여 데이터 조회 (필터링 및 페이징 지원)
        
        Args:
            status: 대여 상태 필터
            department: 부서 필터
            user_name: 사용자명 필터
            page: 페이지 번호
            per_page: 페이지당 항목 수
            
        Returns:
            대여 데이터와 페이지네이션 정보
        """
        try:
            # Repository에서 데이터 조회
            loans_data = self.operations_repo.get_loans_data(
                status=status,
                department=department,
                user_name=user_name,
                page=page,
                per_page=per_page
            )
            
            # 비즈니스 로직: 연체 정보 추가
            current_date = datetime.utcnow().date()
            for loan in loans_data.get('loans', []):
                if (loan.get('status') == '대여중' and 
                    loan.get('expected_return_date') and 
                    loan['expected_return_date'] < current_date):
                    loan['is_overdue'] = True
                    loan['overdue_days'] = (current_date - loan['expected_return_date']).days
                else:
                    loan['is_overdue'] = False
                    loan['overdue_days'] = 0
            
            return loans_data
            
        except Exception as e:
            print(f"대여 데이터 조회 오류: {e}")
            return {
                'loans': [],
                'pagination': {
                    'current_page': 1,
                    'total_pages': 0,
                    'total_items': 0,
                    'per_page': per_page,
                    'has_prev': False,
                    'has_next': False
                }
            }
    
    def get_loan_statistics(self) -> Dict[str, Any]:
        """
        대여 통계 정보 조회
        
        Returns:
            대여 관련 통계 정보
        """
        try:
            # Repository에서 통계 데이터 조회
            stats = self.operations_repo.get_loan_statistics()
            
            # 비즈니스 로직: 추가 통계 계산
            current_date = datetime.utcnow().date()
            
            # 연체 대여 계산
            overdue_loans = [l for l in self.operations_repo.loans 
                           if (l['status_id'] == 3 and 
                               l['expected_return_date'] and 
                               l['expected_return_date'] < current_date)]
            
            stats['overdue_count'] = len(overdue_loans)
            stats['overdue_rate'] = (
                len(overdue_loans) / stats.get('active_loans', 1) * 100 
                if stats.get('active_loans', 0) > 0 else 0
            )
            
            # 월별 대여 추이 계산
            stats['monthly_trends'] = self._calculate_monthly_loan_trends()
            
            return stats
            
        except Exception as e:
            print(f"대여 통계 조회 오류: {e}")
            return {
                'total_loans': 0,
                'active_loans': 0,
                'returned_loans': 0,
                'overdue_count': 0,
                'overdue_rate': 0,
                'monthly_trends': []
            }
    
    def get_active_loans_data(self, asset_code: str = None, asset_name: str = None, 
                             borrower: str = None, department: str = None) -> List[Dict[str, Any]]:
        """
        현재 대여중인 자산 데이터 조회
        
        Args:
            asset_code: 자산 코드 필터
            asset_name: 자산명 필터
            borrower: 대여자 필터
            department: 부서 필터
            
        Returns:
            대여중인 자산 목록
        """
        try:
            # Repository에서 활성 대여 데이터 조회
            active_loans = self.operations_repo.get_active_loans_data(
                asset_code=asset_code,
                asset_name=asset_name,
                borrower=borrower,
                department=department
            )
            
            # 비즈니스 로직: 연체 및 기간 정보 추가
            current_date = datetime.utcnow().date()
            for loan in active_loans:
                # 연체 정보
                if (loan.get('expected_return_date') and 
                    loan['expected_return_date'] < current_date):
                    loan['is_overdue'] = True
                    loan['overdue_days'] = (current_date - loan['expected_return_date']).days
                else:
                    loan['is_overdue'] = False
                    loan['overdue_days'] = 0
                
                # 대여 기간
                if loan.get('loan_date'):
                    loan['loan_period'] = (current_date - loan['loan_date']).days
            
            return active_loans
            
        except Exception as e:
            print(f"활성 대여 데이터 조회 오류: {e}")
            return []
    
    def get_loan_status_options(self) -> List[Dict]:
        """대여 상태 옵션 조회"""
        return [
            {'id': 1, 'name': '신청'},
            {'id': 2, 'name': '승인'},
            {'id': 3, 'name': '대여중'},
            {'id': 4, 'name': '반납완료'},
            {'id': 5, 'name': '거부'}
        ]
    
    def _calculate_monthly_loan_trends(self) -> List[Dict]:
        """월별 대여 추이 계산"""
        try:
            # 실제 구현에서는 데이터베이스에서 월별 데이터 집계
            # 현재는 모의 데이터 반환
            return [
                {'month': '2024-10', 'loans': 45, 'returns': 42},
                {'month': '2024-11', 'loans': 52, 'returns': 48},
                {'month': '2024-12', 'loans': 38, 'returns': 35}
            ]
        except Exception as e:
            print(f"월별 대여 추이 계산 오류: {e}")
            return [] 