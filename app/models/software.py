"""
소프트웨어 모델
Software model for asset management system

# 소프트웨어 모델
# 소프트웨어 라이선스
# 소프트웨어 버전
# 소프트웨어 카테고리
# 소프트웨어 개발사
# 소프트웨어 설명
# 소프트웨어 인기도

"""

class Software:
    """소프트웨어 정보 모델"""
    
    def __init__(self, id, name, version=None, category=None, license_type=None, 
                 developer=None, description=None, is_popular=False):
        self.id = id
        self.name = name
        self.version = version
        self.category = category
        self.license_type = license_type
        self.developer = developer
        self.description = description
        self.is_popular = is_popular

# 임시 소프트웨어 데이터베이스 (실제 DB 구현 전까지 사용)
SOFTWARE_DATABASE = [
    # 운영체제
    Software(1, "Windows 11 Pro", "23H2", "operating_system", "commercial", "Microsoft", "최신 윈도우 운영체제", True),
    Software(2, "Windows 10 Pro", "22H2", "operating_system", "commercial", "Microsoft", "윈도우 10 운영체제", True),
    Software(3, "Ubuntu Desktop", "22.04 LTS", "operating_system", "free", "Canonical", "리눅스 데스크톱 OS", False),
    Software(4, "macOS Ventura", "13.0", "operating_system", "commercial", "Apple", "맥 운영체제", False),
    
    # 오피스 제품군
    Software(5, "Microsoft Office 365", "2024", "office_suite", "subscription", "Microsoft", "클라우드 기반 오피스 제품군", True),
    Software(6, "Microsoft Office 2021", "16.0", "office_suite", "perpetual", "Microsoft", "영구 라이선스 오피스", True),
    Software(7, "LibreOffice", "7.6", "office_suite", "free", "The Document Foundation", "무료 오피스 제품군", False),
    Software(8, "Google Workspace", "2024", "office_suite", "subscription", "Google", "구글 클라우드 오피스", False),
    
    # 개발 도구
    Software(9, "Visual Studio Code", "1.85", "development_tool", "free", "Microsoft", "코드 에디터", True),
    Software(10, "Visual Studio 2022", "17.8", "development_tool", "commercial", "Microsoft", "통합 개발 환경", True),
    Software(11, "IntelliJ IDEA", "2023.3", "development_tool", "commercial", "JetBrains", "Java IDE", False),
    Software(12, "PyCharm", "2023.3", "development_tool", "commercial", "JetBrains", "Python IDE", False),
    Software(13, "Eclipse IDE", "2023-12", "development_tool", "free", "Eclipse Foundation", "무료 Java IDE", False),
    Software(14, "Sublime Text", "4.0", "development_tool", "commercial", "Sublime HQ", "텍스트 에디터", False),
    Software(15, "Git", "2.43", "development_tool", "free", "Git Community", "버전 관리 시스템", True),
    Software(16, "Docker Desktop", "4.26", "development_tool", "free", "Docker Inc.", "컨테이너 플랫폼", False),
    
    # 디자인 소프트웨어
    Software(17, "Adobe Photoshop", "2024", "design_software", "subscription", "Adobe", "이미지 편집", True),
    Software(18, "Adobe Illustrator", "2024", "design_software", "subscription", "Adobe", "벡터 그래픽", True),
    Software(19, "Adobe InDesign", "2024", "design_software", "subscription", "Adobe", "출판 디자인", False),
    Software(20, "Figma", "2024", "design_software", "freemium", "Figma Inc.", "UI/UX 디자인", True),
    Software(21, "Sketch", "99.0", "design_software", "commercial", "Sketch B.V.", "맥용 UI 디자인", False),
    Software(22, "GIMP", "2.10", "design_software", "free", "GIMP Team", "무료 이미지 편집", False),
    Software(23, "Canva", "2024", "design_software", "freemium", "Canva", "온라인 디자인 도구", False),
    
    # 보안 소프트웨어
    Software(24, "Windows Defender", "2024", "security_software", "free", "Microsoft", "윈도우 기본 백신", True),
    Software(25, "Norton 360", "2024", "security_software", "subscription", "NortonLifeLock", "종합 보안 제품군", True),
    Software(26, "Kaspersky Internet Security", "2024", "security_software", "subscription", "Kaspersky", "인터넷 보안", False),
    Software(27, "Malwarebytes", "4.6", "security_software", "freemium", "Malwarebytes", "맬웨어 방지", False),
    Software(28, "Bitdefender Total Security", "2024", "security_software", "subscription", "Bitdefender", "토탈 시큐리티", False),
    
    # 데이터베이스
    Software(29, "MySQL", "8.0", "database", "free", "Oracle", "오픈소스 데이터베이스", True),
    Software(30, "PostgreSQL", "16.0", "database", "free", "PostgreSQL Global Development Group", "고급 오픈소스 DB", False),
    Software(31, "Microsoft SQL Server", "2022", "database", "commercial", "Microsoft", "엔터프라이즈 데이터베이스", True),
    Software(32, "Oracle Database", "23c", "database", "commercial", "Oracle", "엔터프라이즈 DB", False),
    Software(33, "MongoDB", "7.0", "database", "freemium", "MongoDB Inc.", "NoSQL 데이터베이스", False),
    
    # 유틸리티
    Software(34, "7-Zip", "23.01", "utility", "free", "Igor Pavlov", "파일 압축 도구", True),
    Software(35, "WinRAR", "6.24", "utility", "commercial", "win.rar GmbH", "압축 프로그램", True),
    Software(36, "CCleaner", "6.19", "utility", "freemium", "Piriform", "시스템 정리 도구", False),
    Software(37, "TeamViewer", "15.47", "utility", "freemium", "TeamViewer", "원격 접속 도구", True),
    Software(38, "VLC Media Player", "3.0.18", "utility", "free", "VideoLAN", "미디어 플레이어", True),
    Software(39, "Chrome", "120.0", "utility", "free", "Google", "웹 브라우저", True),
    Software(40, "Firefox", "121.0", "utility", "free", "Mozilla", "웹 브라우저", False),
    
    # 게임 (예시)
    Software(41, "Steam", "2024", "game", "free", "Valve", "게임 플랫폼", False),
    Software(42, "Epic Games Launcher", "2024", "game", "free", "Epic Games", "게임 런처", False),
]

class SoftwareService:
    """소프트웨어 서비스 클래스"""
    
    @staticmethod
    def search_software(query, category=None, limit=10):
        """
        소프트웨어 검색
        
        Args:
            query (str): 검색어
            category (str): 카테고리 필터
            limit (int): 결과 제한 수
            
        Returns:
            list: 검색 결과 소프트웨어 목록
        """
        if not query or len(query.strip()) < 2:
            return []
        
        query = query.lower().strip()
        results = []
        
        for software in SOFTWARE_DATABASE:
            # 카테고리 필터 적용
            if category and software.category != category:
                continue
            
            # 검색어 매칭 (이름, 개발사, 설명)
            search_fields = [
                software.name.lower(),
                software.developer.lower() if software.developer else "",
                software.description.lower() if software.description else "",
                software.version.lower() if software.version else ""
            ]
            
            if any(query in field for field in search_fields):
                results.append({
                    'id': software.id,
                    'name': software.name,
                    'version': software.version,
                    'category': software.category,
                    'license_type': software.license_type,
                    'developer': software.developer,
                    'description': software.description,
                    'is_popular': software.is_popular
                })
        
        # 인기 소프트웨어 우선 정렬, 그 다음 이름순
        results.sort(key=lambda x: (not x['is_popular'], x['name']))
        
        return results[:limit]
    
    @staticmethod
    def get_popular_software(category=None, limit=5):
        """
        인기 소프트웨어 목록 반환
        
        Args:
            category (str): 카테고리 필터
            limit (int): 결과 제한 수
            
        Returns:
            list: 인기 소프트웨어 목록
        """
        results = []
        
        for software in SOFTWARE_DATABASE:
            if not software.is_popular:
                continue
                
            if category and software.category != category:
                continue
            
            results.append({
                'id': software.id,
                'name': software.name,
                'version': software.version,
                'category': software.category,
                'license_type': software.license_type,
                'developer': software.developer,
                'description': software.description,
                'is_popular': software.is_popular
            })
        
        results.sort(key=lambda x: x['name'])
        return results[:limit]
    
    @staticmethod
    def get_software_categories():
        """
        소프트웨어 카테고리 목록 반환
        
        Returns:
            list: 카테고리 목록
        """
        categories = set()
        for software in SOFTWARE_DATABASE:
            if software.category:
                categories.add(software.category)
        
        category_names = {
            'operating_system': '운영체제',
            'office_suite': '오피스 제품군',
            'development_tool': '개발 도구',
            'design_software': '디자인 소프트웨어',
            'security_software': '보안 소프트웨어',
            'database': '데이터베이스',
            'utility': '유틸리티',
            'game': '게임'
        }
        
        return [
            {'id': cat, 'name': category_names.get(cat, cat)}
            for cat in sorted(categories)
        ] 