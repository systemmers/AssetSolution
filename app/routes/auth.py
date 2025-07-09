"""
인증 관련 라우트 모듈 (하드코딩된 데이터 사용)
"""
from flask import Blueprint, render_template, redirect, url_for, flash, request, session
from flask_login import login_user, logout_user, current_user, login_required
from werkzeug.security import check_password_hash

# extensions.py에서 정의한 하드코딩된 데이터와 MockUser 클래스 사용
from ..extensions import SAMPLE_USERS, MockUser

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    """
    로그인 라우트
    """
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))
        
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        remember = request.form.get('remember') == 'on'
        
        # 하드코딩된 사용자 데이터에서 사용자 찾기
        user_dict = next((u for u in SAMPLE_USERS if u['username'] == username), None)
        
        if user_dict and password == 'password':  # 간편화를 위해 모든 사용자의 비밀번호가 'password'
            user = MockUser(user_dict)
            login_user(user, remember=remember)
            flash('로그인되었습니다.', 'success')
            
            next_page = request.args.get('next')
            if next_page:
                return redirect(next_page)
            return redirect(url_for('main.dashboard'))
        else:
            flash('사용자 이름 또는 비밀번호가 올바르지 않습니다.', 'danger')
            
    return render_template('auth/login.html')

@auth_bp.route('/logout')
def logout():
    """
    로그아웃 라우트
    """
    logout_user()
    flash('로그아웃 되었습니다.', 'info')
    return redirect(url_for('auth.login'))

@auth_bp.route('/profile')
@login_required
def profile():
    """
    내 프로필 정보 보기
    """
    # 하드코딩된 부서 및 역할 데이터 (users.py에서 가져옴)
    from ..routes.users import SAMPLE_DEPARTMENTS, SAMPLE_ROLES
    
    # 현재 로그인한 사용자의 정보
    user_id = current_user.id
    user_dict = next((u for u in SAMPLE_USERS if u['id'] == user_id), None)
    
    if not user_dict:
        flash('사용자 정보를 찾을 수 없습니다.', 'danger')
        return redirect(url_for('main.dashboard'))
    
    # 사용자 부서 및 역할 정보 추가
    department = next((d for d in SAMPLE_DEPARTMENTS if d['id'] == user_dict['department_id']), None)
    role = next((r for r in SAMPLE_ROLES if r['id'] == user_dict['role_id']), None)
    
    # 샘플 로그인 이력 데이터 (실제로는 DB에서 가져와야 함)
    login_history = [
        {'date': '2023-04-12 09:15:22', 'ip': '192.168.1.101', 'device': 'Windows 10 / Chrome'},
        {'date': '2023-04-10 14:32:10', 'ip': '192.168.1.101', 'device': 'Windows 10 / Chrome'},
        {'date': '2023-04-05 08:45:30', 'ip': '192.168.1.105', 'device': 'Android / Mobile Browser'}
    ]
    
    return render_template('auth/profile.html', 
                          user=user_dict, 
                          department=department, 
                          role=role,
                          login_history=login_history)

@auth_bp.route('/profile/edit', methods=['GET', 'POST'])
@login_required
def edit_profile():
    """
    내 프로필 정보 수정
    """
    # 하드코딩된 데이터
    user_id = current_user.id
    user_dict = next((u for u in SAMPLE_USERS if u['id'] == user_id), None)
    
    if not user_dict:
        flash('사용자 정보를 찾을 수 없습니다.', 'danger')
        return redirect(url_for('main.dashboard'))
    
    if request.method == 'POST':
        # 실제로는 DB에 저장해야 하지만 하드코딩된 데이터를 사용하는 현재 상태에서는 가상의 성공 메시지만 표시
        flash('프로필 정보가 업데이트되었습니다.', 'success')
        return redirect(url_for('auth.profile'))
    
    return render_template('auth/edit_profile.html', user=user_dict)

@auth_bp.route('/profile/password', methods=['POST'])
@login_required
def change_password():
    """
    비밀번호 변경
    """
    # 하드코딩된 데이터를 사용하는 현재 상태에서는 가상의 성공 메시지만 표시
    flash('비밀번호가 변경되었습니다.', 'success')
    return redirect(url_for('auth.profile')) 