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

### 3) Node.js 라이브러리 사용하기 

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
	- JSX에서 classs는 JS용 예약어이다.

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

### 6) State로 사용자 입력 관리하기**

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
	
	
	
	
	


