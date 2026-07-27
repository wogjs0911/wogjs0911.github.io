---
key: /2026/07/27/LangChain-GraphRAG-Pipeline-and-Graph-Editing-Guide.html
title: LangChain GraphRAG 파이프라인 구축 및 지식 그래프 관리
tags: LangChain Neo4j GraphRAG Pydantic-AI Python Cypher KnowledgeGraph Groq OpenAI
---

# LangChain GraphRAG 파이프라인 구축 및 지식 그래프 관리

## 목차
1. [LangChain 기반 GraphRAG 전체 엔드투엔드 파이프라인](#1-langchain-기반-graphrag-전체-엔드투엔드-파이프라인)
2. [LangChain Neo4j 연동 및 파라미터 쿼리 실행](#2-langchain-neo4j-연동-및-파라미터-쿼리-실행)
3. [Pydantic & Graph Pruning 기반 자동 지식 그래프 구축](#3-pydantic--graph-pruning-기반-자동-지식-그래프-구축)
4. [GraphCypherQAChain을 통한 자연어 질의 응답 파이프라인](#4-graphcypherqachain을-통한-자연어-질의-응답-파이프라인)
5. [AI 추출 오류 교정: Cypher 데이터 수정 & 삭제 실습 Guide](#5-ai-추출-오류-교정-cypher-데이터-수정--삭제-실습-guide)
6. [정리](#6-정리)

---

## 1. LangChain 기반 GraphRAG 전체 엔드투엔드 파이프라인

LangChain과 Neo4j를 결합하면 비정형 텍스트 문서로부터 자동으로 엔티티 및 연관 관계를 추출하여 **지식 그래프(Knowledge Graph)**를 구축하고, 이를 기반으로 환각 없는 자연어 질의 응답 시스템을 구현할 수 있습니다.

### 단계별 6단계 워크플로우

```text
Document (원문 문서)
   │
   ▼
Data Loader (데이터 로더) ──► 텍스트 문서 파싱
   │
   ▼
Text Splitter (텍스트 스플리터) ──► 의미 단위 문장/단락 분할
   │
   ▼
Entity & Relation Extractor ──► LLM Structured Output (Pydantic 규격화)
   │
   ▼
Graph Pruning & Resolver ──► 존재하지 않는 에지 거르기 (Graph Pruning) 및 노드 통합
   │
   ▼
KG Writer (지식 그래프 쓰기) ──► Neo4j Database 저장 (UNWIND + MERGE 배치 처리)
```

---

## 2. LangChain Neo4j 연동 및 파라미터 쿼리 실행

`langchain_neo4j` 패키지의 `Neo4jGraph` 클래스를 이용하면 파이썬 코드에서 데이터베이스 커넥션을 수립하고 Cypher 질의를 날릴 수 있습니다. 이때 하드코딩 방식과 **파라미터 바인딩 매핑 방식**의 차이를 이해하는 것이 중요합니다.

```python
import os
from dotenv import load_dotenv
from langchain_neo4j import Neo4jGraph

load_dotenv()

URI = os.getenv("NEO4J_URI")
USERNAME = os.getenv("NEO4J_USERNAME")
PASSWORD = os.getenv("NEO4J_PASSWORD")
DATABASE = os.getenv("NEO4J_DATABASE", "neo4j")

# 1. Neo4jGraph 커넥션 생성
graph = Neo4jGraph(
    url=URI,
    username=USERNAME,
    password=PASSWORD,
    database=DATABASE
)

# 2. 하드코딩 형태의 Cypher 실행 (단순 실습용)
graph.query(
    """
    CREATE
    (kim:Person {이름: "김민수", 나이: 34}),
    (refactor:Project {이름: "결제 시스템 리팩터링", 상태: "진행중"}),
    (improve:Project {이름: "장애율 개선 프로젝트", 상태: "진행중"}),
    (security:Team {이름: "보안팀", 역할: "공동 진행팀"}),
    (platform:Team {이름: "플랫폼팀", 역할: "공동 진행팀"})
    RETURN kim, refactor, improve, security, platform;
    """
)

# 3. 노드 간 관계 연결 Cypher 실행
graph.query(
    """
    MATCH 
        (kim:Person {이름: "김민수"}),
        (refactor:Project {이름: "결제 시스템 리팩터링"}),
        (improve:Project {이름: "장애율 개선 프로젝트"}),
        (security:Team {이름: "보안팀"}),
        (platform:Team {이름: "플랫폼팀"})

    CREATE
        (kim)-[r:RESPONSIBLE_FOR]->(refactor),
        (refactor)-[atr:AIMS_TO_REDUCE]->(improve),
        (security)-[co1:COLLABORATES_ON]->(improve),
        (platform)-[co2:COLLABORATES_ON]->(improve)

    RETURN kim, refactor, improve, security, platform, r, atr, co1, co2;
    """
)

# 4. 파라미터 매핑 형태의 Cypher 실행 (실무 권장: Cypher Injection 예방 및 캐싱 최적화)
graph.query(
    """
    CREATE
      (kim:Person {이름: $person_name, 나이: $person_age}),
      (refactor:Project {이름: $refactor_name, 상태: $project_status})
    RETURN kim, refactor;
    """,
    params={
        "person_name": "김민수",
        "person_age": 34,
        "refactor_name": "결제 시스템 리팩터링",
        "project_status": "진행중"
    }
)
```

---

## 3. Pydantic & Graph Pruning 기반 자동 지식 그래프 구축

LLM의 **Structured Output (구조화된 출력)** 기능을 이용하여 비정형 한국어 문장에서 노드와 관계를 Pydantic 스키마 기반으로 추출하고, **Graph Pruning(그래프 정제)** 파이프라인을 거쳐 Neo4j에 저장하는 전체 소스 코드입니다.

### Graph Pruning(그래프 가지치기)이 필요한 이유
LLM이 관계(Relationship)를 추출하는 과정에서 노드 목록에는 없지만 환각이나 실수로 존재하지 않는 `source` 또는 `target` ID를 지어내는 경우가 있습니다. 파이썬 `validate_kg()` 함수를 두어 **실제 추출된 노드 목록에 출발지와 목적지가 모두 존재하는 유효한 에지(Edge)만 걸러내는 정제 단계**를 거칩니다.

```python
import os
import json
from typing import Literal

from dotenv import load_dotenv
from pydantic import BaseModel, Field

from langchain_groq import ChatGroq
from langchain_neo4j import Neo4jGraph


load_dotenv()

NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")
NEO4J_DATABASE = os.getenv("NEO4J_DATABASE", "neo4j")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")


# 1. Pydantic 스키마 정의
class KGNode(BaseModel):
    id: str = Field(description="노드 이름. 예: 김민수, 결제 시스템 리팩터링")
    type: Literal["Person", "Project", "Team", "Metric", "System", "Unknown"]


class KGRelationship(BaseModel):
    source: str = Field(description="출발 노드 id")
    target: str = Field(description="도착 노드 id")
    kind: Literal[
        "RESPONSIBLE_FOR",
        "AIMS_TO_REDUCE",
        "COLLABORATED_ON",
        "RELATED_TO",
    ]


class KGGraph(BaseModel):
    nodes: list[KGNode]
    relationships: list[KGRelationship]


# 2. Graph Pruning 후처리 함수 정의
def validate_kg(kg: KGGraph) -> KGGraph:
    """
    Graph Pruning:
    LLM이 추출한 관계 중에서 source와 target이 실제 nodes 목록에
    모두 존재하는 관계만 선별합니다.
    """
    node_ids = {node.id for node in kg.nodes}
    valid_relationships = []

    for rel in kg.relationships:
        source_exists = rel.source in node_ids
        target_exists = rel.target in node_ids

        if source_exists and target_exists:
            valid_relationships.append(rel)

    return KGGraph(
        nodes=kg.nodes,
        relationships=valid_relationships,
    )


# 3. Neo4j & LLM 인스턴스 바인딩
graph = Neo4jGraph(
    url=NEO4J_URI,
    username=NEO4J_USERNAME,
    password=NEO4J_PASSWORD,
    database=NEO4J_DATABASE
)

llm = ChatGroq(
    model=GROQ_MODEL,
    temperature=0,
)

structured_llm = llm.with_structured_output(KGGraph)

text = """
김민수는 결제 시스템 리팩터링을 담당했다.
결제 시스템 리팩터링은 장애율을 낮추기 위한 프로젝트였다.
결제 시스템 리팩터링은 보안팀과 플랫폼팀이 공동으로 진행했다.
"""

prompt = f"""
다음 한국어 문장에서 지식 그래프를 추출하세요.

규칙:
- 문장에 명시된 정보만 사용하세요.
- 노드는 중요한 사람, 프로젝트, 팀, 지표, 시스템을 추출하세요.
- 같은 의미의 노드는 하나로 합치세요.
- relationship의 source와 target은 반드시 nodes의 id 중 하나여야 합니다.
- 관계 방향은 반드시 아래 규칙을 따르세요.

관계 타입 방향 규칙:
- RESPONSIBLE_FOR: Person -> Project/System (예: 김민수 -> 결제 시스템 리팩터링)
- AIMS_TO_REDUCE: Project -> Metric (예: 결제 시스템 리팩터링 -> 장애율)
- COLLABORATED_ON: Team -> Project (예: 보안팀 -> 결제 시스템 리팩터링)
- RELATED_TO: 문장의 주체 -> 대상

문장:
{text}
"""

# LLM 추출 및 Graph Pruning 정제
raw_kg = structured_llm.invoke(prompt)
clean_kg = validate_kg(raw_kg)

# 4. Neo4j 유니크 제약조건 생성 및 대량 배치(UNWIND + MERGE) 저장
graph.query("""
CREATE CONSTRAINT entity_id_unique IF NOT EXISTS
FOR (e:Entity)
REQUIRE e.id IS UNIQUE
""")

nodes = [node.model_dump() for node in clean_kg.nodes]
relationships = [rel.model_dump() for rel in clean_kg.relationships]

# 노드 저장 (UNWIND)
graph.query(
    """
    UNWIND $nodes AS node
    MERGE (e:Entity {id: node.id})
    SET e.name = node.id,
        e.type = node.type
    """,
    params={"nodes": nodes},
)

# 동적 서브 라벨 동기화 (Person, Project, Team 등 추가 라벨 부여)
for node_type in ["Person", "Project", "Team", "Metric", "System", "Unknown"]:
    graph.query(
        f"""
        MATCH (e:Entity {{type: $node_type}})
        SET e:{node_type}
        """,
        params={"node_type": node_type},
    )

# 관계 저장 (UNWIND + MERGE)
for kind in ["RESPONSIBLE_FOR", "AIMS_TO_REDUCE", "COLLABORATED_ON", "RELATED_TO"]:
    graph.query(
        f"""
        UNWIND $relationships AS rel
        WITH rel
        WHERE rel.kind = $kind
        MATCH (source:Entity {{id: rel.source}})
        MATCH (target:Entity {{id: rel.target}})
        MERGE (source)-[r:{kind}]->(target)
        """,
        params={"relationships": relationships, "kind": kind},
    )

graph.refresh_schema()
print("그래프 구축 완료!")
```

### Pydantic AI 기반 지식 그래프 추출 풀 코드 리팩토링

LangChain의 `ChatGroq` ➡️ `with_structured_output` ➡️ `invoke` 4단계 구조 대신, 최신 **Pydantic AI**를 사용하면 `Agent('groq:...', result_type=KGGraph)` 단 한 줄 선언만으로 타입 안전성이 완벽하게 보장되는 경량화된 지식 그래프 추출 파이프라인을 구축할 수 있습니다.

```python
import os
import json
from typing import Literal

from dotenv import load_dotenv
from pydantic import BaseModel, Field
from pydantic_ai import Agent                # 👈 최신 Pydantic AI
from neo4j import GraphDatabase              # 👈 공식 Neo4j 드라이버

load_dotenv()

NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")
NEO4J_DATABASE = os.getenv("NEO4J_DATABASE", "neo4j")

# 1. Pydantic 스키마 정의
class KGNode(BaseModel):
    id: str = Field(description="노드 이름. 예: 김민수, 결제 시스템 리팩터링")
    type: Literal["Person", "Project", "Team", "Metric", "System", "Unknown"]

class KGRelationship(BaseModel):
    source: str = Field(description="출발 노드 id")
    target: str = Field(description="도착 노드 id")
    kind: Literal["RESPONSIBLE_FOR", "AIMS_TO_REDUCE", "COLLABORATED_ON", "RELATED_TO"]

class KGGraph(BaseModel):
    nodes: list[KGNode]
    relationships: list[KGRelationship]

# 2. Graph Pruning 후처리 함수
def validate_kg(kg: KGGraph) -> KGGraph:
    node_ids = {node.id for node in kg.nodes}
    valid_relationships = [r for r in kg.relationships if r.source in node_ids and r.target in node_ids]
    return KGGraph(nodes=kg.nodes, relationships=valid_relationships)

# 3. Pydantic AI Agent 선언 (LLM + 프롬프트 + 출력 스키마 캡슐화)
kg_agent = Agent(
    'groq:llama-3.3-70b-versatile',
    result_type=KGGraph,  # 👈 반환받을 Pydantic 구조체 타입을 직접 바인딩!
    system_prompt="""
    당신은 한국어 문장에서 노드와 관계를 파싱하는 지식 그래프 추출 AI입니다.
    규칙:
    - 노드는 사람, 프로젝트, 팀, 지표, 시스템을 추출하세요.
    - 관계 타입 방향:
      - RESPONSIBLE_FOR: Person -> Project
      - AIMS_TO_REDUCE: Project -> Metric
      - COLLABORATED_ON: Team -> Project
      - RELATED_TO: 주체 -> 대상
    """
)

# 4. 실행 (단 한 줄로 타입 안정성이 보장된 결과 수신!)
text = """
김민수는 결제 시스템 리팩터링을 담당했다.
결제 시스템 리팩터링은 장애율을 낮추기 위한 프로젝트였다.
결제 시스템 리팩터링은 보안팀과 플랫폼팀이 공동으로 진행했다.
"""

result = kg_agent.run_sync(f"다음 문장에서 지식 그래프를 추출하세요:\n{text}")
clean_kg: KGGraph = validate_kg(result.data)  # 👈 result.data는 이미 정적 타입 보장된 KGGraph 객체!

print("Pydantic AI 추출 결과:")
print(json.dumps(clean_kg.model_dump(), ensure_ascii=False, indent=2))

# 5. Neo4j DB 저장 (공식 드라이버로 안전하고 깔끔하게 대량 저장)
driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USERNAME, NEO4J_PASSWORD))

nodes = [node.model_dump() for node in clean_kg.nodes]
relationships = [rel.model_dump() for rel in clean_kg.relationships]

with driver.session(database=NEO4J_DATABASE) as session:
    # 유니크 제약조건
    session.run("CREATE CONSTRAINT entity_id_unique IF NOT EXISTS FOR (e:Entity) REQUIRE e.id IS UNIQUE")
    
    # 노드 저장 (UNWIND)
    session.run(
        """
        UNWIND $nodes AS node
        MERGE (e:Entity {id: node.id})
        SET e.name = node.id, e.type = node.type
        """,
        nodes=nodes
    )
    
    # 서브 라벨 동기화
    for node_type in ["Person", "Project", "Team", "Metric", "System", "Unknown"]:
        session.run(f"MATCH (e:Entity {{type: $node_type}}) SET e:{node_type}", node_type=node_type)
        
    # 관계 저장 (UNWIND)
    for kind in ["RESPONSIBLE_FOR", "AIMS_TO_REDUCE", "COLLABORATED_ON", "RELATED_TO"]:
        session.run(
            """
            UNWIND $relationships AS rel
            WITH rel WHERE rel.kind = $kind
            MATCH (source:Entity {id: rel.source})
            MATCH (target:Entity {id: rel.target})
            MERGE (source)-[r:RESPONSIBLE_FOR|AIMS_TO_REDUCE|COLLABORATED_ON|RELATED_TO]->(target)
            """,
            relationships=relationships
        )

driver.close()
print("Pydantic AI 그래프 DB 구축 완료!")
```

### 💡 LangChain vs Pydantic AI 지식 그래프 추출 비교 대조표

| 구분 | LangChain 방식 | Pydantic AI 방식 |
|---|---|---|
| **LLM 선언 & 스키마 바인딩** | `ChatGroq(...)` ➡️ `.with_structured_output(KGGraph)` | `Agent('groq:...', result_type=KGGraph)` 한 줄 캡슐화 |
| **프롬프트 관리** | `prompt = f"..."` 수동 문자열 결합 | `system_prompt`로 에이전트 내부 깔끔하게 관리 |
| **결과 수신** | `structured_llm.invoke(prompt)` | `kg_agent.run_sync(text)` ➡️ `result.data`가 타입 안전 객체 |
| **의존성 경량성** | LangChain 체인 에코시스템 전체 수용 (무거움) | Pydantic 중심의 경량화 에이전트 + 공식 Neo4j 드라이버 사용 |

---

## 4. GraphCypherQAChain을 통한 자연어 질의 응답 파이프라인

지식 그래프가 구축되면 `GraphCypherQAChain`을 활용하여 자연어 질문을 실시간 Cypher 쿼리로 전환하고 결과를 조회하여 답변을 구성합니다.

```python
import os
from dotenv import load_dotenv

from langchain_groq import ChatGroq
from langchain_neo4j import Neo4jGraph, GraphCypherQAChain

load_dotenv()

GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

graph = Neo4jGraph(
    url=os.getenv("NEO4J_URI"),
    username=os.getenv("NEO4J_USERNAME"),
    password=os.getenv("NEO4J_PASSWORD"),
    database=os.getenv("NEO4J_DATABASE", "neo4j"),
)

# 최신 DB 스키마 리프레시
graph.refresh_schema()

llm = ChatGroq(
    model=GROQ_MODEL,
    temperature=0,
)

chain = GraphCypherQAChain.from_llm(
    llm=llm,
    graph=graph,
    verbose=True,                  # 실행 프로세스 디버깅 로깅
    validate_cypher=True,          # 생성된 Cypher의 스키마 정합성 사전 검증
    allow_dangerous_requests=True, # DB 쿼리 실행 허용 명시
)

questions = [
    "김민수와 보안팀은 어떤 관계야?",
]

for question in questions:
    print("\n질문:", question)
    result = chain.invoke({"query": question})
    print("답변:", result["result"])
```

### Pydantic AI Agent + Tooling 기반 Graph RAG 리팩토링

Pydantic AI를 이용하면 에이전트가 직접 스키마 툴과 안전한 READ전용 Cypher 실행 툴을 선택해 수행하도록 구성할 수 있습니다.

```python
from neo4j import GraphDatabase
from pydantic_ai import Agent, RunContext

driver = GraphDatabase.driver(os.getenv("NEO4J_URI"), auth=(os.getenv("NEO4J_USERNAME"), os.getenv("NEO4J_PASSWORD")))

qa_agent = Agent(
    'groq:llama-3.3-70b-versatile',
    system_prompt="1. get_schema로 DB 스키마 확인 2. read_cypher로 조회 3. 질문에 답변"
)

@qa_agent.tool
def get_schema(ctx: RunContext) -> str:
    return "Node Labels: Person, Project, Team, Metric\nRelationships: RESPONSIBLE_FOR, AIMS_TO_REDUCE, COLLABORATED_ON"

@qa_agent.tool
def read_cypher(ctx: RunContext, query: str) -> list[dict]:
    if "DELETE" in query.upper() or "CREATE" in query.upper():
        raise ValueError("조회전용 쿼리만 허용됩니다.")
    with driver.session() as session:
        return [record.data() for record in session.run(query)]

response = qa_agent.run_sync("김민수와 보안팀은 어떤 관계야?")
print(response.data)
```

---

## 5. AI 추출 오류 교정: Cypher 데이터 수정 & 삭제 실습 Guide

자동 추출 파이프라인으로 생성된 지식 그래프 데이터에 환각이나 속성 누락, 잘못된 에지가 포함되어 있을 때 Cypher 문법을 통해 수동/자동 교정하는 방법입니다.

### 1) Cypher 수정 문법 (Update & Upsert)

#### 노드 및 관계 속성 수정 (`SET`)
```cypher
-- 노드 속성 변경 및 추가
MATCH (p:Person {id: '김민수'})
SET p.age = 35, p.location = "서울"
RETURN p;

-- 관계(에지)선에 출처(source) 속성 기입
MATCH (kim:Person {id: "김민수"})-[r:RESPONSIBLE_FOR]->(pay:Project {id: "결제 시스템 리팩터링"})
SET r.source = "문서 A"
RETURN kim, r, pay;
```

#### 동적 라벨 추가 (`SET n:NewLabel`)
```cypher
MATCH (n {id: "장애율 개선 프로젝트"})
SET n:Project
RETURN n;
```

#### MERGE 기반 조건부 저장 (Upsert)
```cypher
MERGE (improve:Entity {id: "장애율 개선 프로젝트"})
SET improve.type = "Project",
    improve.이름 = "장애율 개선 프로젝트"
SET improve:Project
RETURN improve;
```

---

### 2) Cypher 삭제 문법 (Delete & Remove)

Cypher에서는 데이터 구조 요소에 따라 **`REMOVE`**와 **`DELETE`**가 명확히 분리되어 동작합니다.

#### 특정 속성 및 라벨 제거 (`REMOVE`)
```cypher
-- 속성 삭제 방법 1: REMOVE 키워드
MATCH (p:Person {id: '김민수'})
REMOVE p.age
RETURN p;

-- 속성 삭제 방법 2: null 대입
MATCH (p:Person {id: '김민수'})
SET p.age = null
RETURN p;

-- 노드 라벨 제거
MATCH (p:Person {id: '김민수'})
REMOVE p:Person
RETURN p;
```

#### 노드 및 연결 관계 삭제 (`DELETE` vs `DETACH DELETE`)

```cypher
-- 1. 일반 DELETE: 관계선이 얽혀있는 경우 무결성 에러 발생
MATCH (p:Person {id: '김민수'})
DELETE p;

-- 2. DETACH DELETE: 연결된 모든 관계선(Edge)을 먼저 끊어낸 후 노드 안전 삭제
MATCH (m:Metric {id: "장애율"})
DETACH DELETE m;

-- 3. 전체 그래프 완전 초기화
MATCH (n)
DETACH DELETE n;
```

---

### 3) 수정 및 삭제 구문 요약 대조표

| 작업 분류 | 핵심 키워드 | 예시 구문 | 비고 |
|:---|:---|:---|:---|
| **속성/라벨 수정** | `SET` | `SET n.age = 30`, `SET n:Project` | 노드의 속성값 갱신 및 신규 라벨 추가 |
| **조건부 저장 (Upsert)** | `MERGE` | `MERGE (n {id: 'A'}) SET n.val = 1` | 노드가 있으면 매치, 없으면 생성 후 값 설정 |
| **속성 삭제** | `REMOVE` / `null` | `REMOVE n.age` 또는 `SET n.age = null` | 노드는 유지하고 특정 컬럼 데이터만 제거 |
| **라벨 삭제** | `REMOVE` | `REMOVE n:Person` | 노드의 타입 분류 라벨만 제거 |
| **안전한 노드 삭제**| `DETACH DELETE` | `DETACH DELETE n` | 연결 에지를 선제 분리한 후 노드 완전 삭제 |

---

## 6. 정리

1. **파이프라인 안정화**: Pydantic 스키마 추출 외에 `validate_kg()`와 같은 파이썬 기반 **Graph Pruning 후처리**를 거치면 존재하지 않는 노드를 지어내는 그래프 환각 문제를 완전히 차단할 수 있습니다.
2. **배치 저장 최적화**: `UNWIND $nodes`와 `MERGE` 패턴을 결합하여 대량 노드/관계를 단일 쿼리로 처리하는 것이 속도 및 멱등성 유지에 필수적입니다.
3. **그래프 데이터 유지보수**: 잘못 구축된 지식 데이터는 `SET`과 `MERGE`로 속성을 보정하고, 얽혀 있는 노드는 `DETACH DELETE`를 통해 데이터베이스 무결성 오류 없이 깔끔하게 교정할 수 있습니다.
