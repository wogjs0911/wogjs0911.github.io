---
key: /2026/05/31/PydanticAIStudy1.html
title: Pydantic AI - Pydantic AI Study 1
tags: Pydantic-AI LLM Agent Tool-Calling MCP Streaming Structured-Output
---

# Pydantic AI 정리1 (개요, Agent, 의존성, 출력, Tools, Toolsets)

## 목차
1. [개요와 설치](#1-개요와-설치)
2. [Agent](#2-agent)
3. [Dependencies](#3-dependencies)
4. [Output](#4-output)
5. [Function Tools](#5-function-tools)
6. [Toolsets와 Capabilities](#6-toolsets와-capabilities)

---

## 1. 개요와 설치

Pydantic AI는 Pydantic 스타일의 타입 힌트, 검증, 직렬화를 기반으로 LLM 에이전트를 만들기 위한 Python 프레임워크입니다. 핵심 목표는 프로덕션 애플리케이션에서 에이전트, 도구, 구조화 출력, 모델 프로바이더, 관측 가능성을 일관된 API로 다루는 것입니다.

### 핵심 구성요소

- `Agent`: LLM 요청, instructions, tool, output validation을 묶는 기본 인터페이스입니다.
- `RunContext`: 현재 실행의 의존성, 사용량, 재시도 횟수, agent 정보에 접근합니다.
- Function tools: 모델이 호출할 수 있는 Python 함수입니다.
- Toolsets: 여러 도구를 묶고, 필터링/프리픽스/동적 구성을 적용할 수 있습니다.
- Capabilities: 도구, hook, instructions, model settings를 재사용 가능한 단위로 묶습니다.
- Output types: `BaseModel`, `TypedDict`, dataclass, primitive 타입 등을 이용해 최종 응답을 검증합니다.
- Models/providers: OpenAI, Anthropic, Google, Bedrock, Groq, Mistral, OpenRouter 등 여러 제공자를 같은 agent API로 사용합니다.
- Evals/Logfire: 테스트, 평가, 추적, 비용/지연 시간 분석을 지원합니다.

### 설치

일반적으로 전체 패키지를 쓰면 됩니다.

```bash
pip install pydantic-ai
```

`uv`를 쓰는 프로젝트라면:

```bash
uv add pydantic-ai
```

가벼운 설치가 필요하면 `pydantic-ai-slim`에 필요한 extra만 붙입니다.

```bash
uv add "pydantic-ai-slim[mcp]"
uv add "pydantic-ai-slim[fastmcp]"
```

### 모델 지정 방식

간단한 경우 문자열로 모델을 지정합니다.

```python
from pydantic_ai import Agent

agent = Agent("openai:gpt-5.2")
result = agent.run_sync("프랑스의 수도는?")
print(result.output)
```

`<provider>:<model>` 형식은 Pydantic AI가 적절한 model class, provider, profile을 자동 선택하게 합니다. Azure, OpenRouter, 커스텀 gateway처럼 endpoint/auth를 명시해야 하면 model/provider 객체를 직접 생성합니다.

### 업무 시스템에서의 권장 시작점

이 정리는 기존 backend API와 나란히 있는 Python agent service로 보는 것이 적절합니다.

- FastAPI 같은 Python 서비스에서 `Agent`를 전역 싱글턴처럼 만들고 요청별 `deps`로 조직/사용자/접근 제어/DB client를 주입합니다.
- 도메인 로직은 agent 안에 직접 넣지 말고 tool 함수 또는 별도 service client로 감쌉니다.
- 구조화 응답은 Pydantic 모델로 정의해 Java/Spring 쪽 DTO와 계약을 맞춥니다.
- 운영 전에는 Logfire/OpenTelemetry, message history 저장, tool error contract를 먼저 정합니다.

<br>

---

## 2. Agent

`Agent`는 Pydantic AI의 기본 인터페이스입니다. 하나의 agent는 다음을 담는 컨테이너로 볼 수 있습니다.

- instructions 또는 system prompt
- function tool과 toolset
- 구조화 출력 타입
- 실행 시점 의존성 타입
- 기본 모델과 모델 설정
- capability와 hook

### 기본 예시

```python
from pydantic_ai import Agent

agent = Agent(
    "openai:gpt-5.2",
    instructions="업무 요청에 짧고 정확하게 답하세요.",
)

result = agent.run_sync("이번 달 지표 요약을 알려줘")
print(result.output)
```

### 실행 메서드

| 메서드 | 용도 |
|---|---|
| `run()` | async 실행, 완료된 `AgentRunResult` 반환 |
| `run_sync()` | 동기 실행 wrapper |
| `run_stream()` | 최종 텍스트/구조화 출력을 스트리밍 |
| `run_stream_events()` | 모델 응답, tool call, tool result 등 이벤트 전체 스트리밍 |
| `iter()` | agent graph node를 직접 순회하며 세밀하게 제어 |

일반 API 서버에서는 `await agent.run(...)`을 기본으로 쓰고, CLI/스크립트에서는 `run_sync()`가 편합니다. UI 스트리밍이 필요하면 `run_stream()` 또는 `run_stream_events()`를 선택합니다.

### Instructions와 System Prompt

대부분의 경우 `instructions`를 우선 사용합니다.

- `instructions`: 현재 agent 실행에 적용되는 지시문입니다. message history를 넘겨도 현재 agent의 instructions가 기준이 됩니다.
- `system_prompt`: 이전 실행의 system prompt를 message history 안에 유지해야 하는 특수 상황에서 사용합니다.

정적 지시문:

```python
agent = Agent(
    "openai:gpt-5.2",
    instructions="항상 한국어로 답하세요.",
)
```

동적 지시문:

```python
from pydantic_ai import Agent, RunContext

agent = Agent("openai:gpt-5.2", deps_type=str)

@agent.instructions
def add_user(ctx: RunContext[str]) -> str:
    return f"현재 actor ID는 {ctx.deps}입니다."
```

### 타입 안정성

`Agent[DepsType, OutputType]` 구조로 타입이 추론됩니다. `deps_type`, tool의 `RunContext[T]`, `output_type`을 맞추면 mypy/pyright가 많은 실수를 잡아줍니다.

```python
from pydantic import BaseModel
from pydantic_ai import Agent

class SalesAnswer(BaseModel):
    summary: str
    total_amount: float

agent = Agent(
    "openai:gpt-5.2",
    output_type=SalesAnswer,
)
```

### 재시도와 자기수정

Pydantic AI는 tool 인자 검증 실패나 output validation 실패를 모델에게 다시 알려 재시도시킬 수 있습니다. tool 또는 output validator 안에서 `ModelRetry`를 발생시키면 모델에게 수정 요청이 전달됩니다.

```python
from pydantic_ai import ModelRetry

if not valid:
    raise ModelRetry("리소스 코드는 6자리 숫자여야 합니다.")
```

기본 retry는 1회이며 agent, tool, output 단위로 조정할 수 있습니다. 재시도 초과 시 `UnexpectedModelBehavior`가 발생합니다.

### 사용량 제한

운영 환경에서는 무한 루프나 과도한 tool call을 막기 위해 usage limit를 둡니다.

```python
from pydantic_ai.usage import UsageLimits

result = agent.run_sync(
    "복잡한 요청",
    usage_limits=UsageLimits(request_limit=5, tool_calls_limit=10),
)
```

### Agent Spec

agent를 YAML/JSON으로 선언할 수도 있습니다.

```yaml
model: anthropic:claude-opus-4-6
instructions: You are a helpful assistant.
capabilities:
  - WebSearch
  - Thinking:
      effort: high
```

```python
from pydantic_ai import Agent

agent = Agent.from_file("agent.yaml")
```

코드 배포 없이 agent 설정을 바꾸고 싶은 경우에 유용하지만, Python callable이 필요한 tool/hook은 코드로 유지해야 합니다.

<br>

---

## 3. Dependencies

Pydantic AI의 dependency system은 실행 시점 데이터와 서비스를 agent 내부 함수에 타입 안전하게 주입하기 위한 방식입니다. 업무 애플리케이션에서는 조직, 사용자, 접근 제어, DB/API client, 운영 로그 컨텍스트를 `deps`로 전달하는 패턴이 가장 중요합니다.

### 기본 구조

```python
from dataclasses import dataclass
import httpx
from pydantic_ai import Agent

@dataclass
class AgentDeps:
    org_id: str
    actor_id: str
    http_client: httpx.AsyncClient

agent = Agent(
    "openai:gpt-5.2",
    deps_type=AgentDeps,
)
```

`deps_type`에는 인스턴스가 아니라 타입을 넘깁니다. 실제 값은 실행할 때 `deps=`로 전달합니다.
이유는 agent 객체가 보통 애플리케이션 시작 시 한 번 만들어지고, 실제 요청별 데이터는 실행할 때마다 달라지기 때문입니다. 예를 들어 organization, user, trace ID, HTTP/DB client는 요청마다 다를 수 있으므로 `Agent(...)` 생성자에 고정 인스턴스로 넣으면 요청 상태가 섞이거나 테스트가 어려워집니다.

`deps_type=AgentDeps`는 "이 agent는 실행할 때 `AgentDeps` 모양의 의존성을 받을 것이다"라는 타입 계약입니다. Pydantic AI는 이 타입을 기준으로 `RunContext[AgentDeps]`를 매개변수화하므로, `ctx.deps.org_id`나 `ctx.deps.http_client` 같은 접근을 IDE와 타입 체커가 안전하게 이해할 수 있습니다. 반대로 실제 의존성 값은 `agent.run(..., deps=deps)`에서 넘깁니다.

```python
async with httpx.AsyncClient() as client:
    deps = AgentDeps("org-a", "actor-1", client)
    result = await agent.run("대기 중인 요청을 알려줘", deps=deps)
```

### RunContext로 접근

tool, instructions, output validator는 첫 번째 인자로 `RunContext[DepsType]`를 받을 수 있습니다.
`RunContext`는 말 그대로 "현재 agent run의 context"입니다. 여기서 `Run`은 `agent.run(...)`으로 시작된 한 번의 실행 흐름을 뜻하고, `Context`는 그 실행 중 tool, instructions, validator가 참고해야 하는 주변 정보를 담은 객체라는 뜻입니다.

함수 예제에서 보통 `ctx`라고 쓰는 이유는 Python에서 context 객체를 짧게 부를 때 자주 쓰는 관례이기 때문입니다. 이름을 꼭 `ctx`로 해야 하는 것은 아니지만, 첫 번째 인자의 타입이 `RunContext[AgentDeps]`이면 Pydantic AI는 이 값을 모델이 채우는 tool 인자가 아니라 framework가 주입하는 실행 컨텍스트로 취급합니다.

```python
from pydantic_ai import RunContext

@agent.tool
async def get_pending_requests(ctx: RunContext[AgentDeps]) -> list[dict]:
    response = await ctx.deps.http_client.get(
        f"https://api.example.com/organizations/{ctx.deps.org_id}/requests",
        headers={"X-Actor-Id": ctx.deps.actor_id},
    )
    response.raise_for_status()
    return response.json()
```

`RunContext[AgentDeps]`처럼 대괄호 안에 쓰는 타입은 `ctx.deps`의 타입을 알려주는 역할을 합니다. 위 예제에서는 `ctx.deps`가 `AgentDeps`로 추론되므로 `org_id`, `actor_id`, `http_client`에 타입 안전하게 접근할 수 있습니다.

`RunContext`에서 자주 쓰는 값:

- `ctx.deps`: 실행 시점 의존성
- `ctx.agent`: 현재 agent
- `ctx.retry`: 현재 tool/output 재시도 횟수
- `ctx.max_retries`: 해당 tool/output의 최대 재시도 횟수
- `ctx.usage`: 현재 사용량
- `ctx.run_step`: agent loop 단계

### sync와 async

Agent 실행은 내부적으로 async context에서 진행됩니다. sync tool이나 sync dependency 호출은 thread pool로 offload됩니다. I/O가 있으면 가능하면 `async def`와 async client를 쓰는 것이 좋습니다.

```python
@agent.tool
async def fetch_record(ctx: RunContext[AgentDeps], record_id: str) -> dict:
    ...
```

CPU-bound 작업이나 반드시 sync API만 있는 라이브러리는 sync 함수로 둘 수 있습니다. 장기 실행 서버에서는 thread executor를 명시적으로 제한하는 것을 고려합니다.

### 테스트용 override

application code 깊은 곳에서 agent를 호출하더라도 테스트에서는 `agent.override(deps=...)`로 의존성을 바꿀 수 있습니다.

```python
class TestDeps(AgentDeps):
    ...

async def test_agent_flow():
    test_deps = TestDeps("test-org", "test-actor", fake_client)
    with agent.override(deps=test_deps):
        result = await application_code()
    assert result
```

이 패턴은 DB, HTTP, 접근 제어 시스템을 실제로 호출하지 않고 agent 흐름을 테스트할 때 유용합니다.

### 업무 시스템 적용 규칙

- organization/user/security context는 전역 변수로 읽지 말고 `deps`로 명시합니다.
- tool 함수는 `ctx.deps`로만 외부 client에 접근하게 만들어 테스트 가능성을 유지합니다.
- 요청별 trace ID, trace correlation ID도 `deps`에 포함시킵니다.
- 백엔드 API와의 경계는 REST/gRPC client로 감싸고, agent가 서버 내부 객체를 직접 안다고 가정하지 않습니다.

<br>

---

## 4. Output

`output_type`은 agent의 최종 응답을 타입으로 제한하고 검증하는 기능입니다. 업무 API처럼 백엔드 API 계약이 중요한 시스템에서는 자유 텍스트보다 구조화 출력이 훨씬 안전합니다.

### 기본 구조화 출력

```python
from pydantic import BaseModel, Field
from pydantic_ai import Agent

class ReviewSummary(BaseModel):
    count: int = Field(description="미확인 문서 수")
    summary: str
    urgent_ids: list[str]

agent = Agent(
    "openai:gpt-5.2",
    output_type=ReviewSummary,
    instructions="사용자의 확인 현황을 요약하세요.",
)

result = agent.run_sync("내 미확인 문서 요약")
print(result.output.count)
```

Pydantic AI는 모델 응답을 `ReviewSummary`로 검증합니다. 실패하면 재시도 budget 안에서 모델에게 오류를 알려 다시 생성하게 합니다.

### 지원 타입

- `str`, `int`, `float`, `bool`
- `BaseModel`
- dataclass
- `TypedDict`
- union 타입
- list/dict 같은 컨테이너 타입
- `None`을 포함한 optional 출력
- `ToolOutput`, `NativeOutput`, `PromptedOutput` 같은 명시적 출력 모드

### Output validator

모델이 타입은 맞췄지만 비즈니스 규칙을 어겼을 때 `@agent.output_validator`를 사용합니다.

```python
from pydantic_ai import ModelRetry, RunContext

@agent.output_validator
async def validate_summary(
    ctx: RunContext[AgentDeps],
    output: ReviewSummary,
) -> ReviewSummary:
    if output.count < len(output.urgent_ids):
        raise ModelRetry("urgent_ids 개수는 전체 count보다 클 수 없습니다.")
    return output
```

validator는 원본 output을 그대로 반환하거나 수정된 output을 반환할 수 있습니다. 실패 시 `ModelRetry`로 모델에게 수정 요구를 보냅니다.

### 출력 모드 선택

| 방식 | 사용 상황 |
|---|---|
| 기본 `output_type=MyModel` | 대부분의 구조화 응답 |
| `ToolOutput(...)` | tool/function calling 기반 출력 제어 |
| `NativeOutput(...)` | provider의 native structured output을 활용하고 싶을 때 |
| `PromptedOutput(...)` | provider tool 지원이 약하거나 prompt 기반 출력이 나을 때 |

기본값은 실무에서 가장 무난합니다. 특정 provider 기능을 강하게 활용해야 할 때만 명시 모드를 고릅니다.

### Optional output

도구 호출만 수행하고 최종 텍스트가 없어도 정상으로 보고 싶다면 `None`을 허용합니다.

```python
agent = Agent("anthropic:claude-opus-4-6", output_type=str | None)
```

`output_type=None` 단독은 유효하지 않습니다. 최소 하나의 다른 타입과 함께 사용해야 합니다.

### 스트리밍 구조화 출력

`run_stream()`과 `stream_output()`을 쓰면 구조화 객체가 점진적으로 채워지는 과정을 받을 수 있습니다.

```python
async with agent.run_stream("사용자 프로필 추출") as result:
    async for partial in result.stream_output():
        print(partial)
```

부분 검증은 Pydantic의 partial validation을 활용합니다. 모델/출력 모드에 따라 streaming tool arguments 지원 여부가 달라질 수 있습니다.

### 업무 시스템 적용 규칙

- Java DTO와 주고받는 응답은 반드시 Pydantic `BaseModel`로 정의합니다.
- 금액, 수량, 날짜, 코드값은 문자열 설명만 믿지 말고 타입과 validator로 검증합니다.
- LLM이 선택한 ID를 실제 DB/API로 한 번 더 확인하는 validator 또는 service layer를 둡니다.
- 사용자에게 보여줄 자연어와 시스템이 처리할 구조화 필드는 분리합니다.

<br>

---

## 5. Function Tools

Function tool은 모델이 필요한 정보를 조회하거나 작업을 실행하기 위해 호출할 수 있는 Python 함수입니다. Pydantic AI는 함수 시그니처와 docstring에서 tool schema를 생성하고, 인자를 Pydantic으로 검증합니다.

### 등록 방식

```python
from pydantic_ai import Agent, RunContext

agent = Agent("openai:gpt-5.2", deps_type=AgentDeps)

@agent.tool
async def get_account(ctx: RunContext[AgentDeps], account_id: str) -> dict:
    """계정 ID로 계정 정보를 조회합니다."""
    ...

@agent.tool_plain
def calculate_vat(amount: float) -> float:
    """공급가액의 부가세를 계산합니다."""
    return amount * 0.1
```

- `@agent.tool`: `RunContext`가 필요한 도구
- `@agent.tool_plain`: context가 필요 없는 도구
- `Agent(..., tools=[...])`: 재사용 함수나 `Tool` 객체를 constructor에서 등록
- `toolsets=[...]`: 여러 도구를 묶어서 등록

`tools`와 `toolsets`는 둘 다 여러 tool을 agent에 제공할 수 있다는 점에서 비슷해 보입니다. 차이는 관리 단위입니다. `tools=[...]`는 개별 함수를 바로 등록하는 방식이고, `toolsets=[...]`는 여러 tool을 담은 묶음이나 provider를 등록하는 방식입니다. 모델 입장에서는 둘 다 사용 가능한 tool 목록으로 보이지만, 개발자 입장에서는 `toolsets`가 도메인별 묶음, 동적 노출, filtering, prefix, confirmation flow, MCP 같은 toolset-level 제어를 하기 좋습니다.

간단히 말하면 `tools`는 낱개 등록, `toolsets`는 묶음 등록입니다. agent 전용 tool 몇 개만 있으면 `tools`가 단순하고, 영업/회계/재고처럼 도메인별 tool 모듈을 나누거나 외부 tool provider를 붙일 때는 `toolsets`가 더 자연스럽습니다.

<br>

`tools=[...]`는 이미 정의된 함수를 여러 agent에서 재사용하거나, `Tool` 객체로 이름/설명/옵션을 더 세밀하게 제어하고 싶을 때 사용합니다.

```python
from pydantic_ai import Agent, RunContext, Tool

def get_exchange_rate(currency: str) -> float:
    """통화 코드의 현재 환율을 조회합니다."""
    return 1350.0

def get_org_id(ctx: RunContext[AgentDeps]) -> str:
    """현재 요청의 organization ID를 반환합니다."""
    return ctx.deps.org_id

agent = Agent(
    "openai:gpt-5.2",
    deps_type=AgentDeps,
    tools=[
        get_exchange_rate,
        Tool(get_org_id, takes_ctx=True, name="app_get_org_id"),
    ],
)
```

<br>

`toolsets=[...]`는 도메인별 도구 묶음이나 실행 시점별 도구 구성을 분리하고 싶을 때 사용합니다.

```python
from pydantic_ai import Agent, FunctionToolset

def get_account(account_id: str) -> dict:
    """계정 ID로 계정 정보를 조회합니다."""
    return {"account_id": account_id, "name": "Acme"}

def get_record(record_no: str) -> dict:
    """레코드 번호로 레코드 정보를 조회합니다."""
    return {"record_no": record_no, "amount": 100000}

accounts_toolset = FunctionToolset(tools=[get_account])
records_toolset = FunctionToolset(tools=[get_record])

agent = Agent(
    "openai:gpt-5.2",
    toolsets=[accounts_toolset, records_toolset],
)
```

### Tool schema

Pydantic AI는 함수 파라미터 타입과 docstring에서 JSON schema를 만듭니다.
함수 시그니처의 타입 힌트는 schema의 타입과 필수 인자 정보를 만들고, docstring은 tool 설명과 파라미터 설명으로 들어갑니다.

`docstring_format="google"`는 docstring의 내용을 의미하는 것이 아니라, `Args:` 블록을 Google 스타일 docstring으로 해석하라고 명시하는 옵션입니다. Pydantic AI는 보통 docstring 형식을 자동으로 추론할 수 있으므로 생략해도 동작할 수 있지만, 팀 규칙이나 예제에서는 명시해 두면 어떤 형식의 docstring을 기대하는지 분명해집니다.

```python
@agent.tool_plain(docstring_format="google", require_parameter_descriptions=True)
def find_record(record_no: str, fiscal_year: int) -> dict:
    """레코드 정보를 조회합니다.

    Args:
        record_no: 레코드 번호
        fiscal_year: 회계연도
    """
    ...
```

`require_parameter_descriptions=True`를 사용하면 파라미터 설명 누락을 개발 단계에서 잡을 수 있습니다.

### Tool 반환값

tool은 Pydantic이 JSON으로 직렬화할 수 있는 값을 반환할 수 있습니다. 멀티모달 지원 모델에서는 이미지, 문서, 오디오, 비디오 콘텐츠도 반환할 수 있습니다.

복잡한 경우 `ToolReturn`을 사용해 모델에게 보낼 content와 애플리케이션에서 사용할 metadata를 분리합니다.

일반적인 경우에는 `dict`, `list`, `str`, `int`처럼 JSON으로 직렬화 가능한 값을 그대로 반환하면 됩니다.

```python
@agent.tool
async def get_record_summary(
    ctx: RunContext[AgentDeps],
    record_no: str,
) -> dict:
    """레코드 요약 정보를 조회합니다."""
    record = await ctx.deps.api_client.get_record(record_no)
    return {
        "record_no": record.no,
        "vendor_name": record.vendor_name,
        "amount": record.amount,
        "currency": record.currency,
        "status": record.status,
    }
```

모델에게는 요약 정보만 보내고, 애플리케이션에는 운영 로그나 후속 처리용 정보를 따로 남겨야 한다면 `ToolReturn`을 사용합니다.

```python
from pydantic_ai import ToolReturn

@agent.tool
async def update_record_status(
    ctx: RunContext[AgentDeps],
    record_no: str,
) -> ToolReturn:
    """레코드 상태를 변경합니다."""
    result = await ctx.deps.api_client.update_record_status(
        org_id=ctx.deps.org_id,
        actor_id=ctx.deps.actor_id,
        record_no=record_no,
    )

    return ToolReturn(
        return_value={
            "record_no": record_no,
            "status": "updated",
            "message": "레코드가 업데이트되었습니다.",
        },
        metadata={
            "org_id": ctx.deps.org_id,
            "actor_id": ctx.deps.actor_id,
            "trace_id": result.trace_id,
            "record_entry_id": result.record_entry_id,
        },
    )
```

`return_value`는 tool 결과로 모델에게 전달되는 값입니다. `metadata`는 모델에게 보내지 않고 애플리케이션에서 운영 로그, 추적, 후속 처리에 사용할 수 있는 값입니다.

### 재시도

인자 검증이 실패하면 Pydantic AI가 자동으로 retry prompt를 모델에게 보냅니다. 비즈니스 로직상 재시도가 필요하면 `ModelRetry`를 직접 발생시킵니다.

```python
from pydantic_ai import ModelRetry

@agent.tool(retries=2)
async def get_employee(ctx: RunContext[AgentDeps], employee_no: str) -> dict:
    employee = await lookup(employee_no)
    if employee is None:
        raise ModelRetry("존재하는 사번을 입력해야 합니다.")
    return employee
```

tool retry는 tool별로 따로 집계됩니다. 한 tool의 실패가 전체 tool call budget을 공유하지 않습니다.

### Timeout

장시간 실행되는 도구는 timeout을 둡니다.

```python
agent = Agent("openai:gpt-5.2", tool_timeout=30)

@agent.tool_plain(timeout=5)
async def quick_lookup(code: str) -> dict:
    ...
```

timeout은 실패로 처리되고 retry prompt가 모델에게 전달됩니다.

### Args validator

Pydantic schema 검증 이후, tool 실행 전에 비즈니스 검증을 추가할 수 있습니다.

```python
def validate_amount(ctx: RunContext[AgentDeps], amount: float) -> None:
    if amount <= 0:
        raise ModelRetry("금액은 0보다 커야 합니다.")

@agent.tool(args_validator=validate_amount)
async def create_refund(ctx: RunContext[AgentDeps], amount: float) -> str:
    ...
```

확인 기반 tool에서는 사용자의 확인을 요청하기 전에 validator가 먼저 실행되어 잘못된 인자를 걸러냅니다.

### 병렬 tool call

모델이 한 응답에서 여러 tool call을 반환하면 Pydantic AI는 기본적으로 병렬 실행합니다. 순차 실행이 필요한 side effect 도구는 sequential로 제한합니다.

```python
from pydantic_ai import Tool

Tool(create_record_entry, takes_ctx=True, sequential=True)
```

`sequential=True`는 이 tool을 순차 실행해야 한다는 표시입니다. 모델이 같은 응답에서 여러 tool call을 요청하더라도, 레코드 생성, 외부 실행, 상태 변경처럼 순서와 중복 실행이 중요한 tool은 병렬로 섞이지 않도록 제한해야 합니다. 반대로 단순 조회 tool은 기본 병렬 실행을 그대로 두는 편이 latency 면에서 유리합니다.

`takes_ctx=True`는 병렬/순차 여부와 관계없는 설정입니다. `Tool(...)` 객체로 직접 등록할 때, 해당 함수가 첫 번째 인자로 `RunContext`를 받는지 알려주는 옵션입니다.

```python
from pydantic_ai import RunContext, Tool

def calculate_vat(amount: float) -> float:
    """부가세를 계산합니다."""
    return amount * 0.1

async def create_record_entry(
    ctx: RunContext[AgentDeps],
    record_id: str,
) -> dict:
    """레코드를 확정합니다."""
    return await ctx.deps.api_client.create_record_entry(
        org_id=ctx.deps.org_id,
        record_id=record_id,
    )

tools = [
    Tool(calculate_vat, takes_ctx=False),
    Tool(create_record_entry, takes_ctx=True, sequential=True),
]
```

함수를 `Agent(..., tools=[calculate_vat, create_record_entry])`처럼 직접 넘기면 Pydantic AI가 함수 시그니처를 보고 `RunContext` 필요 여부를 추론할 수 있습니다. `Tool(...)`로 감싸 직접 등록할 때는 `takes_ctx=True/False`로 명시하면 됩니다.

또는 agent run context에서 전체 병렬 도구 실행 모드를 순차로 바꿀 수 있습니다.

### Tool Search와 deferred loading

도구가 많아지면 모든 schema를 매번 모델에게 보내는 비용이 커집니다. `defer_loading=True`로 도구를 숨기고, 모델이 필요할 때 검색하게 할 수 있습니다.

```python
@agent.tool_plain(defer_loading=True)
def mortgage_calculator(principal: float, rate: float, years: int) -> str:
    """Calculate a monthly repayment amount for a sample loan."""
    ...
```

도구가 10개 이상이거나 schema가 10k tokens 이상이면 검토할 만합니다. 자주 쓰는 핵심 도구는 즉시 노출하고, 긴 꼬리 도구만 deferred로 두는 것이 좋습니다.

### 업무 시스템 적용 규칙

- 조회 tool과 변경 tool을 명확히 분리합니다.
- 변경 tool은 운영 로그, 접근 제어 체크, idempotency key를 고려합니다.
- 확인, 레코드 생성, 외부 실행 같은 side effect는 확인 흐름 없이는 직접 실행하지 않게 설계합니다.
- tool 이름은 `accounts_get_account`, `records_create_item`처럼 도메인 prefix를 둡니다.

<br>

---

## 6. Toolsets와 Capabilities

Toolset은 여러 tool을 묶는 단위이고, Capability는 toolset, hook, instructions, model settings를 함께 묶는 확장 단위입니다.

### Toolset

`FunctionToolset`은 로컬 Python 함수를 도구 묶음으로 등록합니다.

```python
from pydantic_ai import Agent, FunctionToolset

sales_tools = FunctionToolset()

@sales_tools.tool_plain
def get_sales_order(order_id: str) -> dict:
    ...

agent = Agent("openai:gpt-5.2", toolsets=[sales_tools])
```

Toolset은 다음 방식으로 agent에 붙일 수 있습니다.

- `Agent(..., toolsets=[...])`: agent 생성 시 등록
- `agent.run(..., toolsets=[...])`: 특정 실행에만 추가
- `@agent.toolset`: 실행 컨텍스트에 따라 동적으로 생성
- `agent.override(toolsets=[...])`: 테스트/특수 상황에서 교체

### Toolset composition

| 기능 | 설명 |
|---|---|
| `CombinedToolset` | 여러 toolset을 하나로 결합 |
| `filtered()` | 조건에 따라 도구 노출 여부 결정 |
| `prefixed()` | 도구 이름 충돌 방지를 위해 prefix 추가 |
| `renamed()` | 도구 이름 변경 |
| `prepared()` | tool definition 설명/metadata 등을 단계별 수정 |
| `WrapperToolset` | tool 실행 자체를 감싸 logging/metrics/permission 적용 |

업무 시스템에서는 업무 도메인별로 toolset을 나누고 prefix를 붙이는 방식이 관리하기 좋습니다.

```python
agent = Agent(
    "openai:gpt-5.2",
    toolsets=[
        sales_tools.prefixed("sales"),
        accounting_tools.prefixed("acct"),
    ],
)
```

### 동적 toolset

조직, 접근 제어, 업무 모듈 설정에 따라 도구를 다르게 노출할 수 있습니다.

```python
@agent.toolset
def organization_tools(ctx: RunContext[AgentDeps]):
    if ctx.deps.org_id in premium_orgs:
        return premium_toolset
    return basic_toolset
```

### Capability

Capability는 reusable agent behavior입니다. 다음을 제공할 수 있습니다.

- tools/toolsets/native tools
- lifecycle hooks
- static/dynamic instructions
- model settings
- history processor
- thread executor
- instrumentation

대표 built-in capability:

| Capability | 용도 |
|---|---|
| `Thinking` | reasoning/thinking effort 설정 |
| `Hooks` | lifecycle hook 등록 |
| `Instrumentation` | OpenTelemetry/Logfire 계측 |
| `WebSearch`, `WebFetch` | provider native 또는 local fallback 검색/URL fetch |
| `MCP` | MCP server 연결 |
| `ToolSearch` | deferred tool discovery |
| `PrepareTools` | tool definition 필터/수정 |
| `ProcessHistory` | message history 전처리 |
| `ThreadExecutor` | sync 함수 실행 thread pool 제어 |

### Hooks

hook은 모델 요청, tool 실행, 스트리밍 이벤트 전후를 가로챕니다.

```python
from pydantic_ai.capabilities import Hooks

hooks = Hooks()

@hooks.on.before_model_request
async def log_request(ctx, request_context):
    print(f"messages={len(request_context.messages)}")
    return request_context

agent = Agent("openai:gpt-5.2", capabilities=[hooks])
```

logging, metrics, 접근 제어 검사, 메시지 필터링처럼 agent 전체에 걸쳐 반복되는 관심사를 넣기에 좋습니다.

### Capability composition

여러 capability는 middleware처럼 합쳐집니다.

- configuration은 병합됩니다.
- `before_*` hook은 목록 순서대로 실행됩니다.
- `after_*` hook은 역순으로 실행됩니다.
- `wrap_*` hook은 첫 capability가 가장 바깥쪽 wrapper가 됩니다.

계측/운영/보안처럼 항상 바깥에서 감싸야 하는 capability는 ordering을 명시할 수 있습니다.

예를 들어 운영 capability와 보안 capability를 함께 등록하면 첫 번째 capability가 가장 바깥 wrapper처럼 동작합니다.

```python
from pydantic_ai import Agent, ModelRequestContext, RunContext
from pydantic_ai.capabilities import Hooks, WrapModelRequestHandler
from pydantic_ai.messages import ModelResponse

trace_hooks = Hooks()
security_hooks = Hooks()
log: list[str] = []

@trace_hooks.on.before_model_request
async def trace_before(
    ctx: RunContext[None],
    request_context: ModelRequestContext,
) -> ModelRequestContext:
    log.append("trace.before")
    return request_context

@security_hooks.on.before_model_request
async def security_before(
    ctx: RunContext[None],
    request_context: ModelRequestContext,
) -> ModelRequestContext:
    log.append("security.before")
    return request_context

@trace_hooks.on.model_request
async def trace_wrap(
    ctx: RunContext[None],
    *,
    request_context: ModelRequestContext,
    handler: WrapModelRequestHandler,
) -> ModelResponse:
    log.append("trace.wrap.before")
    response = await handler(request_context)
    log.append("trace.wrap.after")
    return response

@security_hooks.on.model_request
async def security_wrap(
    ctx: RunContext[None],
    *,
    request_context: ModelRequestContext,
    handler: WrapModelRequestHandler,
) -> ModelResponse:
    log.append("security.wrap.before")
    response = await handler(request_context)
    log.append("security.wrap.after")
    return response

@trace_hooks.on.after_model_request
async def trace_after(
    ctx: RunContext[None],
    *,
    request_context: ModelRequestContext,
    response: ModelResponse,
) -> ModelResponse:
    log.append("trace.after")
    return response

@security_hooks.on.after_model_request
async def security_after(
    ctx: RunContext[None],
    *,
    request_context: ModelRequestContext,
    response: ModelResponse,
) -> ModelResponse:
    log.append("security.after")
    return response

agent = Agent(
    "openai:gpt-5.2",
    capabilities=[trace_hooks, security_hooks],
)
```

위 구성의 실행 순서는 개념적으로 다음과 같습니다.

```python
[
    "trace.before",
    "security.before",
    "trace.wrap.before",
    "security.wrap.before",
    "security.wrap.after",
    "trace.wrap.after",
    "security.after",
    "trace.after",
]
```

리스트 작성 순서와 무관하게 특정 capability가 항상 바깥쪽에 있어야 한다면 `CapabilityOrdering`을 사용합니다.

```python
from pydantic_ai.capabilities import CapabilityOrdering, Hooks

trace_hooks = Hooks(
    ordering=CapabilityOrdering(position="outermost"),
)

security_hooks = Hooks(
    ordering=CapabilityOrdering(wrapped_by=[trace_hooks]),
)

agent = Agent(
    "openai:gpt-5.2",
    capabilities=[
        security_hooks,
        trace_hooks,
    ],
)
```

이 경우 코드에는 `security_hooks`가 먼저 적혀 있어도 `trace_hooks`가 가장 바깥쪽 capability로 정렬됩니다.

이런 ordering은 "항상 전체 실행을 감싸야 하는 공통 정책"에 주로 사용합니다. 대표적인 예는 다음과 같습니다.

- `Instrumentation`: agent run, model request, tool call 전체를 trace로 남김
- 운영 로그: 누가, 어떤 organization에서, 어떤 tool을 호출했고 어떤 결과가 나왔는지 기록
- 보안/접근 제어 검사: organization 접근 제한, 위험 tool 실행 전 접근 제어 확인
- guardrail: 모델 요청 전 민감정보 제거, 응답 후 정책 위반/PII/placeholder 검사
- rate limit/cost control: organization/user/agent별 요청 횟수와 token 비용 제한
- message history processing: 오래된 대화 압축, 민감 메시지 제거, 불필요한 history 필터링

업무 시스템에서는 다음처럼 바깥쪽에서 안쪽으로 공통 정책을 쌓는 구성이 자연스럽습니다.

```text
Instrumentation
  -> Trace
    -> Security / Guardrails
      -> RateLimit / CostControl
        -> Agent run / model request / tool execution
```

특히 guardrail은 capability/hook으로 만들면 여러 agent에 반복 적용하기 좋습니다.

```python
from pydantic_ai.capabilities import Hooks

guardrail_hooks = Hooks(
    ordering=CapabilityOrdering(wrapped_by=[trace_hooks]),
)

@guardrail_hooks.on.before_model_request
async def redact_sensitive_input(ctx, request_context):
    # 모델 요청 전에 민감 식별자, API key, 비공개 토큰 등을 제거합니다.
    return request_context

@guardrail_hooks.on.after_model_request
async def validate_model_response(ctx, request_context, response):
    # 모델 응답에 민감정보, placeholder, 정책 위반 표현이 있는지 검사합니다.
    return response
```

### 업무 시스템 적용 규칙

- 도메인 도구 묶음은 toolset으로 만들고, 공통 정책은 capability로 만듭니다.
- 운영 로그, 접근 제어 검사, 비용 추적은 capability/hook으로 공통화합니다.
- toolset은 state를 공유하지 않도록 per-run lifecycle을 고려합니다.
- 위험 도구는 `PrepareTools`나 `filtered()`로 접근 제어에 따라 숨깁니다.

<br>

---
