/**
 * 사용자 활동 로그 관리 모듈
 * @module users/detail/activity-manager
 */
import ApiUtils from '../../../../common/api-utils.js';

/**
 * 사용자 활동 로그 초기화
 * @returns {Function} 이벤트 정리 함수
 */
export function initActivityLog() {
    const activityContainer = document.getElementById('userActivity');
    const userId = document.querySelector('[data-user-id]')?.dataset.userId;
    
    if (!activityContainer || !userId) return null;
    
    // 초기 로드
    loadUserActivity(activityContainer, userId, false);
    
    // 새로고침 이벤트 핸들러
    const handleRefresh = function() {
        loadUserActivity(activityContainer, userId, true);
    };
    
    // 커스텀 이벤트 리스너 등록
    document.addEventListener('refresh-activity-log', handleRefresh);
    
    // 정리 함수 반환
    return function cleanup() {
        document.removeEventListener('refresh-activity-log', handleRefresh);
    };
}

/**
 * 사용자 활동 로그 로드
 * @param {HTMLElement} container - 활동 로그를 표시할 컨테이너
 * @param {string} userId - 사용자 ID
 * @param {boolean} refresh - 기존 데이터를 새로고침할지 여부
 */
function loadUserActivity(container, userId, refresh = false) {
    // 이미 로드된 경우 스킵 (새로고침 요청이 아닌 경우)
    if (container.children.length > 0 && !refresh) return;
    
    if (refresh) {
        // 로딩 스피너 표시
        container.innerHTML = '<div class="text-center py-3"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">로딩 중...</span></div></div>';
    }
    
    // API 호출 (시연용: 실제 구현시 실제 API 엔드포인트로 변경 필요)
    ApiUtils.get(`/api/users/${userId}/activity`, {
        limit: 20,
        page: 1
    }, {
        handleErrors: true,
        showLoader: false
    })
    .then(response => {
        // 시연을 위한 가상 데이터
        const activities = [
            { timestamp: '2023-12-01 14:30:25', action: '로그인', ip: '192.168.1.1', details: '웹 브라우저에서 로그인' },
            { timestamp: '2023-12-01 15:45:10', action: '자산 수정', ip: '192.168.1.1', details: '자산 #1234 정보 업데이트' },
            { timestamp: '2023-12-02 09:15:32', action: '로그인', ip: '192.168.1.2', details: '모바일 앱에서 로그인' },
            { timestamp: '2023-12-02 11:30:45', action: '자산 추가', ip: '192.168.1.2', details: '새 자산 #5678 추가' },
            { timestamp: '2023-12-03 10:20:18', action: '로그아웃', ip: '192.168.1.1', details: '웹 브라우저에서 로그아웃' }
        ];
        
        // 활동 로그 렌더링
        renderActivityLog(container, activities);
    })
    .catch(error => {
        container.innerHTML = `<div class="alert alert-danger">활동 로그를 불러오는 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}</div>`;
    });
}

/**
 * 활동 로그 렌더링
 * @param {HTMLElement} container - 활동 로그를 표시할 컨테이너
 * @param {Array} activities - 활동 로그 데이터 배열
 */
function renderActivityLog(container, activities) {
    if (!container || !activities || !activities.length) {
        container.innerHTML = '<div class="alert alert-info">활동 기록이 없습니다.</div>';
        return;
    }
    
    // 테이블 생성
    const table = document.createElement('table');
    table.className = 'table table-striped table-hover';
    
    // 테이블 헤더
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>일시</th>
            <th>활동</th>
            <th>IP 주소</th>
            <th>상세 정보</th>
        </tr>
    `;
    table.appendChild(thead);
    
    // 테이블 본문
    const tbody = document.createElement('tbody');
    activities.forEach(activity => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${activity.timestamp}</td>
            <td>${activity.action}</td>
            <td>${activity.ip}</td>
            <td>${activity.details}</td>
        `;
        tbody.appendChild(row);
    });
    table.appendChild(tbody);
    
    // 컨테이너에 테이블 추가
    container.innerHTML = '';
    container.appendChild(table);
} 