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

# 6. 프록시 개념**

### 1) 프록시를 사용하는 이유?

- Member를 조회할 때, Team을 항상 같이 조회해야 하는지?

<br> 
- Member와 Team을 동시에 조회하는 경우라면 상관 없다.

<br> 
- 하지만, 어떤 비즈니스 로직에서는 Member만 조회하길 원한다면, Team을 항상 같이 불러내어 조회할 필요는 없다. 낭비가 심하다.

<br> 
- 따라서, JPA에서는 이러한 문제를 `지연로딩`과 `프록시`라는 개념으로 해결할 수 있어서 매우 중요한 개념이다.** 

<br> 

```java
	Team team = new Team();
	team.setName("team1");
	entityManager.persist(team);
	
	Member member = new Member();
	member.setName("member1");
	member.setTeam(team);
	entityManager.persist(member);
	
	entityManager.flush();
	entityManager.clear();
	            
	Member findMember = entityManager.find(Member.class, member.getId());
```

---

<br><br>  
  
### 2) 프록시 기본 개념

- JPA에서는 `em.find()`뿐만 아니라 참조를 가져오는 `getReference()` 메서드가 있다.

<br>

#### a. `em.find()` vs `em.getReference()`**

- `em.find()` : 
	- DB를 통해서 실제 엔티티 객체 조회(일반적인 경우, 쿼리가 DB에 나간다.)

<br>
- `getReference()` : 
	- DB에 쿼리가 안 나가는데 객체가 조회가 되는 것이다.(특이한 경우, DB 조회를 미루는 가짜(프록시) 엔티티 객체 조회)
	- 실제 username을 호출하는 과정에서 JPA가 DB에 쿼리를 날린다. 그래서 findMember에 값을 넣고 출력한다. 값을 넣는 과정에서는 더욱 복잡한 과정이 있다.
	- `getReference()`로 만들어진 findMember를 Class 타입으로 호출해보면, Hibernate에서 만들어진 프록시 클래스(가짜 객체)로서 findMember가 호출된다.

<br>
- 프록시 객체 개념** : 
	- 기존의 테이블을 복사해다가 껍데기를 사용하는 경우이며 껍데기는 똑같은데 안에는 텅텅 빈 객체이다. 실제 클래스를 상속 받아서 만들어지므로 실제 클래스와 겉 모양이 같다.
	- 내부에는 target 이라는 것이 있는데 진짜 Reference를 가르킨다. 이러한 target은 초기에 null 값으로 초기화되어 아무 것도 없다.
	- 이러한 프록시 객체는 Hibernate가 내부적으로 프록시 라이브러리를 통해 만들어준다.
	

<br><br>
- 실제 엔티티 생성

```java
	Member findMember = entityManager.find(Memeber.class, member.getId()); // 실제 엔티티 생성
```

<br><br>
- 프록시 객체 생성** : 쿼리 안 나감**
	- 프록시 객체를 활용하면 실제로 활용되기 전까지 DB 조회를 미룰 수 있다. 따라서, getReference만 호출하여 프록시 객체를 생성하면, DB에 쿼리는 안 나간다.

```java
	Member findMember = entityManager.getReference(Member.class, member.getId()); // 프록시 객체 생성
```

<br><br>
- 프록시 객체 사용 : DB에 쿼리 나감 **
	- 프록시 객체를 활용하면 실제로 활용되기 전까지 DB 조회를 미룰 수 있다. 따라서, getReference만 호출하여 프록시 객체를 생성하면, DB에 쿼리는 안 나간다.
	- System.out.println에서 사용 시, DB에 쿼리가 나간다.

```java
	Member findMember = entityManager.getReference(Member.class, member.getId());
	System.out.println("Class : " + findMember.getClass());
	System.out.println("id : " + findMember.getId());
	System.out.println("name : " + findMember.getName());
```

---

<br><br>  
  
### 3) 프록시 특징*

- 프록시 객체는 실제 객체의 참조(target)를 보관한다.

<br>
- 중요** : 프록시 객체를 호출하여 프록시 객체가 가지고 있는 getName() 메서드를 호출한다고 가정한다면, getName() 메서드는 프록시 객체의 내부에 있는 target이 가리키는 실제 엔티티 객체의 target에 있는 getName() 메서드를 대신 호출해준다. 
	- 하지만, 처음에 프록시 객체에는 target이 없을 것이다. 왜냐하면, getName() 메서드의 결과값은 DB에 있는데 한 번도 조회한 적이 없기 때문이다.

---

<br><br>  
  
### 4) 프록시 객체의 초기화 과정**

- a. 프록시 객체 생성(`getReference()`) :
	- getReference() 메서드를 통해 Member의 프록시 객체를 가지고 온다.

<br> 
- b. getName() 요청 : 
	- Member의 getName() 메서드를 호출하게 되는데, 초기에는 getName()를 가지고 있는 프록시 객체는 target이 없다.** 

<br> 
- c. 초기화 요청** : 
	- JPA가 영속성 컨텍스트에 getName() 메서드를 요청한다.(초가화 요청) JPA가 진짜 Member 객체를 가지고 오라고 요청한다.**

<br> 
- d. DB 조회 및 실제 Entity 생성 : 
	- 그렇다면, 영속성 컨텍스트가 DB를 조회하여 실제 Entity 객체를 생성 후 반환한다. 

<br> 
- e. target.getName() 연결 : 
	- 그리고나서, 프록시 객체의 내부에 있는 `Member target`(실제 Member 변수)에 진짜 Entity 객체를 연결시켜 준다.**

<br> 
- 결론** : 
	- 프록시 객체의 getName() 메서드를 호출하면, 프록시 객체의 target은 앞에서 연결된 진짜 Entity 객체의 getName() 메서드인 `Member에 있는 getName()` 메서드가 반환이 된다. 
	- getName()을 이전에 호출했으면, 영속성 컨텍스트에 있기 때문에 더 이상 DB에서 호출할 필요는 없다.

<br> 

#### a) 프록시 객체의 초기화 정의** :

- JPA가 영속성 컨텍스트에 요청하여 영속성 컨텍스트가 DB에서 Entity를 가져와서 진짜 Entity 객체를 생성하는 과정!!



---

<br><br>  
  
### 5) 프록시 객체 특징 및 주의점**
 
- a. 프록시 객체는 한 번만 초기화되며 원본 엔티티를 상속받는다!**

<br><br>

- b. 프록시 객체가 실제 엔티티로 바뀌는 것이 아니라 실제 엔티티에 접근이 가능하다.**


<br>

- c-1. 객체 비교 1 : 기존의 영속성 컨텍스트에 엔티티가 있다면 그것을 반환한다.**
	- ex) 먼저 Member 객체의 인스턴스로 member1을 영속성 컨텍스트에 요청했으면, 추후에 getReference로 프록시 객체를 member1 인스턴스를 또 만들어도 이미 영속성 컨텍스트에 member1이 있어서 초기에 만든 실제 Entity의 member1 인스턴스와 getReference로 만들어진 member1 인스턴스의 객체 타입은 같다. 
	
	
```java
	Member m1 = em.find(Member.class, member1.getId());
	Member m2 = em.find(Member.class, member2.getId());
	System.out.println("m1 == m2 : " + (m1.getClass() == m2.getClass())); // true

```

<br>

```java
	Member m1 = em.find(Member.class, member1.getId());
	Member m2 = em.getReference(Member.class, member2.getId());
	System.out.println("m1 == m2 : " + (m1.getClass() == m2.getClass())); // false
```

<br>	

- c-2. 객체 비교 2 추가적인 개념** : 영속성 컨텍스트에 프록시가 이미 있는 경우, 무조건 해당 인스턴스에서는 프록시를 반환한다.(잘 안쓰이지만 알아두기!!)
	- 우리가 개발할 때, 프록시던 아니던 상관 없도록 개발해야 한다.

```java
	Member member = new Member();
	member.setName("member");
	em.persist(member);
	
	em.flush();
	em.clear();
	
	//영속성 컨텍스트에 찾는 엔티티가 있는 경우 엔티티를 반환한다.
	Member findMember = em.find(Member.class, member.getId());
	System.out.println(findMember.getClass()); //실제 엔티티 반환
	
	Member reference = em.getReference(Member.class, member.getId());
	System.out.println(reference.getClass()); //실제 엔티티 반환
	
	em.clear();
	
	//프록시가 이미 있는 경우 프록시를 반환한다.**
	Member reference2 = em.getReference(Member.class, member.getId());
	System.out.println(reference2.getClass()); //프록시 반환
	
	Member findMember2 = em.find(Member.class, member.getId());
	System.out.println(findMember2.getClass()); //프록시 반환
```

<br>	

- c-3. 객체 비교 3 (중요**) : 
	- JPA에서는 같은 인스턴스들의 '==' 비교에 대하여 같은 영속성 컨텍스트 안에서(같은 트랜잭션 레벨에서) 조회하면 항상 같다.
	- JPA에서 제공해주는 개념이다.(한 트랜잭션 내에서는 실제 객체던 프록시 객체던 '==' 비교 시, 객체 타입이 항상 같다.) 


<br><br>

- d. JPA의 비즈니스 로직에서는 객체 비교 시, 어떤 비즈니스 로직의 메서드에서 인자로서, 객체가 프록시 객체로 넘어올지, 실제 객체로 넘어올지 모르기 때문에 타입 비교를 `==`으로 하면 안되고 `instance of`로 해야 한다.**

```java
	private static void isSame(Member m1, Member m2) {
	  System.out.println("m1 : " + (m1 instanceof Member));
	  System.out.println("m2 : " + (m2 instanceof Member));
	}
```

<br><br>

- e. 준영속 시, 프록시 조회 불가능하며 에러 발생한다.**
	- `LazyInitialization Exception, No seesion` 에러가 발생한다. 실무에서 자주 접하는 에러!
	- 더이상 영속성 컨텍스트로서 관리를 안하므로 해당 에러가 발생한다.
	- 강제로 에러를 발생시키기 위해서는 em.detach(), em.close(), em.clear()시, 해당 에러 발생

<br><br>

- f. 강제 초기화 : JPA 표준은 강제 초기화가 없다. Hibernate에서 제공해주는 것이다.
	- 대신, 강제 호출은 있다** : `member.getName()` 

<br><br>	
	
- g. 프록시 초기화 여부 확인 : 
	- `EntityManagerFactor.getPersistenceUnitUtil().isLoaded()`를 이용한다.
	- ex) EntityManagerFactor.getPersistenceUnitUtil().isLoaded(findMember1);

<br>

- 최종 정리** : 즉시 로딩과 지연 로딩이 본 프록시 기능을 활용하여 구현된다.

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

- 특정 엔티티를 영속 상태로 만들 때 연관된 엔티티도 함께 영속 상태로 만들고 싶을 때, 사용한다. DB의 CASCADE 속성과도 같은 의미
	- 부모 엔티티를 저장할 때 자식 엔티티도 함께 저장.

<br>

```java
@OneToMany(mappedBy="parent", cascade=CascadeType.PERSIST)
```

<br>

#### b. CASCADE 주의점** 

- 영속성 전이는 연관관계를 매핑하는 것과 아무 관련이 없음 

<br>
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

#### a. 고아 객체 개념

- 부모 엔티티와 연관관계가 끊어진 자식 엔티티를 자동으로 삭제

<br>
- 참조하는 곳이 하나일 때 사용해야함

<br>
- 특정 엔티티가 개인 소유할 때 사용

<br>
- @OneToOne, @OneToMany만 가능
	- orphanRemoval = true

<br>
- 개념적으로 부모를 제거하면 자식은 고아가 된다. 따라서 고아 객체 제거 기능을 활성화 하면, 부모를 제거할 때 자식도 함께 제거된다. 이것은 CascadeType.REMOVE처럼 동작한다

---

<br><br>

#### b. 영속성 전이 + 고아 객체, 생명주기

- CascadeType.ALL + orphanRemoval=true

<br>
- 스스로 생명주기를 관리하는 엔티티는 em.persist()로 영속화, em.remove()로 제거

<br>
- 두 옵션을 모두 활성화 하면 부모 엔티티를 통해서 자식의 생명 주기를 관리할 수 있음

<br>
- 도메인 주도 설계(DDD)의 Aggregate Root개념을 구현할 때, 유용



---

<br><br>

# 9. 연관관계 관리

### 1) 글로벌 페치 전략 설정**

- 모든 연관관계를 지연 로딩으로!!

<br>
- @ManyToOne, @OneToOne은 기본이 즉시 로딩이므로 지연 로딩으로!!

---

<br>

### 2) 영속성 전이 설정**

- Order -> Delivery를 영속성 전이 ALL 설정
	- 주문을 생성할 때, 배송 정보도 같이 생성해서 라이프사이클을 맞추기 위해서 CascadeType.ALL로 설정
	- 즉, 주문을 저장할 때, 배송도 같이 저장된다.(영속성 전이)
	- 하지만, 설계상 Delivery의 라이프사이클을 따로 관리하고 싶으면, Order에서 따로 빼서 설계하는 것도 가능하다!**

<br>
- Order -> OrderItem을 영속성 전이 ALL 설정


---

<br><br>

# 10. 값 타입


### 1) 기본값 타입

- 생명주기를 엔티티에 의존

#### a. 엔티티 타입

- `@Entity`로 정의하는 객체 

<br>
- 데이터가 변해도 식별자로 지속해서 추적 가능
	- 회원 엔티티의 키나 나이 값을 변경해도 식별자로 인식 가능 

---

<br>

#### b. 값 타입

- int, Integer, String처럼 단순히 값으로 사용하는 자바 기본 타입이나 객체

<br>
- 식별자가 없고 값만 있으므로 변경시 추적 불가

<br>
- 값 타입은 공유하면 안 된다.(불가능)**
	- 회원 이름 변경시 다른 회원의 이름도 함께 변경되면 안됨

<br>

#### c. 자바의 기본 타입은 절대 공유 X

- 우리가 아는 기본 자바 개념

<br>
- 기본 타입은 항상 값을 복사한다. 따라서, int, double 같은 기본 타입(primitive type)은 절대 공유 X

<br>
- Integer같은 래퍼 클래스나 String 같은 특수한 클래스는 공유가능한 객체이지만 변경X

---

<br><br>

### 2. 임베디드 타입**

- 새로운 값 타입을 직접 정의할 수 있음

<br>
- 기본 값 타입을 모아서 만들어서 `복합 값 타입`이라고도 부르고 JPA는 `임베디드 타입(embedded type)`이라고 부른다.
	- int, String과 같은 값 타입

---

<br>

#### a. 임베디드 타입 예시 

- 원래, 회원 엔티티는 이름, 근무 시작일, 근무 종료일, 주소 도시, 주소 번지, 주소 우편번호를 가진다.

<br>
- 임베디드 타입을 이용해서 회원 엔티티를 변경하여 이름, 근무 기간, 집 주소를 가지도록 하자!

<br>
- 즉, `Period`라는 테이블(workPeriod)과 `Address`라는 테이블(homeAddress)을 추가로 생성한다.**
	- Period 테이블에는 근무 시작일(startDate), 근무 종료일(endDate)을 속성으로 넣는다.
	- Address 테이블에는  주소 도시(city), 주소 번지(street), 주소 우편번호(zipcode)를 속성으로 넣어 복합 값 타입으로 만든다.


---

<br>

#### b. 임베디드 타입 사용법**

- 기본 생성자 필수

<br>
- `@Embeddable` : 값 타입을 정의하는 곳에 표시

- `@Embedded` : 값 타입을 사용하는 곳에 표시

---

<br>

#### c. 임베디드 타입의 장점

- 재사용이 가능하다.

<br>
- 높은 응집도를 가진다.

<br>
- `Period.isWork()`처럼 해당 값 타입만 사용하는 의미 있는 메소드를 만들 수 있음

<br>
- 임베디드 타입을 포함한 모든 값 타입은, 값 타입을 소유한 엔티티에 생명주기를 의존함


<br>

---

#### d. 임베디드 타입과 테이블 매핑

- 임베디드 타입은 엔티티의 값일 뿐이다.

<br>
- 따라서, 임베디드 타입을 사용하기 전과 후에 매핑하는 테이블은 같다.

<br>
- 객체와 테이블을 아주 세밀하게(find-grained) 매핑하는 것이 가능!!


<br>

---


#### e. @AttributeOverride: 속성 재정의

- 한 엔티티에서 같은 값 타입을 사용하면, 컬럼 명이 중복된다.

<br>
- 따라서, 이럴 경우에는 `@AttributeOverrides`, `@AttributeOverride`를 사용해서 컬러 명 속성을 재정의


<br>

---

#### f. 임베디드 타입과 null

- 임베디드 타입의 값이 null이면 매핑한 컬럼 값은 모두 null

---

<br><br>

### 3. 값 타입과 불변 객체

#### a. 	값 타입

- 값 타입은 복잡한 객체 세상을 조금이라도 단순화하려고 만든 개념이다. 따라서 값 타입은 단순하고 안전하게 다룰 수 있어야 한다.

---

<br>

##### a) 값 타입 공유 참조**

- 임베디드 타입 같은 값 타입을 여러 엔티티에서 공유하면 위험함

<br>
- 예를 들어, 같은 주소를 같이 사용하는 회원1, 회원2가 있는데 주소를 변경하면, 해당 회원들의 주소들이 같이 변경되기 때문에 심각한 문제가 발생한다.

---

<br>

##### b) 값 타입 복사**

- 값 타입의 실제 인스턴스인 값을 공유하는 것은 위험

<br>
- 대신 값(인스턴스)를 복사해서 사용!!

---

<br><br>

#### b. 불변 객체**

- 항상 값을 복사해서 사용하면 공유 참조로 인해 발생하는 부작용을 피할 수 있다. 하지만, 객체 타입은 참조 값을 직접 대입하는 것을 막을 방법이 없다. 즉, 객체의 공유 참조는 피할 수 없다.

<br>
- 그래서, 등장한 것이 `불변 객체`이다. 

---

<br>

##### a) 불변 객체 개념 및 생성 방법**

- 객체 타입을 수정할 수 없게 만들면 부작용을 원천 차단!!
	- 값 타입은 불변 객체(immutable object)로 설계해야 한다.

<br>
- 불변 객체: 생성 시점 이후 절대 값을 변경할 수 없는 객체
	- 생성자로만 값을 설정하고 수정자(Setter)를 만들지 않으면 된다**

<br> 
- 예를 들어, Integer, String은 자바가 제공하는 대표적인 불변 객체!!



---

<br><br>

### 4. 값 타입의 비교

- 값 타입: 인스턴스가 달라도 그 안에 값이 같으면 같은 것으로 봐야 한다.

<br>
- 동일성(identity) 비교
	- 인스턴스의 참조 값을 비교, `==` 사용
	
<br>
- 동등성(equivalence) 비교
	- 인스턴스의 값을 비교, `equals()`사용



---

<br><br>

### 5. 값 타입 컬렉션**

- 값 타입을 하나 이상 저장할 때, 사용하고 컬렉션 데이터를 저장할 때, 사용한다. 매우 편리!

<br>
- `@ElementCollection`, `@CollectionTable` 사용

<br>
- 데이터베이스는 컬렉션을 같은 테이블에 저장할 수 없다.
	- 원래의 DB의 경우에는 컬렉션을 저장하기 위한 별도의 테이블이 필요함


---

<br>

##### a) 값 타입 컬렉션 사용 전략

<br>
- 값 타입 컬렉션도 지연 로딩 전략 사용**

<br>
- 값 타입 컬렉션은 영속성 전에(Cascade) + 고아 객체 제거 기능을 필수로 가진다고 볼 수 있다

---

<br>

##### b) 값 타입 컬렉션의 제약사항**

- 값 타입은 엔티티와 다르게 식별자 개념이 없다.**

<br>
- 값 타입 컬렉션에 변경 사항이 발생하면, 주인 엔티티와 연관된 모든 데이터를 삭제하고, 값 타입 컬렉션에 있는 현재 값을 모두 다시 저장한다.**

<br>
- 값 타입 컬렉션을 매핑하는 테이블은 모든 컬럼을 묶어서 기본키를 구성해야 함: null 입력X, 중복 저장 X**


---

<br><br>

### 6. 값 타입 컬렉션 주의 사항!**

- 값 타입은 정말 값 타입이라 판단될 때만 사용

- 엔티티와 값 타입을 혼동해서 엔티티를 값 타입으로 만들면 안됨

- 식별자가 필요하고, 지속해서 값을 추적, 변경해야 한다면 그것은 값 타입이 아닌 엔티티



---

<br><br>

### 7. 실전 예제 : 값 타입 매핑


#### a. 실습 코드

```java
```


---

<br><br>

# 11. 객체지향 쿼리 언어

### 1) 페치 조인(fetch join)


#### a. fetch join 개념

- SQL 조인 종류X

<br>
- JPQL에서 성능 최적화를 위해 제공하는 기능

<br>
- 연관된 엔티티나 컬렉션을 SQL 한 번에 함께 조회하는 기능

<br>
- join fetch 명령어 사용

<br>
- 페치 조인 :
	- `:= [ LEFT [OUTER] | INNER ] JOIN FETCH 조인경로`

---

<br><br>

#### b. fetch join 사용 과정 

- 회원을 조회하면서 연관된 팀도 함께 조회(SQL 한 번에)

<br>
- SQL을 보면 회원 뿐만 아니라 팀(T.*)도 함께 SELECT

<br>
- [JPQL]
	- select m from Member m join fetch m.team

<br>
- [SQL]
	- `SELECT M.*, T.* FROM MEMBER M`
	- `INNER JOIN TEAM T ON M.TEAM_ID=T.ID`


---

<br><br>

### 2) 페치 조인 사용 예시

#### a. 페치 조인 사용 예시


```java

String jpql = "select m from Member m join fetch m.team";
List<Member> members = em.createQuery(jpql, Member.class)
			.getResultList();

for (Member member : members) {

	//페치 조인으로 회원과 팀을 함께 조회해서 지연 로딩X
	System.out.println("username = " + member.getUsername() + ", " +
	"teamName = " + member.getTeam().name());
}

```

---


<br><br>

#### b. 컬렉션 페치 조인 사용 코드


```java

String jpql = "select t from Team t join fetch t.members where t.name = '팀A'"
List<Team> teams = em.createQuery(jpql, Team.class).getResultList();

for(Team team : teams) {
	System.out.println("teamname = " + team.getName() + ", team = " + team);

	for (Member member : team.getMembers()) {
	
		//페치 조인으로 팀과 회원을 함께 조회해서 지연 로딩 발생 안함
		System.out.println(“-> username = " + member.getUsername()+ ", member = " + member);
	}
}
```

---

<br><br>

### 3) 페치 조인 사용하는 이유**

- 실무에서 '지연로딩'을 전체적으로 주로 사용하는데 다른 테이블을 함께 조회하고 싶을 때, fetch join을 사용하여 일부분만 함께 테이블을 조회할 수 있도록 하자! 



---

<br><br>

### 4) 다형성 쿼리, 엔티티 직접 사용



---

<br><br>

### 5) Named 쿼리, 벌크 연산


