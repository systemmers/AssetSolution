"""
AssetRepository - 자산 데이터 접근 계층
분리된 도메인 데이터 클래스들을 사용하여 자산 데이터를 관리합니다.

Classes:
    - AssetRepository: 자산 데이터 관리를 위한 Repository 클래스
"""
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
from ..base_repository import BaseRepository
from .data.asset_core_data import AssetCoreData
from .data.asset_reference_data import AssetReferenceData
from .data.asset_details_data import AssetDetailsData
from .data.asset_search_data import AssetSearchData
from ..partners.partner_repository import PartnerRepository


class AssetRepository(BaseRepository):
    """자산 데이터 접근을 담당하는 Repository 클래스"""
    
    def __init__(self):
        """AssetRepository 초기화"""
        super().__init__()
        self._core_data = AssetCoreData()
        self._reference_data = AssetReferenceData()
        self._details_data = AssetDetailsData()
        self._search_data = AssetSearchData()
        self._load_data()
    
    def _load_sample_data(self) -> List[Dict[str, Any]]:
        """
        샘플 자산 데이터 로드
        
        Returns:
            샘플 자산 데이터 리스트
        """
        return self._core_data.get_assets()
    
    def _load_data(self) -> None:
        """데이터 로드 및 초기화"""
        # 핵심 자산 데이터 로드
        self._data = self._load_sample_data()
        
        # 다른 데이터들 로드
        self._asset_types = self._core_data.get_asset_types()
        self._asset_statuses = self._core_data.get_asset_statuses()
        self._locations = self._reference_data.get_locations()
        self._departments = self._reference_data.get_departments()
        self._users = self._reference_data.get_users()
        self._pc_asset_details = self._details_data.get_pc_asset_details()
        self._software_details = self._details_data.get_software_details()
        self._ip_addresses = self._details_data.get_ip_addresses()
        self._search_mock_assets = self._search_data.get_search_assets()
        
        # BaseRepository 초기화를 위한 설정
        self._next_id = max(asset['id'] for asset in self._data) + 1 if self._data else 1
        
        # 협력사 Repository 초기화
        self._partner_repository = PartnerRepository()
        self._load_partner_data()
    
    def _load_partner_data(self) -> None:
        """협력사 관련 데이터 로드"""
        # PartnerRepository에서 데이터 로드
        self._partners = self._partner_repository.get_partners()
        self._partner_documents = self._partner_repository.get_partner_documents()
        self._sent_emails = self._partner_repository.get_sent_emails()
        self._contracts = self._partner_repository.get_contracts()
        self._purchase_orders = self._partner_repository.get_purchase_orders()
        self._quotation_requests = self._partner_repository.get_quotation_requests()
    
    def _validate_data(self, data: Dict[str, Any], is_update: bool = False) -> None:
        """
        자산 데이터 유효성 검증
        
        Args:
            data: 검증할 데이터
            is_update: 업데이트 작업 여부
            
        Raises:
            ValueError: 유효하지 않은 데이터인 경우
        """
        # 필수 필드 검증 (생성 시만)
        if not is_update:
            required_fields = ['name', 'type_id', 'status_id']
            for field in required_fields:
                if field not in data or not data[field]:
                    raise ValueError(f"Required field '{field}' is missing or empty")
        
        # 데이터 타입 검증
        if 'purchase_price' in data and data['purchase_price'] is not None:
            if not isinstance(data['purchase_price'], (int, float)) or data['purchase_price'] < 0:
                raise ValueError("Purchase price must be a positive number")
        
        if 'type_id' in data and data['type_id'] is not None:
            if not isinstance(data['type_id'], int) or data['type_id'] <= 0:
                raise ValueError("Type ID must be a positive integer")
        
        if 'status_id' in data and data['status_id'] is not None:
            if not isinstance(data['status_id'], int) or data['status_id'] <= 0:
                raise ValueError("Status ID must be a positive integer")
    
    # Asset 관련 메서드들
    def get_all_assets(self) -> List[Dict[str, Any]]:
        """모든 자산 데이터를 반환"""
        return self._data.copy()
    
    def get_asset_by_id(self, asset_id: int) -> Optional[Dict[str, Any]]:
        """ID로 특정 자산을 조회"""
        for asset in self._data:
            if asset['id'] == asset_id:
                return asset.copy()
        return None
    
    def create_asset(self, asset_data: Dict[str, Any]) -> Dict[str, Any]:
        """새 자산을 생성"""
        # 새 ID 생성 (현재는 간단히 max ID + 1)
        new_id = max([asset['id'] for asset in self._data], default=0) + 1
        asset_data['id'] = new_id
        
        self._data.append(asset_data)
        return asset_data
    
    def update_asset(self, asset_id: int, asset_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """자산 정보를 업데이트"""
        for i, asset in enumerate(self._data):
            if asset['id'] == asset_id:
                # 기존 데이터에 새 데이터를 병합
                updated_asset = {**asset, **asset_data}
                self._data[i] = updated_asset
                return updated_asset
        return None
    
    def delete_asset(self, asset_id: int) -> bool:
        """자산을 삭제"""
        for i, asset in enumerate(self._data):
            if asset['id'] == asset_id:
                del self._data[i]
                return True
        return False
    
    # 관련 데이터 조회 메서드들
    def get_asset_types(self) -> List[Dict[str, Any]]:
        """자산 유형 목록을 반환"""
        return self._asset_types.copy()
    
    def get_asset_statuses(self) -> List[Dict[str, Any]]:
        """자산 상태 목록을 반환"""
        return self._asset_statuses.copy()
    
    def get_locations(self) -> List[Dict[str, Any]]:
        """위치 목록을 반환"""
        return self._locations.copy()
    
    def get_departments(self) -> List[Dict[str, Any]]:
        """부서 목록을 반환"""
        return self._departments.copy()
    
    def get_users(self) -> List[Dict[str, Any]]:
        """사용자 목록을 반환"""
        return self._users.copy()
    
    # 조회 헬퍼 메서드들
    def get_asset_type_by_id(self, type_id: int) -> Optional[Dict[str, Any]]:
        """ID로 자산 유형 조회"""
        for asset_type in self._asset_types:
            if asset_type['id'] == type_id:
                return asset_type.copy()
        return None
    
    def get_location_by_id(self, location_id: int) -> Optional[Dict[str, Any]]:
        """ID로 위치 조회"""
        for location in self._locations:
            if location['id'] == location_id:
                return location.copy()
        return None
    
    def get_department_by_id(self, department_id: int) -> Optional[Dict[str, Any]]:
        """ID로 부서 조회"""
        for department in self._departments:
            if department['id'] == department_id:
                return department.copy()
        return None
    
    def get_user_by_id(self, user_id: int) -> Optional[Dict[str, Any]]:
        """ID로 특정 사용자를 조회"""
        for user in self._users:
            if user['id'] == user_id:
                return user.copy()
        return None

    def search_assets(self, keyword: str) -> List[Dict[str, Any]]:
        """
        키워드로 자산 검색
        자산명, 자산번호, 시리얼번호, 제조사, 모델에서 검색
        """
        if not keyword:
            return self._data.copy()
        
        keyword = keyword.lower()
        results = []
        
        for asset in self._data:
            if (keyword in asset.get('name', '').lower() or
                keyword in asset.get('asset_number', '').lower() or
                keyword in asset.get('serial_number', '').lower() or
                keyword in asset.get('manufacturer', '').lower() or
                keyword in asset.get('model', '').lower()):
                results.append(asset.copy())
        
        return results
    
    def filter_assets(self, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        조건에 따른 자산 필터링
        """
        filtered_assets = self._data.copy()
        
        for key, value in filters.items():
            if not value:  # None, 빈 문자열, 0 등은 필터링하지 않음
                continue
                
            if key == 'type_id':
                filtered_assets = [a for a in filtered_assets if a.get('type_id') == int(value)]
            elif key == 'status_id':
                filtered_assets = [a for a in filtered_assets if a.get('status_id') == int(value)]
            elif key == 'department_id':
                filtered_assets = [a for a in filtered_assets if a.get('department_id') == int(value)]
            elif key == 'location_id':
                filtered_assets = [a for a in filtered_assets if a.get('location_id') == int(value)]
            elif key == 'user_id':
                filtered_assets = [a for a in filtered_assets if a.get('user_id') == int(value)]
            elif key == 'status':
                filtered_assets = [a for a in filtered_assets if a.get('status') == value]
        
        return filtered_assets
    
    def get_assets_by_status(self, status: str) -> List[Dict[str, Any]]:
        """상태별 자산 조회"""
        return [asset.copy() for asset in self._data if asset.get('status') == status]
    
    def get_assets_by_department(self, department_id: int) -> List[Dict[str, Any]]:
        """부서별 자산 조회"""
        return [asset.copy() for asset in self._data if asset.get('department_id') == department_id]
    
    def get_assets_by_user(self, user_id: int) -> List[Dict[str, Any]]:
        """사용자별 자산 조회"""
        return [asset.copy() for asset in self._data if asset.get('user_id') == user_id]
    
    def asset_exists(self, asset_number: str, exclude_id: Optional[int] = None) -> bool:
        """
        자산번호 중복 확인
        """
        for asset in self._data:
            if (asset.get('asset_number') == asset_number and 
                (exclude_id is None or asset.get('id') != exclude_id)):
                return True
        return False

    # --- 신규 상세정보 조회 메서드 추가 ---

    def get_pc_asset_details_by_asset_id(self, asset_id: int) -> Optional[Dict[str, Any]]:
        """자산 ID로 PC 상세 정보를 조회"""
        for details in self._pc_asset_details:
            if details['asset_id'] == asset_id:
                return details.copy()
        return None

    def get_software_details_by_asset_id(self, asset_id: int) -> Optional[Dict[str, Any]]:
        """자산 ID로 소프트웨어 상세 정보를 조회"""
        for details in self._software_details:
            if details['asset_id'] == asset_id:
                return details.copy()
        return None

    def get_ip_assignments_by_asset_id(self, asset_id: int) -> List[Dict[str, Any]]:
        """자산 ID에 할당된 IP 주소 목록을 조회"""
        return [ip.copy() for ip in self._ip_addresses if ip.get('asset_id') == asset_id]

    def find_ip_by_address(self, ip_address: str) -> Optional[Dict[str, Any]]:
        """IP 주소로 할당 정보를 조회"""
        for ip in self._ip_addresses:
            if ip['ip_address'] == ip_address:
                return ip.copy()
        return None

    # --- 신규 목록 조회 메서드 추가 ---

    def get_all_pc_assets(self) -> List[Dict[str, Any]]:
        """모든 PC 자산 목록을 상세 정보와 함께 반환"""
        pc_assets = []
        hw_assets = [asset for asset in self._data if asset.get('type', {}).get('name') == '하드웨어']

        for asset in hw_assets:
            pc_info = asset.copy()
            details = self.get_pc_asset_details_by_asset_id(asset['id'])
            ips = self.get_ip_assignments_by_asset_id(asset['id'])
            
            pc_info['details'] = details if details else {}
            # IP는 여러 개일 수 있으나, 목록에서는 대표 IP 하나만 표시
            pc_info['ip_address'] = ips[0]['ip_address'] if ips else None
            
            pc_assets.append(pc_info)
        return pc_assets

    def get_all_ip_assignments(self) -> List[Dict[str, Any]]:
        """모든 IP 할당 목록을 관련 정보와 함께 반환"""
        ip_list = []
        for ip in self._ip_addresses:
            ip_info = ip.copy()
            if ip_info.get('asset_id'):
                asset = self.get_asset_by_id(ip_info['asset_id'])
                if asset and asset.get('type', {}).get('name') == '하드웨어':
                    asset['details'] = self.get_pc_asset_details_by_asset_id(asset['id'])
                ip_info['asset'] = asset

            if ip_info.get('user_id'):
                ip_info['user'] = self.get_user_by_id(ip_info['user_id'])
            ip_list.append(ip_info)
        return ip_list

    def get_all_software_assets(self) -> List[Dict[str, Any]]:
        """모든 소프트웨어 자산 목록을 상세 정보와 함께 반환"""
        sw_assets = []
        sw_asset_list = [asset for asset in self._data if asset.get('type', {}).get('name') == '소프트웨어']

        for asset in sw_asset_list:
            sw_info = asset.copy()
            details = self.get_software_details_by_asset_id(asset['id'])
            sw_info['details'] = details if details else {}
            sw_assets.append(sw_info)
        return sw_assets

    # --------------------------------------------------------------------------
    # 협력사 관리 (Partner Management) 메서드
    # --------------------------------------------------------------------------
    def get_all_partners(self) -> List[Dict[str, Any]]:
        """모든 협력사 목록 반환"""
        return [p.copy() for p in self._partners]

    def get_partner_by_id(self, partner_id: int) -> Optional[Dict[str, Any]]:
        """ID로 특정 협력사 정보 조회"""
        partner = next((p for p in self._partners if p['id'] == partner_id), None)
        return partner.copy() if partner else None

    def add_partner(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """신규 협력사 추가"""
        new_id = max(p['id'] for p in self._partners) + 1 if self._partners else 1
        new_partner = {
            'id': new_id,
            'name': data.get('name'),
            'contact_person': data.get('contact_person'),
            'contact_email': data.get('contact_email'),
            'contact_phone': data.get('contact_phone'),
            'address': data.get('address'),
            'logo_image_path': data.get('logo_image_path'),
            'tax_info': data.get('tax_info', {}),
            'notes': data.get('notes'),
            'created_at': datetime.now()
        }
        self._partners.append(new_partner)
        return new_partner

    def get_documents_for_partner(self, partner_id: int) -> List[Dict[str, Any]]:
        """특정 협력사의 모든 문서 목록 반환"""
        return [d.copy() for d in self._partner_documents if d['partner_id'] == partner_id]

    def add_partner_document(self, partner_id: int, doc_data: Dict[str, Any]) -> Dict[str, Any]:
        """협력사에 신규 문서 추가"""
        new_id = max(d['id'] for d in self._partner_documents) + 1 if self._partner_documents else 1
        new_document = {
            'id': new_id,
            'partner_id': partner_id,
            'document_name': doc_data.get('document_name'),
            'file_path': doc_data.get('file_path'),
            'document_type': doc_data.get('document_type'),
            'uploaded_at': datetime.now()
        }
        self._partner_documents.append(new_document)
        return new_document

    def log_sent_email(self, partner_id: int, email_data: Dict[str, Any]) -> Dict[str, Any]:
        """발송된 메일 정보 기록"""
        new_id = max(e['id'] for e in self._sent_emails) + 1 if self._sent_emails else 1
        new_email_log = {
            'id': new_id,
            'partner_id': partner_id,
            'recipient_email': email_data.get('recipient_email'),
            'subject': email_data.get('subject'),
            'attachment_path': email_data.get('attachment_path'),
            'sent_at': datetime.now()
        }
        self._sent_emails.append(new_email_log)
        return new_email_log
        
    def get_contracts_by_partner_id(self, partner_id: int) -> List[Dict[str, Any]]:
        """특정 협력사와 관련된 모든 계약 목록 반환"""
        return [c.copy() for c in self._contracts if c.get('partner_id') == partner_id]
        
    def get_emails_for_partner(self, partner_id: int) -> List[Dict[str, Any]]:
        """특정 협력사의 이메일 발송 이력을 조회"""
        return [email for email in self._sent_emails if email['partner_id'] == partner_id]

    # 발주서 관련 메서드들
    def get_all_purchase_orders(self) -> List[Dict[str, Any]]:
        """모든 발주서 목록을 반환"""
        return self._purchase_orders.copy()
    
    def get_purchase_orders_by_partner_id(self, partner_id: int) -> List[Dict[str, Any]]:
        """특정 협력사의 발주서 목록을 반환"""
        return [order for order in self._purchase_orders if order['partner_id'] == partner_id]
    
    def get_purchase_order_by_id(self, order_id: int) -> Optional[Dict[str, Any]]:
        """ID로 발주서를 조회"""
        for order in self._purchase_orders:
            if order['id'] == order_id:
                return order.copy()
        return None
    
    def create_purchase_order(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """새 발주서를 생성"""
        new_order = order_data.copy()
        new_order['id'] = len(self._purchase_orders) + 1
        self._purchase_orders.append(new_order)
        return new_order.copy()
    
    def update_purchase_order(self, order_id: int, order_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """발주서를 업데이트"""
        for i, order in enumerate(self._purchase_orders):
            if order['id'] == order_id:
                updated_order = {**order, **order_data}
                self._purchase_orders[i] = updated_order
                return updated_order.copy()
        return None
    
    def delete_purchase_order(self, order_id: int) -> bool:
        """발주서를 삭제"""
        for i, order in enumerate(self._purchase_orders):
            if order['id'] == order_id:
                del self._purchase_orders[i]
                return True
        return False

    # 견적서 요청 관련 메서드들
    def get_all_quotation_requests(self) -> List[Dict[str, Any]]:
        """모든 견적서 요청 목록을 반환"""
        return self._quotation_requests.copy()
    
    def get_quotation_requests_by_partner_id(self, partner_id: int) -> List[Dict[str, Any]]:
        """특정 협력사의 견적서 요청 목록을 반환"""
        return [request for request in self._quotation_requests if request['partner_id'] == partner_id]
    
    def get_quotation_request_by_id(self, request_id: int) -> Optional[Dict[str, Any]]:
        """ID로 견적서 요청을 조회"""
        for request in self._quotation_requests:
            if request['id'] == request_id:
                return request.copy()
        return None
    
    def create_quotation_request(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """새 견적서 요청을 생성"""
        new_request = request_data.copy()
        new_request['id'] = len(self._quotation_requests) + 1
        self._quotation_requests.append(new_request)
        return new_request.copy()
    
    def update_quotation_request(self, request_id: int, request_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """견적서 요청을 업데이트"""
        for i, request in enumerate(self._quotation_requests):
            if request['id'] == request_id:
                updated_request = {**request, **request_data}
                self._quotation_requests[i] = updated_request
                return updated_request.copy()
        return None
    
    def delete_quotation_request(self, request_id: int) -> bool:
        """견적서 요청을 삭제"""
        for i, request in enumerate(self._quotation_requests):
            if request['id'] == request_id:
                del self._quotation_requests[i]
                return True
        return False

    # ==================== 운영 관련 자산 조회 메서드 (신규 추가) ====================
    
    def get_assets_for_disposal(self, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        폐기 가능한 자산 목록 조회
        - 수리필요, 고장, 사용가능(오래된 것) 상태의 자산들
        
        Args:
            filters: 검색 필터 (assetCode, assetName, category, status)
            
        Returns:
            폐기 가능한 자산 목록 (JavaScript 호환 형태로 변환)
        """
        # 폐기 가능한 상태 정의
        disposal_eligible_statuses = ['in_repair', 'broken', 'in_use']  # 수리중, 고장, 사용중(오래된 것)
        
        # 폐기 가능한 자산 필터링
        eligible_assets = []
        for asset in self._data:
            # 상태 확인
            if asset.get('status') not in disposal_eligible_statuses:
                continue
                
            # 구매일 기준 오래된 자산 우선 (3년 이상)
            from datetime import datetime, date
            if isinstance(asset.get('purchase_date'), date):
                purchase_date = asset['purchase_date']
                years_old = (date.today() - purchase_date).days / 365.25
                
                # 수리중이거나 고장난 자산은 연식 관계없이 포함
                if asset.get('status') not in ['in_repair', 'broken'] and years_old < 1:
                    continue
            
            # JavaScript 호환 형태로 변환
            disposal_asset = {
                'id': asset['id'],
                'assetCode': asset['asset_number'],
                'assetName': asset['name'],
                'category': asset.get('type', {}).get('name', '기타'),
                'status': self._translate_status_to_korean(asset.get('status', '')),
                'acquisitionDate': asset['purchase_date'].strftime('%Y-%m-%d') if isinstance(asset.get('purchase_date'), date) else '',
                'assetValue': f"{asset.get('purchase_price', 0):,}원" if asset.get('purchase_price') else '미정',
                'lifetime': asset.get('useful_life', 0) // 12 if asset.get('useful_life') else 0,  # 월 -> 년 변환
                'location': asset.get('location_name', '미확인'),
                'image': f"/static/img/assets/{asset['id']}.jpg"  # 기본 이미지 경로
            }
            
            eligible_assets.append(disposal_asset)
        
        # 필터 적용
        if filters:
            if filters.get('assetCode'):
                eligible_assets = [a for a in eligible_assets if filters['assetCode'].lower() in a['assetCode'].lower()]
            if filters.get('assetName'):
                eligible_assets = [a for a in eligible_assets if filters['assetName'].lower() in a['assetName'].lower()]
            if filters.get('category'):
                eligible_assets = [a for a in eligible_assets if filters['category'] == a['category']]
            if filters.get('status'):
                eligible_assets = [a for a in eligible_assets if filters['status'] == a['status']]
        
        return eligible_assets
    
    def get_assets_for_loan(self, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        대여 가능한 자산 목록 조회
        - 사용가능하고 현재 사용자가 없는 자산들
        
        Args:
            filters: 검색 필터
            
        Returns:
            대여 가능한 자산 목록
        """
        # 대여 가능한 자산 필터링 (사용중이지만 사용자가 없거나, 사용가능 상태)
        loan_eligible_assets = []
        for asset in self._data:
            # 대여 가능한 조건: 사용가능하고 사용자가 없음
            if asset.get('status') not in ['in_use', 'available']:
                continue
            if asset.get('user_id') is not None:  # 이미 누군가 사용중
                continue
                
            # JavaScript 호환 형태로 변환
            loan_asset = {
                'id': asset['id'],
                'assetCode': asset['asset_number'],
                'assetName': asset['name'],
                'category': asset.get('type', {}).get('name', '기타'),
                'status': '대여가능',
                'location': asset.get('location_name', '미확인'),
                'specifications': f"{asset.get('manufacturer', '')} {asset.get('model', '')}".strip(),
                'image': f"/static/img/assets/{asset['id']}.jpg"
            }
            
            loan_eligible_assets.append(loan_asset)
        
        # 필터 적용
        if filters:
            if filters.get('keyword'):
                keyword = filters['keyword'].lower()
                loan_eligible_assets = [a for a in loan_eligible_assets 
                                     if keyword in a['assetCode'].lower() or keyword in a['assetName'].lower()]
        
        return loan_eligible_assets
    
    def get_assets_for_return(self, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        반납 가능한 자산 목록 조회  
        - 현재 사용자가 있는 자산들 (대여중인 자산)
        
        Args:
            filters: 검색 필터
            
        Returns:
            반납 가능한 자산 목록
        """
        # 반납 가능한 자산 필터링 (현재 사용자가 있는 자산)
        return_eligible_assets = []
        for asset in self._data:
            # 반납 가능한 조건: 현재 사용자가 있음
            if asset.get('user_id') is None:
                continue
                
            # 사용자 정보 조회
            user = self.get_user_by_id(asset['user_id'])
            user_name = user['name'] if user else '미확인'
            
            # JavaScript 호환 형태로 변환
            return_asset = {
                'id': asset['id'],
                'assetCode': asset['asset_number'],
                'assetName': asset['name'],
                'category': asset.get('type', {}).get('name', '기타'),
                'status': '대여중',
                'currentUser': user_name,
                'location': asset.get('location_name', '미확인'),
                'loanDate': '2024-01-15',  # TODO: 실제 대여일 연동 필요
                'image': f"/static/img/assets/{asset['id']}.jpg"
            }
            
            return_eligible_assets.append(return_asset)
        
        # 필터 적용
        if filters:
            if filters.get('keyword'):
                keyword = filters['keyword'].lower()
                return_eligible_assets = [a for a in return_eligible_assets 
                                        if keyword in a['assetCode'].lower() or keyword in a['assetName'].lower() or keyword in a['currentUser'].lower()]
        
        return return_eligible_assets
    
    def get_dashboard_statistics(self) -> Dict[str, Any]:
        """대시보드용 자산 통계 데이터 조회"""
        total_assets = len(self._data)
        in_use_assets = len([a for a in self._data if a.get('status') == 'in_use'])
        available_assets = len([a for a in self._data if a.get('status') == 'available'])
        in_repair_assets = len([a for a in self._data if a.get('status') == 'in_repair'])
        
        # 사용률 계산
        usage_rate = (in_use_assets / total_assets * 100) if total_assets > 0 else 0
        
        # 대여중인 자산 수 (user_id가 있는 자산)
        loaned_assets = len([a for a in self._data if a.get('user_id') is not None])
        
        return {
            'total_assets': total_assets,
            'in_use_assets': in_use_assets,
            'available_assets': available_assets,
            'in_repair_assets': in_repair_assets,
            'usage_rate': round(usage_rate, 1),
            'loaned_assets': loaned_assets
        }
    
    def _translate_status_to_korean(self, status: str) -> str:
        """자산 상태를 한글로 변환"""
        status_map = {
            'in_use': '사용중',
            'in_repair': '수리중',
            'available': '사용가능',
            'disposed': '폐기됨'
        }
        return status_map.get(status, status)

    # ==================== 자산 검색 메서드 (Operations 전용) ====================
    
    def search_assets_for_operations(self, search_query='', category_id=None, status=None, location=None):
        """
        Operations에서 사용하는 자산 검색 메서드
        
        Args:
            search_query: 검색어 (자산명, 자산코드, 설명에서 검색)
            category_id: 카테고리 ID 필터
            status: 상태 필터
            location: 위치 필터
            
        Returns:
            필터링된 자산 목록
        """
        try:
            # Mock 자산 데이터 복사
            filtered_assets = self._search_mock_assets.copy()
            
            # 검색어 필터 적용
            if search_query:
                search_lower = search_query.lower()
                filtered_assets = [
                    asset for asset in filtered_assets
                    if search_lower in asset['name'].lower() or 
                       search_lower in asset['asset_code'].lower() or
                       search_lower in asset['description'].lower()
                ]
            
            # 카테고리 필터 적용
            if category_id:
                filtered_assets = [asset for asset in filtered_assets if asset['category_id'] == category_id]
            
            # 상태 필터 적용
            if status:
                filtered_assets = [asset for asset in filtered_assets if asset['status'] == status]
            
            # 위치 필터 적용
            if location:
                filtered_assets = [asset for asset in filtered_assets if location.lower() in asset['location'].lower()]
            
            return filtered_assets

        except Exception as e:
            print(f"자산 검색 오류: {e}")
            raise
    
    def get_search_mock_assets(self):
        """
        검색용 Mock 자산 데이터 조회
        
        Returns:
            검색용 Mock 자산 목록
        """
        return self._search_mock_assets.copy()


# 싱글톤 인스턴스 생성 (애플리케이션 전역에서 사용)
asset_repository = AssetRepository() 