"""
Document Email Service
이메일 발송을 담당하는 서비스

Classes:
    - DocumentEmailService: 문서 이메일 발송 서비스
"""
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from typing import Dict, Any


class DocumentEmailService:
    """문서 이메일 발송을 담당하는 서비스 클래스"""
    
    def __init__(self):
        """서비스 초기화"""
        self.smtp_server = "smtp.gmail.com"  # 기본 SMTP 서버
        self.smtp_port = 587
        self.email_user = os.getenv('EMAIL_USER', '')
        self.email_password = os.getenv('EMAIL_PASSWORD', '')
    
    def send_quotation_request_email(self, request_data: Dict[str, Any], partner_data: Dict[str, Any]) -> bool:
        """
        견적서 요청 이메일을 발송합니다.
        
        Args:
            request_data: 견적서 요청 데이터
            partner_data: 협력사 데이터
            
        Returns:
            발송 성공 여부
        """
        try:
            # 이메일 설정이 없는 경우 로그만 출력
            if not self.email_user or not self.email_password:
                print("이메일 설정이 없어 실제 발송을 건너뜁니다.")
                print(f"견적서 요청 이메일 발송 시뮬레이션:")
                print(f"수신자: {partner_data.get('contact_email')}")
                print(f"제목: {request_data.get('title')}")
                print(f"내용: {request_data.get('description')}")
                return True
            
            # 이메일 메시지 구성
            msg = MIMEMultipart()
            msg['From'] = self.email_user
            msg['To'] = partner_data.get('contact_email', '')
            msg['Subject'] = f"견적서 요청: {request_data.get('title', '')}"
            
            # 이메일 본문 작성
            body = self._create_quotation_request_email_body(request_data, partner_data)
            msg.attach(MIMEText(body, 'html', 'utf-8'))
            
            # SMTP 서버 연결 및 이메일 발송
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.email_user, self.email_password)
            
            text = msg.as_string()
            server.sendmail(self.email_user, partner_data.get('contact_email', ''), text)
            server.quit()
            
            return True
            
        except Exception as e:
            print(f"이메일 발송 중 오류 발생: {str(e)}")
            return False
    
    def send_purchase_order_email(self, order_data: Dict[str, Any], partner_data: Dict[str, Any], pdf_path: str) -> bool:
        """
        발주서 PDF를 첨부하여 이메일을 발송합니다.
        
        Args:
            order_data: 발주서 데이터
            partner_data: 협력사 데이터
            pdf_path: PDF 파일 경로
            
        Returns:
            발송 성공 여부
        """
        try:
            # 이메일 설정이 없는 경우 로그만 출력
            if not self.email_user or not self.email_password:
                print("이메일 설정이 없어 실제 발송을 건너뜁니다.")
                print(f"발주서 이메일 발송 시뮬레이션:")
                print(f"수신자: {partner_data.get('contact_email')}")
                print(f"제목: 발주서 발송 - {order_data.get('order_number')}")
                print(f"첨부파일: {pdf_path}")
                return True
            
            # 이메일 메시지 구성
            msg = MIMEMultipart()
            msg['From'] = self.email_user
            msg['To'] = partner_data.get('contact_email', '')
            msg['Subject'] = f"발주서 발송 - {order_data.get('order_number', '')}"
            
            # 이메일 본문 작성
            body = self._create_purchase_order_email_body(order_data, partner_data)
            msg.attach(MIMEText(body, 'html', 'utf-8'))
            
            # PDF 파일 첨부
            if os.path.exists(pdf_path):
                with open(pdf_path, "rb") as attachment:
                    part = MIMEBase('application', 'octet-stream')
                    part.set_payload(attachment.read())
                
                encoders.encode_base64(part)
                part.add_header(
                    'Content-Disposition',
                    f'attachment; filename= {os.path.basename(pdf_path)}'
                )
                msg.attach(part)
            
            # SMTP 서버 연결 및 이메일 발송
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.email_user, self.email_password)
            
            text = msg.as_string()
            server.sendmail(self.email_user, partner_data.get('contact_email', ''), text)
            server.quit()
            
            return True
            
        except Exception as e:
            print(f"이메일 발송 중 오류 발생: {str(e)}")
            return False
    
    def send_quotation_email(self, quotation_data: Dict[str, Any], partner_data: Dict[str, Any], pdf_path: str = None) -> bool:
        """
        견적서 PDF를 첨부하여 이메일을 발송합니다.
        
        Args:
            quotation_data: 견적서 데이터
            partner_data: 협력사 데이터
            pdf_path: PDF 파일 경로 (선택사항)
            
        Returns:
            발송 성공 여부
        """
        try:
            # 이메일 설정이 없는 경우 로그만 출력
            if not self.email_user or not self.email_password:
                print("이메일 설정이 없어 실제 발송을 건너뜁니다.")
                print(f"견적서 이메일 발송 시뮬레이션:")
                print(f"수신자: {partner_data.get('contact_email')}")
                print(f"제목: 견적서 발송 - {quotation_data.get('quotation_number')}")
                if pdf_path:
                    print(f"첨부파일: {pdf_path}")
                return True
            
            # 이메일 메시지 구성
            msg = MIMEMultipart()
            msg['From'] = self.email_user
            msg['To'] = partner_data.get('contact_email', '')
            msg['Subject'] = f"견적서 발송 - {quotation_data.get('quotation_number', '')}"
            
            # 이메일 본문 작성
            body = self._create_quotation_email_body(quotation_data, partner_data)
            msg.attach(MIMEText(body, 'html', 'utf-8'))
            
            # PDF 파일 첨부 (있는 경우)
            if pdf_path and os.path.exists(pdf_path):
                with open(pdf_path, "rb") as attachment:
                    part = MIMEBase('application', 'octet-stream')
                    part.set_payload(attachment.read())
                
                encoders.encode_base64(part)
                part.add_header(
                    'Content-Disposition',
                    f'attachment; filename= {os.path.basename(pdf_path)}'
                )
                msg.attach(part)
            
            # SMTP 서버 연결 및 이메일 발송
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.email_user, self.email_password)
            
            text = msg.as_string()
            server.sendmail(self.email_user, partner_data.get('contact_email', ''), text)
            server.quit()
            
            return True
            
        except Exception as e:
            print(f"견적서 이메일 발송 중 오류 발생: {str(e)}")
            return False
    
    def _create_quotation_request_email_body(self, request_data: Dict[str, Any], partner_data: Dict[str, Any]) -> str:
        """견적서 요청 이메일 본문을 생성합니다."""
        return f"""
        <html>
        <body>
            <h2>견적서 요청</h2>
            <p>안녕하세요, {partner_data.get('contact_person', '')}님</p>
            
            <h3>요청 내용</h3>
            <table border="1" style="border-collapse: collapse; width: 100%;">
                <tr>
                    <td style="background-color: #f0f0f0; padding: 8px;"><strong>요청 번호</strong></td>
                    <td style="padding: 8px;">{request_data.get('request_number', '')}</td>
                </tr>
                <tr>
                    <td style="background-color: #f0f0f0; padding: 8px;"><strong>제목</strong></td>
                    <td style="padding: 8px;">{request_data.get('title', '')}</td>
                </tr>
                <tr>
                    <td style="background-color: #f0f0f0; padding: 8px;"><strong>상세 내용</strong></td>
                    <td style="padding: 8px;">{request_data.get('description', '')}</td>
                </tr>
                <tr>
                    <td style="background-color: #f0f0f0; padding: 8px;"><strong>마감일</strong></td>
                    <td style="padding: 8px;">{request_data.get('deadline', '')}</td>
                </tr>
                <tr>
                    <td style="background-color: #f0f0f0; padding: 8px;"><strong>예산 범위</strong></td>
                    <td style="padding: 8px;">{request_data.get('budget_range', '')}</td>
                </tr>
            </table>
            
            {f'<h3>특별 요구사항</h3><p>{request_data.get("special_requirements", "")}</p>' if request_data.get('special_requirements') else ''}
            
            <h3>담당자 정보</h3>
            <p>
                담당자: {request_data.get('contact_name', '')}<br/>
                연락처: {request_data.get('contact_phone', '')}<br/>
                이메일: {request_data.get('contact_email', '')}
            </p>
            
            <p>빠른 시일 내에 견적서를 보내주시기 바랍니다.</p>
            <p>감사합니다.</p>
        </body>
        </html>
        """
    
    def _create_purchase_order_email_body(self, order_data: Dict[str, Any], partner_data: Dict[str, Any]) -> str:
        """발주서 이메일 본문을 생성합니다."""
        return f"""
        <html>
        <body>
            <h2>발주서 발송</h2>
            <p>안녕하세요, {partner_data.get('contact_person', '')}님</p>
            
            <p>첨부된 발주서를 확인하시고, 납기일에 맞춰 납품해 주시기 바랍니다.</p>
            
            <h3>발주 정보</h3>
            <table border="1" style="border-collapse: collapse; width: 100%;">
                <tr>
                    <td style="background-color: #f0f0f0; padding: 8px;"><strong>발주서 번호</strong></td>
                    <td style="padding: 8px;">{order_data.get('order_number', '')}</td>
                </tr>
                <tr>
                    <td style="background-color: #f0f0f0; padding: 8px;"><strong>발주일자</strong></td>
                    <td style="padding: 8px;">{order_data.get('order_date', '')}</td>
                </tr>
                <tr>
                    <td style="background-color: #f0f0f0; padding: 8px;"><strong>납기일자</strong></td>
                    <td style="padding: 8px;">{order_data.get('delivery_date', '')}</td>
                </tr>
                <tr>
                    <td style="background-color: #f0f0f0; padding: 8px;"><strong>납품주소</strong></td>
                    <td style="padding: 8px;">{order_data.get('delivery_address', '')}</td>
                </tr>
                <tr>
                    <td style="background-color: #f0f0f0; padding: 8px;"><strong>총 금액</strong></td>
                    <td style="padding: 8px;">{order_data.get('total_amount', 0):,}원</td>
                </tr>
            </table>
            
            {f'<h3>비고</h3><p>{order_data.get("notes", "")}</p>' if order_data.get('notes') else ''}
            
            <p>문의사항이 있으시면 언제든지 연락주시기 바랍니다.</p>
            <p>감사합니다.</p>
        </body>
        </html>
        """
    
    def _create_quotation_email_body(self, quotation_data: Dict[str, Any], partner_data: Dict[str, Any]) -> str:
        """견적서 이메일 본문을 생성합니다."""
        return f"""
        <html>
        <body>
            <h2>견적서 발송</h2>
            <p>안녕하세요, {partner_data.get('contact_person', '')}님</p>
            
            <p>요청하신 견적서를 첨부하여 발송드립니다.</p>
            
            <h3>견적 정보</h3>
            <table border="1" style="border-collapse: collapse; width: 100%;">
                <tr>
                    <td style="background-color: #f0f0f0; padding: 8px;"><strong>견적서 번호</strong></td>
                    <td style="padding: 8px;">{quotation_data.get('quotation_number', '')}</td>
                </tr>
                <tr>
                    <td style="background-color: #f0f0f0; padding: 8px;"><strong>견적일자</strong></td>
                    <td style="padding: 8px;">{quotation_data.get('quotation_date', '')}</td>
                </tr>
                <tr>
                    <td style="background-color: #f0f0f0; padding: 8px;"><strong>유효기간</strong></td>
                    <td style="padding: 8px;">{quotation_data.get('valid_until', '')}</td>
                </tr>
                <tr>
                    <td style="background-color: #f0f0f0; padding: 8px;"><strong>총 견적금액</strong></td>
                    <td style="padding: 8px;">{quotation_data.get('total_amount', 0):,}원</td>
                </tr>
            </table>
            
            {f'<h3>조건</h3><p>{quotation_data.get("terms", "")}</p>' if quotation_data.get('terms') else ''}
            {f'<h3>비고</h3><p>{quotation_data.get("notes", "")}</p>' if quotation_data.get('notes') else ''}
            
            <p>견적 내용을 검토해 주시고, 문의사항이 있으시면 언제든지 연락주시기 바랍니다.</p>
            <p>감사합니다.</p>
        </body>
        </html>
        """
    
    def validate_email_settings(self) -> bool:
        """이메일 설정 유효성 검증"""
        return bool(self.email_user and self.email_password)
    
    def validate_recipient_data(self, partner_data: Dict[str, Any]) -> bool:
        """수신자 데이터 유효성 검증"""
        return bool(partner_data.get('contact_email') and partner_data.get('contact_person'))
    
    def update_email_settings(self, email_user: str = None, email_password: str = None, 
                             smtp_server: str = None, smtp_port: int = None):
        """이메일 설정 업데이트"""
        if email_user:
            self.email_user = email_user
        if email_password:
            self.email_password = email_password
        if smtp_server:
            self.smtp_server = smtp_server
        if smtp_port:
            self.smtp_port = smtp_port 