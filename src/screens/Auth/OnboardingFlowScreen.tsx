import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, View } from 'react-native';
import { useUserStore } from '../../store/useUserStore';
import { useVerificationStore } from '../../store/useVerificationStore';
import { profileApi } from '../../services/profileApi';
import {
  OnboardingProgressBar,
  Step1ProfileSetup,
  Step2Verification,
  Step3MembershipEvent,
  Step1Data,
} from '../../components/specific/Onboarding';
import { VerificationSubmissionData } from '../../types/verification';

interface OnboardingFlowScreenProps {
  navigation: any;
}

export const OnboardingFlowScreen: React.FC<OnboardingFlowScreenProps> = ({
  navigation,
}) => {
  const storeUser = useUserStore();
  const {
    id: userId,
    setUser,
    setVerificationState,
    completeOnboarding,
    updateUserProfile,
  } = storeUser;

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [profileData, setProfileData] = useState<Step1Data>({
    role: (storeUser.role === 'student' ? 'student' : 'nurse'),
    nickname: storeUser.nickname || storeUser.name || '',
    hospitalName: storeUser.hospitalName || '',
    wardName: storeUser.wardName || '',
    experienceYears: storeUser.experienceYears ?? 1,
    schoolName: storeUser.schoolName || '',
    schoolGrade: storeUser.schoolGrade || 1,
  });

  const submitVerification = useVerificationStore(
    (state) => state.submitVerification
  );

  // 뒤로가기 핸들러
  const handleBack = () => {
    if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      navigation.goBack();
    }
  };

  // 1단계 완료 -> 2단계로
  const handleStep1Complete = (data: Step1Data) => {
    setProfileData(data);
    setUser({
      name: data.nickname,
      nickname: data.nickname,
      role: data.role === 'nurse' ? 'nurse' : 'student',
      hospitalName: data.role === 'nurse' ? (data.hospitalName || '종합병원') : (data.schoolName || '간호대학'),
      wardName: data.role === 'nurse' ? (data.wardName || '일반병동') : `${data.schoolGrade || 1}학년`,
      experienceYears: data.experienceYears !== undefined ? data.experienceYears : 1,
      schoolName: data.schoolName,
      schoolGrade: data.schoolGrade,
    });
    setCurrentStep(2);
  };

  // 2단계 서류/이메일 인증 제출
  const handleSubmitVerification = async (data: VerificationSubmissionData) => {
    const effectiveUserId = userId || `user_${Date.now()}`;
    await submitVerification(
      effectiveUserId,
      profileData.nickname || '사용자',
      undefined,
      data
    );
    setVerificationState({
      verificationStatus: 'pending',
      verificationRole: profileData.role,
    });
  };

  // 2단계 건너뛰기
  const handleSkipVerification = () => {
    setVerificationState({
      verificationStatus: 'none',
      verificationRole: profileData.role,
    });
    setCurrentStep(3);
  };

  // 3단계 완료 -> 최종 온보딩 종료 & DB 저장 & 홈 이동
  const handleFinalComplete = async () => {
    const finalNickname = profileData.nickname || storeUser.nickname || '간호사';
    const finalRole = profileData.role === 'nurse' ? 'nurse' : 'student';
    const finalHospital =
      profileData.role === 'nurse'
        ? (profileData.hospitalName || '종합병원')
        : (profileData.schoolName || '간호대학');
    const finalWard =
      profileData.role === 'nurse'
        ? (profileData.wardName || '일반병동')
        : `${profileData.schoolGrade || 1}학년`;
    const finalExp =
      profileData.experienceYears !== undefined
        ? profileData.experienceYears
        : (profileData.role === 'nurse' ? 1 : 0);

    // Zustand 스토어 즉시 업데이트
    setUser({
      name: finalNickname,
      nickname: finalNickname,
      role: finalRole,
      hospitalName: finalHospital,
      wardName: finalWard,
      experienceYears: finalExp,
      schoolName: profileData.schoolName,
      schoolGrade: profileData.schoolGrade,
    });

    try {
      // Supabase profiles 테이블 업데이트
      await profileApi.updateProfile({
        nickname: finalNickname,
        hospital_name: finalHospital,
        ward_name: finalWard,
        experience_years: finalExp,
        role: finalRole,
      });

      await updateUserProfile({
        name: finalNickname,
        nickname: finalNickname,
        hospitalName: finalHospital,
        wardName: finalWard,
        experienceYears: finalExp,
        role: finalRole,
      });
    } catch (e) {
      console.warn('온보딩 프로필 DB 저장 실패 (로컬 스토어 유지):', e);
    }
    completeOnboarding();
  };

  const currentOrgName =
    profileData.role === 'nurse'
      ? profileData.hospitalName || '종합병원'
      : profileData.schoolName || '간호대학';

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 3단계 프로그레스 바 */}
      <OnboardingProgressBar
        currentStep={currentStep}
        totalSteps={3}
        onBack={handleBack}
        canGoBack={true}
      />

      <View style={styles.body}>
        {currentStep === 1 && (
          <Step1ProfileSetup
            initialData={profileData}
            onNext={handleStep1Complete}
          />
        )}

        {currentStep === 2 && (
          <Step2Verification
            role={profileData.role}
            organizationName={currentOrgName}
            onSubmitVerification={handleSubmitVerification}
            onSkip={handleSkipVerification}
            onNext={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 3 && (
          <Step3MembershipEvent
            onComplete={handleFinalComplete}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  body: {
    flex: 1,
  },
});

