"""
Asset Purchase Service - 구매/견적 관리 비즈니스 로직  
발주서, 견적서 요청 생성 및 관리를 담당

Classes:
    - AssetPurchaseService: 구매/견적 관련 비즈니스 로직
"""
from typing import List, Dict, Optional, Any
from datetime import date, datetime
import os
from ...repositories.asset.asset_repository import asset_repository


class AssetPurchaseService:
    """구매/견적 관리 비즈니스 로직을 담당하는 서비스 클래스"""
    
    def __init__(self):
        """서비스 초기화"""
        self.repository = asset_repository
    
    def create_purchase_order(self, partner_id: int, order_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        발주서를 생성합니다.
        
        Args:
            partner_id: 협력사 ID
            order_data: 발주서 데이터
            
        Returns:
            생성된 발주서 정보 또는 None
        """
        try:
            # 협력사 존재 확인
            partner = self.repository.get_partner_by_id(partner_id)
            if not partner:
                raise ValueError('존재하지 않는 협력사입니다.')
            
            # 발주서 데이터 검증
            validated_data = self._validate_purchase_order_data(order_data)
            
            # 발주서 번호 생성
            order_number = self._generate_purchase_order_number(partner_id)
            
            # 발주서 데이터 구성
            purchase_order = {
                'id': self._get_next_purchase_order_id(),
                'partner_id': partner_id,
                'order_number': order_number,
                'order_date': validated_data['order_date'],
                'delivery_date': validated_data['delivery_date'],
                'delivery_address': validated_data['delivery_address'],
                'notes': validated_data.get('notes', ''),
                'items': validated_data['items'],
                'total_items': len(validated_data['items']),
                'total_amount': sum(item['amount'] for item in validated_data['items']),
                'status': 'pending',
                'created_at': date.today().isoformat(),
                'created_by': 'current_user'  # 실제로는 current_user.id 사용
            }
            
            # Repository를 통해 저장
            saved_order = self.repository.create_purchase_order(purchase_order)
            
            return saved_order
            
        except Exception as e:
            print(f"발주서 생성 오류: {str(e)}")
            return None
    
    def create_quotation_request(self, partner_id: int, request_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        견적서 요청을 생성합니다.
        
        Args:
            partner_id: 협력사 ID
            request_data: 견적서 요청 데이터
            
        Returns:
            생성된 견적서 요청 정보 또는 None
        """
        try:
            # 협력사 존재 확인
            partner = self.repository.get_partner_by_id(partner_id)
            if not partner:
                raise ValueError('존재하지 않는 협력사입니다.')
            
            # 견적서 요청 데이터 검증
            validated_data = self._validate_quotation_request_data(request_data)
            
            # 견적서 요청 번호 생성
            request_number = self._generate_quotation_request_number(partner_id)
            
            # 견적서 요청 데이터 구성
            quotation_request = {
                'id': self._get_next_quotation_request_id(),
                'partner_id': partner_id,
                'request_number': request_number,
                'title': validated_data['title'],
                'description': validated_data['description'],
                'deadline': validated_data['deadline'],
                'budget_range': validated_data.get('budget_range', ''),
                'contact_name': validated_data.get('contact_name', ''),
                'contact_phone': validated_data.get('contact_phone', ''),
                'contact_email': validated_data.get('contact_email', ''),
                'special_requirements': validated_data.get('special_requirements', ''),
                'status': 'pending',
                'created_at': date.today().isoformat(),
                'created_by': 'current_user'  # 실제로는 current_user.id 사용
            }
            
            # Repository를 통해 저장
            saved_request = self.repository.create_quotation_request(quotation_request)
            
            return saved_request
            
        except Exception as e:
            print(f"견적서 요청 생성 오류: {str(e)}")
            return None
    
    def get_purchase_orders_by_partner(self, partner_id: int) -> List[Dict[str, Any]]:
        """특정 협력사의 발주서 이력 조회"""
        try:
            orders = self.repository.get_purchase_orders_by_partner_id(partner_id)
            return orders
        except Exception as e:
            print(f"발주서 이력 조회 실패 (partner_id: {partner_id}): {str(e)}")
            return []

    def get_quotation_requests_by_partner(self, partner_id: int) -> List[Dict[str, Any]]:
        """특정 협력사의 견적서 요청 이력 조회"""
        try:
            requests = self.repository.get_quotation_requests_by_partner_id(partner_id)
            return requests
        except Exception as e:
            print(f"견적서 요청 이력 조회 실패 (partner_id: {partner_id}): {str(e)}")
            return []

    def get_purchase_order_pdf_path(self, order_id: int) -> Optional[str]:
        """발주서 PDF 파일 경로 조회"""
        try:
            order = self.repository.get_purchase_order_by_id(order_id)
            if order:
                # PDF 파일 경로 생성 (실제 구현에서는 DB에 저장된 경로 사용)
                pdf_filename = f"PO_{order['order_number'].replace('-', '_')}.pdf"
                pdf_path = os.path.join('generated_documents', pdf_filename)
                return pdf_path
            return None
        except Exception as e:
            print(f"발주서 PDF 경로 조회 실패 (order_id: {order_id}): {str(e)}")
            return None

    def resend_purchase_order(self, order_id: int) -> Dict[str, Any]:
        """발주서 재발송"""
        try:
            order = self.repository.get_purchase_order_by_id(order_id)
            if not order:
                return {'success': False, 'message': '발주서를 찾을 수 없습니다.'}

            partner = self.repository.get_partner_by_id(order['partner_id'])
            if not partner:
                return {'success': False, 'message': '협력사 정보를 찾을 수 없습니다.'}

            # PDF 파일 경로 확인
            pdf_path = self.get_purchase_order_pdf_path(order_id)
            if not pdf_path or not os.path.exists(pdf_path):
                return {'success': False, 'message': 'PDF 파일을 찾을 수 없습니다.'}

            # 이메일 발송 (시뮬레이션)
            email_data = {
                'recipient_email': partner['contact_email'],
                'subject': f"[재발송] 발주서 ({order['order_number']})",
                'attachment_path': pdf_path
            }

            # 이메일 발송 이력 기록
            self.repository.log_sent_email(order['partner_id'], email_data)

            print(f"발주서 재발송 완료 - Order ID: {order_id}, Email: {partner['contact_email']}")
            return {'success': True, 'message': '발주서가 성공적으로 재발송되었습니다.'}

        except Exception as e:
            print(f"발주서 재발송 실패 (order_id: {order_id}): {str(e)}")
            return {'success': False, 'message': '발주서 재발송 중 오류가 발생했습니다.'}

    def resend_quotation_request(self, request_id: int) -> Dict[str, Any]:
        """견적서 요청 재발송"""
        try:
            request = self.repository.get_quotation_request_by_id(request_id)
            if not request:
                return {'success': False, 'message': '견적서 요청을 찾을 수 없습니다.'}

            partner = self.repository.get_partner_by_id(request['partner_id'])
            if not partner:
                return {'success': False, 'message': '협력사 정보를 찾을 수 없습니다.'}

            # 이메일 발송 (시뮬레이션)
            email_data = {
                'recipient_email': partner['contact_email'],
                'subject': f"[재발송] 견적서 요청 ({request['request_number']})",
                'attachment_path': None
            }

            # 이메일 발송 이력 기록
            self.repository.log_sent_email(request['partner_id'], email_data)

            print(f"견적서 요청 재발송 완료 - Request ID: {request_id}, Email: {partner['contact_email']}")
            return {'success': True, 'message': '견적서 요청이 성공적으로 재발송되었습니다.'}

        except Exception as e:
            print(f"견적서 요청 재발송 실패 (request_id: {request_id}): {str(e)}")
            return {'success': False, 'message': '견적서 요청 재발송 중 오류가 발생했습니다.'}

    def mark_quotation_as_received(self, request_id: int) -> Dict[str, Any]:
        """견적서 수신 상태로 변경"""
        try:
            request = self.repository.get_quotation_request_by_id(request_id)
            if not request:
                return {'success': False, 'message': '견적서 요청을 찾을 수 없습니다.'}

            # 상태를 'completed'로 변경
            update_data = {'status': 'completed'}
            updated_request = self.repository.update_quotation_request(request_id, update_data)

            if updated_request:
                print(f"견적서 수신 상태 변경 완료 - Request ID: {request_id}")
                return {'success': True, 'message': '견적서 수신 상태로 변경되었습니다.'}
            else:
                return {'success': False, 'message': '상태 변경에 실패했습니다.'}

        except Exception as e:
            print(f"견적서 상태 변경 실패 (request_id: {request_id}): {str(e)}")
            return {'success': False, 'message': '상태 변경 중 오류가 발생했습니다.'}
    
    def create_purchase_order_with_pdf(self, partner_id: int, order_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        발주서를 생성하고 PDF를 생성하여 이메일로 발송합니다.
        
        Args:
            partner_id: 협력사 ID
            order_data: 발주서 데이터
            
        Returns:
            생성된 발주서 정보 또는 None
        """
        try:
            # 발주서 생성
            purchase_order = self.create_purchase_order(partner_id, order_data)
            if not purchase_order:
                return None
            
            # 협력사 정보 조회
            partner = self.repository.get_partner_by_id(partner_id)
            if not partner:
                return None
            
            # PDF 생성 시뮬레이션 (reportlab 없이)
            pdf_filename = f"purchase_order_{purchase_order['order_number']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            pdf_path = os.path.join(os.getcwd(), 'generated_documents', pdf_filename)
            
            # 디렉터리 생성
            os.makedirs(os.path.dirname(pdf_path), exist_ok=True)
            
            # 간단한 텍스트 파일로 PDF 시뮬레이션
            with open(pdf_path, 'w', encoding='utf-8') as f:
                f.write(f"발주서\n")
                f.write(f"발주서 번호: {purchase_order['order_number']}\n")
                f.write(f"발주일자: {purchase_order['order_date']}\n")
                f.write(f"납기일자: {purchase_order['delivery_date']}\n")
                f.write(f"공급업체: {partner['name']}\n")
                f.write(f"담당자: {partner['contact_person']}\n")
                f.write(f"연락처: {partner['contact_phone']}\n")
                f.write(f"납품주소: {purchase_order['delivery_address']}\n\n")
                f.write("품목 목록:\n")
                for item in purchase_order['items']:
                    f.write(f"- {item['name']}: {item['quantity']}개 x {item['unit_price']:,}원 = {item['amount']:,}원\n")
                f.write(f"\n총 금액: {purchase_order['total_amount']:,}원\n")
                if purchase_order.get('notes'):
                    f.write(f"\n비고: {purchase_order['notes']}\n")
            
            # 이메일 발송 시뮬레이션
            print(f"발주서 이메일 발송 시뮬레이션:")
            print(f"수신자: {partner['contact_email']}")
            print(f"제목: 발주서 발송 - {purchase_order['order_number']}")
            print(f"첨부파일: {pdf_path}")
            
            # 발주서에 PDF 경로 추가
            purchase_order['pdf_path'] = pdf_path
            
            return purchase_order
            
        except Exception as e:
            print(f"발주서 PDF 생성 및 이메일 발송 중 오류: {str(e)}")
            return None
    
    def create_quotation_request_with_email(self, partner_id: int, request_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        견적서 요청을 생성하고 이메일로 발송합니다.
        
        Args:
            partner_id: 협력사 ID
            request_data: 견적서 요청 데이터
            
        Returns:
            생성된 견적서 요청 정보 또는 None
        """
        try:
            # 견적서 요청 생성
            quotation_request = self.create_quotation_request(partner_id, request_data)
            if not quotation_request:
                return None
            
            # 협력사 정보 조회
            partner = self.repository.get_partner_by_id(partner_id)
            if not partner:
                return None
            
            # 이메일 발송 시뮬레이션
            print(f"견적서 요청 이메일 발송 시뮬레이션:")
            print(f"수신자: {partner['contact_email']}")
            print(f"제목: 견적서 요청 - {quotation_request['title']}")
            print(f"내용: {quotation_request['description']}")
            print(f"마감일: {quotation_request['deadline']}")
            
            # 이메일 발송 상태 추가
            quotation_request['email_sent'] = True
            quotation_request['email_sent_at'] = datetime.now().isoformat()
            
            return quotation_request
            
        except Exception as e:
            print(f"견적서 요청 이메일 발송 중 오류: {str(e)}")
            return None
    
    def get_purchase_order_statistics(self) -> Dict[str, Any]:
        """발주서 통계 정보 조회"""
        try:
            all_orders = self.repository.get_all_purchase_orders()
            
            total_orders = len(all_orders)
            pending_orders = len([o for o in all_orders if o.get('status') == 'pending'])
            completed_orders = len([o for o in all_orders if o.get('status') == 'completed'])
            cancelled_orders = len([o for o in all_orders if o.get('status') == 'cancelled'])
            
            total_amount = sum(o.get('total_amount', 0) for o in all_orders)
            
            return {
                'total_orders': total_orders,
                'pending_orders': pending_orders,
                'completed_orders': completed_orders,
                'cancelled_orders': cancelled_orders,
                'total_amount': total_amount,
                'average_order_amount': round(total_amount / total_orders, 2) if total_orders > 0 else 0
            }
        except Exception as e:
            print(f"발주서 통계 조회 중 오류: {str(e)}")
            return {}
    
    def get_quotation_request_statistics(self) -> Dict[str, Any]:
        """견적서 요청 통계 정보 조회"""
        try:
            all_requests = self.repository.get_all_quotation_requests()
            
            total_requests = len(all_requests)
            pending_requests = len([r for r in all_requests if r.get('status') == 'pending'])
            completed_requests = len([r for r in all_requests if r.get('status') == 'completed'])
            cancelled_requests = len([r for r in all_requests if r.get('status') == 'cancelled'])
            
            return {
                'total_requests': total_requests,
                'pending_requests': pending_requests,
                'completed_requests': completed_requests,
                'cancelled_requests': cancelled_requests,
                'completion_rate': round((completed_requests / total_requests * 100), 2) if total_requests > 0 else 0
            }
        except Exception as e:
            print(f"견적서 요청 통계 조회 중 오류: {str(e)}")
            return {}
    
    def _validate_purchase_order_data(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """발주서 데이터 검증 및 정제"""
        validated_data = order_data.copy()
        
        # 필수 필드 검증
        required_fields = ['order_date', 'delivery_date', 'delivery_address', 'items']
        for field in required_fields:
            if not validated_data.get(field):
                raise ValueError(f'{field} 필드는 필수입니다.')
        
        # 품목 데이터 검증
        items = validated_data.get('items', [])
        if not items:
            raise ValueError('최소 하나의 품목이 필요합니다.')
        
        for i, item in enumerate(items):
            if not item.get('name'):
                raise ValueError(f'품목 {i+1}의 이름이 필요합니다.')
            if not item.get('quantity') or item['quantity'] <= 0:
                raise ValueError(f'품목 {i+1}의 수량이 올바르지 않습니다.')
            if not item.get('unit_price') or item['unit_price'] <= 0:
                raise ValueError(f'품목 {i+1}의 단가가 올바르지 않습니다.')
            
            # 금액 계산
            item['amount'] = item['quantity'] * item['unit_price']
        
        return validated_data
    
    def _validate_quotation_request_data(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """견적서 요청 데이터 검증 및 정제"""
        validated_data = request_data.copy()
        
        # 필수 필드 검증
        required_fields = ['title', 'description', 'deadline']
        for field in required_fields:
            if not validated_data.get(field):
                raise ValueError(f'{field} 필드는 필수입니다.')
        
        return validated_data
    
    def _generate_purchase_order_number(self, partner_id: int) -> str:
        """발주서 번호 생성"""
        # 기존 발주서 수 조회
        existing_orders = self.repository.get_purchase_orders_by_partner_id(partner_id)
        order_count = len(existing_orders) + 1
        
        return f"PO-{partner_id:03d}-{order_count:03d}"
    
    def _generate_quotation_request_number(self, partner_id: int) -> str:
        """견적서 요청 번호 생성"""
        # 기존 견적서 요청 수 조회
        existing_requests = self.repository.get_quotation_requests_by_partner_id(partner_id)
        request_count = len(existing_requests) + 1
        
        return f"QR-{partner_id:03d}-{request_count:03d}"
    
    def _get_next_purchase_order_id(self) -> int:
        """다음 발주서 ID 생성"""
        # 임시 구현 - 실제로는 DB에서 자동 증가
        try:
            return len(self.repository.get_all_purchase_orders()) + 1
        except:
            return 1
    
    def _get_next_quotation_request_id(self) -> int:
        """다음 견적서 요청 ID 생성"""
        # 임시 구현 - 실제로는 DB에서 자동 증가
        try:
            return len(self.repository.get_all_quotation_requests()) + 1
        except:
            return 1 