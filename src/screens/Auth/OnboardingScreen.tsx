import React from 'react';
import { OnboardingFlowScreen } from './OnboardingFlowScreen';

interface OnboardingScreenProps {
  navigation: any;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  return <OnboardingFlowScreen navigation={navigation} />;
};

export default OnboardingScreen;
