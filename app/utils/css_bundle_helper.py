"""
CSS Bundle Helper
번들링된 CSS 파일들을 효율적으로 로드하는 헬퍼 함수들
"""

import json
import os
from typing import List, Optional, Dict
from flask import current_app, url_for


class CSSBundleManager:
    def __init__(self, manifest_path: str = "app/static/css/dist/manifest.json"):
        self.manifest_path = manifest_path
        self._manifest = None
        self._cache_enabled = True
        
    def load_manifest(self) -> Dict:
        """매니페스트 파일 로드"""
        if self._manifest is not None and self._cache_enabled:
            return self._manifest
            
        try:
            with open(self.manifest_path, 'r', encoding='utf-8') as f:
                self._manifest = json.load(f)
                return self._manifest
        except FileNotFoundError:
            current_app.logger.warning(f"CSS 매니페스트 파일을 찾을 수 없습니다: {self.manifest_path}")
            return {}
        except json.JSONDecodeError:
            current_app.logger.error(f"CSS 매니페스트 파일이 유효하지 않습니다: {self.manifest_path}")
            return {}
    
    def get_bundle_url(self, bundle_name: str) -> Optional[str]:
        """번들 파일의 URL 반환"""
        manifest = self.load_manifest()
        bundles = manifest.get('bundles', {})
        
        bundle_path = bundles.get(bundle_name)
        if not bundle_path:
            current_app.logger.warning(f"CSS 번들을 찾을 수 없습니다: {bundle_name}")
            return None
            
        # static 폴더 경로를 URL로 변환
        static_path = bundle_path.replace('app/static/', '')
        return url_for('static', filename=static_path)
    
    def get_core_bundles(self) -> List[str]:
        """핵심 CSS 번들들 반환 (모든 페이지에서 필요)"""
        core_bundles = ['core', 'components', 'templates']
        urls = []
        
        for bundle_name in core_bundles:
            url = self.get_bundle_url(bundle_name)
            if url:
                urls.append(url)
                
        return urls
    
    def get_page_bundle(self, page_name: str) -> Optional[str]:
        """페이지별 CSS 번들 반환"""
        return self.get_bundle_url(page_name)
    
    def get_all_bundles_for_page(self, page_name: str) -> List[str]:
        """특정 페이지에 필요한 모든 CSS 번들 반환"""
        urls = self.get_core_bundles()
        
        page_url = self.get_page_bundle(page_name)
        if page_url:
            urls.append(page_url)
            
        return urls
    
    def get_bundle_info(self) -> Dict:
        """번들링 정보 반환"""
        manifest = self.load_manifest()
        return {
            'version': manifest.get('version', 'unknown'),
            'timestamp': manifest.get('timestamp', 'unknown'),
            'bundle_count': len(manifest.get('bundles', {})),
            'optimization': manifest.get('config', {}).get('optimization', {})
        }
    
    def is_development_mode(self) -> bool:
        """개발 모드 확인"""
        return current_app.debug or current_app.config.get('ENV') == 'development'


# 글로벌 인스턴스
css_manager = CSSBundleManager()


def get_css_bundles_for_page(page_name: str) -> List[str]:
    """페이지별 CSS 번들 로드 함수 (템플릿에서 사용)"""
    return css_manager.get_all_bundles_for_page(page_name)


def get_core_css_bundles() -> List[str]:
    """핵심 CSS 번들 로드 함수 (템플릿에서 사용)"""
    return css_manager.get_core_bundles()


def get_bundle_version() -> str:
    """번들 버전 정보 반환"""
    info = css_manager.get_bundle_info()
    return info.get('version', '1.0.0')


def render_css_links(page_name: str = None, preload_next_page: str = None) -> str:
    """CSS 링크 태그들을 HTML로 렌더링"""
    html_parts = []
    
    # 핵심 번들들 (critical CSS로 인라인화 가능)
    core_bundles = css_manager.get_core_bundles()
    for url in core_bundles:
        html_parts.append(f'<link rel="stylesheet" href="{url}" />')
    
    # 페이지별 번들
    if page_name:
        page_url = css_manager.get_page_bundle(page_name)
        if page_url:
            html_parts.append(f'<link rel="stylesheet" href="{page_url}" />')
    
    # 다음 페이지 프리로드 (옵션)
    if preload_next_page:
        next_url = css_manager.get_page_bundle(preload_next_page)
        if next_url:
            html_parts.append(f'<link rel="preload" href="{next_url}" as="style" onload="this.onload=null;this.rel=\'stylesheet\'" />')
            html_parts.append(f'<noscript><link rel="stylesheet" href="{next_url}" /></noscript>')
    
    return '\n'.join(html_parts)


def get_critical_css_inline(page_name: str) -> str:
    """Critical CSS 인라인 반환 (향후 구현)"""
    # Critical CSS 추출 로직은 별도 구현 필요
    # 현재는 빈 문자열 반환
    return ""


def register_css_bundle_helpers(app):
    """Flask 애플리케이션에 CSS 번들 헬퍼 등록"""
    
    @app.template_global()
    def css_bundles(page_name: str = None):
        """템플릿에서 사용할 CSS 번들 함수"""
        return get_css_bundles_for_page(page_name) if page_name else get_core_css_bundles()
    
    @app.template_global()
    def css_links(page_name: str = None, preload_next: str = None):
        """템플릿에서 사용할 CSS 링크 렌더링 함수"""
        return render_css_links(page_name, preload_next)
    
    @app.template_global()
    def bundle_version():
        """템플릿에서 사용할 번들 버전 함수"""
        return get_bundle_version()
    
    @app.context_processor
    def inject_css_helpers():
        """모든 템플릿에서 사용할 수 있도록 컨텍스트 프로세서 등록"""
        return {
            'css_manager': css_manager,
            'CSS_BUNDLES': get_core_css_bundles,
            'CSS_VERSION': get_bundle_version(),
            'IS_DEV': css_manager.is_development_mode()
        }