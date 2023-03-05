---
key: /2023/03/03/SpringBoot-Dev-Study.html
title: SpringBoot - SpringBoot 개발 공부
tags: springboot Raw Restful API ImmutableObject final DI Entity DTO
---


# 1. SpringBoot 프로젝트 진행 시, 주의할 7가지 내용**

### 1) Raw 타입은 사용하지 말자

- 클래스와 인터페이스 선언에 타입 매개변수가 쓰이면 이를 제너릭 클래스 혹은 제너릭 인터페이스

-  List 인터페이스는 원소의 타입을 나타내는 타입 매개변수 E를 받는다.

<br>
#### a. Raw 타입이란? 

- Raw 타입이란, 제너릭 타입에서 타입 매개 변수를 전혀 사용하지 않을 때를 말한다. 예를 들어 List를 선언할 때 List만 선언해 놓은 경우를 말한다.

<br>
- 실습 코드 : 

```java
private final Collection stamps = ...;
```

- 이 코드를 사용하면 실수로 도장(Stamp) 대신 동전(Coin)을 넣어도 아무 오류 없이 컴파일 되고 실행된다.


<br>
#### b. Raw 타입의 안정성 확보하기

- 매개변수화된 컬렉션 타입 : 타입 안전성 확보!

<br>
- 실습 코드 : 

```java
private final Collection<Stamp> stamps = ...;
```

- 이렇게 선언하면 컴파일러는 stamps에는 Stamp의 인스턴스만 넣어야 함을 컴파일러가 인지하게 된다. 따라서 아무런 경고 없이 컴파일된다면 의도대로 동작할 것임을 보장해준다.

<br>
#### c. Raw 타입으로 개발시 문제점

- Raw 타입을 사용하면 컴파일 시점에 문제를 잡지 못하다가 런타임 시점에 ClassCastException 에러가 발생할 수 있다. 예를 들어, 다음과 같은 Integer만을 갖는 List에 String이 추가되어도 오류 없이 컴파일되고 실행된다. 그러다가 해당 데이터를 꺼내거나 연산을 할 때 즉, 런타임 시점에 문제(ClassCastException 에러)가 발생하게 된다.

- 하지만 만약 Raw 타입이 아니라 타입 파라미터를 List<Integer>로 명시해준다면, 컴파일러가 리스트에 Integer만 넣어야 함을 인지하여 컴파일 시점에 오류를 잡아낼 수 있다.

- 결론 : Raw 타입의 반환을 피하고 반환할 데이터 타입을 명시해는 것이 좋다.
 
---
<br>

### 2) Restful API는 자원과 메소드로 표현하자

- 기능적인 문제는 없지만 Restful API는 자원(URI)과 메소드(GET, POST 등) 으로 해당 요청을 표현해야 한다. 하지만 사용자 목록 조회 API의 경우, URI에서도 조회라는 기능을 설명하고 있고(find...) GET이라는 메소드도 조회라는 기능을 설명하고 있다. 그렇기 때문에 해당 API의 URI를 다음과 같이 명사의 형태로 바꿔 자원과 메소드로 표현하도록 하자.

<br>
- 실습 코드
	- Restful API 원칙에 의한 수정된 코드 : 
		- GetMapping의 속성이 없어지고 메소드 그 자체만 남게 된다.
	
```java
@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/users")
@Log4j2
public class UserController {

    private final BCryptPasswordEncoder passwordEncoder;
    private final UserService userService;

    ... 생략

    @GetMapping
    public ResponseEntity<List<User>> findAll() {
        return ResponseEntity.ok(userService.findAll());
    }

}
```

<br>
- 수정 전의 원래 코드 :
	- @GetMapping의 속성 값이 있다.
	
```java
@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/user")
@Log4j2
public class UserController {

    ... 생략

    @GetMapping(value = "/findAll")
    public ResponseEntity<List<User>> findAll() {
        return ResponseEntity.ok(userService.findAll());
    }

}
```

---

<br>
### 3) 데이터를 주고 받을 때에는 DTO를 이용하자

- 만약 프로젝트가 확장되어 User 객체와 같은 엔티티에 해당 코드들이 추가된다면 엔티티가 상당히 무겁고 복잡해지며 가독성이 떨어질 것이다.

<br>
- 그리고 만약 엔티티를 직접 반환한다면 필드명이 바뀌는 경우에 API의 스펙을 변경하게 되고, 해당 API를 사용중인 클라이언트에게 문제를 발생시킬 수 있다.

<br>
- 그래서, 다음과 같은 이유로 Entity와 DTO를 분리하여 사용해야 한다.
	- 불필요한 코드 및 로직을 엔티티로부터 분리할 수 있다.
	- 엔티티가 변경되어도 API 스펙이 변하지 않는다.
	- 요청으로 넘어오는 파라미터를 직관적으로 확인가능하며, API의 유연성을 확보할 수 있다.

<br>
- 실습 코드 :
	- DTO 설계

```java
@Getter
public class SignUpDTO {

    private String email;
    private String pw;

}
```

```java
@Getter
@Builder
public class UserListResponseDTO {

    private final List<User> userList;

}
```

<br>
- Entity 설계

```java
@Entity
@Table(name = "USER")
@Getter
@Builder
@NoArgsConstructor(force = true)
public class User extends Common implements Serializable {

    @Column(nullable = false, unique = true, length = 50)
    private final String email;

    @Setter
    @Column(nullable = false)
    private String pw;

    @Setter
    @Column(nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private UserRole role;

}
```

<br>
- Controller 객체 

```java
@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/user")
@Log4j2
public class UserController {

    private final BCryptPasswordEncoder passwordEncoder;
    private final UserService userService;

    @PostMapping(value = "/signUp")
    public ResponseEntity<String> signUp(@RequestBody SignUpDTO signUpDTO) {
        User user = User.builder()
                .email(signUpDTO.getEmail())
                .pw(passwordEncoder.encode(signUpDTO.getPw()))
                .role(UserRole.ROLE_USER)
                .build();

        return userService.findByEmail(user.getEmail()).isPresent()
                ? ResponseEntity.badRequest().build()
                : ResponseEntity.ok(TokenUtils.generateJwtToken(userService.signUp(user)));
    }

    @GetMapping(value = "/list")
    public ResponseEntity<UserListResponseDTO> findAll() {
        UserListResponseDTO userListResponseDTO = UserListResponseDTO.builder()
                .userList(userService.findAll()).build();

        return ResponseEntity.ok(userListResponseDTO);
    }

}
```

---

<br>
### 4) final과 함께 생성자 주입을 사용하라 

#### a. 생성자 주입

- final + 생성자 주입을 사용하며, lombok은 이를 상당히 간단하게 구현할 수 있도록 해준다.

<br>
- 생성자 주입은 생성자의 호출 시점에 1회 호출 되는 것이 보장된다.

<br>
- 그렇기 때문에 주입받은 객체가 변하지 않거나, 반드시 객체의 주입이 필요한 경우에 강제하기 위해 사용할 수 있다.

<br>
- 또한, Spring 프레임워크에서는 생성자 주입을 적극 지원하고 있기 때문에, 생성자가 1개만 있을 경우에 @Autowired를 생략해도 주입이 가능하도록 편의성을 제공한다.

```java
@Service
public class UserService {

    private UserRepository userRepository;
    private MemberService memberService;

    public UserService(UserRepository userRepository, MemberService memberService) {
        this.userRepository = userRepository;
        this.memberService = memberService;
    }

}
```

<br>
#### b. 생성자 주입을 사용해야 하는 이유

##### a) 객체의 불변성 확보

- 생성자 주입을 통해 변경의 가능성을 배제하고 불변성을 보장하는 것이 좋다.

<br>	

##### b) 테스트 코드의 작성

- 순수 자바로 테스트를 작성하는 것이 가장 좋은데, 생성자 주입이 아닌 다른 주입으로 작성된 코드는 순수한 자바 코드로 단위 테스트를 작성하는 것이 어렵다.

- 실습 코드 : 
	- 수정 전 코드 :

```java
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private MemberService memberService;

    public void register(String name) {
        userRepository.add(name);
    }

}
```

<br>
- 수정 후 코드 :

```java
public class UserServiceTest {

    @Test
    public void addTest() {
        UserService userService = new UserService();
        userService.register("MangKyu");
    }

}
```

- @Autowired를 사용하기 위해 스프링을 사용하면 단위 테스트가 아닐 뿐만 아니라, 컴포넌트들을 등록하고 초기화하는 시간 때문에 테스트 비용이 증가하게 된다. 그렇다고 대안으로 리플렉션을 사용하면 깨지기 쉬운 테스트가 된다.

- 반면에 생성자 주입을 사용하면 컴파일 시점에 객체를 주입받아 테스트 코드를 작성할 수 있으며, 주입하는 객체가 누락된 경우 컴파일 시점에 오류를 발견할 수 있다. 심지어 우리가 테스트를 위해 만든 Test객체를 생성자로 넣어 편리함을 얻을 수도 있다.


<br>

##### c) final 키워드 작성 및 Lombok과의 결합

- 생성자 주입을 사용하면 필드 객체에 final 키워드를 사용할 수 있으며, 컴파일 시점에 누락된 의존성을 확인할 수 있다.

- 반면에, 다른 주입 방법들은 객체의 생성(생성자 호출) 이후에 호출되므로 final 키워드를 사용할 수 없다.

```java
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final MemberService memberService;

    public void register(String name) {
        userRepository.add(name);
    }

}
```

- Spring에서는 생성자가 1개인 경우 @Autowired를 생략할 수 있도록 도와주고 있으며, 해당 생성자를 Lombok으로 구현하였기 때문이다.

<br>

##### d) 스프링에 비침투적인 코드 작성

- @Autowired를 사용하면 다음과 같이 UserService에 스프링 의존성이 침투하게 된다.

- 사용자와 관련된 책임을 지는 UserService에 스프링 코드가 박혀버리는 것은 바람직하지 않다. 

- 프레임워크는 비즈니스 로직을 작성하는 서비스 계층에서 알아야 할 대상이 아니다. 


<br>

##### e) 순환 참조 에러 방지

- 애플리케이션 구동 시점(객체의 생성 시점)에 순환 참조 에러를 예방이 가능하다.

<br>
- 문제의 코드 :
	- 두 메소드는 서로를 계속 호출할 것이고, 메모리에 함수의 CallStack이 계속 쌓여 StackOverflow 에러가 발생한다.
	
```java
@Service
public class UserService {

    @Autowired
    private MemberService memberService;
    
    @Override
    public void register(String name) {
        memberService.add(name);
    }

}
```

```java
@Service
public class MemberService {

    @Autowired
    private UserService userService;

    public void add(String name){
        userService.register(name);
    }

}
```

- 참고로 스프링부트 2.6부터는 순환 참조가 기본적으로 허용되지 않도록 변경되었다.

---

<br>
### 5) Controller는 최대한 가볍게 만들어라

- Controller는 클라이언트의 요청이 들어오고 나가는 곳이다.

- 컨트롤러는 어떠한 데이터를 주고 받는지만을 명확하게 작성하는 것이 좋다. 그래야 다른 사람이 해당 API를 봤을 때 이해하기 쉬울 것이다.

- 따라서, SignUpDTO를 통해 User를 생성하고, 암호화를 하는 로직을 서비스 레이어로 넘기도록 하자. 지금은 userService의 signUp이 User를 파라미터로 받고 있지만, 이제는 SignUpDTO를 파라미터로 받아야 한다. 또한 암호화를 위한 PasswordEncoder 역시 UserService로 이동시켜 주어야 한다.

<br>
- 실습 코드 : 
	- 컨트롤 단 : 간단하다. 어떠한 데이터를 주고 받는지만을 명확하게 작성되어 있다.

```java
@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/user")
@Log4j2
public class UserController {

    private final UserService userService;

    @PostMapping(value = "/signUp")
    public ResponseEntity<String> signUp(@RequestBody SignUpDTO signUpDTO) {
        return userService.findByEmail(signUpDTO.getEmail()).isPresent()
                ? ResponseEntity.badRequest().build()
                : ResponseEntity.ok(TokenUtils.generateJwtToken(userService.signUp(signUpDTO)));
    }

    ... 생략
}
```

<br>
- 서비스 단 : 암호화하는 로직이고 복잡하다. 	

```java
@RequiredArgsConstructor
@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    public User signUp(SignUpDTO signUpDTO) {
        User user = User.builder()
                .email(signUpDTO.getEmail())
                .pw(passwordEncoder.encode(signUpDTO.getPw()))
                .role(UserRole.ROLE_USER)
                .build();

        return userRepository.save(user);
    }
    
    ... 생략
}
```

---

<br>
### 6) 불변 객체를 사용하라

- 변경가능성이 없는 객체라면 final로 선언하여 불변성을 확보하도록 하자. 내 코드를 읽거나 수정하는 다른 누군가는 final로 선언된 객체를 안전하게 사용할 수 있을 것

- 실습 코드 :
	- 매개변수, 지역변수, 클래스 변수 등 변경가능성이 없는 모든 변수들에 final이 붙어있다. UserController 외에 다른 클래스들에도 마찬가지로 final을 적극 활용하자.
	
```java
@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/user")
@Log4j2
public class UserController {

    private final UserService userService;

    @PostMapping(value = "/signUp")
    public ResponseEntity<String> signUp(@RequestBody final SignUpDTO signUpDTO) {
        return userService.findByEmail(signUpDTO.getEmail()).isPresent()
                ? ResponseEntity.badRequest().build()
                : ResponseEntity.ok(TokenUtils.generateJwtToken(userService.signUp(signUpDTO)));
    }

    @GetMapping(value = "/list")
    public ResponseEntity<UserListResponseDTO> findAll() {
        final UserListResponseDTO userListResponseDTO = UserListResponseDTO.builder()
                .userList(userService.findAll()).build();

        return ResponseEntity.ok(userListResponseDTO);
    }

}
```

---

<br>
### 7) 유틸성 또는 상수형 클래스는 내부 생성자를 통해 객체 생성을 제한하자
- 유틸리티성 클래스라면 다음과 같이 static 메소드를 제공하기 때문에 객체를 생성할 필요가 없다.
- 유틸성 클래스를 객체를 생성하도록 만든 것은 불필요하게 코드를 열어두는 것이므로, 내부 생성자를 통해 이를 제한할 필요가 있다. 롬복을 사용중이라면 NoArgsConstructor를 이용하고, 그렇지 않다면 직접 내부 생성자를 추가

<br>
- 실습 코드 :

```java
@Log4j2
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class TokenUtils {

    private static final String secretKey = "ThisIsA_SecretKeyForJwtExample";

    public static String generateJwtToken(User user) {
        JwtBuilder builder = Jwts.builder()
                .setSubject(user.getEmail())
                .setHeader(createHeader())
                .setClaims(createClaims(user))
                .setExpiration(createExpireDateForOneYear())
                .signWith(SignatureAlgorithm.HS256, createSigningKey());

        return builder.compact();
    }

    ... 생략
}
```

<br>
- 참고 사이트 :
	- [스프링 부트 개발 중 주의 사항의 참고 사이트 1](https://mangkyu.tistory.com/137?category=761302)

---

<br><br>
# 2. 불변 객체(Immutable Object) 및 final을 사용해야 하는 이유

### 1) 불변 객체(Immutable Object)란?

- 불변 객체란 객체 생성 이후 내부의 상태가 변하지 않는 객체이다. 

- 불변 객체는 read-only 메소드만을 제공하며, 객체의 내부 상태를 제공하는 메소드를 제공하지 않거나 방어적 복사(defensive-copy)를 통해 제공한다.

- Java의 대표적인 불변 객체로는 String이 있다.

<br>

### 2) 불변 객체(Immutable Object) 및 final을 사용해야 하는 이유

#### a. Thread-Safe하여 병렬 프로그래밍에 유용하며, 동기화를 고려하지 않아도 된다.

- 멀티 쓰레드 환경에서 동기화 문제가 발생하는 이유는 공유 자원에 동시에 쓰기(Write) 때문이다. 

- 하지만 만약 공유 자원이 불변이라면 더 이상 동기화를 고려하지 않아도 될 것이다. 

- 왜냐하면 항상 동일한 값을 반환할 것이기 때문이다.

<br>

#### b. 실패 원자적인(Failure Atomic) 메소드를 만들 수 있다.

- 가변 객체를 통해 작업을 하는 도중 예외가 발생하면 해당 객체가 불안정한 상태에 빠질 수 있고, 불안정한 상태를 갖는 객체는 또 다른 에러를 유발할 수 있다. 

- 하지만 불변 객체라면 어떠한 예외가 발생하여도 메소드 호출 전의 상태를 유지할 수 있을 것이다.

<br>

#### c. Cache나 Map 또는 Set 등의 요소로 활용하기에 더욱 적합하다.

- 만약 캐시나 Map, Set 등의 원소인 가변 객체가 변경되었다면 이를 갱신하는 등의 부가 작업이 필요할 것이다. 

- 하지만 불변 객체라면 한 번 데이터가 저장된 이후에 다른 작업들을 고려하지 않아도 되므로 사용하는데 용이하게 작용할 것이다. 


<br>

#### d. 부수 효과(Side Effect)를 피해 오류가능성을 최소화할 수 있다.

- 불변 객체는 기본적으로 값의 수정이 불가능하기 때문에 변경 가능성이 적으며, 객체의 생성과 사용이 상당히 제한된다. 

- 그렇기 때문에 메소드들은 자연스럽게 순수 함수들로 구성될 것이고, 다른 메소드가 호출되어도 객체의 상태가 유지되기 때문에 안전하게 객체를 다시 사용할 수 있다. 

- 이러한 불변 객체는 오류를 줄여 유지보수성이 높은 코드를 작성하도록 도와줄 것이다

<br>

#### e. 다른 사람이 작성한 함수를 예측가능하며 안전하게 사용할 수 있다.

- 불변성(Immutability)은 협업 과정에서도 도움을 주는데, 불변성이 보장된 함수라면 다른 사람이 개발한 함수를 위험없이 이용할 수 있다. 

- 마찬가지로 다른 사람도 내가 작성한 메소드를 호출하여도, 값이 변하지 않음을 보장받을 수 있다.

<br>

#### f. 가비지 컬렉션의 성능을 높일 수 있다.(어렵다. 다시 읽기)

- Object 타입의 value 객체 생성
- ImmutableHolder 타입의 컨테이너 객체 생성
- ImmutableHolder가 value 객체를 참조

<br>
- 결국, GC가 수행될 때, 가비지 컬렉터가 컨테이너 객체 하위의 불변 객체들은 Skip할 수 있도록 도와준다. 왜냐하면 해당 컨테이너 객체(ImmutableHolder)가 살아있다는 것은 하위의 불변 객체들(value) 역시 처음에 할당된 상태로 참조되고 있음을 의미하기 때문

<br>
- Java에서 불변 객체를 생성하기 위해서는 다음과 같은 규칙이 있다.** 
	- 클래스를 final로 선언하라
	- 모든 클래스 변수를 private와 final로 선언하라
	- 객체를 생성하기 위한 생성자 또는 정적 팩토리 메소드를 추가하라
	- 참조에 의해 변경가능성이 있는 경우 방어적 복사를 이용하여 전달하라
	
<br>
- 실습 코드 :

```java
public final class ImmutableClass {
    private final int age;
    private final String name;
    private final List<String> list;

    private ImmutableClass(int age, String name) {
        this.age = age;
        this.name = name;
        this.list = new ArrayList<>();
    }

    public static ImmutableClass of(int age, String name) {
        return new ImmutableClass(age, name);
    }
    
    public int getAge() {
        return age;
    }

    public String getName() {
        return name;
    }

    public List<String> getList() {
        return Collections.unmodifiableList(list);
    }
    
}
```


<br> 
- 이펙트 자바에서 정리 :
	- 클래스들은 가변적이여야 하는 매우 타당한 이유가 있지 않는 한 반드시 불변으로 만들어야 한다. 만약 클래스를 불변으로 만드는 것이 불가능하다면, 가능한 변경 가능성을 최소화하라.

<br>
- 참고 사이트 : 
	- [참고 사이트 1](https://mangkyu.tistory.com/131)


---

<br><br>
# 3. 엔티티(Entity) 또는 도메인 객체(Domain Object)와 DTO를 분리해야 하는 이유

- 원래의 Entity는 비즈니스 로직을 포함하는 도메인 엔티티와 데이터베이스 관련 처리를 위한 영속성 엔티티로 나누어 진다. 

<br>
## 1) 엔티티(Entity)와 DTO를 분리해야 하는 이유

<br>
### a. 관심사의 분리

- DTO(Data Transfer Object)의 핵심 관심사는 이름 그대로 데이터의 전달이다. DTO는 데이터를 담고, 다른 계층 또는 다른 컴포넌트들로 데이터를 넘겨주기 위한 자료구조(Data Structure)이다. 그러므로 어떠한 기능 및 동작도 없어야 한다.

<br>
- 엔티티는 핵심 비지니스 로직을 담는 비지니스 도메인의 영역의 일부이다. 그러므로 엔티티 또는 도메인 객체에는 비지니스 로직이 추가될 수 있다. 엔티티 또는 도메인 객체는 다른 계층이나 컴포넌트들 사이에서 전달을 위해 사용되는 객체가 아니다.

<br>
- 결론 : 엔티티와 DTO는 엄연히 서로 다른 관심사를 가지고 있고, 그렇기 때문에 분리하는 것이 합리적이다.

---

<br>
### b. Validation 로직 및 불필요한 코드 등과의 분리

- JPA도 변수에 @Id, @Column 등과 같은 어노테이션들을 활용해 객체와 관계형 데이터베이스를 매핑해주는데, DTO와 엔티티를 분리하지 않는다면 엔티티의 코드가 상당히 복잡해진다. 

<br>
- 예를 들어, 만약 엔티티와 DTO를 분리하지 않으면 아래 코드와 같이 매우 복잡한 클래스가 탄생하게 된다.

<br>
- 실습 코드 :

```java
@Entity
@Table
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Membership {

    @NotNull
    @Size(min = 0)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false)
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    private MembershipType membershipType;

    @NotBlank
    @Column(nullable = false)
    private String userId;

    @NotNull
    @Size(min = 0)
    @Setter
    @Column(nullable = false)
    @ColumnDefault("0")
    private Integer point;

    @CreationTimestamp
    @Column(nullable = false, length = 20, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(length = 20)
    private LocalDateTime updatedAt;

}
```

- 계속 엔티티 클래스를 사용하게 되면 핵심 비지니스 도메인 코드들이 아닌 요청/응답을 위한 값, 유효성 검증을 위한 코드 등이 추가되면서 엔티티 클래스가 지나치게 비대해질 것이고,확장 및 유지보수 등에서 매우 어려움을 겪게 될 것이다.


---

<br>
### c. API 스펙의 유지

```java
@Entity
@Table
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Membership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false)
    private Long id;

    @Enumerated(EnumType.STRING)
    private MembershipType membershipType;

    @Column(nullable = false)
    private String userId;

    @Setter
    @Column(nullable = false)
    @ColumnDefault("0")
    private Integer point;

}
```

<br>
- 내부 정책의 변경으로 userId를 memberId로 변경해야 하는 상황이라고 하자. 만약 우리가 DTO를 사용하지 않았다면 userId가 memberId로 바뀜에 따라 API의 스펙이 변경되고, 이로 인해 API를 사용하던 사용자들은 모두 장애를 겪게 될 것이다.

<br>
- 물론 @JsonProperty를 이용해 반환되는 값의 이름을 변경할 수 있지만, 이는 결국 Entity를 무겁게 만들어 근본적인 해결책이 될 수 없다. 스펙이 변경되어 테이블에 컬럼이 추가되는 경우도 마찬가지이다. 테이블에 새로운 컬럼이 추가되면 엔티티에 새로운 변수가 추가될 것이고, 별도로 처리를 하지 않는 이상 API 응답이 추가되어 스펙이 변경되게 된다.

<br>
- 결론 : DTO를 이용해 분리하여 독립성을 높이고 변경이 전파되는 것을 방지해야 한다. 만약 우리가 응답을 위한 DTO 클래스를 활용하고 있으면, Entity 클래스의 변수가 변경되어도 API 스펙이 변경되지 않으므로 안정성을 확보할 수 있다.


---

<br>
### d. API 스펙의 파악이 용이

- DTO를 통해 API 스펙을 어느정도 파악할 수 있다는 점이다.

- DTO를 작성함으로써 어느 정도 API 문서의 요약본을 작성하는 것과 유사한 효과를 얻을 수 있다.

<br>
- 실습 코드 :
	- 아래 코드를 통해, 꽤나 많은 API 스펙들을 얻을 수 있다. email의 값은 반드시 email 포맷이어야 하고, 최대 글자수가 100이며 pw는 비어있어서는 안되는 것 등을 파악이 가능하다.


```java
@Getter
@RequiredArgsConstructor
public class UserRequestDto {

	@Email
	@Size(max = 100)
	private final String email;

	@NotBlank
	private final String pw;

	@NotNull
	private final UserRole userRole;

	@Min(12)
	private final int age;

}

```

<br>
#### [a] 참고 사이트 :

- [Entity와 DTO를 분리한 이유에 관한 참고 사이트 1](https://mangkyu.tistory.com/192)







