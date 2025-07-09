"""
생명주기 관련 Mock 데이터 관리
싱글톤 패턴을 적용하여 메모리 효율성 확보

Classes:
    - LifecycleData: 생명주기 이벤트 관련 Mock 데이터 관리 (싱글톤)
"""
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta


class LifecycleData:
    """
    생명주기 이벤트 관련 Mock 데이터 관리 (싱글톤)
    
    애플리케이션 생명주기 동안 일관된 생명주기 이벤트 데이터를 제공합니다.
    원본 operations_repository.py의 asset_lifecycle_events와 동일한 구조를 사용합니다.
    """
    
    _instance = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not LifecycleData._initialized:
            self._initialize_data()
            LifecycleData._initialized = True
    
    def _initialize_data(self):
        """초기 데이터 설정 - 원본과 동일한 asset_lifecycle_events 구조"""
        # 원본 operations_repository.py와 동일한 생명주기 이벤트 데이터
        self._asset_lifecycle_events = [
            {
                "id": 1,
                "asset_id": 101,
                "asset_name": "노후 서버 Dell PowerEdge R720",
                "asset_number": "SV-2019-001",
                "event_type": "acquisition",
                "event_type_display": "취득",
                "event_date": datetime.strptime("2019-03-15", "%Y-%m-%d").date(),
                "event_description": "신규 서버 구매 및 도입",
                "performed_by": "김IT팀장",
                "department": "IT팀",
                "related_cost": 4500000,
                "status": "completed",
                "notes": "3년 하드웨어 보증 포함",
                "created_at": datetime.strptime("2019-03-15 10:30:00", "%Y-%m-%d %H:%M:%S")
            },
            {
                "id": 2,
                "asset_id": 101,
                "asset_name": "노후 서버 Dell PowerEdge R720",
                "asset_number": "SV-2019-001",
                "event_type": "deployment",
                "event_type_display": "배치",
                "event_date": datetime.strptime("2019-03-22", "%Y-%m-%d").date(),
                "event_description": "데이터센터 랙 설치 및 서비스 시작",
                "performed_by": "이시스템관리자",
                "department": "IT팀",
                "related_cost": 200000,
                "status": "completed",
                "notes": "Windows Server 2016 설치, 초기 설정 완료",
                "created_at": datetime.strptime("2019-03-22 14:15:00", "%Y-%m-%d %H:%M:%S")
            },
            {
                "id": 3,
                "asset_id": 102,
                "asset_name": "개발팀 워크스테이션",
                "asset_number": "WS-2020-001",
                "event_type": "maintenance",
                "event_type_display": "유지보수",
                "event_date": datetime.strptime("2024-06-10", "%Y-%m-%d").date(),
                "event_description": "정기 하드웨어 점검 및 소프트웨어 업데이트",
                "performed_by": "박하드웨어기사",
                "department": "개발팀",
                "related_cost": 150000,
                "status": "completed",
                "notes": "메모리 업그레이드, OS 패치 적용",
                "created_at": datetime.strptime("2024-06-10 13:20:00", "%Y-%m-%d %H:%M:%S")
            },
            {
                "id": 4,
                "asset_id": 103,
                "asset_name": "프린터 HP LaserJet Pro",
                "asset_number": "PR-2021-003",
                "event_type": "upgrade",
                "event_type_display": "업그레이드",
                "event_date": datetime.strptime("2023-09-15", "%Y-%m-%d").date(),
                "event_description": "펌웨어 업그레이드 및 네트워크 설정 개선",
                "performed_by": "최네트워크관리자",
                "department": "총무팀",
                "related_cost": 50000,
                "status": "completed",
                "notes": "보안 패치 적용, 성능 개선",
                "created_at": datetime.strptime("2023-09-15 11:45:00", "%Y-%m-%d %H:%M:%S")
            },
            {
                "id": 5,
                "asset_id": 104,
                "asset_name": "모니터 Dell UltraSharp",
                "asset_number": "MO-2022-004",
                "event_type": "disposal",
                "event_type_display": "폐기",
                "event_date": datetime.strptime("2024-11-20", "%Y-%m-%d").date(),
                "event_description": "화면 결함으로 인한 폐기 처리",
                "performed_by": "정자산관리자",
                "department": "IT팀",
                "related_cost": 0,
                "status": "completed",
                "notes": "수리 불가 판정, 환경 친화적 폐기 처리",
                "created_at": datetime.strptime("2024-11-20 16:30:00", "%Y-%m-%d %H:%M:%S")
            },
            {
                "id": 6,
                "asset_id": 105,
                "asset_name": "노트북 ThinkPad X1",
                "asset_number": "NB-2023-002",
                "event_type": "acquisition",
                "event_type_display": "취득",
                "event_date": datetime.strptime("2023-06-01", "%Y-%m-%d").date(),
                "event_description": "신규 직원용 노트북 구매",
                "performed_by": "김구매담당자",
                "department": "인사팀",
                "related_cost": 1800000,
                "status": "completed",
                "notes": "3년 보증, MS Office 포함",
                "created_at": datetime.strptime("2023-06-01 09:15:00", "%Y-%m-%d %H:%M:%S")
            },
            {
                "id": 7,
                "asset_id": 105,
                "asset_name": "노트북 ThinkPad X1",
                "asset_number": "NB-2023-002",
                "event_type": "deployment",
                "event_type_display": "배치",
                "event_date": datetime.strptime("2023-06-05", "%Y-%m-%d").date(),
                "event_description": "신입사원에게 노트북 지급",
                "performed_by": "이IT관리자",
                "department": "IT팀",
                "related_cost": 100000,
                "status": "completed",
                "notes": "초기 설정 및 보안 프로그램 설치 완료",
                "created_at": datetime.strptime("2023-06-05 14:20:00", "%Y-%m-%d %H:%M:%S")
            },
            {
                "id": 8,
                "asset_id": 106,
                "asset_name": "스위치 Cisco Catalyst",
                "asset_number": "SW-2020-005",
                "event_type": "maintenance",
                "event_type_display": "유지보수",
                "event_date": datetime.strptime("2024-03-18", "%Y-%m-%d").date(),
                "event_description": "정기 점검 및 포트 청소",
                "performed_by": "박네트워크엔지니어",
                "department": "IT팀",
                "related_cost": 80000,
                "status": "completed",
                "notes": "모든 포트 정상 작동 확인",
                "created_at": datetime.strptime("2024-03-18 10:00:00", "%Y-%m-%d %H:%M:%S")
            },
            {
                "id": 9,
                "asset_id": 107,
                "asset_name": "태블릿 iPad Pro",
                "asset_number": "TB-2024-006",
                "event_type": "acquisition",
                "event_type_display": "취득",
                "event_date": datetime.strptime("2024-01-10", "%Y-%m-%d").date(),
                "event_description": "프레젠테이션용 태블릿 구매",
                "performed_by": "최마케팅팀장",
                "department": "마케팅팀",
                "related_cost": 1200000,
                "status": "completed",
                "notes": "Apple Pencil 및 키보드 포함",
                "created_at": datetime.strptime("2024-01-10 11:30:00", "%Y-%m-%d %H:%M:%S")
            },
            {
                "id": 10,
                "asset_id": 108,
                "asset_name": "UPS APC Smart",
                "asset_number": "UP-2021-007",
                "event_type": "upgrade",
                "event_type_display": "업그레이드",
                "event_date": datetime.strptime("2024-08-25", "%Y-%m-%d").date(),
                "event_description": "배터리 교체 및 용량 증설",
                "performed_by": "김전력관리자",
                "department": "시설팀",
                "related_cost": 300000,
                "status": "completed",
                "notes": "백업 시간 2배 증가",
                "created_at": datetime.strptime("2024-08-25 15:45:00", "%Y-%m-%d %H:%M:%S")
            }
        ]
        
        # 이벤트 유형 마스터 데이터 (원본과 동일)
        self._lifecycle_event_types = [
            {"id": 1, "code": "ACQUISITION", "name": "취득", "description": "자산 신규 구매 또는 취득", "color": "success"},
            {"id": 2, "code": "DEPLOYMENT", "name": "배치", "description": "자산 설치 및 운영 시작", "color": "info"},
            {"id": 3, "code": "MAINTENANCE", "name": "유지보수", "description": "정기/비정기 유지보수 작업", "color": "warning"},
            {"id": 4, "code": "UPGRADE", "name": "업그레이드", "description": "자산 성능 향상 또는 기능 추가", "color": "primary"},
            {"id": 5, "code": "INCIDENT", "name": "장애", "description": "자산 장애 발생 및 복구", "color": "danger"},
            {"id": 6, "code": "EVALUATION", "name": "평가", "description": "자산 상태 평가 및 검토", "color": "secondary"},
            {"id": 7, "code": "DISPOSAL", "name": "폐기", "description": "자산 폐기 또는 처분", "color": "dark"}
        ]
        
        # 부서 목록 (원본과 동일)
        self._lifecycle_departments = [
            {"value": "", "label": "전체 부서"},
            {"value": "IT팀", "label": "IT팀"},
            {"value": "개발팀", "label": "개발팀"},
            {"value": "총무팀", "label": "총무팀"},
            {"value": "인사팀", "label": "인사팀"},
            {"value": "마케팅팀", "label": "마케팅팀"},
            {"value": "시설팀", "label": "시설팀"}
        ]
    
    def reset_for_testing(self):
        """테스트용 데이터 리셋"""
        self._asset_lifecycle_events = []
        self._lifecycle_event_types = []
        self._lifecycle_departments = []
        LifecycleData._initialized = False
        self._initialize_data()
    
    # ==================== 기본 CRUD 메서드 ====================
    
    def get_all_events(self) -> List[Dict[str, Any]]:
        """모든 생명주기 이벤트 목록 조회"""
        return self._asset_lifecycle_events.copy()
    
    def get_event_by_id(self, event_id: int) -> Optional[Dict[str, Any]]:
        """ID로 생명주기 이벤트 조회"""
        return next((event for event in self._asset_lifecycle_events if event["id"] == event_id), None)
    
    def get_events_by_asset(self, asset_id: int) -> List[Dict[str, Any]]:
        """자산별 생명주기 이벤트 조회"""
        return [event for event in self._asset_lifecycle_events if event.get("asset_id") == asset_id]
    
    def get_event_types(self) -> List[Dict[str, Any]]:
        """생명주기 이벤트 유형 마스터 데이터 조회"""
        return self._lifecycle_event_types.copy()
    
    def get_departments(self) -> List[Dict[str, Any]]:
        """생명주기 관련 부서 목록 조회"""
        return self._lifecycle_departments.copy()
    
    # ==================== 필터링 및 검색 메서드 ====================
    
    def get_events_with_pagination(self, page: int = 1, per_page: int = 10, 
                                 asset_id: int = None, event_type: str = None, 
                                 department: str = None) -> Tuple[List[Dict], int, int, int]:
        """페이지네이션된 생명주기 이벤트 목록 조회"""
        # 필터링
        all_events = self._asset_lifecycle_events.copy()
        if asset_id:
            all_events = [e for e in all_events if e.get('asset_id') == asset_id]
        if event_type:
            all_events = [e for e in all_events if e.get('event_type') == event_type]
        if department:
            all_events = [e for e in all_events if e.get('department') == department]
        
        # 페이지네이션 계산
        total_count = len(all_events)
        total_pages = (total_count + per_page - 1) // per_page if total_count > 0 else 1
        
        # 페이지 번호 유효성 검사
        if page < 1:
            page = 1
        if page > total_pages and total_pages > 0:
            page = total_pages
        
        # 현재 페이지 항목 선택
        start_idx = (page - 1) * per_page
        end_idx = min(start_idx + per_page, total_count)
        current_page_items = all_events[start_idx:end_idx] if all_events else []
        
        return current_page_items, page, total_pages, total_count
    
    def get_events_by_type(self, event_type: str) -> List[Dict[str, Any]]:
        """이벤트 유형별 생명주기 이벤트 조회"""
        return [event for event in self._asset_lifecycle_events if event.get("event_type") == event_type]
    
    def get_events_by_department(self, department: str) -> List[Dict[str, Any]]:
        """부서별 생명주기 이벤트 조회"""
        return [event for event in self._asset_lifecycle_events if event.get("department") == department]
    
    def get_statistics(self) -> Dict[str, Any]:
        """생명주기 이벤트 통계 조회"""
        # 이벤트 유형별 통계
        type_stats = {}
        for event_type in self._lifecycle_event_types:
            count = len([e for e in self._asset_lifecycle_events if e.get('event_type') == event_type['code'].lower()])
            type_stats[event_type['name']] = count
        
        # 부서별 통계
        dept_stats = {}
        for event in self._asset_lifecycle_events:
            dept = event.get('department', '기타')
            dept_stats[dept] = dept_stats.get(dept, 0) + 1
        
        # 총 비용
        total_cost = sum(event.get('related_cost', 0) for event in self._asset_lifecycle_events)
        
        return {
            'total_events': len(self._asset_lifecycle_events),
            'by_event_type': type_stats,
            'by_department': dept_stats,
            'total_related_cost': total_cost,
            'recent_events': len([e for e in self._asset_lifecycle_events 
                                if e.get('event_date') and 
                                (datetime.now().date() - e['event_date']).days <= 30])
        } 