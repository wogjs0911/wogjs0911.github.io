---
key: /2024/02/16/DesignPatternStudy1.html
title: Design Pattern - Design Pattern GoF Study1
tags: Strategy Observer Decorator Adapter PortAndAdapter Proxy Builder FactoryMethod Singleton
--- 

# 1. Strategy

<br>

### 1) 캡슐, 캡슐화

- 캡슐** : 내부의 코드가 뭔지 알 필요가 없다. 즉, 인터페이스 개념
	- 캡슐 밖에서는 캡슐안의 코드를 사용할 수 없게 해야 한다.(외부에서 영향을 주면, 에러가 발생한다.)

<br>
- 캡슐화** : 비슷한 속성을 가진 클래스나 메서드 연결!
	- 인터페이스로 내부 구현 숨기는 방법
	- 캡슐화를 위해 private으로 작성한다

---

<br><br>

### 2) Strategy Pattern

<br>

#### a. 개념

- 추상화, 인터페이스를 의존하는 객체가 필요하다.

<br>
- Client 객체 설계 : 생성과 사용에 책임 분리가 필요하고 여기서 Factory 패턴을 사용할 수 있다.

<br>

#### b. 예시

- 자동차에는 ‘엔진’이 있다 라는 의미!! ‘A는 B이다.’

<br>
- Client : 사람, Context: 자동차, IStrategy : 엔진

<br>

#### c. 주의사항 

- 애플리케이션 설계 시,  @Getter, @Setter 의심해 볼 것 : 클라이언트를 의심해라!! 예외적인 상황을 고려해서 써야한다!!
	- @Setter를 무의식적으로 쓰는 순간 : 간접적으로 필드의 존재 여부를 알려주며, 상태가 보장이 안되고 개방적이다. 



---

<br><br>

### 3) Factory Pattern

#### a. 설계 방향

- Setter 의존성 주입은 Setter를 사용하지 않고서 public interface로 호출하면, NPE 에러가 떨어진다.

<br>
- 생성과 사용의 책임을 한 곳에 두면 결합도가 올라간다. 그래서, 팩토리 패턴으로 생성과 사용의 책임을 나누어서 결합도를 낮춘다!!

<br>

#### b. 개념

- Factory는 client에서 받은 값에 따라서 다른 Engine을 생성하는 것이다.

<br>
- Composition 상속(컴포지션 의미)** : Context에는 IStrategy가 포함되고 있다.
	- [Composition 상속 참고](https://kim6394.tistory.com/276)

<br>

#### c. 예시 : 

- Client가 현대 자동차의 전기차를 원해서 factory에게 주문하고 factory는 그러한 engine으로 자동차를 가져다가 생성한다!!

<br><br>

#### d. 정리 : 메인 객체를 만들기 위해 서브 객체에게 책임을 넘기는 개념이다.

<br>
- 다양성 때문에 전략 패턴이 생성되었고 팩토리 패턴도 사용한다.

---

<br><br>

# 2. Observer

### 1. 개념

- Publisher가 상태가 바뀌었으면, Observer에게 바뀐 메시지를 받아보라고 알려준다.

<br>
- Redis나 Kafka의 이벤트 발행, 구독하는 개념과 같다.

<br>
- Java를 이용하여 Observer 구조를 설계할 수 있다.

<br>
- @EventListener 나 @TransactionalEventListener와 @Async를 이용하여 SpringFramework를 이용하여 간단히 설계할 수도 있다. 


---

<br><br>


# 3. Decorator

<br>

### 1) 개념

- 원래 한 클래스의 메서드에서만 비즈니스 로직을 사용했는데 또 다른 비즈니스가 추가된다면, 따로 기존 로직을 빼고 공통된 기능을 가진 인터페이스를 만들어서 그에 대한 구현체를 추가로 생성하여 사용한다. 

<br>
- 의문점 1 : 하지만, 바로 구현체로 안 쓰고 내부의 Decorator 인터페이스를 두고 거기의 구현체를 사용하는 이유는?? 
	- OCP 나 유연함으로 설계하기 위해서


---

<br><br>


# 4. Adapter

- 인터페이스를 다른 객체가 이해할 수 있도록 변환하는 특별한 객체를 말한다.

<br>
- 어댑터는 한 인터페이스(기존 시스템)를 다른 인터페이스(업체에서 제공한 클래스)로 변환해 주는 역할을 한다.

---

<br><br>


# 5. Port And Adapter

- Port And Adapter 패턴은 주로 헥사고날 아키텍쳐에서 사용된다.

- 관심사 분리, 코어 중심 설계, 유연성 및 적응성이 필요한다. 도메인 모델 패턴에서 사용된다.


---

<br><br>


# 6. Builder

<br>

### 1) `Builder Pattern` vs `Simple Builder Pattern`

- Simple Builder Pattern은 @Builder라서 이너 클래스가 자동 생성된다. 그래서, 지나친 남용은 성능 상의 이슈가 발생할 수 있다.

<br>
- 그래서, 딱 클래스 내부에서 필드로 정해지면 이것은 필수값으로 판단되어 필요없는 칼럼도 빌더 어노테이션을 통해 이너 클래스로 생성되어 커스텀 불가능하다. 

<br>
- 즉, 불필요한 필드도 같이 빌더로 생성된다. 그래서, 'Builder Pattern'을 사용한다!!

---

<br><br>


# 7. Factory Method


<br>

### 1) `Factory Method Pattern` vs `Simple Factory Method Pattern` 차이

<br>
- `Simple Factory Method` 패턴 : 
	- 적절한 기능을 가진 객체를 생성해주는 팩토리 클래스이며, 프로그래밍에서 자주 쓰이는 관용구 정도이다. 

<br>
- `Factory Method` 패턴  : 
	- 생성되는 객체의 카테고리는 다양하고 잦은 변화가 있지만, 일련의 기능(행동)은 고정 되어 있는 경우에 사용된다.
	- 위에서 설명한 Factory 패턴의 원리처럼 런타임 시점에 실시간으로 Factory의 구현체가 적절한 Product의 구현체를 생성하는 것이 아니라, 사용하는 서브클래스에 따라 생성되는 객체의 인스턴스(Product의 구현체)가 결정된다.
	

<br>

### 2) 설계 방법

- Factory Method는 abstract나 interface로 생성되어 이를 상속받아서 런타임 시점에 넘겨받은 파라미터에 의해서 서브클래스가 결정되고 객체의 인스턴스(Product의 구현체)가 결정된다. 
	- 이렇게 if-else 문의 복잡한 분기처리가 해결된다. enum 클래스를 이용하면 더 깔끔하다!!
	







