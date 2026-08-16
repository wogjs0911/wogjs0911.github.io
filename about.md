---
layout: article
titles:
  # @start locale config
  en      : &EN       About
  en-GB   : *EN
  en-US   : *EN
  en-CA   : *EN
  en-AU   : *EN
  zh-Hans : &ZH_HANS  关于
  zh      : *ZH_HANS
  zh-CN   : *ZH_HANS
  zh-SG   : *ZH_HANS
  zh-Hant : &ZH_HANT  關於
  zh-TW   : *ZH_HANT
  zh-HK   : *ZH_HANT
  ko      : &KO       소개
  ko-KR   : *KO
  fr      : &FR       À propos
  fr-BE   : *FR
  fr-CA   : *FR
  fr-CH   : *FR
  fr-FR   : *FR
  fr-LU   : *FR
  # @end locale config
key: page-about
---

## 김재헌 · Server Developer / AI Platform

Java/Spring 기반 ERP 백엔드에서 출발해, Python/FastAPI와 Pydantic AI를 활용한 **AI Agent 플랫폼 설계·구축**으로 영역을 확장하고 있는 개발자입니다. ERP·물류 SaaS 기업에서 백엔드/AI 플랫폼 개발자로 재직 중입니다. (2023.07 ~)

---

### 핵심 경험

- **Java/Spring 기반 ERP 백엔드 개발** — 엔터프라이즈 환경에서의 서버 설계 및 운영
- **Python/FastAPI/Pydantic AI 기반 Agent 플랫폼** — LLM Agent의 실행·제어·평가 파이프라인 구축
- **RAG/GraphRAG 아키텍처 학습 및 설계 검토** — Neo4j, LangChain 기반 지식 그래프 검색 구조 연구
- **MCP, Tool Calling, Multi-Agent Routing** — Agent 간 라우팅, 도구 호출, 안전한 실행 흐름 설계

### 주요 성과

- ERP 업무를 안전하게 연결하는 **MCP Gateway 및 Agent 플랫폼** 설계·구현 — 단일 Agent를 11개 도메인 Agent로, MCP Tool을 5개에서 69개로 확장
- **결정적 Router + Semantic Router(L1/L2/L3)** 조합과 **OAuth 2.1 DCR·PKCE, JWT 테넌트 검증**으로 판단·인증·실행 책임을 분리한 안전한 실행 경계 구축
- 동일 조건 k6 부하 테스트 기준 **평균 latency 60.9% 감소**(6,198ms → 2,426ms), 구조화 슬롯 fast-path 적용으로 **메일 처리 latency 91.5% 감소**
- ERP 재고 처리 코어 리팩터링으로 **처리 속도 35~50% 개선**, 코드 중복 약 70% 감소

### 기술 스택

**실무 활용**

| 영역 | 기술 |
|------|------|
| **Backend** | Java, Spring Boot, MyBatis, Python, FastAPI |
| **AI/Agent** | Pydantic AI, MCP, Tool Calling, Multi-Agent Dispatch |
| **Security** | OAuth 2.1(DCR/PKCE), JWT, Multi-tenancy |
| **Data/Infra** | Oracle, PostgreSQL(pgvector), Redis, AWS(EC2/S3), Docker |

**학습·연구**

| 영역 | 기술 |
|------|------|
| **AI/Agent** | LangChain, LangGraph, GraphRAG |
| **Backend** | JPA/QueryDSL |
| **Data/Infra** | Kafka, Debezium, Elasticsearch, MongoDB, Neo4j |
| **Architecture** | CQRS, Event-Driven Architecture |

### 관심 분야

- LLM Agent 보안 (Prompt Injection 방어, Confirmation Token, Idempotency)
- Agent Evals & Observability
- Intent Recognition 기반 Multi-Agent 라우팅
- AI Agent 프레임워크 비교 및 전환 검토 (LangChain, LangGraph, Pydantic AI)

---

### 대표 글

| 구분 | 제목 |
|------|------|
| 기술 검토 | [안전한 AI Agent 실행과 Framework 전환](/post/2026/06/01/Safe-AI-Agent-Execution-and-Framework-Migration.html) |
| 기술 검토 | [AI Agent 아키텍처와 라우팅 패턴](/post/2026/06/01/AI-Agent-Architecture-and-Routing-Patterns.html) |
| 기술 검토 | [RAG, Function Calling, Conversation Service 정리](/post/2026/06/01/RAG-Function-Calling-and-Conversation-Service.html) |
| 기술 검토 | [GraphRAG 및 지식 그래프 실무 엔터프라이즈 아키텍처 설계](/post/2026/07/28/Enterprise-Graph-RAG-Architecture-Guide.html) |
| 학습 정리 | [Pydantic AI — Tool Calling, MCP, Structured Output](/post/2026/05/31/PydanticAIStudy1.html) |
| 학습 정리 | [CQRS — Kafka, CDC, Debezium, Elasticsearch](/post/2025/12/14/CQRSStudy1.html) |

> 이 블로그는 **사내 프로젝트의 구조와 설계 원칙을 기술 문서 형태로 정리한 기술 아카이브**입니다.  
> 사내 소스코드는 보안상 공개하지 않으며, 공개 가능한 설계와 학습 내용을 중심으로 작성하고 있습니다.

---

### 글 분류 기준

이 블로그의 글은 아래 기준으로 구분됩니다.

- **기술 검토** — 실무 설계 시 검토한 아키텍처·패턴·트레이드오프 분석
- **학습 정리** — 기술 개념 학습 및 실습 코드 정리
- **실무 적용** — 실제 운영 환경에 적용한 경험 기반 글
- **개인 실습** — 사이드 프로젝트 및 개인 학습 실습

---

**wogjs0911@gmail.com** · [GitHub](https://github.com/wogjs0911)
