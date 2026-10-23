import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../app/AppNavigator';
import {
  evaluateAssessment,
  generateAssessmentQuestions,
  type AssessmentQuestion,
} from '../../../shared/services/assessment-service';
import { getAuthErrorMessage } from '../../../shared/services/auth-service';
import { useAuth } from '../../../shared/services/AuthProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'Assessment'>;

const fallbackQuestions: AssessmentQuestion[] = [
  {
    id: 'fallback-1',
    prompt: 'When you face a new challenge, what feels most natural?',
    dimension: 'problem_solving',
    options: [
      'I explore different possibilities first.',
      'I look for a clear, practical next step.',
      'I talk it through with someone I trust.',
      'I break it into smaller problems to solve.',
    ],
  },
  {
    id: 'fallback-2',
    prompt: 'What kind of work gives you the most energy?',
    dimension: 'interests',
    options: [
      'Creating something people can experience.',
      'Finding patterns and making sense of information.',
      'Helping people move forward.',
      'Organising a plan and making it happen.',
    ],
  },
  {
    id: 'fallback-3',
    prompt: 'How do you prefer to learn something new?',
    dimension: 'learning_style',
    options: [
      'By trying it hands-on.',
      'By understanding the ideas behind it.',
      'By learning with other people.',
      'By following a structured example.',
    ],
  },
];

export function AssessmentScreen({ navigation }: Props) {
  const { profile } = useAuth();
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void generateAssessmentQuestions({
      role: profile?.role,
      studyLevel: profile?.studyLevel,
      interest: profile?.interest,
    })
      .then((generated) => setQuestions(generated))
      .catch((generationError: unknown) => {
        setQuestions(fallbackQuestions);
        setError(
          `${getAuthErrorMessage(generationError)} Showing the bundled practice assessment.`,
        );
      })
      .finally(() => setIsLoading(false));
  }, [profile?.interest, profile?.studyLevel]);

  if (isLoading || !questions.length) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loading}>
          <Text style={styles.eyebrow}>PERSONALISING YOUR ASSESSMENT</Text>
          <Text style={styles.title}>Creating questions for you…</Text>
          <Text style={styles.description}>
            Your profile is being used to set the level and examples.
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  const question = questions[questionIndex];
  const selectedAnswer = answers[questionIndex];
  const progress = (questionIndex + 1) / questions.length;

  function selectAnswer(optionIndex: number) {
    setAnswers((current) => ({ ...current, [questionIndex]: optionIndex }));
  }

  function continueAssessment() {
    if (selectedAnswer === undefined) {
      return;
    }
    if (questionIndex === questions.length - 1) {
      void evaluateAssessment(
        questions,
        Object.fromEntries(
          Object.entries(answers).map(([index, answer]) => [
            questions[Number(index)].id,
            answer,
          ]),
        ),
      )
        .then(() => navigation.replace('AssessmentProgress'))
        .catch((evaluationError: unknown) =>
          setError(getAuthErrorMessage(evaluationError)),
        );
      return;
    }
    setQuestionIndex((index) => index + 1);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to assessment introduction"
            hitSlop={12}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <Text style={styles.stepText}>
            {questionIndex + 1} of {questions.length}
          </Text>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${progress * 100}%` }]}
          />
        </View>

        <View style={styles.heading}>
          <Text style={styles.eyebrow}>YOUR PERSPECTIVE</Text>
          <Text style={styles.title}>{question.prompt}</Text>
          <Text style={styles.description}>
            Choose the answer that feels most like you.
          </Text>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.options}>
          {question.options.map((option, index) => {
            const selected = selectedAnswer === index;
            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                key={option}
                onPress={() => selectAnswer(index)}
                style={({ pressed }) => [
                  styles.option,
                  selected && styles.optionSelected,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.optionMarker,
                    selected && styles.optionMarkerSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionLetter,
                      selected && styles.optionLetterSelected,
                    ]}
                  >
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.optionText,
                    selected && styles.optionTextSelected,
                  ]}
                >
                  {option}
                </Text>
                <View style={[styles.radio, selected && styles.radioSelected]}>
                  {selected && <View style={styles.radioDot} />}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Text style={styles.helperText}>
            Your answers are used only to personalise your guidance.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              questionIndex === questions.length - 1
                ? 'Complete assessment'
                : 'Continue to next question'
            }
            accessibilityState={{ disabled: selectedAnswer === undefined }}
            disabled={selectedAnswer === undefined}
            onPress={continueAssessment}
            style={({ pressed }) => [
              styles.primaryButton,
              selectedAnswer === undefined && styles.buttonDisabled,
              pressed && selectedAnswer !== undefined && styles.pressed,
            ]}
          >
            <Text style={styles.primaryText}>
              {questionIndex === questions.length - 1 ? 'Finish' : 'Continue'}
            </Text>
            <Text style={styles.arrow}>→</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F7FAFC', flex: 1 },
  container: { flexGrow: 1, padding: 24 },
  loading: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: { paddingVertical: 8 },
  backArrow: { color: '#17324D', fontSize: 27 },
  stepText: { color: '#7B8D9B', fontSize: 13, fontWeight: '800' },
  progressTrack: {
    backgroundColor: '#D9E3E9',
    borderRadius: 3,
    height: 5,
    marginTop: 18,
    overflow: 'hidden',
  },
  progressFill: { backgroundColor: '#6366F1', borderRadius: 3, height: 5 },
  heading: { marginTop: 48 },
  eyebrow: {
    color: '#6366F1',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    color: '#17324D',
    fontSize: 31,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 37,
    marginTop: 14,
  },
  description: {
    color: '#5D7182',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 14,
  },
  options: { gap: 11, marginTop: 32 },
  option: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E3E9',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 74,
    padding: 12,
  },
  optionSelected: { backgroundColor: '#EEF0FF', borderColor: '#6366F1' },
  optionMarker: {
    alignItems: 'center',
    backgroundColor: '#F0F4F6',
    borderRadius: 10,
    height: 38,
    justifyContent: 'center',
    marginRight: 12,
    width: 38,
  },
  optionMarkerSelected: { backgroundColor: '#6366F1' },
  optionLetter: { color: '#5D7182', fontSize: 13, fontWeight: '800' },
  optionLetterSelected: { color: '#FFFFFF' },
  optionText: { color: '#17324D', flex: 1, fontSize: 13, lineHeight: 19 },
  optionTextSelected: { fontWeight: '700' },
  radio: {
    alignItems: 'center',
    borderColor: '#AABBC6',
    borderRadius: 10,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
    marginLeft: 8,
    width: 20,
  },
  radioSelected: { borderColor: '#6366F1' },
  radioDot: {
    backgroundColor: '#6366F1',
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  footer: { flex: 1, justifyContent: 'flex-end', marginTop: 30 },
  helperText: {
    color: '#7B8D9B',
    fontSize: 11,
    lineHeight: 17,
    marginBottom: 12,
    textAlign: 'center',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#17324D',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 56,
    width: '100%',
  },
  buttonDisabled: { backgroundColor: '#C9D4DC' },
  pressed: { opacity: 0.78 },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  arrow: { color: '#5EEAD4', fontSize: 22, marginLeft: 12 },
  error: {
    color: '#B42318',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 16,
  },
});
