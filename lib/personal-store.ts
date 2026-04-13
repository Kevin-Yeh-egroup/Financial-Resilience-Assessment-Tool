import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AssessmentResult } from './assessment-types';
import { calculateResilienceLevel } from './assessment-types';
import { calculateAssessmentResult } from './assessment-questions';

export interface PersonalProfile {
  name: string;
  birthYear: string;
  gender: string;
}

// ── Demo seed (mirrors social-worker demo case) ───────────────────────────────

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

const t0 = calculateAssessmentResult(demoAnswersT0);
const t1 = calculateAssessmentResult(demoAnswersT1);

const DEMO_PROFILE: PersonalProfile = { name: '王小明', birthYear: '1985', gender: 'male' };

const DEMO_ASSESSMENTS: AssessmentResult[] = [
  {
    id: 'personal-demo-t0',
    date: '2025-01-15T09:00:00.000Z',
    sessionLabel: 'T0',
    ...t0,
    level: calculateResilienceLevel(t0.totalScore),
    answers: demoAnswersT0,
    fieldNotes: { A1: '25000', A3: '5000' },
    interventionPriorities: { selected: ['心理支持', '儲蓄培養', '金融教育'], otherChecked: false, other: '' },
  },
  {
    id: 'personal-demo-t1',
    date: '2025-04-10T10:30:00.000Z',
    sessionLabel: 'T1',
    ...t1,
    level: calculateResilienceLevel(t1.totalScore),
    answers: demoAnswersT1,
    fieldNotes: { A1: '26000', A3: '12000' },
    interventionPriorities: { selected: ['儲蓄培養', '金融教育', '就業支持'], otherChecked: false, other: '' },
  },
];

// ── Store ─────────────────────────────────────────────────────────────────────

interface PersonalState {
  profile: PersonalProfile;
  assessments: AssessmentResult[];
  currentAnswers: Record<string, number>;
  setProfile: (profile: PersonalProfile) => void;
  setCurrentAnswer: (questionId: string, value: number) => void;
  submitAssessment: () => AssessmentResult | null;
  resetCurrentAnswers: () => void;
  deleteAssessment: (assessmentId: string) => void;
  updateAssessment: (assessmentId: string, answers: Record<string, number>) => void;
  updateAssessmentFieldNotes: (assessmentId: string, notes: Record<string, string>) => void;
  updateAssessmentInterventionPriorities: (
    assessmentId: string,
    priorities: { selected: string[]; otherChecked: boolean; other: string }
  ) => void;
}

export const usePersonalStore = create<PersonalState>()(
  persist(
    (set, get) => ({
      profile: DEMO_PROFILE,
      assessments: DEMO_ASSESSMENTS,
      currentAnswers: {},

      setProfile: (profile) => set({ profile }),

      setCurrentAnswer: (questionId, value) =>
        set((state) => ({
          currentAnswers: { ...state.currentAnswers, [questionId]: value },
        })),

      submitAssessment: () => {
        const { currentAnswers, assessments } = get();
        const { totalScore, dimensionScores, dimensionPercentages } = calculateAssessmentResult(currentAnswers);
        const result: AssessmentResult = {
          id: `personal-${Date.now()}`,
          date: new Date().toISOString(),
          sessionLabel: `T${assessments.length}`,
          totalScore,
          dimensionScores,
          dimensionPercentages,
          level: calculateResilienceLevel(totalScore),
          answers: currentAnswers,
        };
        set((state) => ({ assessments: [...state.assessments, result], currentAnswers: {} }));
        return result;
      },

      resetCurrentAnswers: () => set({ currentAnswers: {} }),

      deleteAssessment: (assessmentId) =>
        set((state) => ({
          assessments: state.assessments.filter((a) => a.id !== assessmentId),
        })),

      updateAssessment: (assessmentId, answers) => {
        const { totalScore, dimensionScores, dimensionPercentages } = calculateAssessmentResult(answers);
        set((state) => ({
          assessments: state.assessments.map((a) =>
            a.id === assessmentId
              ? { ...a, answers, totalScore, dimensionScores, dimensionPercentages, level: calculateResilienceLevel(totalScore) }
              : a
          ),
        }));
      },

      updateAssessmentFieldNotes: (assessmentId, notes) =>
        set((state) => ({
          assessments: state.assessments.map((a) =>
            a.id === assessmentId ? { ...a, fieldNotes: { ...a.fieldNotes, ...notes } } : a
          ),
        })),

      updateAssessmentInterventionPriorities: (assessmentId, priorities) =>
        set((state) => ({
          assessments: state.assessments.map((a) =>
            a.id === assessmentId ? { ...a, interventionPriorities: priorities } : a
          ),
        })),
    }),
    {
      name: 'personal-storage',
      merge: (persisted, current) => {
        const stored = persisted as Partial<PersonalState>;
        // First visit (no stored data): use demo defaults
        if (!stored.profile) {
          return { ...current, ...stored, profile: current.profile, assessments: current.assessments };
        }
        return { ...current, ...stored };
      },
    }
  )
);
