// Mock data derived from real T-AMPLIFYCRM.csv statistics (10,000 accounts)
// Subset of 50 representative customers for the demo UI
// Real stats: Starter 4439 (62.7% churn), Professional 4011 (15.1% churn), Enterprise 1550 (0% churn)

export type OnboardingStep = 'profile' | 'first_login' | 'feature_use' | 'integration' | 'first_export'

export interface Customer {
  id: string
  name: string
  email: string
  company: string
  tier: 'starter' | 'professional' | 'enterprise'
  healthScore: number
  churnRisk: number
  mrr: number
  arr: number
  nps: number
  lastLogin: string
  loginsPerWeek: number
  featuresUsed: number
  totalFeatures: number
  integrations: number
  supportTickets: number
  apiCalls?: number
  apiTrend?: number
  daysSinceLogin: number
  onboardingDay?: number
  onboardingSteps?: Record<OnboardingStep, boolean>
  onboardingStatus?: 'on_track' | 'stuck' | 'done'
  stuckDays?: number
  upsellReady?: boolean
  upsellValue?: number
  monthsOnPlan?: number
  lastEmailSubject?: string
  lastEmailTime?: string
  industry: string
  companySize: string
}

export interface FeedItem {
  id: string
  timestamp: number // seconds ago
  agentType: 'starter' | 'professional' | 'enterprise'
  action: string
  customerId: string
  customerName: string
  details: string
  hasEmail: boolean
  emailPreview?: { subject: string; body: string }
  severity: 'info' | 'warning' | 'critical'
}

// === STARTER CUSTOMERS (18) ===
export const starterCustomers: Customer[] = [
  { id: 'HS001', name: 'Sarah Kim', email: 'sarah@startupflow.io', company: 'StartupFlow', tier: 'starter', healthScore: 78, churnRisk: 18, mrr: 123, arr: 1476, nps: 7, lastLogin: '2h ago', loginsPerWeek: 4.1, featuresUsed: 3, totalFeatures: 5, integrations: 1, supportTickets: 1, daysSinceLogin: 0, onboardingDay: 2, onboardingSteps: { profile: true, first_login: true, feature_use: true, integration: false, first_export: false }, onboardingStatus: 'on_track', lastEmailSubject: 'Welcome to the platform!', lastEmailTime: '2h ago', industry: 'Technology', companySize: '11-50' },
  { id: 'HS002', name: 'Mike Torres', email: 'mike@agencypro.com', company: 'AgencyPro', tier: 'starter', healthScore: 42, churnRisk: 62, mrr: 100, arr: 1200, nps: 3, lastLogin: '5d ago', loginsPerWeek: 0.8, featuresUsed: 2, totalFeatures: 5, integrations: 0, supportTickets: 3, daysSinceLogin: 5, onboardingDay: 5, onboardingSteps: { profile: true, first_login: true, feature_use: false, integration: false, first_export: false }, onboardingStatus: 'stuck', stuckDays: 3, lastEmailSubject: 'Need help getting started?', lastEmailTime: '1d ago', industry: 'Marketing & Advertising', companySize: '1-10' },
  { id: 'HS003', name: 'Lisa Chen', email: 'lisa@growthlab.co', company: 'GrowthLab', tier: 'starter', healthScore: 92, churnRisk: 5, mrr: 135, arr: 1620, nps: 9, lastLogin: '1h ago', loginsPerWeek: 6.2, featuresUsed: 5, totalFeatures: 5, integrations: 2, supportTickets: 0, daysSinceLogin: 0, onboardingDay: 8, onboardingSteps: { profile: true, first_login: true, feature_use: true, integration: true, first_export: true }, onboardingStatus: 'done', lastEmailSubject: 'You\'re all set!', lastEmailTime: '3d ago', industry: 'Technology', companySize: '11-50' },
  { id: 'HS004', name: 'James Rivera', email: 'james@localshop.io', company: 'LocalShop', tier: 'starter', healthScore: 65, churnRisk: 35, mrr: 110, arr: 1320, nps: 5, lastLogin: '3d ago', loginsPerWeek: 2.1, featuresUsed: 3, totalFeatures: 5, integrations: 1, supportTickets: 2, daysSinceLogin: 3, onboardingDay: 4, onboardingSteps: { profile: true, first_login: true, feature_use: true, integration: false, first_export: false }, onboardingStatus: 'on_track', lastEmailSubject: 'Your next step: integrations', lastEmailTime: '6h ago', industry: 'E-commerce', companySize: '1-10' },
  { id: 'HS005', name: 'Priya Patel', email: 'priya@healthfirst.com', company: 'HealthFirst', tier: 'starter', healthScore: 38, churnRisk: 71, mrr: 100, arr: 1200, nps: 2, lastLogin: '12d ago', loginsPerWeek: 0.3, featuresUsed: 1, totalFeatures: 5, integrations: 0, supportTickets: 5, daysSinceLogin: 12, onboardingDay: 14, onboardingSteps: { profile: true, first_login: false, feature_use: false, integration: false, first_export: false }, onboardingStatus: 'stuck', stuckDays: 10, lastEmailSubject: 'We miss you!', lastEmailTime: '2d ago', industry: 'Healthcare', companySize: '11-50' },
  { id: 'HS006', name: 'David Park', email: 'david@codesmith.dev', company: 'CodeSmith', tier: 'starter', healthScore: 85, churnRisk: 10, mrr: 123, arr: 1476, nps: 8, lastLogin: '4h ago', loginsPerWeek: 5.0, featuresUsed: 4, totalFeatures: 5, integrations: 2, supportTickets: 0, daysSinceLogin: 0, onboardingDay: 6, onboardingSteps: { profile: true, first_login: true, feature_use: true, integration: true, first_export: false }, onboardingStatus: 'on_track', lastEmailSubject: 'Almost there!', lastEmailTime: '1d ago', industry: 'Technology', companySize: '1-10' },
  { id: 'HS007', name: 'Emma Watson', email: 'emma@brandcraft.co', company: 'BrandCraft', tier: 'starter', healthScore: 55, churnRisk: 45, mrr: 100, arr: 1200, nps: 5, lastLogin: '6d ago', loginsPerWeek: 1.2, featuresUsed: 2, totalFeatures: 5, integrations: 0, supportTickets: 2, daysSinceLogin: 6, onboardingDay: 9, onboardingSteps: { profile: true, first_login: true, feature_use: false, integration: false, first_export: false }, onboardingStatus: 'stuck', stuckDays: 5, industry: 'Marketing & Advertising', companySize: '1-10' },
  { id: 'HS008', name: 'Carlos Ruiz', email: 'carlos@shipfast.io', company: 'ShipFast', tier: 'starter', healthScore: 88, churnRisk: 8, mrr: 135, arr: 1620, nps: 8, lastLogin: '30m ago', loginsPerWeek: 5.5, featuresUsed: 4, totalFeatures: 5, integrations: 1, supportTickets: 1, daysSinceLogin: 0, onboardingDay: 7, onboardingSteps: { profile: true, first_login: true, feature_use: true, integration: true, first_export: false }, onboardingStatus: 'on_track', industry: 'E-commerce', companySize: '11-50' },
  { id: 'HS009', name: 'Nina Johnson', email: 'nina@finwise.com', company: 'FinWise', tier: 'starter', healthScore: 72, churnRisk: 25, mrr: 110, arr: 1320, nps: 6, lastLogin: '1d ago', loginsPerWeek: 3.2, featuresUsed: 3, totalFeatures: 5, integrations: 1, supportTickets: 1, daysSinceLogin: 1, onboardingDay: 5, onboardingSteps: { profile: true, first_login: true, feature_use: true, integration: false, first_export: false }, onboardingStatus: 'on_track', industry: 'Financial Services', companySize: '1-10' },
  { id: 'HS010', name: 'Alex Thompson', email: 'alex@learnhub.edu', company: 'LearnHub', tier: 'starter', healthScore: 81, churnRisk: 15, mrr: 123, arr: 1476, nps: 7, lastLogin: '3h ago', loginsPerWeek: 4.5, featuresUsed: 4, totalFeatures: 5, integrations: 1, supportTickets: 0, daysSinceLogin: 0, onboardingDay: 10, onboardingSteps: { profile: true, first_login: true, feature_use: true, integration: true, first_export: false }, onboardingStatus: 'on_track', industry: 'Education', companySize: '11-50' },
  { id: 'HS011', name: 'Olivia Brown', email: 'olivia@propmanage.io', company: 'PropManage', tier: 'starter', healthScore: 90, churnRisk: 6, mrr: 135, arr: 1620, nps: 9, lastLogin: '1h ago', loginsPerWeek: 5.8, featuresUsed: 5, totalFeatures: 5, integrations: 2, supportTickets: 0, daysSinceLogin: 0, onboardingDay: 12, onboardingSteps: { profile: true, first_login: true, feature_use: true, integration: true, first_export: true }, onboardingStatus: 'done', industry: 'Real Estate', companySize: '11-50' },
  { id: 'HS012', name: 'Ryan Lee', email: 'ryan@quickserve.com', company: 'QuickServe', tier: 'starter', healthScore: 48, churnRisk: 55, mrr: 100, arr: 1200, nps: 4, lastLogin: '8d ago', loginsPerWeek: 0.6, featuresUsed: 1, totalFeatures: 5, integrations: 0, supportTickets: 4, daysSinceLogin: 8, onboardingDay: 11, onboardingSteps: { profile: true, first_login: true, feature_use: false, integration: false, first_export: false }, onboardingStatus: 'stuck', stuckDays: 7, industry: 'Professional Services', companySize: '1-10' },
  { id: 'HS013', name: 'Sophie Martin', email: 'sophie@craftco.co', company: 'CraftCo', tier: 'starter', healthScore: 75, churnRisk: 22, mrr: 123, arr: 1476, nps: 7, lastLogin: '1d ago', loginsPerWeek: 3.8, featuresUsed: 3, totalFeatures: 5, integrations: 1, supportTickets: 1, daysSinceLogin: 1, onboardingDay: 6, onboardingSteps: { profile: true, first_login: true, feature_use: true, integration: false, first_export: false }, onboardingStatus: 'on_track', industry: 'Manufacturing', companySize: '11-50' },
  { id: 'HS014', name: 'Tyler Adams', email: 'tyler@mediapulse.io', company: 'MediaPulse', tier: 'starter', healthScore: 68, churnRisk: 30, mrr: 110, arr: 1320, nps: 6, lastLogin: '2d ago', loginsPerWeek: 2.5, featuresUsed: 3, totalFeatures: 5, integrations: 0, supportTickets: 1, daysSinceLogin: 2, onboardingDay: 4, onboardingSteps: { profile: true, first_login: true, feature_use: true, integration: false, first_export: false }, onboardingStatus: 'on_track', industry: 'Marketing & Advertising', companySize: '1-10' },
  { id: 'HS015', name: 'Aisha Khan', email: 'aisha@cloudnine.tech', company: 'CloudNine', tier: 'starter', healthScore: 82, churnRisk: 14, mrr: 135, arr: 1620, nps: 8, lastLogin: '5h ago', loginsPerWeek: 4.8, featuresUsed: 4, totalFeatures: 5, integrations: 1, supportTickets: 0, daysSinceLogin: 0, onboardingDay: 9, onboardingSteps: { profile: true, first_login: true, feature_use: true, integration: true, first_export: false }, onboardingStatus: 'on_track', industry: 'Technology', companySize: '11-50' },
  { id: 'HS016', name: 'Ben Cooper', email: 'ben@supplyhub.com', company: 'SupplyHub', tier: 'starter', healthScore: 60, churnRisk: 40, mrr: 100, arr: 1200, nps: 5, lastLogin: '4d ago', loginsPerWeek: 1.5, featuresUsed: 2, totalFeatures: 5, integrations: 0, supportTickets: 2, daysSinceLogin: 4, onboardingDay: 7, onboardingSteps: { profile: true, first_login: true, feature_use: false, integration: false, first_export: false }, onboardingStatus: 'stuck', stuckDays: 2, industry: 'E-commerce', companySize: '1-10' },
  { id: 'HS017', name: 'Maria Garcia', email: 'maria@fittrack.co', company: 'FitTrack', tier: 'starter', healthScore: 87, churnRisk: 9, mrr: 123, arr: 1476, nps: 8, lastLogin: '2h ago', loginsPerWeek: 5.2, featuresUsed: 4, totalFeatures: 5, integrations: 2, supportTickets: 0, daysSinceLogin: 0, onboardingDay: 8, onboardingSteps: { profile: true, first_login: true, feature_use: true, integration: true, first_export: true }, onboardingStatus: 'done', industry: 'Healthcare', companySize: '11-50' },
  { id: 'HS018', name: 'Ethan Wright', email: 'ethan@nexusai.io', company: 'NexusAI', tier: 'starter', healthScore: 70, churnRisk: 28, mrr: 110, arr: 1320, nps: 6, lastLogin: '2d ago', loginsPerWeek: 2.8, featuresUsed: 3, totalFeatures: 5, integrations: 1, supportTickets: 1, daysSinceLogin: 2, onboardingDay: 3, onboardingSteps: { profile: true, first_login: true, feature_use: false, integration: false, first_export: false }, onboardingStatus: 'on_track', industry: 'Technology', companySize: '1-10' },
]

// === PROFESSIONAL CUSTOMERS (22) ===
export const professionalCustomers: Customer[] = [
  { id: 'HP001', name: 'John Davidson', email: 'john@techcorp.com', company: 'TechCorp', tier: 'professional', healthScore: 88, churnRisk: 8, mrr: 2200, arr: 26400, nps: 9, lastLogin: 'today', loginsPerWeek: 5.2, featuresUsed: 9, totalFeatures: 12, integrations: 6, supportTickets: 1, daysSinceLogin: 0, upsellReady: true, upsellValue: 12000, monthsOnPlan: 6, lastEmailSubject: 'Your monthly summary', lastEmailTime: '3d ago', industry: 'Technology', companySize: '51-200' },
  { id: 'HP002', name: 'Amy Chen', email: 'amy@growthlab.io', company: 'GrowthLab Pro', tier: 'professional', healthScore: 44, churnRisk: 72, mrr: 1800, arr: 21600, nps: 3, lastLogin: '9d ago', loginsPerWeek: 0.4, featuresUsed: 3, totalFeatures: 12, integrations: 1, supportTickets: 5, daysSinceLogin: 9, monthsOnPlan: 2, lastEmailSubject: 'We noticed you\'ve been away', lastEmailTime: '1d ago', industry: 'Marketing & Advertising', companySize: '11-50' },
  { id: 'HP003', name: 'Rachel Lee', email: 'rachel@momentum.co', company: 'Momentum Co', tier: 'professional', healthScore: 82, churnRisk: 12, mrr: 2000, arr: 24000, nps: 8, lastLogin: '1d ago', loginsPerWeek: 4.5, featuresUsed: 8, totalFeatures: 12, integrations: 5, supportTickets: 0, daysSinceLogin: 1, upsellReady: true, upsellValue: 9600, monthsOnPlan: 8, industry: 'Professional Services', companySize: '51-200' },
  { id: 'HP004', name: 'Sam Park', email: 'sam@buildfast.io', company: 'BuildFast', tier: 'professional', healthScore: 79, churnRisk: 15, mrr: 1900, arr: 22800, nps: 7, lastLogin: '2d ago', loginsPerWeek: 3.8, featuresUsed: 7, totalFeatures: 12, integrations: 4, supportTickets: 1, daysSinceLogin: 2, upsellReady: true, upsellValue: 8400, monthsOnPlan: 5, industry: 'Technology', companySize: '11-50' },
  { id: 'HP005', name: 'Diana Ross', email: 'diana@quickscale.co', company: 'QuickScale', tier: 'professional', healthScore: 76, churnRisk: 18, mrr: 2100, arr: 25200, nps: 7, lastLogin: '3d ago', loginsPerWeek: 3.2, featuresUsed: 7, totalFeatures: 12, integrations: 4, supportTickets: 2, daysSinceLogin: 3, upsellReady: true, upsellValue: 10800, monthsOnPlan: 7, industry: 'E-commerce', companySize: '51-200' },
  { id: 'HP006', name: 'Tom Walsh', email: 'tom@nextlevel.com', company: 'NextLevel', tier: 'professional', healthScore: 71, churnRisk: 22, mrr: 1700, arr: 20400, nps: 6, lastLogin: '4d ago', loginsPerWeek: 2.8, featuresUsed: 6, totalFeatures: 12, integrations: 3, supportTickets: 2, daysSinceLogin: 4, upsellReady: true, upsellValue: 7400, monthsOnPlan: 4, industry: 'Financial Services', companySize: '11-50' },
  { id: 'HP007', name: 'Jessica Wang', email: 'jessica@dataflow.ai', company: 'DataFlow', tier: 'professional', healthScore: 52, churnRisk: 58, mrr: 2000, arr: 24000, nps: 4, lastLogin: '7d ago', loginsPerWeek: 1.1, featuresUsed: 4, totalFeatures: 12, integrations: 2, supportTickets: 4, daysSinceLogin: 7, monthsOnPlan: 3, industry: 'Technology', companySize: '51-200' },
  { id: 'HP008', name: 'Kevin Moore', email: 'kevin@salesengine.io', company: 'SalesEngine', tier: 'professional', healthScore: 85, churnRisk: 10, mrr: 2200, arr: 26400, nps: 8, lastLogin: 'today', loginsPerWeek: 5.0, featuresUsed: 8, totalFeatures: 12, integrations: 5, supportTickets: 0, daysSinceLogin: 0, upsellReady: true, upsellValue: 9200, monthsOnPlan: 9, industry: 'Professional Services', companySize: '201-500' },
  { id: 'HP009', name: 'Laura White', email: 'laura@marketpeak.co', company: 'MarketPeak', tier: 'professional', healthScore: 68, churnRisk: 28, mrr: 1800, arr: 21600, nps: 6, lastLogin: '5d ago', loginsPerWeek: 2.0, featuresUsed: 5, totalFeatures: 12, integrations: 3, supportTickets: 3, daysSinceLogin: 5, monthsOnPlan: 4, industry: 'Marketing & Advertising', companySize: '11-50' },
  { id: 'HP010', name: 'Chris Taylor', email: 'chris@logisticshub.com', company: 'LogisticsHub', tier: 'professional', healthScore: 90, churnRisk: 6, mrr: 2400, arr: 28800, nps: 9, lastLogin: 'today', loginsPerWeek: 5.8, featuresUsed: 10, totalFeatures: 12, integrations: 7, supportTickets: 0, daysSinceLogin: 0, monthsOnPlan: 12, industry: 'Manufacturing', companySize: '201-500' },
  { id: 'HP011', name: 'Megan Harris', email: 'megan@brandvault.io', company: 'BrandVault', tier: 'professional', healthScore: 74, churnRisk: 20, mrr: 1900, arr: 22800, nps: 7, lastLogin: '2d ago', loginsPerWeek: 3.5, featuresUsed: 6, totalFeatures: 12, integrations: 3, supportTickets: 1, daysSinceLogin: 2, monthsOnPlan: 6, industry: 'Marketing & Advertising', companySize: '51-200' },
  { id: 'HP012', name: 'Daniel Kim', email: 'daniel@finedge.com', company: 'FinEdge', tier: 'professional', healthScore: 62, churnRisk: 35, mrr: 2100, arr: 25200, nps: 5, lastLogin: '6d ago', loginsPerWeek: 1.5, featuresUsed: 5, totalFeatures: 12, integrations: 2, supportTickets: 3, daysSinceLogin: 6, monthsOnPlan: 3, industry: 'Financial Services', companySize: '51-200' },
  { id: 'HP013', name: 'Ashley Brown', email: 'ashley@healthwave.co', company: 'HealthWave', tier: 'professional', healthScore: 77, churnRisk: 17, mrr: 2000, arr: 24000, nps: 7, lastLogin: '1d ago', loginsPerWeek: 3.9, featuresUsed: 7, totalFeatures: 12, integrations: 4, supportTickets: 1, daysSinceLogin: 1, monthsOnPlan: 7, industry: 'Healthcare', companySize: '51-200' },
  { id: 'HP014', name: 'Brian Scott', email: 'brian@retailmax.com', company: 'RetailMax', tier: 'professional', healthScore: 58, churnRisk: 42, mrr: 1700, arr: 20400, nps: 5, lastLogin: '7d ago', loginsPerWeek: 1.3, featuresUsed: 4, totalFeatures: 12, integrations: 2, supportTickets: 4, daysSinceLogin: 7, monthsOnPlan: 2, industry: 'E-commerce', companySize: '11-50' },
  { id: 'HP015', name: 'Emily Davis', email: 'emily@edupath.io', company: 'EduPath', tier: 'professional', healthScore: 83, churnRisk: 11, mrr: 1800, arr: 21600, nps: 8, lastLogin: 'today', loginsPerWeek: 4.8, featuresUsed: 8, totalFeatures: 12, integrations: 5, supportTickets: 0, daysSinceLogin: 0, monthsOnPlan: 10, industry: 'Education', companySize: '51-200' },
  { id: 'HP016', name: 'Mark Johnson', email: 'mark@proptech.co', company: 'PropTech', tier: 'professional', healthScore: 69, churnRisk: 26, mrr: 2000, arr: 24000, nps: 6, lastLogin: '4d ago', loginsPerWeek: 2.2, featuresUsed: 5, totalFeatures: 12, integrations: 3, supportTickets: 2, daysSinceLogin: 4, monthsOnPlan: 5, industry: 'Real Estate', companySize: '11-50' },
  { id: 'HP017', name: 'Sarah Miller', email: 'sarah@cleantech.io', company: 'CleanTech', tier: 'professional', healthScore: 86, churnRisk: 9, mrr: 2200, arr: 26400, nps: 8, lastLogin: 'today', loginsPerWeek: 5.1, featuresUsed: 9, totalFeatures: 12, integrations: 6, supportTickets: 0, daysSinceLogin: 0, monthsOnPlan: 8, industry: 'Technology', companySize: '201-500' },
  { id: 'HP018', name: 'Andrew Clark', email: 'andrew@mediavine.co', company: 'MediaVine', tier: 'professional', healthScore: 73, churnRisk: 21, mrr: 1900, arr: 22800, nps: 7, lastLogin: '2d ago', loginsPerWeek: 3.4, featuresUsed: 6, totalFeatures: 12, integrations: 3, supportTickets: 1, daysSinceLogin: 2, monthsOnPlan: 6, industry: 'Marketing & Advertising', companySize: '51-200' },
  { id: 'HP019', name: 'Nicole Zhang', email: 'nicole@insureplus.com', company: 'InsurePlus', tier: 'professional', healthScore: 80, churnRisk: 14, mrr: 2100, arr: 25200, nps: 8, lastLogin: '1d ago', loginsPerWeek: 4.2, featuresUsed: 8, totalFeatures: 12, integrations: 5, supportTickets: 0, daysSinceLogin: 1, monthsOnPlan: 9, industry: 'Financial Services', companySize: '201-500' },
  { id: 'HP020', name: 'Jason Lee', email: 'jason@automate.io', company: 'AutomateIO', tier: 'professional', healthScore: 91, churnRisk: 5, mrr: 2400, arr: 28800, nps: 9, lastLogin: 'today', loginsPerWeek: 6.0, featuresUsed: 10, totalFeatures: 12, integrations: 7, supportTickets: 0, daysSinceLogin: 0, monthsOnPlan: 14, industry: 'Technology', companySize: '201-500' },
  { id: 'HP021', name: 'Anna Wilson', email: 'anna@luxebrands.co', company: 'LuxeBrands', tier: 'professional', healthScore: 66, churnRisk: 30, mrr: 1800, arr: 21600, nps: 6, lastLogin: '5d ago', loginsPerWeek: 1.8, featuresUsed: 5, totalFeatures: 12, integrations: 2, supportTickets: 2, daysSinceLogin: 5, monthsOnPlan: 3, industry: 'E-commerce', companySize: '11-50' },
  { id: 'HP022', name: 'Robert Chen', email: 'robert@fundrise.com', company: 'FundRise', tier: 'professional', healthScore: 75, churnRisk: 19, mrr: 2000, arr: 24000, nps: 7, lastLogin: '1d ago', loginsPerWeek: 3.6, featuresUsed: 7, totalFeatures: 12, integrations: 4, supportTickets: 1, daysSinceLogin: 1, monthsOnPlan: 7, industry: 'Financial Services', companySize: '51-200' },
]

// === ENTERPRISE CUSTOMERS (10) ===
export const enterpriseCustomers: Customer[] = [
  { id: 'HE001', name: 'James Mitchell', email: 'james@acmecorp.com', company: 'Acme Corp', tier: 'enterprise', healthScore: 22, churnRisk: 94, mrr: 31666, arr: 380000, nps: 2, lastLogin: '18d ago', loginsPerWeek: 0.3, featuresUsed: 2, totalFeatures: 15, integrations: 3, supportTickets: 4, apiCalls: 120, apiTrend: -91, daysSinceLogin: 18, industry: 'Manufacturing', companySize: '1000+' },
  { id: 'HE002', name: 'Patricia Nguyen', email: 'patricia@globex.com', company: 'Globex', tier: 'enterprise', healthScore: 38, churnRisk: 74, mrr: 24166, arr: 290000, nps: 4, lastLogin: '14d ago', loginsPerWeek: 0.8, featuresUsed: 5, totalFeatures: 15, integrations: 4, supportTickets: 6, apiCalls: 340, apiTrend: -62, daysSinceLogin: 14, industry: 'Technology', companySize: '501-1000' },
  { id: 'HE003', name: 'Robert Johnson', email: 'robert@initech.com', company: 'Initech', tier: 'enterprise', healthScore: 82, churnRisk: 12, mrr: 17500, arr: 210000, nps: 8, lastLogin: '1d ago', loginsPerWeek: 4.5, featuresUsed: 12, totalFeatures: 15, integrations: 8, supportTickets: 1, apiCalls: 2800, apiTrend: 15, daysSinceLogin: 1, industry: 'Technology', companySize: '201-500' },
  { id: 'HE004', name: 'Susan Williams', email: 'susan@umbrellacorp.com', company: 'Umbrella Corp', tier: 'enterprise', healthScore: 55, churnRisk: 48, mrr: 28333, arr: 340000, nps: 5, lastLogin: '8d ago', loginsPerWeek: 1.5, featuresUsed: 7, totalFeatures: 15, integrations: 5, supportTickets: 3, apiCalls: 890, apiTrend: -34, daysSinceLogin: 8, industry: 'Healthcare', companySize: '1000+' },
  { id: 'HE005', name: 'Michael Brown', email: 'michael@massivedyn.com', company: 'Massive Dynamics', tier: 'enterprise', healthScore: 85, churnRisk: 10, mrr: 15000, arr: 180000, nps: 8, lastLogin: 'today', loginsPerWeek: 5.1, featuresUsed: 13, totalFeatures: 15, integrations: 9, supportTickets: 0, apiCalls: 3200, apiTrend: 22, daysSinceLogin: 0, industry: 'Professional Services', companySize: '201-500' },
  { id: 'HE006', name: 'Jennifer Davis', email: 'jennifer@dynacorp.io', company: 'DynaCorp', tier: 'enterprise', healthScore: 79, churnRisk: 15, mrr: 21666, arr: 260000, nps: 7, lastLogin: '2d ago', loginsPerWeek: 4.0, featuresUsed: 11, totalFeatures: 15, integrations: 7, supportTickets: 1, apiCalls: 2100, apiTrend: 8, daysSinceLogin: 2, industry: 'Financial Services', companySize: '501-1000' },
  { id: 'HE007', name: 'David Anderson', email: 'david@hooli.com', company: 'Hooli', tier: 'enterprise', healthScore: 88, churnRisk: 7, mrr: 25833, arr: 310000, nps: 9, lastLogin: 'today', loginsPerWeek: 5.8, featuresUsed: 14, totalFeatures: 15, integrations: 10, supportTickets: 0, apiCalls: 4500, apiTrend: 31, daysSinceLogin: 0, industry: 'Technology', companySize: '1000+' },
  { id: 'HE008', name: 'Lisa Thompson', email: 'lisa@piedmont.co', company: 'Piedmont', tier: 'enterprise', healthScore: 60, churnRisk: 42, mrr: 12500, arr: 150000, nps: 5, lastLogin: '6d ago', loginsPerWeek: 1.8, featuresUsed: 8, totalFeatures: 15, integrations: 5, supportTickets: 2, apiCalls: 780, apiTrend: -18, daysSinceLogin: 6, industry: 'E-commerce', companySize: '201-500' },
  { id: 'HE009', name: 'William Garcia', email: 'william@apex.io', company: 'Apex Industries', tier: 'enterprise', healthScore: 92, churnRisk: 4, mrr: 16666, arr: 200000, nps: 9, lastLogin: 'today', loginsPerWeek: 6.2, featuresUsed: 14, totalFeatures: 15, integrations: 10, supportTickets: 0, apiCalls: 5100, apiTrend: 28, daysSinceLogin: 0, industry: 'Professional Services', companySize: '1000+' },
  { id: 'HE010', name: 'Karen Martinez', email: 'karen@zenith.com', company: 'Zenith Corp', tier: 'enterprise', healthScore: 76, churnRisk: 18, mrr: 6666, arr: 80000, nps: 7, lastLogin: '3d ago', loginsPerWeek: 3.5, featuresUsed: 10, totalFeatures: 15, integrations: 6, supportTickets: 1, apiCalls: 1900, apiTrend: 5, daysSinceLogin: 3, industry: 'Manufacturing', companySize: '501-1000' },
]

// === LIVE FEED ITEMS ===
export const feedItems: FeedItem[] = [
  { id: 'f1', timestamp: 2, agentType: 'starter', action: 'Sent welcome email to Sarah K.', customerId: 'HS001', customerName: 'Sarah Kim', details: 'Welcome sequence initiated', hasEmail: true, emailPreview: { subject: 'Welcome to RetainIQ, Sarah!', body: 'Hey Sarah, welcome to the platform! Here\'s a quick 3-step guide to get you started...' }, severity: 'info' },
  { id: 'f2', timestamp: 12, agentType: 'starter', action: 'Analyzing Mike Torres — stuck 3 days', customerId: 'HS002', customerName: 'Mike Torres', details: 'Onboarding stuck at feature_use step', hasEmail: false, severity: 'warning' },
  { id: 'f3', timestamp: 28, agentType: 'starter', action: 'Claude AI generating follow-up email...', customerId: 'HS002', customerName: 'Mike Torres', details: 'Generating personalized follow-up', hasEmail: false, severity: 'info' },
  { id: 'f4', timestamp: 45, agentType: 'enterprise', action: 'Churn risk detected: Acme Corp', customerId: 'HE001', customerName: 'James Mitchell', details: 'Login frequency down 91%, only 2/15 features active', hasEmail: false, severity: 'critical' },
  { id: 'f5', timestamp: 60, agentType: 'enterprise', action: 'Alert emailed to James (Account Mgr)', customerId: 'HE001', customerName: 'James Mitchell', details: 'Critical churn alert sent', hasEmail: true, emailPreview: { subject: 'CRITICAL: Acme Corp churn risk — immediate action needed', body: 'Acme Corp ($380K ARR) shows critical churn signals. Login frequency dropped 91%. Emergency QBR recommended within 7 days.' }, severity: 'critical' },
  { id: 'f6', timestamp: 120, agentType: 'professional', action: 'Upsell email queued: John D.', customerId: 'HP001', customerName: 'John Davidson', details: 'Enterprise upgrade — $12,000/yr opportunity', hasEmail: true, emailPreview: { subject: 'You\'re ready for more, John 🚀', body: 'Hi John, you\'ve been making the most of Professional — your team has used 9 out of 12 features this month. Customers like you typically unlock 3x more value when they move to Enterprise...' }, severity: 'info' },
  { id: 'f7', timestamp: 180, agentType: 'starter', action: 'Step completed: first_login ✅', customerId: 'HS018', customerName: 'Ethan Wright', details: 'Onboarding milestone reached', hasEmail: false, severity: 'info' },
  { id: 'f8', timestamp: 240, agentType: 'professional', action: 'Churn risk HIGH detected: Amy Chen 🔴', customerId: 'HP002', customerName: 'Amy Chen', details: 'Engagement dropped sharply after week 3', hasEmail: false, severity: 'critical' },
  { id: 'f9', timestamp: 300, agentType: 'professional', action: 'Re-engagement email queued: Amy Chen', customerId: 'HP002', customerName: 'Amy Chen', details: 'Personalized re-engagement with 1:1 call offer', hasEmail: true, emailPreview: { subject: 'Amy, let\'s get you back on track', body: 'Hi Amy, we noticed you haven\'t logged in for 9 days. We\'d love to schedule a quick 15-min call to help you get more value from the platform...' }, severity: 'warning' },
  { id: 'f10', timestamp: 360, agentType: 'enterprise', action: 'Login scan complete: 10 customers done ✅', customerId: '', customerName: '', details: 'All enterprise accounts scanned', hasEmail: false, severity: 'info' },
  { id: 'f11', timestamp: 420, agentType: 'enterprise', action: 'Globex: no login 14d — HIGH risk flagged', customerId: 'HE002', customerName: 'Patricia Nguyen', details: '$290K ARR at risk', hasEmail: false, severity: 'critical' },
  { id: 'f12', timestamp: 480, agentType: 'enterprise', action: 'Weekly report written to Drive: all 10 ✅', customerId: '', customerName: '', details: 'Auto-generated executive summary', hasEmail: false, severity: 'info' },
  { id: 'f13', timestamp: 540, agentType: 'starter', action: 'Email sent to Sarah Kim ✅', customerId: 'HS001', customerName: 'Sarah Kim', details: 'Welcome sequence step 2', hasEmail: true, emailPreview: { subject: 'Your next step: try your first feature', body: 'Hey Sarah, great job completing your profile! Now try sending your first email campaign...' }, severity: 'info' },
  { id: 'f14', timestamp: 600, agentType: 'professional', action: 'Monthly summary sent to Rachel Lee ✅', customerId: 'HP003', customerName: 'Rachel Lee', details: 'Monthly performance report delivered', hasEmail: true, emailPreview: { subject: 'Your February Performance Summary', body: 'Hi Rachel, here\'s your monthly usage report. You used 8 of 12 features this month (+2 from January)...' }, severity: 'info' },
  { id: 'f15', timestamp: 660, agentType: 'professional', action: 'Feature usage analyzed: all 22 done ✅', customerId: '', customerName: '', details: 'Complete feature adoption scan', hasEmail: false, severity: 'info' },
  { id: 'f16', timestamp: 720, agentType: 'enterprise', action: 'Feature usage scanned: 10 accounts ✅', customerId: '', customerName: '', details: 'Enterprise feature adoption report', hasEmail: false, severity: 'info' },
  { id: 'f17', timestamp: 780, agentType: 'enterprise', action: 'Churn model scored: Initech LOW 🟢', customerId: 'HE003', customerName: 'Robert Johnson', details: 'Healthy account — no action needed', hasEmail: false, severity: 'info' },
  { id: 'f18', timestamp: 90, agentType: 'starter', action: 'New customer detected: Lisa Chen 🆕', customerId: 'HS003', customerName: 'Lisa Chen', details: 'New Starter signup', hasEmail: false, severity: 'info' },
  { id: 'f19', timestamp: 150, agentType: 'starter', action: 'Welcome email sent to Lisa Chen ✅', customerId: 'HS003', customerName: 'Lisa Chen', details: 'Welcome sequence initiated', hasEmail: true, emailPreview: { subject: 'Welcome to RetainIQ, Lisa!', body: 'Hey Lisa, welcome aboard! Here\'s how to get started in 3 easy steps...' }, severity: 'info' },
  { id: 'f20', timestamp: 50, agentType: 'professional', action: 'Scoring upsell readiness: 22 customers', customerId: '', customerName: '', details: 'Running ML-based upsell scoring', hasEmail: false, severity: 'info' },
  { id: 'f21', timestamp: 30, agentType: 'professional', action: 'Upsell email generated for John D. ✅', customerId: 'HP001', customerName: 'John Davidson', details: 'Claude AI crafted personalized upsell', hasEmail: true, emailPreview: { subject: 'You\'re ready for more, John 🚀', body: 'Hi John, you\'ve used 9 out of 12 features — Enterprise unlocks API access + SSO that matches your workflow...' }, severity: 'info' },
  { id: 'f22', timestamp: 5, agentType: 'enterprise', action: '🔴 CRITICAL: Acme Corp API calls -91%', customerId: 'HE001', customerName: 'James Mitchell', details: 'Dramatic API usage decline detected', hasEmail: false, severity: 'critical' },
  { id: 'f23', timestamp: 18, agentType: 'enterprise', action: 'Alert emailed to James (Account Mgr) ✅', customerId: 'HE001', customerName: 'James Mitchell', details: 'Immediate escalation', hasEmail: true, emailPreview: { subject: 'URGENT: Acme Corp requires immediate attention', body: 'Acme Corp API calls dropped 91% this month. Churn risk: CRITICAL (94%). Schedule emergency QBR immediately.' }, severity: 'critical' },
  { id: 'f24', timestamp: 34, agentType: 'enterprise', action: 'Claude AI churn analysis: Acme Corp 🤖', customerId: 'HE001', customerName: 'James Mitchell', details: 'Full risk assessment generated', hasEmail: false, severity: 'critical' },
]

// === COMPUTED STATS ===
export const overviewStats = {
  totalCustomers: 50,
  atRiskCustomers: 8,
  emailsSentToday: 24,
  churnPrevented: 3,
}

export const starterStats = {
  fullyOnboarded: starterCustomers.filter(c => c.onboardingStatus === 'done').length,
  stuck: starterCustomers.filter(c => c.onboardingStatus === 'stuck').length,
  emailsSentThisWeek: 31,
  avgOnboardTime: 4.2,
  aiResolutionRate: 94,
  escalated: 2,
}

export const professionalStats = {
  avgHealth: Math.round(professionalCustomers.reduce((s, c) => s + c.healthScore, 0) / professionalCustomers.length),
  upsellReady: professionalCustomers.filter(c => c.upsellReady).length,
  monthlyEmailsSent: 18,
  atRisk: professionalCustomers.filter(c => c.churnRisk > 50).length,
  totalPipelineValue: professionalCustomers.filter(c => c.upsellReady).reduce((s, c) => s + (c.upsellValue || 0), 0),
  monthlySent: 18,
  monthlyPending: 4,
  monthlyTotal: 22,
}

export const enterpriseStats = {
  totalARR: enterpriseCustomers.reduce((s, c) => s + c.arr, 0),
  criticalRisk: enterpriseCustomers.filter(c => c.churnRisk > 70).length,
  avgLoginFreq: +(enterpriseCustomers.reduce((s, c) => s + c.loginsPerWeek, 0) / enterpriseCustomers.length).toFixed(1),
  reportsSentThisWeek: 10,
}

export const faqQuestions = [
  { question: 'How do I connect my first app?', count: 12 },
  { question: 'Where is billing?', count: 8 },
  { question: 'Can I export data?', count: 6 },
  { question: 'How to invite team members?', count: 5 },
  { question: 'What integrations are supported?', count: 4 },
]

export const weeklyReportSummary = `This week's enterprise portfolio shows concerning signals from 2 accounts. Acme Corp represents the highest churn risk at $380K ARR — login frequency declined 91%, with only 2 of 15 features remaining active. Immediate executive escalation recommended. Globex ($290K ARR) also shows HIGH risk with a 14-day login gap and declining API usage. Remaining 8 accounts are stable or improving, with Hooli and Apex Industries showing the strongest engagement metrics.`
