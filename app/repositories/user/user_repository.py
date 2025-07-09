"""
# 코드 인덱스:
# 1. UserRepository 클래스 정의
# 2. 사용자 조회 메서드들
# 3. 사용자 생성/수정/삭제 메서드들
# 4. 역할 및 부서 관련 메서드들
# 5. 인증 관련 메서드들

User Repository
사용자 관련 비즈니스 로직을 관리합니다.
"""

from ..base_repository import BaseRepository
from .data.user_data import user_data
from flask_login import UserMixin
import copy

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
        self._active = user_data['is_active']
        self.phone = user_data.get('phone', '')
        self.position = user_data.get('position', '일반 직원')
        self.hire_date = user_data.get('hire_date', '')
    
    def get_id(self):
        return str(self.id)
    
    @property
    def is_active(self):
        return self._active
        
    def check_password(self, password):
        """개발용 간단 비밀번호 체크 (실제로는 안전한 검증 필요)"""
        return self.password_hash == password or password == 'password'
        
    @property
    def is_admin(self):
        """관리자 역할(role_id=1)인지 확인"""
        return self.role_id == 1

class UserRepository(BaseRepository):
    """
    사용자 관련 데이터와 비즈니스 로직을 관리하는 Repository
    """
    
    def __init__(self):
        super().__init__()
        self.data = user_data
    
    def _load_sample_data(self):
        """BaseRepository 추상 메서드 구현"""
        return self.data.get_all_users()
    
    def _validate_data(self, data, is_update=False):
        """BaseRepository 추상 메서드 구현"""
        if not is_update:
            if not data.get('username'):
                raise ValueError('사용자명은 필수입니다.')
            if not data.get('email'):
                raise ValueError('이메일은 필수입니다.')
            if not data.get('name'):
                raise ValueError('이름은 필수입니다.')
    
    def get_all_users(self):
        """모든 사용자 목록 조회"""
        return self.data.get_all_users()
    
    def get_enhanced_users(self):
        """부서 및 역할 정보가 포함된 사용자 목록 조회"""
        return self.data.get_enhanced_user_data()
    
    def get_user_by_id(self, user_id):
        """ID로 사용자 조회"""
        return self.data.get_user_by_id(user_id)
    
    def get_user_by_username(self, username):
        """사용자명으로 사용자 조회"""
        return self.data.get_user_by_username(username)
    
    def get_user_by_email(self, email):
        """이메일로 사용자 조회"""
        return self.data.get_user_by_email(email)
    
    def get_mock_user_by_id(self, user_id):
        """Flask-Login용 MockUser 객체 반환"""
        user_data_dict = self.data.get_user_by_id(user_id)
        if user_data_dict:
            return MockUser(user_data_dict)
        return None
    
    def get_mock_user_by_username(self, username):
        """Flask-Login용 MockUser 객체 반환 (사용자명으로 검색)"""
        user_data_dict = self.data.get_user_by_username(username)
        if user_data_dict:
            return MockUser(user_data_dict)
        return None
    
    def create_user(self, user_data_dict):
        """새 사용자 생성"""
        # 중복 확인
        if self.data.get_user_by_username(user_data_dict.get('username')):
            raise ValueError('이미 존재하는 사용자 아이디입니다.')
        
        if self.data.get_user_by_email(user_data_dict.get('email')):
            raise ValueError('이미 존재하는 이메일입니다.')
        
        return self.data.add_user(user_data_dict)
    
    def update_user(self, user_id, update_data_dict):
        """사용자 정보 수정"""
        # 사용자 존재 확인
        existing_user = self.data.get_user_by_id(user_id)
        if not existing_user:
            raise ValueError('해당 사용자를 찾을 수 없습니다.')
        
        # 이메일 중복 확인 (본인 제외)
        if 'email' in update_data_dict:
            email_user = self.data.get_user_by_email(update_data_dict['email'])
            if email_user and email_user['id'] != user_id:
                raise ValueError('이미 존재하는 이메일입니다.')
        
        return self.data.update_user(user_id, update_data_dict)
    
    def delete_user(self, user_id):
        """사용자 삭제"""
        return self.data.delete_user(user_id)
    
    def get_all_roles(self):
        """모든 역할 목록 조회"""
        return self.data.get_all_roles()
    
    def get_role_by_id(self, role_id):
        """ID로 역할 조회"""
        return self.data.get_role_by_id(role_id)
    
    def get_all_departments(self):
        """모든 부서 목록 조회"""
        return self.data.get_all_departments()
    
    def get_department_by_id(self, dept_id):
        """ID로 부서 조회"""
        return self.data.get_department_by_id(dept_id)
    
    def authenticate_user(self, username, password):
        """사용자 인증"""
        user = self.get_mock_user_by_username(username)
        if user and user.check_password(password):
            return user
        return None
    
    def is_username_available(self, username):
        """사용자명 사용 가능 여부 확인"""
        return self.data.get_user_by_username(username) is None
    
    def is_email_available(self, email):
        """이메일 사용 가능 여부 확인"""
        return self.data.get_user_by_email(email) is None
    
    def get_users_by_department(self, dept_id):
        """부서별 사용자 목록 조회"""
        all_users = self.data.get_all_users()
        return [user for user in all_users if user['department_id'] == dept_id]
    
    def get_users_by_role(self, role_id):
        """역할별 사용자 목록 조회"""
        all_users = self.data.get_all_users()
        return [user for user in all_users if user['role_id'] == role_id]
    
    def get_active_users(self):
        """활성 사용자 목록 조회"""
        all_users = self.data.get_all_users()
        return [user for user in all_users if user['is_active']]

# 싱글톤 인스턴스 생성
user_repository = UserRepository() 