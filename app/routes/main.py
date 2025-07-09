"""
메인 라우트 모듈
"""
from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_required, current_user
from datetime import datetime, date

# Service Layer imports
from ..services.asset_core_service import AssetCoreService
from ..services.contract_core_service import ContractCoreService

# 전역 상수 import
from ..utils.constants import get_category_name, get_contract_type_name

main_bp = Blueprint('main', __name__)

# Service 인스턴스 생성
asset_service = AssetCoreService()
contract_service = ContractCoreService()

@main_bp.route('/')
def index():
    """
    메인 인덱스 페이지 (로그인 페이지 또는 대시보드로 리다이렉트)
    """
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))
    return redirect(url_for('auth.login'))

@main_bp.route('/dashboard')
@login_required
def dashboard():
    """
    대시보드 페이지
    """
    # 현재 날짜를 템플릿에 전달
    current_date = datetime.now().strftime('%Y-%m-%d')
    today = date.today()
    
    # Asset Service를 통한 자산 통계 조회
    asset_stats = asset_service.get_dashboard_statistics()
    
    # Contract Service를 통한 계약 통계 조회
    contract_stats = contract_service.get_contract_statistics()
    
    # 만료 임박 계약 조회 (90일 이내)
    expiring_contracts = contract_service.get_expiring_contracts(days_ahead=90)
    soon_expiring_contracts = expiring_contracts[:3]  # 상위 3개만
    
    return render_template('main/dashboard.html', 
                          current_date=current_date,
                          total_assets=asset_stats.get('total_count', 0),
                          normal_assets=asset_stats.get('normal_count', 0),
                          maintenance_assets=asset_stats.get('maintenance_count', 0),
                          disposed_assets=asset_stats.get('disposed_count', 0),
                          category_stats=asset_stats.get('category_stats', {}),
                          recent_assets=asset_stats.get('recent_assets', []),
                          total_contracts=contract_stats.get('total_count', 0),
                          active_contracts=contract_stats.get('active_count', 0),
                          expiring_contracts=contract_stats.get('expiring_count', 0),
                          monthly_cost=contract_stats.get('monthly_cost', 0),
                          soon_expiring_contracts=soon_expiring_contracts,
                          contract_type_stats=contract_stats.get('type_stats', {})) 