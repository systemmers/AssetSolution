#!/usr/bin/env python3
"""
CSS 번들링 및 최적화 스크립트
리팩토링된 CSS 파일들을 효율적으로 번들링하고 최적화합니다.
"""

import json
import os
import re
import gzip
import hashlib
from pathlib import Path
from typing import Dict, List, Set
import argparse


class CSSBundler:
    def __init__(self, config_path: str = "css-bundling-config.json"):
        self.config_path = config_path
        self.config = self._load_config()
        self.root_path = Path.cwd()
        
    def _load_config(self) -> Dict:
        """설정 파일 로드"""
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            raise FileNotFoundError(f"설정 파일을 찾을 수 없습니다: {self.config_path}")
            
    def _read_css_file(self, file_path: str) -> str:
        """CSS 파일 읽기"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            print(f"⚠️  파일을 찾을 수 없습니다: {file_path}")
            return ""
            
    def _write_css_file(self, file_path: str, content: str) -> None:
        """CSS 파일 쓰기"""
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
    def _minify_css(self, css_content: str) -> str:
        """CSS 최소화"""
        if not self.config['optimization']['minification']['enabled']:
            return css_content
            
        # 주석 제거
        if self.config['optimization']['minification']['removeComments']:
            css_content = re.sub(r'/\*.*?\*/', '', css_content, flags=re.DOTALL)
            
        # 불필요한 공백 제거
        if self.config['optimization']['minification']['removeWhitespace']:
            css_content = re.sub(r'\s+', ' ', css_content)
            css_content = re.sub(r'\s*([{}:;,>+~])\s*', r'\1', css_content)
            css_content = css_content.strip()
            
        return css_content
        
    def _extract_used_classes(self, content_paths: List[str]) -> Set[str]:
        """HTML/JS 파일에서 사용된 CSS 클래스 추출"""
        used_classes = set()
        
        for path_pattern in content_paths:
            for file_path in Path().glob(path_pattern):
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                    # class="..." 패턴에서 클래스 추출
                    class_matches = re.findall(r'class=["\']([^"\']*)["\']', content)
                    for match in class_matches:
                        classes = match.split()
                        used_classes.update(classes)
                        
                    # classList.add(), className 등에서 클래스 추출
                    js_class_matches = re.findall(r'classList\.add\(["\']([^"\']*)["\']', content)
                    used_classes.update(js_class_matches)
                    
                except (FileNotFoundError, UnicodeDecodeError):
                    continue
                    
        return used_classes
        
    def _purge_unused_css(self, css_content: str, used_classes: Set[str]) -> str:
        """사용되지 않는 CSS 규칙 제거"""
        if not self.config['optimization']['purging']['enabled']:
            return css_content
            
        # 안전 목록에 있는 클래스들 추가
        safelist = set(self.config['optimization']['purging']['safelist'])
        used_classes.update(safelist)
        
        # CSS 규칙을 파싱하고 사용된 것만 유지
        # 간단한 구현 - 실제로는 더 정교한 CSS 파서 필요
        lines = css_content.split('\n')
        purged_lines = []
        
        for line in lines:
            # 클래스 선택자가 포함된 라인 체크
            if re.search(r'\.[a-zA-Z0-9_-]+', line):
                # 사용된 클래스가 포함되어 있는지 확인
                found_used_class = False
                for used_class in used_classes:
                    if f'.{used_class}' in line:
                        found_used_class = True
                        break
                        
                if found_used_class:
                    purged_lines.append(line)
            else:
                # 클래스 선택자가 없는 라인은 유지
                purged_lines.append(line)
                
        return '\n'.join(purged_lines)
        
    def _generate_file_hash(self, content: str) -> str:
        """파일 내용 기반 해시 생성"""
        return hashlib.md5(content.encode('utf-8')).hexdigest()[:8]
        
    def _create_gzip_version(self, file_path: str, content: str) -> None:
        """gzip 압축 버전 생성"""
        if self.config['production']['compression']['gzip']:
            gzip_path = f"{file_path}.gz"
            with gzip.open(gzip_path, 'wt', encoding='utf-8') as f:
                f.write(content)
                
    def bundle_core_css(self) -> str:
        """핵심 CSS 번들링"""
        print("📦 핵심 CSS 번들링 중...")
        
        bundle_content = []
        bundle_config = self.config['bundles']['core']
        
        for file_path in bundle_config['files']:
            if os.path.exists(file_path):
                content = self._read_css_file(file_path)
                if content:
                    bundle_content.append(f"/* {file_path} */")
                    bundle_content.append(content)
                    bundle_content.append("")
                    
        combined_css = '\n'.join(bundle_content)
        
        # 최적화 적용
        if self.config['optimization']['purging']['enabled']:
            used_classes = self._extract_used_classes(
                self.config['optimization']['purging']['contentPaths']
            )
            combined_css = self._purge_unused_css(combined_css, used_classes)
            
        minified_css = self._minify_css(combined_css)
        
        # 해시 기반 파일명 생성 (프로덕션)
        output_path = bundle_config['output']
        if self.config['production']['caching']['hashFilenames']:
            file_hash = self._generate_file_hash(minified_css)
            output_path = output_path.replace('.min.css', f'.{file_hash}.min.css')
            
        self._write_css_file(output_path, minified_css)
        self._create_gzip_version(output_path, minified_css)
        
        print(f"✅ 핵심 CSS 번들 생성: {output_path}")
        return output_path
        
    def bundle_components_css(self) -> str:
        """컴포넌트 CSS 번들링"""
        print("🧩 컴포넌트 CSS 번들링 중...")
        
        bundle_content = []
        bundle_config = self.config['bundles']['components']
        
        for file_path in bundle_config['files']:
            if os.path.exists(file_path):
                content = self._read_css_file(file_path)
                if content:
                    bundle_content.append(f"/* {file_path} */")
                    bundle_content.append(content)
                    bundle_content.append("")
                    
        combined_css = '\n'.join(bundle_content)
        minified_css = self._minify_css(combined_css)
        
        output_path = bundle_config['output']
        if self.config['production']['caching']['hashFilenames']:
            file_hash = self._generate_file_hash(minified_css)
            output_path = output_path.replace('.min.css', f'.{file_hash}.min.css')
            
        self._write_css_file(output_path, minified_css)
        self._create_gzip_version(output_path, minified_css)
        
        print(f"✅ 컴포넌트 CSS 번들 생성: {output_path}")
        return output_path
        
    def bundle_templates_css(self) -> str:
        """템플릿 CSS 번들링"""
        print("📄 템플릿 CSS 번들링 중...")
        
        bundle_content = []
        bundle_config = self.config['bundles']['templates']
        
        for file_path in bundle_config['files']:
            if os.path.exists(file_path):
                content = self._read_css_file(file_path)
                if content:
                    bundle_content.append(f"/* {file_path} */")
                    bundle_content.append(content)
                    bundle_content.append("")
                    
        combined_css = '\n'.join(bundle_content)
        minified_css = self._minify_css(combined_css)
        
        output_path = bundle_config['output']
        if self.config['production']['caching']['hashFilenames']:
            file_hash = self._generate_file_hash(minified_css)
            output_path = output_path.replace('.min.css', f'.{file_hash}.min.css')
            
        self._write_css_file(output_path, minified_css)
        self._create_gzip_version(output_path, minified_css)
        
        print(f"✅ 템플릿 CSS 번들 생성: {output_path}")
        return output_path
        
    def bundle_page_css(self) -> Dict[str, str]:
        """페이지별 CSS 번들링"""
        print("📱 페이지별 CSS 번들링 중...")
        
        bundled_pages = {}
        page_bundles = self.config['bundles']['pages']['bundles']
        
        for page_name, bundle_config in page_bundles.items():
            bundle_content = []
            
            for file_path in bundle_config['files']:
                if os.path.exists(file_path):
                    content = self._read_css_file(file_path)
                    if content:
                        bundle_content.append(f"/* {file_path} */")
                        bundle_content.append(content)
                        bundle_content.append("")
                        
            if bundle_content:
                combined_css = '\n'.join(bundle_content)
                minified_css = self._minify_css(combined_css)
                
                output_path = bundle_config['output']
                if self.config['production']['caching']['hashFilenames']:
                    file_hash = self._generate_file_hash(minified_css)
                    output_path = output_path.replace('.min.css', f'.{file_hash}.min.css')
                    
                self._write_css_file(output_path, minified_css)
                self._create_gzip_version(output_path, minified_css)
                
                bundled_pages[page_name] = output_path
                print(f"✅ {page_name} 페이지 CSS 번들 생성: {output_path}")
                
        return bundled_pages
        
    def generate_manifest(self, bundled_files: Dict[str, str]) -> None:
        """번들 매니페스트 파일 생성"""
        print("📋 매니페스트 파일 생성 중...")
        
        manifest = {
            "version": "1.0.0",
            "timestamp": "2024-01-01T00:00:00Z",
            "bundles": bundled_files,
            "config": {
                "optimization": self.config['optimization'],
                "production": self.config['production']
            }
        }
        
        manifest_path = "app/static/css/dist/manifest.json"
        os.makedirs(os.path.dirname(manifest_path), exist_ok=True)
        
        with open(manifest_path, 'w', encoding='utf-8') as f:
            json.dump(manifest, f, indent=2, ensure_ascii=False)
            
        print(f"✅ 매니페스트 파일 생성: {manifest_path}")
        
    def analyze_css_usage(self) -> Dict[str, any]:
        """CSS 사용량 분석"""
        print("📊 CSS 사용량 분석 중...")
        
        total_original_size = 0
        total_bundled_size = 0
        
        # 원본 파일들 크기 계산
        all_files = []
        for bundle_config in self.config['bundles'].values():
            if 'files' in bundle_config:
                all_files.extend(bundle_config['files'])
            elif 'bundles' in bundle_config:
                for sub_bundle in bundle_config['bundles'].values():
                    all_files.extend(sub_bundle['files'])
                    
        for file_path in all_files:
            if os.path.exists(file_path):
                total_original_size += os.path.getsize(file_path)
                
        # 번들 파일들 크기 계산
        dist_dir = Path("app/static/css/dist")
        if dist_dir.exists():
            for bundle_file in dist_dir.glob("**/*.min.css"):
                total_bundled_size += bundle_file.stat().st_size
                
        compression_ratio = ((total_original_size - total_bundled_size) / total_original_size * 100) if total_original_size > 0 else 0
        
        analysis = {
            "original_size": total_original_size,
            "bundled_size": total_bundled_size,
            "compression_ratio": f"{compression_ratio:.1f}%",
            "size_reduction": total_original_size - total_bundled_size
        }
        
        print(f"📈 원본 크기: {total_original_size:,} bytes")
        print(f"📉 번들 크기: {total_bundled_size:,} bytes")
        print(f"🗜️  압축율: {compression_ratio:.1f}%")
        
        return analysis
        
    def run_bundling(self) -> None:
        """전체 번들링 프로세스 실행"""
        print("🚀 CSS 번들링 시작...")
        print("=" * 50)
        
        bundled_files = {}
        
        # 순서대로 번들링 실행
        bundled_files['core'] = self.bundle_core_css()
        bundled_files['components'] = self.bundle_components_css()
        bundled_files['templates'] = self.bundle_templates_css()
        
        page_bundles = self.bundle_page_css()
        bundled_files.update(page_bundles)
        
        # 매니페스트 생성
        self.generate_manifest(bundled_files)
        
        # 분석 리포트
        analysis = self.analyze_css_usage()
        
        print("=" * 50)
        print("✨ CSS 번들링 완료!")
        print(f"📁 총 {len(bundled_files)}개 번들 생성")
        
        return bundled_files


def main():
    parser = argparse.ArgumentParser(description='CSS 번들링 및 최적화')
    parser.add_argument('--config', default='css-bundling-config.json', 
                       help='설정 파일 경로 (기본값: css-bundling-config.json)')
    parser.add_argument('--analyze-only', action='store_true',
                       help='분석만 실행 (번들링 안함)')
    
    args = parser.parse_args()
    
    try:
        bundler = CSSBundler(args.config)
        
        if args.analyze_only:
            bundler.analyze_css_usage()
        else:
            bundler.run_bundling()
            
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        return 1
        
    return 0


if __name__ == "__main__":
    exit(main())