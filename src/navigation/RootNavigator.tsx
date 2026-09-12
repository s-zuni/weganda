import React from 'react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useUserStore } from '../store/useUserStore';
import AuthNavigator from './AuthNavigator';
import BottomTabNavigator from './BottomTabNavigator';

const Stack = createNativeStackNavigator();

const linking: LinkingOptions<any> = {
  prefixes: ['weganda://', 'https://weganda.app', 'https://weganda.kr', 'https://www.weganda.kr'],
  config: {
    screens: {
      Main: {
        screens: {
          HomeTab: 'home',
          FriendsTab: 'friends',
          FortuneTab: 'fortune',
          StudyTab: 'study',
          CommunityTab: 'community',
        },
      },
      Auth: {
        screens: {
          Login: 'login',
          Onboarding: 'onboarding',
        },
      },
    },
  },
};

export const RootNavigator: React.FC = () => {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const hasCompletedOnboarding = useUserStore((state) => state.hasCompletedOnboarding);

  const showMain = isAuthenticated && hasCompletedOnboarding;

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {showMain ? (
          <Stack.Screen name="Main" component={BottomTabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;

