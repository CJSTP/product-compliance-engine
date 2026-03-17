export type ProductType =
  | 'bnpl' | 'crypto_exchange' | 'prepaid_card' | 'money_transfer'
  | 'personal_lending' | 'payment_app' | 'savings_deposit' | 'foreign_remittance';

export type CustomerSegment = 'consumer' | 'small_business' | 'enterprise';

export type WorkflowStage =
  | 'intake' | 'regulatory_assessment' | 'legal_review'
  | 'compliance_signoff' | 'approved' | 'rejected';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type RequirementStatus = 'pending' | 'complete' | 'waived' | 'blocked';

export type RequirementCategory =
  | 'federal_regulation' | 'state_licensing' | 'consumer_disclosure'
  | 'aml_bsa' | 'data_privacy' | 'prohibited_practices';

export interface ComplianceRequirement {
  id: number;
  category: RequirementCategory;
  title: string;
  description: string;
  regulation_ref: string | null;
  applies_to_states: string | null;
  status: RequirementStatus;
  is_blocking: boolean;
  notes: string | null;
  completed_at: string | null;
  completed_by: string | null;
}

export interface StageEvent {
  id: number;
  from_stage: WorkflowStage | null;
  to_stage: WorkflowStage;
  actor: string;
  notes: string | null;
  created_at: string;
}

export interface Product {
  id: number;
  product_id: string;
  name: string;
  product_type: ProductType;
  customer_segment: CustomerSegment;
  target_states: string;
  description: string | null;
  key_features: string | null;
  current_stage: WorkflowStage;
  risk_level: RiskLevel;
  risk_score: number;
  submitted_by: string;
  target_launch_date: string | null;
  created_at: string;
  updated_at: string;
  requirements: ComplianceRequirement[];
  stage_history: StageEvent[];
}

export interface DashboardStats {
  total: number;
  by_stage: Record<string, number>;
  by_risk: Record<string, number>;
  recent_products: Product[];
}
