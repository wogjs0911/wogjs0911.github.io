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















