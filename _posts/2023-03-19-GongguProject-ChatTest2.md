---
key: /2023/03/19/GongguProject-ChatTest2.html
title: Project - 채팅 기능 테스트 2
tags: springboot websocket HTTP Lombok Builder Enum vue
---

# 1. 채팅 기능 1 : 230319

- mariaDB, STOMP, JPA, Mybatis, thymeleaf, ajax

<br>
- 실습 코드 : 

<br>

<details>
<summary>SpringConfig.java</summary>
<div markdown="1">


```java
package com.socketjs.chat.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
@Configuration
@EnableWebSocketMessageBroker
public class SpringConfig implements WebSocketMessageBrokerConfigurer {

    // 웹 소켓 연결을 위한 엔드 포인트 설정 및 stomp에서 sub와 pub라고 엔드포인트 설정
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-stomp")   // 연결될 엔드포인트
                .withSockJS();  // SocketJS를 연결한다는 설정
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {

        // 메세지를 구독하는 요청 url(= 즉 메세지 받을 때)
        registry.enableSimpleBroker("/sub");

        // 메세지를 발행하는 요청 url(= 메세지를 보낼 때)
        registry.setApplicationDestinationPrefixes("/pub");
    }
}

```

</div>
</details>



<br>

<details>
<summary>ChatRoomDTO.java</summary>
<div markdown="1">

```java
package com.socketjs.chat.dto;


import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.HashMap;

// 핵심 :
// Stomp를 통해 pub과 sub를 사용하면, 구독자 관리가 알아서 된다!!
// 따라서, 따로 세션 관리를 하는 코드를 작성할 필요도 없고,
// 메세지를 다른 세션의 클라이언트에게 발송하는 것도 구현할 필요가 없다.
@Data
@Builder
@Getter
@Setter
public class ChatRoomDTO {
    private String roomId; // 채팅방 아이디
    private String roomName; // 채팅방 이름
    private int userCount;  // 채팅방 인원수
    private int maxUserCnt; // 채팅방 최대 인원 수
    private String roomPwd; // 채팅방 삭제시 필요할 pwd
    private boolean secretChk;  // 채팅방 잠금 여부

    private HashMap<String, String> userList;
}

```

</div>
</details>




<br>

<details>
<summary>ChatDTO.java</summary>
<div markdown="1">

```java
package com.socketjs.chat.dto;

import jdk.jfr.DataAmount;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ChatDTO {

    // 중요!!
    // 메세지 타입을 enum 클래스로 상수 열거형으로 설정!
    // 메세지 타입에 따라서 동작하는 구조가 달라진다!!
    public enum MessageType{
        ENTER, TALK, LEAVE;
    }

    private MessageType type; // 메세지 타입
    private String roomId;  // 방 번호
    private String sender;  // 채팅을 보낸 사람
    private String message; // 메세지
    private String time;    // 채팅 발송 시간

}

```

</div>
</details>

<br>

<details>
<summary>ChatRepository.java</summary>
<div markdown="1">

```java
package com.socketjs.chat.dao;

import com.socketjs.chat.dto.ChatRoomDTO;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.util.*;

// 보통 전체 조회, 생성, 수정, 세부 조회, 삭제로 설계한다.
@Repository
@Slf4j
public class ChatRepository {

    private Map<String, ChatRoomDTO> chatRoomMap;

    // 생성자 1번만 초기화(채팅방 정보와 관련되는 곳이라서 채팅방이 매번 업데이트되면 안되어서)
    @PostConstruct
    private void init() {
        // 그냥 HashMap보다 순서가 정해져 있어서 성능이 약간 더 빠르다.
        // 하지만, 티는 잘 안난다.
        chatRoomMap = new LinkedHashMap<>();
    }

    // 채팅방 삭제에 따른 채팅방의 사진 삭제를 위한 fileService 선언
    // 아직 생략!


    // 전체 채팅방 조회!
    // DTO는 대부분 List로 받는다.
    public List<ChatRoomDTO> finAllRoom(){

        // 채팅방 순서를 최근 순서로 반환
        List chatRooms = new ArrayList<>(chatRoomMap.values());
        Collections.reverse(chatRooms); // 최근 순이라서 뒤집어서 반환

        return chatRooms;
    }

    // roomId 기준으로 채팅방 찾기!!
    // Id만 찾으면 되어서 반환값도 List가 아니라 그냥 일반 DTO 객체의 값 형태로 받는다.
    public ChatRoomDTO findRoomById(String roomId) {
        return chatRoomMap.get(roomId);
    }

    // roomName 기준으로 채팅방 만들기
    // 추가로 방 비밀번호(방 지울 때 비번), 채팅방 잠글지 여부, 방 참여의 인원수 제한
    public ChatRoomDTO createChatRoom(String roomName, String roomPwd, boolean secretChk, int maxUserCnt) {

        // @Builder로 생성
        ChatRoomDTO chatRoomDTO = ChatRoomDTO.builder()
                .roomId(UUID.randomUUID().toString())
                .roomName(roomName)
                .roomPwd(roomPwd)   // 채팅방 지울 때, 패스워드
                .secretChk(secretChk)  // 채팅방 잠금 여부
                .userList(new HashMap<String, String>())
                .maxUserCnt(maxUserCnt) // 최대 인원수 제한
                .build();

        // 위의 build된 정보로 Map 객체의 put 메서드로 채팅방을 진짜로 생성!!
        // (key, value 필요)
        chatRoomMap.put(chatRoomDTO.getRoomId(), chatRoomDTO);

        return chatRoomDTO;
    }

    // 채팅방 인원 + 1
    public void plusUserCnt(String roomId){
        ChatRoomDTO room = chatRoomMap.get(roomId);
        room.setUserCount(room.getUserCount() + 1);
    }

    // 채팅방 인원 - 1
    public void minusUserCnt(String roomId){
        ChatRoomDTO room = chatRoomMap.get(roomId);
        room.setUserCount(room.getUserCount() - 1);
    }

    // maxUserCnt에 따른 채팅방 입장 여부
    public boolean chkRoomUserCnt(String roomId){
        ChatRoomDTO room = chatRoomMap.get(roomId);

        log.info("참여 인원 [{} {}]", room.getUserCount(), room.getMaxUserCnt());

        if(room.getUserCount() >= room.getMaxUserCnt()){
            return false;
        }
        return true;
    }

    // 해당 채팅방에 유저 추가
    public String addUser(String roomId, String userName){
        ChatRoomDTO room = chatRoomMap.get(roomId);
        String userUUID = UUID.randomUUID().toString();

        // 아이디 중복 확인 후 userList에 추가
        room.getUserList().put(userUUID, userName);

        return userUUID;
    }

    // 채팅방 유저 이름 중복 확인!!
    // 사실 이거 필요 없어도 되는데... 아닌가?
    public String isDuplicateName(String roomId, String username){
        ChatRoomDTO room = chatRoomMap.get(roomId);
        String tmp = username;

        // 같은 방에 이름이 같은 사람이 있으면 중복 처리를 해주는 로직이다!!
        while(room.getUserList().containsValue(tmp)){
            int ranNum = (int) (Math.random()*100) + 1; // 1~100 랜덤 숫자
            tmp = username + ranNum;
        }

        return tmp;
    }

    // 채팅방 유저 리스트 삭제
    public void delUser(String roomId, String userUUID){

        ChatRoomDTO room = chatRoomMap.get(roomId);
        room.getUserList().remove(userUUID);

        // 유저 리스트 삭제는 목록이라서 List 객체에서 remove 메서드로 삭제
        // 채팅방 삭제는 Map 객체이지만 똑가티 나중에 remove 메서드로 삭제
        // 추가로 예외 처리해주기!!(에러 방지)
    }


    // 채팅방 전체 userName 조회
    public String getUserName(String roomId, String userUUID){
        ChatRoomDTO room = chatRoomMap.get(roomId);
        return room.getUserList().get(userUUID);
    }

    // 채팅방 전체 userList 조회
    public ArrayList<String> getUserList(String roomId){
        ArrayList<String> list = new ArrayList<>();
        ChatRoomDTO room = chatRoomMap.get(roomId);

        // HashMap인 room을 for문을 돌리고 value만 뽑아낸다.
        // ArrayList인 list에 add로 저장 후 return
        room.getUserList().forEach((key, value)-> list.add(value));

        return list;
    }

    // 채팅방 비밀번호 조회
    public boolean confirmPwd(String roomId, String roomPwd) {
        return roomPwd.equals(chatRoomMap.get(roomId).getRoomPwd());
    }

    public void delChatRoom(String roomId){

        try {
            chatRoomMap.remove(roomId);
            // 파일 추가 기능 있으면  파일 삭제도 되어야함..

            log.info("삭제 완료 roomId: {}", roomId);

        } catch (Exception e){
            System.out.println(e.getMessage());
        }

    }
}

```

</div>
</details>


<br>

<details>
<summary>ChatRoomControlller.java</summary>
<div markdown="1">

```java
package com.socketjs.chat.controller;

import com.socketjs.chat.dao.ChatRepository;
import com.socketjs.chat.dto.ChatRoomDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

// 컨트롤단이 가장 어렵다!!**
@Controller
@Slf4j
public class ChatRoomController {

    @Autowired
    private ChatRepository chatRepository;

    // 채팅 리스트 화면
    // / 로 요청이 들어오면 전체 채팅룸 리스트를 담아서 return

    // 스프링 시큐리티는 나중에 구현!!
    // 스프링 시큐리티의 로그인 유저 정보는 Security 세션의 PrincipalDetails 안에 담긴다
    // 정확히는 PrincipalDetails 안에 ChatUser 객체가 담기고, 이것을 가져오면 된다.
    @GetMapping("/")
    public String getChatRoom(Model model){

        model.addAttribute("list", chatRepository.finAllRoom());

        // 스프링 시큐리티는 나중에 구현!!
//        if(principalDetails != null){
//            model.addAttribute("user",principalDetails.getUser());
//        }

        log.info("SHOW ALL ChatList {}", chatRepository.finAllRoom());

        return "roomlist";  // roomlist.html일 예정?
    }

    // 채팅방 생성
    // 채팅방 생성 후 다시 /로 return
    // 인자에 redirectAttr을 넣을 수 있다.(중요!!), addFlashAttribute 공부하기!!
    @PostMapping("/chat/createroom")
    public String createRoom(@RequestParam("roomName") String name, @RequestParam("roomPwd") String roomPwd, @RequestParam("secretChk") String secretChk,
                             @RequestParam(value = "maxUserCnt", defaultValue = "100") String maxUserCnt, RedirectAttributes rttr){

        ChatRoomDTO room = chatRepository.createChatRoom(name,roomPwd,Boolean.parseBoolean(secretChk), Integer.parseInt(maxUserCnt));

        log.info("Create Chat Room [{}]", room);

        // addFlashAttribute의 경우에는 flash 속성에 객체를 저장할 수 있다는 것입니다
        // 이는 요청 매개 변수(requestparameters)로 값을 전달하지않고 객체로 값을 그대로 전달하게됩니다.
        // 그리고 addFlashAttribute는 일회성으로 한번 사용하면 Redirect후 값이 소멸됩니다.
        // addAttribute는 값을 지속적으로 사용해야할 때 사용, addFlashAttribute는 일회성으로 사용해야할때 사용해야 합니다.
        rttr.addFlashAttribute("roomName",room);

        return "redirect:/";
    }

    // 채팅방 입장 화면
    // 파라미터로 넘어오는 roomId를 확인 후 해당 roomId를 기준으로 채팅방을 찾아서
    // 클라이언트를 해당 chatroom으로 보낸다.
    // 나중에 스프링 시큐리티 추가!**
    @GetMapping("/chat/room")
    public String roomDetail(Model model, String roomId){
        log.info("roomId {}", roomId);

        model.addAttribute("room", chatRepository.findRoomById(roomId));
        return "chatroom";  // chatroom.html일 예정?
    }

    // @PathVariable는 보통 비밀번호를 재확인하거나 채팅방을 지울 때, 사용하네..
    // Id가 존재하는 것을 DB에서 가져와서 업무에서 확인할 때!!
    // 비밀번호를 재확인 요청을 받아서(@PostMapping, @PathVariable 이용)**
    @PostMapping("/chat/confirmPwd/{roomId}")
    @ResponseBody
    public boolean confirmPwd(@PathVariable String roomId, @RequestParam String roomPwd){

        // 넘어온 roomID와 roomPwd를 이용하여 비밀번호 찾기
        // 찾아서 입력받은 roomPwd와 roomppwd와 비교해서 맞으면 true, 아니면 false
        return chatRepository.confirmPwd(roomId, roomPwd);
    }

    // 채팅방 삭제를 view 단에 출력(@GetMapping, @PathVariable 이용)**
    @GetMapping("")
    public String delChatRoom(@PathVariable String roomId){
        chatRepository.delChatRoom(roomId);
        return "redirect:/";
    }
    // 채팅방 인원수 체크를 view 단에 출력(@GetMapping, @PathVariable 이용)**
    @GetMapping("/chat/chkUserCnt/{roomId}")
    @ResponseBody
    public boolean chkUser(@PathVariable String roomdId){
        return chatRepository.chkRoomUserCnt(roomdId);
    }
}

```

</div>
</details>



<br>

<details>
<summary>ChatControlller.java</summary>
<div markdown="1">

```java
package com.socketjs.chat.controller;

import com.socketjs.chat.dao.ChatRepository;
import com.socketjs.chat.dto.ChatDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.ArrayList;

@Slf4j
@RequiredArgsConstructor
@Controller
public class ChatController {

    // 중요!!****
    // 아래 코드에서 사용되는 ConvertAndSend를 사용하기 위해서 미리 선언해준다.
    // ConvertAndSend는 채팅 관련 객체를 인자로 넘겨주면
    // 자동으로 Message 객체로 변환 후 도착지로 전송한다!!!
    private final SimpMessageSendingOperations template;

    @Autowired
    ChatRepository repository;

    // MessageMapping을 통해 webSocket로 들어오는 메세지를 발신 처리한다.
    // 이때 클라이언트에서는 /pub/chat/message로 요청하게 되고 이것을 controller가 받아서 처리한다.
    // 처리가 완료되면 /sub/chat/roomId로 메세지가 전송된다.
    // 실시간 해당 유저!!의 정보를 알려준다!!**
    @MessageMapping("/chat/enterUser")
    public void enterUser(@Payload ChatDTO chat, SimpMessageHeaderAccessor headerAccessor){

        // Enter로 들어오면 채팅방의 유저수가 +1 된다.
        repository.plusUserCnt(chat.getRoomId());

        // 채팅방에 유저 추가 및 UserUUID 반환
        String userUUID = repository.addUser(chat.getRoomId(), chat.getSender());

        // 반환 결과를 socket session에 userUUID, roomId로 저장해서
        // 업무 로직에 사용할 수 있다. 보통 header에 저장!!
        headerAccessor.getSessionAttributes().put("userUUID", userUUID);
        headerAccessor.getSessionAttributes().put("roomId", chat.getRoomId());

        chat.setMessage(chat.getSender() + "님이 입장!!");
        template.convertAndSend("/sub/chat/room" + chat.getRoomId(), chat);
    }

    // MessageMapping을 통해 webSocket로 들어오는 메세지를 발신 처리한다.
    // 이때 클라이언트에서는 /pub/chat/message로 요청하게 되고 이것을 controller가 받아서 처리한다.
    // 처리가 완료되면 /sub/chat/roomId로 메세지가 전송된다.
    // 실시간 실제 채팅 내용이다!!**
    @MessageMapping("/chat/sendMessage")
    public void sendMessage(@Payload ChatDTO chat){
        log.info("CHAT {}", chat);
        chat.setMessage(chat.getMessage());
        template.convertAndSend("/sub/chat/room/" + chat.getMessage(), chat);
    }

    // 유저 퇴장 시에 eventListener을 통해서 유저 퇴장을 확인
    @EventListener
    public void webSocketDisconnectListener(SessionDisconnectEvent event) {
        log.info("DisConnEvent {}", event);

        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());

        // Stomp 세션에 저장되어 있던 userUUID, roomID를 확인해서
        // 채팅방 유저 리스트와 room에서 해당 유저를 삭제
        String userUUID = (String) headerAccessor.getSessionAttributes().get("userUUID");
        String roomId = (String) headerAccessor.getSessionAttributes().get("roomID");

        log.info("headerAcceser {}", headerAccessor);

        // 유저 퇴장 시, 그 유저를 채팅방에서 삭제해서 채팅방 유저수는 -1 된다.
        repository.minusUserCnt(roomId);

        // 채팅방 유저 리스트에서 UUID 유저 닉네임 조회 및 리스트에서 유저 삭제!
        // 전부 삭제해줘야 한다...
        String userName = repository.getUserName(roomId, userUUID);
        repository.delUser(roomId, userUUID);

        if (userName != null) {
            log.info("User Disconnected : " + userName);

            // builder 어노테이션 활용
            ChatDTO chat = ChatDTO.builder()
                    .type(ChatDTO.MessageType.LEAVE)
                    .sender(userName)
                    .message(userName + "님 퇴장!!")
                    .build();

            template.convertAndSend("/sub/chat/room/" + roomId, chat);
        }
    }

    // 채팅에 참여한 유저 리스트 반환
    @GetMapping("/chat/userList")
    @ResponseBody
    public ArrayList<String> userList(String roomId){
        return repository.getUserList(roomId);
    }

    // 채팅에 참여한 유저 닉네임 중복 확인
    // username인지 userName인지 구분!! 중복 검사라서!!
    @GetMapping("/chat/duplicateName")
    @ResponseBody
    public String isDuplicateName(@RequestParam("roomId") String roomId, @RequestParam("username") String username) {
        String userName = repository.isDuplicateName(roomId, username);
        log.info("동작 확인 {}", userName);

        return userName;
    }



}

```

</div>
</details>




<br>

<details>
<summary>chatroom.html</summary>
<div markdown="1">

```java
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css"
          integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
    <script src="https://code.jquery.com/jquery-3.6.1.min.js" integrity="sha256-o88AwQnZB+VDvE9tvIXrMQaPlFFSUTR+nldQm1LuPXQ=" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js" integrity="sha384-wHAiFfRlMFy6i5SRaxvfOCifBUQy1xHdJ/yoi7FRNXMRBu5WHdZYu1hA6ZOblgut" crossorigin="anonymous"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js" integrity="sha384-B0UglyR+jN6CkvvICOB2joaf5I4l3gm9GU6Hc1og6Ls7i6U/mkkaduKaBhlAXv9k" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">

    <title>My Spring WebSocket Chatting</title>
    <link rel="stylesheet" href="/css/chatroom/main.css"/>
    <style>
        #menu{
            width: 310px;
        }
        button#uploadFile {
            margin-left: 225px;
            margin-top: -55px;
        }
        input {
            padding-left: 5px;
            outline: none;
            width: 250px;
            margin-top: 15px;
        }
        .btn fa fa-download {
            background-color: DodgerBlue;
            border: none;
            color: white;
            padding: 12px 30px;
            cursor: pointer;
            font-size: 20px;
        }

        .input-group{width:80.5%}
        .chat-container{position: relative;}
        .chat-container .btn-group{position:absolute; bottom:-12px; right:-50px; transform: translate(-50%,-50%);}
    </style>
</head>
<body>
<noscript>
    <h2>Sorry! Your browser doesn't support Javascript</h2>
</noscript>


<div id="username-page">
    <div class="username-page-container">
        <h1 class="title">Type your username</h1>
        <form id="usernameForm" name="usernameForm">
            <div  th:if="${user == null}" class="form-group">
                <input type="text" id="name" placeholder="Username" autocomplete="off" class="form-control"/>
            </div>
            <div  th:if="${user != null}" class="form-group">
                <input type="text" id="name" placeholder="Username" autocomplete="off" class="form-control" th:value="${user.nickName}"/>
            </div>
            <div class="form-group">
                <button type="submit" class="accent username-submit">Start Chatting</button>
            </div>
        </form>
    </div>
</div>


<div id="chat-page" class="hidden">
    <div class="btn-group dropend">
        <button class="btn btn-secondary dropdown-toggle" type="button" id="showUserListButton" data-toggle="dropdown"
                aria-haspopup="true" aria-expanded="false">
            참가한 유저
        </button>
        <div id="list" class="dropdown-menu" aria-labelledby="showUserListButton">

        </div>
    </div>
    <div class="chat-container">
        <div class="chat-header">
            <h2>[[${room.roomName}]]</h2>
        </div>
        <div class="connecting">
            Connecting...
        </div>
        <ul id="messageArea">

        </ul>
        <form id="messageForm" name="messageForm" nameForm="messageForm">
            <div class="form-group">
                <div class="input-group clearfix">
                    <input type="text" id="message" placeholder="Type a message..." autocomplete="off"
                           class="form-control"/>
                    <button type="submit" class="primary">Send</button>
                </div>
            </div>
        </form>

        <div class="btn-group dropend">
            <button class="btn btn-secondary dropdown-toggle" type="button" id="showMenu" data-toggle="dropdown"
                    aria-haspopup="true" aria-expanded="false">
                파일 업로드
            </button>
            <div id="menu" class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                <input type="file" id="file">
                <button type="button" class="btn btn-primary" id="uploadFile" onclick="uploadFile()">저장</button>

            </div>
        </div>
    </div>

</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/sockjs-client/1.1.4/sockjs.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/stomp.js/2.3.3/stomp.min.js"></script>
<script src="/js/chatroom/socket.js"></script>
</body>
</html>
```

</div>
</details>



<br>

<details>
<summary>roomlist.html</summary>
<div markdown="1">

```java
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"
          integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=" crossorigin="anonymous"></script>
  <!-- CSS only -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
  <!-- JavaScript Bundle with Popper -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-A3rJD856KowSb7dwlZdYEkO39Gagi7vIsF0jrRAoQmDKKtQBHUuLZ9AsSv4jD4Xa"
          crossorigin="anonymous"></script>

  <link rel="stylesheet"
        href="https://use.fontawesome.com/releases/v5.1.0/css/all.css"
        integrity="sha384-lKuwvrZot6UHsBSfcMvOkWwlCMgc0TaWr+30HWe3a4ltaBwTZhyTEggF5tJv8tbt"
        crossorigin="anonymous">
  <script src="/js/roomlist/bootstrap-show-password.min.js"></script>
  <script th:inline="javascript">

        let roomId;

        $(function(){
            let $maxChk = $("#maxChk");
            let $maxUserCnt = $("#maxUserCnt");

            // 모달창 열릴 때 이벤트 처리 => roomId 가져오기
            $("#enterRoomModal").on("show.bs.modal", function (event) {
                roomId = $(event.relatedTarget).data('id');
                // console.log("roomId: " + roomId);

            });

            $("#confirmPwdModal").on("show.bs.modal", function (e) {
                roomId = $(e.relatedTarget).data('id');
                // console.log("roomId: " + roomId);

            });

            // 채팅방 설정 시 비밀번호 확인 - keyup 펑션 활용
            $("#confirmPwd").on("keyup", function(){
                let $confirmPwd = $("#confirmPwd").val();
                const $configRoomBtn = $("#configRoomBtn");
                let $confirmLabel = $("#confirmLabel");

                $.ajax({
                    type : "post",
                    url : "/chat/confirmPwd/"+roomId,
                    data : {
                        "roomPwd" : $confirmPwd
                    },
                    success : function(result){
                        // console.log("동작완료")

                        // result 의 결과에 따라서 아래 내용 실행
                        if(result){ // true 일때는
                            // $configRoomBtn 를 활성화 상태로 만들고 비밀번호 확인 완료를 출력
                            $configRoomBtn.attr("class", "btn btn-primary");
                            $configRoomBtn.attr("aria-disabled", false);

                            $confirmLabel.html("<span id='confirm'>비밀번호 확인 완료</span>");
                            $("#confirm").css({
                                "color" : "#0D6EFD",
                                "font-weight" : "bold",
                            });

                        }else{ // false 일때는
                            // $configRoomBtn 를 비활성화 상태로 만들고 비밀번호가 틀립니다 문구를 출력
                            $configRoomBtn.attr("class", "btn btn-primary disabled");
                            $configRoomBtn.attr("aria-disabled", true);

                            $confirmLabel.html("<span id='confirm'>비밀번호가 틀립니다</span>");
                            $("#confirm").css({
                                "color" : "#FA3E3E",
                                "font-weight" : "bold",
                            });

                        }
                    }
                })
            })

            // 기본은 유저 설정 칸 미활성화
            $maxUserCnt.hide();

            // 체크박스 체크에 따라 인원 설정칸 활성화 여부
            $maxChk.change(function(){
                if($maxChk.is(':checked')){
                    $maxUserCnt.val('');
                    $maxUserCnt.show();
                }else{
                    $maxUserCnt.hide();
                }
            })

        })


        // 채팅방 생성
        function createRoom() {

            let name = $("#roomName").val();
            let pwd = $("#roomPwd").val();
            let secret = $("#secret").is(':checked');
            let secretChk = $("#secretChk");
            let $maxUserCnt = $("#maxUserCnt");

            // console.log("name : " + name);
            // console.log("pwd : " + pwd);

            if (name === "") {
                alert("방 이름은 필수입니다")
                return false;
            }
            if ($("#" + name).length > 0) {
                alert("이미 존재하는 방입니다")
                return false;
            }
            if (pwd === "") {
                alert("비밀번호는 필수입니다")
                return false;
            }

            // 최소 방 인원 수는 2
            if($maxUserCnt.val() <= 1){
                alert("혼자서는 채팅이 불가능해요ㅠ.ㅠ");
                return false;
            }

            if (secret) {
                secretChk.attr('value', true);
            } else {
                secretChk.attr('value', false);
            }

            return true;
        }

        // 채팅방 입장 시 비밀번호 확인
        function enterRoom(){
            let $enterPwd = $("#enterPwd").val();

            $.ajax({
                type : "post",
                url : "/chat/confirmPwd/"+roomId,
                async : false,
                data : {
                    "roomPwd" : $enterPwd
                },
                success : function(result){
                    // console.log("동작완료")
                    // console.log("확인 : "+chkRoomUserCnt(roomId))

                    if(result){
                        if (chkRoomUserCnt(roomId)) {
                            location.href = "/chat/room?roomId="+roomId;
                        }
                    }else{
                        alert("비밀번호가 틀립니다. \n 비밀번호를 확인해주세요")
                    }
                }
            })
        }

        // 채팅방 삭제
        function delRoom(){
            location.href = "/chat/delRoom/"+roomId;
        }

        // 채팅방 입장 시 인원 수에 따라서 입장 여부 결정
        function chkRoomUserCnt(roomId){
            let chk;

            // 비동기 처리 설정 false 로 변경 => ajax 통신이 완료된 후 return 문 실행
            // 기본설정 async = true 인 경우에는 ajax 통신 후 결과가 나올 때까지 기다리지 않고 먼저 return 문이 실행되서
            // 제대로된 값 - 원하는 값 - 이 return 되지 않아서 문제가 발생한다.
            $.ajax({
                type : "GET",
                url : "/chat/chkUserCnt/"+roomId,
                async : false,
                success : function(result){

                    // console.log("여기가 먼저")
                    if (!result) {
                        alert("채팅방이 꽉 차서 입장 할 수 없습니다");
                    }

                    chk = result;
                }
            })
            return chk;
        }

    </script>
  <style>
        a {
            text-decoration: none;
        }

        #table {
            margin-top: 40px;
        }

        h2 {
            margin-top: 40px;
        }

        input#maxUserCnt {
            width: 160px;
        }

        span.input-group-text.input-password-hide {
            height: 40px;
        }

        span.input-group-text.input-password-show {
            height: 40px;
        }

    </style>
</head>
<body>
<div class="container">
  <div class="container">

    <h2>채팅방 리스트</h2>

    <div th:if="${user == null}" class="row">
      <div class="col">
        <a href="/chatlogin"><button type="button" class="btn btn-primary">로그인하기</button></a>
      </div>
    </div>
    <h5 th:if="${user != null}">
      [[${user.nickName}]]
    </h5>
    <table class="table table-hover" id="table">
      <tr>
        <th scope="col">채팅방명</th>
        <th scope="col">잠금 여부</th>
        <th scope="col">참여 인원</th>
        <th scope="col">채팅방 설정</th>
      </tr>
      <th:block th:fragment="content">

        <tr th:each="room : ${list}">
          <span class="hidden" th:id="${room.roomName}"></span>
          <td th:if="${room.secretChk}">
            <a href="#enterRoomModal" data-bs-toggle="modal" data-target="#enterRoomModal" th:data-id="${room.roomId}">[[${room.roomName}]]</a>
          </td>
          <td th:if="${!room.secretChk}">
            <!-- thymeleaf 의 변수를 onclick 에 넣는 방법 -->
            <a th:href="@{/chat/room(roomId=${room.roomId})}" th:roomId="${room.roomId}" onclick="return chkRoomUserCnt(this.getAttribute('roomId'));">[[${room.roomName}]]</a>
          </td>
          <td>
                        <span th:if="${room.secretChk}">
                            🔒︎
                        </span>
          </td>
          <td>
            <span class="badge bg-primary rounded-pill">[[${room.userCount}]]/[[${room.maxUserCnt}]]</span>
          </td>
          <td>
            <button class="btn btn-primary btn-sm" id="configRoom" data-bs-toggle="modal" data-bs-target="#confirmPwdModal" th:data-id="${room.roomId}">채팅방 설정</button>
          </td>
        </tr>
      </th:block>

    </table>
    <button type="button" class="btn btn-info" data-bs-toggle="modal" data-bs-target="#roomModal">방 생성</button>

  </div>
</div>

<div class="modal fade" id="roomModal" tabindex="-1" aria-labelledby="roomModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">채팅방 생성</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <form method="post" action="/chat/createroom" onsubmit="return createRoom()">
        <div class="modal-body">
          <div class="mb-3">
            <label for="roomName" class="col-form-label">방 이름</label>
            <input type="text" class="form-control" id="roomName" name="roomName">
          </div>
          <div class="mb-3">
            <label for="roomPwd" class="col-form-label">방 설정 번호(방 삭제시 필요합니다)</label>
            <div class="input-group">
              <input type="password" name="roomPwd" id="roomPwd" class="form-control" data-toggle="password">
              <div class="input-group-append">
                <span class="input-group-text"><i class="fa fa-eye"></i></span>
              </div>
            </div>
          </div>
          <div class="mb-3">
            <label for="maxUserCnt" class="col-form-label">채팅방 인원 설정(미체크 시 기본 100명)
              <input class="form-check-input" type="checkbox" id="maxChk"></label>
            <input type="text" class="form-control" id="maxUserCnt" name="maxUserCnt" value="100">
          </div>
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="secret">
            <input type="hidden" name="secretChk" id="secretChk" value="">
            <label class="form-check-label" for="secret">
              채팅방 잠금
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <input type="submit" class="btn btn-primary" value="방 생성하기">
        </div>
      </form>
    </div>
  </div>
</div>

<div class="modal fade" id="enterRoomModal" tabindex="-1" aria-labelledby="enterRoomModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">채팅방 비밀번호를 입력해주세요</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="mb-3">
          <label for="roomName" class="col-form-label">방 비밀번호</label>
          <div class="input-group">
            <input type="password" name="roomPwd" id="enterPwd" class="form-control" data-toggle="password">
            <div class="input-group-append">
              <span class="input-group-text"><i class="fa fa-eye"></i></span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary" onclick="enterRoom()">입장하기</button>
        </div>
        </form>
      </div>
    </div>
  </div>
</div>



<div class="modal fade" id="confirmPwdModal" aria-hidden="true" aria-labelledby="ModalToggleLabel" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">채팅방 설정을 위한 패스워드 확인</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <label for="confirmPwd" class="col-form-label" id="confirmLabel">비밀번호 확인</label>
        <div class="input-group">
          <input type="password" name="confirmPwd" id="confirmPwd" class="form-control" data-toggle="password">
          <div class="input-group-append">
            <span class="input-group-text"><i class="fa fa-eye"></i></span>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button id="configRoomBtn" class="btn btn-primary disabled" data-bs-target="#configRoomModal" data-bs-toggle="modal" aria-disabled="true">채팅방 설정하기</button>
      </div>
    </div>
  </div>
</div>
<div class="modal fade" id="configRoomModal" tabindex="-1" aria-labelledby="roomModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">채팅방 설정</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="mb-3">
          <label for="chPwd" class="col-form-label">비밀번호 변경</label>
          <div class="input-group">
            <input type="password" name="confirmPwd" id="chPwd" class="form-control" data-toggle="password">
            <div class="input-group-append">
              <span class="input-group-text"><i class="fa fa-eye"></i></span>
            </div>
          </div>
        </div>
        <div class="mb-3">
          <label for="chRoomName" class="col-form-label">채팅방 이름 변경</label>
          <input type="text" class="form-control" id="chRoomName" name="chRoomName">
        </div>
        <div class="mb-3">
          <label for="chRoomUserCnt" class="col-form-label">채팅방 인원 변경</label>
          <input type="text" class="form-control" id="chRoomUserCnt" name="chUserCnt">
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="chSecret">
          <input type="hidden" name="secretChk" id="chSecretChk" value="">
          <label class="form-check-label" for="secret">
            채팅방 잠금
          </label>
        </div>
        <div class="mb-3">
          <button type="button" class="btn btn-primary" onclick="delRoom()">방 삭제</button>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>
</body>
</html>
```

</div>
</details>



<br>

<details>
<summary>socket.js</summary>
<div markdown="1">

```java
```

</div>
</details>

