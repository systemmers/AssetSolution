"""
라이프사이클 관리 서비스 모듈
자산 라이프사이클 추적 및 분석 비즈니스 로직

Classes:
    - LifecycleService: 라이프사이클 추적, 분석, 통계 등 관련 서비스 로직
"""
from typing import List, Dict, Optional, Any
from datetime import datetime, date


class LifecycleService:
    """
    라이프사이클 관리 서비스 클래스
    Repository와 Controller 사이의 라이프사이클 관련 비즈니스 로직 계층
    """
    
    def __init__(self):
        """Service 초기화 및 Repository 의존성 주입"""
        from ...repositories import operations_repository, asset_repository
        self.operations_repo = operations_repository
        self.asset_repo = asset_repository
    
    def get_lifecycle_tracking_data(self, page: int = 1, per_page: int = 10,
                                  asset_id: int = None, event_type: str = None,
                                  department: str = None, start_date: str = None,
                                  end_date: str = None) -> Dict:
        """
        생명주기 추적 메인 페이지 데이터 조회 (필터링 및 페이지네이션 포함)
        
        Args:
            page: 페이지 번호
            per_page: 페이지당 항목 수
            asset_id: 자산 ID 필터
            event_type: 이벤트 유형 필터
            department: 부서 필터
            start_date: 시작일 필터 (YYYY-MM-DD)
            end_date: 종료일 필터 (YYYY-MM-DD)
            
        Returns:
            생명주기 이벤트 목록과 통계가 포함된 딕셔너리
        """
        try:
            # Repository에서 데이터 조회
            events, current_page, total_pages, total_items = self.operations_repo.get_lifecycle_events_with_pagination(
                page=page,
                per_page=per_page,
                asset_id=asset_id,
                event_type=event_type,
                department=department
            )
            
            # 날짜 필터링이 있는 경우 별도 처리
            if start_date or end_date:
                all_events = self.operations_repo.get_all_lifecycle_events(
                    asset_id=asset_id,
                    event_type=event_type,
                    department=department,
                    start_date=start_date,
                    end_date=end_date
                )
                
                # 페이지네이션 재계산
                total_items = len(all_events)
                total_pages = (total_items + per_page - 1) // per_page if total_items > 0 else 1
                
                if page > total_pages and total_pages > 0:
                    page = total_pages
                
                start_idx = (page - 1) * per_page
                end_idx = min(start_idx + per_page, total_items)
                events = all_events[start_idx:end_idx] if all_events else []
                current_page = page
            
            # 비즈니스 로직: 이벤트 정보 enrichment
            for event in events:
                # 안전한 날짜 처리
                event_date = event.get('event_date')
                if event_date:
                    if hasattr(event_date, 'strftime'):
                        event['event_date_formatted'] = event_date.strftime('%Y-%m-%d')
                        # 이벤트 경과 시간 계산
                        current_date = datetime.utcnow().date()
                        days_ago = (current_date - event_date).days
                        event['days_ago'] = days_ago
                        
                        if days_ago == 0:
                            event['time_ago_text'] = '오늘'
                        elif days_ago == 1:
                            event['time_ago_text'] = '어제'
                        elif days_ago < 30:
                            event['time_ago_text'] = f'{days_ago}일 전'
                        elif days_ago < 365:
                            months_ago = days_ago // 30
                            event['time_ago_text'] = f'{months_ago}개월 전'
                        else:
                            years_ago = days_ago // 365
                            event['time_ago_text'] = f'{years_ago}년 전'
                    elif isinstance(event_date, str):
                        event['event_date_formatted'] = event_date
                    else:
                        event['event_date_formatted'] = str(event_date)
                
                # 생성일시 포맷팅
                created_at = event.get('created_at')
                if created_at and hasattr(created_at, 'strftime'):
                    event['created_at_formatted'] = created_at.strftime('%Y-%m-%d %H:%M')
                
                # 이벤트 유형별 색상 및 아이콘
                event_type_info = self._get_event_type_info(event.get('event_type'))
                event.update(event_type_info)
                
                # 비용 포맷팅
                related_cost = event.get('related_cost', 0)
                if related_cost:
                    event['related_cost_formatted'] = f"{related_cost:,}원"
                else:
                    event['related_cost_formatted'] = "-"
            
            # 통계 정보 조회
            statistics = self.get_lifecycle_statistics()
            
            # 필터 옵션 조회
            event_types = self.operations_repo.get_lifecycle_event_types()
            
            return {
                'lifecycle_events': events,
                'pagination': {
                    'current_page': current_page,
                    'total_pages': total_pages,
                    'total_items': total_items,
                    'per_page': per_page,
                    'has_prev': current_page > 1,
                    'has_next': current_page < total_pages
                },
                'statistics': statistics,
                'filter_options': {
                    'event_types': event_types
                }
            }
            
        except Exception as e:
            print(f"생명주기 추적 데이터 조회 오류: {e}")
            raise
    
    def get_asset_lifecycle_timeline(self, asset_id: int) -> Dict:
        """
        특정 자산의 생명주기 타임라인 조회
        
        Args:
            asset_id: 자산 ID
            
        Returns:
            자산의 생명주기 타임라인 정보
        """
        try:
            events = self.operations_repo.get_lifecycle_events_by_asset(asset_id)
            
            if not events:
                return {
                    'asset_id': asset_id,
                    'timeline_events': [],
                    'summary': {
                        'total_events': 0,
                        'first_event_date': None,
                        'last_event_date': None,
                        'total_cost': 0,
                        'asset_age_days': 0
                    }
                }
            
            # 타임라인 이벤트 처리
            timeline_events = []
            total_cost = 0
            
            for event in events:
                # 안전한 날짜 처리
                event_date = event.get('event_date')
                if event_date and hasattr(event_date, 'strftime'):
                    event['event_date_formatted'] = event_date.strftime('%Y-%m-%d')
                
                # 이벤트 유형 정보 추가
                event_type_info = self._get_event_type_info(event.get('event_type'))
                event.update(event_type_info)
                
                # 비용 누적
                cost = event.get('related_cost', 0)
                total_cost += cost
                event['cumulative_cost'] = total_cost
                
                if cost:
                    event['related_cost_formatted'] = f"{cost:,}원"
                else:
                    event['related_cost_formatted'] = "-"
                
                timeline_events.append(event)
            
            # 요약 정보 계산
            first_event = events[0] if events else None
            last_event = events[-1] if events else None
            
            first_event_date = None
            last_event_date = None
            asset_age_days = 0
            
            if first_event:
                first_date = first_event.get('event_date')
                if first_date and hasattr(first_date, 'strftime'):
                    first_event_date = first_date.strftime('%Y-%m-%d')
                    # 자산 연령 계산
                    current_date = datetime.utcnow().date()
                    asset_age_days = (current_date - first_date).days
            
            if last_event:
                last_date = last_event.get('event_date')
                if last_date and hasattr(last_date, 'strftime'):
                    last_event_date = last_date.strftime('%Y-%m-%d')
            
            # 자산 기본 정보 (첫 번째 이벤트에서 추출)
            asset_info = {
                'asset_id': asset_id,
                'asset_name': first_event.get('asset_name', f'자산 ID {asset_id}'),
                'asset_number': first_event.get('asset_number', 'N/A')
            } if first_event else {
                'asset_id': asset_id,
                'asset_name': f'자산 ID {asset_id}',
                'asset_number': 'N/A'
            }
            
            return {
                'asset_info': asset_info,
                'timeline_events': timeline_events,
                'summary': {
                    'total_events': len(events),
                    'first_event_date': first_event_date,
                    'last_event_date': last_event_date,
                    'total_cost': total_cost,
                    'total_cost_formatted': f"{total_cost:,}원" if total_cost else "0원",
                    'asset_age_days': asset_age_days,
                    'asset_age_text': self._format_age_text(asset_age_days)
                }
            }
            
        except Exception as e:
            print(f"자산 생명주기 타임라인 조회 오류: {e}")
            raise
    
    def get_lifecycle_statistics(self) -> Dict:
        """
        생명주기 통계 정보 조회
        
        Returns:
            생명주기 통계 정보
        """
        try:
            statistics = self.operations_repo.get_lifecycle_statistics()
            
            # 비즈니스 로직: 추가 통계 계산
            all_events = self.operations_repo.get_all_lifecycle_events()
            current_date = datetime.utcnow().date()
            
            # 이번 달 이벤트 수
            this_month_events = []
            for event in all_events:
                event_date = event.get('event_date')
                if event_date and hasattr(event_date, 'month'):
                    if (event_date.year == current_date.year and 
                        event_date.month == current_date.month):
                        this_month_events.append(event)
            
            statistics['this_month_events'] = len(this_month_events)
            
            # 최근 활동 (7일 이내)
            recent_events = []
            for event in all_events:
                event_date = event.get('event_date')
                if event_date and hasattr(event_date, 'strftime'):
                    days_ago = (current_date - event_date).days
                    if 0 <= days_ago <= 7:
                        recent_events.append(event)
            
            statistics['recent_events'] = len(recent_events)
            
            # 평균 이벤트 비용
            cost_stats = statistics.get('cost_stats', {})
            total_costs = cost_stats.get('total_costs', 0)
            total_events = statistics.get('total_events', 0)
            
            if total_events > 0:
                avg_cost = total_costs / total_events
                statistics['average_event_cost'] = round(avg_cost, 0)
            else:
                statistics['average_event_cost'] = 0
            
            # 비용 통계 포맷팅
            if total_costs:
                statistics['total_costs_formatted'] = f"{total_costs:,}원"
            else:
                statistics['total_costs_formatted'] = "0원"
            
            return statistics
            
        except Exception as e:
            print(f"생명주기 통계 조회 오류: {e}")
            raise
    
    def get_lifecycle_event_details(self, event_id: int) -> Optional[Dict]:
        """
        생명주기 이벤트 개별 상세 정보 조회
        
        Args:
            event_id: 이벤트 ID
            
        Returns:
            이벤트 상세 정보 또는 None
        """
        try:
            event = self.operations_repo.get_lifecycle_event_by_id(event_id)
            
            if not event:
                return None
            
            # 안전한 데이터 처리를 위한 복사본 생성
            safe_event = {}
            for key, value in event.items():
                # None 값을 안전한 기본값으로 변환
                if value is None:
                    if key in ['related_cost']:
                        safe_event[key] = 0
                    elif key in ['id', 'asset_id']:
                        safe_event[key] = 0
                    else:
                        safe_event[key] = ''
                else:
                    safe_event[key] = value
            
            # 비즈니스 로직: 날짜 포맷팅 및 추가 정보
            event_date = safe_event.get('event_date')
            if event_date and hasattr(event_date, 'strftime'):
                safe_event['event_date_formatted'] = event_date.strftime('%Y-%m-%d')
                
                # 이벤트 경과 시간 계산
                current_date = datetime.utcnow().date()
                days_ago = (current_date - event_date).days
                safe_event['days_ago'] = days_ago
                
                if days_ago == 0:
                    safe_event['time_ago_text'] = '오늘'
                elif days_ago == 1:
                    safe_event['time_ago_text'] = '어제'
                elif days_ago < 30:
                    safe_event['time_ago_text'] = f'{days_ago}일 전'
                elif days_ago < 365:
                    months_ago = days_ago // 30
                    safe_event['time_ago_text'] = f'{months_ago}개월 전'
                else:
                    years_ago = days_ago // 365
                    safe_event['time_ago_text'] = f'{years_ago}년 전'
            
            # 생성일시 포맷팅
            created_at = safe_event.get('created_at')
            if created_at and hasattr(created_at, 'strftime'):
                safe_event['created_at_formatted'] = created_at.strftime('%Y-%m-%d %H:%M')
            
            # 이벤트 유형별 색상 및 아이콘
            event_type_info = self._get_event_type_info(safe_event.get('event_type'))
            safe_event.update(event_type_info)
            
            # 비용 포맷팅
            related_cost = safe_event.get('related_cost', 0)
            if related_cost and related_cost > 0:
                safe_event['related_cost_formatted'] = f"{related_cost:,}원"
            else:
                safe_event['related_cost_formatted'] = "-"
            
            return safe_event
            
        except Exception as e:
            print(f"생명주기 이벤트 상세 정보 조회 오류 (ID: {event_id}): {e}")
            return None
    
    def _get_event_type_info(self, event_type: str) -> Dict:
        """
        이벤트 유형별 색상 및 아이콘 정보 반환
        
        Args:
            event_type: 이벤트 유형
            
        Returns:
            색상 및 아이콘 정보
        """
        event_type_map = {
            'acquisition': {
                'color': 'success',
                'icon': 'fas fa-shopping-cart',
                'bg_color': 'bg-success'
            },
            'deployment': {
                'color': 'info',
                'icon': 'fas fa-rocket',
                'bg_color': 'bg-info'
            },
            'maintenance': {
                'color': 'warning',
                'icon': 'fas fa-tools',
                'bg_color': 'bg-warning'
            },
            'upgrade': {
                'color': 'primary',
                'icon': 'fas fa-arrow-up',
                'bg_color': 'bg-primary'
            },
            'incident': {
                'color': 'danger',
                'icon': 'fas fa-exclamation-triangle',
                'bg_color': 'bg-danger'
            },
            'evaluation': {
                'color': 'secondary',
                'icon': 'fas fa-clipboard-check',
                'bg_color': 'bg-secondary'
            },
            'disposal': {
                'color': 'dark',
                'icon': 'fas fa-trash',
                'bg_color': 'bg-dark'
            }
        }
        
        return event_type_map.get(event_type, {
            'color': 'secondary',
            'icon': 'fas fa-circle',
            'bg_color': 'bg-secondary'
        })
    
    def _format_age_text(self, days: int) -> str:
        """
        자산 연령을 읽기 쉬운 텍스트로 변환
        
        Args:
            days: 일수
            
        Returns:
            포맷된 연령 텍스트
        """
        if days < 30:
            return f"{days}일"
        elif days < 365:
            months = days // 30
            return f"{months}개월"
        else:
            years = days // 365
            remaining_months = (days % 365) // 30
            if remaining_months > 0:
                return f"{years}년 {remaining_months}개월"
            else:
                return f"{years}년" 