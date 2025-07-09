"""
도메인 Repository 모듈 초기화
모든 도메인 Repository 클래스를 중앙에서 관리

Classes:
    - LoanRepository: 대여 도메인 Repository
    - DisposalRepository: 폐기 도메인 Repository  
    - AllocationRepository: 할당 도메인 Repository
    - LifecycleRepository: 생명주기 도메인 Repository
    - UpgradeRepository: 업그레이드 도메인 Repository
"""

from .loan_repository import LoanRepository
from .disposal_repository import DisposalRepository
from .allocation_repository import AllocationRepository
from .lifecycle_repository import LifecycleRepository
from .upgrade_repository import UpgradeRepository

__all__ = [
    'LoanRepository',
    'DisposalRepository', 
    'AllocationRepository',
    'LifecycleRepository',
    'UpgradeRepository'
] 