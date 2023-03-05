---
key: /2023/03/01/GongguProject-FeatTest.html
title: Project - 채팅 기능 테스트
tags: springboot jsp websocket HTTP mariaDB
---

# 1. 채팅 기능 테스트 1 : 230301

- 내용 : WebSocket을 이용하고 Postman의 API 테스트를 통해 JSON 타입의 데이터로 전송으로 채팅이 가능하도록 테스트 
	
- 목표 : 스프링부트의 롬북 기능, jackson 패키지의 ObjectMapping 클래스를 통한 JSON 타입의 데이터 바인딩, HTTP 프로토콜과 WebSockek에 관한 내용 학습

<br>

### 1) WebSocket

#### a. WebSocket 개념

- 기존의 단방향 HTTP 프로토콜과 호환되어 양방향 통신을 제공하기 위해 개발된 프로토콜.

- 일반 Socket통신과 달리 HTTP 80 Port를 사용하므로 방화벽에 제약이 없으며 통상 WebSocket으로 불린다.

- 접속까지는 HTTP 프로토콜을 이용하고, 그 이후 통신은 자체적인 WebSocket 프로토콜로 통신하게 된다.

<br>

#### b. HTTP 프로토콜 추가 개념

<br>
- 모든 HTTP를 사용한 통신은 클라이언트가 먼저 요청을 보내고, 그 요청에 따라 웹 서버가 응답하는 형태이며 웹 서버는 응답을 보낸 후 웹 브라우저와의 연결을 끊는다. 양쪽이 데이터를 동시에 보내는 것이 아니기 때문에 이러한 통신 방식을 반이중 통신(Half Duplex)라고 한다.

<br>
- 이처럼 HTTP 통신의 특징인 (연결 -> 연결 해제) 때문에 효율이 많이 떨어지게 되고, 웹 브라우저 말고 외부 플러그인이 항상 필요하게 되었다. 그래서 이런 상황을 극복하고자 2014년 HTML5에 웹 소켓을 포함하게 되었다. 웹소켓은 클라이언트가 접속 요청을 하고 웹 서버가 응답한 후 연결을 끊는 것이 아닌 Connection을 그대로 유지하고 클라이언트의 요청 없이도 데이터를 전송할 수 있는 프로토콜이다. 프로토콜의 요청은 [ws://~]로 시작한다.

<br>
- 웹소켓은 HTTP환경에서 전이중 통신(Full Duplex, 2-way communication)을 지원하기 위한 프로토콜이며 RFC6455에 정의되어 있다. HTTP 프로토콜에서 HandShaking을 완료한 후, HTTP로 동작하지만, HTTP와는 다른 방식으로 통신을 한다.

<br>
- WebSocket이 기존의 TCP Socket과 다른 점은 최초 접속이 일반 HTTP Request를 통해 HandShaking 과정을 통해 이뤄진다는 점이다.

<br>
- HTTP Request를 그대로 사용하기 때문에 기존의 80, 443 포트로 접속을 하므로 추가 방화벽을 열지 않고도 양방향 통신이 가능하고, HTTP 규격인 CORS 적용이나 인증 등 과정을 기존과 동일하게 가져갈 수 있는 것이 장점이다.
   
<br>

#### c. 채팅에 WebSocket을 사용해야 하는 이유 

- 실시간성을 보장해야 하고, 변경 사항의 빈도가 잦다면, 또는 짧은 대기 시간, 고주파수, 대용량의 조합인 경우 `WebSocket`이 좋은 해결책이다. 

- 변경 사항의 빈도가 자주 일어나지 않고, 데이터의 크기가 작은 경우 `Ajax`, `Streaming`, `Long polling` 기술이 더 효과적일 수 있다. 

<br>

#### d. 웹 소켓의 동작 과정

- 웹소켓 접속 과정은 TCP/IP 접속 -> 웹소켓 열기 -> HandShake 과정으로 이루어져 있다. 

- 웹소켓 열기 핸드셰이크는 클라이언트가 먼저 핸드셰이크 요청을 보내고 이에 대한 응답을 서버가 클라이언트로 보내는 구조이다. 서버와 클라이언트는 HTTP 1.1 프로토콜을 사용하여 요청과 응답을 보낸다.

#### e. 침고 사이트

- [웹소켓 개념 참고 사이트](https://dev-gorany.tistory.com/212) 

---

<br><br>


### 2) Lombok, Jackson ObjectMapper 개념

<br>
#### a. Parameter와 Argument의 차이

<br>
##### a) Parameter : 
- Parameter == 파라미터 == 매개변수
- 한글로 번역하면 '매개변수'라는 뜻이다.
- 즉, 함수를 정의할 때 외부에서 들어오는 임의의 값을 뜻한다.**

```python
def addTwoNum(a, b):
	return a + b

// a,b가 Parameter
```

<br>
##### b) Argument : 
- 한글로 '인수', 혹은 '전달값'이나 '전달 인자'라고 쓰는 경우도 봤다.
- 즉, 함수를 호출할 때 사용하게 되는 일련의 값들을 뜻한다.**

```python
def main():
	addTwoSum(1, 3)

if __name__ == '__main__':
	main()

// 1,3이 Argument
```

<br>
##### c) 클래스, 객체, 인스턴스 다시 정리 : 
- 객체지향에서 "클래스"는 유사한 특징들을 지닌 객체들의 모음이며 객체에 속성과 기능을 넣어줄 설계도이다.
- "인스턴스"는 그러한 클래스로부터 만들어진 개별적인 객체라고 하며 클래스에 따라 메모리상에 구현된 실체이다. : `new Animal()`
- "객체"는 클래스의 인스턴스이며 속성과 기능을 가지는 프로그램 단위이다. 여기서 "속성"은 흔히 말하는 멤버 변수, 파라미터를 말하고 "기능"은 메서드를 의미한다. : `Animal animal`

<br><br>
#### b. Lombok 어노테이션 개념 학습

<br>
##### a) NoArgs(NoArguments), RequiredArgs(RequiredArguments), AllArgs(AllArguments) 차이점 : 

<br>
- `@NoArgsConstructor` : 파라미터가 없는 기본 생성자를 만들어준다.
	- field에 final이 아닌 @NonNull 같은 제약이 있는 어노테이션이 붙어있다면, force = true 옵션을 주어도 생성자에 들어가지 않기 때문에 나중에 프로그래머가 할당해주어야 한다.
	- hibernate나 Service Provider Interface 같은 특정 Java 구성에서 필요로 하고, 주로 @Data나 어노테이션을 생성하는 생성자 등과 함께 사용된다.

```java
@NoArgsConstructor
public class Customer {
    private Long id;
    private String name;
    private int age;
}


Customer customer = new Customer();
```

<br>
- `@RequiredArgsConstructor` : "특별한 처리가 필요한 각 field마다" 하나의 parameter를 갖는 생성자를 생성해준다. 
	- 생성자의 Parameter의 순서는 클래스 내부에서 선언된 field의 순서로 매칭 된다.**
	- 초기화되지 않은 모든 final fields와, 선언될 때 초기화되지 않은 @NonNull로 표시된 field까지 parameter를 가진다.
	- 특히 @NonNull이 달려있는 field의 경우, 생성되는 생성자 내부에 명시적인 null 체크 로직 또한 생성된다.
	- 그래서 만약 @NonNull이 붙어있는 field 중 어떠한 것이라도 null 값을 포함한다면 NullPointerException이 발생하게 된다.

```java
@RequiredArgsConstructor
public class Customer {
    private final Long id;
    private String name;
    private int age;
}


Customer customer = new Customer(3L);
```


<br>
- `@AllArgsConstructor` : "클래스 내부에 선언된 모든 field마다" 하나의 parameter를 가진 생성자를 생성한다. 
	- 생성자의 Parameter의 순서는 클래스 내부에서 선언된 field의 순서로 매칭 된다.**
	- @NonNull이 붙어있는 field의 경우, 역시나 생성되는 생성자 내부에 해당 parameter에 null check 로직이 생성된다. 

```java
@AllArgsConstructor
public class Customer {
    private final Long id;
    private String name;
    private int age;
}


Customer customer = new Customer(2L, "김철수", 23);

```

---

<br>
##### b) 문제점** :
- 위에서 언급했던 것처럼 @AllArgsConstructor 어노테이션은 생성자를 생성할 때,
- class 내부에 선언된 field의 순서인 cancelPrice, orderPrice 순으로 생성자 파라미터를 생성한다.

```java
@AllArgsConstructor
public class Order {
    private int cancelAmount;
    private int orderAmount;
}


// 취소수량 4개, 주문수량 5개
Order order = new Order(4, 5);
```


<br>
- 그런데 만약 프로그래머가 orderAmount와 cancelAmount가 선언된 순서가 마음에 들지 않아,아래처럼 바꾸게 된다면?

 
```java
@AllArgsConstructor
public class Order {
    private int orderAmount;
    private int cancelAmount;
}
```

<br>
- 이 경우, IDE가 제공해주는 리팩토링은 작동하지 않게 되고, lombok도 변화를 알아채지 못한다.
- 심지어 orderAmount, cancelAmount는 int라는 동일한 type을 갖고 있어 더욱 버그를 잡기 어렵다.
- 그래서 기존에 사용하던 new Order(4, 5)로 객체의 인스턴스를 만들어도 아무 에러없이 잘 동작할테지만, 실제로 입력되는 값은 취소수량과 주문수량이 뒤바뀌어 들어가는 심각한 비즈니스 로직 에러를 발생시킨다.


---

<br>
##### c) 해결방법** :
- DE 자동 생성 기능 등으로 아래처럼 생성자를 직접 만들고, 필요한 경우에는 직접 만든 생성자에 @Builder 어노테이션을 붙이는 것을 권장하기도 한다.
- 이 방법은 파라미터 순서가 아닌 이름으로 값을 설정하기 때문에 리팩토링에 유연하게 대응이 가능하다.

 
```java
public class Order {
    private int cancelAmount;
    private int orderAmount;
    
    @Builder
    private Order(int cancelAmount, int orderAmount) {
        this.cancelAmount = cancelAmount;
        this.orderAmount = orderAmount;
    }
}


// field 순서를 변경해도 에러가 없다.** 중요!!
Order order = Order.builder().orderAmount(5).cancelAmount(4).build(); 
```

<br>
- 참고 사이트 : 
- [Contructor 어노테이션 참고 사이트](https://siahn95.tistory.com/170)

---

<br>
##### d) 계속해서 생성자 주입이 나오는 이유 : 
- 순환 참조 방지
- 테스트 코드 작성 용이
- 코드 악취 제거
- 객체 변이 방지 (final 가능)

---

<br>
##### e) 추가적인 생성자 주입 어노테이션 :  `@PostConstruct` 개념 확립 

<br>
- `@RequiredArgsConstructor` : 생성자 주입 방법으로서 어노테이션으로 생성자를 만들어주고 `@Autowired`까지도 해줘서 Injection도 해준다. 

<br>
- `@PostConstruct` : 의존성 주입이 이루어진 후 초기화를 수행하는 메서드이다. @PostConstruct가 붙은 메서드는 클래스가 service(로직을 탈 때? 로 생각 됨)를 수행하기 전에 발생한다. 이 메서드는 다른 리소스에서 호출되지 않는다해도 수행
	- 생성자(일반)가 호출 되었을 때, 빈(bean)은 아직 초기화 되지 않았다. (예를 들어, 주입된 의존성이 없음) 하지만, @PostConstruct를 사용하면, 빈(bean)이 초기화 됨과 동시에 의존성을 확인할 수 있다. 
	- 클래스 내에 @Autowired를 붙여서 객체를 사용할 때, 생성자가 필요하다면 @PostConstruct를 사용하면 될 것 같다. 빈(bean)이 등록되고 사용할 수 있으니까 말이다. 나도 그렇게 사용했고..
	- bean lifecycle에서 오직 한 번만 수행된다는 것을 보장할 수 있다. (WAS가 올라가면서 bean이 생성될 때 딱 한 번 초기화함) 그래서 @PostConstruct를 사용하면 bean이 여러번 초기화되는 것을 방지할 수 있다.
	- 정리 : `@PostConstruct`는 `@Autowired` + `생성자를 생성하고 초기화`하여 최초로 빈 객체를 한 번만 초가화할 때, 사용한다.(빈 라이프 사이클에서 빈 객체가 여러 번 초기화되는 것을 방지한다.)  
	
<br>
- `@Builder` : 생성자 대신에 Builder를 사용할 수 있다. 


<br><br>
#### c. 프로젝트를 개발을 위한 추가적으로 필요한 클래스들 

<br>
- `ObjectMapper objectMapper` : jackson의 ObjectMapper는 일반적으로 데이터 바인딩에 사용한다. Model과 같은 역할? 
	- 내용 추가하기. 

<br>
- UUID 객체 : 중복을 제거하여 ID를 만들어 준다.
	- 채팅 방을 만드는 `builder()` 메서드 추가로 알아보기 

```java

    public ChatRoom createRoom(String name){

        // UUID 공부하기! 중복을 제거하여 ID를 만들어 준다.
        String randomId = UUID.randomUUID().toString();

        ChatRoom chatRoom = ChatRoom.builder()
                .roomId(randomId)
                .name(name)
                .build();

        chatRooms.put(randomId,chatRoom);

        return chatRoom;
    }

```

---

<br><br>

### 3) Enum 클래스 개념

- 간단히 말하면, 제약을 걸어주어서 상수를 만들어주는 클래스이다. 보통, 데이터의 칼럼 추가 시에 사용된다. 
- Enum 클래스는 상수를 만들어 주기 때문에 이것은 final이 붙은 상수를 제어한다. 
- 그래서, 항상 초기화가 필요한 final이 붙은 field가 있다. 상수를 제어하기 위해서는 매번 초기화해주기 때문에 데이터의 상태값을 표시하는데 유리하다.

<br>

- 간단한 실습 코드 :

```java
package com.websocket.chat.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatMessage {

    // Enum 클래스 다시 공부!
    public enum MessageType{
        ENTER, TALK
    }

    private MessageType type;
    private String roomId;
    private String sender;
    private String message;

}

```

- 중복 제거가 가능하다.

- enum 클래스 다른 내용 추가하기. 

- [enum 클래스 참고 사이트 1](https://catsbi.oopy.io/4678b976-bd7e-4353-b4f0-04c06f66df03#4678b976-bd7e-4353-b4f0-04c06f66df03)  
 
---

<br><br>

### 3) 실습 코드 :	
	
	
	
	
	
	
	
	
	
	