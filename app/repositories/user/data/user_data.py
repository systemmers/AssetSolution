"""
# 코드 인덱스:
# 1. 사용자 데이터 클래스 (UserData)
# 2. 사용자 샘플 데이터 (SAMPLE_USERS)
# 3. 역할 샘플 데이터 (SAMPLE_ROLES)
# 4. 부서 샘플 데이터 (SAMPLE_DEPARTMENTS)
# 5. 데이터 접근 메서드들

User Data 클래스
사용자, 역할, 부서 관련 데이터를 관리합니다.
"""

class UserData:
    """
    사용자 관련 데이터를 관리하는 싱글톤 클래스
    """
    
    def __init__(self):
        """사용자 데이터 초기화"""
        self._sample_users = [
            {
                'id': 1,
                'username': 'admin',
                'name': '관리자',
                'email': 'admin@example.com',
                'password_hash': 'password',  # 실제로는 해시화된 값이어야 합니다
                'department_id': 1,
                'role_id': 1,  # 관리자 역할
                'is_active': True,
                'phone': '010-1234-5678',
                'position': '총괄 관리자',
                'hire_date': '2024-01-01',
                'created_at': '2024-01-01',
                'updated_at': '2024-01-01'
            },
            {
                'id': 2,
                'username': 'user1',
                'name': '홍길동',
                'email': 'user1@example.com',
                'password_hash': 'password',
                'department_id': 1,
                'role_id': 2,  # 일반 사용자
                'is_active': True,
                'phone': '010-2345-6789',
                'position': '일반 직원',
                'hire_date': '2024-02-01',
                'created_at': '2024-02-01',
                'updated_at': '2024-02-01'
            },
            {
                'id': 3,
                'username': 'user2',
                'name': '김철수',
                'email': 'user2@example.com',
                'password_hash': 'password',
                'department_id': 2,
                'role_id': 2,
                'is_active': True,
                'phone': '010-3456-7890',
                'position': '일반 직원',
                'hire_date': '2024-03-01',
                'created_at': '2024-03-01',
                'updated_at': '2024-03-01'
            }
        ]
        
        self._sample_roles = [
            {"id": 1, "name": "관리자", "description": "시스템 관리자 권한"},
            {"id": 2, "name": "일반사용자", "description": "일반 사용자 권한"},
            {"id": 3, "name": "조회전용", "description": "읽기 전용 권한"}
        ]
        
        self._sample_departments = [
            {"id": 1, "code": "DEV", "name": "개발팀", "description": "소프트웨어 개발", "parent_id": None, "is_active": True},
            {"id": 2, "code": "HR", "name": "인사팀", "description": "인사 관리", "parent_id": None, "is_active": True},
            {"id": 3, "code": "MKT", "name": "마케팅팀", "description": "제품 마케팅", "parent_id": None, "is_active": True},
        ]
    
    def get_all_users(self):
        """모든 사용자 데이터 반환"""
        return self._sample_users.copy()
    
    def get_user_by_id(self, user_id):
        """ID로 사용자 검색"""
        return next((user for user in self._sample_users if user['id'] == user_id), None)
    
    def get_user_by_username(self, username):
        """사용자명으로 사용자 검색"""
        return next((user for user in self._sample_users if user['username'] == username), None)
    
    def get_user_by_email(self, email):
        """이메일로 사용자 검색"""
        return next((user for user in self._sample_users if user['email'] == email), None)
    
    def get_all_roles(self):
        """모든 역할 데이터 반환"""
        return self._sample_roles.copy()
    
    def get_role_by_id(self, role_id):
        """ID로 역할 검색"""
        return next((role for role in self._sample_roles if role['id'] == role_id), None)
    
    def get_all_departments(self):
        """모든 부서 데이터 반환"""
        return self._sample_departments.copy()
    
    def get_department_by_id(self, dept_id):
        """ID로 부서 검색"""
        return next((dept for dept in self._sample_departments if dept['id'] == dept_id), None)
    
    def get_enhanced_user_data(self):
        """부서 및 역할 정보가 포함된 확장 사용자 데이터 반환"""
        enhanced_data = []
        for user in self._sample_users:
            enhanced_user = user.copy()
            
            # 부서 정보 추가
            department = self.get_department_by_id(user['department_id'])
            enhanced_user['department'] = department
            
            # 역할 정보 추가
            role = self.get_role_by_id(user['role_id'])
            enhanced_user['role'] = role
            
            enhanced_data.append(enhanced_user)
        
        return enhanced_data
    
    def add_user(self, user_data):
        """새 사용자 추가 (메모리 상에서만)"""
        # 새 ID 생성
        max_id = max([u['id'] for u in self._sample_users]) if self._sample_users else 0
        user_data['id'] = max_id + 1
        
        # 기본값 설정
        user_data.setdefault('is_active', True)
        user_data.setdefault('position', '일반 직원')
        user_data.setdefault('created_at', '2024-12-21')
        user_data.setdefault('updated_at', '2024-12-21')
        
        self._sample_users.append(user_data)
        return user_data
    
    def update_user(self, user_id, update_data):
        """사용자 정보 수정 (메모리 상에서만)"""
        user = self.get_user_by_id(user_id)
        if user:
            user.update(update_data)
            user['updated_at'] = '2024-12-21'
            return user
        return None
    
    def delete_user(self, user_id):
        """사용자 삭제 (메모리 상에서만)"""
        user = self.get_user_by_id(user_id)
        if user:
            self._sample_users.remove(user)
            return True
        return False

# 싱글톤 인스턴스 생성
user_data = UserData() 