"""
사용자 관리 관련 라우트 모듈 (하드코딩된 데이터 사용)
"""
from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_required, current_user
import copy

# user_repository를 통한 사용자 데이터 관리
from ..repositories.user import user_repository

users_bp = Blueprint('users', __name__)

@users_bp.route('/')
@login_required
def index():
    """
    사용자 목록 페이지
    """
    # user_repository를 통해 사용자 목록 조회
    users = user_repository.get_all_users()
    return render_template('users/index.html', users=users)

@users_bp.route('/create', methods=['GET', 'POST'])
@login_required
def create():
    """
    사용자 생성 페이지
    """
    if request.method == 'POST':
        # 하드코딩된 구현 (실제 DB 연동은 나중에 구현)
        username = request.form.get('username')
        name = request.form.get('name')
        email = request.form.get('email')
        
        # user_repository를 통해 중복 확인
        if user_repository.get_user_by_username(username):
            flash('이미 존재하는 사용자 아이디입니다.', 'danger')
            return redirect(url_for('users.create'))
            
        if user_repository.get_user_by_email(email):
            flash('이미 존재하는 이메일입니다.', 'danger')
            return redirect(url_for('users.create'))
        
        # 실제로는 사용자 생성하지 않고 성공 메시지만 표시
        flash('사용자가 생성되었습니다.', 'success')
        return redirect(url_for('users.index'))
    
    # GET 요청인 경우 폼 표시 (user_repository 데이터 사용)
    roles = user_repository.get_all_roles()
    departments = user_repository.get_all_departments()
    
    return render_template('users/create.html', roles=roles, departments=departments)

@users_bp.route('/<int:user_id>')
@login_required
def detail(user_id):
    """
    사용자 상세 정보 페이지
    """
    # user_repository를 통해 사용자 검색
    user = user_repository.get_user_by_id(user_id)
    if not user:
        flash('해당 사용자를 찾을 수 없습니다.', 'danger')
        return redirect(url_for('users.index'))
        
    return render_template('users/detail.html', user=user)

@users_bp.route('/<int:user_id>/edit', methods=['GET', 'POST'])
@login_required
def edit(user_id):
    """
    사용자 수정 페이지
    """
    # user_repository를 통해 사용자 검색
    user = user_repository.get_user_by_id(user_id)
    if not user:
        flash('해당 사용자를 찾을 수 없습니다.', 'danger')
        return redirect(url_for('users.index'))
    
    # 권한 체크 로직 - 자신의 정보 또는 관리자만 수정 가능
    if user_id != getattr(current_user, 'id', None) and not getattr(current_user, 'is_admin', False):
        flash('해당 사용자 정보를 수정할 권한이 없습니다.', 'danger')
        return redirect(url_for('users.index'))
    
    if request.method == 'POST':
        # 하드코딩된 구현 (실제 DB 갱신은 나중에 구현)
        flash('사용자 정보가 수정되었습니다.', 'success')
        return redirect(url_for('users.detail', user_id=user_id))
    
    # GET 요청인 경우 폼 표시 (user_repository 데이터 사용)
    roles = user_repository.get_all_roles()
    departments = user_repository.get_all_departments()
    
    return render_template('users/edit.html', user=user, roles=roles, departments=departments)

# ===========================================
# 사용자 관리 API 엔드포인트들
# ===========================================

@users_bp.route('/api/users', methods=['POST'])
@login_required
def create_user_api():
    """사용자 생성 API"""
    from flask import jsonify
    
    try:
        data = request.get_json()
        
        # 필수 필드 검증
        required_fields = ['username', 'name', 'email', 'department_id', 'role_id']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'{field} 필드가 필요합니다.'
                }), 400
        
        # 중복 확인
        if any(u['username'] == data['username'] for u in SAMPLE_USERS):
            return jsonify({
                'success': False,
                'message': '이미 존재하는 사용자 아이디입니다.'
            }), 400
            
        if any(u['email'] == data['email'] for u in SAMPLE_USERS):
            return jsonify({
                'success': False,
                'message': '이미 존재하는 이메일입니다.'
            }), 400
        
        # 새 사용자 ID 생성 (실제로는 DB에서 자동 생성)
        new_user_id = max([u['id'] for u in SAMPLE_USERS]) + 1
        
        # 새 사용자 데이터 생성
        new_user = {
            'id': new_user_id,
            'username': data['username'],
            'name': data['name'],
            'email': data['email'],
            'department_id': data['department_id'],
            'role_id': data['role_id'],
            'is_active': data.get('is_active', True),
            'phone': data.get('phone', ''),
            'position': data.get('position', '일반 직원'),
            'hire_date': data.get('hire_date', ''),
            'created_at': '2024-12-21',  # 현재 날짜로 설정
            'updated_at': '2024-12-21'
        }
        
        # 실제로는 DB에 저장하지만, 여기서는 메모리에만 추가
        SAMPLE_USERS.append(new_user)
        
        return jsonify({
            'success': True,
            'message': '사용자가 성공적으로 생성되었습니다.',
            'data': {
                'user_id': new_user_id
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'사용자 생성 중 오류가 발생했습니다: {str(e)}'
        }), 500

@users_bp.route('/api/users/<int:user_id>', methods=['PUT'])
@login_required
def update_user_api(user_id):
    """사용자 수정 API"""
    from flask import jsonify
    
    try:
        data = request.get_json()
        
        # 사용자 존재 확인
        user_index = None
        for i, user in enumerate(SAMPLE_USERS):
            if user['id'] == user_id:
                user_index = i
                break
        
        if user_index is None:
            return jsonify({
                'success': False,
                'message': '해당 사용자를 찾을 수 없습니다.'
            }), 404
        
        # 권한 체크 - 자신의 정보 또는 관리자만 수정 가능
        if user_id != getattr(current_user, 'id', None) and not getattr(current_user, 'is_admin', False):
            return jsonify({
                'success': False,
                'message': '해당 사용자 정보를 수정할 권한이 없습니다.'
            }), 403
        
        # 이메일 중복 확인 (본인 제외)
        if 'email' in data:
            if any(u['email'] == data['email'] and u['id'] != user_id for u in SAMPLE_USERS):
                return jsonify({
                    'success': False,
                    'message': '이미 존재하는 이메일입니다.'
                }), 400
        
        # 사용자 정보 업데이트
        current_user_data = SAMPLE_USERS[user_index]
        updatable_fields = ['name', 'email', 'department_id', 'role_id', 'is_active', 'phone', 'position']
        
        for field in updatable_fields:
            if field in data:
                current_user_data[field] = data[field]
        
        # 수정 시간 업데이트
        current_user_data['updated_at'] = '2024-12-21'
        
        return jsonify({
            'success': True,
            'message': '사용자 정보가 성공적으로 수정되었습니다.',
            'data': {
                'user_id': user_id
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'사용자 수정 중 오류가 발생했습니다: {str(e)}'
        }), 500

@users_bp.route('/api/users/<int:user_id>', methods=['GET'])
@login_required
def get_user_api(user_id):
    """사용자 정보 조회 API"""
    from flask import jsonify
    
    try:
        # 사용자 검색
        user = next((u for u in enhanced_user_data if u['id'] == user_id), None)
        
        if not user:
            return jsonify({
                'success': False,
                'message': '해당 사용자를 찾을 수 없습니다.'
            }), 404
        
        return jsonify({
            'success': True,
            'data': user
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'사용자 정보 조회 중 오류가 발생했습니다: {str(e)}'
        }), 500

@users_bp.route('/api/users', methods=['GET'])
@login_required
def get_users_api():
    """사용자 목록 조회 API"""
    from flask import jsonify
    
    try:
        # 필터링 파라미터
        department_id = request.args.get('department_id', type=int)
        role_id = request.args.get('role_id', type=int)
        is_active = request.args.get('is_active')
        search = request.args.get('search', '')
        
        # 사용자 목록 필터링
        filtered_users = enhanced_user_data.copy()
        
        if department_id:
            filtered_users = [u for u in filtered_users if u['department_id'] == department_id]
        
        if role_id:
            filtered_users = [u for u in filtered_users if u['role_id'] == role_id]
        
        if is_active is not None:
            is_active_bool = is_active.lower() == 'true'
            filtered_users = [u for u in filtered_users if u.get('is_active', True) == is_active_bool]
        
        if search:
            search_lower = search.lower()
            filtered_users = [\
                u for u in filtered_users \
                if search_lower in u['name'].lower() or \
                   search_lower in u['username'].lower() or \
                   search_lower in u['email'].lower()\
            ]
        
        return jsonify({
            'success': True,
            'data': {
                'users': filtered_users,
                'total': len(filtered_users)
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'사용자 목록 조회 중 오류가 발생했습니다: {str(e)}'
        }), 500

@users_bp.route('/api/departments', methods=['GET'])
@login_required
def get_departments_api():
    """부서 목록 조회 API"""
    from flask import jsonify
    
    try:
        return jsonify({
            'success': True,
            'data': {
                'departments': SAMPLE_DEPARTMENTS
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'부서 목록 조회 중 오류가 발생했습니다: {str(e)}'
        }), 500

@users_bp.route('/api/roles', methods=['GET'])
@login_required
def get_roles_api():
    """역할 목록 조회 API"""
    from flask import jsonify
    
    try:
        return jsonify({
            'success': True,
            'data': {
                'roles': SAMPLE_ROLES
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'역할 목록 조회 중 오류가 발생했습니다: {str(e)}'
        }), 500 