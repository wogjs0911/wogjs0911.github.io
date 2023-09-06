---
key: /2023/08/27/SpringBoot-JPA-queryDSL.html
title: SpringBoot - queryDSL 공부
tags: springboot JPA queryDSL
---

# 1. Spring Boot 개발 환경 

<br>
- 1) spring.io : Spring Web, jpa, h2, lombok, devtools를 설정하여 프로젝트 설정하기
	- queryDSL은 라이브러리가 아니라 추가로 설정해주어야 한다.
	- springboot 3.0 이상은 jdk 17, h2 2.1.214 버전 이상
	- javax 패키지는 jakarta로 변경


<br>
- 2) SpringBoot JPA는 EntityManager에 종속적이라서 싱글톤 패턴으로 멀티스레드 환경에서 문제가 될 것 같지만 SpringBoot에서 EntityManager를 사용하게 되면, 멀티스레드 환경에서도 문제가 없다.
	- 그 이유는 SpringBoot에서는 EntityManager가 프록시에서 만들어지는데, 실제 EntityManager가 주입되는 것이 아니라 가짜 EntityManager가 주입되기 때문에 
	- EntityManager를 호출하면, 현재 데이터베이스 트랜잭션과 관련된 실제 EntityManager를 호출하게 되어 싱글톤이라서 동시성 문제가 되는 문제가 사라지게 된다.
	- 기본적으로 Spring도 싱글톤 패턴

	
<br>
- 3) JPA는 엔티티 객체를 생성할 때, 기본 생성자를 이용해서 만들고 있다. 그리고 엔티티 객체를 외부에서 만들고 있기 때문에, private 접근제어자는 사용할 수 없다. 또한 default 접근 제어자는 해당 클래스와 같은 패키지에서만 사용할 수 있기 때문에 일반적으로 protected 생성자를 사용하는 것을 권장하고 있는 것이다.

<br>
- 4) @Autowired가 스프링 빈을 주입한다면, @PersistenceContext는 JPA 스펙에서 제공하는 기능인데, 영속성 컨텍스트를 주입하는 표준 애노테이션이다. 
	- LocalContainerEntityManagerFactoryBean 살펴보기


<br>
- 5) 중요** : 
	- H2를 이용하여 테스트 진행 시, `Error creating bean with name 'entityManagerFactory' defined in class path resource` 에러가 발생하면, H2 SQL 편집기에서 `drop all objects;` 명령어를 실행하기! 
		- h2 데이터베이스에서 `drop all objects` 명령어를 입력하면 저장되어있던 테이블이 싹 다 날라가게 된다.
		- h2 데이터베이스도 Intellij Build 와 동일하게 증분 빌드를 하는 과정에서 삭제 된 데이터(테이블)에 대해서는 관리를 하지 않는 것처럼 보였다.
		- 이러한 이슈는 일대다 읽기 전용 테이블이 생성되었다가 해당 연관관계를 삭제하더라도 테이블이 계속해서 h2 데이터베이스에 남아있을 때에도 동일하게 적용되었다.

---

<br><br>

# 2. queryDSL 개발 환경 테스트

- buiild.gradle 설정
	- SpringBoot 3.0 버전 이상에서 Querydsl 사용하는 방법 : Querydsl 추가 설정 부분 주의!

```gradle
plugins {
	id 'java'
	id 'org.springframework.boot' version '3.1.2'
	id 'io.spring.dependency-management' version '1.1.2'
}

group = 'com.study'
version = '0.0.1-SNAPSHOT'

java {
	sourceCompatibility = '17'
}

configurations {
	compileOnly {
		extendsFrom annotationProcessor
	}
}

repositories {
	mavenCentral()
}

dependencies {
	implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
	implementation 'org.springframework.boot:spring-boot-starter-web'
	testImplementation 'junit:junit:4.13.1'
	compileOnly 'org.projectlombok:lombok'
	developmentOnly 'org.springframework.boot:spring-boot-devtools'
	runtimeOnly 'com.h2database:h2'
	annotationProcessor 'org.projectlombok:lombok'
	testImplementation 'org.springframework.boot:spring-boot-starter-test'

	// Querydsl 추가
	implementation 'com.querydsl:querydsl-jpa:5.0.0:jakarta'
	annotationProcessor "com.querydsl:querydsl-apt:5.0.0:jakarta"
	annotationProcessor "jakarta.annotation:jakarta.annotation-api"
	annotationProcessor "jakarta.persistence:jakarta.persistence-api"

	implementation "com.github.gavlyukovskiy:p6spy-spring-boot-starter:1.9.0"


	// JUnit4 추가
	testImplementation("org.junit.vintage:junit-vintage-engine") {
		exclude group: "org.hamcrest", module: "hamcrest-core"
	}
}

tasks.named('test') {
	useJUnitPlatform()
}

```


---

<br>

- QuerydslApplicationTests.java
	- queryDSL 개발 환경 테스트 코드 

```java
package com.study.querydsl;

import com.querydsl.jpa.impl.JPAQueryFactory;
import com.study.querydsl.entity.Hello;
import com.study.querydsl.entity.QHello;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Commit;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
@Commit
class QuerydslApplicationTests {

	@Autowired
	EntityManager em;

	@Test
	void contextLoads() {
		Hello hello = new Hello();
		em.persist(hello);

		JPAQueryFactory query = new JPAQueryFactory(em);
		//QHello qHello = new QHello("h"); // 이것보단 아래 코드가 더 편리하다.
		QHello qHello = QHello.hello;

		Hello result = query
				.selectFrom(qHello)
				.fetchOne();

		Assertions.assertEquals(result, hello);
		Assertions.assertEquals(result.getId(), hello.getId());
	}

}

```

<br>
- 이렇게 테스트도 가능하다. 
	- JUnit4 : 어노테이션 확인

```java
package com.study.querydsl;

import com.querydsl.jpa.impl.JPAQueryFactory;
import com.study.querydsl.entity.Hello;
import com.study.querydsl.entity.QHello;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Commit;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

@RunWith(SpringRunner.class)
@SpringBootTest
class QuerydslApplicationTests {

	@Autowired
	EntityManager em;

	@Test
	@Transactional
	@Commit
	void contextLoads() {
		Hello hello = new Hello();
		em.persist(hello);

		JPAQueryFactory query = new JPAQueryFactory(em);
		//QHello qHello = new QHello("h");
		QHello qHello = QHello.hello;

		Hello result = query
				.selectFrom(qHello)
				.fetchOne();

		Assertions.assertEquals(result, hello);
		Assertions.assertEquals(result.getId(), hello.getId());
	}

}

```



---

<br>

- Hello.java

```java
package com.study.querydsl.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Hello {

    @Id @GeneratedValue
    private Long id;
}

```


---

<br>

- QHello.java
	- gradle 탭에서 `Tasks/other/compileJava`을 클릭하면, Hello에서 QHello를 생성하여 queryDSL이 제대로 동작하는지 확인할 수 있다.

```java
package com.study.querydsl.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;


/**
 * QHello is a Querydsl query type for Hello
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QHello extends EntityPathBase<Hello> {

    private static final long serialVersionUID = -1353511186L;

    public static final QHello hello = new QHello("hello");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public QHello(String variable) {
        super(Hello.class, forVariable(variable));
    }

    public QHello(Path<? extends Hello> path) {
        super(path.getType(), path.getMetadata());
    }

    public QHello(PathMetadata metadata) {
        super(Hello.class, metadata);
    }

}


```

---

<br>

- application.yml
	- 중요** : H2를 이용하여 테스트 진행 시, `Error creating bean with name 'entityManagerFactory' defined in class path resource` 에러가 발생하면, H2 SQL 편집기에서 `drop all objects;` 명령어를 실행하기! 
		- h2 데이터베이스에서 `drop all objects` 명령어를 입력하면 저장되어있던 테이블이 싹 다 날라가게 된다.
			- h2 데이터베이스도 Intellij Build 와 동일하게 증분 빌드를 하는 과정에서 삭제 된 데이터(테이블)에 대해서는 관리를 하지 않는 것처럼 보였습니다.
			- 이러한 이슈는 일대다 읽기 전용 테이블이 생성되었다가 해당 연관관계를 삭제하더라도 테이블이 계속해서 h2 데이터베이스에 남아있을 때에도 동일하게 적용되었습니다!

```yml
spring:
  datasource:
    url: jdbc:h2:tcp://localhost/~/querydsl
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

 
<br>
- 마지막 방법으로 H2가 제대로 동작 안 하면, 일단, 인메모리 설정으로 테스트하기!

```yml
spring:
##  datasource:
##    url: jdbc:h2:tcp://localhost/~/jpashop
##    username: sa
##    password:
##    driver-class-name: org.h2.Driver
# 에러가 너무 많아서 인메모리로 사용하자!
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

---

<br><br>

# 3. JPA 도메인 모델 테스트


### 1) 설계 방식 

- 이번에는 `queryDSL` 테스트가 아니라 `JPA Native query`로 도메인 모델 테스트 진행하고 이를 기반으로 추후 queryDSL를 이용할 예정

- `@NoArgsConstructor(access = AccessLevel.PROTECTED)` : 기본 생성자 막고 싶은데, JPA 스팩상 PROTECTED로 열어두어야 함.
	- 중요 : JPA는 엔티티 객체를 생성할 때, 기본 생성자를 이용해서 만들고 있다. 그리고 엔티티 객체를 외부에서 만들고 있기 때문에, private 접근제어자는 사용할 수 없다. 또한 default 접근 제어자는 해당 클래스와 같은 패키지에서만 사용할 수 있기 때문에 일반적으로 protected 생성자를 사용하는 것을 권장하고 있는 것이다.

<br>
- `@ToString(of = {"id", "username", "age"})` : 가급적 내부 필드만(연관관계 없는 필드만) ToString에 이용하기.

<br>
- changeTeam() : 양방향 연관관계 한번에 처리(연관관계 편의 메소드)

---

<br><br>

### 2) 테스트 코드  

- Member.java

```java
package com.study.querydsl.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)  // 기본 생성자 막고 싶은데, JPA 스팩상 PROTECTED로 열어두어야 함
@ToString(of = {"id", "username", "age"})   // 가급적 내부 필드만(연관관계 없는 필드만)
public class Member {

    @Id
    @GeneratedValue
    @Column(name = "member_id")
    private Long id;
    private String username;
    private int age;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private Team team;



    public Member(String username){
        this(username, 0);
    }

    public Member(String username, int age){
        this(username, age, null);
    }

    public Member(String username, int age, Team team){
        this.username = username;
        this.age = age;
        if(team != null){
            changeTeam(team);
        }
    }

    // changeTeam() : 양방향 연관관계 한번에 처리(연관관계 편의 메소드)
    public void changeTeam(Team team) {
        this.team = team;
        team.getMembers().add(this);
    }
}

```



---

<br><br>

- Team.java


```java
package com.study.querydsl.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter @Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString(of = {"id", "name"})
public class Team {

    @Id @GeneratedValue
    @Column(name = "team_id")
    private Long id;
    private String name;

    @OneToMany(mappedBy = "team")
    private List<Member> members = new ArrayList<>();

    public Team(String name){
        this.name = name;
    }


}

```


---

<br><br>

- MemberTest.java
	- 이번에는 `queryDSL` 테스트가 아니라 `JPA Native query`로 도메인 모델 테스트 진행하고 이를 기반으로 추후 queryDSL를 이용할 예정



```java
package com.study.querydsl.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Commit;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RunWith(SpringRunner.class)
@SpringBootTest
@Transactional
@Commit
public class MemberTest {

    @PersistenceContext
    EntityManager em;

    @Test
    public void testEntity(){
        Team teamA = new Team("teamA");
        Team teamB = new Team("teamB");

        em.persist(teamA);
        em.persist(teamB);

        Member member1 = new Member("member1", 10, teamA);
        Member member2 = new Member("member2", 20, teamA);
        Member member3 = new Member("member3", 30, teamB);
        Member member4 = new Member("member4", 40, teamB);

        em.persist(member1);
        em.persist(member2);
        em.persist(member3);
        em.persist(member4);

        // 초기화
        em.flush();
        em.clear();

        // 확인
        List<Member> members = em.createQuery("select m from Member m", Member.class)
                .getResultList();

        for(Member member : members){
            System.out.println("member = " + member);
            System.out.println("-> member.team = " + member.getTeam());
        }

    }
}

```

<br>
- 테스트 결과 :

```java
member = Member(id=1, username=member1, age=10)
-> member.team = Team(id=1, name=teamA)
member = Member(id=2, username=member2, age=20)
-> member.team = Team(id=1, name=teamA)
member = Member(id=3, username=member3, age=30)
-> member.team = Team(id=2, name=teamB)
member = Member(id=4, username=member4, age=40)
-> member.team = Team(id=2, name=teamB)
```

---

<br><br>

# 4. queryDSL 기본 문법 정리


### 1) JPQL vs Querydsl**

- 중요** : JPQL는 문자(실행(런타임) 시점에서 오류 발견)에서 오류, Querydsl는 코드(컴파일 시점에서 오류 발견)에서 오류
	- 또한, JPQL은 파라미터 바인딩을 직접하고 Querydsl은 파라미터 바인딩을 자동 처리해준다.

- `QMember m = new QMember("m");` : 이렇게하면, 별칭 가능
	- 원래는 `QMember member = QMember.member;`로 이용했었다.

- Querydsl은 기본적으로 JPQL 빌더 개념이다. 그래서 코드가 직관적이다.

---

<br><br>

#### a. 실습 코드 : 


<br>
- `No result found for query` 에러와 `findMember is null` 에러 해결 방법** :
	- @Before(JUnit 4)나 @BeforeEach(JUnit 5)를 이용 시, JUnit 테스트 버전 주의!
	- @Before(JUnit 4)나 @BeforeEach(JUnit 5)는 테스트 전에 실행해야하는 것을 미리 실행시켜준다. 

<br>
- 나는 아래 테스트 코드를 하나씩 실행해야 되더라!

<br>

```java
package com.study.querydsl;

import com.querydsl.jpa.impl.JPAQueryFactory;
import com.study.querydsl.entity.Member;
import com.study.querydsl.entity.QMember;
import com.study.querydsl.entity.Team;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.Before;
import org.junit.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Commit;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertEquals;


@RunWith(SpringRunner.class)
@SpringBootTest
@Transactional
@Commit
public class QuerydslBasicTest {

    @PersistenceContext
    EntityManager em;

    // JUnit5에서는 @BeforeEach를 이용
    @Before	// JUnit4에서 이렇게 이용함
    public void before(){
        Team teamA = new Team("teamA");
        Team teamB = new Team("teamB");

        em.persist(teamA);
        em.persist(teamB);

        Member member1 = new Member("member1", 10, teamA);
        Member member2 = new Member("member2", 20, teamA);
        Member member3 = new Member("member3", 30, teamB);
        Member member4 = new Member("member4", 40, teamB);

        em.persist(member1);
        em.persist(member2);
        em.persist(member3);
        em.persist(member4);
    }

    @Test
    public void startJPQL(){
        // member1를 찾아라.
        String qlString =
                "select m from Member m where m.username = :username";

        Member findMember = em.createQuery(qlString, Member.class)
                .setParameter("username","member1")
                .getSingleResult();

        assertEquals(findMember.getUsername(), "member1");  // JUnit4
//         assertThat(findMember.getUsername()).isEqualTo("member1"); // JUnit5
    }


    // JPQL: 문자(실행 시점 오류), Querydsl: 코드(컴파일 시점 오류)
    @Test
    public void startQuerydsl(){
        // member1을 찾아라
        JPAQueryFactory queryFactory = new JPAQueryFactory(em);
        QMember m = new QMember("m");   // 이렇게하면, 별칭 가능

        Member findMember = queryFactory
                .select(m)
                .from(m)
                .where(m.username.eq("member1")) // 파라미터 바인딩 처리
                .fetchOne();

        assertEquals(findMember.getUsername(), "member1");  // JUnit4
//        assertThat(findMember.getUsername()).isEqualTo("member1");  // JUnit5
    }	

}

```

---

<br><br>

#### b. JPAQueryFactory를 필드로 : 

- JPAQueryFactory를 필드로 제공하면 동시성 문제는 어떻게 될까? 동시성 문제는 JPAQueryFactory를
생성할 때 제공하는 EntityManager(em)에 달려있다. 스프링 프레임워크는 여러 쓰레드에서 동시에 같은
EntityManager에 접근해도, 트랜잭션 마다 별도의 영속성 컨텍스트를 제공하기 때문에, 동시성 문제는 걱
정하지 않아도 된다.

<br>

##### a) 변경된 테스트 코드 : 

- 필드에서 작성하고 @Before에서 생성해서 사용한다. 

```java
package com.study.querydsl;

import com.querydsl.jpa.impl.JPAQueryFactory;
import com.study.querydsl.entity.Member;
import com.study.querydsl.entity.QMember;
import com.study.querydsl.entity.Team;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.Before;
import org.junit.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Commit;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertEquals;


@RunWith(SpringRunner.class)
@SpringBootTest
@Transactional
@Commit
public class QuerydslBasicTest {

    @PersistenceContext
    EntityManager em;

    JPAQueryFactory queryFactory;

    // @BeforeEach // JUnit5
    @Before // JUnit4
    public void before(){
        queryFactory = new JPAQueryFactory(em);

        Team teamA = new Team("teamA");
        Team teamB = new Team("teamB");

        em.persist(teamA);
        em.persist(teamB);

        Member member1 = new Member("member1", 10, teamA);
        Member member2 = new Member("member2", 20, teamA);
        Member member3 = new Member("member3", 30, teamB);
        Member member4 = new Member("member4", 40, teamB);

        em.persist(member1);
        em.persist(member2);
        em.persist(member3);
        em.persist(member4);
    }


    @Test
    public void startQuerydsl2(){
        // member1을 찾아라

        QMember m = new QMember("m");   // 이렇게하면, 별칭 가능

        Member findMember = queryFactory
                .select(m)
                .from(m)
                .where(m.username.eq("member1")) // 파라미터 바인딩 처리
                .fetchOne();

        assertEquals(findMember.getUsername(), "member1"); // JUnit4
//        assertThat(findMember.getUsername()).isEqualTo("member1"); // JUnit5
    }

}


```


---

<br><br>

### 2) 기본 Q-Type 활용


#### a. 실습 코드 

```java
QMember qMember = new QMember("m");  // 별칭 이용 가능
QMember qMember = QMember.member;  // 기본 인스턴스로 편하게 이용 가능 
```

---

<br><br>

### 3) 기본 인스턴스를 static import와 함께 사용 가능

- 훨씬 더 사용이 간단해진다.
	- 같은 테이블을 조인해야 하는 경우가 아니면 기본 인스턴스를 사용하자

```java
import static com.study.querydsl.entity.QMember.*;

@Test
public void startQuerydsl3() {
	// member1을 찾아라.
	Member findMember = queryFactory
		.select(member)
		.from(member)
		.where(member.username.eq("member1"))
		.fetchOne();
		
	assertThat(findMember.getUsername()).isEqualTo("member1");
}
```

<br>

#### a. 실행되는 JPQL을 볼 수 있는 방법

- application.yml에 다음 설정을 추가하면, 쿼리 실행 시, 실행되는 JPQL을 볼 수 있다.

```yml
spring.jpa.properties.hibernate.use_sql_comments: true
```


---

<br><br>

### 4) 검색 조건 쿼리

- 기본 검색 쿼리는 .and(), .or() 쿼리로 진행하기

- select(), from()은 selectFrom()으로 하나로 합칠 수 도 있다.



```java
import static com.study.querydsl.entity.QMember.*;

@Test
public void startQuerydsl3() {
	// member1을 찾아라.
	Member findMember = queryFactory
		.select(member)
		.from(member)
		.where(member.username.eq("member1"))
			.and(member.age.eq(10))
		.fetchOne();
		
	assertThat(findMember.getUsername()).isEqualTo("member1");
}
```

<br>

#### a. JPQL이 제공하는 모든 검색 조건 제공

- `eq()`, `ne()` : '=', '!='로 해석

<br>
- `isNotNull()` : isNotNull을 의미한다.

<br>
- `in()`, `notIn()`, `between()` : 값이 포함되는지 범위로 표현

<br>
- `goe()`, `gt()`, `loe()`, `lt()` : 부등호 범위 표시 가능

<br>
- `like()`, `contains()`, `startswith() : like 조회


<br>

#### b. AND 조건을 파라미터로 처리 가능**

- 이 경우에 null값을 무시해서, 메서드 추출 시, 동적 쿼리를 간편히 만들 수 있다.  

```java
import static com.study.querydsl.entity.QMember.*;

@Test
public void startQuerydsl3() {
	// member1을 찾아라.
	Member findMember = queryFactory
		.select(member)
		.from(member)
		.where(member.username.eq("member1")),
			member.age.eq(10))
		.fetch();
		
	assertThat(findMember.size()).isEqualTo(1);
}
```


---

<br><br>

### 5) querydsl 결과 조회 방식

- `fetch()` : 리스트 조회**

<br>
- `fetchOne()` : 단건 조회** 

<br>
- `fetchFirst()` : limit(1).fetchOne()

<br>
- `fetchResults()` : 페이징 정보 포함, total count 쿼리 추가 실행

<br>
- `fetchCount()` : count 쿼리로 변경하여 count 수 조회**
 





---

<br><br>

### 6) querydsl 정렬 방식 

- desc(), asc()를 이용하기

- 회원 이름이 없으면, 마지막에 출력(nullsLast()) vs nullsFirst()

```java
import static com.study.querydsl.entity.QMember.*;

@Test
public void startQuerydsl3() {
	// member1을 찾아라.
	Member findMember = queryFactory
		.select(member)
		.from(member)
		.where(member.age.eq(100))
			.orderBy(member.age.desc(), member.username.asc().nullsLast())
		.fetch();
		
	assertThat(findMember.size()).isEqualTo(1);
}
```




---

<br><br>

### 7) 페이징

- MySQL처럼 offset과 limit을 이용하기



```java
import static com.study.querydsl.entity.QMember.*;

@Test
public void paging1() {
	List<Member> result = queryFactory
		.selectFrom(member)
		.orderBy(member.username.desc())
		.offset(1) // 0부터 시작(zero index)
		.limit(2) // 최대 2건 조회
		.fetch();
}
```


<>

#### a. 전체 조회 수를 페이징** 

- fetchResults 이용하기
- count 쿼리에 조인이 필요없는 성능 최적화가 필요하다면, count 전용 쿼리를 별도로 작성해야 한다.

```java
import static com.study.querydsl.entity.QMember.*;

@Test
public void paging2() {
	QueryResults<Member> queryResults = queryFactory
		.selectFrom(member)
		.orderBy(member.username.desc())
		.offset(1)
		.limit(2)
		.fetchResults();

	assertThat(queryResults.getTotal()).isEqualTo(4);
	assertThat(queryResults.getLimit()).isEqualTo(2);
	assertThat(queryResults.getOffset()).isEqualTo(1);
	assertThat(queryResults.getResults().size()).isEqualTo(2);
}
```
 



---

<br><br>

### 8) 집합 함수


#### a. COUNT, SUM, AVG, MAX, MIN 이용

- 결과 집합은 Tuple에서 값을 꺼낸다. 


```java
import static com.study.querydsl.entity.QMember.*;

@Test
public void aggregation() throws Exception {
	List<Tuple> result = queryFactory
		.select(member.count(),
			member.age.sum(),
			member.age.avg(),
			member.age.max(),
			member.age.min()) 
		.from(member)
		.fetch();

	Tuple tuple = result.get(0);
	assertThat(tuple.get(member.count())).isEqualTo(4);
	assertThat(tuple.get(member.age.sum())).isEqualTo(100);
	assertThat(tuple.get(member.age.avg())).isEqualTo(25);
	assertThat(tuple.get(member.age.max())).isEqualTo(40);
	assertThat(tuple.get(member.age.min())).isEqualTo(10);
}
```

<br><br>
#### b. GroupBy 사용

- having : 그룹화된 결과를 제한하기

```java
.groupBy(item.price)
.having(item.price.gt(1000))
```



---

<br><br>

### 9) 기본 조인 

- 사용 방법 : 
	- `join(조인 대상, 별칭으로 사용할 Q타입)`
	
<br>	
- join(), innerjoin(), leftjoin(), rightjoin()

<br>	

```java

	QMember member = QMember.member; 
	QTeam team = QTeam.team;
	
	List<Member> result = queryFactory
		.selectFrom(member)
		.join(member.team, team)
		.where(team.name.eq("teamA"))
		.fetch();
```



---

<br><br>

### 10) 세타 조인

- 연관관계가 없는 필드로 조인
	- 예시) 회원의 이름이 팀 이름과 같은 회원 조회을 조회할 수 있다.

<br>
- from 절에 여러 엔티티를 선택해서 세타 조인을 할 수 있다. 

<br>
- 세타 조인은 외부 조인 불가능하지만, 조인 on을 사용하면 외부 조인 가능하다. 

```java
import static com.study.querydsl.entity.QMember.*;

	em.persist(new Member("teamA"));
	em.persist(new Member("teamB"));
	 
	List<Member> result = queryFactory
		.select(member)
		.from(member, team)
		.where(member.username.eq(team.name))
		.fetch();
```



---

<br><br>

### 11) 조인 - on절

#### a. 조인 대상 필터링

<br>
- 연관관계 없는 엔티티 외부 조인

<br>
- on절을 기존의 SQL과 달리 조인 대상 필터링만 하면 되기 때문에 훨씬 더 간단해졌다.
	- inner join을 사용하면, where 절에서 필터링 하는 것과 기능이 동일하다. 따라서, on 절을 활용한 조인 대상 필터링을 사용할 때, inner join이면 익숙한 where 절로 해결하고, 정말 외부조인이 필요한 경우에만 이 기능을 사용하자.


```java
import static com.study.querydsl.entity.QMember.*;

// 회원과 팀을 조인하면서, 팀 이름이 'teamA'인 팀만 조인, 회원은 모두 조회
	List<Tuple> result = queryFactory
		.select(member, team)
		.from(member)
		.leftJoin(member.team, team).on(team.name.eq("teamA"))
		.fetch();
	
	for (Tuple tuple : result) {
		System.out.println("tuple = " + tuple);
	}
```

<br><br>

#### b. 연관관계 없는 엔티티 외부 조인

- 실습 코드 :
	- 하이버네이트 5.1부터 on 을 사용해서 서로 관계가 없는 필드로 외부 조인하는 기능이 추가

```java
import static com.study.querydsl.entity.QMember.*;

// 회원과 팀을 조인하면서, 팀 이름이 'teamA'인 팀만 조인, 회원은 모두 조회
	List<Tuple> result = queryFactory
		.select(member, team)
		.from(member)
		.leftJoin(team).on(member.username.eq(team.name))
		.fetch();
	
	for (Tuple tuple : result) {
		System.out.println("tuple = " + tuple);
	}
```


<br>

- leftJoin() 부분에 일반 조인과 다르게 엔티티 하나만 들어간다


```
일반조인: leftJoin(member.team, team)
on조인: from(member).leftJoin(team).on(xxx)
```


---

<br><br>

### 12) 조인 - 페치 조인**

- 성능 최적화에 사용하는 방법이며 자세한 내용은 기본편이나 활용2 강의 확인하기

#### a. 페치 조인 미적용

- `지연로딩`으로 Member, Team SQL 쿼리 각각 실행
	- getPersistenceUnitUtil 찾아보기!!

```java
import static com.study.querydsl.entity.QMember.*;

	@PersistenceUnit
	EntityManagerFactory emf;

	@Test
	public void fetchJoinNo() throws Exception {
		em.flush();
		em.clear();
		
		Member findMember = queryFactory
			.selectFrom(member)
			.where(member.username.eq("member1"))
			.fetchOne();
		
		boolean loaded =
			emf.getPersistenceUnitUtil().isLoaded(findMember.getTeam());
		
		assertThat(loaded).as("페치 조인 미적용").isFalse();
	}
```

<br><br>

#### b. 페치 조인 적용

- `즉시로딩`으로 Member, Team SQL 쿼리 조인으로 한번에 조회
	- `.join(member.team, team).fetchJoin()`

```java
import static com.study.querydsl.entity.QMember.*;

	@Test
	public void fetchJoinNo() throws Exception {
		em.flush();
		em.clear();
		
		Member findMember = queryFactory
			.selectFrom(member)
			.join(member.team, team).fetchJoin()
			.where(member.username.eq("member1"))
			.fetchOne();
		
		boolean loaded =
			emf.getPersistenceUnitUtil().isLoaded(findMember.getTeam());
		
		assertThat(loaded).as("페치 조인 미적용").isFalse();
	}
```



---

<br><br>

### 13) 서브 쿼리**

#### a. JPAExpressions 사용!

- `eq`, `goe`, `in`, `select` 절에 이용 가능

```java
import static com.study.querydsl.entity.QMember.*;

QMember memberSub = new QMember("memberSub");

List<Member> result = queryFactory
	.selectFrom(member)
	.where(member.age.eq(
		JPAExpressions
			.select(memberSub.age.max())
			.from(memberSub)
	))
	.fetch();
```

<br>

#### b. static import 활용**

- JPAExpressions를 직접 사용하지 않아서 JPA Native query처럼 구조가 더 간단해진다.

```java
import static com.study.querydsl.entity.QMember.*;
import static com.querydsl.jpa.JPAExpressions.select;


List<Member> result = queryFactory
	.selectFrom(member)
	.where(member.age.eq(
			select(memberSub.age.max())
				.from(memberSub)
	))
	.fetch();
```

<br>

#### c. from 절의 서브쿼리 한계**


##### a) JPA JPQL 서브쿼리의 한계점으로 from 절의 서브쿼리(인라인 뷰)는 지원하지 않는다. 당연히 Querydsl도 지원하지 않는다.

<br>

##### b) from 절의 서브쿼리 해결방안**

- 서브쿼리를 join으로 변경한다.(하지만, 가능한 상황도 있고, 불가능한 상황도 있다.)

- 애플리케이션에서 쿼리를 2번 분리해서 실행한다.

- nativeSQL을 사용

---

<br><br>

### 14) Case 문

- `CaseBuilder` : 
	- select, 조건절(where), order by에서 사용 가능

#### a. 예시 1

```java
List<String> result = queryFactory
	.select(new CaseBuilder()
		.when(member.age.between(0, 20)).then("0~20살")
		.when(member.age.between(21, 30)).then("21~30살")
		.otherwise("기타"))
	.from(member)
	.fetch();
```

<br>

#### b. 예시 2

```java
NumberExpression<Integer> rankPath = new CaseBuilder()
	.when(member.age.between(0, 20)).then(2)
	.when(member.age.between(21, 30)).then(1)
	.otherwise(3);

List<Tuple> result = queryFactory
	.select(member.username, member.age, rankPath)
	.from(member)
	.orderBy(rankPath.desc())
	.fetch();

for (Tuple tuple : result) {
	String username = tuple.get(member.username);
	Integer age = tuple.get(member.age);
	Integer rank = tuple.get(rankPath);
	System.out.println("username = " + username + " age = " + age + " rank = " + rank);
}
```

```
username = member4 age = 40 rank = 3
username = member1 age = 10 rank = 2
username = member2 age = 20 rank = 2
username = member3 age = 30 rank = 1
```


---

<br><br>

### 15) 상수, 문자 더하기

#### a. 상수 더하기 : `Expressions.constant(xxx)`

```java
Tuple result = queryFactory
 .select(member.username, Expressions.constant("A"))
 .from(member)
 .fetchFirst();
```

- 최적화가 가능하면 SQL에 constant 값을 넘기지 않는다. 상수를 더하는 것 처럼 최적화가 어려우면 SQL에 constant 값을 넘긴다.

<br>

#### b. 문자 더하기 : `concat`


```java
String result = queryFactory
	.select(member.username.concat("_").concat(member.age.stringValue()))
	.from(member)
	.where(member.username.eq("member1"))
	.fetchOne();
```

- member.age.stringValue() 부분이 중요한데, 문자가 아닌 다른 타입들은 stringValue() 로 문
자로 변환할 수 있다. 
	- 이 방법은 ENUM을 처리할 때도 자주 사용한다.**
	
	
---

<br><br>

# 5. 중급 문법 정리

### 1) 프로젝션 결과 반환: 기본

#### a. 프로젝션 개념 : 

- select 대상 지정

- 프로젝션 대상이 하나면 타입을 명확하게 지정할 수 있음

- 프로젝션 대상이 둘 이상이면 튜플이나 DTO로 조회**
	- Repository 내부에서 데이터를 조회할 때, Entity 외의 값 (ex, DTO)으로 편리하게 리턴받아 사용할 수 있도록 하기 위해서
	- 튜플은 Repository 외부에서 사용할 수 없어야 한다.**

---

<br><br>

### 2) 프로젝션 결과 반환: DTO 조회

#### a. DTO 준비

```java
package com.study.querydsl.dto;
import lombok.Data;

	@Data
	public class MemberDto {
		private String username;
		private int age;

	public MemberDto() {

	}

	public MemberDto(String username, int age) {
		this.username = username;
		this.age = age;
	}
}
```

<br>

#### b. 먼저, JPA Native query 이용하여 조회 

- 먼저, 이렇게 Native query로 조회하고 이를 queryDSL 동적 쿼리로 변경하기

```java
List<MemberDto> result = em.createQuery(
	"select new study.querydsl.dto.MemberDto(m.username, m.age) " +
		"from Member m", MemberDto.class)
	.getResultList();
```

---

<br><br>

### 3) Querydsl 빈 생성(Bean population)**

- 결과를 DTO 반환할 때, 사용**

<br>

#### a. 프로퍼티 접근 : setter

```java
List<MemberDto> result = queryFactory
	.select(Projections.bean(MemberDto.class,
		member.username,
		member.age))
	.from(member)
	.fetch();
```

<br>

#### b. 필드 직접 접근

- Projections에 fields 사용하기

##### a) 속성명 직접 사용하기

```java
List<MemberDto> result = queryFactory
	.select(Projections.fields(MemberDto.class,
		member.username,
		member.age))
	.from(member)
	.fetch();
```

<br>

##### b) DTO 속성에 별칭을 사용하는 경우

```java
@Data
public class UserDto {
	private String name;
	private int age;
}
```

```java
List<UserDto> fetch = queryFactory
	.select(Projections.fields(UserDto.class,
		member.username.as("name"),
		ExpressionUtils.as(
		JPAExpressions
			.select(memberSub.age.max())
			.from(memberSub), "age")
			)
	).from(member)
	.fetch();
```

<br>

#### c. 생성자 사용**

- Projections에 constructor 사용하기
	- 이것을 많이 사용한다.

```java
List<MemberDto> result = queryFactory
	.select(Projections.constructor(MemberDto.class,
		member.username,
		member.age))
	.from(member)
	.fetch();
}
```

---

<br><br>

### 4) @QueryProjection**

- 컴파일러로 타입을 체크할 수 있으므로 가장 안전한 방법이다. 다만 DTO에 QueryDSL 어노테이션을 유지해야 하는 점과 DTO까지 Q 파일을 생성해야 하는 단점이 있다.
	- 그래서, @QueryProjection은 종속적으로 결합된다. 그래서, 문제가 많다.




---

<br><br>

### 5) 동적 쿼리 - BooleanBuilder 사용**
 

#### a. 동적 쿼리를 해결하는 두가지 방식

- BooleanBuilder

- Where 다중 파라미터 사용

```java
@Test
public void 동적쿼리_BooleanBuilder() throws Exception {
	String usernameParam = "member1";
	Integer ageParam = 10;
	
	List<Member> result = searchMember1(usernameParam, ageParam);
	Assertions.assertThat(result.size()).isEqualTo(1);
}

private List<Member> searchMember1(String usernameCond, Integer ageCond) {
	BooleanBuilder builder = new BooleanBuilder();
	
	if (usernameCond != null) {
		builder.and(member.username.eq(usernameCond));
	}
	
	if (ageCond != null) {
		builder.and(member.age.eq(ageCond));
	}
	
	return queryFactory
		.selectFrom(member)
		.where(builder)
		.fetch();
	}
```


---

<br><br>

### 6) 동적 쿼리 - Where 다중 파라미터 사용**

#### a. Where 다중 파라미터 사용

- 조건마다 메서드 생성하기!**

- where 조건에 null 값은 무시된다.

- 메서드를 다른 쿼리에서도 재활용할 수 있다.

- 쿼리 자체의 가독성이 높아진다


```java

@Test
public void 동적쿼리_WhereParam() throws Exception {
	String usernameParam = "member1";
	Integer ageParam = 10;
	List<Member> result = searchMember2(usernameParam, ageParam);
	Assertions.assertThat(result.size()).isEqualTo(1);
}

private List<Member> searchMember2(String usernameCond, Integer ageCond) {
	return queryFactory
		.selectFrom(member)
		.where(usernameEq(usernameCond), ageEq(ageCond))
		.fetch();	
}

private BooleanExpression usernameEq(String usernameCond) {
	return usernameCond != null ? member.username.eq(usernameCond) : null;
}

private BooleanExpression ageEq(Integer ageCond) {
	return ageCond != null ? member.age.eq(ageCond) : null;
}

```

<br>

#### b. 조합 가능**

- null 체크는 주의해서 처리해야함!

```java
private BooleanExpression allEq(String usernameCond, Integer ageCond) {
	return usernameEq(usernameCond).and(ageEq(ageCond));
}
```


---

<br><br>

### 7) 수정, 삭제 벌크 연산

- delete(), update()를 이용하기

- JPQL 배치와 마찬가지로, 영속성 컨텍스트에 있는 엔티티를 무시하고 실행되기 때문에 배치 쿼리를
실행하고 나면 영속성 컨텍스트를 초기화 하는 것이 안전하다.**


---

<br><br>

### 8) SQL function 호출하기

- SQL function은 JPA와 같이 Dialect(방언)에 등록된 내용만 호출할 수 있다
	- {0}, {1}, {2}는 replace할 변수의 갯수

```java

String result = queryFactory
	.select(Expressions.stringTemplate("function('replace', {0}, {1}, {2})", member.username, "member", "M"))
	.from(member)
	.fetchFirst();
```


---

<br><br>

# 6. 실무 활용 - 순수 JPA와 Querydsl

### 1) 순수 JPA 리포지토리와 Querydsl**

- H2에서 테스트 코드 실행 전, 매번 `drop all objects` 실행하기
	- 기존 테이블을 지우지 못해서 에러가 발생한다.

<br>

#### a. 순수 JPA 방식
 
- 순수 JPA는 JPA Native query를 이용하고, Spring Data JPA는 JPA에서 Spring에 기본으로 제공해주는 메서드를 이용할 수 있다. 
	- Spring Data JPA가 훨씬 간편하지만, 메서드가 제한적이다.(findAll 같은 것)

---

<br>

- 실습 코드 : 

- MemberJpaRepository.java
	- JPAQueryFactory를 new로 생성(mybatis에서도 Factory 관련 비슷한 내용이 있었다.)

```java
package com.study.querydsl.repository;

import com.querydsl.jpa.impl.JPAQueryFactory;
import com.study.querydsl.entity.Member;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class MemberJpaRepository {

    private final EntityManager em;
    private final JPAQueryFactory queryFactory;

    // EntityManager, JPAQueryFactory를 이렇게도 생성해서 사용 가능!!
//    public MemberJpaRepository(EntityManager em, JPAQueryFactory queryFactory) {
    public MemberJpaRepository(EntityManager em) {
        this.em = em;
//        this.queryFactory = queryFactory;
        this.queryFactory = new JPAQueryFactory(em);
    }

    public void save(Member member){
        em.persist(member);
    }

    // 객체 null 방지를 위해 Optional 사용 : Optional.ofNullable로 반환
    public Optional<Member> findById(Long id){
        Member findMember = em.find(Member.class, id);
        return Optional.ofNullable(findMember);
    }

    public List<Member> findAll(){
        return em.createQuery("select m from Member m", Member.class)
                .getResultList();
    }

    public List<Member> findByUsername(String username){
        return em.createQuery("select m from Member m where m.username = :username", Member.class)
                .setParameter("username", username)
                .getResultList();
    }
}

```

---


<br><br>

- MemberJpaRepositoryTest.java


```java
package com.study.querydsl.repository;

import com.study.querydsl.entity.Member;
import jakarta.persistence.EntityManager;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
public class MemberJpaRepositoryTest {

    @Autowired
    EntityManager entityManager;
    @Autowired
    MemberJpaRepository memberJpaRepository;

    @Test
    public void basicTest(){
        Member member = new Member("member1", 10);
        memberJpaRepository.save(member);

        // 원래는 get()으로 받으면 안되지만 임시 테스트라서 이렇게 테스트 진행
        Member findMember = memberJpaRepository.findById(member.getId()).get();
        assertThat(findMember).isEqualTo(member);

        List<Member> result1 = memberJpaRepository.findAll();
        assertThat(result1).containsExactly(member);

        List<Member> result2 = memberJpaRepository.findByUsername("member1");
        assertThat(result2).containsExactly(member);
    }

}


```

---

<br>

##### a) 빈등록 방식 vs 내부에서 생성**

- QuerydslApplication.java이나 config 파일에 설정하기

```java
package com.study.querydsl;

import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.persistence.EntityManager;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class QuerydslApplication {

	public static void main(String[] args) {
		SpringApplication.run(QuerydslApplication.class, args);
	}

    @Bean
    JPAQueryFactory jpaQueryFactory(EntityManager em){
        return new JPAQueryFactory(em);
    }

}

```

<br>

- MemberJpaRepository.java

```java
@Repository
public class MemberJpaRepository {

    private final EntityManager em;
    private final JPAQueryFactory queryFactory;

    // EntityManager, JPAQueryFactory를 이렇게도 생성해서 사용 가능!!
    public MemberJpaRepository(EntityManager em, JPAQueryFactory queryFactory) {
        this.em = em;
        this.queryFactory = queryFactory;
    }
}
```

---

<br>

- 원래 MemberJpaRepository.java 코드!!
	- 이것은 테스트 코드짤 때, 더 편하다. 위의 방식대로면 항상 외부에서 JPAQueryFactory를 주입받아야 하기 때문이다. 

```java

@Repository
public class MemberJpaRepository {

    private final EntityManager em;
    private final JPAQueryFactory queryFactory;

    // EntityManager, JPAQueryFactory를 이렇게도 생성해서 사용 가능!!
    public MemberJpaRepository(EntityManager em) {
        this.em = em;
        this.queryFactory = new JPAQueryFactory(em);
    }
}
```

----

<br><br>

#### b. querydsl 방식

- MemberJpaRepository.java

```java
package com.study.querydsl.repository;

import com.querydsl.jpa.impl.JPAQueryFactory;
import com.study.querydsl.entity.Member;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

import static com.study.querydsl.entity.QMember.member;

@Repository
public class MemberJpaRepository {

    private final EntityManager em;
    private final JPAQueryFactory queryFactory;

    // EntityManager, JPAQueryFactory를 이렇게도 생성해서 사용 가능!!
    public MemberJpaRepository(EntityManager em) {
        this.em = em;
        this.queryFactory = new JPAQueryFactory(em);
    }

    public void save(Member member){
        em.persist(member);
    }

    // 객체 null 방지를 위해 Optional 사용 : Optional.ofNullable로 반환
    public Optional<Member> findById(Long id){
        Member findMember = em.find(Member.class, id);
        return Optional.ofNullable(findMember);
    }

    // querydsl 중요!: 확실히 더 편하다
    public List<Member> findAll_Querydsl(){
        return queryFactory
                .selectFrom(member).fetch();
    }

    public List<Member> findByUsername_Querydsl(String username){
        return queryFactory
                .selectFrom(member)
                .where(member.username.eq(username))
                .fetch();
    }

}

```

<br>

- MemberJpaRepositoryTest.java

```java
package com.study.querydsl.repository;

import com.study.querydsl.entity.Member;
import jakarta.persistence.EntityManager;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
public class MemberJpaRepositoryTest {

    @Autowired
    EntityManager entityManager;
    @Autowired
    MemberJpaRepository memberJpaRepository;

    @Test
    public void basicQueryTest(){
        Member member = new Member("member1", 10);
        memberJpaRepository.save(member);

        // 원래는 get()으로 받으면 안되지만 임시 테스트라서 이렇게 테스트 진행
        Member findMember = memberJpaRepository.findById(member.getId()).get();
        assertThat(findMember).isEqualTo(member);

        List<Member> result1 = memberJpaRepository.findAll_Querydsl();
        assertThat(result1).containsExactly(member);

        List<Member> result2 = memberJpaRepository.findByUsername_Querydsl("member1");
        assertThat(result2).containsExactly(member);
    }

}

```

---

<br><br>

### 2) 동적쿼리 Builder 적용

- 동적쿼리를 DTO와 BooleanBuilder를 이용하여 사용하기

<br>

#### a. DTO 준비

- MemberTeamDto.java

```java
package com.study.querydsl.dto;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.annotations.QueryProjection;
import lombok.*;

import java.util.List;

import static org.springframework.util.Assert.hasText;

@Data
public class MemberTeamDto {
    private Long memberId;
    private String username;
    private int age;
    private Long teamId;
    private String teamName;

    @QueryProjection
    public MemberTeamDto(Long memberId, String username, int age, Long teamId, String teamName) {
        this.memberId = memberId;
        this.username = username;
        this.age = age;
        this.teamId = teamId;
        this.teamName = teamName;
    }

}

```

<br>
- MemberSearchCondition.jaca

```java

package com.study.querydsl.dto;

import lombok.*;

@Data
public class MemberSearchCondition {
    // 회원명, 팀명, 나이(ageGoe, ageLoe)

    private String username;
    private String teamName;
    private Integer ageGoe;
    private Integer ageLoe;
    
}

```


---

<br><br>

#### b. 실습 코드

- builder로 따로 변수 빼고 이용하기!
	- builder.and() 이용하기

<br>
- MemberJpaRepository.java

```java
package com.study.querydsl.repository;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.study.querydsl.dto.MemberSearchCondition;
import com.study.querydsl.dto.MemberTeamDto;
import com.study.querydsl.dto.QMemberTeamDto;
import com.study.querydsl.entity.Member;
import com.study.querydsl.entity.QMember;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

import static com.study.querydsl.entity.QMember.member;
import static com.study.querydsl.entity.QTeam.team;
import static org.springframework.util.StringUtils.hasText;

@Repository
public class MemberJpaRepository {

    private final EntityManager em;
    private final JPAQueryFactory queryFactory;

    // EntityManager, JPAQueryFactory를 이렇게도 생성해서 사용 가능!!
    public MemberJpaRepository(EntityManager em) {
        this.em = em;
        this.queryFactory = new JPAQueryFactory(em);
    }

    public void save(Member member){
        em.persist(member);
    }

    // 객체 null 방지를 위해 Optional 사용 : Optional.ofNullable로 반환
    public Optional<Member> findById(Long id){
        Member findMember = em.find(Member.class, id);
        return Optional.ofNullable(findMember);
    }

    // querydsl 중요!: 확실히 더 편하다..
    public List<Member> findAll_Querydsl(){
        return queryFactory
                .selectFrom(member).fetch();
    }

    public List<Member> findByUsername_Querydsl(String username){
        return queryFactory
                .selectFrom(member)
                .where(member.username.eq(username))
                .fetch();
    }

    public List<MemberTeamDto> searchByBuilder(MemberSearchCondition condition){
        BooleanBuilder builder = new BooleanBuilder();

        if(hasText(condition.getUsername())){
            builder.and(member.username.eq(condition.getUsername()));
        }

        if(hasText(condition.getTeamName())){
            builder.and(team.name.eq(condition.getTeamName()));
        }

        if(condition.getAgeGoe() != null){
            builder.and(member.age.goe(condition.getAgeGoe()));
        }

        if(condition.getAgeLoe() != null){
            builder.and(member.age.loe(condition.getAgeLoe()));
        }

        // QMemberTeamDto는 생성자를 사용하기
        // 때문에 필드 이름을 맞추지 않아도 된다. 따라서 member.id 만 적으면 된다.
        return queryFactory
                .select(new QMemberTeamDto(
                        member.id,
                        member.username,
                        member.age,
                        team.id,
                        team.name))
                .from(member)
                .leftJoin(member.team, team)
                .where(builder)
                .fetch();
    }

}

```

---

<br>
- 테스트 코드 :
	- MemberJpaRepositoryTest.java

```java
package com.study.querydsl.repository;

import com.querydsl.jpa.impl.JPAQueryFactory;
import com.study.querydsl.dto.MemberSearchCondition;
import com.study.querydsl.dto.MemberTeamDto;
import com.study.querydsl.entity.Member;
import com.study.querydsl.entity.Team;
import jakarta.persistence.EntityManager;

import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
public class MemberJpaRepositoryTest {

    @PersistenceContext
    EntityManager em;
    @Autowired
    MemberJpaRepository memberJpaRepository;

    @Test
    public void searchTest(){
        Team teamA = new Team("teamA");
        Team teamB = new Team("teamB");
        em.persist(teamA);
        em.persist(teamB);

        Member member1 = new Member("member1", 10, teamA);
        Member member2 = new Member("member2", 20, teamA);
        Member member3 = new Member("member3", 30, teamB);
        Member member4 = new Member("member4", 40, teamB);
        em.persist(member1);
        em.persist(member2);
        em.persist(member3);
        em.persist(member4);

        MemberSearchCondition condition = new MemberSearchCondition();

        condition.setAgeGoe(35);
        condition.setAgeLoe(40);
        condition.setTeamName("teamB");

        List<MemberTeamDto> result = memberJpaRepository.searchByBuilder(condition);

        assertThat(result).extracting("username").containsExactly("member4");

    }

}

```


---

<br><br>

### 3) 동적쿼리 Where 적용

- where절에 파라미터를 이용하면, 조건을 재사용 가능!!
	- 실무에서는 정책 관련하여 모든 것들을 항상 조건을 체크하고 넘어가야하는데 이러한 업무(플래그나 날짜 체크)들은 매우 반복적이라서 
	- 다음처럼 파라미터를 사용하면 재사용할 수 있어서 편리하다

<br>

- MemberJpaRepository.java


```java
package com.study.querydsl.repository;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.study.querydsl.dto.MemberSearchCondition;
import com.study.querydsl.dto.MemberTeamDto;
import com.study.querydsl.dto.QMemberTeamDto;
import com.study.querydsl.entity.Member;
import com.study.querydsl.entity.QMember;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

import static com.study.querydsl.entity.QMember.member;
import static com.study.querydsl.entity.QTeam.team;
import static io.micrometer.common.util.StringUtils.isEmpty;
import static org.springframework.util.StringUtils.hasText;


@Repository
public class MemberJpaRepository {

    private final EntityManager em;
    private final JPAQueryFactory queryFactory;

    // EntityManager, JPAQueryFactory를 이렇게도 생성해서 사용 가능!!
    public MemberJpaRepository(EntityManager em) {
        this.em = em;
        this.queryFactory = new JPAQueryFactory(em);
    }

    public void save(Member member){
        em.persist(member);
    }

    // 동적쿼리 - Where절 파라미터 사용
    public List<MemberTeamDto> searchByParameter(MemberSearchCondition condition){
        return queryFactory
                .select(new QMemberTeamDto(
                        member.id,
                        member.username,
                        member.age,
                        team.id,
                        team.name
                ))
                .from(member)
                .leftJoin(member.team, team)
                .where(usernameEq(condition.getUsername()),
                        teamNameEq(condition.getTeamName()),
                        ageGoe(condition.getAgeGoe()),
                        ageLoe(condition.getAgeLoe()))
                .fetch();
    }

    private BooleanExpression usernameEq(String username) {
        return isEmpty(username) ? null : member.username.eq(username);
    }

    private BooleanExpression teamNameEq(String teamName) {
        return isEmpty(teamName) ? null : team.name.eq(teamName);
    }

    private BooleanExpression ageGoe(Integer ageGoe) {
        return ageGoe == null ? null : member.age.goe(ageGoe);
    }

    private BooleanExpression ageLoe(Integer ageLoe) {
        return ageLoe == null ? null : member.age.loe(ageLoe);
    }

    // where절에 파라미터를 이용하면, 재사용 가능!!
    public List<Member> findMember(MemberSearchCondition condition){
        return queryFactory
                .selectFrom(member)
                .leftJoin(member.team, team)
                .where(usernameEq(condition.getUsername()),
                        teamNameEq(condition.getTeamName()),
                        ageGoe(condition.getAgeGoe()),
                        ageLoe(condition.getAgeLoe()))
                .fetch();
    }
}

```

---

<br>

- MemberJpaRepositoryTest.java

```java
package com.study.querydsl.repository;

import com.querydsl.jpa.impl.JPAQueryFactory;
import com.study.querydsl.dto.MemberSearchCondition;
import com.study.querydsl.dto.MemberTeamDto;
import com.study.querydsl.entity.Member;
import com.study.querydsl.entity.Team;
import jakarta.persistence.EntityManager;

import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
public class MemberJpaRepositoryTest {

    @PersistenceContext
    EntityManager em;
    @Autowired
    MemberJpaRepository memberJpaRepository;

    @Test
    public void searchByParameterTest(){
        Team teamA = new Team("teamA");
        Team teamB = new Team("teamB");
        em.persist(teamA);
        em.persist(teamB);

        Member member1 = new Member("member1", 10, teamA);
        Member member2 = new Member("member2", 20, teamA);
        Member member3 = new Member("member3", 30, teamB);
        Member member4 = new Member("member4", 40, teamB);
        em.persist(member1);
        em.persist(member2);
        em.persist(member3);
        em.persist(member4);

        MemberSearchCondition condition = new MemberSearchCondition();

        condition.setAgeGoe(35);
        condition.setAgeLoe(40);
        condition.setTeamName("teamB");

        List<MemberTeamDto> result = memberJpaRepository.searchByParameter(condition);

        assertThat(result).extracting("username").containsExactly("member4");

    }

}

```


---

<br><br>

### 4) 조회 API 컨트롤러 개발

- 샘플데이터 100개 만들기


#### a. application.yml에서 profiles 설정하기

- local과 test 코드에서 데이터를 분리하여 사용할 수 있다.
	- 운영서버에서는 샘플데이터를 사용하면 안 되기 때문이다.(충돌 가능성이 높다.)
	
<br>
- profiles : local

```yml
spring:
  profiles:
    active: local
  datasource:
    url: jdbc:h2:tcp://localhost/~/querydsl
    username: sa
    password:
    driver-class-name: org.h2.Driver

  jpa:
    hibernate:
      ddl-auto: create
    properties:
      hibernate:
#        show_sql: true # 에러가 너무 많아서 인메모리로 사용하자!
        format_sql: true

logging.level:
  org.hibernate.SQL: debug
  org.hibernate.orm.jdbc.bind: trace
```

<br>
- profiles : test


```yml
spring:
  profiles:
    active: test
```

---

<br>

#### b. 실습 코드 :
	
<br>
- 여기에 아래 코드인 샘플 데이터 만드는 로직을 다 넣고 싶지만, 스프링의 @PostConstruct 라이프 사이클 때문에 @Transactional과 같이 못 쓴다.
	- 따라서, @PostConstruct 부분과 @Transactional 동작 부분을 분리시켜야 한다!

<br>
- InitMember.java

```java
package com.study.querydsl.controller;

import com.study.querydsl.entity.Member;
import com.study.querydsl.entity.Team;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

// 샘플 데이터 추가
@Profile("local")
@Component
@RequiredArgsConstructor
public class InitMember {
    private final InitMemberService initMemberService;

    // 원래는 서비스단이어야 하지만, 테스트라서 그냥 여기서 다 만들어버림!
    // ** 여기에 아래 코드인 샘플 데이터 만드는 로직을 다 넣고 싶지만, 스프링의 @PostConstruct 라이프 사이클 때문에 @Transactional과 같이 못 쓴다.(스프링 공부하기!!)
    // 따라서, @PostConstruct 부분과 @Transactional 동작 부분을 분리시켜야 한다.!
    @PostConstruct
    public void init(){
        initMemberService.init();
    }

    @Component
    static class InitMemberService{
        @PersistenceContext
        EntityManager em;

        @Transactional
        public void init(){
            Team teamA = new Team("teamA");
            Team teamB = new Team("teamB");
            em.persist(teamA);
            em.persist(teamB);

            for(int i = 0; i < 100; i++){
                Team selectedTeam = i % 2 == 0 ? teamA : teamB;
                em.persist(new Member("member" + i, i, selectedTeam));
            }
        }
    }
}


```

<br>
- MemberController.java


```java
package com.study.querydsl.controller;

import com.study.querydsl.dto.MemberSearchCondition;
import com.study.querydsl.dto.MemberTeamDto;
import com.study.querydsl.repository.MemberJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class MemberController {

    private final MemberJpaRepository memberJpaRepository;

    @GetMapping("/v1/members")
    public List<MemberTeamDto> searchMemberV1(MemberSearchCondition condition){
        return memberJpaRepository.searchByParameter(condition);
    }

}

```

---

<br>

#### c. PostMan으로 샘플데이터 조회하기


```java
[
    {
        "memberId": 32,
        "username": "member31",
        "age": 31,
        "teamId": 2,
        "teamName": "teamB"
    },
    {
        "memberId": 34,
        "username": "member33",
        "age": 33,
        "teamId": 2,
        "teamName": "teamB"
    },
    {
        "memberId": 36,
        "username": "member35",
        "age": 35,
        "teamId": 2,
        "teamName": "teamB"
    }
]
```



---

<br><br>

# 7. 실무 활용 - 스프링 데이터 JPA와 Querydsl

### 1) 스프링 데이터 JPA 테스트

- 단순히 Repository에서 extends JpaRepository<>를 하여 사용
	- 스프링 데이터에서 만들어진 메서드 사용하기!

<br>
- MemberRepository.java

```java
package com.study.querydsl.repository;

import com.study.querydsl.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

public interface MemberRepository extends JpaRepository<Member, Long> {
    List<Member> findByUsername(String username);

}

```

---

<br>
- MemberRepositoryTest.java

```java
package com.study.querydsl.repository;


import com.study.querydsl.entity.Member;
import jakarta.persistence.EntityManager;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
public class MemberRepositoryTest {

    @Autowired
    EntityManager em;
    @Autowired
    MemberRepository memberRepository;

    @Test
    public void basicTest(){
        Member member = new Member("member1", 10);
        memberRepository.save(member);

        // 스프링 데이터 JPA : 3가지 테스트
        Member findMember = memberRepository.findById(member.getId()).get();
        assertThat(findMember).isEqualTo(member);

        List<Member> result1 = memberRepository.findAll();
        assertThat(result1).containsExactly(member);

        List<Member> result2 = memberRepository.findByUsername("member1");
        assertThat(result2).containsExactly(member);
    }
}

```

---

<br><br>

### 2) 사용자 정의 Repository 만들기 

- 스프링 데이터 JPA와 Querydsl 테스트

- 중요! : 상속받거나 구현하는 관계 중요

<br>

#### a. 실습 코드 

- MemberRepositoryCustom.java 인터페이스 생성

```java
package com.study.querydsl.repository;

import com.study.querydsl.dto.MemberSearchCondition;
import com.study.querydsl.dto.MemberTeamDto;

import java.util.List;

public interface MemberRepositoryCustom {
    // Querydsl 전용 기능인 회원 search를 작성할 수 없다.
    // 따라서, 사용자 정의 리포지토리 필요
    List<MemberTeamDto> search(MemberSearchCondition condition);
}

```

---

<br>
- MemberRepositoryImpl.java : 구현체 

```java
package com.study.querydsl.repository;

import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.study.querydsl.dto.MemberSearchCondition;
import com.study.querydsl.dto.MemberTeamDto;
import com.study.querydsl.dto.QMemberTeamDto;
import jakarta.persistence.EntityManager;

import java.util.List;

import static com.study.querydsl.entity.QMember.member;
import static com.study.querydsl.entity.QTeam.team;
import static io.micrometer.common.util.StringUtils.isEmpty;

public class MemberRepositoryImpl implements MemberRepositoryCustom {
    private final JPAQueryFactory queryFactory;

    // 주입!
    public MemberRepositoryImpl(EntityManager em) {
        this.queryFactory = new JPAQueryFactory(em);
    }

    @Override
    public List<MemberTeamDto> search(MemberSearchCondition condition) {
        return queryFactory
                .select(new QMemberTeamDto(
                        member.id,
                        member.username,
                        member.age,
                        team.id,
                        team.name))
                .from(member)
                .leftJoin(member.team, team)
                .where(usernameEq(condition.getUsername()),
                        teamNameEq(condition.getTeamName()),
                        ageGoe(condition.getAgeGoe()),
                        ageLoe(condition.getAgeLoe()))
                .fetch();
    }

    private BooleanExpression usernameEq(String username) {
        return isEmpty(username) ? null : member.username.eq(username);
    }
    private BooleanExpression teamNameEq(String teamName) {
        return isEmpty(teamName) ? null : team.name.eq(teamName);
    }
    private BooleanExpression ageGoe(Integer ageGoe) {
        return ageGoe == null ? null : member.age.goe(ageGoe);
    }
    private BooleanExpression ageLoe(Integer ageLoe) {
        return ageLoe == null ? null : member.age.loe(ageLoe);
    }
}

```

---

<br>

- 관계 연결 : MemberRepository.java 수정
	- extends를 2방향으로 진행 : `스프링 데이타 JPA`와 `사용자 커스텀 Repository`


```java
package com.study.querydsl.repository;

import com.study.querydsl.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

// 상속에 해당하는 extends는 2개 이상도 가능하다.
public interface MemberRepository extends JpaRepository<Member, Long>, MemberRepositoryCustom {
    List<Member> findByUsername(String username);

}

```


---

<br><br>

- 스프링 데이터 JPA와 queryDSL의 Test 코드 :

```java
package com.study.querydsl.repository;


import com.study.querydsl.dto.MemberSearchCondition;
import com.study.querydsl.dto.MemberTeamDto;
import com.study.querydsl.entity.Member;
import com.study.querydsl.entity.Team;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
public class MemberRepositoryTest {

    @Autowired
    EntityManager em;

    @Autowired
    MemberRepository memberRepository;

    @Test
    public void searchTest() {
        Team teamA = new Team("teamA");
        Team teamB = new Team("teamB");
        em.persist(teamA);
        em.persist(teamB);

        Member member1 = new Member("member1", 10, teamA);
        Member member2 = new Member("member2", 20, teamA);
        Member member3 = new Member("member3", 30, teamB);
        Member member4 = new Member("member4", 40, teamB);
        em.persist(member1);
        em.persist(member2);
        em.persist(member3);
        em.persist(member4);

        MemberSearchCondition condition = new MemberSearchCondition();

        condition.setAgeGoe(35);
        condition.setAgeLoe(40);
        condition.setTeamName("teamB");

        List<MemberTeamDto> result = memberRepository.search(condition);

        assertThat(result).extracting("username").containsExactly("member4");
    }


}

```












