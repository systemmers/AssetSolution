"""
애플리케이션 패키지 초기화 모듈
렌더링 우선 구현을 위해 DB 관련 코드는 주석 처리되어 있습니다.
"""
# 데이터베이스 초기화는 템플릿 구현 후 마지막에 진행됩니다
# from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
# from flask_migrate import Migrate

# DB 초기화는 템플릿 구현 후 마지막에 진행됩니다
# db = SQLAlchemy()
# migrate = Migrate()
login_manager = LoginManager()
login_manager.login_view = 'auth.login'

# create_app 함수 가져오기
from .app import create_app 