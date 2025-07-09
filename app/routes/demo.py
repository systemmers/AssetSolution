"""
스타일 가이드 페이지 라우트
모든 UI 컴포넌트와 스타일 요소를 테스트할 수 있는 가이드 페이지
"""

from flask import Blueprint, render_template, jsonify

demo_bp = Blueprint('demo', __name__, url_prefix='/demo')

@demo_bp.route('/style-guide')
def style_guide():
    """메인 스타일 가이드 페이지"""
    return render_template('demo/style-demo.html')

@demo_bp.route('/style-demo')
def style_demo():
    """레거시 URL 지원 (리다이렉트)"""
    return render_template('demo/style-demo.html')

@demo_bp.route('/components')
def components_demo():
    """컴포넌트별 상세 데모 페이지"""
    return render_template('demo/components-demo.html')

@demo_bp.route('/layout')
def layout_demo():
    """레이아웃 테스트 페이지"""
    return render_template('demo/layout-demo.html')

@demo_bp.route('/api/style-variables')
def get_style_variables():
    """CSS 변수 목록 API (실시간 변경용)"""
    variables = {
        'colors': {
            '--color-primary': '#007bff',
            '--color-success': '#28a745',
            '--color-warning': '#ffc107',
            '--color-danger': '#dc3545',
            '--color-info': '#17a2b8'
        },
        'fonts': {
            '--font-size-xs': '0.75rem',
            '--font-size-sm': '0.875rem',
            '--font-size-base': '1rem',
            '--font-size-lg': '1.125rem',
            '--font-size-xl': '1.25rem',
            '--font-size-2xl': '1.5rem',
            '--font-size-3xl': '2rem'
        },
        'spacing': {
            '--spacing-1': '0.25rem',
            '--spacing-2': '0.5rem',
            '--spacing-3': '0.75rem',
            '--spacing-4': '1rem',
            '--spacing-5': '1.25rem',
            '--spacing-6': '1.5rem',
            '--spacing-8': '2rem'
        }
    }
    return jsonify(variables) 