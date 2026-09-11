import * as Contacts from 'expo-contacts';

export interface DeviceContact {
  id: string;
  name: string;
  phoneNumber?: string;
}

export const contactService = {
  // 연락처 권한 요청 및 연락처 목록 가져오기
  async getDeviceContacts(): Promise<{ success: boolean; contacts: DeviceContact[]; message?: string }> {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        return {
          success: false,
          contacts: [],
          message: '연락처 접근 권한이 필요합니다. 설정에서 권한을 허용해 주세요.',
        };
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
        sort: Contacts.SortTypes.FirstName,
      });

      if (!data || data.length === 0) {
        return { success: true, contacts: [] };
      }

      const formattedContacts: DeviceContact[] = data
        .filter((c) => c.name && c.phoneNumbers && c.phoneNumbers.length > 0)
        .map((c) => {
          const rawNumber = c.phoneNumbers?.[0]?.number || '';
          const cleanNumber = rawNumber.replace(/[^0-9]/g, '');
          return {
            id: c.id || Math.random().toString(),
            name: c.name || '알 수 없음',
            phoneNumber: cleanNumber,
          };
        });

      return { success: true, contacts: formattedContacts };
    } catch (error: any) {
      console.warn('Failed to load device contacts:', error);
      return {
        success: false,
        contacts: [],
        message: '연락처를 불러오는 중 오류가 발생했습니다.',
      };
    }
  },
};

