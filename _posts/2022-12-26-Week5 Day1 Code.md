---
key: /2022/12/26/Week5-Day1-Code.html
title: TIL-5주차 코드 - Day1
tags: java web servlet 
---

# 1. Servlet 이용

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
 
 


 
 