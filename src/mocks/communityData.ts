export interface ReplyItem {
  id: string;
  commentId: string;
  authorId: string;
  authorName: string;
  authorHospital: string;
  isVerifiedHospital: boolean;
  isAnonymous: boolean;
  isMyReply?: boolean;
  replyTo: string; // e.g. '임상멘토'
  content: string;
  timeAgo: string;
  likes: number;
  isLiked: boolean;
}

export interface CommentItem {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorHospital: string;
  isVerifiedHospital: boolean;
  isAnonymous: boolean;
  isMyComment?: boolean;
  content: string;
  timeAgo: string;
  likes: number;
  isLiked: boolean;
  replies: ReplyItem[];
}

export interface PostItem {
  id: string;
  category: '임상/질문' | '교대근무 고민' | '이직/커리어' | '자유게시판';
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorHospital: string;
  isVerifiedHospital: boolean; // 병원 인증 뱃지
  isAnonymous: boolean; // 작성자 완전 익명 마스킹
  isMyPost?: boolean; // 본인 글 (수정/삭제 가능)
  views: number;
  likes: number;
  isLiked: boolean;
  isBookmarked: boolean; // 임상 족보 / 북마크 보관함
  timeAgo: string;
  images: string[]; // 첨부 사진 최대 3장
  commentsCount: number;
  comments: CommentItem[];
}

// ── 실시간 인기글 (HOT 토픽) 캐러셀 배너 데이터 ──
export interface HotTopic {
  id: string;
  rank: number;
  category: string;
  title: string;
  likes: number;
  comments: number;
}

export const MOCK_HOT_TOPICS: HotTopic[] = [
  {
    id: 'p1',
    rank: 1,
    category: '임상/질문',
    title: '혈관 안 보이는 고령 환자 IV 원샷 비결 족보 정리',
    likes: 128,
    comments: 46,
  },
  {
    id: 'p2',
    rank: 2,
    category: '교대근무 고민',
    title: '3나이트 2오프 후 낮밤 역전 없이 수면 패턴 잡는 법',
    likes: 95,
    comments: 32,
  },
  {
    id: 'p3',
    rank: 3,
    category: '이직/커리어',
    title: '상급종합병원 이직 시 필수 전자인계 & 직무 면접 Q&A',
    likes: 84,
    comments: 29,
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
];

