"""
자산 관련 모델

# 자산 유형
# 자산 상태
# 감가상각 방법
# 위치
# 자산
# 자산 이력
# 자산 대여
# 유지보수 기록
# 수리 기록
# 문서
# 소프트웨어 라이선스
# PC 자산 상세 정보
# IP 주소
"""


from datetime import datetime
from flask import current_app

from ..extensions import db

class AssetType(db.Model):
    """자산 유형 모델 클래스
    
    자산의 유형(하드웨어, 소프트웨어 등)을 정의하는 모델입니다.
    """
    __tablename__ = 'asset_types'
    id = db.Column(db.Integer, primary_key=True)  # 기본 키
    code = db.Column(db.String(10), nullable=False)  # 자산 유형 코드
    name = db.Column(db.String(50), nullable=False)  # 자산 유형 이름
    description = db.Column(db.Text)  # 자산 유형 설명
    is_active = db.Column(db.Boolean, default=True)  # 활성화 여부
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # 생성 일시
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)  # 수정 일시
    
    def __repr__(self):
        return f'<AssetType {self.name}>'

class AssetStatus(db.Model):
    """자산 상태 모델 클래스
    
    자산의 상태(사용중, 수리중, 폐기 등)를 정의하는 모델입니다.
    """
    __tablename__ = 'asset_statuses'
    id = db.Column(db.Integer, primary_key=True)  # 기본 키
    code = db.Column(db.String(10), nullable=False)  # 자산 상태 코드
    name = db.Column(db.String(50), nullable=False)  # 자산 상태 이름
    description = db.Column(db.Text)  # 자산 상태 설명
    is_active = db.Column(db.Boolean, default=True)  # 활성화 여부
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # 생성 일시
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)  # 수정 일시
    
    def __repr__(self):
        return f'<AssetStatus {self.name}>'

class DepreciationMethod(db.Model):
    """감가상각 방법 모델 클래스
    
    자산의 감가상각 방법(정액법, 정률법 등)을 정의하는 모델입니다.
    """
    __tablename__ = 'depreciation_methods'
    id = db.Column(db.Integer, primary_key=True)  # 기본 키
    name = db.Column(db.String(50), nullable=False)  # 감가상각 방법 이름
    description = db.Column(db.Text)  # 감가상각 방법 설명

class Location(db.Model):
    """위치 모델 클래스
    
    자산이 위치한 장소를 정의하는 모델입니다. 계층 구조를 가질 수 있습니다.
    """
    __tablename__ = 'locations'
    id = db.Column(db.Integer, primary_key=True)  # 기본 키
    code = db.Column(db.String(10), nullable=False)  # 위치 코드
    name = db.Column(db.String(50), nullable=False)  # 위치 이름
    description = db.Column(db.Text)  # 위치 설명
    parent_id = db.Column(db.Integer, db.ForeignKey('locations.id'))  # 상위 위치 ID
    is_active = db.Column(db.Boolean, default=True)  # 활성화 여부
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # 생성 일시
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)  # 수정 일시
    
    # 관계 정의
    parent = db.relationship('Location', remote_side=[id], backref=db.backref('children', lazy='dynamic'))  # 상위-하위 위치 관계
    
    def __repr__(self):
        return f'<Location {self.name}>'

class Asset(db.Model):
    """자산 모델 클래스
    
    관리 대상 자산 정보를 정의하는 모델입니다.
    """
    __tablename__ = 'assets'
    id = db.Column(db.Integer, primary_key=True)  # 기본 키
    asset_number = db.Column(db.String(50), nullable=False)  # 자산 번호
    name = db.Column(db.String(64), nullable=False)  # 자산 이름
    type_id = db.Column(db.Integer, db.ForeignKey('asset_types.id'), nullable=False)  # 자산 유형 ID
    status_id = db.Column(db.Integer, db.ForeignKey('asset_statuses.id'), nullable=False)  # 자산 상태 ID
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=False)  # 소유 부서 ID
    location_id = db.Column(db.Integer, db.ForeignKey('locations.id'), nullable=False)  # 위치 ID
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))  # 사용자 ID
    purchase_date = db.Column(db.Date, nullable=False)  # 구매 일자
    purchase_price = db.Column(db.Numeric(10, 2), nullable=False)  # 구매 가격
    serial_number = db.Column(db.String(50))  # 시리얼 번호
    manufacturer = db.Column(db.String(64))  # 제조사
    model = db.Column(db.String(64))  # 모델명
    warranty_expiry = db.Column(db.Date)  # 보증 만료일
    note = db.Column(db.Text)  # 비고
    depreciation_method_id = db.Column(db.Integer, db.ForeignKey('depreciation_methods.id'))  # 감가상각 방법 ID
    useful_life = db.Column(db.Integer)  # 내용연수(개월)
    image_path = db.Column(db.String(200))  # 이미지 경로
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # 생성 일시
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)  # 수정 일시

    # 관계 정의
    type = db.relationship('AssetType', backref='assets')  # 자산 유형 관계
    status = db.relationship('AssetStatus', backref='assets')  # 자산 상태 관계
    department = db.relationship('Department', backref='assets')  # 부서 관계
    location = db.relationship('Location', backref='assets')  # 위치 관계
    user = db.relationship('User', backref='assets')  # 사용자 관계
    depreciation_method = db.relationship('DepreciationMethod', backref='assets')  # 감가상각 방법 관계

    @property
    def current_value(self):
        """현재 자산 가치 계산
        
        감가상각 방법에 따라 현재 자산의 가치를 계산합니다.
        """
        if not self.purchase_price or not self.purchase_date or not self.useful_life:
            return 0
            
        # 경과 개월 수 계산
        elapsed_months = (datetime.now().date() - self.purchase_date).days / 30.44
        
        # 감가상각 방법에 따른 현재가치 계산
        if self.depreciation_method and self.depreciation_method.name == '정액법':
            monthly_depreciation = self.purchase_price / self.useful_life
            current_value = max(0, self.purchase_price - (monthly_depreciation * elapsed_months))
        elif self.depreciation_method and self.depreciation_method.name == '정률법':
            depreciation_rate = 1 - (0.1 ** (1 / self.useful_life))  # 10% 정률
            current_value = max(0, self.purchase_price * (1 - depreciation_rate) ** elapsed_months)
        else:
            # 감가상각 방법이 없거나 알 수 없는 경우 정액법으로 계산
            monthly_depreciation = self.purchase_price / self.useful_life
            current_value = max(0, self.purchase_price - (monthly_depreciation * elapsed_months))
            
        return current_value
        
    def __repr__(self):
        return f'<Asset {self.asset_number} - {self.name}>'

class AssetHistory(db.Model):
    """자산 이력 모델 클래스
    
    자산의 변경 이력을 기록하는 모델입니다.
    """
    __tablename__ = 'asset_history'
    id = db.Column(db.Integer, primary_key=True)  # 기본 키
    asset_id = db.Column(db.Integer, nullable=False)  # 자산 ID
    user_id = db.Column(db.Integer, nullable=False)  # 변경한 사용자 ID
    action = db.Column(db.String(64), nullable=False)  # 이동, 상태변경, 사용자변경 등
    description = db.Column(db.Text)  # 변경 내용 설명
    status_id = db.Column(db.Integer)  # 변경된 상태 ID
    location_id = db.Column(db.Integer)  # 변경된 위치 ID
    assigned_user_id = db.Column(db.Integer)  # 변경된 할당 사용자 ID
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # 생성 일시
    
    def __repr__(self):
        return f'<AssetHistory {self.id}>'

class AssetLoan(db.Model):
    """자산 대여 모델 클래스
    
    자산의 대여 정보를 관리하는 모델입니다.
    """
    __tablename__ = 'asset_loans'
    id = db.Column(db.Integer, primary_key=True)  # 기본 키
    asset_id = db.Column(db.Integer, nullable=False)  # 자산 ID
    user_id = db.Column(db.Integer, nullable=False)  # 대여자 ID
    loan_date = db.Column(db.Date, nullable=False)  # 대여 일자
    expected_return_date = db.Column(db.Date)  # 예상 반납 일자
    actual_return_date = db.Column(db.Date)  # 실제 반납 일자
    approve_user_id = db.Column(db.Integer, nullable=False)  # 승인자 ID
    status = db.Column(db.String(64), default='대여중')  # 대여중, 반납완료, 연체
    note = db.Column(db.Text)  # 비고
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # 생성 일시
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)  # 수정 일시
    
    def __repr__(self):
        return f'<AssetLoan {self.id}>'

class MaintenanceRecord(db.Model):
    """유지보수 기록 모델 클래스
    
    자산의 유지보수 기록을 관리하는 모델입니다.
    """
    __tablename__ = 'maintenance_records'
    id = db.Column(db.Integer, primary_key=True)  # 기본 키
    asset_id = db.Column(db.Integer, nullable=False)  # 자산 ID
    user_id = db.Column(db.Integer, nullable=False)  # 등록한 사용자 ID
    maintenance_date = db.Column(db.Date, nullable=False)  # 유지보수 일자
    description = db.Column(db.Text, nullable=False)  # 유지보수 내용
    cost = db.Column(db.Integer)  # 비용
    vendor = db.Column(db.String(100))  # 업체
    next_maintenance_date = db.Column(db.Date)  # 다음 유지보수 예정일
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # 생성 일시
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)  # 수정 일시
    
    def __repr__(self):
        return f'<MaintenanceRecord {self.id}>'

class RepairRecord(db.Model):
    """수리 기록 모델 클래스
    
    자산의 수리 기록을 관리하는 모델입니다.
    """
    __tablename__ = 'repair_records'
    id = db.Column(db.Integer, primary_key=True)  # 기본 키
    asset_id = db.Column(db.Integer, nullable=False)  # 자산 ID
    user_id = db.Column(db.Integer, nullable=False)  # 등록한 사용자 ID
    issue_date = db.Column(db.Date, nullable=False)  # 문제 발생 일자
    repair_date = db.Column(db.Date)  # 수리 일자
    issue_description = db.Column(db.Text, nullable=False)  # 문제 설명
    repair_description = db.Column(db.Text)  # 수리 내용
    cost = db.Column(db.Integer)  # 비용
    vendor = db.Column(db.String(100))  # 업체
    status = db.Column(db.String(64), default='접수')  # 접수, 수리중, 완료
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # 생성 일시
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)  # 수정 일시
    
    def __repr__(self):
        return f'<RepairRecord {self.id}>'

class Document(db.Model):
    """문서 모델 클래스
    
    자산과 관련된 문서 정보를 관리하는 모델입니다.
    """
    __tablename__ = 'documents'
    id = db.Column(db.Integer, primary_key=True)  # 기본 키
    asset_id = db.Column(db.Integer, db.ForeignKey('assets.id'), nullable=False)  # 자산 ID
    file_name = db.Column(db.String(255), nullable=False)  # 파일명
    file_path = db.Column(db.String(255), nullable=False)  # 파일 경로
    file_type = db.Column(db.String(64))  # 파일 유형
    file_size = db.Column(db.Integer)  # 파일 크기
    document_type = db.Column(db.String(64))  # 문서 유형 (매뉴얼, 보증서, 계약서 등)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)  # 업로드 일시
    uploader_id = db.Column(db.Integer)  # 업로더 ID
    description = db.Column(db.Text)  # 문서 설명
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # 생성 일시
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)  # 수정 일시
    
    # 자산과의 관계
    asset = db.relationship('Asset', back_populates='documents')
    
    def __repr__(self):
        return f'<Document {self.file_name}>'

    def get_file_size_display(self):
        """파일 크기를 사람이 읽기 쉬운 형태로 변환"""
        if not self.file_size:
            return "0 B"
            
        units = ['B', 'KB', 'MB', 'GB']
        size = float(self.file_size)
        unit_index = 0
        
        while size >= 1024 and unit_index < len(units) - 1:
            size /= 1024
            unit_index += 1
            
        return f"{size:.2f} {units[unit_index]}"
        
    def get_file_extension(self):
        """파일 확장자 추출"""
        if not self.file_path:
            return ""
            
        return self.file_path.split('.')[-1].lower()

class SoftwareLicense(db.Model):
    """소프트웨어 라이선스 모델 클래스
    
    소프트웨어 라이선스 정보를 관리하는 모델입니다.
    """
    __tablename__ = 'software_licenses'
    id = db.Column(db.Integer, primary_key=True)  # 기본 키
    asset_id = db.Column(db.Integer, db.ForeignKey('assets.id'), nullable=True)  # 자산 ID (옵션)
    product_name = db.Column(db.String(100), nullable=False)  # 제품명
    manufacturer = db.Column(db.String(100), nullable=False)  # 제조사
    license_type = db.Column(db.String(50), nullable=False)  # 소프트웨어 유형 (운영체제, 오피스, 디자인/그래픽 등)
    version = db.Column(db.String(50))  # 버전
    license_key = db.Column(db.String(255))  # 라이선스 키
    purchase_date = db.Column(db.Date)  # 구매 일자
    expiry_date = db.Column(db.Date)  # 만료 일자
    is_perpetual = db.Column(db.Boolean, default=False)  # 영구 라이선스 여부
    seats = db.Column(db.Integer, default=1)  # 라이선스 수량
    assigned_to_user_id = db.Column(db.Integer)  # 할당된 사용자 ID
    assigned_to_department_id = db.Column(db.Integer)  # 할당된 부서 ID
    assigned_to_device_id = db.Column(db.Integer)  # 할당된 장치 ID
    purchase_price = db.Column(db.Numeric(10, 2))  # 구매 가격
    status = db.Column(db.String(50), default='사용중')  # 상태 (사용중, 미사용, 만료 예정, 만료됨)
    notes = db.Column(db.Text)  # 비고
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # 생성 일시
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)  # 수정 일시
    
    # 자산과의 관계 (옵션)
    asset = db.relationship('Asset', backref=db.backref('software_license', uselist=False))
    
    def __repr__(self):
        return f'<SoftwareLicense {self.product_name} {self.version}>'
    
    def is_expired(self):
        """라이선스 만료 여부를 확인합니다."""
        if self.is_perpetual:
            return False
        if not self.expiry_date:
            return False
        return self.expiry_date < datetime.utcnow().date()
    
    def days_until_expiry(self):
        """만료까지 남은 일수를 반환합니다."""
        if self.is_perpetual:
            return float('inf')
        if not self.expiry_date:
            return None
        delta = self.expiry_date - datetime.utcnow().date()
        return delta.days

class PCAssetDetails(db.Model):
    """PC 자산 상세 정보 모델
    
    PC 자산의 특화된 하드웨어 및 소프트웨어 사양을 관리합니다.
    Asset 모델과 1:1 관계를 가집니다.
    """
    __tablename__ = 'pc_asset_details'
    id = db.Column(db.Integer, primary_key=True)
    asset_id = db.Column(db.Integer, db.ForeignKey('assets.id'), nullable=False, unique=True)
    cpu_type = db.Column(db.String(100), comment='CPU 모델명')
    cpu_cores = db.Column(db.Integer, comment='CPU 코어 수')
    cpu_speed_ghz = db.Column(db.Float, comment='CPU 속도 (GHz)')
    ram_type = db.Column(db.String(50), comment='RAM 종류 (DDR4, DDR5 등)')
    ram_size_gb = db.Column(db.Integer, comment='RAM 용량 (GB)')
    storage_type = db.Column(db.String(50), comment='저장장치 종류 (SSD, HDD, NVMe)')
    storage_size_gb = db.Column(db.Integer, comment='저장장치 용량 (GB)')
    os_name = db.Column(db.String(100), comment='운영체제 이름')
    os_version = db.Column(db.String(50), comment='운영체제 버전')
    graphics_card = db.Column(db.String(100), comment='그래픽카드 모델명')
    mac_address = db.Column(db.String(17), comment='유선 MAC 주소')
    wifi_mac_address = db.Column(db.String(17), comment='무선 MAC 주소')
    
    asset = db.relationship('Asset', backref=db.backref('pc_details', uselist=False))

    def __repr__(self):
        return f'<PCAssetDetails for Asset ID: {self.asset_id}>'

class IPAddress(db.Model):
    """IP 주소 관리 모델
    
    네트워크 내 IP 주소 자원을 관리하고, 특정 자산에 할당합니다.
    """
    __tablename__ = 'ip_addresses'
    id = db.Column(db.Integer, primary_key=True)
    ip_address = db.Column(db.String(45), nullable=False, unique=True, comment='IP 주소 (IPv4 or IPv6)')
    status = db.Column(db.String(20), nullable=False, default='Available', comment='상태 (Available, Assigned, Reserved)')
    assigned_asset_id = db.Column(db.Integer, db.ForeignKey('assets.id'), nullable=True)
    assigned_date = db.Column(db.DateTime, comment='할당일')
    description = db.Column(db.Text, comment='설명 및 메모')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    assigned_asset = db.relationship('Asset', backref='ip_addresses')

    def __repr__(self):
        return f'<IPAddress {self.ip_address} ({self.status})>' 