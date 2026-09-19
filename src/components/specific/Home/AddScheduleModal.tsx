import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../../../constants/theme';
import { useShiftScheduleStore } from '../../../store/useShiftScheduleStore';
import { useUserStore } from '../../../store/useUserStore';
import { ocrApi } from '../../../services/ocrApi';
import { CustomShiftCode } from '../../../types/shift';
import { SwipeableBottomSheet } from '../../common/SwipeableBottomSheet';
import {
  ScheduleUploadTab,
  ScheduleManualInputTab,
  ScheduleCustomCodeTab,
} from './AddSchedule';

interface AddScheduleModalProps {
  visible: boolean;
  onClose: () => void;
}

type TabType = 'upload' | 'manual' | 'custom_code';

export const AddScheduleModal: React.FC<AddScheduleModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    currentDate,
    schedules,
    customCodes,
    setShiftForDate,
    updateCustomCode,
    deleteCustomCode,
    getOffCodes,
    applyUploadedSchedules,
  } = useShiftScheduleStore();
  const userId = useUserStore((s) => s.id);

  // 기본 탭: 직접 퀵 입력 모드 (파일 인식 기능 준비 중)
  const [activeTab, setActiveTab] = useState<TabType>('manual');

  // 모달이 열릴 때 항상 직접 퀵 입력 탭이 먼저 뜨도록 보장
  React.useEffect(() => {
    if (visible) {
      setActiveTab('manual');
    }
  }, [visible]);

  // 파일 업로드 시뮬레이션 상태
  const [uploadingFileType, setUploadingFileType] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<Record<string, string> | null>(null);

  // 직접 입력 모드 상태
  const [selectedDay, setSelectedDay] = useState<number>(1);

  // 듀티 커스텀 코드 설정 상태
  const [editCode, setEditCode] = useState('F');
  const [editName, setEditName] = useState('오프(휴무)');
  const [editColor, setEditColor] = useState('#E84A5F');
  const [editIsOff, setEditIsOff] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // 실제 카메라/갤러리 이미지 선택 및 OCR 연동
  const handlePickImage = async (source: 'camera' | 'library') => {
    try {
      let result: ImagePicker.ImagePickerResult;
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('권한 필요', '근무표 촬영을 위해 카메라 접근 권한이 필요합니다.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          base64: true,
          quality: 0.7,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('권한 필요', '근무표 사진을 선택하기 위해 사진첩 접근 권한이 필요합니다.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          base64: true,
          quality: 0.7,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setUploadingFileType(source === 'camera' ? '카메라 촬영 사진' : '갤러리 선택 사진');
        setIsScanning(true);
        setScanResult(null);

        const targetYm = `${year}-${String(month + 1).padStart(2, '0')}`;
        try {
          if (asset.base64) {
            const offCodes = getOffCodes();
            const ocrRes = await ocrApi.parseScheduleImage({
              imageBase64: asset.base64,
              mimeType: asset.mimeType || 'image/jpeg',
              yearMonth: targetYm,
              customCodes,
              offCodes,
            });

            if (ocrRes.success && ocrRes.schedules && ocrRes.schedules.length > 0) {
              const parsedMap: Record<string, string> = {};
              ocrRes.schedules.forEach((item) => {
                parsedMap[item.date] = item.shiftCode;
              });
              setScanResult(parsedMap);
              setIsScanning(false);
              return;
            } else {
              // 🚫 가상 데이터 생성 금지 — 정직한 에러 알림
              setIsScanning(false);
              setScanResult(null);
              Alert.alert(
                '근무표 인식 실패',
                ocrRes.error ||
                  '근무표 이미지에서 스케줄을 인식하지 못했습니다.\n사진의 글자가 흐리거나 잘리지 않았는지 확인 후 다시 시도해 주세요.\n(상단의 [우리 병동 근무 표기 설정]에서 오프 기호가 맞게 등록되어 있는지도 확인해 보세요.)'
              );
              return;
            }
          } else {
            setIsScanning(false);
            Alert.alert('오류', '이미지 데이터를 읽어오지 못했습니다. 다시 촬영하거나 선택해 주세요.');
          }
        } catch (apiError: any) {
          setIsScanning(false);
          setScanResult(null);
          Alert.alert(
            '근무표 분석 오류',
            apiError?.message || '근무표 이미지를 분석하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
          );
        }
      }
    } catch (e: any) {
      setIsScanning(false);
      Alert.alert('오류', '이미지를 불러오는 중 문제가 발생했습니다: ' + e?.message);
    }
  };

  const handleStartUpload = (_type: 'pdf' | 'excel' | 'image') => {
    Alert.alert(
      '기능 준비 중 안내',
      '근무표 사진, Excel 및 PDF 자동 인식 기능은 현재 고도화 준비 중입니다. 🚧\n\n현재는 [직접 퀵 입력] 탭을 통해 간편하고 빠르게 근무표를 등록하실 수 있습니다!',
      [
        { text: '확인', style: 'default' },
        { text: '직접 입력하기', onPress: () => setActiveTab('manual') },
      ]
    );
  };

  const handleApplyScanResult = () => {
    if (scanResult) {
      applyUploadedSchedules(scanResult, userId || undefined);
      Alert.alert('완료', `${month + 1}월 스케줄 31일치가 성공적으로 등록되었습니다!`);
      setScanResult(null);
      setUploadingFileType(null);
      onClose();
    }
  };

  // 직접 입력: 선택한 날짜에 듀티 코드 적용
  const handleAssignShiftToDay = (code: string) => {
    const dStr = String(selectedDay).padStart(2, '0');
    const mStr = String(month + 1).padStart(2, '0');
    const dateKey = `${year}-${mStr}-${dStr}`;
    setShiftForDate(dateKey, code, userId || undefined);
    // 다음 날로 자동 포커스 이동 (쾌속 입력 UX)
    if (selectedDay < daysInMonth) {
      setSelectedDay(selectedDay + 1);
    }
  };

  // 듀티 커스텀 코드 저장
  const handleSaveCustomCode = () => {
    if (!editCode.trim() || !editName.trim()) {
      Alert.alert('알림', '코드와 라벨명을 모두 입력해주세요.');
      return;
    }
    updateCustomCode(
      editCode.trim().toUpperCase(),
      editName.trim(),
      editColor,
      editIsOff,
      userId || undefined
    );
    Alert.alert('설정 완료', `[${editCode.toUpperCase()}] ${editName} 코드가 저장되었습니다.`);
  };

  const handleSelectCodeToEdit = (item: CustomShiftCode) => {
    setEditCode(item.code);
    setEditName(item.name);
    setEditColor(item.color);
    setEditIsOff(
      item.isOff ?? (item.code === 'O' || item.name.includes('오프') || item.name.includes('휴'))
    );
  };

  return (
    <SwipeableBottomSheet
      visible={visible}
      onClose={onClose}
      maxHeight="92%"
    >
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>스케줄 추가 및 설정</Text>
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.closeText}>닫기</Text>
        </TouchableOpacity>
      </View>

      {/* 상단 3개 탭 네비게이션: 직접 입력 우선 배치 */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'manual' && styles.tabItemActive]}
          onPress={() => setActiveTab('manual')}
        >
          <Text style={[styles.tabText, activeTab === 'manual' && styles.tabTextActive]}>
            직접 퀵 입력
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'upload' && styles.tabItemActive]}
          onPress={() => setActiveTab('upload')}
        >
          <Text style={[styles.tabText, activeTab === 'upload' && styles.tabTextActive]}>
            스마트 파일 인식 (준비 중)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'custom_code' && styles.tabItemActive]}
          onPress={() => setActiveTab('custom_code')}
        >
          <Text style={[styles.tabText, activeTab === 'custom_code' && styles.tabTextActive]}>
            듀티 코드 설정
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === 'manual' && (
          <ScheduleManualInputTab
            month={month}
            year={year}
            daysInMonth={daysInMonth}
            selectedDay={selectedDay}
            schedules={schedules}
            customCodes={customCodes}
            onSelectDay={setSelectedDay}
            onAssignShift={handleAssignShiftToDay}
          />
        )}

        {activeTab === 'upload' && (
          <ScheduleUploadTab
            month={month}
            year={year}
            customCodes={customCodes}
            isScanning={isScanning}
            uploadingFileType={uploadingFileType}
            scanResult={scanResult}
            onStartUpload={handleStartUpload}
            onApplyScanResult={handleApplyScanResult}
            onGoToCustomCodeTab={() => setActiveTab('custom_code')}
            onGoToManualTab={() => setActiveTab('manual')}
          />
        )}

        {activeTab === 'custom_code' && (
              <ScheduleCustomCodeTab
                customCodes={customCodes}
                editCode={editCode}
                editName={editName}
                editColor={editColor}
                editIsOff={editIsOff}
                onChangeEditCode={setEditCode}
                onChangeEditName={setEditName}
                onChangeEditColor={setEditColor}
                onChangeEditIsOff={setEditIsOff}
                onSelectCodeToEdit={handleSelectCodeToEdit}
                onDeleteCustomCode={deleteCustomCode}
                onSaveCustomCode={handleSaveCustomCode}
              />
            )}
          </ScrollView>
    </SwipeableBottomSheet>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  closeText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingHorizontal: 16,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
});

export default AddScheduleModal;
