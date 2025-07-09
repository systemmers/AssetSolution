"""
Document Management Service
문서 관리 및 목록 조회를 담당하는 서비스

Classes:
    - DocumentManagementService: 문서 관리 서비스
"""
import os
from datetime import datetime
from typing import List, Dict, Any


class DocumentManagementService:
    """문서 관리 및 목록 조회를 담당하는 서비스 클래스"""
    
    def __init__(self):
        """서비스 초기화"""
        # PDF 저장 디렉터리 설정
        self.pdf_output_dir = os.path.join(os.getcwd(), 'generated_documents')
        os.makedirs(self.pdf_output_dir, exist_ok=True)
    
    def get_generated_documents_list(self) -> List[Dict[str, Any]]:
        """
        생성된 문서 목록을 반환합니다.
        
        Returns:
            문서 목록
        """
        try:
            files = []
            if os.path.exists(self.pdf_output_dir):
                for filename in os.listdir(self.pdf_output_dir):
                    if filename.endswith('.pdf'):
                        filepath = os.path.join(self.pdf_output_dir, filename)
                        stat = os.stat(filepath)
                        files.append({
                            'filename': filename,
                            'filepath': filepath,
                            'size': stat.st_size,
                            'size_mb': round(stat.st_size / (1024 * 1024), 2),
                            'created_at': datetime.fromtimestamp(stat.st_ctime).strftime('%Y-%m-%d %H:%M:%S'),
                            'modified_at': datetime.fromtimestamp(stat.st_mtime).strftime('%Y-%m-%d %H:%M:%S'),
                            'file_type': self._get_document_type_from_filename(filename)
                        })
            return sorted(files, key=lambda x: x['created_at'], reverse=True)
        except Exception as e:
            print(f"문서 목록 조회 중 오류 발생: {str(e)}")
            return []
    
    def get_document_info(self, filename: str) -> Dict[str, Any]:
        """
        특정 문서의 상세 정보를 반환합니다.
        
        Args:
            filename: 파일명
            
        Returns:
            문서 상세 정보
        """
        try:
            filepath = os.path.join(self.pdf_output_dir, filename)
            if os.path.exists(filepath):
                stat = os.stat(filepath)
                return {
                    'filename': filename,
                    'filepath': filepath,
                    'size': stat.st_size,
                    'size_mb': round(stat.st_size / (1024 * 1024), 2),
                    'created_at': datetime.fromtimestamp(stat.st_ctime).strftime('%Y-%m-%d %H:%M:%S'),
                    'modified_at': datetime.fromtimestamp(stat.st_mtime).strftime('%Y-%m-%d %H:%M:%S'),
                    'file_type': self._get_document_type_from_filename(filename),
                    'exists': True
                }
            else:
                return {'exists': False, 'filename': filename}
        except Exception as e:
            print(f"문서 정보 조회 중 오류 발생: {str(e)}")
            return {'exists': False, 'filename': filename, 'error': str(e)}
    
    def delete_document(self, filename: str) -> bool:
        """
        문서를 삭제합니다.
        
        Args:
            filename: 삭제할 파일명
            
        Returns:
            삭제 성공 여부
        """
        try:
            filepath = os.path.join(self.pdf_output_dir, filename)
            if os.path.exists(filepath):
                os.remove(filepath)
                return True
            return False
        except Exception as e:
            print(f"문서 삭제 중 오류 발생: {str(e)}")
            return False
    
    def clean_old_documents(self, days_old: int = 30) -> int:
        """
        지정된 일수보다 오래된 문서들을 삭제합니다.
        
        Args:
            days_old: 삭제할 문서의 기준 일수 (기본값: 30일)
            
        Returns:
            삭제된 문서 수
        """
        try:
            deleted_count = 0
            current_time = datetime.now()
            
            if os.path.exists(self.pdf_output_dir):
                for filename in os.listdir(self.pdf_output_dir):
                    if filename.endswith('.pdf'):
                        filepath = os.path.join(self.pdf_output_dir, filename)
                        file_time = datetime.fromtimestamp(os.path.getctime(filepath))
                        days_diff = (current_time - file_time).days
                        
                        if days_diff > days_old:
                            os.remove(filepath)
                            deleted_count += 1
                            
            return deleted_count
        except Exception as e:
            print(f"오래된 문서 정리 중 오류 발생: {str(e)}")
            return 0
    
    def get_documents_by_type(self, document_type: str) -> List[Dict[str, Any]]:
        """
        문서 유형별 목록을 반환합니다.
        
        Args:
            document_type: 문서 유형 ('purchase_order', 'quotation', 'other')
            
        Returns:
            해당 유형의 문서 목록
        """
        all_documents = self.get_generated_documents_list()
        return [doc for doc in all_documents if doc['file_type'] == document_type]
    
    def get_document_statistics(self) -> Dict[str, Any]:
        """
        문서 관리 통계 정보를 반환합니다.
        
        Returns:
            문서 통계 정보
        """
        try:
            documents = self.get_generated_documents_list()
            
            total_count = len(documents)
            total_size = sum(doc['size'] for doc in documents)
            total_size_mb = round(total_size / (1024 * 1024), 2)
            
            # 문서 유형별 통계
            type_stats = {}
            for doc in documents:
                doc_type = doc['file_type']
                if doc_type not in type_stats:
                    type_stats[doc_type] = {'count': 0, 'size': 0}
                type_stats[doc_type]['count'] += 1
                type_stats[doc_type]['size'] += doc['size']
            
            # 날짜별 통계 (최근 30일)
            recent_docs = []
            current_time = datetime.now()
            for doc in documents:
                doc_time = datetime.strptime(doc['created_at'], '%Y-%m-%d %H:%M:%S')
                days_diff = (current_time - doc_time).days
                if days_diff <= 30:
                    recent_docs.append(doc)
            
            return {
                'total_documents': total_count,
                'total_size_mb': total_size_mb,
                'recent_documents': len(recent_docs),
                'type_statistics': type_stats,
                'oldest_document': documents[-1] if documents else None,
                'newest_document': documents[0] if documents else None
            }
            
        except Exception as e:
            print(f"문서 통계 조회 중 오류 발생: {str(e)}")
            return {
                'total_documents': 0,
                'total_size_mb': 0,
                'recent_documents': 0,
                'type_statistics': {},
                'oldest_document': None,
                'newest_document': None
            }
    
    def search_documents(self, search_term: str) -> List[Dict[str, Any]]:
        """
        문서를 검색합니다.
        
        Args:
            search_term: 검색어
            
        Returns:
            검색 결과 문서 목록
        """
        all_documents = self.get_generated_documents_list()
        search_term_lower = search_term.lower()
        
        return [
            doc for doc in all_documents 
            if search_term_lower in doc['filename'].lower()
        ]
    
    def backup_documents(self, backup_dir: str) -> bool:
        """
        문서들을 백업 디렉터리로 복사합니다.
        
        Args:
            backup_dir: 백업 디렉터리 경로
            
        Returns:
            백업 성공 여부
        """
        try:
            import shutil
            
            # 백업 디렉터리 생성
            os.makedirs(backup_dir, exist_ok=True)
            
            # 모든 PDF 파일 복사
            if os.path.exists(self.pdf_output_dir):
                for filename in os.listdir(self.pdf_output_dir):
                    if filename.endswith('.pdf'):
                        src = os.path.join(self.pdf_output_dir, filename)
                        dst = os.path.join(backup_dir, filename)
                        shutil.copy2(src, dst)
            
            return True
        except Exception as e:
            print(f"문서 백업 중 오류 발생: {str(e)}")
            return False
    
    def _get_document_type_from_filename(self, filename: str) -> str:
        """
        파일명으로부터 문서 유형을 추정합니다.
        
        Args:
            filename: 파일명
            
        Returns:
            문서 유형
        """
        filename_lower = filename.lower()
        
        if 'purchase_order' in filename_lower or 'po_' in filename_lower:
            return 'purchase_order'
        elif 'quotation' in filename_lower or 'quote_' in filename_lower:
            return 'quotation'
        elif 'invoice' in filename_lower:
            return 'invoice'
        elif 'contract' in filename_lower:
            return 'contract'
        else:
            return 'other'
    
    def get_output_directory(self) -> str:
        """문서 출력 디렉터리 경로 반환"""
        return self.pdf_output_dir
    
    def set_output_directory(self, new_dir: str) -> bool:
        """
        문서 출력 디렉터리 변경
        
        Args:
            new_dir: 새로운 디렉터리 경로
            
        Returns:
            변경 성공 여부
        """
        try:
            os.makedirs(new_dir, exist_ok=True)
            self.pdf_output_dir = new_dir
            return True
        except Exception as e:
            print(f"출력 디렉터리 변경 중 오류 발생: {str(e)}")
            return False
    
    def validate_filename(self, filename: str) -> bool:
        """
        파일명 유효성 검증
        
        Args:
            filename: 검증할 파일명
            
        Returns:
            유효성 검증 결과
        """
        # 금지된 문자 확인
        forbidden_chars = ['<', '>', ':', '"', '|', '?', '*']
        for char in forbidden_chars:
            if char in filename:
                return False
        
        # 파일명 길이 확인 (Windows 기준 255자)
        if len(filename) > 255:
            return False
        
        # 확장자 확인
        if not filename.lower().endswith('.pdf'):
            return False
        
        return True 