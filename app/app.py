
# 인덱스
"""
애플리케이션 팩토리 함수를 정의하는 모듈
렌더링 우선 구현을 위해 DB 관련 코드는 주석 처리되어 있습니다.
"""
import os
from flask import Flask, g, current_app

def create_app(config_name='default'):
    """
    애플리케이션 팩토리 함수
    
    지정된 설정으로 Flask 애플리케이션을 생성하고 초기화합니다.
    주의: 데이터베이스 연동은 템플릿 렌더링 완료 후 마지막에 구현됩니다.
    
    Args:
        config_name (str): 사용할 설정 이름 ('development', 'testing', 'production')
        
    Returns:
        Flask: 초기화된 Flask 애플리케이션
    """
    # 템플릿과 정적 파일 폴더 경로 설정
    template_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), 'templates'))
    static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), 'static'))
    
    app = Flask(__name__, 
                template_folder=template_dir,
                static_folder=static_dir)
                
    # 설정 로드
    from .config import config
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)
    
    # 확장 초기화 (DB 초기화는 주석 처리)
    from .extensions import init_extensions
    init_extensions(app)
    
    
    # Jinja2 템플릿에서 사용할 전역 함수 등록
    app.jinja_env.globals.update(max=max, min=min)
    
    # 업로드 폴더 생성
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
    
    # 라우트 등록 - 템플릿 렌더링 위주로 구현
    from .routes import init_routes
    init_routes(app)
    
    # 앱 시작 시 메시지 표시 (콘솔에 출력)
    print("=" * 80)
    print("애플리케이션이 시작되었습니다.")
    print("* DB 연동은 구현되어 있지 않으며 하드코딩된 데이터를 사용합니다.")
    print("* 모든 계정의 비밀번호는 \"password\"입니다.")
    print("=" * 80)
    
    # 모든 요청 처리 전에 실행되는 함수 등록
    @app.before_request
    def show_startup_info():
        # 앱이 시작된 후 첫 요청에서만 로그를 남김
        if not hasattr(g, '_startup_message_shown'):
            app.logger.info('애플리케이션이 시작되었습니다. DB 연동은 구현되어 있지 않으며 하드코딩된 데이터를 사용합니다.')
            app.logger.info('모든 계정의 비밀번호는 "password"입니다.')
            g._startup_message_shown = True
    
    return app 