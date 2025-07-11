"""
사용자 및 권한 관련 모델

# 역할
# 부서
# 사용자

"""
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin

from ..extensions import db

class Role(db.Model):
    """역할 모델 클래스
    
    사용자의 역할(관리자, 일반 사용자 등)을 정의하는 모델입니다.
    """
    __tablename__ = 'roles'
    id = db.Column(db.Integer, primary_key=True)  # 기본 키
    name = db.Column(db.String(64), nullable=False)  # 역할 이름
    description = db.Column(db.String(200))  # 역할 설명
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # 생성 일시
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)  # 수정 일시
    
    def __repr__(self):
        return f'<Role {self.name}>'

class Department(db.Model):
    """부서 모델 클래스
    
    조직의 부서를 정의하는 모델입니다. 계층 구조를 가질 수 있습니다.
    """
    __tablename__ = 'departments'
    id = db.Column(db.Integer, primary_key=True)  # 기본 키
    code = db.Column(db.String(10), nullable=False)  # 부서 코드
    name = db.Column(db.String(50), nullable=False)  # 부서 이름
    description = db.Column(db.Text)  # 부서 설명
    parent_id = db.Column(db.Integer, db.ForeignKey('departments.id'))  # 상위 부서 ID
    is_active = db.Column(db.Boolean, default=True)  # 활성화 여부
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # 생성 일시
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)  # 수정 일시
    
    # 관계 정의
    parent = db.relationship('Department', remote_side=[id], backref=db.backref('children', lazy='dynamic'))  # 상위-하위 부서 관계
    
    def __repr__(self):
        return f'<Department {self.name}>'

class User(UserMixin, db.Model):
    """사용자 모델 클래스
    
    시스템 사용자 정보를 정의하는 모델입니다.
    """
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)  # 기본 키
    username = db.Column(db.String(64), unique=True, nullable=False)  # 사용자 아이디
    name = db.Column(db.String(64))  # 사용자 이름
    email = db.Column(db.String(120), unique=True, nullable=False)  # 이메일
    password_hash = db.Column(db.String(128))  # 암호화된 비밀번호
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'))  # 소속 부서 ID
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'))  # 역할 ID
    position = db.Column(db.String(64))  # 직위
    is_active = db.Column(db.Boolean, default=True)  # 활성화 여부
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # 생성 일시
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)  # 수정 일시
    
    # 관계 정의
    department = db.relationship('Department', backref='users')  # 부서-사용자 관계
    role = db.relationship('Role', backref='users')  # 역할-사용자 관계
    
    @property
    def password(self):
        """비밀번호 직접 접근 방지"""
        raise AttributeError('password is not a readable attribute')
    
    def set_password(self, password):
        """비밀번호 설정 (해시 처리)"""
        self.password_hash = generate_password_hash(password)
    
    def verify_password(self, password):
        """비밀번호 검증"""
        return check_password_hash(self.password_hash, password)
    
    def __repr__(self):
        return f'<User {self.username}>' 