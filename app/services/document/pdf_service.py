"""
Document PDF Service
PDF 문서 생성을 담당하는 서비스

Classes:
    - DocumentPdfService: 발주서, 견적서 등 PDF 생성 서비스
"""
import os
from datetime import datetime
from typing import Dict, Any, Optional

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib import colors
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False


class DocumentPdfService:
    """PDF 문서 생성을 담당하는 서비스 클래스"""
    
    def __init__(self):
        """서비스 초기화"""
        # PDF 저장 디렉터리 설정
        self.pdf_output_dir = os.path.join(os.getcwd(), 'generated_documents')
        os.makedirs(self.pdf_output_dir, exist_ok=True)
    
    def generate_purchase_order_pdf(self, order_data: Dict[str, Any], partner_data: Dict[str, Any]) -> Optional[str]:
        """
        발주서 PDF를 생성합니다.
        
        Args:
            order_data: 발주서 데이터
            partner_data: 협력사 데이터
            
        Returns:
            생성된 PDF 파일 경로 또는 None
        """
        if not REPORTLAB_AVAILABLE:
            print("reportlab 라이브러리가 설치되지 않았습니다.")
            return None
            
        try:
            # PDF 파일명 생성
            filename = f"purchase_order_{order_data['order_number']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            filepath = os.path.join(self.pdf_output_dir, filename)
            
            # PDF 문서 생성
            doc = SimpleDocTemplate(filepath, pagesize=A4)
            story = []
            
            # 스타일 설정
            styles = getSampleStyleSheet()
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=18,
                spaceAfter=30,
                alignment=1  # 중앙 정렬
            )
            
            # 제목
            title = Paragraph("발 주 서", title_style)
            story.append(title)
            story.append(Spacer(1, 20))
            
            # 발주서 정보 테이블
            order_info_data = [
                ['발주서 번호', order_data.get('order_number', '')],
                ['발주일자', order_data.get('order_date', '')],
                ['납기일자', order_data.get('delivery_date', '')],
                ['납품주소', order_data.get('delivery_address', '')]
            ]
            
            order_info_table = Table(order_info_data, colWidths=[2*inch, 4*inch])
            order_info_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                ('BACKGROUND', (1, 0), (1, -1), colors.white),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(order_info_table)
            story.append(Spacer(1, 20))
            
            # 협력사 정보
            partner_info = Paragraph(f"<b>공급업체:</b> {partner_data.get('name', '')}<br/>"
                                   f"<b>담당자:</b> {partner_data.get('contact_person', '')}<br/>"
                                   f"<b>연락처:</b> {partner_data.get('contact_phone', '')}", 
                                   styles['Normal'])
            story.append(partner_info)
            story.append(Spacer(1, 20))
            
            # 품목 테이블 헤더
            items_header = [['품목명', '수량', '단가', '금액', '비고']]
            
            # 품목 데이터
            items_data = items_header.copy()
            total_amount = 0
            
            for item in order_data.get('items', []):
                amount = item.get('amount', item.get('quantity', 0) * item.get('unit_price', 0))
                total_amount += amount
                
                items_data.append([
                    item.get('name', ''),
                    str(item.get('quantity', '')),
                    f"{item.get('unit_price', 0):,}원",
                    f"{amount:,}원",
                    item.get('description', '')
                ])
            
            # 합계 행 추가
            items_data.append(['', '', '', f"총 금액: {total_amount:,}원", ''])
            
            # 품목 테이블 생성
            items_table = Table(items_data, colWidths=[2*inch, 1*inch, 1.5*inch, 1.5*inch, 2*inch])
            items_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -2), colors.beige),
                ('BACKGROUND', (0, -1), (-1, -1), colors.lightgrey),
                ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(items_table)
            story.append(Spacer(1, 30))
            
            # 비고
            if order_data.get('notes'):
                notes = Paragraph(f"<b>비고:</b> {order_data.get('notes')}", styles['Normal'])
                story.append(notes)
            
            # PDF 생성
            doc.build(story)
            
            return filepath
            
        except Exception as e:
            print(f"PDF 생성 중 오류 발생: {str(e)}")
            return None
    
    def generate_quotation_pdf(self, quotation_data: Dict[str, Any], partner_data: Dict[str, Any]) -> Optional[str]:
        """
        견적서 PDF를 생성합니다.
        
        Args:
            quotation_data: 견적서 데이터
            partner_data: 협력사 데이터
            
        Returns:
            생성된 PDF 파일 경로 또는 None
        """
        if not REPORTLAB_AVAILABLE:
            print("reportlab 라이브러리가 설치되지 않았습니다.")
            return None
            
        try:
            # PDF 파일명 생성
            filename = f"quotation_{quotation_data.get('quotation_number', 'Q001')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            filepath = os.path.join(self.pdf_output_dir, filename)
            
            # PDF 문서 생성
            doc = SimpleDocTemplate(filepath, pagesize=A4)
            story = []
            
            # 스타일 설정
            styles = getSampleStyleSheet()
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=18,
                spaceAfter=30,
                alignment=1  # 중앙 정렬
            )
            
            # 제목
            title = Paragraph("견 적 서", title_style)
            story.append(title)
            story.append(Spacer(1, 20))
            
            # 견적서 정보 테이블
            quotation_info_data = [
                ['견적서 번호', quotation_data.get('quotation_number', '')],
                ['견적일자', quotation_data.get('quotation_date', '')],
                ['유효기간', quotation_data.get('valid_until', '')],
                ['납기예정일', quotation_data.get('delivery_date', '')]
            ]
            
            quotation_info_table = Table(quotation_info_data, colWidths=[2*inch, 4*inch])
            quotation_info_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                ('BACKGROUND', (1, 0), (1, -1), colors.white),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(quotation_info_table)
            story.append(Spacer(1, 20))
            
            # 공급업체 정보
            partner_info = Paragraph(f"<b>공급업체:</b> {partner_data.get('name', '')}<br/>"
                                   f"<b>담당자:</b> {partner_data.get('contact_person', '')}<br/>"
                                   f"<b>연락처:</b> {partner_data.get('contact_phone', '')}", 
                                   styles['Normal'])
            story.append(partner_info)
            story.append(Spacer(1, 20))
            
            # 견적 품목 테이블
            items_header = [['품목명', '수량', '단가', '금액', '비고']]
            items_data = items_header.copy()
            total_amount = 0
            
            for item in quotation_data.get('items', []):
                amount = item.get('amount', item.get('quantity', 0) * item.get('unit_price', 0))
                total_amount += amount
                
                items_data.append([
                    item.get('name', ''),
                    str(item.get('quantity', '')),
                    f"{item.get('unit_price', 0):,}원",
                    f"{amount:,}원",
                    item.get('description', '')
                ])
            
            # 합계 행 추가
            items_data.append(['', '', '', f"총 견적금액: {total_amount:,}원", ''])
            
            # 품목 테이블 생성
            items_table = Table(items_data, colWidths=[2*inch, 1*inch, 1.5*inch, 1.5*inch, 2*inch])
            items_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -2), colors.beige),
                ('BACKGROUND', (0, -1), (-1, -1), colors.lightgrey),
                ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(items_table)
            story.append(Spacer(1, 30))
            
            # 조건 및 비고
            if quotation_data.get('terms'):
                terms = Paragraph(f"<b>조건:</b> {quotation_data.get('terms')}", styles['Normal'])
                story.append(terms)
                story.append(Spacer(1, 10))
            
            if quotation_data.get('notes'):
                notes = Paragraph(f"<b>비고:</b> {quotation_data.get('notes')}", styles['Normal'])
                story.append(notes)
            
            # PDF 생성
            doc.build(story)
            
            return filepath
            
        except Exception as e:
            print(f"견적서 PDF 생성 중 오류 발생: {str(e)}")
            return None
    
    def get_pdf_output_directory(self) -> str:
        """PDF 출력 디렉터리 경로 반환"""
        return self.pdf_output_dir
    
    def validate_pdf_generation_data(self, data: Dict[str, Any], pdf_type: str) -> bool:
        """
        PDF 생성을 위한 데이터 유효성 검증
        
        Args:
            data: 검증할 데이터
            pdf_type: PDF 유형 ('purchase_order' 또는 'quotation')
            
        Returns:
            유효성 검증 결과
        """
        if not REPORTLAB_AVAILABLE:
            return False
            
        if pdf_type == 'purchase_order':
            required_fields = ['order_number', 'order_date', 'items']
            return all(field in data and data[field] for field in required_fields)
        elif pdf_type == 'quotation':
            required_fields = ['quotation_number', 'quotation_date', 'items']
            return all(field in data and data[field] for field in required_fields)
        
        return False 