"""
계약 관리 관련 라우트 모듈
"""
from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_required

# Service imports
from ..services.contract_core_service import ContractCoreService
from ..services.contract_export_service import ContractExportService

contract_bp = Blueprint('contract', __name__)

# Service 인스턴스 생성
contract_service = ContractCoreService()
export_service = ContractExportService()

@contract_bp.route('/')
@login_required
def index():
    """
    계약 목록 페이지
    """
    # 검색 및 필터링 매개변수
    search_query = request.args.get('q', '')
    contract_type = request.args.get('type', '')
    status = request.args.get('status', '')
    
    # 페이지네이션을 위한 변수
    page = request.args.get('page', 1, type=int)
    per_page = 10  # 페이지당 항목 수
    
    # Service를 통한 계약 데이터 조회
    current_page_contracts, pagination_info = contract_service.get_contract_list(
        search_query=search_query if search_query else None,
        contract_type=contract_type if contract_type else None,
        status=status if status else None,
        page=page,
        per_page=per_page
    )
    
    # 통계 데이터 조회
    stats = contract_service.get_contract_statistics()
    
    return render_template('contract/index.html', 
                          contracts=current_page_contracts,
                          page=pagination_info['page'], 
                          total_pages=pagination_info['total_pages'],
                          total_items=pagination_info['total_items'],
                          stats=stats,
                          max=max,
                          min=min)

@contract_bp.route('/create', methods=['GET', 'POST'])
@login_required
def create():
    """
    계약 생성 페이지
    """
    if request.method == 'POST':
        try:
            # 폼 데이터 수집
            contract_data = {
                'name': request.form.get('name'),
                'vendor': request.form.get('vendor'),
                'start_date': request.form.get('start_date'),
                'end_date': request.form.get('end_date'),
                'type': request.form.get('type'),
                'amount': float(request.form.get('amount', 0)),
                'department': request.form.get('department'),
                'manager': request.form.get('manager'),
                'payment_term': request.form.get('payment_term')
            }
            
            # Service를 통한 계약 생성
            created_contract = contract_service.create_contract(contract_data)
            flash(f'계약 "{created_contract["name"]}"이 등록되었습니다.', 'success')
            return redirect(url_for('contract.detail', contract_id=created_contract['id']))
            
        except ValueError as e:
            flash(f'입력 오류: {str(e)}', 'danger')
        except Exception as e:
            flash('계약 등록 중 오류가 발생했습니다.', 'danger')
    
    return render_template('contract/create.html')

@contract_bp.route('/<int:contract_id>')
@login_required
def detail(contract_id):
    """
    계약 상세 정보 페이지
    """
    # Service를 통한 계약 상세 정보 조회
    contract = contract_service.get_contract_detail(contract_id)
    if not contract:
        flash('해당 계약을 찾을 수 없습니다.', 'danger')
        return redirect(url_for('contract.index'))
    
    return render_template('contract/detail.html', contract=contract, contract_id=contract_id)

@contract_bp.route('/<int:contract_id>/edit', methods=['GET', 'POST'])
@login_required
def edit(contract_id):
    """
    계약 수정 페이지
    """
    # Service를 통한 계약 데이터 조회
    contract = contract_service.get_contract_detail(contract_id)
    
    if not contract:
        flash('해당 계약을 찾을 수 없습니다.', 'danger')
        return redirect(url_for('contract.index'))
        
    if request.method == 'POST':
        try:
            # 폼 데이터 수집
            update_data = {}
            for field in ['name', 'vendor', 'start_date', 'end_date', 'type', 'status', 'department', 'manager', 'payment_term']:
                if request.form.get(field):
                    update_data[field] = request.form.get(field)
            
            if request.form.get('amount'):
                update_data['amount'] = float(request.form.get('amount'))
            
            # Service를 통한 계약 수정
            updated_contract = contract_service.update_contract(contract_id, update_data)
            if updated_contract:
                flash('계약 정보가 수정되었습니다.', 'success')
                return redirect(url_for('contract.detail', contract_id=contract_id))
            else:
                flash('계약 수정에 실패했습니다.', 'danger')
                
        except ValueError as e:
            flash(f'입력 오류: {str(e)}', 'danger')
        except Exception as e:
            flash('계약 수정 중 오류가 발생했습니다.', 'danger')
        
    return render_template('contract/edit.html', contract_id=contract_id, contract=contract)

@contract_bp.route('/<int:contract_id>/delete', methods=['POST'])
@login_required
def delete(contract_id):
    """
    계약 삭제
    """
    try:
        # Service를 통한 계약 삭제
        if contract_service.delete_contract(contract_id):
            flash('계약이 삭제되었습니다.', 'success')
        else:
            flash('계약 삭제에 실패했습니다.', 'danger')
    except ValueError as e:
        flash(f'삭제 오류: {str(e)}', 'danger')
    except Exception as e:
        flash('계약 삭제 중 오류가 발생했습니다.', 'danger')
    
    return redirect(url_for('contract.index'))

@contract_bp.route('/renewal')
@login_required
def renewal():
    """
    계약 갱신 목록 페이지
    """
    # Service를 통한 만료 예정 계약 조회
    expiring_contracts = contract_service.get_expiring_contracts(days_ahead=60)
    return render_template('contract/renewal.html', contracts=expiring_contracts)

@contract_bp.route('/statistics')
@login_required
def statistics():
    """
    계약 통계 페이지
    """
    # Service를 통한 통계 정보 조회
    stats = contract_service.get_contract_statistics()
    return render_template('contract/statistics.html', stats=stats)

@contract_bp.route('/history')
@login_required
def history():
    """
    계약 이력 페이지
    """
    return render_template('contract/history.html')

@contract_bp.route('/export_csv')
@login_required
def export_csv():
    """
    계약 목록을 CSV 파일로 내보내기
    """
    # 검색 및 필터링 매개변수
    search_query = request.args.get('q', '')
    contract_type = request.args.get('type', '')
    status = request.args.get('status', '')
    
    # ExportService를 통한 CSV 내보내기
    return export_service.export_to_csv(
        search_query=search_query if search_query else None,
        contract_type=contract_type if contract_type else None,
        status=status if status else None
    )

@contract_bp.route('/export_excel')
@login_required
def export_excel():
    """
    계약 목록을 Excel 파일로 내보내기
    """
    # 검색 및 필터링 매개변수
    search_query = request.args.get('q', '')
    contract_type = request.args.get('type', '')
    status = request.args.get('status', '')
    include_charts = request.args.get('charts', 'false').lower() == 'true'
    
    # ExportService를 통한 Excel 내보내기
    return export_service.export_to_excel(
        search_query=search_query if search_query else None,
        contract_type=contract_type if contract_type else None,
        status=status if status else None,
        include_charts=include_charts
    )

@contract_bp.route('/export_summary')
@login_required
def export_summary():
    """
    계약 요약 보고서 내보내기
    """
    report_type = request.args.get('type', 'monthly')  # monthly, quarterly, yearly
    
    # ExportService를 통한 요약 보고서 생성
    return export_service.export_summary_report(report_type=report_type) 