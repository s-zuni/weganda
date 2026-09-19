import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { COLORS } from '../../../constants/theme';
import { Input, Button } from '../../common';

export type OnboardingRole = 'nurse' | 'student';

export interface Step1Data {
  role: OnboardingRole;
  nickname: string;
  hospitalName?: string;
  wardName?: string;
  experienceYears?: number;
  schoolName?: string;
  schoolGrade?: number;
}

interface Step1ProfileSetupProps {
  initialData?: Partial<Step1Data>;
  onNext: (data: Step1Data) => void;
}

const GRADES = [1, 2, 3, 4];

export const Step1ProfileSetup: React.FC<Step1ProfileSetupProps> = ({
  initialData,
  onNext,
}) => {
  const [role, setRole] = useState<OnboardingRole>(initialData?.role || 'nurse');
  const [nickname, setNickname] = useState(initialData?.nickname || '');
  const [hospitalName, setHospitalName] = useState(initialData?.hospitalName || '');
  const [wardName, setWardName] = useState(initialData?.wardName || '');
  const [experienceYears, setExperienceYears] = useState(
    initialData?.experienceYears ? String(initialData.experienceYears) : ''
  );
  const [schoolName, setSchoolName] = useState(initialData?.schoolName || '');
  const [schoolGrade, setSchoolGrade] = useState<number>(initialData?.schoolGrade || 1);

  const hospitalInputRef = useRef<TextInput>(null);
  const wardInputRef = useRef<TextInput>(null);
  const expInputRef = useRef<TextInput>(null);
  const schoolInputRef = useRef<TextInput>(null);

  const handleNext = () => {
    if (!nickname.trim()) {
      Alert.alert('확인', '닉네임을 입력해 주세요.');
      return;
    }

    if (role === 'nurse') {
      if (!hospitalName.trim()) {
        Alert.alert('확인', '소속 병원명을 입력해 주세요.');
        return;
      }
      onNext({
        role: 'nurse',
        nickname: nickname.trim(),
        hospitalName: hospitalName.trim(),
        wardName: wardName.trim() || '일반병동',
        experienceYears: Number(experienceYears) || 1,
      });
    } else {
      if (!schoolName.trim()) {
        Alert.alert('확인', '소속 대학교명을 입력해 주세요.');
        return;
      }
      onNext({
        role: 'student',
        nickname: nickname.trim(),
        schoolName: schoolName.trim(),
        schoolGrade,
      });
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* 헤딩 영역 */}
      <View style={styles.headingSection}>
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>1단계 · 프로필 설정</Text>
        </View>
        <Text style={styles.mainTitle}>어떤 분이신가요? 🩺</Text>
        <Text style={styles.subtitle}>
          맞춤 교대근무 캘린더와 전용 커뮤니티를 준비해 드릴게요.
        </Text>
      </View>

      {/* 역할 선택 2열 카드 (토스 스타일 세그먼트) */}
      <View style={styles.roleGrid}>
        {/* 간호사 카드 */}
        <TouchableOpacity
          style={[
            styles.roleCard,
            role === 'nurse' && styles.roleCardActiveNurse,
          ]}
          onPress={() => setRole('nurse')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="현직 간호사 선택"
        >
          <View style={styles.roleHeader}>
            <Text style={styles.roleEmoji}>🩺</Text>
            {role === 'nurse' && (
              <View style={styles.checkChipNurse}>
                <Text style={styles.checkChipTextNurse}>선택됨</Text>
              </View>
            )}
          </View>
          <Text style={[styles.roleTitle, role === 'nurse' && styles.roleTitleActiveNurse]}>
            현직 간호사 (RN)
          </Text>
          <Text style={styles.roleDesc}>
            병원 교대근무 중이거나{'\n'}근무 예정인 간호사
          </Text>
        </TouchableOpacity>

        {/* 간호대학생 카드 */}
        <TouchableOpacity
          style={[
            styles.roleCard,
            role === 'student' && styles.roleCardActiveStudent,
          ]}
          onPress={() => setRole('student')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="간호대학생 선택"
        >
          <View style={styles.roleHeader}>
            <Text style={styles.roleEmoji}>🎓</Text>
            {role === 'student' && (
              <View style={styles.checkChipStudent}>
                <Text style={styles.checkChipTextStudent}>선택됨</Text>
              </View>
            )}
          </View>
          <Text style={[styles.roleTitle, role === 'student' && styles.roleTitleActiveStudent]}>
            간호대학생 (SN)
          </Text>
          <Text style={styles.roleDesc}>
            간호학과에 재학/휴학{'\n'}중인 예비 간호사
          </Text>
        </TouchableOpacity>
      </View>

      {/* 폼 입력 영역 */}
      <View style={styles.formContainer}>
        <Input
          label="닉네임 (활동명)"
          placeholder="예: 나이팅게일"
          value={nickname}
          onChangeText={setNickname}
          maxLength={12}
          returnKeyType="next"
          onSubmitEditing={() => {
            if (role === 'nurse') {
              hospitalInputRef.current?.focus();
            } else {
              schoolInputRef.current?.focus();
            }
          }}
        />

        {role === 'nurse' ? (
          <>
            <Input
              ref={hospitalInputRef}
              label="소속 병원"
              placeholder="예: 서울아산병원"
              value={hospitalName}
              onChangeText={setHospitalName}
              returnKeyType="next"
              onSubmitEditing={() => wardInputRef.current?.focus()}
            />
            <Input
              ref={wardInputRef}
              label="소속 병동 / 부서"
              placeholder="예: 82병동, 응급의학과"
              value={wardName}
              onChangeText={setWardName}
              returnKeyType="next"
              onSubmitEditing={() => expInputRef.current?.focus()}
            />
            <Input
              ref={expInputRef}
              label="임상 연차"
              placeholder="예: 3 (숫자만 입력)"
              value={experienceYears}
              onChangeText={setExperienceYears}
              keyboardType="number-pad"
              maxLength={2}
              returnKeyType="done"
              onSubmitEditing={handleNext}
            />
          </>
        ) : (
          <>
            <Input
              ref={schoolInputRef}
              label="소속 대학교"
              placeholder="예: 서울대학교 간호대학"
              value={schoolName}
              onChangeText={setSchoolName}
              returnKeyType="done"
              onSubmitEditing={handleNext}
            />
            <View style={styles.gradeSection}>
              <Text style={styles.gradeLabel}>현재 학년</Text>
              <View style={styles.gradeChipsRow}>
                {GRADES.map((g) => {
                  const isSelected = schoolGrade === g;
                  return (
                    <TouchableOpacity
                      key={g}
                      style={[
                        styles.gradeChip,
                        isSelected && styles.gradeChipActive,
                      ]}
                      onPress={() => setSchoolGrade(g)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.gradeChipText,
                          isSelected && styles.gradeChipTextActive,
                        ]}
                      >
                        {g}학년
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </>
        )}
      </View>

      {/* 하단 CTA */}
      <View style={styles.footerSection}>
        <Button
          title="다음 단계로 (1/3)"
          onPress={handleNext}
          style={styles.nextButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  headingSection: {
    marginBottom: 24,
  },
  stepBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF0F3',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  stepBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#191F28',
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6B7280',
    fontWeight: '500',
  },
  roleGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  roleCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#F1F3F5',
    minHeight: 126,
    justifyContent: 'space-between',
  },
  roleCardActiveNurse: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFF5F7',
  },
  roleCardActiveStudent: {
    borderColor: '#6D5D50',
    backgroundColor: '#F7F3EE',
  },
  roleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleEmoji: {
    fontSize: 28,
  },
  checkChipNurse: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
  },
  checkChipTextNurse: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  checkChipStudent: {
    backgroundColor: '#6D5D50',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
  },
  checkChipTextStudent: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#333D4B',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  roleTitleActiveNurse: {
    color: COLORS.primary,
  },
  roleTitleActiveStudent: {
    color: '#5A4A3E',
  },
  roleDesc: {
    fontSize: 12,
    lineHeight: 17,
    color: '#8B95A1',
    fontWeight: '500',
  },
  formContainer: {
    marginBottom: 32,
    gap: 16,
  },
  gradeSection: {
    marginTop: 4,
  },
  gradeLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333D4B',
    marginBottom: 10,
  },
  gradeChipsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  gradeChip: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E8EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeChipActive: {
    backgroundColor: '#6D5D50',
    borderColor: '#6D5D50',
  },
  gradeChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4E5968',
  },
  gradeChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  footerSection: {
    marginTop: 8,
  },
  nextButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primary,
  },
});

