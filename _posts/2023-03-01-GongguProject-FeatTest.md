---
key: /2023/03/01/GongguProject-FeatTest.html
title: Project - 채팅 기능 테스트
tags: springboot jsp websocket HTTP Lombok Builder ObjectMapper Valid Enum
---

# 1. 채팅 기능 테스트 1 : 230301
 3
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


### 2) Lombok

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
##### b) 생성자 주입의 문제점 및 주의점** :
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
- IDE 자동 생성 기능 등으로 아래처럼 생성자를 직접 만들고, 필요한 경우에는 직접 만든 생성자에 @Builder 어노테이션을 붙이는 것을 권장하기도 한다.
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
##### d) 스프링에서 계속해서 생성자 주입이 나오는 이유(스프링 팀에서 추천) : 
- 순환 참조 방지가 가능하다. 
- 테스트 코드 작성에 용이하다. 
- 코드 악취 제거할 수 있다.
- 객체 변이 방지(final 가능)를 할 수 있다.
- 결론** : 따라서, 파라미터에 @Autowired를 통해 주입하기보다는 생성자에 주입하자!

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
	

---

<br><br>
### 3) @Builder
- `@Builder` : 생성자 대신에 Builder를 사용할 수 있다. 

<br>
- 결론** : 객체를 생성하는 대부분의 경우에는 빌더 패턴을 적용하는 것이 좋다. 물론 예외적인 케이스가 있을 수 있는데, 대표적으로 크게 다음의 2가지 상황에서는 빌더를 구현할 필요가 없다.
	- 객체의 생성을 라이브러리로 위임하는 경우
	- 변수의 개수가 2개 이하이며, 변경 가능성이 없는 경우


<br>
#### a. Builder pattern 개념
- 생성자를 통해 객체를 생성하는데 몇 가지 단점이 있어 객체를 생성하는 별도 builder를 두는 방법이 있다. 이를 "빌더 패턴"이라고 한다.

<br>
- 실습 코드 : 
	- 객체를 생성할 수 있는 빌더를 builder() 함수를 통해 얻고 거기에 셋팅하고자 하는 값을 셋팅하고 마지막에 build()를 통해 빌더를 작동 시켜 객체를 생성한다.

```java
Bag bag = Bag.builder()
		.name("name")
        	.money(1000)
        	.memo("memo")
        	.build();
 ```

---

<br>
#### b. Builder pattern을 사용해야 하는 이유, 장점 

<br>
##### a) 생성자 파라미터가 많을 경우 가독성이 좋지 않다.
- 예를 들어, Bag 클래스는 생성자 파라미터를 3개만 받는다. 3개까지는 괜찮다. 하지만 생성자 파라미터로 받아야하는 값이 수업이 많아진다면? 각 값들이 어떤 값을 의미하는지 이해하기 힘들 것이다.

```java
Bag bag = new Bag("name", 1000, "memo", "abc", "what", "is", "it", "?");
```

<br>
- 이를 빌더 패턴으로 구현하면 각 값들은 빌더의 각 값들의 이름 함수로 셋팅이 되지 각각 무슨 값을 의미하는지 파악하기 쉽다. 따라서, 생성자로 설정해야하는 값이 많을 경우 빌더를 쓰는 것이 생성자보다 가독성이 좋다. 

```java
Bag bag = Bag.builder()
		.name("name")
        	.money(1000)
        	.memo("memo")
            	.letter("This is the letter")
            	.box("This is the box")
        	.build();
```

- 위의 코드와 비교해보기!! 

<br>

##### b) 어떤 값을 먼저 설정하던 상관 없다
- 생성자의 경우는 정해진 파라미터 순서대로 꼭 값을 넣어줘야한다. 하지만, 빌더 패턴은 빌더의 필드 이름으로 값을 설정하기 때문에 순서에 종속적이지 않다.

<br>

##### c) Builder Pattern의 장점 

- [1] 필요한 데이터만 설정할 수 있음 :
	- 결국 요구사항은 계속 변하게 되어있고, 반복적인 변경을 필요로 하면서 시간 낭비로 이어지게 된다. 하지만 빌더를 이용하면 동적으로 이를 처리할 수 있다.


<br>	
- [2] 유연성을 확보할 수 있음 : 
	- 객체를 생성하는 코드가 100개 있다면 모든 로직을 수정해주거나 생성자를 따로 추가하는 등의 불필요한 조치를 해주어야 할 것이다. 하지만 빌더 패턴를 기반으로 코드가 작성되어 있다면 기존의 코드는 수정할 필요가 없다. 왜냐하면 빌더 패턴은 유연하게 객체의 값을 설정할 수 있도록 도와주기 때문이다.
	
<br>
- [3] 가독성을 높일 수 있음 : 
	- 빌더 패턴을 적용하면 직관적으로 어떤 데이터에 어떤 값이 설정되는지 쉽게 파악하여 가독성을 높일 수 있다.

```java
User user = User.builder()
             .name("망나니 개발자")
             .age(28)
             .height(180)
             .iq(150).build();
```

<br>
- [4] 변경 가능성을 최소화할 수 있음 : 
	- 많은 개발자들이 수정자 패턴(Setter)를 흔히 사용한다. 하지만 Setter를 구현한다는 것은 불필요하게 변경 가능성을 열어두는 것이다. 이는 유지보수 시에 값이 할당된 지점을 찾기 힘들게 만들며 불필요한 코드 리딩 등을 유발한다. 만약 값을 할당하는 시점이 객체의 생성뿐이라면 객체에 잘못된 값이 들어왔을 때 그 지점을 찾기 쉬우므로 유지보수성이 훨씬 높아질 것이다. 그렇기 때문에 클래스 변수는 변경 가능성을 최소화하는 것이 좋다.
	- 변경 가능성을 최소화하는 가장 좋은 방법은 변수를 final로 선언함으로써 불변성을 확보하는 것

---

<br>

#### c. 롬북의 `@Builder` 어노테이션 이용

- 롬북의 `@Builder`를 사용하고나서 Builder 패턴을 매우 간단히 사용할 수 있다. 

<br>
- 롬북이 없을 때 코드 :

```java

   class Example<T> {
   	private T foo;
   	private final String bar;
   	
   	private Example(T foo, String bar) {
   		this.foo = foo;
   		this.bar = bar;
   	}
   	
   	public static <T> ExampleBuilder<T> builder() {
   		return new ExampleBuilder<T>();
   	}
   	
   	public static class ExampleBuilder<T> {
   		private T foo;
   		private String bar;
   		
   		private ExampleBuilder() {}
   		
   		public ExampleBuilder foo(T foo) {
   			this.foo = foo;
   			return this;
   		}
   		
   		public ExampleBuilder bar(String bar) {
   			this.bar = bar;
   			return this;
   		}
   		
   		@java.lang.Override public String toString() {
   			return "ExampleBuilder(foo = " + foo + ", bar = " + bar + ")";
   		}
   		
   		public Example build() {
   			return new Example(foo, bar);
   		}
   	}
   }

```

<br>
- 롬북을 사용하고 나서 코드 :

```java

   @Builder
   class Example<T> {
   	private T foo;
   	private final String bar;
   }

```

```java
Bag bag = Bag.builder()
		.name("name")
        	.money(1000)
        	.memo("memo")
        	.build();
```

<br>
#### d. @Builder 어노테이션 옵션

- builderMethodName : 사람에게 도움이 되는 방향으로 빌더 메서드 이름을 정의

<br>
- buildMethodName : 빌더에 필드 값들을 입력하고 마지막에 객체를 생성하는 동작인 빌드 메서드의 이름을 변경할 수 있다.

<br>
- builderClassName : @Builder를 사용하면 각 필드들의 값을 셋팅하는 메서드의 반환값의 빌더 클래스의 이름이 000Builder로 자동 설정되는데 이것을 수정할 수 있다.

<br>
- toBuilder : 이 값을 true로 설정시 빌더로 만든 인스턴스에서 toBuilder() 메서드를 호출해 그 인스턴스 값을 베이스로 빌더 패턴으로 새로운 인스턴스를 생성할 수 있다.

<br>
- access() : builder 클래스의 접근제어자를 어떻게 할 것인지에 대한 설정 값

```java
Bag bag = Bag.builder()
		.name("name") // return BagBuilder
        	.money(1000) // return BagBuilder
        	.memo("memo") // return BagBuilder
        	.build();

```

<br>
- 추가로 검색해서 찾아보기!



<br>
- 참고 사이트 :
	- [Builder 참고 사이트 1](https://pamyferret.tistory.com/67)
	- [Builder 참고 사이트 2](https://johngrib.github.io/wiki/pattern/builder/)

---

<br>

### 4) @EqualsAndHashCode

- 서로 다른 두 객체에서 특정 변수의 이름이 똑같은 경우 같은 객체로 판단을 하고 싶다면 사용한다.

- 실습 코드 :

```java
@RequiredArgsConstructor
@EqualsAndHashCode(of = {"companyName", "industryTypeCode"}, callSuper = false))
public class Store extends Common {
    @NonNull
    private String companyName;                                 // 상호명
    
    @NonNull
    private String industryTypeCode;                            // 업종코드
    }
}
```

```java
@RestController
@RequestMapping(value = "/store")
@Log4j2
public class StoreController {

    @GetMapping(value = "/test")
    private ResponseEntity test(){        
        Store store1 = new Store("가게 이름", "업종코드1");
        Store store2 = new Store("가게 이름", "업종코드1");
        Store store3 = new Store("가게 이름", "업종코드2");
        
        // "companyName과 industryTypeCode가 같기 때문에 true가 나옴
        log.debug(store1.equals(store2));
        
        // "companyName과 industryTypeCode가 다르기 때문에 false가 나옴
        log.debug(store1.equals(store3));

        return ResponseEntity.ok().build();
    }

}
```

---

<br>

### 5) 추가적인 롬북의 어노테이션

- @ToString
	- @ToString 어노테이션을 활용하면 클래스의 변수들을 기반으로 ToString 메소드를 자동으로 완성시켜 준다. 출력을 원하지 않는 변수에 @ToString.Exclude 어노테이션을 붙여주면 출력을 제외할 수 있다. 

<br>
- @Data
	- @Data 어노테이션을 활용하면 @ToString, @EqualsAndHashCode, @Getter, @Setter, @RequiredArgsConstructor를 자동완성 시켜준다. 실무에서는 너무 무겁고 객체의 안정성을 지키기 때문에 @Data의 활용을 지양한다.

<br>
- @Delegate 
	- @Delegate 어노테이션은 한 객체의 메소드를 다른 객체로 위임
	
---


<br><br> 
### 6) @Valid와 @Validated를 이용한 유효성 검증의 동작 원리 및 사용 방법

#### a. @Valid

- JSR-303 표준 스펙(자바 진영 스펙)으로써 빈 검증기(Bean Validator)를 이용해 객체의 제약 조건을 검증하도록 지시하는 어노테이션

<br> 
- 동작 원리** :
	- 모든 요청은 프론트 컨트롤러인 디스패처 서블릿을 통해 컨트롤러로 전달된다. 
	- 전달 과정에서는 컨트롤러 메소드의 객체를 만들어주는 ArgumentResolver가 동작하는데, @Valid 역시 ArgumentResolver에 의해 처리가 된다.
	- 대표적으로 @RequestBody는 Json 메세지를 객체로 변환해주는 작업이 ArgumentResolver의 구현체인 RequestResponseBodyMethodProcessor가 처리하며, 이 내부에서 @Valid로 시작하는 어노테이션이 있을 경우에 유효성 검사를 진행한다. 
	- (이러한 이유로 @Valid가 아니라 커스톰 어노테이션인 @ValidMangKyu여도 동작한다.) 
	- 만약 @ModelAttribute를 사용중이라면 ModelAttributeMethodProcessor에 의해 @Valid가 처리된다.
	- 그리고 검증에 오류가 있다면 MethodArgumentNotValidException 예외가 발생하게 되고, 디스패처 서블릿에 기본으로 등록된 예외 리졸버(Exception Resolver)인 DefaultHandlerExceptionResolver에 의해 400 BadRequest 에러가 발생한다.

<br>
- 실습 코드 :

```java
@PostMapping("/user/add") 
public ResponseEntity<Void> addUser(@RequestBody @Valid AddUserRequest addUserRequest) {
      ...
}
```

- 결론 : @Valid는 기본적으로 컨트롤러에서만 동작하며 기본적으로 다른 계층에서는 검증이 되지 않는다. 다른 계층에서 파라미터를 검증하기 위해서는 @Validated와 결합되어야 한다.


<br>
#### b. @Validated

- 입력 파라미터의 유효성 검증은 컨트롤러에서 최대한 처리하고 넘겨주는 것이 좋다. 
- 하지만 개발을 하다보면 불가피하게 다른 곳에서 파라미터를 검증해야 할 수 있다. 
- Spring에서는 이를 위해 AOP 기반으로 메소드의 요청을 가로채서 유효성 검증을 진행해주는 @Validated를 제공하고 있다

<br>
- 동작 과정 :
	- 특정 ArgumnetResolver에 의해 유효성 검사가 진행되었던 @Valid와 달리, @Validated는 AOP 기반으로 메소드 요청을 인터셉터하여 처리된다. 
	- @Validated를 클래스 레벨에 선언하면 해당 클래스에 유효성 검증을 위한 AOP의 어드바이스 또는 인터셉터(MethodValidationInterceptor)가 등록된다. 
	- 그리고 해당 클래스의 메소드들이 호출될 때 AOP의 포인트 컷으로써 요청을 가로채서 유효성 검증을 진행한다.
	- 이러한 이유로 @Validated를 사용하면 컨트롤러, 서비스, 레포지토리 등 계층에 무관하게 스프링 빈이라면 유효성 검증을 진행할 수 있

<br>
- 실습 코드 :

```java
@Service
@Validated
public class UserService {

	public void addUser(@Valid AddUserRequest addUserRequest) {
		...
	}
}
```

<br>
#### c. @Validated의 그룹화 기능 
- 동일한 클래스에 대해 제약조건이 요청에 따라 달라질 수 있다. 
- 예를 들어, 일반 사용자의 요청과 관리자의 요청이 1개의 클래스로 처리될 때, 다른 제약 조건이 적용되어야 할 수 있는 것이다. 
- 이때는 검증될 제약 조건이 2가지로 나누어져야 하는데, Spring은 이를 위해 제약 조건이  적용될 검증 그룹을 지정할 수 있는 기능 역시 @Validated를 통해 제공하고 있다.
- 자세한 내용은 아래 사이트에서 찾아보기!

<br>
#### d. 참고 사이트 :
- [@Valid와 @Validated를 이용의 참고 사이트 1](https://mangkyu.tistory.com/174)


---

<br><br>

### 7) Jackson ObjectMapper 개념

- `ObjectMapper objectMapper` : jackson의 ObjectMapper는 일반적으로 JSON 형태의 데이터 타입의 데이터 바인딩에 사용한다.
- ObjectMapper는 리플렉션을 활용해서 객체로부터 Json 형태의 문자열을 만들어내거나 Json 문자열로부터 객체를 만들어낸다.

<br>

#### a. 직렬화(Serialize)와 역직렬화(Deserialize) 개념 

<br>
> 직렬화 : 객체로부터 Json 형태의 문자열을 만든다.
<br>
> 역직렬화 : Json 문자열로부터 객체를 만들어 낸다,

<br>
#### b. Jackson ObjectMapper 

##### a) ObjectMapper 직렬화**

- JSON 형태의 문자열을 만들어가는 방법!!
- 해당 부분은 @ResponseBody나 @RestController 또는 ResponseEntity 등을 사용하는 경우에 처리된다**
- ObjectMapper의 기본 설정으로는 public 필드 또는 public 형태의 getter(getX로 시작하는 메소드)만 접근이 가능하다
- 그래서, ObjectMapper를 이용하는 경우, 직렬화를 위해 기본적으로 getter를 반드시 만들어두는 것이 좋다.

<br>	
- 실습 코드 :

```java
String jsonResult = objectMapper.writeValueAsString(myDTO());
```

<br>
##### b) ObjectMapper를 이용한 직렬화의 주의 사항 : 
- 아래 코드에서 클래스의 객체를 ObjectMapper로 직렬화하면 다음과 같은 json 문자열이 만들어진다. 
- getNameWithAge 역시 getX로 시작하는 getter 메소드 규칙을 따르기 때문이다. 
- 만약 이러한 부분을 인지하지 못한다면 잘못된 json 응답을 내려줄 수 있다.
- 그래서, 메서드명에 주의하자! 

<br>	
- 실습 코드 :

```java
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class MangKyuRequest {

    private String name;
    private Integer age;

    public String getNameWithAge() {
        return name + "(" + age + ")";
    }

}
```

---

<br>
##### c) ObjectMapper를 역직렬화**
- JSON 형태의 문자열에서 객체를 만들어가는 방법 
- Spring에서 @RequestBody로 json 문자열을 객체로 받아올 때 역직렬화가 처리된다.

<br>
##### d) ObjectMapper의 역직렬화의 과정
- [1] 기본 생성자로 객체를 생성함
- [2] 필드값을 찾아서 값을 바인딩 해줌

- 가장 먼저 객체를 생성하는데, 기본 생성자가 없다면 에러를 발생시킨다. 기본 생성자로 객체를 생성한 후에는 필드값을 찾아야하는데, 기본적으로 public 필드 또는 public 형태의 getter/setter로 찾을 수 있다.

<br>
##### e) ObjectMapper를 우회적으로 역직렬화 처리하는 방법
- ObjectMapper에 ParameterNames 모듈 추가
- Java 컴파일의 -parameters 옵션 추가
- 아래 사이트에서 찾아보기



<br>
- 참고 사이트 :
	- [Jackson ObjectMapper 참고 사이트 1](https://mangkyu.tistory.com/223)

---


<br><br>
### 7-1) DTO 클래스는 항상 다음과 같이 사용하라

-  DTO에는 다음과 같은 코드를 무지성으로 붙여주는 것이다. 그러면 우리는 부담없이 DTO에 일관된 방식을 제공해줄 수 있다. 
- 만약 @ModelAttribute 사용이 필요하다면 무지성으로 @Setter까지 넣어주면 된다.

<br>
- 실습 코드 :

```java
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MangKyuRequest {

    private String name;
    private Integer age;

}
```

---

<br><br>
### 8) UUID 객체 개념

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

### 9) Enum 클래스 개념

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

### 10) 실습 코드

- 채팅 기능 : 테스트 1 코드 

<br>

<details>
<summary>ChatRoom.java</summary>
<div markdown="1">

```java
package com.websocket.chat.model;

import com.websocket.chat.service.ChatService;
import lombok.Builder;
import lombok.Getter;
import org.springframework.web.socket.WebSocketSession;

import java.util.HashSet;
import java.util.Set;

@Getter
public class ChatRoom {
    private String roomId;
    private String name;
    private Set<WebSocketSession> sessions = new HashSet<>();

    @Builder    // @RequiredArgsConstructor 이것과 같은 의미같다. 생성자 대신해서 빌더를 사용한다!
    public ChatRoom(String roomId, String name) {
        this.roomId = roomId;
        this.name = name;
    }

    public void handleActions(WebSocketSession session, ChatMessage chatMessage, ChatService chatService){
        if(chatMessage.getType().equals(ChatMessage.MessageType.ENTER)){
            sessions.add(session);
            chatMessage.setMessage(chatMessage.getSender()+"님이 입장했습니다.");
        }
        sendMessage(chatMessage, chatService);
    }

    // Stream 객체 다시 공부하기! Java Stream에서 forEach는 출력문?
    // 받는 메세지가 타입이 무엇인지 모르기 때문에 제너릭 타입으로 메세지를 받는다.
    public <T> void sendMessage(T message, ChatService chatService){
        sessions.parallelStream().forEach(session -> chatService.sendMessage(session, message));
    }
}



```


</div>
</details>


<br>

<details>
<summary>ChatMessage.java</summary>
<div markdown="1">

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

</div>
</details>


<br>

<details>
<summary>ChatService.java</summary>
<div markdown="1">

```java
package com.websocket.chat.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.websocket.chat.model.ChatRoom;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import javax.imageio.IIOException;
import java.io.IOException;
import java.util.*;

@Slf4j
@RequiredArgsConstructor
@Service
public class ChatService {

    private final ObjectMapper objectMapper;
    private Map<String, ChatRoom> chatRooms;

    @PostConstruct
    private void init(){
        chatRooms = new LinkedHashMap<>();
    }

    public List<ChatRoom> findAllRoom(){
        return new ArrayList<>(chatRooms.values());
    }

    public ChatRoom findRoomById(String roomId){
        return chatRooms.get(roomId);
    }

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

    // databind.ObjectMapper 다시 공부! 주의!!
    // 받는 메세지가 타입이 무엇인지 모르기 때문에 제너릭 타입으로 메세지를 받는다.
    public <T> void sendMessage(WebSocketSession session, T message){
        try {
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(message)));
        } catch (IOException e){
            log.error(e.getMessage(), e);
        }
    }
}

```

</div>
</details>


<br>

<details>
<summary>ChatController.java</summary>
<div markdown="1">

	
```java
package com.websocket.chat.controller;

import com.websocket.chat.model.ChatRoom;
import com.websocket.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/chat")
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ChatRoom createRoom(@RequestParam String name){
        return chatService.createRoom(name);
    }

    @GetMapping
    public List<ChatRoom> findAllRoom(){
        return chatService.findAllRoom();
    }
}

```	

</div>
</details>


<br>

<details>
<summary>WebSockChatHandler.java</summary>
<div markdown="1">

	
```java
package com.websocket.chat.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.websocket.chat.model.ChatMessage;
import com.websocket.chat.model.ChatRoom;
import com.websocket.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Slf4j         // 로깅에 필요한 경우에 쓰인다. JPA에서 자동화 때문에 DB에 접속 시, 로그가 안보여서 로그 확인 시 필요!
@RequiredArgsConstructor     // 계층을 이어주기 위해서(DI) 생성자를 초기화 해주어야 한다.
@Component
public class WebSockChatHandler extends TextWebSocketHandler {

    // 기본 초기 웹소켓 테스트
//    @Override
//    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
//        String payload = message.getPayload();
//        log.info("payload{}", payload);
//        TextMessage textMessage = new TextMessage("Welcome chatting server~^^");
//        session.sendMessage(textMessage);
//
//    }

    private final ObjectMapper objectMapper;
    private final ChatService chatService;

    // databind.ObjectMapper 다시 공부! 주의!!
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        log.info("payload{}", payload);

        ChatMessage chatMessage = objectMapper.readValue(payload, ChatMessage.class);
        ChatRoom room = chatService.findRoomById(chatMessage.getRoomId());
        room.handleActions(session, chatMessage, chatService);
    }

}

```	

</div>
</details>


<br>
- [채팅 기능 참고 사이트 1](https://www.daddyprogrammer.org/post/4077/spring-websocket-chatting/)


--- 

<br><br>
# 2. 채팅 서버를 STOMP로 이용

### 0) STOMP를 사용하는 이유

<br>
- WebSocket을 이용한 채팅 서비스에서 STOMP를 사용하는 이유는 기존의 개발 방식에서 WebSokcet만을 이용해서 채팅을 구현하면, 해당 메세지가 어떤 요청인지 등등에 대하여 채팅룸과 세션을 일일이 구현하고 메세지 발송 부분을 관리하는 부분도 구현해야 한다.
- 하지만, STOMP를 이용하면, 메세지 전송을 효율적으로 처리할 수 있으며 해당 프로토콜이 pub/sub 구조로 되어있어서 메시지를 주고 받는 것에 대하여 확실히 정해져 있어서 명확히 인지하고 개발할 수 있다.

<br>
- 스프링 부트환경에서는 WebSocket을 이용한 실시간 채팅 서비스를 구현하기 위해서 필요한 2가지가 있다.
- WebSocket의 기능을 보완해주고 향상시켜주는 SockJs라이브러리와 메시징 전송을 좀 더 효율적으로 지원해주기 위한 STOMP 프로토콜이 존재한다.일반 스프링 환경에서는 핸들러만 구현해주고 직접 호출했지만 부트 환경에서는 핸들러와 브로커라는 개념을 이용해서 서로간의 통신을 하게 된다.

<br>
#### a. STOMP 프로토콜 개념 : 

- 텍스트 기반의 메세징 프로토콜이며 헤더와 바디로 구성되어 있다.
- 구조에서 중요한 개념은 브로커와 Subscribe의 개념이다. STOMP는 구독이라는 개념을 통해 내가 통신하고자 하는 주체(Topic)을 판단하여 브로커라는 개념을 두어 실시간, 지속적으로 관심을 가지며 해당 요청이 들어오면 처리하게 되는 구조이다.

<br>
- Connect : 연결에 관한 구조이다. 버전정보와 현재의 세션정보를 가져온다. 보통, 세션은 스프링 시큐리티를 연동하여 등록한다.
- Subscribe : 구독이라는 개념을 이용하여 현재 메세지에 대한 목적지를 설정한다. 구조를 보면 각각의 Destination이 있다. Connect 이후에 subscribe를 설정한다. 
- Message : 메세지를 전송 시 구조이다. 메세지의 전달지(Destination)와 해당 메세지의 정보들이 출력된다. 예를 들어, 데이터의 타입은 JSON으로 전송하였고 목적지는 /topic/ + roomId이다.
데이터는 JSON구조로 key, value로 되어있다. 다양한 데이터 타입을 가질 수 있다.

<br>
#### b. STOMP 프로토콜 구조 : 

- 중요한 개념은 브로커와 Subscribe의 개념이다. STOMP는 구독이라는 개념을 통해 내가 통신하고자 하는 주체(topic)을 판단하여 브로커라는 개념을 두어 실시간, 지속적으로 관심을 가지며 해당 요청이 들어오면 처리하게 되는 구조

<br>
##### a) 채팅방 생성 : 
- pub/sub을 구현하기 위한 Topic이 하나 생성한다.
 
<br>
##### b) 채팅방 입장 : 
- Topic 하나를 구독한다. 

<br>
##### c) 채팅방에서 메세지를 주고 받기 :
- 해당 Topic으로 메세지를 발송(pub)하거나 메세지를 받는(sub)다. 
- pub은 메세지를 공급하고 sub는 메세지를 소비한다.


<br>
### 1) 개발 환경 구성 






<br>
- [채팅 기능 참고 사이트 2](https://www.daddyprogrammer.org/post/4691/spring-websocket-chatting-server-stomp-server/)














	
	
	