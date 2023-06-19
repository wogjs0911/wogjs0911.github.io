---
key: /2023/03/04/SpringBoot-JPA-Study.html
title: SpringBoot - JPA 공부
tags: springboot JPA H2 Hibernate SLF4J RestfulAPI
---

# 1. Spring Boot 개발 환경 

<br>
- 인텔리제이 단축키 : 
	- "sout" 단축키 : 인텔리제이에서 "sout"만 입력하면 Sytem.out.println() 단축키
	- 커맨드 + 옵션 + V : 변수 뽑아내기!! 변수 생성하는 중요 단축키

<br>	
### 1) HikariCP
- HikariCP라는 커넥션 풀이 스프링 2.x 버전부터는 기본이다. 스레드로서 속도가 빠르다. 커넥션 풀이라는 것이 스레드를 미리 만들어놓고 나눠줘서 네트워크 속도가 빠르다.

<br>
### 2) SLF4J
- 로깅을 통합한 인터페이스로서 로깅에 필요한 경우에 쓰인다. JPA에서 자동화 기능 때문에 DB에 접속 시, 접속이 되었는지 직접적으로 확인을 하지 못하여 SQL문에 대한 로그 확인 시 필요!
- 보통, Logback을 플러그인으로 꽂아서 사용하기도 하고 다른 플러그인인 Log4j이나 Log4j2도 꽂아서 사용한다.
- `log.info()`처럼 사용하고 다른 종류의 log 메서드도 있다. 

```java

   @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        log.info("payload{}", payload);

        ChatMessage chatMessage = objectMapper.readValue(payload, ChatMessage.class);
        ChatRoom room = chatService.findRoomById(chatMessage.getRoomId());
        room.handleActions(session, chatMessage, chatService);
    }

```

<br>
### 3) H2 데이터베이스
- 데이터 베이스를 내장 메모리를 통해 간단하게 실행할 수 있다.
- 개발이나 테스트 용도로 가볍고 편리한 DB이고 따로 웹 화면을 제공해준다.
- 교육용으로 쓰이는데 장점이 많은 데이터 베이스이다.  

<br>
#### a. H2 DB 접속 실행 방법 : 

<br>
- 데이터베이스 파일 생성 방법**
	- `jdbc:h2:~/jpashop` (최소 한번)
	- 홈 폴더에 `~/jpashop.mv.db` 파일 생성 확인, 세션 키를 가지고 처음에만 생성해준다.
	- 세션 키를 등록해서 이후 부터는 `jdbc:h2:tcp://localhost/~/jpashop`로 이렇게 DB에 접속한다.


<br>
### 4) Thymeleaf
- MVC : Controller가 Data를 Model에 실어서 View 단으로 넘겨서 출력해준다.
- 타임리프는 내츄럴 템플릿으로 서버를 키지 않아도 브라우저에서 바로 화면에 대해 출력을 확인할 수 있다.
- 자동적으로 컴파일 해주는 도구 : Gradle에 spring-starters-devtools 추가 


<br>
### 5) 테스트 라이브러리 : spring-boot-starter-test
- junit: 테스트 프레임워크
- mockito: 목 라이브러리
- assertj: 테스트 코드를 좀 더 편하게 작성하게 도와주는 라이브러리
- spring-test: 스프링 통합 테스트 지원

---

<br><br>

# 2. JPA 개발 환경 테스트

### 1) yml 설정 

- H2 DB를 사용함.

- application.yml

```yml
spring:
  datasource:
    url: jdbc:h2:tcp://localhost/~/jpashop
    username: sa
    password:
    driver-class-name: org.h2.Driver

  jpa:
    hibernate:
      ddl-auto: create
    properties:
      hibernate:
#        show_sql: true
        format_sql: true

logging.level:
  org.hibernate.SQL: debug
  org.hibernate.orm.jdbc.bind: trace
```

---

<br>

### 2) 구현 코드 :

- Member.java

```java
package jpabook.jpashop.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Member {

    @Id
    @GeneratedValue
    private Long id;

    private String username;
}

```

<br>
- MemberRepository.java

```java
package jpabook.jpashop.repository;


import jakarta.persistence.Entity;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jpabook.jpashop.entity.Member;
import org.springframework.stereotype.Repository;


@Repository
public class MemberRepository {
    @PersistenceContext
    EntityManager em;

    public Long save(Member member){
        em.persist(member);

        return member.getId();
    }

    public Member find(Long id){
        return em.find(Member.class, id);
    }
}

```

---

<br>

### 3) 테스트 코드 :

- 테스트 코드는 서버 실행  시, 처음 하이버네이트가 만들어지므로 그 때, 한번만 테스트 통과가 되고 그 후에는 기존 테이블을 지우고 다시 테스트를 해야하거나 Rollback false 설정을 제거해주면 된다.

- JUnit4를 사용함.
	
	
```java
package jpabook.jpashop.repository;


import jpabook.jpashop.entity.Member;
import org.assertj.core.api.Assertions;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertEquals;

@RunWith(SpringRunner.class)
@SpringBootTest
public class MemberRepositoryTest {

    @Autowired
    MemberRepository memberRepository;

    @Test
    @Transactional
    @Rollback(value = false)
    public void testMember() throws Exception {

        Member member = new Member();
        member.setUsername("memberA");

        Long saveId = memberRepository.save(member);
        Member findMember = memberRepository.find(saveId);

        Assertions.assertThat(findMember.getUsername()).isEqualTo(member.getUsername());
        Assertions.assertThat(findMember.getId()).isEqualTo(member.getId());
    }
}
```

---

<br><br>

# 3. 엔티티 개발

### 1) 주의점 : 

#### a. 도메인 모델 개발 방법 : 

- Setter는 닫아두기!(Getter는 열어두기!)

- 외래키가 있는 곳을 연관관계의 주인으로 정해라! 

<br><br>

#### b. @ManyToMany, @XToMany 처리 방법(LAZY, N+1) :

- @ManyToMany는 관계로서 사용하지 말 것. 다대일로 풀어낼 것.

- 그리고 왠만해서는 LAZY 사용하기!(즉시 로딩인 EAGER는 예측이 어렵고 N+1 문제가 자주 발생한다!)

- 연관된 Entity를 함께 DB에서 조회해야 하려면, fetch join 또는 엔티티 그래프를 사용한다.

- @XToOne은 기본적으로 즉시로딩이라서 무조건 추가로 LAZY 설정을 해줘야 한다.


<br><br>

#### c. mappedBy 처리 방법: 

- JPA 관계에서 parent라면, child 부분에 mappedBy를 parent로 매핑하여 관계를 처리해준다.

- mappedBy는 매핑되는 상대를 의미한다. 

<br><br>

#### d. 다대다 매핑 처리 방법: 

- 계층 관계랑 같은 건가?

- 다대다 매핑은 중간 테이블에 칼럼을 추가할 수도 없어서

- 중간 엔티티인 CategoryItem을 만들어서 다대일과 일대다로 풀어낸다.


<br><br>

#### e. Inheritance, DiscriminatorColumn


##### a) Inheritance(strategy=InheritanceType.XXX)

- 객체는 상속을 지원하므로 모델링과 구현이 똑같지만, DB는 상속을 지원하지 않으므로 논리 모델을 물리 모델로 구현할 방법이 필요하다.

- @Inheritance(strategy=InheritanceType.XXX)의 stategy를 설정해주면 된다.

- default 전략은 SINGLE_TABLE(단일 테이블 전략)이다.

<br>
- InheritanceType 종류
	- JOINED
	- SINGLE_TABLE
	- TABLE_PER_CLASS

<br>

##### b) @DiscriminatorColumn

- 부모 클래스에 선언한다. 하위 클래스를 구분하는 용도의 컬럼이다. 관례는 default = DTYPE

<br>

##### c) @DiscriminatorValue("XXX")

- 하위 클래스에 선언한다. 엔티티를 저장할 때 슈퍼타입의 구분 컬럼에 저장할 값을 지정한다.

- 어노테이션을 선언하지 않을 경우 기본값으로 클래스 이름이 들어간다.

---

<br><br>


### 2) 실습 코드 : 

<br>

- Member.java

```java
package jpabook.jpashop.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter @Setter
public class Member {

    // Setter는 닫아두기!
    // 외래키가 있는 곳을 연관관계의 주인으로 정해라!
    @Id
    @GeneratedValue
    private Long id;
    private String name;

    @Embedded
    private Address Address;

    @OneToMany(mappedBy = "member")
    private List<Order> orders = new ArrayList<>();
}

```

---

<br>

- Order.java

```java
package jpabook.jpashop.domain;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter @Setter
public class Order {

    @Id @GeneratedValue
    @Column(name="order_id")
    private Long id;

    // @ManyToMany는 관계로서 사용하지 말 것. 다대1로 풀어낼 것.
    // 그리고 왠만해서는 LAZY 사용하기!(즉시 로딩인 EAGER는 예측이 어렵고 N+1 문제가 자주 발생한다!)
    // 연관된 Entity를 함께 DB에서 조회해야 하려면, fetch join 또는 엔티티 그래프를 사용한다.
    // @XToOne은 기본적으로 즉시로딩이라서 무조건 추가로 LAZY 설정을 해줘야 한다.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;  // 주문 회원

    // mappedBy 중요!(관계에서 매핑되는 부분)
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> orderItems = new ArrayList<>();

    // OneToOne 주의하기!!
    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_id")
    private Delivery delivery;  // 배송정보

    private LocalDateTime orderDate; // 주문시간

    // enum 클래스 이용!(상태 이용 시, 사용)
    @Enumerated(EnumType.STRING)
    private OrderStatus status; // 주문 상태[ORDER, CANCEL]

    // == 연관관계 메서드 == //
    public void setMember(Member member) {
        this.member = member;
        member.getOrders().add(this);
    }

    public void addOrderItem(OrderItem orderItem){
        orderItems.add(orderItem);
        orderItem.setOrder(this);
    }

    public void setDelivery(Delivery delivery){
        this.delivery = delivery;
        delivery.setOrder(this);
    }


}

```

---

<br>

- OrderItem.java

```java
package jpabook.jpashop.domain;

import jakarta.persistence.*;
import jpabook.jpashop.domain.item.Item;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "order_item")
@Getter @Setter
public class OrderItem {

    // 여러 엔티티가 묶여 있으면 '_'로 계층 별로 칼럼명 매핑!
    @Id
    @GeneratedValue
    @Column(name = "order_item_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private Item item;  // 주문 상품

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;    // 주문

    private int orderPrice; // 주문 가격
    private int count; // 주문 수량
}

```



---

<br>

- OrderStatus.java

```java
package jpabook.jpashop.domain;

public enum OrderStatus {
    ORDER, CANCEL
}

```


---

<br>

- Delivery.java

```java
package jpabook.jpashop.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter @Setter
public class Delivery {

    @Id
    @GeneratedValue
    @Column(name = "delivery_id")
    private Long id;

    @OneToOne(mappedBy = "delivery", fetch = FetchType.LAZY)
    private Order order;

    @Embedded
    private Address address;

    @Enumerated(EnumType.STRING)
    private DeliveryStatus status;  // ENUM [READY(준비), COMP(배송)]
}

```

---

<br>

- DeliveryStatus.java

```java
package jpabook.jpashop.domain;

public enum DeliveryStatus {
    READY, COMP
}

```

---

<br>

- Address.java

```java
package jpabook.jpashop.domain;

import jakarta.persistence.Embeddable;
import lombok.Getter;

@Embeddable
@Getter
public class Address {

    private String city;
    private String street;
    private String zipcode;

    protected Address(){

    }

    public Address(String city, String street, String zipcode) {
        this.city = city;
        this.street = street;
        this.zipcode = zipcode;
    }
}

```

---

<br>

- Category.java

```java
package jpabook.jpashop.domain;

import jakarta.persistence.*;
import jpabook.jpashop.domain.item.Item;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
public class Category {

    @Id
    @GeneratedValue
    @Column(name = "category_id")
    private Long id;

    private String name;

    // 여기 다시 듣기!! ==> 어렵다!
    // 계층 관계랑 같은 건가?
    // * 다대다 매핑은 중간 테이블에 칼럼을 추가할 수도 없어서
    // 중간 엔티티인 CategoryItem을 만들어서 다대일과 일대다로 풀어낸다.
    @ManyToMany
    @JoinTable(name = "category_item",
            joinColumns = @JoinColumn(name="category_id"),
            inverseJoinColumns = @JoinColumn(name = "item_id"))
    private List<Item> items = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Category parent;

    // parent, child 를 매핑해준다.
    // mappedBy는 매핑되는 상대를 의미한다.
    @OneToMany(mappedBy = "parent")
    private List<Category> child = new ArrayList<>();

    // == 연관관계 메서드 == //
    public void addChildCategory(Category child){
        this.child.add(child);
        child.setParent(this);
    }
}

```

---

<br><br>

- Item.java

```java
package jpabook.jpashop.domain.item;

import jakarta.persistence.*;

import jpabook.jpashop.domain.Category;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

// Inheritance, DiscriminatorColumn 추가로 공부하기
@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "dtype")
@Getter @Setter
public abstract class Item {

    @Id @GeneratedValue
    @Column(name = "item_id")
    private Long id;

    private String name;
    private int price;
    private int stockQuantity;

    @ManyToMany(mappedBy = "items")
    private List<Category> categories = new ArrayList<Category>();
}

```

---

<br>

<details>
<summary>Item 모음</summary>
<div markdown="1">


- Book.java


```java
package jpabook.jpashop.domain.item;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Entity
@DiscriminatorValue("B")
@Getter @Setter
public class Book extends Item{
    private String author;
    private String isbn;
}

```

---

<br>

- Album.java


```java
package jpabook.jpashop.domain.item;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Entity
@DiscriminatorValue("A")
@Getter @Setter
public class Album extends Item {
    private String artist;
    private String etc;
}

```

---

<br>

- Movie.java

```java

package jpabook.jpashop.domain.item;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Entity
@DiscriminatorValue("M")
@Getter @Setter
public class Movie extends Item {
    private String director;
    private String actor;
}

```


</div>
</details>


---

<br><br>


# 4. 회원 도메인 개발 

### 1) JPA ORM 개념 정리

#### a. EntityManager

- JPA는 스레드가 하나 생성될 때 마다(매 요청마다) EntityManagerFactory에서 EntityManager를 생성한다.

- EntityManager는 내부적으로 DB 커넥션 풀을 사용해서 DB에 붙는다.

- EntityManager가 영속성 컨텍스트를 통해서 DB에 저장된 엔티티를 불러온다.

---

<br>

#### b. EntityManager.persist(entity)

- 이전에 persist()로 db에 객체를 저장하는 것이라고 배웠지만,

- 실제로는 DB에 저장하는 것이 아니라, 영속성 컨텍스트를 통해서 엔티티를 영속화 한다는 뜻이다.

- 정확히 말하면 persist() 시점에는 영속성 컨텍스트에 저장한다. DB 저장은 이후이다.

---

<br>

#### c. 영속성 컨텍스트

- 영속성 컨텍스트는 논리적인 개념이다. 눈에 보이지 않는다.

- 엔티티 매니저를 통해서 영속성 컨텍스트에 접근한다.

---

<br>

#### d. 엔티티의 생명주기

#### a) 비영속(new/transient)

- 영속성 컨텍스트와 전혀 관계가 없는 상태

#### b) 영속(managed)

- 영속성 컨텍스트에 저장된 상태

- 엔티티가 영속성 컨텍스트에 의해 관리된다.

- 이때 DB에 저장 되지 않는다. 영속 상태가 된다고 DB에 쿼리가 날라가지 않는다.

- 트랜잭션의 커밋 시점에 영속성 컨텍스트에 있는 정보들이 DB에 쿼리로 날라간다.


#### c) 준영속(detached)

- 영속성 컨텍스트에 저장되었다가 분리된 상태

#### d) 삭제(removed)

- 삭제된 상태. DB에서도 날린다.

---

<br>

#### e. flush

- 트랜잭션 내부에서 persist()가 일어날 때, 엔티티들을 1차 캐시에 저장하고, 논리적으로 쓰기 지연 SQL 저장소 라는 곳에 INSERT 쿼리들을 생성해서 쌓아 놓는다.

- DB에 바로 넣지 않고 기다린다.

- 즉, commit()하는 시점에 DB에 동시에 쿼리들을 쫙 보낸다.(쿼리를 보내는 방식은 동시 or 하나씩 옵션에 따라)

- 이렇게 쌓여있는 쿼리들을 DB에 보내는 동작이 flush() 이다.

- flush()는 1차캐시를 지우지는 않는다. 쿼리들을 DB에 날려서 DB와 싱크를 맞추는 역할을 한다.

- 실제로 쿼리를 보내고 나서, commit()한다.

- 트랜잭션을 커밋하게 되면, flush() 와 commit() 두가지 일을 하게 되는 것이다.

---

<br><br>

### 2) 실습 코드 : 


- MemberRepository.java

```java
package jpabook.jpashop.repository;

import jakarta.persistence.Entity;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jpabook.jpashop.domain.Member;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class MemberRepository {

    // 1. JPA는 스레드가 하나 생성될 때 마다(매 요청마다) EntityManagerFactory에서 EntityManager를 생성한다.
    // EntityManager는 내부적으로 DB 커넥션 풀을 사용해서 DB에 붙는다.
    // EntityManager가 영속성 컨텍스트를 통해서 DB에 저장된 엔티티를 불러온다.

//    2. EntityManager.persist(entity);
//    이전에 persist()로 db에 객체를 저장하는 것이라고 배웠지만,
//    실제로는 DB에 저장하는 것이 아니라, 영속성 컨텍스트를 통해서 엔티티를 영속화 한다는 뜻이다.
//    정확히 말하면 persist() 시점에는 영속성 컨텍스트에 저장한다. DB 저장은 이후이다.

    @PersistenceContext
    private EntityManager em;

    public void save(Member member){
        em.persist(member);
    }

    public Member findOne(Long id){
        return em.find(Member.class, id);
    }

    public List<Member> findAll(){
        return em.createQuery("select a from Member m", Member.class)
                .getResultList();
    }

    public List<Member> findByName(String name){
        return em.createQuery("select m from Member m where m.name = :name", Member.class)
                .setParameter("name",name)
                .getResultList();
    }


}

```


<br>

- MemberService.java

```java

package jpabook.jpashop.service;


import jpabook.jpashop.domain.Member;
import jpabook.jpashop.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// readOnly : 데이터 변경이 없는 경우, 서비스 단에서 사용!(읽기 전용일 경우, 약간 성능 향상)
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class MemberService {

    // 필드 주입보다는 생성자 주입을 사용할 것!(불변성 보장!)
//    @Autowired
//    MemberRepository memberRepository;

    private final MemberRepository memberRepository;

//    public MemberService(MemberRepository memberRepository) {
//        this.memberRepository = memberRepository;
//    }

    /**
     * 회원가입
     */
    @Transactional
    public Long join(Member member){

        validateDuplicateMember(member);    // 중복 회원 검증
        memberRepository.save(member);
        return member.getId();
    }

    /**
     * 전체 회원 조회
     */
    public List<Member> findMembers(){
        return memberRepository.findAll();
    }

    public Member findOne(Long memberId){
        return memberRepository.findOne(memberId);
    }

    /**
     * 중복 회원 검증(private)
     */
    private void validateDuplicateMember(Member member) {
        List<Member> findMembers = memberRepository.findByName(member.getName());
        if(!findMembers.isEmpty()){
            throw new IllegalStateException("이미 존재하는 회원입니다.");
        }
    }
}

```

---

<br>

- Test 코드 :

<br>

- MemberServiceTest.java

```java
package jpabook.jpashop.test.service;

import jpabook.jpashop.domain.Member;
import jpabook.jpashop.repository.MemberRepository;
import jpabook.jpashop.service.MemberService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

@RunWith(SpringRunner.class)
@SpringBootTest
public class MemberServiceTest {

    @Autowired
    MemberService memberService;

    @Autowired
    MemberRepository memberRepository;

    @Test
    @Transactional
    public void 회원가입() throws Exception{

        // Given(조건)
        Member member = new Member();
        member.setName("kim");

        // When(상황)
        Long saveId = memberService.join(member);

        // THen(결과)
        assertEquals(member, memberRepository.findOne(saveId));
    }

    @Test(expected = IllegalStateException.class)
    public void 중복_회원_예외() throws Exception{

        // Given
        Member member1 = new Member();
        member1.setName("kim");

        Member member2 = new Member();
        member2.setName("kim");

        // When
        memberService.join(member1);
        memberService.join(member2);    // 여기서 에러 발생해야 한다.

        // Then
        fail("예외가 발생해야 한다.");
    }
}

```

---

<br><br>

### 3) Test yml 설정 변경 

- 추가로 Test 패키지 안에 yml 파일을 추가하여 메모리 DB로만으로도 테스트가 가능하다.

- test/resources/application.yml

<br>

- application.yml

```yml

spring:
##  datasource:
##    url: jdbc:h2:tcp://localhost/~/jpashop
##    username: sa
##    password:
##    driver-class-name: org.h2.Driver
#
##  jpa:
##    hibernate:
##      ddl-auto: create
##    properties:
##      hibernate:
##        show_sql: true
##        format_sql: true
#
logging.level:
  org.hibernate.SQL: debug
##  org.hibernate.orm.jdbc.bind: trace
```

<br>

- 참고 : [참고 블로그 글](https://ict-nroo.tistory.com/130)

---

<br><br>

# 5. 상품 도메인 개발 

### 1) JPA의 엔티티 개념 정리 : 

- JPA에서는 객체 지향형이라서 Entity에도 역할(책임)을 부여한다.

- 이제는 거의 핵심 비즈니스 로직은 entity에 담는 것인가?

- 다음 장에서 설명!

---

<br><br>

### 2) 실습 코드 :

- Item.java

```java
package jpabook.jpashop.domain.item;

import jakarta.persistence.*;

import jpabook.jpashop.domain.Category;
import jpabook.jpashop.exception.NotEnoughStockException;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

// Inheritance, DiscriminatorColumn 추가로 공부하기
@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "dtype")
@Getter @Setter
public abstract class Item {

    @Id @GeneratedValue
    @Column(name = "item_id")
    private Long id;

    private String name;
    private int price;
    private int stockQuantity;

    @ManyToMany(mappedBy = "items")
    private List<Category> categories = new ArrayList<Category>();

    // ==== ******** 비즈니스 로직 추가 ******* ==== //
    // JPA에서는 객체 지향형이라서 Entity에도 역할(책임)을 부여한다.
    // 이제는 거의 핵심 로직은 entity에 담는 것인가?
    public void addStock(int quantity){
        this.stockQuantity += quantity;
    }

    public void removeStock(int quantity){
        int restStock = this.stockQuantity - quantity;

        if(restStock < 0){
            throw new NotEnoughStockException("need more stock");
        }
        this.stockQuantity = restStock;
    }

}

```

---

<br>
- NotEnoughStockException.java

```java
package jpabook.jpashop.exception;

public class NotEnoughStockException extends RuntimeException {

    public NotEnoughStockException() {
    }

    public NotEnoughStockException(String message) {
        super(message);
    }

    public NotEnoughStockException(String message, Throwable cause) {
        super(message, cause);
    }

    public NotEnoughStockException(Throwable cause) {
        super(cause);
    }

}

```

---

<br>

- ItemRepository.java


```java
package jpabook.jpashop.repository;

import jakarta.persistence.EntityManager;
import jpabook.jpashop.domain.item.Item;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class ItemRepository {

    private final EntityManager em;

    public void save(Item item){
        if(item.getId() == null){
            em.persist(item);
        }
        else{
            em.merge(item);
        }
    }

    public Item findOne(Long id){
        return em.find(Item.class, id);
    }

    public List<Item> findAll(){
        return em.createQuery("select i from Item i", Item.class).getResultList();
    }
}

```


---

<br>

- ItemService.java


```java
package jpabook.jpashop.service;

import jpabook.jpashop.domain.item.Item;
import jpabook.jpashop.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;

    @Transactional
    public void saveItem(Item item){
        itemRepository.save(item);
    }

    public List<Item> findItems(){
        return itemRepository.findAll();
    }

    public Item findOne(Long itemId){
        return itemRepository.findOne(itemId);
    }
}

```


---

<br><br>


# 6. 주문 도메인 개발

### 1) 도메인 모델 패턴 정리 : 

- 아래 코드처럼 주문과 주문 취소의 메서드에서 '비즈니스 로직의 대부분'이 '엔티티'에 있다.

- 즉, 서비스 계층은 단순히 엔티티에 필요한 요청을 위임하는 역할만 하게 된다.

- 정리하면, 엔티티가 비즈니스 로직을 가지고 객체 지향의 특성을 적극 활용하는 것이 `도메인 모델 패턴` 이라고 부른다!

- 이와 반대로 서비스 계층에서 대부분의 비즈니스 로직을 가지고 있었던 이전 방식의 디자인 패턴을 `트랜잭션 스크립트 패턴` 이라고 한다!

- 그래서, 도메인 모델 패턴은 JPA와 사상이 비슷한 디자인 패턴이다. 

---

<br><br>

### 2) 실습 코드 :

<br>

- Order.java


```java
package jpabook.jpashop.domain;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.aspectj.weaver.ast.Or;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter @Setter
public class Order {

    @Id @GeneratedValue
    @Column(name="order_id")
    private Long id;

    // @ManyToMany는 관계로서 사용하지 말 것. 다대1로 풀어낼 것.
    // 그리고 왠만해서는 LAZY 사용하기!(즉시 로딩인 EAGER는 예측이 어렵고 N+1 문제가 자주 발생한다!)
    // 연관된 Entity를 함께 DB에서 조회해야 하려면, fetch join 또는 엔티티 그래프를 사용한다.
    // @XToOne은 기본적으로 즉시로딩이라서 무조건 추가로 LAZY 설정을 해줘야 한다.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;  // 주문 회원

    // mappedBy 중요!(관계에서 매핑되는 부분)
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> orderItems = new ArrayList<>();

    // OneToOne 주의하기!!
    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_id")
    private Delivery delivery;  // 배송정보

    private LocalDateTime orderDate; // 주문시간

    // enum 클래스 이용!(상태 이용 시, 사용)
    @Enumerated(EnumType.STRING)
    private OrderStatus status; // 주문 상태[ORDER, CANCEL]

    // == 연관관계 메서드 == //
    public void setMember(Member member) {
        this.member = member;
        member.getOrders().add(this);
    }

    public void addOrderItem(OrderItem orderItem){
        orderItems.add(orderItem);
        orderItem.setOrder(this);
    }

    public void setDelivery(Delivery delivery){
        this.delivery = delivery;
        delivery.setOrder(this);
    }

    // ===== 생성 메서드 ====== //
    // OrderItem... orderItems는 주문 아이템이 여러개일 수도 있어서
    // 여러 entity가 복합된 주문(Order) 결과를 뽑아낸다.
    // 실제 주문 엔티티!!
    public static Order createUser(Member member, Delivery delivery, OrderItem... orderItems){
        Order order = new Order();

        order.setMember(member);

        order.setDelivery(delivery);

        for(OrderItem orderItem : orderItems){
            order.addOrderItem(orderItem);
        }

        order.setStatus(OrderStatus.ORDER);

        order.setOrderDate(LocalDateTime.now());

        return order;
    }


    // ========== 비즈니스 로직 ============ //
    // ** 주문 취소 ** //
    public void cancel(){
        if(delivery.getStatus() == DeliveryStatus.COMP){
            throw new IllegalStateException("이미 배송완료된 상품은 취소가 불가능합니다.");
        }

        this.setStatus(OrderStatus.CANCEL);

        for(OrderItem orderItem : orderItems){
            orderItem.cancel();
        }

    }

    // ==== 조회 로직 ==== //
    // *** 전체 주문 가격 조회 *** //
    public int getTotalPrice(){
        int totalPrice = 0;

        for(OrderItem orderItem : orderItems){
            totalPrice += orderItem.getTotalPrice();
        }

        return totalPrice;
    }
}

```


---

<br>

- OrderItem.java


```java
package jpabook.jpashop.domain;

import jakarta.persistence.*;
import jpabook.jpashop.domain.item.Item;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "order_item")
@Getter @Setter
public class OrderItem {

    // 여러 엔티티가 묶여 있으면 '_'로 계층 별로 칼럼명 매핑!
    @Id
    @GeneratedValue
    @Column(name = "order_item_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private Item item;  // 주문 상품

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;    // 주문

    private int orderPrice; // 주문 가격
    private int count; // 주문 수량

    // ===== 생성 메서드 ======= //
    // 주문 1개에 관한 정보(주문 1개의 아이템 엔티티)
    // 1개 주문시, 그 아이템의 개수는 1개 줄어야 한다. 진짜 엔티티 관련 로직이 여기에 다 들어가네
    public static OrderItem createOrderItem(Item item, int orderPrice, int count){
        OrderItem orderItem = new OrderItem();

        orderItem.setItem(item);
        orderItem.setOrderPrice(orderPrice);
        orderItem.setCount(count);
        item.removeStock(count);

        return orderItem;
    }

    // ====== 비즈니스 로직 ====== //
    // ***** 주문 취소 *****
    public void cancel(){
        getItem().addStock(count);
    }

    // ==== 조회 로직 ==== //
    // *** 주문 상품의 전체 가격 조회 *** //
    public int getTotalPrice(){
        return getOrderPrice() * getCount();
    }
}

```


---

<br>

- OrderRepository.java


```java
package jpabook.jpashop.repository;

import jakarta.persistence.Entity;
import jakarta.persistence.EntityManager;
import jpabook.jpashop.domain.Order;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class OrderRepository {

    private final EntityManager em;

    public void save(Order order){
        em.persist(order);
    }

    public Order findOne(Long id){
        return em.find(Order.class, id);
    }

// 검색은 나중에!
//    public List<Order> findAll(OrderSearch orderSearch);
}

```


---

<br>

- OrderService.java


```java
package jpabook.jpashop.service;

import jpabook.jpashop.domain.*;
import jpabook.jpashop.domain.item.Item;
import jpabook.jpashop.repository.ItemRepository;
import jpabook.jpashop.repository.MemberRepository;
import jpabook.jpashop.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final MemberRepository memberRepository;
    private final ItemRepository itemRepository;
    private final OrderRepository orderRepository;

    // ****** 주문 ******
    // 중요!! : 주문과 주문 취소 메서드는 비즈니스 로직의 대부분이 엔티티에 있다.
    // 즉, JPA에서 서비스 계층은 단순히 엔티티에 필요한 요청을 위임하는 역할만 하게 된다.
    // 정리하면, 엔티티가 비즈니스 로직을 가지고 객체 지향의 특성을 적극 활용하는 것이 "도메인 모델 패턴"이다!
    // 이와 반대로 서비스 계층에서 대부분의 비즈니스 로직을 가지고 있던 이전 프로그래밍 방법론을 '트랜잭션 스크립트 패턴'이라고 한다!
    @Transactional
    public Long order(Long memberId, Long itemId, int count){

        // ** 엔티티 조회! **
        Member member = memberRepository.findOne(memberId);
        Item item = itemRepository.findOne(itemId);

        // ** 배송 정보 생성 **
        Delivery delivery = new Delivery();
        delivery.setAddress(member.getAddress());
        delivery.setStatus(DeliveryStatus.READY);

        // 주문상품 생성
        OrderItem orderItem = OrderItem.createOrderItem(item, item.getPrice(), count);

        // 주문 생성
        Order order = Order.createUser(member, delivery, orderItem);

        // 주문 저장
        orderRepository.save(order);
        return order.getId();
    }

    // *** 주문 취소 ***
    @Transactional
    public void cancelOrder(Long orderId){
        Order order = orderRepository.findOne(orderId);
        order.cancel(); // 주문 취소
    }

    // *** 주문 검색 ***

/*    public List<Order> findOrders(OrderSearch orderSearch){
        return orderRepository.findAll(orderSearch);
    }*/


}

```


--- 

<br><br>


# 7. 주문 관련 테스트 코드

### 1) 개념 정리  :



---

<br><br>

### 2) 실습 코드 1 :

- 주문 관련 테스트 코드

- OrderServiceTest.java


```java
package jpabook.jpashop.test.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jpabook.jpashop.domain.Address;
import jpabook.jpashop.domain.Member;
import jpabook.jpashop.domain.Order;
import jpabook.jpashop.domain.OrderStatus;
import jpabook.jpashop.domain.item.Book;
import jpabook.jpashop.domain.item.Item;
import jpabook.jpashop.exception.NotEnoughStockException;
import jpabook.jpashop.repository.OrderRepository;
import jpabook.jpashop.service.OrderService;
import org.junit.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

@RunWith(SpringRunner.class)
@SpringBootTest
@Transactional
public class OrderServiceTest {

    @PersistenceContext
    EntityManager em;

    @Autowired
    OrderService orderService;

    @Autowired
    OrderRepository orderRepository;

    @Test
    public void 상품주문() throws Exception {

        // Given
        Member member = createMember();
        Item item = createBook("시골 JPA", 10000, 10);
        int orderCount = 2;

        // When
        Long orderId = orderService.order(member.getId(), item.getId(), orderCount);

        // Then
        Order getOrder = orderRepository.findOne(orderId);

        assertEquals("상품 주문시 상태는 ORDER", OrderStatus.ORDER, getOrder.getStatus());
        assertEquals("주문한 상품 종류 수가 정확해야 한다.",1,getOrder.getOrderItems().size());
        assertEquals("주문 가격은 가격 * 수량이다", 10000 * 2, getOrder.getTotalPrice());
        assertEquals("상품 주문시 상태는 ORDER",8,item.getStockQuantity());
    }

    @Test(expected = NotEnoughStockException.class)
    public void 상품주문_재고수량초과() throws Exception{

        // Given
        Member member = createMember();
        Item item = createBook("시골 JPA", 10000, 10);

        int orderCount = 11;    // 재고보다 많은 수량

        // When
        orderService.order(member.getId(), item.getId(), orderCount);

        // Then
        // 기존 수량 10개보다 많이 주문해서 에러가 발생한다.
        fail("재고 수량 부족 예외가 발생해야 한다.");
    }

    @Test
    public void 주문취소(){
        // Given
        Member member = createMember();
        Item item = createBook("시골 JPA", 10000, 10); // 이름, 가격, 재고
        int orderCount = 2;

        Long orderId = orderService.order(member.getId(), item.getId(), orderCount);

        // When
        orderService.cancelOrder(orderId);

        // Then
        Order getOrder = orderRepository.findOne(orderId);

        assertEquals("주문 취소시, 상태는 CANCEL이다.", OrderStatus.CANCEL, getOrder.getStatus());
        assertEquals("주문이 취소된 상품은 그만큼 재고가 증가해야 한다.", 10, item.getStockQuantity());

    }

    private Member createMember() {
        Member member = new Member();
        member.setName("회원1");
        member.setAddress(new Address("서울", "강가", "123-123"));
        em.persist(member);
        return member;
    }

    private Item createBook(String name, int price, int stockQuantity) {
        Book book = new Book();
        book.setName(name);
        book.setStockQuantity(stockQuantity);
        book.setPrice(price);
        em.persist(book);
        return book;
    }





}

```

---

<br><br>

### 3) 실습 코드 2 :

- 검색 기능 추가 

- JPQL? or Criteria? or QueryDSL?  

---


<br><br>

- OrderSearch.java


```java
package jpabook.jpashop.domain;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderSearch {
    private String memberName;  // 회원 이름
    private OrderStatus orderStatus; // 주문 상태(ORDER, CANCEL)

    // Getter, Setter

}


```

<br>

- OrderRepository.java


```java
package jpabook.jpashop.repository;

import jakarta.persistence.Entity;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jpabook.jpashop.domain.Order;
import jpabook.jpashop.domain.OrderSearch;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class OrderRepository {


    private final EntityManager em;

    public void save(Order order){
        em.persist(order);
    }

    public Order findOne(Long id){
        return em.find(Order.class, id);
    }

    public List<Order> findAll(OrderSearch orderSearch){
        // .. 검색 로직 필요 : 검색 조건에 동적으로 쿼리를 생성해서 주문 엔티티를 조회!
        // 방법 1 : JPQL 쿼리로 진행 -> 동적 쿼리를 문자로 생성하기가 어렵고 실수로 인한 버그 발생률이 높다.
        // 방법 2 : JPA Criteria로 처리 -> JPA 표준 스펙이지만 실무에서 사용하기 매우 복잡하다! 그래서 Querydsl을 사용한다.

    }

    public List<Order> findAllByString(OrderSearch orderSearch) {
        // 1. language = JPAQL
        String jpql = "select o From Order o join o.member m";

        boolean isFirstCondition = true;
        //주문 상태 검색
        if (orderSearch.getOrderStatus() != null) {
            if (isFirstCondition) {
                jpql += " where";
                isFirstCondition = false;
            } else {
                jpql += " and";
            }
            jpql += " o.status = :status";
        }
        //회원 이름 검색
            if (StringUtils.hasText(orderSearch.getMemberName())) {
                if (isFirstCondition) {
                    jpql += " where";
                    isFirstCondition = false;
                } else {
                    jpql += " and";
                }
                jpql += " m.name like :name";
            }
        TypedQuery<Order> query = em.createQuery(jpql, Order.class) .setMaxResults(1000); //최대 1000건
          if (orderSearch.getOrderStatus() != null) {
            query = query.setParameter("status", orderSearch.getOrderStatus());
        }
          if (StringUtils.hasText(orderSearch.getMemberName())) {
            query = query.setParameter("name", orderSearch.getMemberName());
        }
          return query.getResultList();
    }
}

```

<br><br>




