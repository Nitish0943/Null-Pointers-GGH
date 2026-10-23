"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCognitiveAssessment = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
(0, app_1.initializeApp)();
const model = 'gemini-2.0-flash';
const geminiApiKey = (0, params_1.defineSecret)('GEMINI_API_KEY');
function extractJson(text) {
    const cleaned = text
        .replace(/^```json\s*/i, '')
        .replace(/```$/i, '')
        .trim();
    return JSON.parse(cleaned);
}
function requireApiKey() {
    const apiKey = geminiApiKey.value();
    if (!apiKey) {
        throw new https_1.HttpsError('failed-precondition', 'The Gemini service is not configured. Add GEMINI_API_KEY to Firebase Functions.');
    }
    return apiKey;
}
async function askGemini(apiKey, prompt) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                responseMimeType: 'application/json',
            },
        }),
    });
    if (!response.ok) {
        throw new https_1.HttpsError('unavailable', 'Gemini could not generate the assessment.');
    }
    const payload = (await response.json());
    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
        throw new https_1.HttpsError('internal', 'Gemini returned an empty assessment.');
    }
    try {
        return extractJson(text);
    }
    catch {
        throw new https_1.HttpsError('internal', 'Gemini returned an invalid assessment format.');
    }
}
function validateQuestions(value) {
    if (!Array.isArray(value) || value.length !== 10) {
        throw new https_1.HttpsError('internal', 'Gemini returned an invalid question set.');
    }
    return value.map((question, index) => {
        const item = question;
        if (typeof item.prompt !== 'string' ||
            !Array.isArray(item.options) ||
            item.options.length !== 4 ||
            !item.options.every((option) => typeof option === 'string')) {
            throw new https_1.HttpsError('internal', 'Gemini returned an invalid question.');
        }
        return {
            id: item.id || `question-${index + 1}`,
            prompt: item.prompt,
            options: item.options,
            dimension: item.dimension || 'interests',
        };
    });
}
exports.generateCognitiveAssessment = (0, https_1.onCall)({
    region: 'us-central1',
    timeoutSeconds: 60,
    memory: '256MiB',
    secrets: [geminiApiKey],
}, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Sign in to generate an assessment.');
    }
    const data = (request.data ?? {});
    const db = (0, firestore_1.getFirestore)();
    const profileSnapshot = await db.doc(`users/${request.auth.uid}`).get();
    const profile = (profileSnapshot.data() ?? {});
    const apiKey = requireApiKey();
    const profileContext = JSON.stringify({
        educationLevel: profile.studyLevel ?? '',
        schoolOrCollege: profile.schoolName ?? '',
        location: profile.location ?? '',
        interests: profile.interest ?? '',
        assessmentHistory: profile.assessmentHistory ?? '',
    });
    if (data.phase !== 'evaluate') {
        const generated = await askGemini(apiKey, `Create exactly 10 age-appropriate cognitive and interest assessment questions for a student.
Use this profile context only to personalize difficulty and examples: ${profileContext}
Do not diagnose intelligence, mental health, or aptitude. Avoid sensitive or identifying questions.
Return only JSON with this shape:
{"questions":[{"id":"q1","prompt":"...","options":["...","...","...","..."],"dimension":"interests"}]}
Each dimension must be one of interests, learning_style, problem_solving, collaboration.`);
        const questions = validateQuestions(generated.questions);
        await db.doc(`user-data/${request.auth.uid}`).set({
            assessment: {
                status: 'in_progress',
                questions,
                generatedAt: firestore_1.FieldValue.serverTimestamp(),
            },
        }, { merge: true });
        return { questions };
    }
    if (!data.questions || !data.answers) {
        throw new https_1.HttpsError('invalid-argument', 'Questions and answers are required.');
    }
    const result = await askGemini(apiKey, `Interpret this student's assessment answers for career exploration.
Profile: ${profileContext}
Questions and selected option indexes: ${JSON.stringify({
        questions: data.questions,
        answers: data.answers,
    })}
Return only JSON with this shape:
{"summary":"...","strengths":["..."],"interestAreas":["..."],"careerDirections":["..."],"learningSuggestions":["..."]}
Do not make clinical, IQ, admissions, or guaranteed career claims.`);
    await db.doc(`user-data/${request.auth.uid}`).set({
        assessment: {
            status: 'completed',
            answers: data.answers,
            result,
            completedAt: firestore_1.FieldValue.serverTimestamp(),
        },
    }, { merge: true });
    return { result };
});
