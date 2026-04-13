// 六大面向
export type Dimension = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export const DIMENSION_LABELS: Record<Dimension, string> = {
  A: '收支管理',
  B: '儲蓄準備',
  C: '借貸管理',
  D: '財務規劃',
  E: '保險保障',
  F: '支持系統',
};

export const DIMENSION_DESCRIPTIONS: Record<Dimension, string> = {
  A: '家庭收入與支出的平衡管理能力',
  B: '緊急預備金與儲蓄習慣',
  C: '債務管理與借貸行為',
  D: '財務目標設定與規劃能力',
  E: '保險覆蓋與風險保障',
  F: '社會支持網絡與資源取得',
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

export interface AssessmentResult {
  id: string;
  date: string;
  totalScore: number;
  dimensionScores: Record<Dimension, number>;
  dimensionPercentages: Record<Dimension, number>;
  level: ResilienceLevel;
  answers: Record<string, number>;
}

export type ResilienceLevel = 'stable' | 'needsAdjustment' | 'atRisk';

export const RESILIENCE_LEVELS: Record<ResilienceLevel, { label: string; description: string; color: string }> = {
  stable: {
    label: '穩定中',
    description: '您的家庭財務狀況相對穩定，持續保持良好習慣',
    color: 'text-success',
  },
  needsAdjustment: {
    label: '需要調整',
    description: '部分財務面向可以加強，建議尋求專業諮詢',
    color: 'text-warning',
  },
  atRisk: {
    label: '有風險',
    description: '建議盡快尋求專業協助，改善財務狀況',
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
  if (score >= 70) return 'stable';
  if (score >= 40) return 'needsAdjustment';
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
