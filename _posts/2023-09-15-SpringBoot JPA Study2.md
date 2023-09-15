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

# 2. JPA 정책


<br>

### 1) `@generatedValue`

#### a. squence 정책 

- 값을 모아서 날리는데 미리 크기가 '50'정도의 값을 받아 올수도

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

# 3. JPA 연관관계


### 1) JPA 연관관계 핵심 개념**

- 연관관계의 주인은 FK를 가진 객체이다. **

<br>
- 이것은 JPA가 RDB처럼 테이블 관계가 아니라 객체 간의 관계라서 어쩔 수 없이 억지로 관계 맺음.

<br>
- 주인이 아닌 가짜 주인공에게는 그에 반하도록 @mappedBy를 걸어준다!**

<br>
- 주인공이 되는 이유는 자주 변경되고 수정되고 삭제되는 부분이라서 이다!
	- 보통, 1:N 관계에서 'N'이 주인공이고 '1'에 해당하는 것이 거울에 비추는 것처럼 @mappedBy(매핑이 되어지도록)되는 녀석이다.**

<br>
- 이런 컨셉을 가져가는 이유는 만약에  '1' 부분에 주인공을 걸어서 설계하면, '1' 부분이 변경되면 'N'쪽에서도 Insert나 Update 쿼리를 날리기 때문이다.

---

<br>

### 2) JPA 연관관계 설계법**

- 왠만하면 단방향 연관관계로 설계하기

<br>
- 필요하다면 추가로 양방향 관계로 사용

<br>
- 하지만, 실무에서는 보통 양방향을 많이 씀(JPQL때문에)**




