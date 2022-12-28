---
key: /2022/12/26/Week5-Day1-Code.html
title: TIL-5주차 코드 - Day1
tags: java web servlet javascript
---

# 1. Servlet 이용 : 22.12.26

<br>
### 1) 이전 강의 복습 : 오늘의 질문
- 톰캣이 서블릿 코드를 실행 해준다. // 서블릿을 언제 메모리에 올리는지? 클라이언트로부터 최초 요청을 받았을 때..
- 서블릿 컨테이너 = 톰캣 (메모리에 올리는 것을 누가 해주냐? 톰캣이 해준다.**)
- WAS가 객체생성을 도와준다? 서블릿 컨테이너에 보관이 되어 있다가 실행이 되면 코드에 들어온다.
- 톰캣은 WAS의 한 종류이다. 톰캣은 WAS이다. WAS는 톰캣이 아니다.


<br>	
### 2) [톰캣 질문 정리]****

![이미지](/assets/images/servlettomcat.jpg)

- 문제 1 : 톰캣이 서블릿 코드를 실행해준다. 

- 문제 2 : 메모리에 올리는 것을 누가 해주냐? 톰캣이 해준다.** 
	
- 문제 3 : 메모리에 언제 올라가는지? : web.xml을 읽을 때!! (클라이언트로부터 최초 요청을 받을 때 올라간다. ***)

- 문제 4 : web.xml를 읽을 때, 컨테이너에 담는다.(하지만, web.xml 파일의 load-on-startup 설정으로 순서를 바꿀수 도 있다.)
	
- 문제 5 : 사용자의 요청이 들어오면, 담아 놓은 컨테이너에서 읽어서 실행한다.
	
- 문제 6 : 서블릿이 언제 실행하는지? 언제 만드는지? : service () 메서드를 호출하기 전에 Servlet 객체를 메모리에 올린다.

	
- Web Container는 service() 메서드를 호출하기 전에 Servlet 객체를 메모리에 올린다.

<br>
#### 2-1) [서블릿 동작 과정 추가 정리]** (참고 - https://coooding.tistory.com/14) :


- Web Server는 HTTP request를 Web Container(Servlet Container == 톰캣)에게 위임한다.
  
	- web.xml 설정에서 어떤 URL과 매핑되어 있는지 확인(없으면 기본 설정으로 돌아간다.)
	- 클라이언트(browser)의 요청 URL을 보고 적절한 Servlet을 실행
  
 
<br>
- Web Container는 service() 메서드를 호출하기 전에 Servlet 객체를 메모리에 올린다.
	- Web Container는 적절한 Servlet 파일을 컴파일(.class 파일 생성)한다.
	- .class 파일을 메모리에 올려 Servlet 객체를 만든다.
	- 메모리에 로드될 때 Servlet 객체를 초기화하는 init() 메서드가 실행된다.

 
<br>
- Web Container는 Request가 올 때마다 thread를 생성하여 처리한다.
	- 각 thread는 Servlet의 단일 객체에 대한 service() 메서드를 실행한다.
 

<br>
- 클라이언트의 요청이 들어오면 WAS는 해당 요청에 맞는 Servlet이 메모리에 있는지 확인한다. 
  
  
- 만약 메모리에 없다면,
	- 해당 Servlet Class를 메모리에 올린 후(Servlet 객체 생성) init() 메서드 실행 
	- 이후 service() 메서드를 실행
  
- 메모리에 있다면 
	- 바로 service() 메서드 실행
	 

<br>	
### 3) [web.xml 파일에서 서블랫 매핑 설정]****

```java

<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="https://jakarta.ee/xml/ns/jakartaee" xmlns:web="http://xmlns.jcp.org/xml/ns/javaee" xsi:schemaLocation="https://jakarta.ee/xml/ns/jakartaee https://jakarta.ee/xml/ns/jakartaee/web-app_5_0.xsd http://xmlns.jcp.org/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_2_5.xsd" id="WebApp_ID" version="5.0">
  <display-name>webprj</display-name>
  
  						<!-- web.xml를 읽어 들일 때, 메모리에 올리고 서블릿 객체화한다. 객체화하고 이름을 달아줘야하는데 이것이 servlet-name이다. -->
  <servlet>	
  	<servlet-name>nana</servlet-name>
  	<servlet-class>com.newlecture.Nana</servlet-class>
  </servlet>

  <servlet-mapping>
  	<servlet-name>nana</servlet-name>
  	<url-pattern>/hello.txt</url-pattern>
  </servlet-mapping>
  
  
  <welcome-file-list>
    <welcome-file>index.html</welcome-file>
    <welcome-file>index.jsp</welcome-file>
    <welcome-file>index.htm</welcome-file>
    <welcome-file>default.html</welcome-file>
    <welcome-file>default.jsp</welcome-file>
    <welcome-file>default.htm</welcome-file>
  </welcome-file-list>
</web-app>
```


<br>
### 4) [어노테이션 매핑 정리]****

```java
						// 얘도 고치면 다른 것도 고쳐야해서(동기화 문제) 번거롭다. 
						// 외부파일을 열수 있으면 xml파일에서 설정하고, 그럴수 없으면 어노테이션으로 설정한다.
@WebServlet("/hello")	 
public class HelloServlet extends HttpServlet {

@Override
	protected void service(HttpServletRequest request, HttpServletResponse response) 
							throws ServletException, IOException {
							
	}
}
```

---

<br>
### 5) [에러 발견]

- 이전 상태의 코드가 계속 실행되는 경우 : Project 탭 - Clean 클릭해서 프로젝트가 실행되었던 문제가 발생.

- 배포가 안되는 경우 : 브라우저가 열린 상태에서는 배포가 되지 않는다.  

<br>
### 6) [서블릿에 html 파일 적용]

 - 프로젝트명을 만들 때, 충돌날까봐 context명(/webprj)을 만들어 줬는데 충돌이 나지 않아서 root(/)로 바꾸기
 
---

<br>
### 7) [GET 요청]

 - Get 요청 : html에게 데이터를 달라고 하는 요청이지만 값을 전달할 수 있다. 옵션 느낌이다.
 
 - 쿼리스트링(parameter) : 예전에는 url의 길이 제한이 있었다. 질의(쿼리)하기 위한 욥션 느낌이다.("/hello?c=3")


<br>

```html
 <!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Insert title here</title>
</head>
<body>						<!-- html 공부하기 -->
	<section>
		<h1>인사말을 몇 번 듣고 싶으세요?</h1>
		<ul>
			<li><a href="/hello?c=5">5번</a></li>
			<li><a href="/hello?c=10">10번</a></li>
			<li><a href="/hello?c=100">100번</a></li>
		</ul>
	</section>
	<a href="/hello">hello</a>
</body>
</html>
```
 
<br>
 
```java
 package com.newlecture.web;

import java.io.IOException;
import java.io.PrintStream;
import java.io.PrintWriter;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;


@WebServlet("/hello")				
public class HelloServlet extends HttpServlet {
	
	
 	@Override
	protected void service(HttpServletRequest request, HttpServletResponse response) 
							throws ServletException, IOException {

		// response.getOutputStream(); 는 바이너리 파일과 같이 1바이트씩 가져오고 싶을 때 사용.

		// PrintStream는 다국어를 지원하기 전에 사용되었다.
		// PrintWriter은 다국어를 지원할 때, 사용되었다.
		
		// PrintStream out = new PrintStream(response.getWriter());
		PrintWriter out = response.getWriter();		// 저장을 하면, 이클립스가 알아서 컴파일 해주고 서버에 옮기는 작업을 한다.(배포) 
													// 우리는 그것을 톰캣으로 실행만 하면, 이다.
		
		
		// 쿼리스트링 초기화 해주기, 옵션이라서 조건문 넣어주기
		
		String c = request.getParameter("c");
		
	
		int count = 10;
		
		if(c != null)
			count = Integer.parseInt(c);
		
		for(int i=0; i<count; i++)
			out.println("hello Servlet");
	}
}

```

---

<br><br>
# 2. Canvas(프론트)와 Servlet(백엔드)을 이용해서 게임 만들기 (+ 자바 스크립트 공부)

<br>
### 1) [자바 스크립트]

- ES5 vs ES6 : ES5부터 먼저 공부하고 ES6를 공부하기
	- ES5는 예전 버전이라서 에러가 많이 발생한다.(모듈화(= 객체지향)를 제공하지 않아서)
	- ES6만 공부하면, ES5와의 기준을 몰라서 기준이 사라진다.

<br>	
	![이미지](/assets/images/jsStudy.jpg)
	- 언어와 플랫폼을 공부하고나서 하나의 제품을 만들고 나중에는 가운데 부분에 있는 것을 관심있는 것 공부하기!
<br>

	- 웹 프론트 API : 
		- 윈도우 UI : DOM
		- Ajax : XHR, Fetch
		- 2D/3D 그래픽 : SVG, Canvas
	<br>	
	- 백엔드 API : 
		- 실행 환경 : NodeJS
		- 웹 서버 겸 WAS : Express


<br>
	- 통계학의 필요성 
		- 서비스를 운영하면서, 통계학이 필요하다.(하지만, 먼저 R을 공부하지마라.)
		- 데이터 분석 : 빈도수, 시간대별 빈도수 등등
		- 확률 공부 : 모집합, 표본 집합
		- 이런 것들로 예측한다.
	
	
<br><br>	
### 2) [Wrapper 클래스]

```javascript
var x = 3; 
```
	- 여기선, 3을 자동으로 박스화해준다. 그리고 x가 이것을 참조한다. 이렇게 박스처럼 만들어서 값을 참조하는 모습을 Wrapper Class에서 참조하는 모습과 같다.

- Java에서는 부모를 갖지 않아도 Object 클래스에서 상속 받아서 이용한다.
 
- Object 클래스는 모든 객체를 한 번에 묶을 수 있는 역할을 한다.  배열을 Object 형식으로 만들면, 참조 못할 것이 없다. 객체를 서로 연결 지을 수 있다.
 
- 하지만, 이렇게 어떠한 공간이여서 Wrapper 클래스는 모든 것을 엮고 담을 수 있지만, primitive 타입만 모든 것을 담을 수 없다.
 
```java
package ex8.wrapper;

public class WrapperTest {

	public static void main(String[] args) {
		// Object obj = 3;				// 값을 담는 것은 불가능하고 참조하는 것이 가능하다.								
		Object obj = new Integer(3);	// wrapper 클래스 적용!!

		int x = 3;						// primitive 타입 설정!!

		System.out.println(obj);
		System.out.println(x);

	}
}
 ```
 
 
---

<br><br>
# 3. Javascript 이용 : 22.12.27  

<br>
### 1) Wrapper 클래스 정리

```java 
package ex8.wrapper;

import ex7.is_a.Exam;

public class WrapperTest {

	public static void main(String[] args) {
		// Object obj = 3;				// 값을 담는 것은 불가능하고 참조하는 것이 가능하다.								
		Object obj = new Integer(3);	// wrapper 클래스 적용!!

		int x = 3;						// primitive 타입 설정!!

		System.out.println(obj);
		System.out.println(x);

		
  //------------------------------------------------------------------------
		Exam exam = new Exam();
		String str = new String("Hello~");
		
		Exam[] list1 = new Exam();		// 불가능(타입이 다르다.)
		String[] list2 = new String[2];	// 가능
		Object[] list3 = new Object[5];	// 가능 Obj
		
		list3[0] = exam;
		list3[1] = exam;

	// ** 중요!!	
		Object d = 3;				// 자바 예전 버전에서는 원래, 값을 참조해서는 안 된다.
		Object d2 = new Integer(3);	// 이렇게 박스에 담에서 사용하면 가능하다.
		
		// 원래 값으로 담으면 공간이다. 따라서, 참조와 달라서 에러가 발생
		int x = (Integer) d2;	// 에러 발생(정확히 형변환 까지 해주면,)

		
		
    //------------------------------------------------------------------------
	
		}

}
```
 
- 이것과 마찬가지로, 자바스크립트는 값 변수가 없어서 모든 것이 객체화 되어 있다.


<br>

```java
var x = 3;	// undefined로 설정이 되어 있는데 값이 입력되면, Wrapper 클래스가 기본형이 되어 불러온다.
```		

- 컴파일 타임에 의한 에러가 나지 않는다.
		
- undefined를 판단하기 위해서, "undefined" 이렇게 쓰지 않는다.	 undefined 이렇게 사용한다.
		
- 자바 스크립트 작성법 : html 코드에 script 태그의 내부에 작성한다.
		
- 자바 스크립트의 구분자는 줄바꾸기와 ";"로 2가지 형태로 구분된다.

- 자바스크립트는 문서 안에서 사용하기 때문에 Single인데도 문서 안에서는 Double을 사용한다. 따라서, 기준이 없다.


<br>
### 2) [Array 객체]

- Index 기반의 저장소, Stack 저장소, queue 저장소, Deque 저장소

- Array 객체는 알아서 index를 늘려준다.

```java
var nums = new Array();
nums[0] = 5;
nums[1] = 5;
nums[2] = 5;

```

- 콜렉션은 자리가 모자라면. 자리를 알아서 늘려간다.


<br><br>
### 3) [javascript #1]

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Insert title here</title>

<script>
	var x;
	alert(x==undefined);
	
/* 	var nums = new Array();	자바에서는 바로 안 만들고 공간을 설정해줬어야 했다. 
	
	nums[0] = 3;
	nums[1] = 10;
	nums[2] = 21;
	
	console.log(nums[0]);
	console.log(nums[1]);
	console.log(nums); */
	
	var nums = new Array();
	nums[3] = 5;
	
	console.log(nums);
	console.log(nums.length);
	
	
</script>

</head>
<body>						<!-- html 공부하기 -->
	<section>
		<h1>인사말을 몇 번 듣고 싶으세요?</h1>
		<ul>
			<li><a href="/hello?c=5">5번</a></li>
			<li><a href="/hello?c=10">10번</a></li>
			<li><a href="/hello?c=100">100번</a></li>
		</ul>
	</section>
	
	<form action = "/hello">
		<label>기타</label>
		<input placeholder="원하는 횟수를 입력하세요." name = "c"/>
		<input type = "submit" value = "전송"/>
	</form>

	<a href="/hello">hello</a>
	

	
</body>
</html>
```

<br><br>
### 4) [javascript #2]

- 자바스크립트에서 배열이 1개만 받으면 크기이고 1개를 넘어서는 순간, 초기값을 설정한다.


```html
<script>
 	var nums = new Array();			 typeof : 배열의 타입을 반환 해준다.
	var nums = new Array(5);
	var nums = new Array(5,10,21);
	var nums = new Array(5,10,21,'Hello');
	console.log(typeof nums[3]); 
</script>
```	

- 자바 스크립트 2차원 배열

```html
<script>
	var nums = new Array(5,10,21,'Hello', Array(5,10,21,'Hello'));
</script>
```

<br><br>
### 5)  [Stack] : 뒤로가기에서 쓰임

- LiFO(Last In First Out) : 데이터를 쌓았다가 지운다.

- push : 하나씩 데이터를 쌓을 때, 이용(index를 안 쓰므로 좋다.)

- pop : 데이터를 꺼내서 없앨 때, 이용(마지막에 쌓은거부터 사라짐)

```html
<script>
/* Stack */ 
var nums = new Array()
nums.push(4);
console.log(nums);

var n1 = nums.pop();
console.log(nums); 
</script>
```

<br><br>
### 6)  [Queue] 

- FiFO(First In First Out) : 데이터를 쌓았다가 지운다.

- push : 하나씩 데이터를 쌓을 때, 이용(index를 안 쓰므로 좋다.)

- shift : 데이터를 꺼내서 없앨 때, 하나씩 밀면서 이용해서 shift 이다.(데이터를 다 쌓고 그다음에 밀면서 없애버림.)


```html
/* Queue */ 
<script>
var nums = new Array(1,2,3,4,5);

nums.push(6);
var num = nums.shift();
console.log(num);
</script>
```

<br><br>
### 7)  [DeQue(Double-Ended Queue)] : 공부하기

```html
<script>
	var nums = new Array(1,2,3,4,5);	
	console.log(nums);				//[1, 2, 3, 4, 5]
	nums.push(6);						// 마지막부터 새로운 데이터를 채운다.
	console.log(nums);				// [1, 2, 3, 4, 5, 6]
	
	var pos = nums.pop();				// 뒤에서부터 데이터를 없앤다.
	console.log(pos);					// 6
	console.log(nums);				// [1, 2, 3, 4, 5]
	
	var num = nums.shift();			// [2, 3, 4, 5] : 뒤에서부터 데이터를 밀어서 버린다.
	console.log(num);
	console.log(nums);				
									
	var num = nums.unshift(3);			// [3, 2, 3, 4, 5] : unshift는 앞에서부터 데이터를 채워준다.	
	console.log(num);					// 새로운 길이를 출력한다. 배열 전체 길이 : 5
	console.log(nums); 				// [3, 2, 3, 4, 5]
</script>
```

- 데이터를 양쪽에서 push하고 shift하여 밀고 pop하여 없애버린다. 한다.(여러개로 섞임)



<br><br>
### 8) splice 
- 배열과 배열을 끝에 잇거나 중간에 들어갈 수도 있다. 또는 중간에 들어가기 위해 배열을 자르고 안 들어갈수도 있다.

	- nums.splice(2) : 0번째 인덱스부터 마지막 인덱스를 버리고 출력. 
		- 1,2 출력
	
	- nums.splice(2,1) : 1개를 지우고 거기에 배열을 넣으려고 이렇게 사용.
		- 1,2,4,5 출력
		- nums.splice(2,1)
		
	- nums.splice(1,0,23,100,124) : 2번째 인덱스에 0이 들어가면, 그 인덱스부터 삽입
		- 1,23,100,124,2,3,4,5 출력
		- nums.splice(2,1)
	
	- nums.splice(1,2,23) : 1,23,4,5 출력(중요!! : 1번째 인덱스부터 2개 지우고 그자리에 23을 삽입)
	
- 따라서, 이것은 배열을 조작하기 위해서 사용된다.**

- 추가 도구** : 배열을 이용하는 메서드 Loop over, Find, Filter, Map, Concat, Join 이용

<br><br>
### 9) Object

- 하지만, 객체에 속성이 늘어나면 문제가 많다.
- 자바와 달리 자바스크립트는 계획되지 않는 속성이므로... 에러 발생한다.(ex) exam.Kor과 같은 경우)

```html
<script>
var exam = new Object();		
exam.kor = 30;					
exam.eng = 70;
exam.math = 90;

alert(exam.kor + exam.eng);
</script>
```

---

<br><br>
# 4. 자바스크립트 사용법 :

<br>
### 1) 자바스크립트 객체의 속성 설정

- exam["kor"]은 exam.kor과 같은 의미이다. : 즉, 변수명을 속성으로 사용할 수 없는 경우에 이렇게 쓴다.(ex) 변수명에 빈공백을 넣어주는 경우)

- 객체의 속성 제거 : delete exam.kor;(데이터 손실 때문에 키와 값을 빈 배열에 각각 담아줄수도 있다. 이런 것을 map 같은 콜렉션에 넣어줄 수 있다.)

```html
<script>

var exam = new Object();
exam.kor = 30;
console.log(exam);
delete exam.kor;
console.log(exam);

</script>
```

<br><br>
### 2) JSON (중요!!)

![이미지](/assets/images/json.jpg)

- 데이터를 표기하는데 가장 기본적인 모습 : JSON이며 그외는 XML, CSV가 있다.

<br>
![이미지](/assets/images/json1.jpg)

<br>
![이미지](/assets/images/json2.jpg)

<br>

```html
<script>
	var notice = [{"id":1, "title":"hello json"},
				 {"id":2, "title":"hi json"},
				 {"id":3, "title":"json is ~"}];
</script>
```

- Json 이용법

```html
<script>
	var exam ="[3,5,3,2]";
	alert(exam[2]);			// 외부에서 데이터를 받으면 이런식으로, 문자열로 받아오므로 "["부터 index 2번째인 ","가 출력된다.

	
	// 자바 스트립트에서 코드를 value로 인식하여 실행해주는 경우
 	eval("var x = 3+5");
	alert(x);	
</script>
```
- eval()의 문제점 eval()은 보안에서 주의해야 한다.(외부에서 Injection 문제 : SQL Injection과 같이 보안 문제(해킹) 같은 경우)

- eval()은 원격으로 데이터가 오는 경우 객체화하는 경우 용이하다. 하지만 보안때문에 JSON을 이용한다. 

<br><br>
### 3) JSON 데이터형으로 파싱하는 방법

```java	
	var exam1 = eval("([3,5,3,2])");	// eval에는 원래 완전한 문장이 들어가야하는데 문장으로 쓰기 위해서는 "" 안에도 ()를 써준다.
	alert(exam1[2]);
	
	// 중요!!!****
	// eval()은 객체화를 해주지만 어떠한 것도 만들어주므로 문제가 많다.(모든 형태만 변환해줘서)
	// 새롭게 Json 파싱해주는 도구: reference 찾기
	// 따라서, Json.parse()를 이용한다. (올바른 방법)
	var data = JSON.parse("[3,5,3,2]");
	alert(data[3]);
	
	// 객체를 만들다음에 스트링 형태로 바꿔주는 도구 : JSON.stringify() (올바른 방법)
	var data1 = JSON.stringify("[3,5,3,2]");
	alert(data1[2]);
```
	
<br>	<br>
### 4) 연산자

- 기본 연산자

```html
	var str1 = "hello";
	var str2 = "hello";
		
	console.log(str1 == str2);			// true
	
	var str3 = "hello";
	var str4 = new String("hello");		
									// 자바스크립트에서는 ==가 값을 비교해준다.	
	console.log(str3 == str4);			// true
	
	var str5 = "hello";
	var str6 = new String("hello");		
									// ===가 객체까지 비교한다.
	console.log(str5 === str6);		// false

```

<br>	
- 논리 연산자 및 값 비교
	- if문이 유연하다. 0이 아니면 전부 true이다.(자바에서는 불가능)
	
	- Truthy : if([]), if({})
	- Falsy : if(""), if(NaN)
	
	- [Or 연산자(||)] : 가장 앞에 것이 참이면 바로 앞에 것을 반환, 만약 앞에 것이 거짓이면, 뒤에 것이 결과가 된다.(이경우에는 뒤에 값은 무엇이든 결과에 상관이 없다.)
	
	```html
		<script>
								// 가장앞에것을 반환
		console.log('Cat' || 'Dog');			// true : 빈문자가 아니면 true일 듯?
		console.log('null' || '' || ' ' || 0);	// true 반환한다.(' '가 빈공백이라서 0보다는 크다.)
		</script>
	```

	<br>
	- null이 들어오면, 기본값으로 설정된 값이 입력된다.
	
	```html
		<script>	
			var x = null;
			var name = x || "newlec";		// name은 newlec 출력	
		</script>
	```	

	<br>
	- [And 연산자(&&)] : 보통 앞에 true가 없으면(false) 뒤에 것을 반환
	- 또한, 첫번째 항이 참인 경우에는 두번째 항이 참이냐 거짓이냐는 결과에 영향을 미치지 않습니다. 따라서 'aaa' && 'bbb' 처럼 두번째 항이 참인 경우도, 'aaa' && 0 처럼 두번째 항이 거짓인 경우도 첫번째 항인 'aaa'가 모두 참이므로 모두 결과는 두번째 항이 됩니다.
	
	```html
	<script>		
	var x = null;
		var name = x && "newlec";		// name은 newlec 반환
	</script
	```	

- 정리*** : ||는 처음으로 참이 되는 경우에, &&는 처음으로 거짓이 되는 경우를 찾을 때 이용한다.
	
<br>		
- Nullish : null이 아니다라는 것을 알려준다.(Truthy, Falsy 같은 느낌)

```html
<script>
	var foo = null ?? 42;
	console.log(foo); 		// 42가 출력
	
	var baz = 0 ?? 42;
	console.log(baz); 		// 0이 출력
</script>
```		

<br>
- NaN : Not a Number

```html
<script>
	var x = 3;
	var y = '3';
	console.log(x*y);		// 문자가 숫자로 바뀐다.
	
	var x = 3;
	var y = 'a';
	console.log(x*y);		// NaN : Not a Number - 'a'가 숫자가 아니라서 NaN이 출력

	// NaN은 연산자로 비교할 수 없다. 그래서 isNaN(), isFinite()으로 비교한다.
	var x = 3*'a';
	
	if(isNaN(x))
		console.log("오류 발생");
</script>
```

<br>	<br>
### 5) 제어구조
- for in, for of : index를 꺼내거나 value를 꺼내서 반환

	- for in은 index를 어떤 것을 쓰겠다고 알려주면, 인덱스가 알아서 증가한다.
	
	```html
	<script>
		var ar = ["철수","영희","맹구","동천"];
		
		for(i in ar)
			console.log(ar[i]);
	</script>
	```

<br>
	- for of는 ES6에 존재하고 index를 꺼내는 방법이다. (배열 요소의 위치 반환)

	```html
	<script>
		var ar2 = ["철수","영희","맹구","동천"];
		
		for(v of ar2)
			console.log(v);
	</script>
	```

<br>
	- for in, for of에는 Object 형태도 넣어서 값을 꺼낼 수 있다.(map 형태 : key, value)
		- for in은 key값을 이용해서 출력해준다.
		
		```html
		<script>
			var record = {kor:30, eng:40, math:50};		
			
			for(var k in record)
				console.log(record[k]);
		</script>
		```

<br>
		- for of은 value값을 이용해서 출력해준다.
		
		```html
		<script>
			var record = {kor:30, eng:40, math:50};
			
			for(var v of record)		// ES6에서 사용된다, 
				console.log(v);				// map 콜렉션에서 사용할 것이고 
		</script>
		```

<br>	
### 15) 앞으로의 프로젝트 목적
- 재밌게 구현하는 시각적인 도구 만들기. 시각 도구화?된 공부하려고 만드는 것을 만들기

- ex) 웹 페이지용 와이어 프레임 만드는 것?(기존의 문제점: 유료화라 프로젝트가 1개만 만들어지고, 데이터 저장 기간이 존재하고, 아이폰만 기종이 있다.)


---

<br><br>
# 4. javascript day3 : 22.12.28


### 1) 자바스크립트의 함수 정의

- 자바 스크립트에서 함수를 정의하는 경우가 없다.(익명 함수?) : 내가 쓰면서 정의한다.

```html
<script>
	var add = new Function("x,y","return x+y;");
	console.log(add(3,4));
</script>
```
	- 인자와 반환값을 나눠서 함수 객체를 만든다.


- 자바 스크립트에서 함수를 정의하는 방법 : 정의한 것이 아니라 함수 이름을 붙여 준것이라서 참조가 가능하다.

```html

<script>
	var add = function(x, y) {		// 가장 올바른 방법
		return x+y;
	}
</script>

```	

```html

<script>
	function add(x, y) {			// 입문자의 입장에서 쓰는 방법
		return x+y;
	}
<script>

```	



- 특이한 자바스크립트 함수 특징 : 

	- 자바스크립트는 argument랑 값을 모두 컬렉션이 받는다. 따라서, 입력값의 개수는 의미가 없다.

```html
    <script>
        function add (x,y) {            // 다른 방법 사용하자
            return x + y;
        }

        console.log(add(3,4,5,6));      // 에러가 발생하지 않아서 문제가 많다.

    </script>
```


----------------------------------------------

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>

    <script>
        // var add = new Function("x,y","return x+y");
        // console.log(add(3,4));

        // var add = function(x,y) {       // 가장 올바른 방법
        //     return x + y;
        // }

        // function add (x,y) {            // 다른 방법 사용하자
        //     return x + y;
        // }

        // console.log(add(3,4,5,6));      // 에러가 발생하지 않아서 문제가 많다.

        
        // function add () {           
        //     return arguments[0] + arguments[1];
        // }
        // // 자바스크립트는 arguments랑 값을 모두 컬렉션이 받는다. 따라서, 입력값의 개수는 의미가 없다.
        // console.log(add(4,5));      

        // alert(a);           // 선언한 적이 있어서 undefined가 나오는 것이다.
        //                     // 내가 실행하여 사용하기 전에 코드가 stack에 저장된다.
        // var a= 1;

        // ------- 전역 객체 --------------
        // a = 1;              // var로 선언되지 않는데 1로 출력된다. 아직 stack에 쌓이지 않았다.
        //                     // 아무개에 저장이되는 것인데 아무개가 전역 객체(window)이며 전역 객체에 속성으로 들어간다.
        // alert(a);


        //------- 심볼의 의미 --------------
        // alert(a);           // Uncaught ReferenceError: a is not defined
        // a = 1;              // a라는 심볼이 아예 없다는 뜻이다.(undefined와 다른 의미이다.)

        //------- 전역 객체(기본적으로 window)의 의미 --------------          
        // a = 1;              // 아무개인 window가 전역객체라서 this와 같은 역할이다.
        // alert(window.a);    // 여기서 a가 window 그자체이고 window.a는 a와 같다. 그래서, window를 생략할 수 있다.


        //------- 전역 객체(기본적으로 window)의 범위? --------------       
        // 내가 정리 : 전역객체가 새로운 함수로 범위를 묶어버려도 전역객체의 범위를 없애진 않는다.
        // ** 최종 정리 : 다른 함수가 사용되어도 전역객체를 사용할 수 있다.
        // var f1 = function() {
        //     a = 1;
        //     console.log(window.a);
        // }

        // f1();

        // *** 이렇게 자바스크립트는 자유도가 높다.

        // -----------------------------
        // var f2 = function(){
        //     a=1;
        //     var a;
            
        //     console.log(window.a);      // 1이 출력된다. 공간이 다르게 선언된다.(전역 객체 vs 스택에 변수)
            
        // }
        
        // f2();

        // ------------------------------
        var f3 = function(){
            a=1;
            
            console.log(window.a);
            
            var a;                // 변수 선언이 밑에 있지만 코드를 저장하면서 먼저 stack에 쌓여 있어서 
        }                         // window.a는 다른 공간이다. 
        f3();



        // ------------------------------
        // var a1 = 1;
        
        
        
        
        
        
        // var a1 = 2;                 // 코드가 길어져도 아래에서 다시 재선언해도 에러가 안난다.(자바에서는 에러가 난다.)
        //                             // ES6에서는 이러한 문제점이 해결되었지만, TypeScript가 컴파일러 과정을 만들어줘서 에러나게 해준다.


        // alert(a1);


        // ----------- 중괄호가 사용하는 경우(지역화 X) ---------
        
        
        // {
        //     var a = 1;
        // }

        // alert(a);           // 지역 변수를 지정할 수 없다.
                            // 즉, 스크립트 파일을 100개로 만들어도 된다. 하나의 공간을 바라보기 때문이다.
                            // *** 따라서, 이러한 문제점을 해결하기 위해서 ES6가 만들어졌다.



        // ----------------- 지역화 O ----------------
        // 자바 스크립트에서는 지역화를 함수 내부에서만 가능
        // function f4() {
        //     var a = 1;
        // }
        // alert(a);


        // function f5() {
        //     a = 1;
        // }
        // alert(a);


        // ----------------- 함수 중복 선언 가능(JS 특징) ----------------
        // function f6() {
        //     a = 1;
        //     f2();
        //     function f7() {
        //         a = 2;
        //         f3();
        //         function f8() {
        //         a = 3;
        //         }
        //     }
        //     console.log(a);     // f1 함수 내부에서 출력.
        // }

        // --------- outer 변수 개념 ------------------
        function func1() {
            var b = 10;

            func2();

            console.log(b);     // f1 함수 내부에서 출력가능   // 20 출력
            
            function func2() {
                b = 20;
            }
            
        }

        function func1() {
            var b = 10;

            func2();

            console.log(b);     // 불가능   // 10이 출력
            
            var func2 = function func2() {
                var b = 20;
            }
            
        }

        // --------- outer 변수 적용 ------------------
        function func1() {
            var b = 10;

            var func2 = function func2() {
                b = 20;
            }

            func2();
            console.log(b);     // 가능
                                // outer 변수 : func1이 전체 범위라고 했을 때, func2에서 b가 var func2에 담겨져서 밖으로 나갈 수 있는데 이것을 outer 변수라고 부른다.
                                // 원래는 변수 범위가 끝나야 하는데 선언 안 한 b이기 때문에 밖의 var b도 있어서 그것을 덮어씌워주는 역할을 해준다.    
        }                       // 그래서 결과가 20이 나온다.

                                // **** 변수를 선언하지 않았으면(var), 남의 함수를 쓰는 것이다.
        function func1() {
            var b = 10;

            var func2 = function func2() {
                var b = 20;                      // 얘는 여기서 만들어지고 사라지므로 20이 사라진다.
            }

            func2();
            console.log(b);                     // 그래서 결과가 10이 나온다.
                               
            
        }


        var funca;
        function funa(){
            var a = 10;

            var funb = function(){
                a++;
            }
            f2();

            
            console.log(a);
        }

    </script>
</head>
<body>
    
</body>
</html>
```

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>

    <script>
    
    // var f3 = function(){
    //     a=1;

    //     console.log(a);          // 1이 출력(window가 아니라 var a로 인식한다.)

    //     console.log(window.a);   // undefined 출력(window로부터 값을 가져와야하는데 a를 var a로 인식해서 undefined)
        
    //     var a;                 // 변수 선언이 밑에 있지만 코드를 저장하면서 먼저 stack에 쌓여 있어서 a(여기선, a가 var a를 의미)와 window.a는 다른 공간에 있다.
    // };                         // window.a는 다른 공간이다. 
    // f3();


    // var func3;
    // function func1(){
    //     var a = 10;

    //     var func2 = function(){
    //         a++;
    //     };
    //     func2();

    //     console.log(a);     // 11이 출력
    // }


    // ** 추가 질문 : f1 함수가 변수에 의해서 참조되고 있어서 자원 반납을 하지 못 하는 상황이라고 말씀하셨는데 그 말은 곧 f1함수가 return을 하였음에도 스택 메모리에서 사라지지 않고 있는 상황이라고 이해를 해도 될까요?
    // ** 추가 정답 : f1 변수는 스택에 있고 그 변수가 클로저를 참조하고 있는 한 클로저가 사용하는 outer 변수들은 사라지지 못합니다.

    // ---------------- outer 변수의 메모리 누수 문제(함수의 return이 없어서) -------------
    var func6;

    function func4(){
        var a = 10;

        var func5 = function(){
            a++;
        };
        func5();                // func4가 메모리에서 사리지지 않는다. func6 때문에 사라지지 않는다.
                               
        func6 = func5;

        console.log(a);         // 11이 출력 
                                // 차이가 없어 보이지만, 전역이라서 변수가 사라지지 않아서 메모리 누수가 생겨서 stack에서 f1, f2가 사라지지 않는다.
    }

    func4();



    // 중간 코드가 길면.

                                 // *** 최종 정리 : 
    func4();                     // func4 재호출 시, func4는 여전히 구형으로 살아있고(살아 있는 이유 : 함수에 return이 없어서!!)
                                 // func5, func6는 신형으로 다시 만들어져서 살아 있다. 결국 메모리 누수!!


    // ---- ---- ---- ---- ---- ---- ---- ---- ----


    // ----- [Closure] --------- (함수가 선언할 때 환경이 구성되면서 closure와 결합되면서 다양한 결합 가능)

    // 여전히 outer 함수를 물고 있어서 closure라고 부른다. 
    // 안쪽에 있는 함수가 사라지기 전까지 생명선이 존재한다.

    // ----- [Closure]를 이해하는 과정 ---------
    var funcs = [];

    for(var i =0; i<3; i++){
        funcs[i] = function(){
            console.log(i);
        };
    }

    // funcs[0]();


    for(var i =0; i<3; i++){        // 아까 죽지 못한 변수가 살아남아서 대체 되었고
        funcs[i]();                 // 새로 대체되어서 1, 2, 3 출력!!
    }

    for(var a =0; a<3; a++){        // 앞에 있는 변수가 죽지 못하고 다르게 바뀐 배열 인덱스가 대체되어지지 않고 
                                    // 그대로 이전 함수의 마지막 값과 연결되어서 3,3,3 출력
        funcs[a]();
    }

    // 함수가 죽지 못해 살아 남는 과정
       


    </script>

</head>
<body>
    
</body>
</html>



<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>

    <script>
        // ------- 1. 객체를 삭제하는 방법
        // exam = null;

        // ------- 2. 객체 속성 제거하는 방법(JS의 모든 객체는 속성을 갖고 있고 삭제할 수 있다.)
        // delete exam.kor;
        // delete exam.kor;
        
        // ------- 3. JS 기본 객체 사용법
        // var ar = [];
        // ar.papa = function(){
        //     console.log(ar);
        // }
        // ar.papa();
    
        // ------- 4. JS 클래스의 Expand 기능 지원 X 
        // var name = new String("newlec");
        // name.kor = 20;
        // console.log(name.kor);     //에러가 발생한다.

        // 확장을 가능하게 할 것인지 말건지 할 수 있다.
        // 자바스크립트에서는 Wrapper 클래스가 기본형이라서, Primitive 클래스(자바스크립트에서는 Wrraper클래스가 Primitive 클래스이다.)는 Expand가 지원하지 않는다.



        // ------- 5-1. 객체 사용법(new의 의미)   
        // function Exam(){
        //     kor = 30;
        // }

        // var exam1 = Exam(); // 이것은 함수를 호출하기만 하는 것이고 return이 없어서 받을 수는 없다.
        
        // console.log(exam1);
        // console.log(exam1.kor);

        // ------- 5-2. 객체 사용법(new의 의미)   

        // function Exam(){
        //     kor = 30;
        // }

        // var exam1 = new Exam(); // new로 함수를 호출하는 것이 아니라 객체를 만들줘서 값을 참조해주면, 값을 출력할 수 있다?
        //                         // 앞에 new를 쓰면, 객체를 만드는게 이것을 함수가 먹어서 함수 내에서 사용할 수 있고 속성을 추가할 수 있다.(사용자가 임의로 바꿀수 있고 생성자를 의미한다.)
        //                         // 즉, 데이터 초기화하려고 대문자 로 사용한다.
        // console.log(exam1);
        // console.log(exam1.kor); 
        
        // ----------- 6. this의 의미 -------------
        // function Exam(){
        //     this.kor = 30;      // this라는 것은 자기가 사용할 수 있는 기본객체
        //     console.log(kor);   // 에러가 발생한다. why? 자바스크립트에서는 this를 이용해서 변수를 만들면 출력시에도 this를 써주어야 한다.
        // }
        // new Exam();             // 새로운 객체 생성!(자기만의 객체이며 this이용)

        // Exam();                 // 앞에 this가 생략 되어있다.
        //                         // 앞에 new를 하면, 자기만의 객체이고 new를 빼면, 전역객체이다.                     


        // ----- 7. 자바스크립도 자기만의 객체 생성 가능(this + new 이용) : 약갼의 객체지향스러운 모습이 있지만 은닉성을 보장 못한다. -------
        // function Exam(){
        //     this.kor = 30;
        //     this.eng = 20;
        //     this.math = 40;

        //     this.total = function(){
        //         return this.kor+this.eng+this.math; // this를 넣으면 값이 나온다. this를 빼면 에러 발생!!
        //     }
        // }

        // var exam = new Exam();                      // 자기만의 객체 이용가능.
        // console.log(exam.total());
         
        // 나중에 ES6에서 사용하지 않는 이유를 알기 위해서 이렇게 배운다
        // 나중에는 람다 함수 사용하지 말기, 익명 함수?



        // ----- 8. 객체 생성을 위한 new의 의미 -------
        function Exam(){
            this.kor = 30;
            this.eng = 20;
            this.math = 40;

            this.total = function(){
                return this.kor+this.eng+this.math; // this를 넣으면 값이 나온다. this를 빼면 에러 발생!!
                                                    // 하지만, 이렇게 쓴 코드도 에러가 있다! ES6와 차이가 있을 것이며 자바코드와도 차이가 있을 것이다.
            }
        }

        var exam = new Exam();              // 자기만의 객체 이용가능.
        console.log(exam.total());
 
        var exam1 = new Exam();             // new로 객체가 새로 만들어지기 때문에 또 새로 만들어진다.
        console.log(exam1.total()); 

</script>

</head>
<body>
    
</body>
</html>
```