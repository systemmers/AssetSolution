"""
Asset Special Service - PC/IP/Software 특수 자산 관리 비즈니스 로직
PC, IP, Software 등 특수한 형태의 자산 관리를 담당

Classes:
    - AssetSpecialService: PC/IP/Software 특수 자산 관련 비즈니스 로직
"""
from typing import Dict, Optional, Any, List
from ...repositories.asset.asset_repository import asset_repository


class AssetSpecialService:
    """PC/IP/Software 특수 자산 관리 비즈니스 로직을 담당하는 서비스 클래스"""
    
    def __init__(self):
        """서비스 초기화"""
        self.repository = asset_repository
    
    def get_pc_asset_details(self, asset_id: int) -> Optional[Dict[str, Any]]:
        """PC 자산의 모든 상세 정보를 조회"""
        asset = self.repository.get_asset_by_id(asset_id)
        if not asset or asset.get('type', {}).get('name') != '하드웨어':
            return None

        pc_details = self.repository.get_pc_asset_details_by_asset_id(asset_id)
        ip_assignments = self.repository.get_ip_assignments_by_asset_id(asset_id)
        
        # 기본 자산 정보에 상세 정보들을 추가하여 반환
        asset['details'] = pc_details
        asset['ip_assignments'] = ip_assignments
        
        return asset

    def get_software_asset_details(self, asset_id: int) -> Optional[Dict[str, Any]]:
        """소프트웨어 자산의 모든 상세 정보를 조회"""
        asset = self.repository.get_asset_by_id(asset_id)
        if not asset or asset.get('type', {}).get('name') != '소프트웨어':
            return None
            
        sw_details = self.repository.get_software_details_by_asset_id(asset_id)
        
        asset['details'] = sw_details
        
        return asset

    def get_ip_details_by_address(self, ip_address: str) -> Optional[Dict[str, Any]]:
        """IP 주소로 상세 정보를 조회 (연결된 자산, 사용자 포함)"""
        ip_info = self.repository.find_ip_by_address(ip_address)
        if not ip_info:
            return None
            
        if ip_info.get('asset_id'):
            ip_info['asset'] = self.repository.get_asset_by_id(ip_info['asset_id'])
        
        if ip_info.get('user_id'):
            ip_info['user'] = self.repository.get_user_by_id(ip_info['user_id'])
            
        return ip_info

    def get_pc_management_list(self) -> List[Dict[str, Any]]:
        """PC 관리 목록에 필요한 데이터를 조회"""
        return self.repository.get_all_pc_assets()

    def get_ip_management_list(self) -> List[Dict[str, Any]]:
        """IP 관리 목록에 필요한 데이터를 조회"""
        return self.repository.get_all_ip_assignments()

    def get_sw_license_management_list(self) -> List[Dict[str, Any]]:
        """SW 라이선스 관리 목록에 필요한 데이터를 조회"""
        return self.repository.get_all_software_assets()
    
    def get_pc_asset_statistics(self) -> Dict[str, Any]:
        """PC 자산 통계 정보 조회"""
        pc_assets = self.repository.get_all_pc_assets()
        
        total_count = len(pc_assets)
        in_use_count = len([pc for pc in pc_assets if pc.get('status') == 'in_use'])
        available_count = len([pc for pc in pc_assets if pc.get('status') == 'available'])
        maintenance_count = len([pc for pc in pc_assets if pc.get('status') == 'maintenance'])
        
        return {
            'total_pc_count': total_count,
            'in_use_pc_count': in_use_count,
            'available_pc_count': available_count,
            'maintenance_pc_count': maintenance_count
        }
    
    def get_ip_usage_statistics(self) -> Dict[str, Any]:
        """IP 사용 현황 통계 조회"""
        ip_assignments = self.repository.get_all_ip_assignments()
        
        total_ips = len(ip_assignments)
        assigned_ips = len([ip for ip in ip_assignments if ip.get('asset_id')])
        available_ips = total_ips - assigned_ips
        
        return {
            'total_ip_count': total_ips,
            'assigned_ip_count': assigned_ips,
            'available_ip_count': available_ips,
            'utilization_rate': round((assigned_ips / total_ips * 100), 2) if total_ips > 0 else 0
        }
    
    def get_software_license_statistics(self) -> Dict[str, Any]:
        """소프트웨어 라이선스 통계 조회"""
        software_assets = self.repository.get_all_software_assets()
        
        total_licenses = 0
        used_licenses = 0
        expiring_licenses = 0
        
        for sw in software_assets:
            if sw.get('license_count'):
                total_licenses += sw['license_count']
                used_licenses += sw.get('used_license_count', 0)
            
            # 만료 예정 라이선스 체크 (30일 이내)
            if sw.get('license_expiry'):
                from datetime import datetime, timedelta
                try:
                    expiry_date = datetime.strptime(sw['license_expiry'], '%Y-%m-%d').date()
                    if expiry_date <= datetime.now().date() + timedelta(days=30):
                        expiring_licenses += 1
                except ValueError:
                    pass
        
        available_licenses = total_licenses - used_licenses
        
        return {
            'total_license_count': total_licenses,
            'used_license_count': used_licenses,
            'available_license_count': available_licenses,
            'expiring_license_count': expiring_licenses,
            'license_utilization_rate': round((used_licenses / total_licenses * 100), 2) if total_licenses > 0 else 0
        }
    
    def assign_ip_to_asset(self, ip_id: int, asset_id: int, user_id: int = None) -> bool:
        """IP를 자산에 할당"""
        try:
            # IP와 자산 존재 여부 확인
            ip_info = self.repository.get_ip_assignment_by_id(ip_id)
            asset = self.repository.get_asset_by_id(asset_id)
            
            if not ip_info or not asset:
                return False
            
            # 이미 할당된 IP인지 확인
            if ip_info.get('asset_id'):
                return False
            
            # IP 할당 실행
            return self.repository.assign_ip_to_asset(ip_id, asset_id, user_id)
            
        except Exception as e:
            print(f"IP 할당 중 오류: {str(e)}")
            return False
    
    def unassign_ip_from_asset(self, ip_id: int) -> bool:
        """자산에서 IP 할당 해제"""
        try:
            return self.repository.unassign_ip_from_asset(ip_id)
        except Exception as e:
            print(f"IP 할당 해제 중 오류: {str(e)}")
            return False
    
    def update_software_license_usage(self, software_id: int, used_count: int) -> bool:
        """소프트웨어 라이선스 사용 수량 업데이트"""
        try:
            software = self.repository.get_asset_by_id(software_id)
            if not software:
                return False
            
            sw_details = self.repository.get_software_details_by_asset_id(software_id)
            if not sw_details:
                return False
            
            # 사용 가능한 라이선스 수를 초과하지 않는지 확인
            total_licenses = sw_details.get('license_count', 0)
            if used_count > total_licenses:
                return False
            
            return self.repository.update_software_license_usage(software_id, used_count)
            
        except Exception as e:
            print(f"소프트웨어 라이선스 사용량 업데이트 중 오류: {str(e)}")
            return False 