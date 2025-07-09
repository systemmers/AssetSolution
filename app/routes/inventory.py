"""
자산실사 관련 라우트 모듈 (4-Layer Architecture)
"""
from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_required, current_user
from datetime import datetime, timedelta
from ..services.inventory_core_service import InventoryCoreService
from ..services.inventory_export_service import inventory_export_service

# Repository 인스턴스 생성
inventory_service = InventoryCoreService()

inventory_bp = Blueprint('inventory', __name__)

@inventory_bp.route('/')
@login_required
def index():
    """자산실사 목록 페이지"""
    try:
        # Service에서 데이터 조회
        result = inventory_service.get_inventory_list()
        
        return render_template('inventory/index.html', 
                             inventories=result['inventories'],
                             status_counts=result['stats'])
    except Exception as e:
        flash(f'데이터 조회 중 오류가 발생했습니다: {str(e)}', 'error')
        return render_template('inventory/index.html', 
                             inventories=[],
                             status_counts={})

@inventory_bp.route('/create', methods=['GET', 'POST'])
@login_required
def create():
    """자산실사 생성 페이지"""
    if request.method == 'POST':
        try:
            # 폼 데이터 수집
            inventory_data = {
                'name': request.form.get('name'),
                'start_date': request.form.get('start_date'),
                'end_date': request.form.get('end_date'),
                'manager': request.form.get('manager'),
                'department': request.form.get('department'),
                'description': request.form.get('description'),
                'target_count': int(request.form.get('target_count', 0))
            }
            
            # Service를 통해 생성
            new_inventory = inventory_service.create_inventory(inventory_data)
            
            flash('자산실사가 성공적으로 생성되었습니다.', 'success')
            return redirect(url_for('inventory.detail', inventory_id=new_inventory['id']))
            
        except Exception as e:
            flash(f'자산실사 생성 중 오류가 발생했습니다: {str(e)}', 'error')
    
    return render_template('inventory/create.html')

@inventory_bp.route('/detail/<inventory_id>')
@login_required
def detail(inventory_id):
    """자산실사 상세 페이지"""
    try:
        # Service에서 데이터 조회
        result = inventory_service.get_inventory_detail(int(inventory_id))
        
        return render_template('inventory/detail.html', 
                             inventory=result['inventory'],
                             details=result['details'],
                             discrepancies=result['discrepancies'])
    except Exception as e:
        flash(f'데이터 조회 중 오류가 발생했습니다: {str(e)}', 'error')
        return redirect(url_for('inventory.index'))

@inventory_bp.route('/report/<inventory_id>')
@login_required
def report(inventory_id):
    """자산실사 보고서 페이지"""
    try:
        # Service에서 데이터 조회
        result = inventory_service.get_inventory_detail(int(inventory_id))
        
        return render_template('inventory/report.html', 
                             inventory=result['inventory'],
                             details=result['details'])
    except Exception as e:
        flash(f'보고서 생성 중 오류가 발생했습니다: {str(e)}', 'error')
        return redirect(url_for('inventory.index'))

@inventory_bp.route('/edit/<inventory_id>', methods=['GET', 'POST'])
@login_required
def edit(inventory_id):
    """자산실사 수정 페이지"""
    try:
        if request.method == 'POST':
            # 수정 데이터 수집
            update_data = {
                'name': request.form.get('name'),
                'start_date': request.form.get('start_date'),
                'end_date': request.form.get('end_date'),
                'manager': request.form.get('manager'),
                'department': request.form.get('department'),
                'description': request.form.get('description'),
                'target_count': int(request.form.get('target_count', 0))
            }
            
            # Service를 통해 수정
            updated_inventory = inventory_service.update_inventory(int(inventory_id), update_data)
            
            flash('자산실사가 성공적으로 수정되었습니다.', 'success')
            return redirect(url_for('inventory.detail', inventory_id=inventory_id))
        
        # GET 요청 시 기존 데이터 조회
        result = inventory_service.get_inventory_detail(int(inventory_id))
        return render_template('inventory/edit.html', inventory=result['inventory'])
        
    except Exception as e:
        flash(f'자산실사 수정 중 오류가 발생했습니다: {str(e)}', 'error')
        return redirect(url_for('inventory.index'))

@inventory_bp.route('/discrepancies')
@login_required
def discrepancies():
    """불일치 목록 페이지"""
    try:
        # 필터 파라미터 수집
        page = int(request.args.get('page', 1))
        inventory_filter = request.args.get('inventory', '')
        type_filter = request.args.get('type', '')
        status_filter = request.args.get('status', '')
        date_filter = request.args.get('date', '')
        
        # Service에서 불일치 데이터 조회
        result = inventory_service.get_discrepancies_summary()
        
        # 실사 목록도 필터용으로 조회
        inventory_list = inventory_service.get_inventory_list()
        
        # 페이지네이션 계산 (간단한 예시)
        per_page = 20
        total_items = len(result['discrepancies'])
        total_pages = max(1, (total_items + per_page - 1) // per_page)
        
        return render_template('inventory/discrepancies.html', 
                             discrepancies=result['discrepancies'],
                             severity_stats=result['severity_stats'],
                             inventories=inventory_list['inventories'],
                             page=page,
                             total_pages=total_pages,
                             selected_inventory=inventory_filter,
                             selected_type=type_filter,
                             selected_status=status_filter,
                             selected_date=date_filter)
    except Exception as e:
        flash(f'불일치 데이터 조회 중 오류가 발생했습니다: {str(e)}', 'error')
        return render_template('inventory/discrepancies.html', 
                             discrepancies=[],
                             severity_stats={},
                             inventories=[],
                             page=1,
                             total_pages=1,
                             selected_inventory='',
                             selected_type='',
                             selected_status='',
                             selected_date='')

@inventory_bp.route('/discrepancy/resolve/<int:discrepancy_id>', methods=['POST'])
@login_required
def resolve_discrepancy(discrepancy_id):
    """불일치 해결 처리"""
    try:
        success = inventory_service.resolve_discrepancy(discrepancy_id)
        
        if success:
            flash('불일치가 성공적으로 해결되었습니다.', 'success')
        else:
            flash('불일치 해결에 실패했습니다.', 'error')
            
    except Exception as e:
        flash(f'불일치 해결 중 오류가 발생했습니다: {str(e)}', 'error')
    
    return redirect(url_for('inventory.discrepancies'))

@inventory_bp.route('/history')
@login_required
def history():
    """자산실사 이력 페이지"""
    try:
        # 완료된 실사만 조회
        result = inventory_service.get_inventory_list(status_filter='completed')
        
        return render_template('inventory/history.html', 
                             inventories=result['inventories'])
    except Exception as e:
        flash(f'이력 조회 중 오류가 발생했습니다: {str(e)}', 'error')
        return render_template('inventory/history.html', inventories=[])

@inventory_bp.route('/export/csv')
@login_required
def export_csv():
    """CSV 내보내기"""
    try:
        data = inventory_export_service.export_to_csv()
        flash('CSV 파일이 성공적으로 생성되었습니다.', 'success')
        return redirect(url_for('inventory.index'))
    except Exception as e:
        flash(f'CSV 내보내기 중 오류가 발생했습니다: {str(e)}', 'error')
        return redirect(url_for('inventory.index'))

@inventory_bp.route('/export/excel')
@login_required
def export_excel():
    """Excel 내보내기"""
    try:
        data = inventory_export_service.export_to_excel()
        flash('Excel 파일이 성공적으로 생성되었습니다.', 'success')
        return redirect(url_for('inventory.index'))
    except Exception as e:
        flash(f'Excel 내보내기 중 오류가 발생했습니다: {str(e)}', 'error')
        return redirect(url_for('inventory.index')) 
