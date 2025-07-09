"""
DocumentService - 문서 생성 및 이메일 발송 서비스 (Facade Pattern)
도메인별 문서 서비스로 delegation하는 Facade 서비스
"""
from typing import Dict, Any, Optional, List
from .document.pdf_service import DocumentPdfService
from .document.email_service import DocumentEmailService
from .document.management_service import DocumentManagementService


class DocumentService:
    """문서 생성 및 이메일 발송을 담당하는 Facade Service 클래스"""
    
    def __init__(self):
        """서비스 초기화 및 도메인 서비스 의존성 주입"""
        self.pdf_service = DocumentPdfService()
        self.email_service = DocumentEmailService()
        self.management_service = DocumentManagementService()
    
    def generate_purchase_order_pdf(self, order_data: Dict[str, Any], partner_data: Dict[str, Any]) -> Optional[str]:
        """발주서 PDF 생성 - Delegation to PdfService"""
        return self.pdf_service.generate_purchase_order_pdf(order_data, partner_data)
    
    def send_quotation_request_email(self, request_data: Dict[str, Any], partner_data: Dict[str, Any]) -> bool:
        """견적서 요청 이메일 발송 - Delegation to EmailService"""
        return self.email_service.send_quotation_request_email(request_data, partner_data)
    
    def send_purchase_order_email(self, order_data: Dict[str, Any], partner_data: Dict[str, Any], pdf_path: str) -> bool:
        """발주서 이메일 발송 - Delegation to EmailService"""
        return self.email_service.send_purchase_order_email(order_data, partner_data, pdf_path)
    
    def get_generated_documents_list(self) -> List[Dict[str, Any]]:
        """생성된 문서 목록 조회 - Delegation to ManagementService"""
        return self.management_service.get_generated_documents_list()
    
    def generate_quotation_pdf(self, quotation_data: Dict[str, Any], partner_data: Dict[str, Any]) -> Optional[str]:
        """견적서 PDF 생성 - Delegation to PdfService"""
        return self.pdf_service.generate_quotation_pdf(quotation_data, partner_data)
    
    def send_quotation_email(self, quotation_data: Dict[str, Any], partner_data: Dict[str, Any], pdf_path: str = None) -> bool:
        """견적서 이메일 발송 - Delegation to EmailService"""
        return self.email_service.send_quotation_email(quotation_data, partner_data, pdf_path)
    
    def get_document_statistics(self) -> Dict[str, Any]:
        """문서 통계 조회 - Delegation to ManagementService"""
        return self.management_service.get_document_statistics()
    
    def delete_document(self, filename: str) -> bool:
        """문서 삭제 - Delegation to ManagementService"""
        return self.management_service.delete_document(filename)
    
    def search_documents(self, search_term: str) -> List[Dict[str, Any]]:
        """문서 검색 - Delegation to ManagementService"""
        return self.management_service.search_documents(search_term)


# 싱글톤 인스턴스 생성
document_service = DocumentService() 