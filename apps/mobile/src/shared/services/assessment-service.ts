import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import { getFirebaseAuth, getFirebaseFirestore } from './firebase-client';
import questionBank from '../../features/assessment/data/question-bank.json';

export type AssessmentQuestion = {
  id: string;
  prompt: string;
  options: string[];
  dimension: string;
  educationLevels?: string[];
  interestTags?: string[];
  difficulty?: 'foundation' | 'developing' | 'advanced';
  audience?: 'school_student' | 'college_student' | 'general';
};

function requireFirestore() {
  const firestore = getFirebaseFirestore();
  if (!firestore) {
    throw new Error('Firebase is not configured.');
  }
  return firestore;
}

export async function generateAssessmentQuestions(profile: {
  role?: string;
  studyLevel?: string;
  interest?: string;
}) {
  const level = profile.studyLevel?.toLowerCase() ?? '';
  const audience =
    profile.role === 'college_student' || levelLooksLikeCollege(level)
      ? 'college_student'
      : 'school_student';
  const interests = (profile.interest ?? '')
    .toLowerCase()
    .split(/[,;\s]+/)
    .filter(Boolean);
  const bank = questionBank as AssessmentQuestion[];
  const audienceQuestions = bank.filter(
    (question) =>
      question.audience === audience || question.audience === 'general',
  );
  const questions = audienceQuestions
    .filter((question) => {
      const matchesLevel =
        !question.educationLevels?.length ||
        question.educationLevels.some((value) =>
          level.includes(value.toLowerCase()),
        );
      const matchesInterest =
        !question.interestTags?.length ||
        question.interestTags.some((tag) =>
          interests.some((interest) => tag.toLowerCase().includes(interest)),
        );
      return question.audience === 'general' || matchesLevel || matchesInterest;
    })
    .sort(() => Math.random() - 0.5);
  if (questions.length >= 10) {
    return questions.slice(0, 10);
  }

  const remaining = audienceQuestions
    .filter(
      (question) => !questions.some((selected) => selected.id === question.id),
    )
    .sort(() => Math.random() - 0.5);
  return [...questions, ...remaining].slice(0, 10);
}

function levelLooksLikeCollege(level?: string) {
  const normalized = level?.toLowerCase() ?? '';
  return normalized.includes('college') || normalized.includes('university');
}

export async function evaluateAssessment(
  questions: AssessmentQuestion[],
  answers: Record<string, number>,
) {
  const totals = new Map<string, number>();
  questions.forEach((question) => {
    const selected = answers[question.id];
    if (selected !== undefined) {
      totals.set(
        question.dimension,
        (totals.get(question.dimension) ?? 0) + selected + 1,
      );
    }
  });
  const strengths = [...totals.entries()]
    .sort(([, left], [, right]) => right - left)
    .map(([dimension]) => dimension.replace('_', ' '));
  const result = {
    summary:
      'Your responses highlight patterns worth exploring through practical projects and guided career research.',
    strengths,
    interestAreas: strengths,
    careerDirections: strengths.map(
      (strength) => `Explore ${strength} pathways`,
    ),
    learningSuggestions: [
      'Try a small project in your strongest area.',
      'Compare two careers before choosing a next step.',
    ],
  };
  const uid = getFirebaseAuth()?.currentUser?.uid ?? null;
  if (uid) {
    await setDoc(
      doc(requireFirestore(), 'user-data', uid),
      {
        assessment: {
          status: 'completed',
          answers,
          result,
          completedAt: serverTimestamp(),
        },
      },
      { merge: true },
    );
  }
  return result;
}

export async function getSavedAssessmentResult(uid: string) {
  const firestore = getFirebaseFirestore();
  if (!firestore) {
    throw new Error('Firebase is not configured.');
  }
  const snapshot = await getDoc(doc(firestore, 'user-data', uid));
  const assessment = snapshot.data()?.assessment as
    { result?: unknown } | undefined;
  return assessment?.result ?? null;
}
