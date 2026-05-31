---
key: /2026/05/31/PydanticAIStudy2.html
title: Pydantic AI - Pydantic AI Study 2
tags: Pydantic-AI LLM Agent Tool-Calling MCP Streaming Structured-Output
---

# Pydantic AI 정리2 (Models, Streaming, MCP)

## 목차
1. [Models와 Providers](#1-models와-providers)
2. [Messages와 Streaming](#2-messages와-streaming)
3. [MCP](#3-mcp)

---

## 1. Models와 Providers

Pydantic AI는 모델 제공자를 바꿔도 agent 코드를 최대한 유지할 수 있게 모델 추상화를 제공합니다.

### 지원 제공자

주요 built-in provider:

- OpenAI
- Anthropic
- Google Gemini / Google Cloud
- xAI
- AWS Bedrock
- Cerebras
- Cohere
- Groq
- Hugging Face
- Mistral
- Ollama
- OpenRouter
- Outlines

OpenAI API와 호환되는 provider는 `OpenAIChatModel`과 custom provider로 사용할 수 있습니다. Azure AI Foundry, DeepSeek, GitHub Models, LiteLLM, Perplexity, Together AI, Vercel AI Gateway 등이 여기에 해당합니다.

### Model, Provider, Profile

- Model: 특정 SDK/API를 감싼 요청 구현입니다. 예: `OpenAIChatModel`, `AnthropicModel`, `GoogleModel`
- Provider: 인증, endpoint, HTTP client 등 연결 방식을 담당합니다.
- Profile: 특정 모델군의 schema/tool 제약을 반영해 요청을 최적화하는 설정입니다.

문자열 모델 이름을 쓰면 Pydantic AI가 적절한 조합을 자동 선택합니다.

```python
agent = Agent("openai:gpt-5.2")
agent = Agent("openrouter:google/gemini-3-pro-preview")
```

endpoint나 인증을 직접 제어해야 하면 model/provider 객체를 직접 만듭니다.

### HTTP client lifecycle

Provider가 HTTP client를 직접 만들었다면 agent/model/provider를 async context manager로 사용해 정리할 수 있습니다.

```python
agent = Agent("openai:gpt-5.2")

async with agent:
    result = await agent.run("안녕하세요")
```

직접 `http_client`를 주입했다면 닫는 책임도 애플리케이션에 있습니다.

```python
import httpx

from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.openai import OpenAIProvider


async def main():
    async with httpx.AsyncClient(timeout=30) as http_client:
        model = OpenAIChatModel(
            "gpt-5.2",
            provider=OpenAIProvider(http_client=http_client),
        )
        agent = Agent(model)

        result = await agent.run("안녕하세요")
        print(result.output)
```

위 예제에서는 `async with httpx.AsyncClient(...) as http_client:`가 정리 책임을 수행합니다.
블록을 빠져나갈 때 `AsyncClient.__aexit__`가 호출되고 내부적으로 client가 닫히므로 `await http_client.aclose()`를 따로 호출하지 않아도 됩니다.

다만 context manager 없이 client를 직접 만들었다면 애플리케이션 종료 시점에 명시적으로 닫아야 합니다.

```python
http_client = httpx.AsyncClient(timeout=30)

try:
    model = OpenAIChatModel(
        "gpt-5.2",
        provider=OpenAIProvider(http_client=http_client),
    )
    agent = Agent(model)
    result = await agent.run("안녕하세요")
finally:
    await http_client.aclose()
```

### 동시성 제한

대량 요청, batch eval, 다중 agent 실행에서는 `ConcurrencyLimitedModel`을 사용해 provider rate limit를 보호합니다.
동시에 너무 많은 요청을 보내면 HTTP connection, 메모리, event loop 부하가 커지고 provider의 RPM/TPM 제한에 한꺼번에 걸릴 수 있습니다.
`ConcurrencyLimitedModel`은 총 요청 수를 줄이는 것이 아니라, 한 시점에 실행 중인 model 요청 수를 제한해 나머지 요청을 대기시킵니다.
토큰 수를 직접 제한하는 기능은 아니지만, 동시 요청 수를 낮추면 순간적인 토큰 사용량과 retry 폭주를 완화하는 데 도움이 됩니다.

```python
from pydantic_ai import Agent, ConcurrencyLimitedModel

model = ConcurrencyLimitedModel("openai:gpt-5.2", limiter=5)
agent = Agent(model)
```

여러 모델이 같은 pool을 공유해야 하면 `ConcurrencyLimiter`를 만들어 공유합니다.

### FallbackModel

`FallbackModel`은 첫 모델 API 호출이 실패하면 다음 모델을 순서대로 시도합니다.
여기서 실패는 모델이 틀린 답을 했다는 뜻이 아니라, provider API 요청이 예외나 실패 상태로 끝났다는 뜻입니다.
예를 들어 API key 오류, 모델 접근 접근 제어 없음, 계정/플랜별 모델 미지원, rate limit 또는 quota 초과, provider 장애, timeout, 4xx/5xx 응답 등이 해당합니다.

```python
from pydantic_ai.models.fallback import FallbackModel

model = FallbackModel(
    "openai:gpt-5.2",
    "anthropic:claude-sonnet-4-5",
)
agent = Agent(model)
```

기본적으로 `ModelAPIError` 계열에서 fallback합니다. 응답 내용 기반 fallback도 설정할 수 있습니다. 예를 들어 finish reason이 `length`, `content_filter`, `error`이면 다음 모델로 넘길 수 있습니다.
즉, fallback은 품질이 낮은 답변을 자동으로 감지하는 기능이라기보다 API 호출 실패나 명시적으로 정의한 실패 조건을 복구하는 기능입니다.

주의할 점:

- provider SDK 자체 retry가 fallback을 지연시킬 수 있습니다.
- 구조화 출력 검증 실패나 tool 인자 검증 실패는 fallback이 아니라 같은 모델에 대한 retry로 처리됩니다.
- 모든 모델이 실패하면 `FallbackExceptionGroup`이 발생합니다.
- 각 모델의 API key, base URL, settings는 개별 model에 설정해야 합니다.

### 모델 선택 기준

- 구조화 출력과 tool calling 안정성이 중요하면 provider별 schema/tool 지원 수준을 먼저 봅니다.
- 격리된 네트워크, 데이터 거버넌스, 비용 통제가 중요하면 gateway 또는 OpenAI-compatible endpoint를 provider로 감쌉니다.
- 실시간 UX는 streaming latency와 cancellation 지원 여부를 확인합니다.
- 대량 eval/배치 작업은 concurrency limit와 비용 추적을 먼저 설정합니다.

<br>

---

## 2. Messages와 Streaming

Pydantic AI는 agent 실행 중 오간 메시지를 `ModelRequest`, `ModelResponse` 형태로 보관합니다. 이 메시지는 대화 이어가기, 디버깅, eval, 운영 로그에 사용할 수 있습니다.

### 메시지 접근

```python
result = agent.run_sync("농담 하나 해줘")

all_messages = result.all_messages()
new_messages = result.new_messages()
```

- `all_messages()`: 이전 history를 포함한 전체 메시지
- `new_messages()`: 현재 실행에서 새로 생성된 메시지만
- JSON 저장/복원은 `ModelMessagesTypeAdapter`를 사용합니다.

### 대화 이어가기

```python
result1 = agent.run_sync("아인슈타인에 대해 알려줘")
result2 = agent.run_sync(
    "그의 가장 유명한 공식은?",
    message_history=result1.new_messages(),
)
```

`message_history`를 넘기면 모델이 이전 대화를 참조할 수 있습니다. UI나 DB 저장 과정에서 system prompt가 빠질 수 있다면 `ReinjectSystemPrompt` capability를 검토합니다.

위 예시는 동작 원리를 보여주는 최소 코드입니다. 실제 서비스에서는 개발자가 매 프롬프트마다 history 누적 코드를 직접 반복해서 쓰지 않습니다.
보통은 Conversation Service나 chat endpoint가 session ID로 history를 조회하고, 사용자 입력을 실행한 뒤, `result.new_messages()`를 다시 저장합니다.
사용자 입력은 자연어로 아무렇게 들어와도 되고, 같은 대화라면 같은 `session_id`의 history를 자동으로 붙여 주는 구조입니다.

```python
def chat(session_id: str, user_text: str):
    history = conversation_store.load(session_id)

    result = agent.run_sync(
        user_text,
        message_history=history,
        conversation_id=session_id,
    )

    conversation_store.append(session_id, result.new_messages())

    return result.output
```

즉, Pydantic AI가 DB나 Redis에 history를 자동 저장하는 것은 아닙니다.
대신 애플리케이션의 Conversation Service가 `load -> run -> append` 패턴을 공통으로 감싸고, 각 요청은 사용자의 현재 입력만 전달합니다.

### conversation_id

각 request/response에는 다음 ID가 붙습니다.

- `run_id`: agent 실행 1회마다 고유
- `conversation_id`: 같은 message history를 이어받는 실행들이 공유

애플리케이션의 chat thread ID를 쓰고 싶으면 `conversation_id="..."`를 전달합니다. 기존 history에서 새 분기를 만들려면 `conversation_id="new"`를 사용합니다.

`run_id`는 보통 직접 세팅하지 않고 Pydantic AI가 각 실행마다 자동으로 붙입니다. 로그, trace, eval에서 "이번 agent 실행 1회"를 구분하는 용도입니다.
`conversation_id`도 생략할 수 있습니다. 생략하면 기존 `message_history`에 있는 최신 `conversation_id`를 이어받고, history가 없으면 새 ID를 생성합니다.

```python
result1 = agent.run_sync("첫 질문")
result2 = agent.run_sync(
    "이어지는 질문",
    message_history=result1.all_messages(),
)

assert result1.conversation_id == result2.conversation_id
```

다만 `conversation_id`만으로 대화 내용이 자동 복원되는 것은 아닙니다. 실제 대화 맥락은 여전히 `message_history`를 넘겨야 이어집니다.
`conversation_id`는 같은 대화에 속한 여러 실행을 연결하는 상관관계 ID에 가깝고, DB/Redis에서 history를 조회하고 저장하는 책임은 애플리케이션에 있습니다.

Redis를 사용한다면 보통 Pydantic AI용 history와 UI 표시용 메시지를 따로 저장합니다.
Redis의 key-value 모델과 자료구조가 낯설다면 [Redis 학습 노트](../redis/README.md)를 먼저 보면 됩니다.

- Pydantic AI history: `ModelRequest`, `ModelResponse` 구조를 JSON으로 저장하고 다음 실행의 `message_history`로 복원
- UI 메시지: 화면에 보여줄 `{role, content}` 형태를 Redis List에 순서대로 저장

Redis List 명령은 다음처럼 동작합니다.

```text
RPUSH key value [value ...]
```

`RPUSH`는 list의 오른쪽, 즉 끝에 값을 추가합니다. 채팅 메시지를 시간순으로 append할 때 사용합니다.

```text
LRANGE key start stop
```

`LRANGE`는 list의 일부 구간을 읽습니다. index는 0부터 시작하고, `-1`은 마지막 요소를 뜻합니다.
따라서 `LRANGE chat:abc:ui-messages 0 -1`은 해당 채팅방의 UI 메시지를 처음부터 끝까지 읽는 명령입니다.

Python의 `redis.asyncio` 클라이언트에서는 Redis 명령 이름을 소문자 메서드로 호출합니다.

```python
import json
import redis.asyncio as redis

from pydantic_core import to_jsonable_python
from pydantic_ai import ModelMessage, ModelMessagesTypeAdapter

redis_client = redis.Redis(host="localhost", port=6379, decode_responses=True)


def history_key(session_id: str) -> str:
    return f"chat:{session_id}:pydantic-history"


def ui_key(session_id: str) -> str:
    return f"chat:{session_id}:ui-messages"


async def load_history(session_id: str) -> list[ModelMessage]:
    raw = await redis_client.get(history_key(session_id))
    if raw is None:
        return []
    return ModelMessagesTypeAdapter.validate_python(json.loads(raw))


async def save_history(session_id: str, history: list[ModelMessage]) -> None:
    data = to_jsonable_python(history)
    await redis_client.set(history_key(session_id), json.dumps(data, ensure_ascii=False))


async def append_ui_message(session_id: str, role: str, content: str) -> None:
    message = {"role": role, "content": content}
    await redis_client.rpush(ui_key(session_id), json.dumps(message, ensure_ascii=False))


async def load_ui_messages(session_id: str) -> list[dict]:
    rows = await redis_client.lrange(ui_key(session_id), 0, -1)
    return [json.loads(row) for row in rows]
```

채팅 요청에서는 저장된 history를 복원해 `message_history`로 넘기고, 실행 후 새 메시지를 다시 저장합니다.

```python
async def chat(session_id: str, user_text: str) -> str:
    history = await load_history(session_id)

    result = await agent.run(
        user_text,
        message_history=history,
        conversation_id=session_id,
    )

    await save_history(session_id, history + result.new_messages())
    await append_ui_message(session_id, "user", user_text)
    await append_ui_message(session_id, "assistant", result.output)

    return result.output
```

채팅 UI를 다시 열 때는 모델용 history가 아니라 UI용 메시지를 읽어 화면에 렌더링합니다.

```python
messages = await load_ui_messages(session_id)
```

여기서 `history_key()`와 `ui_key()`는 특별한 Pydantic AI 기능이 아니라 Redis key 이름을 만드는 헬퍼입니다.
둘 다 Redis에 저장하지만, 저장하는 데이터의 모양과 사용 시점이 다릅니다.

```text
chat:abc:pydantic-history
-> Pydantic AI에 다시 넘길 ModelRequest/ModelResponse history
-> 다음 agent.run(..., message_history=history)에 사용

chat:abc:ui-messages
-> 채팅창에 보여줄 {role, content} 메시지 목록
-> 화면 렌더링에 사용
```

즉 Pydantic AI용 history는 백업용이 아니라 다음 실행의 맥락을 복원하기 위한 런타임 데이터입니다.
UI 메시지는 사람이 보기 좋은 형태이고, Pydantic AI history는 모델 실행에 필요한 실행 구조입니다.
tool을 사용하는 agent에서는 Pydantic AI history 안에 `ToolCallPart`, `ToolReturnPart` 같은 정보가 들어갈 수 있으므로 `{role, content}`만 저장한 UI 메시지를 그대로 `message_history`로 넘기면 정보가 부족할 수 있습니다.

전체 흐름을 더 명확히 쓰면 다음과 같습니다.

```text
1. 채팅창 열기
   -> LRANGE chat:{session_id}:ui-messages 0 -1
   -> UI 메시지를 화면에 렌더링

2. 사용자가 새 프롬프트 입력
   -> RPUSH chat:{session_id}:ui-messages {"role": "user", "content": "..."}
   -> GET chat:{session_id}:pydantic-history
   -> ModelMessagesTypeAdapter로 Pydantic AI history 복원

3. agent 실행
   -> agent.run(user_text, message_history=history, conversation_id=session_id)

4. agent 응답 저장
   -> 기존 history + result.new_messages()를 chat:{session_id}:pydantic-history에 SET
   -> RPUSH chat:{session_id}:ui-messages {"role": "assistant", "content": result.output}

5. UI 갱신
   -> assistant 응답을 현재 채팅창에 표시
```

### history processor

긴 대화의 비용을 줄이거나 민감 정보를 제거하려면 `ProcessHistory` capability를 사용합니다.

```python
from pydantic_ai.capabilities import ProcessHistory

def keep_recent(messages):
    return messages[-5:]

agent = Agent(
    "openai:gpt-5.2",
    capabilities=[ProcessHistory(keep_recent)],
)
```

주의: `messages[-5:]`처럼 단순히 최근 N개만 자르면 tool call과 tool return 쌍이 깨져 provider 오류가 날 수 있습니다.

예를 들어 tool을 사용하는 agent의 message history는 다음처럼 이어질 수 있습니다.

```text
ModelRequest(UserPromptPart)
ModelResponse(ToolCallPart tool_call_id="abc")
ModelRequest(ToolReturnPart tool_call_id="abc")
ModelResponse(TextPart)
```

provider는 `ToolCallPart`와 그에 대응하는 `ToolReturnPart`가 같은 `tool_call_id`로 짝을 이루기를 기대합니다.
그런데 slicing 결과가 tool return만 남거나 tool call만 남으면 다음 실행에서 "없는 tool call에 대한 return" 또는 "결과가 없는 tool call"처럼 해석될 수 있습니다.

```text
# 위험한 예: tool return만 남음
ModelRequest(ToolReturnPart tool_call_id="abc")
ModelResponse(TextPart)
```

tool을 쓰는 agent에서는 단순 message 개수 기준보다, tool call/return 쌍이 함께 남도록 자르거나 오래된 구간을 요약 메시지로 압축하는 방식이 안전합니다.

### 스트리밍 방식

| 방식                             | 용도                                       |
| -------------------------------- | ------------------------------------------ |
| `run_stream()` + `stream_text()` | 최종 텍스트를 점진적으로 표시              |
| `stream_text(delta=True)`        | 누적 텍스트 대신 delta만 표시              |
| `stream_output()`                | 구조화 출력 partial object 수신            |
| `stream_response()`              | partial `ModelResponse` 직접 처리          |
| `run_stream_events()`            | tool call/result를 포함한 전체 이벤트 수신 |
| `iter()`                         | graph node 단위로 세밀한 제어              |

기본 UI 채팅은 `run_stream()`으로 충분합니다. tool 실행 상태까지 사용자에게 보여줘야 하면 `run_stream_events()`가 낫습니다.

### 스트리밍 주의점

`run_stream()`은 `output_type`에 맞는 첫 출력이 나오면 최종 출력으로 간주할 수 있습니다. 모델이 텍스트와 tool call을 섞어 내는 경우, 기본 설정에서는 뒤따르는 tool call이 실행되지 않을 수 있습니다.
이는 `run_stream()`의 목적이 agent graph 전체 실행 과정을 보여주는 것이 아니라, 최종 출력으로 판단된 값을 빠르게 스트리밍하는 것이기 때문입니다.

예를 들어 모델이 먼저 텍스트를 조금 내보내고, 이어서 조회 tool을 호출하려는 응답을 만든다고 가정합니다.

```text
모델 응답 흐름:
1. TextPart("재고를 확인해 보겠습니다.")
2. ToolCallPart(tool_name="get_inventory", args={"item_code": "A-100"})
3. ToolReturnPart(...)
4. TextPart("A-100의 현재 재고는 42개입니다.")
```

사용자가 받게 될 답변을 기준으로 비교하면 다음과 같습니다.

| 방식                  | 사용자에게 보이는 예시                                                                | 특징                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `run_stream()`        | `재고를 확인해 보겠습니다.`                                                           | 첫 텍스트를 최종 출력처럼 보고 멈출 수 있어 뒤의 tool call이 실행되지 않을 수 있습니다. |
| `run_stream_events()` | `재고를 확인해 보겠습니다.`<br>`재고 조회 중...`<br>`A-100의 현재 재고는 42개입니다.` | tool call/result 이벤트까지 받아 앱이 진행 상태와 최종 답변을 구성할 수 있습니다.       |

`run_stream()`으로 텍스트만 스트리밍하는 코드는 단순합니다.

```python
async with agent.run_stream("A-100 재고 확인해줘") as result:
    async for text in result.stream_text(delta=True):
        print(text, end="")
```

사용자 출력 예시:

```text
재고를 확인해 보겠습니다.
```

이 경우 뒤따르는 `get_inventory` tool call은 실행되지 않을 수 있으므로, 실제 재고 결과가 나오지 않습니다.

`run_stream_events()`는 agent 이벤트를 그대로 받습니다. 이 이벤트를 애플리케이션이 사용자용 메시지로 바꿔 보여줍니다.

```text
run_stream_events() agent 이벤트 예시:
PartStartEvent(TextPart("재고를 확인해 보겠습니다."))
ToolCallPart(tool_name="get_inventory", args={"item_code": "A-100"})
ToolReturnPart(tool_name="get_inventory", content={"quantity": 42})
PartStartEvent(TextPart("A-100의 현재 재고는 42개입니다."))
```

사용자 출력 예시:

```text
재고를 확인해 보겠습니다.
재고 조회 중...
A-100의 현재 재고는 42개입니다.
```

정리하면 단순 채팅, 요약, 번역, 설명처럼 tool 실행이 중요하지 않은 경우에는 `run_stream()`으로 충분합니다.
외부 데이터 조회/수정, DB 검색, 확인 플로우처럼 tool 실행이 필수인 업무 UI에서는 `run_stream_events()` 또는 `iter()`를 기본으로 검토합니다.

### 취소

사용자가 "생성 중지"를 누르는 UI에서는 `cancel()`을 사용합니다.

```python
async with agent.run_stream("긴 보고서를 작성해줘") as result:
    async for chunk in result.stream_text(delta=True):
        if should_stop:
            await result.cancel()
            break
```

취소된 response는 message history에 `state="interrupted"`로 남습니다. 중간에 끊긴 tool call arguments가 남을 수 있으므로 interrupted history를 재사용하기 전에 애플리케이션 정책으로 정리해야 합니다.

### 업무 시스템 적용 규칙

- 운영 운영가 필요한 요청은 `all_messages()` 또는 정제된 message log를 저장합니다.
- 민감 정보이 들어간 history는 저장 전 redaction processor를 둡니다.
- 긴 업무 대화는 슬라이딩 윈도우나 요약 processor를 적용하되 tool call/return 쌍을 보존합니다.
- streaming token usage는 provider별로 partial일 수 있으므로 비용 정산 근거로 단독 사용하지 않습니다.

<br>

---

## 3. MCP

Pydantic AI는 Model Context Protocol(MCP)을 client와 server 양쪽에서 지원합니다. MCP는 AI 애플리케이션이 외부 도구와 서비스를 표준 프로토콜로 연결하기 위한 방식입니다.

### 연결 방식

Pydantic AI agent가 MCP 도구를 사용하는 방법은 크게 세 가지입니다.

1. Pydantic AI의 MCP client로 local/remote MCP server에 직접 연결
2. `FastMCPToolset`으로 FastMCP client를 통해 연결
3. provider가 지원하는 native MCP tool 사용

### MCP client

설치:

```bash
uv add "pydantic-ai-slim[mcp]"
```

지원 transport:

- `MCPServerStreamableHTTP`: Streamable HTTP
- `MCPServerSSE`: HTTP SSE, deprecated라 가능하면 Streamable HTTP 권장
- `MCPServerStdio`: subprocess stdio

예시:

```python
from pydantic_ai import Agent
from pydantic_ai.mcp import MCPServerStreamableHTTP

server = MCPServerStreamableHTTP("http://localhost:8000/mcp")
agent = Agent("openai:gpt-5.2", toolsets=[server])

async with agent:
    result = await agent.run("7 더하기 5는?")
```

MCP server instance는 toolset입니다. `async with agent` 또는 `async with server`로 connection/subprocess lifecycle을 명확히 관리하는 것이 효율적입니다.

### Agent에 MCP를 붙이는 것과 프로젝트를 MCP로 노출하는 것

위 예시의 `MCPServerStreamableHTTP("http://localhost:8000/mcp")`는 이미 떠 있는 MCP server를 이 agent의 toolset으로 연결하는 코드입니다.
즉, agent가 MCP client가 되어 해당 server가 제공하는 tools를 사용할 수 있게 됩니다.

```text
Pydantic AI Agent
  -> MCP client
      -> http://localhost:8000/mcp
          -> tools 사용
```

이 연결은 전역 등록이 아니라 해당 agent의 설정입니다. 다른 agent도 같은 MCP server를 사용해야 하면 그 agent의 `toolsets`에도 같은 server를 넣어야 합니다.

```python
server = MCPServerStreamableHTTP("http://localhost:8000/mcp")

agent_a = Agent("openai:gpt-5.2", toolsets=[server])
agent_b = Agent("openai:gpt-5.2")  # MCP tools 없음
```

반대로 "프로젝트 전체를 MCP로 감싼다"는 말은 보통 업무 애플리케이션 기능을 MCP server tools로 노출한다는 뜻입니다.
예를 들어 backend API나 Python agent service가 다음과 같은 애플리케이션 기능을 MCP tool로 제공합니다.

```text
Business Tool Server
  -> MCP server
      -> tools:
          - search_records
          - get_account
          - create_request
          - confirm_action
          - get_report
```

그 다음 agent는 그 MCP server를 toolset으로 연결해서 사용합니다.

```python
workflow_tools = MCPServerStreamableHTTP("http://tools.example.com/mcp")
agent = Agent("openai:gpt-5.2", toolsets=[workflow_tools])
```

정리하면 `MCPServerStreamableHTTP(...)`는 agent 입장에서 외부 MCP server에 접속하는 client 설정이고, 프로젝트를 MCP로 감싸는 작업은 별도의 MCP server를 만들어 애플리케이션 기능을 tools로 공개하는 작업입니다.
업무 애플리케이션에서는 처음부터 모든 기능을 MCP화하기보다, 조회/검색처럼 안전한 핵심 기능을 먼저 tool로 정의하고 접근 제어, 운영 로그, 실행 정책이 정리된 뒤 쓰기 작업을 MCP server 경계로 확장하는 것이 현실적입니다.

### 설정 파일에서 로드

여러 MCP 서버는 JSON 설정으로 로드할 수 있습니다.

```json
{
  "mcpServers": {
    "python-runner": {
      "command": "uv",
      "args": ["run", "mcp-run-python", "stdio"]
    },
    "calculator": {
      "url": "http://localhost:8000/mcp"
    }
  }
}
```

```python
from pydantic_ai.mcp import load_mcp_servers

servers = load_mcp_servers("mcp_config.json")
agent = Agent("openai:gpt-5.2", toolsets=servers)
```

`${VAR}`와 `${VAR:-default}` 환경 변수 확장을 지원합니다.

즉, 위 JSON 예시는 환경 변수 확장을 쓰지 않는 고정 설정입니다. `"uv"`와 `"http://localhost:8000/mcp"`가 그대로 사용됩니다.
환경마다 command, module, URL, API key를 바꾸고 싶을 때 다음처럼 문자열 안에 환경 변수를 넣을 수 있습니다.

```json
{
  "mcpServers": {
    "python-runner": {
      "command": "${PYTHON_CMD:-uv}",
      "args": ["run", "${MCP_MODULE:-mcp-run-python}", "stdio"],
      "env": {
        "API_KEY": "${MY_API_KEY}"
      }
    },
    "calculator": {
      "url": "${CALCULATOR_MCP_URL:-http://localhost:8000/mcp}"
    }
  }
}
```

- `${VAR}`는 환경 변수 `VAR` 값으로 치환합니다. 값이 없으면 `ValueError`가 발생합니다.
- `${VAR:-default}`는 환경 변수 `VAR`가 있으면 그 값을 쓰고, 없으면 `default`를 사용합니다.

예를 들어 `CALCULATOR_MCP_URL=http://prod-server:8000/mcp`가 설정되어 있으면 `"url"`은 `http://prod-server:8000/mcp`로 해석됩니다.
환경 변수가 없으면 기본값인 `http://localhost:8000/mcp`가 사용됩니다.

### tool prefix

여러 MCP 서버에 같은 이름의 tool이 있으면 `tool_prefix`를 사용합니다.

```python
weather = MCPServerStreamableHTTP("http://localhost:8001/mcp", tool_prefix="weather")
calc = MCPServerStreamableHTTP("http://localhost:8002/mcp", tool_prefix="calc")
```

### server instructions와 metadata

MCP server가 초기화 시 instructions를 제공하면 `include_instructions=True`로 agent instructions에 포함할 수 있습니다.
server instructions는 MCP server가 client/agent에게 제공하는 "이 서버의 도구를 어떻게 써야 하는지"에 대한 사용 안내입니다.

```python
server = MCPServerStreamableHTTP(
    "http://localhost:8000/mcp",
    include_instructions=True,
)
```

예를 들어 workflow MCP server라면 다음처럼 도구 사용 규칙을 instructions로 제공할 수 있습니다.

```text
This MCP server exposes business workflow tools.

Use search_* tools before create_* tools when the user request lacks IDs.
Never call state-changing tools unless the user explicitly asks to proceed.
Amounts use the default currency unless another currency is provided.
Dates use the configured service timezone.
For write operations, summarize the planned change before calling the tool.
Do not use these tools for personal data unrelated to the current organization.
```

한국어로 쓰면 다음과 같은 내용입니다.

```text
이 MCP server는 workflow 도구를 제공합니다.

리소스명, 항목명, 요청 번호가 모호하면 create/update 계열 tool을 바로 호출하지 말고 search/get 계열 tool로 먼저 확인하세요.
생성, 수정, 외부 실행 같은 쓰기 작업은 사용자가 명시적으로 진행을 요청한 경우에만 호출하세요.
금액 단위는 별도 언급이 없으면 기본 통화입니다.
날짜와 시간은 서비스에 설정된 timezone 기준입니다.
tool 결과의 status가 "requires_confirmation"이면 완료로 말하지 말고 확인 대기 상태로 설명하세요.
```

instructions에 넣기 좋은 내용은 도메인, tool 선택 순서, 위험 작업 규칙, 기본 단위, 결과 status 해석법, 금지사항입니다.
반대로 API key, DB password 같은 secret이나 현재 actor/organization처럼 요청마다 바뀌는 값은 넣지 않습니다.
이런 값은 환경 변수, deps, resource, 접근 제어 context로 전달하는 편이 안전합니다.

MCP tool의 `meta`, `annotations`, output schema는 tool definition metadata로 노출되어 필터링과 정책 적용에 사용할 수 있습니다.

### Resources

MCP resource는 자동으로 LLM에 노출되지 않습니다. 애플리케이션이 직접 list/read해서 필요한 방식으로 context에 넣어야 합니다.
resource는 "tool처럼 실행하는 함수"가 아니라, MCP server가 제공하는 읽기 가능한 데이터입니다. 예를 들어 agent가 매번 참고해야 하는 지점 코드, 현재 actor 정보, 업무 매뉴얼 조각을 resource로 노출할 수 있습니다.

server 쪽에서 resource를 정의하는 예시는 다음과 같습니다.

```python
# workflow_resource_server.py
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("Workflow Resource Server")


@mcp.resource("resource://current-context.txt", mime_type="text/plain")
async def current_user() -> str:
    return "actor_id=U1001\nname=Example User\nrole=operator"


@mcp.resource("resource://action-policy.txt", mime_type="text/plain")
async def action_policy() -> str:
    return "Actions over the configured limit require reviewer confirmation."


if __name__ == "__main__":
    mcp.run(transport="stdio")
```

client 쪽에서는 resource 목록을 조회하고, 필요한 resource만 읽어서 agent prompt/context에 직접 넣습니다.

```python
import asyncio

from pydantic_ai import Agent
from pydantic_ai.mcp import MCPServerStdio

server = MCPServerStdio("python", args=["workflow_resource_server.py"])
agent = Agent("openai:gpt-5.2")


async def main():
    async with server:
        resources = await server.list_resources()
        for resource in resources:
            print(resource.name, resource.uri, resource.mime_type)

        current_user = await server.read_resource("resource://current-context.txt")
        action_policy = await server.read_resource("resource://action-policy.txt")

    prompt = f"""
현재 실행 컨텍스트:
{current_user}

실행 정책:
{action_policy}

질문:
이 요청을 바로 실행할 수 있는지 판단해줘.
"""
    result = await agent.run(prompt)
    print(result.output)


asyncio.run(main())
```

간단히 resource API만 보면 다음과 같습니다.

```python
async with server:
    resources = await server.list_resources()
    content = await server.read_resource("resource://example.txt")
```

텍스트 resource는 `str`, 바이너리는 `BinaryContent`로 변환됩니다.

### Sampling

MCP sampling은 MCP server가 client를 통해 LLM 호출을 요청하는 기능입니다. Pydantic AI agent가 MCP client일 때 sampling model을 설정할 수 있습니다.
즉, MCP server가 자체 model provider API key를 갖고 있지 않아도, 연결된 client에게 "이 prompt로 LLM 한 번 호출해줘"라고 요청할 수 있습니다.

server 쪽 tool에서 `ctx.session.create_message(...)`를 호출하면 sampling 요청이 발생합니다.

```python
# workflow_sampling_server.py
from mcp import SamplingMessage
from mcp.server.fastmcp import Context, FastMCP
from mcp.types import TextContent

mcp = FastMCP("Workflow Sampling Server")


@mcp.tool()
async def draft_request_reason(ctx: Context, item_name: str, quantity: int) -> str:
    prompt = f"항목: {item_name}\n수량: {quantity}\n요청 사유를 업무 시스템 문장으로 짧게 작성해줘."

    result = await ctx.session.create_message(
        [SamplingMessage(role="user", content=TextContent(type="text", text=prompt))],
        max_tokens=300,
        system_prompt="너는 업무 요청 문장을 작성하는 assistant다.",
    )

    assert isinstance(result.content, TextContent)
    return result.content.text


if __name__ == "__main__":
    mcp.run(transport="stdio")
```

client 쪽에서는 agent가 사용하는 모델을 MCP sampling에도 쓰도록 설정합니다.

```python
import asyncio

from pydantic_ai import Agent
from pydantic_ai.mcp import MCPServerStdio

server = MCPServerStdio("python", args=["workflow_sampling_server.py"])
agent = Agent("openai:gpt-5.2", toolsets=[server])


async def main():
    agent.set_mcp_sampling_model()
    result = await agent.run("장비 5대 요청 사유 초안을 작성해줘.")
    print(result.output)


asyncio.run(main())
```

핵심 설정만 보면 다음 한 줄입니다.

```python
agent.set_mcp_sampling_model()
```

sampling을 허용하지 않으려면 server 생성 시 `allow_sampling=False`를 둡니다.

```python
server = MCPServerStdio(
    "python",
    args=["workflow_sampling_server.py"],
    allow_sampling=False,
)
```

### Elicitation

Elicitation은 MCP server가 실행 중 사용자에게 구조화 입력을 요청하는 기능입니다. Pydantic AI client에서는 `elicitation_callback`으로 처리합니다.
다르게 말하면, MCP tool 실행 중 server 쪽 커스텀 로직이 필요한 정보를 아직 받지 못했을 때 client/사용자에게 질문을 던지는 통로입니다.
로직 자체는 여전히 MCP server 코드에 있고, elicitation은 그 로직을 계속 진행하기 위한 추가 입력을 받는 방식입니다.

```text
사용자: 요청 하나 만들어줘
Agent -> MCP tool 호출: create_workflow_request()
MCP server: 항목명, 수량, 희망 완료일이 없네?
MCP server -> client: 이 필드들을 입력받아줘
Client/User: 장비, 5개, 2026-06-30
MCP server: 입력값으로 요청 생성 로직 계속 진행
```

정리하면 `MCP tool = 서버에 정의된 애플리케이션 로직 실행`, `Elicitation = 그 로직 실행 중 필요한 사용자 입력을 client에게 요청하는 통로`입니다.
그래서 요청 생성, 상태 변경, 프로필 수정처럼 필수 입력이나 사용자 확인이 필요한 작업에 잘 맞습니다.

예를 들어 `create_workflow_request` tool을 실행하려는데 희망 완료일이나 긴급 여부가 빠져 있으면, server가 client에게 필요한 입력을 요청할 수 있습니다.

server 쪽에서는 Pydantic schema로 필요한 입력 형태를 정의하고 `ctx.elicit(...)`을 호출합니다.

```python
# workflow_elicitation_server.py
from mcp.server.fastmcp import Context, FastMCP
from pydantic import BaseModel, Field

mcp = FastMCP("Workflow Elicitation Server")


class WorkflowRequestDetails(BaseModel):
    item_name: str = Field(description="요청 항목명")
    quantity: int = Field(description="요청 수량", ge=1)
    due_date: str = Field(description="희망 완료일, 예: 2026-06-30")
    urgent: bool = Field(description="긴급 요청 여부")


@mcp.tool()
async def create_workflow_request(ctx: Context) -> str:
    result = await ctx.elicit(
        message="요청 생성에 필요한 정보를 입력해 주세요.",
        schema=WorkflowRequestDetails,
    )

    if result.action == "decline":
        return "요청 생성을 진행하지 않았습니다."
    if result.action == "cancel":
        return "요청 생성이 취소되었습니다."

    details = result.data
    assert details is not None
    return (
        f"요청 초안 생성: {details.item_name} {details.quantity}개, "
        f"희망 완료일 {details.due_date}, 긴급={details.urgent}"
    )


if __name__ == "__main__":
    mcp.run(transport="stdio")
```

client 쪽에서는 `elicitation_callback`에서 사용자의 입력을 받고 `accept`, `decline`, `cancel` 중 하나로 응답합니다.

```python
import asyncio
from typing import Any

from mcp.client.session import ClientSession
from mcp.shared.context import RequestContext
from mcp.types import ElicitRequestParams, ElicitResult
from pydantic_ai import Agent
from pydantic_ai.mcp import MCPServerStdio


async def handle_elicitation(
    context: RequestContext[ClientSession, Any, Any],
    params: ElicitRequestParams,
) -> ElicitResult:
    print(params.message)

    data: dict[str, Any] = {}
    properties = params.requestedSchema["properties"]

    for field_name, field_schema in properties.items():
        description = field_schema.get("description", field_name)
        raw_value = input(f"{description}: ")

        if field_schema.get("type") == "integer":
            data[field_name] = int(raw_value)
        elif field_schema.get("type") == "boolean":
            data[field_name] = raw_value.lower() in {"y", "yes", "true", "1"}
        else:
            data[field_name] = raw_value

    confirm = input("이 정보로 진행할까요? (y/n/c): ").lower()
    if confirm == "y":
        return ElicitResult(action="accept", content=data)
    if confirm == "n":
        return ElicitResult(action="decline")
    return ElicitResult(action="cancel")


server = MCPServerStdio(
    "python",
    args=["workflow_elicitation_server.py"],
    elicitation_callback=handle_elicitation,
)
agent = Agent("openai:gpt-5.2", toolsets=[server])


async def main():
    result = await agent.run("새 요청을 생성해줘.")
    print(result.output)


asyncio.run(main())
```

보안상 server가 민감 정보를 요구하지 않도록 하고, client는 사용자 동의/거절/취소 흐름을 명확히 구현해야 합니다.

### FastMCP

설치:

```bash
uv add "pydantic-ai-slim[fastmcp]"
```

`FastMCPToolset`은 FastMCP server/client/transport, Streamable HTTP URL, SSE URL, Python/Node script, JSON MCP config에서 만들 수 있습니다.

```python
from pydantic_ai.toolsets.fastmcp import FastMCPToolset

toolset = FastMCPToolset("http://localhost:8000/mcp")
agent = Agent("openai:gpt-5.2", toolsets=[toolset])
```

현재 FastMCPToolset은 표준 `MCPServer` client가 지원하는 elicitation/sampling 일부 기능을 지원하지 않을 수 있습니다.

### 업무 시스템 적용 규칙

- 도구 서버는 MCP로 분리하되, 접근 제어/운영 컨텍스트 전달 방식을 명확히 합니다.
- `tool_prefix`로 도메인 충돌을 방지합니다.
- 민감 작업 MCP tool은 agent 쪽 capability 또는 MCP server 쪽 policy 양쪽에서 보호합니다.
- resource는 자동으로 모델에게 넘기지 말고 필요한 범위만 선별합니다.

<br>

---
