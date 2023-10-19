---
key: /2023/10/12/React-Study1.html
title: React - React Study1
tags: React Vite JS 
---

# 1. Node.js 

### 1) Node.js 실행하기

- Node.js 사용 시, pakage.json의 scripts에서 실행 스크립트를 추가 설정하면 Node.js 실행 시, 모든 경로를 다 써주지 않아도 된다.
	- `node src/index.js` : 이러한 명령어 같은 것들은 이젠 더 이상 사용하지 않아도 된다.
	- `npm run start` : 이제는 이렇게 간단한 명령어로 Node.js 코드를 실행한다.


<br>

#### a. 실습 코드 : 

- package.json : 

```json

{
  "name": "section1",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node src/index.js"
  },
  "author": "",
  "license": "ISC",
  "type": "module"
}

```

---

<br><br>

### 2) Node.js 예시 코드 

- ESM 모듈 시스템에서는 아래와 같은 코드처럼 모듈을 사용한다.(CJS 모듈 시스템과는 다름)

- `export function`와 `export default function(기본값)`를 사용하여 모듈을 외부로 내보낼 수 있다. 

<br>

#### a. 실습 코드 : 

<br>
- math.js

```javascript
export function add(a, b) {
  return a + b;
}

export function sub(a, b) {
  return a - b;
}

export default function multiply(a, b) {
  return a * b;
}

```

<br>
- index.js
	- import ~ from으로 외부 모듈을 가져와서 사용한다.

```javascript
import mul, { add, sub } from "./math.js";

console.log(add(1, 2));
console.log(sub(1, 2));
```

---

<br><br>

### 3) Node.js 라이브러리 사용

- `npm i randomcolor` : 해당 명령어로 NPM에서 패키지를 다운받기
	- 기본적으로 JS는 라이브러리를 `패키지`라고 부른다.

<br>
- `package.json` 파일은 캐럿('`^`')을 통해 패키지 버전을 대략적인 버전으로 설정해두고 package-lock.json에서 정확한 패키지 버전으로 설정한다.

<br>
- nodemodules : 설치한 패키지의 소스코드를 자세히 살펴볼 수 있다.

<br>

#### a. 실습 코드 : 


```javascript
import randomColor from "randomcolor";

const color = randomColor();
console.log(color);
```

---

<br><br>

# 2. React.js 개념

- 컴포넌트 기반 : 모듈 시스템으로 이름으로만 불러내어 컴포넌트를 활용한다. 이렇게 컴포넌트를 활용하면 중복 코드를 줄일 수 있다.

<br>
- 편리한 업데이트 : 편리한 업데이트가 가능하다. 인터렉션을 의미하며, 사용자의 행동에 웹이 실시간으로 반응하는 것이다.

---

<br><br>

### 1) Virtual DOM 

- Virtual DOM는 Render Tree, Layout, Painting 등을 활용한다.

<br>
- `Render Tree` : `Render Tree`는 `HTML`과 `CSS`로 표현한 각각의 요소들의 배치와 모양 그리고 스타일을 합쳐서 `웹페이지의 설계도`를 의미하는 것이다. 

<br>
- `Layout`(= `Reflow`), `Painting`(= `Repaint`)는 자주 실행하면 성능 악화가 되어 여러 수정사항을 한 번에 모아서 DOM을 업데이트 해야 한다.
	- Layout은 화면에 나타날 요소들의 위치와 크기를 결정하고 Painting는 실제 요소들을 화면 그려내는 과정이다.

<br>
- `Virtual DOM`** : 이렇게 한 번에 모아서 업데이트를 하는 것처럼 Virtual DOM를 이용하여 Virtual DOM에서 수정 사항을 한 번에 모아서 Actual DOM에서 실행한다.
	- 성능 향상

---

<br><br>
 
### 2) Vite + React


#### a. Vite 개발 환경을 위한 명령어 정리

- `npm init` : npm 패키지 생성(Vscode에 디렉토리 생성) 명령어

<br>
- `npm create vite@latest` : `Vite`를 이용하여 React 앱 개발 환경 구성	명령어
	- 바벨이나 웹팩를 이용할 수도 있지만 개발 환경을 구성하기 위해서는 추가적인 개념이 필요하다. 
	- 그래서, 비교적 기본 프론트 웹 개발 환경을 구성해주는 Vite를 이용한다.
	- Vite 명령어를 사용하고나서 프로젝트를 설치하는 과정에서 'React'를 선택하여 `React 개발 환경 구축`


<br>

#### b. package.json

- `eslint` : 코드 컨벤션같이 코드 스타일이 유사하도록 규칙 같은 것 


```json
{
  "name": "section2",
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
    "react-dom": "^18.2.0"
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




<br>

#### c. index.html

- 중요** : React는 기본적으로 JS 라이브러리라서 앱 구성 시, index.html에서는 script 파일만 이용하여 앱을 구성한다.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>

```


<br>

#### d. main.jsx

- JS와는 다른 문법의 JSX이다. html에서 JS를 사용할 수 있으며 웹 화면 개발을 위해 추가적인 문법이 있다.
	- 라이브러리를 import를 이용하여 바로 사용 가능

<br>
- 'root'라는 기본 DOM을 이용하여 ReactDOM에서 createRoot로 사용하여 렌더링을 진행하여 StrictMode 모드에서 App이라는 컴포넌트를 리액트 앱 개발 진행한다.

<br>
- 정리** : 여기서 main.jsx는 화면을 구성하는 템플릿과 같다. Vue.js에서도 비슷한 개념이 있었다. 

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

```


<br>

#### e. App.jsx**


- 실제 화면 요소이다.**

<br>
- 여기서는 App 컴포넌트를 사용하는데 `App`이라는 함수를 이용하여 `return{}`에서 해당 요소를 반환하여 앱 화면을 구성한다.

<br>
- `export default App`처럼 사용하거나 `export default function App(){}` 처럼 사용한다.

<br>
- `useState`에서 `State`라는 중요 개념!(각각의 컴포넌트 상태관리 개념 중요!)


```jsx
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App

```






---

<br><br>
 
### 3) React 앱의 동작 원리

- 초기 React 앱의 코드를 지우고 동작 원리를 이해하기 위한 샘플 코드이다.

<br>
- 'return'에서 반환되는 요소는 항상 `최상위 태그 내부`에서 동작해야 한다.(`div 태그`나 `이름이 없어도 되는 태그` 등등)
	- 최상위 태그는 1개만 존재해야 한다.

<br>
- `React.StrictMode` : React 라이브러리에서 제공되는 기능 중 하나로, 개발 환경에서 애플리케이션의 잠재적인 문제를 식별하고 경고를 생성하는 데 도움을 줍니다. StrictMode를 사용하면 개발자가 더 나은 코드를 작성하고 React 애플리케이션의 성능을 최적화할 수 있습니다.

<br>

#### a. 실습 코드 : 

<br>
- App.jsx

```jsx
import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>안녕 리액트</h1>
    </>
  );
}

export default App;

```

<br><br>

- main.jsx
	- 화면 구성용 템플릿 느낌 

```jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

```

---

<br><br>

# 3. React.js 입문


### 0) 컴포넌트 사용법

- 모듈 시스템 사용
	- `/components/~~` 폴더 내부에서 컴포넌트 사용
	- `export default function`와 `import`로 웹 구조 사용

<br>

---

#### a. 실습 코드 

<br>
- Body.jsx

```jsx
export default function Body() {
  return (
    <div>
      <h1>body</h1>
    </div>
  );
}

``` 

<br>
- Header.jsx


```jsx
const Header = () => {
  return (
    <header>
      <h1>header</h1>
    </header>
  );
};

export default Header;

``` 

<br>
- Footer.jsx


```jsx
export default function Footer() {
  return (
    <footer>
      <h1>footer</h1>
    </footer>
  );
}

``` 

<br>
- App.jsx

```jsx
import "./App.css";
import Header from "./components/Header";
import Body from "./components/Body";
import Footer from "./components/Footer";

function App() {
  return (
    <>
      <Header />
      <Body />
      <Footer />
    </>
  );
}

export default App;

``` 

---

<br><br>


### 1) JSX 문법


#### a. 중괄호 사용법 :

- a) 변수에서 중괄호 사용 :


```jsx

export default function Body() {
  const number = 10;
  const string = "hello";
  const bool = true;
  const obj = {
  	a:1,
  };

  return (
    <div className="body">
      <h1>body</h1>
      <h2>{10}</h2>
      <h2>{number % 2 === 0 ? "짝수" : "홀수"}</h2>
      <h2>{string}</h2>
      <h2>{bool}</h2>
      <h2>{obj.a}</h2>
    </div>
  );
}
```

---

<br>
- b) 함수에서 중괄호 사용** :
	- `func` 함수명이 아니라 `func()` 함수 그 자체로 보내야 한다.

```jsx
export default function Body() {
  const number = 10;
  const string = "hello";
  const bool = true;
  const obj = {
  	a:1,
  };
  
  const func = () => {
  	return "func";
  };

  return (
    <div className="body">
      <h1>body</h1>
      <h2>{func()}</h2>
      <h2>{obj.a}</h2>
    </div>
  );
}
```

<br>
- 아래 챕터 `c. JSX에서 CSS 사용법` 코드 참고하기

---

<br><br>

#### b. JS에서 객체 사용하는 방법

- a) 중괄호에서 삼항연산 이용 :
	- JSX의 html 태그에서 3항 연산 가능
	- 3항 연산을 이용하거나 if ~ else 문을 이용하기

<br>
- b) 변수로 따로 빼서 객체 이용 :
	- `...buttonProps` : 객체를 변수로 따로 빼서 JS spread 문법 이용하기

<br>
	
```jsx
function ButtonChild() {
  return <div>버튼의 자식 컴포넌트</div>;
}

export default function Body() {
  const buttonProps = {
    text: "1번 버튼",
    color: "yellow",
    a: 1,
    b: 2,
    c: 3,
  };

  return (
    <div className="body">
      <h1>body</h1>
      <Button {...buttonProps}>
        <ButtonChild />
      </Button>
      <Button text={"2번 버튼"} />
      <Button text={"3번 버튼"} />
    </div>
  );
}
```

---

<br><br>

#### c. JSX에서 CSS 사용법

- `{{}}` : 중괄호 2개 이용하여 JSX에서 CSS 속성을 사용할 수 있다.

<br>
- `className` : class가 아니라 className를 이용하여 CSS를 사용할 수 있다.
	- JSX에서 class는 JS용 예약어이다.

<br>

```jsx

import "./Button.css";

export default function Button({ text, color, children }) {
  return (
    <button
      style={{ backgroundColor: color }}
      className="button"
    >
      {children}
    </button>
  );
}

Button.defaultProps = {
  color: "none",
};
```


---

<br><br>

### 2) Props**

- 부모에서 자식에게 속성을 넘겨준다. 

<br>
- 속성을 넘겨받는 방법은 3가지 정도 있다.**
	- 아래 코드가 가장 간편한 방법 : `export default function Button({ text, color, children }) {}`

<br>

#### a. 예시 코드 

<br>
- Body.jsx

```jsx
import "./Body.css";
import Button from "./Button";

function ButtonChild() {
  return <div>버튼의 자식 컴포넌트</div>;
}

export default function Body() {
  const buttonProps = {
    text: "1번 버튼",
    color: "yellow",
    a: 1,
    b: 2,
    c: 3,
  };

  return (
    <div className="body">
      <h1>body</h1>
      <Button {...buttonProps}>
        <ButtonChild />
      </Button>
      <Button text={"2번 버튼"} />
      <Button text={"3번 버튼"} />
    </div>
  );
}


```

---

<br>
- Button.jsx

```jsx
import "./Button.css";

export default function Button({ text, color, children }) {
  return (
    <button
      style={{ backgroundColor: color }}
      className="button"
    >
      {children}
    </button>
  );
}

Button.defaultProps = {
  color: "none",
};

```


<br>

#### b. Props 사용하는 다른 방법

```jsx
export default function Button(props){
	const { color, text } = props;	
	console.log(props);
	
	return {
	<button
		style={{
			backgroundColor: c
		}}
		className="button"
	>
		{text}
	</button>
	};
}
```

---

<br><br>

### 3) React : 이벤트 핸들링

- React의 DOM을 조작하기 위한 이벤트 핸들링 방법

<br>
- 복합된 이벤트 객체 사용('e') :
	- 크로스 브라우징 이슈 해결 가능



---

<br><br>

### 4) State**

- 컴포넌트용 상태관리가 가능하다.**
	- State 함수(`light`)에 의해 컴포넌트가 업데이트가 되며 업데이트된 값은 State 변수(`setLight`)에 저장하여 사용한다.

<br>
- `useState`를 사용해야 컴포넌트가 업데이트된다.
	- 안쓰고 그냥 변수로 사용하면, 화면이 절대로 업데이트가 안 된다.
		- onClick() 이벤트에서 useState의 함수를 사용하지 않고 값만 변경한 경우이다.

<br>
- `import { useState } from "react";` : 이렇게 '예약어'로 불러내서 State를 사용한다.

<br><br>

#### a. 실습코드 :

- Body.jsx

```jsx
import { useState } from "react";

export default function Body() {
  const [light, setLight] = useState("OFF");

  return (
    <div className="body">
      {light}
      <button
        onClick={() => {
          setLight("ON");
        }}
      >
        불켜기
      </button>
      <button
        onClick={() => {
          setLight("OFF");
        }}
      >
        불끄기
      </button>
    </div>
  );
}

```



---

<br><br>

### 5) State와 Props**

- State와 Props의 관계 정리** : 
	- 부모로부터 자식으로 State를 Props로 넘겨주면, 
		- 부모의 State가 변경될 때, 부모의 컴포넌트가 렌더링되고 Props된 자식도 다시 컴포넌트가 렌더링된다.(즉, 각각의 함수들이 다시 실행된다.)
		- 매우 중요한 개념이다. 

<br>
- 중요** : State 변경 시, Props로 State 값을 넘겨준 부모와 자식 관계 간에 화면이 업데이트되는 것을 console.log로 테스트 해보기

<br>
- 추가로 `StaticState` 개념** :
	- 항상 값이 State가 변하더라도 일정하다. 

<br><br>

#### a. 실습코드 :

- Body.jsx

```jsx
import { useState } from "react";

function LigthBulb({ light }) {
  return (
    <>
      {light === "ON" ? (
        <div style={{ backgroundColor: "orange" }}>ON</div>
      ) : (
        <div style={{ backgroundColor: "gray" }}>OFF</div>
      )}
    </>
  );
}

function StaticLigthBulb() {
  console.log("STATIC LIGTH BULB 컴포넌트 : ");
  return <div style={{ backgroundColor: "gray" }}>OFF</div>;
}

export default function Body() {
  const [light, setLigth] = useState("OFF");

  return (
    <div className="body">
      <LigthBulb light={light} />
      <StaticLigthBulb />
      <button
        onClick={() => {
          setLigth("ON");
        }}
      >
        불켜기
      </button>
      <button
        onClick={() => {
          setLigth("OFF");
        }}
      >
        불끄기
      </button>
    </div>
  );
}

```

---

<br><br>

### 6) State: 사용자 입력 관리*

- 실시간으로 업데이트되는 사용자의 입력을 웹 화면에서 바로 볼 수 있다.
	- 'State' 개념과 onChange라는 '이벤트 함수' 사용
	
<br>
- 매우 중요한 개념이며 실무에서 자주 쓰임.

<br>

#### a. useState로 통합 방법

- `const [state, setState] = useState({})` : 'a) `객체`로 통합시키기'

<br>
- `<input value={state.name} />` : 'b) 이렇게 `value`에 객체 속성으로 사용'
	- `<select value={state.gender}>`
	- `<textarea value={state.bio} />`
	- JS 구조분해 할당 개념 이용!

---

<br><br>

#### b. onChange로 통합 방법

- `[e.target.name]: e.target.value,` : 'a) JS의 `Computed` 객체(계산된 객체) 개념 사용'

<br>
- `<input name="name" />` : 'b) 이렇게 name을 설정해서 이벤트 객체의 `키` 값으로 사용'

<br>

```jsx
import "./Body.css";
import { useState } from "react";

export default function Body() {
  const [state, setState] = useState({
    name: "",
    gender: "",
    bio: "",
  });

  const onChange = (e) => {
    console.log(e.target.name + " : " + e.target.value);
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="body">
      <div>
        <input
          name="name"
          placeholder="이름"
          value={state.name}
          onChange={onChange}
        />
      </div>
      <div>
        <select
          name="gender"
          value={state.gender}
          onChange={onChange}
        >
          <option value="">밝히지 않음</option>
          <option value="male">남성</option>
          <option value="female">여성</option>
        </select>
      </div>
      <div>
        <textarea
          name="bio"
          value={state.bio}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

```



---

<br><br>

### 7) Ref**

- 특정 DOM 요소에 직접 접근할 수 있다. 

- 또는, DOM의 값을 유지하도록하고 '참조하는 메서드'라고도 부른다. 직접 접근하여 조작이 가능하다.

- DOM에 직접 접근하지 않고 값을 참조만 가능!!

- 보통은 '유효성 검사' 시에 사용된다.('회원가입' 등등에서)

---

<br>

#### a. 실습 코드 :

- useRef를 사용하여 특정 DOM 요소에 접근하여 제어가 가능하다.

- import 부분, 변수 선언 부분, 컨트롤러 부분, 뷰 부분으로 나누어 React 앱을 실행시킨다.

```jsx
import "./Body.css";
import { useState, useRef } from "react";

export default function Body() {
  const nameRef = useRef();
  const [state, setState] = useState({
    name: "",
    gender: "",
    bio: "",
  });

  const onChange = (e) => {
    console.log(e.target.name + " : " + e.target.value);
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  const onSubmit = () => {
    if (state.name === "") {
      nameRef.current.focus();
    }
  };

  return (
    <div className="body">
      <div>
        <input
          ref={nameRef}
          name="name"
          placeholder="이름"
          value={state.name}
          onChange={onChange}
        />
      </div>
      <div>
        <select
          name="gender"
          value={state.gender}
          onChange={onChange}
        >
          <option value="">밝히지 않음</option>
          <option value="male">남성</option>
          <option value="female">여성</option>
        </select>
      </div>
      <div>
        <textarea
          name="bio"
          value={state.bio}
          onChange={onChange}
        />
      </div>
      <div>
        <button onClick={onSubmit}>회원가입</button>
      </div>
    </div>
  );
}

```


---

<br><br>

### 8) 추가 : JS 리터럴 개념**

- JS 객체 리터럴 = {key : value} 형태의 객체

<br>
- JS 템플릿 리터럴 = '${state.name}'

<br>
- JS 구조분해 할당 개념 이용!
	- `<textarea value={state.bio} />`에서
		- `state.bio`
	
	
<br>
- React 앱 구성 : import 부분, 변수 선언 부분, 컨트롤러 부분, 뷰 부분으로 나누어 React 앱을 실행시킨다.


---

<br><br>

# 4. 프로젝트 1 : 카운터 앱

### 1) UI 구성 

- html과 css 이용하기 
	- html의 section 태그로 구성하기

<br>
- 간단하게 UI 구성 

---

<br>

	
#### a. 실습 코드 :


- App.jsx

```jsx
import "./App.css";
import Controller from "./components/Controller";
import Viewer from "./components/Viewer";

function App() {
  return (
    <div className="App">
      <h1>Simple Counter</h1>
      <section>
        <Viewer />
      </section>
      <section>
        <Controller />
      </section>
    </div>
  );
}

export default App;

```

<br>
- View.jsx

```jsx
export default function Viewer() {
  return (
    <div>
      <div>현재 카운트 : </div>
      <h1>0</h1>
    </div>
  );
}
```



<br>
- Controller.jsx

```jsx
export default function Controller() {
  return (
    <div>
      <button>-1</button>
      <button>-10</button>
      <button>-100</button>
      <button>+100</button>
      <button>+10</button>
      <button>+1</button>
    </div>
  );
}
```


---


<br><br>

### 2) 기능 구현하기** 

- 리액트의 모든 컴포넌트는 계층 구조를 이룬다.
	- 여러 컴포넌트들은 부모, 자식관계르 가지고 있어야 한다.
	
<br>	

#### a. State Lifting(State 끌어올리기)**

- 데이터를 넘겨줄 때는 무조건 부모, 자식 관계이여야 한다.

- State들이 공유할 수 있도록 공통 부모가 되는 곳에 State를 끌어 올려서 컴포넌트를 설계해야 한다.

<br>

#### b. 단방향 데이터 흐름**

- 데이터의 흐름을 파악하기 쉽다.

- 아무리 복잡한 어플리케이션을 만들더라도 데이터 흐름 파악이 직관적이다.

- 따라서, 부모에서 자식으로 State를 Props시킨다.

---

<br>
	
#### c. 실습 코드 :

- 중요** : 어느 곳에 State를 보관할 것인지 선택하는 과정!!
	- 즉, 어떤 컴포넌트가 그 State를 가지게 할 것인가? 

- App.jsx**

```jsx
import "./App.css";
import Controller from "./components/Controller";
import Viewer from "./components/Viewer";

function App() {
  const [count, setCount] = useState(0);
 
  const onClickButton = (value) => {
    setCount(count + value);
  }
  
  return (
    <div className="App">
      <h1>Simple Counter</h1>
      <section>
        <Viewer count={count}/>
      </section>
      <section>
        <Controller onClickButton={onClickButtton}/>
      </section>
    </div>
  );
}

export default App;

```

<br>
- View.jsx

```jsx
export default function Viewer(props) {
  return (
    <div>
      <div>현재 카운트 : </div>
      <h1>{props.count}</h1>
    </div>
  );
}

// 구조분해 할당도 이용가능!! 
export default function Viewer({ count }) {
  return (
    <div>
      <div>현재 카운트 : </div>
      <h1>{count}</h1>
    </div>
  );
}
```



<br>
- Controller.jsx

```jsx
export default function Controller({ onClickButton }) {
  return (
    <div>
      <button 
        onClick = {() => {
          onClickButton(-1);
        }}
      >
        -1
      </button>
      <button
        onClick = {() => {
          onClickButton(-10);
        }}
      >
        -10
      </button>
      <button
        onClick = {() => {
          onClickButton(-100);
        }}
       >
         -100
      </button>
      <button
        onClick = {() => {
          onClickButton(100);
        }}
       >
         +100
      </button>
      <button
        onClick = {() => {
          onClickButton(10);
        }}
      >
        +10
      </button>
      <button
        onClick = {() => {
          onClickButton(1);
        }}
      >
        +1
      </button>
    </div>
  );
}
```
	
	
---

<br><br>

# 5. 라이프 사이클, 개발자 도구, React Hook
	
### 1) React 라이프 사이클

<br>

#### a. React 라이프 사이클 개념 정리


- Mount, Update, Unmount

<br>
- Mount(탄생) : 
	- 컴포넌트가 화면에 렌더링 된다. 
	- 서버에서 데이터를 불러온다. 

<br>
- Update(변화) :
	- 컴포넌트가 리렌더 된다.
	- 어떤 값이 변경되었는지 콘솔에 출력


<br>
- Unmount(죽음) :
	- 컴포넌트가 화면에서 제거 된다.
	- 컴포넌트가 사용하던 메모리 정리 및 해제

<br>
- 중요** : 이 모든 라이프사이클은 useEffect 함수를 이용하면 쉽게 제어할 수 있다.**

---

<br><br>

#### b. React 라이프 사이클 제어하기

- 라이프 사이클 제어하기

<br>

##### a) Update 제어 

- useEffect의 2번째 인자를 제어하면, Update로서 동작한다.

<br>
- useEffect는 처음 렌더링 시(마운트), 동작하므로, `isMountRef.current`를 조건문(if문)으로 걸어주어서 처음 컴포넌트가 렌더링 시에는 제외하고 그 이후 Update 시, 코드가 동작하도록 한다.

<br> 

```jsx
  useEffect(() => {
    if (!isMountRef.current) {
      isMountRef.current = true;
      return;
    }
    console.log("업데이트");
  });

```


<br>

##### b) Mount 제어 

- deps인 2번째 인자에 빈 배열로 설정하면 아무 일도 동작하지 않아서 Mount로만 동작할 때, 코드가 동작한다.

<br>

```jsx
  useEffect(() => {
    console.log("마운트");
  }, []);
```


<br>

##### c) Unmount 제어**

- 2번째 인자에 빈 배열 배열 추가하면 아무 일도 동작하지 않아서 Mount로 동작한다.

<br>
- useEffect 함수 이내의 반환되는 것도 함수로 반환한다.

<br>
- useEffect의 첫번째 인자인 콜백함수 안에서 	새로운 함수를 리턴하고 있는 것이다.

<br>
- useEffect의 첫번째 인자인 콜백함수 안에서 새로운 함수를 반환하게 되면, 이렇게 반환된 함수는 이 useEffect의 콜백함수가 다시 호출되기 전이나 또는 useEffect를 가지고 있는 컴포넌트가 Unmount일 때 실행이 된다. 

<br>
- 정리하면, 2가지 방식으로 다시 새로운 함수가 실행되는데
	- 즉, 첫번째 이유로는 Unmount일 때, 실행되거나 두번째 이유는 콜백함수가 다시 실행될 때, useEffect의 첫번째 인자인 콜백함수 안에서 새로운 함수를 실행할 수 있다.

<br>
- 그렇지만 `deps`(dependency array)에 빈 배열을 전달하면 Mount 시점에 한 번만 호출 된다. 즉, useEffect의 콜백함수는 두 번 다시는 호출되지 않아서 위에서 조건인 두번째 조건은 만족하지 않아서 Unmount일 때만 동작한다. 

<br>
- 중요** : `deps`로 빈 배열로 설정해두면, 오직 컴포넌트가 언마운트될 때만 실행되는 코드를 작성할 수 있다. 

<br>

```jsx
import { useEffect } from "react";

export default function Even() {
  useEffect(() => {
    return () => {
      console.log("EVEN 언마운트");
    };
  }, []);

  return <div>짝수입니다</div>;
}

```

---

<br>

##### d) 실습코드**

```jsx
import "./App.css";
import { useState, useEffect, useRef } from "react";
import Controller from "./components/Controller";
import Viewer from "./components/Viewer";
import Even from "./components/Even";

function App() {
  const isMountRef = useRef();
  const [count, setCount] = useState(0);

  const onClickButton = (value) => {
    setCount(count + value);
  };

  useEffect(() => {
    console.log("마운트");
  }, []);

  useEffect(() => {
    if (!isMountRef.current) {
      isMountRef.current = true;
      return;
    }
    console.log("업데이트");
  });

  return (
    <div className="App">
      <h1>Simple Counter</h1>
      <section>
        <section>
          <Viewer count={count} />
          {count % 2 === 0 && <Even />}
        </section>
      </section>
      <section>
        <Controller onClickButton={onClickButton} />
      </section>
    </div>
  );
}

export default App;

```




---

<br><br>

### 2) React 개발자 도구

- 크롬의 웹스토어에서 `react developer tools` 검색

<br>
- 설정에서 사용을 클릭하고
	- 사이트 액세스는 `모든 사이트에서`로 설정!
	- `시크릿 모드에서 허용`나 `파일 URL에 대한 액세스 허용`도 설정 ON하자!

<br>
- 크롬의 개발자 모드에서 개발 중인 리액트의 앱에서는 새로 고침 시, `react developer tools`가 주황색 아이콘으로 동작하게 된다.

<br>
- 이곳에서는 컴포넌트의 계층 구조로서 컴포넌트의 정보를 확인 할 수  있다.
	- State, Props, ref, useEffect 등등 확인  가능
	- Props는 임의로 수정 가능

<br>
- 톱니바퀴 모양인 설정에서 `highlight updates when components render`를 설정 On하면, 어떤 컴포넌트가 켜졌는지 확인할 수 있다.


<br>
- 정리 : 크롬의 디버깅을 하는 것과 같다.
	- 더 세분화되어 있다.


---

<br><br>

### 3) React Hook 등장 배경


- 함수 컴포넌트에서 리액트가 제공하는 다양한 기능을 사용할 수 있도록 도와주는 메서드


<br>

#### a. 기존에 알아본 Hooks :

- `useState`, `useRef`, `useEffect`
	
	
	
<br>

---

#### b. 추후 알아볼 Hooks : 

- useReducer

- useCallBack

- useMemo

- useContext

- useLayoutEffect

- useTransition

- useDefferedValue


	
<br>

---

#### c. 이전 Hooks의 문제점 :

- 기존의 클래스 컴포넌트는 모든 기능을 이용할 수 있다. 함수 컴포넌트는 아무런 기능도 못 쓴다. 그저 UI만 렌더링 하는 컴포넌트이다.

<br>

- 클래스 컴포넌트는 이러한 장점들이 많아도 클래스의 JS 문법으로만 만들어야 해서 코드량이 매우 많고 매우 복잡하다. 

<br>

- 함수 컴포넌트는 비교적 문법이 간결하고 코드량이 짧다. 그래서, 함수 컴포넌트로 리액트 앱의 모든 것을 개발하려고 했지만, 클래스 컴포넌트의 좋은 장점인 다양한 기능들을 이용하지 못해서 아쉬움이 많았다.

<br><br>

- 결론 : 그래서, 등장한 것이 함수 컴포넌트에서도 클래스 컴포넌트의 좋은 기능을 낚아채듯이 가져와서 사용할 수 있듯이 리액트 개발팀에서는 `다양한 Hooks 메서드`를 소개하게 되었다.

<br>

- 다양한 Hooks 메서드 : 클래스 컴포넌트의 다양한 기능을 사용할 수 있는 장점을 이용할 수 있으며, 이제는 간결한 문법도 이용할 수 있다.


---

<br><br>


### 4) Custom Hooks 필요한 이유

- 클래스 컴포넌트의 다양한 기능을 사용할 수 있는 장점을 이용할 수 있으며, 이제는 간결한 문법도 이용할 수 있다.

- `Custom Hooks` :
	- 이런 리액트 Hooks를 입맛대로 커스텀하는 기능이다.

<br>

#### a. Custom Hooks이 필요한 이유

<br>
##### a) 기존의 State를 이용하는 과정 :

- 1) 새로운 State	 생성 

- 2) 이벤트 핸들러 함수 생성 

- 3) input 태그에 value, onChange 설정


<br><br>

##### b) 기존의 Ref를 이용하는 과정 :

- 1) 컴포넌트가 이미 마운트 되었는지 저장할 Ref 생성

- 2) 컴포넌트가 업데이트될 때, 실행하고자 하는 함수

- 3) 컴포넌트가 업데이트 될 때에만 onMount 함수 호출


<br>
##### c) 여기서 문제점 발생 :

- 다양한 컴포넌트에서 같은 동작을 시키고 싶은 State와 Ref가 있다면, 중복 코드가 발생해서 코드량이 많아 진다. 

<br>
- 즉, 예를 들면, Header, Body, Footer 컴포넌트에 업데이트 라이프 사이클 로직이 각각 필요하다면 말이다. 각각의 컴포넌트에 업데이트 라이프 사이클 로직을 심어줘야 한다.

<br>
- 중요** : 
	- React Hooks는 일반 함수에서 호출할 수 없기 때문에 위의 문제점이 여전히 발생한다. 
	- 즉, 같은 컴포넌트 내부에서만 호출이 가능하며, 또 다른 React Hoooks(Custom Hook 포함)에서만 호출이 가능하다.

- 결론** :
	- Custom Hook을 만들어 로직을 분리하면 된다 

---

<br><br>


##### d) Custom Hook 실습 코드** :

- 1) JS 파일로 만들어야 한다. 파일의 이름을 기존의 Hooks들처럼 `useXXX`로 바꾸고 파일 내부의 컴포넌트 이름도 `useXXX`로 변경하면, `Custom Hook`을 사용할 수 있다.

<br>
- 2) JS 파일의 이름과 컴포넌트의 이름은 동일하게 만들고 그 안에서 `useRef()`와 `useEffect()`를 사용하면 된다. useEffect()는 업데이트 시, 동작 시킬 `콜백함수`를 함께 사용해도 된다. 

<br><br>

- useUpdate.js
	- cb()는 업데이트 시, 동작시킬 '콜백함수'

```js
import { useEffect, useRef } from "react";

export default function useUpdate(cb){
	const isMounRef = useRef(false);
	
	useEffect(() => {
		if(!isMountRef.current){
			isMountRef.current = true;
			return;
		}
		cb();
	});
}

```

<br>

- App.jsx

```jsx
import useUpdate from "../hook/useUpdate";

export default function App() {
	useUpdate(onMount);
	
	const onMount = () => {
		console.log("App 컴포넌트 업데이트");
	};
	
	return <>...</>; 
}
```


---

<br><br>

- 초기 코드의 변경되는 과정들 : 
	- 아래 코드에서 onUpdate 파일의 이름을 useXXX로 바꾸고 컴포넌트의 이름도 useXXX로 변경하면, Custom Hook을 사용할 수 있다.
	- onUpdate -> useUpdate
	
<br>

- 1) App.jsx

```jsx
import { useEffect, useRef } from "react";

export default function App() {
	const isMounRef = useRef(false);
	
	const onMount = () => {
		console.log("App 컴포넌트 업데이트");
	}
	
	useEffect(() => {
		if(!isMountRef.current){
			isMountRef.current = true;
			return;
		}
		onMount();
	});
}
```

<br>

- 2) onUpdate.js

```js
import { useEffect, useRef } from "react";

export default function onUpdate(){
	const isMounRef = useRef(false);
	
	const onMount = () => {
		console.log("App 컴포넌트 업데이트");
	}
	
	useEffect(() => {
		if(!isMountRef.current){
			isMountRef.current = true;
			return;
		}
		onMount();
	});
	
}


```

---

<br><br>


### 5) Custom Hooks 실습

- `src/hooks`의 경로에서 Custom Hooks 생성

- useInput.js

```js
import { useState } from "react";

export default function useInput() {
  const [value, setValue] = useState("");
  const onChange = (e) => {
    setValue(e.target.value);
  };
  return [value, onChange];
}

```

<br>
- useUpdate.js

```js

import { useRef, useEffect } from "react";

export default function useUpdate(cb) {
  const isMountRef = useRef(false);

  useEffect(() => {
    if (!isMountRef.current) {
      isMountRef.current = true;
      return;
    }
    cb();
  });
}
```

---

<br>

- App.jsx

```jsx
import "./App.css";
import { useState } from "react";
import Controller from "./components/Controller";
import Viewer from "./components/Viewer";
import Even from "./components/Even";
import useUpdate from "./hooks/useUpdate";
import useInput from "./hooks/useInput";

function App() {
  const [count, setCount] = useState(0);
  const [text, onChangeText] = useInput("");

  const onClickButton = (value) => {
    setCount(count + value);
  };

  useUpdate(() => {
    console.log("APP UPDATE");
  });

  return (
    <div className="App">
      <h1>Simple Counter</h1>
      <section>
        <section>
          <Viewer count={count} />
          {count % 2 === 0 && <Even />}
        </section>
      </section>
      <section>
        <Controller onClickButton={onClickButton} />
      </section>
      <input value={text} onChange={onChangeText} />
    </div>
  );
}

export default App;

```


<br>

- Controller.jsx

```jsx
import useUpdate from "../hooks/useUpdate";

export default function Controller({ onClickButton }) {
  useUpdate(() => {
    console.log("Controller UPDATE");
  });
  return (
    <div>
      <button onClick={() => onClickButton(-1)}>-1</button>
      <button onClick={() => onClickButton(-10)}>
        -10
      </button>
      <button onClick={() => onClickButton(-100)}>
        -100
      </button>
      <button onClick={() => onClickButton(100)}>
        +100
      </button>
      <button onClick={() => onClickButton(10)}>+10</button>
      <button onClick={() => onClickButton(1)}>+1</button>
    </div>
  );
}

```

---

<br><br>

# 6. 프로젝트 2 : Todo 앱

### 1) UI 구성

- 컴포넌트를 만드는 방법과 CSS 및 퍼블리싱도 중요!

<br><br>

- App.jsx

```jsx
import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import TodoEditor from './components/TodoEditor'
import TodoList from './components/TodoList'

function App() {

  return (
    <div className="App">
      <Header />
      <TodoEditor />
      <TodoList />
    </div>
  )
}

export default App

```

---

<br>

- Header.jsx


```jsx
import "./Header.css";   // import가 중요!!

export default function Header() {
    return <div className="Header">
        <h1>
            {new Date().toDateString()}
        </h1>
    </div>;
}

```


---

<br>

- TodoEditor.jsx


```jsx
import "./TodoEditor.css";

export default function TodoEditor(){
    return (
        <div className="TodoEditor">
            <input placeholder="새로운 Todo ..."/>
            <button>추가</button>
        </div>
    );
}
```


---

<br>

- TodoList.jsx


```jsx
import "./TodoList.css";
import TodoItem from "./TodoItem";

export default function TodoList(){
    return (
        <div className="TodoList">
            <h4>Todos</h4>
            <input placeholder="검색어를 입력하세요"/>
            <div className="todos_wrapper">
                <TodoItem />
                <TodoItem />
                <TodoItem />
                <TodoItem />
            </div>
        </div>
    );
}
```




---

<br>

- TodoItem.jsx


```jsx

import "./TodoItem.css";

export default function TodoItem(){
    return (
        <div className="TodoItem">
            <input type="checkbox"/>
            <div className="content">투두</div>
            <div className="date">작성일</div>
            <button>삭제</button>
        </div>
    );
}
```


---

<br><br>

### 2) 기능 구현을 위한 샘플 데이터 준비 

- State 초기 개발 테스트을 위한 샘플 데아터 마련

<br><br>

- App.jsx

```jsx
import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import TodoEditor from './components/TodoEditor'
import TodoList from './components/TodoList'

// State 초기 개발 테스트을 위한 샘플 데아터 마련
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
  }
]

function App() {

  const [todos, setTodos] = useState(mockData);

  return (
    <div className="App">
      <Header />
      <TodoEditor />
      <TodoList />
    </div>
  )
}

export default App

```

<br><br>

- 리액트 개발자 도구에서 위에서 생성된 개발을 위한 샘플 데이터인 State 확인

```jsx
[
  {
    "name": "State",
    "value": [
      {
        "id": 0,
        "isDone": true,
        "content": "React 공부하기",
        "createdDate": 1697554083178
      },
      {
        "id": 1,
        "isDone": false,
        "content": "빨래 널기",
        "createdDate": 1697554083178
      },
      {
        "id": 2,
        "isDone": true,
        "content": "음악 연습하기",
        "createdDate": 1697554083178
      }
    ],
    "subHooks": [],
    "hookSource": {
      "lineNumber": 41,
      "functionName": "App",
      "fileName": "http://localhost:5173/src/App.jsx?t=1697554083389",
      "columnNumber": 29
    }
  }
]
```



---

<br><br>

### 3) 등록 기능 구현

- Props로 State 넘겨주고 넘겨받은 State를 새로운 컴포넌트에서 인자로 사용하는 과정 중요!

- 설계 시, 컴포넌트 간에 어떤 State와 함수를 넘겨줄지, 잘 설계해야 한다.

<br>

#### a. 실습 코드

- App.jsx
	- 중요 1 : 시퀀스처럼 id가 자동적으로 증가하도록 하는 방법
	- 중요 2 : 리스트에서 새로운 목록 추가하는 방법 : 예전에 부모, 자식의 시블링에서 해본 듯

```jsx
import { useState, useRef } from 'react'
import './App.css'
import Header from './components/Header'
import TodoEditor from './components/TodoEditor'
import TodoList from './components/TodoList'

// State 초기 개발 테스트을 위한 샘플 데아터 마련
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
  }
]

function App() {
  const [todos, setTodos] = useState(mockData);
  const idRef = useRef(3);  // 위의 샘플 데이터 때문에 id는 3번부터 시작

  // 1. 시퀀스처럼 id가 자동적으로 증가하도록 하는 방법, 중요!!
  // 2. 리스트에서 새로운 목록 추가하는 방법 : 예전에 부모, 자식의 시블링에서 해본 듯
  const onCreate = (content) => {
    const newTodo = {
      id: idRef.cuurent++,
      isDone: false,
      content,
      createDate: new Date().getTime(),
    }
    setTodos([...todos, newTodo]);
  }

  return (
    <div className="App">
      <Header />
      <TodoEditor onCreate={onCreate} />
      <TodoList />
    </div>
  )
}

export default App

```


---

<br><br>

- TodoEditor.jsx
	- 중요 1 : State 상태 변화 관리 함수 설정!
	- 중요 2 : 필수 입력 값이 비어있으면 유효성 검사하는 것처럼 포커싱가도록 하는 방법

```jsx
import "./TodoEditor.css";
import { useState, useRef } from "react";

export default function TodoEditor({ onCreate }){

    const inputRef = useRef();
    const [content, setContent] = useState("");

    // State 상태 변화 관리 함수 설정!
    const onChangeContent = (e) => {
        setContent(e.target.value);
    }

    // 필수 입력 값이 비어있으면 유효성 검사하는 것처럼 포커싱가도록
    const onClick = () => {
        if(content == ""){
            inputRef.current.focus();
            return;
        }
        onCreate(content);
        setContent("");
    }

    // 입력 시, 키보드 입력에 관한 추가 기능!
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

### 4) 조회 기능 구현**

- Props로 State 넘겨주고 넘겨받은 State를 새로운 컴포넌트에서 인자로 사용하는 과정 중요!

<br>
- React에서는 'map' 메서드가 for-each문과 같게 동작해서 객체의 인자를 하나씩 꺼내는 과정이 가능하여 매우 중요하다!!
	- map은 새로운 콜백함수를 반환한다.

<br><br>
- TodoList.jsx
	- filter 사용하는 과정 중요!!(괄호 주의!! 
	- map도 주의!! 마치 for-each문과 같아서 TodoItem에도 id를 심어줘야 한다.


```jsx
import { useState } from "react";
import TodoItem from "./TodoItem";
import "./TodoList.css";

export default function TodoList({ todos }) {
    const [search, setSearch] = useState("");

    const onChangeSearch = (e) => {
        setSearch(e.target.value);
    };

    // filter 사용하는 과정 중요!!(괄호 주의!! 아래 map도 주의!!)
    // toLowerCase를 양쪽에 써서 대소문자 구분 없음.
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

    return (
        <div className="TodoList">
            <h4>Todos</h4>
            <input 
                value={search}
                onChange={onChangeSearch}
                placeholder="검색어를 입력하세요"
            />
            <div className="todos_wrapper">
                {filterTodos().map((todo) => (
                    <TodoItem key={todo.id} {...todo}/>
            // for-each문과 같아서 odoItem에도 id를 심어줘야 한다.
                ))}
            </div>
        </div>
    );
}
```

---

<br><br>

- TodoItem.jsx

```jsx
import "./TodoItem.css";

export default function TodoItem({
    content,
    createDate,
    isDone,
    id,
}) {
    return (
        <div className="TodoItem">
            <input type="checkbox" checked={isDone} />
            <div className="content">{content}</div>
            <div className="date">
                {new Date(createDate).toLocaleDateString()}
            </div>
            <button>삭제</button>
        </div>
    );
}
```



---

<br><br>

### 5) 수정 기능 구현**

- 리액트 앱에서는 부모 컴포넌트에서 컴포넌트를 제어하는 컨트롤러를 만들고, 자식 컴포넌트는 이러한 컨트롤러를 넘겨 받아 로직에 사용하며, id만을 부모 컴포넌트로 다시 넘겨준다.

<br>

- 즉, React에서는 주로 자식컴포넌트에서는 id만 넘겨주고 부모컴포넌트에서 컨트롤한다.
	- 이러한 방식은 희안하다. 이렇게 할 수 밖에 없는 이유는 `Props`로서 `State`(상태 변화 관리)가 부모 자식간의 관계에서만 공유되기 때문이다!
	- Vue.js에서도 emit를 사용하면, 이러한 방식으로 구성할 수 있을 것 같다. 부모에서만 컴포넌트에 관한 공통 컨트롤러를 가지고 있을 수 있기 때문이다. 

<br>	

- 추가로 여기서, TodoList.jsx 단순히 징검다리 역할만 해준다. 뒤에서 이렇게 불필요하게 함수를 단순히 넘겨받는 과정을 해결할 수 있다.

<br>	

- 최종적으로 아래의 로직을 구현하면, 앞에서 '4)' 내용에서는 체크박스가 체크가 되지 않았는데, 체크박스를 On/Off 할 수 있다.

---

<br><br>

#### a. 실습코드 : 

- App.jsx
	- map에서 3항연산 사용 방법!!
	- `if-else`문보다 더 간단하다!!


```jsx
import { useState, useRef } from 'react'
import './App.css'
import Header from './components/Header'
import TodoEditor from './components/TodoEditor'
import TodoList from './components/TodoList'

// State 초기 개발 테스트을 위한 샘플 데아터 마련
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
  }
]

function App() {
  const [todos, setTodos] = useState(mockData);
  const idRef = useRef(3);  // 위의 샘플 데이터 때문에 id는 3번부터 시작

  const onCreate = (content) => {
    const newTodo = {
      id: idRef.cuurent++,
      isDone: false,
      content,
      createDate: new Date().getTime(),
    }
    setTodos([...todos, newTodo]);
  }

  // map에서 3항연산 사용 방법!!
  // if-else문보다 더 간단하다!!
  const onUpdate = (targetId) => {
    setTodos(
      todos.map((todo) =>
      todo.id === targetId
      ? {...todo, isDone: !todo.isDone}
      : todo 
      )
    );
  };

  return (
    <div className="App">
      <Header />
      <TodoEditor onCreate={onCreate} />
      <TodoList todos={todos} onUpdate={onUpdate} />
    </div>
  )
}

export default App;

```

---

<br><br>

- TodoList.jsx
	- 단순히 징검다리 역할만 해준다. 뒤에서 이렇게 불필요하게 함수를 단순히 넘겨받는 과정을 해결할 수 있다.

```jsx
import { useState } from "react";
import TodoItem from "./TodoItem";
import "./TodoList.css";

export default function TodoList({ todos, onUpdate }) {
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

    return (
        <div className="TodoList">
            <h4>Todos</h4>
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
                        onUpdate={onUpdate} />
                        // 단순히 함수를 넘겨받아 그 다음 자삭에게 넘겨주는 징검다리 역할만 해준다.
                ))}
            </div>
        </div>
    );
}
```


---

<br><br>

- TodoItem.jsx
	- React에서는 주로 자식컴포넌트에서는 id만 넘겨주고 부모에서 컨트롤한다.
	- Props로서 State가 부모 자식간의 관계에서만 공유되기 때문이다!

```jsx
import "./TodoItem.css";

export default function TodoItem({
    content,
    createDate,
    isDone,
    id,
    onUpdate,
}) {
    // React에서는 주로 자식컴포넌트에서는 id만 넘겨주고 부모에서 컨트롤한다.
    // Props로서 State가 부모 자식간의 관계에서만 공유되기 때문이다!
    const onChangeCheckbox = () => {
        onUpdate(id);
    }
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
            <button>삭제</button>
        </div>
    );
}
```

---

<br><br>

#### b. 실습 결과

- 리액트 개발자 도구 이용
	- 아래 실습 결과에서 `id: 0`의 `isDone` 값 확인해보기

<br><br>

- 체크박스의 체크 전(업데이트 전)

```jsx
[
  {
    "name": "State",
    "value": [
      {
        "id": 0,
        "isDone": false,
        "content": "React 공부하기",
        "createdDate": 1697712809469
      },
      {
        "id": 1,
        "isDone": false,
        "content": "빨래 널기",
        "createdDate": 1697712809469
      },
      {
        "id": 2,
        "isDone": true,
        "content": "음악 연습하기",
        "createdDate": 1697712809469
      }
    ],
    "subHooks": [],
    "hookSource": {
      "lineNumber": 41,
      "functionName": "App",
      "fileName": "http://localhost:5173/src/App.jsx?t=1697711402248",
      "columnNumber": 29
    }
  },
  {
    "name": "Ref",
    "value": 3,
    "subHooks": [],
    "hookSource": {
      "lineNumber": 42,
      "functionName": "App",
      "fileName": "http://localhost:5173/src/App.jsx?t=1697711402248",
      "columnNumber": 17
    }
  }
]
``` 

---

<br>

- 체크박스의 체크 후(업데이트 후)

```jsx
[
  {
    "name": "State",
    "value": [
      {
        "id": 0,
        "isDone": true,
        "content": "React 공부하기",
        "createdDate": 1697712809469
      },
      {
        "id": 1,
        "isDone": false,
        "content": "빨래 널기",
        "createdDate": 1697712809469
      },
      {
        "id": 2,
        "isDone": true,
        "content": "음악 연습하기",
        "createdDate": 1697712809469
      }
    ],
    "subHooks": [],
    "hookSource": {
      "lineNumber": 41,
      "functionName": "App",
      "fileName": "http://localhost:5173/src/App.jsx?t=1697711402248",
      "columnNumber": 29
    }
  },
  {
    "name": "Ref",
    "value": 3,
    "subHooks": [],
    "hookSource": {
      "lineNumber": 42,
      "functionName": "App",
      "fileName": "http://localhost:5173/src/App.jsx?t=1697711402248",
      "columnNumber": 17
    }
  }
]
``` 


---

<br><br>

### 6) 삭제 기능 구현


#### a. 실습 코드 

- App.jsx
	- Delete가 '!=='인 이유에 관하여 생각해보기 중요!!
	- Delete에서는 삭제된 목록은 빼고 나머지 목록만 보여야하기 때문이다.

```jsx
import { useState, useRef } from 'react'
import './App.css'
import Header from './components/Header'
import TodoEditor from './components/TodoEditor'
import TodoList from './components/TodoList'

// State 초기 개발 테스트을 위한 샘플 데아터 마련
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
  }
]

function App() {
  const [todos, setTodos] = useState(mockData);
  const idRef = useRef(3);  // 위의 샘플 데이터 때문에 id는 3번부터 시작

  const onCreate = (content) => {
    const newTodo = {
      id: idRef.cuurent++,
      isDone: false,
      content,
      createDate: new Date().getTime(),
    }
    setTodos([...todos, newTodo]);
  }

  const onUpdate = (targetId) => {
    setTodos(
      todos.map((todo) =>
      todo.id === targetId
      ? {...todo, isDone: !todo.isDone}
      : todo 
      )
    );
  };

  // Delete는 '!=='인 이유에 관하여 주의!!
  const onDelete = (targetId) => {
    setTodos(todos.filter((todo) => 
      todo.id !== targetId);)
  }

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

<br><br>

- TodoList.jsx
	- 단순히 징검다리 역할

```jsx
import { useState } from "react";
import TodoItem from "./TodoItem";
import "./TodoList.css";

export default function TodoList({ todos, onUpdate, onDelete }) {
    const [search, setSearch] = useState("");

    const onChangeSearch = (e) => {
        setSearch(e.target.value);
    };

    // filter 사용하는 과정 중요!!(괄호 주의!! 아래 map도 주의!!)
    // toLowerCase를 양쪽에 써서 대소문자 구분 없음.
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

    return (
        <div className="TodoList">
            <h4>Todos</h4>
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
                        onDelete={onDelete} />
            // for-each문과 같아서 TodoItem에도 id를 심어줘야 한다.
                ))}
            </div>
        </div>
    );
}
```

<br><br>

- TodoItem.jsx
	- 부모 컴포넌트로부터 넘겨받은 Delete 함수는 자식컴포넌트에서 id만 부모에게 넘겨주고 대신 부모에서 함수가 동작하여 컨트롤한다.

    
```jsx
import "./TodoItem.css";

export default function TodoItem({
    content,
    createDate,
    isDone,
    id,
    onUpdate,
    onDelete
}) {
    const onChangeCheckbox = () => {
        onUpdate(id);
    }

    const onClickDeleteButton = () => {
        onDelete(id);
    }

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
```









