import { initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';

initializeApp();

type Profile = {
  studyLevel?: string;
  schoolName?: string;
  location?: string;
  interest?: string;
  assessmentHistory?: string;
};

type AssessmentQuestion = {
  id: string;
  prompt: string;
  options: string[];
  dimension:
    'interests' | 'learning_style' | 'problem_solving' | 'collaboration';
};

const model = 'gemini-2.0-flash';
const geminiApiKey = defineSecret('GEMINI_API_KEY');

function extractJson(text: string): unknown {
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/```$/i, '')
    .trim();
  return JSON.parse(cleaned);
}

function requireApiKey() {
  const apiKey = geminiApiKey.value();
  if (!apiKey) {
    throw new HttpsError(
      'failed-precondition',
      'The Gemini service is not configured. Add GEMINI_API_KEY to Firebase Functions.',
    );
  }
  return apiKey;
}

async function askGemini(apiKey: string, prompt: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json',
        },
      }),
    },
  );
  if (!response.ok) {
    throw new HttpsError(
      'unavailable',
      'Gemini could not generate the assessment.',
    );
  }
  const payload = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new HttpsError('internal', 'Gemini returned an empty assessment.');
  }
  try {
    return extractJson(text);
  } catch {
    throw new HttpsError(
      'internal',
      'Gemini returned an invalid assessment format.',
    );
  }
}

function validateQuestions(value: unknown): AssessmentQuestion[] {
  if (!Array.isArray(value) || value.length !== 10) {
    throw new HttpsError(
      'internal',
      'Gemini returned an invalid question set.',
    );
  }
  return value.map((question, index) => {
    const item = question as Partial<AssessmentQuestion>;
    if (
      typeof item.prompt !== 'string' ||
      !Array.isArray(item.options) ||
      item.options.length !== 4 ||
      !item.options.every((option) => typeof option === 'string')
    ) {
      throw new HttpsError('internal', 'Gemini returned an invalid question.');
    }
    return {
      id: item.id || `question-${index + 1}`,
      prompt: item.prompt,
      options: item.options,
      dimension: item.dimension || 'interests',
    };
  });
}

export const generateCognitiveAssessment = onCall(
  {
    region: 'us-central1',
    timeoutSeconds: 60,
    memory: '256MiB',
    secrets: [geminiApiKey],
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'Sign in to generate an assessment.',
      );
    }

    const data = (request.data ?? {}) as {
      phase?: 'generate' | 'evaluate';
      questions?: AssessmentQuestion[];
      answers?: Record<string, number>;
    };
    const db = getFirestore();
    const profileSnapshot = await db.doc(`users/${request.auth.uid}`).get();
    const profile = (profileSnapshot.data() ?? {}) as Profile;
    const apiKey = requireApiKey();
    const profileContext = JSON.stringify({
      educationLevel: profile.studyLevel ?? '',
      schoolOrCollege: profile.schoolName ?? '',
      location: profile.location ?? '',
      interests: profile.interest ?? '',
      assessmentHistory: profile.assessmentHistory ?? '',
    });

    if (data.phase !== 'evaluate') {
      const generated = await askGemini(
        apiKey,
        `Create exactly 10 age-appropriate cognitive and interest assessment questions for a student.
Use this profile context only to personalize difficulty and examples: ${profileContext}
Do not diagnose intelligence, mental health, or aptitude. Avoid sensitive or identifying questions.
Return only JSON with this shape:
{"questions":[{"id":"q1","prompt":"...","options":["...","...","...","..."],"dimension":"interests"}]}
Each dimension must be one of interests, learning_style, problem_solving, collaboration.`,
      );
      const questions = validateQuestions(
        (generated as { questions?: unknown }).questions,
      );
      await db.doc(`user-data/${request.auth.uid}`).set(
        {
          assessment: {
            status: 'in_progress',
            questions,
            generatedAt: FieldValue.serverTimestamp(),
          },
        },
        { merge: true },
      );
      return { questions };
    }

    if (!data.questions || !data.answers) {
      throw new HttpsError(
        'invalid-argument',
        'Questions and answers are required.',
      );
    }
    const result = await askGemini(
      apiKey,
      `Interpret this student's assessment answers for career exploration.
Profile: ${profileContext}
Questions and selected option indexes: ${JSON.stringify({
        questions: data.questions,
        answers: data.answers,
      })}
Return only JSON with this shape:
{"summary":"...","strengths":["..."],"interestAreas":["..."],"careerDirections":["..."],"learningSuggestions":["..."]}
Do not make clinical, IQ, admissions, or guaranteed career claims.`,
    );
    await db.doc(`user-data/${request.auth.uid}`).set(
      {
        assessment: {
          status: 'completed',
          answers: data.answers,
          result,
          completedAt: FieldValue.serverTimestamp(),
        },
      },
      { merge: true },
    );
    return { result };
  },
);
