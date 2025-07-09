"""
Asset 도메인 Mock 데이터 관리 - 검색용 데이터
Operations에서 사용되는 자산 검색용 데이터를 관리합니다.

Classes:
    - AssetSearchData: 검색용 Mock 데이터 싱글톤 클래스
"""
from typing import List, Dict, Any


class AssetSearchData:
    """
    검색용 Mock 데이터 싱글톤 클래스
    Operations 도메인에서 사용되는 자산 검색 데이터를 관리합니다.
    """
    
    _instance = None
    _data = None
    
    def __new__(cls):
        """싱글톤 패턴 구현"""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        """AssetSearchData 초기화"""
        if self._data is None:
            self._data = self._load_sample_data()
    
    def _load_sample_data(self) -> List[Dict[str, Any]]:
        """
        샘플 검색용 자산 데이터 로드
        Operations 도메인에서 대여, 반납, 폐기 등에 사용되는 데이터
        
        Returns:
            검색용 자산 데이터 리스트
        """
        search_mock_assets = [
            {
                'id': 1,
                'asset_code': 'IT-NB-2023-001',
                'name': '노트북 Dell XPS 13',
                'category': 'IT장비',
                'category_id': 1,
                'status': 'available',
                'location': '본사 1층',
                'serial_number': 'DXP13-2023-001',
                'purchase_date': '2023-01-15',
                'purchase_price': 1500000,
                'current_value': 1200000,
                'condition': 'good',
                'description': '개발용 노트북',
                'manufacturer': 'Dell',
                'model': 'XPS 13',
                'warranty_expiry': '2026-01-15'
            },
            {
                'id': 2,
                'asset_code': 'OF-PJ-2022-005',
                'name': '프로젝터 Epson EB-X41',
                'category': '사무기기',
                'category_id': 2,
                'status': 'on_loan',
                'location': '회의실 A',
                'serial_number': 'EPX41-2022-005',
                'purchase_date': '2022-03-10',
                'purchase_price': 800000,
                'current_value': 600000,
                'condition': 'excellent',
                'description': '프레젠테이션용 프로젝터',
                'manufacturer': 'Epson',
                'model': 'EB-X41',
                'warranty_expiry': '2025-03-10'
            }
        ]
        
        return search_mock_assets
    
    def get_search_assets(self) -> List[Dict[str, Any]]:
        """검색용 자산 데이터 조회"""
        return self._data.copy()
    
    def search_by_keyword(self, keyword: str) -> List[Dict[str, Any]]:
        """키워드로 자산 검색"""
        if not keyword:
            return self._data.copy()
        
        keyword = keyword.lower()
        results = []
        for asset in self._data:
            # 이름, 카테고리, 제조사, 모델, 설명에서 검색
            search_fields = [
                asset.get('name', '').lower(),
                asset.get('category', '').lower(),
                asset.get('manufacturer', '').lower(),
                asset.get('model', '').lower(),
                asset.get('description', '').lower(),
                asset.get('asset_code', '').lower()
            ]
            
            if any(keyword in field for field in search_fields):
                results.append(asset)
        
        return results
    
    def get_asset_count(self) -> int:
        """총 자산 개수 조회"""
        return len(self._data) 