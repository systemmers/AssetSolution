"""
API 라우트
Software search and management API endpoints
"""

from flask import Blueprint, request, jsonify
from ..models.software import SoftwareService

api_bp = Blueprint('api', __name__, url_prefix='/api')

@api_bp.route('/software/search')
def search_software():
    """
    소프트웨어 검색 API
    
    Query Parameters:
        q (str): 검색어
        category (str): 카테고리 필터
        limit (int): 결과 제한 수 (기본: 10)
    
    Returns:
        JSON: 검색 결과
    """
    try:
        query = request.args.get('q', '').strip()
        category = request.args.get('category', '').strip() or None
        limit = int(request.args.get('limit', 10))
        
        if not query or len(query) < 2:
            return jsonify({
                'success': False,
                'message': '검색어는 2글자 이상 입력해주세요.',
                'software': []
            })
        
        # 소프트웨어 검색
        software_list = SoftwareService.search_software(query, category, limit)
        
        return jsonify({
            'success': True,
            'message': f'{len(software_list)}개의 소프트웨어를 찾았습니다.',
            'software': software_list
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'검색 중 오류가 발생했습니다: {str(e)}',
            'software': []
        }), 500

@api_bp.route('/software/popular')
def get_popular_software():
    """
    인기 소프트웨어 목록 API
    
    Query Parameters:
        category (str): 카테고리 필터
        limit (int): 결과 제한 수 (기본: 5)
    
    Returns:
        JSON: 인기 소프트웨어 목록
    """
    try:
        category = request.args.get('category', '').strip() or None
        limit = int(request.args.get('limit', 5))
        
        # 인기 소프트웨어 조회
        software_list = SoftwareService.get_popular_software(category, limit)
        
        return jsonify({
            'success': True,
            'message': f'{len(software_list)}개의 인기 소프트웨어를 찾았습니다.',
            'software': software_list
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'조회 중 오류가 발생했습니다: {str(e)}',
            'software': []
        }), 500

@api_bp.route('/software/categories')
def get_software_categories():
    """
    소프트웨어 카테고리 목록 API
    
    Returns:
        JSON: 카테고리 목록
    """
    try:
        categories = SoftwareService.get_software_categories()
        
        return jsonify({
            'success': True,
            'message': f'{len(categories)}개의 카테고리를 찾았습니다.',
            'categories': categories
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'조회 중 오류가 발생했습니다: {str(e)}',
            'categories': []
        }), 500 