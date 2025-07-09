"""
Partners Domain Data 모듈
협력사, 계약, 발주서, 견적서 요청 등 협력사 관련 데이터를 관리합니다.

Classes:
    - PartnersData: 협력사 관련 도메인 데이터 싱글톤 클래스
"""
from typing import List, Dict, Any
from datetime import datetime, date


class PartnersData:
    """
    협력사 관련 도메인 데이터 싱글톤 클래스
    협력사, 계약, 발주서, 견적서 요청 데이터를 관리합니다.
    """
    
    _instance = None
    _data = None
    
    def __new__(cls):
        """싱글톤 패턴 구현"""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        """PartnersData 초기화"""
        if self._data is None:
            self._data = self._load_sample_data()
    
    def _load_sample_data(self) -> Dict[str, List[Dict[str, Any]]]:
        """
        샘플 협력사 관련 데이터 로드
        
        Returns:
            협력사 관련 데이터 딕셔너리
        """
        # 협력사 데이터
        partners = [
            {
                "id": 1,
                "name": "삼성전자",
                "type": "제조사",
                "status": "활성",
                "contact_person": "김삼성",
                "contact_email": "kim.samsung@samsung.com",
                "contact_phone": "02-2255-1234",
                "address": "서울특별시 서초구 서초대로74길 11",
                "logo_image_path": "/static/img/partners/samsung.png",
                "tax_info": {
                    "business_number": "124-81-00998",
                    "company_registration": "110111-0000573"
                },
                "notes": "주요 IT 장비 공급업체",
                "created_at": datetime(2023, 1, 15)
            },
            {
                "id": 2,
                "name": "LG전자",
                "type": "제조사",
                "status": "활성",
                "contact_person": "박엘지",
                "contact_email": "park.lg@lge.com",
                "contact_phone": "02-3777-1114",
                "address": "서울특별시 영등포구 여의대로 128",
                "logo_image_path": "/static/img/partners/lg.png",
                "tax_info": {
                    "business_number": "107-86-14075",
                    "company_registration": "110111-0000012"
                },
                "notes": "가전제품 및 디스플레이 공급업체",
                "created_at": datetime(2023, 2, 20)
            },
            {
                "id": 3,
                "name": "델컴퓨터코리아",
                "type": "제조사",
                "status": "활성",
                "contact_person": "최델",
                "contact_email": "choi.dell@dell.com",
                "contact_phone": "02-3489-8900",
                "address": "서울특별시 강남구 테헤란로 152",
                "logo_image_path": "/static/img/partners/dell.png",
                "tax_info": {
                    "business_number": "106-81-51117",
                    "company_registration": "110111-0004321"
                },
                "notes": "서버 및 워크스테이션 전문",
                "created_at": datetime(2023, 3, 10)
            },
            {
                "id": 4,
                "name": "한국HP",
                "type": "제조사",
                "status": "활성",
                "contact_person": "정에이치피",
                "contact_email": "jung.hp@hp.com",
                "contact_phone": "02-2004-5114",
                "address": "서울특별시 강남구 테헤란로 231",
                "logo_image_path": "/static/img/partners/hp.png",
                "tax_info": {
                    "business_number": "106-81-14702",
                    "company_registration": "110111-0002456"
                },
                "notes": "프린터 및 PC 공급업체",
                "created_at": datetime(2023, 4, 5)
            },
            {
                "id": 5,
                "name": "레노버코리아",
                "type": "제조사",
                "status": "활성",
                "contact_person": "이레노버",
                "contact_email": "lee.lenovo@lenovo.com",
                "contact_phone": "02-6262-7700",
                "address": "서울특별시 강남구 역삼로 180",
                "logo_image_path": "/static/img/partners/lenovo.png",
                "tax_info": {
                    "business_number": "110-81-99887",
                    "company_registration": "110111-0003789"
                },
                "notes": "ThinkPad 및 서버 전문",
                "created_at": datetime(2023, 5, 12)
            }
        ]
        
        # 협력사 문서 데이터
        partner_documents = [
            {
                "id": 1,
                "partner_id": 1,
                "document_name": "사업자등록증",
                "file_path": "/documents/partners/1/business_license.pdf",
                "document_type": "사업자등록증",
                "uploaded_at": datetime(2023, 1, 20)
            },
            {
                "id": 2,
                "partner_id": 1,
                "document_name": "제품 카탈로그",
                "file_path": "/documents/partners/1/product_catalog.pdf",
                "document_type": "카탈로그",
                "uploaded_at": datetime(2023, 2, 10)
            },
            {
                "id": 3,
                "partner_id": 2,
                "document_name": "사업자등록증",
                "file_path": "/documents/partners/2/business_license.pdf",
                "document_type": "사업자등록증",
                "uploaded_at": datetime(2023, 2, 25)
            }
        ]
        
        # 계약 데이터
        contracts = [
            {
                "id": 1,
                "partner_id": 1,
                "contract_number": "CON-2023-001",
                "title": "IT 장비 공급 계약",
                "start_date": date(2023, 1, 1),
                "end_date": date(2023, 12, 31),
                "amount": 50000000,
                "status": "active",
                "created_at": datetime(2023, 1, 1)
            },
            {
                "id": 2,
                "partner_id": 2,
                "contract_number": "CON-2023-002",
                "title": "모니터 공급 계약",
                "start_date": date(2023, 3, 1),
                "end_date": date(2024, 2, 29),
                "amount": 30000000,
                "status": "active",
                "created_at": datetime(2023, 3, 1)
            }
        ]
        
        # 발주서 데이터
        purchase_orders = [
            {
                "id": 1,
                "partner_id": 1,
                "order_number": "PO-001-001",
                "order_date": date(2023, 6, 15),
                "delivery_date": date(2023, 6, 30),
                "delivery_address": "서울특별시 강남구 테헤란로 123",
                "status": "completed",
                "total_amount": 15000000,
                "items": [
                    {
                        "name": "갤럭시북 Pro",
                        "quantity": 10,
                        "unit_price": 1500000,
                        "amount": 15000000
                    }
                ],
                "created_at": datetime(2023, 6, 15)
            },
            {
                "id": 2,
                "partner_id": 2,
                "order_number": "PO-002-001",
                "order_date": date(2023, 7, 20),
                "delivery_date": date(2023, 8, 5),
                "delivery_address": "서울특별시 강남구 테헤란로 123",
                "status": "in_progress",
                "total_amount": 8000000,
                "items": [
                    {
                        "name": "LG 울트라와이드 모니터",
                        "quantity": 20,
                        "unit_price": 400000,
                        "amount": 8000000
                    }
                ],
                "created_at": datetime(2023, 7, 20)
            }
        ]
        
        # 견적서 요청 데이터
        quotation_requests = [
            {
                "id": 1,
                "partner_id": 1,
                "request_number": "QR-001",
                "request_date": date(2023, 8, 10),
                "due_date": date(2023, 8, 20),
                "status": "pending",
                "items": [
                    {
                        "name": "갤럭시북 Pro 360",
                        "specifications": "i7, 16GB, 512GB SSD",
                        "quantity": 15
                    }
                ],
                "notes": "급하지 않음. 정확한 견적 요청",
                "created_at": datetime(2023, 8, 10)
            },
            {
                "id": 2,
                "partner_id": 3,
                "request_number": "QR-002",
                "request_date": date(2023, 9, 5),
                "due_date": date(2023, 9, 15),
                "status": "responded",
                "items": [
                    {
                        "name": "Dell OptiPlex Desktop",
                        "specifications": "i5, 8GB, 256GB SSD",
                        "quantity": 25
                    }
                ],
                "notes": "빠른 납기 필요",
                "created_at": datetime(2023, 9, 5)
            }
        ]
        
        # 이메일 발송 이력
        sent_emails = [
            {
                "id": 1,
                "partner_id": 1,
                "recipient_email": "kim.samsung@samsung.com",
                "subject": "견적서 요청 - QR-001",
                "sent_at": datetime(2023, 8, 10, 14, 30),
                "email_type": "quotation_request"
            },
            {
                "id": 2,
                "partner_id": 3,
                "recipient_email": "choi.dell@dell.com",
                "subject": "견적서 요청 - QR-002",
                "sent_at": datetime(2023, 9, 5, 16, 15),
                "email_type": "quotation_request"
            }
        ]
        
        return {
            "partners": partners,
            "partner_documents": partner_documents,
            "contracts": contracts,
            "purchase_orders": purchase_orders,
            "quotation_requests": quotation_requests,
            "sent_emails": sent_emails
        }
    
    def get_data(self) -> Dict[str, List[Dict[str, Any]]]:
        """
        모든 협력사 관련 데이터 반환
        
        Returns:
            협력사 관련 데이터 딕셔너리
        """
        return self._data.copy() 