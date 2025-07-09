"""
Category 도메인 Mock 데이터 관리
계층적 구조를 가진 카테고리 데이터를 관리합니다.

Classes:
    - CategoryData: 카테고리 Mock 데이터 싱글톤 클래스
"""
from typing import List, Dict, Any
from datetime import datetime


class CategoryData:
    """
    카테고리 Mock 데이터 싱글톤 클래스
    계층적 구조를 가진 카테고리 데이터를 관리합니다.
    """
    
    _instance = None
    _categories = None
    
    def __new__(cls):
        """싱글톤 패턴 구현"""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        """CategoryData 초기화"""
        if self._categories is None:
            self._categories = self._load_sample_data()
    
    def _load_sample_data(self) -> List[Dict[str, Any]]:
        """
        샘플 카테고리 데이터 로드
        계층적 구조: IT장비(컴퓨터(데스크톱,노트북), 네트워크장비), 사무가구(책상,의자)
        
        Returns:
            샘플 카테고리 데이터 리스트
        """
        return [
            {
                "id": 1,
                "name": "IT장비",
                "code": "IT_EQUIPMENT", 
                "description": "컴퓨터, 네트워크 등 IT 관련 장비",
                "parent_id": None,
                "level": 1,
                "path": "IT장비",
                "sort_order": 1,
                "is_active": True,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            },
            {
                "id": 2,
                "name": "컴퓨터",
                "code": "COMPUTER",
                "description": "데스크톱, 노트북 등 컴퓨터 장비",
                "parent_id": 1,
                "level": 2,
                "path": "IT장비/컴퓨터",
                "sort_order": 1,
                "is_active": True,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            },
            {
                "id": 3,
                "name": "데스크톱",
                "code": "DESKTOP",
                "description": "데스크톱 컴퓨터",
                "parent_id": 2,
                "level": 3,
                "path": "IT장비/컴퓨터/데스크톱",
                "sort_order": 1,
                "is_active": True,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            },
            {
                "id": 4,
                "name": "노트북",
                "code": "LAPTOP",
                "description": "노트북 컴퓨터",
                "parent_id": 2,
                "level": 3,
                "path": "IT장비/컴퓨터/노트북",
                "sort_order": 2,
                "is_active": True,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            },
            {
                "id": 5,
                "name": "네트워크장비",
                "code": "NETWORK",
                "description": "라우터, 스위치 등 네트워크 장비",
                "parent_id": 1,
                "level": 2,
                "path": "IT장비/네트워크장비",
                "sort_order": 2,
                "is_active": True,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            },
            {
                "id": 6,
                "name": "사무가구",
                "code": "OFFICE_FURNITURE",
                "description": "책상, 의자 등 사무용 가구",
                "parent_id": None,
                "level": 1,
                "path": "사무가구",
                "sort_order": 2,
                "is_active": True,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            },
            {
                "id": 7,
                "name": "책상",
                "code": "DESK",
                "description": "사무용 책상",
                "parent_id": 6,
                "level": 2,
                "path": "사무가구/책상",
                "sort_order": 1,
                "is_active": True,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            },
            {
                "id": 8,
                "name": "의자",
                "code": "CHAIR", 
                "description": "사무용 의자",
                "parent_id": 6,
                "level": 2,
                "path": "사무가구/의자",
                "sort_order": 2,
                "is_active": True,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }
        ]
    
    def get_categories(self) -> List[Dict[str, Any]]:
        """
        카테고리 데이터 조회
        
        Returns:
            카테고리 데이터 리스트
        """
        return self._categories.copy()
    
    def get_category_count(self) -> int:
        """
        카테고리 총 개수 조회
        
        Returns:
            카테고리 개수
        """
        return len(self._categories)
    
    def get_root_categories_count(self) -> int:
        """
        최상위 카테고리 개수 조회
        
        Returns:
            최상위 카테고리 개수
        """
        return len([cat for cat in self._categories if cat['parent_id'] is None])
    
    def get_max_level(self) -> int:
        """
        최대 계층 레벨 조회
        
        Returns:
            최대 레벨
        """
        return max(cat['level'] for cat in self._categories) 