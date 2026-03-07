export interface Organization {
  id: string;
  name: string;
  created_at?: string;
}

export interface Physician {
  id: string;
  name: string;
  rank: '指導医' | '専門医' | '一般医';
  base_rate: number;
  created_at?: string;
}

export interface ScreeningData {
  id: string;
  examinee_number: string;
  patient_name: string;
  gender: string;
  birth_date: string;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  has_diabetes?: number;
  has_hypertension?: number;
  organization_id: string;
  organization_name?: string;
  screening_date: string;
  status: 'registered' | 'submitted' | 'assigned' | 'reading_completed' | 'completed' | 'confirmed' | 'rejected' | 'pending';
  urgency_flag: number;
  chief_complaint: string;
  physician_id?: string | null;
  physician_name?: string | null;
  judgment_code?: string;
  findings_right?: string;
  findings_left?: string;
  recommend_referral?: number;
  recommend_retest?: number;
  physician_comment?: string;
  hospital_name?: string;
  attending_physician?: string;
  patient_history?: string;
  created_at?: string;
  updated_at?: string;
  
  // Joined data
  images?: ScreeningImage[];
  messages?: ScreeningMessage[];
  reviews?: ReadingReview[];
  device_info?: {
    manufacturer: string;
    model: string;
    type: 'fundus' | 'oct' | 'multi';
  };
}

export interface ScreeningImage {
  id: string;
  screening_id: string;
  eye_side: 'right' | 'left';
  url: string;
  type?: 'fundus' | 'oct';
  created_at?: string;
}

export interface ScreeningMessage {
  id: string;
  screening_id: string;
  sender: string;
  content: string;
  created_at: string;
}

export interface ReadingReview {
  id: string;
  screening_id: string;
  reviewer_id: string;
  checklist_json: string;
  review_comment: string;
  result: 'approved' | 'rejected';
  reviewed_at: string;
}

export interface BillingData {
  period: string;
  client_billing: {
    total_count: number;
    base_revenue: number;
    urgent_count: number;
    urgent_revenue: number;
    ai_count: number;
    ai_revenue: number;
    total_revenue: number;
  };
  physician_payouts: {
    total_payout: number;
    details: PhysicianPayoutDetail[];
  };
  financial_summary: {
    gross_margin: number;
    margin_rate: number;
  };
}

export interface PhysicianPayoutDetail {
  id: string;
  name: string;
  rank: string;
  count: number;
  base_rate: number;
  regular_count: number;
  night_count: number;
  payout: number;
}

export interface ClientOrder {
  id: string;
  organization_id: string;
  order_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'billed';
  total_amount?: number;
  created_at?: string;
}

export interface CaseDiscussion {
  id: string;
  screening_id: string;
  topic: string;
  status: 'open' | 'resolved' | 'closed';
  created_at?: string;
  comments?: DiscussionComment[];
}

export interface DiscussionComment {
  id: string;
  discussion_id: string;
  user_id: string;
  content: string;
  created_at?: string;
}

export interface BillingPlan {
  id: string;
  name: string;
  base_price: number;
  volume_discount_json?: string;
  created_at?: string;
}

export interface PayoutTier {
  id: string;
  rank: string;
  base_rate: number;
  night_multiplier: number;
  created_at?: string;
}

export interface Role {
  id: string;
  name: string;
  permissions_json: string;
  created_at?: string;
}
