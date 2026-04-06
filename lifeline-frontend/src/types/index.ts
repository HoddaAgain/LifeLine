
export type UserMode = 'EASY' | 'NORMAL';

export interface Diary {
  id: number;           // 각 일기의 고유 식별자
  title: string;        // 일기 제목
  content: string;      // 일기 본문 내용
  emotion: string;      // 선택한 감정 (예: '😊', '😢', '🔥')
  date: string;         // 작성 날짜 (보통 'YYYY-MM-DD' 형식)
  createdAt?: string;   // 실제 생성 시간 (ISO string, 필요 시)
  userId?: string;      // 작성자 식별자 (백엔드 연동용)
}

export type CreateDiaryDto = Omit<Diary, 'id' | 'createdAt'>;

export interface User {
  id: number;                // PK (Auto Increment)
  userId: string;            // 로그인 아이디 (Unique)
  nickname: string;          // 닉네임
  name: string;              // 본명
  mode: UserMode;            // EASY / NORMAL
  emergencyContact?: string; // 비상연락처
  birthDate?: string;        // 생년월일 (LocalDate 대응)
  survivalStreak: number;    // 연속 생존신고 일수 (Default: 0)
  diaryStreak?: number;       // 연속 일기 작성일 (Default: 0)
  lastSurvivalTime?: string; // 마지막 생존신고 시간 (LocalDateTime)
  lastDiaryDate?: string;    // 마지막 일기 작성 날짜 (LocalDate)
  createdAt: string;
  updatedAt: string;
  accessToken?: string;    // API 인증을 위한 토큰
  refreshToken?: string;
}
export interface LoginRequest {
  userId: string;
  password?: string;
}
// 회원가입 요청 규격 (AuthDto.SignUpRequest)
export interface RegisterRequest {
  
  userId: string;
  password?: string;
  name: string;
  mode: UserMode;
  emergencyContact: string;
  birthDate: string;
}

// 로그인 응답 규격 (AuthDto.LoginResponse)
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  id: number;
  userId: string;
  name: string;
  nickname: string;
  mode: 'EASY' | 'NORMAL';
  emergencyContact?: string;
  birthDate?: string;
  diaryStreak?: number;
}

//일기장 관련
export interface DiaryItem {
  id: number;                // PK
  userId: number;            // FK (작성자 ID)
  title: string;             // 제목
  content: string;           // 내용
  mood?: string;             // 감정 상태
  imageUrl?: string;         // Diary_Image 테이블 연관 URL
  diaryDate: string;         // 일기 대상 날짜 (LocalDate)
  createdAt: string;
  updatedAt: string;
}

// 일기 생성 요청 (DiaryDto.CreateRequest)
export interface CreateDiaryRequest {
  title: string;             // 필수
  content: string;
  mood?: string;
  imageurl?: string;         // 이미지 첨부 시 URL
}

// 일기 생성 응답 (DiaryDto.CreateResponse)
export interface CreateDiaryResponse {
  id: number;
  diaryStreak: number;       // 연속 작성일 반환
} 

//생존신고 응답
export interface SurvivalCheckResponse {
  status: string;
  message: string;
}

export interface CommonResponse<T> {
  status: string;
  message: string;
  data: T; // 실제 데이터는 이 안에 들어있음
}

// 이미지 업로드 응답 (ImageDto.ImageResponse)
export interface ImageUploadResponse {
  imageUrl: string;
}