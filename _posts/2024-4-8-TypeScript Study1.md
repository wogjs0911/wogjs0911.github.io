---
key: /2024/04/08/TypeScriptStudy1.html
title: TypeScript - TypeScript Study1
tags: typescript
--- 

# 1. TypeScript 개론 

<br>

### 1) TypeScript 실행 순서

- ![이미지](/assets/images/typescript/typescriptbase.png)

<br>
- 타입스크립트 코드의 컴파일 과정에 타입 검사가 포함되어 있기 때문에 타입 스크립트 코드를 컴파일 해서 생성한 자바스크립트 코드는 타입 검사를 통과한 자바스크립트 코드이다. 그러므로 타입 오류가 발생할 가능성이 낮은 안전한 자바스크립트 코드이다. 

<br>
- 타입 오류가 발생하고 있는 타입스크립트 코드는 컴파일 시, 타입 검사를 통과할 수 없기 때문에 자바스크립트 코드로 변환되지 않아 실행할 수 없게 된다.

<br>
- 또 다른 사실은 타입스크립트에 작성한 타입 관련 코드들은 결국 자바스크립트로 변환될 때 사라지게 되어 프로그램 실행에 영향을 미치지는 않는다.

<br>
- 정리하자면 결국 타입스크립트는 컴파일 결과 타입 검사를 거쳐 자바스크립트 코드로 변환되는데 이때 만약 코드에 오류가 있다면 컴파일 도중 실패하게 되므로 자바스크립트를 보다 더 안전하게 사용하는 미리 한번 코드를 검사하는 용도로 사용된다고 볼 수 있다.
	
---

<br><br>
	
# 2. TypeScript 기본

### 1) 타입 별칭

- 객체 -> 타입 별칭으로 java의 entity처럼 선언해놓고 사용한다.

<br>
- 참고로 동일한 스코프에 동일한 이름의 타입 별칭을 선언하는 것은 불가능합니다. 마치 변수 선언과 유사합니다.

---

<br>
	
#### a. 인덱스 시그니처

- 객체 타입을 유연하게 정의할 수 있도록 가능

<br>
- 1개의 객체에 파라미터가 많을 때, 뭉쳐서 한번에 처리 가능!!

<br>
- `[key : string] : string`은 인덱스 시그니쳐 문법으로 이 객체 타입에는 key가 string 타입이고 value가 string 타입인 모든 프로퍼티를 포함된다 라는 의미. 

```typescript
type CountryCodes = {
  [key: string]: string;
};
```

<br><br>

- 반드시 포함해야 하는 프로퍼티가 있다면 다음과 같이 직접 명시!

```typescript
// 추가적으로 국가코드 말고도 국가번호용 객체 설정
type CountryNumberCodes = {
  [key: string]: number;
  Korea: number;
};
```

- 주의 사항** : 
	- 인덱스 시그니쳐를 사용하면서 동시에 추가적인 프로퍼티를 또 정의할 때에는 인덱스 시그니쳐의 value 타입과 직접 추가한 프로퍼티의 value 타입이 호환되거나 일치해야 된다. 
	- 따라서, 다음과 같이 서로 호환되지 않는 타입으로 설정하면 오류가 발생된다.

```typescript
type CountryNumberCodes = {
  [key: string]: number;
  Korea: string; // 오류!
};
```


---

<br>
	
#### b. 열거 타입 

- 열거형은 다음과 같이 여러개의 값을 나열하는 용도로 사용!

<br><br>
	
##### a) 기본 열겨형

- enum 멤버에 숫자 값을 직접 할당하지 않아도 0 부터 1씩 늘어나는 값으로 자동으로 할당된다.

```typescript
// enum 타입
// 여러가지 값들에 각각 이름을 부여해 열거해두고 사용하는 타입

enum Role {
  ADMIN, // 0 할당(자동)
  USER,  // 1 할당(자동)
  GUEST, // 2 할당(자동)
}

const user1 = {
  name: "이정환",
  role: Role.ADMIN, // 0
};

const user2 = {
  name: "홍길동",
  role: Role.USER, // 1
};

const user3 = {
  name: "아무개",
  role: Role.GUEST, // 2
};
```

<br><br>

- 이 값을 변경하고 싶다면 다음과 같이 시작하는 위치에 값을 직접 할당해주면 된다. 그럼 자동으로 그 아래의 멤버들은 1씩 증가된 값으로 할당된다.

```typescript
// enum 타입
// 여러가지 값들에 각각 이름을 부여해 열거해두고 사용하는 타입

enum Role {
  ADMIN = 10, // 10 할당 
  USER,       // 11 할당(자동)
  GUEST,      // 12 할당(자동)
}

const user1 = {
  name: "이정환",
  role: Role.ADMIN, // 10
};

const user2 = {
  name: "홍길동",
  role: Role.USER, // 11
};

const user3 = {
  name: "아무개",
  role: Role.GUEST, // 12
};

```

<br><br>
	
##### b) 문자열 열거형

- 국가별 언어를 열거하는 enum이 필요하다면 각 멤버에 문자열 값을 할당하면 된다. 오타같은 실수를 줄임!

```typescript
enum Role {
  ADMIN,
  USER,
  GUEST,
}

enum Language {
  korean = "ko",
  english = "en",
}

const user1 = {
  name: "이정환",
  role: Role.ADMIN, // 0
  language: Language.korean,// "ko"
};

```

---

<br><br>
	
### 2) Enum

- enum은 컴파일 결과 객체가 된다. enum은 컴파일될 때 다른 타입들 처럼 사라지지 않고 자바스크립트 객체로 변화된다. 따라서 우리가 위에서 했던 것 처럼 값으로 사용할 수 있는 것이다.



```typescript
var Role;
(function (Role) {
    Role[Role["ADMIN"] = 0] = "ADMIN";
    Role[Role["USER"] = 1] = "USER";
    Role[Role["GUEST"] = 2] = "GUEST";
})(Role || (Role = {}));
var Language;
(function (Language) {
    Language["korean"] = "ko";
    Language["english"] = "en";
    Language["japanese"] = "jp";
})(Language || (Language = {}));
const user1 = {
```

 ---

<br><br>
	
### 3) any 타입, unknown 타입

<br>
	
#### a. Any 타입

- 특별한 타입으로 타입 검사를 받지 않는 특수한 치트키 타입이며 원래 타입스크립트의 변수의 타입이 변수를 초기화할 때 초기화 하는 값을 기준으로 추론하기 때문에 타입을 지정하지 않으면, 오류가 발생한다. 이럴 때는 Any 라는 치트키 타입을 이용!


```typescript 
let anyVar: any = 10;
anyVar = "hello";

anyVar = true;
anyVar = {};

anyVar.toUpperCase();
anyVar.toFixed();
anyVar.a;
```


- 주의 사항** : any 타입을 최대한 사용하지 말 것!!
	-  any 타입은 타입 검사를 받지 않는 타입이므로 모든 타입스크립트의 문법과 규칙으로부터 자유롭지만 그만큼 위험한 타입이다.
	- 사실 타입스크립트를 사용하는 이유가 없다. 따라서 정말 어쩔 수 없는 경우를 제외하고는 any 타입을 사용하지 않는것을 강력히 권장한다.


<br><br>
	
#### b. Unknown 타입 

- unknown 타입은 독특하게도 변수의 타입으로 정의되면 모든 값을 할당받을 수 있다.

```typescript
let unknownVar: unknown;

unknownVar = "";
unknownVar = 1;
unknownVar = () => {};
```

<br><br>

- 반대로 unknown 타입의 값은 그 어떤 타입의 변수에도 할당할 수 없고, 모든 연산에 참가할 수 없게 된다. 쉽게 정리하면 오직 값을 저장하는 행위밖에 할 수 없게 된다. 

```typescript
let num: number = 10;
(...)

let unknownVar: unknown;
unknownVar = "";
unknownVar = 1;
unknownVar = () => {};

num = unknownVar; // 오류 !
```

<br><br>

- 아래 코드처럼, unknown 타입의 값은 어떤 연산에도 참여할 수 없으며, 어떤 메서드도 사용할 수 없다.

```typescript
let unknownVar: unknown;
(...)

unknownVar * 2 // 오류!
```

<br><br>

- 타입스크립트에서는 아래 코드처럼 조건문을 이용해 특정 값이 특정 타입임을 보장할 수 있게 되면 해당 값의 타입이 자동으로 바뀐다. 이를 ‘타입 좁히기’라고 하며 3섹션에서 자세히 다룬다.
	- 따라서, 특정 변수가 당장 어떤 값을 받게 될 지 모른다면 any 타입으로 정의하는 것 보단 unknown 타입을 이용하는게 훨씬 안전한 선택이 된다.

```typescript
if (typeof unknownVar === "number") {
	// 이 조건이 참이된다면 unknownVar는 number 타입으로 볼 수 있음
  unknownVar * 2;
}
```

---

<br><br>

### 4) void 타입, never  타입

<br>

#### a. void 타입

- 보통은 다음과 같이 아무런 값도 반환하지 않는 함수의 반환값 타입을 정의할 때 사용한다.


```typescript
// 보통 함수 반환 값으로 사용한다! Java 생각!
function func2(): void {
  console.log("hello");
}
```


```typescript
// 보통 변수에는 사용하지 않는다. Undefined 타입 이외의 다른 타입의 값을 담을 수 없기 때문이다.
let a: void;
a = undefined;
```

<br><br>

- 주의 사항 : tsconfig.json에 엄격한 null 검사(strictNullChecks) 옵션을 해제(False)로 설정하면 특별히 이때에는 void 타입의 변수에 null 값도 담을 수 있게 된다. 

```typescript
// "strictNullChecks: false" 일 경우
let a: void;
a = undefined;
a = null;
```


<br><br>

#### 5.1 버전의 최근 변경 사항** : 현재 5.1 버전으로 업데이트 되어 아래의 내용은 완벽히 일치하지 않는다. 위의 내용을 확인해 최신 버전의 변경 사항을 확인하자!

- 5.1 이전의 버전에서는 각 함수들이 반환 타입으로 설정된 타입으로 반환해야 했지만, 5.1 버전부터는 이러한 내용이 위의 내용으로 변경됨을 확인하면 된다.

```typescript
function func2(): undefined {
  console.log("hello");
  return undefined;
}
```

```typescript
function func2(): null {
  console.log("hello");
  return null;
}
```


```typescript
function func2(): void { // 오류 발생!
  console.log("hello");
}
```

---

<br><br>

#### b. never 타입

- never 타입은 불가능을 의미하는 타입이다. 보통 다음과 같이 함수가 어떠한 값도 반환할 수 없는 상황일 때, 해당 함수의 반환값 타입을 정의할 때 사용된다.

```typescript
// 무한 루프가 도는 경우 -> 종료가 불가능해서 가능하다.
function func3(): never {
  while (true) {}
}
```

<br>

- 무한 루프 외에도 다음과 같이 의도적으로 오류를 발생시키는 함수도 never 타입으로 반환값 타입을 정의할 수 있다. 이렇게 많이 사용될 것 같다. 

```typescript
function func4(): never {
  throw new Error();
}
```

<br>

- 추가** : 변수의 타입을 never로 정의하면 any를 포함해 그 어떠한 타입의 값도 이 변수에 담을 수 없게 된다.

```typescript
let anyVar: any;
(...)

let a: never;
a = 1;
a = null;
a = undefined;
a = anyVar;
```

---

<br><br>

# 3. TypeScript 이해**


### 0) TS가 문법 공부뿐만 아니라 이해를 해야하는 이유?

- [TS 공식 문법 요약 pdf](https://www.typescriptlang.org/cheatsheets)

- TS 문법만 공부하면, 아래 같은 코드를 이해 못한다. 이렇게 딱 봐도 굉장히 복잡해 보이는 이런 타입 정의 문법을 원리 이해도 없이 문법만 달달외워서 쓴다는 건 정말 어려운 일이다. 따라서, TS 이해하는 것이 필요하다!!

```typescript
type ReturnType<T extends (...args: any) => any> = T extends (
  ...agrs: any
) => infer R
  ? R
  : never;
```

---

<br><br>

### 1) 타입은 집합이다

- 부모 타입과 자식 타입 관계를 이해할 줄 알아야 한다.

<br>
- ex) Number(부모 타입) vs Number Literal(자식 타입) 타입 관계 
	- Number Literal 타입은 Number 타입에 속할 수 있지만 그 반대는 안된다.


```typescript 
let num1: number = 10;
let num2: 10 = 10;

num1 = num2;	// 가능!!
```

```typescript 
let num1: number = 10;
let num2: 10 = 10;

num2 = num1;	// 에러 발셍!!
```

- 정리* : 특별히 서브 타입의 값을 슈퍼 타입의 값으로 취급하는 것은 ‘업 캐스팅’ 이라고 부르고 반대는 ‘다운캐스팅’이라고 부른다. 
	- 따라서, 쉽게 정리하면 ‘업캐스팅’은 모든 상황에 가능하지만 ‘다운 캐스팅’은 대부분의 상황에 불가능하다고 할 수 있다.

---

<br><br>

### 2) 타입 계층도의 함께 기본타입 살펴보기
￼
- ![이미지](/assets/images/typescript/TS계층도.png)

<br>

#### a. unknown 타입 (전체 집합)	

- unknown 타입은 타입 계층도의 최상단에 위치한다.

<br>
- unknown 타입 변수에는 모든 타입의 값을 할당할 수 있다. 바꿔 말하면 모든 타입은 unknown 타입으로 '업 캐스트' 할 수 있다. Java의 Object 느낌!!

<br>
- 결국, unknown 타입은 모든 타입을 부분집합으로 갖는 타입스크립트 전체 집합이다.

<br>
- 주의점** : 앞서 ‘다운캐스트’는 예외적인 경우가 아니면 허용되지 않는다고 배웠다. 따라서, unknown 타입의 값은 any를 제외한 어떤 타입의 변수에도 할당할 수 없다.

```typescript
let unknownValue: unknown;

let a: number = unknownValue;
// 오류 : unknown 타입은 number 타입에 할당할 수 없다.
```


<br><br>

---

#### b. never 타입 (공집합 타입)

- ‘never’ 타입은 불가능, 모순을 의미하는 타입이라고 설명한 적이 있었는데 타입이 ‘집합’임을 이해한 지금 ‘never’ 타입을 다시 표현하자면 ‘never’는 공집합을 뜻하는 타입이다. 수학에서의 공집합은 아무것도 포함하지 않는 집합이라는 뜻이다.

<br>
- 아래 코드의 errorFunc 함수는 에러를 발생시킨다. 따라서 이 함수는 정상적으로 종료되지 않는다. 그러므로 어떤 값도 반환할 수 없다. 만약, 이 함수가 어떤 값을 반환한다면 그것은 불가능하며 모순이다.

```typescript
function errorFunc(): never {
  throw new Error();
}
```

<br>

- 공집합은 모든 집합의 부분 집합이다. 그러므로 never 타입은 모든 타입의 서브 타입이다. 따라서 never 타입은 모든 타입으로 업캐스팅 할 수 있다.

```typescript
let neverVar: never;

let a: number = neverVar;            // never -> number
let b: string = neverVar;            // never -> string
let c: boolean = neverVar;           // never -> boolean
let d: null = neverVar;              // never -> null
let e: undefined = neverVar;         // never -> undefined
let f: [] = neverVar;                // never -> Array
let g: {} = neverVar;                // never -> Object

```


<br>

- 어떤 타입도 never 타입으로 다운 캐스팅 할 수 없다.

```typescript

let a: never = 1;                 // number -> never ❌
let b: never = "hello";           // string -> never ❌
let c: never = true;              // boolean -> never ❌
let d: never = null;              // null -> never ❌
let e: never = undefined;         // undefined -> never ❌
let f: never = [];                // Array -> never ❌
let g: never = {};                // Object -> never ❌
```


<br><br>

---

#### c. void 타입

- ![이미지](/assets/images/typescript/TSunknown계층도.png)

￼
- void 타입은 앞서 다음과 같이 아무것도 반환하지 않는 함수의 반환값 타입으로 주로 사용된다고 살펴본 적이 있다.

```typescript
function noReturnFunc(): void {
  console.log("hi");
}
```

<br>

- void 타입은 위에 계층도처럼 undefined 타입의 슈퍼타입임을 알 수 있다.
	-  void 타입의 서브타입은 undefined 타입과 never 타입 밖에 없다. undefined 타입은 void 타입의 서브 타입이므로 업캐스팅이 가능하기 때문이다. 따라서 void 타입에는 undefined, never 이외에 다른 타입의 값을 할당할 수 없다.


```typescript
let voidVar: void;

voidVar = undefined; // undefined -> void (ok)

let neverVar: never;
voidVar = neverVar; // never -> void (ok)
```
		

<br><br>

---

#### d. any 타입 (치트키)

- any 타입은 사실상 타입 계층도를 완전히 무시한다.

<br>
- any는 뭐든지 예외입니다. 모든 타입의 슈퍼타입이 될 수도 있고 모든 타입의 서브 타입이 될 수도 있다.


```typescript

let anyValue: any;

let num: number = anyValue;   // any -> number (다운 캐스트)
let str: string = anyValue;   // any -> string (다운 캐스트)
let bool: boolean = anyValue; // any -> boolean (다운 캐스트)

anyValue = num;  // number -> any (업 캐스트)
anyValue = str;  // string -> any (업 캐스트)
anyValue = bool; // boolean -> any (업 캐스트)

```

---

<br><br>

### 3) 객체 타입의 호환성

- 객체 타입간의 호환성도 동일한 기준으로 판단한다. 모든 객체 타입은 각각 다른 객체 타입들과 슈퍼-서브 타입 관계를 갖는다. 따라서 업 캐스팅은 허용하고 다운 캐스팅은 허용하지 않는다.

```typescript
let num1: number = 10;
let num2: 10 = 10;

num1 = num2; // ✅ OK
num2 = num1; // ❌ NO
```



<br><br>

- 타입스크립트는 프로퍼티를 기준으로 타입을 정의하는 구조적 타입 시스템을 따른다고 배웠던 적 있다. 따라서 Animal 타입은 name과 color 프로퍼티를 갖는 모든 객체들을 포함하는 집합으로 볼 수 있고 Dog 타입은 name과 color 거기에다 추가로 breed 프로퍼티를 갖는 모든 객체를 포함하는 집합으로 볼 수 있다.
	- 그러므로 어떤 객체가 Dog 타입에 포함된다면 무조건 Animal 타입에도 포함된다. 그러나 반대로 Animal 타입에 포함되는 모든 객체가 Dog 타입에 포함되는것은 아니다. 따라서 결국 Animal은 Dog의 슈퍼타입이다.


```typescript
type Animal = {
  name: string;
  color: string;
};

type Dog = {
  name: string;
  color: string;
  breed: string;
};

let animal: Animal = {
  name: "기린",
  color: "yellow",
};

let dog: Dog = {
  name: "돌돌이",
  color: "brown",
  breed: "진도",
};

animal = dog; // ✅ OK
dog = animal; // ❌ NO
```

<br><br>

- 같은 예제

```typescript
type Book = {
  name: string;
  price: number;
};

type ProgrammingBook = {
  name: string;
  price: number;
  skill: string;
};

let book: Book;
let programmingBook: ProgrammingBook = {
  name: "한 입 크기로 잘라먹는 리액트",
  price: 33000,
  skill: "reactjs",
};

book = programmingBook; // ✅ OK
programmingBook = book; // ❌ NO
```

---

<br><br>

### 4) 초과 프로퍼티 검사

- 만약 새로운 변수를 만들고 다음과 같이 초기값을 설정하면 오류가 발생한다. 

<br>
- 초과 프로퍼티 검사란 변수를 객체 리터럴로 초기화 할 때 발동하는 타입스크립트의 특수한 기능. 

<br>
- 타입에 정의된 프로퍼티 외의 다른 초과된 프로퍼티를 갖는 객체를 변수에 할당할 수 없도록 막는다.

```typescript
type Book = {
  name: string;
  price: number;
};

type ProgrammingBook = {
  name: string;
  price: number;
  skill: string;
};

(...)

let book2: Book = { // 오류 발생
  name: "한 입 크기로 잘라먹는 리액트",
  price: 33000,
  skill: "reactjs",
};
```

<br>
- 중요** : 이런 초과 프로퍼티 검사는 단순히 변수를 초기화 할 때 객체 리터럴을 사용하지만 않으면 발생하지 않는다. 따라서 다음과 같이 값을 별도의 다른 변수에 보관한 다음 변수 값을 초기화 값으로 사용하면 발생하지 않는다.

```typescript
(...)

let book3: Book = programmingBook; // 앞서 만들어둔 변수
```

<br>
- 초과 프로퍼티 검사는 함수의 매개변수에도 동일하게 발생한다.

```typescript
function func(book: Book) {}

func({ // 오류 발생
  name: "한 입 크기로 잘라먹는 리액트",
  price: 33000,
  skill: "reactjs",
});
```

<br>
- 중요* : 검사를 피하고 싶다면 다음과 같이 변수에 미리 값을 담아둔 다음 변수값을 인수로 전달하면 된다.

```typescript
func(programmingBook);
```

---

<br><br>

### 5) 대수 타입

- 여러개의 타입을 합성해서 만드는 타입을 말한다. 앞에서 배운 객체 타입의 호환성을 이해했다면 이제 대수타입도 쉽게 이해할 수 있다.

<br>
- 대수 타입에는 합집합 타입과 교집합 타입이 존재한다. 합집합은 Union 타입, 교집합은 Intersection 타입이라고 부릅니다. 하나씩 천천히 살펴보자!

---

<br><br>

#### a. 합집합(Union) 타입

```typescript
// 합집합 타입 - Union 타입
let a: string | number | boolean;

a = 1;
a = "hello";
a = true;
```

<br>
- 유니온 타입을 이용하면 다양한 타입의 요소를 보관하는 배열 타입

```typescript
let arr: (number | string | boolean)[] = [1, "hello", true];
```

<br>
- 여러개의 객체 타입의 유니온 타입도 얼마든지 정의

```typescript
type Dog = {
  name: string;
  color: string;
};

type Person = {
  name: string;
  language: string;
};

type Union1 = Dog | Person;

(...)

let union1: Union1 = { // ✅
  name: "",
  color: "",
};

let union2: Union1 = { // ✅
  name: "",
  language: "",
};

let union3: Union1 = { // ✅
  name: "",
  color: "",
  language: "",
};
```

<br>
- 반면, 다음과 같은 객체는 포함하지 않는다!!

```typescript
let union4: Union1 = { // ❌
  name: "",
};
```

---

<br><br>

#### b. 교집합(Intersection) 타입

- number 타입과 string 타입은 서로 교집합을 공유하지 않는 서로소 집합이므로 변수 variable의 타입은 결국 never 타입으로 추론된다.

<br>
- 대다수의 기본 타입들 간에는 서로 공유하는 교집합이 없기 때문에 이런 인터섹션 타입은 보통 객체 타입들에 자주 사용된다. 
 

```typescript
let variable: number & string; 
// never 타입으로 추론된다
```

<br>
- Intersection 타입과 객체 타입 정의하는 법

```typescript

type Dog = {
  name: string;
  color: string;
};

type Person = {
  name: string;
  language: string;
};

type Intersection = Dog & Person;

let intersection1: Intersection = {
  name: "",
  color: "",
  language: "",
}; ```

---

<br><br>

#### 6) 타입 추론

- 타입스크립트는 타입이 정의되어 있지 않은 변수의 타입을 자동으로 추론한다.

<br>
- 변수의 타입을 자동으로 추론

```typescript
let a = 10;
// number 타입으로 추론
```

<br>
- 함수의 매개변수 타입은 자동으로 추론할 수 없다.

```typescript
function func(param){ // 오류

}
```

---

<br><br>

##### a. 타입 추론이 가능한 상황들 : 

<br>

###### a) 변수 선언

```typescript
let a = 10;
// number 타입으로 추론

let b = "hello";
// string 타입으로 추론

let c = {
  id: 1,
  name: "이정환",
  profile: {
    nickname: "winterlood",
  },
  urls: ["https://winterlood.com"],
};
// id, name, profile, urls 프로퍼티가 있는 객체 타입으로 추론
```

<br><br>

###### b) 구조 분해 할당

```typescript
let { id, name, profile } = c;

let [one, two, three] = [1, "hello", true];
```

<br><br>

###### c) 함수의 반환값

```typescript
function func() {
  return "hello";
}
// 반환값이 string 타입으로 추론된다
```

<br><br>

###### d) 기본값이 설정된 매개변수

```typescript
function func(message = "hello") {
  return "hello";
}
```

---

<br><br>

##### b. 주의해야 할 상황들 : 

<br>

##### a) 암시적으로 any 타입으로 추론

- 암시적으로 추론된 any 타입은 코드의 흐름에 따라 타입이 계속 변화, any의 진화라고 표현

```typescript
// d = 10; 다음 라인부터는 d가 number 타입이 되고, d = “hello” 다음 라인부터는 d가 string 타입
let d;
d = 10;
d.toFixed();

d = "hello";
d.toUpperCase();
d.toFixed(); // 오류 
```

---

<br><br>

##### b) const 상수의 추론

- 상수는 초기화 때 설정한 값을 변경할 수 없기 때문에 특별히 가장 좁은 타입으로 추론

```typescript
const num = 10;
// 10 Number Literal 타입으로 추론

const str = "hello";
// "hello" String Literal 타입으로 추론
```


---

<br><br>

##### c) 최적 공통 타입(Best Common Type)

- 다양한 타입의 요소를 담은 배열을 변수의 초기값으로 설정하면, 최적의 공통 타입으로 추론된다.

```typescript
let arr = [1, "string"];
// (string | number)[] 타입으로 추론
```

---

<br><br>

### 6) 타입 단언

- 원래 아래 코드에서 빈 객체는 Person 타입이 아니므로 오류가 발생하게 된다. 

<br>
- 값 as 타입 으로 특정 값을 원하는 타입으로 단언할 수 있습니다. 

```typescript
type Person = {
  name: string;
  age: number;
};

let person = {} as Person;
person.name = "";
person.age = 23;  
```


<br>
- 아래 코드에서는 breed 라는 초과 프로퍼티가 존재하지만 이 값을 Dog 타입으로 단언하여 초과 프로퍼티 검사를 피했다!

```typescript
type Dog = {
  name: string;
  color: string;
};

let dog: Dog = {
  name: "돌돌이",
  color: "brown",
  breed: "진도",
} as Dog
```

---

<br><br>

#### a. 타입 단언의 조건

- 값 as 타입 형식의 단언식을 A as B로 표현했을 때 아래의 두가지 조건중 한가지를 반드시 만족해야 한다.
	- a) A가 B의 슈퍼타입이다
	- b) A가 B의 서브타입이다

```typescript
let num1 = 10 as never;   // ✅
let num2 = 10 as unknown; // ✅

let num3 = 10 as string;  // ❌
```


---

<br><br>

#### b. 다중 단언 

- 그러나 이렇게 단언하는 것은 매우 좋지 않은 방식이다. 타입 단언은 실제로 그 값을 해당 타입의 값으로 바꾸는 것이 아니라 단순 눈속임에 불과하다. 따라서 이렇게 값을 이렇게 슈퍼-서브 관계를 갖지 않는 타입으로 단언하면 오류가 발생할 확률이 매우 높아진다.

```typescript
let num3 = 10 as unknown as string;
```




* d. const 단언

	- 특정 값을 const 타입으로 단언하면 마치 변수를 const로 선언한 것 과 비슷하게 타입이 변경된다.

```typescript
let num4 = 10 as const;
// 10 Number Literal 타입으로 단언됨

let cat = {
  name: "야옹이",
  color: "yellow",
} as const;
// 모든 프로퍼티가 readonly를 갖도록 단언됨
```




* e. Non Null 단언
	- Non Null 단언은 지금까지 살펴본 값 as 타입 형태를 따르지 않는 단언이다. 값 뒤에 느낌표(`!`) 를 붙여주면 이 값이 undefined이거나 null이 아닐것으로 단언할 수 있다.

```typescript
type Post = {
  title: string;
  author?: string;
};

let post: Post = {
  title: "게시글1",
};

const len: number = post.author!.length;
```




---

<br><br>

### 7) 타입 좁히기 

- 매개변수 value의 타입이 `number | string` 이므로 함수 내부에서 다음과 같이 value가 number 타입이거나 string 타입일 것으로 기대하고 메서드를 사용하려고 하면 오류가 발생한다.

```typescript
function func(value: number | string) { }
```

<br><br>

- 조건문을 이용해 조건문 내부에서 변수가 특정 타입임을 보장하면 해당 조건문 내부에서는 변수의 타입이 보장된 타입으로 좁혀진다. 따라서 첫번째 조건문 내부에서는 value의 타입이 number 타입이 되고, 두번째 조건문 내부에서는 value의 타입이 string 타입이 된다.
	-  `if (typeof === …)` 처럼 조건문과 함께 사용해 타입을 좁히는 이런 표현들을 `타입 가드`라고 부른다. 정리하면 타입 가드를 이용해 타입을 좁혀 사용할 수 있다.

```typescript
function func(value: number | string) {
  if (typeof value === "number") {
    console.log(value.toFixed());
  } else if (typeof value === "string") {
    console.log(value.toUpperCase());
  }
}
```


<br><br>

#### a. instanceof 타입가드

- Instanceof는 내장 클래스 또는 직접 만든 클래스에만 사용이 가능한 연산이다. 따라서 우리가 직접 만든 타입과 함께 사용할 수 없다.


```typescript
function func(value: number | string | Date | null) {
  if (typeof value === "number") {
    console.log(value.toFixed());
  } else if (typeof value === "string") {
    console.log(value.toUpperCase());
  } else if (value instanceof Date) {
    console.log(value.getTime());
  }
}
```


<br><br>

#### b. in 타입 가드(어렵다. 다시 볼 것!!)

- 우리가 직접 만든 타입과 함께 사용하려면 다음과 같이 in 연산자를 이용해야 한다.

<br>
- 타입 내 프로퍼티를 in 연산자로 사용된다 : 다음 챕터에서 예시!!

```typescript
type Person = {
  name: string;
  age: number;
};

function func(value: number | string | Date | null | Person) {
  if (typeof value === "number") {
    console.log(value.toFixed());
  } else if (typeof value === "string") {
    console.log(value.toUpperCase());
  } else if (value instanceof Date) {
    console.log(value.getTime());
  } else if (value && "age" in value) {
    console.log(`${value.name}은 ${value.age}살 입니다`)
  }
}
```



---

<br><br>

### 8) 서로소 유니온 타입

- 교집합이 없는 타입들 즉 서로소 관계에 있는 타입들을 모아 만든 유니온 타입

<br>

#### a. 초기 코드 : 

- 이렇게 아래 코드처럼 작성하면 조건식만 보고 어떤 타입으로 좁혀지는지 바로 파악하기가 좀 어렵다. 결과적으로 직관적이지 못한 코드!!

<br>
- user에 kickCount 프로퍼티가 있으므로 이 유저는 Admin 타입으로 좁혀진다.

<br>
- user에 point 프로퍼티가 있으므로 이 유저는 Member 타입으로 좁혀진다.

<br>
- user는 남은 타입인 Guest 타입으로 좁혀진다.

```typescript
type Admin = {
  name: string;
  kickCount: number;
};

type Member = {
  name: string;
  point: number;
};

type Guest = {
  name: string;
  visitCount: number;
};

type User = Admin | Member | Guest;

function login(user: User) {
  if ("kickCount" in user) {
		// Admin
    console.log(`${user.name}님 현재까지 ${user.kickCount}명 추방했습니다`);
  } else if ("point" in user) {
		// Member
    console.log(`${user.name}님 현재까지 ${user.point}모았습니다`);
  } else {
		// Guest
    console.log(`${user.name}님 현재까지 ${user.visitCount}번 오셨습니다`);
  }
}
```



<br><br>

#### b. 수정 코드 1 

- String Literal 타입의 tag 프로퍼티를 각각 추가

```typescript
type Admin = {
  tag: "ADMIN";
  name: string;
  kickCount: number;
};

type Member = {
  tag: "MEMBER";
  name: string;
  point: number;
};

type Guest = {
  tag: "GUEST";
  name: string;
  visitCount: number;
};

(...)
```


```typescript
(...)

function login(user: User) {
  if (user.tag === "ADMIN") {
    console.log(`${user.name}님 현재까지 ${user.kickCount}명 추방했습니다`);
  } else if (user.tag === "MEMBER") {
    console.log(`${user.name}님 현재까지 ${user.point}모았습니다`);
  } else {
    console.log(`${user.name}님 현재까지 ${user.visitCount}번 오셨습니다`);
  }
}
```

<br><br>

#### c. 수정코드 2 :

- switch를 이용해 더 직관적으로 변경할 수도 있다.

```typescript

function login(user: User) {
  switch (user.tag) {
    case "ADMIN": {
      console.log(`${user.name}님 현재까지 ${user.kickCount}명 추방했습니다`);
      break;
    }
    case "MEMBER": {
      console.log(`${user.name}님 현재까지 ${user.point}모았습니다`);
      break;
    }
    case "GUEST": {
      console.log(`${user.name}님 현재까지 ${user.visitCount}번 오셨습니다`);
      break;
    }
  }
}
```

---


<br><br>
	
# 4. 함수와 타입 

## 0) 함수의 타입을 정의하는 방법


```typescript
// 함수의 타입은 다음과 같이 매개 변수와 반환값의 타입으로 결정된다.
function func(a: number, b: number): number {
  return a + b;
}
```

<br>

```typescript
// 함수의 반환값 타입은 자동으로 추론되기 때문에 다음과 같이 생량 가능
function func(a: number, b: number) {
  return a + b;
}
```

---

<br><br>

### a. 화살표 함수 타입 정의하기**

```typescript
const add = (a: number, b: number): number => a + b;
```

<br>

```typescript
const add = (a: number, b: number) => a + b;
```


---

<br><br>

### b. 매개변수 기본값 설정하기

- 함수의 매개변수에 기본값이 설정되어있으면 타입이 자동으로 추론!!

```typescript
function introduce(name = "이정환") {
	console.log(`name : ${name}`);
}
```

<br><br>
- 당연히 기본값과 다른 타입으로 매개변수의 타입을 정의하면 오류가 발생하고 기본값과 다른 타입의 값을 인수로 전달해도 오류가 발생!

```typescript
function introduce(name = "이정환") {
  console.log(`name : ${name}`);
}

introduce(1); // 오류
```


---

<br><br>

### c. 선택적 매개변수 설정하기**

- 매개변수의 이름뒤에 물음표(?)를 붙여주면 선택적 매개변수가 되어 생략이 가능, 주의할 점은 선택적 매개변수는 필수 매개변수 앞에 올 수 없다. 반드시 뒤에 배치!!

```typescript
function introduce(name = "이정환", tall?: number) {
  console.log(`name : ${name}`);
  console.log(`tall : ${tall}`);
}

introduce("이정환", 156);

introduce("이정환");
```

<br><br>
- 중요** :
	-  all 같은 선택적 매개변수의 타입은 자동으로 undefined와 유니온 된 타입으로 추론된다. 따라서 tall의 타입은 현재 `number | undefined`이 된다. 그러므로 이 값이 number 타입의 값일 거라고 기대하고 사용하려면 다음과 같이 타입 좁히기가 필요!!

```typescript
function introduce(name = "이정환", tall?: number) {
  console.log(`name : ${name}`);
  if (typeof tall === "number") {
    console.log(`tall : ${tall + 10}`);
  }
}
```


---

<br><br>

### d. 나머지 매개변수

- getSum 함수는 나머지 매개변수 rest로 배열 형태로 number 타입의 인수들을 담은 배열을 전달!!

```typescript
function getSum(...rest: number[]) {
  let sum = 0;
  rest.forEach((it) => (sum += it));
  return sum;
}
```

<br><br>
- 튜플 타입 이용 : 나머지 매개변수의 길이를 고정 가능

```typescript

function getSum(...rest: [number, number, number]) {
  let sum = 0;
  rest.forEach((it) => (sum += it));
  return sum;
}

getSum(1, 2, 3)    // ✅
getSum(1, 2, 3, 4) // ❌
```

---

<br><br>

## 1) 함수 타입 표현식과 호출 시그니쳐

### a. 함수 타입 표현식


- 함수 타입 표현식(Function Type Expression) : 함수 타입을 타입 별칭과 함께 별도로 정의!
	- 함수 타입 표현식을 이용하면 함수 선언 및 구현 코드와 타입 선언을 분리할 수 있어 유용!
	

```typescript
type Add = (a: number, b: number) => number;

const add: Add = (a, b) => a + b;
```

<br>

```typescript
type Operation = (a: number, b: number) => number;

const add: Operation = (a, b) => a + b;
const sub: Operation = (a, b) => a - b;
const multiply: Operation = (a, b) => a * b;
const divide: Operation = (a, b) => a / b;
```

<br>
- 함수 타입 표현식이 반드시 타입 별칭과 함께 사용되어야 하는 것은 아니다.

```typescript

const add: (a: number, b: number) => number = (a, b) => a + b;
```

---

<br><br>

### b. 호출 시그니쳐

- 함수 타입 표현식과 동일하게 함수의 타입을 별도로 정의하는 방식

<br>
- 중요** : 자바스크립트에서는 함수도 객체이기 때문에, 아래 코드처럼 객체를 정의하듯 함수의 타입을 별도로 정의할 수 있다.** 


```typescript
type Operation2 = {
  (a: number, b: number): number;
};

const add2: Operation2 = (a, b) => a + b;
const sub2: Operation2 = (a, b) => a - b;
const multiply2: Operation2 = (a, b) => a * b;
const divide2: Operation2 = (a, b) => a / b;
```

<br>
- 하이브리드 타입** : 호출 시그니쳐 아래에 프로퍼티를 추가 정의하는 것도 가능하다. 이렇게 할 경우 함수이자 일반 객체를 의미하는 타입으로 정의된다.

```typescript
type Operation2 = {
  (a: number, b: number): number;
  name: string;
};

const add2: Operation2 = (a, b) => a + b;
(...)

add2(1, 2);
add.name;
```

---

<br><br>

## 2) 함수 타입의 호환성


### a. 함수 타입의 호환성을 판단 기준 : 2가지

- a) 두 함수의 반환값 타입이 호환되는가?
- b) 두 함수의 매개변수의 타입이 호환되는가?

---

<br><br>

### b. 기준 1 : 반환값 타입이 호환되는가?을 판단 

- A와 B 함수 타입이 있다고 가정할 때, A 반환값 타입이 B 반환값 타입의 슈퍼타입이라면 두 타입은 호환 가능!
	- 일반적으로 생각하는 경우이다. 정방향

```typescript
type A = () => number;
type B = () => 10;

let a: A = () => 10;
let b: B = () => 10;

a = b; // ✅
b = a; // ❌
```


---

<br><br>

### c. 기준 2 : 매개변수의 타입이 호환되는가?

- 두 함수의 매개변수의 개수가 같은지 다른지에 따라 두가지 유형으로 나뉘게 된다.



#### a) 매개변수의 개수가 같을 때

- 두 함수 타입 C와 D가 있다고 가정할 때, 두 타입의 매개변수의 개수가 같다면 C 매개변수의 타입이 D 매개변수 타입의 서브 타입일 때에 호환된다!
	- 일반적으로 생각 할 수 있는 경우가 아니다. 역방향!

```typescript
type C = (value: number) => void;
type D = (value: 10) => void;

let c: C = (value) => {};
let d: D = (value) => {};

c = d; // ❌
d = c; // ✅
```


<br><br>

- 이는 반환값 타입과 반대된다. 마치 다운캐스팅을 허용하는 것 같아 보인다.
	- 이렇게 되는 이유는 두 함수의 매개변수의 타입이 모두 객체 타입일때 좀 더 두드러진다!
	- 아래 코드에서 animalFunc에 dogFunc를 할당하는 것은 불가능합니다. dogFunc의 매개변수 타입이 animalFunc 매개변수 타입보다 작은 서브타입!!

```typescript
type Animal = {
  name: string;
};

type Dog = {
  name: string;
  color: string;
};

let animalFunc = (animal: Animal) => {
  console.log(animal.name);
};

let dogFunc = (dog: Dog) => {
  console.log(dog.name);
  console.log(dog.color);
};

animalFunc = dogFunc; // ❌
dogFunc = animalFunc; // ✅
```

<br><br>

- `animalFunc = dogFunc`를 코드로 표현
	- animalFunc 타입의 매개변수 타입은 Animal 타입이다.
	- dogFunc 함수 내부에서는 name과 color 프로퍼티에 접근합니다. 따라서 이렇게 할당이 이루어지게 되면 animal.color처럼 존재할거라고 보장할 수 없는 프로퍼티에 접근하게 된다.

```typescript
let animalFunc = (animal: Animal) => {
  console.log(animal.name);  // ✅
  console.log(animal.color); // ❌
};
```

<br><br>

- `dogFunc = animalFunc`를 코드로 표현
	- dogFunc 함수의 매개변수는 Dog 타입, animalFunc 함수 내부에서는 name 프로퍼티에만 접근한다.

```typescript
let dogFunc = (dog: Dog) => {
  console.log(dog.name);
};
```

---

<br><br>

#### b) 매개변수의 개수가 다를 때(간단)


```typescript
type Func1 = (a: number, b: number) => void;
type Func2 = (a: number) => void;

let func1: Func1 = (a, b) => {};
let func2: Func2 = (a) => {};

func1 = func2; // ✅
func2 = func1; // ❌
```




---

<br><br>


## 3. 함수 오버로딩

- 하나의 함수를 매개변수의 개수나 타입에 따라 다르게 동작하도록 만드는 문법

<br>
- 주의** : 타입스크립트에서 함수 오버로딩을 구현하려면 먼저 다음과 같이 버전별 오버로드 시그니쳐 만들기!!

<br><br>

### a. 오버로드 시그니쳐

- 구현부 없이 선언부만 만들어둔 함수를 ‘오버로드 시그니쳐’

```typescript
// 버전들 -> 오버로드 시그니쳐

function func(a: number): void;
function func(a: number, b: number, c: number): void;
```

<br><br>

---

### b. 구현 시그니쳐 : 실제로 함수가 어떻게 실행될 것인지를 정의하는 부분

- 구현 시그니쳐의 매개변수 타입은 모든 오버로드 시그니쳐와 호환되도록 만들어야 한다.

```typescript
// 버전들 -> 오버로드 시그니쳐
function func(a: number): void;
function func(a: number, b: number, c: number): void;

// 실제 구현부 -> 구현 시그니쳐
function func(a: number, b?: number, c?: number) {
  if (typeof b === "number" && typeof c === "number") {
    console.log(a + b + c);
  } else {
    console.log(a * 20);
  }
}

func(1);        // ✅ 버전 1 - 오버로드 시그니쳐
func(1, 2);     // ❌ 
func(1, 2, 3);  // ✅ 버전 3 - 오버로드 시그니쳐
```


---

<br><br>

## 4. 사용자 정의 타입가드

- 사용자 정의 타입가드 : 참 또는 거짓을 반환하는 함수를 이용해 우리 입맛대로 타입 가드를 만들 수 있도록 도와주는 것


<br><br>

### a. 틀린 설계 방향 :  

- in 연산자를 이용해 타입을 좁히는 방식은 좋지 않다고 이전에 살펴본 적 있다. 

<br>
- Dog 타입의 프로퍼티가 다음과 같이 중간에 이름이 수정되거나 추가 또는 삭제될 경우에는 타입 가드가 제대로 동작하지 않을 수도 있다.

```
type Dog = {
  name: string;
  isBark: boolean;
};

type Cat = {
  name: string;
  isScratch: boolean;
};

type Animal = Dog | Cat;

function warning(animal: Animal) {
  if ("isBark" in animal) {
    console.log(animal.isBark ? "짖습니다" : "안짖어요");
  } else if ("isScratch" in animal) {
    console.log(animal.isScratch ? "할큅니다" : "안할퀴어요");
  }
}
```

---

<br><br>

### b. 올바른 설계 방향** : 

- isDog 함수는 매개변수로 받은 값이 Dog 타입이라면 true 아니라면 false를 반환한다. 

<br>
- 이 때 반환값의 타입으로 `animal as Dog` 를 정의하면, 이 함수가 true를 반환하면 조건문 내부에서는 이 값이 Dog 타입임을 보장한다는 의미가 된다. 

<br>
- 따라서, warning 함수에서 isDog 함수를 호출해 매개변수의 값이 Dog 타입인지 확인하고 타입을 좁힐 수 있다

```typescript
type Dog = {
  name: string;
  isBarked: boolean; // isBark -> isBarked
};
```

<br>

```typescript
(...)

// Dog 타입인지 확인하는 타입 가드
function isDog(animal: Animal): animal is Dog {
  return (animal as Dog).isBark !== undefined;
}

// Cat 타입인지 확인하는 타입가드
function isCat(animal: Animal): animal is Cat {
  return (animal as Cat).isScratch !== undefined;
}

function warning(animal: Animal) {
  if (isDog(animal)) {
    console.log(animal.isBark ? "짖습니다" : "안짖어요");
  } else {
    console.log(animal.isScratch ? "할큅니다" : "안할퀴어요");
  }
}
```






