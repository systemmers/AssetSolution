/**
 * Return Notifications Management JavaScript
 * 반납 알림 및 리마인더 관리 시스템
 */

// ApiUtils는 전역으로 로드됨 (utils.js에서 제공)

class ReturnNotificationManager {
    constructor() {
        this.notifications = [];
        this.notificationRules = [];
        this.notificationTemplates = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.autoRefreshInterval = null;
        this.notificationChart = null;
        
        this.init();
    }

    async init() {
        try {
            console.log('ReturnNotificationManager 초기화 중...');
            
            // API에서 데이터 로드
            await this.loadNotificationsFromAPI();
            await this.loadNotificationRulesFromAPI();
            await this.loadNotificationTemplatesFromAPI();
            
        this.setupEventListeners();
        this.renderNotificationStats();
        this.renderCurrentNotifications();
        this.renderNotificationRules();
        this.renderNotificationTemplates();
        this.setupAutoRefresh();
        this.initializeChart();
        
            console.log('ReturnNotificationManager 초기화 완료');
        } catch (error) {
            console.error('ReturnNotificationManager 초기화 실패:', error);
            this.showToast('알림 데이터 로드에 실패했습니다.', 'error');
        }
    }

    /**
     * API에서 알림 데이터 로드
     */
    async loadNotificationsFromAPI() {
        try {
            console.log('알림 데이터 로드 중...');
            
            const response = await ApiUtils.post('/operations/api/operations/return/notifications', {
                include_read: true,
                include_pending: true,
                limit: 100
            });
            
            if (response.success) {
                this.notifications = response.data.notifications || [];
                console.log(`${this.notifications.length}개의 알림 로드 완료`);
            } else {
                throw new Error(response.message || '알림 데이터 로드 실패');
            }
            
        } catch (error) {
            console.error('알림 API 호출 실패:', error);
            
            // 임시 fallback: 빈 배열로 초기화
            this.notifications = [];
            throw error;
        }
    }

    /**
     * API에서 알림 규칙 데이터 로드
     */
    async loadNotificationRulesFromAPI() {
        try {
            console.log('알림 규칙 데이터 로드 중...');
            
            const response = await ApiUtils.get('/operations/api/operations/return/notification-rules');
            
            if (response.success) {
                this.notificationRules = response.data.rules || [];
                console.log(`${this.notificationRules.length}개의 알림 규칙 로드 완료`);
            } else {
                throw new Error(response.message || '알림 규칙 데이터 로드 실패');
            }
            
        } catch (error) {
            console.error('알림 규칙 API 호출 실패:', error);
            
            // 임시 fallback: 빈 배열로 초기화
            this.notificationRules = [];
            throw error;
        }
    }

    /**
     * API에서 알림 템플릿 데이터 로드
     */
    async loadNotificationTemplatesFromAPI() {
        try {
            console.log('알림 템플릿 데이터 로드 중...');
            
            const response = await ApiUtils.get('/operations/api/operations/return/notification-templates');
            
            if (response.success) {
                this.notificationTemplates = response.data.templates || [];
                console.log(`${this.notificationTemplates.length}개의 알림 템플릿 로드 완료`);
            } else {
                throw new Error(response.message || '알림 템플릿 데이터 로드 실패');
            }
            
        } catch (error) {
            console.error('알림 템플릿 API 호출 실패:', error);
            
            // 임시 fallback: 빈 배열로 초기화
            this.notificationTemplates = [];
            throw error;
        }
    }

    /**
     * 알림을 읽음으로 표시
     */
    async markAsReadAPI(notificationId) {
        try {
            const response = await ApiUtils.post('/operations/api/operations/return/notifications/mark-read', {
                notification_id: notificationId
            });
            
            if (response.success) {
                // 로컬 데이터 업데이트
                const notification = this.notifications.find(n => n.id === notificationId);
                if (notification) {
                    notification.readAt = new Date();
                    notification.status = 'read';
                }
                
                this.renderCurrentNotifications();
                this.renderNotificationStats();
                
                this.showToast('알림을 읽음으로 표시했습니다.', 'success');
                return true;
            } else {
                throw new Error(response.message || '읽음 표시 실패');
            }
            
        } catch (error) {
            console.error('읽음 표시 실패:', error);
            this.showToast('읽음 표시에 실패했습니다.', 'error');
            return false;
        }
    }

    /**
     * 알림 삭제
     */
    async deleteNotificationAPI(notificationId) {
        try {
            const response = await ApiUtils.delete(`/operations/api/operations/return/notifications/${notificationId}`);
            
            if (response.success) {
                // 로컬 데이터에서 제거
                this.notifications = this.notifications.filter(n => n.id !== notificationId);
                
                this.renderCurrentNotifications();
                this.renderNotificationStats();
                
                this.showToast('알림을 삭제했습니다.', 'success');
                return true;
            } else {
                throw new Error(response.message || '알림 삭제 실패');
            }
            
        } catch (error) {
            console.error('알림 삭제 실패:', error);
            this.showToast('알림 삭제에 실패했습니다.', 'error');
            return false;
        }
    }

    /**
     * 알림 규칙 저장
     */
    async saveRuleAPI(ruleData) {
        try {
            const endpoint = ruleData.id ? 
                `/operations/api/operations/return/notification-rules/${ruleData.id}` : 
                '/operations/api/operations/return/notification-rules';
            
            const method = ruleData.id ? 'put' : 'post';
            
            const response = await ApiUtils[method](endpoint, ruleData);
            
            if (response.success) {
                // 데이터 새로고침
                await this.loadNotificationRulesFromAPI();
                this.renderNotificationRules();
                
                const message = ruleData.id ? '알림 규칙이 수정되었습니다.' : '알림 규칙이 생성되었습니다.';
                this.showToast(message, 'success');
                return true;
            } else {
                throw new Error(response.message || '알림 규칙 저장 실패');
            }
            
        } catch (error) {
            console.error('알림 규칙 저장 실패:', error);
            this.showToast('알림 규칙 저장에 실패했습니다.', 'error');
            return false;
        }
    }

    /**
     * 알림 템플릿 저장
     */
    async saveTemplateAPI(templateData) {
        try {
            const endpoint = templateData.id ? 
                `/operations/api/operations/return/notification-templates/${templateData.id}` : 
                '/operations/api/operations/return/notification-templates';
            
            const method = templateData.id ? 'put' : 'post';
            
            const response = await ApiUtils[method](endpoint, templateData);
            
            if (response.success) {
                // 데이터 새로고침
                await this.loadNotificationTemplatesFromAPI();
                this.renderNotificationTemplates();
                
                const message = templateData.id ? '알림 템플릿이 수정되었습니다.' : '알림 템플릿이 생성되었습니다.';
                this.showToast(message, 'success');
                return true;
            } else {
                throw new Error(response.message || '알림 템플릿 저장 실패');
            }
            
        } catch (error) {
            console.error('알림 템플릿 저장 실패:', error);
            this.showToast('알림 템플릿 저장에 실패했습니다.', 'error');
            return false;
        }
    }

    /**
     * 전체 데이터 새로고침
     */
    async refreshNotifications() {
        try {
            await this.loadNotificationsFromAPI();
            await this.loadNotificationRulesFromAPI();
            await this.loadNotificationTemplatesFromAPI();
            
            this.renderNotificationStats();
            this.renderCurrentNotifications();
            this.renderNotificationRules();
            this.renderNotificationTemplates();
            
            this.showToast('알림 데이터가 새로고침되었습니다.', 'success');
            console.log('알림 데이터 새로고침 완료');
        } catch (error) {
            console.error('알림 데이터 새로고침 실패:', error);
            this.showToast('데이터 새로고침에 실패했습니다.', 'error');
        }
    }

    setupEventListeners() {
        // 탭 변경 이벤트
        document.querySelectorAll('#notificationTabs button').forEach(tab => {
            tab.addEventListener('shown.bs.tab', (e) => {
                const target = e.target.getAttribute('data-bs-target');
                this.handleTabChange(target);
            });
        });

        // 필터 이벤트
        ['typeFilter', 'priorityFilter', 'statusFilter'].forEach(filterId => {
            const element = document.getElementById(filterId);
            if (element) {
                element.addEventListener('change', () => this.applyNotificationFilters());
            }
        });

        // 검색 이벤트
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(() => {
                this.applyNotificationFilters();
            }, 300));
        }

        // 히스토리 필터 이벤트
        const historyPeriodFilter = document.getElementById('historyPeriodFilter');
        if (historyPeriodFilter) {
            historyPeriodFilter.addEventListener('change', () => this.loadNotificationHistory());
        }

        // 전역 함수들을 클래스 메서드에 바인딩
        window.refreshNotifications = () => this.refreshNotifications();
        window.openNotificationSettings = () => this.openNotificationSettings();
        window.applyNotificationFilters = () => this.applyNotificationFilters();
        window.markAllAsRead = () => this.markAllAsRead();
        window.clearReadNotifications = () => this.clearReadNotifications();
        window.openRuleModal = () => this.openRuleModal();
        window.openTemplateModal = () => this.openTemplateModal();
        window.saveRule = () => this.saveRule();
        window.saveTemplate = () => this.saveTemplate();
        window.saveSettings = () => this.saveSettings();
        window.previewTemplate = () => this.previewTemplate();
    }

    renderNotificationStats() {
        const stats = this.calculateNotificationStats();
        
        document.getElementById('pendingNotifications').textContent = stats.pending;
        document.getElementById('sentToday').textContent = stats.sentToday;
        document.getElementById('overdueAlerts').textContent = stats.overdue;
        document.getElementById('activeRules').textContent = stats.activeRules;
        
        // 탭 배지 업데이트
        this.updateTabBadges();
    }

    updateTabBadges() {
        const stats = this.calculateNotificationStats();
        
        document.getElementById('currentBadge').textContent = stats.pending;
        document.getElementById('historyBadge').textContent = stats.sentToday;
        document.getElementById('rulesBadge').textContent = stats.activeRules;
        document.getElementById('templatesBadge').textContent = this.notificationTemplates.length;
    }

    calculateNotificationStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return {
            pending: this.notifications.filter(n => n.status === 'pending').length,
            sentToday: this.notifications.filter(n => {
                const createdDate = new Date(n.createdAt);
                createdDate.setHours(0, 0, 0, 0);
                return createdDate.getTime() === today.getTime() && n.status === 'sent';
            }).length,
            overdue: this.notifications.filter(n => n.type === 'overdue_alert').length,
            activeRules: this.notificationRules.filter(r => r.active).length
        };
    }

    renderCurrentNotifications() {
        const container = document.getElementById('currentNotificationsList');
        if (!container) return;

        const filteredNotifications = this.getFilteredNotifications();
        
        if (filteredNotifications.length === 0) {
            container.innerHTML = this.renderEmptyState('알림이 없습니다', '현재 표시할 알림이 없습니다.');
            return;
        }

        const html = filteredNotifications.map(notification => this.renderNotificationItem(notification)).join('');
        container.innerHTML = html;
    }

    renderNotificationItem(notification) {
        const timeAgo = this.formatTimeAgo(notification.createdAt);
        const isUnread = !notification.readAt;
        const statusBadge = this.getNotificationStatusBadge(notification.type);
        const priorityBadge = this.getPriorityBadge(notification.priority);
        
        return `
            <div class="list-item ${isUnread ? 'unread' : ''}" onclick="showNotificationDetail('${notification.id}')">
                <div class="item-header">
                    <div class="d-flex align-items-center gap-3">
                        <div class="item-info">
                            <div class="item-title">
                                <span>${notification.title}</span>
                                <small class="text-muted">${timeAgo}</small>
                            </div>
                            <div class="item-meta">
                                <div class="meta-item">
                                    <i class="fas fa-user"></i>
                                    <span>${notification.recipient || '시스템'}</span>
                                </div>
                                <div class="meta-item">
                                    <i class="fas fa-envelope"></i>
                                    <span>${notification.channel || 'system'}</span>
                                </div>
                                <div class="meta-item">
                                    <i class="fas fa-clock"></i>
                                    <span>${this.formatDateTime(notification.createdAt)}</span>
                                </div>
                            </div>
                            <div class="d-flex align-items-center gap-2 mb-2">
                                ${statusBadge}
                                ${priorityBadge}
                                ${isUnread ? '<span class="badge bg-primary">새 알림</span>' : ''}
                </div>
                <div class="notification-content">${notification.content}</div>
                        </div>
                    </div>
                    <div class="item-actions">
                        <button class="btn btn-sm btn-outline-primary" onclick="event.stopPropagation(); showNotificationDetail('${notification.id}')">
                            <i class="fas fa-eye"></i> 상세보기
                        </button>
                        ${isUnread ? `<button class="btn btn-sm btn-success" onclick="event.stopPropagation(); markAsRead('${notification.id}')">
                            <i class="fas fa-check"></i> 읽음
                        </button>` : ''}
                        <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); deleteNotification('${notification.id}')">
                            <i class="fas fa-trash"></i> 삭제
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getFilteredNotifications() {
        let filtered = [...this.notifications];
        
        const typeFilter = document.getElementById('typeFilter')?.value;
        const priorityFilter = document.getElementById('priorityFilter')?.value;
        const statusFilter = document.getElementById('statusFilter')?.value;
        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase();
        
        if (typeFilter) {
            filtered = filtered.filter(n => n.type === typeFilter);
        }
        
        if (priorityFilter) {
            filtered = filtered.filter(n => n.priority === priorityFilter);
        }
        
        if (statusFilter) {
            filtered = filtered.filter(n => n.status === statusFilter);
        }
        
        if (searchTerm) {
            filtered = filtered.filter(n => 
                n.title.toLowerCase().includes(searchTerm) ||
                n.content.toLowerCase().includes(searchTerm) ||
                n.recipient.toLowerCase().includes(searchTerm)
            );
        }
        
        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    renderNotificationRules() {
        const container = document.getElementById('rulesContainer');
        if (!container) return;

        if (this.notificationRules.length === 0) {
            container.innerHTML = this.renderEmptyState('알림 규칙이 없습니다', '새 규칙을 추가해보세요.');
            return;
        }

        const html = this.notificationRules.map(rule => this.renderRuleCard(rule)).join('');
        container.innerHTML = html;
    }

    renderRuleCard(rule) {
        const lastTriggered = rule.lastTriggered ? this.formatTimeAgo(rule.lastTriggered) : '없음';
        
        return `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="rule-card ${!rule.active ? 'inactive' : ''}">
                    <div class="rule-status">
                        <label class="status-toggle">
                            <input type="checkbox" ${rule.active ? 'checked' : ''} onchange="toggleRule('${rule.id}')">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="rule-header">
                        <div>
                            <div class="rule-title">${rule.name}</div>
                            <div class="rule-type">${this.getNotificationTypeLabel(rule.type)}</div>
                        </div>
                    </div>
                    <div class="rule-details">
                        <div class="rule-detail-item">
                            <div class="rule-detail-label">트리거</div>
                            <div class="rule-detail-value">${this.getTriggerLabel(rule.trigger)}</div>
                        </div>
                        <div class="rule-detail-item">
                            <div class="rule-detail-label">우선순위</div>
                            <div class="rule-detail-value">${this.getPriorityLabel(rule.priority)}</div>
                        </div>
                        <div class="rule-detail-item">
                            <div class="rule-detail-label">채널</div>
                            <div class="rule-detail-value">${rule.channels.join(', ')}</div>
                        </div>
                        <div class="rule-detail-item">
                            <div class="rule-detail-label">마지막 실행</div>
                            <div class="rule-detail-value">${lastTriggered}</div>
                        </div>
                    </div>
                    <div class="rule-actions">
                        <button class="btn btn-sm btn-outline-primary" onclick="editRule('${rule.id}')">편집</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteRule('${rule.id}')">삭제</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderNotificationTemplates() {
        const container = document.getElementById('templatesContainer');
        if (!container) return;

        if (this.notificationTemplates.length === 0) {
            container.innerHTML = this.renderEmptyState('템플릿이 없습니다', '새 템플릿을 추가해보세요.');
            return;
        }

        const html = this.notificationTemplates.map(template => this.renderTemplateCard(template)).join('');
        container.innerHTML = html;
    }

    renderTemplateCard(template) {
        const lastUsed = template.lastUsed ? this.formatTimeAgo(template.lastUsed) : '없음';
        const previewContent = template.content.substring(0, 100) + '...';
        
        return `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="template-card">
                    <div class="template-header">
                        <div>
                            <div class="template-title">${template.name}</div>
                            <div class="template-type">${template.type.toUpperCase()}</div>
                        </div>
                    </div>
                    <div class="template-preview">${previewContent}</div>
                    <div class="d-flex justify-content-between align-items-center text-muted small">
                        <span>마지막 사용: ${lastUsed}</span>
                        <div class="template-actions">
                            <button class="btn btn-sm btn-outline-primary" onclick="editTemplate('${template.id}')">편집</button>
                            <button class="btn btn-sm btn-outline-secondary" onclick="duplicateTemplate('${template.id}')">복사</button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteTemplate('${template.id}')">삭제</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    initializeChart() {
        const ctx = document.getElementById('notificationChart');
        if (!ctx) return;

        // Mock 차트 데이터
        const chartData = {
            labels: ['월', '화', '수', '목', '금', '토', '일'],
            datasets: [{
                label: '발송된 알림',
                data: [12, 19, 3, 5, 2, 3, 7],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1
            }, {
                label: '실패한 알림',
                data: [1, 0, 2, 1, 0, 1, 0],
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                tension: 0.1
            }]
        };

        this.notificationChart = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '주간 알림 발송 현황'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    handleTabChange(target) {
        switch(target) {
            case '#current':
                this.renderCurrentNotifications();
                break;
            case '#history':
                this.loadNotificationHistory();
                break;
            case '#rules':
                this.renderNotificationRules();
                break;
            case '#templates':
                this.renderNotificationTemplates();
                break;
        }
    }

    loadNotificationHistory() {
        const tableBody = document.getElementById('historyTableBody');
        if (!tableBody) return;

        // Mock 히스토리 데이터
        const historyData = this.notifications.filter(n => n.status === 'sent' || n.status === 'failed');
        
        if (historyData.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">히스토리가 없습니다.</td></tr>';
            return;
        }

        const html = historyData.map(notification => `
            <tr>
                <td>${this.formatDateTime(notification.createdAt)}</td>
                <td><span class="notification-type ${notification.type}">${this.getNotificationTypeLabel(notification.type)}</span></td>
                <td>${notification.title}</td>
                <td>${notification.recipient}</td>
                <td>${notification.channel.toUpperCase()}</td>
                <td><span class="badge bg-${notification.status === 'sent' ? 'success' : 'danger'}">${notification.status === 'sent' ? '성공' : '실패'}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="showNotificationDetail('${notification.id}')">상세</button>
                </td>
            </tr>
        `).join('');

        tableBody.innerHTML = html;
    }

    setupAutoRefresh() {
        // 30초마다 자동 새로고침
        this.autoRefreshInterval = setInterval(() => {
            this.refreshNotifications();
        }, 30000);
    }

    applyNotificationFilters() {
        this.renderCurrentNotifications();
    }

    async markAllAsRead() {
        try {
            const unreadNotifications = this.notifications.filter(n => !n.readAt);
            
            if (unreadNotifications.length === 0) {
                this.showToast('읽지 않은 알림이 없습니다.', 'info');
                return;
            }
            
            // 각 알림을 개별적으로 읽음 처리
            let successCount = 0;
            for (const notification of unreadNotifications) {
                const success = await this.markAsReadAPI(notification.id);
                if (success) successCount++;
            }
            
            if (successCount > 0) {
                this.showToast(`${successCount}개의 알림을 읽음 처리했습니다.`, 'success');
            }
            
        } catch (error) {
            console.error('전체 읽음 처리 실패:', error);
            this.showToast('전체 읽음 처리에 실패했습니다.', 'error');
        }
    }

    async clearReadNotifications() {
        try {
            const readNotifications = this.notifications.filter(n => n.readAt);
            
            if (readNotifications.length === 0) {
                this.showToast('삭제할 읽은 알림이 없습니다.', 'info');
                return;
            }
            
            if (!confirm(`${readNotifications.length}개의 읽은 알림을 삭제하시겠습니까?`)) {
                return;
            }
            
            // 각 알림을 개별적으로 삭제
            let successCount = 0;
            for (const notification of readNotifications) {
                const success = await this.deleteNotificationAPI(notification.id);
                if (success) successCount++;
            }
            
            if (successCount > 0) {
                this.showToast(`${successCount}개의 읽은 알림을 삭제했습니다.`, 'success');
            }
            
        } catch (error) {
            console.error('읽은 알림 삭제 실패:', error);
            this.showToast('읽은 알림 삭제에 실패했습니다.', 'error');
        }
    }

    async saveRule() {
        const form = document.getElementById('ruleForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = new FormData(form);
        const ruleData = {
            id: document.getElementById('ruleId').value || null,
            name: formData.get('ruleName') || document.getElementById('ruleName').value,
            type: formData.get('ruleType') || document.getElementById('ruleType').value,
            trigger: formData.get('ruleTrigger') || document.getElementById('ruleTrigger').value,
            priority: formData.get('rulePriority') || document.getElementById('rulePriority').value,
            channels: [],
            recipients: Array.from(document.getElementById('ruleRecipients').selectedOptions).map(option => option.value),
            template: document.getElementById('ruleTemplate').value,
            active: document.getElementById('ruleActive').checked
        };

        // 채널 수집
        ['email', 'system', 'sms'].forEach(channel => {
            const checkbox = document.getElementById(`channel${channel.charAt(0).toUpperCase() + channel.slice(1)}`);
            if (checkbox && checkbox.checked) {
                ruleData.channels.push(channel);
            }
        });

        // API 호출로 규칙 저장
        const success = await this.saveRuleAPI(ruleData);
        
        if (success) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('ruleModal'));
        modal.hide();
        }
    }

    async saveTemplate() {
        const form = document.getElementById('templateForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const templateData = {
            id: document.getElementById('templateId').value || null,
            name: document.getElementById('templateName').value,
            type: document.getElementById('templateType').value,
            subject: document.getElementById('templateSubject').value,
            content: document.getElementById('templateContent').value
        };

        // API 호출로 템플릿 저장
        const success = await this.saveTemplateAPI(templateData);
        
        if (success) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('templateModal'));
        modal.hide();
        }
    }

    previewTemplate() {
        const subject = document.getElementById('templateSubject').value;
        const content = document.getElementById('templateContent').value;
        
        // 변수 치환 예시
        const sampleData = {
            '{{asset_name}}': 'IT-001 노트북',
            '{{requester_name}}': '홍길동',
            '{{department}}': 'IT팀',
            '{{due_date}}': '2024-12-31',
            '{{request_date}}': '2024-12-20'
        };
        
        let previewSubject = subject;
        let previewContent = content;
        
        Object.entries(sampleData).forEach(([variable, value]) => {
            previewSubject = previewSubject.replace(new RegExp(variable, 'g'), value);
            previewContent = previewContent.replace(new RegExp(variable, 'g'), value);
        });
        
        const previewWindow = window.open('', '_blank', 'width=600,height=400');
        previewWindow.document.write(`
            <html>
                <head>
                    <title>템플릿 미리보기</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .preview-subject { font-weight: bold; font-size: 18px; margin-bottom: 20px; }
                        .preview-content { white-space: pre-wrap; line-height: 1.6; }
                    </style>
                </head>
                <body>
                    <div class="preview-subject">제목: ${previewSubject}</div>
                    <div class="preview-content">${previewContent}</div>
                </body>
            </html>
        `);
    }

    openNotificationSettings() {
        const modal = new bootstrap.Modal(document.getElementById('settingsModal'));
        modal.show();
    }

    saveSettings() {
        // 설정 저장 로직
        const settings = {
            defaultChannels: {
                email: document.getElementById('defaultEmail').checked,
                system: document.getElementById('defaultSystem').checked
            },
            emailSendTime: document.getElementById('emailSendTime').value,
            retentionPeriod: document.getElementById('retentionPeriod').value,
            enableDigest: document.getElementById('enableDigest').checked
        };
        
        // 실제 구현에서는 서버에 저장
        localStorage.setItem('notificationSettings', JSON.stringify(settings));
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('settingsModal'));
        modal.hide();
        
        this.showToast('설정이 저장되었습니다.', 'success');
    }

    // 유틸리티 메서드들
    getNotificationTypeLabel(type) {
        const labels = {
            'approval_request': '승인 요청',
            'due_reminder': '기한 알림',
            'overdue_alert': '연체 알림',
            'status_change': '상태 변경'
        };
        return labels[type] || type;
    }

    getNotificationStatusBadge(type) {
        const typeClass = {
            'approval_request': 'pending',
            'due_reminder': 'scheduled',
            'overdue_alert': 'rejected',
            'status_change': 'approved'
        };
        
        return `<span class="status-badge ${typeClass[type] || 'pending'}">${this.getNotificationTypeLabel(type)}</span>`;
    }

    getPriorityBadge(priority) {
        const priorityIcon = {
            'low': '<i class="fas fa-chevron-down"></i>',
            'medium': '<i class="fas fa-minus"></i>',
            'high': '<i class="fas fa-chevron-up"></i>',
            'urgent': '<i class="fas fa-exclamation"></i>'
        };
        
        return `<span class="priority-badge ${priority}">${priorityIcon[priority] || ''} ${this.getPriorityLabel(priority)}</span>`;
    }

    getPriorityLabel(priority) {
        const labels = {
            'high': '높음',
            'medium': '보통',
            'low': '낮음'
        };
        return labels[priority] || priority;
    }

    getTriggerLabel(trigger) {
        const labels = {
            'immediate': '즉시',
            '1_day_before': '1일 전',
            '3_days_before': '3일 전',
            '1_week_before': '1주일 전',
            'on_overdue': '연체 시'
        };
        return labels[trigger] || trigger;
    }

    formatTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
        
        if (diffInSeconds < 60) return '방금 전';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
        return `${Math.floor(diffInSeconds / 86400)}일 전`;
    }

    formatDateTime(date) {
        return new Date(date).toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    renderEmptyState(title, description) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-bell-slash"></i>
                </div>
                <div class="empty-state-title">${title}</div>
                <div class="empty-state-description">${description}</div>
            </div>
        `;
    }

    showToast(message, type = 'info') {
        // Toast 알림 표시
        const toastHtml = `
            <div class="toast align-items-center text-white bg-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'primary'} border-0" role="alert">
                <div class="d-flex">
                    <div class="toast-body">${message}</div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `;
        
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }
        
        toastContainer.insertAdjacentHTML('beforeend', toastHtml);
        const toastElement = toastContainer.lastElementChild;
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
        
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    destroy() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
        }
        if (this.notificationChart) {
            this.notificationChart.destroy();
        }
    }

    openRuleModal(ruleId = null) {
        const modal = new bootstrap.Modal(document.getElementById('ruleModal'));
        const form = document.getElementById('ruleForm');
        
        if (ruleId) {
            const rule = this.notificationRules.find(r => r.id === ruleId);
            if (rule) {
                document.getElementById('ruleId').value = rule.id;
                document.getElementById('ruleName').value = rule.name;
                document.getElementById('ruleType').value = rule.type;
                document.getElementById('ruleTrigger').value = rule.trigger;
                document.getElementById('rulePriority').value = rule.priority;
                document.getElementById('ruleActive').checked = rule.active;
                
                // 채널 설정
                rule.channels.forEach(channel => {
                    const checkbox = document.getElementById(`channel${channel.charAt(0).toUpperCase() + channel.slice(1)}`);
                    if (checkbox) checkbox.checked = true;
                });
            }
        } else {
            form.reset();
            document.getElementById('ruleId').value = '';
        }
        
        modal.show();
    }

    openTemplateModal(templateId = null) {
        const modal = new bootstrap.Modal(document.getElementById('templateModal'));
        const form = document.getElementById('templateForm');
        
        if (templateId) {
            const template = this.notificationTemplates.find(t => t.id === templateId);
            if (template) {
                document.getElementById('templateId').value = template.id;
                document.getElementById('templateName').value = template.name;
                document.getElementById('templateType').value = template.type;
                document.getElementById('templateSubject').value = template.subject;
                document.getElementById('templateContent').value = template.content;
            }
        } else {
            form.reset();
            document.getElementById('templateId').value = '';
        }
        
        modal.show();
    }
}

// 전역 함수들 (HTML에서 호출)
window.showNotificationDetail = function(notificationId) {
    const notification = window.notificationManager.notifications.find(n => n.id === notificationId);
    if (!notification) return;

    const modal = new bootstrap.Modal(document.getElementById('notificationDetailModal'));
    const content = document.getElementById('notificationDetailContent');
    
    content.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <strong>제목:</strong> ${notification.title}<br>
                <strong>타입:</strong> ${window.notificationManager.getNotificationTypeLabel(notification.type)}<br>
                <strong>우선순위:</strong> ${window.notificationManager.getPriorityLabel(notification.priority)}<br>
                <strong>상태:</strong> ${notification.status}<br>
            </div>
            <div class="col-md-6">
                <strong>수신자:</strong> ${notification.recipient}<br>
                <strong>발송자:</strong> ${notification.sender}<br>
                <strong>채널:</strong> ${notification.channel}<br>
                <strong>생성일:</strong> ${window.notificationManager.formatDateTime(notification.createdAt)}<br>
            </div>
        </div>
        <hr>
        <div>
            <strong>내용:</strong><br>
            <div class="mt-2 p-3 bg-light rounded">${notification.content}</div>
        </div>
        ${notification.relatedAsset ? `
        <hr>
        <div>
            <strong>관련 자산:</strong> ${notification.relatedAsset}<br>
            <strong>워크플로우 ID:</strong> ${notification.workflowId}
        </div>
        ` : ''}
    `;
    
    modal.show();
};

window.markAsRead = async function(notificationId) {
    await window.notificationManager.markAsReadAPI(notificationId);
};

window.deleteNotification = async function(notificationId) {
    if (confirm('이 알림을 삭제하시겠습니까?')) {
        await window.notificationManager.deleteNotificationAPI(notificationId);
    }
};

window.toggleRule = function(ruleId) {
    const rule = window.notificationManager.notificationRules.find(r => r.id === ruleId);
    if (rule) {
        rule.active = !rule.active;
        window.notificationManager.renderNotificationRules();
        window.notificationManager.renderNotificationStats();
        window.notificationManager.showToast(`규칙이 ${rule.active ? '활성화' : '비활성화'}되었습니다.`, 'success');
    }
};

window.editRule = function(ruleId) {
    window.notificationManager.openRuleModal(ruleId);
};

window.deleteRule = function(ruleId) {
    if (confirm('이 규칙을 삭제하시겠습니까?')) {
        window.notificationManager.notificationRules = window.notificationManager.notificationRules.filter(r => r.id !== ruleId);
        window.notificationManager.renderNotificationRules();
        window.notificationManager.renderNotificationStats();
        window.notificationManager.showToast('규칙이 삭제되었습니다.', 'success');
    }
};

window.editTemplate = function(templateId) {
    window.notificationManager.openTemplateModal(templateId);
};

window.duplicateTemplate = function(templateId) {
    const template = window.notificationManager.notificationTemplates.find(t => t.id === templateId);
    if (template) {
        const newTemplate = {
            ...template,
            id: `template-${Date.now()}`,
            name: `${template.name} (복사본)`,
            createdAt: new Date(),
            lastUsed: null
        };
        window.notificationManager.notificationTemplates.push(newTemplate);
        window.notificationManager.renderNotificationTemplates();
        window.notificationManager.showToast('템플릿이 복사되었습니다.', 'success');
    }
};

window.deleteTemplate = function(templateId) {
    if (confirm('이 템플릿을 삭제하시겠습니까?')) {
        window.notificationManager.notificationTemplates = window.notificationManager.notificationTemplates.filter(t => t.id !== templateId);
        window.notificationManager.renderNotificationTemplates();
        window.notificationManager.showToast('템플릿이 삭제되었습니다.', 'success');
    }
};

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    window.notificationManager = new ReturnNotificationManager();
});

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', function() {
    if (window.notificationManager) {
        window.notificationManager.destroy();
    }
}); 