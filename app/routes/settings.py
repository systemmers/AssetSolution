"""
설정 관련 라우트 모듈 (Repository 패턴 사용)
"""
from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify
from flask_login import login_required, current_user
from ..repositories import category_repository, preset_repository
from datetime import datetime

# 하드코딩된 샘플 데이터
SAMPLE_ASSET_TYPES = [
    {"id": 1, "code": "HW", "name": "하드웨어", "description": "컴퓨터, 모니터 등의 물리적 장비", "is_active": True},
    {"id": 2, "code": "SW", "name": "소프트웨어", "description": "설치된 프로그램 및 라이센스", "is_active": True},
    {"id": 3, "code": "NW", "name": "네트워크 장비", "description": "라우터, 스위치 등 네트워크 관련 장비", "is_active": True},
]

SAMPLE_ASSET_STATUSES = [
    {"id": 1, "code": "USE", "name": "사용중", "description": "현재 사용중인 자산", "is_active": True},
    {"id": 2, "code": "RPR", "name": "수리중", "description": "고장으로 수리중인 자산", "is_active": True},
    {"id": 3, "code": "DSP", "name": "폐기예정", "description": "곧 폐기될 예정인 자산", "is_active": True},
]

SAMPLE_LOCATIONS = [
    {"id": 1, "code": "HQ3F", "name": "본사 3층", "description": "본사 건물 3층", "parent_id": None, "is_active": True},
    {"id": 2, "code": "HQ4F", "name": "본사 4층", "description": "본사 건물 4층", "parent_id": None, "is_active": True},
    {"id": 3, "code": "BR1", "name": "지사 1층", "description": "지사 건물 1층", "parent_id": None, "is_active": True},
]

SAMPLE_DEPARTMENTS = [
    {"id": 1, "code": "DEV", "name": "개발팀", "description": "소프트웨어 개발", "parent_id": None, "is_active": True},
    {"id": 2, "code": "HR", "name": "인사팀", "description": "인사 관리", "parent_id": None, "is_active": True},
    {"id": 3, "code": "MKT", "name": "마케팅팀", "description": "제품 마케팅", "parent_id": None, "is_active": True},
]

SAMPLE_DEPRECIATION_METHODS = [
    {"id": 1, "name": "정액법", "description": "매년 동일한 금액을 감가상각하는 방법"},
    {"id": 2, "name": "정률법", "description": "매년 일정한 비율로 감가상각하는 방법"},
]

settings_bp = Blueprint('settings', __name__)

@settings_bp.route('/')
@login_required
def index():
    """
    설정 메인 페이지
    """
    return render_template('settings/index.html')

@settings_bp.route('/categories')
@login_required 
def categories():
    """
    카테고리 관리 페이지
    """
    return render_template('settings/categories.html')

@settings_bp.route('/asset-types')
@login_required
def asset_types():
    """
    자산 유형 목록 페이지
    """
    asset_types = SAMPLE_ASSET_TYPES
    return render_template('settings/asset_types.html', asset_types=asset_types)

@settings_bp.route('/asset-statuses')
@login_required
def asset_statuses():
    """
    자산 상태 목록 페이지
    """
    asset_statuses = SAMPLE_ASSET_STATUSES
    return render_template('settings/asset_statuses.html', asset_statuses=asset_statuses)

@settings_bp.route('/locations')
@login_required
def locations():
    """
    위치 목록 페이지
    """
    locations = SAMPLE_LOCATIONS
    return render_template('settings/locations.html', locations=locations)

@settings_bp.route('/departments')
@login_required
def departments():
    """
    부서 목록 페이지
    """
    departments = SAMPLE_DEPARTMENTS
    return render_template('settings/departments.html', departments=departments)

@settings_bp.route('/depreciation-methods')
@login_required
def depreciation_methods():
    """
    감가상각 방법 목록 페이지
    """
    methods = SAMPLE_DEPRECIATION_METHODS
    return render_template('settings/depreciation_methods.html', methods=methods)

@settings_bp.route('/asset-types/create', methods=['GET', 'POST'])
@login_required
def create_asset_type():
    """
    자산 유형 생성 페이지
    """
    if request.method == 'POST':
        # 하드코딩된 구현 (실제 DB 저장은 나중에 구현)
        code = request.form.get('code')
        name = request.form.get('name')
        
        # 중복 확인 (하드코딩된 데이터에서 검사)
        if any(at['code'] == code for at in SAMPLE_ASSET_TYPES):
            flash('이미 존재하는 코드입니다.', 'danger')
            return redirect(url_for('settings.create_asset_type'))
        
        flash('자산 유형이 생성되었습니다.', 'success')
        return redirect(url_for('settings.asset_types'))
    
    return render_template('settings/create_asset_type.html')

@settings_bp.route('/categories/save', methods=['POST'])
@login_required
def save_categories():
    """카테고리 저장 API
    
    클라이언트에서 전송한 카테고리 구조를 저장합니다.
    """
    try:
        category_data = request.json
        if not category_data:
            return jsonify({
                'success': False,
                'message': '카테고리 데이터가 없습니다.'
            }), 400
        
        # 카테고리 생성 또는 업데이트
        if 'id' in category_data and category_data['id']:
            # 기존 카테고리 업데이트
            updated_category = category_repository.update(category_data['id'], category_data)
            if updated_category:
                return jsonify({
                    'success': True,
                    'message': '카테고리가 성공적으로 업데이트되었습니다.',
                    'data': updated_category
                }), 200
            else:
                return jsonify({
                    'success': False,
                    'message': '카테고리를 찾을 수 없습니다.'
                }), 404
        else:
            # 새 카테고리 생성
            new_category = category_repository.create(category_data)
            return jsonify({
                'success': True,
                'message': '카테고리가 성공적으로 생성되었습니다.',
                'data': new_category
            }), 201
        
    except ValueError as ve:
        return jsonify({
            'success': False,
            'message': str(ve)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'카테고리 저장 중 오류가 발생했습니다: {str(e)}'
        }), 500

@settings_bp.route('/categories/load', methods=['GET'])
@login_required
def load_categories():
    """카테고리 로드 API
    
    저장된 카테고리 구조를 반환합니다.
    """
    try:
        # 트리 구조로 카테고리 조회
        categories_tree = category_repository.get_tree_structure()
        
        # 성공 응답
        return jsonify({
            'success': True,
            'data': {
                'categories': categories_tree,
                'total_count': category_repository.count(),
                'max_level': category_repository.get_max_level()
            }
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'카테고리 로드 중 오류가 발생했습니다: {str(e)}'
        }), 500

@settings_bp.route('/categories/tree', methods=['GET'])
@login_required
def get_categories_tree():
    """카테고리 트리 구조 조회 API"""
    try:
        tree_structure = category_repository.get_tree_structure()
        return jsonify({
            'success': True,
            'data': tree_structure
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'카테고리 트리 조회 중 오류가 발생했습니다: {str(e)}'
        }), 500

@settings_bp.route('/categories/<int:category_id>', methods=['DELETE'])
@login_required
def delete_category(category_id):
    """카테고리 삭제 API"""
    try:
        success = category_repository.delete(category_id)
        if success:
            return jsonify({
                'success': True,
                'message': '카테고리가 성공적으로 삭제되었습니다.'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': '카테고리를 찾을 수 없습니다.'
            }), 404
    except ValueError as ve:
        return jsonify({
            'success': False,
            'message': str(ve)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'카테고리 삭제 중 오류가 발생했습니다: {str(e)}'
        }), 500

@settings_bp.route('/presets/save', methods=['POST'])
@login_required
def save_preset():
    """프리셋 저장 API
    
    클라이언트에서 전송한 프리셋을 저장합니다.
    """
    try:
        preset_data = request.json
        if not preset_data:
            return jsonify({
                'success': False,
                'message': '프리셋 데이터가 없습니다.'
            }), 400
        
        # 현재 사용자 정보 추가
        preset_data['created_by'] = str(current_user.id) if current_user.is_authenticated else 'anonymous'
        
        # 프리셋 생성 또는 업데이트
        if 'id' in preset_data and preset_data['id']:
            # 기존 프리셋 업데이트
            updated_preset = preset_repository.update(preset_data['id'], preset_data)
            if updated_preset:
                return jsonify({
                    'success': True,
                    'message': '프리셋이 성공적으로 업데이트되었습니다.',
                    'data': updated_preset
                }), 200
            else:
                return jsonify({
                    'success': False,
                    'message': '프리셋을 찾을 수 없습니다.'
                }), 404
        else:
            # 새 프리셋 생성
            new_preset = preset_repository.create(preset_data)
            return jsonify({
                'success': True,
                'message': '프리셋이 성공적으로 생성되었습니다.',
                'data': new_preset
            }), 201
            
    except ValueError as ve:
        return jsonify({
            'success': False,
            'message': str(ve)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'프리셋 저장 중 오류가 발생했습니다: {str(e)}'
        }), 500

@settings_bp.route('/presets/list', methods=['GET'])
@login_required
def list_presets():
    """프리셋 목록 API
    
    저장된 프리셋 목록을 반환합니다.
    """
    try:
        preset_type = request.args.get('type', 'category')
        show_shared = request.args.get('shared', 'true').lower() == 'true'
        
        # 프리셋 조회
        if show_shared:
            presets = preset_repository.get_shared_presets()
        else:
            user_id = str(current_user.id) if current_user.is_authenticated else 'anonymous'
            presets = preset_repository.get_user_presets(user_id)
        
        # 타입 필터링
        if preset_type:
            presets = [p for p in presets if p['preset_type'] == preset_type]
        
        # 응답 데이터 정리 (민감한 정보 제거)
        response_presets = []
        for preset in presets:
            response_preset = {
                'id': preset['id'],
                'name': preset['name'],
                'description': preset['description'],
                'preset_type': preset['preset_type'],
                'is_default': preset.get('is_default', False),
                'is_shared': preset.get('is_shared', False),
                'usage_count': preset.get('usage_count', 0),
                'created_at': preset['created_at']
            }
            response_presets.append(response_preset)
        
        return jsonify({
            'success': True,
            'data': response_presets,
            'total_count': len(response_presets)
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'프리셋 목록 로드 중 오류가 발생했습니다: {str(e)}'
        }), 500 

@settings_bp.route('/presets/<int:preset_id>', methods=['GET'])
@login_required
def get_preset(preset_id):
    """특정 프리셋 조회 API"""
    try:
        preset = preset_repository.get_by_id(preset_id)
        if preset:
            return jsonify({
                'success': True,
                'data': preset
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': '프리셋을 찾을 수 없습니다.'
            }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'프리셋 조회 중 오류가 발생했습니다: {str(e)}'
        }), 500

@settings_bp.route('/presets/<int:preset_id>/apply', methods=['POST'])
@login_required
def apply_preset(preset_id):
    """프리셋 적용 API"""
    try:
        preset = preset_repository.apply_preset(preset_id)
        if preset:
            return jsonify({
                'success': True,
                'message': '프리셋이 성공적으로 적용되었습니다.',
                'data': preset
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': '프리셋을 찾을 수 없습니다.'
            }), 404
    except ValueError as ve:
        return jsonify({
            'success': False,
            'message': str(ve)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'프리셋 적용 중 오류가 발생했습니다: {str(e)}'
        }), 500

@settings_bp.route('/presets/<int:preset_id>/clone', methods=['POST'])
@login_required
def clone_preset(preset_id):
    """프리셋 복제 API"""
    try:
        data = request.json
        new_name = data.get('name')
        
        if not new_name:
            return jsonify({
                'success': False,
                'message': '새 프리셋 이름이 필요합니다.'
            }), 400
        
        user_id = str(current_user.id) if current_user.is_authenticated else 'anonymous'
        cloned_preset = preset_repository.clone_preset(preset_id, new_name, user_id)
        
        return jsonify({
            'success': True,
            'message': '프리셋이 성공적으로 복제되었습니다.',
            'data': cloned_preset
        }), 201
        
    except ValueError as ve:
        return jsonify({
            'success': False,
            'message': str(ve)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'프리셋 복제 중 오류가 발생했습니다: {str(e)}'
        }), 500

@settings_bp.route('/presets/<int:preset_id>', methods=['DELETE'])
@login_required
def delete_preset(preset_id):
    """프리셋 삭제 API"""
    try:
        success = preset_repository.delete(preset_id)
        if success:
            return jsonify({
                'success': True,
                'message': '프리셋이 성공적으로 삭제되었습니다.'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': '프리셋을 찾을 수 없습니다.'
            }), 404
    except ValueError as ve:
        return jsonify({
            'success': False,
            'message': str(ve)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'프리셋 삭제 중 오류가 발생했습니다: {str(e)}'
        }), 500

@settings_bp.route('/test-category')
@login_required
def test_category():
    """
    카테고리 시스템 디버그 테스트 페이지
    """
    return render_template('test_category.html')

@settings_bp.route('/debug/test')
def debug_test():
    """
    디버그용 테스트 엔드포인트 (로그인 불필요)
    """
    return jsonify({
        'success': True,
        'message': '백엔드 연결 정상',
        'timestamp': str(datetime.now()),
        'endpoints': [
            '/settings/categories/load',
            '/settings/categories/save', 
            '/settings/presets/list',
            '/settings/presets/save'
        ]
    })

@settings_bp.route('/debug/categories')
def debug_categories():
    """
    디버그용 카테고리 API (로그인 불필요)
    """
    sample_categories = {
        '전자기기': {
            '컴퓨터': ['데스크톱', '노트북', '서버'],
            '네트워크': ['라우터', '스위치'],
            '모니터': ['LCD', 'LED']
        },
        '가구': {
            '의자': ['사무용', '가정용'],
            '책상': ['사무용', '가정용']
        }
    }
    
    return jsonify({
        'success': True,
        'data': {
            'categories': sample_categories,
            'total_count': len(sample_categories),
            'max_level': 3
        }
    })

@settings_bp.route('/debug/frontend')
def debug_frontend():
    """
    프론트엔드-백엔드 연결 디버그 테스트 페이지 (로그인 불필요)
    """
    return render_template('debug_frontend.html') 