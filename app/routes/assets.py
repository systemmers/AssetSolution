"""
자산 관리 관련 라우트 모듈
"""
from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify, Response, current_app, send_file
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
import os
from datetime import datetime, date
import csv
import io
import xlsxwriter

# Service 임포트 - 상대 경로 사용
from ..services.asset_core_service import AssetCoreService
from ..services.asset_export_service import AssetExportService

# Service 인스턴스 생성
asset_core_service = AssetCoreService()

assets_bp = Blueprint('assets', __name__)

@assets_bp.route('/')
@login_required
def index():
    """
    자산 목록 페이지
    """
    # 검색 및 필터링 매개변수 가져오기
    search_query = request.args.get('q', '')
    category_id = request.args.get('category', '')
    status = request.args.get('status', '')
    department_id = request.args.get('department', '')
    expired = request.args.get('expired', '')
    unused = request.args.get('unused', '')
    sort_by = request.args.get('sort', 'recent')
    view_mode = request.args.get('view', 'table')
    
    # 페이지네이션을 위한 변수
    page = request.args.get('page', 1, type=int)
    per_page = 10  # 페이지당 항목 수
    
    # Core Service를 통해 필터링된 자산 목록 가져오기
    filters = {
        'search_query': search_query,
        'category_id': category_id,
        'status': status,
        'department_id': department_id,
        'expired': expired,
        'unused': unused,
        'sort_by': sort_by
    }
    
    # 필터링 및 페이지네이션 처리
    filtered_assets = asset_core_service.get_filtered_assets(filters)
    current_page_items, pagination_info = asset_core_service.get_paginated_assets(filtered_assets, page, per_page)
    
    return render_template('assets/index.html', 
                          assets=current_page_items,
                          page=pagination_info['page'], 
                          total_pages=pagination_info['total_pages'],
                          total_items=pagination_info['total_items'],
                          max=max,
                          min=min)

@assets_bp.route('/create', methods=['GET'])
@login_required
def create_form():
    """
    자산 등록 폼 페이지
    """
    # Core Service에서 폼 데이터 가져오기
    form_data = asset_core_service.get_form_data()
    
    return render_template('assets/form.html', **form_data)

@assets_bp.route('/register', methods=['GET', 'POST'])
@login_required
def register():
    """
    자산 등록 처리
    """
    if request.method == 'POST':
        # 하드코딩된 구현 (실제 DB 저장은 나중에 구현)
        flash('자산이 등록되었습니다.', 'success')
        return redirect(url_for('assets.index'))
    
    # GET 요청인 경우 등록 폼으로 리다이렉트
    return redirect(url_for('assets.create_form'))

# URL 충돌 해결을 위한 추가 엔드포인트
@assets_bp.route('/create', methods=['POST'])
@login_required
def create():
    """
    자산 등록 처리 (register와 동일 기능)
    """
    # 하드코딩된 구현 (실제 DB 저장은 나중에 구현)
    flash('자산이 등록되었습니다.', 'success')
    return redirect(url_for('assets.index'))

@assets_bp.route('/detail/<int:asset_id>')
@login_required
def detail(asset_id):
    """
    자산 상세 정보 페이지
    """
    # Core Service에서 자산 조회
    asset = asset_core_service.get_asset_detail(asset_id)
    if not asset:
        flash('해당 자산을 찾을 수 없습니다.', 'danger')
        return redirect(url_for('assets.index'))
    
    return render_template('assets/detail.html', asset=asset)

@assets_bp.route('/pc/<int:asset_id>')
@login_required
def pc_detail(asset_id):
    """PC 자산 상세 정보 페이지"""
    asset = asset_core_service.get_pc_asset_details(asset_id)
    if not asset:
        flash('해당 PC 자산을 찾을 수 없습니다.', 'danger')
        return redirect(url_for('assets.index'))
    return render_template('assets/pc_detail.html', asset=asset)

@assets_bp.route('/sw/<int:asset_id>')
@login_required
def sw_detail(asset_id):
    """소프트웨어 자산 상세 정보 페이지"""
    asset = asset_core_service.get_software_asset_details(asset_id)
    if not asset:
        flash('해당 소프트웨어 자산을 찾을 수 없습니다.', 'danger')
        return redirect(url_for('assets.index'))
    return render_template('assets/sw_detail.html', asset=asset)

@assets_bp.route('/ip/<string:ip_address>')
@login_required
def ip_detail(ip_address):
    """IP 주소 상세 정보 페이지"""
    ip_info = asset_core_service.get_ip_details_by_address(ip_address)
    if not ip_info:
        flash('해당 IP 주소를 찾을 수 없습니다.', 'danger')
        return redirect(url_for('assets.ip_management')) # IP 관리 페이지로 리디렉션
    return render_template('assets/ip_detail.html', ip_info=ip_info)

@assets_bp.route('/update/<int:asset_id>', methods=['GET'])
@login_required
def update_form(asset_id):
    """
    자산 수정 폼 페이지
    """
    # Core Service에서 자산 조회
    asset = asset_core_service.get_asset_detail(asset_id)
    if not asset:
        flash('해당 자산을 찾을 수 없습니다.', 'danger')
        return redirect(url_for('assets.index'))
    
    # Core Service에서 폼 데이터 가져오기
    form_data = asset_core_service.get_form_data()
    
    return render_template('assets/form.html', asset=asset, **form_data)

@assets_bp.route('/edit/<int:asset_id>', methods=['POST'])
@login_required
def edit(asset_id):
    """
    자산 수정 처리
    """
    # Core Service에서 자산 조회
    asset = asset_core_service.get_asset_detail(asset_id)
    if not asset:
        flash('해당 자산을 찾을 수 없습니다.', 'danger')
        return redirect(url_for('assets.index'))
    
    # 하드코딩된 구현 (실제 DB 갱신은 나중에 구현)
    flash('자산 정보가 수정되었습니다.', 'success')
    return redirect(url_for('assets.detail', asset_id=asset_id))

# URL 충돌 해결을 위한 추가 엔드포인트
@assets_bp.route('/update/<int:asset_id>', methods=['POST'])
@login_required
def update(asset_id):
    """
    자산 수정 처리 (edit과 동일 기능)
    """
    # Core Service에서 자산 조회
    asset = asset_core_service.get_asset_detail(asset_id)
    if not asset:
        flash('해당 자산을 찾을 수 없습니다.', 'danger')
        return redirect(url_for('assets.index'))
    
    # 하드코딩된 구현 (실제 DB 갱신은 나중에 구현)
    flash('자산 정보가 수정되었습니다.', 'success')
    return redirect(url_for('assets.detail', asset_id=asset_id))

# 자산 삭제 엔드포인트 추가
@assets_bp.route('/delete/<int:asset_id>', methods=['POST'])
@login_required
def delete(asset_id):
    """
    자산 삭제 처리
    """
    # Core Service에서 자산 조회
    asset = asset_core_service.get_asset_detail(asset_id)
    if not asset:
        flash('해당 자산을 찾을 수 없습니다.', 'danger')
        return redirect(url_for('assets.index'))
    
    # 하드코딩된 구현 (실제 DB 삭제는 나중에 구현)
    flash('자산이 삭제되었습니다.', 'success')
    return redirect(url_for('assets.index'))

@assets_bp.route('/export_csv')
@login_required
def export_csv():
    """
    자산 목록을 CSV 파일로 내보내기
    """
    # 검색 조건 가져오기 및 필터링된 자산 데이터 가져오기
    filters = {
        'search_query': request.args.get('q', ''),
        'category_id': request.args.get('category', ''),
        'status': request.args.get('status', ''),
        'department_id': request.args.get('department', ''),
        'expired': request.args.get('expired', ''),
        'unused': request.args.get('unused', ''),
        'sort_by': 'recent'
    }
    
    assets = asset_core_service.get_filtered_assets(filters)
    
    # Export Service를 통해 CSV 생성
    export_service = AssetExportService()
    output, filename = export_service.export_to_csv(assets)
    
    return Response(
        output,
        mimetype="text/csv",
        headers={"Content-Disposition": f"attachment;filename={filename}"}
    )

@assets_bp.route('/export_excel')
@login_required
def export_excel():
    """
    자산 목록을 Excel 파일로 내보내기
    """
    # 검색 조건 가져오기 및 필터링된 자산 데이터 가져오기
    filters = {
        'search_query': request.args.get('q', ''),
        'category_id': request.args.get('category', ''),
        'status': request.args.get('status', ''),
        'department_id': request.args.get('department', ''),
        'expired': request.args.get('expired', ''),
        'unused': request.args.get('unused', ''),
        'sort_by': 'recent'
    }
    
    assets = asset_core_service.get_filtered_assets(filters)
    
    # Export Service를 통해 Excel 생성
    export_service = AssetExportService()
    output, filename = export_service.export_to_excel(assets)
    
    return Response(
        output,
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment;filename={filename}"}
    )

@assets_bp.route('/pc_management')
@login_required
def pc_management():
    """
    PC 관리 페이지를 표시합니다.
    """
    pc_list = asset_core_service.get_pc_management_list()
    return render_template('assets/pc_management.html', pcs=pc_list)

@assets_bp.route('/ip_management')
@login_required
def ip_management():
    """
    IP 관리 페이지를 표시합니다.
    """
    ip_list = asset_core_service.get_ip_management_list()
    return render_template('assets/ip_management.html', ips=ip_list)

@assets_bp.route('/bulk_register')
@login_required
def bulk_register():
    """
    대량 등록 페이지를 표시합니다.
    """
    return render_template('assets/bulk_register.html')

@assets_bp.route('/sw_license')
@login_required
def sw_license():
    """
    SW 라이선스 관리 페이지를 표시합니다.
    """
    license_list = asset_core_service.get_sw_license_management_list()
    return render_template('assets/sw_license.html', licenses=license_list)

# ==================== 운영 관련 자산 조회 API (신규 추가) ====================

@assets_bp.route('/api/assets/for-disposal', methods=['GET'])
@login_required
def get_assets_for_disposal():
    """
    폐기 가능한 자산 목록 API
    """
    try:
        # 검색 필터 파라미터 수집
        filters = {
            'assetCode': request.args.get('assetCode', ''),
            'assetName': request.args.get('assetName', ''),
            'category': request.args.get('category', ''),
            'status': request.args.get('status', '')
        }
        
        # 빈 필터는 None으로 처리
        filters = {k: v if v else None for k, v in filters.items()}
        
        # Core Service를 통해 폐기 가능한 자산 조회
        disposal_assets = asset_core_service.get_assets_for_disposal(filters)
        
        return jsonify({
            'success': True,
            'data': disposal_assets,
            'total': len(disposal_assets)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'폐기 가능한 자산 조회 중 오류가 발생했습니다: {str(e)}'
        }), 500

@assets_bp.route('/api/assets/for-loan', methods=['GET'])
@login_required  
def get_assets_for_loan():
    """
    대여 가능한 자산 목록 API
    """
    try:
        # 검색 필터 파라미터 수집
        filters = {
            'keyword': request.args.get('keyword', ''),
            'category': request.args.get('category', '')
        }
        
        # 빈 필터는 None으로 처리
        filters = {k: v if v else None for k, v in filters.items()}
        
        # Core Service를 통해 대여 가능한 자산 조회
        loan_assets = asset_core_service.get_assets_for_loan(filters)
        
        return jsonify({
            'success': True,
            'data': loan_assets,
            'total': len(loan_assets)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'대여 가능한 자산 조회 중 오류가 발생했습니다: {str(e)}'
        }), 500

@assets_bp.route('/api/assets/for-return', methods=['GET'])
@login_required
def get_assets_for_return():
    """
    반납 가능한 자산 목록 API (현재 대여중인 자산)
    """
    try:
        # 검색 필터 파라미터 수집
        filters = {
            'keyword': request.args.get('keyword', ''),
            'user': request.args.get('user', '')
        }
        
        # 빈 필터는 None으로 처리
        filters = {k: v if v else None for k, v in filters.items()}
        
        # Core Service를 통해 반납 가능한 자산 조회
        return_assets = asset_core_service.get_assets_for_return(filters)
        
        return jsonify({
            'success': True,
            'data': return_assets,
            'total': len(return_assets)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'반납 가능한 자산 조회 중 오류가 발생했습니다: {str(e)}'
        }), 500

@assets_bp.route('/api/dashboard/statistics', methods=['GET'])
@login_required
def get_dashboard_statistics():
    """
    대시보드용 실시간 통계 API
    """
    try:
        # Core Service를 통해 통계 데이터 조회
        statistics = asset_core_service.get_dashboard_statistics()
        
        return jsonify({
            'success': True,
            'data': statistics
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'대시보드 통계 조회 중 오류가 발생했습니다: {str(e)}'
        }), 500

# 협력사 관리 라우트
@assets_bp.route('/partners')
@login_required
def partner_management():
    """
    협력사 관리 페이지를 표시합니다.
    """
    partners = asset_core_service.get_partners_list()
    return render_template('partners/partner_management.html', partners=partners)

@assets_bp.route('/partners/<int:partner_id>')
@login_required
def partner_detail(partner_id):
    """
    협력사 상세 정보 페이지를 표시합니다.
    """
    partner = asset_core_service.get_partner_detail(partner_id)
    if not partner:
        flash('해당 협력사를 찾을 수 없습니다.', 'danger')
        return redirect(url_for('assets.partner_management'))
    
    # 협력사 관련 추가 데이터 조회
    documents = asset_core_service.get_partner_documents(partner_id)
    contracts = asset_core_service.get_partner_contracts(partner_id)
    emails = asset_core_service.get_partner_emails(partner_id)
    
    return render_template('partners/partner_detail.html', 
                         partner=partner,
                         documents=documents,
                         contracts=contracts,
                         emails=emails)

@assets_bp.route('/partners/add', methods=['POST'])
@login_required
def add_partner():
    """
    협력사 추가 처리
    """
    try:
        # 폼 데이터 수집
        partner_data = {
            'name': request.form.get('name', '').strip(),
            'contact_person': request.form.get('contact_person', '').strip(),
            'contact_email': request.form.get('contact_email', '').strip(),
            'contact_phone': request.form.get('contact_phone', '').strip(),
            'address': request.form.get('address', '').strip(),
            'notes': request.form.get('notes', '').strip(),
            'tax_info': {
                'registration_number': request.form.get('registration_number', '').strip(),
                'business_type': request.form.get('business_type', '').strip(),
                'business_item': request.form.get('business_item', '').strip(),
                'tax_invoice_email': request.form.get('tax_invoice_email', '').strip()
            }
        }
        
        # 필수 필드 검증
        required_fields = ['name', 'contact_person', 'contact_email', 'contact_phone']
        for field in required_fields:
            if not partner_data.get(field):
                flash(f'{field} 필드는 필수입니다.', 'danger')
                return redirect(url_for('assets.partner_management'))
        
        # 로고 파일 처리
        logo_file = request.files.get('logo_file')
        logo_filename = None
        
        if logo_file and logo_file.filename:
            # 파일 검증
            if not logo_file.content_type.startswith('image/'):
                flash('이미지 파일만 업로드 가능합니다.', 'danger')
                return redirect(url_for('assets.partner_management'))
            
            # 파일 크기 검증 (2MB)
            logo_file.seek(0, 2)  # 파일 끝으로 이동
            file_size = logo_file.tell()
            logo_file.seek(0)  # 파일 시작으로 되돌리기
            
            if file_size > 2 * 1024 * 1024:  # 2MB
                flash('파일 크기는 2MB 이하여야 합니다.', 'danger')
                return redirect(url_for('assets.partner_management'))
            
            # 파일 저장 (임시 구현)
            import os
            import uuid
            from werkzeug.utils import secure_filename
            
            # 파일 확장자 추출
            file_ext = os.path.splitext(secure_filename(logo_file.filename))[1]
            # 고유한 파일명 생성
            logo_filename = f"partner_logo_{uuid.uuid4().hex[:8]}{file_ext}"
            
            # 업로드 디렉터리 생성
            upload_dir = os.path.join(current_app.static_folder, 'img', 'partner_logos')
            os.makedirs(upload_dir, exist_ok=True)
            
            # 파일 저장
            logo_path = os.path.join(upload_dir, logo_filename)
            logo_file.save(logo_path)
            
            partner_data['logo_image_path'] = f'partner_logos/{logo_filename}'
        else:
            # 기본 로고 설정
            partner_data['logo_image_path'] = 'partner_logos/default.png'
        
        # 서비스를 통해 협력사 추가
        new_partner = asset_core_service.add_partner(partner_data)
        
        if new_partner:
            flash('협력사가 성공적으로 추가되었습니다.', 'success')
        else:
            flash('협력사 추가 중 오류가 발생했습니다.', 'danger')
            
    except Exception as e:
        flash(f'협력사 추가 중 오류가 발생했습니다: {str(e)}', 'danger')
    
    return redirect(url_for('assets.partner_management'))

@assets_bp.route('/partners/<int:partner_id>/purchase-orders', methods=['POST'])
@login_required
def create_purchase_order(partner_id):
    """
    발주서 생성 처리
    """
    try:
        # JSON 데이터 파싱
        if request.is_json:
            data = request.get_json()
        else:
            # 폼 데이터 처리
            data = {
                'order_date': request.form.get('order_date'),
                'delivery_date': request.form.get('delivery_date'),
                'delivery_address': request.form.get('delivery_address'),
                'notes': request.form.get('notes', ''),
                'items': []
            }
            
            # 동적 품목 데이터 처리
            item_count = 0
            while f'items[{item_count}][name]' in request.form:
                item = {
                    'name': request.form.get(f'items[{item_count}][name]'),
                    'quantity': int(request.form.get(f'items[{item_count}][quantity]', 0)),
                    'unit_price': float(request.form.get(f'items[{item_count}][unit_price]', 0)),
                    'description': request.form.get(f'items[{item_count}][description]', '')
                }
                if item['name'] and item['quantity'] > 0 and item['unit_price'] > 0:
                    data['items'].append(item)
                item_count += 1
        
        # 서비스를 통해 발주서 생성 (PDF 생성 및 이메일 발송 포함)
        purchase_order = asset_core_service.create_purchase_order_with_pdf(partner_id, data)
        
        if purchase_order:
            if request.is_json:
                return jsonify({
                    'success': True,
                    'message': '발주서가 성공적으로 생성되었습니다.',
                    'order': purchase_order
                })
            else:
                flash('발주서가 성공적으로 생성되었습니다.', 'success')
        else:
            if request.is_json:
                return jsonify({
                    'success': False,
                    'message': '발주서 생성 중 오류가 발생했습니다.'
                }), 400
            else:
                flash('발주서 생성 중 오류가 발생했습니다.', 'danger')
                
    except Exception as e:
        error_message = f'발주서 생성 중 오류가 발생했습니다: {str(e)}'
        if request.is_json:
            return jsonify({
                'success': False,
                'message': error_message
            }), 500
        else:
            flash(error_message, 'danger')
    
    if not request.is_json:
        return redirect(url_for('assets.partner_detail', partner_id=partner_id))

@assets_bp.route('/partners/<int:partner_id>/quotation-requests', methods=['POST'])
@login_required
def create_quotation_request(partner_id):
    """
    견적서 요청 생성 처리
    """
    try:
        # JSON 데이터 파싱
        if request.is_json:
            data = request.get_json()
        else:
            # 폼 데이터 처리
            data = {
                'title': request.form.get('title'),
                'description': request.form.get('description'),
                'deadline': request.form.get('deadline'),
                'budget_range': request.form.get('budget_range', ''),
                'contact_name': request.form.get('contact_name', ''),
                'contact_phone': request.form.get('contact_phone', ''),
                'contact_email': request.form.get('contact_email', ''),
                'special_requirements': request.form.get('special_requirements', '')
            }
        
        # 서비스를 통해 견적서 요청 생성 (이메일 발송 포함)
        quotation_request = asset_core_service.create_quotation_request_with_email(partner_id, data)
        
        if quotation_request:
            if request.is_json:
                return jsonify({
                    'success': True,
                    'message': '견적서 요청이 성공적으로 생성되었습니다.',
                    'request': quotation_request
                })
            else:
                flash('견적서 요청이 성공적으로 생성되었습니다.', 'success')
        else:
            if request.is_json:
                return jsonify({
                    'success': False,
                    'message': '견적서 요청 생성 중 오류가 발생했습니다.'
                }), 400
            else:
                flash('견적서 요청 생성 중 오류가 발생했습니다.', 'danger')
                
    except Exception as e:
        error_message = f'견적서 요청 생성 중 오류가 발생했습니다: {str(e)}'
        if request.is_json:
            return jsonify({
                'success': False,
                'message': error_message
            }), 500
        else:
            flash(error_message, 'danger')
    
    if not request.is_json:
        return redirect(url_for('assets.partner_detail', partner_id=partner_id))

@assets_bp.route('/partners/<int:partner_id>/purchase-orders', methods=['GET'])
@login_required
def get_purchase_orders(partner_id):
    """
    협력사별 발주서 목록 조회
    """
    try:
        orders = asset_core_service.get_purchase_orders_by_partner(partner_id)
        return jsonify({
            'success': True,
            'orders': orders
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'발주서 목록 조회 중 오류가 발생했습니다: {str(e)}'
        }), 500

@assets_bp.route('/partners/<int:partner_id>/quotation-requests', methods=['GET'])
@login_required
def get_quotation_requests(partner_id):
    """
    협력사별 견적서 요청 목록 조회
    """
    try:
        requests = asset_core_service.get_quotation_requests_by_partner(partner_id)
        return jsonify({
            'success': True,
            'requests': requests
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'견적서 요청 목록 조회 중 오류가 발생했습니다: {str(e)}'
        }), 500

@assets_bp.route('/api/partners/<int:partner_id>/purchase-orders', methods=['GET'])
@login_required
def get_partner_purchase_orders(partner_id):
    """특정 협력사의 발주서 이력 조회"""
    try:
        purchase_orders = asset_core_service.get_purchase_orders_by_partner(partner_id)
        return jsonify({
            'success': True,
            'purchase_orders': purchase_orders
        })
    except Exception as e:
        current_app.logger.error(f"발주서 이력 조회 실패: {str(e)}")
        return jsonify({
            'success': False,
            'message': '발주서 이력을 불러오는데 실패했습니다.'
        }), 500

@assets_bp.route('/api/partners/<int:partner_id>/quotation-requests', methods=['GET'])
@login_required
def get_partner_quotation_requests(partner_id):
    """특정 협력사의 견적서 요청 이력 조회"""
    try:
        quotation_requests = asset_core_service.get_quotation_requests_by_partner(partner_id)
        return jsonify({
            'success': True,
            'quotation_requests': quotation_requests
        })
    except Exception as e:
        current_app.logger.error(f"견적서 요청 이력 조회 실패: {str(e)}")
        return jsonify({
            'success': False,
            'message': '견적서 요청 이력을 불러오는데 실패했습니다.'
        }), 500

@assets_bp.route('/api/purchase-orders/<int:order_id>/download', methods=['GET'])
@login_required
def download_purchase_order(order_id):
    """발주서 PDF 다운로드"""
    try:
        pdf_path = asset_core_service.get_purchase_order_pdf_path(order_id)
        if pdf_path and os.path.exists(pdf_path):
            return send_file(pdf_path, as_attachment=True)
        else:
            return jsonify({
                'success': False,
                'message': 'PDF 파일을 찾을 수 없습니다.'
            }), 404
    except Exception as e:
        current_app.logger.error(f"발주서 PDF 다운로드 실패: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'PDF 다운로드에 실패했습니다.'
        }), 500

@assets_bp.route('/api/purchase-orders/<int:order_id>/resend', methods=['POST'])
@login_required
def resend_purchase_order(order_id):
    """발주서 재발송"""
    try:
        result = asset_core_service.resend_purchase_order(order_id)
        if result['success']:
            return jsonify({
                'success': True,
                'message': '발주서가 성공적으로 재발송되었습니다.'
            })
        else:
            return jsonify({
                'success': False,
                'message': result.get('message', '발주서 재발송에 실패했습니다.')
            }), 400
    except Exception as e:
        current_app.logger.error(f"발주서 재발송 실패: {str(e)}")
        return jsonify({
            'success': False,
            'message': '발주서 재발송 중 오류가 발생했습니다.'
        }), 500

@assets_bp.route('/api/quotation-requests/<int:request_id>/resend', methods=['POST'])
@login_required
def resend_quotation_request(request_id):
    """견적서 요청 재발송"""
    try:
        result = asset_core_service.resend_quotation_request(request_id)
        if result['success']:
            return jsonify({
                'success': True,
                'message': '견적서 요청이 성공적으로 재발송되었습니다.'
            })
        else:
            return jsonify({
                'success': False,
                'message': result.get('message', '견적서 요청 재발송에 실패했습니다.')
            }), 400
    except Exception as e:
        current_app.logger.error(f"견적서 요청 재발송 실패: {str(e)}")
        return jsonify({
            'success': False,
            'message': '견적서 요청 재발송 중 오류가 발생했습니다.'
        }), 500

@assets_bp.route('/api/quotation-requests/<int:request_id>/mark-received', methods=['POST'])
@login_required
def mark_quotation_received(request_id):
    """견적서 수신 상태로 변경"""
    try:
        result = asset_core_service.mark_quotation_as_received(request_id)
        if result['success']:
            return jsonify({
                'success': True,
                'message': '견적서 수신 상태로 변경되었습니다.'
            })
        else:
            return jsonify({
                'success': False,
                'message': result.get('message', '상태 변경에 실패했습니다.')
            }), 400
    except Exception as e:
        current_app.logger.error(f"견적서 상태 변경 실패: {str(e)}")
        return jsonify({
            'success': False,
            'message': '상태 변경 중 오류가 발생했습니다.'
        }), 500