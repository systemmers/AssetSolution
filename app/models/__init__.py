"""
데이터베이스 모델 패키지
렌더링 우선 구현을 위해 DB 관련 코드는 주석 처리되어 있습니다.
"""
# 데이터베이스 모델은 템플릿 구현 후 마지막에 활성화됩니다
# from ..extensions import db

# # 모든 모델을 여기서 import하여 다른 모듈에서 쉽게 접근할 수 있도록 합니다.
# from .user import User, Role, Department
# from .asset import Asset, AssetType, AssetStatus, Location, DepreciationMethod
# from .asset import AssetHistory, AssetLoan, MaintenanceRecord, RepairRecord, Document

# 모델 클래스가 사용 가능할 때 활성화할 가상의 모델 목록
__all__ = [
    # 'User', 'Role', 'Department',
    # 'Asset', 'AssetType', 'AssetStatus', 'Location', 'DepreciationMethod',
    # 'AssetHistory', 'AssetLoan', 'MaintenanceRecord', 'RepairRecord', 'Document'
] 