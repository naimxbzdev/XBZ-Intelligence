export type CourierName = 'steadfast' | 'pathao' | 'redx' | 'carrybee' | 'paperfly';

export type CourierStatus = 
  | 'connected' 
  | 'not_configured' 
  | 'unsupported_lookup' 
  | 'temporarily_unavailable' 
  | 'sandbox_mode';

export interface CourierConfig {
  smartposApiKey?: string;
  smartposDomain?: string;
  steadfastApiKey?: string;
  steadfastSecretKey?: string;
  pathaoClientId?: string;
  pathaoClientSecret?: string;
  redxApiToken?: string;
  carrybeeApiKey?: string;
  paperflyKey?: string;
  enableSandbox?: boolean;
}

export interface SmartposCourierData {
  total: number;
  success: number;
  cancel: number;
  deliveredPercentage: number;
  returnPercentage: number;
  rating?: string;
  response_time?: number;
}

export interface SmartposCourierItem {
  status: boolean;
  message: string;
  data: SmartposCourierData;
}

export interface SmartposCommunityReport {
  id: number | string;
  reporter_name: string;
  incident_type: string;
  title: string;
  order_amount?: number;
  courier_name?: string;
  status?: string;
}

export interface SmartposApiResponse {
  phone: string;
  score: number;
  status: 'Safe' | 'Moderate Risk' | 'High Risk' | 'Blacklisted' | 'New Customer';
  source: 'database_cache' | 'live' | 'offline_fallback';
  total_parcel: number;
  success_parcel: number;
  cancel_parcel: number;
  unresolved_reports: number;
  community_reports: SmartposCommunityReport[];
  response: {
    steadfast: SmartposCourierItem;
    pathao: SmartposCourierItem;
    redx: SmartposCourierItem;
    carrybee: SmartposCourierItem;
    paperfly: SmartposCourierItem;
  };
}

export type PlanTier = 'free' | 'pro' | 'enterprise';

export type PaymentMethod = 'bkash' | 'nagad' | 'rocket';

export interface PaymentSubmission {
  id: string;
  planId: 'pro' | 'enterprise';
  planName: string;
  amountBDT: number;
  paymentMethod: PaymentMethod;
  senderNumber: string;
  transactionId: string;
  userEmail?: string;
  status: 'verified' | 'pending' | 'rejected';
  rejectionReason?: string;
  approvedAt?: string;
  rejectedAt?: string;
  customLimitGranted?: number;
  submittedAt: string;
}

export interface CourierResult {
  courier: CourierName;
  displayName: string;
  logo: string;
  status: CourierStatus;
  statusMessage: {
    bn: string;
    en: string;
  };
  totalOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  deliveryRate: number;
  returnRate?: number;
  rating?: string;
  responseTime?: number;
  lastActiveDate?: string;
  details?: Record<string, any>;
}

export interface FraudReport {
  id: string;
  phone: string;
  customerName?: string;
  reporterStore: string;
  reason: string;
  courierConsignment?: string;
  lossAmountBDT?: number;
  reportedAt: string;
  verified: boolean;
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'blacklisted' | 'new_customer';

export interface PhoneAnalysisResult {
  phone: string;
  normalizedPhone: string;
  operator: string;
  score: number; // 0 to 100 percentage rate (e.g. 97.14)
  status: 'Safe' | 'Moderate Risk' | 'High Risk' | 'Blacklisted' | 'New Customer';
  source: 'database_cache' | 'live' | 'offline_fallback';
  totalOrders: number; // total_parcel
  deliveredOrders: number; // success_parcel
  cancelledOrders: number; // cancel_parcel
  deliveryRate: number;
  returnRate: number;
  unresolvedReports: number;
  riskLevel: RiskLevel;
  riskScore: number;
  recommendation: {
    bn: string;
    en: string;
  };
  riskFactors: {
    bn: string[];
    en: string[];
  };
  courierBreakdown: Record<CourierName, CourierResult>;
  communityReports: SmartposCommunityReport[];
  legacyReports: FraudReport[];
  rawSmartpos?: SmartposApiResponse;
  searchedAt: string;
  isSandbox: boolean;
}

export interface CourierStatusInfo {
  courier: CourierName;
  displayName: string;
  status: CourierStatus;
  description: {
    bn: string;
    en: string;
  };
  phoneLookupSupported: boolean;
  officialDocUrl: string;
  requiredFields: string[];
}

export interface RecentSearchItem {
  phone: string;
  operator?: string;
  status?: string;
  riskLevel?: RiskLevel | string;
  score?: number;
  deliveryRate?: number;
  searchedAt: number;
}

export interface SmartposKeyConfig {
  id: string;
  name: string;
  apiKey: string;
  domain?: string;
  monthlyLimit: number;
  usageCount: number;
  status: 'active' | 'exhausted' | 'disabled' | 'error';
  lastUsedAt?: string;
  lastError?: string;
  createdAt: string;
}


