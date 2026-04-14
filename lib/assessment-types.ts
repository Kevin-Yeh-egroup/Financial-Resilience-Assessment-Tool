// 六大面向
export type Dimension = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export const DIMENSION_LABELS: Record<Dimension, string> = {
  A: '經濟資源',
  B: '應急能力',
  C: '金融包容性',
  D: '財務管理能力',
  E: '社會資本',
  F: '心理韌性',
};

export const DIMENSION_DESCRIPTIONS: Record<Dimension, string> = {
  A: '月收入、收入穩定性、儲蓄、債務與其他資產狀況（滿分25分）',
  B: '應急籌款能力、主要籌款管道與保險覆蓋（滿分15分）',
  C: '銀行帳戶持有、服務熟練度與金融服務可近性（滿分15分）',
  D: '預算規劃、記帳、儲蓄習慣與金融知識程度（滿分20分）',
  E: '親友支持強度、社區連結程度與社會資源了解度（滿分15分）',
  F: '財務壓力感受與未來財務信心（滿分10分）',
};

export interface Question {
  id: string;
  dimension: Dimension;
  text: string;
  options: {
    value: number;
    label: string;
  }[];
}

export interface AssessmentEditRecord {
  editedAt: string;
  previousAnswers: Record<string, number>;
  previousTotalScore: number;
  previousDimensionScores: Record<Dimension, number>;
}

export interface AssessmentResult {
  id: string;
  date: string;
  sessionLabel: string;
  totalScore: number;
  dimensionScores: Record<Dimension, number>;
  dimensionPercentages: Record<Dimension, number>;
  level: ResilienceLevel;
  answers: Record<string, number>;
  fieldNotes?: Record<string, string>;
  interventionPriorities?: {
    selected: string[];
    otherChecked: boolean;
    other: string;
  };
  editHistory?: AssessmentEditRecord[];
}

export type ResilienceLevel = 'stable' | 'needsAdjustment' | 'atRisk';

export const RESILIENCE_LEVELS: Record<ResilienceLevel, { label: string; description: string; color: string }> = {
  stable: {
    label: '穩定',
    description: '財務韌性良好，持續保持良好習慣',
    color: 'text-success',
  },
  needsAdjustment: {
    label: '需注意',
    description: '接近韌性，部分財務面向可以加強，建議尋求專業諮詢',
    color: 'text-warning',
  },
  atRisk: {
    label: '有風險',
    description: '財務脆弱或極度脆弱，建議盡快尋求專業協助',
    color: 'text-destructive',
  },
};

export interface UserProfile {
  name: string;
  contact: string;
  ageRange: string;
  location: string;
  hasSocialService: boolean;
  consentToShare: boolean;
}

export const INTERVENTION_OPTIONS = [
  '緊急經濟援助',
  '債務管理',
  '儲蓄培養',
  '金融教育',
  '就業支持',
  '金融服務連結',
  '社會網絡建立',
  '心理支持',
] as const;

export interface CaseProfile {
  id: string;
  caseNumber: string;
  name: string;
  birthYear: string;
  gender: string;
  contact: string;
  familySize: number;
  childrenCount: number;
  notes: string;
  createdAt: string;
  assessments: AssessmentResult[];
  interventionPriorities?: {
    selected: string[];
    otherChecked: boolean;
    other: string;
  };
}

export const AGE_RANGES = [
  '18-25歲',
  '26-35歲',
  '36-45歲',
  '46-55歲',
  '56-65歲',
  '65歲以上',
];

export const LOCATIONS = [
  '台北市',
  '新北市',
  '桃園市',
  '台中市',
  '台南市',
  '高雄市',
  '基隆市',
  '新竹市',
  '新竹縣',
  '苗栗縣',
  '彰化縣',
  '南投縣',
  '雲林縣',
  '嘉義市',
  '嘉義縣',
  '屏東縣',
  '宜蘭縣',
  '花蓮縣',
  '台東縣',
  '澎湖縣',
  '金門縣',
  '連江縣',
];

// 計算韌性等級
export function calculateResilienceLevel(score: number): ResilienceLevel {
  if (score >= 75) return 'stable';
  if (score >= 60) return 'needsAdjustment';
  return 'atRisk';
}

// 計算面向百分比
export function calculateDimensionPercentages(
  dimensionScores: Record<Dimension, number>,
  maxScores: Record<Dimension, number>
): Record<Dimension, number> {
  const percentages = {} as Record<Dimension, number>;
  for (const dim of Object.keys(dimensionScores) as Dimension[]) {
    percentages[dim] = Math.round((dimensionScores[dim] / maxScores[dim]) * 100);
  }
  return percentages;
}
