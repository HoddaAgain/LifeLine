# 🕊️ LifeLine : 1인 가구를 위한 골든타임 확보 및 안전망 구축 플랫폼

> **단순한 '사망 방지'를 넘어, '정서적 유대감'을 형성하는 1인 가구 골든타임 확보 플랫폼** <br>
> 2026학년도 동의대학교 응용소프트웨어공학과 4학년 1학기 캡스톤 디자인II  (팀명: 호따 - Hodda)

<br>

## 📌 프로젝트 개요
최근 1인 가구가 전체 가구의 36%를 초과하며, 사회적 고립과 '고독사' 문제가 심각한 사회적 현안으로 대두되고 있습니다. <br>
기존의 IoT 센서 기반 감시 시스템이나 AI 안부 전화는 사용자에게 심리적 거부감을 주어 실질적인 이용률이 저조한 한계가 있었습니다.

**LifeLine**은 이러한 문제를 해결하기 위해 사용자의 자발적 참여를 유도하는 **'능동적 체크인(Active Check-in)'** 모델을 도입했습니다. <br>
디지털 기술을 통해 1인 가구와 사회 사이의 끊어진 연결고리를 복구하고 정서적 유대감을 형성하는 종합 안전망 플랫폼입니다.

<br>

## ✨ 핵심 기능 및 특징

### 1. 세대별 맞춤형 Dual-Mode UI
- **Easy Mode (고령층 대상)**: 스마트 기기 조작이 서툰 사용자를 위해 직관적이고 거대한 단일 버튼 형태의 UI 제공
- **Normal Mode (청·장년층 대상)**: 일기 작성 및 '카나리아 미션' 등 게이미피케이션(Gamification) 요소를 결합하여 자발적 참여 동기 부여

### 2. 골든타임 확보를 위한 백그라운드 스케줄링
- 사용자의 활동 로그를 기반으로 24시간/48시간 미활동 시 사용자에게 경고(Warning) 알림 발생
- 48시간 도달 시 사전에 등록된 비상 연락처 및 복지기관으로 **자동 긴급 알림** 발송 (초기 MVP: Email, 향후 SMS/Push 확장 구조)

### 3. 프라이버시 중심 아키텍처 (Privacy-First)
- 위치 추적 및 과도한 민감 정보 수집 전면 배제
- Device Token(UUID) 및 최소 식별 정보(Magic Link 등)만을 활용하여 철저한 익명성 보장

### 4. 높은 접근성의 PWA 환경
- 앱스토어를 통한 별도 설치 과정 없이, QR코드나 링크 클릭만으로 즉시 접근 가능한 **Progressive Web App** 적용
- 지자체 및 복지기관의 하드웨어(IoT 센서 등) 도입/유지보수 예산 절감

### 5. 모바일 하이브리드 앱 배포 (Google Play Store)
- 단순 학술적 프로토타입에 그치지 않고, 실제 1인 가구 사용자가 손쉽게 접근할 수 있도록 구글 플레이 스토어 정식 출시를 목표로 개발
- React 기반의 웹 기술을 Capacitor/WebView로 패키징하여, 빠른 업데이트와 안정적인 네이티브 기능(FCM 푸시 알림 등)을 동시에 확보

<br>

## 🚀 배포 및 런칭 로드맵 (Roadmap)
[Phase 1] MVP 개발: 핵심 로직(생존 스케줄러, 일기장) 검증 및 PWA 테스트 배포
[Phase 2] 하이브리드 패키징: 네이티브 기능(FCM 푸시, 로컬 캐시) 연동 및 구글 플레이 콘솔 등록
[Phase 3] 마켓 런칭 및 운영: 구글 플레이 스토어 정식 출시, 초기 유저 피드백 수집 및 버그 픽스

<br>

## 🛠 기술 스택 (Tech Stack)

### Frontend
- **Framework**: React 19, Vite
- **Architecture**: Progressive Web App (PWA)
- **State Management**: Zustand (오프라인 상태 대응)
- **Design**: 모바일 친화적 파스텔톤 UI

### Backend
- **Framework**: Spring Boot 3.x
- **Database**: MySQL / MariaDB
- **ORM & Optimization**: Spring Data JPA (인덱스 기반 쿼리 최적화)
- **Task Scheduling**: Spring `@Scheduled` (24h/48h 감지 코어)
- **Notification**: JavaMailSender (DI 기반 알림 인터페이스)

<br>

## 👨‍💻 팀원 및 역할 분담 (R&R)
| 이름 | 역할 | 주요 수행 내용 |
|:---:|:---:|---|
| **권영훈**<br>(팀장) | PM & PO | - 프로젝트 비전 수립 및 애자일(Agile) 스프린트 관리<br>- 사용자 모드(Easy/Normal) UX 시나리오 설계<br>- 카나리아 미션 및 게이미피케이션 기획 |
| **이호준** | Architect & DevOps | - 전체 시스템 아키텍처 및 통합 프로세스 설계<br>- 클라우드 배포(CI/CD) 및 서버 보안 취약점 점검<br>- Device Token 기반 인증 및 알림 인터페이스 설계 |
| **강신혁** | Backend Engineer | - Spring Boot 기반 RESTful API 비즈니스 로직 설계<br>- `@Scheduled` 활용 골든타임 감지 코어 알고리즘 개발<br>- JPA 활용 활동 로그 관리 및 대용량 쿼리 튜닝 |
| **하유빈** | Frontend Engineer | - React/Vite 기반 모바일 친화적 UI 컴포넌트 개발<br>- 앱 설치 허들을 낮추는 PWA 환경 구축<br>- Zustand 활용 상태 관리 및 파스텔톤 디자인 설계 |

<br>


## 📅 프로젝트 수행 기간
- **2026. 03. 02 ~ 2026. 06. 22 (약 4개월)**
