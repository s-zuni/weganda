import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { OnboardingScreen } from '../screens/Auth/OnboardingScreen';
import { ConsentScreen } from '../screens/Auth/ConsentScreen';

import { useUserStore } from '../store/useUserStore';

const Stack = createNativeStackNavigator();

export const AuthNavigator: React.FC = () => {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const hasCompletedOnboarding = useUserStore((state) => state.hasCompletedOnboarding);

  const needsConsent = useUserStore((state) => state.needsConsent);

  const initialRoute = isAuthenticated && needsConsent
    ? 'Consent'
    : isAuthenticated && !hasCompletedOnboarding
    ? 'Onboarding'
    : 'Login';

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Consent" component={ConsentScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;

