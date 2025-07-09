"""
Asset Partner Service - 협력사 관리 비즈니스 로직
협력사 등록, 조회, 문서/계약 관리 등을 담당

Classes:
    - AssetPartnerService: 협력사 관련 비즈니스 로직
"""
from typing import List, Dict, Optional, Any
from ...repositories.asset.asset_repository import asset_repository


class AssetPartnerService:
    """협력사 관리 비즈니스 로직을 담당하는 서비스 클래스"""
    
    def __init__(self):
        """서비스 초기화"""
        self.repository = asset_repository
    
    def get_partners_list(self) -> List[Dict[str, Any]]:
        """협력사 목록을 조회 (계약 건수 포함)"""
        partners = self.repository.get_all_partners()
        
        # 각 협력사의 계약 건수 추가
        for partner in partners:
            contracts = self.repository.get_contracts_by_partner_id(partner['id'])
            partner['contract_count'] = len(contracts)
        
        return partners
    
    def get_partner_detail(self, partner_id: int) -> Optional[Dict[str, Any]]:
        """협력사 상세 정보를 조회"""
        return self.repository.get_partner_by_id(partner_id)
    
    def get_partner_documents(self, partner_id: int) -> List[Dict[str, Any]]:
        """협력사의 문서 목록을 조회"""
        return self.repository.get_documents_for_partner(partner_id)
    
    def get_partner_contracts(self, partner_id: int) -> List[Dict[str, Any]]:
        """협력사의 계약 목록을 조회"""
        return self.repository.get_contracts_by_partner_id(partner_id)
    
    def get_partner_emails(self, partner_id: int) -> List[Dict[str, Any]]:
        """협력사의 메일 발송 이력을 조회"""
        return self.repository.get_emails_for_partner(partner_id)

    def add_partner(self, partner_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        새로운 협력사를 추가
        
        Args:
            partner_data: 협력사 정보
            
        Returns:
            추가된 협력사 정보 또는 None (실패 시)
        """
        try:
            # 데이터 유효성 검증
            validated_data = self._validate_partner_data(partner_data)
            
            # Repository를 통해 협력사 추가
            new_partner = self.repository.add_partner(validated_data)
            return new_partner
            
        except Exception as e:
            print(f"협력사 추가 중 오류 발생: {str(e)}")
            return None
    
    def update_partner(self, partner_id: int, partner_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        협력사 정보를 수정
        
        Args:
            partner_id: 협력사 ID
            partner_data: 수정할 협력사 정보
            
        Returns:
            수정된 협력사 정보 또는 None (실패 시)
        """
        try:
            # 기존 협력사 확인
            existing_partner = self.repository.get_partner_by_id(partner_id)
            if not existing_partner:
                return None
            
            # 데이터 유효성 검증
            validated_data = self._validate_partner_data(partner_data, is_update=True)
            
            # Repository를 통해 협력사 수정
            updated_partner = self.repository.update_partner(partner_id, validated_data)
            return updated_partner
            
        except Exception as e:
            print(f"협력사 수정 중 오류 발생: {str(e)}")
            return None
    
    def delete_partner(self, partner_id: int) -> bool:
        """
        협력사를 삭제
        
        Args:
            partner_id: 협력사 ID
            
        Returns:
            삭제 성공 여부
        """
        try:
            # 기존 협력사 확인
            existing_partner = self.repository.get_partner_by_id(partner_id)
            if not existing_partner:
                return False
            
            # 삭제 가능 여부 확인
            if not self._can_delete_partner(partner_id):
                return False
            
            # Repository를 통해 협력사 삭제
            return self.repository.delete_partner(partner_id)
            
        except Exception as e:
            print(f"협력사 삭제 중 오류 발생: {str(e)}")
            return False
    
    def get_partner_statistics(self) -> Dict[str, Any]:
        """협력사 통계 정보 조회"""
        partners = self.repository.get_all_partners()
        
        total_partners = len(partners)
        active_partners = len([p for p in partners if p.get('status') == 'active'])
        inactive_partners = total_partners - active_partners
        
        # 계약 건수별 협력사 분류
        partners_with_contracts = 0
        total_contracts = 0
        
        for partner in partners:
            contracts = self.repository.get_contracts_by_partner_id(partner['id'])
            if contracts:
                partners_with_contracts += 1
                total_contracts += len(contracts)
        
        return {
            'total_partners': total_partners,
            'active_partners': active_partners,
            'inactive_partners': inactive_partners,
            'partners_with_contracts': partners_with_contracts,
            'partners_without_contracts': total_partners - partners_with_contracts,
            'total_contracts': total_contracts,
            'average_contracts_per_partner': round(total_contracts / total_partners, 2) if total_partners > 0 else 0
        }
    
    def search_partners(self, search_query: str, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        협력사 검색
        
        Args:
            search_query: 검색어
            filters: 추가 필터 조건
            
        Returns:
            검색된 협력사 목록
        """
        partners = self.repository.get_all_partners()
        
        # 검색어 필터링
        if search_query:
            search_query = search_query.lower()
            filtered_partners = []
            for partner in partners:
                if (search_query in partner['name'].lower() or
                    search_query in partner.get('contact_person', '').lower() or
                    search_query in partner.get('contact_email', '').lower()):
                    filtered_partners.append(partner)
            partners = filtered_partners
        
        # 추가 필터 적용
        if filters:
            if filters.get('status'):
                partners = [p for p in partners if p.get('status') == filters['status']]
            
            if filters.get('type'):
                partners = [p for p in partners if p.get('type') == filters['type']]
        
        return partners
    
    def _validate_partner_data(self, partner_data: Dict[str, Any], is_update: bool = False) -> Dict[str, Any]:
        """협력사 데이터 검증 및 정제"""
        validated_data = partner_data.copy()
        
        if not is_update:
            # 신규 생성 시 필수 필드 검증
            required_fields = ['name', 'contact_person', 'contact_email', 'contact_phone']
            for field in required_fields:
                if not validated_data.get(field):
                    raise ValueError(f'{field} 필드는 필수입니다.')
        
        # 이메일 형식 검증
        if 'contact_email' in validated_data:
            email = validated_data.get('contact_email', '')
            if email and ('@' not in email or '.' not in email):
                raise ValueError('올바른 이메일 형식이 아닙니다.')
        
        # 전화번호 형식 검증 (간단한 검증)
        if 'contact_phone' in validated_data:
            phone = validated_data.get('contact_phone', '')
            if phone and len(phone.replace('-', '').replace(' ', '')) < 10:
                raise ValueError('올바른 전화번호 형식이 아닙니다.')
        
        # 상태 기본값 설정
        if 'status' not in validated_data:
            validated_data['status'] = 'active'
        
        return validated_data
    
    def _can_delete_partner(self, partner_id: int) -> bool:
        """
        협력사 삭제 가능 여부 확인
        
        Args:
            partner_id: 협력사 ID
            
        Returns:
            삭제 가능 여부
        """
        # 활성 계약이 있는 협력사는 삭제 불가
        contracts = self.repository.get_contracts_by_partner_id(partner_id)
        active_contracts = [c for c in contracts if c.get('status') == 'active']
        
        if active_contracts:
            raise ValueError('활성 계약이 있는 협력사는 삭제할 수 없습니다.')
        
        # 발주서나 견적서 요청이 진행 중인 경우 삭제 불가
        pending_orders = self.repository.get_purchase_orders_by_partner_id(partner_id)
        pending_orders = [o for o in pending_orders if o.get('status') == 'pending']
        
        if pending_orders:
            raise ValueError('진행 중인 발주서가 있는 협력사는 삭제할 수 없습니다.')
        
        return True 