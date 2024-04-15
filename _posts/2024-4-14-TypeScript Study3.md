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

### d. 배열 요소의 타입 추출하기 :

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

### e. 튜플의 요소 타입 추출하기 :

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

### b. Typeof와 Keyof 함께 사용하기

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














