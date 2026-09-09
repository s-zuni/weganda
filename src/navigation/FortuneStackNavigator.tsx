import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FortuneScreen } from '../screens/Fortune/FortuneScreen';
import { SajuCategoryTopicsScreen } from '../screens/Fortune/SajuCategoryTopicsScreen';
import { SajuDetailResultScreen } from '../screens/Fortune/SajuDetailResultScreen';
import { SajuCategoryId } from '../mocks/sajuCategories';

export type FortuneStackParamList = {
  FortuneHome: undefined;
  SajuCategoryTopics: {
    categoryId: SajuCategoryId;
  };
  SajuDetailResult: {
    topicId: string;
  };
};

const Stack = createNativeStackNavigator<FortuneStackParamList>();

export const FortuneStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="FortuneHome"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="FortuneHome" component={FortuneScreen} />
      <Stack.Screen name="SajuCategoryTopics" component={SajuCategoryTopicsScreen} />
      <Stack.Screen name="SajuDetailResult" component={SajuDetailResultScreen} />
    </Stack.Navigator>
  );
};

export default FortuneStackNavigator;

