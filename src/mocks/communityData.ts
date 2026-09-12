import { ReplyItem, CommentItem, PostItem, HotTopic } from '../types/community';
export type { ReplyItem, CommentItem, PostItem, HotTopic };

export const MOCK_HOT_TOPICS: HotTopic[] = [
  {
    id: 'p12',
    rank: 1,
    category: '간호대생 라운지',
    title: '간호사 국가고시 D-100 성인간호학 & 기본간호학 빈출 요약본 배포',
    likes: 210,
    comments: 18,
  },
  {
    id: 'p10',
    rank: 2,
    category: '자유게시판',
    title: '퇴원하시는 할머니께서 쥐어주신 손편지와 사탕 두 알 🍬',
    likes: 176,
    comments: 22,
  },
  {
    id: 'p13',
    rank: 3,
    category: '채용/취업 정보',
    title: '대학병원 블라인드 면접 1분 자기소개 & 상황 질문(인성) 합격 스크립트',
    likes: 158,
    comments: 14,
  },
  {
    id: 'p8',
    rank: 4,
    category: '임상/질문',
    title: '중환자실/응급실 다빈도 승압제(노르에피네프린 vs 도파민) 라인 분리 및 주의점',
    likes: 142,
    comments: 16,
  },
  {
    id: 'p1',
    rank: 5,
    category: '임상/질문',
    title: '혈관 안 보이는 고령 환자 IV 원샷 비결 족보 정리',
    likes: 128,
    comments: 46,
  },
];

// ── 신고 사유 리스트 ──
export const REPORT_REASONS = [
  '병원 또는 환자 개인정보 유출 (의료법 위반)',
  '욕설, 비방, 태움 등 모욕 및 혐오 표현',
  '상업적 홍보, 스팸 또는 도배글',
  '허위사실 유포 또는 확인되지 않은 루머',
  '기타 서비스 운영 정책 위반',
];

// ── 커뮤니티 게시글 Mock Data ──
export const MOCK_POSTS_DATA: PostItem[] = [
  {
    id: 'p1',
    category: '임상/질문',
    title: '혈관 안 보이는 고령 환자 IV 원샷 비결 족보 정리',
    content: `신규 때 혈관 안 잡혀서 환자분께 죄송하고 식은땀 흘렸던 기억 다들 있으시죠?
제가 7년 동안 응급실과 내과 병동 돌면서 정리한 IV 팁 공유합니다!

1. 토니켓은 생각보다 강하게 묶고 심장보다 아래로 내리기
2. 눈으로 보려 하지 말고 손끝 촉각으로 탄력(bouncing) 느끼기
3. 밸브 피해서 천천히 진입하고 플래시백 보이면 각도 낮춰서 카테터만 밀어넣기

필요하신 분들 북마크해두고 출근 전이나 스테이션에서 참고하세요!`,
    authorId: 'user_er_senior',
    authorName: '응급실베테랑',
    authorHospital: '서울아산병원',
    isVerifiedHospital: true,
    isAnonymous: false,
    isMyPost: false,
    views: 840,
    likes: 128,
    isLiked: false,
    isBookmarked: true,
    timeAgo: '25분 전',
    images: [
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop&q=60',
    ],
    commentsCount: 3,
    comments: [
      {
        id: 'c1',
        postId: 'p1',
        authorId: 'user_novice',
        authorName: '병아리신규',
        authorHospital: '세브란스병원',
        isVerifiedHospital: true,
        isAnonymous: false,
        content: '선생님 진짜 구세주세요 ㅠㅠ 내일 데이 출근인데 정독하고 갑니다!',
        timeAgo: '15분 전',
        likes: 12,
        isLiked: false,
        replies: [
          {
            id: 'r1',
            commentId: 'c1',
            authorId: 'user_er_senior',
            authorName: '응급실베테랑',
            authorHospital: '서울아산병원',
            isVerifiedHospital: true,
            isAnonymous: false,
            replyTo: '병아리신규',
            content: '화이팅입니다! 실패해도 위축되지 말고 차분하게 다시 보시면 다 잡힙니다 ㅎㅎ',
            timeAgo: '10분 전',
            likes: 5,
            isLiked: false,
          },
        ],
      },
      {
        id: 'c2',
        postId: 'p1',
        authorId: 'user_icu',
        authorName: '익명 간호사',
        authorHospital: '삼성서울병원',
        isVerifiedHospital: true,
        isAnonymous: true,
        content: '손끝 탄력 확인하는 게 진짜 핵심이에요. 글 너무 정갈하게 잘 쓰셨네요.',
        timeAgo: '5분 전',
        likes: 4,
        isLiked: false,
        replies: [],
      },
    ],
  },
  {
    id: 'p2',
    category: '교대근무 고민',
    title: '3나이트 2오프 후 낮밤 역전 없이 수면 패턴 잡는 법',
    content: `나이트 끝나고 퇴근하자마자 암막 커튼 치고 귀마개 필수입니다.
오전 9시부터 오후 2시까지만 딱 5시간 자고 일어나서 햇빛 쬐고 가벼운 산책 하셔야 그날 밤 11시에 정상적으로 잠들 수 있어요!
커피는 퇴근 직전엔 절대 드시지 마세요. 다들 건강 챙기면서 교대합시다.`,
    authorId: 'user_night_owl',
    authorName: '나이트요정',
    authorHospital: '서울대병원',
    isVerifiedHospital: true,
    isAnonymous: false,
    isMyPost: false,
    views: 520,
    likes: 95,
    isLiked: true,
    isBookmarked: false,
    timeAgo: '1시간 전',
    images: [],
    commentsCount: 1,
    comments: [
      {
        id: 'c3',
        postId: 'p2',
        authorId: 'user_3',
        authorName: '수면부족러',
        authorHospital: '분당서울대병원',
        isVerifiedHospital: false,
        isAnonymous: true,
        content: '낮에 5시간만 자고 일어나는 게 제일 고비인데 한번 성공하면 오프날 알차게 보내지더라고요!',
        timeAgo: '40분 전',
        likes: 6,
        isLiked: false,
        replies: [],
      },
    ],
  },
  {
    id: 'p3',
    category: '자유게시판',
    title: '오늘 차지 선생님께서 사주신 커피에 눈물 찔끔',
    content: `오늘 진짜 바이탈 흔들리고 입퇴원 몰려서 정신 가출 직전이었는데, 차지 선생님이 조용히 제 스테이션에 아이스 바닐라 라떼 두고 가셨어요...
'오늘 고생 많았다, 차분하게 잘했어' 포스트잇 보는데 울컥했네요. 저도 후배들에게 이런 좋은 선배가 되어야겠어요.`,
    authorId: 'my_user_id', // 내가 작성한 글 예시
    authorName: '따뜻한병동',
    authorHospital: '서울아산병원',
    isVerifiedHospital: true,
    isAnonymous: false,
    isMyPost: true,
    views: 610,
    likes: 84,
    isLiked: false,
    isBookmarked: false,
    timeAgo: '2시간 전',
    images: [
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=500&auto=format&fit=crop&q=60',
    ],
    commentsCount: 2,
    comments: [
      {
        id: 'c4',
        postId: 'p3',
        authorId: 'user_angel',
        authorName: '익명 간호사',
        authorHospital: '가톨릭대 성모병원',
        isVerifiedHospital: true,
        isAnonymous: true,
        content: '이런 따뜻한 선배님 계시면 병동 분위기 자체가 달라지죠. 작성자님도 오늘 수고 많으셨어요!',
        timeAgo: '1시간 전',
        likes: 15,
        isLiked: false,
        replies: [],
      },
    ],
  },
  {
    id: 'p4',
    category: '이직/커리어',
    title: '상급종합병원 이직 시 필수 전자인계 & 직무 면접 Q&A',
    content: `2차 종합병원에서 빅5 상급종합병원으로 이직 성공했던 포트폴리오 및 면접 복기 자료 공유합니다.
간호 역량 중 위기 대처 사례(SBAR 보고 방식)와 부서 내 갈등 해결 경험이 가장 질문 빈도가 높았습니다. 필요하신 분들 북마크해두세요!`,
    authorId: 'user_career',
    authorName: '커리어점프',
    authorHospital: '삼성서울병원',
    isVerifiedHospital: true,
    isAnonymous: false,
    isMyPost: false,
    views: 430,
    likes: 72,
    isLiked: false,
    isBookmarked: true,
    timeAgo: '3시간 전',
    images: [],
    commentsCount: 0,
    comments: [],
  },
  {
    id: 'p5',
    category: '간호대생 라운지',
    title: '간호학과 3학년 첫 성인실습 케이스 스터디 족보 공유 (간호진단 5선)',
    content: `안녕하세요! 간호학과 3학년 학생 여러분, 첫 병원 임상실습 때 케이스 스터디 간호과정(SOAPIE) 작성 막막하셨죠?
제가 A+ 받았던 급성 통증, 낙상 위험성, 비효과적 기도청결 등 다빈도 간호진단 템플릿과 간호중재 문장집 정리본 공유합니다!
학생증 인증된 간호대생 동기분들 편하게 질문 남겨주세요.`,
    authorId: 'user_student_leader',
    authorName: '간호대A반대표',
    authorHospital: '서울대 간호대학',
    isVerifiedHospital: true,
    isAnonymous: false,
    isMyPost: false,
    views: 920,
    likes: 110,
    isLiked: false,
    isBookmarked: true,
    timeAgo: '4시간 전',
    images: [
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500&auto=format&fit=crop&q=60',
    ],
    commentsCount: 2,
    comments: [
      {
        id: 'c5',
        postId: 'p5',
        authorId: 'user_sn_junior',
        authorName: '실습생병아리',
        authorHospital: '연세대 간호대',
        isVerifiedHospital: true,
        isAnonymous: false,
        content: '선배님 대박 감사드려요 ㅠㅠ 이번 주 교수님 컨퍼런스 발표인데 살았습니다!',
        timeAgo: '2시간 전',
        likes: 8,
        isLiked: false,
        replies: [],
      },
    ],
  },
  {
    id: 'p6',
    category: '간호대생 라운지',
    title: '기본간호 핵심술기 유치도뇨 & 피내주사 감점 포인트 총정리',
    content: `핵심기본간호술 평가 앞두고 손 덜덜 떨리는 분들을 위해 체크리스트 감점 0순위 항목들만 추렸습니다.
1. 도뇨관 멸균 영역 오염 주의 (장갑 착용 후 손 위치)
2. 피내주사(ID) 각도 10~15도 및 낭포(wheal) 5~6mm 형성 확인
다들 술기시험 원패스 기원합니다!`,
    authorId: 'user_student_pass',
    authorName: '술기마스터',
    authorHospital: '고려대 간호대학',
    isVerifiedHospital: true,
    isAnonymous: true,
    isMyPost: false,
    views: 740,
    likes: 88,
    isLiked: false,
    isBookmarked: false,
    timeAgo: '5시간 전',
    images: [],
    commentsCount: 1,
    comments: [],
  },
  {
    id: 'p7',
    category: '채용/취업 정보',
    title: '2026 하반기 빅5 상급종합병원 신규간호사 채용 타임라인 & 자소서 전략',
    content: `서울아산병원, 삼성서울병원, 서울대병원, 서울성모병원, 세브란스병원 채용 일정 및 직무적성검사, 면접 유형 비교 분석표입니다.
간호사 및 졸업예정 간호대생 분들 모두 일정 미리 챙기세요!`,
    authorId: 'user_recruiter',
    authorName: '취업뽀개기멘토',
    authorHospital: '빅5합격멘토단',
    isVerifiedHospital: true,
    isAnonymous: false,
    isMyPost: false,
    views: 1250,
    likes: 145,
    isLiked: false,
    isBookmarked: true,
    timeAgo: '6시간 전',
    images: [],
    commentsCount: 3,
    comments: [],
  },
  {
    id: 'p8',
    category: '임상/질문',
    title: '중환자실/응급실 다빈도 승압제(노르에피네프린 vs 도파민) 라인 분리 및 주의점',
    content: `노르에피네프린(Norepinephrine) 투약할 때 말초 라인으로 들어가다가 익스트라(extravasation) 생겨서 조직 괴사 위험 겪을 뻔했던 경험 공유합니다.

1. 중심정맥관(C-line) 단독 라인 우선 원칙, 말초는 응급 시에만 대구경으로 짧게 진입
2. 15~30분 간격 혈압 모니터링 및 주입 부위 부종/피부 변색 집중 관찰
3. NaHCO3 등 알칼리성 수액과 동일 라인 절대 병용 금지 (약효 저하)

동기들이나 신규 선생님들 인계 때 한번씩 꼭 리마인드 하시면 환자 안전에 큰 도움 됩니다!`,
    authorId: 'user_icu_senior',
    authorName: '중환자실7년차',
    authorHospital: '삼성서울병원',
    isVerifiedHospital: true,
    isAnonymous: false,
    isMyPost: false,
    views: 780,
    likes: 142,
    isLiked: false,
    isBookmarked: true,
    timeAgo: '7시간 전',
    images: [
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500&auto=format&fit=crop&q=60',
    ],
    commentsCount: 2,
    comments: [
      {
        id: 'c8_1',
        postId: 'p8',
        authorId: 'user_novice_icu',
        authorName: '신규ICU러',
        authorHospital: '서울아산병원',
        isVerifiedHospital: true,
        isAnonymous: false,
        content: '선생님 진짜 뼈가 되고 살이 되는 내용입니다. 알칼리 수액 병용 금지 부분 메모해갑니다!',
        timeAgo: '5시간 전',
        likes: 9,
        isLiked: false,
        replies: [],
      },
      {
        id: 'c8_2',
        postId: 'p8',
        authorId: 'user_er_nurse',
        authorName: '응급실질주마',
        authorHospital: '분당서울대병원',
        isVerifiedHospital: true,
        isAnonymous: true,
        content: '말초로 어쩔 수 없이 들어갈 땐 Phentolamine(레기틴) 해독제 위치도 미리 파악해두면 좋아요.',
        timeAgo: '3시간 전',
        likes: 14,
        isLiked: false,
        replies: [],
      },
    ],
  },
  {
    id: 'p9',
    category: '교대근무 고민',
    title: '이브닝 퇴근 후 새벽 1시 폭식 줄이는 나만의 꿀팁 (체중 관리)',
    content: `이브닝 끝나고 스테이션 탈출하면 새벽 12시 반... 긴장 풀리면서 엽떡이나 치킨 배달앱 켜는 게 일상이었는데요 ㅠㅠ
3개월 만에 5kg 찌고 위염 와서 독하게 식습관 루틴 바꿨습니다!

- 퇴근 1시간 전(밤 10시쯤)에 두유나 단백질 바 하나 미리 먹어두기
- 퇴근 후 집 오면 따뜻한 보리차 한 잔 마시고 바로 샤워 직행
- 정 배고플 땐 그릭요거트에 블루베리나 바나나 반 개만 먹기!

이렇게 한 달 하니까 다음 날 아침 데이나 오프 때 속도 훨씬 편하고 붓기도 싹 빠졌어요. 교대러분들 건강 꼭 챙기세요!`,
    authorId: 'user_healthy_nurse',
    authorName: '다이어트하는간호사',
    authorHospital: '서울성모병원',
    isVerifiedHospital: true,
    isAnonymous: false,
    isMyPost: false,
    views: 650,
    likes: 118,
    isLiked: false,
    isBookmarked: false,
    timeAgo: '8시간 전',
    images: [],
    commentsCount: 2,
    comments: [
      {
        id: 'c9_1',
        postId: 'p9',
        authorId: 'user_foodie',
        authorName: '야식끊기챌린지',
        authorHospital: '강남세브란스',
        isVerifiedHospital: true,
        isAnonymous: false,
        content: '퇴근 전 두유 하나 먹는 거 진짜 효과 좋아요! 뇌가 허기를 덜 느껴서 배달앱 끌 수 있어요 ㅋㅋ',
        timeAgo: '6시간 전',
        likes: 11,
        isLiked: false,
        replies: [],
      },
    ],
  },
  {
    id: 'p10',
    category: '자유게시판',
    title: '퇴원하시는 할머니께서 쥐어주신 손편지와 사탕 두 알 🍬',
    content: `장기 입원하시면서 거동도 힘드시고 매일 힘들어하시던 할머니께서 오늘 드디어 퇴원하셨어요.
라운딩 돌고 있는데 떨리는 손으로 종이 봉투에 알사탕 두 개랑 삐뚤빼뚤 적은 쪽지를 쥐어주시더라고요.

'선생님, 밤마다 불 켜고 발 봐줘서 고마웠어. 밥 잘 챙겨먹어'

스테이션 뒤쪽 휴게실에서 읽다가 눈물이 핑 돌았네요. 힘든 3교대 버티게 해주는 건 역시 이런 순간들인 것 같습니다. 모두 오늘 듀티도 힘내세요!`,
    authorId: 'user_sunshine',
    authorName: '햇살간호사',
    authorHospital: '세브란스병원',
    isVerifiedHospital: true,
    isAnonymous: false,
    isMyPost: false,
    views: 1120,
    likes: 176,
    isLiked: true,
    isBookmarked: false,
    timeAgo: '9시간 전',
    images: [
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=500&auto=format&fit=crop&q=60',
    ],
    commentsCount: 3,
    comments: [
      {
        id: 'c10_1',
        postId: 'p10',
        authorId: 'user_warm',
        authorName: '익명 간호사',
        authorHospital: '서울대병원',
        isVerifiedHospital: true,
        isAnonymous: true,
        content: '마음이 몽글몽글해지네요... 선생님께서 그만큼 정성으로 돌보셨기 때문일 거예요.',
        timeAgo: '7시간 전',
        likes: 22,
        isLiked: false,
        replies: [],
      },
    ],
  },
  {
    id: 'p11',
    category: '이직/커리어',
    title: '병동 3년 채우고 CRA / 임상시험 코디네이터(CRC) 이직 준비 가이드',
    content: `임상 3년 차 찍고 제약회사 CRA나 병원 연구간호사(CRC) 고민하시는 분들 많으시죠?
제가 작년에 병동 퇴사 후 글로벌 CRO 기업 CRA로 이직하면서 느낀 핵심 스펙과 준비 타임라인 공유해 드립니다.

1. 영어 점수: 오픽 IH 또는 토익 850 이상은 기본 서류 통과선
2. 임상 경력: 2~3년 경력이 가장 선호됨 (EHR 차트 리딩, 의학 용어 및 질환 프로토콜 이해도)
3. GCP 수료증: 국가임상시험지원재단(KoNECT) 온라인 교육 미리 이수 필수

교대근무 탈출하고 주 5일 워라밸 찾고 싶으신 분들 댓글 남겨주시면 아는 선에서 정성껏 답변해 드릴게요!`,
    authorId: 'user_cra_success',
    authorName: '탈임상성공러',
    authorHospital: '글로벌CRO',
    isVerifiedHospital: true,
    isAnonymous: false,
    isMyPost: false,
    views: 890,
    likes: 135,
    isLiked: false,
    isBookmarked: true,
    timeAgo: '10시간 전',
    images: [],
    commentsCount: 4,
    comments: [
      {
        id: 'c11_1',
        postId: 'p11',
        authorId: 'user_career_seeker',
        authorName: '이직준비중',
        authorHospital: '고려대안암병원',
        isVerifiedHospital: true,
        isAnonymous: false,
        content: '혹시 병동 근무 중에 KoNECT 교육 듣는 데 시간 많이 소요되나요? 이직 너무 간절합니다 ㅠㅠ',
        timeAgo: '8시간 전',
        likes: 7,
        isLiked: false,
        replies: [
          {
            id: 'r11_1',
            commentId: 'c11_1',
            authorId: 'user_cra_success',
            authorName: '탈임상성공러',
            authorHospital: '글로벌CRO',
            isVerifiedHospital: true,
            isAnonymous: false,
            replyTo: '이직준비중',
            content: '온라인 동영상 강의라 오프 날 틈틈이 들으시면 2주 안에 충분히 수료증 취득 가능합니다!',
            timeAgo: '7시간 전',
            likes: 6,
            isLiked: false,
          },
        ],
      },
    ],
  },
  {
    id: 'p12',
    category: '간호대생 라운지',
    title: '간호사 국가고시 D-100 성인간호학 & 기본간호학 빈출 요약본 배포',
    content: `국시 준비하시는 4학년 후배님들! 모의고사 점수 안 나온다고 너무 불안해하지 마세요.
국시는 기출 패턴 반복이라 핵심 개념만 흔들리지 않으면 누구나 합격권 진입 가능합니다.

- 심전도(EKG) 이상 파형별 응급 약물(아데노신, 아미오다론) 매핑
- 쇼크(Shock) 4대 분류별 활력징후 및 수액 중재 원칙
- 동맥혈가스분석(ABGA) 10초 판독 공식 족보

첨부 이미지와 요약 내용 북마크해두시고 다들 국시 원패스 기원합니다!`,
    authorId: 'user_pass_senior',
    authorName: '국시대박선배',
    authorHospital: '고려대의료원',
    isVerifiedHospital: true,
    isAnonymous: false,
    isMyPost: false,
    views: 1420,
    likes: 210,
    isLiked: false,
    isBookmarked: true,
    timeAgo: '11시간 전',
    images: [
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&auto=format&fit=crop&q=60',
    ],
    commentsCount: 3,
    comments: [
      {
        id: 'c12_1',
        postId: 'p12',
        authorId: 'user_sn_4th',
        authorName: '예비간호사26',
        authorHospital: '중앙대 간호대',
        isVerifiedHospital: true,
        isAnonymous: false,
        content: '선배님 요약본 진짜 대박이네요... 성인간호학 점수 안 나와서 울고 있었는데 큰 힘이 됩니다 ㅠㅠ',
        timeAgo: '9시간 전',
        likes: 18,
        isLiked: false,
        replies: [],
      },
    ],
  },
  {
    id: 'p13',
    category: '채용/취업 정보',
    title: '대학병원 블라인드 면접 1분 자기소개 & 상황 질문(인성) 합격 스크립트',
    content: `면접관들이 매번 지루해하는 '나이팅게일의 희생과 봉사' 스타일 자기소개는 이제 그만!
내가 가진 구체적인 강점 키워드(예: 꼼꼼한 더블체크 습관, 소통 중심의 인수인계 역량)를 임상 실습 에피소드와 연결하는 3단 구조 합격 스크립트 공유합니다.

1. 직무 핵심 키워드로 시선 끄는 오프닝 (15초)
2. 실습/동아리에서 문제 해결했던 구체적 STAR 경험 (30초)
3. 입사 후 부서에 어떻게 기여할 것인지 포부로 깔끔한 마무리 (15초)

병원별 면접 기출 질문도 정리 중이니 필요하신 분들 저장해두세요!`,
    authorId: 'user_interview_pass',
    authorName: '면접패스마스터',
    authorHospital: '국립암센터',
    isVerifiedHospital: true,
    isAnonymous: false,
    isMyPost: false,
    views: 990,
    likes: 158,
    isLiked: false,
    isBookmarked: true,
    timeAgo: '12시간 전',
    images: [],
    commentsCount: 2,
    comments: [
      {
        id: 'c13_1',
        postId: 'p13',
        authorId: 'user_job_seeker',
        authorName: '취준생널스',
        authorHospital: '경희대 간호대',
        isVerifiedHospital: true,
        isAnonymous: false,
        content: 'STAR 구조로 정리하니까 훨씬 체계적으로 보이네요. 면접 준비하면서 바로 적용해보겠습니다!',
        timeAgo: '10시간 전',
        likes: 12,
        isLiked: false,
        replies: [],
      },
    ],
  },
];

