import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../app/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'RoleSelection'>;

type Role = {
  id: 'school_student' | 'college_student' | 'mentor' | 'college';
  title: string;
  description: string;
  icon: string;
};

const roles: Role[] = [
  {
    id: 'school_student',
    title: 'I am a school student',
    description:
      'Discover your strengths, explore career options, and plan your next academic step.',
    icon: '◎',
  },
  {
    id: 'college_student',
    title: 'I am a college student',
    description:
      'Build your skills, explore careers, and prepare for internships, jobs, and higher studies.',
    icon: '⌂',
  },
  {
    id: 'mentor',
    title: 'I am a mentor',
    description:
      'Guide students and support their academic and career journeys.',
    icon: '✦',
  },
  {
    id: 'college',
    title: 'I represent a college or institution',
    description:
      'Manage institution information, courses, admissions, and student opportunities.',
    icon: '✦',
  },
];

export function RoleSelectionScreen({ navigation }: Props) {
  const [selectedRole, setSelectedRole] = useState<Role['id'] | null>(null);
  const selected = roles.find((role) => role.id === selectedRole);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to onboarding"
          hitSlop={12}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <View style={styles.heading}>
          <Text style={styles.eyebrow}>ONE LAST STEP</Text>
          <Text style={styles.title}>How will you use Mantrix?</Text>
          <Text style={styles.description}>
            Choose the view that best matches your journey. You can change this
            later in Profile &amp; Settings.
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.roles}
          showsVerticalScrollIndicator={false}
          style={styles.roleScroll}
        >
          {roles.map((role) => {
            const isSelected = role.id === selectedRole;
            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                key={role.id}
                onPress={() => setSelectedRole(role.id)}
                style={({ pressed }) => [
                  styles.roleCard,
                  isSelected && styles.roleCardSelected,
                  pressed && styles.cardPressed,
                ]}
              >
                <View
                  style={[
                    styles.roleIcon,
                    isSelected && styles.roleIconSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.roleIconText,
                      isSelected && styles.roleIconTextSelected,
                    ]}
                  >
                    {role.icon}
                  </Text>
                </View>
                <View style={styles.roleCopy}>
                  <Text style={styles.roleTitle}>{role.title}</Text>
                  <Text style={styles.roleDescription}>{role.description}</Text>
                </View>
                <View
                  style={[styles.radio, isSelected && styles.radioSelected]}
                >
                  {isSelected && <View style={styles.radioDot} />}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.localState}>
            {selected
              ? `Selected for this session: ${selected.title}`
              : 'Select one to continue'}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Continue with selected role"
            accessibilityState={{ disabled: !selectedRole }}
            disabled={!selectedRole}
            onPress={() =>
              navigation.navigate('Login', { role: selectedRole ?? undefined })
            }
            style={({ pressed }) => [
              styles.continueButton,
              !selectedRole && styles.continueButtonDisabled,
              pressed && selectedRole && styles.buttonPressed,
            ]}
          >
            <Text style={styles.continueText}>Continue</Text>
            <Text style={styles.continueArrow}>→</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F7FAFC',
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 24,
  },
  backButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    paddingVertical: 8,
  },
  backArrow: {
    color: '#17324D',
    fontSize: 22,
    marginRight: 8,
  },
  backText: {
    color: '#5D7182',
    fontSize: 14,
    fontWeight: '700',
  },
  heading: {
    marginTop: 42,
  },
  eyebrow: {
    color: '#0F766E',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    color: '#17324D',
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1.2,
    lineHeight: 40,
    marginTop: 14,
  },
  description: {
    color: '#5D7182',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 16,
  },
  roles: {
    gap: 12,
    paddingBottom: 8,
    paddingTop: 32,
  },
  roleScroll: {
    flex: 1,
  },
  roleCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E3E9',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 118,
    padding: 16,
  },
  roleCardSelected: {
    backgroundColor: '#E8F3F2',
    borderColor: '#0F766E',
  },
  cardPressed: {
    opacity: 0.82,
  },
  roleIcon: {
    alignItems: 'center',
    backgroundColor: '#EEF3F6',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    marginRight: 14,
    width: 48,
  },
  roleIconSelected: {
    backgroundColor: '#0F766E',
  },
  roleIconText: {
    color: '#17324D',
    fontSize: 25,
  },
  roleIconTextSelected: {
    color: '#FFFFFF',
  },
  roleCopy: {
    flex: 1,
  },
  roleTitle: {
    color: '#17324D',
    fontSize: 15,
    fontWeight: '800',
  },
  roleDescription: {
    color: '#6B8193',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
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
  radioSelected: {
    borderColor: '#0F766E',
  },
  radioDot: {
    backgroundColor: '#0F766E',
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  footer: {
    paddingBottom: 12,
    paddingTop: 12,
  },
  localState: {
    color: '#7B8D9B',
    fontSize: 11,
    marginBottom: 12,
    textAlign: 'center',
  },
  continueButton: {
    alignItems: 'center',
    backgroundColor: '#17324D',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 56,
  },
  continueButtonDisabled: {
    backgroundColor: '#C9D4DC',
  },
  buttonPressed: {
    opacity: 0.82,
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  continueArrow: {
    color: '#5EEAD4',
    fontSize: 22,
    marginLeft: 12,
  },
});
