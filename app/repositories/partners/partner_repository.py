"""
Partner Repository 모듈
협력사 도메인의 데이터 접근 계층을 관리합니다.

Classes:
    - PartnerRepository: 협력사 데이터 repository 클래스 (BaseRepository 상속)

Author: AI Assistant
Created: 2024-12-19
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, date
from ..base_repository import BaseRepository
from .partners_data import PartnersData


class PartnerRepository(BaseRepository):
    """
    협력사 Repository 클래스
    협력사, 계약, 발주서, 견적서 관련 데이터 접근을 담당합니다.
    """
    
    def __init__(self):
        """PartnerRepository 초기화"""
        super().__init__()
        self._partner_data = PartnersData()
        self._load_data()
    
    def _load_sample_data(self) -> Dict[str, Any]:
        """
        샘플 데이터 로드 (BaseRepository 추상 메서드 구현)
        
        Returns:
            협력사 관련 데이터 딕셔너리
        """
        return self._partner_data._load_sample_data()
    
    def _validate_data(self, data: Dict[str, Any]) -> bool:
        """
        데이터 유효성 검증 (BaseRepository 추상 메서드 구현)
        
        Args:
            data: 검증할 데이터
            
        Returns:
            유효성 검증 결과
        """
        required_keys = ['partners', 'partner_documents', 'contracts', 
                        'purchase_orders', 'quotation_requests', 'sent_emails']
        
        # 필수 키 존재 확인
        for key in required_keys:
            if key not in data:
                return False
                
        # 협력사 데이터 유효성 검증
        for partner in data.get('partners', []):
            if not all(key in partner for key in ['id', 'name', 'type', 'status']):
                return False
                
        return True
    
    def _load_data(self) -> None:
        """내부 데이터 로드"""
        data = self._partner_data._data
        self._partners = data['partners']
        self._partner_documents = data['partner_documents']
        self._contracts = data['contracts']
        self._purchase_orders = data['purchase_orders']
        self._quotation_requests = data['quotation_requests']
        self._sent_emails = data['sent_emails']
    
    # ========== 기본 CRUD 메서드 ==========
    
    def get_partners(self) -> List[Dict[str, Any]]:
        """모든 협력사 조회"""
        return self._partners.copy()
    
    def get_partner_by_id(self, partner_id: int) -> Optional[Dict[str, Any]]:
        """ID로 협력사 조회"""
        return next((p for p in self._partners if p['id'] == partner_id), None)
    
    def get_partner_documents(self) -> List[Dict[str, Any]]:
        """모든 협력사 문서 조회"""
        return self._partner_documents.copy()
    
    def get_contracts(self) -> List[Dict[str, Any]]:
        """모든 계약 조회"""
        return self._contracts.copy()
    
    def get_purchase_orders(self) -> List[Dict[str, Any]]:
        """모든 발주서 조회"""
        return self._purchase_orders.copy()
    
    def get_quotation_requests(self) -> List[Dict[str, Any]]:
        """모든 견적서 요청 조회"""
        return self._quotation_requests.copy()
    
    def get_sent_emails(self) -> List[Dict[str, Any]]:
        """모든 발송 이메일 이력 조회"""
        return self._sent_emails.copy()
    
    # ========== 비즈니스 로직 메서드 ==========
    
    def get_active_partners(self) -> List[Dict[str, Any]]:
        """활성 협력사 조회"""
        return [p for p in self._partners if p['status'] == '활성']
    
    def get_partners_by_type(self, partner_type: str) -> List[Dict[str, Any]]:
        """유형별 협력사 조회"""
        return [p for p in self._partners if p['type'] == partner_type]
    
    def get_active_contracts(self) -> List[Dict[str, Any]]:
        """활성 계약 조회"""
        return [c for c in self._contracts if c['status'] == 'active']
    
    def get_pending_quotation_requests(self) -> List[Dict[str, Any]]:
        """대기 중인 견적서 요청 조회"""
        return [r for r in self._quotation_requests if r['status'] == 'pending']
    
    # ========== 관련 데이터 조회 메서드 ==========
    
    def get_documents_by_partner_id(self, partner_id: int) -> List[Dict[str, Any]]:
        """협력사별 문서 조회"""
        return [d for d in self._partner_documents if d['partner_id'] == partner_id]
    
    def get_contracts_by_partner_id(self, partner_id: int) -> List[Dict[str, Any]]:
        """협력사별 계약 조회"""
        return [c for c in self._contracts if c['partner_id'] == partner_id]
    
    def get_purchase_orders_by_partner_id(self, partner_id: int) -> List[Dict[str, Any]]:
        """협력사별 발주서 조회"""
        return [o for o in self._purchase_orders if o['partner_id'] == partner_id]
    
    def get_quotation_requests_by_partner_id(self, partner_id: int) -> List[Dict[str, Any]]:
        """협력사별 견적서 요청 조회"""
        return [r for r in self._quotation_requests if r['partner_id'] == partner_id]
    
    def get_emails_by_partner_id(self, partner_id: int) -> List[Dict[str, Any]]:
        """협력사별 이메일 발송 이력 조회"""
        return [e for e in self._sent_emails if e['partner_id'] == partner_id]
    
    # ========== 검색 및 필터링 메서드 ==========
    
    def search_partners(self, keyword: str) -> List[Dict[str, Any]]:
        """협력사 검색 (이름, 담당자명, 연락처)"""
        keyword = keyword.lower()
        return [
            p for p in self._partners 
            if keyword in p['name'].lower() 
            or keyword in p.get('contact_person', '').lower()
            or keyword in p.get('contact_email', '').lower()
        ]
    
    def get_partners_by_status(self, status: str) -> List[Dict[str, Any]]:
        """상태별 협력사 조회"""
        return [p for p in self._partners if p['status'] == status]
    
    def get_contracts_by_status(self, status: str) -> List[Dict[str, Any]]:
        """상태별 계약 조회"""
        return [c for c in self._contracts if c['status'] == status]
    
    def get_expiring_contracts(self, days: int = 30) -> List[Dict[str, Any]]:
        """만료 예정 계약 조회"""
        target_date = date.today()
        return [
            c for c in self._contracts 
            if c['status'] == 'active' 
            and (c['end_date'] - target_date).days <= days
            and (c['end_date'] - target_date).days >= 0
        ]
    
    # ========== 통계 메서드 ==========
    
    def get_partner_statistics(self) -> Dict[str, Any]:
        """협력사 통계 정보"""
        total_partners = len(self._partners)
        active_partners = len(self.get_active_partners())
        total_contracts = len(self._contracts)
        active_contracts = len(self.get_active_contracts())
        
        return {
            'total_partners': total_partners,
            'active_partners': active_partners,
            'inactive_partners': total_partners - active_partners,
            'total_contracts': total_contracts,
            'active_contracts': active_contracts,
            'expired_contracts': total_contracts - active_contracts,
            'pending_quotations': len(self.get_pending_quotation_requests())
        } 