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

<br>
- todos가 구조분해할당 형태인('{}')가 아니라 todos 변수 자체로 받는 이유** : 
	- 이전에 App 컴포넌트에서 Context를 넘겨줄 때, 객체 형태('{}')가 아니라 변수로 넘겨주었다.
	- memoizedDispatches는 객체 형태로 넘겨주어서 다른 컴포넌트에서는 구조분해할당을 이용해서 Context 이용한다.

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



---

<br><br>

# 10. 프로젝트 3 : Naras 

### 1) React Router : 페이지 라우팅 정의

- React Router 라이브러리 설치 : `npm install react-router-dom`


- package.json


```json
{
  "name": "section6",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.17.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.0.3",
    "eslint": "^8.45.0",
    "eslint-plugin-react": "^7.32.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.3",
    "vite": "^4.4.5"
  }
}

```

---

<br>

#### a. 실습 코드 



- main.jsx
	- BrowserRouter로 App 컴포넌트(=최상위 컴포넌트)를 감싸는 것 매우 중요!!

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'

// BrowserRouter로 감싸는 것 매우 중요!!
ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)

```

---

<br><br>

- App.jsx
	- Routes 메서드 하위 계층에 Route 메서드가 있다.
	- Routes, Route는 React Router의 메서드
	- 알맞은 URL이 없을 경우에 예외처리를 하기 위해서 path를 '*'로 설정(element도 설정)
	
<br>
- 이렇게 설정 후 개발 서버에서 브라우저를 키고 URL에 `http://localhost:5173`, `http://localhost:5173/search` 등으로 이동하여 테스트하기

<br>

```jsx
import { Routes, Route } from 'react-router-dom';
import './App.css'
import Home from './components/Home';
import Country from './components/Country';
import Search from './components/Search';
import NotFound from './components/NotFound';

function App() {
  return (
   <Routes>
    <Route path='/' element={<Home/>}/>
    <Route path='/search' element={<Search/>}/>
    <Route path='/country' element={<Country/>}/>
    <Route path='*' element={<NotFound/>}/>
   </Routes> 
  )

}

export default App;

```

---

<br><br>

- Home.jsx


```jsx
export default function Home() {
    return (
        <div>Home Component</div>
    )
}
```


---

<br><br>

- Search.jsx


```jsx
export default function Search(){
    return (
        <div>Search Component</div>
    )
}
```



---

<br><br>

- Country.jsx


```jsx
export default function Country(){
    return (
        <div>Country Component</div>
    )
}
```

---

<br><br>

- NotFound.jsx


```jsx
export default function NotFound(){
    return (
        <div>NotFound Component</div>
    )
}
```


---

<br><br>

### 2) React Router : 페이지 이동

- 페이지 이동 : 
	- Link, useNavigate 이용
	
<br>

#### a. 실습 코드

- App.jsx
	- Link, useNavigate 메서드를 이용하면, 페이지 이동이 가능하다. 
	
```jsx

import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css'
import Home from './components/Home';
import Country from './components/Country';
import Search from './components/Search';
import NotFound from './components/NotFound';

function App() {
  // 'Link'나 'useNavigate'를 이용하여 현재 페이지에서 이동할 수 있다!
  // 마치 html의 a태그나 Vue.js에서의 router-link와 같다. 
  // 또한, Router의 push 메서드를 이용하여도 이동 가능
  const nav = useNavigate();
  
  const onClick = () => {
    nav("/search");
  }

  return (
    <>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/search' element={<Search/>}/>
        <Route path='/country' element={<Country/>}/>
        <Route path='*' element={<NotFound/>}/>
      </Routes>
      <div>
        <Link to={"/"}>Home</Link>
        <Link to={"/search"}>Search</Link>
        <Link to={"/country"}>Country</Link>

        <button onClick={onClick}>
          서치 페이지로 이동
        </button>
      </div>
   </> 
  )

}

export default App;

```


---

<br><br>

### 3) React Router : 동적 경로

- 쿼리스트링, Path 인자 활용하여 동적 경로 표현 : 
	- useSearchParams, useParams 이용

<br>

#### a. 실습 코드

- App.jsx
	- path에 `/country/:code`를 입력하면 useParams 메서드를 이용하여 '동적 경로' 활용 가능
	
```jsx

import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css'
import Home from './components/Home';
import Country from './components/Country';
import Search from './components/Search';
import NotFound from './components/NotFound';

function App() {
  // 'Link'나 'useNavigate'를 이용하여 현재 페이지에서 이동할 수 있다!
  // 마치 html의 a태그나 Vue.js에서의 router-link와 같다. 
  // 또한, Router의 push 메서드를 이용하여도 이동 가능
  const nav = useNavigate();
  
  const onClick = () => {
    nav("/search");
  }

  return (
    <>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/search' element={<Search/>}/>
        <Route path='/country/:code' element={<Country/>}/>
        <Route path='*' element={<NotFound/>}/>
      </Routes>
      <div>
        <Link to={"/"}>Home</Link>
        <Link to={"/search"}>Search</Link>
        <Link to={"/country"}>Country</Link>

        <button onClick={onClick}>
          서치 페이지로 이동
        </button>
      </div>
   </> 
  )

}

export default App;

```


---

<br>

- Country.jsx

```jsx
import { useParams } from "react-router-dom"

export default function Country(){
    // useParams를 이용하여 '/'의 뒤에 이어지는 'Path 경로 값'을 가져올 수 있다.
    const params = useParams();
    console.log(params);

    return (
        <div>Country : {params.code}</div>
    );
}
```

---

<br>

- Search.jsx

```jsx
import { useSearchParams } from "react-router-dom"

export default function Search(){
    // useSearchParams를 이용하여 검색에 쓰이는 
    // 쿼리스트링의 파라미터 값을 가져올 수 있다.
    const [searchParams, setSearchParams] = useSearchParams();

    return (
        <div>Search {searchParams.get("q")}</div>
    );
}
```



---

<br><br>

### 4) Naras 전반적인 레이아웃 및 UI 작업


- Layout.jsx에선, 상위 컴포넌트로 전달 받은 State를 Props로 넘겨받는데 이는 children 인자로 받는다.
	- 여기서, children 인자는 Router에 의해 정보가 전달된 App 컴포넌트 내부의 모든 컴포넌트가 들어갈 수 있다.
		- url이 '/'이면. Home 컴포넌트의 정보가 Props로 전달되고 url이 '/search'라면 Search 컴포넌트의 정보가 Props로 전달된다.

<br>
- main.jsx에서 Router를 이용할 수 있는 `BrowserRouter` 내부에 `App` 컴포넌트가 있는데 

<br>
- App 컴포넌트는 Layout 컴포넌트를 반환하기 때문에 App 컴포넌트 내부 계층의 모든 컴포넌트를 넣을 수 있다.

<br>
- 중요** : css를 module로 이용하여 간단히 뽑아내는 방법 
	- 나중에는 's'로 별칭을 사용하여 jsx에서도 css를 별칭으로 간략히 뽑아낼 수 있다.


#### a. 실습 코드 :

- main.jsx

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'

// BrowserRouter로 감싸는 것 매우 중요!!
ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)

```

---

<br>

- index.css

```css
html,
body {
  margin: 0px;
  background-color: rgb(245, 245, 245);
}

```

---

<br>

- App.jsx

```jsx
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css'
import Home from './pages/Home';
import Country from './pages/Country';
import Search from './pages/Search';
import NotFound from './pages/NotFound';
import Layout from './components/Layout';

function App() {
  // 'Link'나 'useNavigate'를 이용하여 현재 페이지에서 이동할 수 있다!
  // 마치 html의 a태그나 Vue.js에서의 router-link와 같다. 
  // 또한, Router의 push 메서드를 이용하여도 이동 가능
  // const nav = useNavigate();
  
  // const onClick = () => {
  //   nav("/search");
  // }

  // ** 최상위 태그 필요!!(Layout 추가!!) **
  return (
    <Layout>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/search' element={<Search/>}/>
        <Route 
          path='/country/:code' 
          element={<Country/>}
        />
        <Route path='*' element={<NotFound/>}/>
      </Routes>
   </Layout> 
  )
}

export default App;

```

---

<br>

- Layout.jsx
	- 상위 컴포넌트로 전달 받은 State를 Props로 넘겨받는데 이는 children 인자로 받는다.
	- 여기서, children 인자는 Router에 의해 정보가 전달된 App 컴포넌트 내부의 모든 컴포넌트가 들어갈 수 있다.
		- url이 '/'이면. Home 컴포넌트의 정보가 Props로 전달되고 url이 '/search'라면 Search 컴포넌트의 정보가 Props로 전달된다.

<br>
- main.jsx에서 Router를 이용할 수 있는 `BrowserRouter` 내부에 `App` 컴포넌트가 있는데 

<br>
- App 컴포넌트는 Layout 컴포넌트를 반환하기 때문에 App 컴포넌트 내부 계층의 모든 컴포넌트를 넣을 수 있다.

```jsx
import style from "./Layout.module.css";

export default function Layout({ children }) {
    return (
        <div>
            <header className={style.header}>
                <div>🌏 NARAS</div>
            </header>
            <main className={style.main}></main>
        </div>
    );
}
```

---

<br>

- Layout.module.css
	- css를 module로 이용하여 간단히 뽑아내는 방법 중요!!
	- 나중에는 's'로 별칭을 사용하여 jsx에서도 css를 별칭으로 간략히 뽑아낼 수 있다.

```css
/* 중요!! css를 module로 이용하는 방법 */
.header {
    position: fixed;
    top: 0px;
    left: 0px;
    right: 0px;
    height: 50px;
    background-color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
}

.main{
    max-width: 700px;
    margin: 0 auto;
    padding: 80px 10px;
}
```

---

<br><br>

### 5) React : API 호출

- `get`, `post`, `put`, `delete` 요청에 대한 API 호출!

<br>
- axios는 url에 action에 들어간다.

<br>
- fetch는 url이 인자에 들어간다.

<br>
- 중요! : 
	- API 호출은 비동기 처리라서 언제 요청값을 받을지 몰라서 await(기다리도록)를 사용한다.

<br>
- ** API로 데이터 받는 과정 처리하는 과정 **
	- 1) 외부 js 파일에서 API 호출 로직 설계(여기선, fetchCountries 함수로 설계)
    - 2) useState -> async fn -> await fetchCountries 호출 -> setCountries에 API data를 담아서 State 인자인 countries에 저장(async, await 이용)
    - 3) useEffect()로 API로 받은 데이터가 변화 시, 업데이트 시킬지 체크!!

---

<br><br>

#### a. 실습 코드 :

- api.js
	- API 설계
	- API 요청을 따로 파일을 빼서 만들면 가독성이 증가한다!
	- async + await 중요!!

```js
import axios from "axios";

// **API 요청을 따로 파일을 빼서 만들면 가독성이 증가한다!
// async + await 중요!!
export async function fetchCountries() {
    try {
        // axios는 url에 action에 들어간다.
        // fetch는 url이 인자에 들어간다.

        // * 중요! :API 요청은 비동기 처리라서 
        // 언제 요청값을 받을지 몰라서 await(기다리도록)를 사용한다.
        const response = await axios.get(
            "https://naras-api.vercel.app/all"
        );
        
        // response.data로 반환하면, 컴포넌트에서도 data로 받는다.
        return response.data;
    } catch (e) {
        return [];        
    }
}
```

---

<br><br>

- Home.jsx
    - ** API로 데이터 받는 과정 처리하는 과정 **
	    - 1) useState -> async fn -> await fetchCountries ->
	    - 2) setCountries에 API data를 담아서 State 인자인 countries에 저장
	    - 3) useEffect()로 API로 받은 데이터가 변화 시, 업데이트 시킬지 체크!!


```jsx
import { useEffect, useState } from "react";
import { fetchCountries } from "../api";
// ** 데이터 API 요청하는 외부 모듈도 꼭 import 시켜야 한다.
// 그리고 State와 연결!!

export default function Home() {

    // ** API로 데이터 받는 과정 처리하는 과정 **
    // 1) useState -> async fn -> await fetchCountries ->
    // 2) setCountries에 API data를 담아서 State 인자인 countries에 저장
    // 3) useEffect()로 API로 받은 데이터가 변화 시, 업데이트 시킬지 체크!!
    const [countries, setCountries] = useState();

    const setInitData = async () => {
        // ** axios을 이용한 데이터 API 설계에서 
        // 반환 값을 response.data로 설정해서 data로 받자!!
        const data = await fetchCountries();
        setCountries(data);
    }

    useEffect(() =>{
        setInitData();
    }, []);

    return (
        <div>Home</div>
    );
}
```

---

<br><br>

- 실습 결과 : 
	- 리액트 개발자 도구에서 API 데이터 컴포넌트 결과 확인 가능

```jsx
[
  {
    "name": "State",
    "value": [
      "{capital: Array(1), code: \"ABW\", commonName: \"Aruba…}",
      "{capital: Array(1), code: \"AFG\", commonName: \"Afgha…}",
      "{capital: Array(1), code: \"AGO\", commonName: \"Angol…}",
      "{capital: Array(1), code: \"AIA\", commonName: \"Angui…}",
      "{capital: Array(1), code: \"ALA\", commonName: \"Åland…}",
      "{capital: Array(1), code: \"ALB\", commonName: \"Alban…}",
      "{capital: Array(1), code: \"AND\", commonName: \"Andor…}",
    ],
    "subHooks": [],
    "hookSource": {
      "lineNumber": 22,
      "functionName": "Home",
      "fileName": "http://localhost:5173/src/pages/Home.jsx",
      "columnNumber": 37
    }
  },
  {
    "name": "Effect",
    "value": "ƒ () {}",
    "subHooks": [],
    "hookSource": {
      "lineNumber": 27,
      "functionName": "Home",
      "fileName": "http://localhost:5173/src/pages/Home.jsx",
      "columnNumber": 3
    }
  }
]
```


---

<br><br>

### 6) React : API 호출 2 

- 쿼리스트링처럼 파라미터를 이용해서 API 호출하는 방법!!

<br>
- `useState`, `useEffect`, `async-await arrow function` 사용법 익숙해지기!!

---

<br><br>

#### a. 실습 코드

- api.js
	- API 호출 추가(인자 이용)
	- 검생 인자는 백틱에 템플릿 리터럴로 사용!
	- async, await 중요!!

```jsx

import axios from "axios";

export async function fetchCountries() {
    try {
        // axios는 url에 action에 들어간다.
        // fetch는 url이 인자에 들어간다.

        // * 중요! :API 요청은 비동기 처리라서 
        // 언제 요청값을 받을지 몰라서 await(기다리도록)를 사용한다.
        const response = await axios.get(
            "https://naras-api.vercel.app/all"
        );
        
        // response.data로 반환하면, 컴포넌트에서도 data로 받는다.
        return response.data;
    } catch (e) {
        return [];
        // try-catch를 이용한 에러 발생 시, null이 아닌 빈 배열 반환!!        
    }
}

// ** API 요청을 위해 넘겨받은 인자를 백틱에 리터럴 템플릿 형태로 사용!
export async function fetchSearchResults(q) {
    try {
        const response = await axios.get(`
            https://naras-api.vercel.app/search?q=${q}
        `);

        return response.data;
    } catch (e) {
        return [];
    }
}

export async function fetchCountry(code) {
    try{
        const response = await axios.get(
            `https://naras-api.vercel.app/code/${code}`
        );
        return response.data;
    } catch (e) {
        return [];
    }
}

```


---

<br>

- Country.jsx
	- async, await 중요!!(프로미스 개념 들어감)

```jsx
import { useParams } from "react-router-dom"
import { fetchCountry } from "../api";
import { useEffect, useState } from "react";

export default function Country(){
    // useParams를 이용하여 '/'의 뒤에 이어지는 'Path 경로 값'을 가져올 수 있다.
    const params = useParams();
    console.log(params);

    const [country, setCountry] = useState();

    const setInitData = async () => {
        const data = await fetchCountry(params.code);
        setCountry(data);
    }
    
    useEffect (() => {
        setInitData();
    }, [params.code]);

    return (
        <div>Country : {params.code}</div>
    );
}
```

---

<br>

- Search.jsx
	- async, await 개념 중요!!


```jsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom"
import { fetchSearchResults } from "../api";

export default function Search(){
    // useSearchParams를 이용하여 검색에 쓰이는 
    // 쿼리스트링의 파라미터 값을 가져올 수 있다.
    const [searchParams, setSearchParams] = useSearchParams();

    const [countries, setCountries] = useState();

    const setInitData = async () => {
        const data = await fetchSearchResults(q);
        setCountries(data);
    };

    useEffect(()=>{
        setInitData();
    }, []);

    return (
        <div>Search {searchParams.get("q")}</div>
    );
}
```

---

<br><br>

### 7) fetch vs axios 정리

- [fetch vs axios 참고 사이트](https://iridescent-zeal.tistory.com/221)

- [axios: get,post options 객체 참고 사이트](https://inpa.tistory.com/entry/AXIOS-%F0%9F%93%9A-%EC%84%A4%EC%B9%98-%EC%82%AC%EC%9A%A9#axios_%EC%9A%94%EC%B2%ADrequest_%ED%8C%8C%EB%9D%BC%EB%AF%B8%ED%84%B0_%EC%98%B5%EC%85%98)

- [axios: get + async-await header option 참고**](https://github.com/woowacourse-teams/2020-seller-lee-company/blob/develop/front/src/api/api.ts)

<br>
- 우선 `fetch()`는 url이 인자로 들어가고, axios는 url이 option 객체로 들어갑니다. 또한 fetch()는 body 프로퍼티를 사용하며 stringify()로 되어지고, axios는 data 프로퍼티를 사용합니다. 

<br>
- 이처럼 axios는 HTTP 통신의 요구사항을 컴팩트한 패키지로써 사용하기 쉽게 설계되어 있습니다.  

---

<br>

#### a. fetch

```jsx
// src/FetchMovie.jsx
import React, { useState, useEffect } from 'react';
import Movie from './Movie';

const FetchMovie = ({url}) => {
  const [movies, setMovies] = useState([])

  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  }

  useEffect(() => {
    fetch(url, options)
    .then(response => response.json())
    .then(response => {
      setMovies(response.results)
    })
  }, []);

  return (
    <>
      <h1>Fetch로 영화 정보 가져오기</h1>
      {movies.map((movie) => (
        <Movie 
          key={movie.id}
          title={movie.title}
          vote_average={movie.vote_average}
          backdrop_path={movie.backdrop_path}></Movie>
      ))}
      <hr />
    </>
  );
};

export default FetchMovie;
```

---

<br>

#### b. axios

```jsx

// src/AxiosMovie.jsx
import React, { useEffect, useState } from 'react';
import axios from "axios";
import Movie from './Movie';

const AxiosMovie = ({url}) => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    axios.get(url)
      .then(response => response.data)
      .then(response => {
        setMovies(response.results)
      })
  }, []);

  return (
    <>
      <h1>AXIOS로 영화 정보 가져오기</h1>
      {movies.map((movie) => (
        <Movie 
          key={movie.id}
          title={movie.title}
          vote_average={movie.vote_average}
          backdrop_path={movie.backdrop_path}></Movie>
      ))}
    </>
  );
};

export default AxiosMovie;
```


---

<br><br>

### 8) 컴포넌트별 기능 구현 : Home

<br>


#### a. Home

- 현재까지는, index 페이지에서 Search bar에 '나라 코드'를 검색하면, search 페이지로 이동하여, '나라 코드'에 관한 검색 결과 확인 가능 

<br>
- 헤더 클릭시, index 페이지로 이동!(홈버튼 기능)

<br>
- index 페이지에서 모든 국가들 리스트 형식으로 이미지와 나라의 정보 확인!

<br>
- css 이용할 때, 주의!! : `""`가 아니라 `{}`로 css를 적용시킨다. 

<br><br>

- Layout.jsx
	- 헤더 클릭시, index 페이지로 이동!(홈버튼)

```jsx
import { useNavigate } from "react-router-dom";
import style from "./Layout.module.css";

export default function Layout({ children }) {
    const nav = useNavigate();

    const onClickHeader = () =>{
        nav(`/`);
    }

    return (
        <div>
            <header 
                onClick={onClickHeader}
                className={style.header}
            >
                <div>🌏 NARAS</div>
            </header>
            <main className={style.main}>{children}</main>
        </div>
    );
}
```

---

<br>
- Home.jsx

```jsx
import { useEffect, useState } from "react";
import { fetchCountries } from "../api";
import Searchbar from "../components/Searchbar";
import CountryList from "../components/CountryList";
import style from "./Home.module.css";
// ** 데이터 API 요청하는 외부 모듈도 꼭 import 시켜야 한다.
// 그리고 State와 연결!!

export default function Home() {

    // ** API로 데이터 받는 과정 처리하는 과정 **
    // 1) useState -> async fn -> await fetchCountries ->
    // 2) setCountries에 API data를 담아서 State 인자인 countries에 저장
    // 3) useEffect()로 API로 받은 데이터가 변화 시, 업데이트 시킬지 체크!!
    const [countries, setCountries] = useState([]);

    const setInitData = async () => {
        // ** axios을 이용한 데이터 API 설계에서 
        // 반환 값을 response.data로 설정해서 data로 받자!!
        const data = await fetchCountries();
        setCountries(data);
    };

    // deps에 아무것도 없어서 mount로 동작
    useEffect(() => {
        setInitData();
    }, []);

    return (
        <div className={style.container}>
            <Searchbar />
            <CountryList countries={countries}/>
        </div>
    );
}
```

---

<br>
- Search.jsx
	- q값이 바뀌면, 업데이트로 된 q값으로 검색 진행

```jsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom"
import { fetchSearchResults } from "../api";

export default function Search(){
    // useSearchParams를 이용하여 검색에 쓰이는 
    // 쿼리스트링의 파라미터 값을 가져올 수 있다.
    const [searchParams, setSearchParams] = useSearchParams();
    const q = searchParams.get("q");

    const [countries, setCountries] = useState([]);

    const setInitData = async () => {
        const data = await fetchSearchResults(q);
        setCountries(data);
    };

    // q값이 바뀌면, 업데이트로 된 q값으로 검색 진행
    useEffect(()=>{
        setInitData();
    }, [q]);

    return (
        <div>Search {searchParams.get("q")}</div>
    );
}
```

---

<br>
- Searchbar.jsx
	- useNavigate에 템플릿 리터럴로 인자 받기!

```jsx
import { useState } from "react";
import style from "./Searchbar.module.css";
import { useNavigate } from "react-router-dom";

export default function Searchbar() {
    const [search, setSearch] = useState(""); 
    const nav = useNavigate();

    const onChangeSearch = (e) => {
        setSearch(e.target.value);
    }

    const onkeyDown = (e) => {
        if(e.keyCode === 13){
            onClickSearch();
        }
    }

    // useNavigate에 템플릿 리터럴로 인자 받기!
    const onClickSearch = () => {
        if(search !== ""){
            nav(`/search?q=${search}`);
        }
    }
    
    return (
        <div className={style.container}>
            <input
                value={search}
                onKeyDown={onkeyDown}
                onChange={onChangeSearch}
                placeholder="검색어를 입력하세요...."
            />
            <button onClick={onClickSearch}>검색</button>
        </div>
    )
}
```



---

<br>
- CountryList.jsx**
	- countries가 전달되지 않거나 배열로 전달되지 않을 때, 값을 초기화해줘서 에러 해결!
	- map을 이용 시, 괄호 주의!

```jsx
import CountryItem from "./CountryItem";
import style from "./CountryList.module.css";

export default function CountryList({ countries }) {
    return (
        <div className={style.container}>
            {countries.map((country) => (
                <CountryItem key={country.code} {...country} />
            ))}
        </div>
    );
}

// 이부분 왜 쓰는지? null 에러를 방지하기 위해서 사용한다.
// countries가 전달되지 않거나 배열로 전달되지 않을 때, 값을 초기화해줘서 에러 해결!
CountryList.defaultProps = {
    countries: [],
};
  
```


---

<br>
- CountryItem.jsx**
	- API의 인자 전부 꺼내기!

```jsx
import { useNavigate } from "react-router-dom";
import style from "./CountryItem.module.css";

export default function CountryItem({
    code,
    commonName,
    flagEmoji,
    flagImg,
    population,
    region,
    capital,
}) {
    const nav = useNavigate();
    
    const onClickItem = () => {
        nav(`/country/${code}`);
    };

    // ** API의 인자 전부 꺼내기!
    // join 메서드 주의!! 수도가 여러 개일 수도 있어서 구분자!
    return (
        <div onClick={onClickItem} className={style.container}>
            <img className={style.flag_img} src={flagImg} />
            <div className={style.content}>
                <div className={style.name}>
                    {flagEmoji} {commonName}
                </div>
                <div>지역 : {region}</div>
                <div>수도 : {capital.join(", ")}</div>
                <div>인구 : {population}</div>
            </div>
        </div>
    );
}
```



---

<br><br>

### 9) 컴포넌트별 기능 구현 : Search

<br>

- q값이 바뀌면, 업데이트로 된 q값으로 검색 진행!! 
	- Search뿐만 아니라 Searchbar도 적용!

<br><br>

#### a. Search

- Search.jsx
	- q값이 바뀌면, 업데이트로 된 q값으로 검색 진행

```jsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom"
import { fetchSearchResults } from "../api";
import style from "./Search.module.css";
import Searchbar from "../components/Searchbar";
import CountryList from "../components/CountryList";

export default function Search(){
    // useSearchParams를 이용하여 검색에 쓰이는 
    // 쿼리스트링의 파라미터 값을 가져올 수 있다.
    const [searchParams, setSearchParams] = useSearchParams();
    const q = searchParams.get("q");

    const [countries, setCountries] = useState([]);

    const setInitData = async () => {
        const data = await fetchSearchResults(q);
        setCountries(data);
    };

    // q값이 바뀌면, 업데이트로 된 q값으로 검색 진행
    useEffect(()=>{
        setInitData();
    }, [q]);

    return (
        <div className={style.container}>
            <Searchbar q={q}/>
            <div>
                <b>{q}</b> 검색 결과
            </div>
            <CountryList countries={countries} />
        </div>
    );
}
```

---

<br>
- Searchbar.jsx
	- Search 페이지로부터 넘겨받은 인자도 필요하다! 그 이유는 Searchbar 사용자가 사용하는 실제 페이지가 아니라 컴포넌트이기 때문이다. 
	- 검색 시, useEffect가 필요하다. 검색인자인 q값이 변환함에 따라 업데이트 되어야 하기 때문에
	- ** 주의 : q는 '구조분해할당'으로 받는다
	

```jsx
import { useEffect, useState } from "react";
import style from "./Searchbar.module.css";
import { useNavigate } from "react-router-dom";

// ** 주의 : q는 구조분해할당으로 받는다
export default function Searchbar( { q } ) {
    const [search, setSearch] = useState(""); 
    const nav = useNavigate();

    // ** 검색 시, 필요! q값이 변환함에 업데이트 되어야 하기 때문에
    useEffect(() => {
        setSearch(q);
    }, [q]);
    
    const onChangeSearch = (e) => {
        setSearch(e.target.value);
    }

    const onkeyDown = (e) => {
        if(e.keyCode === 13){
            onClickSearch();
        }
    }

    // useNavigate에 템플릿 리터럴로 인자 받기!
    const onClickSearch = () => {
        if(search !== ""){
            nav(`/search?q=${search}`);
        }
    }

    return (
        <div className={style.container}>
            <input
                value={search}
                onKeyDown={onkeyDown}
                onChange={onChangeSearch}
                placeholder="검색어를 입력하세요...."
            />
            <button onClick={onClickSearch}>검색</button>
        </div>
    )
}
```








---

<br><br>

### 10) 컴포넌트별 기능 구현 : Country

- a) 에러 발생 : 
	- country가 undefined일 때, 발생하는 에러를 막고자 다음과 같이 해결!

<br>
- b) 발생 이유** :
	- 'country' State의 초기 값이 undefined인 것도 이유이며, 비동기적으로 API가 호출되어 동작하므로 화면에 마운트되었을 때, 'fetchCountry' API가 아직 데이터를 불러오지 않은 상태일 수도 있다.

<br>
- c) 해결 과정** : 
	- 그러므로 'country' State에서 null 체크를 해준다.

<br>

#### a. Country


- Country.jsx

```jsx

import { useParams } from "react-router-dom"
import { fetchCountry } from "../api";
import { useEffect, useState } from "react";
import style from "./Country.module.css";

export default function Country(){
    const params = useParams();
    const [country, setCountry] = useState();

    const setInitData = async () => {
        const data = await fetchCountry(params.code);
        setCountry(data);
    }
    
    useEffect (() => {
        setInitData();
    }, [params.code]);

    // ** country가 undefined일 때, 발생하는 에러를 막고자 다음과 같이 해결!
    // 'country' State의 초기 값이 undefined이며, 
    // ** 비동기적으로 API가 동작하므로 마운트되었을 때, fetchCountry가 아직 데이터를 불러오지 않은 상태일 수도 있다.
    if(!country) {
        return <div>Loading ...</div>
    }

    return (
        <div className={style.container}>
            <div className={style.header}>
                <div className={style.commonName}>
                    {country.flagEmoji}&nbsp;{country.commonName}
                </div>
                <div className={style.officialName}>
                    {country.officialName}
                </div>
            </div>
            <img 
                src={country.flagImg}
                alt={`${country.commonName}의 국기 이미지입니다.`}
            />
            <div className={style.body}>
                <div>
                    <b>코드 :</b>&nbsp;{country.code}
                </div>
                <div>
                    <b>수도 :</b>&nbsp;{country.capital.join(", ")}
                </div>
                <div>
                    <b>지역 :</b>&nbsp;{country.region}
                </div>
                <div>
                    <b>지도 :</b>&nbsp;
                    <a target="_blank" href={country.googleMapURL}>
                        {country.googleMapURL}
                    </a>
                </div>
            </div>
        </div>
    );
}
```

---

<br><br>

#### b. 에러 해결

<br>

##### a) Warning: A component is changing an uncontrolled input to be controlled. This is likely caused by the value changing from undefined to a defined value, which should not happen. Decide between using a controlled or uncontrolled input element for the lifetime of the component.


<br>
- 해결방법 1: 위의 컴포넌트는 부모 컴포넌트를 통해 props를 전달받아야 하는데 새로고침으로 값을 전달받이 못해undefined가 들어가서 그런 듯했다.
	- input 태그의 value 속성에 `||` 연산자로 `undefined`일 때 공백을 지정해주었다.

```html
<input
    value={search || ""}
    onKeyDown={onkeyDown}
    onChange={onChangeSearch}
    placeholder="검색어를 입력하세요...."
/>
```

---

<br>

- 해결방법 2 : 위의 방식대로 진행하면, 에러는 없어지긴 했으나 인풋에 디폴트 값이 입력되어 않고 빈창이 떴다. 빈 input 태그가 아니라 디폴트값인 'KOR'이나 유저가 수정한 별명이 입력되어 있어야 하는 상황.
	- 렌더링할 때, input 태그가 공백인 경우, 값을 넣어줄 수 있는 useEffect() 메서드 이용
	- useEffect() 메서드로 변수에 초기값을 '[]'로 지정 
	
<br>

```jsx
useEffect(() => {
	if(!country){
		setCountry(country);
	}
}, []);
```


<br>
- 결론 : React는 새로고침 시, 에러가 많이 발생한다. 


---

<br><br>

### 11) React : 배포하기

#### a. 배포 준비

- 메타데이터를 이용하여 URL 공유시, 썸네일 변경

<br>
- index.html

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image" href="/favicon.ico" />
    <meta 
      name="viewport" 
      content="width=device-width, initial-scale=1.0" 
    />
    <meta property="og:image" content="/thumbnail.png"/>
    <meta property="og:title" content="NARAS"/>
    <meta 
      property="og:description"
      content="전 세계 국가들의 정보를 확인하세요"
    />
    <title>Naras</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>

```

---

<br><br>

#### b. 배포 하기


##### a) Vercel

- next.js도 Vercel에서 만들어 운영 중이다.

<br>
- Vercel에서 프론트웹 개발에 관한 배포를 무료로 제공해준다.
	- 보통은 프론트웹 개발에서 테스트용도로 사용한다. 

<br>
- 아이디 만들기 : 이메일이나 깃허브 이용

---

<br><br>


##### b) 배포 과정 

- 0) 터미널에서 vercel 설치 : `sudo npm i -g vercel`

<br><br>

- 1) 터미널에서 vercel에 로그인 : `vercel login`


<br><br>

- 2) 배포 하기 : `vercel --prod`

```cli
Vercel CLI 32.5.0
? Set up and deploy “~/temp/reactStudy/basicReactPrj/section11”? [Y/n] y
? Which scope do you want to deploy to? hunne-dev's projects
? Link to existing project? [y/N] n
? What’s your project’s name? naras-dev
? In which directory is your code located? ./
Local settings detected in vercel.json:
Auto-detected Project Settings (Vite):
- Build Command: vite build
- Development Command: vite --port $PORT
- Install Command: `yarn install`, `pnpm install`, `npm install`, or `bun install`
- Output Directory: dist
? Want to modify these settings? [y/N] n
```

<br><br>

- 3) 배포 완료 :
	- [배포된 Naras 프로젝트](https://naras-k4gsjadcs-hunne-devs-projects.vercel.app/)

```cli
 Linked to hunne-devs-projects/naras-dev (created .vercel and added it to .gitignore)
🔍  Inspect: https://vercel.com/hunne-devs-projects/naras-dev/EMiNaBjjAHoHV9UVtcazmQenzWtK [1s]
✅  Production: https://naras-bfyh0eckw-hunne-devs-projects.vercel.app [1s]
```


---

<br><br>

##### c) 배포 후, 404 에러에 대한 추가 설정

- 이렇게 설정해야 SPA 방식에서도 클라우드를 이용하여 배포를 해도
	- 웹 페이지가 모든 경로에서 제대로 동작한다.('/search', '/about', '/country')

```json
{
    "rewrites" : [{ "source": "/(.*)", "destination": "/" }]
}

/* 이렇게 설정해야 SPA 방식에서도 클라우드를 이용하여 배포를 해도
 웹 페이지가 모든 경로에서 제대로 동작한다.('/search', '/about', '/country') */
```


---

<br><br>

# 12. next.js 

### 1) SSR router

#### a. getServerSideProps vs Component function

- next.js에서 `getServerSideProps` 함수는 SSR 전용, 일반 `컴포넌트 함수`는 CSR 전용이라서 2가지를 혼용해서 사용할 수 있다.
   - next.js에서 보통 `데이터를 만들어오는 곳`은 'SSR' 방식으로 사용하고, `화면에 보여주는 용도`에서는 'CSR' 방식으로 사용한다.

---

<br><br>

#### b. useRouter vs context

- `context` 객체는 서버측에서 API의 데이터를 사용할 때, 이용한다. 

<br>
- `useRouter` 메서드는 클라이언트측에서 API의 데이터를 사용할 때, 이용한다.


