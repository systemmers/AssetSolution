"""
Asset 도메인 Mock 데이터 관리 - 상세 정보 데이터
PC 자산 상세정보, 소프트웨어 상세정보, IP 주소 할당 정보를 관리합니다.

Classes:
    - AssetDetailsData: 상세 정보 Mock 데이터 싱글톤 클래스
"""
from typing import List, Dict, Any
from datetime import datetime


class AssetDetailsData:
    """
    상세 정보 Mock 데이터 싱글톤 클래스
    PC 자산, 소프트웨어, IP 주소 상세 데이터를 관리합니다.
    """
    
    _instance = None
    _data = None
    
    def __new__(cls):
        """싱글톤 패턴 구현"""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        """AssetDetailsData 초기화"""
        if self._data is None:
            self._data = self._load_sample_data()
    
    def _load_sample_data(self) -> Dict[str, List[Dict[str, Any]]]:
        """
        샘플 상세 정보 데이터 로드
        
        Returns:
            상세 정보 데이터 딕셔너리
        """
        # PC 자산 상세 정보
        pc_asset_details = [
            {
                "asset_id": 1, 
                "cpu": "Intel Core i7-1185G7", 
                "ram": "16GB", 
                "storage": "512GB NVMe SSD", 
                "os": "Windows 11 Pro", 
                "mac_address": "00:1A:2B:3C:4D:5E",
                "graphics": "Intel Iris Xe Graphics",
                "network": "Wi-Fi 6 (802.11ax), Bluetooth 5.1",
                "ports": "2x Thunderbolt 4, 1x USB 3.2, 1x headphone/mic combo",
                "display": "13.3인치 FHD (1920x1080) IPS",
                "battery": "52Wh, 최대 12시간 사용"
            },
            {
                "asset_id": 2, 
                "cpu": "AMD Ryzen 5 5600X", 
                "ram": "32GB", 
                "storage": "1TB HDD + 256GB SSD", 
                "os": "Windows 10 Home", 
                "mac_address": "00:1A:2B:3C:4D:5F",
                "graphics": "NVIDIA GeForce GTX 1660",
                "network": "Gigabit Ethernet, Wi-Fi 5 (802.11ac)",
                "ports": "Multiple USB 3.0/2.0, HDMI, DisplayPort",
                "display": "외장 모니터 연결",
                "power_supply": "650W 80+ Bronze"
            },
            {
                "asset_id": 4, 
                "cpu": "Apple M1 Pro", 
                "ram": "16GB", 
                "storage": "1TB SSD", 
                "os": "macOS Monterey", 
                "mac_address": "00:1A:2B:3C:4D:6A",
                "graphics": "16-core GPU",
                "network": "Wi-Fi 6 (802.11ax), Bluetooth 5.0",
                "ports": "3x Thunderbolt 4, 1x HDMI, 1x SDXC card slot, 1x headphone jack",
                "display": "16.2인치 Liquid Retina XDR (3456x2234)",
                "battery": "100Wh, 최대 21시간 사용"
            },
            {
                "asset_id": 5, 
                "cpu": "Intel Core i5-10210U", 
                "ram": "8GB", 
                "storage": "256GB SSD", 
                "os": "Ubuntu 22.04 LTS", 
                "mac_address": "00:1A:2B:3C:4D:6B",
                "graphics": "Intel UHD Graphics",
                "network": "Wi-Fi 5 (802.11ac), Bluetooth 5.0",
                "ports": "2x USB 3.1, 1x USB-C, 1x HDMI, 1x headphone/mic combo",
                "display": "14인치 FHD (1920x1080) IPS",
                "battery": "45Wh, 최대 8시간 사용"
            },
            {
                "asset_id": 6, 
                "cpu": "Intel Core i9-12900K", 
                "ram": "64GB", 
                "storage": "2TB NVMe SSD", 
                "os": "Windows 11 Pro", 
                "mac_address": "00:1A:2B:3C:4D:6C",
                "graphics": "NVIDIA GeForce RTX 4080",
                "network": "2.5Gbps Ethernet, Wi-Fi 6E (802.11ax)",
                "ports": "Multiple USB 3.2/USB-C, HDMI 2.1, DisplayPort 1.4",
                "display": "외장 모니터 연결",
                "power_supply": "850W 80+ Gold"
            }
        ]

        # 소프트웨어 상세 정보 (라이선스)
        software_details = [
            {
                "asset_id": 3, 
                "license_key": "ABCD-EFGH-IJKL-MNOP", 
                "total_seats": 50, 
                "assigned_seats": 35,
                "expiry_date": datetime.strptime("2024-12-31", "%Y-%m-%d").date(),
                "license_type": "Volume License",
                "support_level": "Premium Support",
                "installation_guide": "내부 IT팀을 통한 설치",
                "restrictions": "상업적 용도로만 사용 가능"
            },
            {
                "asset_id": 7, 
                "license_key": "WXYZ-ABCD-EFGH-IJKL", 
                "total_seats": 100, 
                "assigned_seats": 85,
                "expiry_date": datetime.strptime("2025-06-30", "%Y-%m-%d").date(),
                "license_type": "Enterprise License",
                "support_level": "Enterprise Support",
                "installation_guide": "자동 배포 시스템 사용",
                "restrictions": "사내 사용자에게만 제한"
            },
            {
                "asset_id": 8, 
                "license_key": "PQRS-TUVW-XYZA-BCDE", 
                "total_seats": 25, 
                "assigned_seats": 20,
                "expiry_date": datetime.strptime("2024-09-15", "%Y-%m-%d").date(),
                "license_type": "Professional License",
                "support_level": "Standard Support",
                "installation_guide": "개별 설치 후 활성화",
                "restrictions": "디자인팀 전용"
            }
        ]
        
        # IP 주소 할당 정보
        ip_addresses = [
            {
                "id": 1, 
                "ip_address": "192.168.1.101", 
                "is_static": True, 
                "asset_id": 1, 
                "user_id": 2, 
                "assigned_date": datetime.strptime("2023-01-20", "%Y-%m-%d").date(), 
                "note": "개발팀 서버",
                "subnet_mask": "255.255.255.0",
                "gateway": "192.168.1.1",
                "dns_primary": "8.8.8.8",
                "dns_secondary": "8.8.4.4"
            },
            {
                "id": 2, 
                "ip_address": "192.168.1.102", 
                "is_static": False, 
                "asset_id": 4, 
                "user_id": 3, 
                "assigned_date": datetime.strptime("2023-04-12", "%Y-%m-%d").date(), 
                "note": "",
                "subnet_mask": "255.255.255.0",
                "gateway": "192.168.1.1",
                "dns_primary": "8.8.8.8",
                "dns_secondary": "8.8.4.4"
            },
            {
                "id": 3, 
                "ip_address": "10.0.0.50", 
                "is_static": True, 
                "asset_id": None, 
                "user_id": None, 
                "assigned_date": None, 
                "note": "사용 가능",
                "subnet_mask": "255.255.255.0",
                "gateway": "10.0.0.1",
                "dns_primary": "10.0.0.2",
                "dns_secondary": "10.0.0.3"
            },
            {
                "id": 4, 
                "ip_address": "192.168.1.103", 
                "is_static": True, 
                "asset_id": 5, 
                "user_id": 4, 
                "assigned_date": datetime.strptime("2022-11-10", "%Y-%m-%d").date(), 
                "note": "개발 전용 서버",
                "subnet_mask": "255.255.255.0",
                "gateway": "192.168.1.1",
                "dns_primary": "8.8.8.8",
                "dns_secondary": "8.8.4.4"
            },
            {
                "id": 5, 
                "ip_address": "172.16.0.100", 
                "is_static": True, 
                "asset_id": 6, 
                "user_id": 1, 
                "assigned_date": datetime.strptime("2023-06-01", "%Y-%m-%d").date(), 
                "note": "관리자 워크스테이션",
                "subnet_mask": "255.255.0.0",
                "gateway": "172.16.0.1",
                "dns_primary": "172.16.0.2",
                "dns_secondary": "172.16.0.3"
            }
        ]
        
        return {
            'pc_asset_details': pc_asset_details,
            'software_details': software_details,
            'ip_addresses': ip_addresses
        }
    
    def get_pc_asset_details(self) -> List[Dict[str, Any]]:
        """PC 자산 상세정보 조회"""
        return self._data['pc_asset_details'].copy()
    
    def get_software_details(self) -> List[Dict[str, Any]]:
        """소프트웨어 상세정보 조회"""
        return self._data['software_details'].copy()
    
    def get_ip_addresses(self) -> List[Dict[str, Any]]:
        """IP 주소 할당 정보 조회"""
        return self._data['ip_addresses'].copy()
    
    def get_pc_details_by_asset_id(self, asset_id: int) -> Dict[str, Any]:
        """자산 ID로 PC 상세정보 조회"""
        return next((pc for pc in self._data['pc_asset_details'] if pc['asset_id'] == asset_id), None)
    
    def get_software_details_by_asset_id(self, asset_id: int) -> Dict[str, Any]:
        """자산 ID로 소프트웨어 상세정보 조회"""
        return next((sw for sw in self._data['software_details'] if sw['asset_id'] == asset_id), None)
    
    def get_ip_assignments_by_asset_id(self, asset_id: int) -> List[Dict[str, Any]]:
        """자산 ID로 IP 할당 정보 조회"""
        return [ip for ip in self._data['ip_addresses'] if ip['asset_id'] == asset_id]
    
    def get_ip_by_address(self, ip_address: str) -> Dict[str, Any]:
        """IP 주소로 할당 정보 조회"""
        return next((ip for ip in self._data['ip_addresses'] if ip['ip_address'] == ip_address), None)
    
    def get_available_ips(self) -> List[Dict[str, Any]]:
        """사용 가능한 IP 주소 조회"""
        return [ip for ip in self._data['ip_addresses'] if ip['asset_id'] is None]
    
    def get_assigned_ips(self) -> List[Dict[str, Any]]:
        """할당된 IP 주소 조회"""
        return [ip for ip in self._data['ip_addresses'] if ip['asset_id'] is not None]
    
    def get_static_ips(self) -> List[Dict[str, Any]]:
        """고정 IP 주소 조회"""
        return [ip for ip in self._data['ip_addresses'] if ip['is_static']]
    
    def get_dynamic_ips(self) -> List[Dict[str, Any]]:
        """동적 IP 주소 조회"""
        return [ip for ip in self._data['ip_addresses'] if not ip['is_static']]
    
    def get_expired_software_licenses(self) -> List[Dict[str, Any]]:
        """만료된 소프트웨어 라이선스 조회"""
        today = datetime.now().date()
        return [sw for sw in self._data['software_details'] if sw['expiry_date'] < today]
    
    def get_expiring_software_licenses(self, days: int = 30) -> List[Dict[str, Any]]:
        """곧 만료될 소프트웨어 라이선스 조회"""
        from datetime import timedelta
        target_date = datetime.now().date() + timedelta(days=days)
        today = datetime.now().date()
        return [sw for sw in self._data['software_details'] 
                if today <= sw['expiry_date'] <= target_date]
    
    def get_license_utilization(self, asset_id: int) -> Dict[str, Any]:
        """라이선스 사용률 조회"""
        sw = self.get_software_details_by_asset_id(asset_id)
        if sw:
            utilization_rate = (sw['assigned_seats'] / sw['total_seats']) * 100
            available_seats = sw['total_seats'] - sw['assigned_seats']
            return {
                'total_seats': sw['total_seats'],
                'assigned_seats': sw['assigned_seats'],
                'available_seats': available_seats,
                'utilization_rate': round(utilization_rate, 2)
            }
        return None 