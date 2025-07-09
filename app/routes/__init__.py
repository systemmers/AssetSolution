"""
라우트 패키지
"""
from .auth import auth_bp
from .assets import assets_bp
from .users import users_bp
from .settings import settings_bp
from .inventory import inventory_bp
from .contract import contract_bp
from .main import main_bp
from .operations import operations_bp
from .demo import demo_bp
from .api import api_bp

def init_routes(app):
    """
    애플리케이션에 라우트 블루프린트를 등록합니다.
    """
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(main_bp)
    app.register_blueprint(assets_bp, url_prefix='/assets')
    app.register_blueprint(users_bp, url_prefix='/users')
    app.register_blueprint(settings_bp, url_prefix='/settings')
    app.register_blueprint(inventory_bp, url_prefix='/inventory')
    app.register_blueprint(contract_bp, url_prefix='/contract')
    app.register_blueprint(operations_bp, url_prefix='/operations') 
    app.register_blueprint(demo_bp)
    app.register_blueprint(api_bp) 