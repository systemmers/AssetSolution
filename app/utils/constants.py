"""
Asset Management System Constants
자산 관리 시스템 전역 상수 정의

이 파일은 시스템 전반에서 사용되는 상수들을 중앙에서 관리합니다.
"""

# 자산 카테고리 매핑
ASSET_CATEGORIES = {
    1: '노트북',
    2: '데스크탑', 
    3: '모니터',
    4: '서버',
    5: '네트워크 장비',
    6: '주변기기',
    7: '소프트웨어'
}

# 자산 상태 매핑
ASSET_STATUS = {
    'available': '사용가능',
    'in_use': '사용중',
    'in_repair': '수리중',
    'disposed': '폐기',
    'reserved': '예약됨'
}

# 계약 유형 매핑
CONTRACT_TYPES = {
    'license': '라이선스',
    'maintenance': '유지보수',
    'lease': '임대/리스'
}

# 계약 상태 매핑
CONTRACT_STATUS = {
    'active': '활성',
    'inactive': '비활성',
    'expired': '만료',
    'expiring': '만료예정'
}

# 운영 유형 매핑
OPERATION_TYPES = {
    'maintenance': '유지보수',
    'upgrade': '업그레이드',
    'repair': '수리',
    'installation': '설치',
    'replacement': '교체',
    'inspection': '점검',
    'backup': '백업',
    'cleanup': '청소/정리'
}

# 운영 상태 매핑
OPERATION_STATUS = {
    'planned': '계획됨',
    'in_progress': '진행중',
    'completed': '완료',
    'canceled': '취소됨',
    'delayed': '지연됨',
    'pending': '대기중'
}

# 사용자 권한 레벨
USER_ROLES = {
    'admin': '관리자',
    'manager': '매니저',
    'user': '일반사용자',
    'viewer': '조회자'
}

# 반납 워크플로우 상태 매핑
RETURN_WORKFLOW_STATUS = {
    'requested': '반납 요청됨',
    'dept_approval': '부서장 승인 대기',
    'asset_manager_approval': '자산관리자 승인 대기',
    'final_approval': '최종 승인 대기',
    'approved': '승인 완료',
    'rejected': '반납 거부됨',
    'returned': '반납 완료',
    'cancelled': '요청 취소됨'
}

# 반납 물리적 상태 매핑
RETURN_PHYSICAL_STATUS = {
    'normal': '정상',
    'damaged': '손상',
    'lost': '분실',
    'repair_needed': '수리필요'
}

# 반납 긴급도 매핑
RETURN_URGENCY = {
    'low': '낮음',
    'normal': '보통',
    'high': '높음',
    'urgent': '긴급'
}

# 반납 상태 추적 액션 타입
RETURN_ACTION_TYPES = {
    'request_submitted': '반납 요청 제출',
    'dept_approved': '부서장 승인',
    'dept_rejected': '부서장 거부',
    'asset_manager_approved': '자산관리자 승인',
    'asset_manager_rejected': '자산관리자 거부',
    'final_approved': '최종 승인',
    'final_rejected': '최종 거부',
    'return_completed': '반납 완료',
    'request_cancelled': '요청 취소',
    'status_updated': '상태 업데이트',
    'comment_added': '코멘트 추가'
}

# 반납 상태별 색상 매핑 (UI용)
RETURN_STATUS_COLORS = {
    'requested': 'primary',
    'dept_approval': 'warning',
    'asset_manager_approval': 'info',
    'final_approval': 'secondary',
    'approved': 'success',
    'rejected': 'danger',
    'returned': 'success',
    'cancelled': 'muted'
}

# 반납 상태별 진행률 매핑
RETURN_STATUS_PROGRESS = {
    'requested': 10,
    'dept_approval': 25,
    'asset_manager_approval': 50,
    'final_approval': 75,
    'approved': 90,
    'returned': 100,
    'rejected': 0,
    'cancelled': 0
}

# 파일 형식 및 확장자
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}
ALLOWED_DOCUMENT_EXTENSIONS = {'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB

# Excel/CSV 내보내기 설정
EXPORT_HEADERS = [
    '자산번호', '자산명', '유형', '카테고리', '상태', '부서', '위치', '사용자',
    '취득일', '취득가액', '시리얼번호', '제조사', '모델명', '보증만료일', '현재가치'
]

# 페이지네이션 설정
DEFAULT_PAGE_SIZE = 10
MAX_PAGE_SIZE = 200
AVAILABLE_PAGE_SIZES = [10, 25, 50, 100, 200]

# 페이지네이션 설정 (새로운 서비스에서 사용)
PAGINATION_SETTINGS = {
    'DEFAULT_PER_PAGE': 10,
    'MAX_PER_PAGE': 200,
    'ITEMS_PER_PAGE_OPTIONS': [10, 25, 50, 100, 200]
}

# 검색 및 필터링 설정
SEARCH_MIN_LENGTH = 2
MAX_SEARCH_RESULTS = 1000

# 알림 설정
NOTIFICATION_TYPES = {
    'success': '성공',
    'warning': '경고',
    'error': '오류',
    'info': '정보'
}

# 반납 알림 관련 상수
RETURN_NOTIFICATION_TYPES = {
    'APPROVAL_REQUEST': 'approval_request',
    'DUE_REMINDER': 'due_reminder',
    'OVERDUE_ALERT': 'overdue_alert',
    'STATUS_CHANGE': 'status_change',
    'SYSTEM_ALERT': 'system_alert'
}

NOTIFICATION_PRIORITIES = {
    'LOW': 'low',
    'MEDIUM': 'medium',
    'HIGH': 'high',
    'CRITICAL': 'critical'
}

NOTIFICATION_CHANNELS = {
    'EMAIL': 'email',
    'SYSTEM': 'system',
    'SMS': 'sms',
    'PUSH': 'push'
}

NOTIFICATION_STATUS = {
    'PENDING': 'pending',
    'SENT': 'sent',
    'DELIVERED': 'delivered',
    'READ': 'read',
    'FAILED': 'failed',
    'BOUNCED': 'bounced'
}

NOTIFICATION_TRIGGERS = {
    'IMMEDIATE': 'immediate',
    'ONE_DAY_BEFORE': '1_day_before',
    'THREE_DAYS_BEFORE': '3_days_before',
    'ONE_WEEK_BEFORE': '1_week_before',
    'ON_OVERDUE': 'on_overdue',
    'DAILY_DIGEST': 'daily_digest'
}

# 시스템 설정
DEFAULT_CURRENCY = 'KRW'
DATE_FORMAT = '%Y-%m-%d'
DATETIME_FORMAT = '%Y-%m-%d %H:%M:%S'

# API 응답 코드
HTTP_STATUS = {
    'OK': 200,
    'CREATED': 201,
    'BAD_REQUEST': 400,
    'UNAUTHORIZED': 401,
    'FORBIDDEN': 403,
    'NOT_FOUND': 404,
    'INTERNAL_ERROR': 500
}

# 비즈니스 규칙 상수
WARRANTY_ALERT_DAYS = 30  # 보증 만료 30일 전 알림
CONTRACT_ALERT_DAYS = 90  # 계약 만료 90일 전 알림
ASSET_DEPRECIATION_YEARS = 5  # 자산 감가상각 기간 (년)

# 정렬 옵션
SORT_OPTIONS = {
    'recent': '최근 등록순',
    'name_asc': '이름 오름차순',
    'name_desc': '이름 내림차순',
    'price_asc': '가격 낮은 순',
    'price_desc': '가격 높은 순',
    'date_asc': '취득일 오름차순',
    'date_desc': '취득일 내림차순'
}

# 뷰 모드
VIEW_MODES = {
    'table': '테이블 뷰',
    'card': '카드 뷰',
    'grid': '그리드 뷰'
}

# 헬퍼 함수들
def get_category_name(category_id):
    """카테고리 ID로 카테고리 이름 반환"""
    return ASSET_CATEGORIES.get(category_id, '기타')

def get_status_name(status):
    """상태 코드로 상태 이름 반환"""
    return ASSET_STATUS.get(status, '기타')

def get_contract_type_name(contract_type):
    """계약 유형 코드로 계약 유형 이름 반환"""
    return CONTRACT_TYPES.get(contract_type, '기타')

def get_contract_status_name(status_code):
    """계약 상태 코드에 대응하는 이름 반환"""
    return CONTRACT_STATUS.get(status_code, '기타')

def get_return_workflow_status_name(status_code):
    """반납 워크플로우 상태 코드에 대응하는 이름 반환"""
    return RETURN_WORKFLOW_STATUS.get(status_code, '알 수 없음')

def get_return_physical_status_name(status_code):
    """반납 물리적 상태 코드에 대응하는 이름 반환"""
    return RETURN_PHYSICAL_STATUS.get(status_code, '알 수 없음')

def get_return_urgency_name(urgency_code):
    """반납 긴급도 코드에 대응하는 이름 반환"""
    return RETURN_URGENCY.get(urgency_code, '보통')

def get_return_action_name(action_code):
    """반납 액션 타입 코드에 대응하는 이름 반환"""
    return RETURN_ACTION_TYPES.get(action_code, '알 수 없음')

def get_return_status_color(status_code):
    """반납 상태에 대응하는 색상 반환"""
    return RETURN_STATUS_COLORS.get(status_code, 'secondary')

def get_return_status_progress(status_code):
    """반납 상태에 대응하는 진행률 반환"""
    return RETURN_STATUS_PROGRESS.get(status_code, 0)

# 공통 유틸리티 함수들 추가
from datetime import datetime, date
from typing import Union, Any


def format_date_string(date_obj, output_format=DATE_FORMAT):
    """날짜 객체를 문자열로 변환"""
    if date_obj is None:
        return '-'
    
    try:
        if isinstance(date_obj, str):
            return date_obj
        elif isinstance(date_obj, (date, datetime)):
            return date_obj.strftime(output_format)
        else:
            return '-'
    except (ValueError, AttributeError):
        return '-'


def format_number_with_commas(number):
    """숫자를 3자리 콤마 형식으로 포맷팅"""
    if number is None:
        return '-'
    
    try:
        numeric_value = float(number)
        return f'{numeric_value:,.0f}'
    except (ValueError, TypeError):
        return '-'


def get_current_date_string(date_format=DATE_FORMAT):
    """현재 날짜를 문자열로 반환"""
    return datetime.now().strftime(date_format)


def get_filename_timestamp():
    """파일명용 타임스탬프 문자열 반환"""
    return datetime.now().strftime('%Y%m%d')


def safe_int_convert(value, default=0):
    """안전한 정수 변환"""
    try:
        return int(value)
    except (ValueError, TypeError):
        return default


def safe_float_convert(value, default=0.0):
    """안전한 실수 변환"""
    try:
        return float(value)
    except (ValueError, TypeError):
        return default


def validate_asset_data(asset_data, is_update=False):
    """자산 데이터 검증 및 변환"""
    validated_data = asset_data.copy()
    
    # 가격 검증 및 변환
    if 'purchase_price' in validated_data:
        validated_data['purchase_price'] = safe_float_convert(validated_data['purchase_price'], 0)
    
    # 내용연수 검증 및 변환
    if 'useful_life' in validated_data:
        validated_data['useful_life'] = safe_int_convert(validated_data['useful_life'], 36)
    
    return validated_data

# 알림 관련 헬퍼 함수들
def get_notification_type_name(type_code):
    """알림 타입 코드를 한글명으로 변환"""
    type_names = {
        'approval_request': '승인 요청',
        'due_reminder': '기한 알림',
        'overdue_alert': '연체 알림',
        'status_change': '상태 변경',
        'system_alert': '시스템 알림'
    }
    return type_names.get(type_code, type_code)

def get_notification_priority_name(priority_code):
    """알림 우선순위 코드를 한글명으로 변환"""
    priority_names = {
        'low': '낮음',
        'medium': '보통',
        'high': '높음',
        'critical': '긴급'
    }
    return priority_names.get(priority_code, priority_code)

def get_notification_status_name(status_code):
    """알림 상태 코드를 한글명으로 변환"""
    status_names = {
        'pending': '대기',
        'sent': '발송됨',
        'delivered': '전달됨',
        'read': '읽음',
        'failed': '실패',
        'bounced': '반송됨'
    }
    return status_names.get(status_code, status_code)

def get_notification_channel_name(channel_code):
    """알림 채널 코드를 한글명으로 변환"""
    channel_names = {
        'email': '이메일',
        'system': '시스템',
        'sms': 'SMS',
        'push': '푸시'
    }
    return channel_names.get(channel_code, channel_code)

def get_notification_trigger_name(trigger_code):
    """알림 트리거 코드를 한글명으로 변환"""
    trigger_names = {
        'immediate': '즉시',
        '1_day_before': '1일 전',
        '3_days_before': '3일 전',
        '1_week_before': '1주일 전',
        'on_overdue': '연체 시',
        'daily_digest': '일일 요약'
    }
    return trigger_names.get(trigger_code, trigger_code)

# 자산 폐기 관련 상수
DISPOSAL_STATUS = {
    'pending': '승인 대기',
    'approved': '승인 완료',
    'scheduled': '일정 등록',
    'in_progress': '진행 중',
    'completed': '폐기 완료',
    'cancelled': '취소됨'
}

DISPOSAL_REASONS = {
    'end_of_life': '수명 만료',
    'malfunction': '고장/오작동',
    'obsolete': '구식/지원 종료',
    'security': '보안 취약점',
    'cost_ineffective': '비용 비효율',
    'policy_change': '정책 변경'
}

DISPOSAL_PRIORITIES = {
    'low': '낮음',
    'normal': '보통',
    'high': '높음',
    'urgent': '긴급'
}

DISPOSAL_APPROVAL_STAGES = {
    'department_head': '부서장 승인',
    'asset_manager': '자산 관리자 승인',
    'finance_approval': '재무 승인',
    'final_approval': '최종 승인'
}

def get_disposal_status_text(status):
    """폐기 상태 텍스트 반환"""
    return DISPOSAL_STATUS.get(status, status)

def get_disposal_reason_text(reason):
    """폐기 사유 텍스트 반환"""
    return DISPOSAL_REASONS.get(reason, reason)

def get_disposal_priority_text(priority):
    """폐기 우선순위 텍스트 반환"""
    return DISPOSAL_PRIORITIES.get(priority, priority)

def get_disposal_approval_stage_text(stage):
    """폐기 승인 단계 텍스트 반환"""
    return DISPOSAL_APPROVAL_STAGES.get(stage, stage)