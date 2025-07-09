"""
Asset 도메인 Mock 데이터 관리 - 핵심 자산 데이터
자산, 자산 유형, 자산 상태 등 핵심 데이터를 관리합니다.

Classes:
    - AssetCoreData: 핵심 자산 Mock 데이터 싱글톤 클래스
"""
from typing import List, Dict, Any
from datetime import datetime


class AssetCoreData:
    """
    핵심 자산 Mock 데이터 싱글톤 클래스
    자산, 자산 유형, 자산 상태 데이터를 관리합니다.
    """
    
    _instance = None
    _data = None
    
    def __new__(cls):
        """싱글톤 패턴 구현"""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        """AssetCoreData 초기화"""
        if self._data is None:
            self._data = self._load_sample_data()
    
    def _load_sample_data(self) -> Dict[str, List[Dict[str, Any]]]:
        """
        샘플 핵심 자산 데이터 로드
        
        Returns:
            핵심 자산 데이터 딕셔너리
        """
        # 자산 유형 데이터
        asset_types = [
            {"id": 1, "code": "HW", "name": "하드웨어", "description": "컴퓨터, 모니터 등의 물리적 장비", "is_active": True},
            {"id": 2, "code": "SW", "name": "소프트웨어", "description": "설치된 프로그램 및 라이센스", "is_active": True},
            {"id": 3, "code": "NW", "name": "네트워크 장비", "description": "라우터, 스위치 등 네트워크 관련 장비", "is_active": True},
        ]
        
        # 자산 상태 데이터
        asset_statuses = [
            {"id": 1, "code": "USE", "name": "사용중", "description": "현재 사용중인 자산", "is_active": True},
            {"id": 2, "code": "RPR", "name": "수리중", "description": "고장으로 수리중인 자산", "is_active": True},
            {"id": 3, "code": "DSP", "name": "폐기예정", "description": "곧 폐기될 예정인 자산", "is_active": True},
        ]
        
        # 자산 데이터
        assets = [
            {
                "id": 1, 
                "asset_number": "A-2023-0001", 
                "name": "노트북 Dell XPS 13", 
                "type_id": 1,
                "type": {"id": 1, "name": "하드웨어"},
                "status_id": 1,
                "status": "in_use",
                "category_id": 1,  # 노트북
                "department_id": 1,
                "department": {"id": 1, "name": "개발팀"},
                "location_id": 1,
                "location_name": "본사 3층",
                "user_id": 2,
                "user_name": "홍길동",
                "purchase_date": datetime.strptime("2023-01-15", "%Y-%m-%d").date(),
                "purchase_price": 1500000,
                "serial_number": "XPS13-2023-ABC123",
                "manufacturer": "Dell",
                "model": "XPS 13",
                "warranty_expiry": "2026-01-15",
                "note": "개발용 노트북",
                "useful_life": 36,
                "current_value": 1200000,
            },
            {
                "id": 2, 
                "asset_number": "A-2023-0002", 
                "name": "모니터 LG 27인치", 
                "type_id": 1,
                "type": {"id": 1, "name": "하드웨어"},
                "status_id": 1,
                "status": "in_use",
                "category_id": 3,  # 모니터
                "department_id": 1,
                "department": {"id": 1, "name": "개발팀"},
                "location_id": 1,
                "location_name": "본사 3층",
                "user_id": 2,
                "user_name": "홍길동",
                "purchase_date": datetime.strptime("2023-02-20", "%Y-%m-%d").date(),
                "purchase_price": 350000,
                "serial_number": "LG27-2023-DEF456",
                "manufacturer": "LG",
                "model": "27GL850",
                "warranty_expiry": "2025-02-20",
                "note": "개발용 모니터",
                "useful_life": 36,
                "current_value": 290000,
            },
            {
                "id": 3, 
                "asset_number": "A-2023-0003", 
                "name": "소프트웨어 라이센스 - MS Office", 
                "type_id": 2,
                "type": {"id": 2, "name": "소프트웨어"},
                "status_id": 1,
                "status": "available",
                "category_id": 7,  # 소프트웨어
                "department_id": 2,
                "department": {"id": 2, "name": "인사팀"},
                "location_id": 2,
                "location_name": "본사 4층",
                "user_id": 3,
                "user_name": "김철수",
                "purchase_date": datetime.strptime("2023-03-15", "%Y-%m-%d").date(),
                "purchase_price": 450000,
                "serial_number": "MS-OFFICE-2023-GHI789",
                "manufacturer": "Microsoft",
                "model": "Office 365",
                "warranty_expiry": "2024-03-15",
                "note": "인사팀 업무용 오피스 라이센스",
                "useful_life": 12,
                "current_value": 350000,
            },
            {
                "id": 4, 
                "asset_number": "A-2023-0004", 
                "name": "MacBook Pro 16", 
                "type_id": 1,
                "type": {"id": 1, "name": "하드웨어"},
                "status_id": 1,
                "status": "in_use",
                "category_id": 1,  # 노트북
                "department_id": 5,
                "department": {"id": 5, "name": "영업팀"},
                "location_id": 1,
                "location_name": "본사 3층",
                "user_id": 3,
                "user_name": "김철수",
                "purchase_date": datetime.strptime("2023-04-10", "%Y-%m-%d").date(),
                "purchase_price": 2800000,
                "serial_number": "MBP16-2023-JKL012",
                "manufacturer": "Apple",
                "model": "MacBook Pro 16",
                "warranty_expiry": "2025-04-10",
                "note": "영업팀 프레젠테이션용",
                "useful_life": 36,
                "current_value": 2500000,
            },
            {
                "id": 5, 
                "asset_number": "A-2023-0005", 
                "name": "Lenovo ThinkPad", 
                "type_id": 1,
                "type": {"id": 1, "name": "하드웨어"},
                "status_id": 2,
                "status": "in_repair",
                "category_id": 1,  # 노트북
                "department_id": 3,
                "department": {"id": 3, "name": "인사팀"},
                "location_id": 1,
                "location_name": "본사 3층",
                "user_id": None,
                "user_name": None,
                "purchase_date": datetime.strptime("2022-11-05", "%Y-%m-%d").date(),
                "purchase_price": 1300000,
                "serial_number": "TP-2022-MNO345",
                "manufacturer": "Lenovo",
                "model": "ThinkPad X1",
                "warranty_expiry": "2024-11-05",
                "note": "배터리 교체 수리중",
                "useful_life": 36,
                "current_value": 900000,
            },
        ]
        
        return {
            'assets': assets,
            'asset_types': asset_types,
            'asset_statuses': asset_statuses
        }
    
    def get_assets(self) -> List[Dict[str, Any]]:
        """자산 데이터 조회"""
        return self._data['assets'].copy()
    
    def get_asset_types(self) -> List[Dict[str, Any]]:
        """자산 유형 데이터 조회"""
        return self._data['asset_types'].copy()
    
    def get_asset_statuses(self) -> List[Dict[str, Any]]:
        """자산 상태 데이터 조회"""
        return self._data['asset_statuses'].copy()
    
    def get_asset_count(self) -> int:
        """총 자산 개수 조회"""
        return len(self._data['assets'])
    
    def get_assets_by_type(self, type_id: int) -> List[Dict[str, Any]]:
        """유형별 자산 조회"""
        return [asset for asset in self._data['assets'] if asset['type_id'] == type_id]
    
    def get_assets_by_status(self, status_id: int) -> List[Dict[str, Any]]:
        """상태별 자산 조회"""
        return [asset for asset in self._data['assets'] if asset['status_id'] == status_id]
    
    def get_status_distribution(self) -> Dict[str, int]:
        """상태별 자산 분포 조회"""
        distribution = {}
        for asset in self._data['assets']:
            status = asset['status']
            distribution[status] = distribution.get(status, 0) + 1
        return distribution
    
    def get_type_distribution(self) -> Dict[str, int]:
        """유형별 자산 분포 조회"""
        distribution = {}
        for asset in self._data['assets']:
            type_name = asset['type']['name']
            distribution[type_name] = distribution.get(type_name, 0) + 1
        return distribution 