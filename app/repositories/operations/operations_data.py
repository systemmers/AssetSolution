"""
Operations Domain Data 모듈
운영 관리 도메인의 마스터 데이터를 관리합니다.

Classes:
    - OperationsData: 운영 관리 도메인 데이터 싱글톤 클래스
"""

from datetime import datetime
from typing import List, Dict


class OperationsData:
    """운영 관리 도메인 데이터 싱글톤 클래스"""
    
    _instance = None
    _data = None
    
    def __new__(cls):
        """싱글톤 패턴 구현"""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        """OperationsData 초기화"""
        if self._data is None:
            self._data = self._load_master_data()
    
    def _load_master_data(self) -> Dict:
        """마스터 데이터 로드"""
        return {
            'loan_status': self._load_loan_statuses(),
            'disposal_reasons': self._load_disposal_reasons(),
            'allocation_requesters': self._load_allocation_requesters(),
            'allocation_assets': self._load_allocation_assets(),
            'allocation_types': self._load_allocation_types(),
            'allocation_statuses': self._load_allocation_statuses(),
            'allocation_request_titles': self._load_allocation_request_titles(),
            'disposal_planning_statuses': self._load_disposal_planning_statuses(),
            'disposal_plans': self._load_disposal_plans()
        }
    
    def _load_loan_statuses(self) -> List[Dict]:
        """대여 상태 마스터 데이터"""
        return [
            {"id": 1, "code": "PENDING", "name": "대여 신청", "description": "대여 승인 대기중"},
            {"id": 2, "code": "APPROVED", "name": "대여 승인", "description": "대여 승인 완료"},
            {"id": 3, "code": "LOANED", "name": "대여중", "description": "현재 대여중인 상태"},
            {"id": 4, "code": "RETURNED", "name": "반납 완료", "description": "반납이 완료된 상태"},
            {"id": 5, "code": "OVERDUE", "name": "반납 지연", "description": "반납 기한이 지난 상태"},
            {"id": 6, "code": "LOST", "name": "분실", "description": "자산이 분실된 상태"},
        ]
    
    def _load_disposal_reasons(self) -> List[Dict]:
        """폐기 사유 마스터 데이터"""
        return [
            {"id": 1, "code": "BROKEN", "name": "고장/파손", "description": "수리 불가능한 고장 또는 파손"},
            {"id": 2, "code": "OUTDATED", "name": "노후화", "description": "기술적 노후화로 활용가치 감소"},
            {"id": 3, "code": "REPLACEMENT", "name": "교체", "description": "신규 자산으로 교체"},
            {"id": 4, "code": "LOST", "name": "분실", "description": "자산 분실로 인한 폐기 처리"},
            {"id": 5, "code": "OTHER", "name": "기타", "description": "기타 사유"}
        ]
    
    def _load_allocation_requesters(self) -> List[Dict]:
        """지급 요청 관련 마스터 데이터"""
        return [
            {'name': '김영호', 'department': '개발팀'},
            {'name': '이수진', 'department': '마케팅팀'},
            {'name': '박민수', 'department': '영업팀'},
            {'name': '정하늘', 'department': '인사팀'},
            {'name': '최원영', 'department': '재무팀'},
            {'name': '한지민', 'department': '개발팀'},
            {'name': '김태현', 'department': '마케팅팀'},
            {'name': '이경미', 'department': '영업팀'},
            {'name': '박성호', 'department': '인사팀'},
            {'name': '정미영', 'department': '재무팀'},
            {'name': '최준혁', 'department': '개발팀'},
            {'name': '한소영', 'department': '마케팅팀'}
        ]
    
    def _load_allocation_assets(self) -> List[Dict]:
        """지급 요청용 자산 정보"""
        return [
            {'name': 'MacBook Pro 14인치', 'number': 'IT-2024-001'},
            {'name': 'Dell 모니터 27인치', 'number': 'IT-2024-002'},
            {'name': '무선 마우스', 'number': 'IT-2024-003'},
            {'name': '사무용 의자', 'number': 'FU-2024-001'},
            {'name': 'A4 복사용지', 'number': 'ST-2024-001'},
            {'name': '프린터 토너', 'number': 'ST-2024-002'},
            {'name': '책상', 'number': 'FU-2024-002'},
            {'name': '화상회의 카메라', 'number': 'IT-2024-004'},
            {'name': '노트북 거치대', 'number': 'IT-2024-005'},
            {'name': '외장 하드디스크', 'number': 'IT-2024-006'},
            {'name': '사무용품 세트', 'number': 'ST-2024-003'},
            {'name': 'LED 스탠드', 'number': 'OF-2024-001'}
        ]
    
    def _load_allocation_types(self) -> List[Dict]:
        """지급 유형 및 색상 매핑"""
        return [
            {'type': '임시지급', 'value': 'temporary', 'color': 'info'},
            {'type': '영구지급', 'value': 'permanent', 'color': 'success'},
            {'type': '소모품지급', 'value': 'consumable', 'color': 'warning'},
            {'type': '부서공용지급', 'value': 'department', 'color': 'primary'},
            {'type': '특별지급', 'value': 'special', 'color': 'danger'}
        ]
    
    def _load_allocation_statuses(self) -> List[Dict]:
        """지급 요청 상태별 정보"""
        return [
            {'status': 'pending', 'name': '승인대기'},
            {'status': 'approved', 'name': '승인됨'},
            {'status': 'allocated', 'name': '지급완료'},
            {'status': 'returned', 'name': '반납완료'},
            {'status': 'expired', 'name': '기간만료'}
        ]
    
    def _load_allocation_request_titles(self) -> List[str]:
        """지급 요청 제목 템플릿"""
        return [
            '신규 프로젝트 개발 장비 지급 요청',
            '원격 근무용 장비 지급 신청',
            '부서 공용 장비 추가 요청',
            '고객 미팅용 장비 임시 지급',
            '교육용 장비 지급 요청',
            '출장용 장비 임시 대여',
            '신입사원 업무용 장비 지급',
            '프레젠테이션용 장비 요청',
            '회의실 장비 업그레이드',
            '소모품 정기 지급 요청',
            '특별 프로젝트용 장비 지급',
            '재택근무 환경 구성 요청'
        ]
    
    def _load_disposal_planning_statuses(self) -> List[Dict]:
        """폐기 계획 상태 마스터 데이터"""
        return [
            {"id": 1, "code": "PENDING", "name": "승인대기", "description": "폐기 계획 승인 대기중"},
            {"id": 2, "code": "APPROVED", "name": "승인완료", "description": "폐기 계획 승인 완료"},
            {"id": 3, "code": "SCHEDULED", "name": "폐기예정", "description": "폐기 일정이 확정됨"},
            {"id": 4, "code": "COMPLETED", "name": "폐기완료", "description": "폐기 작업이 완료됨"}
        ]
    
    def _load_disposal_plans(self) -> List[Dict]:
        """폐기 계획 데이터"""
        return [
            # 승인대기 상태 (3개)
            {
                "id": 1,
                "asset_id": 101,
                "asset_name": "구형 노트북 ThinkPad X220",
                "asset_number": "NB-2019-001",
                "disposal_type": "매각",
                "disposal_type_en": "sale",
                "type_color": "success",
                "planned_date": datetime.strptime("2025-01-15", "%Y-%m-%d").date(),
                "estimated_value": 200000,
                "status": "pending",
                "status_id": 1,
                "progress_percentage": 0,
                "reason": "노후화",
                "description": "Windows 10 지원 종료로 인한 교체",
                "approver": None,
                "approved_date": None,
                "created_by": "김관리",
                "created_at": datetime.strptime("2024-12-20 14:30:00", "%Y-%m-%d %H:%M:%S"),
                "department": "IT팀"
            },
            {
                "id": 2,
                "asset_id": 102,
                "asset_name": "고장난 프린터 HP LaserJet",
                "asset_number": "PR-2020-005",
                "disposal_type": "폐기",
                "disposal_type_en": "disposal",
                "type_color": "warning",
                "planned_date": datetime.strptime("2025-01-20", "%Y-%m-%d").date(),
                "estimated_value": 0,
                "status": "pending",
                "status_id": 1,
                "progress_percentage": 0,
                "reason": "고장/파손",
                "description": "토너 누출 및 수리 불가능",
                "approver": None,
                "approved_date": None,
                "created_by": "이담당",
                "created_at": datetime.strptime("2024-12-21 09:15:00", "%Y-%m-%d %H:%M:%S"),
                "department": "총무팀"
            }
            # Note: 실제로는 더 많은 데이터가 있지만 간소화
        ]
    
    # ========== 접근 메서드들 ==========
    
    def get_loan_statuses(self) -> List[Dict]:
        """대여 상태 마스터 데이터 조회"""
        return self._data['loan_status'].copy()
    
    def get_disposal_reasons(self) -> List[Dict]:
        """폐기 사유 마스터 데이터 조회"""
        return self._data['disposal_reasons'].copy()
    
    def get_allocation_requesters(self) -> List[Dict]:
        """지급 요청자 마스터 데이터 조회"""
        return self._data['allocation_requesters'].copy()
    
    def get_allocation_assets(self) -> List[Dict]:
        """지급 요청용 자산 정보 조회"""
        return self._data['allocation_assets'].copy()
    
    def get_allocation_types(self) -> List[Dict]:
        """지급 유형 정보 조회"""
        return self._data['allocation_types'].copy()
    
    def get_allocation_statuses(self) -> List[Dict]:
        """지급 요청 상태 정보 조회"""
        return self._data['allocation_statuses'].copy()
    
    def get_allocation_request_titles(self) -> List[str]:
        """지급 요청 제목 템플릿 조회"""
        return self._data['allocation_request_titles'].copy()
    
    def get_disposal_planning_statuses(self) -> List[Dict]:
        """폐기 계획 상태 마스터 데이터 조회"""
        return self._data['disposal_planning_statuses'].copy()
    
    def get_disposal_plans(self) -> List[Dict]:
        """폐기 계획 데이터 조회"""
        return self._data['disposal_plans'].copy() 