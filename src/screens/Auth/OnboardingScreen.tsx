import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Input, Button, Header } from '../../components/common';
import { COLORS } from '../../constants/theme';
import { useUserStore } from '../../store/useUserStore';

interface OnboardingScreenProps {
  navigation: any;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [wardName, setWardName] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const setUser = useUserStore((state) => state.setUser);

  const handleComplete = () => {
    if (!name || !hospitalName) {
      Alert.alert('알림', '이름과 소속 병원을 입력해주세요.');
      return;
    }

    setUser({
      id: `user_${Date.now()}`,
      name,
      hospitalName,
      wardName,
      experienceYears: Number(experienceYears) || 1,
      isAuthenticated: true,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="프로필 설정" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>간호사 프로필을 완성해주세요 🩺</Text>
        <Text style={styles.sectionDesc}>
          정확한 근무표와 맞춤형 운세, 동기 매칭을 위해 필요한 정보입니다.
        </Text>

        <View style={styles.form}>
          <Input
            label="이름 (닉네임)"
            placeholder="예: 간호사 김우간"
            value={name}
            onChangeText={setName}
          />
          <Input
            label="소속 병원"
            placeholder="예: 서울아산병원"
            value={hospitalName}
            onChangeText={setHospitalName}
          />
          <Input
            label="소속 병동 / 부서"
            placeholder="예: 응급의학과, 82병동"
            value={wardName}
            onChangeText={setWardName}
          />
          <Input
            label="임상 연차"
            placeholder="예: 3 (숫자만 입력)"
            value={experienceYears}
            onChangeText={setExperienceYears}
            keyboardType="number-pad"
          />

          <Button
            title="우간다 시작하기"
            onPress={handleComplete}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  sectionDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 6,
    marginBottom: 24,
    lineHeight: 20,
  },
  form: {
    width: '100%',
  },
  submitButton: {
    marginTop: 24,
  },
});

