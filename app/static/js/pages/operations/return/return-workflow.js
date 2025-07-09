/**
 * Return Workflow Manager
 * 반납 승인 워크플로우를 관리하는 모듈
 * 
 * 주요 기능:
 * 1. 다단계 승인 프로세스 관리
 * 2. 승인자별 권한 체크
 * 3. 워크플로우 상태 추적
 * 4. 승인 이력 관리
 */

export default class ReturnWorkflowManager {
    constructor() {
        this.workflowSteps = this.initializeWorkflowSteps();
        this.currentWorkflow = null;
        this.approvers = [];
        this.isInitialized = false;
    }

    /**
     * 워크플로우 단계 초기화
     */
    initializeWorkflowSteps() {
        return {
            REQUESTED: {
                id: 'requested',
                name: '반납 요청됨',
                description: '사용자가 반납을 요청한 상태',
                nextSteps: ['dept_approval'],
                canEdit: true,
                canCancel: true,
                icon: 'bi-clock-history',
                color: 'secondary'
            },
            DEPT_APPROVAL: {
                id: 'dept_approval',
                name: '부서장 승인 대기',
                description: '부서장의 승인을 기다리는 상태',
                nextSteps: ['asset_manager_approval', 'rejected'],
                canEdit: false,
                canCancel: true,
                icon: 'bi-person-check',
                color: 'warning',
                approverRole: 'department_manager'
            },
            ASSET_MANAGER_APPROVAL: {
                id: 'asset_manager_approval',
                name: '자산관리자 승인 대기',
                description: '자산관리자의 승인을 기다리는 상태',
                nextSteps: ['final_approval', 'rejected'],
                canEdit: false,
                canCancel: false,
                icon: 'bi-shield-check',
                color: 'info',
                approverRole: 'asset_manager'
            },
            FINAL_APPROVAL: {
                id: 'final_approval',
                name: '최종 승인 대기',
                description: '최종 승인자의 승인을 기다리는 상태',
                nextSteps: ['approved', 'rejected'],
                canEdit: false,
                canCancel: false,
                icon: 'bi-award',
                color: 'primary',
                approverRole: 'final_approver'
            },
            APPROVED: {
                id: 'approved',
                name: '승인 완료',
                description: '모든 승인이 완료된 상태',
                nextSteps: ['returned'],
                canEdit: false,
                canCancel: false,
                icon: 'bi-check-circle',
                color: 'success'
            },
            RETURNED: {
                id: 'returned',
                name: '반납 완료',
                description: '실제 반납이 완료된 상태',
                nextSteps: [],
                canEdit: false,
                canCancel: false,
                icon: 'bi-check-circle-fill',
                color: 'success'
            },
            REJECTED: {
                id: 'rejected',
                name: '반납 거부',
                description: '승인 과정에서 거부된 상태',
                nextSteps: ['requested'],
                canEdit: true,
                canCancel: false,
                icon: 'bi-x-circle',
                color: 'danger'
            }
        };
    }

    /**
     * 초기화
     */
    async initialize() {
        try {
            console.log('ReturnWorkflowManager 초기화 중...');
            
            // 승인자 정보 로드
            await this.loadApprovers();
            
            this.isInitialized = true;
            console.log('ReturnWorkflowManager 초기화 완료');
            
        } catch (error) {
            console.error('ReturnWorkflowManager 초기화 오류:', error);
            throw error;
        }
    }

    /**
     * 승인자 정보 로드
     */
    async loadApprovers() {
        try {
            // 실제 구현에서는 API 호출
            this.approvers = await this.fetchApprovers();
            console.log(`승인자 ${this.approvers.length}명 로드 완료`);
        } catch (error) {
            console.error('승인자 정보 로드 오류:', error);
            throw error;
        }
    }

    /**
     * 승인자 정보 가져오기 (모의)
     */
    async fetchApprovers() {
        // 모의 지연 시간
        await new Promise(resolve => setTimeout(resolve, 200));
        
        return [
            {
                id: 1,
                name: '김부장',
                role: 'department_manager',
                department: '개발팀',
                email: 'kim.manager@company.com',
                phone: '010-1111-2222',
                active: true
            },
            {
                id: 2,
                name: '이관리자',
                role: 'asset_manager',
                department: '자산관리팀',
                email: 'lee.asset@company.com',
                phone: '010-3333-4444',
                active: true
            },
            {
                id: 3,
                name: '박이사',
                role: 'final_approver',
                department: '경영진',
                email: 'park.director@company.com',
                phone: '010-5555-6666',
                active: true
            },
            {
                id: 4,
                name: '최팀장',
                role: 'department_manager',
                department: '마케팅팀',
                email: 'choi.team@company.com',
                phone: '010-7777-8888',
                active: true
            }
        ];
    }

    /**
     * 새로운 반납 워크플로우 시작
     */
    async startWorkflow(returnRequest) {
        try {
            const workflow = {
                id: this.generateWorkflowId(),
                returnRequestId: returnRequest.id,
                assetId: returnRequest.assetId,
                requesterId: returnRequest.requesterId,
                currentStep: 'requested',
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                steps: [],
                metadata: {
                    assetName: returnRequest.assetName,
                    requesterName: returnRequest.requesterName,
                    department: returnRequest.department,
                    urgency: returnRequest.urgency || 'normal'
                }
            };

            // 첫 번째 단계 추가
            workflow.steps.push({
                stepId: 'requested',
                status: 'completed',
                completedAt: new Date().toISOString(),
                completedBy: returnRequest.requesterId,
                action: 'request_submitted',
                comments: returnRequest.comments || ''
            });

            // 다음 단계로 진행
            await this.moveToNextStep(workflow);

            this.currentWorkflow = workflow;
            console.log('워크플로우 시작:', workflow.id);
            
            return workflow;

        } catch (error) {
            console.error('워크플로우 시작 오류:', error);
            throw error;
        }
    }

    /**
     * 다음 단계로 진행
     */
    async moveToNextStep(workflow) {
        const currentStepConfig = this.workflowSteps[workflow.currentStep.toUpperCase()];
        
        if (!currentStepConfig || currentStepConfig.nextSteps.length === 0) {
            throw new Error('다음 단계가 없습니다.');
        }

        // 일반적으로 첫 번째 다음 단계로 진행 (승인 흐름)
        const nextStepId = currentStepConfig.nextSteps[0];
        workflow.currentStep = nextStepId;
        workflow.updatedAt = new Date().toISOString();

        // 새 단계 추가
        workflow.steps.push({
            stepId: nextStepId,
            status: 'pending',
            startedAt: new Date().toISOString(),
            assignedTo: await this.getAssignedApprover(nextStepId, workflow.metadata.department),
            action: 'step_started'
        });

        console.log(`워크플로우 ${workflow.id}: ${workflow.currentStep}로 진행`);
        return workflow;
    }

    /**
     * 승인 처리
     */
    async approveStep(workflowId, approverId, comments = '') {
        try {
            const workflow = await this.getWorkflow(workflowId);
            if (!workflow) {
                throw new Error('워크플로우를 찾을 수 없습니다.');
            }

            const currentStep = workflow.steps.find(step => 
                step.stepId === workflow.currentStep && step.status === 'pending'
            );

            if (!currentStep) {
                throw new Error('승인 가능한 단계가 없습니다.');
            }

            // 승인 권한 체크
            if (!await this.hasApprovalPermission(approverId, workflow.currentStep, workflow.metadata.department)) {
                throw new Error('승인 권한이 없습니다.');
            }

            // 현재 단계 완료 처리
            currentStep.status = 'completed';
            currentStep.completedAt = new Date().toISOString();
            currentStep.completedBy = approverId;
            currentStep.action = 'approved';
            currentStep.comments = comments;

            // 다음 단계로 진행
            const currentStepConfig = this.workflowSteps[workflow.currentStep.toUpperCase()];
            if (currentStepConfig.nextSteps.length > 0) {
                await this.moveToNextStep(workflow);
            }

            workflow.updatedAt = new Date().toISOString();

            // 알림 발송
            await this.sendApprovalNotification(workflow, 'approved');

            console.log(`워크플로우 ${workflowId} 승인 완료`);
            return workflow;

        } catch (error) {
            console.error('승인 처리 오류:', error);
            throw error;
        }
    }

    /**
     * 거부 처리
     */
    async rejectStep(workflowId, approverId, reason = '') {
        try {
            const workflow = await this.getWorkflow(workflowId);
            if (!workflow) {
                throw new Error('워크플로우를 찾을 수 없습니다.');
            }

            const currentStep = workflow.steps.find(step => 
                step.stepId === workflow.currentStep && step.status === 'pending'
            );

            if (!currentStep) {
                throw new Error('거부 가능한 단계가 없습니다.');
            }

            // 승인 권한 체크
            if (!await this.hasApprovalPermission(approverId, workflow.currentStep, workflow.metadata.department)) {
                throw new Error('거부 권한이 없습니다.');
            }

            // 현재 단계 완료 처리 (거부)
            currentStep.status = 'rejected';
            currentStep.completedAt = new Date().toISOString();
            currentStep.completedBy = approverId;
            currentStep.action = 'rejected';
            currentStep.comments = reason;

            // 워크플로우 상태를 거부로 변경
            workflow.currentStep = 'rejected';
            workflow.status = 'rejected';
            workflow.updatedAt = new Date().toISOString();

            // 거부 단계 추가
            workflow.steps.push({
                stepId: 'rejected',
                status: 'completed',
                completedAt: new Date().toISOString(),
                completedBy: approverId,
                action: 'workflow_rejected',
                comments: reason
            });

            // 알림 발송
            await this.sendApprovalNotification(workflow, 'rejected');

            console.log(`워크플로우 ${workflowId} 거부 완료`);
            return workflow;

        } catch (error) {
            console.error('거부 처리 오류:', error);
            throw error;
        }
    }

    /**
     * 워크플로우 조회
     */
    async getWorkflow(workflowId) {
        try {
            // 실제 구현에서는 API 호출
            // 현재는 메모리에서 조회
            if (this.currentWorkflow && this.currentWorkflow.id === workflowId) {
                return this.currentWorkflow;
            }
            
            // 모의 데이터 반환
            return await this.fetchWorkflow(workflowId);
        } catch (error) {
            console.error('워크플로우 조회 오류:', error);
            return null;
        }
    }

    /**
     * 워크플로우 데이터 가져오기 (모의)
     */
    async fetchWorkflow(workflowId) {
        // 모의 지연 시간
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 모의 워크플로우 데이터
        return {
            id: workflowId,
            returnRequestId: 'REQ-001',
            assetId: 'ASSET-001',
            requesterId: 'USER-001',
            currentStep: 'dept_approval',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            steps: [
                {
                    stepId: 'requested',
                    status: 'completed',
                    completedAt: new Date().toISOString(),
                    completedBy: 'USER-001',
                    action: 'request_submitted'
                }
            ],
            metadata: {
                assetName: '노트북 Dell XPS 13',
                requesterName: '홍길동',
                department: '개발팀',
                urgency: 'normal'
            }
        };
    }

    /**
     * 할당된 승인자 조회
     */
    async getAssignedApprover(stepId, department) {
        const stepConfig = this.workflowSteps[stepId.toUpperCase()];
        if (!stepConfig || !stepConfig.approverRole) {
            return null;
        }

        // 부서별 승인자 찾기
        const approver = this.approvers.find(a => 
            a.role === stepConfig.approverRole && 
            (stepConfig.approverRole !== 'department_manager' || a.department === department) &&
            a.active
        );

        return approver ? approver.id : null;
    }

    /**
     * 승인 권한 확인
     */
    async hasApprovalPermission(approverId, stepId, department) {
        const stepConfig = this.workflowSteps[stepId.toUpperCase()];
        if (!stepConfig || !stepConfig.approverRole) {
            return false;
        }

        const approver = this.approvers.find(a => a.id === approverId);
        if (!approver || !approver.active) {
            return false;
        }

        // 역할 확인
        if (approver.role !== stepConfig.approverRole) {
            return false;
        }

        // 부서장의 경우 부서 확인
        if (stepConfig.approverRole === 'department_manager' && approver.department !== department) {
            return false;
        }

        return true;
    }

    /**
     * 알림 발송
     */
    async sendApprovalNotification(workflow, action) {
        try {
            const notification = {
                workflowId: workflow.id,
                action: action,
                assetName: workflow.metadata.assetName,
                requesterName: workflow.metadata.requesterName,
                department: workflow.metadata.department,
                timestamp: new Date().toISOString()
            };

            // 요청자에게 알림
            await this.sendNotificationToUser(workflow.requesterId, notification);

            // 다음 승인자에게 알림 (승인된 경우)
            if (action === 'approved' && workflow.currentStep !== 'returned') {
                const assignedApprover = await this.getAssignedApprover(workflow.currentStep, workflow.metadata.department);
                if (assignedApprover) {
                    await this.sendNotificationToUser(assignedApprover, notification);
                }
            }

            console.log('알림 발송 완료:', notification);
        } catch (error) {
            console.error('알림 발송 오류:', error);
        }
    }

    /**
     * 사용자에게 알림 발송
     */
    async sendNotificationToUser(userId, notification) {
        // 실제 구현에서는 이메일, 푸시 알림 등 발송
        console.log(`사용자 ${userId}에게 알림 발송:`, notification);
    }

    /**
     * 워크플로우 상태 조회
     */
    getWorkflowStatus(workflow) {
        const currentStepConfig = this.workflowSteps[workflow.currentStep.toUpperCase()];
        
        return {
            id: workflow.id,
            currentStep: workflow.currentStep,
            currentStepName: currentStepConfig.name,
            currentStepDescription: currentStepConfig.description,
            status: workflow.status,
            canEdit: currentStepConfig.canEdit,
            canCancel: currentStepConfig.canCancel,
            progress: this.calculateProgress(workflow),
            nextSteps: currentStepConfig.nextSteps,
            assignedApprover: workflow.steps.find(s => s.stepId === workflow.currentStep)?.assignedTo,
            completedSteps: workflow.steps.filter(s => s.status === 'completed').length,
            totalSteps: this.getTotalSteps(),
            createdAt: workflow.createdAt,
            updatedAt: workflow.updatedAt
        };
    }

    /**
     * 진행률 계산
     */
    calculateProgress(workflow) {
        const completedSteps = workflow.steps.filter(s => s.status === 'completed').length;
        const totalSteps = this.getTotalSteps();
        return Math.round((completedSteps / totalSteps) * 100);
    }

    /**
     * 전체 단계 수 조회
     */
    getTotalSteps() {
        // 정상적인 승인 플로우의 단계 수
        return 5; // requested -> dept_approval -> asset_manager_approval -> final_approval -> approved -> returned
    }

    /**
     * 워크플로우 ID 생성
     */
    generateWorkflowId() {
        return 'WF-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 워크플로우 단계 정보 조회
     */
    getStepInfo(stepId) {
        return this.workflowSteps[stepId.toUpperCase()] || null;
    }

    /**
     * 사용자별 대기 중인 승인 목록 조회
     */
    async getPendingApprovals(approverId) {
        try {
            // 실제 구현에서는 API 호출
            const workflows = await this.fetchPendingWorkflows(approverId);
            
            return workflows.filter(workflow => {
                const currentStep = workflow.steps.find(step => 
                    step.stepId === workflow.currentStep && 
                    step.status === 'pending' &&
                    step.assignedTo === approverId
                );
                return currentStep !== undefined;
            });

        } catch (error) {
            console.error('대기 중인 승인 조회 오류:', error);
            return [];
        }
    }

    /**
     * 대기 중인 워크플로우 조회 (모의)
     */
    async fetchPendingWorkflows(approverId) {
        // 모의 지연 시간
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // 모의 데이터 반환
        return [];
    }

    /**
     * 상태 확인
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            currentWorkflow: this.currentWorkflow?.id || null,
            approversLoaded: this.approvers.length,
            workflowStepsCount: Object.keys(this.workflowSteps).length
        };
    }

    /**
     * 정리
     */
    cleanup() {
        this.currentWorkflow = null;
        this.approvers = [];
        this.isInitialized = false;
    }
}

// 전역 인스턴스 생성
window.returnWorkflowManager = new ReturnWorkflowManager(); 