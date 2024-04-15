---
key: /2024/04/10/TypeScriptStudy2.html
title: TypeScript - TypeScript Study2
tags: typescript interface class generic promise keyof typeof infer
--- 


# 5. 인터페이스

## 0) 인터페이스 개념

- `타입 별칭`과 동일하게 타입에 이름을 지어주는 또 다른 문법!!

```typescript
interface Person {
  name: string;
  age: number;
}
```

<br>
- 인터페이스를 타입 주석과 함께 사용해 변수의 타입을 정의

```typescript

const person: Person = {
  name: "이정환",
  age : 27
};
```

---

<br><br>

### a. 선택적 프로퍼티

```typescript
interface Person {
  name: string;
  age?: number;
}

const person: Person = {
  name: "이정환",
  // age: 27,
};
```

---

<br><br>

### b. 읽기 전용 프로퍼티

```typescript
interface Person {
  readonly name: string;
  age?: number;
}

const person: Person = {
  name: "이정환",
  // age: 27,
};

person.name = '홍길동' // ❌
```

---

<br><br>

### c. 메서드 타입 정의하기

#### a) '함수 타입 표현식' 이용하는 방법

```typescript
interface Person {
  readonly name: string;
  age?: number;
  sayHi: () => void;;
}
```

<br><br>

#### b) '호출 시그니쳐' 이용하는 방법

```typescript
interface Person {
  readonly name: string;
  age?: number;
  sayHi: () => void;;
}
```

---

<br><br>

### d. 메서드 오버로딩

- 호출 시그니처를 이용해 메서드의 타입을 정의하면 오버로딩 구현이 가능(함수 타입 표현식은 불가능**)

```typescript
interface Person {
  readonly name: string;
  age?: number;
  sayHi(): void;
  sayHi(a: number): void;
  sayHi(a: number, b: number): void;
}
```


---

<br><br>

### e. 하이브리드 타입

- 인터페이스 또한 함수이자 일반 객체인 '하이브리드 타입'으로도 정의 가능!!

```typescript
interface Func2 {
  (a: number): string;
  b: boolean;
}

const func: Func2 = (a) => "hello";
func.b = true;
```

---

<br><br>

### f. 주의할 점**

- `타입 별칭`에서는 Union이나 Intersection 타입을 정의할 수 있었던 반면 `인터페이스`에서는 정의할 수 없다.

```typescript
type Type1 = number | string;
type Type2 = number & string;

interface Person {
  name: string;
  age: number;
} | number // ❌
```

<br>
- `인터페이스`로 만든 타입을 Union 또는 Intersection으로 이용해야 한다면 `타입 별칭`과 함께 사용하거나 타입 주석에서 직접 사용해야 한다.

```typescript
type Type1 = number | string | Person;
type Type2 = number & string & Person;

const person: Person & string = {
  name: "이정환",
  age: 27,
};
```


---

<br><br>

## 1) 인터페이스 확장하기

### a. 인터페이스 확장**

- 하나의 인터페이스를 다른 인터페이스들이 상속받아 중복된 프로퍼티를 정의하지 않도록 도와주는 것

<br>
- `interface 타입이름 extends 확장_할_타입이름` 형태로 extends 뒤에 확장할 타입의 이름을 정의하면 해당 타입에 정의된 모든 프로퍼티를 다 가지고 오게 된다. 

<br>
- 예시 1 : Dog, Cat, Chicken 타입은 모두 Animal 타입을 확장하는 타입이기 때문에 name, age 프로퍼티를 갖게 된다.
	

```typescript
interface Dog {
  name: string;
  ages: number; // 수정
  isBark: boolean;
}

interface Cat {
  name: string;
  ages: number; // 수정
  isScratch: boolean;
}

interface Chicken {
  name: string;
  ages: number; // 수정
  isFly: boolean;
}
```

<br><br>

```typescript

interface Animal {
  name: string;
  color: string;
}

interface Dog extends Animal {
  breed: string;
}

interface Cat extends Animal {
  isScratch: boolean;
}

interface Chicken extends Animal {
  isFly: boolean;
}
```

---

<br><br>

- 예시 2 : 아래 코드처럼 확장 대상 타입인 Animal은 Dog 타입의 슈퍼타입이다.

```typescript
interface Animal {
  name: string;
  color: string;
}

interface Dog extends Animal {
  breed: string;
}

(...)

const dog: Dog = {
  name: "돌돌이",
  color: "brown",
  breed: "진도",
};
```

---

<br><br>

### b. 프로퍼티 재 정의하기

- 확장과 동시에 프로퍼티의 타입을 재 정의 하는 것 또한 가능

```typescript
interface Animal {
  name: string;
  color: string;
}

interface Dog extends Animal {
  name: "doldol"; // 타입 재 정의
  breed: string;
}
```

<br>

- 주의 사항** : 프로퍼티를 재 정의할 때, 원본 타입을 `A`, 재 정의된 타입을 `B`라고 하면 반드시 `A`가 `B`의 슈퍼 타입이 되도록 재정의 해야 한다.

```typescript
interface Animal {
  name: string;
  color: string;
}

interface Dog extends Animal {
  name: number; // ❌
  breed: string;
}
```


---

<br><br>

### c. 타입 별칭을 확장하기**

- `인터페이스`는 `인터페이스` 뿐만 아니라 `타입 별칭`으로 정의된 객체도 확장

```typescript
type Animal = {
  name: string;
  color: string;
};

interface Dog extends Animal {
  breed: string;
}
```

---

<br><br>

### d. 다중 확장**

- 여러개의 인터페이스를 확장하는 것 또한 가능하다.
	- Java에서는 단일 상속만 가능했다.

```typescript
interface DogCat extends Dog, Cat {}

const dogCat: DogCat = {
  name: "",
  color: "",
  breed: "",
  isScratch: true,
};
```


---

<br><br>

## 2) 인터페이스 선언 합치기

### a. 선언 합침**

- 개념** : `타입 별칭`은 동일한 스코프 내에 중복된 이름으로 선언할 수 없는 반면 `인터페이스`는 가능하다.

<br>
- 이유** : 중복된 이름의 인터페이스 선언은 결국 모두 하나로 합쳐지기 때문이다.
	- 아래 코드에 선언한 Person 인터페이스들을 결국 합쳐져 다음과 같은 인터페이스가 된다.

```typescript
interface Person {
  name: string;
}

interface Person { // ✅
  age: number;
}
```

<br>
- 결론** : 동일한 이름의 인터페이스들이 합쳐지는 것을 `선언 합침`(Declaration Merging)이라고 부른다.

```typescript
interface Person {
  name: string;
}

interface Person {
  age: number;
}

const person: Person = {
  name: "이정환",
  age: 27,
};
```

---

<br><br>

### b. 주의할 점

- 아래 코드처럼, 동일한 이름의 인터페이스들이 동일한 이름의 프로퍼티를 서로 다른 타입으로 정의한다면 오류가 발생!
	- 동일한 프로퍼티의 타입을 다르게 정의한 상황을 ‘충돌’ 이라고 표현하며 선언 합침에서 이런 충돌은 허용되지 않는다.

```typescript
interface Person {
  name: string;
}

interface Person {
  name: number;
  age: number;
}
```

---

<br><br>

# 6. 클래스

## 0) JS의 클래스 소개

- 클래스는 동일한 모양의 객체를 더 쉽게 생성하도록 도와주는 문법이다.

<br>
- 아래 코드처럼 학생이 2명밖에 없어서 괜찮을지 몰라도 100명, 1000명의 학생을 만들어야 한다면 상상만해도 끔찍하다.

```javascript
let studentA = {
  name: "이정환",
  grade: "A+",
  age: 27,
  study() {
    console.log("열심히 공부 함");
  },
  introduce() {
    console.log("안녕하세요!");
  },
};

let studentB = {
  name: "홍길동",
  grade: "A+",
  age: 27,
  study() {
    console.log("열심히 공부 함");
  },
  introduce() {
    console.log("안녕하세요!");
  },
};
```

---

<br><br>

### a. 클래스 선언하기

- 필드를 선언했다면 다음으로는 생성자를 선언한다.

```javascript
class Student {
  // 필드
  name;
  age;
  grade;

  // 생성자
  constructor(name, grade, age) {
    this.name = name;
    this.grade = grade;
    this.age = age;
  }
}
```

<br>

- 클래스를 이용해 새로운 객체를 생성할 때에는 new 클래스이름 형태로 클래스의 생성자 함수를 호출한다.

```javascript
class Student {
  // 필드
  name;
  age;
  grade;

  // 생성자
  constructor(name, grade, age) {
    this.name = name;
    this.grade = grade;
    this.age = age;
  }
}

const studentB = new Student("홍길동", "A+", 27);

console.log(studentB);
// Student { name: '홍길동', age: 27, grade: 'A+' }
```

<br><br>

```javascript
class Student {
  // 필드
  name;
  grade;
  age;

  // 생성자
  constructor(name, grade, age) {
    this.name = name;
    this.grade = grade;
    this.age = age;
  }

  // 메서드
  study() {
    console.log("열심히 공부 함");
  }

  introduce() {
    console.log(`안녕하세요!`);
  }
}

let studentB = new Student("홍길동", "A+", 27);

studentB.study(); // 열심히 공부 함
studentB.introduce(); // 안녕하세요!
```




---

<br><br>

### b. 상속

- StudentDeveloper 클래스에서 Student 클래스의 생성자를 함께 호출해줘야 한다. 그렇지 않으면 생성되는 객체의 name, grade, age 값이 제대로 설정되지 않는다. 따라서, super 라는 메서드를 호출한다.

<br>
- super를 호출하고 인수로 name, grade, age를 전달하면 슈퍼 클래스(확장 대상 클래스)의 생성자를 호출한다. 따라서 `this.name`, `this.grade`, `this.age`의 값을 설정하게 된다.

```javascript
class StudentDeveloper extends Student {
  // 필드
  favoriteSkill;

  // 생성자
  constructor(name, grade, age, favoriteSkill) {
    super(name, grade, age);
    this.favoriteSkill = favoriteSkill;
  }

  // 메서드
  programming() {
    console.log(`${this.favoriteSkill}로 프로그래밍 함`);
  }
}
```


---

<br><br>

## 1) 타입스크립트의 클래스

- a. 타입스크립트에서는 클래스의 필드를 선언할 때 타입 주석으로 타입을 함께 정의!! 그렇지 않으면 함수 매개변수와 동일하게 암시적 any 타입으로 추론

<br>
- b. 생성자에서 각 필드의 값을 초기화 하지 않을 경우 초기값도 함께 명시!!


```typescript
class Employee {
  // 필드
  name: string = "";
  age: number = 0;
  position: string = "";

  // 메서드
  work() {
    console.log("일함");
  }
}
```

<br>
- 클래스가 생성하는 객체의 특정 프로퍼티를 선택적 프로퍼티로 만들기!!

```typescript
class Employee {
  // 필드
  name: string = "";
  age: number = 0;
  position?: string = "";

  // 생성자
  constructor(name: string, age: number, position: string) {
    this.name = name;
    this.age = age;
    this.position = position;
  }

  // 메서드
  work() {
    console.log("일함");
  }
}

```

---

<br><br>

### a. 클래스는 타입이다**

- 타입스크립트의 클래스는 타입으로도 사용할 수 있다. 클래스를 타입으로 사용하면 해당 클래스가 생성하는 객체의 타입과 동일한 타입!!
	- 아래 코드처럼 변수 employeeC의 타입을 Employee 클래스로 정의했다. 이 변수는 name, age, position 프로퍼티와 work 메서드를 갖는 객체 타입으로 정의된다.


```typescript
class Employee {
  (...)
}

const employeeC: Employee = {
  name: "",
  age: 0,
  position: "",
  work() {},
};
```



---

<br><br>

### b. 상속**

- 타입스크립트에서 클래스의 상속을 이용할 때, 파생 클래스(확장하는 클래스)에서 생성자를 정의 했다면 반드시 super 메서드를 호출해 슈퍼 클래스(확장되는 클래스)의 생성자를 호출해야 하며, 호출 위치는 생성자의 최상단 이어야만 한다.

```typescript
class ExecutiveOfficer extends Employee {
  officeNumber: number;

  constructor(
    name: string,
    age: number,
    position: string,
    officeNumber: number
  ) {
    super(name, age, position);
    this.officeNumber = officeNumber;
  }
}
```


---

<br><br>

## 2) 접근 제어자
 

### a. 접근 제어자


- `public` : 모든 범위에서 접근 가능

<br>
- `private` : 클래스 내부에서만 접근 가능

<br>
- `protected` : 클래스 내부 또는 파생 클래스 내부에서만 접근 가능


---

<br><br>

#### a) public

- 어디서든지 이 프로퍼티에 접근 가능, 필드의 접근 제어자를 지정하지 않으면 기본적으로 public 접근 제어자를 가짐!!

```typescript

class Employee {
  // 필드
  public name: string;
  public age: number;
  public position: string;

  ...
}

const employee = new Employee("이정환", 27, "devloper");

employee.name = "홍길동";
employee.age = 30;
employee.position = "디자이너";

```


---

<br><br>

#### b) private

- 특정 필드나 메서드의 접근 제어자를 private으로 설정하면 클래스 내부에서만 이 필드에 접근 가능하다. 

<br>
- 아래 코드처럼 name 필드를 private으로 설정했으므로 클래스 외부에서는 접근이 불가하다.


```typescript

class Employee {
  // 필드
  private name: string; // private 접근 제어자 설정
  public age: number;
  public position: string;

  ...

  // 메서드
  work() {
    console.log(`${this.name}이 일함`); // 여기서는 접근 가능
  }
}

const employee = new Employee("이정환", 27, "devloper");

employee.name = "홍길동"; // ❌ 오류
employee.age = 30;
employee.position = "디자이너";

```


---

<br><br>

#### c) protected

- private과 public의 중간으로 클래스 외부에서는 접근이 안되지만 클래스 내부와 파생 클래스에서 접근이 가능하도록 설정하는 접근 제어자
	- 자식 클래스 같은 것

```typescript

class Employee {
  // 필드
  private name: string; // private 접근 제어자 설정
  protected age: number;
  public position: string;

  ...

  // 메서드
  work() {
    console.log(`${this.name}이 일함`); // 여기서는 접근 가능
  }
}

class ExecutiveOfficer extends Employee {
 // 메서드
  func() {
    this.name; // ❌ 오류 
    this.age; // ✅ 가능
  }
}

const employee = new Employee("이정환", 27, "devloper");

employee.name = "홍길동"; // ❌ 오류
employee.age = 30; // ❌ 오류
employee.position = "디자이너";

```

---

<br><br>

### b. 필드 생략하기

- 접근 제어자를 생성자의 매개변수에도 설정할 수 있다.

```typescript

class Employee {
  // 필드
  private name: string;    // ❌
  protected age: number;   // ❌
  public position: string; // ❌

  // 생성자
  constructor(
    private name: string,
    protected age: number,
    public position: string
  ) {
    this.name = name;
    this.age = age;
    this.position = position;
  }

  // 메서드
  work() {
    console.log(`${this.name} 일함`);
  }
}

```

---

<br><br>

#### a) 필드 생략 : 간략히

- 타입스크립트에서 생성자에 접근 제어자를 설정하면 동일한 이름의 필드를 선언하지 못하게 된다. 그 이유는 생성자 매개변수에 `name`, `age`, `position` 처럼 접근 제어자가 설정되면 자동으로 필드도 함께 선언되기 때문!

<br>
- 그래서, 중복된 필드 선언을 모두 제거해주어야 한다.

```typescript

class Employee {
  // 생성자
  constructor(
    private name: string,
    protected age: number,
    public position: string
  ) {
    this.name = name;
    this.age = age;
    this.position = position;
  }

  // 메서드
  work() {
    console.log(`${this.name} 일함`);
  }
}

```

<br><br>

- 접근 제어자가 설정된 매개변수들은 `this.필드 = 매개변수`가 자동으로 수행된다. 따라서 위 코드의 `name`, `age`, `position`은 모두 this 객체의 프로퍼티 값으로 자동 설정되기 때문에 다음과 같이 생성자 내부의 코드를 제거해도 된다.

<br>
- 결론** : 타입스크립트에서 클래스를 사용할 때에는 보통 생성자 매개변수에 접근 제어자를 설정하여 필드 선언과 생성자 내부 코드를 생략하는 것이 훨씬 간결하고 빠르게 코드를 작성할 수 있다.

<br>
- 최종 코드 :

```typescript

class Employee {
  // 생성자
  constructor(
    private name: string,
    protected age: number,
    public position: string
  ) {}

  // 메서드
  work() {
    console.log(`${this.name} 일함`);
  }
}

```


---

<br><br>


## 3) 인터페이스 구현하는 클래스

- 타입스크립트의 인터페이스는 클래스의 설계도 역할이 가능하다, 인터페이스를 이용해 클래스에 어떤 필드들이 존재하고, 어떤 메서드가 존재하는지 정의할 수 있다.-
<br>
- 주의점** : 그런데, 이 인터페이스를 클래스에서 `implements` 키워드와 함께 사용하면, 이제부터 이 클래스가 생성하는 객체는 모두 이 인터페이스 타입을 만족하도록 클래스를 구현해야 한다.

```typescript

/**
 * 인터페이스와 클래스
 */

interface CharacterInterface {
  name: string;
  moveSpeed: number;
  move(): void;
}

class Character implements CharacterInterface {
  constructor(
    public name: string,
    public moveSpeed: number,
    private extra: string
  ) {}

  move(): void {
    console.log(`${this.moveSpeed} 속도로 이동!`);
  }
}

```

---

<br><br>


# 7. 제너릭

## 0) 제네릭 소개

- 함수나 인터페이스, 타입 별칭, 클래스 등을 다양한 타입과 함께 동작하도록 만들어 주는 타입스크립트의 중요한 기능!!

<br><br>

### a. 제네릭이 필요한 상황

```typescript

function func(value: any) {
  return value;
}

let num = func(10);
// any 타입

let str = func("string");
// any 타입

```

<br><br>

- 아래 코드에서 num에는 분명 Number 타입의 값 10이 저장되어 있을 것이 분명하다. 그러나, any 타입으로 추론되어 버렸기 때문에 toUpperCase 등의 String 타입의 메서드를 사용해도 타입스크립트가 오류를 감지하지 못한다. 

<br>
- 이 코드는 결국 실제로 실행하면 런타임 오류를 발생시키는 아주 위험한 상태가 된다!!

```typescript

function func(value: any) {
  return value;
}

let num = func(10);
let str = func("string");

num.toUpperCase()

```

<br><br>

- 결론** : 아래 코드처럼, `타입 좁히기`가 아니라 그냥 인수로 Number 타입의 값을 전달하면 반환 타입이 Number가 되고, 인수로 String 타입의 값을 전달하면 반환값의 타입도 String 타입이 되었으면 좋겠다. 
	- 이런 경우에 바로 제네릭을 사용해야 한다. func 함수를 제네릭 함수로 만들면 이 문제를 간단히 해결할 수 있다!!!

```typescript

function func(value: unknown) {
  return value;
}

let num = func(10);
// unknown 타입

let str = func("string");
// unknown 타입

if (typeof num === "number") {
  num.toFixed();
}

```


---

<br><br>

### b. 제네릭(Generic) 함수**

- 제네릭 함수** : 두루두루 모든 타입의 값을 다 적용할 수 있는 그런 범용적인 함수!!

<br>
- 함수 이름 뒤에 꺽쇠를 열고 타입을 담는 변수인 타입 변수 T를 선언합니다. 그리고 매개변수와 반환값의 타입을 이 타입변수 T로 설정

```typescript

function func<T>(value: T): T {
  return value;
}

let num = func(10);
// number 타입

```

<br><br>

- 중요** : T에 어떤 타입이 할당될 지는 함수가 호출될 때, 결정된다. 
	- 아래 사진처럼 `func(10)`에서 Number 타입의 값을 인수로 전달하면 매개변수 value에 Number 타입의 값이 저장되면서 `T`가 Number 타입으로 추론된다. 이때 `T`가 Number 타입으로 추론된다. 그럼, 이때의 func 함수의 `반환값 타입` 또한 Number 타입이 된다.

<br>
- ![이미지](/assets/images/typescript/tsgeneric.png)


---

<br><br>

## 1) 타입 변수 응용하기

### a. 제너릭 타입 변수 2개 사용

- 2개의 타입 변수가 필요한 상황이라면, T, U 처럼 2개의 타입 변수를 사용해도 된다.
	- `T`는 String 타입으로 `U`는 Number 타입으로 추론!!

```typescript

function swap<T, U>(a: T, b: U) {
  return [b, a];
}

const [a, b] = swap("1", 2);

```

<br><br>

### b. 배열 타입을 인수로 받는 제네릭 함수

- 함수 매개변수 data의 타입을 `T[]`로 설정했기 때문에 배열이 아닌 값은 인수로 전달할 수 없게 된다.

<br>
- 첫번째 인수로 `Number[]` 타입의 값을 전달했으므로 이때의 `T`는 `Number` 타입으로 추론된다. 이때의 함수 반환값 타입은 `Number` 타입

<br>
- 두번째 인수로 `(String | Number)[]` 타입의 값을 전달했으므로 이때의 `T`는 `String | Number` 타입으로 추론된다. 이때의 함수 반환값 타입은 `String | Number` 타입

```typescript

function returnFirstValue<T>(data: T[]) {
  return data[0];
}

let num = returnFirstValue([0, 1, 2]);
// number

let str = returnFirstValue([1, "hello", "mynameis"]);
// number | string

```

<br><br>

### c. 반환값 타입 : 배열의 첫번째 요소 타입

- 반환값의 타입을 배열의 첫번째 요소의 타입이 되도록 하려면 다음과 같이 튜플 타입과 나머지 파라미터를 이용하면 된다.

<br>
- 함수를 호출하고 [1, “hello”, “mynameis”] 같은 배열 타입의 값을 인수로 전달하면 T는 첫번째 요소의 타입인 Number 타입이 된다. 따라서, 함수 반환값 타입또한 Number 타입이 된다.

```typescript

function returnFirstValue<T>(data: [T, ...unknown[]]) {
  return data[0];
}

let str = returnFirstValue([1, "hello", "mynameis"]);
// number

```



<br><br>

### d. 타입 변수를 제한

- 타입 변수를 제한한다는 것은 함수를 호출하고 인수로 전달할 수 있는 값의 범위에 제한을 두는 것을 의미!!

<br>

- 아래 코드는 타입 변수를 `적어도` `length 프로퍼티`를 갖는 `객체 타입`으로 제한한 예시이다.
	- 중요** : 타입 변수를 제한할 때에는 확장(`extends`)을 이용!!

```typescript

function getLength<T extends { length: number }>(data: T) {
  return data.length;
}

getLength("123");            // ✅

getLength([1, 2, 3]);        // ✅

getLength({ length: 1 });    // ✅

getLength(undefined);        // ❌

getLength(null);             // ❌

```

<br>

- 정리** : `T extends { length : number }` 라고 정의하면 `T`는 이제 `{ length : number } `객체 타입`의 `서브 타입`이 된다.
	- 이제 `T`는 무조건 `Number` 타입의 `프로퍼티 length`를 가지고 있는 타입이 되어야 한다는 것!!


---

<br><br>

## 2) map, forEach 메서드 타입 정의하기

### a. JS에서 Map

- 원본 배열의 각 요소에 콜백함수를 수행하고 반환된 값들을 모아 새로운 배열로 만들어 반환

```javascript

const arr = [1, 2, 3];
const newArr = arr.map((it) => it * 2);
// [2, 4, 6]

```

---

<br><br>

### b. TS에서 Map

- 원본 배열의 각 요소에 콜백함수를 수행하고 반환된 값들을 모아 새로운 배열로 만들어 반환

```typescript
function map(arr: unknown[], callback: (item: unknown) => unknown): unknown[] {}
```

---

<br><br>

### c. TS에서 Map 제너릭

- 제너릭 함수 선언부

```typescript
function map<T>(arr: T[], callback: (item: T) => T): T[] {}
```


<br><br>

- 제너릭 함수 내부구현부


```typescript
function map<T>(arr: T[], callback: (item: T) => T): T[] {
  let result = [];
  for (let i = 0; i < arr.length; i++) {
    result.push(callback(arr[i]));
  }
  return result;
}
```

<br><br>

- 제너릭 함수 호출부

```typescript
const arr = [1, 2, 3];

function map<T>(arr: T[], callback: (item: T) => T): T[] {
  (...)
}

map(arr, (it) => it * 2);
// number[] 타입의 배열을 반환
// 결과 : [2, 4, 6]
```


---

<br><br>

### d. TS에서 Map 문제점 

- 문제 상황 : 아래 코드처럼 콜백함수가 모든 배열 요소를 String 타입으로 변환하도록 수정하면, 문제 발생
	- 인수로 전달되는 배열의 타입 변수 T에는 number 타입이 할당되었기 때문에 콜백 함수의 반환값 타입도 number 타입이 되어야 하기 때문!!

```typescript

const arr = [1, 2, 3];

function map<T>(arr: T[], callback: (item: T) => T): T[] {
  (...)
}

map(arr, (it) => it.toString()); // ❌

```

<br><br>

- 문제 해결 방법** : 
	- 타입 변수를 하나 더 추가해서 원본 배열의 타입과 새롭게 반환하는 배열의 타입을 다르게 설정!!

```typescript

const arr = [1, 2, 3];

function map<T, U>(arr: T[], callback: (item: T) => U): U[] {
  (...)
}

map(arr, (it) => it.toString());
// string[] 타입의 배열을 반환
// 결과 : ["1", "2", "3"]

```

---

<br><br>

### e. JS에서 ForEach

```typescript

const arr2 = [1, 2, 3];

arr2.forEach((it) => console.log(it));
// 출력 : 1, 2, 3

```

---

<br><br>

### f. TS에서 ForEach**

- Map과 동일하게 2개의 매개변수를 받는다.

<br>
- 첫번째 매개변수 `arr`에는 순회 대상 배열을 제공받고 두번째 매개변수 `callback`에는 모든 배열 요소에 수행할 함수를 제공 받는다. 
	- Map 메서드의 타입 정의와는 달리 forEach 메서드는 반환값이 없는 메서드이므로 콜백 함수의 반환값 타입을 void로 정의한다!!

```typescript
function forEach<T>(arr: T[], callback: (item: T) => void) {
  for (let i = 0; i < arr.length; i++) {
    callback(arr[i]);
  }
}
```

---

<br><br>

## 3) 제네릭 인터페이스, 제너릭 타입 별칭

- 제네릭은 인터페이스에도 적용할 수 있다. 인터페이스에 타입 변수를 선언해 사용하면 된다.

<br>
- 주의** : 
	- 제네릭 인터페이스는 제네릭 함수와는 달리 변수의 타입으로 정의할 때, 반드시 꺽쇠와 함께 타입 변수에 할당할 타입을 명시해주어야 한다. 
	- 그 이유는 제네릭 함수는 매개변수에 제공되는 값의 타입을 기준으로 타입 변수의 타입을 추론할 수 있지만 인터페이스는 마땅히 추론할 수 있는 값이 없기 때문아다. 

```typescript

let keyPair: KeyPair<string, number> = {
  key: "key",
  value: 0,
};

let keyPair2: KeyPair<boolean, string[]> = {
  key: true,
  value: ["1"],
};

```

---

<br><br>

### a. 인덱스 시그니쳐와 함께 사용하기

- 제네릭 인터페이스는 인덱스 시그니쳐와 함께 사용하면, 기존보다 훨씬 더 유연한 객체 타입을 정의할 수 있다.

```typescript

interface Map<V> {
  [key: string]: V;
}

let stringMap: Map<string> = {
  key: "value",
};

let booleanMap: Map<boolean> = {
  key: true,
};
```

<br>

#### a) 인덱스 시그니처 사용 설명** : V로 범용적이거나 String이나 Boolean 같이 타입 제한적으로 객체 타입을 정의하여 사용할 수 있다.

- 한개의 타입 변수 V를 갖는 제네릭 인터페이스 Map을 정의했다. 이 인터페이스는 인덱스 시그니쳐로 key의 타입은 string, value의 타입은 V인 모든 객체 타입을 포함하는 타입이다. 

<br>
- 변수 stringMap의 타입을 Map<string> 으로 정의했다. 따라서 V가 string 타입이 되어 이 변수의 타입은 key는 string이고 value는 string인 모든 프로퍼티를 포함하는 객체 타입으로 정의된다.

<br>
- 변수 booleanMap의 타입을 Map<boolean> 으로 정의했다. 따라서 V가 boolean 타입이 되어 이 변수의 타입은 key는 string이고 value는 boolean인 모든 프로퍼티를 포함하는 객체 타입으로 정의된다.


---

<br><br>

### b. 제네릭 타입 별칭


```typescript

type Map2<V> = {
  [key: string]: V;
};

let stringMap2: Map2<string> = {
  key: "string",
};
```

---

<br><br>

### c. 제네릭 인터페이스 활용 예

- 수정 전 코드** :
	- 학생일수도 개발자일 수도 있는 User 타입을 정의!!
	- 학생만 할 수 있는 기능이 점점 많아진다고 가정하면, 매번 기능을 만들기 위해 함수를 선언할 때 마다 조건문을 이용해 타입을 좁혀야 하기 때문에 결국 매우 불편하다. 게다가 타입을 좁히는 코드는 중복 코드라서 비효율적이다!!

```typescript

interface Student {
  type: "student";
  school: string;
}

interface Developer {
  type: "developer";
  skill: string;
}

interface User {
  name: string;
  profile: Student | Developer;
}

function goToSchool(user: User<Student>) {
  if (user.profile.type !== "student") {
    console.log("잘 못 오셨습니다");
    return;
  }

  const school = user.profile.school;
  console.log(`${school}로 등교 완료`);
}

const developerUser: User = {
  name: "이정환",
  profile: {
    type: "developer",
    skill: "typescript",
  },
};

const studentUser: User = {
  name: "홍길동",
  profile: {
    type: "student",
    school: "가톨릭대학교",
  },
};
```

<br><br>

- 수정 후 코드** : 
	- `goToSchool` 함수의 매개변수 타입을 `User<Student>` 처럼 정의해 학생 유저만 이 함수의 인수로 전달하도록 제한할 수 있다.
	- 결과적으로 함수 내부에서 타입을 좁힐 필요가 없어져서 코드가 훨씬 간결해진다!!

```typescript

interface Student {
  type: "student";
  school: string;
}

interface Developer {
  type: "developer";
  skill: string;
}

interface User<T> {
  name: string;
  profile: T;
}

function goToSchool(user: User<Student>) {
  const school = user.profile.school;
  console.log(`${school}로 등교 완료`);
}

const developerUser: User<Developer> = {
  name: "이정환",
  profile: {
    type: "developer",
    skill: "TypeScript",
  },
};

const studentUser: User<Student> = {
  name: "홍길동",
  profile: {
    type: "student",
    school: "가톨릭대학교",
  },
};

```


---

<br><br>

## 4) 제네릭 클래스

### a. 제네릭 없는 TS 클래스

- 기존 클래스인 `NumberList` 뿐만 아니라 `StringList` 클래스 하나 더 필요하다면 제네릭 없이는 새로운 클래스를 하나 더 만들어줘야 한다.
	- 매우 비효율적이다. 모든 리스트에 메서드가 새롭게 추가된다거나 동작이 수정되는 경우라도 생각하면 벌써 끔찍하다. 따라서, 제네릭 클래스를 사용해 여러 타입의 리스트를 생성할 수 있는 범용적을 클래스를 정의하자!!

```typescript
class NumberList {
  constructor(private list: number[]) {}

	push(data: number) {
    this.list.push(data);
  }

  pop() {
    return this.list.pop();
  }

  print() {
    console.log(this.list);
  }
}

const numberList = new NumberList([1, 2, 3]);
```

<br><br>

```typescript
class NumberList {
  constructor(private list: number[]) {}
	(...)
}

class StringList {
  constructor(private list: string[]) {}

	push(data: string) {
    this.list.push(data);
  }

  pop() {
    return this.list.pop();
  }

  print() {
    console.log(this.list);
  }
}

const numberList = new NumberList([1, 2, 3]);
const numberList = new StringList(["1", "2", "3"]);
```

---

<br><br>

### b. 제네릭 있는 TS 클래스

- 클래스는 생성자를 통해 타입 변수의 타입을 추론할 수 있기 때문에 생성자에 인수로 전달하는 값이 있을 경우 타입 변수에 할당할 타입을 생략해도 된다.

```typescript

class List<T> {
  constructor(private list: T[]) {}

  push(data: T) {
    this.list.push(data);
  }

  pop() {
    return this.list.pop();
  }

  print() {
    console.log(this.list);
  }
}

const numberList = new List([1, 2, 3]);
const stringList = new List(["1", "2"]);

```

<br><br>

- 만약 타입변수의 타입을 직접 설정하고 싶다면 다음과 같이 하면 된다.


```typescript
class List<T> {
  constructor(private list: T[]) {}

  (...)
}

const numberList = new List<number>([1, 2, 3]);	// 이렇게 설정!!
const stringList = new List<string>(["1", "2"]);	// 이렇게 설정!!
```


---

<br><br>

## 5) 프로미스와 제너릭

### a. JS Promise 개념 복습

-  JavaScript에서 비동기 작업을 대표하는 객체다. 한 작업이 완료될 때까지 기다렸다가, 그 결과에 따라 성공(`resolve`) 또는 실패(`reject`)를 처리한다. 
	- 왜냐하면 Promise는 비동기 작업의 최종 결과를 나타내기 때문이다.

<br>
- Promise를 사용하면, 비동기 작업을 순차적으로 또는 병렬로 처리하는 것이 가능해진다. 이는 코드의 가독성과 유지보수성을 크게 향상시킨다.

<br><br>

#### a) Async/Await의 도입 

- Promise가 비동기 코드를 다루는 강력한 도구지만, 여전히 `.then()`과 `.catch()`의 연속 사용은 코드를 어렵게 만들 수 있다. 
	- 이 문제를 해결하기 위해 ES6에서는 `async/await` 문법이 도입되었다.

<br>
- `async/await`은 Promise 기반 로직을 보다 쉽게 작성할 수 있게 해주는 문법적 설탕(syntactic sugar)이다. 
	- 중요** : 이 문법을 사용하면 비동기 코드를 동기 코드처럼 순차적으로 작성할 수 있기 때문이다!!

<br>
- 함수 앞에 `async`를 붙이면 해당 함수는 Promise를 반환하게 되며, 함수 내부에서는 `await` 키워드를 사용하여 비동기 작업의 완료를 기다릴 수 있다. 
	- 이 방법을 통해, 비동기 작업의 결과를 변수에 할당하고, 에러 처리를 `try/catch` 문으로 할 수 있다.(`b. Promise 사용하기`에서 Promise 예시 코드 확인!!)

---

<br><br>

### b. Promise 사용하기

- Promise는 제네릭 클래스로 구현되어 있다. 새로운 Promise를 생성할 때, 타입 변수에 할당할 타입을 직접 설정해 주면 해당 타입이 바로 resolve 결과값의 타입!!

<br>
- reject 함수에 인수로 전달하는 값인 실패의 결과값 타입은 정의할 수 없다. `reject` 함수는 `unknown` 타입으로 고정되어 있기 때문에 `catch` 메서드에서 사용하려면 타입 좁히기를 통해 안전하게 사용하는걸 권장!!

```typescript

const promise = new Promise<number>((resolve, reject) => {
  setTimeout(() => {
    // 결과값 : 20
    resolve(20);
  }, 3000);
});

promise.then((response) => {
  // response는 number 타입
  console.log(response);
});

promise.catch((error) => {
  if (typeof error === "string") {
    console.log(error);
  }
});

```

---

<br><br>

### c. Promise 반환 타입**

- Promise 객체를 반환한다면, 아래 예시처럼 함수의 반환값 타입에서 지정된다.

```typescript
function fetchPost() {
  return new Promise<Post>((resolve, reject) => {
    setTimeout(() => {
      resolve({
        id: 1,
        title: "게시글 제목",
        content: "게시글 본문",
      });
    }, 3000);
  });
}
```

<br>
- 직관적으로 반환값 타입을 직접 명시하는 것도 아래 코드처럼 바로 직접 명시가 가능하다!!

```typescript
function fetchPost(): Promise<Post> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        id: 1,
        title: "게시글 제목",
        content: "게시글 본문",
      });
    }, 3000);
  });
}
```







---

<br><br>

















