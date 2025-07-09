

"""
애플리케이션 확장 객체들을 정의하는 모듈
확장 객체들은 여기서 초기화하고 app.py에서 애플리케이션과 연결됩니다.
"""
# 코드 인덱스:
# 1. 데이터베이스 초기화
# 2. 로그인 관리자 초기화
# 3. 하드코딩된 사용자 데이터
# 4. 사용자 클래스 정의
# 5. 사용자 로드 콜백 함수
# 6. 애플리케이션 확장 초기화 함수

# 1. 데이터베이스 초기화
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin
from flask_migrate import Migrate

# 데이터베이스 초기화는 템플릿 구현 후 마지막에 진행됩니다
# db = SQLAlchemy()
# migrate = Migrate()

# 로그인 관리자 초기화
login_manager = LoginManager()
login_manager.login_view = 'auth.login'
login_manager.login_message = '이 페이지에 접근하려면 로그인이 필요합니다.'
login_manager.login_message_category = 'warning'

# 4. 사용자 repository 연동
from app.repositories.user import user_repository

@login_manager.user_loader
def load_user(user_id):
    """사용자 ID로 사용자 객체를 로드하는 콜백 함수"""
    # user_repository를 통해 MockUser 객체 로드
    return user_repository.get_mock_user_by_id(int(user_id))

def init_extensions(app):
    """
    애플리케이션과 확장 객체들을 초기화합니다.
    """
    # 데이터베이스 초기화는 템플릿 구현 후 마지막에 진행됩니다
    # db.init_app(app)
    # migrate.init_app(app, db)
    login_manager.init_app(app) 