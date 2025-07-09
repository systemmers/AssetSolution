"""
AssetCoreService - 자산 관리 핵심 비즈니스 로직 서비스 (Facade 패턴)
Repository 계층과 Controller 계층 사이의 비즈니스 로직을 담당
분리된 도메인 서비스들을 통합하는 Facade 역할 수행
"""
from typing import List, Dict, Optional, Any, Tuple
from ..repositories.asset.asset_repository import asset_repository
from ..utils.constants import validate_asset_data
from .asset import (
    AssetCrudService, AssetSearchService, AssetSpecialService,
    AssetPartnerService, AssetPurchaseService
)


class AssetCoreService:
    """자산 관리 핵심 비즈니스 로직을 담당하는 서비스 클래스 (Facade 패턴)"""
    
    def __init__(self):
        """서비스 초기화 및 도메인 서비스 인스턴스 생성"""
        self.repository = asset_repository
        
        # 도메인별 서비스 인스턴스 생성
        self.crud_service = AssetCrudService()
        self.search_service = AssetSearchService()
        self.special_service = AssetSpecialService()
        self.partner_service = AssetPartnerService()
        self.purchase_service = AssetPurchaseService()
    
    def get_filtered_assets(self, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """검색 및 필터링된 자산 목록 조회 (SearchService로 delegate)"""
        return self.search_service.get_filtered_assets(filters)
    
    def _sort_assets(self, assets: List[Dict[str, Any]], sort_by: str) -> List[Dict[str, Any]]:
        """자산 목록을 정렬 (SearchService로 delegate)"""
        return self.search_service.sort_assets(assets, sort_by)
    
    def get_paginated_assets(self, assets: List[Dict[str, Any]], page: int, per_page: int = 10) -> Tuple[List[Dict[str, Any]], Dict[str, int]]:
        """자산 목록 페이지네이션 (SearchService로 delegate)"""
        return self.search_service.get_paginated_assets(assets, page, per_page)
    
    def get_asset_detail(self, asset_id: int) -> Optional[Dict[str, Any]]:
        """자산 상세 정보 조회 (CrudService로 delegate)"""
        return self.crud_service.get_asset_detail(asset_id)
    
    def get_pc_asset_details(self, asset_id: int) -> Optional[Dict[str, Any]]:
        """PC 자산 상세 정보 조회 (SpecialService로 delegate)"""
        return self.special_service.get_pc_asset_details(asset_id)

    def get_software_asset_details(self, asset_id: int) -> Optional[Dict[str, Any]]:
        """소프트웨어 자산 상세 정보 조회 (SpecialService로 delegate)"""
        return self.special_service.get_software_asset_details(asset_id)

    def get_ip_details_by_address(self, ip_address: str) -> Optional[Dict[str, Any]]:
        """IP 주소별 상세 정보 조회 (SpecialService로 delegate)"""
        return self.special_service.get_ip_details_by_address(ip_address)
    
    def create_asset(self, asset_data: Dict[str, Any]) -> Dict[str, Any]:
        """자산 생성 (CrudService로 delegate)"""
        return self.crud_service.create_asset(asset_data)
    
    def update_asset(self, asset_id: int, asset_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """자산 수정 (CrudService로 delegate)"""
        return self.crud_service.update_asset(asset_id, asset_data)
    
    def delete_asset(self, asset_id: int) -> bool:
        """자산 삭제 (CrudService로 delegate)"""
        return self.crud_service.delete_asset(asset_id)
    
    def get_form_data(self) -> Dict[str, Any]:
        """자산 폼 데이터 조회 (CrudService로 delegate)"""
        return self.crud_service.get_form_data()
    
    def validate_asset_data(self, asset_data: Dict[str, Any]) -> Tuple[bool, str]:
        """자산 데이터 유효성 검사 (CrudService로 delegate)"""
        return self.crud_service.validate_asset_data(asset_data)
    
    def get_asset_summary_by_department(self) -> List[Dict[str, Any]]:
        """부서별 자산 현황 요약 (SearchService로 delegate)"""
        return self.search_service.get_asset_summary_by_department()
    
    def get_expired_warranty_assets(self, days_ahead: int = 30) -> List[Dict[str, Any]]:
        """보증기간 만료 예정 자산 조회 (SearchService로 delegate)"""
        return self.search_service.get_expired_warranty_assets(days_ahead)
    
    def _validate_asset_data(self, asset_data: Dict[str, Any], is_update: bool = False) -> Dict[str, Any]:
        """
        자산 데이터 검증 및 변환
        (DEPRECATED: 공통 유틸리티 함수 validate_asset_data 사용 권장)
        """
        # 공통 유틸리티 함수로 위임
        return validate_asset_data(asset_data, is_update)
    
    def _can_delete_asset(self, asset: Dict[str, Any]) -> bool:
        """
        자산 삭제 가능 여부 확인
        
        Args:
            asset: 자산 정보
            
        Returns:
            삭제 가능 여부
        """
        # 사용 중인 자산은 삭제 불가
        if asset.get('status') == 'in_use':
            return False
        
        # 추가 비즈니스 룰 검증 가능
        return True
    
    def get_asset_statistics(self) -> Dict[str, Any]:
        """자산 통계 정보 조회 (SearchService로 delegate)"""
        return self.search_service.get_asset_statistics()
    
    def get_dashboard_statistics(self) -> Dict[str, Any]:
        """대시보드용 자산 통계 조회 (SearchService로 delegate)"""
        return self.search_service.get_dashboard_statistics()

    def get_pc_management_list(self):
        """PC 관리 목록 조회 (SpecialService로 delegate)"""
        return self.special_service.get_pc_management_list()

    def get_ip_management_list(self):
        """IP 관리 목록 조회 (SpecialService로 delegate)"""
        return self.special_service.get_ip_management_list()

    def get_sw_license_management_list(self):
        """SW 라이선스 관리 목록 조회 (SpecialService로 delegate)"""
        return self.special_service.get_sw_license_management_list()

    # 협력사 관리 관련 서비스 함수들 (PartnerService로 delegate)
    def get_partners_list(self) -> List[Dict[str, Any]]:
        """협력사 목록 조회 (PartnerService로 delegate)"""
        return self.partner_service.get_partners_list()
    
    def get_partner_detail(self, partner_id: int) -> Optional[Dict[str, Any]]:
        """협력사 상세 정보 조회 (PartnerService로 delegate)"""
        return self.partner_service.get_partner_detail(partner_id)
    
    def get_partner_documents(self, partner_id: int) -> List[Dict[str, Any]]:
        """협력사 문서 목록 조회 (PartnerService로 delegate)"""
        return self.partner_service.get_partner_documents(partner_id)
    
    def get_partner_contracts(self, partner_id: int) -> List[Dict[str, Any]]:
        """협력사 계약 목록 조회 (PartnerService로 delegate)"""
        return self.partner_service.get_partner_contracts(partner_id)
    
    def get_partner_emails(self, partner_id: int) -> List[Dict[str, Any]]:
        """협력사 메일 발송 이력 조회 (PartnerService로 delegate)"""
        return self.partner_service.get_partner_emails(partner_id)

    def add_partner(self, partner_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """협력사 추가 (PartnerService로 delegate)"""
        return self.partner_service.add_partner(partner_data)
    
    def _validate_partner_data(self, partner_data: Dict[str, Any]) -> Dict[str, Any]:
        """협력사 데이터 검증 및 정제 (PartnerService로 delegate)"""
        return self.partner_service._validate_partner_data(partner_data)

    # 발주서 관리 메서드들 (PurchaseService로 delegate)
    def create_purchase_order(self, partner_id: int, order_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """발주서 생성 (PurchaseService로 delegate)"""
        return self.purchase_service.create_purchase_order(partner_id, order_data)
    
    def create_quotation_request(self, partner_id: int, request_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """견적서 요청 생성 (PurchaseService로 delegate)"""
        return self.purchase_service.create_quotation_request(partner_id, request_data)
    
    def get_purchase_orders_by_partner(self, partner_id: int) -> List[Dict[str, Any]]:
        """특정 협력사의 발주서 이력 조회 (PurchaseService로 delegate)"""
        return self.purchase_service.get_purchase_orders_by_partner(partner_id)

    def get_quotation_requests_by_partner(self, partner_id: int) -> List[Dict[str, Any]]:
        """특정 협력사의 견적서 요청 이력 조회 (PurchaseService로 delegate)"""
        return self.purchase_service.get_quotation_requests_by_partner(partner_id)

    def get_purchase_order_pdf_path(self, order_id: int) -> Optional[str]:
        """발주서 PDF 파일 경로 조회 (PurchaseService로 delegate)"""
        return self.purchase_service.get_purchase_order_pdf_path(order_id)

    def resend_purchase_order(self, order_id: int) -> Dict[str, Any]:
        """발주서 재발송 (PurchaseService로 delegate)"""
        return self.purchase_service.resend_purchase_order(order_id)

    def resend_quotation_request(self, request_id: int) -> Dict[str, Any]:
        """견적서 요청 재발송 (PurchaseService로 delegate)"""
        return self.purchase_service.resend_quotation_request(request_id)

    def mark_quotation_as_received(self, request_id: int) -> Dict[str, Any]:
        """견적서 수신 상태로 변경 (PurchaseService로 delegate)"""
        return self.purchase_service.mark_quotation_as_received(request_id)
    
    def _validate_purchase_order_data(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """발주서 데이터 검증 및 정제 (PurchaseService로 delegate)"""
        return self.purchase_service._validate_purchase_order_data(order_data)
    
    def _validate_quotation_request_data(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """견적서 요청 데이터 검증 및 정제 (PurchaseService로 delegate)"""
        return self.purchase_service._validate_quotation_request_data(request_data)
    
    def _generate_purchase_order_number(self, partner_id: int) -> str:
        """발주서 번호 생성 (PurchaseService로 delegate)"""
        return self.purchase_service._generate_purchase_order_number(partner_id)
    
    def _generate_quotation_request_number(self, partner_id: int) -> str:
        """견적서 요청 번호 생성 (PurchaseService로 delegate)"""
        return self.purchase_service._generate_quotation_request_number(partner_id)
    
    def _get_next_purchase_order_id(self) -> int:
        """다음 발주서 ID 생성 (PurchaseService로 delegate)"""
        return self.purchase_service._get_next_purchase_order_id()
    
    def _get_next_quotation_request_id(self) -> int:
        """다음 견적서 요청 ID 생성 (PurchaseService로 delegate)"""
        return self.purchase_service._get_next_quotation_request_id()

    # PDF 생성 및 이메일 발송 기능
    def create_purchase_order_with_pdf(self, partner_id: int, order_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """발주서를 생성하고 PDF를 생성하여 이메일로 발송 (PurchaseService로 delegate)"""
        return self.purchase_service.create_purchase_order_with_pdf(partner_id, order_data)
    
    def create_quotation_request_with_email(self, partner_id: int, request_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """견적서 요청을 생성하고 이메일로 발송 (PurchaseService로 delegate)"""
        return self.purchase_service.create_quotation_request_with_email(partner_id, request_data)

    # ==================== 운영 관련 자산 조회 메서드 (신규 추가) ====================
    
    def get_assets_for_disposal(self, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """폐기 대상 자산 조회 (SearchService로 delegate)"""
        return self.search_service.get_assets_for_disposal(filters)
    
    def get_assets_for_loan(self, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """대여 가능한 자산 조회 (SearchService로 delegate)"""
        return self.search_service.get_assets_for_loan(filters)
    
    def get_assets_for_return(self, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """반납 대상 자산 조회 (SearchService로 delegate)"""
        return self.search_service.get_assets_for_return(filters)


# 싱글톤 인스턴스 생성
asset_core_service = AssetCoreService() 
