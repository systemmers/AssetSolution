"""
Asset Search Service - 자산 검색/필터링/통계 비즈니스 로직
자산의 검색, 필터링, 정렬, 페이지네이션 및 통계 관련 작업을 담당

Classes:
    - AssetSearchService: 자산 검색 및 통계 관련 비즈니스 로직
"""
from typing import List, Dict, Optional, Any, Tuple
from datetime import date, datetime, timedelta
from ...repositories.asset.asset_repository import asset_repository


class AssetSearchService:
    """자산 검색/필터링/통계 비즈니스 로직을 담당하는 서비스 클래스"""
    
    def __init__(self):
        """서비스 초기화"""
        self.repository = asset_repository
    
    def get_filtered_assets(self, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        검색 및 필터링된 자산 목록을 반환
        
        Args:
            filters: 검색 및 필터 조건
                - search_query: 검색어
                - category_id: 카테고리 ID
                - status: 상태
                - department_id: 부서 ID
                - expired: 내용연수 만료 여부
                - unused: 미사용 자산 여부
                - sort_by: 정렬 기준
                
        Returns:
            필터링된 자산 목록
        """
        # Repository에서 모든 자산 데이터 가져오기
        assets = self.repository.get_all_assets()
        
        # 검색어 필터링
        search_query = filters.get('search_query', '')
        if search_query:
            assets = [a for a in assets if search_query.lower() in a['name'].lower() or 
                      search_query.lower() in a['asset_number'].lower() or
                      (a['serial_number'] and search_query.lower() in a['serial_number'].lower())]
        
        # 카테고리 필터링
        category_id = filters.get('category_id')
        if category_id:
            try:
                category_id = int(category_id)
                assets = [a for a in assets if a['category_id'] == category_id]
            except (ValueError, TypeError):
                pass
        
        # 상태 필터링
        status = filters.get('status')
        if status:
            assets = [a for a in assets if a['status'] == status]
        
        # 부서 필터링
        department_id = filters.get('department_id')
        if department_id:
            try:
                department_id = int(department_id)
                assets = [a for a in assets if a['department_id'] == department_id]
            except (ValueError, TypeError):
                pass
        
        # 내용연수 만료 필터링
        if filters.get('expired') == '1':
            today = date.today()
            assets = [a for a in assets if (today - a['purchase_date']).days > a['useful_life'] * 30]
        
        # 미사용 자산 필터링
        if filters.get('unused') == '1':
            assets = [a for a in assets if a['status'] == 'available']
        
        # 정렬 적용
        sort_by = filters.get('sort_by', 'recent')
        assets = self._sort_assets(assets, sort_by)
        
        return assets
    
    def _sort_assets(self, assets: List[Dict[str, Any]], sort_by: str) -> List[Dict[str, Any]]:
        """자산 목록을 정렬"""
        if sort_by == 'name':
            assets.sort(key=lambda x: x['name'])
        elif sort_by == 'price_high':
            assets.sort(key=lambda x: x['purchase_price'], reverse=True)
        elif sort_by == 'price_low':
            assets.sort(key=lambda x: x['purchase_price'])
        elif sort_by == 'purchase_old':
            assets.sort(key=lambda x: x['purchase_date'])
        else:  # 최근 등록순 (기본)
            assets.sort(key=lambda x: x['id'], reverse=True)
        
        return assets
    
    def get_paginated_assets(self, assets: List[Dict[str, Any]], page: int, per_page: int = 10) -> Tuple[List[Dict[str, Any]], Dict[str, int]]:
        """
        자산 목록을 페이지네이션하여 반환
        
        Args:
            assets: 자산 목록
            page: 현재 페이지 번호
            per_page: 페이지당 항목 수
            
        Returns:
            (현재 페이지 자산 목록, 페이지네이션 정보)
        """
        total_items = len(assets)
        total_pages = (total_items + per_page - 1) // per_page  # 올림 나눗셈
        
        # 페이지 번호 유효성 검사
        if page < 1:
            page = 1
        if page > total_pages and total_pages > 0:
            page = total_pages
        
        # 페이지에 해당하는 항목 선택
        start_idx = (page - 1) * per_page
        end_idx = min(start_idx + per_page, total_items)
        current_page_items = assets[start_idx:end_idx] if assets else []
        
        pagination_info = {
            'page': page,
            'total_pages': total_pages,
            'total_items': total_items,
            'per_page': per_page,
            'start_idx': start_idx + 1 if current_page_items else 0,
            'end_idx': start_idx + len(current_page_items)
        }
        
        return current_page_items, pagination_info
    
    def get_asset_statistics(self) -> Dict[str, Any]:
        """
        자산 통계 정보를 반환
        
        Returns:
            자산 통계 데이터
        """
        assets = self.repository.get_all_assets()
        
        total_count = len(assets)
        available_count = len([a for a in assets if a['status'] == 'available'])
        in_use_count = len([a for a in assets if a['status'] == 'in_use'])
        maintenance_count = len([a for a in assets if a['status'] == 'maintenance'])
        disposed_count = len([a for a in assets if a['status'] == 'disposed'])
        
        total_value = sum(a.get('purchase_price', 0) for a in assets)
        
        return {
            'total_count': total_count,
            'available_count': available_count,
            'in_use_count': in_use_count,
            'maintenance_count': maintenance_count,
            'disposed_count': disposed_count,
            'total_value': total_value
        }
    
    def get_dashboard_statistics(self) -> Dict[str, Any]:
        """
        대시보드용 자산 통계 정보를 반환
        Repository의 통계 메서드를 사용하여 통합된 통계 제공
        
        Returns:
            대시보드용 자산 통계 데이터
        """
        try:
            # Repository의 통계 메서드 사용
            repo_stats = self.repository.get_dashboard_statistics()
            
            # 기존 형식과 호환성을 위해 일부 필드 매핑
            dashboard_stats = {
                'total_count': repo_stats.get('total_assets', 0),
                'normal_count': repo_stats.get('in_use_assets', 0) + repo_stats.get('available_assets', 0),
                'maintenance_count': repo_stats.get('in_repair_assets', 0),
                'disposed_count': 0,  # Repository에서 계산하지 않으므로 0으로 설정
                'in_use_assets': repo_stats.get('in_use_assets', 0),
                'available_assets': repo_stats.get('available_assets', 0),
                'in_repair_assets': repo_stats.get('in_repair_assets', 0),
                'active_contracts': 0,  # Asset 도메인에서는 계산하지 않음
                'loaned_assets': repo_stats.get('loaned_assets', 0),
                'utilization_rate': repo_stats.get('usage_rate', 0),
                'last_updated': ''
            }
            
            # 카테고리별 통계 (기존 로직 유지)
            from ...utils.constants import get_category_name
            assets = self.repository.get_all_assets()
            category_stats = {}
            for asset in assets:
                category_name = get_category_name(asset['category_id'])
                if category_name in category_stats:
                    category_stats[category_name] += 1
                else:
                    category_stats[category_name] = 1
            
            dashboard_stats['category_stats'] = category_stats
                
            # 최근 등록 자산 5개
            recent_assets = sorted(assets, key=lambda x: x['id'], reverse=True)[:5]
            dashboard_stats['recent_assets'] = recent_assets
            
            return dashboard_stats
                
        except Exception as e:
            print(f"대시보드 통계 조회 중 오류: {str(e)}")
            # 에러 발생 시 기본값 반환
            return {
                'total_count': 0,
                'normal_count': 0,
                'maintenance_count': 0,
                'disposed_count': 0,
                'category_stats': {},
                'recent_assets': []
            }
    
    def get_asset_summary_by_department(self) -> List[Dict[str, Any]]:
        """
        부서별 자산 현황 요약
        """
        assets = self.repository.get_all_assets()
        departments = self.repository.get_departments()
        
        summary = []
        for dept in departments:
            dept_assets = [a for a in assets if a.get('department_id') == dept['id']]
            summary.append({
                'department': dept['name'],
                'total_count': len(dept_assets),
                'total_value': sum(a.get('current_value', 0) for a in dept_assets),
                'in_use_count': len([a for a in dept_assets if a.get('status_id') == 1]),
                'repair_count': len([a for a in dept_assets if a.get('status_id') == 2])
            })
        
        return summary
    
    def get_expired_warranty_assets(self, days_ahead: int = 30) -> List[Dict[str, Any]]:
        """
        보증기간 만료 예정 자산 조회
        """
        cutoff_date = datetime.now().date() + timedelta(days=days_ahead)
        assets = self.repository.get_all_assets()
        
        expired_assets = []
        for asset in assets:
            if asset.get('warranty_expiry'):
                try:
                    warranty_date = datetime.strptime(asset['warranty_expiry'], '%Y-%m-%d').date()
                    if warranty_date <= cutoff_date:
                        expired_assets.append({
                            **asset,
                            'days_until_expiry': (warranty_date - datetime.now().date()).days
                        })
                except ValueError:
                    continue  # 날짜 형식이 잘못된 경우 건너뛰기
        
        return sorted(expired_assets, key=lambda x: x['days_until_expiry'])
    
    def get_assets_for_disposal(self, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        폐기 대상 자산 조회
        
        Args:
            filters: 필터 조건
            
        Returns:
            폐기 대상 자산 목록
        """
        assets = self.repository.get_all_assets()
        
        # 기본적으로 폐기 가능한 상태의 자산들만
        disposal_assets = [a for a in assets if a['status'] in ['available', 'maintenance', 'out_of_order']]
        
        if filters:
            # 추가 필터링 로직
            if filters.get('category_id'):
                disposal_assets = [a for a in disposal_assets if a['category_id'] == int(filters['category_id'])]
            
            if filters.get('department_id'):
                disposal_assets = [a for a in disposal_assets if a['department_id'] == int(filters['department_id'])]
        
        return disposal_assets
    
    def get_assets_for_loan(self, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        대여 가능한 자산 조회
        
        Args:
            filters: 필터 조건
            
        Returns:
            대여 가능한 자산 목록
        """
        assets = self.repository.get_all_assets()
        
        # 사용 가능한 상태의 자산들만
        loan_assets = [a for a in assets if a['status'] == 'available']
        
        if filters:
            # 추가 필터링 로직
            if filters.get('category_id'):
                loan_assets = [a for a in loan_assets if a['category_id'] == int(filters['category_id'])]
            
            if filters.get('department_id'):
                loan_assets = [a for a in loan_assets if a['department_id'] == int(filters['department_id'])]
        
        return loan_assets
    
    def get_assets_for_return(self, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        반납 대상 자산 조회
        
        Args:
            filters: 필터 조건
            
        Returns:
            반납 대상 자산 목록
        """
        assets = self.repository.get_all_assets()
        
        # 대여 중인 상태의 자산들만
        return_assets = [a for a in assets if a['status'] == 'in_use']
        
        if filters:
            # 추가 필터링 로직
            if filters.get('user_id'):
                return_assets = [a for a in return_assets if a.get('assigned_user_id') == int(filters['user_id'])]
            
            if filters.get('department_id'):
                return_assets = [a for a in return_assets if a['department_id'] == int(filters['department_id'])]
        
        return return_assets 