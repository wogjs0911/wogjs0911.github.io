---
key: /2023/01/05/Error-Collect.html
title: Error - Error 모음
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

	- 절대 경로는 root에서 시작하는 디렉토리이며 `/game/image/nana.png` 이런 식으로 사용한다.


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

<br>

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
