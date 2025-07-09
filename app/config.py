"""
Flask Configuration Classes
환경별 설정 분리를 위한 설정 클래스 정의

코드 인덱스:
- Config: 기본 설정 클래스
- DevelopmentConfig: 개발 환경 설정
- ProductionConfig: 운영 환경 설정
- TestingConfig: 테스트 환경 설정
"""

import os
from datetime import timedelta
from app.utils.constants import (
    TIMEOUT_SETTINGS, ALERT_DURATION, INPUT_DELAY, 
    BUSINESS_RULES, PAGINATION_SETTINGS, MAX_FILE_SIZE
)


class Config:
    """기본 설정 클래스"""
    
    # Flask 기본 설정
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # 데이터베이스 설정
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///app.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # 파일 업로드 설정 - constants.py와 동기화
    MAX_CONTENT_LENGTH = MAX_FILE_SIZE  # 16MB
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER') or 'uploads'
    
    # 세션 설정 - constants.py의 TIMEOUT_SETTINGS 활용
    PERMANENT_SESSION_LIFETIME = timedelta(
        milliseconds=TIMEOUT_SETTINGS['LARGE_OPERATION_TIMEOUT']
    )
    
    # 페이지네이션 설정 - constants.py와 동기화
    POSTS_PER_PAGE = PAGINATION_SETTINGS['DEFAULT_PER_PAGE']
    MAX_POSTS_PER_PAGE = PAGINATION_SETTINGS['MAX_PER_PAGE']
    
    # 비즈니스 규칙 설정 - constants.py와 동기화
    LOAN_LIMIT = BUSINESS_RULES['LOAN_LIMIT']
    NOTIFICATION_LIMIT = BUSINESS_RULES['NOTIFICATION_LIMIT']
    
    # 메일 설정
    MAIL_SERVER = os.environ.get('MAIL_SERVER') or 'localhost'
    MAIL_PORT = int(os.environ.get('MAIL_PORT') or 587)
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'true').lower() in ['true', 'on', '1']
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    
    # 로깅 설정
    LOG_TO_STDOUT = os.environ.get('LOG_TO_STDOUT')
    
    # API 설정
    API_TIMEOUT = TIMEOUT_SETTINGS['API_TIMEOUT'] / 1000  # 초 단위로 변환
    
    # 알림 설정 - constants.py와 동기화
    ALERT_DURATION_SHORT = ALERT_DURATION['SHORT']
    ALERT_DURATION_MEDIUM = ALERT_DURATION['MEDIUM']
    ALERT_DURATION_LONG = ALERT_DURATION['LONG']
    
    # 입력 지연 설정 - constants.py와 동기화
    INPUT_DEBOUNCE_DELAY = INPUT_DELAY['DEBOUNCE']
    SEARCH_DEBOUNCE_DELAY = INPUT_DELAY['SEARCH_DEBOUNCE']
    
    @staticmethod
    def init_app(app):
        """애플리케이션 초기화"""
        pass


class DevelopmentConfig(Config):
    """개발 환경 설정"""
    
    DEBUG = True
    
    # 개발용 데이터베이스
    SQLALCHEMY_DATABASE_URI = os.environ.get('DEV_DATABASE_URL') or \
        'sqlite:///' + os.path.join(os.path.dirname(__file__), '..', 'data-dev.sqlite')
    
    # 개발용 메일 설정
    MAIL_SERVER = 'localhost'
    MAIL_PORT = 8025
    MAIL_USE_TLS = False
    
    # 개발용 로깅
    LOG_LEVEL = 'DEBUG'
    
    # 개발용 API 설정
    API_BASE_URL = 'http://localhost:5000/api'
    
    @staticmethod
    def init_app(app):
        Config.init_app(app)
        
        # 개발 환경용 로깅 설정
        import logging
        from logging.handlers import RotatingFileHandler
        
        if not app.debug and not app.testing:
            if not os.path.exists('logs'):
                os.mkdir('logs')
            file_handler = RotatingFileHandler('logs/asset_solution.log',
                                               maxBytes=10240, backupCount=10)
            file_handler.setFormatter(logging.Formatter(
                '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'))
            file_handler.setLevel(logging.INFO)
            app.logger.addHandler(file_handler)
            app.logger.setLevel(logging.INFO)
            app.logger.info('Asset Solution startup')


class TestingConfig(Config):
    """테스트 환경 설정"""
    
    TESTING = True
    
    # 테스트용 인메모리 데이터베이스
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    
    # 테스트용 설정
    WTF_CSRF_ENABLED = False
    
    # 테스트용 타임아웃 단축
    API_TIMEOUT = 5  # 5초로 단축
    
    # 테스트용 비즈니스 규칙
    LOAN_LIMIT = 3  # 테스트용으로 제한 축소
    
    @staticmethod
    def init_app(app):
        Config.init_app(app)


class ProductionConfig(Config):
    """운영 환경 설정"""
    
    DEBUG = False
    
    # 운영용 데이터베이스
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(os.path.dirname(__file__), '..', 'data.sqlite')
    
    # 운영용 보안 설정
    SSL_REDIRECT = True
    
    # 운영용 세션 보안
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    # 운영용 로깅
    LOG_LEVEL = 'INFO'
    
    # 운영용 API 설정
    API_BASE_URL = '/api'
    
    @staticmethod
    def init_app(app):
        Config.init_app(app)
        
        # 운영 환경용 로깅 설정
        import logging
        from logging.handlers import SMTPHandler, RotatingFileHandler
        
        # 이메일 로깅 핸들러
        if app.config['MAIL_SERVER']:
            auth = None
            if app.config['MAIL_USERNAME'] or app.config['MAIL_PASSWORD']:
                auth = (app.config['MAIL_USERNAME'], app.config['MAIL_PASSWORD'])
            secure = None
            if app.config['MAIL_USE_TLS']:
                secure = ()
            mail_handler = SMTPHandler(
                mailhost=(app.config['MAIL_SERVER'], app.config['MAIL_PORT']),
                fromaddr='no-reply@' + app.config['MAIL_SERVER'],
                toaddrs=app.config['ADMINS'],
                subject='Asset Solution Failure',
                credentials=auth, secure=secure)
            mail_handler.setLevel(logging.ERROR)
            app.logger.addHandler(mail_handler)
        
        # 파일 로깅 핸들러
        if not os.path.exists('logs'):
            os.mkdir('logs')
        file_handler = RotatingFileHandler('logs/asset_solution.log',
                                           maxBytes=10240, backupCount=10)
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
        
        app.logger.setLevel(logging.INFO)
        app.logger.info('Asset Solution startup')


# 설정 매핑
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}


def get_config_class(config_name=None):
    """설정 클래스 반환"""
    if config_name is None:
        config_name = os.environ.get('FLASK_CONFIG', 'default')
    return config[config_name]


def create_app_config(config_name=None):
    """애플리케이션 설정 생성"""
    config_class = get_config_class(config_name)
    return config_class() 