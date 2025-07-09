"""
자산 운영 관련 라우트 모듈 (자산 대여, 반납, 폐기 등)
"""
from flask import Blueprint, render_template, redirect, url_for, flash, request, send_file, jsonify
from flask_login import login_required, current_user
from datetime import datetime
from ..services.operations_core_service import OperationsCoreService
from ..services.operations_statistics_service import OperationsStatisticsService
from ..services.operations.disposal_service import DisposalService

operations_bp = Blueprint('operations', __name__)

# Service 인스턴스 생성
operations_service = OperationsCoreService()
statistics_service = OperationsStatisticsService()
disposal_service = DisposalService()

@operations_bp.route('/')
@login_required
def index():
    """
    운영 관리 메인 페이지
    """
    return render_template('operations/index.html')

# 자산 대여 관련 라우트
@operations_bp.route('/loans')
@login_required
def loan_index():
    """
    자산 대여 목록 페이지
    """
    # 필터링 및 페이지네이션 매개변수 처리
    status = request.args.get('status', '')
    user_id = request.args.get('user', '')
    department = request.args.get('department', '')
    page = request.args.get('page', 1, type=int)
    per_page = 10
    
    # Service를 통한 데이터 조회 (비즈니스 로직 적용)
    result = operations_service.get_loan_list_with_filters(
        page=page,
        per_page=per_page,
        status=status if status else None,
        user_id=user_id if user_id else None,
        department=department if department else None
    )
    
    return render_template('operations/loan_index.html', 
                           loans=result['loans'],
                           page=result['pagination']['current_page'],
                           total_pages=result['pagination']['total_pages'],
                           total_items=result['pagination']['total_items'],
                           now=result['current_date'])

@operations_bp.route('/loans/create', methods=['GET'])
@login_required
def loan_form():
    """
    자산 대여 신청/등록 페이지
    """
    return render_template('operations/loan_form.html')

@operations_bp.route('/loans/<int:loan_id>')
@login_required
def loan_detail(loan_id):
    """
    자산 대여 상세 페이지
    """
    # Service를 통한 데이터 조회 (비즈니스 로직 적용)
    loan = operations_service.get_loan_detail(loan_id)
    if not loan:
        flash('해당 대여 기록을 찾을 수 없습니다.', 'danger')
        return redirect(url_for('operations.loan_index'))
    
    return render_template('operations/loan_detail.html', loan=loan)

# 자산 반납 관련 라우트
@operations_bp.route('/returns', methods=['GET'])
@login_required
def return_history():
    """
    자산 반납 이력 페이지
    """
    # Service를 통한 반납 이력 조회 (비즈니스 로직 적용)
    returns = operations_service.get_return_history()
    
    return render_template('operations/return_history.html', returns=returns)

@operations_bp.route('/returns/create', methods=['GET'])
@login_required
def return_form():
    """
    자산 반납 처리 양식 페이지
    """
    return render_template('operations/return_form.html')

# 자산 폐기 관련 라우트
@operations_bp.route('/disposals')
@login_required
def disposal_index():
    """
    자산 폐기 목록 페이지
    """
    # Service를 통한 폐기 목록 조회 (비즈니스 로직 적용)
    disposals = operations_service.get_disposal_list()
    
    return render_template('operations/disposal_index.html', disposals=disposals)

@operations_bp.route('/disposals/create', methods=['GET'])
@login_required
def disposal_form():
    """
    자산 폐기 신청/처리 양식 페이지
    """
    return render_template('operations/disposal_form.html')

@operations_bp.route('/disposals/<int:disposal_id>')
@login_required
def disposal_detail(disposal_id):
    """
    자산 폐기 상세 페이지
    """
    # Service를 통한 폐기 상세 정보 조회
    disposal = operations_service.get_disposal_detail(disposal_id)
    if not disposal:
        flash('해당 폐기 기록을 찾을 수 없습니다.', 'danger')
        return redirect(url_for('operations.disposal_index'))
    
    return render_template('operations/disposal_detail.html', disposal=disposal)

# 자산 이력 조회 라우트
@operations_bp.route('/history')
@login_required
def history():
    """
    자산별 이력(대여/반납/폐기) 종합 조회 페이지
    """
    # 필터링 매개변수 처리
    asset_id = request.args.get('asset_id', '')
    user_name = request.args.get('user_name', '')
    operation_type = request.args.get('operation_type', '')
    status = request.args.get('status', '')
    start_date = request.args.get('start_date', '')
    end_date = request.args.get('end_date', '')
    
    # Service를 통한 이력 데이터 조회
    history_data = statistics_service.get_operation_history(
        asset_id=asset_id if asset_id else None,
        user_name=user_name if user_name else None,
        operation_type=operation_type if operation_type else None,
        status=status if status else None,
        start_date=start_date if start_date else None,
        end_date=end_date if end_date else None
    )
    
    return render_template('operations/history.html', 
                         history_records=history_data['records'],
                         stats=history_data['stats'])

@operations_bp.route('/history/<string:history_id>')
@login_required
def history_detail(history_id):
    """
    자산 이력 상세 페이지
    """
    history = statistics_service.get_history_detail(history_id)
    if not history:
        flash('해당 이력 정보를 찾을 수 없습니다.', 'danger')
        return redirect(url_for('operations.history'))
        
    return render_template('operations/detail.html', history=history)


# 운영 통계 및 보고서 라우트
@operations_bp.route('/statistics')
@login_required
def statistics():
    """
    운영 통계 및 보고서 페이지
    """
    # Service를 통한 통계 데이터 조회
    stats_data = statistics_service.get_operations_statistics()
    
    return render_template('operations/statistics.html', 
                         statistics=stats_data)

@operations_bp.route('/api/generate-report', methods=['POST'])
@login_required
def generate_report():
    """
    보고서 생성 API
    """
    report_type = request.json.get('report_type', 'monthly')
    start_date = request.json.get('start_date')
    end_date = request.json.get('end_date')
    include_sections = request.json.get('include_sections', [])
    
    # Service를 통한 보고서 생성
    report_data = statistics_service.generate_operations_report(
        report_type=report_type,
        start_date=start_date,
        end_date=end_date,
        include_sections=include_sections
    )
    
    return {'success': True, 'report_id': report_data['report_id']}

@operations_bp.route('/api/download-report/<report_format>')
@login_required
def download_report(report_format):
    """
    보고서 다운로드 API
    """
    report_id = request.args.get('report_id')
    
    # Service를 통한 보고서 파일 생성 및 다운로드
    file_path = statistics_service.export_report(report_id, report_format)
    
    return send_file(file_path, as_attachment=True)


@operations_bp.route('/disposal/planning')
@login_required
def disposal_planning():
    """처분 계획 관리 페이지"""
    try:
        # Mock 데이터를 사용한 처분 계획 데이터 생성
        disposal_plans = operations_service.get_disposal_planning_data()
        
        # 안전한 날짜 처리를 위한 헬퍼 함수
        def safe_get_month(date_obj):
            """날짜 객체에서 안전하게 월을 추출"""
            if not date_obj:
                return None
            if hasattr(date_obj, 'month'):
                return date_obj.month
            if isinstance(date_obj, str):
                try:
                    from datetime import datetime
                    parsed_date = datetime.strptime(date_obj, '%Y-%m-%d')
                    return parsed_date.month
                except:
                    return None
            return None
        
        # 통계 데이터 생성 (안전한 날짜 처리)
        current_month = datetime.now().month
        monthly_plan_count = len([p for p in disposal_plans 
                                 if safe_get_month(p.get('planned_date')) == current_month])
        total_budget = sum(p.get('estimated_value', 0) for p in disposal_plans)
        
        disposal_stats = {
            'sale_count': len([p for p in disposal_plans if p.get('disposal_type') == 'sale']),
            'donate_transfer_count': len([p for p in disposal_plans if p.get('disposal_type') in ['donate', 'transfer']])
        }
        
        # 월별 계획 데이터 (안전한 날짜 처리)
        monthly_plans = [p for p in disposal_plans 
                        if safe_get_month(p.get('planned_date')) == current_month]
        
        # 차트 데이터
        disposal_type_stats = {
            'sale': disposal_stats['sale_count'],
            'donate': len([p for p in disposal_plans if p.get('disposal_type') == 'donate']),
            'transfer': len([p for p in disposal_plans if p.get('disposal_type') == 'transfer']),
            'disposal': len([p for p in disposal_plans if p.get('disposal_type') == 'disposal'])
        }
        
        budget_progress_data = {
            'progress': [20, 35, 45, 60, 75, 85]  # Mock 예산 진행률 데이터
        }
        
        calendar_events = []  # Mock 달력 이벤트 데이터
        
        return render_template('operations/disposal_planning.html',
                             disposal_plans=disposal_plans,
                             monthly_plan_count=monthly_plan_count,
                             total_budget=total_budget,
                             disposal_stats=disposal_stats,
                             monthly_plans=monthly_plans,
                             disposal_type_stats=disposal_type_stats,
                             budget_progress_data=budget_progress_data,
                             calendar_events=calendar_events)
    except Exception as e:
        flash(f'처분 계획 데이터 조회 중 오류가 발생했습니다: {str(e)}', 'error')
        return redirect(url_for('operations.index'))


@operations_bp.route('/allocation/management')
@login_required
def allocation_management():
    """지급 관리 페이지"""
    try:
        # 지급 유형별 통계 데이터
        allocation_requests = operations_service.get_allocation_requests_data()
        
        allocation_stats = {
            'temporary_count': len([r for r in allocation_requests if 'temporary' in r.get('allocation_type', '')]),
            'permanent_count': len([r for r in allocation_requests if 'permanent' in r.get('allocation_type', '')]),
            'consumable_count': len([r for r in allocation_requests if 'consumable' in r.get('allocation_type', '')]),
            'department_count': len([r for r in allocation_requests if 'department' in r.get('allocation_type', '')]),
            'special_count': len([r for r in allocation_requests if 'special' in r.get('allocation_type', '')]),
            'total_count': len(allocation_requests)
        }
        
        # 월별 지급 현황 데이터
        monthly_allocation_data = {
            'labels': ['1월', '2월', '3월', '4월', '5월', '6월'],
            'data': [12, 18, 15, 22, 16, 19]
        }
        
        # 지급 유형 분포 데이터
        allocation_type_data = {
            'labels': ['임시지급', '영구지급', '소모품', '부서공용', '특별지급'],
            'data': [
                allocation_stats['temporary_count'],
                allocation_stats['permanent_count'],
                allocation_stats['consumable_count'],
                allocation_stats['department_count'],
                allocation_stats['special_count']
            ]
        }
        
        return render_template(
            'operations/allocation_management.html',
            allocation_stats=allocation_stats,
            allocation_requests=allocation_requests,
            monthly_allocation_data=monthly_allocation_data,
            allocation_type_data=allocation_type_data
        )
    except Exception as e:
        flash(f'지급 관리 데이터 조회 중 오류가 발생했습니다: {str(e)}', 'error')
        return redirect(url_for('operations.index'))

@operations_bp.route('/return/approval-dashboard')
def return_approval_dashboard():
    """반납 승인 대시보드"""
    try:
        # 승인 대기 중인 반납 요청 통계
        approval_stats = operations_service.get_return_approval_stats()
        
        return render_template('operations/return_approval_dashboard.html',
                             approval_stats=approval_stats)
    except Exception as e:
        flash('반납 승인 대시보드를 불러오는 중 오류가 발생했습니다.', 'error')
        return redirect(url_for('operations.index'))

@operations_bp.route('/api/return/workflows', methods=['GET'])
@login_required
def get_return_workflows():
    """반납 워크플로우 목록 조회 API"""
    try:
        # 쿼리 파라미터
        status = request.args.get('status', '')
        department = request.args.get('department', '')
        urgency = request.args.get('urgency', '')
        search = request.args.get('search', '')
        
        # 워크플로우 목록 조회
        workflows = operations_service.get_return_workflows(
            status=status,
            department=department,
            urgency=urgency,
            search=search
        )
        
        return jsonify({
            'success': True,
            'data': workflows,
            'total': len(workflows)
        })
        
    except Exception as e:
        flash('반납 워크플로우 목록을 불러오는 중 오류가 발생했습니다.', 'error')
        return jsonify({
            'success': False,
            'message': '워크플로우 목록을 불러오는 중 오류가 발생했습니다.'
        }), 500

@operations_bp.route('/api/return/workflows/<workflow_id>', methods=['GET'])
def get_return_workflow_detail(workflow_id):
    """반납 워크플로우 상세 정보 조회 API"""
    try:
        workflow = operations_service.get_return_workflow_detail(workflow_id)
        
        if not workflow:
            return jsonify({
                'success': False,
                'message': '워크플로우를 찾을 수 없습니다.'
            }), 404
        
        return jsonify({
            'success': True,
            'data': workflow
        })
        
    except Exception as e:
        flash('반납 워크플로우 상세 정보를 불러오는 중 오류가 발생했습니다.', 'error')
        return jsonify({
            'success': False,
            'message': '워크플로우 상세 정보를 불러오는 중 오류가 발생했습니다.'
        }), 500

@operations_bp.route('/api/return/workflows/<workflow_id>/approve', methods=['POST'])
def approve_return_workflow(workflow_id):
    """반납 워크플로우 승인 API"""
    try:
        data = request.get_json()
        approver_id = data.get('approver_id')
        comments = data.get('comments', '')
        
        if not approver_id:
            return jsonify({
                'success': False,
                'message': '승인자 정보가 필요합니다.'
            }), 400
        
        # 승인 처리
        result = operations_service.approve_return_workflow(
            workflow_id=workflow_id,
            approver_id=approver_id,
            comments=comments
        )
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': '승인이 완료되었습니다.',
                'data': result['workflow']
            })
        else:
            return jsonify({
                'success': False,
                'message': result['message']
            }), 400
        
    except Exception as e:
        flash('반납 워크플로우 승인 중 오류가 발생했습니다.', 'error')
        return jsonify({
            'success': False,
            'message': '승인 처리 중 오류가 발생했습니다.'
        }), 500

@operations_bp.route('/api/return/workflows/<workflow_id>/reject', methods=['POST'])
def reject_return_workflow(workflow_id):
    """반납 워크플로우 거부 API"""
    try:
        data = request.get_json()
        approver_id = data.get('approver_id')
        reason = data.get('reason', '')
        
        if not approver_id:
            return jsonify({
                'success': False,
                'message': '승인자 정보가 필요합니다.'
            }), 400
        
        if not reason:
            return jsonify({
                'success': False,
                'message': '거부 사유가 필요합니다.'
            }), 400
        
        # 거부 처리
        result = operations_service.reject_return_workflow(
            workflow_id=workflow_id,
            approver_id=approver_id,
            reason=reason
        )
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': '거부가 완료되었습니다.',
                'data': result['workflow']
            })
        else:
            return jsonify({
                'success': False,
                'message': result['message']
            }), 400
        
    except Exception as e:
        flash('반납 워크플로우 거부 중 오류가 발생했습니다.', 'error')
        return jsonify({
            'success': False,
            'message': '거부 처리 중 오류가 발생했습니다.'
        }), 500

@operations_bp.route('/api/return/workflows/bulk-approve', methods=['POST'])
def bulk_approve_return_workflows():
    """반납 워크플로우 일괄 승인 API"""
    try:
        data = request.get_json()
        workflow_ids = data.get('workflow_ids', [])
        approver_id = data.get('approver_id')
        comments = data.get('comments', '')
        
        if not workflow_ids:
            return jsonify({
                'success': False,
                'message': '승인할 워크플로우를 선택해주세요.'
            }), 400
        
        if not approver_id:
            return jsonify({
                'success': False,
                'message': '승인자 정보가 필요합니다.'
            }), 400
        
        # 일괄 승인 처리
        result = operations_service.bulk_approve_return_workflows(
            workflow_ids=workflow_ids,
            approver_id=approver_id,
            comments=comments
        )
        
        return jsonify({
            'success': True,
            'message': f'{result["success_count"]}건의 승인이 완료되었습니다.',
            'data': {
                'success_count': result['success_count'],
                'error_count': result['error_count'],
                'errors': result.get('errors', [])
            }
        })
        
    except Exception as e:
        flash('반납 워크플로우 일괄 승인 중 오류가 발생했습니다.', 'error')
        return jsonify({
            'success': False,
            'message': '일괄 승인 처리 중 오류가 발생했습니다.'
        }), 500

@operations_bp.route('/return-status-tracking')
@login_required
def return_status_tracking():
    """반납 상태 추적 페이지"""
    return render_template('operations/return_status_tracking.html')

@operations_bp.route('/return-notifications')
@login_required
def return_notifications():
    """반납 알림 관리 페이지"""
    return render_template('operations/return_notifications.html')

@operations_bp.route('/return-approval-workflow')
@login_required
def return_approval_workflow():
    """반납 승인 워크플로우 페이지"""
    return render_template('operations/return_approval_workflow.html')

@operations_bp.route('/asset-disposal-planning')
@login_required
def asset_disposal_planning():
    """자산 폐기 계획 및 승인 시스템 페이지"""
    try:
        # Service를 통한 폐기 계획 통계 조회
        disposal_stats = operations_service.get_disposal_planning_statistics()
        
        # 프론트엔드에서 사용할 통계 형태로 변환
        stats_for_frontend = {
            'pending': disposal_stats.get('pending_count', 0),
            'approved': disposal_stats.get('approved_count', 0), 
            'scheduled': disposal_stats.get('scheduled_count', 0),
            'completed': disposal_stats.get('completed_count', 0)
        }
        
        # 초기 로딩용 데이터 (승인대기 상태 5개)
        initial_data_result = operations_service.get_disposal_planning_data_by_status(
            status='pending', page=1, per_page=5
        )
        
        return render_template('operations/asset_disposal_planning.html',
                             disposal_stats=stats_for_frontend,
                             initial_data=initial_data_result['data'])
        
    except Exception as e:
        flash(f'폐기 계획 데이터 조회 중 오류가 발생했습니다: {str(e)}', 'error')
        return render_template('operations/asset_disposal_planning.html',
                             disposal_stats={'pending': 0, 'approved': 0, 'scheduled': 0, 'completed': 0},
                             initial_data=[])

@operations_bp.route('/api/disposal-planning-data')
@login_required
def get_disposal_planning_api():
    """폐기 계획 데이터 API 엔드포인트"""
    try:
        status = request.args.get('status', 'all')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # 상태별 필터링 (Repository 상태와 매칭)
        repository_status = None
        if status == 'pending':
            repository_status = 'pending'
        elif status == 'approved':
            repository_status = 'approved'
        elif status == 'scheduled':
            repository_status = 'scheduled'
        elif status == 'completed':
            repository_status = 'completed'
        # status가 'all'이거나 다른 값이면 repository_status는 None으로 유지
        
        # Service에서 상태별 데이터 조회 (페이지네이션 포함)
        result = operations_service.get_disposal_planning_data_by_status(
            status=repository_status, 
            page=page, 
            per_page=per_page
        )
        
        return jsonify({
            'success': True,
            'data': result['data'],
            'pagination': result['pagination']
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'데이터 조회 중 오류가 발생했습니다: {str(e)}'
        }), 500

@operations_bp.route('/api/disposal-planning-statistics')
@login_required
def get_disposal_planning_statistics_api():
    """폐기 계획 통계 데이터 API 엔드포인트"""
    try:
        # Service에서 통계 데이터 조회
        statistics = operations_service.get_disposal_planning_statistics()
        
        return jsonify({
            'success': True,
            'data': statistics
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'통계 데이터 조회 중 오류가 발생했습니다: {str(e)}'
        }), 500

# ==================== 대여 관리 API (신규 추가) ====================

@operations_bp.route('/api/loans', methods=['GET'])
@login_required
def get_loans_api():
    """대여 목록 조회 API"""
    try:
        # 쿼리 파라미터 수집
        status = request.args.get('status', '')
        department = request.args.get('department', '')
        user_name = request.args.get('user_name', '')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Service를 통해 대여 목록 조회
        result = operations_service.get_loans_data(
            status=status if status else None,
            department=department if department else None,
            user_name=user_name if user_name else None,
            page=page,
            per_page=per_page
        )
        
        return jsonify({
            'success': True,
            'data': result['loans'],
            'pagination': result['pagination']
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'대여 목록 조회 중 오류가 발생했습니다: {str(e)}'
        }), 500

@operations_bp.route('/api/loans/<int:loan_id>', methods=['GET'])
@login_required
def get_loan_detail_api(loan_id):
    """대여 상세 정보 조회 API"""
    try:
        # Service를 통해 대여 상세 정보 조회
        loan = operations_service.get_loan_detail(loan_id)
        
        if not loan:
            return jsonify({
                'success': False,
                'message': '해당 대여 정보를 찾을 수 없습니다.'
            }), 404
        
        return jsonify({
            'success': True,
            'data': loan
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'대여 상세 정보 조회 중 오류가 발생했습니다: {str(e)}'
        }), 500

@operations_bp.route('/api/loans/statistics', methods=['GET'])
@login_required
def get_loan_statistics_api():
    """대여 통계 조회 API"""
    try:
        # Service를 통해 대여 통계 조회
        statistics = operations_service.get_loan_statistics()
        
        return jsonify({
            'success': True,
            'data': statistics
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'대여 통계 조회 중 오류가 발생했습니다: {str(e)}'
        }), 500

# ==================== 반납 관리 API (신규 추가) ====================

@operations_bp.route('/api/loans/active', methods=['GET'])
@login_required
def get_active_loans_api():
    """현재 대여 중인 자산 목록 조회 API (반납용)"""
    try:
        # 검색 필터 파라미터 수집
        asset_code = request.args.get('assetCode', '')
        asset_name = request.args.get('assetName', '')
        borrower = request.args.get('borrower', '')
        department = request.args.get('department', '')
        
        # Service를 통해 현재 대여 중인 자산 목록 조회
        result = operations_service.get_active_loans_data(
            asset_code=asset_code if asset_code else None,
            asset_name=asset_name if asset_name else None,
            borrower=borrower if borrower else None,
            department=department if department else None
        )
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'대여 중인 자산 목록 조회 중 오류가 발생했습니다: {str(e)}'
        }), 500

@operations_bp.route('/api/return/workflows', methods=['GET'])
@login_required
def get_return_workflows_api():
    """반납 워크플로우 목록 조회 API"""
    try:
        # 필터 파라미터 수집
        status = request.args.get('status', '')
        department = request.args.get('department', '')
        urgency = request.args.get('urgency', '')
        search = request.args.get('search', '')
        
        # Service를 통해 반납 워크플로우 목록 조회
        workflows = operations_service.get_return_workflows(
            status=status,
            department=department,
            urgency=urgency,
            search=search
        )
        
        # 통계 계산
        stats = {}
        all_workflows = operations_service.get_return_workflows()
        for workflow in all_workflows:
            step = workflow.get('current_step', 'unknown')
            stats[step] = stats.get(step, 0) + 1
        
        return jsonify({
            'success': True,
            'data': workflows,
            'stats': stats,
            'pagination': {
                'current_page': 1,
                'total_pages': 1,
                'total_items': len(workflows)
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'반납 워크플로우 목록 조회 중 오류가 발생했습니다: {str(e)}'
        }), 500

@operations_bp.route('/api/return/workflows/<workflow_id>', methods=['GET'])
@login_required
def get_return_workflow_detail_api(workflow_id):
    """반납 워크플로우 상세 정보 조회 API"""
    try:
        # Service를 통해 워크플로우 상세 정보 조회
        workflow_detail = operations_service.get_return_workflow_detail(workflow_id)
        
        if not workflow_detail:
            return jsonify({
                'success': False,
                'message': '해당 워크플로우를 찾을 수 없습니다.'
            }), 404
        
        return jsonify({
            'success': True,
            'data': workflow_detail
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'워크플로우 상세 정보 조회 중 오류가 발생했습니다: {str(e)}'
        }), 500

# ==================== 대시보드 통계 API (신규 추가) ====================

@operations_bp.route('/api/dashboard/refresh', methods=['GET'])
@login_required
def get_dashboard_refresh_api():
    """대시보드 데이터 새로고침 API"""
    try:
        # Service를 통해 통합 대시보드 통계 조회
        dashboard_stats = operations_service.get_operations_dashboard_data()
        
        return jsonify({
            'success': True,
            'timestamp': datetime.now().isoformat(),
            'stats': dashboard_stats
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'대시보드 데이터 조회 중 오류가 발생했습니다: {str(e)}'
        }), 500

# ===========================================
# 새로 추가된 API 엔드포인트들
# ===========================================

@operations_bp.route('/api/assets/search', methods=['POST'])
@login_required
def search_assets_api():
    """자산 검색 API"""
    try:
        data = request.get_json()
        search_query = data.get('search_query', '')
        category_id = data.get('category_id')
        status = data.get('status')
        location = data.get('location')
        
        # Service를 통한 자산 검색
        results = operations_service.search_assets(
            search_query=search_query,
            category_id=category_id,
            status=status,
            location=location
        )
        
        return jsonify({
            'success': True,
            'data': {
                'assets': results,
                'total': len(results)
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'자산 검색 중 오류가 발생했습니다: {str(e)}'
        }), 500

@operations_bp.route('/api/operations/disposal', methods=['POST'])
@login_required
def submit_disposal_request_api():
    """폐기 신청 API"""
    try:
        data = request.get_json()
        
        # 필수 필드 검증
        required_fields = ['asset_id', 'disposal_reason', 'disposal_type']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'{field} 필드가 필요합니다.'
                }), 400
        
        # Service를 통한 폐기 신청 처리
        result = operations_service.submit_disposal_request(
            asset_id=data['asset_id'],
            disposal_reason=data['disposal_reason'],
            disposal_type=data['disposal_type'],
            estimated_value=data.get('estimated_value'),
            disposal_date=data.get('disposal_date'),
            notes=data.get('notes', ''),
            attachments=data.get('attachments', []),
            requester_id=current_user.id
        )
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': '폐기 신청이 성공적으로 제출되었습니다.',
                'data': {
                    'disposal_id': result['disposal_id']
                }
            })
        else:
            return jsonify({
                'success': False,
                'message': result['message']
            }), 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'폐기 신청 처리 중 오류가 발생했습니다: {str(e)}'
        }), 500

@operations_bp.route('/api/operations/return/workflows', methods=['POST'])
@login_required
def get_return_workflows_list_api():
    """반납 워크플로우 목록 조회 API (프론트엔드용)"""
    try:
        data = request.get_json() or {}
        include_timeline = data.get('include_timeline', False)
        include_comments = data.get('include_comments', False)
        
        # Service를 통한 워크플로우 목록 조회
        workflows = operations_service.get_return_workflows_detailed(
            include_timeline=include_timeline,
            include_comments=include_comments
        )
        
        return jsonify({
            'success': True,
            'data': {
                'workflows': workflows
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'워크플로우 목록 조회 중 오류가 발생했습니다: {str(e)}'
        }), 500

@operations_bp.route('/api/operations/return/workflows/approve', methods=['POST'])
@login_required
def approve_workflow_api():
    """워크플로우 승인 API"""
    try:
        data = request.get_json()
        workflow_id = data.get('workflow_id')
        comment = data.get('comment', '')
        
        if not workflow_id:
            return jsonify({
                'success': False,
                'message': 'workflow_id가 필요합니다.'
            }), 400
        
        # Service를 통한 승인 처리
        result = operations_service.approve_return_workflow(
            workflow_id=workflow_id,
            approver_id=current_user.id,
            comments=comment
        )
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': '워크플로우가 승인되었습니다.'
            })
        else:
            return jsonify({
                'success': False,
                'message': result['message']
            }), 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'승인 처리 중 오류가 발생했습니다: {str(e)}'
        }), 500

@operations_bp.route('/api/operations/return/workflows/reject', methods=['POST'])
@login_required
def reject_workflow_api():
    """워크플로우 거부 API"""
    try:
        data = request.get_json()
        workflow_id = data.get('workflow_id')
        reason = data.get('reason', '')
        
        if not workflow_id:
            return jsonify({
                'success': False,
                'message': 'workflow_id가 필요합니다.'
            }), 400
        
        if not reason:
            return jsonify({
                'success': False,
                'message': '거부 사유가 필요합니다.'
            }), 400
        
        # Service를 통한 거부 처리
        result = operations_service.reject_return_workflow(
            workflow_id=workflow_id,
            approver_id=current_user.id,
            reason=reason
        )
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': '워크플로우가 거부되었습니다.'
            })
        else:
            return jsonify({
                'success': False,
                'message': result['message']
            }), 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'거부 처리 중 오류가 발생했습니다: {str(e)}'
        }), 500

@operations_bp.route('/api/operations/return/workflows/bulk-approve', methods=['POST'])
@login_required
def bulk_approve_workflows_api():
    """워크플로우 대량 승인 API"""
    try:
        data = request.get_json()
        workflow_ids = data.get('workflow_ids', [])
        comment = data.get('comment', '')
        
        if not workflow_ids:
            return jsonify({
                'success': False,
                'message': '승인할 워크플로우 ID 목록이 필요합니다.'
            }), 400
        
        # Service를 통한 대량 승인 처리
        result = operations_service.bulk_approve_return_workflows(
            workflow_ids=workflow_ids,
            approver_id=current_user.id,
            comments=comment
        )
        
        return jsonify({
            'success': True,
            'message': f'{result["success_count"]}개의 워크플로우가 승인되었습니다.',
            'data': {
                'success_count': result['success_count'],
                'error_count': result['error_count']
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'대량 승인 처리 중 오류가 발생했습니다: {str(e)}'
        }), 500

@operations_bp.route('/api/operations/dashboard/stats', methods=['GET'])
@login_required
def get_dashboard_stats_api():
    """대시보드 통계 API"""
    try:
        # Service를 통한 대시보드 통계 조회
        stats = operations_service.get_dashboard_statistics()
        
        return jsonify({
            'success': True,
            'data': stats
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'대시보드 통계 조회 중 오류가 발생했습니다: {str(e)}'
        }), 500

@operations_bp.route('/api/operations/dashboard/notifications', methods=['GET'])
@login_required
def get_dashboard_notifications_api():
    """대시보드 알림 API"""
    try:
        # Service를 통한 알림 데이터 조회
        notifications = operations_service.get_dashboard_notifications()
        
        return jsonify({
            'success': True,
            'data': notifications
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'알림 데이터 조회 중 오류가 발생했습니다: {str(e)}'
        }), 500

@operations_bp.route('/api/operations/dashboard/charts', methods=['GET'])
@login_required
def get_dashboard_charts_api():
    """대시보드 차트 데이터 API"""
    try:
        # Service를 통한 차트 데이터 조회
        chart_data = operations_service.get_dashboard_chart_data()
        
        return jsonify({
            'success': True,
            'data': chart_data
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'차트 데이터 조회 중 오류가 발생했습니다: {str(e)}'
        }), 500

# ===========================================
# 알림 관리 API 엔드포인트들
# ===========================================

@operations_bp.route('/api/operations/return/notifications', methods=['POST'])
@login_required
def get_return_notifications_api():
    """반납 알림 목록 조회 API"""
    try:
        data = request.get_json() or {}
        include_read = data.get('include_read', True)
        include_pending = data.get('include_pending', True)
        limit = data.get('limit', 100)
        
        # Service를 통한 알림 목록 조회
        notifications = operations_service.get_return_notifications(
            include_read=include_read,
            include_pending=include_pending,
            limit=limit
        )
        
        return jsonify({
            'success': True,
            'data': {
                'notifications': notifications
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'알림 목록 조회 중 오류가 발생했습니다: {str(e)}'
        }), 500

@operations_bp.route('/api/operations/return/notification-rules', methods=['GET'])
@login_required
def get_notification_rules_api():
    """알림 규칙 목록 조회 API"""
    try:
        # Service를 통한 알림 규칙 조회
        rules = operations_service.get_notification_rules()
        
        return jsonify({
            'success': True,
            'data': {
                'rules': rules
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'알림 규칙 조회 중 오류가 발생했습니다: {str(e)}'
        }), 500

@operations_bp.route('/api/operations/return/notification-templates', methods=['GET'])
@login_required
def get_notification_templates_api():
    """알림 템플릿 목록 조회 API"""
    try:
        # Service를 통한 알림 템플릿 조회
        templates = operations_service.get_notification_templates()
        
        return jsonify({
            'success': True,
            'data': {
                'templates': templates
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'알림 템플릿 조회 중 오류가 발생했습니다: {str(e)}'
        }), 500

@operations_bp.route('/api/operations/return/notifications/mark-read', methods=['POST'])
@login_required
def mark_notification_read_api():
    """알림 읽음 처리 API"""
    try:
        data = request.get_json()
        notification_id = data.get('notification_id')
        
        if not notification_id:
            return jsonify({
                'success': False,
                'message': 'notification_id가 필요합니다.'
            }), 400
        
        # Service를 통한 읽음 처리
        result = operations_service.mark_notification_read(notification_id)
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': '알림을 읽음으로 처리했습니다.'
            })
        else:
            return jsonify({
                'success': False,
                'message': result['message']
            }), 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'읽음 처리 중 오류가 발생했습니다: {str(e)}'
        }), 500

@operations_bp.route('/api/operations/return/notifications/<notification_id>', methods=['DELETE'])
@login_required
def delete_notification_api(notification_id):
    """알림 삭제 API"""
    try:
        # Service를 통한 알림 삭제
        result = operations_service.delete_notification(notification_id)
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': '알림을 삭제했습니다.'
            })
        else:
            return jsonify({
                'success': False,
                'message': result['message']
            }), 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'알림 삭제 중 오류가 발생했습니다: {str(e)}'
        }), 500

@operations_bp.route('/api/operations/return/notification-rules', methods=['POST'])
@login_required
def create_notification_rule_api():
    """알림 규칙 생성 API"""
    try:
        data = request.get_json()
        
        # Service를 통한 알림 규칙 생성
        result = operations_service.create_notification_rule(data)
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': '알림 규칙이 생성되었습니다.',
                'data': {
                    'rule_id': result['rule_id']
                }
            })
        else:
            return jsonify({
                'success': False,
                'message': result['message']
            }), 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'알림 규칙 생성 중 오류가 발생했습니다: {str(e)}'
        }), 500

@operations_bp.route('/api/operations/return/notification-rules/<rule_id>', methods=['PUT'])
@login_required
def update_notification_rule_api(rule_id):
    """알림 규칙 수정 API"""
    try:
        data = request.get_json()
        data['id'] = rule_id
        
        # Service를 통한 알림 규칙 수정
        result = operations_service.update_notification_rule(data)
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': '알림 규칙이 수정되었습니다.'
            })
        else:
            return jsonify({
                'success': False,
                'message': result['message']
            }), 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'알림 규칙 수정 중 오류가 발생했습니다: {str(e)}'
        }), 500

@operations_bp.route('/api/operations/return/notification-templates', methods=['POST'])
@login_required
def create_notification_template_api():
    """알림 템플릿 생성 API"""
    try:
        data = request.get_json()
        
        # Service를 통한 알림 템플릿 생성
        result = operations_service.create_notification_template(data)
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': '알림 템플릿이 생성되었습니다.',
                'data': {
                    'template_id': result['template_id']
                }
            })
        else:
            return jsonify({
                'success': False,
                'message': result['message']
            }), 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'알림 템플릿 생성 중 오류가 발생했습니다: {str(e)}'
        }), 500

@operations_bp.route('/api/operations/return/notification-templates/<template_id>', methods=['PUT'])
@login_required
def update_notification_template_api(template_id):
    """알림 템플릿 수정 API"""
    try:
        data = request.get_json()
        data['id'] = template_id
        
        # Service를 통한 알림 템플릿 수정
        result = operations_service.update_notification_template(data)
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': '알림 템플릿이 수정되었습니다.'
            })
        else:
            return jsonify({
                'success': False,
                'message': result['message']
            }), 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'알림 템플릿 수정 중 오류가 발생했습니다: {str(e)}'
        }), 500

# ==================== 업그레이드 관리 라우트 ====================

@operations_bp.route('/upgrade-management')
@login_required
def upgrade_management():
    """
    업그레이드/교체 관리 메인 페이지
    """
    try:
        # 필터링 및 페이지네이션 매개변수 처리
        status = request.args.get('status', '')
        upgrade_type = request.args.get('upgrade_type', '')
        department = request.args.get('department', '')
        page = request.args.get('page', 1, type=int)
        per_page = 10
        
        # Service를 통한 데이터 조회 (비즈니스 로직 적용)
        result = operations_service.get_upgrade_management_data(
            page=page,
            per_page=per_page,
            status=status if status else None,
            upgrade_type=upgrade_type if upgrade_type else None,
            department=department if department else None
        )
        
        return render_template('operations/upgrade_management.html',
                             upgrade_plans=result['upgrade_plans'],
                             pagination=result['pagination'],
                             statistics=result['statistics'],
                             filter_options=result['filter_options'],
                             current_date=result['current_date'])
    
    except Exception as e:
        flash(f'업그레이드 관리 데이터 조회 중 오류가 발생했습니다: {str(e)}', 'error')
        return redirect(url_for('operations.index'))

@operations_bp.route('/upgrade-management/<int:plan_id>')
@login_required
def upgrade_plan_detail(plan_id):
    """
    업그레이드 계획 상세 페이지
    """
    try:
        # Service를 통한 상세 정보 조회 (비즈니스 로직 적용)
        plan = operations_service.get_upgrade_plan_details(plan_id)
        if not plan:
            flash('해당 업그레이드 계획을 찾을 수 없습니다.', 'danger')
            return redirect(url_for('operations.upgrade_management'))
        
        return render_template('operations/upgrade_plan_detail.html', plan=plan)
    
    except Exception as e:
        flash(f'업그레이드 계획 상세 정보 조회 중 오류가 발생했습니다: {str(e)}', 'error')
        return redirect(url_for('operations.upgrade_management'))

# ==================== 생명주기 추적 라우트 ====================

@operations_bp.route('/lifecycle-tracking')
@login_required
def lifecycle_tracking():
    """
    생명주기 추적 메인 페이지
    """
    try:
        # 필터링 및 페이지네이션 매개변수 처리
        asset_id = request.args.get('asset_id', type=int)
        event_type = request.args.get('event_type', '')
        department = request.args.get('department', '')
        start_date = request.args.get('start_date', '')
        end_date = request.args.get('end_date', '')
        page = request.args.get('page', 1, type=int)
        per_page = 10
        
        # Service를 통한 데이터 조회 (비즈니스 로직 적용)
        result = operations_service.get_lifecycle_tracking_data(
            page=page,
            per_page=per_page,
            asset_id=asset_id,
            event_type=event_type if event_type else None,
            department=department if department else None,
            start_date=start_date if start_date else None,
            end_date=end_date if end_date else None
        )
        
        return render_template('operations/lifecycle_tracking.html',
                             lifecycle_events=result['lifecycle_events'],
                             pagination=result['pagination'],
                             statistics=result['statistics'],
                             filter_options=result['filter_options'])
    
    except Exception as e:
        flash(f'생명주기 추적 데이터 조회 중 오류가 발생했습니다: {str(e)}', 'error')
        return redirect(url_for('operations.index'))

@operations_bp.route('/lifecycle-tracking/asset/<int:asset_id>')
@login_required
def asset_lifecycle_timeline(asset_id):
    """
    특정 자산의 생명주기 타임라인 페이지
    """
    try:
        # Service를 통한 자산 생명주기 타임라인 조회
        timeline_data = operations_service.get_asset_lifecycle_timeline(asset_id)
        
        return render_template('operations/asset_lifecycle_timeline.html',
                             asset_info=timeline_data['asset_info'],
                             timeline_events=timeline_data['timeline_events'],
                             summary=timeline_data['summary'])
    
    except Exception as e:
        flash(f'자산 생명주기 타임라인 조회 중 오류가 발생했습니다: {str(e)}', 'error')
        return redirect(url_for('operations.lifecycle_tracking'))

# ==================== 업그레이드 관리 API 엔드포인트 ====================

@operations_bp.route('/api/upgrade-plans', methods=['GET'])
@login_required
def get_upgrade_plans_api():
    """
    업그레이드 계획 목록 조회 API
    """
    try:
        # 쿼리 파라미터 처리
        status = request.args.get('status', '')
        upgrade_type = request.args.get('upgrade_type', '')
        department = request.args.get('department', '')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Service를 통한 데이터 조회
        result = operations_service.get_upgrade_management_data(
            page=page,
            per_page=per_page,
            status=status if status else None,
            upgrade_type=upgrade_type if upgrade_type else None,
            department=department if department else None
        )
        
        return jsonify({
            'success': True,
            'data': result['upgrade_plans'],
            'pagination': result['pagination'],
            'statistics': result['statistics']
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'업그레이드 계획 목록 조회 중 오류가 발생했습니다: {str(e)}'
        }), 500

@operations_bp.route('/api/upgrade-plans/<int:plan_id>', methods=['GET'])
@login_required
def get_upgrade_plan_detail_api(plan_id):
    """
    업그레이드 계획 상세 정보 조회 API
    """
    try:
        # Service를 통한 상세 정보 조회
        plan = operations_service.get_upgrade_plan_details(plan_id)
        
        if not plan:
            return jsonify({
                'success': False,
                'message': '해당 업그레이드 계획을 찾을 수 없습니다.'
            }), 404
        
        return jsonify({
            'success': True,
            'data': plan
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'업그레이드 계획 상세 정보 조회 중 오류가 발생했습니다: {str(e)}'
        }), 500

@operations_bp.route('/api/upgrade-plans/statistics', methods=['GET'])
@login_required
def get_upgrade_plans_statistics_api():
    """
    업그레이드 계획 통계 정보 조회 API
    """
    try:
        # Service를 통한 통계 정보 조회
        statistics = operations_service.get_upgrade_plans_statistics()
        
        return jsonify({
            'success': True,
            'data': statistics
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'업그레이드 계획 통계 조회 중 오류가 발생했습니다: {str(e)}'
        }), 500

# ==================== 생명주기 추적 API 엔드포인트 ====================

@operations_bp.route('/api/lifecycle-events', methods=['GET'])
@login_required
def get_lifecycle_events_api():
    """
    생명주기 이벤트 목록 조회 API
    """
    try:
        # 쿼리 파라미터 처리
        asset_id = request.args.get('asset_id', type=int)
        event_type = request.args.get('event_type', '')
        department = request.args.get('department', '')
        start_date = request.args.get('start_date', '')
        end_date = request.args.get('end_date', '')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Service를 통한 데이터 조회
        result = operations_service.get_lifecycle_tracking_data(
            page=page,
            per_page=per_page,
            asset_id=asset_id,
            event_type=event_type if event_type else None,
            department=department if department else None,
            start_date=start_date if start_date else None,
            end_date=end_date if end_date else None
        )
        
        return jsonify({
            'success': True,
            'data': result['lifecycle_events'],
            'pagination': result['pagination'],
            'statistics': result['statistics']
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'생명주기 이벤트 목록 조회 중 오류가 발생했습니다: {str(e)}'
        }), 500

@operations_bp.route('/api/lifecycle-events/asset/<int:asset_id>', methods=['GET'])
@login_required
def get_asset_lifecycle_timeline_api(asset_id):
    """
    특정 자산의 생명주기 타임라인 조회 API
    """
    try:
        # Service를 통한 자산 생명주기 타임라인 조회
        timeline_data = operations_service.get_asset_lifecycle_timeline(asset_id)
        
        return jsonify({
            'success': True,
            'data': timeline_data
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'자산 생명주기 타임라인 조회 중 오류가 발생했습니다: {str(e)}'
        }), 500

@operations_bp.route('/api/lifecycle-events/statistics', methods=['GET'])
@login_required
def get_lifecycle_statistics_api():
    """
    생명주기 통계 정보 조회 API
    """
    try:
        # Service를 통한 통계 정보 조회
        statistics = operations_service.get_lifecycle_statistics()
        
        return jsonify({
            'success': True,
            'data': statistics
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'생명주기 통계 조회 중 오류가 발생했습니다: {str(e)}'
        }), 500

@operations_bp.route('/api/lifecycle-events/<int:event_id>', methods=['GET'])
@login_required
def get_lifecycle_event_detail_api(event_id):
    """
    생명주기 이벤트 개별 상세 정보 조회 API
    """
    try:
        # Service를 통한 이벤트 상세 정보 조회
        event = operations_service.get_lifecycle_event_details(event_id)
        
        if not event:
            return jsonify({
                'success': False,
                'message': '해당 생명주기 이벤트를 찾을 수 없습니다.'
            }), 404
        
        return jsonify({
            'success': True,
            'data': event
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'생명주기 이벤트 상세 정보 조회 중 오류가 발생했습니다: {str(e)}'
        }), 500 

# API: /api/disposals, /api/disposals/<id>, /api/disposals/reasons (DisposalService)

@operations_bp.route('/api/disposals', methods=['GET'])
@login_required
def get_disposals_api():
    """전체 폐기 목록 반환 API"""
    data = disposal_service.get_all_disposals()
    return jsonify({'success': True, 'data': data})

@operations_bp.route('/api/disposals/<int:disposal_id>', methods=['GET'])
@login_required
def get_disposal_detail_api(disposal_id):
    """단일 폐기 상세 반환 API"""
    data = disposal_service.get_disposal_by_id(disposal_id)
    if data:
        return jsonify({'success': True, 'data': data})
    return jsonify({'success': False, 'error': 'Not found'}), 404

@operations_bp.route('/api/disposals/reasons', methods=['GET'])
@login_required
def get_disposal_reasons_api():
    """폐기 사유 마스터 반환 API"""
    data = disposal_service.get_disposal_reasons()
    return jsonify({'success': True, 'data': data}) 

@operations_bp.route('/api/disposals', methods=['POST'])
@login_required
def create_disposal_api():
    """폐기 데이터 등록 API"""
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'error': 'No input data'}), 400
    created = disposal_service.add_disposal(data)
    return jsonify({'success': True, 'data': created}), 201

@operations_bp.route('/api/disposals/<int:disposal_id>', methods=['PUT'])
@login_required
def update_disposal_api(disposal_id):
    """폐기 데이터 수정 API"""
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'error': 'No input data'}), 400
    updated = disposal_service.update_disposal(disposal_id, data)
    if updated:
        return jsonify({'success': True, 'data': updated})
    return jsonify({'success': False, 'error': 'Not found'}), 404

@operations_bp.route('/api/disposals/<int:disposal_id>', methods=['DELETE'])
@login_required
def delete_disposal_api(disposal_id):
    """폐기 데이터 삭제 API"""
    deleted = disposal_service.delete_disposal(disposal_id)
    if deleted:
        return jsonify({'success': True})
    return jsonify({'success': False, 'error': 'Not found'}), 404 