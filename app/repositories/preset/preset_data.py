"""
Preset 도메인 Mock 데이터 관리
카테고리 프리셋 데이터를 관리합니다.

Classes:
    - PresetData: 프리셋 Mock 데이터 싱글톤 클래스
"""
from typing import List, Dict, Any
from datetime import datetime


class PresetData:
    """
    프리셋 Mock 데이터 싱글톤 클래스
    카테고리 구조의 프리셋 데이터를 관리합니다.
    """
    
    _instance = None
    _presets = None
    
    def __new__(cls):
        """싱글톤 패턴 구현"""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        """PresetData 초기화"""
        if self._presets is None:
            self._presets = self._load_sample_data()
    
    def _load_sample_data(self) -> List[Dict[str, Any]]:
        """
        샘플 프리셋 데이터 로드
        3개의 기본 프리셋: 기본 3단계, IT장비 5단계, 사무용품 4단계
        
        Returns:
            샘플 프리셋 데이터 리스트
        """
        return [
            {
                "id": 1,
                "name": "기본 3단계",
                "description": "기본적인 3단계 카테고리 구조",
                "preset_type": "category",
                "is_default": True,
                "is_shared": True,
                "created_by": "system",
                "category_structure": {
                    "max_levels": 3,
                    "categories": [
                        {
                            "id": 1,
                            "name": "전자기기",
                            "code": "ELECTRONICS",
                            "level": 1,
                            "children": [
                                {
                                    "id": 2,
                                    "name": "컴퓨터",
                                    "code": "COMPUTER",
                                    "level": 2,
                                    "children": [
                                        {"id": 3, "name": "데스크톱", "code": "DESKTOP", "level": 3, "children": []},
                                        {"id": 4, "name": "노트북", "code": "LAPTOP", "level": 3, "children": []},
                                        {"id": 5, "name": "서버", "code": "SERVER", "level": 3, "children": []}
                                    ]
                                },
                                {
                                    "id": 6,
                                    "name": "네트워크",
                                    "code": "NETWORK",
                                    "level": 2,
                                    "children": [
                                        {"id": 7, "name": "라우터", "code": "ROUTER", "level": 3, "children": []},
                                        {"id": 8, "name": "스위치", "code": "SWITCH", "level": 3, "children": []}
                                    ]
                                }
                            ]
                        },
                        {
                            "id": 9,
                            "name": "가구",
                            "code": "FURNITURE",
                            "level": 1,
                            "children": [
                                {
                                    "id": 10,
                                    "name": "의자",
                                    "code": "CHAIR",
                                    "level": 2,
                                    "children": [
                                        {"id": 11, "name": "사무용", "code": "OFFICE_CHAIR", "level": 3, "children": []},
                                        {"id": 12, "name": "가정용", "code": "HOME_CHAIR", "level": 3, "children": []}
                                    ]
                                },
                                {
                                    "id": 13,
                                    "name": "책상",
                                    "code": "DESK",
                                    "level": 2,
                                    "children": [
                                        {"id": 14, "name": "사무용", "code": "OFFICE_DESK", "level": 3, "children": []},
                                        {"id": 15, "name": "가정용", "code": "HOME_DESK", "level": 3, "children": []}
                                    ]
                                }
                            ]
                        }
                    ]
                },
                "usage_count": 0,
                "last_applied": None,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            },
            {
                "id": 2,
                "name": "IT장비 5단계",
                "description": "IT장비 상세 분류 5단계 구조",
                "preset_type": "category",
                "is_default": True,
                "is_shared": True,
                "created_by": "system",
                "category_structure": {
                    "max_levels": 5,
                    "categories": [
                        {
                            "id": 1,
                            "name": "컴퓨터",
                            "code": "COMPUTER",
                            "level": 1,
                            "children": [
                                {
                                    "id": 2,
                                    "name": "데스크톱",
                                    "code": "DESKTOP",
                                    "level": 2,
                                    "children": [
                                        {
                                            "id": 3,
                                            "name": "게이밍",
                                            "code": "GAMING_DESKTOP",
                                            "level": 3,
                                            "children": [
                                                {
                                                    "id": 4,
                                                    "name": "고성능",
                                                    "code": "HIGH_PERFORMANCE",
                                                    "level": 4,
                                                    "children": [
                                                        {"id": 5, "name": "RTX 4090", "code": "RTX4090", "level": 5, "children": []}
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                "usage_count": 0,
                "last_applied": None,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            },
            {
                "id": 3,
                "name": "사무용품 4단계",
                "description": "사무용품 분류 4단계 구조",
                "preset_type": "category",
                "is_default": True,
                "is_shared": True,
                "created_by": "system",
                "category_structure": {
                    "max_levels": 4,
                    "categories": [
                        {
                            "id": 1,
                            "name": "문구",
                            "code": "STATIONERY",
                            "level": 1,
                            "children": [
                                {
                                    "id": 2,
                                    "name": "필기구",
                                    "code": "WRITING_TOOLS",
                                    "level": 2,
                                    "children": [
                                        {
                                            "id": 3,
                                            "name": "펜",
                                            "code": "PEN",
                                            "level": 3,
                                            "children": [
                                                {"id": 4, "name": "볼펜", "code": "BALLPOINT", "level": 4, "children": []},
                                                {"id": 5, "name": "만년필", "code": "FOUNTAIN_PEN", "level": 4, "children": []},
                                                {"id": 6, "name": "형광펜", "code": "HIGHLIGHTER", "level": 4, "children": []}
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                "usage_count": 0,
                "last_applied": None,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            },
            {
                "id": 4,
                "name": "가구 6단계",
                "description": "가구 상세 분류 6단계 구조",
                "preset_type": "category",
                "is_default": True,
                "is_shared": True,
                "created_by": "system",
                "category_structure": {
                    "max_levels": 6,
                    "categories": [
                        {
                            "id": 1,
                            "name": "가구",
                            "code": "FURNITURE",
                            "level": 1,
                            "children": [
                                {
                                    "id": 2,
                                    "name": "사무용 가구",
                                    "code": "OFFICE_FURNITURE",
                                    "level": 2,
                                    "children": [
                                        {
                                            "id": 3,
                                            "name": "의자",
                                            "code": "CHAIR",
                                            "level": 3,
                                            "children": [
                                                {
                                                    "id": 4,
                                                    "name": "간부용",
                                                    "code": "EXECUTIVE_CHAIR",
                                                    "level": 4,
                                                    "children": [
                                                        {
                                                            "id": 5,
                                                            "name": "가죽",
                                                            "code": "LEATHER_EXECUTIVE",
                                                            "level": 5,
                                                            "children": [
                                                                {"id": 6, "name": "브라운", "code": "BROWN_LEATHER", "level": 6, "children": []}
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                "usage_count": 0,
                "last_applied": None,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            },
            {
                "id": 5,
                "name": "소프트웨어 7단계",
                "description": "소프트웨어 상세 분류 7단계 구조",
                "preset_type": "category",
                "is_default": True,
                "is_shared": True,
                "created_by": "system",
                "category_structure": {
                    "max_levels": 7,
                    "categories": [
                        {
                            "id": 1,
                            "name": "소프트웨어",
                            "code": "SOFTWARE",
                            "level": 1,
                            "children": [
                                {
                                    "id": 2,
                                    "name": "개발도구",
                                    "code": "DEVELOPMENT_TOOLS",
                                    "level": 2,
                                    "children": [
                                        {
                                            "id": 3,
                                            "name": "IDE",
                                            "code": "IDE",
                                            "level": 3,
                                            "children": [
                                                {
                                                    "id": 4,
                                                    "name": "JetBrains",
                                                    "code": "JETBRAINS",
                                                    "level": 4,
                                                    "children": [
                                                        {
                                                            "id": 5,
                                                            "name": "IntelliJ",
                                                            "code": "INTELLIJ",
                                                            "level": 5,
                                                            "children": [
                                                                {
                                                                    "id": 6,
                                                                    "name": "Ultimate",
                                                                    "code": "ULTIMATE",
                                                                    "level": 6,
                                                                    "children": [
                                                                        {"id": 7, "name": "2023.3", "code": "V2023_3", "level": 7, "children": []}
                                                                    ]
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                "usage_count": 0,
                "last_applied": None,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }
        ]
    
    def get_presets(self) -> List[Dict[str, Any]]:
        """
        프리셋 데이터 조회
        
        Returns:
            프리셋 데이터 리스트
        """
        return self._presets.copy()
    
    def get_preset_count(self) -> int:
        """
        프리셋 총 개수 조회
        
        Returns:
            프리셋 개수
        """
        return len(self._presets)
    
    def get_default_presets_count(self) -> int:
        """
        기본 프리셋 개수 조회
        
        Returns:
            기본 프리셋 개수
        """
        return len([preset for preset in self._presets if preset.get('is_default', False)])
    
    def get_preset_types(self) -> List[str]:
        """
        프리셋 타입 목록 조회
        
        Returns:
            프리셋 타입 목록
        """
        return list(set(preset['preset_type'] for preset in self._presets))
    
    def get_max_category_level(self) -> int:
        """
        최대 카테고리 레벨 조회
        
        Returns:
            최대 레벨
        """
        max_level = 0
        for preset in self._presets:
            if 'category_structure' in preset:
                structure_max = preset['category_structure'].get('max_levels', 0)
                max_level = max(max_level, structure_max)
        return max_level 