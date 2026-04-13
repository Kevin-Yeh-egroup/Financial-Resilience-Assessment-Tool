import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  UserProfile, 
  CaseProfile, 
  AssessmentResult, 
  Dimension 
} from './assessment-types';
import { calculateResilienceLevel } from './assessment-types';
import { calculateAssessmentResult } from './assessment-questions';

// ── Demo seed data ────────────────────────────────────────────────────────────

const demoAnswersT0: Record<string, number> = {
  A1: 3, A2: 3, A3: 1, A4: 1, A5: 1,
  B1: 1, B2: 3, B3: 1,
  C1: 5, C2: 3, C3: 3,
  D1: 3, D2: 0, D3: 0, D4: 3,
  E1: 3, E2: 3, E3: 3,
  F1: 0, F2: 0,
};

const demoAnswersT1: Record<string, number> = {
  A1: 3, A2: 3, A3: 1, A4: 1, A5: 1,
  B1: 3, B2: 3, B3: 3,
  C1: 5, C2: 3, C3: 3,
  D1: 3, D2: 3, D3: 3, D4: 3,
  E1: 3, E2: 3, E3: 5,
  F1: 3, F2: 3,
};

const t0Result = calculateAssessmentResult(demoAnswersT0);
const t1Result = calculateAssessmentResult(demoAnswersT1);

const DEMO_ASSESSMENT_T0: AssessmentResult = {
  id: 'demo-assessment-t0',
  date: '2025-01-15T09:00:00.000Z',
  sessionLabel: 'T0',
  ...t0Result,
  level: calculateResilienceLevel(t0Result.totalScore),
  answers: demoAnswersT0,
  fieldNotes: { A1: '25000', A3: '5000' },
  interventionPriorities: {
    selected: ['心理支持', '儲蓄培養', '金融教育'],
    otherChecked: false,
    other: '',
  },
};

const DEMO_ASSESSMENT_T1: AssessmentResult = {
  id: 'demo-assessment-t1',
  date: '2025-04-10T10:30:00.000Z',
  sessionLabel: 'T1',
  ...t1Result,
  level: calculateResilienceLevel(t1Result.totalScore),
  answers: demoAnswersT1,
  fieldNotes: { A1: '26000', A3: '12000' },
  interventionPriorities: {
    selected: ['儲蓄培養', '金融教育', '就業支持'],
    otherChecked: false,
    other: '',
  },
};

const DEMO_CASE: CaseProfile = {
  id: 'demo-case-001',
  caseNumber: 'D-2025-001',
  name: '王小明',
  birthYear: '1985',
  gender: 'male',
  contact: '0912-345-678',
  familySize: 4,
  childrenCount: 2,
  notes: '單薪家庭，配偶為主要照顧者，育有兩名國小子女。因工作不穩定導致財務壓力較大，有意願參與財務輔導。',
  createdAt: '2025-01-15T08:30:00.000Z',
  assessments: [DEMO_ASSESSMENT_T0, DEMO_ASSESSMENT_T1],
};

interface PublicAssessmentState {
  currentStep: number;
  userProfile: UserProfile | null;
  answers: Record<string, number>;
  result: AssessmentResult | null;
  setCurrentStep: (step: number) => void;
  setUserProfile: (profile: UserProfile) => void;
  setAnswer: (questionId: string, value: number) => void;
  calculateAndSetResult: () => void;
  reset: () => void;
}

export const usePublicAssessmentStore = create<PublicAssessmentState>()(
  persist(
    (set, get) => ({
      currentStep: 0,
      userProfile: null,
      answers: {},
      result: null,
      setCurrentStep: (step) => set({ currentStep: step }),
      setUserProfile: (profile) => set({ userProfile: profile }),
      setAnswer: (questionId, value) =>
        set((state) => ({
          answers: { ...state.answers, [questionId]: value },
        })),
      calculateAndSetResult: () => {
        const { answers } = get();
        const { totalScore, dimensionScores, dimensionPercentages } = calculateAssessmentResult(answers);
        const result: AssessmentResult = {
          id: `public-${Date.now()}`,
          date: new Date().toISOString(),
          totalScore,
          dimensionScores,
          dimensionPercentages,
          level: calculateResilienceLevel(totalScore),
          answers,
        };
        set({ result });
      },
      reset: () =>
        set({
          currentStep: 0,
          userProfile: null,
          answers: {},
          result: null,
        }),
    }),
    {
      name: 'public-assessment-storage',
    }
  )
);

interface SocialWorkerState {
  cases: CaseProfile[];
  currentCase: CaseProfile | null;
  currentAnswers: Record<string, number>;
  addCase: (profile: Omit<CaseProfile, 'id' | 'createdAt' | 'assessments'>) => string;
  updateCase: (id: string, updates: Partial<CaseProfile>) => void;
  deleteCase: (id: string) => void;
  setCurrentCase: (caseProfile: CaseProfile | null) => void;
  setCurrentAnswer: (questionId: string, value: number) => void;
  submitAssessment: (caseId: string, sessionLabel: string) => AssessmentResult | null;
  resetCurrentAnswers: () => void;
  getCaseById: (id: string) => CaseProfile | undefined;
  deleteAssessment: (caseId: string, assessmentId: string) => void;
  deleteManyAssessments: (caseId: string, assessmentIds: string[]) => void;
  deleteManyCases: (ids: string[]) => void;
  updateAssessmentFieldNotes: (caseId: string, assessmentId: string, notes: Record<string, string>) => void;
  updateAssessment: (caseId: string, assessmentId: string, answers: Record<string, number>) => void;
  updateAssessmentInterventionPriorities: (
    caseId: string,
    assessmentId: string,
    priorities: { selected: string[]; otherChecked: boolean; other: string }
  ) => void;
}

export const useSocialWorkerStore = create<SocialWorkerState>()(
  persist(
    (set, get) => ({
      cases: [DEMO_CASE],
      currentCase: null,
      currentAnswers: {},
      addCase: (profile) => {
        const id = `case-${Date.now()}`;
        const newCase: CaseProfile = {
          ...profile,
          id,
          createdAt: new Date().toISOString(),
          assessments: [],
        };
        set((state) => ({ cases: [...state.cases, newCase] }));
        return id;
      },
      updateCase: (id, updates) =>
        set((state) => ({
          cases: state.cases.map((c) => (c.id === id ? { ...c, ...updates } : c)),
          currentCase: state.currentCase?.id === id 
            ? { ...state.currentCase, ...updates } 
            : state.currentCase,
        })),
      deleteCase: (id) =>
        set((state) => ({
          cases: state.cases.filter((c) => c.id !== id),
          currentCase: state.currentCase?.id === id ? null : state.currentCase,
        })),
      setCurrentCase: (caseProfile) => set({ currentCase: caseProfile }),
      setCurrentAnswer: (questionId, value) =>
        set((state) => ({
          currentAnswers: { ...state.currentAnswers, [questionId]: value },
        })),
      submitAssessment: (caseId, sessionLabel) => {
        const { currentAnswers, cases } = get();
        const { totalScore, dimensionScores, dimensionPercentages } = calculateAssessmentResult(currentAnswers);
        
        const targetCase = cases.find((c) => c.id === caseId);
        if (!targetCase) return null;

        const result: AssessmentResult = {
          id: `${sessionLabel}-${Date.now()}`,
          date: new Date().toISOString(),
          sessionLabel,
          totalScore,
          dimensionScores,
          dimensionPercentages,
          level: calculateResilienceLevel(totalScore),
          answers: currentAnswers,
        };

        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === caseId
              ? { ...c, assessments: [...c.assessments, result] }
              : c
          ),
          currentCase: state.currentCase?.id === caseId
            ? { ...state.currentCase, assessments: [...state.currentCase.assessments, result] }
            : state.currentCase,
          currentAnswers: {},
        }));

        return result;
      },
      resetCurrentAnswers: () => set({ currentAnswers: {} }),
      getCaseById: (id) => get().cases.find((c) => c.id === id),
      deleteAssessment: (caseId, assessmentId) =>
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === caseId
              ? { ...c, assessments: c.assessments.filter((a) => a.id !== assessmentId) }
              : c
          ),
        })),
      deleteManyAssessments: (caseId, assessmentIds) =>
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === caseId
              ? { ...c, assessments: c.assessments.filter((a) => !assessmentIds.includes(a.id)) }
              : c
          ),
        })),
      deleteManyCases: (ids) =>
        set((state) => ({
          cases: state.cases.filter((c) => !ids.includes(c.id)),
        })),
      updateAssessment: (caseId, assessmentId, answers) => {
        const { totalScore, dimensionScores, dimensionPercentages } = calculateAssessmentResult(answers);
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === caseId
              ? {
                  ...c,
                  assessments: c.assessments.map((a) =>
                    a.id === assessmentId
                      ? {
                          ...a,
                          answers,
                          totalScore,
                          dimensionScores,
                          dimensionPercentages,
                          level: calculateResilienceLevel(totalScore),
                        }
                      : a
                  ),
                }
              : c
          ),
        }));
      },
      updateAssessmentInterventionPriorities: (caseId, assessmentId, priorities) =>
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === caseId
              ? {
                  ...c,
                  assessments: c.assessments.map((a) =>
                    a.id === assessmentId
                      ? { ...a, interventionPriorities: priorities }
                      : a
                  ),
                }
              : c
          ),
        })),
      updateAssessmentFieldNotes: (caseId, assessmentId, notes) =>
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === caseId
              ? {
                  ...c,
                  assessments: c.assessments.map((a) =>
                    a.id === assessmentId
                      ? { ...a, fieldNotes: { ...a.fieldNotes, ...notes } }
                      : a
                  ),
                }
              : c
          ),
        })),
    }),
    {
      name: 'social-worker-storage',
      merge: (persisted, current) => {
        const stored = persisted as Partial<SocialWorkerState>;
        // If localStorage has no cases yet, keep the demo case from initial state
        if (!stored.cases || stored.cases.length === 0) {
          return { ...current, ...stored, cases: current.cases };
        }
        return { ...current, ...stored };
      },
    }
  )
);
