from datetime import datetime, date
from typing import Union, Any
from .constants import DATE_FORMAT


def format_date(date_obj: Union[date, datetime, str, None], 
                output_format: str = DATE_FORMAT) -> str:
    """날짜 객체를 지정된 형식의 문자열로 변환"""
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


def format_number(number: Union[int, float, str, None]) -> str:
    """숫자를 3자리 콤마 형식으로 포맷팅"""
    if number is None:
        return '-'
    
    try:
        numeric_value = float(number)
        return f'{numeric_value:,.0f}'
    except (ValueError, TypeError):
        return '-'


def get_current_date_string(date_format: str = DATE_FORMAT) -> str:
    """현재 날짜를 지정된 형식의 문자열로 반환"""
    return datetime.now().strftime(date_format)


def get_filename_timestamp() -> str:
    """파일명용 타임스탬프 문자열 반환"""
    return datetime.now().strftime('%Y%m%d')


def safe_int_convert(value: Any, default: int = 0) -> int:
    """안전한 정수 변환"""
    try:
        return int(value)
    except (ValueError, TypeError):
        return default


def safe_float_convert(value: Any, default: float = 0.0) -> float:
    """안전한 실수 변환"""
    try:
        return float(value)
    except (ValueError, TypeError):
        return default