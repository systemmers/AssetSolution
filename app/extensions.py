

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

# 하드코딩된 사용자 데이터
SAMPLE_USERS = [
    {
        'id': 1,
        'username': 'admin',
        'name': '관리자',
        'email': 'admin@example.com',
        'password_hash': 'password',  # 실제로는 해시화된 값이어야 합니다
        'department_id': 1,
        'role_id': 1,  # 관리자 역할
        'is_active': True
    },
    {
        'id': 2,
        'username': 'user1',
        'name': '홍길동',
        'email': 'user1@example.com',
        'password_hash': 'password',
        'department_id': 1,
        'role_id': 2,  # 일반 사용자
        'is_active': True
    },
    {
        'id': 3,
        'username': 'user2',
        'name': '김철수',
        'email': 'user2@example.com',
        'password_hash': 'password',
        'department_id': 2,
        'role_id': 2,
        'is_active': True
    }
]

# 4. 사용자 클래스 정의
class MockUser(UserMixin):
    """Flask-Login과 호환되는 사용자 클래스"""
    
    def __init__(self, user_data):
        self.id = user_data['id']
        self.username = user_data['username']
        self.name = user_data['name']
        self.email = user_data['email']
        self.password_hash = user_data['password_hash']
        self.department_id = user_data['department_id']
        self.role_id = user_data['role_id']
        self._active = user_data['is_active']  # 내부 변수로 변경
    
    def get_id(self):
        return str(self.id)
    
    @property
    def is_active(self):
        # UserMixin의 is_active 프로퍼티 오버라이드
        return self._active
        
    def check_password(self, password):
        # 개발용 간단 비밀번호 체크 (실제로는 안전한 검증 필요)
        return self.password_hash == password or password == 'password'
        
    @property
    def is_admin(self):
        # 관리자 역할(role_id=1)인지 확인
        return self.role_id == 1

@login_manager.user_loader
def load_user(user_id):
    """사용자 ID로 사용자 객체를 로드하는 콜백 함수"""
    # 하드코딩된 데이터에서 사용자 찾기
    for user_data in SAMPLE_USERS:
        if user_data['id'] == int(user_id):
            return MockUser(user_data)
    return None

def init_extensions(app):
    """
    애플리케이션과 확장 객체들을 초기화합니다.
    """
    # 데이터베이스 초기화는 템플릿 구현 후 마지막에 진행됩니다
    # db.init_app(app)
    # migrate.init_app(app, db)
    login_manager.init_app(app) 