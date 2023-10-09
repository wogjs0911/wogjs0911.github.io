---
key: /2023/09/15/SpringBoot-JPA-Study2.html
title: SpringBoot - JPA Study2
tags: springboot JPA Hibernate 
---

# 1. JPA 등장 배경

### 1) JPA 사용하는 이유?**

- 객체와 RDB(관계형 데이터 베이스)의 패러다임을 줄이고자 사용!!

<br>
- SQL 중심의 개발에서 객체중심의 개발로 하기위해서

---

<br>

### 2) queryDSL 사용하는 이유?**

- 컴파일 단계에서 오류를 잡아줌

<br>
- 변수명이나 쿼리가 길어지기 때문에 이를 줄이고자 등장

---

<br>

### 3) spring을 사용하는 이유?**

- Bean -> IOC -> DI // filter, AOC, intercept

<br>
- 빈이 객체의 생명주기를 관리해줘서


---

<br><br>

# 2. JPA 동작원리

- `EntityManager` 안에 영속성 컨텍스트가 있으며 `persist()`로 영속화를 시켜서 영속성 컨텍스트 내부에 엔티티 영속

<br>
- 영속성 컨텍스트에 있는 엔티티만 DB의 테이블로 만든다.

<br>
- `flush()`는 영속성 컨텍스트의 엔티티를 없애지 않는다. 영속성 컨텍스트와 DB 사이에서 테이블과 쿼리 상황을 일치시킨다.

<br>
- 1차 캐시로 인해서 한번 실행한 쿼리는 DB에서 직접 불러오지 않아서 성능이 약간 좋다.

<br>
- 한 트랜잭션 내부에서는 `EntityManager`를 공유하며 또다른 트랜잭션의 경우 `EntityManager`를 또 만들어야 한다.
	- 트랜잭션 내부에서 영속된 엔티티의 동일성을 보장한다.

<br>
- 쓰기 지연 DB에 의해 한 번에 모아서 트랜잭션 종료시에 한방에 쿼리를 날린다.



---

<br><br>

# 3. JPA 정책


<br>

### 1) `@generatedValue`

#### a. squence 정책 

- 값을 모아서 쿼리를 날리는데 미리 크기가 '50'정도의 크기를 값으로 받아 올 수도 있다.

<br>

#### b. identity 정책 

##### a) 단점 :

- insert query 날릴 시점마다 직접 db에 들어가봐랴야 pk값 확인 가능

<br>
- insert 시점에는 jpa에서는 pk는 null로 확인됨.(insert 시, db에 직접 들어가면  pk값 확인 가능. 
	- 이후, select 쿼리를 날리면, 값 확인 가능  


---

<br>

### 2) JPA 엔티티 설계법 **

- order에서 member 객체를 사용하기 위해서는 id인 식별자를 참조하는게 아니라 객체 자체를 참조해야 한다.

<br>
- order.getMemberId() : 객체를 관계형 DB에 맞춘 형태

<br>
- order.getMember() : 관계형DB를 객체에 맞추기(Ok)

---

<br><br>

# 4. JPA 연관관계


### 1) JPA 연관관계 핵심 개념**

- 연관관계의 주인은 FK를 가진 객체이다. **

<br>
- 이것은 JPA가 RDB처럼 테이블 관계가 아니라 객체 간의 관계라서 어쩔 수 없이 억지로 관계 맺음.

<br>
- 주인이 아닌 가짜 주인공에게는 그에 반하도록 `@mappedBy`를 걸어준다!**

<br>
- 주인공이 되는 이유는 자주 변경되고 수정되고 삭제되는 부분이라서 이다!
	- 보통, 1:N 관계에서 'N'이 주인공이고 '1'에 해당하는 것이 거울에 비추는 것처럼 `@mappedBy`(매핑이 되어지도록)되는 녀석이다.**

<br>
- 이런 컨셉을 가져가는 이유는 만약에  '1' 부분에 주인공을 걸어서 설계하면, '1' 부분이 변경되면 'N'쪽에서도 `Insert`나 `Update` 쿼리를 날리기 때문이다.

---

<br>

### 2) JPA 연관관계 설계법**

- 왠만하면 단방향 연관관계로 설계하기

<br>
- 필요하다면 추가로 양방향 관계로 사용

<br>
- 하지만, 실무에서는 보통 양방향을 많이 쓴다.( JPQL때문에 )**



---

<br>

### 3) 연관관계 매핑 종류

- 일대다 관계 : '1'이 연관관계의 주인이지만, 'N'에서 외래키를 관리하는 희안한 구조이다.(객체와 RDB의 구조 차이로 인해)
	- 외래키가 반대편 테이블에 있어서 불편하며, 그래서 다대일관계를 많이 이용하자!

<br>
- 일대일 관계 : 객체적으로는 양방향 연관관계를 해야함. 하지만, 효율이 별로여서 FK있는 쪽이 연관관계의 주인이 되어서 맺는다.
	- 주테이블에 외래키를 가지먼 Jpa 개발자 들이 선호하며 주테이블만 조회하면 대상 테이블에 데이터를 가지고 있는지 판단된다.
	- 대상 테이블에 외래키를 가지면, DBA들이 선호하며, 프록시의 한계로서 즉시로딩만 가능**



---

<br><br>

# 5. 고급 매핑

### 1) 상속 매핑

- `@Discriminator` : 
	- @Discriminator로 `DType` 생성해서 상속해야 할 자식을 타입 별로 나눠서 상속한다. 이것은 JPA 권장사항이다.

<br>
- extends가 상속이며 이때는 `@Entity`나 `@Inheritance` 속성이 필요! 

<br>
- `@MappedSuperclass` 속성만 받아서 사용한다.

---

<br>

### 2) BaseEntity 개념 정리**

- 공통으로 쓰는 엔티티를 설계하려면 `BaseEntity`를 생성하여 상속받아서 사용한다.

---

<br>

### 3) 조인 전략 vs 싱글테이블 전략 

- 조인은 우리가 알고 있는 것

<br>
- 싱글테이블은 여러개의 상속받는것의 테이블을 하나에 뭉쳐놓음

<br>
- 뭐가 맞는지 모르겠다. 실무에서는 해당 전략이 잘 안맞을 수도



---

<br><br>

# 6. 프록시 개념

- 프록시 객체는 한 번만 초기화되며 원본 엔티티를 상속받는다!**

<br>
- 기존의 테이블을 복사해다가 껍데기를 사용하는 경우

<br>
- `getReference()` : 프록시의 엔티티를 반환!

<br>
- 기존의 영속성 컨텍스트에 엔티티가 있다면 그것을 반환한다.

<br>
- 준영속 시, 프록시 조회 불가능하며 에러 발생한다.



---

<br><br>

# 7. 즉시로딩, 지연로딩

### 0) 개념 정리*

- Member 테이블을 조회할 때,  Member 테이블과 Team 테이블을 함께 조회해야 하는지?
	- 즉시 로딩(EAGER)의 경우에는 Member 테이블에 연관된 Team 테이블 개수마다 쿼리가 실행된다. 이것이 Jpql의 N+1 문제점이다.

<br>
- 만약 조인된 테이블이 10개라면, 필요없어도 조인된 테이블 10개를 모두 조회한다.
    - 그래서, 지연로딩(LAZY)을 이용하여 성능을 증가시킨다.

<br>
- `XToOne` 매핑은 기본이 '즉시 로딩'이라서 '지연 로딩'으로 추가 설정 해주기!
	- @ManyToOne, @OneToOne
	
<br>
- 결론 : 가급적 지연로딩 이용하기**\
	- 즉시 로딩은 상상하지 못한 쿼리가 나간다.

<br>	
- 중요** : JPQL fetch 조인이나, 엔티티 그래프 기능을 사용해라!**


---

<br><br>

### 1) 지연 로딩 

- Member와 Team 테이블에서 원하는 테이블만 따로 조회가 가능하다.

```java
@Entity 
public class Member {
 
	@Id
	@GeneratedValue
	private Long id;
	 
	@Column(name = "USERNAME")
	private String name;
	 
	@ManyToOne(fetch = FetchType.LAZY) //**
	@JoinColumn(name = "TEAM_ID")
	private Team team;
	..
}
```

---

<br><br>

### 2) 즉시 로딩 

- Member와 Team 테이블을 함께 조회!

```java
@Entity
public class Member {
 
	@Id
	@GeneratedValue
	private Long id;
	 
	@Column(name = "USERNAME")
	private String name;
	 
	@ManyToOne(fetch = FetchType.EAGER) //**
	@JoinColumn(name = "TEAM_ID")
	private Team team;
	..
}
```


---

<br><br>

# 8. CASCADE, 고아객체

### 1) CASCADE

#### a. CASCADE 개념

- 특정 엔티티를 영속 상태로 만들 때 연관된 엔티티도 함께 영속 상태로 만들도 싶을 때 사용한다. DB의 CASCADE 속성과도 같은 의미
	- 부모 엔티티를 저장할 때 자식 엔티티도 함께 저장.

<br>

```java
@OneToMany(mappedBy="parent", cascade=CascadeType.PERSIST)
```

<br>
#### b. CASCADE 주의점** 

- 영속성 전이는 연관관계를 매핑하는 것과 아무 관련이 없음 

- 엔티티를 영속화할 때 연관된 엔티티도 함께 영속화하는 편리함을 제공할 뿐


---

<br>

#### c. 종류 

- ALL: 모두 적용

- PERSIST: 영속

- REMOVE: 삭제

- MERGE: 병합

- REFRESH: REFRESH

- DETACH: DETACH


---

<br><br>

### 2) 고아 객체











