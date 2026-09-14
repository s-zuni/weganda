import React from 'react';
import { MyPageModal } from '../../components/specific/MyPage/MyPageModal';

interface MyPageScreenProps {
  navigation: any;
}

export const MyPageScreen: React.FC<MyPageScreenProps> = ({ navigation }) => {
  const handleClose = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('HomeTab');
    }
  };

  return (
    <MyPageModal
      visible={true}
      onClose={handleClose}
      isScreen={true}
    />
  );
};

export default MyPageScreen;

