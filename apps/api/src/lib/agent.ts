export type AgentRole = 'RootAgent' | 'ClientAgent' | 'AssignmentAgent' | 'ReadingAgent' | 'QCAgent' | 'BillingAgent';

export interface ToolContextState {
    request_id: string;
    current_agent: AgentRole;
    user_request: string;
    
    // Clinical Data
    examinee_info?: any;
    screening_id?: string;
    images?: any[];
    
    // Workflow Data
    assignment_id?: string;
    physician_id?: string;
    
    // Reading Data
    reading_result?: {
        findings_right: any;
        findings_left: any;
        judgment_code: string;
        referral_required: boolean;
        report_text: string;
    };
    
    // QC Data
    qc_status?: 'approved' | 'rejected';
    qc_feedback?: string;
    
    // Billing Data
    billing_summary?: any;
    
    // Metadata
    history: {
        agent: AgentRole;
        action: string;
        timestamp: string;
    }[];
}

export class RootAgent {
    private state: ToolContextState;

    constructor(initialRequest: string) {
        this.state = {
            request_id: crypto.randomUUID(),
            current_agent: 'RootAgent',
            user_request: initialRequest,
            history: []
        };
    }

    public async orchestrate(): Promise<ToolContextState> {
        this.logAction('RootAgent', 'Started orchestration');
        
        // 簡易的なルーティングロジック（実際はLLM等で判断）
        if (this.state.user_request.includes('登録')) {
            await this.delegateTo('ClientAgent');
        } else if (this.state.user_request.includes('割当')) {
            await this.delegateTo('AssignmentAgent');
        } else if (this.state.user_request.includes('読影')) {
            await this.delegateTo('ReadingAgent');
        } else if (this.state.user_request.includes('QC') || this.state.user_request.includes('検品')) {
            await this.delegateTo('QCAgent');
        } else if (this.state.user_request.includes('会計') || this.state.user_request.includes('請求')) {
            await this.delegateTo('BillingAgent');
        }

        this.logAction('RootAgent', 'Completed orchestration');
        return this.state;
    }

    private async delegateTo(agent: AgentRole) {
        this.state.current_agent = agent;
        this.logAction(agent, `Delegated task to ${agent}`);
        
        // 各エージェントのモック処理
        switch (agent) {
            case 'ClientAgent':
                this.state.screening_id = crypto.randomUUID();
                break;
            case 'AssignmentAgent':
                this.state.assignment_id = crypto.randomUUID();
                this.state.physician_id = crypto.randomUUID();
                break;
            case 'ReadingAgent':
                this.state.reading_result = {
                    findings_right: {},
                    findings_left: {},
                    judgment_code: 'A',
                    referral_required: false,
                    report_text: '異常なし'
                };
                break;
            case 'QCAgent':
                this.state.qc_status = 'approved';
                break;
            case 'BillingAgent':
                this.state.billing_summary = {
                    total_amount: 1000,
                    status: 'draft'
                };
                break;
        }
    }

    private logAction(agent: AgentRole, action: string) {
        this.state.history.push({
            agent,
            action,
            timestamp: new Date().toISOString()
        });
    }
}
