import { type Question, type Dimension } from './assessment-types';

// 評估問卷題目 - 六大面向各3-4題
export const ASSESSMENT_QUESTIONS: Question[] = [
  // A. 收支管理 (4題)
  {
    id: 'A1',
    dimension: 'A',
    text: '過去三個月，您的家庭收入是否足夠支付基本生活開銷？',
    options: [
      { value: 0, label: '完全不夠' },
      { value: 1, label: '經常不夠' },
      { value: 2, label: '偶爾不夠' },
      { value: 3, label: '大致足夠' },
      { value: 4, label: '完全足夠' },
    ],
  },
  {
    id: 'A2',
    dimension: 'A',
    text: '您是否有記錄家庭收支的習慣？',
    options: [
      { value: 0, label: '從未記錄' },
      { value: 1, label: '偶爾記錄' },
      { value: 2, label: '有時記錄' },
      { value: 3, label: '經常記錄' },
      { value: 4, label: '每月都有完整記錄' },
    ],
  },
  {
    id: 'A3',
    dimension: 'A',
    text: '當收入減少時，您能在多長時間內調整支出？',
    options: [
      { value: 0, label: '無法調整' },
      { value: 1, label: '需要很長時間' },
      { value: 2, label: '需要一段時間' },
      { value: 3, label: '能在短時間內調整' },
      { value: 4, label: '能立即調整' },
    ],
  },
  {
    id: 'A4',
    dimension: 'A',
    text: '您的家庭是否有固定的收入來源？',
    options: [
      { value: 0, label: '沒有固定收入' },
      { value: 1, label: '收入非常不穩定' },
      { value: 2, label: '收入有些不穩定' },
      { value: 3, label: '收入大致穩定' },
      { value: 4, label: '收入非常穩定' },
    ],
  },
  // B. 儲蓄準備 (3題)
  {
    id: 'B1',
    dimension: 'B',
    text: '您的家庭目前有多少緊急預備金（可立即動用的存款）？',
    options: [
      { value: 0, label: '幾乎沒有' },
      { value: 1, label: '不到1個月生活費' },
      { value: 2, label: '1-3個月生活費' },
      { value: 3, label: '3-6個月生活費' },
      { value: 4, label: '6個月以上生活費' },
    ],
  },
  {
    id: 'B2',
    dimension: 'B',
    text: '您是否有定期儲蓄的習慣？',
    options: [
      { value: 0, label: '完全沒有' },
      { value: 1, label: '偶爾有餘錢才存' },
      { value: 2, label: '有時會存' },
      { value: 3, label: '經常定期存' },
      { value: 4, label: '每月固定存款' },
    ],
  },
  {
    id: 'B3',
    dimension: 'B',
    text: '如果發生緊急支出（如醫療、修繕），您能否在一週內籌到3萬元？',
    options: [
      { value: 0, label: '完全無法' },
      { value: 1, label: '非常困難' },
      { value: 2, label: '有些困難' },
      { value: 3, label: '應該可以' },
      { value: 4, label: '完全沒問題' },
    ],
  },
  // C. 借貸管理 (3題)
  {
    id: 'C1',
    dimension: 'C',
    text: '您目前的債務（房貸除外）佔月收入的比例是多少？',
    options: [
      { value: 4, label: '沒有債務' },
      { value: 3, label: '低於10%' },
      { value: 2, label: '10-30%' },
      { value: 1, label: '30-50%' },
      { value: 0, label: '超過50%' },
    ],
  },
  {
    id: 'C2',
    dimension: 'C',
    text: '過去一年，您是否曾因無法按時還款而被催收？',
    options: [
      { value: 4, label: '從未' },
      { value: 3, label: '極少（1次）' },
      { value: 2, label: '偶爾（2-3次）' },
      { value: 1, label: '經常（4-6次）' },
      { value: 0, label: '非常頻繁（超過6次）' },
    ],
  },
  {
    id: 'C3',
    dimension: 'C',
    text: '您了解自己所有借貸的利率和還款條件嗎？',
    options: [
      { value: 0, label: '完全不了解' },
      { value: 1, label: '了解很少' },
      { value: 2, label: '了解一部分' },
      { value: 3, label: '大致了解' },
      { value: 4, label: '完全了解' },
    ],
  },
  // D. 財務規劃 (3題)
  {
    id: 'D1',
    dimension: 'D',
    text: '您的家庭是否有設定短期（1年內）或長期（3-5年）的財務目標？',
    options: [
      { value: 0, label: '沒有任何目標' },
      { value: 1, label: '有想過但沒具體規劃' },
      { value: 2, label: '有模糊的目標' },
      { value: 3, label: '有明確的短期目標' },
      { value: 4, label: '有完整的短期和長期目標' },
    ],
  },
  {
    id: 'D2',
    dimension: 'D',
    text: '您是否有為退休或未來重大支出做準備？',
    options: [
      { value: 0, label: '完全沒有' },
      { value: 1, label: '偶爾想到' },
      { value: 2, label: '有初步規劃' },
      { value: 3, label: '有具體計畫' },
      { value: 4, label: '已在執行計畫' },
    ],
  },
  {
    id: 'D3',
    dimension: 'D',
    text: '您了解基本的理財知識（如複利、通膨、投資風險）嗎？',
    options: [
      { value: 0, label: '完全不了解' },
      { value: 1, label: '聽過但不太懂' },
      { value: 2, label: '了解一些' },
      { value: 3, label: '大致了解' },
      { value: 4, label: '非常了解' },
    ],
  },
  // E. 保險保障 (3題)
  {
    id: 'E1',
    dimension: 'E',
    text: '您的家庭主要收入者是否有足夠的保險保障？',
    options: [
      { value: 0, label: '沒有任何保險' },
      { value: 1, label: '只有基本健保' },
      { value: 2, label: '有少量商業保險' },
      { value: 3, label: '有適當的保險' },
      { value: 4, label: '有完整的保險規劃' },
    ],
  },
  {
    id: 'E2',
    dimension: 'E',
    text: '如果家中主要收入者無法工作，家庭能維持多久的生活？',
    options: [
      { value: 0, label: '無法維持' },
      { value: 1, label: '不到1個月' },
      { value: 2, label: '1-3個月' },
      { value: 3, label: '3-6個月' },
      { value: 4, label: '6個月以上' },
    ],
  },
  {
    id: 'E3',
    dimension: 'E',
    text: '您是否了解家中保險的保障範圍和理賠流程？',
    options: [
      { value: 0, label: '完全不了解' },
      { value: 1, label: '了解很少' },
      { value: 2, label: '了解一部分' },
      { value: 3, label: '大致了解' },
      { value: 4, label: '非常了解' },
    ],
  },
  // F. 支持系統 (4題)
  {
    id: 'F1',
    dimension: 'F',
    text: '當遇到財務困難時，您是否有可以求助的親友？',
    options: [
      { value: 0, label: '完全沒有' },
      { value: 1, label: '很少' },
      { value: 2, label: '有一些' },
      { value: 3, label: '有數位' },
      { value: 4, label: '有很多可靠的支援' },
    ],
  },
  {
    id: 'F2',
    dimension: 'F',
    text: '您是否知道可以申請的政府補助或社會福利資源？',
    options: [
      { value: 0, label: '完全不知道' },
      { value: 1, label: '聽過但不了解' },
      { value: 2, label: '知道一些' },
      { value: 3, label: '了解主要的資源' },
      { value: 4, label: '非常了解各項資源' },
    ],
  },
  {
    id: 'F3',
    dimension: 'F',
    text: '過去一年，您是否曾使用過任何社會福利服務或資源？',
    options: [
      { value: 0, label: '需要但無法取得' },
      { value: 1, label: '需要但不知如何申請' },
      { value: 2, label: '有使用但不順利' },
      { value: 3, label: '有使用且順利' },
      { value: 4, label: '不需要使用' },
    ],
  },
  {
    id: 'F4',
    dimension: 'F',
    text: '您的社區或周遭是否有可以提供協助的組織或機構？',
    options: [
      { value: 0, label: '完全沒有' },
      { value: 1, label: '不太清楚' },
      { value: 2, label: '知道有但沒接觸過' },
      { value: 3, label: '有接觸過一些' },
      { value: 4, label: '有良好的連結' },
    ],
  },
];

// 各面向最高分數
export const MAX_DIMENSION_SCORES: Record<Dimension, number> = {
  A: 16, // 4題 × 4分
  B: 12, // 3題 × 4分
  C: 12, // 3題 × 4分
  D: 12, // 3題 × 4分
  E: 12, // 3題 × 4分
  F: 16, // 4題 × 4分
};

export const TOTAL_MAX_SCORE = Object.values(MAX_DIMENSION_SCORES).reduce((a, b) => a + b, 0); // 80分

// 計算評估結果
export function calculateAssessmentResult(answers: Record<string, number>): {
  totalScore: number;
  dimensionScores: Record<Dimension, number>;
  dimensionPercentages: Record<Dimension, number>;
} {
  const dimensionScores: Record<Dimension, number> = {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    E: 0,
    F: 0,
  };

  // 計算各面向分數
  for (const question of ASSESSMENT_QUESTIONS) {
    const answer = answers[question.id];
    if (answer !== undefined) {
      dimensionScores[question.dimension] += answer;
    }
  }

  // 計算總分（轉換為百分制）
  const rawTotal = Object.values(dimensionScores).reduce((a, b) => a + b, 0);
  const totalScore = Math.round((rawTotal / TOTAL_MAX_SCORE) * 100);

  // 計算各面向百分比
  const dimensionPercentages: Record<Dimension, number> = {
    A: Math.round((dimensionScores.A / MAX_DIMENSION_SCORES.A) * 100),
    B: Math.round((dimensionScores.B / MAX_DIMENSION_SCORES.B) * 100),
    C: Math.round((dimensionScores.C / MAX_DIMENSION_SCORES.C) * 100),
    D: Math.round((dimensionScores.D / MAX_DIMENSION_SCORES.D) * 100),
    E: Math.round((dimensionScores.E / MAX_DIMENSION_SCORES.E) * 100),
    F: Math.round((dimensionScores.F / MAX_DIMENSION_SCORES.F) * 100),
  };

  return {
    totalScore,
    dimensionScores,
    dimensionPercentages,
  };
}

// 取得面向的問題數量
export function getQuestionsByDimension(dimension: Dimension): Question[] {
  return ASSESSMENT_QUESTIONS.filter((q) => q.dimension === dimension);
}
