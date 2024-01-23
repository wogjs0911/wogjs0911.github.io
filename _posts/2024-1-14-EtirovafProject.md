---
key: /2024/01/14/Project-Etirovaf.html
title: Project - Etirovaf
tags: docker docker-compose Vite React JPA queryDSL
--- 

# 1. Infra

### 1) 3Tier-Docker-Compose 사용기 

- etirovaf의 초기 개발 환경 구조는 `Docker` 환경에서 `React(+ Vite)` + `SpringBoot` + `MySQL(MariaDB)`으로 `3tier-docker-compose` 개발 환경을 구성했다. 

<br>
- 초기 프로젝트 설정에서 SpringBoot 프로젝트를 jar 파일로 만들기 위해 빌드를 하면 다음과 같은 에러가 발생한다.
	- `DataSourceBeanCreationException`을 뱉는데 test에서 connection을 제대로 맺지 못하고 뱉는 에러이다. 즉, `SpringBoot Server`보다 먼저 `MySQL server`가 container로 올라가 있어야 했다. 하지만, 초기 프로젝트 설정에서는 아직 올라가있지 않기 떄문에 BUILD FAILED dependencies는 제대로 받아 왔기 때문에 해당 에러는 무시하면 된다.

<br>
- 최종 정리** : 초기 프로젝트 디렉토리 구조 설계 후 `docker compose up --build` 명령어를 통해 도커 컨테이너를 빌드하면 database 디렉토리에 .sql 파일이 없기 때문에 생성하는 동안 도커 컨테이너가 실행하는 동안 여러 번의 restart 과정을 겪게된다. 
	- 그 후에 database와 서버가 정상적으로 실행되므로 docker-compose 개발 환경에서 초기 프로젝트 빌드 후 실행 시, 에러가 나더라도 무시하면 된다.

---

<br><br>

#### a. docker-compose 설정 코드 

- docker-compose.yml

```yml
version: '3.8'

services:
  database:
    image: mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ~~
      MYSQL_DATABASE: ~~
      TZ: Asia/Seoul
    ports:
      - '3306:3306'
    volumes:
      - ./database/data:/var/lib/mysql
      - ./database/conf.d:/etc/mysql/conf.d
      - ./database/db/initdb.d:/docker-entrypoint-initdb.d
    networks:
      - etirovaf-network
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    environment:
      SPRING_DATASOURCE_URL: ~~
      SPRING_DATASOURCE_USERNAME: ~~
      SPRING_DATASOURCE_PASSWORD: ~~
      TZ: Asia/Seoul
    ports:
      - '8080:8080'
    depends_on:
      - database
    networks:
      - etirovaf-network
  frontend:
    build:
      context: ./front
      dockerfile: Dockerfile
    restart: always
    ports:
      - '3000:3000'
    volumes:
      - ./front/src:/app/src:ro
    depends_on:
      - backend
    networks:
      - etirovaf-network

networks:
  etirovaf-network:
    driver: bridge
```

---

<br>

- backend/DockerFile

```Dockerfile
FROM amazoncorretto:17
ARG JAR_PATH=./build/libs
COPY ${JAR_PATH}/*.jar .
ENTRYPOINT ["java","-jar","backend-0.0.1-SNAPSHOT.jar"]
```

---

<br>

- front/DockerFile

```Dockerfile
FROM node
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
ENTRYPOINT ["npm", "run", "dev"] 
```

---

<br><br>


### 2) 컨테이너 내부에서 사용할 계정의 권한 정의하는 방법

- [Docker volume permission 문제 해결 과정 : 참고](https://sweethoneybee.tistory.com/28) 

<br>
- 도커 관리용으로 새로운 유저를 생성하고 docker 그룹에 넣어주고 VOLUME으로 지정되는 디렉토리를 내가 원하는 user가 owner가 되도록 직접 미리 mkdir 해서 디렉토리의 쓰기 권한도 해결!
	- 하나의 커널로 관리되기에 UID로 매핑이 되는 것! 여기서, username은 편의상 사용하는 것이다.
	- 그래서 [여기서](https://github.com/jinho-yoo-jack/wanted-preonboarding-challenge-backend-16/issues/1) docker-compose.yml에서 권한을 이런식으로 사용했다. 도커에서는 하나의 커널로 관리되기 때문이다.

<br>	
- 중요한 점이 username은 여기서 쓰이지 않고 uid가 쓰인다는 것이다. 도커 컨테이너를 서버에서 실행시킬 때, 여전히 하나의 커널만이 존재한다. 도커 컨테이너를 실행하고 있는 서버 내의 전체 uid, gid를 하나의 커널이 관리하고 있다는 것을 의미한다. 그러다보니 컨테이너들 내에서 같은 uid를 가진 다른 user를 가질 수 없다.

<br>	
- 일반적인 리눅스 내의 username(group name도 마찬가지)은 커널의 한 부분이 아니라 외부 툴에 의해서 관리되고 있기 때문이다(/etc/passwd, LDAP, Kerberos 등등). 그래서, 다른 컨테이너 내에서 같은 username을 가질 수는 있어도 같은 uid/gid에 대해서 다른 권한을 가질 수는 없다.

---

<br><br>


# 2. Frontend

### 1) Vite + React + Docker 사용기(+ 에러 해결)

#### a. 에러 해결 과정 : 

- docker 개발 환경에서 vite react 프로젝트를 build하여 사용하는 방법은 기존의 webpack을 이용한 react 디렉토리 구조(CRA)를 이용할 것 같았는데 에러가 발생하여 vite용 react 디렉토리 구조로 변경해줘야 도커 환경에서 사용할 수 있다.

<br>

#### b. 디렉토리 구조 설정 : 

- webpack 구조 :
	- public 디렉토리에 index.html과 같은 정적 파일이 포함된다.
	- src 디렉토리에 index.js가 포함된다.
	
<br>
- vite 구조 : 
	- root 디렉토리에 index.html가 포함된다.
	- index.js는 없어도 된다.

<br>
- vite.config.js

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true,
    },
    host: true, // Here
    strictPort: true,
    port: 3000
  }
})
```

<br>
- 참고 : [docker + vite app 연결하는 과정 : 참고 사이트1](https://stackoverflow.com/questions/71357957/unable-to-map-docker-port-from-vite-app-to-local)


---

<br><br>

# 3. Backend


### 1) JPA : Error creating bean with name 'entityManagerFactory' defined in class path resource 에러


- 에러 로그 : `Error creating bean with name 'entityManagerFactory' defined in class path resource [org/springframework/boot/autoconfigure/orm/jpa/HibernateJpaConfiguration.class]: Unable to create requested service [org.hibernate.engine.jdbc.env.spi.JdbcEnvironment] due to: Unable to determine Dialect without JDBC metadata (please set 'jakarta.persistence.jdbc.url' for common cases or 'hibernate.dialect' when a custom Dialect implementation must be provided)`


<br>
- 일반적인 해결 방법 : [일반적인 경우의 해결 방법](https://stackoverflow.com/questions/56968183/error-creating-bean-with-name-entitymanagerfactory-defined-in-class-path-resou)
	- import 패키지 문제(jdk 17이라서 jakarta로 변경할 것!)

<br>
- 내가 했던 해결 방법 : 나의 경우는 좀 특별했는데 `build.gradle`에 다음 의존성을 추가해주었다.
	- `java_gradle`(`build.gradle`) : `implementation group: 'org.javassist', name: 'javassist', version: '3.15.0-GA'`
	- `kotlin_gradle`(`build.gradle.kts`) : `implementation("org.javassist:javassist:3.15.0-GA")`
	- [의존성 추가로 인한 해결 방법](https://sean-lets-go.tistory.com/18)

---

<br><br>


### 2) docker-compose에서 SpringBoot 프로젝트 자동 build 설정

#### a. 자동 build 설정을 프로젝트에 적용한 이유 : 

- Docker 개발 환경에서 React 프로젝트가 자동 빌드되도록 하는 과정은 compose 설정에서 바인드 마운트만 추가해주면 간단히 되었지만, SpringBoot 프로젝트의 서버 소스코드를 저장 후 바로 반영이 안되고 다시 컨테이너를 빌드 후 실행을 시키는 과정이 번거로워서 도커 개발환경에서 자동 build를 하려고 했다.


---

<br>

#### b. 동작 과정

- 빌드가 끝나면 .restart 파일 내용이 현재 시간으로 수정됩니다. 그럼 devtools 에서 .restart 파일 변경됨을 감지하고 재시작합니다.

<br>		
- 코드 변경 감지되면 build가 되고, build가 끝나면 buildAndReload 테스크가 실행되어 .restart 파일 수정하고, devtools에서 .restart 파일 수정됨을 감지하여 서버 재시작해주는 방식
	
<br>	
- `getDeps` 태스크는 도커 빌드할 때, 모든 종속성을 다운로드받아서 reload를 더 빠르게 해준다.

---


<br>
#### c. 설정 코드

- entrypoint.sh : 
	- 빌드가 끝나면 .restart 파일 내용이 현재 시간으로 수정되고 devtools에서 .restart 파일 변경됨을 감지하고 재시작을한다.

```sh
#!/bin/bash

start_server() {
  (sleep 30; ./gradlew buildAndReload --continuous -PskipDownload=true -x Test) &
  ./gradlew bootRun -PskipDownload=true
}

start_server
```

<br>
- build.gradle : 
	- 코드 변경 감지되면 build가 되고, build가 끝나면 buildAndReload 테스크가 실행되어 .restart 파일 수정하고, devtools에서 .restart 파일 수정됨을 감지하여 서버 재시작해주는 방식
	- getDeps 태스크는 도커 빌드할 때, 모든 종속성을 다운로드받아서 reload를 더 빠르게 해준다.

```gradle
// 다음 내용 추가
task getDeps(type: Copy) {
	duplicatesStrategy = DuplicatesStrategy.EXCLUDE
	from configurations.compileClasspath into "libs/"
	from configurations.runtimeClasspath into "libs/"
}

task buildAndReload {
	dependsOn build
	mustRunAfter build    // buildAndReload must run after the source files are built into class files using build task
	doLast {
		new File(".", ".restart").text = "${System.currentTimeMillis()}" // update trigger file in root folder for hot reload
	}
}
```

<br>
- Dockerfile : 

```Dockerfile
FROM gradle:6.9-jdk17

WORKDIR /usr/src/spring
COPY . /usr/src/spring
VOLUME /tmp

RUN chmod +x entrypoint.sh && gradle updateLib

EXPOSE 8080

CMD [ "sh" , "entrypoint.sh" ]
```

<br><br>

- 참고 URL : 

- [docker-compose에서 SpringBoot 프로젝트 자동 build 설정 : 참고 사이트1](https://velog.io/@youngjun0627/spring-boot-%EB%8F%84%EC%BB%A4%ED%99%98%EA%B2%BD-auto-reload-%EC%84%B8%ED%8C%85)

- [docker-compose에서 SpringBoot 프로젝트 자동 build 설정 : 참고 사이트2](https://velog.io/@jjh930301/docker-spring-%EA%B0%9C%EB%B0%9C-%ED%99%98%EA%B2%BD-%EA%B5%AC%EC%84%B1vs-code)


- [docker-compose에서 SpringBoot 프로젝트 자동 build 설정 : 참고 사이트3](https://stackoverflow.com/questions/59999424/spring-boot-gradle-project-in-docker-with-continuous-build)




---

<br><br>

### 3) JPA : org.hibernate.PersistentObjectException: detached entity passed to persist 에러

- 에러 과정 : 구글링 결과는 연관관계에서 CascadeType.ALL 옵션과 관련된 문제로 해결하려고 했는데 해당 프로젝트에서는 관련 옵션이 존재하지 않아서 다른 방법을 찾아야 했다.

<br>
- 해결 방법 : 엔티티 클래스에 @Id를 부여한 필드에 @GeneratedValue를 작성하여 AUTO, SEQUENCE, IDENTITY 전략 등 데이터베이스에게 key 값을 자동 생성하도록 하는 전략을 선택하였으면서 엔티티 객체 생성 시, Id에 해당하는 필드에 직접 값을 입력하지 않았는지 확인!

<br><br>
- 참고 URL : 

- [참고 사이트1](https://velog.io/@dev-kmson/org.hibernate.PersistentObjectException-detached-entity-passed-to-persist-%EC%97%90%EB%9F%AC)

- [참고 사이트2](https://velog.io/@wnguswn7/Java-JPA-Detached-Entity-passed-to-persist-%EC%97%90%EB%9F%AC)






