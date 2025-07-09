"""
자산실사 관련 Mock 데이터 관리
싱글톤 패턴을 적용하여 메모리 효율성 확보
순수 데이터 컨테이너 역할만 수행 (비즈니스 로직은 Repository에서 처리)

Classes:
    - InventoryData: 자산실사 관련 Mock 데이터 관리 (싱글톤)
"""
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any


class InventoryData:
    """
    자산실사 관련 Mock 데이터 관리 (싱글톤)
    
    애플리케이션 생명주기 동안 일관된 실사 데이터를 제공합니다.
    순수 데이터 컨테이너 역할만 수행하며, 비즈니스 로직은 InventoryRepository에서 처리합니다.
    DB 전환 시 이 클래스는 제거 예정입니다.
    """
    
    _instance = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not InventoryData._initialized:
            self._initialize_data()
            InventoryData._initialized = True
    
    def _initialize_data(self):
        """초기 데이터 설정"""
        self._inventories = [
            {
                'id': 1,
                'name': '2023년 4분기 정기 실사',
                'start_date': '2023-12-01',
                'end_date': '2023-12-15',
                'status': 'in_progress',
                'manager': '홍길동',
                'department': '자산관리팀',
                'created_at': '2023-11-25',
                'description': '4분기 정기 자산 실사입니다. 본사 내 모든 하드웨어 및 소프트웨어 자산이 대상입니다.',
                'target_count': 50,
                'completed_count': 45,
                'discrepancy_count': 5
            },
            {
                'id': 2,
                'name': '본사 IT기기 특별 실사',
                'start_date': '2023-11-10',
                'end_date': '2023-11-20',
                'status': 'completed',
                'manager': '김철수',
                'department': 'IT팀',
                'created_at': '2023-11-01',
                'description': '본사 내 모든 IT 장비 실사입니다. 개발팀과 디자인팀 장비를 중점적으로 점검합니다.',
                'target_count': 60,
                'completed_count': 60,
                'discrepancy_count': 2
            },
            {
                'id': 3,
                'name': '지사 네트워크 장비 실사',
                'start_date': '2023-11-15',
                'end_date': '2023-11-25',
                'status': 'completed',
                'manager': '박상철',
                'department': '인프라팀',
                'created_at': '2023-11-05',
                'description': '모든 지사의 네트워크 장비 실사입니다. 스위치, 라우터, 액세스 포인트를 대상으로 합니다.',
                'target_count': 30,
                'completed_count': 28,
                'discrepancy_count': 0
            },
            {
                'id': 4,
                'name': '2024년 1분기 정기 실사',
                'start_date': '2024-03-01',
                'end_date': '2024-03-15',
                'status': 'planned',
                'manager': '이영희',
                'department': '자산관리팀',
                'created_at': '2024-02-15',
                'description': '1분기 정기 자산 실사입니다. 전체 자산을 대상으로 합니다.',
                'target_count': 80,
                'completed_count': 48,
                'discrepancy_count': 0
            },
            {
                'id': 5,
                'name': '2024년 2분기 정기 실사',
                'start_date': '2024-06-01',
                'end_date': '2024-06-15',
                'status': 'planned',
                'manager': '이영희',
                'department': '자산관리팀',
                'created_at': '2024-05-15',
                'description': '2분기 정기 자산 실사입니다. 전체 자산을 대상으로 합니다.',
                'target_count': 80,
                'completed_count': 0,
                'discrepancy_count': 0
            }
        ]
        
        self._inventory_details = {
            '1': {
                'summary': {
                    'total_assets': 50,
                    'scanned_assets': 45,
                    'normal_assets': 40,
                    'discrepancy_assets': 5,
                    'progress': 90,
                    'last_update': '2023-12-09'
                },
                'asset_results': [
                    {
                        'id': 1,
                        'asset_number': 'A-2023-1154',
                        'asset_name': '노트북 Dell XPS 13',
                        'category': '노트북',
                        'expected_location': '본사 3층 개발팀',
                        'scanned_location': None,
                        'expected_status': '사용중',
                        'scanned_status': None,
                        'scan_date': None,
                        'scan_by': None,
                        'discrepancy': 'not_scanned',
                        'note': '실사 기간 내 미확인'
                    },
                    {
                        'id': 2,
                        'asset_number': 'A-2023-0872',
                        'asset_name': '모니터 LG 27인치',
                        'category': '모니터',
                        'expected_location': '본사 2층 회계팀',
                        'scanned_location': '본사 3층 개발팀',
                        'expected_status': '사용중',
                        'scanned_status': '사용중',
                        'scan_date': '2023-12-04',
                        'scan_by': '김철수',
                        'discrepancy': 'location',
                        'note': '위치 불일치 - 개발팀에서 사용 중'
                    },
                    {
                        'id': 3,
                        'asset_number': 'A-2023-1023',
                        'asset_name': '키보드 Logitech MX Keys',
                        'category': '주변기기',
                        'expected_location': '본사 3층 개발팀',
                        'scanned_location': None,
                        'expected_status': '사용중',
                        'scanned_status': None,
                        'scan_date': None,
                        'scan_by': None,
                        'discrepancy': 'not_scanned',
                        'note': '분실 추정'
                    },
                    {
                        'id': 4,
                        'asset_number': 'A-2022-0458',
                        'asset_name': '스위치 Cisco SG350-28',
                        'category': '네트워크 장비',
                        'expected_location': '서버실',
                        'scanned_location': '서버실',
                        'expected_status': '사용중',
                        'scanned_status': '수리중',
                        'scan_date': '2023-12-02',
                        'scan_by': '박상철',
                        'discrepancy': 'status',
                        'note': '상태 불일치 - 포트 4개 고장으로 수리 필요'
                    },
                    {
                        'id': 5,
                        'asset_number': 'A-2021-0125',
                        'asset_name': '데스크탑 HP EliteDesk 800',
                        'category': '데스크탑',
                        'expected_location': '본사 2층 인사팀',
                        'scanned_location': '본사 2층 인사팀',
                        'expected_status': '사용중',
                        'scanned_status': '사용중',
                        'scan_date': '2023-12-05',
                        'scan_by': '홍길동',
                        'discrepancy': None,
                        'note': ''
                    }
                ],
                'activities': [
                    {
                        'date': '2023-12-09',
                        'time': '14:30',
                        'user': '홍길동',
                        'action': '노트북 Dell XPS 13 분실 보고',
                        'details': '개발팀에서 분실 신고'
                    },
                    {
                        'date': '2023-12-05',
                        'time': '10:15',
                        'user': '김철수',
                        'action': '모니터 위치 불일치 확인',
                        'details': '회계팀 → 개발팀 이동 확인'
                    },
                    {
                        'date': '2023-12-02',
                        'time': '09:45',
                        'user': '박상철',
                        'action': '스위치 상태 확인',
                        'details': '포트 4개 고장 발견, 수리 의뢰 예정'
                    }
                ]
            },
            '2': {
                'summary': {
                    'total_assets': 60,
                    'scanned_assets': 60,
                    'normal_assets': 58,
                    'discrepancy_assets': 2,
                    'progress': 100,
                    'last_update': '2023-11-20'
                },
                'asset_results': [
                    {
                        'id': 6,
                        'asset_number': 'A-2023-0945',
                        'asset_name': '프린터 HP LaserJet Pro',
                        'category': '프린터',
                        'expected_location': '본사 1층 로비',
                        'scanned_location': '본사 1층 로비',
                        'expected_status': '사용중',
                        'scanned_status': '손상',
                        'scan_date': '2023-11-18',
                        'scan_by': '이영희',
                        'discrepancy': 'status',
                        'note': '토너 누출로 인한 손상'
                    },
                    {
                        'id': 7,
                        'asset_number': 'UNKNOWN-001',
                        'asset_name': '미등록 노트북',
                        'category': '노트북',
                        'expected_location': '미등록',
                        'scanned_location': '본사 4층 마케팅팀',
                        'expected_status': '미등록',
                        'scanned_status': '사용중',
                        'scan_date': '2023-11-15',
                        'scan_by': '김철수',
                        'discrepancy': 'extra',
                        'note': '등록되지 않은 자산 발견'
                    }
                ],
                'activities': [
                    {
                        'date': '2023-11-20',
                        'time': '15:00',
                        'user': '김철수',
                        'action': '본사 IT기기 특별 실사 완료',
                        'details': '총 60개 자산 확인 완료'
                    },
                    {
                        'date': '2023-11-18',
                        'time': '11:30',
                        'user': '이영희',
                        'action': '프린터 손상 확인',
                        'details': '토너 누출로 인한 손상 발견'
                    }
                ]
            }
        }
        
        self._discrepancies = [
            {
                'id': 1,
                'inventory_id': 1,
                'asset_number': 'A-2023-1154',
                'asset_name': '노트북 Dell XPS 13',
                'type': 'lost',  # 템플릿에서 사용하는 필드명
                'expected_location': '본사 3층 개발팀',
                'actual_location': '미확인',  # 템플릿에서 사용하는 필드명
                'expected_status': '사용중',
                'actual_status': '분실',
                'severity': 'high',
                'status': 'pending',
                'discovery_date': '2023-12-09',  # 템플릿에서 사용하는 필드명
                'reported_by': '홍길동',
                'note': '실사 기간 내 미확인'
            },
            {
                'id': 2,
                'inventory_id': 1,
                'asset_number': 'A-2023-0872',
                'asset_name': '모니터 LG 27인치',
                'type': 'location',
                'expected_location': '본사 2층 회계팀',
                'actual_location': '본사 3층 개발팀',
                'expected_status': '사용중',
                'actual_status': '사용중',
                'severity': 'medium',
                'status': 'pending',
                'discovery_date': '2023-12-04',
                'reported_by': '김철수',
                'note': '위치 불일치 - 개발팀에서 사용 중'
            },
            {
                'id': 3,
                'inventory_id': 1,
                'asset_number': 'A-2022-0458',
                'asset_name': '스위치 Cisco SG350-28',
                'type': 'status',
                'expected_location': '서버실',
                'actual_location': '서버실',
                'expected_status': '사용중',
                'actual_status': '수리중',
                'severity': 'medium',
                'status': 'investigating',
                'discovery_date': '2023-12-02',
                'reported_by': '박상철',
                'note': '상태 불일치 - 포트 4개 고장으로 수리 필요'
            },
            {
                'id': 4,
                'inventory_id': 2,
                'asset_number': 'A-2023-0945',
                'asset_name': '프린터 HP LaserJet Pro',
                'type': 'damaged',
                'expected_location': '본사 1층 로비',
                'actual_location': '본사 1층 로비',
                'expected_status': '사용중',
                'actual_status': '손상',
                'severity': 'high',
                'status': 'confirmed',
                'discovery_date': '2023-11-18',
                'reported_by': '이영희',
                'note': '토너 누출로 인한 손상'
            },
            {
                'id': 5,
                'inventory_id': 2,
                'asset_number': 'UNKNOWN-001',
                'asset_name': '미등록 노트북',
                'type': 'extra',
                'expected_location': '미등록',
                'actual_location': '본사 4층 마케팅팀',
                'expected_status': '미등록',
                'actual_status': '사용중',
                'severity': 'medium',
                'status': 'pending',
                'discovery_date': '2023-11-15',
                'reported_by': '김철수',
                'note': '등록되지 않은 자산 발견'
            }
        ]
    
    def reset_for_testing(self):
        """테스트용 데이터 리셋"""
        self._inventories = []
        self._inventory_details = {}
        self._discrepancies = []
        InventoryData._initialized = False
        self._initialize_data()
    
    # ==================== 자산실사 기본 CRUD ====================
    
    def get_all_inventories(self) -> List[Dict[str, Any]]:
        """모든 자산실사 목록 조회"""
        return self._inventories.copy()
    
    def get_inventory_by_id(self, inventory_id: int) -> Optional[Dict[str, Any]]:
        """ID로 자산실사 조회"""
        for inventory in self._inventories:
            if inventory['id'] == inventory_id:
                return inventory.copy()
        return None
    
    def add_inventory(self, inventory_data: Dict[str, Any]) -> Dict[str, Any]:
        """새 자산실사 추가"""
        new_id = max([inv['id'] for inv in self._inventories]) + 1 if self._inventories else 1
        new_inventory = {
            'id': new_id,
            'created_at': datetime.now().strftime('%Y-%m-%d'),
            **inventory_data
        }
        self._inventories.append(new_inventory)
        return new_inventory
    
    def update_inventory(self, inventory_id: int, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """자산실사 정보 업데이트"""
        for i, inventory in enumerate(self._inventories):
            if inventory['id'] == inventory_id:
                self._inventories[i].update(update_data)
                return self._inventories[i].copy()
        return None
    
    def delete_inventory(self, inventory_id: int) -> bool:
        """자산실사 삭제"""
        for i, inventory in enumerate(self._inventories):
            if inventory['id'] == inventory_id:
                del self._inventories[i]
                return True
        return False
    
    # ==================== 실사 상세 결과 관리 ====================
    
    def get_inventory_details(self, inventory_id: str) -> Optional[Dict[str, Any]]:
        """자산실사 상세 결과 조회"""
        return self._inventory_details.get(inventory_id, {}).copy()
    
    def update_inventory_details(self, inventory_id: str, details_data: Dict[str, Any]) -> bool:
        """실사 상세 결과 업데이트"""
        if inventory_id in self._inventory_details:
            self._inventory_details[inventory_id].update(details_data)
            return True
        else:
            self._inventory_details[inventory_id] = details_data
            return True
    
    # ==================== 불일치 기본 CRUD ====================
    
    def get_discrepancy_by_id(self, discrepancy_id: int) -> Optional[Dict[str, Any]]:
        """ID로 불일치 조회"""
        for discrepancy in self._discrepancies:
            if discrepancy['id'] == discrepancy_id:
                return discrepancy.copy()
        return None
    
    def add_discrepancy(self, discrepancy_data: Dict[str, Any]) -> Dict[str, Any]:
        """새 불일치 추가"""
        new_id = max([d['id'] for d in self._discrepancies]) + 1 if self._discrepancies else 1
        new_discrepancy = {
            'id': new_id,
            **discrepancy_data
        }
        self._discrepancies.append(new_discrepancy)
        return new_discrepancy
    
    def update_discrepancy(self, discrepancy_id: int, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """불일치 정보 업데이트"""
        for i, discrepancy in enumerate(self._discrepancies):
            if discrepancy['id'] == discrepancy_id:
                self._discrepancies[i].update(update_data)
                return self._discrepancies[i].copy()
        return None 