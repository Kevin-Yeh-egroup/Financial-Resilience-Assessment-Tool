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
}

export const useSocialWorkerStore = create<SocialWorkerState>()(
  persist(
    (set, get) => ({
      cases: [],
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
    }),
    {
      name: 'social-worker-storage',
    }
  )
);
