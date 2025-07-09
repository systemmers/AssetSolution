"""
Repositories Package
데이터 접근 계층(Data Access Layer) 모듈들을 포함하는 패키지

이 패키지는 Repository 패턴을 구현하여 데이터 소스에 대한 추상화를 제공합니다.
"""

from .asset.asset_repository import AssetRepository
from .contract.contract_repository import ContractRepository
from .inventory.inventory_repository import InventoryRepository
from .operations.operations_repository import OperationsRepository
from .category.category_repository import CategoryRepository
from .preset.preset_repository import PresetRepository
from .notification.notification_repository import NotificationRepository

# Repository 인스턴스 (싱글톤 패턴)
from .asset.asset_repository import asset_repository
from .contract.contract_repository import contract_repository
from .inventory.inventory_repository import inventory_repository
from .operations.operations_repository import operations_repository
from .category.category_repository import category_repository
from .preset.preset_repository import preset_repository
from .notification.notification_repository import notification_repository

__all__ = [
    'AssetRepository',
    'ContractRepository', 
    'InventoryRepository',
    'OperationsRepository',
    'CategoryRepository',
    'PresetRepository',
    'NotificationRepository',
    'asset_repository',
    'contract_repository',
    'inventory_repository',
    'operations_repository',
    'category_repository',
    'preset_repository',
    'notification_repository'
]
