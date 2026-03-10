export interface UserProfile {
  id: number;
  user_id: string;
  role: 'merchant' | 'creator';
  display_name: string;
  avatar_url?: string;
  company_name?: string;
  bio?: string;
  country?: string;
  categories?: string;
  tiktok_handle?: string;
  portfolio_links?: string;
  rate_min?: number;
  rate_max?: number;
  completion_rate?: number;
  ontime_rate?: number;
  dispute_rate?: number;
  trust_tier?: 'new' | 'verified' | 'trusted';
  subscription_plan?: 'basic' | 'advanced' | 'team';
  subscription_expires_at?: string;
  balance_frozen?: number;
  balance_available?: number;
  created_at?: string;
}

export interface Campaign {
  id: number;
  user_id: string;
  title: string;
  description: string;
  country: string;
  platform: string;
  category: string;
  collab_type: 'ugc_only' | 'post_to_tiktok' | 'hybrid';
  total_budget: number;
  per_creator_min: number;
  per_creator_max: number;
  conditions: string; // JSON string
  threshold: number;
  milestones: string; // JSON string
  deadline_apply: string;
  deadline_publish: string;
  retention_days: number;
  keywords?: string;
  compliance_notes?: string;
  product_image_url?: string | null;
  /** English version generated at publish time when original has CJK */
  title_en?: string | null;
  description_en?: string | null;
  conditions_en?: string | null;
  milestones_en?: string | null;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  applicant_count: number;
  created_at: string;
}

export interface Milestone {
  name: string;
  percent: number;
}

export interface Condition {
  text: string;
  met?: boolean;
}

export interface Application {
  id: number;
  user_id: string;
  campaign_id: number;
  proposed_rate: number;
  message: string;
  availability: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  created_at: string;
}

export interface Contract {
  id: number;
  user_id: string;
  campaign_id: number;
  merchant_user_id: string;
  creator_user_id: string;
  agreed_rate: number;
  conditions_met: number;
  conditions_total: number;
  threshold: number;
  current_milestone: number;
  milestone_data: string; // JSON
  escrow_amount: number;
  released_amount: number;
  status: 'active' | 'completed' | 'disputed' | 'cancelled';
  created_at: string;
  completed_at?: string;
}

export interface Message {
  id: number;
  user_id: string;
  contract_id: number;
  receiver_id: string;
  content: string;
  msg_type: 'text' | 'system' | 'auto';
  is_read: boolean;
  created_at: string;
}

export interface Dispute {
  id: number;
  user_id: string;
  contract_id: number;
  reason: string;
  evidence: string; // JSON
  status: 'open' | 'under_review' | 'resolved' | 'closed';
  resolution?: string;
  created_at: string;
  resolved_at?: string;
}

export const COUNTRIES = [
  { code: 'US', label: '美国 / United States', flag: '🇺🇸' },
  { code: 'UK', label: '英国 / United Kingdom', flag: '🇬🇧' },
  { code: 'CA', label: '加拿大 / Canada', flag: '🇨🇦' },
  { code: 'AU', label: '澳大利亚 / Australia', flag: '🇦🇺' },
  { code: 'DE', label: '德国 / Germany', flag: '🇩🇪' },
  { code: 'FR', label: '法国 / France', flag: '🇫🇷' },
];

export const PLATFORMS = [
  { value: 'tiktok', label: 'TikTok', icon: '📱' },
  { value: 'instagram', label: 'Instagram', icon: '📷' },
  { value: 'youtube', label: 'YouTube', icon: '🎬' },
];

export const CATEGORIES = [
  { value: '美妆', label: '美妆 / Beauty' },
  { value: '服饰', label: '服饰 / Fashion' },
  { value: '数码', label: '数码 / Electronics' },
  { value: '家居', label: '家居 / Home & Living' },
  { value: '食品', label: '食品 / Food & Beverage' },
  { value: '母婴', label: '母婴 / Baby & Kids' },
  { value: '运动', label: '运动 / Sports' },
  { value: '宠物', label: '宠物 / Pets' },
];

export const COLLAB_TYPES = [
  { value: 'ugc_only', label: 'UGC素材', labelEn: 'UGC Only' },
  { value: 'post_to_tiktok', label: '发布到TikTok', labelEn: 'Post to TikTok' },
  { value: 'hybrid', label: '混合模式', labelEn: 'Hybrid' },
];

export const DEFAULT_MILESTONES: Milestone[] = [
  { name: '脚本/分镜确认', percent: 20 },
  { name: '成片/素材提交', percent: 30 },
  { name: '公开视频链接提交', percent: 30 },
  { name: '保留期+条件达标结算', percent: 20 },
];

export const SUBSCRIPTION_PLANS = [
  {
    id: 'basic',
    name: '基础版',
    price: 39,
    features: ['每月3个合作单', '基础达人筛选', '标准客服支持', '里程碑托管'],
  },
  {
    id: 'advanced',
    name: '进阶版',
    price: 79,
    features: ['每月10个合作单', '高级达人筛选', '优先客服支持', '里程碑托管', '数据分析报告'],
    popular: true,
  },
  {
    id: 'team',
    name: '团队版',
    price: 199,
    features: ['不限合作单', '高级达人筛选', '专属客服', '里程碑托管', '数据分析报告', '子账号管理', 'API接入'],
  },
];