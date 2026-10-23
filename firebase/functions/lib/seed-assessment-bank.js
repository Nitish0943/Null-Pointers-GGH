"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const assessment_question_bank_json_1 = __importDefault(require("./data/assessment-question-bank.json"));
(0, app_1.initializeApp)();
async function seed() {
    const db = (0, firestore_1.getFirestore)();
    const batch = db.batch();
    assessment_question_bank_json_1.default.forEach((question) => {
        batch.set(db.collection('assessment-question-bank').doc(question.id), question);
    });
    await batch.commit();
    console.log(`Seeded ${assessment_question_bank_json_1.default.length} assessment questions.`);
}
void seed().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
