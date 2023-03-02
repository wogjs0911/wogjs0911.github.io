---
key: /2023/01/05/Error-Collect.html
title: Error - Error 모음
tags: java javascript spring springboot eclipse mysql oracledb servlet jsp mariaDB
---

# 0. Project 주의 :

### 1) 프로젝트 진행 시 유의 사항 :

- vscode던 이클립스던 프로젝트 진행 시, 폴더 열기는 항상 root 경로가 주된 프로젝트 1개만 있어야 한다. 

- 프로젝트 설계시, 물리적인 구조인 디렉토리 구조를 잘 잡고 가야 한다.(html이나 jsp 파일은 우리가 문장으로 썼을 때, 명사 위주로 설계한다. ) 



---

<br><br>

# 1. Javascript 에러 

<br>
### 1) Canvas JS 

- 새로운 페이지 등록 시, main.html 파일에서는 url 연결 시켜주기! 
  `<script src="./item/background.js"></script>`


<br>
### 2) JS에서 전역 변수, 전역 객체를 사용하는 방법

<br>

```javascript

// 1. 전역 변수를 사용하는 방법
skiobj.point;		

// 2. 전역 객체를 사용하는 방법
skiobj.objs = this.objs		// 전역 객체 선언!!

for(let obj of this.objs)
	obj.draw(this.ctx);	

```
  


<br>
### 3) Canvas JS에서 캔버스 전환하기(2가지 방식)

- app.js에서 콜백함수로 제어하기

- pause라는 인스턴스 변수와 상태 변수를 통해 캔버스를 전환할 수 있다.


<br>
### 4) 상대 경로  vs 절대 경로의 의미

- 상대 경로 : 

	- 상대 경로는 `./image/nana.png`와 `../image/nana.png`처럼 사용한다.
	
	- `./image/nana.png`의 경우에는 현재 디렉토리라서 `image/nana.png`와 같이 생략이 가능하다. 

	- `../image/nana.png`는 현 위치에서 한 단계 위인 상위 폴더를 의미한다. 2단계 위 디렉토리를 의미하려면, `../../image/nana.png`이다.

<br>
- 절대 경로 : 

	- 절대 경로는 root에서 시작하는 디렉토리이며 `/game/image/nana.png` 이런 식으로 사용한다


--- 


  
  
<br><br>
# 2. Spring-Boot 에러 


### 1) 서버 타임존 설정을 명시화시키기(mysql과 연결)

- application.properties 수정하기

- [참고 문헌](https://www.lesstif.com/dbms/mysql-jdbc-the-server-time-zone-value-kst-is-unrecognized-or-represents-more-than-one-time-zone-100204548.html)


<br>
- 기존 코드 : application.properties

```
spring.mvc.view.prefix=/WEB-INF/view/
spring.mvc.view.suffix=.jsp

# mysql settings
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url=jdbc:mysql://localhost:3306/newlecture?serverTimeZone=Asia/Seoul
spring.datasource.username=newlecture
spring.datasource.password=3144
```


<br>
- 수정된 코드 : application.properties

```
spring.mvc.view.prefix=/WEB-INF/view/
spring.mvc.view.suffix=.jsp

# mysql settings
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url=jdbc:mysql://localhost:3306/newlecture?useUnicode=true&serverTimezone=Asia/Seoul
spring.datasource.username=newlecture
spring.datasource.password=3144

```

<br><br>
### 2) JUnit Test case 에러 발생 : 아직 해결 못 함.

- `@AutoConfigureTestDatabase(replace=Replace.NONE)`, `@MybatisTest`는 필수적으로 필요하다!

- 각각은 datasource 정보 가져오거나 Unit Test를 위해 사용된다.

<br>

```java
package com.newlecture.web.dao;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.AutoConfigurationPackage;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;

import com.newlecture.web.entity.NoticeView;

@AutoConfigureTestDatabase(replace=Replace.NONE)
@MybatisTest
class NoticeDaoTest {

	@Autowired
	private NoticeDao noticeDao;
	
	@Test
	void test() {
		List<NoticeView> list = noticeDao.getViewList(0, 1, null, null, false);
		
		System.out.println(list.get(0));
	}

}

```

- `List<NoticeView> list = noticeDao.getViewList(0, 1, null, null, false);` 에서 list.get(0)의 정보를 주소 정보만 가져오는 이유는? 

- 나는 해당 list의 데이터 정보가 필요하다.


<br><br>
### 3) Context Path 에러

- Context Path가 root 말고도 설정되어 있다면 uri를 url과 비교할 때, Context Path도 설정해주자! 

- 주의할 코드 부분 :

```java

@Override
	protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		PrintWriter out = response.getWriter();
		
		String uri = request.getRequestURI();
		String url = request.getRequestURL().toString();
		
		String viewSrc = "/WEB-INF/view/notfound.jsp";
		
		out.printf("uri:%s\n", uri);
		out.printf("url:%s\n", url);
		
		if(uri.equals("/webprj2/menu/list"))
			viewSrc = new ListPOJOController5().requestHandler();
	}
```

<br>
- 전체 코드 : 

```java
package com.newlecture.web.controller;

import java.io.IOException;
import java.io.PrintWriter;

import com.newlecture.web.controller.menu.DetailPOJOController;
import com.newlecture.web.controller.menu.ListPOJOController5;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

// 바꿔주기
@WebServlet("/")
public class JSPDispatcherServlet extends HttpServlet{
	
	// 반복하기위해서 배열에 넣어준다.
	String[] urls = {"/webprj2/menu/list", "/webprj2/menu/detail"};
	
	String[] controllers = {
			"com.newlecture.web.controller.menu.ListPOJOController5",
			"com.newlecture.web.controller.menu.DetailPOJOController"
			};
			
			
	@Override
	protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		PrintWriter out = response.getWriter();
		
		String uri = request.getRequestURI();
		String url = request.getRequestURL().toString();
		
		String viewSrc = "/WEB-INF/view/notfound.jsp";
		
		out.printf("uri:%s\n", uri);
		out.printf("url:%s\n", url);
		
		
		// 방법 2: 컴퓨터가 반복하는 코드
		while(uri.equals("/webprj2/menu/list"))
			viewSrc = new ListPOJOController5().requestHandler();
	
		for(int i=0; i<urls.length; i++) {
			
			?? controller = null;
			
			if(uri.equals(urls[i])) {
				controller = (??) Class.forName(controllers[i]).newInstance();
				
				controller.requestHandler();	//  우리는 controller를 포함하는 가시 형식 필요하는 공통 형식이 필요하다!
				
				// 개체 정보를 다 찾아서 함수 호출을 찾아서 다 꺼내서 사용할 수 있다. 
				// 자바 '리플렉션'이라는 개념이 필요하다!
			}
		}
		
		
		// 방법 1: 
		// 디스패처가 해당 url과 일치하면, 해당 POJO 컨트롤러를 가져온다.
		// 컨텍스트 path가 있는 경우, 위에서 출력된 uri 경로를 여기에 그대로 넣어줘서 비교한다!!** 
		// uri는 url에서 localhost를 뺀 나머지의 경로이다. 
		if(uri.equals("/webprj2/menu/list"))
			viewSrc = new ListPOJOController5().requestHandler();
		
		if(uri.equals("/webprj2/menu/detail"))
			viewSrc = new DetailPOJOController().requestHandler();
		
		out.write("Hello Front");
		
		request.getRequestDispatcher(viewSrc)
		.forward(request, response);
		
	// 앞으로 할 것!
	// /menu/list 요청이 오면 Listcontroller의 requestHandler()를 호출하고 
	// /menu/detail 요청이 오면 DetailController의 requestHandle()를 호출한다.
	
	} 
}


``` 

<br><br>
### 4) 쿠키 에러 

- 쿠키를 받기 위해서 쿠키를 먼저 심는 url로 이동해서 쿠키를 심고 나중에 쿠키를 받았는지 다른 페이지에서도 확인할 수 있다. 

- index 페이지에서 쿠키를 심었으면, reg 페이지에서 쿠키를 확인할 수 있다.

- 해결 방법 : 하지만, 원래 쿠키는 모든페이지에서 심게 해야하므로 cookie.setPath("/") 설정을 해주면 이러한 고민이 사라진다.**

---

<br><br>
# 3. MySQL 에러 

### 1) 테이블 조회도 안되고 테이블이나 뷰가 삭제도 안됨

- Error Code: 1046. No database selected Select the default DB to be used by double-clicking its name in the SCHEMAS list in the sidebar.

	- 해결 방법 : DB 연결 후, select로 table 조회하는데 나온 에러이다. 어떤 DB를 쓸건지 지정해주어야함. 아니면 'use DB명'으로 어떤 데이터 테이블을 사용하겠다 설정해준 후 사용할 수 있다.

```	

use newlecture;


DROP VIEW noticeview;


create view NoticeView
as
select n.*, m.name memberName from notice n
join member m on n.memberId = m.id;


SELECT * FROM newlecture.noticeview;

```

<br>
### 2) 테이블에 데이터가 추가되지 않는 경우

- Error Code:  Error 1064, you have an error in your SQL Syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near '' at Line 4
	
	- SQL 문법에러이며, 이 에러는 대부분 값들의 Line 4 부분에 작은 따옴표('') 를 닫지 않아서 거나 짝수가 아니어서 나는 에러일 경우가 많다.

	- 해결 방법 : 테이블에 데이터를 추가 후 MySQL에서는 Apply 버튼을 눌러 업데이트를 시키는데 SQL script에서 직접 변경해주자!
	
```
// 수정 전

INSERT INTO `newlecture`.`notice` (`id`, `title`, `content`, `hit`, `pub`, `memberId`) VALUES ('16', '이거 직접 바꿔야한다..', '정말 귀찬ㅇㅎ은 일이다..', '8', b'0', b'2');

// 수정 후(데이터 타입이 안 맞아서 에러가 발생했다. memberId 타입이 bit 형에서 int 형으로 데이터를 넣어주자!)
INSERT INTO `newlecture`.`notice` (`id`, `title`, `content`, `hit`, `pub`, `memberId`) VALUES ('16', '이거 직접 바꿔야한다..', '정말 귀찬ㅇㅎ은 일이다..', '8', b'0', '2');

```

<br><br>
# 4. Servlet 에러 

### 1) web project 초기 설정

- 무조건, web과 관련된 모든 파일은 src에서 만들어져야하며, context root가 중요하다.


<br>

### 2) context root가 중요한 이유

- 추후에 다른 팀원들과 팀프로젝트를 위해 코드를 합쳐야 하므로 context root의 설정이 매우 중요하다.

- 프로젝트마다 context root에 프로젝트명을 붙여 context root를 달리해줘 한다.

```java
// context root

/webprj2 
```



- 이렇게 설정하지 않으면 다른 프로젝트와 충돌이 나기 때문에 설정해줘야 한다.

```
// 실제 동작하는 url
http://localhost/webprj2/

http://localhost/webprj2/hello?c=10
```



---

<br><br>
# 5. JSP 에러

<br>
### 1) EL 태그 못 읽는 에러

<br>
- EL 태그를 사용하기 위해서는 JSTL의 taglib 지시자 블럭이 필요하다. 주의하기!
	- 필요한 것 : `<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>`

<br>
- list.jsp

```java

<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Insert title here</title>
</head>
<body>
	<h1>admin 메뉴 목록 페이지</h1>

	<nav>
		<hl>페이저</h1>  
		<form>
			<label>size: </label>
			<!-- <input name="s" value="10"> -->
			<select>
				<option value="10">10</option>
				<option value="20">20</option>
				<option value="30">30</option>	
			</select>
			<input type="submit" value="변경">
		</form>
		
		<ul>
		<c:forEach var="n" begin="1" end="5">
			<li><a href="list?p=${n}&q=${m}">${n}</a></li>
		</c:forEach>
	
		</ul>
	</nav>
</body>
</html>
```



