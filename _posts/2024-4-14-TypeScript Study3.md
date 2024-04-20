---
key: /2024/04/14/TypeScriptStudy3.html
title: TypeScript - TypeScript Study3
tags: typescript keyof infer
--- 


# 8. 타입 조작하기**

## 0) 타입 조작이란

- 기본 타입이나 별칭 또는 인터페이스로 만든 원래 존재하던 타입들을 상황에 따라 유동적으로 다른 타입으로 변환하는 타입스크립트의 강력한 기능!!

<br>
- 앞에서 배운 제네릭도 함수나 인터페이스, 타입 별칭, 클래스 등에 적용해서 상황에 따라 달라지는 가변적인 타입을 정의할 수 있기 때문에 타입을 조작하는 기능에 포함되지만 개념이 방대하다.

---

<br><br>

### a. 타입 조작하기 4가지

- 인덱스드 액세스 타입 : 
	- 객체, 배열, 튜플 타입으로부터 특정 프로퍼티나 특정 요소의 타입만 추출

<br>

- keyof 연산자 : 
	- 객체 타입으로부터 해당 타입 내에 정의된 프로퍼티의 키들을 유니온 타입으로 추출

<br>

- Mapped(맵드) 타입 : 
	- 자바스크립트의 맵 함수처럼 기존의 객체 타입을 기반으로 새로운 객체 타입을 만드는 맵드 타입

<br>

- 템플릿 리터럴 타입 :
	- 기존의 스트링 리터럴 타입을 기반으로 정해진 패턴의 문자열만 포함하는 템플릿 리터럴 타입

---

<br><br>

## 1) 인덱스드 액세스 타입

- 인덱스를 이용해 다른 타입내의 특정 프로퍼티의 타입을 추출하는 타입

<br><br>

### a. 문제점 발생

<br>
- 매개변수의 타입을 이렇게 정의하면 나중에 Post 타입의 author 프로퍼티의 타입이 다음과 같이 수정되면 매개변수의 타입도 그때 마다 계속 수정해줘야 하는 불편함이 존재

```typescript
interface Post {
  title: string;
  content: string;
  author: {
    id: number;
    name: string;
  };
}

const post: Post = {
  title: "게시글 제목",
  content: "게시글 본문",
  author: {
    id: 1,
    name: "이정환",
  },
};

function printAuthorInfo(author: { id: number; name: string }) {
  console.log(`${author.id} - ${author.name}`);
}
```

<br>

```typescript
interface Post {
  title: string;
  content: string;
  author: {
    id: number;
    name: string;
    age: number; // 추가
  };
}

function printAuthorInfo(author: { id: number; name: string, age: number }) {
	// age 프로퍼티도 추가
  console.log(`${author.id} - ${author.name}`);
}

(...)
```


---

<br><br>

### b. 해결방안

- 인덱스드 엑세스 타입을 이용해 Post에서 author 프로퍼티의 타입을 추출해 사용하면 편리!!

<br>
- 아래 코드에서 `Post["author"]`는 Post 타입으로부터 author 프로퍼티의 타입을 추출합니다. 그 결과 author 매개변수의 타입은 `{id : number, name: string, age:number}`가 된다. 

```typescript

interface Post {
  title: string;
  content: string;
  author: {
    id: number;
    name: string;
    age: number; // 추가
  };
}


function printAuthorInfo(author: Post["author"]) {
  console.log(`${author.id} - ${author.name}`);
}

(...)

```


---

<br><br>

### c. 주의사항 :

- a) 인덱스에는 값이 아니라 타입만 들어갈 수 있다. "author"를 문자열 값으로 다른 변수에 저장하고 인덱스로 사용하려고 하면 오류가 발생한다.

```typescript

const authorKey = "author";

function printAuthorInfo(author: Post[authorKey]) { // ❌
  console.log(`${author.id} - ${author.name}`);
}
```

<br>

- b) 인덱스에 존재하지 않는 프로퍼티 이름을 쓰면 오류가 발생!!

```typescript

function printAuthorInfo(author: Post["what"]) { // ❌
  console.log(`${author.id} - ${author.name}`);
}
```

<br>

- c) 인덱스를 중첩하여 사용할 수도 있다.

```typescript

interface Post {
  title: string;
  content: string;
  author: {
    id: number;
    name: string;
    age: number;
  };
}


function printAuthorInfo(author: Post["author"]['id']) {
	// author 매개변수의 타입은 number 타입이 됨
  console.log(`${author.id} - ${author.name}`);
}
```


---

<br><br>

### d. 배열 요소의 타입 추출

- 초기 배열 타입 선언 : 
	- `[];` 가 포함되어 있다.

```typescript

type PostList = {
  title: string;
  content: string;
  author: {
    id: number;
    name: string;
    age: number;
  };
}[];
```

<br>

- 인덱스드 엑세스 타입을 이용해 PostList 배열 타입에서 하나의 요소의 타입만 뽑아올 수 있다.
	- 배열의 요소 타입을 추출할 때에는 인덱스에 number 타입을 넣어주면 된다.

```typescript

const post: PostList[number] = {
  title: "게시글 제목",
  content: "게시글 본문",
  author: {
    id: 1,
    name: "이정환",
    age: 27,
  },
};

```




<br>

- 인덱스에 다음과 같이 Number Literal 타입을 넣어도 된다. 숫자와 관계없이 모두 Number 타입을 넣은 것과 동일하게 동작한다.

```typescript

const post: PostList[0] = {
  title: "게시글 제목",
  content: "게시글 본문",
  author: {
    id: 1,
    name: "이정환",
    age: 27,
  },
}; 

```


---

<br><br>

### e. 튜플의 요소 타입 추출

- 튜플의 각 요소들의 타입 또한 인덱스드 엑세스 타입으로 쉽게 추출!!

<br>
- 튜플 타입에 인덱스드 엑세스 타입을 사용할 때, 인덱스에 number 타입을 넣으면 마치 튜플을 배열 처럼 인식해 배열 요소의 타입을 추출

```typescript

type Tup = [number, string, boolean];

type Tup0 = Tup[0];
// number

type Tup1 = Tup[1];
// string

type Tup2 = Tup[2];
// boolean

type Tup3 = Tup[number]
// number | string | boolean

```

---

<br><br>

## 2) keyof & typeof 연산자

<br>

### a. Keyof 연산자

- 객체 타입으로부터 프로퍼티의 모든 key들을 `String Literal` Union 타입으로 추출하는 연산자

<br>

- 중요** : key의 타입을 `name | age`로 정의했는데 Person 타입에 새로운 프로퍼티가 추가되거나 수정될 때 마다 이 타입도 계속 바꿔줘야 한다. 이럴 때, Keyof 연산자를 이용하면 좋다!!

```typescript
interface Person {
  name: string;
  age: number;
  location: string; // 추가
}

function getPropertyKey(person: Person, key: keyof Person) {
  return person[key];
}

const person: Person = {
  name: "이정환",
  age: 27,
};
```

---

<br><br>

### b. typeof, keyof 함께 사용

- `typeof` 연산자는 자바스크립트에서 특정 값의 타입을 문자열로 반환하는 연산자였다. 그러나 타입을 정의할 때, 사용하면 특정 변수의 타입을 추론하는 기능!!

```typescript

type Person = typeof person;
// 결과
// {name: string, age: number, location:string}

(...)

```

<br>

- 이런 특징을 이용하면 keyof 연산자를 다음과 같이 사용할 수 있다.(여기는 다시 공부하기!!)

```typescript

(...)

function getPropertyKey(person: Person, key: keyof typeof person) {
  return person[key];
}

const person: Person = {
  name: "이정환",
  age: 27,
};

```



---

<br><br>

## 3) 맵드 타입

### a. 문제 상황

- 기존의 객체 타입을 기반으로 새로운 객체 타입을 만드는 타입 조작 기능!!

```typescript

interface User {
  id: number;
  name: string;
  age: number;
}

function fetchUser(): User {
  (...)
}

function updateUser(user: User) {
  // ... 유저 정보 수정 기능
}
```


<br><br>

- 그런데, updateUser 함수의 매개변수 타입이 User 타입으로 되어 있어서 수정하고 싶은 프로퍼티만 골라서 보낼 수 없는 상황이다.

```typescript

interface User {
  id: number;
  name: string;
  age: number;
}

function fetchUser(): User {
  (...)
}

function updateUser(user: User) {
  // ... 유저 정보 수정 기능
}

updateUser({ // ❌
  age: 25
});
```

<br><br>

- 어쩔 수 없이 다음과 같이 새로운 타입을 만들어 주어야 한다.

<br>
- 하지만, 아래 코드는 User 타입과 PartialUser 타입이 지금 서로 중복된 프로퍼티를 정의하고 있다. 중복은 언제나 좋지 않다. 따라서, 이럴 때 `맵드 타입`을 이용하면 좋다!!


```typescript

interface User {
  id: number;
  name: string;
  age: number;
}

type PartialUser = {
  id?: number;
  name?: string;
  age?: number;
}

(...)

function updateUser(user: PartialUser) {
  // ... 유저 정보 수정 기능
}

updateUser({ // ✅
  age: 25
});
```

---

<br><br>

### b. 해결 상황

- `맵드 타입`을 이용하면 간단한 한줄의 코드 만으로 중복 없이 기존 타입을 변환할 수 있다.

```typescript

interface User {
  id: number;
  name: string;
  age: number;
}

type PartialUser = {
  [key in "id" | "name" | "age"]?: User[key];
};

(...)
```

<br>

```typescript
// 맵드 타입 문법 해석하기
{
  id?: number;
  name?: string;
  age?: number;
}
```

---

<br><br>

### c. keyof 업그레이드**


```typescript

interface User {
  id: number;
  name: string;
  age: number;
}

type PartialUser = {
  [key in keyof User]?: User[key];
};

(...)
```



---

<br><br>

### d. 읽기 전용 프토퍼티(맵드 타입)

- 맵드 타입을 이용해 모든 프로퍼티가 읽기 전용 프로퍼티가 된 타입!!

```typescript

interface User {
  id: number;
  name: string;
  age: number;
}

type PartialUser = {
  [key in keyof User]?: User[key];
};

type ReadonlyUser = {
  readonly [key in keyof User]: User[key];
};

(...)
```

---

<br><br>

## 4) 템플릿 리터럴 타입

- `템플릿 리터럴`을 이용해 특정 패턴을 갖는 String 타입을 만드는 기능!!(가장 단순한 기능)


```typescript

type Color = "red" | "black" | "green";
type Animal = "dog" | "cat" | "chicken";

type ColoredAnimal = `red-dog` | 'red-cat' | 'red-chicken' | 'black-dog' ... ;
```

<br><br>

- `Color`나 `Animal` 타입에 String Literal 타입이 추가되어 경우의 수가 많아질 수록 `ColoredAnimal` 타입에 추가해야하는 타입이 점점 많아지게 된다. 이럴 때, 템플릿 리터럴 타입을 이용하면 좋다.


```typescript
type ColoredAnimal = `${Color}-${Animal}`;
```


---

<br><br>

# 9. 조건부 타입**

<br>

## 0) 조건부 타입

- extends와 삼항 연산자를 이용해 조건에 따라 각각 다른 타입을 정의하도록 돕는 문법

```typescript

type A = number extends string ? number : string;

```


<br>
- 조건부 타입은 제네릭과 함께 사용할 때, 그 위력이 극대화!!
	- 아래 예시처럼 타입변수에 Number 타입이 할당되면 String 타입을 반환하고 그렇지 않다면 Number 타입을 반환하는 조건부 타입

```typescript

type StringNumberSwitch<T> = T extends number ? string : number;

let varA: StringNumberSwitch<number>;
// string

let varB: StringNumberSwitch<string>;
// number

```

---

<br><br>

### a. 조건부 타입 예시


<br>

- 매개변수로 String 타입의 값을 제공받아 공백을 제거한 다음 반환하는 함수

```typescript

function removeSpaces(text: string) {
  return text.replaceAll(" ", "");
}

let result = removeSpaces("hi im winterlood");

```

<br>

- 함수 내부에서 text의 타입은 String이 아닐 수 있기 때문에 오류가 발생해서 타입을 좁혀 사용해야 한다.

```typescript

function removeSpaces(text: string | undefined | null) {
  if (typeof text === "string") {
    return text.replaceAll(" ", "");
  } else {
    return undefined;
  }
} 

let result = removeSpaces("hi im winterlood");
// string | undefined
```

<br>

- 조건부 타입을 이용해 인수로 전달된 값의 타입이 String이면 반환값 타입도 String이고 아니라면 반환값 타입을 undefined 으로 만들어 주면 된다.
	- 타입변수 T를 추가하고 매개변수의 타입을 T로 정의한 다음 반환값의 타입을 `T extends string ? string : undefined` 으로 수정

```typescript

function removeSpaces<T>(text: T): T extends string ? string : undefined {
  if (typeof text === "string") {
    return text.replaceAll(" ", ""); // ❌
  } else {
    return undefined; // ❌
  }
} 

let result = removeSpaces("hi im winterlood");
// string

let result2 = removeSpaces(undefined);
// undefined
```


<br>

- 그런데, 다음 코드에서 any로 단언하는것은 별로 좋지 못하다고 배운 적 있다. 첫 번째 return 문에서 string이 아닌 타입의 값을 반환 해도 오류를 감지하지 못한다.

```typescript
function removeSpaces<T>(text: T): T extends string ? string : undefined {
  if (typeof text === "string") {
    return 0 as any; // 문제 감지 못함
  } else {
    return undefined as any;
  }
}

let result = removeSpaces("hi im winterlood");
// string

let result2 = removeSpaces(undefined);
// undefined
```

<br>

- 그래서, 타입 단언보다는 함수 오버로딩을 이용하는게 더 좋다. 오버로드 시그니쳐의 조건부 타입은 구현 시그니쳐 내부에서 추론이 가능!!

```typescript
function removeSpaces<T>(text: T): T extends string ? string : undefined;
function removeSpaces(text: any) {
  if (typeof text === "string") {
    return text.replaceAll(" ", "");
  } else {
    return undefined;
  }
}

let result = removeSpaces("hi im winterlood");
// string

let result2 = removeSpaces(undefined);
// undefined
```

---

<br><br>

## 1) 분산적인 조건부 타입

- 변수 a의 타입은 조건식이 참이되어 string으로 정의되고 변수 b의 타입은 조건식이 거짓이 되어 number 타입으로 정의


```typescript

type StringNumberSwitch<T> = T extends number ? string : number;

let a: StringNumberSwitch<number>;

let b: StringNumberSwitch<string>;
```



<br>

- 타입 변수에 Union 타입을 할당

<br>

- 변수 c는 `string | number` 타입으로 정의
	- 조건부 타입의 타입 변수에 Union 타입을 할당하면 분산적인 조건부 타입으로 조건부 타입이 업그레이드 되기 때문!!
	
<br>
- 타입 변수에 할당한 Union 타입 내부의 모든 타입이 분리됩니다. 따라서 `StringNuberSwitch<number | string>` 타입은 다음과 같이 분산됩니다.
	- `StringNumberSwitch<number>`
	- `StringNumberSwitch<string>`

<br>
- 그리고 다음으로 분산된 각 타입의 결과를 모아 다시 Union 타입으로 묶습니다.
	- 결과 : `number | string`


```typescript

type StringNumberSwitch<T> = T extends number ? string : number;

(...)

let c: StringNumberSwitch<number | string>;
// string | number

```


---

<br><br>

### a. Exclude 조건부 타입

- 분산적인 조건부 타입의 특징을 이용하면 매우 다양한 타입을 정의!!
	- Union 타입으로부터 특정 타입만 제거하는 Exclude(제외하다) 타입!!
	

#### a) 분석 과정

- (a). Union 타입이 분리된다.
	- `Exclude<number, string>`
	- `Exclude<string, string>`
	- `Exclude<boolean, string>`

<br>	
- (b). 각 분리된 타입을 모두 계산한다.
	- T = `number`, U = `string` 일 때 `number extends string` 은 거짓이므로 결과는 `number`
	- T = `string`, U = `string` 일 때 `string extends string` 은 참이므로 결과는 `never`
	- T = `boolean`, U = `string` 일 때 `boolean extends string` 은 거짓이므로 결과는 `boolean`

<br>	
- (c). 계산된 타입들을 모두 Union으로 묶는다
	- 결과 : `number | never | boolean`

<br>
- (d). 최종적으로 타입 A는 `number | boolean` 타입

```typescript

type Exclude<T, U> = T extends U ? never : T;

type A = Exclude<number | string | boolean, string>;

```

---

<br><br>

## 2) infer

- 조건부 타입 내에서 특정 타입을 추론하는 문법
	- 특정 함수 타입에서 반환값의 타입만 추출하는 특수한 조건부 타입인 `ReturnType`을 만들 때, 이용할 수 있다.
	- `T extends () => infer R`에서 `infer R`은 이 조건식을 참이 되도록 만들 수 있는 최적의 R 타입을 추론하라는 의미!!
	
<br><br>

### a. infer 분석

- (a). 타입 변수 T에 함수 타입 FuncA가 할당된다.

<br>
- (b). T는 `() ⇒ string` 이 된다.

<br>
- (c). 조건부 타입의 조건식은 다음 형태가 된다  `() ⇒ string extends () ⇒ infer R ? R : never`

<br>
- (d). 조건식을 참으로 만드는 R 타입을 추론한다. 그 결과 R은 `string`이 된다.

<br>
- (e). 추론이 가능하면 이 조건식을 참으로 판단한다. 따라서, 결과는 `string`이 된다.
	- 추론이 불가능하다면 조건식을 거짓으로 판단!


```typescript

type ReturnType<T> = T extends () => infer R ? R : never;

type FuncA = () => string;

type FuncB = () => number;

type A = ReturnType<FuncA>;
// string

type B = ReturnType<FuncB>;
// number

type C = ReturnType<number>;
// 조건식을 만족하는 R추론 불가능
// never

```

<br><br>

- Promise의 resolve 타입을 infer를 이용해 추출하는 예!!

```typescript

type PromiseUnpack<T> = T extends Promise<infer R> ? R : never;
// 1. T는 프로미스 타입이어야 한다.
// 2. 프로미스 타입의 결과값 타입을 반환해야 한다.

type PromiseA = PromiseUnpack<Promise<number>>;
// number

type PromiseB = PromiseUnpack<Promise<string>>;
// string

```


---

<br><br>

# 10. 유틸리티 타입

<br>

## 0. 유틸리티 타입 소개

- 타입스크립트가 자체적으로 제공하는 특수한 타입들이다. 

<br>
- 지금까지 배웠던 제네릭, 맵드 타입, 조건부 타입 등의 타입 조작 기능을 이용해 실무에서 자주 사용되는 유용한 타입들을 모아 놓은 것!!

<br>
- [유틸리티 타입 : 공식 문서](https://www.typescriptlang.org/docs/handbook/utility-types.html)


<br><br>

### a. 유틸리티 타입 예시

<br>

- `Readonly<T>`와 같은 유틸리티 타입을 이용해 특정 객체 타입의 모든 프로퍼티를 읽기 전용 프로퍼티로 변환!

```typescript

interface Person {
  name : string;
  age : number;
}

const person : Readonly<Person> ={
  name : "이정환",
  age : 27
}

person.name = ''
// ❌ name은 Readonly 프로퍼티입니다.
```


<br>

- `Partial<T>` 유틸리티 타입을 이용해 특정 객체 타입의 모든 프로퍼티를 선택적 프로퍼티로 변환하는 것도 가능!

```typescript

interface Person {
  name: string;
  age: number;
}

const person: Partial<Person> = {
  name: "이정환",
};
```





---

<br><br>

## 1. Partial, Required, Readonly

<br>

### 1) Partial<T>

- Partial<T> 타입은 타입 변수 T로 전달한 객체 타입의 모든 프로퍼티를 다 선택적 프로퍼티로 변환

```typescript

interface Post {
  title: string;
  tags: string[];
  content: string;
  thumbnailURL?: string;
}

const draft: Partial<Post> = {
  title: "제목 나중에 짓자",
  content: "초안...",
};
```

<br><br>

#### a. Partial<T> 구현하기

- T에 할당된 객체 타입의 모든 프로퍼티를 선택적 프로퍼티로 바꿔줘야 한다. 기존 객체 타입을 다른 타입으로 변환하는 타입은 맵드 타입이라서 맵드 타입을 다음과 같이 수정!!

```typescript

type Partial<T> = {
  [key in keyof T]?: T[key];
};
```


---

<br><br>

### 2) Required<T>

- Required<Post>는 Post 타입의 모든 프로퍼티가 필수 프로퍼티로 변환된 객체 타입이다. 따라서, 위 코드처럼 thumbnailURL 프로퍼티를 생략하면 이제 오류가 발생하게 된다.

```typescript
interface Post {
  title: string;
  tags: string[];
  content: string;
  thumbnailURL?: string;
}

(...)

const withThumbnailPost: Required<Post> = { // ❌
  title: "한입 타스 후기",
  tags: ["ts"],
  content: "",
  // thumbnailURL: "https://...",
};
```


<br><br>

#### a. Required<T> 타입 구현하기

- 모든 프로퍼티를 필수 프로퍼티로 만든다는 말은 반대로 바꿔보면 모든 프로퍼티에서 ‘선택적’ 이라는 기능을 제거하는 것과 같다. 

<br>
- 따라서 다음과 같이 `-?`를 프로퍼티 이름 뒤에 붙여주면 된다.


```typescript
type Required<T> = {
  [key in keyof T]-?: T[key];
};
```


---

<br><br>

### 3) Readonly<T>

- `Readonly<Post>`는 Post 타입의 모든 프로퍼티를 `readonly`(읽기 전용) 프로퍼티로 변환한다. 

<br>
- 따라서, 점표기법을 이용해 특정 프로퍼티의 값을 수정하려고 하면 오류를 발생시킨다.

```typescript
interface Post {
  title: string;
  tags: string[];
  content: string;
  thumbnailURL?: string;
}

(...)

const readonlyPost: Readonly<Post> = {
  title: "보호된 게시글입니다.",
  tags: [],
  content: "",
};

readonlyPost.content = '해킹당함'; // ❌
```

<br><br>

#### a. Readonly<T> 구현하기

```typescript
type Readonly<T> = {
  readonly [key in keyof T]: T[key];
};
```



---

<br><br>

## 2. Record, Pick, Omit


<br>

### 1) Record<T>

- Record 타입은 K에는 `“large” | “medium” |  “small”`이 할당되었으므로 large, medium, small 프로퍼티가 있는 객체 타입을 정의한다. 

<br>
- 그리고 각 프로퍼티 value의 타입은 V에 할당한 `{ url : stirng }` 이 된다.

```typescript

type Thumbnail = Record<
  "large" | "medium" | "small",
  { url: string }
>;

```

<br>

#### a. Record<T> 직접 구현

- Record 타입은 다음과 같이 구현할 수 있다.

```typescript
type Record<K extends keyof any, V> = {
  [key in K]: V;
};
```


---

<br><br>

### 2) Pick<T>

- 특정 객체 타입으로부터 특정 프로퍼티 만을 골라내는 그런 타입!!

```typescript
interface Post {
  title: string;
  tags: string[];
  content: string;
  thumbnailURL?: string;
}

(...)

const legacyPost: Pick<Post, "title" | "content"> = {
  title: "",
  content: "",
};
// 추출된 타입 : { title : string; content : string }
```


<br>

#### a. Pick<T> 직접 구현

- T로 부터 K 프로퍼티만 뽑아낸 객체 타입을 만들어야 하므로 일단 맵드 타입으로 정의!!

```typescript
type Pick<T, K> = {
  [key in K]: T[key];
};
```

<br>
- K가 T의 key로만 이루어진 String Literal Union 타입임을 보장

```typescript
type Pick<T, K extends keyof T> = {
  [key in K]: T[key];
};
```





---

<br><br>

### 3) Omit<T>


- 특정 객체 타입으로부터 특정 프로퍼티 만을 제거하는 타입

<br>
- Omit을 이용해 Post 타입으로부터 title 프로퍼티를 제거한 타입으로 변수의 타입을 정의해 주면 된다.

```typescript
const noTitlePost: Omit<Post, "title"> = {
  content: "",
  tags: [],
  thumbnailURL: "",
};
```


<br>

#### a. Omit<T> 직접 구현

- `keyof T`는`‘title’ | ‘content’ | ‘tags’ | ‘thumbnailURL’`이므로 `Pick<T, Exclude<keyof T, K>>`은 `Pick<Post, Exclude<'title' | 'content' | 'tags' | 'thumbnailURL' , 'title>>` 이 된다.

<br>
- `Pick<Post, 'content' | 'tags' | 'thumbnailURL'>` : 그럼 결과는 Post에서 `content, tags, thubmnailURL` 프로퍼티만 존재하는 객체 타입이 된다. 따라서, K에 전달한 ‘title’이 제거된 타입을 얻을 수 있다.

```typescript
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
```




---

<br><br>

## 3. Exclude, Extract, ReturnType


<br>

### 1) Exclude<T>


- Exclude 타입은 다음과 같이 T로부터 U를 제거하는 타입!!

```typescript
type A = Exclude<string | boolean, string>;
// boolean
```

<br>

#### a. Exclude<T> 직접 구현

```typescript

type Exlcude<T, U> = T extends U ? never : T;
```


---

<br><br>

### 2) Extract<T>

- Extract 타입은 다음과 같이 T로 부터 U를 추출하는 타입!!

```typescript
type B = Extract<string | boolean, boolean>;
// boolean
```


<br>

#### a. Extract<T> 직접 구현

```typescript
type Extract<T, U> = T extends U ? T : never;
```


---

<br><br>

### 3) ReturnType<T>

- `ReturnType`은 타입변수 T에 할당된 함수 타입의 반환값 타입을 추출하는 타입

```typescript
type ReturnType<T extends (...args: any) => any> = T extends (
  ...agrs: any
) => infer R
  ? R
  : never;

function funcA() {
  return "hello";
}

function funcB() {
  return 10;
}

type ReturnA = ReturnType<typeof funcA>;
// string

type ReturnB = ReturnType<typeof funcB>;
// number
```






