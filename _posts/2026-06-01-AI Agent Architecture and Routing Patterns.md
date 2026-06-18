---
key: /2026/06/01/AI-Agent-Architecture-and-Routing-Patterns.html
title: AI Agent 아키텍처와 라우팅 패턴
tags: Pydantic-AI LLM Agent Architecture MCP Routing Toolset
---

# AI Agent 아키텍처와 라우팅 패턴

## 목차
1. [왜 agent 경계를 먼저 정해야 하는가](#1-왜-agent-경계를-먼저-정해야-하는가)
2. [Pydantic AI 중심 MVP 구조](#2-pydantic-ai-중심-mvp-구조)
3. [Agent 실행 계약](#3-agent-실행-계약)
4. [Tool 설계 기준](#4-tool-설계-기준)
5. [MCP는 언제 도입할까](#5-mcp는-언제-도입할까)
6. [Intent Routing 패턴](#6-intent-routing-패턴)
7. [Tool 수가 늘어날 때의 분리 기준](#7-tool-수가-늘어날-때의-분리-기준)
8. [운영 전환 시 재검토 조건](#8-운영-전환-시-재검토-조건)
9. [정리](#9-정리)

---


## 1. 왜 agent 경계를 먼저 정해야 하는가


업무 시스템에 LLM agent를 붙일 때 가장 먼저 정해야 하는 것은 모델이나 framework가 아니라 **경계**입니다.

LLM은 자연어를 이해하고 후보를 제안할 수 있지만, 업무 시스템의 권한, 데이터 정합성, 감사 로그, 트랜잭션 처리는 기존 backend가 책임져야 합니다.

따라서 agent architecture의 핵심 질문은 다음입니다.

- agent service가 직접 데이터를 읽어도 되는가?
- tool은 어디까지 업무 로직을 가져야 하는가?
- 사용자 권한은 prompt로 막을 것인가, backend에서 검증할 것인가?
- session과 message history의 source of truth는 어디인가?
- tool이 많아질 때 agent를 나눌 것인가, routing 계층을 둘 것인가?
- MCP는 처음부터 필요한가, 아니면 확장 단계의 프로토콜인가?

업무 시스템에서는 보통 다음 원칙이 안전합니다.

- agent service는 stateless에 가깝게 둡니다.
- 장기 session, message history, audit log는 backend gateway가 관리합니다.
- agent tool은 validated backend API를 호출하는 얇은 adapter로 둡니다.
- agent service가 업무 DB나 내부 domain object를 직접 안다고 가정하지 않습니다.
- 권한 검증은 instructions가 아니라 backend policy로 닫습니다.
- 쓰기 작업은 preview와 confirmation을 분리합니다.

이 구조를 먼저 정해두면 Pydantic AI, LangChain, LangGraph, MCP 같은 선택지를 바꿔도 업무 계약이 흔들리지 않습니다.

---


## 2. Pydantic AI 중심 MVP 구조


초기 MVP에서는 복잡한 graph orchestration보다 단일 Pydantic AI agent와 제한된 tool set으로 시작하는 편이 낫습니다.

목표는 "모든 자동화"가 아니라 다음 흐름이 안전하게 작동하는지 검증하는 것입니다.

```text
User
  -> Backend Conversation Gateway
      - session 관리
      - message history 저장
      - organization / actor / access-control context 구성
      - audit log 기록
  -> Agent Service
      - Pydantic AI Agent.run(...)
      - RunContext로 request context 전달
      - function tool 호출
      - structured output 검증
  -> Validated Backend APIs
      - 접근 제어 재검증
      - 정형 데이터 조회
      - preview 생성
      - confirmation 이후 실행
```

MVP에서 Pydantic AI가 맡기 좋은 책임은 다음입니다.

| 책임 | Pydantic AI에서 다루기 좋은 이유 |
|---|---|
| 자연어 해석 | agent instructions와 model call로 처리 |
| tool 선택 | 등록된 function tool schema를 기반으로 선택 |
| tool argument 구성 | RunContext와 tool schema를 통해 제한 |
| structured output | Pydantic model로 최종 응답 검증 |
| message loop | LLM -> tool -> LLM 흐름을 framework가 처리 |

반대로 다음은 agent service가 아니라 backend gateway 또는 validated backend API 책임으로 두는 편이 안전합니다.

| 책임 | 권장 위치 |
|---|---|
| 인증 | backend gateway |
| actor 권한 확정 | backend gateway |
| 업무 권한 최종 검증 | validated backend API |
| 트랜잭션 실행 | validated backend API |
| audit source of truth | backend gateway 또는 audit service |
| 장기 message history | backend storage |
| 대용량 결과 보관 | backend storage 또는 cache |

MVP의 좋은 목표는 "agent가 잘 말한다"가 아니라 **agent가 안전한 경계 안에서만 tool을 호출한다**입니다.

---


## 3. Agent 실행 계약


Pydantic AI에서는 `deps_type`을 통해 실행 시점의 context를 tool에 전달할 수 있습니다.

공개 가능한 형태의 예시는 다음과 같습니다.

```python
from dataclasses import dataclass
from typing import Any

import httpx
from pydantic import BaseModel
from pydantic_ai import Agent, RunContext


@dataclass
class AppDeps:
    organization_id: str
    actor_id: str
    request_id: str
    permissions: list[str]
    client: httpx.AsyncClient


class AgentAnswer(BaseModel):
    summary: str
    data: dict[str, Any] = {}
    references: list[str] = []
    warnings: list[str] = []
    requires_confirmation: bool = False
    risk_level: str = "read_only"


agent = Agent(
    "openai:gpt-5.2",
    deps_type=AppDeps,
    output_type=AgentAnswer,
    instructions=(
        "You help users work with a business application. "
        "Only use validated backend APIs exposed through tools. "
        "Never invent data that should come from backend systems."
    ),
)


@agent.tool
async def get_resource_summary(
    ctx: RunContext[AppDeps],
    resource_id: str,
) -> dict[str, Any]:
    response = await ctx.deps.client.get(
        f"/api/resources/{resource_id}/summary",
        headers={
            "X-Actor-Id": ctx.deps.actor_id,
            "X-Request-Id": ctx.deps.request_id,
        },
    )
    response.raise_for_status()
    return response.json()
```

이 예시에서 중요한 점은 다음입니다.

- tool이 직접 DB를 보지 않습니다.
- tool은 backend API client를 통해서만 데이터를 가져옵니다.
- request context는 `RunContext.deps`에 명시적으로 들어갑니다.
- actor와 organization 정보는 tool call마다 backend로 전달됩니다.
- backend는 전달값을 그대로 신뢰하지 않고 서버 쪽 session, token, policy와 다시 대조합니다.
- output은 `AgentAnswer`로 검증됩니다.

실제 프로젝트에서는 `AppDeps`가 더 커질 수 있습니다.

예를 들면 다음 필드가 들어갑니다.

- `organization_id`: 조직 또는 계정 범위
- `actor_id`: 요청 주체
- `request_id`: correlation ID
- `session_id`: 대화 session ID
- `conversation_id`: message history correlation ID
- `permissions`: AI tool 선택을 제한하기 위한 coarse permission
- `current_screen`: 사용자가 보고 있는 화면 또는 메뉴 context
- `locale`: 응답 locale
- `timezone`: 날짜 해석 기준
- `client`: validated backend API client

여기서 핵심은 field 이름이 아니라 **모델이 혼자 추측하면 안 되는 실행 context를 code path로 주입한다**는 점입니다.

---


## 4. Tool 설계 기준


업무 시스템 agent의 tool은 "LLM이 마음대로 실행하는 함수"가 아니라 backend capability의 좁은 adapter입니다.

좋은 tool 이름은 구체적입니다.

예:

- `resource_get_summary`
- `workflow_list_pending_items`
- `document_preview_extraction`
- `policy_search_guideline`
- `record_validate_draft`

나쁜 tool 이름은 너무 넓습니다.

예:

- `run_raw_query`
- `update_record`
- `delete_anything`
- `run_backend_action`
- `admin_tool`

tool은 크게 세 범주로 나눌 수 있습니다.

| 분류 | 설명 | 기본 정책 |
|---|---|---|
| 조회 tool | 현재 상태나 요약을 읽음 | read-only, side effect 없음 |
| 계획 tool | 계산, 검증, 후보 생성 | preview 또는 dry-run |
| 변경 tool | 상태 변경 요청 | confirmation과 idempotency 필요 |

MVP에서는 조회 tool과 preview tool만 두는 것이 안전합니다.

side effect가 있는 tool은 다음 요구사항이 준비된 뒤 넣어야 합니다.

- preview ID
- confirmation token
- idempotency key
- actor 권한 재검증
- audit log
- 중복 실행 방지
- 실패 시 복구 기준
- retry 가능 여부

tool error도 자연어 문자열 하나로 반환하지 않는 편이 좋습니다.

```python
from pydantic import BaseModel


class ToolError(BaseModel):
    code: str
    message: str
    retryable: bool = False
    permission_denied: bool = False
    details_ref: str | None = None
```

이런 구조가 있으면 agent는 실패 이유를 분류할 수 있고, backend와 UI도 같은 기준으로 사용자에게 표시할 수 있습니다.

대표적인 error code는 다음 정도로 충분합니다.

- `permission_denied`
- `validation_error`
- `not_found`
- `temporary_failure`
- `conflict`
- `requires_confirmation`

---


## 5. MCP는 언제 도입할까


MCP는 매우 유용하지만, 모든 agent 프로젝트의 출발점일 필요는 없습니다.

초기 MVP에서는 Pydantic AI의 function tool과 toolset만으로도 충분한 경우가 많습니다.

MCP를 도입할 가치가 커지는 시점은 다음입니다.

- 여러 agent service가 같은 tool catalog를 공유해야 한다.
- 외부 client가 표준 MCP 프로토콜로 tool을 호출해야 한다.
- desktop client, IDE, internal assistant 등 다양한 client가 붙는다.
- tool server를 agent runtime과 독립 배포해야 한다.
- transport, authentication, tool metadata를 표준화해야 한다.
- 조직별 tool exposure, rate limit, audit가 필요하다.

반대로 다음 단계에서는 MCP를 미루는 편이 낫습니다.

- tool이 5~7개 수준이다.
- client가 하나뿐이다.
- backend DTO 계약도 아직 안정화되지 않았다.
- 인증과 권한 모델이 확정되지 않았다.
- tool schema가 자주 바뀐다.
- 외부 공개 요구가 없다.

MCP 도입을 단계로 나누면 다음과 같습니다.

| 단계 | 목표 | 권장 방식 |
|---|---|---|
| PoC | agent와 tool boundary 검증 | Pydantic AI tool로 시작 |
| 내부 공유 | 여러 internal client가 tool 사용 | internal MCP server 검토 |
| 제품화 | 외부 client와 표준 연동 | OAuth, rate limit, audit 포함한 MCP endpoint |

MCP를 붙이더라도 기존 원칙은 바뀌지 않습니다.

- agent나 MCP server가 업무 DB를 직접 조회하지 않습니다.
- 모든 업무 실행은 validated backend API를 통해 수행합니다.
- actor 권한은 backend에서 재검증합니다.
- tool call은 request ID, actor ID, organization ID, tool name, redacted args 기준으로 추적합니다.
- 쓰기 작업은 preview와 confirmation을 분리합니다.

MCP는 tool 계약을 표준화하는 방법이지, 보안 경계를 없애는 방법이 아닙니다.

---


## 6. Intent Routing 패턴


Intent routing은 사용자 발화를 어떤 domain, agent, tool, RAG collection으로 보낼지 결정하는 계층입니다.

agent 품질은 모델 성능뿐 아니라 routing 설계에 크게 좌우됩니다.

초기에는 단순하게 시작합니다.

| 규모 | 권장 방식 |
|---|---|
| tool 5~7개 이하 | 단일 Pydantic AI agent에 tool 직접 등록 |
| tool 10개 전후 | toolset 분리와 간단한 intent classifier |
| tool 20개 이상 | domain agent 또는 application router 분리 |
| domain별 권한/정책이 다름 | backend router 또는 router agent |
| concept가 많음 | embedding 기반 semantic registry 검토 |

### Rule 기반 routing

가장 먼저 고려할 방식입니다.

입력으로 사용할 수 있는 값은 다음과 같습니다.

- 현재 화면 ID
- 메뉴 context
- 사용자가 클릭한 action
- 명시적 command
- keyword
- attachment 유형
- UI에서 선택한 filter

장점:

- 빠릅니다.
- 비용이 없습니다.
- 감사 추적이 쉽습니다.
- 예측 가능합니다.

단점:

- 표현이 다양해지면 누락이 생깁니다.
- domain language가 넓어지면 rule 유지보수가 커집니다.

업무 화면 context가 있는 application에서는 rule 기반 routing의 가치가 큽니다.

### Embedding 기반 routing

사용자 발화를 concept 설명과 embedding similarity로 비교하는 방식입니다.

적합한 경우:

- concept가 5~10개 이상입니다.
- 사용자가 같은 업무를 다양한 표현으로 말합니다.
- tool schema 전체를 매번 모델에게 노출하기 싫습니다.
- 유사 intent 후보 top-k를 보고 싶습니다.

초기에는 전용 vector DB 없이 memory array로도 충분할 수 있습니다.

concept registry는 다음처럼 단순하게 시작할 수 있습니다.

```python
from pydantic import BaseModel


class IntentConcept(BaseModel):
    domain: str
    intent: str
    description: str
    route_type: str
    risk_level: str
    candidate_tools: list[str]
    required_permissions: list[str]
```

embedding routing의 결과는 바로 실행하지 말고 routing result로 남깁니다.

```json
{
  "domain": "workflow",
  "intent": "list_pending_items",
  "routeType": "function_calling",
  "riskLevel": "read_only",
  "confidence": 0.84,
  "candidateTools": ["workflow_list_pending_items"],
  "reason": "The user asked for pending items assigned to the current actor."
}
```

### Lightweight LLM classifier

rule과 embedding만으로 모호한 발화가 많으면 작은 모델로 intent를 JSON 분류할 수 있습니다.

```json
{
  "domain": "resource",
  "intent": "summarize_resource",
  "routeType": "function_calling",
  "confidence": 0.78,
  "needsRag": false,
  "riskLevel": "read_only"
}
```

LLM classifier는 다음 경우에 좋습니다.

- routing 이유를 자연어로 남겨야 합니다.
- keyword로 잡기 어려운 표현이 많습니다.
- user message가 길고 복합적입니다.
- RAG와 function calling을 구분해야 합니다.

주의할 점도 있습니다.

- classifier도 비용이 듭니다.
- 결과가 변동될 수 있습니다.
- confidence 기준과 fallback을 정해야 합니다.
- 권한 판단을 classifier에게 맡기면 안 됩니다.

### Hybrid routing

실무에서는 아래 순서가 안정적입니다.

```text
screen/menu context rule
  -> keyword/rule
  -> embedding top-k
  -> optional LLM classifier
  -> toolset / agent / RAG collection 선택
```

이 구조의 장점은 deterministic한 단서를 먼저 쓰고, 애매한 경우에만 모델을 쓴다는 점입니다.

### Agent에게 전부 위임하는 방식

모든 tool을 하나의 agent에 등록하고 LLM이 알아서 선택하게 할 수도 있습니다.

도구가 적을 때는 가장 빠른 시작점입니다.

하지만 tool이 많아지면 문제가 생깁니다.

- prompt에 노출되는 tool schema가 길어집니다.
- token cost가 증가합니다.
- 유사 tool 선택 오류가 늘어납니다.
- 권한별 tool exposure 제어가 어려워집니다.
- eval에서 실패 원인을 분리하기 어렵습니다.

따라서 "처음에는 단일 agent, 커지면 routing"이 현실적인 순서입니다.

---


## 7. Tool 수가 늘어날 때의 분리 기준


tool 수가 늘어날 때 무조건 multi-agent로 가는 것은 아닙니다.

먼저 toolset과 router로 충분한지 봅니다.

### 5~7개

단일 agent에 직접 등록합니다.

이 단계에서는 복잡한 routing보다 tool schema, output contract, eval을 안정화하는 것이 중요합니다.

### 10개 전후

toolset을 도입합니다.

예:

- `ResourceToolset`
- `WorkflowToolset`
- `DocumentToolset`
- `PolicyToolset`

toolset은 domain별 tool 노출을 줄이고, 권한에 따라 enable/disable하기 좋습니다.

### 20개 이상

domain agent 또는 application router를 검토합니다.

분리 기준은 단순 tool 개수가 아니라 다음입니다.

- domain별 instructions가 다릅니다.
- 권한 모델이 다릅니다.
- output type이 다릅니다.
- failure policy가 다릅니다.
- tool 선택 오류가 늘어납니다.
- domain별 eval dataset이 필요합니다.
- 모델 라우팅 또는 비용 정책이 달라집니다.

분리 후 구조는 다음처럼 둘 수 있습니다.

```text
Backend Conversation Gateway
  -> Application Router
      - context rule
      - permission filter
      - intent classifier
  -> Agent Runtime
      - Resource Agent
      - Workflow Agent
      - Document Agent
      - Policy Agent
  -> Validated Backend APIs
```

Pydantic AI만으로도 delegation이 가능합니다.

상위 agent가 tool 내부에서 하위 agent를 호출할 수 있습니다.

하지만 업무 시스템에서는 backend application router가 먼저 분기하고, 각 agent가 좁은 역할을 수행하는 구조가 감사와 권한 제어에 더 단순한 경우가 많습니다.

---


## 8. 운영 전환 시 재검토 조건


MVP 구조는 의도적으로 단순해야 합니다.

하지만 아래 조건이 생기면 구조를 재검토합니다.

- tool이 20개를 넘어 선택 정확도가 떨어집니다.
- tool schema 노출로 token 비용이 눈에 띄게 증가합니다.
- 여러 client가 같은 tool catalog를 사용해야 합니다.
- 외부 client가 MCP 표준을 요구합니다.
- organization별 모델 라우팅이나 예산 제한이 필요합니다.
- 장기 workflow와 사람 확인 단계가 늘어납니다.
- retry 가능한 background task가 필요합니다.
- routing 실패가 주요 장애 원인이 됩니다.
- RAG collection이 여러 domain으로 나뉩니다.
- audit log에서 agent 내부 decision path가 필요합니다.

재검토해도 유지할 원칙은 같습니다.

- agent service는 validated backend API 경계를 넘지 않습니다.
- raw SQL이나 범용 update/delete tool을 만들지 않습니다.
- prompt로 권한을 강제하지 않습니다.
- output은 structured model로 검증합니다.
- tool call과 model usage는 추적 가능합니다.
- 쓰기 작업은 preview와 confirmation을 분리합니다.

---


## 9. 정리


업무 시스템용 AI agent는 "모델을 붙이는 작업"보다 "경계를 설계하는 작업"에 가깝습니다.

초기에는 다음 조합이 현실적입니다.

- Pydantic AI 단일 agent
- 제한된 function tool
- backend conversation gateway
- validated backend API
- structured output
- explicit request context
- read-only 또는 preview 중심 capability
- rule 기반 routing

이후 tool과 client가 늘어나면 다음 순서로 확장합니다.

1. toolset 분리
2. rule 기반 router
3. embedding 또는 lightweight classifier
4. domain agent 분리
5. MCP server 검토
6. graph orchestration 검토

가장 중요한 원칙은 agent framework가 바뀌어도 유지됩니다.

LLM은 의도와 후보를 다루고, backend는 권한과 실행을 닫습니다.

그 경계를 유지해야 agent가 편해져도 시스템이 위험해지지 않습니다.
