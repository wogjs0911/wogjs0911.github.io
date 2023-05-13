---
key: /2023/05/13/Week24-Java,Web.html
title: Interview - Java, Web, Spring, DB
tags: java, web
---

# 1. Java + FrameWork : 230512

### 1) OOP 

- 프로그래밍 방법론 중에 하나이다. 객체를 중심으로 둔 방법론이다.

---

<br>

### 2) Mybatis

- 데이터베이스를 이용하기 위한 Mapper 프레임워크입니다. 데이터를 저장하기 위한 라이브러리 중에 하나이다. 데이터 베이스를 이용하기 위한 프레임워크

<br>
- DAO 인터페이스와 Mapping을 연결해준다.

---

<br>

### 3) JPA 

- 데이터베이스를 이용하기 위한 ORM(객체 관계형 매핑) 관련 프레임워크이다. DAO나 Repository를 대신 구현해준다.


---

<br>

### 4) 가비지 컬렉터 : 

- 메모리에 할당되는 것은 Heap에 할당되는 데이터이다. 
 
<br>
- 원래 Heap에 있는 데이터는 트리 구조이다. 

<br>
- 시간이 여유 있을 때, 가비지 컬렉터가 돌아다닌다

<br>
- 언제 가비지 컬렉터가 삭제 되는지?  
    - 참조한 변수를 지금 막 생성한 것이 있고 나중에 생성한 것이 있다.
    - 즉, 메모리가 없거나 시간이 있으면, 
    - 참조 변수가 적은 순서대로(방금 생성된 것) 제거된다.
    - 메모리가 부족할 때, 자기가 참조하지 않은 녀석들을 제거한다.
    - 항상 상황을 봐가면서 동작하게 된다.


---

<br>

### 5) 자바의 데이터 타입 : 

- 기본 데이터 타입 : short, byte, int, Long, float, double, boolean, char

<br>
- Wrapper 클래스 : Integer, Long, 

<br>
- 기본 데이터 타입을 물어보는 건지? : 수준이 낮은 질문 

<br>
- 성질을 물어보는 건지? : Wrapper 클래스인지? Primitive 클래스인지 구분하기!

<br>
- Stack에 값형식 변수가 할당되고 Heap에 참조형 변수(클래스, 인터페이스)가 할당!
    - 값 형식* : java에서 기본적으로 제공해주는 데이터 타입, 값의 형식을 구분한 형식
    - 참조 형식* : 값이 아니라 값들을 담을 구조를 의미한다. 구조화된 데이터 구조를 설명.
    - 값형 형식 변수* : 값만 담는 그릇
    - 참조 형식 변수* : 구조를 참조할 수 있는 그릇이다.  
    - 참조는 주소를 저장하지 않고 참조를 저장하는 것이다. 물리적으로는 주소를 저장하지만 실제 주소는 아니다.


---

<br>

### 6) 캡슐화* : 

- 캡슐은 관련 있는 속성들을 모아서 데이터 구조를 정의한다.(피상적인 교과서적인 이야기) 코드의 재사용성 가능

<br>
- 객체들이 책임을 적절히 나누어 부여하는 것(중요!!)** : 내부적인 이야기
	- 책임이란? 코드를 의미한다. ‘기능’을 말하는 것 같다.**
    - @Service에서 @Requset, @Response를 사용하면 안 된다. @Controller에서는 입출력만 있어야 한다.**

<br>
- 캡슐화를 하지 않으면, 구조화된 프로그래밍이 되어서 코드를 한 곳에 모아서 구현되어 책임이 없다. 가독성이 떨어짐.


---

<br>

### 7) 패턴 

- 구조가 구조화된 것이다.


---

<br>

### 8) 다형성 및 동적 바인딩

<br>

#### a. 다형성

- 다양한 성질을 보이는 클래스나 메서드의 다양한 형태이다.

- 선생님 답** : 캡슐(=클래스)에 다양한 성질을 보이도록 하는 것이다. 전제조건은 캡슐이 부품이 갈아 끼울 수 있어야 한다. 또한, 도킹 같은 것을 의미한다. 이러한 개념은 인터페이스 개념에서 사용된다.

- 캡슐을 만들 때, 분리형으로 만들어서 부품으로 만들어서 꽂아서 사용한다.

- 쌤 답**: 다양한 형태로 부품을 바꿔낄 수 있도록 하는 성질, 다양한 형태로 조립이 가능한 성질, 부품을 바꿔낄 수 있는 것은 인터페이스에서 사용한다.***

- 인터페이스에서 사용하는 방법은 3가지 방식이 있다. 오버로드 생성자 인젝션!, setter 인젝션!, field 인젝션! => 이것은 스프링의 결합인 @Autowired 기능이다. 엄청 편리해졌다.

- 스프링에서 다형성은 Mybatis의 DAO랑 JPA의 DAO를 부품으로 교체할 수 있는 개념이다.  Controller vs RestController 개념이다.
    
---

<br>

#### b) 동적 바인딩 : 자바에서는 컴파일 동작과 런타임 동작에서 코드가 실행된다.

- 컴파일 전에 함수가 호출되는 위치가 결정되면 이것은 정적 바인딩이다.

- 런타임(함수 호출)시, 함수가 호출되는 위치가 결정되면 동적바인딩이다. 따라서, 전달되는 객체에 따라서 호출되는 함수가 달라진다!

- static은 미리 마련된 변수라서 정적 바인딩이다.

- dynamic은 그때 그때 함수가 호출될 때, 바뀐다. 동적 바인딩 : 동적으로 함수의 위치를 결정하기! 함수의 위치를 동적으로**

- 자바는 주소와 함수를 매핑해놓는 주소공간이 있다.

- 자바는 주소와 함수를 매핑해놓는 주소 공간이 있다.**

- 함수 동적 바인딩 : 함수가 호출될 주소가 자기가 가지고 있는 객체의 함수에 의해 결정된다.


---

<br>

### 9) 상속(has a, is a) :

#### a. has a 상속 

- 일반적인 상속이 아니라, 조립을 의미한다.(추상클래스에서 사용하는 개념****)
	- 틀이 없는 경우가 있기 때문에 이 경우에는 전부 조립을 해야 한다. 

---

<br>

#### b. is a 상속 

- 틀을 물려받는 것. 부모의 캡슐을 나의 틀(framework)로 사용하겠다.(implement) 
	- 중요! : 다른 캡슐을 나의 틀(framework)로 사용하겠다.(인터페이스에서 사용하는 개념**)
	- 보통 그 틀을 고쳐쓰거나 사용한다.  	
	- 교과서 의미 : 부모의 속성을 물려받는 것**


---

<br>

#### c. 상속을 이용하여 개발하면, 상속의 부족한 단점

- 차라리 조립할 걸(상속)의 의미

- 결합력이 높아진다. 

- 다시 처음부터 만드는게 더 빠를수도..




---

<br>

### 10) 클래스 vs 인스턴스

- 클래스 : 하나의 타입이다.(메뉴판의 자장면 **) -> 클래스는 실존한는 것이 아니다…

- 인스턴스 : 실체화된 것(주문하면, 실제로. 존재하는 자장면이다.**)  
  

---

<br>

### 11) 스레드?

- 실행 흐름을 만드는 최소 단위.**

- 프로세스도 실행 단위이기 때문이다.

- 메인 스레드는 메인 함수에 약속되어 있다.

- 메인 함수이다.  

- 인터페이스 : Runnable, 실행함수 :Thread


---

<br>

### 12) Static 키워드란?

- static 키워드는  클래스가 메모리에 올라갈 때, 미리 이미 자동적으로 생성되어 준비해놓는 것?이다. 그래서 바뀌지 않는다.

- static 키워드를 빼면, 인스턴스 때마다 생성되어 호출되어야 한다.

- 그래서, 전역적으로 사용할 수 있다. 인스턴스를 생성하지 않아도 되어서 속도가 빠르다.

- 모든 인스턴스에 공통적으로사용할 때, 사용한다.


---

<br>

### 13) 추상클래스, 인터페이스

#### a. 추상 클래스 : 공통 분모

- 추상 => 추상화 : “일반화” == “공통 자료형”을 의미한다?

- 캡슐들의 집중화한 것을 “추상화”라고 한다.

- 중요!: 집중화이다. 일괄처리가 가능하다.

- 공통 분모 클래스라서 공통 분모 자료형으로도 사용할 수 있다.

<br>

---

#### b. 인터페이스 : 

- 일괄처리만 가능하고 집중화는 불가능하다.

- 분리형 부품으로 나누어져 있는 부품에 결합을 위한 ‘약속’이다.


---

<br>

### 14) 오버로드 vs 오버라이드

#### a. 오버로드 

- 같은 이름의 함수를 인자를 더 많이 확장된 함수
    - 오버로드 생성자를 생각 할 것!
    - 인자들을 적재해서 만든 함수

---

<br><br>

#### b. 오버라이드 : 

- 부모 클래스의 메서드를 재정의하여 사용하는 것

- 부모 클래스의 메서드를 올라타서 재정의()하거나 고쳐쓰는 함수이다.



---

<br>

### 15) 제네릭 : 

- 형식인데 무엇이든 될 수 있는 형식을 의미한다.

- 타입을 넣어주는 것에 따라서 정해진다.

- 클래스인데 타입을 넘겨받는 템플릿 형식의 클래스이다.** 형식이 어떠한 형식이 될 수 있다. 

- 일부분의 형식이 비어져서 있어서 그 부분을 채워서 

---

<br>

### 16) 배열 vs ArrayList

#### a. 배열 

- 고정 길이의 저장소

<br>

#### b. ArrayList

- 가변 길이의 저장소, 추상(기능을 가지고 있다.) 데이터 타입,  콜렉션 기능을 구현하고 잇는 저장소 데이터를 add와 get 이러한 기능함수를 가진 데이터 저장소


---

<br>

### 17) Stack vs List

- 자료 구조 공부하기! 데이터 구조

- Stack :  마지막 순서의 데이터를 제일 먼저 꺼낼 수 있는 데이터 구조임. 마지막 순서에 있는 데이터 구조를 자주 사용하는 경우에 사용한다. 추상화 데이터 구조(= 기능을 가지고 있는 데이터 구조),

- LinkedList : 가운데 순서에 있는 데이터를 관리하기에는 LinkedList를 이용한다. 검색하기에는 첫 순서부터 찾아서 검색 속도가 매우 느리다.

- ArrayList : 검색하기에는 LinkedList보다는 빠르다., 삽입, 삭제 시에는 자리가 비면, 순서를 뒤에서 앞으로 하나씩 미루기 때문에 비효율적이다. 


---

<br>

### 18) Tree, Queue, Graph :

#### a. Tree

- 추가적으로 Full Scan하는 경우(도서관 검색)에는 책 코드별 조회가 많이 일어나서 다른 데이터 타입을 사용한다.  그래서 Tree 타입을 사용한다!** 

- 그래서 저장소에서는 Tree 구조를 많이 이용한다.

---

<br>

#### b. Queue :

- 버퍼를 의미함. FIFO이다. 먼저 들어온 사람을 먼저 내보낸다.

- 메서지를 보낼 때, 사용한다. 또한, 줄을 설 때, 사용한다. 


---

<br>

#### c. Graph

- Vertex(꼭지점) 이용

- 각 역할들을 연결 짓기 위해서 사용한다.(사촌지간 관계 보여주기)


---

<br>

### 19) List, LinkedList 계열

- 콜렉션을 갖고 있고 이터러블을 물려받아서 사용한다.

- LinkedList 계열 : Set, Map, Queue 계열



---

<br>

### 20) 접근 제어자 종류 정리 : private, protected

#### a. Private 

- 클래스 내부에서만 사용된다. 

---

<br>

#### b. Protected

- 부모가 protected를 써서 자식에게만 노출해준다.
	- 하지만, 언제 쓰지? 자식 때문에 쓰는게 아니라(나중에 다른 자식 클래스 추가 시, 종속적으로 바뀐다.) 자식에게 책임을 전가할 때, 사용한다!!**
	- 자식이 책임지도록 하며 자식에서 메서드를 직접 구현한다. 이것을 구현할 때는 abstract 메서드에 protected를 사용한다!

---

<br>

### 21) 해시 코드

- 해시의 의미 : 식별자를 의미한다.

<br>

- Program.java

```java
package main.java.test4.obj.identified;

import java.util.HashSet;
import java.util.Set;

public class Program {

    public static void main(String[] args) {
        String str1 = "hello"; // 상수형 객체는 1개만 만들어준다.
        String str2 = "hello"; // 상수형 객체는 1개만 만들어준다. 추후에 더 이상 안 만든다.
	   
	   // 사용자에 의해 new String에 의해 객체가 새로 만들어진다.
        String str3 = new String("hello"); 
        String str4 = new String("hello"); 

        System.out.println(str1 == str2);   // '=='는 객체를 비교하고 // true
        System.out.println(str1.equals(str2));  // 'equals'는 객체의 값만 비교 // true
        // String은 클래스 타입이라서 객체로 인식한다.
        
        // '=='는 객체를 비교하고 
        System.out.println(str3 == str4);    // new String()이라서 false! 그래서, false이다.
        
        // 'equals'는 객체의 값만 비교
        System.out.println(str3.equals(str4));  // true!

        // String은 클래스 타입이라서 객체로 인식한다.

        Exam exam1 = new Exam(1, 2, 3);
        // Exam exam2 = new Exam(1, 2, 3);
        Exam exam2 = new Exam(1, 2, 4);

        System.out.println(exam1 == exam2); // false
        System.out.println(exam1.equals(exam2)); // true
        // 하지만, 사용자가 만든 Object라면 해당 Object를 만든 사용자가 equals도 직접 만들어줘서 정해준다!

        // 해시코드인 식별자는 런타임시, JVM에서 정해준다.
        // 해시 값은 식별자이다. 
        // exam1, exam2는 hashCode 메서드가 사용자에 의해서 다시 재정의되어 만들어질 수 있다.**
        System.out.println(exam1.hashCode());   // 112810359
        System.out.println(exam2.hashCode());	  // 2124308362

        Set<Exam> set = new HashSet<>();

        set.add(exam1);
        set.add(exam2);

        // 위의 Exam 인스턴스를 객체가 다른 2개로 인식한다.
        System.out.println(set.size()); 	// 2
    }
}

```

<br>

- Exam.java

```java
package main.java.test4.obj.identified;


public class Exam{

    int kor;
    int eng;
    int math;

    @Override
    public boolean equals(Object obj){
        Exam exam = (Exam) obj;
        return (this.kor == exam.kor) &&  (this.eng == exam.eng); 
    }
     
    public Exam() {
    }


    public Exam(int kor, int eng, int math) {
        this.kor = kor;
        this.eng = eng;
        this.math = math;
    }


    public int total(){
        int result = 0;
        result = kor + eng +math;

        return result;
    }

}
```

---

<br>

### 22) Hash Table, HashMap

- 기본적으로 키와 값을 저장하는 콜렉션이다. 

#### a. Hash Table

- 일단 무겁다. 너무 예전에 만들어졌고 초창기 java에는 해시 테이블 밖에 없었다. 스레드에 안전해서 동기화가 가능하다. 락킹이 내제화 되어 있다. 

- 식별값에 null을 넣을 수 없다. 마치 UQ와 같다.

- Hash Table은 이터레이터말고 다른 enumeratable을 사용한다. 

---

<br>

#### b. Hash Map

- 새로 발전되었고 Hash Table보다 경랑화 되어 있고 key-value 가능하다. 

- 식별값에 null을 넣을 수 있다. 대신 식별을 위해서 1개만 넣을 수 있다. 

- Hash Map은 이터레이터를 이용한다.  




---

<br>

### 23) JAVA 직렬화 : 아래 같은 데이터 타입 처리 방법

#### a. FileOutputStream 

- 4바이트씩 파일의 데이터를 전송해야 한다.

<br>

#### b. DataOutputStream 

- 파일의 문자열을 전송하고 싶으면 DataOutputStream으로 안 쓰면, 데이터를 바이트 단위로 보내야 한다.(FileOutputStream와 같은 상황이다.)

<br>

#### c. ObjectOutputStream 

- 객체를 통째로 보내준다!

<br>

#### d. 실습 코드 

- transient 이용하기!

<br>

- Program1.java

```java
package main.java.test5.serialize;
import java.io.DataOutputStream;
import java.io.FileOutputStream;
import java.io.ObjectOutput;
import java.io.ObjectOutputStream;

public class Program1 {

    public static void main(String[] args) {

        Exam exam = new Exam(1,2,3);

        // FileOutputStream : 4바이트 짜리 데이터를 여러번 보낼 수 밖에 없다?
        FileOutputStream fos = new FileOutputStream("res/data.txt");

        // DataOutputStream : 파일의 문자열을 전송하고 싶으면 DataOutputStream으로 안 쓰면, 데이터를 바이트 단위로 보내야 한
        // DataOutputStream dos = new DataOutputStream(""res/data.txt"");

        // ObjectOutputStream :해당 객체를 모두 내보낼 것인지 정렬을 어떻게 할것인지 설정도 해줘야 한다.
        // 그래서, 그 객체가 
        // 그 객체를 읽기 위해서 무조건 FileInputStream으로 읽어야한다. 불편한다.
        // 하지만, 요즘에는 JSON으로 쓰고 읽는다.
        ObjectOutputStream oos = new ObjectOutputStream(fos);
        oos.writeObject(exam);
        
        fos.close();
    }
}

```

- Exam1.java

```java
package main.java.test5.serialize;

import java.io.Serializable;

public class Exam1 implements Serializable{

    int kor;
    int eng;
    // int math;
    transient math;

    @Override
    public boolean equals(Object obj){
        Exam exam = (Exam) obj;
        return (this.kor == exam.kor) &&  (this.eng == exam.eng); 
    }
     
    public Exam() {
    }


    public Exam(int kor, int eng, int math) {
        this.kor = kor;
        this.eng = eng;
        this.math = math;
    }


    public int total(){
        int result = 0;
        result = kor + eng +math;

        return result;
    }

}

```

---

<br><br>

# 2. Web 개념 : 230512

### 1) 라이브러리 vs 프레임워크

- 라이브러리 : 재사용할 수 있는 코드. 그 중 라이브러리 중에 하나가 프레임워크다.

- 즉, 라이브러리 중에 '프레임워크'가 있다.

---

<br>

### 2) MVC 패턴?

- model을 기준으로 Controller와 View가 나뉜다. 

- Controller에서 model이 만들어지고 그 model을 소개한다.(view)

- MVC model1은 사용하지 않는다. 1개의 파일에서 MVC를 구성하기 때문이다.

- 요즘에는 MVC model2를 사용한다. 

---

<br>

### 3) Pojo(순수 자바 코드)

- Front Controller가 서블릿이고 이를 Pojo 컨트롤러라고 부른다. 

- 프론트 컨트롤러를 가지고 쓰거나 없이 쓰거나 한다. 


---

<br>

### 4) JSTL

- 태그 라이브러리 

- view단에서 화면을 제어하기 위해서 사용 


---

<br>

### 5) JSP에서 세션을 꺼내고 사용하는 방법????

- 왜 여기서 꺼내지?

---

<br>

### 6) 서블릿, AJAX, 개념정리


---

<br>

### 7) Rest, Restful API 차이점

#### a. REST**

- Representational State?? : 문서를 찾으면 어느 장소에 있는 상태를 말해주는 “경로 지정 방법”이다. 

- 구조화된 데이터를 가지고 표현하는 것 : ‘REST’ 방식 

- 자원의 요청하는 방식이 보통 웹에서 사용한다. 이것이 REST 방식이다. 이렇게 자원을 표기한다. 

- 자원의 구조적, 계층적으로 표현하고 있는 방식**

---

<br>

#### b. Restful AP**

- 그러한 형태를 모두 모아서 Restful이라고 말한다.

- 웹서비스를 포함해서 다양한 이러한 형태의 자원을 제공해주는 자원제공제이다.

- 자원을 요청할 때, 요청할 때 사용할 수 있는 자원 상태의 표기법을 이용할 수 있는 

- Rest 방식을 이용하는 다양한 자원의 방식과 유사한 API 


---

<br>

### 8) 세션 vs 쿠키

#### a. 세션 

- 어떤 사용자가 서버를 사용할 수 있도록 하는 자원을 할당받은 기간을 의미한다. 세션 기간, 식별자(세션 키) 등등 

<br>

#### b. 쿠키 

- 사용자가 저장하게되는 값들을(클라이언트가 저장하게되는 값들을) 이야기한다.


---

<br>

### 9) jQuery? 사용법

- 지금의 jQuery 가장 중요한 기능이 Cross-Brower 기능이었다. 

<br>
- 하지만, jQuery를 사용하지 않았다고 이야기 할 경우 
	- 시대적으로 Jquery 쓰임 가치가 떨어진다고 생각해서 쓰지 않았습니다.

<br>
- 원래 Jquery 기능 : Css 쿼리 셀렉터, 크로스 브라우저도 기본으로 된다. 30kB 아래  용량

<br>
- Vanilla JS : 이제는 기본적으로 여기서 위의 3가지 기능이 사용된다.




