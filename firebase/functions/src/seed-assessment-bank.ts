import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import questionBank from './data/assessment-question-bank.json';

initializeApp();

async function seed() {
  const db = getFirestore();
  const batch = db.batch();
  questionBank.forEach((question) => {
    batch.set(
      db.collection('assessment-question-bank').doc(question.id),
      question,
    );
  });
  await batch.commit();
  console.log(`Seeded ${questionBank.length} assessment questions.`);
}

void seed().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
