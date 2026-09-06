export interface MockPost {
  id: string;
  category: string;
  title: string;
  content: string;
  preview: string;
  author: string;
  authorHospital: string;
  likes: number;
  comments: number;
  timeAgo: string;
}

export const MOCK_POSTS: MockPost[] = [
  {
    id: '1',
    category: '임상/질문',
    title: '신규 간호사 IV 라인 잘 잡는 꿀팁 있나요?',
    content: '밸브 피해서 찌르는 감이 아직 잘 안 옵니다. 선배님들의 노하우를 배우고 싶어요!',
    preview: '밸브 피해서 찌르는 감이 아직 잘 안 옵니다. 선배님들의 노하우를 배우고 싶어요!',
    author: '신규탈출러',
    authorHospital: '서울아산병원',
    likes: 18,
    comments: 12,
    timeAgo: '10분 전',
  },
  {
    id: '2',
    category: '자유게시판',
    title: '오늘 3나이트 끝나고 퇴근길 하늘 너무 예쁘네요',
    content: '다들 밤샘 근무 고생 많으셨습니다. 꿀잠 자러 갑니다 🌙',
    preview: '다들 밤샘 근무 고생 많으셨습니다. 꿀잠 자러 갑니다 🌙',
    author: '나이트러버',
    authorHospital: '삼성서울병원',
    likes: 42,
    comments: 7,
    timeAgo: '30분 전',
  },
  {
    id: '3',
    category: '이직/취업',
    title: '상급종합병원 경력직 이직 면접 후기 공유합니다',
    content: '직무 면접에서 많이 물어보는 질문 리스트와 팁 정리해뒀습니다.',
    preview: '직무 면접에서 많이 물어보는 질문 리스트와 팁 정리해뒀습니다.',
    author: '경력5년차',
    authorHospital: '세브란스병원',
    likes: 85,
    comments: 24,
    timeAgo: '2시간 전',
  },
];

