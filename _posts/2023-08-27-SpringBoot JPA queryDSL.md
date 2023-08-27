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
	- H2를 이용하여 테스트 진행 시, ` Error creating bean with name 'entityManagerFactory' defined in class path resource ` 에러가 발생하면, H2 SQL 편집기에서 `drop all objects;` 명령어를 실행하기! 
		- h2 데이터베이스에서 `drop all objects` 명령어를 입력하면 저장되어있던 테이블이 싹 다 날라가게 된다.
		- h2 데이터베이스도 Intellij Build 와 동일하게 증분 빌드를 하는 과정에서 삭제 된 데이터(테이블)에 대해서는 관리를 하지 않는 것처럼 보였다.
		- 이러한 이슈는 일대다 읽기 전용 테이블이 생성되었다가 해당 연관관계를 삭제하더라도 테이블이 계속해서 h2 데이터베이스에 남아있을 때에도 동일하게 적용되었다.

---

<br><br>

# 2. queryDSL 개발 환경 테스트

- buiild.gradle 설정
	- SpringBoot 3.0 버전 이상에서 Querydsl 사용는 방법 : Querydsl 추가 설정 부분 주의!

```
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
	- gradle 탭에서 `Tasks/other/compileJava`을 클릭하면, Hello가 QHello롤 생성하여 queryDSL이 제대로 동작하는지 확인할 수 있다.

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
	- 중요** : H2를 이용하여 테스트 진행 시, ` Error creating bean with name 'entityManagerFactory' defined in class path resource ` 에러가 발생하면, H2 SQL 편집기에서 `drop all objects;` 명령어를 실행하기! 
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

# 3. queryDSL 도메인 모델 테스트


### 1) 설계 방식 

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
- 결과

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








