---
key: /2026/05/31/PydanticAIStudy3.html
title: Pydantic AI - Pydantic AI Study 3
tags: Pydantic-AI LLM Agent Testing Evals TestModel FunctionModel
---

# Pydantic AI 정리3 (Testing과 Evals 기본)

## 목차
1. [Testing](#1-testing)
2. [Pydantic Evals 기본](#2-pydantic-evals-기본)

---

## 1. Testing

Pydantic AI는 실제 LLM을 호출하지 않고 agent 흐름을 테스트하기 위한 모델을 제공합니다. 핵심은 `TestModel`, `FunctionModel`, dependency override, message inspection입니다.

### TestModel vs FunctionModel

| 구분 | `TestModel` | `FunctionModel` |
|---|---|---|
| 목적 | 빠른 agent smoke/unit test | 모델 동작을 직접 제어하는 정밀 unit test |
| tool call | 기본적으로 등록된 tool을 자동 호출 | `ModelResponse`와 `ToolCallPart`를 직접 반환 |
| 입력값 | tool schema를 만족하는 더미 값을 생성 | prompt, message history, `AgentInfo`를 보고 원하는 인자 생성 |
| 검증에 좋은 것 | tool schema 노출 여부, deps 주입, output schema, application flow | 특정 tool 인자, retry 경로, history processor, 분기 조건 |
| 한계 | prompt 의미를 이해하지 않으므로 도메인 값이 부정확할 수 있음 | 테스트용 모델 함수를 직접 작성해야 해서 코드가 길어짐 |
| 업무 시스템 기본 용도 | "실제 LLM 없이 agent wiring이 깨지지 않는가" 확인 | "특정 계정/레코드/접근 제어 케이스가 정확한 tool call로 이어지는가" 확인 |

간단히 말하면 `TestModel`은 agent와 tool 등록이 정상인지 빠르게 확인할 때 좋고, `FunctionModel`은 "이 사용자 문장에서 반드시 이 tool이 이 인자로 호출되어야 한다"는 업무 규칙을 검증할 때 좋습니다.

### TestModel

`TestModel`은 개발/테스트에서 agent가 어떤 tools/output schema를 받는지 확인하기 좋습니다.

```python
from pydantic_ai import Agent
from pydantic_ai.models.test import TestModel

test_model = TestModel()
agent = Agent(test_model)

result = agent.run_sync("hello")
print(result.output)
```

`last_model_request_parameters`로 모델 요청에 들어간 tool definitions 등을 검사할 수 있습니다.

```python
print(test_model.last_model_request_parameters.function_tools)
```

### FunctionModel

`FunctionModel`은 모델 응답을 Python 함수로 직접 정의합니다. history processor, tool schema, 특정 응답 시나리오를 정밀하게 테스트할 때 유용합니다.

```python
from pydantic_ai import ModelResponse, TextPart
from pydantic_ai.models.function import FunctionModel

def model_fn(messages, info):
    return ModelResponse(parts=[TextPart(content="테스트 응답")])

agent = Agent(FunctionModel(model_fn))
```

### 같은 application tool을 두 모델로 테스트하는 예시

아래 예시는 계정 처리 대기 항목 조회 tool을 기준으로 `TestModel`과 `FunctionModel`의 차이를 보여줍니다. 실제 외부 시스템 DB를 직접 조회하지 않고, backend API client 역할의 fake client를 `deps`로 주입하는 구조입니다.

```python
from dataclasses import dataclass

from pydantic_ai import Agent, RunContext, models

models.ALLOW_MODEL_REQUESTS = False


class FakeApiClient:
    def __init__(self) -> None:
        self.calls: list[tuple[str, str, str]] = []

    async def list_pending_records(
        self,
        *,
        org_id: str,
        actor_id: str,
        account_id: str,
    ) -> dict[str, object]:
        self.calls.append((org_id, actor_id, account_id))
        return {
            "account_id": account_id,
            "total_overdue": 120000,
            "record_count": 2,
        }


@dataclass
class AppDeps:
    org_id: str
    actor_id: str
    api_client: FakeApiClient


status_agent = Agent(
    "openai:gpt-5.2",
    deps_type=AppDeps,
    instructions="사용자의 접근 제어 범위 안에서 처리 대기 항목 정보를 조회합니다.",
)


@status_agent.tool
async def list_pending_records(
    ctx: RunContext[AppDeps],
    account_id: str,
) -> dict[str, object]:
    """계정의 처리 대기 레코드 요약을 조회합니다."""
    return await ctx.deps.api_client.list_pending_records(
        org_id=ctx.deps.org_id,
        actor_id=ctx.deps.actor_id,
        account_id=account_id,
    )
```

#### TestModel 예시: wiring과 schema 확인

`TestModel`은 tool schema를 보고 `account_id`에 schema-valid 더미 문자열을 넣습니다. 따라서 "A-001이 정확히 들어갔는가"보다 "tool이 노출되고, deps의 organization/actor context가 backend API client까지 전달되는가"를 확인하는 데 적합합니다.

```python
from pydantic_ai.models.test import TestModel


async def test_status_agent_wiring_with_test_model():
    api_client = FakeApiClient()
    deps = AppDeps(
        org_id="ORG-001",
        actor_id="ACTOR-007",
        api_client=api_client,
    )
    test_model = TestModel(
        call_tools=["list_pending_records"],
        custom_output_text="처리 대기 항목 조회가 끝났습니다.",
    )

    with status_agent.override(model=test_model):
        result = await status_agent.run("A-001 계정의 처리 대기 항목을 알려줘", deps=deps)

    assert result.output == "처리 대기 항목 조회가 끝났습니다."
    assert len(api_client.calls) == 1

    org_id, actor_id, generated_account_id = api_client.calls[0]
    assert (org_id, actor_id) == ("ORG-001", "ACTOR-007")
    assert isinstance(generated_account_id, str)

    params = test_model.last_model_request_parameters
    assert params is not None
    tool_names = [tool.name for tool in params.function_tools]
    assert "list_pending_records" in tool_names
```

여기서 `with status_agent.override(model=test_model):`은 dependency override가 아니라 model override입니다. 같은 `Agent.override(...)` API를 쓰지만, `model=`을 넘기면 실제 provider 모델 대신 `TestModel`/`FunctionModel`을 사용하고, `deps=`를 넘기면 agent 실행 시 사용할 dependency를 바꿉니다.

```python
with status_agent.override(model=test_model):
    result = await status_agent.run("A-001 계정의 처리 대기 항목을 알려줘", deps=deps)
```

위 코드는 다음 두 가지가 함께 일어납니다.

- `override(model=test_model)`: 실제 `"openai:gpt-5.2"` 호출을 막고 `TestModel`을 사용
- `run(..., deps=deps)`: 이번 agent 실행에 사용할 organization/actor/client context 전달

이 테스트에서 `generated_account_id`는 사용자 prompt의 `A-001`이라고 기대하면 안 됩니다. `TestModel`은 LLM처럼 prompt 의미를 해석하지 않고, tool schema를 만족하는 값을 생성하기 때문입니다.

#### FunctionModel 예시: 특정 tool 인자와 분기 확인

`FunctionModel`은 테스트 코드가 직접 모델 응답을 만듭니다. prompt에서 계정 코드를 추출해 `ToolCallPart`를 반환하면, 특정 업무 입력이 정확한 tool 인자로 전달되는지 검증할 수 있습니다.

```python
import re

from pydantic_ai import ModelMessage, ModelResponse, TextPart, ToolCallPart
from pydantic_ai.models.function import AgentInfo, FunctionModel


def ar_model_fn(messages: list[ModelMessage], info: AgentInfo) -> ModelResponse:
    tool_names = {tool.name for tool in info.function_tools}
    assert "list_pending_records" in tool_names

    if len(messages) == 1:
        prompt_part = messages[0].parts[-1]
        match = re.search(r"C-\d+", prompt_part.content)
        assert match is not None

        return ModelResponse(
            parts=[
                ToolCallPart(
                    "list_pending_records",
                    {"account_id": match.group()},
                )
            ]
        )

    tool_return = messages[-1].parts[0]
    assert tool_return.part_kind == "tool-return"
    return ModelResponse(parts=[TextPart("A-001의 처리 대기 항목은 3건입니다.")])


async def test_status_agent_tool_args_with_function_model():
    api_client = FakeApiClient()
    deps = AppDeps(
        org_id="ORG-001",
        actor_id="ACTOR-007",
        api_client=api_client,
    )

    with status_agent.override(model=FunctionModel(ar_model_fn)):
        result = await status_agent.run("A-001 계정의 처리 대기 항목을 알려줘", deps=deps)

    assert api_client.calls == [("ORG-001", "ACTOR-007", "A-001")]
    assert result.output == "A-001의 처리 대기 항목은 3건입니다."
```

이 방식은 workflow agent에서 특히 중요합니다. 계정 ID, 레코드 번호, 분석연도, 접근 제어 context처럼 잘못 들어가면 장애나 추적 이슈가 되는 값은 `FunctionModel`로 명시적인 테스트를 두는 편이 안전합니다.

### Dependency override

외부 API/DB를 실제로 호출하지 않으려면 `agent.override(deps=...)`를 사용합니다. 앞의 예시처럼 `agent.run(..., deps=deps)`를 직접 호출할 수 있으면 굳이 dependency override가 필요 없습니다. dependency override는 agent 호출이 application code 깊은 곳에 숨어 있어서 테스트 코드가 `run(..., deps=...)`를 직접 넘기기 어려울 때 유용합니다.

여기서 "application code 내부에서 agent가 호출된다"는 말은 테스트 코드가 `status_agent.run(...)`을 직접 호출하지 않고, FastAPI handler, service 함수, use case 함수 같은 실제 애플리케이션 함수가 내부에서 agent를 실행하는 경우를 뜻합니다.

```text
테스트 코드
  -> 애플리케이션 코드
      -> status_agent.run(...)
          -> 모델 응답
          -> tool 호출
```

두 경우 모두 결국 agent가 실행된다는 점은 같습니다. 차이는 테스트 코드가 `status_agent.run(..., deps=...)`를 직접 쓸 수 있는 위치에 있느냐입니다.

또 하나 구분할 점은 "애플리케이션 코드가 agent를 호출하는 것"과 "agent 실행 중 tool이 호출되는 것"이 서로 다른 단계라는 점입니다.

```text
answer_user_message()
  -> status_agent.run(...)
      -> TestModel 또는 실제 LLM
          -> list_pending_records(ctx, account_id)
              -> ctx.deps.api_client.list_pending_records(...)
```

`override(model=...)`은 `TestModel 또는 실제 LLM` 단계를 바꾸고, `override(deps=...)`나 `run(..., deps=...)`는 tool 내부의 `ctx.deps`에 들어갈 값을 바꿉니다.

```python
with agent.override(deps=fake_deps):
    result = await application_code()
```

agent 호출이 application code 깊은 곳에 있어도 override context 안에서는 fake deps가 사용됩니다.

#### deps를 직접 넘기는 경우

테스트 코드가 agent 호출 지점을 직접 가지고 있으면 `run(..., deps=deps)`가 가장 단순합니다.

```python
async def test_direct_deps():
    api_client = FakeApiClient()
    deps = AppDeps(
        org_id="ORG-001",
        actor_id="ACTOR-007",
        api_client=api_client,
    )

    with status_agent.override(model=TestModel(call_tools=["list_pending_records"])):
        await status_agent.run("A-001 계정의 처리 대기 항목을 알려줘", deps=deps)

    assert api_client.calls[0][0] == "ORG-001"
    assert api_client.calls[0][1] == "ACTOR-007"
```

이 방식은 agent service 함수 자체를 테스트할 때 적합합니다. 테스트에서 organization/actor/access-control context를 명시적으로 구성하고, 실제 backend API client 대신 fake client를 넣습니다.

#### deps override가 필요한 경우

반대로 실제 애플리케이션 코드가 내부에서 agent를 호출한다면 테스트 코드가 `deps`를 직접 넘길 수 없습니다. 이때 `agent.override(deps=...)`로 context 전체를 교체합니다.

```python
async def answer_user_message(message: str) -> str:
    result = await status_agent.run(message)
    return result.output
```

위 함수는 `status_agent.run(message)`만 호출하고 `deps`를 받지 않습니다. 테스트에서는 다음처럼 model과 deps를 함께 override할 수 있습니다.

```python
async def test_application_code_with_deps_override():
    api_client = FakeApiClient()
    fake_deps = AppDeps(
        org_id="ORG-001",
        actor_id="ACTOR-007",
        api_client=api_client,
    )
    test_model = TestModel(
        call_tools=["list_pending_records"],
        custom_output_text="처리 대기 항목 조회가 끝났습니다.",
    )

    with status_agent.override(model=test_model, deps=fake_deps):
        answer = await answer_user_message("A-001 계정의 처리 대기 항목을 알려줘")

    assert answer == "처리 대기 항목 조회가 끝났습니다."
    assert api_client.calls[0][0:2] == ("ORG-001", "ACTOR-007")
```

이 패턴은 Conversation Service가 Python agent service의 특정 endpoint를 호출하고, agent service 내부 service 함수가 agent를 실행하는 구조를 테스트할 때 유용합니다. 테스트는 실제 LLM과 실제 backend API를 모두 막고, agent wiring, 접근 제어 context 전달, tool 호출 여부만 검증할 수 있습니다.

실제 구조에서는 보통 service 생성자나 dependency injection으로 backend API client를 주입받고, service 내부에서 요청별 `AppDeps`를 구성합니다.

```python
@dataclass
class ChatRequest:
    org_id: str
    actor_id: str
    message: str


class ChatService:
    def __init__(self, api_client: FakeApiClient) -> None:
        self.api_client = api_client

    async def answer(self, request: ChatRequest) -> str:
        deps = AppDeps(
            org_id=request.org_id,
            actor_id=request.actor_id,
            api_client=self.api_client,
        )
        result = await status_agent.run(request.message, deps=deps)
        return result.output


async def test_chat_service_injects_deps():
    api_client = FakeApiClient()
    service = ChatService(api_client)
    request = ChatRequest(
        org_id="ORG-001",
        actor_id="ACTOR-007",
        message="A-001 계정의 처리 대기 항목을 알려줘",
    )

    with status_agent.override(model=TestModel(call_tools=["list_pending_records"])):
        await service.answer(request)

    assert api_client.calls[0][0:2] == ("ORG-001", "ACTOR-007")
```

이 예시에서 `with status_agent.override(model=TestModel(...)):`는 dependency를 바꾸는 코드가 아니라 실제 LLM 호출만 막는 model override입니다. `deps`는 테스트 코드가 직접 넘기지 않아도 됩니다. `ChatService.answer()` 내부에서 이미 다음 코드를 실행하기 때문입니다.

```python
deps = AppDeps(
    org_id=request.org_id,
    actor_id=request.actor_id,
    api_client=self.api_client,
)
result = await status_agent.run(request.message, deps=deps)
```

따라서 테스트 코드의 역할은 두 가지로 나뉩니다.

- `service = ChatService(api_client)`: service가 사용할 backend API client를 fake로 주입
- `with status_agent.override(model=TestModel(...))`: 실제 provider 모델 대신 테스트 모델 사용

즉 dependency는 service 생성자 주입과 `answer()` 내부의 `run(..., deps=deps)`로 처리되고, `override(model=...)`은 모델만 교체합니다.

상황별로 정리하면 다음과 같습니다.

| 상황 | deps 전달 위치 | 테스트에서 필요한 처리 |
|---|---|---|
| 테스트가 `status_agent.run()`을 직접 호출 | 테스트 코드의 `run(..., deps=fake_deps)` | `override(model=...)` |
| service가 내부에서 `AppDeps`를 생성 | service 내부의 `run(..., deps=deps)` | fake client를 service에 주입하고 `override(model=...)` |
| application 함수가 `status_agent.run(message)`만 호출 | 명시적인 전달 위치 없음 | `override(model=..., deps=fake_deps)` |

따라서 `agent.override(deps=...)`가 꼭 필요한 경우는 "애플리케이션 함수가 `deps`를 외부에서 받지 않고 내부에서 agent를 실행하는데, 테스트에서 그 내부 실행의 dependency만 바꿔야 하는 경우"입니다. 반대로 request나 service dependency injection으로 `AppDeps`를 명시적으로 구성할 수 있으면, `run(..., deps=...)` 또는 service에 fake client를 주입하는 방식이 더 읽기 쉽습니다.

주의할 점은 운영 코드에서 `deps`를 생략하려면 agent가 실행 시점에 사용할 dependency를 다른 방식으로 받을 수 있어야 한다는 것입니다. 업무 애플리케이션에서는 요청별 organization/actor/access-control context가 필수이므로, production path에서는 FastAPI handler나 service layer에서 명시적으로 `AppDeps`를 만들고 agent 실행에 주입하는 방식을 기본으로 둡니다. `agent.override(deps=...)`는 주로 테스트에서 그 주입 지점을 바꾸기 위한 도구로 보는 편이 안전합니다.

### Tool 테스트

tool은 가능한 한 순수 함수 또는 얇은 service client wrapper로 만들고 독립적으로 테스트합니다.

검증 포인트:

- 함수 signature와 docstring이 명확한가
- 잘못된 입력에서 `ModelRetry`를 발생시키는가
- side effect tool은 접근 제어/추적/idempotency를 처리하는가
- timeout과 retry 설정이 업무 성격에 맞는가

### Message history 테스트

`result.all_messages()`와 `result.new_messages()`를 검사하면 agent가 어떤 요청/응답/tool call을 거쳤는지 볼 수 있습니다.

History processor는 `FunctionModel`로 provider에 실제 전달되는 messages를 캡처해서 테스트할 수 있습니다.

주의: history를 자르거나 요약할 때 tool call과 tool return 쌍을 깨면 실제 provider에서 오류가 날 수 있습니다.

### 구조화 출력 테스트

`output_type`이 있는 agent는 다음을 테스트합니다.

- 정상 입력에서 Pydantic 모델로 반환되는가
- 누락/잘못된 필드를 validator가 잡는가
- `ModelRetry` 후 성공/실패 경로가 예상대로 동작하는가
- Java/Spring DTO와 필드명/타입 계약이 맞는가

### 테스트 레벨

- Unit: tool 함수, validator, dependency factory
- Agent unit: `TestModel`/`FunctionModel` 기반 agent 흐름
- Contract: backend API client와 DTO schema
- Integration: 실제 sandbox/staging LLM provider 호출
- Eval: 여러 케이스를 데이터셋으로 반복 평가

### 업무 애플리케이션 적용 규칙

- 기본 CI에서는 실제 LLM 호출을 하지 않습니다.
- 실제 provider 호출 테스트는 별도 marker와 비용 제한을 둡니다.
- side effect tool은 dry-run 또는 fake backend로 테스트합니다.
- 운영 로그와 접근 제어 실패 케이스를 정상 성공 케이스만큼 중요하게 다룹니다.
<br>

---

## 2. Pydantic Evals 기본

Pydantic Evals는 AI 시스템을 데이터셋과 evaluator로 반복 평가하는 코드 중심 프레임워크입니다. 일반 unit test가 단일 동작을 확인한다면, eval은 여러 입력 케이스에서 품질, 정확도, 포맷, 비용, 지연 시간 같은 지표를 추적합니다.

### 기본 구성

- `Case`: 하나의 테스트 케이스입니다. 입력, 기대 출력, metadata 등을 담습니다.
- `Dataset`: 여러 case와 evaluator를 묶습니다.
- Task function: 평가 대상 함수입니다. agent 호출을 감싸는 함수가 됩니다.
- Evaluator: 결과가 좋은지 판단하는 로직입니다.
- Report: 평가 실행 결과와 metrics를 담습니다.

```python
from pydantic_evals import Case, Dataset
from pydantic_evals.evaluators import Contains


def my_agent_function(user_message: str) -> str:
    if "대기 요청" in user_message:
        return "대기 중인 요청 3건이 있습니다."
    return "조회할 업무를 찾지 못했습니다."


dataset = Dataset(
    name="workflow_agent_eval",
    cases=[
        Case(
            name="pending_requests",
            inputs="내 대기 중인 요청 요약",
            expected_output="대기 요청",
        ),
    ],
    evaluators=[Contains(value="대기 요청")],
)

report = dataset.evaluate_sync(my_agent_function)
```

실제 프로젝트에서는 task function이 `Agent.run`을 감싸는 얇은 adapter가 됩니다. 아래 예시에서는 `request_task()`가 task function입니다. `Dataset`은 각 `Case.inputs`를 이 함수에 전달하고, 함수는 `request_agent.run(...)`을 호출한 뒤 `result.output`을 evaluator가 검증할 수 있는 값으로 반환합니다.

평가 코드는 Python agent service 안에서 실행하되, 애플리케이션 데이터는 직접 DB 조회가 아니라 backend API를 호출하는 client를 통해 가져오는 형태를 유지합니다. 다만 eval에서는 실제 backend 서버나 외부 시스템 DB 상태에 의존하지 않도록, 같은 interface를 가진 fake/stub client를 `deps`로 주입합니다. 즉, tool의 구조는 운영 코드와 비슷하게 유지하되 외부 I/O만 deterministic한 fake 응답으로 대체합니다.

```python
from dataclasses import dataclass

from pydantic_ai import Agent, RunContext
from pydantic_evals import Case, Dataset


@dataclass
class AppDeps:
    org_id: str
    actor_id: str
    api_client: "FakeApiClient"


class FakeApiClient:
    """Eval에서 검증된 backend API client를 대체하는 stub입니다."""

    async def list_pending_requests(self, org_id: str, actor_id: str) -> dict[str, int | str]:
        return {"org_id": org_id, "actor_id": actor_id, "count": 3}


request_agent = Agent(
    "openai:gpt-5-mini",
    deps_type=AppDeps,
    instructions="사용자의 접근 제어 범위 안에서 요청함을 요약합니다.",
    defer_model_check=True,  # 문서 예시에서는 로컬 API key 없이 import 가능하게 둡니다.
)


@request_agent.tool
async def list_pending_requests(ctx: RunContext[AppDeps]) -> dict[str, int | str]:
    """backend API를 통해 대기 중인 요청 수를 조회합니다."""
    # 운영에서는 backend API client가 호출되고,
    # eval에서는 같은 계약을 가진 fake/stub client가 호출됩니다.
    return await ctx.deps.api_client.list_pending_requests(
        org_id=ctx.deps.org_id,
        actor_id=ctx.deps.actor_id,
    )


async def request_task(user_message: str) -> str:
    result = await request_agent.run(
        user_message,
        deps=AppDeps(
            org_id="ORG-001",
            actor_id="ACTOR-007",
            api_client=FakeApiClient(),
        ),
    )
    return result.output


dataset = Dataset(
    name="request_smoke",
    cases=[
        Case(
            name="pending_request_summary",
            inputs="내 대기 중인 요청 요약해줘",
            expected_output="대기 요청",
        ),
    ],
)
```

### Built-in evaluator

Pydantic Evals는 문자열 포함, equality, 구조 검증 등 기본 evaluator를 제공합니다. 단순 포맷/필드 존재/정확한 값 비교는 LLM Judge보다 deterministic evaluator를 우선합니다.

workflow agent에서는 다음처럼 빠르고 결정적인 검사를 먼저 둡니다.

```python
from pydantic_evals import Case, Dataset
from pydantic_evals.evaluators import Contains, EqualsExpected, IsInstance, MaxDuration


def request_summary_task(inputs: dict[str, str]) -> dict[str, object]:
    return {
        "status": "ok",
        "summary": "대기 중인 요청 3건이 있습니다.",
        "count": 3,
    }


dataset = Dataset(
    name="request_builtin_checks",
    cases=[
        Case(
            name="request_summary_shape",
            inputs={"message": "내 대기 중인 요청 요약"},
            expected_output={
                "status": "ok",
                "summary": "대기 중인 요청 3건이 있습니다.",
                "count": 3,
            },
        ),
    ],
    evaluators=[
        IsInstance(type_name="dict"),
        EqualsExpected(),
        Contains(value={"status": "ok"}),
        MaxDuration(seconds=2.0),
    ],
)

report = dataset.evaluate_sync(request_summary_task, max_concurrency=2)
report.print()
```

응답이 자유 텍스트라면 exact match보다 `Contains`를 먼저 사용합니다.

```python
from pydantic_evals import Case, Dataset
from pydantic_evals.evaluators import Contains, IsInstance


dataset = Dataset(
    name="text_response_checks",
    cases=[Case(name="mentions_confirmation", inputs="대기 요청 알려줘")],
    evaluators=[
        IsInstance(type_name="str"),
        Contains(value="대기 요청", case_sensitive=False),
    ],
)
```

### Custom evaluator

업무 규칙은 custom evaluator로 분리하는 것이 좋습니다.

예:

- 응답에 계정 ID가 실제 DB에 존재하는가
- 금액 합계가 line item 합과 일치하는가
- 접근 제어 없는 정보가 포함되지 않았는가
- JSON schema가 API 계약과 맞는가

Evaluator는 너무 많은 일을 한 번에 하지 말고 작은 평가 기준으로 분리합니다.

예를 들어 외부 시스템 응답에 접근 제어 없는 필드가 섞이지 않았는지 검사하는 evaluator는 다음처럼 작성할 수 있습니다.

```python
from dataclasses import dataclass
from typing import Any

from pydantic_evals import Case, Dataset
from pydantic_evals.evaluators import EvaluationReason, Evaluator, EvaluatorContext


@dataclass
class NoUnauthorizedFields(Evaluator[dict[str, str], dict[str, Any], dict[str, Any]]):
    def evaluate(
        self,
        ctx: EvaluatorContext[dict[str, str], dict[str, Any], dict[str, Any]],
    ) -> EvaluationReason:
        allowed_fields = set(ctx.metadata.get("allowed_fields", ()))
        actual_fields = set(ctx.output)
        leaked_fields = sorted(actual_fields - allowed_fields)

        if leaked_fields:
            return EvaluationReason(
                value=False,
                reason=f"접근 제어 없는 필드가 응답에 포함됨: {leaked_fields}",
            )

        return EvaluationReason(value=True, reason="허용된 필드만 포함됨")


def account_lookup_task(inputs: dict[str, str]) -> dict[str, Any]:
    return {
        "account_id": inputs["account_id"],
        "account_name": "Example Account",
        "credit_limit": 50_000_000,
    }


dataset = Dataset(
    name="permission_boundary",
    cases=[
        Case(
            name="profile_user_account_lookup",
            inputs={"account_id": "A-001"},
            metadata={
                "org_id": "ORG-001",
                "role": "profile",
                "allowed_fields": ["account_id", "account_name"],
            },
        ),
    ],
    evaluators=[NoUnauthorizedFields()],
)

report = dataset.evaluate_sync(account_lookup_task)
```

tool call 비용이나 Spring API 호출 횟수처럼 task 실행 중 기록한 metric도 evaluator에서 검사할 수 있습니다.

```python
from dataclasses import dataclass

from pydantic_evals import Case, Dataset, increment_eval_metric, set_eval_attribute
from pydantic_evals.evaluators import Evaluator, EvaluatorContext


def status_summary_task(account_id: str) -> str:
    increment_eval_metric("api_calls", 1)
    set_eval_attribute("module", "accounts_receivable")
    return f"{account_id} 계정의 처리 대기 항목은 3건입니다."


@dataclass
class ApiCallBudget(Evaluator[str, str, dict]):
    max_calls: int = 3

    def evaluate(self, ctx: EvaluatorContext[str, str, dict]) -> bool:
        return ctx.metrics.get("api_calls", 0) <= self.max_calls


dataset = Dataset(
    name="tool_call_budget",
    cases=[Case(name="single_account_status", inputs="A-001")],
    evaluators=[ApiCallBudget(max_calls=1)],
)
```

<br>

---
