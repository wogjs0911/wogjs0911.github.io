---
key: /2023/01/05/Error-Collect.html
title: ERROR - Error 모음
tags: java javascript spring springboot eclipse mysql oracleDB
---

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
# 3. MySQL 에러 

### 1) 테이블 조회도 안되고 테이블이나 뷰가 삭제도 안됨

- Error Code: 1046. No database selected Select the default DB to be used by double-clicking its name in the SCHEMAS list in the sidebar.

	- DB 연결 후, select로 table 조회하는데 나온 에러이다. 어떤 DB를 쓸건지 지정해주어야함. 아니면 'use DB명'으로 어떤 데이터 테이블을 사용하겠다 설정해준 후 사용할 수 있다.

```	

use newlecture;


DROP VIEW noticeview;


create view NoticeView
as
select n.*, m.name memberName from notice n
join member m on n.memberId = m.id;


SELECT * FROM newlecture.noticeview;

```




