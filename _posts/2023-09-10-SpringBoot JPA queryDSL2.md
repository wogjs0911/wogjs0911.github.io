---
key: /2023/09/10/SpringBoot-JPA-queryDSL2.html
title: SpringBoot - queryDSL Study2
tags: springboot JPA queryDSL BooleanExpression Custom Paging
---

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

 
- PostMan API URL : `http://localhost:8080/v1/members?teamName=teamB&ageGoe=31&ageLoe=35`


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


#### 0. 사용자 정의 Repository 사용하는 이유**

- 간단한 정적코드와 같은 것은 Spring Data JPA에서 인터페이스로 만들면 된다.

<br>
- 하지만, 동적 쿼리나 복잡한 쿼리 같은 경우는 QueryDsl에서 사용자 정의 Repository를 사용한다.

<br>
- Spring Data JPA는 인터페이스이기때문에 구현 코드를 넣으려면 사용자 정의 Repository를 사용해야한다.

<br>

#### a. 사용자 정의 Repository 만드는 방법

- 1) 클래스 MemberRepositoryImpl 만들기**
	- 주의** : 클래스이름은은 기존 Repository + Impl을 붙여 생성

<br>
- 2) 즉, MemberRepository라는 사용자 정의 Repository는 Spring Data JPA가 상속받고 있는 인터페이스명 바로 뒤에 Impl 붙여서 생성해야 한다.

<br>
- 3) MemberRepositoryImpl 생성 후 인터페이스인 MemberRepositoryCustom 정의를 오버라이딩해서 사용한다.
	- 팩토리 패턴이나 인터페이스를 사용하는 이유처럼 사용자 정의 Repository을 사용

<br>
- 4) MemberRepository에서 MemberRepositoryCustom을 상속받는다.

---

<br><br>

#### b. 스프링 데이터 JPA와 Querydsl 테스트 과정

- Querydsl 전용 기능인 회원 search를 작성할 수 없다.

<br>
- 따라서, 사용자 정의 Repository가 필요!

<br>
- 중요! : 상속받거나 구현하는 관계 중요!!

<br>
- 특정 화면에 특화된 쿼리일 때는 클래스만 바로 만들고 @Repository 어노테이션으로 빈을 만들고 바로 JPAQueryFactory를 인젝션해서 사용한다!


---

<br><br>

#### c. 실습 코드 

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




---

<br><br>

### 3) JPA Repository 호출 시 NullPointerException 해결방법


```java
java.lang.NullPointerException: Cannot invoke "com.study.querydsl.repository.MemberRepository.save(Object)" because "this.memberRepository" is null
```

#### a. 첫 번째 방법

- 클래스 위에 @RequiredArgsConstructor 어노테이션을 달아준 후 repository 클래스 선언 시, 접근자를 final로 선언(final로 선언해야 Lombok이 작동함)
	- 해결 실패

<br>

#### b. 두 번째 방법

- DI가 제대로 되지 않았을 때,
	- DI가 제대로 되지 않았다면 트랜잭션이 걸렸다 하더라도 값을 가져올 수 없어서 NullPointerException이 뜬다. 이 때, 확인해야할 부분은 주요 repository나 EntityManager를 @RequiredArgsConstruct로 했을 때, private final을 하지 않았는지를 확인해야한다. 
	- 해결 실패 : 첫 번째 방법과 같은 방식


<br>

#### c. 세 번째 방법 : 최종**

- 인텔리제이에서 Repository 테스트를 하는 경우, `command + shift + T` 커맨드로 해당 Repository에 테스트를 작성해야 한다.
	- 인위적으로 테스트 코드 파일을 만들면, Repository import가 잡히지 않는다.
	- 패키지도 계층형으로 생김(MemberRepositoryImplTest > MemberRepositoryTest)

<br>

#### d. 생성자 주입하는 방법 2가지**

- 빈 등록 유무에 따라 달라진다.

```java
    public MemberRepositoryImpl(EntityManager em) {
        this.queryFactory = new JPAQueryFactory(em);
    }
```

<br>

```java
    public MemberRepositoryImpl(JPAQueryFactory queryFactory) {
        this.queryFactory = queryFactory;
    }
```

---

<br><br>

### 4) JPA 설계 관점 : 특정 API에 종속적인 경우

- 화면별로 추가적인 특정 query 메서드 만들기! 
	- 기본적으로는 MemberRepository 같이 공통 모듈 API 사용

```java
package com.study.querydsl.repository;

import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.study.querydsl.dto.MemberSearchCondition;
import com.study.querydsl.dto.MemberTeamDto;
import com.study.querydsl.dto.QMemberTeamDto;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Repository;

import java.util.List;

import static com.study.querydsl.entity.QMember.member;
import static com.study.querydsl.entity.QTeam.team;
import static io.micrometer.common.util.StringUtils.isEmpty;

// ** 설계 관점 : 특정 API에 종속적인 경우, MemberRepository와 다른 MemberQueryRepository 만들기! **
@Repository
public class MemberQueryRepository {

    private final JPAQueryFactory queryFactory;

    // 주입!
    public MemberQueryRepository(EntityManager em) {
        this.queryFactory = new JPAQueryFactory(em);
    }
    
    public List<MemberTeamDto> search(MemberSearchCondition condition) {
        return queryFactory
                .select(new QMemberTeamDto(
                        member.id.as("memberId"),
                        member.username,
                        member.age,
                        team.id.as("teamId"),
                        team.name.as("teamName")))
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

<br><br>

### 5) QueryDsl 페이징 연동

- Pageable 파라미터를 이용하여 Page<> '인터페이스'인데 이것의 '구현체'로서 PageImpl<>를 이용하여, 뽑아낸 인자들을 넣어준다.

<br>
- fetchResults 최적화 : 전체 카운트를 조회 하는 방법을 최적화 할 수 있으면 이렇게 분리하면 된다. 전체 카운트를 조회할 때, 조인 쿼리를 줄일 수 있다면 상당한 효과가 있다.
	- 수정 방법 : JPAQuery<>, PageableExecutionUtils.getPage() 이용하기

<br>
- countQuery 최적화 : queryDSL에서 람다나 stream API를 이용하면, count 쿼리를 생략할 수 있는 경우 생략하게 해준다.(queryDSL에서 이 기능을 제공해준다.)
	- 1) 페이지 시작이면서 컨텐츠 사이즈가 페이지 사이즈보다 작을 때
	- 2) 마지막 페이지 일 때 (offset + 컨텐츠 사이즈를 더해서 전체 사이즈 구함, 더 정확히는 마지막 페이지이면서 컨텐츠 사이즈가 페이지 사이즈보다 작을 때,

#### a. 실습 코드 

- MemberRepositoryCustom.java


```java
package com.study.querydsl.repository;

import com.study.querydsl.dto.MemberSearchCondition;
import com.study.querydsl.dto.MemberTeamDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface MemberRepositoryCustom {
    // Querydsl 전용 기능인 회원 search를 작성할 수 없다.
    // 따라서, 사용자 정의 리포지토리 필요
    List<MemberTeamDto> search(MemberSearchCondition condition);
    Page<MemberTeamDto> searchPageSimple(MemberSearchCondition condition, Pageable pageable);
    Page<MemberTeamDto> searchPageComplex(MemberSearchCondition condition, Pageable pageable);
    Page<MemberTeamDto> searchPageComplex2(MemberSearchCondition condition, Pageable pageable);

}

```

---

<br>

- MemberRepositoryImpl.java

```java
package com.study.querydsl.repository;

import com.querydsl.core.QueryResults;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.study.querydsl.dto.MemberSearchCondition;
import com.study.querydsl.dto.MemberTeamDto;
import com.study.querydsl.dto.QMemberTeamDto;
import com.study.querydsl.entity.Member;
import jakarta.persistence.EntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.support.PageableUtils;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.stereotype.Repository;

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

    // 1) 단순한 페이징, fetchResults()로 select와 count 한 번에 쿼리 실행
    // 실제 쿼리는 2번 호출
    @Override
    public Page<MemberTeamDto> searchPageSimple(MemberSearchCondition condition, Pageable pageable) {

        // fetchResults()를 사용하려면, 일단, QueryResults<>에 담아서 인자들을 뽑아낸다.
        QueryResults<MemberTeamDto> results = queryFactory
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
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetchResults();

        List<MemberTeamDto> content = results.getResults();
        long total = results.getTotal();

        // Page<> '인터페이스'인데 이것의 '구현체'로서 PageImpl<>를 이용하여, 뽑아낸 인자들을 넣어준다.
        return new PageImpl<>(content, pageable, total);
    }

    // 2) 데이터 내용과 전체 카운트를 별도로 조회하는 방법
    @Override
    public Page<MemberTeamDto> searchPageComplex(MemberSearchCondition condition, Pageable pageable) {

        // ** fetchResults = fetch() + fetchCount() **
        // 전체 카운트를 조회 하는 방법을 최적화 할 수 있으면 이렇게 분리하면 된다.
        // (예를 들어서, 전체 카운트를 조회할 때, 조인 쿼리를 줄일 수 있다면 상당한 효과가 있다.)
        List<MemberTeamDto> content = queryFactory
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
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        long total = queryFactory
                .select(member)
                .from(member)
                .leftJoin(member.team, team)
                .where(usernameEq(condition.getUsername()),
                        teamNameEq(condition.getTeamName()),
                        ageGoe(condition.getAgeGoe()),
                        ageLoe(condition.getAgeLoe()))
                .fetchCount();

        return new PageImpl<>(content, pageable, total);
    }

    @Override
    public Page<MemberTeamDto> searchPageComplex2(MemberSearchCondition condition, Pageable pageable) {

        // ** fetchResults = fetch() + fetchCount() **
        // 전체 카운트를 조회 하는 방법을 최적화 할 수 있으면 이렇게 분리하면 된다.
        // (예를 들어서, 전체 카운트를 조회할 때, 조인 쿼리를 줄일 수 있다면 상당한 효과가 있다.)
        List<MemberTeamDto> content = queryFactory
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
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        JPAQuery<Member> countQuery = queryFactory
                .select(member)
                .from(member)
                .leftJoin(member.team, team)
                .where(usernameEq(condition.getUsername()),
                        teamNameEq(condition.getTeamName()),
                        ageGoe(condition.getAgeGoe()),
                        ageLoe(condition.getAgeLoe()));


        return PageableExecutionUtils.getPage(content, pageable, () -> countQuery.fetchCount());
//        return PageableExecutionUtils.getPage(content, pageable, countQuery::fetchCount);

        // ** 람다나 stream API를 이용하는 경우, count 쿼리가 생략 가능한 경우 생략해서 처리 **
        // 1) 페이지 시작이면서 컨텐츠 사이즈가 페이지 사이즈보다 작을 때
        // 2) 마지막 페이지 일 때 (offset + 컨텐츠 사이즈를 더해서 전체 사이즈 구함, 더 정확히는 마지막 페이지이면서 컨텐츠 사이즈가 페이지 사이즈보다 작을 때)
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

- MemberController.java


```java
package com.study.querydsl.controller;

import com.study.querydsl.dto.MemberSearchCondition;
import com.study.querydsl.dto.MemberTeamDto;
import com.study.querydsl.repository.MemberJpaRepository;
import com.study.querydsl.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class MemberController {

    private final MemberJpaRepository memberJpaRepository;
    private final MemberRepository memberRepository;

    @GetMapping("/v1/members")
    public List<MemberTeamDto> searchMemberV1(MemberSearchCondition condition){
        return memberJpaRepository.searchByParameter(condition);
    }

    @GetMapping("/v2/members")
    public Page<MemberTeamDto> searchMemberV2(MemberSearchCondition condition, Pageable pageable){
        return memberRepository.searchPageSimple(condition, pageable);
    }

    @GetMapping("/v3/members")
    public Page<MemberTeamDto> searchMemberV3(MemberSearchCondition condition, Pageable pageable){
        return memberRepository.searchPageComplex(condition, pageable);
    }

    @GetMapping("/v4/members")
    public Page<MemberTeamDto> searchMemberV4(MemberSearchCondition condition, Pageable pageable){
        return memberRepository.searchPageComplex2(condition, pageable);
    }

}

```



---

<br><br>

#### b. 실습 주의 :

- 해당 실습을 위해서, 기존 H2 DB에 테이블이 존재한다면, `drop all objects` 명령어로 기존 테이블을 제거해야 한다. 
	- InitMember에서 샘플 데이터가 만들어지기 때문이다. 


---

<br><br>

#### c. PostMan 실습 및 결과


- PostMan API URL : `http://localhost:8080/v4/members?size=5&page=2`


<br>

```java
{
    "content": [
        {
            "memberId": 11,
            "username": "member10",
            "age": 10,
            "teamId": 1,
            "teamName": "teamA"
        },
        {
            "memberId": 12,
            "username": "member11",
            "age": 11,
            "teamId": 2,
            "teamName": "teamB"
        },
        {
            "memberId": 13,
            "username": "member12",
            "age": 12,
            "teamId": 1,
            "teamName": "teamA"
        },
        {
            "memberId": 14,
            "username": "member13",
            "age": 13,
            "teamId": 2,
            "teamName": "teamB"
        },
        {
            "memberId": 15,
            "username": "member14",
            "age": 14,
            "teamId": 1,
            "teamName": "teamA"
        }
    ],
    "pageable": {
        "sort": {
            "empty": true,
            "sorted": false,
            "unsorted": true
        },
        "offset": 10,
        "pageNumber": 2,
        "pageSize": 5,
        "paged": true,
        "unpaged": false
    },
    "last": false,
    "totalPages": 20,
    "totalElements": 100,
    "first": false,
    "size": 5,
    "number": 2,
    "sort": {
        "empty": true,
        "sorted": false,
        "unsorted": true
    },
    "numberOfElements": 5,
    "empty": false
}
```

---

<br><br>

### 6) QueryDsl 페이징 연동 : 테스트 후 로그 확인 

##### a) 쿼리를 2번 날림

- select, count 쿼리 2번 
	- PostMan API URL : `http://localhost:8080/v4/members?size=5&page=2`
	
```java
2023-09-10T17:27:19.179+09:00 DEBUG 4503 --- [nio-8080-exec-6] org.hibernate.SQL                        : 
    select
        m1_0.member_id,
        m1_0.username,
        m1_0.age,
        m1_0.team_id,
        t1_0.name 
    from
        member m1_0 
    left join
        team t1_0 
            on t1_0.team_id=m1_0.team_id offset ? rows fetch first ? rows only
2023-09-10T17:27:19.183+09:00 TRACE 4503 --- [nio-8080-exec-6] org.hibernate.orm.jdbc.bind              : binding parameter [1] as [INTEGER] - [0]
2023-09-10T17:27:19.185+09:00 TRACE 4503 --- [nio-8080-exec-6] org.hibernate.orm.jdbc.bind              : binding parameter [2] as [INTEGER] - [10]
2023-09-10T17:27:19.207+09:00  INFO 4503 --- [nio-8080-exec-6] p6spy                                    : #1694334439207 | took 20ms | statement | connection 14| url jdbc:h2:tcp://localhost/~/querydsl
select m1_0.member_id,m1_0.username,m1_0.age,m1_0.team_id,t1_0.name from member m1_0 left join team t1_0 on t1_0.team_id=m1_0.team_id offset ? rows fetch first ? rows only
select m1_0.member_id,m1_0.username,m1_0.age,m1_0.team_id,t1_0.name from member m1_0 left join team t1_0 on t1_0.team_id=m1_0.team_id offset 0 rows fetch first 10 rows only;
2023-09-10T17:27:19.210+09:00 DEBUG 4503 --- [nio-8080-exec-6] org.hibernate.SQL                        : 
    select
        count(m1_0.member_id) 
    from
        member m1_0
2023-09-10T17:27:19.212+09:00  INFO 4503 --- [nio-8080-exec-6] p6spy                                    : #1694334439212 | took 0ms | statement | connection 14| url jdbc:h2:tcp://localhost/~/querydsl
select count(m1_0.member_id) from member m1_0
select count(m1_0.member_id) from member m1_0;
```

----

<br>

##### b) 쿼리를 1번 날림

- select 1번 : 쿼리 사이즈보다 조회 사이즈가 클 경우, count 쿼리를 조회하지 않는다.  
	- PostMan API URL : `http://localhost:8080/v4/members?size=200&page=0`

<br>
- 이것은 queryDSL에서 제공해주는 기능이다.

<br>

```java
2023-09-10T17:27:08.181+09:00 DEBUG 4503 --- [nio-8080-exec-4] org.hibernate.SQL                        : 
    select
        m1_0.member_id,
        m1_0.username,
        m1_0.age,
        m1_0.team_id,
        t1_0.name 
    from
        member m1_0 
    left join
        team t1_0 
            on t1_0.team_id=m1_0.team_id offset ? rows fetch first ? rows only
```


 

---

<br><br>

### 7) 스프링 데이터 JPA의 Sort를 Querydsl의 Sort로 변환

- Querydsl의 OrderSpecifier로 변환!

<br>

- 중요** : 정렬(Sort)은 조건이 조금만 복잡해져도 Pageable의 Sort 기능을 사용하기 어렵다. 루트 엔티티 범위(기본 엔티티 외의 Join까지 해야하는 경우를 넘어서는 경우)를 넘어가는 동적 정렬 기능이 필요하면 스프링 데이터 페이징이 제공하는 Sort 를 사용하기 보다는 파라미터를 받아서 직접 처리하는 것을 권장한다.

<br>

```java
JPAQuery<Member> query = queryFactory
	.selectFrom(member);

for (Sort.Order o : pageable.getSort()) {
	PathBuilder pathBuilder = new PathBuilder(member.getType(),
		member.getMetadata());	
		
		query.orderBy(new OrderSpecifier(o.isAscending() ? Order.ASC : Order.DESC,
		pathBuilder.get(o.getProperty())));
	}
	
List<Member> result = query.fetch();
```


---

<br><br>

# 8. 스프링 데이터 JPA가 제공하는 QueryDsl 기능

### 1) QuerydslPredicateExecutor 인터페이스 제공 

#### a. QuerydslPredicateExecutor 상속 받기

- 필요한 Repository에서 상속받아서 스프링 데이터 JPA가 제공하는 QueryDsl 기능을 사용하기

```java
interface UserRepository extends CrudRepository<User, Long>, QuerydslPredicateExecutor<User> {
}
```

---

<br>

#### b. 제공해주는 기능들

```java
public interface QuerydslPredicateExecutor<T> {

  Optional<T> findById(Predicate predicate);  

  Iterable<T> findAll(Predicate predicate);   

  long count(Predicate predicate);            

  boolean exists(Predicate predicate);        

  // … more functionality omitted.
}
```

<br>

```java
Iterable result = memberRepository.findAll(
	member.age.between(10, 40)
	.and(member.username.eq("member1"))
);
```

---

<br>

#### c. 한계점 

- 조인X (묵시적 조인은 가능하지만 left join이 불가능하다.)
	- 간단한 eq()정도만 가능

- 클라이언트가 Querydsl에 의존해야 한다. 서비스 클래스가 Querydsl이라는 구현 기술에 의존해야 한다.

- 참고: QuerydslPredicateExecutor는 Pagable, Sort를 모두 지원하고 정상 동작한다.

---

<br><br>

### 2) Querydsl Web 지원

#### a. 사용 방법 : 

- `@QuerydslPredicate(root = User.class)` : @QuerydslPredicate에 root class 설정

- `Predicate predicate` 파라미터 사용

- 커스텀 방법 : `bindings.bind`을 이용하여 복잡하게 커스텀한다.

---

<br>

#### b. 한계점 :

- 단순한 조건만 가능

- 조건을 커스텀하는 기능이 복잡하고 명시적이지 않음

- 컨트롤러가 Querydsl에 의존

---

<br>

#### c. 실습 코드 :

```java
@Controller
class UserController {

  @Autowired UserRepository repository;

  @RequestMapping(value = "/", method = RequestMethod.GET)
  String index(Model model, @QuerydslPredicate(root = User.class) Predicate predicate,    
          Pageable pageable, @RequestParam MultiValueMap<String, String> parameters) {

    model.addAttribute("users", repository.findAll(predicate, pageable));

    return "index";
  }
}
```

<br>

- 추가적으로 커스텀이 필요할 때, 다음과 같이 커스텀 사용

```java
interface UserRepository extends CrudRepository<User, String>,
                                 QuerydslPredicateExecutor<User>,                
                                 QuerydslBinderCustomizer<QUser> {               

  @Override
  default void customize(QuerydslBindings bindings, QUser user) {

    bindings.bind(user.username).first((path, value) -> path.contains(value))    
    bindings.bind(String.class)
      .first((StringPath path, String value) -> path.containsIgnoreCase(value)); 
    bindings.excluding(user.password);                                           
  }
}
```

---

<br><br>

### 3) QuerydslRepositorySupport


#### a. 개념 


- `QuerydslRepositorySupport`는 추상 클래스이라서 상속받아서 바로 사용하기
	- `super`()로 바로 받아서 사용하면, `JPAQueryFactory` 대신하여 빠르게 사용할 수 있다.

- entityManager가 필요하다면, entityManager를 바로 뽑아서 사용 가능

- `applyPagination()`은 쿼리에서 `offset()`과 `limit()`을 생략 가능하게 해준다.

---

<br>

#### b. 실습 코드 : EntityManager 주입 받는 방법 1 

```java

package com.study.querydsl.repository;

import com.querydsl.core.QueryResults;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.JPQLQuery;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.study.querydsl.dto.MemberSearchCondition;
import com.study.querydsl.dto.MemberTeamDto;
import com.study.querydsl.dto.QMemberTeamDto;
import com.study.querydsl.entity.Member;
import jakarta.persistence.EntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.support.QuerydslRepositorySupport;
import org.springframework.data.jpa.support.PageableUtils;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.stereotype.Repository;

import java.util.List;

import static com.study.querydsl.entity.QMember.member;
import static com.study.querydsl.entity.QTeam.team;
import static io.micrometer.common.util.StringUtils.isEmpty;


public class MemberRepositoryImpl extends QuerydslRepositorySupport implements MemberRepositoryCustom {

//    private final JPAQueryFactory queryFactory;

//    // 주입!
//    public MemberRepositoryImpl(EntityManager em) {
//        this.queryFactory = new JPAQueryFactory(em);
//    }

    public MemberRepositoryImpl() {
        super(Member.class);
    }

    public Page<MemberTeamDto> searchPageSimple2(MemberSearchCondition condition, Pageable pageable) {

        // entityManager가 필요하다면, entityManager를 바로 뽑아서 사용 가능
        EntityManager entityManager = getEntityManager();

        // applyPagination은 offset과 limit을 생략 가능하게 해준다.
        JPAQuery<MemberTeamDto> jpaQuery = (JPAQuery<MemberTeamDto>) from(member)
                .leftJoin(member.team, team)
                .where(
                        usernameEq(condition.getUsername()),
                        teamNameEq(condition.getTeamName()),
                        ageGoe(condition.getAgeGoe()),
                        ageLoe(condition.getAgeLoe())
                )
                .select(new QMemberTeamDto(
                        member.id.as("memberId"),
                        member.username,
                        member.age,
                        team.id.as("teamId"),
                        team.name.as("teamName")));

        JPQLQuery<MemberTeamDto> query = getQuerydsl().applyPagination(pageable, jpaQuery);
        List<MemberTeamDto> result = query.fetch();
//        query.fetchResults();

//        List<MemberTeamDto> content = results.getResults();
//        long total = results.getTotal();

        return new PageImpl<>(content, pageable, total);
    }
}
```

---

<br>

#### c. EntityManager 주입받는 방법 2

```java
public class MemberRepositoryImpl extends QuerydslRepositorySupport implements MemberRepositoryCustom {

    private final JPAQueryFactory queryFactory;

//    // 주입!
//    public MemberRepositoryImpl(EntityManager em) {
//        this.queryFactory = new JPAQueryFactory(em);
//    }

    public MemberRepositoryImpl(EntityManager entityManager) {
        super(Member.class);
        this.queryFactory = new JPAQueryFactory(em);
    }
}
```

<br>

---

#### d. 한계점

- select로 시작할 수 없음 (from으로 시작해야함)

- QueryFactory를 제공하지 않음

- 스프링 데이터 Sort 기능이 정상 동작하지 않음

- offset과 limit 빼려고 복잡한 과정이 필요하다.



---

<br><br>

### 4) Querydsl 지원 클래스 직접 만들기

- 스프링 데이터가 제공하는 페이징을 편리하게 변환

- 페이징과 카운트 쿼리 분리 가능

- 스프링 데이터 Sort 지원

- select() , selectFrom() 으로 시작 가능

- EntityManager , QueryFactory 제공


#### a. Querydsl4RepositorySupport 

- support 패키지에 Querydsl4RepositorySupport 파일 추가로 생성
	- 참고만하기 앞으로는 Querydsl5 버전 사용
 
```java
package com.study.querydsl.repository.support;
import com.querydsl.core.types.EntityPath;
import com.querydsl.core.types.Expression;
import com.querydsl.core.types.dsl.PathBuilder;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.support.JpaEntityInformation;
import org.springframework.data.jpa.repository.support.JpaEntityInformationSupport;
import org.springframework.data.jpa.repository.support.Querydsl;
import org.springframework.data.querydsl.SimpleEntityPathResolver;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.stereotype.Repository;
import org.springframework.util.Assert;

import java.util.List;
import java.util.function.Function;
/**
 * Querydsl 4.x 버전에 맞춘 Querydsl 지원 라이브러리
 *
 * @author Younghan Kim
 * @see
org.springframework.data.jpa.repository.support.QuerydslRepositorySupport
 */
@Repository
public abstract class Querydsl4RepositorySupport {
    private final Class domainClass;
    private Querydsl querydsl;
    private EntityManager entityManager;
    private JPAQueryFactory queryFactory;
    public Querydsl4RepositorySupport(Class<?> domainClass) {
        Assert.notNull(domainClass, "Domain class must not be null!");
        this.domainClass = domainClass;
    }
    @Autowired
    public void setEntityManager(EntityManager entityManager) {
        Assert.notNull(entityManager, "EntityManager must not be null!");
        JpaEntityInformation entityInformation =
                JpaEntityInformationSupport.getEntityInformation(domainClass, entityManager);
        SimpleEntityPathResolver resolver = SimpleEntityPathResolver.INSTANCE;
        EntityPath path = resolver.createPath(entityInformation.getJavaType());
        this.entityManager = entityManager;
        this.querydsl = new Querydsl(entityManager, new
                PathBuilder<>(path.getType(), path.getMetadata()));
        this.queryFactory = new JPAQueryFactory(entityManager);
    }
    @PostConstruct
    public void validate() {
        Assert.notNull(entityManager, "EntityManager must not be null!");
        Assert.notNull(querydsl, "Querydsl must not be null!");
        Assert.notNull(queryFactory, "QueryFactory must not be null!");
    }
    protected JPAQueryFactory getQueryFactory() {
        return queryFactory;
    }
    protected Querydsl getQuerydsl() {
        return querydsl;
    }
    protected EntityManager getEntityManager() {
        return entityManager;
    }
    protected <T> JPAQuery<T> select(Expression<T> expr) {
        return getQueryFactory().select(expr);
    }
    protected <T> JPAQuery<T> selectFrom(EntityPath<T> from) {
        return getQueryFactory().selectFrom(from);
    }
    protected <T> Page<T> applyPagination(Pageable pageable,
                                          Function<JPAQueryFactory, JPAQuery> contentQuery) {
        JPAQuery jpaQuery = contentQuery.apply(getQueryFactory());
        List<T> content = getQuerydsl().applyPagination(pageable,
                jpaQuery).fetch();
        return PageableExecutionUtils.getPage(content, pageable,
                jpaQuery::fetchCount);
    }
    protected <T> Page<T> applyPagination(Pageable pageable,
                                          Function<JPAQueryFactory, JPAQuery> contentQuery, Function<JPAQueryFactory,
            JPAQuery> countQuery) {
        JPAQuery jpaContentQuery = contentQuery.apply(getQueryFactory());
        List<T> content = getQuerydsl().applyPagination(pageable,
                jpaContentQuery).fetch();
        JPAQuery countResult = countQuery.apply(getQueryFactory());
        return PageableExecutionUtils.getPage(content, pageable,
                countResult::fetchCount);
    }
}
```


#### b. Querydsl4RepositorySupport 사용 코드

```java 
package com.study.querydsl.repository;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQuery;
import com.study.querydsl.repository.support.Querydsl4RepositorySupport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.stereotype.Repository;
import com.study.querydsl.dto.MemberSearchCondition;
import com.study.querydsl.entity.Member;
import com.study.querydsl.repository.support.Querydsl4RepositorySupport;
import java.util.List;
import static org.springframework.util.StringUtils.isEmpty;
import static com.study.querydsl.entity.QMember.member;
import static com.study.querydsl.entity.QTeam.team;

@Repository
public class MemberTestRepository extends Querydsl4RepositorySupport {

    public MemberTestRepository() {
        super(Member.class);
    }

    public List<Member> basicSelect() {
        return select(member)
                .from(member)
                .fetch();
    }

    public List<Member> basicSelectFrom() {
        return selectFrom(member)
                .fetch();
    }

    public Page<Member> searchPageByApplyPage(MemberSearchCondition condition
            , Pageable pageable) {

        JPAQuery<Member> query = selectFrom(member)
                .leftJoin(member.team, team)
                .where(usernameEq(condition.getUsername()),
                        teamNameEq(condition.getTeamName()),
                        ageGoe(condition.getAgeGoe()),
                        ageLoe(condition.getAgeLoe()));

        List<Member> content = getQuerydsl().applyPagination(pageable, query)
                .fetch();

        return PageableExecutionUtils.getPage(content, pageable, query::fetchCount);
    }

    public Page<Member> applyPagination(MemberSearchCondition condition,
                                        Pageable pageable) {
        return applyPagination(pageable, contentQuery -> contentQuery
                .selectFrom(member)
                .leftJoin(member.team, team)
                .where(usernameEq(condition.getUsername()),
                        teamNameEq(condition.getTeamName()),
                        ageGoe(condition.getAgeGoe()),
                        ageLoe(condition.getAgeLoe())));
    }

    public Page<Member> applyPagination2(MemberSearchCondition condition,
                                         Pageable pageable) {
        return applyPagination(pageable, contentQuery -> contentQuery
                        .selectFrom(member)
                        .leftJoin(member.team, team)
                        .where(usernameEq(condition.getUsername()),
                                teamNameEq(condition.getTeamName()),
                                ageGoe(condition.getAgeGoe()),
                                ageLoe(condition.getAgeLoe())),
                countQuery -> countQuery
                        .selectFrom(member)
                        .leftJoin(member.team, team)
                        .where(usernameEq(condition.getUsername()),
                                teamNameEq(condition.getTeamName()),
                                ageGoe(condition.getAgeGoe()),
                                ageLoe(condition.getAgeLoe()))
        );
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

<br><br>

### 5) 스프링 부트 2.6 이상, Querydsl 5.0 지원 방법

##### a) build.gradle 설정

- JUnit5 사용 방법 : exclude group: 'org.junit.vintage', module: 'junit-vintage-engine' 제거하기

```gradle
buildscript {
	ext {
		queryDslVersion = "5.0.0"
	}
}

plugins {
	id 'org.springframework.boot' version '2.6.2'
	id 'io.spring.dependency-management' version '1.0.11.RELEASE'
	//querydsl 추가
	id "com.ewerk.gradle.plugins.querydsl" version "1.0.10"
	id 'java'
}

group = 'com.example'
version = '0.0.1-SNAPSHOT'
sourceCompatibility = '11'
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
	//querydsl 추가
	implementation "com.querydsl:querydsl-jpa:${queryDslVersion}"
	annotationProcessor "com.querydsl:querydsl-apt:${queryDslVersion}"
	compileOnly 'org.projectlombok:lombok'
	runtimeOnly 'com.h2database:h2'
	annotationProcessor 'org.projectlombok:lombok'
	//테스트에서 lombok 사용
	testCompileOnly 'org.projectlombok:lombok'
	testAnnotationProcessor 'org.projectlombok:lombok'
	
	testImplementation('org.springframework.boot:spring-boot-starter-test') {
		exclude group: 'org.junit.vintage', module: 'junit-vintage-engine'
	}
}

test {
	useJUnitPlatform()
}
//querydsl 추가 시작
def querydslDir = "$buildDir/generated/querydsl"

querydsl {
	jpa = true
	querydslSourcesDir = querydslDir
}

sourceSets {
	main.java.srcDir querydslDir
}

configurations {
	querydsl.extendsFrom compileClasspath
}

compileQuerydsl {
	options.annotationProcessorPath = configurations.querydsl
}
//querydsl 추가 끝
```


---

<br><br>

##### b) 수정된 count 쿼리

- Querydsl fetchResults() , fetchCount() Deprecated(향후 미지원)

- count(*) : 주석처럼 Wildcard.count를 사용

```java
@Test
public void count() {
	Long totalCount = queryFactory
		//.select(Wildcard.count) //select count(*)
		.select(member.count()) //select count(member.id)
		.from(member)
		.fetchOne();
		
	System.out.println("totalCount = " + totalCount);
}
```

---

<br><br>


##### c) 수정된 searchPageComplex

- PageableExecutionUtils Deprecated(향후 미지원) 패키지 변경
	- 사용 패키지 위치가 변경
	
<br>
	
- 기존: `org.springframework.data.repository.support.PageableExecutionUtils`

- 신규: `org.springframework.data.support.PageableExecutionUtils`

<br>
	
	
```java
import org.springframework.data.support.PageableExecutionUtils; //패키지 변경

public Page<MemberTeamDto> searchPageComplex(MemberSearchCondition condition,
Pageable pageable) {
	List<MemberTeamDto> content = queryFactory
		.select(new QMemberTeamDto(
			member.id.as("memberId"),
			member.username,
			member.age,
			team.id.as("teamId"),
			team.name.as("teamName")))
		.from(member)
		.leftJoin(member.team, team)
		.where(
			usernameEq(condition.getUsername()),
			teamNameEq(condition.getTeamName()),
			ageGoe(condition.getAgeGoe()),
			ageLoe(condition.getAgeLoe())
		)
		.offset(pageable.getOffset())
		.limit(pageable.getPageSize())
		.fetch();
		
	JPAQuery<Long> countQuery = queryFactory
		.select(member.count())
		.from(member)
		.leftJoin(member.team, team)
		.where(
			usernameEq(condition.getUsername()),
			teamNameEq(condition.getTeamName()),
			ageGoe(condition.getAgeGoe()),
			ageLoe(condition.getAgeLoe())
		);
			
	return PageableExecutionUtils.getPage(content, pageable, countQuery::fetchOne);
}
```








