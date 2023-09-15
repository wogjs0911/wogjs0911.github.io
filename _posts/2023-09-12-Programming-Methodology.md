---
key: /2023/09/12/Programming-Methodology.html
title: Programming - Methodology
tags: CleanCode OOP
---

# 1. CleanCode

- '클린코드'(로버트 C. 마틴) 참고

### 1) 클린코드 규칙

- 의도를 분명히 밝혀라.
	- 어떤 데이터를 저장하고 있는지 예측
	- 서로 흡사한 이름을 사용하지 않도록 주의 하자

<br>
- 그릇된 정보를 피하라.
	- 널리 쓰이는 의미가 있는 단어를 다른 의미로 사용하지 말자

<br>
- 의미 있게 구분 하라.

<br>
- 발음하기 쉬운 이름으로 정하자.
	- 우리는 혼자 일하지 않는다.

<br>
- 검색하기 쉬운 이름을 사용하라.

<br>
- 타입과 관련된 문자열을 넣지 말아라.

<br>
- 한 개념에 한 단어를 사용하라.
	- 일관성 있는 어휘를 선택해서 이름을 붙이자.
	- ex) Controller 계층에서는 `fetch`, Service 계층에서는 `get`라고 같은 역할을 가진 메서드명으로 혼동하여 사용한다.

<br>
- 의미 있는 맥락을 추가하라.

<br>
- 불필요한 맥락을 없애라.
	- 의미 없는 접두사 붙이지 X
	- 의미 전달이 제대로 안되는 짧은 변수명
 
---

<br><br>
 
### 2) 추가적인 개념

- 클린한 코드 = 한 사람이 짠 것처럼 짜야 한다. 
	- 컨벤션의 필요성!

---

<br><br>

### 3) 함수 설계법

- 한 가지만 하자

#### a. 함수는 최대한 작게 만들기

- switch문을 이용하여 런타임 때, 함수 호출이 정해지도록 추상 메서드로 따로 빼기
	- 하지만, 이렇게 설계하면, 복잡성 증가
	
<br>
- 오류 처리는 항상 예외 처리로 처리하고 예외처리를 하기 위해서 보통, try-catch 문을 이용하기!
	- 컨트롤단에서 try catch, 글로벌로 예외처리 사용 안 하면, 서비스에서 throws 사용
	
<br>
- 예외 처리를 위해 ENUM 클래스 이용하기!
	
---

<br><br>

#### b. 함수의 역할을 명령과 조회를 분리시켜라!

---

<br><br>

#### c. 객체에서 캡슐화는 필수이다. 변경의 전파를 최대한 줄이기 위해 필요하다.

- getter의 사용성도 최대한 줄여야 한다.(setter에 못지 않다.)
	- why? 예를 들어, Audience 객체에서 Bag 객체를 사용해야할 때, getBag()을 사용하는 것은 불가능해야 한다. Bag의 이름 등이 달라지면 모든 소스코드에 들어가서 변경해야 하기 때문이다.


---

<br><br>

### 4) 설계 예시

#### a. 수정 방향

- 다음 코드를 코드를 읽는 사람이 쉽게 이해할 수 있고 예측할 수 있도록 수정해보자!

- 다음 코드를 비즈니스 요구사항의 변경에 유연하고 기능 확장성을 가지는 코드로 수정해보자!


<br>

#### b. 예제 코드(수정 전)

##### a) Entity 모음 + 비즈니스 로직

- Invitation.java
  
```java
public class Invitation {
    private LocalDateTime when;
}

```


<br>
- Ticket.java
  
```java
public class Ticket {
    private Long fee;

    public Ticket(Long fee) {
        this.fee = fee;
    }

    public Long getFee() {
        return fee;
    }
}

```


<br>
- Audience.java
  
```java
public class Audience {
    private final Bag bag;

    public Audience(Bag bag){
        this.bag = bag;
    }

    public long buy(Ticket t){
        return bag.hold(t);
    }
}
```

<br>
- Bag.java
  
```java
public class Bag {
    private Long amount;
    private final Invitation invitation;
    private Ticket ticket;

    public Bag(long amount) {
        this(null, amount);
    }

    public Bag(Invitation invitation, long amount) {
        this.invitation = invitation;
        this.amount = amount;
    }

    public Long hold(Ticket ticket) {
        if (hasInvitation()) {
            setTicket(ticket);
            return 0L;
        } else {
            setTicket(ticket);
            minusAmount(ticket.getFee());
            return ticket.getFee();
        }
    }

    private boolean hasInvitation() {
        return invitation != null;
    }
    private boolean hasTicket() {
        return ticket != null;
    }

    private void setTicket(Ticket ticket) {
        this.ticket = ticket;
    }
    private void minusAmount(long amount) {
        this.amount -= amount;
    }
    private void plusAmount(long amount) {
        this.amount += amount;
    }
}

```



<br>
- Theater.java
  
```java
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class Theater {

    public void enter(Audience audience, TicketSeller ticketSeller){
        long ticketFee = ticketSeller.sellTo(audience);
        ticketSeller.receivePay(ticketFee);
    }

}

```


<br>
- TicketOffice.java
  
```java
import java.util.Arrays;
import java.util.List;

public class TicketOffice {
    private long amount;
    private final List<Ticket> tickets;

    public TicketOffice(Long amount, Ticket ... tickets) {
        this.amount = amount;
        this.tickets = Arrays.asList(tickets);
    }

    public Ticket publishTicket(){
        return getTicket();
    }

    public void increaseSalesAmount(long amount){
        plusAmount(amount);
    }

    public Ticket getTicket(){
        return tickets.get(0);
    }

    public void minusAmount(long amount) {
        this.amount -= amount;
    }
    private void plusAmount(long amount) {
        this.amount += amount;
    }
}

```


<br>
- TicketSeller.java
  
```java
public class TicketSeller {
    private final TicketOffice ticketOffice;

    public TicketSeller(TicketOffice ticketOffice) {
        this.ticketOffice = ticketOffice;
    }

    public long sellTo(Audience a) {
        return a.buy(ticketOffice.publishTicket());
    }

    public void receivePay(long ticketFee){
        ticketOffice.increaseSalesAmount(ticketFee);

    }
}
```

---

<br><br>

##### b) Controller, Service 단

<br>
- TheaterController.java
  
```java
import com.cafe.service.CafeService;
import com.theater.service.TheaterService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;

@RestController
@RequestMapping("/theater")
@RequiredArgsConstructor
public class TheaterController {
    private final TheaterService theaterService;

    @GetMapping("hello")
    public String welcomeMessage(){
        return "Welcome to The Wanted Theater";
    }

    @GetMapping("enter")
    public String enter(){
        return theaterService.enter();
    }
}

```

<br>
- TheaterService.java
  
```java

import com.theater.service.handler.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TheaterService {
    private final Theater theater;

    public String enter(){
        theater.enter(new Audience(new Bag(1000L)),
                new TicketSeller(new TicketOffice(20000L, new Ticket(100L))));
        return "Have a good time.";

    }
}


```

---

<br>

#### c. 예제 코드(수정 후)

- Bag.java


```java
```

<br>
- TicketSeller.java


```java
```


---

<br><br>

# 2. OOP

- '오브젝트'(조영호) 참고

### 0) 들어가기 전 및 실습 코드 
 
- 객체지향은 객체만 존재하면 의미가 없다. 메시지를 주고받아야 진짜 의미가 있는것이다.

<br>
- UUID로 타입을 쓰는 이유??(ArrayList나 List를 쓰지 않는 이유?) 또는 switch문의 type에서 enum을 사용하는 이유?
    - 열거형 타입인 ENUM을 쓰는 이유 ? 사용자 편의성으로서 타입을 봐주는 것이다! 또한 데이터 타입이 정해지면, 내부코드가 바뀌면서 변수 타입도 전부 다 바꾸어야 하므로!
        - Ex) 새 직원 유형을 추가할 때 마다 코드를 변경해야하기 때문이다.새 직원 유형을 추가할 때 마다 코드를 변경해야하기 때문이다.
            - 해결방법 : 팩토리 패턴으로 추상 팩토리 메서드를 이용하는 방법!

---

<br>

#### a. 실습 코드(수정 전) :

- 수정하기 
	- 각각의 객체들이 적절한 책임과 책임의 범위를 가지고 있는지 확인해보고, 너무 많은 책임과 넓은 범위의 책임을 가지고 있다면 적절하게 수정해보자.

<br>
- Barista.java

```java
import java.util.UUID;
 
public class Barista {
    private int rank; // 0: Beginner 1: Middle 2: Master
    private int status; // 0: Waiting 1: Making

    public Barista(int rank, int status) {
        this.rank = rank;
        this.status = status;
    }

    private void setRank(int rank) {
        this.rank = rank;
    }

    private void setStatus(int status) {
        this.status = status;
    }

    public String makeBeverageTo(UUID orderId, Order o) {
        o.changeOrderStatus(1);
        StringBuilder makedOrders = new StringBuilder();
        makedOrders.append("주문ID: ")
            .append(orderId.toString())
            .append("\n");
        o.getOrderDetailInfo().forEach(((beverage, quantity) -> {
            makedOrders.append(beverage.getMenuName())
                .append(":")
                .append(quantity);
        }));
        o.changeOrderStatus(2);
        return makedOrders.toString();
    }

}

```


<br>
- Beverage.java

```java
import java.util.Collections;
import java.util.Map;

public class Beverage {
    private final String menuName;
    private final long price;
    private final Map<String, Long> extraRecipe;

    public Beverage(String m, long p, Map<String, Long> r) {
        this.menuName = m;
        this.price = p;
        this.extraRecipe = r;
    }

    public String getMenuName(){
        return menuName;
    }

    public Beverage(String m, long p) {
        this(m, p, Collections.emptyMap());
    }

    public long calculatePrice() {
        long extraRecipeTotalAmount = 0L;
        if (!extraRecipe.isEmpty()) {
            for (String extraMenu : extraRecipe.keySet()) {
                extraRecipeTotalAmount += extraRecipe.get(extraMenu);
            }
        }
        return getPrice() + extraRecipeTotalAmount;
    }

    private long getPrice() {
        return this.price;
    }


}

```


<br>
- Cashier.java

```java
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class Cashier {
    private static final Cafe cafe = new Cafe();
    private static final OrderBook orderBook  = new OrderBook();

    public UUID takeOrder(Map<Beverage, Integer> receivedOrders) {
        UUID newOrderId = createOrderId();
        orderBook.add(newOrderId, new Order(receivedOrders));

        return newOrderId;
    }

    public String sendOrder(Barista toBarista, UUID withOrderId){
        return toBarista.makeBeverageTo(withOrderId, orderBook.getOrder(withOrderId));
    }

    public String completeOrder(UUID u, String message){
        orderBook.remove(u);
        return message;
    }

    public long calculateTotalPrice(Map<Beverage, Integer> receivedOrders) {
        AtomicLong totalPrice = new AtomicLong(0L);
        receivedOrders.forEach(((beverage, quantity) -> {
            totalPrice.addAndGet((long) beverage.calculatePrice() * quantity);
        }));

        return totalPrice.get();
    }

    private UUID createOrderId(){
        return UUID.randomUUID();
    }

}

```



<br>
- Cafe.java

```java
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

@Component
public class Cafe {
    private final String name;
    private Long sales;

    public Cafe(){
        this.name = "wantedCodingCafe";
        this.sales = 10000L;
    }

    public String getCafeName(){
        return name;
    }

    public void plusSales(Long amount){
        this.sales += amount;
    }

    public void minusSales(Long amount){
        this.sales -= amount;
    }
}

```

<br>
- Customer.java

```java
import java.util.Map;

public class Customer {
    private String paymentMethod;
    private final Cashier cashier;
    private final Map<Beverage, Integer> myOrders;

    public Customer(String p, Map<Beverage, Integer> o, Cashier c) {
        this.paymentMethod = p;
        this.myOrders = o;
        this.cashier = c;
    }

    private void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String buy() {
        long totalPrice = cashier.calculateTotalPrice(myOrders);
        return cashier.takeOrder(myOrders, totalPrice);
    }
}

```


<br>
- Order.java

```java
import java.util.*;

public class Order {
    private final Map<Beverage, Integer> orderGroup;
    private int status; // 0: pending 1: processing 2: completed

    public Order(Map<Beverage, Integer> o, int s){
        this.orderGroup = o;
        this.status = s;
    }

    public Order(Map<Beverage, Integer> o){
        this(o, 0);
    }

    public Map<Beverage, Integer> getOrderDetailInfo(){
        return this.orderGroup;
    }

    public void changeOrderStatus(int orderStatus) {
        updateOrder(orderStatus);
    }

    private void updateOrder(int status) {
        this.status = status;
    }
}

```



<br>
- OrderBook.java

```java
import java.util.HashMap;
import java.util.UUID;

public class OrderBook {
    private static final HashMap<UUID, Order> orderForms = new HashMap<>();

    public void add(UUID u, Order o){
        orderForms.put(u, o);
    }
    public void remove(UUID u){
        orderForms.remove(u);
    }

    public Order getOrder(UUID u){
        return orderForms.get(u);
    }
}

```

<br>
- CafeController.java

```java
import com.cafe.service.CafeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;

@RestController
@RequestMapping("/cafe")
@RequiredArgsConstructor
public class CafeController {
    private final CafeService cafeService;

    @GetMapping("hello")
    public String welcomeMessage(){
        return "Welcome to The Wanted coding cafe!!";
    }

    @GetMapping("test")
    public String test(){
        return "test";
    }

    @GetMapping("order")
    public String orderFromMenu(){
        HashMap<String, Integer> menu = new HashMap<String, Integer>();
        menu.put("AMERICANO", 3);
        return cafeService.orderFrom(menu);
    }
}

```



<br>
- CafeController.java

```java
import com.cafe.service.handler.Cafe;
import com.cafe.service.handler.Cashier;
import com.cafe.service.handler.Customer;
import com.cafe.service.handler.Beverage;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CafeService {
    private final Cafe wCafe;

    public String orderFrom(HashMap<String, Integer> menu){
        // 들어 온 주문에 따라서 적절한 `Beverage` 객체를 상속 받은 객체를 생성
        // Cashier 생성자 파라미터에 Barista 추가 필요
        Cashier cashier = new Cashier(wCafe);
        Map<Beverage, Integer> myOrders = new HashMap<>();
        myOrders.put(new Americano(), 3);
        Customer c1 = new Customer("Card", myOrders);
        return c1.buyCoffee(cashier);
    }
}

```


---

#### b. 실습 코드(수정 후) :

<br>
- Beverage.java

```java
```

<br>
- Cashier.java

```java
```


<br>
- Barista.java

```java
```

---

<br><br>

### 1) 객체 및 캡슐화를 이용하는 과정**

- 객체에게 스스로 책임 부여 

<br>
- 객체를 캡슐화하기

<br>
- 외부접근은 public 인터페이스 이용 

<br>
- 결론은 객체가 슬롯이나 변경에 유용하도록 설계하기 


---

<br><br>

### 2) 객체지향적 프로그래밍 설계관점**

- 객체에게 역할이나 책임 부여(객체가 무엇을 하는지) 

<br>
- 객체부터 설계하고나서 의미가 비슷한 것끼리 묶어 공통화 후 추상화하기 이것은 즉, 클래스가 만들어진다.  

<br>
- 즉, 클래스 보다는 객체가 먼저다.**
	- 객체를 먼저 만들고나서 공통화 작업을 하면 추상화를 할 수 있기 때문에 그 후에 클래스가 만들어지기 때문에 클래스보다는 객체가 먼저다.
	- Ex) 캐셔보다는 음료에 정책이 붙는다. 슬롯이 교체되는 것 때문이다.


- 추후 경우에 따라 인터페이스 생성**

---


<br><br>

### 3) of() 메서드 만드는 법

- Entity 클래스에서 of() 메소드를 만들어서 DTO로 반환


```java
public class Post extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String content;

    public void updateBasicInfo(PostDto dto) {
        title = dto.title();
        content = dto.content();
    }

    public PostDto of() {
        return new PostDto(id, title, content,null, getCreateDate(), getModifyDate());
    }
}
```

<br><br>

### 4) 팩토리 메서드 사용법 

- switch 문을 이용해 type을 보고 적절한 구현체를 생성해서 런타임 시, 활용하는 방법


```java
public abstract class Employee {
	public abstract boolean isPayday(); 
	public abstract Money calculatePay(); 
	public abstract void deliverPay(); 
} 

public interface EmployeeFactory { 
	public Employee makeEmployee(EmployeeRecord r) throws InvalidEmployeeType; 
} 

@Configure 
public class EmployeeFactoryImpl implements EmployeeFactory { 
	public Employee makeEmployee(EmployeeRecord r) throws InvalidEmployeeType { 
		switch(r.type){ 
			case COMMISSION: 
				return new ComissionedEmployee(r); 
			case HOURLY: 
				return new HourlyEmployee(r); 
			case SALARIED: 
				return new SalariedEmployee(r); 
		}
	} 
} 

@Service 
public class EmployService{ 
	private EmployeeFactoryImpl employeeFactory; 

	public Money getTotalAmount(EmployeeRecord r){ 

		Employee e = employeeFactory.makeEmployee(r); 
			if(e.isPayday()){ 
				return e.calculatePay(); 
			else 
				return Money.ZERO; 
			}
	}
}
```



<br><br>

### 5) SOLID

#### a. SRP

- 메서드는 하나의 기능을 가져야만 한다.

- 클래스는 하나의 책임을 가져야만한다!


<br>

#### b. OCP

- 구현하는 것보다는 추상 클래스에 주의깊게 보자! 

<br>

#### c. LSP

- 자식클래스의 객체를 부모객체에 담아서 사용해도 문제가 없어야 한다.

- 자식은 프로그래밍적 판단도 같이 부모의 것을 상속받아야 한다. 부모의 기능 명세도 같이 받아야 한다!


---

<br><br>

### 6) 언제 인터페이스? 언제 추상화를 쓰는지?**

- a. 추상화가 되어있는 방법에서 상태값을 공유해서 사용하면, 추상화를 사용하고 아니라면 인터페이스를 사용한다!

- b. 꼭 필요한것만 구현하려면 인터페이스를 사용하자! 필요하지 않는 부분도 구현되어야 한다면 추상화를 사용하자!!

- c. DB를 붙인다면, 필요한 필드만 엔티티(DTO)로 빼고 필요한 메서드만 인터페이스(클래스로)로 확장시킨다.**


<br><br>

### 7) 결론 

<br>
- 하지만, OOP가 항상 옳은 것은 아니다. 절차지향적 프로그래밍과 트레이드오프(복잡성 증가)관계이다. DTO나 Entity는 절차지향적으로 설계되기 때문이다.




<br><br>

### 8) 추가적으로 공부**

- 이펙티브 자바 3/E 
 
- 토비의 스프링

- 멀티 모듈, 자료구조, 알고리즘

- 네트워크, DB, OS 정리

- 개발 : 
	- Redis : Refresh Token, Access Token
	- Kafka pipe line
	- Spring Batch








