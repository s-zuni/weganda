import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { OnboardingScreen } from '../screens/Auth/OnboardingScreen';

import { useUserStore } from '../store/useUserStore';

const Stack = createNativeStackNavigator();

export const AuthNavigator: React.FC = () => {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const hasCompletedOnboarding = useUserStore((state) => state.hasCompletedOnboarding);

  const initialRoute = isAuthenticated && !hasCompletedOnboarding ? 'Onboarding' : 'Login';

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;

