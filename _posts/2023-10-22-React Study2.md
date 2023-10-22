---
key: /2023/10/22/React-Study2.html
title: React - React Study2
tags: React Vite useReducer useMemo useCallBack Context Router API Vercel
--- 

# 7. useReducer : 상태 관리 분리


### 1) useReducer 개념

- useState와 같은 역할을 하며, 새로운 State를 생성한다. 또한, State를 업데이트 시키는 함수도 제공한다.

<br>
- 추가적으로 컴포넌트 외부에 State 관리 로직 분리가 가능하다.**

---

<br>

#### a. useReducer 구조 정리

<br>
- `const [저장 값, dispatch] = useReducer(reducer, 저장 값의 초기화); `

<br>
- dispatch : 어떤 함수를 실행시킬지 설정(트리거) - 어떤 상태 변화를 할지 선택
	- dispatch 내부의 설정은 `action`이라는 인수로 reducer에 전달이 되는데 이러한 설정을 `action 객체`라고 불린다.

<br>
- reducer : 어떤 동작을 실행시킬 함수이며 반환을 하는 값으로 저장되는 값을 업데이트시킨다.
	- 여기서 action 객체를 사용한다.

---

<br>

#### b. 실습 코드 :
 
- 기존 useState 코드 : 

```jsx
import { useState } from "react";

// useState를 이용한 카운터 앱
export default function A() {
  const [count, setCount] = useState(0);

  const onDecrease = () => {
    setCount(count - 1);
  };

  const onIncrease = () => {
    setCount(count + 1);
  };

  return (
    <div>
      <h4>{count}</h4>
      <div>
        <button onClick={onDecrease}>-</button>
        <button onClick={onIncrease}>+</button>
      </div>
    </div>
  );
}

```

---

<br><br>

- useReducer로 실습 : 

```jsx
// useReducer를 이용해 카운터 앱 구현
import { useReducer } from "react";

function reducer(state, action) {
  switch (action.type) {
    case "DECREASE":
      return state - action.data;
    case "INCREASE":
      return state + action.data;
  }
}

export default function B() {
  const [count, dispatch] = useReducer(reducer, 0);

  return (
    <div>
      <h4>{count}</h4>
      <div>
        <button
          onClick={() =>
            dispatch({ type: "DECREASE", data: 1 })
          }
        >
          -
        </button>
        <button
          onClick={() =>
            dispatch({ type: "INCREASE", data: 1 })
          }
        >
          +
        </button>
      </div>
    </div>
  );
}

```



---

<br><br>

### 2) useReducer 실습

- dispatch에 type이랑 데이터 변수 정리!** 

- reducer는 아래 dispatch의 변수들을 동작시킬 컨트롤러 역할이다.

#### a. Todo 앱으로 useReducer 실습 

```jsx
import { useState, useRef, useReducer } from 'react'
import './App.css'
import Header from './components/Header'
import TodoEditor from './components/TodoEditor'
import TodoList from './components/TodoList'

const mockData = [
  {
    id: 0,
    isDone: true,
    content: "React 공부하기",
    createDate: new Date().getTime(),
  },
  {
    id: 1,
    isDone: false,
    content: "빨래 널기",
    createDate: new Date().getTime(),
  },
  {
    id: 2,
    isDone: true,
    content: "음악 연습하기",
    createDate: new Date().getTime(),
  }
]

// ** reducer는 아래 dispatch의 변수들을 동작시킬 컨트롤러 역할이다.
function reducer(state, action){
  switch (action.type) {
    case "CREATE":{
      return [...state, action.data];
    }

    case "UPDATE":{
      return state.map((it) =>
      it.id === action.data
        ? { ...it, isDone: !it.isDone }
        : it
      );
    }

    case "DELETE":{
      return state.filter((it) => it.id !== action.data);
    }
    
  }
}

function App() {
  const [todos, dispatch] = useReducer(reducer, mockData); 
  const idRef = useRef(3);  
  // const [todos, setTodos] = useState(mockData);

  // ** dispatch는 type이랑 데이터 변수 정리!** 
  const onCreate = (content) => {
    // const newTodo = {
    //   id: idRef.cuurent++,
    //   isDone: false,
    //   content,
    //   createDate: new Date().getTime(),
    // }
    // setTodos([...todos, newTodo]);

    dispatch({
      type: "CREATE",
      data: {
        id:  idRef.current++,
        isDone: false,
        content,
        createDate: new Date().getTime(),
      },
    });
  };

  const onUpdate = (targetId) => {
    // setTodos(
    //   todos.map((todo) =>
    //     todo.id === targetId
    //       ? { ...todo, isDone: !todo.isDone }
    //       : todo
    //   )
    // );

    dispatch({
      type: "UPDATE",
      data: targetId
    });
  };

  const onDelete = (targetId) => {
    // setTodos(todos.filter((todo) => todo.id !== targetId));

    dispatch({
      type: "DELETE",
      data: targetId
    });
  };

  return (
    <div className="App">
      <Header />
      <TodoEditor onCreate={onCreate} />
      <TodoList 
        todos={todos} 
        onUpdate={onUpdate}
        onDelete={onDelete} 
      />
    </div>
  )
}

export default App;


```


---

<br><br>

# 8. React 앱 최적화 과정

- 최적화 : 
	- 불필요한 연산 다시 수행하지 않게 하기


### 1) useMemo

- 문제점 : 전체 TODO 목록 개수, 완료한 TODO 목록 개수, 미완료한 TODO 목록 개수는 TodoList 개수가 변하지 않으면, 컴포넌트 리렌더되면 안된다.
	- TodoList 내부에서 조회될 때는 컴포넌트 리렌더가 되면 안 된다.

<br>
- 특정 조건을 만족하지 않으면, 다시 실행하지 않도록 도와주는 새로운 React Hook이다.

<br>
- 복잡한 연산을 불필요한 상황에서 사용하지 않도록 조건을 설정한다.

<br>
- useMemo에서 deps에는 콜백함수로 전달한 복잡한 연산인 다시 수행시킬 조건이 되는 변수를 넣어주면 된다.

<br>
- useMemo에서 콜백함수가 반환하는 것들을 진짜로 반환하게 된다.

<br>
- 즉, todos(TodoList) 변수의 값이 변하지 않으면 useMemo에서 반환되는 변수를 반환하지 않는다.

---

<br>

#### a. 실습 코드 :

- TodoList.jsx

```jsx
import { useState, useMemo } from "react";
import TodoItem from "./TodoItem";
import "./TodoList.css";

export default function TodoList({
    todos, 
    onUpdate, 
    onDelete,
}) {
    const [search, setSearch] = useState("");

    const onChangeSearch = (e) => {
        setSearch(e.target.value);
    };

    const filterTodos = () => {
        if(search === ""){
            return todos;
        }
        return todos.filter((todo) =>
            todo.content
                .toLowerCase()
                .includes(search.toLowerCase())
        );
    };

    // ** todos(TodoList) 변수의 값이 변하지 않으면 useMemo에서 반환되는 변수를 반환하지 않는다.
    const { totalCount, doneCount, notDoneCount } =
        useMemo (() => {
            const totalCount = todos.length;
            const doneCount = todos.filter(
                (todo) => todo.isDone
            ).length;
        const notDoneCount = totalCount - doneCount;

        return {
            totalCount,
            doneCount,
            notDoneCount,
        };
    }, [todos]);


    return (
        <div className="TodoList">
            <h4>Todos</h4>
            <div>
                <div>전체 투두 : {totalCount}</div>
                <div>완료 투두 : {doneCount}</div>
                <div>미완 투두 : {notDoneCount}</div>
            </div>
            <input 
                value={search}
                onChange={onChangeSearch}
                placeholder="검색어를 입력하세요"
            />
            <div className="todos_wrapper">
                {filterTodos().map((todo) => (
                    <TodoItem 
                        key={todo.id} 
                        {...todo}
                        onUpdate={onUpdate}
                        onDelete={onDelete} 
                    />
            // for-each문과 같아서 TodoItem에도 id를 심어줘야 한다.
                ))}
            </div>
        </div>
    );
}
```




---

<br><br>


### 2) React.memo

- 불필요하게 렌더링 시키지 않는다.

---

<br><br>

#### a. 실습 코드 1 : 

- `memo`를 이용하여 불필요한 렌더링을 제거하는 방향으로 설계

<br>
- Header.jsx

```jsx
import "./Header.css";   // import가 중요!!
import { memo } from "react";

function Header() {
    return <div className="Header">
        <h1>
            {new Date().toDateString()}
        </h1>
    </div>;
}

// 최적화된 Header(불필요하게 렌더링 시키지 않는다.)
// const OptimizedHeaderComponent = memo(Header);
// export default OptimizedHeaderComponent;

export default memo(Header);
```

---

<br><br>

#### b. 실습 코드 2 : 

- `memo`를 이용하여 불필요한 렌더링을 제거하는 방향으로 설계

<br>
- TodoItem.jsx

```jsx
import "./TodoItem.css";
import { memo } from "react";


function TodoItem({
    content,
    createDate,
    isDone,
    id,
    onUpdate,
    onDelete
}) {

    const onChangeCheckbox = () => {
        onUpdate(id);
    };

    const onClickDeleteButton = () => {
        onDelete(id);
    };

    return (
        <div className="TodoItem">
            <input 
                onChange={onChangeCheckbox}
                type="checkbox" 
                checked={isDone} 
            />
            <div className="content">{content}</div>
            <div className="date">
                {new Date(createDate).toLocaleDateString()}
            </div>
            <button onClick={onClickDeleteButton}>삭제</button>
        </div>
    );
}

export default memo(TodoItem);
```

---

<br><br>

### 3) useCallBack

- useCallBack Hook을 통해 어떤 함수의 재생성을 막아서 변화된 Todo 리스트 항목만 렌더링되도록 가능하게 만들어 준다.

<br>
- 특정 함수들은 App 컴포넌트가 리렌더링될 때, 모두 재생성 되기 때문에 useCallBack을 이용해서 불필요한 함수의 재생성은 막아야 한다.
	- TodoItem 컴포넌트의 인자인 `id, isDone, createdDate, content, onUpdate, onDelete` 중에서 App 컴포넌트가 리렌더가 되면 `onUpdate`, `onDelete`가 재생성되기 때문에 이러한 해결법이 필요하다.**
	
<br>
- TodoItem 컴포넌트의 나머지 인자들은 memo에 의해 컴포넌트 리렌더에 최적화되었다.**

---

<br>

#### a. 실습 코드 :

- App.jsx

```jsx

import { useRef, useReducer, useCallback } from 'react'
import './App.css'
import Header from './components/Header'
import TodoEditor from './components/TodoEditor'
import TodoList from './components/TodoList'

const mockData = [
  {
    id: 0,
    isDone: true,
    content: "React 공부하기",
    createDate: new Date().getTime(),
  },
  {
    id: 1,
    isDone: false,
    content: "빨래 널기",
    createDate: new Date().getTime(),
  },
  {
    id: 2,
    isDone: true,
    content: "음악 연습하기",
    createDate: new Date().getTime(),
  }
]

// ** reducer는 아래 dispatch의 변수들을 동작시킬 컨트롤러 역할이다.
function reducer(state, action){
  switch (action.type) {
    case "CREATE":{
      return [...state, action.data];
    }

    case "UPDATE":{
      return state.map((it) =>
      it.id === action.data
        ? { ...it, isDone: !it.isDone }
        : it
      );
    }

    case "DELETE":{
      return state.filter((it) => it.id !== action.data);
    }
    
  }
}

// ** 컴포넌트 앱 내부에서 useCallback을 이용하여 어떤 함수가 재생성되는 것을 막는다.**
function App() {
  const [todos, dispatch] = useReducer(reducer, mockData); 
  const idRef = useRef(3);  

  // ** dispatch는 type이랑 데이터 변수 정리!** 
  const onCreate = (content) => {
    dispatch({
      type: "CREATE",
      data: {
        id:  idRef.current++,
        isDone: false,
        content,
        createDate: new Date().getTime(),
      },
    });
  };

  const onUpdate = useCallback((targetId) => {
    dispatch({
      type: "UPDATE",
      data: targetId
    });
  }, []);

  const onDelete = useCallback((targetId) => {
    dispatch({
      type: "DELETE",
      data: targetId
    });
  }, []);

  return (
    <div className="App">
      <Header />
      <TodoEditor onCreate={onCreate} />
      <TodoList 
        todos={todos} 
        onUpdate={onUpdate}
        onDelete={onDelete} 
      />
    </div>
  )
}

export default App;

```


---

<br><br>

# 9. Context

### 0) Context가 필요한 이유

- Props Drilling 문제점에 상관 없이 필요한 Props를 Context에 저장하여 원하는 Props를 언제든 꺼내서 쓸 수 있다.
	- 징검다리 역할을 하는 컴포넌트의 역할을 제거해버린다.

---

<br><br>

### 1) Context 실습 과정 

- Provider, Consumer 개념 중요! 

<br>

#### a. 실습 코드 :

- App.jsx
	- Provider에 Props를 보낼 자식 컴포넌트를 감싼다.

```jsx
import { useReducer, useRef, useCallback } from "react";
import "./App.css";
import Header from "./components/Header";
import TodoEditor from "./components/TodoEditor";
import TodoList from "./components/TodoList";
import { TodoContext } from "./TodoContext";

const mockData = [
  {
    id: 0,
    isDone: true,
    content: "React 공부하기",
    createdDate: new Date().getTime(),
  },
  {
    id: 1,
    isDone: false,
    content: "빨래 널기",
    createdDate: new Date().getTime(),
  },
  {
    id: 2,
    isDone: true,
    content: "음악 연습하기",
    createdDate: new Date().getTime(),
  },
];

function reducer(state, action) {
  switch (action.type) {
    case "CREATE": {
      return [...state, action.data];
    }
    case "UPDATE": {
      return state.map((it) =>
        it.id === action.data
          ? { ...it, isDone: !it.isDone }
          : it
      );
    }
    case "DELETE": {
      return state.filter((it) => it.id !== action.data);
    }
  }
}

function App() {
  const [todos, dispatch] = useReducer(reducer, mockData);
  const idRef = useRef(3);

  const onCreate = (content) => {
    dispatch({
      type: "CREATE",
      data: {
        id: idRef.current++,
        isDone: false,
        content,
        createdDate: new Date().getTime(),
      },
    });
  };

  const onUpdate = useCallback((targetId) => {
    dispatch({
      type: "UPDATE",
      data: targetId,
    });
  }, []);

  const onDelete = useCallback((targetId) => {
    dispatch({
      type: "DELETE",
      data: targetId,
    });
  }, []);

  return (
    <div className="App">
      <Header />
      <TodoContext.Provider
        value={{
          todos,
          onCreate,
          onUpdate,
          onDelete,
        }}
      >
        <TodoEditor />
        <TodoList />
      </TodoContext.Provider>
    </div>
  );
}

export default App;

```

---

<br>

- TodoEditor.jsx
	- 간단히 useContext에서 꺼내서 사용한다.
	- 원래는 컴포넌트의 인자로 받아서 사용했는데 이제는 Context에서 받아서 사용한다.


```jsx
import { useRef, useState, useContext } from "react";
import "./TodoEditor.css";
import { TodoContext } from "../TodoContext";

export default function TodoEditor() {
  const { onCreate } = useContext(TodoContext);

  const [content, setContent] = useState("");
  const inputRef = useRef();

  const onChangeContent = (e) => {
    setContent(e.target.value);
  };

  const onClick = () => {
    if (content === "") {
      inputRef.current.focus();
      return;
    }
    onCreate(content);
    setContent("");
  };

  const onKeyDown = (e) => {
    if (e.keyCode === 13) {
      onClick();
    }
  };

  return (
    <div className="TodoEditor">
      <input
        ref={inputRef}
        value={content}
        onChange={onChangeContent}
        onKeyDown={onKeyDown}
        placeholder="새로운 Todo ..."
      />
      <button onClick={onClick}>추가</button>
    </div>
  );
}

```

---

<br>

- TodoList.jsx

```jsx
import { useState, useMemo, useContext } from "react";
import TodoItem from "./TodoItem";
import "./TodoList.css";
import { TodoContext } from "../TodoContext";

export default function TodoList() {
  const { todos } = useContext(TodoContext);

  const [search, setSearch] = useState("");

  const onChangeSearch = (e) => {
    setSearch(e.target.value);
  };

  const filterTodos = () => {
    if (search === "") {
      return todos;
    }

    return todos.filter((todo) =>
      todo.content
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  };

  const { totalCount, doneCount, notDoneCount } =
    useMemo(() => {
      const totalCount = todos.length;
      const doneCount = todos.filter(
        (todo) => todo.isDone
      ).length;
      const notDoneCount = totalCount - doneCount;
      return {
        totalCount,
        doneCount,
        notDoneCount,
      };
    }, [todos]);

  return (
    <div className="TodoList">
      <h4>Todos</h4>
      <div>
        <div>전체 투두 : {totalCount}</div>
        <div>완료 투두 : {doneCount}</div>
        <div>미완 투두 : {notDoneCount}</div>
      </div>
      <input
        value={search}
        onChange={onChangeSearch}
        placeholder="검색어를 입력하세요"
      />
      <div className="todos_wrapper">
        {filterTodos().map((todo) => (
          <TodoItem key={todo.id} {...todo} />
        ))}
      </div>
    </div>
  );
}

```


---

<br>

- TodoItem.jsx

```jsx
import { TodoContext } from "../TodoContext";
import "./TodoItem.css";
import { memo, useContext } from "react";

function TodoItem({ id, isDone, createdDate, content }) {
  const { onUpdate, onDelete } = useContext(TodoContext);

  const onChangeCheckbox = () => {
    onUpdate(id);
  };

  const onClickDeleteButton = () => {
    onDelete(id);
  };

  return (
    <div className="TodoItem">
      <input
        onChange={onChangeCheckbox}
        type="checkbox"
        checked={isDone}
      />
      <div className="content">{content}</div>
      <div className="date">
        {new Date(createdDate).toLocaleDateString()}
      </div>
      <button onClick={onClickDeleteButton}>삭제</button>
    </div>
  );
}

export default memo(TodoItem);

```

---

<br><br>

### 2) 최적화된 Context 분리 기법**

<br>
- 문제점** : 기존의 memo와 useCallback을 통해 최적화를 했는데 Context를 이용하니 이러한 최적화가 필요한 문제가 다시 발생했다.
	- 발생한 이유** : Provider 컴포넌트도 역시 App 컴포넌트의 자식 컴포넌트이기 때문에 Props의 value가 변경되면 역시나 다시 리렌더되어 다시 생성된다. 그렇기 때문에 onUpdate와 onDelete 함수도 다시 생성되는 것이다.
	- `todos` State가 변경되면, 객체 자체가 다시 생성되기 때문이다.

<br>
- 기존의 합쳐진 TodoContext 컴포넌트를 분리하여 사용한다. 

<br>
- 기존 하나인 Context를 변경될 수 있는 값인 `TodoStateContext`와 변경되지 않거나 변경이 필요없는 값인 `TodoDispatchContext`로 나누어서 2개의 Context로서 사용한다.

<br>
- 중요** : State 부분과 함수 부분을 분리한다. 이렇게 분리되면, TodoList만 todos를 TodoStateContext로 사용하기 때문에 todos State가 update가 되더라도 TodoList만 리렌더된다.
	- TodoList의 자식 컴포넌트인 TodoItem도 리렌더 되어야하는게 맞지만 memo로 TodoItem 컴포넌트를 최적화했기 때문에 TodoItem 컴포넌트는 리렌더되지 않는다.

---

<br>

#### a. 실습 코드 :

- App.jsx
	- 2개의 Context와 value로 최적화 문제를 해결한다**

```jsx
import { useRef, useReducer, useCallback, useMemo } from 'react'
import './App.css'
import Header from './components/Header'
import TodoEditor from './components/TodoEditor'
import TodoList from './components/TodoList'
import { TodoDispatchContext, TodoStateContext } from './TodoContext'

const mockData = [
  {
    id: 0,
    isDone: true,
    content: "React 공부하기",
    createDate: new Date().getTime(),
  },
  {
    id: 1,
    isDone: false,
    content: "빨래 널기",
    createDate: new Date().getTime(),
  },
  {
    id: 2,
    isDone: true,
    content: "음악 연습하기",
    createDate: new Date().getTime(),
  }
]

// reducer는 아래 dispatch의 변수들을 동작시킬 컨트롤러 역할이다.
function reducer(state, action){
  switch (action.type) {
    case "CREATE":{
      return [...state, action.data];
    }

    case "UPDATE":{
      return state.map((it) =>
      it.id === action.data
        ? { ...it, isDone: !it.isDone }
        : it
      );
    }

    case "DELETE":{
      return state.filter((it) => it.id !== action.data);
    }
    
  }
}

// 컴포넌트 앱 내부에서 useCallback을 이용하여 어떤 함수가 재생성되는 것을 막는다.
function App() {
  const [todos, dispatch] = useReducer(reducer, mockData); 
  const idRef = useRef(3);  

  // dispatch는 type이랑 데이터 변수 정리!
  const onCreate = (content) => {
    dispatch({
      type: "CREATE",
      data: {
        id:  idRef.current++,
        isDone: false,
        content,
        createDate: new Date().getTime(),
      },
    });
  };

  const onUpdate = useCallback((targetId) => {
    dispatch({
      type: "UPDATE",
      data: targetId
    });
  }, []);

  const onDelete = useCallback((targetId) => {
    dispatch({
      type: "DELETE",
      data: targetId
    });
  }, []);

  const memoizedDispatches = useMemo(() => {
    return {
      onCreate,
      onUpdate,
      onDelete,
    };
  }, []);

  // ** 2개의 Context와 value로 최적화 문제를 해결한다. **
  return (
    <div className="App">
      <Header />
      <TodoStateContext.Provider value={todos}>
        <TodoDispatchContext.Provider
          value={memoizedDispatches}
        >
          <TodoEditor/>
          <TodoList />
        </TodoDispatchContext.Provider>
      </TodoStateContext.Provider>
    </div>
  )
}

export default App;

```

---

<br><br>

- TodoList.jsx
	- 이제는 함수들을 넘겨주지 않아도 된다(onCreate, onUpdate)

```jsx
import { useState, useMemo, useContext } from "react";
import TodoItem from "./TodoItem";
import "./TodoList.css";
import { TodoStateContext } from "../TodoContext";

export default function TodoList({
    // todos, 
    // onUpdate, 
    // onDelete,
}) {
    const todos = useContext(TodoStateContext);

    const [search, setSearch] = useState("");

    const onChangeSearch = (e) => {
        setSearch(e.target.value);
    };

    const filterTodos = () => {
        if(search === ""){
            return todos;
        }
        return todos.filter((todo) =>
            todo.content
                .toLowerCase()
                .includes(search.toLowerCase())
        );
    };

    // todos(TodoList) 변수의 값이 변하지 않으면 useMemo에서 반환되는 변수를 반환하지 않는다.
    const { totalCount, doneCount, notDoneCount } =
        useMemo (() => {
            const totalCount = todos.length;
            const doneCount = todos.filter(
                (todo) => todo.isDone
            ).length;
        const notDoneCount = totalCount - doneCount;

        return {
            totalCount,
            doneCount,
            notDoneCount,
        };
    }, [todos]);


    return (
        <div className="TodoList">
            <h4>Todos</h4>
            <div>
                <div>전체 투두 : {totalCount}</div>
                <div>완료 투두 : {doneCount}</div>
                <div>미완 투두 : {notDoneCount}</div>
            </div>
            <input 
                value={search}
                onChange={onChangeSearch}
                placeholder="검색어를 입력하세요"
            />
            <div className="todos_wrapper">
                {filterTodos().map((todo) => (
                    // ** 이제는 함수들을 넘겨주지 않아도 된다(onCreate, onUpdate 등등)**
                    <TodoItem 
                        key={todo.id} 
                        {...todo}
                    />
                ))}
            </div>
        </div>
    );
}
```


---

<br><br>

- TodoItem.jsx
	- 중요** : Context에서 함수를 받는 방법!!

```jsx
import "./TodoItem.css";
import { memo, useContext } from "react";
import { TodoDispatchContext } from "../TodoContext";


function TodoItem({
    content,
    createDate,
    isDone,
    id,
    // onUpdate,
    // onDelete
}) {

    // ** Context에서 함수를 받는 방법 **
    const { onUpdate, onDelete } = useContext(
        TodoDispatchContext
    );

    const onChangeCheckbox = () => {
        onUpdate(id);
    };

    const onClickDeleteButton = () => {
        onDelete(id);
    };

    return (
        <div className="TodoItem">
            <input 
                onChange={onChangeCheckbox}
                type="checkbox" 
                checked={isDone} 
            />
            <div className="content">{content}</div>
            <div className="date">
                {new Date(createDate).toLocaleDateString()}
            </div>
            <button onClick={onClickDeleteButton}>삭제</button>
        </div>
    );
}

export default memo(TodoItem);
```

---

<br><br>

- TodoEditor.jsx
	- 중요** : Context에서 함수를 받는 방법!!

```jsx
import "./TodoEditor.css";
import { useState, useRef, useContext } from "react";
import { TodoDispatchContext } from "../TodoContext";

export default function TodoEditor({  }){
    // ** Context에서 함수를 받는 방법 **
    const { onCreate } = useContext( TodoDispatchContext );

    const inputRef = useRef();
    const [content, setContent] = useState("");

    const onChangeContent = (e) => {
        setContent(e.target.value);
    }

    const onClick = () => {
        if(content == ""){
            inputRef.current.focus();
            return;
        }
        onCreate(content);
        setContent("");
    }

    const onKeydown = (e) => {
        if(e.keyCode === 13){
            onClick();
        }
    }

    return (
        <div className="TodoEditor">
            <input 
                ref={inputRef}
                value={content}
                onChange={onChangeContent}
                onKeyDown={onKeydown}
                placeholder="새로운 Todo ..."
            />
            <button onClick={onClick}>추가</button>
        </div>
    );
}
```

