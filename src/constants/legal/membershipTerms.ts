import { LegalDocument } from './types';

export const MEMBERSHIP_TERMS: LegalDocument = {
  id: 'membership',
  title: '우간다+ 멤버십 이용약관 및 환불 규정',
  shortTitle: '우간다+ 멤버십 이용약관',
  path: '/membership',
  effectiveDate: '2026년 9월 1일 시행',
  version: 'v1.0',
  summary:
    '본 약관은 우간다가 제공하는 프리미엄 유료 멤버십 ‘weganda+’ 정기구독 서비스의 이용 조건, 요금 결제, 7일 무료체험, 자동 갱신, 해지 및 청약철회/환불에 관한 제반 기준을 규정합니다. (Apple App Store 및 Google Play 인앱결제 정책 준수)',
  articles: [
    {
      articleNumber: '제1조 (목적 및 적용 범위)',
      title: '목적 및 적용 범위',
      paragraphs: [
        '1. 본 약관은 회사가 제공하는 프리미엄 멤버십 ‘weganda+’(이하 ‘유료서비스’라 합니다)를 이용하는 회원과 회사 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.',
        '2. 본 약관에 명시되지 않은 사항은 우간다 서비스 이용약관 및 해당 결제 마켓(Apple App Store, Google Play Store)의 운영 정책을 따릅니다.',
      ],
    },
    {
      articleNumber: '제2조 (유료서비스 상품 안내 및 요금)',
      title: '유료서비스 상품 안내 및 요금',
      paragraphs: [
        '1. 회사가 제공하는 ‘weganda+’ 멤버십의 상품 구성 및 정상 이용 요금은 다음과 같습니다.',
      ],
      subList: [
        {
          items: [
            '• weganda+ 월간 정기구독: 월 7,800원 (VAT 포함)',
            '• weganda+ 연간 정기구독: 연 78,000원 (VAT 포함, 약 17% 할인 혜택 적용)',
          ],
        },
        {
          subTitle: 'weganda+ 제공 혜택',
          items: [
            '① 앱 커스텀 컬러 테마 자유 설정 (딥 그린, 딥 블루, 옐로, 퍼플 등 5종)',
            '② 듀티 사주 및 맞춤 간호 운세 무제한 조회 (무료 회원 월 5회 제한 해제)',
            '③ 야간/휴일 수당 및 월급 자동 예측기 무제한 열람',
            '④ 임상 약물 계산기 및 Ask AI 무제한 질의응답 (무료 회원 일 3회 제한 해제)',
            '⑤ 동기 듀티 무제한 연동 및 AI 모임 날짜 자동 추천 (무료 회원 3명 제한 해제)',
          ],
        },
      ],
    },
    {
      articleNumber: '제3조 (7일 무료 체험 프로모션)',
      title: '7일 무료 체험 프로모션',
      paragraphs: [
        '1. 회사는 최초로 weganda+를 구독하는 회원에게 ‘7일 무료 체험(Free Trial)’ 혜택을 1회에 한하여 제공할 수 있습니다.',
        '2. 무료 체험 기간 동안에는 요금이 청구되지 않으며, 무료 체험 종료 최소 24시간 전까지 구독을 취소하지 않으면 선택한 구독 요금(월 7,800원 등)이 자동으로 정기 결제됩니다.',
        '3. 회원은 기기 설정(Apple ID 또는 Google 계정)에서 언제든지 무료 체험 취소 및 구독 해지를 진행할 수 있습니다.',
      ],
      highlightBox: {
        title: '🎁 7일 무료 체험 및 자동 결제 주의사항',
        description:
          '무료 체험 종료 24시간 전까지 구독을 해지하시면 비용이 전혀 발생하지 않습니다. 무료 체험 기간이 지나면 자동으로 정기 결제가 시작됩니다.',
        variant: 'coral',
      },
    },
    {
      articleNumber: '제4조 (자동 갱신 및 결제 방식)',
      title: '자동 갱신 및 결제 방식',
      paragraphs: [
        '1. weganda+는 정기구독(Auto-Renewable Subscription) 방식으로 제공되며, 현재 구독 기간 종료 최소 24시간 전에 취소하지 않는 한 동일한 기간 및 금액으로 자동 갱신됩니다.',
        '2. 결제는 회원의 Apple App Store 또는 Google Play 계정에 등록된 결제 수단으로 진행됩니다.',
        '3. 앱을 기기에서 삭제(언인스톨)하더라도 스토어 상의 정기구독이 자동으로 취소되지 않으므로, 반드시 각 스토어 계정 관리 메뉴에서 구독을 해지하셔야 합니다.',
      ],
    },
    {
      articleNumber: '제5조 (구독 해지 방법)',
      title: '구독 해지 방법',
      paragraphs: [
        '회원은 언제든지 다음의 경로를 통해 자동 갱신을 해지할 수 있으며, 해지하더라도 이미 결제된 남은 구독 기간 동안은 유료 혜택을 정상적으로 이용하실 수 있습니다.',
      ],
      subList: [
        {
          subTitle: '• iOS (Apple App Store)',
          items: [
            '아이폰 [설정] 앱 > 상단 [내 Apple ID (이름)] 선택 > [구독] 메뉴 > [우간다(Weganda)] 선택 > [구독 취소] 클릭',
          ],
        },
        {
          subTitle: '• Android (Google Play Store)',
          items: [
            '[Google Play 스토어] 앱 실행 > 우측 상단 [프로필 아이콘] > [결제 및 정기 결제] > [정기 결제] > [우간다(Weganda)] 선택 > [구독 취소] 클릭',
          ],
        },
      ],
    },
    {
      articleNumber: '제6조 (청약철회 및 환불 규정)',
      title: '청약철회 및 환불 규정',
      paragraphs: [
        '1. 회원은 유료 결제일로부터 7일 이내에 유료서비스의 혜택을 전혀 사용하지 않은 경우 「전자상거래 등에서의 소비자보호에 관한 법률」에 따라 청약철회(전액 환불)를 요청할 수 있습니다.',
        '2. 다만, 다음 각 호에 해당하는 경우 청약철회가 제한될 수 있습니다.',
      ],
      subList: [
        {
          items: [
            '① 결제 후 유료 전용 기능(무제한 운세 열람, 월급 예측 데이터 열람, AI 무제한 사용 등)을 이미 1회 이상 이용한 경우',
            '② 회원의 책임 있는 사유로 서비스 이용이 제한되거나 계정이 영구 정지된 경우',
            '③ 결제일로부터 7일이 경과한 경우',
          ],
        },
      ],
    },
    {
      articleNumber: '제7조 (스토어별 환불 신청 절차 안내)',
      title: '스토어별 환불 신청 절차 안내',
      paragraphs: [
        '인앱결제(In-App Purchase)는 Apple 및 Google의 결제 플랫폼 정책을 따르며, 환불 신청 절차는 아래와 같습니다.',
      ],
      subList: [
        {
          subTitle: '1. Apple App Store (iOS) 환불',
          items: [
            '• Apple의 개인정보 및 결제 보안 정책상 회사는 회원의 결제 내역을 직접 취소하거나 환불을 진행할 권한이 없습니다.',
            '• 회원은 Apple 환불 웹사이트(https://reportaproblem.apple.com)에 로그인 후 해당 결제 건을 선택하여 직접 환불을 요청하셔야 합니다.',
          ],
        },
        {
          subTitle: '2. Google Play Store (Android) 환불',
          items: [
            '• Google Play 고객센터 또는 회사 고객지원팀(contact@weganda.kr)으로 Google 주문번호(GPA.XXXX-XXXX-XXXXX)와 계정 정보를 전달해 주시면 검토 후 처리됩니다.',
          ],
        },
      ],
      highlightBox: {
        title: '📱 인앱결제 구매 복원 (Restore Purchases) 안내',
        description:
          '기기를 변경하거나 앱을 재설치한 경우, 결제한 스토어 계정으로 로그인 후 [weganda+ 멤버십 화면 > 구매 내역 복원하기] 버튼을 누르면 추가 비용 없이 즉시 멤버십이 활성화됩니다.',
        variant: 'info',
      },
    },
    {
      articleNumber: '제8조 (고객 지원 및 분쟁 처리)',
      title: '고객 지원 및 분쟁 처리',
      paragraphs: [
        '유료 서비스 이용과 관련한 문의, 불만 처리, 오류 제보는 공식 고객센터를 통해 신속하게 접수 및 처리됩니다.',
        '• 공식 고객 문의: contact@weganda.kr',
        '• 운영 시간: 평일 09:00 ~ 18:00 (공휴일 제외, 24시간 이내 답변 원칙)',
      ],
    },
  ],
};

