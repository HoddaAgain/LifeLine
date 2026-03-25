### 라이프라인 백엔드 ###

## 🛠 Tech Stack & Environment
* **Framework:** Spring Boot 4.0.4
* **Build Tool:** Gradle (Groovy)
* **Language:** Java 21
* **Database:** H2 Database (초기 개발 및 테스트용)
* **Configuration:** YAML (`application.yml`)
* **Packaging:** Jar

## 📦 Dependencies
* **Spring Web:** RESTful API 엔드포인트 구축
* **Spring Data JPA:** ORM 기반 데이터베이스 연동 및 관리
* **H2 Database:** 로컬 환경에서 빠르게 테스트 가능한 인메모리 DB
* **Validation:** API 요청 데이터(DTO) 유효성 검증
* **Lombok:** 보일러플레이트 코드 최소화 (Getter, Setter, Constructor 등)
* **Spring Security:** 사용자 인증 및 인가, JWT 기반 보안 체계 구축