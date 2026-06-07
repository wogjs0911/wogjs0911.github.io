---
key: /2026/05/31/PydanticAIStudy5.html
title: Pydantic AI - Pydantic AI Study 5
tags: Pydantic-AI LLM Agent Multi-Agent OpenTelemetry Observability Integrations
---

# Pydantic AI 정리5 (Multi-Agent와 Observability)

## 목차
1. [Multi-Agent 패턴](#1-multi-agent-패턴)
2. [Observability와 Integrations](#2-observability와-integrations)

---

## 1. Multi-Agent 패턴

### Multi-Agent 패턴

Pydantic AI에서는 여러 agent를 조합해 복잡한 문제를 나눌 수 있습니다.

대표 패턴:

- Router agent: 요청을 분류하고 전문 agent로 전달
- Specialist agents: 프로필, 분석, 리소스 등 도메인별 agent
- Evaluator/critic agent: 결과 검토와 품질 평가
- Extractor agent: 웹/문서/텍스트에서 구조화 데이터 추출
- Orchestrator graph: 단계별 agent 호출과 tool 실행을 graph로 제어

#### Agent delegation

Delegation은 상위 agent가 tool 내부에서 하위 agent를 호출하고 다시 제어권을 가져오는 방식입니다. 하위 agent 호출에 `ctx.usage`를 넘기면 전체 요청의 usage limit을 함께 관리할 수 있습니다.

```python
from dataclasses import dataclass

from pydantic_ai import Agent, RunContext, UsageLimits
from pydantic_ai.models.test import TestModel


@dataclass
class AppDeps:
    org_id: str
    actor_id: str


analysis_agent = Agent(
    TestModel(custom_output_text="A-001 계정의 처리 대기 항목은 3건입니다."),
    deps_type=AppDeps,
    instructions="분석/처리 대기 항목 질문만 처리합니다.",
)

router_agent = Agent(
    TestModel(
        call_tools=["ask_analysis"],
        custom_output_text="분석 agent 결과를 바탕으로 답변했습니다.",
    ),
    deps_type=AppDeps,
    instructions="필요하면 전문 agent tool을 호출한 뒤 최종 답변합니다.",
)


@router_agent.tool
async def ask_analysis(ctx: RunContext[AppDeps], question: str) -> str:
    result = await analysis_agent.run(
        question,
        deps=ctx.deps,
        usage=ctx.usage,
    )
    return result.output


result = router_agent.run_sync(
    "A-001 계정 처리 대기 항목 알려줘",
    deps=AppDeps(org_id="ORG-001", actor_id="ACTOR-007"),
    usage_limits=UsageLimits(request_limit=5, tool_calls_limit=2),
)
print(result.output)
print(result.usage)
```

이 패턴은 "router가 다시 최종 응답을 작성해야 하는 경우"에 적합합니다. 하위 agent가 완전히 제어권을 가져가도 되는 경우라면 programmatic hand-off가 더 단순합니다.

#### Programmatic hand-off

Application code가 먼저 route를 결정하고, 그 결과에 따라 agent를 호출하는 방식입니다. 업무 애플리케이션에서는 접근 제어, 추적, 트랜잭션 경계를 application service가 통제하기 쉬워서 MVP 기본값으로 더 적합합니다.

```python
from typing import Literal

from pydantic import BaseModel
from pydantic_ai import Agent


class RouteDecision(BaseModel):
    domain: Literal["profile", "analysis", "catalog", "general"]
    reason: str


router_agent = Agent(
    "openai:gpt-5-mini",
    output_type=RouteDecision,
    instructions="사용자 요청을 application workflow 도메인으로 분류합니다.",
    defer_model_check=True,
)

profile_agent = Agent("openai:gpt-5-mini", instructions="프로필 업무를 처리합니다.", defer_model_check=True)
analysis_agent = Agent("openai:gpt-5-mini", instructions="분석 업무를 처리합니다.", defer_model_check=True)
catalog_agent = Agent("openai:gpt-5-mini", instructions="리소스 업무를 처리합니다.", defer_model_check=True)
general_agent = Agent("openai:gpt-5-mini", instructions="일반 업무 안내를 처리합니다.", defer_model_check=True)


async def answer_by_route(user_message: str) -> str:
    route = await router_agent.run(user_message)

    agents = {
        "profile": profile_agent,
        "analysis": analysis_agent,
        "catalog": catalog_agent,
        "general": general_agent,
    }
    selected_agent = agents[route.output.domain]
    result = await selected_agent.run(user_message)
    return result.output
```

`defer_model_check=True`는 문서 예시에서 로컬 API key 없이 객체 생성을 보여주기 위한 옵션입니다. 실제 실행 환경에서는 provider 설정과 API key가 필요합니다.

### 언제 여러 agent로 나눌까

나누는 것이 좋은 경우:

- instructions와 toolset이 도메인별로 크게 다름
- 접근 제어/추적/비용 정책이 agent별로 다름
- 추출, 계획, 실행, 검증의 역할이 명확히 다름
- 특정 단계만 다른 모델/provider를 써야 함

나누지 않는 것이 좋은 경우:

- 단일 요청에서 간단한 tool 몇 개만 쓰면 충분함
- agent 간 메시지 전달 비용이 품질 이득보다 큼
- 책임 경계가 흐려져 디버깅이 어려워짐

간단한 판단 기준은 코드로도 표현할 수 있습니다.

```python
from dataclasses import dataclass


@dataclass
class SplitDecisionInput:
    distinct_toolsets: bool
    distinct_permissions: bool
    needs_different_model: bool
    requires_separate_trace: bool
    simple_read_only_request: bool


def should_split_agent(case: SplitDecisionInput) -> bool:
    if case.simple_read_only_request and not case.distinct_permissions:
        return False

    split_signals = [
        case.distinct_toolsets,
        case.distinct_permissions,
        case.needs_different_model,
        case.requires_separate_trace,
    ]
    return sum(split_signals) >= 2


assert should_split_agent(
    SplitDecisionInput(
        distinct_toolsets=True,
        distinct_permissions=True,
        needs_different_model=False,
        requires_separate_trace=True,
        simple_read_only_request=False,
    )
)
```

### 업무 애플리케이션 예시 구조

```text
User request
  -> RouterAgent
      -> SalesAgent
      -> AccountingAgent
      -> HRAgent
  -> PolicyValidator
  -> FinalResponseAgent
```

권장:

- Router는 도메인 분류와 필요한 context만 선택합니다.
- Specialist는 자기 도메인 toolset만 봅니다.
- 변경 작업은 별도 confirmation/execution agent 또는 service layer로 분리합니다.
- 최종 응답은 구조화 출력으로 API 계약을 맞춥니다.

아래 예시는 LLM 호출 없이 workflow orchestration 구조만 graph로 표현한 것입니다. 실제 specialist 단계에서는 `Agent.run()`을 호출하되, application data 접근은 검증된 backend API client를 통해 수행합니다.

```python
import asyncio
from dataclasses import dataclass, field
from typing import Literal

from pydantic import BaseModel
from pydantic_graph import GraphBuilder, StepContext, TypeExpression


Domain = Literal["profile", "analysis", "catalog", "general"]


class AgentAnswer(BaseModel):
    domain: Domain
    text: str
    requires_confirmation: bool = False


@dataclass
class WorkflowGraphState:
    org_id: str
    actor_id: str
    route: Domain | None = None
    trace_events: list[str] = field(default_factory=list)


g = GraphBuilder(
    state_type=WorkflowGraphState,
    input_type=str,
    output_type=AgentAnswer,
)


@g.step
async def route_request(ctx: StepContext[WorkflowGraphState, None, str]) -> Domain:
    message = ctx.inputs
    if "레코드" in message or "처리 대기" in message:
        route: Domain = "analysis"
    elif "리소스" in message:
        route = "catalog"
    elif "계정" in message:
        route = "profile"
    else:
        route = "general"

    ctx.state.route = route
    ctx.state.trace_events.append(f"route={route}")
    return route


@g.step
async def profile_step(ctx: StepContext[WorkflowGraphState, None, Domain]) -> AgentAnswer:
    ctx.state.trace_events.append("profile_agent")
    return AgentAnswer(domain="profile", text="계정 정보를 조회했습니다.")


@g.step
async def analysis_step(ctx: StepContext[WorkflowGraphState, None, Domain]) -> AgentAnswer:
    ctx.state.trace_events.append("analysis_agent")
    return AgentAnswer(domain="analysis", text="처리 대기 항목 요약을 조회했습니다.")


@g.step
async def catalog_step(ctx: StepContext[WorkflowGraphState, None, Domain]) -> AgentAnswer:
    ctx.state.trace_events.append("catalog_agent")
    return AgentAnswer(domain="catalog", text="리소스 현황을 조회했습니다.")


@g.step
async def general_step(ctx: StepContext[WorkflowGraphState, None, Domain]) -> AgentAnswer:
    ctx.state.trace_events.append("general_agent")
    return AgentAnswer(domain="general", text="처리 가능한 application workflow를 안내했습니다.")


@g.step
async def policy_validator(ctx: StepContext[WorkflowGraphState, None, AgentAnswer]) -> AgentAnswer:
    if "확인" in ctx.inputs.text or "수정" in ctx.inputs.text:
        ctx.inputs.requires_confirmation = True
    ctx.state.trace_events.append("policy_validated")
    return ctx.inputs


g.add(
    g.edge_from(g.start_node).to(route_request),
    g.edge_from(route_request).to(
        g.decision()
        .branch(g.match(TypeExpression[Literal["profile"]]).to(profile_step))
        .branch(g.match(TypeExpression[Literal["analysis"]]).to(analysis_step))
        .branch(g.match(TypeExpression[Literal["catalog"]]).to(catalog_step))
        .branch(g.match(TypeExpression[Literal["general"]]).to(general_step))
    ),
    g.edge_from(profile_step, analysis_step, catalog_step, general_step).to(policy_validator),
    g.edge_from(policy_validator).to(g.end_node),
)

workflow_graph = g.build()


async def main():
    state = WorkflowGraphState(org_id="ORG-001", actor_id="ACTOR-007")
    answer = await workflow_graph.run(state=state, inputs="A-001 계정 처리 대기 항목 요약")
    print(answer)
    print(state.trace_events)


asyncio.run(main())
```

### 주의점

- Multi-agent는 latency와 token 비용이 빠르게 증가합니다.
- 각 agent의 message history와 trace를 연결할 correlation ID가 필요합니다.
- agent 간 전달 데이터는 자유 텍스트보다 Pydantic 모델을 사용합니다.
- 운영에서는 실패 지점이 늘어나므로 fallback/retry 정책을 단계별로 정의합니다.

실패와 비용을 제어하려면 agent별 usage limit, timeout, fallback 응답, trace event를 명시적으로 둡니다.

```python
from dataclasses import dataclass, field

from pydantic_ai import Agent, UsageLimits


@dataclass
class OrchestrationTrace:
    request_id: str
    events: list[str] = field(default_factory=list)


analysis_agent = Agent(
    "openai:gpt-5-mini",
    instructions="분석 조회 요청만 처리합니다.",
    defer_model_check=True,
)


async def run_analysis_with_fallback(
    user_message: str,
    trace: OrchestrationTrace,
) -> str:
    trace.events.append("analysis_agent:start")

    try:
        result = await analysis_agent.run(
            user_message,
            usage_limits=UsageLimits(request_limit=3, total_tokens_limit=2_000),
        )
    except TimeoutError:
        trace.events.append("analysis_agent:timeout")
        return "분석 조회가 지연되고 있습니다. 잠시 후 다시 시도해 주세요."
    except Exception as exc:
        trace.events.append(f"analysis_agent:error:{type(exc).__name__}")
        return "분석 조회 중 오류가 발생했습니다. 요청 ID로 관리자에게 문의해 주세요."

    trace.events.append("analysis_agent:success")
    return result.output
```

### 기준 문서

- Pydantic AI 공식 문서 v1.102.0 스냅샷
- 관련 공식 문서: Agent.iter, Pydantic Graph, GraphBuilder, Joins & Reducers, Decisions, Parallel Execution, Multi-Agent Patterns
<br>

---

## 2. Observability와 Integrations

### OpenTelemetry

Pydantic AI 계측은 OpenTelemetry 기반입니다. Logfire SDK를 쓰더라도 다른 OpenTelemetry backend로 trace를 보낼 수 있습니다.

OpenTelemetry는 특정 vendor 제품이 아니라 telemetry 데이터를 만들고 전달하기 위한 표준 계층입니다. Kubernetes에서 관측성을 공부할 때 자주 나오는 이유는 pod, namespace, deployment, node 같은 실행 환경 metadata를 공통 형식으로 붙여서 여러 backend로 보낼 수 있기 때문입니다.

핵심 개념은 다음처럼 나눠 볼 수 있습니다.

| 개념 | 의미 | 업무 애플리케이션/agent-service 적용 |
|---|---|---|
| Signal | trace, metric, log 같은 관측 데이터 종류 | agent run은 trace, token/cost는 metric, trace event는 log/event로 분리 |
| Trace | 하나의 요청이 여러 서비스/스팬을 지나간 전체 흐름 | Conversation Service -> Python agent service -> backend API 호출 연결 |
| Span | trace 안의 단일 작업 단위 | agent run, model request, tool call, backend API call |
| Resource | telemetry를 만든 실행 주체 metadata | service name, k8s namespace, pod, container, environment |
| Attribute | span/metric/log에 붙는 key-value | org_id, actor_id, module, tool_name, access_result |
| Context propagation | 서비스 경계를 넘어 trace context를 전달하는 방식 | 상위 backend에서 받은 `traceparent`를 agent-service와 backend API 호출에 전달 |
| Baggage | trace와 함께 전파되는 작은 key-value context | organization tier, region 같은 라우팅/샘플링 힌트. 민감 정보는 넣지 않음 |
| Semantic convention | attribute 이름과 의미를 맞추는 규칙 | `service.name`, `k8s.namespace.name`, `gen_ai.*` 같은 표준 key 사용 |
| Collector | telemetry 수집/가공/라우팅 프록시 | organization/namespace별 sampling, redaction, backend routing |

Kubernetes 멀티테넌트 환경에서는 보통 다음 구조로 이해하면 됩니다.

```mermaid
flowchart LR
  Browser["업무 애플리케이션 Web UI"] --> Spring["Conversation Service"]
  Spring --> AgentService["Python Agent Service"]
  AgentService --> 업무 애플리케이션["Backend APIs"]

  Spring -. "traceparent / baggage" .-> AgentService
  AgentService -. "traceparent / baggage" .-> 업무 애플리케이션

  Spring --> Collector["OTel Collector"]
  AgentService --> Collector
  업무 애플리케이션 --> Collector

  Collector --> Logfire["Logfire or OTel Backend"]
  Collector --> SIEM["Security/Trace Store"]
```

여기서 `org_id`와 Kubernetes namespace는 역할이 다릅니다.

- `k8s.namespace.name`: workload가 실행되는 Kubernetes 격리 단위입니다. 예: `sample-prod`, `org-a-prod`.
- `org_id`: 애플리케이션 데이터 접근 제어와 추적 기준입니다. 예: `ORG-001`.
- `service.name`: telemetry를 낸 서비스입니다. 예: `conversation-service`, `ai-agent-service`.
- `request_id`/`conversation_id`: 한 사용자 요청이나 대화 흐름을 찾기 위한 application correlation ID입니다.

멀티테넌트 업무 애플리케이션에서는 `org_id`를 trace 검색용 attribute로 남길 수 있지만, metric label로 무제한 사용하면 high cardinality 문제가 생길 수 있습니다. 예를 들어 organization이 수천 개라면 `llm_tokens_total{org_id=...}` 같은 metric은 backend 비용과 성능을 크게 악화시킬 수 있습니다. 운영 metric은 `org_tier`, `module`, `environment`처럼 cardinality가 낮은 label을 우선하고, organization별 상세 추적은 trace/log 조회나 별도 집계 테이블을 사용하는 편이 안전합니다.

backend 서비스에서 Python agent service를 호출할 때는 W3C Trace Context의 `traceparent` 헤더를 전달하고, 필요한 경우 baggage에 낮은 cardinality 값만 넣습니다.

```text
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
baggage: org_tier=enterprise,region=region-1
x-org-id: ORG-001
x-actor-id: ACTOR-007
x-request-id: REQ-20260601-0001
```

Python agent service에서는 span attribute로 application context를 붙입니다.

```python
from opentelemetry import trace


tracer = trace.get_tracer("sample.ai.agent-service")


async def handle_agent_request(
    *,
    org_id: str,
    actor_id: str,
    request_id: str,
    message: str,
) -> str:
    with tracer.start_as_current_span("sample.agent.request") as span:
        span.set_attribute("sample.org_id", org_id)
        span.set_attribute("sample.actor_id", actor_id)
        span.set_attribute("sample.request_id", request_id)
        span.set_attribute("sample.module", "conversation")

        # 실제 구현에서는 여기서 agent.run(...)을 호출합니다.
        return f"처리 대상 메시지: {message}"
```

Collector에서는 resource/attribute를 기준으로 redaction, sampling, routing을 적용합니다. 아래는 개념 예시입니다.

```yaml
processors:
  attributes/redact_sensitive:
    actions:
      - key: sample.user_phone
        action: delete
      - key: sample.account_number
        action: delete
  probabilistic_sampler/default:
    sampling_percentage: 10

exporters:
  otlp/logfire:
    endpoint: https://otlp.logfire.pydantic.dev
  otlp/internal:
    endpoint: https://otel-backend.example.com:4317

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [attributes/redact_sensitive, probabilistic_sampler/default]
      exporters: [otlp/logfire, otlp/internal]
```

Logfire SDK를 사용하되, 데이터를 Logfire가 아니라 자체 운영 OpenTelemetry Collector로 보낼 수 있습니다.

```python
import os

import logfire


os.environ["OTEL_EXPORTER_OTLP_ENDPOINT"] = "http://otel-collector:4318"

logfire.configure(
    service_name="sample-agent-service",
    send_to_logfire=False,
)
logfire.instrument_pydantic_ai()
```

Logfire SDK 없이 순수 OpenTelemetry SDK로도 계측할 수 있습니다.

```python
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.trace import set_tracer_provider

from pydantic_ai import Agent
from pydantic_ai.models.instrumented import InstrumentationSettings


tracer_provider = TracerProvider()
tracer_provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter()))
set_tracer_provider(tracer_provider)

Agent.instrument_all(
    InstrumentationSettings(
        version=2,
        use_aggregated_usage_attribute_names=True,
    )
)
```

특정 agent에만 계측을 붙이고 싶으면 capability로 제한합니다.

```python
from pydantic_ai import Agent
from pydantic_ai.capabilities import Instrumentation
from pydantic_ai.models.instrumented import InstrumentationSettings


instrumented_agent = Agent(
    "openai:gpt-5-mini",
    name="catalog_agent",
    instructions="리소스 조회 요청만 처리합니다.",
    defer_model_check=True,
    capabilities=[
        Instrumentation(
            settings=InstrumentationSettings(
                include_content=False,
                include_binary_content=False,
                use_aggregated_usage_attribute_names=True,
            )
        )
    ],
)
```

### Direct model request 계측

`Agent`가 아닌 `pydantic_ai.direct` API를 사용할 때도 계측할 수 있습니다.

```python
from pydantic_ai import ModelRequest
from pydantic_ai.direct import model_request_sync

response = model_request_sync(
    "anthropic:claude-haiku-4-5",
    [ModelRequest.user_text_prompt("대기 중인 요청 요약 문구를 한 문장으로 작성해줘")],
    instrument=True,
)
```

async 코드에서는 `model_request`를 사용합니다. `model_request_sync`는 이미 이벤트 루프가 실행 중인 FastAPI handler 안에서 호출하지 않습니다.

```python
from pydantic_ai import ModelRequest
from pydantic_ai.direct import model_request


async def rewrite_summary(summary: str) -> str:
    response = await model_request(
        "openai:gpt-5-mini",
        [
            ModelRequest.user_text_prompt(
                f"다음 업무 요약을 간결하고 전문적인 문체로 다듬어줘: {summary}"
            )
        ],
        instrument=True,
    )
    return response.parts[0].content
```

streaming direct request도 개별 model request span으로 계측할 수 있습니다.

```python
from pydantic_ai import ModelRequest
from pydantic_ai.direct import model_request_stream


async def stream_rewrite(summary: str) -> list[str]:
    chunks: list[str] = []
    messages = [ModelRequest.user_text_prompt(summary)]

    async with model_request_stream(
        "openai:gpt-5-mini",
        messages,
        instrument=True,
    ) as stream:
        async for event in stream:
            chunks.append(type(event).__name__)

    return chunks
```

### UI integrations

Pydantic AI는 UI 프로토콜과 통합할 수 있습니다.

- AG-UI
- Vercel AI
- Web Chat UI 예제

UI adapter를 쓰면 protocol의 thread/chat ID에서 `conversation_id`를 자동으로 채우는 방식으로 trace correlation을 얻을 수 있습니다.

AG-UI를 FastAPI endpoint에 붙일 때는 인증/접근 제어 검증은 바깥 route에서 처리하고, 검증된 organization/actor context만 agent deps로 넘깁니다.

```python
from dataclasses import dataclass

from fastapi import FastAPI
from starlette.requests import Request
from starlette.responses import Response

from pydantic_ai import Agent
from pydantic_ai.ui.ag_ui import AGUIAdapter


@dataclass
class AppDeps:
    org_id: str
    actor_id: str


agent = Agent(
    "openai:gpt-5-mini",
    deps_type=AppDeps,
    name="sample_ui_agent",
    instructions="업무 애플리케이션 채팅 UI 요청을 처리합니다.",
    defer_model_check=True,
)

app = FastAPI()


@app.post("/ag-ui")
async def ag_ui_chat(request: Request) -> Response:
    org_id = request.headers["x-org-id"]
    actor_id = request.headers["x-actor-id"]

    return await AGUIAdapter.dispatch_request(
        request,
        agent=agent,
        deps=AppDeps(org_id=org_id, actor_id=actor_id),
    )
```

Vercel AI Data Stream Protocol을 쓰는 프론트엔드라면 adapter만 바꿔 같은 원칙으로 붙입니다.

```python
from fastapi import FastAPI
from starlette.requests import Request
from starlette.responses import Response

from pydantic_ai import Agent
from pydantic_ai.ui.vercel_ai import VercelAIAdapter


agent = Agent(
    "openai:gpt-5-mini",
    name="sample_web_ui_agent",
    instructions="Vercel AI SDK 기반 채팅 요청을 처리합니다.",
    defer_model_check=True,
)

app = FastAPI()


@app.post("/chat")
async def chat(request: Request) -> Response:
    return await VercelAIAdapter.dispatch_request(request, agent=agent)
```

주의할 점은 UI adapter endpoint 자체가 인증 경계가 아니라는 점입니다. client가 보낸 message history, tool result, 확인 응답은 신뢰하지 말고 Conversation Service 또는 agent-service middleware에서 세션/접근 제어/context를 다시 검증해야 합니다.

### CLI

CLI integration은 agent를 command line에서 실행하고 기존 conversation context를 넘기거나 모델/도구를 지정하는 흐름을 지원합니다. 개발 중 agent 동작을 빠르게 확인하는 데 유용합니다.

일회성 prompt 테스트:

```bash
clai --model openai:gpt-5-mini "대기 중인 요청 요약 응답 예시를 작성해줘"
```

프로젝트에 정의한 agent를 직접 지정해 실행할 수도 있습니다.

```bash
clai --agent sample_agent.service:agent "A-001 계정 처리 대기 항목 요약"
```

로컬 smoke 확인용 agent module은 다음처럼 최소화할 수 있습니다.

```python
from pydantic_ai import Agent


agent = Agent(
    "openai:gpt-5-mini",
    name="sample_cli_smoke_agent",
    instructions="업무 애플리케이션 agent 로컬 smoke 테스트용입니다.",
    defer_model_check=True,
)
```

CLI 테스트는 빠른 prompt 확인에는 좋지만, application data 접근이 필요한 시나리오는 fake/stub API 또는 별도 staging organization을 사용합니다. 운영 DB를 직접 바라보는 CLI agent는 피합니다.

### Durable execution

Temporal, DBOS, Prefect, Restate 같은 durable execution integration은 긴 agent workflow를 재시도 가능하고 복구 가능하게 만들기 위한 기능입니다.

주의:

- dynamic capability 중 toolset을 runtime에 새로 만드는 패턴은 durable execution에서 제한이 있을 수 있습니다.
- workflow 안에서 I/O를 직접 수행하지 않도록 tool/activity 경계를 명확히 해야 합니다.
- enqueue, tool execution, external event 처리 방식이 일반 async 실행과 다를 수 있습니다.

Temporal을 쓰는 경우 agent 이름과 toolset ID를 안정적으로 고정해야 workflow replay가 깨지지 않습니다.

```python
from temporalio import workflow

from pydantic_ai import Agent
from pydantic_ai.durable_exec.temporal import PydanticAIWorkflow, TemporalAgent


agent = Agent(
    "openai:gpt-5-mini",
    name="workflow_confirmation_agent",
    instructions="긴 확인 검토 workflow에서 확인 문서를 분석합니다.",
    defer_model_check=True,
)

temporal_agent = TemporalAgent(agent)


@workflow.defn
class ConfirmationReviewWorkflow(PydanticAIWorkflow):
    __pydantic_ai_agents__ = [temporal_agent]

    @workflow.run
    async def run(self, request_id: str, user_message: str) -> str:
        result = await temporal_agent.run(
            user_message,
            metadata={"request_id": request_id},
        )
        return result.output
```

Temporal worker/client 쪽에서는 Pydantic AI plugin과 Logfire plugin을 함께 등록해 workflow/activity/agent trace를 연결합니다.

```python
from temporalio.client import Client

from pydantic_ai.durable_exec.temporal import LogfirePlugin, PydanticAIPlugin


async def connect_temporal() -> Client:
    return await Client.connect(
        "localhost:7233",
        plugins=[
            PydanticAIPlugin(),
            LogfirePlugin(),
        ],
    )
```

DBOS나 Prefect는 구조가 더 단순한 agent-service 작업에 맞을 수 있습니다. DBOS 예시는 다음처럼 agent를 wrapper로 감싸고, wrapper의 `run()`을 사용합니다.

```python
from dbos import DBOS, DBOSConfig

from pydantic_ai import Agent
from pydantic_ai.durable_exec.dbos import DBOSAgent


dbos_config: DBOSConfig = {
    "name": "sample_ai_agent_service",
    "system_database_url": "sqlite:///dbos.sqlite",
}
DBOS(config=dbos_config)

agent = Agent(
    "openai:gpt-5-mini",
    name="workflow_dbos_agent",
    instructions="재시도 가능한 workflow agent workflow를 처리합니다.",
    defer_model_check=True,
)

durable_agent = DBOSAgent(agent)


async def run_durable_message(user_message: str) -> str:
    DBOS.launch()
    result = await durable_agent.run(user_message)
    return result.output
```

Durable execution에 넘기는 `deps`, tool output, workflow input/output은 작고 직렬화 가능해야 합니다. backend API client connection, DB session, file handle 같은 객체를 그대로 넘기지 말고 organization/actor/request ID와 같은 식별자만 넘긴 뒤 activity/tool 내부에서 안전하게 재구성합니다.

### 운영 체크리스트

- agent별 이름과 version을 trace에 남깁니다.
- `run_id`, `conversation_id`, organization ID, actor ID, request ID를 연결합니다.
- tool call별 접근 제어 결과와 side effect 결과를 운영 로그에 남깁니다.
- 비용/토큰/latency threshold를 모니터링합니다.
- retry 폭증, validation 실패율, fallback 비율을 알림 지표로 둡니다.
- message와 tool result에 민감 정보가 포함되는지 redaction 정책을 둡니다.

운영 wrapper는 agent 결과와 usage를 trace/event metric으로 분리해 남깁니다.

```python
from dataclasses import dataclass
from uuid import uuid4

import logfire
from pydantic_ai import Agent, UsageLimits


@dataclass
class ConversationTrace:
    request_id: str
    org_id: str
    actor_id: str
    agent_name: str
    input_tokens: int
    output_tokens: int
    requests: int
    tool_calls: int


agent = Agent(
    "openai:gpt-5-mini",
    name="workflow_agent",
    instructions="업무 애플리케이션 사용자를 지원합니다.",
    defer_model_check=True,
)


async def traceed_run(
    *,
    org_id: str,
    actor_id: str,
    user_message: str,
) -> tuple[str, ConversationTrace]:
    request_id = str(uuid4())

    with logfire.span("workflow.agent.run", request_id=request_id, org_id=org_id):
        result = await agent.run(
            user_message,
            usage_limits=UsageLimits(request_limit=5, total_tokens_limit=4_000),
            metadata={
                "request_id": request_id,
                "org_id": org_id,
                "actor_id": actor_id,
            },
        )

    usage = result.usage
    trace = ConversationTrace(
        request_id=request_id,
        org_id=org_id,
        actor_id=actor_id,
        agent_name="workflow_agent",
        input_tokens=usage.input_tokens or 0,
        output_tokens=usage.output_tokens or 0,
        requests=usage.requests or 0,
        tool_calls=usage.tool_calls or 0,
    )
    return result.output, trace
```

민감 데이터 redaction은 trace export 전에 적용할 정책으로 분리합니다. 간단한 예시는 다음과 같습니다.

```python
import re


PHONE_PATTERN = re.compile(r"\b01[016789]-\d{3,4}-\d{4}\b")
ACCOUNT_PATTERN = re.compile(r"\b\d{2,6}-\d{2,6}-\d{2,8}\b")


def redact_message(value: str) -> str:
    value = PHONE_PATTERN.sub("[PHONE]", value)
    value = ACCOUNT_PATTERN.sub("[ACCOUNT]", value)
    return value
```

### 기준 문서

- Pydantic AI 공식 문서 v1.102.0 스냅샷
- 관련 공식 문서: Debugging & Monitoring with Pydantic Logfire, Direct model request, UI integrations, CLI Usage, Durable execution integrations
- OpenTelemetry 공식 문서: [Concepts](https://opentelemetry.io/docs/concepts/), [Traces](https://opentelemetry.io/docs/concepts/signals/traces/), [Baggage](https://opentelemetry.io/docs/concepts/signals/baggage/), [Resources](https://opentelemetry.io/docs/concepts/resources/), [Semantic Conventions](https://opentelemetry.io/docs/concepts/semantic-conventions/), [Kubernetes resource attributes](https://opentelemetry.io/docs/specs/semconv/resource/k8s/)
<br>

---
