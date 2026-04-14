import { type Question, type Dimension } from './assessment-types';

// 評估問卷題目 - 六大面向（依原始評估表）
export const ASSESSMENT_QUESTIONS: Question[] = [
  // A. 經濟資源（滿分25分）
  {
    id: 'A1',
    dimension: 'A',
    text: '您家庭每個月的總收入大約是多少？',
    options: [
      { value: 5, label: '超過 NT$50,000' },
      { value: 4, label: 'NT$30,000 至 50,000' },
      { value: 3, label: 'NT$20,000 至 30,000' },
      { value: 2, label: 'NT$10,000 至 20,000' },
      { value: 1, label: '不到 NT$10,000' },
    ],
  },
  {
    id: 'A2',
    dimension: 'A',
    text: '您家庭的主要收入來源屬於哪一種？',
    options: [
      { value: 5, label: '穩定月薪' },
      { value: 3, label: '不穩定但固定工作' },
      { value: 1, label: '臨時工作或打零工' },
      { value: 0, label: '目前沒有收入' },
    ],
  },
  {
    id: 'A3',
    dimension: 'A',
    text: '您目前的儲蓄，大約可以支應幾個月的生活費？（以每月必要開銷，如房租、水電、伙食、交通、照顧/教育費估算）',
    options: [
      { value: 5, label: '3 個月以上' },
      { value: 3, label: '1 至 3 個月' },
      { value: 1, label: '不足 1 個月' },
      { value: 0, label: '沒有儲蓄' },
    ],
  },
  {
    id: 'A4',
    dimension: 'A',
    text: '您目前的債務狀況是？（請依目前最常見或金額最高的借款型態選擇）',
    options: [
      { value: 5, label: '無債務' },
      { value: 3, label: '健康債務（親友周轉、信用卡繳最低應繳、銀行信貸、預支薪水）' },
      { value: 1, label: '警戒債務（帳單延遲、銀行債務無法繳納、融資借款、先買後付、二胎借款）' },
      { value: 0, label: '危險債務（融資貸款無法繳納、當鋪、小額借款）' },
    ],
  },
  {
    id: 'A5',
    dimension: 'A',
    text: '除了存款，您家庭還有哪些資產？（例如：自有房屋/土地、汽機車、可變現投資〈股票/基金/債券〉、黃金、可出租資產、營生工具設備等）',
    options: [
      { value: 5, label: '有多項資產' },
      { value: 3, label: '有部分資產' },
      { value: 1, label: '僅基本資產' },
      { value: 0, label: '無' },
    ],
  },

  // B. 應急能力（滿分15分）
  {
    id: 'B1',
    dimension: 'B',
    text: '如果您緊急需要 NT$10,000，您能在 30 天內籌到嗎？',
    options: [
      { value: 5, label: '可以，沒有太大困難' },
      { value: 3, label: '可以，但需要想辦法' },
      { value: 1, label: '很困難，不確定能否籌到' },
      { value: 0, label: '不可能籌到' },
    ],
  },
  {
    id: 'B2',
    dimension: 'B',
    text: '如果需要緊急籌款，您最主要的方式是？',
    options: [
      { value: 5, label: '動用自己的儲蓄' },
      { value: 3, label: '請親友借助或借款' },
      { value: 2, label: '向銀行或信用合作社貸款' },
      { value: 0, label: '借地下錢莊、當鋪等高成本管道' },
    ],
  },
  {
    id: 'B3',
    dimension: 'B',
    text: '您家庭目前有哪些保險保障？（請包含家中主要經濟來源者是否有保險）',
    options: [
      { value: 5, label: '有完整保障（健保＋醫療/意外/壽險等，保障相對充足）' },
      { value: 3, label: '有基本保障（健保＋部分保險，但保障額度或項目有限）' },
      { value: 1, label: '只有全民健保' },
      { value: 0, label: '沒有任何保險' },
    ],
  },

  // C. 金融包容性（滿分15分）
  {
    id: 'C1',
    dimension: 'C',
    text: '您目前有銀行帳戶嗎？',
    options: [
      { value: 5, label: '有，使用正規銀行帳戶' },
      { value: 0, label: '沒有銀行帳戶' },
    ],
  },
  {
    id: 'C2',
    dimension: 'C',
    text: '您使用銀行服務（如轉帳、ATM、網路銀行）的熟練程度？',
    options: [
      { value: 5, label: '熟練，可以自行操作各項服務' },
      { value: 3, label: '基本會用，能處理日常轉帳存款' },
      { value: 1, label: '不太會用，需要別人協助' },
      { value: 0, label: '從未使用過銀行服務' },
    ],
  },
  {
    id: 'C3',
    dimension: 'C',
    text: '當您需要申請金融服務（如貸款、保險）時，您覺得容易嗎？',
    options: [
      { value: 5, label: '容易，知道如何申請並獲得核准' },
      { value: 3, label: '普通，有些困難但能辦到' },
      { value: 0, label: '困難，常被拒絕或不知道如何申請' },
    ],
  },

  // D. 財務管理能力（滿分20分）
  {
    id: 'D1',
    dimension: 'D',
    text: '您有固定規劃家庭收支預算的習慣嗎？',
    options: [
      { value: 5, label: '有，每個月都會固定規劃' },
      { value: 3, label: '偶爾，有時候會想想' },
      { value: 0, label: '沒有，從不規劃' },
    ],
  },
  {
    id: 'D2',
    dimension: 'D',
    text: '您有記錄家庭收支（記帳）的習慣嗎？',
    options: [
      { value: 5, label: '有，定期記帳' },
      { value: 3, label: '偶爾記帳' },
      { value: 0, label: '沒有記帳習慣' },
    ],
  },
  {
    id: 'D3',
    dimension: 'D',
    text: '您有定期儲蓄的習慣嗎？',
    options: [
      { value: 5, label: '有，每個月固定存一筆錢' },
      { value: 3, label: '偶爾，有多餘的錢才存' },
      { value: 0, label: '沒有，無法儲蓄' },
    ],
  },
  {
    id: 'D4',
    dimension: 'D',
    text: '您對基本財務知識（如利率計算、保險原理、理財規劃）的了解程度？',
    options: [
      { value: 5, label: '了解，可以運用在日常生活決策' },
      { value: 3, label: '普通，知道一些基本概念' },
      { value: 0, label: '不太了解，感到困惑' },
    ],
  },

  // E. 社會資本（滿分15分）
  {
    id: 'E1',
    dimension: 'E',
    text: '當您遇到財務困難時，親友能給您多少支援？',
    options: [
      { value: 5, label: '很多，有人可以幫我出錢或出力' },
      { value: 3, label: '一些，偶爾能得到幫助' },
      { value: 1, label: '很少，幾乎沒有人能幫' },
      { value: 0, label: '沒有，完全沒有親友支援' },
    ],
  },
  {
    id: 'E2',
    dimension: 'E',
    text: '您與社區（如鄰里、宗教團體、同鄉會）的連結程度？',
    options: [
      { value: 5, label: '很強，經常互動，遇到困難有人協助' },
      { value: 3, label: '中等，有些連結但不密切' },
      { value: 1, label: '很弱，幾乎沒有往來' },
      { value: 0, label: '完全沒有社區連結' },
    ],
  },
  {
    id: 'E3',
    dimension: 'E',
    text: '您對政府或社福單位提供的資源（如補助、急難救助）的了解程度？',
    options: [
      { value: 5, label: '熟悉，知道如何申請並可運用' },
      { value: 3, label: '普通，聽說過但不確定如何申請' },
      { value: 0, label: '不熟悉，幾乎不知道有哪些資源' },
    ],
  },

  // F. 心理韌性（滿分10分）
  {
    id: 'F1',
    dimension: 'F',
    text: '您目前對家庭財務狀況感受到的壓力程度是？',
    options: [
      { value: 5, label: '壓力低，大致上感到安心' },
      { value: 3, label: '壓力中等，有些擔心但還能應對' },
      { value: 0, label: '壓力很大，常常感到焦慮或無助' },
    ],
  },
  {
    id: 'F2',
    dimension: 'F',
    text: '您對未來家庭財務狀況的信心程度？',
    options: [
      { value: 5, label: '很有信心，相信情況會好轉或維持穩定' },
      { value: 3, label: '信心普通，有些不確定' },
      { value: 0, label: '信心不足，對未來感到悲觀' },
    ],
  },
];

// 各面向最高分數
export const MAX_DIMENSION_SCORES: Record<Dimension, number> = {
  A: 25, // A1~A5，各5分
  B: 15, // B1~B3，各5分
  C: 15, // C1~C3，各5分
  D: 20, // D1~D4，各5分
  E: 15, // E1~E3，各5分
  F: 10, // F1~F2，各5分
};

export const TOTAL_MAX_SCORE = Object.values(MAX_DIMENSION_SCORES).reduce((a, b) => a + b, 0); // 100分

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

  for (const question of ASSESSMENT_QUESTIONS) {
    const answer = answers[question.id];
    if (answer !== undefined) {
      dimensionScores[question.dimension] += answer;
    }
  }

  const rawTotal = Object.values(dimensionScores).reduce((a, b) => a + b, 0);
  const totalScore = Math.round((rawTotal / TOTAL_MAX_SCORE) * 100);

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
