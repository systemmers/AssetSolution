"""
자산관리 시스템 설정 모듈

코드 인덱스:
1. 기본 설정 및 환경 변수 로드
2. 기본 설정 클래스 (Config)
   2.1. 보안 및 데이터베이스 설정
   2.2. 파일 업로드 설정
   2.3. 이메일 설정
   2.4. 페이지네이션 설정
   2.5. 로그인 설정
   2.6. 앱 초기화 메서드
3. 개발 환경 설정 클래스 (DevelopmentConfig)
4. 테스트 환경 설정 클래스 (TestingConfig)
5. 프로덕션 환경 설정 클래스 (ProductionConfig)
   5.1. 로깅 설정
6. 환경별 설정 매핑
"""

# 1. 기본 설정 및 환경 변수 로드
import os
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
parentdir = os.path.abspath(os.path.join(basedir, '..'))
load_dotenv(os.path.join(parentdir, '.env'))

# 2. 기본 설정 클래스 (Config)
class Config:
    # 2.1. 보안 및 데이터베이스 설정
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'hard-to-guess-string'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # 2.2. 파일 업로드 설정
    STATIC_FOLDER = os.path.join(basedir, 'static')
    UPLOAD_FOLDER = os.path.join(STATIC_FOLDER, 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB 최대 파일 크기
    
    # 2.3. 이메일 설정
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.googlemail.com')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', '587'))
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'true').lower() in \
        ['true', 'on', '1']
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER')
    
    # 2.4. 페이지네이션 설정
    POSTS_PER_PAGE = 10
    
    # 2.5. 로그인 설정
    LOGIN_DISABLED = False
    
    # 2.6. 앱 초기화 메서드
    @staticmethod
    def init_app(app):
        pass

# 3. 개발 환경 설정 클래스 (DevelopmentConfig)
class DevelopmentConfig(Config):
    DEBUG = True

# 4. 테스트 환경 설정 클래스 (TestingConfig)
class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite://'
    WTF_CSRF_ENABLED = False

# 5. 프로덕션 환경 설정 클래스 (ProductionConfig)
class ProductionConfig(Config):
    @classmethod
    def init_app(cls, app):
        Config.init_app(app)
        
        # 5.1. 로깅 설정
        import logging
        from logging.handlers import RotatingFileHandler
        
        file_handler = RotatingFileHandler('app.log', maxBytes=10240, backupCount=10)
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        ))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
        
        app.logger.setLevel(logging.INFO)
        app.logger.info('Asset Management System startup')

# 6. 환경별 설정 매핑
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
} 