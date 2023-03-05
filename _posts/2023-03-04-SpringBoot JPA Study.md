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
	
### 1) HikariCP
  
- HikariCP라는 커넥션 풀이 스프링 2.x 버전부터는 기본이다. 스레드로서 속도가 빠르다. 커넥션 풀이라는 것이 스레드를 미리 만들어놓고 나눠줘서 네트워크 속도가 빠르다.


<br>

### 2) SLF4J

- 로깅을 통합한 인터페이스로서 로깅에 필요한 경우에 쓰인다. JPA에서 자동화 기능 때문에 DB에 접속 시, 접속이 되었는지 직접적으로 확인을 하지 못하여 SQL문에 대한 로그 확인 시 필요!

- 보통, lf4j를 플러그인으로 꽂아서 사용하기도 하고 다른 플러그인도 꽂아서 사용한다.

- `log.info()`처럼 사용하고 다른 종류의 log 메서드도 있다. 

```java

   @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        log.info("payload{}", payload);

        ChatMessage chatMessage = objectMapper.readValue(payload, ChatMessage.class);
        ChatRoom room = chatService.findRoomById(chatMessage.getRoomId());
        room.handleActions(session, chatMessage, chatService);
    x}

```








