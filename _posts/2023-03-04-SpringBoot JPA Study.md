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









